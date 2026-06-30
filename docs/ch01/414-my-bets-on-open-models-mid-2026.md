# My bets on open models, mid-2026

## Ch01.414 My bets on open models, mid-2026

> 📊 Level ⭐⭐ | 8.8KB | `entities/my-bets-on-open-models-mid-2026.md`

# My bets on open models, mid-2026

## 相关实体

- [dean ball on open models and government control](ch01/853-dean-ball-on-open-models-and-government-control.md)
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/my-bets-on-open-models-mid-2026.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/reinforcement-learning-rlhf.md)
## 摘要

Nathan Lambert（Interconnects AI）2026 年 4 月发表的这篇长文把"开源 vs 闭源模型谁会赢"这个常见但失焦的问题，拆成了 13 个具体可下注的判断。核心论断：这是一个经济学问题，而不是能力问题 — 闭源在 RL 训练范式下占据真实使用场景的数据优势，开源在重复性自动化场景的 API 份额会继续扩大；中国开源实验室的"benchmark 焦点"和"美国开源实验室的复苏"会同时发生。

## 核心要点

### 1. 能力差距没有按算力差距线性扩大

Lambert 最反直觉的观察是：基于训练算力的巨大差距，2025 年下半年到 2026 年初，**闭源头部模型相对开源的领先优势反而没有按比例拉开**。这与"算力 = 能力"的朴素预期相悖。

这意味着：开源实验室的人才密度 + 充足算力 + 蒸馏快速跟进能力在成熟 benchmark 上能持续追平。但 Lambert 同时指出闭源在"难以量化的硬质量"（如对真实知识工作者的稳健支持）上仍领先，这部分能力不会出现在 benchmark 上。

### 2. RL 训练范式让"真实使用分布"成为新护城河

闭源实验室的下一个明显优势点：**RL 训练时代的"真实世界使用分布"**。具体表现为 Claude Code、Codex 这类 agent 工具产生的用户轨迹（Cursor 的实时 RL 就是典型案例），这些数据只能由闭源产品大规模收集。

这条线给 agent 产品选型带来直接含义：在一个闭源模型拥有真实 agent 使用反馈数据的领域，开源模型的 benchmark 分数对生产可用性的预测力在下降。

### 3. 重复性自动化是开源的真正主场

Lambert 预测：开源模型在 **重复性自动化任务** 的 API 市场份额会持续增长，形式是大量 AI-native 应用 + 企业后端自动化 + 领域特定模型（efficient open models）。这是开源最稳的应用层护城河。

驱动这一趋势的不是基准分，而是"领域特定化"的成本结构 — 为重复性任务专门训练的小模型，单位 token 成本比闭源旗舰低一个数量级，质量已经够用。

### 4. 中国开源实验室的"benchmark 焦点"是激励结构的必然

中国开源实验室"略多"地聚焦 benchmark 分数（蒸馏帮助但不万能）。这是它们**维护"追上 frontier"叙事**的理性选择 — 该叙事对融资和采用率都至关重要。

这一判断与"中国 AI 必然追平美国"的流行叙事不同：Lambert 强调这是商业激励驱动的 benchmark 优化，而非全面能力溢出。

### 5. 开源 vs 闭源将是经济持久力游戏

模型竞争在 benchmark 层面将"主要是一场经济持久力和快速跟进的游戏，直到市场结构收缩"。中国实验室会最先面临融资难，预计 2026 年内出现，融资问题会在 3-9 个月后反映在能力轨迹上。

对工程决策的含义：不要基于"中国开源模型会持续无限期免费高性能"做长期架构选型；评估 6-12 个月内的可持续性。

### 6. 美国开源采用率将在 2027 年初开始回潮

美国实验室（Gemma 4、Nemotron、Arcee AI）的开源采用率从 2027 年初开始会缓慢回升 — 中国 velocity 衰减再翻转需要时间。

这是少有的具体时间预测：2026 年仍是中国的开源优势期，但 2027 年起市场会重新分化。

### 7. 本地 agent 与个人 agent 是"暗物质"市场

**本地 agent、OpenClaw 等个人 agent** 代表一个到目前大多被忽略的开源使用市场。Lambert 把它称为"暗物质" — 普遍存在、潜力巨大、对开源/闭源平衡影响深远。

这一观察对 [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](ch03/012-openclaw.md) 类工作意义重大：个人 agent 很可能成为开源模型的真正主战场，而不是云端 API 服务的二等替代品。

### 8. 开源融资结构必然出现新形式

"对单一盈利公司提供 intelligence 的依赖不可靠"这一认知会催生新的开源融资结构（基金会、主权基金、长期合作社等）。

## 深度分析

开源与闭源的竞争常被简化为"谁能追上谁"的二元叙事，但 Lambert 强调这本质上是经济结构与激励机制的复杂博弈 — 需求侧（全球用户对开源的渴望）与供给侧（谁能持续融资并保持算力投入）高度分离，供需均衡点由经济模型而非技术天赋决定。

RL 训练时代真正的新护城河不是公开 benchmark 上的分数，而是"真实世界使用分布" — Cursor 的实时 RL 案例表明，Claude Code、Codex 等闭源产品能大规模收集 agent 轨迹数据，这种分布优势会随着用户规模扩大而自我强化，开源模型在此维度的差距难以通过蒸馏弥补。

个人 agent 和本地部署场景构成了被主流分析框架忽视的"暗物质"市场 — 这个市场对隐私敏感、需离线运行、强调个性化定制的用户有天然吸引力，开源模型在这里不是闭源的替代品，而是唯一可行的技术路径，其市场规模和影响力可能被严重低估。

中国开源实验室对 benchmark 分数的侧重反映了一种理性的激励结构 — 维护"追上 frontier"的叙事对融资和用户采用至关重要，这驱动它们在公开排名上持续投入，但这种策略的真实能力提升效果与叙事包装之间存在不可忽视的偏差。

开源融资生态的脆弱性正推动新型结构的出现 — 当业界逐渐认识到对单一商业公司提供 intelligence 的依赖不可靠，主权基金、基金会、合作社等多元融资形式将成为开源模型的支撑体系，这些结构的变化将直接影响模型能力的演进轨迹。

## 实践启示

1. **模型选型的双轨策略**：在"难以量化的稳健性"任务（知识工作直接助手）继续选闭源旗舰；在"重复性自动化"任务（批处理、后端脚本、领域工具链）选开源小模型 + 微调，单位成本可降低 5-10 倍。
2. **关注真实使用反馈数据而非 benchmark**：当闭源实验室把"RL 训练范式 + 真实 agent 使用"作为差异化能力时，benchmark 分数对生产可用性的预测力在下降；评估应看任务在自家数据分布上的胜率。
3. **不要押注"中国开源无限期免费"**：2026 年内可能出现融资波动，反映在能力轨迹上需要 3-9 个月。架构选型保留开源/闭源可替换层。
4. **个人 agent 是被低估的开源主战场**：本地推理 + 隐私敏感场景 + 个性化任务 = 开源模型真正的差异化市场；优先投入这一层会带来长期复利。
5. **关注"难以量化的稳健性"指标**：闭源旗舰的领先不是 benchmark 分数，而是对新颖挑战、指令遵循、格式一致性的稳健支持 — 这些都是当前评估体系的盲区。

## 关联实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch04/503-agent.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](ch03/012-openclaw.md)
- [Karpathy Vibe Coding Agentic Engineering](ch04/123-karpathy-vibe-coding-agentic-engineering.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch04/503-agent.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](ch03/012-openclaw.md)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](ch04/503-agent.md)
- [Rlhf Dpo Grpo Alignment](https://github.com/QianJinGuo/wiki/blob/main/concepts/rlhf-dpo-grpo-alignment.md)

---

