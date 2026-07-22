---
title: "Snowflake 迈向 Agentic Enterprise 的关键一跃 — Summit 2026 Platform Keynote 解读"
source_url: "https://mp.weixin.qq.com/s/wBWSwI4_RDd_XE5KT-i53w"
mp: "InfoQ 中国奇遇团"
author: "王玮"
pub_date: "2026-06-12"
ingested: "2026-06-12"
sha256: "798fdc4ae077a6c6aa65b638b533ea197b5f8f710ea9ffff3649f055ffd5dcc3"
type: source
tags: ["snowflake", "agentic-enterprise", "agent-identity", "data-movement-policy", "cowork", "cortex-code", "agentic-search", "datastream", "summit-2026", "trust"]
---

# Snowflake 迈向 Agentic Enterprise 的关键一跃

## 叙事转换：从"能做什么"到"敢不敢用"

2026 年企业 AI 市场的叙事悄然转换：
- 两年前：参数多少亿、上下文窗口多长、benchmark 排第几 — 关心"能不能做"
- 2026 年：技术可行性被验证后，真正让 CIO 和 CDO 夜不能寐的问题变成 "**AI 做错了，谁负责？**"

当智能体开始自主查询数据库、调用 API、生成报告、触发审批，甚至直接修改业务数据时，它就不再是辅助工具，而是具备行动能力的**数字员工**。数字员工犯错代价可能比人类员工更高——**它可以以毫秒级速度把错误放大到整个组织**。

**Benoit Dageville 的核心判断**："**最好的 Agent 平台，必须建立在最好的数据平台之上。**" — 当 Agent 开始行动，企业 AI 的可信度，最终仍要回到数据平台本身。

## CoCo + CoWork 双引擎

### CoCo（Cortex Code 改名 — 被用户叫出来的名字）

Cortex Code 正式更名为 **Snowflake CoCo**——这个改名"不是官方起的，是用户叫出来的"。"Denise 说，我们干脆就别再叫 Cortex Code 了，直接叫 CoCo 怎么样？"

**演进速度**：
- 起步：命令行 + Snowsight
- 六个月内扩展：Airflow / dbt / Spark / MCP / ACP / SDK / Agent Teams
- Summit 26 新增：Cloud Agents 即将 GA / 本地开发沙箱 / 自动化能力 / 自主智能体 / 技能目录 / **CoCo Desktop GA**

**关键创新** — 划选提问（**Snap and Ask**）：拖拽选中图表某区域，点击 explain，CoCo 基于**视觉上下文**给出分析。"这种交互方式已经不只是'使用数据库'，而更像是在与数据协作。"

### CoWork（Snowflake Intelligence 改名 — 从智能到协作）

Christian 坦承："它的范围已经远远超出了我们最初的设想。它正在改变我们的工作方式。" 因此 Snowflake Intelligence 被重新命名为 **Snowflake CoWork**。

- **Intelligence** 强调智能能力
- **CoWork** 强调协作关系 — AI 不再只是工具，而开始成为企业工作流中的协作者

**愿景描述**（F1 / 钢铁侠类比）："从 CEO 到每一位一线员工。如果你喜欢 F1，想象每个人都有自己的维修团队。如果你喜欢钢铁侠，每个人都有自己的 Jarvis。"

**关键能力更新**：
| 能力 | 作用 |
|------|------|
| **Personal Work Engine** | 不必手动选择用哪个 Agent；自动执行多 Agent 编排，根据请求类型路由到不同能力模块 |
| **User Memory** | Agent 学习用户偏好、习惯、工作模式，越用越懂 |
| **Personal Skills / Personal MCP 连接器** | 每个用户连接自己的业务系统 |
| **Scheduled Tasks** | "这个分析我喜欢，你能每周或每月发给我一次吗？" |
| **Artifacts** | 不再是静态报告，而是**实时数据的受治理视图**，可被共享、协作、持续更新 |

**双引擎闭环**：开发者在 CoCo 中构建和认证 AI 应用，业务用户在 CoWork 中消费和协作，**两者共享同一套治理框架和安全策略**。

## Cortex Sense — 24% → 83% 的开箱准确率提升

Cortex Sense 从 Snowflake 已有的数据和活动中构建信号，自动增强 Agent。在评估集上，**搭配 Cortex Sense 后，CoCo 和 CoWork 的开箱准确率从 24% 提升到 83%**。

**Natoma 收购延伸** — 借助 100+ 业务系统连接能力，让 CoCo / CoWork 更自然触达企业日常应用。Christian 把它们定位为 **control planes**——连接数据、模型和应用的工作入口。

## 标杆案例

### Samsung SIA（shopper's insight action agent）

三星 Galaxy S26 发布时，SIA 不只是检索数据，而是在数据之上**推理和行动**：比较发布表现 / 规划步骤 / 调和信号 / 给出综合答案。**过去数小时的分析工作，现在可以在几秒内完成**。

关键：Samsung 全球**约 1,000 名高管、销售和营销人员**正在使用这个 Agent——他们不是数据科学家，而是直接负责区域目标、促销策略和产品路线图的**业务领导**。"数据团队不再是唯一入口，每位业务领导都可以在自己的工作流中获得分析能力。"

### Thomson Reuters CoCounsel

**每天超过 100 万专业人士使用**，财务和业务部门**15,000+ 内部用户**每天使用语义智能做最关键的财务决策。Caitlin Halferty（CDO）："**我们已经从试点走向生产环境**，每一个 AI 能力在进入市场之前，都会经过负责任 AI 的流程。"

## AI 时代没有"慢数据" — Datastream

Snowflake 崛起建立在"批处理"哲学之上（计算与存储解耦、弹性扩展）。过去流处理不是强项，企业要额外部署 Kafka。

**现在 Snowflake 亲自下场做流**：
- 兼容 **Kafka Wire 协议**
- **零拷贝流式处理**
- **亚秒级延迟**将数据流入和流出 Snowflake
- 存储与计算分离

**为什么？** AI 时代数据消费模式从"T+1 报表"变成"实时决策"。**当 AI 智能体开始自主监控业务信号、规划行动步骤、触发业务流程时，延迟就变成了商业生死线**。智能体不可能等批处理任务跑完再做决策。

**在 Agent 时代，没有"慢数据"的生存空间**。

## Agentic Search — 不是 Top-K，是精确提取

**不会做传统 RAG 那种"给你 Top-K 结果"的模糊匹配**，而是：
1. 利用 AI 函数从非结构化数据中**提取信息**
2. 提取为**结构化信息**
3. 运行**精确的分析查询**
4. 返回基于非结构化内容的**精确分析结果**

**企业过去分散在文档、邮件、合同中的"暗数据"**，现在可以被智能体直接调用、解析、计算，**而且结果精确到可以支撑业务决策**。

## 从"管数据"到"管行为" — 治理升维

Christian 直接表态："在智能体时代，我们希望确保大家能够保护自己的 Agent，并拥有多层防护。"

Snowflake 的治理逻辑发生**根本性升维**——从"管理静态数据"转向"**管理动态智能体行为**"。

### 五大治理能力

| 能力 | 作用 |
|------|------|
| **Agent Identity（智能体身份）** | 知道某段代码或某项活动是否发生在 Agent 上下文下；脱敏策略 / 行级策略中可针对 Agent 上下文设置不同可见性权限。**同一个数据库表，人类查询和智能体查询可以被施加不同安全策略** |
| **Data Movement Policies（数据流转策略）** | 规定带某个标签的数据不得移动到 stage，也不得通过 Snowsight UI 下载。Keynote demo：Tour Ops 员工试图让 CoWork 导出 VIP 客户数据到外部 stage，**数据流转策略直接阻止了这次数据外泄**——即使智能体本身有能力查看那张表 |
| **Horizon AI 护栏** | 防止提示注入和越狱攻击 |
| **Multi-party approvals（多方审批）** | 高度敏感操作必须两个管理员同意 |
| **Trust Center AI 安全巡检 + 检测包** | 持续监控异常数据传输 |

**Snowflake 对 Agent 治理边界的重新定义**：未来企业数据平台不仅要回答"谁能访问什么数据"，还要回答：
- "**智能体在什么情况下可以做什么操作**"
- "**AI 的行为如何被审计和回溯**"
- "**当智能体犯错时，责任边界在哪里**"

## 语义上下文（Horizon Context）

仅有智能是不够的，很多时候真正缺少的是上下文。**Horizon Context** 作为 Horizon Catalog 的组成部分：
- 收集信号
- 丰富这些信号
- 提供给 CoCo / CoWork / Cortex Agent

通过语义视图和元数据连接器，**让 AI 不仅"能访问数据"，而且"能理解数据的业务含义"**。这是智能体从"工具"升级为"协作者"的关键一跃——**只有当智能体理解"这张表里的收入是毛利还是净利"，它给出的答案才是可信的**。

## 意图驱动治理（Intent-Driven Governance）

**降低治理操作的技术门槛**。企业管理者不需要再写复杂策略脚本，**只需要用自然语言表达意图**：

> "把我的数据库中所有个人敏感信息找出来，并确保它受到保护。"

**系统自动**：
1. 触发分类
2. 找出个人敏感信息
3. 创建正确的策略
4. 持续监控

**治理的民主化**——不再是少数安全专家的专利，而是每个业务负责人都可以直接施加的控制力。

## 越开放，越不可或缺

### 开放标准投入

- **Apache Iceberg v3** 广泛实现
- 将 **Apache Polaris** 的 Iceberg Catalog interfaces 纳入 Horizon Catalog
- 牵头创建 **Open Semantic Interchange Group**
- **Reshare data GA** + **Open sharing public preview**

**为什么强调开放？** 企业在进入 AI 深水区后，对供应商锁定的警惕更强。Agent 天然需要跨系统行动——数据可能在不同平台，业务流程可能在不同 SaaS 应用，模型也可能来自不同厂商。**一个平台如果不能证明自己足够开放，就很难成为企业 AI 的长期底座**。

### 生态合作

- 业务系统侧：Salesforce / Workday / SAP / IBM mainframe/Db2 / Veeva
- **Query across 能力**：Snowflake CoWork 可在 Redshift / Postgres 或其他数据源上提供 Snowflake 和 Snowflake AI 能力
- **Multi-party collaboration**（Samsung / Netflix 案例）：多个参与方在同一安全环境协作，不同角色拥有不同权限——有人贡献数据，有人负责分析

**"开放底座、深度协同"** 的生态策略逻辑：
- 数据格式和访问协议需要足够开放，企业才会放心把关键数据和流程接入平台
- 当 Agent 真正进入业务流程，价值就不只来自数据本身，还来自围绕数据不断沉淀的**上下文、权限体系、行为历史和业务语义**

> **数据可以保持开放流动，但围绕数据形成的智能协作经验，会逐渐沉淀为新的平台价值**。当销售、客服、财务等不同 Agent 都在 Snowflake 的治理框架下运行了数月甚至数年之后，迁移成本就不再是数据迁移的成本，而是**"智能迁移"的成本**。

## 关键判断："Can we → Shall we"

Christian 在 Keynote 最后说，Snowflake 正从 **"can we"** 的时代走向 **"shall we"** 的时代：
- "can we"：能力展示 — 大模型证明了能不能做
- "shall we"：责任承接 — 企业真正要决定的是敢不敢用

**企业 AI 的下一场竞争，会从"把 AI 的复杂性收进底层、把可信度带到业务前台"真正开始**。

## 关键数字

| 指标 | 数值 | 来源 |
|------|------|------|
| Cortex Sense 准确率提升 | 24% → **83%** | Summit 26 评估集 |
| Samsung SIA 内部用户 | **~1,000** 名高管/销售/营销 | Jung Suh / 三星电子 |
| Thomson Reuters CoCounsel 外部用户 | **1,000,000+** 专业人士/天 | Caitlin Halferty / 汤森路透 |
| Thomson Reuters CoCounsel 内部用户 | **15,000+** 财务/业务 | 同上 |
| Natoma 连接器数 | **100+** 业务系统 | Snowflake |

## 核心人物

- **Benoit Dageville** — Snowflake 联创
- **Christian Kleinerman** — Snowflake 产品执行副总裁
- **Jung Suh** — 三星电子执行副总裁（SIA 案例）
- **Caitlin Halferty** — 汤森路透 CDO（CoCounsel 案例）
- **Patrick Duroseau** — 安德玛（Under Armour）首席数据与 AI 官

## 收尾

"信任竞争刚刚开始。"

2026 年企业 AI 的问题正在改写——大模型已证明"能不能做"，但企业真正要决定的是"敢不敢用"。Snowflake 此次展示的性能、治理、上下文、开放生态和 Agent 行为管理，都指向**同一个方向**：**把 AI 的复杂性收进底层，把可信度带到业务前台**。
