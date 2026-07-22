---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/user-security-high-performance-bedrock/
ingested: 2026-06-26
feed_name: AWS China Blog
source_published: 2026-06-26T04:47:30Z
sha256: 7b7f3a8b04b000894eeac449285ba4e94e15adc9a8fa7a5273d8200c1ce06b80
---

# 中国用户安全高性能访问海外 Bedrock

摘要：优先走私网、尽量不走公网：固定办公采用专线（DX / SD-WAN）直连，远程用户先通过 Client VPN 接回数据中心、复用同一条私网链路，确无 VPN 时才使用海外 EC2 代理做 TLS 透传兜底——三条路径最终都经 VPC Interface Endpoint 走 AWS PrivateLink，进入 AWS 后全程私有、不暴露于公网。

**目录**

01 需求背景

02 场景识别

03 解决方案：端到端私有化接入参考架构

04 方案小结与价值

05 关键要点

06 相关阅读

* * *

## **一、需求背景**

近年来 [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 在海外区域更新迅速，业界领先的开源、闭源大模型大多能在第一时间使用。中国的开发团队也希望将这些能力接入本地的 Kiro 和自研的 GenAI 应用。但在实际落地时，”从中国访问海外 Bedrock”这条链路会遇到一些共性问题，归纳起来主要有三点。

1\. 网络体验不稳定。中国访问海外服务通常要经过互联网国际出口，而这条出口的带宽、延迟、丢包和抖动，企业难以掌控。日常网页浏览感受不明显，但 AI 编程场景不同——流式补全、Agent 多轮推理等强交互场景对链路质量非常敏感，出口一旦波动，用户侧就会出现卡顿、超时、补全中断，体验难以保持一致。

2\. 数据在公网中传输。用户发给大模型的提示词中，往往包含企业的敏感信息：RAG 召回的内部文档、自定义的 Skill，乃至业务代码片段；模型返回的结果同样敏感。这些内容若经过公共互联网，是否被监听、是否在某个环节被留存，企业难以掌握。

3\. 缺少一条端到端的私有通道。前两个问题指向同一诉求——企业需要的是一条可控、独享、私密的链路，而不是与其他流量共享不确定的公网。

因此，本方案的核心目标很明确：通过一条私有化、端到端的通道，将中国用户的请求安全、稳定地送达海外 Bedrock，全程避开不可控的公网环节。

## **二、场景识别**

用户的接入情况各不相同——有的在总部机房办公，有的远程办公，用一套方案覆盖所有人并不现实。我们按”接入位置和移动性”将用户划分为三类，便于后续架构对应设计。

场景 | 典型用户 | 接入特征 | 核心诉求  
---|---|---|---  
场景 A：固定办公场所 | 企业数据中心 / 总部 / 分支机构内的开发者 | 有固定网络出口，可对接专线 | 最高的稳定性与私密性，流量完全走私网  
场景 B：远程 / 移动用户（具备 VPN 接入） | 远程办公、出差但可拨入企业网络的开发者 | 无固定出口，但企业已部署 Client VPN | 沿用企业私有通道，数据不在公网穿越  
场景 C：无 VPN 条件的用户 | 临时、外部协作或无法部署 VPN 客户端的开发者 | 既无专线、也无 Client VPN | 在安全可控的前提下，灵活从公网接入  
  
三类场景背后是同一条取舍原则：优先走私网，尽量不走公网。场景 A 条件最优，直接采用专线；场景 B 的远程用户，建议先通过 Client VPN 接回企业数据中心，复用与场景 A 相同的私网链路，以保证端到端私有；只有在场景 C——既无专线也无 Client VPN 的情况下，才退而求其次，在安全与便利之间审慎权衡，采用”代理 + Endpoint”的方式接入。下面的参考架构覆盖了这三条路径。

## **三、解决方案：端到端私有化接入参考架构**

整体架构如下图所示。设计思路可以概括为一句话：无论用户来自何处，最后一段都收敛到海外 Region 的 VPC Interface Endpoint，再经 AWS PrivateLink 访问 Kiro / Bedrock。差异在于”到达 Endpoint 之前”——按场景分为三条路径，且有优先级之分：私网优先，公网兜底。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/23/user-security-high-performance-bedrock-1.png>) [图 1：Kiro 代理接入参考架构——数据中心用户经 DX/SD-WAN 直连 VPC Endpoint，远程用户经 Client VPN 拨入数据中心复用私网链路，无 VPN 用户经 EC2 代理（EIP）→ VPC Endpoint，统一经 PrivateLink 访问 Kiro / Bedrock]  
---  
  
场景 A专线私网直连 VPC Endpoint —— 推荐

数据中心用户条件最优，可直接采用端到端的私有传输，链路较短：

  * 用户侧通过 Direct Connect 跨境专线（或 SD-WAN）接入海外区域的 VPC；
  * 在 VPC 内访问 VPC Interface Endpoint（Kiro PrivateLink），中间不设任何代理；
  * Endpoint 再经 AWS PrivateLink 连接 Kiro / Bedrock，流量始终在 AWS 网络内部。



这条路径的优势可归纳为三点。稳定——专线为独享带宽，延迟、丢包、抖动都很低，规避了公网出口的不确定性。私密——从用户到 Bedrock 全程使用私有地址、私有通道，提示词中的 RAG 上下文、内部 Skill 和推理结果都不暴露于公网。简洁——用户以私网地址直接对接 Endpoint，链路短、无中间解密环节，运维边界清晰。

需要说明的是，这条”跨境私有传输”并不只服务于单一访问源。它既覆盖客户本地数据中心 / Office 中的开发者和应用，也覆盖运行在 AWS 中国区域（北京区域 / 宁夏区域）上的客户端或应用——两者都需要以私有方式跨境访问海外 Region 的 Bedrock。在具体实现上，业界主要有两种方式，企业可根据自身的网络资源和安全要求选择。

### 3.1 私有连接方式一：运营商跨境专线（Direct Connect）

适用场景：客户本地数据中心 / 办公室，或 AWS 中国区域（北京区域 / 宁夏区域）上的客户端 / 应用，需要以专线方式私有访问海外 Bedrock。

由三大运营商（中国电信 CTG / 中国联通 CU / 中国移动 CMI）提供 AWS Cross-Border Connection，通过 Direct Connect 将客户本地网络或 AWS 中国区域的 VPC 与海外区域 AWS 私有打通，跨境直达海外 VPC Endpoint。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/26/user-security-high-performance-bedrock-2-new.png>) [图 2：采用三大国有运营商提供的跨境专线方案]  
---  
  
它的优势在于电信级 SLA，带宽和质量稳定，传输路径清晰、全程可控，适合对稳定性和数据安全要求较高的企业总部、数据中心，以及承载生产流量的 AWS 中国区域应用。需要权衡的是：开通周期较长，按带宽计费，因此更适合长期、稳定、流量较大的接入场景。

### 3.2 私有连接方式二：SD-WAN

适用场景：客户本地数据中心 / 办公室，或 AWS 中国区域（北京区域 / 宁夏区域）上的客户端 / 应用，希望以更敏捷、弹性的方式私有访问海外 Bedrock。

若专线方式过重，还可选择合作伙伴的 SD-WAN 全球组网。它是专线之外更为敏捷的私有传输方案，同样可将客户本地站点或 AWS 中国区域 VPC 接入海外区域 AWS。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/26/user-security-high-performance-bedrock-3-new.png>) [图3：采用SD-WAN 服务商提供的跨境组网方案]  
---  
  
它的优势是开通快、弹性好、可按需扩展，适合多分支、上线周期紧张，或专线尚未就绪的过渡阶段。代价是传输质量依赖 SD-WAN 服务商的骨干能力，因此更适合看重敏捷性、且接受软件定义网络的企业。

如何选择？无论访问源是本地数据中心 / Office，还是 AWS 中国区域（北京区域 / 宁夏区域）上的应用，选择逻辑一致：追求极致稳定、数据安全和长期大流量，优先选择 运营商专线（DX）；追求快速上线、多点接入和弹性扩展，则选择 SD-WAN。两者都可作为场景 A 的私有传输底座，与后端 Endpoint 架构无缝对接。

场景 B远程用户经 Client VPN 拨入数据中心，复用私网链路 —— 推荐

远程和移动用户没有固定的专线出口，但只要企业具备 VPN 接入能力，建议先通过 Client VPN 接回企业数据中心，再借助场景 A 的私有链路访问 VPC Endpoint，而非直接从公网接入代理。流程如下：

  * 远程开发者在本地运行 AWS Client VPN（或企业自有 VPN）客户端，建立一条到企业网络的加密隧道，连接后获得企业内网地址；
  * 流量进入数据中心后，复用与场景 A 完全相同的 Direct Connect / SD-WAN 私有通道，以私网地址直达海外区域的 VPC Interface Endpoint；
  * Endpoint 再经 AWS PrivateLink 连接 Kiro / Bedrock，全程不经过代理，也不在公网中传输。



为什么宁可多经过一道 VPN，也要走这条路径？因为它让远程用户的请求最终仍运行在企业自有的端到端私有通道中，而非”公网 + 代理”，从而真正实现”数据不出私域”。同时它几乎无需额外投入——不必为远程用户单独开放公网入口，可直接复用数据中心现有的专线和 Endpoint，后端无需改动。在安全方面也更顺畅：所有远程接入先汇聚到企业 VPN，再由企业网络统一出境，访问控制、身份认证和审计均在企业既有体系内闭环。在体验上，私网段本身稳定、抖动小，远程用户也能获得接近本地办公的流畅体验。

前提条件：这条路径要求企业已部署 Client VPN / 远程接入网关，且数据中心已具备到海外 AWS 的私有链路（DX 或 SD-WAN）。两个条件都满足时，远程用户应优先选择此路径。

场景 C无 VPN 条件时，谨慎采用海外 EC2 代理 + 私有 Endpoint —— 兜底

只有当用户既无专线、也无法接入 Client VPN——例如临时的外部协作，或无法安装 VPN 客户端——才退到这条兜底路径：在安全与便利之间审慎权衡，使用海外区域的 EC2 代理配合私有 Interface Endpoint 接入。机制大致如下：

  * 客户端通过 HTTP CONNECT 连接部署在公有子网、绑定 Elastic IP 的 EC2 Squid 代理（:3128）；
  * 代理与 VPC Endpoint 之间建立一条 TCP :443 的 TLS 透传隧道——需要注意，Squid 仅做 TCP 转发，不解密 TLS，因此提示词和推理结果对代理始终是密文，端到端加密在客户端与 Bedrock 之间闭环；
  * 隧道落到同一个 VPC Interface Endpoint，之后同样经 PrivateLink 到达 Kiro / Bedrock。



但需要明确这条路径的定位：它本质上是折中的兜底方案，借助公网的灵活性解决”无私网接入”的临时需求。由于接入的第一段仍在不可控的公共互联网上，其稳定性和私密性都弱于场景 A / B，不建议作为常态接入方式。它能守住的底线是数据不被解密——TLS 透传保证代理只转发密文、不拆包，在利用公网灵活性的同时将暴露面降到最小。也正因为部署在公网上，安全边界必须收紧：代理入口的安全组、IP 允许列表、身份认证和访问审计缺一不可，需严格限定接入对象，避免其成为对外开放的跳板。好在它与前两条路径共用同一个 Endpoint 和 PrivateLink 出口，三条路径共享一套后端，整体复杂度不会因此失控。

归根结底，三条路径的终点相同：VPC Interface Endpoint → AWS PrivateLink → Kiro / Bedrock。也就是说，无论用户来自何处，进入 AWS 之后的”最后一段”都在 [AWS VPC](<https://aws.amazon.com/cn/vpc/>) 内运行，既稳定又私密；差异仅在进入 AWS 之前的那一段——能走私网（A / B）就不走公网（C）。

## **四、方案小结与价值**

将现状与本方案对比，差异较为清晰：

维度 | 公共互联网直连（现状） | 本方案（私有化接入）  
---|---|---  
稳定性 | 受互联网国际出口影响，延迟 / 丢包不可控 | 专线独享带宽、稳定低延迟低抖动  
数据安全 | 提示词 / 推理结果经公网传输，暴露面大 | 私网直达或 TLS 透传，数据不在公网穿越  
传输路径 | 公共互联网 + 不确定的国际出口 | 端到端私有通道 + AWS PrivateLink  
灵活性 | 无差别但不可控 | 专线（固定办公）+ Client VPN（远程）+ 代理（无 VPN 兜底）三路径覆盖  
  
整套架构的思路可以概括为三点。一是私网优先：通过专线 / SD-WAN 搭建端到端的私有底座，将企业级 AI 流量从不可控的公网迁移出来，换取稳定与私密。二是按场景设计、私网优先：固定办公采用专线直连，远程用户先通过 Client VPN 接回数据中心、复用同一条私网链路，确无 VPN 时才谨慎启用”代理 + TLS 透传”兜底——一套后端、三条路径，始终遵循”能走私网就不走公网”。三是统一收口到 AWS VPC：所有路径最终都经 VPC Interface Endpoint 走 AWS PrivateLink 访问 Kiro / Bedrock，进入 AWS 后的链路全程私有、稳定。

对于计划将海外 Bedrock 引入中国团队的企业而言，这套参考架构在性能、数据安全和灵活性之间取得了务实的平衡：开发者使用顺畅，企业的敏感数据也始终运行在可控、私密的通道中，兼顾了两方面的需求。

## **五、关键要点**

中国用户安全访问海外 Bedrock

### 5.1 三大痛点

  * 性能：互联网国际出口延迟/丢包不可控
  * 安全：提示词/RAG/结果公网暴露
  * 通道：缺端到端私有传输路径



### 5.2 三类场景

  * 场景 A：固定办公/数据中心，可落专线
  * 场景 B：远程/移动，已有 Client VPN
  * 场景 C：无专线也无 VPN



### 5.3 场景 A：专线私网直连

  * DX / SD-WAN → VPC，不经代理
  * 覆盖本地 DC 与 AWS 中国区（北京 / 宁夏）
  * 独享带宽、低抖动、私有地址直达



### 5.4 场景 B：Client VPN 拨回 DC

  * 远程先拨 Client VPN 进企业内网
  * 复用场景 A 的 DX/SD-WAN 私网链路
  * 数据不出私域，后端零改动



### 5.5 场景 C：代理 + 私有 Endpoint（兜底）

  * HTTP CONNECT → EC2 Squid（EIP :3128）
  * TLS 透传 :443，代理不解密
  * 仅兜底，安全边界须收紧



### 5.6 共同终点

  * VPC Endpoint → AWS PrivateLink → Kiro/Bedrock
  * 进入 AWS 后全程走 VPC 内网
  * 能走私网（A/B）就不走公网（C）



## **六、相关阅读**

**下一步行动：**

**相关产品：**

  * [Amazon VPC](<https://aws.amazon.com/cn/vpc/?p=bl_pr_vpc_l=1>) — 隔离云网络
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=2>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon EC2](<https://aws.amazon.com/cn/ec2/?p=bl_pr_ec2_l=3>) — 安全且可调整大小的计算容量
  * [Amazon Connect](<https://aws.amazon.com/cn/connect/?p=bl_pr_connect_l=4>) — AI 客户体验解决方案



**相关文章：**

  * [AWS BYOIP实战：企业公网IP上云迁移方案](<https://aws.amazon.com/cn/blogs/china/aws-byoip-in-practice-enterprise-public-ip-migration-to-cloud/?p=bl_ar_l=1>)
  * [使用 AWS Route 53 构建高可用 DNS 解析服务：从多主多备到智能健康检测的最佳实践](<https://aws.amazon.com/cn/blogs/china/building-highly-available-dns-with-route53-from-active-active-to-smart-health-checks/?p=bl_ar_l=2>)
  * [告别堡垒机：使用 AWS EICE （EC2 Instance Connect Endpoint） 与 Chaterm 实现私有子网的安全智能运维](<https://aws.amazon.com/cn/blogs/china/bastion-using-aws-eice-ec2-instance-connect-endpoint-chaterm-implement-subnet-security-intelligent/?p=bl_ar_l=3>)
  * [AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联](<https://aws.amazon.com/cn/blogs/china/ai-network-claude-code-kiro-cli-implement-aws-ipsec-vpn/?p=bl_ar_l=4>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 杨立军

亚马逊云科技 Network Specialist SA。聚焦 云网络(VPC / Transit Gateway / Direct Connect / Cloud WAN)、EC2 网络 与 数据中心网络(AI 训练推理网络 10p10u / SRD / EFA)三个方向。曾任职于 Ericsson、Cisco、Dell、Riverbed。CCIE #7915。

### 刘一白

亚马逊云科技解决方案架构师，负责亚马逊云科技网络相关的服务和产品。在企业网、数据中心和云网络有着丰富的实践经验，拥有 AWS Certified Advanced Networking Specialty 和 Cisco Certified Internetwork Expert 等网络技术相关认证。

### 韩啸晨

亚马逊云科技网络产品解决方案架构师，20 年网络领域工作经验，CCIE#15854，曾在思科任职大客户售前工程师、企业网解决方案架构师等职位，拥有丰富的企业网、私有云、混合云实践经验

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
