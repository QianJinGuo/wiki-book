---
title: "Qoder 开源 Better Harness，专门审查 Coding Agent 的外部系统"
source_url: "https://mp.weixin.qq.com/s/VQBxx1vFHNl7bUFcd0a-2A"
author: VibeCoder
platform: WeChat
ingested: 2026-07-29
slug: qoder-better-harness-code-level-analysis-vibecoder
sha256: 8807a498dbd14ed5c19c4c546e5006779ab41527df0faf69aac8502ac0e95ce7
---

VibeCoder 对阿里 Qoder 团队开源的 Better Harness 的代码级深度分析。基于阅读源码 + 跑主链测试和全量 833 项测试。

## 定位

Better Harness 不生成代码，也不替代 Qoder/Claude Code/Codex/Cursor 的运行循环。它检查目标、执行、验证、交付、学习五个环节，每个环节拆成三个检查。

## 五维 × 三检查

- **目标**：是否被理解，相关上下文是否进入任务，范围边界是否守住
- **执行**：命令和工具是否来自项目支持入口，权限是否清楚
- **验证**：改动后是否跑相关验证，失败后是否诊断和复验
- **交付**：是否有验收证据，高风险操作是否获批，回滚能力
- **学习**：同类摩擦是否被识别和工程化，后续任务是否验证效果

## 四路证据

1. **Session Evidence**：读取与工作区匹配的真实任务轨迹
2. **Project Harness**：项目结构、规则、工程入口和变更影响
3. **Agent Customize**：盘点 Rules/Skills/Hooks/MCP/Memory 等资产
4. **Lead Facts**：保存范围和统一分析所需的精确事实

前三路交给三个只读专家，各自看自己的 evidence lane，互不读取结论，也不决定最终严重度和分数。Lead 等三路都返回，再检查因果链、最小 owner、evidence refs 和 verifier。

## 证据状态模型

| 状态 | 含义 |
|------|------|
| Present | 东西存在 |
| Wired | 已接入流程 |
| Exercised | 在真实任务中触发 |
| Outcome-supported | 有可比较的结果支撑 |
| Missing / Unobserved / N/A | 各自语义 |

前四维分数上限：Present ≤74，Wired ≤84，Exercised ≤94。

## 代码架构

- Skill：管范围、权限和工作流
- 根 CLI：命令注册与 argv dispatch
- 采集器：只提供事实
- Lead：因果、owner、severity、五维分数和修复提示
- Renderer：schema 修复、规范化、校验、staging、原子发布

一条 finding 需写清：当前后果、因果链、最小 owner、期望产物、验收检查和证据引用。不达门槛的留在工作底稿。

source-bound review：机器先给 report source 做摘要绑定，列出允许引用的 evidence refs。Lead 引用不存在的证据 ID 编译阶段拒绝。

## Qoder 模式

固定生成 findings.json、canvas.json 和 report.canvas.tsx。Canvas 使用仓库内固定模板。修复写回锁 revision：回调必须携带精确 workspace、findings 路径、finding ID 和 revision。

## 诚实边界

- 项目刚开源两天，无独立生产案例或前后对照
- Qoder AMAP 案例：代码生成率从 53%→80-90%，但交付周期未改善——代码生成率不代表交付可靠性
