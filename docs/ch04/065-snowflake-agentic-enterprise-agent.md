# Snowflake Agentic Enterprise — 迈向可信的 Agent 平台

## Ch04.065 Snowflake Agentic Enterprise — 迈向可信的 Agent 平台

> 📊 Level ⭐⭐ | 21.5KB | `entities/snowflake-agentic-enterprise-summit-2026.md`

## 概述

Snowflake 在 **Summit 2026** 通过 Platform Keynote 发布 CoCo / CoWork 双引擎、Cortex Sense、Agent Identity、Data Movement Policies、Datastream、Agentic Search 等一系列产品，**核心主张是从 "can we" 走向 "shall we"**——大模型已证明能不能做，但企业真正要决定的是敢不敢用。Snowflake 把 AI 的复杂性收进底层，把可信度带到业务前台。

**Benoit Dageville 的核心判断**："**最好的 Agent 平台，必须建立在最好的数据平台之上。**" 当 Agent 开始行动，企业 AI 的可信度，最终仍要回到数据平台本身。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

## 核心叙事转换

| 阶段 | 关心 | 状态 |
|------|------|------|
| **两年前** | 参数多少亿、上下文窗口多长、benchmark 排第几 | "能不能做" |
| **2026** | AI 做错了谁负责 / 智能体执行可信度 | "**敢不敢用**" |

**当智能体开始自主查询数据库、调用 API、生成报告、触发审批、修改业务数据时，它就是具备行动能力的数字员工。数字员工犯错代价可能比人类员工更高**——它可以以毫秒级速度把错误放大到整个组织。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

## CoCo + CoWork 双引擎闭环

### CoCo（Cortex Code → 改名）

**改名由用户驱动**——"Denise 说，我们干脆就别再叫 Cortex Code 了，直接叫 CoCo 怎么样？" ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

**演进路径**：命令行 + Snowsight → 6 个月内扩展到 Airflow / dbt / Spark / MCP / ACP / SDK / Agent Teams → Summit 26 新增 **Cloud Agents GA / 本地开发沙箱 / 自动化能力 / 自主智能体 / 技能目录 / CoCo Desktop GA**。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

**关键创新 — Snap and Ask（划选提问）**：拖拽选中图表某区域，点击 explain，CoCo 基于视觉上下文给出分析。"这种交互方式已经不只是'使用数据库'，而更像是在与数据协作。" ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

### CoWork（Snowflake Intelligence → 改名）

- **Intelligence 强调智能能力**
- **CoWork 强调协作关系** — AI 不再只是工具，而是企业工作流中的协作者

**F1 / 钢铁侠愿景**："从 CEO 到每一位一线员工。如果你喜欢 F1，想象每个人都有自己的维修团队。如果你喜欢钢铁侠，每个人都有自己的 Jarvis。" ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

**关键能力**： ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

| 能力 | 作用 |
|------|------|
| **Personal Work Engine** | 不必手动选择 Agent；自动多 Agent 编排，按请求类型路由 |
| **User Memory** | 学习用户偏好、习惯、工作模式，越用越懂 |
| **Personal Skills / Personal MCP** | 每个用户连接自己的业务系统 |
| **Scheduled Tasks** | "这个分析我喜欢，你能每周或每月发给我一次吗？" |
| **Artifacts** | 不再是静态报告，而是实时数据的**受治理视图**——可被共享、协作、持续更新 |

**双引擎闭环**：开发者在 CoCo 中构建和认证 AI 应用，业务用户在 CoWork 中消费和协作，**两者共享同一套治理框架和安全策略**。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

## Cortex Sense — 24% → 83% 开箱准确率

Cortex Sense 从 Snowflake 已有数据和活动中构建信号，自动增强 Agent。**在评估集上，搭配 Cortex Sense 后 CoCo 和 CoWork 的开箱准确率从 24% 提升到 83%**。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

**Natoma 收购** — 100+ 业务系统连接器延伸触达范围。Christian 把 CoCo / CoWork 定位为 **control planes**——连接数据、模型和应用的工作入口，让 AI 的分析、协作和行动运行在同一套治理框架下。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

## 标杆案例

### Samsung SIA（shopper's insight action agent）

- **Galaxy S26 发布时** SIA 不只是检索数据，而是在数据之上**推理和行动**：比较发布表现 / 规划步骤 / 调和信号 / 给出综合答案
- 过去数小时的分析工作 → 现在**几秒内完成**
- **全球约 1,000 名高管、销售和营销人员**正在使用 SIA — 他们不是数据科学家，而是负责区域目标、促销策略、产品路线图的**业务领导**
- "数据团队不再是唯一入口，每位业务领导都可以在自己的工作流中获得分析能力"

### Thomson Reuters CoCounsel

- **每天 1,000,000+ 专业人士**使用
- 财务和业务部门**15,000+ 内部用户**每天使用语义智能做最关键的财务决策
- "**我们已经从试点走向生产环境**，每一个 AI 能力在进入市场之前，都会经过负责任 AI 的流程"

## AI 时代没有"慢数据" — Datastream

**Snowflake 亲自下场做流**（过去流处理不是强项，企业要额外部署 Kafka）： ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

| 能力 | 特性 |
|------|------|
| **Kafka Wire 协议兼容** | 不需要重写生产者/消费者 |
| **零拷贝流式处理** | 减少序列化开销 |
| **亚秒级延迟** | 数据流入流出 Snowflake |
| **存储与计算分离** | Snowflake 经济模型延续到流 |

**为什么？** AI 智能体开始自主监控业务信号、规划行动步骤、触发业务流程时，**延迟就变成了商业生死线**。**在 Agent 时代，没有"慢数据"的生存空间**。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

## Agentic Search — 不是 Top-K，是精确提取

**不做传统 RAG 的"Top-K 模糊匹配"**： ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

1. 利用 AI 函数从非结构化数据中**提取信息** ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]
2. 提取为**结构化信息** ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]
3. 运行**精确的分析查询** ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]
4. 返回基于非结构化内容的**精确分析结果** ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

**企业分散在文档、邮件、合同中的"暗数据"**，现在可被智能体直接调用、解析、计算，**结果精确到可支撑业务决策**。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

## 治理升维：从"管数据"到"管行为"

### 五大治理能力

| 能力 | 作用 |
|------|------|
| **Agent Identity（智能体身份）** | 知道某段代码 / 某项活动是否发生在 Agent 上下文下；脱敏策略 / 行级策略中可针对 Agent 上下文设置不同可见性权限。**同一个数据库表，人类查询和智能体查询可被施加不同安全策略** |
| **Data Movement Policies（数据流转策略）** | 规定带某个标签的数据不得移动到 stage、不得通过 Snowsight UI 下载。Keynote demo：Tour Ops 员工试图让 CoWork 导出 VIP 客户数据到外部 stage，**数据流转策略直接阻止**——即使智能体本身有能力查看那张表 |
| **Horizon AI 护栏** | 防止提示注入和越狱攻击 |
| **Multi-party approvals** | 高度敏感操作必须两个管理员同意 |
| **Trust Center AI 安全巡检** | 持续监控异常数据传输 |

### Snowflake 对 Agent 治理边界的重新定义

未来企业数据平台不仅要回答"谁能访问什么数据"，还要回答： ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]
- "**智能体在什么情况下可以做什么操作**"
- "**AI 的行为如何被审计和回溯**"
- "**当智能体犯错时，责任边界在哪里**"

## 语义上下文（Horizon Context）

仅有智能是不够的，**很多时候真正缺少的是上下文**。Horizon Context 作为 Horizon Catalog 组成部分：收集信号 → 丰富信号 → 提供给 CoCo / CoWork / Cortex Agent。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

**关键洞察**：通过语义视图和元数据连接器，让 AI 不仅"能访问数据"，而且"**能理解数据的业务含义**"。**只有当智能体理解"这张表里的收入是毛利还是净利"，它给出的答案才是可信的**。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

## 意图驱动治理（Intent-Driven Governance）

**降低治理操作的技术门槛**——企业管理者不需要写复杂策略脚本，**只需要用自然语言表达意图**： ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

> "把我的数据库中所有个人敏感信息找出来，并确保它受到保护。"

**系统自动触发**：分类 → 找出个人敏感信息 → 创建正确策略 → 持续监控。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

**治理的民主化**——不再是少数安全专家的专利，而是每个业务负责人都可以直接施加的控制力。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

## 越开放，越不可或缺

### 开放标准投入

- **Apache Iceberg v3** 广泛实现
- **Apache Polaris** Iceberg Catalog interfaces 纳入 Horizon Catalog
- 牵头创建 **Open Semantic Interchange Group**
- **Reshare data GA** + **Open sharing public preview**

### 生态合作

- 业务系统侧：Salesforce / Workday / SAP / IBM mainframe/Db2 / Veeva
- **Query across**：Snowflake CoWork 可在 Redshift / Postgres / 其他数据源上提供 Snowflake 和 Snowflake AI 能力
- **Multi-party collaboration**（Samsung / Netflix 案例）：多个参与方在同一安全环境协作，不同角色拥有不同权限

**"开放底座、深度协同"的逻辑**： ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]
- 数据格式和访问协议需要足够开放，企业才会放心把关键数据和流程接入平台
- 当 Agent 真正进入业务流程，价值就不只来自数据本身，还来自围绕数据不断沉淀的**上下文、权限体系、行为历史和业务语义**
- **数据可以保持开放流动，但围绕数据形成的智能协作经验会沉淀为新的平台价值**
- **迁移成本 = "智能迁移"的成本**（而非数据迁移成本）

## 关键判断："Can we → Shall we"

| 时代 | 关注点 | 含义 |
|------|--------|------|
| **Can we** | 能力展示 | 大模型证明能不能做 |
| **Shall we** | 责任承接 | 企业真正要决定的是**敢不敢用** |

**企业 AI 的下一场竞争**——把 AI 的复杂性收进底层，把可信度带到业务前台。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

## 关键数字

| 指标 | 数值 | 来源 |
|------|------|------|
| Cortex Sense 准确率提升 | 24% → **83%** | Summit 26 评估集 |
| Samsung SIA 内部用户 | **~1,000** 名高管/销售/营销 | Jung Suh |
| Thomson Reuters CoCounsel 外部用户 | **1,000,000+** 专业人士/天 | Caitlin Halferty |
| Thomson Reuters CoCounsel 内部用户 | **15,000+** 财务/业务 | 同上 |
| Natoma 连接器数 | **100+** 业务系统 | Snowflake |

## 深度分析

### 1. "Can we → Shall we" 是企业 AI 的临界点叙事

过去两年，企业 AI 关注 benchmark 排名 / 上下文长度 / 推理速度等技术维度。但当智能体开始**真正执行任务**（查询数据库 / 修改业务数据 / 触发审批），出错代价的归责问题就出现了。Snowflake 的价值定位是**把"信任问题"压回数据平台**——通过 Agent Identity / Data Movement Policies / 治理护栏，让智能体在企业边界内"敢"行动。这与 AWS Bedrock AgentCore / Anthropic Managed Agents 走的是**同一条路径**，但 Snowflake 的差异化在于**从数据平台出发**（其他厂商从模型平台出发）。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

### 2. 改名的产品哲学：让用户重新定义品牌

- **Cortex Code → CoCo**：用户叫出来的名字，形成"被用户认领"的品牌资产
- **Snowflake Intelligence → CoWork**：从"智能"（能力）转向"协作"（关系）—— 反映了 AI 在企业的角色从工具升级为协作者

这种**用户驱动的命名 + 关系导向的命名**，比厂商自创技术名词更有亲和力。Christian 在台上笑着说出"Denise 说..."本身就传递了**Snowflake 对用户反馈的尊重**。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

### 3. 治理的"民主化"与"动态化"

**传统治理** = 写复杂策略脚本，由安全专家维护 — 治理是"少数人的事"。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]
**Snowflake 意图驱动治理** = 自然语言意图 → 自动分类 + 找敏感信息 + 创建策略 + 持续监控 — **每个业务负责人都可直接施加控制力**。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

**传统治理 = 静态**（写好规则不再变）。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]
**Snowflake 治理 = 动态**（智能体行为可审计、可回溯、可追责）。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

这是企业 AI 治理从"合规"升级为"运营"的关键变化。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

### 4. 智能协作经验是新平台价值

**开放 vs 中心化** 不矛盾——Snowflake 看似强调开放（Iceberg / Polaris / Open sharing），但实际通过**让 AI / 治理 / 协作能力进入更多外部系统**（Query across / 与 Salesforce / SAP 集成）把自己放到更多数据和 AI 工作流的交汇处。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

> 数据可以保持开放流动，但围绕数据形成的智能协作经验，会逐渐沉淀为新的平台价值。

**这种"经验沉淀型"的护城河比数据本身更难迁移** — 业务用户可能换数据库，但训练好的 CoWork 记忆 + 多 Agent 编排模式 + 业务语义上下文要重新积累数月甚至数年。 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

## 实践启示

### 何时考虑 Snowflake Agent 平台

- **已有 Snowflake 数据仓库** 且希望 AI 能力直接基于数据平台构建
- 需要**可审计的智能体行为**（合规 / 金融 / 医疗等受监管行业）
- 业务**非数据科学家背景**的高管/运营需要直接获取分析能力
- 需要**跨数据源联邦查询**（Redshift / Postgres / 业务系统）
- 需要**实时数据流** 与 AI 智能体决策串联

### 落地路径

1. **试点 CoCo + CoWork**：在受控数据集上验证 24% → 83% 的 Cortex Sense 提升是否在自己的数据上成立 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]
2. **设计 Agent Identity 策略**：先识别"哪些操作必须区分人类 vs 智能体上下文" ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]
3. **定义 Data Movement Policy 标签体系**：从最敏感的数据标签开始（如 VIP 客户 / 财务数据） ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]
4. **设置 Multi-party Approval 流程**：对高敏感操作强制双人审批 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]
5. **建立意图驱动治理模板**：把常见治理意图（如"找敏感信息 + 保护"）写成自然语言模板 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]
6. **跨数据源联邦**：评估 Query across 能否替代部分 ETL 流水线 ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]
7. **用户记忆 + 调度任务**：从高频分析需求开始沉淀 User Memory ^["[InfoQ 奇遇旧金山: Snowflake 迈向 Agentic Enterprise 的关键一跃](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)"]

### 与其他 Agent 平台的对比

| 维度 | Snowflake Agentic Enterprise | AWS Bedrock AgentCore | Anthropic Managed Agents |
|------|------------------------------|------------------------|--------------------------|
| **起点** | 数据平台 | 模型平台 | 模型平台 |
| **核心优势** | Agent Identity / Data Movement Policy / 治理深度 | AWS 生态整合 / 多模型路由 | 模型质量 / Claude 优势 |
| **数据流** | 亚秒级原生 (Datastream) | 依赖 Kinesis / Kafka | 依赖外部存储 |
| **业务用户入口** | CoWork (从 Intelligence 改名) | Quick Suite | 较弱 |
| **开源开放** | Iceberg / Polaris / Open Semantic Interchange | 较弱 | 无 |

## 相关实体

- [Agent Security Three Step Sequence Harness Governance Identity Crewai](../ch05/009-harness.md)（Agent Identity 同源思路 — 治理协议层）
- [Agentscope Builder Enterprise Self Evolving Agent Harness](../ch05/038-agent-harness.md)（企业级 Agent Harness 同主题）
- [Asana Agentic Work Management Platform Lettertwo](../ch03/045-agent.md)（Asana — 另一个企业级 Agent 平台视角）
- [Building Multi Tenant Agents With Amazon Bedrock Agentcore](ch04/501-amazon-bedrock-agentcore.md)（AWS Bedrock AgentCore — 对比平台）
- [Anthropic 官方 Agent Harness 平台Claude Managed Agents 完整指南](ch04/608-claude-managed-agents.md)（Anthropic Managed Agents — 另一家厂商视角）
- [Spec As Aios Anti Entropy Architecture Gaode Ai Native Series 2](../ch05/018-ai-native.md)（Spec-as-AIOS — 治理即架构同思路）
- [Taobao Ai Sre Digital Employee Code Quality Governance](../ch01/1015-ai-sre.md)（数字员工治理 — 行业对照）
- [Agentops Operationalize Agentic Ai Amazon Bedrock](../ch11/152-amazon-bedrock.md)（AgentOps — 智能体可观测性对照）
- [Ai Tool Poisoning Exposes A Major Flaw In Enterprise Agent Security](ch04/296-ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-s.md)（企业 Agent 安全风险同主题）
- [Amazon Quick Accelerating The Path From Enterprise Data To Ai Powered Decisions](../ch11/202-amazon-quick.md)（Amazon Quick — 另一家企业数据分析平台）

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/snowflake-agentic-enterprise-summit-2026-infoq.md)

---

