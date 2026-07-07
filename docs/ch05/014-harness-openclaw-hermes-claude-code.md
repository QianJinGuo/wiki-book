# Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧

## Ch05.014 Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧

> 📊 Level ⭐⭐ | 22.6KB | `entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1aNu.md`

# Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧
> Source: https://mp.weixin.qq.com/s/p1aNuDIXXnZPLvU2D6MwXQ
> Author: 叶小钗 (AI训练营)
> Date: 2026-05-07
> Collected: 2026-05-07

## 内容
Harness 最近有些小火，但这东西跟 OpenClaw 和 Hermes 不一样，到现在都只有个框架性描述：为 Agent 的稳定执行而生。要了解 Harness 不仅要看大概念，最好借助现在实际运行的很好的 Agent 框架，比如 Claude Code、OpenClaw、Hermes。
Martin Fowler 在 2026 年 4 月写的文章里，把 Harness Engineering 直接定义成一套围绕 coding agent 的信任建设模型，核心是通过上下文、约束、反馈回路和工程结构，让人逐步敢把任务交给 Agent。
Anthropic 自己也在官方工程文章里直接把 Claude Code 叫作一种优秀的 harness，并且进一步讨论了 long-running agents 和 long-running application development 里的 harness design。

## 模型与工程
过去两年大模型公司主要围绕 Agent 生态：语义理解、视觉生成、长上下文、工具调用、多模态、电脑操作、浏览器操作。
业界有一个重要假设：只要模型不断更强，应用自然就会自己长出来。但实际情况是长上下文和 tool calling 稳定性上来以后，Agent 这条线确实一下子变得好做了很多。但问题是：**模型强，不等于工程就稳。**
总有很多跳出的边界：

- 模型无论如何依旧会工具调用不准、不稳
- 模型能理解复杂输入，但在持续推进一个长任务时候依旧吃力
- 模型能写出代码，不代表它知道自己到底写对了没有
而工程架构的意义在于，让 Agent 稳定地把事情做完。2025 年到 2026 年，Agent 讨论的重心开始明显变化：

- 以前大家讨论 Prompt 怎么写
- 后来讨论 Context 怎么喂
- 现在真正开始讨论：Agent 运行起来以后，还缺什么系统能力

## 什么是 Harness
Harness 是把模型能力变成持续、稳定、可验证产品能力的那套系统集合。
**Prompt → Context → Harness** 的演进：
1. **Prompt Engineering**：把行业 know-how 翻译成自然语言指令。few-shot、role prompt、CoT、输出格式约束、提示词模板。
2. **Context Engineering**：哪些私有知识带进来、哪些历史聊天保留、如何压缩超长上下文、如何做检索、如何让模型不失忆。核心是数据工程。
3. **Harness Engineering**：Agent 开始不满足于问答，开始调工具、跑代码、拆任务、看页面、写文档、多轮循环、长时执行、子 Agent 委派、中断恢复、测试与验收。

## 三个框架对比
### 1. OpenClaw：先把 Agent 管住
OpenClaw 的官方文档和仓库公开能力，明显偏受控运行时。把 Skills、Gateway、安全边界、Sub-agents、Sandbox 都拆得很清楚。

- 使用 AgentSkills-compatible 的 skill folder，每个技能目录里有 SKILL.md，加载时按环境、配置和依赖做过滤
- 假设 personal assistant security model，信任边界内的个人助理部署
- **系统工程目标**：先把权限、边界、角色、技能、执行环境组织起来，再让 Agent 干活
- **工程方向**：怎么让 Agent 安全、稳定、受控地执行任务？

### 2. Hermes：先让 Agent 长本事
Hermes把自己定义为 "the self-improving AI agent"，核心能力写成学习闭环：

- creates skills from experience
- improves them during use
- nudges itself to persist knowledge
- searches its own past conversations
- builds a deepening model of who you are across sessions
官方文档明确提供 8 种 external memory provider，built-in MEMORY.md / USER.md 始终存在，同时只能启用一个外部 provider。

- **系统工程目标**：先让 Agent 学会从经验中成长，再慢慢补边界和治理
- **工程方向**：怎么让 Agent 越用越强、越用越像一个长期助手？

### 3. Claude Code
Anthropic 官方已经把与 Claude Code 同源的能力开放成 Claude Agent SDK，明确说这套 SDK 提供的正是 Claude Code 背后的 tools、agent loop 和 context management。
连续写了几篇工程文章，专门讲：长时 agent 的 harness 怎么设计、application development 场景下 harness 怎么优化、Claude Code 为什么本身就是一个优秀 harness。
Claude Code 的价值不只是模型强，而是：它已经把模型之外那一整套工程壳子做到相当重要了。

## Harness 七层模型
### 第一层：角色与规则
一个模型接到任务后，第一件事不是调工具，而是先明确：它是谁、负责规划/执行还是验收、边界在哪、碰到不确定情况怎么办。

- **OpenClaw**：Skill 是人写的，规则是人定的，边界是系统设的，Agent 更多是在框架内执行
- **Hermes**：更愿意把一部分能力判断交给 Agent 自己，比如什么时候生成新 Skill，什么时候更新旧 Skill
- **Claude Code**：把角色和节奏预埋进系统，agent loop、context management、长时任务 initializer / coding agent 分工

### 第二层：记忆系统
任务变长后产生大量中间结果：拆出来的子任务、讨论过的方案、当前做到哪一步、用户偏好、历史错误、成功经验。

- **OpenClaw**：对记忆态度很克制，更接近可替换能力位
- **Hermes**：完整体系：内置 MEMORY.md、USER.md，叠加 external memory provider，再叠加 session search
- **Claude Code**：强调长时任务里，清晰 artifact 和 handoff 特别重要，让下一次 session 能接着做
记忆系统的本质：任务过程能不能留下痕迹，系统下次还能不能接上做展开。

### 第三层：上下文加载机制
真实 Agent 场景里模型前面能看的东西越来越多：角色与规则、历史对话、记忆、技能、工具结果、当前任务……问题就来了：**不是信息不够，而是信息太多。**

- **OpenClaw** 的 Skills 加载逻辑本质是一种上下文过滤：按环境、配置和依赖去筛
- **Hermes**：session search 不是把历史原文一股脑塞回来，而是先检索，再经过处理；支持 context engine plugin
**核心问题**：如何在每一轮只给模型当前最需要的那部分？做不好这层，系统会两头出问题：看得太少像失忆，看得太多开始变蠢。

### 第四层：稳定执行
工具怎么接、命令怎么跑、文件怎么读写、页面怎么查看、代码怎么执行、结果怎么回收……这些 Tools 动作全部依赖工程关注，因为它们依赖于第三方，必定经常出问题。

- **OpenClaw**：典型安全优先的运行时
- **Hermes**：更像执行后端可切换，可以跑在本地、VPS、GPU 集群和接近零空闲成本的 serverless 环境
**本层目标**：把语言判断稳定地变成真实动作。没有这一层、这一层做不好，就会经常出错。

### 第五层：有效循环
Agent 会因为要处理复杂的问题，不可避免进入循环：理解任务→决定下一步→执行→读结果→判断下一步，一直循环到收口。

- **OpenClaw**：多 Agent、skills、runtime 围绕循环推进做
- **Hermes**：把 delegate、skills、memory、search、provider hooks 都嵌在这个循环里
**核心问题**：会不会空耗 token 和时间，却没有实质推进？系统工程里担心的不是循环，而是钱花了，事情没干。

### 第六层：评分与可观测性
模型最大的问题之一，不是不会做，而是经常觉得自己已经做完了。系统不能只听模型自己汇报"我完成了"，而是要能通过测试、日志、页面验收、运行指标、人工审查、Benchmark 等方式，真实地看到它做了什么、做到什么程度、结果到底好不好。

- **OpenClaw**：制度化，靠规则、沙箱、受控执行去约束结果
- **Hermes**：学习闭环，把执行结果、错误路径、成功经验逐步沉淀成 Skill 或 Memory
**本层目标**：不要让模型稀里糊涂自己给自己打高分。

### 第七层：中断恢复
模型在循环往复的时候，整体 SOP 会不会后退、如何后退就很关键了。真实世界任务会中断、会超时、会切 session、会失败重试。

- **Hermes**：通过 MEMORY、USER、session search、external provider 把接续做成系统能力
- **OpenClaw**：更偏流程与痕迹受控
**本层目标**：如何把断掉的任务重新接起来？

## OpenClaw 中的 Harness 具体实现
### MCP/工具链
Tools 解决能做什么；Skills 解决这些事具体该怎么做。
Tools 出点问题，整个流程就断了，而且这是依赖于第三方的，本来就容易出问题：

- API 变动
- 权限变动
- 插件失效、插件参数变化
OpenClaw 把 Tools、Plugins、Gateway、外部能力接入都放进一个有边界感的系统里，让模型能不能在一个被约束的能力平面里稳定地调工具。

### Skills
Skills 是方法稳定器，让模型不要过于发散；Skill 的 Workflow 提示词会进一步带来稳定性，可以把高频任务的方法沉淀下来。
但 OpenClaw 这种平台型 Agent 中 Skills 问题也同样明显：

- Skill 可能来自第三方
- Skill 本质上会进入 prompt 构造链路，模型本来就脆弱，很容易被恶意或低质量提示词污染
- 一旦 skill 机制失控，Agent 的方法层就会整体失真
OpenClaw 的兜底策略：把 Skills 放进受控加载链里，比如 plugin skills 只是低优先级路径，同名 skill 会被 bundled / managed / agent / workspace skill 覆盖；workspace 和 extra-dir 的 skill discovery 只接受解析后 realpath 仍留在配置根目录内的 skill root 和 SKILL.md，避免路径穿越和任意逃逸。

### Runtime
OpenClaw 在执行复杂任务时会进入循环：理解问题→决定下一步→调工具、读文件、跑代码→看返回结果→判断接下来该做什么→循环到任务真正收口。
真实情况都是 BUG 频出：模型可能跑着跑着提前收尾，明明事情还没做完就告诉你已经处理好了；可能做了一半又绕回原地，重复调用同一个工具。
Runtime 承担：把 Agent 的行为从一堆零散动作组织成一条真正能推进任务的流程。包括整个项目的可观测性和中断重试的逻辑。

## 结语
Harness 不是模块，而是一条咬硬骨头走出来的方法论。
Agent 从会答、到会做、到能稳定做完，整条链上缺的所有工程能力，这就是 Harness：

- 一开始只是接工具
- 然后发现工具不稳，要加规则
- 再发现规则不够，要加 Skills
- 再发现 Skills 还不够，要加 Runtime 和 Workflow
- 再发现任务会假完成，就要补评分与可观测性
- 再发现任务会中断，就得补恢复能力
Harness 以后未必还叫 Harness，但这条路，肯定不会消失。

## 深度分析
**Harness 的本质是 Agent 工程化的成熟度标志。** 这篇文章最有价值的地方，不是提出了一个响亮的名词，而是通过 OpenClaw、Hermes、Claude Code 三个真实框架的对比，揭示了"让 AI 完成任务"这件事背后的完整工程图谱。

### 三种路线代表了三种工程哲学
三个框架实际上代表了三 种截然不同的 Agent 工程思路：
**OpenClaw = 约束优先。** 先把边界画清楚，权限、技能、执行环境全部受控，Agent 在既定的笼子里运作。优点是稳定、可预测、可审计；代价是灵活性受限，技能扩展依赖人工维护。OpenClaw 的 Skills 受控加载链设计（bundled → managed → agent → workspace skill 的覆盖优先级）非常典型地体现了这种思路——宁可牺牲便利性，也要保证安全边界不被突破。
**Hermes = 成长优先。** 先让 Agent 有自我改进的能力，记忆体系、学习闭环、经验沉淀全部做成原生能力。优点是 Agent 越用越强，能形成真正的长期助手关系；代价是边界和治理是后补的，在安全要求高的场景里需要额外加固。Hermes 把 Skill 的生成和更新权交给 Agent 自己，是一把双刃剑。
**Claude Code = 工程壳优先。** Anthropic 实际上把 Claude Code 的价值定位在"模型之外那一整套工程壳子"，这个判断非常关键。它意味着在 Claude Code 的设计里，工程结构不是辅助，而是本体。Agent loop、context management、工具调用、长时任务分解，这套东西本身就是产品。

### 七层模型的分层逻辑
这篇文章提出的七层模型值得仔细拆解：
**前三层（角色规则、记忆、上下文加载）是"输入质量"问题。** 它们共同回答：Agent 在做决策之前，应该看到什么、知道什么、处于什么角色。没有这些，Agent 的输出质量就无法控制。
**中间两层（稳定执行、有效循环）是"过程质量"问题。** 它们共同回答：Agent 的决策如何稳定地变成真实世界的动作，以及如何在多轮循环中不空耗资源。这是工程投入最大的地方，也是最容易出问题的环节。
**后两层（评分可观测性、中断恢复）是"输出质量"问题。** 它们共同回答：如何验证 Agent 真的做对了，以及任务中断后如何接续。没有这两层，Agent 的规模化使用就是赌博。

### 一个核心矛盾
整篇文章其实隐含了一个核心矛盾：**框架的成熟度与灵活性之间的张力。**
OpenClaw 的约束设计最完善，但扩展性最差；Hermes 的扩展性最好，但治理最弱；Claude Code 目前看起来最平衡，但它本质上是闭源的，它的工程实现对外部是不可见的。
这意味着，对于想要基于这些框架做二次开发或建立自己 Agent 能力的团队来说：OpenClaw 的约束哲学最值得借鉴但需要自己补成长能力；Hermes 的记忆体系和学习闭环思路最有启发但需要自己加安全约束；Claude Code 的整体设计是最优实践但没有开源实现可参考。

### 真正的问题
文章的结语说"Harness 以后未必还叫 Harness，但这条路，肯定不会消失"，这是整篇文章最准确的一句话。Harness 不是一个产品功能，它是一个工程学科。它的目标是解决"模型能力到产品能力"之间的最后一公里问题。这个问题不会消失，只会被越来越深入地解决。

## 相关链接
- [17 Agent Architectures Evolution](../ch04/598-17-agent.md)
- [Hermes Agent Closed Learning Loop](../ch03/090-hermes-agent.md)
- [读完 Claude Code 和 Openclaw 的 Memory 源码我对Agent记忆需要向量数据库这件事产生了怀疑](../ch03/075-claude-code.md)

## 实践启示
### 对 Agent 开发者的行动指南
**1. 先画清楚 Harness 七层，再动手写 Agent 代码。** 大多数 Agent 开发失败的原因，不是因为模型不够强，而是因为没有想清楚这七层各自需要承担什么责任。建议在任何 Agent 项目的技术方案里，明确回答：角色与规则层用什么机制？记忆系统用什么存储和检索方案？上下文加载的过滤策略是什么？工具执行的稳定性怎么保障？循环推进的退出条件是什么？如何验证 Agent 的输出质量？中断恢复的检查点设在哪里？
**2. 参考 OpenClaw 的受控加载思想设计 Skills 机制。** OpenClaw 的 Skills 加载链覆盖优先级（bundled → managed → agent → workspace）是处理第三方 Skill 风险的优秀范例。在实际项目中，如果是团队多人贡献 Skill，或者需要引入外部 Skill，这个优先级覆盖机制值得直接借鉴。它的核心价值不是禁止，而是按优先级自动覆盖，保证关键路径的 Skill 不被意外污染。
**3. 参考 Hermes 的记忆体系设计长期 Agent。** 如果你的 Agent 需要跨 session 工作，Hermes 的 MEMORY.md / USER.md + external provider + session search 的三层记忆设计是最完整的参考实现。关键点是：记忆不是一股脑塞回去，而是先检索再处理，每一轮给模型的上下文都是经过过滤的最优子集。
**4. 把 Claude Code 的 agent loop 模式作为验收标准。** Anthropic 官方明确说 Claude Code 是一个优秀的 harness，这意味着 Claude Code 的工程实现代表了一种行业验收标准。无论你用哪个框架，你的 agent loop 至少应该在功能完备性上对齐 Claude Code 的能力范围：任务分解、工具调用、循环退出、上下文管理、handoff 交接。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-engineering-7-layers-openclaw-hermes-claude-code-p1aNu.md)

### 避坑指南
**不要跳过前三层直接做工具调用。** 很多团队一上来就让模型调工具、调 API，结果发现稳定性完全无法保证。原因是前三层（角色、记忆、上下文）没有做好，模型在错误的信息基础上做决策，工具调用自然不可控。
**不要忽视评分与可观测性。** 很多 Agent 项目做到一定程度就发现无法推进了，核心问题是不知道 Agent 到底做对了没有。模型自己会说自己完成了，但实际上可能只做了 30%。必须从一开始就设计外部验证机制（测试、日志、指标），而不是等到上线后才想起来补。
**不要把 Harness 当成一次性架构。** 文章里那张"工具不稳→加规则→规则不够→加 Skills→加 Runtime→补可观测性→补恢复"的扩展路线图，是真实项目演进的规律，不是理论推演。如果你的 Agent 项目声称一次设计就把所有层都搞定了，它大概率是在过度设计或者还没遇到真实场景的压力。

---

