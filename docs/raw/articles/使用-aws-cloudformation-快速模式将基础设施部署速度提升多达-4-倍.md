---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/accelerate-your-infrastructure-deployments-by-up-to-4x-with-aws-cloudformation-express-mode
ingested: 2026-07-05
feed_name: AWS China Blog
source_published: 2026-06-30
sha256: "7cdefa982cc14a468f7e40d28b942f8c827fbe2a54d7fa5cdec214d7e5c5ed0c"
---

# 使用 AWS CloudFormation 快速模式将基础设施部署速度提升多达 4 倍

今天，我们宣布推出 [AWS CloudFormation](<https://aws.amazon.com/cloudformation/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 快速模式，这是一种新的部署模式，可以为反复调试基础设施的开发人员和人工智能工具加快部署速度。在快速模式下，CloudFormation 只要确认资源配置已完成下发，部署任务即可结束，无需等待漫长的稳定性检查。对于迭代开发工作流程和生产场景，部署时间最多可缩短至原来的四分之一。  
  
**_工作原理_**  
所有 CloudFormation 部署在应用资源配置后，都会执行稳定性检查。如果您需要在切换负载前确认资源具备提供流量的能力，这些检查能够发挥重要作用。

但是，许多工作流程不需要完全稳定即可继续进行。快速模式有两个主要的使用场景：迭代开发工作流程以及您能够接受最终稳定状态的生产场景。这些使用场景包括在开发期间迭代基础设施配置、测试应用程序的各个组件，以及受益于亚分钟反馈回路的人工智能辅助基础设施开发。

在快速模式下，CloudFormation 可以在应用资源配置时完成部署，无需等待稳定性检查。资源会在后台继续变为可用状态。对于在同一堆栈内预置依赖项时出现的临时性故障，CloudFormation 会自动重试依赖的资源，无需客户进行任何干预。这种内置的韧性可以在资源稳定时处理资源之间的时序问题。快速模式会改变部署完成的 _时间_ ，不会改变资源的预置 _方式_ 。

例如，当我使用死信队列（DLQ）创建 [Amazon Simple Queue Service（SQS）](<https://aws.amazon.com/sqs/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)队列时，标准模式需要 64 秒，但快速模式在 10 秒钟内就能完成。如果删除带有网络接口附件的 [AWS Lambda](<https://aws.amazon.com/lambda/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 函数，标准模式需要 20—30 分钟，但根据我的基准测试，快速模式最多需要 10 秒即可完成。

**_CloudFormation 快速模式入门_**  
在 [AWS 管理控制台](<https://console.aws.amazon.com/cloudformation/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)中创建 CloudFormation 堆栈时，在**堆栈部署选项** 下的**快速模式** 中选择**启用** 。

您还可以使用 [AWS 命令行界面（AWS CLI）](<https://aws.amazon.com/cli/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)、[AWS SDK](<https://builder.aws.com/build/tools#SDKs?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 或 [AWS 云开发工具包（CDK）](<https://aws.amazon.com/cdk/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)，以及 [Kiro](<https://kido.dev/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 等人工智能工具来启用该模式。

在创建、更新或删除堆栈时，将参数 `--deployment-config` 设置为 `EXPRESS` 即可激活快速模式。无需更改模板。为保障快速迭代体验，快速模式默认禁用回滚功能。要重新启用回滚功能，请在生产环境的部署 `deployment-config` 中将 `disableRollback` 设置为 `false`，或者对失败的部署实施监控/清理机制。
    
    
    aws cloudformation create-stack \ 
       --stack-name my-app \ 
       --template-body file://template.yaml \ 
       --deployment-config '{"mode": "EXPRESS", "disableRollback": true}' \

例如，在逐步构建基础架构时使用快速模式，一次添加一个资源。确保您的 IAM 角色模板遵循最低权限原则。
    
    
    # Iteration 1: Deploy IAM role
    aws cloudformation create-stack \
    --stack-name my-microservice \
    --template-body file://iteration1-iam.yaml \
    --deployment-config '{"mode": "EXPRESS"}' \
    --capabilities CAPABILITY_IAM
    --role-arn arn:aws:iam::123456789012:role/CloudFormationDeployRole
    
    # Iteration 2: Add Lambda function
    aws cloudformation update-stack \
    --stack-name my-microservice \
    --template-body file://iteration2-lambda.yaml \
    --deployment-config '{"mode": "EXPRESS"}' \
    --capabilities CAPABILITY_IAM
    --role-arn arn:aws:iam::123456789012:role/CloudFormationDeployRole
    
    # Iteration 3: Add SQS queue and event source mapping
    aws cloudformation update-stack \
    --stack-name my-microservice \
    --template-body file://iteration3-sqs.yaml \
    --deployment-config '{"mode": "EXPRESS"}' \
    --capabilities CAPABILITY_IAM
    --role-arn arn:aws:iam::123456789012:role/CloudFormationDeployRole

对于 AWS CDK，在部署 CDK 堆栈时使用 `cdk deploy --express` 命令激活快速模式。此命令将检索您生成的 CloudFormation 模板并通过 CloudFormation 快速模式部署该模板，该模式会将您的资源作为 CloudFormation 堆栈的一部分进行预配置。

快速模式适用于所有现有的 CloudFormation 模板，并支持所有 CloudFormation 功能，包括变更集和嵌套堆栈。当您在父堆栈上启用快速模式时，所有嵌套堆栈也将使用快速模式。如果您需要资源完全就绪后才能继续处理流量或开展测试，请继续使用默认部署行为，该行为会在完成之前执行稳定性检查。

**_现已推出_**  
AWS CloudFormation 快速模式现已在所有 AWS 商业区域推出，无需额外付费。有关区域可用性和未来路线图，请访问[按区域列出的 AWS 功能](<https://builder.aws.com/build/capabilities/explore?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。如果您想调用 API、搜索文档、查找区域可用性并查看有关此新功能的疑难解答，请尝试在首选人工智能工具中使用 [AWS MCP 服务器](<https://docs.aws.amazon.com/agent-toolkit/latest/userguide/getting-started-aws-mcp-server.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)和[插件](<https://docs.aws.amazon.com/agent-toolkit/latest/userguide/plugins.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。要了解更多信息，请访问 [CloudFormation 文档](<https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。

立即开始加快部署，并向 [AWS re:Post for AWS CloudFormation](<https://repost.aws/tags/TAm3R3LNU3RfSX9L23YIpo3w/aws-cloudformation?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 或通过您常用的 AWS Support 联系方式发送反馈。

— [Channy](<https://linkedin.com/in/channy>)
