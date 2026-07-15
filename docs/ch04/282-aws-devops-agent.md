# AWS DevOps Agent 实战：云网络故障自主调查与修复建议

## Ch04.282 AWS DevOps Agent 实战：云网络故障自主调查与修复建议

> 📊 Level ⭐⭐ | 9.4KB | `entities/aws-devops-agent-实战云网络故障自主调查与修复建议.md`

## 核心要点
- 混合云网络故障的根因散落在 CloudWatch、CloudTrail、VPC、TGW、DX、VIF 等多个控制面，人工调查耗时 30-60 分钟
- AWS DevOps Agent 通过 webhook 接收 CloudWatch 告警事件，自主调用 AWS API 收集多源证据，生成 Investigation 报告
- Agent 输出三类内容：Timeline（时间线）、Root cause（根因）、Mitigation plan（修复方案）
- 六大测试场景覆盖 BGP Prefix 异常、TGW 静态路由错配、Connection Down 等典型故障
- T3 场景展示了 Agent 对"控制平面健康但数据平面黑洞"这类最隐蔽故障的定位能力
- 端到端告警延迟约 3.5-4 分钟（从 on-premises BGP Down 到 Investigation 完成约 8-9 分钟）
- Agent 所有 skill 均为只读操作，修复方案以结构化文本输出，不执行任何写操作 

## 深度分析
### 混合云网络故障的特殊复杂性
混合云网络故障之所以难以排查，根本原因在于"控制平面和数据平面的分离"。当 TGW 静态路由覆盖 DXGW 传播路由导致 IDC 流量黑洞时，VPC、DX Gateway、VPN Connection 的状态指标全部显示健康——控制平面完全正常，数据平面已经不可达 。这种"gray failure"是混合云环境中最危险也最难检测的故障类型。
作者通过 6 个真实故障场景验证了一个核心原则：**AWS 服务级健康指标只能回答"服务自身是否正常"，不能回答"服务间流量是否真正到达对端"** 。唯一的解决方案是在两端之间部署端到端主动探测。

### DevOps Agent 的三大核心能力层次
从 T1、T2、T3 三个深度场景可以看出 Agent 能力的三个递进层次：
**第一层：数据关联与假设排除（T1 BGP Prefix High）**——Agent 并行拉取 PrefixesAccepted 和 PrefixesAdvertised 两条指标做来源判定（AWS 侧 vs. on-premises 侧），精确收敛 CloudTrail 查询窗口排除 AWS 侧配置变更。更关键的是给出前瞻性风险量化："当前 92 条/距硬限制 8 条/若趋势不变将在 5 分钟内触发 BGP reset" 。这一能力超越传统告警——后者只能回答"发生了什么"，Agent 进一步回答"如果不处理会变成什么"。
**第二层：跨 Region 横向关联（T2 BGP Prefix Asymmetry）**——Agent 同时对 eu-west-1 与 eu-west-2 两个 Region 发起 CloudWatch 查询，将历史基线回溯到 28 小时窗口对比，精确定位到 UTC 07:03 前后的阶跃下降时点 。这种跨 Region 横向关联在人工排查中需要在两个 Region 的控制台来回切换，效率极低。
**第三层：控制平面变更的因果链重建（T3 TGW 静态路由错配）**——Agent 给出了完整的 IAM 角色、源 IP、浏览器元数据，直接定位到"谁在什么时间执行了哪个 API 调用"；并主动解释了"为什么这条静态路由会覆盖 DXGW 传播路由"的协议级机理 。这是从"相关性分析"到"因果性定位"的关键跃升。

### 5 阶段 Mitigation Plan 的工程价值
T3 场景的 Mitigation Plan 给出了完整的 5 阶段 runbook：Prepare / Pre-validate / Apply / Post-validate / Rollback，每个阶段有明确的运维语义和可直接执行的 AWS CLI 命令 。这不是一条命令的简单建议，而是一份"变更可回滚、可观测、可审计"的结构化方案，可直接接入 SRE 团队的变更管理流程。
这一输出形态的设计哲学值得深思：DevOps Agent 刻意不做执行（只读操作），将"决策"和"执行"分离。Agent 提供充分的上下文和具体的修复命令，但由工程师做出最终决策并执行。这一设计避免了 AI 执行错误修复的风险，同时将工程师从"跨多个控制台收集证据"的苦力工作中解放出来。

### 自建快指标的必要性
AWS 原生 AWS/DX 命名空间的 VirtualInterfaceBgpStatus 指标以 5 分钟为周期发布，对于需要分钟级响应的故障场景偏慢 。作者部署了 bgp_poller.py Lambda，以 1 分钟为周期调用 DescribeVirtualInterfaces 并发布至自定义命名空间 POC/DX，将告警延迟从约 15 分钟降至 3-4 分钟 。
这个案例揭示了一个重要的工程原则：**AWS 原生监控指标往往是为通用场景设计的，对于特定业务的延迟要求，需要自建指标作为补充**。尤其是跨 Region 对比、跨服务关联等场景，原生指标的数据模型往往无法直接支持。

## 实践启示
**1. 优先为关键业务路径部署主动探测**
控制平面指标正常不等于数据平面可达。建议对以下场景部署主动探测：VPC 通过 TGW + DX/VPN 访问远端 IDC；跨账号/跨 VPC 的非冗余链路；依赖 PrivateLink 的 SaaS 类业务。实现可以很轻量——Python icmplib 脚本 + t3.nano EC2 + systemd 服务即可，每 10 秒一次 ICMP 探测 + CloudWatch 自定义指标 。
**2. 充分利用 AlarmDescription 字段传递上下文**
CloudWatch 告警的 AlarmDescription 字段应包含结构化业务上下文（故障类别、资源 ID、业务分组、可能根因方向），DevOps Agent 接收 webhook 时优先解析此字段确定调查范围。若字段仅为阈值描述，Agent 需从 dimension 反推语义，效率显著下降 。
**3. 对 BGP Prefix 类告警使用双阈值覆盖**
对 BGP Prefix Drop 等关键指标，建议部署双阈值告警：< 10 条（Floor，捕获全量撤回）和 < 50 条（Partial，捕获部分撤回）。两条告警按时序依次触发时，Investigation 的 triage 层识别为"同一事件严重度升级"，形成自然的告警序列 。
**4. 统一告警名前缀规范以便 Agent 自动路由**
告警名前缀（DX-BGP-*、DX-Conn-*、DX-LightRx-*、Network-*）由 agent_trigger Lambda 映射至 DevOps Agent 的 severity 和 skill hint。前缀规范稳定后，新增告警遵循相同模式即可自动接入正确的 Investigation 路径，减少维护成本 。
**5. 在 on-premises router 启用 BFD**
未启用 BFD 时，BGP holdtime 默认 180 秒，叠加 CloudWatch 指标评估周期后告警延迟可能超过 4 分钟。启用 `bfd interval 300 min_rx 300 multiplier 3` 后，BGP 本地收敛时间从分钟级降至亚秒级，是部署 Direct Connect 监控的基础前置配置 。
**6. 将 DevOps Agent 定位为"调查工具"而非"修复工具"**
当前 Agent 的价值在于解放工程师的调查工作，而非替代工程师做决策。建议保持"只读操作"的设计原则，让 Agent 提供上下文、假设、修复建议，由工程师判断和执行。这既降低了自动化修复的风险，也为未来向"自动修复"演进保留了安全边界 。
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-devops-agent-实战云网络故障自主调查与修复建议.md)

## 相关实体
- [Habby 游戏借助 AWS DevOps Agent 实现智能运维最佳实践](../ch11/264-aws-devops-agent.html)
- [Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](../ch01/891-anthropic.html)
- [AI tool poisoning exposes a major flaw in enterprise agent security](ch04/431-ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-s.html)

- [Agent orchestration](ch04/490-agent-orchestration.html)
- [AWS DevOps Agent × MCP Server：打通混合云网络排障的最后一公里](../ch07/046-aws-devops-agent-mcp-server.html)
- [AWS Reinvent Game Demo 2024-25](../ch11/235-aws-reinvent-game-demo-2024-25.html)
- [AI Agent 探索之路：从 Task-Driven 到 Goal-Driven](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-agent-exploration-path.md)
- [AgentCore Managed Harness](ch04/647-agentcore-harness.html)
- [AI Agent 工程师能力地图](ch04/030-ai-agent.html)
- [aws devops agent 接入 aws 中国区（一）：partition 隔离与 mcp 单账号桥接](../ch11/264-aws-devops-agent.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/aws-cloud-ai-infrastructure.md)

---

