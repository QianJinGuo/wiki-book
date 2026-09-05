---
source_url: https://mp.weixin.qq.com/s/H4Wiox43LvRhVJZ4bLzH-Q
ingested: 2026-08-26
sha256: c3a1c2200701b060e4b4daf2d3052c0b75731829d3d9e9aefb448ed925cd72e8
title: "Ontology（本体）Part 3：Ontology (OWL) 驱动的数据分析智能体设计与实战"
author: Fan
source: 技术与艺术认知 (微信公众号)
score_v: 8
score_c: 5
score_vc: 40
decision: raw_only
---

# Ontology（本体）Part 3：Ontology (OWL) 驱动的数据分析智能体设计与实战

> 技术与艺术认知（Fan）Ontology 系列第三篇：Data Agent 结合 Ontology 作为语义层的设计思想与实战。源码：https://github.com/tianputao/Data-Insight-Agent-With-Ontology

## 1. 引言：为什么要给 Data Agent (text-to-sql) 加一层 Ontology
企业数据分析场景下，用户的业务语言和物理表列名之间存在天然落差。用户会问"高价值订单有多少""客户消费排名"，但物理表里对应的可能是 TotalDue、OrderQty 这类缩写列名。只把物理 schema 喂给大模型，模型缺少业务含义，容易选错列或漏掉隐含的多跳关系；手写一张"业务词 → 列名"映射表，又难以表达关系、层级和正式业务定义。

方案：引入一个基于 OWL 的语义层，作为用户自然语言和物理 schema 之间的翻译与推理中介，让生成 SQL 前的上下文既有业务深度，又不牺牲物理准确性。选择多个相互协作的子智能体各司其职：Ontology Agent 负责业务语义，Metadata Agent 负责物理表属性验证，Data Insight Agent 负责生成并执行 SQL。

## 2. 背景知识速览
### 2.1 什么是 Ontology / OWL
OWL（Web Ontology Language）是 W3C 制定的本体描述语言。Class、Individual、DatatypeProperty（对应"字段"）、ObjectProperty（对应"关系"）、domain/range、equivalentClass（等价类，表达派生业务概念）。OWL 把"类、属性、关系、派生业务定义"表达成一份可以被程序检索的结构化图谱，而非只给人读的文档——"可被程序检索"是整套架构成立的前提。

### 2.2 什么是"推理"（Reasoning）与 HermiT
OWL 文件里显式写出来的事实只是冰山一角。例如声明"MountainBike 是 Bikes 的子类"、"某个体是 MountainBike"，但没有显式声明"这个个体也是 Bikes"——这个隐含事实程序默认只认显式三元组看不出来。推理器（Reasoner）根据 OWL 公理（子类传递性、等价类、属性特征、Restriction 约束）自动把隐含事实计算出来，可"物化"（materialize）供直接查询。本项目使用 HermiT（OWL 2 DL、hypertableau 算法，通过 Owlready2 调用）：一致性检查、计算完整类层级、推导个体完整类型集合。

推理不是必需品而是增强项——大多数情况下靠显式类层级遍历、属性 domain/range、equivalentClass 定义就能满足业务语义检索；推理在需要"计算隐含关系"时提供额外能力，可关闭而不影响显式图查询。此推理是 OWL 自带能力（大模型时代之前就存在），区别于 LLM 推理，两者可结合。

### 2.3 为什么选择 Owlready2，而不是图数据库或 SPARQL
- **导入图数据库（Neo4j）**：图数据库擅长"节点+边"存储遍历，但 OWL 价值不只图结构，还包括 TBox（类/属性/限制/equivalentClass 公理）与 Reasoner 推理机制的语义耦合。拍平成普通图节点边会丢失 domain/range 约束、等价类推断、属性继承等"公理"层面语义。
- **模拟成关系表**：等于重新发明一套 schema 描述 schema 本身，本体演进要同步改"元 schema"和 ORM 逻辑，维护成本超线性增长。
- **SPARQL 查询端点**：默认只匹配显式三元组，不会自动应用公理推断——除非先跑 Reasoner 物化。若个体只显式标注为子类（MountainBike），精确的 `?p a :Bikes` 查询在没有推理时会静默漏掉该个体，即使语义上确实属于 Bikes。让 LLM 直接拼 SPARQL 要求同时精通图查询语法和推理物化时机，容易生成语法正确、语义不完整的查询。

更适合的交互形态是一组"语义明确、参数化"的高层函数工具（find_paths、get_business_context），把"要不要考虑子类/推理结果"这类决策封装进工具实现内部，而不是交给调用方判断。

Owlready2 实际优势：纯 Python 对象化访问（类/实例/属性都是 Python 对象，无需图数据库/SPARQL 端点/Jena 网关）；内建 HermiT 对接；查询能力可封装成边界清晰的函数，天然契合 function calling 模型；工具内部自行决定类层级遍历，吸收"子类漏掉"陷阱；保持 OWL 原始文件只读加载，维护/版本管理/评审用标准文本工具。

图数据库 vs Ontology：图数据库是"存储与遍历模型"，回答"数据之间如何连接"；Ontology（OWL）是"知识表示与公理系统"，还描述类包含关系、domain/range 约束、等价条件、可推导隐含事实。图数据库可以是 Ontology 的底层存储候选但不提供 TBox 推理。

### 2.4 本项目 OWL 文件里的关键约定
每个 DatatypeProperty 携带中英文 label、comment，直接对应业务口语词汇（如 orderQty 的 label 同时给"数量""销量"中文别名）；domain 精确标注属性"声明所属"的类，即使某类继承自另一类也保留声明处 domain（物理验证需按声明 domain 分组）；少数属性携带单位（如 USD）；等价类定义涉及清晰真实商业判断；自定义度量 measure 帮助 LLM 理解计算口径和逻辑。

### 2.5 技术栈总览
Agent 编排框架：Microsoft Agent Framework（MAF，agentic loop + function calling + 渐进式加载 Skill 系统 SkillsProvider/FileSkillsSource）；LLM：Azure OpenAI（按任务复杂度两档，深度推理用主力模型、轻量任务用小模型）；本体查询：Owlready2 + HermiT（只读 OWL 文件，不引入图数据库/SPARQL）；数据仓库：Azure Databricks（SQL Warehouse 执行 + Unity Catalog 作物理表/列/类型/权限唯一权威源）；SQL 解析校验：sqlglot（catalog/schema 作用域静态校验）；后端：FastAPI + SSE；前端：React + TypeScript。

## 3. 架构总览：Multi Agent 相互交互调用及 Workflow
MasterAgent 是唯一编排入口，通过 MAF 有界 agentic loop 委派给三个子智能体（每个都是独立 MAF Agent，各自工具集和 Skill 挂载）。

### 3.2 两种模式的整体流程
Ontology 开启：OntologyAgent → MetadataAgent → DataInsightAgent；Ontology 关闭：MetadataAgent → DataInsightAgent。Ontology 是否参与是 Session 级开关，不影响其他并发会话。关闭时退化为纯粹物理 schema 驱动分析，因为"每一层只对一种事实负责"，少了语义层物理验证和 SQL 执行两层仍能独立工作。考虑 Ontology 开发有人工和资源成本，无成熟 Ontology 能力之前也可直接使用。

### 3.3 分层设计原则：每一层只对一种"事实"负责
OntologyAgent 回答"这个业务概念是什么意思、应该沿什么关系分析"（语义事实）；MetadataAgent 回答"这些语义对应到哪些真实存在的物理表和列"（物理事实）；DataInsightAgent 回答"结合两层证据，应执行什么 SQL、结果说明什么"（执行与解释）。三层证据链不可互相替代、不可互相吞并——这是贯穿全文的核心设计约束。Ontology 越权做物理验证会产生它无法保证的物理表/列假设；Metadata 越权做语义判断会让两种模式效果趋同，语义层失去存在意义。

### 3.4 置信度阈值机制
多数问题可用一次确定性组合检索直接得到根实体、相关属性和路径，但少数问题存在歧义（同名实体、跨领域术语、生僻表达），确定性检索结果可能不完整或不可靠。需要客观信号判断"这次结果能不能直接采信"。get_business_context 返回时基于匹配质量（精确 IRI/名称 vs 模糊/多语言标签匹配、候选歧义程度）计算 confidence 分值，并返回 status（ok/ambiguous/no_match）。编排层维护可配置阈值 ONTOLOGY_ESCALATION_MIN_CONFIDENCE（默认 0.5）：当 status != "ok" 或 confidence 低于阈值时触发升级，转交完整工具 Agent 做多跳探索式恢复检索；否则直接采用确定性结果。阈值可配置，随本体规模/标签覆盖率调整，不需改代码。

## 4. 深入 OntologyAgent：语义检索层
### 4.1 设计哲学：属性优先（property-first）、角色中立（role-neutral）
OntologyAgent 明确不在语义层判断"这是度量列还是维度列"，也明确不写死聚合公式或固定分析口径。把分析判断权完全留给 DataInsightAgent 的 LLM，Ontology 只提供"有证据支撑的事实"。一个属性"是不是度量"往往取决于具体问题（同一个 orderQty 在"总销量"里是度量，在"按数量分组"里可能是维度），这种上下文相关判断只有具备推理能力的 LLM 才能做好。

### 4.2 只读查询工具集
面向 Owlready2 封装一组只读查询工具（全不修改 OWL 文件）：search_entities、describe_entity、expand_neighbors、find_paths、find_related_by_type、get_schema_mapping、get_join_paths、get_lineage、get_semantic_candidates、get_business_context（问题驱动的复合业务上下文，核心工具）、list_defined_classes（枚举 equivalentClass 派生业务概念）。构成完整能力集，但大多数请求用不上完整探索。

### 4.3 两级 Agent 设计：完整工具 Agent + 轻量 Router Agent
OntologyAgent 内部持有两个 MAF Agent：Router Agent（tools=[]，只挂 Skill Provider，唯一职责是判断问题是否命中治理好的 analytics-spec Skill）；完整工具 Agent（注册全部 11 个查询工具，仅在需要"恢复/兜底"检索时才被调用）。拆成两个的原因：让"是否走治理快速通道"的判断足够轻足够快，不被完整工具集拖慢。Router 不需要理解本体的图结构，只需判断问题是否匹配一条已知治理规则。

### 4.4 确定性组合检索：把常见问题变成代码路径
Router 未命中治理 Skill 时，不立即启动完整多轮"模型-工具-模型"LLM 循环，而是由代码直接调用 get_business_context + list_defined_classes 两个工具并组装结果。之后 needs_recovery 决定是否需要回落到完整工具 Agent 做多轮探索式恢复。本体查询引擎执行开销很低，真正成本在 LLM 多轮工具调用。把"根实体 + 相关属性 + 最短路径就足够回答"的常见问题变成确定性代码路径，只把真正需要探索的歧义/长尾问题留给完整 Agent，在牺牲覆盖面前提下降低常见路径开销，提高分析查询速度。

### 4.5 问题驱动的子图检索
get_business_context 是确定性检索核心，检索策略不是对整个 Ontology 无差别广度优先遍历，而是：从问题显式提到的类加上命中属性 domain/range 作为检索种子；从种子出发保留所有并列最短路径直到最大深度 ONTOLOGY_MAX_DEPTH；支持多语言标签匹配（含中文分词命中）；返回结构含完整证据链（matches、confidence、warnings、unresolved），保证可追溯性。

### 4.6 治理 Skill 快速通道：已知高频问题的旁路
analytics-spec 是一个 Skill，针对已验证、已知答案模式的高频问题（如"哪个客户消费最高"）预置可信 SQL 模板。遵循 MAF Skill 渐进式加载：默认只暴露 name+description，命中后才 load_skill 读取正文，不在编排层预先把所有 Skill 内容注入。命中后跳过 Owlready2 查询和 MetadataAgent，把治理上下文交给 DataInsightAgent 执行。编排层有反伪造校验：验证 Router 确实调用过 load_skill，防止未经验证就假冒"已命中治理路径"。analytics-spec（治理模板）与 sql-planning（动态规划）是 DataInsightAgent 注册的两个不同 Skill，按问题是否命中模板自动分流，互不冲突。

## 5. 深入 MetadataAgent：物理验证层
### 5.1 唯一职责：验证物理存在性，不做语义判断
即使 Ontology 给出看似合理的字段建议，Metadata 也要用 Unity Catalog 的真实信息验证，不直接采信。回答永远是"这个东西真的存在吗、叫什么名字、类型是什么"，而非"业务含义是什么"。

### 5.2 两种运行模式
Ontology 开启：使用不挂任何 Skill 的"验证器"Agent（MetadataVerifierAgent，enable_skills=False），接收 Ontology 按声明 domain 分组的 semantic_property_groups 和 required_relations，只做物理核验。按声明 domain 分组不是随口一提——本体里属性的 entity 字段可能是派生概念（equivalentClass），但声明 domain 才是它真正归属的物理实体。代码构建验证请求时明确优先使用声明 domain，只有 domain 为空才退回 entity 字段，保证物理验证不因归属混淆验证错对象。
Ontology 关闭：使用带 metadata-mapping Skill 的"发现"Agent，作为纯粹"词汇 → 物理字段"翻译适配器，职责严格限制为词汇到字段翻译，不复制 Ontology 的关系名、正式类定义或聚合公式。

### 5.3 表摘要索引
候选表可能有成百上千张，若每次请求逐一拉取每张表完整列详情，耗时会随表数量线性增长。预先构建轻量表摘要索引（表名、简要注释，受 METADATA_INDEX_MAX_TABLES 限制默认最多索引 500 张表）。请求时先在索引打分筛出一小批候选表（METADATA_CANDIDATE_MAX_TABLES 默认 12 张），只对这一小批做完整详情拉取。

## 6. 深入 DataInsightAgent：把两层证据变成 SQL
### 6.1 消费两条独立证据流而不互相坍缩
同时接收 Ontology 语义上下文和 Metadata 物理验证结果，两者分别保留、分别传递，不合并成含糊综合材料。Prompt 强制：生成或重试 SQL 前必须回顾 Ontology 提供的实体、指标、维度、过滤条件、关系路径——保证即使物理证据充分，语义层分析意图也不被丢在一边。

### 6.2 sql-planning Skill：把语义证据转成可执行查询计划
渐进式加载 Skill，不是写死的 Prompt 规则。定义的是规划方法而非固定指标目录/公式/SQL 模板。明确权威边界：原始用户问题决定分析目标；Ontology 上下文对业务含义（实体、属性 domain/range、标签、定义、类约束、层级、关系角色、语义路径）有权威解释权，不可用时不得凭空捏造；Unity Catalog 元数据对物理事实（表、列、类型、键、Join 方向、基数、可用性）有权威解释权；任何 Ontology 实体名或候选映射在 MetadataAgent 验证之前都不是可执行 SQL 标识符。动态规划六步：识别分析目标选相关度量/维度/约束/层级/关系路径（不自动套用全部推荐因子）；按所选度量语义 domain 与分组/实体推导分析粒度，一对多 Join 前保持粒度避免数值重复放大；排好序语义路径对照已验证物理 Join，只在缺表/缺列/缺 Join 时请求一次 Metadata 恢复；基于选定语义和已验证 schema 设计 SQL，由模型运行时判断一条还是多条互补证据查询；对趋势/对比/解释类问题只在可推导时选用，没有默认基线/拆解方式；执行能回答问题的最小证据集合，区分"实测观察"与"解释性假设"，无证据不宣称因果。

### 6.3 SQL 生成与作用域校验
生成的 SQL 用 sqlglot 解析，强制校验 catalog/schema 在配置允许范围（DATABRICKS_CATALOG/DATABRICKS_SCHEMAS）之内。纯代码校验，不依赖模型自觉遵守边界。

### 6.4 有界恢复机制
recover_metadata_context 和 recover_ontology_context 两个恢复工具，每次请求最多触发一次。避免无限重试拖慢响应，同时保证真正缺上下文时仍有一次补救机会。

### 6.5 结果诊断与降级说明
对空结果、全零、常量、两两相同等"退化结果形态"做画像识别。发现退化结果后允许触发一次 purpose="diagnostic" 的诊断性 SQL 追问，不把退化结果直接当正常答案呈现。diagnostic_attempts 最多 1 次，防止诊断变成新的无界循环。

### 6.6 SQL 标识符纠正的安全边界
物理验证阶段拿到的表结构可能和模型生成 SQL 时的大小写、别名不完全一致，系统做一次标识符纠正但规则保守：只做精确大小写匹配或唯一后缀匹配，不做模糊列名猜测。对 CTE 和子查询有显式防护：一个别名可能在一条 SQL 里绑定两个不同表（CTE 名恰好和真实表同名），纠正逻辑无作用域感知（不分层级正则扫描），所以一旦发现同一别名对应两个不同物理表，该别名直接标记"不可用于纠正"，宁可放弃纠正也不冒把"投影别名"误当"物理列名"重写的风险。

## 7. 横切关注点
### 7.1 请求级隔离
Ontology 开关是 Session 级设置，不同会话互不影响。响应缓存键包含 thread_id + 归一化问题 + ontology 模式，避免切换模式后复用另一模式答案。

### 7.2 失败处理与可见降级
Ontology 查询失败时不会静默切换到备用路径，而是在思考面板明确说明失败原因，然后降级为 MetadataAgent → DataInsightAgent 标准流程。用户始终能看到"这次分析实际走的是哪条路径"。

## 8. 可复用的设计原则总结
语义、物理验证、SQL 执行三件事永远分离，任何一层都不应替另一层做判断；语义层保持角色中立（不预先判断度量/维度，留给 LLM）；把"常见情况"做成确定性代码路径，把 LLM 探索能力保留给真正的歧义/长尾问题；治理快速通道与开放式语义推理可共存，按问题类型自动分流；多语言、带别名的本体标签是连接自然语言提问和物理列名的低成本高收益手段；任何辅助性词汇映射层都要有严格职责红线，防止退化成语义层的影子副本。

## 9. 典型问题查询分析结果展示
用同一问题"2023年高价值订单主要来自哪些客户，发往哪些地区，集中在哪些细分品类？"分别在 Ontology 开启和关闭两种模式运行对比。
Ontology 开启：OntologyAgent 先从本体解析出 HighValueOrder 是正式定义的等价类（root_entity_detail 给出 IRI 和 label "High-Value Order"），"高价值订单"判定口径不是模型临场猜测而是本体已沉淀的业务定义，可被引用追溯。结论把 20 笔订单归为"企业客户"这一本体定义的正式分类，而非罗列具体公司名——"角色中立"设计收益：Ontology 提供有正式定义支撑的分类概念，DataInsightAgent 直接用上，不用现场猜"这些客户算不算同一类"。
Ontology 关闭：退化为 MetadataAgent（metadata-mapping）→ DataInsightAgent。业务层文档不含"高价值订单"定义的前提下，MetadataAgent 明确判断需先明确"高价值订单"金额门槛才能执行分析——TotalDue 字段存在且已验证，但无权威来源说明多少金额算高价值。DataInsightAgent 没有替用户拍板阈值，列出几种可能门槛（TotalDue ≥ 10,000、前 10%、用户正式门槛），并明确任选一个都会人为改变"主要来自哪里"结论，因此确认前拒绝给出确定性答案。计算口径表"高价值订单"一行如实标成 推断/Inferred、待确认阈值，不编造数字冒充确定口径。这个"宁可停下来问，也不悄悄编"的判断印证 Ontology 价值：开启时 HighValueOrder 是本体现成正式定义，系统立刻给出确定性答案；关闭后同一"官方定义缺口"必须由用户或业务层文档来补。当然并非所有问题不开 Ontology 都回答不好——通常不涉及深度探索、多跳、关联的问题，普通 Data Agent 借助 Metadata Agent + metadata-mapping Skill 和 Databricks UC 治理已够用。

## 10. 结语
OWL Ontology 作为自然语言与物理 schema 之间的业务语义中间层，能显著提升 SQL 生成的深度与准确性，而通过确定性快速路径，这种深度提升不需要以牺牲响应速度为代价。三层证据链——语义、物理、执行——各自独立、各自权威，是架构能够长期维护和扩展的根本原因。后续延伸：让 OWL 数据类型与推理器兼容以启用更多隐式推断、扩大治理 Skill 覆盖范围。

附录：GitHub https://github.com/tianputao/Data-Insight-Agent-With-Ontology/tree/main；前序 Ontology Part 1（为什么必须重新理解它）、Part 2（Protégé 构建实战）；参考 Protégé/OWL/Owlready2 文档。
