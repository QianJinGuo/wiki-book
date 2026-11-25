# Making Claude a chemist

> 📊 Level ⭐⭐⭐ | 10.8KB

## 深度分析

### 1. 化学工作流的本质是表征翻译
化学家的日常是在多种表征之间反复切换：白板上的手绘结构、仪器读数、SMILES 字符串、专利与论文的专业记法——同一分子在不同记法下需要不同的"流利度"。手绘咖啡因能看出它与腺苷的相似，却区分不了外观几乎相同的分子；重排几根键，葡萄糖变成代谢路径全然不同的果糖；镜像翻转，镇静剂变致畸物。这种翻译在规模上不可持续：CAS 已收录超 2.9 亿个已公开物质，每天新增约 1.5 万个。机器学习工具在逆合成等领域被寄予厚望多年，却被数据问题拖住——null 结果缺失、格式不一、支撑信息锁在付费墙后，普通学术或小实验室至今未普遍采用。前沿多模态模型改变的是"哪些问题在数据困境下仍然可解"：直接从期刊插图或手绘草图读取结构、按实际发表形式读方法部分、以可审计的逐步推理展示过程。

### 2. 评估设计：无污染样本与脚手架分层
基准设计本身和分数一样有启发价值。20 个正向预测化合物全部取自模型训练截止之后发布的 ChemRxiv 预印本，避免"背过文献"造成的选择偏差；再按四类骨架各五个分层，每类隔离一种 NMR 失效模式：氯哒嗪的慢交换 NH、炔酰胺的 α/β-碳对、螺环酮的非对映异位 CH₂、α-硅基的屏蔽碳。非确定性处理：每个 Claude 模型每化合物跑三次取平均，确定性经典工具只跑一次；容差沿用化学家惯例 ±0.20 ppm（¹H）与 ±1.0 ppm（¹³C）。结果上 Opus 4.7 氢谱平均误差 ±0.079 ppm（不到容差一半），碳谱与 MestReNova 基本打平（±1.37 对 ±1.48）。更能拉开差距的是二阶结构信息：三个 Claude 模型预测亚峰间距落在 ±0.5 Hz 内的比例约 80%，而 ChemDraw 和 MestReNova 只有 26–35%——峰形与峰间距本身携带结构信息，恰是通用模型读"全文语境"的优势所在。

### 3. 逆问题才是智能体设计的试金石
正向预测是现有软件做的事，结构解析（structure elucidation）才是化学家做的事：专用软件需要 2D NMR、专门训练和授权许可，而 Claude 只用化学家会直接粘贴进对话的输入——HRMS 精确分子式加 1D 峰列表，零配置、零微调。15 道解析题各跑三次、每次最多三个排序候选：八个较简单目标（单环或双片段）仅凭谱图与分子式，每次尝试都解出；七个更稠密的目标（稠环、螺环）需要一条锚定提示——反应的起始原料结构，否则模型会在推理中循环而不肯收敛到一个答案。对智能体工作流的启示：困难逆问题需要的是上下文锚点而非更多原始证据，提示工程在这里就是任务设计。

### 4. 基准谦逊与按可测性排序的路线图
作者对数字的克制本身就是方法论样本：20 与 15 都是小子样，每条骨架只贡献一类失效模式；慢交换 NH 杂环仅经氯哒嗪采样（羟吡啶等 DMSO-d₆ NH 活性骨架未覆盖）；2D 实验（COSY/HSQC/HMBC）与立体化学因 1D NMR 无法定构而出圈；溶剂只测三种。提出的扩容方案——数百化合物、20–30 类骨架、每类至少 15 个以分离类内方差与工具间差异——是任何领域评估都能套用的模板。路线图点出四大瓶颈：结构读取与渲染、合成路线推理、机理阐释、文献理解；它们成熟度不同——谱图分析已可基准化，逆合成规划仍在界定范围——领域 AI 投资应按"什么先可测量"排序，而不是按想象中的重要性排序。

## 实践启示

### 1. 领域 AI 的落地速度更快
如果需要 AI 在特定领域达到专家水平，领域专精 AI 比通用 AI 更快、更经济。

### 2. 领域评估是领域 AI 的关键
投资领域专家设计的评估集——评估质量决定领域 AI 的进步速度。

### 3. 领域 AI + 通用 AI 的组合策略
用领域 AI 做专业任务，通用 AI 做跨领域任务——两者组合优于单一模型。

## 相关实体
- [Www.Infoworld 4171274 Anthropic Puts Claude Agents On A Meter Across Its Subscri](https://github.com/QianJinGuo/wiki-public/blob/main/entities/www.infoworld-4171274-anthropic-puts-claude-agents-on-a-meter-across-its-subscri.md)
- [Anthropic Pm Jess Yan Managed Agents](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-pm-jess-yan-managed-agents.md)
- [Anthropic Claude Managed Agents Platform 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-claude-managed-agents-platform-2026.md)
- [Claude Code Hackathon Winners 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-hackathon-winners-2026.md)
- Claude Code Harness Deep Understanding

→ [原文存档](https://www.anthropic.com/research/making-claude-a-chemist)

> *Score:  = 49 | stars=4 | Anthropic官方研究博客，介绍Claude在化学领域（特别是NMR谱图分析）的应用，提供了AI+化学领域的数据挑战背景和具体用例，但核心技术细节（Claude vs ChemDraw对比）在外链PDF中，文章本体偏概述。*

_Summary: We’re working with world-class synthetic, computational, and analytical chemists to make Claude better at chemistry. In this post, we share our first work as part of this effort, in which Anthropic chemist, David Kamber, examines how Claude performs on a chemist’s most common analytical input, an NMR spectrum._ When working with molecules, chemists move between hand-drawn structures on a whiteboard, instrument readouts, database query strings, and the technical notations of patents and publications. Each of these representations encodes the same underlying chemistry, but each demands a different kind of fluency. A sketch of caffeine, for example, allows a chemist to spot its resemblance to adenosine, the body’s drowsiness signal, and predict that it keeps us alert by blocking the receptor. However, that same sketch cannot help a chemist tell it apart from other near-identical looking molecules.

Understanding what molecule a chemist is working with is critical. Chemistry undergirds everything from the foods and medicine we ingest to our lotions, paints, and plastics. Reroute a handful of bonds among the same atoms, and glucose becomes fructose, molecules sharing a formula but processed through entirely different metabolic pathways. Flip a molecule into its mirror image, and a sedative becomes a teratogen, as happened in the [thalidomide](https://pubmed.ncbi.nlm.nih.gov/21507989/) disaster.1 Chemists’ everyday work depends on reading these signals correctly across whichever representation befits a given task.

Translating between these representations (chasing down a structure from a figure, reconciling an instrument readout against a proposed product, querying a database in the right notation) is time consuming and impossible to keep up with at scale—CAS, the largest chemistry registry, catalogs over 290 million disclosed substances and grows by roughly 15,000 new ones every day.

AI is well-positioned to take on this research burden, yet it still remains largely aspirational in the context of chemistry. Machine-learning tools have been positioned for years as transformative for retrosynthesis—the process of working backward from a target molecule to simpler precursors to plan how to build it—reaction prediction, and property estimation, but the data those tools need have been hard to come by—sparse on null-results, inconsistent in format, and locked behind paywalls at subscription journals (and in unstructured supporting information). Retrosynthesis is a case in point—capable AI tools have existed for years, but adoption is uneven, and the average academic or small-lab chemist still doesn't use them.

Even so, advancements in AI are finally reaching chemistry. Today’s frontier models are multimodal, and capable of explicit reasoning. They can read a chemical structure directly from a journal figure or hand sketch rather than depending on a pre-curated molecular database. And they can read the experimental detail of a methods section or supporting information in the form it is actually published. They can also show their reasoning step by step, which means a chemist can audit the outputs. None of this eliminates the data problem the field has been describing for years, but it changes which problems are tractable despite it.

Ultimately, our claim is a modest one: Claude is starting to meaningfully assist chemists with the daily translation, recall, and integration work that complements their judgment, and we plan to keep extending its helpfulness. Today we are publishing the first white paper in the effort to accelerate this work. It tackles a chemist's most common analytical input: an NMR spectrum.

## Claude vs. ChemDraw on NMR prediction and structure elucidation

**Full version can be found [here](https://www-cdn.anthropic.com/07441e654ad3dfeb0cd090e9361511562825d012.pdf)**

Nearly every small molecule—drug, pesticide, dye, fragrance, polymer, DNA or protein subunit, and functional inorganic or solid-state material—exists because a chemist determined its structure. Given that these molecules cannot be seen with microscopes, chemists must rely on spectral analysis, probing a molecule with light, radio waves, or magnetic fields. The way a given molecule absorbs, emits, or deflects this energy gives chemists a pattern, or spectrum, with which they can elucidate its structure.

NMR spectroscopy—one of the canonical techniques chemists rely on for this—is one of the most time-consuming steps in synthetic chemistry; for every compound, a chemist has to match each peak in the spectrum to an atom in the proposed structure by hand.

---

