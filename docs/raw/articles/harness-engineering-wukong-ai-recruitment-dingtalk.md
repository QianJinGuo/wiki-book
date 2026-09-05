---
title: "Harness Engineering 铁律与实战：悟空 AI 招聘 Agent 的专才架构实践"
source_url: https://mp.weixin.qq.com/s/0w_xMwto4sLx6J_85OhWQw
ingested: 2026-06-30
sha256: a849ea24d512a136911e504328280712def4944514b31c47bfb719927e9b7acd
---

阿里妹导读

写在前面：这不是一篇"概念科普文"。它是写给所有正在被 Agent 折磨、又离不开 Agent 的开发者——那些一边惊叹于一晚上跑出一个像样的 PR、一边在凌晨三点回滚生产事故的人。

关于引用的一句郑重交代：文中所有第三方数据，已尽量回溯到原始博客或官方文章；个别行业流传的数字，无法核实到一手来源时，已经主动软化或删除，并明确标注。文章的工程判断与实战经验，来自我们团队的真实落地，不依赖任何二手转述。

（文章内容基于作者个人技术实践与独立思考，旨在分享经验，仅代表个人观点。）

一、共鸣时刻：你是不是也经历过这些瞬间？

凌晨两点，你盯着屏幕。Agent 又一次"自信地"宣布任务完成——测试全绿、CI 全过、PR 描述写得无懈可击。你点开 diff，发现它把一个核心服务"重构"了，顺手删掉了三个它"不理解"的兼容分支。

或者，更扎心的场景：

一个会话里它表现得像高级架构师，下一个会话像刚入职的实习生，因为它压根不记得上次干了什么。
你给它配了 20 个 MCP 工具，它开始在工具列表里"逛超市"，逛着逛着就忘了正在干嘛。
它陷入死循环，把同一个错误反复"修复"了十几次，每次都换一种"自信"的说法。
你写了一份 800 行的 AGENTS.md 教它做事，它读完前 200 行就开始幻觉。

如果你点头了——欢迎来到 Agent 的"实战时代"。这一年，AI 工程圈终于承认了一件事：

瓶颈不在模型够不够聪明，而在我们有没有把它"装"好。

这就是 Harness Engineering（驾驭工程）——Terraform / HashiCorp 联合创始人、Ghostty 终端作者 Mitchell Hashimoto 在他个人博客《My AI Adoption Journey》中系统阐述的工程范式 [1]。他给这件事的定义朴素到几乎是一句口号：

"anytime you find an agent makes a mistake, you take the time to engineer a solution such that the agent will not make that mistake again in the future."

——每当你发现 Agent 犯了一个错，就花时间工程化一个解，让它将来不再犯同样的错。

这句话本身就是 Harness Engineering 的全部精神：Agent 的每一次失败，都不是模型的问题，而是环境设计的债。

二、一个公式，看清楚 Agent 到底是什么

如果你只能记住这篇文章的一句话，请记住这个：

Agent = Model + Harness

这个公式后来被 LangChain 官方在《Improving Deep Agents with Harness Engineering》一文中作为标题级别的论断 [2]：模型负责推理，Harness 负责"剩下的所有事情"——工具系统、上下文管理、权限控制、反馈回路、记忆与协作。

这个公式的颠覆性在于它彻底改变了优化方向。最值得拿出来讲的一手案例，是 LangChain 自己做的实验：

案例：LangChain × Terminal Bench 2.0，未更换模型，优化 Harness（自我验证 + 追踪 + 文档），排行榜第 30 → 第 5；得分 52.8 → 66.5 [2]。

读到这里你应该意识到一件事：过去几年大量精力放在"换更强的模型"上，但真正的杠杆位置一直在模型之外。

三、范式的三次跃迁

代际 | 范式 | 核心问题
第一代 | Prompt Engineering | 怎么把话说清楚
第二代 | Context Engineering | 怎么给 AI 喂对信息
第三代 | Harness Engineering | 怎么让 Agent 可控地工作

业内一个常被引用的类比是：模型是 CPU，Harness 是操作系统——CPU 再快，OS 拉胯也白搭。

四、核心精髓：四条"反直觉"的铁律

铁律一：上下文越少越好（不是越多越好）
工程师本能：信息越多决策越准。Harness 真相：上下文是稀缺资源，会被污染、会相互干扰。多个团队实测：长上下文窗口超过一定阈值后准确率显著下降。不要把"模型支持 200K"当成"可以塞 200K"。

铁律二：专才 Agent 永远赢过通才 Agent
工程师本能：做一个超级 Agent 全包。Harness 真相：通才 Agent 在工具列表里"逛超市"。LangChain Terminal Bench 实验：把任务拆给专门的 Sub-Agent 并只装载需要的工具，是排名从第 30 冲进第 5 的关键改动 [2]。Agent 是昂贵的，Skill 是廉价的 [3]。

铁律三：状态要写文件，不要塞上下文
工程师本能：让 Agent "记住"任务进展。Harness 真相：上下文是易失存储，文件系统才是持久内存。Workspace 是真相，Context Window 只是当前工位。

铁律四：能写成 Linter 的约束，别写成文档
工程师本能：把规则写进 AGENTS.md 让 Agent 自己读。Harness 真相：文档只是"建议"，Linter / CI 才是"强制"。Mitchell Hashimoto 的 Ghostty 实践：AGENTS.md 里每条规则背后都对应一个真实失败案例；能写成静态检查的规则绝不让它停留在自然语言里 [1]。

五、Context Engineering 的"工程化"

Harness Engineering 不是 Context Engineering 的对立面，而是它的工业化升级。工程化要做四件事：结构化（有 schema）、分段化（按槽位写）、可回放（可重放可 diff）、可审计（保留来源链）。

六、六大工程模式

模式 1：双阶段架构（Initializer + Executor）
Anthropic Claude Code 模板：Initializer Agent 理解任务→制定计划→写入 plan.md→退出；Executor Agent 读取 plan.md→按步执行→跨 Context Window 接力。两个 Agent 不共享 Context Window，只通过 Workspace 的 plan.md 接力。

模式 2：工具签名即文档（Tool-Signature-as-Doc）
工具名是动词短语；参数 schema 每个字段带 description 说清"什么时候用、什么时候别用"；返回值结构稳定。LangChain 实验：仅改善工具描述与返回结构就能带来可观准确率提升 [2]。

模式 3：Sub-Agent 隔离（Context-Isolated Sub-Agent）
每个 Sub-Agent 有独立 Context Window；只看到自己需要的工具；主 Agent 只接收结构化输出，不接收中间思考。

模式 4：上下游反压（Upstream-Downstream Backpressure）
上游给确定性设置 + 一致上下文 → Agent 执行 → 下游测试/Lint/CI 拒绝无效工作 → 错误信号回传。关键：Linter 的错误信息本身就是上下文工程——它解释"为什么这个规则存在、正确做法是什么"。

模式 5：智能体审智能体（Agent-Audits-Agent）
Reviewer Sub-Agent 只看 git diff + docs/rules/*.md，角色为"怀疑态度的 Senior Reviewer"，对 Main Agent 产出一无所知。经验：失效的不是"换一个模型再评估"，而是"用同样的 Context 再评估一次"。

模式 6：熵管理与文档园丁
部署后台 Agent 做"文档园丁"，定期扫描过期文档、检测架构漂移、提交清理 PR。持续小额偿还技术债。

七、实战案例：悟空 AI 招聘 Agent

7.1 第一版：全能招聘 Agent（失败）
600+ 行 System Prompt + 13 个工具 → 问题全冒：RPA 跑到一半去回复候选人聊天、10+ 工具挑错工具概率高、Prompt 400 行后模型忘了开头规则、状态全在上下文里跨会话丢失。

7.2 第二版：2 Agent + N Skill 专才架构
悟空（Orchestrator）+ 人岗匹配 Agent（RPA 专才，4 工具）+ 招聘沟通 Agent（聊天专才，5 工具）+ N 个原子化 Skill。Workspace 作为真相之源：/candidates/{id}/state.json、chat_history.log 等。

7.3 四条铁律的逐条落地
- 铁律一：每个 Agent Prompt ≤ 100 行，只携带当前候选人状态摘要
- 铁律二：强行只允许 2 个 Agent，剩下下沉为 Skill
- 铁律三：候选人状态、RPA 进度全部写 Workspace
- 铁律四：招聘合规规则写成 Linter，工具调用前先校验

7.4 改造前后对比
- 工具选择：n 工具混选错率高 → 每 Agent 只看 4-5 工具，错率显著下降
- 准确率：达不到上线门槛 → 稳定超过上线门槛
- 可调试性：回滚查数小时日志 → 分钟级定位
- 可复用性：换场景就废 → 已复用到内推系统和候选人回访
- 上下文消耗：数量级偏高 → 显著下降，长期处于安全区
- 新增需求成本：改 Prompt 2-3 天 → 新增 1 个 Skill 半天上线

7.5 三条血泪经验
经验一：Agent 数量不要超过 3 个，Skill 可以无限加。堆到第 6 个 Agent 时编排层开始"选错 Agent"。
经验二：RPA + Agent 接缝处最容易出事，要做事务边界（lock 文件 + 断点续传）。
经验三：聊天 Agent 必须接硬护栏（白名单工具 + Linter 拦截 + 第二 Agent 审稿），对外消息事故率从每周一两次降到记不清上一次。

八、行业标杆地图
- Anthropic / Claude Code：Initializer + Executor 双阶段，Workspace 作为持久层
- LangChain / Deep Agents：自我验证 + 追踪 + 工具签名优化，不换模型冲进 Top 5 [2]
- Mitchell Hashimoto / Ghostty：AGENTS.md 作为"项目宪法"，每条规则对应一个真实失败 [1]
- Cursor / Cline：内置反馈回路（Linter / Type Check / Test）自动闭环
- 悟空 AI 招聘：2 Agent + N Skill + Workspace 状态文件 + Linter 硬护栏

九、未来趋势
趋势一：从"Prompt 工程师"到"Agent 工程师"
趋势二：从"工具调用"到"Agent 协作协议"（MCP → A2A）
趋势三：从"单 Agent 完成任务"到"Agent 操作系统"（Shell=交互层, Scheduler=编排层, System Calls=Skill, Workspace=文件系统, MCP=设备驱动）
趋势四：模型与 Harness 的"接口标准化"（换模型像换数据库引擎）

十、六句话送给所有 Agent 工程师
1. 你优化的不是 Agent，是 Agent 的工作环境
2. 上下文是稀缺资源，不是无限仓库
3. 状态写在文件里，不在脑子里
4. 能写成 Linter 的约束，别写成文档
5. Agent 是昂贵的，Skill 是廉价的，护栏是最便宜的
6. 对外说话和动用户数据的地方，硬护栏要早一步到位

参考资料
[1] Mitchell Hashimoto《My AI Adoption Journey》中文转述
[2] LangChain《Improving Deep Agents with Harness Engineering》一手来源
[3] Hugo Zhu《Enterprise Agent Runtime Five Layer Architecture》
