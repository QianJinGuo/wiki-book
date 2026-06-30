# 为了让agent更安全的工作，有多少人操碎了心

## Ch04.415 为了让agent更安全的工作，有多少人操碎了心

> 📊 Level ⭐⭐ | 5.8KB | `entities/ath-agent-trust-handshake-protocol.md`

# 为了让agent更安全的工作，有多少人操碎了心

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ath-agent-trust-handshake-protocol.md)

## 摘要

本文系统分析了 Agent 权限安全的核心矛盾——「单个权限无害，组合起来可能越界」，传统 RBAC 模型无法管控 LLM 非确定性决策下的权限组合涌现。在对比 MCP、A2A、CLI/GUI 自动化三类现有方案的缺陷后，详细介绍 2026 年 5 月由中国信通院联合腾讯、华为、中兴等发布的 ATH（Agent Trust Handshake）三方可信握手协议。ATH 的核心创新是引入用户作为独立第三方参与方，通过 Scope Intersection（三方权限交集）机制确保最终有效权限 = 服务方审批 ∩ 用户授权 ∩ 智能体请求。

## 核心要点

### Agent 权限问题的本质

- 传统软件行为确定性——点击按钮 A 就执行操作 A。Agent 行为由 LLM 动态决策，是概率性的，同一请求可能走完全不同的执行路径
- **权限组合涌现**：单个权限无害，组合起来可能越界。RBAC 管不住这种涌现能力
- 历史类比：iOS 6 引入运行时权限授权，行业花约 5 年才形成按需授权模式；数据库从表级权限演进到 RLS、Column Masking、ABAC

### 现有方案的三类缺陷

**MCP 安全根基不稳**：
- Context Poisoning（上下文投毒）是架构级问题，OWASP 将 Prompt Injection 列为 LLM 应用头号风险（LLM01）
- 2026 年 4 月 OX Security 报告：MCP 生态影响超 3.2 万个代码仓库，Shodan 上 7,374 台公开脆弱服务器，估算暴露超 20 万台
- 高危 CVE：CVE-2025-49596（CVSS 9.4）、CVE-2025-6514（CVSS 9.6）
- 核心问题：只定义模型到工具的通信，没有引入用户和服务端作为独立授权参与方

**A2A 信任鸿沟**：Agent Card 只声明「我能做什么」，无法验证身份可信度，用户未被纳入信任链路

**GUI 自动化**：系统级权限过度、操作不可审计、屏幕截图可能捕获密码和通知内容

### ATH 三方可信握手架构

ATH 由`中国信通院联合腾讯、华为、中兴、三大运营商和港中深`于 2026 年 5 月发布。

**六大设计原则**：用户主权、三方参与、可信握手、去中心化（非对称加密）、最小权限（到期自动失效）、全程可追溯（加密存证）

**9 步握手流程**：
- 前置：用户预授权——签署授权凭证，明确 Agent 可代表自己行事的范围
- 第一阶段（步骤 1-4）：双向身份验证。Agent 携带 DID、公钥、能力清单和随机数 A 发起请求；服务端验证后返回身份信息 + 对随机数 A 的签名 + 随机数 B；Agent 验证后对随机数 B 签名发回
- 第二阶段（步骤 5-8）：可信握手协商。Agent 请求具体访问权限 + 用户预授权凭证；**服务端向用户发起二次确认**（用户可同意、拒绝或修改授权范围）
- 第三阶段（步骤 9）：密钥协商 + 颁发短期访问令牌 + 建立加密通道

### Scope Intersection：三方权限交集

```
Effective Scope = Agent Approved Scopes ∩ User Consented Scopes ∩ Requested Scopes
```

这是 ATH 最关键的安全创新：
- 用户误授权 + 服务端未批准 → 权限拿不到
- Agent 被批准 + 没请求的权限 → 不会被授予
- 交集为空时 → 禁止颁发令牌

### 与 OAuth 2.0 的关系

ATH 建立在 OAuth 2.0 之上而非替代。OAuth 回答「用户是否同意？」，ATH 增加第二个必答问题「服务方是否批准该智能体？」。强制 PKCE（RFC 7636）S256，访问令牌绑定 `(agent_id, user_id, provider_id, scopes)` 四元组。

### 双部署模式

| 模式 | 架构 | 适用场景 |
|------|------|----------|
| 网关模式 | Agent → ATH Gateway → 后端服务 | 不改原有代码，企业统一管控 |
| 原生模式 | Agent 直连 ATH 原生服务 | 性能更高、延迟更低 |

网关模式三大组件：Agent Registry（身份验证和能力策略）、Authorization Engine（权限交集计算和审计日志）、OAuth Bridge（OAuth 委托和令牌管理）

## 实践启示

1. **MCP 安全缺陷是架构级的**：Context Poisoning 不是配置问题，接入 MCP 服务器需严格验证工具描述来源，关注 CVE 修复
2. **三方授权的必要性**：用户必须有最终否决权——服务端 + 用户 + Agent 三方缺一不可，任何两方模型都有盲区
3. **Scope Intersection 的工程价值**：即使用户误授权，服务端未批准的权限也拿不到。这是对「权限过度授予」的结构性防护
4. **最小权限 + 短期令牌**：7200 秒（2 小时）过期，到期需重新握手。这强制了权限的时效性约束
5. **网关模式降低落地门槛**：不改原有代码即可接入 ATH，适合企业渐进式改造

## 相关实体

- [Agent Protocol 到 Harness Skill](ch04/354-from-agent-protocol-to-harness-skill.md)
- [AgentCore Gateway 认证](ch04/256-building-a-secure-auth-code-flow-setup-using-agentcore-gatew.md)
- [AI 工具投毒漏洞](ch04/150-ai.md)
- [Harness V3 治理协议](ch05/015-harness.md)
- [MCP 12 设计模式](ch04/503-agent.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-privacy-landscape.md)

---

