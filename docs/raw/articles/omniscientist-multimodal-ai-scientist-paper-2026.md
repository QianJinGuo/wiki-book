---
source_url: /Users/jinguo/.hermes/cache/documents/doc_5b7aff4258ba_OmniScientist.pdf
source: pdf
title: "OmniScientist: An Omni-Modal Omni-Discipline AI Scientist"
ingested: 2026-08-25
type: raw-article
tags: [ai-scientist, omniscientist, multimodal, ai-for-science, scientific-discovery, research-agent, raw-data, evidence, perception, nus, oxford]
sha256: 7c9878ebfa6b58b4d1a0b5a482dfdefdb004a50b4f2bca29154f5b149d425331
---

# OmniScientist: An Omni-Modal Omni-Discipline AI Scientist

> Bobo Li¹, Hao Fei²*, Tianjie Ju¹, Mong-Li Lee¹, Wynne Hsu¹（¹新加坡国立大学 NUS，²牛津大学 Oxford）
> arXiv:2608.13558v1 [cs.AI] 13 Aug 2026
> Project page: omni-scientist.github.io · GitHub: Omni-Scientist/OmniScientist

## Abstract 核心主张

Recent advances in foundation models 让 AI scientist 能自动化越来越完整的科研工作流（假设生成、代码执行、稿件撰写）。但 workflow coverage alone 不提供科学发现所依赖的完整证据。现有系统通常只在 text、code、labels、precomputed summaries 上推理，把空间、时间、跨通道、过程性关系（spatially decisive）留给了 agent。OmniScientist 提出 end-to-end、omni-modal AI scientist，**直接从异构原始证据（raw evidence）做跨学科研究**：一个 perception layer + 3 个自主 agent（ideation/experiment/writeup）在确定性管线内运行，让观测塑造研究问题、实验决策和最终结论。

通过把 idea、rigour、claim checks 写进代码强制执行，系统保障 novelty screening、统计有效性、执行溯源、数值可追溯。在 **36 个真实数据案例、5 大学科家族、4 类科学证据家族**、模态覆盖 images/signals/audio/video/3D structures/trajectories/tables/formulae/graphs 上评估。系统在全部 36 个案例完成从原始数据到成稿论文的完整路径，参考推理骨干下平均论文得分 **6.3**。与只接收预计算标量特征的盲眼变体对比，直接感知在全部 7 个评测维度提升，赢得 **85% 两两对比**。结论：lifecycle-wide perception 对证据接地科学发现至关重要。

## 研究动机：Workflow-complete 但 Evidence-incomplete

现有 AI-scientist pipeline 通常通过 text、code、labels、summaries 暴露数据——agent 在探究开始前就继承了人选的表示。这个接口限制了它能注意到的异常、能构想的假设、能支持的结论。现有系统越来越 workflow-complete，却 evidence-incomplete。

强多模态模型本身不解决这个差距：科学多模态基准通常预先固定观测和问题；科学 agent 用感知一般只在局部阶段（检查生成的图、给图打分、读界面、监控装置），不能建立"观测能重定向研究"的研究循环。

Lifecycle-wide perception 需要有控制结构保留溯源、强制统计和事实约束——因为更宽的观测和搜索空间也放大了数据泄漏、重复测试、HARKing（结果已知后假设）和未支撑报告的空间。

## 4 类科学证据家族（Table 2）

按解释所需的主要推理方式分组，跨学科不变：
1. **Perceptual（感知类）**：images, video, micrographs, radar, 天文/遥感影像、科学图的视觉形式、audio、3D structure
2. **Symbolic（符号类）**：自然语言文档、公式、变量、规则、序列、知识图谱、逻辑/因果关系、数学模型
3. **Quantitative-statistical（量化统计类）**：tables、measurements、distributions、curves、correlations、显著性检验、回归结果
4. **Procedural/dynamic（过程类）**：实验步骤、代码执行、agent traces、simulations、动态演化、protocols

关键洞见：这些产物都能被序列化成 token 或通过代码访问。**关键问题不是"什么能被序列化"，而是"哪些关系能幸存于接口"**。caption 作文本摘要会丢失病理图块、Sentinel-2 场景、三分量地震图的局部空间结构；无序标量摘要会丢弃迁移轨迹和模拟的时间顺序。

## 任务设定与演示套件

任务以单一 specification file 呈现：指定 dataset、scientific subject、target property 及对应原始数据，系统被指示产出证据接地论文，方法学完全交给 agent。演示套件含 **5 个顶层学科类别、36 个二级案例**，每案例一个真实可公开下载的数据集（含规范引用）。规模从 12 个符号回归方程到 500 万边的生物医学知识图谱。感知类占 28/36 案例，其余 8 个符号/量化/过程类作为广度控制。

跨学科泛化：扩展到新学科只需写一个 specification file，核心引擎完全不变——同一套感知/构想/实验/写作循环无缝运行在地震图、CAD mesh 或知识图谱上，无需一行领域特定代码。

## OmniScientist 框架

### 4.1 Perception layer（感知层）

多模态 AI scientist 必须直接在原始产物上感知，先于任何预计算摘要。感知层分层组织观测：先把产物按推理范式归类到证据家族，家族内 modality 定义产物的精确表示（image/table/time-series signal），agent 用注册工具检查。为平衡深入分析与计算效率，框架控制何时/如何检查原始数据：agent 优先做原生数值分析（直接从原始产物提取 FFT 峰值、趋势点），只有空间/结构模式必要时才调用视觉渲染；视觉感知预算受限防不必要处理。任务上下文动态决定用原生数值特征、视觉表示或两者。

### 4.2 Ideation（构想阶段）

ReAct loop 驱动 agent 自主排序发现过程：建立 grounding（材料清单 + 决定是否检查原始观测）→ 通过 OpenAlex（Crossref 兜底）检索文献 → 开发至少 5 个候选 idea，评估各自 novelty 风险和可行性 → 选最强候选定稿。stage output 必须通过 code-enforced check：验证结构完整性（研究问题、假设、实验草图、证伪标准）、生成过程充分性（5 个自过滤候选 + 至少 3 次聚焦文献检索）、可执行性（须 code 可执行、不需物理实验）、泄漏检查、有效样本量估计、视觉审计。系统自动把 overconfident 措辞（如 first/never explored）改写为 appears under-explored based on this search。

### 4.3 Experiment（实验阶段）

agent 自主把定稿 idea 翻译成方法设计并通过迭代代码生成实现。用受控 run_python 环境管理子进程执行和图捕获，持续调试循环。用感知层检查原始输入数据或验证自己生成实验图的结构模式。为稳健，实验设计含至少 4 个分析（主假设检验 + baselines/ablation/mechanism probes/sensitivity sweeps 等对照）。

迭代执行结束后，code-enforced exit check 验证结果溯源和统计有效性（Algorithm 1）：确认 agent 真实访问数据集、生成图与原始执行痕迹匹配；强制多重比较校正（考虑调试循环中尝试过的每个测试，防人为缩小校正分母）；post-hoc rescue guard（headline 必须来自主测试）；独立性检查（消除循环预测）；未支撑分析降级到执行轨迹。图 5 把此检查和后续 claim check 排布成顺序，都针对同一 execution record（而非 agent 写的文本）审计。

### 4.4 Writeup（写作阶段）

携带 5 个结构规格固定每种 venue 风格的骨架和长度：ML 论文带 Related Work/Limitations，生物医学论文末尾加 Methods，化学论文合并 Results/Discussion。风格从案例规格解析或从主题推断，与科研领域解耦——同一引擎按各领域惯用 idiom 写地震研究和材料研究。起草从节级大纲展开到完整段落，每节只从结构化实验记录的对应切片扩展（方法细节到 method/data 节、决定性数字到 results 节、一节不能引入从未给过的细节）；abstract 最后写所以数字与正文一致。确定性机制：thesis planner 从受支撑分析选 headline claim，其余结果分配给支撑证据/对照/稳健性检验；references 通过 OpenAlex API 检索；输出 pass 过滤草稿（剪太多则回滚）；最终 meta-audit 检查生成 claim 对实验记录（图 5），再编译 PDF。

## 三阶段检查（Idea/Rigour/Claim Checks）

围绕开放 agent 的确定性薄管线控制阶段转换：实验崩溃或产生 null 结果时返回 ideation，每阶段输出只有通过 code-enforced check 才被接受。
- **Idea check**：novelty 证据、可证伪性、结构完整性、生成充分性
- **Rigour check**（Algorithm 1）：真实执行（必须实际运行代码）、每个数字可溯到真实输出、数据集从磁盘加载、多重比较校正（含 demoted tests）、anti-HARKing（headline 必须来自受支撑分析）
- **Claim check**：报告数字(n₁…nₖ)匹配记录输出、报告 claim(C₁…Cₘ)匹配记录分析(E₁…Eₘ)，全部 traced to record——execution record 作为两检查的 source of truth

## 评测设置

**模型**：三角色跑在独立模型上。reasoning backbone 驱动全部 3 阶段且是唯一被换的组件。主运行用 Claude Sonnet 5，对比 GPT-5.6、GLM-5.2、Kimi K2.7、开源 Qwen3.5（9B/27B/122B）、Gemma-4（26B/31B）。perception model 固定为 Claude Sonnet 5（不跟随 backbone），保证每次看原始观测由同一模型服务、分数变化可归因于推理。评分由 2 个家族外 judge（deepseek-v4-flash、gemini-2.5-flash-lite）完成。

**参数**：ideation 最多 24 agent steps、8 次文献查询，视觉预算 min(24, max(8, 2g))（g=label groups 数）；experiment 最多 50 steps、8 次视觉检查，run_python 每次 150 秒超时；最多 2 次回退到 ideation；文本生成每调用上限 8000 token。完整 3 阶段执行成本 $0.03–$4.34（取决于 backbone），experiment 阶段占大头。每次完整运行输出结构化 JSON、Markdown 摘要、可重放执行轨迹、编译 PDF。

**指标**：7 维度 0-10 分——5 个标准同行评审标准（novelty/soundness/clarity/significance/reproducibility）+ 2 个任务特定（multimodal grounding/factual accuracy）。composite=7 维均值。分数与稿件长度相关性极小（ρ=0.16），抗 verbosity 偏差。Sonnet 5 全套件最稳定，定为 primary backbone。

## 主要结果（Table 3/4）

- **端到端质量高且跨 top LLM backbone 一致**：Sonnet 5 Overall 6.3（7.7 factual、7.0 soundness/clarity、6.3 novelty/significance、6.1 reprod、5.1 MM-grnd）；GLM-5.2 6.5、Kimi K2.7 6.2 接近；小模型（Qwen3.5-9B 4.0、Gemma-4-26B 4.2）明显下降。clarity 退化最小，factual accuracy/soundness 最贴 backbone 强度。
- **backbone generality**：Sonnet 5 36/36 完成、mean 6.5；Qwen3.5-27B 36/32、5.3；Gemma-4-31B 36/32、5.0；GPT-5.6 36/9、5.7（只在子集测）。

## 盲眼消融：直接感知的必要性（Figure 7）

对比完整系统与接收预计算标量特征、从不访问原始观测的盲眼变体：**完整感知提升每个评测维度，最大增益在 multimodal grounding 和 scientific significance，其论文赢得 85% 两两对比**。增益出现在论文的科学实质：选择的问题、执行的分析、被证据支撑的结论。

## 代表性发现（证据接地展示）

- **地震学**：从 750 条被标为噪声的 STEAD traces 中发现 21.7%（163/750, CI [18.8,24.9]）实际携带相干瞬态信号
- **病理学**：看到单 tile 内纹理和核密度变化 → held-out 复杂 tile 分解为肿瘤/基质/淋巴混合物（p=0.34）
- **Galaxy 跨巡天**：同星系在两个巡天深度成像 → 形态学读数成立 83.8% vs 81.0%（McNemar p=0.63, κ=0.75）
- **拉曼光谱**：主导带随激发波长变化 → rank order 在主导带持续时保持 0.77、交换时 0.23（n=218）
- **海洋生物声学**：时间带宽积单独恢复 32 物种功能分组
- **生态声学**：低频能量淹没频带 → detector AUC 0.73→0.58（最到最少掩蔽三分位）
- **气象**：两个雷达细胞漂移合并 → 合并比对照多 +9.65 VIL-units/5min（p=3.2×10⁻¹⁴）
- **渔业**：位点解释 81% 的 range-density slope 方差（H=84.8, p<0.0001）
- **符号回归**：Cramér–Rao 形式匹配测量指数方差（8/8 定律）
- **无监督结构**：1,500 个零件、尺度不变描述符、无监督聚类出 4 个 morphotypes
- **评测陷阱**：常规随机划分隐藏泛化差距，leave-one-family-out 误差比 k-fold 报告高 3.1×–7.0×
- **元数据泄漏**：记录协议本身泄漏标签，0.60→0.35 崩溃出源

## 机制分析

直接感知会影响**问题选择、实验设计乃至最终研究路径**，而不只是让论文写得更好——"看见"原始数据直接改变 AI 做什么研究。
