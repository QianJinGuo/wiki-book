# AgentRun

## Ch04.003 AgentRun

> 📊 Level ⭐ | 9.6KB | `entities/aliyun-agentrun.md`

## 核心能力
- **5 种创建模式**：快速创建 / 代码创建 / 工作流创建 / 超级 Agent / 模板创建
- **快速创建**：4 步（模型 + 提示词模板 + 工具上下文 + 名称），零编码，5 分钟上线
- **8 Tab 详情页**：概览 → 配置调试 → 版本灰度 → 集成发布 → 弹性实例 → 会话历史 → 评估评测 → 可观测
- **全托管生产级能力**：Serverless 容器（自动扩缩）、会话亲和路由、SSE 流式输出、ARMS 可观测探针、凭证动态注入、多租户隔离
- **多模型支持**：通义千问、DeepSeek、Kimi、OpenAI、DashScope、FunModel 托管模型、LiteLLM 统一网关
- **MCP 生态**：平台已对接主流 MCP 工具市场

## API 集成（OpenAI 协议兼容）
AgentRun 端点直接兼容 **OpenAI Chat Completions** 协议（同时也支持 **AGUI**）。现有 OpenAI 项目只需改 `base_url` 和 `api_key` 两行参数，其他代码一行不动。

### 端点格式
```
https://{account-id}.agentrun-data.{region}.aliyuncs.com/agent-runtimes/{agent-name}/endpoints/{endpoint-name}/invocations
```

### Python 调用示例
```python
from openai import OpenAI
client = OpenAI(
    base_url="https://{your-endpoint}/openai/v1",
    api_key="your-agentrun-token",
)
response = client.chat.completions.create(
    model="default",
    messages=[{"role": "user", "content": "..."}],
    stream=True,
)
for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### 五条集成路径
1. **代码集成**：兼容 OpenAI 协议，改两行参数就能调通（Python / Node.js / Java / curl）
2. **SDK 集成**：管理 Agent 生命周期、调用沙箱和知识库，无缝对接 LangChain 等主流框架
3. **UI 嵌入**：四套视觉风格、三种嵌入方式，复制代码片段就能把聊天窗口嵌进网页
4. **IM 集成**：控制台配完钉钉 / 飞书 / 企微机器人就能用，不用自己写 webhook 转发
5. **事件集成**：接阿里云 EventBridge，云上事件自动触发 Agent，不需要人主动发起对话

### 多轮对话（Session 管理）
在请求头里加 `x-agentrun-session-id: {会话ID}`，同一个 session-id 下的消息会自动关联上下文。AgentRun 把 Session 当作平台级资源管理——每个 Session 有独立的生命周期（TTL、空闲超时、状态追踪），不需要自己建会话存储。

### AI 网关透明能力
请求经过 AgentRun AI 网关，自动处理模型路由、多 APIKey 负载均衡和内容安全检测（输入输出都会过安全护栏），对调用方完全透明。模型供应商 API Key 由平台统一托管和轮转，调用方拿到的是 AgentRun 自己的 token，不会直接接触底层模型密钥。

## 定位对比
AgentRun vs 自建 Agent：

- AgentRun：平台托管infra，5 分钟从零到生产级 Agent
- 自建：选模型/搭框架/起服务/管会话/通流式/接监控/做扩缩容/多租户隔离——一条链下来先成运维

## 深度分析
### 架构设计：平台与用户分工的边界艺术
AgentRun 的核心设计理念是**让平台承包所有非业务相关的复杂性**。从架构分层来看：

- **运行时层**：Serverless 容器调度（基于函数计算），请求驱动的自动扩缩容模型，零请求时自动缩至零，彻底解决空跑浪费问题
- **会话管理层**：Session 被提升为平台级资源，有独立的 TTL、生命周期和状态追踪，调用方不需要自己实现会话存储
- **安全层**：AI 网关透明处理模型路由、Key 轮转、负载均衡、内容安全检测，调用方只接触 AgentRun token，不接触模型方密钥
- **可观测层**：ARMS 探针自动注入，指标/链路/日志开箱即用
这种分层设计的结果是：用户感知到的接口极其简单（OpenAI 兼容协议），但底层享有完整的生产级基础设施。

### 多模型支持：灵活性与统一入口的矛盾
支持 8+ 模型服务（通义千问、DeepSeek、Kimi、OpenAI、DashScope、FunModel、LiteLLM）的策略，本质上是在**锁定用户与避免供应商绑定之间找平衡**。LiteLLM 统一网关的引入尤其值得注意——它提供了限流、Fallback、多 Key 负载均衡等企业级能力，但同时也将 AgentRun 的供应商锁定风险转化为了 LiteLLM 的锁定风险。这是一个务实的折中，但对追求完全独立性的用户需要明确告知。

### OpenAI 兼容协议的策略价值
采用 OpenAI Chat Completions 协议兼容策略，而非推广自研 AGUI 协议，是一次**精明的生态借力**：

- 现有 LangChain、LlamaIndex、AutoGen 等框架无需任何改造即可接入
- 降低用户迁移成本，减少 AgentRun 的获客阻力
- 但这也意味着 AgentRun 的差异化能力被协议层隐藏了——调用方感知到的是"又一个 OpenAI 兼容端点"，而不是 AgentRun 特有的工具管理、Session 管理、MCP 生态等能力

### 定价与成本模型分析
AgentRun 基于函数计算计费，核心优势是**按实际调用计费 + 零请求自动缩零**。相比自建 Agent 服务的固定资源占用模式，对于调用量波动大或初期验证阶段的企业，这能节省大量成本。但需要注意：

- 冷启动延迟：Serverless 容器冷启动可能带来首请求延迟
- 长连接场景：如果 Agent 需要保持长时间活跃连接，Serverless 模型不一定最优

## 实践启示
### 何时选 AgentRun 而不是自建
**适合 AgentRun 的场景**：

- 快速验证 AI 能力想法，需要在分钟级别上线一个 Agent
- 团队没有专职运维，想让业务开发者直接运营 AI 能力
- 调用量波动大，不希望为空跑资源付费
- 需要多租户隔离，且不想自己实现权限边界
- 已有 OpenAI 接口的代码，想快速切换到阿里云模型
**仍需自建的场景**：

- 对模型有完全自主的 fine-tune 或 RLHF 需求
- 需要极致的冷启动延迟控制（<100ms）
- 业务逻辑高度定制，无法用提示词模板覆盖
- 对数据主权有严格监管要求，不能接受多租户共享基础设施

### 集成最佳实践
1. **优先用 SDK 再考虑 API**：Python SDK (`agentrun-sdk`) 封装了 Session 管理、工具调用、知识库操作，比裸调 OpenAI 协议能获取更多平台能力
2. **Session ID 设计**：将业务侧的 user_id 或 conversation_id 直接作为 x-agentrun-session-id，可以省去平台侧会话映射的复杂度
3. **灰度发布**：利用 AgentRun 原生的多版本管理 + Endpoint 灰度，不要在调用侧自己实现灰度逻辑
4. **MCP 工具选型**：优先使用平台已对接的 MCP 工具，市场已有生态，避免自己踩坑

### 安全与合规注意事项
- AgentRun token 遵循最小权限原则，只授权特定 Agent 的调用权限，不要用主账号 Key 直调
- 内容安全护栏是平台级能力，但针对金融、医疗等强监管场景，仍需业务侧做额外合规校验
- 多租户隔离是 Workspace 粒度，涉及高敏感数据的 Agent 需确认隔离边界是否满足业务要求

## 相关实体
→ [原文存档：5分钟上手](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aliyun-agentrun-5min-quickstart.md)
→ [原文存档：2行代码集成](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aliyun-agentrun-2line-integration.md)

- [GBrain](../ch01/309-gbrain-yc-ceo-garry-tan-postgres-native-ai-5-llm.md)

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/queries/chinese-ai-ecosystem-silicon-valley-differences-agent-development-impact.md)

- [看 AgentRun 如何玩转记忆存储，最佳实践来了！](ch04/003-agentrun.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇 | 亚马逊AWS官方博客](ch04/499-amazon-bedrock-agentcore.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 | 亚马逊AWS官方博客](ch04/499-amazon-bedrock-agentcore.md)
- [OpenCLI](../ch03/084-opencli.md)
- [AutoCLI](../ch03/117-autocli.md)
- [阿里巴巴 Aone 面向 Agent 的研发模式探索](ch04/055-aone-agentic.md)
- [CLI-Anything](../ch03/094-cli-anything.md)
- [CLI-Tools 横向对比](https://github.com/QianJinGuo/wiki/blob/main/comparisons/cli-tools-comparison.md)
- [AgentBrowser](../ch09/148-agent-browser-claude-code-qoderwork.md)
- [24h打工人](../ch03/045-agent.md)

---

