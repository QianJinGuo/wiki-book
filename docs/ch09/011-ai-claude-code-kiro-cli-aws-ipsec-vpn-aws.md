# AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联 | 亚马逊AWS官方博客

## Ch09.011 AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 26.3KB | `entities/ai-network-claude-code-kiro-cli-implement-aws-ipsec-vpn.md`

## 概述
AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联 by awschina on 24 4月 2026 in Artificial Intelligence Permalink Share 摘要：本文介绍了如何利用 Claude Code（负责腾讯云侧）和 Kiro CLI（负责 AWS 侧）两个 AI 工具协作，在几小时内完成 AWS 与腾讯云之间 IPsec VPN 双隧道互联的搭建，并迭代了三种架构方案（SPD 策略路由 → VPC 目的路由 → CCN 云联网目的路由），展示了 AI 工具在跨云网络配置中加速知识翻译、参数生成和问题定位的实际价值。 目录 01 一、引言：跨云互联的工程挑战 02 二、工具介绍：Claude Code 与 Kiro CLI 03 三、两朵云环境与网络规划 04 四、三种架构方案演进 05 五、关键技术决策点 06 六、AI 辅助搭建的实际交互 07 七、搭建效率量化对比 08 八、总结与方案选择建议 09 九、资源链接 一、引言：跨云互联的工程挑战 在多云策略日益普及的今天，跨云私有网络互联已成为企业基础设施的常见需求。典型场景是：业务团队在 AWS 和腾讯云分别部署了服务，需要两侧 VPC 通过 IPSec VPN 实现内网互通，并满足双隧道冗余和自动故障切换的高可用要求。 这个需求在技术上并不新颖，但工程复杂度不低： 两侧云平台的 VPN 产品模型、API 风格、参数命名存在显著差异 IKE/IPSec 协商参数必须两侧严格匹配，任何一项不一致都会导致隧道协商失败 腾讯云侧有三种路由模式（SPD 策略路由、目的路由、BGP 动态路由），选型直接决定故障切换机制 涉及 VPN 网关、对端网关、VPN 通道、路由表、安全组等多个资源的编排 对于一个熟悉 AWS 但从未接触过腾讯云 CLI（tccli）的工程师来说，传统方式需要在两侧文档、控制台和终端之间反复切换，搭建和调通一个完整的双隧道方案通常需要 1-2 天。 本文将展示如何通过两个 AI 工具的分工协作：Claude Code 负责腾讯云侧，Kiro CLI 负责 AWS 侧，在一天之内完成三种架构方案的迭代搭建。你将看到： 三种架构方案（SPD、VPC 目的路由、CCN 目的路由）的演进逻辑和适用场景 跨云 IPSec VPN 搭建的六个关键技术决策点 AI 工具如何加速陌生云平台的学习和多资源编排 搭建效率的量化对比 二、工具介绍：Claude Code 与 Kiro CLI 在深入方案搭建之前，先介绍本文使用的两个 AI 工具，以及它们为什么能胜任跨云网络搭建这类复杂任务。 2.1 Claude Code：终端中的 AI 开发助手 Claude Code 是 Anthropic 推出的命令行 AI 助手，运行在终端中，能够： 通过自然语言对话理解需求，生成和执行 Shell 命令 读写本地文件，处理 JSON/YAML 等配置文件 保持多轮对话的上下文，适合渐进式探索和学习 在本文的场景中，Claude Code 承担了腾讯云侧的全部工作：学习 tccli 命令体系、生成 VPN 网关和通道的创建命令、编写 JSON 输出解析脚本、解释 SPD 与目的路由的概念差异。其核心价值在于将 AWS 工程师已有的网络知识”翻译”到腾讯云的 API 体系中。 2.2 Kiro CLI：AWS 原生的 AI 运维工具 Kiro 是 AWS 推出的 AI 驱动开发环境，提供 IDE 和 CLI 两种形态。Kiro CLI 运行在终端中，能够通过 MCP（Model Context Protocol）连接 AWS 服务，直接操作 AWS 资源。 在本文的场景中，Kiro CLI 负责 AWS 侧的全部工作：VGW 创建、Customer Gateway 配置、VPN Connection 隧道参数生成、路由传播设置和安全组配置。 2.3 分工模式 两个工具采用”各管一侧”的分工模式： 职责 工具 具体内容 腾讯云侧配置 Claude Code VPN 网关、对端网关、VPN 通道、VPN 网关路由表、VPC 路由表 AWS 侧配置 Kiro CLI VGW、Customer Gateway、VPN Connection、路由传播、安全组 架构决策与参数对齐 工程师 IKE/IPSec 参数匹配、路由模式选型、网段规划 这种分工的核心优势是：每个工具只维护自己那一侧的上下文，避免了跨平台概念混淆。但两侧的参数对齐（加密算法、DH 组、SA 生命周期等）必须由工程师手动完成，AI 不知道另一侧配了什么。 三、两朵云环境与网络规划 3.1 网络拓扑 [图1] 3.2 隧道参数规划 参数 Tunnel 1 Tunnel 2 Inside CIDR 169.254.200.0/30 169.254.201.0/30 IKE 版本 IKEv2 IKEv2 IKE 加密 AES-CBC-128 AES-CBC-128 IKE 认证 SHA1 SHA1 DH 组 GROUP2 GROUP2 IPSec 加密 AES-CBC-128 AES-CBC-128 IPSec 认证 SHA1 SHA1 PFS DH-GROUP2 DH-GROUP2 IKE SA 生命周期 28800 秒 28800 秒 IPSec SA 生命周期 3600 秒 3600 秒 关键约束：以上参数必须两侧严格一致。AWS 和腾讯云的默认值不同，需要逐项手动对齐。 四、三种架构方案演进 搭建过程中我们迭代了三种方案。每次迭代都源于前一个方案的实际痛点，而非预先规划。AI 工具使得这种”发现问题 - 调研替代 - 重新实现”的循环足够快，一天之内完成了三轮。 4.1 方案一：SPD 策略路由 核心思路：在每条 VPN 通道上配置 SPD（Security Policy Database）规则，指定该隧道承载的流量范围。 通道 1 SPD: 172.16.0.0/24 ↔ 172.31.99.0/25 ← 真实业务流量 通道 2 SPD: 10.255.0.0/24 ↔ 10.255.1.0/24 ← 占位符（不承载流量） 为什么 Tunnel 2 要用占位符网段：腾讯云在 API 层面禁止同一 VPN 网关下不同通道的 SPD 网段对重叠。SPD 是平铺的匹配表，没有优先级字段，两条规则匹配同一个包即为冲突。因此只能给 Tunnel 2 填一个不会有真实流量的占位网段。 故障切换机制：外部脚本（failover.sh）每 30 秒轮询 Tunnel 1 状态，故障时调用 API 互换两条通道的 SPD 规则。 评估：方案可用，但运维负担重，需要维护常驻脚本，切换速度慢，占位网段增加了配置的隐晦性。 4.2 方案二：VPC 型 + 目的路由 核心改进：创建 VPN 通道时不传 SecurityPolicyDatabases 参数，进入目的路由模式。流量匹配从通道级的 SPD 规则移到 VPN 网关的路由表。 VPN 网关路由表（独立于通道）: 172.31.0.0/16 → Tunnel 1，优先级 0 ← 主（优先级最高） 172.31.0.0/16 → Tunnel 2，优先级 100 ← 备 故障切换机制：DPD（Dead Peer Detection）+ NQA 健康检查探测隧道内部 IP。平台自动完成切换，无需任何脚本。 评估：显著优于方案一。无脚本依赖，两条隧道配置完全对称。VPC 路由表仍需手动添加 172.31.0.0/16 - VPN GW 条目。 4.3 方案三：CCN 云联网 + 目的路由 核心改进：VPN 网关类型从 IPSEC（绑定单个 VPC）改为 CCN（绑定云联网实例）。VPC 和 VPN 网关都挂到 CCN，路由自动传播，不需要手动在 VPC 路由表里添加条目。 故障切换机制：与方案二完全相同（健康检查 + 路由优先级）。 评估：扩展性最佳。后续新增 VPC 只需挂到 CCN，路由自动传播。代价是 CCN 的额外费用，以及 VPN 网关类型创建后不可更改。 4.4 三种方案核心对比 维度 SPD 策略路由 VPC + 目的路由 CCN + 目的路由 VPN 网关类型 IPSEC（VPC 型） IPSEC（VPC 型） CCN 型 流量匹配位置 每条通道上（SPD） VPN 网关路由表 VPN 网关路由表 Tunnel 2 配置 占位符网段 真实网段 + 优先级 真实网段 + 优先级 故障切换 脚本对调 SPD 平台自动 平台自动 VPC 路由管理 手动添加 手动添加 CCN 自动传播 扩展性 单 VPC 单 VPC 多 VPC / 多地域 额外成本 无 无 CCN 费用 适合场景 临时测试 单 VPC环境 多 VPC 互联 一句话总结：方案一的复杂度在运维脚本，方案二消除了脚本依赖，方案三进一步消除了手动路由管理。三种方案的 AWS 侧配置完全相同，差异全部在腾讯云侧。 五、关键技术决策点 以下六个技术点是跨云 IPSec 搭建中最容易出错的环节。每一个都不难解决，但如果事先不知道，可能需要额外数小时的排查。 5.1 IKE/IPSec 参数严格匹配 AWS 和腾讯云的默认加密参数不同。如果两侧的加密算法、认证算法、DH 组、SA 生命周期有任何一项不一致，隧道会显示”已建立”但流量无法通过。IKE 版本方面，IKEv1 和 IKEv2 均可工作（推荐 IKEv2，IKEv1 已被 IETF 弃用），关键是两侧必须一致。 建议：搭建前先制作参数对照表，逐项填写两侧的值，确认完全一致后再动手。 5.2 Inside CIDR 的 169.254.128.0/17 限制 AWS 要求 VPN 隧道的内部 IP 必须在 169.254.128.0/17 范围内。如果在创建 VPN Connection 时指定了范围外的 CIDR，会导致后续健康检查无法探通。该限制在 AWS 文档中有记载但不够醒目。 5.3 VPN 网关类型锁定 腾讯云的 VPN 网关创建时需选择类型：IPSEC（绑定 VPC）或 CCN（绑定云联网）。创建后不可更改。 如果选择了 IPSEC 类型后需要改为 CCN，只能删除重建，公网 IP 会变化，AWS 侧的 Customer Gateway 也需要同步更新。 建议：如果存在多 VPC 互联的可能性，直接选择 CCN 型。 5.4 腾讯云 API 参数拼写错误 IPSec 配置中的完整性算法参数名为 IntegrityAlgorith（少了最后一个 m）。这不是文档笔误，API 确实要求这个拼写。如果按正确拼写 IntegrityAlgorithm 传入，该字段会被忽略，导致使用默认值，与 AWS 侧不匹配而协商失败。 5.5 静态路由 vs BGP 的选型 腾讯云的 BGP 功能需要提交工单申请，审批周期 1-3 个工作日。对于两个固定 VPC 互通的场景，静态路由 + 目的路由已能满足需求。BGP 的优势体现在多对端、网段频繁变化、需要 ECMP 负载均衡等场景。 此外，两侧的路由模式选择是独立的，AWS 用 Static 而腾讯云用目的路由，完全可行。 5.6 健康检查使用隧道内部 IP NQA 健康检查探测的目标是隧道的 Inside IP（如 169.254.200.1），不是 VPC 内部的业务 IP。创建通道时需正确配置 HealthCheckLocalIp（腾讯云侧，/30位掩码中的第二个 IP 地址）和 HealthCheckRemoteIp（AWS 侧，/30位掩码中的第一个 IP 地址），它们必须对应 Inside CIDR 中的地址。 六、AI 辅助搭建的实际交互 以下展示 AI 工具在搭建过程中的典型交互场景。 6.1 场景一：用 Claude Code 学习 tccli 命令体系 用户： 我在 AWS 上用 aws ec2 create-vpn-gateway 创建 VGW，腾讯云对应的命令是什么？ Claude Code： 腾讯云对应命令是 tccli vpc CreateVpnGateway。注意几个关键差异： - 参数用 PascalCase：--VpnGatewayName 而不是 --tag-specifications - 区域代码不同：na-ashburn（不是 us-east-1） - 需要指定类型：--Type IPSEC（VPC 绑定型）或 --Type CCN（云联网型） 完整命令： tccli vpc CreateVpnGateway --region na-ashburn \ --VpcId vpc-74e8d5oj \ --VpnGatewayName ipsec-to-aws-demo \ --InternetMaxBandwidthOut 200 \ --InstanceChargeType POSTPAID_BY_HOUR \ --Type IPSEC \ --output json 6.2 场景二：Claude Code 生成复杂 JSON 参数 用户： 帮我生成创建 VPN 通道的命令，不用 SPD，走目的路由模式，要开启健康检查，IKE 和 IPSec 参数要和 AWS 侧匹配。 Claude Code： 目的路由模式的关键：不传 SecurityPolicyDatabases 参数。同时开启 EnableHealthCheck，使用 Inside CIDR 中的 IP。 tccli vpc CreateVpnConnection --region na-ashburn \ --VpnGatewayId vpngw-duvztsy6 \ --CustomerGatewayId cgw-w0dfsygg \ --VpnConnectionName ipsec-to-aws-tunnel1 \ --PreShareKey \"uluplyRaPEMsmN.aYVagRdq6PAiLxB_C\" \ --IKEOptionsSpecification '{...14 个字段...}' \ --IPSECOptionsSpecification '{ \"EncryptAlgorithm\": \"AES-CBC-128\", \"IntegrityAlgorith\": \"SHA1\", ← 注意：API 就是这个拼写 ... }' \ --EnableHealthCheck true \ --HealthCheckLocalIp \"169.254.200.2\" \ --HealthCheckRemoteIp \"169.254.200.1\" \ --output json 注意：IntegrityAlgorith 少了最后一个 m，这是 API 的已知拼写问题，必须按此拼写传入。 6.3 场景三：Kiro CLI 配置 AWS 侧 VPN Connection 用户： 在 us-east-1 创建到腾讯云的 VPN Connection，静态路由模式，腾讯云 VPN 网关公网 IP 是 43.166.166.238，两条隧道的 Inside CIDR 和 PSK 我已经规划好了。 Kiro： 好的，我来创建 Customer Gateway 和 VPN Connection。 执行命令: aws ec2 create-customer-gateway \ --type ipsec.1 --bgp-asn 65001 \ --ip-address 43.166.166.238 --region us-east-1 Customer Gateway 已创建: cgw-0ce0b5bd55dfd47e5 执行命令: aws ec2 create-vpn-connection \ --type ipsec.1 \ --customer-gateway-id cgw-0ce0b5bd55dfd47e5 \ --vpn-gateway-id vgw-0ba7d31bccaba979c \ --options '{\"StaticRoutesOnly\": true, \"TunnelOptions\": [...]}' VPN Connection 已创建: vpn-0bbb0ef3bc912cbf9 Tunnel 1 公网 IP: 52.23.132.149 Tunnel 2 公网 IP: 54.88.240.175 下一步：需要把这两个 IP 告诉腾讯云侧，用于创建对端网关。 6.4 场景四：Claude Code 解析 tccli JSON 输出 用户： tccli 的输出是纯 JSON，不像 aws cli 有 --query，帮我写个快速查看隧道状态的命令。 Claude Code： tccli 确实没有 JMESPath 支持，用 python3 one-liner 解析： tccli vpc DescribeVpnConnections --region na-ashburn \ --VpnConnectionIds '[\"vpnx-ls3pkmdn\",\"vpnx-zhvk9zd5\"]' \ --output json | python3 -c \" import sys, json for c in json.load(sys.stdin)['VpnConnectionSet']: print(f\\\"{c['VpnConnectionName']}: {c['NetStatus']}\\\") \" 期望输出： ipsec-to-aws-tunnel1: AVAILABLE ipsec-to-aws-tunnel2: AVAILABLE 以上对话经过简化和整理。实际交互中，AI 工具偶尔会生成过时的参数名或遗漏可选配置，工程师需要对照文档进行校验。 七、搭建效率量化对比 7.1 搭建复杂度对比 维度 方案一（SPD） 方案二（目的路由） 方案三（CCN） 腾讯云资源数 5 个 7 个（含 VPN 网关路由） 9 个（含 CCN 实例） AWS 资源数 4 个 4 个 4 个 额外脚本 failover.sh 无 无 最大难点 SPD 占位符设计 VPN 网关路由表配置 CCN 实例关联 7.2 传统方式 vs AI 辅助效率对比 维度 传统方式 AI 辅助（Claude Code + Kiro CLI） 学习 tccli 命令体系 1-2 天（阅读文档 + 试错） 2-3 小时（交互式学习） 单个方案搭建时间 3-5 小时 1-2 小时 三种方案迭代总时间 3-5 天 1 天 参数匹配排查 1-2 小时（逐项翻文档） 15 分钟（AI 生成对照表） 发现 IntegrityAlgorith 拼写问题 数小时（试错排查） 即时（AI 已知该拼写） tccli JSON 输出处理 自行编写脚本 AI 生成 python3 one-liner 核心效率提升来自三个方面： 跨平台知识翻译：将 AWS 概念直接映射到腾讯云对应的 API，省去了从零学习的过程 复杂参数生成：IKEOptionsSpecification 等嵌套 JSON 结构由 AI 生成，减少手写出错 即时问题定位：API 拼写错误、参数默认值差异等隐蔽问题，AI 能直接识别 同时需要指出 AI 工具的局限性： 两侧参数对齐仍需工程师手动完成 偶尔生成过时的 API 参数，需要对照最新文档校验 架构选型决策（SPD vs 目的路由 vs CCN）最终由工程师做出 八、总结与方案选择建议 8.1 方案选择 如果你… 推荐方案 只需临时测试跨云连通性 方案一（SPD），最快上手 两个固定 VPC 生产互通，需要自动故障切换 方案二（VPC + 目的路由） 预见多 VPC / 多地域扩展需求 方案三（CCN + 目的路由） 对端超过 3 个，或网段频繁变化 在方案三基础上升级 BGP 8.2 AI 工具的价值 无论选择哪种方案，Claude Code + Kiro CLI 的分工模式都显著降低了跨云搭建门槛： Claude Code 的核心价值：将 AWS 工程师的已有知识”翻译”到腾讯云体系，生成复杂 tccli 命令，识别 API 层面的隐蔽问题 Kiro CLI 的核心价值：加速 AWS 侧多资源编排，减少 CLI 语法查阅时间 分工协作的价值：各管一侧避免上下文混淆，工程师专注于架构决策和参数对齐 对于多云运维工程师来说，AI 工具不是替代专业知识，而是放大生产力，把时间投入在架构决策上，而不是记忆两套 CLI 语法。 8.3 最终成果 双向 ping 通，延迟约3ms，Tunnel 1 故障后自动切换到 Tunnel 2。 九、资源链接 Claude Code 官方文档 Kiro CLI 官方文档 腾讯云 VPN 连接文档 腾讯云 VPN 网关路由表 腾讯云云联网（CCN）文档 AWS Site-to-Site VPN 文档 AWS VPN 隧道选项 ➡️ 下一步行动： 相关产品： Amazon VPC — 隔离云网络 Amazon Connect — AI 客户体验解决方案 相关文章： 让 Kiro 和 Claude Code 响应 IM 消息：用 ACP Bridge 打造异步 AI 编程工作流 从代码到分子系列：一场由 AI 驱动的 EGFR 抑制剂发现之旅 — 深度融合 AWS Bedrock与 Claude Code/Claude Agent Skills，生命健康行业的科学活动探微 Claude Code 接入自建开源模型：企业私有化与降本实践 用 Kiro Skill 打造你的专属 AI 工作流：以会议纪要自动生成为例 使用 Kiro CLI 和 Agent Client Protocol 构建飞书 AI 聊天机器人 *前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。 本篇作者 薛东 亚马逊云科技资深解决方案架构师，负责基于亚马逊云科技的解决方案设计和构建。加入亚马逊云科技之前曾就职于 EMC，阿里云等头部 IT 企业，积累了丰富的企业级应用开发，测试和架构经验。目前服务亚马逊云科技中国媒体和广告行业客户。专注于无服务，安全，生成式 AI 等技术方向。 刘一白 亚马逊云科技解决方案架构师，负责亚马逊云科技网络相关的服务和产品。在企业网、数据中心和云网络有着丰富的实践经验，拥有 AWS Certified Advanced Networking Specialty 和 Cisco Certified Internetwork Expert 等网络技术相关认证。 AWS 架构师中心：云端创新的引领者 探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用

## 深度分析
### 1. AI 工具分工模式的工程价值
本文展示了"各管一侧"的 AI 协作分工模式在跨云网络搭建中的实际价值。Claude Code 负责腾讯云侧的 tccli 命令体系学习、VPN 网关和通道创建命令生成、JSON 输出解析脚本编写；Kiro CLI 负责 AWS 侧的 VGW 创建、Customer Gateway 配置、VPN Connection 隧道参数生成、路由传播设置和安全组配置。
这种分工的核心优势在于：每个工具只维护自己那一侧的上下文，避免了跨平台概念混淆。工程师专注于架构决策和参数对齐，而非记忆两套 CLI 语法细节。

### 2. 三种架构方案的演进逻辑
搭建过程中迭代了三种方案，每次迭代都源于前一个方案的实际痛点，而非预先规划：

- **方案一（SPD 策略路由）**：在每条 VPN 通道上配置 SPD 规则。缺点是需要运维脚本实现故障切换，Tunnel 2 必须用占位符网段 
- **方案二（VPC + 目的路由）**：不传 SecurityPolicyDatabases 参数，流量匹配移到 VPN 网关路由表。DPD + NQA 健康检查实现平台自动故障切换，无需脚本 
- **方案三（CCN + 目的路由）**：VPN 网关类型改为 CCN，路由自动传播。扩展性最佳，但 CCN 有额外费用 
方案演进揭示了一个重要原则：**架构不是设计出来的，而是从实际痛点中迭代出来的**。AI 工具使得"发现问题 - 调研替代 - 重新实现"的循环足够快，一天内完成三轮迭代。

### 3. 六大关键技术决策点
跨云 IPSec VPN 搭建中最容易出错的六个环节：
1. **IKE/IPSec 参数严格匹配**：AWS 和腾讯云默认参数不同，任何一项不一致都会导致隧道显示"已建立"但流量不通
2. **Inside CIDR 必须在 169.254.128.0/17 范围内**：AWS 的限制，不醒目但会导致健康检查失败
3. **VPN 网关类型创建后不可更改**：IPSEC 改为 CCN 需要删除重建，公网 IP 变化，AWS 侧 Customer Gateway 也需更新
4. **腾讯云 API 参数拼写错误**：IntegrityAlgorith（少了一个 m）是 API 真实要求，正确拼写会被忽略导致协商失败
5. **静态路由 vs BGP 的选型**：腾讯云 BGP 需要工单申请 1-3 个工作日，固定双 VPC 互通场景静态路由已足够
6. **健康检查必须使用隧道内部 IP**：探测目标是 Inside IP（如 169.254.200.1），不是 VPC 业务 IP

### 4. 效率提升的量化分析
AI 辅助相比传统方式的效率提升显著：
| 维度 | 传统方式 | AI 辅助 |
|------|----------|---------|
| 学习 tccli 命令体系 | 1-2 天 | 2-3 小时 |
| 单个方案搭建 | 3-5 小时 | 1-2 小时 |
| 三种方案迭代总时间 | 3-5 天 | 1 天 |
| 参数匹配排查 | 1-2 小时 | 15 分钟 |
核心效率提升来自三个方面：跨平台知识翻译（AWS 概念直接映射到腾讯云 API）、复杂参数生成（减少手写出错）、即时问题定位（API 拼写错误、参数默认值差异等隐蔽问题）。

### 5. AI 工具的局限性边界
AI 工具在本文场景中展现了显著价值，但也存在明确的局限性边界：两侧参数对齐仍需工程师手动完成（AI 不知道另一侧配了什么）；偶尔生成过时的 API 参数需要对照最新文档校验；架构选型决策（SPD vs 目的路由 vs CCN）最终由工程师做出。AI 工具是专业知识的放大器，而非替代品。

## 实践启示
### 1. 跨云 VPN 搭建前必做：制作参数对照表
在动手配置前，先制作 IKE/IPSec 参数对照表，逐项填写两侧的值（加密算法、认证算法、DH 组、SA 生命周期等），确认完全一致后再动手。这是避免隧道协商失败的第一道防线。

### 2. 优先选择方案二（目的路由）作为生产环境起点
对于两个固定 VPC 生产互通的场景，方案二（VPC + 目的路由）是最佳起点：无需 BGP 工单申请、无需运维脚本、两条隧道配置完全对称、故障切换由平台自动完成。只有在需要多 VPC / 多地域扩展时，才考虑升级到方案三（CCN）。

### 3. 多 VPC 场景直接选择 CCN 型 VPN 网关
腾讯云 VPN 网关创建后类型不可更改。如果存在多 VPC 互联的可能性，直接选择 CCN 类型。虽然 CCN 有额外费用，但避免了后续重建的成本（公网 IP 变化、AWS 侧 Customer Gateway 同步更新）。

### 4. 用 AI 工具加速 tccli 命令学习，但校验 API 拼写
Claude Code 能将 AWS 工程师的已有知识"翻译"到腾讯云体系，生成复杂的 tccli 命令。但对于关键参数（如 IntegrityAlgorith 的拼写问题），需要对照文档进行校验。AI 生成 python3 one-liner 解析 JSON 输出的模式也值得借鉴。

### 5. AI 辅助运维的分工原则：各管一侧
使用多个 AI 工具协作时，采用"各管一侧"的分工模式。每个工具只维护自己平台的上下文，避免跨平台概念混淆。工程师专注于架构决策、参数对齐和最终验证，而非试图让一个 AI 工具同时理解两个完全不同的云平台 API 体系。

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/ai-network-claude-code-kiro-cli-implement-aws-ipsec-vpn/)

## 相关实体
- [让 Kiro 和 Claude Code 响应 IM 消息：用 ACP Bridge 打造异步 AI 编程工作流 | 亚马逊AWS官方博客](ch04/150-ai.md)
- [使用 Kiro CLI 和 Agent Client Protocol 构建飞书 AI 聊天机器人 | 亚马逊AWS官方博客](ch04/150-ai.md)
- [用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台 | 亚马逊AWS官方博客](ch04/150-ai.md)
- [让 AI 理解你的组件库：新一代智能 D2C架构 — 基于 AWS Kiro MCP Skills 的智能转换实践 | 亚马逊AWS官方博客](ch04/245-skill.md)
- [开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南](ch04/150-ai.md)
- [打造可靠的 AI 编程环境：Claude Code Hooks 完整开发者指南](ch04/150-ai.md)

---

