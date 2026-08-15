# KDD'26 美团 8 篇论文精选 + KDD Cup DataAgents 冠军思路

## Ch05.098 KDD'26 美团 8 篇论文精选 + KDD Cup DataAgents 冠军思路

> 📊 Level ⭐⭐ | 6.0KB | `entities/kdd26-美团学术论文精选及kdd-cup26-dataagents赛道冠军思路解读.md`

# KDD'26 美团 8 篇论文精选 + KDD Cup DataAgents 冠军思路

美团技术团队 2026-08-13 发布的 KDD 2026 收录论文精选（8 篇，覆盖推荐大模型、奖励建模、Agent 搜索、广告拍卖、ETA 元泛化、生成式推荐训练系统）+ 大众点评技术部在 KDD Cup 2026 DataAgents 赛道（复杂数据分析 Data Agents 国际竞赛）夺冠的解题思路。

## 8 篇论文的技术脉络

- **MTFM**（Meituan Foundation Model for Recommendation）：可扩展、免对齐的工业推荐基座模型——将跨域数据转换为异质 Token 以无对齐方式捕捉多场景知识，多场景用户级样本聚合提升训练吞吐，Grouped-Query Attention + Hybrid Target Attention 降低内存与计算；在外卖等场景离在线验证后构建统一基座推荐大模型替换各业务独立精排模型。
- **CDRRM**：对比驱动的评分准则生成与奖励建模框架——"对比-聚合"流程先对比好/差回答定位关键差异再聚合为任务相关准则，缓解话痨、位置偏见；仅用 3 千样本让未微调模型超越全量微调基线，兼顾可解释性与数据效率（与 [discretizing reward models](../ch01/368-discretizing-reward-models.html) 同属奖励模型可解释性方向）。
- **LocalSearchBench**：本地生活服务领域 Agentic Search 评测基准——9 城市、6 服务品类、900 道多跳问答 + LocalPlayground 交互环境 + LocalRAG 商户检索工具；16 款主流推理模型普遍表现不佳（信息完整性/可信度不足），为本地生活场景智能体搜索提供基准支撑。
- **JTransNet**：联合广告拍卖场景匿名性 + 确定性分配（NeuralSort 可微排序 + 端到端数据驱动 AMD 自动化模型拍卖），已在美团零售核心业务全量上线。
- **UME**：跨域 ETA 统一元泛化框架——双分支网络 + 超网络元学习动态调制特征门控/专家注意力/最终预测，知识蒸馏弥合冷启动市场特征缺失，解决 Keeta 国际化即时配送跨域异质性。
- **GRAD**：自动竞价基础模型——动作混合专家模块实现多样化竞价行为探索 + 因果 Transformer 约束优化，面向离线/在线分布偏移与 CPM/ROI 约束。
- **HMAF**：分层多坑位 GD-RTB 分配框架——"规划-校准-执行"范式统筹离线 GD 资源规划、动态校准 GD/RTB 竞争强度、多坑位实时列表级排序。
- **MTGenRec**：基于 PyTorch 生态的生成式推荐分布式训练系统——动态 Hashtable 替代静态 Embedding 表、自动合表/ID 去重/变长序列负载均衡，1.6x-2.4x 训练加速、8→128 卡近似线性扩展。

## KDD Cup 2026 DataAgents 冠军思路

赛题核心：Data Agents 接收异构多模态数据包（数据库、PDF、JSON、图表、视频），针对高层次自然语言问题自主编排并行分支/迭代循环/结果汇聚的复杂推理过程并给出答案——难点在真实数据的"异构鸿沟"与推理链路非线性。

大众点评技术部的解法是将其在「问点仔」建设过程中积累的 **Agent Harness 能力迁移至赛题**：

- 构建完整 Agent 运行时，支持多类型数据文件自主探索 + SQL/Python 分析工具选择与执行
- 错误反馈、超时控制、自动重试机制提升长链路任务稳定性与容错
- 异构数据处理：多模态视频理解子智能体 + 非结构化文档 ETL 子智能体，增强主智能体数据提取与综合分析

获奖代码已在 GitHub 开源（`zhezh/kddcup2026_champion`）。该方案验证了 Agent Harness（工具编排 + 子智能体分工 + 容错机制）在复杂异构数据分析场景的有效性，与 [Agent Harness 上下文管理](ch05/042-agent-harness.html) 及 [Agent Orchestration](../ch04/618-agent-orchestration.html) 的工程实践同构。

## 相关实体

- [美团 LongCat 2.0](../ch04/480-longcat-2-0.html) — 美团大模型家族
- [GenRec（Netflix）](../ch01/867-llm.html) — 生成式推荐对照
- [Discretizing Reward Models](../ch01/368-discretizing-reward-models.html) — 奖励模型离散化
- [美团 LoHOSearch](../ch04/666-lohosearch.html) — Agent 搜索评测
- [美团 Turing Agent 评估](../ch03/037-agent.html) — 同团队评估方法论
- [Agent Harness 上下文管理](ch05/042-agent-harness.html) — Harness 工程实践

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/kdd26-美团学术论文精选及kdd-cup26-dataagents赛道冠军思路解读.md)

---

