---
title: Harness工程火遍硅谷，AgentCore今天交卷!
source_url: https://mp.weixin.qq.com/s/n3j56hLiv1p0ZIRGMFwuLA
publish_date: 2026-04-24
tags: [wechat, article, openai, agent, harness, bedrock, aws, strands, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 28fd560c2cd510f2402ebd7a7db245477aa7c4899e538c5a6cbf6da7d6be92c4
---
# Harness工程火遍硅谷，AgentCore今天交卷!
## 核心概念
**Harness = 模型之外的一切**：编排逻辑、执行环境、工具连接、状态管理、身份认证、可观测性。
**三个工程阶段**：
1. Prompt Engineering — 怎么跟模型说话
2. Context Engineering — 怎么给模型喂信息
3. **Harness Engineering** — 怎么让 Agent 真正跑起来（2026 年新风潮）
> "模型负责思考，Harness负责让思考落地。"
## AgentCore Managed Harness 核心特性
| 特性 | 说明 |
|------|------|
| **模型随便换** | Bedrock/OpenAI/Gemini/兼容模型，session 内随时切换，不丢上下文 |
| **工具即插即用** | MCP Server、AgentCore Gateway（REST API 转工具）、Browser 自动化、Code Interpreter |
| **Skills 知识包** | Markdown+脚本领域知识，按需加载，解决"什么都懂但都不精" |
| **自定义环境** | 携带自有 Docker 镜像，源码/依赖/运行时自主定义 |
| **Shell 直跑** | 确定性操作（克隆/安装/测试）不走模型，零 token 费用 |
| **断点续跑** | 文件系统持久化，跨会话保持记忆，随时暂停恢复 |
| **Firecracker 隔离** | 每个 session 独立硬件级 microVM 隔离 |
| **不锁定** | 基于 Strands Agents 开源框架，可随时导出代码自部署 |
| **无附加费** | 按底层 AgentCore 能力用量计费，不用不收 |
## 三步开始
```bash
npm i -g @aws/agentcore@preview   # 安装CLI
# 创建Harness：定义模型+指令+工具
# 调用：Agent秒级运行
```
## 关键引用
> "每个做Agent的团队都在搭这套系统。每个团队搭出来的都不一样。每个团队都觉得自己在重复造轮子。"
> "AI工程的重心一直在往'让Agent真正能跑'的方向移动。"