---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/network-firewall-deploy-guide-6
ingested: 2026-06-09
feed_name: AWS China Blog
source_published: 2026-06-09
sha256: 4bf157f76e46dfd15600ffbfd75b2b7414c11c0a1a86d04b801b9147d24177d6
---

# Network Firewall 部署小指南 (六) 利用 Amazon Bedrock AI 实现Network Firewall规则冲突的实时检测与智能分析

摘要：目前Network Firewall没有规则配置冲突检测的能力，用户借助此方案可以对编辑的规则进行实时的冲突检测，并借助AI提供智能分析与修改建议。

**目录**

01 背景

02 解决方案

03 方案架构

04 测试验证结果

05 核心代码

06 总结

* * *

## **1\. 背景**

[AWS Network Firewall](<https://aws.amazon.com/cn/network-firewall/>) 允许在同一个 Firewall Policy 下关联多个 Rule Group，但 AWS Console 不提供 Rule Group 的规则冲突检测能力。当不同 Rule Group 中的规则存在 CIDR 重叠、策略冲突时，可能导致策略行为不符合预期。

### 1.1 痛点

  * 无原生冲突检测: AWS Network Firewall 不检测 Rule Group的规则冲突
  * 规则复杂度高: Suricata、IP ACL、Domain List 三种格式混合使用，人工审查困难
  * 发现滞后: 通常在部署后才发现策略冲突，影响生产环境
  * 缺乏可视化: 无法直观看到所有 Rule Group 的规则关系和冲突点



### 1.2 典型冲突场景

| A | B | C | D  
---|---|---|---|---  
1 | Rule Group A | Rule Group B | 冲突描述 | 风险等级  
2 | pass icmp 10.1.1.0/24 | drop icmp 10.1.0.0/16 | CIDR 子集重叠 | 中  
3 | pass ip 1.1.1.1 → any | drop ip 1.1.1.1 → any | IP/CIDR策略冲突 | 高  
4 | DENYLIST: .google[.com](<http://cisco.com>) | ALLOWLIST: .google[.com](<http://cisco.com>) | 域名策略冲突 | 高  
  
风险等级说明：

中等风险：业务/应用存在分层策略，如放行10.1.1.0/24，而拒绝其他10.1.X.0/24子网

高等风险：相同的条目冲突/策略冲突

## **2.解决方案**

本方案构建了一套全自动的策略冲突检测系统，在用户编辑 Rule Group 并点击 Save 的瞬间即时检测潜在冲突，并结合 AI 大模型给出智能分析和修复建议，并通过邮件实时通知管理员。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/network-firewall-deploy-guide6-1.jpg>) [图1]  
---  
  
### 2.1 方案优势

| A | B  
---|---|---  
1 | 维度 | 说明  
2 | 即时性 | 用户做Rule Group创建/修改，点 Save 后 1-2 分钟内收到邮件通知  
3 | 准确性 | 多维度检测（IP/端口/协议/域名/深度条件），误报率低  
4 | 智能化 | AI 理解优先级语义和业务上下文，给出精准分析  
5 | 全覆盖 | 支持 Suricata、IP ACL、Domain List 三种规则格式  
6 | 低成本 | Serverless 架构，按需计费，无常驻资源  
7 | 可审计 | 所有报告存储在 S3，90 天自动过期  
8 | 易部署 | CloudFormation 一键部署，可复制到其他 Region  
  
## **3\. 方案架构**

### 3.1 AWS 服务组件

| A | B | C  
---|---|---|---  
1 | AWS 服务 | 角色 | 功能说明  
2 | Network Firewall | 被监控对象 | 用户在此编辑 Rule Group 规则  
3 | CloudTrail | 事件记录 | 记录所有 NFW API 调用  
4 | EventBridge | 事件路由 | 匹配 NFW 变更事件，触发 Lambda  
5 | Lambda | 核心引擎 | 冲突检测 + 可视化 + AI 调用 + 通知  
6 | Bedrock (Nova Pro) | AI 分析 | 意图判断、风险评估、修复建议  
7 | S3 | 报告存储 | SVG 可视化图和 JSON 报告  
8 | SNS | 通知渠道 | 邮件告警通知管理员  
  
### 3.2 端到端工作流程
    
    
    用户编辑 Rule Group → Save
        │
        ▼
    CloudTrail 记录 API → EventBridge 匹配 → 触发 Lambda
        │
        ▼
    ┌─────────────────────────────────────────────┐
    │  Lambda 内部执行步骤                          │
    │                                             │
    │  Step 1: 获取所有 Rule Group 规则（API 调用）  ｜
    │  Step 2: 查询哪些 Rule Group 已在 Policy 中   ｜
    │  Step 3: 代码做冲突检测（CIDR/端口/域名计算）    |
    │  Step 4: 生成 SVG 可视化图 → 存 S3            |
    │  Step 5: 调用 Bedrock AI 分析                |
    │  Step 6: 有冲突 → SNS 发邮件                  |
    └─────────────────────────────────────────────┘
    

从用户操作到收到邮件通知的完整链路:

  * 用户在 Console/CLI 编辑 Rule Group 并点击 Save
  * CloudTrail 记录 UpdateRuleGroup/CreateRuleGroup API 调用
  * EventBridge 匹配事件模式，触发 Lambda
  * Lambda 执行: 获取规则 → 冲突检测(代码) → AI 分析 → 通知
  * 有冲突: 发送邮件（含 AI 分析 + 可视化链接 + 报告链接）
  * 无冲突: 静默结束，不打扰



### 3.3 代码与AI 的分工

确定性计算由代码完成，需要判断和推理的由 AI 完成:

| A | B | C  
---|---|---|---  
1 | 任务 | 执行者 | 原因  
2 | CIDR 是否重叠 | 代码 | 确定性计算，代码更准确更快  
3 | 端口是否重叠 | 代码 | 确定性计算  
4 | 域名是否重叠 | 代码 | 确定性字符串匹配  
5 | 判断是有意设计还是配置错误 | AI | 需要理解业务语义和上下文  
6 | 评估风险等级和业务影响 | AI | 需要综合判断  
7 | 给出修复方向建议 | AI | 需要权衡多种方案  
8 | 生成中文分析报告及可视化图 | AI | 自然语言生成  
  
核心原则: 代码负责”发现冲突”，AI 负责”解释冲突”。代码告诉”这两条规则有冲突”，AI 告诉”这个冲突意味着什么、严不严重、怎么解决”。

### 3.4 冲突检测逻辑

**3.4.1 触发机制**

系统采用纯事件驱动架构，用户编辑 Rule Group 时即时触发:

  * 用户在 Console/CLI 编辑 Rule Group 并点击 Save
  * CloudTrail 捕获 UpdateRuleGroup/CreateRuleGroup API 调用
  * EventBridge 匹配事件并触发 Lambda
  * Lambda 将被修改的 Rule Group 与所有已部署在 Policy 中的 Rule Group 对比
  * 发现冲突则发送邮件告警，无冲突则静默



**3.4.2 检测维度**

对于 Rule Group 的规则，引擎检查以下维度:

  * 协议匹配（相同协议或一方为 ip 全协议）
  * 源 IP 重叠（CIDR 计算、变量语义、IP 列表解析）
  * 目标 IP 重叠（同上）
  * 端口范围重叠
  * 深度匹配条件（http.host、http.content_type、http.method）
  * 域名重叠（Domain List 规则，含子域名关系）



### 3.5 AI 集成 (Amazon Bedrock Nova)

**3.5.1 AI 的定位**

确定性的计算（CIDR 重叠、端口匹配）由代码完成，AI 用于需要判断和推理的环节:

  * 意图分析: 判断冲突是有意的分层策略设计还是配置错误
  * 优先级感知: 理解 STRICT_ORDER 模式下的规则匹配行为
  * 风险评估: 评估每个冲突的业务影响和紧急程度
  * 修复方向: 给出策略调整思路（不输出具体语法，避免误导）
  * 策略可视化图SVG: 生成管理员可直接阅读的可视化图表



**3.5.2 STRICT_ORDER 语义理解**

AI 的 prompt 中包含了 STRICT_ORDER 的精确行为描述。例如:

  * Rule Group A（优先级高）: pass icmp 10.1.1.0/24
  * Rule Group B（优先级低）: drop icmp 10.1.0.0/16



**3.5.3 AI 正确识别**

  * 10.1.1.0/24 流量命中 Rule A → 放行（Rule B 不会看到）
  * 10.1.2.0/24 等不命中 Rule A → 落到 Rule B → 被拒绝
  * 两条规则都有效，分别对不同子集的流量生效



## **4\. 测试验证结果**

### 4.1 Suricata 规则冲突

测试: pass icmp 10.1.1.0/24（已部署）vs drop icmp 10.1.0.0/16（新建rule group已保存但未关联）

结果:

  * 正确识别 CIDR 子集关系和优先级影响
  * 检测到冲突，标识为中等风险，邮件发送成功
  * AI分析并给出建议



AI 智能分析与修复建议

1\. **意图分析**:

冲突 #1 是一个 CIDR_SUBSET_OVERLAP 类型的冲突。Suricata-conflict-rule-1 规则组中的规则 pass icmp 10.1.1.0/24 any → $EXTERNAL_NET any 优先级更高，因为它已经部署在 Policy 中。Suricata-conflict-rule-2 规则组中的规则 drop icmp 10.1.0.0/16 any → $EXTERNAL_NET any 优先级较低，因为它是新添加的。这种情况下，来自 10.1.1.0/24 网段的 ICMP 流量会首先匹配 Suricata-conflict-rule-1 中的规则，因此会被放行。而来自 10.1.0.0/16 但不在 10.1.1.0/24 范围内的其他 ICMP 流量会落到 Suricata-conflict-rule-2 中的规则，因此会被阻断。这种 “大范围拒绝 + 小范围例外放行” 的模式通常是有意设计的分层策略。

2\. **风险评估**:

冲突 #1 的风险等级为中等。如果这是有意的分层策略设计，那么风险较低，因为它符合业务需求。但如果这是无意的配置错误，那么可能会导致部分 ICMP 流量被意外阻断，从而影响网络通信。因此，需要仔细审查这个冲突，确保它符合预期的安全策略。

3\. **修复建议**:

  * 调整优先级：如果这个冲突是无意的，可以考虑调整 Suricata-conflict-rule-2 的优先级，使其高于 Suricata-conflict-rule-1，以确保所有 ICMP 流量都被阻断。
  * 缩小网段范围：可以考虑修改 Suricata-conflict-rule-2 中的网段范围，使其不包含 10.1.1.0/24，从而避免与 Suricata-conflict-rule-1 的冲突。
  * 合并到同一个 Rule Group：可以将这两个规则合并到同一个 Rule Group 中，并明确定义它们之间的优先级关系，以避免潜在的冲突。



4\. **总结**:

当前 Network Firewall 策略中存在一个 CIDR_SUBSET_OVERLAP 类型的冲突，涉及 Suricata-conflict-rule-1 和 Suricata-conflict-rule-2 规则组。这个冲突可能是有意的分层策略设计，也可能是无意的配置错误。建议进一步审查这个冲突，并根据业务需求采取适当的修复措施，以确保网络安全策略的有效实施。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/network-firewall-deploy-guide6-2.jpg>) [图2]  
---  
  
  * 通过可视化图表SVG定位并展示冲突策略

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/network-firewall-deploy-guide6-3.jpg>) [图3]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/network-firewall-deploy-guide6-4.jpg>) [图4]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/network-firewall-deploy-guide6-5.jpg>) [图5]  
---  
  
### 4.2 IP ACL 冲突

测试: pass ip [1.1.1.1, 2.2.2.2]（已部署）vs drop ip 1.1.1.1（新建rule group已保存但未关联）

结果:

  * IP 列表解析正确识别 1.1.1.1 重叠
  * 检测到冲突，标识为高风险，邮件发送成功
  * AI分析并给出建议



AI 智能分析与修复建议

1\. ### 意图分析

Conflict #1:

  * **IP-ACL** (已部署在 Policy 中，优先级更高): `pass ip [1.1.1.1,2.2.2.2] ANY -> ANY ANY (sid:17;)`
  * **IP-ACL-2** (未部署/新添加，优先级更低): `drop ip 1.1.1.1 ANY -> ANY ANY (sid:2;)`



**分析**: 这个冲突看起来是无意的配置错误。IP-ACL允许来自 1.1.1.1 和 2.2.2.2 的所有流量，而 IP-ACL-2 试图阻止来自 1.1.1.1 的所有流量。由于 IP-ACL 的优先级更高，所有来自 1.1.1.1 的流量都会被允许，IP-ACL-2 的阻止规则永远不会生效。

2.### 风险评估

Conflict #1:

  * **风险等级**: 高
  * **潜在影响**: 由于 IP-ACL-2 的阻止规则永远不会生效，这可能会导致安全策略的执行不一致，增加网络的安全风险。



3.### 修复建议

Conflict #1:

1\. **调整优先级**: 将 IP-ACL-2 的优先级提高，使其在 IP-ACL 之前被评估。这样，来自 1.1.1.1 的流量将首先被 IP-ACL-2 阻止。

2\. **缩小网段范围**: 修改 IP-ACL 以排除 1.1.1.1，只允许 2.2.2.2 的流量。这样，IP-ACL-2 可以有效阻止 1.1.1.1 的流量。

3\. **合并到同一个 Rule Group**: 将 IP-ACL和 IP-ACL-2 合并到一个 Rule Group 中，并在该 Rule Group 内部明确定义允许和阻止的规则，以避免优先级冲突。

4.### 总结

在当前 Network Firewall 策略中，存在一个高风险的配置冲突。这个冲突可能导致安全策略的执行不一致，增加网络的安全风险。建议通过调整优先级、缩小网段范围或合并 Rule Group 来解决这个问题，以确保策略的一致性和有效性。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/network-firewall-deploy-guide6-6.jpg>) [图6]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/network-firewall-deploy-guide6-7.jpg>) [图7]  
---  
  
  * 通过可视化图表SVG定位并展示冲突策略

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/network-firewall-deploy-guide6-8.jpg>) [图8]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/network-firewall-deploy-guide6-9.jpg>) [图9]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/network-firewall-deploy-guide6-10.jpg>) [图10]  
---  
  
### 4.3 Domain List 冲突

测试: DENYLIST .google.com（已部署）vs ALLOWLIST .google.com（新创建）

结果:

  * 域名重叠正确识别ALLOW/DENY 策略冲突
  * 检测到冲突，标识为高风险，邮件发送成功
  * AI分析并给出建议



1.### 意图分析

冲突 #1: DOMAIN_ACTION_CONFLICT

  * **Deny-Domain** (已部署在 Policy 中，优先级更高): DENYLIST domains:.google.com,.cisco.com,.[github.com](<http://github.com/>)
  * **Permit-domain** (未部署/新添加，优先级更低): ALLOWLIST domains:.[google.com](<http://google.com/>)



在当前配置中，Deny-Domain 规则组优先级更高，因此对于 .google.com 域名的流量，Deny-Domain 规则将首先匹配并阻止这些流量。Permit-domain 规则组虽然允许 .google.com 域名的流量，但由于其优先级较低，这些流量永远不会到达 Permit-domain 规则组进行匹配。因此，.google.com的流量将始终被阻止。

这种配置很可能是一个配置错误，而不是有意的分层策略设计。如果设计意图是允许 .google.com 的流量，那么 Deny-Domain 规则应该被调整或移除。

2.### 风险评估

风险等级: 高

由于 .google.com 的流量始终被阻止，这可能会导致业务中断，特别是如果 .google.com是一个关键的外部服务。这种配置错误可能会影响到依赖这些域名的应用程序或服务。

3\. ### 修复建议

  * **调整优先级**: 将 Permit-domain 规则组的优先级提高，使其高于 Deny-Domain 规则组。这样，.google.com的流量将首先匹配 Permit-domain 规则，并被允许通过。
  * **修改 Deny-Domain 规则**: 从 Deny-Domain 规则组中移除 .google.com，只保留 .cisco.com和 .github.com。这样，.google.com的流量将不再被阻止。
  * **合并规则组**: 将 Permit-domain 和 Deny-Domain 规则组合并到一个新的规则组中，明确定义允许和阻止的域名。这样可以避免优先级冲突，并使配置更加清晰。



4.### 总结

当前配置中存在一个严重的域名冲突，导致 .google.com 的流量始终被阻止。这可能是一个配置错误，建议调整规则组的优先级或修改 Deny-Domain 规则以解决这个问题。请尽快处理以避免业务中断。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/network-firewall-deploy-guide6-11.jpg>) [图11]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/network-firewall-deploy-guide6-12.jpg>) [图12]  
---  
  
  * 通过可视化图表SVG定位并展示冲突策略

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/network-firewall-deploy-guide6-13.jpg>) [图13]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/network-firewall-deploy-guide6-14.jpg>) [图14]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/09/network-firewall-deploy-guide6-15.jpg>) [图15]  
---  
  
## **5.核心代码**

### 5.1 冲突检测算法

核心思路：对Rule Group中的 的规则，逐维度检查是否存在重叠

#检查维度：协议 → 源IP → 目标IP → 端口 → 深度匹配条件（域名等）

# 只有所有维度都重叠且动作不同时，才标记为冲突
    
    
    # --- RFC1918 私有地址定义（用于判断 $EXTERNAL_NET 变量语义）---
    RFC1918_NETWORKS = [
        ipaddress.ip_network('10.0.0.0/8'),
        ipaddress.ip_network('172.16.0.0/12'),
        ipaddress.ip_network('192.168.0.0/16'),
    ]
    
    
    def is_rfc1918(cidr_str):
        """判断一个 CIDR 是否属于 RFC1918 私有地址"""
        cidr_str = cidr_str.strip('[]')
        if '/' not in cidr_str and re.match(r'^\d+\.\d+\.\d+\.\d+$', cidr_str):
            cidr_str = cidr_str + '/32'
        try:
            net = ipaddress.ip_network(cidr_str, strict=False)
            return any(net.subnet_of(rfc) for rfc in RFC1918_NETWORKS)
        except ValueError:
            return False
    
    
    def cidr_overlaps(cidr1, cidr2):
        """
        检查两个 CIDR 是否有重叠，并理解 Suricata 变量的语义。
    
        返回值：
        - 'exact'    : 完全相同
        - 'subset'   : cidr1 是 cidr2 的子集
        - 'superset' : cidr1 是 cidr2 的超集
        - 'partial'  : 部分重叠
        - 'none'     : 不重叠
        - 'unknown'  : 无法确定（如 @变量引用）
        - 'possible' : 可能重叠但无法确认
    
        关键创新点：
        - $EXTERNAL_NET vs RFC1918 私有地址 → 判定为不重叠（公网≠内网）
        - $HOME_NET vs 公网地址 → 判定为不重叠
        - @IPSet 变量引用 → 无法确定范围，返回 unknown 不报冲突
        - 支持逗号分隔的 IP 列表（如 [1.1.1.1,2.2.2.2]）
        """
        # 统一大小写
        cidr1_lower = cidr1.lower()
        cidr2_lower = cidr2.lower()
    
        # 两个都是 any → 完全相同
        if cidr1_lower == 'any' and cidr2_lower == 'any':
            return 'exact'
    
        # 一个是 any → 超集关系
        if cidr1_lower == 'any' or cidr2_lower == 'any':
            return 'superset'
    
        # ---- $EXTERNAL_NET 的语义处理 ----
        # $EXTERNAL_NET 通常定义为"非 RFC1918"，即公网地址
        # 所以 $EXTERNAL_NET vs 10.x.x.x → 不重叠
        if cidr1 == '$EXTERNAL_NET' or cidr2 == '$EXTERNAL_NET':
            other = cidr2 if cidr1 == '$EXTERNAL_NET' else cidr1
            if is_rfc1918(other):
                return 'none'  # 公网 vs 私网 → 不重叠
            if other == '$EXTERNAL_NET':
                return 'exact'
            if other == '$HOME_NET':
                return 'none'  # HOME_NET 通常是私网
            return 'possible'
    
        # ---- $HOME_NET 的语义处理 ----
        if cidr1 == '$HOME_NET' or cidr2 == '$HOME_NET':
            other = cidr2 if cidr1 == '$HOME_NET' else cidr1
            if other == '$HOME_NET':
                return 'exact'
            if other == '$EXTERNAL_NET':
                return 'none'
            if is_rfc1918(other):
                return 'possible'  # 都是私网，可能重叠
            return 'none'  # 另一方是公网，不重叠
    
        # ---- @IPSet 变量引用（如 @PreproprivateEC2AZ1）----
        # 无法确定实际 IP 范围，返回 unknown 避免误报
        if cidr1.startswith('@') or cidr2.startswith('@'):
            if cidr1 == cidr2:
                return 'exact'
            return 'unknown'
    
        # ---- 逗号分隔的 IP 列表或方括号包裹 ----
        if ',' in cidr1 or ',' in cidr2 or cidr1.startswith('[') or cidr2.startswith('['):
            return check_ip_list_overlap(cidr1, cidr2)
    
        # ---- 补全没有子网掩码的单 IP ----
        if '/' not in cidr1 and re.match(r'^\d+\.\d+\.\d+\.\d+$', cidr1):
            cidr1 = cidr1 + '/32'
        if '/' not in cidr2 and re.match(r'^\d+\.\d+\.\d+\.\d+$', cidr2):
            cidr2 = cidr2 + '/32'
    
        # ---- 标准 CIDR 子网计算 ----
        try:
            net1 = ipaddress.ip_network(cidr1, strict=False)
            net2 = ipaddress.ip_network(cidr2, strict=False)
        except ValueError:
            return 'unknown'
    
        if net1 == net2:
            return 'exact'
        elif net1.subnet_of(net2):
            return 'subset'
        elif net2.subnet_of(net1):
            return 'superset'
        elif net1.overlaps(net2):
            return 'partial'
        else:
            return 'none'
    
    
    def check_ip_list_overlap(cidr1, cidr2):
        """检查逗号分隔的 IP 列表是否有重叠"""
        def parse_ip_list(s):
            s = s.strip('[]')
            parts = [p.strip() for p in s.split(',')]
            networks = []
            for p in parts:
                try:
                    if '/' not in p:
                        p = p + '/32'
                    networks.append(ipaddress.ip_network(p, strict=False))
                except ValueError:
                    pass
            return networks
    
        nets1 = parse_ip_list(cidr1) if ',' in cidr1 else [ipaddress.ip_network(cidr1.strip('[]') + ('/32' if '/' not in cidr1 else ''), strict=False)]
        nets2 = parse_ip_list(cidr2) if ',' in cidr2 else [ipaddress.ip_network(cidr2.strip('[]') + ('/32' if '/' not in cidr2 else ''), strict=False)]
    
        for n1 in nets1:
            for n2 in nets2:
                if n1.overlaps(n2):
                    return 'exact' if n1 == n2 else 'partial'
        return 'none'
    
    
    def deep_match_overlaps(dm1, dm2):
        """
        检查两条规则的深度匹配条件（Suricata options）是否有重叠。
    
        关键逻辑：
        - 如果两条规则匹配不同的域名（如 .google.com vs .baidu.com）→ 不冲突
        - 如果匹配不同的 content_type（如 text/html vs audio/mpeg）→ 不冲突
        - 如果匹配不同的 HTTP 方法（如 GET vs POST）→ 不冲突
    
        这是消除误报的关键环节：即使 IP/端口层面有重叠，
        但深度条件不同意味着匹配的是完全不同类型的流量。
        """
        if not dm1 and not dm2:
            return True
    
        # http.host 域名对比
        if dm1.get('http_host') and dm2.get('http_host'):
            if not domain_overlaps(dm1['http_host'], dm2['http_host']):
                return False  # 不同域名 → 不同流量 → 不冲突
    
        # http.content_type 对比
        if dm1.get('http_content_type') and dm2.get('http_content_type'):
            if dm1['http_content_type'] != dm2['http_content_type']:
                return False
    
        # http.method 对比
        if dm1.get('http_method') and dm2.get('http_method'):
            if dm1['http_method'] != dm2['http_method']:
                return False
    
        return True
    
    
    def domain_overlaps(domain1, domain2):
        """检查两个域名匹配模式是否有重叠（考虑子域名关系）"""
        if domain1 == domain2:
            return True
        d1 = domain1.lstrip('.')
        d2 = domain2.lstrip('.')
        if d1.endswith('.' + d2) or d2.endswith('.' + d1):
            return True
        if d1 == d2:
            return True
        return False
    

### 5.2 AI Prompt 设计

核心思路：

# – 代码负责”发现冲突”（确定性计算）

# – AI 负责”解释冲突”（意图判断 + 风险评估 + 修复建议）

# Prompt 设计要点：

# 1. 告诉 AI STRICT_ORDER 的精确语义（高优先级规则先匹配则停止）

# 2. 标注哪个 Rule Group 已在 Policy 中（优先级高）、哪个是新的（优先级低）

# 3. 定义冲突类型的准确含义（CIDR_SUBSET_OVERLAP vs ACTION_CONFLICT）

# 4. 限制输出格式（纯文本、中文、不要代码建议）
    
    
    AI_PROMPT_TEMPLATE = """You are an AWS Network Firewall security expert. Analyze the following rule conflicts detected in a Network Firewall policy deployment in eu-west-1.
    ## Important Context - Rule Evaluation Order (STRICT_ORDER mode):
    - Rules are evaluated by Rule Group priority (lower number = higher priority).
    - Rule Groups already in the Policy have HIGHER priority than newly added ones.
    - Once a packet matches a rule, evaluation STOPS — subsequent lower-priority rules are NOT checked for that packet.
    - Key implication: If Rule Group A (higher priority) passes traffic from 10.1.1.0/24, and Rule Group B (lower priority) drops traffic from 10.1.0.0/16, the actual behavior is:
      * 10.1.1.0/24 traffic → matches Rule A first → PASS (Rule B never sees it)
      * 10.1.2.0/24, 10.1.3.0/24, etc. → does NOT match Rule A → falls through to Rule B → DROP
      * This forms a "deny-all with exception" pattern — BOTH rules are effective, just for different subsets of traffic.
    ## Conflict Type Definitions:
    - CIDR_SUBSET_OVERLAP: Two rules have CIDR subset/superset relationship with different actions. This is a CIDR subset overlap that may indicate intentional layered policy design for different application/business needs.
    - ACTION_CONFLICT: Two rules match exactly the same traffic (same CIDR, same port, same protocol) but have opposite actions.
    - DOMAIN_ACTION_CONFLICT: Domain list rules with contradicting allow/deny for the same domain.
    ## Current Rules:
    {rules_summary}
    ## Detected Conflicts:
    {conflicts_summary}
    Please provide your analysis in Chinese (中文):
    1. 意图分析: 判断每个冲突是有意设计（如"大范围拒绝 + 小范围例外放行"模式）还是配置错误。精确说明每条规则实际对哪些流量生效。
    2. 风险评估: 对每个冲突评估风险等级（高/中/低）。如果是有意的分层策略设计则风险较低，如果是无意的配置错误则风险较高。说明潜在影响。
    3. 修复建议: 对每个冲突给出 2-3 个修复方向和思路，只描述策略调整的方向（如"调整优先级"、"缩小网段范围"、"合并到同一个 Rule Group"等），不要给出具体的 Suricata 规则语句或代码示例。
    4. 总结: 一段简短的总结，适合发送给管理层。
    格式要求：
    - 直接使用 Rule Group 名称来引用规则，不要使用"规则 A"、"规则 B"这样的标签
    - 明确说明哪个 Rule Group 在 Policy 中优先级更高（已部署的优先级高于新添加的）
    - 精确描述流量匹配行为：哪些流量命中哪条规则、结果是什么
    - 不要使用任何 markdown 格式符号（如反引号、星号、井号等），输出纯文本格式
    请用中文回复，规则内容保持英文原文。"""
    

## **6\. 总结**

本方案基于 EventBridge + Lambda + Bedrock Serverless 架构，将 Network Firewall 策略冲突检测前移至编辑阶段，在规则上线前即时预警，显著降低运维风险。

**核心能力**

  * 编辑 Rule Group 时即时触发检测，支持 Suricata / IP ACL / Domain List 三种格式
  * AI 智能分析冲突意图、评估风险、给出修复方向
  * SVG 可视化展示规则关系与冲突点
  * 仅冲突时 SNS 邮件告警，无冲突不打扰



**下一步行动：**

**相关产品：**

  * [Amazon Network Firewall](<https://aws.amazon.com/cn/network-firewall/?p=bl_pr_network-firewall_l=1>) — VPC 网络级保护
  * [AWS Lambda](<https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=2>) — 无需服务器即可运行代码
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=3>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon EventBridge](<https://aws.amazon.com/cn/eventbridge/?p=bl_pr_eventbridge_l=4>) — 大规模构建事件驱动应用程序
  * [Amazon CloudTrail](<https://aws.amazon.com/cn/cloudtrail/?p=bl_pr_cloudtrail_l=5>) — 审计跟踪



**相关文章：**

  * [利用AWS Firewall Manager统一部署Network Firewall (二) 集中式架构](<https://aws.amazon.com/cn/blogs/china/leveraging-aws-firewall-manager-deploy-network-firewall-architecture/?p=bl_ar_l=1>)
  * [Network Firewall 部署小指南 (五) 使用辅助VPC端点简化NFW部署及运维管理](<https://aws.amazon.com/cn/blogs/china/network-firewall-deploy-guide-using-vpc-nfw-deploy-operations-management/?p=bl_ar_l=2>)
  * [OpenClaw 安全和功能增强实践](<https://aws.amazon.com/cn/blogs/china/openclaw-security-and-feature-enhancement-practices/?p=bl_ar_l=3>)
  * [AWS Direct Connect 故障演练实战指南](<https://aws.amazon.com/cn/blogs/china/aws-direct-connect-fault-guide/?p=bl_ar_l=4>)
  * [利用AWS Firewall Manager统一部署Network Firewall (一)分布式架构](<https://aws.amazon.com/cn/blogs/china/using-aws-firewall-manager-for-unified-network-firewall-deployment-part-1-distributed-architecture/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 韩啸晨

亚马逊云科技网络产品解决方案架构师，20 年网络领域工作经验，CCIE#15854。曾在思科任职大客户售前工程师、企业网解决方案架构师等职位，拥有丰富的企业网、私有云、混合云实践经验

* * *

## 亚马逊云科技中国峰会

Agentic AI 代码秀、Hands-on Lab、Chalk Talk 白板推演——为技术构建者准备的深度内容。 [](<https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p3&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d>) |   
---|---
