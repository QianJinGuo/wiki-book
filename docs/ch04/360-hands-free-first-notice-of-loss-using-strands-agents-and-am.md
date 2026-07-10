# Hands-free first notice of loss: Using Strands Agents and Amazon Bedrock AgentCore Browser Tool for intelligent claims intake

## Ch04.360 Hands-free first notice of loss: Using Strands Agents and Amazon Bedrock AgentCore Browser Tool for intelligent claims intake

> 📊 Level ⭐⭐ | 7.8KB | `entities/hands-free-first-notice-of-loss-using-strands-agents-and-ama.md`

# Hands-free first notice of loss: Using Strands Agents and Amazon Bedrock AgentCore Browser Tool for intelligent claims intake

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hands-free-first-notice-of-loss-using-strands-agents-and-ama.md)

## 摘要

AWS 展示的保险理赔 FNOL（First Notice of Loss）自动化方案，将 Strands Agents SDK 的领域推理能力与 AgentCore Browser Tool + Nova Act 的浏览器自动化相结合，实现免手动操作的多模态证据（照片、视频、音频）结构化摄入。系统将理赔员从重复性的门户操作中解放，使其从验证工作转向判断工作——证据在进入系统的瞬间就被标记、关联和分类。

## 核心要点

### 架构分层

方案采用四层互补架构：

1. **浏览器交互层**：Nova Act 通过 AgentCore Browser Tool 的管理 Chrome 会话，基于 CDP over WebSocket 连接，对 FNOL 门户 UI 进行实时推理——导航理赔队列、识别未处理证据区域、触发分析操作
2. **领域推理层**：两个基于 Strands Agents SDK 的 Agent——Evidence Analyzer Agent（多模态证据解释和标记）和 Claims Complexity Analyzer Agent（理赔复杂度评估）
3. **执行可观测层**：每一步自动捕获截图、prompt、推理过程和 UI 状态转换，形成可审查的审计轨迹
4. **基础设施持久层**：ECS on Fargate 运行应用，S3 存储证据工件，DynamoDB 维护理赔状态和分析输出

### Nova Act 与 Strands Agent 的职责分离

这是方案最核心的设计决策：

- **Nova Act 负责"何时"和"何地"**：观察 UI 状态，决定何时触发分析、导航到哪里、等待什么完成。它基于当前屏幕内容推理，而非回放预定义脚本
- **Strands Agent 负责"意味着什么"**：应用保险特定的业务规则解释证据——图片是否可用、视频是否补充了缺失照片、音频是否包含关键陈述

这种分离使得 UI 交互逻辑和领域推理逻辑可以独立演进，同时保持可审计性。

### 多模态证据分析流程

- **图像分析**：每张图片独立评估——识别图片内容（车辆损伤、屋顶表面、医疗文档等）、评估视角是否适当、确认清晰度和可用性、标记损伤指标
- **视频分析**：将视频视为一等证据——评估视频捕获了什么、是否补充了静态照片的缺失信息、是否与其他证据佐证或矛盾
- **音频分析**：通过对应文本转录而非原始音频处理——提取关键观察、报告的损坏或条件、补充视觉/文档证据的上下文细节

### 复杂度分类

证据全部分析标记后，Strands Agent 整合理赔元数据和证据信号，评估复杂度：
- **Simple** 理赔：自动解决
- **Complex** 理赔：路由到"需审查"状态，自动生成结构化说明解释为何被标记

## 深度分析

### 浏览器推理 vs 传统 RPA 的范式差异

传统 RPA 基于选择器和预录脚本——当 UI 变更时脚本失效。Nova Act 的浏览器推理基于当前 UI 状态做出决策，"看到什么就推理什么"，而非"按照脚本点击什么"。这意味着：队列布局变化、列顺序调整、行数变化都不需要修改自动化逻辑。这在保险门户频繁迭代的现实中具有巨大价值——维护成本从"每次 UI 变更都需更新脚本"降为"Agent 自适应"。

但这也带来了新的挑战：推理的确定性不如脚本。Nova Act 可能对相同的 UI 状态做出不同决策，这在需要严格合规的保险场景中需要通过审计轨迹来补偿——每一步的截图和推理记录确保了可追溯性。

### 证据标记的复利效应

原文最深刻的洞察不在 FNOL 本身，而在标记证据的长期价值：当非结构化工件在摄入时被一致解释和标记，它们从静态附件转变为操作信号。这些信号支持：
- 基于证据实际内容而非粗粒度摄入字段的路由
- 下游工作流预填充上下文，减少交接摩擦
- 历史理赔基于真实提交和观察内容（而非摄入标签）进行分析
- 持续优化摄入规则，检测常见缺失，调整期望

这是一个从"数据存储"到"知识资产"的转变——标记使证据成为可搜索、可分析、可复用的持久数据，而非一次性文件。

### 人在环路的位置重置

方案的核心论点不是移除人，而是重置人参与的位置：从"验证摄入完整性"（重复性、注意力密集型）转向"应用判断做决策"（专家价值所在）。这呼应了 [Production Agent Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/production-agent-engineering.md) 的核心主张——生产级 Agent 系统的关键不在智能本身，而在将人的注意力从低价值任务重新分配到高价值决策。

### 合规性内建于执行轨迹

每步自动截图 + prompt 记录 + UI 状态转换的组合，本质上是在构建合规审计的证据链。在 EU AI Act 执法、FDA 人类监督要求、SOC2 审计追问 AI 决策追踪的监管环境下，这种内建的可观测性不仅是技术特性，更是合规必要条件。关键区别在于：这不是事后补加的日志，而是 Agent 行为的副产品——执行本身就在产生审计证据。

## 实践启示

1. **浏览器推理优于脚本自动化**：当目标系统 UI 频繁变更时，基于 UI 状态推理的自动化比基于选择器的脚本更健壮，但需配套审计轨迹补偿确定性不足
2. **证据标记是长期投资**：摄入时的标记成本是一次性的，但标记后的证据在理赔全生命周期持续产生价值——路由优化、模式分析、规则改进
3. **领域推理与 UI 操作必须分离**：Nova Act 和 Strands Agent 的职责分离不是技术优雅，而是务实需要——业务规则和 UI 流程的变化频率不同，分离使二者独立演进
4. **审计轨迹是合规副产品**：设计系统时让可观测性成为执行的副产品，而非额外的日志需求——截图、prompt、状态转换的自动捕获比事后补录更可靠
5. **Simple/Complex 分流降低认知负荷**：自动分类理赔复杂度，简单理赔自动处理，复杂理赔带着结构化说明路由给审查员——审查员带着上下文而非原始工件开始工作

## 相关实体

- [Build An Ai Powered Equipment Repair Assistant Using Amazon ](ch04/228-build-an-ai-powered-equipment-repair-assistant-using-amazon.html) — AgentCore + Knowledge Base 的维修助手
- [Building Web Search Enabled Agents With Strands And Exa](ch04/427-building-web-search-enabled-agents-with-strands-and-exa.html) — Strands SDK 搜索 Agent
- [Enterprise Intelligent Data Query Solution Practice Based On Strands Sdk](https://github.com/QianJinGuo/wiki/blob/main/entities/enterprise-intelligent-data-query-solution-practice-based-on-strands-sdk.md) — Strands SDK 企业级方案
- [Agentcore Harness](ch04/477-amazon-bedrock-agentcore-harness-ga-api-agent.html) — AgentCore 工程化
- [Aws Bedrock Agentcore Doris Mcp Server](../ch11/238-aws-bedrock-agentcore.html) — AgentCore + MCP Server
- [Autonomous Agent Systems](https://github.com/QianJinGuo/wiki/blob/main/concepts/autonomous-agent-systems.md) — 自主 Agent 系统
- [Agent Deployment Strategy](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-deployment-strategy.md) — Agent 部署策略
- [Ai Safety Governance](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-safety-governance.md) — AI 安全治理
- [Aws Ai Services](https://github.com/QianJinGuo/wiki/blob/main/concepts/aws-ai-services.md) — AWS AI 服务

---

