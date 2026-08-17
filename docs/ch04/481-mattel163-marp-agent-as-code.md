# Mattel163 MARP：多智能体报告自动生成平台（异步长任务 × 证据链 × Agent-as-Code × 项目级凭证）

## Ch04.481 Mattel163 MARP：多智能体报告自动生成平台（异步长任务 × 证据链 × Agent-as-Code × 项目级凭证）

> 📊 Level ⭐⭐ | 7.7KB | `entities/mattel163-marp-multi-agent-report-platform-aws-2026-08-17.md`

# Mattel163 MARP：多智能体报告自动生成平台

> 生产级多智能体系统的一个可迁移实例：把数周的玩家反馈人工分析压缩到分钟级自动报告。MARP（Multi-Agent Report Platform）由 Mattel163 与亚马逊云科技基于 Amazon Bedrock AgentCore + Strands Agents SDK 构建，其价值不在"多智能体"这个标签，而在四个可复用工程模式：异步长任务架构、证据链防幻觉标准、Agent-as-Code 声明式管理、项目级 IAM 凭证安全。

## 背景与问题

Mattel163 运营 UNO!、Phase 10 等全球 IP 游戏，覆盖 200+ 国家和地区、14 种语言的数千万玩家。每天产生海量玩家反馈：应用商店评论、客服工单、社交媒体舆情、活动问卷、访谈录音。传统人工分析需数周、质量因人而异、多语种协调成本高、时效性差。

直接用 LLM 调用无法解决——报告生成是复杂多步骤工作流：数据不在提示词里（S3 Excel、数百 MB 音频）、上下文超单次容量（数千条多语种评论需分批）、输出有严格格式与证据要求、流程有分支决策（CSV 还是 Excel？多语种混杂？样本量是否足）。这些正是 Agentic AI 的用武之地。

## 四个可迁移工程模式

### 1. 异步长任务架构（SQS + 状态机 + WebSocket）

报告生成是分钟到小时级的长任务，远超 API Gateway 29 秒同步超时。MARP 用三层组合解决：

- **SQS 解耦提交与执行**：任务提交立即返回 task ID（DynamoDB 状态沿 `pending → running → completed/failed` 流转），DLQ 兜底失败（最大重试 3 次），任务不静默丢失。
- **WebSocket 实时流式推送**：Strands SDK 的 `stream_async()` 逐事件产出执行过程（正在调哪个工具、生成了什么），经 API Gateway WebSocket 推给前端，用户"看着"智能体工作——这种透明性显著提升对 AI 输出的信任。
- **双向调用链路**：对话式交互走直连链路（Cognito 认证后直接调 AgentCore Runtime HTTPS 端点，控制面与推理面分离）；长报告任务走异步链路。

### 2. 证据链防幻觉标准（可核验引用约束）

MARP 与 UX 团队共同定义的产出标准，核心是让每条洞察锚定在可核验的原文上：

- 每条结论下附玩家英文原话，原文不得修改、缩写、润色；引文带 role ID 和 VIP 等级（如 `"I love the vibrant colors." (role_id_xxx, VIP4)`）。
- 主题命名必须具体可操作（"回合节奏流畅，操作反馈及时" 合格，"体验好" 不合格）。
- 开放题必须结合前置选择题交叉分析；过滤 "fun"/"good" 等无上下文短答；主题结论须达最低样本量门槛，样本不足明确标注置信度限制。
- **核心思想**：对机器是结构性防幻觉（结论必须锚定可核验原文，模型无"自由发挥"空间）；对人让研究员可按 role ID 回溯任意引用的真实性，几分钟抽检即可建立对整个报告的信心。

这套标准不是工程团队设计，而是 UX 专家把多年分析方法论沉淀成提示词模板——领域专家不写代码，直接定义智能体的专业行为。

### 3. Agent-as-Code：声明式智能体定义与部署

MARP 构建 Agent Toolkit——"Terraform 式"的智能体定义部署工具：一个 YAML 文件声明智能体的全部要素（model、max_tokens、system_prompt、tools、mcps、memory 类型），工具链自动生成标准化代码并部署到 AgentCore Runtime。新增一个分析场景 = 一个 YAML + 一次 `python cli.py validate && deploy` 命令。

两个设计要点：

- **工具注册表（Tool Registry）**：工具集中注册（模块路径 + pip 依赖），部署时自动收集生成 requirements.txt；外部能力（如网络搜索）经 MCP 接入，与自研工具配置层面同等对待。
- **两层配置化体系**：YAML 定义智能体的"能力边界"（模型/工具/记忆/认证），分析模板定义"专业方法论"（分析框架/输出规范/证据规则）。业务团队与工程团队各自迭代自己的层，互不阻塞。

### 4. 项目级 IAM 凭证安全（Prompt Injection 纵深防御）

多项目共用平台的场景：A 项目的智能体手握 S3/Shell 强工具，如何防止读到 B 项目数据？MARP 把权限收敛从提示词层下沉到 IAM 层：

- 用户经 Cognito 认证后，凭证服务从 DynamoDB 查其项目列表，调用 STS AssumeRole 并附加动态生成的 Session Policy，把 S3 权限精确限制在该用户项目前缀下（"权限跟着会话走，而不是跟着角色走"）。
- 系统提示词要求"必须用封装了项目凭证的专用 S3 工具，不要直接调 boto3/AWS CLI"，但提示词约束非硬边界——真正的安全底线由 IAM 保证：即使提示词被注入、即使模型"想"读别的项目文件，凭证本身无越权能力。
- 配合 AgentCore Runtime 会话级隔离，形成"IAM 硬边界 + 工具层封装 + 提示词软约束 + 运行时隔离"纵深防御。

## 与既有实体关系

- 架构立足 [AgentCore Managed Harness](ch04/297-agentcore-managed-harness.html) 与 Strands SDK——MARP 是 AgentCore 托管底座上的一个生产案例。
- 报告生成本质是多智能体编排，对照 [Agent Orchestration 多智能体系统](ch04/619-agent-orchestration.html) 的模式分类。
- 异步长任务 + 可观测流式输出属于生产级 Harness 工程范畴，参见 [Harness Engineering](../ch05/065-harness-engineering.html)。
- 项目级凭证安全与 [Agent 记忆与上下文调度](ch04/180-agent-memory.html) 的无害权设计互补（权限/记忆都须按会话最小化）。

## 相关概念

- 多智能体编排 → [Agent Orchestration Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md)
- Agent 运行安全 → [Agent Security Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-architecture.md)
- 记忆架构（权限最小化对照）→ [Agent Memory Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-architecture.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/mattel163-marp-multi-agent-report-platform-aws-2026-08-17.md)

---

