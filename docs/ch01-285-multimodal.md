# Multimodal

## Ch01.285 Multimodal

> 📊 Level ⭐⭐ | 13.4KB | `entities/multimodal-evaluators-mllm-as-judge-image-to-text.md`

# Multimodal evaluators: MLLM-as-a-judge for image-to-text tasks in Strands Evals

> 来源：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/multimodal-evaluators-mllm-as-judge-image-to-text.md)

随着企业软件向多模态迁移，Gartner 预测到2030年80%的企业软件将具备多模态能力，而2024年这一比例还不到10%。在没有自动化多模态评估的情况下，企业只能在昂贵的人工审查和不可靠的纯文本代理之间做出选择。

## 核心要点

- AWS Amazon Bedrock 上的 Strands Evals 框架提出用 MLLM 作为 image-to-text 任务的自动评估器
- 解决传统指标（BLEU/ROUGE）与人类判断相关性低的问题
- 多模态评估器能捕捉视觉语义层面的质量差异，检测出 text-only judge 无法发现的视觉幻觉
- 默认使用 Claude Sonnet 4.6 作为 judge 模型

## 背景与动机

随着企业软件向多模态迁移（Gartner 预测2030年80%企业软件将具备多模态能力），传统 LLM-as-a-Judge 只能评估文本流畅度，无法验证模型输出是否真正基于源图像。这种 text-only 评估的局限性导致：

- 模型自信地描述图表中不存在趋势
- 幻觉出图片中不存在的产品、标签或人物
- 答非所问或格式错误

这催生了 多模态评估 的需求——让 judge 模型直接看到图像，结合文本 query 和 response 进行评分。

## 四种评估器

| 评估器 | 评分方式 | 核心问题 | 检测目标 |
|--------|----------|----------|----------|
| **Overall Quality** | Likert 1-5 | 响应整体质量如何？ | 相关性差、不准确、回答浅显、缺乏完整性 |
| **Correctness** | Binary | 响应是否事实正确且完整？ | 事实错误、属性/计数/位置错误、遗漏 |
| **Faithfulness** | Binary | 响应是否基于图像无幻觉？ | 虚构对象、无根据推理、外部知识泄露 |
| **Instruction Following** | Binary | 响应是否遵守查询约束？ | 格式违规、计数错误、偏题、忽略范围 |

每种评估器支持两种模式：

- **Reference-based**：对比 gold answer，适用于有标注测试集
- **Reference-free**：仅依靠图像判断，适用于无 ground truth 的实时场景

## 技术实现

评估流程：
1. 输入 MultimodalInput（含 `ImageData` + instruction）
2. Judge 模型接收图像 + query + response +（可选）reference answer
3. 返回评分 + reasoning string 用于调试
4. 通过 `Case` → `Experiment` → `Report` 工作流集成

```python
from strands_evals.evaluators import (
    MultimodalOverallQualityEvaluator,
    MultimodalCorrectnessEvaluator,
    MultimodalFaithfulnessEvaluator,
    MultimodalInstructionFollowingEvaluator,
)

evaluators = [
    MultimodalOverallQualityEvaluator(),       # Likert 1-5
    MultimodalCorrectnessEvaluator(),          # Binary
    MultimodalFaithfulnessEvaluator(),         # Binary
    MultimodalInstructionFollowingEvaluator(), # Binary
]
```

支持自定义 rubric：
```python
medical_eval = MultimodalOutputEvaluator(rubric="""Rate diagnostic accuracy:

- 1.0: All findings correctly identified with proper terminology.
- 0.5: Key findings identified but imprecise terminology.
- 0.0: Critical findings missed or misidentified.""")
```

## 关键设计发现

### Q1: Judge 需要看到图像吗？

实验表明，MLLM-as-a-Judge（图像+文本）比 text-only LLM judge（使用图像描述）与人手评分的一致性更高。生成图像描述的额外 LLM 调用也使得 text-only 路线并不更便宜。

**结论**：有多模态 judge 就直接用它。

### Q2: 选择哪个 Bedrock 模型？

在 Amazon Bedrock 上测试多种 MLLM 后：

- **推荐默认**：`Claude Sonnet 4.6`（最佳 accuracy-to-cost 权衡）
- 大型推理能力强的模型作为 judge 更可靠
- 高端模型相比中端模型在判断任务上没有明显精度优势

### Q3: Prompt 设计要点

1. **要求 judge 先推理再评分**：影响最大的单一因素
2. **包含少量多样化校准 examples**：从 zero-shot 到 few-shot 一致提升
3. **使用细粒度多维 rubric**：分离不同维度防止单一分数掩盖多种失败模式

### Reference 的使用

- **用于 content-grounded 指标**（Overall Quality, Correctness, Faithfulness）：有 reference 时与人手判断更一致
- **不用于 structural 指标**（Instruction Following）：reference 会干扰格式/结构约束检查

## 与现有技术的关系

本文属于 LLM 评估 和 多模态 AI 的交叉领域。相比：

- 传统 自动指标（BLEU, ROUGE, METEOR）仅比较文本相似度
- Text-only LLM-as-Judge 无法验证视觉 grounding
- 人工评估成本高且不可扩展

本文提出的 MLLM-as-Judge 范式将 judge 的感知能力扩展到视觉模态，实现了可扩展的自动多模态评估。

## 实用建议

- **快速检查**：默认使用 `MultimodalOverallQualityEvaluator`
- **诊断特定失败模式**：添加针对性的 binary 评估器
- **Judge 模型选择**：从 Claude Sonnet 4.6 开始，仅在成本/延迟成为瓶颈时才考虑更小模型
- **保持 reason+score 输出格式**：score-only 虽便宜但与人手一致性显著下降

## 未来方向

- 多模态工具使用 的步骤级评估
- Agent 轨迹 评估
- 更多模态组合：text-to-image, video-to-text, audio-to-text

## 深度分析

### 1. MLLM-as-Judge 填补了多模态 AI 评估的空白

在 MLLM-as-Judge 出现之前，多模态 AI 系统的主流评估方式有两个致命缺陷：传统指标（BLEU/ROUGE）只能衡量文本表面的相似度，无法判断模型是否真正"看懂"了图像；text-only LLM-as-Judge 虽然能评估文本质量，但 judge 从未见过图像，无法验证视觉 grounding——这正是视觉 AI 最核心的失败模式。Strands Evals 的四维评估器体系（Overall Quality、Correctness、Faithfulness、Instruction Following）将"质量"这个笼统概念拆解为可独立测量的维度，每个维度对应一种典型的多模态失败。这种分解式评估是诊断能力的基础：企业可以精准定位模型在哪个维度上弱，而不是笼统知道"这个结果不好"。

### 2. "先推理后评分"是提升 judge-to-human 一致性的最重要单一变量

实验数据显示，在 prompt 设计中要求 judge 先输出推理过程再给出评分，比直接要求评分的一致性显著更高。这个发现与 LLM 推理研究中的已知结论一致：LLM 在"逐步思考"模式下能更好地调动内部知识进行校验，减少仓促下结论的倾向。在评估场景中，这一特性尤为重要——reasoning string 不仅提升评分质量，还为 CI 失败提供了诊断信息，开发者不需要重新运行就能定位问题根因。

### 3. Reference-based 与 Reference-free 的选择逻辑有明确的理论依据

实验发现 reference 对不同类型指标的贡献不对称：content-grounded 指标（Overall Quality、Correctness、Faithfulness）在有 gold answer 时与人手评分一致性更高，而 structural 指标（Instruction Following）反而因 reference 的介入而下降。这个差异有直觉解释：Instruction Following 评估的是模型是否遵循了 query 中的格式/结构约束，reference 的存在会分散 judge 对 response 本身与 query 约束匹配度的注意力。这条发现给实际应用提供了明确指引——不是所有评估都需要 ground truth，评估器类型决定了是否需要标注数据。

### 4. Mid-tier reasoning-capable model 是 judge 的最佳性价比选择

实验数据显示，在 Bedrock 上的多种 MLLM 中，Claude Sonnet 4.6 提供最佳 accuracy-to-cost 权衡；更高端模型在判断精度上并没有显著优势。这对工程团队有直接指导意义：judge 模型的选型不应盲目追高，推理能力强但价格适中的模型（如 Sonnet 级别）是最优解。同时也揭示了一个重要原则——judgment 任务与生成任务对模型能力的要求并不相同，生成任务上更贵的模型不一定带来更好的判断效果。

### 5. 多模态评估是 LLM-as-Judge 范式的自然延伸而非颠覆

Strands Evals 的多模态 judge 保持了与文本 judge 完全相同的 `Case` → `Experiment` → `Report` 工作流，只是将 `MultimodalInput`（含 `ImageData`）引入输入层。这意味着现有基于 text-only judge 的评估基础设施可以无缝扩展到多模态场景，企业的评估平台不需要重建。MLLM-as-Judge 的增量价值在于将 judge 的感知范围从单一文本模态扩展到视觉+文本的联合空间，而评估框架的核心抽象保持不变。

## 实践启示

1. **多模态产品上线前必须引入 MLLM-as-Judge 评估**：视觉购物、文档理解、图表分析等场景中，text-only judge 会漏掉视觉幻觉类错误——这是用户信任的直接杀手。在 CI 管道中嵌入 `MultimodalFaithfulnessEvaluator` 可以自动化捕获这类缺陷，而这类缺陷在纯文本评估中完全不可见。

2. **先用 Overall Quality 做快速检查，再按失败模式叠加 binary 评估器**：不是每个场景都需要四个评估器同时跑。日常开发迭代用 `MultimodalOverallQualityEvaluator` 做 smoke test，检测到质量问题后叠加针对性的 binary 评估器（Correctness/Faithfulness/Instruction Following）定位根因。这种分层策略可以平衡评估成本和诊断深度。

3. **始终保留 reasoning+score 输出格式，不要切换到 score-only**：虽然 score-only 模式更便宜且自洽性更高，但 reasoning string 是 CI 失败时的主要诊断来源。放弃 reasoning 就是放弃可调试性——这在生产环境中是不可接受的权衡。即使需要控制成本，也应该用更小的模型而不是放弃 reasoning。

4. **建立领域特定的 custom rubric 库**：通用 rubric 适用于通用场景，但在医疗、法律、金融等合规要求高的行业，评估标准需要更精细的域内定义。通过 `MultimodalOutputEvaluator(rubric=...)` 接口传入领域特定的评分标准，可以让 judge 在专业语境下给出更有区分度的判断，逐步积累形成行业评估资产。

5. **关注多模态评估的下一步方向并提前布局**：当前评估器覆盖的是 image-to-text 场景，未来方向包括多模态工具使用的步骤级评估和 agent 轨迹评估。如果你的产品涉及视觉 Agent（如视觉推理、GUI 自动化），现在就应该关注 Strands Evals 的 roadmap，提前在数据标注和评估设计层面做准备，在工具使用评估能力成熟时可以快速集成。

## 延伸阅读

- Strands Evals 文档
- Amazon Bedrock
- Anthropic Claude 系列

## 相关实体
- [Yidian Tianxia Context Engineering Agentic Ai Qcon](/ch04-129-yidian-tianxia-context-engineering-agentic-ai-qcon/)
- [Building Multi Tenant Agents With Amazon Bedrock Agentcore](/ch03-066-building-multi-tenant-agents-with-amazon-bedrock-agentcore/)
- [Claude Code Harness Deep Understanding](/ch01-367-claude-code-harness-deep-understanding/)
- [Aws Reinforcement Fine Tuning Llm As Judge](/ch01-437-aws-reinforcement-fine-tuning-llm-as-judge/)
- [Amazon Bedrock Api Security Guide](/ch12-032-别让你的-amazon-bedrock-模型为他人打工-api-调用安全防护指南/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/multimodal-evaluators-mllm-as-judge-image-to-text.md)

---

**相关实体**：AWS · Amazon Bedrock · Strands Evals · MLLM · LLM-as-Judge · Claude Sonnet 4.6 · 多模态评估 · Image-to-Text · 评估框架

---

