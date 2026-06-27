# Inference Theft as AI Endpoint Attack Surface — Vercel Token Theft Defense 2026

## Ch12.023 Inference Theft as AI Endpoint Attack Surface — Vercel Token Theft Defense 2026

> 📊 Level ⭐⭐ | 13.1KB | `entities/vercel-inference-theft-ai-endpoint-economics-2026.md`

# Inference Theft as AI Endpoint Attack Surface — Vercel Token Theft Defense 2026

> **核心问题**：AI endpoint 是 2026 年最高利润的攻击面之一。HTTP 请求成本 $2/million calls，AI prompt 成本 $2/call，**价差 1,000,000x**。攻击者用 residential proxy + 一次性账号即可绕过 session-level 验证，转售盗用的推理资源。

## 三条独有贡献（与同类安全 entity 区分）

1. **推理资源盗窃经济学** — 给出具体的 $2/million vs $2/call 价差量化（其他 agent security entity 都没有这层经济分析） ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]
2. **Per-request 验证 vs per-session 验证** — 揭示了为什么 rate limit + auth wall 失效：session-level 验证被 amortize 摊薄到 thousands of stolen calls（ammaraskar 1-click 走的是 webview PoC 路径，完全不同的攻击维度） ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]
3. **OpenAI/Anthropic-compatible adapter 滥用模式** — 攻击者用标准 SDK 接口包一层你自定义的 endpoint，通过 residential proxy 扇出调用（这种"endpoint 标准化的代价"在其他 supply chain 实体中未讨论） ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

## 攻击面分类

Vercel 团队按暴露程度排序： ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

| 暴露级别 | Endpoint 类型 | 风险 | 原因 |
|---------|-------------|------|------|
| **最高** | AI playgrounds（调用方可控 prompt/model/params） | 极高 | stolen calls 直接 drop-in 到任何 standard client |
| 中等 | 客服 bot / 文档 assistant（系统 prompt 固定） | 中等 | 攻击者用 prompt 绕过技术可绕开 fixed prompt，转售仍盈利 |
| 最低 | Internal API（强 auth + 低 latency） | 低 | 不暴露在公网，难以规模化盗用 |

**关键洞察**：resale value 取决于 stolen calls 多容易 drop-in 到 provider-compatible client — 这解释了为什么 OpenAI-compatible endpoint 是最危险的。 ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

## 为什么 Web 防御不奏效

| 防御层 | 为什么不够 |
|--------|----------|
| IP rate limit | 攻击者用 residential proxy fleet，单 IP 触发限流的概率低 |
| Auth wall（per-session） | per-session 验证被 thousands of calls 摊薄成本 |
| CAPTCHA | 自动化 CAPTCHA solving 服务 $1-3/1000 次，比盗用收益便宜 |
| WAF 规则 | 推理调用模式与正常用户难以区分 |

**Vercel 的解决方案**：BotID — deep analysis on every request, not per-session。重点是把"per-request 验证"作为架构默认，而不是 per-session 兜底。 ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

## 与同类安全实体的差异化

| 现有 entity | 焦点 | 与本文的轴 |
|------------|------|----------|
| `vscode-github-token-stealing-1-click-pwn-ammaraskar-2026` | 1-click PoC via webview postMessage | **代码层漏洞** |
| `ai-coding-agent-quality-defense-five-control-mechanisms` | 5 大 control mechanism for AI coding agent | **Code quality / SDLC** |
| `ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-security-v2` | 17KB supply chain attack | **MCP / 工具供应链** |
| **本文 (Vercel inference theft)** | **AI endpoint 推理资源盗用经济学** | **Cost economics / per-request defense** |

四个 entity 覆盖四个不同轴（PoC / SDLC / supply chain / economics），共同构成 agent security 知识图谱。 ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

## 关键 takeaway

- **Per-request 验证 > per-session 验证** — 这是 2026 年 AI endpoint 安全的 architectural default
- **推理资源盗窃的 ROI 远超 Web 攻击** — 价差 1,000,000x 让 residential proxy + 自动化账号注册的成本可忽略
- **OpenAI/Anthropic-compatible API 标准化是一把双刃剑** — 开发者接入门槛降低，攻击者转售门槛也降低
- **AI playgrounds 是头号目标** — 调用方完全控制 prompt/model/params，stolen calls 无需适配

## 引用

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md) ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

---

## 深度分析

**1. 百万倍价差是结构性攻击激励，不是边缘风险** ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

文章开篇即给出核心数字：HTTP 请求 ~$2/million，AI prompt 单次 $2，价差 1,000,000x 。这个价差不是安全漏洞，而是 AI serving 成本结构的固有特征。只要 frontier model 的 per-token 推理成本高于 HTTP 请求，resale 就有正利润。Vercel 将此定性为"highest-margin businesses an attacker can run"，意味着这是系统性问题，不是偶发漏洞。 ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

**2. Per-session 验证天然被攻击者摊薄 — 经济学上无法防御** ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

Rate limit 和 auth wall 失效的根本原因不是技术实现问题，而是验证粒度与攻击规模的数学关系 。一次性注册账号 + 一次性住宅代理采购 = bypass 成本固定；被盗用的 inference calls 数量无限。Per-session 验证的 bypass 成本分摊到 thousands of stolen calls，单次被盗 call 的防御成本趋近于零 — 攻击者只需让 stolen calls 数量超过 bypass 成本即可盈利。这是per-request 验证成为必选的根本原因。 ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

**3. OpenAI-compatible adapter 是攻击规模化的工程杠杆** ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

攻击者不需要针对每个 victim's API 写定制客户端 — 只需包装一层 OpenAI/Anthropic-compatible adapter，被盗的 inference 就能 drop-in 到任何 standard SDK 。Chipotlai Max 案例表明，攻击者将连锁餐厅客服 chatbot 转化为 OpenAI-compatible endpoint 并公开招募志愿者扩展到 Home Depot、Lowe's、Target、Starbucks。这揭示了 API 标准化在安全层面的双刃剑效应：开发者接入成本降低，攻击者转售成本同样降低。 ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

**4. 真实攻击案例：1,300 req/min、$10K/day 的经济驱动** ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

2026 年 4 月 12 日 Vercel docs AI chat endpoint 遭受攻击，流量峰值达到正常量的 10 倍，涉及 Anthropic Claude Haiku 4.5，峰值 1,300 req/min，换算日均推理成本超过 $10,000 。攻击流量经 residential proxy 路由，跨数十万 bot 请求，per-IP rate limit 完全失效。这个案例不仅是事件记录，更验证了前述经济模型的实战有效性：$10K/day 的潜在收益完全覆盖 residential proxy fleet 的运营成本。 ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

**5. BotID deep analysis 在 per-request 层重建防御边界** ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

Vercel 的解决方案不是改进 per-session 验证，而是将验证下沉到 per-request 层 。BotID deep analysis 在 攻击开始后数分钟内检测并阻断了超过 10,000 个 bot 请求，24 小时内 endpoint 请求量回落至正常水平。这说明 per-request 验证不仅在理论上有效，在实战中也具备快速收敛能力。 ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

---

## 实践启示

**1. 将 per-request 验证设为 AI endpoint 防御的 architectural default** ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

不要依赖 per-session auth 或 IP-based rate limit 作为主要防线。Any check that runs per session amortizes the attacker's bypass cost across every subsequent inference call 。在 route handler 入口处嵌入 per-request 验证，让每次 AI request 都独立通过验证，使攻击者无法通过一次 bypass 获取多次被盗 call。 ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

**2. 优先保护 AI playgrounds — 最高控制权意味着最高 resale value** ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

AI playgrounds 的危险在于调用方同时控制 prompt、model 和 parameters 。Stolen calls 无需任何适配即可 drop-in 到任何 standard client。按攻击面优先级审计时，AI playgrounds 应列为最高暴露等级，优先部署 per-request 验证和深度流量分析。 ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

**3. 对 residential proxy fleet 的检测需要行为特征，而非 IP 指纹** ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

攻击者通过数千个 residential proxy IP 稀释 per-IP rate limit 。传统 IP-based 防御在此场景失效。BotID 的客户端机器学习方案通过行为分析（而非 IP 指纹）区分人类和 bot，在 residential proxy 大规模使用时仍能有效检测。这是防御 inference theft 的正确技术方向。 ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

**4. 警惕 OpenAI-compatible adapter 的攻击面扩展** ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

如果你的 AI API 设计为 OpenAI 或 Anthropic 兼容，攻击者可以将被盗 inference 转售给任何使用标准 SDK 的下游客户 。在设计 API 时，需要将 adapter 层也纳入防御边界 — 验证需要在 adapter 转发到你的 endpoint 时执行，而不是依赖 adapter 自身的 session 管理。 ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

**5. 监控 endpoint 流量模式，设置异常 cost run rate 告警** ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

Vercel 案例中，攻击导致流量达到 10x 正常量 。建议在 AI endpoint 层设置 cost run rate 监控，设定 $/hour 或 $/day 阈值告警。这样可以在攻击规模化之前提前感知，而不是等到账单曝光才发现。 ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

---

## 关联阅读

→ [Vscode Github Token Stealing 1 Click Pwn Ammaraskar 2026](../ch09-050-1-click-github-token-stealing-via-a-vscode-bug-ammaraskar/) — 另一个高利润 AI endpoint 攻击向量：通过 VS Code webview postMessage 实现的 1-click token stealing PoC。与本文的攻击经济学框架互补：ammaraskar 实体聚焦代码层漏洞（postMessage 处理缺陷），本文聚焦推理资源的经济学驱动因素和 per-request 防御架构。 ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

→ [Ai Coding Agent Quality Defense Five Control Mechanisms](../ch09-016-ai-编程智能体的质量防线-5-个代码质量控制机制-反馈传感器-语义评估-重构边界-来源追溯-智能体攻击/) — 从 agent 使用方视角的系统性防御策略：5 种 control mechanisms 防止 AI coding agent 产出低质量代码。 inference theft 是攻击方利用 AI endpoint 经济价值的案例，该 entity 提供了 agent 使用方在接收方一侧的防御思路，两者共同构成 AI agent security 的攻防全景。 ^["[Vercel Com Blog Protecting Against Token Theft](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)"]

---

