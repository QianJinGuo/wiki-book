---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/ai-dlc-ai-driven-development-life-cycle-2025-development
ingested: 2026-07-21
feed_name: AWS China Blog
source_published: 2026-07-21
sha256: 11ab29b32c4f4963e3b5889560fabb05f8f2975e6535e07e5628dde597b69f09
---

# AI-DLC 在数据工程中的实践：从分层建模到数据质量的全流程协作

摘要：本文将介绍 AI-DLC（AI-Driven Development Life Cycle）——亚马逊云科技于 2025 年提出的一套开发方法论——在数据工程场景中的落地实践。我们将通过两个真实案例，展示 AI-DLC 如何在分层建模和数据质量管理这两个数据工程核心场景中发挥价值。

**目录**

01 一、引言

02 二、什么是 AI-DLC

03 三、AI-DLC 核心框架与数据工程角色转变

04 四、实战一：用 AI-DLC 构建 dbt 分层模型

05 五、实战二：基于 Kiro 的规范驱动数据质量管理

06 六、AI-DLC 带来的根本性变化

07 七、落地建议

08 八、结语

* * *

## **一、引言**

在数据工程领域，”让 AI 帮忙写 SQL”早已不是新鲜事。但当需求不仅仅是补全几行代码，而是从模糊的业务问题出发、经历口径定义、分层建模、质量规则设计、一路到生产部署和持续监控，传统的”AI 辅助编程”模式就显得力不从心了。

本文将介绍 [AI-DLC（AI-Driven Development Life Cycle）](<https://prod.d13rzhkk8cj2z0.amplifyapp.com/>)——亚马逊云科技于 2025 年提出的一套开发方法论——在数据工程场景中的落地实践。我们将通过两个真实案例，展示 AI-DLC 如何在分层建模和数据质量管理这两个数据工程核心场景中发挥价值。

## **二、什么是 AI-DLC**

AI-DLC 的核心思想可以用一句话概括：AI 做执行主体，人做关键决策者。

在传统开发流程中，开发者是执行者，AI 是辅助工具——帮你补全代码、生成测试、提供建议。AI-DLC 颠倒了这个角色关系：AI 负责分析需求、提出方案、生成代码、推进部署；人则退到”审批者”的位置，在关键决策点（我们称之为 Human Gate）进行方向判断和风险把控。

AI-DLC 将整个开发生命周期划分为三个阶段：

  * Inception（对应传统的需求分析与设计）：AI 将业务意图转化为结构化的需求文档和技术规格，团队通过 “Mob Elaboration” 进行实时验证和校准。
  * Construction（对应传统的编码与测试）：AI 提出架构方案并生成代码，团队通过 “Mob Construction” 进行实时决策和审核。
  * Operations（对应传统的部署与运维）：AI 管理基础设施即代码（IaC）和部署流程，团队进行监督。



除了阶段划分，AI-DLC 还引入了两个重要的概念变化：

  1. Bolt 取代 Sprint：传统 Scrum 中的两周冲刺被压缩为小时到天级别的迭代单元。AI 的执行速度使得快速反馈成为可能。
  2. Unit of Work 取代 Epic：任务被拆解为更小的独立单元，每个 Unit of Work 都可以独立验证、独立交付。



这些变化带来的结果是：开发节奏更快，反馈循环更短，同时每一步都有明确的人工审查节点，确保质量和方向可控。

## **三、AI-DLC 核心框架与数据工程角色转变**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/ai-dlc-ai-driven-development-life-cycle-2025-development-1.png>) [图1]  
---  
  
在 AI-DLC 框架中，AI 通过结构化流程与人类协作，将业务意图转化为可部署的软件系统。

角色/角色定位 | 传统数据工程职责 | AI-DLC 转型中的职责 | 主要收益  
---|---|---|---  
数据产品经理 | 

  * 手动收集业务需求
  * 定义数据产品路线图
  * 协调跨团队数据资产优先级角色定位: 需求翻译者

| 

  * 验证 AI 生成的需求分析和用户画像
  * 批准 AI 推荐的数据产品策略
  * 指导 AI 进行市场洞察挖掘新重点：AI 辅助产品决策

| 

  * 更快的需求洞察
  * 数据驱动的优先级决策
  * 产品迭代加速：从月度到周级发布

  
数据工程师 | 

  * 手动编写 ETL/ELT 管道
  * 数据建模和 Schema 设计
  * 数据质量监控和修复角色定位: 管道构建者

| 

  * 验证 AI 生成的数据管道代码
  * 批准 AI 推荐的数据模型和优化方案
  * 指导 AI 进行性能调优和架构演进新能力：主动式 AI 驱动数据治理

| 

  * 管道开发提速 5-10x
  * 自动化数据质量保障
  * 工程卓越：自愈式数据管道

  
数据分析师 | 

  * 手动编写 SQL 查询和报表
  * 探索性数据分析
  * 制作可视化仪表盘角色定位：洞察发现者

| 

  * 验证 AI 生成的分析结论和洞察
  * 批准 AI 推荐的分析模型和指标
  * 指导 AI 进行深层因果分析新重点：从描述性分析到预测性决策

| 

  * 分析周期从天缩短到小时
  * 更深层的业务洞察
  * 决策加速：实时洞察驱动行动

  
数据架构师 | 

  * 设计数据湖/数据仓库架构
  * 制定数据标准和集成规范
  * 评估和选型数据技术栈角色定位：架构设计者

| 

  * 验证 AI 生成的架构方案和技术选型
  * 批准 AI 推荐的数据分层和存储策略
  * 指导 AI 进行架构演进和容量规划新重点：AI 辅助的自适应数据架构

| 

  * 更快的架构决策
  * 架构方案一致性保障
  * 架构卓越：弹性自优化的数据平台

  
数据平台 SRE | 

  * 数据平台可用性保障
  * 数据管道故障排查和恢复
  * 性能调优和资源管理角色定位：平台可靠性守护者

| 

  * 验证 AI 生成的故障根因分析
  * 批准 AI 推荐的自愈策略和扩缩容方案
  * 指导 AI 进行混沌工程和韧性测试新能力：AI 驱动的预测性运维

| 

  * 故障恢复时间缩短 90%
  * 自动化容量弹性管理
  * 可靠性卓越: 自愈式数据平台

  
  
## **四、实战一：用 AI-DLC 构建 dbt 分层模型**

### 4.1 问题背景

数仓建设中，最容易出问题的往往不是 SQL 写得对不对，而是建模的前置工作——业务口径定义不清晰、分层设计缺乏统一标准、模型之间的依赖关系缺少文档。这些”软性”问题才是导致数仓反复返工的根本原因。

在这个实战中，我们需要为一个电商分析场景构建完整的 dbt 分层模型体系，包括用户活跃度指标和 GMV 相关分析。

### 4.2 Inception 阶段：从模糊需求到建模规格书

我们向 AI 提供了业务方的原始需求描述——一段关于”想看用户活跃度趋势和 GMV 变化”的简短对话记录。AI 的任务不是直接写 SQL，而是将这段模糊的需求收敛为结构化的建模规格书（Spec）。

AI 输出的 Spec 包含以下内容：

  * 实体定义：明确需要建设的维度表和事实表（如 `dim_user`、`fct_user_activity`、`fct_orders`）
  * 粒度约定：每张表的聚合粒度（日级 / 周级 / 月级）
  * 指标口径：关键指标的精确定义（例如”活跃用户 = 当日有登录或有交易行为的去重用户”；”GMV = 含税金额，扣除已完成退款的订单”）
  * 分层规划：从 staging 清洗层到 intermediate 聚合层再到 mart 业务宽表的完整分层架构



Human Gate：团队在此环节审核口径定义是否符合业务理解。例如，”活跃”的定义是只看登录，还是也包含 API 调用？GMV 的口径是否与财务月报一致？这些关键决策由人来做出最终判断。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/ai-dlc-ai-driven-development-life-cycle-2025-development-2.png>) [图2]  
---  
  
### 4.3 Construction 阶段：逐层构建与验证

审核通过的 Spec 被拆解为多个 Unit of Work，每个 Unit 对应一层模型的构建。以 staging 层为例：

**4.3.1 Unit of Work 1：staging 层清洗模型**

AI 生成完整的 dbt 模型代码，包括：

  * 基于 `event_id` 的去重逻辑
  * 时间戳标准化和时区转换
  * 空值处理策略（哪些字段允许为空，哪些必须有值）
  * 源数据血缘标记（_`loaded_at` 审计字段）



同时，AI 为每个模型生成对应的 `schema.yml` 文件，包含 dbt 原生测试：
    
    
    models:
      - name: stg_raw_events
        columns:
          - name: event_id
            tests:
              - unique
              - not_null
          - name: user_id
            tests:
              - not_null
              - relationships:
                  to: ref('stg_users')
                  field: user_id
          - name: event_type
            tests:
              - accepted_values:
                  values: ['login', 'page_view', 'purchase', 'refund']
    

Human Gate：团队审核每个 Unit 的代码和测试定义。通过后合入主分支，进入下一个 Unit。未通过则反馈 AI 修改，进入下一轮 Bolt。

后续的 intermediate 层和 mart 层遵循相同的模式：AI 生成代码和测试 → 人审核 → 合入或返工。整个 Construction 阶段，每一层模型的开发从传统的 1-2 天压缩到了数十分钟。

**4.3.2 配套项目中的实际分层**

在电商销售示例中，模型进一步细化为六层。每层只承担一种职责，并通过 dbt 的 `ref()` 显式声明依赖：

层级 | 主要职责 | 代表模型 | 物化方式  
---|---|---|---  
source | 接入 S3 CSV，保留原始结构 | `src__jaffle_shop__orders` | view  
staging | 字段改名、类型统一、基础派生 | `stg_orders` | table  
intermediate | 封装可复用的跨表业务计算 | `int_product_cost` | view  
dim | 沉淀客户、商品、门店等维度 | `dim_customers`、`dim_products` | view  
fact | 固定订单或订单明细粒度，集中度量 | `fct_orders`、`fct_order_items` | view  
mart | 面向报表按门店、日期、品类聚合 | `mart_store_monthly_sales` | table  
  
一条典型血缘是：`orders CSV → src__jaffle_shop__orders → stg_orders → fct_orders → mart_store_monthly_sales`。例如 staging 层只做稳定、通用的语义转换，不提前混入复杂指标：
    
    
    SELECT
        id AS order_id,
        CAST(ordered_at AS DATE) AS order_date,
        order_total AS order_total_cents,
        order_total = 0 AS is_empty_order
    FROM {{ ref('src__jaffle_shop__orders') }}
    

成本和毛利等业务规则则集中在 intermediate 层定义一次，供事实表和多个 mart 复用：
    
    
    unit_price_cents - unit_cost_cents AS unit_margin_cents,
    (unit_price_cents - unit_cost_cents) / unit_price_cents AS unit_margin_pct
    

这种分层还有一个容易忽略的细节：月度 mart 直接从 `fct_orders` 按月聚合，而不是把日表简单相加。因为 `distinct_customers`、`new_customers` 等去重指标不可加，同一客户在多天消费时，日级去重数求和会放大月度客流。分层的价值因此不只是整理目录，更是把粒度、口径和复用边界固化在数据血缘中。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/ai-dlc-ai-driven-development-life-cycle-2025-development-3.png>) [图3]  
---  
  
### 4.4 Operations 阶段：部署与调度

模型开发完成后，AI 生成 dbt 的调度配置和 CI/CD pipeline 定义，包括：

  * 模型之间的依赖关系和执行顺序
  * 增量更新策略与全量刷新策略的选择
  * 失败重试和告警配置



团队在 Human Gate 确认调度频率和依赖关系后，完成生产部署。

### 4.5 效果总结

通过 AI-DLC 的方式构建这套分层模型，我们观察到以下变化：

  * 需求到 Spec 的时间从过去 3-5 天的反复对齐，缩短到数小时内完成。
  * 测试覆盖率显著提升：AI 系统化生成的测试覆盖了唯一性、完整性、引用完整性和值域范围，而非仅靠经验写几个示例用例。
  * Spec 文档化程度 100%：每个 Unit of Work 都自带完整的规格说明，新团队成员可以直接阅读理解，口径不再是隐性知识。



## **五、实战二：基于 Kiro 的规范驱动数据质量管理**

### 5.1 问题背景

数据质量管理在今天已经不是”清洗一次就完事”的技术小问题。当数据链路越来越长、AI 模型对数据质量越来越敏感、合规报送对准确性有硬性要求时，数据质量就成了一个必须系统化解决的工程问题。

在这个实战中，我们使用 Kiro——一款主打”规范驱动开发”的 AI IDE——结合 MCP（Model Context Protocol）协议，构建了一套从血缘探查到质量规则部署的自动化流程。

### 5.2 工具链概览

  * Kiro：规范驱动的 AI IDE，强调 Spec 先行、Property-based Testing
  * Redshift MCP：通过 MCP 协议自动探查 [Amazon Redshift](<https://aws.amazon.com/cn/redshift/>) 的表结构和物化视图 DDL
  * [AWS Glue](<https://aws.amazon.com/cn/glue/>) Data Quality：将质量规则部署为持续运行的自动化任务



### 5.3 Inception 阶段：自动探查与血缘反推

Kiro 通过 Redshift MCP 自动完成以下工作：

  1. 表结构探查：读取目标 schema 下所有表的字段定义、数据类型和约束信息
  2. 物化视图 DDL 解析：获取物化视图的创建语句，分析 JOIN 关系和聚合逻辑
  3. 血缘关系反推：基于上述信息，自动构建表之间的数据流向图谱



例如，AI 识别出以下血缘链路：
    
    
    raw_orders ─┐
                 ├─→ mv_daily_orders ──→ report_revenue
    raw_users  ─┤
                 └─→ mv_user_segments ──→ report_retention
    

这一步的价值在于：团队不再需要人工梳理数据链路，AI 可以基于实际的 DDL 和查询逻辑反推出完整的血缘关系，作为后续质量规则设计的基础。

### 5.4 Construction 阶段：多维度质量规则生成

基于血缘分析结果，Kiro 自动生成覆盖多个维度的数据质量规则草稿：

完整性规则：关键字段（如 `user_id`、`order_id`）的非空率必须达到 99.9% 以上。

唯一性规则：主键字段不允许出现重复值。

跨表对账规则：明细表按照聚合逻辑汇总后的结果，必须与聚合表的数值一致。例如，`SUM(raw_orders.amount) WHERE date = '2024-01-01'` 应等于 `mv_daily_orders.total_amount WHERE date = '2024-01-01'`。

跨源比对规则：ETL 过程前后的数据一致性校验，确保 Redshift 中的数据与 [Amazon S3](<https://aws.amazon.com/cn/s3/>) 源数据保持一致。

时效性规则：数据从源系统到可查询状态的延迟不超过预设阈值（如 2 小时）。

Kiro 的一个关键特性在这里发挥了重要作用：Property-based Testing。传统的数据质量检查通常基于几个示例场景（example-based），容易只覆盖”常见情况”。Kiro 能够从 Spec 中提取”对任意输入都应当成立的性质”（property），并据此批量生成验证场景，覆盖度远高于人工编写的几个测试用例。

Human Gate：团队在此环节审核以下决策：

  * 各项指标的阈值是否合理？（99.9% 还是 99.99%？）
  * 哪些规则触发后需要立即告警？哪些仅记录日志？
  * 跨源比对的容差范围如何设定？

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/ai-dlc-ai-driven-development-life-cycle-2025-development-4.png>) [图4]  
---  
  
### 5.5 Operations 阶段：部署为持续运行的质量任务

审核通过的质量规则通过 Glue MCP 部署为 AWS Glue Data Quality 任务：

  1. 规则集创建：将审核通过的规则定义注册为 Glue Data Quality Ruleset
  2. 调度配置：设置执行频率（如每小时、每日），关联对应的数据目录表
  3. 告警集成：将异常结果对接 [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/>) 和 [Amazon SNS](<https://aws.amazon.com/cn/sns/>)，实现自动告警



部署完成后，团队获得的是一份持续更新的数据质量报告，包含每个维度的得分、趋势变化和异常明细。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/21/ai-dlc-ai-driven-development-life-cycle-2025-development-5.png>) [图5]  
---  
  
## **六、AI-DLC 带来的根本性变化**

两段实战背后，指向的是同一个核心认知：AI-DLC 的价值不在于”AI 写代码更快”，而在于它系统化地补上了传统工程中容易被忽视的环节。

### 6.1 边界覆盖更全面

在传统模式下，测试用例和质量规则的设计高度依赖个人经验，容易只覆盖”常见情况”而遗漏边界场景。AI-DLC 通过 Property-based Testing 和基于血缘的系统化规则推导，将覆盖范围从”想到了才测”提升到”从规格定义中系统性推导”。

### 6.2 隐性知识显性化

需求讨论中的口径定义、建模时的设计决策——这些信息在传统模式下往往散落在会议记录、即时消息或团队成员的记忆中。AI-DLC 的 Spec 先行机制确保每个 Unit of Work 都有完整的规格文档，使经验成为可复用、可审计的团队资产。

### 6.3 执行过程可追溯

AI-DLC 的每一步——从规划到生成到部署——都通过 Human Gate 暴露在可审查的节点上。AI 不再是”你说什么它写什么”的黑箱，而是一个执行过程透明、决策依据可追溯的协作伙伴。

## **七、落地建议**

如果你的团队正在考虑将 AI-DLC 引入数据工程实践，以下是我们总结的几点建议：

从边界清晰的场景开始。dbt 模型开发、ETL 脚本编写、数据质量规则设计——这些场景的输入输出明确，最适合作为 AI-DLC 的首次落地点。

明确 Human Gate 的边界。不是所有环节都需要人工审核，但关键决策点（口径定义、阈值设定、架构选型）必须有人拍板。把这个边界划清楚，才能既享受 AI 的效率，又保证结果的可靠性。

不要期望一次到位。Bolt 的核心就是快速迭代。允许 AI 在第一轮给出 80 分的方案，然后通过人工反馈快速迭代到 95 分，远比追求一次性的完美输出更高效。

重视 Operations 阶段。数据工程的价值在于持续运行，而不是一次性交付。AI-DLC 在 Operations 阶段的自动化部署和监控能力，是确保长期价值的关键。

## **八、结语**

AI-DLC 在数据工程中的实践证明，AI 和人类的最佳协作模式不是”人想清楚了让 AI 写代码”，而是”AI 系统化执行 + 人在关键节点把关”。这种模式带来的不仅是效率提升，更是工程纪律的系统性升级——从依赖个人经验到依赖可复用的规范，从依赖人工覆盖到依赖系统化推导。

**下一步行动：**

**相关产品：**

  * [Amazon Glue](<https://aws.amazon.com/cn/glue/?p=bl_pr_glue_l=1>) — 简单、可扩展的无服务器数据集成
  * [Amazon Redshift](<https://aws.amazon.com/cn/redshift/?p=bl_pr_redshift_l=2>) — 经济高效的数据仓库
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=3>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon SNS](<https://aws.amazon.com/cn/sns/?p=bl_pr_sns_l=4>) — 发布/订阅和推送通知
  * [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=5>) — 可观测性工具



**相关文章：**

  * [从AI辅助编程到AI-DLC：紫讯落地 AI 原生研发新范式的实践](<https://aws.amazon.com/cn/blogs/china/ai-ai-dlc-implementation-ai-practice/?p=bl_ar_l=1>)
  * [Apache SeaTunnel 创新加速 ：AIDLC 方法论实践](<https://aws.amazon.com/cn/blogs/china/apache-seatunnel-aidlc-practice/?p=bl_ar_l=2>)
  * [（上篇）基于 AWS Bedrock AgentCore 构建企业级航空客服智能体 —— 基于AIDLC方法从需求分析到生产部署的完整实践](<https://aws.amazon.com/cn/blogs/china/based-on-aws-bedrock-agentcore-build-enterprise-intelligent-based-on-aidlc-analytics-deploy-practice/?p=bl_ar_l=3>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 张鑫

亚马逊云科技解决方案架构师，负责基于亚马逊云科技的解决方案咨询和架构设计，在软件系统架构、大数据及企业AI应用有丰富的研发和架构经验。

### Freda Li

亚马逊云科技 Data & AI User Group 社区主理人。资深数据行业从业者。深耕数据分析、工程与架构领域，对前沿技术保持高度敏感与持续探索的热情。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
