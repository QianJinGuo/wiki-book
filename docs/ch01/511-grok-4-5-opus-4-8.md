# Grok 4.5：Opus 4.8 级能力，四分之一价格

## Ch01.511 Grok 4.5：Opus 4.8 级能力，四分之一价格

> 📊 Level ⭐⭐ | 8.9KB | `entities/grok-4-5-model-release-xai-2026-07.md`

# Grok 4.5：Opus 4.8 级能力，四分之一价格

**Grok 4.5** 是 xAI（现已更名为 SpaceXAI）于 2026 年 7 月发布的最新大语言模型，定位为 Opus 4.8 级别的能力且定价仅为四分之一。参数量约 1.5T，基于全新的 V9 基座，主打编码、agentic 任务和知识型工作，与 Cursor 联合训练。

## 核心内容

### 关键参数

| 参数 | 值 |
|------|------|
| 参数规模 | 约 1.5 万亿（V8-small 的三倍，xAI 迄今最大模型） |
| 上下文窗口 | 500K tokens（较 Grok 4.3 的 1M 减半） |
| 模态 | 文本 + 图像输入，文本输出 |
| 定价 | 输入 $2/百万 tokens，输出 $6/百万 tokens |
| 知识截止 | 2024 年 11 月（与 Grok 3/4 系列相同） |
| 基座 | 全新 V9 基座（此前为 V8-small） |
| 训练硬件 | 数万块 NVIDIA GB300 |

模型通过 Grok Build、API 和 xAI Console 三个入口同步开放，开发者使用模型名 `grok-4.5`。

### 训练方法

- **预训练**：在数据过滤、去重、质量打分和领域化整理上投入重注
- **后训练**：覆盖数十万个任务的大规模强化学习，重点放在多步软件工程和技术型工作，判分靠自动化判题加模型判题
- **异步训练架构**：专门为支撑超长 agentic rollout 构建
- **亮点**：规模化强化学习，聚焦 per-token intelligence（每个 token 的智能密度）

### Cursor 联合训练

SpaceX 在今年早些时候收购了 Cursor，团队已并入 xAI。Grok 4.5 的补充训练加入了 Cursor 的真实开发数据——真实的 bug、真实的调试过程、真实的架构决策，而非仅仅「高质量代码」语料。模型的强化学习目前还在持续进行，使用 Grok Build 的自动化软件工程环境提供通过/失败信号——这意味着当前版本后续还会继续变强。发布前，Grok 4.5 已在 Tesla 和 SpaceX 内部私测数周。

### 基准测试表现

对上 Opus 4.8 互有胜负：
- Terminal-Bench 2.1：Grok 4.5 83.3 vs Opus 4.8 78.9（胜）
- DeepSWE 1.0：Grok 4.5 62.0 vs Opus 4.8 55.8（胜）
- SWE-Bench Multilingual：Grok 4.5 78.0 vs Opus 4.8 84.4（负）
- SWE-Bench Pro：Grok 4.5 64.7 vs Opus 4.8 69.2（负）

Grok 4.5 跑的是 high 档推理强度，而 Opus 4.8 和 GPT-5.5 分别使用 max 和 xhigh 档，表明 Grok 4.5 还有余量未掏尽。在 Harvey 法律 Agent 基准上直接排到第一。更难的 DeepSWE 1.1 上得分 53，离 Fable 5（max）的 70 分还有差距。

### 定价对比

| 模型 | 上下文 | 输入 $/1M | 输出 $/1M |
|------|--------|-----------|-----------|
| **grok-4.5** | 500K | $2.00 | $6.00 |
| grok-4.3 | 1M | $1.25 | $2.50 |
| grok-4.20系列 | 1M | $1.25 | $2.50 |
| grok-build-0.1（Code API） | 256K | $1.00 | $2.00 |

Grok 4.5 在自家阵营已是最贵，输出价是 grok-4.3 的 2.4 倍。上下文窗口从 Grok 4.3 的 1M 缩至 500K，反映 1.5T 大参数在推理成本上的直接代价。

## 深度分析

### 1. 「Opus 级能力，四分之一价格」的性价比定位

Grok 4.5 的定价策略极具攻击性。Opus 4.8 的输出价格为 $25/百万 tokens，Grok 4.5 为 $6/百万，不到四分之一。在 benchmark 互有胜负的情况下，这个定价直接改变了高端模型的竞争格局——开发者可以在「能力上限」和「成本效率」之间重新做选择。值得注意的是 SWE-Bench Pro 上 Grok 4.5 平均每个任务输出 15,954 tokens，而 Opus 4.8（max）为 67,020 tokens，仅为对手的四分之一左右——「更省 token」不仅是价格优势，也意味着更低的延迟。

### 2. Cursor 收购的协同效应

Cursor 收购后的联合训练是 Grok 4.5 的核心竞争壁垒。模型不仅使用了 Cursor 的真实开发数据（真实 bug、真实调试过程、真实架构决策），而且在发布后仍通过 Grok Build 的自动化软件工程环境持续进行 RL。这意味着 Grok 4.5 的编码和 agentic 能力会持续提升。这种「产品驱动模型训练」的闭环——IDE 使用数据 → 真实开发数据 → RL 训练 → API 发布 → 更多使用数据——是 xAI 区别于其他 model provider 的关键差异化优势，也与 [Cursor Harness Model Production Floor](ch01/336-cursor-harness-model-production-floor.html) 中讨论的「模型决定能力上限，harness 决定生产下限」的逻辑一脉相承。

### 3. 「V9 基座 + 1.5T 参数」的规模信号

从 V8-small（约 0.5T）到 V9 基座（1.5T），xAI 的模型参数在单代内增长了 3 倍，是当前最激进的参数扩展之一。更值得关注的是训练基础设施的跃升——数万块 NVIDIA GB300 和异步训练架构支撑超长 agentic rollout。这与 [Xai Dissolved Grok Colossus2 Analysis](../ch05/082-ai.html) 中讨论的 Colossus 集群能力形成呼应。下一代 Grok 5 目标参数规模达 6 万亿以上，按此速度 xAI 正在走一条「参数规模最大化」的路线。

### 4. 上下文窗口缩减的工程取舍

Grok 4.5 的 500K 上下文比 Grok 4.3 的 1M 减半，直接反映了 1.5T 大模型的推理成本压力。在大参数模型中，长上下文带来的 KV-cache 开销呈线性甚至超线性增长。这个取舍给行业一个重要信号：当模型参数达到万亿级别时，上下文长度可能不再是「越大越好」的军备竞赛维度，而是需要根据应用场景做工程权衡——编码和 agentic 任务对长上下文的依赖度与文档分析类任务不同。

### 5. 多入口同步发布的平台战略

Grok Build（CLI）、API、xAI Console、Cursor、Office 插件五个入口同时开放，覆盖了从开发者到企业用户的所有触达面。特别是 Office 插件的涵盖（Excel 联网调研+跨表公式、PowerPoint 原生形状作图、Word 正式文档），显示出 xAI 正在从纯粹的「模型 API 提供商」转向「AI 能力服务平台」。这种多入口策略可能会影响其他模型厂商的发布策略——模型的可用性和可接入性正在成为与模型能力同等重要的竞争维度。

## 实践启示

1. **评估模型性价比时应同时考虑基准能力和 token 效率**：Grok 4.5 在 SWE-Bench Pro 上的 token 消耗是 Opus 4.8 的四分之一，这意味着同样任务下实际成本差可能远大于定价差。在选择编程 agent 的底层模型时，应在实际任务中测量「任务级总成本」而非仅看单 token 价格。
2. **关注模型发布的「RL 持续训练」承诺**：如果模型发布后仍通过产品环境数据持续训练，选择时就应从「当前快照评估」转变为「长期能力演进评估」。Grok 4.5 发布后能力会继续变强，这改变了传统模型选型的静态假设。
3. **大参数模型+缩水上下文的取舍需要匹配应用场景**：如果应用主要是 agentic 任务（多步代码/工具调用），500K 上下文通常足够，1.5T 参数带来的推理质量提升优于 1M 但更小的模型。如果应用是长篇文档分析/RAG，平衡点可能不同。
4. **评估 Cursor 联合训练模型的适用场景**：如果你的工作流围绕 Cursor/IDE 展开，Grok 4.5 的联合训练优势可能最大化。如果主要使用其他开发工具，评估纯 API 调用的效率对比更为客观。
5. **注意多模型多入口时代的成本管理**：Grok 4.5、Opus 4.8、GPT-5.5 等高端模型正形成分层的性价比矩阵。在 agentic 任务中考虑模型选择器（根据任务复杂度动态路由到不同模型）可以显著降低整体成本。

## 相关实体

- [Cursor让马斯克的Grok45咸鱼翻身追平Opus 48成本比Glm52还低](https://github.com/QianJinGuo/wiki/blob/main/entities/cursor让马斯克的grok45咸鱼翻身追平opus-48成本比glm52还低.md) — Cursor 赋能 Grok 4.5 的深度分析
- [Xai Dissolved Grok Colossus2 Analysis](../ch05/082-ai.html) — xAI Colossus 集群与 Grok 训练分析
- [Xai Grok Musk Training New Model Wechat](../ch04/193-xai-grok-musk.html) — xAI 训练动态
- [Cursor Harness Model Production Floor](ch01/336-cursor-harness-model-production-floor.html) — Cursor Harness 模型生产
- [Cursor 复盘 Harness模型决定能力上限Harness 决定生产下限](../ch05/018-harness.html) — 模型与 Harness 关系分析
- [Claude Fable 5 And New Ai Safety Fables](ch01/848-claude-fable-5-and-new-ai-safety-fables.html) — Fable 5 模型安全寓言
- [Ai Cost Optimization Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-cost-optimization-framework.md) — AI 成本优化框架

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/grok-45-上线opus-48-级能力四分之一价格.md)

---

