## Ch08.018 AP2 协议实测：Mandate 机制、Task 状态机与多 Agent 支付

> 📊 Level ⭐⭐⭐ | 8.3KB | `entities/ap2-agent-payments-protocol-hands-on-analysis.md`

# AP2 协议实测：Mandate 机制、Task 状态机与多 Agent 支付

Google AP2（Agent Payments Protocol）工程实测分析。基于官方 Human-Present 场景完整复现，记录协议细节和工程踩坑——密钥路径一致性、CartMandate 结构、SD-JWT 选择性披露、Task 终态陷阱、多 Agent Token 消耗乘法增长。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ap2-agent-payments-protocol-hands-on-analysis.md)

## 核心问题

当 Agent 开始替用户做决定、甚至替用户花钱时，怎么证明这是用户本人授权的，又怎么保证 Agent 不会乱花钱。AP2 把商户对交易的承诺变成可验证的数字凭证，而不是依赖 Agent 的口头描述。

→ [AgentCore Payments 与 x402 协议](ch11-066-agentcore-payments-与代理商务创新-技术深度解析.html) — AWS 的对标方案

## 实测踩坑

### 1. 密钥路径一致性

Credentials Provider 启动时生成 ECDSA 密钥对，公钥写到统一路径。Merchant Payment Processor 验证时去同一路径读公钥。如果四个 Agent 不在同一个 shell 环境里启动，路径对不上——报 Agent-provider public key not found，支付流程卡死。官方文档完全没提。

### 2. CartMandate 结构

```json
{
  "id": "cart_2",
  "merchant": { "name": "Generic Merchant" },
  "line_items": [{ "item": { "title": "12-cup drip coffee maker", "price": 3950 }, "quantity": 1 }],
  "currency": "USD",
  "status": "incomplete",
  "iat": 1781686213,
  "exp": 1781689813
}
```

- 价格单位是分（3950 = 39.50 美元），规避浮点精度问题
- status incomplete → 用户确认后才封存
- 一小时有效期，ES256 签名

### 3. SD-JWT 选择性披露

支付环节用 SD-JWT 而非普通 JWT。给 Payment Processor 只展示金额和收款方，不展示卡号；给审计方再展示其他字段。隐私保护直接嵌进数据格式。

### 4. Task 终态陷阱

A2A 协议 Task 生命周期：completed、failed、cancelled 都是终态，一旦进入就不能再接收新消息。支付重试必须在应用层创建新 Task，不能在失败的 Task 上继续操作。

这和 HTTP 无状态模型完全是两种思路——每个 Task 都是有状态、有生命周期的实体。

### 5. 多 Agent Token 消耗

一次确认购买消耗十次以上 API 调用（Shopping Agent 思考→调工具→委托子 Agent→子 Agent 思考→回传）。多 Agent 系统的 token 消耗不是线性叠加，而是**乘法增长**。Gemini 免费套餐每分钟 15 次请求限制，跑不了几轮。

## 竞争格局

| 协议 | 主导方 | 定位 |
|------|--------|------|
| AP2 | Google | 密码学背书的商务协议 |
| ACP | OpenAI × Stripe | Agentic Commerce Protocol |
| ACT | 支付宝 + 千问 + 淘宝闪购 + 阿里云百炼 | 国内监管 + 本土支付生态 |
| APOP / ClawTip / AI Skill | 国内各方 | 碎片化 |

蚂蚁数科 Anvita 平台让 Agent 持有资产、链上结算。蚂蚁 AI 支付累计 3 亿笔（2 亿最近两月新增）。

→ [AgentCore Payments 与 x402 协议](ch11-066-agentcore-payments-与代理商务创新-技术深度解析.html) — AWS AgentCore 支付方案

## 协议局限

- CartMandate 一小时有效期 + 单次 OTP → Agent 自主跨平台长周期任务场景会暴露局限
- 更细粒度的授权范围控制是下一代协议方向
- 蚂蚁 Anvita / Token Pay 指向更远方向：Agent 自己成为有经济主体资格的参与方

## 深度分析

### 密码学背书 vs 口头信任的范式转变

AP2 的核心创新不在于"让 Agent 能支付"——Stripe API 早就做到了——而在于把商户对交易的承诺从自然语言层面提升到密码学可验证层面。CartMandate 用 ES256 签名，任何拿到商户公钥的一方都可以独立验签，不需要信任 Agent 的转述。这解决了一个根本问题：在多 Agent 协作中，中间 Agent 可能被篡改或幻觉，但密码学签名无法伪造。

### SD-JWT 的隐私工程设计

SD-JWT 选择性披露机制让同一份凭证在不同场景下展示不同字段——支付处理器只看到金额和收款方，审计方看到完整信息。这不是应用层的访问控制，而是数据格式层面的隐私保证。对比传统 JWT 的"全有或全无"模式，SD-JWT 为 Agent 间敏感数据传递提供了更细粒度的隐私屏障。

### Task 有状态模型的工程代价

A2A 协议的 Task 生命周期设计（completed/failed/cancelled 均为终态）带来了显著的工程复杂度。支付重试不能在失败的 Task 上继续，必须创建新 Task——这意味着应用层需要维护 Task 之间的关联关系、状态回滚逻辑、以及幂等性保证。与 HTTP 无状态模型相比，有状态 Task 模型更适合 Agent 协作场景（因为 Agent 交互天然是多轮、有上下文的），但对开发者的心智模型要求更高。

### 多 Agent Token 消耗的乘法增长效应

一次确认购买消耗十次以上 API 调用——这是 Agent 系统的结构性成本，不是优化能消除的。当 Agent 数量从 1 增加到 N，通信复杂度从 O(N) 变为 O(N²)。Gemini 免费套餐每分钟 15 次请求的限制，在单 Agent 场景下完全够用，但在多 Agent 商务场景下几轮就会耗尽。这对 Agent 基础设施提供商意味着：多 Agent 系统的定价模型不能按单次 API 调用计费，需要按"商务流程完成"计费。

### 授权粒度与长周期任务的矛盾

CartMandate 一小时有效期 + 单次 OTP 的设计，本质上是为 Human-Present 场景优化的。当 Agent 需要自主完成跨平台、长周期任务（如代购比价后分批下单），当前授权模型会成为瓶颈。下一代协议需要支持：可续期的委托凭证、分阶段授权（先比价、再下单、最后支付）、以及跨平台凭证互认。

## 实践启示

1. **密钥路径统一是多进程 Agent 的基础工程**：启动脚本必须统一设置环境变量，所有 Agent 进程共享同一密钥路径。这个细节在官方文档中缺失，但会导致整个支付流程卡死
2. **SD-JWT 是 Agent 间敏感数据传递的优选方案**：在设计 Agent 协作系统时，优先考虑选择性披露的数据格式，而非依赖应用层的访问控制逻辑
3. **多 Agent 系统需要按流程计费而非按调用计费**：Token 消耗的乘法增长意味着按 API 调用次数的定价模型在多 Agent 场景下会指数级膨胀
4. **支付重试必须在应用层实现 Task 管理**：不能依赖 A2A 协议层的 Task 重用，需要在应用层维护 Task 关联和幂等性
5. **关注蚂蚁 Anvita 的 Agent 经济主体方向**：Agent 持有资产、链上结算代表了比"代人支付"更远的演进方向

## 相关链接

- AP2 官方：github.com/google-agentic-commerce/AP2
- AP2 文档：ap2-protocol.org
- ACP（OpenAI × Stripe）：github.com/agentic-commerce-protocol/agentic-commerce-protocol
- → [AgentCore Payments 与 x402 协议](ch11-066-agentcore-payments-与代理商务创新-技术深度解析.html)
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ap2-agent-payments-protocol-hands-on-analysis.md)

---
