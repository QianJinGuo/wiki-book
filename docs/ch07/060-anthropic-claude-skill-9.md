# Anthropic Claude Skill 9 类任务分类法

## Ch07.060 Anthropic Claude Skill 9 类任务分类法

> 📊 Level ⭐⭐ | 6.5KB | `entities/anthropic-claude-skill-9-categories-datawhale-2026.md`

# Anthropic Claude Skill 9 类任务分类法

Datawhale 编译自 Anthropic 官方博客。Anthropic 内部把 Claude Code Skills 分为 **9 类任务类型**，覆盖从知识补充到生产运维的完整软件工作流。本文整理了这 9 类分类、最佳实践和团队落地经验。

## 核心洞察

### 9 类 Skill 任务分类

| 类别 | 阶段 | 核心价值 |
|------|------|----------|
| 1. Library & API Reference | 知识层 | 解释库/CLI/SDK 的正确用法与 gotchas |
| 2. Product Verification | 验证层 | 无头浏览器跑完整流程，Anthropic 认为**提升最明显** |
| 3. Data Fetching & Analysis | 数据层 | 封装取数方法、字段约定和分析路径 |
| 4. Business Process & Team Automation | 流程层 | standup、周报等团队协作流程自动化 |
| 5. Code Scaffolding & Templates | 生成层 | 带自然语言约束的固定骨架代码生成 |
| 6. Code Quality & Review | 质量层 | adversarial-review subagent、CI hook |
| 7. CI/CD & Deployment | 部署层 | babysit-pr、deploy-<service> 全链路 |
| 8. Runbooks | 排障层 | 报警/Slack 入口 → 结构化结论 |
| 9. Infrastructure Operations | 运维层 | 资源清理、依赖治理（需 guardrail） |

### 关键最佳实践

- **聚焦 > 大而全**：能清楚落进某一类的 Skill 更稳，跨类 Skill 易带乱模型
- **验证最值得投入**：Anthropic 建议工程师花一周打磨 verification Skill
- **Gotchas 最有价值**：真正值得写的是「模型默认不知道但团队人人知道」的细节
- **SKILL.md 当目录用**：渐进式披露（progressive disclosure），具体资料分文件按需加载
- **记忆 + 脚本 + hooks 是 Skill 自然生长路径**

## 与现有知识库的关联

- [Anthropic 14 个 Agent Skills 设计模式](../ch04/251-anthropic-agent.html) — 互补：14 设计模式讲 **怎么写**（结构/格式），9 分类法讲 **做什么**（任务类型）
- [Skill 设计模式](../ch04/267-skill.html) — 5 种核心结构模式（线性、Tool Wrapper、Generator 等），补充了 9 类分类中的生成/验证/运维类如何组织
- [从 Anthropic 到 Google：Agent Skills 进入设计模式阶段](../ch04/396-agent-skills.html) — Google 5 Agent Skill 设计模式 vs Anthropic 视角
- [Perplexity 内部 Skill 设计指南](../ch04/267-skill.html) — 另一家的 Skill 工程方法论对比
- [Hermes Agent](../ch03/092-hermes-agent.html) — Hermes 的 Skill 系统实现参考

## 深度分析

### 9 类分类的底层逻辑：从「能力注入」到「工作流封装」

Anthropic 的 9 类分类表面上是对已有 Skills 的盘点归类，但隐含了更深的能力分层逻辑。前 3 类（Library/Verification/Data）解决的是**模型能力缺口**——Claude 不懂公司内部 API 怎么用、不知道产出对不对、不知道数据在哪怎么查。中间 3 类（Process/Scaffolding/Review）解决的是**团队规范注入**——怎么写代码、怎么汇报、怎么 Review。后 3 类（CI/CD/Runbooks/Infra）已经超出「补知识」的范畴，进入了**生产环境代操作**——不仅是教 Claude 做事，而是让 Claude 直接做事。

这个分层结构揭示了 Skill 的进化路径：从「给模型补充背景知识」（Library）一路演进到「让模型操作生产系统」（Infra），本质上是从 passive knowledge injection 到 active operation 的连续光谱。

### 「验证」优先的策略合理性

Anthropic 特别强调 Product Verification 类 Skill，甚至建议工程师花一周打磨，这个判断值得认真对待。在「模型产出质量」这个场景里，**验证才是真正的瓶颈**——模型生成一个方案很容易，但判断这个方案是否真的有效需要一套完整的验证基础设施。这解释了为什么 Anthropic 内部把 verification 放在几乎所有其他类型之上：它直接锁定了「模型错觉」这个核心风险。

### Gotchas 经济的信号价值

Anthropic 发现最有信号量的 Skill 内容不是通用步骤而是 gotchas，这个观察其实揭示了 Skill 作为「团队隐性知识显性化」的本质。通用步骤模型本身就知道（从训练数据中学到了），那些「团队里人人知道但模型默认不知道」的细节——订阅表是 append-only、字段名跨服务不一致、staging 200 ≠ webhook 成功——才是 Skill 真正创造经济价值的地方。这些细节的单个体积很小，但累积起来的边际决策质量收益很大。

### vs Google 5 设计模式：互补而非替代

Google 的 5 Agent Skill 设计模式（Tool Wrapper/Generator/Reviewer/Inversion/Pipeline）聚焦于 Skill 文件内部的**工作流结构**。Anthropic 的 9 类分类聚焦于**任务类型选择**。两者不冲突：你同时需要知道「该不该做一个 Verification Skill」（Anthropic 的分类告诉你该做）和「做出来后怎么写它的工作流」（Google 的模式告诉你怎么写）。

## 实践启示

1. **建立 Skill 创意时的「分类检查」**：在决定新建一个 Skill 之前，先看它属于 9 类中的哪一类。如果跨类 → 拆成多个聚焦 Skill
2. **优先投入 Verification 类 Skill**：提升效果最明显。每个验证 Skill 配 glass-box 测试（录视频 + 断言）
3. **Gotchas 优先级高于通用步骤**：Skill 维护时优先补充 gotchas，删减「模型本就该知道」的内容
4. **渐进式文件结构**：SKILL.md 只做目录 + 核心约束，细节分拆到 references/、scripts/、assets/ 子文件
5. **记忆层是 Skill 的高级形态**：从纯指令 → 记忆（standups.log/SQLite） → 脚本（helper functions） → hooks（/careful、/freeze）——路径清晰可循

## 原始存档
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-claude-skill-9-categories-datawhale-2026.md)

---

