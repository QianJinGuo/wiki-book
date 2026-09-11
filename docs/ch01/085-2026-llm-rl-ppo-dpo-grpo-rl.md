# 2026 年面向 LLM 的 RL 方法总结：从 PPO 到 DPO 到 GRPO，再到多智能体 RL

> 📊 Level ⭐⭐⭐ | 5.4KB | `entities/2026-llm-rl-algorithms-deeplog-imba-ppo-dpo-grpo-marl.md`

> 本页原内容在 2026-09-07 质量闭环中判定为 **thin-0.75**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/2026-llm-rl-algorithms-deeplog-imba-ppo-dpo-grpo-marl.md`，一手来源仍见下方 sources。

## 机制与论文
- [The Bitter Lesson versus The Garbage Can](../ch04/177-the-bitter-lesson-versus-the-garbage-can.html) — 苦味教训对组织流程路径
- [Scenethesis（ICLR 2026）英伟达 & 普渡大学用 Agent 闭环实现文生 3D](https://github.com/QianJinGuo/wiki-public/blob/main/entities/iclr-2026-英伟达-普渡大学用agent闭环实现文生3d.md) — Scenethesis四阶段闭环，碰撞率6.1%→0.8%
- [OPD 重新审视失败模式与简单修复](https://github.com/QianJinGuo/wiki-public/blob/main/entities/opd-revisiting-failure-modes-simple-fixes-storm.md) — OPD失败模式诊断+低成本稳定实现
- [The distillation panic](152-the-distillation-panic.html) — 蒸馏术语政策分析
- [Introducing 1-bit and Ternary Bonsai Image 4B: Image Generation for Local Devices](https://github.com/QianJinGuo/wiki-public/blob/main/entities/introducing-1-bit-and-ternary-bonsai-image-4b-image-generati-352fe9.md) — 1-bit/ternary量化图像生成规格
- [Introducing 1-bit and Ternary Bonsai Image 4B: Image Generation for Local Devices](https://github.com/QianJinGuo/wiki-public/blob/main/entities/news-bonsai-image-4b.md) — Bonsai Image 4B量化帕累托外推3664字全版
- [从零构建大语言模型 —— 读完这篇你就懂了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/build-llm-from-scratch-7-chapters-zion.md) — LLM教程七章
- [Yann LeCun 谈 LLM 不是智能与世界模型 JEPA](https://github.com/QianJinGuo/wiki-public/blob/main/entities/yann-lecun-llm-not-intelligence-jepa.md) — 5738字最全JEPA论证

## 工程实践
- [数据级 Harness：架构师 JiaGouX 解读 Anthropic 95% 数据分析与 5 个反直觉边界](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-95pct-data-analysis-jiagoux-data-level-harness-20260606.md) — 数据级harness解读
- [高德 Marketing AutoResearch：AI Native 营销增长经营托管框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/autoresearch-marketing-growth-amap-ai-native.md) — 营销经营托管
- [存之有序，治之有矩——Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md) — 写入纪律prompt cache冲突
- [AgentOps: Operationalize agentic AI at scale with Amazon Bedrock AgentCore](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md) — 四支柱解析版
- [Anthropic Institute《When AI builds itself》深度解读：AI 进入 AI 研发执行层、瓶颈迁移与研发级 Harness（架构师 JiaGouX）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-institute-when-ai-builds-itself-jiagoux-interpretation.md) — 解读短条borderline
- [构建无服务器Kiro调度平台：用Kiro CLI + EventBridge + ECS Fargate实现定时AI任务](https://github.com/QianJinGuo/wiki-public/blob/main/entities/构建无服务器kiro调度平台用kiro-cli-eventbridge-ecs-fargate实现定时ai任务.md) — 定时AI任务7x24
- [长期运行的 Agent 怎么管：Hermes 治理分层与 5 张卡](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-long-running-governance-five-cards-ruofei.md) — don't automate slop+5张卡治理
- [Secure AI agents with Policy and Lambda interceptors in Amazon Bedrock AgentCore gateway](https://github.com/QianJinGuo/wiki-public/blob/main/entities/secure-ai-agents-with-policy-and-lambda-interceptors-in-amaz.md) — Cedar策略+Lambda拦截器双模式
- [阿里云 MSE AI 任务调度 + Agent Sandbox：动态休眠/唤醒 OpenClaw Agent 成本下降 90%+](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-mse-ai-task-scheduling-agent-sandbox-cost-90-percent.md) — 休眠唤醒短条borderline
- [Amazon Quick integration with time-series databases for market intelligence using MCP](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-quick-mcp-kdbx-time-series.md) — 集成短条
- [Claude Code 泄露后的漏网之鱼 claude-code-best 这两个月到底演进了什么](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-best-community-fork-evolution-vibecoder.md) — 社区fork演进短条
- [How my non-engineering team at Sentry learned to ship](https://github.com/QianJinGuo/wiki-public/blob/main/entities/how-my-non-engineering-team-at-sentry-learned-to-ship-20260606.md) — CMS不对称驱动2500页迁移+Sentry Cookbook
- [Democratizing Machine Learning at Netflix: Building the Model Lifecycle Graph](https://github.com/QianJinGuo/wiki-public/blob/main/entities/democratizing-machine-learning-at-netflix-building-the-model.md) — Model Lifecycle Graph
- [小刘商业 Agent 增强层通用基座](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-xiaolaoliu-business-agent-augmentation-layer-general-base-20260606.md) — 基座+增强层论点短条
- [本地 vs 云端 Agent 的现场之争：当下选本地，终局云端（行小招）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/local-vs-cloud-agent-onsite-context-debate-xingxiaozhao.md) — 当下本地终局云端的现场判断
- [我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-autoresearch-software-development-niaowo.md) — AutoResearch迁移软开+交叉审核

## 延伸导航
- [MLOps：训练、推理与模型运维全景](https://github.com/QianJinGuo/wiki-public/blob/main/moc/mlops-training-inference.md)
- [LLM 核心技术 主题地图 (MOC)](https://github.com/QianJinGuo/wiki-public/blob/main/moc/llm-core-technology.md)
- [Agent Memory 架构选择的关键决策点是什么？](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-memory-architecture-decision-points.md)

---

