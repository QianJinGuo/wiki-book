---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/blog-bedrock-per-bu-cost-alarms
ingested: 2026-06-30
feed_name: AWS China Blog
source_published: 2026-06-22
sha256: b97f8d095de0669a
---

# 基于 Application Inference Profile 为 Amazon Bedrock 构建分业务单元的近实时成本告警

摘要：本文介绍一种轻量、旁路、近实时的方案：调用方直连 Amazon Bedrock，链路上没有代理；用 Application Inference Profile 做分 BU 的用量归因；直接在 Amazon CloudWatch metric math 告警里把 token 数换算成估算成本；再通过一个通用的通知 Lambda 函数把告警状态变更转发到协作工具（本文以飞书为例，同样适用于weixin、dingtalk、Slack、Microsoft Teams 或邮件）。  
  
01 一、背景与挑战

02 二、原理：为什么能按 BU 分开计量

03 三、方案概览

04 四、前置条件

05 五、部署指南

06 六、工作原理

07 七、验证

08 八、注意事项与限制

09 九、清理

10 十、小结

11 十一、参考资料

* * *

## **一、背景与挑战**

当多个团队或业务单元（Business Unit，简称 BU）共享同一个 [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 模型时，账户级别的整体成本视图往往不够用。我们通常希望：在某个 BU 的花费异常上涨时，能在几分钟内（而不是等账单出来）收到告警；告警落到团队日常使用的协作工具里；并且一眼看出是哪个 BU、哪个模型触发的。

实现这个目标，常见的几类做法各有取舍：

  * 基于账单的方式（成本分配标签、AWS Budgets、AWS Cost Explorer）：准确，但有数小时延迟，回答的是”昨天花费多少”，而不是”BU1 现在正在以什么速度花钱”。
  * 代理／网关方式：在推理调用链路上加一层组件来计量和限额。它适合做硬性预算阻断，但给每次请求都引入了额外延迟、单点故障和负载大小限制。



本文介绍一种轻量、旁路、近实时的方案：调用方直连 Amazon Bedrock，链路上没有代理；用 Application Inference Profile 做分 BU 的用量归因；直接在 [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/>) metric math 告警里把 token 数换算成估算成本；再通过一个通用的通知 Lambda 函数把告警状态变更转发到协作工具（本文以飞书为例，同样适用于weixin、dingtalk、Slack、Microsoft Teams 或邮件）。整套方案用两条 `aws cloudformation deploy` 命令部署。

## **二、原理：为什么能按 BU 分开计量**

Bedrock支持在原始基础模型基础上封装一层Application Inference Profile给不同的应用分开使用，通过 Application Inference Profile 调用模型时，Amazon Bedrock 在原生 `AWS/Bedrock` 命名空间下发出的 token 指标（`InputTokenCount`、`OutputTokenCount`、`CacheReadInputTokens`、`CacheWriteInputTokens`），其 `ModelId` 维度的取值是该 Application Inference Profile 的 ID——一个形如 `j2whxxxxjdp4` 的短标识，而不是原始底层基础模型的 ModelID。

因为有这个特性，给每个 BU 分配独立的 Application Inference Profile 后，每个 BU 的 token 用量在 CloudWatch 里就是互相隔离的独立指标流。于是可以为每个 BU 建一个独立的 CloudWatch 告警，用 metric math 表达式把 token 数换算成估算金额，不需要发布自定义指标，也不需要运行计量服务。

## **三、方案概览**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/12/based-on-application-inference-profile-amazon-bedrock-build-real-time-cost-alert-1.jpg>) [图1 整体架构]  
---  
  
方案分为两层：

  * 共享层（每个区域部署一次）：一个 [Amazon SNS](<https://aws.amazon.com/cn/sns/>) 主题和一个通用通知 Lambda 函数。这一层不含业务配置。
  * 分 BU 层（每个 BU 部署一次）：一个 application inference profile，加上一个接到共享 SNS 主题的 metric math 成本告警。



### 3.1 通用通知组件

通知 Lambda 函数里不硬编码任何模型名、BU 名、阈值或单价。告警通知消息里展示的每个字段，都来自以下两个来源之一：

消息字段 | 来源  
---|---  
业务单元、模型 | 从**告警名称** 解析（`BedrockCost-<BU>-<Model>-<Region>`）  
状态、区域、时间、当前成本、阈值 | 从 **SNS 消息体** 读取  
评估窗口（如”当前 60 分钟”） | 由消息体里的 `Trigger.Period` 推导  
说明文案 | 告警自身的 `AlarmDescription` 字段  
  
由于所有业务语义都落在告警上（告警的名称与配置），新增一个 BU 或更换一个模型时，不需要改动 Lambda 函数。运维人员只维护告警，通知组件保持不变。

## **四、前置条件**

  * 一个具备 Amazon Bedrock、CloudWatch、SNS、Lambda 和 IAM 权限的 AWS 账户。
  * 已安装并配置 AWS CLI。
  * 一个协作工具的 Webhook（本文使用飞书群机器人 Webhook，并在机器人的关键词过滤中加入了关键词 `Bedrock`）。
  * 你要包装的 system-defined（跨区域）inference profile 的 ARN，例如 `arn:aws:bedrock:us-east-1::inference-profile/global.amazon.nova-2-lite-v1:0`。



## **五、部署指南**

方案以两个 [AWS CloudFormation](<https://aws.amazon.com/cn/cloudformation/>) 模板交付：`[shared.yaml](<https://doc.ethanlin.cn/doc/shared.yaml>)` 和 `bu.yaml`。

### 5.1 步骤 1：部署共享基础设施（一次）
    
    
    aws cloudformation deploy \
      --template-file shared.yaml \
      --stack-name bedrock-cost-shared \
      --parameter-overrides FeishuWebhookUrl="https://open.feishu.cn/open-apis/bot/v2/hook/XXXX" \
      --capabilities CAPABILITY_IAM \
      --region us-east-1
    

这一步创建 SNS 主题、通知 Lambda 函数（代码内联在模板中）、IAM 角色，以及 SNS 到 Lambda 的订阅。主题 ARN 会被导出，供分 BU 栈引用。

### 5.2 步骤 2：为每个业务单元部署一个栈
    
    
    aws cloudformation deploy \
      --template-file bu.yaml \
      --stack-name bedrock-cost-bu1 \
      --parameter-overrides \
          SharedStackName=bedrock-cost-shared \
          BUName=BU1 \
          ModelLabel=Nova2Lite \
          SourceProfileArn=arn:aws:bedrock:us-east-1::inference-profile/global.amazon.nova-2-lite-v1:0 \
          Threshold=100 \
          Period=3600 \
      --region us-east-1
    

这个栈会创建该 BU 的 Application Inference Profile，以及一个名为 `BedrockCost-BU1-Nova2Lite-us-east-1` 的 metric math 告警。告警的 `ModelId` 维度通过 `!GetAtt Profile.InferenceProfileId` 从新建的 profile ID 自动接入，无需手工抄写。

若要监控其它模型，传入对应的展示名和单价即可（默认是 [Amazon Nova](<https://aws.amazon.com/cn/ai/generative-ai/nova/>) 2 Lite 的定价）：
    
    
    ModelLabel= \
          InputPrice= OutputPrice= CacheReadPrice= CacheWritePrice=
    

### 5.3 步骤 3：将调用方指向 profile

每个栈都会输出一个 `ProfileArn`。调用方只需把传给 Amazon Bedrock 的模型 ID 改成这个 ARN：
    
    
    response = client.converse(
        modelId="",
        messages=[...],
    )
    

因为 Amazon Bedrock 服务端的 `modelId` 字段同时接受基础模型 ID 和 Inference Profile ARN，所以调用方只需修改 `modelId` 字段，不必引入 SDK 封装或代理端点。

## **六、工作原理**

### 6.1 metric math 成本告警

成本表达式完全定义在告警里。该 BU 对应 profile 的 token 数，乘以”每百万 token”单价后求和：
    
    
    input_tokens       × InputPrice/1,000,000
    + output_tokens      × OutputPrice/1,000,000
    + cache_read_tokens  × CacheReadPrice/1,000,000
    + cache_write_tokens × CacheWritePrice/1,000,000
    

CloudWatch 每分钟评估一次告警，比较的是最近一个 `Period` 窗口（3600 秒即最近 1 小时）内的累计值。当估算成本越过阈值时，告警切换到 `ALARM` 并向 SNS 发布一次；恢复到 `OK` 时再发布一次。持续超标期间不会重复发送。

### 6.2 业务字段如何还原到飞书消息

飞书消息里的”业务单元”和”模型”不来自模型本身、也不来自 token 数据，而是从 CloudWatch 告警名称里解析出来的。完整链路如下：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/12/based-on-application-inference-profile-amazon-bedrock-build-real-time-cost-alert-2.jpg>) [图2 业务单元与模型从告警名称还原到飞书消息的过程]  
---  
  
而周期、阈值、当前成本、说明等运行参数，CloudWatch 在触发告警时本就放进了 SNS 消息体，Lambda 直接读取即可，无需硬编码。这样带来的好处是：

  * Lambda 通用：不含 BU、模型、周期、阈值的硬编码。新增 BU、换模型、改周期都不用动它。
  * 维护只看告警：业务语义集中在告警名称里，运行参数集中在告警配置里。
  * 展示自动跟随：把告警的 `Period` 改成 1800，飞书就显示”当前 30 分钟成本”；`AlarmDescription` 写什么，”说明”行就显示什么。



命名约定的唯一限制：BU 名和模型名本身不能含 `-`（用 `Nova2Lite`，不要用 `Nova-2-Lite`），因为通知组件按 `-` 对告警名称分段。

## **七、验证**

触发一次状态变更，确认消息送达：
    
    
    aws cloudwatch set-alarm-state --alarm-name "BedrockCost-BU1-Nova2Lite-us-east-1" \
      --state-value OK --state-reason reset --region us-east-1
    sleep 3
    aws cloudwatch set-alarm-state --alarm-name "BedrockCost-BU1-Nova2Lite-us-east-1" \
      --state-value ALARM --state-reason "manual test" --region us-east-1
    

用真实数据做端到端验证时，可临时把 `Threshold` 设得很低（例如 `0.0001`），用该 BU 的 profile ARN 发几次请求，让告警自然评估。告警消息会展示从告警名称解析出的业务单元和模型，以及从消息体读取的评估窗口和阈值。验证完记得把阈值改回正常值。

### 7.1 消息示例
    
    
    Bedrock 成本告警
    业务单元: BU1
    模型: Nova2Lite
    状态: 超出阈值
    区域: US East (N. Virginia)
    时间: 2026-06-07 07:32:10 CST
    当前 2 分钟 成本: $0.42 (阈值: $0.30)
    说明: BU1 调用 Nova 2 Lite 全局成本告警 (滑动窗口 2 分钟估算成本超过 $0.30 时触发)
    

## **八、注意事项与限制**

  * 本方案负责告警，不做硬性预算阻断。如果需要在预算耗尽时拦截请求，请与网关／限额方案配合使用。
  * 展示的成本是依据 token 数和你配置的单价估算得出；定价如有变化，以 AWS 官方价格页面为准。
  * 原生 token 指标只有 `ModelId` 一个维度，因此分 BU 隔离依赖于每个 BU 使用各自独立的 Application Inference Profile。
  * BU 名和模型名不能包含 `-`，原因见上文命名约定。
  * 基于跨区域（system-defined）profile 创建的 Application Inference Profile 会保留跨区域路由能力；指标出现在告警与 profile 所定义的区域。



## **九、清理**
    
    
    # 先删 BU 栈（它们 import 了共享栈的导出值）
    aws cloudformation delete-stack --stack-name bedrock-cost-bu1 --region us-east-1
    aws cloudformation wait stack-delete-complete --stack-name bedrock-cost-bu1 --region us-east-1
    # 再删共享栈
    aws cloudformation delete-stack --stack-name bedrock-cost-shared --region us-east-1
    

删除 BU 栈会一并删除该 BU 的 application inference profile，删除前请确认没有调用方还在引用它。 

## **十、小结**

把 Application Inference Profile 与原生 `AWS/Bedrock` 指标、metric math 告警组合起来，就能得到分钟级更新的分业务单元成本告警：推理链路上没有代理，也不需要自定义计量代码。通知组件由告警名称和 SNS 消息体驱动，接入新的 BU 或模型时，只需再部署一个带参数的栈，复用同一个通知组件。这是一个可以直接套用的实践，你可以基于本文的两个模板按需调整。

**下一步行动：**

**相关产品：**

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon Nova](<https://aws.amazon.com/cn/ai/generative-ai/nova/?p=bl_pr_nova_l=2>) — 提供前沿智能和最高性价比的基础模型
  * [Amazon SNS](<https://aws.amazon.com/cn/sns/?p=bl_pr_sns_l=3>) — 发布/订阅和推送通知
  * [AWS Lambda](<https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=4>) — 无需服务器即可运行代码
  * [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=5>) — 可观测性工具



**相关文章：**

  * [Amazon Bedrock模型推理的Serverless 异步架构 – 处理在线多模态高负载案例](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-inference-serverless-architecture-case-study/?p=bl_ar_l=1>)
  * [在 Amazon Bedrock 上为 Claude 应用设计稳健的 Prompt Cache 策略](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-claude-application-design-prompt-cache-policy/?p=bl_ar_l=2>)
  * [通过 Amazon Bedrock 运行 Claude Cowork 配置实践](<https://aws.amazon.com/cn/blogs/china/claude-cowork-amazon-bedrock-configuration-practice/?p=bl_ar_l=3>)
  * [基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力](<https://aws.amazon.com/cn/blogs/china/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics/?p=bl_ar_l=4>)
  * [快时尚电商行业智能体设计思路与应用实践（七）Amazon Bedrock AgentCore Runtime 深度解析和场景分析](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-agentcore-runtime-deep-dive-and-scenario-analysis/?p=bl_ar_l=5>)



## **十一、参考资料**

  * [Amazon Bedrock Application Inference Profile](<https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles.html>)
  * 模板：[shared.yaml](<https://doc.ethanlin.cn/doc/shared.yaml>)、[bu.yaml](<https://doc.ethanlin.cn/doc/bu.yaml>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 林益龙

亚马逊云科技解决方案架构师，专注于在企业中推广云计算与人工智能的最佳实践。曾担任运维经理、解决方案架构师等岗位，拥有多年的企业 IT 运维和架构设计经验。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
