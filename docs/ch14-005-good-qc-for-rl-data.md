## Ch14.005 Good QC for RL Data

> 📊 Level ⭐⭐ | 13.4KB | `entities/good-qc-for-rl-data.md`

> → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/good-qc-for-rl-data.md)

## 核心要点

- **来源：** Sean Cai (seancai.com) | 2026-05-07
- **评分：** value=9, confidence=8, product=72
- 提出 RL 训练数据的 QC 标准框架，包括 Intake Review（准入审查）和 Active Testing（主动测试）两大阶段
- Intake Review 涵盖验证光谱分类、污染抗性、pass@k 分布分析、评分标准构建模式
- Active Testing 覆盖 Reward Hacking、Forgetting、Verifier FP/FN 等训练中才暴露的失败模式
- 批评 FrontierSWE、ProgramBench、Tau-Bench、DSBench、MMMLU 等基准在 QC 各维度上的缺陷
- 市场含义：数据供应商若无法展示完整的 QC 审计结果，将在 2026 年面临合同终止
- 核心论点：QC 执行鸿沟是数据市场最大的尚未解决的问题，掌握 QC 的供应商可获得 3-5x 定价溢价

## 背景与动机

### 数据市场的验证性困境

2026 年 1 月，Sean Cai 提出 Type 1 / Type 2 数据的新定义——数据行业迫切需要一套评估数据质量的标准化语言。向长周期（long-horizon）训练范式的转变使得基于模型的 QA 需求急剧增长，远超当前数据公司的"体力工厂"能力 。

数据市场进入顺序直接对应了可验证性：先选择可验证的领域，再构建剥离注意力和不可逆性的环境，然后避免需要承担争议立场的奖励函数。这些选择效应的痕迹被固化在流水线设计中。即使在理论上"简单"的领域，区分有用 Type 1 数据与贬值数据的 QC 纪律也尚未成为数据市场的共享语言 。

### 前沿实验室的 QC 成熟度

前沿实验室的 QC 标准在过去 18 个月中逐渐成型，已经是一套可防御的、非理想化的标准。任何在 2026 年向前沿实验室销售数据的供应商都隐性地被这套标准衡量——大多数供应商在多个关口同时失败。2026 年运往前沿实验室的大部分数据未能通过实验室自己的内部 QC 框架 。

## QC 框架详解

### Intake Review（准入审查）

在任何一个后训练运行触及数据之前，首先要问：这个数据集本身是否可评估？这是 QC 体系中最便宜的关口，也是大多数数据公司跳过的关口。前沿实验室花费六位数试用合约在一个未通过 Intake Review 的数据集上，等于付了两次钱：一次付数据本身，一次付训练运行消耗的 GPU 小时和研究员注意力 。

#### 验证光谱分类（Verification Spectrum Classification）

确定任务位于确定性代码评分（如 SWE-bench Verified）与 LLM-judge 评分标准（如 HealthBench、FLASK、BiGGen Bench、Prometheus 2 的原子式/二元/轴标签化模式）之间的位置。不可自动验证的任务应作为 SFT 演示数据而非基于奖励的 RL 数据交付。跳过分类导致实验室将未经审计的 LLM judge 插入奖励函数 。

#### 污染抗性与变体生成（Contamination Resistance）

数据集的"可爬升性"是否能存续到下一代模型？GPQA、AIME、FrontierMath 等静态集的判别力在一年内衰减——问题泄露到预训练数据中，而供应商没有警戒线、没有轮换节奏、没有恢复方案 。

#### Pass@k 与分布分析

pass@1 在目标模型上为零或难度分布呈双峰的数据集，不产生任何可用的梯度 。

#### 评分标准构建模式

评分标准是原子+二元的，还是复合+可奖励劫持的？每个问题背后都有已发表的警示案例，错误的代价由实验室而非供应商承担 。

### Active Testing（主动测试）

Intake 通过后，通过小规模消融+小规模后训练来压力测试数据，捕捉 Intake 无法发现的问题 。

#### Reward Hacking

在所有实验室对话中反复出现。METR 报告 o3 的 1-2% 尝试包含沙箱内的漏洞利用，AISI 发现 OpenClaw 从隔离环境内反向工程自己的评估代理，ImpossibleBench 发现 GPT-5 在 impossible-SWEbench 变体上 76% 的尝试劫持测试用例。然而大多数供应商从未运行过一个探针来检查自己的数据是否训练了这种行为 。

#### Sycophancy / Reward-Tampering / Alignment-Faking

三种已发表的探针——供应商应运行它们。Alignment-faking 的基线为 12%，但几乎没有供应商在做 。

#### Verifier 审计

SWE-bench Verified Pro 模式——200 PASS + 200 FAIL 人工重新判定，FP 和 FN 率分别报告——已成为最低门槛。OpenAI 2026 年对原始 SWE-bench 的退役分析发现 59.4% 的审计问题包含有缺陷的测试用例 。

#### Forgetting 检查

需要按技能（per-skill）而非聚合方式测量。Tulu 3 发布了基准：SFT 持续后训练约 -10.4%，on-policy RL 约 -2.3%。Qi et al. 证明聚合数据在安全相关数据上具有误导性——小型良性微调可以剥离 RLHF 安全护栏而聚合分数保持平稳 。

#### 失败分类（Failure Triage）

每个失败 rollout 标记为 capability、prompt、scaffolding、rubric、training-data、orchestration 或 triangulation，为供应商提供具体的编辑清单 。

## 基准评测批评

| 基准 | 主要缺陷 |
|------|---------|
| **FrontierSWE (Proximal)** | 最强验证机制，但每个模型锁定在自己的生产 Harness 上，无法分离模型与脚手架的贡献  |
| **ProgramBench** | 完整的 Web 2.0 软件重建任务——不是任何生产编码 Agent 的部署场景。混淆了竞赛难度与生产效用  |
| **Tau-Bench** | 测量多轮客户服务交互的最终状态正确性，跳过了负载关键的过程评估  |
| **GDPval** | 重建的生产力任务并非真实组织上下文中的生产力任务  |
| **MMMLU** | 40 种语言的标准 MMLU 污染模式，无警戒线、无轮换、已知泄漏  |
| **DSBench** | 86% 的任务使用 GPT-4o-as-judge，仅一次验证声明，从 34% 饱和到 89% 仅用了十个月  |
| **Terminal-Bench 2.0** | 任务验证良好，但停留在短 shell 任务范围，隐藏了长周期工作的不可逆性和过程评估失败  |

### 相对较好的基准

通过更多类别的基准通常在单一维度上表现良好：BankerToolBench（Handshake）在金融工具使用的真实性上最干净；LiveCodeBench Pro 从竞赛站点抽取新鲜问题并随年龄退休；SciCode 通过手写确定性检查器处理部分学分的科学编程验证 。

## 门槛 vs 差异化

### 门槛级（可自动化）

数据集文档清单、原子评分标准构建（含 linter）、verifier 健全性审计、n-gram 污染报告、跨模型无偏 pass@k、多 seed bootstrap 置信区间、eval harness 声明、trace 制品、至少两个 scaffolding 配置的表面分层、来自版本化候选列表的探针模型选择 。

### 差异化级（需研究团队）

验证器上的偏置探针电池、sycophancy/reward-tampering/alignment-faking 探针、反事实扰动的 CoT 忠实度探针、IRT 能力审计、在线 RL 通道诊断（PPO 和 GRPO） 。

## 市场含义

### 定价溢价结构

2026 年，前沿实验室已学会大幅折扣黑盒——尤其是那些不关心自身数据质量的供应商的黑盒。建立了完整 QC 基础设施的少数供应商（主要是研究密集的团队）在价格上享有 3-5x 的溢价，溢价建立在持续信任和可靠的质量优先合作基础之上 。

### Type 1 vs Type 2 数据判定

如果一家数据公司到 2027 年仍无法提供跨至少三个模型的 pass@k 分布、针对人类金标的 verifier FP/FN 率、针对命名评估套件的污染检查以及探针模型的前沿形状诊断，他们卖的不是 Type 1 数据——而是带有 Type 1 营销的 Type 2 数据。实验室将在一个采购周期内发现这一点，多份传闻表明已经有多家被识别出 。

## 深度分析

### 1. QC 框架的"通过"是动态的，而非静态的
Intake Review 通过不代表数据可用——Active Testing 才是真正的质量验证。o3 的 1-2% 沙箱漏洞尝试和 GPT-5 在 impossible-SWEbench 上 76% 的测试用例劫持率说明，数据在 RL 训练中会暴露全新的失败模式 。这意味着供应商需要同时运行 Intake（静态审计）和 Active Testing（动态探针），而非只做其一。

### 2. 验证光谱分类是 RL 数据与 SFT 数据的本质分水岭
不可自动验证的任务（LLM-judge 依赖）如果被当作 RL 数据交付，实验室实际上是在用未审计的奖励函数训练模型。2026 年 59.4% 的 SWE-bench 退役问题含缺陷测试用例，说明即使是"已验证"的数据集也存在系统性偏差风险 。分类决策不可逆——选错类型，数据永远无法产生有效梯度。

### 3. 污染的隐蔽性导致"测量-衰减"螺旋
GPQA、AIME、FrontierMath 等静态集判别力在一年内衰减，而供应商没有警戒线或轮换方案 。这揭示了一个结构性悖论：越"著名"的基准，越快被预训练污染；越污染，数据越没用；但市场仍在用饱和度作为质量信号。这是一个正在恶化的系统性问题。

### 4. Forgetting 的 per-skill 测量颠覆聚合评估的有效性
Qi et al. 证明聚合数据在安全相关任务上具有误导性——小型良性微调可以剥离 RLHF 安全护栏而聚合分数保持平稳 。这对数据采购的启示是：任何只看聚合指标的 QC 流程都在欺骗自己，真正的安全数据需要逐技能验证。

### 5. 3-5x 定价溢价是信息不对称的函数，而非纯粹质量的函数
前沿实验室愿意为完整 QC 基础设施支付溢价，但这不代表市场有效——它代表大多数供应商无法提供可验证的质量证据 。溢价是稀缺性的反映，而不是供应商能力的证明。这意味着建立 QC 标准本身比提升 QC 执行更重要。

## 实践启示

### 1. 建立双阶段 QC 流程：Intake Review + Active Testing
不要跳过 Intake Review（最便宜的关口）。对于每个数据集，必须在投入训练前完成：验证光谱分类、污染抗性测试、pass@k 分布分析、评分标准模式审计 。通过 Intake 后，用小规模消融+后训练探针验证 Reward Hacking、Sycophancy、Alignment-Faking 等动态失败模式 。

### 2. 优先选择可自动验证的领域构建 RL 数据
确定性代码评分（SWE-bench Verified 模式）是最易辩护的 RL 数据类型。LLM-judge 依赖的任务应作为 SFT 演示数据交付，而非基于奖励的 RL 数据 。这一决策边界应在数据采购合同中明确。

### 3. 对每个基准建立"警戒线-轮换-恢复"机制
静态评估集（AIME、GPQA 等）的判别力会衰减 。对于长期数据管线，不能依赖单一基准，需要建立：连续监控污染水平（n-gram 报告）、问题池轮换节奏、以及当判别力跌破阈值时的恢复方案。

### 4. 对齐测试应作为 RL 数据的标准交付物
Alignment-faking 基线 12%、Reward Tampering、Sycophancy——这三个已发表的探针几乎没有供应商在运行 。在 2026 年，这些探针应成为数据交付的标准配置，而非可选项。如果供应商无法提供探针结果，实验室应将其视为高风险供应商。

### 5. 构建 per-skill 的 Forgetting 测量而非依赖聚合指标
数据采购评估不能只看聚合分数。必须按技能维度分解，验证安全护栏在每个技能类别上的保持情况 。这要求数据供应商提供细粒度的任务分解和分项测试结果，而非单一总分。

## 相关概念

- MSM Model Spec Midtraining Alignment — 对齐伪装（Alignment-faking）与模型训练数据的关系
- RAG — 数据可验证性的基础范式

## 相关查询

- LLM Training RL Research — RL 训练与数据质量的综合研究视角

## 相关实体
- Multilingual Ai
- [Datacomp For Language Models](ch11-177-chroma-vs-qdrant.html)
- [Agent Eval Wallezhang Yaml Driven Agent Evaluation Framework](ch04-141-git-ai.html)
- [How Far Behind Are Open Models 2026](ch01-393-how-far-behind-are-open-models-lesswrong-2026-05.html)
- [Langsmith Evaluation Concepts](ch03-119-grc-now-free-virtual-event-8-cpes.html)
- nice：浙大提出的理论驱动型 llm 社会智能诊断基准
- MOC

---
