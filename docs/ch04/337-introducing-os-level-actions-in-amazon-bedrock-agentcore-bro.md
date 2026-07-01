# Introducing OS Level Actions in Amazon Bedrock AgentCore Browser

## Ch04.337 Introducing OS Level Actions in Amazon Bedrock AgentCore Browser

> 📊 Level ⭐⭐ | 7.7KB | `entities/introducing-os-level-actions-in-amazon-bedrock-agentcore-browser.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/introducing-os-level-actions-in-amazon-bedrock-agentcore-browser.md)

## 摘要
<p>AI agents that automate web workflows operate within the browser’s web layer, the DOM that Playwright and the Chrome DevTools Protocol (CDP) expose. AgentCore Browser provides a secure, isolated browser environment for this, and it works well for the vast majority of automation: navigating pages,...

## 深度分析
OS Level Actions 的发布标志着**浏览器自动化能力的最后一次关键补全**。在 AgentCore Browser 之前，浏览器自动化经历了三个阶段：DOM 操作（Playwright/CDP）→ 视觉理解（Vision Model）→ OS 层交互（现在）。
**核心突破**：原生操作系统 UI（对话框、安全提示、证书选择器、右键菜单）是 DOM 层无法触及的"盲区"。OS Level Actions 通过 `InvokeBrowser` API 将控制力延伸到这个盲区，形成了**完整的 Action-Screenshot-Reaction 闭环**。
**架构设计的关键选择**：
1. **无额外设置**：所有操作通过现有的 `InvokeBrowser` API 暴露，这意味着已有 AgentCore Browser 集成的系统可以零成本获得 OS 层能力。
2. **全桌面截图**：与 DOM 截图不同，OS 截图捕获整个屏幕，包括原生 UI 元素。这是 Vision Model 能够"看见"对话框的前提。
3. **单 Action 模式**：每次调用只执行一个 Action（click/move/type），这符合 Agent 的决策-执行循环设计原则，降低了状态复杂度。
**竞争格局**：传统 RPA（UiPath、Automation Anywhere）依赖本地安装的 Agent，需要处理复杂的兼容性问题。AgentCore Browser 的云托管 + OS Actions 组合提供了一个纯云端的替代方案。

## 实践启示
1. **处理生产环境中的边缘场景**：当你的 Agent 遇到 `window.print()` 触发的系统打印对话框、`window.showModalDialog()`、或 macOS 隐私对话框时，OS Level Actions 是唯一可靠的自动化手段。
2. **右击上下文菜单的自动化**：需要通过右键菜单执行操作时，使用 `mouseClick` + `button: "RIGHT"` 组合。
3. **快捷键编排**：对于需要 `Ctrl+A`（全选）、`Ctrl+C`（复制）等组合键的操作，`keyShortcut` action 支持最多 5 个键的组合。
4. **截图观察循环**：每次 OS Action 后都要截图确认状态变化。这不是"可选的调试步骤"，而是 Agent 决策循环的必要组成部分。
5. **坐标系统的理解**：所有坐标基于 session 的 `viewPort` 设置。如果 viewport 是 1920×1080，x 有效范围是 0-1919，y 是 0-1079。超出范围的坐标会触发 `ValidationException`。

## 相关实体
- [AgentCore Browser OS级操作：Action-Screenshot-Reaction闭环](ch03/044-agent.md)
- [Dify集成Amazon Bedrock AgentCore Browser  实现更强大的信息获取和分析能力 | 亚马逊AWS官方博客](ch03/044-agent.md)
- [基于Bedrock AgentCore+Strands构建企业级智能搜索平台实践 | 亚马逊AWS官方博客](ch03/044-agent.md)
- [当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学" | 亚马逊AWS官方博客](ch04/150-ai.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 | 亚马逊AWS官方博客](ch03/044-agent.md)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 | 亚马逊AWS官方博客](ch03/044-agent.md)
- [Doris MCP on AgentCore Runtime: VPC原生MCP部署模式](ch03/044-agent.md)
- [OpenClaw多租户迁移: Phase 2&3部署](ch04/460-openclaw-multi-4.md)
- [AgentCore Runtime部署Apache Doris MCP Server](ch04/150-ai.md)
- [AgentCore Identity: 3-legged OAuth+Session Binding的安全架构](ch03/044-agent.md)
- [OpenClaw多租户迁移: 背景与架构概览](ch04/438-openclaw-multi-1.md)
- [OpenClaw多租户迁移: Phase 1 基础设施部署](ch04/399-openclaw-multi-3.md)
- [Amazon Bedrock模型推理的Serverless异步架构](ch11/240-bedrock.md)
- [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](ch03/044-agent.md)
- [Real-time voice agents with Stream Vision Agents and Amazon Nova 2 Sonic](ch03/044-agent.md)
- [Control where your AI agents can browse with Chrome enterprise policies on Amazon Bedrock AgentCore](ch04/150-ai.md)
- [Improve bot accuracy with Amazon Lex Assisted NLU](ch01/529-improve-bot-accuracy-with-amazon-lex-assisted-nlu.md)
- [航班变更信息智能识别解决方案 | Amazon Web Services](https://github.com/QianJinGuo/wiki/blob/main/entities/航班变更信息智能识别解决方案.md)
- [Amazon Nova Multimodal Embeddings 制造业智能应用](ch11/250-amazon-nova.md)
- [From siloed data to unified insights: Cross-account Athena Access for Amazon Quick](ch01/571-from-siloed-data-to-unified-insights-cross-account-athena-a.md)
- [Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战](ch04/150-ai.md)
- [Habby 游戏借助 AWS DevOps Agent 实现智能运维最佳实践](ch03/044-agent.md)
- [AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）](ch03/044-agent.md)
- [Agent orchestration](ch03/044-agent.md)
- [AWS Reinvent Game Demo 2024-25](ch11/210-aws-reinvent-game-demo-2024-25.md)
- [AgentCore Managed Harness](ch03/044-agent.md)
- [SQS+Lambda异步管道：2000并发0%限流的工程细节](ch11/084-aws-bedrock-serverless-async-inference-sqs-lambda.md)
- [基于 Prowler 与 GenAI 构建金融行业智能合规中枢（Alt）](ch04/150-ai.md)
- [在 Amazon Bedrock 上为 Claude 应用设计稳健的 Prompt Cache 策略](ch01/380-claude.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/build-custom-code-based-evaluators-in-amazon-bedrock-agentco.md)

- [build-custom-code-based-evaluators-in-amazon-bedrock-agentco](ch11/048-build-custom-code-based-evaluators-in-amazon-bedrock-agentco.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/aws-cloud-ai-infrastructure.md)

---

