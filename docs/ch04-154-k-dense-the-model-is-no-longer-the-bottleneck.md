# K-Dense — The Model Is No Longer the Bottleneck

## Ch04.154 K-Dense — The Model Is No Longer the Bottleneck

> 📊 Level ⭐⭐ | 12.5KB | `entities/k-dense-the-model-is-no-longer-the-bottleneck.md`

# K-Dense — The Model Is No Longer the Bottleneck

> **Source**: [K-Dense AI Blog](https://www.k-dense.ai/blog/the-model-is-no-longer-the-bottleneck) (2026-06, 9.7KB) by K-Dense team. 原始内容存于 `[K Dense The Model Is No Longer The Bottleneck](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/k-dense-the-model-is-no-longer-the-bottleneck.md)`。
>
> **核心论点**: 在 GPT-5 / Claude Opus 4.5 / Gemini 2.5 Pro 这代模型之后，**模型能力不再是科学 AI 应用的天花板**。真正的瓶颈是 **agentic workflow 设计** —— 如何让模型在多步推理中保持高质量上下文。

## TL;DR

- **What**: K-Dense (AI4Science 咨询团队) 在 2026-06 发表的文章，主张 "model is no longer the bottleneck" 假说
- **Why it matters**: 把工程注意力从 "用什么模型" 转向 "如何编排模型"——这是 2026 年 agent / harness engineering 浪潮的核心理由
- **How (4 case 论证)**:
  1. **材料科学** (无机晶体生成) — 同样 GPT-5 + 不同 harness，质量差异 3.5×
  2. **药物发现** (ADMET 预测) — 上下文工程（检索增强）比模型升级更重要
  3. **气候模拟** (降尺度) — 多 agent 协作 vs 单 agent 提升 2.8×
  4. **蛋白质设计** (binder 生成) — 反馈循环（dry-lab + wet-lab）harness 是关键

## 四个 case 的核心数据

### Case 1: 材料科学（无机晶体生成）

| Harness 设计 | 成功率 | 备注 |
|--------------|--------|------|
| 单 prompt + GPT-5 | 12% | baseline |
| 多步反思 (critic + revise) | 28% | + 2.3× |
| 工具增强 (RAG over Materials Project) | 41% | + 3.4× |
| 全 agent 编排（planner + executor + verifier） | **52%** | + 4.3× |

**结论**: 同样的模型，harness 设计能造成 **4.3× 质量差异**。

### Case 2: 药物发现（ADMET 预测）

- 模型: Claude Opus 4.5（不是升级前的 Sonnet 3.5）
- 关键改进: 把 SMILES 字符串 + IUPAC 名称 + 蛋白 binding pocket 描述 一起塞进上下文
- 上下文工程（不是 RAG，是 **structured context**）带来 18% 准确率提升
- 团队表示: "Sonnet 3.5 + 完美上下文 ≈ Opus 4.5 + 普通上下文"

### Case 3: 气候模拟（区域降尺度）

- 单 agent: 24h 完成 1 个区域
- 多 agent 协作（4 agent 各负责 1 季度）: 6h 完成，质量提升 2.8×
- 关键发现: **多 agent 之间的协调 overhead 小于并行收益**

### Case 4: 蛋白质设计（binder 生成）

- 传统: LLM 一次性生成 binder 序列 → 实验验证
- 新型 harness: dry-lab (LLM 评分) + wet-lab (experimental data) 反馈循环
- 4 轮迭代后 binder 亲和力提升 12×（vs 单次 1×）
- 关键: harness 包含 **数据回流机制**，让模型持续学习

## 核心论点：Context Quality > Model Capability

文章给出一个公式（K-Dense 团队内部使用）：

> **Effective Capability = Model IQ × Context Quality × Harness Design**

| 因子 | 2024 占比 | 2026 占比 | 趋势 |
|------|-----------|-----------|------|
| Model IQ | 70% | 35% | ↓ (claude opus 4.5 / gpt-5 已到天花板) |
| Context Quality | 20% | 35% | ↑ (RAG, structured context, multi-modal) |
| Harness Design | 10% | **30%** | ↑↑ (multi-agent, feedback loops, planning) |

**含义**: 2024 年大家卷模型（finetune, 蒸馏），2026 年大家应该卷 **harness**（编排、上下文、多 agent 协作）。

## 与现有实体的关系

- **支撑 [Ahe Agentic Harness Engineering](/ch04-212-ahe-agentic-harness-engineering/)** — K-Dense 提供 4 个科学 AI 案例佐证 "harness 决定上限"
- **呼应 [How Harnesses And Post Training Close The Open Weight Bug Finding Gap 20260606](/ch01-232-how-harnesses-and-post-training-close-the-open-weight-bug-fi/)** — Anthropic 主张 harness > pretraining；K-Dense 用科学 AI 数据给出量化证明
- **支持 Miroflow Deep Research Agent Harness Mirothinker** — Deep Research 类 harness 是设计典范，单模型质量不及 harness
- **补充 [Agent Harness Engineering Survey 2026](/ch04-069-agent-harness-engineering-a-survey/)** — Survey 中 "context engineering" 一节的科学 AI 实例

## 实践启示

1. **不要追新模型** — GPT-5 vs Opus 4.5 在工程差异 < 5%；把精力放在 harness
2. **context 是上限** — 投资 RAG、structured context、multi-modal context（不是更多 GPU）
3. **多 agent 不是噱头** — 4 agent 并行在气候 / 材料 / 蛋白质任务都验证有效
4. **反馈循环是核心** — dry-lab + wet-lab / critic + reviser / planner + executor

## 局限

- 4 个 case 都来自 K-Dense 自己做的项目（样本偏差）
- 没有对比 SFT/RLHF 后的模型——可能 post-training 后的模型在同等 harness 下仍有差距
- "Context Quality" 难以量化（vs Model IQ 容易 benchmark）

---

**Score**: v=7, c=8, v×c=56, stars=4 — 文章不长（9.7KB）但 4 个 case 数据扎实，论点清晰（"model is no longer the bottleneck" 假说），与现有 harness engineering 体系高度契合。

**Tags**: harness, agentic, context-engineering, scientific-ai, k-dense, bottleneck, multi-agent, feedback-loop

## 深度分析

1. **科学 AI 的瓶颈已从"模型能做什么"转向"系统让模型做什么"**
   - 核心观点：Anthropic 的 Chemistry 结果（通用模型在 NMR 任务上击败专用软件）证明模型能力已不再是科学 AI 的瓶颈。真正的限制是模型周围的 scaffolding——数据接入、代码执行、验证机制、审计输出。
   - 技术要点：K-Dense 公式 **Effective Capability = Model IQ × Context Quality × Harness Design** 说明在 2026 年，Model IQ 的边际收益已递减，而 Context Quality 和 Harness Design 成为新的价值杠杆。
   - 实践价值：当"用更强的模型"带来的提升<5%时，工程资源应转向 harness 设计。这与 [How Harnesses And Post Training Close The Open Weight Bug Finding Gap 20260606](/ch01-232-how-harnesses-and-post-training-close-the-open-weight-bug-fi/) 中 Anthropic 的主张呼应。

2. **4 个 case 提供了 harness 设计量化价值的稀缺证据**
   - 核心观点：K-Dense 的 4 个科学 AI case（材料/药物/气候/蛋白质）是少数提供了"同一模型 + 不同 harness → 4.3× 质量差异"量化数据的来源。这打破了"harness 只是锦上添花"的误解。
   - 技术要点：材料科学 case 中，全 agent 编排（planner+executor+verifier）比单 prompt 高出 4.3×；药物发现 case 中，structured context 比模型升级带来 18% 准确率提升。
   - 实践价值：证明了"多 agent 协作"和"上下文工程"不是理论上的好处，而是有量化支撑的实际价值。

3. **科学 AI 的四个真实需求：数据、代码、验证、审计**
   - 核心观点：文章明确指出"answer vs result"的差距——聊天回复≠研究结果。研究结果需要完整证据链：正确的真实数据、正确的分析方法、输出校验、可审计的产出。
   - 技术要点：这四个需求分别对应：RAG over 250+ 科学数据库（数据）、模型写代码并执行而非描述代码（代码）、验证候选答案而非断言（验证）、产出方法/数据/脚本/图表而非 confident paragraph（审计）。
   - 实践价值：这四个需求是设计任何科学 AI harness 的核心验收标准，也是当前大多数 LLM 应用缺失的部分。

4. **多 agent 协作的协调 overhead 小于并行收益（气候 case: 4× 加速，质量 2.8× 提升）**
   - 核心观点：气候模拟 case 中，4 agent 并行（各负责 1 季度）比单 agent 快 4×，质量还提升 2.8×。这说明多 agent 的协调成本在很多科学 AI 场景下是净正收益。
   - 技术要点：关键发现是"多 agent 之间的协调 overhead 小于并行收益"。这要求任务可分解、子任务间依赖少、agent 间通信开销低。
   - 实践价值：对 Multi Agent Collaboration Patterns 和 Orchestrator Worker Architecture 提供了科学 AI 领域的实证支撑。

5. **反馈循环（dry-lab + wet-lab）是蛋白质设计 harness 的关键**
   - 核心观点：蛋白质设计 case 中，4 轮迭代后 binder 亲和力提升 12×，而单次生成仅 1×。关键在于 harness 包含数据回流机制，让模型在每一轮 dry-lab 评分后接收 wet-lab 实验反馈。
   - 技术要点：这是"模型在环"（model-in-the-loop）的具体实现——不是一次性生成，而是生成→评分→反馈→再生成的迭代循环。
   - 实践价值：对 Harness Loop Architecture 提供了wet-lab 实验数据闭环的案例。

## 实践启示

1. **评估科学 AI 项目时，首先问"模型周围的系统"而非"用哪个模型"** — 在 GPT-5/Opus 4.5 时代，模型选择差异<5%，真正的价值上限由 harness 决定。优先评估数据接入、代码执行、验证机制、审计输出的完整性。

2. **科学 AI harness 设计应包含四层：数据→分析→验证→审计** — 缺少任何一层都会导致"chatbot answer"而非"research result"。特别是验证层（检查候选答案而非直接输出）被普遍忽视。

3. **多 agent 协作在任务可分解场景下是净正收益** — 气候/材料/蛋白质设计的 case 表明，当子任务间依赖少时，多 agent 协调 overhead 小于并行收益。可以参考 Orchestrator Worker Architecture 设计这类 harness。

4. **建立反馈循环机制是 harness 的核心竞争力** — 无论是 critic+revised（代码场景）还是 dry-lab+wet-lab（科学实验场景），迭代反馈循环带来的质量提升远超单次生成。对照 Harness Loop Architecture 设计反馈机制。

5. **Context Quality 是 2026 年 harness 工程的首要投入方向** — K-Dense 公式显示 Context Quality 占比从 20%→35%，与 Context Engineering 的重要性趋势一致。Structured context、RAG、multi-modal context 都是提升 Context Quality 的手段。

---

