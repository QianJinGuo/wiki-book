# Real-time voice agents with Stream Vision Agents and Amazon Nova 2 Sonic

## Ch04.048 Real-time voice agents with Stream Vision Agents and Amazon Nova 2 Sonic

> 📊 Level ⭐⭐ | 23.3KB | `entities/real-time-voice-agents-with-stream-vision-agents-and-amazon-nova-2-sonic.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/real-time-voice-agents-with-stream-vision-agents-and-amazon-nova-2-sonic.md)

## 核心要点
- Stream Vision Agents + Amazon Nova 2 Sonic + Stream Edge Network 构建生产级实时语音 Agent
- Nova 2 Sonic 是 unified speech-to-speech 模型，单次网络往返完成语音理解与生成，避免传统 ASR→LLM→TTS 三段式的延迟瓶颈 
- Vision Agents 提供开源 Python 框架，25+ 集成插件，支持 React/iOS/Android/Flutter/React Native 多端 SDK 
- 端到端延迟通常低于 500ms，全球边缘网络实现 sub-500ms 加入时间与 sub-30ms 音频延迟 
- 支持 Function Calling 工具调用，可在对话中查询数据库、调用 API、触发工作流 

## 背景：构建语音 Agent 的挑战
构建生产级语音 Agent 面临多重工程挑战：实时音频流基础设施管理、语音识别、LLM 集成、TTS 服务各有独立的延迟特征和故障模式。整个语音交互 pipeline 需在几百毫秒内完成才能让用户感觉自然，任何延迟都会打断对话节奏。
传统架构将语音交互拆解为多个独立服务串联：麦克风采集 → STT 语音转文字 → LLM 处理语义 → TTS 文字转语音 → 播放。每个环节至少一次网络往返，累积延迟可达数秒。更糟糕的是，团队在重连逻辑、WebRTC 连接管理、边界情况处理上花费的时间往往超过实际 AI 能力开发。
此外，生产语音应用还需处理网络不稳定、浏览器兼容性、会话超时、服务不可用时的优雅降级等现实问题。

## 技术架构
### 核心组件
| 组件 | 角色 | 关键能力 |
|------|------|----------|
| **Amazon Nova 2 Sonic** | Speech-to-speech 基础模型，通过 Amazon Bedrock 访问 | 实时双向音频流、原生 turn detection、Function Calling，单次 pipeline 完成语音到语音的端到端处理  |
| **Stream Vision Agents** | 开源 Python 框架，构建实时语音/视频 AI Agent | 插件架构、25+ 集成、生产部署工具、多端 SDK  |
| **Stream Edge Network** | 全球分布式边缘网络 | sub-500ms 加入时间、sub-30ms 音频延迟  |
三者分工明确：Stream 负责实时媒体传输和客户端体验，Amazon Nova 2 Sonic 提供 AI 智能，Vision Agents 作为胶水代码将它们绑定在一起。

### 账户边界划分
系统设计明确划定两个账户边界：
1. **客户 AWS 账户**：业务逻辑和编排（Agent policies、tools、数据访问）、Amazon Bedrock 集成以访问 Nova 模型
2. **Stream AWS 账户**：全球 WebRTC/SFU 媒体平面、TURN/STUN、signaling，以及 Vision Agent 运行时（worker processes），将 WebRTC 作为机器人 Peer 连接终止并桥接客户 Amazon Bedrock 集成
这种分离确保敏感数据和业务逻辑保留在客户控制之下，同时 Stream 的全球边缘网络提供用户期望的低延迟媒体体验。

### 端到端媒体流
完整媒体流经 6 个阶段：
1. **用户加入**：Web 或移动端 App 嵌入 Stream 音频 SDK，请求麦克风权限，加入配置为 AI 参与的 call type。媒体通过 RTP over UDP 发送以获得可预测的低延迟和无行首阻塞（head-of-line-free）传输
2. **区域 SFU 终止**：Stream SFU 节点在最近区域终止用户 WebRTC 连接，处理带宽估计、 simulcast 和 NAT 遍历，然后将相关音频轨道转发给 Vision Agent worker
3. **Vision Agent Worker**：专用 Worker 进程持有该会话的 PeerConnection 状态，将音频解码为原始 PCM 并通过 Bedrock 实时 API 流向 Amazon Nova 2 Sonic
4. **Nova 2 Sonic 处理**：检测语音边界，执行 speech-to-speech 建模（理解、推理、TTS），可选地调用客户系统工具（RDS、API、知识库），优雅处理 barge-in 并维护完整对话上下文
5. **流式响应返回**：Nova Sonic 生成响应音频帧时，Worker 将其切片并用单调递增时间戳包装为 RTP，发送给 SFU 并通过同一 WebRTC 会话传输到客户端设备
6. **Barge-in 与边数据**：浏览器端回声消除防止 Agent 输出重新触发 VAD；用户中断时，新语音通过 RTCDataChannel 发送中断信号，Worker 停止转发 Nova Sonic 输出并重置本地 buffer

### Amazon Bedrock 集成原理
#### 双向流式 API
Amazon Nova 2 Sonic 使用事件驱动的双向流式 API，而非传统的请求-响应模式，允许音频几乎同时在两个方向流动。Vision Agents AWS 插件通过结构化事件序列管理此过程：

- **Session initialization**：`sessionStart` 事件携带推理配置（temperature、max tokens、top-p）
- **Prompt setup**：`promptStart` 事件配置音频输出格式（24kHz PCM）、语音选择和工具定义
- **System instructions**：系统指令以 `SYSTEM` 角色的文本内容块发送
- **Audio streaming**：麦克风音频帧（约 32ms each）作为 `audioInput` 事件流式传输
- **Response streaming**：Nova Sonic 流式返回 `audioOutput` 事件包含生成的语音
- **Session teardown**：`promptEnd` 和 `sessionEnd` 事件干净地关闭连接
每个内容块遵循三部分模式：`contentStart` → content payload → `contentEnd`，分层结构使模型在整个交互过程中保持proper上下文。

#### Function Calling 工作流
当模型决定调用函数时，触发以下序列：
1. Nova 2 Sonic 发出 `toolUse` 事件，包含函数名和参数
2. Vision Agents 插件拦截事件、反序列化参数、运行注册的 Python 函数
3. 结果通过 `toolResult` 事件发送回 Nova，包装在标准 `contentStart` → `toolResult` → `contentEnd` 模式中
4. Nova 2 Sonic 将函数结果并入其响应，继续自然口语对话
这使得复杂的 multi-step 工作流成为可能——语音 Agent 可以在单次自然对话中查询客户记录、检查库存并下订单。

### 代码示例：创建语音 Agent
以下代码展示如何在 30 行内创建一个由 Amazon Nova Sonic 驱动的全功能实时语音 Agent：
```python
import asyncio
from dotenv import load_dotenv
from vision_agents.core import Agent, User, Runner
from vision_agents.core.agents import AgentLauncher
from vision_agents.plugins import aws, getstream
load_dotenv()
async def create_agent(**kwargs) -> Agent:
    agent = Agent(
        edge=getstream.Edge(),
        agent_user=User(name="Helpful Assistant", id="agent"),
        instructions="You are a helpful voice assistant. Be concise and friendly.",
        llm=aws.Realtime(
            model="amazon.nova-2-sonic-v1:0",
            region_name="us-east-1",
            voice_id="matthew",
        ),
    )
    return agent
async def join_call(agent: Agent, call_type: str, call_id: str, **kwargs) -> None:
    call = await agent.create_call(call_type, call_id)
    async with agent.join(call):
        await asyncio.sleep(2)
        await agent.llm.simple_response(
            text="Greet the user warmly and ask how you can help."
        )
        await agent.finish()  # Run until the call ends
if __name__ == "__main__":
    Runner(AgentLauncher(create_agent=create_agent, join_call=join_call)).cli()
```
使用 `@llm.register_function` 装饰器注册自定义函数，可实现天气查询、数学计算等工具调用能力。

## 适用场景
### 场景一：无屏幕/低注意力环境语音接口
Vision Agents + Nova 2 Sonic 非常适合用户无法可靠使用屏幕的场景，如驾驶、现场服务、物流、医疗或现场操作。在这些环境中，语音成为主要界面而非便利功能。

- Nova 2 Sonic 提供低延迟实时语音交互和自然轮流检测，用户可自由说话、打断响应、纠正自己而不打断对话流程
- Vision Agents 管理跨轮次的对话状态和任务逻辑，将口语输入转换为检索下一任务分配、更新任务状态、记录笔记或请求人工协助等结构化操作
因为 Agent 维护整个交互的上下文，用户可以发出后续命令或澄清而不必重复信息。例如，快递司机可以问"下一站是哪里"，接收口头 directions，说"标记上一站配送完成"，然后 follow up"呼叫调度"，所有操作无需触碰屏幕，而 Agent 实时更新后端系统。

### 场景二：大规模Inbound电话支持
此组合专为处理大量 inbound 支持电话而设计，人类 Agent 成为瓶颈的场景。核心价值在于扩展：减少排队时间、deflect 重复请求、将人类 Agent 保留给需要其参与的情况。

- Nova 2 Sonic 使来电者可以进行低延迟实时语音对话，自然描述问题而非 navigate 脚本化 IVR 树
- Vision Agents 编排 intent detection、对话状态和后端集成（订单系统、账户记录、工单服务），常见请求可在通话内自动解决
当问题超过预定义置信阈值或需要人工干预时，Agent 附加结构化上下文升级到人工，避免来电者重复自己。在高峰时段，数百名客户可能打电话询问配送延迟，来电者立即被语音 Agent 应答，Agent 检查订单状态、解释延迟、提供下一步骤，仅在检测到异常时路由到 live agent。
这将电话系统从基于排队的成本中心转变为持续的第一线解决方案层。

## 技术优势总结
| 维度 | 优势 |
|------|------|
| **延迟** | Unified speech-to-speech 单次 pipeline，Nova Sonic 在语音层面完成理解和生成闭环，避免三次网络往返  |
| **架构** | 账户边界清晰，客户控制业务逻辑，Stream 处理媒体传输，符合企业安全要求  |
| **可用性** | WebRTC 内置 ABR、FEC 和 jitter buffer，带宽波动时可动态调节而不中断会话  |
| **跨平台** | 原生支持 Chrome/Firefox/Safari/Edge/Android/iOS，单一 WebRTC 实现覆盖所有主要平台  |
| **扩展性** | AWS 全托管 auto-scaling，无需手动扩容管理  |

## 深度分析
1. **Unified speech-to-speech architecture eliminates the traditional three-stage latency bottleneck**: Traditional voice agent architectures separate ASR→LLM→TTS into three distinct services, each requiring at least one network round-trip and accumulating seconds of delay. Nova 2 Sonic's unified speech-to-speech model completes the entire pipeline—understanding, reasoning, and speech generation—in a single network往返  . This architectural shift from sequential pipeline to unified model is fundamental to achieving sub-500ms end-to-end latency that feels natural to users.
2. **Account boundary separation enforces security and operational independence**: The architecture deliberately splits responsibilities between customer AWS account (business logic, tool orchestration, Bedrock integration) and Stream AWS account (global WebRTC media plane, SFU, signaling, Vision Agent worker runtime). This separation ensures sensitive business data and AI logic remain under customer control while media delivery is handled by Stream's globally distributed edge infrastructure  . The robot peer pattern—where the Vision Agent worker terminates WebRTC as another call participant—elegantly integrates AI into the existing call model without custom protocol handling.
3. **Event-driven bidirectional streaming enables real-time AI interaction**: Nova 2 Sonic's bidirectional streaming API replaces the request-response pattern with continuous bidirectional audio flow. The Vision Agents plugin orchestrates a structured event sequence—sessionStart, promptStart, audioInput/Output streaming, session teardown—that handles the complexity of maintaining conversation context while streaming audio frames approximately every 32ms  . This event-driven approach differs fundamentally from REST-based API calls, enabling real-time responsiveness that would be impossible with polling or batch processing.
4. **Function calling transforms voice agents from conversational toys into operational tools**: The ability to invoke functions mid-conversation—querying databases, calling APIs, triggering workflows—while maintaining natural spoken dialogue is what elevates voice agents from novelty to production utility. The toolUse → toolResult event pattern allows complex multi-step workflows (lookup customer → check inventory → place order) within a single natural conversation  . This capability directly addresses the "最后一公里" problem of AI agents: connecting to real systems and taking real actions.
5. **WebRTC's media delivery properties are crucial for production-grade voice AI**: The article emphasizes RTP over UDP for predictable low latency and head-of-line-free delivery, along with browser echo cancellation for barge-in handling. These WebRTC characteristics—built-in ABR, FEC, jitter buffer for bandwidth adaptation—provide the production resilience necessary for real-world deployment where network conditions vary continuously  . This distinguishes production-grade voice AI from demo implementations that work in controlled lab conditions.

## 实践启示
1. **Prioritize unified speech-to-speech models over modular ASR→LLM→TTS architectures when latency is critical**: If your use case demands natural conversation feel (sub-500ms perceived delay), evaluate unified speech-to-speech models like Nova 2 Sonic as the foundation rather than assembling best-of-breed components. The ~30 lines of code required to create a functional voice agent with this architecture demonstrates how much the integration burden has been reduced, but the architectural choice to go unified remains the primary decision point.
2. **Use the robot peer pattern to integrate AI agents into existing real-time communication infrastructure**: Rather than building custom signaling for AI participants, model the AI as another peer in the WebRTC call. The Vision Agent worker terminates WebRTC as a robot peer and bridges to customer Bedrock integration. This approach leverages existing call infrastructure, reduces custom code, and naturally handles multi-party scenarios where human and AI participants share the same call context.
3. **Implement robust reconnection and graceful degradation for production voice applications**: The article notes that teams often spend more time on reconnection logic, WebRTC connection management, and edge case handling than on AI capabilities. Build in automatic reconnection, session timeout handling, service unavailability graceful degradation, and network instability handling from day one. These infrastructure concerns are prerequisites for production deployment, not optional enhancements.
4. **Design function calling schemas that match natural language invocation patterns**: When defining functions for voice agents, consider how users will naturally request actions. The function calling should feel like a natural extension of conversation, not an interruption. Design tool schemas with descriptive names and parameters that align with how users speak, not how programmers think. Test function calling with realistic conversation flows to ensure the agent maintains conversational coherence when invoking tools.
5. **For high-volume inbound phone support, design voice agents as the first-line resolution layer**: The architectural emphasis on deflecting repetitive requests to voice agents and escalating to human agents only when confidence thresholds are exceeded suggests a specific design philosophy: treat voice AI as the primary resolver, not a fallback. This means designing your escalation criteria carefully, ensuring structured context is attached when escalating, and measuring containment rate as a key performance indicator for the voice agent system.

## 相关实体
- [Build real-time voice streaming applications with Amazon Nova Sonic and WebRTC](https://github.com/QianJinGuo/wiki/blob/main/entities/build-real-time-voice-streaming-with-amazon-nova-sonic-and-webrtc.md) — 同一技术栈的 WebRTC 集成方案
- [Amazon Nova Lite Fine-Tuning](https://github.com/QianJinGuo/wiki/blob/main/entities/amazon-nova-lite-fine-tuning-cost-effective-vision-detection-model-tuning-case-and-practice.md) — Nova 视觉模型微调实践
- [Amazon Nova Multimodal Embeddings 制造业智能应用](https://github.com/QianJinGuo/wiki/blob/main/entities/amazon-nova-manufacturing-intelligence.md) — Nova 多模态嵌入能力
- [Nemotron 3 Multi-Agent System](ch04/044-nvidia-nemotron-3-agents-rag-voice-safety.md) — NVIDIA 多Agent系统参考
- [Amazon Bedrock AgentCore Memory](ch04/310-ai.md) — Bedrock Agent 记忆哲学
- [Strands Agents SDK](ch04/503-agent.md) — 确定性数据分析实践
- [Control where your AI agents can browse with Chrome enterprise policies on Amazon Bedrock AgentCore](ch04/310-ai.md)
- [From siloed data to unified insights: Cross-account Athena Access for Amazon Quick](ch01/569-from-siloed-data-to-unified-insights-cross-account-athena-a.md)
- [Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战](ch04/310-ai.md)
- [AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）](ch04/503-agent.md)
- [Doris MCP on AgentCore Runtime: VPC原生MCP部署模式](ch04/503-agent.md)
- [OpenClaw多租户迁移: Phase 2&3部署](ch04/460-openclaw-multi-4.md)
- [AgentCore Runtime部署Apache Doris MCP Server](ch04/310-ai.md)
- [AgentCore Identity: 3-legged OAuth+Session Binding的安全架构](ch04/503-agent.md)
- [OpenClaw多租户迁移: 背景与架构概览](ch04/438-openclaw-multi-1.md)
- [别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南](ch12/032-amazon-bedrock-api.md)
- [OpenClaw多租户迁移: Phase 1 基础设施部署](ch04/399-openclaw-multi-3.md)
- [AgentCore Browser OS级操作：Action-Screenshot-Reaction闭环](ch04/503-agent.md)
- [Amazon Bedrock模型推理的Serverless异步架构](ch11/236-bedrock.md)
- [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](ch04/503-agent.md)
- [基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构](ch04/503-agent.md)
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/real-time-voice-agents-with-stream-vision-agents-and-amazon-nova-2-sonic.md)

- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](ch04/503-agent.md)
- [SQS+Lambda异步管道：2000并发0%限流的工程细节](ch11/084-aws-bedrock-serverless-async-inference-sqs-lambda.md)
- [基于 Prowler 与 GenAI 构建金融行业智能合规中枢（Alt）](ch04/310-ai.md)
- [在 Amazon Bedrock 上为 Claude 应用设计稳健的 Prompt Cache 策略](ch01/380-claude.md)
- [build-custom-code-based-evaluators-in-amazon-bedrock-agentco](ch11/048-build-custom-code-based-evaluators-in-amazon-bedrock-agentco.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/aws-cloud-ai-infrastructure.md)

---

