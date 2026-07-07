# AWS EC2 Capacity Blocks GPU ML

## Ch11.201 AWS EC2 Capacity Blocks GPU ML

> 📊 Level ⭐⭐ | 5.7KB | `entities/aws-ec2-capacity-blocks-gpu-ml.md`

# EC2 Capacity Blocks：GPU短期容量决策指南
## 三个关键洞察
### 1. Capacity Blocks vs Training Plans
Capacity Blocks for ML（最新服务）适合需要短期专用GPU容量的场景（Hackathon、突发训练任务），比Savings Plans更灵活但价格稍高。按需价格节省40-50%，Savings Plans节省70-75%但需要1-3年承诺。
### 2. 决策树
"是否有可预测的周期性训练需求？" → 否 → Capacity Blocks；是 → Savings Plans。"是否需要即时可用？" → 是 → Capacity Blocks；可等 → Scheduled Scaling。
### 3. 短期GPU容量的新选择
传统的按需太贵、Savings Plans承诺太长，Capacity Blocks填补了中间地带——按天/周预订专用GPU集群。
---
## 深度分析
### GPU容量供需失衡的结构性原因
文章开篇即指出GPU容量需求超过行业供给的现实。这种失衡并非暂时性短缺，而是ML工作负载普及与GPU产能周期之间的结构性矛盾。传统On-Demand虽灵活但价格高昂（p5.48xlarge约$55/小时），ODCR虽能预留容量但无成本优势，迫使客户要么过度保留实例浪费成本，要么面临容量不确定性。
### 三层GPU短期方案的价值定位
文章清晰地划分了三个层次：
| 方案 | 折扣 | 承诺期 | 适用场景 |
|------|------|--------|----------|
| On-Demand | 0% | 无 | 临时测试、灵活实验 |
| Capacity Blocks (EC2) | 40-50% | 1-182天 | Hackathon、发布前容量准备 |
| Savings Plans | 70-75% | 1-3年 | 可预测的周期性训练任务 |
Capacity Blocks填补了"灵活但贵"与"便宜但僵化"之间的中间地带，这是其核心价值主张。
### EC2 vs SageMaker的决策边界
两者并非竞争关系，而是按基础设施管理模型划分：
- **EC2 Capacity Blocks**：直接管理OS、网络、编排层，适合有定制化需求的场景（直接访问P5/Trn1实例）
- **SageMaker Training Plans**：托管服务，处理实例供应和生命周期，适合不想管理底层基础设施的团队（支持ml.trn1/m4dn/p5等SageMaker托管实例）
关键限制：Capacity Blocks不能与SageMaker共享，反之亦然；G类型实例（除G6外）不兼容SageMaker Training Plans。
### 预订策略的经济学
文章的价格分析揭示了一个反直觉结论：**如果实例在预订期内不能持续运行，总成本可能超过On-Demand**。这要求用户在预订前精确评估GPU利用率——Capacity Blocks的经济性只有在高利用率（>60%）场景下才能兑现。
### 多账户和跨组织共享能力
2026年2月的新功能允许组织在多个账户间共享Capacity Blocks（最多256个实例跨账户），这为大型企业的GPU资源池化提供了可能，但需要至少4个block才能达到该限制。
## 实践启示
### 短期GPU容量决策流程
1. **首先尝试On-Demand**：无承诺，立即可用，失败后尝试其他Region或调整启动时间
2. **必须保证确定性时**：选择预订容量
   - EC2工作负载 → Capacity Blocks
   - SageMaker工作负载 → Training Plans
3. **利用Spot补充**：对可checkpoint的分布式训练或可重试的批处理推理，Spot可降低至90%折扣
### Capacity Blocks选型检查清单
- [ ] 确认实例类型在支持列表中（P5/Trn1/Trn2，非所有GPU类型）
- [ ] 预订时长与实际工作负载匹配（1-14天按天增量，15-182天按周增量）
- [ ] 评估利用率：低于60%时可能不划算
- [ ] 硬件故障时可终止并重新launch，系统10分钟内释放保留槽位
- [ ] 不能跨账户迁移或分割
### 大规模部署提前量
对于生产部署或重大活动（如Hackathon）需要大量GPU容量，文章建议**至少提前三周**联系AWS account team评估需求并制定容量策略。
### 与知识库的连接
- 容量感知推理Fallback机制（[Aws Sagemaker Capacity Aware Inference Fallback](../ch01/392-aws-sagemaker-capacity-aware-inference-fallback.md)）体现了GPU资源管理的另一面——当容量受限时如何优雅降级
- 两者共同构成GPU资源管理的"预订-使用-降级"完整链路
## 相关实体
- [SageMaker容量感知推理：实例池+优先级Fallback](../ch01/392-aws-sagemaker-capacity-aware-inference-fallback.md)
- [Building Blocks for Foundation Model Training and Inference on AWS](ch11/117-building-blocks-for-foundation-model-training-and-inference.md)
---
*Source: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-ec2-capacity-blocks-gpu-ml.md)*

---

