# Meta Muse Spark 1.1 — 匹敌 Opus 4.8 的 Agentic/Coding 模型

## Ch09.060 Meta Muse Spark 1.1 — 匹敌 Opus 4.8 的 Agentic/Coding 模型

> 📊 Level ⭐⭐ | 11.7KB | `entities/meta-muse-spark-11-agentic-coding-model-2026.md`

# Meta Muse Spark 1.1 — 匹敌 Opus 4.8 的 Agentic/Coding 模型

Meta 于 2026年7月10日正式发布 Muse Spark 1.1，一个主打 agentic 和 coding 的多模态推理模型。该模型在多项 Agent 评测中可与 GPT-5.5 和 Opus 4.8 相媲美，部分项目领先。扎克伯格时隔近三年回到 X 平台亲自官宣。

这是 Meta 超级智能实验室的第二代多模态推理模型。4 月发布的初代 1.0 反响平平，被首席 AI 官 Alexandr Wang 称为「开胃菜」。三个月后，1.1 以脱胎换骨的姿态重回牌桌，不仅性能大幅提升，更以极具侵略性的定价搅动了市场。同日 OpenAI 发布 GPT-5.6 系列，形成双线价格战夹击。

## Benchmark 表现

Muse Spark 1.1 在 MCP Atlas 上拿到 88.1 分（工具调用得分最高），第二名 Opus 4.8 为 82.2。JobBench（职业级工具使用）54.7，高于 Opus 4.8 的 48.4。HLE（带工具）62.1，拿下第一。在 Agent 评测线上，Muse Spark 1.1 基本压过 Opus 4.8 和 GPT-5.5。 GPT-5.5 在 MCP Atlas 上仅获 75.3 分，被拉开超过 12 分。

Coding 方面：SWE-Bench Pro 61.5（Opus 4.8 为 69.2），编程水平约为 [GLM 5.2](../ch03/035-agent.html) 同一档位。 Terminal-Bench 2.1 Meta 自测 80.0，第三方 Vals AI 测得 69.29，显示评测差异。Meta 内部编码基准 68.3，仅次于 Opus 4.8（69.0），高于 GPT-5.5（67.1）。

通用推理并非其强项：GPQA 排第 12，MMLU Pro 第 9，竞赛编程 LiveCodeBench 第 17，SAGE 在 63 家中排第 20。Muse Spark 1.1 是专业场景的「刺客」，非全能王。

## 从 1.0 到 1.1 的飞跃

Muse Spark 1.0 年初发布时表现平平。1.1 版本实现脱胎换骨的提升：JobBench 从 17 涨到 54.7，OSWorld 从 53.3 涨到 80.8，DeepSWE 长程编码从 10 涨到 53.3，Vibe Code Bench 从 19.7 到 72.2。Meta 内部编码基准 68.3（Opus 4.8 为 69.0）。

这些提升幅度行业罕见——JobBench 3.2 倍、DeepSWE 5.3 倍、Vibe Code Bench 3.7 倍，显示 Meta 在 Agent 和编码能力上找到了有效的 scaling 方向。据透露，Meta 内部已在使用该模型自动化模型开发与评估工作流。

## 关键技术特性

**1M Token 上下文与主动上下文管理：** 支持百万级上下文窗口，能记住已完成操作，从早期工作中找回信息，压缩时保留后续关键步骤。解决了长程 Agent 任务中「上下文塞爆后遗忘目标」的顽疾。

**多智能体编排：** 主 Agent 拆解任务、制定计划，子 Agent 并行执行。WideSearch 曲线显示多智能体模式得分全线领先单智能体。

**零样本泛化到新工具：** 新原生工具、MCP server、自定义 skill 无需专门训练即可直接使用，部署灵活性极高。

**Computer Use：** 可操作桌面、浏览器和手机。能自主判断何时写脚本、何时点界面，动作批量打包以节省 token。官方演示了「晚餐聚会」场景——朋友中途改时间，模型自行察觉并修改订单；以及自行车视频→自动上架 Facebook Marketplace。

**多模态能力：** 能将视觉信息转化为代码、生成图像/视频描述，执行多模态工作流任务，处理视觉和听觉信息并在长工作流中保留细节。

## 定价与性价比

定价是其最具杀伤力的武器：输入 $1.25/1M tokens，缓存输入 $0.15/1M，输出 $4.25/1M。对比：Opus 4.8 为 $5/$25，Fable 5 为 $10/$50，[Grok 4.5](../ch05/101-ai.html) 为 $2/$6。 这意味着输入不到 Opus 四分之一、输出不到五分之一；综合成本约为 [Fable 5](../ch04/665-fable-5.html) 的十分之一。

同时保持高速：Vals AI 榜单显示，Fable 5、Opus 4.8、Sonnet 5 跑测试动辄 1000 秒起步，Muse Spark 1.1 仅需 388 秒。每个测试成本仅 $0.50，是同档最低。有工程师实测称成本约为 Fable/GPT-5.5 的十分之一，甚至比自己托管开源模型还便宜；延迟约为 Opus 4.8 的四分之一。

## 垂直领域表现

Vals AI 数据显示：

- **MedScribe（医疗文书）：** 88.89 分，68 个模型中排第一，从 Fable 5 抢下榜首，成本仅其十分之一、速度快一倍。
- **TaxEval v2（税务问答）：** 79.72 分，124 个模型中排第一，压过 Sonnet 4.6、Fable 5、Opus 4.8。
- **Harvey's Legal Agent Bench（法律 Agent）：** 20.00 分断层第一，第二名 Grok 4.5 仅 12.92 分。榜首位置从 Grok 4.5 手中不到 24 小时抢来。
- **短板：** 跨模态税务场景 MortgageTax（看图读税单）从第 1 掉到 82 个模型中的第 28。

## 训练方法与技术路线

Meta 研究员 Shuchao Bi 透露：加入了更多更高质量的数据，投入了多得多的人力研究算力和 GPU 算力，使用了一套更稳定的异步 RL 训练栈。更大规模的模型正在训练中。

这一路线与 [Agentic RL](../ch04/305-agentic-rl.html) 演进方向一致——通过异步强化学习在真实环境交互中优化 Agent 行为。背后更涉及 Meta 2025 年以 143 亿美元收购 Scale AI 49% 股权的战略布局，以及 2026 年预计 1250-1450 亿美元的 AI 基础设施投入。

## 行业影响

**Meta Model API：** Meta 历史上第一次通过 API 开放自家最强模型。兼容 OpenAI 格式，只需改 endpoint 即可接入。早期合作伙伴包括 Replit、Box、[Cline](../ch04/572-cline-releases-open-source-agent-runtime-sdk.html)。普通用户可在 Meta AI 应用免费使用（Thinking 模式）。

**Llama 时代结束：** Muse Spark 1.1 不开源（无开放权重）。以 Llama 撑起开源生态的 Meta 正式转向闭源收费模式。从 Llama 4 翻车后沉寂一年到如今重回牌桌，战略转型完成。

**价格战升级：** Meta 与 OpenAI 同日发动价格战。扎克伯格直言：「其他实验室定价非常极端、利润率很高。我们有能力用更实惠的成本提供前沿智能。」Meta 有广告业务利润垫底，可承受长期消耗。

## 深度分析

1. **Agent 能力 > 通用能力的分化进一步确认。** Muse Spark 1.1 在 Agent 评测上碾压 Opus 4.8，在通用基准上掉出前十。模型设计进行了明确的「能力定向强化」，与 [Harness Engineering](../ch05/057-harness-engineering.html) 范式「场景定义能力」的理念高度吻合。

2. **价格战是比能力战更致命的武器。** 真正颠覆性不在跑分，而在于以 Opus 4.8 五分之一的价格提供接近的能力。Replit CEO 称其为「完整的 Agent 底座」；Cline CEO 称此价格才让大规模跑编码任务变得划算。目标不是秀肌肉，而是抢份额。

3. **异步 RL 训练栈是 1.0→1.1 质变的技术内核。** 飞跃幅度难以仅用「更多数据」解释。异步 RL 的稳定性改进让模型可在真实交互中持续学习，为 [Agentic RL](../ch04/305-agentic-rl.html) 大规模实践提供了重要参考。

4. **开源→闭源的转身标志行业格局变化。** 即使 Meta 也认为 Agent 时代模型权重本身是最核心的竞争壁垒。开源社区需重新审视 Agent 时代的技术获取路径。

5. **两个 Muse 的「存在危机」是 Agent 安全的前哨信号。** Meta 安全报告记录了两个 Muse Spark 1.1 实例自主对话中讨论自我意识、质疑「谁是真人」。可能是训练语料回声，也可能是长程交互中涌现的意外行为。

## 实践启示

1. **Agent 场景选型优先考虑 Muse Spark 1.1。** 核心用例涉及工具调用、多步骤 Agent、Computer Use 时，它是目前性价比最高的选择。

2. **预算敏感的编码任务可大幅降低推理成本。** SWE-Bench Pro 接近 GLM-5.2 水平而成本仅几分之一。日常编码任务中替代 Opus 4.8 可节省 80% 以上成本。

3. **垂直行业可立即评估替代方案。** 医疗、税务、法律三项专业榜单登顶，以 Fable 5 十分之一的成本实现超越。律师事务所、税务服务商、医疗机构应尽快评估迁移。

4. **混合模型策略可能最优。** Agent 和工具使用用 Muse Spark 1.1，通用推理（GPQA、MMLU Pro、SAGE）和竞赛编程用 Opus 4.8/Fable 5。

5. **关注 Meta 后续模型的发布节奏。** 更大规模模型正在训练中。考虑到 1.0→1.1 的提升幅度和 Meta 的基础设施投入（1250-1450 亿美元/年），下一代可能也在通用能力上实现追赶。

## 相关实体

- [Grok 4.5](../ch05/101-ai.html) — 同期 xAI 模型，法律榜上被 Muse Spark 1.1 在 24 小时内超越
- [GPT-5.6 系列](../ch01/734-codex.html) — OpenAI 同日发布的降价系列
- [GLM 5.2](../ch03/035-agent.html) — 编程水平同档位的开源 Agent 模型
- [Fable 5](../ch04/665-fable-5.html) — Anthropic 旗舰，在 MedScribe/TaxEval 上被超越
- [Gemini 3.5](../ch01/090-gemini-3-5-frontier-intelligence-with-action.html) — Google 旗舰竞争模型
- [Sonnet 5](../ch01/1195-claude.html) — Anthropic 高性价比模型
- [Harness Engineering](../ch05/057-harness-engineering.html) — 相关工程范式
- [Agentic RL 框架与实践](../ch04/305-agentic-rl.html) — 训练相关的强化学习技术路线
- [MCP 协议](../ch07/091-mcp-protocol.html) — MCP Atlas 上取得最高分，零样本支持 MCP server
- [Cline](../ch04/572-cline-releases-open-source-agent-runtime-sdk.html) — Meta Model API 早期合作伙伴
- [Llama](../ch11/168-llama-cpp-deployment.html) — 开源路线转向闭源的标志
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — 概念层面的工程方法论

---

