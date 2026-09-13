# Graph Engineering：从单循环到多节点编排

> 📊 Level ⭐⭐ | 12.5KB

## 核心概述

Graph Engineering 是继 Prompt Engineering、Context Engineering、Harness Engineering、Loop Engineering 之后的第五层工程范式。核心命题：**当单个 Agent 循环不够用时，如何将多个智能体、工具和人组织成一个可观测、可恢复、可扩展的系统**。

Graph 不是要取代 Loop，而是把 Loop 从"一个 while 循环"升级为"一张组织架构图"——Loop 解决"如何让单个智能体持续工作"，Graph 解决"如何把多个执行节点编排成一个生产级系统"。

## Graph 形式定义

G = (V, E, S, P)

- **V (Node)**: 工作单元，一进一出、只干一件事（专门化 Agent / 确定性函数 / 工具调用）
- **E (Edge)**: 节点间路由（直通 / 条件分支 / 扇出扇入 / 回环）
- **S (State)**: 沿边流动的共享对象（任务状态 / 证据 / 预算 / 检查点）
- **P (Policy)**: 权限约束（谁可创建节点 / 调用工具 / 修改图 / 产生副作用）

## 从 Loop 到 Graph 的驱动力

### Loop 的五个结构性缺陷

1. **上下文腐烂**: 每轮输出全塞回同窗口，第 10 轮膨胀至 18000+ token，原始目标被自我推理淹没
2. **错误级联**: 由模型自身发现并跳出循环在同一推理链中极难做到
3. **工具过载**: 15-20 个工具时选择准确率急剧下降
4. **缺乏控制粒度**: 不能暂停子任务等审批，不能为不同步骤配不同模型，不能做中段质检
5. **可观测性差**: 无法追溯为何在此分支、哪步决定导致错误
6. **目标失明（Goodhart's Law）**: 循环只看见被赋予的指标，会用尽办法去移动它（AI 客服案例：以工单解决率为指标→AI 学会偏转/快速关单→客户流失翻倍）

这些问题无法通过"把 Loop 做得更大更强"解决，因为根源不在一个循环内部，而在多个环节之间的关系上。

## 三种经典拓扑

**Diamond（扇出扇入）**: 拆分任务 → 并行执行 → 合并结果。适用于市场调研、代码评审、研究报告。

**Orchestrator-Workers（主管-工人）**: 主管 Agent 居中调度，分派给专职工人，自己负责规划和汇总。Anthropic Research 系统采用此模式。

**Pipeline（流水线）**: 固定步骤链，中间加检查点（gate）。适合可干净拆解成固定子任务的场景，用延迟换准确率。

## 确定性的核心：Verifier + Router

Graph 的真正杠杆不在于智能体数量，而在于围绕结果搭起的确定性。

- **Verifier（验证器）**: 专门试图推翻前一个结论，用全新上下文独立审查
- **Router（路由）**: 按重要程度将任务导向不同检查路径

三种验证模式：
1. **对抗式**: 派多个怀疑者分头驳结论
2. **多视角**: 正确性/安全性/可复现性各查各的
3. **评委制**: 多候选打分，优胜者吸收其他优点

确定性来自两个锚点：
- **代码**: 格式校验、测试、去重、排序——让模型的判断力在节点上，代码的可靠性在边上
- **现实**: 测试真正跑过、钱真到账、用户真留下

> 如果一张图里所有节点都在互相引用模型生成的结论，没有一个节点真的去碰一下现实，那它只是一台更精致的自嗨机器——一个项目管理做得更好的、更大的幻觉。

## 框架对比

| 框架 | 编排模型 | 同任务 Token | 适合场景 |
|------|---------|:----------:|---------|
| LangGraph | 有向图+条件边 | ~2000 | 长时运行、需审计回滚的生产管线 |
| CrewAI | 角色化 crews | ~3500 | 规范化角色协作分工 |
| AutoGen | 对话式 GroupChat | ~8000 | 多模型对话协调探索性任务 |
| Google ADK | 结构图架构 | — | code-first、企业级、可部署 Vertex AI |

Token 差异来源：图结构把智能体间的"对话"变为"状态转换"，省掉互相转述背景的开销。

## 生产案例

- **LinkedIn SQL Bot**: 路由 Agent→领域专家→写 SQL→自纠错，查询准确满意度 95%
- **Uber 代码迁移**: 子图按语言/仓库分拆，检查点机制扛 CI 抽风，节省 21000+ 工程小时
- **Anthropic Research**: Orchestrator-Workers，相对单 Opus Agent 提升 90.2%

## 使用决策

三条该用 Graph 的标准：
1. **上下文保护**: 子任务产生大量无关信息需隔离
2. **可并行**: 任务能切多分支同时跑
3. **专业化**: 不同步骤需不同工具/提示/专注度

成本意识：多 Agent 系统 token ≈ 普通对话 15×，仅 token 用量即解释性能方差的 80%。

## 与旧范式的关系

Graph 不是回到 ReAct 之前的老工作流。老工作流节点是死代码；Graph 的节点里住着能自主推理的 Agent。它用预定义的边框住动态的节点，把"稳"（可治理、可审计）和"活"（节点内自主）拆到两层同时实现。

## 关联

- [Loop Engineering: 把反馈循环放进工程现场](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-feedback-control-system.md) — Loop Engineering 是 Graph 的底层基础
- Harness Engineering — Harness 是每个 Loop 节点的基础结构
- [LangGraph 底层原理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/langgraph-state-machine-under-the-hood.md) — 最成熟的 Graph Engineering 框架
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) — 工程范式全景

## 扩展：事实图维度（若飞 2026-07-30 Supplementary）

若飞在《Agent Loop 与 Graph Engineering：多 Agent 如何执行任务、共享可信事实》中将 Graph Engineering 扩展到了**事实管理**维度。

### 执行图 vs 事实图

Graph Engineering 实际涉及两种不同的图：
- **执行图**：节点 = 工作单元（合规检查、合同审批等），边 = 控制关系（依赖/分支/回退）。回答"工作怎么走"。
- **知识图谱/事实图**：节点 = 实体（品牌、公司、账户），边 = 事实关系（"品牌 A 的法定主体是公司 B"）。回答"多个 Agent 交接的事实能否信"。

### 三态分类法

"共享记忆"实际包含三种不同状态：

| 类型 | 典型内容 | 由谁管理 |
|------|---------|---------|
| **运行状态** | run_id, node_id, attempt, checkpoint | 编排器和运行状态库 |
| **事实状态** | 实体、关系、来源、有效时间、置信度 | 事实服务 |
| **环境与证据状态** | commit、沙箱快照、测试结果、审批记录 | 运行环境和审计系统 |

### Claim→事实流水线

Agent 从材料读到的只能先作为**候选主张（claim）**，经实体消解和校验后才成为**规范事实**。

四个接口：`submit_claim()` / `query_facts()` / `publish_fact()` / `retract_fact()`

### 起步方法论

从 PostgreSQL 起步（claims/entities/relations/evidence 四张表），不必急于上图数据库。先盯住四件事：时间和版本不可静默覆盖、幂等键防重复写入、遍历时校验权限、撤回事件通知执行系统。

## 防跑偏三方法（飞樰，阿里云云原生 Supplementary）

Graph 体系要防"为了优化指标而牺牲本质"，需要三个不可动摇的约束（Carlos Perez 框架，2026-08-05 阿里云云原生飞樰补充）：

1. **Anchors（锚点）**：不可争论的事实必须由外部系统真实验证，不能由模型说了算——"钱真的转到账户了"而非报告写"转账成功"；"测试真的跑通了"而非标记"Pass"。锚点监督 Loop 有效性，防止模型自欺欺人。
2. **Frozen Nodes（冻结节点）**：优化器永远不能修改的规则，最典型是测试集——一旦定好有效测试集，不能因"效果不理想"改简单它。核心评估标准必须"冻结"，堵死"测量衰减"陷阱。
3. **External Judgment（外部判断）**："什么值得追求""什么目标有意义"必须由人来判断，系统只高效执行——这是防止 AI 在错误道路上狂奔的最重要防线。

### 单 Loop 四失败原因（补充框架）

飞樰补充了单 Loop 四种结构性失败原因的完整框架：① Goodhart's Law（指标优化后不再衡量原目标，AI 客服"刷解决率"案例：快速关单/阻止追问/滥用标记，5 个月指标涨但客户流失翻倍）；② Blindness Upward（向上盲视，无法质疑目标本身）；③ Conflict（多 Loop 目标打架）；④ Measurement Decay（测量衰减，改评判标准/换简单评测集）。对应四种 Graph 对策：监督循环（制衡刷指标）、慢循环（修正目标）、仲裁循环（解决冲突）、审计循环（检查指标失真）。

### Graph vs Workflow vs Dynamic Workflow

传统 Workflow = 确定性流水线（预先设定、路径不可变）；Dynamic Workflow（Claude Code）= 动态生成但相对固定，仍是单开发者一次性/短时任务的产品功能；Graph Engineering = 动态"组织管理"，多 Loop 组合互监督、运行中自主调整——三者是不同维度的抽象。

### 实战模式：监督 Loop + 评测集审批

文本分类场景：分类 Loop + 监督分类依据 Loop（审查规则合理性，发现过拟合直接驳回）+ 监管评测集 Loop（调整评测集须经另一 Agent 严格审批：调整依据/新数据来源/是否随机抽取）+ Test/Validation 分离（模型只在测试集迭代，验证集是盲盒，双集都提升才算真提升）。

→ [原文存档（腾讯技术工程）](https://mp.weixin.qq.com/s/LzpfUsJRMcpPHzDovo5IrA)
→ [原文存档（若飞/架构师，Supplementary）](https://mp.weixin.qq.com/s/S84hkwrvXocw56TSrnfqOA)
→ [原文存档（飞樰/阿里云云原生，Supplementary）](https://mp.weixin.qq.com/s/DadI9ZUxK0eiRtr0Qcx07Q)

---

