# AWS GRPO RLVR Sagemaker Math Reasoning

## Ch11.100 AWS GRPO RLVR Sagemaker Math Reasoning

> 📊 Level ⭐⭐ | 9.8KB | `entities/aws-grpo-rlvr-sagemaker-math-reasoning.md`

# Overcoming reward signal challenges: Verifiable rewards-based reinforcement learning with GRPO on SageMaker AI
Training large language models requires accurate feedback signals, but traditional reinforcement learning (RL) often struggles with reward signal reliability. The quality of these signals directly influences how models learn and make decisions. However, creating robust feedback mechanisms can be complex and error prone. Real-world training scenarios often introduce hidden biases, unintended incentives, and ambiguous success criteria that can derail the learning process, leading to models that behave unpredictably or fail to meet desired objectives.
In this post, you will learn how to implement reinforcement learning with verifiable rewards (RLVR) to introduce verification and transparency into reward signals to improve training performance. This approach works best when outputs can be objectively verified for correctness, such as in mathematical reasoning, code generation, or symbolic manipulation tasks. You will also learn how to layer techniques like Group Relative Policy Optimization (GRPO) and few-shot examples to further improve results. You'll use the [GSM8K](<https://huggingface.co/datasets/openai/gsm8k/viewer/main/train?row=7294&views%5B%5D=main_train>) dataset (Grade School Math 8K: a collection of grade school math problems) to improve math problem solving accuracy, but the techniques used here can be adapted to a wide variety of other use cases.

## Technical overview
Before diving into implementation, it's helpful to understand the RL concepts that underpin this approach. RL addresses challenges in model training by establishing a structured feedback system through reward signals. This paradigm enables models to learn through interaction, receiving feedback that guides them toward optimal behavior. RL provides a framework for models to iteratively improve their responses based on clearly defined signals about the quality of their outputs, making it highly effective for training models that interact with users and must adapt their behavior based on outcomes. Traditional RL has highlighted an important consideration: the quality of the reward signal matters significantly. When reward functions are imprecise or incomplete, models can engage in "reward hacking," finding unintended ways to maximize scores without achieving the desired behavior. Recognizing this limitation has led to the development of more rigorous approaches that focus on creating reliable, well-defined reward functions.

## 深度分析

### RLVR双奖励机制的设计逻辑

RLVR的核心创新在于通过**程序化奖励函数**消除人类评分的瓶颈。 双奖励系统（format 0.5 + correctness 1.0）体现了分层验证的思想：格式奖励引导模型学习正确的输出结构，而正确性奖励则确保数学运算的准确性。这种分离设计使得奖励信号更加透明——当模型获得低分时，可以明确判断是格式问题还是计算错误。

从强化学习角度分析，format reward实质上是一种** shaping reward**，用于引导探索方向；correctness reward才是真正的目标奖励。两者组合最大值为1.5，形成了一个稠密的奖励空间，避免了稀疏奖励导致的学习困难。

### GRPO的组内相对优化机制

GRPO（Group Relative Policy Optimization）相比标准PPO的关键差异在于**组内基线比较**而非全局基线。 传统PPO使用价值函数作为基线，而GRPO将训练数据组织成有意义的组，在每个组内优化相对性能。

这种设计产生两个重要效果：
1. **方差降低**：组内样本相关性高于全局样本，梯度估计更稳定
2. **类别平衡**：避免模型在某些类别上过拟合而在其他类别上表现差

论文中的8-shot阈值激活现象（0-shot: 6% → 2-shot: 3% → 4-shot: 33% → 8-shot: 41%）揭示了GRPO需要**足够的组内样本数**才能有效学习相对优劣。少于4个样本时，组内比较无法提供足够的信号。

### QLoRA在RLVR训练中的角色

Qwen2.5-0.5B使用QLoRA（load_in_4bit: true）进行微调，这是出于**训练资源效率**的权衡。 LoRA rank=16，alpha=16的配置表明使用的是低秩适配而非full fine-tuning。

在RLVR场景下使用QLoRA的合理性：

- **奖励函数已知**：不需要模型记忆大量知识，只需调整输出行为
- **GPU资源约束**：GRPO需要同时运行多个生成和奖励计算，显存压力大
- **收敛速度**：LoRA通常收敛更快，适合数据量适中的场景（GSM8K仅7473条）

### 8-shot阈值的理论解释

文章观察到的非线性扩展模式值得深入分析：

| Shot数 | GSM8K准确率 | 相对于Base |
|--------|-------------|------------|
| 0-shot | 6% | -5% |
| 2-shot | 3% | -8% |
| 4-shot | 33% | +22% |
| 8-shot | 41% | +30% |

这种**相变现象**可能的原因：
1. **链式推理模式需要触发阈值**：GRPO在训练时生成多个候选响应并比较，few-shot示例帮助模型建立"生成多个解→选择最优"的习惯
2. **格式规范的内化**：8个示例中包含完整的`#### The final answer is`模式，模型学会一致地使用该格式
3. **组内多样性的临界质量**：4个以下样本时组内差异不足，无法有效学习相对排序

## 实践启示

### 1. 何时选择RLVR而非DPO/RM

RLVR适用于**输出可客观验证**的场景：

- 数学推理（答案唯一且可计算验证）
- 代码生成（可执行并通过测试用例）
- 符号推理（形式化验证）

对于**主观偏好类任务**（对话风格、创意写作），仍应使用DPO或人类偏好学习。判断标准：是否能用程序化方式判断输出正确性？

### 2. 奖励函数设计的最佳实践

从本文案例提炼的奖励函数设计原则：

```
奖励函数 = 格式奖励（引导探索空间）

          + 正确性奖励（确保目标达成）
          + 可选的中间奖励（可选，用于稀疏场景）
```

**格式奖励设计要点**：

- 使用正则表达式匹配期望模式
- 奖励值不宜过高（本文0.5 vs 正确性1.0），避免格式优先于内容

**正确性奖励设计要点**：

- 考虑数值精度问题（本文使用1e-3 tolerance）
- 预处理：去除逗号、货币符号等单位，统一格式
- 异常处理：正则未匹配时返回0而非报错

### 3. GRPO超参数配置建议

基于AWS SageMaker的实践配置：

| 参数 | 值 | 理由 |
|------|-----|------|
| learning_rate | 1.84e-4 | GRPO专用优化，低于标准PPO |
| num_train_epochs | 2 | 避免过拟合，数学任务数据量适中 |
| per_device_batch_size | 16 | 考虑GPU内存 |
| gradient_accumulation | 2 | 有效batch=32 |
| max_seq_length | 2048 | 8-shot需要更长上下文 |

### 4. 扩展到其他领域的路径

**代码生成**：

- 执行反馈作为奖励：编译成功、部分通过、全部通过
- 单元测试覆盖度作为奖励信号
- 奖励 shaping：每通过一个测试用例获得部分奖励

**领域文本生成**（医疗、技术文档）：

- 关键词覆盖度作为奖励
- 语义关系验证（症状↔诊断↔治疗的一致性）
- 部分奖励机制鼓励逐步逼近完整输出

### 5. SageMaker分布式训练注意事项

使用SageMaker进行GRPO训练的关键配置：

```python

# 分布式训练环境变量
env["FI_PROVIDER"] = "efa"  # 启用EFA高速网络
env["NCCL_PROTO"] = "simple"
env["NCCL_IB_DISABLE"] = "1"  # 禁用IB，使用EFA

# DeepSpeed ZeRO-3配置
# 分割optimizer states、gradients、parameters到多GPU
```

实例类型ml.g6.48xlarge（基于NVIDIA GPU）配合EFA网络，可有效支持亿参数模型的分布式RLVR训练。

## 相关实体
- [Aws Sagemaker Ai Agent Guided Workflows Finetuning](../ch04/396-aws-sagemaker-ai-agent.html)
- [Aws Sagemaker Capacity Aware Inference Fallback](../ch01/397-aws-sagemaker-capacity-aware-inference-fallback.html)
- [Stochastic Parrot Thought Experiment](../ch01/856-stochastic-parrot-thought-experiment.html)
- [Stochastic Parrot Thought Experiment](../ch01/856-stochastic-parrot-thought-experiment.html)
- [Overcoming Reward Signal Challenges Verifiable Rewards Based Reinforcement Learn](https://github.com/QianJinGuo/wiki/blob/main/entities/overcoming-reward-signal-challenges-verifiable-rewards-based-reinforcement-learn.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/llm-core-technology.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-grpo-rlvr-sagemaker-math-reasoning.md)

---

