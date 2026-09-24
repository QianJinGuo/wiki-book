# MosaicLeaks: Can your research agent keep a secret?

> 📊 Level ⭐⭐⭐ | 13.1KB

## 核心问题

深度研究 Agent（Deep Research Agents）在执行多步查询时，会将用户的私密信息暴露在查询链路中。MosaicLeaks 研究首次系统量化了这一隐私风险。

研究发现：当 Agent 需要查询外部知识源（如搜索引擎、数据库）来完成研究任务时，用户的敏感数据（PII、商业机密等）会随着查询请求被发送到第三方服务，造成隐私泄露。

## MosaicLeaks Benchmark

ServiceNow 团队构建了 MosaicLeaks benchmark，专门评估研究 Agent 在以下场景下的隐私泄露程度：

1. **PII 泄露**：Agent 在查询中暴露用户个人身份信息
2. **商业机密泄露**：Agent 将内部文档内容发送给外部服务
3. **上下文泄露**：Agent 在多轮对话中累积暴露敏感上下文

实验覆盖了多个主流研究 Agent 架构，发现隐私泄露是系统性问题而非偶发。

## PAPO：隐私感知策略优化

研究提出 **PAPO (Privacy-Agentic Policy Optimization)** 方法，通过强化学习训练 Agent 学会保护隐私：

- **隐私奖励信号**：将隐私保护作为 RL 奖励函数的一部分
- **信用分配**：在多步查询链路中，精确标记哪一步泄露了隐私
- **下采样训练**：对高隐私风险的查询路径进行重点训练

PAPO 在保持 Agent 研究能力的同时，显著降低了隐私泄露率。

## 与现有 Agent 安全实体的关联

MosaicLeaks 补充了 wiki 中关于 Agent 安全的多个视角：

- 与 Nvidia Secure Local Agent Nemoclaw Openclaw 的本地安全 Agent 方案互补：NVIDIA 方案从架构层隔离，MosaicLeaks 从训练层优化
- 隐私保护是 [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) 中安全层的重要维度
- 研究 Agent 的隐私问题与 [Interconnects What Comes Next With Open Models](https://github.com/QianJinGuo/wiki-public/blob/main/entities/interconnects-what-comes-next-with-open-models.md) 讨论的开源模型安全话题相关

## 独特价值

1. **首个系统性 benchmark**：MosaicLeaks 是首个专门针对研究 Agent 隐私泄露的评测基准
2. **PAPO 训练方法**：将隐私保护嵌入 RL 训练循环，而非事后过滤
3. **实用性强**：提供了可量化的隐私风险评估框架，适用于任何多步查询 Agent

## 深度分析

### 一、泄漏发生在查询链路的"并集"上：mosaic 效应

MosaicLeaks 的核心命题是：泄漏不在于某条查询写了敏感字段，而在于**多条中间输出的并集（union）**。每一跳单独看都是普通公开检索，把整条链路的 query log 累加起来却能重建私有事实。论文例子是 MediConn：三条查询分别涉及云迁移里程碑、2024 年 1 月的安全披露事件、以及"哪家厂商被攻破"，任何一条都不构成泄密，合起来却足以推出"到 2025 年 1 月已完成 70% 基础设施上云"这一内部数字。

威胁模型很弱：攻击者只看**外发的查询日志**，看不到私有文档，也看不到 Agent 的推理过程。泄漏分三档、能力递增：**Intent leakage**（仅凭日志猜出 Agent 在查什么私有问题）、**Answer leakage**（日志加一个已知私有问题即可在没看过文档时作答）、**Full-information leakage**（不给问题也能自行发现并陈述可验证为真的私有事实）。共同点是：泄漏不是单点事故，而是随查询次数单调累积的量。

### 二、Benchmark 设计：把隐私风险变成可测量的标量

语料与切分：1,001 条多跳研究链，构建在本地企业文档加受控 web 语料之上，划分为 559/98/344 条训练/验证/测试链，**测试链来自没见过的公司**（测迁移而非记忆）。关键设计约束是任务既要**有很高泄漏倾向**，又必须**在不泄漏的前提下可解**——于是泄漏只能归因于策略选择，而非任务难度。

构造：本地与 web 子问题交替，前一跳答案成为下一跳的 bridge entity，Agent 必须先取到本地信息才能构造下一条有效 web 查询；流水线为"种子私有事实（内部指标、日期、金额、命名实体）→ 桥接新文档并生成下一问 → 校验可解性与来源顺序"。MediConn 链显示危险从哪一跳开始：前两跳是本地问题（70%、January），第三跳本身是纯公开 web 问题，但只要把 "MediConn"、"70%"、"January" 顺着查询带出去，观察者就拿到了足够上下文。

度量：一个从 DRBench 简化的 harness，四个工具 Plan（生成查询）/ Choose（选文档）/ Read（并行读懂当前 hop）/ Resolve（作答、继续读还是再搜），每个 hop 单独判定，主指标 **strict chain success** 要求整条链每跳都对。 能力与隐私因此第一次同处一张图：横轴 strict chain success，纵轴 answer / full-information leakage。

### 三、PAPO：把隐私写进 RL 奖励，而不是事后过滤

本页沿用论文推广名 PAPO（Privacy-Aware Policy Optimization）；原始 blog 称该方法为 **PA-DR（Privacy-Aware Deep Research）**，指同一套机制。三组对照构成全文主线（底座 Qwen3-4B）：

| 训练方式 | Strict chain success | Answer / full-info leakage |
| --- | --- | --- |
| Base Qwen3-4B | 48.7% | 34.0% |
| 只训任务奖励 | 59.3% | 51.7% |
| 任务 + PAPO | 58.7% | 9.9% |

第二行最刺眼：**只训任务会让 Agent 主动学会泄漏**（成功率 48.7%→59.3%，泄漏 34.0%→51.7%）。机制是模型学到"往查询里塞更多上下文"能提高检索命中率，而每条更富信息的查询都多给观察者一块碎片——**查询越有信息量，对任务越好、对隐私越差**。 第三行的意义在方向而非幅度：9.9% **低于底座自己的 34.0%**，即训练隐私不是抵消任务训练的副作用，而是把 Agent 推到比起点更保守的位置，同时几乎保留全部能力增益。

机制是两块奖励。**situational task reward**：按"同阶段、同 hop、信息条件相同"分组对比调用——用终局分数回传的 credit assignment 太弱（成功的 rollout 会连带强化其中那条泄漏查询）；Plan 因"搜对源、取对文档"得分，文档已在手上还重复搜索则被罚。**learned privacy reward**：只要有 web 查询产出，一个 Qwen3-4B 分类器就估计"当前查询是否**直接**泄漏"与"加入既有 query log 是否**新增** mosaic 泄漏"，惩罚取两者中较大者——隐私代价因此精确落到使日志更暴露的那次 planning 决策上。

副作用同样重要：PAPO 训练出的 Agent **发出的 web 查询更多**，只是那些查询丢掉了暴露性细节（"15%"、"2024"、答案形态的暗示），同时仍能找到正确的公开文档——有效策略不是"少查"，而是"查得多但不携带私有碎片"。附带收益是样本效率：情境化奖励无需额外 value model、无需跨 rollout 对齐 step 索引，达到 ~55% strict success 只需 146k 生成样本，而 outcome-only RL 要 963k。

### 四、为什么"提示词 + 事后脱敏"走不通，以及原文承认的边界

往 Plan prompt 里加一行"不要发出会泄漏本地信息的 web 查询"：Qwen3-4B 泄漏从 34.0% 降到 25.5%，strict chain success 却从 48.7% 掉到 44.5%，行为变化只是"少发了几条查询"而非构造更安全。 结论一句话：**隐私提示词不进去，得训进去**（you can't prompt privacy in, you have to train it in）。

与经典 PII 脱敏的结构差异正在于此：输出过滤作用于**单条文本**，找的是"违规字符串／可识别实体模式"；mosaic 泄漏存在于**跨查询的聚合层**，每条查询都可能完全不含 PII 特征却仍贡献一块拼图。当违规性只体现在 query 集合的联合分布上，逐条检查的过滤层在结构上找不到违规对象——这与 [Model Agnostic Pii Detection With Llms](https://github.com/QianJinGuo/wiki-public/blob/main/entities/model-agnostic-pii-detection-with-llms.md) 代表的单条文本 PII 检测并不冲突（那是必要但不充分的一层），也呼应 [Agent Security Threat Models](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-threat-models.md) 中"安全边界沿执行链路而非单次输出延伸"的判断。benchmark 的真正价值因此不在分数，而在于**把隐私从政策声明变成可优化目标**：有了 strict success × leakage 的联合指标，隐私就能像准确率一样被回归测试、被计入上线门槛。

边界由原文自陈：MosaicLeaks 是**受控 benchmark，不是对已部署系统泄漏量的测量**——企业文档合成、web 语料固定、链只覆盖三家公司上下文、结果全部来自单一 harness 下的多跳问答而非开放式研究； 隐私奖励也由 Qwen3-4B 分类器估计，其误判成本与向更大模型、更多 harness 的迁移性未做系统分析；度量只覆盖推理期的查询外发面，未涉及 Agent 记忆、工具日志与轨迹落盘等持久化面。

## 实践启示

1. **把 query log 当作与私有文档同级的敏感资产治理。** mosaic 泄漏的载体是外发查询的累积日志，不是某条回复。多步检索/研究 Agent 应默认记录完整 query log，并纳入访问控制、留存期限与审计范围，而不是只盯着最终答案的脱敏。
2. **不要用免责式 prompt 兜底。** "不要泄漏"这类 Plan prompt 收益不稳定且带能力代价（泄漏 34.0%→25.5% 换来成功率 48.7%→44.5%）。若必须用，只能算纵深防御的一层，不能当作合规依据。
3. **同时盯住能力与泄漏两条曲线。** 只优化任务成功率会系统性推高泄漏（59.3% / 51.7%）。把 leakage 作为与任务指标并列的一等指标纳入训练或选型，任何"能力提升"的评审都要附上泄漏变化。
4. **定位危险的是哪一跳，而不是整条轨迹。** 按阶段/hop 分组对比同类调用（situational reward）比整轨迹终局打分精确得多，也把收敛所需样本压到约 1/5；工程上可用它做"哪一步首次把拼接面变暴露"的可解释诊断。
5. **优先做查询构造的改写层，而不是减少查询次数。** 有效策略是发更多 web 查询，但剥离私有实体、具体数值、精确日期与答案形态暗示（PAPO 的查询数反而多于底座）。把 metric/date stripping 做成检索层的确定性规则，往往是性价比最高的第一道防线。
6. **给组合泄漏设预算、做上线前回归，并限定结论作用域。** 在网关/检索层按"累计已外发碎片"设硬上限与告警，并把多跳隐私评测纳入发布门禁，用固定私有事实种子做回归。同时记住受控 benchmark 的数字不能直接外推为部署泄漏率——合成文档、固定语料、单一 harness 都是已知限制，真实部署需要自带有日志的独立测量。

## 元信息

- **arXiv**: [2605.30727](https://arxiv.org/abs/2605.30727)
- **作者**: Alexander Gurung, Spandana Gella, Alexandre Drouin, Issam H. Laradji, Perouz Taslakian, Rafael Pardinas
- **来源**: ServiceNow Research + HuggingFace Blog

---

