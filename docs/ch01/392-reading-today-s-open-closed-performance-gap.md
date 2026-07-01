# Reading today's open-closed performance gap

## Ch01.392 Reading today's open-closed performance gap

> 📊 Level ⭐⭐ | 9.4KB | `entities/reading-todays-open-closed-performance-gap.md`

# Reading today's open-closed performance gap

> 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/reading-todays-open-closed-performance-gap.md)

> **Core insight**: 将开放-闭源性能差距视为单一"距离"数字掩盖了关键动态：benchmark 每 12-18 个月焦点转移、RLVR 训练 regimes 快速演化、以及评估复杂 LLM 工作流本身的挑战性。中国实验室在蒸馏杠杆上领先，但 RL 环境私有化趋势正在关闭这一路径。

## Benchmark 演化和训练 Regimes 的转移

开放模型将永远处于闭源模型的永久追赶模式，但这一"差距"被简化为单一数字时，遗漏了关于模型能力覆盖范围的微妙而关键的信息。最流行的基准是 Artificial Analysis Intelligence Index——约 10 个子评估的复合基准，持续跟踪当前语言模型能力的前沿。benchmark 会随时间演化，与人们实际使用模型的方式变得或多或少相关；不同模型的实际表现与基准排名的关系也不断变化；训练 regimes 也在不断演化以移动这些基准。

基准动态的核心在于行业不断变化。ChatGPT 之后，焦点是聊天、数学和简单代码的混合，指令调整和 RLHF 占主导地位。然后聊天的能力饱和并消退，数学变得不那么重要。到 2025 年及今天，特别是推理模型成为默认设置后，焦点转向更复杂的编码和其他更简单的 agentic 任务。当前训练配方都由带可验证奖励的强化学习（RLVR）主导，但应用领域从基础问答检查大幅转移到复杂环境。

## 前沿实验室的经济压力

一个值得深思的问题是：当前任务（编码和 terminal 任务）对于保持收入增长轨迹有多关键？在这些领域，OpenAI 和 Anthropic 相比领先的开源模型（甚至 Google）拥有巨大的商业采用优势。如果 agentic 编码能力饱和，"前沿" AI 性能转向其他地方，大量企业收入可能依赖于成熟的客户关系、惯性和更好的产品开发，而非模型远远领先。

Lambert 将此描述为前沿实验室需要不断"重新发明"自己，将 AI 基础设施大规模建设货币化的领域前景。他倾向于相信建设最终是值得的，Anthropic 和 OpenAI 将成为天文数字级利润的企业——这是对他们继续解锁模型有说服力的用例的信念，以及开放模型正在追赶的基准"不是完整信号"的信念的混合。

## 蒸馏 vs RL 环境：中国实验室的追赶杠杆

评估复杂语言模型工作流本身就是一个具有挑战性的研究问题。这些更新的任务涵盖专业领域——会计、法律、医疗等——它们仍然是 agentic 的，但需要更多专业知识，通常还需要与现有软件或特定领域工具的集成。领先的开源模型实验室受益于数据行业动态，经济上类似于建设芯片工厂：美国少数前沿实验室支付天文数字购买新环境和数据集，然后快速跟随的中国实验室通常以大幅折扣购买。

一个关键被忽视的点是：非前沿实验室用来跟上时代的杠杆在不断转移。认为蒸馏是中国模型进步关键杠杆的观点忽视了中国实验室当前训练 regimes 中 RL 环境的重要性。如果一个环境可以作为 Artificial Analysis Index 中的单一评估来构建或镜像，中国实验室目前能够跟上。关键问题是：当这些 RL 环境变得更加私有化时会发生什么？

## 开放模型的能力真相

中国实验室专注"稍微更侧重于基准"而非纯粹的超额学习是有道理的——他们有这种激励机制。他们的模型是真正强大的，这些动态与过度销售和真正创新之间的平衡并不简单。在某些分布外基准上，开源模型确实非常落后（如 WeirdML 或 ARC AGI 2），但也有无数随机基准显示这些开放模型出乎意料地强大。在使用时，你可以感受到这种缺乏鲁棒性（如长上下文能力，需要比 Claude/Codex 更频繁地重置 agent 上下文），但它们并不是根本不同类的模型——它们比许多人预期的更接近。

## 关键数据/实践启示

- **Benchmark 焦点转移周期**：行业每 12-18 个月转移基准焦点，评估方法需要同步演化
- **RLVR 主导地位**：当前训练由带可验证奖励的强化学习主导，但应用领域从基础 QA 转向复杂环境
- **蒸馏杠杆的局限**：中国实验室的蒸馏优势正在被 RL 环境私有化趋势侵蚀
- **Gemini 3 悖论**：令人印象深刻的基准分数 ≠ 实际部署和测试环境中的优势
- **开放模型比预期更接近**：长上下文鲁棒性是实际使用中的明显短板，但模型类别并无根本差异

## 深度分析

### 1. 开源-闭源性能差距的实证追踪
本文的核心贡献是对开源-闭源模型性能差距的量化追踪——不是直觉判断而是 benchmark 数据。这与 `Nathan Lambert Claude Mythos Open Weights` 中 Lambert 关于"差距是否静态化"的讨论直接相关——实证数据是政策讨论的基础。

### 2. RLVR 作为能力评估的新范式
RLVR（Reinforcement Learning from Verifiable Rewards）正在改变模型评估的方式——不只是看 benchmark 分数，而是看模型在可验证任务（数学、代码）上的实际表现。这一范式对开源模型更为公平，因为 RLVR 的结果比主观评估更可复现。

### 3. 经济学视角：推理成本 vs 性能差距
性能差距的经济学含义比技术差距更重要——如果开源模型在 80% 的任务上仅差 5%，但推理成本是闭源的 1/10，对大多数企业来说开源是更理性的选择。经济学分析应成为模型选型的核心输入。

### 4. 差距的非均匀性：不同能力的追赶速度不同
开源模型在代码生成上追赶最快（公开训练数据充足），在复杂推理上最慢（需要专有训练工艺），在多模态上居中。选型时应按能力维度而非总体分数评估差距。

### 5. 预测外推的不确定性
当前的趋势外推（开源每年追上 X%）假设训练方法论和算力获取的连续性——但两者都可能出现结构性变化（新架构突破、GPU 供应中断）。

## 实践启示

### 1. 模型选型：按能力维度评估而非总体分数
不要只看 MMLU/Chatbot Arena 总分。拆解到代码、推理、多模态等维度，找到你场景下差距最小的子维度。

### 2. 经济学计算：将推理成本纳入性能比较
比较总拥有成本（TCO）而非仅看 benchmark 分数。开源模型的推理成本优势可能使其在"足够好"的场景下比闭源更优。

### 3. 追踪 RLVR 评估而非传统 benchmark
RLVR 的结果更可复现、更难刷榜，是评估模型真实能力的更好指标。

### 4. 保持选型灵活性：差距在快速变化
每季度重新评估开源-闭源差距，而非一年做一次。差距的变化速度可能比预期快。

### 5. 用实证数据而非叙事驱动选型决策
"开源永远追不上"和"开源很快会超越"都是叙事，不是数据。用具体 benchmark 的历史趋势做决策。

## 相关实体
- [Latest Open Artifacts 21 Open Model Bonanza Gemma 4 Deepseek](ch01/777-deepseek.md)
- [Nvidia Nemotron 3 Ultra Sagemaker Jumpstart Moe Agentic](ch04/502-agent.md)
- [Ai Job Interview Model Evaluation Mollick](ch04/150-ai.md)
- [Claude Code Performance Benchmarking](ch03/073-claude-code.md)
- [Mythos_Offensive_Security_Xbow_Evaluatio](https://github.com/QianJinGuo/wiki/blob/main/entities/mythos_offensive_security_xbow_evaluatio.md)

## 相关引用
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/reading-todays-open-closed-performance-gap.md)

---

