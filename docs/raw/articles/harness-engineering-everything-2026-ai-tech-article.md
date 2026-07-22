---
title: "关于 Harness Engineering 你需要知道的一切（2026 版）"
source_url: "https://mp.weixin.qq.com/s/lc_iBYAu0kMZNP4cy1P6NA"
author: AI技术立文
feed: AI技术立文
publish_time: "2026-06-09 14:07"
ingested: "2026-06-10"
sha256: 8346a31f64c7a5ed0ee411c78ec1d28eccf636e8
type: raw
tags: [harness-engineering, agent, openai, anthropic, thoughtworks, guides-sensors, build-to-delete, harness-decay, five-artifacts, three-camps, five-principles]
sources: [harness-engineering]
---

## 关于 Harness Engineering 你需要知道的一切（2026 版）

AI技术立文 | 2026-06-09

2026 年 2 月，OpenAI 一个小团队交付了 100 万行生产代码。没有一行是手写的，全部由 AI Agent 完成。人类做的事情是设计一套系统，让 Agent 变得可靠。这套系统现在有了名字：**Harness Engineering。**

几周之内，Anthropic 发表了 3 篇相关论文，ThoughtWorks 形式化了一套框架，Hugging Face 的 Philipp Schmid 称它为"2026 年最重要的工程学科"。

### Harness 是什么

最简洁的定义来自 ThoughtWorks：**Agent = Model + Harness**

Harness 是除了模型之外的一切：约束 Agent 不跑偏的规则、捕捉错误的反馈回路、告诉 Agent 当前处境的文档、它被允许使用的工具。

Philipp Schmid 给出了最好的技术类比：模型 = CPU（原始算力），上下文 = RAM（有限的、易失的工作内存），Harness = OS（管理 CPU 看到什么、什么时候看到）。

2026 年发生了什么变化：LangChain 在 Terminal Bench 2.0 上用同一个模型跑了两次，唯一区别是 Harness——旧 52.8 分，新 66.5 分。Vercel 砍掉 Agent 80% 工具后性能反而更好。**Agent 从来不是难点，Harness 才是。**

### Harness 的 5 种制品

1. **AGENT.md / CLAUDE.md 文件**：分布在代码库各处的 Markdown 文件，Agent 每次会话开始时读取。OpenAI 叫 AGENT.md，Anthropic 叫 CLAUDE.md，Cursor 用 .cursorrules。没有它，Agent 每次从零开始；有了它，Agent 带着背景信息启动。

2. **JSON 特性列表（进度追踪器）**：每条记录定义一个特性、验证方法、通过/失败状态。Agent 选最高优先级失败项，实现，标记通过，提交，重复。为什么用 JSON 不用 Markdown？Anthropic 发现 Agent 意外覆盖 JSON 的概率比 Markdown 低得多。

3. **会话初始化例程**：Anthropic 的 7 步启动序列——确认工作目录→读取 git 日志和进度文件→找最高优先级未完成项→启动开发服务器→跑基础端到端验证→实现一个特性→提交并更新进度。没有它，Agent 花前 20 分钟搞清楚状态。

4. **Sprint 契约**：Agent 写任何代码前，先由 Generator Agent 和 Evaluator Agent 协商——要构建什么、如何验证成功。双方达成一致后才开始实现。本质上就是一个设计评审，只不过参与者换成了 AI。

5. **结构化任务模板**：写代码前先分析真实代码库，产出影响图——真实文件路径、真实符号名、可遵循的现有模式、具体验收标准。大多数团队跳过这一步，结果 Agent 臆造文件路径和编造 API 端点。

### 三大阵营

**OpenAI：环境优先**——100 万行生产代码，逐行 Review 不可行，所以把环境设计得足够严密。严格依赖流（Types → Config → Repo → Service → Runtime → UI）、代码库各处 AGENT.md、Agent 接入 CI/CD。Sora Android 应用 4 名工程师 28 天完成，Play Store 排名第一，崩溃率 <0.1%。Codex 每周处理 70% 内部 PR。

**Anthropic：把执行者和评审者分开**——Agent 评估自己产出时倾向给自己打高分。解法：三个专业化 Agent——Generator（构建）、Evaluator（批判，独立上下文+Playwright 浏览器测试）、Planner（拆需求为高层规格和冲刺阶段）。Opus 做规划、Sonnet 执行代码。

**ThoughtWorks：2×2 框架**——观察 50+ 工程团队后，将所有 Harness 控制沿两个维度分类：什么时候运行（前馈/反馈）× 怎么运行（计算型/推理型）。只有前馈或只有反馈都不够，两者都需要。

|  | 前馈（行动前） | 反馈（行动后） |
|--|----------------|----------------|
| **计算型** | 类型系统、linter、架构规则 | 测试套件、覆盖率分析、变异测试 |
| **推理型** | 规格文档、约束描述 | LLM 代码审查器、行为验证器 |

### 5 条共识原则

三个团队从未协调过，但独立得出了相同的结论：

1. **上下文胜过指令**：让 Agent 看到世界的当前状态，效果始终优于抽象地告诉它该做什么。基于真实文件路径工作，产出自然融入代码库。

2. **规划和执行必须分开**：让 Agent 在同一个 pass 里既规划又执行，产出不可靠。规划步骤不一定要人来完成，但它必须是一个独立的环节。

3. **反馈回路不可商量**：没有反馈的 Harness 只是一个带了额外步骤的 prompt。各方对谁来提供反馈有不同看法，但对是否需要反馈没有分歧。

4. **一次只做一件事**：试图一次做太多的 Agent 会耗尽上下文，失去连贯性，无声地丢弃需求。强制渐进式推进，是每个成功 Harness 的共性。

5. **代码库本身就是文档**：如果一条规范、约束或架构决策没有写在代码库里，Agent 就不会知道。仓库是唯一的事实来源。

### 悖论：为了删除而构建

**Harness 衰减是真实的**：Anthropic 从 Opus 4.5 升级到 Opus 4.6 时，Sprint 分解变得多余。Opus 4.7 发布后模型开始自行验证，Evaluator 角色进一步缩小。Harness 中的每个组件都编码了一个关于"模型做不到什么"的假设，模型能力提升后假设过期。

- Opus 4.5：Sprint 分解 + 逐 Sprint 评估
- Opus 4.6：去掉 Sprint 分解 + 单次评估（节省 38% 成本）
- Opus 4.7：模型开始自验证 → Evaluator 角色进一步缩小

**Build to delete**（Philipp Schmid）：设计每个组件时就考虑它可移除，定期关掉看质量是否变化。

**成本现实**：Anthropic A/B 测试——无 Harness $9/20min（核心功能有缺陷）vs 完整 Harness $200/6h（功能完备，精致 UI）。22 倍成本差距，但换来真正可交付的产品。

趋势线：更好的模型 = 更简单的 Harness = 更便宜的运行 = 更快的产出。

### 总结

- 概念：Agent = Model + Harness。模型是 CPU，Harness 是操作系统。换个更好的 Harness 就能提升 13% 性能。
- 5 种制品：引导文件、JSON 特性列表、会话初始化例程、Sprint 契约、结构化任务模板。
- 三大阵营：OpenAI 环境优先、Anthropic 执行评审分离、ThoughtWorks 2×2 框架。
- 5 条共识原则：上下文胜过指令、规划与执行分开、反馈回路不可商量、一次只做一件事、代码库即文档。
- 核心悖论：Harness 衰减真实，要为了删除而构建，更好模型 = 更简单 Harness。

2026 年走在前面的工程师，不是写最好代码的人，而是设计最好约束的人，并且愿意在约束失效的时候果断移除它们。
