# 三剑合璧Quick Suite + Agent Core + Kiro联动实践：海外物流报价助手实战 | 亚马逊AWS官方博客

## Ch11.020 三剑合璧Quick Suite + Agent Core + Kiro联动实践：海外物流报价助手实战 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 21.7KB | `entities/quick-suite-agent-core-kiro-logistics-quote-assistant.md`

## 概述
三剑合璧 Quick Suite + Agent Core + Kiro 联动实践：海外物流报价助手实战 是一篇 AWS 中国博客实战文章，演示如何利用 Amazon Kiro（AI 驱动开发环境）+ Amazon Bedrock AgentCore（企业级 AI 代理运行时）+ Amazon Quick Suite（AI 助手服务平台）构建一个跨境物流报价查询系统。
核心场景是：某国内办公用品供应商的国际事业部需要每周处理大量海外仓库物流报价查询，传统 Excel 查表方式效率低、错误率高。通过 Kiro 快速生成 MCP 工具代码，部署到 AgentCore Runtime，Quick Suite Flows 编排业务流程，最终实现 AI 对话式报价查询与 Excel 报告自动生成。
**三款产品定位：**

- **Amazon Kiro**：AI 驱动整合开发环境（Agentic IDE），通过自然语言对话将想法直接转化为可访问的网站和应用
- **Amazon Quick Suite**：完全托管的 AI 助手服务，业务人员可通过自然语言交互设计工作流，无需安装部署
- **Amazon Bedrock AgentCore**：企业级 AI 代理平台，提供 Runtime、内存、网关、身份管理、可观测性等核心组件，支持 MCP 协议
该方案整体周期可控制在 **3-5 个工作日**，无需 IT 研发团队介入，业务人员可自主调整报价规则和流程逻辑。

## 业务背景与客户痛点
### 客户场景
客户是国内领先的办公用品供应商，其国际事业部负责海外仓储和跨境物流业务。报价总表涵盖 **7 个物流渠道**：
| 渠道 | 说明 |
|------|------|
| USPS | 美国邮政服务 |
| FEDEX-HFG | 联邦快递重货渠道 |
| FEDEX-QFG | 联邦快递轻货渠道 |
| FEDEX-JFG | 联邦快递经济渠道 |
| GOFO PARCEL | GOFO 包裹服务 |
| GOFO GROUND | GOFO 陆运服务 |
| UNIUNI | UNIUNI 物流渠道 |
每个渠道的报价规则基于以下维度：物品尺寸（长宽高重量）、配送区域（Zone 1-8）、时效性（报价生效日期范围）、燃油附加费、偏远附加费等。

### 核心痛点
1. **人工查表效率低下**：每周处理报价查询按天计，每次查询需在 7 个 Excel Sheet 中逐一对比，单次查询平均耗时按小时计，容易出现人为错误
2. **报价时效性难以保证**：不同渠道报价生效日期不同，人工难以快速判断当前时间是否在有效期内，使用过期报价导致投诉和成本损失
3. **最优渠道选择复杂性**：需综合考虑价格、时效、区域、类型等多个因素，人工对比容易遗漏
4. **报告生成繁杂**：格式不统一，需手动整理数据生成 Excel 报告
5. **IT 资源受限**：IT 部门属于独立资源线，需走流程申请资源，但业务部门希望自主快速迭代

## 技术方案选型
### SaaS 服务化交付模式
业务部门倾向于 SaaS 服务化方式将 AI 融入业务流程：

- **Amazon Quick Suite**：完全托管 AI 助手服务，通过自然语言交互设计业务流程
- **Amazon Bedrock AgentCore**：MCP 生产级托管
- **Amazon Kiro**：AI 驱动开发工具，快速生成 MCP 代码并完成部署
最终业务人员通过 Web 界面和 API 直接访问，相比传统方案更加简单快速。

### 最小化 IT 研发介入
Amazon Kiro 通过 AI 辅助生成 MCP 工具代码，减少 **99% 的手工编码**；Amazon Quick Suite 通过拖拽方式设计业务流程；Bedrock AgentCore 提供开箱即用的 AI 托管容器。相比传统开发模式，Serverless AI 方案整体周期可控制在 **3-5 个工作日**。

### 聚焦效率提升场景
AI 核心价值在于提升业务效率，而非复杂的算法创新：

- **智能查询**：通过自然语言对话完成报价查询，无需记忆复杂规则
- **自动对比**：AI 自动遍历所有渠道，找出最优方案
- **时效校验**：自动过滤过期报价，确保数据准确性
- **报告生成**：一键生成标准化 Excel 报告

## 系统架构
整体架构包含三个部分：
1. **第一部分**：使用 Kiro 完成 MCP 的开发和生产级部署
2. **第二部分**：利用 Amazon Quick Suite 的 Flows 功能完成海外报价助手设计和开发
3. **第三部分**：用户通过 Chat 方式完成最新物品报价报告生成

### 基于 Kiro 的 MCP 开发与部署
传统开发方式需要手写大量代码（包括 S3 连接、Excel 数据解析、业务逻辑、错误处理等），通常需要几天时间。使用 Amazon Kiro 的 AI 驱动开发：
1. 通过自然语言描述需求
2. Kiro 自动生成生产级代码（包含错误处理、日志、性能优化）
3. Kiro 自动生成完整的单元测试
4. 一键部署到生产环境
**最终整体上线时间缩短到几个小时。**

### Excel MCP Server 架构设计
采用 Amazon Bedrock AgentCore 作为 MCP Server 的托管运行时，结合 Amazon Cognito 实现 OAuth 2.0 认证，通过 S3 预签名 URL 解决文件下载问题。
核心组件：

- **Amazon Quick Suite**：企业级 AI 助手界面，用户通过自然语言与系统交互
- **Amazon Cognito**：提供 OAuth 2.0 认证，使用 Client Credentials Grant 模式生成 JWT Token
- **Amazon Bedrock AgentCore**：无服务器运行时，托管 MCP Server，自动处理扩缩容
- **Excel MCP Server**：基于 excel-mcp-server 封装，新增 S3 上传和预签名 URL 功能
- **Amazon S3**：存储生成的 Excel 文件，通过预签名 URL 提供安全下载
工作流程：
1. 用户在 Quick Suite 输入自然语言请求（如物品尺寸信息）
2. Quick Suite 向 Cognito 发起 OAuth 2.0 Token 请求
3. Quick Suite 携带 Token 调用 AgentCore 的 MCP 端点
4. AgentCore 验证 Token 后调用 Excel MCP Server 的工具
5. MCP Server 使用 openpyxl 创建 Excel 文件并上传到 S3
6. 用户获得预签名下载链接

### Amazon Quick Suite Flows 设计
Flows 设计首轮 prompt 示例：
> 海外仓库有一个报价总表，里面包括渠道分类包括：USPS费用明细、FEDEX-HFG费用明细、FEDEX-QFG费用明细、FEDEX-JFG费用明细、GOFO PARCEL费用明细、GOFO GROUND费用明细、UNIUNI费用明细等多个渠道。同时物品发往不同的区域Zone价格不一样。同时上述的不同渠道报价明细表中对于报价生效日期也是有要求的，需要确定查询时间是否在报价表生效日期范围内。第一步先根据物品的长、宽、高去上面的渠道分类的sheet里面对比，找到单价最优惠的渠道和单价费用。
Flows 的 step 需要根据实际情况一步步确认调整和测试验证，最终流程执行完毕后客户可从下载链接下载报告。

## 经验总结与最佳实践
### AgentCore 部署 MCP Server 经验
1. **日志目录只读问题**：AgentCore 运行时大部分目录是只读的，excel-mcp-server 默认将日志写入 `/var/` 目录导致启动失败。解决方案：在导入第三方库之前 patch `logging.FileHandler`，将日志重定向到 `/tmp/` 目录
2. **无状态文件问题**：AgentCore 运行时是无状态的，每次请求可能在不同实例上执行。解决方案：设计 `create_workbook_and_upload` 工具，在单次请求中完成创建、写入、上传、返回链接的全流程
3. **无状态模式**：创建 FastMCP 实例时设置 `stateless_http=True`
4. **OAuth 认证限制**：agentcore invoke CLI 无法调用 OAuth 认证的 Agent（JWT Bearer Token 认证），AWS SDK/CLI 不支持传递自定义 Bearer Token。建议使用 curl 直接调用 API

### OAuth 2.0 认证配置注意事项
1. **Cognito Discovery URL 格式**：AgentCore 的 JWT 验证需要 OIDC Discovery URL，格式应为：`https://cognito-idp.{region}.amazonaws.com/{user-pool-id}/.well-known/openid-configuration`（注意是 User Pool ID 而非 Domain，需包含 `.well-known/openid-configuration` 后缀）
2. **allowedClients vs allowedAudience**：Cognito Client Credentials Grant 生成的 Token 不包含 `aud` claim，应使用 `allowedClients` 替代 `allowedAudience`
3. **S3 访问权限**：AgentCore 执行角色默认没有 S3 访问权限，需要额外配置
4. **文件名字符编码**：S3 的 Content-Disposition header 不支持非 ASCII 字符，中文文件名会导致下载失败或乱码，需使用 URL 编码

## 成本分析
| 费用类别 | 订阅月费用 | 备注 |
|----------|-----------|------|
| Amazon Quick Suite 基础设施 | $250 | 新用户前 3 个月免费 |
| Amazon Quick Suite 订阅 (Pro) | $20.00/用户/月 | |
| Amazon Quick Suite 订阅 (ES) | $40.00/用户/月 | |
| Amazon Bedrock AgentCore Runtime | ~$0.0008/次交互 | 按实际 CPU/内存消耗计费 |
| Amazon Cognito M2M | $0.00225/请求 | Token 请求 |
| Amazon S3 存储/传输 | $0.023/GB/月 | 前 100GB 免费 |
**举例**：每月订阅 10 个用户，MCP Server 完成 90 次请求，价格为：Quick Suite（基础设施 $250 + 订阅 $20×10）+ AgentCore Runtime $0.11 + Cognito M2M $0.2。

## 结论
本文验证了 Serverless 架构在跨境物流数字化场景中的最佳实践：

- **快速上线**：无需采购和配置服务器，从需求到上线仅需数天时间
- **零运维负担**：无需关注补丁更新、容量规划、高可用配置等基础设施管理
- **成本可控**：按实际使用量付费，避免资源闲置浪费，实现真正的降本增效
- **弹性扩展**：自动应对业务高峰，无需提前规划容量或担心性能瓶颈

## 核心技术栈
| 技术 | 用途 |
|------|------|
| Amazon Kiro | AI 驱动 MCP 代码生成与部署 |
| Amazon Bedrock AgentCore | MCP Server 托管运行时（Python 3.11, Stateless HTTP） |
| Amazon Quick Suite Flows | 业务流程编排与 AI 对话界面 |
| Amazon Cognito | OAuth 2.0 Client Credentials 认证 |
| Amazon S3 | Excel 文件存储与预签名下载 |
| MCP (Model Context Protocol) | AI 模型与外部工具的标准化连接协议 |
| excel-mcp-server | Excel 操作工具（基于 openpyxl） |

## 深度分析
### 三产品协同架构的价值
本案例展示了 AWS 三款产品在"AI 赋能业务"链路上的完整协同。从分工来看：

- **Kiro 解决开发效率**：传统 MCP Server 开发需要 2-3 天，Kiro 将其压缩到数小时，本质是通过自然语言生成生产级代码，减少人工编码量和出错概率
- **AgentCore 解决运行时治理**：无服务器架构承载 MCP Server，自动处理扩缩容、日志、身份验证，让开发者聚焦业务逻辑而非基础设施
- **Quick Suite 解决业务交付**：Flows 让业务人员自主编排流程，无需研发介入即可调整报价规则和对话逻辑
这条链路的核心价值在于：**将 AI 应用交付周期从"周"压缩到"天"，同时让业务人员获得自主迭代能力**。

### 无状态架构的重要性
案例中反复强调无状态设计原则，原因在于 AgentCore Runtime 的分布式特性：
1. **日志目录只读**：通过 patch logging.FileHandler 将日志重定向到 `/tmp/`，规避了只读文件系统限制
2. **单次请求完成全流程**：`create_workbook_and_upload` 工具将创建、写入、上传、返回链接在单次调用中完成，避免跨请求状态依赖
3. **stateless_http=True**：明确告知 FastMCP 运行在无状态模式，避免session状态累积
这对 MCP Server 设计有普遍启示：**任何工具函数都必须是自包含的，不能依赖本地文件系统或进程级状态**。这与 MCP 协议的分布式本质一致。

### OAuth 认证的关键细节
案例详细记录了 Cognito 配置的几个关键陷阱：

- **Discovery URL 必须包含 `.well-known/openid-configuration`**：这是一个常见错误，OIDC Discovery 端点有固定格式要求
- **Token 不包含 `aud` claim**：Client Credentials Grant 生成的 JWT 不含 audience，需要使用 `allowedClients` 而非 `allowedAudience` 做验证
- **S3 权限需单独配置**：AgentCore 执行角色默认无 S3 权限，基础设施权限需要显式授权
这些细节说明：在生产环境集成 OAuth 时，需要深入理解各云服务身份模型的差异，不能简单套用通用模板。

### Serverless AI 的成本模型
案例提供的成本分解具有参考价值：
| 组件 | 成本特点 |
|------|---------|
| Quick Suite 基础设施 | 固定月费 $250，但含免费期 |
| Quick Suite 订阅 | 按用户按月计费，与用户数线性相关 |
| AgentCore Runtime | 按调用计费，单次不到 $0.001，适合中等负载 |
| Cognito M2M | 按请求计费，Token 获取成本较低 |
| S3 | 按存储和流量计费，文件不大时成本极低 |
对于 10 用户 90 次/月的场景，月成本约 $480，其中基础设施占主导。这说明 Serverless AI 的成本结构适合"轻量级高频调用"场景，若调用量大幅增长，AgentCore 按调用计费模式会更有优势。

## 实践启示
### 业务人员主导的 AI 交付模式
本案例最重要的实践价值在于证明了**业务人员主导 AI 交付**的可行性。传统 AI 项目需要研发团队全流程介入，从需求分析、模型训练到系统部署都需要技术能力。而本方案中，业务人员可以通过 Quick Suite Flows 自主调整报价规则和对话逻辑，将迭代周期从"周"压缩到"小时"。
这对企业 AI 落地策略有重要启示：**AI 应用交付应优先考虑"业务人员可自主调整"的设计**，而非依赖研发团队做定制化开发。

### MCP 协议的生态整合价值
MCP 作为 AI 模型与外部工具的标准化连接协议，在本案例中展现了生态整合能力：通过 excel-mcp-server 封装 Excel 操作，结合 S3 预签名 URL 实现安全下载。这种"协议层标准化 + 工具层多样化"的模式，让 AI 系统可以灵活接入各种数据源和业务系统。
**企业在构建 AI 能力时，应优先考虑支持 MCP 协议的平台**，这样可以避免工具层与模型层的强耦合，实现工具的可替换性。

### 报价查询场景的 AI 应用范式
跨境物流报价查询是一个典型的**规则驱动 + 数据密集型**场景：查询逻辑清晰（比价格、比时效、比区域），但数据维度多（7 个渠道 × 多区域 × 多时效）。AI 在这类场景中的价值不在于"创新算法"，而在于：
1. **自然语言接口**：让业务人员用自然语言查询，无需记忆复杂规则
2. **自动遍历**：AI 自动对比所有渠道，找出最优方案
3. **时效校验**：自动判断报价有效性，过滤过期数据
4. **报告生成**：一键输出标准化报告，减少人工整理
这类场景的共性规律：**规则越清晰、数据维度越多、人力成本越高**的场景，AI 替代价值越大。

### 生产级 MCP Server 的设计原则
从案例踩坑经验可以提炼 MCP Server 生产部署的关键原则：
1. **日志必须可重定向**：假设所有本地目录都不可写，日志应写入 `/tmp/` 或使用云日志服务
2. **工具函数必须自包含**：每次调用完成完整业务流程，不能依赖本地状态
3. **OAuth 集成需要深入理解云身份模型**：不同云服务的 Token 格式和验证方式有差异
4. **文件编码需考虑国际化**：S3 header 不支持非 ASCII 字符，中文文件名需 URL 编码
这些原则适用于任何将 MCP Server 部署到生产环境的场景。

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/quick-suite-agent-core-kiro-logistics-quote-assistant/)
> 本篇作者：田培军，亚马逊云科技解决方案架构师

## 相关实体
- [以 Kiro 快速部署云上 Agent：只需几个小时，从业务需求到部署于 Amazon Bedrock AgentCore 落地 | 亚马逊 AWS 官方博客](../ch04/531-amazon-bedrock-agentcore.html)
- [AgentCore Runtime 部署 Apache Doris MCP Server](ch11/165-apache-doris-mcp-server-quick-suite-ai.html)
- [使用 Kiro CLI 和 Agent Client Protocol 构建飞书 AI 聊天机器人 | 亚马逊 AWS 官方博客](../ch03/046-agent.html)
- [把 Kiro CLI 当作 Agent SDK：一键订阅即可构建你的 Agent 应用 | 亚马逊 AWS 官方博客](../ch03/046-agent.html)
- [Amazon Bedrock AgentCore + Quick Suite 构建 AI Analytics](../ch04/531-amazon-bedrock-agentcore.html)
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/quick-suite-agent-core-kiro-logistics-quote-assistant.md)

---

