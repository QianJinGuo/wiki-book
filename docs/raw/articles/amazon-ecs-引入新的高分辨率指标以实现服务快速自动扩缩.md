---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/amazon-ecs-introduces-new-high-resolution-metrics-for-faster-service-auto-scaling/
ingested: 2026-06-26
feed_name: AWS China Blog
source_published: 2026-06-26T07:57:47Z
sha256: 5024ff772dd75a7bf6bb22e3f7a6affa43e6e5d5921163261afd33a2723bb2de
---

# Amazon ECS 引入新的高分辨率指标，以实现服务快速自动扩缩

[Amazon Elastic Container Service（Amazon ECS）服务自动扩缩](<https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html>)可通过全面的扩展策略自动调整任务数量来满足工作负载需求，这些策略包括针对周期性流量的预测性扩展、针对计划活动的计划扩展，以及基于实时指标动态扩展的目标跟踪。

您可以选择主动扩展（使用[预测性扩展](<https://docs.aws.amazon.com/AmazonECS/latest/developerguide/predictive-auto-scaling.html>)（自动）和[计划扩展](<https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-autoscaling-schedulescaling.html>)（客户定义）），也可以选择被动扩展（使用[目标跟踪](<https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-autoscaling-targettracking.html>)，仅对某个目标进行扩展）。Amazon ECS 服务自动扩缩可以根据 [Amazon CloudWatch](<https://aws.amazon.com/cloudwatch/>) 指标来调整 ECS 服务中的任务数量，如平均 CPU/内存使用率、每个目标的请求数、队列深度等自定义指标或使用高级机器学习（ML）算法预测的需求激增。

本次发布后，Amazon ECS 服务自动扩缩现在支持高分辨率（20 秒）指标和指标发布优化，可以更快地检测和响应负载变化。在 AWS 基准测试中，触发横向扩展的时间从 363 秒缩短到 86 秒（快 76%，效率提升 4.2 倍），扩展和配置新任务的总时间从 386 秒缩短到 109 秒（快 72%，效率提升 3.5 倍）

此次发布为您的应用程序带来了三个关键好处：

  * **提高性能和可靠性** ：快速扩展意味着您的应用程序可以更快响应需求激增，从而减少需求激增期间最终用户的延迟或故障。
  * **在不影响性能的情况下合理调整资源** ：根据工作负载的不同，您可以减少基准任务数量，因为现在横向扩展的速度足够快，无需提前预留容量即可应对流量峰值。这可以直接降低计算成本，同时保持应用程序的性能和可用性。
  * **简化扩展配置** ：使用高分辨率指标进行目标跟踪可以实现以前需要自定义扩展配置（如使用步进扩展策略）才能达到的灵敏扩展效果。仅需一处配置变更即可替代大量定制工程工作。



**_工作原理_**  
要使用 ECS 快速服务自动扩缩，请先为您的 ECS 服务启用高分辨率指标，然后配置使用高分辨率指标的目标跟踪扩展策略。ECS 快速服务自动扩缩适用于 ECS 上的所有计算选项：[AWS Fargate ](<https://aws.amazon.com/fargate/>)、[ECS 托管实例](<https://aws.amazon.com/ecs/managed-instances/>)和 [Amazon Elastic Compute Cloud（Amazon EC2）](<https://aws.amazon.com/ec2>)。当您在 [Amazon ECS 控制台](<https://console.aws.amazon.com/ecs>)中创建或更新 ECS 服务，或者使用 [AWS SDK 和工具](<https://docs.aws.amazon.com/sdkref/latest/guide/version-support-matrix.html>)以及 [AWS CloudFormation](<https://aws.amazon.com/cloudformation/>) 时，可以启用这些指标。

在控制台中创建服务时，在**监控配置** 部分添加 20 秒分辨率指标。这些指标会产生额外的 CloudWatch 费用，而标准分辨率（60 秒）是免费的。

在**服务自动扩缩** 部分中，选中**使用服务自动扩缩** ，然后为扩展策略类型选择**目标跟踪** ，以使用实时数据，根据需求扩展服务运行的任务数量。

然后，为目标跟踪选择**扩展策略类型** 。您可以选择 `ECSServiceAverageCPUUtilizationHighResolution` 或 `ECSServiceAverageMemoryUtilizationHighResolution` 作为新指标。

配置完成，您的 ECS 服务将使用高分辨率指标进行自动扩缩。

要更新现有 ECS 服务以使用速度更快的自动扩缩功能，首先需要通过**更新服务** 配置高分辨率指标。部署完成后，您的服务将生成高分辨率指标。然后，您可以从服务详细信息中转到**服务和自动扩缩** 选项卡，更新扩展策略以使用更高的分辨率指标。

这就是您需要进行的所有操作。现在，您的 ECS 服务会每隔 20 秒评估一次扩展决策。

您还可以使用 [AWS 命令行界面（AWS CLI）](<https://aws.amazon.com/cli>)，通过应用程序自动扩缩在 ECS 服务中启用新指标。要了解更多信息，请访问[快速自动扩缩文档](<https://docs.aws.amazon.com/AmazonECS/latest/developerguide/target-tracking-faster-auto-scaling.html>)。

**_现已推出_**  
Amazon ECS 现已推出具有高分辨率指标的快速服务自动扩缩功能。该功能本身没有额外费用，但高分辨率 CloudWatch 指标会产生新的定价维度。有关详细信息，请参阅 [CloudWatch 定价](<https://aws.amazon.com/cloudwatch/pricing/>)页面。

欢迎立即试用，并将反馈发送给 [AWS re:Post for ECS](<https://repost.aws/tags/TAefn4YSprR-uCBYmbofOpHw/amazon-elastic-container-service?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 或通过常用的 AWS Support 联系方式发送。

– [Channy](<https://linkedin.com/in/channy>)
