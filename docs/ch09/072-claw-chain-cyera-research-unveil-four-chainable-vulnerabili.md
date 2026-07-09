# Claw Chain: Cyera Research Unveil Four Chainable Vulnerabilities in OpenClaw

## Ch09.072 Claw Chain: Cyera Research Unveil Four Chainable Vulnerabilities in OpenClaw

> 📊 Level ⭐⭐ | 8.9KB | `entities/claw-chain-cyera-research-unveil-four-chainable-vulnerabilities-in-openclaw.md`

## 核心要点
- Claw Chain: Cyera Research Unveil Four Chainable Vulnerabilities in OpenClaw

## 关键洞察
Claw Chain: Cyera Research Unveil Four Chainable Vulnerabilities in OpenClaw
Vulnerability Class: Sandbox escape, privilege escalation, data exposure
CVE IDs: CVE-2026-44112, CVE-2026-44115, CVE-2026-44118, CVE-2026-44113
Highest CVSS Score: 9.6 — CRITICAL (CVE-2026-44112)
Affected Product: OpenClaw (all versions prior to April 23, 2026 patches)
Attack Vector: Agent-mediated — prompt injection, malicious plugin, supply-chain input
Exposed Instances: ~65,000 (Shodan) · ~180,000 (Zoomeye) public-facing OpenClaw servers
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claw-chain-cyera-research-unveil-four-chainable-vulnerabilities-in-openclaw.md)

## 深度分析
### 漏洞链条设计：AI Agent 作为攻击放大器
Cyera 发现的四个漏洞并非孤立存在，而是构成一条完整的攻击链。核心洞察是：**攻击者不需要直接攻击 OpenClaw 服务器，而是让 AI Agent 自身成为攻击的执行者**。每个步骤在传统安全控制看来都是「正常 Agent 行为」，这使得检测和防御极度困难。
关键利用路径：
1. **初始入口**：通过恶意插件或 prompt injection 注入恶意内容
2. **数据窃取**：CVE-2026-44113（TOCTOU 读逃逸）+ CVE-2026-44115（环境变量泄露）组合，窃取 API keys、tokens、凭证
3. **权限提升**：CVE-2026-44118（MCP Loopback 提权）利用 senderIsOwner 标志信任缺陷跨越会话边界
4. **持久化**：CVE-2026-44112（TOCTOU 写逃逸）实现文件系统持久化

### 技术细节分解
**CVE-2026-44112 — TOCTOU Filesystem Write Escape | CVSS 9.6 CRITICAL**
Time-of-check/time-of-use 竞态条件允许攻击者在 OpenShell 沙箱验证与实际写入之间的时间窗口内，将写操作重定向到沙箱外部。这是四链中最严重的漏洞，CVSS 9.6 分值意味着可远程利用并完全控制系统。
**CVE-2026-44115 — Execution Allowlist Env-Vars Disclosure | CVSS 8.8 HIGH**
命令验证与 shell 执行之间的间隙，允许环境变量在未引用的 heredoc 中被展开。由于 heredoc 不经过常规的 quoted 解析，API keys 和 tokens 可被直接泄露。
**CVE-2026-44118 — MCP Loopback Privilege Escalation | CVSS 7.8 HIGH**
OpenClaw 对 client-controlled 的 senderIsOwner 标志缺乏会话级别的认证验证，导致攻击者可跨越权限边界执行操作。
**CVE-2026-44113 — TOCTOU Filesystem Read Escape | CVSS 7.7 HIGH**
与 CVE-2026-44112 相同的 TOCTOU 模式，但作用于读操作，可暴露系统文件和凭证。

### 攻击面分析
暴露规模：Shodan 索引约 65,000 个，Zoomeye 索引约 180,000 个面向公网的 OpenClaw 服务器。这一数字本身就说明了问题——OpenClaw 作为开源 autonomous AI agent 平台，被大量部署在生产环境中，而其安全模型在 Agent 化攻击面前存在根本性缺陷。
核心矛盾：AI agents 已成为主要执行面，但围绕它们的安全模型尚未跟上。传统安全控制基于「用户行为」或「进程行为」建模，而 Agent 介导的攻击完全模糊了这一边界——攻击链的每一步都是合法的 Agent 操作。

## 实践启示
### 对于 OpenClaw 部署者
1. **立即修补**：所有 2026 年 4 月 23 日之前的版本均受影响。如果无法立即升级，启动网络层隔离，限制 OpenClaw 实例的出站连接和文件系统访问范围。
2. **网络隔离**：将 OpenClaw 部署在独立的网络分区，禁用或严格限制 MCP 协议的 loopback 连接。senderIsOwner 验证缺陷意味着同主机上的其他服务也可能被影响。
3. **插件来源审计**：严格限制插件来源，仅使用经过代码审计的插件。对任何涉及文件操作或环境变量访问的插件进行人工复核。
4. **凭证轮换**：鉴于环境变量泄露风险（CVE-2026-44115），建议对所有通过环境变量传入的 API keys 和 tokens 进行轮换。

### 对于 AI Agent 平台设计者
1. **TOCTOU 防御**：文件系统操作应在验证点完成所有安全检查，或使用不可变的文件描述符而非路径名。
2. **命令执行沙箱**：heredoc、here-string 等 shell 特性的安全边界需要重新评估。建议对所有涉及变量展开的命令使用严格的引用和转义策略。
3. **会话边界验证**：client-controlled 的标志（如 senderIsOwner）必须经过服务端验证，不能依赖客户端声明。
4. **安全模型范式转换**：从「保护用户」转向「保护 Agent」——Agent 的行为空间远超传统用户，其每一步操作都可能是攻击链的一环。需要在 Agent 层面实现细粒度的操作审计和动态策略控制。

### 对于安全研究社区
Claw Chain 再次验证了一个趋势：**AI Agent 正在成为下一代攻击链的核心枢纽**。与传统漏洞利用不同，这类攻击难以用现有的 EDR/XDR 规则检测，因为每个步骤都是「正常」的 Agent 行为。建立 AI Agent 攻击的检测框架需要：

- Agent 行为图谱建模（而非基于系统调用的规则）
- 跨操作步骤的关联分析（检测长链路攻击链）
- 来自 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 等框架的安全设计原则融入 Agent 开发工作流

## 相关实体
- [OpenClaw Agent 可观测性体系 — Session 审计日志 + OTEL + SLS](../ch01/1108-openclaw-agent.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-landscape.md)

---

