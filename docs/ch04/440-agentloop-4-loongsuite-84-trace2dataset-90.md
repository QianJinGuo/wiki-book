# 阿里云 AgentLoop：企业级智能体自进化飞轮（4 环闭环 + LoongSuite 84% 字段覆盖 + Trace2Dataset 90% 节省 + Agent-as-a-Judge 90% 一致 + 记忆库/经验库）

> 📊 Level ⭐⭐⭐ | 36.5KB | `entities/aliyun-agentloop-enterprise-agent-self-evolution-flywheel.md`

# 阿里云 AgentLoop：企业级智能体自进化飞轮

> **来源**：阿里云云原生（Cloud Native 公众号），2026-06-18
> **核心命题**：**企业 Agent 落地的瓶颈已从"能不能跑通"转向"能不能形成自进化飞轮"**。阿里云推出 **AgentLoop** — 企业级 Agent 一站式自进化平台，把"数据采集 → 数据集构建 → 效果评估 → 进化资产沉淀"4 步闭环产品化。

## 一、定位：企业智能体下半场的发令枪

### 1.1 两类 Agent 进化场景

| 场景 | 现状 | 代表证据 |
|---|---|---|
| **个人办公 Agent**（Coding / 通用） | 已被加速进化，用户越用越喜欢 | Anthropic Economic Index：Claude 6 个月以上老用户对话成功率比新用户高 3-5 个百分点 |
| **企业业务 Agent**（客服 / Data / 内部智能体） | 仍处企业手搓观测/评估/优化的阶段 | 阿里云 AgentLoop 文章 — 本文主题 |

本文聚焦**后者**：企业 Agent 的自进化飞轮基础设施。

### 1.2 行业数据：Agent 落地的真实瓶颈

> 数据点（来自 LangChain State of Agent Engineering）：
> - **22.8%** 生产团队**完全不做评估**
> - 离线评估覆盖仅 **52.4%**
> - 线上评估仅 **37.3%**
> - **32%** 团队把"质量"列为生产环境**头号障碍**

> Databricks State of AI Agents：接入评估的企业数量仅是接入治理企业的 **17%**

**恶性循环**：缺少进化飞轮基础设施 → 不敢放量 → 没有观测数据 → 无法进化。

## 二、4 大工程难点（LLM-as-Judge 范式难以应对）

| 难点 | LLM-as-Judge | Agent 时代 |
|---|---|---|
| **数据采集** | (prompt, completion) 二元组，schema 干净 | **trajectory**（执行轨迹）：检索 chunk 列表 / 工具 JSON / 浏览器 DOM / 模型 token 流，异构事件按时序因果串联。OTel GenAI semconv 仍在草案 |
| **数据集构建** | 按 token 长度/置信度/人工反馈筛 prompt-completion 对 | 单一 trajectory 含 7 层信号（规划/检索/工具/中间状态/反思/模型调用/输出），且含真实业务数据需**结构化脱敏**。"这条轨迹是不是好样本"人肉难定义 |
| **效果评估** | 对一个点打分 | **3 层评估**：step-level（每步工具调用正确性）/ trajectory-level（整条路径是否绕路回退死循环）/ outcome-level（最终交付） |
| **资产沉淀** | 形态清楚：SFT 数据 / DPO pair / LoRA 权重 | 仍在分化期：prompt 改进 / few-shot 经验库 / episodic memory / 可复用 skill 或子流程，无统一容器 |

## 三、AgentLoop 的 4 环飞轮产品化

### 第 1 环：全栈观测分析 — 完整 Trajectory 执行轨迹（LoongSuite）

通过 **LoongSuite** 开源自动插桩框架，将采集对象从二元组升级成完整 trajectory。

**LoongSuite 3 层语义规范融合**：
1. OTel GenAI 社区标准（含阿里贡献的 STEP / MCP span 扩展）
2. AgentLoop 产品侧数据契约
3. 采集层自有扩展（session / turn / step / cost 专属字段）

**关键数据**：总计覆盖 **55 个 GenAI 语义字段**，第三方源码逐行对比 LoongSuite 有效字段覆盖率 **84%**，竞品最高仅 **51%**。

**4 类交叉印证诊断视图**：
- **调用树**（逐层下钻 span 耗时占比）
- **推理轨迹**（还原 ReAct 思考-工具-观察序列，检测无效循环）
- **时序线**（区分串行/并行与阻塞等待）
- **链路拓扑图**（还原全局调用关系）

> 一条 23 秒的慢请求，通过 4 层视图交叉定位，可精确到"某一轮 LLM 多步冗余循环调用"。

**与既有 LoongSuite 实体的关系**：[Alibaba Agent Observability Audit Loongsuite Pilot Coding Agent Blackbox To Transparent](../ch09/038-coding-agent.html)（401 行深度文档）覆盖 LoongSuite Pilot 端侧 + 3 类 Agent 形态 + 4 大观测审计能力。本 entity 在其基础上扩展到 AgentLoop **整平台**视角，包含后续 3 环。

### 第 2 环：Agent Ontology + Pipeline（Trace2Dataset）

**问题**：只有 Trajectory 不够 — 采集到的观测数据仍是孤立元数据，是一条条互不关联的 span。

**解法 — Agent Ontology**：在 Trajectory 之上基于 **UModel** 构建 Agent 实体关系拓扑。自动发现 Agent → Tool → Model 之间的实体关系拓扑，打破数据孤岛，实现确定性关联与推理分析。

**Pipeline — Trace2Dataset**：线上全量运行时数据 → Pipeline 编排：

- 数据源接入
- 数据降维（过滤 / 去重 / 采样）
- 特征提取（意图 / 难度 / 场景标签）
- AI 审核与改写
- 写入目标数据集

**关键产出**：自动构建 **Golden Dataset**（高质量经典样本）和 **BadCase Dataset**（典型失败案例）。整体可节省 **90% 以上**的 Token 消耗与时间成本。

### 第 3 环：Agent-as-a-Judge 范式产品化

**学术背景**：Meta AI + KAUST 在《Agent-as-a-Judge》论文中（DevAI 基准：55 个真实 AI 开发任务，365 条层级化用户需求）做了 3 种评估对照：

| 评估方式 | 与人类专家一致率 | 成本 |
|---|---|---|
| LLM-as-a-Judge | ~65% | 低 |
| **Agent-as-a-Judge** | **90%** | 人工的 **1/30** |
| 人类专家 | 100% | 86 美元/小时 |

**AgentLoop 内置 13 个标准评估器**，覆盖：
- 问答准确性（多轮事实核验 + 幻觉检测）
- Skill 执行质量（工具调用链验证与结果校验）
- 意图达成度（复杂任务目标满足评估）
- 安全合规（越权 / 敏感信息 / 有害内容检测）
- 上下文一致性（跨轮次记忆与状态追踪）
- 业务自定义（用户可通过自定义 Prompt + Skill + Tool 构建）

**评估器本身就是一个 Agent**（基于大模型做规划、调用工具、回放轨迹、基于中间状态做多步推理）。

### 第 4 环：记忆库 + 经验库 — 自进化的上下文工程

**两条路径**：

| 路径 | 流程 | 速度 | 依赖 |
|---|---|---|---|
| **路径一：数据驱动的 Agent 调优**（快速拉升基线） | BadCase 自动收集 → 失败模式聚类 → Agent 端到端改写（Prompt/Skill/工具链协同改写）→ 回归测试验证 | 快 | 人工迭代节奏 |
| **路径二：Trajectory 驱动的自进化闭环** | Agent 运行时自动记录完整调用轨迹 → 从成功/失败 Trajectory 自动提取可复用经验规则 → Just-in-Time 加载 → 评估注入后效果 | 慢但自动化 | 闭环评估 |

**产品化组件**：
- **记忆库**：覆盖事实 / 情节 / 摘要 / 自定义 4 种策略，把用户偏好和历史上下文沉淀到长期可检索层，下次遇到类似请求时自动注入。
- **经验库**：聚焦成功模式提取与复用，通过各行业业务专家共建，泛化成经验规则，归纳为长期记忆或 Skill，相似场景再次出现时自动激活。

**参考业内实践**：
- Hermes 轨迹自我反思（运行时）
- DreamGym（合成经验回放的 RL 训练框架）
- Reflexion 的 episodic reflection（失败经验回灌机制）

## 四、4 环闭环全景

```
┌──────────────────────────────────────────────────────────┐
│                    AgentLoop 4 环飞轮                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │ 第 1 环     │    │ 第 2 环     │    │ 第 3 环     │   │
│  │ LoongSuite  │───→│ Ontology +  │───→│ Agent-as-   │   │
│  │ Trajectory  │    │ Trace2Dataset│    │ a-Judge    │   │
│  │ 采集(84%)   │    │ (节省 90%)  │    │ (一致 90%)  │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│         │                                       │        │
│         └─────────────┬─────────────────────────┘        │
│                       ↓                                  │
│              ┌─────────────────┐                         │
│              │ 第 4 环         │                         │
│              │ 记忆库 + 经验库  │ ←──────── 评估反馈       │
│              │ 上下文工程       │                         │
│              └─────────────────┘                         │
│                       ↓                                  │
│              Agent 效果提升 → 更多数据 → 飞轮自转          │
└──────────────────────────────────────────────────────────┘
```

## 五、与既有实体的关联

| 实体 | 关系 | 互补角度 |
|---|---|---|
| [Alibaba Agent Observability Audit Loongsuite Pilot Coding Agent Blackbox To Transparent](../ch09/038-coding-agent.html) | **第 1 环底层** | LoongSuite Pilot 端侧 + 3 类 Agent 形态 + 4 大观测审计能力（401 行深度文档） |
| [Loongsuite Genai Semconv Alibaba](257-ai.html) | **第 1 环语义规范** | OTel GenAI semconv + STEP/MCP span 扩展的统一数据语言 |
| [Aliyun Cms2 Cli Skill Natural Language Observability](../ch07/054-skill.html) | **接入层** | CMS2 Skill 化（CLI 6 步 + K8s 自动注入 + 5 大场景） |
| [Harness Engineering实践做了一个平台让Ai一晚上自动评测和优化你的系统](../ch05/057-harness-engineering.html) | **同源早期表述** | 2026-04-29 阿里云"一晚上自动评测和优化你的系统"平台（评测→优化三轮 90.7→97.4→99.1），可能是 AgentLoop 早期形态或同系列产品 |
| [Agent Evolution Four Stages Six Dimensions Aliyun](../ch03/004-agent.html) | **理论框架** | 阿里"四阶段六维度"Agent 进化理论框架 |
| [Agentops Operationalize Agentic Ai Amazon Bedrock](../ch11/135-amazon-bedrock.html) | **AWS 平行方案** | Amazon Bedrock AgentCore Quality Evaluations |
| [Better Harness Eval Trace Harness Hill Climbing](../ch05/008-harness.html) | **trace 评估方法** | trace 级 harness 爬坡的工程方法 |

## 六、关键概念辨析

### Agent-as-a-Judge vs LLM-as-a-Judge

| 维度 | LLM-as-a-Judge | Agent-as-a-Judge |
|---|---|---|
| 评估对象 | 单点 (prompt, completion) | trajectory（执行轨迹） |
| 工具调用 | 无 | 有（调用工具、回放轨迹） |
| 一致率 vs 人类 | ~65% | **90%** |
| 成本 | 低 | 1/30 人工 |
| 代表产品 | 早期 OpenAI Evals | Meta DevAI / AgentLoop 13 个标准评估器 |

### 数据驱动 vs Trajectory 驱动（4 环飞轮内两条路径）

| 维度 | 数据驱动（路径一） | Trajectory 驱动（路径二） |
|---|---|---|
| 输入 | 评估结果（BadCase 集合） | 完整 trajectory + 上下文 |
| 速度 | 快（依赖人工迭代） | 慢但全自动化 |
| 资产形态 | Prompt / Skill / 工具链改写 | 可复用经验规则 / 长期记忆 / Skill |
| 典型适用 | 已知失败模式快速修复 | 长尾场景持续优化 |

## 七、实践启示

### 对企业：评估覆盖率是 Agent 规模化的命脉
LangChain 数据 — 22.8% 团队**完全不做评估**。没有评估就没有"知道哪里差"的能力，飞轮转不起来。AgentLoop 类平台的价值是把"评估"从奢侈品变成基础设施。

### 对平台建设者：4 环缺一不可
只做观测（环 1）而无图谱化（环 2）= 数据孤岛；只采集评估而无资产沉淀（环 4）= 飞轮转了一半。完整闭环需要产品级整合。

### 对 Agent 设计者：trajectory 是一等公民
LLM 时代模型权重是资产，Agent 时代 trajectory 是资产。设计 Agent 时就要考虑 trajectory 的可采集性、可评估性、可沉淀性 — 不是事后外挂。

### 对个人 Agent 进化：参考 Hermes / DreamGym / Reflexion 三种自进化范式
- Hermes 轨迹自我反思（运行时）
- DreamGym 合成经验回放（训练时）
- Reflexion episodic reflection（失败经验回灌）

## 八、引用与延伸阅读

→ [原文存档 (2026-06-18)](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/aliyun-agentloop-enterprise-agent-evolution-flywheel-pku.md)
→ [原文存档 (2026-07-08 新版详解)](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/aliyun-agentloop-2026-07-08-announce.md)

## 九、2026-07-08 更新：新版 AgentLoop 详解补充

2026-07-08 阿里云云原生发布了更详细的 AgentLoop 解读，补充以下信息：

- **MVP 五环**：将之前的 4 环细化为 5 环——观测审计、轨迹分析（新增 ATIF 格式）、效果评估、实验回测（新增 CI/CD 基线测试 + 场景化测试）、持续优化
- **Pipeline 能力**：支持 Trace QA 问答对提取，小时级数据窗口滚动执行，数千行轨迹数据秒级处理，成功率接近 100%
- **工具链覆盖**：Dify、LangChain/LangGraph、AgentScope + OpenClaw、Hermes、Qoder、Claude Code、Codex、Cursor
- **哲学框架**：Agent 进化是"模型能力尚未完全覆盖时的工程补位"，当模型足够强，外部脚手架终将被内化
- **企业价值**：通用模型不愿穷举的长尾地带（审批流程、合规要求、领域经验），Agent 进化体系有不可替代的价值

**学术参考**：
- 《Agent-as-a-Judge: Evaluate Agents with Agents》https://arxiv.org/abs/2410.10934
- Hermes 轨迹自我反思 https://hermes-agent.nousresearch.com/docs/
- DreamGym https://www.emergentmind.com/papers/2511.03773
- Reflexion https://arxiv.org/abs/2303.11366

## 十、2026-07-22 补充：千问AI平台「Agent 经验自进化」详解

2026-07-22 千问AI平台（阿里云官方）详细介绍了 AgentLoop 的「Agent 经验自进化」能力，聚焦第 4 环（经验库）的机制与 Bench 数据：

### 经验自进化飞轮

```
Trace 采集 → Trajectory 构建 → 经验挖掘 → 召回注入 → 新运行 → 再观测
```

关键数据：原始 Trace 清洗后，高价值 Trajectory 可降到 **4%-6%** 数据量级。``

### 5 项 Benchmark 结果

| Bench | 注入前 | 注入经验后 | Token 变化 |
|-------|--------|-----------|-----------|
| StarOps 指标查询 | 正确率 7.1% | 正确率 36.1% | -6.8% |
| OpenClaw / PawBench | 通过率 24.53% | 通过率 30.67% | -58.16% |
| PinchBench | 0.2928 | 0.3464，提升 18.3% | +2.9% |
| ClawProBench | 74.51% | 78.43%，提升 3.92pp | -11% |
| SWE-bench Verified | 67.2% | 74.4%，提升 7.2pp | 362.4M → 536M |

StarOps 中平均工具调用次数下降 25.1%，有害事件下降 27.8%。``

### 经验 vs Memory/RAG/Workflow/Skill/FT/RL

| 能力 | 解决的问题 | 如何生效 |
|------|-----------|---------|
| Memory | 用户/会话过去发生了什么 | 检索事实和偏好 |
| RAG / 知识库 | 文档和事实在哪里 | 从外部知识源检索 |
| Workflow / SOP | 标准流程怎么执行 | 人工定义的步骤和规则 |
| Skill | Agent 具备什么可复用能力 | 封装操作方法 |
| Fine-tuning / SFT | 改变模型的整体行为倾向 | 训练数据更新权重 |
| RL | 通过奖励优化模型策略 | 轨迹和奖励训练 |
| **经验自进化** | **当前情境下，过去哪些行动有效** | **从 Trajectory 挖掘，运行时检索注入** |

### 核心概念：「单位成功成本」

对企业最有意义的成本指标不是单次 Token，而是 **每完成一个成功任务需要消耗的 Token、时间、工具调用和人工介入**。经验注入在提高成功率的同时，减少无效推理、重复调用和人工调优。``

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agentloop-experience-self-evolution-aliyun-2026-07-22.md)
## 十一、2026-07-25 补充：Agent 经验自进化实操指南与多 Agent 共享经验

2026-07-25 阿里云云原生详细介绍了 AgentLoop 经验自进化的完整实操流程、多 Agent 共享经验机制以及成本-质量权衡分析：

### 实操四步流程

1. **创建经验库**：进入 AgentLoop 控制台 → 上下文工程 → 经验库，设置名称、提取 Agent 应用和 Trace 起始时间，自动开启经验挖掘
2. **创建访问凭证**：支持 API Key 和 AK/SK 两种方式
3. **安装 Recall Skill**：通过控制台自动生成的安装命令，一键配置 Agent 客户端
4. **验证召回**：使用 CLI 搜索经验，确认召回链路连通

### 多 Agent 共享经验

同一团队的多个 Agent 指向同一个经验库后，可以在权限范围内共享已验证的有效方法：

- 新 Agent 继承已有方法，降低冷启动成本
- 更换模型或 Agent 框架后，业务经验不必从零积累
- 通用经验跨 Agent 共享，业务专属经验按 AgentSpace 隔离
- 个人经验逐步转化为企业可管理、可追溯的能力资产

### 成本-质量权衡分析方法

AgentLoop 不只关注单一分数，而是同时衡量：成功率、同类任务稳定性、Token/成功任务、工具调用、耗时和超时率。

经验注入并不意味着 Token 必然下降——PinchBench (+2.9%) 和 SWE-bench (362.4M→536M) 在质量提升的同时消耗了更多 Token。合理的优化目标是**在质量护栏下优化单位成功成本**，而非单独追求最低 Token。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agentloop-agent-experience-self-evolution-aliyun-2026-07-25.md)

## 十二、2026-08-11 补充：UGC 游戏场景垂直落地方法论（3 天 7 步闭环）

阿里云云原生/夏明（涯海）给出 AgentLoop 在 Cloud Native UGC 游戏平台（Coding Agent 接进创作链路）的完整效果优化路径：**观测取证 → 分层评估 → 根因定位 → 优化回写 → 数据集回归 → 常态化监控**，实战 3 天完成首轮闭环，抓出 5+ 生产环境代码生成 Bug 与 API 文档缺陷。核心命题与第 3 环 Agent-as-a-Judge 呼应：Agent 的「自述」不可信，只有「轨迹」可信——绝大多数团队卡在"没有可取证的轨迹、没有能对齐业务的评估标准、没有能回归验证的数据集"。

### 分层评估：通用层 / 事实层 / 玩法层

评估器是整套方法的核心资产，按三层拆解避免「解释不了也优化不了的总分」：**通用层**（内置工具调用成功率/工具选择合理性评估器，当天出结果，问题在工具层/Skill 层与玩法无关）；**事实层**（API 事实性评估器，收益最大，第二天上线即在生产环境挖出 5+ Bug 与文档缺陷）；**玩法层**（判断做出来的是不是用户想要的——UGC 玩法是玩家想出来的，评估标准写死会变成创意天花板，所以放最后做）。

### LLM Judge vs Agent Judge 判断口诀 + 评估器六段式规范

判断口诀：**能一眼看出对错的用 LLM Judge，需要「动手查手册」才能定论的用 Agent Judge**（评分 Prompt + 挂载 Skills/MCP，评委按流程取证再判分）——UGC API 事实层必须用 Agent Judge。API 事实性评估器设计要点是把「唯一事实依据」钉死：只允许读取 ugc-api-reference-skill 的 reference 文件，**禁止用模型记忆/函数名相似性/其他引擎经验/常识推断/Agent 自己的说法替代 Skill 证据**；比率型计分 score = 正确项/(正确项+错误项)，「无法核验」项不计入分母——而**「无法核验」项恰恰暴露 API 文档体系缺口**（bindings 提及但 reference 无独立定义），评估器同时在评测 Agent 和体检文档。

评估器 Prompt 六段式组装（角色定义 → 前置提取步骤 → 评估维度 → 评分标准 → 评估内容 → 输出要求+示例），硬约束：占位符必须来自平台字段白名单；结果与过程分离（{{output}} 判结果、{{agent_trajectory}} 判流程）；explanation 必须可复核（写出计算过程：检查几项/子分/扣分原因/加权公式）；权重要能分摊（维度不适用时按比例分摊给生效维度，否则总分被系统性拉低）。

### 三级取证链与 Skill 防错护栏回写

低分样本不直接改 Prompt，固定走三级取证：①读评估理由定位问题类型 → ②回轨迹看现场（区分「Agent 判断错了」vs「Agent 拿到的信息本来就是错的」）→ ③回官方 API 文档核对（实战中意外发现文档本身的问题）。**实战 9 个错误项绝大多数根因在 Skill 与文档，改 Prompt 是治标**。

闭环的关键是**把评估结论反向写成 Skill 最小防错护栏**（实战案例：「开局生成一把枪放到背包」0 分样本——Agent 用了世界掉落物 API，玩家背包不会出现枪）。护栏设计四特征：①前置槽位校验（信息不全就不许写调用，源头掐掉猜测）②路由表（语义请求映射到确定 reference 文件，杜绝凭记忆选 API）③回读验证（保留返回 ID 二次读取确认，「声称成功」变「可验证成功」）④诚实声明（无法验证时写明「仅完成配置，未验证」，打掉虚报）。回写纪律：只改护栏不改自动生成的 references，每次回写跑 Skill 库校验 0 errors/0 warnings。

### BadCase 数据集回归 + experiment_id 透传 + 玩法层反清单设计

回归载体是 BadCase 数据集（首批 3 条 0/0.4/0.5 分即可跑通闭环——**价值在代表性不在规模**），必须加 tag 语义标注按语义路由到不同数据集，否则不相关样本全送进 Agent Judge 产生大量无效评估（纯烧钱）。**关键动作：透传 experiment_id** 到 Agent 轨迹，评估阶段提取，才能按实验过滤/仪表盘聚合/对比分析（设 Baseline 逐条比对）；实验前每道题新建独立 session 避免上下文污染。

玩法层设计原则（最直觉的「主流玩法清单+固定 Rubric」方向是错的——清单写死 = 评估器成为创意天花板）：**评估器不预设任何玩法，需求清单每次从用户输入动态抽取**，只判断「用户要的有没有正确做出来」；玩法无关五维度（需求覆盖度/可运行与可进入/实现正确性/反馈可见性/表达达成度）；纪律：只对用户显式要求计分、一切以轨迹证据为准（output 声称但轨迹无证据一律按未完成）、不评审美不评好玩程度。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agentloop-ugc-game-agent-eval-optimization-aliyun-2026-08-11.md)

## 十三、2026-08-11 补充：Skill 质量基线管理闭环（小红书科技 AMA）

阿里云云原生（小红书科技 AMA 活动帖）给出 AgentLoop 的 **Skill 评估闭环**：创建 → 可观测接入 → 离线实验 → Bad Case 分析 → 迭代验证 → 发布上线 6 步。与第十二节 UGC 游戏篇（Agent 效果评测：评估器设计/三级取证/护栏回写）互补——本节聚焦 **Skill 自身的质量门禁管理**，两节合起来构成「Agent 评测 + Skill 评测」双维度。

**Skill 质量基线门禁**：核心新增维度——用版本管理追踪评分趋势，建立质量基线（如总分≥80），**未达标前不发布上线**。这对应本文「准入准出门禁」的 Skill 侧实例化。Skill 大盘实时指标（加载次数/调用次数/使用用户数）提供可观测数据底座。

**离线实验评分维度**：自定义评分维度（任务完成度、工具调用准确性、输出格式规范性、安全边界遵守度等），生成加权总分 + 详细评估报告——与第十二节评估器六段式的「评分标准/权重分摊」规则互为表里。**Bad Case 四类分类**：Prompt 指令不清晰、工具调用错误、输出格式不符、安全边界突破，针对性优化后重新实验验证。

**实战案例**：云监控 2.0 全生命周期管理 Skill 两轮 Bad Case 优化 59→72 分，达基线后发布上线，形成「线上观测→离线评估→优化迭代→发布验证」持续改进闭环。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agentloop-skill-quality-baseline-xhs-2026-08-11.md)

## 十四、2026-08-28 补充：数据飞轮总览（5 篇系列开篇）

阿里云云原生（马云雷）《AgentLoop 数据飞轮实践（一）：总览》给出**更细的 7 环节数据飞轮**与**两种调优模式的显性框架**，作为 5 篇实操系列的开篇全景。

**7 环节数据飞轮**：接入（trace 接入，一切的地基）→ 观测（看清每次运行的模型/工具/路径）→ **审计**（合规视角安全检查，本环节在此前 4 环框架中未显式命名）→ 数据集（badcase 沉淀为飞轮"弹药库"）→ 评估（结果+过程双角度）→ **实验**（badcase 回测、建立实验计划、逐轮观测整体分数）→ 经验库（唯一不需要人类专家介入的环节）。飞轮关键不在单环节强，而在环节首尾相接：评估产出是实验输入，实验结论指回下一轮评估，经验库让每圈起点更高。

**两种调优模式的显性框架**：①**模式一 人类专家驱动**（手工闭环"专家知识 → 评估标准 → 数据沉淀 → 回测验证"）——价值不仅是抓 badcase，更在于把专家头脑里"这个回答不行"的**隐性判断固化成可复用可回测的显性标准（Rubric），标准本身是团队资产**；②**模式二 全自动化（经验库）**——把工具调用执行情况/延时/准确率/路径等通用维度自动挖掘为经验，装 Skill 自动召回。两模式互补：模式一建立标准兜底，模式二在标准之上自动增益。

**AgentSpace 工作空间**概念：数据、数据集、评估器、实验都归属在某个空间之下，"自动创建"可预置场景基础资源。演示基于 Claude Code / Claude Agent SDK 构建的客服 Agent，接入走探针或 webhook 两条路。**消融实验预告**：经验注入收益 耗时降低 30%~40%、成本降低 20%~47%（本系列最后一篇详述）。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agentloop-data-flywheel-overview-aliyun-2026.md)

## 十五、2026-09-01 补充：评估体系方法论（5 篇系列第三篇）

>

### 评估器两层结构

评估分两层：**评估器（Evaluator）** 定义"怎么评"——包含类型、输出定义、Rubric 评判标准，与具体数据无关可复用；**评估任务（Evaluation Task）** 定义"评什么数据、何时评"——指定评估器和数据源的执行配置。比喻：评估器是考卷和评分标准，评估任务是组织考试。

### 评估器类型：Agent 评估 vs Code 评估

- **Code 评估**：代码规则打分，确定便宜，只覆盖格式/长度/字段完整性等可规则化指标
- **Agent 评估（Custom Agent）**：评估 Agent 像人一样阅读 input/output/轨迹，按 Rubric 判断打分，覆盖语义级指标（回答是否切题/流程是否合理），代价是消耗更大

### 黄金指标 → Rubric 拆解

黄金指标分两类：**回答质量**（最终答案对不对）和**执行过程**（工具调用是否合理）。可让 AI 基于业务场景自动拆解成 Rubric——每个指标的分档规则、权重、总分公式。Rubric 把抽象的"好"拆成可判定评分细则，评估从"凭感觉"变成"可复现"。特别关注的指标（如"是否泄露隐私"）可提出来作为顶层评估器单独评估。

### 评估器输入/输出变量

三个输入变量：input（用户输入）、output（Agent 输出）、trace.agent（运行轨迹）——既能评结果也能评过程。输出结构化字段：score / raw-weighted score（0~1）/ final score / decision / scenario type / summary / explanation / **rubric version**（Rubric 迭代时区分"Agent 变了还是标准变了"）。

### 评估任务四配置

1. **轨迹数据 vs Trace 数据**：评估 Agent 行为用轨迹数据（智能体行为视角），非 Trace 数据（微服务基础设施视角）
2. **运行策略**：持续评估（来一条评一条，线上盯盘）/ 历史评估（某时段完整评估，复盘分析）
3. **采样配置**：最大样本数+采样比例控制成本，先采样跑通再全量
4. **字段映射**：trace.input→input, trace.output→output, 轨迹数据→trace.agent

### Badcase 闭环

评估结果不只打分，还给出"为什么是这个分"——证据字段提供判定依据，低分条目可直接定位调优方向。多次评估看均值消除浮动。在线评估抓出的 badcase 沉淀进数据集，成为实验回测弹药——评估是飞轮承上启下一环：上承观测数据，下接实验回测。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agentloop-eval-golden-metrics-rubric-mayunlei-aliyun-2026-09-01.md)

## 补充：离线实验平台与题目级 Rubric（第 4 篇）

> 以下内容来自系列第 4 篇，补充飞轮实体未覆盖的实验平台实现细节。

### 离线实验平台架构

AgentLoop 离线实验平台直接部署在客户内网，解决云端平台无法访问内网 Agent 的问题。架构分工：云端负责存储实验记录和展示大盘；内网平台负责执行——既能出网访问 AgentLoop 云端，又能在内网直接调用本地 Agent。数据不出内网，能力不打折扣。

### 实验计划与变量映射

创建实验计划时指定数据集，配置变量映射解决"评估器用哪个变量"的问题——一边是实验内置变量（input/output/轨迹），另一边是 dataset 原始内容。自定义变量标记实验上下文（版本号、实验记录 ID），版本号是大盘对比不同版本分数差异的前提。

### 题目级 Rubric 四步改造

在线评估用通用标准，但实验场景下每道题的评估标准不同——同一套 Rubric 评多道题会让优化失去方向。正确做法：Rubric 定义到题目级别，每道题绑定自己的评估标准。四步改造：①整理每道题 Rubric → ②数据集 schema 加 rubric 列 → ③评估器新增 rubric 变量（输出 rubric_id/score/reason/item_scores）→ ④实验侧从 dataset 读取 Rubric。

### 实验大盘与分数三步排查法

实验大盘提供整体分数、变化趋势、按题目下钻。为消除浮动可按时间窗口计算均值。分数分析三步法：①分数变低及时关注 → ②先排查 Rubric 定义（频繁波动多半是标准模糊）→ ③再看版本差异（评估器没问题后版本间差异才是真实差异）。避免最常见误判：把"尺子不准"当成"东西变差"。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agentloop-experiment-offline-platform-rubric-mayunlei-aliyun-2026-09-02.md)

---

