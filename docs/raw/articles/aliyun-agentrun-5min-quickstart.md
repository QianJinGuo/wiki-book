---
source: wechat
source_url: https://mp.weixin.qq.com/s/uv0Krg46FOJxLRp-qTk-8w
author: 丛霄/阿里云云原生
date: 2026-05-11
title: 5 分钟上手 AgentRun：从注册到第一个 Agent 运行
type: raw
tags: [agent, aliyun, agentrun, serverless, tutorial]
review_value: 8
review_confidence: 7
review_recommendation: strong
review_stars: 4
ingested: 2026-05-11
sha256: c62a0c118593633d345a4e45ff90730c9e8be0ba38c4de58d58e5f02c13c1eb5
---
# 5 分钟上手 AgentRun：从注册到第一个 Agent 运行
## 核心定位
阿里云 AgentRun 想把分工重新摆正：
- **平台负责**：容器、扩缩容、网络、监控、灰度、合规
- **用户负责**：模型、提示词、工具
落到产品上最直接的体现就是「快速创建」模式——在浏览器里点几下，一个跑在生产级运行时上的 Agent 就上线了。
## 5 种创建模式
| 模式 | 定位 | 适合谁 |
|---|---|---|
| 快速创建 | 可视化配置，零编码 | 产品、业务、想先验证想法的人 |
| 代码创建 | 上传代码包/OSS/容器镜像 | 已有 LangChain/LlamaIndex/自研框架的团队 |
| 工作流创建 | 可视化节点编排 | 业务流程复杂、需要多节点串联 |
| 超级 Agent | 多 Agent 协同，主子 Agent 服务端编排 | 多角色协作、A2A 场景 |
| 模板创建 | 直接复用官方场景模板 | 想快速复制成熟方案 |
5 种模式共享一套运行时、一套监控、一套权限模型。快速创建 → 代码模式可一键升级，不用重建。
## 快速创建表单（4 步）
1. **模型服务**：通义千问、DeepSeek、Kimi、OpenAI、DashScope 即配即用；FunModel 托管模型；LiteLLM 统一网关（含鉴权/负载均衡/Fallback/限流/安全审查/重试）
2. **系统提示词**：8 个内置模板（智能问答/市场文案/金融分析/本地生活/Python数据分析/长期记忆/企业知识库/数据可视化）；AI 生成模式一句话描述需求
3. **工具与上下文**：Skills、MCP 工具、Function Call、沙箱（代码解释器/浏览器自动化）、知识库、记忆
4. **Agent 名称和描述**
## 详情页 8 个 Tab（覆盖全生命周期）
| Tab | 能力 |
|---|---|
| 概览 | 关键指标看板：调用量、版本、健康度 |
| 配置与调试 | 实时调整提示词、模型、工具，右侧面板即时测试 |
| 版本与灰度 | 多版本管理，按 Endpoint 灰度发布 |
| 集成与发布 | SDK、UI、MCP 几种集成方式开箱即用 |
| 弹性与实例 | CPU、内存、并发、会话超时配置 |
| 会话历史 | 完整调用链路回溯 |
| 评估评测 | 离线回归、在线 Trace 评测 |
| 可观测 | 自动接 ARMS，链路追踪、指标、日志一处看 |
## 平台自动处理的生产级能力
- **Serverless 容器调度**：基于函数计算，按会话请求数自动扩缩，无请求时自动缩零
- **会话亲和路由**：同一会话默认路由到同一实例
- **流式输出**：SSE 协议开箱即用
- **可观测探针**：ARMS 探针自动注入，指标/链路/日志全开
- **凭证动态注入**：模型/工具/沙箱凭证由平台动态颁发，一键启用/禁用
- **多租户隔离**：Workspace 粒度的资源/权限/计费边界
## 进阶能力
- **部署自研框架**：代码创建模式，支持代码包/OSS/容器镜像/WebIDE
- **多 Agent 协同**：超级 Agent 模式，原生支持 A2A
- **AgentRun CLI**：`curl -fsSL https://raw.githubusercontent.com/Serverless-Devs/agentrun-cli/main/scripts/install.sh | sh`
- **Python SDK**：`pip install agentrun-sdk`
- **MCP 工具市场**：平台已对接主流 MCP 生态
## 资源链接
- 控制台：https://functionai.console.aliyun.com/cn-hangzhou/agent/runtime/agent-list
- 文档：https://help.aliyun.com/zh/functioncompute/fc/what-is-agentrun
- CLI：https://github.com/Serverless-Devs/agentrun-cli
- SDK：https://github.com/Serverless-Devs/agentrun-sdk-python