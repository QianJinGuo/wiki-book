# 全球首个完全AI编写的训练框架：面壁ForgeTrain速度反超英伟达Megatron，年底要把国产算力软件重写一遍

## Ch05.072 全球首个完全AI编写的训练框架：面壁ForgeTrain速度反超英伟达Megatron，年底要把国产算力软件重写一遍

> 📊 Level ⭐⭐ | 6.0KB | `entities/forgetrain-ai-written-training-framework-bidian-infoq.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/forgetrain-ai-written-training-framework-bidian-infoq.md)

# ForgeTrain：AI 编写训练框架，超越 Megatron

## 一句话

面壁智能 ForgeTrain：全球首个全部由 AI 编写、零人介入的生产级训练框架，比英伟达 Megatron 快 10%，提出"锻造工程"——为每个模型/芯片/任务现场定制框架。

## 核心方法论

**三阶段**：
1. 采集关键数据 → 形成评测 Harness
2. 构建二进制一致版本（已比 Megatron 快 10%）
3. 解除一致限制 → 迭代超越

**为什么更快**：Megatron 需在通用性和性能间权衡；ForgeTrain 为特定模型深度定制，优化空间更细。

## 关键概念

**Harness**：把目标包装成系统——环境 + 上下文 + 工具 + 任务流程 + 评分标准。"AI 制造 AI"没有现成 Harness，面壁在建立"考场"。

**Human on the Loop**：AI 自主运转，人只盯着有没有问题——比 Human in the Loop 更进一步。

## 关键数字

- 昇腾：MiniCPM5-1B 预训练 3-5 天
- 英伟达：MiniCPM4-0.5B 两天
- 比 Megatron 快 10%
- 内部 8B 已验证，MoE 即将推进

## 锻造工程

AI 写代码成本趋近于零 → 没有必要继续做大而全通用框架 → 为每个模型/芯片/任务"现场锻造"高度定制化软件。

## 一句话

"AI 研发 AI"的核心是 Harness——只要问题能被评测，AI 就能把它做得越来越好。

## 深度分析

**ForgeTrain 的技术突破性在于它完全由 AI 生成，而非人类工程师编写。** 这代表着 AI 研发范式的一个关键转折：过去 AI 生成的代码需要人类审核、修改和优化，现在 AI 已经能够生成生产级的训练框架代码。

**三阶段方法论揭示了 AI 研发的核心逻辑：** 第一阶段建立评测标准和 Harness，这是让 AI 能够自主优化的前提条件；第二阶段通过二进制一致约束保证生成代码的正确性；第三阶段解除约束后让 AI 自由迭代超越人类方案。

**速度提升 10% 的意义不在于数字本身，而在于验证了定制化路径的可行性。** 通用框架（如 Megatron）必须在覆盖广泛模型和芯片的同时保证兼容性，这牺牲了性能优化空间。ForgeTrain 为特定模型从零生成的框架，能够充分利用该模型的特性进行深度优化。

**Harness 的本质是构建可评测的"考场"。** 在传统软件开发中，编译器、单元测试等形式化工具提供了天然的评测能力。但"AI 制造 AI"这个领域没有现成的评测系统——运行成本高、反馈周期长、难以量化评估。ForgeTrain 的核心贡献之一是为这个领域建立了评测基础设施，使 AI 能够通过强化学习不断优化自身。

## 实践启示

**1. Harness 先行的工程思路值得借鉴。** 在开发任何 AI 生成代码的系统时，应首先问自己：如何评测这套代码？如果无法高效评测，AI 的优化空间就会受限。

**2. 定制化优于通用性。** 当 AI 生成代码的成本趋近于零时，为每个具体场景生成高度定制化的解决方案，比维护一个通用框架更有效。这对其他 AI 研发领域（如数据处理、模型压缩、推理优化）都有指导意义。

**3. Human on the Loop 而非 Human in the Loop。** 人类角色从参与每个环节转向监控整体方向，这要求人类能够提出正确的评测标准，而非具备每个环节的专业知识。培养"提出正确问题"的能力比"执行具体方案"更重要。

**4. 国产算力生态的追赶路径。** 通过 AI 自动化弥补人类工程师数量和经验上的差距，是一个值得关注的思路。但前提是能够建立有效的评测体系，让 AI 知道往哪个方向优化。

## 相关实体
- [Ai Coding Agent Memory System](../ch04/314-ai-coding-agent.html)
- [Deepseek Cost Migration System Layer Kv Cache Harness](../ch01/443-deepseek.html)
- [Gaode Ai Native 7X24 Pipeline Self Healing](ch05/019-ai-native.html)
- [Karpathy Claude Md Rules](../ch01/308-claude-md.html)
- [Tmall Ai Coding Practice Guide](ch05/092-ai-coding.html)

- [Minimax M3 Frontier Open Source Model](../ch09/075-minimax-m3-frontier.html)
- [Chromium Ai Coding Development System](../ch09/057-chromium-ai-coding.html)
- [Loongsuite Pilot Sls Ai Coding Metrics Practice](../ch01/1055-pilot-sls-ai.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/coding-agent-practice.md)

---

