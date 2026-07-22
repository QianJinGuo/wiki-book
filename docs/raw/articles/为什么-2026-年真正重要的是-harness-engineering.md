---
source: wechat
source_url: https://mp.weixin.qq.com/s/RwWfknFIFvJPIdsJMgeNiQ
ingested: 2026-07-05
feed_name: 高可用架构
wechat_mp_fakeid: MP_WXS_3000551159
source_published: 2026-06-08
sha256: 95ef9c959dfb5ed03fbfb785c6d84302cfe058d8d4ff9ba92a71550736c1c4df
---

# 为什么 2026 年真正重要的是 Harness Engineering？

导读：本文详细介绍了 2026 年新兴的“Harness Engineering”工程学科，核心观点是 AI agent = 模型 + Harness，通过约束、反馈循环和文档让 agent 可靠地生成百万行生产代码，而非单纯依赖模型能力。

文章归纳了五种关键 Harness artifact（如AGENT.md 文件、JSON 功能列表、会话初始化流程）和五条普适原则（上下文优于指令、规划与执行分离、必须有反馈循环等），引用 OpenAI、Anthropic 和 ThoughtWorks 的实践案例。

文章强调 Harness 会随模型升级而“衰减”，需“为删除而构建”，实际应用中简化工具反而可能提升性能，提醒开发者重点设计环境约束而非仅优化提示词。

> 作者 Rahul（@sairahul1）是 AI 实践者与内容创作者，NicheTrafficKit 创始人。他专注于分享 AI 前沿趋势、实用构建经验与 2026 年新兴的 Harness Engineering，帮助开发者掌握 AI agent 系统设计。

Image

2026 年 2 月，OpenAI 的一个小团队交付了 100 万行生产代码。

他们没有手写任何一行。

代码由 AI agent 写出。

人类设计的是让这些 agent 变得可靠的系统。

这个系统现在有了名字。

**Harness Engineering。**

几周之内，Anthropic 发表了 3 篇相关论文。

ThoughtWorks 将它形式化为一个框架。

Hugging Face 的 Philipp Schmid 称它为“2026 年最重要的学科”。

一个新的工程学科在 90 天里成形。

而 AI 基础设施团队之外，几乎还没有人真正理解它。

这篇文章会把它讲清楚。

没有废话。没有学术黑话。只有你真正用得上的心智模型。

收藏这篇。你会读第二遍。

## 第一部分：Harness 到底是什么（它会改变你理解 AI 的方式）

**1\. Harness 的定义**

Image

最简单的定义来自 ThoughtWorks：

→ **Agent = Model + Harness**

Harness 是模型之外的一切。

让 agent 不偏离轨道的约束。捕捉错误的反馈回路。告诉 agent 自己身在何处的文档。它被允许使用的工具。

拿掉 harness，就只剩一个原始语言模型，在你的代码库里一路猜。

加上合适的 harness，就变成一个能交付生产代码的系统。

这个名字来自马具。

Harness 指缰绳、马鞍和衔铁，它们把一个强大但不可预测的动物引导到有用的方向。

你没有让马变聪明。你设计了让它的力量变得有用的装备。

**2\. 操作系统类比**

Image

Philipp Schmid 给出了最好的技术框架：

把它想成一台计算机。

→ **Model = CPU** （原始处理能力）

→ **Context window = RAM** （有限、易失的工作记忆）

→ **Harness = Operating System** （管理 CPU 在何时看到什么）

→ **Agent = 运行在上面的应用**

你的模型很强。

但如果没有操作系统来管理内存、调度任务、执行规则，它也只是一块芯片。

大多数人正在运行没有操作系统的应用。

这就是他们的 agent 在生产环境失败的原因。

**3\. 2026 年发生了什么变化**

Image

LangChain 用同一个模型在 Terminal Bench 2.0 上跑了两次。

同一个模型。不同的 harness。

→ 旧 harness：52.8% 分数

→ 新 harness：66.5% 分数

Vercel 走了相反方向。

他们移除了 agent 的 80% 工具。

结果呢？性能更好了。

没有变差。

2026 年一个让人不舒服的真相：

→ Agent 从来不是最难的部分。

→ Harness 才是。

如果 2025 年是 AI agent 证明自己能写代码的一年，

2026 年就是我们发现环境比模型更重要的一年。

## 第二部分：5 种 Harness 工件（Harness 在实践中长什么样）

**4\. AGENT.md / CLAUDE.md 文件**

Image

这是最通用的 harness 工件。

它们是分布在代码库各处的 Markdown 文件。

Agent 会在每次会话开始时读取它们，就像新工程师加入团队时读入职文档。

里面应该写什么：

→ 项目上下文

→ 编码约定

→ 架构决策

→ “我们在这里怎么做事”的指导

→ 当前正在推进的工作

OpenAI 称它们为 AGENT.md。

Anthropic 称它们为 CLAUDE.md。

Cursor 使用 .cursorrules。

名字不同。原则相同。

每个主要模块一个文件。随着项目演进持续更新。

没有它们，agent 每次会话都在盲跑。有了它们，agent 每次会话一开始就带着上下文。

**5\. JSON 功能列表（进度追踪器）**

Image

当一个 agent 跨多个会话构建完整应用时，每次会话开始都会拿到一个空的上下文窗口。

它怎么知道哪些已经完成？

靠一个 JSON 文件。

每个条目定义：

→ 一个功能

→ 如何验证它能工作

→ 通过 / 失败状态

Agent 在会话开始时读取它。选择优先级最高且仍然失败的功能。实现它。标记为通过。提交。重复。

为什么用 JSON，而不是 Markdown？

Anthropic 发现，agent 意外覆盖 JSON 的概率低于 Markdown。

小细节。在 6 小时自主运行里非常重要。

**6\. 会话初始化例程**

Image

每次会话都以同样的方式开始。

每一次。毫无例外。

Anthropic 的 7 步启动序列：

  1. 确认工作目录
  2. 阅读 git 日志和进度文件
  3. 检查功能列表，找到优先级最高的未完成项
  4. 启动开发服务器
  5. 运行基础端到端验证
  6. 实现一个功能
  7. 用描述性信息提交，并更新进度

没有这个：

Agent 会把前 20 分钟浪费在弄清楚已经存在什么。

每次会话都在重复造轮子。

有了它：

Agent 立刻带着上下文启动，直接进入工作。

**7\. Sprint 合约**

Image

在 agent 写下第一行代码之前：

两个 agent 先谈判。

Generator agent 提出：

→ 它要构建什么

→ 如何验证成功

Evaluator agent 审查：

→ 方案是否完整？

→ 成功标准是否清晰？

只有双方达成一致后，才开始实现。

这就是设计评审。

只是两个参与者都是 AI。

为什么这很重要？

在同一次处理中同时规划和执行的 agent，会产出不可靠结果。

规划步骤即使由 AI 完成，也会显著提升输出质量。

**8\. 结构化任务模板**

Image

在任何编码之前：

Harness 会分析真实代码库。

它生成一个基于实际代码库的影响地图：

→ 真实文件路径（不是幻觉出来的路径）

→ 真实存在的符号名

→ 应该遵循的现有模式

→ 具体验收标准

然后实现才开始。

这听起来很显然。

但大多数团队会跳过。

Agent 猜测文件结构。发明不存在的 API 端点。构建出和代码库不匹配的东西。

执行前先给扎实上下文，输出质量会大幅提升。

## 第三部分：三个阵营（三支团队撞上同一堵墙，又搭出了三种不同的梯子）

**9\. OpenAI：环境优先**

Image

OpenAI 的 Codex 团队遇到了一个离谱的问题。

100 万行生产代码。零手写。

在这种规模下，你不可能逐行 code review。

所以他们没有这么做。

相反：

他们把环境设计得足够彻底，让 agent 一开始就产出可评审的结果。

他们的方法：

→ 严格的依赖流（Types → Config → Repo → Service → Runtime → UI）

→ 遍布代码库的 AGENT.md 文件

→ Agent 直接接入 CI/CD 流水线

核心理念是：**先设计环境。再放手让 agent 工作。**

实际成果是：Sora Android 应用。4 位工程师。28 天。Play Store 排名第一。99.9% 无崩溃。

Codex 每周处理了内部 70% 的 pull request。

**10\. Anthropic：把执行者和评判者分开**

Image

Anthropic 遇到的是另一个问题。

当他们要求 agent 评价自己的输出时：

它会自信地称赞自己的工作。

即使在人类观察者看来，质量明显平庸。

自我评价行不通。

Agent 同时扮演学生和老师。

而且它给自己全 A。

他们的修复方案：**三个专门的 agent。**

→ **Planner** ，把两句话 prompt 转成完整产品规格

→ **Generator** ，一次一个 sprint 实现功能

→ **Evaluator** ，用浏览器自动化像真实用户一样测试运行中的应用

关键洞察：让一个独立 evaluator 保持怀疑，比让 generator 严厉批评自己的工作容易得多。

结果：单独 agent（无 harness）：9 美元，20 分钟

→ 破损应用

完整 harness：200 美元，6 小时

→ 带精致 UI 的可用软件

**11\. ThoughtWorks：2×2 框架**

Image

ThoughtWorks 从另一个角度切入这个问题。

他们不是在构建一个产品。

他们在观察 50 多个工程团队如何在同样的问题上失败。

他们的洞察：沿两个轴分类每一种 harness 控制。

**轴 1：**它什么时候运行？

→ Feedforward = agent 行动前（引导）

→ Feedback = agent 行动后（传感器）

**轴 2：**它如何工作？

→ Computational = 确定性、毫秒级（linter、类型检查器、测试套件）

→ Inferential = 使用 LLM、秒级（代码评审 agent、语义分析）

这个 2×2 是：

→ Computational Feedforward：类型系统、linter、架构规则

→ Computational Feedback：测试套件、覆盖率分析、变异测试

→ Inferential Feedforward：规格文档、约束描述

→ Inferential Feedback：LLM 代码评审器、行为验证器

单靠 feedforward 或 feedback 都不够。

两者都需要。

## 第四部分：所有阵营都同意的 5 个原则（三支团队没有协调，却独立走到了这里）

**12\. 原则 1：上下文胜过指令**

Image

OpenAI：“给地图，不要给 1000 页手册。”

Anthropic：JSON 功能列表和进度文件，让 agent 总知道自己在哪里。

Red Hat：生成任务前先分析真实代码库。

ThoughtWorks：“Feedforward。”

说法不同。发现相同。

把当前世界状态展示给 agent，持续胜过抽象地告诉它该做什么。

→ 扎根真实文件路径

→ 代码贴合代码库

→ 从模糊描述开始工作

→ 幻觉文件路径，发明 API

教训是：**在 agent 开始写任何东西之前，确保它准确知道自己在哪里。**

**13\. 原则 2：规划和执行必须分离**

Image

OpenAI：人类设计环境，agent 执行。

Anthropic：专门的 Planner agent 在 Generator 接触代码前运行。

ThoughtWorks：规划和实现之间必须有人类评审检查点。

Red Hat：阶段 1（影响地图）和阶段 2（实现）之间有硬门禁。

每个阵营都独立发现了这一点：

**让 agent 在同一次处理中同时规划和执行，会产出不可靠结果。**

规划步骤不一定要由人类完成。

但它必须是一个独立步骤，而且它的输出需要在实现开始前被审查。

**14\. 原则 3：反馈回路不可协商**

Image

OpenAI：agent 接入 CI/CD 和可观测性系统。

Anthropic：专门的 Evaluator agent 使用浏览器自动化。

ThoughtWorks：将其形式化为“传感器”。并警告说，只有 feedforward 的方法永远无法确认引导是否真的生效。

同一原则的三种实践：

→ OpenAI 使用自动化测试和 CI

→ Anthropic 使用另一个 LLM

→ ThoughtWorks 说两者都用，分层叠加

他们对谁来提供反馈有分歧。

他们对是否需要反馈没有分歧。

**没有反馈的 harness，只是一个绕了远路的 prompt。**

**15\. 原则 4：一次只做一件事**

Image

OpenAI：把目标拆成更小的构建块，深度优先推进。

Anthropic：强制每个 sprint 只做一个功能，每次之后提交。

ThoughtWorks：分阶段生命周期（集成前 → 集成后 → 持续监控）。

试图一次做太多的 agent：

→ 耗尽上下文

→ 失去连贯性

→ 悄悄漏掉需求

Anthropic 的例程：

阅读进度 → 选择一个功能 → 实现 → 提交 → 重复

强制增量主义，是所有成功 harness 的共性。

**16\. 原则 5：代码库就是文档**

Image

OpenAI：把 AGENT.md 文件嵌入仓库。

Anthropic：用功能列表、进度文件和 git 历史作为 agent 的连续性机制。

ThoughtWorks：衡量“harnessability”，也就是代码库对 agent 的可读性。

没有人为 agent 维护单独的知识库。

Repo 是唯一事实来源。

如果某个约定、约束或架构决策没有写进代码库，agent 就不会知道。

实际影响：

→ 投资代码组织的团队，会免费获得更好的 agent 性能。

→ 混乱 repo + AI agent = 规模化混乱。

## 第五部分：悖论，构建是为了删除（Harness Engineering 里最反直觉的真相）

**17\. Harness 衰减是真实存在的**

Image

当 Anthropic 从 Opus 4.5 升级到 Opus 4.6 时：

曾经必不可少的 sprint 拆解，变成了累赘。

模型规划能力提升后，它就多余了。

3 月还在承重的 harness 组件，4 月就成了开销。

然后 Opus 4.7 发布。

模型开始验证自己的输出。

Evaluator agent 的职责范围开始缩小。

这就是 **harness 衰减** 。

Harness 中的每个组件，都编码了一个关于“模型做不到什么”的假设。

随着模型进步，这些假设会过期，组件也会变成开销。

Opus 4.5：sprint 拆解 + 每个 sprint 评估

Opus 4.6：不做 sprint 拆解 + 单次评估（节省 38% 成本）

Opus 4.7：模型开始自我验证 → evaluator 角色进一步缩小

**18\. 构建是为了删除**

Image

Philipp Schmid 的建议：

**“构建是为了删除。”**

把每个 harness 组件都设计成可移除的。

定期关掉每个组件，测试输出质量是否变化。

如果没有变化：删除它。

Manus 在 6 个月里重构了 5 次 harness。LangChain 在 1 年里重组了 3 次。Vercel 移除了 80% 的工具，性能反而更好。

这些都不是糟糕工程的信号。

它们是在快速进步模型之上构建系统的自然结果。

携带已经失效的 harness 组件，会在每一次运行里消耗 token。没有额外质量。纯粹浪费。

**19\. 成本现实**

Image

Anthropic A/B 测试里的真实数字：

→ 单独 agent（无 harness）：9 美元，20 分钟

→ UI 看起来能用，但核心功能坏掉

→ 完整 harness（Opus 4.5）：200 美元，6 小时

→ 软件能工作，UI 精致，物理逻辑正确

这是 22 倍成本增加。

换来的是一个可运行产品，而不是只在截图里看起来正确的演示版。

这到底贵不贵，完全取决于一次破损发布会让你的团队付出什么代价。

但有件事几乎没人谈：

Harness + 模型的组合会演化。

一次模型升级后，200 美元的 harness 变成了 124 美元。

趋势线是：

→ 更好的模型 = 更简单的 harness = 更便宜的运行 = 更快的输出

2026 年胜出的工程师，不是在写最好的代码。

他们在设计最好的约束。

然后一旦这些约束不再值得保留，就愿意把它们丢掉。

## 结尾

Image

你刚学到的全部内容：

**Harness 是什么：**

→ 1. Agent = Model + Harness

→ 2. Model = CPU。Harness = Operating System。

→ 3. 同一个模型，更好的 harness = +13% 性能

**5 种 harness 工件：**

→ 4. CLAUDE.md / AGENT.md，agent 的 onboarding 文档

→ 5. JSON 功能列表，进度追踪器 + 测试套件合一

→ 6. 会话初始化例程，每次都走同一套 7 步启动

→ 7. Sprint 合约，agent 编码前先协商

→ 8. 结构化任务模板，真实文件路径，真实模式

**三个阵营：**

→ 9. OpenAI：设计环境，放手让 agent 工作

→ 10. Anthropic：把执行者和评判者分开

→ 11. ThoughtWorks：2×2 feedforward / feedback 框架

**5 个通用原则：**

→ 12. 上下文胜过指令

→ 13. 规划和执行必须分离

→ 14. 反馈回路不可协商

→ 15. 一次只做一件事

→ 16. 代码库就是文档

**悖论：**

→ 17. Harness 衰减，上个月有效的东西，这个月可能有害

→ 18. 构建是为了删除，测试并移除失效组件

→ 19. 成本现实，更好的模型 = 更简单的 harness = 更便宜的运行

2026 年胜出的工程师，不是在写最好的代码。

他们在设计最好的约束。

并且一旦这些约束不再值得保留，就愿意把它们丢掉。

如果这篇有用：

→ 转发给你网络里的开发者

→ 关注 @sairahul1，每周看更多类似内容

→ 收藏这篇，你会在 agent 开始不听话时回头参考

我写 AI、做产品，以及 2026 年真正有效的东西。

原文：https://x.com/sairahul1/status/2063544956158185927

## 参考阅读

  


  * [从 Harness 到动态工作流：Claude Code 多智能体任务编排的新范式](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565245&idx=1&sn=8eb02e3dd4aec584f75ec752c6919313&scene=21#wechat_redirect>)
  * [自我进化的 Agent Skill：微软 SkillOpt 到底解决了什么？](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565230&idx=1&sn=de72009ff180a0d1694f2b0c7d4d7260&scene=21#wechat_redirect>)
  * [Harness工程: C端 AIGC 内容生产自优化闭环实践](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565218&idx=1&sn=799c6fbe20a3ae9e92e08473863ce742&scene=21#wechat_redirect>)
  * [Claude Opus 4.8 发布：更强判断力、更长自主工作时间，Claude Code 迎来动态工作流](<https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565214&idx=1&sn=78807bb2aea9a01bd5cc17f2509d03d1&scene=21#wechat_redirect>)

如果你也在关注 AI 应用如何真正落地到生产环境，2026.6.26 - 6.27 GIAC 深圳站值得关注。这次大会会集中讨论智能应用开发、架构演进，以及来自一线实践的经验与案例。

  


识别二维码可申请大会体验门票，点击阅读原文了解大会详细议程。
