# Ch11 云基础设施与部署

> Agent 上生产：Bedrock AgentCore、沙箱、多租户

> 本章收录 **182 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 16 |
| ⭐⭐ 工程师 | 需编程基础 | 18 |
| ⭐⭐⭐ 专家 | 需ML基础 | 88 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 43 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 17 |

---

## 导读

Agent 在笔记本上跑得好不代表能在生产环境中跑得好。

本章覆盖 Agent 上生产所需的基础设施：AWS Bedrock AgentCore（多租户、支付、浏览器）、Firecracker microVM 沙箱（安全隔离）、MXC（微软的 eXecution Containers）、以及 Netflix 的一系列工程实践（Druid 缓存、Switchboard 路由、VMAF 视频质量）。

本章也收录了大量 AWS 中国区博客的实战案例——从 EKS GPU Operator 到 Kafka Iceberg 零 ETL，从 S3 到 Lambda。

基础设施是 Agent 的"最后一公里"——模型再好，部署不了就是零。

---



---

## 本章内容

### ⭐ 入门（16 篇）

- [001. 如何保护 EC2 实例存储（Instance Store）数据不丢失：场景分析与自动化防护实践](ch11/001-ec2-instance-store)
- [002. AWS Glue 3.0 到 5.0 版本升级实践：中国区大规模 ETL 平台的迁移方法论](ch11/002-aws-glue-3-0-5-0-etl)
- [003. 如何轻量化的在亚马逊云科技中国区安全使用 Transfer Family SFTP](ch11/003-transfer-family-sftp)
- [004. Amazon VPC Regional NAT Gateway 与 AZ NAT Gateway 全面对比](ch11/004-amazon-vpc-regional-nat-gateway-az-nat-gateway)
- [005. 构建 Amazon ElastiCache OSS Caches 慢查询监控方案](ch11/005-amazon-elasticache-oss-caches)
- [006. Higress Qwen3Guard Wasm 插件：把 AI 内容安全做进网关数据面](ch11/006-higress-qwen3guard-wasm-ai)
- [007. 异步调用模式：Serverless 流水线中调用 Agent（避免空闲计算成本）](ch11/007-serverless-agent)
- [008. Introducing Claude apps gateway for AWS](ch11/008-introducing-claude-apps-gateway-for-aws)
- [009. AWS WAF AI Traffic Monetization — 内容所有者向 AI 收费的网络层基础设施](ch11/009-aws-waf-ai-traffic-monetization-ai)
- [010. AWS Bedrock Serverless 异步推理：SQS + Lambda](ch11/010-aws-bedrock-serverless-sqs-lambda)
- [011. Data modeling patterns for Amazon Quick Sight multi-dataset relationships](ch11/011-data-modeling-patterns-for-amazon-quick-sight-multi-dataset)
- [012. Amazon Bedrock 模型推理 Serverless 架构案例](ch11/012-amazon-bedrock-serverless)
- [013. Build an AI-powered AWS support companion with Amazon Bedrock AgentCore](ch11/013-build-an-ai-powered-aws-support-companion-with-amazon-bedroc)
- [014. Data modeling best practices for Amazon Quick Sight multi-dataset relationships](ch11/014-data-modeling-best-practices-for-amazon-quick-sight-multi-da)
- [015. The Evolution of Cassandra Data Movement at Netflix](ch11/015-the-evolution-of-cassandra-data-movement-at-netflix)
- [016. Cloudflare Turnstile requiring fingerprintable WebGL](ch11/016-cloudflare-turnstile-requiring-fingerprintable-webgl)

### ⭐⭐ 工程师（18 篇）

- [017. AWS 正式发布 Lambda MicroVMs：面向 AI 时代的无服务器安全代码执行环境](ch11/017-aws-lambda-microvms-ai)
- [018. 科大讯飞星火Token Factory：企业AI模型路由与成本管理统一中间层](ch11/018-token-factory-ai)
- [019. OpenClaw 在电商平台的应用场景探索 | 亚马逊AWS官方博客](ch11/019-openclaw-aws)
- [020. AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 | 亚马逊AWS官方博客](ch11/020-ai-agent-amazon-bedrock-agentcore-openclaw-serverl)
- [021. 基于Bedrock AgentCore+Strands构建企业级智能搜索平台实践 | 亚马逊AWS官方博客](ch11/021-bedrock-agentcore-strands-aws)
- [022. ingress-nginx已退役higress如何平滑替代](ch11/022-ingress-nginx-higress)
- [023. 将 AWS DevOps Agent 智能运维能力延伸到中国区](ch11/023-aws-devops-agent)
- [024. 基于Strands SDK 构建的企业智能问数解决方案实践 | 亚马逊AWS官方博客](ch11/024-strands-sdk-aws)
- [025. 使用Amazon EMR Serverless Storage简化运维节省成本 | 亚马逊AWS官方博客](ch11/025-amazon-emr-serverless-storage-aws)
- [026. AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第六篇 | 亚马逊AWS官方博客](ch11/026-ai-agent-amazon-bedrock-agentcore-openclaw-serverl)
- [027. 使用 Kiro 规范驱动开发加速数据质量建设 | 亚马逊AWS官方博客](ch11/027-kiro-aws)
- [028. Cilium Tetragon — Kubernetes Runtime Security with eBPF](ch11/028-cilium-tetragon-kubernetes-runtime-security-with-ebpf)
- [029. AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第三篇 | 亚马逊AWS官方博客](ch11/029-ai-agent-amazon-bedrock-agentcore-openclaw-serverl)
- [030. 把 Kiro CLI 当作 Agent SDK：一键订阅即可构建你的Agent应用 | 亚马逊AWS官方博客](ch11/030-kiro-cli-agent-sdk-agent-aws)
- [031. 记忆体系工程实战：从设计选型到生产落地 — 存储分层、诊断框架与架构模式](ch11/031-page-031)
- [032. 用 Strands Agents SDK 构建确定性数据分析：语义层 + VQR 在 Amazon Bedrock 上的实践 | 亚马逊AWS官方博客](ch11/032-strands-agents-sdk-vqr-amazon-bedrock-aws)
- [033. AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第四篇 | 亚马逊AWS官方博客](ch11/033-ai-agent-amazon-bedrock-agentcore-openclaw-serverl)
- [034. 使用 Kiro CLI 和 Agent Client Protocol 构建飞书 AI 聊天机器人 | 亚马逊AWS官方博客](ch11/034-kiro-cli-agent-client-protocol-ai-aws)

### ⭐⭐⭐ 专家（88 篇）

- [035. From silos to service topology: why Netflix built a real-time architecture](ch11/035-from-silos-to-service-topology-why-netflix-built-a-real-tim)
- [036. Scaling Camera File Processing at Netflix](ch11/036-scaling-camera-file-processing-at-netflix)
- [037. Dify集成Amazon Bedrock AgentCore Browser  实现更强大的信息获取和分析能力 | 亚马逊AWS官方博客](ch11/037-dify-amazon-bedrock-agentcore-browser-aws)
- [038. 构建无服务器Kiro调度平台：用Kiro CLI + EventBridge + ECS Fargate实现定时AI任务](ch11/038-kiro-kiro-cli-eventbridge-ecs-fargate-ai)
- [039. Amazon Quick ARNs: Cross-account migration and namespace permissions](ch11/039-amazon-quick-arns-cross-account-migration-and-namespace-per)
- [040. Netflix Metadata Service and Model Lifecycle Graph](ch11/040-netflix-metadata-service-and-model-lifecycle-graph)
- [041. Evaluate your Amazon Nova Sonic voice agent at scale, no microphone required](ch11/041-evaluate-your-amazon-nova-sonic-voice-agent-at-scale-no-mic)
- [042. 基于 Prowler 与 GenAI 构建金融行业智能合规中枢（Alt）](ch11/042-prowler-genai-alt)
- [043. 从手动到智能：用 Kiro CLI + OpenSearch MCP 让每个人都成为 OpenSearch 专家 | 亚马逊AWS官方博客](ch11/043-kiro-cli-opensearch-mcp-opensearch-aws)
- [044. End-to-end encrypted ML inference with Amazon SageMaker AI and FHE](ch11/044-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-a)
- [045. AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）](ch11/045-aws-amazon-bedrock-agentcore-aws-agent-2026-5)
- [046. Amazon Bedrock AgentCore 为部署可信人工智能代理增加了质量评估和策略控制 | 亚马逊AWS官方博客](ch11/046-amazon-bedrock-agentcore-aws)
- [047. TiDB Cloud — Agent-native 数据库与 Kimi K2.6 合作](ch11/047-tidb-cloud-agent-native-kimi-k2-6)
- [048. OpenClaw + Amazon Bedrock + Amazon EKS 联动实践：打印机包装质检助手实战](ch11/048-openclaw-amazon-bedrock-amazon-eks)
- [049. 基于 MIG 技术在 Amazon SageMaker HyperPod 上实现 GPU 虚拟化的最佳实践 | 亚马逊AWS官方博客](ch11/049-mig-amazon-sagemaker-hyperpod-gpu-aws)
- [050. IBM Forward Deployed Units (FDU) AI 部署模型](ch11/050-ibm-forward-deployed-units-fdu-ai)
- [051. Bedrock AgentCore 自定义代码评估器](ch11/051-bedrock-agentcore)
- [052. 基于 Amazon EKS 和 Graviton 构建多租户 AI Agent 平台：OpenClaw on Kubernetes 实践 | 亚马逊AWS官方博客](ch11/052-amazon-eks-graviton-ai-agent-openclaw-on-kubernetes)
- [053. GitHub + AWS 多云转折：AI 编码激增 14B commits 压垮 GitHub，Microsoft 跨云买 AWS 容量](ch11/053-github-aws-ai-14b-commits-github-microsoft-aws)
- [054. 当 OpenClaw 学会”团队记忆”：一个面向多客户服务的企业级共享记忆系统设计 | 亚马逊AWS官方博客](ch11/054-openclaw-aws)
- [055. CI&amp;T基于 Amazon Bedrock AgentCore 与 OpenClaw 的企业级智能运维最佳实践 | 亚马逊AWS官方博客](ch11/055-ci-amp-t-amazon-bedrock-agentcore-openclaw-aws)
- [056. Mathematical Optimization at Enterprise Scale: AWS Innovation Center Methodology and Case Studies](ch11/056-mathematical-optimization-at-enterprise-scale-aws-innovatio)
- [057. Amazon Nova Lite Fine-Tuning: 高性价比的视觉检测模型微调案例与实践 | 亚马逊AWS官方博客](ch11/057-amazon-nova-lite-fine-tuning-aws)
- [058. 快时尚电商行业智能体设计思路与应用实践（六）借助 Amazon Bedrock AgentCore MCP Server，Amazon Bedrock，Strands Agents，Kiro 实现智能体极速研发 | 亚马逊AWS官方博客](ch11/058-amazon-bedrock-agentcore-mcp-server-amazon-bedrock-str)
- [059. AgentCore Payments 与代理商务创新：技术深度解析](ch11/059-agentcore-payments)
- [060. Client-Side Load Balancing at a Million Requests Per Second](ch11/060-client-side-load-balancing-at-a-million-requests-per-second)
- [061. AWS Bedrock AgentCore 多账户对话式运维助手：基于 Strands Agents + DevOps Agent 的生产案例](ch11/061-aws-bedrock-agentcore-strands-agents-devops-agent)
- [062. Amazon Cognito 多区域复制：跨区域用户认证韧性方案](ch11/062-amazon-cognito)
- [063. Netflix Switchboard → Lightbulb: 百万请求/秒 ML 模型路由架构演进](ch11/063-netflix-switchboard-lightbulb-ml)
- [064. Pathfinding Labs: Deploy, test, and learn from 100+ intentional security bad code](ch11/064-pathfinding-labs-deploy-test-and-learn-from-100-intentio)
- [065. From PDFs to insights: Architecting an intelligent document processing pipeline with AWS generative AI services](ch11/065-from-pdfs-to-insights-architecting-an-intelligent-document)
- [066. AI Gateways vs MCP Gateways: What Security Teams Need to Know](ch11/066-ai-gateways-vs-mcp-gateways-what-security-teams-need-to-kno)
- [067. 对图像内容进行精确分析 — Bedrock 多模态案例实践（汽车油表识别）](ch11/067-bedrock)
- [068. HiClaw v1.1.0 — Kubernetes 集群部署与 Hermes Worker 运行时](ch11/068-hiclaw-v1-1-0-kubernetes-hermes-worker)
- [069. 用 AI Agent 自动化日常办公工作流 — 在 AWS 上构建 Outlook 邮件助手](ch11/069-ai-agent-aws-outlook)
- [070. 基于Bedrock Agentcore 实现智能成本分析与告警系统 | 亚马逊AWS官方博客](ch11/070-bedrock-agentcore-aws)
- [071. Netflix Nebula ArchRules: 跨越数千个 Java 仓库的 ArchUnit 规模化实践](ch11/071-netflix-nebula-archrules-java-archunit)
- [072. Netflix Druid 区间感知缓存：指数 TTL + 分桶查询去重](ch11/072-netflix-druid-ttl)
- [073. Amazon Bedrock Ops Alert 三层监控架构](ch11/073-amazon-bedrock-ops-alert)
- [074. Automating Confidential Containers (CoCo) Infrastructure with Kyverno](ch11/074-automating-confidential-containers-coco-infrastructure-wit)
- [075. 从代码到分子系列：一场由 AI 驱动的 EGFR 抑制剂发现之旅 — 深度融合 AWS Bedrock与 Claude Code/Claude Agent Skills，生命健康行业的科学活动探微 | 亚马逊AWS官方博客](ch11/075-ai-egfr-aws-bedrock-claude-code-claude-agent-sk)
- [076. 把 OpenClaw 从个人助手变成客服：一次信任模型的翻转 | 亚马逊AWS官方博客](ch11/076-openclaw-aws)
- [077. 企业级OpenClaw安全部署架构指南 | 亚马逊AWS官方博客](ch11/077-openclaw-aws)
- [078. CloudSecTidbits：云安全研究摘要](ch11/078-cloudsectidbits)
- [079. How to achieve truly serverless GPUs](ch11/079-how-to-achieve-truly-serverless-gpus)
- [080. High-Throughput Graph Abstraction at Netflix: Part I](ch11/080-high-throughput-graph-abstraction-at-netflix-part-i)
- [081. Amazon CloudFront部署小指南（二十四）：将CloudFront \"多域名\"改造为\"多租户\"架构 | 亚马逊AWS官方博客](ch11/081-amazon-cloudfront-cloudfront-aws)
- [082. Building Blocks for Foundation Model Training and Inference on AWS](ch11/082-building-blocks-for-foundation-model-training-and-inference)
- [083. Netflix Live 运营体系：TOC Fleet Model 与 LCC 分层指挥架构](ch11/083-netflix-live-toc-fleet-model-lcc)
- [084. Sovereign cloud is only possible if you're Chinese or American: Gartner](ch11/084-sovereign-cloud-is-only-possible-if-you-re-chinese-or-americ)
- [085. Build high-performance generative AI systems with Strands Agents + NVIDIA NIM + Bedrock AgentCore](ch11/085-build-high-performance-generative-ai-systems-with-strands-ag)
- [086. AI 驱动的 Graviton 迁移评估：Kiro Power 实战指南 | 亚马逊AWS官方博客](ch11/086-ai-graviton-kiro-power-aws)
- [087. 快时尚电商行业智能体设计思路与应用实践（五）借助 AgentCore Runtime 与 Bedrock 模型平台，轻松实现 Claude Agent SDK 的生产级部署 | 亚马逊AWS官方博客](ch11/087-agentcore-runtime-bedrock-claude-agent-sdk)
- [088. Build a highly scalable serverless LangGraph multi-agent system](ch11/088-build-a-highly-scalable-serverless-langgraph-multi-agent-sys)
- [089. 基于 Amazon ECS Fargate 自建 Keycloak 作为 AWS IAM Identity Center 外部 IdP，为 Kiro 提供企业级 SSO 登录](ch11/089-amazon-ecs-fargate-keycloak-aws-iam-identity-center)
- [090. 快时尚电商行业智能体设计思路与应用实践（八）基于 WebSocket 的语音系统：Nova 2 Sonic, AgentCore, Strands Agents 企业级架构实践 | 亚马逊AWS官方博客](ch11/090-websocket-nova-2-sonic-agentcore-strands-agents)
- [091. Reference your own AWS Secrets Manager secrets in Amazon Bedrock AgentCore Identity](ch11/091-reference-your-own-aws-secrets-manager-secrets-in-amazon-bed)
- [092. AWS Bedrock Agentcore Quality Optimization Flywheel](ch11/092-aws-bedrock-agentcore-quality-optimization-flywheel)
- [093. AWS Network Firewall 规则冲突 AI 实时检测方案（部署小指南六）](ch11/093-aws-network-firewall-ai)
- [094. Secure AI agents with Policy and Lambda interceptors in Amazon Bedrock AgentCore gateway](ch11/094-secure-ai-agents-with-policy-and-lambda-interceptors-in-amaz)
- [095. Giving your AI a Job Interview](ch11/095-giving-your-ai-a-job-interview)
- [096. Control where your AI agents can browse with Chrome enterprise policies on Amazon Bedrock AgentCore](ch11/096-control-where-your-ai-agents-can-browse-with-chrome-enterpri)
- [097. 用 Amazon Quick + Bedrock AgentCore 打造对话式 FinOps 助手](ch11/097-amazon-quick-bedrock-agentcore-finops)
- [098. Democratizing Machine Learning at Netflix: Building the Model Lifecycle Graph](ch11/098-democratizing-machine-learning-at-netflix-building-the-mode)
- [099. 基于AgentCore构建自学习、可进化的文旅行业近似信息抽取Agents | 亚马逊AWS官方博客](ch11/099-agentcore-agents-aws)
- [100. 给 Openclaw瘦身-利用Nova MME 和 S3 Vector实现Skill按需召回 | 亚马逊AWS官方博客](ch11/100-openclaw-nova-mme-s3-vector-skill-aws)
- [101. 从0到1:联想基于Strands Agent SDK的资源智能巡检Agent创新 | 亚马逊AWS官方博客](ch11/101-0-1-strands-agent-sdk-agent-aws)
- [102. 基于Strands框架和Bedrock AgentCore的SAP智能采购助手方案 | 亚马逊AWS官方博客](ch11/102-strands-bedrock-agentcore-sap-aws)
- [103. LiteLLM WebSearch Interception 配置指南：让 Bedrock/Vertex/Azure 走代理 + 实时联网](ch11/103-litellm-websearch-interception-bedrock-vertex-azure)
- [104. Amazon Bedrock + LLM Gateway 实现生产级推理弹性模式](ch11/104-amazon-bedrock-llm-gateway)
- [105. Better decisions at scale: How mathematical optimization delivers where intuition fails](ch11/105-better-decisions-at-scale-how-mathematical-optimization-del)
- [106. 基于 Application Inference Profile 为 Amazon Bedrock 构建分业务单元的近实时成本告警](ch11/106-application-inference-profile-amazon-bedrock)
- [107. Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战](ch11/107-zenjoy-amazon-bedrock-eks-aiops-agent-prometheus-es)
- [108. Here Comes (Forward Deployed) Everybody](ch11/108-here-comes-forward-deployed-everybody)
- [109. AWS DevOps Agent 接入 AWS 中国区系列：Partition 隔离、多账号扩展与 Roles Anywhere 认证](ch11/109-aws-devops-agent-aws-partition-roles-anywhere)
- [110. 使用 Kiro AI IDE 开发 AWS CDK 部署架构：从模糊需求到三层堆栈的协作实战 | 亚马逊AWS官方博客](ch11/110-kiro-ai-ide-aws-cdk-aws)
- [111. Automate Schema Generation for Intelligent Document Processing](ch11/111-automate-schema-generation-for-intelligent-document-processi)
- [112. 当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学" | 亚马逊AWS官方博客](ch11/112-ai-agent-amazon-bedrock-agentcore-memory-aws)
- [113. 微调 Amazon Nova 模型实现精准邮件数据提取](ch11/113-amazon-nova)
- [114. AWS API MCP Server + Quick Suite + Bedrock AgentCore 集成](ch11/114-aws-api-mcp-server-quick-suite-bedrock-agentcore)
- [115. State of Routing in Model Serving](ch11/115-state-of-routing-in-model-serving)
- [116. Browser Use Firecracker：云端浏览器成本降 3 倍的 microVM 架构](ch11/116-browser-use-firecracker-3-microvm)
- [117. 数据中心 GPU 液冷 vs 风冷：FLOPs 可用率与工程权衡](ch11/117-gpu-vs-flops)
- [118. Archera • Insured cloud commitments for AWS, Azure, and Google](ch11/118-archera-insured-cloud-commitments-for-aws-azure-and-goog)
- [119. Waylens OpenClaw 多智能体平台 EKS+Operator 改造案例](ch11/119-waylens-openclaw-eks-operator)
- [120. 55+ models, every modality. One API key, one bill.](ch11/120-55-models-every-modality-one-api-key-one-bill)
- [121. 向量数据库选型：Chroma vs Qdrant](ch11/121-chroma-vs-qdrant)
- [122. Cost effective deployment of vision-language models for pet behavior detection on AWS Inferentia2](ch11/122-cost-effective-deployment-of-vision-language-models-for-pet)

### ⭐⭐⭐⭐ 科学家（43 篇）

- [123. Extending MCP support for Amazon Bedrock AgentCore Gateway](ch11/123-extending-mcp-support-for-amazon-bedrock-agentcore-gateway)
- [124. How Amazon Finance streamlines regulatory inquiries by using generative AI on AWS](ch11/124-how-amazon-finance-streamlines-regulatory-inquiries-by-using)
- [125. 云端 Agent 基础设施两条硬经验：CreaoAI 联合创始人的状态/代码解耦 + 凭据隔离](ch11/125-agent-creaoai)
- [126. 三剑合璧Quick Suite + Agent Core + Kiro联动实践：海外物流报价助手实战 | 亚马逊AWS官方博客](ch11/126-quick-suite-agent-core-kiro-aws)
- [127. 阿里云 EventHouse 企业级 Agent 上下文构建五维框架](ch11/127-eventhouse-agent)
- [128. Restrict Access to Sensitive Documents in Your Amazon Q S3 Knowledge Bases](ch11/128-restrict-access-to-sensitive-documents-in-your-amazon-q-s3-k)
- [129. Agent-EvalKit：AWS 开源 CLI Agent 评测工具包](ch11/129-agent-evalkit-aws-cli-agent)
- [130. AI Infra 入门：RMSNorm、Softmax、Causal Mask、Sampling 的数学与底层优化](ch11/130-ai-infra-rmsnorm-softmax-causal-mask-sampling)
- [131. Direct Connect (DX) 迁移最佳实践](ch11/131-direct-connect-dx)
- [132. LiteLLM 驱动的 Amazon Bedrock 成本治理：四层防护体系](ch11/132-litellm-amazon-bedrock)
- [133. Amazon Bedrock Cross-Region Inference (CRIS): EU Data Residency and GDPR Compliance](ch11/133-amazon-bedrock-cross-region-inference-cris-eu-data-reside)
- [134. Claude Code on AWS Bedrock 配置指南](ch11/134-claude-code-on-aws-bedrock)
- [135. Amazon Nova Forge 域定制超参调优：艺术与科学](ch11/135-amazon-nova-forge)
- [136. AWS SageMaker Async Inference 内联 Payload 支持](ch11/136-aws-sagemaker-async-inference-payload)
- [137. AI Infra 全景图：9 层 Agent 生产架构](ch11/137-ai-infra-9-agent)
- [138. 快时尚电商行业智能体设计思路与应用实践（七）Amazon Bedrock AgentCore Runtime 深度解析和场景分析 | 亚马逊AWS官方博客](ch11/138-amazon-bedrock-agentcore-runtime-aws)
- [139. 让 AI 理解你的组件库：新一代智能 D2C架构 — 基于 AWS Kiro MCP Skills 的智能转换实践 | 亚马逊AWS官方博客](ch11/139-ai-d2c-aws-kiro-mcp-skills-aws)
- [140. ai agent 的迁移与现代化 使用 amazon bedrock agentcore 将 openclaw 从单机改造为多租户 serverless 架构](ch11/140-ai-agent-amazon-bedrock-agentcore-openclaw-serverles)
- [141. 基于 Strands Agents SDK 和 Amazon Bedrock AgentCore 的商品广告图审查 Agent](ch11/141-strands-agents-sdk-amazon-bedrock-agentcore-agent)
- [142. From Kubernetes Dev Setup to Production: What Actually Changes](ch11/142-from-kubernetes-dev-setup-to-production-what-actually-chang)
- [143. 让 AI 代理自己付钱：基于 Amazon Bedrock AgentCore 与 x402 的 Agentic Payment](ch11/143-ai-amazon-bedrock-agentcore-x402-agentic-payment)
- [144. AWS Graviton5 M9g/M9gd 实例 GA 公告](ch11/144-aws-graviton5-m9g-m9gd-ga)
- [145. GenPage: Netflix 端到端生成式首页构建](ch11/145-genpage-netflix)
- [146. 利用 AWS Budget 实现 Amazon Bedrock 用量监控、超预算告警与自动中断方案](ch11/146-aws-budget-amazon-bedrock)
- [147. EC2 NAT 实例选型与部署实践（AWS 中国宁夏区域）](ch11/147-ec2-nat-aws)
- [148. OpenClaw 多租户系列 #7 — 基于 ECS Fargate + Graviton 的轻量级企业 AI Agent 平台 | 亚马逊AWS官方博客](ch11/148-openclaw-7-ecs-fargate-graviton-ai-agent-aws)
- [149. SageMaker 推理可观测性：100+ 详细指标 + CloudWatch Insights Dashboard](ch11/149-sagemaker-100-cloudwatch-insights-dashboard)
- [150. 基于 Amazon IoT Core 与 Kiro 构建可迁移的工业 IoT 数据管道](ch11/150-amazon-iot-core-kiro-iot)
- [151. Amazon Nova 2 Lite 视觉对象检测（自然语言驱动）](ch11/151-amazon-nova-2-lite)
- [152. 规划 Amazon EKS 从 1.32 升级到 1.35：关键变更识别与逐版本实施路径](ch11/152-amazon-eks-1-32-1-35)
- [153. CISA Admin Leaked AWS GovCloud Keys on Github](ch11/153-cisa-admin-leaked-aws-govcloud-keys-on-github)
- [154. SeedVR2 on Amazon SageMaker: 视频超分辨率部署实践](ch11/154-seedvr2-on-amazon-sagemaker)
- [155. The New Era of Cloud AI Mobile Testing: Amazon Device Farm MCP Server Practical Guide | 亚马逊AWS官方博客](ch11/155-the-new-era-of-cloud-ai-mobile-testing-amazon-device-farm-m)
- [156. What You Need to Know About Lambda MicroVMs](ch11/156-what-you-need-to-know-about-lambda-microvms)
- [157. From Silos to Service Topology: Why Netflix Built a Real-Time Service Map](ch11/157-from-silos-to-service-topology-why-netflix-built-a-real-tim)
- [158. Build financial document processing with Pulse AI and Amazon Bedrock](ch11/158-build-financial-document-processing-with-pulse-ai-and-amazon)
- [159. AWS 软件供应链安全 Well-Architected 最佳实践](ch11/159-aws-well-architected)
- [160. 告别 Ingress Nginx：云原生 API 网关 Gateway API 使用指引](ch11/160-ingress-nginx-api-gateway-api)
- [161. Netflix 分层通知系统：Thinking Fast & Slow 的 Slow-Fast RL 架构](ch11/161-netflix-thinking-fast-slow-slow-fast-rl)
- [162. Amazon Bedrock 构建货运物流双语命名实体识别系统](ch11/162-amazon-bedrock)
- [163. VMAF v1: Netflix 视频质量度量的全面升级](ch11/163-vmaf-v1-netflix)
- [164. Netflix Kueue 迁移：百万级 Batch Job 从 CMB 到 Kubernetes 原生调度](ch11/164-netflix-kueue-batch-job-cmb-kubernetes)
- [165. Zapocalypse: The Attack Chain That Could Have Hijacked Zapier](ch11/165-zapocalypse-the-attack-chain-that-could-have-hijacked-zapie)

### ⭐⭐⭐⭐⭐ 大师（17 篇）

- [166. 用 Amazon Bedrock AgentCore Payment 构建自主支付 AI Agent：x402 协议实战](ch11/166-amazon-bedrock-agentcore-payment-ai-agent-x402)
- [167. 基于 Firecracker microVM 与 Bedrock AgentCore 的生产级多租户 AI Agent](ch11/167-firecracker-microvm-bedrock-agentcore-ai-agent)
- [168. 基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构](ch11/168-aws-openclaw-amazon-bedrock-agentcore-serverless)
- [169. alibabacloud-cms-manage Skill：阿里云 CMS 2.0 可观测接入的 AI Agent Skill 化（CLI 6 步 + K8s ack-onepilot 自动注入 + 两阶段确认 + 5 大实战场景）](ch11/169-alibabacloud-cms-manage-skill-cms-2-0-ai-agent-skill-c)
- [170. 基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构](ch11/170-aws-openclaw-amazon-bedrock-agentcore-serverless)
- [171. Build an enterprise observability solution for Amazon Quick](ch11/171-build-an-enterprise-observability-solution-for-amazon-quick)
- [172. 基于 Amazon WorkSpaces Applications 快速搭建企业级应用培训环境](ch11/172-amazon-workspaces-applications)
- [173. Dynamically Splitting Wide Partitions in Cassandra for Time Series Workloads](ch11/173-dynamically-splitting-wide-partitions-in-cassandra-for-time)
- [174. 在 Amazon EKS 上使用 NVIDIA GPU Operator 管理自定义 GPU 驱动与 CUDA 工作负载](ch11/174-amazon-eks-nvidia-gpu-operator-gpu-cuda)
- [175. AWS FSx for Lustre + GPUDirect Storage + TurboQuant: Sharded LLM Model Loading](ch11/175-aws-fsx-for-lustre-gpudirect-storage-turboquant-sharded)
- [176. AWS Network Firewall 审查 IDC-VPC 流量：VGW 架构 + BGP 路由传播实验](ch11/176-aws-network-firewall-idc-vpc-vgw-bgp)
- [177. 在 Amazon EC2 GPU 实例上部署 NVIDIA NemoClaw — 以 Amazon Bedrock 作为推理后端的生产级参考架构](ch11/177-amazon-ec2-gpu-nvidia-nemoclaw-amazon-bedrock)
- [178. Mountpoint S3 vs S3 Files：EKS 上 S3 数据接入的两种方案实战对比](ch11/178-mountpoint-s3-vs-s3-files-eks-s3)
- [179. Amazon Bedrock模型推理的Serverless异步架构 – 处理在线多模态高负载案例](ch11/179-amazon-bedrock-serverless)
- [180. Amazon S3 Annotations：对象级丰富可查询元数据](ch11/180-amazon-s3-annotations)
- [181. LiteLLM 生产级部署：AWS ECS/EKS 双方案 + Control Plane / Data Plane 分离多区域](ch11/181-litellm-aws-ecs-eks-control-plane-data-plane)
- [182. AWS GRPO RLVR Sagemaker Math Reasoning](ch11/182-aws-grpo-rlvr-sagemaker-math-reasoning)


---

## 本章收束

模型再好，部署不了就是零。这一章把 Agent 从笔记本推向生产：多租户、沙箱隔离、成本治理、可观测——每一项都在回答"凭什么敢让它碰真实的生产系统"。基础设施是 Agent 的最后一公里，也是信任的起点。

---
