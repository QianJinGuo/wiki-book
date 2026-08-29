# IBM Granite 4.2：首个稠密推理 LLM 家族（3B/8B/30B）

> 📊 Level ⭐⭐ | 7.1KB | `entities/ibm-granite-4-2-reasoning-architecture-2026.md`

# IBM Granite 4.2：首个稠密推理 LLM 家族（3B/8B/30B）

> Granite 4.2 是 IBM Granite 语言模型家族的推理向发布——首个稠密、纯解码器推理 LLM 家族，三种尺寸 3B/8B/30B，从零预训练约 15T token，Apache 2.0 开源。HF Granite Team 技术走查了其训练管线。

## 训练管线

- **预训练**：从零训练，约 15T token，五阶段策略将上下文窗口扩展到 **512K token**。
- **SFT**：在 chain-of-thought、推理、agentic-trajectory 数据上监督微调。
- **后训练**：多阶段强化学习管线，包含 **agentic RL**——8B 与 30B 模型在真实沙箱环境中学习使用工具行动。

## 关键特性

每个模型具备：**thinking / non-thinking 切换**；**low-effort 思考模式**（对简单问题只花少量推理预算）；**原生工具调用（native tool calling）**。全部 Apache 2.0 开源。

## 深度分析

### 奖励类型决定训练形态

Granite 4.2 的 RL 阶段主要由"如何被奖励"定义——奖励类型直接决定 KL、rollout 与环境复杂度。

- **verifiable（可验证）**：exact-match、单元测试、格式/规则检查，客观且难钻空子，被前置到管线最前（RLVR · boosters · SWE）。[RLVR](https://github.com/QianJinGuo/wiki/blob/main/concepts/rlvr-reinforcement-learning-verified-reasoning.md) 是这条线最长、数据面最广的阶段。
- **reward model / LLM judge**：覆盖开放式质量、偏好、安全与答案正确性（RLVR · Search · RLHF）。
- **agentic outcome（结果奖励）**：是否在真实环境中真正解掉任务，最稀疏——常常是长工具调用轨迹末尾的单个 bit（SWE · Terminal · Search）。
- 联动效应：RLVR 与 SWE 2 跑在 **KL 0**（客观奖励自由探索），RLHF 与 code booster 用 **KL 0.05**（偏好/安全贴近参考策略）；rollout turns 从 1 拉到 128（SWE 2）/ 64（Terminal）。可验证性越强越敢放开探索，偏好目标则必须锚定参考策略。

### 分阶段课程：以 warm-start 链拼装能力

管线不是一个 RL pass，而是一串各自独立的 GRPO 运行，逐级 warm-start。

- 每阶段跑完导出 HF checkpoint 作为下一阶段基座：SFT → RLVR → skill boosters → SWE → Terminal → Search → RLHF。
- 全程共享同一超参骨架（ratio clip 0.2/0.28、micro-batch 1、TP 2-4、无 PP/CP），阶段之间只改"形状"：prompts/step、gens/prompt、max seq len、KL、LR。
- 三尺寸差异不在超参而在爬梯长度：3B 走 foundational + RLHF；8B/30B 追加 agentic 块——能力差距主要来自后训练深度而非架构。

### 异步 GRPO + 环境即资源：agentic RL 的工程底座

agentic 阶段每个训练样本都是多轮 rollout（改代码、跑命令、上网搜），真正瓶颈在基础设施而非算法。

- 生成与训练解耦：generation workers 持续采样入共享 buffer，trainer 攒满一步即更新并回流参数；参数刷新可能落在 rollout 中途，靠复用 KV cache 兜住成本。
- 允许策略最多滞后一个 update，用 **truncated importance sampling** 把 train/generation 的 log-prob 比钳到上限，限定 off-policy 漂移。
- NeMo-Gym 把 verifier/工具/沙箱/奖励模型统一成 Resources 接口，让简单规则检查器与完整 SWE 沙箱对 [GRPO](https://github.com/QianJinGuo/wiki/blob/main/concepts/grpo-policy-optimization-2026.md) 呈现同一界面——分阶段课程因此可行。相关实现可对照 [AgentEnv（agentic RL 执行环境）](../ch04/678-agentenv-agentic-rl.html)。

### SFT 数据工程是 agentic 能力的"种子"

agentic 能力不只在 RL 阶段长出来，SFT 语料已埋下种子。

- SFT 混合 agentic（31.6%）与 non-agentic（68.4%）约 7.2M 样本 / ~100B token；agentic 语料以 SWE（69%）、tool calling（12.1%）、terminal（8%）为主，由 OpenHands、OpenCode、Terminus-2 等十余种 harness/scaffold 生成，是 [合成数据](https://github.com/QianJinGuo/wiki/blob/main/concepts/synthetic-data-generation.md) 工程化的典型。
- QC 三步：统一 OpenAI Chat 格式 → GPT-OSS-120B 与 Gemma 4 作 judge 剔除低质/幻觉/非法工具调用 → 对 tools+messages 取 SHA-256 做局部与全局去重。
- 30B 追加第二阶段 SFT：agentic/coding 数据上采样 + 16% replay，3e-6 低 LR 多训约一个 epoch——agentic 编码能力可"嫁接"到既有基础能力之上。

## 实践启示

- **1. 先定奖励类型，再定 RL 课程**：先画每阶段的奖励类型表（verifiable / judge / outcome），据此定 KL 与 rollout turns——客观奖励放开探索，偏好与安全收紧贴近参考策略。
- **2. 用 warm-start 链做能力拼装**：每个 stage 独立跑完导出 checkpoint 当下一 stage 基座，共享骨架只改形状；想给已有模型加 agentic 能力，只需在链尾追加 SWE/Terminal/Search 三环。
- **3. agentic 能力 = 真实环境 + 稀疏结果奖励**：SWE 沙箱、Terminal、Web search 是 8B/30B 与 3B 的分水岭；把环境抽象成统一接口，让 RL 循环无差别对待简单 verifier 与复杂沙箱，正是 [Agent Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md) 沙箱工具训练视角的具象化。
- **4. 异步解耦生成与训练**：generation workers 与 trainer 分离、KV cache 复用、truncated importance sampling 兜底 off-policy 漂移——让昂贵的 agentic 环境在 optimizer step 期间不空转。
- **5. SFT 数据 QC 是可复制的便宜胜利**：统一 chat 格式 + LLM judge 过滤 + 基于 tools+messages 的哈希全局去重三步走；结合 [RLHF/DPO/GRPO 对齐](https://github.com/QianJinGuo/wiki/blob/main/concepts/rlhf-dpo-grpo-alignment.md)，数据工程与奖励设计共同决定能力上限。
- **6. 部署做"开关"不做"模型"**：thinking / non-thinking / low-effort 三档、历史 thinking 截断、OpenAI 兼容 tool calling，让同一模型在易题、难题、agentic 任务间自由切换，直接接入 vLLM/SGLang 与既有 agentic harness；[长上下文](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-window-economics.md) 支持 512K，FP8/FP4/GGUF 量化进一步压低推理内存成本。

## 关系与对比

- [IBM 模型路由优化](ch01/1139-20.html) 同属 IBM 大模型工程研究方向
- [ScarfBench（IBM）](../ch04/684-ai-agent.html) 覆盖 IBM 在企业 Java 框架迁移场景的 Agent 基准
- [自蒸馏推理用于 SFT](https://github.com/QianJinGuo/wiki/blob/main/entities/exploring-self-distilled-reasoning-for-supervised-fine-tunin.md) 是本文 SFT 推理数据阶段的同类方法
- agentic RL（真实沙箱环境工具学习）与 [Agent Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md) 的沙箱工具训练视角相关

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ibm-granite-4-2-reasoning-model-2026.md)

---

