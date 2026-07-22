---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/amazon-vpc-regional-nat-gateway-az-nat-gateway-comparison
ingested: 2026-07-06
feed_name: AWS China Blog
source_published: 2026-07-02
sha256: "56af4f713b259ffdadf4a6af5867531a9f4ad849b553c033687b5442dc56c6df"
---

# Amazon VPC Regional NAT Gateway 与 AZ NAT Gateway 全面对比

摘要：本文系统对比了 AWS NAT 网关的两种可用性模式：传统的 AZ（可用区）NAT 网关与 2025 年新发布的 Regional（区域）NAT 网关。从架构原理、高可用性、运维复杂度、规格上限、计费模型等维度逐一分析，帮助读者根据实际场景选择最合适的 NAT 网关模式。

**目录**

01 一．背景：为什么要重新认识 NAT 网关

02 二．两种 NAT 网关的工作原理

03 三．核心差异对比

04 四．优缺点分析

05 五．计费：一个常见的误区

06 六．使用场景建议

07 七．实操对比：创建、配置与 EC2 通信

08 八．配套工具：VPC 出口诊断 Skill

09 九．总结

10 十．参考链接

* * *

## **一．背景：为什么要重新认识 NAT 网关**

NAT 网关（NAT Gateway）是 [Amazon VPC](<https://aws.amazon.com/cn/vpc/>) 中最常用的托管组件之一，它让私有子网中的实例可以主动访问互联网（下载补丁、调用外部 API 等），同时不允许互联网主动发起到这些实例的连接。长期以来，AWS 的 NAT 网关都是一种「可用区（Availability Zone，AZ）级」资源——每个 NAT 网关只存在于单个可用区中。

2025 年 11 月，AWS 正式发布了 NAT 网关的全新「区域可用性模式」，即本文要讨论的 Regional NAT Gateway（区域 NAT 网关，简称 RNAT）。它不再绑定到单个子网或单个可用区，而是与整个 VPC 关联，并能根据工作负载自动跨可用区扩展，从而内建高可用能力。具体可以参考 [AWS What’s New 公告](<https://aws.amazon.com/about-aws/whats-new/2025/11/aws-nat-gateway-regional-availability/>) 与 [官方发布博客](<https://aws.amazon.com/blogs/networking-and-content-delivery/introducing-amazon-vpc-regional-nat-gateway/>)。

需要澄清的一点是：Regional NAT Gateway 并不是一个全新的独立产品，而是现有 NAT 网关服务新增的一种可用性模式（Availability mode）。创建网关时可以选择 `zonal`（可用区模式，即传统形态）或 `regional`（区域模式）。本文将传统形态称为「AZ NAT 网关」，新形态称为「Regional NAT 网关」，对两者的架构、优缺点和适用场景做一次系统对比。

## **二．两种 NAT 网关的工作原理**

### 2.1 AZ（可用区）NAT 网关——传统形态

AZ NAT 网关是创建在某个指定可用区内的资源。官方文档的原话是：「每个 NAT 网关创建在特定的可用区中，并在该可用区内以冗余方式实现。」也就是说，它能容忍可用区内部的硬件/主机故障，但本身不跨可用区，也没有自动的跨可用区故障转移能力。

要让私有子网中的实例访问互联网，典型配置是：

  * 将 NAT 网关创建在一个公有子网（Public Subnet）中；
  * 将私有子网的默认路由 `0.0.0.0/0` 指向该 NAT 网关（`nat-gateway-id`）；
  * 将 NAT 网关所在公有子网的 `0.0.0.0/0` 指向互联网网关（Internet Gateway）。



关键点在于：为了实现高可用，AWS 推荐在每个可用区各部署一个 NAT 网关，并让每个子网的路由指向「本可用区内」的 NAT 网关。否则，一旦承载共享 NAT 网关的那个可用区发生故障，其它可用区中、把流量绕到该网关的资源都会失去互联网访问；而把跨可用区流量绕来绕去还会产生额外的跨区数据传输费用。详见 [NAT 网关基础文档](<https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-basics.html>)。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/26/amazon-vpc-regional-nat-gateway-az-nat-gateway-comparison-1.png>) [图 1：AZ（可用区）NAT 网关架构——每个可用区各部署一个网关并维护各自的路由表]  
---  
  
### 2.2 Regional（区域）NAT 网关——新形态

Regional NAT 网关与整个 VPC 关联，而不是某个子网。它会根据工作负载的弹性网络接口（ENI）在各可用区的分布，自动地扩展和收缩：当某个可用区出现需要出口的 ENI 时，它会自动在该可用区扩展出处理能力；当该可用区不再有工作负载时，又会自动收缩。整个过程对外只呈现一个 NAT 网关 ID。

它的几个显著特征：

  * 无需公有子网：AWS 会自动创建一个预配置了互联网网关路由的路由表，降低了「不小心把工作负载暴露到公网」的风险；
  * 可用区亲和性（Zonal affinity）：尽量让流量在本可用区内处理，避免不必要的跨区流量与费用；
  * 两种子模式：Automatic（自动，推荐——由 AWS 管理 IP 与可用区扩展，可对接 VPC IPAM）和 Manual（手动——自行通过 `associate/disassociate-nat-gateway-address` 按可用区管理）；
  * 更高的规格上限：每可用区最多支持 32 个 IP 地址（传统形态为 8 个），并能自动扩容 IP 以避免端口耗尽。



创建一个区域 NAT 网关的 CLI 示例（核心在于 `--availability-mode regional` 参数）：
    
    
    # 创建区域（Regional）模式 NAT 网关，关联到整个 VPC
    aws ec2 create-nat-gateway \
        --vpc-id vpc-0abcd1234ef567890 \
        --availability-mode regional \
        --connectivity-type public
    # 对比：传统的可用区（zonal）模式则需指定 subnet 与弹性 IP
    aws ec2 create-nat-gateway \
        --subnet-id subnet-0123456789abcdef0 \
        --allocation-id eipalloc-0123456789abcdef0
    

更多细节可参考官方文档 [Regional NAT gateways for automatic multi-AZ expansion](<https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateways-regional.html>)。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/26/amazon-vpc-regional-nat-gateway-az-nat-gateway-comparison-2.png>) [图 2：Regional（区域）NAT 网关架构——单个网关 ID 与整个 VPC 关联，按工作负载自动跨可用区扩展]  
---  
  
## **三．核心差异对比**

下表从架构、可用性、运维、规格、计费等维度对两者做了逐项对比：

对比维度 | AZ（可用区）NAT 网关 | Regional（区域）NAT 网关  
---|---|---  
可用区范围 | 位于单个指定可用区，仅在该区内冗余 | 覆盖整个 VPC，按工作负载在各可用区自动扩展/收缩  
高可用 | 无跨区故障转移；需手动「每区一个网关」实现 HA | 默认自动跨区高可用，单个网关 ID 跟随工作负载  
配置 / 路由 | 每区一个网关 + 每区独立路由，新增可用区需重复配置 | 一个网关 ID 可用于所有可用区路由表，无需逐区重复  
公有子网 | 必需（网关须置于公有子网） | 不需要；AWS 自动创建预配置好的路由表  
IP / 连接上限 | 最多 8 个 IPv4；每 IP 对每个目的地 5.5 万并发连接 | 每可用区最多 32 个 IP；自动扩容 IP 防端口耗尽  
新增可用区 | 需手动开通网关并配置路由 | 自动探测新区 ENI 并扩展（AWS 文档：最长约 60 分钟；扩展完成前由其他可用区跨区处理，不中断）  
私有 NAT | 支持（公有 + 私有 NAT 网关） | 不支持，私有连接需回退到可用区模式  
Transit Gateway | 支持 | 支持（仅公有 / 标准连接）  
计费结构 | $0.045/网关·小时 + $0.045/GB 处理费 | $0.045/小时·每活跃可用区 + $0.045/GB；随可用区数量自动调整  
区域可用性 | 所有 AWS 区域（含 GovCloud、中国区） | 除 GovCloud(US) 与中国区外的所有商业区域  
每 VPC 上限 | 受每可用区网关配额限制 | 每个 VPC 最多 5 个区域 NAT 网关  
  
注：以上 $0.045 等价格以美国东部（俄亥俄）区域为例，实际费率因区域而异——例如亚太（东京）ap-northeast-1 为 $0.062/小时与 $0.062/GB、亚太（首尔/新加坡/悉尼）约 $0.059、欧洲（法兰克福）约 $0.052。无论哪个区域，Regional 每活跃可用区的小时费都与同区 zonal 相同（无折扣）。使用前请以 [Amazon VPC 定价页](<https://aws.amazon.com/vpc/pricing/>) 为准。

## **四．优缺点分析**

### 4.1 AZ（可用区）NAT 网关

**优点**

  * 成熟稳定，在所有区域（含 GovCloud 与中国区）均可用；
  * 同时支持公有与私有 NAT 网关，是私有 NAT 场景的唯一选择；
  * 可对 IP 分配与每区路由做精细化控制；
  * 计费按网关·小时，简单可预测；
  * 单个网关在其可用区内已内建冗余，无需为区内容错而堆叠多个。



**缺点**

  * 无跨区故障转移——可用区故障会切断其它区绕行资源的互联网访问；
  * 高可用是一种「手动架构」：必须每区一个网关并维护每区路由表；
  * 随可用区/工作负载增加，运维开销线性增长；
  * 容易误配成单点（共享网关）或产生昂贵的跨区绕行流量；
  * 必须依赖公有子网承载网关，存在暴露面风险。



### 4.2 Regional（区域）NAT 网关

**优点**

  * 默认即跨区自动高可用，单个网关 ID 跟随工作负载；
  * 配置大幅简化——无需每区网关、无需逐区维护路由、无需公有子网；
  * 自动创建预配置路由表，降低误配与暴露风险；
  * 规格更高：每区最多 32 个 IP（vs 8），并自动扩容 IP 防端口耗尽；
  * 具备可用区亲和性，尽量本地处理流量、规避不必要的跨区费用；
  * 计费随可用区数量自动调整；自动模式可对接 VPC IPAM，并支持 Transit Gateway 路由。



**缺点**

  * 不支持私有 NAT / 私有连接，私有场景仍须回退到可用区模式；
  * 新可用区扩展非即时：AWS 文档说明最长约 60 分钟，期间该区流量会被已有可用区跨区处理（不中断；手动模式下若未在所有工作负载可用区启用，可能产生跨区费用）；
  * 相比多可用区部署并不省钱：仍按每个活跃可用区·小时计费；
  * 尚不支持 GovCloud(US) 与中国区；
  * 属于较新功能（2025 年 11 月发布）；其专用路由表不能关联额外子网或其它 RNAT，每 VPC 上限 5 个；
  * 将既有可用区网关转换为区域模式会重置活跃连接，建议在维护窗口内操作；
  * 官方文档尚未明确描述完整可用区故障时 RNAT 的行为（仅说明可用区亲和性与计费/footprint 调整）。



## **五．计费：一个常见的误区**

很多人误以为「用一个区域 NAT 网关替换三个可用区网关」能省下网关费用，但事实并非如此。两种模式共用同一套两段式计费模型：按小时的可用性费用 + 按 GB 的数据处理费（俄亥俄区均为 $0.045/GB）。

  * AZ 模式：$0.045 / 网关·小时（不足一小时按一小时计）；
  * Regional 模式：$0.045 / 小时 × 每个活跃可用区。例如横跨 3 个可用区即 $0.045 × 3 = $0.135/小时，且当某可用区退出工作负载时账单自动下调。



换言之，跨 3 个可用区的一个区域网关，其每小时成本与三个可用区网关大致相同——区域模式没有「每可用区折扣」。它带来的节省主要是运维层面的（更少的需要手动管理的弹性 IP、更少的路由/子网管理），而非更低的单价。

此外别忘了 NAT 之上的标准数据传输费：互联网出向按标准 EC2 费率计费（美东约 $0.09/GB，分档），叠加在 $0.045/GB 的 NAT 处理费之上；NAT 网关与位于不同可用区的 EC2 实例之间的流量还会产生跨可用区数据传输费（长期费率约为每方向 $0.01/GB）。要规避跨区费用，可让资源与 NAT 网关同区、每区部署一个网关、或依赖区域网关的可用区亲和性。对访问 AWS 服务的流量，使用 VPC 接口/网关端点还能进一步降低 NAT 处理费。详见 [NAT 网关定价文档](<https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-pricing.html>)。

## **六．使用场景建议**

### 6.1 适合继续使用 AZ NAT 网关的场景

  * 私有 NAT 场景：VPC 到本地、按 IP 白名单互访，或经 Transit Gateway 在 CIDR 重叠的 VPC 间通信；
  * 部署在 GovCloud(US) 或中国区、暂不支持区域模式的工作负载；
  * 无需多可用区高可用的单可用区工作负载；
  * 需要对 IP 分配与每区路由做精确手动控制的团队；
  * 尚未准备好迁移、不希望切断现有活跃连接的存量部署。



### 6.2 适合采用 Regional NAT 网关的场景

  * 希望获得跨区自动高可用、又不想做逐区部署的多可用区公网出口工作负载；
  * 经常增减可用区、或工作负载动态伸缩的环境；
  * 希望消除公有子网、减少路由表蔓延与误配风险的团队；
  * 出口连接量大、需要更高 IP/端口上限并自动扩容 IP 的场景。



AWS 给出的推荐默认值是：「除需要私有连接的场景外，建议所有场景都考虑使用区域 NAT 网关。」

## **七．实操对比：创建、配置与 EC2 通信**

光看概念还不够直观，本节用一套最小化的步骤，分别演示在两种模式下「如何创建网关 → 如何配置路由 → EC2 出口通信有什么不同」。假设 VPC 为 10.0.0.0/16，跨可用区 A / B 两个私有子网中各有一台 EC2。

### 7.1 创建网关

AZ 模式：需要为每个可用区分别创建一个网关，每个网关必须放在该区的公有子网中，并各自绑定一个弹性 IP。
    
    
    # 可用区 A：在公有子网 A 中创建 NAT 网关，绑定弹性 IP
    aws ec2 create-nat-gateway \
        --subnet-id subnet-pubA \
        --allocation-id eipalloc-aaaa
    # 可用区 B：再创建一个（换公有子网 B 与另一个弹性 IP）
    aws ec2 create-nat-gateway \
        --subnet-id subnet-pubB \
        --allocation-id eipalloc-bbbb
    # 有 N 个可用区，就要重复 N 次
    

Regional 模式：只需创建一个网关，关联到整个 VPC，无需指定子网、无需公有子网。推荐使用 Automatic 子模式，由 AWS 自动管理 IP 与跨区扩展（可对接 VPC IPAM）。
    
    
    # 整个 VPC 只需一条命令
    aws ec2 create-nat-gateway \
        --vpc-id vpc-0abcd1234ef567890 \
        --availability-mode regional \
        --connectivity-type public
    # 无需 --subnet-id、无需 --allocation-id（Automatic 模式自动管理）
    

控制台路径：VPC 控制台 → NAT gateways → Create NAT gateway → 在「Availability mode」中选择 Zonal 或 Regional。

### 7.2 配置路由

AZ 模式：每个私有子网的路由表必须指向本可用区的那个网关，否则会产生跨区流量与费用。两张路由表、两个不同的网关 ID：
    
    
    # 私有子网 A 的路由表 → 本区的 NAT-A
    aws ec2 create-route --route-table-id rtb-privA \
        --destination-cidr-block 0.0.0.0/0 \
        --nat-gateway-id nat-AAAA
    # 私有子网 B 的路由表 → 本区的 NAT-B（注意是不同的网关 ID）
    aws ec2 create-route --route-table-id rtb-privB \
        --destination-cidr-block 0.0.0.0/0 \
        --nat-gateway-id nat-BBBB
    

Regional 模式：所有可用区的私有子网路由表都指向同一个 RNAT 网关 ID，新增可用区也无需改动：
    
    
    # 两个可用区的路由都指向同一个 RNAT ID
    aws ec2 create-route --route-table-id rtb-privA \
        --destination-cidr-block 0.0.0.0/0 --nat-gateway-id nat-RRRR
    aws ec2 create-route --route-table-id rtb-privB \
        --destination-cidr-block 0.0.0.0/0 --nat-gateway-id nat-RRRR
    

### 7.3 EC2 出口通信对比

配置完成后，登录任意私有子网中的 EC2，验证出口是否正常（私有实例上无公网入站，需经堡垒机或 SSM 登录）：
    
    
    # 在 EC2 上验证互联网出口与出口公网 IP
    $ curl -s https://checkip.amazonaws.com
    203.0.113.25      # 这就是 NAT 网关对外呈现的公网 IP
    $ ping -c1 8.8.8.8   # ICMP 也可经 NAT 出网
    

两种模式下，EC2 的「使用体验」基本一致——都是把默认路由指向 NAT 网关即可上网。真正的差异体现在出口 IP、跨区行为和故障表现上：

EC2 通信视角 | AZ（可用区）NAT 网关 | Regional（区域）NAT 网关  
---|---|---  
默认出口 | 经本可用区的网关出网；A 区 EC2 走 NAT-A，B 区 EC2 走 NAT-B | 经同一个 RNAT 出网，靠可用区亲和性保持本地处理  
出口公网 IP | 不同可用区的 EC2 通常呈现不同的弹性 IP | 由 RNAT 统一管理的 IP 池，可自动扩容防端口耗尽  
跨区费用 | 若误把 A 区 EC2 路由到 NAT-B，会产生跨区数据传输费 | 亲和性默认本地处理；仅扩展未完成等少数情况可能跨区  
可用区故障 | 若 NAT-A 所在可用区故障，A 区 EC2 失去出口（B 不受影响） | 单网关跨区，A 区受影响时其余区继续出网（自动 HA）  
新增可用区 C | 需新建 NAT-C + 新路由，C 区 EC2 才能上网 | 自动探测 C 区 ENI 并扩展（最长约 60 分钟，期间跨区处理不中断），路由无需改动  
连接量上限 | 每 IP 对每目的地约 5.5 万并发，最多 8 个 IP | 每可用区最多 32 个 IP，自动扩容应对高并发出口  
  
一句话总结实操差异：AZ 模式是「多个网关 + 多张路由表 + 人工保证每区配置」；Regional 模式是「一个网关 + 一致的路由 + 自动跨区伸缩」。对 EC2 而言上网方式相同，但后者在扩容、容灾和运维上几乎零负担。

## **八．配套工具：VPC 出口诊断 Skill**

前面几节把「该选哪种 NAT、迁移有什么影响」讲清楚了，但这些判断要落到某个真实账号上，仍需人工逐个 VPC 去看路由表、可用区分布、CloudWatch 指标。为此，笔者把本文的选型与诊断逻辑沉淀成了一个配套 Skill——`vpc-egress-diagnostic`，让它对接真实账号、自动找出可改善点，并给出「该用哪种 NAT」的建议。

### 8.1 设计思路

这个 Skill 在设计上守住三条原则，确保它能安全地对生产账号运行：

  * 只读（Read-only）：只调用 `describe-* / get-* / sts get-caller-identity / cloudwatch get-metric-statistics`，绝不执行任何创建/修改/删除操作；
  * 只给建议、绝不输出可执行代码：产出的是一份诊断报告，用文字说明「改什么、为什么」；不生成、也不主动提议生成任何可运行产物（`aws ec2` 命令、迁移脚本、Terraform / CloudFormation / CDK），变更由客户团队自行编写执行；
  * 不编造时间：所有「变更影响/中断」表述只引用 AWS 官方文档已明确的内容；凡官方未量化的时延（如路由切换的秒级时间）一律标注「AWS 未公开」，绝不臆造数字；
  * 费用必须给具体数字：凡涉及成本，都基于采集到的实际流量与该区域费率算出每月具体金额（可带 ±15% 区间），不接受「金额很低/影响极小」这类没有数字的表述。



工作流分四步：①确认区域与只读凭证 → ②只读采集（VPC、子网、NAT 网关、路由表、VPC 端点、ENI、以及每个 NAT 的 CloudWatch 端口/丢包/出向流量指标）→ ③规则引擎分析、生成报告 → ④逐条解读高优先级问题。它内置一套「检测规则库」，这才是 Skill 的核心资产：

检测规则 | 触发条件（来自只读数据）→ 建议方向  
---|---  
NAT 单点故障 / 跨区出口 | 工作负载分布 ≥2 个 AZ，但 zonal NAT 覆盖的 AZ 更少 → 每区一个网关，或迁 Regional  
跨区绕行流量 | 私有子网路由 0.0.0.0/0 指向异区 zonal NAT → 改指本区网关 / 用 Regional 亲和性  
可省的 NAT 处理费 | 有 NAT 却缺 S3/DynamoDB Gateway 端点 → 建 VPC 端点绕开 NAT 计费  
闲置 NAT 网关 | NAT 未被任何路由表引用且出向流量为 0 → 确认后删除止血  
可评估迁移 Regional | ≥2 个公网 zonal NAT、非中国区/GovCloud → 评估整合为单个 Regional NAT  
端口耗尽 | CloudWatch ErrorPortAllocation > 0 → 增加次要 IP / 迁 Regional（每 AZ 32 IP）  
私有 NAT Gateway | 存在 private NAT 网关 → 提示：私有连接必须保留 zonal 模式  
  
### 8.2 测试效果：真实账号实测

笔者在自己的东京（ap-northeast-1）AWS账号上使用Kiro运行了这个 Skill。该环境是一个跨 3 个可用区的 EKS 集群，但出口只靠位于 1a 的单个 zonal NAT 网关，日均出站约 1GB。Skill 经只读采集后，输出报告概览如下：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/26/amazon-vpc-regional-nat-gateway-az-nat-gateway-comparison-3.png>) [图3]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/26/amazon-vpc-regional-nat-gateway-az-nat-gateway-comparison-4.png>) [图4]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/26/amazon-vpc-regional-nat-gateway-az-nat-gateway-comparison-5.png>) [图5]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/26/amazon-vpc-regional-nat-gateway-az-nat-gateway-comparison-6.png>) [图6]  
---  
  
## **九．总结**

Regional NAT 网关把过去需要手动搭建的「每可用区一个网关 + 逐区路由」高可用架构，变成了开箱即用、随工作负载自动伸缩的托管能力，显著降低了多可用区出口的配置与运维复杂度，也消除了对公有子网的依赖。但要记住两点：一是它并不会降低网关单价，省的是人力而非账单；二是它不支持私有 NAT，且尚未覆盖 GovCloud 与中国区。

一句话决策：

  * 需要私有 NAT、或在中国区/GovCloud → 继续用 AZ NAT 网关；
  * 多可用区公网出口、追求免运维高可用 → 优先选 Regional NAT 网关。



**下一步行动：**

**相关产品：**

  * [Amazon VPC](<https://aws.amazon.com/cn/vpc/?p=bl_pr_vpc_l=1>) — 隔离云网络
  * [Amazon EC2](<https://aws.amazon.com/cn/ec2/?p=bl_pr_ec2_l=2>) — 安全且可调整大小的计算容量
  * [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=3>) — 可观测性工具
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=4>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon EKS](<https://aws.amazon.com/cn/eks/?p=bl_pr_eks_l=5>) — 托管式 Kubernetes 服务



**相关文章：**

  * [使用 AWS Route 53 构建高可用 DNS 解析服务：从多主多备到智能健康检测的最佳实践](<https://aws.amazon.com/cn/blogs/china/building-highly-available-dns-with-route53-from-active-active-to-smart-health-checks/?p=bl_ar_l=1>)
  * [AWS Direct Connect 故障演练实战指南](<https://aws.amazon.com/cn/blogs/china/aws-direct-connect-fault-guide/?p=bl_ar_l=2>)
  * [如何为 AWS WAF 速率限制的 IP 配置固定封禁时长](<https://aws.amazon.com/cn/blogs/china/how-to-aws-waf-ip-configuration/?p=bl_ar_l=3>)
  * [告别堡垒机：使用 AWS EICE （EC2 Instance Connect Endpoint） 与 Chaterm 实现私有子网的安全智能运维](<https://aws.amazon.com/cn/blogs/china/bastion-using-aws-eice-ec2-instance-connect-endpoint-chaterm-implement-subnet-security-intelligent/?p=bl_ar_l=4>)



## **十．参考链接**

  * [AWS What’s New：NAT Gateway now supports regional availability](<https://aws.amazon.com/about-aws/whats-new/2025/11/aws-nat-gateway-regional-availability/>)
  * [AWS Blog：Introducing Amazon VPC Regional NAT Gateway](<https://aws.amazon.com/blogs/networking-and-content-delivery/introducing-amazon-vpc-regional-nat-gateway/>)
  * [Amazon VPC User Guide：Regional NAT gateways for automatic multi-AZ expansion](<https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateways-regional.html>)
  * [Amazon VPC User Guide：NAT gateway basics](<https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-basics.html>)
  * [Amazon VPC User Guide：NAT gateway use cases](<https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-scenarios.html>)
  * [Amazon VPC User Guide：Pricing for NAT gateways](<https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-pricing.html>)
  * [Amazon VPC Pricing](<https://aws.amazon.com/vpc/pricing/>)
  * [AWS Well-Architected：REL02-BP02 Provision redundant connectivity](<https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_planning_network_topology_ha_conn_private_networks.html>)



## 本篇作者

### 杨探

亚马逊云科技解决方案架构师，负责互联网行业云端架构咨询和设计。

### 裴秋利

亚马逊云科技解决方案架构师，多年互联网行业沉淀，精通 OPS/SRE/大数据平台设计与团队管理。现专注零售电商领域架构设计，提供高效云原生解决方案，助力客户业务数字化转型与创新增长。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
