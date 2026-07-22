---

title: "Announcing AWS CDK Mixins: Composable Abstractions for AWS Resources | Amazon Web Services"
type: raw
source: newsletter
source_url: https://aws.amazon.com/blogs/devops/announcing-aws-cdk-mixins-composable-abstractions-for-aws-resources/
tags: [aws-china-blog, agentic-ai, context-engineering]
ingested: 2026-05-20
sha256: 8cb18a8f4248d1de

---
Title: Announcing AWS CDK Mixins: Composable Abstractions for AWS Resources | Amazon Web Services
URL Source: https://aws.amazon.com/blogs/devops/announcing-aws-cdk-mixins-composable-abstractions-for-aws-resources/
Published Time: 2026-05-18T05:53:57-07:00
Markdown Content:
We are excited to announce [CDK Mixins](https://docs.aws.amazon.com/cdk/v2/guide/mixins.html), a feature of the [AWS Cloud Development Kit (CDK)](https://docs.aws.amazon.com/cdk/v2/guide/home.html) that fundamentally changes how you compose and reuse infrastructure abstractions. In this post, you will learn how to use CDK Mixins to apply sophisticated features to any construct – whether L1, L2, or custom – without being locked into specific implementations.
## Background
The AWS Cloud Development Kit (CDK) is an open-source software development framework for defining cloud infrastructure in code and provisioning it through [AWS CloudFormation](https://aws.amazon.com/cloudformation/). It contains pre-written, modular, and reusable cloud components known as [constructs](https://docs.aws.amazon.com/cdk/v2/guide/constructs.html). Constructs are the basic building blocks representing one or more AWS CloudFormation resources and their configuration.
Traditionally, we organize CDK constructs into three levels. L1 constructs map directly to CloudFormation resources. L2 constructs offer higher-level abstractions with convenience methods, security defaults, and helper functions. L3 constructs (also known as patterns) combine multiple resources to solve specific use cases. However, this architecture creates a fundamental trade-off: you must choose between immediate access to new AWS features (L1) and sophisticated abstractions (L2/L3). Teams often need to customize L2 constructs, rebuilding entire construct libraries to meet their specific requirements.
CDK Mixins solve this problem by decoupling abstractions from construct implementations. Instead of bundling all features into monolithic L2 constructs, Mixins allow you to compose exactly the capabilities you need, apply them to any construct type, and maintain full access to underlying CloudFormation properties.
## What are CDK Mixins?
CDK Mixins let you compose reusable abstractions and apply them to constructs after creation. You mix and match modular capabilities to build exactly the infrastructure you need. Unlike traditional L2 constructs that bundle all features together, Mixins give you fine-grained control over which abstractions apply.
Key benefits include:
*   **Universal Compatibility**: Apply the same abstractions to L1 constructs, L2 constructs, or custom constructs
*   **Composable Design**: Mix and match features without inheriting unwanted behaviors
*   **Cross-Service Abstractions**: Create custom mixins that work across different AWS services
*   **Day-One Coverage**: Access new AWS features immediately while keeping existing L2 or L3 constructs
*   **Type Safety**: Maintain compile-time guarantees and IDE support
## Mixins and Aspects
[CDK Aspects](https://docs.aws.amazon.com/cdk/v2/guide/aspects.html) are a way to apply an operation to all constructs in a given scope, commonly used for validation, compliance, and tagging. Mixins and Aspects are complementary. Mixins apply features immediately to specific constructs, while Aspects enforce rules broadly across a scope during synthesis. A common pattern is to use Mixins to configure resources and Aspects to validate that the configuration is correct.
## Using CDK Mixins
CDK Mixins ship with aws-cdk-lib, and you access service-specific mixins through the same imports you already use. They work across L1, L2, and L3 constructs:
```
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
TypeScript
You can also use `Mixins.of()` to apply Mixins in other languages or with more control over which constructs receive the mixin:
```
// Use Mixins.of() to apply Mixins in other languages
// This also gives you more options to apply only to certain constructs
cdk.Mixins.of(stack, cdk.ConstructSelector.byId('MixinsL1DemoBucket'))
  .apply(new s3.mixins.BucketAutoDeleteObjects());
```
TypeScript
Apply mixins at scale to entire construct trees or specific resource types:
```
// Apply your Mixins to the whole app
cdk.Mixins.of(app).apply(new MyDataRecovery());
// ... or only to some constructs
cdk.Mixins.of(app, cdk.ConstructSelector.resourcesOfType(s3.CfnBucket.CFN_RESOURCE_TYPE_NAME)).apply(new MyDataRecovery());
```
TypeScript
## Creating Custom Mixins
Creating your own Mixins is straightforward; they are simple classes extending cdk.Mixin and implementing the IMixin interface. The `supports()` method determines which constructs the mixin can apply to, and `applyTo()` modifies the construct in place. Here’s a custom mixin that enables data recovery features across both [Amazon Simple Storage Service (Amazon S3)](https://aws.amazon.com/s3/) buckets and [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) tables:
```
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
TypeScript
Once defined, you can apply your custom mixin to resources:
```
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
TypeScript
This pattern enables organizations to create reusable abstractions that work across any construct type, ensuring consistent security and compliance policies throughout their infrastructure.
## Mixin Behavior Control
Control how to apply Mixins with three distinct modes: graceful application, requireAll, and requireAny. The report getter lets you inspect which constructs were successfully modified and add custom assertions:
```
// Graceful: apply() silently skips unsupported constructs
const logGroup = new logs.CfnLogGroup(stack, 'LogGroup');
cdk.Mixins.of(logGroup).apply(new s3.mixins.BucketAutoDeleteObjects());
// requireAll: Throws if ANY selected construct is not supported by the mixin
cdk.Mixins.of(logGroup).apply(new s3.mixins.BucketAutoDeleteObjects()).requireAll();
// requireAny: Throws if NO selected construct is supported by the mixin
cdk.Mixins.of(stack).apply(new s3.mixins.BucketVersioning()).requireAny();
```
TypeScript
Use the report getter to inspect application results and the `selectedConstructs` getter to see which constructs matched the selector:
```
const applicator = cdk.Mixins.of(app, cdk.ConstructSelector.resourcesOfType(s3.CfnBucket.CFN_RESOURCE_TYPE_NAME));
const result = applicator.apply(new s3.mixins.BucketVersioning());
// See which constructs were matched by the selector
console.table(applicator.selectedConstructs.map(c => c.node.path));
// Inspect which constructs were successfully modified, grouped by construct
console.table(result.report.map(r => ({ construct: r.construct.node.path, mixin: util.inspect(r.mixin) })));
```
TypeScript
This flexibility allows you to choose the right behavior for your use case, whether you want to apply Mixins opportunistically, enforce that at least one construct matches, or require that every selected construct is supported.
## ECS ClusterSettings mixin
The `ClusterSettings` mixin enables you to apply [Amazon ECS](https://aws.amazon.com/ecs/) cluster settings like enhanced Container Insights to both L1 and L2 clusters. It handles array merging intelligently, updating existing settings by name or appending new ones:
```
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
TypeScript
## S3 mixins: PublicAccessBlock and BucketPolicyStatements
New S3 mixins provide fine-grained controls. The `PublicAccessBlockMixin` configures public access settings, and the `BucketPolicyStatements` lets you add bucket policy statements declaratively:
```
import * as s3 from 'aws-cdk-lib/aws-s3';
// Block all public access on S3 buckets
new s3.CfnBucket(stack, 'SecureBucket')
  .with(new s3.mixins.BucketBlockPublicAccess());
// Apply public access block across all S3 buckets in the app
cdk.Mixins.of(app, cdk.ConstructSelector.resourcesOfType(s3.CfnBucket.CFN_RESOURCE_TYPE_NAME))
  .apply(new s3.mixins.BucketBlockPublicAccess())
  .requireAll();
```
TypeScript
## Vended logs and log delivery
Setting up [vended log delivery](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AWS-logs-and-resource-policy.html) in CloudFormation typically requires coordinating multiple resources – AWS::Logs::DeliverySource, AWS::Logs::DeliveryDestination, and AWS::Logs::Delivery to connect them – along with the correct IAM permissions for each destination type. You must repeat this boilerplate for every resource you want to deliver logs from, and it varies by service.
CDK Mixins collapse this complexity into a single `.with()` call. Because Mixins decouple the log delivery abstraction from any specific construct, the same pattern works across all 47 supported AWS resources – whether you’re using L1 or L2 constructs. While still in preview, this is one of the most compelling examples of why Mixins matter: you get a sophisticated, cross-service abstraction that would traditionally require dedicated L2 construct support for each of those 47 resources.
```
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
TypeScript
Without Mixins, adding vended log delivery to an L1 construct would mean either waiting for L2 support or manually wiring up the three CloudFormation resources and permissions yourself. Mixins let you bring this L2-quality abstraction to any construct immediately.
For cross-account centralized logging, the toDestination() method sends logs to a pre-created delivery destination, so you can aggregate logs in a shared account without granting direct access to the destination resource:
```
const destination = logs.CfnDeliveryDestination.fromDeliveryDestinationName(
  stack, 'Dest', 'my-cross-account-destination'
);
new wafv2.CfnWebACL(stack, 'WebAcl3', { /* ... */ })
  .with(new wafv2Mixins.CfnWebACLAccessLogs().toDestination(destination));
```
TypeScript
## Getting Started
CDK Mixins core functionality – including cdk.Mixins, `cdk.ConstructSelector`, and the `.with()` syntax – is included in aws-cdk-lib. You access service mixins through standard service imports (e.g. s3.mixins, ecs.mixins). CloudFormation property mixins for type-safe L1 property overrides come from the separate **@aws-cdk/cfn-property-mixins** package.
1.   Install the packages: `npm install aws-cdk-lib @aws-cdk/cfn-property-mixins`Bash  
2.   Import core classes from aws-cdk-lib/core: ```
import * as cdk from 'aws-cdk-lib/core';
// e.g. cdk.Mixins, cdk.ConstructSelector, cdk.Mixin
```
TypeScript  
3.   Service-specific mixins are namespaced under mixins in each aws-cdk-lib service module: ```
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ecs from 'aws-cdk-lib/aws-ecs';
// e.g. s3.mixins.BucketVersioning, ecs.mixins.ClusterSettings
```
TypeScript  
4.   For Cfn Property Mixins, import from the separate package: `import { CfnBucketPropsMixin } from '@aws-cdk/cfn-property-mixins/aws-s3';`TypeScript  
5.   For log delivery mixins (preview), install the preview package: `npm install @aws-cdk/mixins-preview`Bash  `import * as wafv2Mixins from '@aws-cdk/mixins-preview/aws-wafv2/mixins';`TypeScript  
6.   Explore the [CDK Mixins package README](https://github.com/aws/aws-cdk/tree/main/packages/@aws-cdk/mixins-preview) for detailed examples and API references.
## Conclusion
CDK Mixins represent a fundamental shift in how we think about infrastructure abstractions. By decoupling capabilities from construct implementations, Mixins give you the freedom to compose exactly the infrastructure you need whether you are using L1 constructs for access to new CloudFormation resources, L2 constructs for convenience, or custom constructs for enterprise requirements.
Since the initial developer preview, the ecosystem has grown rapidly: log delivery mixins for 47 resources, EventBridge event pattern helpers for 26 services, ECS cluster settings, S3 security mixins, and resource policy traits that bring L2-style permissions to L1 constructs. We refined the API with requireAll/requireAny for precise behavior control and application reporting.
We are excited to see what the community builds with CDK Mixins. Share your feedback, create custom Mixins, and help shape the future of infrastructure as code with AWS CDK.
For more information, check out:
*   [CDK Mixins Documentation](https://github.com/aws/aws-cdk/tree/main/packages/aws-cdk-lib#mixins)
*   [CDK Mixins RFC](https://github.com/aws/aws-cdk-rfcs/pull/824)