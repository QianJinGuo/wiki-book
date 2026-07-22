---
title: "Claude Code创始人Boris团队10个使用技巧"
created: 2026-05-28
updated: 2026-05-28
type: raw
tags: [claude-code, boris, worktree, plan-mode, claude-md, skills, subagents, terminal, bq-sql, learning]
sources:
  - https://mp.weixin.qq.com/s/y57VFfi5Tol_c5ouSuyM3Q
review_value: 7
review_confidence: 7
sha256: 058b9a2680697b755b4d40d49a58910e5e4b9138de61365d79f629093a320784
---

## 背景

作者：Boris Cherny（Claude Code 创始人），Datawhale 团队翻译。

这是 Boris 在 X 上**第二次**公开的 Claude Code 使用技巧——这次是来自 Claude Code **团队内部**的 10 个技巧，干货满满。年初第一次公开的是 Boris 个人的使用习惯，本次则是团队成员的多样化实践汇总。

## 10 个团队使用技巧

### 1. 并行处理更多任务

同时开启 3–5 个 git worktree，让每个 worktree 都运行独立的 Claude 会话并行工作。这是提升效率的最有效方法。

- 团队大多数成员偏爱 worktree（@amorriscode 专门在 Claude Desktop 应用里为 worktree 开发了原生支持）
- 给 worktree 命名并设置 Shell 别名（za、zb、zc），通过键盘指令在不同任务间一键切换
- 预留一个专门的"分析用" worktree，仅用来查看日志和运行 BigQuery

参阅文档：https://code.claude.com/docs/en/common-workflows#run-parallel-claude-code-sessions-with-git-worktrees

### 2. 任何复杂任务，都从 Plan Mode 开始

把精力集中在打磨计划上，这样 Claude 在实现代码时就能一步到位（1-shot）。

团队成员的用法：
- 先让一个 Claude 写出计划，然后启动第二个 Claude 代入 Staff Engineer 角色进行 Review
- 一旦发现进展跑偏，立刻切回 Plan Mode 重新规划，千万别硬推
- 甚至会明确指示 Claude 在验证步骤中也要进入 Plan Mode

### 3. 用心经营你的 CLAUDE.md

每次纠正完 Claude 的问题后，在结尾加一句："把这条更新到 CLAUDE.md 里，确保下次别再犯同样的错误。"

随着时间推移，大刀阔斧地编辑 CLAUDE.md，保持迭代，直到 Claude 的错误率显著下降。

有一位工程师的用法：让 Claude 为每个任务或项目维护一个笔记目录，在每次 PR 后更新，然后在 CLAUDE.md 里直接引用这个目录作为索引。

### 4. 创建你自己的专属 Skill 并提交到 Git，在所有项目中复用

团队给出的建议：
- **封装复用**：如果某个操作每天要重复不止一次，就应该把它封装成一个 Skill
- **清理技术债**：做一个 `/techdebt` 斜杠命令，每次会话结束时跑一下，专门用来揪出并干掉重复代码
- **上下文聚合**：设置一个命令，用来抓取过去 7 天内的 Slack、GDrive、Asana 和 GitHub 数据，打包成一份上下文汇总
- **专用 Agent**：构建像数据分析工程师那样的 Agent，专门负责编写 dbt 模型、Code Review 以及在 Dev 环境中测试变更

了解更多：https://code.claude.com/docs/en/skills#extend-claude-with-skills

### 5. Claude 几乎能自主搞定大部分 Bug

- 开启 Slack MCP 插件，把 Slack 里的 Bug 讨论串直接贴给 Claude，只说一句"fix"
- 直接跟它说"去把失败的 CI 测试修了"，不用管它具体怎么修
- 把 Docker 日志丢给 Claude 让它去排查分布式系统——它在这方面的表现好得惊人

### 6. 提升你的 Prompt 技巧

a. **挑战 Claude**：对它说"针对这些改动向我提问，在我通过你的测试之前不要提交 PR"。让 Claude 担任评审员。

b. **推翻方案**：如果修复方案不够理想，"基于你现在掌握的信息，推翻刚才的方案，换一个更优雅的实现。"

c. **先写详尽规格说明**：在交付任务前先写好详尽的 Specs 以减少歧义，写得越具体输出质量越高。

### 7. 终端与环境配置

- 团队推崇 **Ghostty** 终端（同步渲染、24 位色彩、Unicode 完美支持）
- 利用 `/statusline` 自定义状态栏，显示上下文占用情况和当前 Git 分支
- 给终端标签页设置颜色和命名，每个任务或 worktree 占用一个标签
- **使用语音听写**：说话速度比打字快 3 倍，Prompt 也会因此详尽得多（macOS 上连按两次 fn 键即可开启）

更多技巧：https://code.claude.com/docs/en/terminal-config

### 8. 使用子智能体（Subagents）

a. **增加算力投入**：在任何请求后加上"use subagents"，希望 Claude 投入更多算力解决问题

b. **任务卸载**：将独立任务分配给子智能体，保持主智能体的上下文窗口整洁且聚焦

c. **权限审批自动化**：通过 Hook 将权限请求路由给 Opus 4.5，扫描是否存在攻击风险并自动批准安全请求

### 9. 使用 Claude 进行数据分析

让 Claude Code 调用 bq 命令行工具，即时获取并分析指标。将 BigQuery 技能提交到代码库，团队里的每个人都会直接在 Claude Code 里用它跑分析查询。Boris 个人已经有 6 个多月没亲手写过一行 SQL 了。

这种方式适用于任何拥有 CLI、MCP 插件或 API 的数据库。

### 10. 利用 Claude 进行学习

a. **开启解释模式**：在 /config 中启用"Explanatory"或"Learning"输出风格，让 Claude 解释代码改动背后的原委

b. **生成可视化简报**：让 Claude 生成用于解释陌生代码的 HTML 演示文稿，做出来的幻灯片效果好得惊人

c. **绘制 ASCII 架构图**：让 Claude 针对新协议或代码库绘制 ASCII 流程图，快速理清逻辑

d. **构建间隔重复学习技能**：打造基于"间隔重复"的学习技能——先由你解释自己的理解，Claude 通过追问来填补知识盲区，并记录学习结果