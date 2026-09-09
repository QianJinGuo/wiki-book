# Anthropic 博客：Claude Code 大型代码库最佳实践

> 📊 Level ⭐ | 4.9KB | `entities/anthropic-claude-code-large-codebase-best-practices-50002a089323.md`

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/anthropic-claude-code-large-codebase-best-practices-50002a089323.md`，一手来源仍见下方 sources。

## 机制与论文
- [晓斌：从 People-Oriented 到 Agent-Oriented Infra —— 意图驱动 + 代码沉淀的进化体](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-oriented-infra-intent-driven-code-sedimentation.md) — Agent-Oriented Infra长文
- [Anthropic N-days: Frontier Agent Vulnerability Research](../ch04/315-anthropic-n-days-frontier-agent-vulnerability-research.html) — N-day研究
- [王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wangyunhe-harness-optimization-agentsoul.md) — Agent=Models+Harness联合优化
- [AgentMemory 源码分析：给 Coding Agent 装上本地长期记忆](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentmemory-source-analysis-coding-agent-local-memory.md) — 源码级解析互补
- [Anthropic LLM ATT&CK Navigator: AI-Enabled Cyber Operations](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-llm-attck-navigator-cyber-operations.md) — ARiES风险评分
- [从 Prompt 到 Harness：Claude 官方学习资料](https://github.com/QianJinGuo/wiki-public/blob/main/entities/from-prompt-to-harness-claude-official.md) — Harness五子系统闭环解读
- [Claude Code and What Comes Next](257-claude-code-and-what-comes-next.html) — 压缩/Skills/Subagents
- [MCP tool design: Practical approaches and tradeoffs](https://github.com/QianJinGuo/wiki-public/blob/main/entities/mcp-tool-design-tradeoffs-anthropic-2026.md) — 六种MCP工具设计策略V1-V6
- [全网骂Claude变笨，Anthropic下场揭秘：坑你的不是模型](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-perceived-degradation-anthropic-effort-model-explanation-2026.md) — Model vs Effort框架

## 工程实践
- [柚漫剧 AI 全流程提效拆解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/yumanju-ai-full-flow-efficiency.md) — rv10全流程提效规则基建
- [Claude Code 源码核心机制详解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-core-internals.md) — 源码机制18k主版
- [Claude Code Skills / MCP / Rules 源码分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-mcp-rules-source-analysis.md) — 三个注入位置
- [Claude Code 在大型代码库中的实战经验：从哪里入手？怎么做对？](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-large-codebase-harness-configuration.md) — 大型代码库17k原版
- [Claude Managed Agents 新更新\](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-managed-agents-self-hosted-sandbox-mcp-tunnels-enterprise.md) — brain/hands分离全版
- [钉钉 Stream + CLI 代理双引擎 AI 助手架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/dingtalk-stream-cli-dual-engine-ai-assistant.md) — Stream+CLI主版
- [鹅厂 Skill 写作完整 Playbook：14 章节 end-to-end 实战 + 工程化评估（腾讯一线踩坑 + Anthropic 官方做法整合）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-skill-writing-complete-playbook-jackjchou.md) — 14章节skill写作playbook
- [Anthropic 最新博客：MCP 没死，它又来了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-mcp-revisited-tool-search-code-orchestration.md) — MCP三条路
- [knowledge-work-plugins拆解：Anthropic官方开源，4 种组件、3 级加载、2 层记忆，纯文件的 AI岗位插件集](https://github.com/QianJinGuo/wiki-public/blob/main/entities/knowledge-work-plugins-shuge-anthropic-deep-source.md) — 岗位级封装+三级披露+两层记忆7956字
- [Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-12-mcp-production-patterns.md) — 12个MCP模式
- [Anthropic Managed Agents：用 K8s 思路虚拟化 Agent 组件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-managed-agents-scaling.md) — 宠物到牛群
- [Claude Code 七种自定义方法：官方全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-seven-customization-methods-anthropic-official.md) — 七种自定义对比
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](https://github.com/QianJinGuo/wiki-public/blob/main/entities/iqsixinp9lxnkg7avfhfcq.md) — Boris新访谈：IDE→Agent控制台控制点迁移
- [第 09 篇 · Agent 配置：模型、工具、技能、MCP 与提示词的组合](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-config-model-tool-skill-mcp-prompt-combination-yexiaochai-09.md) — 配置驱动架构教程
- [Claude Code 27 条技巧：从工具清单到工程升级路径](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-27-tips-engineering-upgrade-jiagoux-2026.md) — 27技巧全版

## 延伸导航
- [Claude Code 生态完全指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/claude-code-complete-guide.md)
- [Agent 工程全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-engineering-guide.md)
- [RAG 在知识密集型 Agent 中的最优实践是什么？](https://github.com/QianJinGuo/wiki-public/blob/main/moc/rag-knowledge-retrieval.md)

---

