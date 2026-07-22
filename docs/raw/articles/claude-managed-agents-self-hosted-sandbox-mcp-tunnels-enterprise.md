---
source_url: "https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q""
ingested: 2026-06-26
sha256: dd0c143b2e822a1f
---

# Claude Managed Agents 新更新"专属云"模式：把Agent的手放回企业内部
Anthropic 刚刚更新了 Claude Managed Agents，标题是 self-hosted sandboxes and MCP tunnels。表面看是两个功能发布：Agent 可以在客户控制的 sandbox 里运行，也可以通过 MCP tunnels 连接私有 MCP server。
这次真正值得看的是架构边界。5 月 6 日那次 Managed Agents 更新补上了 Dreaming、Outcomes、多 Agent 编排和 webhooks，解决的是长期记忆、交付验收、任务拆分和事件对接。这次更新，把执行环境和私有工具连接推进到了企业自己的安全边界里。
## 这次更新的本质
Managed Agents 正在变成一个混合控制平面。
Anthropic 继续负责 agent loop、session、编排、模型调用、事件流和控制台；企业可以把代码执行、文件访问、内部服务调用放在自己的基础设施里。
这个边界可以用一句话讲清楚：**brain 还在 Anthropic，hands 可以回到企业侧。**
这个说法不是随便概括。Anthropic 4 月 8 日的工程文章标题就是 Scaling Managed Agents: Decoupling the brain from the hands。那篇文章把 Managed Agents 拆成 session、harness、sandbox 三个抽象。5 月 18 日的新功能，就是把这个抽象真正产品化。
## Self-hosted sandboxes 解决什么
Self-hosted sandbox 的机制是：企业在自己的基础设施里跑一个 worker。这个 worker 从 Anthropic 平台拉取工作项，在客户控制的环境里执行工具、访问文件、跑命令，然后把结果返回给 Managed Agents session。
这对企业很现实。很多 Agent 任务都绕不开私有仓库、内部依赖、构建工具、日志文件、测试环境、受限文档。以前如果 sandbox 在 Anthropic 托管，安全评审会问一堆问题：代码去哪了，文件怎么传，内部依赖能不能装，执行权限怎么控。
现在执行可以落在企业侧，评审阻力会小一些。
但要说清楚，它不是完整自托管。Agent 的决策过程、session 状态、事件流、工具调用结果，仍然在托管控制平面里。更准确的说法是：**执行边界客户侧化，控制平面 Anthropic 化。**
## MCP tunnels 解决什么
MCP tunnels 处理的是私有工具连接。
企业内部最有价值的工具通常不会直接暴露公网，比如工单系统、内部文档库、数据库查询代理、监控平台、审批流、GitHub Enterprise。MCP tunnels 让这些私有 MCP server 可以被 Claude 调用，同时避免直接开放公网入口。
不过 tunnel 只解决网络可达性，不解决工具治理。一个 MCP server 如果权限过宽、参数没有校验、返回结果没有去敏、危险动作没有人工确认，tunnel 反而会让风险更快接入生产流程。
后面企业大概率会做 MCP gateway。它要统一处理 OAuth、tool allowlist、参数校验、审计、限流、PII redaction 和危险动作审批。
## 和 5 月 6 日那篇的关系
5 月 6 日那篇 Managed Agents 更新的重点是运营能力：
- **Dreaming**：处理长期记忆腐化。Agent 跑多了，memory store 里会出现重复经验、过期 workaround、互相冲突的偏好。Dreaming 会根据过去 session 和已有 memory store 生成整理版 memory。
- **Outcomes**：处理交付验收。开发者写 rubric，Managed Agents 用独立 grader 检查产物，比 prompt 里写"请认真检查"更接近测试、lint、review gate。
- **Multi-agent orchestration**：lead agent 可以把不同子任务分给 specialist agents，每个 agent 有独立 session thread，同时共享文件系统和容器。
5 月 18 日这次更新补的是企业边界：你的代码在哪跑，你的私有工具怎么接。
两篇放在一起看，Anthropic 的路线就清楚了：先把 Agent 做成可运营系统，再把这个系统接进企业自己的运行环境。
## 社区质疑被回应了一半
HN 和 Reddit 上早期对 Managed Agents 的讨论，质疑点很集中：
- **锁定**：只能用 Claude，不能混用 Gemini、OpenAI、开源模型
- **成本和 token 不透明**：托管平台跑一次长任务，钱花在哪些阶段，不像自研 harness 那么清楚
- **正确性**：Agent 长时间运行后，产物错了谁发现
- **数据边界**：企业代码、内部工具、私有文档怎么接进来
5 月 6 日的 Outcomes、Dreaming、多 Agent 编排回应了正确性、记忆和复杂任务拆分。5 月 18 日的 self-hosted sandbox 和 MCP tunnels 回应了数据边界和私有工具连接。
还没完全回应的是模型锁定、成本透明度、跨模型 harness、失败恢复和 token 归因。这些会继续是开源 Agent 框架、自研平台、LangGraph/Temporal 组合方案攻击的地方。
## 和 Claude Code、Cursor、自研 Agent 的关系
Claude Managed Agents 不是 Claude Code 的替代品。
Claude Code 更适合本地 CLI 协作：人和 Agent 一起读代码、改文件、跑测试。Cursor 和 Windsurf 更偏 IDE 内上下文。Codex 类编码代理更偏自动完成具体代码任务。OpenCode、OpenClaw、自研 loop 的优势是可控、可改、多模型、自托管。
Managed Agents 站在另一层：长任务控制平面、异步执行、session log、sandbox、MCP、outcomes、多 Agent 编排、事件追踪。
更可能的工作方式是：开发者继续用 CLI/IDE Agent 做交互式开发，后台日志分析、文档 QA、报告生成、批量检查、内部流程自动化交给 Managed Agents。
## 真正要验证的不是功能表
如果团队要试这次更新，不建议做一堆低价值 ablation。更应该围绕决策点做小实验：
**先验证 self-hosted sandbox 能不能过安全评审**：选一个只读内部仓库分析任务，worker 只返回结构化摘要和少量证据片段。如果必须把完整代码大量返回 session 才能完成任务，这个场景就不适合作为第一批。
**再验证 MCP tunnel 能不能承载真实私有工具**：先开放 read-only tool，限制参数枚举，返回去敏结果，记录所有调用。如果 tool schema 必须暴露太多内部系统结构，先别扩。
**然后验证 Outcomes 能不能发现真实错误**：rubric 不要写"质量高""内容完整"，要写必须覆盖哪些文件、必须引用哪些证据、哪些错误不能出现、失败时返回什么格式。
**最后看成本和延迟能不能解释**：至少要能把一次任务拆成 session 时长、tool call 次数、worker 执行时间、grader 轮数、人工返工次数。
## 总结
这次更新的重点不在"支持自托管沙箱"和"支持 MCP 隧道"两个名词，而在 Anthropic 对企业 Agent 架构的选择。
控制平面继续托管化，执行环境开始客户侧化，私有工具连接开始标准化，质量、记忆、编排继续平台对象化。
这条路线会吸引不想自建 Agent 平台的企业，也会继续被开源和自研路线挑战。判断它适不适合一个团队，不要先看功能够不够多，先看四件事：**数据流能不能审计，工具权限能不能收紧，outcome rubric 能不能发现真实错误，成本能不能按任务解释。**
这四件事能过，Managed Agents 才具备接进生产工作流的条件。