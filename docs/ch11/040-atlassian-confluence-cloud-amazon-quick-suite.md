# Atlassian Confluence Cloud 与 Amazon Quick Suite 集成

## Ch11.040 Atlassian Confluence Cloud 与 Amazon Quick Suite 集成

> 📊 Level ⭐⭐ | 14.0KB | `entities/integrate-atlassian-confluence-cloud-with-amazon-quick.md`

## 概述
Amazon Quick 与 Atlassian Confluence Cloud 的集成旨在消除多系统切换带来的上下文丢失问题。当文档集中在 Confluence，而相关数据散布在其他系统时，团队需要频繁切换工具、重复检索、手动聚合信息——这些中断会拖慢决策速度，拉大「已有知识」与「可操作洞察」之间的差距。
Quick 通过两种互补机制提供集成能力：

- **Knowledge Bases（知识库）**：预先索引 Confluence 内容，支持语义搜索和 RAG（Retrieval Augmented Generation），适合广度搜索
- **Actions（操作）**：连接 Confluence Cloud 实时 API，支持页面创建、更新、检索等精确操作，适合精准写入

## 核心概念
### Knowledge Base 集成
Knowledge Base 在用户查询前预先抓取并索引 Confluence 内容。创建后，Quick 连接到 Confluence Cloud、检索文档和 wiki，构建可搜索索引。用户提问时，Quick 从预建索引中检索相关信息，而非实时连接外部系统。这种方式使非结构化内容可通过自然语言查询即时访问。
配置 Knowledge Base 时支持**文档级访问控制（ACL）**，可基于 Confluence 原生权限体系实现细粒度控制：

- **Spaces**：空间级权限默认应用于所有文档
- **Pages**：页面可限制到特定用户和组，嵌套页面继承父页面限制
- **Blogs**：博客文章可限制到特定用户和组
- **Attachments**：附件继承父文档的访问控制

### Action 集成
Actions 在查询时连接外部系统，执行读取、写入和自动化任务。Confluence Cloud 支持三种 Action 配置方式：
1. **内置连接器（Built-in connector）**：预构建、配置驱动的集成（如 Confluence Cloud、Jira、Salesforce）
2. **自定义 REST API**：使用 OpenAPI 规范连接自有或第三方 API
3. **MCP（Model Context Protocol）服务器**：基于标准协议的动态工具发现方式
本文重点介绍使用内置连接器配置 Action 集成。

### Quick Spaces
Spaces 将 Confluence 资源（Knowledge Bases、Actions、文件、Dashboards）聚合到统一工作空间，避免在各个独立资源间切换。Focused Spaces 帮助 Quick 更好地理解完整资源集，从而提供更准确的响应。

## 前置要求
配置集成前需准备：

- **Atlassian Confluence Cloud**：具备管理员权限的开发者账户，可创建 OAuth 2.0 应用并管理 API 范围
- **Amazon Quick 订阅**：Quick Enterprise（创建集成）或 Quick Professional（使用现有集成）
- **AWS 账户**：具备 IAM 权限以访问 Quick 并创建集成
该集成遵循 AWS [共享责任模型](https://docs.aws.amazon.com/quick/latest/userguide/sec-data-protection.html)：AWS 负责基础设施和底层服务的安全性，用户负责配置 OAuth 权限、管理 API 范围、通过权限设置控制 Confluence 内容访问，以及验证与组织数据治理策略的一致性。

## 配置步骤
### 1. 创建 Knowledge Base
在 Quick Console 中选择 **Knowledge** 按钮，在 **Set up new knowledge base** 部分点击 Atlassian Confluence Cloud 卡片上的加号 (+) 图标。选择 **My Data Access Integration** 下拉菜单并点击 **Add account** 连接 Confluence Cloud 实例。
输入 Confluence URL（格式如 `yourinstance.atlassian.net`），接受 OAuth 权限提示即可完成连接——无需 API 密钥、管理后台访问或 IT 介入。
如需启用文档级 ACL，需勾选 **Use Atlassian admin credential** 并填写 API Key、Organization ID 和 Directory ID。
创建成功后，Knowledge Base 出现在 **Existing Knowledge bases** 部分，**Status** 列显示同步状态。同步完成后状态变为 **Available**。

### 2. 创建 OAuth 2.0 应用
在 [Atlassian Developer Console](https://developer.atlassian.com/) 创建 OAuth 2.0 (3LO) 集成应用：
1. 创建 OAuth 2.0 (3LO) 集成，输入应用名称并同意开发者条款
2. 添加 Callback URL（Quick 生成的格式为 `https://{region}.quicksight.aws.amazon.com/sn/oauthcallback`）
3. 配置 API Scopes：
**User Identity API scopes:**

- `read:me` – 查看活动用户资料
- `read:account` – 查看用户资料
**Confluence API scopes:**

- `search:confluence` – 搜索 Confluence 内容
- `read:page:confluence` – 读取页面内容
- `write:page:confluence` – 创建和修改页面
- `read:space:confluence` – 访问空间信息
从 **Settings** 页面获取 **Client ID** 和 **Secret**。

### 3. 创建 Action 集成
在 Quick **Connectors** 页面选择 **Create for your team** 选项卡，点击 **Atlassian Confluence Cloud** 卡片。选择 **Custom OAuth app** 并提供：

- **Base URL**：`https://api.atlassian.com/ex/confluence/yourInstanceId` 格式
- **Client ID / Client Secret**：来自 Atlassian Developer Console
- **Token URL / Authorization URL**：使用默认示例
- **Redirect URL**：保持默认
发布后在 **Connection Details** 部分点击 **Sign in** 完成授权。

### 4. 创建 Quick Space
选择 **Spaces** > **Create Space**，输入描述性名称。选择 **Add Knowledge** 并添加 Confluence Knowledge Base。然后通过 **Actions** 按钮添加 Action 集成。
Space 创建后，Confluence 资源在整个 Quick 生态中可用，支持：

- **Collaboration**：跨组织共享一致、治理良好的 Confluence 内容视图
- **Custom Agents**：构建以 Confluence 文档为知识源的专用代理
- **Quick Flows**：自动化引用或更新 Confluence 内容的工作流
- **Quick Research**：基于 Confluence Knowledge Base 运行深度分析报告

## 使用场景
### 自然语言查询 Confluence 内容
通过 Quick Chat 界面直接提问，Quick 从索引的 Confluence 内容中检索答案，并附带指向原始页面的来源引用。支持多源聚合响应。

### 执行 Confluence 操作
通过自然语言执行 Confluence 操作（创建页面、更新内容、管理页面/空间等）。Quick 显示 **Requesting Action review** 卡片，用户可检查页面详情后批准或拒绝。页面创建成功后返回直接访问链接，格式和内容自动保留。

## 深度分析
### 架构设计：双轨并行的知识流
Quick-Confluence 集成的核心架构建立在**索引预取 + 实时调用**的双轨机制上。Knowledge Base 在用户查询前完成内容抓取和向量化，构建静态索引，提供毫秒级语义检索能力；Action 则在触发时动态调用 Confluence Cloud 实时 API，执行精准写入操作。这一架构的巧妙之处在于将「搜索」与「执行」解耦——前者追求广度和速度，后者追求精度和实时性——两者共享同一 Confluence 数据源，形成互补而非重复的能力覆盖。

### ACL 粒度：从空间级到页面级的权限下沉
文档级 ACL 是该集成最具企业适用性的特性之一。Confluence 原生支持 Space → Page → Blog → Attachment 的四级继承权限体系，Quick 通过 Atlassian admin credential（API Key + Org ID + Directory ID）在实时验证时将其映射为用户可见的内容子集。这意味着即使 Knowledge Base 索引了全量内容，不同用户在同一查询中获得的答案也可能不同——真正的「千人千面」知识检索，而非管理员手动分割知识库。

### OAuth 2.0 (3LO) 的安全边界
Atlassian OAuth 2.0 (3LO) 采用用户身份授权流程，Quick 获得的访问令牌受制于授权用户的 Confluence 权限——这既是优势也是限制。优势在于 Quick 自然继承用户在 Confluence 中的身份和权限，限制在于管理员无法通过 Quick 层面提升权限进行跨角色内容访问。所有 API Scopes 均需用户在授权时逐项确认，形成了天然的最小权限边界。

### Quick Space 作为聚合层的元认知价值
Quick Space 将 Knowledge Bases、Actions 和文件聚合为统一工作空间，其价值不止于「减少切换」，更在于为 Quick 提供「上下文完整集合」以提升响应准确性。当 Quick 能够同时看到知识库和操作能力时，它能更准确地判断用户意图——是需要检索已有知识（→ Knowledge Base），还是需要执行某个动作（→ Actions）——避免将查询误路由到错误的能力入口。

## 实践启示
### 1. 优先配置 Knowledge Base ACL，再大规模推广
在团队层面部署前，务必完成文档级 ACL 配置并验证权限映射准确性。可创建一个测试 Space，混入不同权限级别的 Confluence 页面，通过不同用户账户查询同一问题，验证权限隔离是否生效。未配置 ACL 前，所有有 Knowledge Base 访问权限的用户都将获得全量内容——这在企业场景下可能是数据泄露风险。

### 2. OAuth Scopes 遵循最小权限原则
在 Atlassian Developer Console 配置 API Scopes 时，仅启用当前集成所需的最小范围集。例如，若仅需搜索和读取页面内容，则仅配置 `search:confluence` 和 `read:page:confluence`，暂不开启 `write:page:confluence`。这样即使 Quick OAuth 令牌泄露，攻击者的行动空间也受到限制。

### 3. 利用 Quick Space 的聚合特性构建专项代理
将 Confluence Knowledge Base 放入 Quick Space 后，可基于该 Space 构建专注特定领域的 Custom Agent。例如，针对「HR 政策」Space 构建专用代理，专门回答假期制度、报销流程等问题，而非让用户在一个通用的 Confluence 检索中自行筛选。专项代理能显著提升答案的相关性和可用性。

### 4. 将 Quick Flows 与 Confluence Action 结合实现知识闭环
Quick Flows 可自动化引用或更新 Confluence 内容的工作流。结合 Action 集成，可设计如下场景：Quick Research 生成竞品分析报告 → 通过 Quick Flow 自动将报告摘要写入指定 Confluence Space → 触发团队通知。这种「检索→生成→写入」闭环减少了人工复制粘贴和格式调整的负担。

### 5. 监控 Sync Reports 中的 skipped/failed 项
Knowledge Base 的 Sync Reports 是易被忽视的运维窗口。定期检查「skipped」和「failed」条目，可早期发现 Confluence 内容结构变化（如页面迁移、Space Key 变更）导致的索引不完整问题，避免用户发现答案缺失后才被动修复。

## 相关资源
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/integrate-atlassian-confluence-cloud-with-amazon-quick.md)
- [Amazon Quick 文档](https://docs.aws.amazon.com/quicksuite/)
- [Confluence Cloud Action 集成](https://docs.aws.amazon.com/quick/latest/userguide/confluence-action-integration.html)
- [Confluence Knowledge Base ACL 配置](https://docs.aws.amazon.com/quick/latest/userguide/confluence-kb-acl.html)
## 相关实体
- [Aderant Transforms Cloud Operations With Amazon Quick](ch11/191-aderant-transforms-cloud-operations-with-amazon-quick.html)
- [Amazon Quick Research Agentic Multi Source Citation](ch11/213-amazon-quick.html)
- [Integrating Aws Api Mcp Server With Amazon Quick Suite Using Amazon Bedrock Agen](ch11/157-amazon-bedrock.html)
- [Mcp Serveramazon Bedrock Agentcorequick Suite](../ch04/528-amazon-bedrock-agentcore.html)
- [Building Multi Tenant Agents With Amazon Bedrock Agentcore](../ch04/528-amazon-bedrock-agentcore.html)

---

