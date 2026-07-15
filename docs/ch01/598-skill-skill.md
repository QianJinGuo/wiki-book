# 别再手写 Skill 了！微软最新研究：像神经网络一样训练 Skill

## Ch01.598 别再手写 Skill 了！微软最新研究：像神经网络一样训练 Skill

> 📊 Level ⭐⭐ | 7.6KB | `entities/skillopt-microsoft-train-skill-like-neural-network.md`

# 别再手写 Skill 了！微软最新研究：像神经网络一样训练 Skill

> SkillOpt 是微软的研究成果，提出将 Agent 的 Skill 文档（如 CLAUDE.md、Agents.md）视为可训练的「权重」，通过 rollout→reflection→edit 循环自动优化。在 52 个测试格中全部达到最优或并列最优，相比直怼 GPT-5.5 平均提升 +23.5 分。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skillopt-microsoft-train-skill-like-neural-network.md)

## 摘要

SkillOpt 将深度学习的训练范式映射到文本空间：Skill 文档是「权重」，Agent 执行任务是「前向传播」，分析失败原因是「梯度计算」，修改文档是「权重更新」。通过这种类比，SkillOpt 实现了 Skill 文档的自动化优化，在 SearchQA、SpreadsheetBench、OfficeQA、DocVQA、LiveMath、ALFWorld 等 6 个基准上全面超越直怼前沿模型的结果。关键设计包括 textual learning rate（每轮最多改 4 条规则）、rejected-edit buffer（失败修改的前车之鉴）和 slow/meta update（跨 epoch 的动量更新）。

## 核心要点

### Skill 的现状问题

Claude Code 的 CLAUDE.md、Codex 的 Agents.md、各种 Skill 文档——它们的共性是一段纯文本指令，告诉 Agent 遇到什么情况该怎么做。问题在于：**你怎么知道自己写的那几条规则就是最好的？** 凭经验写的规则可能漏了关键条目，写得不够精准，且你无法穷举所有可能的写法。

### 核心类比：深度学习 → 文本空间

| 深度学习 | SkillOpt |
|---------|----------|
| Forward pass | **Rollout**：Agent 带着当前 Skill 做一批任务，收集完成情况 |
| Gradient | **Reflection**：优化器模型分析失败原因，提炼改进方向 |
| Weight update | **Edit**：对 Skill 文档做 add、delete、replace 结构化编辑 |
| Learning rate | **Textual LR**：每轮最多改 L_t 条规则（默认 4），cosine decay |
| Validation checkpoint | **Validation gating**：验证集分数不涨则拒绝修改 |

### 两个模型的分工

- **Target Model**（目标模型）：日常使用的 Agent，模型本身冻结不动
- **Optimizer Model**（优化器模型）：更强的前沿模型，分析 target 的表现并提出修改建议

同级别优化器也能工作（恢复强优化器 56%-74% 的增益），但更强的优化器效果显著更好。

### 克制的学问

**有限修改**：每轮最多改 4 条规则。无限制重写（unbounded）比 L_t=4 低 2-3 分。这与深度学习中的小学习率原则一致——大幅更新容易震荡。

**Rejected-edit buffer**：被验证集否掉的修改存入缓冲区，后续 reflection 阶段会看到这些「前车之鉴」，避免重复犯错。

**Slow/meta update**：类似深度学习中的 momentum。每个 epoch 结束时跨 epoch 纵向更新，受保护的慢更新内容。去掉 slow/meta update 导致 SpreadsheetBench 从 77.5 暴跌到 55.0（-22.5 分）。

## 深度分析

### 实验结果的全面性

| Benchmark | 直怼 GPT-5.5 | SkillOpt | 提升 |
|-----------|-------------|----------|------|
| SearchQA | 77.7 | 87.3 | +9.6 |
| SpreadsheetBench | 41.8 | 80.7 | +39.0 |
| OfficeQA | 33.1 | 72.1 | +39.0 |
| DocVQA | 78.8 | 91.2 | +12.4 |
| LiveMath | 37.6 | 66.9 | +29.3 |
| ALFWorld | 83.6 | 95.5 | +11.9 |
| **平均** | — | — | **+23.5** |

52 个测试格全部最优或并列最优。在 Codex 环境中平均 +24.8 分，在 Claude Code 环境中平均 +19.1 分。

### 优化器学到的规则特征

SkillOpt 学到的规则具有三个显著特征：

1. **极度具体**：不是泛泛的「仔细检查」，而是精确的操作指令。例如 SearchQA 的规则：「根据线索的措辞推断预期答案的类型，然后从共现的独特证据中选择最短的规范实体」
2. **反直觉**：有些规则违反人类直觉但确实有效。例如 SpreadsheetBench 的规则：「先检查工作簿结构和公式，然后在整个请求的目标范围内写入已计算的静态值，而非依赖 Excel 自动重算」
3. **紧凑高效**：规则长度 379-1995 tokens（中位数约 920），极度精炼

### 跨模型迁移能力

SkillOpt 优化的 Skill 具有跨模型和跨环境的迁移能力：
- GPT-5.4 → GPT-5.4-mini（SpreadsheetBench）：+9.4
- Codex → Claude Code（SpreadsheetBench）：+59.7
- OlympiadBench → Omni-MATH（GPT-5.4）：+3.7

跨环境迁移的增益尤其显著（+59.7），说明 Skill 学到的是**任务策略**而非模型特异性的 trick。

### 训练成本分析

流程类 benchmark 每提升 1 分需要 0.6-3.6M 训练 token；复杂轨迹类需要 37.9-46.4M token。这意味着：
- 对于标准化任务（办公、搜索），Skill 优化的成本效益很高
- 对于需要复杂交互的任务（游戏、机器人），成本显著增加
- 使用更便宜的小模型作为优化器可以降低成本，但会损失约 26-44% 的增益

### 对 Harness Engineering 的启示

SkillOpt 的发现直接支持了 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 的核心理念：**Agent 系统的性能瓶颈不在模型本身，而在 harness（上下文、指令、工具配置）**。

关键启示：
- **Skill 不应手写后固定**：应该像模型权重一样持续迭代优化
- **验证驱动的修改**：每次修改都应该有验证集分数的支撑，而非凭直觉
- **小步快跑优于大刀阔斧**：限制每轮修改数量，保持稳定性
- **失败经验的价值**：被拒绝的修改也是训练信号，不应丢弃

## 实践启示

1. **建立 Skill 验证管线**：在修改 Skill 文档前，先建立评估任务集和评分标准，用数据驱动优化而非凭感觉调整
2. **采用迭代式 Skill 开发**：借鉴 SkillOpt 的 rollout→reflection→edit 循环，每次只修改 2-4 条规则，验证后继续
3. **记录失败尝试**：维护一个「rejected edits」日志，避免重复犯错，这也是元知识的重要来源
4. **跨环境测试 Skill**：优化后的 Skill 应在不同模型和执行环境中验证迁移性，确保学到的是通用策略而非特定 trick
5. **关注规则的紧凑性**：最优规则通常在 400-2000 tokens 之间，极度精炼且具体

## 相关实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch04/235-agentic.html)
- [Karpathy Vibe Coding Agentic Engineering](../ch04/669-karpathy-vibe-coding-agentic-engineering.html)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/046-agent.html)
- [两万字详解Claude Code源码核心机制](../ch03/076-claude-code.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch05/039-agent-harness.html)
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

