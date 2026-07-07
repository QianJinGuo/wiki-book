# Wiki Evolver

## Ch07.015 Wiki Evolver

> 📊 Level ⭐⭐ | 14.6KB | `entities/wiki-evolver.md`

## 相关查询

- [Wiki Evolver 工作流程与最佳实践](https://github.com/QianJinGuo/wiki/blob/main/queries/wiki-evolver-workflow-best-practices.md) — wiki-evolver cycle 机制、frontier 决策、evaluation harness 与回归测试

## 为什么需要这一层
当前 vault 已经有比较成熟的 ingest / index / log / lint 闭环，也已经有 `[Wiki Master Map](https://github.com/QianJinGuo/wiki/blob/main/moc/wiki-master-map.md)`、``、`` 这样的导航与治理面。但这些层更多解决的是"怎么把知识存进去、找出来、维护好"，还没有系统性解决"如何让知识库主动长出新的研究问题、论文候选、工程实践和下一代 Skill"。
Wiki Evolver 的作用正是在这里：它把 ``、`[Ai Team Knowledge Harness](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-team-knowledge-harness.md)`、`[Harness Engineering Systematic Framework](../ch05/062-harness-engineering.html)` 等现有思想，提升成一个统一编排层。

## Core Contract
这个 Skill 的完成条件不是"发现了有趣文章"，而是每轮至少要产出一个 durable outcome：
1. 新增/更新 source material
2. 新增/更新 synthesis page
3. 新增/更新 query/navigation page
4. 新 research question 或 frontier map
5. 基于 vault 的 paper / practice 草稿
6. 治理修复：index / log / lint / links
7. 改进后的 Skill / checklist / playbook
这比 `[Skill Craft](ch07/049-skill-craft-claude-skill.html)` 的关注点更上层：Skill Craft 关注 Skill 质量本身，Wiki Evolver 关注整个知识系统如何把价值不断向上提升。

## Operating Loop
Wiki Evolver 的推荐循环是：
```text
Orient → Route → Triage → Synthesize → Emerge → Govern
```

- **Orient**：读 `SCHEMA.md`、`index.md`、最近 `log.md` 和 relevant queries
- **Route**：URL 交给 `web-content-reviewer`，wiki 写入交给 `llm-wiki`
- **Triage**：不仅看 source quality，还看 `vault_delta`
- **Synthesize**：把 source 写成 entity / concept / comparison / query
- **Emerge**：从本轮结果里抽取新问题、新连接、新产物候选
- **Govern**：更新 index/log 并跑 structural validation
它和 `` 的关系很密切：两者都强调"经验必须沉淀成下一轮默认存在的能力"，但 Wiki Evolver 把这个原则直接落到了 knowledge vault 本身。
在当前实现里，这个大循环又被进一步压成了一个更稳定的执行节奏：
```text
frontier
→ paper
→ practice
→ dashboard
→ next frontier
```
这意味着 Wiki Evolver 不要求每次都走完全链路，而是要求每轮识别最值得推进的瓶颈，并至少交付一个 durable artifact。

## Knowledge Ladder
Wiki Evolver 最有价值的地方，是给出了一条清晰的知识上升路径：
```text
raw source
→ claim
→ mechanism
→ pattern
→ comparison
→ principle
→ playbook
→ paper
→ Skill
```
这条 ladder 把知识库从"资料堆积"转成"高层产物工厂"。它也解释了为什么 ``、`[Research Frontier Map](https://github.com/QianJinGuo/wiki/blob/main/queries/research-frontier-map.md)`、`[Paper Backlog](https://github.com/QianJinGuo/wiki/blob/main/queries/paper-backlog.md)`、`[Engineering Practice Backlog](https://github.com/QianJinGuo/wiki/blob/main/queries/engineering-practice-backlog.md)` 这些页面值得存在：它们是 ladder 上不同层级的导航与中间站。

## 与现有系统的分工
| 层 | 角色 | 作用 |
|---|---|---|
| 守门层 | `web-content-reviewer` | 严格过滤、评分、决定是否入库 |
| 落库层 | `llm-wiki` | 写入 raw / entity / concept / comparison / query，并维护 index / log / lint |
| 编排层 | `wiki-evolver` | 发现缺口、推动 synthesis、生成 frontier / paper / practice / skill 候选 |
这意味着 Wiki Evolver 不应该写成一个"超大万能 Prompt"，而应该写成一个上层 orchestration Skill：调用现有工具，但把目标从"完成单篇任务"提升到"推动整个 vault 演化"。

## 最值得落地的四个页面
这份设计最直接的增量，不是先写完整 Skill，而是先把它提出的 4 个高层页面落下：

- ``
- ``
- ``
- `[Vault Evolution Dashboard](https://github.com/QianJinGuo/wiki/blob/main/queries/vault-evolution-dashboard.md)`
它们分别承接问题发现、论文候选、工程实践候选和系统演化治理四种需求，是把"talk to my vault"做成长期机制的最小起点。
现在这些页面已经齐了，因此下一阶段重点不再是"把页面补出来"，而是让它们作为固定控制面被周期性运行，持续把 recurring reasoning 压缩成 query、playbook、template、validator 和更稳的 Skill。

## 深度分析
### 1. 定位的本质：元系统而非工具
Wiki Evolver 的核心创新不在于做任何单一类型的知识处理，而在于**它是关于系统的系统**。它把自己定位成"上层编排层"，这意味着它的输入是其他工具的输出，它的产品是更高层次的理解和研究方向。这种递归提升的结构，恰恰对应了知识管理中最稀缺的能力——不是缺少信息，而是缺少**关于信息的元认知**。
传统的知识管理讨论往往陷入"如何组织"的技术细节，而 Wiki Evolver 直接跳到了"如何让组织本身产生价值"的哲学层面。它的参照系不是 Evernote、Notion 或 Obsidian 这些工具，而是**组织的学习机制**——就像 Warren Buffett 的思维框架是用一生提炼出来的决策原则，Wiki Evolver 想让 vault 本身也能长出这种能力。

### 2. Operating Loop 的关键设计：循环而非流水线
Orient → Route → Triage → Synthesize → Emerge → Govern 这个循环最妙的地方在于它的**无终点设计**。传统的工作流有明确的 start 和 end，但 Wiki Evolver 的循环是自我指涉的：Govern 阶段的输出直接影响下一轮的 Orient。
这与认知科学中的"双过程理论"相呼应：System 1 负责快速处理（Route、Triage），System 2 负责深度反思（Synthesize、Emerge）。Wiki Evolver 把这两个过程编织成了一个连续体，而不是两个分离的阶段。
特别是 **Emerge** 这个阶段——它要求 agent 不仅要完成任务，还要从结果中抽取"新问题、新连接、新产物候选"。这相当于强制要求每次行动都要有**认知剩余**（cognitive surplus），而不是做完就结束。这个设计直接解决了"学了很多但没有长出洞见"的常见困境。

### 3. Knowledge Ladder 的涌现性质
raw source → claim → mechanism → pattern → comparison → principle → playbook → paper → Skill 这条 ladder 不是一条固定装配线，而是一条**相变路径**。每一级的转化都涉及信息密度的质变：

- raw source 是原始观测，未经处理
- claim 是初步断言，有待验证
- mechanism 是因果解释，说明"如何"
- pattern 是跨案例的规律，超越单个情境
- principle 是抽象规则，接近"第一性原理"
- playbook 是可操作的清单，接近实践智慧
- paper 是正式化的知识传播载体
- Skill 是压缩进能力的最佳实践
Wiki Evolver 的设计者正确地识别出：大多数知识库的误区在于把精力全部投入在 source 采集（左侧），而忽视右侧的高价值转化。这就像一个公司花大量时间收集市场情报但从不做出决策。

### 4. 四个落地页面的战略价值
research-frontier-map、paper-backlog、engineering-practice-backlog、vault-evolution-dashboard 这四个页面之所以是最佳切入点，原因是它们代表的是**系统对自身的感知能力**：

- research-frontier-map = 系统对未知边界的感知
- paper-backlog = 系统对自身产出的规划
- engineering-practice-backlog = 系统对实践知识的积累
- vault-evolution-dashboard = 系统对自身演化的监控
它们一起构成了一个**自我建模**（self-modeling）的机制。没有自我模型，系统就无法自我改进。这是 Wiki Evolver 从工具上升为系统的关键一跃。

### 5. 与 Agentic AI 研究的深层联系
Wiki Evolver 的设计哲学与当前 AI 领域对"Agent"的理解高度共鸣。ReAct、AutoGPT、Agentic Workflow 等范式都在探索如何让 AI 系统不只是执行单步任务，而是能够**自我引导、记忆积累、跨任务学习**。Wiki Evolver 本质上是在为 LLM 提供一个**外部记忆系统**，让 vault 成为 agent 的海马体——不仅存储，还在检索和整合中实现记忆的巩固与泛化。
这解释了为什么 Wiki Evolver 要强调 durable outcome 而不是"有趣的发现"——一个真正的 agent 需要的是**可积累的能力**，而不是孤立的信息碎片。

## 实践启示
### 1. 从"收藏者心态"切换到"生产者心态"
大多数人在使用知识管理工具时，潜意识里是在做"收藏"——看到好文章就保存，标记"稍后阅读"。Wiki Evolver 的第一个实践启示是：**每当你添加一个 source，强迫自己问一个问题**："这个 source 能帮我产出一个 durable outcome 吗？"
可以把这个原则具象化为一个习惯：每保存一篇文章，立即在笔记里写一行"This source 帮我排除了/验证了/深化了一个什么 claim 或 question"。如果写不出来，说明这个 source 的价值还没有被充分挖掘。

### 2. 用 Loop 而非 List 来组织工作
不要用"待办清单"的方式运行知识工作，而是用**循环**的方式。具体的操作节奏可以是：
```
每周一：Orient（回顾上周产出，扫 index/log，找到最有价值的空白）
周二-周四：执行具体任务（Route/Triage/Synthesize）
周五：Emerge（从本周结果中抽取新问题）
周末：Govern（更新 index/log，跑 lint validation）
```
关键是**周五的 Emerge 环节不能跳过**——它是从"做了事"到"长了能力"的关键转换。很多人的知识管理工作停留在"做了很多事"的层面，正是因为缺少这个反思-抽象阶段。

### 3. 优先填充 Ladder 右侧的页面
不要只关注 entity 和 concept 的数量，要关注 **query 目录下的四个页面**（research-frontier-map、paper-backlog、engineering-practice-backlog、vault-evolution-dashboard）是否在持续更新。
一个健康的 vault 应该体现：底层 source 在持续积累，同时右侧的产出层（paper、practice、frontier）也在同步生长。如果只有 source 在增长，说明知识没有被有效转化。

### 4. 把"矛盾"和"空白"当作第一等公民
Wiki Evolver 的设计中没有直接提及，但实践中极其重要的一个发现是：**最有价值的知识往往出现在矛盾处**——两个 source 说法不一、预期与实际不符、已发表的论文被新证据推翻。
建议在 vault 中主动维护一个"张力记录"（Tension Log）：专门记录那些让你感到困惑、不确定、相互矛盾的发现。这些张力是emergence的前兆，是新洞见的原材料。每周挑一个张力，深入挖掘，往往能产出比普通 source 加工高出一个数量级的价值。

### 5. 设计的skill要足够薄，足够稳定
Wiki Evolver 的设计者强调它不应该写成一个"超大万能 Prompt"，而应该是一个"上层 orchestration Skill"。这个原则值得迁移到所有知识工作的自动化中：**薄而稳定的接口 > 厚而不稳定的智能**。
具体来说，当你设计一个 skill 或 automation 时，先问：这个 skill 的输入是什么、输出是什么、它的失败模式是什么？而不是先设计一个能"做一切"的超级 prompt。Wiki Evolver 的成功正是因为它定义了清晰的 contract（Core Contract），而不是试图在单次执行中解决所有问题。

## 相关查询
- [Wiki 日常维护的最佳实践与常见问题解决方案](https://github.com/QianJinGuo/wiki/blob/main/queries/wiki-maintenance-faq.md) — Wiki 维护检查清单与常见问题

---
[DONE]

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/wiki-structure-navigation.md)

---

