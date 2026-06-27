# gsd-get-shit-done-context-management-tool

## Ch01.184 gsd-get-shit-done-context-management-tool

> 📊 Level ⭐⭐ | 22.3KB | `entities/gsd-get-shit-done-context-management-tool.md`

[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/gsd-get-shit-done-context-management-tool.md)

# gsd-get-shit-done-context-management-tool
> 原文: https://mp.weixin.qq.com/s/LA3ZBVMUEUJMhek_LeHhjA
> Author: 袋鼠帝 (kangarooking)
> Score: value=7, confidence=8, product=56 ≥ 49 → PASS
> SHA256: a347934c625460b0b1c1f73d6ade51f57c6c4b07ffa9f1b525abfe44af28e1be
> 长度: 7236 字符
> 摘要: GSD (Get Shit Done) Claude Code 增强工具，四层上下文结构(ROADMAP→Phase→Plan frontmatter→Summary provides/affects)+context-budget 4档退化+6步phase流程，零工平台15天/638 commits/7 phase落地
---

## 上下文失控，才逼我找到 GSD
在遇到 GSD 之前，作者试过 Superpowers 和 gstack 两个 Claude Code 插件。两个工具的思路是"将通用大模型强行赋予角色，按企业架构划分工作"——架构师/开发者/测试者。在单个功能点上很顺，但面对零工平台这种体量的项目，代码跑着跑着 agent 开始"忘事"——字段命名丢了、模块依赖没接上、上下文里没有足够的 plan 细节。
核心问题：它们偏向"将工作按角色拆分"，而不是"将上下文按依赖拆分"。面对庞大代码库，总是会丢失很多计划细节。

## GSD 是什么
**GSD** (Get Shit Done) 是一个发布在 npm 上的 Claude Code 增强工具包，包名 `get-shit-done-cc`。
安装：
```bash
npx -y get-shit-done-cc@latest --claude --global
```
装完落到 `~/.claude/get-shit-done/`，版本 v1.38.5。默认运行时是 Claude Code，也支持 codex/gemini/kilo/opencode 等多个 runtime。
目录结构：

- `bin`：30+ 个 Node 工具脚本，所有 GSD 命令的执行引擎
- `workflows`：85 个 .md 工作流定义，每个 `/gsd-*` slash 命令的逻辑在这里
- `contexts`：dev/research/review 三种上下文模式，控制 agent 的读取深度
- `references`：30+ 篇方法论文档，`context-budget.md` 是其中权重最高的一篇
- `templates`：PLAN/SPEC/DEBUG/VERIFICATION 等标准文件模板
GSD 把自身注入到 Claude Code 的 slash 命令体系。在任何项目目录里运行 `/gsd-new-project`，GSD 就开始接管。

## 四层结构：让 agent 只看它该看的那部分
GSD 解决的问题不是"给 AI 定角色"，核心在于"给 AI 定边界"——每次执行，只让 agent 看它真正需要看的那部分上下文。

### 第一层 · ROADMAP（项目层）
把整个项目切成 phase + 并行 lane。
以零工平台为例，一期拆成 10 个 phase：

- Phase 1 工程脚手架与数据库基线
- Phase 2 身份与认证隔离底座
- Phase 3 设计系统与 UI 基线
- Phase 4 项目与岗位管理
- Phase 5 分享与报名链路
- Phase 6 入职确认与关系中心
- Phase 7 考勤导入与在岗管理
- Phase 8 推荐奖励与抽佣结算
- Phase 9 钱包、提现与开票
- Phase 10 配置、日志与数据导出
同时 ROADMAP.md 定义了 4 条并行 lane：

- Lane A 骨架主链（1→2→4→5→6）
- Lane B 数据链（1→2→7）
- Lane C UI 基线（1→3）
- Lane D 结算链（依赖 6+7，然后 8→9→10）
每个 phase 的前置依赖一目了然，不同 lane 可以并行推进而不互相阻塞。
截至2026-05-05，已落地 7 个 phase，milestone v1.0 状态标为 `milestone_complete`。

### 第二层 · Phase（边界显式定义）
每个 phase 对应 `.planning/phases/NN-phase-name/` 文件夹，里面结构固定：

- `NN-CONTEXT.md`：本 phase 的边界定义、架构决策（ADR）、技术选型。agent 进入任何 phase 前先读这个文件，建立本 phase 的"地图"
- `NN-XX-PLAN.md`：子计划，每个对应一个可独立执行的最小交付单元
- `NN-XX-SUMMARY.md`：执行完成后填写，记录实际产出和影响范围
零工平台现在的 `.planning/` 目录有 273 个 markdown 文件，合计 31MB。7 个 phase 文件夹，每个 phase 平均 30 多个子文件。

### 第三层 · Plan frontmatter（机器可执行合约）
PLAN.md 的 frontmatter 是整套机制最关键的一层——这里存的不是"说明文字"，而是"机器可执行的合约"。
以零工平台 `05-01-PLAN.md`（gig_application 报名主表 + 9态状态机 + Liquibase 迁移）为例：
```yaml
phase: "05"
plan: "05-01"
type: feature
wave: 1
title: "gig_application 报名主表 + 9 态状态机 + Liquibase 迁移"
requirements:

  - APPLY-02
  - APPLY-03
  - APPLY-04
  - APPLY-10
depends_on:

  - "04-02"  # gig_job 岗位表已存在
  - "02-01"  # worker 用户认证底座
files_modified:

  - "linggong-backend/src/main/java/com/linggong/apply/domain/GigApplication.java"
  - "linggong-backend/src/main/java/com/linggong/apply/mapper/GigApplicationMapper.xml"
  - "linggong-backend/src/main/resources/db/changelog/2026/05-01-gig-application.yaml"
must_haves:
  truths:

    - "gig_application 表存在且含 9 态枚举 + active_token 列"
    - "状态机只能按 PENDING→APPROVED→ACTIVE→... 顺序流转，非法跳转抛异常"
artifacts:

  - path: "linggong-backend/src/.../GigApplication.java"
    provides: "9 态状态机实体 + 状态流转方法"
key_links:

  - "GigApplication.gigJobId → GigJob.id（外键约束存在）"

## ## 相关实体

## ## 相关实体
```
9 个字段各司其职：

更重要的是这套设计的"反面效果"：一个 plan 里没有列出来的文件，agent 原则上不该碰。这把"不要乱改"从口头约定变成了结构约束。

### 第四层 · Summary（provides + affects 构成上下游引用网络）
SUMMARY.md 的 frontmatter 里有两个关键字段：

这两个字段构成了整个项目的"引用网络"。任何一个新 plan 的 agent 在读 `depends_on` 时，可以只做 frontmatter 扫描——找到"我需要的上游 SUMMARY 在哪里"，再按需深读对应文件的具体内容。不需要把整个 `.planning/` 都塞进上下文。

## context-budget 4档退化机制
GSD 的 `references/context-budget.md` 定义了一套上下文消耗的退化等级：
| 等级 | 上下文占比 | 策略 |
|------|-----------|------|
| PEAK | 0-30% | 全力运行，SUMMARY/VERIFICATION/RESEARCH 全文都可以读 |
| GOOD | 30-50% | 优先读 frontmatter，把重型读取任务激进委派给 subagent |
| DEGRADING | 50-70% | 节俭模式，主动向用户警告上下文接近上限 |
| POOR | 70%+ | 紧急 checkpoint，除非关键操作否则停止继续读取 |
**早期信号**：如果 agent 开始出现"appropriate handling"、"standard patterns"这类含糊措辞——不报错、也不说具体怎么做——那不是 agent 在正常思考，那是上下文即将退化的前兆。

## Subagent 委派：orchestrator 本身不读大文件
GSD 的上下文节省还有一层：主 agent 自身不直接读取大文件，而是把读取任务委派给 subagent。subagent 从磁盘独立加载，处理完只返回精简结果给 orchestrator。
这就像调度员和执行员的分工：主 agent 说"你去读 Phase 5 的 CONTEXT，给我提炼出依赖关系"，而不是把整个文件塞进自己的上下文里。这条规则让主 agent 始终保持相对轻量的上下文。

## 六步走完一个 phase
GSD 把一个 phase 从"想法"到"落地"拆成 6 步，每步对应一个 slash 命令：
1. `/gsd-discuss-phase` — **唯一"人必须在场"的一步**。GSD 用 Socratic 方法把灰色地带逐条问清楚：phase 的边界在哪里？数据结构怎么定？有没有和上个 phase 的衔接问题？状态机的流转顺序是什么？目的是把所有不确定性消灭在"写代码之前"。
2. `/gsd-plan-phase` — 把 discuss 阶段的结论落成 PLAN.md。自动生成所有子 plan 的 frontmatter 骨架，agent 自动做 verification loop：检查 `depends_on` 里的 SUMMARY 是否存在，检查 `files_modified` 里的路径格式是否合法，检查 `must_haves.truths` 是否可以被客观验证。
3. `/gsd-execute-phase` — Wave-based 并行执行。agent 根据 `depends_on` 自动排执行波次：没有相互依赖的 plan 在第一波并行跑，依赖第一波产出的 plan 在第二波再跑，以此类推。
4. `/gsd-verify-work` — 用 `must_haves.truths` 做 UAT 验证。逐条核查：表存在吗？字段对吗？状态机约束生效吗？这步会出 VERIFICATION.md，每条 truth 都有明确的通过/失败记录。
5. `/gsd-secure-phase` — 安全审计。对照 PLAN.md 里的 `threats_open/threats_closed` 检查威胁是否实际被处理。
6. `/gsd-progress` 或 `/gsd-next` — 任意会话开始时运行，agent 会扫描 STATE.md 和最近的 SUMMARY.md，把当前项目进度重建出来。
辅助命令：

- `/gsd-pause-work`：生成 `.continue-here.md`，记录当前会话的挂起状态，方便跨天继续
- `/gsd-resume-work`：从 handoff 文件恢复，不用重新口头描述
- `/gsd-thread`：持久化跨会话的上下文 thread
- `/gsd-debug`：带 checkpoint 的系统化 debug
- `/gsd-undo`：用 phase manifest 安全做 git revert
**最关键的一条认知**：GSD 并不能帮你发散想法，它能做到把你的想法完美执行。GSD 假设你已经知道要做什么——剩下的问题是"怎么把执行过程拆给 AI 而不丢失细节"。如果在 discuss-phase 阶段你自己都没有想清楚，GSD 会帮你把"没想清楚"的东西按他的理解去实现，但这样往往会造成返工。

## 实战数据
零工平台项目：15 天、638 commits、三端代码，7 个 phase 全部落地，80 个 plan 完成，STATE.md 总 plan 数 97 个。
三条体会：
1. **上下文可以真正"关掉"**：所有计划细节都在 `.planning/` 里，可以随心所欲清理上下文或重开窗口，执行 `/gsd-progress` 或 `/gsd-next` 即可召回当前项目进度并继续工作。在 15 天 638 commits 的节奏里，从没有因为"上下文丢了"而重做什么。
2. **细节丢失率明显下降**：因为边界被 frontmatter 写死了——字段命名前后不会不一致，接口约定不会被 agent 自行"优化"掉，状态机的边界不会在执行里被悄悄扩展。
3. **discuss-phase 是最值得投入的一步**：在 `/gsd-discuss-phase` 阶段一定要尽可能把想法和规划讨论得清清楚楚。不要觉得"大概说一下 agent 会自己补全细节"——它不会。返工在大型项目里代价极高，因为后续 phase 往往已经依赖了上一个 phase 的产出。

## 关于适用范围
GSD 不是万能的。如果做的是探索性的小 demo、POC、或者功能本身还没想清楚，GSD 的 frontmatter 体系会是负担。它的价值在"一个人脑装不下的规模"时才真正显现：三端、多状态机、复杂依赖、多个并行 phase。
**核心判断**：大型项目 AI 协作的瓶颈，不是模型的代码生成能力，而是上下文管理。GSD 解决的是"把规划做扎实再让 agent 落实"这一段。它不替你想，但它能保证你想的东西不在执行过程中悄悄走样。
---

## 深度分析
### 上下文管理的本质：从"角色分工"到"依赖结构"
Superpowers 和 gstack 的失败不是工具本身的错，而是范式层面的错位——它们用**角色切片**来分解工作，假设"如果每个角色都知道自己的职责，协作就会自然发生"。这个逻辑在人类社会组织中成立，但在 LLM agent 的上下文管理中并不成立：agent 没有持久记忆，没有主动对齐机制，角色边界靠的是上下文里的描述而非硬约束。
GSD 的核心洞察是：大型项目中 agent 的失败不是"不知道该做什么"，而是"看了太多不该看的东西导致注意力分散"——典型的上下文污染问题。解决这个问题的路径不是给 agent 定角色，而是**把依赖关系显式编码进文件结构**，让 agent 在任何时刻都只在看它需要看的最小上下文。
这套机制本质上是在做**约束编程**（constraint programming）式的上下文管理：不是告诉 agent "你可以做什么"，而是告诉 agent "你不应该看什么"。frontmatter 的 `files_modified` 字段就是这个约束的具体化——不在列表里的文件，agent 原则上不动。这比任何口头约定或 system prompt 级别的指导都更有效，因为它是结构性的、不可绕过的。

### 四层结构的层级语义
GSD 的四层结构（ROADMAP → Phase → Plan frontmatter → Summary provides/affects）不是简单的目录嵌套，而是四层不同粒度的**决策记录**：

- **ROADMAP**：战略层，回答"项目以什么顺序推进，哪些 lane 可以并行"
- **Phase**：战术层，回答"这个阶段的边界是什么，依赖什么架构决策"
- **Plan frontmatter**：执行层，回答"这个最小单元交付什么，依赖谁，影响谁"
- **Summary provides/affects**：变更影响层，回答"这个交付物会被谁引用，形成什么依赖网络"
每一层都在解决不同的问题：ROADMAP 解决**并行排序**，Phase 解决**边界固化**，Plan frontmatter 解决**执行合约**，Summary 解决**引用追踪**。四层加在一起，构成了一个完整的**项目知识图谱**，而不仅仅是文件清单。

### context-budget 的本质：主动退化而非被动溢出
大多数上下文管理工具的策略是"尽可能塞满上下文直到 OOM"。GSD 的 context-budget 采取的是主动退化机制——在上下文占比达到不同阈值时触发不同的降级策略。这比被动溢出的好处是：agent 可以在仍然清醒的状态下做上下文清理，而不是在已经开始"胡说八道"之后才发现问题。
特别值得注意的是"早期信号"那段描述：agent 开始使用"appropriate handling"、"standard patterns"这类含糊措辞时，不是正常思考，而是退化前兆。这个观察非常精准——当 LLM 开始泛化而非具体化时，往往是上下文压力导致的信心下移。

### subagent 委派：调度员-执行员模式
GSD 的 orchestrator-subagent 分离，本质上是在模拟人类社会中的**委托-代理机制**：调度员不亲自执行，而是把任务委派给执行员，执行员对结果负责。这个模式解决了一个关键问题：主 agent 的上下文是有限的，但如果把大文件读取也放进主 agent 的上下文，很快就会达到 budget 上限。
这个设计还有一个隐含的好处：**边界清晰的责任追溯**。如果某个 subagent 读错了文件、执行错了任务，问题很容易定位——因为 subagent 的职责范围是严格受限的。这比"整个项目都在主 agent 上下文中运行，出错了不知道哪里出问题"要可控得多。
---

## 实践启示
### 1. 在讨论阶段（discuss-phase）投入足够的时间是回报率最高的操作
GSD 的实践数据表明，"discuss-phase 是最值得投入的一步"。这个结论看似违反直觉——代码还没写呢，为什么要先花时间讨论？
但真相是：discuss-phase 的质量直接决定了后续所有 phase 的返工率。在大型项目中，上下游依赖是刚性约束——一旦 Phase 5 的产出被 Phase 6 引用，Phase 5 的任何修改都会波及 Phase 6。如果在 discuss-phase 没有把数据结构和状态机流转说清楚，后续的修改代价会呈指数增长。
实操建议：在 discuss-phase 使用 Socratic 方法，逐条追问边界条件、异常路径、数据一致性假设。不要假设"agent 会自己补全"——它不会，而且它会把你的模糊假设按最"合理"但未必是你想要的方式实现。

### 2. frontmatter 的 `files_modified` 字段是最重要的约束机制
在所有 frontmatter 字段中，`files_modified` 是最容易被低估的。它的真正价值不在于"告诉 agent 去哪里改"，而在于"告诉 agent 不要去哪些地方改"。这个"反向约束"比任何口头约定都更有效，因为它被写进了结构化数据里，agent 无法绕过。
实操建议：在编写 `files_modified` 时要足够精确——不是目录级而是文件级。不要写 `src/main/java/com/linggong/apply/` 而是写到具体的 `.java` 或 `.xml` 文件。同时，`files_modified` 里没有的文件，agent 确实不应该碰——如果碰了，那就是执行纪律问题，需要返工。

### 3. context-budget 的四档退化应该被主动监控
不要等到 agent 开始出现"appropriate handling"这类措辞时才意识到上下文已经紧张。在日常使用中，应该建立对 context budget 的主动监控意识——当你注意到 agent 的输出开始变得泛化、缺乏具体细节时，第一反应应该是检查 context budget 是否已经进入 DEGRADING 区间。
实操建议：在 PEAK 区间保持全力输出，在 GOOD 区间开始把重型任务委派给 subagent，在 DEGRADING 区间主动做 checkpoint 并清理不必要的上下文，在 POOR 区间暂停新任务、优先做上下文恢复。这套主动管理机制比被动应对要高效得多。

### 4. Summary 的 `provides` / `affects` 是构建引用网络的基础
`provides` 和 `affects` 这两个字段构成了整个项目的"引用网络"——任何一个新 plan 都可以通过扫描这两个字段快速定位自己需要依赖哪些上游 SUMMARY，不需要把整个 `.planning/` 目录都塞进上下文。这个机制让项目的知识管理从"文件归档"升级为"依赖图谱"。
实操建议：在每个 plan 完成后的 SUMMARY 中，认真填写 `provides` 和 `affects` 字段。`provides` 要具体到"哪些表、哪些字段、哪些接口"，`affects` 要列出"哪些下游 plan 会引用这些产出"。这个网络的密度直接决定了后续 plan 的上下文定位效率。

### 5. GSD 的适用范围是"一个人脑装不下的规模"
这是最重要的一条认知：GSD 不是万能的。它的价值在"一个人脑装不下的规模"时才真正显现。如果你的项目是探索性的小 demo、POC、或者功能本身还没想清楚，GSD 的 frontmatter 体系会是负担而非助力。
**判断标准**：当你发现自己在向 agent 解释项目背景时，需要反复提到"之前那个模块"、"那个状态机"、"那个接口"——这些跨上下文引用说明项目的依赖关系已经超出了人脑的直接管理范围，这时 GSD 的价值就显现了。如果项目还在 POC 阶段，依赖关系还不稳定，frontmatter 的结构化约束反而会限制探索的灵活性。

- [Ralph Loop 不够用：长时间 Agent 还缺这 3 件事](/ch01-308-ralph-loop-不够用-长时间-agent-还缺这-3-件事/)
- [Personal AI 工作台：Claude 18 动作框架](/ch01-210-personal-ai-工作台-claude-18-动作框架/)

## Related
- [Code as Agent Harness 综述](/ch09-046-code-as-agent-harness-综述/)

- [Claude Code 源码核心机制详解](/ch01-162-claude-code-源码核心机制详解/)

---

