# World Knowledge：Agent推理前先探索环境生成可迁移知识

## Ch04.264 World Knowledge：Agent推理前先探索环境生成可迁移知识

> 📊 Level ⭐⭐ | 9.3KB | `entities/world-knowledge-agent-self-evolution-tencent-hkustgz.md`

# World Knowledge：Agent推理前先探索环境生成可迁移知识

论文：Training LLM Agents for Spontaneous, Reward-Free Self-Evolution via World Knowledge Exploration（Tencent + HKUST(GZ)，arXiv:2604.18131v1）

## 核心问题

当前 Agent 范式的问题：依赖人类预先设计的任务、奖励和工作流。一旦脚手架去掉，Agent 无法自我成长。

本文提出 Native Agency：让 Agent 进入陌生环境时，不等任务、不等奖励，先主动建立可复用的环境理解。

## World Knowledge

针对具体环境的结构化环境认知，以 Markdown 文档存储。可被现有 Agent 直接加载到上下文，无需修改推理框架。

关键特性：显式、可迁移、可版本化、可校验。

## 两阶段框架

### 阶段一：Native Evolution Phase（推理时/训练时均执行）

无任务、无奖励执行：
1. **Planning** → 规划探索路线
2. **Exploring** → 进入环境交互观察
3. **Summarizing** → 整理观察摘要
4. **Refining** → 压缩提炼成 World Knowledge K

### 阶段二：Knowledge-Enhanced Execution Phase

下游任务到来时，将 K 带入上下文完成任务。

行为模式转变：
- 无 K：看见网页 → 现找答案（7步仍可能答错）
- 有 K：先有环境地图 → 带地图找答案（2步答对）

## 训练：SFT + RFT 两阶段

### SFT

Teacher model（Gemini-2.5-Pro）生成高质量探索轨迹：
- 每环境 3 份候选 K，用 outcome-based reward 选最优
- Expert trajectory：平均 374.8 步，每步 3322.4 tokens

### RFT（两轮）

当前模型自探索，生成多份候选 K，用下游任务收益排序筛选。

### Outcome-Based Reward

R(K) = Success(T_E | K) - Success(T_E | ∅)

评价的是"知识最终有没有用"，而非探索过程每步打分。

## 核心数据

| 模型 | 数据 | WebWalker | WebVoyager |
|------|------|-----------|------------|
| Qwen3-30B-A3B | base | 22.04 | 41.08 |
| Qwen3-30B-A3B | +K(Ours RFT) | 40.91 | 57.44 |
| Seed-OSS-36B | base | 16.26 | 39.93 |
| Seed-OSS-36B | +K(Ours RFT) | 37.50 | 56.79 |

约 20% 绝对提升。未训练 base model 加 K 反而会拖累任务。

跨模型迁移：Qwen3-14B+K 超过未辅助 Gemini-2.5-Flash（Conference 35.6% vs 31.3%）。

## 关键工程结论

- 知识最优长度约 8k-16k tokens，过长进入收益递减（Game 域 16k-32k 为 41.56，32k-64k 反降至 40.72）
- 执行步数平均减少约 17%
- SFT + 第一轮 RFT 收益最显著，第二轮 RFT 边际化
- 高质量 K 可超越用于引导它的 teacher prompt

## 局限性

1. 训练阶段仍需下游任务监督，未完全 reward-free
2. 验证主要在网页环境，多模态 GUI/具身/代码仓库未充分验证
3. 探索成本高（平均 374.8 步）
4. World Knowledge 静态 Markdown，缺校验与动态更新机制
5. 跨环境泛化（vs 跨模型迁移）待验证

## 启发

- Agent 瓶颈未必在推理能力，而在对当前环境的结构理解
- 外部化知识可能是参数扩张之外的另一条 scaling 路径
- "训练时有奖励，推理时无奖励"范式可迁移到其他环境

## 深度分析

1. **World Knowledge 本质是环境先验的外部化存储**
   不同于参数化的隐式环境建模，World Knowledge 以 Markdown 形式显式存储页面结构、跳转关系、核心逻辑，使得知识可在 Agent 间共享复用，且无需修改底层推理框架即可接入。

2. **训练后知识才有效——base model 加 K 反而帮倒忙**
   论文实验明确显示：未训练的 base model 加载 world knowledge 反而拖累任务表现（22.04→19.84），说明环境知识必须与模型推理能力对齐才能发挥作用，非适配知识是噪音而非信号。

3. **8k-16k tokens 是知识长度的甜点区间**
   Game 域数据表明：0→8k-16k 持续提升（39.71），16k-32k 边际收益（41.56），32k-64k 开始下降（40.72）。关键约束是**压缩质量**而非积累数量，过长的知识引人注意力分散和检索噪声。

4. **跨模型迁移验证了知识的可迁移性而非模型的适配性**
   Qwen3-14B+K 超过未辅助的 Gemini-2.5-Flash（35.6% vs 31.3%），证明 World Knowledge 的价值不依赖特定模型，而是真正捕获了环境结构本身，可作为独立于模型的共享知识资产。

5. **两步范式（探索→执行）将推理与知识生成解耦**
   Native Evolution Phase 和 Knowledge-Enhanced Execution Phase 分离设计，使得知识可离线积累、版本化管理、跨任务复用——这是从"每任务即时推理"向"知识积累驱动"范式转变的核心标志。

## 实践启示

1. **在 Web Agent 流水线中嵌人环境探索阶段**：参考 Native Evolution Phase 的 Plan-Explore-Summarize-Refine 循环，让 Agent 在处理下游任务前先用少量步数扫描页面结构，生成环境摘要后再执行具体任务，可显著减少执行步数和错误率。

2. **用 Outcome-Based Reward 而非过程奖励评估知识质量**：R(K) = Success(T_E|K) - Success(T_E|∅) 的设计避免了让 teacher 对探索每步打分，直接衡量"知识最终有没有用"。实践者可将此公式迁移到任何知识压缩场景，只关心下游任务收益。

3. **建立知识长度-质量帕累托曲线**：通过实验找到当前任务域的 8k-16k 最优区间，建立知识压缩预算的工程基线。过长知识引人收益递减，过短则丢失关键环境结构，平衡点是持续迭代的工程参数。

4. **设计 SFT + RFT 两阶段训练流程**：先用强 teacher 生成 expert trajectory 建立基础能力，再用模型自探索扩展知识多样性，两轮 RFT 中第一轮收益最显著，第二轮边际化——可据此控制训练成本。

5. **将 World Knowledge 视为可版本化的共享资产**：静态 Markdown 格式天然支持 Git 版本化管理，后续可引人动态更新机制（定期 re-explore + diff 合并），使环境知识随网站结构演变保持新鲜度，而非一次性生成后僵化。

## 相关实体
- [Cisco Preps For A World Of Ai Agent Coworkers Frontier Model Threats](ch04/150-ai.md)
- [Tencent Skill Writing Complete Playbook Jackjchou](ch04/245-skill.md)
- [Agent Self Improvement Six Mechanisms](ch04/503-agent.md)
- [Llm Agent脚手架如何具备自进化能力以Hermes Agent为例](ch04/503-agent.md)
- [Deli Auto Research Skill Deepseek](ch04/245-skill.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/world-knowledge-agent-self-evolution-tencent-hkustgz.md)

---

