---
source: wechat
source_url: "https://mp.weixin.qq.com/s/0NuS75Bcys0xNCp9wNl8aw"
ingested: 2026-07-07
feed_name: "阿里技术"
source_published: "2026年7月7日 18:08"
sha256: 929e7678bf01dc7416f1e6aaa3edf0e959e0fd039fc4523eb40a80d99bfece69
---

这是2026年的第 31 篇文章

（ 本文阅读时间：约15分钟 ）

01

当 AI 开始写代码，「敢不敢发」成了新问题

先看一组数据：

> a1 CLI（一款统一研发命令行工具）—— 数十万行 Go 代码，数百个命令定义，上百个 真实 API 冒烟用例，十余条 CI 流水线共近三千行 pipeline YAML。日均活跃用户数万，周调用量数亿次（已去除 CI 自动化调用的真实用户口径）。三个多月发布了上百个正式版本；最近 30 天几乎每个工作日发布一个版本。

这是一个日活数万、覆盖仓库管理、合并请求、CI/CD 流水线、应用发布、需求缺陷等研发全链路的生产级 CLI 工具，不是 Demo。而且，在这套高频发布体系中，AI Agent 深度参与了代码生成、测试生成、工作项分析等多个环节。

我们都知道，自动驾驶汽车有 L1 到 L5 的安全等级认证：辅助驾驶可以上路，但完全无人驾驶需要层层验证才能获得信任。再看向 AI Agent 驱动的软件研发，正在经历类似的信任建立过程。

眼下，AI Agent 已经能自主完成需求分析、代码编写、测试生成甚至 Code Review。但每次看到 Agent 提交的 MR，团队成员心里难免会浮现一个问题：这次改动，敢直接发到生产环境吗？

传统 CI/CD 流水线解决的是「人写的代码如何安全发布」的问题；AI Agent 时代，这个问题变成：如何让一个本质上具有随机性的 AI 系统，产出可预测、可信赖的代码变更？

基于此，本文以 a1 CLI（一款统一研发命令行工具）为例，分享我们团队如何通过一套完整的 CI/CD 体系，从「不敢发」进阶到「每个工作日自动发版」。其中最核心的挑战，是如何 harness AI 的随机性。

02

第一道防线：代码准入

在代码合入主干之前，我们用多层自动化门禁替代对人工 Review 的单一依赖。核心理念是 「分层 + 快速反馈 + 逃生舱」 三位一体。

### 2.1 分层门禁体系 

第一层：单元测试 + E2E 覆盖率门禁。每次 push 或 MR 自动触发，覆盖率低于 75% 直接阻断合并。这是最基础的质量底线。

第二层：全量冒烟测试（真实 API）。这是我们区别于传统 CI 的关键：并行调用真实的平台 API，不是跑 mock 测试；测试资源通过命名隔离确保互不冲突。真实 API 冒烟能暴露 mock 掩盖不掉的接口契约变更、权限模型调整等问题，任一用例失败，MR 都会被阻断。

第三层：文档同步检查 + 测试清单一致性检查。改了命令或 flag，就必须同步更新文档站（`pages-sync-check`）；同时，测试清单一致性检查（`smoke-manifest-check`）确保冒烟用例清单与实际命令树保持同步——新增了命令却没登记到冒烟清单，同样会被拦下。没更新？MR 直接被阻断。

第四层：命令下线规范检查（`cmd-retire-check`，全新流水线）。命令的「下线」往往比「新增」更危险——直接删掉命令会破坏用户脚本、留下文档残链。这条流水线强制校验命令下线的四项规范：统一走废弃入口、保留下线测试覆盖、文档同步移除、命令树 smoke 引导。同样提供 `[skip-retire-check]` 逃生舱。

### 2.2 逃生舱机制 

门禁要严格，但不能把人锁死。因此，我们在每个门禁环节都设计了逃生舱：

  *   *   *   *   *   *   *   * 

    
    
    # pages-sync-check.yaml — 逃生舱设计# MR 标题含 [skip-pages-check] 跳过（用于确无 surface 变更的纯重构/bugfix）TITLE='${{git.merge_request.title}}'case "$TITLE" in  *"[skip-pages-check]"*)    echo "检测到 [skip-pages-check] 标记，跳过 pages 同步检查"    exit 0 ;;esac

这个设计哲学贯穿始终：机器负责守规矩，人保留最终决策权。

03

AI 生成的动态冒烟测试——驯服随机性的核心战场

全量冒烟测试覆盖的是「已知」的测试用例。但 AI Agent 提交的代码变更，往往涉及新增命令或修改 flag，这些则是现有测试覆盖不到的「未知」区域。

对此，团队的解决方案是：让 AI 自己写测试来验证 AI 的代码变更，形成「AI 自检」的闭环。这是我们最复杂的一条流水线（`dynamic-smoke.yaml`，上千行），也是驯服 AI 随机性的核心战场。

### 3.1 核心流程

  *   *   *   * 

    
    
    build-cli ─────┐                ├─→ prepare-bundle → llm-generate-spec → run → collect-summarybuild-dynsmoke ─┘                                              │                              detect-denylist-change → denylist-manual-review（两段式人工卡点）

  1. 影响面分析：`dynsmoke prepare` 基于 `git diff` 自动识别受影响的命令，提取每个命令的 `--help` 文本和 surface diff（新增/修改的 flag）。

  2. LLM 生成测试 spec：将命令上下文注入 prompt，调用大模型生成符合 JSON schema 的测试用例。

  3. 执行与命名隔离：跑真实 API 执行生成的用例，通过唯一 ID 命名隔离确保并发测试的资源不冲突。

  4. Stop hook 自愈：LLM 输出完毕后，`stop-validate-spec.sh` 自动校验输出格式。不合规则拒绝，要求 LLM 重新生成（内置 runaway-loop guard，最多重试 3 次，防止无限自愈死循环）。


3.2 约束 AI 随机性的五把锁

AI 的随机性不可消除，但可以被约束在可控范围内：

  * Schema 约束：`dyn_spec_schema.md` 定义了测试用例的严格 JSON 结构，LLM 只能在这个框架内“发挥创意”。

  * Prompt 工程：不给 LLM 自由发挥的空间，把完整的命令上下文（help 文本、diff、surface 变更）直接内联到 prompt 中，LLM 一进来就看到完整任务 + 完整数据。

  * Deny-list 机制：`denied_commands.go` 的 `DeniedCommandPrefixes` 是 deny-list 的单一数据源，维护不可测命令前缀（如管理类命令、日志类命令），在 prepare 和 run 两个阶段双重剔除。

  * Deny-list 变更两段式人工卡点：这是 deny-list 最阴险的风险：往列表里加一行前缀，就能让一批命令在动态冒烟里“静默跳过”，而单测会跟着一起改，CR 极易漏看这“一行 diff”。防护是流水线末尾的两段式卡点：`detect-denylist-change` job 检测 diff 是否改动了该文件（结果写 output，任何 git 异常都 fail-safe 输出 `changed=true`，宁可多卡不可漏卡，并把审核原因写成 Markdown 展示到流水线页面）→ 命中后 `denylist-manual-review` job 走人工审核（审核人复用发布审核人组）；未命中则整个 job 被跳过。

  * 唯一 ID 隔离：`DYNSMOKE_RUN_ID`（pipeline 实例 ID）确保每次运行创建的测试资源名称全局唯一，不与历史 run 冲突。

* * *

04

CI 历史反馈闭环：让 AI 从失败中学习

前面的手段都是「约束」：限制 AI 的输出空间、校验格式、隔离影响。但，约束只能防止 AI 犯新花样的错，无法防止它重复犯同一个错。

AI Agent 本质上是无状态的：每次被调用，它不记得上次生成了什么、哪里失败了。如果一个 MR 的动态冒烟测试第一次跑失败了（比如 LLM 生成了错误的测试 spec），用户点"重跑"，AI 很可能犯完全相同的错，因为它根本不知道上次发生了什么。

解决方案：人为赋予 AI 「短期记忆」。在动态冒烟流水线中，我们加了一个关键步骤 `fetch-ci-history`。通过 CLI 获取最近一次 CI 运行记录，将失败日志注入到 LLM 的 prompt 中。

这里有一个有趣的「套娃」设计：a1 CLI 的 CI 流水线，用 a1 CLI 自己来查询自己的 CI 运行记录。a1 CLI 本身就是研发命令行工具，`ci run list` 是它提供给所有用户的能力——现在我们让它在自己的流水线里调用自己，把上次的失败日志喂给 AI，帮助 AI 在下次生成更好的测试用例。这种「吃自己的狗粮」（dogfooding），让工具的能力和工具自身的质量保障形成了自我增强的闭环。

### 4.1 核心机制

  *   *   *   * 

    
    
    # fetch-ci-history.sh — CLI 用自己查自己的 CI 历史（套娃！）# ci run list 本是给所有用户用的命令，现在工具自己也在用a1 ci run list --branch "$branch" --per-page 10 \  --pipeline "$PIPELINE_ID" --repo "$REPO" -f json

工作流程：

  1. 双重过滤精准定位：按 Pipeline ID 过滤（避免误取无关流水线的日志）+ 按 Commit SHA 过滤（只看同一 commit 重跑前的那次失败）。

  2. 提取失败证据：仅对失败终态（FAILED / ERROR / TIMEOUT）的 job 拉取日志。

  3. 日志截断防膨胀：单 step 日志截到 16KB 上限，防止 prompt 超长。

  4. 注入 prompt：序列化为 markdown，渲染到 prompt 模板的 `{{RECENT_CI_HISTORY}}` 占位符。

### 4.2 Soft-skip：绝不因为「学习」而阻塞「发布」

这里有一个关键的设计取舍：CI 历史获取本身可能失败（网络抖动、凭据过期、API 异常），但这绝不能阻塞流水线。

  *   *   * 

    
    
    # soft-skip 设计：任何失败都写 unavailable 兜底，永远 exit 0bash "scripts/dynsmoke/fetch-ci-history.sh" \  "$HEAD_BRANCH" "$REPO" "$OUT" "$PIPELINE_ID" "$CURRENT_COMMIT" || true

LLM 看到 `> CI history unavailable` 后会按 best-effort 继续工作，而不是拒绝任务。

我们的核心洞察：这就像考试后发回批改的试卷一样，AI Agent 本身是没有记忆的，但通过 CI 历史注入，我们人为赋予了它“短期记忆”。这是将 AI 的无状态特性转化为有状态学习能力的关键桥梁，也是从「被动约束」到「主动引导」的转折点。

* * *

05

发布准入：从 Beta 灰度到人工审核

代码合入主干后，发布就不单是一个动作了，是一个渐进式的信任积累过程。

### 5.1 发布流水线全景

  *   * 

    
    
    smoke ─→ beta-release → manual-review → analyze-beta-telemetry → telemetry-review → auto-release-tag → deploy-pages         （5% 灰度）    （第一道人工）   （查真实日志数据）      （第二道人工·条件触发）  （AI 写 notes+打 tag）

我们的 release-pipeline 每工作日 10:00（Asia/Shanghai，`cron: "0 10 * * 1-5"`）定时触发（也支持手动触发），完整链路包括：

  1. 冒烟测试：跑真实 API 冒烟，通过后才进入发布（`skip_smoke` 参数可在紧急场景跳过，默认 false）。

  2. Beta 灰度发布：测试通过后自动构建 beta 版本，5% 流量灰度（`BETA_RATIO=5`），上传到对象存储。

  3. 第一道人工审核卡点：`manual-validator` 组件，灰度观察一段时间后，审核人决定是否继续。

  4. Beta telemetry 质量分析（关键环节）：`analyze-beta-telemetry.sh` 自动查询生产日志，统计 beta 版本的整体失败率、Top 失败命令、CI vs 非 CI 失败率对比、错误类型分布，用真实用户的真实使用数据为发布决策提供依据。

  5. 第二道人工审核卡点：当 telemetry 分析发现异常（`has_anomaly=true`）时触发 `telemetry-review`，把失败率报告推到审核人面前；数据健康则自动跳过，不打扰人。

  6. 自动打 Release Tag：审核通过后，LLM 从 merged MR 描述自动生成 release notes（同样有 Stop hook 校验格式），打 tag 触发正式发布流水线。

  7. SKIP_RELEASE 门控：若距上次发布没有新的 MR 合并，`collect-changes.sh` 会写 `skip_release=true`，整条发布直接跳过；不制造空版本、不刷屏。

### 5.2 版本一致性保障

一个容易被忽视的细节是，打 tag 的 commit 必须与 beta 灰度验证的 commit 严格一致。如果中间有人偷偷往 master 推了一个 commit，灰度验证的就不是最终发布的版本。

针对这个细节，我们的做法是：beta-release job 在构建时把 commit SHA 记录成 artifact，下游 auto-release-tag job 读取这个 SHA 作为打 tag 的基准，而不是简单地用当前 HEAD。不止 commit SHA，我们还顺带记录了 beta 版本号和发布时刻，供后续 telemetry 分析精确定位「分析哪个版本、从什么时间点开始看日志」：

  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   * 

    
    
    # release-pipeline.yaml — beta 构建时记录 commit / 版本号 / 发布时刻- id: record-beta-commit  run: |    set -euo pipefail    BETA_COMMIT=$(git rev-parse HEAD)    mkdir -p .beta-release    printf '%s' "${BETA_COMMIT}"  > .beta-release/commit-sha    # 供 auto-release-tag 打 tag    printf '%s' "${BETA_VERSION}" > .beta-release/beta-version  # 供 telemetry 分析精确定位版本    # 发布时刻作为 telemetry 查询窗口起点：只统计 beta 发布之后的日志，而非固定回看 48h    printf '%s' "$(date '+%Y-%m-%d %H:%M:%S')" > .beta-release/publish-time- uses: upload-artifact  inputs:    name: beta-release-info    # 坑点：必须显式列出每个文件，不能写 path: .beta-release/。    # upload-artifact 用 glob 匹配，给目录路径只会匹配目录本身、不递归其中的文件，    # 结果打出一个空 zip（126 bytes），下游拿不到 commit-sha。    path: |      .beta-release/commit-sha      .beta-release/beta-version      .beta-release/publish-time    if-no-files-found: error   # 文件缺失直接 fail，宁可红一次也不让下游拿到脏数据

这里藏着一个真实踩过的坑。`upload-artifact` 如果直接写 `path: .beta-release/`，glob 只会匹配到目录本身而不递归其中的文件，最终打出一个 126 字节的空 zip。下游 job 静默拿不到 commit SHA，退回用当前 HEAD 打 tag，版本一致性保障就被悄悄架空了。

所以，我们坚持显式列出每个文件 + `if-no-files-found: error` 强校验：宁可让流水线红一次，也不让一个「看起来成功、实际拿到脏数据」的版本溜过去。这正是前文里反复强调的 fail-safe 原则在细节处的又一次体现。

### 5.3 用真实数据为发布「背书」：Beta Telemetry 分析

传统灰度发布的问题是，「灰度观察一段时间」到底观察什么？ 很多团队的“灰度”，其实是「等一段时间没人报障就发」。实际上，这是一种消极的、依赖运气的信任。

针对这个问题，我们把这一步骤做成主动的数据分析。beta 灰度后，`analyze-beta-telemetry.sh`（约 400 行）通过运维 CLI 查询生产日志服务，对灰度中的 beta 版本做四个维度的量化分析：

  1. 整体失败率：beta 版本的命令执行失败占比；

  2. Top 失败命令：哪些命令在 beta 版本上失败最多；

  3. CI vs 非 CI 失败率对比：区分自动化调用与真实用户，避免 CI 噪声掩盖真实问题；

  4. 错误类型分布：按错误类别聚合，快速定位是网络、鉴权还是逻辑问题。

分析结果汇总成 Markdown 报告，并输出一个 `has_anomaly` 布尔值。只有当真实数据显示异常时，才会唤起第二道人工审核（`telemetry-review`）。也就是说，把一份带着失败率数字的报告推到审核人面前，让人基于数据而非直觉做发布决策。

这里同样贯彻了 fail-safe 原则：telemetry 查询本身失败时（日志服务超时、权限异常），`has_anomaly` 默认置为 `true`——查不到数据就等于「无法证明是安全的」，宁可多惊动一次人，也不让一个未经验证的版本溜过去。

这里的核心洞察是，从「等一段时间」到「看真实数据」，灰度发布从消极等待升级为主动验证。AI 帮我们写代码、写测试、写 release notes，而真实用户的 telemetry 数据，则成了为每一次发布「背书」的最后一道客观证据。

06

发布后流程：AI Agent 自动闭环

当然，发版成功不是终点。对于 AI Agent 驱动的研发流程，还有一个环节容易被忽略，那就是工作项的状态同步。

MR 合并后，我们有一条独立的流水线（`mr-workitem-check.yaml`）自动完成闭环：

  1. 收集上下文：`gather-context.sh` 提取 MR 的 diff + 关联工作项的详情，序列化为 `context.json；`

  2. AI 分析判断：调用 Coding Agent（单 Agent 编排、30 分钟超时）分析代码变更是否满足每个工作项的需求描述，输出同样有 Stop hook 校验；

  3. 自动更新状态：通过 CLI 自动更新工作项状态 + 添加评论；这一步 `continue-on-error: true`——即使 AI 判断某工作项未满足，更新 job 本身也不阻塞流水线；

在此之后，文档站部署、分发、发版通知等收尾动作也都自动完成，无需人工介入。

从代码提交到工作项闭环，整个链路实现了无人值守的全自动闭环。其中最能体现「AI Agent 驱动」的，正是让 AI 来判断「代码是否真正满足了需求」这件过去只能靠人做的事。

07

Harness AI 随机性：方法论总结

回顾前文，我们用七个策略构建了一套完整的 AI 随机性治理框架：

这七个策略的优先级不是平等的。前三个（约束、缩小、反馈）作用于 AI 生成阶段，直接影响产出质量；后四个（隔离、数据验证、分层验证、逃生舱）作用于 执行和发布阶段，负责兜底和纠偏。其中，「数据验证」尤其关键，它用真实用户的 telemetry 数据来验证发布质量，让信任建立在客观证据而非主观判断之上。

我们的核心思想是：不要试图让 AI 100% 正确，而是要构建一个「即使 AI 犯错也不会造成灾难」的系统。 在这个过程中，「反馈学习」是从被动防御转向主动引导的关键转折点。除了防错，它能让系统越跑越好。

08

展望从「辅助编码」到「自主发布」

a1 CLI 的实践证明，AI Agent 驱动的高频自动发布是可行的。关键在于构建一套让 AI 可以「安全犯错」的系统，倒不在于让 AI 变得「完美」。

信任是每一次成功发布的累积。当流水线连续运行一百天、每天自动发版、零线上故障时，团队的信心自然会从「不敢发」转变为「天天发」。

我们目前还在探索更多可能性。这些方向大致可以归为四条主线：

1\. 从「人工审核」到「AI 自主决策」。 目前 beta telemetry 的异常信号还需要人来拍板是否回滚，下一步我们希望让 AI Agent 基于失败率、错误分布、影响面等多维信号自主判断：数据健康则自动放行，出现明确劣化则自动触发回滚并生成归因报告。更进一步，让 AI 学会「该叫人的时候叫人」，在置信度不足的灰色地带主动升级给人工，而不是盲目决策。这本质上是让 AI 具备对自身判断的「元认知」能力。

2\. 从「覆盖已知」到「逼近全量」。 动态冒烟目前只覆盖受本次变更影响的命令，我们希望让它的覆盖率逐步逼近全量冒烟。让 AI 不仅测“改了什么”，还能基于依赖关系推断“改动可能间接影响什么”，主动为潜在的连带影响生成测试。同时，探索测试用例的“复利效应”：把 AI 每次生成的高质量用例沉淀回全量冒烟集，让动态生成的一次性产出转化为可持续复用的资产。

3\. 从「短期记忆」到「长期记忆」。 CI 历史注入让 AI 有了单次重跑内的短期记忆，但每条流水线仍是记忆孤岛。我们希望让这种记忆进化为跨 pipeline、跨时间的长期记忆：AI 能记住某类命令历史上的高频失败模式、某个 flag 组合曾经踩过的坑，并在生成新测试时主动规避。让「从失败中学习」从单次纠错升级为持续积累的经验库。

4\. 从「测试驱动」到「数据反哺」。 最令人期待的方向，是让真实用户的 telemetry 数据反向驱动测试生成。线上哪些命令失败率高、哪些参数组合最容易出错，就让 AI 优先为这些“高危区域”生成更密集的测试。让测试的重心，从“我们以为重要的地方”转移到“用户真实踩坑的地方”，形成「线上数据 → 测试生成 → 质量提升 → 更健康的线上数据」的正向飞轮。

这些方向的共同指向，是让整个发布体系从「被动防御」持续走向「主动进化」，在不出错的前提下，还能越跑越聪明。

AI Agent 自动驾驶的终局，并不是把人赶下驾驶座，相反的，是让人敢于松开方向盘。只不过是从死死攥着方向盘、不敢发版，到靠在副驾上偶尔瞥一眼路况、天天发版。而这套 CI/CD 体系，就是让你敢于松手的底气：它不能保证 AI 永不犯错，但它能保证：即使 AI 犯了错，车也不会冲出护栏。

* * *

> 本文中的理念已沉淀为一个内部可复用的 Skill —— AI-Driven Release Engineering，可用于帮助 AI Agent 构建同样的发布信心体系。

  


欢迎留言一起参与讨论~