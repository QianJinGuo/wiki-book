# Harness 减法工程——删掉 61% 之后什么该留（L0-L3 四层归属）

> 📊 Level ⭐⭐ | 18.6KB | `entities/tdsql-harness-subtraction-l0-l3-tencent-2026-08-06.md`

# Harness 减法工程——删掉 61% 之后什么该留

> **来源**：腾讯云开发者，作者魏依承，2026-08。腾讯 TDSQL 团队对自研 harness 框架 tdsql-harness 做了彻底 refactor：根指令删掉 61%，skills 砍掉 40%，agent 从 10 个减到 6 个。同期 Anthropic 公布为 Claude 5 系列删掉 Claude Code 系统提示词 80%+ 而评测无损失——两家头部厂商独立收敛到「减法」。

## 摘要

本文是一份可操作的 harness 瘦身方法论：从「冗余指令在中性时代是负资产」这一质变出发，给出五道关卡（该不该写 → 规则转判据 → 路径放开验收收紧 → 先建裁判再写内容 → 沉降到工具层），并以 **L0-L3 四层归属**框架回答「什么会被模型内化、什么永远不会」——这是全文最核心的原创贡献。结论：harness 不会消失，它在迁移；自建 harness 的立足点在 L2（组织特有流程与工具）和 L3（验收标准/授权边界），不在 L1（执行循环，会被平台吸收）。

## 核心框架一：冗余指令从中性变成负资产

在弱模型时代，多写一句话最坏的结果是浪费 token；今天，多写一句话可能覆盖掉模型自己更好的判断。OpenAI 给出机制说明：过度规定流程会**缩小模型的搜索空间**（narrow the model's search space），当模型比你更清楚哪条路好走时，这个剪枝就是净损失。Anthropic 给出手感级的例子：「只报高危问题」这类措辞会被模型字面执行、削减召回——正确做法是让它全报、另开一轮过滤。官方对验证指令的处置是**删除而非改写**，并直接点名 legacy harness scaffolding 该拆。

具体在变的四件事：
1. **规则 → 判据**：穷举式禁令必然有覆盖不到的边界；判据把边界判断交回给模型（它读得到上下文，你写规则时读不到）。
2. **前置全量上下文 → 渐进式披露**：详细指引从常驻系统提示词挪进按需加载的 skill，只有约 100 token 元数据常驻——可装几十个 skill 而不撑爆注意力预算。
3. **示例 → 接口设计**：把状态字段枚举成 pending/in_progress/completed 本身就在引导正确用法；对足够强的模型，示例会成为约束。
4. **简单 markdown 规格 → 可执行引用物**：HTML 产物、测试套件、函数签名、rubric 替代纯文字规格——代码和测试是可执行规格，不存在解释歧义。

prefill 的消失是最干净的「脚手架消失」案例：从 Claude 4.6 起从 API 层面移除（带 prefill 请求返回 400），官方理由只有一句——模型智能和指令遵循已进步到大多数 prefill 场景不再需要它。**脚手架不是被优化掉的，是它防御的那个问题不存在了。**

## 核心框架二：五道关卡（可操作指南）

### 第一关：这一条到底该不该存在

最省力的优化是不写。两条判据：
- Anthropic：**复述模型默认行为的 skill 只增加上下文不增加价值**（Claude already knows how to code and can read your codebase）。
- Addy Osmani 删除判据：**这条信息 agent 读你的代码库能不能找到？能找到就删。** 按此判据，目录结构/架构概览/技术栈描述该删；uv 依赖管理、测试必须加 --no-cache 否则假通过、运维坑、废弃模式该留。

冗余的真正代价不是 token：**它制造第二个事实来源**——agent 读了你的描述又去读真实代码，得调和两个事实来源；代码会变，你的描述不会跟着变。**过期的文档比没有文档更危险。**

机械判据（逐行扫描用）：**一个没有本次会话记忆的 agent 读到这一行，行为会怎么变？答不出来就删。** 必然出局的三类：元评论（「这里以前出过 bug」——不含动作，且告诉模型某条边界没有强制力等于削弱它）、自我辩护（「这就是本 skill 存在的理由」——对 agent 无行为差异）、防御性否定（「这不是指某某」——把被否定概念引入上下文）。

### 第二关：从规则到判据

OpenAI 分界线：**MUST/NEVER 只留给真正的不变量**（true invariants）；判断题——何时搜索、追问、用工具、继续迭代——一律改写成决策规则。tdsql-harness 里保留绝对措辞的只剩一类：不可逆动作（commit、push、MR 合入、deploy、workspace 之外删除）。正例优于禁令。

### 第三关：路径放开，验收收紧

「给目标而不给步骤」≠ 写得更少——GPT-5.5 最强形态是 prompt 定义**目标结果、成功判据、约束、可用上下文**，让模型选路径：四项里三项写死，只有路径留给模型。把笔墨从「怎么做」挪到「怎么算做完」。

Addy Osmani 对 skill 的操作化定义：**workflow = 带产出证据检查点的步骤序列 + 明确退出条件**——「真正有价值的不是那些 markdown，是退出条件」。证据是绿测试、截图、日志、评审通过；没有证据这一步不算完成。两千字测试最佳实践长文只会让 agent 跳过真正的测试。

例外：什么时候连路径也要写死——**判据是操作的脆弱性，不是任务的重要性**。数据库迁移要写死不是因为它重要，而是顺序错了无法挽回；code review 同样重要但没有唯一正确路径。**用判据而不是步骤，但判据必须能被机械判定**：「代码质量要好」不是判据；「测试变绿/产物存在/diff 为空/exit 0」才是。

### 第四关：先建裁判，再写内容

Anthropic 官方 skill 指南：**Create evaluations BEFORE writing extensive documentation**——确保 skill 解决真问题而非为想象需求写文档。五步：不带 skill 跑一遍记录具体失败 → 针对 gap 建三个评测场景 → 建 baseline → 写刚好够填 gap 的最少内容 → 迭代对照 baseline。副产品比流程本身更重要：**每条规则天然绑定它防御的具体失败**——这成为第三部分判断「规则是否过期」的唯一依据。Anthropic 敢一次删 80% 是因为有评测兜底——「删了会不会坏」靠跑出来的，不是靠判断。

### 第五关：能沉降到工具层的，就别留在指令层

Addy 定位：**AGENTS.md = 一份「你还没修掉的摩擦」的清单**。agent 反复卡在同一个地方时先修根因（重构代码、加 linter 规则、补测试），穷尽手段后才往指令文件加话。OpenAI 用 Codex 交付约一百万行代码的生产 beta 产品：**enforcing invariants, not micromanaging implementations**——invariants 用 custom linter 和 structural test 强制，AGENTS.md 只有约 100 行，是「一张地图」不是百科全书。分工：**指令层的强度取决于模型当下怎么读它；工具层不取决于。**

### 案例：tdsql-harness 删掉了 61%

剩下的 6,400 字符里只有四类：**什么算做完**（成功判据与验收）、**哪里必须停下来找人**（gate 与升级条件）、**状态放在哪**（跨 session 恢复约定）、**什么不能自己做**（不可逆动作授权边界）。

## 核心框架三：每一条 harness 规则都是一个赌注

### 假设到期论

> Every component in a harness encodes an assumption about what the model can't do on its own. ——而这些假设 grow stale as the model gets more capable。

你 harness 里的每一条都在赌一件模型做不到的事；真正的工作不是「精简」，而是**识别哪些赌注已到期、哪些永远不会到期**。识别模式：**凡是为了补模型能力缺口而写的，都会过期，只是早晚**——规则理由是「模型记不住/不会主动做/容易漏」，它已在到期队列里。已到期实例：context resets、任务分片、prefill、CoT 诱导、self-check 指令、CRITICAL 强调语——好几条已反转成负作用。

### 怎么知道一条假设已过期：让内化可检测

你预测不了模型何时内化某条规则，但可以让「已被内化」变得**可检测**：每条规则写下时绑定它防御的具体失败模式，模型进化到不再犯这个错时就有明确信号删它。Addy 的同构表述叫**棘轮法**（ratchet approach）：只在观察到真实失败之后才加约束，规则必须追溯到真实错误而非猜测。这解释了为什么绝大多数 AGENTS.md/CLAUDE.md 只增不减——根因不是懒，是规则当初没写清防的是什么，所以谁也不敢删。**说不清防什么的规则，从写下来的那一刻就已经无法被淘汰了。**

### L0-L3 四层归属（核心原创框架）

「会不会被模型内化」没有统一答案，得分层看：

| 层 | 内容 | 归宿 |
|----|------|------|
| **L0** | 模型基础能力（记忆、工具使用、推理） | 已内化，不该写 |
| **L1** | 执行循环与编排（context resets、任务分片、subagent 编排、状态管理） | 被平台原生吸收，**迁移**到工具层（不是消失） |
| **L2** | 组织特有的流程与工具 | 迁移到工具层，不会消失 |
| **L3** | 验收标准/授权边界/组织知识 | **永不内化** |

自建 harness 的立足点在 **L2 和 L3，不在 L1**。删掉的内容全部落在 L0/L1；剩下的 6,400 字符（成功判据、gate、状态约定、授权边界）全部落在 L2/L3。开源 harness 框架能给你的绝大部分是 L1——而 L1 恰恰是最会被平台吸收、最不保值的一层；很多团队自建 harness 力气全花在 L1（重写执行循环、设计 workflow 引擎），那是投入最大、贬值最快的地方。

### L3 永不内化的两条理由

**理由一：信息不可达。** 价值排序、私有 context、主观 oracle 物理上不在模型能到达的地方——不在公开语料（否则每个组织答案一样），也不在 repo 里（否则 grep 就能拿到）。保值判据：问「这条信息的源头在哪里」——公开语料 → 会被内化别写；repo/运行环境 → 会被工具拿到别写；**人的头脑或组织结构里 → 永远是你的责任**。

**理由二：责任不可转移**（堵住「信息补齐」漏洞）。Addy：**Only people inherit consequence**——agent 可以在 policy 内安全地做选择、路由、合并、升级，但它无法继承后果。出了事被问责的是人；这一条连理论上都无法被技术进步消解。人必须持有的三件套（可直接当 gate 设计清单）：Verdict / Answerability / Accountability。

### 还有一类不会消失：结构性偏差

评价者与被评价者是同一个造成的结构性问题——模型自评会 confidently praise the work；"The model that wrote the code is way too nice grading its own homework"。**独立 reviewer 和跨模型校验的价值不随模型变强而衰减**——evaluator 的价值边界只是外移，是边界移动不是价值消失。

### 度：自主度的上界（back pressure）

> You can only hand a loop as much autonomy as you can cheaply and reliably verify, and not one inch more.

上界绑定的是**验证能力**，不是任务重要性也不是模型能力：重要任务若验证成本低、可回滚，反而可以给高自主度；不起眼任务若错了发现不了就不能放手。三个判定问题：多快能知道我们错了 / 多干净能撤销 / 什么能证明我们是对的。**验证才是真正的瓶颈**——启动 agent 只要一句话，收口一点也不便宜；生成速度超过验证速度，积累的是认知债（滋生虚假信心，不像技术债通过摩擦暴露自己）。gate 推论：**gate 数量上限 = 人能真正判断的数量上限**；人在 gate 面前会退化成快速点头，对策不是减少 gate 而是让每个 gate 便宜到能真判（裁决事项/证据/推荐前置，全文和 diff 作附录）。

## 深度分析：团队为什么还要自己做 harness

**harness 不会消失，它在迁移**：Better models eliminate certain scaffolding but enable new capabilities requiring different scaffolding——假设的地形是移动，不是收缩。自建 harness 的价值锚点：

1. **L2 的价值是「让 agent 能做」而非「告诉 agent 怎么做」**：通过 MCP 工具、封装脚本、固化操作流程，agent 获得操作内部系统的能力（查工作项、触发流水线、登录测试集群拉日志、处理评审意见回写状态）——这是**能力接入**不是知识注入。模型能力提升会让知识注入越来越强，但不会让它自己跨到能力接入——跨过去只能由了解系统的团队铺设。这决定的不是 agent 写得多好，而是 agent 能不能独立走完一整条交付链路。
2. **Anthropic 自己就是样本**：Claude Code 系统提示词、内部 skills、验证 skill 就是一份团队自建 harness；删到 20% 后剩下的是产品级上下文、team opinions、gotchas、验证 skill、安全边界——全部是 L2/L3。实测：**验证类 skill 是内部对产出质量影响最可测量的一类**——因为验收标准是组织特有的、模型拿不到的信息（什么算「做完了」每个团队不一样），它落在 L3。
3. **自建 harness 是在偿还意图债（intent debt）**：意图债存在于那些你可能从未写下的文档里（目标、约束、系统为什么是现在这个样子的理由），技术债低也可能意图债高。agent 把这个债从慢性变成急性——每个 session 都是冷启动：**凡是你没有外化成它能读到的文档的东西，它就没有**。人的意图债靠口口相传慢慢还，agent 没有这条路径，要为每一次未记录的决策重复付费。顺带收益：为 agent 沉淀 L2/L3 的系统，通常也是新人更容易接手、故障更容易排查的系统。

## 实践启示

四个明天就能做的动作：
1. **每加一条先写清它防的是哪个具体失败**——写不出来就别加，这是「面向未来」唯一可执行的形态。
2. **每隔一个模型代际做一次到期审计**——问 what can I stop doing，重点查「模型记不住/不会主动做/容易漏」类条目。
3. **把力气从 L1 挪到 L2 和 L3**——别重写执行循环，平台会替你做；去沉淀验收标准、授权边界、内部工具用法、模块 gotcha。
4. **能沉降到工具层的就别留在指令层**——linter、测试、CI 门禁比任何措辞可靠。

## 相关实体

- [Harness 组件保质期——Model-Harness Fit 与 Build to Delete](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-component-expiry-build-to-delete.md)——「每个组件编码一个假设」的保质期框架最早由本 wiki 从 Anthropic 长任务 harness 设计聚合而成；本文给出该框架的团队实测版（tdsql-harness 61% 删减 + L0-L3 四层归属）与到期检测机制（绑定防御的失败模式）
- [Harness Engineering 的未来——什么会消失，什么不会](057-harness-engineering.html)——郭美青「主权线」框架（被取代的答 how，不被取代的答 whether）；本文的 L0-L3 是更细的四层归属，可互补对照
- [认知债与意图债](../ch04/257-ai.html)——本文引入 Addy 三债区分（技术债/认知债/意图债），并论证 agent 把意图债从慢性变急性
- [Claude Code 上下文工程——Thariq 的语境工程](../ch03/057-claude-code.html)——本文引用其「删掉 80% 系统提示词」与六个转变（规则→判据等），是同一转向的团队落地版
- [Harness Engineering Deletable Worksite（若飞）](054-harness-engineering-deletable-worksite-ruofei.html)——巨型约束文件变负担、Vercel 删 80% 工具成功率反升，与本文减法转向互证
- [Addy Osmani 的工程实践系列](../ch04/351-loop-engineering.html)——back pressure、棘轮法、意图债、只有人能继承后果等概念的原始出处
- Harness Gate 评估——本文 gate 数量上限 = 人能真判的上限，是对 gate 设计的新约束

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/tdsql-harness-subtraction-61pct-l0-l3-tencent-2026-08-06.md)

- [MOC：Agent 工程指南](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-engineering-guide.md)

---

