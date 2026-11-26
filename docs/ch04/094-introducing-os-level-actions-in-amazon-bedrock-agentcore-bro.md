# Introducing OS Level Actions in Amazon Bedrock AgentCore Browser

> 📊 Level ⭐⭐⭐ | 11.9KB

> -> [原文存档](https://aws.amazon.com/blogs/machine-learning/introducing-os-level-actions-in-amazon-bedrock-agentcore-browser/)

## 摘要
<p>AI agents that automate web workflows operate within the browser’s web layer, the DOM that Playwright and the Chrome DevTools Protocol (CDP) expose. AgentCore Browser provides a secure, isolated browser environment for this, and it works well for the vast majority of automation: navigating pages,...</p>

## 深度分析

### DOM 层的硬边界：OS Level Actions 要解决的问题

Playwright 与 CDP 的作用域被严格限定在浏览器的 web 层——DOM 所暴露的世界。页面导航、表单填写、元素点击、内容提取这些主流自动化任务在这一层运转良好，但操作系统渲染的一切（原生对话框、安全提示、证书选择器、右键菜单、甚至 Chrome 自身的设置界面）完全位于 DOM 之外：CDP 看不见，Playwright 也无从交互。

关键在于这些场景几乎只在生产环境暴露：`window.print()` 触发的系统打印对话框、macOS 隐私对话框、Windows 安全提示，都由特定的应用状态、OS 配置或用户权限触发；测试环境的 web 内容往往"可预期到足以做验证"，因此问题不会在测试期浮出水面。 对视觉驱动的 Agent（截图→模型推理→坐标执行）来说这尤其致命：截图能捕获原生 UI，模型也能推理出该做什么，但执行环节没有任何工具可达 OS 渲染的内容——Agent "看得见却动不了"。

### Action-Screenshot-Reaction 闭环：API 形状与交互协议

OS Level Actions 的接入刻意保持零增量：对新旧 browser 配置均无需额外设置，全部能力经由既有的 `InvokeBrowser` API 暴露，每次调用携带恰好一个 action，返回 SUCCESS 或 FAILED 状态，会话通过 `x-amzn-browser-session-id` header 绑定。 预期交互模式是一个六步循环：发送 action → AgentCore 在完整 OS 桌面上执行并返回状态 → 请求截图 → 捕获包含原生对话框、OS 模态框、浏览器窗口之外 UI 的全桌面 base64 PNG → 交视觉模型推理 → 发出下一个 action，如此往复。

八个 action 分为鼠标（mouseClick / mouseMove / mouseDrag / mouseScroll）、键盘（keyType / keyPress / keyShortcut）与视觉捕获（screenshot）三类。 几个容易忽略的设计细节：

- `mouseClick` 的坐标字段全部可选，缺省在当前光标位置执行左键单击——与先行的 `mouseMove` 配合可把"定位"与"触发"拆成两步；`clickCount` 支持 1–10 连击。
- `mouseScroll` 的 deltaY 负值向下滚动，取值范围 -1000 到 1000；`mouseDrag` 需要起点和终点四个坐标。
- `keyType` 直接发送字符，上限 10,000 字符；`keyPress` 的 `presses` 参数支持 1–100 次重复（如用 tab 逐个跳过表单字段、用 escape 关模态框）；`keyShortcut` 接受最多 5 个键的数组，键名必须小写（如 `["ctrl", "a"]` 全选）。
- `screenshot` 是唯一返回数据的 action，其余 action 只回状态与错误字段。
- 官方明确提醒：浏览器会话运行在虚拟化环境中，部分右键菜单项可能行为不符合预期——这是云托管方案的固有代价。

### viewPort 坐标系统与控制面/数据面边界

session 的 `viewPort` 决定两件事：鼠标 action 的坐标空间与截图尺寸。viewport 为 1920×1080 时 x 有效范围 0–1919、y 0–1079，越界坐标直接返回 `ValidationException`——这意味着坐标校验完全可以在客户端前置完成。 工程上需要区分两个 client：控制面（`bedrock-agentcore-control`）负责创建/删除 browser 资源，数据面（`bedrock-agentcore`）负责会话内派发 action；执行角色需要 `bedrock-agentcore:InvokeBrowser`、`StartBrowserSession`、`StopBrowserSession` 三个权限。

官方的打印对话框示例完整走了一遍闭环：先截图看到当前状态 → 视觉模型识别出打印对话框并返回 Cancel 按钮坐标 → `mouseClick(410, 535)` → 再次截图确认对话框已消失 → 工作流继续。 截图确认不是可选的调试步骤，而是这个循环里与 action 等权的一环。

### 定位：浏览器自动化版图的"最后一块"

结论部分把 OS Level Actions 定位为 AgentCore Browser 能力边界的延伸：从"通过 Playwright 和 CDP 在规模上导航页面、提取内容、自动化工作流"，扩展到"观察、推理并作用于完整 OS 桌面"，且与既有的视觉理解能力、Playwright 与 Amazon Nova Act 的框架集成并存——官方称其"补上了浏览器自动化覆盖的最后一个缺口"。 与 [Aws Bedrock Agentcore Os Level Actions Browser](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-bedrock-agentcore-os-level-actions-browser.md) 描述的闭环一致，这一模式本质上是把 [Harness Loop Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-loop-architecture.md) 中"感知-决策-执行"的循环下沉到了 OS 输入层；放在更广的工具调用视角下，它也是 [Tool Use Patterns Ai Agents](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/tool-use-patterns-ai-agents.md) 的一个极端案例——当 DOM 接口缺失时，屏幕像素本身就是接口。
## 实践启示
1. **处理生产环境中的边缘场景**：当你的 Agent 遇到 `window.print()` 触发的系统打印对话框、`window.showModalDialog()`、或 macOS 隐私对话框时，OS Level Actions 是唯一可靠的自动化手段。
2. **右击上下文菜单的自动化**：需要通过右键菜单执行操作时，使用 `mouseClick` + `button: "RIGHT"` 组合。
3. **快捷键编排**：对于需要 `Ctrl+A`（全选）、`Ctrl+C`（复制）等组合键的操作，`keyShortcut` action 支持最多 5 个键的组合。
4. **截图观察循环**：每次 OS Action 后都要截图确认状态变化。这不是"可选的调试步骤"，而是 Agent 决策循环的必要组成部分。
5. **坐标系统的理解**：所有坐标基于 session 的 `viewPort` 设置。如果 viewport 是 1920×1080，x 有效范围是 0-1919，y 是 0-1079。超出范围的坐标会触发 `ValidationException`。

## 相关实体
- [AgentCore Browser OS级操作：Action-Screenshot-Reaction闭环](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-bedrock-agentcore-os-level-actions-browser.md)
- [Dify集成Amazon Bedrock AgentCore Browser  实现更强大的信息获取和分析能力 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-agentcore-browser-information-retrieval-and-analysis-capabilities.md)
- [基于Bedrock AgentCore+Strands构建企业级智能搜索平台实践 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/building-enterprise-level-with-bedrock-agentcore-and-strands.md)
- [当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学" | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/when-ai-agents-learn-to-forget-amazon-bedrock-agentcore-memory-philosophy.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/using-amazon-bedrock-agentcore-openclaw-multi-1.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/using-amazon-bedrock-agentcore-openclaw-multi-4.md)
- [Doris MCP on AgentCore Runtime: VPC原生MCP部署模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-bedrock-agentcore-doris-mcp-server.md)
- [OpenClaw多租户迁移: Phase 2&3部署](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-multi-4.md)
- [AgentCore Runtime部署Apache Doris MCP Server](https://github.com/QianJinGuo/wiki-public/blob/main/entities/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics.md)
- [AgentCore Identity: 3-legged OAuth+Session Binding的安全架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-bedrock-agentcore-identity-security.md)
- [OpenClaw多租户迁移: 背景与架构概览](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-multi-1.md)
- [OpenClaw多租户迁移: Phase 1 基础设施部署](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-multi-3.md)
- [Amazon Bedrock模型推理的Serverless异步架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-model-inference-serverless-architecture-case-study.md)
- [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/mcp-serveramazon-bedrock-agentcorequick-suite.md)
- [Real-time voice agents with Stream Vision Agents and Amazon Nova 2 Sonic](https://github.com/QianJinGuo/wiki-public/blob/main/entities/real-time-voice-agents-with-stream-vision-agents-and-amazon-nova-2-sonic.md)
- [Control where your AI agents can browse with Chrome enterprise policies on Amazon Bedrock AgentCore](https://github.com/QianJinGuo/wiki-public/blob/main/entities/control-where-your-ai-agents-can-browse-with-chrome-enterprise-policies-on-amazo.md)
- [Improve bot accuracy with Amazon Lex Assisted NLU](https://github.com/QianJinGuo/wiki-public/blob/main/entities/improve-bot-accuracy-with-amazon-lex-assisted-nlu.md)
- [航班变更信息智能识别解决方案 | Amazon Web Services](https://github.com/QianJinGuo/wiki-public/blob/main/entities/航班变更信息智能识别解决方案.md)
- [Amazon Nova Multimodal Embeddings 制造业智能应用](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-nova-manufacturing-intelligence.md)
- [From siloed data to unified insights: Cross-account Athena Access for Amazon Quick](https://github.com/QianJinGuo/wiki-public/blob/main/entities/from-siloed-data-to-unified-insights-cross-account-athena-access-for-amazon-quic.md)
- [Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/zenjoy-aiops-agent-bedrock-eks-prometheus.md)
- [Habby 游戏借助 AWS DevOps Agent 实现智能运维最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/habby-game-aws-devops-agent.md)
- [AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-一周综述amazon-bedrock-agentcore-付款适用于-aws-的-agent-工具套件等2026-年-5-月-11-日.md)
- [Agent orchestration](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-agent-orchestration-workshop.md)
- [AWS Reinvent Game Demo 2024-25](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-reinvent-game-demo-2024-25.md)
- [AgentCore Managed Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentcore-harness.md)
- [SQS+Lambda异步管道：2000并发0%限流的工程细节](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-bedrock-serverless-async-inference-sqs-lambda.md)
- [基于 Prowler 与 GenAI 构建金融行业智能合规中枢（Alt）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/based-on-prowler-genai-build-fintech-intelligent-compliance-2.md)
- [在 Amazon Bedrock 上为 Claude 应用设计稳健的 Prompt Cache 策略](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-claude-prompt-cache-strategy.md)

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/build/custom/code/based/evaluators/in/amazon/bedrock/agentco.html)

- [build-custom-code-based-evaluators-in-amazon-bedrock-agentco](https://github.com/QianJinGuo/wiki-public/blob/main/entities/build-custom-code-based-evaluators-in-amazon-bedrock-agentco.md)
- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/aws-cloud-ai-infrastructure.md)

---

