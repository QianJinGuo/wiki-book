# Amazon CloudFront部署小指南（二十四）：将CloudFront \"多域名\"改造为\"多租户\"架构 | 亚马逊AWS官方博客

## Ch11.104 Amazon CloudFront部署小指南（二十四）：将CloudFront \"多域名\"改造为\"多租户\"架构 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 9.6KB | `entities/amazon-cloudfront-deploy-guide-cloudfront-domain-multi-tenant-architecture.md`

# Amazon CloudFront部署小指南（二十四）：将CloudFront "多域名"改造为"多租户"架构 | 亚马逊AWS官方博客
Amazon CloudFront部署小指南（二十四）：将CloudFront "多域名"改造为"多租户"架构 by awschina on 07 4月 2026 in Networking Content Delivery Permalink Share 摘要：通过多租户架构简化 CloudFront 配置管理 目录 01 一、简介 02 二、核心概念解析 03 三、架构对比 04 四、多租户架构下的新能力 05 五、改造和迁移步骤 06 六、总结 一、简介 在使用 Amazon CloudFront 时，许多用户会采用"多域名"架构—— 在一个 Distribution 下关联多个域名，以实现配置共享，包括源站配置、安全配置、CDN配置和网络配置。这种方式虽然简化了管理，但也带来了一些显著的问题： 1.1 多域名架构的局限性 无法实现基于单个域名的缓存操作：当需要刷新某个特定域名的缓存时，只能刷新整个 Distribution 的缓存，影响所有域名 无法实现基于单个域名的安全策略：所有域名共享同一套 WAF 规则，无法为不同域名定制安全策略 无法实现基于单个域名的配置管理：源站、CDN 和网络配置都是共享的，无法针对单个域名进行独立调整 1.2 使用CloudFront SaaS Manager 特性改造"多租户"架构 我们将利用CloudFront SAAS manager 特性将现有的"多域名"架构改造为"多租户"架构，产生多租户架构下的高级应用场景。 关于 CloudFront SaaS Manager 的详细介绍和基础部署步骤，请参考我们之前发布的博客文章： 《Amazon CloudFront SaaS Manager 介绍》 ， https://aws.amazon.com/cn/blogs/china/introducing-cloudfront-saas-manager/ ，该文章详细介绍了： – CloudFront SaaS Manager 的核心概念和架构 – 租户（Tenant）、分配（Distribution）、连接组（Connection Group）的基础配置 – 多租户架构的初始部署流程 – 基本的管理和监控方法 1.3 多租户架构的优势 租户（Tenant）与域名一对一映射：每个租户直接对应一个域名 独立的安全策略：可以为每个租户设置独立的 WAF 规则集（WebACL） 独立的缓存管理：可以针对单个租户进行缓存刷新操作 动态配置关联：租户可以动态关联不同的 Distribution，实现源站-CDN 配置的无缝迁移（缓存不丢失） 网络配置解耦：通过 Connection Group，租户可以动态关联不同的网络配置，实现如 Unicast 到 Anycast 的无缝迁移 1.4 为什么不用"一域名一Distribution"？ 另一种方案是为每个域名创建单独的 Distribution，虽然也能实现上述需求，但会线性增加管理复杂度。因为在实际场景中，源站-CDN-网络配置往往是可以共享的，使用多租户架构可以在保持配置共享的同时，获得独立管理的灵活性。 二、核心概念解析 在深入了解架构对比之前，先理解 CloudFront SaaS Manager 的三个核心概念： 2.1 Tenant（租户） 租户是多租户架构的核心单元，与域名一对一映射。每个租户可以： – 绑定一个独立的域名 – 关联独立的 WAF 规则集（WebACL） – 执行独立的缓存刷新操作 – 动态切换关联的 Distribution 和 Connection Group 2.2 Distribution（分配） Distribution 在多租户架构中作为配置模板使用，定义了： – 源站配置（Origin） – CDN 配置（缓存策略、压缩、HTTP 版本等） – 缓存行为（Cache Behavior） – 可以被多个租户共享，实现配置复用 2.3 Connection Group（连接组） Connection Group 定义网络层配置，包括： – 网络类型（Unicast 或 Anycast） – 网络优化策略 – 可以被多个租户共享 – 支持动态切换，实现网络配置的无缝迁移 这三个概念通过动态关联的方式组合在一起，形成了灵活且强大的多租户架构。租户可以随时切换关联的 Distribution 或 Connection Group，实现零停机的配置迁移。 三、架构对比 3.1 传统多域名架构 [图1] 问题：所有域名共享配置，无法独立管理 3.2 多租户架构（SaaS Manager） [图2] 优势： – ✅ 租户独立管理 – ✅ 配置模板共享 – ✅ 动态关联切换 – ✅ 零停机迁移 四、多租户架构下的新能力 4... [truncated]

## 深度分析

**1. "多域名"架构在规模化运营中暴露的三大核心局限**

传统多域名架构的主要问题在于：无法实现基于单个域名的缓存刷新操作（只能刷新整个Distribution，影响所有域名）、无法为不同域名定制独立的安全策略（WAF规则共享）、无法针对单个域名进行独立配置调整（源站、CDN、网络配置均共享）。这三个局限性在多租户SaaS场景中尤为突出，因为不同租户对安全策略和缓存行为的需求往往各异。

**2. CloudFront SaaS Manager通过三层解构实现灵活性**

文章揭示了Tenant、Distribution、Connection Group三个核心概念的解耦设计：Tenant与域名一对一映射，Distribution作为可共享的配置模板，Connection Group处理网络层配置。这种设计让租户既能享受配置共享的效率，又保留独立管理的灵活性，是多租户CDN架构的理想模式。

**3. 动态关联切换能力是架构的核心竞争力**

租户可动态切换关联的Distribution和Connection Group，实现源站-CDN配置无缝迁移（缓存不丢失）及Unicast到Anycast的网络配置迁移。这种"零停机迁移"能力意味着基础设施升级可以在不中断服务的情况下完成，大幅提升了运维灵活性。

**4. 多租户架构 vs "一域名一Distribution"：平衡管理与独立性的取舍**

文章指出"一域名一Distribution"方案虽能满足独立管理需求，但会线性增加管理复杂度。多租户架构通过在共享与独立之间取得平衡——共享基础配置模板，同时保留关键维度的独立配置能力——是规模化CDN管理的更优解。

## 实践启示

**1. 已使用"多域名"架构的CloudFront用户应评估迁移至SaaS Manager的ROI**

如果当前架构面临缓存刷新粒度不足、WAF策略无法独立配置等问题，建议评估CloudFront SaaS Manager的迁移路径。迁移成本主要包括Tenant建立和Distribution重新关联，但收益是长期的运维效率提升。

**2. 新项目直接采用多租户架构而非先多域名后改造**

文章强调了从"多域名"改造为"多租户"的迁移路径，但对于新项目，建议直接采用多租户架构设计，避免后续改造的阵痛和风险。

**3. 利用Connection Group实现网络架构的灵活切换**

Connection Group支持Unicast和Anycast的动态切换，这为网络架构演进提供了灵活性。企业可根据业务增长逐步从Unicast迁移到Anycast，而无需重建整个CDN基础设施。

**4. 在多租户架构中提前规划WAF规则集的标准化**

由于每个租户可关联独立的WebACL，建议建立标准化的WAF规则集模板，既保证安全基线一致，又允许租户级别的定制化调整。

## 相关实体
- [Yidian Tianxia Context Engineering Agentic Ai Qcon](../ch04/252-yidian-tianxia-context-engineering-agentic-ai.html)
- [在 Amazon Ec2 Gpu 实例上部署 Nvidia Nemoclaw 以 Amazon Bedrock 作为推理](ch11/159-amazon-bedrock.html)
- [Using Amazon Bedrock Agentcore Openclaw Multi 2](../ch04/535-amazon-bedrock-agentcore.html)
- [Scalable Voice Agent Design With Amazon Nova Sonic Multi Agent Tools And Session](ch11/285-amazon-nova.html)
- [Aws Sagemaker Capacity Aware Inference Fallback](../ch01/349-aws-sagemaker-capacity-aware-inference-fallback.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/amazon-cloudfront-deploy-guide-cloudfront-domain-multi-tenant-architecture.md)

---

