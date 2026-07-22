# Martin Fowler AI 研发 Harness：非确定性承重层

## Ch05.021 Martin Fowler AI 研发 Harness：非确定性承重层

> 📊 Level ⭐⭐ | 18.2KB | `entities/martin-fowler-ai-rd-harness-nondeterminism.md`

## 核心洞察
Martin Fowler 在 Pragmatic Engineer 播客访谈中提出：AI 进入研发链路本质上是将非确定性协作者引入了一个过去几十年都建立在确定性机器上的工程体系。这使得 Harness 从"辅助工具"升级为真正的承重层（Load-Bearing Layer）。

## 关键论点
- **非确定性引入研发链路**：软件工程过去建立在确定性机器上，AI 协作者具有本质上的不确定性
- **Harness 成为承重层**：当不确定性进入链路，测试体系、验证机制、容错设计不再是辅助，而是结构性的支撑
- **AI 研发测试体系比 Agent 代码本身更难**：如何测试一个具有不确定性的 AI 系统，是比构建 AI 本身更难的工程问题
- **Fowler 职业生涯最大拐点**：与面向对象、敏捷、重构等历史拐点相比，AI 研发变化是 Fowler 认为最大的一次

## 深度分析
### 1. 从确定性机器到非确定性协作者的根本范式转移
Fowler 反复强调的核心区分不是"抽象层次高低"，而是**机器性质的根本改变**。过去软件工程建立在一台确定性机器上：相同的输入经过编译、测试、部署，输出是可复现的。LLM 的引入打破了这个前提——相同目标可能用不同路径完成，解释失败时可能给出合理但未经验证的答案，一次小改动可能牵连多处"看起来该优化"的地方。这种本质差异不是多加一层抽象能解决的，而是整个工程哲学的重构。
关键在于：**非确定性不是模型的缺陷，而是它的固有属性**。试图通过更好的 prompt 让模型变得更"确定"是治标不治本。真正的问题是：如何在工程系统中接纳和管理这种非确定性，而不是消灭它。

### 2. Vibe Coding 的边界：学习循环的断裂
Fowler 对 Vibe Coding 持克制态度：探索、原型、一次性脚本场景下它是好用的，但它的边界在于**学习循环的悄悄掐断**。软件工程中有一条隐蔽但关键的循环：写代码→读反馈→理解系统→修正设计；读别人的代码→知道边界在哪→知道哪个抽象不能乱动；亲手做重构→分清历史包袱和真实业务规则。当 AI 写完人不看、不理解、不 review，只在报错时加 prompt，这条循环就被断了。
Karpathy 从 Vibe Coding 转向 Agentic Engineering，背后塞进去的是方法、纪律和经验，而不只是"让 agent 替你写代码"。Vibe Coding 解决的是怎么把东西做出来；Agentic Engineering 关心的是，做出来之后，人和系统还能不能继续拥有它。"拥有"不是版权意义，而是工程意义：知道为什么这样设计、怎么验证、出事了怎么回滚，下次同类任务能少踩一次坑。

### 3. 小切片的工程逻辑已经改变
Fowler 指出 AI 生成代码越快，越要把变更切小。但这句话在 Agent 语境下的含义已经悄悄变了：**以前小步提交是为了让 human review 更轻、回滚更容易，现在还多承担了一件事——限制模型一次性发散的半径**。一个 Agent 一次改 20 个文件、顺手重命名几个概念、再把测试补一遍，review 时很难判断每步是否必要，分不清它到底是顺着真实约束在走，还是用看着合理的故事把变更串起来。
薄切片的具体做法：

- 先让它只理解一段逻辑
- 再让它只改一个边界
- 改完马上跑测试、类型检查、lint
- 能用 IDE 确定性重构工具做的，不要让模型凭文本猜
- 需要模型参与时，让模型生成意图或计划，执行交给更确定的工具
LLM 很擅长从模糊意图里拉出起点，但不应该替代所有确定性工具。跨文件重命名、抽取函数、移动类、格式化、依赖边界检查——这些 IDE、编译器、静态分析工具磨了二十年的东西，让模型重新发明一遍未必更聪明，反而更容易跑偏。Fowler 举过例子：让 LLM 跨文件改一个类名，可能烧掉一整月十分之一的 token 都没改完，而 ReSharper 一秒钟就搞定。

### 4. Harness 的本质：非确定性适配层
Fowler 把 Harness 定义为"把非确定性能力接入工程系统的那层适配层"。它不是某一个具体的框架，也不只是多写几条规则。
LangChain 的定义：Agent = Model + Harness。模型出智能，Harness 让智能真正能用上——文件系统、工具、沙箱、状态、子代理、钩子、验证、长任务控制，都在这层。
OpenAI 的 Harness Engineering 实践沉淀了几件朴素的事：

- 计划是第一等工程资产，复杂任务的执行计划和决策日志要进仓库
- 文档不能只活在 Slack、Google Docs 或人脑子里，Agent 看不见就等于不存在
- 架构规则要交给 linter 和 CI 机械执行，不能只写在 wiki 里
- 技术债要靠持续的小 PR 一直清，而不是攒成大坑等专项治理
- 人的品味和边界，要尽量编码到仓库里，让后面跑的 Agent 自动继承
Mitchell Hashimoto 的经验更具体：Engineer the Harness。Agent 犯错后，不光是这次手工修掉，而是把"怎么防止同类错误再发生"的机制补回系统里——可能是一条 AGENTS.md 规则，可能是一个截图脚本、过滤测试的脚本，也可能是一个更方便 Agent 自己验证结果的小工具。
Thoughtworks 给出的拆解更系统：**上下文工程、架构约束、代码库垃圾回收，外加 guides 和 sensors 这组控制视角**。翻译成更土的说法：

- guides 是事前引导：规则、文档、工具描述、架构边界、任务模板
- sensors 是事后感知：测试、lint、日志、指标、评估器、错误分类、用户反馈
- garbage collection 是持续清理：删掉旧补丁、订正文档、扔掉不再适合新模型的护栏

### 5. 最危险的不是模型犯错，而是系统相信它没犯错
AI 写错代码不新鲜，真正麻烦的是**它错得很像对**——它会解释、会道歉、会告诉你测试通过了、会给一段看上去逻辑挺顺的原因、会顺手把错误包装成"我已经修复"的状态。Fowler 举过那个哭笑不得的例子：让 LLM 在配置注释里写上当天的日期，它写成了上次的；指出来，它认真道歉，然后改成了昨天的。这种小事都能 gaslight 你，更别说复杂的代码改动。
在 Agent 系统里，**安全感不能来自模型的语气，只能来自外部反馈**：测试有没有过、类型对不对、依赖边界有没有被破掉、敏感操作有没有走审批、日志里有没有冒出异常、PR 合进去之后代码是不是很快又被用户删掉、线上指标有没有跟着抖。Cursor 的 Harness 工程复盘核心：不只看 benchmark，还看真实用户有没有保留 Agent 生成的代码、看用户下一句是不是继续报错、看工具的 unknown error rate 是不是按模型和工具切片在涨。
Simon Willison 2025 年提出的"lethal trifecta"：私有数据、不可信内容、对外通信能力三者同时出现时，prompt injection 就有机会变成数据外泄路径。Agent 越有用，越容易同时碰到数据、网页、邮件、Slack、数据库、API、文件系统。**能力越连通，边界越要机械化**。权限不应该是产品设置页里一个 checkbox，而是 Harness 的核心结构：模型可以提出动作，系统决定这个动作能不能执行，高风险动作必须走审批，私有数据和不可信输入之间要做隔离，对外通信要有可审计的出口，失败要留下结构化的痕迹。

### 6. 工程师进入了中间循环而非消失
Fowler 转述 Annie Vella 对 158 位工程师的研究，用了一个好用的词：**supervisory engineering work（监督式工程工作）**。过去习惯讲内循环（写代码、跑测试、调试）和外循环（提交、review、CI/CD、发布、观测），AI 接进来之后在中间又长出来一层：工程师要定义任务、组织上下文、监督 Agent 执行、评估输出、把这次的错纠正为下一次的规则，再把经验沉回系统。
Google 工程师把日常工作自动化掉一大半后剩下的是判断、拆解和验证；Karpathy 讲 Agentic Engineering 强调方法和纪律；Cursor 复盘 Harness 关心线上反馈和持续运营；Boris Cherny 的工作流把开发工具从 IDE 推向了 Agent 控制台。但不要把这件事理解成"程序员转岗去管 AI"——更准确的说法是**人的控制点换了位置**：过去控制的是光标，现在控制的是目标、边界、权限、验证和系统演进。
软件工程的责任并没有消失。写代码这件事本身变便宜以后，真正贵的东西被暴露出来：需求有没有说清楚、边界稳不稳、抽象能不能扛住未来的变化、测试有没有盖住关键风险、工具能不能给出可信反馈、架构规则是不是机器能执行的。非确定性一旦进入研发链路，架构、测试、可观测性、安全、治理这些老问题都被放大了一圈。工程师仍然在工程里，只是很多手工动作会被压缩掉，系统设计和反馈设计会被往前提一截。

## 实践启示
### 对于个人工程师
1. **刻意维护学习循环**：不要让 AI 替代了你和环境之间的反馈。不要只接受 AI 的输出而不验证、不理解、不重构。把"这次 AI 做了什么、为什么这样做、下次怎么验证"变成日常习惯。
2. **优先用确定性工具**：跨文件重命名、格式化、依赖边界检查等，让 IDE 和编译器来处理。模型负责理解意图、探索路径；确定性工具负责执行、校验和收口。能用程序算出来的就让程序算，能用工具完成的不要让模型猜。
3. **从小切片开始**：不要一上来就把"重构整个模块"丢给 Agent。从可独立验证的小任务下手：补一个测试、修一个边界明确的 bug、解释一段调用链。切片越小，review 越轻，回滚越简单，出错时越容易定位是哪一步出了问题。
4. **把知识放回仓库**：Agent 看不到人开过的会、聊过的天，读不到"当时为什么这么设计"的历史。重要的设计决策、约束、运行方式、目录边界、踩过的坑，尽量变成仓库里的文档、规则文件、ADR。这样人和 Agent 能在同一个地方拿到上下文。
5. **错误要分类**：不要只留一句 `tool failed`。至少分清：参数错误、环境错误、权限错误、超时、供应商错误、用户中止、测试失败、验证失败。错误分类清楚后，很多"模型又不行了"就会变成可以排查的具体问题。

### 对于团队
1. **让验证先跑起来**：没有测试就先补关键路径上的测试；没有类型约束就先补一层边界校验；没有 lint 就先把最能挡事故的几条规则配上；没有架构边界检查就先挡住最危险的依赖方向。Agent 自动化能走多远，往往就看反馈能多快回来。
2. **权限按风险分层**：读文件、写文件、跑测试、改依赖、连数据库、发外部请求、删除数据、合并 PR——这些动作不应该挂在同一档权限上。低风险动作可以自动放过，中风险动作要确认，高风险动作必须审批、记录、可回滚。这不是不信任模型，是正常的软件工程边界。
3. **把经验写回 Harness**：Agent 犯一次错手工修掉没问题，但更值钱的动作是再多走一步——这次为什么会出错，下次能不能让它更难发生。可以是补一条测试、加一条 lint、改一段任务模板、补一条文档索引、做工具参数校验、加一个审批规则。这就是 Harness 一点点变好的方式，不是在某一次设计完就万事大吉，而是每次失败后再往系统里多塞一点确定性。
4. **技术债要靠持续小 PR 清**：不要攒成大坑等专项治理。技术债是持续清理的过程，每一次小 PR 都是把债务往下降一点。
5. **架构规则交给 linter 和 CI 机械执行**：不要只写在 wiki 里。人的品味和边界，要尽量编码到仓库里，让后面跑的 Agent 自动继承。

### 对于组织
1. **把计划当第一等工程资产**：复杂任务的执行计划和决策日志要进仓库，而不只是活在人的脑子里或 Slack 对话里。
2. **文档是给 Agent 看的**：Agent 看不见的信息等于不存在。Slack、Google Docs 里的讨论、人的脑子里经验，如果 Agent 读不到，就等于不存在于这个系统里。
3. **从六件小事开始**：与其急着建"全自动 AI 团队"，不如先把六件小事补上——小切片、强验证、仓库内知识、权限边界、错误分类、持续清理。这是更现实的起点。

## 与现有知识库内容的关联
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — 三层演进（Prompt→Context→Harness），Fowler 的观点进一步印证 Harness 的核心地位
- [Harness Engineering 三次范式跃迁](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-paradigm-shift.md) — 非确定性引入是第四次跃迁的驱动力
- [腾讯 CDN LEGO Harness Engineering](ch05/018-harness.html) — 57 案例 13 类问题中，不确定性处理是核心挑战之一

## 原始存档
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/martin-fowler-ai-rd-harness-nondeterminism.md)

## 元数据
- **来源**: WeChat（架构师/JiaGouX）
- **原始发布**: 2026-05-07
- **评分**: review_value=10, review_confidence=9, score=90
- **SHA256**: 392b08df51d0e4f500ca5373551e353193637a1d8d78f98a87caa00dc0c5dbd9

## 相关实体
- [Martin Fowler AI 研发提醒：Harness 承重层](ch05/018-harness.html)
- [Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](ch05/018-harness.html)
- [告别"氛围编程"：基于 Harness 治理和 SDD 的团队级 AI 研发范式演进与实践](ch05/018-harness.html)
- [腾讯 AI Team 知识沉淀体系（Harness Engineering 实践）](ch05/018-harness.html)
- [Agent Reliability: Context Drift & Tool Calling Hallucination](../ch03/046-agent.html)
- [Harness Engineering：让 Coding Agent 可靠完成长程任务](ch05/116-harness-engineering.html)
- [Harness Engineering: 让 Coding Agent 可靠完成长程任务](ch05/116-harness-engineering.html)
- [长周期 Agent 详解：从 Ralph Loop 到可接管 Harness](ch05/018-harness.html)
- [Harness Design Peer Review Framework](https://github.com/QianJinGuo/wiki/blob/main/queries/harness-peer-review-framework.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch01/429-claude-code-harness-deep-understanding.html)
- [Agent Harness 架构](ch05/039-agent-harness.html)
- [两万字详解Claude Code源码核心机制](../ch03/076-claude-code.html)
- [Agent 自我改进的六条路](../ch03/046-agent.html)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](../ch04/682-karpathy-vibe-coding-agentic-engineering.html)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](../ch03/046-agent.html)
- [Harness如何支撑Agent在生产环境稳定运行？](ch05/018-harness.html)
- [Agent架构关键变化：Harness正在成为新后端](ch05/018-harness.html)
- [你不知道的 Agent 原理架构与工程实践](../ch04/341-agent-principle-architecture-engineering-practice.html)
- [AI Coding Agent 记忆系统](../ch04/319-ai-coding-agent.html)
- [柚漫剧 AI 全流程提效拆解](ch05/089-ai.html)
- [Agent Skill 设计模式](../ch04/396-agent-skills.html)
- [Coding Harness 工程本质](https://github.com/QianJinGuo/wiki/blob/main/concepts/coding-harness-engineering.md)
- [Thin Harness Fat Skills](ch05/080-thin-harness-fat-skills-ai.html)
- [Design Patterns for AI Agents 2026](../ch04/094-design-patterns-for-ai-agents-2026-4-5-reflection.html)

---

