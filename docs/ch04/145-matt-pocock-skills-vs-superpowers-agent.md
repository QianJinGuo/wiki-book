# Matt Pocock Skills vs Superpowers：Agent 技能工程的两条路线

> 📊 Level ⭐⭐⭐ | 9.8KB

> Matt Pocock 的 skills 仓库（15.4 万 star）代表了与 Superpowers（24.7 万 star）截然相反的 Agent 技能工程哲学：**最小锚点 vs 强制流程**。

→ [深度原文存档：四大支柱与元方法论](https://mp.weixin.qq.com/s/pXGI92pcrTzel7B3kZn_Zw)

→ [原文存档](https://mp.weixin.qq.com/s/H_0v5TFawGkc7cma2ozwlg)

## 核心哲学对比

- **Superpowers**：假设模型会偷懒、会给自己找理由，把每条退路堵死。hook 从会话第一秒上强度
- **Matt Pocock Skills**：假设模型大概率会做对，skill 只负责在关键处给一个最小的锚点。21 个 skill 手动触发，13 个禁用自动调用

## 工程流水线

五步链路：/grill-with-docs（连环拷问）→ /to-prd（合成 PRD）→ /to-issues（切分 issue）→ /implement（独立执行）→ /code-review（审查收官）

## 三个精巧设计

1. **CONTEXT.md 项目词典**：把领域驱动设计的通用语言概念搬给 agent，让 agent 用更少 token 更精准沟通
2. **disable-model-invocation 隐藏触发**：21 个中有 13 个不进入模型上下文，配 /ask-matt 路由 skill 兜底
3. **最小锚点原则**：TDD 仅 36 行，引用经典软件工程（Kent Beck、Ousterhout 深模块），把经典书压缩成 agent 可执行形态

## 量化对比

| 维度 | Matt Pocock | Superpowers |
|------|------------|-------------|
| 总行数 | 1,321 | 3,300+ |
| Skill 数量 | 21 | 14 |
| TDD skill | 36 行 | 371 行 |
| Writing-skills | — | 689 行（红旗表） |
| 触发 | 手动斜杠占多数 | hook 强推 |
| 控制假设 | 最小锚点 | 堵死退路 |
| GitHub Stars | 15.4 万 | 24.7 万 |

## 四大支柱框架（源码深度解析）

新文章以 v1.1.0 源码为准，提炼出 mattpocock/skills 的四根设计支柱:

1. **Grilling（12 行）**：解决"Agent 没做我想要的"。引用《Pragmatic Programmer》"No-one knows exactly what they want"。区分 fact（agent 自查）vs decision（需用户拍板）。grill-me（无 codebase）和 grill-with-docs（有 codebase）都委托给 grilling 原语。

2. **CONTEXT.md**：解决"Agent 太啰嗦"。在 grilling 过程中编项目词典，来自 Eric Evans《Domain-Driven Design》ubiquitous language 概念。配套 domain-modeling（74 行）主动维护。

3. **TDD + 反馈回路**：解决"代码不 work"。tdd 仅 36 行，核心是红绿循环加三个反模式（Implementation-coupled、Tautological、Horizontal slicing），解法是 vertical slice / tracer bullet。配套 diagnosing-bugs（134 行）拆成 6 个 phase。

4. **深模块/架构**：解决"代码成了泥球"。引用 Kent Beck 和 Ousterhout（The best modules are deep）。codebase-design（114 行）定义 Module、Interface、Implementation、Depth（as-leverage）、Seam、Adapter、Leverage、Locality。

四根支柱全是经典软件工程书压成 agent 可执行的最小形态。

## Writing-Great-Skills 元方法论

83 行正文 + GLOSSARY.md，核心美德是 predictability（过程一致而非输出一致）:
- **Leading words**：利用模型预训练知识的词，如 fog of war、tracer bullet
- **Progressive disclosure**：细节委托给上层 skill
- **Completion criterion**：反模式是 premature completion
- **Negation**：不要写"别想大象"这类否定式指令

解释了 grilling 12 行能工作的三个原因：leading words、progressive disclosure、明确 completion criterion。

## 深度分析

### 1 控制假设：两种对模型默认行为的下注

Superpowers 下注"模型会偷懒、会给自己找理由"，用 hook 从会话第一秒上强度，把每条退路堵死；mattpocock/skills 下注"模型大概率会做对"，只在关键处放一个最小锚点。 这两种下注的失败模式并不对称：约束不足的错误会显形为 fluff——看着完整却跑不通，被测试和评审拦住，成本可见、可回收；约束过度的错误则是隐性的——每个会话多携带 token、注意力被稀释、关键信息被挤掉，它不报错，只让每次调用更慢更贵（[skill 的回归税](https://github.com/QianJinGuo/wiki-public/blob/main/entities/regression-tax-skills-hurt-llm-agents.md)）。选型依据因此不是"哪个假设更接近真相"，而是你愿意承担哪种错误：由测试兜底的可见成本，还是由 token 账单慢慢结算的复利成本。

### 2 行数经济学：36 行 vs 371 行，差额花在哪一层

36 行对 371 行的 TDD、12 行对 689 行的 skill 写作，差的不是详尽程度，而是多出来的那些行写在谁身上：写进 skill 文本（作者替模型穷举分支），还是留在模型权重里（预训练先验 + progressive disclosure 按需展开）。 最小行数实际取决于三件事：概念有没有预训练强先验（红绿循环、tracer bullet 有，公司私有分支规范没有）、判断能否被下游自动校验（测试能跑就不必写进文本，代码风格没有裁判就必须写）、违反的代价是否可逆（坏提交可回滚，生产事故不可）。三者都指向"可以省"时，skill 才会真的短；反过来，把无先验、不可校验、不可逆的判断压成 36 行，不是克制，是漏写。

### 3 Leading words：把预训练知识当设计材料

12 行的 grilling 能工作，不是因为它写得精炼，而是因为它借了外力：leading words（fog of war、tracer bullet）在预训练语料里各自挂着一整套行为模式，写下一个词等于调用它连接的那片知识；progressive disclosure 把细节留在上层 skill，主 skill 只负责在正确时机把它拉出来；completion criterion 说清"什么算完"——而模型的默认反模式恰恰是 premature completion，天然倾向于早收工。三个机制合起来，把"需要写出来的行数"换成了"需要模型已经知道的概念数"。 这条经验可以反过来当尺度用：必须靠穷举规则才站得住的 skill，说明它依赖的是模型没有先验的部分（组织惯例），那就该写长并交给 hook 强制；依赖模型已有概念（测试、评审、重构）却写长，是重复付费。

### 4 规划与执行的分工：流水线执法 vs 运行时执法

grill → PRD → issues → implement → review 的价值不在步骤齐全，而在把"想清楚"变成人必须出席的节点：grilling 硬性区分 fact（agent 自查）与 decision（用户拍板），决策权留在人手里；/to-tickets 之后每个 ticket 开新会话，用 context hygiene 保持执行窗口干净、上限约 120k token（[五阶段主流程](https://github.com/QianJinGuo/wiki-public/blob/main/entities/matt-pocock-main-flow-5-stages-3-antipatterns.md)）。 Superpowers 反过来把纪律下沉到运行时：hook 在会话开头注入指令，不依赖人的记性。两者的代价正好互补——流水线执法依赖人稳定出席（记住 12 个斜杠命令、真坐下来逐个拍板），运行时执法依赖 token 预算充裕。所以这不是"人管纪律 vs 机器管纪律"的对立，而是纪律放在哪个位置的权衡：放在节点上，人能干预、能拍板，但人会跳过节点；放在 hook 上，不会漏，但不可协商。

## 实践启示

1. **先数行数，再问哪一层是承重的**：36 行的 skill 能成立，是因为红绿循环、tracer bullet 这些概念已经在模型权重里；换成组织私有的惯例，同样 36 行就必然漏。作者省略掉的行，其实是模型替你还的债。
2. **写完成判据，别写禁令**：completion criterion 告诉模型什么时候算完，比一长串"不要做 X"有效得多；否定式指令（别想大象）除了把注意力引到那个词上，几乎不起作用。
3. **决策留给人，事实交给 agent**：fact 让 agent 自己查代码和文档，decision 必须停下来等人拍板。这条界线划清楚，grilling 才既是省 token 的机制，也是防返工的机制。
4. **默认隐藏，靠路由兜底**：让模型自动看到全部 skill，等于用上下文预算买干扰；把多数 skill 藏在手动触发之后、留一个 router 兜底，代价是用户必须记住那几个命令。
5. **选路线先看清自己的约束**：怕漏就上 hook（运行时执法，不漏但不可协商），怕贵就上最小锚点（流水线执法，便宜但依赖人出席）；两者不必二选一——同时跑一遍、用交付质量做判据，是目前最诚实的对比方式。

## 关联

- [Superpowers 三器合一](https://github.com/QianJinGuo/wiki-public/blob/main/entities/three-tools-comet-openspec-superpowers-ai-coding-shuge-2026-06-17.md) — Superpowers 在 Comet+OpenSpec 流水线中的角色
- [Agent vs Workflow 控制权连续谱](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-vs-workflow-control-continuum-framework.md) — "控制权交给谁"是这场路线之争的本质

---

