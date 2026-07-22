---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/direct-connect-dx-migration-best-practices/
ingested: 2026-06-03
feed_name: AWS China Blog
source_published: 2026-06-03T03:06:09Z
sha256: 19b419db38a11f9eff52af8b7225d2f0e958147d05408403a8e643188302e89c
---

# Direct Connect (DX) 迁移最佳实践

摘要：本文梳理了 Direct Connect 迁移的最佳实践，并提供详细的操作步骤供用户参考。

**目录**

01 一、概述

02 二、设计考虑与最佳实践

03 三、迁移过程概述

04 四、DX+VPN备份场景

05 五、DX+DX备份场景

06 六、总结

07 七、关键概念参考表

* * *

## **一、概述**

当用户需要进行 Direct Connect 节点迁移时，我们建议首先梳理现有连接的节点位置，并制定详细的迁移规划。 本文介绍了将Direct Connect 连接迁移到新位置的关键设计考虑因素，并逐步讲解迁移步骤。

## **二、设计考虑与最佳实践**

  * 查看 [Direct Connect 站点列表](<https://aws.amazon.com/cn/directconnect/locations/>)，选择新的站点位置。
  * 确保在迁移到新站点的过程中，拥有符合 [AWS Direct Connect 弹性建议和最佳实践的冗余网络连接](<https://aws.amazon.com/cn/blogs/china/aws-direct-connect-highly-available-routing-design/>)。
  * 在将生产流量切换到新 Direct Connect 之前，务必先通过新连接测试流量。
  * 使用 BGP 属性进行流量工程，设置 Active/Standby BGP 连接，以在现有和新的 Direct Connect 连接之间迁移流量。
  * 在约定的维护窗口期间切换到新的 Direct Connect 连接。



## **三、迁移过程概述**

将 Direct Connect 连接迁移到新位置包括以下步骤：

  * 订购新站点的 Direct Connect 连接。
  * 配置虚拟接口VIF 和本地设备。
  * 测试故障转移以确认流量通过新连接。
  * 将流量切换到新连接。
  * 删除旧连接。



本文将以中国区两种常用的线路冗余设计场景为例，介绍如何将Direct Connect 从中国区深圳节点迁移到中国区其他节点（如上海、宁夏、北京）。同样的迁移思路与步骤，也适用于AWS全球任何 Direct Connect 的连接。

## **四、DX+VPN备份场景**

考虑到部署多条DX专线的成本相对较高，使用 Site-to-Site VPN 作为 DX 的冗余备份是一种兼顾高可用性与成本的方案。

该方案使用 VGW 终结 DX，利用第三方 VPN 软件（vCPE）完成 Site-to-Site VPN 功能。在 VPC 路由表中开启 VGW 的路由传播功能，并设置一条掩码更短的 192.168.0.0/16 静态路由指向 vCPE 的 ENI 网卡。此时，VPC 路由表会根据最长掩码匹配原则优先选择 DX 作为出云方向的主线路。对于入云方向，使用相同的方法设置一条掩码更短的 10.42.0.0/16 静态路由指向 VPN tunnel 接口，或者调整静态路由的管理距离（DX 所用的 EBGP 管理距离为 20），让本地网关优先选择 DX 作为主线路。在本地网关的 DX 接口上配置 BFD，使得 DX 自动切换至 VPN 的时间降低至秒级。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/03/direct-connect-dx-migration-best-practices-1.png>) [图1]  
---  
  
### 4.1 迁移步骤 1：在新 Direct Connect 站点建立第二条连接

首先，您需要按照 Direct Connect 页面中描述的步骤，在新的 Direct Connect 站点（以上海示例）建立新的专用或托管 Direct Connect 连接。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/03/direct-connect-dx-migration-best-practices-2.png>) [图2]  
---  
  
### 4.2 迁移步骤 2：在新 Direct Connect 连接上设置虚拟接口(VIF)

我们强烈建议您在约定的维护窗口期间执行后续步骤。

当新的 Direct Connect 连接在 AWS 管理控制台中可用后，创建与主连接相同类型的新的VIF接口。如果您的主连接关联在 Direct Connect Gateway 上，则将新的 VIF 也关联在同一个 Direct Connect Gateway 上。

### 4.3 迁移步骤 3：配置BGP路由属性策略

使用以下流量工程技术将新连接保持在Standby状态，使用 BGP 属性确保生产流量不会被发送到新的 Direct Connect 连接。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/03/direct-connect-dx-migration-best-practices-3.png>) [图3]  
---  
  
从本地网络到 AWS 的流量：具有较高 Local Preference 值的路由将被本地优先选择。因此，在本地网络侧进行路由属性配置，将从AWS新线路（上海）接收的路由的 Local Preference 设置低于原线路（深圳）的值，如果之前在原线路没有做过对应配置，默认Local Preference是100。

从 AWS 到本地网络的流量：为了将新的 Direct Connect 连接保持在standby模式，通过新线路（上海）向 AWS 通告的所有本地路由的BGP Community标签为（7224:7100）。这确保来自 AWS 的任何流量继续优先使用原线路（深圳）的 Direct Connect 连接。

### 4.4 迁移步骤 4：故障转移测试以验证新 VIF 上的流量

按照 [AWS Direct Connect 故障转移测试](<https://aws.amazon.com/cn/blogs/china/aws-direct-connect-fault-guide/>)的说明，关闭主连接上的 BGP 会话。这将强制本地网络与 AWS 之间的所有流量通过新连接（上海）上配置的新 VIF 传输。

在新的 Direct Connect 连接上测试您的工作负载，确保它们按预期工作并满足性能要求。如果遇到问题，您可以立即停止测试，恢复主连接，将流量恢复到原始状态。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/03/direct-connect-dx-migration-best-practices-4.png>) [图4]  
---  
  
### 4.5 迁移步骤 5：删除原 Direct Connect 连接

确认新的 Direct Connect （上海）连接满足您的需求后，您可以删除原 Direct Connect 连接（深圳）。

（从 AWS 管理控制台中删除 VIF，然后删除 Direct Connect 连接。）

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/03/direct-connect-dx-migration-best-practices-5.png>) [图5]  
---  
  
## **五、DX+DX备份场景**

为了确保业务连续性，以及对线路服务质量如带宽、丢包率、延迟等有较高要求的客户，通常会在不同的Direct Connect PoP节点部署多条Direct Connect专线，通过BGP路由属性配置(Active/ Passive或ECMP) 以满足线路负载和高可用要求。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/03/direct-connect-dx-migration-best-practices-6.png>) [图6]  
---  
  
### 5.1 迁移步骤 1：在新 Direct Connect站点建立第三条连接(Active/ Passive举例)

首先，您需要按照 Direct Connect 页面中描述的步骤，在新的 Direct Connect 站点（以北京示例）建立新的专用或托管 Direct Connect 连接。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/03/direct-connect-dx-migration-best-practices-7.png>) [图7]  
---  
  
### 5.2 迁移步骤 2：在新 Direct Connect 连接上设置虚拟接口(VIF)

我们强烈建议您在约定的维护窗口期间执行后续步骤。

当新的 Direct Connect 连接在 AWS 管理控制台中可用后，创建与主连接相同类型的新的VIF接口。如果您的主连接关联在 Direct Connect Gateway 上，则将新的 VIF 也关联在同一个 Direct Connect Gateway 上。

### 5.3 迁移步骤 3：配置BGP路由属性策略

使用以下流量工程技术将新连接保持在Standby状态，使用 BGP 属性确保生产流量不会被发送到新的 Direct Connect 连接。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/03/direct-connect-dx-migration-best-practices-8.png>) [图8]  
---  
  
从本地网络到 AWS 的流量：具有较高 Local Preference 值的路由将被本地优先选择。因此，在本地网络侧进行路由属性配置，将从AWS新线路（北京）接收的路由的 Local Preference 设置低于原线路（深圳和上海）的值。

从 AWS 到本地网络的流量：为了将新的 Direct Connect 连接保持在standby模式，通过新线路（北京）向 AWS 通告的所有本地路由的BGP Community标签为（7224:7100）。这确保来自 AWS 的任何流量继续优先使用原线路（深圳）的 Direct Connect 连接。

### 5.4 迁移步骤 4：故障转移测试以验证新 VIF 上的流量

按照 [AWS Direct Connect 故障转移测试](<https://aws.amazon.com/cn/blogs/china/aws-direct-connect-fault-guide/>)的说明，关闭原连接（深圳和上海）的 BGP 会话。这将强制本地网络与 AWS 之间的所有流量通过新连接（北京）上配置的新 VIF 传输。

在新的 Direct Connect 连接上测试您的工作负载，确保它们按预期工作并满足性能要求。如果遇到问题，您可以立即停止测试，恢复主连接，将流量恢复到原始状态。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/03/direct-connect-dx-migration-best-practices-9.png>) [图9]  
---  
  
### 5.5 迁移步骤 5：删除原 Direct Connect 连接

确认新的 Direct Connect （北京）连接满足您的需求后，您可以删除原 Direct Connect 连接（深圳）。

（从 AWS 管理控制台中删除 VIF，然后删除 Direct Connect 连接。）

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/03/direct-connect-dx-migration-best-practices-10.png>) [图10]  
---  
  
## **六、总结**

遵循本文讨论的步骤，可帮助您将 Direct Connect 连接平滑迁移到其他AWS Direct Connect PoP站点。

**下一步行动：**

**相关产品：**

  * [Amazon Connect](<https://aws.amazon.com/cn/connect/?p=bl_pr_connect_l=1>) — AI 客户体验解决方案
  * [Amazon VPC](<https://aws.amazon.com/cn/vpc/?p=bl_pr_vpc_l=2>) — 隔离云网络



**相关文章：**

  * [AWS Direct Connect 故障演练实战指南](<https://aws.amazon.com/cn/blogs/china/aws-direct-connect-fault-guide/?p=bl_ar_l=1>)
  * [使用 AWS Route 53 构建高可用 DNS 解析服务：从多主多备到智能健康检测的最佳实践](<https://aws.amazon.com/cn/blogs/china/building-highly-available-dns-with-route53-from-active-active-to-smart-health-checks/?p=bl_ar_l=2>)
  * [DX 维护通知全球自动化处理方案 — 基于 Severless 的跨账号/跨区域实践](<https://aws.amazon.com/cn/blogs/china/dx-maintenance-automation-serverless-cross-account-region-practice/?p=bl_ar_l=3>)
  * [AI Agent 如何为企业上云按下”加速键” —— CRM系统迁移实战](<https://aws.amazon.com/cn/blogs/china/ai-agent-how-to-enterprise-crm-system-migration/?p=bl_ar_l=4>)
  * [增强Amazon EKS 节点自愈方案：基于 NPD 的故障持久化与安全修复探索](<https://aws.amazon.com/cn/blogs/china/augmented-amazon-eks-node-self-healing-solution-based-on-npd-security-explore/?p=bl_ar_l=5>)



## **七、关键概念参考表**

| A | B  
---|---|---  
1 | 术语 | 说明  
2 | Direct Connect | AWS 提供的专用网络连接服务，在本地数据中心与 AWS 之间建立专线连接  
3 | VIF（虚拟接口） | 逻辑接口，用于将 Direct Connect 物理连接映射到特定的 AWS 服务（Private VIF / Public VIF / Transit VIF）  
4 | Local Preference | BGP 路由属性，数值越高则路由优先级越高，用于控制出站流量路径选择  
5 | BGP Community | 用于在 BGP 路由中附加策略信息，AWS 使用 7224:7100, 7224:7200, 7224:7300系列标签控制路由优先级  
6 | Direct Connect Gateway | 全球资源，允许从任何 Direct Connect 站点连接到任意 AWS 区域的VPC  
  
## 本篇作者

### 韩啸晨

亚马逊云科技网络产品解决方案架构师，20 年网络领域工作经验，CCIE#15854，曾在思科任职大客户售前工程师、企业网解决方案架构师等职位，拥有丰富的企业网、私有云、混合云实践经验

### 卢显颍

亚马逊云科技网络产品技术业务拓展经理，CCIE#54352，HCIE#12705，RHCA。曾任中国电信国际有限公司云网产品经理，具备丰富的国际企业混合云互联及组网实践经验。

* * *

## 亚马逊云科技中国峰会

Agentic AI 代码秀、Hands-on Lab、Chalk Talk 白板推演——为技术构建者准备的深度内容。 [](<https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p3&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d>) |   
---|---
