# Amazon Quick ARNs: Cross-account migration and namespace permissions

## Ch11.028 Amazon Quick ARNs: Cross-account migration and namespace permissions

> 📊 Level ⭐⭐ | 16.1KB | `entities/amazon-quick-arns-cross-account-namespace-permissions.md`

# Amazon Quick ARNs: Cross-account migration and namespace permissions

> **Source archive**: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/amazon-quick-arns-cross-account-migration-and-namespace-perm.md)

# Amazon Quick ARNs: Cross-account migration and namespace permissions

You migrate dashboards from development to production, but the permissions don’t carry over. You share a dashboard with your Finance team, but they keep getting “access denied.” You set up namespaces for multi-tenant isolation, and the same username works in one namespace but not another.

These are real tasks that Amazon Quick administrators tackle regularly, and getting them right requires a clear understanding of how Amazon Resource Names (ARNs) work.

[Amazon Quick](<https://aws.amazon.com/quicksight/>) is a unified, AI-powered business intelligence service that helps you build interactive dashboards, query data in natural language, automate workflows, and embed analytics directly into applications. As you scale your deployments across multiple AWS accounts and namespaces, understanding how Amazon Quick identifies and secures resources through ARNs becomes critical.

In this post, we cover the structure of Amazon Quick ARNs and provide a practical mental model for working with them. By the end, you can look at an ARN and immediately understand what it means for your migration strategy, diagnose permission issues faster, and design multi-tenant architectures with confidence.

## A note on naming

Amazon Quick is the service that you use today, but ARNs and API endpoints still use “quicksight” as the service identifier. We keep this for compatibility with existing AWS Identity and Access Management (IAM) policies, automation, and integrations across customer environments.

Throughout this post, you see ARNs like:

    arn:aws:quicksight:us-east-1:123456789012:dashboard/...

The “quicksight” portion refers to the Quick Sight capability within Amazon Quick. Existing code, IAM policies, and CLI commands continue to work without modification for current implementations. For more information, see [Amazon Quick Sight Resource ARNs](<https://docs.aws.amazon.com/quicksight/latest/APIReference/qs-resource-arns.html>).

## Think of ARNs as postal addresses

Just as “123 Main Street, Springfield, MA” uniquely identifies a location, an ARN uniquely identifies a resource in AWS. The following is a visual representation of the components of an ARN:

Here’s how the components map:

**Component** | **Analogy** | **What it represents**
---|---|---
aws | Planet | AWS partition- aws / aws-cn / aws-gov-us
quicksight | Country | The Service within an AWS partition
us-east-1 | State | AWS Region
111111111111 | City | AWS Account ID
dashboard | Street | Resource Type
04f736b4-bd1b-… | House number | Unique Resource ID

> _The account ID is part of the address. Move to a new city, and your address changes, even if you get a house with the same street number. The same applies to Amazon Quick resources. Migrate a dashboard from your development account to production, and the ARN changes because the account ID is different._

## What this looks like in practice: Dev/QA/Prod

AnyCompany has three AWS accounts for their Amazon Quick deployment:

  * Development (Account: 111111111111): Where analysts build new dashboards.
  * QA (Account: 222222222222): Where dashboards are tested before release.
  * Production (Account: 333333333333): Where business users access approved dashboards.

Saanvi, a data analyst at AnyCompany, builds a sales dashboard in Development:

    arn:aws:quicksight:us-east-1:111111111111:dashboard/sales-dash-001

She uses the [Asset Bundle APIs](<https://docs.aws.amazon.com/quicksight/latest/developerguide/asset-bundle-ops.html>) to migrate it to QA. The dashboard now has a new ARN:

    arn:aws:quicksight:us-east-1:222222222222:dashboard/sales-dash-001

What changed and what didn’t:

  * Account ID changed (111111111111 → 222222222222).
  * Resource ID stayed the same (sales-dash-001).
  * Region stayed the same (us-east-1).

The dashboard in QA is a different resource than the one in Development, even though they share the same resource ID. Different ARNs mean different addresses in the AWS universe.

### Why permissions don’t transfer during migration

In development, Saanvi granted view access to her team:

    # Development account permissions
    qs.update_dashboard_permissions(
        AwsAccountId='111111111111',
        DashboardId='sales-dash-001',
        GrantPermissions=[{
            'Principal': 'arn:aws:quicksight:us-east-1:111111111111:group/default/DataAnalysts',
            'Actions': ['quicksight:DescribeDashboard', 'quicksight:QueryDashboard']
        }]
    )

After migration to QA, the dashboard has no permissions. Amazon Quick stores permissions as relationships between resource ARNs and principal ARNs. The original permission said “the DataAnalysts group in account 111111111111 can view this dashboard.” But in QA:

  * The dashboard has a new ARN (different account).
  * The DataAnalysts group in account 111111111111 doesn’t exist in account 222222222222.
  * A DataAnalysts group in QA has a different ARN (it references QA’s account ID).

> _Permissions don’t migrate because they reference account-specific ARNs. You must re-establish permissions in each target environment, either during import or after._

### How the dependency chain works

Saanvi’s dashboard doesn’t exist in isolation. It depends on:

  * A dataset (sales-data) that transforms the raw data.
  * A data source (sales-db-connection) that connects to the database.

Each has its own ARN, and the dashboard internally references them:

    Development Account (111111111111):
    ├── Dashboard: arn:aws:quicksight:...:111111111111:dashboard/sales-dash-001
    │   └── References: arn:aws:quicksight:...:111111111111:dataset/sales-data
    │       └── References: arn:aws:quicksight:...:111111111111:datasource/sales-db-connection

When the Asset Bundle APIs import the bundle into the target account, they automatically update these internal ARN references to reflect the new account ID.

---

## 深度分析

1. **ARN 的账户绑定性是跨账户迁移的本质约束**

   Amazon Quick 的 ARN 结构将 Account ID 内嵌为资源身份的一部分，这与 S3 的资源粒度模型截然不同——S3 可通过跨账户 IAM Role 实现共享，而 Quick 的权限模型是「资源 ARN ↔ 主体 ARN」的严格配对。迁移的本质不是「移动资源」，而是「在新账户重建资源身份」，资源 ID 可以保持不变，但 ARN 必须因账户 ID 变化而重新生成。这意味着任何基于 ARN 的权限声明在迁移后必须重新建立，这是架构设计而非 API 局限。

2. **资产与主体的命名空间语义不对称是理解跨账户共享的关键**

   文章明确指出：资产（dashboard、dataset、datasource）存在于账户级别，不属于任何 namespace；而用户和组则嵌入在 namespace 中。这种不对称性使得单个 dashboard 可以同时授权给 HR/*、Marketing/* 和 default/PlatformTeam 三个不同 namespace 的主体，而资产本身却不需要感知 namespace。这与基于标签的 IAM 策略有本质区别——Quick 的权限模型是路径式的，而非属性式的。

3. **OverridePermissions + OverrideParameters 的协同设计支持幂等迁移**

   OverrideParameters 处理的是「资源如何接入目标环境」——数据源连接、凭证、资源 ID 前缀策略；OverridePermissions 处理的是「谁可以访问这些资源」——主体 ARNs 与操作权限。两者同时使用才能实现真正的单次 API 调用完整迁移。这种设计将迁移流程从「导出→导入→授权」三步简化为一步，减少了资源在目标账户处于无保护状态的时间窗口，对安全敏感的多租户场景尤为重要。

4. **IncludeAllDependencies=True 是防止「幽灵引用」的关键保障**

   当 dashboard 依赖 dataset、dataset 依赖 datasource 时，如果只导出 dashboard，则导入后 dashboard 内部引用的 ARN 仍指向源账户的 dataset/datasource，而这些资源在目标账户不存在。这与 Git submodule 的依赖解析问题类似——必须带上完整的依赖图。Import 过程会自动重写 bundle 内资源的 ARN 引用，但无法补齐 bundle 之外的资源。

5. **命名空间身份隔离与 wildcard 授权的交互风险**

   Wildcard 主体 ARN（如 `arn:aws:quicksight:us-east-1:444444444444:user/HR/*`）可以简洁地授予当前及未来所有 HR namespace 用户访问权限，但这与「同一用户名在不同 namespace 是不同身份」的规则产生交互：若在 HR 和 Marketing 两个 namespace 都有 nikki_wolf，wildcard `HR/*` 只会匹配 HR 的那个。在设计 broad-access 模式时，需要确认 wildcard 的作用域是否符合预期，防止误将其他 namespace 的同名用户排除在外。

---

## 实践启示

1. **迁移脚本必须包含权限重建步骤**

   不要假设 Asset Bundle API 会迁移权限。应在 CI/CD pipeline 中将 `qs.update_dashboard_permissions()` 或 `OverridePermissions` 作为迁移后的必需步骤执行。建议在导出时记录所有源账户权限声明，导入后通过脚本批量重建。

2. **始终使用 IncludeAllDependencies=True，除非有明确理由不这么做**

   手动追踪依赖树容易出错，特别是当 dashboard 引用多层级的 dataset 和 filter 时。只有在明确需要目标账户已有独立数据源配置的场景下，才考虑单独导出 dashboard 并使用 OverrideParameters 映射到现有资源。

3. **跨账户迁移时优先使用 SecretArn 而非明文凭证**

   OverrideParameters 支持 `CredentialPair`、`CopySourceArn` 和 `SecretArn` 三种方式。在多租户或生产环境中，应使用 Secrets Manager 引用凭证，避免凭证在迁移配置中以明文形式传递。这与 AWS 安全最佳实践一致，也便于轮转。

4. **设计 multi-tenant 架构时，区分资产命名空间与身份命名空间

   资产（dashboard/analysis/dataset）放在账户级别，通过权限授权给各 namespace 的用户；不要在资产 ARN 中编码 namespace 信息。这样可以最大化跨 namespace 共享的灵活性，同时保持身份隔离。

5. **troubleshooting 时优先验证 ARN 匹配性**

   「Access denied」错误的首要排查步骤：确认被授权的主体 ARN 与实际用户 ARN 完全一致，包括 account ID 和 namespace。其次检查资源是否处于 restricted folder——folder 级别限制会覆盖 ARN 级别权限声明。 

## 相关实体
- [Restrict Access To Sensitive Documents In Your Amazon Quick Knowledge Bases For ](ch11/138-restrict-access-to-sensitive-documents-in-your-amazon-quick.html)
- [From Siloed Data To Unified Insights Cross Account Athena Access For Amazon Quic](../ch01/734-from-siloed-data-to-unified-insights-cross-account-athena-a.html)
- [Amazon Quick Research Agentic Multi Source Citation](ch11/213-amazon-quick.html)
- [Amazon Bedrock Cross Region Inference Cris Eu Gdpr](ch11/157-amazon-bedrock.html)
- [Build Real Time Voice Applications With Amazon Sagemaker Ai](../ch05/086-ai.html)

---

