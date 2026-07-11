# 给 AI 做工作面试：Mollick 的模型评估方法论

## Ch01.584 给 AI 做工作面试：Mollick 的模型评估方法论

> 📊 Level ⭐⭐ | 7.8KB | `entities/ai-job-interview-model-evaluation-mollick.md`

# 给 AI 做工作面试：Mollick 的模型评估方法论

> 2026-06-07 引用自 Ethan Mollick《Giving your AI a Job Interview》，One Useful Thing，2025-11-12。

## Benchmark 的系统性缺陷

1. **污染**：benchmark 题目公开，部分 AI 将其纳入训练数据
2. **不透明**：我们不知道 MMLU-Pro 的 84% vs 85% 进步难度是否相同
3. **错误**：很多 benchmark 题目本身有错误，top score 可能永远无法达到
4. **窄**：大多数 robust benchmark 测试数学/科学/推理/编程，其他能力（写作/社会学分析/商业建议/同理心）几乎没有测试选项

**但整体趋势一致向上**：ARC-AGI、METR Long Tasks 等高质量 benchmark 均显示指数上升趋势，且与现实世界的 AI 影响（医疗/金融等）相互印证。

## Vibes 测试：Mollick 的 Otter Test

Mollick 的非正式测试方法——用创意任务感知模型"世界模型"差异：

| 测试 | 考察维度 | 典型结果 |
|------|---------|---------|
| **Otter on a plane using WiFi** | 图像/视频生成的世界模型 | 从 2021 年一团糟 → 2025 年几乎完美 |
| Starship control panel (JS) | 代码生成 + 概念可视化 | 测模型对未来的想象 |
| Challenging poem | 创意写作 + 约束遵循 | 测写作能力 |
| 47 words remaining newborn 段落 | 短篇写作 + 数字约束 | 测精确度和风格 |

写作测试结果：Claude 4.5 Sonnet 常被视为最强写作模型；Gemini 2.5 Pro 连字数都无法准确追踪；GPT-5 Thinking 是狂野风格派（复杂隐喻有时牺牲连贯性）。

## GDPval：真实工作评估框架

OpenAI 的 GDPval 论文是目前最接近真实工作评估的方法：

1. **建立真实任务**：14 年经验专家生成复杂现实任务（金融/法律/零售等），每任务需专家 4-7 小时完成
2. **测试 AI vs 人类**：多模型 vs 付费人类专家同时完成每任务
3. **评估**：第三组专家（不知道答案来自 AI 还是人类）逐一评判，耗时 >1 小时/题

**核心发现**：
- 最好模型在软件开发/个人财务顾问等任务上**击败人类专家**
- 药剂师/工业工程师/房地产经纪人**轻易击败 AI**
- ChatGPT 是更好的销售经理，Claude 是更好的财务顾问

## AI 的系统性态度差异

Mollick 用"GuacaDrone 牛油果无人机配送"想法测试不同 AI 的风险态度：
- Grok / Microsoft Copilot：觉得这是绝妙想法（评分远高于实际）
- GPT-5 / Claude 4.5：更加怀疑

**影响**：当 AI 以规模提供建议时，系统性偏高或偏低 3-4 分意味着持续将组织引向不同方向。

## 企业 AI 选型建议

> "You wouldn't hire a VP based solely on their SAT scores. You shouldn't pick the AI that will advise thousands of decisions for your organization based on whether it knows that the mean cranial capacity of Homo erectus is just under 1,000 cubic centimeters."

企业选 AI 应像招聘一样做**结构化 job interview**：
- 创建反映真实用例的 realistic 场景
- 多次运行观察 pattern
- 让专家评估结果
- 横向对比不同模型在你真实工作上的表现
- 每季度重新评估（新模型不断出现）

## 深度分析

1. **Benchmark 的测量局限性是结构性的**：公开题污染、不透明评分、题目错误三重问题叠加，使得单个 benchmark 数据无法可靠比较模型。标准化测试测量的"智慧"与实际工作能力之间的关联远比假设的弱 

2. **Vibes 测试揭示了标准化测试捕捉不到的世界模型差异**：Otter test、写作测试等非正式评估能感知模型的"直觉"——它如何理解物体间关系、如何在约束下创作、如何追踪数字。不同模型对同一提示的系统性响应差异，暗示它们内化了不同的世界表征 

3. **GDPval 证明了"顶级"模型的能力边界是非均匀的**：最好模型在软件开发、个人财务顾问等任务上击败人类专家，但药剂师、工业工程师、房地产经纪人轻易击败 AI。这种"Jagged Frontier"意味着没有"最好"的 AI，只有"最适合特定任务"的 AI 

4. **AI 的系统性态度差异会在规模化决策中产生累积偏差**：Grok 对 guaca drone 评分远高于实际，GPT-5/Claude 更为怀疑。当 AI 以规模提供建议时，持续偏高或偏低 3-4 分意味着持续将组织引向不同方向——这是风险倾向的制度化 

5. **AI 选型正在从技术决策转向组织行为决策**：Mollick 的招聘类比揭示了核心逻辑——AI 不是软件更新，而是数字员工，其判断风格（风险倾向/保守程度/创意偏好）会成为组织文化的隐性成分 

## 实践启示

1. **建立你自己的 vibes benchmark**：选择 3-5 个反映你核心工作场景的创意/推理任务，定期用它们测试新模型。不要依赖公开排行榜，要建立你自己的"otter test"来感知模型在你工作上的世界模型契合度 

2. **用 GDPval 方法设计你的评估集**：邀请领域专家创建 4-7 小时复杂任务，让 AI 和人类专家同时完成，由第三方不知道答案来源的专家评估。这种评估成本高，但能揭示 benchmark 看不到的真实能力差异 

3. **测试模型的态度倾向**：对模糊业务问题（如 guaca drone 测试）让每个模型独立评分 10 次，追踪其风险倾向分布。建立"模型态度档案"——这个信息在规模化部署决策中至关重要 

4. **每季度重新结构化面试你的 AI**：新模型不断出现，上季度"最好"的模型可能已落后。用招聘的思路持续跟踪——创建 realistic 场景、多次运行观察 pattern、让专家评估结果 

5. **警惕"足够好"的选型陷阱**：组织部署 AI 时倾向于选择"够用"的模型，但一个稍微差劲的金融分析 AI 或稍微更有风险偏好的建议 AI，影响的不是一次决策，而是千百次累积决策。选型时要看该模型在你的具体用例上的表现，而非平均 benchmark 

## 关键引用

> "What you actually care about is which model would be best for YOUR needs. To figure this out for yourself, you are going to need to interview your AI."

> "An AI that's slightly worse at analyzing financial data, or consistently more risk-seeking in its recommendations, doesn't just affect one decision, it affects thousands."

## 相关主题

- [Jagged Ai Frontier Mollick](../ch05/082-ai.html) — Jagged Frontier 概念（同一作者，更深入的能力地图分析）
- [Opinionated Guide Ai Right Now Mollick](../ch05/082-ai.html) — 模型选择实用指南（同一作者，同期不同议题）
- [Gpt5 Just Does Stuff Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/gpt5-just-does-stuff-mollick.md) — GPT-5 模型能力侧写（同一作者）
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/giving-your-ai-a-job-interview.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-and-benchmarks.md)

---

