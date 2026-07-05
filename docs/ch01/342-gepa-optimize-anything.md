# Gepa Optimize Anything

## Ch01.342 Gepa Optimize Anything

> 📊 Level ⭐⭐ | 13.7KB | `entities/gepa-optimize-anything.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/gepa-optimize-anything-universal-text-optimization.md)

# GEPA optimize_anything — 通用文本优化 API
**来源：** GEPA 官方博客
**发布时间：** 2026-02-18
**代码：** https://github.com/gepa-ai/gepa

## 一句话总结
GEPA `optimize_anything` 通过 ASI + Pareto 前沿搜索，用一个声明式 API 优化任何文本制品（代码/prompt/Agent 架构/配置），8 个领域验证 SOTA。

## 核心问题
传统 LLM 进化框架（AlphaEvolve, OpenEvolve, ShinkaEvolve）的局限：

- 只支持 Single-Task Search 模式
- 需要 mutation prompts、island configurations、EVOLVE-BLOCK 等框架特定配置
- ASI 未被抽象为一等概念，诊断信息被压缩为单一标量

## 核心方案
### 声明式 API
```python
oa.optimize_anything(
    seed_candidate=...,     # 初始制品（或 None）
    evaluator=...,          # 评分 + ASI
    dataset=...,            # 训练集（Multi-Task / Generalization 模式）
    valset=...,             # 验证集（Generalization 模式）
    objective=...,          # 自然语言目标
    background=...,         # 领域知识
    config=...,
)
```

### 三种优化模式
| 模式 | 触发条件 | 可表达问题 | 先前框架 |
|------|----------|-----------|---------|
| Single-Task | 仅 seed_candidate + evaluator | Circle Packing、Optuna 匹敌 | ✅ 支持 |
| Multi-Task | + dataset | CUDA Kernel 跨操作迁移 | ❌ **独有** |
| Generalization | + dataset + valset | Agent 架构发现、Skill 迁移 | ❌ **独有** |

### 关键机制 1：ASI（Actionable Side Information）
ASI = 诊断反馈的一等 API 概念，类似数值优化中的**梯度**：

- 梯度告诉数值优化器向哪个方向移动
- ASI 告诉 LLM proposer 候选为何失败及如何修复
- 支持文本、结构化数据、**图像**（via `gepa.Image`）多种模态
- `oa.log()` 捕获诊断信息作为 ASI

### 关键机制 2：Pareto 前沿搜索
问题：平均化分数会隐藏强项和弱项，proposer 试图同时改进一切。
解决方案：
1. **Pareto frontier 保留**：任何在某一维度最优的候选都存活，即使平均分不高
2. **Reflection minibatch**：每次反射只展示 2-3 个示例，专注靶向改进
3. **跨迭代保留互补优势**：强项不被平均化过程抹除

## 实验结果
| 任务 | 模式 | 核心结果 |
|------|------|---------|
| Claude Code Skill 优化 | Generalization | 通过率 +47% 速度，Haiku 79.3%→100% |
| CloudCast 云调度 | Generalization | 成本降低 **40.2%** |
| Can't Be Late 调度 | Generalization | 成本降低 7.8% |
| ARC-AGI Agent 进化 | Generalization | 32.5%→**89.5%**（+57pp） |
| CUDA Kernel 生成 | Multi-Task | 跨任务迁移优于专用单任务 |
| Circle Packing | Single-Task | 超越 AlphaEvolve |
| 黑箱数学优化 | Single-Task | 匹敌 Optuna |
| 3D Unicorn | Single-Task | 从零生成 |

## 延伸概念
- （暂无 wiki 中已收录的相关概念页）

## 相关框架对比
| 框架 | ASI | Pareto | Multi-Task | Generalization |
|------|-----|--------|-----------|---------------|
| AlphaEvolve | 文本反馈 | ❌ | ❌ | ❌ |
| OpenEvolve | 文本反馈 | ❌ | ❌ | ❌ |
| GEPA optimize_anything | ✅ 多模态 | ✅ | ✅ | ✅ |

## 5th source: Hermes Agent skill 互优化实战（KK大叔 2026-06）
KK大叔用 `optimize_anything` 框架在 Hermes Agent 上落地了一个 4 轮互优化实验，对象是两个 skill 自身：

- **darwin-skill**（来自 alchaincyf GitHub，灵感源自微软 SkillLens 论文）：9 维评估体系 + 棘轮机制（只涨不跌自动回滚）+ 独立评审（打分 AI ≠ 改 skill AI，因为 AI 给自己打分准确率仅 46.4%）。
- **skill-evolver**（清华 SkillEvolver 论文落地版）：角色分离（作者 AI 不知道执行者怎么理解）+ 三阶段（策略多样化 / 对比式分叉点补丁 / 独立审计）+ 吸收 EmbodiSkill 论文的"四类失败归因"（技能缺陷 vs 执行失误分流处理，避免错改说明书）。

**注入流向**：
- darwin → skill-evolver：棘轮机制 + 探索性重写 + results.tsv 版本追踪
- skill-evolver → darwin：四类失败归因 + 补丁式修订 + CHECKPOINT 检查点
- EmbodiSkill → 两者：技能体/附录分离约束

**4 轮迭代结果**（同一模型、零参数调整、仅改 skill）：
- skill-evolver: 61 → 81 → 85.8 → 86.0 → 79.1（最后一轮 dim8 权重修正）
- darwin-skill: 81.5 → 84.7

**核心洞察**（与框架精神高度一致）：AI 智能体能力提升可通过外部 skill 自进化实现，无需重新训练大模型。**这一案例直接对应本 entity 表格"Claude Code Skill 优化"行（Haiku 79.3%→100%）的工程实现** — 棘轮 = 单调进步保证 / 评估-进化双 skill 互审计 = 多 evaluator 视角下的 Pareto 前沿探索 / 分叉点补丁式修订 = Reflection minibatch 的工程化呈现。

**互补关系总结**：
- darwin = 评估标准（WHEN to stop, HOW to score）
- skill-evolver = 进化方法论（HOW to improve, WHAT to change）
- EmbodiSkill = 失败归因（WHY it failed）
- 三者 = 评估 + 改进 + 诊断的完整自进化闭环

**延伸引用论文**：清华 SkillEvolver（角色分离闭环进化）、微软 SkillLens（9 维评估 + 棘轮）、南大+微软+清华 AIR EmbodiSkill（技能体/附录分离 + 四类归因）。

## 相关概念
- [LLM Artifact Optimization](https://github.com/QianJinGuo/wiki/blob/main/concepts/llm-artifact-optimization.md) — 文本/制品进化优化专题
- [AlphaEvolve](ch03/045-agent.md) — DeepMind 代码进化型科学发现 Agent
- [Agent Memory 模块化框架与评测](ch03/045-agent.md) — ICLR 2026 评测基准
- [Skill RAG 清华 SRA](ch04/255-skill.md) — 技能增强型检索

## 深度分析
1. **ASI 即文本优化的梯度**：`evaluate()` 返回单一标量 → `oa.log()` 记录诊断信息作为 ASI，是从"告诉 LLM 打几分"到"告诉 LLM 怎么改"的信息升维。这一机制与数值优化中梯度的角色完全对称：梯度指示方向，ASI 指示修复路径^。传统进化框架将诊断上下文压缩为单一标量，相当于丢弃了梯度信息。
2. **Pareto 前沿搜索打破平均分掩盖效应**：平均分聚合多维指标时，互补优势被相互抵消（如某候选 A 维度第一、B 维度垫底，平均后与双中等的候选无异）。Pareto frontier 保留所有非劣解，使 ARC-AGI Agent 进化从 32.5% 跃至 89.5% 成为可能^。
3. **三模式递进映射 LLM 进化的三种计算粒度**：Single-Task = 朴素变异搜索（AlphaEvolve 级别）；Multi-Task = 跨任务模式迁移（任务共享 skill 抽象）；Generalization = 构建可迁移到未见问题的 skill library。GEPA 的创新在于用同一个 API 从 Single-Task 渐进到 Generalization，无需重写框架^。
4. **声明式 API 的计算不可约性权衡**：用户声明 artifact + evaluator，系统内部选择搜索策略——这是 DSPy"编程而非提示"原则的延续。但 ASI 的存在让搜索过程并非完全黑箱：诊断信息可审计，proposer 的失败原因可被记录。这种透明性对于生产级优化至关重要^。
5. **全栈制品空间 vs. prompt-only 优化的相变临界**：当优化范围从 prompt 扩展到代码+架构+控制流，10 行种子可以膨胀为 300+ 行系统。代码结构决定了 LLM 可操控的执行粒度，prompt 只能在给定架构内调优。这一相变解释了为什么"全栈优化"能取得 prompt engineering 无法达到的效果^。

## 实践启示
1. **在 `evaluate()` 中用 `oa.log()` 记录结构化 ASI**，而非仅返回分数：将具体错误行、参数值、中间状态记录为诊断上下文，等同于为优化器提供反向传播的梯度信息^。  技能缺陷与执行失误的分流归因（EmbodiSkill 四类归因）正是 ASI 的工程化实现：将失败诊断从"打了多少分"升级为"为什么失败、属于哪一类、应该改哪里"。
2. **多模态 ASI 使用 `gepa.Image` 封装 VLM 可视化反馈**：当制品是图像、SVG 或 UI 时，用 `gepa.Image` 让 VLM 直接"看到"自己输出的渲染结果，ASI 从文本描述升级为视觉对比，这是差异化于纯文本进化框架的关键能力^。
3. **Multi-Task 模式构建 dataset 时注重任务多样性而非数量**：跨任务迁移的核心是捕获模式共性，相似任务过多会导致过拟合。数据集应覆盖不同问题结构，让 Pareto 前沿发现互补的优化策略^。
4. **Pareto reflection batch 严格控制在 2-3 个示例**：这是避免平均化效应的工程保障——batch 过大时 proposer 收到过多信号导致注意力分散，2-3 个示例保证每次聚焦单一维度的靶向改进^。
5. **优先在 Generalization 模式构建可迁移 skill library**：对于需要在新问题上快速适配的场景（如 Agent skill 自动化），先用 Generalization 模式将优化结果固化为 skill，再用 Multi-Task 模式让 skill 在任务间互相增强^。

## 相关实体
- [2026年最值得关注的15款开发者工具你用过几个](ch01/216-0.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/2026.md)

- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/gepa-optimize-anything-universal-text-optimization.md)
- [腾讯研究院Ai速递 20260507](ch04/277-ai.md)
- [Karpathy Ai Agent 7 Bits Value Decline 2026 Allentan](ch04/277-ai.md)
- [Kasra Blog Llm Hacking Empirical Test](ch01/1171-llm.md)
- [Hermes Agent V014 Architecture Shugex](ch01/216-0.md)
## 与 Hermes Agent Skill 互优化的关联

**[Hermes Agent Skill 互优化](ch04/255-skill.md)**（KK大叔 4 轮互优化实验，2026-06）是 GEPA 通用优化方法论在 **Skill 自进化场景**的具体落地。

**互验证（4 维高度互补）**：

| 维度 | GEPA optimize_anything | Hermes 互优化 |
|---|---|---|
| **优化对象** | **任意文本制品**（prompt / skill / code / agent workflow） | **Skill 文件**（Darwin 9 维 rubric / SkillEvolver 进化方法论） |
| **核心机制** | **Pareto 反思 + ASI** — LLM 反思 + 结构化诊断替代纯梯度 | **双向注入 + 棘轮 + 四类失败归因** — 角色分离闭环进化 |
| **评估** | `evaluate()` 分数 + `oa.log()` 结构化 ASI | 9 维 rubric 独立评分 + 棘轮（分数只能涨不能跌） |
| **跨任务** | **Multi-Task 模式 + Pareto 前沿** | **EmbodiSkill 4 类失败归因** |

**核心互补点**：
- **GEPA 提供** = 优化方法论的**通用基础设施**（Pareto + ASI + Multi-Task + Generalization）
- **Hermes 互优化提供** = Skill 自进化的**具体实验范式**（角色分离 + 棘轮 + 四类归因）
- **GEPA 缺**：业务领域专家编码、棘轮防退化、跨 Skill 互优化机制
- **Hermes 缺**：结构化 ASI 诊断、Pareto 多目标优化、Generalization 模式

**结合路径**：把 GEPA 的 Pareto 反思 + ASI 机制注入到 SkillEvolver 的 3 阶段流程中，把"独立审计"升级为 GEPA 风格的"oa.log() 结构化诊断 + Pareto reflection"，用棘轮防退化，用 Multi-Task 让 skill 在任务间互相增强 — 工业级 Skill 自进化的完整方案。

---

