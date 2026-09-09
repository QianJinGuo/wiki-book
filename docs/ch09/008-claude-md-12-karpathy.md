# CLAUDE.md 12 条规则：Karpathy 扩展模板

> 📊 Level ⭐ | 4.5KB | `entities/claude-code-12-rules-karpathy-extension.md`

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/claude-code-12-rules-karpathy-extension.md`，一手来源仍见下方 sources。

## 机制与论文
- [Hermes Agent 深度解析（阿里云/飞樰）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-deep-dive.md) — 自进化内外双路径+四维工程7934字rv9全版
- [王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wangyunhe-harness-optimization-agentsoul.md) — Agent=Models+Harness联合优化
- [AgentMemory：Coding Agent 本地记忆系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentmemory-coding-agent-local-memory.md) — 本地记忆运行时
- [DeepSeek V4 DS4C Antirez 本地推理实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-ds4c-antirez-local-inference-qbitai.md) — ds4.c非对称量化
- [Claude Code 身世：从安全对齐到开发工具的革命](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-origin-safety-alignment-boris-2026.md) — 安全对齐起源

## 工程实践
- [Karpathy CLAUDE.md — 四条行为准则让 AI 编程 Agent 减少结构性失败](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-claude-md-rules.md) — CLAUDE.md四行为准则rv9
- [Claude Code Skills 实战指南 — 发现机制、编写与安全](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-practical-guide-discovery-frontmatter.md) — 发现机制与安全
- [CLAUDE.md 规则从 Karpathy 的 4 条增加到 12 条](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-md-12-rules-mnilax.md) — 12规则rv9主版
- [Claude Code Skills / MCP / Rules 源码分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-mcp-rules-source-analysis.md) — 三个注入位置
- [Claude Code Prompt 提示词体系源码解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-prompt-source-analysis.md) — 六大prompt模块全版
- [Harness 工程搭建式业务 Agent 评测方案：Claude Code 作 Harness 搭建者](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineered-business-agent-evaluation-aliyun-boyu.md) — CC搭评测Harness，1.5周→1-2天
- [DeepSeek Code Harness](062-deepseek-code-harness.html) — DSH 28k主版
- [鹅厂 Skill 写作完整 Playbook：14 章节 end-to-end 实战 + 工程化评估（腾讯一线踩坑 + Anthropic 官方做法整合）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-skill-writing-complete-playbook-jackjchou.md) — 14章节skill写作playbook
- [Claude Code SKILL.md 写作指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skill-writing-guide.md) — SKILL.md写作
- [李继刚 23 个 Skills 深度拆解——认知工序流水线](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ljg-skills-deep-dive-datastudio-2026.md) — 李继刚23 Skills认知工序流水线拆解
- [Claude Code 为什么会忽略指令：四类失效原因 + 五层规则框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-why-instructions-ignored-jia-gou-x-2026.md) — 指令失效四类
- [Claude Code Dynamic Workflows 实战模式与构建技巧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-dynamic-workflows-thariq-practical-patterns.md) — 3失败6模式11用例
- [Using Claude](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-html-artifacts.md) — HTML unreasonable effectiveness主版
- [300万人在存的Claude提示词](https://github.com/QianJinGuo/wiki-public/blob/main/entities/300万人在存的claude提示词.md) — 提示词工程框架
- [Harness Engineering 系统性解读](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-systematic-explainer.md) — 李宏毅课程解读7933字最全版
- [Agent Browser 僵尸进程排查与定时清理（Claude Code + QoderWork 实战）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-browser-zombie-process-cleanup-qoderwork-2026.md) — 僵尸进程排查自愈实践
- [Claude Code /checkup 功能：清理 Skills/MCP 提升性能](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-checkup-feature-boris-cherny-2026.md) — 配置腐烂治理
- [Autoresearch: AI Agent-Driven Algorithmic Development (File Compression Experiment)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/autoresearch-agent-algorithmic-development-file-compression-2026.md) — 压缩算法autoresearch实验
- [Thariq（Claude Code工程师）的Fable 5使用心法：地图≠领土，用未知消除法突破模型瓶颈](https://github.com/QianJinGuo/wiki-public/blob/main/entities/thariq-fable-5-usage-mindset-map-territory-unknown-unknowns.md) — 地图领土未知消除法

---

