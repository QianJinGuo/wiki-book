# AI Gateway production index

## Ch01.066 AI Gateway production index

> 📊 Level ⭐ | 6.6KB | `entities/aigatewayproductionindex.md`

## 核心要点
- AI/ML 技术文章
- 技术分析和方法论
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/aigatewayproductionindex.md)

## 深度分析
### 1. 成本与音量的分歧映射不同的业务风险层级
Anthropic 在 spend 中占 61% 而 Google 在 volume 中占 38%，这种分歧不是市场统计噪音，而是反映了"容错成本"在其中的决定性作用：Claude Opus 这类高成本模型被部署在 Back Office（87% cost share, 71% token share）这类高风险场景，而 Gemini Flash 则占据了 Consumer 场景中 28% token 却仅占 15% cost 的位置。
这意味着 **B2B 应用按 token 计费大约是 B2C 的两倍**，不是因为 B2B 用的模型更好，而是因为 B2B 的每一次错误输出的代价（法律风险、财务损失、运营中断）远远超过 B2C。个人助理类应用容错率高，可以用便宜模型跑大量 volume；后端工作流必须上贵的模型，因为错一个答案付出的代价远超节省的 token 费用。

### 2. Agentic Workload 正在重构 AI 的成本结构
2026 年 4 月，22.2% 的请求包含 tool call（相比 2025 年 10 月的 11.4% 翻倍），但更关键的是 **58.9% 的 token  volume 现在跑在 tool-call 请求上**（从 31.6% 增长）。这意味着 tool-using 请求的 token 密度是普通 chat 的约 2.6 倍。
一个 agent 执行 10 次 tool call 就计费 10 倍的 token，而 chat 只需要一次 round trip。这个成本结构的转移解释了为什么业界更多关注请求数（request count），而生产环境真正的成本驱动因素是 token intensity。Agent 架构正在将 AI 的计费模式从"单次问答"转变为"链式执行"，这是基础设施层面而非应用层面的变化。

### 3. 多模型路由是规模化的标准架构，而非可选项
在 10M+ 请求量级，团队平均使用 **35 个模型**。这不是人工选择的结果，而是一个 routing graph 的涌现架构：一个 cheap classifier 做 intent detection，一个 frontier model 做 reasoning，一个 embedding model 做 retrieval，一个 fast model 做 summarization，一个 vision model 处理 screenshots。
这种架构的关键特性是：**每个模型都是可替换的**。当某个 provider 涨价、质量下降或发生故障时，流量会在数小时内重新分配到其他模型。在规模化的团队中，切换模型更接近于一次配置变更（config change），而非供应商迁移（vendor migration）。这彻底颠覆了"Labs 锁定客户"的叙事——实际上，规模越大，锁定越弱。

### 4. Provider Outage 的真实成本被 SLA 掩盖了
整体来看，3.5% 的请求经历了 fallback rescue（首次路由遇到错误/限速/超时后重新路由）。但以 token 计量的 rescue rate 是 5.1%，以成本计是 4.9%——**被拯救的请求恰好是更大、更贵的那些**。长上下文 window 比短上下文更容易触发限速；多步骤 agent run 在每一步都累积失败概率；重型 reasoning call 在持续负载下更容易超时。
Provider 的 SLA 测量的是 request-level uptime，但生产应用体验到的是 cost-weighted uptime，两者在最贵的那些调用上完全分开。这揭示了一个隐藏的结构性风险：单纯看 SLA 百分比来评估供应商可靠性是不够的，必须看 cost-weighted uptime。

### 5. 新模型被快速吸收，但升级节奏不再由 Labs 控制
Claude Sonnet 4.6 在发布后第一个完整月就吸收了 Sonnet 系列的大部分流量；Claude Opus 4.7 正在以几乎相同的曲线从 Opus 4.6 抢夺份额。更关键的是：** predecessor 模型始终保持 live 和 routable**，团队会自动迁移，迁移本质是一次 config change，labs 不再控制自己产品线的升级时间线。
这意味着模型供应商的"护城河"（现有用户基础）实际上比表面看起来脆弱得多。当路由层成为独立的基础设施组件，模型供应商的价值锚点只剩下模型质量本身。

## 实践启示
### 给 AI Gateway 使用者的行动建议
1. **从第一天起就将路由作为核心架构单元**：不要假设只需要一个模型。多模型路由是规模化后的标准架构，提前设计路由层比后期迁移要简单得多。
2. **为 fallback 设计并优化 uptime 和成本**：3.5% 的请求 rate limit/timeout 听起来不重要，但这些请求恰好是 token-intensive 和 cost-intensive 的。根据工作负载重要性分级设计 fallback 策略，而不是统一处理。
3. **用成本视角评估模型选择，而非单一的 leaderboard 排名**："谁在赢 AI"是个错误的问题，正确的问题是"哪个模型在我关心的 use case 上性价比最优"。在 Back Office 场景用 Sonnet，在 Consumer 场景用 Flash，这是已经被数据验证的分工。
4. **建立成本-风险映射表**：把应用场景按"答案错误代价"分级，低风险场景用便宜模型，高风险场景用贵的模型。不要在所有场景统一使用同一个模型。
5. **持续监控 agentic workload 的 token intensity**：Agent 架构的 token 消耗速度远超 chat architecture，需要单独计量和预算控制，而不是假设 agent 会比 chat 更便宜。

## 相关实体
> 主题导航

- AI Gateway production index
- [AI Gateway production index](/ch01-066-ai-gateway-production-index/)
- [Versa takes aim at fragmented enterprise security with CSPM, orchestration update, and AI agent controls](/ch04-010-versa-takes-aim-at-fragmented-enterprise-security-with-cspm/)
- MOC

---

