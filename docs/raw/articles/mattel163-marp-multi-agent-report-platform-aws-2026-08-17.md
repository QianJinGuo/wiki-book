---
title: "Mattel163携手亚马逊云科技：用多智能体平台（MARP）自动生成玩家洞察报告"
created: 2026-08-17
updated: 2026-08-17
type: raw
tags: [multi-agent, aws, bedrock, agentcore, strands, agent-as-code, production, harness]
source_url: https://aws.amazon.com/cn/blogs/china/mattel163-intelligent-platform-generation
source_published: 2026-08-17
sha256: 910a4c3d737ecde88099379cbbc3053eb0799051c457e07d28883bca950b2d75
---

# Mattel163携手亚马逊云科技，用多智能体平台自动生成玩家洞察报告

摘要：Mattel163 携手亚马逊云科技，基于 Amazon Bedrock 和 Strands Agents SDK 构建了多智能体报告自动生成平台（MARP）。该平台通过多个专业化 Agent 协作，将原本需要数天人工完成的玩家洞察报告生成流程缩短至分钟级，覆盖数据采集、多源分析、报告撰写与可视化呈现等环节。

**目录**

01 一、引言

02 二、玩家反馈分析面临的复杂问题

03 三、为什么选择 Agentic AI 而非简单的 LLM 调用

04 四、基于亚马逊云科技的解决方案：MARP 多智能体报告平台

05 五、异步任务架构：应对分钟级到小时级的报告生成

06 六、四大核心应用场景

07 七、端到端 Deep Dive：一次问卷分析的完整旅程

08 八、技术实现：Amazon Bedrock AgentCore 与 Strands Agents SDK

09 九、设计模式与最佳实践

10 十、实施效果

11 十一、展望未来

12 十二、参考资源

* * *

## **一、引言**

对于一家服务全球数千万玩家的游戏公司来说，玩家的声音无处不在：应用商店的评论、客服工单的投诉、游戏内活动问卷的反馈、用户访谈的录音……这些海量的原始数据中蕴含着产品优化的关键线索，但如何快速、准确地从中提炼出可执行的洞察，一直是游戏运营团队面临的巨大挑战。

为解决这一问题，Mattel163 与亚马逊云科技合作，基于 [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/>) 构建了 MARP（Multi-Agent Report Platform，多智能体报告平台）——一个能够自动分析多种类型玩家反馈、生成结构化专业报告的 Agentic [AI](<https://aws.amazon.com/cn/what-is/artificial-intelligence/>) 解决方案。

本文将不仅介绍 MARP 的应用场景，还将深入剖析其工程实现：异步长任务架构、Agent-as-Code 的声明式智能体管理、多租户安全设计、基于证据链的可信报告标准，以及两个在实践中反复被验证的设计决策，希望为正在构建生产级 Agentic AI 应用的团队提供可借鉴的参考。

## **二、玩家反馈分析面临的复杂问题**

Mattel163 运营着 UNO!、Phase 10、Skip-Bo 等多款全球知名 IP 游戏，服务覆盖超过 200 个国家和地区、14 种语言的数千万玩家。庞大的用户基数意味着每天都会产生海量的玩家反馈数据，这些数据分散在多个渠道：

  * 应用商店评论：App Store 和 Google Play 上的玩家评分和文字评论，涵盖十多种语言，每次版本更新后评论量激增。
  * 客服工单与社交媒体舆情：玩家通过客服系统提交的问题反馈，以及社交媒体上的讨论和投诉。
  * 游戏活动问卷：针对特定活动或版本发布后的玩家调查问卷，包含大量开放式文字回答。
  * 用户访谈录音：产品团队定期进行的深度用户访谈和焦点小组讨论的音频录音。



传统的分析方式面临诸多困难：

  * 人工分析效率低：研究团队逐条阅读和分类反馈，一份完整的分析报告往往需要数周时间。
  * 质量不一致：不同分析师对同一批数据可能得出不同的结论，缺乏统一的分析框架。
  * 多语种障碍：14 种语言的反馈需要不同语言专家参与，协调成本极高。
  * 时效性差：等报告完成时，问题可能已经发酵，错过了最佳处理窗口。



## **三、为什么选择 Agentic AI 而非简单的[LLM](<https://aws.amazon.com/cn/what-is/large-language-model/>) 调用**

生成式 AI 的出现为[文本分析](<https://aws.amazon.com/cn/what-is/text-analysis/>)带来了革命性的变化。但直接将数据发送给 LLM 的 [API](<https://aws.amazon.com/cn/what-is/api/>)，就能生成高质量的分析报告吗？不能！因为报告生成本质上是一个复杂的多步骤[工作流](<https://aws.amazon.com/cn/what-is/workflow/>)，远非单次 LLM 调用所能胜任：

  * 数据不在提示词里：问卷数据是 S3 上的 Excel 文件，访谈是数百 MB 的音频，LLM 无法直接”看到”，需要先调用工具获取和预处理。
  * 上下文远超单次调用容量：数千条多语种评论无法一次性塞进上下文窗口，需要分[批处理](<https://aws.amazon.com/cn/what-is/batch-processing/>)、中间汇总、再全局归纳。
  * 输出有严格的格式与证据要求：专业报告需要遵循固定模板，每个洞察都要附带原始玩家引用作为证据，这需要多轮自检与迭代。
  * 流程存在分支决策：数据是 CSV 还是 Excel？回答里是否混杂多种语言？某个主题的样本量是否足以支撑结论？这些都需要根据中间结果动态决策。



Agentic AI 代表了 LLM 应用的下一代演进。AI 智能体是一个自主系统，能够自动规划任务步骤、调用外部工具（如文件存储、[数据库](<https://aws.amazon.com/cn/what-is/database/>)、转录服务）、根据中间结果做出决策，并通过多轮迭代优化输出。这正是报告生成场景所需要的能力。

以一次典型的玩家问卷分析为例，智能体需要：

  1. 从 S3 下载 Excel 格式的问卷数据文件
  2. 解析文件内容，理解数据结构和字段含义
  3. 对开放式回答进行主题分类和情感分析
  4. 识别关键模式，提取代表性引用作为证据
  5. 按照预定义的模板生成结构化报告
  6. 将最终报告上传回 S3 供团队查阅



这一整套流程，传统方式需要分析师数天完成，而 Agentic AI 可以在几分钟内自动完成。

## **四、基于亚马逊云科技的解决方案：MARP 多智能体报告平台**

MARP 被设计为一个模块化、可扩展的多智能体系统。不同于构建一个“万能”的单一智能体，MARP 采用多智能体架构——每个专业化的智能体专注于特定类型的分析任务，各自携带优化的提示词模板、工具配置和输出格式规范。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/08/17/mattel163-intelligent-platform-generation-1.png>) [图 1：MARP 三层架构，展示了前端层、后端层以及智能体服务层]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/08/17/mattel163-intelligent-platform-generation-2.png>) [图 2：MARP 的 Web 界面，展示了登录页面和管理分析任务的主控制台]  
---  
  
平台由三个主要层次组成：

  * 前端层：基于 Web 的界面，用户可以提交分析任务、上传数据文件、跟踪作业状态并查看生成的报告。
  * 智能体服务层：MARP 的智能核心，由 [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) AgentCore 驱动。多个专业化智能体在此层部署运行，各自处理不同类型的分析任务。
  * 工具生态系统：为智能体提供 S3 文件操作、文档解析（PDF/Excel/Word/CSV）、图像分析、音频转录（[Amazon Transcribe](<https://aws.amazon.com/cn/transcribe/>)）、网络搜索等能力。



整个平台采用 Serverless 服务，成本随实际使用量弹性伸缩，基础设施通过 [AWS CDK](<https://aws.amazon.com/cn/cdk/>) 定义，按模块独立部署。

一个值得注意的架构设计是：平台存在两条调用链路，分别服务于不同性质的工作负载。

  * 对话式交互走直连链路：前端经 Cognito 认证后，携带令牌直接调用 AgentCore Runtime 的 HTTPS 端点，流式获取智能体响应。推理链路不经过自建后端中转，控制面与推理面彻底分离，互不影响扩展。
  * 长报告任务走异步链路：经由 SQS 队列解耦提交与执行，适应分钟级到小时级的分析任务，下一节展开。



## **五、异步任务架构：应对分钟级到小时级的报告生成**

生产级 Agentic 应用必须面对一个现实：报告生成是长任务。分析数千条多语种评论、转录一小时的访谈录音，执行时间从几分钟到数十分钟不等，远超 API Gateway 29 秒的同步超时限制。MARP 通过”消息队列 + 状态机 + WebSocket 推送”的组合解决这一问题。

其中两个设计点最值得借鉴：

  1. SQS 解耦提交与执行，DLQ 兜底失败任务。 任务提交后立即返回任务 ID，用户无需保持页面等待；任务状态在 DynamoDB 中沿 `pending → running → completed / failed` 流转，用户随时刷新页面甚至第二天再登录，都能从任务列表恢复完整视图。SQS 主队列配置了[死信队列](<https://aws.amazon.com/cn/what-is/dead-letter-queue/>)（DLQ，最大重试 3 次），当任务因模型限流、数据格式异常等原因多次重试失败后，消息进入 DLQ 供人工排查和重放，保证任务不会静默丢失。
  2. WebSocket 实时流式推送。 智能体通过 Strands [SDK](<https://aws.amazon.com/cn/what-is/sdk/>) 的 `stream_async`() 逐事件产出执行过程（当前正在调用哪个工具、生成了哪部分内容），经 API Gateway WebSocket API 实时推送到前端。用户能”看着”智能体工作，而不是面对一个不知何时结束的加载圈——这种透明性显著提升了用户对 AI 生成结果的信任度。



这些长任务由 [Amazon Bedrock AgentCore Runtime](<https://aws.amazon.com/cn/bedrock/agentcore/>) 承载执行——相比自建容器集群（自行管理伸缩策略和会话[路由](<https://aws.amazon.com/cn/what-is/routing/>)），托管运行时让团队将精力集中在智能体逻辑本身。

## **六、四大核心应用场景**

### 6.1 场景一：应用商店评论舆情分析

每次版本更新后，App Store 和 Google Play 上的玩家评论是产品团队最直接的反馈来源。但面对数千条多语种评论，人工逐条阅读和分类是不现实的。

MARP 的应用商店舆情分析智能体能够自动完成以下工作：

  1. 从数据源批量获取多语种评论数据（支持 14 种语言）
  2. 自动识别语种并进行统一分析，无需人工翻译
  3. 按主题维度分类（如游戏性、UI 体验、付费系统、技术稳定性等）
  4. 追踪版本间的情感趋势变化，快速定位新版本引入的问题
  5. 提取代表性玩家原声引用，让产品团队直接“听到”玩家的声音
  6. 生成结构化的舆情分析报告，支持按地区、语种、评分等维度下钻



这使得产品团队能在版本发布后的数小时内，而非数周后，获得全面的玩家反馈洞察，及时发现并响应问题。

### 6.2 场景二：游戏活动问卷分析

Mattel163 定期向玩家发放游戏活动问卷，收集对特定活动、新功能或游戏平衡性的反馈。这些问卷通常包含大量开放式文字回答，是最有价值但也最难分析的数据。

MARP 的问卷分析智能体针对此场景进行了专门优化：

  1. 自动解析 Excel/CSV 格式的问卷数据，智能识别问题和回答列
  2. 对开放式回答进行深度主题挖掘，自动生成主题分类体系
  3. 量化各主题的提及频次和情感倾向，识别玩家最关心的问题
  4. 交叉分析不同玩家群体（如付费玩家 vs 免费玩家）的反馈差异
  5. 生成包含数据支撑的分析报告，每个洞察都附有原始玩家引用作为证据



以往需要研究团队两到三周才能完成的问卷分析工作，现在可以在提交数据后几分钟内获得初步报告，大幅缩短了从数据收集到决策的周期。

### 6.3 场景三：客服工单与舆情分析

玩家通过客服系统提交的工单和社交媒体上的讨论，是发现产品问题和运营风险的重要渠道。但客服数据量大、格式多样，传统的关键词监控难以捕捉深层次的问题模式。

MARP 的客服舆情分析智能体提供了更智能的分析能力：

  1. 自动归类工单类型（技术故障、付费争议、游戏建议、举报等）
  2. 识别突发性问题集群——当某类问题的工单量突然上升时，自动预警
  3. 分析问题根因，将表面不同但根因相同的工单归为一组
  4. 追踪问题解决后的舆情变化，评估修复措施的效果
  5. 生成周期性舆情报告，帮助管理层掌握全局运营态势



这使得运营团队能够从被动响应转为主动预防，在问题大规模爆发前及时介入。

### 6.4 场景四：玩家访谈转录与洞察提取

深度用户访谈和焦点小组讨论是获取定性洞察的重要手段。然而，一场 60 分钟的访谈录音，人工转录和分析可能需要一整天的时间。

MARP 的转录分析智能体实现了端到端的自动化处理：

  1. 通过 [Amazon Transcribe](<https://aws.amazon.com/cn/transcribe/>) 将音频录音自动转换为高质量文本
  2. 智能识别说话人角色（访谈者 vs 受访者），结构化转录内容
  3. 从对话中提取关键观点、情感表达和行为洞察
  4. 将多场访谈的发现进行交叉对比，识别共性主题
  5. 生成包含关键引用和主题总结的访谈分析报告



这不仅将转录和分析的时间从“天级”缩短到“分钟级”，还确保了分析的一致性和全面性——人工分析师可能会忽略的细节，智能体都能捕捉到。

## **七、端到端 Deep Dive：一次问卷分析的完整旅程**

以 Phase 10 一次游戏活动的玩家问卷分析为例，拆解从原始数据到专业报告的全过程。

### 7.1 输入与目标

  * 输入：一份包含数千条回答的活动问卷原始数据（CSV），其中开放式题目如”你对本次活动有什么建议？”包含大量自由文本，混杂多种语言。
  * 目标：产出与 UX 研究团队人工报告同等专业水准的分析报告——包含主题分类体系、各主题的提及频次与情感倾向、不同玩家群体的差异，以及每个洞察背后的玩家原声证据。



### 7.2 分析模板：把领域专业知识注入智能体

MARP 的关键创新之一是可配置的分析模板系统。UX 研究方法论不是硬编码在智能体代码中，而是通过结构化提示注入。一个与 UX 团队共创、经过多轮迭代的问卷分析模板包含四个部分：

  1. 角色定义：确立智能体作为”游戏用户研究分析师”的身份，明确其熟悉的分析框架和游戏领域背景知识（如各游戏的玩法机制、玩家分层术语）。
  2. 任务分解：将分析拆解为清晰的顺序步骤——数据解析 → 识别问题与回答列 → 过滤无效回答 → 主题归纳 → 情感标注 → 群体交叉分析 → 证据抽取 → 报告撰写。
  3. 输出格式规范：定义报告的精确结构（背景、方法、总体结论、分主题发现、建议），要求量化表述（”37% 的回答提及××”而非”很多玩家提及××”）。
  4. 质量指南：建立证据选择和洞察质量的标准，核心是下述”证据链”规则。



这种模板驱动的方法带来三个直接收益：添加新报告类型只需创建新模板，无需代码更改；UX 研究员可以直接优化模板中的分析框架，无需开发人员参与；模板可在不同智能体间共享复用。

### 7.3 可信报告：每一条洞察都必须有”证据链”

AI 生成的分析报告面临一个根本性的信任问题：结论是从数据中提炼的，还是模型”编”出来的。MARP 与 Mattel163 UX 团队共同定义的产出标准，核心是证据链约束：

  * 每条中文结论下必须附上尽可能多的玩家英文原话，原文不得修改、缩写或润色，引用中反映主题的部分可加粗突出；
  * 每条引用必须携带玩家的 role ID 和 VIP 等级，例如：”I love the vibrant colors and Christmas in general.” (role_id_xxxxxxx, VIP4)；
  * 主题命名必须具体、可操作——”体验好”不合格，”回合节奏流畅，操作反馈及时”才合格；
  * 开放题必须结合前置选择题交叉分析：玩家在选择题中选了”最喜欢图 1″，智能体就必须把”为什么喜欢”的开放回答按所选图片分组归纳，而非笼统汇总；
  * 过滤无效回答：仅含 “fun”、”good” 等缺乏上下文的简短回复不得作为证据；主题结论必须达到最低样本量门槛，样本不足时明确标注置信度限制。



这套标准同时解决了两个问题。对机器，它是一种结构性的防幻觉手段——结论必须锚定在可核验的原文上，模型没有”自由发挥”的空间；对人，它让 UX 研究员可以按 role ID 回溯任意一条引用的真实性，用几分钟的抽检建立对整份报告的信心。附带 VIP 等级还带来了额外的分析价值：同一条建议来自重度付费玩家和来自新玩家，对产品决策的权重是不同的。

值得注意的是，这套标准并非工程团队的设计，而是 UX 专家把自己多年的分析方法论沉淀成了提示词模板——领域专家不写代码，但直接定义智能体的专业行为。

### 7.4 智能体执行轨迹

任务提交后，编排智能体的实际执行序列如下：
    
    
    [Tool] download_s3_file('s3://bucket/projects/{id}/surveys/p10_event.csv', '/tmp/p10_event.csv')
    [Tool] read_document('/tmp/p10_event.csv')
           → 识别出 12 个字段，其中 3 列为开放式回答，含中/英/葡等多种语言
    [Think] 数据量超过单次上下文容量 → 按题目分批处理，先归纳主题体系
    [Tool] shell('...')  # 数据切分与预统计
    [Think] 逐批完成主题分类与情感标注 → 汇总主题频次 → 抽取各主题代表性引用
    [Think] 按模板结构撰写报告，自检证据完整性
    [Tool] upload_s3_file('/tmp/p10_analysis_report.md', 's3://bucket/projects/{id}/reports/...')
    

整个过程无人工干预。智能体根据中间结果动态决策——比如发现数据量过大时自动切换为分批策略，发现某主题样本量不足时在报告中明确标注置信度限制。

### 7.5 效果验证

UX 研究团队将智能体报告与此前人工撰写的同活动报告进行了对照评审：主题覆盖与人工分析高度一致，且智能体在长尾主题（提及量少但具体的建议）上捕捉得更全——这类内容在人工抽样阅读中最容易被遗漏。以往需要研究团队两到三周才能完成的问卷分析，现在提交数据后几分钟内即可获得初步报告，研究员的角色从”逐条打标签”转变为”评审洞察、深化结论”。

## **八、技术实现：[Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/>) 与 Strands Agents SDK**

[Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/>) 是一个全托管平台，提供构建、部署和运营大规模 AI 智能体的全面能力。结合 Strands Agents SDK——一个由亚马逊云科技开发的[开源](<https://aws.amazon.com/cn/what-is/open-source/>)框架——它能够快速开发复杂的 Agentic 应用程序。

### 8.1 三大核心能力

  * Build（构建）：持久化内存、Gateway 服务（将现有 API 转换为智能体工具）、浏览器运行时、代码解释器等开发基础能力。
  * Deploy（部署）：会话隔离、灵活工作负载（低延迟对话到长时间异步任务）、身份集成和细粒度访问控制。
  * Monitor（监控）：[Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/>) 实时仪表板、质量评估器（评估正确性、有用性、安全性等）。



### 8.2 核心开发组件

在实现层面，MARP 依赖两个关键组件：BedrockAgentCoreApp 将智能体部署为无服务器服务，处理请求路由、会话管理和自动扩展；Strands Agents SDK 提供高级 [Python](<https://aws.amazon.com/cn/what-is/python/>) 抽象，管理模型集成、工具编排和对话历史。

### 8.3 代码示例

以下是 MARP 创建编排智能体的简化示例（代码已简化，仅供说明）：

智能体服务器设置：
    
    
    from bedrock_agentcore import BedrockAgentCoreApp
    from orchestrator import create_user_orchestrator_agent
    
    app = BedrockAgentCoreApp()
    
    @app.entrypoint
    async def agent_invocation(payload, request_context=None):
        user_message = payload.get("prompt")
        context = payload.get("context", {})
        user_data = {
            'userId': context.get("user", {}).get("userId"),
            'email': context.get("user", {}).get("email"),
            'attributes': {'name': context.get("user", {}).get("name")}
        }
        analysis_template = context.get("template", "default")
        agent = create_user_orchestrator_agent(
            user_data=user_data,
            analysis_template=analysis_template
        )
        async for event in agent.stream_async(user_message):
            yield event
    
    if __name__ == "__main__":
        app.run()
    

编排智能体创建：
    
    
    from strands import Agent
    from strands.models import BedrockModel
    from botocore.config import Config
    
    bedrock_model = BedrockModel(
        model_id="xxxx",
        boto_client_config=Config(read_timeout=600, connect_timeout=120, retries={'max_attempts': 3}),
        max_tokens=200000
    )
    
    def create_user_orchestrator_agent(user_data, analysis_template=None):
        specialized_guidance = ""
        if analysis_template:
            specialized_guidance = get_analysis_template(analysis_template)
    
        system_prompt = f"""
        You are an orchestrator agent that helps users analyze data and generate reports.
        Available capabilities:
        1. S3 file operations (download/upload)
        2. Document reading (PDF, Excel, Word, CSV, etc.)
        3. Image analysis
        4. Web search for supplementary information
        User: {user_data.get('attributes', {}).get('name')}
        {specialized_guidance}
        """
    
        agent = Agent(
            model=bedrock_model,
            system_prompt=system_prompt,
            tools=S3_TOOLS + DOCUMENT_READER_TOOLS + [image_reader, current_time, shell],
        )
        return agent
    

## **九、设计模式与最佳实践**

### 9.1 Agent-as-Code：用配置文件定义和部署智能体

随着分析场景不断增加——UNO 舆情、Phase 10 问卷、Barbie IP 调研、访谈转录——如果每新增一个智能体都要手写服务代码和部署脚本，维护成本会随场景数量线性增长，且各智能体的实现质量参差不齐。

MARP 为此构建了 Agent Toolkit：一个”Terraform 式”的智能体定义与部署工具。开发者用一个 YAML 文件声明智能体的全部要素，工具链基于模板自动生成标准化代码并部署到 AgentCore Runtime：
    
    
    # agents/uno_report_agent/agent.yaml
    name: uno_report_agent
    display_name: "UNO Report Agent"
    
    model:
      id: <model-id>
      max_tokens: 200000
      region: us-west-2
    
    system_prompt: |
      你是一个编排代理，帮助用户完成游戏舆情分析报告...
    
    tools:                     # 从工具注册表中声明所需能力
      - document_reader        # PDF/Word/Excel/CSV 解析
      - s3_tools               # 项目级 S3 读写
      - image_reader
      - shell
    
    mcps:
      - duckduckgo_search      # 通过 MCP 协议接入网络搜索
    
    memory:
      type: STM_ONLY           # 短期记忆，支持 STM_ONLY / LTM_ONLY / STM_AND_LTM
      event_expiry_days: 30
    

部署只需一条命令：
    
    
    python cli.py validate uno_report_agent/agent.yaml   # 校验配置
    python cli.py deploy uno_report_agent/agent.yaml     # 生成代码并部署到 AgentCore
    

这套机制的几个设计要点：

  * 工具注册表（Tool Registry）：所有可用工具集中注册，声明其模块路径和 pip 依赖，部署时自动收集所选工具的依赖生成 `requirements.txt`；外部能力（如网络搜索）通过 Model Context Protocol（MCP）接入，与自研工具在配置层面同等对待。
  * 配置校验前置：`validate` 命令在部署前检查命名规范、工具/MCP 是否存在、编排路由是否指向有效的子智能体等，将错误拦截在部署之前。
  * 编排智能体同样配置化：YAML 中通过 `sub_agents` 段定义多个子智能体（各自的 system_prompt 和工具集）及路由规则，工具链生成完整的 Orchestrator 代码——按需懒加载子智能体、路由请求并支持流式返回。



最终效果是：新增一个分析场景 = 一个 YAML 文件 + 一次部署命令。与前文的分析模板系统结合，MARP 形成了两层配置化体系——YAML 定义智能体的”能力边界”（模型、工具、记忆、认证），分析模板定义智能体的”专业方法论”（分析框架、输出规范、证据规则）。业务团队和工程团队各自迭代自己的层，互不阻塞。

### 9.2 工具编排模式

智能体在执行分析时遵循可[预测](<https://aws.amazon.com/cn/what-is/forecast/>)的编排模式：

  * [数据管道](<https://aws.amazon.com/cn/what-is/data-pipeline/>)：下载 -> 解析 -> 分析 -> 格式化 -> 上传
  * 多源聚合：从多个文件/渠道提取数据，智能合并后统一分析
  * 转录管道：音频获取 -> Transcribe 转录 -> 格式化 -> 内容分析 -> 报告生成



### 9.3 多租户安全设计：Project-Scoped 凭证

MARP 的智能体拥有 S3 读写、Shell 执行等强大工具，这在多项目、多团队共用平台的场景下带来一个必须回答的问题：如何防止 A 项目的分析任务读取到 B 项目的数据？如果智能体使用一个拥有全桶读写权限的固定角色，一旦提示词被恶意构造（Prompt Injection），就可能造成跨项目的数据泄露。

MARP 的答案是把权限收敛从提示词层面下沉到 IAM 层面。用户经 Cognito 认证后，凭证服务从 DynamoDB 查询该用户拥有的项目列表，调用 AWS STS AssumeRole 并附加动态生成的 Session Policy，将 S3 权限精确限制在该用户项目对应的前缀之下：
    
    
    # 凭证服务动态生成 Session Policy（代码已简化）
    session_policy = {
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": ["s3:GetObject", "s3:PutObject"],
            "Resource": [
                f"arn:aws:s3:::{bucket}/projects/{project_id}/*"
                for project_id in user_projects   # 仅限当前用户的项目
            ]
        }]
    }
    credentials = sts_client.assume_role(
        RoleArn=AGENT_PROJECT_ROLE_ARN,
        RoleSessionName=f"agent-{user_id}",
        Policy=json.dumps(session_policy),  # 有效权限 = 角色权限 ∩ 会话策略
        DurationSeconds=3600                # 1 小时后自动过期
    )
    

临时凭证以环境变量注入智能体运行环境，S3 工具层统一封装凭证消费逻辑，对模型完全透明；系统提示词同时要求智能体”必须使用专用的 S3 工具，不要使用 AWS [CLI](<https://aws.amazon.com/cn/what-is/cli/>) 或直接调用 boto3″，确保数据访问都走封装了项目凭证的工具层。但提示词约束并非硬边界——真正的安全底线由 IAM 保证：即使提示词被注入、即使模型”想”去读别的项目的文件，凭证本身也不具备越权的能力。再加上 AgentCore Runtime 的会话级隔离，形成”IAM 硬边界 + 工具层封装 + 提示词软约束 + 运行时隔离”的纵深防御。

核心思想是”权限跟着会话走，而不是跟着角色走”——对于任何计划给智能体开放文件系统或数据库访问的团队，这都是值得优先考虑的模式。

## **十、实施效果**

  * 报告生成效率：报告生成效率：从数周的人工流程缩短为按需自动生成，分钟级交付。
  * 分析一致性：分析一致性：基于统一的模板和流程，消除了不同分析师之间的质量差异。
  * 多语种支持：多语种支持：智能体原生支持多语种内容分析，无需额外翻译环节。
  * 可扩展性：可扩展性：新的分析场景只需添加专业化智能体和对应模板，无需重构系统。



## **十一、展望未来**

Mattel163 与亚马逊云科技的合作仍在持续深化，未来的探索方向包括：

  * 跨场景联动分析：将应用商店评论、客服工单、问卷数据等多渠道反馈进行关联分析，构建 360 度玩家洞察视图。
  * 实时监控与预警：基于 Agent 的实时舆情监控，在问题萌芽阶段即自动生成预警报告。
  * 人机协同闭环：将人工审阅的修正反馈回 [RAG](<https://aws.amazon.com/cn/what-is/retrieval-augmented-generation/>) 知识库，让智能体持续学习和改进。
  * 多模态分析：结合游戏 UI 截图、短视频等多模态内容，让 AI 真正“看见”玩家体验。



从原始数据到可执行洞察，AI 智能体正在重塑游戏公司理解和响应玩家反馈的方式。当分析师从繁琐的数据处理中解放出来，他们可以将更多精力投入到真正需要人类创造力和判断力的工作中。

## **十二、参考资源**

  * [Amazon Bedrock 官方文档](<https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html>)
  * [Amazon Bedrock AgentCore 用户指南](<https://docs.aws.amazon.com/zh_cn/bedrock-agentcore/latest/devguide/agentcore-get-started-cli.html>)
  * [Strands Agents SDK 文档](<https://strandsagents.com/>)



**下一步行动：**

**相关产品：**

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=2>) — 加快代理投入生产的速度
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=3>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon Transcribe](<https://aws.amazon.com/cn/transcribe/?p=bl_pr_transcribe_l=4>) — 语音转文本
  * [Amazon SQS](<https://aws.amazon.com/cn/sqs/?p=bl_pr_sqs_l=5>) — 托管式消息队列



**相关文章：**

  * [用 Hermes Agent 在 AWS 上搭建投研助手](<https://aws.amazon.com/cn/blogs/china/building-investment-research-assistant-with-hermes-agent-on-aws/?p=bl_ar_l=1>)
  * [用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台](<https://aws.amazon.com/cn/blogs/china/building-enterprise-agentic-ai-with-kiro-on-aws/?p=bl_ar_l=2>)
  * [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇](<https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-6/?p=bl_ar_l=3>)
  * [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇](<https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-1/?p=bl_ar_l=4>)
  * [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第五篇](<https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-5/?p=bl_ar_l=5>)



[立即咨询 →](<https://aws.amazon.com/cn/contact-us/idp-ai/>)[ 从 AI 规划到落地实施，我们的专家团队为你全程护航。](<https://aws.amazon.com/cn/contact-us/idp-ai/>)

*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 胡金东

亚马逊云科技解决方案架构师，目前专注于游戏行业。在加入亚马逊云科技之前，曾担任德勤 Manager，作为项目经理和解决方案架构师，参与了多个大型数据湖和数据仓库项目的项目管理、架构设计和实施工作。

### 黄灏

亚马逊云科技生成式 AI 创新中心应用科学家，长期关注生成式人工智能、计算机视觉与可信人工智能领域，也担任 CVPR，AAAI，TMM 等顶级会议或期刊审稿人。

### 朱晓丹

亚马逊云科技客户解决方案经理，拥有多年公有云 MSP 服务咨询实施以及软件研发交付项目管理经验，目前在亚马逊云科技主要支持 OTA 以及零售等行业的客户

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
