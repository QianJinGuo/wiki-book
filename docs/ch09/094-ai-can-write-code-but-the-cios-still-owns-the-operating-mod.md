# AI can write code, but the CIOs still owns the operating model

## Ch09.094 AI can write code, but the CIOs still owns the operating model

> 📊 Level ⭐⭐ | 6.8KB | `entities/ai-can-write-code-cios-operating-model.md`

## 核心要点

- AI Can Write Code but CIOs Own the Operating Model

## 相关实体
- [Ai Is Writing More Code Your Ci Pipeline](../ch01/743-ai-is-writing-more-code-your-ci-pipeline-can-t-keep-up.md)
- [From System Of Record To System Of Intelligence](../ch01/310-from-system-of-record-to-system-of-intelligence.md)
- [Every Ai Subscription Is A Ticking Time Bomb For Enterprise](../ch01/1027-every-ai-subscription-is-a-ticking-time-bomb-for-enterprise.md)
- [Www.Cio 4170978 Nearly Every Enterprise Is Investing In Ai But Only 5 Say Their ](../ch01/135-nearly-every-enterprise-is-investing-in-ai-but-only-5-say.md)
- [要实现一个工作流选择 Agent Skills 还是 Ai 表格](../ch04/375-agent-skills.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-can-write-code-cios-operating-model.md)

## 深度分析

AI 正在以前所未有的速度进入企业，但大多数组织的准备程度远未跟上。这一进程已从实验性的聊天界面和窄场景应用，演变为嵌入真实工作流程的生产力工具，并开始出现初步的自主化能力，逐步成为工作完成方式的一部分。这对 CIO 角色构成了全新的挑战：问题不再是业务部门是否需要 AI，而是企业如何治理业务部门已经在使用的 AI 工具 。

业务团队追求速度、便利和即时生产力收益，员工自行寻找方式总结会议、起草沟通、分析数据、生成代码和自动化工作流。这种自下而上的采纳模式在业务视角下是加速，但在 IT 视角下更像是 Shadow IT 的新变体。 tension 是真实的：IT 容易被描绘为拖慢一切的部门，而 CIO 实际上是在横跨整个风险全景审视问题，包括网络安全暴露、数据泄露、身份控制、审计可行性、工作流审批，以及当 AI 从建议走向行动时的责任归属 。

真正的难题在于：**如何在引入 AI 的同时不失去控制**。当 AI 从个人生产力工具进入业务流程时，风险画像开始改变。一个帮助总结会议的工具有本质区别。AI 能力的风险等级必须基于三个核心问题来评估：工具能访问哪些数据、能执行什么操作、如果出错的后果是什么 。

这一评估框架揭示了明显的风险分层。仅仅读取已批准信息并帮助用户检索或总结的 AI 属于一个级别；起草内容但由人工审核后发布的属于另一个级别；影响审计、财务控制、客户承诺或监管活动的推荐建议需要更快地提高门槛；而能够移动文件、触发工作流变更、审批交易或与生产环境交互的 AI 能力，应该被区别对待 。

在托管云环境中托管共享仪表板与允许基于个人桌面构建的 AI 代理连接企业数据并执行操作之间，存在根本性的差异。前者可通过身份、访问、日志和平台控制进行治理；后者可能始于个人实验，但一旦涉及有缺陷或不一致的数据、工作流审批或运营决策，就会迅速成为企业问题——因为坏数据可能导致错误操作被规模化执行 。

Human-in-the-loop 设计的重要性在此背景下更加突出。关键决策、审批和例外情况不应该仅仅因为工具具备能力就悄然漂移为自动化。必须有人对决策、审计追踪和结果负责 。

身份和访问控制、日志记录、端点保护和数据保留等核心控制措施仍然重要。AI 并非替代这些学科，而是使其变得更加关键。随着 AI 开始从提示层进入实际操作，这一点变得更加重要 。

Verizon 的 2025 年数据泄露调查报告分析了 12,195 起已确认的泄露事件，是该报告有史以来单年分析最多的一次。这并不意味着每个 AI 工具都会自行造成泄露条件，但确实说明企业环境本身已是高风险状态——同样使这些工具对企业有用的加速效应，也使攻击者更容易利用它们，这正是为什么组织在更广泛地使用这些工具时必须更加有意地应用安全和风险控制 。

## 实践启示

正确的回应不是说"不"，而是以适当的控制级别快速推进 。

**分级治理路径**：低关键性用例应通过轻量级路径，包含基本安全、隐私和架构审查即可；更高风险的用例应需要更深入的审查、更严格的控制和明确的所有权。目标不是制造官僚主义，而是创建足够的结构来防止可避免的风险，减少后期补救的需要，并防止 AI 决策变得随意 。

**建立跨职能指导结构**：早期的跨职能指导结构是治理 AI 需求最有效的方式之一，因为它围绕超出技术范畴的决策创建了共同责任。这些机制本身并不定义运营模式，但它们使运营模式变得可操作。它们有助于区分低风险的生产力收益与接触敏感数据、工作流或审批的更高风险用例 。

**AI 需求 intake 流程设计**：该流程需要做的不仅是登记业务需求，还要尽早进行分类。是个人生产力用例、工作流支持用例，还是能够启动或影响操作的自主性用例？它接触哪些系统或数据？输出是建议性的、运营性的还是影响决策的？谁在启动后负责？将如何被监控？这些问题在规模化之前就创造了纪律 。

**运营后管理同样重要**：流程不应止步于批准。每个生产用例都应该有指定的负责人、明确的边界、日志记录、定期审查，以及在行为漂移或风险变化时的明确升级路径。模型会演进，用户会适应，业务依赖会随时间增长。一个低风险用例可能比许多组织预期的更快变成高影响力用例 。

**运营模式才是真正的差异化因素**：做得好的组织不会是那些最先行动的组织，而是那些能够以控制、清晰度和责任感将 AI 引入企业的组织。CIO 仍然决定 AI 是带着纪律进入企业还是失去控制地漂移进来 。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-can-write-code-cios-operating-model.md)

---

