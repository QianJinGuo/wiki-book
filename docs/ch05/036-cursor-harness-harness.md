# Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限

## Ch05.036 Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限

> 📊 Level ⭐⭐ | 15.4KB | `entities/cursor-复盘-harness模型决定能力上限harness-决定生产下限.md`

> 来源：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cursor-复盘-harness模型决定能力上限harness-决定生产下限.md)

## 核心要点
- **问题核心**：同一个模型放进不同 Coding Agent，体感差异巨大——核心在于 Harness 而非模型本身
- **核心洞察**：模型决定能力上限，Harness 决定生产下限；Harness 是模型和真实交付之间那套运行系统
- **Cursor 经验**：把 Harness 当成持续运行、持续实验、持续修正的软件产品，而非一次设计完就稳定的架构层
- **关键指标三角**：更快、更聪明、更省 token——这三件事天然在打架，Harness 工作就是找平衡
- **评估体系**：CursorBench 离线评测 + 线上 A/B + Keep Rate + 后续反应语义，四层验证真实质量
- **模型适配**：每个模型都需要深度定制 Harness，发布单元是「模型 + Harness」组合
- **多 Agent 方向**：重点不在角色数量，而在 Harness 能不能调度谁、怎么描述任务、怎么合并结果

## 深度分析
### Harness 作为持续运营的软件产品
Cursor 复盘最核心的洞察是把 **Harness 不当成「设计完就稳定存在」的架构层，而是当成持续运行、持续实验、持续修正的软件产品**。 每次调整都该有假设、有实验、有指标、有观测、有回滚。这个表述听着不新鲜，但放在 Agent 语境里其实挺扎眼——很多团队改 Prompt、加工具、换模型，确实还没有走到这套流程。
这带来一个根本性的视角转变：**Agent 质量不能只看模型分数，更准确的发布单元是「模型 + Harness」的组合**。 当这些组件都开始承重，团队怎么持续运营它，才是真正的工程挑战。

### 上下文管理范式转移：从静态塞入到动态拉取
Cursor 回顾了一个很有代表性的变化。 2024 年末他们刚做编程 Agent 时，模型自己选择上下文的能力还弱，Harness 要做很多兜底：每次编辑后把 lint 和类型错误回灌给 Agent；如果它请求的读取行数太少，就替它改写读取请求；限制单轮工具调用次数；会话开始就塞进目录结构、语义匹配代码片段、用户附件的压缩版本。
到现在，Cursor 保留的静态上下文已经少很多，主要是操作系统、git 状态、当前和最近查看的文件这类低成本、高价值的信息。更多能力转去做动态上下文，让 Agent 在工作过程中按需拉取。
这个转变的深层含义是：**上下文不是越多越好，而是越会取越好**。 很多团队做 Agent 的第一直觉是把资料全塞进去，实际上更容易让模型抓不住重点。Chroma 的 Context Rot 研究和 Liu 等人的《Lost in the Middle》都提示过：长窗口不等于均匀可用，干扰信息和位置效应都会让模型表现明显下降。
更接近事实的类比是一个优秀助理的办公桌：当前任务需要的放在手边，暂时用不到的留在抽屉里，需要时再取。

### 模型变强后的「护栏拆除」问题
这里埋着一个更深的变化：**模型变强以后，Harness 不只要会加护栏，也要会拆护栏**。 Anthropic 在《Harnessing Claude's intelligence》里讲过类似意思：很多 Harness 组件其实都编码了一句隐含假设——这件事 Claude 现在还做不好，所以系统要替它做。
但模型能力会变。当模型已经能自己管某类上下文、自己决定要保留的记忆、自己判断什么时候开一个 fresh subagent，旧 Harness 逻辑就可能从护栏变成负担。
这是很多团队没及时做的事：当年为解决真实问题加进去的 Prompt、规则、工具包装、流程限制，一年后可能只是历史补丁，继续留着不一定更安全，反而压住了新模型本来更顺手的做法。
建议增加一个固定动作：**每次主力模型升级后，做一次 dead weight 清理**——哪些规则是为老模型补短板的？哪些工具包装可以退回成通用工具？哪些静态上下文可以改成动态拉取？

### 工具错误的上下文污染效应
Cursor 复盘里反复出现一个词：**context rot**。 工具调用失败的影响往往不止当下那一轮——失败信息会留在上下文里，消耗 token，也可能污染后续判断。一个错误参数、一次 grep 超时、一段错误日志、一条供应商异常返回，都可能在接下来几轮推理里继续发酵。
人类工程师看到错误通常能归类：这是环境问题，这是权限问题，这是命令写错，这是服务商挂了，这是我刚才走错路。模型不一定。如果 Harness 不把错误变成清晰的结构化信号，模型可能会基于错误前提继续往下走。
Cursor 在这一层的做法很像 SRE：**未知错误默认是 Harness 的 bug**，任何工具的未知错误率超过阈值就告警；预期内的错误按成因分类（InvalidArguments、UnexpectedEnvironment、ProviderError、UserAborted、Timeout），然后**不看一个总错误率，而是按每个工具、每个模型分别计算基线**。

### 工具数量和质量的负相关
初始设计有 30+ 工具，每个工具的描述都像通用 API 文档一样冗长。由于工具描述是 Agent prompt 的一部分，每个推理调用都要处理全部 30+ 工具的描述文本，拖累了速度和输出质量。
改进方案是 Aggressive Simplification——只包含决策所需的工具描述部分，截断冗余输出，让每个工具的定义简洁可操作。结果是系统响应性显著提升。
这个教训是：**工具数量和工具质量之间存在负相关**，特别是在 LLM 推理能力有限的情况下。一个设计良好的小工具集比一个臃肿的工具集更有价值。

## 实践启示
### 建立 Harness 持续运营闭环
如果今天参与一个团队的第一版 Agent Harness，更值得先补一套朴素的运行纪律而不是先写一份更长的系统 Prompt。
**能把这十件事跑起来，就已经比很多 demo 靠近生产一步：**
1. **先分任务类型，晚一点再分角色**：最先要识别的是任务类型（信息检索、代码修改、测试修复、日志排查等），而不是一上来就设计"规划师、执行者、审查者"这种角色
2. **每类任务都要看结果有没有留下**：代码有没有留在仓库里，文档有没有进入定稿，SQL 有没有复用，工单有没有关闭，客服回答有没有减少二次追问
3. **离线回归和线上反馈一起看**：离线评测负责快速回归，线上反馈负责校准真实体验；保留一批可回放任务，再用线上数据持续补充新的失败样本
4. **工具错误要分类，别只记一句失败**：最起码分出参数错误、权限错误、环境错误、依赖缺失、超时、外部服务错误、用户中止、未知错误
5. **把上下文预算摆到台面上**：每个 Agent、每类工具输出、每个子任务都要有上下文预算；窗口只承载当前推理，不负责保存全部历史
6. **模型适配要有版本**：每个主力模型都要有自己的 Prompt 版本、工具 schema 版本、上下文策略、错误基线、适合任务列表、禁用任务列表、缓存策略、切换策略
7. **中途切模型，按状态迁移处理**：复杂任务中途切模型本质是状态迁移；要么同一模型跑完整段任务，要么通过摘要和接班指令迁移，要么用 subagent 从 fresh context 开新任务
8. **Subagent 描述要像路由规则**：子代理的描述更接近调度信号，至少要说清三件事：负责什么问题、什么时候调用、不负责什么
9. **模型升级后，顺手清旧补丁**：检查那些曾经为老模型加的规则、压缩、重置、流程和工具包装；该留的留，该删的删
10. **失败要沉淀进 Harness**：每次 Agent 犯错，都应该反向沉淀成一条 Harness 设计

### 多模型支持的真实复杂度
Cursor 的经验把「模型抽象掉」这个幻想拆了一半：**Harness 抽象可以模型无关，但每个模型都需要深度定制**。
OpenAI 的模型训练时更习惯基于 patch 的方式编辑文件，Anthropic 的模型更习惯字符串替换。不同提供商、不同版本，都可能需要不同的 Prompt。这已经超出"Prompt 小技巧"的范畴，是发布纪律。
更稳的设计是**给每个模型一套可版本化的 Harness 配置**：工具形态、工具描述、Prompt 结构、上下文预算、错误基线、缓存策略、适合任务、不适合任务、中途切换规则、子 Agent 调度方式。做不到这一步，所谓"多模型支持"更多只是 API 聚合。

### Keep Rate 作为真实质量代理指标
Cursor 另外看了两个代理指标：

- **Keep Rate**：Agent 生成的一组代码改动，过一段固定时间后还有多少留在用户代码库里；被用户很快删掉、改掉、回滚，就是初始质量不够好的强信号
- **后续反应判读**：用模型读取用户对 Agent 初始输出的下一句话，从语义上判断用户是否满意；继续做下一个功能是任务完成，贴回一段 stack trace 通常说明没完成
这个思路值得迁移：

- 客服 Agent → 回答后用户是否继续追问同一问题、是否转人工、是否重复投诉
- 写作 Agent → 生成段落最终保留比例、标题是否被直接采用、改稿轮数有没有减少
- 数据分析 Agent → 生成 SQL 有没有被执行、图表有没有进入报告、用户有没有回到同一问题反复修正
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cursor-复盘-harness模型决定能力上限harness-决定生产下限.md)

## 相关实体
- [两万字详解Claude Code源码核心机制](../ch03/075-claude-code.html)
- [深度拆解 Hermes Agent 记忆系统：它修正了 OpenClaw 的哪层误区？](../ch03/090-hermes-agent.html)
- [Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](ch05/018-harness.html)
- [你不知道的 Agent：原理、架构与工程实践](../ch03/045-agent.html)
- [告别“氛围编程”：基于 Harness 治理和 SDD 的团队级 AI 研发范式演进与实践](ch05/018-harness.html)
- [看 AgentRun 如何玩转记忆存储，最佳实践来了！](../ch04/003-agentrun.html)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](../ch04/597-agentic.html)
- [别再把上下文当聊天记录](https://github.com/QianJinGuo/wiki/blob/main/entities/别再把上下文当聊天记录.md)
- [一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](ch05/068-harness-engineering.html)
- [Harness Engineering - 让 Coding Agent 可靠完成长程任务](ch05/068-harness-engineering.html)
- [龙虾装上了，可以用来干啥？分享下我的 OpenClaw 多智能体团队搭建经验！](../ch11/225-openclaw.html)
- [Harness Engineering：耗时一周，我是如何将应用的AI Coding率提升至90%的](ch05/068-harness-engineering.html)

- [Agent 开发范式演进：从环境工程出发，“简化”多源实时上下文](../ch03/045-agent.html)
- [Anthropic 联创：2028 年实现 AI 自我构建的概率超过 60%](../ch01/893-anthropic.html)
- [Agent架构关键变化：Harness正在成为新后端](ch05/018-harness.html)
- [我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了](https://github.com/QianJinGuo/wiki/blob/main/entities/我把-karpathy-的-autoresearch-搬到了软件开发领域效果炸了.md)
- [IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群](../ch03/075-claude-code.html)
- [吴恩达：AI 将最先杀死前端](ch05/084-ai.html)
- [精选 10 个开发者常用的 AI 智能体技能（Agent Skills）](../ch04/387-agent-skills.html)
- [天猫新品营销技术团队AI编码实战指南（上）](ch05/084-ai.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch05/062-agent-harness.html)
- [国产顶尖模型 benchmark 评分那么高，可实际效果为什么差？看完 Anthropic 这篇博客，刷分的因素太单一了](../ch01/893-anthropic.html)
- [你写的 Skill，及格了吗？](../ch04/266-skill.html)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程](../ch04/597-agentic.html)
- [2 小时，0 行手写代码，我用 Claude 做了一个生产级 VSCode 插件](../ch01/1085-claude.html)
- [Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南](../ch04/660-claude-managed-agents.html)

---

