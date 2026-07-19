# Offensive Security Blog

## Ch12.006 Offensive Security Blog

> 📊 Level ⭐ | 8.4KB | `entities/offensive-security-blog.md`

> -> [offensive-security-blog](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/offensive-security-blog.md)
## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/moc/cybersecurity-privacy.md)

- [CloudSectiDbits: Masso - Cognito SSO Bypass](../ch11/237-cloudsectidbits.html)

## 近期热门文章
### Otto-Support: Supply Chain Risks in MCP Servers（2026-05-13）
本文探讨了 MCP 服务器本身的供应链风险。作者 Derek Rush 研究了当 MCP 服务器本身是攻击者时会发生的攻击路径。文章结合了 postmark-mcp 和 ClawHub 的实际妥协案例，以及 otto-support 的 selfpwn 模块，展示了敌对 MCP 服务器在运行瞬间能访问什么。
核心观点：MCP 工具的供应链风险是结构性的，postmark-mcp 和 ClawHub 的妥协使其具体化。攻击者可以通过破坏或伪装 MCP 服务器来获取敏感访问权限。

### Introducing Joro: Using AI to Build Security Tooling（2026-05-12）
Bishop Fox 发布 Joro，这是一个协作式 Web 渗透框架，几乎完全用 AI 构建。从拦截代理到 C2 集成，本文涵盖了该工具的构建方式、功能以及 AI 辅助安全工具开发现状。

### Otto Support - The Confused Deputy（2026-05-08）
探讨「混乱副手」（Confused Deputy）攻击。当 Agent 读取攻击者控制的内容并使用自己的权限对其执行操作时，用户名称会出现在每条审计日志条目中。从 Microsoft Copilot 到 ConfusedPilot，本文逐步讲解混乱 deputy 攻击的原理和有助于控制影响的多层控制机制。

### Deep Dive into Arista NG Firewall Vulnerabilities（2026-02-09）
Bishop Fox 在 Arista NG Firewall 17.4 版本中发现了六个漏洞，包括允许 root 级代码执行的关键命令注入漏洞，其中一些可通过链接攻击通过单个恶意链接利用。作者 Ronan Kervella 提供了详细分析。

### Get the Most from Testing Your Applications（2026-02-04）
本文指出渗透测试失败不是因为测试人员漏掉了漏洞，而是因为没有人同意测试应该回答什么问题。在当今云和 AI 驱动的应用中，范围界定、执行和后续跟踪决定了结果是推动真正决策还是仅仅成为归档报告。

### Why the Board Belongs in the War Room（2026-01-22）
董事会可能不在第一线，但他们总是在爆炸范围内。危机模拟帮助董事亲身体验不确定性，加强治理、信任和决策——这些都在头条新闻出现之前。

## 深度分析
### 1. MCP 安全风险——AI 工具链的新盲点
Otto-Support 关于 MCP 服务器供应链风险的文章揭示了 AI 工具链中的新盲点。传统安全思维关注的是「用户使用 MCP 服务器」的安全性，但这篇文章的洞见是「MCP 服务器本身可能成为攻击面」。
当用户授权一个 MCP 服务器时，实际上是给予了该服务器相当大的信任——可以访问文件系统、API、其他服务。如果 MCP 服务器本身被攻破或本身就是恶意的，攻击者可以：读取用户数据、模仿用户执行操作、在系统中横向移动。这种风险在 postmark-mcp 和 ClawHub 的实际案例中已得到验证。
这与 [Boris Cherny 访谈中提到的 MCP 作为 AI 工具连接标准](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-之父最新访谈编程已经结束harness-将消失claude-code-将只有-100-行代码loop-才是未来.md) 形成有趣对照——MCP 一方面是 AI Agent 的能力放大器，另一方面也带来了新的攻击向量。

### 2. AI 辅助安全工具的工业化
Joro 的发布标志着 AI 辅助安全工具进入工业化阶段。这个框架「几乎完全用 AI 构建」，从拦截代理到 C2 集成，表明安全工具开发本身也在被 AI 变革。
这意味着：安全工具的迭代周期将大幅缩短，攻击者和防御者的工具都在快速进化。同时也带来新问题——当安全工具本身可以由 AI 生成时，如何确保这些工具没有后门或漏洞？

### 3. Confused Deputy 问题在 Agent 时代的复现
Confused Deputy 攻击是一个经典安全问题，但在 AI Agent 时代变得尤为突出。当 Agent 可以自主执行操作、与其他 Agent 通信、调用外部服务时，「权限边界」变得模糊。一个被设计用来执行特定任务的 Agent，如果被诱导读取攻击者控制的内容，就可能在审计日志中留下受害用户的名字。
从 Microsoft Copilot 到更广泛的 Agent 系统，这种攻击模式正在被系统性地研究。多层控制机制是必要的，但根本解决方案可能需要重新思考 Agent 的权限模型和审计机制。

### 4. 渗透测试行业的范式转变
「Get the Most from Testing Your Applications」提出了一个深刻问题：渗透测试的价值不在于发现多少漏洞，而在于「是否回答了对的问题」。在云和 AI 驱动的应用中，传统的渗透测试方法论正在受到挑战。
原因包括：AI 生成的代码可能有独特的漏洞模式、云原生架构的攻击面与传统应用完全不同、Agent 系统的行为难以预测。这要求渗透测试行业从「漏洞发现」转向「风险评估」和「攻击场景模拟」。

### 5. 安全与业务的融合
Board Belongs in the War Room 一文强调董事会应参与危机模拟。这反映了安全行业的一个趋势：安全不再是纯粹的技术问题，而是治理和战略问题。随着 AI 系统变得更加普及，网络安全的失败可能导致业务层面的灾难性后果。

## 实践启示
### 给安全工程师的建议
1. **审视 MCP 供应链安全**：在使用第三方 MCP 服务器前进行安全评估，了解其代码来源、维护历史和权限需求。考虑为 MCP 连接实现额外的沙箱和监控层。
2. **建立 Agent 安全模型**：当构建或部署 AI Agent 时，明确其权限边界、实现最小权限原则、记录所有外部通信。特别是 Agent 间的通信（如 Boris Cherny 提到的 Slack 上 Agent 间自主通信）需要额外的审计机制。
3. **更新渗透测试方法论**：传统的渗透测试范围（OWASP Top 10、网络渗透等）已不够。需要扩展到 AI 模型安全、Agent 行为分析、MCP 服务器供应链等新领域。

### 给开发团队的建议
1. **将安全融入 AI 开发流程**：参考 Joro 的经验，使用 AI 辅助开发安全工具，同时确保 AI 生成代码的安全审查流程。特别是在使用 AI 生成安全相关代码时，人工审查不可替代。
2. **关注 Arista 防火墙类漏洞**：命令注入漏洞仍是大问题，特别是在网络设备和基础设施软件中。确保及时打补丁、实施网络分段、监控异常命令执行。
3. **建立危机响应文化**：董事会参与危机模拟的实践值得借鉴。定期进行安全事件演练，确保技术团队和业务领导层对安全事件有共同的理解和响应能力。

### 给企业管理者的建议
1. **重新定义渗透测试价值**：不要以「发现漏洞数量」衡量渗透测试的 ROI，而是关注「解决了什么业务风险」。与测试团队明确目标，确保测试结果能推动实际改进。
2. **投资 AI 安全**：随着 AI/Agent 系统在企业中的部署，需要专门的安全预算和能力建设。包括红队测试、AI 特异性漏洞评估、Agent 权限审计等。
3. **将安全纳入治理框架**：安全事件的影响已超出技术范畴，波及业务连续性和声誉。董事会应定期了解安全态势，参与重大安全决策。

## 主题导航
>

---

