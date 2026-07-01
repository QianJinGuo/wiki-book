# Claude Code 工具设计复盘（官方）

## Ch01.411 Claude Code 工具设计复盘（官方）

> 📊 Level ⭐⭐ | 9.9KB | `entities/claude-code-tool-design-evolution-anthropic.md`

[Claude Code 工具设计复盘（官方）](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-tool-design-evolution-anthropic.md)

## 相关查询

- [Claude Code 生态系统研究](https://github.com/QianJinGuo/wiki/blob/main/queries/claude-code-ecosystem-research.md) — Claude Code 核心组件、Skill 系统、MCP 协议与企业级扩展路径

## 文章核心
Anthropic 官方复盘 Claude Code 中三个工具的设计演进过程，揭示一个核心原则：**随着模型能力提升，曾经有用的工具可能反过来成为限制**。

## 一、AskUserQuestion 工具：三次迭代
**目标**：降低 Claude 向用户提问的摩擦，提升用户与 Claude 之间的沟通带宽。

### 第一次尝试：ExitTool 加参数
- 在 ExitTool 中增加 `questions` 数组参数，计划与提问同时输出
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

## 核心设计原则
### 1. 工具必须适配模型当前能力
随着模型能力提升，曾经需要的工具可能反过来限制它。要**定期回头审视「这些工具是否还有必要」**。

### 2. 只支持少量能力相近的模型
工具设计可以聚焦；不同能力 profile 的模型需要不同工具。

### 3. Claude 喜欢调用是成功的关键
> "Even the best designed tool doesn't work if Claude doesn't understand how to call it."

### 4. 工具的最终形态不是永久的
随着 Claude 能力提升，服务它的工具也必须跟着演进。

## 深度分析
1. **工具生命周期与模型能力曲线必须同步审视**：Anthropic 的三次迭代揭示了一个根本规律——工具的有效性不是静态的，而是随模型能力动态变化的。ExitTool+questions 失败不是因为设计差，而是因为那个设计在当时的模型能力下产生了不可解决的认知冲突。定期做"工具必要性审计"比持续优化现有工具更重要。
2. **"Claude 知道怎么调用"是工具设计的隐藏成功条件**：AskUserQuestion 最终成功的关键不是格式设计，而是 Claude 能够稳定地识别"这里需要提问"的时机并正确调用工具。这说明工具设计者必须同时扮演两角色：工具工程师 + 模型行为工程师。最好的工具API是让模型无需刻意理解就能自然调用的。
3. **从"推上下文"到"拉上下文"的架构范式转移**：RAG 将上下文预处理后推送给模型，Grep 让模型按需自己拉取。前者在模型能力弱时有效，后者随模型能力增强收益递增。这不是简单的工具替换，而是从"系统主导"到"模型主导"的信息获取范式转移。当模型足够强时，它比自己更知道需要什么上下文。
4. **阻塞式交互 vs 异步执行代表了两种不同的信任模式**：AskUserQuestion 的阻塞式模态框强制等待用户反馈，而 Task 工具支持跨 Subagent 异步协作。前者将用户定位为决策链中的必要节点，后者将用户视为最终验收者。工具的同步/异步选择本质上是"信任模型"的选择。
5. **Task 工具的跨 Agent 协调能力重新定义了"任务"的语义**：TodoWrite 是单 Agent 记忆辅助，Task 是多 Agent 通信协议。这个转变的深层含义是：当多 Agent 协作成为主流时，工具的核心价值从"管理注意力"转向"管理 Agent 间的合约与依赖"。任务不再是一个待办清单，而是一个可被引用、修改、依赖的通信单元。

## 实践启示
1. **在设计工具时加入"模型调用识别度"测试**：在工具发布前，用 prompt 让模型在无引导情况下尝试调用该工具，观察它是否能自然识别调用时机。如果需要额外引导才能正确调用，说明工具的 API 设计或 description 存在认知障碍，需要重新设计而非增加引导指令。
2. **建立工具-能力版本对照表，每季度审视一次**：当模型能力发生显著提升（如从 4.5 到 5.x）时，主动审查所有现有工具：哪些工具的功能可以被模型原生替代？哪些工具的假设已经不再成立？不要等到工具频繁失败才被动调整。
3. **优先让模型自己构建上下文，而非预处理后推送**：如果你的场景中模型需要访问代码库或文档，优先给模型提供搜索/检索工具让其自主构建上下文，而非用 RAG 预处理后批量注入。只有在模型检索效率极低或实时性要求极高时才考虑推模式。
4. **多 Agent 系统中用 Task 替代 TodoList 作为协调原语**：如果你的多 Agent 系统还在用共享 TodoList 管理任务，立即迁移到支持依赖关系、跨 Agent 引用、动态修改的 Task 工具。TodoList 在单 Agent 场景是注意力管理工具，在多 Agent 场景会成为协作瓶颈。
5. **将用户反馈工具设计为阻塞式，异步任务设计为非阻塞式**：阻塞式交互（AskUserQuestion）适合需要用户明确决策的关键节点；非阻塞式（Task）适合后台执行和跨 Agent 协作。不要混用——在一个需要用户决策的场景使用异步弹窗，会导致模型在用户未回应时继续执行，产生逻辑撕裂。

## 关联阅读
## 相关实体
- [Claude Code Harness Deep Understanding](ch01/378-claude-code-harness-deep-understanding.md)
- [准备开一个新坑从零复刻一个 Claude Codenn目标是在这个过程中和大家一起学习 Claude Code 的 Harness 是如何做的Nnclaude ](ch03/074-claude-code.md)
- [Anthropic Claude Code Large Codebase Best Practices 50002A089323](ch03/074-claude-code.md)
- [Claude Code Harness Deep Dive Founder Park](ch03/074-claude-code.md)
- [Claude Code开发负责人 为何放弃Rag而选择Agentic Search](ch03/074-claude-code.md)

- [无需复杂环境搭建教你用自己的 Agent 玩转 Moltbook](ch03/044-agent.md)
- [Coze 3 0 Local Agent Codex Claude Code Project](ch03/074-claude-code.md)
- [Claude Code Agent Teams Xingxiaozhao](ch03/074-claude-code.md)
- [Imclaw通过微信飞书操控Claudecodecodexgeminiclipi Agent蜂群](ch03/044-agent.md)

---

