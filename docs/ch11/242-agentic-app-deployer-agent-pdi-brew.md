# Agentic App Deployer — 规划/供给双 Agent 分离模式（PDI Brew）

## Ch11.242 Agentic App Deployer — 规划/供给双 Agent 分离模式（PDI Brew）

> 📊 Level ⭐⭐ | 5.5KB | `entities/building-an-agentic-app-deployer-with-amazon-bedrock-and-aws-lambda.md`

# Agentic App Deployer — 规划/供给双 Agent 分离模式（PDI Brew）

## 核心模式：规划 Agent 与供给 Agent 分离

PDI Technologies 为内部长尾工具（成本计算器、表单、仪表板）构建了 PDI Brew：非技术员工用自然语言描述工具，几秒内获得一个已供给完成的多租户 Web 应用（SSO 保护、运行在 AWS 上），无需 Git/终端/DevOps 知识。其架构核心是**"Agentic 不等于每个决策都经过 LLM"**——将 agent 定义（取目标、分解、选工具、行动）拆成两个信任画像完全不同的 Agent：

1. **规划 Agent（planning agent）**：捕获意图、访谈用户、生成前端、输出结构化部署清单（manifest JSON——应用名、类型、数据 schema、访问控制设置）。规划逻辑打包为 Vibe App Builder skill，运行在员工已用的 AI 助手里，保持 AWS 侧表面积小。
2. **供给 Agent（provisioning agent）**：AWS Lambda 函数，接收 manifest 后作为**确定性、可审计、会用工具的编排器**执行——校验请求、分类工作负载、选择供给路径、调用 AWS/Microsoft Graph API 作为工具、通过异步自调用处理长任务、返回实时 URL。供给逻辑放在 Lambda 而非聊天会话里是有意设计：供给是每个决策都必须可记录、可复现、无幻觉的工作负载。

## 可插拔规划层：同一 manifest 契约

`PLANNER_MODE` 环境变量选择规划路径，两条路径都产出**完全相同的 deploy manifest**，下游一切不变：

- **Path A**：Vibe Skill 运行在任意 AI 助手（Claude/ChatGPT/Claude Code）内——规划在 AWS 之外，用户体验丰富。
- **Path B**：Amazon Bedrock `InvokeModel` 作为规划器，运行在 AWS 信任边界内——每个决策落入 CloudTrail、绑定 model-invocation ID、意图数据不出 AWS 边界（满足严格数据驻留要求）。

关键设计点：两个规划器收敛到同一端点与契约，添加 Bedrock 路径是增量改动而非重写；`PLANNER_MODE` 可按组织/工作区/用户钉住。这为未来把 Bedrock invocation 替换为更丰富的托管 agent runtime 留下干净的前进路径。

## 供给流程（请求走查）

1. 员工用自然语言描述工具 → 规划器（Path A 或 B）产出 manifest JSON
2. manifest 经 HTTPS 到 `POST /deploy`（API Gateway），Entra ID bearer token（MSAL.js）认证
3. Deploy Lambda 校验 Entra JWT（tenant + expiry）、强制 access-control 模式存在、原子检查 slug 所有权
4. 分类工作负载：static（计算器/图表）vs full-stack（需持久化）
5. static：HTML 包 Entra 认证壳 → S3 → CloudFront 缓存失效 → DynamoDB 注册
6. full-stack：额外供给每应用 DynamoDB 表 + 每应用 Lambda（scoped IAM role）+ 每应用 API Gateway，注入 API URL 到前端
7. 长任务（如创建 Microsoft 365 组）用**异步自调用**——agent 调用第二个自身副本作后台任务，用户请求快速返回
8. 用户经 CloudFront 访问 `<slug>.domain`，每个应用都在 Entra SSO 之后

## 双轨计算模型与治理 AI

- **per-app 运行时采用双轨模型**：static 应用只付 S3/CloudFront/DynamoDB 成本；full-stack 应用才有专属 Lambda/API Gateway——scale-to-zero、空闲几乎零成本、无共享服务器可打补丁。
- **治理 AI 网关**：应用可 opt-in 受控 AI 能力（chat/summarize/classify），但只通过**最低权限网关**访问 Bedrock——永不嵌入自己的模型 key；Guardrails + 配额 + 完整审计轨迹。
- **安全与最小权限**：每个应用继承企业 SSO、scoped IAM、HTTPS、集中可观测性——"不存在不安全路径"；默认安全由平台强制而非应用作者选择。

## 与 Wiki 现有知识的关联

- 与 [LendingTree 多 Agent 架构](../ch04/786-how-lendingtree-built-a-multi-agent-mortgage-assistant-on-am.html) 同属"生产级多 Agent 架构"家族——都强调编排层与执行层解耦，但本文的核心增量是**规划/供给分离 + manifest 契约**（确定性执行 vs 对话式规划）
- [多 Agent 编排](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-orchestration.md) 的信任画像分离实践——规划 Agent 可容忍 LLM 幻觉（对话），供给 Agent 必须确定性（记录/复现/无幻觉）
- [Orchestrator-Worker 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/orchestrator-worker-architecture.md) 的变体——这里不是同层 worker 分工，而是跨信任边界的规划→执行流水线
- [Agent 部署策略](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-deployment-strategy.md) 与 serverless scale-to-zero 的工程实践
- → [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/building-an-agentic-app-deployer-with-amazon-bedrock-and-aws-lambda.md)

---

