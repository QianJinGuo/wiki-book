# Amazon Nova Forge 域定制超参调优：艺术与科学

## Ch11.057 Amazon Nova Forge 域定制超参调优：艺术与科学

> 📊 Level ⭐⭐ | 11.6KB | `entities/amazon-nova-forge-hyperparameter-tuning-art-science.md`

# Amazon Nova Forge 域定制超参调优：艺术与科学

## 概述

Amazon Nova Forge 是 AWS 提供的**自建前沿模型**定制服务，核心价值在于：从早期 checkpoint 起步、混合专有数据与 Amazon Nova 精选数据、在 AWS 上安全托管定制模型。**数据混合 (data mixing)** 能力是核心 — 让模型吸收领域知识同时保留通用推理与指令遵循能力，避免 catastrophic forgetting。

## 三大定制阶段

| 阶段 | 作用 | 适用数据 | 关键考量 |
|------|------|----------|----------|
| **CPT (Continued Pre-Training)** | 通过自监督学习扩展基础模型领域知识 | 大规模无标注领域文本 (100B+ tokens) | 需数据混合 + checkpoint 选择 |
| **SFT (Supervised Fine-Tuning)** | 用输入-输出对定制模型行为 | 1,000-10,000 高质量标注 (质量 > 数量) | 必含 "reasoning-instruction-following" 类别 |
| **RFT (Reinforcement Fine-Tuning)** | 用 reward signal 引导输出优化 | prompts + reward function | baseline 准确率需适中 (不能太低也不能太高) |

## 三大超参挑战

### 1. Catastrophic Forgetting (灾难性遗忘)

训练窄领域数据时，模型覆盖预训练的通用能力。表现：客服模型微调后失去模糊请求推理能力。Nova Forge 通过**数据混合 + checkpoint 选择** 解决。

### 2. Learning Rate (学习率)

**最敏感的超参数**：
- 太高 → 模型过冲、训练不稳定、快速遗忘 base 能力
- 太低 → 收敛过慢、浪费算力
- 与数据混合策略强耦合：**使用数据混合时偏离默认学习率 = 训练不稳定的首要原因**

### 3. RFT Baseline 约束

RFT 仅在 baseline 准确率**适中的范围**内有效：
- 准确率太低 → 没有足够好的样本供 reward-guided exploration 学习
- 准确率已经很高 → 边际收益递减，且可能损害现有性能
- **结论**：RFT 不能弥补大能力鸿沟，只能强化已有能力

## 战略决策树

### Checkpoint 选择 (最影响决策)

| Checkpoint | 灵活性 | 适用场景 | 注意事项 |
|------------|--------|----------|----------|
| **Pre-trained** | 最高 | 大规模 CPT (>100B tokens)，可用更高 LR (1e-4) | 必须后接 SFT 恢复指令遵循 |
| **Mid-trained** | 平衡 | 中等规模 CPT、全秩训练 (Full Rank) | 平衡灵活性与稳定性 |
| **Post-trained** | 最低 | 小规模 CPT、LoRA 微调 | 保留 alignment，是 LoRA 推荐起点 |

### Training Mode 选择

- **LoRA** (推荐起步)：
  - 只更新适配层，迭代快、成本低
  - 对亚优超参更宽容
  - 适配 post-trained checkpoint
  - 默认 alpha=64
- **Full Rank** (进阶)：
  - 更新所有参数，最大适配能力
  - 需 Bedrock Provisioned TPUT 部署
  - 适合大规模结构化数据 + mid-trained checkpoint

## 关键数字锚点

- **数据混合比例**：客户数据 ~50% 是大多数用例的平衡点
- **必含类别**：SFT 必须包含 `reasoning-instruction-following` 类别，否则通用 benchmark 性能下降
- **LR 默认值**：Nova Forge 服务默认值（偏离即可能不稳定）
- **数据量阈值**：CPT 通常需 100B+ tokens，pre-trained checkpoint 才发挥优势
- **SFT 数据量**：1,000-10,000 高质量样本 (质量/一致性/多样性 > 数量)

## 实战推荐工作流

1. **SFT 起步**：用 LoRA + post-trained checkpoint 教目标行为
2. **RFT 升级**：在 SFT baseline 上叠加 reward function
3. **Full Rank 进阶**：当 LoRA 收益饱和、部署架构支持 Provisioned TPUT 时迁移

## 深度分析

### 1. 稳定性-灵活性权衡是超参调优的核心矛盾

Amazon Nova Forge 的超参挑战背后，本质是**稳定性-灵活性权衡 (stability-flexibility tradeoff)** 这一基础矛盾的具体实例化。模型需要足够的灵活性来吸收新领域知识，但过度的灵活性会破坏预训练已建立的通用能力（catastrophic forgetting）。数据混合和 checkpoint 选择是解决这一权衡的两大核心杠杆，而学习率则是控制这一权衡幅度的最敏感调控器。这条矛盾线贯穿 CPT/SFT/RFT 三个阶段——CPT 阶段灵活性最高但稳定性最低；RFT 阶段稳定性最高但灵活性最低（只能微调已有能力边界）。

### 2. 学习率对数据混合的强耦合性

原文明确指出：**"Deviating from the default learning rate when mixing Nova data with your own data is the most common source of training instability"**。这不是一个普通的超参数敏感性声明，而是揭示了一个系统性耦合关系——当数据分布从单一来源变成混合分布时，梯度景观 (gradient landscape) 发生根本性变化，默认学习率的假设前提不再成立。学习率与数据混合比例之间存在非线性交互：50% 混合比例下的最优学习率可能与纯客户数据或纯 Nova 数据的最优值相差一个数量级。调参者必须将这两个超参视为联合变量，而非独立搜索维度。

### 3. RFT 基线性能的双向约束机制

RFT 的有效性被双向约束在基线准确率的中间区间：过低则 reward-guided exploration 没有足够的正样本可供强化；过高则边际收益递减且存在破坏已有性能的风险。这与传统的"更多训练=更好"假设完全不同，意味着 RFT 是一个**能力边界精调**工具，而非**能力跃迁**工具。对于实际应用，这意味着在启动 RFT 之前，必须通过 SFT 将基线准确率推到"可教育"的窗口内——AWS 文档暗示这个窗口的大致边界是 baseline 准确率需要 >5% 的 positive reward。

### 4. Checkpoint 选择决定上限，超参只是填充细节

原文在 checkpoint 选择部分写道：**"For CPT, checkpoint selection is more impactful than any hyperparameter"**。这是一个极具实践意义的判断——它意味着即使所有超参都调至最优，如果 checkpoint 选择不当，模型能力的上限已经被限制了。Pre-trained checkpoint 适合大规模 CPT 但需要后续 SFT 恢复指令遵循；Post-trained checkpoint 保留了 alignment 但灵活性最低；Mid-trained checkpoint 则处于两者之间。这一决策树的不可逆性（选择一个 checkpoint 就选择了不同的训练路径）要求实践者在动手调参之前先完成这一战略决策。

### 5. Reward Function 质量优先于所有超参数

在"Common pitfalls"章节，原文将 **reward function 质量** 置于所有超参数之前：一个差的 reward function 会导致准确率下降，无论其他超参数如何调整；而一个精细的 reward function 在相同基础设施上产生一致的性能提升。这一原则对于所有 reinforcement learning 应用都具有普遍意义——它揭示了 catastrophic forgetting 之外另一种模型能力损失路径：reward hacking，即模型找到绕过 reward 函数意图的捷径，而非真正改进目标行为。LLM-as-judge 的选择同样需要验证，确保评判模型在模型输出质量范围内具有区分度。

## 实践启示

### 1. 始终从服务默认值起步，特别是使用数据混合时

Nova Forge 的服务默认值是经过跨场景测试的配置，代表了稳定性-性能的最佳平衡点。对于 SFT+LoRA，推荐值是 `LR=1e-5`；对于 Full Rank SFT，是 `LR=5e-6`。当使用数据混合时，默认值更是唯一安全起点——偏离是训练不稳定的首要原因。先用默认值建立基线，再以此为基准进行有方向的扰动实验，而非从一开始就做大范围超参搜索。

### 2. 用 LoRA + post-trained checkpoint 起步验证 Pipeline

LoRA 对亚优超参的宽容性使其成为 pipeline 验证的理想起点。Post-trained checkpoint 保留了指令遵循和 alignment 能力，进一步降低了新领域训练的起步风险。这一组合能用最小算力代价验证数据质量、prompt 设计合理性和 reward function 有效性。只有在 LoRA 验证了完整流程可行之后，才考虑迁移到 Full Rank。

### 3. SFT 必须包含 Reasoning-Instruction-Following 类别

在 SFT 的 Nova 数据混合中，包含 `reasoning-instruction-following` 类别是**必选项而非可选项**。跳过这一类别是导致 fine-tuned 模型 reasoning 性能下降的常见原因。这个类别的作用是维持模型的通用推理和指令遵循能力，防止域定制过程对通用 benchmark 性能造成不必要的侵蚀。这与 LLM pre-training vs SFT 之间的关系一致——SFT 阶段如果缺少通用能力类别的监督信号，模型会在特定任务上过拟合而丧失泛化能力。

### 4. 数据质量优先，混合比例以 50% 为实验起点

原文明确**"quality, consistency, and diversity matter more than volume"**，且混合比例的推荐起点是 **50% 客户数据**。对于超参调优的实际工作流，这意味着应该先投入时间在数据清洗和质量控制上，而非在错误的低质量数据上优化混合比例和超参数。同时，training data 应该把最高质量的数据放在训练末尾，以获得更好的收敛性。

### 5. CPT 只跑一个 Epoch，监控 Validation Loss 防止 Overfitting

CPT 阶段**最多只跑一个 epoch**——重复处理有限数据会导致过拟合和通用能力损失。这一约束对于私有化领域数据尤其重要，因为大多数组织的数据量相比预训练语料都极为有限。Validation loss 是核心监控指标：如果 training loss 下降而 validation loss 上升，说明已经进入过拟合状态，应该立即停止训练。对于 Checkpoint 选择，当数据规模较小时，post-trained checkpoint 的稳定性优势往往超过 pre-trained checkpoint 的灵活性收益。

## 相关实体
- [Build Real Time Voice Streaming With Amazon Nova Sonic And Webrtc](/ch01-450-build-real-time-voice-streaming-applications-with-amazon-nov/)
- [Amazon Nova Lite Fine Tuning Cost Effective Vision Detection Model Tuning Case And Practice](/ch11-054-amazon-nova-lite-fine-tuning-高性价比的视觉检测模型微调案例与实践-亚马逊aws官方博/)
- [Evaluate Amazon Nova Sonic Voice Agent Scale No Mic](/ch11-033-evaluate-your-amazon-nova-sonic-voice-agent-at-scale-no-mic/)
- Amazon Nova Manufacturing Intelligence
- [Real Time Voice Agents With Stream Vision Agents And Amazon Nova 2 Sonic](/ch04-048-real-time-voice-agents-with-stream-vision-agents-and-amazon/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/the-art-and-science-of-hyperparameter-optimization-on-amazon-nova-forge.md)

---

