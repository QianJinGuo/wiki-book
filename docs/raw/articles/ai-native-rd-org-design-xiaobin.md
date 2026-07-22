---
title: "AI Native 时代 —— 研发组织何去何从"
sha256: 8d395f88f15b47924cb6add51767caa2613469ddb0c12a90cb0104c700c7786b
type: raw
created: 2026-05-14
updated: 2026-05-14
source_url: "https://mp.weixin.qq.com/s/Xf3C60jCxR4ppMi4HuAnVA"
author: "许晓斌"
source_name: "阿里技术"
source_published: "2026-05-14"
review_value: 8
review_confidence: 7
review_recommendation: strong
review_stars: 4
tags: [ai-native, organization, execution-graph, harness, hive-mind, 管理, 研发组织]
---
# AI Native 时代 —— 研发组织何去何从
> 作者：许晓斌 | 来源：阿里技术 | 2026-05-14（25分钟阅读）
## 核心洞察
**内部访谈数据**（4位深度使用AI的工程师）：
- 写代码占比：30% → 5%
- 和 Agent 对话占比：5% → 60%
- 编码效率提升 10 倍，但端到端需求交付效率只提升 2-3 倍
## 组织的本质：2000年协调问题
组织的演化核心在解决同一件事：**信息怎么路由**。
- 罗马军团：8→80→480→5000人嵌套结构，信息路由协议化
- 1806年普鲁士军队改革：总参谋部（中层管理雏形）
- 1840年代美国铁路：第一个组织架构图（防止火车相撞）
- Taylor科学管理、矩阵组织、Squad、Holacracy、Valve扁平化
**核心约束始终没变：人的"管理跨度"（3-8人）。** 所有组织形状都是这个约束的妥协。
## 旧定律都是人的协作物理学
- **康威定律**：团队内部沟通成本 << 跨团队 → 模块边界不可避免与团队边界重合
- **人月神话**：沟通成本随人数指数增长 → 加人无法加速延期项目
- **Taylor科学管理**：工作拆分成专业岗位 → 人的注意力是稀缺资源
- **Manager评价制**：员工产出不可观测 → 让"信息上最近的人"代理评估
## AI 不是新工具，是新协作主体
AI 和人形成**镜像反面**：人需要激励/会疲劳/有情绪/Context switching成本高/记忆注意力有限；AI 没有这些限制。
## 双层架构：Harness + Hive Mind
真正在做 AI Native 的团队有一个共同形态：
- **底层 = Harness层**：代码、测试、流水线、文档、世界模型，所有信息做成 AI 友好形态 → AI 主导
- **上层 = Hive Mind层**：对话、试错、idea涌现、Yes-and → 人主导
## 范式转换：Org Chart → Execution Graph
Ken Huang："Once AI becomes agentic, the organization stops being accurately described by an org chart. It becomes an **execution graph**."
- **旧 Org Chart**：最小单元是"人 + 长期关系网"（粘性极高，reorg周期6-12个月）
- **新 Execution Graph**：最小单元是"任务 + 上下文 + 权限 + 工具"（机器可读，重组成本压到 week 级）
**核心问题变了**：
- 旧问题：**ownership**——"谁拥有这件事？"
- 新问题：**routing + governance**——"意图从哪里进入系统？怎么被翻译成行动？什么约束让行动是安全的？"
## 人的双重角色
**人既是协作的瓶颈，也是协作的兜底。**
人过去默默吸收的隐性成本：不完整的需求、没注释的代码、不一致的API约定、口头传达的"潜规则"。
AI 没有"猜"和"问老王"的能力——AI 需要结构化、可查询、可执行、确定性的信息。
**新瓶颈**：不是 AI 能力不够，是系统的信息形态不够。
## Harness Engineering
OpenAI 2026年初提出：工程团队首要职责不再是写代码，而是**让 Agent 能干活**。
**AI 友好的5个维度**：测试完备性、环境完备性、架构合理性（无循环依赖、无跨服务隐式调用）、端到端测试可执行性、文档充分性。
> **复利效应**：Harness 跑起来 → AI 接管越多 → 失败信号越丰富 → Harness 优化越快
## 管理塌缩（不是消失）
把管理者工作拆开（10件事）：战略传导、信息聚合、资源协调、日常决策可被系统替代；激励、辅导、招聘退出、文化建设不可被替代；新出现的是**意图教练、身份重建、虚无对抗**。
**Architect = 新最高杠杆点**：设计教 AI 怎么工作的人。把组织的隐性 know-how 翻译成 AI 可消化形态。
**Agent 是新员工类**（Ken Huang）：Agents 需要 onboarding、scoping、supervision、offboarding。但有四个最危险的不对称：可被无限复制 / 同小时既 brilliant 又 brittle / Compliance-blind by default / Fast enough to fail at scale
## Platform 三柱架构
| 柱 | 职责 |
|----|------|
| **Agent Platform Group** | runtime 标准、权限、日志、可观测、评估 harness、安全部署 |
| **Domain Teams** | 3-5人垂直功能小组，对结果负责（不对模型负责） |
| **Risk and Oversight** | 免疫系统（当治理做好的时候，它不会拖慢 Hive Mind，是让它活着）|
六项基本功：枚举 agents、权限纪律、梯度自治、日志、评估 harness、事故响应。
## 三类工作 / 三种治理
| 工作类型 | 治理方式 |
|----------|----------|
| **执行类** | 最大化透明度，死防御性 ego |
| **优化类** | 抑制 ego，结构化但留批判空间 |
| **创新类** | 保护性环境，维护**生产性 ego** |
## 转型的真实代价
三个无法回避的问题：
1. **培养断裂**：day 1 AI 已在写代码，day 1 的人应该做什么？入门级岗位本身可能消失
2. **蒸馏焦虑**：员工意识到"我说的越多被替代得越快" → 关键知识藏匿 → 最优秀的人先走 → 转型基本失败
3. **行业级负反馈**：senior 池消耗 → Architect 储备越来越薄 → "death of expertise"
## 还没解决的
- AI 信任度：CR和缺陷分析等高风险环节，"不敢全信、人工又扛不住"两难
- 绩效失效：旧评价依据失效，新依据还没建立
- 3-5人小团队是临时最优还是终态？
- AI 知识资产继承：员工花几个月调教的 agent，人走时怎么办？
## 关键判断
1. **Harness 工作是组织未来速度的复利本金**
2. **不要把 AI Native 当作又一次 reorg**——真正价值是让组织未来不再需要痛苦的 reorg
3. **解决 Architect 的激励问题**：把"被威胁的资深工程师"转化为"被赋能的 Architect"
4. **分辨节点类型**：执行节点全透明 + 死防御性 ego；创新节点保护性环境 + 维护生产性 ego
5. **开始做 agent 名册**——不可能治理叫不出名字的东西
## References
- [1] Jack Dorsey & Roelof Botha, *From Hierarchy to Intelligence*, Block Inside, March 2026
- [2] Melvin E. Conway, *How Do Committees Invent?*, Datamation, April 1968
- [3] Frederick P. Brooks Jr., *The Mythical Man-Month*, Addison-Wesley, 1975
- [4] Ken Huang, *What is an Agentic AI Native Organization?*, Substack, February 2026
- [5] Peter Pang, *Why Your "AI-First" Strategy Is Probably Wrong*, X (Twitter), April 2026
- [6] Steve Yegge, *The Anthropic Hive Mind*, Medium, February 2026