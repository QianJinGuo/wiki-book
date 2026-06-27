# 从手动到智能：用 Kiro CLI + OpenSearch MCP 让每个人都成为 OpenSearch 专家 | 亚马逊AWS官方博客

## Ch11.036 从手动到智能：用 Kiro CLI + OpenSearch MCP 让每个人都成为 OpenSearch 专家 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 14.4KB | `entities/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert.md`

## 概述
从手动到智能：用 Kiro CLI + OpenSearch MCP 让每个人都成为 OpenSearch 专家 by awschina on 12 1月 2026 in Artificial Intelligence Permalink Share 1. 背景介绍 随着云原生技术和分布式搜索引擎的广泛应用，OpenSearch 已成为企业构建搜索和分析解决方案的重要选择。然而，OpenSearch 的使用往往面临着诸多挑战： 在运维层面 ，复杂的集群配置、繁琐的索引管理、性能调优的专业门槛，以及故障排查时需要深厚的技术积累，使得许多运维人员在日常工作中感到力不从心，难以快速响应业务需求。 在应用层面 ，从海量数据中提取有价值的信息、优化搜索性能、调整向量检索参数等任务，同样需要深入理解 OpenSearch 的查询语法和底层机制，这对开发人员和数据分析师来说也是不小的挑战。为了降低 Op

## 核心技术
Kiro CLI、Kiro IDE、Kiro MCP Skills、Amazon Bedrock ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/)

## 相关实体
- [把 Kiro CLI 当作 Agent SDK：一键订阅即可构建你的Agent应用 | 亚马逊AWS官方博客](/ch11-187-把-kiro-cli-当作-agent-sdk-一键订阅即可构建你的agent应用-亚马逊aws官方博客/)
- [使用 Kiro CLI 和 Agent Client Protocol 构建飞书 AI 聊天机器人 | 亚马逊AWS官方博客](/ch11-194-使用-kiro-cli-和-agent-client-protocol-构建飞书-ai-聊天机器人-亚马逊aws官方/)
- [AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联 | 亚马逊AWS官方博客](/ch09-009-ai-驱动的跨云网络搭建-用-claude-code-和-kiro-cli-实现-aws-腾讯云-ipsec-vpn-双/)
- [将 Kiro CLI 封装为 REST API：双通道架构实践 | 亚马逊AWS官方博客](/ch11-199-将-kiro-cli-封装为-rest-api-双通道架构实践-亚马逊aws官方博客/)
- [使用 Kiro 规范驱动开发加速数据质量建设 | 亚马逊AWS官方博客](/ch11-169-使用-kiro-规范驱动开发加速数据质量建设-亚马逊aws官方博客/)
- [用 Kiro CLI 自动搭建 FluentBit 日志采集方案：两种 EKS 埋点数据落地 S3 Parquet 的实战对比 | 亚马逊AWS官方博客](/ch11-205-用-kiro-cli-自动搭建-fluentbit-日志采集方案-两种-eks-埋点数据落地-s3-parquet-的实/)

## 深度分析
### 1. 技术架构的本质：MCP 协议作为"通用适配器"的核心价值
文章揭示了一个关键技术洞察：**MCP 协议的本质是一个"通用适配器"**，它让 AI 模型能够以统一的方式连接外部数据源和工具，而非针对每个外部系统定制专有接口。
这一设计的核心价值体现在： ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]
**解耦与标准化** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- OpenSearch MCP Server 基于标准 MCP 协议，为 AI 代理提供与 OpenSearch 交互的标准化接口
- 无论是 Kiro CLI 还是任何其他支持 MCP 的 AI 工具，都能通过同一协议连接 OpenSearch
- 工作流程：Agent 发起工具调用 → MCP Server 转发 → REST API 向 OpenSearch 集群请求 → 格式化响应返回
**独立 MCP Server 的战略优势**

- 文章选择独立（Standalone）MCP Server 而非内置版本，主要原因是兼容 OpenSearch 3.0 之前的版本
- 独立 MCP Server 作为独立进程运行在集群之外，这种架构确保了：
  - 不侵入现有 OpenSearch 部署
  - 可独立升级和维护
  - 支持多 Agent 共享同一 MCP Server 连接

### 2. Kiro CLI 的多层次 Agentic 能力解析
文章详细描述了 Kiro CLI 的四大核心能力，这些能力构成了一个完整的 Agent 系统： ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]
**Agent 模式与自适应对话** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- 理解代码库上下文，通过自然对话交互
- 快速响应开发和运维需求
**自定义 Agent 配置** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- 为特定用例定义专门的 Agent
- 指定可访问的工具、权限设置和自动包含的上下文信息
**MCP 协议集成** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- 通过 Model Context Protocol 连接专业化服务器
- 扩展 Kiro 的能力边界
**Subagent 委托机制** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- 将复杂任务委托给专门子 Agent
- 实现并行任务执行和实时进度跟踪
- 保持主 Agent 上下文的专注性
这四个层次形成一个递进的能力体系，从简单对话到复杂任务分解，体现了 AWS 对 AI Agent 能力的系统性思考。

### 3. 三大典型场景的技术深度分析
#### 3.1 日志分析：从专业技能到人人可做
传统日志分析需要掌握复杂查询语法和聚合函数。文章展示的场景——"从 vpc flow logs 帮我分析最近 12 个小时，流量最大的 TOP 10 IP"——揭示了关键转变：
**Kiro CLI 的处理流程** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]
1. 解析自然语言意图 ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]
2. 自动调用 OpenSearch MCP Server 的查询工具 ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]
3. 执行聚合查询 ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]
4. 生成分析结果并提炼关键发现 ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]
这一场景的核心价值不是"查询速度更快"，而是**消除了技能门槛**——任何能用自然语言描述需求的人都能完成原本需要专业知识的工作。

#### 3.2 滚动日志策略：ISM 的智能配置
OpenSearch ISM（Index State Management）策略配置传统上需要理解 JSON 结构、状态转换逻辑和各种参数。文中案例展示的流程：
1. 自然语言查询索引情况 ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]
2. 检查现有索引模板（分片数、副本数、压缩算法） ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]
3. 自然语言描述需求（"30天滚动周期"） ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]
4. Kiro 自动生成并应用 ISM 策略 ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]
关键洞察：Kiro CLI 在此场景中扮演了**翻译层**角色——将人类可理解的需求翻译为 OpenSearch 可执行的配置，同时自动完成检查-创建-应用的全流程。

#### 3.3 向量搜索优化：从"艺术"到"科学"
向量搜索的 HNSW 算法参数（m、ef_construction、ef_search 等）传统上需要深入理解底层机制和反复试错。文章展示了两个子场景：
**向量索引参数优化** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- 加载 OpenSearch 向量搜索最佳实践知识文档
- Kiro 自动分析现有索引参数
- 根据最佳实践给出优化建议
**向量搜索性能分析** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- 当查询性能不满足需求时
- Kiro 帮助分析集群是否存在问题
这一场景的核心价值在于**知识外挂**——将最佳实践知识库独立于模型之外，通过 add context 方式加载，让 Kiro 在推理过程中引用权威参考，而非依赖模型自身的知识。

### 4. 技术组合的战略意义：从工具到平台
文章揭示了一个更深层的趋势：**Kiro CLI + OpenSearch MCP Server 的组合，本质是将 OpenSearch 从一个"需要专业操作的工具"转变为一个"可通过自然语言调用的平台"**。
这一转变对行业的影响： ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- 运维人员不再需要记住复杂语法
- 开发者不再需要深入理解底层机制
- 组织可以建立最佳实践知识库，让 AI Agent 统一引用
- 人机协作模式从"人类执行、AI 建议"转变为"AI 执行、人类监督"

## 实践启示
### 立即可行的行动
**1. 评估独立 MCP Server 部署** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- 如果你的 OpenSearch 版本低于 3.0，独立 MCP Server 是唯一选择
- 部署前需准备：OpenSearch URL、认证方式（Basic Auth 或 IAM Role）、必要的环境变量
- 配置入口：`~/.kiro/settings` 目录下的 JSON 配置文件
**2. 建立场景化知识文档** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- 向量搜索最佳实践文档（如文章中使用的知识库）
- ISM 策略配置模板
- 常见日志分析查询模式
- 这些文档通过 `add context` 加载后，Kiro 可在对话中引用
**3. 从日志分析场景切入** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- VPC Flow Logs 是相对标准化的场景，适合作为首个试点
- 验证自然语言查询的准确性和响应质量
- 逐步扩展到 ISM 策略配置和向量搜索优化

### 中期建设方向
**1. 构建 MCP Server 生态** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- 除 OpenSearch 外，评估其他数据源的 MCP Server 集成可能性
- 通过 MCP 协议连接多个外部系统，形成统一的 AI Agent 操作界面
- 注意：MCP Server 应作为独立进程管理，便于独立升级
**2. 建立运维知识库** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- 整理 OpenSearch 运维中的常见问题和解决方案
- 结构化最佳实践（参数配置、性能调优、故障排查）
- 通过 add context 方式外挂知识，而非依赖模型自身知识
**3. 设计 Subagent 分工策略** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- 对于复杂任务，考虑使用 Subagent 委托机制
- 定义专门的子 Agent 处理特定场景（如日志分析 Agent、索引管理 Agent）
- 保持主 Agent 上下文的专注性，避免信息过载

### 长期战略思考
**1. 技能民主化与组织能力建设** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- 当工具使用门槛降低，组织应重新思考"专业技能"的定义
- 核心竞争力从"会操作工具"转向"理解业务需求并转化为 AI 可执行的任务描述"
- 培训重点应从"工具使用"转向"人机协作模式"
**2. 标准化与定制化的平衡** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- MCP 协议提供标准化接口，但具体实现需要结合组织实际情况
- 评估哪些场景适合标准化流程，哪些场景需要定制化配置
- 保持 MCP Server 的可升级性，避免与特定版本强绑定
**3. 监控与治理框架** ^[https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/]

- AI Agent 执行操作的风险需要监控机制
- 建立操作日志和审计跟踪
- 定义 AI Agent 的操作权限边界，避免意外影响生产环境
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert.md)

---

