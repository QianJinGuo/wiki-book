---
title: Claude Code 工具设计复盘（官方）
source_url: https://mp.weixin.qq.com/s/eOkICy56oQFAzmStzgTxkw
publish_date: 2026-05-07
tags: [wechat, article, claude, agent, harness, rag]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 72a5fff5af4b84468dd5a9e2a6621e549bf5ee65106479196a48aece4851aeda
---

## 一、AskUserQuestion 工具：三次迭代
**目标**：降低 Claude 向用户提问的摩擦，提升用户与 Claude 之间的沟通带宽。
### 第一次尝试：ExitPlanTool 加参数
- 在 ExitPlanTool 中增加 `questions` 数组参数，计划与提问同时输出
- **失败原因**：同时要求"做计划"和"对计划提问"，Claude 困惑；如果用户回答与计划矛盾，逻辑混乱
### 第二次尝试：修改输出格式（Markdown bullet + 方括号选项）
- 修改 Claude 输出指令，要求生成特定 Markdown 格式（bullet list + 方括号选项）
- **失败原因**：Claude 大部分时候能生成，但不稳定——会多加句子、漏掉选项、或放弃格式
### 第三次尝试：AskUserQuestion 独立工具 ✅
- 独立工具，Claude 可在任何时候调用，规划模式中特别引导使用
- 触发时弹出模态框显示问题，**阻塞 Agent 循环直到用户回答**
- 关键洞察：**Claude 喜欢调用这个工具，输出质量也好**
  > "Even the best designed tool doesn't work if Claude doesn't understand how to call it."
**最终界面**：结构化输出 + 多选项 + 阻塞式模态框。
---
## 二、TodoWrite → Task：从线性清单到协作任务图
### TodoWrite 时代
- 背景：Claude Code 早期需要 TodoList 保持专注
- 痛点：Claude 经常忘记待办事项 → 每隔 5 轮插入系统提醒
- **新问题**：系统提醒让 Claude 死守清单，不敢中途调整方向
### Task 工具（替代 TodoWrite）
核心转变：**Todo 的重点是让模型保持方向，Task 的重点是让 Agent 之间互相沟通**。
| 能力 | TodoWrite | Task |
|------|-----------|------|
| 依赖关系 | ❌ | ✅ 支持 |
| 跨 Subagent 共享 | ❌ | ✅ 支持 |
| 动态修改/删除 | 有限 | ✅ 完全支持 |
| 适用场景 | 单 Agent 线性清单 | 多 Agent 协作任务图 |
**设计背景**：Opus 4.5 提升了 Subagent 能力，但多个 Subagent 无法共享一个 Todo 列表 → Task 解决协调问题。
---
## 三、上下文构建：RAG → Grep（让 Claude 自己找上下文）
### RAG 时代的问题
- 向量数据库预索引代码库，每次回复前自动检索相关片段塞给 Claude
- **根本缺陷**：上下文是被"塞给" Claude 的，不是 Claude **自己找**的
- RAG 速度快、效果好，但需要预处理、环境兼容性脆弱
### Grep 工具：Claude 自己构建上下文
> "If Claude could search the web, why couldn't it search your codebase?"
- 给 Claude 一个 Grep 工具，让它**自己搜文件、自己构建上下文**
- **核心洞察**：Claude 越聪明，给它合适的工具后它就越擅长自己构建上下文
### 延伸原则
> "The most consequential tools we've built are the ones that let Claude find its own context."
---
## 核心设计原则
### 1. 工具必须适配模型当前能力
随着模型能力提升，曾经需要的工具可能反过来限制它。要**定期回头审视「这些工具是否还有必要」**。
### 2. 只支持少量能力相近的模型
工具设计可以聚焦；不同能力 profile 的模型需要不同工具。
### 3. Claude 喜欢调用是成功的关键
> "Even the best designed tool doesn't work if Claude doesn't understand how to call it."
### 4. 工具的最终形态不是永久的
随着 Claude 能力提升，服务它的工具也必须跟着演进。
---
## 与 Wiki 现有页面的关系
- [[concepts/claude-code-source-leak-lifecycle]] — Claude Code 源码级生命周期解析（AskUserQuestion / Task 工具在源码中的位置）
- [[concepts/harness-engineering-framework]] — Harness Engineering 框架（上下文管理是 Harness 的核心组件）
- [[concepts/hermes-agent-architecture]] — Hermes Agent 架构（Task 工具的多 Agent 协作设计可与 Hermes 的常驻代理机制对比）