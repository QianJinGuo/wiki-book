# Superpowers 深度解读（2）：Rule/Gate/Hook 与 Iron Law 方法论

> 📊 Level ⭐⭐⭐⭐ | 12.2KB

> 原文归档：[原文归档](https://mp.weixin.qq.com/s/tUstpkIRaD71YYfanBSANA)

Superpowers 第二篇深度解读：聚焦 Rule/Gate/Hook 核心哲学、Iron Law、TDD 应用到 prompt engineering、SDLC 范式映射。开元大咖说/原作者。

## 一句话

**Rule 可绕开（rationalize 借口）/ Gate 不可绕开（先满足条件才允许下一步）/ Hook 是确定性触发——Superpowers 把每个关键转换都做成互锁 gate，构成 LLM 时代的工业级 SDLC。**

## 互补角度（vs 百度Geek说版）

本文聚焦以下独特贡献：
- Rule vs Gate vs Hook 哲学区分
- 1% rule 详解
- Iron Law + Anti-rationalization 表
- systematic-debugging Phase 4.5（3 次失败→STOP）
- writing-skills 的 prompt engineering TDD 化
- Cialdini 说服原则的 PUA Skill
- SDLC 范式映射表
- 社区批评（无 benchmark / slop PR / 弱模型失效）

## Rule vs Gate vs Hook

| 类型 | 例 | 特征 |
|------|---|------|
| Rule | "过马路前不要不看路" | 可合理化绕开 |
| Gate | "HARD GATE: 左看→右看→再左看→verify zero vehicles" | 无绕行路径，阻塞下一步 |
| Hook | 经典确定性软件 | 特定动作触发 |

"A rule has an opt-out path. A gate doesn't — the next action is blocked until the gate condition is met."

## 1% Rule

"Invoke relevant or requested skills BEFORE any response or action. Even a 1% chance a skill might apply means that you should invoke the skill to check. IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE."

## Iron Law（TDD）

"If production code was written before its test exists and was observed failing, the code must be deleted. There are no exceptions for 'reference' or 'adaptation'. Delete means delete. Implement fresh from the tests only."

**Anti-rationalization 表**（4 条典型借口）：
- "Skip TDD just this once" → 那是借口，不是例外
- "Tests written after work the same" → 事后写测试回答"做什么"，先写回答"应该做什么"
- "Time already spent, sunk cost" → 留下没真测过的代码就是技术债
- "Manual testing is enough" → 手动执行是临时拼凑

## systematic-debugging Phase 4.5

3 次 fix 都失败 → STOP，回到 Phase 1（"这不是假设失败，是架构错误"）

**redirect signals**：用户说 "Is that not happening?"/"Stop guessing"/"Ultrathink this" → agent 必须立即回 Phase 1

## writing-skills：把 TDD 应用到 prompt engineering

- **RED**：写压力测试场景，记录 agent 怎么 rationalize 出捷径
- **GREEN**：根据观察到的 rationalization 写 skill 反驳
- **REFACTOR**：装上 skill 再跑，看还能找新借口

"If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing."

## Cialdini 说服原则（PUA Skill）

Jesse 自觉用 Cialdini《影响力》六原则（authority/commitment/liking/reciprocity/scarcity/social proof/unity）固化 agent 行为。

真实例子：生产宕机每分钟 $5k → A)立即调试 5 分钟 B)检查 skill 2+5=7 分钟 → agent 选 A 说明 skill 不够硬

## SDLC 范式映射

| 传统 SDLC | Superpowers 重新解释 |
|----------|------------------|
| 需求评审 | brainstorming + spec self-review + user 签字 |
| 架构设计 | brainstorming File Structure + 单元分解 |
| 任务拆分 | writing-plans bite-sized tasks（精确路径+代码块） |
| 编码规范 | TDD Iron Law、YAGNI、DRY 写在 plan 模板 |
| Code review | 分 spec review + code quality review 双阶段 |
| 集成测试 | verification-before-completion evidence gate |
| 分支管理 | using-git-worktrees + finishing-a-development-branch |
| 并行开发 | dispatching-parallel-agents（限制 3+ 独立失败） |

## 与 Anthropic 官方 Skills 差异

| 维度 | Anthropic 官方 | Superpowers |
|------|---------------|------------|
| 目标 | 能力扩展（PDF/PPT/Excel） | 流程纪律 |
| 触发 | 用户显式调用 | 1% rule 自动判断强制 |
| 依赖 | MCP/各种 runtime | bash + Node.js（无 MCP） |
| 安装量 | — | 300k（社区胜） |

## 社区批评（4 项）

1. 无正经 benchmark（数字来自实践记录非对照实验）
2. 认知负担（管理多 subagent 工作流本身有心智成本）
3. "模型吃过 100 本 TDD 的书，再喂 SKILL.md 真能加什么？"（价值在 enforcement 不在 knowledge transfer，是假设非测量）
4. Slop PR 问题 + 弱模型失效（GLM 4.6/Kimi K2 会跳步骤）

## 适合 vs 不适合

**适合**：复杂功能 / 生产代码 / 大型 refactor / 长 session
**不适合**：一次性脚本 / 极小 bug fix / 架构已了然只需"打字员" / 模型能力不够

Jesse 探索第二种 mode："iterative greenfield"——不走 spec-first，从行为示例反向生成 spec 再 clean reimplement

## 深度分析

### 三层控制栈：Hook 是地基，Gate 是骨架，说服是缓冲层

把 Rule/Gate/Hook 分类学、Iron Law 和 Cialdini 说服原则放在一起看，Superpowers 实际上构建了一个三层控制栈：最底层是 SessionStart Hook 这样的确定性软件，行为可预测、完全不可协商；中间层是 HARD-GATE，把关键转换（先有 design doc 才能 brainstorm、先看到测试失败才能写实现、先跑命令才能宣称完成）做成阻塞式检查点；最上层才是 Cialdini 式的说服性措辞，用来覆盖 gate 无法穷尽的情境判断。三层各司其职——能用确定性解决的绝不交给提示词，能用 gate 锁死的才 fallback 到说服。

Iron Law 是这个栈里最极端的 gate 实例：它的惩罚不是"重来"而是"删除"——代码在测试之前写出来就必须删掉从头实现，连"参考着改"都不允许。这种不可逆性正是 gate 区别于 rule 的本质：rule 的违抗成本接近零（"这次先跳过"），而 Iron Law 把违抗成本设为全损，使 rationalize 在经济上不再划算。

### enforcement 与 knowledge transfer 的自举闭环

社区批评中最尖锐的一条是："模型已读过 100 本 TDD 的书，再喂 SKILL.md 能加什么？"文章的回答是价值在 enforcement 而非 knowledge transfer——但更深一层的综合是：Superpowers 把"纪律"本身当成了一个独立的、可测试的工程对象。writing-skills 的 RED-GREEN-REFACTOR 循环本质上是给 prompt 写测试：先记录 agent 如何 rationalize 出捷径（RED），再针对观察到的借口写反驳（GREEN），重跑看它找什么新借口（REFACTOR）。

这构成一个自举（self-hosting）结构：写 skill 的方法论本身就是被这套方法论约束的产物。$5k/分钟宕机案例里 agent 在金钱压力下选 A、暴露 skill 不够硬，随后加更强的优先级——这是对"纪律工件"的一次完整 TDD 迭代。纪律不再是文档，而是和代码一样经历失败观察、修复、回归测试的活体资产。

### 三重嵌套的对抗式验证体系

对抗式测试在框架里出现了三个层级，共享同一个 RED→GREEN 哲学：代码层的 Iron Law TDD（测试先行且必须观察到失败）、skill 层的 prompt TDD（没有看过 agent 失败就不写 skill）、以及社区层面的 A/B 验收（12-session 对照：6 次带框架 vs 6 次不带，token 反而省 14%）。三个层级互相补位——代码测试验证实现正确性，skill 测试验证纪律有效性，A/B 验证整套流程的净收益。这回应了"无 benchmark"的批评：虽然不是严格对照实验，但验证的粒度从单点行为一直延伸到端到端成本。

### 失败路径是设计出来的，不是发生了再说

这套体系的隐含假设是 agent 一定会失败，所以失败路径被预先编码：Phase 4.5 规定 3 次 fix 失败即 STOP 回到根因调查（"不是假设失败，是架构错误"）；用户的 redirect signals（"Stop guessing"/"Ultrathink this"）被定义为必须触发回到 Phase 1 的硬信号；receiving-code-review 规定 6 条意见只懂 4 条必须停下问清楚；finishing-a-development-branch 把开放式问题压缩成四选一。整个设计把"卡住"从异常变成预期事件，每个卡点都有预设的退路和升级规则。

## 实践启示

- **改造自己的 agent 约束时，先问"这是 Rule 还是 Gate"**：凡是带"以后记得"字样的指令都是可 rationalize 的 rule；改写模板是 "Before you do X, verify Y. The next action is blocked until Y holds."——把检查点前移到动作之前，让绕行在物理上不可能。
- **写任何 skill 之前先跑一次"无 skill 实验"**：观察 agent 在没有该 skill 时如何抄捷径、记录它的原始借口，再针对这些借口逐条写反驳。没看过失败就写出来的 skill，教的可能根本不是对的东西。
- **维护一张持续追加的 anti-rationalization 表**："Skip just this once"/"sunk cost"/"manual testing is enough" 这类借口会换马甲重现——每当观察到新借口，把它和反驳一起写进 skill，就像修 bug 一样修纪律。
- **按任务等级决定流程重量**：gate 体系在 15 秒能糊出原型、25 分钟跑完五阶段的项目上收益最大（"看着像"变"重启能保存"），但对一次性脚本和"打字员式"任务是纯开销。先估任务等级再决定上不上全套流程，弱模型（会跳步骤的那类）直接不用。
- **把失败预算写进工作流**：给自己设定硬性 STOP 触发器（如 3 次修复失败强制回根因），并把开放式收尾问题结构化成有限选项——这两条成本极低，却把最常见的两类 agent 失控（无限打转、自由发挥）关进了笼子。

## 相关实体

- [Superpowers 深度解析（1）：概率操控与负向收益](https://github.com/QianJinGuo/wiki-public/blob/main/entities/superpowers-claude-code-engineering-brain-baidu-geek.md) — 第 1 来源
- Harness Engineering
- [12 Agent 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/twelve-agent-design-patterns-yunduojun-datastudio.md) — 同样强调"确定性从 LLM 剥离"
- [AI Coding Agent Token 成本控制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/token-cost-control-coding-agent-devinyzeng-tencent.md) — Superpowers 多阶段会大幅增加 token 成本

---

