# 一文带你弄懂 AI 圈爆火的新概念：Harness Engineering

## Ch05.006 一文带你弄懂 AI 圈爆火的新概念：Harness Engineering

> 📊 Level ⭐⭐ | 27.6KB | `entities/一文带你弄懂-ai-圈爆火的新概念harness-engineering.md`

# 一文带你弄懂 AI 圈爆火的新概念：Harness Engineering

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/一文带你弄懂-ai-圈爆火的新概念harness-engineering.md)

> 来源：code秘密花园 ConardLi。本文是 2026 年 Harness Engineering 中文科普里引用最广的一篇 — 同一模型、同一 Prompt，放在不同 Harness 里效果完全不同，决定差距的不是模型参数，而是模型外面那套运行控制系统。本文系统梳理「Prompt → Context → Harness」三次重心迁移，以及 Harness 的六层构成，最后给出 OpenAI/Anthropic 在真实产品中的工程实践。

## 摘要

ConardLi 在文章开篇讲了一个故事：朋友团队花了几个月调 Agent，换上最好的旗舰模型，提示词改了上百版，到了真实场景还是不稳定 — 时灵时不灵，效果差强人意。后来 ConardLi 帮忙调优，没动模型也没改提示词，而是重新设计了任务拆解、状态管理、校验机制和失败恢复的流程。新版上线后，同样的模型、同样的提示词，任务成功率从不到 70% 涨到了 95% 以上。

Harness Engineering 的核心命题由此而来：**当模型从「回答问题」走向「执行任务」，系统不能只负责喂信息，还必须负责驾驭过程**。

## 核心要点

### 1. 三次重心迁移

过去两年 AI 工程领域经历了三次重心迁移：

| 阶段 | 默认假设 | 解决的核心问题 |
| --- | --- | --- |
| Prompt Engineering | 模型本来就知道，只是你得问对 | 模型是否听得懂你在说什么？ |
| Context Engineering | 模型未必知道，所以系统必须把正确信息送进去 | 模型是否拿到了足够且正确的信息？ |
| Harness Engineering | 模型即便有信息和意图，也可能跑偏 | 模型是否能在真实执行中持续做对？ |

这三次迁移对应三个越来越本质的问题。理解它们，不只是在理解几个新名词，而是在理解 AI 系统如何一步步从「会聊天」走向「可交付」。

#### Prompt Engineering 的有效性与天花板

Prompt 之所以有效，是因为大模型本质上是对上下文极度敏感的概率生成系统：给它什么身份，它会沿那个分布采样；给它什么例子，它会沿那个模式补全；强调什么约束，它就更可能把那部分当成高权重信号。所以 Prompt Engineering 的本质不是「下命令」，而是「塑造局部概率空间」。

但 Prompt 的天花板很快出现：很多任务不是「你说清楚就行」，而是「你得真的知道」。

Prompt 擅长的是澄清任务、约束输出、激发已有能力。但它不擅长凭空补齐缺失知识、管理大量动态信息、处理长链条任务中的状态变化。说得更直接一点：**Prompt 解决的是「表达问题」，不是「信息问题」**。

#### Context Engineering 的兴起与典型实践

当 Agent 开始爆火，模型不再只回答问题，而是被放进真实执行环境：要持续多轮对话、调搜索/浏览器/代码/数据库，要在多步骤之间传递中间结果，要根据外部反馈修正计划，甚至要和其他 Agent 分工协作。这时系统面对的不再是「一次回答对不对」，而是「一整个任务链路能不能跑通」。

Context 不是一堆附加文本，而是**所有会影响模型当前决策的信息总和**。通常包括当前用户输入、整个任务历史对话、外部知识检索结果、工具调用返回、当前任务状态、工作记忆与中间产物、系统规则与安全约束、其他 Agent 传过来的结构化结果。

Context Engineering 早期最典型的代表是 RAG — 它第一次把「模型不知道怎么办」变成了工程上可落地的机制。真正成熟的 Context Engineering 关心的是整条链路：文档如何切块、检索结果如何排序、长文档如何压缩、历史对话何时保留原文/摘要、工具返回是否全部暴露、多 Agent 之间传原文还是结构化字段。

近期爆火的 Agent Skills 是 Context Engineering 的另一大典型实践。其核心机制（渐进式披露）的三层结构：

- 元数据层（~50 Token）：仅包含技能名称、触发条件、功能概述，启动时全局加载
- 指令层（~500 Token）：SOP、输入输出规范，仅在任务触发时加载
- 资源层（按需加载）：脚本、模板、API 文档等，仅在执行具体步骤时动态调用

#### Context Engineering 的局限性

Prompt 和 Context 都主要作用在「输入侧」 — Prompt 在优化意图表达，Context 在优化信息供给。真实世界的复杂任务还有一个更难的问题：**当模型开始连续行动时，谁来持续监督它、约束它、纠正它？**

于是第三次迁移开始发生 — Harness Engineering。

### 2. Harness 的三层语义

Harness 词源是「缰绳、马具、约束装置」。套到 AI 系统里它是一个非常直白的提醒：**当模型从「回答问题」走向「执行任务」，系统不能只负责喂信息，还必须负责驾驭过程**。

通俗一点的对照：「假设你要让一个新人完成一次重要客户拜访」：

| 层级 | 关注点 | 客户拜访类比 |
| --- | --- | --- |
| Prompt Engineering | 把任务讲清楚 | 先寒暄，再介绍方案，再问需求 |
| Context Engineering | 把资料准备齐 | 客户背景、过往沟通、报价、竞品、会议目标 |
| Harness Engineering | 让执行可观测、可纠偏、可验收 | 带 checklist 实时回报、会后核对纪与录音、按明确标准验收 |

#### 三者的关系

很多人看到新词出现就以为旧词过时了 — 恰恰相反，它们是层层递进：

- **Prompt** 是对「提示词」的工程化
- **Context** 是对「输入环境」的工程化
- **Harness** 是对「整个运行控制系统」的工程化

边界一层比一层大，所以后者天然包含前者。当任务简单时 Prompt 就够了；当任务复杂到上下文不够用时 Context 成为核心；当任务变成需要持续执行、长链路、低容错时 Harness 几乎不可避免。

### 3. Harness 的六层构成

LangChain 给出的经典定义是 **Agent = Model + Harness**，**Harness = Agent - Model**。换句话说，Harness 是 Agent 环境中除了模型外的所有东西 — 它决定了模型看到什么、能做什么、按什么规则做、做错了怎么纠偏，以及最后如何把能力稳定地交付出来。

一个成熟的 Harness 通常至少包含六层核心部分：

| 层级 | 名称 | 关键问题 |
| --- | --- | --- |
| 第一层 | 上下文管理 | 模型在正确的信息边界内思考 |
| 第二层 | 工具系统 | 给模型什么工具 / 何时调用 / 结果如何重新喂回 |
| 第三层 | 执行编排 | 步骤划分、决策节点、中间产物、终止条件、异常处理 |
| 第四层 | 状态与记忆 | 当前任务进行到哪一步 / 哪些中间结果保留 / 哪些形成长期记忆 |
| 第五层 | 评估与观测 | 输出验收、环境验证、自动测试、过程观测、质量归因 |
| 第六层 | 约束、校验与失败恢复 | 限制可做与不可做、输出前检查、失败分析重试或回退 |

#### 第一层：上下文管理

大量任务里大模型能力的差异并不在于它本身的「智商」，而是来自它看到了什么信息。一个模型再强，如果上下文是乱的、缺的、过载的，它也很难稳定发挥。

具体包括三件事：角色与目标定义（把任务边界明确灌给模型）、信息选择与裁剪（挑出相关、挡掉不相关）、上下文的结构化组织（按层次组织降低「看漏重点」或「忘记约束」的概率）。

#### 第二层：工具系统

工具太少能力不够；工具太多模型容易乱用。所以工具设计不是「越全越好」，而是要围绕任务场景来配置 — 写作 Agent 和安全分析 Agent 应该拥有完全不同的工具集。

比「有什么工具」更重要的是「什么时候调用工具」：这个问题是否需要外部信息？当前上下文是否足够？这一步更适合搜索、读取、计算，还是直接作答？

工具不是一调用就结束，真正关键的是**返回结果如何被理解、筛选、吸收，再进入下一步决策**。例如搜索到了十条结果，不应该原封不动塞回去。Harness 需要帮助模型提炼有效证据，保持结果与任务的关联性。

#### 第三层：执行编排

很多失败的 Agent，不是因为不会某一步，而是因为不会「串起来」 — 它可能会搜索、总结、写代码，但整个过程像想到哪做到哪，最后输出一堆半成品。执行编排要解决的就是这个问题。

一个完整任务通常会被拆成这样的流程：理解目标 → 判断信息是否足够 → 必要时获取外部信息 → 基于结果继续分析 → 生成输出 → 检查输出是否满足要求 → 不满足则修正或重试。

成熟 Harness 往往不仅是「能调工具」，而是具有明确的：步骤划分、决策节点、中间产物、终止条件、异常处理逻辑。

#### 第四层：状态与记忆

没有状态的系统，每一轮都像失忆。Harness 的状态管理要回答三个问题：

1. **当前任务进行到哪一步了**（已完成资料收集 / 正在撰写提纲 / 待校验 / 工具调用失败待重试）
2. **哪些中间结果应该保留**（已确认的需求约束、重要结论、已筛选的资料、已完成的子任务）
3. **哪些内容应该形成长期记忆**（用户偏好、稳定规则、长期项目背景）

把临时状态、会话记忆、长期偏好三者混在一起系统就会越来越乱；分得清，Agent 才会越来越像一个靠谱的协作者。

#### 第五层：评估与观测

很多系统的问题不是「生成不出来」，而是「生成完了却不知道好不好」。这一层通常包括：

- **输出验收**：是否满足任务要求
- **环境验证**：是否真的可运行、可点击、可交互
- **自动测试**：代码、接口、页面、文档格式等
- **过程观测**：日志、指标、调用链、重试记录
- **质量归因**：问题出在模型、上下文、工具还是流程设计

#### 第六层：约束、校验与失败恢复

真正让系统从「能跑」走向「能上线」的，往往不是主流程，而是异常流程。真实环境里失败才是常态：搜索结果不准、API 超时、文档格式混乱、模型误解指令、输出不符合约束、工具权限不足。

这一层包括：

- **约束**：限制模型可做与不可做的事（哪些工具能用 / 哪些场景必须查证 / 哪些内容涉及安全边界）
- **校验**：输出前做检查（是否回答了用户问题 / 是否遗漏关键要求 / 是否满足格式规范）
- **恢复**：失败时分析错误原因，重试同一步、切换备用路径、回退到上一个稳定状态

这部分最像传统软件工程里的「鲁棒性设计」。

### 4. 三家头部公司的实践

#### OpenAI：Harness engineering: leveraging Codex in an agent-first world

依靠一个仅有几名人类工程师的团队，利用 Codex 智能体从零开始构建了一个超百万行代码的生产级应用。从业务逻辑、CI/CD 配置、可观测性堆栈到内部文档，100% 由智能体编写，耗时仅为人工开发的 1/10。

#### Anthropic：Harness design for long-running application development

构建了一个长程自主编码系统。仅凭一句自然语言需求，Claude 就能在无需人类干预的情况下，连续运行数小时，端到端地交付包含关卡编辑器、物理引擎的 2D 游戏制作工具、能在浏览器里跑起来的数字音频工作站。

#### LangChain：Improving Deep Agents with harness engineering

在底层模型完全不变的情况下，仅通过改造和迭代 Harness，就把自家代码智能体在 Terminal Bench 2.0 榜单上的得分从 52.8 拔高到了 66.5，直接从 Top 30 开外杀入 Top 5。

### 5. Anthropic 的两条核心实践

**两个典型失败模式：**

- 上下文焦虑：任务一长，上下文窗口越来越满，模型开始丢细节、丢重点；接近上下文窗口极限时，模型会「焦虑」地想赶紧收尾。
- 自评失真：模型自己做完之后再让它自己评判，它往往会偏乐观，尤其在设计、体验、产品完整度这类没有绝对二元答案的问题上。

**实践一：上下文重置（Context Reset）而不是压缩（Compaction）。**

| 模式 | 行为 | 效果 |
| --- | --- | --- |
| Compaction | 同一个 Agent，历史变短 | 「心理状态」延续 |
| Reset | 干净上下文的新 Agent + 工作交接 | 「清空包袱、重新出发」 |

Anthropic 发现对某些模型（如 Claude Sonnet 4.5）仅靠压缩并不能解决上下文焦虑；真正的 Reset 才能给模型重新出发的效果。

**实践二：引入评估者（generator + evaluator）。** 让模型评估自己产出的质量时，它往往会「自信地夸自己」，即便结果在真人看来很一般。所以他们采用了一个很典型、也很有效的 Harness 手法：把「干活的人」和「打分的人」拆开。

扩展后是 planner + generator + evaluator。Evaluator 不是「读代码打分」，而是会实际操作页面、跑交互、看结果 — 这是「带环境的验证」。

### 6. OpenAI 的四条核心实践

**重新定义「工程师」。** 团队从第一天起定了铁律：人类不写代码，只设计环境。

工程师的三件事：拆解意图（把产品目标拆成 Agent 能理解的小块任务）、补全能力（Agent 失败时不是「再试一次」而是问「环境里缺了什么让它失败了」然后补上）、建立反馈回路（让 Agent 能看到自己工作的结果）。

**渐进式披露。** 早期他们犯了一个经典错误 — 写了一个巨大的 AGENTS.md，把所有规范、架构、约定一股脑塞进去，结果 Agent 反而更迷糊。

最终方案：AGENTS.md 只有 ~100 行，充当「目录页」，指向仓库里的详细文档。

```
AGENTS.md            ← 入口，只有指针
ARCHITECTURE.md      ← 架构总览
docs/
├── design-docs/     ← 设计文档（带验证状态）
├── exec-plans/      ← 执行计划（活跃/已完成/技术债务）
├── product-specs/   ← 产品规格
├── references/      ← 第三方参考
├── QUALITY_SCORE.md ← 各模块质量评分
└── SECURITY.md
```

这就是 Skill 的核心机制 — 渐进式披露。Agent 先看到目录，需要深入时再去查对应文档。还有一个专门的「文档园丁」Agent 定期扫描过时文档并提 PR 修复。

**让 Agent「看见」整个应用。** 单次 Codex 运行经常连续工作 6 小时以上，通常是在人类睡觉的时候。Agent 自己跑应用、发现 bug、修复、验证、提 PR，一条龙。

**把架构约束写进系统里。** 人类 Code Review 的带宽跟不上 Agent 的产出速度（每人每天 3.5 个 PR）。他们不是指望工程师反复提醒「这一层不该依赖那一层」，而是把经验直接写进工程系统。

OpenAI 把业务代码按固定分层组织（Types / Config / Repo / Service / Runtime / UI）。检查结果本身带着修复提示，可以直接回到上下文里推动下一轮修改。

他们还会定期运行后台 Agent 持续扫描代码库：检查哪些模块正在变乱、给不同区域打质量分、找出值得重构的部分、直接提交修复或重构 PR。

### 7. 异途同归

如果把前面的案例重新放回 Harness 的框架里，会发现一件很有意思的事：OpenAI、Anthropic 看起来路径不同、做法也不一样，但本质上都在补同一套东西：

- 模型到底应该看到什么
- 模型到底能做什么
- 模型下一步该做什么
- 系统如何保持连续工作
- 系统怎么知道自己做得对不对
- 系统出错后怎么拉回来

Anthropic 在补强上下文管理、执行编排、评估与观测；OpenAI 在补强上下文管理、工具系统、评估与观测、约束与恢复。

## 深度分析

### 为什么同一个模型、不同 Harness 效果天差地别

LangChain 的 Terminal Bench 2.0 案例最能说明问题：底层模型完全不变，仅通过改造 Harness，分数从 52.8 拔到 66.5。

这背后的工程含义是：**模型能力是基线，Harness 是放大器**。同样的基线配上不同的放大器，能稳定交付的结果完全不同。

具体机制可以从六层逐一看：

- **上下文管理**：决定模型在哪个信息子集里思考。信息过少 → 失准；过多 → 噪声淹没。Skill 的渐进式披露、AGENTS.md 的目录化都是同一思路的不同实现。
- **工具系统**：决定模型能做什么。工具的「该用什么 / 何时调用 / 结果如何处理」是放大系数最高的三件事。
- **执行编排**：决定模型如何把单步能力串成任务。一个 30 步的任务由 30 个独立 step 拼接 vs 由一个清晰的状态机驱动，结果完全不同。
- **状态与记忆**：决定模型能否在长链路里不掉链子。Context Reset vs Context Compaction 就是这条差异的具象化。
- **评估与观测**：决定「做得好不好」这件事由谁来判断。generator + evaluator 拆分是工业级做法。
- **约束与恢复**：决定失败时模型能不能被拉回来。这是把 Agent 从 demo 推进生产的最后一道门槛。

### 「渐进式披露」作为通用原则

OpenAI 把 AGENTS.md 写成 ~100 行的目录页、Skill 的三层元数据/指令/资源结构、Anthropic 的 Context Reset — 这些看似不同的实践，背后其实是同一个原则：**别让模型从一开始就看到全部能力和全部信息，而是只在需要的时候暴露与当前任务最相关的那一部分**。

这条原则可以推广到任何受注意力约束的系统。把它写成更通用的形式：

1. **入口要小且稳定**：AGENTS.md、系统提示词、任务说明 — 任何「启动时全局可见」的信息要短、要准、要可索引。
2. **细节按需加载**：模块文档、API 规范、领域规则 — 在模型请求时按相关性暴露。
3. **执行结果可回写**：成功路径、失败教训、上下文增量 — 让下次同类任务发生时 Agent 不是在猜，而是在走团队已经走过的路径。

### 「评估与生产分离」是工业级 Harness 的标志

Anthropic 的 planner + generator + evaluator 三段式最值得借鉴的不是「三段」本身，而是背后那个朴素但硬核的工程原则 — **生产与验收必须分离**。

这条原则在传统软件工程里对应「开发 vs QA」「CI 流水线」「Code Review」；在 Agent 时代它对应「Generator vs Evaluator」。Evaluator 越独立、越能带环境验证（实际操作页面、跑交互、看结果），系统就越能形成「生成 → 检查 → 修复」的工程循环。

### 「修复方案不是更努力，是补结构性能力」

OpenAI 那条铁律特别值得抄下来：「当出了问题，修复方案几乎从来不是『更努力』，而是『缺了什么结构性的能力』。」

这条思路把 Agent 调优从「换更大的模型/换更好的 prompt」转向「补环境里的结构性缺口」 — 工具不够就补工具、上下文不对就修上下文、验证不到位就加 evaluator。把调试视角从「猜模型为什么出错」转向「看系统缺了什么能力」，是 Harness Engineering 在方法论层面对传统 ML Ops 的最大升级。

### Harness 不是新瓶装旧酒

文章结尾的回答很直接：Harness Engineering 不是一个新瓶装旧酒的概念。它更像是一个信号：**AI 落地的核心挑战，正在从「让模型显得聪明」，转向「让模型在真实世界里稳定工作」**。

未来 AI 工程的竞争，未必只是「谁接入了更强的模型」，而更可能是谁更早建立起一套成熟的运行系统：它知道该给模型看什么、允许模型做什么、要求模型如何验收结果，又在失败时如何把它拉回正轨。

## 实践启示

1. **先用「Harness = Agent - Model」做诊断**。同一个模型在不同 Harness 里表现差距巨大，先把 Agent 拆成「模型 + Harness」两部分，分别评估贡献 — 大多数时候改动 Harness 的 ROI 高于换模型。

2. **按六层逐项体检自己的 Agent**。上下文管理 / 工具系统 / 执行编排 / 状态与记忆 / 评估与观测 / 约束与恢复 — 缺哪一层就先补哪一层。补 evaluator 通常 ROI 最高。

3. **把大文档拆成 AGENTS.md + 详细模块**。目录页 < 100 行，详细文档按需加载。CI 自动校验文档新鲜度和交叉引用。

4. **Evaluator 必须能带环境验证**。能实际操作页面、跑交互、看结果，不是「读代码打分」。这是把评估与生产分离的关键。

5. **Anthropic 的 Context Reset 值得抄**。当 Agent 出现「上下文焦虑」时，干净上下文的新 Agent + 工作交接，比压缩历史更有效。

6. **把架构约束写进系统**。Code Review 带宽跟不上 Agent 产出速度（每人每天 3.5 个 PR）时，把分层、依赖、规范变成 CI 检查项，让规则反复执行。

7. **失败时问「环境缺了什么」，而不是「模型哪里错了」**。这条思路是 Harness 调优的核心方法论 — 把调试视角从模型转向系统。

8. **关注可验证性等级**。先做输出可静态校验、可编译可测试的任务（L1-L2），验证体系搭起来后，再往涉及业务规则、状态变更的 L3-L4 推进。L5-L6 任务保持人主导。

## 相关实体

- [Karpathy Vibe Coding Agentic Engineering](ch04/123-karpathy-vibe-coding-agentic-engineering.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch03/044-agent.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](ch11/209-openclaw.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch03/044-agent.md)
- [两万字详解Claude Code源码核心机制](ch03/074-claude-code.md)
- [Agent Harness Context Management Working Set](ch03/044-agent.md)
- [Agent Harness Engineering Survey 2026](ch03/044-agent.md)
- [Agent Harness Architecture](ch03/044-agent.md)
- [Harness Engineering Framework](ch05/061-harness-engineering.md)
- [Harness Engineering 7 Layers Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-7-layers-framework.md)
- [Harness Context Window Management](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-context-window-management.md)
- [Harness Tool Design Evolution](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-tool-design-evolution.md)
- [Harness Loop Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-loop-architecture.md)
- [Harness As Product Surface](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-as-product-surface.md)
- [Harness Long Running Task](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-long-running-task.md)
- [Context Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md)
- [Agentic Harness Engineering Ahe](ch03/044-agent.md)
- [Coding Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/coding-harness-engineering.md)
- [Ahe Agentic Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/ahe-agentic-harness-engineering.md)
- [Evaluation Harness Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md)
- [Harness Gate Evaluation](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-gate-evaluation.md)
- [harness engineering 的未来——什么会消失，什么不会](ch05/061-harness-engineering.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-engineering-guide.md)

---

