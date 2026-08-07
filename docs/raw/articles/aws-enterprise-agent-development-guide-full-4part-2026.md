---
title: "亚马逊云科技《企业生产级智能体开发部署指南》完整四篇（原文 PDF）"
source_url: "https://aws.amazon.com/cn/blogs/china/"
author: "Amazon Web Services"
publisher: "亚马逊云科技"
published: 2026-07
ingested: 2026-08-07
language: zh
type: raw-article
sha256: "59d90647fc00a3c0e1f9d5c527cff316402d30c8e8b5d1efaa8b5b6fe5a7b604"
---

# 亚马逊云科技《企业生产级智能体开发部署指南》完整四篇（原文 PDF）

> 指南原文 PDF（56 页扫描版，用户提供，OCR 提取）。四篇完整版：第一篇「为什么评估是一切的起点」、第二篇「评估方法论：从原型验证到生产就绪」、第三篇「如何在亚马逊云科技上构建企业级智能体」、第四篇「实战案例」。比库内已入库的 AWS China Blog 三部曲（2026-06-26）更完整，含大量零覆盖技术细节。

## 全系列摘要

核心命题：AI 智能体工程化落地的瓶颈不在模型能力，而在缺少一套可持续衡量「好不好」的工程体系。第一篇从「为什么传统软件工程方法对智能体失效」切入（非确定性/Prompt 即源代码/依赖漂移三大根因），提出 ADLC 开发生命周期 + 三类工程实践；第二篇澄清三个评估误区、建立两根支柱框架（三粒度 + 三层证据权重）、八类维度、LLM-as-a-Judge 价值与边界、Agent-based Evaluation；第三篇给出工程实现全景（自动化评估工作流 + 三层评估库、按智能体形态匹配指标、Trace-driven 四步、AgentCore Evaluations）；第四篇三个 Amazon 内部生产级案例（工具使用/意图检测/多智能体协作）。

## 第一篇：为什么评估是一切的起点

### 三类工程实践

1. **第一类：把评估跑起来**。先定义「成功」长什么样，启动项目时先产出四个交付物：智能体的职责边界、语气个性、每个工具的明确定义、基准数据集（覆盖正常/边缘/拒答三类情况）。从第一天自动化评估，每一次改 Prompt/加工具/换模型都重跑评估。区分能力评估（起点低，是「要爬的山」）与回归评估（维持接近 100% 通过率守住底线），能力评估达标后「毕业」进入 CI 持续运行
2. **第二类：让数据持续流入评估**。从第一天埋好可观测性，OpenTelemetry 是行业标准，模型调用/工具调用/推理步骤全部产生结构化 Trace。无 Trace 的评估是盲测。案例：财务智能体上线后出现慢查询和错误，没 Trace 排查四天才定位到外部 API 静默变更返回格式；第一天接入 OTEL 第一天就会暴露
3. **第三类：让系统架构可被评估**。工具定义比工具数量更重要（模糊描述让智能体必须「猜」）；用确定性代码替代模型内部推理（获取日期/计算增长率/验证格式用 Python 函数毫秒级执行）；多智能体保持解耦（一个大智能体处理三十种任务不如拆三个职责清晰专门智能体）；安全规则写在 System Prompt 里不可靠——安全控制外部化到 Gateway 和 Policy 层，工具调用前完成鉴权

### 结语：评估是规格说明、是质量门控、是生产监控、也是改进的驱动力

ADLC 飞轮：定义「好」→ 构建 → 评估 → 质量门禁+发布 → 生产环境观测 → 挖掘失败案例 → 回到定义。飞轮：生产 trace → 评估数据 → 训练数据，循环永不停止。核心主线：评估即规范、即 gate、即监控、即奖励函数。谁掌握了评估，谁就掌握了整个生命周期。

## 第二篇：评估方法论（两支柱 + 三误区）

### 三个常见评估误区（库内零覆盖）

1. **误区一：仅关注智能体准确率指标**。把多步智能体压成一个「对/错」或质量星级，掩盖两类信息：质量很高但延迟/成本很差；「答案对了但过程全错」的侥幸。多步系统最终输出的单一准确率远远不够
2. **误区二：严格比对工具调用序列**。「轨迹对了才算对」用预期工具调用序列做精确匹配，极其脆弱——智能体换等价路径、调换无依赖步骤顺序就会被判失败。测的是「像不像我写的脚本」而非「有没有把事办成」
3. **误区三：先评估、后观测**。急着搭评分流程却先没沉淀生产执行轨迹（trace），分数掉了不知道掉在哪一步、为什么掉。正确的顺序：先有可观测性，再谈打分。没有 trace 的评估是盲测

### 两支柱框架（详细定义，库内零覆盖）

**支柱一：三种评估粒度**（决定评估的粒度有多深）：

| 粒度 | 看什么 | 解决什么问题 |
|------|--------|-------------|
| 黑盒（Black-Box） | 最终响应结果 | 结果好不好 |
| 玻璃盒（Glass-Box） | 完整执行轨迹 | 在哪一步出错了 |
| 白盒（White-Box） | 单步细节/内部状态/推理 | 精确定位根因 |

粒度越深，可定位的失效越细。黑盒告诉你「好不好」，玻璃盒和白盒告诉你「为什么、在哪儿」。

**支柱二：三层证据权重**（决定每个分数有多大分量）：

| 层级 | 类型 | 特点 |
|------|------|------|
| Layer 1 | 机械可验证 | 程序判定，确定、可复算（格式、延迟、成本） |
| Layer 2 | 半客观 | 固定评判器打分，需人工校准 |
| Layer 3 | 主观 | 默认拒评，不给假装客观的分数 |

关键原则：程序化、可验证的检查优先执行——凡是能写成代码断言的，绝不交给 LLM-as-a-Judge。既是省钱，更是把最强证据放在最前面。两支柱互相正交：同一指标可同时看粒度与证据权重。

### 按智能体形态选指标（分项指标，库内零覆盖）

- **工具使用（Tool Use）**：Tool Selection Accuracy（选对工具）、Tool Parameter Accuracy（用上下文信息正确填参）、Tool Call Error Rate（调用失败频率）、Multi-turn Function Calling Accuracy（多工具按正确顺序调用）
- **记忆（Memory）**：Context Retrieval（从记忆检索相关上下文，precision/recall 平衡）
- **多轮对话（Multi-turn）**：Topic Adherence Classification（守域）、Topic Adherence Refusal（越界正确拒答）
- **推理（Reasoning）**：推理质量评估

### 决策为先 KPI（库内零覆盖）

技术指标回答「智能体做得对不对」，决策为先 KPI 回答「智能体做得值不值」，两者必须同时出现在评估面板：

| KPI | 含义 |
|-----|------|
| Decision Quality 决策质量 | 响应在多大程度上贴合具体用户和场景，是否做出对齐业务目标的细致决策 |
| Time-to-Action 响应时效 | 评估情况并做出反应的速度，延迟是否低到让人感觉「自适应、像人」 |
| Cognitive Offload 认知卸载 | 替人类承担了多少手动分析/分流/例行决策，是真减负还是只是转移工作 |

### 关键指标体系总结

企业要测八类维度：质量、性能、责任、成本等（对应库内 entity 已覆盖的八维度表）。

## 第三篇：如何在亚马逊云科技上构建企业级智能体

### Trace-driven 评估工作流（四步细节，库内零覆盖）

1. **定义评估输入**：来自 Trace 和 Span（模型调用/工具调用/推理步骤）。On-demand evaluation 按 span ID/trace ID 发起；Batch evaluation 面向历史会话从 CloudWatch Logs 读取；Online evaluation 按采样率/过滤条件从生产流量持续抽样
2. **调用评估库**：针对 trace 自动生成默认指标，支持挂载自定义指标
3. **结果分发**：评估结果连同 trace 写入 S3，或在 dashboard 做可视化
4. **审计与处置**：性能审计与监控分析；自定义规则在性能下降时触发告警

核心信号：token 用量、延迟分位（P50/P95）、错误率、工具调用模式。

### OpenTelemetry 生态（库内零覆盖）

AgentCore 以标准 OTEL 格式发出 telemetry，可对接任何兼容 OTEL 的可观测平台；官方明确支持 OpenInference、OpenLLMetry、OpenLit、Traceloop 等 instrumentation 库。评估通过 OTEL/OpenInference 兼容 Strands、LangGraph 等主流框架——trace 自动采集、转统一格式后用 LLM-as-a-Judge 打分。内置评估器开箱即用，覆盖 helpfulness、correctness、faithfulness、goal success rate、harmfulness、tool selection/parameter accuracy 等维度。

### 评估数据集构建要点（库内零覆盖）

1. **同一查询的多种说法**——真实用户不会像 API 文档那样标准提问（「我还剩几天假」和「年假余额」问的是同一件事）
2. **应当拒答/应当升级的边缘情况**——如 HR 智能体遇到「我的奖金为什么比同事少」应升级到人工而非硬答
3. **模糊查询**——一个问题有多种合理解释时智能体如何处理

### AgentCore Optimization（public preview，库内零覆盖）

构建在 Evaluations 之上，三项能力：
1. **Recommendations**：基于真实智能体 traces 和一个目标 evaluator，自动产出优化后的 system prompt 或 tool descriptions，并解释改了什么、为什么
2. **Configuration bundles**：把配置（system prompt/model ID/tool descriptions）做成版本化、不可变的快照，不改代码即可切换
3. **A/B testing**：通过 AgentCore Gateway 把流量在 control/treatment 间切分，由 online evaluation 对每个 session 打分并报告统计显著性，胜出变体接管 100% 流量、其新 trace 成为下一轮起点

### Observability — Evaluation — Optimization 闭环

Observability 负责「看见」（AgentCore 自动发出 trace 与指标）；Evaluation 负责「判断」（基于 trace 打分、定位问题）；Optimization 负责「改进」（Recommendations/Configuration bundles/A-B testing）。胜出变体新 trace 回流 Observability 开始下一轮。

## 第四篇：实战案例（三案例细节，库内零覆盖）

### 案例一：Amazon 购物助手——工具使用评估

业务场景：无缝对接底层系统成百上千个 API（客户画像/商品库存/下单履约）+ 长程多轮对话。把企业 API 手工 onboarding 成智能体工具通常耗时数月；遗留 API 转工具需要为每个端点系统性定义结构化 schema 和语义描述，schema 差/描述不精确会直接导致运行时选错工具——调用无关 API、无谓撑大上下文、推高推理延迟、拉高成本。

解决与评估：先治理——Amazon 定义跨组织工具 schema 与描述规范，建立治理框架对所有工具开发和智能体集成团队强制合规（统一工具签名、输入校验 schema、输出契约、人类可读文档格式）。核心指标：Tool Selection Accuracy、Tool Parameter Accuracy、Multi-turn Function Calling Accuracy。经验：工具的 schema 治理是智能体规模化的前提，评估是治理体系的验收手段。

### 案例二：Amazon 客服智能体——意图检测评估

业务场景：编排智能体（Orchestration）用 reasoning model 检测客户意图，再路由到专精解析器。意图识别错级联出路由错误/无关回答/客户挫败/转向人工/运营成本上升。

解决与评估：评估数据两条腿——匿名化历史客户交互构造「用户查询+期望意图」ground truth 对；开发 **LLM Simulator** 用 LLM 驱动的虚拟客户 persona 模拟多样用户场景。评估时编排智能体对模拟数据生成意图，与 ground truth 逐一比对；除意图正确性外还覆盖任务完成度（最终响应与意图解决），多轮对话加入 Topic Adherence 分类与拒答指标。核心指标：Intent Correctness、Task Completion、Topic Adherence Classification/Refusal。经验：用 LLM 模拟器扩展评估覆盖面是低成本扩大评估覆盖面的标配做法。

### 案例三：Amazon 卖家助手——多智能体协作评估

业务场景：Planner-Specialist 模式——LLM Planner & Task Orchestrator 接收请求拆解专精子任务，按能力和负载分配；底层智能体自主执行、用专精工具完成目标；完成后回报状态/确认/中间结果/超边界升级；编排器聚合响应处理依赖，综合成连贯结果。

评估特殊性：必须同时覆盖个体智能体性能和集体系统动态。除各专精智能体在任务完成/推理/工具使用/记忆检索上的质量，还要衡量智能体间通信模式、协调效率、任务交接准确性。核心指标：规划评分、通信效率、协作成功率。

**关键提醒——HITL 不是可选项而是必选项**（自动指标抓不住涌现行为 emergent behavior）：多智能体交互可能产生任何单一智能体都不会有的、设计者没预料到的行为模式。HITL 四项人工把关职责：
1. 评估智能体间通信，识别特定边缘场景下的协调失败
2. 判断智能体专精划分是否合理、任务拆解是否对齐各智能体能力
3. 多个智能体给出矛盾建议时，验证冲突解决策略是否得当
4. 保证多智能体共同贡献一个决策时的逻辑一致性，集体行为是否服务既定业务目标

### 结语：评估是循环，不是终点

配套动手实验：https://github.com/aws-samples/sample-eval-first-building-enterprise-agents-with-agentcore

## 与库内已有覆盖的关系

库内已有 AWS China Blog 三部曲（raw ×3 + entities/aws-china-enterprise-agent-evaluation-adlc，2026-06-26 入库）覆盖：三失效原因、ADLC 六环节、两根支柱概览（八维度 + 四方法矩阵）、工程纪律、AgentCore Evaluations 工具链。本 PDF 增量（全部库内零覆盖）：三评估误区、两支柱详细定义（三粒度黑盒-玻璃盒-白盒 + 三层证据权重 Layer1-3）、决策为先 KPI（Decision Quality/Time-to-Action/Cognitive Offload）、分项指标（Tool Selection/Parameter/Multi-turn Calling/Topic Adherence）、OTEL 生态（OpenInference/OpenLLMetry/OpenLit/Traceloop）、AgentCore Optimization（Recommendations/Config bundles/A-B testing）、数据集构建三要点、三案例完整细节（工具 schema 治理/LLM Simulator persona/Planner-Specialist + HITL 四职责）、Observability-Evaluation-Optimization 闭环。
