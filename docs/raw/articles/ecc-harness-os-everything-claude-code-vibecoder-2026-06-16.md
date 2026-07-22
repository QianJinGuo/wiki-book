---
title: "ECC：一套给 AI Coding Agent 用的 Harness 操作系统"
source: wechat
source_url: https://mp.weixin.qq.com/s/cjLxKLOBx8vUotAC0oeeZQ
author: VibeCoder
account: Vibe编码
account_description: "Vibe Coding 小集合"
published: 2026-06-16T22:30:00+08:00
ingested: 2026-06-16
sha256: e7bb44eea81fa098053a4769f56e18fdb9fd025ff910468155fd2a2d1f6686a8
tags: [ecc, everything-claude-code, affaan-m, harness-os, harness-engineering, claude-code, agent-os, profiles, modules, components, token-optimization, memory-boundary, continuous-learning, instinct-scope, eval-harness, pass-at-k, iterative-retrieval, subagent-context]
content_type: tool-source-analysis
language: zh-CN
---

# ECC：一套给 AI Coding Agent 用的 Harness 操作系统

> 原创 / VibeCoder / Vibe编码 / 2026-06-16 22:30 / 美国

## 核心命题

> **AI 编程工具正在从单次问答，往一整套工程工作流迁移。**

affaan-m/ECC（原来的 everything-claude-code）这个仓库挺典型，它把 agent 在真实开发里需要的配置、hook、技能、记忆、验证和并行执行全部组织起来。

> **我看完源码后，感觉它更像一套 harness 操作系统。**

它关心的是 agent 怎么进入项目、怎么加载上下文、怎么少浪费 token、怎么验证、怎么把重复经验沉淀下来。

## 它到底是什么

### 三层安装结构

**ECC 的安装面很清楚**：

1. **profiles** 决定你默认要装多大一套东西：
   - `minimal` / `core` / `developer` / `security` / `research` / `full`
2. **modules** 负责把 rules、agents、commands、hooks、platform configs、workflow skills 这些资产分组
3. **components** 是面向用户的选择项，方便你按能力安装

### 每个 Skill 独立 Component

> **关键工程细节**：`scripts/lib/install-manifests.js` 会给每一个 skill 生成独立 component。

也就是说，你可以只装 `strategic-compact`、`verification-loop`、`iterative-retrieval` 这几个高价值技能，**不用把整个大包塞进 prompt**。

> **这对日常开发非常重要**。Agent 的上下文有硬上限，装得越满，越容易让模型带着一堆无关指令工作。

## Token 优化靠选择

### 按任务路由模型

ECC 的 token 优化思路比较工程化——**按任务路由模型**：

- **机械扫描、分类、后台提取** → 便宜模型
- **默认实现和 review** → 主力模型
- **架构判断、复杂设计、高风险决策** → 更强模型

### 安装面控制 > Prompt 压缩

> **更关键的是安装面控制**。少装不需要的 rules、agents、skills 和 MCP，比后面再努力压缩 prompt 更有效。

### 后台处理减少主线程干扰

ECC 还有一些后台处理来减少主线程干扰：
- **edit 后只记录改动文件**
- **真正的格式化和 typecheck 放到 Stop 阶段批量跑**

这样不会每改一个文件就触发一轮重检查，反馈也不会完全丢。

> **这类设计很接近真实工程里的节奏：快速编辑时保持轻，收尾时再做严一点的检查。**

## 记忆要有边界

> **很多 agent 记忆方案最大的问题，是把旧总结直接当成新指令塞回来。**

ECC 在这点上做得比较谨慎。`session-start.js` 会加载历史上下文，但它**有上限**，并且**优先按 worktree 匹配**。历史摘要会被明确标成历史参考，**不会伪装成当前任务命令**。

> **这件事看着细，其实很关键**。Agent 如果把上周的临时判断当成今天的系统规则，后面很容易跑偏。

### 记忆三分法

ECC 把记忆拆成了几类：

| 类型 | 进入方式 | 风险 |
|------|---------|------|
| **项目事实** | 项目级固定 | 低 |
| **历史会话** | 上下文加载 | 中 |
| **可复用 instinct** | 后台 promote | 高（必须谨慎） |

不同类型进入上下文的方式不同，风险也不同。

## 进化能力怎么做

连续学习主要在 `skills/continuous-learning-v2` 里。

> **它没有让模型凭感觉写一堆"经验总结"。**

**真实工具行为记录**：
- `PreToolUse` 和 `PostToolUse` hook 会记录真实工具行为
- **observer 在后台读取最近观察**
- 只有**重复出现的模式**才会被提成 instinct

### Instinct 的 Scope 和 Confidence

> **这些 instinct 还有 scope 和 confidence**：

- **项目内反复出现** → 先留在项目
- **多个项目都出现、置信度够高** → 考虑 promote 成全局经验

再往后，`evolve` 会把稳定的 instincts 聚类，生成候选 skill、command 或 agent。

### 实用建议

> **我不建议一开始就把自动观察全开**。

更稳的方式是**先手动跑一段时间，确认团队工作流稳定，再打开 continuous-learning-v2**。否则它学到的可能是早期混乱习惯。

## 验证和并行

### 验证三层

ECC 把验证分成几种层次：

| 层次 | 用途 | 触发时机 |
|------|------|---------|
| **checkpoint** | 阶段标记，比较这一步是不是比上一版更好 | 阶段间 |
| **quality gate** | 日常 hook，改完文件后跑轻量检查 | 改完即触发 |
| **eval harness** | 评估 agentic workflow 能不能稳定完成任务 | 周期回归 |

### Eval 关键区分

ECC 对 eval 的区分也有用：

| 指标 | 适用场景 | 含义 |
|------|---------|------|
| **pass@k** | 探索 | k 次里有一次成功就算有生成价值 |
| **pass^k** | 回归 | 连续 k 次都得过才说明行为稳 |

> **pass@k 适合探索**（看模型能不能做出来）；**pass^k 适合回归**（看模型稳定性能不能复现）。

### 并行执行原则

ECC 没有鼓励盲目多开 agent。**它更强调任务边界、写入面和验证门**：

**能并行的**：
- 读代码、审查、测试
- 互不重叠的小功能

**应该 worktree 隔离甚至别并行的**：
- 会互相踩文件
- 改 schema
- 动部署环境

## Subagent 的上下文问题

> **Subagent 最难处理的是上下文**。

- 给太多，它贵，而且容易分心
- 给太少，它只能猜

ECC 的 `iterative-retrieval` 走的是**检索循环**：

1. 先派一个宽查询
2. 评估材料够不够
3. 再补检索
4. 最多循环几轮
5. **收口时只把相关上下文交给执行 agent**

> **这个模式比"让 subagent 自己读完整仓库"靠谱很多**。它把任务拆成找材料和做判断，减少了盲派任务的成本。

## 安装建议

### 起步小安装面

> **如果只是日常写代码，我会从很小的一组开始**：

```
minimal profile + strategic-compact + context-budget +
verification-loop + eval-harness + ai-regression-testing +
iterative-retrieval
```

### Hook 温和起步

先开温和的一组：
- session start
- pre compact
- session end
- post edit accumulator
- stop format typecheck
- quality gate
- context monitor
- config protection

### 渐进升级

- **大项目** → 加 dmux/worktree orchestration
- **团队稳定后** → 打开 continuous-learning-v2

## 总结

> **ECC 最值得看的地方，是它把 agent 工作流当成工程系统来设计**。

它默认模型需要：
- **边界**（安装面 + 记忆 scope）
- **记忆**（项目事实 / 历史会话 / instinct 三类分离）
- **检查点**（checkpoint / quality gate / eval harness）
- **评测**（pass@k 探索 vs pass^k 回归）
- **后台学习**（observer → instinct → skill 渐进）
- **并行隔离**（worktree + 写入面控制）

才能在真实工程里稳定工作。

> **真正落地时，我会很克制地装**。先用小安装面解决最痛的问题，再按项目需要加 hook 和 skill。

> **Agent harness 的复杂度一旦失控，本身也会变成新的上下文负担。**