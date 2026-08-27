# LEAP：Google Agentic Framework 攻克形式化数学证明

## Ch04.532 LEAP：Google Agentic Framework 攻克形式化数学证明

> 📊 Level ⭐⭐ | 7.1KB | `entities/leap-agentic-formal-theorem-proving-google-2026.md`

> Google Cloud AI Research 与 DeepMind 联合提出的 LEAP（Language-model Agentic Proof-framing）框架，用 Agentic 方式攻克形式化数学证明。核心洞察：LLM 在形式化证明上的弱点不是数学能力不足，而是缺少与验证器的结构化交互。

## 核心创新

传统方法依赖专门的 prover model 微调，默认通用 LLM 不够适合 formal theorem proving。LEAP 证明了另一条路：**不改模型，改交互方式**。

LEAP 将形式化证明过程设计为 **Agentic 循环**：生成证明提议 → Lean 验证器反馈错误 → 根据错误修正提议 → 循环直到验证通过。这种"提出-验证-修正"的结构化交互让通用 LLM 在不用微调的情况下达到甚至超过专门微调模型的水平。

## 关键结果

| 基准 | 结果 |
|------|------|
| **Lean-IMO-Bench** | 形式化求解率 **70%**（无需专用微调） |
| **Putnam 2025（普特南数学竞赛）** | **12 题全对，100%** 胜率 |

过去认为通用模型在 Lean 这种严苛的机械验证语言面前，一次性写出完美证明的通过率不足 10%，导致学术界走向高成本的专用微调路线。LEAP 彻底打破了这一迷思。

## 方法论意义

LEAP 对 Agent 工程有重要启示：

1. **结构化交互 > 一次生成** — Agent 框架引入的"提出-验证-修正"循环比任何 one-shot 方法效果都好
2. **验证器作为环境** — Lean 验证器充当 Agent 的"环境"（Environment），提供结构化反馈。这与 `Harness 工程`中"沙箱即环境"的理念一致
3. **无需专用微调** — Agentic 方式在通用模型上即可达到甚至超过专用模型，降低了领域门槛
4. **可迭代的"施工图"** — 用大模型把数字证明拆成可迭代的子步骤，逐步逼近完整证明

## 与 wiki 已有知识的关联

- `Loop Engineering` — LEAP 的"提出-验证-修正"循环是 Loop Engineering 在形式化证明领域的实例
- `Code is Cheap：Harness 方法论` — 结构化交互与可验证过程的设计哲学共鸣
- `Skill Hell` — LEAP 展示了 agentic 框架在非编码领域的扩展能力

## 深度分析

### Agentic 循环：超越"一次生成"的范式突破

LEAP 最根本的洞察在于：形式化证明的困难本质上不是 LLM 的数学能力不足，而是缺乏与验证器的结构化交互。传统方法试图让模型"一次性写出完整证明"，这种 one-shot 生成在面对 Lean 这种严苛的机械验证语言时，成功率不足 10%。LEAP 通过"提出-验证-修正"的 Agentic 循环，将成功率从 <10% 提升至 70%（Lean-IMO-Bench）和 100%（Putnam 2025），证明了结构化交互比模型能力本身更重要。

### AND-OR DAG 作为推理骨架

LEAP 的另一个关键创新是使用 AND-OR DAG 来维护不断演变的证明计划。在生成完整证明失败后，LEAP 不直接重试，而是先生成一个非正式蓝图（informal blueprint），将大问题拆分为一串支持性引理，并将这些依赖关系组织成 AND-OR DAG。这个 DAG 不仅记录进度，还承担预览和规划职能——与传统方法相比，这种结构化的规划方式让模型能够系统性地逼近完整证明，而非在局部反复试错。

### "不用专用微调"的方法论启示

LEAP 最令人瞩目的成果之一是它完全不需要专用微调。通用 foundation 模型在 LEAP 框架下直接达到了甚至超过专用证明模型的水平。这对 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 有重要启示：有时问题不在模型能力不够，而在于人机交互框架设计不当。通过设计更好的"脚手架"（Agentic 框架、结构化交互、迭代验证），通用模型也能在专业壁垒极高的领域实现突破。

### 验证器即环境的架构设计

在 LEAP 中，Lean 验证器充当 Agent 的"环境"（Environment），提供结构化错误反馈。这与 Harness 工程中"沙箱即环境"的理念高度一致。验证器提供的错误信息不是简单的"对/错"二元反馈，而是包含错误位置、类型、上下文的丰富信号——Agent 可以根据这些信号精确修正自己的证明提议。这种"环境反馈 → 修正"的闭环结构是 Agentic 系统的核心设计模式。

## 实践启示

1. **先优化交互方式，再升级模型**：LEAP 证明，在通用模型上的结构化交互（Agentic 框架）可以超越专用模型的 one-shot 表现。在遇到模型能力瓶颈时，应首先检查当前交互方式是否充分利用了现有模型的能力。

2. **构建"提出-验证-修正"的迭代闭环**：对于任何复杂推理任务，设计一个带有验证环境的迭代闭环可能比追求一次生成的成功率更有效。Lean 验证器的角色可以类比为任何能提供结构化反馈的系统（如编译器的错误信息、测试框架的断言结果）。

3. **使用结构化规划（DAG）而非线性试错**：LEAP 的 AND-OR DAG 规划设计可以迁移到其他复杂任务分解场景。当一次性解决任务失败时，使用蓝图将任务分解为子目标并维护子目标间的依赖关系，比盲目的局部重试更系统化。

4. **验证器的质量决定了 Agent 的上限**：在 Agentic 系统中，环境反馈的丰富度直接影响 Agent 的修正能力。LEAP 的成功部分归功于 Lean 验证器提供了高质量的失败反馈信号——在构建自己的 Agent 系统时，应投入同等精力设计验证/反馈机制，而非仅仅优化模型推理。

5. **Agentic 框架在非编码领域的扩展潜力**：LEAP 证明了 Agentic 框架在形式化数学这一"硬"领域的可行性，意味着同样的模式可以扩展到其他需要结构化推理和验证的领域（如程序合成、法律推理、科学发现）。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/raw-leap-agentic-formal-theorem-proving-google-2026.md)

---

