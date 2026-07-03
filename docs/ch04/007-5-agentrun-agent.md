# 5 分钟上手 AgentRun：从注册到第一个 Agent 运行

## Ch04.007 5 分钟上手 AgentRun：从注册到第一个 Agent 运行

> 📊 Level ⭐ | 9.0KB | `entities/aliyun-agentrun-5min-quickstart.md`

## 核心定位
阿里云 AgentRun 的定位本质是**平台与用户职责重新分工**：平台承担容器、扩缩容、网络、监控、灰度、合规等基础设施负担，用户只需聚焦模型、提示词、工具三大核心要素。
这一分工逻辑在产品层面的直接体现就是「快速创建」模式——通过可视化配置，无需编码即可上线一个运行在生产级 Serverless 运行时上的 Agent。

## 5 种创建模式
| 模式 | 定位 | 适合谁 |
|---|---|---|
| 快速创建 | 可视化配置，零编码 | 产品、业务、想先验证想法的人 |
| 代码创建 | 上传代码包/OSS/容器镜像 | 已有 LangChain/LlamaIndex/自研框架的团队 |
| 工作流创建 | 可视化节点编排 | 业务流程复杂、需要多节点串联 |
| 超级 Agent | 多 Agent 协同，主子 Agent 服务端编排 | 多角色协作、A2A 场景 |
| 模板创建 | 直接复用官方场景模板 | 想快速复制成熟方案 |
5 种模式共享一套运行时、一套监控、一套权限模型，且快速创建 → 代码模式可一键升级，不用重建。

## 快速创建表单（4 步）
1. **模型服务**：通义千问、DeepSeek、Kimi、OpenAI、DashScope 即配即用；FunModel 托管模型；LiteLLM 统一网关（含鉴权/负载均衡/Fallback/限流/安全审查/重试）
2. **系统提示词**：8 个内置模板（智能问答/市场文案/金融分析/本地生活/Python数据分析/长期记忆/企业知识库/数据可视化）；AI 生成模式一句话描述需求
3. **工具与上下文**：Skills、MCP 工具、Function Call、沙箱（代码解释器/浏览器自动化）、知识库、记忆
4. **Agent 名称和描述**

## 详情页 8 个 Tab（覆盖全生命周期）
| Tab | 能力 |
|---|---|
| 概览 | 关键指标看板：调用量、版本、健康度 |
| 配置与调试 | 实时调整提示词、模型、工具，右侧面板即时测试 |
| 版本与灰度 | 多版本管理，按 Endpoint 灰度发布 |
| 集成与发布 | SDK、UI、MCP 几种集成方式开箱即用 |
| 弹性与实例 | CPU、内存、并发、会话超时配置 |
| 会话历史 | 完整调用链路回溯 |
| 评估评测 | 离线回归、在线 Trace 评测 |
| 可观测 | 自动接 ARMS，链路追踪、指标、日志一处看 |

## 平台自动处理的生产级能力
- **Serverless 容器调度**：基于函数计算，按会话请求数自动扩缩，无请求时自动缩零
- **会话亲和路由**：同一会话默认路由到同一实例
- **流式输出**：SSE 协议开箱即用
- **可观测探针**：ARMS 探针自动注入，指标/链路/日志全开
- **凭证动态注入**：模型/工具/沙箱凭证由平台动态颁发，一键启用/禁用
- **多租户隔离**：Workspace 粒度的资源/权限/计费边界

## 进阶能力
- **部署自研框架**：代码创建模式，支持代码包/OSS/容器镜像/WebIDE
- **多 Agent 协同**：超级 Agent 模式，原生支持 A2A
- **AgentRun CLI**：`curl -fsSL https://raw.githubusercontent.com/Serverless-Devs/agentrun-cli/main/scripts/install.sh | sh`
- **Python SDK**：`pip install agentrun-sdk`
- **MCP 工具市场**：平台已对接主流 MCP 生态

## 深度分析
### 平台定位的战略意图
阿里云 AgentRun 的出现并非偶然——它是 Serverless 理念向 AI Agent 领域延伸的产物。传统模式下，企业部署一个 AI Agent 需要同时运维基础设施（容器、扩缩容、监控）和业务逻辑（模型、提示词、工具），两者叠加形成高门槛。AgentRun 通过"平台兜底基础设施、用户聚焦业务逻辑"的分工，试图将 AI Agent 的部署门槛降低到"点几个按钮就能上线"的程度。

### Serverless 运行时对 Agent 场景的价值
基于函数计算的 Serverless 容器调度对 Agent 场景有独特价值：AI Agent 的请求量通常高度不均衡——可能长时间无请求，也可能突然爆发。传统容器模式要么为空闲实例付费，要么在爆发时冷启动延迟。AgentRun 的自动缩零能力解决了这个矛盾，按实际会话请求数计费，对初创团队和验证阶段的项目尤为友好。

### 多模式并存的设计考量
5 种创建模式共享同一套运行时和监控体系，这一设计值得注意。它意味着用户可以从"快速验证"起步（快速创建），在需求明确后平滑升级到"深度定制"（代码创建），而无需重新搭建基础设施或迁移监控体系。这种渐进式复杂度设计降低了试错成本，是 PaaS 平台常见的用户留存策略。

### 企业级能力的"隐性承诺"
平台自动处理的 6 项能力（Serverless 调度、会话亲和路由、流式输出、可观测探针、凭证动态注入、多租户隔离）中，多租户隔离和凭证动态注入是企业客户最敏感的部分。前者涉及资源安全和计费边界，后者涉及密钥管理安全。这些能力的存在意味着 AgentRun 不仅面向个人开发者，也瞄准了对安全性和合规性有要求的企业市场。

### 超级 Agent 与 A2A 的趋势信号
"超级 Agent"模式明确支持 A2A（Agent-to-Agent）协议，这透露了一个重要信号：阿里云认为未来 AI Agent 的主流形态不是单一 Agent 独立工作，而是多 Agent 协同。超级 Agent 承担"编排者"角色，通过主子 Agent 架构实现复杂业务流程的分解与协作。这与近期行业对 multi-agent systems 的关注（如 LangGraph、AutoGPT、CrewAI 等框架的兴起）是一致的。

## 实践启示
### 1. 起步推荐：先用快速创建验证想法
对于新项目或新场景先用「快速创建」模式上线第一个 Agent，验证业务可行性。一旦模型/提示词/工具组合跑通，再根据需要升级到「代码创建」模式引入自定义框架。避免过早引入 LangChain/LlamaIndex 等框架的复杂度。

### 2. 模型选择：LiteLLM 统一网关值得优先考虑
面对通义千问、DeepSeek、Kimi、OpenAI 等多模型选项时，建议通过 LiteLLM 统一网关接入。LiteLLM 自带鉴权/负载均衡/Fallback/限流/安全审查/重试等企业级能力，比直连单一模型服务更稳定，也更容易切换模型提供商。

### 3. 评测体系尽早建立
详情页的「评估评测」Tab 支持离线回归和在线 Trace 评测。建议在 Agent 上线前就用评估体系建立基线——哪怕只是一个简单的问答准确率指标。上线后的每一次提示词/模型/工具调整都应对比基线数据，避免"感觉变好了但实际没变"的认知偏差。

### 4. 多 Agent 协同的适用场景判断
超级 Agent 模式适合复杂业务流程拆解（如：一个 Agent 负责查资料、一个负责生成文案、一个负责审核），而非所有场景。对于简单问答或单步任务，单 Agent 模式即可，引入多 Agent 反而增加复杂度。当业务流程需要多角色串联且每个角色有独立工具和知识库时，再考虑超级 Agent。

### 5. MCP 工具市场是生态关键
平台已对接主流 MCP 生态，这意味着可以通过 MCP 工具市场快速接入外部能力（如 GitHub 集成、数据库连接、第三方 API）。如果官方提供的 Skills 不够用，优先查 MCP 工具市场而不是自己写 Function Call。

### 6. CLI 和 SDK 适合集成到现有系统
对于已有内部平台或需要将 Agent 能力集成到现有系统的团队，AgentRun CLI 和 Python SDK 提供了 programmatic 访问途径。尤其是 Python SDK，可以直接 `pip install agentrun-sdk` 集成到 Python 项目中，适合内部工具链自动化场景。

## 资源链接
## 相关实体
- [深势科技携手阿里云 Agentrun加速科研 Ai Agent 全速运行](ch04/150-ai.md)
- [Aliyun Agentrun](ch03/045-agent.md)
- [Agentrun Cli V010 正式开源一行命令运行您的托管 Agent](ch03/045-agent.md)
- [Skill Development Guide Aliyun 2026](ch04/245-skill.md)
- [Strands Agents Cloud Cost Optimizer](ch03/045-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/aliyun-agentrun-5min-quickstart.md)
- [agentrun：阿里云多 agent 生产级协作方案（a2a 开放协议）](ch03/045-agent.md)

---

