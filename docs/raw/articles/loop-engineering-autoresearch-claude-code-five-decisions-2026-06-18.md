---
title: "Loop Engineering：从 AutoResearch 到 Claude Code——循环设计的第一性原理"
source_url: "https://mp.weixin.qq.com/s/kDNWMR3kU9MWN4nb6dRi8w"
ingested: 2026-06-18
sha256: pending
type: raw
---

最近学到个新词"Loop Engineering"，初看以为叒有啥新技术了，还有"Prompt已死，balabala ..."，真是语不惊人死不休啊。看了之后，第一时间就想到了AutoResearch和Claude Code的query loop，不是新技术，只是谷歌大佬Osmani的总结。想想也有道理，年初时大家都在关注Harness，现在看来Harness也是为了服务核心的Loop Engineering。

无论是Prompt、Context、harness还是现在的Loop engineering都是Agent的重要组成部分，彼此互补，共同打造了Claude Code、Codex等惊艳的产品/系统。

本文结合AutoResearch和Claude Code说明Loop engineering的定位、关键点与注意事项。

## 一、一夜 100 个实验：Karpathy 的 AutoResearch

2026 年 3 月，Andrej Karpathy 开源了 AutoResearch。这个项目做的事很简单：让 AI agent 自主跑深度学习实验——修改训练代码、运行 5 分钟、评估指标、保留改进或回退。一夜跑完约 100 个实验，零人工干预。

GitHub 80,000+ Stars，成果斐然：Red Hat 用它跑了 198 个实验，零干预拿到 2.3% 验证损失改进；Shopify 用它把 Liquid 模板引擎的解析延迟从 7,469 微秒压到 3,534 微秒，加速 53%。

但最让我关注的不是结果，而是它的循环结构：

整个系统只有三个文件：
- prepare.py：数据准备和评估函数（🔒 只读，保护评估完整性）
- train.py：模型和训练循环（🤖 Agent 可修改）
- program.md：研究指令（👤 人类编写）

循环逻辑极度简洁。判断标准只有一个：val_bpb 有没有改善。没有复杂的条件分支，没有动态策略选择。

这就引出了一个核心问题：Karpathy 没有在写提示词，他在设计一个循环系统。这和我们日常用 ChatGPT 写 prompt 是完全不同的思维。

## 二、三阶段跃迁：你的 AI 工程在哪一层？

Karpathy 的 program.md 不是 prompt——它是一个循环系统的运行规则。这个区别代表了 AI 应用开发的阶段跃迁。

Addy Osmani 在 2026 年 6 月提出了一个清晰的三阶段模型：

| 阶段 | 核心问题 | 人的角色 | 典型产物 |
|------|---------|---------|---------|
| Prompt Engineering | 如何提问-考验LLM的指令遵循能力 | 每次手写提示 | ChatGPT 对话单次 API 调用 |
| Context Engineering | 给LLM更多的背景知识 | 设计信息组装管道 | RAG 系统、System Prompt 拼装 |
| Loop Engineering | 怎么让 AI 自己迭代 | 设计循环规则后退出执行 | AutoResearch Claude Code Agent等 |

Karpathy 的 program.md 就是 Loop Engineering 的产物：他不写每一步的指令，而是定义研究方向和约束条件，让 agent 在循环中自主决策。

"Loop Engineering is replacing yourself as the person who prompts the agent, designing the system that does it instead." —— Addy Osmani

### 层间依赖：不能跳级

三个阶段是叠加关系，不是替代关系：没有好的 Context Engineering，你的循环每一轮都在垃圾信息里打转；没有好的 Prompt Engineering，你的循环每一步的执行质量都不过关。AutoResearch 的 program.md 之所以有效，是因为它同时做好了三层：指令清晰（Prompt）、实验环境信息完整（Context）、循环规则正确（Loop）。

多说一句，claude code运行中特定步骤的prompt，也可以看作是基于context 以及特定的压缩、组合策略得到的，从这个角度更可以看出prompt与context的相互促进、彼此结合的特质。

### 为什么Loop Engineering在这个时间点被提出？

技术成熟度拐点。LLM 推理能力支撑多步规划（Claude 3.5+、GPT-4+），Token 窗口够大（1M上下文已成为标配），工具调用趋于标准化（Function Calling、MCP 协议）。

开发者需求拐点。从"让 AI 回答问题"到"让 AI 完成任务"，从"优化单次交互"到"优化整个流程"。

两个拐点叠加的结论：工具已经就绪，问题是你会不会设计循环。

## 三、从 AutoResearch 提炼设计原则

回到 Karpathy 的实验。AutoResearch 的循环只有 5 步，判断标准只有 1 个。但它能一夜跑 100 个实验，而且结果可靠。为什么？因为它做对了循环设计的几个核心决策。

### 原则 1：循环本身应该简单

AutoResearch 的循环逻辑没有条件分支。不是"如果实验类型是 A 就走路径 1，如果是 B 就走路径 2"，而是无论什么实验，都走同一个流程：修改 → 运行 → 评估 → 保留或丢弃。

这不是 Karpathy 偷懒。VILA Lab 对 Claude Code 源码的逆向分析（Jiacheng Liu et al., 2026）发现了同样的模式：Agent 的核心循环决策逻辑（queryLoop()）仅占代码总量的约 1.6%，而运行时基础设施（Harness）占 98.4%。

两个独立的工业级系统，得出同一个结论：

循环决策逻辑应该占代码总量的 < 10%。复杂度放在循环之外的基础设施里。

为什么简单循环有效？对比：

| 设计 | 循环逻辑 | 出错时 | 可维护性 |
|------|---------|--------|---------|
| 复杂循环 | 10+ 条件分支，动态策略 | 难以定位哪个分支出了问题 | 改一处影响全局 |
| 简单循环 | 固定步骤，单一判断 | 清晰的失败点 | 每个子系统独立优化 |

同样，Simon Willison也认可这样的观点："Dumb loops beat clever workflows."——简单循环反复迭代，优于精巧的一次性编排。

### 原则 2：终止条件必须明确

AutoResearch 有两个终止条件：时间预算耗尽（5分钟/实验），或连续 N 次无改进。Claude Code 有五个停止条件：无 tool use、max turns 达到、上下文溢出、hook 干预、abort controller 触发。

没有明确终止条件的循环，本质上就是一个死循环——或者更准确地说，是一个烧钱的死循环。

终止条件的四种类型：

| 终止类型 | 适用场景 | AutoResearch 实例 | Claude Code 实例 |
|---------|---------|-----------------|----------------|
| 目标达成 | 有明确可验证的目标 | val_bpb 不再改进 | 无 tool_use（问题已回答） |
| 资源耗尽 | 有预算约束 | 固定 5 分钟窗口 | Max turns 达到 |
| 质量劣化 | 产出质量可量化 | 连续 N 次无改进 | — |
| 主动中断 | 人类需要介入 | — | Abort controller 触发 |

一个可复用的模板：

```python
def should_stop(state):
    if goal_achieved(state): return True       # 任务完成
    if budget_exceeded(state): return True     # 超出预算
    if quality_degrading(state): return True   # 质量在下降
    if user_interrupted(): return True         # 人类介入    
    return False
```

关键原则：如果你说不清楚终止条件是什么，那就不要开始这个循环。

### 原则 3：回退策略决定容错模式

AutoResearch 的 ratchet 机制是最激进的回退策略：只前进，不后退。改进了就 git commit，没改进就 git revert。代码只能变好，绝不会变差。

但 ratchet 不是唯一选择：

| 策略 | 机制 | 适用场景 | 实例 |
|------|------|---------|------|
| Ratchet（只前进） | 保留改进，丢弃无效 | 目标函数明确且单调 | AutoResearch 的 git commit/revert |
| Rollback（回滚） | 恢复到上一个良好状态 | 操作有副作用且不可重复 | 数据库事务 claude -r 选择回滚位置 |
| Retry（重试） | 原地重新执行 | 失败是随机性的 | Claude Code 的 tool 重试 |
| Branch（分支） | 多方案并行尝试 | 解空间大且资源充足 | Git worktree 并行实验 |

Karpathy 选择 ratchet 是因为他的场景完美匹配：val_bpb 是一个明确的标量指标，越低越好，没有歧义。如果你的目标不是一个清晰的标量——比如"代码质量"——ratchet 就不适用。

一点思考：有时感觉Agent中的Loop，跟SFT/RL有些像，他需要监督数据 - 可以是标注数据、也可以是可量化的目标，目标可衡量是决定能否Loop的关键

## 四、从实验到工业：Claude Code 的验证

AutoResearch 是一个研究工具，面向的是可重复的 ML 实验。但它的设计原则是否适用于更复杂的场景？

Claude Code 给出了答案。

### 同一哲学，不同规模

VILA Lab 的逆向分析揭示了 Claude Code 的架构核心 - queryloop：

```
用户消息 → 上下文组装 → LLM 推理 → 工具调用？
 ↓ yes
执行工具 → 结果加入上下文 → 继续推理
 ↓ no
输出回复 → 循环结束
```

和 AutoResearch 一样的极简循环。但支撑这个循环的基础设施复杂得多：

| 维度 | AutoResearch | Claude Code |
|------|-------------|------------|
| 循环逻辑占比 | 极小（3 文件结构） | ~1.6%（queryLoop()） |
| 基础设施 | git commit/revert + 固定时间窗 | 权限系统 + 上下文压缩 + 子 Agent + 沙箱 + 持久化 |
| 终止条件 | 1-2 个 | 5 个 |
| 权限模型 | 无（全自动） | 7 种渐进模式（plan → bypassPermissions） |
| 上下文管理 | 无（每轮独立） | 5 层渐进压缩管线 |

Claude Code 证明了"简单循环 + 复杂基础设施(Harness)"的模式可以 scale 到通用编码场景。

### 五个关键决策

设计一个循环，本质上是回答五个问题。AutoResearch 和 Claude Code 分别给出了自己的答案：

**决策 1：终止条件——何时停止？**

**决策 2：检查点——何时需要人工审批？**
AutoResearch 的答案是"不需要"。因为有 ratchet 保底，结果只进不退。
Claude Code 的答案是"分层"：deny-first 权限系统默认拒绝所有写操作，7 种权限模式构成渐进自主频谱。高风险操作拦截，低风险操作放行。

⚠️ 来自 Claude Code 的踩坑数据：研究表明，用户对权限弹窗的批准率高达 93%。这说明人是有惰性的（不靠谱），久而久之会形成"无脑点同意"的肌肉记忆。所以，绝对不要把系统的安全性完全押宝在"用户会仔细审查"上，底层必须做沙箱隔离和严格的权限分级 - Harness。

**决策 3：回退策略——出错怎么办？**

**决策 4：循环粒度——一步做多少工作？**

| | 细粒度 | 中等 | 粗粒度 |
|---|--------|------|--------|
| 单元 | 单工具调用 | 多步 plan-execute | 完整子任务 |
| 特点 | 快速反馈 | 平衡 | 高自主但难调试 |

AutoResearch 选择粗粒度：一个完整实验是一步。因为实验是原子性的——跑到一半的实验没有意义。
Claude Code 选择细粒度：单个工具调用是一步。因为编码任务的步骤之间有强依赖，每步都需要验证上一步的结果。

选择依据：任务可分解性高 → 细粒度；任务已稳定运行 → 粗粒度。

**决策 5：子任务委派——何时派发子 Agent？**
当子任务满足以下条件时，应该委派给独立 Agent：
- 耗时超过 5 分钟（阻塞主循环代价太高）
- 需要独立上下文（避免信息互相污染）
- 多个子任务之间无依赖，可并行

Claude Code 的实现：子 Agent 以 minimal 模式运行，完成后只返回摘要。代价：Agent Teams 模式消耗约 7 倍标准会话 token。
原则：只在"并行收益 > 协调成本"时才拆分。

可直接套用的决策表：

| 你的场景 | 终止条件 | 检查点 | 回退策略 | 粒度 | 子Agent |
|---------|---------|--------|---------|------|---------|
| ML 实验优化 | 时间耗尽/无改进 | 无 | Ratchet | 完整实验 | 否 |
| 代码生成 | 测试全部通过 | 高风险操作前 | Branch | 多步 plan | 大重构时 |
| 数据处理 | 质量指标达标 | 每 10 个产出抽查 | Retry | 单步执行 | 否 |
| 研究综述 | 信息饱和 | 方向选择时 | Rollback | 搜索-阅读循环 | 多主题并行时 |

## 五、循环的暗面：三重陷阱

循环放大效率，也放大风险。

### 陷阱 1：验证困境（Verification Gap）

问题：循环产出速度远超人类审查带宽。

AutoResearch 社区的一个真实案例：一个针对 Shopify Liquid 模板引擎的 PR 最终未被合并，被标记为"probably somewhat overfit"。循环优化了指标，但产出了过拟合的方案。MSR 的研究数据更触目惊心：56.1% 的 AI agent commit 降低了代码可维护性。超过一半的"改进"实际上在堆积技术债。

对策：分层验证。
- 第一层：自动门控（测试通过、lint 无报错、类型检查正确）
- 第二层：质量阈值监控，指标跌破阈值时自动暂停循环
- 第三层：人工抽查（10% 采样率），随机抽检保持威慑效应

### 陷阱 2：人类不懂Agent产物（Comprehension Debt）

问题：你读了 AI 产出的代码，觉得"看起来没问题"，但其实没真正理解。

Shen & Tamkin（2026）的研究：AI 辅助条件下，开发者代码理解力测试得分低 17%。He et al.（2025）对 807 个仓库的因果分析：采用 AI 编码工具后代码复杂度显著上升，初始的速度提升在 3 个月后消散至基线。

短期效率提升被长期维护成本吃掉了。

对策：强制理解环节。
- 在循环设计中加入"AI 必须解释为什么这样改"的环节
- 代码和文档在同一个循环中更新
- 定期手动重构核心模块，重建深度理解

### 陷阱 3：放弃自主思考（Cognitive Surrender）

问题：逐渐放弃独立判断，默认接受循环的结论。

Anthropic 内部对 132 名工程师的调查（Huang et al., 2025）揭示"监督悖论"：过度依赖 AI 可能萎缩你监督 AI 所需的技能。你越依赖循环的产出，你越难以判断产出是否正确。

对策：保持手感。
- 每周至少手动完成一次核心任务
- 定期盲测对比：自己独立判断，再与 AI 产出对比
- 让未参与循环设计的人审查产出

## Loop + Harness：一体两面

三个陷阱的应对方式有一个共同模式：对策不在循环逻辑内部，而在 harness（运行时基础设施）层。

用 ETCLOVG 框架（CMU/Yale/JHU 等联合发布的《Agent Harness Engineering: A Survey》提出的七层分类法）理解，Loop 只影响 C 和 L 两层，而 Harness 覆盖全部七层：

Loop Engineering 主要影响两层：
- C (Context) — 每轮循环给 AI 看什么信息
- L (Lifecycle) — 循环的启动、暂停、终止逻辑

Harness Engineering 覆盖全部七层：
- E (Entrypoint) — 用户如何触发循环
- T (Tooling) — 循环中可调用的工具集
- C (Context) — 上下文组装和压缩
- L (Lifecycle) — 循环状态管理
- O (Observability) — 循环运行的可见性
- V (Verification) — 评估和验证层
- G (Governance) — 权限和审计

结论：没有 harness 的 loop 就像没有刹车的跑车——跑得越快，越危险。

## 六、一个思考题

如果你现在手头有个任务需要 AI 帮忙，问自己三个问题：
1. 终止条件是什么？ 如果答不上来，不要开始循环。
2. 最坏情况下会发生什么？ 如果不可接受，加检查点。
3. 产出结果我能验证吗？ 如果不能，这个任务不适合自动化循环。

答完这三个问题，你就已经在做 Loop Engineering 了。

个人的小思考：现在的Agent进化，有点像编译器的"自举"，冷启动之后，开始向着自进化演进，想想还真有点令人恐惧。

## 结语

Karpathy 用 AutoResearch 证明了一件事：AI 工程的未来可以不是写更好的提示词，也可以是设计更好的循环系统。

循环的核心是简洁：固定步骤、单一判断、明确终止。复杂度不在循环里，在支撑循环运行的基础设施里。

从 program.md 到 queryLoop()，从 5 分钟 ML 实验到通用编码 Agent，设计模式惊人一致。这不是巧合——这是循环工程的第一性原理：让循环笨而可靠，让基础设施聪明而强壮。

## 参考来源

- Andrej Karpathy, "AutoResearch"（2026-03）
- Addy Osmani, "Loop Engineering — Stop Writing Prompts, Start Designing Loops"（2026-06）
- Jiacheng Liu et al., "Dive into Claude Code: The Design Space of Today's and Future AI Agent Systems"（2026）
- CMU/Yale/JHU/Virginia Tech/Amazon, "Agent Harness Engineering: A Survey"（2026-05, OpenReview）
- Shen & Tamkin, AI-assisted coding comprehension study（2026）

→ [[entities/loop-engineering-feedback-control-system|合并到 Loop Engineering 实体（第 5 来源）]]
- He et al., Causal analysis of AI coding tools on 807 repositories（2025）
