---
source_url: https://mp.weixin.qq.com/s/tV3qk9lN4u8E4re_lRhM6Q
ingested: 2026-07-28
sha256: 2599bbfc3baa4fdc9a41abf3a7aacc05ab39c73e262d7e9bde54e6021d5d4345
source_published: 2026-07-28
title: "Codez《Claude Graph Engineering》精读：用 14 步重构线性 Agent"
author: AF智域心识
feed_name: AF智域心识
---

# Codez《Claude Graph Engineering》精读：用 14 步重构线性 Agent

Codez (@0xCodez) 的 14 步路线图，从线性 Agent 脚本走向 Graph 工程。全文基于 Codez 的 X Article《Graph Engineering with Claude》及 Claude Code Dynamic Workflows 文档。

## 核心 Insight

- **Edge 表示执行依赖，不表示文字顺序**。只有当下一步需要读取上一步结果时，才需要按顺序运行
- **Node 接口要清楚**：输入来源、输出格式、工作范围都要提前说明
- **并行与等待应由任务依赖决定**：彼此独立的任务用 fan-out 同时启动；只有必须看到全部结果时才设置 barrier
- **可靠性要写进执行结构**：关键结果经过 Verifier；并行写用 worktree 隔离；循环要设收敛条件和预算上限

## 14 步路线图

### 1-2. Node & Edge
Node 是边界清楚的工作单元：一个 Agent、明确输入和输出。Edge 是执行依赖。对每个"然后"都问：下一步会读取上一步的输出吗？删掉仅有叙述顺序的依赖。

### 3. 为 Node 明确接口
输入要显式传入，输出经 schema 校验。JSON schema 让下游直接使用结构化结果：

```javascript
const result = await agent(source.prompt, {
  label: `research:${source.key}`,
  schema: ITEM_SCHEMA
})
```

### 4. Edge 说明下游在等什么
Edge 要说明上下游产什么、等什么。确定性变换（展开、去重、过滤）留给 JavaScript，不启动 Agent。

### 5-6. Fan-out & Fan-in
**Fan-out**: `parallel()` 并发执行独立任务，隔离上下文。
**Fan-in**: 只在需要完整结果时设 barrier（去重、排序、综合）。逐项处理用 pipeline() 避免不必要的等待。

### 7. Diamond 模式
拆分 → 并行 → 归并。标准写法：fan out → reduce → synthesize。

### 8. Router
运行时选择下一条 Edge。模型负责语义判断（分类/风险等级），代码负责稳定执行对应路径。

### 9. Verifier
关键结果增加质量门：Adversarial verify（怀疑者证伪）、Perspective-diverse（多视角检查）、Judge panel（多候选评分）。多个同模型/同 prompt 的 Verifier 共享同一盲点。

### 10. Worktree 隔离
并行写文件用 git worktree 隔离。只限于确实需要并行写入的场景；纯读取 Node 不需要。

### 11. Cycle（受控循环）
Loop-until-dry：连续 K 轮无新发现时停止。必须统一去重范围（包含被 Verifier 否决的结果），并设最大轮数/时间/预算上限。

### 12. 模型分层
有界重复的工作用便宜模型，综合/裁决用强模型。

### 13. Topology 与延迟
`parallel()` barrier 等待最慢 Node；`pipeline()` 逐项流式通过多个阶段。

### 14. 自路由（Dynamic Workflow）
Claude 编写 JavaScript 编排脚本，runtime 后台执行。可保存重跑。

## 六种可直接尝试的 Graph
1. 全量 route 安全扫描
2. /deep-research 带引用报告
3. 按文件移植模块
4. 对抗性 diff review
5. 定期生态扫描
6. 未知规模发现任务（Cycle）
