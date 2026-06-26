# agent-memory-architecture-past-influence-future-ruofei

## Ch04.029 agent-memory-architecture-past-influence-future-ruofei

> 📊 Level ⭐⭐ | 31.3KB | `entities/agent-memory-architecture-past-influence-future-ruofei.md`

> 原创 若飞 架构师（JiaGouX）2026年5月12日
最近几篇，我们一直在绕着同一件事往下看。
先是 Cursor 的 Harness 复盘，让我印象比较深的一点是：Agent 真进了生产，一次回答有多聪明只是表层，后面还要看能不能评估、能不能观测、出问题能不能回滚、迭代时能不能持续调优。
然后是上下文操作权。从 Claude Code 的 agentic search，到上下文窗口、工具输出、子代理隔离，问题慢慢变成：哪些信息进当前工作集，哪些留在窗口外，什么时候再取回来。
再往后看长周期 Agent，又多了一层：一个任务跑了几个小时，跨了几个上下文窗口，最后留下来的"现场"，能不能让下一个 Agent、下一个模型、甚至下一个人接着干。
这条线顺下去，绕不开 Memory。
更早一点写 Clawdbot 内存架构《记住不难，想起才难》的时候，就已经碰到过这个问题。当时的重点还落在 Markdown 文件、混合检索、压缩前刷新这些抓手上。回头看，那只是第一层。
把 Memory 放进 Agent Harness 之后，我现在更关心另一个问题：
过去的信息，凭什么继续影响未来？
这听着有点绕，放到工程现场里就很具体。
一个 Agent 记住用户喜欢 TypeScript，本身是好事。可如果这条偏好来自半年前一个原型项目，今天用户正在维护的是 Python 数据管道，它还死抱着那条记忆不放，就会坏事。
一个 Agent 记住"上次这个方案没成"，也可能有用。但如果上次失败是环境没装好，而不是方案本身有问题，这条记忆每被读出来一次，就会把后面的任务往错路上带一次。
Memory 做不好，很多时候并不会显式报错。
模型还是会答得很顺，只是它已经被旧的、错的、过期的经验牵着走了。
---
太长不看

- 把 Agent Memory 直接理解成聊天记录、长上下文或对话摘要，都会漏掉最麻烦的一层。
- Session 解决当前会话连续性，Memory 解决跨会话、跨任务、跨时间的可更新经验。
- Profile 可以看成 Memory 的一个消费视图；Policy 属于外部规则，不能让 Memory 随便改写。
- Memory 的主链路可以压成三件事：写入、管理、读取。
- 生产级 Memory 至少要覆盖任务、环境和 Agent 自己的失败经验，用户偏好只是其中一类。
- 写入的动作，是给某些历史分配未来影响力。
- 读取的动作，是把合适的历史转成当前任务的约束。
- 管理环节最容易被低估：冲突、衰减、遗忘、版本、权限、审计，最后都会找上门。
- 对 Coding Agent 来说，最稳的第一步通常是人能读、Agent 能改、系统能审计的工作区文件。
- Memory 一旦可写，就变成持久化攻击面。被提示注入污染的 memory，会在未来会话里继续生效。
- 值得做的 Memory，会让 Agent 在一个具体任务域里少重复犯错，也更能理解约束变化；至于"更懂你"，反而是靠后的一层。

## 先别急着把 Memory 当数据库
很多团队第一次做 Agent Memory，第一反应是上数据库。建一张表，存用户偏好、历史对话、任务摘要，再挂一个向量检索。需要的时候搜一下，拼进 prompt，模型就"记得"了。
这个版本能跑，也确实能解决一部分问题。但它很快会撞上几个麻烦：
1. 存进去的不一定都该长期影响未来。用户今天随口说"先别管测试"，到底是当下赶时间，还是长期偏好？这些东西如果不带来源、作用域和时间，一旦被存成"记忆"，后面就很难再分清。
2. 搜出来的不一定适合当前任务。用户问"帮我改缓存策略"，语义上最接近的可能是上次讨论 Redis 的对话。可最后会改变设计选择的，也许是三个月前一次大促压测失败记录。相似不代表适合拿来用。
3. Memory 会过期。偏好会变，项目会变，团队规则会变，模型能力也会变。一个不能遗忘的系统，最后会被自己的旧经验拖住。
后来我会把 Agent Memory 看成 Harness 里的一层控制面。只按存储层理解，会漏掉最麻烦的部分。存储只回答"东西放哪儿"。Memory 要回答的至少是这一串：什么值得写入、以什么身份写入、在什么范围内有效、什么时候降低权重、和旧记忆冲突时听谁的、被污染或写错后怎么回滚、用户能不能查看修改删除。这些问题没一个是数据库本身能回答的——都落在治理上。

## 先把几个边界切清楚
### 上下文窗口只是当前工作集
上下文窗口承担的是 Agent 当前这一轮推理的工作集。它的目标，是让这一轮模型调用可解。长期保存全部历史，不该压在这层。长上下文能提高带宽，但不会自动帮你建模。把过去几十次会话全塞进去，模型面对的就是一堆未经结构化的信号。

### Session 管当前会话
Session 管的是当前会话的连续性。对话历史、工具调用、阶段性计划、刚跑完的测试输出，都属于短期状态。它们有时会被提炼进长期记忆，但不能直接等同于长期记忆。

### Profile 是一个消费视图
Profile 里可能有名字、角色、语言偏好、常用技术栈——但只是一份低维快照。一个 Agent 真要理解你，光记住"你喜欢 Go"还不够。它还得知道这个偏好在哪类项目里成立、什么时候你会为了生态放弃它。

### Policy 要单独放
Policy 管的是允许和禁止：权限、安全、合规、预算上限。Memory 可以记录"某条规则在哪儿见过"，也可以提醒当前任务要遵守它，但不能自己去改写规则。如果 Agent 的记忆能把"禁止访问生产库"悄悄改写成"必要时可以访问"，学习能力再强也没用。

### Memory 的边界定义
> Memory 是跨会话持续存在、可被更新和审计，并且会影响未来决策的结构化历史。
前半句说"历史"，后半句才是麻烦所在：它会影响未来决策。

## 记忆不能只围着用户偏好转
"Agent Memory"这个词一出来，很多人下意识会先想到用户偏好。这些当然要记。但只盯着这一类，Memory 很容易被做成一个加强版用户画像。它能让回答更贴身，未必能让 Agent 更可靠。
放到工程任务里，至少还有三类东西，重要程度不输用户偏好：
1. **任务记忆** — 需求已经确认了什么、哪些方案被否过、哪个文件是当前真版本、哪些承诺还没完成、哪些测试跑过。长任务经常输在这里：Agent 没有忘记用户是谁，却忘了事情已经推进到哪一步。
2. **环境记忆** — 仓库结构、团队规则、API 约束、部署方式、CI 特点、线上事故背景。Agent 如果不记环境，每次进项目都像第一次。
3. **自我记忆** — 它上次试过什么、哪个工具在这个仓库里不稳定、哪条推断后来被证明是错的、哪类任务最好先开一个独立的子代理。
Memory 的目标不在于复制一个人。更朴素地看：把"用户怎么想、任务到哪了、环境怎么变、我自己哪里容易错"这几条线，整理成未来任务可以使用的约束。
用户偏好、任务状态、环境事实、自我反省，更新机制完全不一样。把它们混在同一个 memory 字段里，后面一定难管。

## 摘要只能算一步
很多产品最早做 Memory 都是从 summary 开始的。但摘要只是 memory pipeline 里的一个动作，不能直接等同于 Memory。
摘要的问题在于它天然偏向留结论，结论背后的形成过程被压掉了。"用户偏好 TypeScript"——是因为团队规范、个人习惯，还是因为当前项目已经用 React？"方案 A 失败"——是因为思路不对、实现不完整，还是环境缺依赖？
**Memory 的最小单元，最好别只是一段自然语言摘要。再小也得带上几类元信息：**

- 内容：这条记忆到底说了什么
- 类型：事件、用户声明、Agent 推断、外部约束、未完成承诺
- 来源：来自用户、工具观察、代码仓库、文档，还是 Agent 自己推断
- 作用域：项目级、用户级、团队级、当前任务级
- 置信度：尤其是推断类记忆，不能和用户明确声明混在一起
- 时间：何时产生，何时被确认，多久没再用过
- 状态：仍然有效、待确认、已过期、被撤销

## 写入：给过去一张未来通行证
Memory 的第一道关，先看什么值得存。写入这一步可以理解成一次预算分配——不光是存储空间，还包括未来的检索成本、上下文成本、注意力成本、冲突管理成本。
写入链路最容易犯的错，是把假设写成事实。在长周期 Agent 里尤其危险：一个 Agent 误判写入，下一个 Agent 读到可能把它当成已验证的事实。再跑几轮，错误假设就长成了团队共识。
**写入的几条规矩：**

- 用户明确说过的话，按 assertion 存
- 工具和环境观察到的结果，按 event 或 observation 存
- Agent 自己归纳出来的，只能按 belief 存
- 未验证原因必须保留"未确认"状态
- 涉及权限、安全、预算的内容，只能引用 policy，memory 自己不能生成 policy
- 任何标榜"长期有效"的偏好，都得带 scope

## 读取：先找约束，再找材料
传统 RAG 的读取方式，很容易让人以为 Memory 就等于 retrieve(query)。放在知识问答里够用，但放在 Agent Memory 里常常不够。因为该影响当前任务的那段历史，未必和用户当前的问题长得像。
用户一句"帮我重构一下支付模块"，相似度最高的记忆可能是上次也在聊支付模块。但这次怎么做，可能要先看这些约束：团队之前明确说过不能改数据库表；上次事故和退款幂等有关；用户偏好先加测试再重构；当前仓库里支付模块由另一个团队维护。
**读取这一步，别只从 query 出发，也要从任务上下文出发。** 先弄清当前任务受什么约束，再去找对应的记忆。
OpenAI 的 progressive disclosure 是一个顺手的方向：先给一小段 memory summary，让 Agent 知道大概有哪些历史；跟当前任务相关，再搜索 memory index；确实需要细节，再打开对应的 rollout summary。
Anthropic managed agents memory 把 memory store 直接挂载成 session 容器里的一个目录，Agent 用标准文件工具读写——没把 memory 做成神秘黑箱，反而让它回到工程师最熟悉的那套东西：路径、权限、版本、审计。
> Memory 越往生产走，越像一份可逐步展开、可被工具操作、可被人审查的工作区资产。

## 管理：最容易被低估，也最决定长期质量
写进去只是开始。Memory 会冲突，会过期，会被错误总结污染，也会被提示注入攻击。
**冲突：** 用户去年说"我不喜欢 ORM"，今年在新项目里要求用 Prisma。简单写成"以最新为准"会丢掉很多信息。更稳的处理方式是把上下文差异保留下来。
**衰减：** 很多偏好都有半衰期。用户上个月赶 deadline 时说"少解释，直接给代码"，不等于他长期就不想看解释。遗忘也该被当成能力来设计——MemoryAgentBench 已经把 selective forgetting 当成一项能力来考，LongMemEval 也把 knowledge updates 和 abstention 放进评估里。
**安全：** Anthropic managed agents memory 文档有句提醒：如果 agent 处理的是不可信输入，而 memory store 又是可写的，提示注入完全可能把恶意内容写进 memory。后面的 session 再读出来，就会被当成可信历史用。这比普通的 prompt injection 更麻烦——普通注入大多只污染当前会话，Memory 注入会跨会话留下来。
Memory 一旦可写，就要按持久化数据和执行上下文来对待：

- read-only 和 read-write store 要分开
- 共享资料库默认只读
- 用户级、项目级、团队级 memory 分开生命周期
- 每次写入要有版本
- 关键 memory 要能人工 review
- 用户能查看、修改、删除
- 被撤销的 memory 不能继续进入默认读取链路
- 处理网页、邮件、第三方文档等不可信输入时，默认不要让它直接写长期记忆

## 几条路线，不必急着站队
| 路线 | 强项 | 容易踩的坑 |
|------|------|-----------|
| Letta (core + archival memory) | 稳定、低延迟、每轮都可见 | 太大就污染上下文 |
| Mem0 (长期记忆+衰减) | 容量大、接入快、语义召回 | 旧事实混淆、近义误召回、来源不清 |
| Zep/Graphiti (时间知识图谱) | 擅长关系、时间和演化 | 成本、抽取质量、图维护复杂 |
| Clawdbot (Markdown 文件) | 可读、可审计、可版本化 | 关系查询和自动整理能力弱 |
| Self-managed memory | 能随模型能力一起进步 | 弱模型会把记忆管坏 |
更接近工程现实的说法是：先看你的 Agent 到底要记什么。

- 只是项目规则，文件就够了
- 是用户偏好，结构化 key-value 加版本可能更稳
- 是客服、销售、医疗、法务这种长期关系，时间图谱会更有价值
- 是 Coding Agent 的长任务现场，GOAL.md、PROGRESS.md、DECISIONS.md 这类工作区文件往往比接一个复杂记忆平台更有用
架构设计别从工具清单开始——它是从信息的生命周期开始的。

## 放到 Coding Agent 该怎么落地
### 四层记忆结构
1. **当前工作集**（上下文窗口）— 当前推理用。正在改的文件、当前计划、刚跑出的错误。不需要长期保存。
2. **工作区文件** — AGENTS.md、CLAUDE.md、GOAL.md、PROGRESS.md、DECISIONS.md、KNOWN_ISSUES.md。人能读、Agent 能读、git 能追踪，最适合承载项目规则、当前目标、已确认决策、任务进度、已知坑点。
3. **Memory store** — 跨 session、跨任务的经验：用户偏好、团队约定、工具稳定性、项目历史、常见失败路径。需要索引、权限、版本和删除机制。
4. **事件日志** — 工具调用、测试结果、失败原因、用户反馈、回滚记录。不一定每次都读进上下文，但是复盘和评估的基础。
**信息分类决策表：**
| 信息类型 | 更适合放哪里 |
|---------|------------|
| 当前任务下一步 | 上下文窗口 / PROGRESS.md |
| 项目长期规则 | AGENTS.md / CLAUDE.md |
| 已确认架构取舍 | DECISIONS.md / ADR |
| 用户长期偏好 | memory store |
| 某次失败的完整日志 | event log / artifact |
| 未验证猜测 | progress observation，标记未确认 |
| 安全和权限规则 | policy 系统，只允许 memory 引用 |
重点是让每类信息有自己的生命周期。

## 几个系统的收敛方向
几个系统都在往同一个方向收敛：

- 只靠向量通常不够，还会混合关键词、语义、图关系、文件路径
- 需要一小层 always-loaded context，让 Agent 知道自己大概知道什么
- 记忆最好是人能读的，别只存在 embedding 里
- read-write loop 要能闭上：读完、行动、评估之后，还能把经验写回去
其中"人能读"特别容易被低估——因为 Memory 一旦出错，人要能查得动。这几年越来越偏爱 plain markdown、git history、versioned memory store 这类朴素设计。不一定最性感，但工程上好解释、好审计、好回滚。
> Memory 系统早期，别急着追求"像人一样记忆"。先做到"像工程系统一样能查账"。

## 最难啃的是共享记忆
到了多 Agent、团队级、组织级，事情会更麻烦。一个 Agent 写入"方案 A 失败"，另一个 Agent 可能写入"方案 A 在新约束下可行"。多个 Agent 同时读写同一份 memory store，冲突一抓一大把。
以前团队文档写错，最多是人读错。现在 memory 写错，Agent 会跟着执行错。差别就在这里。

## 一个最小可用的 Memory 设计
1. 把长期规则放进可版本化文件（AGENTS.md、CLAUDE.md）
2. 把任务状态写成可接管的证据（目标、非目标、验收标准、进度、决策、验证记录）
3. 给 memory 加类型和作用域（区分用户声明、环境观察、Agent 推断、团队规则引用、未完成承诺）
4. 默认让共享 memory 只读（处理外部网页、邮件、issue 时，别让 Agent 随手写长期记忆）
5. 让用户和维护者能看见（浏览、搜索、编辑、删除、追溯来源）
6. 把错误反馈回 memory 层（如果 Agent 因为某条旧记忆做错了，要回到 memory 层标记过期）
7. 评估别只看 recall（还要测能不能更新、能不能拒答、能不能忘掉、能不能处理偏好漂移）

## 写在最后
以前聊 Agent，我们常常从一个公式起步：模型、工具、规划、记忆、循环。这个说法有用，但现在看下来已经不够细了。这几个词每往下拆一层，都是一套系统。
记忆往下拆，就会碰到这个问题：哪些过去可以继续进入未来。
能记住，当然重要。但更要紧的是，记住之后还能修正、能遗忘、能追责。做不到这一点，Memory 越强，Agent 可能越固执。

## 深度分析
### 核心命题的解构
本文围绕"过去的信息凭什么继续影响未来"这一核心问题展开，实际上是在回答一个根本性的架构问题：**Memory 不是存储，而是治理**。
传统理解里，Memory 被当成存储层——把历史存起来，需要时检索。但作者揭示的真正复杂度在于：存储只回答"东西放哪儿"，而 Memory 要回答的是什么值得写入、以什么身份写入、在什么范围内有效、什么时候降低权重、和旧记忆冲突时听谁的、被污染后怎么回滚。这些问题都落在治理层面。

### 写入的本质：未来影响力的预算分配
作者提出了一个深刻的隐喻：**写入是给某些历史分配未来影响力**。这个视角把 Memory 从被动存储提升为主动治理。
每一次写入都在消耗"未来影响力预算"——包括检索成本、上下文成本、注意力成本、冲突管理成本。这意味着写入决策必须极其审慎：不是所有历史都值得分配未来影响力，尤其当这条历史的来源是未经验证的推断时。
写入链路最危险的错误是把假设写成事实。在多 Agent 系统里，这种错误会呈指数级放大：一个 Agent 的误判写入，被后续 Agent 当成已验证事实，几轮之后错误假设就演化成"团队共识"。

### 记忆类型的分层架构
文章提出了一个容易被忽视的分类维度——**不同类型记忆的更新机制完全不同**：

- 用户偏好：随用户声明而更新，需要带 scope 和时间戳
- 任务状态：随任务进展而更新，需要保留完成/未完成状态
- 环境事实：随项目演化而更新，需要和代码库保持同步
- Agent 自我推断：最不可靠，需要标记置信度和确认状态
把这四类混在同一个 memory 字段里，后续的冲突检测、衰减处理、过期管理都会变得极其复杂。

### 读取的逆向思考
传统 RAG 的 retrieve(query) 模式在 Agent Memory 场景下存在根本缺陷：**影响当前任务的历史，未必和用户当前问题语义相似**。
一个更符合实际的读取模型是：先从任务上下文出发，找出当前任务受什么约束，再去找对应的记忆。作者引用了 OpenAI 的 progressive disclosure 和 Anthropic 的文件式 memory store，都是在降低检索复杂度，让 Memory 回到工程师熟悉的工作区模式。

### 安全是 Memory 特有的攻击面
提示注入攻击如果只污染当前会话，危害有限。但 Memory 可写的情况下，注入内容会跨会话留存，变成持久化攻击面。这意味着 Memory 系统必须把输入源的可信度纳入考量——处理不可信输入（网页、邮件、第三方文档）时，默认不应该允许直接写入长期记忆。

## 实践启示
### 从最小可行设计开始
构建 Memory 系统时，不要一开始就追求完整的记忆体系。最小可用设计应该包含：
1. **可版本化的规则文件**（AGENTS.md、CLAUDE.md）—— 项目长期规则
2. **结构化任务状态文件**（GOAL.md、PROGRESS.md、DECISIONS.md）—— 当前任务上下文
3. **带类型和作用域的 memory store** —— 跨任务经验
4. **事件日志** —— 失败记录和复盘依据
每新增一层，都应该因为真实的痛点驱动，而不是预见的复杂性。

### 信息分类决策框架
对于 Coding Agent，信息放哪里有一个实用的决策表：

- **当前任务下一步** → 上下文窗口或 PROGRESS.md
- **项目长期规则** → AGENTS.md / CLAUDE.md
- **已确认架构决策** → DECISIONS.md 或 ADR
- **用户长期偏好** → memory store，带类型和版本
- **某次失败的完整日志** → event log 或 artifact
- **未验证猜测** → progress observation，必须标记未确认
- **安全和权限规则** → policy 系统，memory 只允许引用

### Memory 元信息的最小集
每条记忆至少要携带：内容、类型（事件/声明/推断/外部约束/未完成承诺）、来源（用户/工具/代码/文档/Agent推断）、作用域（项目/用户/团队/任务）、置信度、时间、状态（有效/待确认/过期/撤销）。
没有这些元信息，Memory 的管理（冲突、衰减、遗忘、审计）都无从谈起。

### 共享 Memory 的读写策略
多 Agent 场景下，共享 memory 应该默认只读。写入应该遵循：

- 用户级 memory：用户可写，Agent 只能追加带来源标记的记录
- 项目级 memory：需要 review 机制，Agent 写入后待确认
- 团队级 memory：必须人工 review，Agent 不能直接写入
关键原则：涉及权限、安全、预算的内容只能引用 policy，永远不能让 memory 自己生成 policy。

### 评估维度不能只看 Recall
Memory 系统的评估应该包含多个维度：

- **能不能记住**：传统的 recall 指标
- **能不能更新**：收到新信息后能否修正旧记忆
- **能不能拒答**：不确定时能否选择不读取某条记忆
- **能不能遗忘**：能否主动降低过期记忆的权重
- **能不能处理偏好漂移**：能否识别同一偏好在不同上下文下的差异
作者引用 MemoryAgentBench 和 LongMemEval 说明 selective forgetting 已经成为评估框架的一部分。

### 从工具选型回到信息生命周期
路线之争（Letta/Mem0/Zep/Clawdbot/Self-managed）不应该从工具特性出发，而应该从你的 Agent 到底要记什么、信息的生命周期是什么来考虑：

- 只需项目规则 → 文件系统 + git
- 只需用户偏好 → 结构化 key-value + 版本
- 需长期客户关系 → 时间知识图谱
- 需 Coding Agent 长任务现场 → 工作区文件 + 轻量 memory store

### 朴素设计优先
在 Memory 系统早期，"像人一样记忆"的追求往往是过早优化。更有价值的起点是"像工程系统一样能查账"：可追溯、可审计、可回滚。
Plain markdown、git history、versioned memory store 这类朴素设计不一定最性感，但工程上好解释、好审计、好回滚。等真正碰到这些方案解决不了的痛点，再考虑引入更复杂的记忆系统。
**参考来源**

- Memory for Autonomous LLM Agents: Mechanisms, Evaluation, and Emerging Frontiers：https://arxiv.org/abs/2603.07670
- What Happens Inside Agent Memory? Circuit Analysis from Emergence to Diagnosis：https://arxiv.org/abs/2605.03354
- LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory：https://arxiv.org/abs/2410.10813
- Evaluating Memory in LLM Agents via Incremental Multi-Turn Interactions：https://arxiv.org/abs/2507.05257
- OpenAI Agents SDK: Agent memory
- Anthropic Managed Agents: Using agent memory
- Claude Code: How Claude remembers your project
- Letta: Introduction to Stateful Agents
- Letta: Archival memory
- Mem0: Introducing Memory Decay
- Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory
- Zep: Understanding the Graph
- Zep: A Temporal Knowledge Graph Architecture for Agent Memory
- LoCoMo
- Chappy Asel: Agent Memory, Nine Frameworks, Four Bets
## 相关实体
- [Claude Code 7 Layer Memory Architecture](../ch01-857-claude-code-7-layer-memory-architecture)
- [Agent Memory Architecture Ruofei](../ch04-111-agent-memory-架构解析)
- [Memory Agent Systems Cobanov](../ch04-458-memory-agent-systems-cobanov)
- [Factory Mission Multi Agent Architecture](../ch01-864-factory-mission-multi-agent-architecture)
- [Context Engineering Three Memory Paradigms](https://github.com/QianJinGuo/wiki/blob/main/entities/context-engineering-three-memory-paradigms.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-engineering-guide.md)

---

