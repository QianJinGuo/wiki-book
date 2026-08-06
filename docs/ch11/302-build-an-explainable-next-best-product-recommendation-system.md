# Build an explainable next-best-product recommendation system for banking on AWS

## Ch11.302 Build an explainable next-best-product recommendation system for banking on AWS

> 📊 Level ⭐⭐ | 3.1KB | `entities/build-an-explainable-nbp-recommendation-system-on-aws.md`

# Build an explainable next-best-product recommendation system for banking on AWS

> **Background**：本文基于 AWS Machine Learning Blog 的一篇技术指南，介绍了在 AWS 上构建可解释的下一个最佳产品（NBP）推荐系统的架构设计和实现。内容涵盖数据管道、模型架构、训练推理全链路。

## 核心架构

该系统采用 **多塔神经网络（Multi-Tower NN）** 架构，包含四个专用塔：

- **Sequence Tower**：使用 2 层 GRU 处理客户产品采用序列，捕捉时序模式
- **Transaction Tower**：2 层 MLP 处理时间窗口交易特征（7/30/60/180/365 天）
- **Customer Tower**：处理客户人口统计、收入、账户特征
- **Behavioral Tower**：处理细分编码、忠诚度、使用模式

各塔输出 64 维向量，通过**注意力融合机制**实现每个客户级别的可解释性。

## 技术栈

| 组件 | 技术 | 用途 |
|------|------|------|
| 深度学习框架 | PyTorch | 动态计算图、研究到生产灵活转换 |
| 训练计算 | SageMaker AI (ml.g5.12xlarge) | 4× NVIDIA A10G GPU |
| 数据存储 | Amazon S3 (Snappy Parquet) | 列式存储、3-5× 压缩 |
| ETL | AWS Glue (PySpark) | 无服务器数据统一处理 |
| 特征工程 | Pandas, Dask, PyArrow | ML 特征构建 |
| 模型注册 | SageMaker AI model registry | 版本控制与审批 |
| 推理 | SageMaker Batch Transform / Endpoint | 批量与近实时预测 |
| 编排 | SageMaker Pipelines | 端到端 ML Pipeline |
| 监控 | CloudWatch | 训练指标、推理延迟、模型漂移 |

## 数据管道

数据管道分为两个阶段：

1. **AWS Glue ETL 数据统一化**：将多个源系统的原始交易数据归一化为统一的客户时间线
2. **SageMaker Processing 特征工程**：生成产品采用序列和时间窗口聚合特征

大规模数据采用并行分块处理策略：PyArrow 元数据检查 → ProcessPoolExecutor 并行处理 → 显式 GC 批量回收。

## 关键设计决策

- **为什么用多塔**：不同类型客户数据（序列/交易/人口统计/行为）结构差异大，统一网络浪费模型容量
- **为什么用 PyTorch**：需要动态计算图支持变长序列（pack_padded_sequence）
- **为什么用 Parquet**：列式存储支持列剪枝和谓词下推，相比 CSV 节省 3-5× 存储
- **为什么用 GRU**：相比 LSTM 参数更少，在序列推荐场景下表现相当

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/build-an-explainable-next-best-product-recommendation-system-for-banking-on-aws.md)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

