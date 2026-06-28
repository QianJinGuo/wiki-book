## Ch06.018 AI Context Layer 框架

> 📊 Level ⭐⭐ | 7.9KB | `entities/ai-context-layer-kgc-2026.md`

## 核心论点
AI投资回报率为零的根本原因不是模型不够聪明，而是**Context（上下文）缺失**。即使Intelligence（智力）提升了多个数量级，Context为零导致乘积为零。

## 核心公式
$$P = f(I, C)$$

- **P**: Performance（工作表现）
- **I**: Intelligence（认知智力，大致固定）
- **C**: Context（通过工作积累的知识、技能、工具）
**关键洞察**：这个函数是乘法性质，不是加法。Context为零，无论Intelligence有多高，Performance就是零。

## Maya Day 1 类比
一个新员工Maya花了**四个月**积累Context才能高效工作：

- Week 1: 读Wiki，背政策
- Week 2: 系统培训，角色扮演
- Week 4: 跟岗学习潜规则
- Month 1-3: 从错误中学习，处理边缘case
**结论**：AI Agent每次部署都是"Day 1"，带着超强能力、零Context上岗。

## 四象限模型
| | 低Context | 高Context |
|---|---|---|
| **高Intelligence** | 危险区域（confident hallucination at scale） | **目标区域**（有效AI） |
| **低Intelligence** | 无用 | 可靠但受限（规则系统） |
大多数企业被困在**右下角**：模型很强，但不知道业务定义、潜规则、例外情况。

## 三堵墙
### 1. Context Bootstrapping（冷启动）
搭一个Agent只要五分钟，给它注入业务上下文要五个月。

### 2. Context Management（不共享学习）
一个Agent有记忆，一群Agent有失忆。每个Agent永远从零开始。

### 3. Context Portability（语义冲突）
多Agent对同一概念有不同解读，导致"有说服力的错误"。

## 飞轮效应
越过三堵墙后，Context会形成飞轮：
1. 业务系统已有数据可生成Context草稿
2. 每次精修建立在上次基础上，质量爬坡
3. 每次交互的Trace（纠错、反馈）是金矿
4. 需要像代码库一样维护：版本控制、测试、治理

## 与现有知识的链接
- → Harness Context Management — Context作为Agent的工作集
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-context-layer-kgc-2026.md)

## 核心价值
这个框架的诊断价值大于产品价值。用P=f(I,C)、Maya on Day 1、四象限、三堵墙这些工具，可以诊断企业AI现在处于哪个象限、撞的是哪堵墙。
> 第四堵墙（隐含）：没有人认领Context建设这件事——它不在任何人的KPI里。

## 深度分析
### 诊断框架的迁移：从"模型够不够好"到"给没给它可以用的东西"
Prukalpa在演讲中观察到，问对问题本身就代表了企业AI战略的根本转向。大多数企业困在右下角（高Intelligence、低Context），不断换更强的模型，但每次部署仍是Day 1。这个困境不是技术问题，而是认知框架问题——直到P=f(I,C)这个乘法公式出现之前，没有框架能清晰说明为什么"模型更强"不等于"效果更好"。

### 三堵墙的结构性解读
**第一堵墙（冷启动）**的本质是：Context无法购买，只能积累。Intelligence按API调用次数计费，Context则需要业务人员时间投入。这两种成本的不对称决定了企业花钱的方向和实际缺口的方向不一致。
**第二堵墙（不共享学习）**在架构上是一个信息流问题，但在治理上是一个优先级问题。作者在文中提出了一个反向观点：在Context质量验证机制建立之前，打通Agent间学习通道可能加速错误传播。这比"信息不流动"更深一层——"什么信息值得流动"这个元问题没有被解决。
**第三堵墙（语义冲突）**的危险在于它的隐蔽性。当多个Agent各自以"有说服力的自信"输出不同版本的真相，在汇聚点对账之前，这个冲突不会被发现。Sierra、Writer、Google Agentspace、Snowflake Cortex都在经历这个过程。

### 飞轮成立的隐含条件
作者对飞轮持保留态度：对"业务系统已有数据可生成Context草稿"这一步骤的乐观，在现实中会遇到SQL过时、字段描述缺失、lineage不完整等问题。更根本的是，Context飞轮转起来需要三个前提——业务相对稳定、数据可信度高、组织愿意把潜规则说出来——而这三个条件在大多数仍在快速变化的公司里无法同时满足。

### 第四堵墙：责任归属的空白
Context建设落在数据工程、AI产品、治理三个团队的交叉地带，实际上是无人的KPI。这不是组织设计问题，而是企业还没真正认定Context是资产。

## 实践启示
**立即可用的诊断问题：**
1. 你的AI现在处于哪个象限？做一次四象限评估。
2. 你正在撞的是哪堵墙？三堵墙的优先级不同：冷启动需要领域专家时间，管理墙需要架构设计，语义墙需要治理协议。
3. 有没有人认领Context建设？如果没有，这是比换模型更优先要解决的问题。
**飞轮启动的条件判断：**
在考虑Context基础设施之前，先评估：业务稳定性、数据可信度、组织对潜规则编码的意愿。如果这三个条件不满足，先让Context飞轮的概念在团队中形成共识，等到条件成熟再动手。
**最小可行Context的起点：**
不必等完美。先从高频、高价值的边缘case开始，把"没有人写下来"的那条潜规则编码进Context，比构建全面本体更重要。质量在精修中爬坡，不在一次性和盘托出。
**多Agent团队的语义对齐：**
在多个Agent投入生产之前，先建立跨Agent的概念字典——尤其"revenue"、"活跃用户"这类关键指标的定义。定义冲突的代价随Agent数量指数增长，但预防成本是线性的。
> [!contradiction] 参见  — 持"Context作为Agent工作集"的不同实践路径
> [!contradiction] 参见 [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-context-layer-kgc-2026.md) — 持更乐观的飞轮预期

## 相关实体
- [OpenHuman: AI Agent 持久记忆框架](ch04-284-kipi-open-source-osint-investigation-platform-with-autonomo.html)
- [AI Coding Agent 记忆系统](ch04-288-ai-coding-agent-记忆系统.html)
- [Claude Code Agent 工程设计](ch04-015-claude-code-agent.html)
- [Agent Memory System Design](ch04-451-agentbrowser.html)
- [这个开源 agent 框架的核心设计，可能是目前最「聪明」的取舍](ch04-012-这个开源-agent-框架的核心设计-可能是目前最-聪明-的取舍.html)
- MOC

---
