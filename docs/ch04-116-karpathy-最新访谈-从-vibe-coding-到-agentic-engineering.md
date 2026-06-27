# Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering

## Ch04.116 Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering

> 📊 Level ⭐⭐ | 15.0KB | `entities/karpathy-vibe-coding-agentic-engineering-v4.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/karpathy-vibe-coding-agentic-engineering-v4.md)

## 核心洞察
Vibe Coding 拉低下限，Agentic Engineering 解决真实交付问题；可验证性决定 Agent 自动化上限；上下文/工具/测试/运行环境成为 Software 3.0 的核心设计对象。

## 摘要
Karpathy 在红杉 AI Ascent 2026 访谈中提出 Software 3.0 概念，认为 Vibe Coding 将软件创造门槛拉低，但 Agentic Engineering 才能解决"更快之后能否可靠交付"的问题。当 Agent 读上下文、改文件、调工具、跑测试、配服务时，它已走进软件工程链路。Vibe Coding 解决"更快做出来"，可靠交付是另一类问题。

## 要点
- **Vibe Coding**：降低软件创造下限，让非技术人员也能快速构建工具
- **Agentic Engineering**：解决可靠交付问题，涉及可验证性边界
- **Software 3.0 设计对象**：上下文/工具/测试/运行环境
- **锯齿智能**：能力曲线非线性，存在上限瓶颈

## 来源
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/karpathy-vibe-coding-agentic-engineering-v4.md)

## 深度分析
### Vibe Coding 与 Agentic Engineering 的本质分野
Karpathy 在访谈中区分了两个概念，但这个区分背后有更深的工程含义。Vibe Coding 本质上是一种**生成范式**的民主化——它把"创造"这件事的门槛降到最低，让需求表达变成唯一必要的技能。而 Agentic Engineering 解决的问题不是生成，而是**可靠性交付**。两者面向的价值维度完全不同：Vibe Coding 提升的是创意到原型的转化效率，Agentic Engineering 解决的是原型到生产系统的最后一公里。
这个分野在 GLM-5 论文的标题中得到了正式确认——从 Vibe Coding 到 Agentic Engineering 已经成为中国大模型厂商正式立项的研究方向，说明这不是一个单纯的概念炒作，而是被工业界验证的进化路径。

### Software 3.0 的工程含义
Karpathy 的 Software 1.0/2.0/3.0 框架被很多人理解为技术范式的更迭，但真正值得注意是它的**工程对象迁移**。在 Software 1.0 时代，架构师关注的是代码模块、接口契约、运行时行为；到了 Software 2.0，注意力转向数据集质量、训练流程、模型评估；到了 Software 3.0，上下文化（context）、工具边界（tools）、权限约束（permissions）、验证体系（verification）变成了新的"架构材料"。
这个迁移的工程含义是：过去架构师通过设计模块和接口来控制系统复杂度，现在还需要通过设计 Agent 的上下文边界、工具调用权限和验证协议来控制 AI 系统的复杂度。后者的难度在于：代码模块是确定性的，而 Agent 的行为空间是概率性的。

### 可验证性决定自动化上限
Karpathy 提出的"传统计算机容易自动化你能写进代码的东西，这一代 LLM 更容易自动化你能验证的东西"是一个深刻的论断。它的深层含义是：代码自动化的前提是规范可形式化，而 AI 任务自动化的前提是结果可验证。这两个前提的难度不在同一层次——写规范需要人理解任务，验证规范只需要人定义验收条件。
这个判断在工程上的落地价值在于：团队在引人 Agent 之前，应该先自问"这个任务的结果能不能被低成本地验证"。如果验证成本高于自动化节省的成本，引入 Agent 反而不划算。等级表中 L4~L6（涉及业务规则、身份资金、法律责任）的任务之所以需要人主导，不是因为 Agent 写不出代码，而是因为这些领域的错误后果难以被快速验证和承受。

### "幽灵"隐喻对工程设计的影响
Karpathy 用 animals vs ghosts 来描述 LLM 的本质特征，这个比喻有很具体的工程含义。动物的智能来自与环境的持续互动和后果驱动，所以可以通过反馈循环训练。幽灵是由人类文档、统计模式和奖励函数塑造的，它的"动机"是训练时构建的奖励信号，而不是真实世界的后果。
这个区别直接影响了工程预期的设定：把 Agent 当成"有动机的同事"会导向错误的协作模式——你会期待它因为被催促而更努力，因为被鼓励而更可靠，但实际上这些人类激励手段对 Agent 完全无效。正确的工程预期是：Agent 是一个执行速度极快、边界有时不稳定的能力聚合体，需要通过系统设计（而非人员管理）来确保可靠性。

### MenuGen 案例的架构警示
MenuGen 这个案例之所以值得深思，不是因为它证明了 AI 能做什么，而是因为它揭示了**中间应用层在模型能力跃迁前的脆弱性**。Karpathy 发现原本需要独立 App 处理的菜单识别+图像生成+重新渲染，多模态模型可以直接完成，而且效果更好。
这个案例对架构决策的警示是：评估一个中间层应用的价值时，不能只看它当前解决了什么问题，还要看它的核心能力是否会被模型原生功能替代。壁垒由低到高的排序是：包装模型能力 < 输入输出格式转换 < 深入业务流程 < 掌握权限、数据、状态、审计 < 承担复杂系统协同和验证。越靠近底层的能力越难被替代，越靠近表层包装的越危险。

### Agent Native Infrastructure 的缺失
Karpathy 提到今天的基础设施还是给人设计的，这个观察揭示了一个被严重低估的工程缺口。控制台、菜单、设置页、API key、DNS 配置、环境变量、部署后台——这些全都是一个假设"有人在屏幕前操作"的世界设计的。当 Agent 需要操作系统时，它面对的是一套完全不对齐的交互界面。
Agent Native Infrastructure 需要解决六个方向的重建：Agent-readable Docs（从说明书变成可执行材料）、Tool Registry（让 Agent 知道有什么工具可用）、Permission Gateway（控制 Agent 的能力边界）、Execution Sandbox（隔离执行环境）、Verification Pipeline（用测试和规则验证结果）、Audit and Cost Ledger（记录行为和成本）。这六项每一项都是一个独立的工程领域，合计起来构成了一个比现有 DevOps 体系更复杂的基础设施需求。

## 实践启示
### 1. 先建验证体系，再上 Agent
引人 Agent 自动化之前，团队应该首先完成该领域的验证体系搭建。验证体系包括：测试覆盖（单元/集成/端到端）、编译和静态分析门禁、业务规则的形式化描述。对于代码类任务，这意味着要有可运行的测试套件和明确的编译成功标准；对于业务类任务，这意味着要有可枚举的验收条件和可量化的错误检测手段。没有验证体系托底的 Agent 引入，本质上是在用不确定性叠加不确定性。

### 2. 用任务可验证性作为引入 Agent 的决策标准
Karpathy 的等级框架提供了一个实用的决策工具：L1（输出可静态校验）和 L2（可编译、可测试）的任务最适合 Agent，是自动化的起点；L3（可通过集成测试验证）可以较高程度地依赖 Agent；L4 开始需要审批和审计；L5 和 L6（涉及资金、身份、法律责任）必须人主导。团队应该从这个框架出发，绘制自己业务域的 Agent 适用度地图，而不是盲目地在所有流程上引入 Agent。

### 3. 构建 Agent Control Plane
如果团队决定在部分流程引人 Agent，需要配套建设 Agent Control Plane。这个控制面包含八个维度：Context Control（Agent 能看到什么）、Spec Control（任务目标如何表达）、Tool Control（可调用哪些工具及参数约束）、Permission Control（哪些动作需要审批）、Runtime Control（执行环境隔离和限额）、Verification Control（如何验证结果）、Audit Control（做了什么、为什么做、造成什么影响）、Cost Control（Token 和调用成本管理）。这八项不是全都要做，而是要根据业务场景选择性地建设。

### 4. 投资过程资产而非聊天记录
Karpathy 在访谈中反复强调"过程资产"的重要性，这是 AI Coding 下半场的关键判断。聊天记录是低质量的记忆载体——它记录了"说了什么"但丢失了"为什么这样做"和"这样做的结果是什么"。过程资产（稳定排障路径、发布检查清单、PR review 规范、数据迁移步骤、安全红线描述）则把团队积累的工程经验变成了 Agent 可以执行的流程。一个团队如果只是让 Agent 记住更多的对话，长期看会陷入"Agent 越来越会聊但工程能力不见增长"的困境。

### 5. 工程师的核心价值向规格和边界迁移
Karpathy 提出的"可以外包思考，不能外包理解"具体化到工程实践中，意味着高级工程师的核心能力从"实现细节的掌控"转向"业务语义的定义和边界的设计"。具体包括：理解 tensor、view、storage 的关系（底层机制理解）；定义 user ID 而非把邮箱当身份（语义建模）；设计权限模型而非开放所有权限（安全边界）；建立验证体系而非相信模型输出（质量控制）。这些能力在 Agentic Engineering 时代的重要性不降反升，因为 Agent 在这些领域的错误成本往往最高。

### 6. 面试标准需要根本性重构
Karpathy 设想的 AI-native 面试是：给候选人一个大项目（如做个给 Agent 用的 Twitter 仿盘），要求做得绝对安全，然后用 10 个 AI Agent 作为红队去攻击候选人构建的系统。这套评估体系看的不再是手写算法的能力，而是：把模糊目标变成清晰规格的能力、指挥多个 Agent 完成大规模实现的能力、识别安全和架构风险的能力、设置测试与验证的能力、在 AI 生成的大量代码中保持质量判断的能力。这套标准背后对应的，正是 Agentic Engineering 时代"架构能力"的核心组成。

### 7. 关注三个前沿信号
Karpathy 给出了他未来 6-12 个月关注的三个信号，可作为行业观察的锚点：①前沿实验室在编程和数学之外往哪些领域注入 RL 数据——那里的能力可能突然冒出来；②Agent-first 基础设施有没有开始收敛——部署、auth、payments、DNS 等让 Karpathy 在 MenuGen 项目上最头疼的环节，是否出现"一句话给 Agent 就能跑"的标准化方案；③下一代模型有没有把审美和代码质量纳入 RL 目标——如果 Agent 写的代码不再让人"心脏病发作"，人在"品味"层守的口子就会变窄。这三个信号分别指向 Agent 能力边界的扩展速度、基础设施成熟度和人类判断力的相对价值变化。

## 相关实体
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](/ch04-122-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](/ch04-518-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](/ch04-122-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](/ch09-019-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](/ch04-191-tencent-vibe-coding-to-agentic-engineering-backend/)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程](/ch04-366-从vibe-coding到agentic-engineering-重构后台开发全流程/)
- [Design Patterns for AI Agents 2026](/ch04-083-design-patterns-for-ai-agents-2026-4-大执行模式-5-步选型决策树-refl/)
- [Martin Fowler AI 研发 Harness：非确定性承重层](/ch05-020-martin-fowler-ai-研发-harness-非确定性承重层/)
- [Agent Reliability: Context Drift & Tool Calling Hallucination](/ch04-158-agent-reliability-context-drift-tool-calling-hallucinatio/)
- [Harness Engineering：让 Coding Agent 可靠完成长程任务](/ch04-160-harness-engineering-让-coding-agent-可靠完成长程任务/)
- [LLM-as-a-Verifier: A General-Purpose Verification Framework](/ch01-302-llm-as-a-verifier-a-general-purpose-verification-framework/)
- [Harness Engineering: 让 Coding Agent 可靠完成长程任务](/ch04-422-harness-engineering-让-coding-agent-可靠完成长程任务/)
- [LLM agent脚手架如何具备自进化能力？——以hermes agent为例](/ch04-418-hermes-agent/)
- [长周期 Agent 详解：从 Ralph Loop 到可接管 Harness](/ch05-012-长周期-agent-详解-从-ralph-loop-到可接管-harness/)
- Harness Design Peer Review Framework
- [从 30 分钟手搓 Agent，到 Harness 成为"新后端"](/ch04-254-从-30-分钟手搓-agent-到-harness-成为-新后端/)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](/ch01-367-claude-code-harness-deep-understanding/)
- [两万字详解Claude Code源码核心机制](/ch09-056-两万字详解claude-code源码核心机制/)
- [Agent Harness 架构](/ch04-207-agent-harness-架构/)
- [Agent 自我改进的六条路](/ch04-047-agent-自我改进的六条路/)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](/ch04-126-boris-cherny-新访谈-开发工具正在从-ide-变成-agent-控制台/)
- [Harness如何支撑Agent在生产环境稳定运行？](/ch04-127-harness如何支撑agent在生产环境稳定运行/)
- [Code as Agent Harness 综述](/ch09-046-code-as-agent-harness-综述/)
- [Agent架构关键变化：Harness正在成为新后端](/ch04-027-agent架构关键变化-harness正在成为新后端/)
- [harness-engineering-systematic-explainer](/ch05-036-harness-engineering-systematic-explainer/)
- [Agent 原理、架构与工程实践](/ch04-435-agent-engineering-principles-architecture-practice/)
- [AI Agent 工程师能力地图](/ch04-139-ai-agent-工程师能力地图/)

---

