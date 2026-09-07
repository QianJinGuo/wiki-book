# Prompt Caching 工程实践 — Anthropic Claude Code 经验总结

> 📊 Level ⭐ | 4.8KB | `entities/anthropic-prompt-caching-claude-code.md`

# Prompt Caching 工程实践 — Anthropic Claude Code 经验总结

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/anthropic-prompt-caching-claude-code.md`，一手来源仍见下方 sources。

## 机制与论文
- [Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1anu.md) — 三框架演绎七层模型12857字rv9
- [Claude Opus 4.7 发布分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-opus-4-7-launch.md) — 4.7发布分析
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/刚刚opus-47发布相比46核心变化与claude-code搭配最佳实践.md) — 6588字最全发布分析
- [Context Window Management Comparison](https://github.com/QianJinGuo/wiki-public/blob/main/entities/context-window-management-comparison.md) — 四框架对比rv9
- [800行代码实现 Open Claw 的 Tool、消息总线、子Agent管理架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/open-claw-tool-bus-subagent-architecture.md) — 薄抽象显式控制流8802字rv9全版
- [王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wangyunhe-harness-optimization-agentsoul.md) — Agent=Models+Harness联合优化
- [Building for the Rising Complexity of Agentic Systems with Extreme Co-Design](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nvidia-agentic-systems-extreme-co-design.md) — 三种交互模式+33分钟真实trace+prompt caching挑战
- [AI Agent工具数量陷阱——5个边界清楚的工具胜过20个模糊工具](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-agent-tool-count-trap.md) — 工具税数据与机制

## 工程实践
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](https://github.com/QianJinGuo/wiki-public/blob/main/entities/boris-cherny-新访谈开发工具正在从-ide-变成-agent-控制台.md) — Boris访谈rv10全版
- [Claude Code 源码深度解析（13 核心机制）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-source-deep-dive-warrior.md) — 13机制rv10
- [Claude Code 源码核心机制详解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-core-internals.md) — 源码机制18k主版
- [Claude Code 架构深度解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-deep-architecture-analysis.md) — 并发与延迟加载深析
- [Claude Harness 设计：Generator-Evaluator 架构与 Context Reset 演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-generator-evaluator-anthropic.md) — Generator-Evaluator+context reset 10329字rv9全版
- [Claude Code Openclaw Memory Comparison](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-openclaw-memory-comparison.md) — 记忆系统对比rv9
- [Anthropic发布「AI原生创业公司」手册：涵盖全流程四大核心阶段，一人公司法典来了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-ai-native-startup-handbook.md) — 创业四阶段手册
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/opus-4-7-launch-claude-code-best-practices-wechat.md) — Opus 4.7核心变化+CC六新功能14779字rv9
- [Anthropic 内部 95% 数据分析自动化：分析 Agent 技术栈 + Skill 框架（21%→95% 准确率）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-95pct-data-analysis-skill-stack-architecture.md) — 95%技术栈26k
- [Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-comprehensive-guide-conardli.md) — ConardLi六层架构14634字rv9
- [Claude Code 性能基准评测](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-performance-benchmarking.md) — 性能指标体系
- [Claude Code 一周年回顾：Boris Cherny + Cat Wu 的完整时间线](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-first-year-retrospective-boris-cat-2026.md) — 一周年回顾14k主版
- [CPU 缓存类比下的 Agent 上下文管理：L1/L2/L3 层级架构与 execute_code 单工具设计](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cpu-cache-analogy-agent-context-management-liwen.md) — L1/L2/L3缓存类比
- [我把 Claude Design 做成了 Skill，人人都能成为顶级网站设计师](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-design-skill-web-design-engineer.md) — Claude Design拆解全版
- [Anthropic 最新博客：Prompt Caching 是构建 Claude Code 的一切](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-prompt-caching-claude-code-agihunt.md) — 缓存9条12k全版
- [Claude Code 多 Agent Harness 源码拆解：留纸条、抠上下文、抠缓存、捆手脚](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-multi-agent-harness-source-analysis.md) — 留纸条抠上下文

## 延伸导航
- [Claude Code 生态完全指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/claude-code-complete-guide.md)

---

