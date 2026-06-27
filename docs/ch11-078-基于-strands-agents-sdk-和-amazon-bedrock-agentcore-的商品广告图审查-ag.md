# 基于 Strands Agents SDK 和 Amazon Bedrock AgentCore 的商品广告图审查 Agent

## Ch11.078 基于 Strands Agents SDK 和 Amazon Bedrock AgentCore 的商品广告图审查 Agent

> 📊 Level ⭐⭐ | 10.6KB | `entities/product-ad-review-agent-with-strands-sdk-bedrock.md`

# 基于 Strands Agents SDK 和 Amazon Bedrock AgentCore 的商品广告图审查 Agent

AWS 官方博客发布的一篇企业级 Agent 实战案例：使用 Strands Agents SDK 的 **Agents as Tools** 模式 + Amazon Bedrock AgentCore 部署运行时，构建一个三 Agent 协作的「商品详情图广告词合规审查」系统。manager agent 负责协调，text extraction agent 负责图像 OCR，review agent 负责依据广告法知识库给出违规判定与修改建议。文章给出完整代码骨架、模型选型矩阵、以及端到端 AWS 部署架构（ECR + AgentCore Runtime + Bedrock KB + Cognito JWT + S3 + CloudFront + STS）。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/product-ad-review-agent-with-strands-sdk-bedrock.md)

## 摘要

电商详情页中每个商品可能包含数十张广告图，每张图里的营销文案都要逐一过法务审核才能上架——传统人工流程慢、易遗漏、标准不一致。本案例展示厨房家电品类的自动化方案：浏览器登录 → Cognito 拿 JWT → STS 取临时凭证 → 直传 S3 → 后端调用 Agent → manager agent 调度两个专家 Agent → 提取广告词 → 对照知识库做合规分析 → 按 `- text: suggestion` 格式逐条输出。整套系统体现了「多 Agent 编排 + 多模态 OCR + RAG 合规检索」的典型组合。

## 核心要点

- **架构模式**：Strands Agents SDK 的 Agents as Tools——一个 manager agent + 多个被封装为 `@tool` 的专业 sub agent
- **三个 Agent 的分工**：
  - `manager_agent`（Claude Sonnet 3.7）：协调者，把广告审核任务拆解后调度子 Agent
  - `TextExtractionAgent`（Claude Sonnet 4，vision）：从商品图中精确 OCR 营销文字，输出 JSON `text_blocks`
  - `ReviewAgent`（Claude Sonnet 3.5 v2）：基于 Bedrock Knowledge Base 中的广告法做合规分析，输出 `review_results`
- **模型选型矩阵**：vision_model = `us.anthropic.claude-sonnet-4-20250514-v1:0`，text_model = `us.anthropic.claude-3-7-sonnet-20250219-v1:0`，kb_model = `us.anthropic.claude-3-5-sonnet-20241022-v2:0`——按任务类型分别选最匹配的模型
- **端到端 AWS 架构**：ECR（容器镜像） + Bedrock AgentCore Runtime（运行时） + Bedrock（基础模型） + OpenSearch / S3 Vector（KB 存储） + Cognito（用户管理 + JWT 鉴权） + STS（直传 S3 临时凭证） + S3 + CloudFront（图片存储与分发） + ALB（负载均衡）
- **审核输出协议**：manager 严格规定输出格式 `- text: suggestion`，每条广告词一行，例如 `- "来个不如球釜": 表述存在歧义，"不如" 可能被理解为贬低性表述...`
- **OCR 提示词工程**：详细规定识别范围（中英文+数字+单位、艺术字/渐变/立体字）、排除项（条形码、价格、3C 认证标志）、精度要求（区分 0/O、1/l、6/G 等相似字符）

## 深度分析

### Agents as Tools 是企业级 Agent 的「微服务化」

manager agent 通过 `tools=[run_text_extraction, review_advertisement_text]` 把两个子 Agent 包装成可调用工具。从架构视角，这等价于把每个专业 Agent 部署成「单职责服务」，由协调者按需调度。这种设计的好处：

1. **职责单一**：每个 Agent 的 system prompt 专注于一件事（OCR vs 合规），prompt 调优互不干扰
2. **模型独立选型**：vision Agent 必须用多模态模型，合规 Agent 可以用更便宜的纯文本模型——成本可以分别优化
3. **可独立替换**：未来想把 OCR 换成 Textract 或开源 PaddleOCR，只需替换工具实现，manager 系统提示词不动
4. **可测试性**：每个子 Agent 可以单独写 eval，不必端到端测试整个 pipeline

代价是延迟：每次 manager 决定调用工具都要多一次 LLM 推理。对于审核这种秒级延迟可以接受的场景没问题；对于实时对话场景需要权衡。

### 模型分层选型是被严重低估的工程实践

文中给出的三模型矩阵不是随手分配——它对应了三种本质不同的计算特征：

| Agent | 任务特征 | 模型选择 | 理由 |
|---|---|---|---|
| Vision Agent | 多模态、字符识别精度优先 | Claude Sonnet 4 (最新视觉) | OCR 错一个字符就影响合规判定 |
| Manager Agent | 工具调用、流程协调 | Claude Sonnet 3.7 | 工具使用稳定性已足够，无需最贵 |
| Review Agent | 长上下文 + KB 检索 | Claude Sonnet 3.5 v2 | 检索增强后对推理需求适中，性价比最优 |

这种「**任务-模型亲和度**」的工程化，对应 Agent 部署策略里的核心原则：不要让一个模型干所有事。在真实生产里，按任务分层选模型可以把单次审核成本下降 30-60%。

### Bedrock AgentCore Runtime 的定位

文中部署架构里 AgentCore Runtime 是关键基础设施——它负责：

- 容器化 Agent 的生命周期管理
- 与 Bedrock 模型的鉴权打通
- 工具调用链的可观测性
- 多租户隔离

对企业用户来说，AgentCore 的价值是「不用自己搭 Agent 运行平台」，对应 [AgentCore Managed Harness](../ch04-206-agentcore-managed-harness) 的定位。但代价是供应商锁定——业务逻辑通过 `@tool` 装饰器和 AgentCore 抽象耦合，迁出 AWS 需要重写工具桥接层。

### OCR 提示词的「负面清单」工程

vision Agent 的 system prompt 中最值得借鉴的是「**严格排除**」清单：

- 商品本体的功能按键文字、刻度标识
- 价格信息（¥、元、折扣数字）
- 条形码、二维码、生产编号
- 认证标志文字（3C、CE 等）

这是典型的「负面清单优先」prompt 工程：与其告诉模型「识别营销文案」，不如告诉它「**这些不是营销文案**」。在大模型语境里，明确的排除规则往往比模糊的肯定描述效果更好——因为它把「营销 vs 非营销」这个边界判定问题转化为「是否落入排除集合」这个集合判定问题。

### 合规审核的严重程度分级

`ReviewAgent` 输出的 JSON schema 中包含 `severity: high/medium/low`，这是一个被低估的设计。仅给「违规/合规」二分判断时，法务团队仍需对每条结果再做人工分级；预先输出严重程度后，法务工作流可以按级别分流——high 必须人工复核、medium 自动退回设计、low 仅作记录。这把 Agent 的输出从「判定」升级为「**可被工作流直接消费的结构化数据**」，是 Agent 走向生产的关键一步。

## 实践启示

1. **多 Agent 项目从 Agents as Tools 开始**：比一上来上 LangGraph/Crew 这类完整框架更轻量，且 Strands SDK 把 `@tool` 装饰器做成了 1 行成本
2. **按 Agent 子任务分层选模型**：vision 用最新视觉模型，coordinator 用稳定工具调用模型，KB 推理用性价比模型——成本可下降 30-60%
3. **OCR Agent 的 prompt 必须给负面清单**：明确告诉模型「不要识别什么」比「要识别什么」效果更好
4. **审核类 Agent 必须输出严重程度**：让下游工作流可分流，避免把所有结果一股脑推到人工
5. **企业级架构必须考虑鉴权全链路**：Cognito JWT + STS 直传 S3 是 AWS 上「让浏览器直接上传大文件 + Agent 异步消费」的标准范式
6. **Bedrock KB 是合规类 Agent 的天然搭档**：法律法规这类「需要精确引用」的场景，RAG 比把法规写进 system prompt 更可维护
7. **如果不绑定 AWS**：用 Strands SDK 写的 Agent 可以迁到任何支持 `@tool` 抽象的运行时，但 AgentCore Runtime 的迁移成本极高——选型时要想清楚

## 相关实体

- [Agentcore Harness](../ch04-408-amazon-bedrock-agentcore-harness-ga-两-api-调用生产级-agent-基础设施) — AgentCore Harness 综述
- [Agentcore Managed Harness](../ch04-206-agentcore-managed-harness) — Managed Harness 定位与权衡
- [Amazon Bedrock Agentcore Runtime Deep Dive And Scenario Analysis](../ch11-068-快时尚电商行业智能体设计思路与应用实践-七-amazon-bedrock-agentcore-runtime-深度解析和) — AgentCore Runtime 深度分析
- [Agentcore Payments X402 Agentic Commerce](../ch11-066-agentcore-payments-与代理商务创新-技术深度解析) — AgentCore 在支付场景的应用
- [Agentic Scheduler With Strands Agentcore For Multi Region Gpu Inference](../ch04-167-基于strands和agentcore-实现agentic-scheduler-在多region自动编排推理gpu算力) — Strands + AgentCore 调度案例
- [Agentops Operationalize Agentic Ai Amazon Bedrock](../ch04-268-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed) — Bedrock Agent 运维
- Multi Agent Collaboration Patterns — 多 Agent 协作模式
- Multi Agent Orchestration — 多 Agent 编排
- Agent Deployment Strategy — Agent 部署策略
- [deep agents + bedrock agentcore：多 agent 编排 + 隔离基础设施的端到端研究 ag](../ch04-409-agent-orchestration)
- [aws bedrock agentcore 多账户对话式运维助手：基于 strands agents + devops](../ch11-072-aws-bedrock-agentcore-多账户对话式运维助手-基于-strands-agents-devops)

---

