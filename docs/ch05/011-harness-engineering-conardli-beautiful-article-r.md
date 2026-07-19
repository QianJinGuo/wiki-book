# Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）

## Ch05.011 Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）

> 📊 Level ⭐⭐ | 25.9KB | `entities/harness-engineering-comprehensive-guide-conardli.md`

## 核心定义

**Harness Engineering** 是 AI 工程领域的第三次重心迁移，专注于如何在真实执行过程中持续监督、约束、纠正和验收模型行为。

LangChain 工程师给出的典型定义：

> * Agent = Model + Harness
> * Harness = Agent - Model

**核心公式理解**：Harness 是在 Agent 环境中除了模型外的所有东西，它决定了模型看到什么、能做什么、按什么规则做、做错了怎么纠偏，以及最后如何把能力稳定地交付出来。

## 三次工程重心的演进

AI 工程领域过去两年经历了三次重心迁移，层层递进而非替代：

| 阶段 | 核心问题 | 工程重点 |
|------|---------|---------|
| **Prompt Engineering** | 模型是否听得懂你在说什么？ | 优化指令表达 |
| **Context Engineering** | 模型是否拿到了足够且正确的信息？ | 优化信息供给 |
| **Harness Engineering** | 模型是否能在真实执行中持续做对？ | 优化运行控制系统 |

### Prompt Engineering 的本质

Prompt Engineering 的本质是**塑造局部概率空间**，而非"下命令"。核心方法包括角色设定、风格约束、Few-shot 示例、分步引导、格式约束和拒答边界。

**局限性**：Prompt 解决的是"表达问题"而非"信息问题"。当任务从开放问答进入真实业务，很多任务需要的不只是"说清楚"，而是"真的知道"。

### Context Engineering 的本质

Context Engineering 的核心假设是：**模型未必知道，系统必须在调用时把正确的信息送进去**。

Context 不是一堆附加文本，而是所有会影响模型当前决策的信息总和，通常包括：

- 当前用户输入、整个任务的历史对话
- 外部知识检索结果、工具调用返回
- 当前任务状态、工作记忆与中间产物
- 系统规则与安全约束、其他 Agent 传过来的结构化结果

**典型实践**：RAG（检索增强生成）和 Agent Skills（渐进式披露机制）。

**Skills 三层机制**：

- 元数据层（~50 Token）：技能名称、触发条件、功能概述
- 指令层（~500 Token）：标准作业流程（SOP）、输入输出规范
- 资源层（按需加载）：脚本、模板、API 文档

**局限性**：当模型开始连续行动时，Prompt 和 Context 都主要作用在"输入侧"，无法持续监督、约束和纠正执行过程。

## Harness 的六层架构

一个成熟的 Harness 包含六个核心部分：

### 第一层：上下文管理

让模型在正确的信息边界内思考，包括：

- **角色与目标定义**：明确模型身份、任务边界和成功标准
- **信息选择与裁剪**：把相关信息挑出，把不相关信息挡在外面
- **上下文结构化组织**：将上下文分层，降低模型"看漏重点"或"忘记约束"的概率

### 第二层：工具系统

工具让模型从"文本预测"进化到"做事的人"。Harness 解决的三个核心问题：

- **给模型什么工具**：围绕任务场景配置，写作 Agent 和安全分析 Agent 应有完全不同的工具集
- **什么时候调用工具**：引导模型判断是否需要外部信息、当前上下文是否足够
- **如何把工具结果重新喂回模型**：帮助模型提炼有效证据，保持结果与任务的关联性

### 第三层：执行编排

解决 Agent 不会"串起来"的问题。完整任务通常被拆解为：

1. 理解目标
2. 判断信息是否足够
3. 必要时获取外部信息
4. 基于结果继续分析
5. 生成输出
6. 检查输出是否满足要求
7. 不满足则修正或重试

成熟 Harness 具有明确的：步骤划分、决策节点、中间产物、终止条件和异常处理逻辑。

### 第四层：状态与记忆

没有状态的系统，每一轮都像失忆。状态管理需回答三个问题：

- **问题1**：当前任务进行到哪一步了？（已完成资料收集、正在撰写提纲等）
- **问题2**：哪些中间结果应该保留？（已确认的需求约束、重要结论等）
- **问题3**：哪些内容应该形成长期记忆？（用户偏好、稳定规则、长期项目背景等）

区分临时状态、会话记忆和长期偏好三者，系统才能越来越像靠谱的协作者。

### 第五层：评估与观测

解决"生成完了却不知道好不好"的问题，包括：

- 输出验收：是否满足任务要求
- 环境验证：是否真的可运行、可点击、可交互
- 自动测试：代码、接口、页面、文档格式等
- 过程观测：日志、指标、调用链、重试记录
- 质量归因：问题到底出在模型、上下文、工具还是流程设计

### 第六层：约束、校验与失败恢复

让系统从"能跑"走向"能上线"的关键：

1. **约束**：限制模型可做和不可做的事（哪些工具能用、哪些场景必须查证、哪些内容涉及安全边界）
2. **校验**：在输出前做检查（是否回答了用户问题、是否遗漏关键要求、是否满足格式规范）
3. **恢复**：当一步失败时分析错误原因、重试同一步、切换备用路径或回退到上一个稳定状态

## 头部公司实践

### Anthropic 的实践

**两个典型问题**：

- **上下文焦虑**：任务一长，上下文窗口越来越满，模型开始丢细节、丢重点
- **自评失真**：模型自己做完后自己评判，往往偏乐观

**实践一：Context Reset**

与 Context Compaction（压缩历史继续跑）不同，Context Reset 直接换一个干净上下文的新 Agent，通过工作交接实现"清空包袱、重新出发"的效果。

**实践二：引入评估者**

核心思路：**generator + evaluator**（后扩展为 planner + generator + evaluator），本质是**生产与验收必须分离**。

- Planner：把短需求扩展成完整产品规格
- Generator：逐步实现
- Evaluator：像 QA 一样，用浏览器和工具真实操作应用检查功能、设计、代码质量

Evaluator 不是"读代码打分"，而是"带环境的验证"。

### OpenAI 的实践

**核心理念**：人类不写代码，只设计环境。工程师核心工作变成三件事：

- 拆解意图：把产品目标拆成 Agent 能理解的小块任务
- 补全能力：Agent 失败时问"环境里缺了什么让它失败了"
- 建立反馈回路：让 Agent 能看到自己工作的结果

**渐进式披露**

AGENTS.md 只有 ~100 行充当"目录页"，指向仓库里的详细文档（ARCHITECTURE.md、docs/design-docs/、docs/exec-plans/ 等）。Agent 先看到目录，需要深入时再去查对应文档。

**让 Agent"看见"整个应用**

单次 Codex 运行经常连续工作 6 小时以上，Agent 自己跑应用、发现 bug、修复、验证、提 PR。

**把架构约束写进系统里**

把资深程序员的经验判断写成机器可以自动执行的检查规则，业务代码按固定分层组织（Types、Config、Repo、Service、Runtime、UI）。检查结果本身带着修复提示，可直接回到上下文里推动下一轮修改。

### LangChain 的实践

在底层模型完全不变的情况下，仅仅通过改造和迭代 Harness，就把自家代码智能体在 Terminal Bench 2.0 榜单上的得分从 52.8 拔高到了 66.5，直接从 Top 30 开外杀入 Top 5。

## 关键结论

**Harness 的意义**：把模型从一个会回答问题的概率机器，变成一个能稳定完成任务的工程系统。

决定 AI 产品上限的是模型；但决定 AI 产品能否落地、能否稳定交付的往往是 Harness。

**三层关系的通俗理解**（以客户拜访为例）：

- **Prompt Engineering**：把任务讲清楚（见面先寒暄，再介绍方案，再问需求，最后确认下一步）
- **Context Engineering**：把资料准备齐（客户背景、过往沟通记录、产品报价、竞品情况）
- **Harness Engineering**：建立持续观测、纠偏、验收的机制（带 checklist 去、关键节点实时回报、会后核对纪要、按明确标准验收）

## 相关实体

- [反向审计 prompt 范式 — 从 vb 50 行 codex 自我蒸馏到 5 行核心](../ch01/537-codex.html)
→ [第 1 来源 ConardLi Harness 综合性指南原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-engineering-comprehensive-guide-conardli.md)
→ [第 2 来源 ConardLi Beautiful Article Skill 原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/conardli-harness-practice-beautiful-article-reacticle-2026-06-18.md)

---

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-benchmarks-extended.md)
## 第 2 来源：Beautiful Article Skill 实证 + Reacticle 组件协议（2026-06-18）

**核心命题**：**好的 Harness 是可以迁移的**——把视频 Skill 的骨架（4 阶段 + 2 Checkpoint + 文件化记忆）原样搬到文章生成任务上（8 阶段 + 3 Checkpoint + 同样的文件化记忆）。

### 8 个 Phase 流程

```
Phase 0  Intake               判断是否进入本 Skill + 初步文章类型
 ▼
Phase 1  Source → Markdown    URL/PDF/DOCX/MD/文本 → source.md + extraction-notes.md
 ▼
Phase 2  Editorial Planning   一份 plan.md（Brief / Outline / Theme / Assets 四段）
 ▼
Phase 3  Plan Checkpoint      ★Checkpoint 1 必须停
 ▼
Phase 4  First Spread         首屏 + 第一节 + 一个代表性视觉块
    └ ★Checkpoint 2 必须停
 ▼
Phase 5  Full Article Build   生成完整网页文章
 ▼
Phase 6  Final Review         三视角终审
 ▼
Phase 7  Repair               最小切片修复
 ▼
Phase 8  Delivery             ★Checkpoint 3 必须停 → 交付 article.html
```

**vs 视频 Skill 4 阶段对比**：
- 阶段数 +1（Plan 和 First Spread 拆开）
- Checkpoint +1（First Spread 是新加的视觉气质控制点）

### Reacticle 组件协议（核心创新）

**一句话定位**：
- Markdown 让**人**轻松写文章
- Reacticle 让**AI 可控地生成长文 HTML**

**三个关键设计**：

1. **语义组件词汇表**——Article / Hero / Lead / Section / Subsection / Table / Quote / Formula / CodeBlock / Image / TOC / Conclusion。AI 只负责"组合"，结构和排版由库保证。

2. **Raw 自由层**——任意 HTML/SVG/CSS/React 都能塞进 Raw，但**硬约束**：Raw 里的样式必须消费主题 token → 给自由同时守住主题稳定性。

3. **主题双轨制**（CSS token + AI 读的 Markdown profile）——例：Tufte profile 说"不要用渐变、不要用阴影、图表要极简、正文是主角"；Sottsass profile 说"可以用撞色、可以用黑描边、可以有轻微旋转的元素、但不要太正经"。

**11 套编辑级主题**：Tufte / Sottsass / Bayer / Freddie 等。

### Reacticle vs Skill 关系

| 层 | 职责 | 类比 |
|---|---|---|
| **Reacticle** | 运行时协议 | 乐高积木，管"输出表面稳不稳" |
| **Beautiful Article Skill** | 方法论 + Harness | 拼装积木的说明书，管"整个生产过程稳不稳" |

### 三视角终审

| Reviewer | 维度 |
|---|---|
| **Editorial Reviewer** | 文章性、信息取舍、结构 |
| **Visual Reviewer** | 主题、Raw、配图、移动端 |
| **Technical Reviewer** | 构建、控制台、代码/公式、可访问性 |

**硬规则**：拿到质检结论后，**先修复，再汇报**。不能把"发现了什么问题"当成完成，真正完成的是"问题已经被修掉"。

### Harness 6 大核心（视频 vs 文章 Skill 对照）

| 核心 | 视频 Skill | 文章 Skill（Beautiful Article） |
|---|---|---|
| **上下文管理** | 启动时加载所有规范 | **渐进加载**：Phase 1 只看素材抽取；Phase 2 看 plan template；Phase 4/5 才读组件协议 + Raw 规范 + 主题 |
| **工具系统** | Agent 自带能力 | **统一工作区**：URL/PDF/DOCX/MD/文本 → source.md 一份；source/plan/review/article/sections/article/raw-blocks/ 固定结构 |
| **执行编排** | 4 阶段 + 2 Checkpoint | 8 阶段 + 3 Checkpoint；**铁律**：检查点禁止替用户做主 |
| **状态与记忆** | 文件化 | source.md + source.zh.md + extraction-notes.md + plan.md 是 Agent 工作记忆 |
| **评估与观测** | 独立 Reviewer | Plan 阶段主 Agent 自查 + First Spread/Final Review 独立 SubAgent |
| **约束与恢复** | 视频协议 | **Reacticle 组件协议**（Article/Section/Table/Quote/CodeBlock 承载；Raw 消费主题 token） |

**长会话关键**：每写一节前，Agent 都要回看当前 Section 的任务、组件协议、Raw 规范、主题约束。**靠文件把自己拉回正轨**，减少写到后面风格和规则偏移的问题。

### 工具系统的并行安全

完整文章可能有很多节，**多 Agent 并行写**：
- 每个 Agent 只负责一个 section 文件
- 大型 Raw 放到独立的 raw-blocks/
- Article.tsx 只交给主 Agent 组装和排序

这样多 Agent 可以同时工作，又不会一起改同一个文件。

### 执行编排的铁律

> 检查点禁止替用户做主。

每个决策项必须独立列出、独立等用户答复。可以推荐（"我推荐 Tufte 主题"），但不能说"已经替你选了 Tufte，不对告诉我"——**后者等于偷渡默认值**。

### 自进化机制

**所有关键质检审查和修复记录会落到本地文件**：
- `review/first-spread-review.md`
- `review/final-review.md`
- `review/repair-log.md`

这些文件不只给人看，**也给 Agent 看**。同类任务跑多了以后，Agent 可以回看记录分析哪些环节最容易出问题，反过来促使 Agent **优化 Skill 的规则、检查清单和默认策略**。**所以 Skill 会随着真实任务继续进化**。

### 一句话升华

> Harness 的价值：让 Agent 从"能做出一次效果"，变成"能稳定生产一类结果"。

> 做 Harness 也不一定要从零搭一个 Agent。把一个垂直任务用 Skill 做稳、做好，本身就是在做 Harness。

**可迁移的场景**：周报、播客 Shownotes、课程讲义、技术文档、产品发布页。**判断标准**：只要任务足够复杂，需要状态、流程、检查点和交付标准，这套骨架就有迁移价值。

### 与 wiki 既有内容的关系

- **与 [Harness Engineering 实体](ch05/052-harness-engineering.html)（290 行 5 source merged）**：Harness 理论 + 5 制品 + 3 阵营 + 5 原则；本 ConardLi 实践 = Harness 理论的**工程实现**
- **与 [古法程序员 spec 写作](../ch01/537-codex.html)（2026-05-25）**：古法程序员 = spec 写作的通用框架（rule/docs/skill 三类目录 + skill 三层 + gate 四态 + edge 三种）；Beautiful Article = skill 三层架构的**特化应用**（编排层 + 阶段层 Phase 0-8 + 原子层 component-policy/raw-policy）；Beautiful Article 的 gate = ConardLi 9 套 Checkpoint + 三视角终审

---

## 深度分析

**从"输入优化"到"过程控制"的第三次跃迁**：Prompt Engineering 优化的是单次概率分布（如何说得更清楚），Context Engineering 优化的是信息供给质量（给什么信息），而 Harness Engineering 优化的是执行过程本身——即使信息完整、指令清晰，模型在连续执行中仍可能偏离目标。这三次迁移的深层逻辑是：每解决一个问题，更深层的另一个问题就浮现为主要矛盾。当模型从"回答者"变成"执行者"，过程控制的难题就取代了表达和信息的问题。这是 AI 工程从"让它说对"到"让它做对"的必然进化路径。

**Context Reset vs. Context Compaction 的深层工程意义**：Anthropic 选择 Context Reset 而非 Compaction 来解决"上下文焦虑"，这个决策背后有深刻的工程直觉——Compaction 本质上是在同一个进程内做垃圾回收，内存泄漏可能依然存在；而 Reset 是彻底的新进程，物理清空了所有累积状态。对于某些模型（如 Claude Sonnet 4.5），压缩并不能真正解决认知负载问题，模型在潜意识里仍然"记得"自己接近了上下文的极限。这个现象类似于人类在接近记忆容量时的主观焦虑——不是信息丢失了，而是心理压力影响了后续表现。Context Reset 的设计哲学是：与其费力维持一个可能已经不健康的状态，不如干脆重启一个健康的新状态。

**Generator-Evaluator 分离的工程硬核性**：Anthropic 的 generator + evaluator 模式，本质上是在引入一个独立的验证层来解决"自我评估失真"问题。这个设计违背了直觉——人会认为"让模型自己做事再让模型自己打分是浪费"，但实际上分离的核心价值在于：evaluator 可以用不同于 generator 的优化目标、不同的上下文信息甚至不同的模型来执行评估。generator 优化的是"生成流畅性和任务完成度"，evaluator 优化的是"真实环境中的功能正确性"——这是两个本质上不同的目标。让同一个模型同时优化两个目标是造成自评失真的根本原因。OpenAI 的实践进一步印证了这一点：evaluator 必须"带环境验证"，而不仅是"读代码打分"。

**渐进式披露的认知科学基础**：OpenAI 的 AGENTS.md ~100 行"目录页"设计，本质上是在将 Skills 的渐进式披露机制应用到系统文档层面。这个设计有认知科学依据：人类工作记忆（working memory）的容量有限（Miller's Law ~7±2 个 chunk），模型的上下文窗口虽然更大，但注意力机制的"虚拟工作记忆"同样受限于有效编码容量。将完整信息一次性呈现给 Agent，会导致关键信息被次要信息稀释——这和人类面对大量信息时的"选择盲点"是同类问题。渐进式披露通过控制信息呈现的时机和粒度，让 Agent 始终在"当前最需要的信息边界"内工作，从而显著提升有效信息密度。

**Harness 的商业含义：从"模型竞赛"到"工程竞赛"**：LangChain 仅通过改变 Harness（不换模型）就将 Terminal Bench 得分从 52.8 提升到 66.5，这个数字的工程含义远超表面——它意味着在当前模型能力已经足够好的情况下（GPT-4 级别以上），决定实际任务完成率的不是模型本身，而是工程系统的完善程度。这个结论对 AI 产品投资决策有重大影响：当模型的边际改进成本极高时，Harness 工程的边际回报更高。这解释了为什么 2025 年头部公司的工程团队开始大量招募"Agent Engineer"——他们不需要训练模型，只需要把模型用好。

## 实践启示

1. **以"生产-验收分离"作为 Harness 设计的第一原则**：不要让模型在执行的同时承担自我评估的责任。在系统设计阶段就引入独立的 evaluator 模块（可以是另一个 Agent、规则引擎或人工审核流程），确保输出验收与过程执行解耦。对于高风险任务（金融、医疗、法律），evaluator 必须独立于 generator 运行，并配备真实环境验证能力（如实际操作页面、调用 API 检查返回值）。

2. **用 Context Reset 而非 Compaction 解决长任务状态问题**：当 Agent 需要处理超过约 20 轮交互的长任务时，优先考虑 Context Reset（交接给新 Agent）而非持续压缩历史上下文。Reset 的工程实现需要：清晰的任务交接协议（已完成状态 → 待处理状态 → 下一个 Agent 的启动上下文）、中间产物的持久化格式（非文本日志，而是结构化的状态对象）、交接边界的判断标准（不是轮数而是语义完整性）。

3. **把架构约束编码为可自动执行的检查规则**：不要依赖 Code Review 的人工记忆来维护代码分层规范，而应该将 Types/Config/Repo/Service/Runtime/UI 的分层规则编码为 CI 检查脚本。这些规则的价值不只是"报错"，而是要在报错时附带修复建议，直接注入到 Agent 的上下文中推动自动修复。这样才能在 Agent 高速提交的场景下保持代码质量——人工 Code Review 的带宽根本追不上 Agent 的产出速度。

4. **渐进式披露应作为所有 Agent 系统文档的默认格式**：无论是内部知识库、系统架构文档还是操作手册，都应该采用"目录 + 逐层展开"的结构，而非一次性呈现完整内容。具体实践：入口文档不超过 ~100 行，只包含指针（文件名、位置）和高层概述；详细内容按需加载，每次加载单元不超过 500 tokens；建立文档新鲜度监控机制，自动标记过期文档并触发更新流程。

5. **在 Agent 系统的指标建设中优先建立"执行过程可观测性"**：LangChain 的案例说明：Harness 的优化是数据驱动的。需要从第一天就埋点：单步执行成功率、步骤重试率、上下文溢出频率、evaluator 通过率、工具调用成功率等。这些指标不是为了"监控"，而是为了给 Harness 的迭代优化提供方向——哪个环节是瓶颈，哪个约束是过度限制，哪个步骤需要拆分，这些判断都依赖过程指标的持续积累。

---

**补充阅读**：

- [Agent Harness 与 Context Management：Working Set 管理](ch05/039-agent-harness.html)
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Context Engineering 三种记忆范式](https://github.com/QianJinGuo/wiki/blob/main/entities/context-engineering-three-memory-paradigms.md)

---

