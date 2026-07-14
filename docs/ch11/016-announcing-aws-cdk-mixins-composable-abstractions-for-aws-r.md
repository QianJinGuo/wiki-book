# Announcing AWS CDK Mixins: Composable Abstractions for AWS Resources

## Ch11.016 Announcing AWS CDK Mixins: Composable Abstractions for AWS Resources

> 📊 Level ⭐⭐ | 24.0KB | `entities/announcing-aws-cdk-mixins-composable-abstractions-for-aws-re.md`

## 背景
AWS 云开发套件（AWS Cloud Development Kit，CDK）是一个开源软件开发框架，用于以代码方式定义云基础设施，并通过 AWS CloudFormation 进行配置。CDK 包含预构建、模块化且可重用的云组件，称为构造块（constructs）。构造块是代表一个或多个 AWS CloudFormation 资源及其配置的基本构建单元。 
传统上，我们将 CDK 构造块组织为三个层级。L1 构造块直接映射到 CloudFormation 资源。L2 构造块提供更高级的抽象，包含便捷方法、安全默认配置和辅助函数。L3 构造块（也称为模式）组合多个资源以解决特定用例。然而，这种架构造成了一个根本性的权衡：你必须在即时访问新 AWS 功能（L1）和复杂抽象（L2/L3）之间做出选择。团队通常需要自定义 L2 构造块，重新构建整个构造块库以满足其特定需求。 
CDK Mixins 通过将抽象与构造块实现解耦来解决这个问题。与其将所有功能捆绑到单一的 L2 构造块中，Mixins 允许你精确组合所需的功能，将其应用于任何构造块类型，并保持对底层 CloudFormation 属性的完全访问。

## 什么是 CDK Mixins？
CDK Mixins 让你组合可重用的抽象，并将其应用于已创建的构造块。你可以混合搭配模块化功能，构建完全所需的基础设施。与捆绑所有功能的传统 L2 构造块不同，Mixins 让你可以细粒度控制应用的抽象。 
主要优势包括：

- **通用兼容性**：将相同的抽象应用于 L1 构造块、L2 构造块或自定义构造块
- **可组合设计**：混合搭配功能，无需继承不需要的行为
- **跨服务抽象**：创建跨不同 AWS 服务工作的自定义 mixins
- **Day-One 覆盖**：在保留现有 L2 或 L3 构造块的同时立即访问新 AWS 功能
- **类型安全**：保持编译时保证和 IDE 支持

## Mixins 和 Aspects
CDK Aspects 是一种对给定范围内所有构造块应用操作的方式，常用于验证、合规性和标记。Mixins 和 Aspects 是互补的。Mixins 立即将功能应用到特定构造块，而 Aspects 在合成期间跨范围强制执行规则。一个常见模式是使用 Mixins 配置资源，使用 Aspects 验证配置是否正确。

## 使用 CDK Mixins
CDK Mixins 随 aws-cdk-lib 一起提供，你通过已使用的相同导入访问服务特定的 mixins。它们适用于 L1、L2 和 L3 构造块：
```typescript 
import * as cdk from 'aws-cdk-lib/core'; 
import * as s3 from 'aws-cdk-lib/aws-s3'; 
import { CfnBucketPropsMixin } from '@aws-cdk/cfn-property-mixins/aws-s3'; 
// CDK Mixins can be used with L1s 
new s3.CfnBucket(stack, "MixinsL1DemoBucket") 
  // Use the fluent .with() syntax (available in JavaScript/TypeScript) 
  // .with() silently skips unsupported constructs 
  .with(new s3.mixins.BucketVersioning()); 
// ... or with L2s 
new s3.Bucket(stack, "MixinsL2DemoBucket") 
  // Cfn Property Mixins provide type-safe fallbacks for L2s 
  // and configuration after initial creation 
  .with(new CfnBucketPropsMixin({ 
    objectLockEnabled: true, 
    objectLockConfiguration: { 
      objectLockEnabled: "Enabled", 
      rule: { 
        defaultRetention: { 
          mode: "COMPLIANCE", 
          days: 30, 
        }, 
      }, 
    }, 
  })); 
``` 
你也可以使用 `Mixins.of()` 以其他语言应用 Mixins 或更好地控制哪些构造块接收 mixin：
```typescript 
// Use Mixins.of() to apply Mixins in other languages 
// This also gives you more options to apply only to certain constructs 
cdk.Mixins.of(stack, cdk.ConstructSelector.byId('MixinsL1DemoBucket')) 
  .apply(new s3.mixins.BucketAutoDeleteObjects()); 
``` 
大规模应用 mixins 到整个构造块树或特定资源类型： 
```typescript 
// Apply your Mixins to the whole app 
cdk.Mixins.of(app).apply(new MyDataRecovery()); 
// ... or only to some constructs 
cdk.Mixins.of(app, cdk.ConstructSelector.resourcesOfType(s3.CfnBucket.CFN_RESOURCE_TYPE_NAME)).apply(new MyDataRecovery()); 
``` 

## 创建自定义 Mixins
创建你自己的 Mixins 很简单；它们是扩展 cdk.Mixin 并实现 IMixin 接口的简单类。`supports()` 方法决定 mixin 可以应用于哪些构造块，`applyTo()` 就地修改构造块。这是一个在 Amazon S3 桶和 Amazon DynamoDB 表上启用数据恢复功能的自定义 mixin：
```typescript 
// It's easy to develop your own Mixins 
class MyDataRecovery extends cdk.Mixin implements IMixin { 
  public supports(construct: any): construct is s3.CfnBucket | dynamodb.CfnTable { 
    // Mixins can be cross-service and support different resources at once 
    return s3.CfnBucket.isCfnBucket(construct) || dynamodb.CfnTable.isCfnTable(construct); 
  } 
  // applyTo modifies the construct in place (returns void) 
  public applyTo(construct: IConstruct): void { 
    if (s3.CfnBucket.isCfnBucket(construct)) { 
      construct.versioningConfiguration = { 
        status: 'Enabled', 
      }; 
    } 
    if (dynamodb.CfnTable.isCfnTable(construct)) { 
      construct.pointInTimeRecoverySpecification = { 
        pointInTimeRecoveryEnabled: true, 
      }; 
    } 
  } 
} 
``` 
定义后，你可以将自定义 mixin 应用于资源： 
```typescript 
// ... and to use them: 
new s3.Bucket(stack, 'AcmeBucket'); 
new dynamodb.TableV2(stack, 'AcmeTable', { 
  partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }, 
}); 
// Apply your Mixins to the whole app 
cdk.Mixins.of(app).apply(new MyDataRecovery()); 
// ... or only to some constructs 
cdk.Mixins.of(app, cdk.ConstructSelector.resourcesOfType(s3.CfnBucket.CFN_RESOURCE_TYPE_NAME)).apply(new MyDataRecovery()); 
``` 
此模式使组织能够创建跨任何构造块类型工作的可重用抽象，确保整个基础设施的一致安全性和合规策略。

## Mixin 行为控制
使用三种不同模式控制如何应用 Mixins：graceful application、requireAll 和 requireAny。report getter 允许你检查哪些构造块已成功修改并添加自定义断言：
```typescript 
// Graceful: apply() silently skips unsupported constructs 
const logGroup = new logs.CfnLogGroup(stack, 'LogGroup'); 
cdk.Mixins.of(logGroup).apply(new s3.mixins.BucketAutoDeleteObjects()); 
// requireAll: Throws if ANY selected construct is not supported by the mixin 
cdk.Mixins.of(logGroup).apply(new s3.mixins.BucketAutoDeleteObjects()).requireAll(); 
// requireAny: Throws if NO selected construct is supported by the mixin 
cdk.Mixins.of(stack).apply(new s3.mixins.BucketVersioning()).requireAny(); 
``` 
使用 report getter 检查应用结果，使用 `selectedConstructs` getter 查看哪些构造块匹配选择器：
```typescript 
const applicator = cdk.Mixins.of(app, cdk.ConstructSelector.resourcesOfType(s3.CfnBucket.CFN_RESOURCE_TYPE_NAME)); 
const result = applicator.apply(new s3.mixins.BucketVersioning()); 
// See which constructs were matched by the selector 
console.table(applicator.selectedConstructs.map(c => c.node.path)); 
// Inspect which constructs were successfully modified, grouped by construct 
console.table(result.report.map(r => ({ construct: r.construct.node.path, mixin: util.inspect(r.mixin) }))); 
``` 
这种灵活性允许你为你的用例选择正确的行为，无论你是机会性地应用 Mixins、强制要求至少一个构造块匹配，还是要求每个选定的构造块都被支持。

## ECS ClusterSettings Mixin
`ClusterSettings` mixin 允许你将 Amazon ECS 集群设置（如增强型 Container Insights）应用于 L1 和 L2 集群。它智能地处理数组合并，按名称更新现有设置或附加新设置：
```typescript 
import * as ecs from 'aws-cdk-lib/aws-ecs'; 
import * as ec2 from 'aws-cdk-lib/aws-ec2'; 
// Works with L1 constructs 
new ecs.CfnCluster(stack, 'L1Cluster', { clusterName: 'my-cluster' }) 
  .with(new ecs.mixins.ClusterSettings([ 
    { name: 'containerInsights', value: 'enhanced' }, 
  ])); 
// Works with L2 constructs too 
new ecs.Cluster(stack, 'L2Cluster', { vpc, clusterName: 'my-cluster' }) 
  .with(new ecs.mixins.ClusterSettings([ 
    { name: 'containerInsights', value: 'enhanced' }, 
  ])); 
``` 

## S3 Mixins: PublicAccessBlock 和 BucketPolicyStatements
新的 S3 mixins 提供细粒度控制。`PublicAccessBlockMixin` 配置公共访问设置，`BucketPolicyStatements` 让你声明性地添加桶策略语句：
```typescript 
import * as s3 from 'aws-cdk-lib/aws-s3'; 
// Block all public access on S3 buckets 
new s3.CfnBucket(stack, 'SecureBucket') 
  .with(new s3.mixins.BucketBlockPublicAccess()); 
// Apply public access block across all S3 buckets in the app 
cdk.Mixins.of(app, cdk.ConstructSelector.resourcesOfType(s3.CfnBucket.CFN_RESOURCE_TYPE_NAME)) 
  .apply(new s3.mixins.BucketBlockPublicAccess()) 
  .requireAll(); 
``` 

## Vended Logs 和日志传递
在 CloudFormation 中设置 vended log delivery 通常需要协调多个资源 — AWS::Logs::DeliverySource、AWS::Logs::DeliveryDestination 和 AWS::Logs::Delivery 来连接它们 — 以及每个目标类型的正确 IAM 权限。你必须为每个要传递日志的资源重复此样板文件，且因服务而异。 
CDK Mixins 将此复杂性折叠为单个 `.with()` 调用。由于 Mixins 将日志传递抽象与任何特定构造块解耦，相同的模式适用于所有 47 个支持的 AWS 资源 — 无论你使用的是 L1 还是 L2 构造块。虽然仍处于预览阶段，但这是 Mixins 为何重要的最引人注目的例子之一：你获得了一个复杂的跨服务抽象，传统上需要每个资源都有专门的 L2 构造块支持。
```typescript 
// NOTE: Vended log delivery mixins are still in @aws-cdk/mixins-preview 
import * as wafv2Mixins from '@aws-cdk/mixins-preview/aws-wafv2/mixins'; 
// Set up vended log delivery to an S3 bucket 
const bucket = new s3.Bucket(stack, 'LogBucket'); 
new wafv2.CfnWebACL(stack, 'WebAcl', { /* ... */ }) 
  .with(new wafv2Mixins.CfnWebACLAccessLogs().toS3(bucket)); 
// Same pattern, different destination - works identically 
const logGroup = new logs.LogGroup(stack, 'LogGroup'); 
new wafv2.CfnWebACL(stack, 'WebAcl2', { /* ... */ }) 
  .with(new wafv2Mixins.CfnWebACLAccessLogs().toLogGroup(logGroup)); 
``` 
没有 Mixins，向 L1 构造块添加 vended log delivery 意味着要么等待 L2 支持，要么自己手动连接三个 CloudFormation 资源和权限。Mixins 让你可以将这种 L2 质量的抽象带到任何构造块。 
对于跨账户集中日志记录，`toDestination()` 方法将日志发送到预先创建的传递目标，这样你可以在不授予对目标资源直接访问的情况下在共享账户中聚合日志：
```typescript 
const destination = logs.CfnDeliveryDestination.fromDeliveryDestinationName( 
  stack, 'Dest', 'my-cross-account-destination' 
); 
new wafv2.CfnWebACL(stack, 'WebAcl3', { /* ... */ }) 
  .with(new wafv2Mixins.CfnWebACLAccessLogs().toDestination(destination)); 
``` 

## 开始使用
CDK Mixins 核心功能 — 包括 cdk.Mixins、`cdk.ConstructSelector` 和 `.with()` 语法 — 包含在 aws-cdk-lib 中。你通过标准服务导入（如 s3.mixins、ecs.mixins）访问服务 mixins。用于类型安全 L1 属性覆盖的 CloudFormation 属性 mixins 来自单独的 **@aws-cdk/cfn-property-mixins** 包。 
1. 安装包：`npm install aws-cdk-lib @aws-cdk/cfn-property-mixins` 
2. 从 aws-cdk-lib/core 导入核心类：`import * as cdk from 'aws-cdk-lib/core';` 
3. 服务特定的 mixins 命名空间在每个 aws-cdk-lib 服务模块下：`import * as s3 from 'aws-cdk-lib/aws-s3';` 
4. 对于 Cfn Property Mixins，从单独包导入：`import { CfnBucketPropsMixin } from '@aws-cdk/cfn-property-mixins/aws-s3';` 
5. 对于日志传递 mixins（预览），安装预览包：`npm install @aws-cdk/mixins-preview` 
6. 探索 CDK Mixins 包 README 获取详细示例和 API 参考

## 结论
CDK Mixins 代表了我们思考基础设施抽象的根本性转变。通过将功能与构造块实现解耦，Mixins 让你可以自由地精确组合所需的基础设施，无论你使用的是 L1 构造块访问新的 CloudFormation 资源、L2 构造块获得便捷性，还是自定义构造块满足企业需求。 
自最初的开发者预览以来，生态系统发展迅速：47 个资源的日志传递 mixins、26 个服务的 EventBridge 事件模式助手、ECS 集群设置、S3 安全 mixins 以及为 L1 构造块带来 L2 风格权限的资源策略特性。我们使用 requireAll/requireAny 完善了 API，以实现精确的行为控制和应用程序报告。

## 深度分析
1. **L1/L2 权衡的根本性突破**：CDK Mixins 解决了 CDK 架构中长期存在的核心矛盾——在 L1 的即时新功能访问和 L2/L3 的复杂抽象之间必须二选一。通过将抽象与构造块实现解耦，Mixins 允许团队在保持 L1 全部能力的同时，按需组合 L2 级别的功能，实现鱼与熊掌兼得。

2. **跨服务组合是核心价值主张**：文章中自定义 `MyDataRecovery` mixin 同时支持 S3 和 DynamoDB 的模式展示了 Mixins 的真正威力。传统上，跨服务的一致性需求（如灾备、标签策略、安全配置）需要在每个服务构建独立的 L2 变体。Mixins 使得创建真正跨服务的抽象成为可能，同时保持对底层资源的直接访问。

3. **vended logs 案例展示了 47 个资源抽象化的工程效率**：文章强调 vended log delivery mixins 适用于所有 47 个支持的 AWS 资源。这个数字揭示了 CDK 团队面临的工程规模挑战——如果没有 Mixins，每个资源都需要独立的 L2 构造块支持。Mixins 将这种 n×m 的复杂度降低为可管理的模式。

4. **Mixins 与 Aspects 的互补关系定义了清晰的使用边界**：文章明确指出 Mixins 用于立即配置特定构造块，Aspects 在合成期间跨范围强制规则。这种分工意味着 Mixins 解决"如何配置"问题，Aspects 解决"如何验证"问题——两者结合才能实现完整的基础设施治理。

5. **.with() 流式 API 的设计哲学**：文章多次强调 `.with()` 静默跳过不支持的构造块这一行为，配合 requireAll/requireAny 模式，显示了 API 设计对渐进式采用（progressive adoption）的重视。这允许团队从局部开始尝试，逐步扩展到整个组织，而不会因为部分资源不支持而导致部署失败。

6. **Cfn Property Mixins 的类型安全保证**：文章详细展示了 `@aws-cdk/cfn-property-mixins` 包提供的 `CfnBucketPropsMixin` 等类型安全的 L1 属性覆盖方案。这解决了 TypeScript 团队在直接操作 L1 构造块时失去编译期类型检查的痛点，使得使用 L1 构造块不再是"不安全"的代名词。

7. **批量应用的工程规模效应**：`ConstructSelector.resourcesOfType()` 允许跨整个应用树批量应用 Mixins，这意味着企业可以一次定义安全策略或合规要求，自动应用到所有相关资源，无需逐个修改。这种模式将配置工作从 O(n) 降低到 O(1)。

## 实践启示
1. **立即开始使用内置 Mixins**：从 aws-cdk-lib 的服务模块中已有的 mixins 开始（如 `s3.mixins.BucketVersioning`、`s3.mixins.BucketBlockPublicAccess`、`ecs.mixins.ClusterSettings`），无需等待 L2 支持即可获得 L2 级别的功能抽象。

2. **为跨服务横切关注点构建自定义 Mixins**：识别组织内多个 AWS 服务共享的一致性需求（如数据恢复、安全策略、标签规范），将其封装为自定义 Mixin。`MyDataRecovery` 示例展示了跨 S3 和 DynamoDB 的灾备抽象模式。

3. **用 Mixins + Aspects 替代复制粘贴的 L2 修改**：当团队需要修改 L2 构造块行为时，传统的做法是复制整个构造块代码库。现在应该优先使用 Mixins 组合所需功能，保持对原始 L2 的完整引用，同时避免维护分叉代码的负担。

4. **使用 ConstructSelector 实现精准的批量应用**：`cdk.Mixins.of(app, cdk.ConstructSelector.resourcesOfType(...)).apply(...).requireAll()` 模式允许在特定资源类型上全局应用 Mixins，适合企业级安全策略或标签规范的统一实施。

5. **利用 requireAny 确保关键抽象的全局生效**：当组织安全策略要求 S3 桶必须启用特定配置时，使用 `requireAny()` 模式可以确保至少有一些构造块成功应用 Mixin，同时通过 report getter 检查应用结果，实现透明的基础设施治理。

6. **利用预览包体验前沿功能**：`@aws-cdk/mixins-preview` 包中的 vended log delivery mixins 展示了未来方向。在生产环境中评估这些预览功能可以帮助团队提前规划迁移路径，同时为 CDK 社区提供反馈。

7. **使用 report getter 建立合规审计跟踪**：Mixins 的 `report` getter 记录了哪些构造块被成功修改，这对于基础设施合规审计和变更追踪非常有价值。结合 CI/CD 流水线可以建立完整的基础设施变更审计链。

## 迁移策略

### 从自定义 L2 变体迁移到 Mixins
对于已经维护自定义 L2 构造块库的组织，迁移到 Mixins 可以显著降低维护成本：

1. **识别横切关注点**：审计现有自定义 L2 中重复出现的模式（如统一的加密配置、标签策略、日志配置） 
2. **封装为 Mixin**：将这些横切关注点提取为独立的 Mixin 类 
3. **保留 L2 引用**：继续使用原生 L2 构造块，通过 `.with()` 应用自定义 Mixin 
4. **渐进式替换**：使用 `ConstructSelector` 在特定资源子集上先试用，确认后扩大范围 

### 从 Aspects 迁移配置逻辑
如果现有 Aspects 主要用于配置资源（而非验证），应考虑迁移到 Mixins：

| 场景 | 推荐方案 | 
|------|----------| 
| 资源配置 | Mixins（立即应用，精确控制） | 
| 跨范围验证 | Aspects（合成时统一执行） | 
| 标签应用 | Mixins（精确到资源级别） | 
| 合规检查 | Aspects（覆盖所有资源） | 

## 测试自定义 Mixins

自定义 Mixin 的测试策略应该覆盖以下维度： 

```typescript 
// 测试 Mixin 对目标类型的支持判断 
class MyDataRecovery extends cdk.Mixin implements IMixin { 
  public supports(construct: any): construct is s3.CfnBucket | dynamodb.CfnTable { 
    return s3.CfnBucket.isCfnBucket(construct) || dynamodb.CfnTable.isCfnTable(construct); 
  } 
  public applyTo(construct: IConstruct): void { 
    // 实现... 
  } 
} 

// 1. 测试 supports() 对支持类型的返回 true 
test('supports returns true for CfnBucket', () => { 
  const bucket = new s3.CfnBucket(stack, 'TestBucket'); 
  const mixin = new MyDataRecovery(); 
  expect(mixin.supports(bucket)).toBe(true); 
}); 

// 2. 测试 supports() 对不支持类型的返回 false 
test('supports returns false for LogGroup', () => { 
  const logGroup = new logs.CfnLogGroup(stack, 'TestLogGroup'); 
  const mixin = new MyDataRecovery(); 
  expect(mixin.supports(logGroup)).toBe(false); 
}); 

// 3. 测试 applyTo() 正确修改构造块 
test('applyTo enables versioning on CfnBucket', () => { 
  const bucket = new s3.CfnBucket(stack, 'TestBucket'); 
  const mixin = new MyDataRecovery(); 
  mixin.applyTo(bucket); 
  expect(bucket.versioningConfiguration).toEqual({ status: 'Enabled' }); 
}); 
``` 

## 与 CDK Pipelines 的集成

CDK Mixins 可以与 CDK Pipelines 无缝集成，在部署流水线中实现动态基础设施配置：

```typescript 
import * as pipelines from 'aws-cdk-lib/pipelines'; 
import * as cdk from 'aws-cdk-lib/core'; 

class ProductionMixins extends cdk.Mixin implements IMixin { 
  public supports(construct: any): boolean { 
    return s3.CfnBucket.isCfnBucket(construct); 
  } 
  public applyTo(construct: IConstruct): void { 
    if (s3.CfnBucket.isCfnBucket(construct)) { 
      construct.lifecycleRules = [{ 
        expiration: cdk.Duration.days(90), 
      }]; 
    } 
  } 
} 

class PipelineStack extends cdk.Stack { 
  constructor(scope: Construct, id: string, props?: cdk.StackProps) { 
    super(scope, id, props); 

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', { 
      // ... pipeline configuration 
    }); 

    // 在每个阶段应用不同的 Mixin 组合 
    pipeline.addStage('Production', { 
      post: [ 
        new cdk.AspectOf(() => { 
          cdk.Mixins.of(this, cdk.ConstructSelector.resourcesOfType(s3.CfnBucket.CFN_RESOURCE_TYPE_NAME)) 
            .apply(new ProductionMixins()); 
        }), 
      ], 
    }); 
  } 
} 
``` 

## 生态系统现状与路线图

截至文章发布时（2026 年 5 月），CDK Mixins 生态系统已包含：

| 类别 | 数量 | 示例 | 
|------|------|------| 
| 日志传递 Mixins | 47 个资源 | `CfnWebACLAccessLogs`, `CfnFlowLogAccessLogs` | 
| EventBridge 助手 | 26 个服务 | 事件模式构建器 | 
| ECS 集群设置 | 1 个服务 | `ClusterSettings` | 
| S3 安全 Mixins | 多个 | `BucketBlockPublicAccess`, `BucketVersioning` | 
| 资源策略特性 | L1 构造块 | L2 风格的权限抽象 | 

官方路线图显示未来将扩展： 

- 更多 AWS 服务的原生 Mixin 支持
- 与 CDK Knit （CDK 的高级抽象层）更深层次的集成
- 更好的 Java/Python/.NET 多语言支持
- Mixin 市场/社区分享平台

## 关联阅读
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/announcing-aws-cdk-mixins-composable-abstractions-for-aws-resources-amazon-web-s.md)
- [CDK Mixins 文档](https://github.com/aws/aws-cdk/tree/main/packages/aws-cdk-lib#mixins)
- [CDK Mixins RFC](https://github.com/aws/aws-cdk-rfcs/pull/824)

## 相关实体
- `AI安全全景` — 基础设施安全与AI防护的交叉领域
- `Harness架构` — 云原生基础设施的抽象设计
## 相关实体
- [Announcing Aws Cdk Mixins Composable Abstractions For Aws Resources Amazon Web S](ch11/016-announcing-aws-cdk-mixins-composable-abstractions-for-aws-r.html)
- [Cost Effective Deployment Of Vision Language Models For Pet Behavior Detection O](ch11/197-cost-effective-deployment-of-vision-language-models-for-pet.html)
- [Us Bank Aws Ai Migration](../ch05/085-ai.html)
- [3Rdfsmp](https://github.com/QianJinGuo/wiki/blob/main/entities/3rdfsmp.md)
- [Announcing Openai Compatible Api Support For Amazon Sagemaker](../ch01/711-announcing-openai-compatible-api-support-for-amazon-sagemake.html)

---

