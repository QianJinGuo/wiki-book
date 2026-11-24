# 2026 年面向 LLM 的 RL 方法总结：从 PPO 到 DPO 到 GRPO，再到多智能体 RL

> 📊 Level ⭐⭐⭐ | 10.8KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **thin-0.75**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/2026-llm-rl-algorithms-deeplog-imba-ppo-dpo-grpo-marl.md`，一手来源仍见下方 sources。

## 机制与论文
- [The Bitter Lesson versus The Garbage Can](https://github.com/QianJinGuo/wiki-public/blob/main/entities/the-bitter-lesson-versus-the-garbage-can.md) — 苦味教训对组织流程路径
- [Scenethesis（ICLR 2026）英伟达 & 普渡大学用 Agent 闭环实现文生 3D](https://github.com/QianJinGuo/wiki-public/blob/main/entities/iclr-2026-英伟达-普渡大学用agent闭环实现文生3d.md) — Scenethesis四阶段闭环，碰撞率6.1%→0.8%
- [OPD 重新审视失败模式与简单修复](https://github.com/QianJinGuo/wiki-public/blob/main/entities/opd-revisiting-failure-modes-simple-fixes-storm.md) — OPD失败模式诊断+低成本稳定实现
- The distillation panic — 蒸馏术语政策分析
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
- Secure AI agents with Policy and Lambda interceptors in Amazon Bedrock AgentCore gateway — Cedar策略+Lambda拦截器双模式
- [阿里云 MSE AI 任务调度 + Agent Sandbox：动态休眠/唤醒 OpenClaw Agent 成本下降 90%+](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-mse-ai-task-scheduling-agent-sandbox-cost-90-percent.md) — 休眠唤醒短条borderline
- [Amazon Quick integration with time-series databases for market intelligence using MCP](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-quick-mcp-kdbx-time-series.md) — 集成短条
- [Claude Code 泄露后的漏网之鱼 claude-code-best 这两个月到底演进了什么](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-best-community-fork-evolution-vibecoder.md) — 社区fork演进短条
- [How my non-engineering team at Sentry learned to ship](https://github.com/QianJinGuo/wiki-public/blob/main/entities/how-my-non-engineering-team-at-sentry-learned-to-ship-20260606.md) — CMS不对称驱动2500页迁移+Sentry Cookbook
- [Democratizing Machine Learning at Netflix: Building the Model Lifecycle Graph](https://github.com/QianJinGuo/wiki-public/blob/main/entities/democratizing-machine-learning-at-netflix-building-the-model.md) — Model Lifecycle Graph
- [小刘商业 Agent 增强层通用基座](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-xiaolaoliu-business-agent-augmentation-layer-general-base-20260606.md) — 基座+增强层论点短条
- [本地 vs 云端 Agent 的现场之争：当下选本地，终局云端（行小招）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/local-vs-cloud-agent-onsite-context-debate-xingxiaozhao.md) — 当下本地终局云端的现场判断
- [我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-autoresearch-software-development-niaowo.md) — AutoResearch迁移软开+交叉审核

## 深度分析

### 三种算法的分野：管线的重量换信号的能力
把 PPO、DPO、GRPO 放在同一坐标系里看，真正的差别不在数学形式，而在"删掉了什么、留下了什么"。PPO 保留完整管线：策略、参考策略、奖励模型、critic 四个模型同驻显存，换来的是真探索能力——策略可以在采样中发明数据集里从未出现过的更优路径。DPO 用闭式变换把奖励模型吸收进一个监督损失，训练循环退化成一次普通微调，代价是彻底放弃探索：正确答案不在偏好对里，它就造不出来。GRPO 处在中间，砍掉 critic、用同组 rollout 的组内归一化当基线，保留 PPO 式的采样探索，显存省约一半——7B 训练从 16 张 H100 降到 8 张的量级。因此选型第一问不是"哪个更强"，而是任务需要探索还是只需拟合偏好：见 [Llm Rl Algorithms Ppo Dpo Grpo Marl Evolution 2026](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/llm-rl-algorithms-ppo-dpo-grpo-marl-evolution-2026.md) 的完整演进线。

### 收敛与稳定性：三种脆弱性，三种排障方式
三者的失稳模式截然不同。DPO 本质是监督损失，曲线可观测、收敛最可预期，但 β 是单一脆弱点：太低策略漂移，太高几乎不动，实践中多落在 0.1–0.5；且它对偏好数据质量敏感，数据边界就是能力边界。GRPO 的方差管理交给组大小 G（公开配置多在 16–32）：G 越大优势方差越低但 rollout 成本线性上升；全零/全一的退化组会让标准归一化爆炸或消失，需加 epsilon 并过滤此类 prompt；KL 系数按阶段设在 0.001–0.04 之间，防语言连贯性崩塌。PPO 的脆弱性最隐蔽：裁剪比、KL 系数、价值损失权重、学习率任一调错都表现为静默劣化，loss 曲线上看不出奖励模型随分布漂移而失效。共性结论是：RL 后训练的超参数是脆弱资产，任何一项出错都不会抛异常，只会悄悄变差。

### 奖励信号才是真正的分水岭：RLVR 范式与 PRM/ORM 之辩
退后一步看，五年演化的主轴是奖励来源：人类成对偏好 → 偏好对直接监督 → 可校验验证器 → LLM-judge。当下主导范式是 [Rlvr Reinforcement Learning Verified Reasoning](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/rlvr-reinforcement-learning-verified-reasoning.md)：奖励来自测试运行器、答案校验器等验证器，捕捉"能否被证明正确"而非"人是否喜欢"。每种信号都有专属失败模式——RM 可被钻空子，偏好对不探索，验证器被逆向利用，judge 有偏见；详见 [Verifier Paradox](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-paradox.md)。PRM 与 ORM 之争则已基本落定：DeepSeek-R1 用规则化结果奖励加 GRPO 达到步骤级推理，因为组内归一化本身就在做隐式的过程信用分配——成功与失败轨迹共享早期决策，梯度自然落在分叉步骤上。PRM 仅在四种情形仍必要：长程智能体任务、工具使用安全、多智能体训练、推理时搜索（beam/MCTS/best-of-N 导航）。

### 从单智能体到 MARL：组基线失效之处，信用分配回归
GRPO 的"免费过程监督"依赖一个隐含假设：同一条轨迹由同一个策略产出。多智能体场景下该假设破裂——规划者、求解者、批评者共同产出一条轨迹，团队级稀疏奖励无法区分谁的决定起了作用，均匀回传梯度会让每个智能体收到的信号大部分是关于其它智能体的噪声。文献收敛到三个杠杆：按智能体/按步的过程奖励（失败模式与角色相关时杠杆率最高）、价值分解（QMIX/COMA 家族，角色稳定且贡献可加时有效）、轨迹分解（Agent-Lightning 的 LightningRL，把多步轨迹切成可归因的 state-action-reward 转移）。工程侧的门槛已被框架层抹平：已有 LangChain/AutoGen 代码库走 [Agent Lightning V1 Harnessed Agentic Rl Arxiv 2608 17528](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-lightning-v1-harnessed-agentic-rl-arxiv-2608-17528.md) 的黑盒可观测性路线，从零构建则选步级 MDP 路线，二者共享 verl 训练引擎。纯结果奖励的 MARL 只在团队 2–3 个智能体、轨迹短、rollout 充足时才安全。

## 实践启示

1. **先选奖励信号，再选算法**：风格/语气/拒答塑形走 DPO（偏好对是天然格式）；数学/代码/逻辑推理走 GRPO + RLVR 配结果奖励；确有高质量 RM 和充足 GPU 时 PPO 仍是硬任务最优解，不必因其工程重量而否定。
2. **把显存预算当作算法选型的硬约束**：PPO 四模型同驻约为策略权重 4 倍的开销；GRPO 无 critic 省约一半。预算不够探索需求时，GRPO 是"PPO 风格探索"的平价替代，而不是降级。
3. **超参数按脆弱资产管理**：DPO 的 β（0.1–0.5）、GRPO 的 G（16–32）与退化组 epsilon、分阶段 KL 系数，逐项记录并监控；劣化是静默的，只有对比评估能发现。
4. **从结果奖励起步，按证据加过程奖励**：先看失败 rollout——若多数结构正确却卡在同一步，才值得上 PRM，且优先生成式/LLM-as-PRM 路线以摊销标注成本；失败方式多样时，加大 G 比加标注更管用。
5. **迭代优于一次性**：DPO 应基于最新策略重新采样偏好对做多轮；多角色工作流先做单智能体到饱和，再上 MARL，且从第一天就为按步/按智能体奖励留预算。
6. **把验证器当新数据集来投资**：奖励形态（0/1 二值、稠密分级、过程加分）对训练结果的影响超过算法细节；验证器设计、judge 校准与 reward-hacking 防护是后训练ROI最高的投入。

## 延伸导航
- [MLOps：训练、推理与模型运维全景](https://github.com/QianJinGuo/wiki-public/blob/main/moc/mlops-training-inference.md)
- [LLM 核心技术 主题地图 (MOC)](https://github.com/QianJinGuo/wiki-public/blob/main/moc/llm-core-technology.md)
- [Agent Memory 架构选择的关键决策点是什么？](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-memory-architecture-decision-points.md)

---

