# 使用Amazon EMR Serverless Storage简化运维节省成本 | 亚马逊AWS官方博客

## Ch11.163 使用Amazon EMR Serverless Storage简化运维节省成本 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 6.9KB | `entities/using-amazon-emr-serverless-storage-to-simplify-operations-and-reduce-costs.md`

## 概述
使用Amazon EMR Serverless Storage简化运维节省成本 by awschina on 16 12月 2025 in Analytics Permalink Share 一、前言 我们知道Spark作业在运行过程中需要临时存储来保存计算过程中产生的Shuffle数据，具体为每个作业的配置多大的存储空间来保存Shuffle数据，在作业运行之前我们不容易评估，由于可能的数据倾斜我们可能还要为Executor配置更多的存储。由于Shuffle数据的存在，Spark DRA(Dynamic Resource Allocation)在容器中运行时没有External shuffle service(非ON YARN调度，而是在比如k8s/EMR Serverless)并不能很好的工作，因为Shuffle数据可能会被作业的其它的Stage引用，如果释放Executor会造成Shu

## 核心技术
Amazon Web Services (AWS) ^[https://aws.amazon.com/cn/blogs/china/using-amazon-emr-serverless-storage-to-simplify-operations-and-reduce-costs/]

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/using-amazon-emr-serverless-storage-to-simplify-operations-and-reduce-costs/)

## 深度分析
**EMR Serverless Storage 解决的是 Spark 在 Serverless 环境下 Shuffle 数据管理的核心挑战**。传统 Spark 作业运行需要配置临时存储来保存 Shuffle 数据，但在 EMR Serverless（非 YARN 调度环境，如 K8s）中，由于没有 External Shuffle Service，Spark DRA（Dynamic Resource Allocation）无法正常工作——释放的 Executor 可能被 Shuffle 数据的后续 Stage 引用，导致任务失败。
**EMR Serverless Storage 的本质是将 Shuffle 数据管理从用户配置转变为平台能力**。传统方式需要用户在作业运行前评估 Shuffle 数据规模并配置足够的临时存储，但数据倾斜等因素使得准确评估非常困难。EMR Serverless Storage 平台自动管理这些数据，按需分配和释放，用户无需操心存储配置。
**这种设计让 EMR Serverless 真正成为"Serverless"**。传统 EMR 仍然需要用户理解集群概念、实例类型、存储规划等底层细节。EMR Serverless 将这些复杂性抽象掉，用户只需要提交 Spark 作业，平台负责所有底层资源管理。这对于只想用 Spark 做数据处理而不愿运维集群的团队是重大利好。
**成本优化是 Serverless 存储的附加收益**。传统方式配置的临时存储往往是峰值需求，而实际运行中大部分时间这些存储是空闲的。EMR Serverless Storage 按实际使用计费，避免了为闲置资源付费的问题。

## 实践启示
1. **迁移前评估作业的 Shuffle 模式**：如果现有 EMR 作业重度依赖 Shuffle，迁移到 EMR Serverless 时需要验证 Storage 模式是否满足需求。建议先在非生产环境测试关键作业的 Shuffle 行为。 ^[https://aws.amazon.com/cn/blogs/china/using-amazon-emr-serverless-storage-to-simplify-operations-and-reduce-costs/]
2. **关注 DRA 配置的变化**：EMR Serverless 环境下 DRA 的行为可能与 YARN 环境不同。建议重新评估 DRA 配置，必要时调整策略以适应新的 Shuffle 数据管理机制。 ^[https://aws.amazon.com/cn/blogs/china/using-amazon-emr-serverless-storage-to-simplify-operations-and-reduce-costs/]
3. **作业配置调优思路需要更新**：传统 EMR 的存储配置经验可能不适用 Serverless 环境。需要建立新的调优方法论，关注作业本身的效率而不是底层资源分配。 ^[https://aws.amazon.com/cn/blogs/china/using-amazon-emr-serverless-storage-to-simplify-operations-and-reduce-costs/]
4. **成本监控仍然重要**：虽然 Serverless 减少了资源浪费的可能性，但 Serverless 计费模式下的成本监控和告警仍然必要。需要建立基于作业执行时间和数据量的成本基线。 ^[https://aws.amazon.com/cn/blogs/china/using-amazon-emr-serverless-storage-to-simplify-operations-and-reduce-costs/]
5. **与现有数据湖架构的集成**：EMR Serverless Storage 需要与 S3 等对象存储配合使用。建议检查现有数据湖架构是否与 EMR Serverless 的数据路径兼容。 ^[https://aws.amazon.com/cn/blogs/china/using-amazon-emr-serverless-storage-to-simplify-operations-and-reduce-costs/]
6. **长期来看，Serverless 是大数据平台的方向**：随着云原生技术的成熟，运维复杂度会进一步降低。建议在架构规划时考虑 Serverless 优先策略，将集群管理作为临时方案而非长期架构。 ^[https://aws.amazon.com/cn/blogs/china/using-amazon-emr-serverless-storage-to-simplify-operations-and-reduce-costs/]

## 相关实体
- [CI&amp;T基于 Amazon Bedrock AgentCore 与 OpenClaw 的企业级智能运维最佳实践 | 亚马逊AWS官方博客](/ch11-056-ci-amp-t基于-amazon-bedrock-agentcore-与-openclaw-的企业级智能运维最佳实践/)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第三篇 | 亚马逊AWS官方博客](/ch04-390-openclaw-multi-3/)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇 | 亚马逊AWS官方博客](/ch11-165-ai-agent-的迁移与现代化-使用-amazon-bedrock-agentcore-将-openclaw-从单/)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 | 亚马逊AWS官方博客](/ch04-440-openclaw-multi-4/)
- [基于 MIG 技术在 Amazon SageMaker HyperPod 上实现 GPU 虚拟化的最佳实践 | 亚马逊AWS官方博客](/ch11-047-基于-mig-技术在-amazon-sagemaker-hyperpod-上实现-gpu-虚拟化的最佳实践-亚马逊a/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/using-amazon-emr-serverless-storage-to-simplify-operations-and-reduce-costs.md)

- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 | 亚马逊AWS官方博客](/ch04-432-openclaw-multi-1/)

---

