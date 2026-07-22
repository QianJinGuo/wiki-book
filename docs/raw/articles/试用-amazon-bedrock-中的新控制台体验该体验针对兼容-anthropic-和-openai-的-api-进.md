---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/try-the-new-console-experience-in-amazon-bedrock-optimized-for-anthropic-and-openai-compatible-apis
ingested: 2026-06-10
feed_name: AWS China Blog
source_published: 2026-06-05
sha256: 943a172c507dfee6686098ed5243e6da21c19ccb35b121717f8f85f05b87a7fd
---

# 试用 Amazon Bedrock 中的新控制台体验，该体验针对兼容 Anthropic 和 OpenAI 的 API 进行了优化

今天，我们宣布在 [Amazon Bedrock](<https://aws.amazon.com/bedrock/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 中推出新的控制台体验，您可以在 Amazon Bedrock 为实现高性能、可靠性和安全性而构建的下一代推理引擎上，使用最新的人工智能模型进行实验、迭代和扩展。该控制台刷新了工作流程，针对 `bedrock-mantle` 端点进行了优化，支持最新的 GPT、Claude 和开放权重模型，包括 OpenAI Responses API、OpenAI Chat Completions API 和 Anthropic Messages API。

借助新的控制台体验，您可以轻松找到合适的模型，并快速从评估过渡到生产。

  * **新模型卡片** – 您可以浏览完整的模型目录，在单一视图中，在功能、模态支持、上下文窗口和适用的服务配额方面进行并排比较，无需拼接文档，还可以限制计算器。
  * **基于项目的工作** – 您可以创建一个项目，通过一个反映生成式人工智能应用程序生命周期的简化工作流程来进行评估并审核用量洞察。
  * **实时文档** – 您可以使用项目感知型实时文档：代码示例、SDK 片段和 API 参考会自动使用您的项目变量预先填充。您可以将代码片段直接从控制台复制到您的应用程序中，无需修改即可运行。



**_如何开始使用_**  
您可以通过在 [Amazon Bedrock 控制台](<https://console.aws.amazon.com/bedrock/home?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)中选择**试用 Bedrock Mantle 控制台** 或使用[新的控制台链接](<https://console.aws.amazon.com/bedrock-mantle/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)来试用新的体验。

您可以找到一个基于项目的控制面板，按最近日期、最近使用的模型和项目列表来显示推理请求和错误。您可以在几分钟内创建项目、分配模型、配置 API 密钥并开始提出推理请求。

新的模型目录显示了 `bedrock-mantle` 引擎支持的最新 GPT、Claude 和开放权重模型。您可以查看功能、令牌、定价、输入/输出、定价信息和区域可用性的详细信息。您还可以在单个视图中比较多达 3 个模型。

当您选择项目控制面板时，您可以看到项目中使用的模型、令牌用量的分布，例如令牌总用量、每分钟的令牌用量、每分钟的推理请求数以及每个推理请求的令牌数。这可以为您的模型选择、提示优化和工作负载一致性决策提供信息。

您最多可以选择 3 个模型开始评估，以便在相同提示下并排比较响应。

要在项目中构建应用程序，请选择**入门** 。您可以迁移现有代码，使用 Anthropic 或 OpenAI SDK 构建新的应用程序，或者将人工智能编程助手连接到 Bedrock。

选择 **API 和 SDK** 、您的 SDK（Anthropic 或 OpenAI）、您的首选编程语言和身份验证方法。系统会显示您的环境代码，以便在终端中运行这些代码进行快速测试，或者保存到应用程序的 `.env` 文件中。您也可以发送带有示例代码片段的第一个请求，进而验证您的设置。

当您选择**客户端** 时，您可以选择想要连接到 `bedrock-mantle` 引擎的人工智能编程代理来源，例如 Claude Code、Cline、Codex、Cursor 或 OpenCode。其中提供了一些说明，包括如何安装人工智能代理、如何使用您的 AWS IAM 凭证或使用 Bedrock API 密钥、如何设置环境变量以及如何通过 Bedrock 路由来自每个人工智能代理的请求。

要了解兼容 Anthropic 和 OpenAI 的 API，请选择**实时 API 文档** 。您可以选择 **Anthropic API 协议** 来访问 Messages API 等 Claude 模型功能，或者选择 **OpenAI API 协议** 来访问 Responses API 等功能。

例如，当您选择 OpenAI Response API 时，该 API 会检索具有给定模型 ID 的模型响应。这些 API 引用会自动预先填充项目的选定模型 ID、区域、`bedrock-mantle` 端点 URL 和 API 密钥参考，并且这些内容会在您更改模型或设置时相应地更新。

您还可以选择现有的 Bedrock 控制台来管理完全托管的功能，例如代理、知识库、护栏、微调，或者在 `bedrock-runtime` 端点上运行的 InvokeModel 和 Converse API。

**_现已推出_**  
新的控制台体验已在提供 `bedrock-mantle` 端点的所有 AWS 区域推出：美国东部（弗吉尼亚州北部、俄亥俄州）、美国西部（俄勒冈州）、亚太地区（雅加达、孟买、悉尼、东京）、欧洲地区（法兰克福、爱尔兰、伦敦、米兰、斯德哥尔摩）和南美洲（圣保罗）。请查看[区域的完整列表](<https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)，了解未来的更新。

在[新的 Amazon Bedrock 控制台](<https://console.aws.amazon.com/bedrock-mantle/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)中试用新的控制台体验，并将反馈发送至 [AWS re:Post for Amazon Bedrock](<https://repost.aws/tags/TAQeKlaPaNRQ2tWB6P7KrMag/amazon-bedrock?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 或通过您常用的 AWS Support 联系方式发送。

— [Channy](<https://twitter.com/channyun>)
