# AgentCore Managed Harness

## Ch04.207 AgentCore Managed Harness

> 📊 Level ⭐⭐ | 10.8KB | `entities/agentcore-harness.md`

## Overview
亚马逊云科技 2026 年 4 月 24 日正式发布的托管 Harness 平台。核心理念：**你告诉 Agent 做什么，平台托管其余一切**。

## 核心概念：Harness Engineering
AI 工程三阶段：
1. **Prompt Engineering** — 怎么跟模型说话
2. **Context Engineering** — 怎么给模型喂信息
3. **Harness Engineering** — 怎么让 Agent 真正跑起来（2026 年新风口）
> "模型负责思考，Harness负责让思考落地。"
**Harness = 模型之外的一切**：编排逻辑、执行环境、工具连接、状态管理、身份认证、可观测性。
硅谷头部公司 2026 年纷纷独立记录相同模式，Harness engineering 已成为 AI 工程领域讨论最多的话题之一。

## 相关查询

- AWS AI Topic Map — AWS Bedrock、SageMaker、QuickSight 等服务支撑企业级 Agent 应用的完整生态 

## AgentCore Managed Harness 核心功能
### 1. 模型随便换
- 支持 Amazon Bedrock（海外）、OpenAI、Gemini、任何 OpenAI 兼容模型
- Session 内随时切换，**不丢上下文**
- 今天用这个，明天换那个，一行配置

### 2. 工具即插即用
- **MCP Server**：Model Context Protocol 标准扩展
- **AgentCore Gateway**：一键把现有 REST API 变成 Agent 可调用工具
- **Browser**：网页自动化
- **Code Interpreter**：沙箱代码执行
- **Inline Functions**：自定义函数

### 3. Skills 按需加载
- Markdown + 脚本形式的领域知识包
- 三种加载方式：容器镜像 / Session 启动时安装 / 每次调用传入
- 解决"Agent 什么都懂一点但什么都不精"问题

### 4. 自定义执行环境
- 携带自有 Docker 镜像，推到 ECR 即用
- Agent 跑在你定义的环境里，不是平台标准环境

### 5. Shell 命令直跑
- 克隆代码仓库、安装依赖、跑测试、提交代码
- 确定性操作**不走模型**，零 token 费用

### 6. 断点续跑
- 文件系统持久化
- 跨会话保持短期和长期记忆
- 随时暂停，随时恢复，进度不丢

### 7. 企业级安全
- 每个 Session 独立 **Firecracker microVM** 硬件级隔离
- Identity 管身份认证
- Observability 全链路自动 trace
- 架构上保证 Agent 出不了事

### 8. 不锁定
- 基于 **Strands Agents** 开源框架构建
- 需要更多控制？随时导出代码，自己部署

### 9. 定价
- 无 Harness 附加费
- 按底层 AgentCore 能力用量计费
- 不用不收

## 三步开始
```bash   
npm i -g @aws/agentcore@preview   # 安装CLI   

# 创建Harness：定义模型+指令+工具
# 调用：Agent秒级运行
```   

## AgentCore vs 自建 Harness
| 维度 | AgentCore Managed | 自建 |   
|------|------------------|------|   
| 部署时间 | 分钟级 | 数周 |   
| 基础设施 | 托管 | 自维护 |   
| 安全隔离 | Firecracker microVM | 需自建 |   
| 模型切换 | 配置级 | 代码级改动 |   
| 工具接入 | MCP/Gateway/内置 | 各自实现 |   
| 成本 | 用多少算多少 | 固定人力成本 |   

## 关联分析
本文与 [Claude Code 架构解析](../ch01-571-claude-code-架构解析/) 高度相关：

- Claude Code 拆解的七大模块（Tool Runtime / Permission / Query Loop / Task System / 扩展层）本质都是 **Harness 的一部分**
- AgentCore 是云厂商对"每个团队都在重复造轮子"这一痛点的**平台化回应**
- 两篇文章共同揭示：**Agent 的护城河不在模型，在 Harness**

## 深度分析
### 1. 为什么 Harness Engineering 在 2026 年爆发
2025 年之前，大多数团队将 Agent 框架（LangChain、AutoGen、 CrewAI）当作 Harness 本身。但随着模型能力（如 o3、 Gemini 2.5）跨越「能思考」的阈值，瓶颈从「模型能不能想清楚」转移到「想了之后能不能做到」。这催生了独立记录相同模式的行业现象——每个团队都在自建配套系统，每个团队都觉得自己在重复造轮子。
AgentCore 的出现代表云厂商正式承认：**Harness 是值得托管的基础设施层**，而不是每个客户自己造的东西。

### 2. Firecracker microVM 隔离的安全价值
传统 Agent 平台使用容器或进程隔离，Agent 代码理论上可以访问宿主机资源。Firecracker microVM 提供硬件级隔离，每个 Session 拥有独立的 Linux 内核，这意味着即使 Agent 执行恶意操作或被攻击，攻击面也严格限定在单个 microVM 内部。这是 AgentCore 与自建 Harness 方案在安全维度上最本质的差异。

### 3. Strands Agents 开源策略的双向价值
AgentCore 基于 Strands Agents 开源框架构建，这一选择创造了两条路径：

- **向外**：客户可以将运行时配置导出为纯 Strands 代码，迁移到任何支持 Strands 的平台，实现真正的「不锁定」
- **向内**：AWS 可以借助开源社区快速迭代框架能力，同时保持托管平台的增值层（安全、监控、按需计费）
这与 RedHat OpenShift 的开源商业化策略异曲同工——开源社区做深度，闭源平台做广度。

### 4. 按用量计费的经济逻辑
传统 Agent 部署需要预留计算资源（ECS Fargate、Lambda provisioned concurrency），产生固定成本。AgentCore 的「不用不收」定价模型假设 Agent 工作负载有显著的波峰波谷——现实中大多数企业 Agent 场景正是如此（白天高、夜间低；工作日高、周末低）。这使得 AgentCore 的 TCO 对中小企业极具吸引力，但也意味着高频稳定负载场景下可能不如自建方案经济。

### 5. Skills 机制解决「万金油 Agent」问题
通用大模型在垂直领域表现「还行但不专业」，是企业在生产落地中的核心痛点。Skills 机制通过「按需注入领域知识包」的方式尝试解决——不是让模型记住一切，而是在执行特定任务时加载对应技能。这比 fine-tuning 更灵活，比 RAG 更轻量，比 Prompt 注入更可控。

## 实践启示
### 评估阶段：是否值得从自建迁移到 AgentCore
**适合迁移的场景**：

- 团队正在自建或维护 Harness 系统，且已投入 >3 人月
- 安全合规要求高，需要硬件级隔离（金融、医疗、政府客户）
- 需要多模型动态切换（同时使用 Bedrock + OpenAI + Gemini）
- 希望分钟级部署而非数周搭建
**不适合迁移的场景**：

- 已有成熟的 Agent 基础设施，且换模型频率极低
- 高度定制化需求无法通过配置满足，需要深度魔改 Runtime
- 工作负载 24x7 稳定高频，自建成本已摊薄

### 设计阶段：最大化 AgentCore 价值
**工具层设计**：优先使用 MCP 协议接入工具而非自定义 REST 封装。MCP 是新兴的标准生态，AgentCore 对其有原生优化，且未来社区工具库会持续丰富。
**Skills 组合策略**：不要试图做一个「全能的」Agent。根据业务场景设计 Skill 组合——例如「代码审查 Skill」「数据分析 Skill」「文档生成 Skill」，每个 Skill 独立加载、按需调用。
**Shell 命令最大化**：确定性操作（git clone、npm install、pytest）一定要走 Shell 命令而非 LLM 推理。这是零成本且确定的行为，交给模型纯属浪费。
**Session 持久化设计**：利用断点续跑能力设计长时间任务（如自动化测试流水线），避免网络中断导致从头重来。

### 安全阶段：身份与可观测性
**Identity 优先**：不要跳过 Cognito 集成。虽然看起来增加了配置复杂度，但 JWT 本地校验的延迟和成本优势在实际高并发场景下非常显著。
**Observability 必开**：AgentCore 的全链路 trace 基于 OpenTelemetry，启用成本极低但排查问题价值极高。建议所有生产 Agent 都开启。

### 演进阶段：避免供应商锁定
即使使用 AgentCore 托管服务，保持至少每月review一次「导出成本」——将当前配置导出为 Strands Agents 代码，评估自部署可行性。这不是说要马上迁移，而是确保供应商定价变化时你有退路。

## Related
- [原始文章存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agentcore-managed-harness.md)
- [OpenClaw多租户迁移: Phase 2&3部署](../ch04-440-openclaw-multi-4/)
- [AgentCore Runtime部署Apache Doris MCP Server](../ch11-156-runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analyt/)
- [AgentCore Identity: 3-legged OAuth+Session Binding的安全架构](../ch04-171-agentcore-identity-3-legged-oauth-session-binding的安全架构/)
- [OpenClaw多租户迁移: 背景与架构概览](../ch04-432-openclaw-multi-1/)
- [OpenClaw多租户迁移: Phase 1 基础设施部署](../ch04-390-openclaw-multi-3/)
- [柚漫剧 AI 全流程提效拆解](../ch01-356-柚漫剧-ai-全流程提效拆解/)
- [AgentCore Browser OS级操作：Action-Screenshot-Reaction闭环](../ch04-156-agentcore-browser-os级操作-action-screenshot-reaction闭环/)
- [Amazon Bedrock模型推理的Serverless异步架构](../ch11-067-amazon-bedrock-model-inference-serverless-architecture-case/)
- 深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践
- [Code as Agent Harness 综述](../ch09-046-code-as-agent-harness-综述/)
- [harness-engineering-systematic-explainer](../ch05-036-harness-engineering-systematic-explainer/)
- [AI Agent 工程师能力地图](../ch04-139-ai-agent-工程师能力地图/)

## 相关实体
- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](../ch04-329-introducing-os-level-actions-in-amazon-bedrock-agentcore-bro/)

- [AWS DevOps Agent 实战：云网络故障自主调查与修复建议](../ch04-258-aws-devops-agent-实战-云网络故障自主调查与修复建议/)
- [Your Chief Agent Operator Lobehub](../ch04-368-your-chief-agent-operator-lobehub/)
- [当 agentic ai 重塑生产关系：智能体浪潮下的企业战略与行动框架](../ch04-051-当-agentic-ai-重塑生产关系-智能体浪潮下的企业战略与行动框架/)
- MOC

---

