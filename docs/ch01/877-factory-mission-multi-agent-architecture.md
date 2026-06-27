# factory mission multi agent architecture

## Ch01.877 factory mission multi agent architecture

> 📊 Level ⭐⭐⭐ | 12.8KB | `entities/factory-mission-multi-agent-architecture.md`

- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/factory-mission-multi-agent-architecture.md)

# Factory Mission — Multi-Agent 架构方法论
## 核心定位
Factory（15亿美元估值）的 **Mission** 是一套多 agent 编排系统，背后回答了一个核心问题：**当你需要 agent 团队完成比单个 agent 难上一两个数量级的任务时，应该怎么组织**。

## 人物背景
**Luke Alvoeiro**：Block 开源 coding agent **Goose**（43.9k★，捐给 AI Agentic Foundation）→ Factory CTO，负责 Droid 的核心 agent harness。

## 架构全景图
**Mission 采用三角架构 + 四种策略（无 direct communication）：**
```
Orchestrator（规划）
  ↕ 委派 + 广播
Workers（实现）←→ Validators（验证）
```

### Orchestrator（规划者）
- 作用：共鸣板，提战略问题，梳理模糊需求
- 输出：**执行计划** = feature 清单 + 里程碑 + **Validation Contract**

### Workers（实现者）
- 每个 feature 配一个 worker
- 完全干净的上下文（零包袱、满格注意力）
- 通过 **Git commit** 交接，下一个 worker 接手干净代码库

### Validators（验证者）
- **scrutiny validator**：lint + 类型检查 + 测试 + 独立 code review agent
- **user testing validator**：端到端行为验证（computer use 跑真实应用，填表单/点按钮/看页面渲染）
- 两个 validator 都**没看过代码**，验证从设计上就是对抗性的

## 五大 Multi-Agent 策略
| 策略 | 描述 | Mission |
|------|------|---------|
| Delegation | 父 agent 派生子 agent 取返回值 | ✅ |
| Creator-Verifier | 一个建、一个查，关注点分离 | ✅ |
| Direct Communication | agent 互发私信，无中央协调者 | ❌ |
| Negotiation | 围绕共享资源（API/代码块）沟通 | ✅ |
| Broadcast | 一对多状态更新/共享约束下发 | ✅ |

## 核心概念：Validation Contract
**问题**：测试是按实现出来的代码反向捏的，不是按代码本该实现什么写的。
**解法**：在**规划阶段**（代码写下去之前）就把正确性定义清楚，每个 feature 分配必须满足的断言，这是**独立于实现的锚点**。
**配套：结构化 Handoff**
worker 做完 feature 必须填写：完成了什么 / 未完成项 / 执行命令及退出码 / 发现的问题 / SOP 遵守情况。
**关键**：错误在里程碑边界被捕获，不依赖 agent "记得" 发生什么，靠强制写下来。

## 串行 > 并行（反直觉）
| 问题 | 解法 |
|------|------|
| agent 互相踩改动、重复做事、架构决定冲突 | feature 层面**串行**，同一时刻只有一个 worker 在跑 |
| 协调 overhead 吃掉速度收益 | 允许并行的：feature 内部只读操作 + validator 内部只读操作 |
**结果**：纸面更慢，但错误率大幅下降，长任务里正确性不断复利。

## Droid Whispering（模型选择哲学）
> "你被某一家模型锁定，这个家族最弱的能力就是你系统的天花板。"
| 角色 | 需求 | 推荐模型类型 |
|------|------|------------|
| Orchestrator | 慢速审慎推理 | 慢模型 |
| Worker | 快速代码流畅度 + 创造力 | 快模型 |
| Validator | 精确指令遵循 | 最精确模型 |
**关键**：验证用**不同模型厂商**，避免同向偏见；Validation Contract 可以反向补偿模型。

## 编排逻辑声明式
- 编排逻辑 ≈ **700 行文本**（prompt + skill）
- 改四句话就能大幅改变执行策略
- 确定性代码层极薄（只做 bookkeeping）
- **mission = 提供纪律，模型 = 提供智能**

## 真实数字（Slack 克隆案例）
| 指标 | 数值 |
|------|------|
| 时间/Token 消耗 | 60% 在 implementation |
| 验证通过率 | 几乎每个 milestone 都要追加 follow-up |
| 代码库构成 | 50% 是测试代码，覆盖率 90% |
| 耗时分布 | 大部分时间在 user testing validator 等待交互，不在生成 token |
| 人力效率 | 5 人团队：10 条工作流 → **30 条** |
| 质量结果 | 代码库比开工时更干净（测试 + skill 文件 + 结构性产物留下）|

## 核心方法论
> **验证独立于实现、交接强制结构化** — 适用于任何想让 agent 持续运行多日的产品，不只限于 coding。

## 相关框架对比
- **[DeerFlow vs Hermes vs OpenClaw](https://github.com/QianJinGuo/wiki/blob/main/entities/deerflow-hermes-openclaw-comparison.md)** — 都是 multi-agent 编排框架，与 Mission 的三角架构有相通之处

## 深度分析
### 1. 核心矛盾：人类注意力 vs 模型并行能力
Factory 诊断的问题本质不是"模型不够强"，而是**人类注意力的带宽天花板**。当前前沿模型已能并行处理 50 个任务，但最强工程师同时只能盯住 3-4 个 thread。这是一个能力对称性的根本转变——Factory 的目标函数因此从"让单个 agent 更强"切换到"让人类能杠杆化模型并行能力"。这一判断把 Mission 的所有架构选择都锚定在**人机协作模式重构**上，而不是单纯的技术选型。

### 2. 三角架构的深层逻辑：状态外化 > 记忆依赖
Mission 的 orchestrator / worker / validator 三角结构背后有一个不那么显而易见的工程判断：**长周期任务中，agent 的记忆不可靠，外化状态才可靠**。Alvoeiro 的原话是"The system self-heals. Not by hoping that agents remember what happened but by forcing them to write it down and then actually address issues." 这解释了为什么 worker 之间通过 Git commit 交接，而不是靠对话历史链传递上下文。16 天连续运行的能力本质上来自于此——任何时候 mission 的状态都可以被人完整理解，不依赖任何 agent 的"记得"。

### 3. Validation Contract 的时序革命
传统开发流程是"先写代码、再写测试"，测试本质上是实现的追认。Mission 把这个顺序彻底颠倒：**在规划阶段由 orchestrator 产出 validation contract，之后所有实现都必须满足这份契约**。这不只是测试前置，而是把"正确性定义"从实现者手中剥离，交给从未看过实现的 validator。这种设计人为切断了实现细节回流到验收标准的路径，是架构层对"确认偏见"的系统性堵截。

### 4. 串行 > 并行的复利效应
Factory 提供了精确的复利计算：单 agent run 错误率 0.1% 时，100 步串行累计成功率 90%；如果并行让每步错误率上升到 1%，100 步累计成功率暴跌至 36%。这个数字解释了为什么"写串行、读并行"不是在性能上的妥协，而是一个数学上必然的正确性取舍。长周期任务的正确性是复利——能保住每一步的 correctness 比跑多并发更重要。

### 5. Model-Agnostic 作为长期赌注
Factory 押注模型会持续 speciate（分化），而不是收敛到单一 super-model。这个判断如果成立，model-agnostic 架构的 ROI 会随时间复利增长；如果不成立，它会变成历史展品。当前推荐角色-模型映射（Orchestrator 用 Opus、Worker 用 Sonnet/Opus、Validator 用 GPT-5.3-Codex）刻意选择不同厂商，就是为了避开同向偏见带来的 false negative。Validation Contract 可以反向补偿单个模型的能力缺陷，这让"最弱环节"的天花板约束可以被部分对冲。

### 6. 编排逻辑声明式的战略价值
99% 的 orchestration 逻辑（约 700 行文本）写在 prompt 和 skill 里，只有薄薄一层 Python 做硬约束（handoff 未解决前不准前进等）。这个设计让 Mission 的策略调整成为可对话对象——当用户说"Drop the email notification feature and add Slack integration"，orchestrator 不需要触发状态机重迁移，只需要按更新后的 prompt 重新生成一份 features.json。它同时意味着：当新模型发布时，往往只需要改几句 prompt，不需要重写状态机。

## 实践启示
### 针对 Agent 系统构建者
1. **先写"不许做什么"，再写"能做什么"**：在写第一行 agent 代码前，用一页纸定义 orchestrator / worker / validator 各自的边界。尤其是"不许做什么"——很多多 agent 系统的 lead agent 最后变成什么都干一点的会议主席，同时丧失了对全局的把控力。
2. **Validation Contract 必须前置**：在 planning 阶段由 orchestrator 产出行为断言列表，覆盖每个 feature；生成 contract 的 agent 和验证 contract 的 agent 必须不同。这比"先写代码再补测试"能多抓 34% 的缺陷（Slack 克隆案例中 fix features 占 34.4%）。
3. **结构化 handoff 强制五字段**：每个 worker 完成时必须填写：completed / not_completed / commands_executed（含 exit code）/ issues_found / procedure_compliance。下一个 worker 读这份文档，不读上一个 worker 的对话历史。
4. **写串行、读并行**：文件写入、commit、validator 评估严格串行；codebase search、文档调研、code review 可以并行。不要试图用并行掩盖串行架构的不足——协调开销会吃掉速度收益。
5. **验证用不同模型厂商**：哪怕只是把 validator 换成另一家提供商的中等规模模型，就能避开同家族训练数据 bias。这是结构性对抗设计，不是过度工程。

### 针对工程团队管理者
1. **把 agent 团队当真正的团队来管**：Mission Control 的交互原语是"告诉 orchestrator 重新评估 + 重排优先级 + 改 scope"，而不是"我来手动写代码"。工程师的角色从执行者变成架构和产品决策者——这需要对应的管理范式转变。
2. **接受验证"从不一次过"**：Slack 克隆案例中，每个 milestone 都要 2-4 轮验证才能通过，验证一轮从未通过。这不是系统缺陷，而是 validator 在做该做的事。管理上需要建立的预期是：长周期任务里，迭代修复是主路径，不是异常路径。
3. **token burn rate 不是瓶颈**：Mission 的 token 消耗（45K tokens/min）和普通 session 接近，但它能把这个速率持续几小时甚至几天。成本可控的原因是 96% 的 cache 命中——共享状态文件 + prefix cache 让成本结构完全不同于会话式使用。

### 针对 AI Infra / 工具开发者
1. **如果搭多 agent 框架，状态必须外化**：任何时刻 mission 的状态都应该可以被人类完整理解。Agent Teams 的 mailbox 在 demo 里很优雅，但当某个 teammate 在 1 小时前做了一个决定，2 小时后没有人能轻易回溯它对其它 teammate 的影响。Mission Control 用 PMO 般的笨重换的就是 legibility。
2. **避免 Direct Communication**：peer-to-peer 通信在短链路上很优雅，但缺乏中心权威会让状态在多个对话里漂移。长周期任务里，sender 的速度优势不值得为之付出 state fragmentation 的代价。
3. **为 model composition 而设计，不是为单一模型而设计**：那些发展出"不同模型在多 agent pressure test 下如何相互配合"的直觉的团队，将会在下一代创新中胜出。这不是技术问题，是工程文化问题。
---
*Last updated: 2026-05-08*
*评审：Value 8 × Confidence 8 = 64 | ★★★★ | STRONG PASS*

## 相关实体
- [Multi-Agent 架构在零售供应链运营中的实践：贯穿数据、洞察与行动 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki/blob/main/entities/multi-agent-architecture-retail-practice.md)
- [基于多智能体架构的深度思考交易系统](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统.md)
- [Agent 上下文管理工程模式收敛 — 多框架代码级横向对比](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-context-management-architecture-patterns.md)
- [OpenClaw 多智能体团队搭建实战经验](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-multi-agent-team-practice.md)
- [你不知道的 Agent 原理架构与工程实践](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-principle-architecture-engineering-practice.md)
- [Agent Harness 架构](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-harness-architecture.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)

---

