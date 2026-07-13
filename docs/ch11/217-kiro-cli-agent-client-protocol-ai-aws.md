# 使用 Kiro CLI 和 Agent Client Protocol 构建飞书 AI 聊天机器人 | 亚马逊AWS官方博客

## Ch11.217 使用 Kiro CLI 和 Agent Client Protocol 构建飞书 AI 聊天机器人 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 5.6KB | `entities/using-kiro-cli-agent-client-protocol-build-ai-chat.md`

## 概述
使用 Kiro CLI 和 Agent Client Protocol 构建飞书 AI 聊天机器人 by awschina on 24 3月 2026 in Artificial Intelligence Permalink Share 摘要：如何将 Kiro CLI 变成通用 Agent 后端，并用不到 1000 行 Rust 代码构建一个飞书聊天机器人。 目录 01 一、引言：每个团队都想要 AI Agent，但从零构建太难了 02 二、什么是 Agent Client Protocol (ACP)？ 03 三、为什么用 Kiro CLI 做 Agent 后端 04 四、深入解析：acp-link 如何桥接飞书与 Kiro CLI 05 五、实际演示 06 六、结语 一、引言：每个团队都想要 AI Agent，但从零构建太难了 你大概见过这样的场景：团队想在即时通讯平台上搭建一个 AI

## 核心技术
Kiro CLI、Agent SDK、Client Protocol ^[https://aws.amazon.com/cn/blogs/china/using-kiro-cli-agent-client-protocol-build-ai-chat/]

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/using-kiro-cli-agent-client-protocol-build-ai-chat/)

## 深度分析
**ACP 协议的架构价值**：Agent Client Protocol 的核心设计理念是将 Agent 运行时与具体业务平台解耦。Kiro CLI 作为通用 Agent 后端，通过 stdio 交换 JSON 消息实现与飞书等 IM 平台的桥接。这种"协议优先"的思路让 Agent 能力可以无缝移植到任何支持进程启动的平台，而无需修改 Agent 本身的核心逻辑。 ^[https://aws.amazon.com/cn/blogs/china/using-kiro-cli-agent-client-protocol-build-ai-chat/]
**Custom Agent 的分层设计**：Kiro CLI 的 Custom Agent 配置（JSON 文件）实现了行为定义的标准化。tools、allowedTools、toolsSettings 的三级权限控制，配合 prompt 人设模板，使得非开发者也能通过配置文件定制专业领域 Agent，降低了 Agent 开发门槛。 ^[https://aws.amazon.com/cn/blogs/china/using-kiro-cli-agent-client-protocol-build-ai-chat/]
**MCP 工具生态的桥接**：acp-link 方案展示了如何通过 ACP 调用 MCP 工具（如 Wikipedia Search），而非直接在 Agent 内部注册工具。这种外部化工具调用链设计让工具生态与 Agent 运行时独立演进，提升了系统模块化程度。 ^[https://aws.amazon.com/cn/blogs/china/using-kiro-cli-agent-client-protocol-build-ai-chat/]

## 实践启示
1. **快速集成 IM 平台**：企业若需将 AI 能力嵌入飞书、钉钉等 IM 平台，优先考虑 ACP 桥接方案，而非从零实现对话管理、流式输出、上下文窗口等功能，预计可节省 70% 以上的集成开发量。 ^[https://aws.amazon.com/cn/blogs/china/using-kiro-cli-agent-client-protocol-build-ai-chat/]
2. **Custom Agent 资产复用**：将团队常见场景（Code Review、文档助手、客服机器人）固化为可配置的 Custom Agent JSON 模板，新成员可直接复用而非重复造轮子，形成组织级 Agent 资产积累。 ^[https://aws.amazon.com/cn/blogs/china/using-kiro-cli-agent-client-protocol-build-ai-chat/]
3. **工具调用标准化**：在构建 Agent 应用时，通过 MCP 等标准化协议管理外部工具，Agent 运行时只需关注任务规划和上下文管理，工具扩展性与运行时稳定性分离。 ^[https://aws.amazon.com/cn/blogs/china/using-kiro-cli-agent-client-protocol-build-ai-chat/]
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/using-kiro-cli-agent-client-protocol-build-ai-chat.md) ^[https://aws.amazon.com/cn/blogs/china/using-kiro-cli-agent-client-protocol-build-ai-chat/]

## 相关实体
- [把 Kiro CLI 当作 Agent SDK：一键订阅即可构建你的Agent应用 | 亚马逊AWS官方博客](../ch03/045-agent.html)
- [AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联 | 亚马逊AWS官方博客](../ch03/075-claude-code.html)
- [基于 Amazon EKS 和 Graviton 构建多租户 AI Agent 平台：OpenClaw on Kubernetes 实践 | 亚马逊AWS官方博客](../ch04/030-ai-agent.html)
- [让 Kiro 和 Claude Code 响应 IM 消息：用 ACP Bridge 打造异步 AI 编程工作流 | 亚马逊AWS官方博客](../ch03/075-claude-code.html)
- [用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台 | 亚马逊AWS官方博客](../ch04/556-agentic-ai.html)
- [使用 Kiro AI IDE 开发 AWS CDK 部署架构：从模糊需求到三层堆栈的协作实战 | 亚马逊AWS官方博客](../ch05/084-ai.html)

---

