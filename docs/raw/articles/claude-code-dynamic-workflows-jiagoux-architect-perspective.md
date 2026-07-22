---
title: "Claude Code Dynamic Workflows 第 7 译本（架构师 JiaGouX 视角：任务级 Harness 统一框架）"
source_url: "https://mp.weixin.qq.com/s/Z8aEk8QZfvd3juHTH0_vVg"
publish_date: 2026-06-04
tags: [wechat, article, claude-code, dynamic-workflows, task-level-harness, jiagoux, architect, adversarial-review, bun-zig-rust, ai-native-org, verification, subagent]
review_value: 8
review_confidence: 8
review_recommendation: strong
sha256: pending
---

# Claude Code Dynamic Workflows 第 7 译本（架构师 JiaGouX 视角：任务级 Harness 统一框架）
> 整理：Hermes Agent
> 原文：https://mp.weixin.qq.com/s/Z8aEk8QZfvd3juHTH0_vVg
> 来源：架构师（JiaGouX）· 公众号"我们都是架构师"
> 系列：同一 Anthropic "A harness for every task"（Dynamic Workflows）的**第 7 个中文译本**

## 一句话定位
**架构师 JiaGouX 视角** —— 把 Dynamic Workflows 放在 **任务级 Harness 统一框架**中重新定位：它不是孤立的新功能，而是 **Claude Code 这条线上的自然下一步**（当 Subagents / Skills / Agent Teams / Goals / Hooks / Worktrees 都补齐后，系统需要"按任务临时编排流程"的能力）。**文章不只讲功能，更讲落地策略**：3 类失败模式 + 7 大实战模式 + 团队试跑流程 + 7 个"我会问的问题"清单。

> "**它让 Agent 不只是执行一段流程，也可以为当前任务临时写出一段流程，再交给 Claude Code 的运行环境去执行。**"

> "**Agent 的下一步，可能会从'能生成什么'，慢慢转向'能不能组织一段可验证、可审查、可恢复的工作过程'。**"

## 1. 问题的层次升级：从"多开几个 Agent"到"任务级 Harness"

> "**当 Agent 要跑长期任务、复杂任务、反复验证的任务时，它能不能为这个任务临时生成一套自己的 Harness？**"

**核心洞察**：问题往往出在**并行之后**——计划在哪里，状态在哪里，证据在哪里，谁负责反驳，什么时候停，哪些事能做，花出去的 token 值不值。

> "**如果这些东西还散在聊天记录里，Agent 越勤快，系统越容易失控。**"

> "**Dynamic Workflows 这次露出来的新信号，是 Claude Code 开始把这些任务级约束写进一段可执行流程里。**"

## 2. 5 段结论（架构师视角）

1. **"怎么跑" → "临时 Harness"**：上次主要看 Claude 写脚本，subagents 分头干活。这次更进一步：**脚本可以变成复杂任务的临时 Harness**，把拆分、验证、停止和证据回收都收进同一套流程里
2. **"停不准"是核心问题**：任务一长，Agent 可能写得很快，但停不准——**提前收工 / 偏爱自己的方案 / 跑久了把目标带偏**
3. **Workflow 是"任务脚本"**：把阶段、分支、循环、验证、预算和权限从聊天记录里拿出来。**脚本不保证结果正确，但至少让任务怎么跑这件事变得可看、可审、可复盘**
4. **与其他能力的关系**：Agent Teams 讲协作 / Cowork 讲停下来 / Skills 讲经验复用 / Harness 讲状态和失败闭环。**Dynamic Workflows 像是把这些能力按一次任务临时装配起来**
5. **落地策略**：**真要落地，从只读的小任务试**——扫配置 / 查风险 / 核技术稿 / 整理 flags。先看它能不能留下证据，再谈自动改代码

## 3. 3 类失败模式深度解读

### Agentic laziness（智能体懒惰）
> "**名字有点学术，实际问题很熟：任务还没完，Agent 已经给你一个'差不多完成'的总结。它做了容易做的 60%，剩下 40% 变成后续建议。**"

**典型场景**：
- 让 Agent 清理代码库权限问题，它扫了几个明显文件，修了几个简单 case，然后告诉你"整体已经加固"
- 可你真去查调用链，会发现**边角路径没碰 / 测试没跑全 / 关键边界也没验证**

> "**这不是单纯的能力问题，更像流程没有把'完成'的证据定义清楚。**"^[raw/articles/claude-code-dynamic-workflows-jiagoux-architect-perspective.md]

### Self-preferential bias（自我偏好偏差）
> "**Agent 更容易相信自己刚做出来的东西。它写了方案，再让它自己 review，它常常会天然宽容一点。问题不在于它故意糊弄，而在于同一个上下文里，前面的假设会影响后面的判断。**"

**解法**：**对抗式 review**——
- **一个 Agent 做实现**
- **另一个 Agent 专门找错**
- **第三个 Agent 只看测试和证据**

> "**这样做看上去绕了一点，但在复杂任务里不算多余。因为同一个'脑子'连着写、连着审、连着总结，很容易把自己的乐观判断包装成事实。**"^[raw/articles/claude-code-dynamic-workflows-jiagoux-architect-perspective.md]

### Goal drift（目标漂移）
> "**长任务跑着跑着，目标变味了。尤其是上下文压缩以后，很多细节被压成一句摘要。下一轮 Agent 接手时，只看到一个浓缩后的方向，很可能沿着错误理解继续往前走。**"

> "**这个失败更隐蔽**。短任务里，目标漂移通常还能肉眼看出来。长任务里，它会慢慢发生：先是验收标准变松，再是风险边界变模糊，最后输出一份看起来完整、但已经偏离原始目标的结果。"

> "**长任务靠更长的一段聊天记录不太够。它需要一套任务壳，把目标、阶段、验证、停止和恢复都管起来。**"

## 4. 任务级 Harness：把什么管起来

### 普通 Claude Code 会话 vs Workflow
**普通会话**：Claude 自己持有计划，读上下文，决定下一步，调用工具，拿结果，再决定下一步。**适合很多日常任务**。

**问题**：任务一大，**主上下文会变成协调中心，所有中间结果、判断、错误和修正都挤在一起**。

**Workflow 的变化**：**把计划放进脚本**。
- 按官方文档，Dynamic Workflow 是 **Claude 写出来的一段 JavaScript script，由 Claude Code 的运行环境执行**
- 脚本负责**阶段、分支、循环、并发和结果汇总**
- 只有需要具体执行时，才通过特殊函数拉起 subagent

### 7 个"任务级 Harness 把什么管起来"

> "**只盯着'能并发 1000 个 Agent'，很容易把它用成昂贵的自动化噪声。换成任务级 Harness 这个角度，问题会变得更具体：**"

1. **这个任务的材料稳定吗**
2. **工作单元能不能拆开**
3. **每个单元的证据是什么**
4. **哪些动作只读，哪些动作会改状态**
5. **哪些动作要先问人**
6. **超过多少 token 或多少轮就停**
7. **最后交给人的是什么证据包**

> "**这些问题不花哨，但很接近生产系统。**"^[raw/articles/claude-code-dynamic-workflows-jiagoux-architect-perspective.md]

## 5. 6 大能力统一框架（架构师视角）

> "**我更不会把它当成一个孤立的新功能看。它更像是 Claude Code 这条线上的自然下一步**"

| 能力 | 主要解决的问题 | 架构师理解 |
|---|---|---|
| **Subagents** | 隔离上下文和局部任务 | 派一个人去看一块材料 |
| **Agent Teams** | 多块工作协作 | 几个人围绕同一个任务协同 |
| **Cowork** | 停止条件和交互节奏 | 什么时候继续，什么时候交回人 |
| **Skills** | 过程资产复用 | 把做对的方法沉淀下来 |
| **Harness** | 状态、权限、验证、记录 | 管住任务怎么跑、怎么查 |
| **Dynamic Workflows** | 任务级编排 | **为当前任务临时写一套可执行流程** |

> "**当 Subagents、Skills、Agent Teams、Goals、Hooks、Worktrees 都慢慢补齐以后，系统需要一种方式，把这些能力按任务临时编排起来。这就是任务级 Harness。**"

## 6. 6 大实战模式（更接地气的工程翻译）

官方列的模式（classify-and-act / fan-out-and-synthesize / adversarial verification / generate-and-filter / tournament / loop until done）—— **名字先不用太纠结。放到工程里，可以先换成几种更熟悉的工作结构**。

### 模式 1：先分类，再分派
- **先判断任务类型**，再把不同任务交给不同 subagent
- 客服队列 / 简历筛选 / 代码缺陷 triage
- **要留一个隔离区**：分类拿不准的 case，不要硬塞进某一类
- 官方提到支持队列分诊里可以把异常 case 放进 **quarantine** ^[raw/articles/claude-code-dynamic-workflows-jiagoux-architect-perspective.md]

### 模式 2：并行搜集，再统一合成
- 多个 Agent 各看一部分材料，最后统一合成报告
- 深度研究 / 代码库盘点 / 架构调研
- **最怕的是"合成器"把没有证据的结论写成定论**
- **每个分支最好带来源、置信度和未确认点**

### 模式 3：一定要加一个反方
- **一个 Agent 产出方案，另一个 Agent 专门找漏洞，第三个 Agent 只看证据能不能支撑结论**
- 这个结构会多花 token，但**能压住"自己审自己"的偏差**

### 模式 4：先生成一批候选，再过滤
- 先生成很多候选，再按规则筛掉不合格结果
- API 迁移方案 / 测试用例 / 风险清单 / 命名方案
- **过滤器要有清楚标准，不能只是再问一遍"你觉得哪个更好"**

### 模式 5：循环（最容易滥用）
- 实现、测试、修复，再实现、再测试、再修复
- **停止条件要先写清楚**：最多跑几轮 / 失败时保留什么日志 / 哪些失败要交回人 / 不能让它无限自我消耗

> "**这些模式名字不一样，最后都会落到同一件事上：相比答案本身，我更关心的是：Agent 有没有留下一条能被检查的路径。**"

> "**这条路径里要有分工、有证据、有反驳、有停止、有成本边界。**"^[raw/articles/claude-code-dynamic-workflows-jiagoux-architect-perspective.md]

## 7. Bun 案例的边界判断

**官方早前提到过 75 万行 Rust、原测试 99.8% 通过、11 天从首个 commit 到 merge**。这个案例说明 Dynamic Workflows 能把大规模迁移推到一个很远的位置。

**但我不太建议把它读成"AI 已经可以放心重写所有遗留系统"**。

> "**Thariq 在后续讨论里补过一个边界：模型还没有完全到那一步，Bun 适合，是因为它非常可验证，测试覆盖也很好。**"

> "**这句比案例数字更能说明边界。**"

**对迁移任务来说，代码量当然重要，后面这些条件往往更难**：
- 行为能不能被测试约束
- 编译错误能不能快速暴露
- 性能回退能不能被 benchmark 看见
- 每个模块的等价性有没有证据
- 最后合并前有没有人类 review

> "**Bun 更像是在提醒我们：只有足够可验证的旧系统，才适合被 Agent 切开、迁移、反复修复，再由人做最终判断。**"

> "**如果一个遗留系统没有测试、没有文档、没有可运行环境、没有业务 owner，只是堆了很多年代码，那它未必更适合 Agent。相反，它更可能把 Agent 拉进一堆没有反馈的猜测里。**"

> "**我会把 Bun 当成一个方向，不当成普遍承诺。**"^[raw/articles/claude-code-dynamic-workflows-jiagoux-architect-perspective.md]

## 8. Cat Wu 整理 A/B test flags 案例（更接地气）

> "**这个场景没有 Bun 那么戏剧化，但我反而觉得它更适合团队第一批尝试。**"

**为什么适合**：
- 每个 flag 都能单独检查
- 结果可以并行收集
- 判断标准相对明确
- 最终动作可以先交给人确认
- 错了也不至于直接改坏生产系统

> "**这类任务说明，Dynamic Workflows 不只属于代码迁移。它更适合'很多独立小单元 + 每个都要验证 + 最后统一合成'的工作。**"

## 9. 团队里的新瓶颈（Claude Code 内部观察）

> "**在 Claude Code 团队里，写代码、写测试、重构，已经越来越少成为唯一瓶颈。新的瓶颈开始转向验证、代码审查和安全。**"

> "**模型越来越会写以后，团队紧张的地方会转向验证、审查和守门。**"

> "**这也解释了为什么 workflow 里会有那么多看起来'绕'的模式**：一个 Agent 写 / 另一个 Agent 审 / 多个 Agent 独立找证据 / 高风险发现先隔离 / 长任务按阶段推进 / 花费和权限都要提前写进任务里。"

> "**这不是为了把流程搞复杂。** 如果团队还处在'AI 帮我补一段代码'的阶段，这些东西确实显得重。但一旦 Agent 进入真实仓库、真实客户、真实数据、真实发布链路，验证和安全边界就会变成日常问题。"^[raw/articles/claude-code-dynamic-workflows-jiagoux-architect-perspective.md]

### 7 个"日常土问题"（Agent 系统设计自检）

> "**我现在看 AI 编程工具，第一反应会先落到几个更土的问题上：**"

1. **它知道自己什么时候没完成吗**
2. **它能把证据留给我吗**
3. **它会不会偏爱自己的结论**
4. **它能不能把失败写回下一次流程**
5. **它知道哪些事不能做、最多花多少吗**
6. **人什么时候介入最合适**

## 10. 落地策略：首轮只读试跑

**如果今天就想试 Dynamic Workflows，我不会从自动迁移、自动重构、自动修线上问题开始**。**我会先选一个只读任务**。

**推荐的首轮只读任务**：
- 全仓库扫描某类风险 API
- 盘点某个模块的未测试路径
- 对一份技术方案做多角度 review
- 把一组竞品文章拆成来源、事实、观点、可引用证据
- 整理数百个 feature flags，找出长期 0% 或 100% rollout 的陈旧配置
- 对一批历史 issue 做分类、去重和根因聚类

**这类任务有几个好处**：
- 材料相对稳定
- 副作用低
- 证据容易复查
- 失败也不至于伤到生产系统^[raw/articles/claude-code-dynamic-workflows-jiagoux-architect-perspective.md]

### 7 个"要写清楚的事"清单

| 维度 | 我会问的问题 |
|---|---|
| **材料** | 要读哪些目录、链接、issue、日志 |
| **结果** | 最后给报告、补丁、PR，还是分类表 |
| **证据** | 每个结论需要哪些引用、命令、测试或截图 |
| **动作** | 只读，还是允许改文件；哪些命令不能碰 |
| **模型** | 哪些阶段用强模型，哪些阶段用便宜模型 |
| **停止** | 最多多少轮、多少 token、哪些失败直接交回人 |
| **人的介入** | 人在什么时候 review，怎么判断能不能继续 |

### 首轮只读试跑实例（billing 模块风险盘点）

```
目标：盘点 billing 模块里可能缺测试的路径。
范围：只读 src/billing、tests/billing，不访问 .env，不改文件。
拆分：按目录分给 4 个 subagents，每个只看自己负责的目录。
每个分支输出：文件路径、风险描述、证据、未确认点。
验证：再拉 1 个 reviewer，只检查证据是否站得住。
停止：最多 1 轮，不做修复，不自动开 PR。
交付：一张风险表，按高/中/低优先级排序。
```

> "**这个例子看起来不酷，但很适合试水。它的好处是失败成本低：跑坏了也只是多出一份报告；跑好了，团队能看到它有没有把证据留下来。**"^[raw/articles/claude-code-dynamic-workflows-jiagoux-architect-perspective.md]

### 后续逐步放开的边界

如果第一轮只读任务跑得还可以，**再逐步放到低风险写入任务**：
- 只允许改文档
- 只允许开 PR
- 不允许 push
- 不允许访问 .env
- 所有 shell 都走 allowlist
- **能 dry-run 的先 dry-run，能生成报告的先报告，能人工合并的不要自动合并**

> "**这件事说到底很朴素：Agent 能往前推，边界就要早一点写清楚。目标模糊、能做什么没说清、验收也没说清，在强 Agent 手里反而更危险。**"

## 11. 成本边界（与兴奋感的对抗）

> "**Sid、Jarred、Boris 和 ClaudeDevs 都提到了成本边界。这点很现实，也容易被兴奋感盖过去。**"

> "**Workflow 有效的一部分原因，恰恰来自拆开的上下文、并行的 agents、独立的审查者。它不是凭空更可靠，很多时候是在用更多计算换更好的隔离、覆盖和验证。**"

> "**所以我不会只问'能不能跑'，还会问'这件事值不值得跑成 workflow'。**"

> "**我会把 token 上限放在开跑前就想清楚，而不是等账单出来再复盘。**"^[raw/articles/claude-code-dynamic-workflows-jiagoux-architect-perspective.md]

**token 预算需要提前想清楚的 7 件事**：
1. 哪些阶段用强模型
2. 哪些阶段用便宜模型
3. 哪些分支只读不写
4. 哪些验证只抽样
5. 哪些任务最多跑一轮
6. 哪些任务可以配合 /loop 长跑
7. 哪些任务超过预算直接交回人

> "**这也是为什么我不建议把 /effort ultracode 当成默认日常模式。它适合大任务、硬任务、验证成本高的任务。日常小改动用它，通常只是把一件简单事做贵。**"

## 12. 核心金句

- "**当 Agent 要跑长期任务、复杂任务、反复验证的任务时，它能不能为这个任务临时生成一套自己的 Harness？**"
- "**如果这些东西还散在聊天记录里，Agent 越勤快，系统越容易失控。**"
- "**这不是单纯的能力问题，更像流程没有把'完成'的证据定义清楚。**"
- "**同一个'脑子'连着写、连着审、连着总结，很容易把自己的乐观判断包装成事实。**"
- "**长任务靠更长的一段聊天记录不太够。它需要一套任务壳，把目标、阶段、验证、停止和恢复都管起来。**"
- "**它让 Agent 不只是执行一段流程，也可以为当前任务临时写出一段流程，再交给 Claude Code 的运行环境去执行。**"
- "**当 Subagents、Skills、Agent Teams、Goals、Hooks、Worktrees 都慢慢补齐以后，系统需要一种方式，把这些能力按任务临时编排起来。这就是任务级 Harness。**"
- "**相比答案本身，我更关心的是：Agent 有没有留下一条能被检查的路径。**"
- "**Thariq 在后续讨论里补过一个边界：模型还没有完全到那一步，Bun 适合，是因为它非常可验证，测试覆盖也很好。**"
- "**Bun 更像是在提醒我们：只有足够可验证的旧系统，才适合被 Agent 切开、迁移、反复修复，再由人做最终判断。**"
- "**模型越来越会写以后，团队紧张的地方会转向验证、审查和守门。**"
- "**Agent 能往前推，边界就要早一点写清楚。目标模糊、能做什么没说清、验收也没说清，在强 Agent 手里反而更危险。**"
- "**Agent 的下一步，可能会从'能生成什么'，慢慢转向'能不能组织一段可验证、可审查、可恢复的工作过程'。**"
- "**最后留下来的，不只是这一次运行结果，还有一类新的过程资产：可读、可审、可复用、可由 Agent 执行的任务级 Harness。**"

## 13. 整合视角：7 个译本的差异

**JiaGouX 译本独特价值（vs 前 6 译本）**：
1. **"任务级 Harness" 统一框架** —— 把 Subagents / Agent Teams / Cowork / Skills / Harness / Dynamic Workflows 视为**同一个演进路径上的能力层**
2. **"任务级 Harness 把什么管起来" 7 问** —— 材料/拆分/证据/动作/权限/token/交付物 —— 是把抽象问题具象化的最实用清单
3. **Bun 案例的"边界"判断** —— 不当成普遍承诺，**只对"足够可验证"的旧系统适用**
4. **Cat Wu 整理 A/B test flags 案例** —— 更接地气的首轮试跑任务
5. **团队新瓶颈转移** —— **写代码不再是瓶颈，验证/审查/安全是新瓶颈**（Anthropic 内部观察）
6. **"日常土问题" 7 问** —— Agent 系统设计自检清单
7. **首轮只读试跑流程 + 7 件要写清楚的事** —— 团队落地策略（材料/结果/证据/动作/模型/停止/人的介入）
8. **token 预算 7 件事** —— 成本边界具体化

**最不可替代新增** = **"任务级 Harness" 统一框架** + **团队新瓶颈转移（写代码→验证/审查/安全）** —— 这两点是前 6 译本完全没出现的元层洞察

## 14. 与已有 wiki 实体的关系

### vs [[entities/claude-code-dynamic-workflows-multi-agent-orchestration|同主题已有实体]]
- 已有实体 = 6 source（302 lines）+ 5 个译本内容合并
- 本译本 = **7th source** + 任务级 Harness 统一框架 + 团队落地策略
- 共同点：6 大模式 / 3 失败模式 / 8 Prompt / 10 场景

### vs [[entities/agent-harness-architecture|Agent Harness 架构]]
- 7 层 harness 模型 = 抽象框架
- JiaGouX = "**任务级 Harness 统一框架**"（把 6 大能力视为同一演进路径）—— 是一份"操作性的 Harness 演进地图"

### vs [[entities/agent-oriented-infra-intent-driven-code-sedimentation|晓斌 Agent-Oriented Infra]]
- 晓斌 = 哲学框架（People-Oriented → Agent-Oriented + 4 层设计）
- JiaGouX = **具体落地"任务级 Harness 把什么管起来"**（7 问清单）

### vs [[entities/mac-multi-agent-coding-skills-hooks-harness|MAC Skills + Hooks]]
- MAC = 工程师个人 Harness 框架（Skills 概率层 + Hooks 确定性层）
- JiaGouX = **任务级 Harness 统一框架**（Subagents / Agent Teams / Cowork / Skills / Harness / Dynamic Workflows）

## 15. 启示

1. **任务级 Harness 是统一框架** —— 不把 Dynamic Workflows 看成孤立新功能，而是 Claude Code 演进的"按任务临时编排流程"层
2. **7 个"任务级 Harness 把什么管起来"** —— 把抽象问题具象化：材料/拆分/证据/动作/权限/token/交付物
3. **团队新瓶颈转移** —— **写代码不再是瓶颈，验证/审查/安全是新瓶颈**（Anthropic 内部观察）
4. **首轮只读试跑** —— 不从大任务开始，先选材料稳定/副作用低/证据易复查/失败不影响生产的只读任务
5. **7 个"要写清楚的事"清单** —— 材料/结果/证据/动作/模型/停止/人的介入
6. **Bun 案例不是普遍承诺** —— "只有足够可验证的旧系统才适合被 Agent 切开"
7. **token 预算前置** —— 不在账单出来才复盘，哪些阶段用强模型/便宜模型/只读/抽样要开跑前写清楚
8. **/effort ultracode 不做默认** —— 适合大任务/硬任务/验证成本高的任务，日常小改动用它"只是把一件简单事做贵"
9. **3 类失败模式都对**：60% 容易做的做完就宣布完成 / 同上下文偏见 / 长任务目标漂移
10. **"可验证、可审查、可恢复、可复用"** 是 Agent 时代任务级 Harness 的四大特征

## 16. 局限 / 待验证

- 微信公众号转载，**未给出原始出处日期**
- **未提供 6 大能力统一框架的官方背书** —— 是 JiaGouX 自己的体系化总结
- "**6 个能力演进的次序**"（Subagents → Skills → Agent Teams → Goals → Hooks → Worktrees → Dynamic Workflows）需要 Anthropic 官方确认
- "**写代码不再是唯一瓶颈**"是 Claude Code 团队的内部观察，需要第三方验证
- Cat Wu 的 A/B test flags 案例具体规模（数百 flags）、自动化效果未给出

## 参考链接
- [Anthropic Claude Blog: A harness for every task](https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code)
- [Anthropic Claude Blog: Introducing dynamic workflows](https://claude.com/blog/introducing-dynamic-workflows-in-claude-code)
- [Claude Code Docs: Dynamic Workflows](https://code.claude.com/docs/en/workflows)
- [Anthropic News: Claude Opus 4.8](https://www.anthropic.com/news/claude-opus-4-8)
- [Claude Blog: Running an AI-native engineering org](https://claude.com/blog/running-an-ai-native-engineering-org)
- [Cat Wu on X](https://x.com/_catwu/status/2060054180379689074)
- [Sid Bidasaria on X / Thread Reader](https://threadreaderapp.com/thread/2060047508806746142.html)

## 相关对照
- [[entities/claude-code-dynamic-workflows-multi-agent-orchestration|Claude Code Dynamic Workflows 多Agent编排]]（6 source 已有实体）
- [[entities/agent-harness-architecture|Agent Harness 架构]] —— 7 层模型
- [[entities/agent-oriented-infra-intent-driven-code-sedimentation|晓斌 Agent-Oriented Infra]] —— 哲学框架
- [[entities/mac-multi-agent-coding-skills-hooks-harness|MAC Skills + Hooks]] —— 个人 Harness 框架
- [[entities/gaode-ai-native-7x24-pipeline-self-healing|高德 AI-Native 生产线]] —— 企业级 R&D

→ [[raw/articles/claude-code-dynamic-workflows-jiagoux-architect-perspective|原文存档]]
