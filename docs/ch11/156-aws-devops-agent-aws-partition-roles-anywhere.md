# AWS DevOps Agent 接入 AWS 中国区系列：Partition 隔离、多账号扩展与 Roles Anywhere 认证

## Ch11.156 AWS DevOps Agent 接入 AWS 中国区系列：Partition 隔离、多账号扩展与 Roles Anywhere 认证

> 📊 Level ⭐⭐ | 7.6KB | `entities/aws-devops-agent-mcp-china-partition-bridge.md`

## 核心要点

- AWS DevOps Agent 原生不支持 aws-cn（中国区），需自建桥接
- 单账号场景 MCP 桥接架构与端到端部署流程
- 系列第一篇，多账号扩展见后续

## 深度分析

**AWS DevOps Agent 接入中国区的核心障碍是 Partition 级别的法律实体隔离，而非配置问题。** AWS DevOps Agent 只跑在全球区（aws partition），其内置 `use_aws` 工具调用的是 `arn:aws:iam::...` 格式的身份，而中国区账号的 ARN 格式是 `arn:aws-cn:iam::...`——两者属于不同的 partition。全球区颁发的 Access Key 在中国区（如 cn-northwest-1）直接返回 `AuthFailure`。这是 AWS 法律实体级别的隔离，跨 partition 不能通过 AssumeRole 互通，唯一可行路径是自建 MCP Server，由它持有中国区 Access Key，DevOps Agent 通过 MCP 协议调用它，它再调中国区 API。

**MCP 桥接架构的设计决策体现了云原生内网安全原则。** 三大关键设计：(1) Pod 持长期 AK/SK 而不走 AssumeRole，因为跨 partition 不能互通；(2) Internal ALB（非 internet-facing）通过 VPC Lattice 实现内网互通，无需暴露公网；(3) Health Check Path 设为 `/mcp` 而非根路径，因为 `awslabs.aws-api-mcp-server` 的 streamable-HTTP 端点仅响应 `/mcp`，根路径返回 404。这些决策共同确保了桥接的安全性与可靠性。

**单账号部署的核心价值在于验证端到端链路，多账号扩展需在 blast radius 与凭证复用间取舍。** 文章明确提到系列第二篇会展开多账号扩展，涉及"为什么不复用同一对 Access Key"的 blast radius 取舍问题。这表明单账号场景的核心价值是让读者先跑通最小闭环，验证 MCP 桥接的可行性，再考虑规模化场景下的安全与运维权衡。

**安全保证由网络层（Internal ALB + VPC Lattice）承担，MCP Server 内部已完成认证。** 文章解释为什么不加 Auth 层：Internal ALB 提供网络层安全保障，仅接受来自 VPC Lattice Private Connection 的流量，公网无法访问；MCP Server 内部已用中国区 Access Key 与 AWS API 完成认证，前置鉴权由 ALB 网络层负担，没必要再加一层。这体现了"纵深防御"的安全架构理念。

**Skills 负责让 agent 理解多账号上下文，MCP 这一层只解决"能不能调到中国区 API"的基础连通性问题。** 文章指出"让 agent 能自然地知道用户问的是哪个账号、用什么格式输出对比表，是 Skills 的工作，不是 MCP 这一层能解决的"。这说明 MCP 桥接只是 Agent Space 能力扩展的基础设施，上层智能（多账号理解、输出格式化）需要独立的 Skills 机制来承载。

## 实践启示

**对于需要在 AWS 中国区部署 Agentic SRE 能力的团队**，建议先验证 MCP 桥接的端到端连通性：确认 Pod 内 curl MCP endpoint 返回 JSON-RPC 响应而非 `AuthFailure`，确认 Agent 状态栏显示使用了 `aws-cn` MCP 工具，且输出结果明确标注了 aws-cn 账号信息。切勿跳过 Pod 内 curl 测试直接进入 Agent 对话验证。

**对于中国区 Access Key 管理**，优先使用 External Secrets Operator + AWS Secrets Manager 方案（Mode B）而非手工 K8s Secret 管理（Mode A），特别是在多账号场景下。Mode A 适合单账号入门探索，Mode B 支持凭证轮换、审计与权限分离。

**对于 ALB Ingress 配置**，必须将 health check path 设为 `/mcp` 而非默认根路径。若 health check 失败导致 Target Unhealthy，解决方案是修改 values 中的 `healthcheckPath` 为 `/mcp`，或扩展 `success-codes: 200,404,405,406` 以接受 404 响应。

**对于 Docker 构建环境在国内的团队**，若遇到 `dial tcp 31.13.76.99:443: i/o timeout` 错误（Docker Hub 被 DNS 污染到 Meta CDN IP），需要修改 `/etc/hosts` 或使用国内镜像源代理，而非尝试翻墙或更换 registry。

**对于规划多账号扩展的团队**，需要在"blast radius 隔离"与"凭证复用便捷性"之间做架构权衡。建议先跑通单账号 Mode B 部署，理解清楚 ALB Internal Scheme + VPC Lattice Private Connection 的网络路径，再评估多账号下的凭证管理方案。

## 多账号扩展：Hub-Spoke 扇出（系列第二篇）

**IAM Roles Anywhere 是跨分区访问的关键突破。** 传统方案中，只有运行在 AWS 上的资源能通过 Task Role 获取临时凭证，其他环境只能使用 AK/SK。Roles Anywhere 允许不在 AWS 上运行的工作负载使用 X.509 证书换取 STS 临时凭证，一张证书扇出多账号、泄露后可实现秒级吊销。

**Hub-Spoke 架构实现一张证书管所有账号。** 仅在一个 Hub 账号中配置 IAM Roles Anywhere（Trust Anchor + Profile + Role），Hub Role 通过 sts:AssumeRole 扇出到各 Spoke 账号。新增账号时只需部署 Spoke Role 再把 ARN 加回 Hub。关键约束：Hub 必须在 aws-cn 分区，因为 sts:AssumeRole 不支持跨分区调用。

**跨云接入（以阿里云为例）仍需 AK/SK，但可结合 Roles Anywhere 做凭证治理。** 阿里云等非 AWS 云不支持 STS AssumeRole，跨云场景仍需长期 AK/SK。但通过 90 天轮换实践（Secrets Manager + 自动化轮换脚本），可将凭证泄露风险控制在可接受范围内。

**实战踩坑：RequestExpired 凭证一小时后全失效。** Roles Anywhere 签发的临时凭证默认有效期 1 小时，MCP Server 长时间运行不刷新会导致所有 API 调用返回 RequestExpired。修复：启动时初始化凭证刷新循环，每 50 分钟重新调用 CreateSession 获取新凭证。

## 相关实体
- [Aws Devops Agent Mcp Server打通混合云网络排障的最后一公里](../ch07/046-aws-devops-agent-mcp-server.html)
- [Aws Devops Agent 实战云网络故障自主调查与修复建议](ch11/265-aws-devops-agent.html)
- [Habby Game Aws Devops Agent](ch11/265-aws-devops-agent.html)
- [Outlook Ai Agent Aws Fargate Claude Agent Sdk](../ch04/030-ai-agent.html)
- [将 Aws Devops Agent 智能运维能力延伸到中国区](ch11/265-aws-devops-agent.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

→ [原文存档（第一篇）](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-devops-agent-mcp-china-partition-bridge.md)
→ [原文存档（第二篇）](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-devops-agent-mcp-china-part2-multi-account-roles-anywhere.md)

---

