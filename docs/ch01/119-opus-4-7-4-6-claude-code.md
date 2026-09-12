# Opus 4.7 发布：相比 4.6 核心变化与 Claude Code 搭配最佳实践

> 📊 Level ⭐ | 4.4KB | `entities/刚刚opus-47发布相比46核心变化与claude-code搭配最佳实践-v2.md`

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/刚刚opus-47发布相比46核心变化与claude-code搭配最佳实践-v2.md`，一手来源仍见下方 sources。

## 机制与论文
- [Context Window Management Comparison](https://github.com/QianJinGuo/wiki-public/blob/main/entities/context-window-management-comparison.md) — 四框架对比rv9
- [Claude 4/5 Sonnet & Opus Release Notes](428-claude-4-5-sonnet-opus-release-notes.html) — 发布时间线与能力
- [Code as Agent Harness 综述](https://github.com/QianJinGuo/wiki-public/blob/main/entities/code-as-agent-harness-survey.md) — 102页综述
- [Anthropic LLM ATT&CK Navigator: AI-Enabled Cyber Operations](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-llm-attck-navigator-cyber-operations.md) — ARiES风险评分
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道.md) — 16095字源码8步循环
- [Claude Code 七层记忆架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-7-layer-memory-architecture.md) — 七层防御金字塔
- [原始文章存档](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-search-architecture-tencent-2026.md) — ripgrep五层过滤
- [Claude Code and What Comes Next](256-claude-code-and-what-comes-next.html) — 压缩/Skills/Subagents
- [GPT 5.4 是 Codex 的一次大跨越：四维评估视角与 Agent 战争回归](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gpt-54-is-a-big-step-for-codex.md) — 四维评估+Claude/GPT哲学分歧5698字全版
- [全网骂Claude变笨，Anthropic下场揭秘：坑你的不是模型](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-perceived-degradation-anthropic-effort-model-explanation-2026.md) — Model vs Effort框架

## 工程实践
- [Claude Code 架构深度解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-deep-architecture-analysis.md) — 并发与延迟加载深析
- [Claude Code Agent Teams 实战：怎么拆任务、控权限、收证据](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-agent-teams-task-decomposition-ruofei.md) — 拆任务控权限
- [最佳 Claude Code 配置：Andrej Karpathy 的 CLAUDE.md，134+k star了！](https://github.com/QianJinGuo/wiki-public/blob/main/entities/andrej-karpathy-claude-md-134k-stars-2026.md) — CLAUDE.md四规则解析
- [CLAUDE.md 规则从 Karpathy 的 4 条增加到 12 条](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-md-12-rules-mnilax.md) — 12规则rv9主版
- [CLAUDE.md](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-source-leak-lifecycle-analysis.md) — 8步生命周期10k
- [DeepSeek Code Harness](../ch09/094-deepseek-code-harness.html) — DSH 28k主版
- [Codex 重磅升级：Appshots / Goal 毕业 / 锁屏远程操控](https://github.com/QianJinGuo/wiki-public/blob/main/entities/codex-major-update-appshots-goal-xinzhiyuan.md) — 五能力升级
- [Claude Code 官方插件系统 (claude-plugins-official)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-official-plugins-anthropic.md) — 官方插件五件套
- [knowledge-work-plugins拆解：Anthropic官方开源，4 种组件、3 级加载、2 层记忆，纯文件的 AI岗位插件集](https://github.com/QianJinGuo/wiki-public/blob/main/entities/knowledge-work-plugins-shuge-anthropic-deep-source.md) — 岗位级封装+三级披露+两层记忆7956字
- [读完 Claude Code 和 OpenClaw 的 memory 源码，我对 Agent 记忆需要向量数据库产生怀疑](https://github.com/QianJinGuo/wiki-public/blob/main/entities/读完-claude-code-和-openclaw-的-memory-源码我对agent记忆需要向量数据库这件事产生了怀疑.md) — 6层markdown记忆设计
- [GSD 上下文管理工具：用 Plan 约束 Agent 行为边界](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gsd-get-shit-done-context-management-tool.md) — GSD四层上下文+4档退化12811字
- [Claude Code Dynamic Workflows 实战模式与构建技巧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-dynamic-workflows-thariq-practical-patterns.md) — 3失败6模式11用例
- [Claude Code 上下文工程 —— Anthropic 团队的工程实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-context-engineering-anthropic-thariq.md) — 上下文工程官方表述
- [Skills：让 Claude 记住「怎么做」，告别重复教学](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-workflow-encapsulation-costa-long.md) — context:fork隔离

## 延伸导航
- [Claude Code 生态完全指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/claude-code-complete-guide.md)

---

