---
title: "Superpowers 6.0 深度解读：SDD 评审重写 + 文件交接 + 多平台支持"
source_url: "https://mp.weixin.qq.com/s/IEgncvDWNxTrYcUvmV8j8A"
ingested: 2026-06-26
sha256: ""
type: raw
---

# Superpowers 6.0 深度解读：SDD 评审重写 + 文件交接 + 多平台支持

Superpowers 6.0 的大更新，表面看是新增平台、改 prompt、补安全策略。真正值得关注的，是它把 AI Agent 做软件工程时最贵、最容易跑偏的一段流程重新设计了：任务后的代码评审。

这个版本在 2026 年 6 月 16 日发布，6 月 18 日又发了 v6.0.3，修掉了 SDD scratch 目录放在 .git/ 下带来的兼容问题。下面这篇解读以 v6.0.0 为主，补上 v6.0.3 的关键修补。

## 这次更新的主线

如果只看 release note，可能会把 6.0 理解成一次"大扫除"：删除旧 reviewer prompt，新增 Kimi Code、Pi、Antigravity 支持，改 worktree 路径，给 visual brainstorming server 加认证。可我读完 skills/subagent-driven-development、brainstorming/scripts/server.cjs 和几个 harness 插件后，感觉这次的主线更集中。

Superpowers 6.0 想解决的问题是：当 Agent 真的开始写一个较大的功能，怎么让它持续做对事，怎么让 review 有边界，怎么让长任务可恢复，怎么让同一套方法论跑在不同 Agent 容器里。

旧版 SDD 的每个任务后会跑两个评审，一个看 spec compliance，一个看 code quality。这听起来严谨，实际代价很高。两个 reviewer 都需要理解同一个 diff，同一段上下文被重复消耗，controller 还要把大量 diff 和任务信息塞进主会话。上下文越长，评审越容易从"检查当前任务"滑向"顺手看完整个仓库"。

6.0 的选择很直接：每个任务只派一个 Task Reviewer，一次阅读 diff，同时给出两个 verdict。需求是否满足，质量是否过关。最终阶段仍保留 whole-branch broad review。这个改法没有降低质量门槛，它把"任务窄审"和"最终宽审"拆得更清楚。

## SDD 评审怎么改

这部分的核心文件在 skills/subagent-driven-development/SKILL.md 和 task-reviewer-prompt.md。

新版 SKILL.md 把主流程写成：每个 task 派一个新的 implementer，完成后生成 review package，再派 task reviewer，只有 spec 和 quality 都通过，才把任务写进 progress ledger。这个 ledger 位于 .superpowers/sdd/progress.md，是长任务恢复时的账本。

task-reviewer-prompt.md 的约束更有意思。它要求 reviewer 只读一次 task diff，产出两个 verdict。它还明确说，diff file 是主视图，只有能说出具体风险时，才去查 diff 之外的代码。它不鼓励 reviewer 重跑整个测试套件，只允许在代码阅读产生具体疑问时做 focused test。

这背后有一个很工程化的判断：评审的价值来自发现具体缺陷，不来自制造"我又完整检查了一遍"的仪式感。对 Agent 来说，越开放的评审 prompt，越容易把上下文烧在低价值搜索上。Superpowers 6.0 把 reviewer 的活动范围收窄，反而让发现问题的信号更干净。

## 文件交接降低上下文成本

这次 SDD 重写里，还有一个小但很关键的动作：把交接材料文件化。

scripts/task-brief 会从计划里抽出单个任务，写成 .superpowers/sdd/task-N-brief.md。implementer 不需要在主会话里接收一大段计划全文，只读当前任务的 brief。

scripts/review-package 会根据 base 和 head 生成一个 diff 包，里面包含 commit list、files changed 和带上下文的 net diff。reviewer 读这个文件，不必自己跑一串 git 命令，也不需要 controller 把 diff 粘到对话里。

这件事对用户的体感会很明显。长任务里，主会话不再被每个 task 的 diff 反复挤占；reviewer 也不需要临场"还原发生了什么"。如果评审失败，修复环可以围绕同一个 brief 和 diff package 继续转，不会在 prompt 里越补越乱。

v6.0.3 的修补也发生在这里。早期 6.0 把 scratch 文件放在 .git/sdd/，但 Claude Code 会保护 .git/，子代理写 report 时可能被挡住。新版 sdd-workspace 把目录固定到工作树里的 .superpowers/sdd，并写入自忽略的 .gitignore，这样 scratch 文件不会污染 git status，也避开了受保护目录。

## 对业务流程的影响

如果团队已经用 Agent 跑需求实现，6.0 会改变几个日常动作。

计划阶段要更认真。新版 SDD 会在 plan 里强调 Global Constraints、Interfaces 和 Non-negotiables。因为 task reviewer 会按当前任务的 brief 评审，计划里没有写清楚的边界，后面就不能指望 reviewer 自动脑补。

任务派发阶段会更像流水线。controller 生成 brief，implementer 写 report，review-package 生成 diff，task reviewer 做双 verdict。每一步都有文件作为交接物。这让流程变慢一点点，换来可恢复、可审计、可复跑。

评审阶段会更聚焦。以前两个 reviewer 可能各扫一遍同一份 diff，现在一个 reviewer 做双重判断。它不应该随手扩展成全仓 review，跨任务集成风险留给最终 broad review。

恢复阶段更明确。上下文压缩、会话中断、分支暂停后，controller 可以读 .superpowers/sdd/progress.md 和 git log，找到第一个未完成任务继续做。这对多小时、多天的 Agent 开发尤其重要。

## 多平台支持的真实意义

6.0 新增 Kimi Code、Pi、Antigravity 三个 harness。这个变化不只是"多几个入口"。

Superpowers 过去的 skill 文本里会出现 Claude Code 方言，例如 Task tool、CLAUDE.md。6.0 更强调用动作描述意图，例如 dispatch a subagent、your instructions file，再由每个平台的 reference 文件映射到具体工具。

我看 Codex、Kimi、Pi、OpenCode 相关实现时，能看到同一个思路：skill 层尽量说方法论，harness 层负责工具名、资源注入、session bootstrap、subagent 调度。Kimi 通过 .kimi-plugin/plugin.json 声明 sessionStart.skill；Pi 通过 .pi/extensions/superpowers.ts 注册 resources 并注入 bootstrap；OpenCode 插件还做了 bootstrap 缓存，避免每个 agent step 都重复读文件。

对团队来说，这会降低迁移成本。你可以把"如何 brainstorm、如何 TDD、如何 SDD、如何 finish branch"当成一套协作流程，而不是某个单一 Agent 产品的私有操作手册。

## Visual Brainstorming 更像真实本地服务

Visual brainstorming server 这次也做了不少安全补强。旧版更像"临时开一个本地页面"，新版更像有会话边界的小型服务。

server.cjs 增加了 per-session key。认证可以通过 query key 或 HttpOnly cookie 完成，WebSocket 会做 origin 检查，HTTP 响应加上 no-referrer、no-store、frame deny 和 CSP。文件服务会拒绝 dotfile、symlink、硬链接数异常的文件，也会确认真实路径仍在 content 目录里。

start-server.sh 和 stop-server.sh 也补了生命周期细节。项目目录下会复用 .last-port 和 .last-token，已打开的浏览器 tab 在重启后更容易继续连接。停止服务时会检查 server instance id，避免 stale PID 误杀别的进程。默认 idle timeout 也改成更适合长时间头脑风暴的设置。

## 用户能得到什么

官方 release 说，在 eval 中 Claude Code 和 Codex 达到相似高质量结果时，速度大约快一倍，token 花费接近少一半。官方博客进一步解释，收益来自合并 spec/quality reviewer、预生成 review package，以及更细的模型选择建议。

更重要的好处，是质量门更难被绕过。新版 reviewer prompt 明确要求把 implementer report 当成未验证声明。实现者说"我保持了简单""这是 YAGNI""测试已经覆盖"都不能直接采信。reviewer 要回到 diff 本身，看它是否真的满足任务，是否引入质量风险。

对普通用户，升级收益可以概括成四句话：

1. 如果你经常让 Agent 做长任务，6.0 更容易恢复，不容易重复做已完成的 task。
2. 如果你担心 Agent 自我说服，6.0 的 task reviewer 更不容易被实现者报告带偏。
3. 如果你在多个 Agent 工具之间切换，6.0 的动作语义和工具映射会减少迁移摩擦。
4. 如果你在远程机器上用 visual companion，6.0 的认证和文件沙箱会让风险面小很多。

## 升级时要检查什么

已经使用 Superpowers SDD 的团队，重点查三处：

1. 旧 reviewer prompt。如果脚本、文档、团队习惯里直接引用 spec-reviewer-prompt.md 或 code-quality-reviewer-prompt.md，需要迁到 task-reviewer-prompt.md，并适配双 verdict 输出。
2. worktree 路径。旧的全局 ~/.config/superpowers/worktrees/ 路径已经退出新策略，新的手动 worktree 更偏向项目内 .worktrees/ 或已有的 worktrees/。
3. .superpowers/sdd。如果刚好卡在 6.0.0 到 6.0.2，建议直接升到 6.0.3 之后再跑长任务，避开 .git/sdd 的写入问题。

## 作者验证

作者在本地拉了 v6.0.3 源码（commit 896224c4b1879920ab573417e68fd51d2ccc9072），跑了以下测试：

- tests/claude-code/test-sdd-workspace.sh — 验证 .superpowers/sdd、task-brief、review-package 和 worktree 独立 scratch 目录
- tests/kimi/test-plugin-manifest.sh — 验证 Kimi manifest 的 skills、sessionStart 和 tool mapping
- tests/claude-code/test-worktree-path-policy.sh — 确认旧 global worktree path 不是新策略的一部分
- tests/brainstorm-server — protocol、helper、launcher、auth、branding、server、lifecycle、start/stop 全部通过

插曲：本机开着 CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1，第一次跑会触发纯文本品牌分支，导致 branding 测试失败。清掉变量后通过。

## 参考来源

- GitHub release v6.0.0: https://github.com/obra/superpowers/releases/tag/v6.0.0
- GitHub release v6.0.3: https://github.com/obra/superpowers/releases/tag/v6.0.3
- 官方博客 Superpowers 6: https://blog.fsck.com/2026/06/15/Superpowers-6/
- Superpowers 仓库: https://github.com/obra/superpowers
