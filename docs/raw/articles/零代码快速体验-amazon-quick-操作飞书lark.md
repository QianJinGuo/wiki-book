---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/quick-amazon-quick-lark
ingested: 2026-07-10
feed_name: AWS China Blog
source_published: 2026-07-08
sha256: 66c991117d9789702274907c9461d3e334f0f72211fca45a11f0926b84a3a362
---

# 零代码快速体验 Amazon Quick 操作飞书/Lark

摘要：本文分享如何利用 Amazon Quick 的远程 MCP Connector 能力，结合飞书/Lark的远程MCP server，让 Quick 用户直接通过对话完成飞书/Lark文档读取/创建、消息读取/发送、日程管理等操作，让Quick成为你的AI助手。  
  
**目录**

01 一、概述

02 二、前置条件

03 三、配置飞书/Lark远程MCP

04 四、接入Amazon Quick 网页端

05 五、接入Amazon Quick 桌面端

06 六、总结

* * *

## **一、概述**

飞书/Lark是许多公司/团队日常办公协作的主要平台，但 Amazon Quick 目前尚未内置飞书集成。本文分享如何利用 Amazon Quick 的远程 MCP Connector 能力，结合飞书/Lark的远程MCP server，让 Quick 用户直接通过对话完成飞书/Lark文档读取/创建、消息读取/发送、日程管理等操作，让Quick成为你的AI助手。

## **二、前置条件**

  1. Amazon Quick 访问权限
  2. 飞书/Lark远程MCP server权限，参考以下链接开通：


  *     * 飞书：<https://open.feishu.cn/document/mcp_open_tools/end-user-call-remote-mcp-server>
    * Lark：<https://open.larksuite.com/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode>



## **三、配置飞书/Lark远程MCP**

在飞书/Lark MCP 配置平台上创建远程 MCP 服务，并自定义工具（即飞书/Lark 开放平台服务端 API），灵活构建您业务所需的 MCP 工具。

### 3.1 登录飞书/Lark MCP配置平台

  * 飞书：<https://open.feishu.cn/page/mcp>
  * Lark：<https://open.larksuite.com/page/mcp>



### 3.2 在页面左侧，点击 创建 MCP 服务

### 3.3 在服务创建页面，完成以下配置

**3.3.1 在 MCP 工具设置 区域，确认当前用户身份**

使用 MCP 管理 Lark 业务资源时，将使用当前显示的用户。因此请确认当前用户身份正确；如不正确，请注销后使用正确的用户重新登录。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-1.png>) [图1 添加MCP]  
---  
  
**3.3.2 在 添加工具 卡片中，点击 添加**

**3.3.3 在 添加工具 对话框中，选择所需工具**

平台提供 现成工具包 供选择。如果不能满足需求，可以从定制工具列表中灵活选择各种工具。例如，如果业务需要 MCP 管理多维表格，选择”多维表格”即可。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-2.png>) [图2 添加Tool]  
---  
  
**3.3.4 点击 添加，然后在弹出的 获取用户授权 对话框中，确认授权用户登录信息和飞书/Lark MCP 应用获得的权限，然后点击 授权**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-3.png>) [图3 应用授权]  
---  
  
### 3.4 添加成功后，在 如何使用 MCP 服务器 区域，选择 传输模式，并查看 服务器 URL 和 JSON

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-4.png>) [图4 MCP 传输模式]  
---  
  
  * 传输模式：保持默认的 Streamable HTTP。Streamable HTTP 是基于 HTTP 协议的分块流式传输，支持文件和日志等任意数据格式的渐进式传输。
  * 服务器 URL 和 JSON：将这些链接配置到您的 AI 代理中，使其能够远程连接到 飞书/Lark MCP 服务。



## **四、接入Amazon Quick 网页端**

### 4.1 在Quick网页端中通过Remote MCP接入飞书/Lark

1\. 登录Amazon Quick

2\. 在页面左侧，点击 Connectors -> Create for your team -> Model Context Protocol

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-5.png>) [图5 创建Connector]  
---  
  
3\. 输入名称（Name）、描述（Description）以及上一步生成的 MCP 服务器端点（Endpoint）

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-6.png>) [图6 输入Connector信息]  
---  
  
4\. 点击 Create and continue

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-7.png>) [图7 继续]  
---  
  
5\. 审查（Review） 操作并点击 Next

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-8.png>) [图8 Review]  
---  
  
6\. 点击 Done 完成集成

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-9.png>) [图9 完成]  
---  
  
### 4.2 示例 – 在Quick网页端使用飞书/Lark

**4.2.1 创建Chat Agent**

1\. 在页面左侧，点击 Chat agents

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-10.png>) [图10 创建Chat Agent – 1]  
---  
  
2\. 输入代理身份和角色指令（Persona Instructions）

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-11.png>) [图11 创建Chat Agent – 2]  
---  
  
**4.2.2 使用 Chat Agent 协助处理 飞书/Lark 日常任务。例如，总结文档并发送消息给某人**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-12.png>) [图12 Quick中使用飞书/Lark – 1]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-13.png>) [图13 Quick中使用飞书/Lark – 1]  
---  
  
## **五、接入Amazon Quick 桌面端**

### 5.1 在Quick桌面端中通过Remote MCP接入飞书/Lark

1\. 打开Amazon Quick 桌面端

2\. 在左侧，点击 Capabilities -> MCP -> Add MCP

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-14.png>) [图14 添加MCP – 1]  
---  
  
3\. 输入 Name（名称） 和上一步生成的 MCP URL

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-15.png>) [图15 添加MCP – 2]  
---  
  
4\. 点击 Add MCP

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-16.png>) [图16 添加MCP – 3]  
---  
  
### 5.2 示例 – 在Quick桌面端使用飞书/Lark

1\. 在Quick 桌面端新建对话，并输入以下信息

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-17.png>) [图17 Quick Chat – 1]  
---  
  
2\. 在飞书/Lark中查看消息

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/quick-amazon-quick-lark-18.png>) [图18 Quick Chat – 2]  
---  
  
## **六、总结**

完成以上配置后，Amazon Quick 即可与飞书/Lark 无缝协同，作为您的 AI 助手深度融入日常工作流，帮助您更高效地处理任务。

**下一步行动：**

**相关产品：**

  * [Amazon Connect](<https://aws.amazon.com/cn/connect/?p=bl_pr_connect_l=1>) — AI 客户体验解决方案



**相关文章：**

  * [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](<https://aws.amazon.com/cn/blogs/china/tool-mcp-server-amazon-bedrock-agentcore-quick/?p=bl_ar_l=1>)
  * [三剑合璧Quick Suite + Agent Core + Kiro联动实践：海外物流报价助手实战](<https://aws.amazon.com/cn/blogs/china/quick-suite-agent-core-kiro-logistics-quote-assistant/?p=bl_ar_l=2>)
  * [基于 Amazon Connect 数据湖与 Quick 构建联络中心智能分析平台](<https://aws.amazon.com/cn/blogs/china/based-on-amazon-connect-data-lake-quick-build-intelligent-analytics-platform/?p=bl_ar_l=3>)
  * [从数据库连接到自然语言查询：Amazon QuickSuite 数据分析全流程实践](<https://aws.amazon.com/cn/blogs/china/amazon-quicksuite-data-analysis-end-to-end-practice/?p=bl_ar_l=4>)
  * [基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力](<https://aws.amazon.com/cn/blogs/china/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 李响

亚马逊云科技合作伙伴解决方案架构师，目前负责战略合作伙伴和媒体娱乐行业云应用的架构设计和技术咨询，在加入亚马逊云科技之前从事多年互联网产品技术架构和管理工作，专注于 GenAI 领域。

### 刘欣然

亚马逊云科技解决方案架构师，目前负责互联网媒体行业云端应用的架构设计与技术咨询。在加入亚马逊云科技之前从事多年互联网开发工作，目前专注于 Devops 与边缘计算领域。

### 郭韧

亚马逊云科技人工智能产品专家团队经理，负责 AI 相关解决方案的架构设计、实施和推广。

### 李君

亚马逊云科技资深生成式 AI 技术专家，负责基于亚马逊云科技生成式 AI 解决方案的设计、实施和优化。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
