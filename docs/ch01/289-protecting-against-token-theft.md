# Protecting against token theft

## Ch01.289 Protecting against token theft

> 📊 Level ⭐⭐ | 13.3KB | `entities/vercel-com-blog-protecting-against-token-theft.md`

# Protecting against token theft

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vercel-com-blog-protecting-against-token-theft.md)

> Vercel 工程团队 2026-05-29 发布的实战复盘：当 AI 推理调用比 HTTP 请求贵 6 个数量级时，「能不能推理」和「能不能防盗用」就成了完全不同的问题。这篇文章描述了一种新的滥用形态 — Inference Theft — 并给出 Vercel 用 BotID 在每个请求上做深度分析的防御方案。

## 摘要

HTTP 请求极其便宜，Vercel 收大约 $2/百万次，每次调用成本不到 1 美分。但一次前沿模型的 Agent prompt 可能就要 $2 — 单次推理比普通 HTTP 调用贵 6 个数量级，让 AI 推理盗用成为攻击者利润最高的业务之一。

推理盗用（Inference Theft）指未经授权使用他人付费的 AI 推理，可以自用消费，也可以转售。运营方按调用付费，攻击者分文不出，然后以折扣价转售 token。这不是普通的速率限制滥用，而是在市场上对被盗资源的实际转售。

Vercel 在自家 API 上见过这类攻击。任何暴露在公网上、给调用方对 LLM prompt 实质控制权的端点都是目标 — 端点越通用，每次盗用的回报就越高。

## 核心要点

### 1. 经济学差异决定了防御形态

HTTP 请求便宜到几乎可以忽略，AI 推理贵到成为产品里最贵的资源。这条经济学曲线彻底改变了攻击与防御的回报结构。

旧的 Web 防御（IP 速率限制、登录墙）是为「每次调用便宜到攻击者刷 IP 不划算」的时代设计的。推理盗用的单次回报高到攻击者愿意按需采购成千上万的住宅代理 IP，注册一次性账号，规模足以突破任何传统闸门。速率限制被分散到整个 IP 池，真账号通过身份验证 — 旧防御几乎失效。

### 2. AI 端点的暴露面分三种形状

不是所有 AI 端点都同等危险，按暴露程度大致分三档：

- **AI Playground 形状**：调用方对 prompt、模型、参数都有最大控制，是最危险的形态。被盗用的调用可以干净地落入任何标准客户端。
- **Support bot / 文档助手**：当 system prompt 固定在服务端时风险较低，但攻击者已经学会用低成本的方式绕过 system prompt，转售仍然可行。
- **固定的窄场景端点**：调用方控制力弱，盗用收益低，防御压力相对小。

判断暴露风险的关键不是「能不能调」，而是「调用方能在多大程度上控制 prompt、模型和参数」。

### 3. 滥用架构：适配器是核心组件

精密的攻击者会把目标端的 AI 端点包成一个 OpenAI 或 Anthropic 兼容的适配器，再通过住宅代理把调用散出去。

适配器是一次性工程成本：它把受害方那套千奇百怪的 API 呈现为 OpenAI/Anthropic 兼容接口，让被盗用的推理可以接入任何标准编程 Agent 或 SDK。即使按列表价 5-10% 转售，零边际推理成本也能撑起一笔利润可观的生意。

近期一个真实例子是 Chipotlai Max — 一个把 Chipotle 客服机器人包装成 OpenAI 兼容端点的 fork 编程 Agent，公开征集把这个模式搬到 Home Depot、Lowe's、Target、Starbucks 的贡献者。

更关键的是：适配器也成了攻击者下游用户的会话边界 — 他们在适配器认证，不在你的端点认证。等到调用真正打到你的 API 时，已经穿越了你本来打算守住的边界。检查必须落在适配器代理的「每一次调用」上，而不是它后端的「一次会话」上。

### 4. 真实攻击案例

2026 年 4 月 12 日，Vercel 文档 AI 聊天端点流量飙升到 Anthropic Claude Haiku 4.5 的平常 10 倍，峰值 1300 请求/分钟，按推理成本计算每天超过 1 万美元。

攻击通过住宅代理进入，掩盖真实客户端 IP。两天内数十万 bot 请求，标准按 IP 速率限制几乎没用 — 因为 IP 池足够大、账号足够真。

### 5. 防御必须落在「每一次调用」上

会话级检查：攻击者付一次绕过成本，就能拿下后续所有被盗调用。任何按会话摊销的检查，等于把攻击者的绕过成本除以会话长度。

请求级检查：把攻击者的绕过成本强行压回到 1:1。即使推理价格高，逐次检查让攻击者攻破每次调用的成本高到不值得。

这条经济学反过来的关键洞察是：**推理是攻击者盗用时单次最贵的资源，而验证是防御方单次最便宜的防护成本之一**。把验证放在最便宜的环节、把推理成本顶在攻击者每次盗用上，才是合理的对位。

### 6. 验证码形态的演化

传统图形验证码在现代攻击者面前已经失效 — 同一批让推理值得盗用的 AI 模型，正好也能轻松绕过图形验证码。

Vercel 的解法是 BotID deep analysis：客户端 ML 区分人/机器、没有可见挑战的隐形 CAPTCHA，可以逐次运行而不是只在会话开始时跑一次。

实战数据：流量尖峰出现的最初几分钟内，BotID deep analysis 检测并拦截了超过 1 万次 bot 请求；24 小时内该端点请求量回落到正常水平。

### 7. 实施：3 行代码即可落地

服务端在路由处理器里调用 `checkBotId()`：

```ts
// app/api/ai-chat/route.ts
import { checkBotId } from 'botid/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  // Your existing AI SDK call path
}
```

客户端也要声明路由，否则 `checkBotId()` 会因为 BotID 没把挑战 header 装到请求上而失败：

```ts
// instrumentation-client.ts
import { initBotId } from 'botid/client/core';

initBotId({
  protect: [{ path: '/api/ai-chat', method: 'POST' }],
});
```

## 深度分析

### 从「防盗用」到「护推理」的范式切换

文章表面在讲一个具体的产品安全机制，但实际描述的是「AI 应用安全」这个新类别的形成过程。HTTP 时代的安全思维是「防未授权访问」 — 速率限制、登录墙、防 CSRF。AI 时代的安全思维必须升级为「护推理」，因为被盗用的对象从「能不能调」变成了「调用背后的推理资源」。

这条升级在三个层面同时发生：

1. **资源层**：被盗用的是 token 推理，不是带宽或存储。推理是单次最贵的资源。
2. **产品层**：盗用者把被盗推理包成 OpenAI/Anthropic 兼容接口 — 这是「AI 应用 API 化」反过来的「被盗推理 API 化」。攻击者用受害方暴露的能力反过来做成受害方的对手。
3. **防御层**：检查必须按请求摊销，而不是按会话摊销。这条经济学判断是文章的核心洞察。

### 适配器模式的连锁含义

适配器作为「被盗推理的标准化层」是一个值得专门关注的形态。它意味着：你的 AI 端点越标准、越兼容，盗用价值越高；反过来，你的 API 越异构（自定义 schema、私有参数、专有认证），被盗后包装成通用接口的成本越高。这是「非兼容性」无意中带来的一种安全护城河。

但这种护城河不可持续 — 任何足够流行的 API 都会被复刻成适配器，更稳的护城河是「会话状态和业务数据绑死在端点内、调用方无法代理」。

### 验证码形态的迁移逻辑

验证码的演化历史几乎可以写成「攻击者/防御者 AI 能力交替领先」的编年史：

- 早期图形验证码：OCR 不强时有效
- 中期交互验证码（滑块、点字）：通用 CV 不强时有效
- 现代 BotID：通用 CAPTCHA 模型能解，所以换成客户端 ML 区分行为模式

这条迁移的工程含义是：**任何「对人类容易、对机器难」的方案，最终都会被新一代 ML 模型打成「对机器也容易」**。下一代替代方案可能要回到「对人类显著、对低成本自动化不显著」的行为信号 — 但这是更深的对抗博弈，超出本文范围。

### 摊销结构决定防御位置

文章里最值得抄下来的判断是「检查必须按请求摊销」。这条原则可以推广到任何昂贵的、按次收费的资源：

| 资源类型 | 摊销位置 | 攻击者破解代价 |
| --- | --- | --- |
| 一次性登录 | 高（破解一次绕过所有） | 高 |
| 会话级 token | 中（破解一次绕过会话） | 中 |
| 请求级 token | 低（每次都要重破） | 低，但成本仍可控 |
| 每字节签名 | 极低 | 几乎不可能 |

Vercel 选择在「请求级」部署 BotID，本质上是把攻击者的破解代价和受害方的检查代价放到同一时间维度上 — 双方都按次付费。这是最干净的对抗结构。

### 攻击经济的对称性

文章结尾提到「推理将持续比承载它的请求贵上几个数量级，所以转售将继续盈利，攻击者会继续迭代」。

这条判断的工程含义是：**推理盗用不是一次性漏洞，是结构性攻击面**。只要推理比 HTTP 贵的数量级差存在，转售就一定有利润空间。防御要做的是把利润空间压到攻击者不愿做的水平 — 比如把检查做到足够便宜、把盗用适配器的工程成本做得足够高、把响应延迟拉得让转售难以维持 SLA。

## 实践启示

1. **审计所有暴露在公网的 AI 端点**，按调用方对 prompt/模型/参数的控制程度排序，控制越多 = 越危险 = 越先加固。

2. **所有 AI 推理端点必须在每一次请求上跑验证**，不能放在会话开始或登录时一次性跑。原因：会话级检查把攻击者的绕过成本摊销到后续所有调用，等于送钱。

3. **验证码形态要随攻击者能力演化**。传统图形 CAPTCHA 已被 LLM 攻破，下一代要靠客户端 ML 区分行为模式，并把验证成本压到低于推理成本的量级。

4. **不要把 AI 端点设计成 OpenAI 兼容接口**（除非你确定要这么做）。兼容性越高 = 适配器包装成本越低 = 盗用价值越大。异构 API 是一种被动的安全护城河。

5. **把会话状态和业务数据绑死在端点内**，让调用方无法代理。即使被盗用，攻击者也无法把盗用产品化成通用接口。

6. **关注「防御成本 / 盗用成本」的对称性**。BotID 把防御成本压在「比单次推理低很多」的量级，把盗用者的破解成本拉到「每次都要重破」的量级。这才是经济学正确的对抗结构。

7. **借鉴 Vercel 的 24h 收尾曲线**。即便峰值流量 10x 正常水平，请求级 BotID 也能在 24 小时内把流量压回正常。这条曲线本身就是「AI 端点防御可行」的最直接证据。

## 相关实体

- [Karpathy Vibe Coding Agentic Engineering](../ch04-070-从氛围编程到智能体工程/)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch04-125-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch01-707-存之有序-治之有矩-agent-记忆系统的工程实践与演进/)
- [两万字详解Claude Code源码核心机制](../ch01-734-两万字详解claude-code源码核心机制/)
- [你不知道的 Agent原理架构与工程实践 V2](../ch04-455-你不知道的-agent-原理-架构与工程实践/)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](../ch01-715-龙虾装上了-可以用来干啥-分享下我的-openclaw-多智能体团队搭建经验/)
- [Agent Security Three Step Sequence Harness Governance Identity Crewai](../ch04-157-agent-安全三步法-先-harness-再-governance-最后-identity-顺序反了一切白做/)
- Apple Siri Private Inference Lethal Trifecta Matthew Green
- [Automate Progressive Rollouts With Vercel Flags Vercel](../ch09-106-automate-progressive-rollouts-with-vercel-flags-vercel/)
- Inference Optimization
- [Ai Infra Llm Efficient Inference Vllm](../ch01-865-ai-infra-入门干货总结-大模型是如何高效推理的/)
- [Agentic Scheduler With Strands Agentcore For Multi Region Gpu Inference](../ch04-167-基于strands和agentcore-实现agentic-scheduler-在多region自动编排推理gpu算力/)
- Model Inference Comparison

---

