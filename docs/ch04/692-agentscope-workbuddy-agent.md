# 我用阿里 AgentScope 复刻了一个 WorkBuddy — 从开源框架到可运行 Agent 的实践拆解

## Ch04.692 我用阿里 AgentScope 复刻了一个 WorkBuddy — 从开源框架到可运行 Agent 的实践拆解

> 📊 Level ⭐⭐⭐ | 5.5KB | `entities/我用阿里-agentscope-复刻了一个-workbuddy.md`

# 我用阿里 AgentScope 复刻了一个 WorkBuddy — 从开源框架到可运行 Agent 的实践拆解

## 核心定位

本文来自叶小钗，是一篇 AgentScope Python 框架的实践教程。作者使用阿里开源的 AgentScope 框架（Python 版），完整复刻了 WorkBuddy 的核心工作流，涵盖模型配置管理、Toolkit 工具系统、权限控制、工作目录管理和前端交互等关键模块。

与现有 [WorkBuddy 产品架构](../ch03/046-agent.html) 文章从提示词和产品化角度切入不同，本文聚焦于**工程实现层面**——如何在 AgentScope 框架上构建一个具备完整功能的 Agent 产品。

## 关键技术点

### 模型配置管理

AgentScope 的模型层由 Credential（API 凭证）和 ChatModel（模型对象）组成。实际产品化的 mini-WorkBuddy 需要在此之上添加模型配置管理——用户在前端添加多个模型、设置默认模型、在聊天时切换模型。项目将配置保存在 `workspace/models.json` 文件中，每轮聊天请求按用户选择的 model_profile 创建对应的模型客户端。为保证模型切换即时生效，系统将模型配置 ID 放入 Agent 缓存 key 中，切换后旧缓存失效，自动创建新模型 Agent。

### Toolkit 工具系统

AgentScope 的Toolkit 是工具容器和调用入口，管理四类工具：
- 普通 Tool（Read、Write、Bash 等）
- MCP Client 提供的远程工具
- Skill Loader 加载的 Agent Skills
- Tool Group 动态启用/停用的工具组

模型通过 ReAct 循环调用工具，Toolkit 执行工具解析、权限判断、流式结果返回全流程。mini-WorkBuddy 显式选择了文件读取/搜索/编辑、Bash 执行等6个基础工具。

### 权限系统五种模式

AgentScope 2.0.4 提供五种 PermissionMode：
- **DEFAULT** — 最保守，所有操作都需确认
- **ACCEPT_EDITS** — 放行工作目录内的读写操作
- **EXPLORE** — 严格只读，Write/Edit 直接拒绝
- **BYPASS** — 跳过确认（高风险）
- **DONT_ASK** — 无人值守任务，需询问的操作直接拒绝

mini-WorkBuddy 简化为用户可选的三种模式：默认（DEFAULT）、自动审批（ACCEPT_EDITS）、完全放行（BYPASS），并使用 PermissionRule 支持自定义规则（如"uv run pytest 始终允许""rm 命令直接拒绝"）。

### 工作目录隔离

项目通过两层机制控制 Agent 的文件操作范围：一是 Bash(cwd=workdir) 指定命令起始目录，二是 PermissionContext.working_directories 限定读写权限范围，防止 Agent 修改工作目录外的文件。长期记忆目录和 Skill 目录也按需加入权限范围。

### 工具审批流

当权限结果为 ASK 时，AgentScope 将工具调用记录到 AgentState 并产生 RequireUserConfirmEvent。mini-WorkBuddy 定义了自己的 PendingApproval 结构记录原 Agent、待确认工具、原始请求和已流式内容，用户确认后后端构造 UserConfirmResultEvent 交回原 Agent 继续执行。模型一次发出多个并行工具调用时，按 reply ID 保存 ConfirmationBatch 统一处理。

### 工具调用可视化

AgentScope 通过 ToolCallStartEvent、ToolCallDeltaEvent、ToolCallEndEvent 流式输出工具名称与参数。后端按 tool call ID 聚合参数片段，前端据此更新工具卡片显示工具名称、格式化参数、执行状态和结果。需要审批的工具从 RequireUserConfirmEvent 中取出 ToolCallBlock 放入审批卡片展示。

## 与既有内容的关系

- [WorkBuddy 产品架构](../ch03/046-agent.html) — 提示词与产品化视角，本文补充了工程实现视角
- [AgentScope Java Harness](../ch03/051-agentscope-java-harness-framework-2-0-agent-harness.html) — AgentScope Java 版的企业级 Harness 实现，本文对应 Python 版实践
- [WorkBuddy 记忆对比](ch04/296-mem0-vs-workbuddy-agent.html) — 记忆层面的比较分析
- [OpenClaw vs WorkBuddy](../ch05/007-loop-engineering.html) — 工作流引擎对比

## 四层工具架构

mini-WorkBuddy 的工具组织为四层：基础 Tool（Read/Write/Bash）→ MCP 接入 → Skills/Skill Loader → Tool Group 动态分组。这套结构为后续拆解"专家"和"专家团"能力提供了可扩展的工具基础。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/我用阿里-agentscope-复刻了一个-workbuddy.md)

---

