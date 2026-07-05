# LEAP：Google Agentic Framework 攻克形式化数学证明

## Ch04.577 LEAP：Google Agentic Framework 攻克形式化数学证明

> 📊 Level ⭐⭐ | 2.9KB | `entities/leap-agentic-formal-theorem-proving-google-2026.md`

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

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/raw-leap-agentic-formal-theorem-proving-google-2026.md)

---

