---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/announcing-web-search-on-amazon-bedrock-agentcore-ground-your-ai-agents-in-current-accurate-web-knowledge/
ingested: 2026-06-26
feed_name: AWS China Blog
source_published: 2026-06-26T07:39:12Z
sha256: 99e66c114edb9529cee4b4a856958c0b7f2685ed108f209da26dfd6ca8d12318
---

# 发布 Amazon Bedrock AgentCore Web 搜索功能：为人工智能代理提供实时、准确的网络知识支撑

今日，我们正式宣布 [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) Web 搜索功能全面可用。这是一款完全托管的工具，使代理能够在客户安全的 AWS 环境中零数据输出的情况下，根据当前引用的 Web 知识进行响应。

Web 搜索依托模型上下文协议（MCP），使用 Bedrock AgentCore 网关内置连接器目标。您的代理发送自然语言查询后，Web 搜索会返回关联性最高的文本摘要、来源网址、标题与发布日期，模型可基于这些信息开展推理，生成有据可依的回复。

该功能基于 Amazon 搜索基础设施构建，沉淀多年为 [Alexa+](<https://www.amazon.com/alexaplus/dp/B0CXRRF584?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)、[Amazon Quick](<https://aws.amazon.com/quick/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)、[Kiro](<https://kiro.dev/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 打造代理检索能力的实战经验。该功能采用多源事实匹配方案，融合 Amazon Web 索引与结构化知识图谱数据。除标准 Web 检索结果外，代理可调用 Amazon 知识图谱获取经过核验的事实信息，相比传统纯 Web 检索，能够返回关联性更强、准确度更高的回复。

本次功能上线后，您可以专注于构建代理，而不必手动向 Bedrock AgentCore 上的代理添加 Web 搜索，也无需管理其基础设施。人工智能代理读取用户问题，检索最新事实信息，依托模型训练数据之外的实时资讯执行各类所需操作。您无需将用户提示和检索查询发送至 AWS 以外的外部搜索 API 服务商，即可满足企业管控规范要求。

**_Bedrock AgentCore Web 搜索实操演示_**  
要开始使用，请在 [Bedrock AgentCore 控制台](<https://console.aws.amazon.com/bedrock-agentcore/home?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)中创建带 Web 搜索工具目标的 Bedrock AgentCore 网关。创建网关 URL 创建后，您可通过 API 调用、命令行界面（CLI）或 MCP 检查器完成交互操作。

如需在创建网关时添加 Web 搜索工具目标，请选择 **MCP 目标** 作为目标协议，**连接器** 作为目标类型。您可选择 **Web 搜索工具** 作为预配置目标，以检索关联性最高的 Web 搜索结果，包含链接、片段和元数据。

网关创建完成后，您可在网关详情页面查看 Web 搜索工具目标。您也可以向已存在的网关新增 Web 搜索工具目标。

要与 Web 搜索工具进行交互，可使用**查看调用代码** 部分中的示例调用代码。您可通过带有 API 请求的 Python 代码、MCP Python 软件开发工具包、Strands MCP 客户端以及 MCP 检查器使用代码片段。

例如，您可以与 [MCP 检查器](<https://modelcontextprotocol.io/docs/tools/inspector>)进行交互，这是一款用于测试和调试 MCP 服务器的交互式开发人员工具。 通过**网关资源 URL** 连接至 MCP 服务器后，您可在网关中为每个连接器目标找到对应的 Web 搜索工具。输入 Web 搜索查询内容，点击**运行工具** 以获取结果。

如需了解更多 Bedrock AgentCore Web 搜索功能的使用方法，请查阅 [Bedrock AgentCore 网关文档](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。

**_客户心声_**  
部分客户已提前体验这些新功能。以下是他们的反馈：

[Benchling](<https://aws.amazon.com/marketplace/seller-profile?id=seller-2xeeqw6omnqeq&trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 助力科研人员加快研发，使科学数据集中化、跨团队协作以及获取见解变得轻而易举。Benchling 人工智能代理负责人 Nicholas Larus-Stone 分享道：“使用 Benchling 人工智能的科研人员，现在可以询问他们正在积极研究的目标，并获得依托 Benchling 内部机构数据和公开文献得出的回答。由此能够产出更完整的科研成果，精准完成假设生成工作。依托 Amazon Bedrock AgentCore Web 搜索工具，客户可在安全、合规管控的环境中，将高质量公开文献数据融入业务流程，且无需改动现有数据管理模式。”

[Gen Digit](<https://aws.amazon.com/solutions/case-studies/gen-digital-video-case-study/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 致力于保护消费者和小型企业免受网络威胁，提供防病毒、反恶意软件、身份与隐私保护、虚拟专用网络和云备份服务。Gen Digital 人工智能与创新高级总监 Iskander Sanchez-Rola 分享道：“借助 Amazon Bedrock AgentCore Web 搜索工具，Norton Revamp 可助力从业者基于当下真实时事，生成贴合实时资讯、有据可依的内容创意，打造良好线上口碑。我们最看重的是，AWS 使用自己的搜索索引，所有查询操作均在受信任的 AWS 环境内完成。”

如需阅读更多客户案例，请访问[Amazon Bedrock 客户](<https://aws.amazon.com/bedrock/customers/>)。

**_现已推出_**  
Amazon Bedrock AgentCore Web 搜索功能现已在美国东部（弗吉尼亚州北部）区域正式推出。有关区域可用性和未来路线图，请访问[按区域列出的 AWS 功能](<https://builder.aws.com/build/capabilities/explore?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。

您可以立即开始使用 Bedrock AgentCore 的 Web 搜索功能，无需额外费用。您仅需支付网关产生的数据传输费用。AWS 新客户最高可领取 200 美元的免费套餐抵扣额度。要了解更多信息，请访问 [Amazon Bedrock AgentCore 定价](<https://aws.amazon.com/bedrock/agentcore/pricing/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)页面。

您可以在 [Amazon Bedrock AgentCore 控制台](<https://console.aws.amazon.com/bedrock-agentcore/home?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)中试用该功能，并将反馈发送至 [AWS re:Post for Amazon Bedrock AgentCore](<https://repost.aws/tags/TAaysfWwGaS3SNb1O0i1GkOg/amazon-bedrock-agentcore?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 或通过您常用的 AWS Support 联系方式发送。

— [Channy](<https://twitter.com/channyun>)
