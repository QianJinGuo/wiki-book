# 长周期-agent-详解-从-ralph-loop-到可接管-harness

## Ch04.307 长周期-agent-详解-从-ralph-loop-到可接管-harness

> 📊 Level ⭐⭐ | 8.4KB | `entities/长周期-agent-详解-从-ralph-loop-到可接管-harness.md`

# 长周期-agent-详解-从-ralph-loop-到可接管-harness

长周期 Agent 详解：从 Ralph Loop 到可接管 Harness
这两周 Codex /goal 在群里被翻来覆去聊了好几轮。
它的思路很直白：给 Agent 一个一直挂在那儿的目标，别每隔几分钟就停下来问一句"要不要继续"。
但凡跑过稍微长一点的 AI 编程任务，大概都能体会那种烦：活儿没干完，Agent 先停了；人回来补一句"继续"，它又得从头热身一遍。
周末我把 Jarrod Watts 那条长帖、他开源的 long-running-agent-skill、OpenAI /goal 的官方文档，以及 Anthropic 最近两篇 long-running agent 和 context engineering 的文章串着翻了一遍。读完之后，脑子里最先冒出来的不是某个新功能，而是我们近期一直在聊的那条线：Harness、上下文工作集、上下文操作，再到 Martin Fowler 那篇反复讲的"非确定性怎么进研发链路"。

## 相关实体
- [Agent Harness 12 Components 7 Decisions](ch03/045-agent.md)
- [Long Running Agent Ralph Loop Handover Harness Ruofei](ch03/045-agent.md)
- [Agent Harness Architecture Deep Dive Aksahy](ch03/045-agent.md)
- [Code As Agent Harness Survey](ch09/046-code-as-agent-harness.md)
- [Cong 30 Fen Zhong Shou Gu Agent Dao Harness Cheng Wei Xin Hou Duan](ch03/045-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/长周期-agent-详解-从-ralph-loop-到可接管-harness.md)

## 深度分析

Codex /goal 解决的是"持续性"问题，而非"正确性"问题——这是理解长周期 Agent 的第一个关键分界点。/goal 让目标以 durable objective 的形式跨多个上下文窗口持续存在，OpenAI 官方文档将其定位为"给 Codex 一个可验证的停止条件"而非"给 Codex 增加工程判断力"。这意味着 /goal 本质上是一块控制面（control plane），让"围绕一个目标持续推进"这件事可管理。但模型在该目标下的推理质量、方向正确性，并不会因为有了 /goal 就自动提升。跑 8 小时不难，难的是 8 小时之后交出的东西还是你想要的——这是两个正交的问题 ^。

"模糊性复利"（Ambiguity Compounds）是长周期 Agent 最隐蔽的风险。当一个模糊需求进入长周期执行时，Agent 并不会意识到自己在"填补空白"——它会按概率、上下文和已有代码，推断一个"看起来合理"的答案。第一轮偏一点，第二轮基于这个偏差继续推理，第三轮干脆把前两轮的输出当成既成事实。跑得越久，系统越自洽，但这套自洽的方向未必是原始目标指向的方向。Ralph Loop 的朴素思路（多循环几轮）无法解决这个问题，因为循环只会让偏差累积更深。真正有效的做法是在循环外部设置锚点：前置 Spec 明确剪掉关键分叉，让 Agent 在执行时不需要自己填补隐含决策 ^。

"工程继续"与"聊天继续"是两种根本不同的执行哲学。聊天继续靠上下文，每次对话都是对之前上下文的延续，信息的压缩、截断、摘要会让关键细节丢失；工程继续靠证据，GOAL.md、PROGRESS.md、DECISION LOG、git history 这类文件是留给"下一任"的接管凭证，记录的是事实而非推断。Anthropic 那篇 long-running agents 的工程实践也印证了这一点：靠 compaction 撑不住长任务，必须引入 initializer、progress file、feature list 和端到端验证，把任务从"聊天继续"改成"工程继续"。两种模式在短任务上差异不大，在长任务上则是成败的分水岭 ^。

Subagent 的第一层价值不是角色扮演，而是上下文隔离。Agent 在连续工作中会积累自我确认——它读过哪些文件、放弃过哪些方案，这些都会影响后续推理，容易把局部测试通过当成全局完成、把"我已经修复"当成既成事实。Reviewer Agent 的价值在于它拥有一个 fresh 上下文，可以从目标、diff、标准、测试结果出发问朴素问题，而不是继承实现者的心理负担。Boris Cherny 的观察很有启发：一个 Agent 引入的 bug，常常要靠另一个 Agent 来挑出来。多 Agent 系统的 token 成本是普通 chat 的约 15 倍，它不是默认架构，而是一种偏贵的质量治理手段——只有在任务能拆、收益够高、验证链路清楚的时候才划算 ^。

可接管性（Hand-offability）是长周期 Agent 的生产级标准。生产级的标准不是"能连续跑多久"，而是"跑了很久之后，留下的现场还能不能被下一个 Agent 或人类接住"。可接管的判断标准是：下一个执行者能否回答——当前目标是什么？已经成事实的有哪些？哪些只是猜测？哪些决策不能随便动？哪些测试能证明当前状态是对的？真要回滚的话最近的安全点在哪里？这些问题的答案不在聊天记录里，而在一组结构化的外部状态文件中。模型走进研发流程之后，系统不能依赖某一个人当下的临时上下文；与其指望模型一直记得所有事，不如让它每次醒来都能重新读到事实 ^。

## 实践启示

1. **用前置 interview/Spec 剪掉关键决策分叉**：在给 Agent 布置长任务之前，先让它反问边界、目标、取舍、验收标准。一个模糊的"帮我把这个系统做完"会让 Agent 在执行中不断填补隐含决策，每填补一次就多一分漂移风险。前置 Spec 的目标不是"多写一份文档"，而是把关键分叉提前剪掉 ^。

2. **外部状态文件必须分层，避免假设被写成事实**：把状态文件分成四类——事实（改了哪些文件、哪些测试通过）、观察（某次尝试看到什么现象）、假设（怀疑但未验证的原因）、决策（已定下的取舍）。最危险的是把"假设"悄悄写成"事实"，让后面的 Agent 一代代继承错误的判断作为前提 ^。

3. **用 Subagent 做质量审查，而不是让它扮演角色**：当任务跨多个模块、探索路径很多、review 成本很高时，引入 Reviewer subagent 从 fresh 上下文独立审查。不要让一个 Agent 既当工人又当工头——实现者和审查者的心理负担不同，审查者不被实现者的上下文污染才能有效挑出 bug ^。

4. **三层证据链缺一不可**：目标层（Goal/Non-goal/Acceptance Criteria）回答"做什么"，状态层（Progress/Git History/Milestone）回答"做到哪"，治理层（Tests/Review/Lint）回答"对不对"。只有目标没有状态，后续 Agent 不知道前面走到哪；只有状态没有验证，系统会把"做过"当成"做对"；只有验证没有目标，测试通过也未必是用户想要的 ^。

5. **用"能否被接管"来评估长周期 Agent 的生产就绪度**：在团队内部做 Code Review 时顺带问一句"这个任务中途换人，你能在几分钟内判断出当前状态"——如果答案是否定的，说明 Agent 的现场也不够清楚。可接管性是 Harness 真正要解决的核心问题：让模型的非确定性能力进入一个相对确定的工程过程 ^。

---

