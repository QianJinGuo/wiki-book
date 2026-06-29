# 为了让agent更安全的工作，有多少人操碎了心

## Ch04.500 为了让agent更安全的工作，有多少人操碎了心

> 📊 Level ⭐⭐ | 2.9KB | `entities/ath-agent-trust-handshake-protocol.md`

## 为了让agent更安全的工作，有多少人操碎了心

## 深度分析

本文来自"运维有术"公众号（术哥无界），分析 Agent 权限安全问题以及 2026 年 5 月新发布的 ATH 三方可信握手协议。

**核心问题**：Agent 权限问题的本质是"权限组合后的涌现能力"——单个权限无害，组合起来可能越界，传统 RBAC 根本管不住。

**现有方案缺陷**：
- **MCP**：无用户/服务端参与方，权限要么全给要么全不给；Context Poisoning 投毒风险；CVSS 9.4/9.6 高危漏洞
- **A2A**：用户未纳入信任链路，Agent Card 无法验证身份可信度
- **GUI 自动化**：系统级权限过度、操作不可审计、数据边界模糊

**ATH 三方握手架构**：
1. 前置：用户预授权
2. 第一阶段（1-4步）：双向身份验证（DID + 非对称加密）
3. 第二阶段（5-8步）：**服务端向用户二次确认**（核心创新，解决用户认知盲区）
4. 第三阶段（9步）：颁发短期访问令牌

**Scope Intersection**：`有效权限 = 服务方审批 ∩ 用户授权 ∩ 智能体请求`。交集为空时禁止颁发令牌。

**与 OAuth 2.0 关系**：在 OAuth 基础上增加第二个必答问题"服务方是否批准该智能体"。PKCE 强制，访问令牌绑定四元组。

## 实践启示

1. **MCP 安全缺陷**：Context Poisoning 投毒是架构级问题，接入 MCP 服务器需严格验证工具描述来源
2. **三方授权必要性**：用户必须有最终否决权——服务端 + 用户 + Agent 三方缺一不可
3. **Scope Intersection 价值**：即使用户误授权，服务端未批准的权限也拿不到；即使 Agent 被批准，它没请求的权限也不会被授予
4. **最小权限 + 短期令牌**：7200 秒（2小时）过期，到期需重新握手
5. **企业级落地**：网关模式不改原有代码，适合企业统一管控

## 相关实体
- [From Agent Protocol To Harness Skill](/ch04-351-from-agent-protocol-to-harness-skill/)
- [Building A Secure Auth Code Flow Setup Using Agentcore Gatew](/ch04-255-building-a-secure-auth-code-flow-setup-using-agentcore-gatew/)
- [Ai Tool Poisoning Exposes A Major Flaw In Enterprise Agent Security V2](/ch04-277-ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-s/)
- [Wow Harness V3 Governance Protocol](/ch05-028-wow-harness-v3-ai-开发的治理协议/)
- [Canvas Breach Disrupts Schools Colleges Nationwide](/ch12-031-canvas-breach-disrupts-schools-colleges-nationwide/)
- MOC

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ath-agent-trust-handshake-protocol.md)

---

