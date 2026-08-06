# FinXScope：基于 AgentScope Java 的金融级 AI 原生智能体底座

## Ch04.008 FinXScope：基于 AgentScope Java 的金融级 AI 原生智能体底座

> 📊 Level ⭐ | 8.6KB | `entities/finxscope-financial-agent-harness-aliyun-2026.md`

# FinXScope：基于 AgentScope Java 的金融级 AI 原生智能体底座

**来源**: 阿里云云原生（孟辰/文军/凌乐真/徐磊/林源）

**发布日期**: 2026-08-03

**原文链接**: https://mp.weixin.qq.com/s/g012Fu3rjUMkZLPCDHr-Eg

## 摘要

FinXScope 是阿里云新金融技术服务团队基于 AgentScope Java 构建的金融级 AI 原生智能体底座，是 Agent Harness 体系（运行底座 + FinXSkillHub 资产平台 + FinXVantage 评测平台 + 运营管理平台）的核心引擎。针对金融行业合规性、安全性与高可用要求深度定制，落地覆盖国有大行/股份制银行/保险/证券，已投产 AI 原生 App 触达千万级用户。核心判断：智能体最终业务效果同样取决于承载它的 Agent Harness 质量——同一个大模型运行在不同底座上效果可能天差地别。

## 六层架构与 AI 原生范式

传统企业架构（SOA、微服务）围绕"人操作系统"设计；AI 原生范式下"AI 自主规划和执行任务"成为核心驱动力，要求所有服务能力、数据资产、功能组件面向"如何更好地被 AI 理解和调用"重新组织——这是底层设计范式的转变，而非原有架构上的修补。六层架构回答了金融机构智能化转型的根本问题：当 AI 从辅助工具升级为核心驱动力时，企业技术架构应如何重新组织。

## 十大核心能力

### 意图引擎（四阶段管道）

NER 实体识别（金融词典+规则引擎，毫秒级）→ 问题改写（上下文增强/术语标准化/语义纠错/LLM 重写四处理器）→ 意图分类（LLM 智能分类与规则回退自动切换，意图树在线配置+版本管理）→ Skill 映射（精确路由，多技能组合）。意图树无法精确匹配时自动切换到 LLM 自主规划模式（基于 SKILL.md 文档自主判断）。

### 三层记忆系统（上下文工程）

短期记忆 STM（滑动窗口 + LLM 摘要压缩，2.0 支持 Redis 持久化跨实例恢复）、长期记忆 LTM（PostgreSQL+pgvector 向量存储，LLM 重要性评分过滤 + 语义召回，2.0 集群化部署）、用户画像 UserProfile（从 LTM 提炼结构化金融属性：静态/动态/行为偏好/标签体系，注入系统提示词指导对话策略）。三层记忆构成"存储→压缩→召回→注入"运行循环，读写完全异步化零感知。

### 双模智能执行架构

OneAgent 模式（ReAct 循环，自主规划）+ Multi-Agent 模式（八种编排策略：Parallel/Sequential/Loop/MsgHub/Debate/Graph DAG/Routing/Supervisor）。核心创新：共享统一执行引擎 AgentProcessEngine 作为底座，权限校验/审计留痕/执行管理横切关注点保持一致；通过 MountableResource 机制把 Multi-Agent 工作流封装为 Tool 挂载到 OneAgent，实现"自主智能 + 确定流程"融合。

### 统一执行引擎（AgentProcessEngine）

"统一入口→统一调度→统一收官"闭环：前置通用层（用户-Agent-Skill 三级权限校验/输入预处理/上下文加载/审计启动）、策略路由层（按 patternType 选择执行策略，MountableResource 生命周期管理）、后置通用层（AG-UI 事件流格式化/记忆异步回写/审计关闭/ Prometheus 指标采集）。12 个拦截点支持自定义逻辑注入。2.0 新增：模型运行时覆盖（热更新）、Skill 级超时重试、执行上下文跨实例透明迁移。

### AG-UI 全链路流式交互

基于 Spring WebFlux + SSE 实现全链路异步流式，AG-UI 协议 15 种细粒度事件类型。四重价值：跨渠道复用/前后端解耦/统一可观测/工具生态可扩展。内置标准渲染工具（折线图/柱状图/饼图/指标卡片/数据表格等）。

### 三层技能定义体系

YAML 配置（轻量查询类，零代码批量注册）→ SKILL.md + 脚本（中等复杂度，"文档即契约"，行为可预测可审计）→ Java @Bean 注册（复杂业务逻辑，完整类型检查，多步事务封装/强一致性）。2.0 新增 SkillsHub 远程加载（无停机版本管理+灰度发布）+ 技能自动权限过滤（NONE/FILTER/REJECT）。

### 工具与知识对接

MCP + API Schema 两种标准配置方式接入企业存量系统（McpClientRegistry 统一管理生命周期，2.0 运行时动态增删秒级生效）；统一 Knowledge 接口多知识源配置化路由（百炼 RAG/点金金融库/客户自建库）；权限透传（外部调用自动继承用户权限边界）。

### 接入网关引擎

六重职责：协议适配（4 种输入格式）/多模态处理（图片/视频/ASR/文档并行提取）/安全管控（策略匹配+风险评分+pass-warn-block，Prompt 注入防护）/请求路由（三路分发）/流式输出编排（统一 AG-UI 格式）/会话持久化。2.0 新增 DocumentParserService 多格式文档解析。

### TodoList 任务管理（2.0）

两级步骤模型（Level-1 LLM 拆解顶层步骤 + Level-2 Pipeline 自动填充子 Agent 细节）+ TodoListHintHook 每轮推理前自动注入实时任务状态（无感记忆）+ ParallelAgentStrategy 零通信成本 Multi-Agent 状态同步。解决长流程金融任务（跨境汇款/贷款审批）进度不可见、规划不可校验、中断不可恢复三大痛点。

### 配置热更新与运营管理平台（2.0）

Redis Pub/Sub 多实例同步秒级生效 + ConfigVersionRegistry 版本回滚，覆盖 Agent/Skill/Tool/意图树/模型/网关全部核心配置。运营平台支持可视化编辑意图树、技能注册启停、MCP 连接管理、镜像试跑验证，未来打通"配置→试跑→评测→择优发布"自动化闭环。

## 2.0 版本演进（从单智能体框架到企业级平台）

新增：多智能体协作体系（八种编排 + MountableResource + DAG 图执行器）、三级权限体系（JWT + FILTER/REJECT + fail-open/fail-close）、可观测性体系（BizLogger 双模 + ObservabilityHook + SPI 扩展）、高可用无状态化（STM→Redis/LTM→PostgreSQL/配置热更新）、HITL 人工介入体系（工具级拦截确认 + 记忆快照断点续传）、A2A 协作协议（AgentCard 服务发现 + AG-UI/A2A 双向翻译 + Nacos 集成）、沙箱安全执行体系。

## 金融级保障与高码低码定位

安全合规：用户-Agent-Skill 三级权限 + Prompt 注入防护 + 全链路审计（traceId/spanId MDC 注入）。可观测：Micrometer Tracing 全链路 + 六层级业务指标（接入/表现/意图/执行/工具/知识）+ ObservabilityHook 五生命周期阶段观测。高码低码定位：低码平台适合业务验证/快速原型（5-10 步以内流程），FinXScope 高码路线解决低码难以覆盖的复杂工作流编排、多轮交互、AI 自主规划与金融级生产保障——"低码孵化、高码投产"闭环。

## 相关链接

- → [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/finxscope-financial-agent-harness-aliyun-2026-08-03.md)
- 底座姊妹篇：[AgentScope Java 2.0：企业级分布式 Harness 框架](../ch05/017-harness.html)、[专为 Managed Agents 而生的 Harness 底座：AgentScope 2.0](../ch05/017-harness.html)
- 相关主题：[STAROps 主机智能巡检（阿里云云原生）](../ch11/200-starops-host-intelligent-inspection-24-7-ai-doctor-for-ecs.html)、[DojoAgents 金融 Agent（AlphaDojo）](../ch03/036-agent.html)

---

