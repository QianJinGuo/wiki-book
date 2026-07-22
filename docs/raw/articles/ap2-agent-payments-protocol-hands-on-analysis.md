---
title: "AP2 协议实测分析：Mandate 机制、Task 状态机与多 Agent 系统"
source_url: "https://mp.weixin.qq.com/s/BmvObHXGPsqxoZ6J47QRLA"
ingested: 2026-06-26
sha256: ""
type: raw
---

# AP2 协议实测分析：Mandate 机制、Task 状态机与多 Agent 系统

Google 在 2025 年 9 月发布的 AP2（Agent Payments Protocol）解决的核心问题：当 Agent 开始替用户做决定、甚至替用户花钱时，怎么证明这是用户本人授权的，又怎么保证 Agent 不会乱花钱。

本文基于官方 Human-Present 场景的完整复现，记录实测过程中踩到的协议细节和工程坑。

## 一、密钥路径的一致性

官方 README 给的 run.sh 脚本做了一件关键的事：统一设置 AGENT_PROVIDER_PUBLIC_KEY_PATH 环境变量，让所有进程共享同一个路径。

Credentials Provider 启动时生成一对 ECDSA 密钥，把公钥写到这个路径下。Merchant Payment Processor 验证支付凭证时，要去这个路径读公钥做签名校验。

如果四个 Agent 不是在同一个 shell 环境里启动的，路径就会对不上——哪怕 OTP 输入完全正确，也会报 Agent-provider public key not found，整个支付流程卡在最后一步。这个细节官方文档完全没有提及。

## 二、商户的承诺书（CartMandate）

选完商品后，Merchant Agent 返回一个 checkout_jwt，base64 解码后 payload 结构：

```json
{
  "id": "cart_2",
  "merchant": { "name": "Generic Merchant" },
  "line_items": [{
    "item": { "title": "12-cup drip coffee maker", "price": 3950 },
    "quantity": 1
  }],
  "currency": "USD",
  "status": "incomplete",
  "iat": 1781686213,
  "exp": 1781689813
}
```

关键细节：
- 价格单位是分（3950 = 39.50 美元），规避浮点数精度问题
- status 为 incomplete，用户确认前 mandate 处于未封存状态
- exp - iat = 3600 秒（一小时有效期）
- 签名算法 ES256，商户用私钥签发，任何拿到商户公钥的一方都可以验签

核心：把商户对这笔交易的承诺变成一个可验证的数字凭证，而不是依赖 Agent 的口头描述。

## 三、选择性披露（SD-JWT）

支付环节日志里出现的不是普通 JWT，而是 SD-JWT。普通 JWT 把所有字段明文塞进 payload。SD-JWT 允许持有者根据场景选择性地只出示部分字段——给 Payment Processor 只展示金额和收款方，不展示卡号；给审计方再展示其他字段。

AP2 在协议层用 SD-JWT 传递 PaymentMandate，把隐私保护直接嵌进了数据格式本身。

## 四、Task 状态机的终态陷阱

第一次跑到 OTP 验证那一步，因为公钥路径没对齐，payment task 进入了 failed 状态。重新输入正确的 OTP，系统仍然反复报：

```
Task xxx is in terminal state: failed
```

A2A 协议里 Task 有明确的生命周期：completed、failed、cancelled 都是终态，一旦进入终态就不能再接收新消息。这和 HTTP 的无状态模型完全是两种思路。

对开发者来说：如果要支持支付重试，必须在应用层重新创建一个新的 Task，不能指望在原来那个失败的 Task 上继续操作。

## 五、多 Agent 系统的 Token 消耗

demo 同时跑了四个 Agent，每一步用户操作都会触发多轮 LLM 调用。Shopping Agent 要思考、调工具、委托子 Agent，子 Agent 再思考再回传，一次确认购买消耗十次以上 API 调用。

Gemini 免费套餐对 gemini-3.1-flash-lite 的限制是每分钟 15 次请求：

```
RESOURCE_EXHAUSTED:GenerateRequestsPerMinutePerProjectPerModel-FreeTier limit: 15
```

单 Agent 场景下完全感受不到，但多 Agent 系统的 token 消耗不是线性叠加，而是乘法增长。根本解法是接入付费套餐。

## 六、竞争格局

AP2 解决的核心问题，是给 Agent 之间的商务协议加上密码学背书。在没有这套协议之前，Agent 之间的商务协商停留在自然语言层面。

| 协议 | 主导方 | 定位 |
|------|--------|------|
| AP2 | Google | Agent Payments Protocol，密码学背书的商务协议 |
| ACP | OpenAI × Stripe | Agentic Commerce Protocol |
| ACT | 支付宝 + 千问 + 淘宝闪购 + 阿里云百炼 | 贴合国内监管和本土支付生态 |
| APOP / ClawTip / AI Skill | 国内各方 | 碎片化 |

蚂蚁数科 Anvita 平台让 AI Agent 可以持有资产、进行链上结算。蚂蚁 AI 支付累计已达 3 亿笔，其中 2 亿是最近两个月新增。

## 七、协议局限与演进方向

当前 CartMandate 一小时有效期、单次 OTP 验证这套设计，在 Agent 需要自主完成跨平台、长周期任务的场景下会很快暴露局限。

更细粒度的授权范围控制会是下一代协议要解决的事。蚂蚁 Anvita 和支付宝 Token Pay 指向的方向更远——让 Agent 不只是代人支付，而是自己成为有经济主体资格的参与方。

## 参考资料

- AP2 官方代码仓库：github.com/google-agentic-commerce/AP2
- AP2 协议官方文档站：ap2-protocol.org
- Arthur Chiao, An Illustrated Guide to AP2
- Agentic Commerce Protocol（OpenAI × Stripe）：github.com/agentic-commerce-protocol/agentic-commerce-protocol
