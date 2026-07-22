# Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering

## Ch04.135 Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering

> 📊 Level ⭐⭐ | 14.2KB | `entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md`

# Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering

> 来源：架构师（JiaGouX）公众号，2026-05 编译自 Karpathy 在 Sequoia AI Ascent 2026 的访谈视频。原文链接：https://www.youtube.com/watch?v=96jN2OCOfLs

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)

## 摘要

2026 年 5 月，Karpathy 在 Sequoia AI Ascent 2026 上系统重述了从「Vibe Coding」到「Agentic Engineering」的概念漂移：Vibe Coding 命名的是一种个人体验（说需求、看结果、继续调整），而 Agentic Engineering 命名的是一套专业工作方式（围绕 Agent 的上下文、权限、工具、验证、审计、回滚来重新设计研发链路）。访谈的核心主张是：AI 编程的下一阶段差距会越来越落到模型**外面**那套系统——Harness、上下文管理、过程资产、验证体系、发布与审计——而不是模型本身。

## 核心要点

- **概念漂移**：Vibe Coding ≠ Agentic Engineering。前者抬高「所有人做软件的下限」，后者守住「专业软件的质量门槛」。两个概念在 2025-2026 间已被 Google（Addy Osmani）、GLM-5 论文、Linus Torvalds 等多方独立呼应，不是 Karpathy 一家之言。
- **任务粒度变化**：2025-12 是分水岭，模型从「补一个函数」升级到「接一段流程」：读上下文、改多个文件、调命令、跑测试、根据失败继续修、给出可 review 的结果。前者是工具，后者是工程系统。
- **Software 3.0 的新坐标**：软件 1.0 控制代码、2.0 控制数据与模型权重、3.0 控制「上下文、工具、记忆、权限、验证、部署环境」这套 Agent 工作环境。架构师的重心要从模块、接口上移到 Agent 与系统的关系。
- **可验证性是硬门槛**：LLM 的进展曲线在「能写测试、能编译、能跑通」这类可验证任务上最陡，因为这些领域能构造奖励信号。Agentic Engineering 的推进速度取决于团队的验证体系是否到位。
- **锯齿状智能（Jaggedness）**：Karpathy 用「去 50 米外洗车」做反例——能重构 10 万行代码的模型可能不识「洗车要开车去」。能力不是平滑曲线，而是由训练数据、奖励函数、验证环境塑造的地形。
- **人是幽灵不是同事**：LLM 没有惧怕、没有自尊、不会被催得更努力，更接近「被人类文档和奖励函数塑造出的模拟实体」。把它当动物管（训诫、激励、淘汰）会失灵，应该按幽灵的物理特性划安全边界。
- **人可以外包思考，不能外包理解**：API 名字、样板代码可以扔给 Agent，但底层概念（tensor、view、storage、identity、权限模型）必须自己懂，否则失去判断 Agent 输出靠不靠谱的标尺。
- **Agent Native Infrastructure**：把 Agent 当成「带自然语言接口的函数」，让文档、工具、权限、运行时、测试、审计重新组织成 Agent 能直接读取、调用、验证、恢复的环境，而不是让人去点网页。

## 深度分析

### 1. 任务粒度跃迁是 Agentic Engineering 的真正起点

访谈里 Karpathy 给了一个很具体的感受变化：2025-12 之前，他需要不断把 Agent 拉回方向、修它的局部错误；2025-12 之后，模型能稳定接住「读项目上下文 → 改多个文件 → 调命令 → 跑测试 → 修复 → 给出可 review 结果」这一整段。 这不是模型「更聪明」的问题，而是任务边界在重新分布：以前 AI 是开发工具里的一个补全能力，现在是工程系统里一个有边界的执行体。一旦 Agent 走进研发链路，下游的所有问题——权限、隔离、回滚、审计、计费——就都不再是 IDE 团队的事，而变成了研发体系的事。

### 2. Agentic Engineering 是一种「控制面」重构

访谈里拆出了 8 个控制面：Context Control（Agent 看到什么）、Spec Control（目标与验收）、Tool Control（工具暴露）、Permission Control（动作审批）、Runtime Control（环境隔离）、Verification Control（结果校验）、Audit Control（行为追溯）、Cost Control（预算）。 这套分类的实际含义是：当 Agent 拥有修改真实系统的能力，工程体系里以前默认由人做的那些事（决定它能改什么、用什么工具、改完怎么验证、改坏了怎么回滚），现在需要被显式建模成可执行的控制面，而不是写在团队 wiki 里的口头规范。GLM-5 论文里把这种思路推到训练阶段——长上下文、异步 RL、真实软件工程任务要放在同一个框架里讨论——方向是一致的：模型的下一阶段进步会在「能跑长链路任务并被验证」的方向上。

### 3. 文档角色在 Software 3.0 里被重新定义

Karpathy 用 OpenClaw 的安装例子说清了一件容易忽略的事：传统 README、API 文档、Runbook 是给人读的，未来要同时满足「人能理解、Agent 能执行、系统能验证执行结果」三件事。 这条线连到过程资产——稳定的排障路径、发布检查、PR review 清单、安全红线——它们以前是经验，存在老员工脑子里或者零散的 wiki 页面；以后要变成 Agent 能读取、调用、累积的工程材料。这个变化和 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)、[上下文工作集](https://github.com/QianJinGuo/wiki/blob/main/concepts/working-set-vs-long-term-memory.md)、[Subagent 模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/subagent-spawning-pattern.md) 其实是同一件事的不同切片。访谈里特别提了一个反面教材：用户用 Google 登录、Stripe 付款，Agent 把 Stripe 邮箱当 user ID 关联 credits——代码能跑、局部测试能过，但系统语义错了。 这类业务语义错误最危险的地方在于它不在代码语法里，而在身份、权限、状态、责任的关系里——这恰恰是架构师最该守的口子。

### 4. 锯齿状智能决定护栏必须默认开启

Karpathy 给出的护栏表非常具体：幻觉执行靠工具调用前校验、错误修改靠分支隔离、误删数据靠只读默认权限、错误部署靠灰度回滚、错误关联身份靠稳定 ID、Prompt Injection 靠「私有数据 + 不可信输入 + 外部通信」三分、行为不可追溯靠全量审计链。 重点是：这些不是补丁，是默认配置。访谈里同时引用了 Simon Willison 2025 年提出的「致命三件套」——Agent 同时具备访问私有数据、接触不可信内容、对外通信这三种能力时风险陡升——作为这条护栏清单的理论支撑。Agent 的危险不是写错代码，而是「读到了不可信输入、又拿到了真实权限、还能把结果发出去」这种组合。这意味着设计 Agentic Engineering 的护栏时，要按「沙箱内一切默认不可信」的姿态工作，而不是按「默认信任、出了事再补丁」。

### 5. MenuGen 警告：被模型吞掉的中间层

Karpathy 自己做了一个 MenuGen 小应用：拍菜单照片 → OCR 抽菜名 → 调图像生成 → 重新排版。他后来意识到 Software 3.0 版本根本不需要这个 App——直接把照片丢给多模态模型，模型在原图上叠加菜图并返回修改后的图片。 访谈给了一张抗模型升级性表：只包装模型能力、只把 Prompt 做成页面、只做输入输出格式转换——都容易被模型升级吞掉；深入业务流程、掌握权限数据状态审计、承担复杂协同——更接近基础设施。架构师在做产品判断时需要顺手问一句：这个功能是终态，还是「模型能力暂时不到位时的中间层」。把这个问题摆在桌面上比给出确定性结论更重要，因为模型边界一直在动。

### 6. 人的位置上移：从搬砖者到包工头

访谈里给了一个很具体的对比：以前高级工程师和初级工程师的差距在「能不能写更复杂的代码、记住更多 API、排查更隐蔽的问题」；在 Agentic Engineering 里这种差异上移到「能不能定义业务语义、设计 Agent 执行边界、建立验证体系、控制系统后果」。 招聘也要换：现场算法题测的是「能不能在白板上手写一个 trie」，跟一个人在 Agentic Engineering 里能不能干活基本两码事。Karpathy 提的替代方案是甩一个超大型项目，挂 10 个 Cursor 当红队，评估候选人能不能「把模糊目标变成清晰规格、指挥多个 Agent 完成大规模实现、识别安全和架构风险、设置测试与验证」。 这条线连到一个反直觉的结论：当代码越来越多由 Agent 生成，**保住系统**就慢慢变成了工程师的核心能力——这正是过去做架构的人比较熟悉的事。

## 实践启示

1. **按所有权拆开制品**：用户自己改的环境（包、文件、配置）和平台频繁部署的 Runner 代码应该按变更频率解耦，平台升级不能毁掉用户的状态。借鉴操作系统「内核升级不影响 home 目录」的思路。
2. **把验证体系当作 Agent 自动化能走多远的天花板**：先看哪些事能被验证（L1 静态校验 / L2 编译测试 / L3 集成测试 / L4 业务规则状态变更 / L5 资金身份权限数据 / L6 组织判断法律责任），再决定哪些事交给 Agent。L1-L3 高适用，L4 需审批审计，L5-L6 人必须主导。
3. **过程资产 > 聊天记录**：把稳定的排障路径、PR review 清单、安全红线、发布检查、数据迁移步骤写成可执行资产，让 Agent 沿团队走过的路径走，而不是每次重新猜资深工程师会怎么想。
4. **默认护栏代替信任补丁**：工具调用前校验、分支隔离、只读默认权限、灰度回滚、稳定用户 ID、私有数据/不可信输入/外部通信三分、Token 限额——这些应该是默认配置而不是「出事了再加」。
5. **设计判断要给中间层做风险评估**：当一个新功能在纸上画出来时，顺手问一句「这是终态还是模型能力不到位时的中间层」。被模型吞掉的风险随时间增长，业务状态、权限模型、数据闭环、验证体系、审计链路是更难被一次升级抹平的资产。
6. **AI-native 工程师的工程习惯要重新投资**：花时间把 Cursor/Claude Code 调成真正适合自己的样子——Skill、CLAUDE.md、Hooks、Subagent、Review 流程——就像以前花时间配 Vim、VS Code、命令行。面试也要从算法 puzzle 切换到「把模糊目标变成清晰规格、指挥多个 Agent 实施、识别安全架构风险」。
7. **盯三个 6-12 个月的信号**：① 前沿实验室在编程和数学之外往哪些领域注入 RL 数据（被注入的领域能力会突然冒出来）；② Agent-first 基础设施（部署/auth/payments/DNS/配置）有没有开始收敛；③ 下一代模型有没有把审美和代码质量纳入 RL 目标。三者决定 Agentic Engineering 边界外推的速度。

## 相关实体

- [两万字详解Claude Code源码核心机制](../ch03/076-claude-code.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch05/039-agent-harness.html)
- [Claude Code Harness Deep Understanding](../ch01/429-claude-code-harness-deep-understanding.html)
- [Claude Code Harness Deep Dive Founder Park](../ch05/070-claude-code-harness.html)
- [Karpathy Vibe Coding Agentic Engineering](ch04/682-karpathy-vibe-coding-agentic-engineering.html)
- [Vibe Coding Agentic Engineering Convergence Simon Willison](ch04/430-vibe-coding-agentic-engineering.html)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/046-agent.html)
- [Gsd Get Shit Done Context Management Tool](https://github.com/QianJinGuo/wiki/blob/main/entities/gsd-get-shit-done-context-management-tool.md)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](../ch05/116-harness-engineering.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](../ch11/227-openclaw.html)
- [protecting against token theft](../ch01/323-protecting-against-token-theft.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/coding-agent-practice.md)

---

