---
title: "基于 Amazon Bedrock AgentCore 与 AWS DevOps Agent 打造对话式多账户运维助手"
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/based-on-amazon-bedrock-agentcore-aws-devops-agent
author: 辛嘉诚、钱海涛、何浩
feed_name: AWS China Blog
source_published: 2026-06-12
ingested: 2026-06-12
type: article
tags: [agentcore, bedrock, aws, harness-engineering, multi-agent, devops, mcp, agent-as-service, production-case]
sha256: "cf4e68547b19d0b9cc1365b2a4dc35d77dee26af5b8d49caa1387be911bc09cc"
---

# 基于 Amazon Bedrock AgentCore 与 AWS DevOps Agent 打造对话式多账户运维助手

摘要：本文介绍一套基于 Amazon Bedrock AgentCore、Strands Agents SDK 和 Amazon CloudWatch 构建的多账户智能运维系统。系统实现了 Amazon RDS / Amazon ElastiCache / Amazon EC2 闲置资源自动检测、AI 智能巡检报告生成、跨账户 AWS DevOps Agent 根因调查，并通过飞书/钉钉 IM 机器人提供自然语言对话式运维体验。  
  
**目录**

01 一、从一次缩容评估说起

02 二、方案与架构

03 三、核心功能与落地效果

04 四、AgentCore 如何支撑飞书对话式运维

05 五、多账户跨区域设计

06 六、三条可复用的设计模式

07 七、总结

* * *

## **一、从一次缩容评估说起**

某客户将多个 AWS 账户接入巡检系统后，系统在跨账户的 ElastiCache 实例中检测出超过万美元/月 的潜在优化空间——这些节点在流量高峰期过后负载已回落，具备缩容条件。由于实例分散在多个账户和 Region 中，自动化工具的全量覆盖能力让团队得以快速定位这些优化机会。

经系统标记后，客户结合业务实际完成了两轮处置：第一轮缩容和合并集群，优化了约 50% 的可优化金额；剩余部分经评估后加入白名单——这些节点虽当前负载较低，但属于生产预留容量，需随时应对突发流量，不适合缩容。

这种“系统识别 + 人工决策”的协作模式，正是本方案的设计目标。在 AWS 多账户架构下，运维团队普遍面临以下需求：

  * 全量覆盖的自动化巡检：数百个 RDS、ElastiCache、EC2 实例需要每日检查，自动化工具能显著提升覆盖效率
  * 定制化的成本分析：AWS Trusted Advisor 和 AWS Cost Explorer 提供丰富的原始数据，客户需要针对自身业务场景构建聚合视角和规则引擎
  * 告警智能化：从海量监控数据中提炼关键洞察，进一步提升响应效率
  * 多账户统一编排：跨账户数据采集、权限配置和事件聚合需要统一的编排层



我们基于 [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/>) 构建了这套端到端的智能运维系统，通过 AI Agent 将上述需求转化为自动化的日常能力。

## **二、方案与架构**

### 2.1 三种访问方式

本系统提供三种互补的访问入口：

  * Web Dashboard — React SPA + Cloudscape 组件库 + [Amazon Cognito](<https://aws.amazon.com/cn/cognito/>) 认证，适合全景概览和配置管理
  * IM 机器人 — 飞书/钉钉群内 @机器人 自然语言对话，适合日常巡检和即时查询
  * MCP Server — 21 个标准化工具通过 Model Context Protocol 对外暴露，供外部 AI Agent 程序化调用



### 2.2 五条数据路径

  * 路径 A：闲置资源四阶段流水线（每日定时采集与分析）
  * 路径 B：AWS Health Dashboard 事件转发（实时中文摘要推送）
  * 路径 C：IM 机器人对话（AgentCore 智能助手）
  * 路径 D：Web Dashboard（按需查询与配置）
  * 路径 E：MCP Server（外部 Agent 集成）



### 2.3 架构总览

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/11/based-on-amazon-bedrock-agentcore-aws-devops-agent-1.png>) [图1 AWS 资源闲置检测与优化系统架构总览——五条数据路径、跨账户采集与 AgentCore 智能助手]  
---  
  
### 2.4 技术选型

组件 | 技术 | 选型理由  
---|---|---  
AI Agent | Strands Agents SDK + AgentCore Runtime | 开源框架 + 全托管运行时，无需管理基础设施  
LLM | Amazon Bedrock | 提供多种大模型选择、跨全球区路由、统一接入等能力  
IaC | AWS CDK (TypeScript) | 复杂资源编排，./setup.sh 单命令完成全量部署  
数据库 | Amazon RDS PostgreSQL 16 | 关系型查询 + JSON 支持  
事件驱动 | Amazon EventBridge + Amazon SNS + Amazon SQS | 跨账户事件路由 + 可靠投递  
  
### 2.5 一键部署
    
    
    ./setup.sh
    

单命令完成全量基础设施创建，全部通过 AWS CDK 定义，支持交互式选择 Region 和可选功能：

类别 | 组件  
---|---  
计算与网络 | VPC、9 个 Lambda、Amazon API Gateway  
数据与存储 | Amazon RDS PostgreSQL、Amazon DynamoDB、Amazon S3  
AI 与事件驱动 | AgentCore Runtime + Memory、Amazon ECR、Amazon EventBridge、Amazon SNS  
安全与前端 | Amazon Cognito、Amazon CloudFront  
  
## **三、核心功能与落地效果**

### 3.1 四阶段闲置检测流水线

这是系统的核心引擎，每天自动执行四个阶段：

阶段 | 操作 | 输出  
---|---|---  
一：资源发现与预过滤 | DescribeInstances → 白名单过滤 | 目标实例列表  
二：海选采集 | GetMetricData 批量采集 5~6 项基础指标（CPU / 连接数 / 存储） | 识别 Candidate（CPU < 阈值且连接数 < 阈值）  
三：精选采集 | GetMetricData 采集深度指标 + 7 天峰值（IOPS / 网络 / 驱逐） | 补充深度数据  
四：深度判定 | 峰值否决 → 隐形负载检查 → 增强版评分 | 生成闲置报告  
  
关键设计决策：

  * 二阶段阈值过滤：从全量实例中先筛出 Candidate（通常不到 10%），仅对候选做深度指标采集，[Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/>) API 费用控制在约 $1/月（500 实例规模）
  * 峰值否决机制：7 天 CPU 峰值超过阈值的实例自动排除——避免将白天繁忙、夜间空闲的实例误判为闲置
  * 隐形负载检查：CPU 低但 IOPS 高（数据库仍在服务 I/O 密集型查询）、Evictions 高（缓存正在被活跃驱逐）等场景自动排除
  * 增强评分：综合 CPU、连接数、存储/内存三个维度加权评分，再乘以规格权重（大规格优先）和连续天数因子（长期闲置优先），确保最有价值的优化机会浮出水面



落地效果：系统在跨账户 ElastiCache 实例中检测出超过万美元/月的潜在优化空间。结合闲置评分和优化建议（缩容、合并集群、c7gn 机型迁移等），优化了约 50% 的标记金额——剩余部分为生产预留容量，加入白名单后不再提示。

### 3.2 AI 智能巡检（RDS / ElastiCache）

基于 [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 自动生成结构化巡检报告：
    
    
    监控数据 CSV → Amazon Bedrock → 结构化巡检报告
                                        ├─ 资源概览与分类
                                        ├─ 关键指标分析
                                        ├─ 风险评估 (Critical/Warning/Attention)
                                        └─ 优化建议
    

  * Token 超过 100K 时自动按账户分批调用
  * Prompt 模板存储在数据库中，Dashboard 可热编辑——可随时新增分析维度或调整关注重点
  * 支持通过 [AWS Systems Manager](<https://aws.amazon.com/cn/systems-manager/>) Parameter Store 动态切换模型，5 分钟内生效，无需重新部署



落地效果：RDS 和 ElastiCache 巡检覆盖率达到 100%。上线初期 Critical 问题高达数十个，经逐一处置（优化配置、将 staging/测试实例加入巡检白名单）和 Prompt 调优后稳定在个位数——每次新增 Critical 均为真实需要关注的风险。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/11/based-on-amazon-bedrock-agentcore-aws-devops-agent-2.png>) [图2 AI 智能巡检报告 — 自动覆盖全部实例并按风险等级分类]  
---  
  
### 3.3 DevOps Agent 多账户集成

本系统采用每业务账户独立 Agent Space 的架构。[AWS DevOps Agent](<https://aws.amazon.com/cn/devops-agent/>) 支持将多个账户作为 secondary accounts 挂载到同一个 Agent Space，但这意味着 Agent 会将所有账户的资源纳入统一拓扑——当系统账户本身拥有复杂的资源结构，或多个业务账户之间业务无关时，调查过程中可能引入大量无关资源噪音（例如账户 B 出现问题，Agent 却关联分析了账户 A 的资源）。独立 Agent Space 确保每次调查仅聚焦单一账户范围，减少干扰，提升调查准确性。

触发调查后，AWS DevOps Agent 在业务账户内自主执行根因分析——查询 Amazon CloudWatch 指标异常、检查近期配置变更、分析资源间依赖关系，最终生成结构化的根因报告。Callback Lambda 收到调查完成事件后，通过 STS AssumeRole 拉取原始报告，再由 Amazon Bedrock 精简为适合 IM 推送的短卡片摘要。完整交互时序如下图所示：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/11/based-on-amazon-bedrock-agentcore-aws-devops-agent-3.png>) [图3 DevOps Agent 跨账户调查完整时序——从触发到结果推送]  
---  
  
为什么选择独立 Agent Space 而非集中式：

  * 权限隔离：各账户 Primary Role 权限不交叉
  * 故障隔离：单账户异常不影响其他账户
  * 数据合规：调查数据留在业务账户内，仅摘要回传
  * 弹性扩展：新增账户无需修改已有配置



Onboarding 产品化：Dashboard 提供 4 步向导——生成 [AWS CloudFormation](<https://aws.amazon.com/cn/cloudformation/>) 模板 → 业务账户一键部署 → 回填 Payload → 测试连接并启用。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/11/based-on-amazon-bedrock-agentcore-aws-devops-agent-4.png>) [图4 DevOps Agent 多账户 Onboarding 向导——业务账户管理员点击 Launch Stack URL 即可完成部署]  
---  
  
### 3.4 IM 机器人对话式运维

通过飞书/钉钉群内 @机器人，以自然语言完成运维操作。

飞书 Webhook 超时解决方案：

飞书 Webhook 要求 3 秒内返回 HTTP 200，而 AI Agent 的深度分析和多工具编排天然需要更充裕的执行时间以确保回复质量。我们采用异步自调用模式，兼顾即时响应和深度分析：
    
    
    # im_bot_relay/handler.py — 异步自调用核心逻辑
    async_event = {
        "_async_processing": True,
        "platform": platform,
        "user_id": msg.user_id,
        "content": msg.content,
        "message_id": msg.message_id,
    }
    lambda_client.invoke(
        FunctionName=os.environ["AWS_LAMBDA_FUNCTION_NAME"],
        InvocationType="Event",  # 异步调用，不等结果
        Payload=json.dumps(async_event),
    )
    # 立即返回 200 给飞书（< 1 秒）
    return {"statusCode": 200, "body": '{"message":"ok"}'}
    

两层消息去重：

由于 [AWS Lambda](<https://aws.amazon.com/cn/lambda/>) 天然支持弹性伸缩（多实例并行处理），我们利用 Amazon DynamoDB 条件写入实现跨实例的全局原子去重：
    
    
    # DynamoDB 条件写入——首次写入成功则非重复，条件失败则为重复消息
    def _is_duplicate(message_id: str) -> bool:
        try:
            _dedup_client.put_item(
                TableName=_dedup_table_name,
                Item={
                    "message_id": {"S": message_id},
                    "ttl": {"N": str(int(time.time()) + 86400)},  # 24h TTL
                },
                ConditionExpression="attribute_not_exists(message_id)",
            )
            return False
        except _dedup_client.exceptions.ConditionalCheckFailedException:
            return True
    

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/11/based-on-amazon-bedrock-agentcore-aws-devops-agent-5.png>) [图5 飞书 IM 交互完整时序——从用户发消息到收到分析结果]  
---  
  
飞书 AI 助手覆盖六大类运维操作，用户无需记忆命令，自然语言即可完成：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/11/based-on-amazon-bedrock-agentcore-aws-devops-agent-6.png>) [图6 飞书 AI 助手能力概览——自然语言即可完成查询、巡检、调查和配置管理]  
---  
  
落地效果：每天早上 10:00 自动推送巡检日报到飞书群，零额外工作量。跨账号调查做到一句话触发——@机器人 描述问题，系统自动识别目标账户并执行深度调查。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/11/based-on-amazon-bedrock-agentcore-aws-devops-agent-7.png>) [图7 每日自动推送巡检日报到飞书群——零人工操作]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/11/based-on-amazon-bedrock-agentcore-aws-devops-agent-8.png>) [图8 飞书自然语言对话——一句话触发跨账号 DevOps Agent 深度调查]  
---  
  
## **四、AgentCore 如何支撑飞书对话式运维**

第三节展示了飞书 AI 助手的完整能力，本节介绍它背后的运行机制——Amazon Bedrock AgentCore 如何承载 Agent 的部署、模型管理和对话记忆。

### 4.1 全托管 Agent 服务

3.4 节中飞书消息最终由以下 Agent 服务处理。基于 Strands Agents SDK 构建，运行在 AgentCore Runtime 上，整个服务入口仅需几行代码：
    
    
    # agent/server.py
    from bedrock_agentcore.runtime import BedrockAgentCoreApp
    from agent.core import process_message_stream
    app = BedrockAgentCoreApp()
    @app.entrypoint
    async def invoke(payload, context):
        """AgentCore Runtime 收到请求时自动调用，通过 yield 逐事件返回。"""
        async for event in process_message_stream(
            session_id=context.session_id,
            message=payload.get("message", ""),
            user_id=payload.get("user_id", "unknown"),
            platform=payload.get("platform", "unknown"),
        ):
            yield event
    

开发者只需关注业务逻辑（工具编排、prompt 设计），HTTP 端点、健康检查和按需弹性伸缩完全由 AgentCore Runtime 接管——无需管理服务器、容器编排或负载均衡。

### 4.2 模型热切换——不重新部署即可升级模型

客户在使用过程中可能需要切换模型——例如日常巡检用低成本模型，关键调查时切换到高精度模型。本系统通过 Dashboard 将目标 Bedrock 模型 ID 写入 AWS Systems Manager Parameter Store，Agent 容器在 5 分钟内自动生效（TTL 缓存机制），无需重新部署或重启。

三级 Fallback 保障可用性：SSM Parameter → 环境变量 → 硬编码默认值。同时支持 Amazon Bedrock 原生调用和 LiteLLM Proxy（OpenAI 兼容协议），全量组件跟随 SSM 切换。

### 4.3 多群隔离与对话记忆

在实际使用中，不同团队会建立各自的飞书群与 Agent 交互——DBA 群讨论数据库相关问题，SRE 群关注基础设施告警，管理层群查看成本概览。系统将每个飞书群（thread_id）映射为独立的 session_id，不同群的对话历史天然隔离、互不干扰。

AgentCore Memory 按 session 管理对话历史：Agent 每次被唤起时自动恢复该群的完整上下文（即使底层 microVM 已被销毁重建），用户无感知。当前配置为 7 天短期历史（AgentCore Memory 的 eventExpiryDuration 参数支持 3-365 天灵活配置），确保运维指令以最新上下文为准。

后续规划：AgentCore Memory 支持 Semantic、UserPreference 等长期记忆策略。我们计划在短期历史稳定运行后，逐步测试启用长期记忆——让不同群的 Agent 随着使用深入，逐渐积累该群的关注重点和沟通偏好，实现越用越顺手的体验。

## **五、多账户跨区域设计**

### 5.1 权限模型

目标账户只需创建两个 IAM Role：

  * IdleDetectionRole：Amazon RDS / [Amazon ElastiCache](<https://aws.amazon.com/cn/elasticache/>) / Amazon CloudWatch / AWS Support 只读权限——用于数据采集
  * DevOpsAgentTrigger Role：AWS DevOps Agent API + Amazon EventBridge PutEvents 权限——用于触发调查



管理账户通过 STS AssumeRole 跨账户访问，新增账户只需创建 Role + Dashboard 注册，无需部署任何组件。

### 5.2 跨账户事件聚合

调查完成后，结果通过 Amazon EventBridge 跨账户转发回管理账户：

  * 自定义 Event Bus 白名单校验（只允许已注册的业务账户 ID）
  * Source 条件校验（只允许 aws.aidevops）
  * Callback Lambda 拉取原始报告 → Amazon Bedrock 精简为短卡片 → 入库



### 5.3 AWS Health Dashboard 事件跨区域覆盖

利用 AWS Health 的区域聚合机制实现多 Region 覆盖：

  * 在 us-west-2 部署 Amazon EventBridge 规则时，可聚合所有标准分区 Region 的 Health 事件
  * 在 us-east-1 部署规则用于接收全局服务事件（如 IAM）
  * 大幅减少需要部署的 Region 数量，简化事件收集架构



## **六、三条可复用的设计模式**

以下三条设计模式可迁移到其他运维场景：

**模式一：分阶段过滤降低 API 成本**

全量采集所有指标既昂贵又不必要。先用低成本的海选（少量基础指标）筛出候选，再对候选做深度采集——这种漏斗模式适用于任何需要批量调用付费 API 的场景。本系统将 500 实例的 Amazon CloudWatch 月度费用控制在 $1。

**模式二：异步自调用解决 IM 超时**

当 IM 平台要求秒级响应而业务逻辑需要更充裕的执行时间时，AWS Lambda 异步 invoke 自身是一种轻量优雅的解法——同一个函数、同一份代码、零额外组件。配合 Amazon DynamoDB 条件写入实现跨实例去重，即可构建可靠的异步消息处理链路。

**模式三：每账户独立 Agent Space 实现安全隔离**

在多账户 AWS DevOps Agent 集成中，每个业务账户拥有独立 Agent Space，通过 Amazon EventBridge 跨账户转发结果——权限隔离、故障隔离、数据合规三重保障。新增账户通过一键 AWS CloudFormation 模板完成，无需修改已有配置。

## **七、总结**

本文介绍了一套基于 Amazon Bedrock AgentCore 的多账户智能运维系统。通过四阶段流水线精准识别闲置资源、AI 智能巡检生成健康报告、跨账户 AWS DevOps Agent 实现根因调查、飞书/钉钉对话式交互降低运维门槛——已在生产环境中验证了显著的成本优化效果和 100% 巡检覆盖率。

未来规划：

  * 扩展资源类型覆盖（[Amazon DocumentDB](<https://aws.amazon.com/cn/documentdb/>)、[Amazon OpenSearch](<https://aws.amazon.com/cn/opensearch-service/>) Service、[Amazon Redshift](<https://aws.amazon.com/cn/redshift/>)）
  * 基于调查历史的根因模式学习与自动修复
  * 多语言 IM 支持（Slack、Microsoft Teams）



如需了解详细实现或获取 Demo 演示，欢迎联系项目作者团队。

区域说明：本文方案基于 AWS 海外区域（us-east-1 和 us-west-2）构建。Amazon Bedrock AgentCore 和 AWS DevOps Agent 的区域可用性请参考官方文档。

**下一步行动：**

**相关产品：**

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon DevOps Agent](<https://aws.amazon.com/cn/devops-agent/?p=bl_pr_devops-agent_l=2>) — 解决和预防事故的代理
  * [Amazon EventBridge](<https://aws.amazon.com/cn/eventbridge/?p=bl_pr_eventbridge_l=3>) — 大规模构建事件驱动应用程序
  * [Amazon RDS](<https://aws.amazon.com/cn/rds/?p=bl_pr_rds_l=4>) — 完全托管的关系数据库服务
  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=5>) — 加快代理投入生产的速度



**相关文章：**

  * [让 AI 代理自己付钱：基于Amazon Bedrock AgentCore与 x402 的Agentic Payment 方案](<https://aws.amazon.com/cn/blogs/china/ai-agent-based-on-amazon-bedrock-agentcore-x402-agentic-payment-solution/?p=bl_ar_l=1>)
  * [对抗 Agent 遗忘：Kollab 基于Amazon Bedrock AgentCore 的团队AI工作空间实践](<https://aws.amazon.com/cn/blogs/china/on-amazon-bedrock-agentcore-ai-practice/?p=bl_ar_l=2>)
  * [基于Amazon Quick与Amazon Bedrock AgentCore打造对话式 FinOps助手](<https://aws.amazon.com/cn/blogs/china/based-on-amazon-quick-amazon-bedrock-agentcore/?p=bl_ar_l=3>)
  * [用 Amazon Bedrock AgentCore Payment 构建自主支付 AI Agent: x402 协议实战](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-agentcore-payment-build-payment-ai/?p=bl_ar_l=4>)
  * [Habby 游戏借助 AWS DevOps Agent 实现智能运维最佳实践](<https://aws.amazon.com/cn/blogs/china/habby-gaming-aws-devops-agent-implement-intelligent/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 张伯阳

亚马逊云科技技术客户经理，主要支持游戏和零售电商行业客户的架构优化、成本管理、技术咨询与交付工作。曾在 IBM Cloud 担任开发工程师，专注于多个 VMware 云解决方案的研发工作，拥有多年企业级产品研发经验。

### 柴飙

亚马逊云科技技术客户经理，主要支持零售电商、汽车行业客户的架构优化、成本管理、技术咨询与交付工作。曾供职于IBM，拥有多年企业级产品研发经验，并发表过10余项专利。

### 谢川

亚马逊云科技资深生成式 AI 技术专家，负责基于亚马逊云科技生成式 AI 解决方案的设计、实施和优化。曾在通信、电商、互联网等行业有多年的产研经验，在数据科学、推荐系统、LLM微调平台，Agent应用等方面有丰富的实践经验，并且拥有多个 AI 相关产品技术发明专利。

* * *

## 2026 亚马逊云科技中国峰会

智能投标、AI 质检、财务自动化、智能客服——生产级 Agent 全天开放体验。 [](<https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p1&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d>) |   
---|---
