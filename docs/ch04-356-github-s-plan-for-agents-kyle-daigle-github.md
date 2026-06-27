# GitHub's plan for Agents — Kyle Daigle, GitHub

## Ch04.356 GitHub's plan for Agents — Kyle Daigle, GitHub

> 📊 Level ⭐⭐ | 7.2KB | `entities/www-latent-space-p-github.md`

# GitHub's plan for Agents — Kyle Daigle, GitHub

> Latent Space 播客对 GitHub COO Kyle Daigle 的深度访谈，讨论 GitHub 在 AI Agent 时代的战略方向、内部 AI 工作流、开源生态面临的挑战，以及 Copilot 从代码补全到云 Agent 的演进路径。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/www-latent-space-p-github.md)

## 摘要

这篇 Latent Space 播客访谈中，GitHub COO Kyle Daigle 分享了 GitHub 在 AI Agent 时代的全方位思考。核心主题包括：Coding Agent 带来的 1400% 提交量增长对基础设施的冲击、GitHub 内部的 AI 工作流实践（WorkIQ、MCP、微技能架构）、开源社区面临的 AI 生成代码洪水挑战、以及 Copilot 从代码补全到 CLI、桌面应用、云 Agent 的完整演进。

## 核心要点

### 1. 规模冲击：14x 提交增长

2026 年 GitHub 的 coding agent 活动增长了 1400%。2025 年全年 10 亿次提交，2026 年按当前速度将达到每周 2.75 亿次、全年约 140 亿次。GitHub Actions 从 2023 年的 5 亿分钟/周增长到 2025 年的 10 亿分钟/周，当前仍在加速。这些数字背后是基础设施从「为人类开发者的人类速度设计」到「为 Agent 的机器速度运行」的根本性转变。

### 2. GitHub 内部 AI 工作流

Kyle Daigle 详细描述了 GitHub 内部（3000 人）的 AI 实践方式：

**工具栈**：GitHub + Teams（视频）+ Slack（ChatOps）+ Email，通过 WorkIQ MCP Server 统一接入。虽然已被微软收购 8 年，GitHub 仍然使用 Slack，因为所有 ChatOps 工具链都深度集成在 Slack 范式中。

**工作方式**：核心是**向后看（looking backwards）**而非向前看。Kyle 描述的典型工作流是：让 Agent 回顾本周所有 PR、在线发布内容、Obsidian 笔记、Teams 会议记录、Slack 对话，然后综合出本周实际发生了什么，生成消息摘要推送到 GitHub Issues/Discussions 中继续讨论。

**微技能 vs 大技能**：GitHub 正在从「大型完美技能包」转向**原子化微技能**。每个微技能只做一件事（如「识别最重要的营销信息」），然后通过指令书将它们组合。大型技能包的问题是脆弱——几周后环境变化，你无法灵活调整。微技能像乐高积木，可以自由重组。

**"15 agents on Saturday"**：Kyle 描述了周末带孩子打曲棍球时同时运行 15 个 Agent 的工作方式——这代表了 former developers in leadership 的独特优势：既有技术背景理解工具，又有业务知识定义问题。

### 3. 开源生态的 AI 洪水

Agent 生成的代码量激增带来了严重的开源治理问题：

- **Slop forks**：AI 大量生成的低质量 fork 污染生态系统
- **PR 洪水**：当大多数 PR 来自 Agent 时，维护者的审查能力成为瓶颈
- **依赖管理**：AI 是否改变了 vendor 依赖和供应链安全的格局
- **信任机制**：如何在 Agent 生成代码的世界中维持开源的信任社会契约

GitHub 的应对包括：prompt requests（类似 PR 但面向 Agent）、vouching 机制、AI 辅助审查。npm 收购后的供应链安全经验（2FA、token 失效）也在为 Agent 时代做准备。

### 4. Copilot 演进路径

Copilot 正从代码补全工具演进为完整的开发平台：
- **CLI**：命令行集成
- **Desktop App**：独立桌面应用
- **Cloud Agents**：云端 Agent 执行
- **SDK**：开发者可编程接口
- **Context & Memory**：个性化规则和上下文记忆，使 GitHub「按 Kyle 想要的方式行事」

### 5. Actions 作为通用计算层

GitHub Actions 已从 CI/CD 工具演变为**通用安全 Agent 计算层**。Kyle 强调了 Actions 的任意代码执行能力和安全隔离特性，使其成为 Agent 运行时的天然选择。这与 webhooks、API 的历史一脉相承——GitHub 始终在构建「让外部系统安全执行代码」的能力。

## 深度分析

### Former Developers in Leadership 的 AI 时代优势

Kyle 的观点揭示了一个有趣的现象：**有技术背景但已不写代码的领导者**在 AI 时代可能拥有独特优势。他们：
- 能够理解工具的能力边界（不会过度期望或低估）
- 能够定义正确的业务问题（而非技术问题）
- 能够构建跨越技术-业务鸿沟的工作流
- 知道哪些事情「能做到但不该做」

这与纯技术领导（可能陷入工具细节）和非技术领导（可能无法充分利用工具）形成对比。

### 微技能架构的设计哲学

GitHub 从大技能到微技能的转变反映了一个更深层的设计原则：**组合性优于完整性**。大技能试图预定义完整的工作流，但现实中的需求是多变的。微技能只定义原子操作，组合逻辑由用户在运行时决定。这类似于 Unix 哲学：每个工具只做一件事，但可以自由管道连接。

关键设计约束：
- 每个微技能应有**单一明确的语义**
- 技能间的接口应是**自然语言指令**而非编程 API
- 组合逻辑应该是**可读可编辑的文本**，而非黑盒配置

### AI 对开源治理的根本性挑战

1400% 的提交增长不仅仅是基础设施问题，更是**社会契约问题**。开源社区建立在「人类贡献者审查人类贡献者」的信任模型上。当大多数贡献来自 Agent 时：
- 审查者的注意力成为稀缺资源
- 代码质量的定义需要重新思考
- 「谁写的」不再等同于「谁负责的」

GitHub 的 prompt requests 和 vouching 机制尝试建立新的信任层，但这仍然是早期探索。

## 实践启示

1. **向后看的工作流设计**：AI Agent 最高效的应用可能不是「向前生成新内容」，而是「向后综合已有上下文」——回顾、总结、连接分散的信息
2. **微技能 > 大技能**：构建 AI 工作流时，优先设计原子化的微技能，通过运行时组合而非预定义管线来应对需求变化
3. **基础设施预扩容**：如果系统为人类速度设计，Agent 的使用会迅速击穿容量上限。提前规划 10-100x 的增长余量
4. **开源信任机制重构**：在 Agent 生成代码成为常态的世界中，需要新的代码来源标注、质量保证和责任归属机制

## 相关实体

- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](/ch01-642-openclaw-完全指南-这可能是全网最新最全的系统化教程了-3-2w字-建议收藏/)
- [两万字详解Claude Code源码核心机制](/ch01-734-两万字详解claude-code源码核心机制/)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](/ch01-707-存之有序-治之有矩-agent-记忆系统的工程实践与演进/)
- [构建基于多智能体架构的深度思考交易系统 V2](/ch01-728-构建基于多智能体架构的深度思考交易系统/)
- [Harness Engineering Framework](/ch05-041-harness-engineering-概念框架/)

---

