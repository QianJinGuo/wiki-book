# Amazon Bedrock AgentCore: 知识扩展与持续学习新能力

> 📊 Level ⭐⭐⭐ | 10.7KB

> **背景**：2026-06-17 AWS 发布 AgentCore 平台更新，引入三大知识层接入（组织/世界/付费）与持续学习能力，是 AgentCore 从"managed harness"向"agent economy infrastructure"演进的里程碑。

## 三大知识层架构

AgentCore 通过三层知识架构扩展 agent 的可达性：

### 组织知识层：Bedrock Managed Knowledge Base
- **解决痛点**：企业知识散落在 SharePoint / Google Drive / Confluence / S3 / Wiki，传统需要数月构建 RAG pipeline
- **核心创新**：Agentic retriever — 不只做相似度匹配，而是 **query planning + 跨文档概念连接 + 中间结果评估 + re-ranking**
- **管理责任转移**：vector store、embedding、re-ranking、扩容、限流全部由 AWS 接管

### 世界知识层：Web Search on AgentCore
- **复用基础**：Amazon 自家搜索基础设施（Alexa+, Quick Suite, Kiro）
- **差异化设计**：multi-source grounding（公开 web + Amazon 知识图谱）— 实体数据、验证事实、实时行情
- **安全边界**：所有 query 留在客户 AWS 账户内，无第三方 vendor onboarding

### 付费知识层：AgentCore payments + WAF AI 流量变现
- **agent 侧**：AgentCore payments 允许 agent 在执行 loop 内发现、访问、付费
- **provider 侧**：WAF AI traffic monetization（GA）— 内容方可选 block / allow / 收费
- **互联互通**：使用 WAF 的 provider 自动识别 AgentCore 验证的 agent，建立信任通道
- **战略意义**：构建 agent economy 的双边基础设施

## 三个独有贡献（不应合并到现有 entity）
1. **三层知识架构抽象** — 组织/世界/付费三层分类，是 AWS 对 agent 可达性问题的系统化分类法
2. **Agentic retriever vs 传统 RAG** — 主动 query planning + 中间结果评估，而非被动相似度匹配
3. **Agent economy 基础设施** — WAF AI traffic monetization + AgentCore payments 双边架构，是 agent 商业化的产品级实现

## 持续学习与生产可观测性

### 最危险的失败模式
- agent 错误确认未执行的订单
- API 超时时编造产品可用性
- 跳过审批步骤但 dashboard 显示 99% 成功率
- **共同特征**：不抛 error，dashboard 正常，问题在数周后用户投诉中暴露

### 修复策略
- 修 prompt、改 tool 描述、调 orchestration — 全靠猜测，无结构化方法判断改动是否真的改善

## 与现有 AgentCore Harness 实体的差异化

| 维度 | 旧 entity (2026-05-21) | 本次 (2026-06-17) |
|------|---------------------|-----------------|
| 焦点 | Harness 工程三阶段 + 编排 | 知识层架构 + 持续学习 |
| 核心组件 | Runtime / Memory / Identity | Knowledge / Web Search / Payments |
| 抽象层级 | "模型之外的一切" | "agent 之外的可达性" |
| 客户案例 | 通用框架 | Sony 具体引用 |

## 关键引用

> "At Sony, we're building an enterprise AI agent platform on AgentCore where teams across business units can develop, share, and reuse AI agents"
> — Masahiro Oba, Senior General Manager, Sony Group Corporation

## 深度分析

### 三层知识架构是 AWS 对 agent 可达性问题的分类法，而不仅是产品组合

文章把 agent 的信息可达性切成组织知识、世界知识、付费知识三层，这个切法本身就值得注意：它承认"agent 不够好"的根因往往不是模型智能不足，而是 context 缺失——refund policy 在 SharePoint 里够不到、实时行情在付费墙后面拿不到。三层各自配对一个产品（Managed Knowledge Base / Web Search / payments+WAF），说明 AWS 不是在做单一 RAG 工具，而是在为 agent 的全部信息来源做平台级收口——所有知识源都经过同一个 gateway，治理模型自然统一。

### Agentic retriever 标志着 RAG 从"检索"进化为"推理中的子任务"

传统 RAG 是被动管道：query → 最近 chunk 匹配 → 返回。Managed Knowledge Base 里的 agentic retriever 则会主动规划 query、跨文档连接相关概念、评估中间结果、回答前 re-ranking。这一步把检索本身变成一个 agentic loop——对多部分复杂查询的覆盖面"noticeably broader and more complete"。这与 [Retrieval Augmented Generation Rag](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/retrieval-augmented-generation-rag.md) 描述的经典 RAG 形成代际差：检索不再是前置步骤，而是 agent 推理过程内嵌的自主行为。

### 最危险的 agent 失败是"不抛 error 的失败"，可观测性因此必须看轨迹而非看指标

文章给出的失败案例——错误确认订单、API 超时时编造可用性、跳过审批——共同点是 dashboard 一切正常（99% 成功率），问题数周后才经用户投诉暴露。这决定了 AgentCore 优化闭环的形态：failure/intent/trajectory insights 都是基于生产 trace 的批量模式挖掘，而不是单次 trace 审查或指标告警。静默行为失败没有 error 信号，只能从"行为模式与预期的偏离"中反推，这把 agent 可观测性和传统 APM 划清了界限。

### 修复闭环的关键是"先验证再上线"，把 prompt 调优从猜测变成实验

文章明确指出无结构化修复的困境：改 prompt、改 tool description、调 orchestration，全靠希望，无法知道是否真的改善还是悄悄弄坏了别的。AgentCore 的答案是 recommendations（基于实际行为的改进建议）→ batch evaluation（对测试集回归）→ A/B testing（真实生产流量对照）三级验证链。本质上是把软件工程的 CI/CD 纪律移植到 prompt/工具层——agent 行为变更也应该走"测试先行、灰度放量"的路径。

### 安全哲学：用确定性包裹概率性

agent 与传统软件的本质差异被文章点破：agent 是概率性的，它做判断，而判断可被上下文影响——prompt injection 和 memory poisoning 不需要"攻破"系统，只需要"说服"agent。对应的架构选择是把 Bedrock Guardrails 放在 gateway 层、agent 代码之外、agent context 不可见之处，使 agent 无法推理绕过这些检查。原则是"检测可以概率化，执行必须确定性"——未来接入 Check Point、Zscaler 等第三方检测信号时也沿用同一模式。这与 AgentCore Harness 的 gateway 治理模型一脉相承。

## 实践启示

- **接入企业知识时优先评估 Managed KB 而非自建 pipeline**：vector store、embedding、re-ranking、限流扩容均由 AWS 托管，省掉数月工程；如果你的查询经常是多主题复合型，agentic retriever 的 query planning 带来的覆盖面提升尤其值得测
- **Web Search 选型时把"数据边界"作为第一判据**：对合规敏感场景（监管监控、金融），留在自己 AWS 安全边界内、复用 Amazon 知识图谱 grounding 的方案，比外接第三方搜索 API 少一层 vendor 风险和认证编排
- **为生产 agent 建立"静默失败"审计习惯**：不要只看 dashboard 成功率；定期跑 failure insights 批量分析 trace，重点找"行为看起来正常但违背业务规则"的模式，部署后或投诉激增时做针对性调查
- **任何 prompt / tool description 改动都走验证链**：recommendation → batch evaluation（回归测试集）→ A/B test（真实流量）之后再全量；这套流程与 agent 运行环境无关（Lambda / EKS / 非 AWS 均可），没有理由只在 AgentCore runtime 上用
- **设计 agent 安全时把控制点移出 agent context**：安全检查应放在 agent 代码之外、模型"看不见也说服不了"的 gateway 层，检测信号可以多样（自研或第三方），但最终 allow/deny 必须由确定性策略引擎裁决

## 相关主题

- Agentcore Managed Harness — 前篇：Harness 编排框架
- [Agentcore Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentcore-harness.md) — 同期：其他 AgentCore 工程实践
- [Agentcore Payments X402 Agentic Commerce](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentcore-payments-x402-agentic-commerce.md) — 同期：x402 商业化
- [原文存档](https://aws.amazon.com/blogs/machine-learning/new-in-amazon-bedrock-agentcore-build-agents-with-broader-knowledge-and-continuous-learning/)

---

