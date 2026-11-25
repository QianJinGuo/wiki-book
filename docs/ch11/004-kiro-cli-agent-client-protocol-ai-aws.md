# 使用 Kiro CLI 和 Agent Client Protocol 构建飞书 AI 聊天机器人 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 8.0KB

## 概述
使用 Kiro CLI 和 Agent Client Protocol 构建飞书 AI 聊天机器人 by awschina on 24 3月 2026 in Artificial Intelligence Permalink Share 摘要：如何将 Kiro CLI 变成通用 Agent 后端，并用不到 1000 行 Rust 代码构建一个飞书聊天机器人。 目录 01 一、引言：每个团队都想要 AI Agent，但从零构建太难了 02 二、什么是 Agent Client Protocol (ACP)？ 03 三、为什么用 Kiro CLI 做 Agent 后端 04 四、深入解析：acp-link 如何桥接飞书与 Kiro CLI 05 五、实际演示 06 六、结语 一、引言：每个团队都想要 AI Agent，但从零构建太难了 你大概见过这样的场景：团队想在即时通讯平台上搭建一个 AI

## 核心技术
Kiro CLI、Agent SDK、Client Protocol

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/using-kiro-cli-agent-client-protocol-build-ai-chat/)

## 深度分析
**协议本质：ACP 把 Agent 能力从"库"还原为"进程边界"**：Agent Client Protocol 是 IDE 类客户端与 Agent 服务端之间的开放协议，物理载体是最朴素的 stdio：启动 Kiro CLI 子进程，交换 JSON 消息。协议定义四类结构化交互：Session 创建与管理（每段对话独立上下文）、富内容 Prompt（文本、Base64 图片、文件引用、资源链接）、流式响应（文本增量、工具通知、结构化内容块）、工具调用状态回报（经 [MCP](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md) 执行并经协议上报）。"客户端无关"是关键设计：任何能 spawn 进程并读写 stdio 的应用都是合法客户端，Agent 能力因此像 Unix 工具一样可被组合进任意宿主，无需以 SDK 形态侵入宿主技术栈。
**Custom Agent 配置即安全边界**：文中 Code Review Agent 的 JSON 配置值得逐字段分析：prompt 定义人设；tools/allowedTools 声明能力面；toolsSettings.shell.allowedCommands 以命令白名单（grep、find、git diff、cargo 等）把 shell 收敛到审查场景；resources 经 skill:// URI 把团队评审规范注入上下文；hooks.agentSpawn 启动时自动执行 git diff --name-only HEAD~1（带 timeout_ms/max_output_size 双限制）预置待审清单。这构成一个三层控制模型——人设层约束行为倾向、工具层约束能力上限、钩子层约束初始上下文。局限在于白名单粒度停留在命令级而非参数级，grep/cat 组合仍可读取 cwd 内任意文件，Agent 的爆炸半径等于"工作目录 × 白名单命令"；且 skill:// 注入的规范文档本身构成潜在的提示注入面。
**acp-link 桥接层的三个工程决策**：其一，飞书 Thread → ACP Session 映射让上下文按话题天然隔离，对比 [OpenClaw](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/openclaw-architecture.md) 在 IM 中手动 /new 切换上下文的方式，话题粒度会话避免了多任务上下文串味；其二，进程池 + 一致性哈希（pool_size 默认 4）将同一 thread_id 恒定路由到同一 Worker，保证 Session 亲和、避免反复载入上下文；代价是并发上限被池大小钉死，单 Worker 崩溃只能靠 Kiro CLI 内部持久化 Session 恢复；其三，流式增量被累积后以消息卡片整体刷新，工具调用状态同步可见——这是把协议层流式语义适配到 IM"消息可编辑"语义的典型做法。stdio 传输还隐含部署约束：Agent 运行时与桥接服务必须同机，横向扩展受限于单机进程密度，跨主机需外置路由层，这与 [上下文管理](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-management-agent-systems.md)的会话持久化强耦合。
**双向 MCP：Agent 从回复器变为一等参与者**：acp-link 内嵌一个 MCP Server，把 feishu_send_file 等飞书能力反向暴露给 Kiro CLI，消息流从单向"用户→Agent→文本"变为 Agent 可主动推送文件与卡片。配合内置 web_fetch/web_search 与 Skill、Sub-agent 编排，runtime 侧的 [工具调用](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/tool-use-patterns-ai-agents.md)、会话持久化、上下文累积全部内置，应用侧只剩"领域 I/O + Session ID 映射"两件事——这正是 [Agent 后端统一](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-backend-unification.md)模式的落地样本。
**成本模型的经济学**：Credit 订阅制把成本从"按 Token 浮动"转为"按订阅固定"。其洞察在于：Agent 工作负载下工具循环使单次对话的 API 调用次数成倍放大，Token 计费下这种放大直接传导为账单波动；订阅制吸收了波动但未消除成本——稳态成本约等于 pool_size × 活跃会话数 × 每会话 Credit 消耗，可预测不等于更便宜，只有交互密度越过阈值后才真正划算。对已持有 Kiro 许可证的团队边际成本接近零，这解释了该模式先在"已有 IDE 订阅"的组织内扩散，也呼应了 [编码 Agent 架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/coding-agent-architecture.md)从 IDE 向通用运行时的演化路径。

## 实践启示
1. **快速集成 IM 平台**：企业若需将 AI 能力嵌入飞书、钉钉等 IM 平台，优先考虑 ACP 桥接方案，而非从零实现对话管理、流式输出、上下文窗口等功能，预计可节省 70% 以上的集成开发量。
2. **Custom Agent 资产复用**：将团队常见场景（Code Review、文档助手、客服机器人）固化为可配置的 Custom Agent JSON 模板，新成员可直接复用而非重复造轮子，形成组织级 Agent 资产积累。
3. **工具调用标准化**：在构建 Agent 应用时，通过 MCP 等标准化协议管理外部工具，Agent 运行时只需关注任务规划和上下文管理，工具扩展性与运行时稳定性分离。
→ [原文存档](https://aws.amazon.com/cn/blogs/china/using-kiro-cli-agent-client-protocol-build-ai-chat/)

## 相关实体
- [把 Kiro CLI 当作 Agent SDK：一键订阅即可构建你的Agent应用 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/use-kiro-cli-as-agent-sdk-build-your-agent-app-with-one-click-subscription.md)
- [AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-network-claude-code-kiro-cli-implement-aws-ipsec-vpn.md)
- [基于 Amazon EKS 和 Graviton 构建多租户 AI Agent 平台：OpenClaw on Kubernetes 实践 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/build-multi-tenant-ai-agent-on-eks-graviton-openclaw-k8s-practice.md)
- [让 Kiro 和 Claude Code 响应 IM 消息：用 ACP Bridge 打造异步 AI 编程工作流 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/enable-kiro-and-claude-code-for-im-with-acp-bridge-async-ai-workflow.md)
- [用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/building-enterprise-agentic-ai-with-kiro-on-aws.md)
- [使用 Kiro AI IDE 开发 AWS CDK 部署架构：从模糊需求到三层堆栈的协作实战 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/blog-03-kiro-ai-cdk-development.md)

---

