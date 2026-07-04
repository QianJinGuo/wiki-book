# AI Gateways vs MCP Gateways: What Security Teams Need to Know

## Ch11.078 AI Gateways vs MCP Gateways: What Security Teams Need to Know

> 📊 Level ⭐⭐ | 10.6KB | `entities/ai-gateways-vs-mcp-gateways-what-security-teams-need-to-know.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ai-gateways-vs-mcp-gateways-what-security-teams-need-to-know.md)

## 摘要
AI 网关（AI Gateway）与 MCP 网关（MCP Gateway）是两个被频繁混淆但本质不同的技术层。前者位于代理与大语言模型之间，专注推理路由、成本控制和可观测性；后者位于代理与 MCP 服务器（工具）之间，专注身份认证、工具注册和细粒度访问控制。两者都是 AI 安全架构的必要组件，但均无法独立构成完整的安全解决方案。

## 关键要点
- **技术领域**：AI 安全 / 网关架构
- **来源**：Noma Security 技术博客
- **评分**：value=9, confidence=9, product=81

## 深度分析
### 一、架构定位的本质差异
AI 网关与 MCP 网关的核心区别在于它们所管理的流量类型和在请求路径中的位置。AI 网关处理的是**代理与模型之间的对话流**——提示词、模型响应、以及作为文本嵌入在提示中的工具调用结果。而 MCP 网关处理的是**代理与工具之间的交互流**——工具调用的请求、参数和响应。
这种架构差异带来了一个根本性的不对等：AI 网关拥有用户意图的完整上下文（提示词），但对工具执行的结果只有被动可见性；MCP 网关拥有工具调用的精确记录，但缺乏用户的原始意图和模型的推理过程。这种信息不对称意味着**两个网关都无法独立重建完整的攻击链**。

### 二、「可见」不等于「可控」
文章揭示了一个关键的认知偏差：安全团队容易将「流量经过网关」等同于「流量受网关控制」。实际上，两者之间存在显著落差。
对于 AI 网关，覆盖范围受限于**企业自建应用和受控代理**。Microsoft Copilot Studio、Salesforce AgentForce 等 SaaS 代理平台直接与厂商后端通信，根本无法通过企业自有的 AI 网关路由。对于 MCP 网关，挑战更为严峻：本地代理（如 Claude Code）通过 stdio 传输启动本地 MCP 服务器，不产生任何网络流量，网络层的 MCP 网关完全不可见。即使在理想条件下成功配置，开发者压力下的「绕过网关」操作也屡见不鲜。

### 三、会话级行为上下文是真正的安全缺口
文章的核心论点在于：**代理安全的威胁从来不是单一恶意事件，而是跨越多个步骤的序列**。无论是间接提示注入（Indirect Prompt Injection）、工具投毒（Tool Poisoning）还是过度代理（Excessive Agency），它们都依赖一个前提——安全系统只能看到请求级别的局部信息，无法重建因果链。
文章引用的 Noma Labs 研究成果（ForcedLeak、Pandora's Claw、ContextCrush）都是典型案例。以间接提示注入为例：攻击载荷嵌入在 CRM 记录中，代理通过工具调用读取该记录后跟随注入指令行事——整个过程中 AI 网关看到的是「正常的提示-响应流」，MCP 网关看到的是「合法的工具调用」，但两者都无法关联到「攻击者通过数据注入实现的最终数据外泄」。

### 四、规则引擎的局限性被低估
MCP 网关的访问控制基于静态规则：「此代理不能发送邮件」或「此代理不能删除文件」。这种模式的问题在于它必须极度保守才能避免误伤，这直接牺牲了代理的核心价值。真正需要的安全策略远比这复杂：**允许代理在正常业务上下文中发送邮件，但当代理在同一次会话中访问了敏感客户数据后试图外发时，触发阻断**。这种检测逻辑要求在会话级别维护状态并关联跨事件的行为模式——而这超出了任何网关的设计边界。

### 五、市场正在 convergence，但安全缺口不会随之消弭
Kong 等主流平台已经开始将 MCP 网关功能整合进现有 AI 网关产品，市场正在向统一基础设施层演进。文章预测一年内 AI 网关与 MCP 网关的区分将变得「 largely academic」。然而这里存在一个关键的逻辑跳跃：**基础设施层的整合不等于安全能力的覆盖**。路由、认证、日志能力的合并是工程问题；行为检测、会话关联、动态执法是安全工程问题。两者解决的不是一个层面的问题。

### 六、Hooks 模式可能是新的方向
文章提到的 Hooks 机制值得关注。Hooks 不是在网络层代理流量，而是在代理执行层每个阶段（提示前后、工具调用前后、模型响应前后）插入拦截点。由于运行在代理内部而非网络上，Hooks 能覆盖 stdio 传输的本地 MCP 调用、原生 bash 执行、文件系统访问和 Skills 调用——这些对所有网络层网关都是盲区。Cursor、Claude Code 等编码助手的企业版已开始构建这类机制。

### 七、「Maker's Token」问题暴露了身份治理的深层复杂性
当业务用户在 Microsoft Copilot Studio 上创建代理并共享给团队时，代理以创建者凭据运行而非当前用户——「maker's token」问题导致权限继承失控，一个面向内部的 HR 代理可能向整个公司暴露 HR 数据。MCP 网关可以在工具层面做 RBAC，但无法解决运行时动态身份解析的问题：谁在驱动这个代理？这个用户与这个代理的权限关系是什么？这种更深层的身份感知超出了网关架构的范畴。

## 实践启示
### 针对安全团队的建议
**1. 网关是必要条件，非充分条件**
不要将 AI 网关或 MCP 网关视为 AI 安全解决方案。它们是基础设施组件，分别解决推理流量可见性和工具访问控制的问题。真正的安全策略需要「网关提供管道，专业安全平台提供大脑」的协同模式。
**2. 部署前明确评估覆盖缺口**
在引入任何网关技术前，必须评估：有多少比例的代理流量在网关覆盖范围之外？预构建 SaaS 代理、本地编码助手、云端托管代理的占比各是多少？对于覆盖盲区，需要补充基于 Hooks 的端点级防护或专门的 AI 安全平台。
**3. 会话级检测能力是当前最大缺口**
投资方向应聚焦于能够关联跨事件行为模式、维持会话状态、实现动态策略判断的安全平台，而非仅依赖网关层面的请求级规则。OWASP Top 10 for Agentic Applications 2026 中列出的威胁（工具投毒、提示注入、过度代理）无一能通过静态规则有效检测。
**4. MCP 网关的 enforcement 挑战需要工程化应对**
强制开发者配置代理路由通过 MCP 网关是实施中的最大难点。需要将网关配置纳入开发环境标准化流程（如 IDE 插件、本地代理模板），并通过 EDR/端点遥测补充网络层监控的不足。
**5. 监控「maker's token」风险**
在采购 MCP 网关时，确认其是否支持运行时动态身份解析，能够区分代理创建者和当前交互用户，并基于实际运行时身份而非静态配置应用访问策略。

### 针对安全架构的长期规划
- **短期（0-6 个月）**：部署 AI 网关处理自建应用的推理可见性；引入 MCP 网关管理工具注册和基础访问控制；评估现有 AI 安全平台是否能覆盖会话级检测需求
- **中期（6-18 个月）**：随着 MCP 生态系统成熟，将 MCP 网关覆盖扩展至编码助手和工作站；评估 Hooks 方案作为 stdio 传输盲区的补充
- **长期（18 个月+）**：规划向统一 AI 安全平台收敛，网关层负责基础设施治理，安全平台层负责行为检测和动态执法

## 关联阅读
- [Securing AI Agents: How AWS and Cisco AI Defense Scale MCP and A2A](ch04/277-ai.md) — MCP 和 A2A 协议在企业级部署中的规模实践
- [AI Tool Poisoning Exposes a Major Flaw in Enterprise Agent Security](ch04/277-ai.md) — 工具投毒作为企业代理安全的核心缺陷
- [AI MAP: Security Testing for AI Agent Infrastructure — Bishop Fox](ch04/277-ai.md) — Bishop Fox 的 AI 代理安全测试框架
- [AgentCore Runtime 部署 Apache Doris MCP Server](ch04/277-ai.md) — MCP Server 部署实践
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ai-gateways-vs-mcp-gateways-what-security-teams-need-to-know.md)

---

