---
title: "Skill 自进化：SkillOpt 实践总结"
source_url: "https://mp.weixin.qq.com/s/YS18dZfVvNBEsBuZ1pa7DA"
source_name: "AliExpress技术"
author: "枫樾"
type: "raw"
created: 2026-08-19
ingested: 2026-08-19
tags: [skill, self-evolution, skillopt, skilloptlite, harness, agent, reinforcement-learning, aliexpress]
sha256: 73a1ede1d9498e516b596228cfb30ea71160913172c9dfdd529e9bff95f57798
---

# Skill 自进化：SkillOpt 实践总结

> 账号：AliExpress技术（阿里国际）| 作者：枫樾 | 原创深度工程实践

## 一、为什么需要 Skill 自进化

把经验塞回 Agent 有三条朴素路径：塞进 prompt、写进代码、训进权重。三条路径各有硬伤：
1. **上下文腐化**：长程任务里把成功经验/纠错案例堆进 system prompt，token 持续膨胀，注意力被稀释。典型现象是 prompt 从数百 token 膨胀到上万 token，但关键指令召回率反而下降。
2. **经验遗忘与不可复用**：ReAct/Reflexion 框架里 Agent 每次会话从零推理同一套多步流程，单次会话学到的纠错策略/工具调用顺序会话结束即丢失，无法跨任务/跨用户/跨模型版本迁移。
3. **人工维护成本**：工程师手写 skill 文档与 prompt 模板，更新滞后于模型能力迭代和任务分布变化，形成难以规模化的"专家瓶颈"。

权重侧适配在很多场景不可用：闭源前沿模型没法微调，开源模型微调成本高。问题收敛成——**如果被反复适配的对象是 Agent 的做事流程，那这份流程文档本身就应该是可训练的**（SkillOpt 原话："If the recurring object of adaptation is the agent's procedure, the skill document itself should be trainable."）。

## 二、Skill 的三种形态

| 形态 | 表现 | 优势 | 代价 |
|---|---|---|---|
| 文本形态（skill.md） | markdown 存操作指南/决策规则/少样本示例，直接注入 context | 编辑代价低、可读性强、迭代快 | 表达力有限，依赖模型理解，无法保证确定性执行 |
| 可调用函数封装 | 函数/脚本/API wrapper | 执行确定、可单元测试、支持组合调用 | 生成与验证成本高，需覆盖边界条件 |
| 过程性脚本 | 把成功轨迹压缩为带条件分支的 if-then 工作流 | 兼具语义可读与流程确定性，支持分支决策 | 压缩轨迹需要额外的抽象与泛化能力 |

生命周期同一条链：经验萃取生成 → Skill Bank 存储 → 语义/图检索 → 执行与验证 → 精炼与淘汰。本文重点讨论文本形态（编辑成本最低，最可能进高频迭代优化循环）。

关键视角转换：把 skill 当提示词的附属产物，只能写得更好一点；把 skill 当成**冻结 Agent 的可训练外部状态**，才能引入学习率、验证集、调度这一整套工具箱。

## 三、Skill 自进化发展的五阶段

**Stage 1 · 从经验到 Skill**（技能从哪来，把执行轨迹压缩成可复用单元）：
- **EvolveR**：自进化组织成"经验驱动的生命周期"，经验萃取与回流是闭环而非一次性动作（ICML 2026，浙大/上海AI实验室/华东师大/复旦）
- **SAGE**：skill library 与强化学习结合，让技能库成为 self-improving 载体（Wisconsin-Madison/AWS）
- **SkillRL**：把"技能增强"与"强化学习"做成递归结构——技能库既是策略输入，也是策略改进产物
- **Skill-Pro**：形式化 Skill-MDP，不更新参数前提下让 Agent 自主学习可复用过程性技能，用非参数化 PPO 把经验复用问题摆到策略优化框架里

共性局限：萃取出的技能质量高度依赖轨迹质量，技能被写出来不等于有用，缺一道把关。

**Stage 2 · Skill 递归进化**：
- **Skill1**：技能库与策略模型演化统一到 RL 框架，核心关注技能库的去冗余与泛化精炼（中科大/美团）
- **ARISE**：针对"用可验证奖励的 RL 提升数学推理"范式缺陷——两级技能库（cache 活跃池 + reservoir 储备池容量 C_r=100）+ 五个管理算子 + 置信度门控选技能（manager 条件对数概率打分，超阈值才注入）+ 三级奖励（r2>r1>r0，r_skill 加分只在"用了技能且答对"时给）+ 两阶段训练（Phase I 前 500 步二值奖励热启）
- **EvoSkill**：迭代式失败分析自动发现并精炼技能，Pareto 前沿把关，只保留提升 held-out 验证性能的技能，底座冻结。OfficeQA 60.6%→67.9%(+7.3)，SealQA 26.6%→38.7%(+12.1)
- **CoEvoSkills**：生成器与验证器协同演化（UIC/MBZUAI/McGill）

**Stage 3 · Skill 组织与检索**：
- **SkillGraph**：技能表示为有向图节点，带类型边编码 prerequisite/enhancement/co-occurrence 三类关系；面对新任务检索有序技能子图而非单个技能。ALFWorld/WebShop/7 检索增强 QA 上 memory-augmented RL 对比 SOTA
- **SkillOS**：高质量策展才是瓶颈，给出一套经验驱动 RL 训练配方，冻结 Agent 执行器 + 可训练策展策略（UIUC/Google Cloud AI/MIT）
- **SkillOps**：库里会累积"库级别缺陷"（单个技能本地没坏但损害后续检索/组合/执行），指出 task-time 维护被过度关注而 library-time 维护被忽视，给出方法无关插件式框架（Emory/UIUC）

**Stage 4 · 生命周期管理**：
- **AutoSkill**：从对话与交互轨迹自动派生/维护/复用技能，不重训底座前提下动态注入后续请求，模型无关插件层，标准化技能表示跨 Agent/用户/任务共享迁移（华东师大）
- **MUSE-Autoskill**：把创建/记忆/管理/评估统一到一个生命周期（ByteDance/RIT）

## 四、文本空间优化：SkillOpt

冻结底座权重不变，把 skill.md 当作外部可训练参数，在文本空间做梯度式优化。

**论文**：SkillOpt: Executive Strategy for Self-Evolving Agent Skills（Microsoft/上海交大/同济/复旦，arXiv:2605.23904v2）

### 机制总览（深度学习类比）
| 权重空间 | 文本空间（SkillOpt） |
|---|---|
| parameter | skill document（best_skill.md） |
| gradient direction | trajectory-derived edit direction（由轨迹反思得出） |
| learning rate | edit budget（单步最多应用几条编辑 L_t） |
| validation check | held-out selection gate（独立 selection split 上严格更优） |
| stable training setting | rollout batch / reflection minibatch / 调度 / 门控 |

**问题定义**：对 harness h、任务 x、skill s，执行产出轨迹 τ 与标量分数 r。M 是冻结目标模型。用 D_tr 生成候选 skill 集合，D_sel 选最优，只在 D_test 报最终成绩。优化器状态含当前 skill、当前最优（经门控）skill、skill hash 缓存、epoch 内 rejected-step buffer、可选 slow/meta 状态。只有最优被接受的 skill 导出为 best_skill.md。

**六大机制**：
1. **Rollout（前向传播）**：目标模型带当前 skill 在 D_tr 跑 rollout batch。harness 记录任务元数据/消息/工具调用/观测/命令输出/最终答案/verifier 反馈。支持 accumulation 把执行吞吐与更新频率解耦。
2. **Reflection（反向传播/文本梯度）**：优化器把失败与成功分开、各自切 reflection minibatch。单条轨迹只产出轶事式修补，minibatch 暴露可复用过程性错误。失败 minibatch 提缺失/纠正性规则，成功 minibatch 保留有效行为。局部提案分层合并（失败优先）。
3. **Bounded Edits（学习率）**：第 t 步最多应用 L_t 条编辑，按预期收益排序裁剪到 top L_t。无界重写会抹掉有用规则/引入互斥指令/过拟合局部失败。支持 constant/linear/cosine/autonomous 调度，默认 cosine。patch 模式局部操作，rewrite 模式整份重写。步级编辑不允许覆写受保护 slow-update 字段。
4. **Validation Gate（验证）**：每个候选 skill 在 D_sel 用同一冻结目标模型+同一 harness 评估。优于当前 selection 分数则成为新当前 skill；超历史最优则成为 best_skill.md；否则拒绝。门控故意严格（必须严格大于，平手一律拒绝）——"部署的 skill 永远不会静默漂移"。
5. **Rejected-Edit Buffer（负反馈）**：被拒更新不浪费，维护 epoch 内 buffer 记录失败模式+试过哪些编辑+分数下降多少。同 epoch 后续反思调用读取，避免重复失败编辑。
6. **Epoch-Wise Slow/Meta Update（动量）**：慢更新看相邻两 epoch，同批样本对比归为 improvements/regressions/persistent failures/stable successes 四类，写入受保护 slow-update 字段，仍过验证门控。meta skill 只存在于优化器侧（总结哪类编辑有效/被拒/顽固失败），不随 skill 交付目标模型——关注点分离。

### 实验
**6 benchmark × 7 目标模型 × 3 harness**。Benchmark：SearchQA/SpreadsheetBench/OfficeQA/DocVQA/LiveMathematicianBench/ALFWorld。目标模型：GPT-5.5/5.4/5.4-mini/5.4-nano/5.2/Qwen3.5-4B/Qwen3.6-35B-A3B。Harness：direct chat/Codex/Claude Code。

主结果（GPT-5.5 direct chat）：六 benchmark 均值从 58.8（no skill）→82.3（+23.5）；"每单元挑最好基线"的 oracle 均值 76.9，SkillOpt 仍领先 +5.4。SkillOpt 在 **52/52 单元取得最优或并列最优**。按模型平均提升约 +17.6（GPT-5.4-nano +26.7 最高）。Harness 侧 Codex +24.8、Claude Code +19.1。

收益来自极少编辑：最终 skill 379–1995 token（中位 ~920），被接受编辑仅 1–4 条（中位 2.5）。LiveMath 的 +29.3 分来自单独一条被接受编辑。优化器提出的大量编辑绝大多数被 held-out 检查拒绝，被 rejected-edit buffer 收走。学到的规则全部是过程性而非实例特异（不点名具体题目/文件/实体）。

### 消融
规模类超参很钝（batch/minibatch/调度 ±1.5 分内），**纪律类机制很尖**：去掉慢更新与 meta，SpreadsheetBench 直接 −22.5；无 rejected buffer 各任务 1.6-3.2 下降；无界重写（without lr）Spreadsheet −1.8、LiveMath −4.0。

### 局限
依赖可打分的轨迹与 held-out 划分（最适用有自动 verifier/精确匹配/可执行检查的任务）；交付物小但训练成本高；只优化一份可移植 skill 而非 skill bank；可能编码训练分布特有启发式，跨模型/harness/任务迁移需谨慎 held-out 评估。

### SkillCoach：把评估器也做成可进化的
当结果信号太粗时（Agent 可能一边选中干扰技能/跳过必需步骤/错误组合/漏掉最终检查，一边靠试错通过验证），SkillCoach 从真实 rollout 派生基于技能的过程性 rubric，沿四维度评估轨迹：skill selection（是否选对 gold skill 避开干扰项，集合级 F1）/skill following（是否遵循关键步骤，加权完成度×证据乘子）/skill composition（是否在有效工作流中协调多技能，对前置依赖计权）/skill-grounded reflection（提交前显式检查）。rubric 自身进化与 SkillOpt 同构：rollout→judge→arbitration（有界提案+验证门控）。效果：gold 关键点覆盖率 71.56→83.70，可用性 81.53→94.33，幻觉率 2.00→0.00。

关键发现：把 rubric 当数据筛选器，"只按结果筛"把 Qwen3.5-4B 从 8.0 拖到 6.0（更差），而按进化后过程 rubric 筛能到 24.0——通过最终检查的轨迹并不自动是可复用的技能使用范例。

## 五、实践：对 SkillOpt、SkillOptLite 的改进（AliExpress 一手落地）

**场景**：被进化对象是 Push 主标题生成 skill（copywriting.md 约 200 行）。三条约束：
1. **质量红线冻结**：`## 质量红线` 段整段冻结（copy_evolve.py:100 `_FROZEN_KW`），合规只增不减，README 第一条红线"只会让红线更严，绝不为好看放松；合规提案独立人审"
2. **品类 overlay**：线上真实 auto-* skill = copywriting.md + 品类叠加指引（auto-{free-shipping,hot-selling,new-arrival}.SKILL.md 的 Step-3 段）
3. **任务集**是 brief（一次生成任务的输入），来自真实 CTR 数据按 category×lang 聚合派生

**SkillOptLite 落地核心——三层 reward 替代单一 verifier**（Push 文案无自动 verifier，离线拿不到 CTR）：
- **L1 确定性合规**（quality_judge.compliance）：逐语种硬规则——≤36 字、无金额/百分比、无虚构销量与评价、无最高级、emoji≤1、无伪装系统通知、无操纵性紧迫、无空洞鸡汤
- **L2 LLM 判官**（QualityJudge.pairwise）：带真实投放 CTR 锚点的成对评审
- **L3 微调项**（l3_adjust）：细粒度修正，clip 到 ±0.05

五个代理指标：合规/多样性（distinct 率）/泛折扣/均长/具体度。

**三个 LLM role**：Optimizer（编辑器，读弱样本+skill 原文→最小编辑，避开冻结区）、Executor（Rollout/Target，用当前 skill 真生成）、Judge（评估器，多票去噪，结果缓存）。

**单轮六步**：Rollout（当前 skill+品类 overlay 作 system prompt，train 滚动子集每轮 8 条生成标题，温度可调）→ 诊断（挑弱样本：L1 不合规记 2 分/泛折扣或超长或跨 brief 重复或开头雷同记 1 分/合规但可提升记 0 分，取 top 6 喂优化器——这是对论文"失败 minibatch"的替代）→ 优化器（最小编辑，≤2 条 add/replace/delete，冻结段跳过）→ 门控 → 记录/早停（accept 快照，reject 丢弃天然回滚，连续无改进 patience=3 早停）。

**三态门控 + 合规否决层**：①合规或多样性下降→reject（客观退化）②合规或多样性上升→accept（客观改进）③都持平→去噪判官 K 票（胜率≥0.5+deadband 才 accept）。合规否决前置：cand_redline_rate ≤ current 才往下判。去噪判官：完全相同记 tie=0.5，不同做 K=3 次 temperature>0 成对投票取多数，A/B 位置按下标奇偶交换去位置偏置。

**runtime 实测**：一次训练 10 轮，接受 7 次拒绝 3 次。三次拒绝判官胜率全低于 0.5（0.4583/0.4583/0.4167），胜率达 0.5833 的四轮全被接受；胜率恰 0.5 的三轮由客观信号（多样性上升）直接判定。门控按设计工作。终态 best vs 原始：合规 1.0 持平、多样性 0.917→1.0 改善、泛折扣 0 持平、均长基本持平、具体度 0.333→0.25（下降，但因该指标只识别英文品类词、多语种下不可靠，仅参考）。判官投票中具体度提升案例（select→home、Trending→Trending picks）与进化区规则同向。

**对抗注入**：人工植入一条与真实数据相反的错误规则（"多用通用优惠词，词汇越通用越安全"），看闭环能否定位修正。两次独立运行都改回来了——分别 replace 成"避免孤立使用通用优惠词，必须结合具体品类/场景/利益点，越具体点击率越高"。

**上线闭环**：[SHIP]→把 best_skill.md 合回业务分支→灰度 A/B（best 整份 vs 原始）→看真实 uvctr→胜出全量否则回滚。真实 test split 发生在线上，离线 val 只承担 selection 职责。

**框架对比（v1/v2/v3）**：
- v1 无 rollout 是失败根因；v2 补上（(skill_hash,brief_id) 缓存）
- v1 默认非 LLM 反思（8 条硬编码规则模板，LLM 版异常即回退）；v2 反思但无 minibatch 分组/无成败双路/无分层合并
- v1 Bounded Edits 最完整（constant/linear/cosine 调度+配额+近重复拦截+多样性地板五层限制）；v2 固定 budget=2；v3 放宽到 8
- v1 Validation Gate 严格但实际被旁路（默认只要求 cand_soft>=current-1e-9）；v2 恢复严格+deadband+合规否决前置；v3 只保留合规护栏+整批判官
- v1 Rejected-Edit Buffer 名存实亡（只计数打日志从不回喂）；v2 回喂进 prompt 并 Jaccard 去重
- v1 Slow/Meta Update 有但只更新 5 个标量权重 skeleton_weights（非结构性文本更新）；v2/v3 丢弃
- 受保护区：v1 保护慢更新区；v2 反向使用——冻结人工合规红线，其余章节可内联编辑

## 六、总结

把 skill 从"提示词的附属产物"重新定位为"冻结 Agent 的可训练外部状态"，是这条线上最有杠杆的视角转换。SkillOpt 的贡献不在于"用 LLM 改 prompt"这个动作，而在于给动作套上纪律：**有界编辑、严格门控、拒绝即负反馈、受保护区、逐条可审计**。交付物 <2000 token、1-4 条被接受编辑、纯文本可读可审计、推理期零额外调用，让 skill 成为能 review/版本管理/跨模型 harness 迁移的工程资产。

落地最大分歧不在算法，在没有 verifier——用三层 reward 替代，门控改客观优先、判官只在客观持平时去噪定夺、合规否决前置。**门控的质量上限就是评估信号的质量上限**。

---

**决策**：v=8 / c=8 / v×c=64 → **SUPP to entities/skillopt.md**（Skill 自进化五阶段全景框架 + SkillOptLite 阿里一手落地实践，均为库内零覆盖独立新维度）
