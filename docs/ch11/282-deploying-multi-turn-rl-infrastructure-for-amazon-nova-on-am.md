# Deploying Multi-Turn RL Infrastructure for Amazon Nova on Amazon SageMaker HyperPod

## Ch11.282 Deploying Multi-Turn RL Infrastructure for Amazon Nova on Amazon SageMaker HyperPod

> 📊 Level ⭐⭐⭐ | 7.3KB | `entities/deploying-multi-turn-rl-infrastructure-for-amazon-nova-on-amazon-sagemaker-hyper.md`

# Deploying Multi-Turn RL Infrastructure for Amazon Nova on Amazon SageMaker HyperPod

## 摘要

AWS 提出了面向 Amazon Nova 模型在 SageMaker HyperPod 上运行多轮强化学习（Multi-Turn RL）的生产级基础设施方案。该方案采用两阶段部署模型：一次性 CDK 部署构建长生命周期基础架构（VPC、EKS、HyperPod 集群、ECS、S3、IAM 及 Step Functions 管线），每次训练运行时动态创建临时资源。这种分离设计将 GPU 闲置成本降到最低，同时支持快速迭代。核心架构由三层组成：SageMaker HyperPod（EKS）负责模型推理与 GRPO 权重更新，ECS on Fargate 运行奖励环境，Nova Forge SDK 在模型与奖励环境之间路由消息并追踪多轮对话状态。

## 核心要点

- **多轮 RL vs 标准 RLHF**：标准 RLHF 优化单次响应的质量，而多轮 RL 优化整个交互序列——包括工具编排、错误恢复、多步推理。SFT、RAG 和继续预训练等技术无法单独教授这些顺序决策能力。
- **两阶段部署架构**：Phase 1（一次性）通过 AWS CDK 置备长生命周期基础设施；Phase 2（每次训练运行时）通过 S3 上传触发 EventBridge → Step Functions 管线自动创建运行时资源。
- **三层计算面**：SageMaker HyperPod (EKS) 承载 vLLM 推理和 GRPO 训练；ECS Fargate 运行奖励环境（支持 Wordle 或自定义 BYOO 环境）；Nova Forge SDK 代理层在模型与奖励环境之间路由消息。
- **事件驱动训练触发**：上传 `.jsonl` 文件到 S3 的 `training-data/` 前缀即可自动启动训练管线，每个数据样本包含 prompt 和 ground-truth answer，奖励环境据此评分。
- **成本管理**：运行状态下约 $786-$1,180/小时（10-12 台 ml.p5.48xlarge 实例），建议非训练时段销毁堆栈。支持 scale-to-zero 和实例类型调度优化。

## 深度分析

### 多轮 RL 的企业级意义

企业 agent 执行多步工作流时（查询数据库 → 调用 API → 交叉验证结果 → 从中途失败恢复），每一步的质量都依赖于后续若干步的结果。传统 RLHF 将每次响应视为独立优化目标，无法捕捉这种时序依赖。多轮 RL 通过 GRPO（Group Relative Policy Optimization）在完整交互序列上计算奖励，使 agent 学会在早期步骤做出有利于后续成功的决策。这是 agent 从"能跑通"走向"能投产"的关键训练范式。

### 基础设施架构的工程智慧

该方案的架构设计体现了生产级 RL 训练的工程考量：

- **两阶段分离**：长期基础设施（VPC、EKS、IAM）与训练运行时资源分离，避免每次训练重新置备网络和集群 — 这是 Amazon Nova Forge SDK 管理运行时生命周期，而 HyperPod 集群保持常驻。
- **三层解耦**：模型生成/训练（HyperPod）、奖励评分（Fargate）、消息路由（Nova Forge SDK）各自独立扩缩，不会互相阻塞。SQS FIFO 队列保证消息顺序，DynamoDB 追踪对话状态。
- **可观测性**：每层都有独立的 CloudWatch 日志，Step Functions 控制台提供逐步执行视图，SQS 队列健康检查可作为训练卡顿的诊断入口。

### 与 agent-harness 训练的关系

这一基础设施与 [Agent Harness Production](../ch05/039-agent-harness.html) 中讨论的 Harness Engineering 理念高度互补：多轮 RL 提供了 agent 训练阶段所需的"延迟奖励分配"能力，而 Harness Engineering 框架则为训练后的 agent 提供生产级运行时支撑。两者结合形成完整的 agent 开发闭环。

### 训练数据与奖励设计

Wordle 环境作为默认验证任务，展示了多轮 RL 的核心机制：模型通过多轮猜测与反馈逐步逼近正确答案。这种"探索 → 反馈 → 调整"循环正是企业级 agent 在真实环境中学习的核心模式。生产场景中的奖励环境可以是 API 调用成功/失败、业务流程完成率、用户满意度等自定义指标。

## 实践启示

1. **从 Wordle 入手，快速验证管线**：不要一开始就构建复杂的业务奖励环境。先用 Wordle 等简单环境验证整个基础设施的端到端通畅性，确认模型生成、奖励路由和训练循环正常运转后，再迁移到自定义环境。

2. **善用两阶段部署降低迭代成本**：Phase 1 一次性置备长期资源后，通过 S3 上传触发训练而不需要重新部署 CDK 堆栈。这种模式使得参数调优（step 数、batch size、LoRA vs 全参数）的迭代周期从小时级缩短到分钟级。

3. **优先使用 LoRA 模式进行实验**：`RFT_MULTITURN_LORA` 模式相比 `RFT_MULTITURN_FULL` 在初期实验阶段可以显著降低成本，同时在多轮 RL 场景下仍然能有效学习工具编排能力。

4. **可观测性基础设施不可省略**：在生产环境中，SQS 队列健康检查 + Step Functions 执行视图 + SNS 告警三件套是排查训练卡顿和奖励路由问题的救命工具。在首次部署时就应该配置好 SNS 订阅。

5. **预估成本并设置自动销毁**：$786-$1,180/hr 的运行成本意味着即使只忘记关闭一次周末训练，也可能产生数万美元的非必要支出。建议在 CI/CD 管线上设置超时自动销毁或与日历关联的定时启停。

## 相关实体

- [Agent Harness Production](../ch05/039-agent-harness.html) — Agent 生产级 Harness 工程实践
- [Agent落地真相 协议 成本与进化 关于智能体从能跑通到能投产的讨论](../ch03/046-agent.html) — Agent 从原型到投产的关键挑战
- [Rl训练一层就够了单层Rl超越全参数训练跨任务跨模型跨算法全部验证](https://github.com/QianJinGuo/wiki/blob/main/entities/rl训练一层就够了单层rl超越全参数训练跨任务跨模型跨算法全部验证.md) — 单层 RL 训练的效率发现
- [Agent Config Model Tool Skill Mcp Prompt Combination Yexiaochai 09](../ch04/267-skill.html) — Agent 配置编排方法论
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Harness Engineering 框架

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/deploying-multi-turn-rl-infrastructure-for-amazon-nova-on-amazon-sagemaker-hyper.md)

---

