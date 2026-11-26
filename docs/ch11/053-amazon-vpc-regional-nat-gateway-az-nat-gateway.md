# Amazon VPC Regional NAT Gateway 与 AZ NAT Gateway 全面对比

> 📊 Level ⭐⭐⭐ | 10.9KB

→ [原文存档](https://aws.amazon.com/cn/blogs/china/amazon-vpc-regional-nat-gateway-az-nat-gateway-comparison)

## Amazon VPC Regional NAT Gateway 与 AZ NAT Gateway 全面对比

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

NAT 网关（NAT Gateway）是 Amazon VPC 中最常用的托管组件之一，它让私有子网中的实例可以主动访问互联网（下载补丁、调用外部 API 等），同时不允许互联网主动发起到这些实例的连接。长期以来，AWS 的 NAT 网关都是一种「可用区（Availability Zone，AZ）级」资源——每个 NAT 网关只存在于单个可用区中。

2025 年 11 月，AWS 正式发布了 NAT 网关的全新「区域可用性模式」，即本文要讨论的 Regional NAT Gateway（区域 NAT 网关，简称 RNAT）。它不再绑定到单个子网或单个可用区，而是与整个 VPC 关联，并能根据工作负载自动跨可用区扩展，从而内建高可用能力。具体可以参考 AWS What’s New 公告 与 官方发布博客。

需要澄清的一点是：Regional NAT Gateway 并不是一个全新的独立产品，而是现有 NAT 网关服务新增的一种可用性模式（Availability mode）。创建网关时可以选择 `zonal`（可用区模式，即传统形态）或 `regional`（区域模式）。本文将传统形态称为「AZ NAT 网关」，新形态称为「Regional NAT 网关」，对两者的架构、优缺点和适用场景做一次系统对比。

## **二．两种 NAT 网关的工作原理**

### 2.1 AZ（可用区）NAT 网关——传统形态

AZ NAT 网关是创建在某个指定可用区内的资源。官方文档的原话是：「每个 NAT 网关创建在特定的可用区中，并在该可用区内以冗余方式实现。」也就是说，它能容忍可用区内部的硬件/主机故障，但本身不跨可用区，也没有自动的跨可用区故障转移能力。

要让私有子网中的实例访问互联网，典型配置是：

  * 将 NAT 网关创建在一个公有子网（Public Subnet）中；
  * 将私有子网的默认路由 `0.0.0.0/0` 指向该 NAT 网关（`nat-gateway-id`）；
  * 将 NAT 网关所在公有子网的 `0.0.0.0/0` 指向互联网网关（Internet Gateway）。

关键点在于：为了实现高可用，AWS 推荐在每个可用区各部署一个 NAT 网关，并让每个子网的路由指向「本可用区内」的 NAT 网关。否则，一旦承载共享 NAT 网关的那个可用区发生故障，其它可用区中、把流量绕到该网关的资源都会失去互联网访问；而把跨可用区流量绕来绕去还会产生额外的跨区数据传输费用。详见 NAT 网关基础文档。

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

    

更多细节可参考官方文档

## 深度分析

### 同一套计费公式，「换一个更省」是误区

两种模式同价（美东 $0.045）：AZ 按网关·小时计，Regional 按活跃可用区·小时计，跨 3 区的一个区域网关与三个 AZ 网关成本相当，没有每区折扣；省的是人力而非账单，降本杠杆是用 VPC 端点绕开 NAT 处理费。

### 自动跨区扩展是「最终一致」而非即时

新可用区的 ENI 触发 RNAT 自动扩展，但官方上限约 60 分钟，期间跨区兜底可能产生跨区费用；叠加不支持私有 NAT、每 VPC 上限 5 个、模式转换会重置活跃连接，RNAT 不是无脑替换项。

### 选型第一分叉是私有连接与区域覆盖

需要私有 NAT 或部署在 GovCloud(US)/中国区时只能用 AZ 模式；排除后，多可用区公网出口、可用区频繁增减、想去掉公有子网的场景才进入 RNAT 主场。

### 出口运维正从「配路由」走向「跑诊断」

作者把选型逻辑沉淀成只读的 `vpc-egress-diagnostic` Skill：只调 describe-/get- 接口、只出报告、费用必给具体数字；规则库覆盖单点 NAT、跨区绕行、缺 S3/DynamoDB 端点、闲置网关、端口耗尽等七类。这条路线与 [AWS DevOps Agent 自主排查云网络故障](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-devops-agent-实战云网络故障自主调查与修复建议.md)、[MCP 打通混合云排障](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-devops-agent-mcp-server打通混合云网络排障的最后一公里.md) 同向，相对 [EC2 NAT 实例自建出口](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ec2-nat-instance-deploy-practice-aws-china-2026.md) 则是托管化的同题解答。

## 实践启示

1. 先筛硬约束：需私有 NAT、或在 GovCloud(US)/中国区，命中任意一条就用 AZ 模式。
2. 「换一个 RNAT 更省钱」从选型理由里划掉：单价相同、按活跃区计费，省的是人力不是账单。
3. 多可用区共用单个 zonal NAT 的部署优先改造：既是单点，又持续产生跨区绕行费。
4. zonal 转 regional 会重置活跃连接，安排维护窗口；新可用区扩展最长约 60 分钟，告警按此设计。
5. 高并发出口盯住端口耗尽：zonal 每 IP 约 5.5 万并发、上限 8 IP，RNAT 每区 32 IP 且自动扩容。
6. 定期用只读 Skill 巡检出口，人工只处理带具体金额的高优项。

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

