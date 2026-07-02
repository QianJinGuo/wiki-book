# Fable 5 的信号:Agent 开始拼 Runtime — 架构师若飞的 Runtime Contract 工程化拆解

## Ch04.066 Fable 5 的信号:Agent 开始拼 Runtime — 架构师若飞的 Runtime Contract 工程化拆解

> 📊 Level ⭐⭐ | 20.9KB | `entities/claude-fable-5-agent-runtime-contract-ruofei-2026.md`

# Fable 5 的信号：Agent 开始拼 Runtime — 架构师若飞的 Runtime Contract 工程化拆解

> [!quote] 核心命题
> Agent 产品接下来拼的,**不只是模型多强,还包括谁能把任务协议、工具路由、状态管理、验证闭环和治理边界做成稳定的运行时**。Runtime 是一套**运行协议**而非提示词技巧:任务怎么交代、工具怎么路由、状态怎么保存、产物怎么验证、风险怎么降级、什么时候把人拉回来。

2026-06-14 22:46,架构师 JiaGouX 公众号(若飞)在 Claude Fable 5 提示词泄漏(CL4R1T4S 1585 行)+ Anthropic 2026-06-12 因美国政府指令暂停 Fable 5/Mythos 5 访问 这一连串事件后,发表了**标志性的"Agent 拼 Runtime"工程拆解**。文章主轴不是事件本身,而是借势提问:**强模型开始接长任务后,系统到底要补哪一层?**

## 核心概念 1:Runtime ≠ 模型背后的基础设施

> Runtime 不只是模型背后的基础设施。它更像一套 **Agent 运行协议**。

**6 个 Runtime 必须回答的问题**:

- 任务怎么交代
- 工具怎么路由
- 状态怎么保存
- 产物怎么验证
- 风险怎么降级
- 什么时候需要把人拉回来

**这与模型能力并列,但分属不同层**。文章用一张图把主线收住(图 1:**Agent Runtime 四层**)——本文没有截图,但根据前后文,四层即: **任务协议层 / 能力路由层 / 执行状态层 / 治理层**。

## 核心概念 2:Runtime Contract 而非 Prompt

**Fable 5 提示词的真正突破**是它在定义 **Agent Runtime 的运行契约**,而非简单的"让模型表现更好"。

**契约的 9 类内容** (来自原文):

- **Artifact 跨会话存储** — window.storage 怎么用
- **MCP App 路由** — 什么时候查 registry,什么时候建议连接器
- **计算机使用环境** — 哪些目录是用户上传,哪些目录是最终输出
- **Skill 触发** — 创建文件或运行代码前必须先读相关 SKILL.md
- **搜索工具** — 什么时候需要用
- **引用与版权合规** — 怎么引用才合规
- **交付呈现** — present_files 什么时候调用
- **工具 schema** — web_search / web_fetch / bash_tool / create_file / str_replace 等
- **Claudeception** — Artifact 里再调用 Anthropic API

**契约与提示词的本质区别** (原文):

| 维度 | 提示词 | Runtime Contract |
|------|--------|-----------------|
| **目标** | 让模型表现更好 | 定义 Agent 怎么运行 |
| **读者** | 模型 | 模型 + 系统 + 团队 |
| **维护方** | 模型团队 | 团队 + 系统共同维护 |
| **违反后果** | 表现差 | 系统不可用 / 失控 / 越权 |
| **范围** | 单次调用 | 整个运行生命周期 |

> **Prompt 是合同文本,合同能不能执行,还要看模型能力、工具实现、权限系统、上下文管理、验证流程和产品交互。**

## 核心概念 3:Task Brief 9 字段模板

**Mike Krieger / Every 团队**给出的 Fable 5 prompt library 核心是 **任务简报** 而非文案技巧。

**为什么需要结构化 Task Brief**? **长任务 Agent 常见的问题,往往不在第一步,而在中途: 它不知道什么叫"完成"**。它可能停在计划上,做了一堆额外整理,遇到小阻塞就回头问人。

**9 字段可执行模板**:

| 字段 | 写清什么 |
|------|---------|
| **背景** | 哪个项目、哪个阶段、为什么现在做 |
| **目标** | 产出什么,不产出什么 |
| **Done means** | 什么证据能说明完成 |
| **上下文包** | repo、文档、接口、历史决策、账号、测试数据 |
| **权限边界** | 能读什么、能改什么、不能碰什么 |
| **验证方式** | 单测、构建、截图、日志、真实流程、人工复核点 |
| **阻塞处理** | 哪些用假设继续,哪些需要停下来问 |
| **交付物** | 补丁、报告、文档、PR、截图、运行记录 |
| **降级策略** | 模型被拒 / 工具不可用 / 成本过高 / 访问不可用 时怎么办 |

> **对长任务来说,边界比热情更重要。**

## 核心概念 4:能力路由 8 维度

**没有路由层,工具越多,Agent 越容易乱**。

**8 个路由判断维度**:

- 什么时候用内置工具
- 什么时候查外部网页
- 什么时候用 MCP
- 什么时候需要让用户授权
- 什么时候读 Skill
- 什么时候开子代理
- 什么时候生成 Artifact
- 什么时候只回答,不动文件

**Fable 5 提示词里的 5 个具体路由思想**:

- **MCP**: 先发现 → 再建议 → 再等待用户选择(不能跳过授权)
- **Skills**: 不是知识库摆设,创建文件和运行代码前**必须**先读相关 Skill
- **搜索**: 不是最后补救,遇到新实体**主动**搜索
- **交付文件**: 放到可见输出区,不是聊天里贴完就算
- **Artifact**: 绑定存储 + 模型 API,形成更复杂工作流

**典型案例**(原文): 用户问"为什么构建失败" — 读 README / 搜报错 / 跑测试 / 查 CI / 看 commit / 开浏览器 / 问环境变量 → **哪个先做?哪个只读?哪个会改状态?搜索和本地日志冲突信谁?** → **这些是 Runtime 路由要给的优先级,不是模型智商能单独解决的问题**。

## 核心概念 5:执行状态 — 账本而非聊天记录

**长任务 Agent 不能只靠聊天记录记住自己做过什么**。

**5 类状态账本**(原文):

- memory (跨会话长期记忆)
- Artifact storage (窗口内结构化存储)
- 文/文件账本
- 工具调用历史
- **进度声明必须回到本轮工具结果校验** (Anthropic 官方建议)

**Anthropic 官方 prompting 文档的具体建议**:

- 给 Fable 5 **任务原因**,而不只是请求
- 长任务汇报进度前,要把每个进度声明**回到本轮工具结果**上检查
- 深度长会话里,模型偶尔会提前停止或把计划当成结果,所以需要明确"**能行动时就行动,完成或确实阻塞再结束**"

## 核心概念 6:长任务适配判断表

| 任务特征 | 是否适合长任务 Agent |
|---------|------------------|
| 只需要一句问答 | ❌ 不适合,用便宜模型或普通搜索 |
| 输入清楚、输出短、风险低 | ❌ 不一定适合,先用普通模型 |
| 多阶段、跨文件、需要工具 | ✅ 适合试 |
| 有明确 Done means | ✅ 适合试 |
| 能提供验证证据 | ✅ 适合试 |
| 失败成本高但可回滚 | ⚠️ 适合,但要沙箱和人工复核 |
| 涉及生产、资金、权限、敏感数据 | ⚠️ 谨慎,先把治理层补齐 |
| 供应商不可用会中断业务 | ⚠️ 需要准备 fallback |

> **长任务 Agent 更适合先用在"人也需要坐下来认真做"的任务上。**

## 核心概念 7:设计对象变了 — 8 维度 Runtime 清单

**过去我们设计 Agent 系统,常常先问**: 用哪个模型 / prompt 怎么写 / 要不要 RAG / 接哪些工具 / 做不做 memory

**这些问题仍然重要,但不够了**。**如果 Agent 要进入真实团队,我们还要问另一组问题**:

- 任务协议是否统一
- 工具路由是否可控
- 状态是否可接手
- 产物是否能验证
- 权限是否可审计
- 成本是否可解释
- 拒答和降级是否有预案
- 模型供应商不可用时,业务会不会停

> **放在一起看,这就是 Agent Runtime 的架构问题。**

## 核心洞察:Prompt 可复制 vs Prompt 难复制

**可复制的"表层协议"** (放到别的模型上也有帮助):

- 遇到新信息先搜索
- 做文件任务先读 Skill
- 交付物要放到用户可见的位置
- 长任务要留下进度、绕过项和证据
- 第三方连接器要让用户授权
- 进度声明要能回到工具结果

**难复制的 4 件事**:

- 模型权重里学到的推理能力
- 训练数据里覆盖过的工具使用模式
- 产品侧真实存在的工具、文件系统、存储和权限
- 长任务运行中对成本、安全、拒答、降级的工程处理

> **如果期待把一段提示词贴到老模型前面,就得到同等级的长任务能力,这个预期需要先收一收。**

## 与现有实体的交叉对比

**Fable 5 主题簇**(本文与 4 个现有 entity 全部为新视角):

- vs **[Anthropic Claude Fable 5 on AWS:Mythos 级功能](ch01/380-claude.md)** — 那是**AWS 官方产品介绍**(功能/部署/内置保护),本文是**架构师工程化拆解**(Runtime 协议层)。两者互补。
- vs **[Claude Fable 5 and new AI safety fables](ch01/677-claude-fable-5-and-new-ai-safety-fables.md)** — Nathan Lambert 的**政策分析**(数据保留/prompt 过滤/用户未告知模型修改),本文**不**涉及政策。
- vs **[Claude Fable 5 — Mollick patron vs wizard](ch01/380-claude.md)** — Mollick 的**hands-on 用户体验视角**(4 用例 + patron vs wizard 框架),本文是**架构师工程视角**。两者对应"产品体验"vs"产品架构"。
- vs **[Claude Fable 5 提示词泄漏 — Runtime Control Plane 安全工程启示](ch01/380-claude.md)** — 同样用"Runtime"概念,但**VibeCoder 重点在安全工程** (Prompt 不能当保险箱 / 攻击面像系统 / 分类器组合风险),**本文重点在工程协议** (Task Brief / 能力路由 / 状态账本 / 治理层)。两者**完全互补**: 一个看 Runtime 怎么被攻击,一个看 Runtime 怎么被设计。

**若飞同系列延伸**(本文是若飞"Agent 治理"的 Runtime 工程化主轴):

- vs **[若飞 5 张卡治理 (Hermes)](ch03/044-agent.md)** — 若飞把 Hermes Agent 长跑治理拆为 5 张卡,**侧重"治理框架"**;本文把 Fable 5 Runtime 拆为 9+8+5+8 维度,**侧重"运行时契约"**。两者是**"治理框架 vs 运行时协议"** 同主题不同切面。
- vs **[若飞 long-running agent ralph loop 状态交接](ch03/044-agent.md)** — 那是 **Ralph loop 状态交接**具体工程模式;本文是 **Runtime 协议**宏观框架。
- vs **[Claude Code agent teams task decomposition ruofei](ch03/074-claude-code.md)** — 那是**任务分解**(具体执行);本文是**任务协议** (前置契约)。
- vs **[Harness Engineering Deletable Worksite](ch05/073-harness-engineering-deletable-worksite-ruofei.md)** — 那是 **Harness 可删工作位**的精简原则;本文是 **Runtime 4 层**(包含 Harness 作为"工具路由层"的子集)。
- vs **[若飞 agent memory architecture](ch03/044-agent.md)** — 那是 **Memory 架构**;本文**执行状态账本** 5 类中包含 memory。

**Runtime / Agent 架构** 主题簇:

- vs **[dangling 已删除]** — 那个 entity 把 Harness 推为新后端;**本文**把 **Runtime 协议** 推为新运行时,Runtime ⊃ Harness
- vs **[Harness Engineering Framework](ch05/061-harness-engineering.md)** — Runtime Contract 是 **Harness 的契约形式**;后者是工程化框架
- vs **[纳德拉「Token 资本」论](ch04/150-ai.md)** — 纳德拉说"私有评估 / 私有 RL / 知识库" = 企业学习闭环;**本文**说"任务 Brief / 状态账本 / 证据目录 / 工具路由 / 权限清单 / 成本阈值 / fallback 预案" = Agent Runtime 闭环。两者**哲学同源**(从"模型强不强"走向"系统稳不稳"),**应用层不同**(企业战略 vs 工程协议)

## 深度分析

### 1. Agent Runtime Contract 是设计对象迁移的标志

过去十年,AI 系统设计者的核心问题是"**模型能不能答**",答案由模型厂商通过权重迭代来交付。但 Fable 5 的出现把这个问题的重心移走了——**当强模型已经能跑长任务,剩下的工程问题不再是模型性能,而是任务协议、工具路由、状态管理和治理边界能否被显性化**。若飞把这个问题称为 Runtime Contract:它不是提示词,而是一套运行协议。这与 [Agent Runtime 7 大职责](ch03/044-agent.md) 中"Runtime 是 Agent 的骨架"这一判断完全一致,但补充了"契约层"这一视角——骨架是结构,契约是交付协议,两者共同构成可运维的 Agent 系统。

### 2. Task Brief 9 字段本质上是任务元数据的结构化声明

Mike Krieger / Every 团队给出的 Fable 5 prompt library 核心是 9 字段 Task Brief,这在工程上意义深远:**它把"任务边界"从隐性知识变成了显性契约**。传统软件开发中,需求文档往往依赖自然语言,边界模糊,验收标准主观。长任务 Agent 的问题更严重——它没有实时人工监督,一旦对"完成"的理解偏差,会在错误方向上消耗大量资源。9 字段模板(背景/目标/Done means/上下文包/权限/验证/阻塞/交付物/降级)本质上是一种**任务元数据的强制声明**,让 Agent 在行动前先对齐期望。这与 [17 种 Agent 架构演进](ch03/044-agent.md) 中"控制流设计逐步显性化"的历史趋势一脉相承。

### 3. 能力路由 8 维度揭示了工具膨胀的失控风险

若飞提出的 8 维度能力路由(MCP/Skill/搜索/Artifact/子代理/内置工具/网页/只回答),指向了一个核心矛盾:**工具越多,Agent 越容易乱**。这不是模型能力问题,而是系统设计问题。当一个 Agent 拥有 50 个工具时,"什么时候用哪个"如果全靠模型自行判断,失败模式是不可预测的。Fable 5 的路由思想是把触发条件显式化:MCP 必须先发现→再建议→等用户选择;Skill 创建文件前必须读;搜索遇到新实体主动用。这与 [Harness Loop 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-loop-architecture.md) 中的"工具调用必须可观测和可干预"原则呼应——**路由的本质不是限制 Agent,而是把决策权责显性化,让人能审计和接管**。

### 4. 执行状态账本设计是长任务 Agent 的核心工程难题

长任务 Agent 不能只靠聊天记录记住自己做过什么——这个判断来自 Anthropic 官方文档,被若飞拆解为 5 类状态账本(memory/Artifact storage/文件账本/工具历史/进度声明校验)。这与 [若飞 agent memory architecture](ch03/044-agent.md) 中的"记忆架构决定 Agent 能否真正完成任务"高度相关。核心洞察是:**状态管理不只是"有没有 memory",而是"状态是否可以被验证和交接"**。进度声明必须回到本轮工具结果校验,这是一个朴素的工程原则,但在 AI Agent 场景下被放大——模型的"自信"可能掩盖实际的工具调用失败,而没有结构化账本,工程师无法事后重建真实执行路径。

### 5. Fable 5 事件是 Agent 治理从"产品内嵌"走向"显性协议"的拐点

Anthropic 因美国政府出口管制指令暂停 Fable 5 访问,这件事在表面上是一个合规事件,但深层看是**供应商锁定风险的极端暴露**:当模型供应商不可用,整个 Agent 产品的业务连续性立即中断。若飞在"设计对象变了"一节列出的 8 个新问题(任务协议/工具路由/状态交接/产物验证/权限审计/成本解释/拒答降级/供应商依赖)中,最后一个问题在 Fable 5 事件中变成了真实的业务中断。这与 [Agent 架构关键变化:Harness 正在成为新后端](ch03/044-agent.md) 的判断形成呼应——**当模型层不可靠,Runtime/Harness 层必须承担起稳态责任,包括降级和交接**。

## 实践启示(8 条 actionable)

- **写 Task Brief 而非 Prompt**: 如果你的 Agent 经常在中途停下来问"什么叫完成",给它一个 9 字段 Task Brief(背景/目标/Done means/上下文包/权限/验证/阻塞/交付物/降级)
- **路由先于工具**: 工具多 ≠ 系统稳,先建 8 维度路由规则(MCP/Skill/搜索/Artifact/子代理 触发条件),再堆工具
- **状态账本优于聊天记录**: memory + Artifact storage + 进度声明校验三件套,避免"Agent 做了很多但没法接手"
- **交付物与中间产物分离**: 最终文件必须放可见输出区,**不**留在聊天/中间过程里
- **MCP 三步走**: 发现 → 建议 → 等用户选,不能跳过授权
- **Skill 必读**: 创建文件 / 跑代码前先读 SKILL.md,把"经验"做成"可复用过程"
- **降级策略前置**: 4 类降级场景 (模型拒答/工具不可用/成本过高/上游不可访问) 在任务开始前就要想清楚
- **进度声明可回溯**: 任何"我完成了 X"都必须能回到本轮工具结果校验,避免"虚构进度"

## 局限性 / 需关注的边界

- **CLAUDE-FABLE-5.md 真实性未确认**: Anthropic 没有确认该 1585 行文件完整、未改动
- **本文基于未确认的提示词**: Fable 5 提示词更接近 Claude.ai 产品界面,**不**等于 Claude API 或 Claude Code 的运行规则
- **Fable 5 访问被暂停**: 截至 2026-06-14,外国公民已无法访问,**不能直接套用**
- **若飞的 9 字段模板未给出具体代码示例**: 仍是契约层设计,落地到具体 Agent 框架(OpenAI/Anthropic/Mastra/Claude Code)需二次工程
- **能力路由 8 维度未给判定算法**: 仍需团队按具体业务写路由规则

## 相关实体

- → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-fable-5-agent-runtime-contract-ruofei-2026.md)
- [Claude Fable 5 提示词泄漏 — Runtime Control Plane](ch01/380-claude.md)
- [Anthropic Claude Fable 5 on AWS](ch01/380-claude.md)
- [Claude Fable 5 and new AI safety fables](ch01/677-claude-fable-5-and-new-ai-safety-fables.md)
- [Claude Fable 5 — Mollick patron vs wizard](ch01/380-claude.md)
- [若飞 5 张卡治理](ch03/044-agent.md)
- [若飞 Ralph loop 状态交接](ch03/044-agent.md)
- [Claude Code agent teams task decomposition](ch03/074-claude-code.md)
- [Harness Engineering Deletable Worksite](ch05/073-harness-engineering-deletable-worksite-ruofei.md)
- [Agent 架构关键变化:Harness 正在成为新后端](ch03/044-agent.md)
- [Harness Engineering Framework](ch05/061-harness-engineering.md)
- [纳德拉「Token 资本」论](ch04/150-ai.md)

---

