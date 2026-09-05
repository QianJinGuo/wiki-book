---
title: "快手AgentX：推荐系统开始自我迭代"
source_url: "https://mp.weixin.qq.com/s/h2PgHllv8MvF4phC8uSPUQ"
ingested: 2026-07-03
sha256: ad39e0242bad5d47f5c81bc1676103aa3a2765b5a73acbf5458925d9d8aeb764
author: 快手技术
publisher: 快手技术
---

过去十年，推荐系统的主线一直是把「建模」和「工程」做到更强。但在工业推荐真正的日常迭代里，最硬的瓶颈并不只在模型，而在研发生产方式本身。

快手 AgentX 团队发布技术报告《AgentX: Towards Agent-Driven Self-Iteration of Industrial Recommender Systems》，提出并验证了一套面向工业推荐系统的 Agent 驱动研发闭环。

AgentX 四阶段架构：

1. Brainstorm Agent：综合历史实验、系统架构、数据分析和外部论文，把目标收敛成有优先级、有证据、有边界的候选方案。每个方案说明目标指标、实现位置、所需信号、预期机制、风险和验证方式。

2. Developing Agent：通过仓库知识库、特征 schema 查询、DSL 检查、C++ 语法检查、dryrun 验证等工具，把代码生成约束在真实仓库和平台规则内。支持论文复现、模块消融和跨论文结构组合。

3. Evaluation Agent：负责安全部署、流量分桶、参数冲突检查、指标读取和 guardrail veto。成功和失败都资产化——成功成为 playbook，失败沉淀为反例和剪枝规则。

4. Harness Evolution (SGPO)：Semantic-Gradient-based Prompt Optimization——从历史轨迹中找出 Agent 工作方式的缺陷，转化为子 Agent 的局部 harness 更新，通过旧版与新版在同一批 replay 任务上的配对评估决定是否接纳。

核心数据（快手 App 真实部署，3 个 AgentX worker）：
- 374 个想法进入系统 → 106 个通过方案审核（28.34%）→ 100 个完成上线（94.3%）→ 10 个正向可发布（9.9%）
- 主站推荐：361 想法 → 8 可发布结果，用户 App 消费时长累计 +0.561%
- 生活服务：13 想法 → 2 可发布结果，年化超 1 亿元人民币收入
- 单 worker 并发实验数 12（vs 人工 1.5），提升 8 倍
- 单 worker 每周产出 1.1 个可发布结果，是人工 13.8 倍
- 单位人力业务价值提升 3.7 倍
- 自加速：周并发从 15→60，idea 通过率 15%→45%，周产出 2→5

PCV 增强精排分案例：第一轮 PCV boosting 未达显著性，转化为第二轮输入（质量门控+自适应权重），最终观看时长 +0.071%、真实曝光 +0.118%。

模型侧拓展：自动阅读论文、复现方法、跨论文结构组合，达到发布级别的模型在快手 App 直播时长指标上带来 +0.865% 收益。
