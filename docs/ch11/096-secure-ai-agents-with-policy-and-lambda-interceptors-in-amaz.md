# Secure AI agents with Policy and Lambda interceptors in Amazon Bedrock AgentCore gateway

> 📊 Level ⭐⭐⭐ | 8.6KB

## 摘要

AWS 的核心判断是：传统应用执行固定逻辑，而 LLM 驱动的 agent 在运行时才决定调用哪个工具、传什么参数、按什么顺序调用，调用图无法事先审计，安全机制必须能约束运行时行为。文章用一套 lakehouse 数据 agent 演示了 Policy 做确定性访问控制、interceptor 做动态校验，并把两者组成一条流水线。关键设计是把判定点收敛到 AgentCore Gateway 这一层，而不是散落在各个 agent 内部。

## 核心要点

- 调用图不可预先审计，因为工具、参数与顺序都是运行时决策，治理点必须落在运行时必经的路径上。
- Policy in Amazon Bedrock AgentCore 以 Cedar 表达，每条规则在 principal、action、resource 三元组上求值，可用请求上下文加条件，结果为确定的 allow/deny。
- 挂载 Policy Engine 的 Gateway 采用 deny-by-default 语义：没有显式 permit 的请求一律被拒，需先用一条宽泛 permit 打底。
- Cedar 中 forbid 优先于 permit，于是「宽 permit + 定向 forbid」成为以最小改动实现新增限制的惯用法。
- Interceptor 是网关在 REQUEST / RESPONSE 两阶段调用的自定义 Lambda，网关把原始 headers 与 body 放在 `mcp` 键下传入，转换后以同样结构返回。
- 评估顺序是 REQUEST interceptor 先于 Cedar policy —— 这正是「先富化上下文、再对富化后的上下文做确定性判定」能够成立的前提。
- Act-on-behalf 通过 `sts:AssumeRole` 把用户 JWT 换成短时、租户级、最小权限的凭证，避免把高权限原始 token 透传给下游服务。

## 深度分析

### 为什么执行点必须落在 Gateway 层

统一的企业 AI 平台上，数百个 agent 要访问跨团队、跨业务单元的数千个 MCP 工具，若安全逻辑写在每个 agent 里，就会退化成 N 乘 M 的散点式实现：无法保证一致，也无法保证不被绕过。agent 代码可被修改、prompt 可被注入、LLM 会做出意料之外的编排，任何依赖 agent 自觉的守卫都只是建议而非边界。把判定点放到 Gateway 上换来三点结构性收益：所有工具调用必须经过同一个入口，策略与 agent 实现解耦（一次策略变更覆盖全部 agent），以及 deny-by-default 把默认姿态从「允许除非禁止」翻转为「拒绝除非许可」。

### Cedar 的判定语义：主体、动作、资源与 forbid 优先

Cedar 是声明式策略语言，规则形态为 permit 或 forbid，在 principal（谁提出请求）、action（要做什么）、resource（对什么做）上求值，可用请求上下文作为可选条件收窄。两个语义细节让它能承担网关边界：一是 forbid 优先于 permit，任何 forbid 命中即拒绝，这让「一条兼容 permit + 一条精确 forbid」足以表达新限制；二是 action 把 gateway target 与工具名编码进标识符（形如 `lakehouse-mcp-target___get_claims_summary`），工具级粒度因此成为策略语言里的一等公民。确定性是它最被强调的属性：相同输入恒定得到相同决策；每条决策都写入 CloudWatch，形成带完整上下文的审计轨迹；Cedar 求值本身的开销可忽略。应急时一条 forbid 可用控制面 API 立即生效。

### Lambda interceptor：入站与出站两个钩子的职责划分

Interceptor 是网关在请求生命周期两个阶段调用的自定义 Lambda。REQUEST 阶段在请求抵达下游工具之前运行，可以做 Cedar 做不到的三件事：把用户 Cognito JWT 换成租户级 IAM 凭证；把身份与临时凭证注入 `params.arguments.context`，供 MCP Server 构造被缩权的 Athena 客户端；对照 DynamoDB 的 `allowed_tools` 做工具级授权并返回结构化 MCP 错误。RESPONSE 阶段在响应返回 agent 前运行，典型用途是过滤 `tools/list` 与语义搜索结果，让用户只看到自己有权调用的工具，也可接入 Bedrock Guardrails 做 PII 脱敏。

身份在调用链中的传播方式是这里最重要的安全抉择。把原始用户 JWT 原样透传给每个下游服务实现简单，但下游会拿到超出其需要的权限，一旦某个服务被攻破便可复用这个高权限 token 到别处，即 confused deputy 问题。另一种取向是 act-on-behalf：每个下游目标只收到为该服务专门缩权、短时有效的凭证，用户身份仅作为审计上下文流转。

### 组合模式、失败模式与信任边界的分层

地理围栏最能说明组合的必要性：合规要求欧盟辖区用户不得访问个体理赔记录，只能看聚合汇总。用户 geography 存在 DynamoDB 里，Cedar 无法发起外部查询；反过来，Lambda 也表达不出带自动审计日志的声明式 forbid。于是分工出现 —— interceptor 查出 geography 并注入请求，Cedar 再用 `context.input.geography` 做声明式判定。注入位置影响策略可读性：Cedar 把工具参数暴露为 `context.input.<field>`，geography 放在 arguments 顶层即可写作 `context.input.geography`，嵌进 context 内部则变成 `context.input.context.geography`。

值得警惕的失败模式有三类：延迟上，Lambda 有冷启动与执行时间开销且处在请求关键路径上，Cedar 求值几乎无感；可审计性上，策略决策被自动记录，Lambda 只有手工埋点的日志；变更风险上，若跳过 LOG_ONLY 直接以 ENFORCE 上线，一条写错的策略会立刻阻断线上流量。信任边界由此分成三层——网关负责 JWT 校验与工具级授权，Lambda interceptor 负责动态授权与凭证派发，Lake Formation 在查询时做行级与列级过滤：agent 构造出宽泛 SQL，结果仍被限定在调用者 IAM 角色的可见范围内，最后一层兜底明确不信任 agent 生成的查询语句。

## 实践启示

1. 先做规则分类再选层：能被身份属性、动作名、资源 ARN 或已有上下文表达的规则交给 Cedar；需要运行时取数、改写 payload 或换票的交给 interceptor。
2. Policy Engine 上线先设 `LOG_ONLY`，所有决策只写日志不阻断，核对每条规则的实际命中情况后再切 `ENFORCE`。
3. 用「宽 permit + 定向 forbid」而不是不断收窄 permit，新增限制即为增量改动，且天然获得 forbid 优先的保护。
4. 需要外部数据的属性（geography、租户映射、限流状态）统一由 REQUEST interceptor 注入工具 arguments 顶层，让 Cedar 以 `context.input.<field>` 引用。
5. 身份传播默认走 act-on-behalf 而非透传用户 JWT，把 `sts:AssumeRole` 得到的短时缩权凭证交给下游，原始 token 只在网关内使用。
6. 不要把网关当作唯一防线：后端存储层仍需独立的行级与列级权限，因为 agent 生成的查询不可信；并用 RESPONSE interceptor 过滤工具、脱敏 PII，既收敛权限也缩小 LLM 的工具选择空间。

## 相关实体

- [AgentCore 的质量评估与 Policy 控制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-agentcore-adds-quality-evaluations-and-policy-controls-for-deploying-trusted-ai-agents.md)
- [AgentCore 身份与安全](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-bedrock-agentcore-identity-security.md)
- [AgentCore 与 Secrets Manager 身份集成](https://github.com/QianJinGuo/wiki-public/blob/main/entities/bedrock-agentcore-secrets-manager-identity.md)
- [AgentCore Gateway 的 MCP 扩展](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-agentcore-gateway-mcp-extension.md)
- [Model Context Protocol (MCP)](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md)
- [跨区域推理与 EU GDPR 合规](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-cross-region-inference-cris-eu-gdpr.md)

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/secure-ai-agents-with-policy-and-lambda-interceptors-in-amazon-bedrock-agentcore-gateway/)

---

