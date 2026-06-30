# Claude Managed Agents 开发者指南

## Ch01.340 Claude Managed Agents 开发者指南

> 📊 Level ⭐⭐ | 11.2KB | `entities/claude-managed-agents-developer-guide.md`

## Overview
Claude Managed Agents 是 Anthropic 推出的托管 Agent 平台 API，核心是一个叫 **Harness** 的编排引擎：将工具调用、上下文管理、错误恢复、沙箱环境等基础设施收走，开发者只需关注任务本身。
> 定位：从 Messages API（自己管一切）到 Managed Agents（只管提示词和任务），类比 AWS 从 EC2 到 Lambda 的演进。

## 四大核心概念
### 1. Agent（配置模板）
可复用的配置定义：模型、system prompt、工具集、MCP 服务。

- 创建后返回 Agent ID，可在不同会话中复用
- 内置 `agent_toolset_20260401`：Bash + 文件读写 + 代码搜索 + Web 访问，可选择性禁用
- **带版本管理**：每次更新生成新版本，可查看历史、将会话固定在指定版本

### 2. Environment（运行模板）
定义智能体的运行环境：依赖包、网络规则、文件挂载。

- 支持包管理器：pip/npm/apt/cargo/gem/go
- 环境缓存机制：同环境后续会话启动更快
- 网络模式：`unrestricted`（默认）或 `limited`（域名白名单）
- **GitHub 仓库挂载**：直接指定 `repository + branch`，会话启动时自动 clone

### 3. Session（运行实例）
智能体真正执行任务的实例，每个 Session 有独立容器（文件系统/进程/网络）。

- 持续到手动关闭或超时
- 多轮对话间保留状态
- 状态：`"running"` / `"idle"` / 其他

### 4. Events（通信通道）
SSE（Server-Sent Events）流式通信。

- 事件类型：`agent.message`（响应文本）、`agent.tool_use`（工具调用）、`session.status_idle`（完成）
- 可实时观察智能体行为（读文件/跑命令/查 Web/调工具）
- 支持中途打断

## 扩展能力
### 自定义工具（JSON Schema）
以 JSON Schema 定义工具接口，智能体调用时发出结构化请求，开发者在事件流接住执行并回传结果。可接入内部 API、数据库、CI/CD 流水线。

### MCP 服务器
直接连接 MCP 服务器，复用 Slack/GitHub/Jira 等现成工具接口。

## 多智能体编排（研究预览版）
### 协调器 + 工作者模式
- 协调器（Coordinator）：负责任务拆分、分配、结果汇合；通常用更强模型（Opus）
- 工作者（Worker）：各自在独立上下文中运行，**对话隔离但共享容器+文件系统**
- 限制：仅支持一层分工，工作者不可再拆

### 与 Agent Teams 模式的区别
| 维度 | Managed Agents 多智能体 | 通用 Agent Teams 模式 |
|------|------------------------|----------------------|
| 通信 | 共享文件系统 + 协调器调度 | 多种编排原语（广播/RPC/消息队列） |
| 隔离 | 对话隔离 + 文件系统共享 | 完全隔离或消息传递 |
| 适用 | AI 版 CI/CD 流水线 | 通用多 Agent 协作 |
| 成熟度 | 研究预览版 | 社区成熟方案 |

## 产品定位对比
| 方法 | 你管什么 | 适合场景 |
|------|---------|---------|
| Messages API | 全部（循环、工具、容器） | 需要完全自定义 |
| Agent SDK | 工具执行、容器 | 想用工具但自己托管 |
| **Managed Agents** | **只管提示词和任务** | **后端自动化** |
| Claude Code CLI | 基本不用管 | 本地交互式开发 |
| Claude Cowork | 不用管 | 非技术用户 |

## 定价
- Token 费用（同标准 API）
- 会话运行时间：**$0.08/小时**（精确到毫秒，仅运行中计费）
- Web 搜索：$10/1000 次
- 提示词缓存：命中缓存 0.1x
Token = 思考成本，Runtime = 环境成本。

## 与 PM 视角的关系
| 视角 | 本文（开发者指南） | [PM 视角](ch04/503-agent.md) |
|------|-----------------|-----------------|
| 焦点 | API 接口/代码示例/架构 | PM 工作流/效率提升 |
| 代码 | ✅ 完整 Python SDK 示例 | ❌ 无代码 |
| 定价 | ✅ 分项+示例计算 | ❌ 仅一句 |
| 对比 | ✅ 5 方法定位矩阵 | ❌ 无 |
| 场景 | ✅ 5 个技术场景 | ✅ 3 个 PM Agent |
| 多智能体 | ✅ 代码示例 | ❌ 仅概念提及 |

## 深度分析
### 1. Harness 编排引擎的产品哲学
Managed Agents 的核心不是某个算法创新，而是一个工程哲学的落地：**将 Agent 运行的基础设施抽象成托管服务**。传统 Messages API 要求开发者自行实现 ReAct 循环、工具调用、上下文窗口管理、错误恢复和沙箱隔离 — 这些基础设施代码与业务逻辑混杂，维护成本极高 。Managed Agents 将 Harness（编排引擎）作为平台能力提供，开发者只需关注"告诉 Agent 做什么"，而不是"如何让 Agent 做事"。这与 AWS 从 EC2（自己管服务器）到 Lambda（只管函数代码）的演进逻辑完全一致：基础设施复杂度被平台吸收，用户界面向上收缩。

### 2. 四层概念模型的语义层级
Agent → Environment → Session → Events 构成了一套从**配置定义到运行时实例**的完整生命周期。四者区分清晰但相互依赖：Agent 是静态配置模板（可版本化、可复用），Environment 是运行时的依赖与网络声明（可缓存），Session 是实际执行的容器实例（按时间计费），Events 是通信通道（流式 SSE）。这种分层设计的优势在于：**修改 Agent 配置不会影响已有 Session，新 Session 可以绑定到旧 Agent 版本**，实现了配置与运行时的解耦 。

### 3. 多智能体架构的当前限制
协调器 + 工作者模式目前处于研究预览阶段，有几个关键限制：仅支持一层分工（协调器不能委托给另一个协调器），工作者之间无直接通信只能通过共享文件系统协作，且整个模式被官方定位为"AI 版 CI/CD 流水线"而非通用多 Agent 协作框架 。这意味着该模式适合**任务可明确拆解、结果可独立验证**的流水线场景（如代码审查 + 测试生成），但不适合需要动态协商、循环迭代的复杂协作流程。

### 4. 定价模型的双重成本结构
Managed Agents 的计费由两部分构成：**Token 费用（思考成本）+ Session 运行时费用（环境成本）** 。$0.08/小时的运行时费率看似低廉，但精确到毫秒且仅计运行中时间，这意味着：短时任务（秒级）实际成本可能低于预期，但长时间运行的 Agent（如监控任务）成本会快速累积。提示词缓存命中可享 0.1x 折扣，这对 system prompt 较长而用户输入较短的场景（如固定审查流程）有显著优化空间。

### 5. 与 Agent SDK 的竞合边界
Agent SDK（`@anthropic-agents/sdk`）和 Managed Agents 解决的是同一类问题，但运维边界不同：Agent SDK 需要**自己托管运行环境**（提供容器/工具执行逻辑），Managed Agents 则由 Anthropic 云端托管。迁移路径是单向的：Messages API → Agent SDK → Managed Agents，是一个**控制权递减但运维负担也递减**的选择链 。如果团队已有成熟的 CI/CD 和容器化能力，Agent SDK 提供更多定制灵活性；如果团队希望最小化运维投入，Managed Agents 是更自然的选择。

## 实践启示
### 1. 从 Messages API 迁移的评估决策树
并非所有 Messages API 用户都应迁移Managed Agents。建议满足以下任一条件时考虑迁移：（1）工具调用逻辑超过 500 行且跨项目复用；（2）需要沙箱隔离但缺乏运维资源；（3）任务执行时间超过 5 分钟且需要中途可观察。如果只是简单的单轮问答或工具调用逻辑极轻，Messages API 的透明性和可控性仍是首选。

### 2. Environment 缓存与环境复用策略
同类任务的多个 Session 应尽可能复用同一 Environment（尤其是包含 pip/npm 安装的），利用平台缓存机制加速启动。建议为每类任务（代码审查、文档生成、数据调试）创建专用的 Environment 配置并固化 Agent 绑定，避免每次启动 Session 重新安装依赖 。

### 3. 多智能体场景的选择框架
只有当任务满足以下全部条件时才使用协调器 + 工作者模式：任务可明确拆分为独立子任务、子任务结果可独立验证、不需要跨工作者动态协商。对于复杂状态协作（如多方代码冲突解决），应等待通用 Agent Teams 模式成熟后再迁移。当前阶段更稳妥的做法是在单一 Agent 内通过 system prompt 分阶段处理。

### 4. 生产环境的成本监控与优化
在生产环境中引入 Managed Agents 前，必须建立 Token 使用量和 Session 运行时的双重监控机制。建议在 Events 流中记录每次 Session 的实际运行时长和 Token 消耗，计算单次任务的真实单位成本。对于高频调用场景（每日数百次），提示词缓存的 0.1x 折扣值得系统性利用 。

### 5. 安全性配置：有限网络模式优先
除非明确需要 unrestricted 网络访问，应默认使用 `limited` 模式并配置域名白名单 。自定义工具（JSON Schema 定义的 `trigger_deploy` 类）应在工具描述中明确标注操作的影响范围，并在工具执行层实现幂等性和权限校验 — 因为一旦工具暴露给 Agent，Agent 可能以非预期方式组合调用。

## Related
- [Claude Code Agent 工程设计](ch03/073-claude-code.md) — Claude Code 的本地 Harness 架构
- [Agent Harness 上下文管理：工作集视角](ch04/503-agent.md) — 托管 Harness 与本地 Harness 的上下文管理对比
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Managed Agents 的 Harness 工程背景
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-managed-agents-developer-guide.md)
- [PM 视角原始存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-pm-jess-yan-managed-agents.md)
- [Agent Skill 设计模式](ch04/245-skill.md)

## 相关实体
- [Claude Code 大型代码库最佳实践 — Anthropic 企业级部署指南](ch03/073-claude-code.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/claude-code-complete-guide.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/anthropic-ecosystem.md)

---

