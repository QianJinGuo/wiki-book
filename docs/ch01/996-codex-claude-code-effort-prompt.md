# Codex、Claude Code 的推理 effort 本质就是往 prompt 里塞了一句话

## Ch01.996 Codex、Claude Code 的推理 effort 本质就是往 prompt 里塞了一句话

> 📊 Level ⭐⭐ | 6.3KB | `entities/codexclaude-code-推理-effort本质-就是往prompt里塞了一句话.md`

# Codex、Claude Code 的推理 effort 本质就是往 prompt 里塞了一句话

## 核心定位

本文基于 Sebastian Raschka 的长文，把 DeepSeek-R1 的 RLVR 一直拆到 Inkling 的连续值 effort conditioning，对比六份开源模型技术报告，建立推理档位（low/medium/high/max）背后的工程化理解框架。核心论点：**推理档位选择器的本质是一条自然语言 system prompt（如 "Reasoning effort: high"），它对应训练管线里一组具体的、公开可查的工程决策**，而非"多想一点"的黑箱魔法。

## 推理模型的基础机制

### RLVR：只打分，不教步骤

推理模型行为的核心训练方法是 RLVR（Reinforcement Learning with Verifiable Rewards），来自 DeepSeek-R1：给问题 → 模型生成答案 → 外部验证器检查最终答案（数学用 SymPy/WolframAlpha，代码用编译器/单测）→ 对给 reward 1，错给 0。中间推理 trace **完全不参与评分**，训练只看最终答案（R_total = R_accuracy + R_format）。只靠"奖励结果"这一条，模型自己涌现出写中间步骤、回溯检查、自我修正的行为（Aha moment）。前提是领域必须能自动核对对错——数学和代码天然满足。

### think 标签是界面需要，不是推理需要

`<think></think>` 标签对推理能力本身没有贡献——它是装饰性的，唯一作用是标记 reasoning trace 的起止位置，方便 ChatGPT/Codex 界面折叠隐藏。证据：不带标签重新训练 benchmark 几乎一样，换成任意符号效果相同。它是 RLVR reward 里的格式奖励训出来的约定，不是推理的机制基础。但标签圈出来的区域是全部工程操作的作用面：预填空标签关闭推理、标签中间截断控制长度、惩罚系数影响标签区域 token 数量。

## 从"关不掉的话痨"到混合模式

第一代推理模型（DeepSeek-R1）只有一个档位——开，且关不掉（问 "hello" 也长篇推理），产品里难用。Qwen3 是转折点：Thinking Mode Fusion 在 SFT 阶段混合 `/think` 和 `/no_think` 两种样本，`enable_thinking=False` 在 chat template 层面预填空 `<think></think>` 块让模型直接答——硬开关保证模型不会"自作主张"开始推理。到 GPT-5.6 这一代，开关从二元变成多档（low/medium/high/max/ultra）。

## 档位的实际载体与三条训练路径

### 档位 = system prompt 一句话

OpenAI 的 gpt-oss chat template 在每次请求前加 `Reasoning effort: low/medium/high`，界面下拉选择器就是把按钮映射成这句话。DeepSeek V4 Think Max 用 `Reasoning Effort: Absolute maximum with no shortcuts permitted`，Inkling 用连续值 `Thinking effort level: 0.8`，Kimi K3 在 API 暴露 `reasoning_effort` 参数。**档位的唯一载体就是这句自然语言指令。**

### 三条训练路径（六份技术报告的归纳）

随便拿未训练模型塞 "Reasoning effort: high" 不会生效——训练阶段必须把"这句话 → 这个行为"的映射编码进策略：

- **路径一：RLVR 阶段调长度惩罚** — 不同 system prompt 配不同 token 惩罚系数 λ，`R(e) = R_task − λ(e) × N_tokens`，说 low 时 λ 大逼模型写短。DeepSeek V4 和 Inkling 走此路。
- **路径二：RLVR 之后补 effort-conditioned SFT** — 收集"这个 prompt 要这么长的推理"配对样本，SFT 学会 label→长度映射。Qwen3 Thinking Mode Fusion 是此思路（二元开关版）。
- **路径三：多专家蒸馏** — 分别训 low/high/max 专家（不同长度数据、不同窗口、不同惩罚），on-policy distillation 合并进同一 checkpoint。DeepSeek V4 和 Kimi K3 明确走此路。

三条路径不互斥；推测 gpt-oss/GPT-5.6 是路径一+二组合（先 RLVR 做推理基础，再 SFT 植入档位响应），可能最成熟。

## 换模型和调档位是两个独立轴

GPT-5.6 界面把两件事分清楚：选模型（Luna/Terra/Sol）是换权重文件（训练 scaling），调档位是模型不变只改推理 token 预算（推理 scaling）。同一模型不同档位是一条曲线，不同模型是不同曲线——**小模型高档位可以追平大模型低档位**。沿曲线走是推理 scaling，跨曲线是训练 scaling。规律：档位边际收益递减（high→max→ultra 提升收窄）。

## 相关实体与概念

- [RLVR](https://github.com/QianJinGuo/wiki/blob/main/concepts/rlvr-reinforcement-learning-verified-reasoning.md) — 推理行为涌现的核心训练方法
- [推理模型](https://github.com/QianJinGuo/wiki/blob/main/concepts/reasoning-models.md) — reasoning trace 行为定义
- [预训练 vs SFT](https://github.com/QianJinGuo/wiki/blob/main/concepts/llm-pretraining-vs-sft.md) — 路径二的训练阶段基础
- [推理优化](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md) — 推理 scaling 的成本/延迟权衡
- [DeepSeek V4 训练方法论](ch01/434-deepseek-v4.html) — 路径一+三的实践
- [Claude Code Extended Thinking](../ch03/084-claude-code.html) — effort 机制的关联讨论
- [LLM 推理 effort 安全分流](ch01/896-llm-thonking.html) — effort 在安全场景的应用
- [Kimi K3 部署](../ch11/088-deploying-kimi-k3-on-aws.html) — reasoning_effort 参数的工程实践
- [Agent Loops](../ch03/084-claude-code.html) — Codex/Claude Code 的工程上下文

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/codexclaude-code-的推理-effort-本质就是往-prompt-里塞了一句话.md)

---

