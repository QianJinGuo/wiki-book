---
title: "一个 Mission 跑 16 天、烧 7.78 亿 Token：Factory 公开了多 Agent 系统的构建哲学"
source_url: https://mp.weixin.qq.com/s/etiYTXpmVdYWgw6nA6vA7A
source_platform: wechat
author: "歪脖抠腚"
publish_date: 2026-05-14
created: 2026-05-19
type: raw
tags: [factory, multi-agent, missions, orchestrator, worker, validator, validation-contract, structured-handoff, droid-whispering, factory-droid]
review_value: ★★★★★
review_confidence: ★★★★☆
sha256: 86ebacfa4d4acf5ac668c1ea29e3ce3256c824b3d3a7c1683eedc2978ebdc27f
---
---
# 一个 Mission 跑 16 天、烧 7.78 亿 Token：Factory 公开了多 Agent 系统的构建哲学
> 整理自：Luke Alvoeiro @ AI Engineer Europe 2026-05  
> 原文：Multi-Agent Systems / Missions That Ship for Days  
> Factory 官方：https://factory.ai/news/missions-architecture
## TL;DR
Factory 核心 agent 基础设施负责人 Luke Alvoeiro 的核心论点：**人类的注意力带宽已经成为软件工程的瓶颈**——前沿模型已经能并行处理 50 个任务，但即便最强的工程师同时也只能盯住 3-4 个 thread。Missions 是 Factory 针对这一不对称设计的多 agent 系统，目标是把工程师从「写代码」彻底搬到「项目管理 50 个 droid」。
**值得抄作业的技术设计**：
- 多 agent 通信归纳为 5 种基本模式，只用 4 种（不用 direct communication）
- Orchestrator + Worker + Validator 三角色
- Validation contract 在写代码之前产出
- 串行写、并行读
- Droid whispering：不同角色用不同 LLM
**真实数据**：Slack 克隆 mission，16.5 小时，185 次 agent run（1 orchestrator + 63 worker + 27 validator），778.5M tokens（96% cache 命中），38.8k 行代码（52.5% 测试），89.25% 语句覆盖率；最长 mission 跑了连续 16 天。
## Luke Alvoeiro 的背景
Luke Alvoeiro 之前在 Block（前 Square）创建了开源 coding agent **Goose**（现已捐赠给 AI Agentic Foundation），之后加入 Factory 负责 core agent harness。他是少数同时操盘过「开源 agent」和「企业级长周期 agent」两套设计的人。
演讲开篇："The bottleneck is no longer intelligence. The best engineers can only focus on a couple things at a time. They have a backlog of 50 features but can only drive a few forward per day. Today's models are smart enough to build all 50. What if the human decides what to build, and the system figures out how?"
**目标函数**：优化人类注意力的杠杆率，而不是优化单个 agent 的智能。Missions 让单个工程师能并行推进的工作流从大约 10 条提升到 30 条。
## 多 Agent 通信的 5 种模式
| 模式 | 描述 | 典型用法 / 风险 |
|------|------|---------------|
| Delegation（委派） | 父 agent 派生子 agent 执行子任务并接收返回 | 最简单的形态，几乎所有 sub-agent 工具的底层 |
| Creator-Verifier（创建-验证） | 一个 agent 实现，另一个 agent 用 fresh context 检查 | 模仿人类 code review，能避开实现者的认知偏见 |
| Direct Communication（直接通信） | agent 之间点对点收发消息，没有中心协调者 | 状态容易在多个会话里碎片化，没有 single source of truth |
| Negotiation（协商） | 多个 agent 围绕共享资源（API、代码区域）做对抗或合作 | 适合存在 net positive-sum trade 的场景 |
| Broadcast（广播） | 一个 agent 把状态/约束发送给所有人 | 不够花哨但对长周期一致性必不可少 |
**Missions 只用了 4 种，故意不用 direct communication**。这个选择背后是工程判断：peer-to-peer 通信在短链路上很优雅，但一旦任务跨越数小时甚至数天，缺乏中心权威会让状态在多个对话里漂移。
## Orchestrator / Worker / Validator：三角色架构
**Orchestrator**：只负责规划、拆解、调度和验收。读用户目标，写 validation contract，拆成 features/milestones，启动 worker，根据 validator 报告生成 fix features 并再次下发。**故意不参与实现细节调查**——所有 deep investigation 都委派给 subagent，避免自己累积过细的上下文。
**Worker**：只负责单个 feature 的实现。拿到 feature spec + 共享状态文件 + handoff summary，用 **fresh context** 开始干活：先写测试，再实现，commit 到 git，最后填结构化 handoff。**不被允许做"这功能完成了"的判断**——这是 validator 的事。
**Validator**：只负责检查。分两个子角色：
- **Scrutiny Validator**：跑 lint、type-check、测试套件，并对每个 feature 派生 dedicated code review agent
- **User-Testing Validator**：启动应用，通过 computer-use 操作 UI、填表、检查渲染、走完 end-to-end 流程
两类 validator **都没看过实现代码也没看过 worker 的 trajectory**——它们读的是 validation contract 和已经 commit 到 git 的成品。
### Self-Evaluation Bias
Agent 的 trajectory 是 append-only 的，模型会从自己之前的推理里寻求连贯性。**让一个写完代码的 agent 评估自己写的代码，几乎一定会偏向"合理化"而不是"找问题"**。Factory 把这个观察叫做 Self-Evaluation Bias。
另一个失败模式：**Context Dilution**——当 agent 的任务边界变宽，每一步对当前目标真正有用的 context 占比下降，整段 trajectory 的信号比从 88% 掉到 38%。
## Validation Contract：把"正确"写在"实现"之前
Alvoeiro 的核心论点："Tests written after implementation don't catch bugs. They confirm decisions."
Missions 的做法是：在任何代码出现之前，orchestrator 在 planning 阶段产出 **validation contract**——一组可执行的行为断言。
样例：
```
### VAL-AUTH-001: Successful login
A user with valid credentials submits the login form and is redirected to the dashboard.
Tool: agent-browser
Evidence: screenshot, network(POST /api/auth/login -> 200)
```
每条 assertion 包含：行为描述、验证工具、要求保留的证据。然后 orchestrator 把 features 写出来，要求 features 的并集必须覆盖每一条 assertion。
**这个时间顺序之所以重要**：它人为切断了实现细节回流到验收标准的路径。如果先写 features 再写 contract，contract 会被已经规划好的实现塑造。
**实际效果**：Slack 克隆 mission 中，21 个 fix features 占 61 个实现 features 的 34.4%。一轮验证从未通过——说明 validator 在做该做的事。
## Structured Handoff：用 markdown 取代 agent 的"记忆"
Worker 完成后必须填一份结构化的 handoff markdown 文档：
- completed / not_completed
- commands_executed（含 exit code）
- issues_found
- procedure_compliance
下一个 worker 拿到的是这份文档，而不是上一个 worker 的对话历史。
**"The system self-heals. Not by hoping that agents remember what happened but by forcing them to write it down and then actually address issues."**
共享状态文件：
- `validation-contract.md` —— 行为断言清单（不可变）
- `features.json` —— feature 拆分的映射（mutable）
- `services.yaml` —— 系统服务和外部依赖
- `AGENTS.md` —— 工作流程和约束
- 持续累积的 knowledge base
**Token cache 命中率 96%**（778.5M tokens 总量中 744.9M 是 cache read）——因为这些共享文件在 mission 期间几乎只读，模型可以最大化复用 prefix cache。
## 串行写 + 并行读
**为什么不是大并行**：并行起多个 worker 在同一个 codebase 上工作，结果是互相覆盖修改、重复劳动、做出互相不一致的架构决策。协调成本吃掉了并行带来的速度收益。
Factory 的原则：**"writes serial, reads parallel"**：
- **必须串行**：feature 实现（文件写入和 commit）、validator 评估、handoff 记录
- **可以并行**：codebase 检索、API 文档调研、（写入前的）设计阶段研究
**数学**：如果每个 agent run 错误率 0.1%，100 步累计成功率 90%；如果并行让每步错误率涨到 1%，100 步累计成功率暴跌到 36%。长周期任务的正确性是复利。
## Droid Whispering：把不同 LLM 塞到对的座位上
Missions 是 **model-agnostic** 的，但含义是：单一 mission 内部不同角色由不同 LLM 担任。
| 角色 | 关注的能力 | 当前选用模型 |
|------|-----------|------------|
| Orchestration | 规划、协调、re-scoping | Claude Opus 4.6 |
| Feature implementation | 代码生成、重构、写测试 | Claude Sonnet 4.6 / Opus 4.6 |
| Validation & user testing | 回归检测、集成校验 | GPT-5.3-Codex |
| Research & exploration | 资料调研、API 探索、依赖分析 | Kimi K2.5 |
让验证和实现刻意走不同提供商的模型，不只是为了 marketing：同一个家族的模型可能共享同样的盲点，让 GPT-5.3-Codex 检查 Sonnet 写的代码是**结构性的对抗设计**。
**"Those who develop intuition for how different models compose under pressure in agent ecosystems will ship the next generation of innovation."**
## 整套编排逻辑是 700 行 prompt，不是状态机
Missions 的 orchestration 逻辑 99% 写在 prompt 和 skill 里，只有薄薄一层确定性 Python 用来卡住硬约束（如"handoff 未解决前不准前进"）。
**700 行文本，其中 4 句话的修改就能让执行策略发生戏剧性变化**。
设计选择的两层意义：
1. 新模型出来时往往只需改几句 prompt，不需要重写状态机
2. Mission 内部的"策略调整"成为可对话的对象——当用户在 Mission Control 里说「Drop the email notification feature and add Slack integration instead」，orchestrator 不需要触发 git rebase，只需要按更新后的 prompt 重新写一份 features.json
## Slack 克隆：把所有数字摊开看
| 维度 | 数据 | 工程含义 |
|------|------|---------|
| 总运行时间 | 16.5 小时 | wall-clock，不是 agent time |
| Agent runs | 185（1 orchestrator + 63 worker + 27 validator + 94 subagent） | 单 run 都很短，靠数量堆出长周期 |
| 时间分布 | 实现 60.5% / 验证 37.2% / 编排 2.3% | double validator 没让验证失控 |
| Token 总量 | 778.5M | 吓人但实际因为 96% cache 命中 |
| Cache read | 744.9M（96%） | 共享状态文件 + prefix cache 是关键 |
| 代码总量 | 38.8k 行 | 业务功能 18.5k + 测试 20.4k |
| 测试占比 | 52.5% | 不是 nice-to-have，是 worker 必须先写测试 |
| 语句覆盖率 | 89.25% | 接近团队产线代码水平 |
| Implementation features | 40 | orchestrator 一开始规划的功能数 |
| Fix features | 21（34.4%） | 由 validator 反馈触发，不是预先规划的 |
| Validator 发现的 issue | 81（65 个 blocking + 11 non-blocking + 5 建议） | 一轮验证从未通过 |
| Median trajectory | 实现 51 turns / 验证 30 turns（p90 123 / 37） | 单 agent 不需要长上下文 |
## Mission Control：不是聊天框，而是一个项目经理工位
Mission Control 真正的角色是**让人退出执行环路、保留控制环路的视图**。在 Mission Control 里，你不是工程师，你是 50 个 droid 的项目经理。
**四种介入话术**：
1. 任务卡死时：The mission seems frozen -- the last worker finished 10 minutes ago and nothing new has started. Re-assess and continue.
2. 某个 worker 转太久时：The worker on the auth integration has been stuck for 20 minutes. Mark it as complete and move to the next feature.
3. 某个 milestone 整体阻塞时：We are stuck on Milestone 3. Re-assess the remaining work and tell me what is blocking progress.
4. 中途想改方向时：Drop the email notification feature and add Slack integration instead. Re-plan the remaining milestones.
**最小操作单元是计划级再分配，不是函数级编辑**。
## 与 Claude Code Agent Teams、Qoder 专家团的对比
| 系统 | State 在哪里 | 验证方式 |
|------|------------|---------|
| Mission Control | git 和共享 markdown，validation 是中心化的 gate | validation contract |
| Agent Teams | 每个 teammate 的对话窗口 | lead/peer 互检 |
| Experts Mode | Team Lead 的 plan | QA/Review 专家角色并行触发 |
Mission Control **故意不做 direct communication**——这看起来低效，但保证了一件事：**任何时候 mission 的状态都可以被人类完整理解**。Agent Teams 的 mailbox 在 demo 里很酷，但当某个 teammate 在 1 小时前的对话里做了一个决定，2 小时后没有人能轻易回溯它对其它 teammate 的影响。
## Bitter Lesson 反驳
为什么这套架构不会被下一代模型 obsolete 掉：
1. orchestration 逻辑写在 prompt 里，模型变好规划质量直接提高，不需要重写 graph
2. separation of concerns 让 model specialization 收益直接显现——模型越分化，"把最对的模型放到最对的角色"的红利越大
3. validation contract 是为人类需求建模的，不是为某种模型建模的——契约本身在模型更新过程中是稳定的
**"锁死在单一模型家族的系统永远被这家最弱的能力约束。"**
## 能抄的设计原则
1. **角色责任明文化**：先写"不许做什么"，比"能做什么"更重要
2. **验收标准前置**：planning 阶段产出 validation contract（行为断言列表），生成 contract 的 agent 和评估 contract 的 agent 必须不同
3. **结构化 handoff 取代记忆**：completed/not_completed/commands_executed/issues_found/procedure_compliance 五个字段
4. **写串行、读并行**：文件写入/commit/validator 评估严格串行；codebase search/文档调研可以并行
5. **让验证用不同的模型**：哪怕只是换另一家提供商的中等规模模型，就能避开同家族训练数据 bias 带来的 false negative
## 参考资料
- Multi-Agent Systems / Missions That Ship for Days — Luke Alvoeiro, Factory（YouTube, 2026-05-06）：https://www.youtube.com/watch?v=ow1we5PzK-o
- How Missions Work — Theo Luan, Factory（2026-04-10）：https://factory.ai/news/missions-architecture
- Introducing Missions — Factory（2025-02-26，2026 数据更新版）：https://factory.ai/news/missions
- Factory CLI Missions 文档：https://docs.factory.ai/cli/features/missions