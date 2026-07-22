---
title: AWS DevOps Agent × MCP Server：打通混合云网络排障的最后一公里
sha256: 54b1fdf476defc6284a9473a50b4ca87b503ad85ddbf5fea50f7a5dc5380e0ee
type: raw-article
tags: [aws,devops,mcp,hybrid-cloud,network]
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/aws-devops-agent-mcp-server-closing-the-last-mile/
url: https://aws.amazon.com/cn/blogs/china/aws-devops-agent-mcp-server-closing-the-last-mile/
review_value: 8
review_confidence: 8
review_recommendation: worth-reading
review_stars: 4
ingested: 2026-05-16
---
# AWS DevOps Agent × MCP Server：打通混合云网络排障的最后一公里
摘要：混合云 BGP 故障的另一半证据往往在 on-premises 设备上。本文在真实 Direct Connect 环境上，通过 MCP Server 把 Cisco 路由器的只读命令暴露给 AWS DevOps Agent，用 Private Connection 把调用流量留在 AWS 骨干网，再用 EventBridge Scheduler + Lambda 把调查结论自动回推飞书群——完成”告警 → 自主调查 → 结论回到 Chat”的混合云 ChatOps 闭环。
**目录**
01 一、引言
02 二、方案架构
03 三、为什么采用 MCP + Private Connection
04 四、MCP Server：把 IDC 设备的只读能力打包给 Agent
05 五、让 DevOps Agent 真正“看见”这些 tool：Agent Space 集成
06 六、测试场景一：BGP Prefix High
07 七、测试场景二：BGP Prefix Asymmetry
08 八、调查结论发到飞书：让值班工程师”不用跳出聊天窗口”
09 九、结语
* * *
## **一、引言**
在混合云环境下，一次 BGP 路由异常的根因往往散落在一条很长的链路上：[Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/>) 指标、[AWS CloudTrail](<https://aws.amazon.com/cn/cloudtrail/>) 审计、VPC 路由表、Transit Gateway 关联与传播、Direct Connect Gateway 关联的 VIF 状态、on-premises 路由器上的 BGP 邻居与 route-map，最后才汇聚为运维 IM 里面的一条告警对话。在本系列[第 1 篇](<../Blog-1/AWS_DevOps_Agent_in_Practice_Autonomous_Investigation_and_Remediation_for_Cloud_Networks.html>)中，我们验证了 [AWS DevOps Agent](<https://aws.amazon.com/cn/devops-agent/>) 可以自主走完 AWS 这一段链路——自动关联 CloudWatch、CloudTrail、VPC、TGW、DX 与 VIF 的数据、给出根因与 5 阶段修复方案。但六个测试场景跑完之后，我们发现 DevOps Agent 无法解决以下两类问题。
第一类问题是调查数据的另一半在客户侧设备上。在 Direct Connect 的 T1 BGP Prefix High 场景里，AWS 侧 CloudWatch 只能告诉 Agent“这个 Transit VIF 上 accepted prefix 从 1 涨到了 92”，但告诉不了“这 92 条前缀是什么、是哪一条 route-map 注入的”。Agent 最后只能输出“建议联系对端工程师”这样的泛化结论，跨云根因链条停在了 AWS 的边界上。
第二类问题是调查结论留在了 Agent Space 里。我们已经把 [Amazon SNS](<https://aws.amazon.com/cn/sns/>) 告警接到了飞书群，但是 Agent 产出的 Investigation timeline、Root cause、Mitigation plan 仍然只在 AWS Management Console 上可见。告警进得来，结论出不去——值班工程师必须跳出 IM、登录 AWS Console、打开 Agent Space 才能拿到修复建议，ChatOps 闭环并不完整。
本文将解决上述两类问题。我们用一台 EC2 承载 MCP Server，把 IDC 侧网络设备的 show ip bgp summary、show route-map、show archive log config 等只读命令封装成 [Model Context Protocol](<https://modelcontextprotocol.io/>)（MCP）工具；用 [AWS DevOps Agent Private Connection](<https://aws.amazon.com/blogs/devops/securely-connect-aws-devops-agent-to-private-services-in-your-vpcs/>) 把 Agent 到 MCP Server 的流量全程留在私网；再用 [Amazon EventBridge](<https://aws.amazon.com/cn/eventbridge/>) Scheduler + [AWS Lambda](<https://aws.amazon.com/cn/lambda/>) 把 Agent 新产出的 mitigation plan 发送到飞书运维群。我们将在真实的 Direct Connect 环境上完成两个 BGP 场景（Prefix High / Prefix Asymmetry）的端到端演示，证明这条链路可以把 Agent 的自主调查能力从“AWS 侧”扩展到“混合云全链路”，并且全过程保持 Agent 只读、凭证不出私网、修复动作由工程师审核。
## **二、方案架构**
整套方案在第 1 篇的 Lab 基础上增加了两条通路：一条是 Agent 通过 MCP 协议读取 IDC 侧网络设备的信息；另一条是 Agent 生成的 mitigation plan 被 Lambda 发送到飞书群。两条通路共同复用第 1 篇的 Agent Space、飞书 bot、以及所有 20 条 CloudWatch 告警。
### 2.1 Lab 拓扑架构
本篇的 Lab 架构不变：VPC4（10.4.0.0/16）通过 AWS Transit Gateway（IAD TGW，ASN 65411）接入 Direct Connect Gateway（DXGW，ASN 65001）；DXGW 关联两条 Transit VIF，分别落在 DX Location-1（eu-west-1）和 DX Location-2（eu-west-2）；IDC 侧 ASN 65000，由两台 on-premises 路由器 RT1 / RT2 组成。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-1.png>) [图 1：Lab 拓扑架构（沿用第 1 篇）]  
---  
本篇不改动任何物理链路——所有新增能力都叠加在这张拓扑之上。
### 2.2 本篇新增的两条通路
下图把 Lab 架构拓扑进行简化，只说明本篇新增的两条数据通路：
  1. 调查通路：AWS DevOps Agent 经 Private Connection 调用 MCP Server，MCP Server 再经 Direct Connect 回程以 SSH 读取 IDC 路由器；
  2. 回流通路：EventBridge Scheduler 触发 Feishu Poller Lambda，把 DevOps Agent 生成的 mitigation plan 发送到飞书群；
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-2-new.png>) [图 2：本篇新增的两条通路]  
---  
左上 Agent Space → 中间 VPC 内的 MCP Server → 右侧 IDC Cisco C8200（调查取证）；下方 ChatOps 回流（Scheduler → Lambda → DynamoDB 去重 → 飞书群）。Lab 架构（DXGW / 两条 Transit VIF / RT1 RT2 等）在此图中被抽象为单一 “IDC” 容器，具体形态见图 1。
几个关键设计取舍：
  * MCP Server 运行在 AWS 侧的 EC2 上、而不是 IDC 内：这样凭证托管在 [AWS Secrets Manager](<https://aws.amazon.com/cn/secrets-manager/>)，AWS DevOps Agent 不需要离开 AWS 网络就能调用，也避免了 IDC 管理网开放公网入口。
  * Agent → MCP Server 用 Private Connection，MCP Server → 网络设备 走 Direct Connect 回程：整条调用链路不经过公网，IDC 设备的管理 IP 也无需对公网暴露。
  * Agent 只读：MCP Server 只暴露 show / dir 命令，不存在任何 configure terminal。所有修复命令由工程师基于 Agent 的 mitigation plan 手动执行。
  * Mitigation plan 回流采用 Lambda 轮询而非事件订阅：截至本文写作（2026-05），AWS DevOps Agent 尚未向 EventBridge 发布 mitigation 完成事件，我们采用 ListRecommendations 等只读 API + DynamoDB 去重实现回推。
## **三、为什么采用 MCP + Private Connection**
### 3.1 MCP 解决“Agent 认不认识这个 MCP tool”的问题
AWS DevOps Agent 默认内置的 skill 覆盖 AWS 服务（CloudWatch、CloudTrail、VPC、Direct Connect、Transit Gateway 等）。但它并不认识 on-premises 网络设备的 CLI 语法，也没法直接 SSH 到 IDC 里的交换机 / 路由器 / 防火墙执行命令。MCP 协议恰好解决了“扩展工具集”这个问题——任何外部工具只要注册成 MCP tool 并给出清晰的 docstring，Agent 就能像选择内置 skill 一样，在合适的时机主动调用它。
这一点和第 1 篇里 Agent 自主调用 cloudwatch:GetMetricStatistics 或 ec2:DescribeRouteTables 没有本质差别：对 Agent 而言，新增的 cisco_show_bgp_summary 就是一个新的 tool，只是底层由我们自己封装的 Netmiko SSH 来实现。
### 3.2 Private Connection 解决“Agent 怎么安全到达 MCP Server”的问题
MCP Server 运行在 VPC EC2 上，默认情况下 DevOps Agent Space 无法访问—— AWS DevOps Agent Private Connection 就是为了解决这个问题。Private Connection 基于 [Amazon VPC](<https://aws.amazon.com/cn/vpc/>) Lattice，由 DevOps Agent 在自己的账户里托管一个 service-managed resource gateway，并在用户指定的 VPC 子网中创建 ENI 接收流量。整条链路的关键特点：
  * 流量全程留在 AWS 骨干网：MCP Server 不需要公网 IP、不需要 Internet Gateway、也不需要 NAT Gateway。
  * resource gateway 在用户账户里是只读的：service-linked role 的权限被 AWSAIDevOpsManaged 标签限定，除 AWS DevOps Agent 外没有任何 principal 能通过它路由流量。所有 VPC Lattice API 调用都进入 AWS CloudTrail 可审计。
  * 入向访问控制完全由客户掌握：用户提供的 Security Group 决定谁能从 ENI 到达 MCP Server，默认拒绝其他一切访问。
一句话价值：MCP 把 on-premises 网络设备的 CLI 变成 DevOps Agent 可调用的工具；Private Connection 把 Agent 到这些工具的访问路径变成“不出 AWS 骨干网”的私网链路。两者配合之后，同一个 Agent、同一次 investigation，能同时处理 AWS 侧 metric 和 IDC 设备侧 running-config 及配置变更 log 这几类证据。
## **四、MCP Server：把 IDC 设备的只读能力打包给 Agent**
MCP Server 是这套方案里“Agent 和设备之间的翻译层”。它对外是 Agent 看得懂的 MCP tool；对内是 IDC 网络设备看得懂的 show 命令。我们只给它三项职责：拉凭证、执行只读命令、返回脱敏后的结构化结果，不多做一分，不少做一分。
**工具集按 Agent 实际需要的证据类型划分，一共 10 个只读 tool，覆盖三类场景**
  * BGP 及链路状态：cisco_show_bgp_summary、cisco_show_bgp_neighbor、cisco_show_interface——回答“邻居是否 Established、接口是否 up”。
  * 路由策略：cisco_show_bgp_advertised、cisco_show_bgp_received、cisco_show_route_map、cisco_show_running_bgp——回答“这条 prefix 是谁放进来的、走的哪条 route-map”。
  * 变更历史：cisco_show_archive_log_config、cisco_show_archive_diff、cisco_show_archive_list——回答“谁在什么时候改了什么”。
这套划分直接决定了 Agent 在复杂场景里是否能够做出深入的根因推理：后文 T1/T2 两个场景中，Agent 把“看状态 → 看策略 → 看变更历史”三类 tool 并行组合使用，最终把根因定位到了 labuser58 具体改了哪一行配置。
Tool 名字与 docstring 是 Agent 决策的唯一依据，没有传统的 prompt engineering、也不需要 RAG 知识库。我们只是刻意把 tool 名写得足够具体、docstring 写得足够场景化：
    @mcp.tool()
    def cisco_show_bgp_advertised(peer_ip: str) -> dict:
        """Return prefixes this router is advertising TO the neighbor (what we send to AWS).
        Each row includes prefix, next-hop and AS-path. Use to isolate "who injected
        these prefixes" on the IDC side, especially in the T1 BGP-Prefix-High scenario.
        """
        ...
实测效果：Agent 在 T1 场景里没有任何失败重试或误调用，一次性选对了 8 个 tool（见第场景一 Timeline 截图）。这印证了 MCP 的核心假设——工具设计得够规整，Agent 自然就懂怎么用。
**安全边界做在 MCP Server 自己身上，而不是依赖 Agent 自律**
  * 入参走白名单正则——peer IP、接口名、route-map 名都在 validators.py 里严格限定字符集，拒绝任何可能拼出 CLI 的字符串；
  * 命令前缀白名单——run_show 底层只接受 show / dir 开头的命令，连理论上的 configure terminal 注入都接不进来；
  * 输出在返回前脱敏——neighbor password / key-string / snmp-server community 等凭证字段在 MCP Server 侧被 mask，Agent context 里从不出现真值；
  * EC2 IAM 只给一个 Secret 的 GetSecretValue——即使 EC2 被彻底攻陷，爆炸半径也只是这一对只读 SSH 凭证。
这四层防护叠加之后，把 Agent 当成任意一个外部客户端来防，哪怕 Agent 本身被 prompt injection 污染，能造成的最坏后果也只是多读几行 running-config——不会越过只读边界。
## **五、让 DevOps Agent 真正“看见”这些 tool：Agent Space 集成**
DevOps Agent Space 对外部 MCP Server 的集成遵循 Service → Association → Skill 三级模型，这种三级设计把“端点存在”、“被特定 Agent Space 引用”、“出现在 Agent 的可用工具列表”三件事进行解耦，让同一个 MCP Service 可以被多个 Agent Space 复用，也让管理员可以随时开关某个 Agent Space 的工具可见性，不需要改动 MCP Server 本身。
**三级链路各司其职**
  * Service：在账户里登记“这里有一个 MCP endpoint”，附带 Private Connection 引用、认证配置（API key 绑定 Secrets Manager）、transport 类型（HTTP streamable）。Service 本身是一个共享服务。
  * Association：把 Service Add 到具体的 Agent Space 上。一个 Service 可以同时挂多个 Agent Space——比如 NetOps 团队和 SecOps 团队的 Agent Space 都能访问同一个 MCP Server，不需要各自部署。
  * Skill：在 Agent Space 的工具清单里决定“哪些 tool 对 Agent 可见”。可以细粒度到每个 cisco_show_* 单独勾选——例如 SecOps Agent Space 只开 archive_log_config（审计）相关的 tool，NetOps Agent Space 才开全部 10 个。
这个模型对我们客户最有价值的一点：以后给这套方案增加新的网络设备厂商（Juniper、Palo Alto、华为），只需要在原 MCP Server 里加几个新 tool、然后在 Agent Space 里把 Skill 清单重新勾选一下，不用调整 Private Connection、不用改 IAM、不用通知 Agent。方案的可扩展性直接来自 Agent Space 自己的分层设计，我们没有额外做任何架构工程。
集成完成后，从 Agent Space chat 发一句测试：“Show me the BGP summary on 192.168.58.254”。Agent 会在几秒内选中 cisco_show_bgp_summary、通过 Private Connection 调到 MCP Server、拿回 parsed 的 neighbor 表，整条 Agent → Private Connection → MCP Server → Secrets Manager → On-premises routers 链路全程可审计、全程不出 AWS 骨干网。
## **六、测试场景一：BGP Prefix High**
### 6.1 故障注入
在 on-premises router RT1 上，用户 labuser58 把 eu-west-1 Transit VIF 的 peer 169.254.96.17 出向 route-map 从 OUT-TO-NEIGHBOR-1（只含 default-originate 0.0.0.0/0）切成 OUT-TO-NEIGHBOR-17（sequence 20 无条件 permit），把 IDC 侧所有 /24 明细路由全部发给 AWS。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-3.png>) [图 3：VirtualInterfaceBgpPrefixesAccepted 在 2026-05-11 16:50 LOCAL 从 1 跳到 92]  
---  
VirtualInterfaceBgpPrefixesAccepted 在 2026-05-11 16:50 LOCAL 从 1 跳到 92，触发 DX-BGP-Prefix-High-dxvif-fgj2xj6i-ipv4（阈值 ≥ 80）。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-4.png>) [图 4：Feishu notifier Lambda 把 SNS 告警渲染为飞书 interactive card 推到运维群]  
---  
Feishu notifier Lambda 把 SNS 告警渲染为飞书 interactive card 推到运维群，底部按钮 Open DevOps Agent Investigation 直链到 Agent Space。
### 6.2 Agent 自主调查
告警触发后，Agent 在 20 秒内识别症状，随后并行触发 8 次 MCP 调用，覆盖 BGP summary、advertised prefixes、两个 route-map、running-config、archive log 和 archive diff 六类数据。调查总耗时约 1 分 58 秒。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-5.png>) [图 5：Agent Investigation Timeline]  
---  
浅灰卡片是 Agent 拉回的 Finding，深色卡片是最终 Root cause。8 次 MCP 调用并行下发、各自 < 400 ms，Agent 在本地做相关性推理。
Agent 会“选 tool”而不是“试 tool”——8 次调用没有任何失败重试或无效入参，这得益于 tool docstring 把“何时该调用自身”写得足够清楚。
### 6.3 根因与修复建议
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-6.png>) [图6：Root cause 明确到“用户 + 变更对象 + 变更前后值”三维度]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-7.png>) [图7：Mitigation plan 的结构化概览]  
---  
按「回滚 → 校验 → 复核」分步列出动作、责任人与预期结果，工程师可以直接据此评审是否执行。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-8.png>) [图8：展开后的 Cisco CLI 片段]  
---  
Agent 把图 9 的”回滚”步骤落到具体命令，工程师可直接复制到 vty 执行。
修复命令由工程师在 Cisco vty 上手动执行，Agent 不做任何变更。
## **七、测试场景二：BGP Prefix Asymmetry**
### 7.1 故障注入
修改 eu-west-1 一侧的出向 route-map，保持 eu-west-2 侧用原来的 OUT-TO-NEIGHBOR-1 不变。两条 VIF 的 BGP session 都是 Established，但 PrefixesAccepted 严重不对称（92 对 1），自定义指标 VirtualInterfaceBgpPrefixAsymmetryRatio 从正常 1.0 跳到 85.93，触发告警 DX-BGP-Prefix-Asymmetry-poc-dxgw-ipv4。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-9.png>) [图9：同一 DXGW 下的两条 Transit VIF]  
---  
dxvif-fgj2xj6i（eu-west-1）接受 92 条 prefix，dxvif-fh0hjmf0（eu-west-2）仍维持 1 条。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-10.png>) [图10：飞书群里的 Prefix Asymmetry 告警卡片]  
---  
Description 已经给出“likely route-map / prefix-list asymmetry”的初步提示。
### 7.2 Agent 自主调查
开始调查后，DevOps Agent 首先建立了 VIF  Cisco peer 的双向映射——把 AWS 侧的 VIF ID 和 Cisco 侧的 BGP peer IP 匹配起来，然后才开始路由策略的比对。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-11.png>) [图11：Agent 在开始诊断前]  
---  
先通过 cisco_show_bgp_summary + cisco_show_bgp_neighbor 建立 dxvif-fgj2xj6i  169.254.96.17  OUT-TO-NEIGHBOR-17 与 dxvif-fh0hjmf0  169.254.96.1  OUT-TO-NEIGHBOR-1 两条映射，然后并行拉 route-map / running-config / archive log，在 +3m58s 给出 Root cause。
### 7.3 根因与修复建议
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-12.png>) [图12：Root cause 指向“两个 neighbor 的出向 route-map 不对称”]  
---  
Root cause 指向“两个 neighbor 的出向 route-map 不对称”，archive log idx 286+314 定位到 labuser58 对 169.254.96.17 做过 5 次变更，与告警窗口精确重合。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-13.png>) [图13：Mitigation plan 的结构化概览]  
---  
按「对齐 → 校验 → 复核」分步列出动作与预期结果，工程师可以据此评审两侧策略是否需要强制对齐。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-14.png>) [图14：展开后的 Cisco CLI 片段]  
---  
Agent 把图 15 的”对齐”步骤落到具体命令，把 169.254.96.17 的 out route-map 从 OUT-TO-NEIGHBOR-17 回滚到 OUT-TO-NEIGHBOR-1，与 169.254.96.1 一致。
### 7.4 两个测试场景对照
维度 | 只有 AWS 侧（第 1 篇） | \+ MCP Server（本篇）  
---|---|---  
T1 Prefix High 根因 | accepted prefix 超阈值，建议联系对端 | labuser58 切换了 peer 169.254.96.17 的 out route-map，其 sequence 20 无条件 permit  
T2 Asymmetry 根因 | 两 VIF ratio 异常，建议两侧 diff 配置 | 两 peer 出向 route-map 不一致，archive log 定位到 labuser58 的 5 次变更  
Mitigation 精度 | 泛化话术 | 精确到 peer IP + route-map 名 + 回滚命令  
Agent 调查耗时 | ~ 8 min | ~ 2 min  
推理性质 | 相关性 | 因果性（who / when / what）  
## **八、调查结论发到飞书：让值班工程师”不用跳出聊天窗口”**
值班工程师收到告警后，在飞书里面进行查看、截图、点赞、讨论都很方便，但”Agent 查完了没？查到什么了？”——这些信息的获取还需要打开浏览器、登录 AWS Console、进 Agent Space、点开对应的 Investigation。需要多次点击与跳转：原本正在飞书群里和同事对齐修复窗口，突然要切到另一个窗口读调查报告，再转发回群里。消息闭环缺失了一个小节点，却把 ChatOps 体验打了对折。
我们在本篇里要增强的，就是这最后一段路：让 DevOps Agent 完成调查之后，主动把调查结论推回飞书群，而不是等工程师到 AWS Console 点击获取。
### 8.1 为什么是 Poll，而不是 Push？
技术直觉上，任何异步任务的结论回推都应该走 事件驱动——Agent 完成调查、发一个 event 到 EventBridge、Lambda 订阅并转发。但截至目前（2026-05） AWS DevOps Agent Service 上没有这个原生 event source。我们有两个选择：要么自己建 webhook 等 Agent 主动回调，要么每隔几分钟去问一下”你有没有新的结论”。
测试后，我们选了后者——用 EventBridge Scheduler 每 2 分钟触发一次 Lambda，轮询 DevOps Agent 的只读 API：
  * Agent 的调查时长本来就在分钟级（T1 约 2 分、T2 约 4 分），2 分钟的延迟对”事后得到修复建议”这件事来说几乎无感；
  * 轮询的代码总量不到 300 行，比起跟上游交涉新建一条 event 通道、或者自己暴露 webhook 给 Agent 打回来，维护成本低一个量级；
  * 一旦未来 Agent 发布原生事件源，只要把 Lambda 的”入口”从 Scheduler 改成 EventBridge rule 就能迁移，中间那段组卡、去重、推飞书的逻辑完全不用动。
### 8.2 告警去重
一条 CloudWatch 告警触发后，Agent 经常会跑多轮 investigation（版本号 v1 of 2、v2 of 2），每一轮都会产生一份 recommendation。如果不去重，飞书群会在几分钟里收到同一个告警的 3 张卡片，每张卡片的内容还略有差异——消息风暴直接把 ChatOps 变成 ChatSpam，值班同事学会的第一件事就是屏蔽这个 bot。
解决方案是以”告警名”作为去重键，第一次到达就写入 DynamoDB，后面来的一律忽略。
### 8.3 飞书卡片的设计：三秒钟决策，而不是三页报告
Agent 产出的 mitigation plan 本身是一份结构完整的 Markdown——包含 Action、Reasoning、Pre-validation、Execution Plan、Rollback 五大段。内容较多，在飞书聊天窗口内易读性不好，我们只选取下面三段与决策有关的关键信息发送到飞书群。
  * Action——一句话说明”要改什么”；
  * Reasoning——三到四行说明”为什么要改”，工程师再判断 Agent 推理是否合理；
  * Execution plan——只预览第一步的 headline，点按钮跳回 Agent Space 看详细命令。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-15.png>) [图15：T1 Prefix High 场景推到飞书群的 mitigation 卡]  
---  
Action / Reasoning / Execution plan 三段式排版——工程师扫一眼就知道”哪个 route-map 被改了、要不要回滚”，需要细节再点底部按钮跳回 Agent Space。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/aws-devops-agent-mcp-server-closing-the-last-mile-16.png>) [图16：T2 Asymmetry 场景的飞书卡]  
---  
与 T1 的差别只在 Reasoning 的叙述——告警场景换了，但卡片模板不变。同一个 bot、同一套布局，值班同事看第二次就形成肌肉记忆。
备注：告警与结论沿用第 1 篇同一个 devops-notifier bot 推送，两张卡片在发送人与时间线上自然连续，工程师可以很容易识别二者为”同一事件的两个阶段”，这也说明了 ChatOps 体验的核心在于时间线的叙事连贯性。
## **九、结语**
我们把 AWS DevOps Agent 从“只看 AWS 侧”升级到了“端到端看混合云全链路”：MCP 把 IDC 侧网络设备的 show 命令变成 Agent 可调用的工具，Private Connection 把 Agent 到这些工具的路径变成不出 AWS 骨干网的私网链路；然后 Feishu Poller 把 Agent 产出的结论发送到 IM——告警进来、调查发生、结论回到 Chat。在两个真实 BGP 场景里，Agent 把 MTTR 从 AWS 侧的约 8 分钟压到约 2 分钟，并且 Root cause 从“相关性”升级到“因果性”（who / when / what）。
方法是可横向迁移的：Netmiko 侧换 device_type 就能支持 Juniper / Palo Alto / F5 / Huawei 等设备；FastMCP 侧把 @mcp.tool() 映射到任何外部 API 就能接 Grafana / ServiceNow / GitHub Enterprise；ChatOps 侧把 Feishu 换成 Slack / Teams / Lark 只需调整 webhook。贯穿所有这些形态的共同原则是不变的——Agent 只读、凭证不出 MCP Server 私网、修复由工程师审核。
**下一步行动：**
**相关产品：**
  * [Amazon DevOps Agent](<https://aws.amazon.com/cn/devops-agent/?p=bl_pr_devops-agent_l=1>) — 解决和预防事故的代理
  * [Amazon Connect](<https://aws.amazon.com/cn/connect/?p=bl_pr_connect_l=2>) — AI 客户体验解决方案
  * [AWS Lambda](<https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=3>) — 无需服务器即可运行代码
  * [Amazon VPC](<https://aws.amazon.com/cn/vpc/?p=bl_pr_vpc_l=4>) — 隔离云网络
  * [Amazon EventBridge](<https://aws.amazon.com/cn/eventbridge/?p=bl_pr_eventbridge_l=5>) — 大规模构建事件驱动应用程序
**相关文章：**
  * [将 AWS DevOps Agent 智能运维能力延伸到中国区](<https://aws.amazon.com/cn/blogs/china/aws-devops-agent-intelligent-operations/?p=bl_ar_l=1>)
  * [基于 AWS DevOps Agent 构建 AI 驱动的运维分析系统](<https://aws.amazon.com/cn/blogs/china/based-on-aws-devops-agent-build-ai-operations-analytics-system/?p=bl_ar_l=2>)
  * [AWS DevOps Agent 与 GitHub 集成实践：如何实现从代码变更到故障调查的端到端闭环](<https://aws.amazon.com/cn/blogs/china/aws-devops-agent-github-integration-practice-how-to-implement-fault-end-to-end/?p=bl_ar_l=3>)
  * [AWS Direct Connect 故障演练实战指南](<https://aws.amazon.com/cn/blogs/china/aws-direct-connect-fault-guide/?p=bl_ar_l=4>)
*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。
## 本篇作者
### 张蒙蒙
亚马逊云科技资深网络专家，负责云网络相关的架构与解决方案设计。在企业网、运营商城域网与核心网、SDN、SD-WAN 以及云网络等方向拥有丰富的实践经验，并对 Container/K8S 技术保持研究兴趣。本系列博客是他近期在 AI Agent 与网络运维自动化 方向的研究成果——通过 AWS DevOps Agent、MCP 与 ChatOps 回流通路，尝试把故障调查能力从”AWS 侧”扩展到”混合云全链路”。在加入亚马逊云科技之前，他曾在 Juniper、Versa、360 企业安全等公司担任高级技术支持工程师、资深解决方案架构师与 SD-WAN 产品总监。
* * *
## AWS 架构师中心：云端创新的引领者
探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---