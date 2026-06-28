## Ch15.004 SFT+DPO 双阶段微调：Qwen3-1.7B Tool Calling 精度提升方案

> 📊 Level ⭐⭐ | 9.2KB | `entities/aws-sagemaker-sft-dpo-tool-calling.md`

# SFT+DPO 双阶段微调：Qwen3-1.7B Tool Calling 精度提升方案

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-sagemaker-sft-dpo-tool-calling.md)

> **Core insight**: 通过 NVIDIA When2Call 数据集进行 Spectrum SFT 后再进行 DPO 偏好优化，Qwen3-1.7B 的 tool calling 精度从 41.57% 提升至 71.06%，超越参数量为其 2 倍的 Llama 3.2 3B；SFT 建立基础能力，DPO 在偏好数据上进一步校准输出分布

## SFT 与 DPO 方法对比
Supervised Fine-Tuning（SFT）通过高质量的明确示例教模型识别 tool-specific 语言、命令和约束，数据集（When2Call）包含 15,000 个 SFT 样本，每个样本包含可用工具列表和对话消息序列。Direct Preference Optimization（DPO）将人类反馈或预定目标直接融入训练循环，数据包含"优于这个、劣于那个"的偏好对（chosen/rejected），在不引入 reward function 或 reward model 的情况下实现与 RL 相当的目标对齐效果，显著降低资源需求和训练时间。

## SageMaker ModelTrainer 分布式训练架构
训练通过 SageMaker Python SDK ModelTrainer API 启动完全托管的训练集群，自动处理环境配置、弹性扩展和制品管理。Compute 配置使用 ml.p4d.24xlarge（8× NVIDIA A100），通过 Hugging Face Accelerate 和 DeepSpeed ZeRO-3 在多 GPU 间高效分片模型权重、梯度和优化器状态。SFT 使用 80% 阈值 CloudWatch 告警机制触发 Lambda Quota Calculator，结合 EventBridge 定时器实现动态阈值管理，完整流程与 Bedrock Ops Alert 一致。

## 双阶段训练配置与效果
第一阶段 Spectrum SFT 配置：Qwen3-1.7B，bf16 + flash_attention_2，learning_rate 5e-5，cosine scheduler，warmup_ratio 0.1，per_device_batch_size 4，gradient_accumulation_steps 2，max_seq_length 2048，packing=true。第二阶段 DPO 在 SFT 模型基础上继续：beta=0.1（控制偏好采纳激进程度），learning_rate 大幅降低至 5e-7，warmup_ratio 0.03，max_length 1536，max_prompt_length 768，loss_type=sigmoid，per_device_batch_size 2，gradient_accumulation_steps 8。

## 实验结果与关键数据
在 NVIDIA When2Call 评测集上，Qwen3-1.7B Base 精度 41.57%，经 Spectrum SFT 后提升至 60.43%（+19%），再经 DPO 后达到 71.06%（+10.5%），总计提升 30%。对比其他模型：Llama 3.2 3B Base 46.50% → SFT+DPO 62.67%；Qwen3-0.6B Base 47.64% → SFT+DPO 62.02%。Qwen3-1.7B SFT+DPO 最终领先 Llama 3.2 3B 约 8-9 个百分点，而参数量仅为后者一半，推理成本显著更低。

## 关键数据/实践启示
- When2Call 数据集：15,000 SFT 样本 + 9,000 DPO 偏好样本 + MCQ/LLM-as-Judge 测试集
- DPO beta 超参典型范围 0-2，越接近 0 越激进，越接近 2 越保守，默认 0.1-0.5 区间效果好但可能导致高方差
- DPO learning_rate 需显著低于 SFT（5e-7 vs 5e-5），配合 warmup_ratio 防止过拟合
- Qwen3-1.7B 经完整双阶段微调后精度达 71.06%，超越参数多一倍的 Llama 3.2 3B（62.67%）
- MLflow on SageMaker 集成实现训练指标追踪，keep_alive_period_in_seconds=3600 避免训练集群提前销毁
- 分布式训练：Accelerate + DeepSpeed ZeRO-3 组合实现多 GPU 高效并行

## 深度分析

### 1. SFT→DPO 两阶段的协同效应
SFT 和 DPO 不是替代关系而是互补关系：SFT 教模型"应该做什么"（给定工具列表和对话，正确选择和格式化工具调用），DPO 教模型"不应该做什么"（在多个合理输出中，偏好正确格式/参数而非错误格式/参数）。实验数据验证了这一互补性：SFT 单独提升 19%，DPO 在 SFT 基础上再提升 10.5%——DPO 的增量虽小于 SFT，但它优化的是 SFT 难以覆盖的边界情况（如参数微调、格式偏好）。

### 2. Qwen3-1.7B 超越 Llama 3.2 3B 的效率意义
1.7B 参数超越 3B 参数约 8-9 个百分点，意味着推理成本降低约 44%（参数量减半）而精度更高。这对生产部署的影响是双重的：更小的模型可以在更便宜的 GPU 上运行（如 T4 vs A100），且推理延迟更低（对 agentic 场景中连续 tool calling 的用户体验关键）。但需注意这一结论仅限于 tool calling 任务——在通用能力上 Qwen3-1.7B 仍弱于 Llama 3.2 3B。

### 3. DPO beta 超参的敏感性
beta=0.1 是一个相对保守的设置，控制 DPO 对偏好数据的采纳激进程度。beta 过高（>1）会导致模型忽略偏好信号、退化为 SFT 模型；beta 过低（<0.05）会导致模型过度拟合偏好数据、产生高方差输出。0.1-0.5 区间是实践中最常见的甜蜜点，但具体值需要针对数据集做网格搜索——这与 `Deepseek V4 Training Methodology` 中 DeepSeek 对 DPO 超参的精细调校经验一致。

### 4. When2Call 数据集作为 tool calling 标准基准
NVIDIA When2Call 数据集（15K SFT + 9K DPO）正在成为 tool calling 微调的事实标准。其优势在于：(a) 覆盖多种工具类型（API、数据库、搜索引擎）；(b) 包含 negative examples（何时不应调用工具）；(c) DPO 偏好对由 LLM-as-Judge 生成，降低人工标注成本。但局限性在于场景偏英文、偏简单工具——对多语言、复杂工具链的场景可能不够。

### 5. SageMaker 托管训练降低了微调门槛但锁定生态
SageMaker ModelTrainer API 将分布式训练配置（DeepSpeed ZeRO-3、gradient checkpointing、混合精度）封装为声明式配置，显著降低了从零搭建训练集群的门槛。但代价是 AWS 生态锁定——训练数据需在 S3、实验追踪用 MLflow on SageMaker、推理部署在 SageMaker endpoint。对需要多云或本地部署的团队，HuggingFace TRL + 自建集群是更灵活的替代路径。

## 实践启示

### 1. Tool calling 微调：SFT 先行、DPO 精调
不要跳过 SFT 直接做 DPO。SFT 建立 tool calling 的基础能力（识别工具、格式化参数），DPO 在此基础上优化边界情况。两阶段的总提升（30%）远大于任一阶段单独。

### 2. 小模型 + 精调 > 大模型 + prompt engineering
当任务聚焦（如 tool calling）时，1.7B 精调模型可以超越 3B base+prompt 模型。评估精调投资时，将推理成本节约（约 44%）纳入 ROI 计算，而非只看训练成本。

### 3. DPO 超参：从 beta=0.1、lr=5e-7 开始
DPO 的 learning_rate 应比 SFT 低 1-2 个数量级（5e-7 vs 5e-5），beta 从 0.1 开始。这是 TRL 社区经验验证的默认起点，偏离时先做小规模验证再全量训练。

### 4. 评估 tool calling：不要只用准确率
tool calling 的评估需要多维度：工具选择准确率、参数格式正确率、参数值准确率、何时不应调用的判断力。When2Call 的 MCQ + LLM-as-Judge 组合是一个起点，但生产级评估应加入你自己的工具集和错误模式。

### 5. SageMaker 用户：利用 keep_alive_period 避免调试期的集群回收
SFT→DPO 两阶段之间可能有数小时的调试和评估间隙。设置 keep_alive_period_in_seconds=3600 保持训练集群活跃，避免重复等待集群启动（约 10-15 分钟）。

## 相关实体
- [Aws Reinforcement Fine Tuning Llm As Judge](ch01-437-codex-autonomous-earning-money.html)
- [Aws Sagemaker Ai Agent Guided Workflows Finetuning](ch04-345-cloud-agent-development-environments-cursor-agent.html)
- [Build Real Time Voice Applications With Amazon Sagemaker Ai](ch04-470-protein-research-copilot-with-amazon-bedrock-agentcore.html)
- [Agent Reliability Context Drift Tool Hallucination](ch04-158-agent-harness-governance-identity.html)
- [Mcp Serveramazon Bedrock Agentcorequick Suite](ch04-285-1-6-star-ai-agent.html)

- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](ch01-800-scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on.html)
- MOC
## 相关引用
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-sagemaker-sft-dpo-tool-calling.md)

---
