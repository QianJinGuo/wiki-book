---
title: 10篇论文看懂AI Agent Skill：表示、执行、评估与进化
source_url: https://mp.weixin.qq.com/s/Z2fFNWXgRHq0VogIRD69Yg]
publish_date: 2026-05-07
tags: [wechat, article, agent, harness, multi-agent, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 2811c99035601812de9730643f98457380969da9cbacda95aceb9c3dc41c2ebc
---
# 10篇论文看懂AI Agent Skill：表示、执行、评估与进化
- URL: https://mp.weixin.qq.com/s/Z2fFNWXgRHq0VogIRD69Yg
- Author: 学术综述（arXiv风格，微信编译版）
- Date: 2026-05
- Length: 7849 chars
- SHA256: 543ce5dc66d7af5c7c8e5ff67c8269e43cf415429b9b6173ed97011063e5d890
- Score: Value=8 × Confidence=8 = 64
- References: 12篇（含Knowledge Activation、Blueprint First等arXiv论文）
## 摘要
技能（Skills）正在成为支架工程中连接大语言模型智能体与结构化领域知识的关键抽象。不同于松散的提示词和原子化的工具调用，技能将复杂的多步操作固化为可组合、可复用、可验证的确定性流程，使智能体能够在遵守边界约束的前提下可靠地执行生产级任务。
本文面向算法研究人员，从六个维度系统综述：
1. 形式化表示
2. 执行机制
3. 上下文调度
4. 评估框架
5. 安全治理
6. 自动挖掘
## 1. 技能的形式化定义
### 六元组定义
技能被形式化为一个**六元组**：
```
Skill = (ID, I, O, P, Pre, Eff)
```
- **ID**：唯一标识符及元数据（名称、版本、适用范围、所需权限）
- **I**：输入模式（Input Schema），定义技能所需的参数及其类型约束
- **O**：输出模式（Output Schema），定义技能完成后产生的状态变化与返回值
- **P**：步骤计划（Plan），一个偏序的步骤集合（DAG）
- **Pre**：前置条件（Preconditions），必须满足方可激活的逻辑断言
- **Eff**：效果描述（Effects），描述技能执行对系统预期的影响，含补偿动作
### 步骤计划：DAG建模
技能的步骤计划 P 建模为**有向无环图（DAG）**：
```
P = (V, E, v_0, V_f)
```
- **V**：步骤节点集合，每个节点 v 包含：
  - 动作类型（文件读写/工具调用/代码生成/人工确认等）
  - 动作参数模板
  - 成功/失败条件
  - 最大重试次数
  - 超时时间
- **E**：步骤间的依赖边，e(v_i, v_j) 表示 v_i 必须在 v_j 成功完成后才能开始
- **v_0**：唯一入口节点
- **V_f**：终止节点集合
执行引擎按拓扑顺序调度节点执行，支持有限并行（多个入度为0且互不冲突的节点可并发执行）。
**示例DAG**（"添加API端点"技能）：
```
v0: 读取任务简报 → v1: 确认前置条件
                           ↘ v2: 启动特性百科全书加载
                           ↗ v3: 生成Schema定义
                           → v4: 生成迁移脚本
                           ↗ v5: 生成服务层代码
                           → v6: 合并与验证
                           → v7: 提交审查 → vf: 输出结果
```
（v1和v2可并行，v4和v5可并行）
### 三种技能类型
| 类型 | 执行引擎 | 确定性程度 | 典型表示 | 灵活性 |
|------|----------|------------|----------|--------|
| **命令式技能** | LLM逐步解释执行 | 中等 | Markdown/YAML清单 | 高 |
| **蓝图式技能** | 确定性蓝图引擎+LLM填充槽位 | 高（控制流确定） | 可执行TypeScript/Python代码 | 中 |
| **知识激活技能** | 知识图谱遍历+子图匹配 | 高（激活与组合逻辑确定） | 知识图谱节点+规则 | 高 |
> 蓝图式技能将控制流从LLM中剥离，执行变异系数（CV）可降至0.02以下。
## 2. 执行机制
### 触发与匹配算法
技能的触发分为**显式调用**和**隐式激活**两种模式。
**隐式激活匹配函数**（级联打分）：
```
1. 硬性过滤：前置条件Pre必须在上下文C中满足，否则score=0
2. 语义匹配：将C中任务描述与技能描述编码为向量，计算余弦相似度
3. 上下文关联度加分：文件路径、实体名与技能声明的领域术语重叠 → 加权加分
4. 选择：取score最高的技能；若均低于阈值τ，回退到通用自由工具调用模式
```
### 上下文预算分配与渐进式加载
**问题**：技能执行消耗Token预算，上下文窗口有限。
**策略**：渐进式披露（Progressive Disclosure）。
设DAG拓扑排序为 [v_0, v_1, ..., v_k]，每个节点Token负载为 t(v_i)。上下文调度器维护活跃Token预算 B。
在任意时刻，仅当前执行节点及其直接后继节点的详细指令被加载；其余节点信息以压缩摘要形式驻留外部记忆，仅在激活时展开。
> 可将活跃上下文压缩至150–300行指令的"甜点区"，避免"迷失在中间"效应。渐进式加载使技能步骤依从性提升17%。
### 与计划优先工作流的耦合
**双向验证机制**：
- **正向验证（计划→技能）**：Agent生成的结构化计划被解析为子目标；对于每个子目标，检索匹配技能；若步骤序列与计划存在结构冲突 → 标记"需人工审查"
- **反向验证（技能→计划）**：激活技能的前置条件Pre和效果Eff投射回计划，确保计划其余部分不与技能效果冲突
## 3. 多技能编排与并发执行
### 编排算法
接受一组匹配的技能 {S_1, ..., S_n} 及依赖关系，构造全局执行DAG。
依赖关系来源：
- 显式声明（`depends_on`字段）
- 效果-前置条件分析：若S_j的断言满足S_i中的某个条件，则添加边
无依赖的技能对可并行分配至不同执行子Agent，通过共享状态存储（如`PLAN.md`）交换中间结果。
### 失败回滚
**补偿事务模式**：每个副作用节点 v 定义补偿动作 v_comp。当执行链在v失败时，逆序执行所有补偿动作，将状态恢复至初始点。理想情况下，补偿动作与正动作满足幂等性。
## 4. 评估框架
### 评估指标体系
| 指标 | 公式 | 解释 |
|------|------|------|
| **任务成功率** | 成功次数/总执行次数 | 是否最终达成目标 |
| **步骤依从性** | 偏离步骤数/总步骤数 | 是否严格遵循技能DAG |
| **执行一致性** | 执行时间/执行时间̄ | 多次执行的时间稳定性 |
| **Token效率** | 自由模式消耗/技能模式消耗 | 相比自由模式的Token节省倍数 |
| **知识新鲜度** | 仍有效断言数/断言总数 | 技能内容与当前代码库的一致性 |
### 基准测试方法
1. **A/B对比评估**：使用技能组 vs 未使用技能组的同构Agent实例对比。Snowflake的**Agent GPA框架**提供标准化评分卡：目标完成度/逻辑一致性/执行效率/计划质量/计划依从性五轴。
2. **回归测试套件**：每个技能关联输入-期望输出-期望轨迹的测试用例；验证：
   - 最终输出与期望输出匹配（确定性检查）
   - 执行轨迹与期望DAG拓扑同构（轨迹匹配）
   - 未触发安全违规告警
3. **人工专家审查**：评估知识正确性（KF），定期抽样判断步骤指令和领域断言是否仍符合当前最佳实践。
## 5. 安全与治理
### 安全边界的形式化
技能的安全约束表示为一组**安全策略**，每条策略 P_i 是四元组：
```
P_i = (action, resource, condition, effect)
```
策略引擎（如OPA/Rego）在执行节点动作前评估：若任一策略拒绝，动作被拦截并记录审计日志。
### 技能完整性验证
**内容签名机制**：
- 技能文件 F 的规范化表示通过哈希函数 H 生成摘要 h = H(F)
- 用团队私钥签名
- Agent框架在加载技能前验证签名；失败触发告警并回退到只读安全模式
### 知识衰减监测
技能中的领域知识会随代码库演变而过时。监测机制：
1. **依赖图跟踪**：技能元数据记录引用的关键文件路径和实体名称
2. **变更触发器**：被引用实体发生结构性变更时 → CI管道标记技能为"需复审"，加入人工审查队列
3. **定期自动回归**：每月执行所有技能回归测试套件；若某技能回归成功率连续两个月下降超阈值 → 触发强制废弃流程
## 6. 技能的自动挖掘
**目标**：将技能创建从纯人工编写转变为"算法挖掘+人工审核"的半自动化流程。
### 三阶段管道
**阶段1：候选模式挖掘**
给定开发者IDE操作日志序列 D = [o_1, o_2, ..., o_n]，其中每个操作包含类型（打开文件/编辑/运行命令）、参数和时间戳。
使用PrefixSpan或CloSpan等频繁子序列挖掘算法提取高频且封闭的操作序列作为候选技能骨架。
过滤规则：序列必须包含至少一个"验证"或"测试"步骤。
**阶段2：语义聚类与泛化**
对相似但参数不同的候选序列进行聚类，泛化为参数化技能模板。
示例：
- "打开`user.controller.ts` → 添加`POST /users`路由 → 打开`user.service.ts` → 添加`createUser`方法"
- "打开`product.controller.ts` → 添加`POST /products`路由 → 打开`product.service.ts` → 添加`createProduct`方法"
→ 聚类为技能模板"添加CRUD端点"，参数化为实体名称。
**阶段3：质量过滤**
- **执行验证**：隔离沙箱中自动执行候选技能，统计任务成功率
- **步骤依从性**：候选技能的执行轨迹与挖掘出的序列是否高度一致
- **专家确认**：通过初步过滤的候选技能提交领域专家进行最终命名、参数调整和安全审查
> 这一管道可有望覆盖中小型项目60%以上的常见工作流。
## 核心结论
> "**模型能力正在趋同，而组织对有效行动路径的编码化程度，将成为智能体时代真正的性能分水岭。**"
技能工程化的终极目标：构建AI智能体的"操作系统"——由社区贡献、经过形式验证、可组合定制的知识执行层。
## 参考文献
[1] Knowledge Activation: AI Skills as the Institutional Knowledge Primitive for Agentic Software Development. arXiv:2603.xxxxx, 2026-03-16
[2] Blueprint First, Model Second: A Framework for Deterministic LLM Workflow. arXiv:2508.xxxxx, 2025-08-01
[3] Sanwal, M. Layered Chain-of-Thought Prompting for Multi-Agent LLM Systems. arXiv:2501.18645, 2025
[4] Zhu, Y. et al. KnowAgent: Knowledge-Augmented Planning for LLM-Based Agents. arXiv:2406.xxxxx, 2024
[5] 有效上下文工程：构建AI智能体可靠运行环境. CSDN, 2025-10-19
[6] Anthropic. Code Execution with MCP: Building More Efficient AI Agents. Anthropic Blog, 2025-11-04
[7] What is Your Agent's GPA? A Framework for Evaluating Agent Goal-Plan-Action Alignment. Snowflake/arXiv, arXiv:2510.xxxxx, 2025-10-08
[8] GreenNode. Hardening AI Agent Infrastructure: From Security Baseline to Policy-as-Code. GreenNode Blog, 2026-03-23
[9] Krawiecka, K. et al. Architecting Resilient LLM Agents: A Guide to Secure Plan-then-Execute Implementations. CoRR, 2025-10-09
[10] Masterman, T. et al. The Landscape of Emerging AI Agent Architectures for Reasoning, Planning, and Tool Calling: A Survey. arXiv, 2024
[11] Mohammadi, M. et al. Evaluation and Benchmarking of LLM Agents: A Survey. KDD '25, 2025
[12] 支架工程（Harness Engineering）分层上下文系统与技能设计. 基于Harness社区实践素材整理, 2026