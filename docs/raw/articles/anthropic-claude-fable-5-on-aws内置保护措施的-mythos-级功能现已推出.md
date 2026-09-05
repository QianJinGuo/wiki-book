---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/anthropic-claude-fable-5-on-aws-mythos-class-capabilities-with-built-in-safeguards-now-available
ingested: 2026-06-10
feed_name: AWS China Blog
source_published: 2026-06-10
sha256: bfd63b0a1c3bd4a9553d88bb8663184e779dafc01b5bf904d9556d31a6a84059
---

# Anthropic Claude Fable 5 on AWS：内置保护措施的 Mythos 级功能现已推出

今天，我们宣布 [Claude Fable 5](<https://www.anthropic.com/news/claude-fable-5-mythos-5>) 在 [Amazon Bedrock](<https://aws.amazon.com/bedrock/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 和 [AWS 云端 Claude Platform](<https://aws.amazon.com/claude-platform/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 上线。Claude Fable 5 能为所有客户提供 Mythos 级功能，其强大的安全保护措施旨在使其安全用于更广泛的用途。在几乎所有基准测试中，Fable 5 均达到行业顶尖水平，在工程、知识类工作任务和视觉解析领域表现尤为突出，专为宏大的长周期工作打造。  
  
借助 Bedrock 上的 Claude Fable 5，您可以在现有 AWS 环境内进行构建并扩展推理工作负载。您也可以通过 AWS 云端 Claude Platform 使用 Claude Fable 5，从而获得 Anthropic 原生平台体验。

根据 Anthropic 的说法，Claude Fable 5 达标 AI 模型能力的跨越式升级。该模型的差异化特性如下：

  * **长周期异步任务执行** ：Claude Fable 5 可以处理前代模型无法稳定承载的复杂任务，无需干预即可长时间执行编码和知识类工作任务。
  * **高级视觉功能** ：Claude Fable 5 能够理解嵌套在文件和 PDF 中的图表和表格。这为金融、法律、分析、建筑和游戏领域的研究和文献密集型工作开辟了道路。在编码场景中，该模型以高保真度实施设计，并使用视觉功能对照目标来自检其输出。
  * **主动自我验证** ：该模型可以根据学习情况自我更新技能，开发自己的测试工具和评估。



Claude Fable 5 内置保障措施，可针对滥用风险提升的特定领域进行性能限制。与网络安全、生物、化学和健康相关的有害提示将自动回退，以从 Opus 4.8 接收回复。通过开发更强大的保障措施，Anthropic 能够将访问权限扩展至 Claude Fable 5 的几乎所有先进功能。没有安全限制的相同模型是 [Claude Mythos 5](<https://www.anthropic.com/news/claude-fable-5-mythos-5>)，该模型仅对少量经过审查的客户开放。

**_Claude Fable 5 模型的实际应用_**  
您可以在 Amazon Bedrock 和 AWS 云端 Claude Platform 上使用 Claude Fable 5。这篇文章将介绍在 Amazon Bedrock 上访问和使用该模型的指南。有关 AWS 云端 Claude Platform 的指南，请访问[文档](<https://docs.aws.amazon.com/claude-platform/latest/userguide/welcome.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)以了解更多信息。

要开始使用 Amazon Bedrock，您现在只能使用 [Anthropic Messages API](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)，通过 Anthropic SDK 调用 `bedrock-runtime` 或 `bedrock-mantle` 端点以编程方式访问该模型。您只能通过 [AWS 命令行界面（AWS CLI）](<https://aws.amazon.com/cli/?trk=769a1a2b-8c19-4976-9c45-b6b1226c7d20&sc_channel=el>)和 [AWS SDK](<https://aws.amazon.com/developer/tools/?trk=769a1a2b-8c19-4976-9c45-b6b1226c7d20&sc_channel=el>) 在 `bedrock-runtime` 继续使用 [Invoke](<https://docs.aws.amazon.com/bedrock/latest/userguide/inference-api.html>) 和 [Converse API](<https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。 控制台支持即将推出。

要访问 Claude Fable 5 模型，您必须使用 [Data Retention API](<https://docs.aws.amazon.com/bedrock/latest/userguide/data-retention.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 并设置 `provider_data_share`来选择启动数据共享，然后才能调用模型。发布时，没有用于此设置的控制台用户界面。
    
    
    curl -X PUT https://bedrock-mantle.us-east-1.api.aws/v1/data_retention \
      -H "x-api-key: <your-bedrock-api-key>" \ 
      -H "Content-Type: application/json" \
      -d '{ "mode": "provider_data_share" }'

如果你想使用 `bedrock-runtime` 引擎，请运行这个示例脚本。
    
    
    curl -X PUT https://bedrock.us-east-1.amazonaws.com/data-retention \
      -H "Authorization: Bearer <your_bearer_token>" \
      -H "Content-Type: application/json" \
      -d '{ "mode": "provider_data_share" }'

此模式允许 Amazon Bedrock 根据模型提供商的要求保留和共享您的推理数据。Anthropic 要求将输入和输出保留 30 天，并进行人工审查。要了解更多信息，请访问 [Amazon Bedrock 滥用检测](<https://docs.aws.amazon.com/bedrock/latest/userguide/abuse-detection.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。

让我们从适用于 Python 的 Anthropic SDK 开始，在 `bedrock-mantle` 端点上使用 Messages API。安装 Anthropic SDK。
    
    
    pip install anthropic

以下是调用 Claude Fable 5 模型的示例 Python 代码：
    
    
    import anthropic
    
    client = anthropic.Anthropic(
        base_url="https://bedrock-mantle.us-east-1.api.aws/anthropic",
        api_key= <your-bedrock-api-key>
    )
    
    message = client.messages.create( 
         model="anthropic.claude-fable-5",
    	 max_tokens=4096,
    	 messages=[ 
    	     { "role": "user",
    		   "content": "Design a distributed architecture on AWS in Python that should support 100k requests per second across multiple geographic regions",
    		 },
    	 ],
    )
    
    print(message.content[0].text)

要了解更多信息，请查看 [Anthropic Messages API 代码示例](<https://docs.aws.amazon.com/bedrock/latest/userguide/api-inference-examples-claude-messages-code-examples.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)和[笔记本实例](<https://github.com/aws-samples/anthropic-on-aws/tree/main/notebooks>)，了解多种使用案例和各种编程语言。

您可以在[Bedrock console](<https://console.aws.amazon.com/bedrock/home?#/playground?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)中使用 Claude Fable 5。在 **Playground** 中选择 **Claude Fable 5** 并进行测试。

您还可以将 Claude Fable 5 与 `bedrock-runtime` 端点上的 Invoke API 和 Converse API 一起使用。以下是使用适用于 Python 的 Amazon SDK（Boto3）调用 Converse API 以获得统一多模型体验的示例：
    
    
    import boto3 
    bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1") 
    response = bedrock_runtime.converse( 
        modelId="global.anthropic.claude-fable-5",
        messages=[ 
            { 
                "role": "user",
                "content": [ 
                    { 
                        "text": "Design a distributed architecture on AWS in Python that should support 100k requests per second across multiple geographic regions." 
                    } 
                ] 
            } 
        ],
        inferenceConfig={ 
            "maxTokens": 4096 
        } 
    ) 
    print(response["output"]["message"]["content"][0]["text"]) 

要了解更多信息，请访问显示如何通过 AWS SDK 使用 Amazon Bedrock 运行时的[代码示例](<https://docs.aws.amazon.com/bedrock/latest/userguide/service_code_examples_bedrock-runtime_anthropic_claude.html>)。

**注意事项**  
接下来，我将分享一些重要的技术细节，我认为这些细节会对您有用。

  * **模型访问权限** ：Claude Fable 5 的访问权限将逐渐扩展到所有 AWS 账户。如果您的账户还没有访问权限，它将很快启用，具体取决于您的 Bedrock 使用量。如果您想快速访问此模型，请联系您平时的 AWS Support 人员。
  * **定价** ：当有害提示路由至 Opus 4.8 而不是 Fable 5 时，您只需支付 Opus 的费用。如果请求在对话中被屏蔽，则初始次元将按 Fable 费率收费，后续次元按 Opus 费率收费。要了解更多信息，请访问 [Amazon Bedrock 定价](<https://aws.amazon.com/bedrock/pricing/?trk=769a1a2b-8c19-4976-9c45-b6b1226c7d20&sc_channel=el>)页面。
  * **数据留存** ：对于 Fable 5、Mythos 5 以及未来在 Bedrock 上具有相似或更高能力水平的模型，Anthropic 会要求将 Mythos 级模型的所有流量保留 30 天。在有限时间内保留数据有助于 Anthropic 检测单次交换看不到的滥用模式。一旦您选择数据留存，您的数据将离开 AWS 的数据和安全边界。
  * **Bedrock 上的 Claude Mythos 5（限量预览版）** ：您还可以使用 Anthropic 功能更强大的模型来开展网络安全和生命科学工作，包括漏洞发现、药物设计和生物防御筛查。由于这些域的双重用途性质，目前访问受到限制。要了解更多信息，请访问[模型卡片文档](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-mythos-5.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。



**_现已推出_**  
Anthropic 的 Claude Fable 5 模型现已在美国东部（弗吉尼亚州北部）和欧洲地区（斯德哥尔摩）区域的 Amazon Bedrock 上线；查看[完整区域列表](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-fable-5.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)，了解未来更新。此外，Claude Fable 5 已在北美、南美、欧洲和亚太地区的 AWS 云端 Claude Platform 上线。

欢迎通过 Amazon Bedrock API、[AWS 云端 Claude Platform](<https://console.aws.amazon.com/claude-platform/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 体验 Claude Fable 5，并将反馈发送至 [AWS re:Post for Amazon Bedrock](<https://repost.aws/tags/TAQeKlaPaNRQ2tWB6P7KrMag/amazon-bedrock?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 或通过您常用的 AWS Support 联系方式发送。

— [Channy](<https://twitter.com/channyun>)
