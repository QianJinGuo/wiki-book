# Code is cheap: Harness 方法论——水流理论、最小混沌单元与反 slop

> 📊 Level ⭐⭐⭐ | 10.5KB

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

## 深度分析

### 从第一性原理推导方法论：两个事实如何"逼出"整套 Harness

这篇方法论的独特之处不在于罗列技巧，而在于每一条实践都能回溯到 LLM 的物理属性。事实一（概率采样）说明模型每一步都是"按概率挑一个"而非"想清楚再说"，小偏差沿链路累积——自由空间越大，跑偏概率越大。事实二（注意力稀薄化）说明窗口越长每个 token 拿到的注意力越少，"Lost in the Middle" 使长上下文中段信息最易被遗忘，多轮对话还叠加新旧方案共存与 recency bias。水流理论与最小混沌单元因此不是平行支柱，而是分别针对这两个事实的结构选择：粒度小则搜索空间小（对抗事实一），单次任务上下文小则不易腐烂（对抗事实二）。[Lost in the Middle](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/lost-in-the-middle.md) 现象与 [Context Window Economics](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md) 在这里被统一进同一个工程对策。

### 反 slop 的本质：压缩搜索空间而非提升模型能力

best-practice slop 的产生机制，是模型在过大的目标空间里把网上最常见的套路糊上来——"看似专业、结构漂亮，但不贴业务地形"。反 slop 的应对（复述→纠正→查证→沉淀 spec）本质上是在写代码之前把模型的搜索空间从"词表级自由"压缩到"spec 级约束"。作者强调这一轮可能不写一行代码，但它已把模型从"凭概率乱选路"挪到"在清晰目标和边界内自主推进"。这与把 slop 归咎于"模型不够聪明"的流行解释形成对照：问题不在能力，在约束缺失。相关诊断思路可对比 How to Avoid AI Code Slop。

### checkpoint 的真实分布：加料压倒放行

作者统计了自己在多个项目 checkpoint 上的真实输入分布：加料（沿原方向叠新约束）约 47%，追问约 25%，放行仅约 9%，绕道/回炉/阻止合计不足 8%。这个反直觉的数据说明 checkpoint 的本质不是"裁判判决"而是"细颗粒控盘"——人的主要工作是在推进过程中持续补充约束、澄清事实，而非逐段批准。混合输入是常态（"ok 注意核心目标"= 放行+加料），六种动作只是主要桶。checkpoint 还有一个隐蔽收益：让模型复述目标会利用 recency bias 把目标从上下文中段推回尾段，反向对抗 lost-in-the-middle。

### 验收哲学：不听"完成了"，要证据链

"Agent 最危险的时候不是它报错，是它说'完成了'但没有证据"——这引出五层 safety net：自验（7 维度验收报告）、自测（模型自己跑接口测试读日志）、他测（干净上下文的 review agent + 测试同学）、自动化回归+巡检、灰度+金丝雀+一键回滚。两层关键洞察：其一，自己 review 自己等于没 review——实施 agent 已在自己的方案里"住"了几十轮对话，被自己的设计锚住；其二，风险越高启用的层越多，0→1 项目两层够用，1→N 存量项目需全五层。这与 [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) 的分层治理思路互为印证，也解释了为什么"我经常不看代码"在证据链完整时是姿态而非冒险。

## 实践启示

1. **接任务先问"搜索空间有多大"**：目标越模糊，越要先做反 slop（复述、纠正、查证）再动手；直接把模糊目标丢给模型，等于让它凭概率乱选路，产出大概率是 best-practice slop。
2. **区分"省 token"和"省上下文"**：前者是成本问题，后者是质量问题。给模型喂料时追求干净、精炼、聚焦，而不是"越多越好"——上下文过长时关键信息反而会被噪音淹没。
3. **任务粒度遵循"小到可检查，大到可自治"**：拆分标准是每段都能验、失败能局部回炉。任务过大最大的风险不是必然失败，而是失败得太晚——回滚半径等于整个任务。
4. **把"do it"当成六种控盘动作之一而非唯一**：实际占比最高的是加料（~47%）和追问（~25%），纯放行不到 10%。checkpoint 上盯四件事：有没有越界、目标有没有偏、证据链够不够、风险有没有进安全通道。
5. **spec 必须落到本地文件并持续回写**：转向时分叉点说清楚后让模型回去重读 spec，而不是口头复述——脑子里的约定会随对话腐烂。0→1 的 spec 允许"待后续补充"，它是活文档而非一次写完的完美文档。
6. **用风险等级决定验收层数**：0→1/内部工具/可灰度可回滚的场景，自验+自测两层够用；存量项目、权限支付安全路径、无回滚机制的线上改动，必须全五层——代码可以便宜，后果不能便宜。

## 与现有 Harness 实体的关系

本文的独特贡献在于从 LLM 第一性原理（token 采样概率 + 注意力机制）出发推导 Harness 方法论，提出了现有 entities 未覆盖的 three native concepts（反 slop、水流理论、最小混沌单元）。与 Harness Engineering 综合实体 的 5 制品/三大阵营互补，与 [阿里云 Java Harness 实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-alibaba-java-case-study.md) 同属阿里云生态但视角不同（本文偏方法论而非案例）。

> 参见也（see also）：[生产级 Harness 架构设计](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture-design-production-guide.md)、[Harness 综合范式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-paradigm-comprehensive-2026.md)

→ [原文存档](https://mp.weixin.qq.com/s/t04ysxZN2qEc3986r2gyTA)

---

