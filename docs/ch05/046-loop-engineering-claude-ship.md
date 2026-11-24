# Loop Engineering 半年实战拆解：claude-ship 开源自进化开发系统

> 📊 Level ⭐⭐⭐ | 8.7KB

## 核心概述

Peakstone Labs（AI 原生量化研究实验室）开源的 claude-ship 系统（github.com/Peakstone-Labs/claude-ship），单人 AI 开发 Loop Engineering 半年实战总结。核心判断：Loop Engineering 的本质是设计一个会自我进化的开发系统——用工程约束对抗确认偏误和技术债，用记忆和校准让每一次循环都比上一次更强。

→ [原文存档](https://mp.weixin.qq.com/s/LUR7nZK77UbbcolO3P0peQ)

## 七 Agent 流水线

Seven slash commands: `/clarify` → `/architect` → (`/third_party_review`) → `/ship` → `/retro`。每个 agent 有独立人格定义、工具权限、模型分配。

### 五大设计决策

1. **单问澄清**：Clarify agent 一次只问一个问题，先读代码再问，第 8 轮自动暂停
2. **预提交预测**：Review agent 先基于 design 预测 3-5 个缺陷区域，再带预测审代码。记录命中/漏掉的问题（认知盲区=进化入口）
3. **分级阻断 + 低风险即修**：🔴/🟡 阻断循环，🟢/💡 四条件满足则必须修（有客观依据、无副作用、≤20行单文件、无需用户确认）
4. **三条铁律筛 memory**：Non-Googleable + Codebase-Specific + Hard-Won，总文件数 5-8 硬上限
5. **跨厂商设计评审**：third_party_review 用不同厂商模型设计评审（headless Claude Code + 切换 endpoint）

### 编排层：/ship 状态机

- review 和 qa 跑在独立 subagent（隔离上下文，防止思维污染）
- review gate 硬阻断：🔴/🟡 > 0 跳过 QA 打回 dev
- 循环上限 5 轮，第 4 轮暂停询问
- 文档增量追加，不得修改历史章节

## 进化循环 vs 代码循环

最重要的循环不是 dev→review→qa，而是 **retro→memory→下一个 feature** 的进化循环。

* 代码循环：保证这一次不出错
* 进化循环：保证下一次比这一次更强（知识积累 + 校准积累 + 流程积累）

## 诚实缺陷

1. 多轮 loop 后 context window 吃紧
2. 同模型家族的 review/qa 共有偏见
3. 对简单任务太重
4. retro→memory 闭环不够紧
5. 依赖写清楚的 CLAUDE.md

## 深度分析

### 进化循环与代码循环的结构差异

代码循环（dev → review → qa）是**收敛型闭环**：目标函数固定为"本轮交付没有 🔴/🟡 缺陷"，终止条件明确，轮次上限 5 轮、第 4 轮暂停询问。进化循环（retro → memory → 下一个 feature）则是**开放累积型回路**：它没有单一终点，产出物不是一份通过的代码，而是筛过的记忆、被度量的认知盲区、被固化的流程。失败模式也正好相反——代码循环怕漏审，进化循环怕记错，因为一条错误的 memory 会被之后每个 feature 继承放大。真正决定长期差异的不是前者的工业流水线，而是后者的复利，这也使进化循环更接近 [自改进循环](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-self-improvement-loops.md) 而非普通编排。

### 七个 Agent 买到的是独立性，不是算力

多 agent 的价值不来自"分工更细"，而来自**上下文与人格的隔离**：review 与 qa 跑在独立 subagent，目的是让审查视角不被开发思维污染；third_party_review 切换厂商端点，是为了打破同一模型家族的共有偏见。换言之，多花的成本买的是「判断的独立性」，而不是「更多的算力」。代价在报告里被诚实列出：多轮 loop 后 context window 吃紧、简单任务被过度工程化。因此合理用法是分级——只有复杂度足够、值得付出协调成本的任务才走完整七件套，小任务应当单 agent 直通。

### 缺陷清单其实是权衡清单

四条瓶颈并非"待修的 bug"，而是系统主动做的取舍：上下文吃紧，是"多轮硬阻断审查"的必然账单；review/qa 串通，说明跨厂商评审只在 design 阶段做了、没有贯穿到代码阶段；"对简单任务太重"，暴露流水线缺少自动的复杂度路由；retro → memory 闭环不够紧，意味着进化的燃料存在泄漏。把它们串起来看，这套系统的短板几乎都长在「独立性 vs 成本」这条轴的同一侧，而依赖写清楚的 CLAUDE.md 则说明耐久性最终押在人的输入质量上。

### 记忆与校准：两个反直觉的约束

memory 总量被硬限制在 5-8 个文件，并用三条铁律过滤（Non-Googleable / Codebase-Specific / Hard-Won）。这是反直觉但深刻的约束：记忆多了检索质量下降，而注入记忆又占用本就紧张的上下文窗口，多而杂的 memory 会从燃料变成阻力——硬上限因此不是容量不足，而是注意力预算管理。与之配套的是预提交预测：review agent 先不读代码、基于 design 预测 3-5 个最可能的缺陷区域，再审代码并记录命中与漏掉。关键在于"漏掉"被显式计量成认知盲区，模糊的审查经验由此变成可结算的指标，校准回路才有原料可写。

### 半年实践的耐久性含义

半年的单人实践说明，这套系统能被一个人维护半年并开源，靠的不是模型能力换代，而是流程的机械化：文档增量追加不得改历史章节、轮次上限、阻断阈值、低风险即修的四个客观条件，全部是可被机器执行的约束。它暗示 agent pipeline 的耐久性来自外部规则而非模型智力——CLAUDE.md 写得清不清楚，比换哪一代模型更决定成败；对 [Agent 记忆架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md) 与 [上下文窗口经济学](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md) 的理解，比对 [编排模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-orchestration-patterns.md) 的堆叠更重要。

## 实践启示

1. **先建进化循环，再优化代码循环**：dev→review→qa 只保证这一次不出错，retro→memory→下一 feature 才决定下一次是否更强。若只有预算做一件事，先做 retro 与 memory 的闭环，并让它每一步都有可写入的具体原料。
2. **给记忆设硬上限并坚持筛选标准**：把 memory 控制在个位数，只留网上搜不到、能指到具体文件或报错、真实付过 debug 代价的条目；否则它会同时污染检索与上下文预算，成为累积的负债。
3. **用预算买独立性，而不是买人手**：多 agent 的唯一硬理由是隔离——独立 subagent 隔开审查与开发、跨厂商模型打破家族偏见。若某个新增 agent 不能带来新的判断视角，它只是在分摊同一个偏见。
4. **把缺陷预测显式记账**：让审查者先写下预测再审代码，命中与漏掉都要留档；"漏掉"是唯一能直接指向认知盲区的信号，也是校准回路能否闭合的关键（可参考 [角色专业化](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-role-specialization.md) 的做法）。
5. **为流水线装复杂度路由**：完整的七件套只应服务于足够复杂、值得付出协调成本的任务，小任务必须能一键直通；否则流程越完备，日常使用越会绕过它，最终退化为摆设。
6. **用可机械化的约束替代人的意愿**：轮次上限、阻断阈值、文档只增不改、低风险即修的客观条件，都应写成机器能执行、人能审计的规则——耐久性来自约束，而约束必须落到文件与脚本里，而不是留在记忆里。

## 快速开始

```bash
git clone https://github.com/Peakstone-Labs/claude-ship.git && cd claude-ship && ./install.sh
```

## 相关实体

- [从 SDD 到 Lattice Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/sdd-practice-lattice-harness-team-ai-coding.md) — 另一团队级 AI Coding 闭环实践
- [《Loop Engineering橙皮书》](https://github.com/QianJinGuo/wiki-public/blob/main/entities/2026-06-17--Loop-Engineering橙皮书-发布-免费-开源-花叔.md) — Loop Engineering 概念框架
- [Agent Loop 工程手册 8 个未解问题](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-loop-engineering-handbook-8-questions-chen-jin-tencent-self-2026.md) — 腾讯云陈进 Loop Engineering 解读

---

