---
title: "AI Infra 全景图：Agent Framework、调度、编排、沙箱、记忆管理、Tracing 分层拆解"
source_url: "https://mp.weixin.qq.com/s/dmlwqGylzG0eQVUlcZocUQ"
created: 2026-06-30
updated: 2026-07-02
type: source
tags: [ai-infra, agent-framework, production, architecture, infrastructure, llm-serving, agent-orchestration]
source: wechat
source_account: ThinkingAgent
author: Knock
ingested: 2026-07-02
sha256: 18a6bcb763089000951b79a518acb9f6e53529789edfbc844f4e987b37d9ef33
---

# AI Infra 全景图：Agent Framework、调度、编排、沙箱、记忆管理、Tracing 分层拆解

2026 年，几乎每家公司都在做 AI Agent。

但一个残酷的事实是：绝大多数 Agent 项目停留在Demo阶段，无法融入生产。

不是模型不行，不是算法不行——是 Infra 不行。

构建一个生产级 AI Agent 系统，你需要的远不止一个大模型和一个向量库。你需要算力调度、模型网关、数据管道、Prompt 管理、Agent 编排、工具沙箱、记忆系统、评测体系、可观测平台——还要让安全、CI/CD、成本和开发者体验贯穿每一层。

这就是完整的 AI Infra。

本文从 L0 到 L8，逐层拆解 9 层架构 + 4 个横切能力，给出工具选型和生产级最佳实践。

全景图：9 层 + 4 横切

先看全景，再逐层拆解。

纵向 9 层（从底层资源到上层应用）：

| 层级 | 名称 | 核心问题 |
|------|------|----------|
| L0 | 基础资源层 | 模型和应用运行在哪里？ |
| L1 | 模型与推理层 | 用哪个模型？怎么调用？怎么降本？ |
| L2 | 数据与知识层 | 模型如何安全、准确地使用企业私有知识？ |
| L3 | Prompt 与上下文层 | 如何组织模型能可靠执行的输入？ |
| L4 | 编排与 Agent 层 | 复杂任务如何被拆解、调度、执行？ |
| L5 | 工具执行层 | Agent 能做什么？执行边界在哪里？ |
| L6 | 状态与记忆层 | 系统如何记住一切而不越权？ |
| L7 | 评测与质量层 | 改动后质量是变好了还是变坏了？ |
| L8 | 可观测与运营层 | 出了问题能否定位？成本能否归因？ |

横向 4 个能力（贯穿所有层）：
- 安全治理
- CI/CD 与发布治理
- FinOps 成本治理
- 开发者体验（DevEx）

关键洞察：大多数团队只关注 L4（Agent Framework）+ L2（向量库），忽略了其他 7 层和 4 个横切能力。但生产级 Agent 的稳定性，恰恰取决于那些「不起眼」的基础设施。

L0：基础资源层——算力、存储、网络

L0 是所有 AI 系统的物理和云原生底座。

核心组件：
- 计算：GPU / TPU / NPU / CPU — NVIDIA A100/H100、Google TPU v5e
- 编排：容器调度 — Kubernetes、Ray、Slurm、Volcano、Kueue
- 存储：对象 / 块 / 文件 — S3、MinIO、JuiceFS、Alluxio
- 网络：高速互联 — RDMA、InfiniBand、VPC、服务网格
- 镜像：容器与模型 — Harbor、Artifact Registry、HuggingFace Hub
- 安全：密钥与隔离 — Secret Manager、KMS、多租户隔离

这一层回答的问题：模型和 AI 应用运行在哪里，资源如何调度，如何保证稳定、弹性和成本可控。

生产级实践：
- 推理用 GPU 按需弹性伸缩（如 Modal、RunPod Serverless），避免空跑
- 训练用 Ray Cluster + Kueue 做任务队列，多租户公平调度
- 模型权重统一存到 Artifact Registry，版本化管理，禁止散落本地磁盘

L1：模型与推理层——模型服务与智能网关

L1 管理模型的来源、调用和路由，是 AI Infra 的「神经中枢」。

核心组件清单：
- Model Gateway：统一入口，屏蔽不同供应商 API 差异
- Model Router：根据任务类型智能选择模型
- Inference Server：vLLM、TGI、TensorRT-LLM 等高性能推理引擎
- Model Registry：模型版本管理、元数据、A/B 测试
- Fallback / Rate Limit / Quota：容错、限流、配额
- Cache / Batching / Streaming：缓存、批处理、流式输出
- Quantization / KV Cache：量化和 KV 缓存优化

L1 核心竞争点：保证模型调用的低延迟、高吞吐、高可用，同时控制成本。

L2：数据与知识层——企业私有知识与 RAG 管道

模型固有的知识截止日期、幻觉和缺乏企业特定知识——RAG 解决了这些问题。

核心组件：
- ETL Pipeline：数据提取、清洗、分块（Spark、Airbyte、Unstructured）
- Embedding Model：文本向量化（OpenAI Ada、BGE、E5）
- Vector Database：向量存储与检索（Pinecone、Qdrant、Milvus、Weaviate）
- Hybrid Search：语义 + 关键词 + 多模态搜索
- Reranker：重排序提升召回精度（Cohere Rerank、BGE Reranker）
- Knowledge Graph：实体关系图谱（Neo4j、Amazon Neptune）
- Data Governance：数据溯源、权限、合规

生产级 RAG 的最佳实践：
- 多分块策略：按语义段落切分，保留文档结构
- Hybrid Search：向量相似度 + BM25 关键字，提升长尾召回
- 多路召回：多个来源同时检索，reranker 统一排序

L3：Prompt 与上下文层——如何组织模型能可靠执行的输入

模型的能力上限是模型决定的，但下限是 Prompt 工程决定的。

核心实践：
- Template Management：LangFuse、Helicone
- Context Window Management：动态压缩、滑动窗口、Token 预算
- Guardrails：NeMo Guardrails、Guardrails AI
- System Prompt 版本管理：每个生产变更都过 A/B 测试
- Few-shot 示例选择：按任务相似度动态选择示例

L4：编排与 Agent 层——复杂任务拆解、调度、执行

这是大多数人最熟悉的一层。

核心框架对比：
- LangGraph：基于有状态图的 Agent 编排，适合复杂多步骤工作流
- CrewAI：多 Agent 角色扮演，定义 Agent 角色和任务
- AutoGen：微软多 Agent 对话框架，Agent 间自动协商
- OpenAI Agents SDK：轻量级、原生支持
- Dify：低代码 Agent 构建平台
- Coze：字节跳动 Agent 平台
- Semantic Kernel：微软企业级集成框架
- Agno / Smolagents：轻量替代

L4 最佳实践——Agent 不是银弹，框架不是万能的：
- 简单任务：硬编码工作流 > Agent 自主编排
- 中等复杂：LangGraph 有状态图
- 高度复杂：多 Agent 分层 + Human-in-the-loop

L5：工具执行层——Agent 能做什么？执行边界在哪里？

Agent 的能力上限由它能调用的工具决定。工具越多，Agent 越强大，风险也越大。

实现方式：
- MCP（Model Context Protocol）：标准化工具接口协议
- Function Calling：OpenAI 原生函数调用
- Tool Sandbox：E2B、Fly（安全隔离的代码执行环境）
- Browser Use：Playwright、Browserbase（浏览器自动化）
- API Gateway：工具注册、鉴权、限流

安全边界：
- Agent 只能调用已注册的工具
- 工具执行返回结果，不返回原始系统权限
- 高危操作（写数据库、发邮件）加人工确认
- 所有工具调用记录日志

L6：状态与记忆层——系统如何记住一切而不越权

多轮对话、跨会话记忆、长期记忆——这是生产级 Agent 区别于 Demo 的关键。

记忆类型：
- 短期记忆（会话内）：LangGraph 状态管理、Memory Manager
- 长期记忆（跨会话）：Mem0、MemGPT、Zep
- 结构化记忆：用户画像、偏好、历史决策
- 非结构化记忆：对话摘要、知识积累

记住什么、不记住什么，是隐私和体验的平衡。

L7：评测与质量层——改动后质量是变好了还是变坏了？

没有评测，就没有质量控制。

评测体系：
- 单元评测：单个工具/函数调用是否正确（RAGAS、DeepEval）
- 端到端评测：完整任务完成度评分
- 回归评测：Golden Dataset + 自动评分
- 在线评测：A/B 测试、用户反馈
- 安全评测：Prompt Injection、Jailbreak 检测

生产实践：
- Golden Set：100-500 条典型用例，每次模型更新 / 技能修改都跑
- Auto-Eval：LLM-as-Judge 自动化评分
- 门禁：评分下降 > 5% 阻止发布

L8：可观测与运营层——出了问题能否定位？成本能否归因？

Agent 的复杂性和不可预测性使得可观测性比传统软件更重要。

核心组件：
- Tracing：OpenTelemetry、LangFuse、LangSmith、Arize
- Logging：Agent 决策轨迹、Token 消耗、延迟
- Metrics：成功率、平均轮次、Token/次、延迟 P50/P99
- Alerting：异常检测、成本异常、质量下降
- Dashboard：LangFuse Dashboard、Grafana

Agent 独有的可观测关注点：
- 每一轮 Agent 的决策是什么？为什么选这个工具？
- Token 花在哪里？哪个模型调用最贵？
- 哪个步骤最常失败？失败模式是什么？

横切能力 1：安全治理——贯穿所有层

- L0：网络隔离、密钥管理
- L1：模型输出过滤、PII 脱敏
- L2：数据权限、行级安全
- L3：Prompt Injection 防护
- L4：Agent 权限边界
- L5：沙箱隔离、工具鉴权
- L6：记忆隐私、遗忘机制
- L7：安全评测
- L8：审计日志

横切能力 2：CI/CD 与发布治理

- 模型更新发布流程
- Prompt 版本控制 + A/B 测试
- Agent 配置变更管理
- 评测门禁卡点
- 回滚机制

横切能力 3：FinOps 成本治理

- Token 成本追踪
- GPU 利用率优化
- 模型路由策略（便宜模型优先）
- Cache 命中率优化
- 预留实例 vs 按需实例

横切能力 4：开发者体验（DevEx）

- 本地开发环境标准
- 一键部署
- 变更预览
- 调试工具
- 文档

分阶段落地路线图

阶段 1：验证期（0-1 月）
- L1：调用 OpenAI / Anthropic API，Aliyun Bailian
- L2：Qdrant 向量库（自建或 Cloud）
- L3：硬编码 System Prompt
- L4：LangGraph / CrewAI
- L6：LangGraph 内置 Memory
- L8：LangFuse

阶段 2：原型期（1-2 月）
- L1：LiteLLM（统一接口 + Fallback）
- L2：Pinecone / Qdrant Cloud
- L3：LangFuse Prompt 管理
- L4：LangGraph / CrewAI
- L5：E2B 沙箱
- L6：LangGraph Memory
- L7：RAGAS + Golden Set
- L8：LangFuse（开源部署）

阶段 3：生产期（持续迭代）
- L0：K8s + GPU 弹性伸缩
- L1：自建网关 + vLLM + 智能路由
- L2：多分块策略 + Hybrid Search + Reranker
- L3：Guardrails + 动态上下文
- L4：多 Agent 分层 + Human-in-the-loop
- L5：MCP 标准化 + 沙箱隔离
- L6：长期记忆系统
- L7：在线评测 + 发布门禁 + 人审抽检
- L8：OpenTelemetry + Grafana + 告警

横切：安全治理、CI/CD、FinOps、DevEx 全面落地

总结：一句话定义完整 AI Infra

完整 AI Infra 不是「模型 + LangChain + 向量库」，而是：

算力资源底座 + 模型服务与网关 + 数据 / RAG 管道 + Prompt / Context 管理 + Agent / Workflow 编排 + 工具执行沙箱 + 状态记忆系统 + 评测质量体系 + 可观测 / SRE + 安全治理 / 合规 + 成本与开发者平台。

9 层纵向架构 + 4 个横切能力，缺一不可。

Demo 只需要 L1 + L4。生产需要全部 9 层 + 4 横切。

参考资料：
- LangGraph (https://langchain-ai.github.io/langgraph/)
- CrewAI (https://docs.crewai.com/)
- Microsoft AutoGen (https://microsoft.github.io/autogen/)
- OpenAI Agents SDK (https://platform.openai.com/docs/guides/agents)
- E2B 沙箱 (https://e2b.dev/docs)
- Mem0 记忆管理 (https://docs.mem0.ai/)
- LangFuse 可观测性 (https://langfuse.com/docs)
- OpenTelemetry GenAI (https://opentelemetry.io/blog/2024/genai/)
- RAGAS 评测 (https://docs.ragas.io/)
- vLLM 推理引擎 (https://docs.vllm.ai/)
- LiteLLM 统一网关 (https://docs.litellm.ai/)
- Pinecone 向量数据库 (https://docs.pinecone.io/)
- Qdrant 向量数据库 (https://qdrant.tech/documentation/)

作者：Knock | ThinkingAgent
