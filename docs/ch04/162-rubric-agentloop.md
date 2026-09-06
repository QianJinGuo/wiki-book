# 评估：从黄金指标到 Rubric丨AgentLoop 数据飞轮实践（三）

> 📊 Level ⭐⭐⭐ | 8.7KB | `entities/agentloop-eval-golden-metrics-rubric-mayunlei-aliyun-2026-09-01.md`

# 评估：从黄金指标到 Rubric丨AgentLoop 数据飞轮实践（三）

AgentLoop 数据飞轮实践系列 · 第 3 篇 / 共 5 篇。上一篇：数据飞轮的起点：四种方式把 Agent 连进 AgentLoop丨AgentLoop 数据飞轮实践（二）/ 下一篇：实验 —— 回测与离线实验平台

→ [原文存档](https://mp.weixin.qq.com/s/24kNuxyEd5X8CuqztYxtbw)

## 摘要

Agent 输出是开放式的，同一个问题可有无数种"还行"的答案，人工抽检又贵又慢、难沉淀为标准；AgentLoop 的做法是把"好不好"变成带权重的分数、把"为什么不好"变成可追溯的证据。本篇以客服 Agent 为例，完整走通"黄金指标（Golden Metrics）→ Rubric → 评估器（Evaluator）→ 评估任务（Evaluation Task）→ 结果分析"的闭环。

核心洞见：评估的本质是把专家对"好"的定义变成机器可执行、结果可解释的资产，一旦建立，后续实验回测、经验注入才有共同度量衡。

## 核心要点

- **评估体系分两层**：评估器定义"怎么评"（指标 + 评分标准，可复用）；评估任务定义"评什么、何时评"（执行配置）。评估器如考卷，评估任务如组织考试。
- **评估器两种类型**：Code 评估用代码规则打分，便宜确定，但只覆盖格式/长度等规则可表达指标；Agent 评估让评估 Agent 读输入、输出与轨迹按 Rubric 打分，能理解语义、覆盖"回答是否切题"。
- **黄金指标可让 AI 帮忙制定并拆解**：Prompt 要求按业务场景评判回答质量与执行过程，拆成 Rubric——每指标给分档规则、权重与加权总分公式。
- **Rubric 把抽象"好"拆成可判定细则**：每条指标什么情况打几分、占多少权重、如何汇总——有了它，评估才从"凭感觉"变成"可复现"。
- **评估器输入变量有三**：input、output、运行轨迹（trace.agent），既能评结果也能评过程；输出为 score 到 rubric version 等结构化字段。
- **低分条目可处理**：评估器不只打分，还输出解释、summary、decision、证据字段，让"哪步错了、依据是什么、怎么调"写在结果里。
- **badcase 闭环**：在线评估抓出的坏案例沉淀进数据集，成为实验回测的弹药；分数低处即下一轮调优方向。

## 深度分析

### 黄金指标 → Rubric 的设计

评估第一步不是写代码，而是回答"什么算好"。以客服 Agent 为例，黄金指标必须覆盖两个角度：**回答质量**（答案对不对、好不好）与**执行过程**（工具调用是否合理、路径是否绕远）——只看结果漏掉"蒙对的"，只看过程漏掉"答非所问的"，二者都要覆盖。

黄金指标可让 AI 基于业务场景制定并拆解：Prompt 要求定义评判回答质量与执行过程的指标并拆成 Rubric，AI 输出含分档规则、权重、总分公式及"加权诊断分 + 硬门禁 + 证据覆盖率"等实操建议。 经验：业务熟悉可人工制定，AI 只是提效；单点关键指标（如客服场景"是否泄露隐私"）可提为顶层评估器单独评。

### 两层评估结构

评估体系分两层且正交。**评估器**先定义指标——含类型、输出定义、评判标准（Rubric），回答"怎么评"，与数据无关、可复用；**评估任务**指定用哪些评估器、对什么数据评估，回答"评什么、何时评"。解耦的好处是评估器作为"怎么评"的资产可在不同任务上复用。

评估器类型决定能力边界：Code 评估确定便宜，但只覆盖规则可表达的格式/长度/字段完整性；Agent 评估能像人一样按 Rubric 理解语义、覆盖"流程是否合理"等规则写不出的指标。演示选 Agent 评估（Custom Agent），更准但消耗更大，这正是"采样配置"存在的原因。

### 评估器 / 评估任务 / 结果分析

评估器载体是其 Prompt：把含 Rubric 的 Prompt 粘贴进输入区，评分规则随 Prompt 成为评估器定义。输入变量 input、output、运行轨迹（trace.agent）；输出为 score、raw-weighted score、final score、decision、scenario type、summary、explanation、rubric version 等字段。**Rubric 会迭代，留版本号才能区分"分数变化是 Agent 变了还是标准变了"。**

四个配置点：① Trace 数据关注微服务调用（基础设施视角），轨迹数据关注思考与调工具（智能体视角），评回答与执行用轨迹数据；② 持续评估（线上盯盘）vs 历史评估（复盘）；③ 采样配置控制成本，演示设样本 100、比例 100% 先跑通流程；④ 字段映射把数据字段接到评估器变量（trace.input→input 等）。

结果分析关键在证据字段：评估器不只打分，还要说明"为什么是这个分"，让低分条目可处理——看到的不再是孤零零的 0.4 分，而是"哪步做错、依据是什么、怎么调"。单次评估有浮动，可多次评估看均值。

### 可量化、可解释、可复用

三指标相互咬合：**可量化**把开放式"好不好"转成带权重分数，可比较排序；**可解释**让每个分数有可追溯依据，低分能精确指出错误步骤；**可复用**让评估器作为资产与数据解耦，同一判断逻辑适用于不同任务与数据流。评估分数低处即下一轮调优方向，badcase 沉淀进数据集成为实验回测的弹药——评估把质量信号转成下一轮改进的输入。

## 实践启示

1. 先定义"什么算好"再谈评估，黄金指标（回答质量 + 执行过程）先于任何打分逻辑。
2. 用 AI 帮助制定并拆解黄金指标，让指标落到"分档 + 权重 + 总分公式"的 Rubric 粒度。
3. 能规则表达的先选 Code 评估，语义强的才上 Agent 评估，并用采样控制成本。
4. 评估器输出强制带证据与解释，让"为什么低分"和调优方向随分数产出；给 Rubric 留版本号，区分分数漂移来自 Agent 还是标准。
5. 把评估嵌进飞轮而非停在质检：badcase 沉淀成数据集、喂给实验回测，让质量信号驱动下一轮改进。

## 相关实体

- [AgentLoop 是什么](https://github.com/QianJinGuo/wiki-public/blob/main/entities/阿里云刚发布的-agentloop-是什么.md)
- [AgentLoop 企业级自进化飞轮](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-agentloop-enterprise-agent-self-evolution-flywheel.md)
- [AgentLoop Agent 经验自进化闭环](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentloop-agent经验自进化闭环.md)
- [自进化中评估器的瓶颈](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-self-evolution-evaluator-bottleneck.md)
- [评估指标体系到闭环](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-evaluation-systematic-guide-metrics-to-closed-loop.md)
- [LLM 评估 Rubric 综述](https://github.com/QianJinGuo/wiki-public/blob/main/entities/rubrics-survey-llm-evaluation-ruc-nlpir-2026.md)
- [评估 Harness 设计](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/evaluation-harness-design.md)

---

