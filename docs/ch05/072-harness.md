# 如何利用 Harness 一句话交付产品功能

## Ch05.072 如何利用 Harness 一句话交付产品功能

> 📊 Level ⭐⭐ | 6.7KB | `entities/harness-one-sentence-product-delivery-baidu-geek.md`

# 如何利用 Harness "一句话交付产品功能"

百度 Geek 说 17 哥分享团队将开发模式从 "Vibe Coding" 升级为 "Harness 模式" 的实践——代码库为唯一事实源，Agent 自治流转。该实践基于一个实际的大模型评测平台（Side-by-Side 平台），从两个独立仓库（React 前端 + Go 后端）出发，通过 Git Submodule 整合为单仓，并设计了一套由 6 个专业 Sub-Agent 组成的自动化协作流水线。

## 核心模式

Harness 模式的三个核心转变：
- **从 "AI 写代码，人统筹" 到 "代码库为唯一事实源，Agent 自治流转"**——将 AI 的角色从 "辅助代码编写" 提升为 "自治开发流程的执行者"
- **从单 Agent 完成所有任务到 6 个专业 Sub-Agent 协作流水线**——通过专业化分工解决单 Agent 的 "上下文焦虑" 和 "自视甚高" 问题
- **从人工联调到 Agent Handoff 协议自动流转**——用结构化交接协议替代人工沟通

## 深度分析

### 从 Vibe Coding 到 Harness 的必然跃迁

Vibe Coding 阶段团队面临的核心痛点不是 "AI 写不好代码"，而是 **沟通成本转移而非消除**。当 AI 代写了代码实现后，前后端联调、需求拆解、Bug 修复仍然依赖人工沟通，且由于 AI 产出的代码缺乏一致性和可预测性，调试成本反而上升。

文章记录了一个典型案例：仅为给提示词长内容增加 "展开全部" 功能，团队与 DUCC 来回沟通了 2 个多小时，最终通过 `/clear` 重置上下文才完成。这个直观的痛点直接催生了 Harness 模式的探索——**不是让 AI 更聪明，而是让 AI 的协作方式更可治理**。

### 单仓重构：AI-First 架构的基础设施前提

该实践最关键的决策是 **用 Git Submodule 将两个独立仓库整合为单仓**。参考 Peter Pang "Why Your 'AI-First' Strategy Is Probably Wrong" 中的论断——"I had to unify all the code into a single monorepo. One reason: so AI could see everything."——团队意识到 AI-First 意味着必须围绕 AI 重塑代码组织方式。

单仓结构分为三个层级：
1. **全局知识**（`CLAUDE.md`）：跨前后端、跨 Agent 的作战地图和协作规则
2. **子模块知识**（各子仓库的 `CLAUDE.md`）：前端/后端各自的架构、约束和编码规范
3. **Agent 定义**（`.claude/agents/`）：6 个 Sub-Agent 的职责描述和 Handoff 接口

这种分层实现了 "一切皆在代码库，代码库之外别无他物" 的目标，使 Agent 的可访问知识涵盖了完整的业务上下文。

### Agent Handoff 协议：分布式协作的 "状态总线"

6 Sub-Agent 架构引入了新的挑战：如何在 Sub-Agent 之间安全、结构化地转移 "控制权" 与 "上下文状态"。团队设计了简洁的 **Agent Handoff 协议**，每个 Agent 结束任务时附加结构化 Handoff 块。

Handoff 协议的核心设计要点：
- **状态枚举**：`completed`/`awaiting_review`/`has_bugs`/`all_passed` 四种状态覆盖全生命周期
- **显式下一步**：明确指定下一个 Agent 及其启动 Prompt，避免 "哑巴交流"
- **人工审核节点**：PRD 阶段设计为 `awaiting_review`，需要在关键决策点引入人类判断
- **缺陷闭环**：`has_bugs` 状态自动触发修复→重测试循环，直到 `all_passed`

Handoff 块直接写入主会话而不落盘，避免了引入额外存储复杂度。主 Agent 通过 Handoff 协议调度各 Sub-Agent 自动化执行，形成 **主 Agent 编排 + Sub-Agent 执行** 的超轻量级 Harness 架构。

### E2E 测试的局限与 Harness 的边界认知

实践揭示了 Harness 模式的真实边界：
1. **E2E 测试检测能力弱**——90%+ 的缺陷由 API 接口测试发现，E2E 测试很少报告样式/Bug
2. **测试 Agent 对 Bug 认定比人类宽松**——缺少对布局、美感的评判标准
3. **需求遗漏可能传导**——PRD 审核环节的遗漏会导致整个流水线方向偏离

这些边界不是 Harness 模式的缺陷，而是对 **自动化程度与人类判断之间合理分界点** 的诚实认知。团队明确当前的 Harness 能力 "只保证功能的可用性，并不保证页面符合人类的审美"，这种诚实的边界界定本身就有实践指导价值。

## 实践启示

1. **从痛点出发而非从技术出发**——Harness 模式的启动不是因为 "想用工具"，而是 Vibe Coding 中 2 小时改一个展开按钮的切肤之痛。找到团队最疼的环节作为切入点。

2. **Monorepo 是 Agent 协作的基础设施前提**——如果代码分散在多个仓库，Agent 无法获得全局上下文。Git Submodule 提供了一条低成本的过渡路径，无需立即重构整个代码库。

3. **Agent 交接协议比 Agent 能力更重要**——Sub-Agent 分布式协作的价值取决于交接质量。定义一个简洁、完整的状态枚举和 Handoff 块格式，比追求单 Agent 的能力上限回报更高。

4. **人工审核要战略性地保留而非一刀切去除**——PRD 阶段保留人工审核（而非完全自动化），是在 "效率" 和 "质量" 之间的理性权衡。关键决策点的审核成本远低于整条链路方向错误的修复成本。

5. **接受 Harness 的适用范围边界**——对于非复杂交互的系统（如评测平台），当前 Harness 能力已足够。追求 100% 自动化或 100% 审美质量在 ROI 意义上并不合理。

## 相关实体

- [Harness Engineering 全景](ch05/052-harness-engineering.html)
- [Agent Harness 架构](ch05/039-agent-harness.html)
- [Harness 上下文管理工作集](ch05/039-agent-harness.html)
- [Harness Engineering 实践调查](ch05/052-harness-engineering.html)
- [Vibe Coding 与 AI 软件工程](../ch09/132-vibe-coding-ai.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/如何利用-harness-一句话交付产品功能.md)

---

