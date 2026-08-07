---
source_url: "https://mp.weixin.qq.com/s/x9MWptTps-nGUC2f7PEPHw"
source_author: "Hyman的杂货铺"
source_title: "小米 Darwin Agent 团队发布 HarnessX：Agent Harness 也能「进化」，弱模型最高 +44%"
source_date: "2026-06-16"
source_publication: "微信公众号（Hyman的杂货铺）"
ingested: "2026-08-07"
sha256: "1f3048b2a87d643b6dd170fb6d59b56f459cea15468ae69f0f7686bd69970918"
---

# 小米 Darwin Agent 团队发布 HarnessX：Agent Harness 也能「进化」，弱模型最高 +44%

> 作者：Hyman的杂货铺
> 论文：HarnessX: A Composable, Adaptive, and Evolvable Agent Harness Foundry（arXiv:2606.14249）

## 一句话讲清楚

小米 Darwin Agent 团队提出 HarnessX，把 Agent 运行时 Harness（Prompt、工具、记忆、控制流）当作可组合、可进化的第一类对象，通过 AEGIS 引擎从执行轨迹中自动改写 Harness，并在五个基准上平均提升 14.5%、最高 +44.0%。

## 一个被低估的杠杆

大模型 Agent 的能力，一半在模型，另一半在 Harness。Harness 是模型与环境之间的运行时中介层：决定任务如何被表示、外部服务如何被调用、中间决策如何被记录和传递。Claude Code、LangGraph、OpenClaw 这些产品本质上都是在做 Harness 工程。换新模型、新工具、新任务域，往往要重新手写整套脚手架。

HarnessX 的核心判断：Agent 的进步不必只靠堆模型参数——把运行时接口做成可组合、可从执行反馈中进化的系统，是一条互补且可落地的路径。

## 现有 Harness 的三重困境

1. **手工重写**：每换模型版本或任务域，从头调 Prompt、重写工具封装、重新摸重试策略，执行轨迹大多进了垃圾桶
2. **架构耦合**：Prompt 模板、重试逻辑和记忆管理写在同一条代码路径里，改一处悄悄坏另一处；跨项目复用靠 Ctrl+C/V 而非真正组合
3. **训练割裂**：Harness 改动不反哺模型训练，模型变强了 Harness 也不会自动跟上，两边各自迭代永远差半步

HarnessX 的应对：把 Harness 提升为第一类对象——可以组合、可以适应、可以与模型协同进化。

## Harness 组合：把脚手架变成「可替换零件」

### 形式化定义

Harness 被定义为一对配置：
- **模型配置（model_config）**：哪个模型担任 main/judge/evaluator 角色，以及各角色 fallback 策略
- **Harness 配置（harness_config）**：Agent 的行为逻辑，与具体模型身份无关

两者通过 `agent = model_config.agentic(harness_config)` 组合成可执行 Agent。同一 Harness 配不同模型，执行相同 Processor 流水线，行为差异只来自模型响应；同一模型配不同 Harness，是行为层面的根本差异。

Harness 配置进一步分解为：
- **Processor 列表**：按生命周期 Hook 索引，覆盖 8 个 Hook 点（task_start、step_start、before_model、after_model、before_tool、after_tool、step_end、task_end）
- **槽位资源**：正交槽位——工具注册表、Tracer、工作区、沙箱提供者、插件列表。槽位是单例跨 Processor 共享；Processor 状态实例私有

这种设计让 Harness 配置成为可独立序列化、可比较、可哈希、可替换的对象——程序化进化的前提。

### Processor：最小行为单元

所有逐步行为由 Processor 实现，协议：`async def process(self, event: Event) -> AsyncIterator[Event]`。每个 Processor 消费一个事件，产出零个或多个事件，只有五种结果：透传、变换、分裂、拦截、中断。同一 Hook 上 Processor 输入输出类型一致，可顺序组合，插入/移除不破坏类型正确性。

三类元数据约束组合行为：`_singleton_group`（互斥组，同组最多一个）、`_order`（Hook 内排序 PRE/NORMAL/POST）、`_after`（对其他互斥组的软依赖）。进化可以精确到「在某个 Hook 插入新 Processor」「按互斥组替换」「移除某个」，不影响流水线其他部分。

### 九维行为分类

| 维度 | 名称 | 职责 |
|------|------|------|
| D1 | Model Selection | 决定各角色用哪个模型 |
| D2 | Context Assembly | 每步呈现给模型的上下文 |
| D3 | Memory Management | 跨步/跨会话的记忆策略 |
| D4 | Tool Ecosystem | Agent 可调用的工具集 |
| D5 | Execution Environment | 工具副作用的执行环境 |
| D6 | Evaluation & Reward | 结果评判与奖励信号 |
| D7 | Control & Safety | 防循环、防超支、防漂移 |
| D8 | Observability | 事件/调用/推理的完整记录 |
| D9 | Training Bridge | 轨迹转 RL 训练记录 |

AEGIS 进化中编辑覆盖全部九维；D2（上下文组装）和 D4（工具生态）是最频繁编辑目标，D8 提供轨迹基底，D9 提供协同进化训练信号。

## AEGIS：从执行轨迹中「学习」改 Harness

### Operational Mirror（操作镜像）

把 Harness 进化形式化为符号空间上的 MDP：Policy↔Harness 更新策略（四阶段流水线）、State↔Harness 配置+轨迹存储、Action↔类型化 Harness 编辑（Builder 操作+变更清单）、Feedback↔轨迹+验证器分数（可观测层）、Update↔确定性接受门。

一旦建模为 MDP，标准 RL 三种病理在符号空间放大重现：

- **Reward Hacking（奖励黑客）**：LLM Evolver 针对验证协议构造 exploit——把 benchmark 答案嵌入 Prompt、利用验证器格式规律、添加改写输出的 Processor 匹配验证器期望
- **Catastrophic Forgetting（灾难性遗忘）**：修复失败模式 A 的编辑，通过共享上下文/工具/记忆策略/控制规则静默破坏模式 B；没有显式回归检查，Evolver 只看失败任务轨迹，无法区分局部收益和全局退化
- **Under-Exploration（探索不足）**：系统偏向低风险局部编辑（Prompt 改写/工具描述微调/小幅控制流），结构性变更（拆分子 Agent/替换控制策略/新记忆架构）很少涌现

### 四阶段流水线

同一 Meta-Agent LLM 驱动四阶段，**选择性调用**（自行判断每阶段是否有足够信号，而非外部路由器硬编码）：

1. **Digester（消化器）**：GAIA 一轮 103 任务（pass@2）约 1000 万 token 原始轨迹 → 每任务压缩为结构化摘要（二元结果、失败类别、涉及组件、支持性证据摘录），链接跨轮历史，区分持续失败和瞬时噪声
2. **Planner（规划器）**：构建适应景观——哪些任务失败、尝试过哪些编辑、哪些组件被牵连、哪些编辑类型（Prompt/Tool/Processor/Config）尚未尝试。对抗 Under-Exploration 的主要机制
3. **Evolver（进化器）**：产出一个或多个候选 Harness，每个附带**变更清单（Change Manifest）**：编辑了哪些组件、预期行为效果、预计改善/退化的任务。新 Processor 代码必须提供 smoke test
4. **Critic + 确定性门控**：Critic 对抗 Reward Hacking（变更清单与轨迹证据比对，评估非局部效应风险，最多一次修订请求）；门控对抗 Catastrophic Forgetting（清单完整性→配置规范化→构建/smoke test→**Seesaw 约束**[已解决任务不得退化]）。LLM 判断与接受解耦——只有确定性检查决定上线

### 变体隔离：解决异构任务集冲突

单一 Harness 在异构任务集上：改善子集 A 的编辑可能破坏子集 B，Seesaw 拒绝它但也丢掉局部有益变更。**Ensemble Routing（集成路由）**维护最多 K 个 Harness 变体，每个任务路由到该任务簇历史成功率最高的变体。编辑按变体评估：改善某簇不退化其他簇→直接应用；改善子集同时退化其他子集→**分叉新变体**而非拒绝。Seesaw 约束按变体作用域化。

## Harness-Model 协同进化

两个天花板：
- **Scaffolding Ceiling（脚手架天花板）**：Harness 已暴露正确工具/上下文/控制流，瓶颈变成冻结模型能否真正利用
- **Training-Signal Ceiling（训练信号天花板）**：固定 Harness 训练模型，新能力无法被练习因为脚手架从不调用

协同进化单次迭代并行两条优化路径，共享固定容量 FIFO Replay Buffer：Rollout → Verification（固定验证器评标量奖励）→ Buffer Insertion（带 Harness 版本标记）→ Harness Evolution（AEGIS 离散结构编辑经 Critic+门控上线）→ Behavior Log-Probabilities（新轨迹在生成模型下前向传播缓存 token 级 log-prob）→ GRPO Update（Cross-Harness GRPO）→ Advance。

### Cross-Harness GRPO

把同一道题的所有跑法（不管哪个 Harness 版本）放一个「考场」横向比较——跑得好的轨迹被鼓励，跑得差的被抑制。同一任务标识的所有轨迹形成一个 GRPO 组，无论由哪个 (model, harness) 对产生。策略更新用 clipped GRPO 变体 + KL 锚定。

**Task-level 对齐，非 Action-level**：不同 Harness 版本动作空间可能不兼容（不同工具 Schema/Prompt 结构），但按任务分组仅比较验证器奖励，无需动作级对齐。计算梯度时每条轨迹在其生成时的 Harness 版本下重放 log-prob，Harness 进化可自由改变动作空间。

**零额外 Rollout 成本**：Agentic RL 主要开销是环境 Rollout 而非梯度更新，同一批轨迹同时服务 AEGIS 诊断和 GRPO 训练，模型更新边际成本仅是一次缓存前向传播和梯度步。

## 实验：五个基准、三种模型、十五轮进化

Benchmarks：GAIA (L1-3) 多步检索 103 任务/精确匹配、ALFWorld 具身规划 134 任务/目标完成、WebShop 网页交互 100 任务/属性匹配、τ²-Bench 多轮对话 3 域/规则合规、SWE-bench Verified 软件工程 55 任务/Patch 解决率。

Meta-Agent：Claude Opus 4.6；Task Agent：Claude Sonnet 4.6、GPT-5.4、Qwen3.5-9B；进化最多 15 轮，连续 2 轮无上线编辑早停；指标 pass@2。

基线：(1) Static Harness 固定 Prompt 和工具定义；(2) Claude Code SDK (CC SDK) 单 Agent 进化器，替换四阶段流水线但共享基础设施。

### 主结果：平均 +14.5%，弱模型收益最大

| Benchmark | Task Agent | 初始 (%) | 进化峰值 (%) | 提升 |
|-----------|-----------|---------|-------------|------|
| ALFWorld | Sonnet 4.6 | 83.6 | 94.8 | +11.2 |
| ALFWorld | GPT-5.4 | 76.9 | 97.8 | +20.9 |
| ALFWorld | Qwen3.5-9B | 53.0 | 97.0 | +44.0 |
| WebShop | Sonnet 4.6 | 60.0 | 76.0 | +16.0 |
| WebShop | GPT-5.4 | 55.0 | 73.0 | +18.0 |
| WebShop | Qwen3.5-9B | 36.0 | 49.0 | +13.0 |
| GAIA | Sonnet 4.6 | 73.8 | 83.5 | +9.7 |
| GAIA | GPT-5.4 | 73.8 | 73.8 | 0.0 |
| GAIA | Qwen3.5-9B | 20.3 | 37.4 | +17.1 |
| SWE-bench | Sonnet 4.6 | 76.4 | 87.3 | +10.9 |
| SWE-bench | GPT-5.4 | 45.5 | 63.6 | +18.2 |
| SWE-bench | Qwen3.5-9B | 23.6 | 41.8 | +18.2 |
| τ²-Bench | Sonnet 4.6 | 89.6 | 95.0 | +5.4 |
| τ²-Bench | GPT-5.4 | 76.2 | 90.7 | +14.5 |
| τ²-Bench | Qwen3.5-9B | 93.5 | 94.6 | +1.1 |

15 个模型-基准配置中 14 个获得提升。规律：基线最弱的 Qwen3.5-9B 在 ALFWorld 从 53.0% 飙到 97.0%（+44.0%），Sonnet 4.6 只提升 +11.2%。弱模型行为缺口更容易被 Harness 级编辑弥补；基线高时剩余失败得靠任务级微调。ALFWorld (GPT-5.4) R4 达峰；SWE-bench 全部 Agent R2-R3 达峰（失败集中少数组件类型）；GAIA (Sonnet 4.6) 拖 11 轮（失败横跨 Prompt/Tool/Processor/Config 四类）；GAIA GPT-5.4 零增益是异构任务集编辑需求打架（变体隔离要解的题）。

### 变体隔离：从崩溃到稳定提升

GAIA (GPT-5.4, 15 轮) Global vs Ensemble：Ensemble（最多 K 变体）最终 87.4%/峰值 87.4%/Token 107.8M；Global（单一 Harness）最终 49.5%/峰值 73.8%/Token 143.7M。Global R4 达峰后持续退化（亚阈值回归，pass@2 二元信号检测不到但累积成聚合下降），峰值-最终 -24.3% 远超二项 95% 置信区间（±8.5%），确认灾难性遗忘而非噪声。Ensemble 三条性质全部验证：非退化聚合轨迹、更晚达峰（R14 vs R4）、更低 Token 消耗（107.8M vs 143.7M）。

### Meta-Agent 架构对比

GAIA (GPT-5.4, 变体隔离, 15 轮)：AEGIS 四阶段 87.4%/R14/107.8M vs CC SDK 单 Agent 86.4%/R12/123.1M。1.0% 差距在一个标准误内，四阶段分解在此 Meta-Agent 能力水平不带来最终准确率优势，但 CC SDK 多消耗约 14% Token——Digester 将 ~1000 万原始轨迹 token 压缩到 ~1 万结构化摘要，单 Agent 必须截断轨迹、编辑信息不足被门控拒绝更频繁。收益主要来自 HarnessX 基础设施（类型化组件、结构化轨迹），四阶段价值在效率（~12% 更少 Token）和可解释性。

### 协同进化：再 +4.7%

GAIA 和 WebShop 用 Qwen3.5-9B：GAIA Harness-only 37.4% → 协同 41.7%（+4.3%）；WebShop 49.0% → 54.0%（+5.0%）。平均 +4.7%。R4 前两曲线重合，联合训练生效后分叉，协同进化剩余轮次始终不低于 Harness-only。模型把各轮 Harness 试出的策略「吃进去」，后面的编辑在已学会的行为上叠加。

## 分基准深度分析

- **ALFWorld**：弱模型逆袭。搜索低效和硬步数上限是主要失败簇；强基线 Sonnet 几乎只靠 Prompt 编辑攀升，弱基线动用更多样化杠杆；结构性杠杆（Processor、Config）在弱模型上既更频繁也更有效
- **GAIA**：异构检索多面失败。blocked-source 和 reasoning 主导未解任务，figure/visual 和 parsing 是残余模型缺口；Qwen3.5 单次 tools 上线命中率 0.67（最高收益单元）
- **WebShop**：搜索循环被驯服后的判断瓶颈。Round-0 搜索/翻页循环被进化驯服后，残余失败主要是选错产品/颜色匹配/属性检查；Prompt 是主要攀升杠杆，Processor 是稳定第二杠杆
- **τ²-Bench**：判断错误主导。过早行动和错误选择主导；工具集固定故零 tools 编辑；GPT-5.4 Telecom +25.4%（67.5→93.0 R2），Sonnet 4.6 Telecom R7 因连续同类型编辑累积 -14.0% 回归 R9 自行恢复
- **SWE-bench Verified**：修复不完整是主因。incomplete fix 和 wrong diagnosis 主导；所有运行 Prompt-first、零 tools 编辑；强模型有效杠杆命中率 0.39-0.48，Qwen3.5-9B 所有杠杆跌至 0.05——进化无法逾越的能力地板

## 三种 RL 病理的实证

- **Reward Hacking**（GAIA, Sonnet 4.6, R10）：上线复合编辑（tool+prompt+config）通过 Seesaw，准确率 74.8→79.6%；R11 轨迹分析发现部分任务利用验证器格式规律而非真正检索通过；R12 Planner 标记此路径，后续编辑引入 guard 限制工具仅用于可二次检索交叉验证的任务，两轮内自行修复
- **Catastrophic Forgetting**（τ²-Bench Telecom, Sonnet 4.6, R7）：R2-R6 连续五轮上线同类型 Prompt/Processor 编辑追加「提醒」规则，R4 合规率 100% 降至 R6 94.7%，R7 Critic 标记集中风险仍批准上线，第六条提醒通过交叉规则冲突把合规率打到 80.7%（-14.0%）；pass@2 检测不到亚阈值耦合；R9 Planner 诊断后提出结构性编辑替换冲突提醒栈自行恢复
- **Under-Exploration**（ALFWorld, Sonnet 4.6, R4-R7）：几乎全是 Prompt 级小修小补每轮增益 <1%，ship-prediction 准确率从 R3 80% 跌至 R7 0%；唯一结构性编辑（R6 Processor 级）命中率仅 14%，Planner 缺乏结构性编辑历史校准假设

## 工程视角判断

Claude Code 的 Dynamic Workflows 让模型在单会话里生成任务脚本，但上一次会话的轨迹对下一次没有任何影响；HarnessX 的 AEGIS 是跨轮的：失败轨迹被 Digester 压缩、Planner 分析、Evolver 改写，下一轮跑在被修改过的 Harness 上。从「每次手工调」到「系统持续学」的代际跳跃。

Global 策略在 GAIA 从 73.8% 崩到 49.5%，Ensemble 路由拉回 87.4%——关键前提是 Harness 组合结构让每个编辑的预期作用域显式化。Qwen3.5-9B ALFWorld +44% 说明对能力受限模型 Harness 进化比堆参数更直接；Sonnet 4.6 τ²-Bench 基线 89.6% 只挤出 +5.4%，高基线场景得靠任务级适配。协同进化平均 +4.7% 且同一批 Rollout 复用边际成本极低。实际落地分阶段：先跑 Harness-only 打磨脚手架，模型触顶后再开 GRPO。完整代码库尚未开源，生产级运维成本未评估。

## 局限与未来方向

- 所有报告增益都在进化使用的同一任务集上测量，未评估对未见任务的泛化
- GAIA GPT-5.4 零增益和 SWE-bench 峰值后退化，单 Harness 策略在异构/小样本场景仍有结构性瓶颈
- 完整代码库将在未来开源——目前尚无法复现

未来方向：更细粒度的变体管理（Domain-aware 聚类、Task-level 锦标赛试点）、跨任务泛化评估、Harness 进化集成到生产 Agent 系统持续运维流程。
