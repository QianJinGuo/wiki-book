# Grafana 13.1 release: observability as code updates, extending Grafana Assistant across more data sources, and more

> 📊 Level ⭐⭐⭐ | 11.0KB

> **来源**: [Grafana 13.1 release: observability as code updates, extending Grafana Assistant across more data sources, and more](https://grafana.com/blog/grafana-13-1-release-all-the-latest-features/)

## 摘要

Grafana 13.1 是 Grafana 13 之后的 minor release，主线三条：把 observability as code 做深、让 Grafana Assistant 触达更多数据源、把日常可视化与查询工作流做得更顺。Git Sync 在 13 中 GA 之后，13.1 补上四项能力——从 UI 直接导入 dashboard JSON 到 provisioned 目录、无外层目录的 root 级同步、把仓库里的 `README.md` 内联渲染到目录页、以及用 GPG/SSH/S/MIME 自动签名提交。Assistant 新增 Snowflake、Oracle、Elasticsearch、Dynatrace、Honeycomb、Zabbix、Jira、MongoDB 八个可直接查询的数据源，并在 Grafana Enterprise 中预装。

真正的变化在定位：dashboard 从「实例里的对象」变成「仓库里的文件」，评审与回滚的载体随之改变；AI 助手从「看指标」扩展为「横跨可观测数据、业务数据库与工单系统查询」，权限与审计边界随之外移。

## 核心要点

- **Git Sync 四项增强（基于 13 已 GA 的能力）**：都围绕「仓库配置与 UI 操作不再割裂」。
- **从 UI 导入到 provisioned 目录（GA，全版本）**：在目录点 **Import**，可选文件路径、分支、commit message 与 workflow，dashboard 作为导入流程的一部分提交回仓库；唯一性按路径判定，同名不同路径可共存，路径冲突会在覆盖前中断。
- **root 级同步（GA，全版本）**：选择「Sync external storage directly at root level without a containing folder」，provisioned dashboard 与普通 dashboard 并列落在根目录，适合「一个仓库代表整套 Grafana」的组织方式。
- **目录内 `README.md` 内联渲染（public preview）**：仓库目录里的 `README.md` 默认显示在 Grafana 目录页，可承载链接、负责人、runbook，让上下文跟着资产走。
- **自动签名提交（GA，全版本）**：可用 GPG、SSH 或 S/MIME 密钥签名，Git 提供方标记为 verified；此前只能产生 unsigned commit，在要求签名提交的 branch protection 下会被直接拒绝。仓库配好密钥后自动签名，未配置则保持 unsigned。
- **Assistant 直连八个新数据源**：以自然语言查询、跨源关联、把结果可视化为 dashboard；官方示例是一次从告警出发的调查同时拉取 Dynatrace 错误率、Oracle 查询性能与 Jira 最近发布。同时它在 Grafana Enterprise 中预装（无需装插件，连 Cloud 账号即可），OSS 用户仍走插件目录。
- **工作流与可视化**：rows/tabs 的 section-level variables 转 GA；重构版 query editor 进入 public preview（多选批量操作、stacked view）；quick filters 与 data grouping、panel style presets 也已 GA。
- **PDC 扩展（Cloud GA）**：Private Data Source Connect 新增 MQTT、GitHub、IBM Db2，用加密隧道把 Cloud stack 接到私有网络里的 broker、GitHub Enterprise Server 与 Db2 实例。

## 深度分析

### 评审与回滚换了载体

传统 Grafana 的变更模型是「有权限的人打开 dashboard，改完保存」：评审靠人盯，回滚靠实例内的版本历史，审计线索留在平台内部。Git Sync 把这条链路搬到 Git——变更是 commit/PR，评审走团队的 code review 流程，回滚是 `git revert`，权限部分从 folder 权限转移到 branch protection。13.1 的几项改动都在补原本断裂的接口：签名提交解决「合规仓库拒收机器提交」，root 级同步解决「目录结构被迫迁就功能而非团队」，UI 导入则正面解决最尖锐的矛盾——大多数人先在 UI 里把图调好，再想怎么进仓库。

导入流程的两个设计选择值得注意：唯一性按 path 而非 title，相当于把 Kubernetes「对象名与展示名分离」的思路搬进 dashboard 命名空间；路径冲突在写入前中断，说明「不覆盖」优先于「操作顺畅」。副作用是 path 从「摆放位置」升级成稳定标识，随手重命名即成一次带风险的迁移。

### 「Assistant 覆盖更多数据源」改变的是查询层与权限层

把 Assistant 从「能问指标库」扩展到「能问 Snowflake、MongoDB、Jira」，表面是插件适配，实质是把 LLM 放进了跨系统查询编排的位置。过去 dashboard 的查询是人提前写好、可评审的 PromQL/SQL；现在查询由自然语言在运行时生成，还可能一次跨四个系统做关联。文中那个「告警 → Dynatrace 错误率 + Oracle 慢查询 + Jira 发布」的例子最说明问题：这个 join 过去发生在数仓里（需预置 ETL）或发生在人脑里（开着四个 tab 手动对齐时间），现在被搬进了对话上下文。

这条路上的约束不在模型能力，而在三件事：**身份**（Assistant 用谁的凭据查 Oracle，跨源时是否逐源降权）、**语义**（时钟、时区、采样粒度、指标定义是否对齐）、**可复现**（对话产生的图能否落成可评审、可版本化的 dashboard）。第三点与 Git Sync 互补：Assistant 负责探索，Git Sync 负责把结果固化成资产——两者同期发布并非偶然。

### 规模化之后的三个运营风险

一是 **drift**：只要存在第二条写入路径（直接在 UI 编辑，或另一套自动化推同一 path），仓库与实例就会分叉，而分叉往往在下一次同步时才以覆盖的形式暴露。二是 **密钥生命周期**：Git Sync 需要仓库凭据（GitHub App 或 token）、可能还需要 webhook 与签名私钥；13.1 把签名密钥配在 Grafana 侧，等于把「提交可信」的责任从 CI 转到了实例的密钥管理上。三是 **多租户命名碰撞**：root 级同步加 path 唯一性，使整个仓库成为扁平命名空间；多团队共用一个实例时，「谁占哪条路径」不再由 folder 权限兜底，约定失效的爆炸半径比过去一个目录下的误改更大。

### 与其他 as-code 路径的对比

纳管 Grafana 配置大致有四条路：Terraform/Crossplane 这类通用 IaC（有 plan/diff、state 与依赖图）、grafana-operator 这类 CRD（借 K8s reconcile）、Grizzly/Jsonnet/Tanka 这类生成器（生成 JSON 再 apply）、以及只读的 file provisioning。Git Sync 的差异是**双向**——既能同步进 Grafana，也能把 UI 导入写回仓库；它没有 plan 阶段，也没有 state，因此不提供「应用前预演影响面」。这个取舍对 dashboard 成立：高频、低风险、给人看的资产不值得引入 state。但对 alert rules、权限、数据源这类一改就影响判断的配置，缺 diff 与校验就不够——观察 Grafana 把 as-code 边界推到哪类资产，比数它加了几个开关更有信息量。

## 实践启示

1. **先定路径规范，再开 root 级同步。** 把 path 当命名空间设计（团队/服务/环境），写进 CONTRIBUTING，重命名走评审；root 同步的便利来自扁平化，代价也来自扁平化。
2. **签名提交与 branch protection 一起上线。** 先在仓库配好签名密钥再开 Git Sync，否则机器提交在要求 verified 的分支上会被拒；同时把该密钥纳入轮换清单，别让它变成没有 owner 的长期凭据。
3. **写死「UI 能不能改」。** 导入流程让 UI 改动也能变 commit，但方向必须约定：要么 UI 只作草稿、以仓库为准，要么接受双向写入并靠同步频率收敛。含糊的约定就是 drift 的温床。
4. **`README.md` 承载 ownership 与 runbook，但别当唯一文档源。** 该能力仍是 public preview，只覆盖目录级上下文；正式文档留在 wiki。
5. **接 Assistant 前先做数据源权限盘点。** 逐源确认身份、可读范围与审计方式；Jira、Oracle 这类含业务数据的源优先只读账号，跨源关联结论保留人工复核。
6. **分批迁移：先 dashboard，后规则。** 13.1 的 as-code 能力集中在 dashboard 层，alert rules 与权限仍缺 plan/diff；先把 Git Sync 当「dashboard 的 Git 后端」用，等上游补齐校验再扩大范围。

## 相关实体

- [Agent 可观测体系五层架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-observability-5-layer-architecture.md) — 可观测数据如何分层，对应 Assistant 跨源查询的语义对齐问题
- [Agent Security Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md) — 身份、授权与权限边界，是 AI 助手直连多数据源的核心约束
- [Bedrock AgentCore NLP 仪表盘自动化 Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/build-ai-powered-dashboard-automation-agents-with-nlp-on-amazon-bedrock-agentcor.md) — 另一条自然语言生成 dashboard 的路径，可对照
- [Grafana GitHub Token Breach](https://github.com/QianJinGuo/wiki-public/blob/main/entities/grafana-github-token-breach-led-to-codebase-download-and-extortion-attempt.md) — 凭据与供应链风险实例，与 token/签名密钥管理相关

→ [原文存档](https://grafana.com/blog/grafana-13-1-release-all-the-latest-features/)

---

