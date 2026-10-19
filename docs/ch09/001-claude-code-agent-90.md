# Claude Code 团队的代码审查流水线：当 agent 写 90% 的代码

> 📊 Level ⭐ | 13.9KB

Anthropic Claude Code 团队（Addy Osmani、Morgan Westlee Lunt、Qing Wang，2026-10-15）第一次完整公开了他们内部的 code review 流程：Claude 写了 Claude Code 自身约 90% 的代码，Anthropic monorepo 的每日变更量从 5 月的约 2,500 涨到 9 月的 30,000+，而 Claude Code 仓库在 6–9 月间合并的 PR 数量翻倍以上、需要 revert 的比例反而下降 40%+。他们的答案不是取消审查，而是**把「读 diff」这件事大部分交给机器，把人的时间留给机器做不好的判断，并把「快速撤销」做成一等公民**。

## 核心论点：把「有没有人读过代码」换成更好的问题

团队明确否掉了一个流行代理指标：「有没有人读过这段代码」并不等于「这次变更为什么可能出问题、该由哪种检查（自动或人工）来抓」。他们改问后者，于是**审查的时点也从「PR 末尾的一道门」变成「写作过程中的连续检查」**——多数变更在被要求人看之前，已经被 Claude 审查并修过至少一轮。

人力的目标被写成一个可度量的硬指标：Claude Code 各仓库（CLI、桌面端、Web、移动端）的绝大多数 PR 只需**至多一个人**在环（可以是作者本人）即可合并，且 revert / incident 率不得上升。他们用三个量测人时：每 PR 的人工 approval 数（中位数与 P95）、人工评论数、PR 等人时长；**revert 与 incident 率是护栏**——如果它们上升，说明人时并没有被省掉，只是从「审」转移到了「修」。

## 六层流水线：层，而不是一道门

一次典型变更要穿过六层检查，层与层之间互为补集，最后还有回滚兜底：

1. **PR 之前：先验证**。给 Claude 可执行的东西——测试、构建、可对比设计的截图——要求它「把输出贴出来」而不是声称完成；随后由一个**全新上下文的 subagent** 复核 diff。团队内部还会跑几支 skill：一支专找 bug、一支简化 diff、一支端到端验证行为；UI 变更还要过设计规范。Boris Cherny（Claude Code 作者）的说法被引用为：给 Claude 一个验证自己工作的办法，大概是拿到好结果最重要的一件事，估计能让最终质量提升 2–3 倍。
2. **每个 PR：required CI**。lint、类型、跨平台测试、构建与打包，红灯直接阻塞合并；一个典型 CLI PR 在人看之前可能已经跑了几十项检查。
3. **每个 PR：AI review**。对照整个仓库与 PR 声明的意图读 diff，问三件事：是否解决了它要解决的问题、是否契合系统、是否破坏了别的东西；修 bug 的 PR 还要找 root cause。研究预览阶段，内部 PR 拿到实质审查意见的比例从 **16% 升到 54%**；超 1,000 行的大 PR 大多有 finding，小 PR 大多干净返回。仓库可配 Quick / Standard / Deep 三档，漏一个 bug 代价高的仓库值得上 Deep。
4. **每个 PR：security review**。独立一遍，bug review 或 security review 任一仍有未关闭 finding 就不能合并；必须修掉或带理由关线程（这是清假阳性的方式），后续 commit 修好了 finding 会自动消失。
5. **风险分级的人工审批**。低风险（文档、文案、内部功能、带 flag 的增量变更）在自动审查与安全检查全绿后**不需要人**；中风险（普通产品变更，以及缓存、auto-updater、system prompt 等敏感面）**一个人**；高风险与少数指定路径**两个人**。分档由 **change 本身**由分类器判定，不由作者决定；第二个分类器再判断「这一档是否仍需要额外一个人」；CI workflow 文件等路径永远需要人。只有 trusted list（基本是拥有该仓库的团队）上的作者才享受轻量路径，其他人都要第二个人。**agent 的 approval 永远不能顶人的名额**；**一次 approval 只覆盖一个具体 commit**——如果之后又落了 agent 的 push 或手工解决的 merge，必须重新批准；**发起 agent 的人算一名必需 reviewer**，与亲手写代码同责。
6. **merge queue + flag + 渐进放量 + 快速回滚**。merge queue 在最新 main 上带变更重跑全部检查，避免两个各自通过的 PR 合成一个坏 main；新行为先藏在 flag 后给 Anthropic 员工用，公开版本先进 `latest` 渠道、`stable` 滞后；flag 可无部署关闭，坏构建直接 revert，团队有每周 on-call 轮值，事故复盘要回答「哪一层本该抓到」。

他们也坦白缺口：**目前还没有「按 revert / incident 指标自动收紧审批」的 circuit breaker**，工程师希望在更多代码走向零人工合并之前先有这个东西；并引用同事的话——放慢确实降低错误率，但主要因为你什么都做得更少，他们宁愿把「更快发现、更快修复」做好。

## 让 reviewer 变强的闭环：事故即 eval、噪声可度量、审查必须收敛

这套流程最有迁移价值的部分不是分层，而是**三个把 reviewer 本身当作被优化对象**的机制：

**① 事故即 eval（incidents are the eval）**。团队把历史上导致事故的 PR（连同 fix-forward 与 revert）收集起来，由熟悉那段代码的工程师逐条确认 bug 与其位置，构成一个 eval 集；reviewer 每天在该集合上跑分。每次改动 reviewer 的 prompt、工具或模型，都必须在这个集合上**分数上涨才保留，否则丢弃**；每来一次新事故就往集合里加一例。这把「reviewer 质量」从主观感受变成了可持续回归的指标。

**② 噪声也用行为度量**。多报 bug 很容易，所以团队把 reviewer 留下的每条评论按「人怎么回应」分类：修了、说它错了、说这是有意行为、认为不重要；另外还会在**已知干净的 PR** 上跑 reviewer，统计它多久会报出一次「照着改反而有害」的问题。写下来的优先级是：**先抓真 bug，其次才是减少 review 轮次**。

**③ 审查必须收敛**。agent 作者 + agent reviewer 可以无限互相喂活：有一个 CLI PR 一夜之间跑了 50 多轮审查与修复，最后被作者喊停；对 reviewer 反复 flag 的内容跑 `git blame`，**约 59% 是 reviewer 第一遍就已经在那里的旧代码**——reviewer 并不是每轮发现新 bug，而是每轮多挖出几个旧 bug。团队自己也承认是「默认跑几轮」的习惯加剧了这一点。于是他们同时追踪 rounds-to-pass 与 recall，并改了再审查策略：**三轮之后强制让作者退一步重新考虑方案**；第一轮之后只审新增 diff；**按 bug 类别 flag** 让作者一次修掉所有同类实例而不是一行；不重复贴已发过的 finding；另外让 review agent 每夜扫存量代码，提前发现老 bug。效果：单轮（一次 review + 修复）通过率 **65% → 78%**，需要 ≥5 轮的 PR 从 **8.9% → 1.5%**，平均审查轮次 **2.08 → 1.32**。

## 人留在哪里：五个决策与上下文传递

人的工作从「读每一份 diff」变成机器不擅长的判断：**该不该做这件事**（方向、品味、范围——有个自认为解决瓶颈的团队，仍对外部来的变更保留人工审查，就是为了有人问一句「我们到底该不该做」）、**风险代码**（计费、auto-updater、CI workflow）、**会被人照抄的架构**、**读证据**（测试输出、实际跑的命令与返回、截图、reviewer 的 finding；如果你说不出这些检查会漏什么，就该要求真审查而不是快速批准）、以及**对结果负责**——不管代码是谁敲的，上线的东西有人担责。

当机器承担了大部分「读」，团队共享上下文的方式也变了：他们没有正式流程，也没人脑内装着完整的 Claude Code 模型；需要理解某块代码时，就**让 Claude 为那一小片代码写一份讲解**（几分钟，且反映当下代码），有人还会让 Claude 生成可视化那部分代码的小 artifact。作者的判断是：与其逐行读琐碎 diff（一行文案改动几乎学不到东西），不如读「你即将修改的模块」的讲解。团队文化是默认在公开 Slack 频道做事，别人建造时你就看到了。

配套的团队规范是「**你合的，你负责**」：中小变更出问题通常由你修；让这条规范不失控的前提是变更小、一切可逆（flag / revert / 分阶段发布几分钟内撤销）、按 blast radius 提高审查强度、回归能通过 telemetry 与内部使用快速暴露，而且**这不是追责**——愿意修的人手里上下文最多，事故复盘看的是系统。

## 可直接照抄的采用清单

文章末尾给了一份按阶段的采用清单，几乎全是配置与流程约定，不需要新工具：

- **PR 之前**：给 agent 可运行的检查并写进简短的 `CLAUDE.md`；用 hooks 跑 formatter / linter；本地跑 `/code-review`、`/security-review` 或新上下文 subagent 审查；新建 `REVIEW.md` 承载「重复出现的审查意见」。
- **每个 PR**：强制 CI；PR 模板加 Testing / Risk / How to revert 三项；先在一个仓库接入 AI reviewer，调几周 `REVIEW.md` 再铺开；接入自动安全审查，并要求合并前所有审查线程已解决；按风险匹配审查深度；**给审查轮数设上限，前几轮之后只复审新增 diff**。
- **审批**：把风险分档写下来、**由变更而非作者决定**；轻量路径只给可信作者；用 CODEOWNERS 与分支保护保证 auth / 计费 / CI / 发布流程 / 安装器永远要人；**绝不让 bot 的 approval 替代必需的人工名额，新 commit 到来时撤销旧 approval**。
- **合并与之后**：merge queue、feature flag、内部先用、分阶段发布、一步回滚；**把事故与 revert 变成 eval 集**，reviewer 的 prompt / 工具 / 模型一变就重打分；用 revert 与 incident 率作护栏度量人时。

其中 `REVIEW.md` 的写法值得单独记：由 code owner 撰写，短，说清**在这个仓库里「坏」长什么样**（文档是「它在说谎」，配置是「它把流量路由错了」），限制 nit 数量，列出可跳过的路径，**要求给出文件与行号作为证据而不是从名字猜**，并要求总结以数量开头、没东西要修时直说。团队还会单独检查 reviewer 是否真的遵守了它。另一条经验是：**当自动 reviewer 反复 flag 同一件事，就在源头修**——改 skill、加 lint 规则、更新 `CLAUDE.md` / `REVIEW.md` 这类指令文件，而不是每轮手动纠。

## 对 harness 工程的含义

这篇一手材料把「harness 工程」里几个常被口号化的东西落到了可验证的机制上：**verification 前置**（先给 agent 可运行的验证物，再让它声称完成）、**审查即多层互补而非单门**、**审批权不可由 agent 代持且绑定到具体 commit**、**reviewer 自己要有 eval 集与噪声度量**、**收敛性（轮数上限 / 只审新 diff / 按类修复）是 agent 间互相喂活的必要刹车**。它同时印证了 [Verifier-Driven Development](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-driven-development.md) 的主线：真正决定产出质量的不是模型多强，而是「谁来验、验什么、验不过怎么办」这套制度设计。与 [Agentic Code Review](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-code-review-addyosmani.md)（同一作者更早的方法论文章）、[Baz 提升 AI code review 准确率的实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/how-baz-improved-its-ai-agent-code-review-accuracy-using-ama.md)、[百度 AICR](https://github.com/QianJinGuo/wiki-public/blob/main/entities/baidu-aicr-ai-code-review-ci-cd.md)、[Kitta 领域定制 code review agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/kitta-domain-customized-code-review-agent-aliyun-2026-10-09.md) 相比，本篇的独特价值在于**第一方、带指标、覆盖到审批与发布后半段**。

## 关联

- [Verifier-Driven Development](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-driven-development.md)
- [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- [Claude Code Agentic Harness 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-agentic-harness-design-patterns.md)
- [Agentic Code Review（Addy Osmani）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-code-review-addyosmani.md)
- [Baz：用 AMA 提升 AI code review 准确率](https://github.com/QianJinGuo/wiki-public/blob/main/entities/how-baz-improved-its-ai-agent-code-review-accuracy-using-ama.md)
- [百度 AICR：AI code review 进 CI/CD](https://github.com/QianJinGuo/wiki-public/blob/main/entities/baidu-aicr-ai-code-review-ci-cd.md)
- [Kitta：领域定制 code review agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/kitta-domain-customized-code-review-agent-aliyun-2026-10-09.md)
- [AI Agent Loops：Claude Code / Codex](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-agent-loops-claude-code-codex.md)
- [Claude Code 架构分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-architecture-analysis.md)

→ [原文存档](https://claude.dev/blog/solving-code-review-at-anthropic/)

---

