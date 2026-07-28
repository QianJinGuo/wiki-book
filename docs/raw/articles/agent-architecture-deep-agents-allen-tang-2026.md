---
title: "万字长文拆解Agent 架构设计（六）：用 LangChain 复刻 Claude Code"
source_url: "https://mp.weixin.qq.com/s/WKsp9OWIMtl2n7ZZgXGR6w"
source_account: "AllenTang / 架构师带你玩转AI"
ingested: 2026-07-28
type: raw-article
tags:
  - agent-architecture
  - langchain
  - deep-agents
  - claude-code
  - middleware
  - agent-loop
  - subagent
  - agent-design-patterns
  - series
score_v: 6
score_c: 5
score_vc: 30
decision: raw
---

# 万字长文拆解Agent 架构设计（六）：用 LangChain 复刻 Claude Code

> 本系列目标：拆解 Claude Code 源码，理解 Agent 底层架构的设计思路。核心方法：读源码 → 理解设计决策 → 用 TypeScript 手写核心逻辑。

## 系列索引
前五篇分别拆解：记忆系统、工具系统、Agent Loop、多 Agent 协作、技能系统。本篇改为看主流框架（LangChain Deep Agents）如何实现同一套东西。

## Part 1：拆解 LangChain Deep Agents

### 1.1 骨架：循环 + 中间件
- 底座：LangChain `create_agent`，核心循环 = 模型说话→调工具→拿结果→再说话
- **新东西是中间件（middleware）**：包在循环外、各管一件事的可插拔层
- `create_deep_agent` 一行代码背后默认装好三个中间件

### 1.2 三个默认中间件
- **TodoListMiddleware**：把计划外化，自动加 `write_todos` 工具，防止长任务跑偏
- **FilesystemMiddleware**：虚拟文件系统，中间产物写进文件不堆对话历史——边界压缩的变体
- **SubAgentMiddleware**：子 Agent 即配置字典（name/description/system_prompt/tools/model）

### 1.3 可选中间件
- 审批中间件：approve / edit / reject 三档粒度
- checkpointer（状态存档器）：每轮完整状态持久化，支持断点续聊

### 1.4 后端路由：记忆分层换载体
- 文件系统支持按路径路由到不同存储
- 临时文件→会话状态，`/memories/`→跨会话持久，`/project/`→真实磁盘

## Part 2：对照看设计

### 三个决策共识
1. **五个零件殊途同归**：上下文分层、权限分档、子 Agent 隔离、历史压缩——Claude Code 和 LangChain 做同一套事
2. **子 Agent 是数据不是代码**：Claude Code 用 markdown 文件，Deep Agents 用字典——本质相同，新增无需改代码
3. **框架没做的恰是差异点**：基础层已标准化（循环/压缩/子Agent/权限/记忆）
   - 未标准化：渐进式技能生态 & 运行时安全评估——下两个方向

## 关键洞察
- 自然语言描述 = 接口契约（工具靠描述调用、子 Agent 靠描述选中、技能靠描述翻开——系列第四次撞见）
- 殊途同归说明 Agent 架构设计已收敛成行业共识
- 后续最有价值的两个方向：技能生态 和 安全深度

## 关联实体
- → [[entities/agent-harness-12-components-7-decisions|Agent Harness 12 组件与 7 个关键决策]] — 本文的中间件模式与 Harness 组件设计一致
- → [[entities/harness-engineering|Harness Engineering：第三代工程范式]] — 基础层标准化是 Harness Engineering 的成熟标志
