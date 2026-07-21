# Code is cheap: Harness 方法论——水流理论、最小混沌单元与反 slop

## Ch05.126 Code is cheap: Harness 方法论——水流理论、最小混沌单元与反 slop

> 📊 Level ⭐⭐⭐ | 5.4KB | `entities/code-is-cheap-harness-water-flow-wuyue-aliyun-2026.md`

# Code is cheap: Harness 方法论——水流理论、最小混沌单元与反 slop

## 核心论点：代码正在变得非常廉价

无岳（阿里云开发者）基于过去 20 天 70 万行代码、10 个并行项目的实践，提出核心判断：**代码本身，正在从稀缺资源变成可以快速生成、快速验证、快速丢弃的过程产物**。

当模型可以整包接住"读地形、定方案、写实现、跑验证、修 bug"这一串动作，真正昂贵的不再是敲代码，而是读懂历史、找准边界、确认影响面、跑通验证、控制发布风险。

## 大模型的两个底层事实

无岳从第一性原理出发，指出两个 LLM 底层事实，Harness 方法论必须直接针对它们设计：

### 事实 1：大模型不是确定性函数

模型每输出一个 token 都是在词表上做概率采样。每一步的小偏差沿链路累积，给它的自由空间越大，跑偏概率越大。

**直接后果**：best-practice slop——AI 在一个过大目标空间里，把网上最常见的套路糊上来，生成"看似专业、结构漂亮、但不贴业务地形、不解决真实问题"的平均产物。

### 事实 2：上下文窗口有限，给得太多反而会腐烂

Transformer 注意力机制的内在限制：窗口越长，每个 token 注意力越稀薄。"Lost in the Middle"现象意味着长上下文中间段的信息最容易被遗忘。多轮对话还会叠加旧方案/新方案共存、recency bias 等问题。

**关键区分**：真正要节约的不是 token，是上下文——省 token 是成本问题，省上下文是质量问题。

## 独特概念体系

### 1. 反 slop（Anti-Slop）

任务开始前**不写代码**，而是反复和模型讨论需求→让它复述目标→人纠正→搜索证据→沉淀 spec。把模型从"凭概率在巨大空间里乱选路"挪到"在清晰目标和边界内自主推进"。

### 2. 水流理论（Water Flow Theory）

Harness 设计应像水流——在明确河道（spec/边界）内自主流动，遇到障碍（验证失败）自然会调整路径，但不溢出河道。

### 3. 最小混沌单元（Minimum Chaos Unit）

将任务分解为最小的可自主推进单元，每个单元有清晰的目标、边界和验证方式，使模型在受限空间内发挥自主性。

## 实践方法论

### Spec 是第一制品

一份能交给 Agent 的 spec 包含：目标、非目标、用户场景、不变量、验收证据、权限边界、预算边界、停止条件。这些写清楚以后，Agent 才不是靠猜在补洞。

### new-chat skill（定期重启）

自动总结只能延缓上下文腐烂，不能解决它（每次总结都是有损压缩）。真正解是定期重启：用 spec 作为外部真相源，启动全新 chat，避免上下文腐烂积累。

### Checkpoint 验证闭环

每个最小混沌单元结束时产出可验证的 checkpoint，人不在中间过程里逐行 review，而是在 checkpoints 之间做方向性判断。

## 与现有 Harness 实体的关系

本文的独特贡献在于从 LLM 第一性原理（token 采样概率 + 注意力机制）出发推导 Harness 方法论，提出了现有 entities 未覆盖的 three native concepts（反 slop、水流理论、最小混沌单元）。与 [Harness Engineering 综合实体](ch05/115-harness-engineering.html) 的 5 制品/三大阵营互补，与 [阿里云 Java Harness 实践](ch05/115-harness-engineering.html) 同属阿里云生态但视角不同（本文偏方法论而非案例）。

> 参见也（see also）：[生产级 Harness 架构设计](ch05/039-agent-harness.html)、[Harness 综合范式](ch05/115-harness-engineering.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/code-is-cheap-ai-native-harness-wuyue-aliyun-2026.md)

---

