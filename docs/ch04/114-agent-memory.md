# Agent Memory 架构解析

## Ch04.114 Agent Memory 架构解析

> 📊 Level ⭐⭐ | 15.2KB | `entities/agent-memory-architecture-ruofei.md`

## 核心论点
Memory 不只是存储，而是 Harness 里的一层控制面——解决"哪些过去可以继续进入未来"这个工程问题。

### 边界切分
| 概念 | 定位 | 关键特征 |
|------|------|---------|
| **上下文窗口** | 当前工作集 | 临时、可丢弃；目标让本轮推理可解 |
| **Session** | 当前会话连续性 | 对话历史+工具调用+阶段性计划；短期状态 |
| **Profile** | 消费视图 | 低维快照(名字/角色/语言偏好)；不足以建模 |
| **Policy** | 外部规则 | 权限/安全/合规/预算；memory 只能引用不能改写 |
| **Memory** | 跨会话可更新历史 | 持续存在、可更新、可审计、影响未来决策 |

### 三类工程记忆（不止用户偏好）
1. **任务记忆** — 需求进度、被否方案、当前版本、未完成承诺
2. **环境记忆** — 仓库结构、团队规则、API 约束、部署方式、CI 特点
3. **自我记忆** — 工具稳定性、失败推断、子代理启用判断

## Memory 三主链路
### 写入
给某些历史分配未来影响力。核心规则：

- 用户明确的话 → assertion
- 工具/环境观察 → event / observation
- Agent 自己归纳 → belief（必须标注"未确认"状态）
- 权限/安全/预算内容 → 只能引用 policy，不自己生成
- 每条"长期有效"偏好 → 带 scope
> 写入最容易犯的错是把假设写成事实。

### 读取
先找约束，再找材料。传统 RAG 的 query→相似→top-k 对 Agent Memory 不够——该影响当前任务的历史未必长得像用户 query。
推荐 Progressive Disclosure：summary → memory index → rollout summary 逐层展开。

### 管理（最被低估）
- **冲突**：同一事实多版本，保留上下文差异而非仅"以最新为准"
- **衰减**：偏好有半衰期，遗忘应被当成能力设计
- **安全**：Memory 可写 → 持久化攻击面。提示注入可跨会话污染

## 五条路线对比
| 路线 | 代表 | 强项 | 风险 |
|------|------|------|------|
| Core + Archival | Letta | 稳定低延迟 | 太大污染上下文 |
| 长期记忆+衰减 | Mem0 | 容量大易接入 | 旧事实混淆 |
| 时间知识图谱 | Zep/Graphiti | 关系/时间/演化 | 成本高维护复杂 |
| 文件系统 | Clawdbot | 可读可审计可版本化 | 关系查询弱 |
| 自管理 | — | 随模型进步 | 弱模型管坏记忆 |

## Coding Agent 四层记忆结构
1. **当前工作集**（上下文窗口）— 当前推理用
2. **工作区文件** — AGENTS.md / CLAUDE.md / GOAL.md / PROGRESS.md / DECISIONS.md / KNOWN_ISSUES.md
3. **Memory store** — 跨 session 经验，需索引/权限/版本/删除
4. **事件日志** — 工具调用/测试结果/失败原因，复盘用

## 最小可用 Memory 设计（7 步）
1. 长期规则 → 可版本化文件
2. 任务状态 → 可接管证据（目标/验收/决策/验证）
3. Memory 加类型和作用域
4. 共享 memory 默认只读
5. 用户能浏览搜索编辑删除
6. 错误反馈回 memory 层标记过期
7. 评估测 recall + 更新 + 拒答 + 遗忘 + 偏好漂移

## 关联实体
- [Hermes Agent 记忆系统](ch03/044-agent.md) — 本文的 memory 管理理念与 Hermes 实现直接对应
- [Agent Harness 上下文管理](ch03/044-agent.md) — Memory 是 Harness 控制面的一层
- [Claude Code Agent 工程化](ch03/074-claude-code.md) — CLAUDE.md / AGENTS.md 工作区文件实践
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — 工程化控制面
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agent-memory-architecture-past-influence-future-ruofei.md)

## 深度分析
### Memory 作为控制面，而非存储层
若飞的核心洞察是把 Memory 从"存储"重新定义为"控制面"。这意味着 Memory 不只回答"数据存在哪"，而是要回答一串治理问题：什么值得写入、以什么身份写入、在什么范围内有效、什么时候降低权重、冲突时听谁的、被污染后怎么回滚。
这个视角回答了为什么很多团队按数据库思路做 Memory 很快碰壁——因为数据库只能管存储，管不了治理。

### 三类记忆的差异化生命周期
文章把记忆分为任务、环境、自我三类。这三类的更新频率和可靠性完全不同：任务记忆随时变、环境记忆相对稳定但边界模糊、自我记忆最容易出错且最难验证。把它们混在同一个存储里，后续的冲突检测、衰减处理、权限管理都会变得异常复杂。
自我记忆尤其特殊——它是 Agent 对自己过去行为的元认知，记录的是"我推断什么、什么推断后来被证伪、哪类任务我擅长"。这类记忆本质上带有置信度标注，且需要定期复核。

### 写入规则的本质：预算分配
把写入理解为"给历史分配未来影响力"，这个比喻很精准。这意味着每条写入不只是存储动作，还隐含了未来的检索成本、上下文成本、注意力成本和冲突管理成本。
这个思路的直接推论是：写入前应该先问，这条记忆如果在未来被频繁读到，带来的收益是否大于它可能造成的误导？尤其是 Agent 推断类记忆——它们天然带有"未确认"标签，但一旦进入上下文，模型往往会把它当事实处理。

### 读取的核心矛盾：相似性 vs 相关性
传统 RAG 的 retrieve(query) 模式依赖相似性，但对于 Agent Memory 该影响当前任务的那段历史，未必和用户当前问题语义相似。这是一个根本性的架构差异。
解决方案——Progressive Disclosure（summary → memory index → rollout summary）——本质上是把"相关性判断"分层：先让 Agent 知道有什么，再决定要不要深入，而不是让 Agent 从一开始就面对全部记忆碎片。
这个方案还有另一个好处：当 Agent 需要知道"我大概记得什么"时，不需要把全部记忆都塞进上下文。

### 安全问题的跨会话特性
提示注入跨会话污染是一个被低估的风险。普通注入只影响当前会话，但 Memory 注入会在未来会话里继续生效，且随着时间累积，污染面会越来越大。
这个风险让 Memory 的 read/write 权限设计变得格外重要：处理不可信输入时，默认不让它直接写长期记忆；共享 memory 默认只读；每次写入要有版本；关键 memory 要能人工 review。

### 最稳的第一步：工作区文件
对 Coding Agent，文章推荐 AGENTS.md / CLAUDE.md / GOAL.md / PROGRESS.md / DECISIONS.md 这套工作区文件方案。这个方案的核心好处是：人能读、Agent 能读、git 能追踪、可版本化。
这恰好回答了一个实际问题：当 Memory 系统出错时，工程师有没有办法查、审、回滚？答案如果是"没有"，这个 Memory 系统就不该上生产。

### 架构设计的正确顺序
文章强调"架构设计别从工具清单开始——它是从信息的生命周期开始的"。这和很多 AI 应用的错误思路相反：先决定用什么技术栈（向量数据库、知识图谱），再问这些技术要管什么信息。
正确的顺序应该是：先定义信息类型 → 再决定每类信息的生命周期 → 再选择匹配这个生命周期的存储方案。

## 实践启示
### 第一步：把记忆分类，匹配存储
不是所有记忆都适合同一个存储：

- 项目规则 / 团队约定 → 文件（AGENTS.md / CLAUDE.md）
- 用户明确偏好 / 置信度高的观察 → 结构化 key-value memory store
- 任务进度 / 当前状态 → PROGRESS.md / 工作区文件
- 完整事件日志 / 调试信息 → 日志系统
不要用单一数据库处理所有类型，否则冲突检测和衰减处理会变得不可维护。

### 第二步：为每条记忆带元信息
最小单元要包含：内容、类型、来源、作用域、置信度、时间戳、状态。未确认的 Agent 推断必须标注"未确认"状态，不能和用户明确声明混在一起。
这个元信息是后续冲突处理、衰减判断、权限管理的基础。没有它，系统只能靠"以最新为准"这种粗糙策略。

### 第三步：读写权限严格分层
- read-only 和 read-write store 分开
- 共享 memory 默认只读
- 处理不可信输入（网页、邮件、issue）时，默认不允许直接写长期记忆
- 用户级、项目级、团队级 memory 分开生命周期
这个分层是防御提示注入跨会话污染的核心机制。

### 第四步：实现 Progressive Disclosure
不要在每轮对话时把所有记忆都塞进上下文。先加载一小段 memory summary，让 Agent 知道有什么可用；再根据当前任务上下文决定是否深入搜索 memory index；最后才展开 rollout summary。
这个机制能有效控制上下文污染，同时让 Agent 能访问它需要的记忆。

### 第五步：把遗忘当成能力设计
偏好有半衰期，任务状态会过期，环境约束会变化。不能遗忘的系统最终会被自己的旧经验拖住。
具体做法：每次写入时标注时间戳；设计衰减函数让长时间未访问的记忆自动降低权重；明确支持"标记过期"和"撤销"操作；评估时不仅测 recall，还要测是否能正确拒答和正确遗忘。

### 第六步：建立 Memory 的可审计性
Memory 出错时，工程师要能查、能追溯、能回滚。这意味着：

- 每次写入有版本记录
- 关键记忆变更可人工 review
- 用户能查看、修改、删除自己的记忆
- 被撤销的记忆不能继续进入默认读取链路
可审计性不只是运维需求，它也是防御记忆腐化的最后一道防线。

### 第七步：从信息生命周期出发，而非工具清单
设计 Memory 系统时，先问几个问题：这类信息多久变一次？可靠性有多高？谁有权写入？谁有权读取？过期了怎么处理？这些问题的答案决定了存储方案和访问控制策略，而不是反过来。
记住：Memory 系统早期，先做到"像工程系统一样能查账"，再追求"像人一样记忆"。

## 相关实体
- [Agent Memory 架构本质](ch03/044-agent.md)
- [memory agent systems cobanov](ch04/480-memory-agent-systems-cobanov.md)

- [AI Agent 记忆系统架构](ch04/147-how-ai-agent-memory-works.md)
- [深度拆解 Hermes Agent 记忆系统](ch03/044-agent.md)
- [ai agent memory systems](ch04/150-ai.md)
- [你不知道的 Agent 原理架构与工程实践](ch04/304-agent-principle-architecture-engineering-practice.md)
- [Agent Memory System 设计指南](https://github.com/QianJinGuo/wiki/blob/main/queries/agent-memory-system-design.md)
- [Agent Harness 架构](ch03/044-agent.md)
- [Agent 自我改进的六条路](ch03/044-agent.md)
- [Agent架构关键变化：Harness正在成为新后端](ch03/044-agent.md)
- [深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践](ch11/210-openclaw.md)
- [AI Coding Agent 记忆系统](ch04/150-ai.md)
- [Agent Memory System Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-system-design.md)
- [Coding Harness 工程本质](https://github.com/QianJinGuo/wiki/blob/main/concepts/coding-harness-engineering.md)
- [Thin Harness Fat Skills](ch04/245-skill.md)
- [Hermes Agent 记忆系统深度拆解](ch03/044-agent.md)
- [Design Patterns for AI Agents 2026](ch04/150-ai.md)
- [harness-engineering-systematic-explainer](ch05/036-harness-engineering-systematic-explainer.md)
- [claude-code-7-layer-memory-architecture](ch01/869-claude-code-7-layer-memory-architecture.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/memory-context-systems.md)

---

