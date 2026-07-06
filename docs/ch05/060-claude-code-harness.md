# 从零复刻 Claude Code：Harness 构建学习笔记

## Ch05.060 从零复刻 Claude Code：Harness 构建学习笔记

> 📊 Level ⭐⭐ | 7.3KB | `entities/准备开一个新坑从零复刻一个-claude-codenn目标是在这个过程中和大家一起学习-claude-code-的-harness-是如何做的nnclaude-.md`

# 准备开一个新坑：从零复刻一个 Claude Code。\n\n目标是在这个过程中和大家一起学习 Claude Code 的 Harness 是如何做的。\n\nClaude Code 源码泄漏后本来想根据它的代码直接出一个分析解读的内容，但是写着写着感觉太干了，对小白可能不太友好。  \n\n既然有了源码，不如我们直接从零一步步复刻一个，我们在复刻的过程中可以逐步去学习如何实现一个企业级的 Agent。\n\n最终目标是要复刻出 Claude Code 大部分的核心功能。\n\n同时我会把实现的整个过程沉淀为一套完整的技术教程，每个章节都包含详细的实现步骤和可复现的代码。\n\n大家也可以跟着这个这个教程（直接把每个章节的内容和关键代码发给你的 Coding Agent）从零完成复刻，你也能一步步实现一个完整的企业级 Agent。\n\n仓库在这：https://github.com/ConardLi/easy-agent\n\n大家感兴趣可以提前 Star 支持一下。\n\n预计前期会先实现下面的功能，后面会根据这些功能的实现情况再逐步完善更多功能：\n\n0. 项目脚手架搭建\n1. 最简 LLM 通信层\n2. React/Ink 终端交互界面\n3. Tool 接口设计与第一个工具\n4. 核心 Agentic Loop\n5. 完善工具集\n6. System Prompt 与上下文工程\n7. 权限控制系统\n8. QueryEngine 多轮编排\n9. 会话持久化与恢复\n10. 项目记忆系统\n11. 上下文压缩\n12. Token 预算精细管理\n13. Plan Mode（计划模式）\n14. 任务管理系统\n15. MCP 协议支持\n16. Skills 技能系统\n17. 沙箱机制（Sandbox）\n18. Sub-Agent\n19. 自定义 Agent 系统\n20. 多 Agent 协作（进阶）\n21. Hooks 生命周期系统\n22. 终端 UI 升级\n23. 配置系统完善\n24. 文件历史与回滚\n25. 错误处理与韧性\n26. 管道模式（非交互式）\n27. Auto Mode（AI 分类器自动执行）\n28. 多 Provider 支持\n29. 打包发布与文档\n\n大家感兴趣的话可以点个 Star：https://github.com/ConardLi/easy-agent

## 深度分析

本文作者选择了一条独特的学习路径：不是被动地阅读源码，而是通过主动复刻来深入理解 Claude Code 的 Harness 设计。 这种"Learning by building"的方法论在技术学习中一直被推崇，但在 Agent 开发领域尤其有价值，因为 Agent 的 Harness 涉及多个复杂子系统的协同工作。

从作者规划的 30 个功能模块来看，Claude Code 的 Harness 可以被解构为几个核心层次：基础设施层（项目脚手架、LLM 通信层、终端 UI）、Agent 核心层（Agentic Loop、Tool 接口、权限控制、Sub-Agent）、认知增强层（记忆系统、上下文压缩、Token 预算管理）、系统扩展层（MCP 协议支持、Skills 系统、沙箱机制）。 这种分层架构的设计思想体现了工程化 Agent 的成熟度。

作者强调每个章节都包含"可复现的代码"，并建议读者"直接把每个章节的内容和关键代码发给你的 Coding Agent"从零完成复刻。 这揭示了 AI 时代技术传播范式的转变——人类不仅可以利用 AI 来学习，AI 本身也可以作为学习过程的协作伙伴。

值得注意的是，作者规划的 30 个功能点覆盖了从"多 Agent 协作"到"多 Provider 支持"的广泛范围，这暗示了企业级 Agent 系统的核心挑战不在于单个功能的实现，而在于如何设计一个可扩展、可组合的架构来容纳多元化的功能需求。 这种"功能清单即架构视图"的方法值得借鉴。

## 实践启示

1. **采用"Learning by Building"学习 Agent 开发**：与其被动阅读源码或文档，不如设定一个复刻目标，在实现过程中遇到的具体问题会倒逼你深入理解每个模块的设计原理。

2. **优先掌握 Agentic Loop 和 Tool 接口设计**：这两个模块是 Agent Harness 的心脏，决定了 Agent 与外界交互的基本模式。建议在前几个功能点就聚焦于此，而非被周边功能（如 UI、配置系统）分散注意力。

3. **利用 AI 作为学习协作伙伴**：将教程内容直接输入给 Coding Agent，让 AI 协助你完成代码编写，同时通过提问来验证你对每一行代码的理解。这种"与 AI 结对编程"的学习方式能同时提升你对 Agent 原理的理解和 AI 工具使用熟练度。

4. **关注系统的可扩展性设计**：从 30 个功能模块的规划可以看出，优秀的 Agent Harness 应该在架构层面支持功能扩展。在复刻学习过程中，应该思考每个模块如何与其他模块解耦，以及新增功能如何不影响既有系统。

5. **分阶段验收，循序渐进**：作者列出的 30 个功能点并非随意排列，而是遵循从基础到高级的递进关系。建议学习者也按此顺序分阶段验收自己的实现成果，每完成一个阶段就进行测试和总结，确保基础稳固后再进入复杂功能。

## 相关实体
- [Claude Code Harness Deep Understanding](../ch01/456-claude-code-harness-deep-understanding.md)
- [Claude Code Harness Deep Dive Founder Park](ch05/060-claude-code-harness.md)
- [Claude Code Founder Harness 100 Lines](../ch03/075-claude-code.md)
- [Anthropic Claude Code Large Codebase Best Practices 50002A089323](../ch01/342-anthropic-claude-code.md)
- [From Prompt To Harness Claude Official](ch05/009-harness.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/准备开一个新坑从零复刻一个-claude-codenn目标是在这个过程中和大家一起学习-claude-code-的-harness-是如何做的nnclaude-.md)

---

