# 我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了

## Ch04.251 我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了

> 📊 Level ⭐⭐ | 9.9KB | `entities/我把-karpathy-的-autoresearch-搬到了软件开发领域效果炸了.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/我把-karpathy-的-autoresearch-搬到了软件开发领域效果炸了.md)
从微信文章 [我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/我把-karpathy-的-autoresearch-搬到了软件开发领域效果炸了.md) 提取。

## 核心内容
source_url: https://mp.weixin.qq.com/s/JFvYo9RCn9Xm8ilx1Chd6g

### 主要章节
- ##
* ** karpathy/autoresearch  ** — 核心循环：只保留可测量的改进，其余全部回滚

## 深度分析
**Karpathy AutoResearch 的核心哲学：可量化目标 + 自主循环 + 只保留改进。** Karpathy 的 autoresearch 项目把 AI 研究本身交给 AI 自主完成，核心循环极简：给 AI 一个 LLM 训练环境（单 GPU、5 分钟训练预算）→ AI 自主修改 train.py → 跑实验 → 检查 val loss 是否改善 → 改善才 commit，否则 git revert 回滚。这个设计的精髓在于三个"只有"：只有可量化的目标才能被自动判定（val loss 是唯一判断标准）；只有自主循环才能实现规模化（不需要每轮人类介入）；只有只保留改进才能避免噪声积累（退化的实验结果直接丢弃）。这个框架的底层逻辑是：让 AI 自己管理探索方向，而不是人类指定搜索空间。
**迁移到软件开发的等价替换：val loss → 多维评分，训练环境 → GitHub Issue。** 作者把"验证集损失改善"替换成"多维评分达标"，把"5分钟训练实验"替换成"实现 GitHub Issue + 跑测试"。等价的模式是：program.md 作为规则核心（相当于 Karpathy 的研究章程）→ Agent 自主识别 GitHub Issue → 实现代码 → 运行测试套件 → 多维评分达标才合并代码。实测 10 分钟完成一个中等复杂度 Issue，全程零人工干预，最终评分 9.0/10。这个替换的本质是把 ML 领域的"实验自动管理"框架迁移到了软件工程的"开发任务自动管理"。
**三大改进让 AutoResearch 更适应软件开发。** 作者在 Karpathy 原始设计基础上做了三个重要改进：① 多 AI Agent 交叉审核（多个 Coding Agent 同时审查对方代码，避免单一 Agent 的盲区）；② 5 维度量化评分（不只是编译通过，而是从正确性、可读性、安全性、性能、测试覆盖等多个维度量化评分）；③ 反馈驱动迭代（评分不达标时自动回到实现阶段重做，直到达标才进入审核）。这三点改进对应的是软件开发比 ML 研究更复杂的验收标准——ML 研究只有 loss 一个指标，软件工程有多个质量维度。
**program.md 是整个系统的核心资产。** 在 Karpathy 的框架里，program.md 是给 AI 的"研究章程"，定义什么是进步、什么算改进、边界在哪里。在软件开发的迁移版里，program.md 定义了多维评分标准、GitHub Issue 的理解框架、代码质量门禁。它是整个自动开发系统的规则核心，也是系统唯一需要人类持续维护的文件——当业务需求变化时，只改 program.md，不改 Agent 实现。这是一种"规则即代码"的思维方式，和 SDD（规范驱动开发）的思想高度一致。
**"只保留改进"原则对代码质量的深远意义。** 在传统代码库里，git history 会积累各种尝试记录，包括失败的实验、临时的 workaround、不成熟的方案。AutoResearch 模式只保留最终有效的代码——每次 commit 都代表一个经验证的改进，git history 从"实验记录"变成"有效改进序列"。这对代码可读性和可维护性有深远影响：当你想理解为什么某段代码是现在这个样子，你可以沿着 git history 追溯，每一步都是一个经过量化验证的改进决策。

## 实践启示
1. **把"可量化目标 + 自动判定 + 只保留改进"迁移到你自己的开发流程。** 不是所有任务都适合自动化，但如果你有一个可以明确量化验收标准的任务（测试覆盖率 > 80%、代码复杂度 < 15、没有已知安全漏洞），你可以设计一个"不达标就回滚"的自动化循环。这比 Code Review 更可靠，因为它执行的是客观标准，而不是 reviewer 的主观判断。
2. **优先在中等复杂度的独立 Issue 上验证 AutoResearch 模式。** 作者实测 10 分钟完成中等复杂度的 Issue，说明这个模式最适合的是"有明确边界、独立性强、验收标准可量化"的任务。高度耦合的跨模块重构、涉及多方协调的系统设计，这类任务不适合 AutoResearch 模式。选对战场是引入这个模式的第一步。
3. **program.md 是值得投入精力精心维护的核心资产。** 它是系统唯一需要人类持续更新的文件，定义了 Agent 的行为边界、质量门禁和验收标准。投入足够时间把 program.md 写清楚、写全面，是让整个 AutoResearch 系统运转得好的前提。相比之下，Agent 本身的实现是相对标准的，真正的差异化在于 program.md 的质量。
4. **多 Agent 交叉审核是提升代码质量被低估的手段。** 当两个 Agent 以不同的实现思路各自完成同一任务，然后交叉审核对方的代码时，它们会发现彼此视角下的盲区。这比单人 Code Review 更有效，因为 Agent 不会因为"这是同事写的"而手下留情，也不会因为时间压力而跳过细节检查。

## 相关实体
> ai agent platforms topic map（已删除）

- [精选 10 个开发者常用的 AI 智能体技能（Agent Skills）](ch04/245-skill.md)
- [民生银行基于规格驱动开发（SDD）的 CodeAgent 私域研发探索与实践](ch03/044-agent.md)
- [吴恩达：AI 将最先杀死前端](ch04/150-ai.md)
- [Anthropic 联创：2028 年实现 AI 自我构建的概率超过 60%](ch04/150-ai.md)
- [Agent架构关键变化：Harness正在成为新后端](ch03/044-agent.md)
- [国产顶尖模型 benchmark 评分那么高，可实际效果为什么差？看完 Anthropic 这篇博客，刷分的因素太单一了](ch01/707-anthropic.md)
- [你写的 Skill，及格了吗？](ch04/245-skill.md)
- [2 小时，0 行手写代码，我用 Claude 做了一个生产级 VSCode 插件](ch01/380-claude.md)
- [Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南](ch03/044-agent.md)
- [IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群](ch03/074-claude-code.md)
- [两万字详解Claude Code源码核心机制](ch03/074-claude-code.md)
- [天猫新品营销技术团队AI编码实战指南（上）](ch04/150-ai.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch03/074-claude-code.md)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程](ch03/044-agent.md)
- [告别“氛围编程”：基于 Harness 治理和 SDD 的团队级 AI 研发范式演进与实践](ch04/150-ai.md)
- [别再把上下文当聊天记录](https://github.com/QianJinGuo/wiki/blob/main/entities/别再把上下文当聊天记录.md)
- [Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](ch04/150-ai.md)
- [深度拆解 Hermes Agent 记忆系统：它修正了 OpenClaw 的哪层误区？](ch03/044-agent.md)
- [Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限](ch05/009-harness.md)
- [你不知道的 Agent：原理、架构与工程实践](ch03/044-agent.md)
- [看 AgentRun 如何玩转记忆存储，最佳实践来了！](ch03/044-agent.md)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](ch03/044-agent.md)
- [一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](ch05/061-harness-engineering.md)
- [龙虾装上了，可以用来干啥？分享下我的 OpenClaw 多智能体团队搭建经验！](ch11/210-openclaw.md)
- [Harness Engineering：耗时一周，我是如何将应用的AI Coding率提升至90%的](ch04/150-ai.md)

---

