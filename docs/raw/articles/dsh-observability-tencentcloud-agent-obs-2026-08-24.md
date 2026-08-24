---
title: "DeepSeek Harness规模化踩坑实录：耗时、成本、失败到底该怎么查"
source_url: "https://mp.weixin.qq.com/s/6P9l4HftpJLDK-xZazMtow"
source_name: "腾讯技术工程"
author: "trumphuang"
ingested: 2026-08-24
sha256: af837999097b79230995865373ccc6d96520a6c8e67c2a81bb79aa72791482f9
---

# DeepSeek Harness规模化踩坑实录：耗时、成本、失败到底该怎么查

> 来源：腾讯技术工程（腾讯云日志服务，作者 trumphuang，2026-08-24）。Agent 规模上来后关注三件事：耗时花在模型推理还是工具执行、Token 消耗集中在哪些会话/模型、失败中断发生在哪一步能否回溯。DeepSeek Harness（DSH）自带会话轨迹视图/Session 事件流落盘/工具调用检索，但作用域是本机、单会话、实时；要跨会话、跨机器、可长期留存，需要腾讯云 Agent 可观测的 DSH 采集插件。

## 三句话总结

1. **DSH 运行原理**：DSH 是 DeepSeek 开源编码 Agent 框架（命令行 dsh），让大模型在受控环境中自主完成任务（读写文件/执行命令/调外部服务）。组织方式为 Cordis 微内核 + 全插件化（内核只负责按 profile 装配插件与管理生命周期，模型适配器/工具集/沙箱策略/会话持久化均可插拔，web/tui/headless 三种形态共用同一内核，可观测能力也挂载在这一层）。执行模型是 ReAct 循环：一次用户任务称为 turn，turn 内每轮推理/调用工具/观察结果称为 step；执行结构在运行前无法确定。
2. **DSH 自带观测 vs 缺口**：DSH 自带三项开箱即用能力（会话轨迹视图、Session 事件流落盘、工具调用检索），但过程数据是按时间排列的会话事件序列、保存在本机，没有调用关系与各自时间占用统计。规模化后三个问题突出（跨机器汇聚、调用关系还原、长期留存），共同前提是把一次任务还原成带父子关系与时间区间的调用树。
3. **腾讯云 Agent 可观测的 DSH 插件**：在 OneSuite Agent 观测能力基础上提供 DSH 采集插件（tencentcloud-agentobs-sdk-dsh，已发正式版、被 DSH 社区插件市场收录，支持 DSH >=0.1.0-rc.6 <0.2.0、Node.js >=22.19.0），对接 DSH 运行时事件总线与流式管道。数据地基是**五层调用树**（turn→step→模型调用→工具调用，与 DSH 实际执行结构一一对应），各层属性遵循 OpenTelemetry GenAI 语义约定；因 Agent 执行结构层级深度不固定，插件用**状态树 + 延迟发射**处理这一差异构造采集上报。

## 主要事实与细节

- **五层 Span 模型**：一个 turn 对应一次任务，turn 内有若干 step，step 内有模型调用与工具调用——与 DSH 实际执行结构一一对应。插件上报的调用链分成五个层级承载不同信息，遵循 OpenTelemetry GenAI 语义约定（便于与既有可观测体系对齐、后续接入其他 Agent 框架保持同一口径）。
- **状态树与延迟发射**：Agent 执行结构由模型运行时决定、层级深度不固定，而链路数据要求父子关系明确、时间区间完整——插件通过状态树 + 延迟发射处理这一差异（事件流 → 状态树 → Span 发射 → 批量上报）。
- **接入后能看到**：DSH 每次任务形成完整链路，按会话/模型/工具等维度汇总：调用链面板（一次完整 DSH 任务执行过程）、Token 消耗面板等；支持链路检索、聚合分析与平台告警仪表盘。
- **接入方式**：方式一通过 Skill 安装（skillhub.cn/skills/tencentcloud-cls-agent-obs 提示词让 AI 工具完成接入）；方式二手动（npm install -g @deepseek-ai/dsh → dsh plugin --profile web/headless/harness add tencentcloud-agentobs-sdk-dsh → 配置连接信息）。前置：登录日志服务控制台 Agent 可观测创建应用，接入方式选 DeepSeek Harness，复制 {应用名称}-trace-topic 日志主题 ID。
- **配置细节**：配置项（enabled/endpoint/topicId/secretId/secretKey/serviceName 默认 deepseek-harness/batchMaxSize 32/flushIntervalMs 5000 等）；pnpm v9+ 默认禁止依赖包运行 install 脚本会报 [ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: protobufjs@6.11.6，需在对应 profile 目录执行一次放行；默认 prompts/responses/tool arguments/results 附加到 span（可用 captureContent: false 关闭）；显式插件配置优先于环境变量，访问凭证建议环境变量或密钥管理工具注入；安装/更新插件后需重启 DSH 服务生效。
- **DSH 自带三项能力**：会话轨迹视图、Session 事件流落盘、工具调用检索（本机/单会话/实时作用域）。

## 点评（入库评估）

腾讯技术工程（腾讯云日志服务，★★★★★ 第一方信源）关于 DeepSeek Harness 生产可观测的工程实践文章。为 deepseek-code-harness（DSH 伞形实体，现覆盖架构/Cordis 运行时/实测等）补充库内零覆盖的**可观测维度**：五层调用树（turn→step→模型调用→工具调用）与 DSH 动态执行结构的映射、状态树 + 延迟发射处理层级深度不固定的采集机制、OpenTelemetry GenAI 语义约定对齐、跨会话/跨机器汇聚与成本/耗时/失败回溯。该维度对既有 DSH 实体是不可替代新维度 → v=7、c=8（腾讯技术工程第一方工程实践）、v×c=56 → **SUPP to deepseek-code-harness**。
