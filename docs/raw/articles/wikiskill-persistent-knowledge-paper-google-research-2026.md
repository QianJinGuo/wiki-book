---
title: "WikiSkill: Compiling Agent Experience into Persistent Knowledge for Skill Evolution（Google Research 论文原文 PDF）"
source_url: "https://arxiv.org/abs/2608.27454"
author: "Liyan Tang, Cyrus Rashtchian, Chun-Sung Ferng, Andrew Tomkins, Da-Cheng Juan, Tu Vu"
publisher: "Google Research"
published: 2026-08-27
ingested: 2026-09-03
language: en
type: raw-article
sha256: 66d507e2ff9cf01a7f1bf661313fe578b764d32426bc4db91952a00eb02ebf7a
---

# WikiSkill: Compiling Agent Experience into Persistent Knowledge for Skill Evolution

> arXiv:2608.27454v1 [cs.AI], Google Research + Virginia Tech，2026-08-27。
> 用户投喂论文原文 PDF（第一手 arXiv 源，28 页）。

## 核心命题

Agent skill 打包特定领域的程序性知识与工作流，成为扩展 Agent 能力的可复用资源。近年工作已能从 Agent 执行经验中自动发现技能，但**引导技能开发的经验洞察散落在各轮优化历史中，难以跨迭代系统性复用**。WikiSkill 提出一个让「Agent 技能」与「持久知识库（wiki）」**协同进化**的框架：把原始执行经验、已累积知识与可执行技能三层分离，持续把经验沉淀为 wiki，让后续技能更新建立在累积知识之上。

## 三层架构

1. **Raw Layer (raw/)**：存每轮训练回放产生的不可变执行轨迹（推理、工具调用、工具输出、最终答案）。供 Wiki Maintainer 与 Skill Proposer 分析，**只写不改**。
2. **Wiki Layer (wiki/)**：把原始轨迹编译为结构化、持续累积的知识。含 pattern 目录（每份 markdown 记录一种失败模式/成功策略及可操作解决方法）、logs.md（每轮发现摘要）、skill-impact.md（每个提案的 diff、验证分数、接受/拒绝结果，由外层 harness 在门控后程序化更新）。**跨轮永不重置**——被拒提案、重复错误、演化历史都保留，供后续提案避免重复踩坑。
3. **Skills Layer (skills/)**：当前生效的进化后技能集。每技能目录含 SKILL.md（技能全文）与 PURPOSE.md（由哪些 wiki pattern 催生、经历过什么演化）。

## 四步循环（四组件）

1. **Inference Agent**：用当前技能集在训练集上跑回放，产出不可变轨迹。**执行阶段禁止读 wiki**（消融证实执行时读 wiki 反而降性能——直接从 wiki 取答案会让轨迹对技能改进欠具信息量）。
2. **Wiki Maintainer**：从训练轨迹采样子集（≤8 条：≤5 失败找根因 + 3 成功提策略，单条日志截断 15000 字符），做根因分析 + 提炼成功策略；创建/更新 pattern 页、修订 index.md 目录、追加 logs.md。patches 增量式编辑。
3. **Skill Proposer**：独立 AI，ReAct 多轮模式主动行动——先读 wiki 索引、skill-impact.md、训练结果摘要，再按需 read_file 读具体 pattern 页与 raw 轨迹诊断根因，产出**单个聚焦提案**（新建技能或对现有技能增量 patch）。上下文窗口友好（不被动灌全部数据）。
4. **Gating and Rollback**：候选技能在验证集评估，仅当 R(Tval) > Rbest 才接受（保留新技能并更新阈值）；否则回滚技能集。**wiki 永不因接受/拒绝回滚**。验证后外层 harness 程序化向 skill-impact.md 追加提案元数据/diff/分数/结果。

## 实验设置

- 5 基准：LiveMath（数学推理）、SealQA（网络检索问答）、SpreadSheet（表格操作）、OfficeQA（长文档问答）、ALFWorld（嵌入式具身任务）。
- 5 模型：Qwen-3.5-4B/9B、Qwen-3.6-27B、Gemma-4-31B、Gemini-3.5-Flash（开源的经 vLLM 部署）。
- 对比：Trace2Skill、EvoSkill、SkillOpt + 无技能基线。每次完整演化独立重复 3 次取测试平均，配对 bootstrap (p<0.05, 1000 iterations)。

## 主结果

- **全面领先且更稳**：与各模型最强对比方法比平均分高 3.3 / 5.1 / 10.0 / 5.8 / 12.0（Qwen-4B/9B/27B、Gemma-31B、Gemini-Flash）。Gemini-Flash 在 LiveMath 33.0%→72.6%，SpreadSheet 50.5%→76.6%；Qwen-27B 在 ALFWorld 52.8%→77.6%。对比方法不稳定：EvoSkill 在 LiveMath 提 Qwen-9B (28.2→58.1) 却拖累 Gemma-31B (33.9→29.8)；SkillOpt 在 SealQA 拖 Gemini-Flash (29.4→28.2)。
- **提升随模型规模增大**（互补 scaling）：Qwen 家族 +12.3 / +17.5 / +23.9（4B/9B/27B）。SpreadSheet 上 27B 比 4B 多赚约 34 个百分点（+40.9 vs +6.5）。
- **技能可弥补模型规模**：Qwen-3.5-9B 配 WikiSkill 平均 47.4% 超 Qwen-3.6-27B 无技能 39.4%；Qwen-4B 配技能也有 38.5%。
- **跨数据集差异**：LiveMath 全 5 模型受益（+20.6~39.6）；SpreadSheet 提升最大（27B +40.9）；OfficeQA 例外——长上下文检索流程大模型善用（27B +11.6、Gemini-Flash +12.1），Qwen-4B 丢多步指令退回默认阅读反而略降。

## 跨模型迁移（Table 2）

- **迁移常有效甚至反超自炼**：Qwen-27B 技能把 Qwen-9B 在 SpreadSheet 带到 50.5%（无技能 24.3%、自炼 33.6%）；把 Gemma-31B 在 LiveMath 带到 73.7%（无技能 33.9%、自炼 56.7%）；Qwen-9B 用 Qwen-27B 技能在 ALFWorld 70.2% > 自炼 63.4%。**小模型技能也能帮大模型**：Qwen-4B 技能让 Gemma-31B 在 LiveMath 73.1%、ALFWorld 66.9%。
- **负迁移真实存在**：Qwen-4B 技能把 Gemini-Flash 在 SpreadSheet 从 50.5% 打到 18.1%。两因：①4B 技能编码低层绕行技巧（单行 Python 命令、字符串转换规则）束缚强模型写完整端到端脚本；②碎片化诊断流程产生冗余工具调用、用光交互预算。
- **技能发现 vs 执行是两种能力**：OfficeQA 上 Qwen-4B 技能降自己 (30.2→28.5) 却提 Qwen-27B (42.1→52.9)。跨模型把这两种能力分离：发现（从经验提炼程序性知识）与执行（推理时用出来）。迁移好坏取决于技能捕获的是通用流程还是模型特定 workaround。

## 消融：持久知识库值多少（Table 3，Gemini-Flash）

| 配置（Inference Agent / Skill Proposer wiki 访问） | Avg |
|---|---|
| 无技能基线 | 40.4% |
| 只有 Inference Agent 读 | 45.3% |
| 都不读（无知识累积） | 48.7% |
| 都读 | 60.9% |
| 默认：只有 Proposer 读 | 63.7% |

- **wiki 对提案至关重要**：Proposer 能读 wiki 时 48.7%→63.7% (+15.0)。
- **执行阶段读 wiki 反而有害**：都读 vs 默认 63.7%→60.9%（LiveMath 72.6→64.8）。推测：执行时直接拿 wiki 答案让轨迹欠具信息量。

## 案例（ALFWorld，Qwen-27B）——知识复利

- Iteration 0：Identified basic looping（take-examine-move-loop.md），Proposer 提 goal-directed-action（过抽象，验证 0.72 被拒，但 diff+拒绝保留在 skill-impact.md）。
- Iteration 1：参考拒绝历史创建 break-repetition-loop（具体规则「Never Return an Item to Its Origin Location」，验证 0.78 接受）。
- Iteration 2-4：新循环变体（multi-operation-loop）涌现，wiki 累积新证据，Iteration 4 给技能补第二条规则「Each Operation Type ONCE Per Item」。
- 链条：失败 → 沉淀 → 借鉴 → 更好技能 → 再失败 → 再沉淀。

## 技能/wiki 统计（Table 4）

- Qwen 模型产较长技能（118.9-128.6 行），Gemma-31B / Gemini-Flash 更紧凑（45.1 / 81.2 行）；wiki pattern 跨模型创建 6.3-8.9、编辑 7.0-18.4。
- SpreadSheet 技能最长（142.5 行）、wiki pattern 最多（9.8）；LiveMath 技能最短（84.6 行）、pattern 最少（4.4）。
- 首阶段（Iter 0-1）占接受更新的 39%-52%（模型）/39%-58%（基准）；SealQA 中 33% 中段 + 28% 后段——技能随迭代持续精炼。

## 局限（Future Work）

1. **技能检索未解决**：把全部技能全文注入 prompt，不评估检索/触发——技能数量增长后成本高，需检索机制。
2. **严格门控**：只接受即时提验分的提案，排除「当前持平但未来有用」的改动，可能错失长期价值。
3. **wiki 缺乏修剪机制**：持续膨胀，长运行时可能信息过载，无自动化清理/汇总。
4. **未覆盖超长任务**：虽含多步交互与长上下文，未涵盖数百步/数小时的超长时间任务；在线技能适配是未来方向。