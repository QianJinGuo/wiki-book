# Cohere North Mini Code -30B MoE Agentic Coding Model

## Ch01.561 Cohere North Mini Code -30B MoE Agentic Coding Model

> 📊 Level ⭐⭐ | 8.1KB | `entities/cohere-north-mini-code-agentic-coding-model.md`

# Cohere North Mini Code —30B MoE Agentic Coding Model

>原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cohere-north-mini-code-agentic-coding-model.md)

##概述

Cohere 于2026-06-09 发布 North Mini Code（`North-Mini-Code-1.0`），是公司首款开源 agentic coding 模型，也是新一代模型矩阵的"inaugural"成员。30B 总参数 +3B active 的 MoE架构，Apache2.0许可，定位"sovereign developer ecosystem"——开发者可在本地/私有部署运行，不受云厂商锁定。

##核心规格

- **架构**：Mixture-of-Experts（MoE），30B 总参数 /3B active
- **Context**：256K 总 context，64K max generation
- **License**：Apache2.0
- **部署**：Hugging Face（权重）、Cohere API、Cohere Model Vault、OpenRouter
- **硬件最低要求**：1× H100 @ FP8
- **优化目标**：code generation、agentic software engineering、terminal tasks

##基准与性能

- **Artificial Analysis Coding Index**：33.4（在同 size级别模型中具竞争力）
- **Output throughput**：相比 Devstral Small2 高 **2.8x**（同并发 + 同硬件）
- **Inter-token latency**：领先 Devstral Small2 **30%**
- **TTFT (Time-to-First-Token)**：与 Devstral Small2接近，Devstral略优

## Agentic 工作流能力

North Mini Code专为 agentic workflows 设计：
-理解并编排 sub-agents
-映射系统架构
- 运行 code reviews

模型与 OpenCode做了专门训练兼容，但 Cohere强调"works with most coding agents"。

##评测方法（benchmark 来源透明度）

Cohere 在评测中使用了三个 harness：
- **SWE-agent** — 用于 SWE-Bench Verified 与 SWE-Bench Pro
- **ReAct 单工具 harness** — 用于 Terminal Bench v2
- **Terminus-2 harness** — 用于 Terminal Bench Hard（North Mini Code 与对比模型均用此 harness）

竞争对手分数采用公开报告或 Artificial Analysis Intelligence Index。Gemma4 的 agentic coding分数由 Qwen团队报告。

## 三件独特贡献（与同 size 开源 coding 模型差异）

1. **Sovereign-developer定位** —不同于 Qwen3-Coder、Devstral 等"中国/欧洲主权云"模型，North Mini Code 是北美大厂第一款明确"反 vendor lock-in"的开源 agentic coding 模型。Apache2.0 + 本地/私有部署 + "freedom from vendor constraints"叙事直接对标商业 API 模型。
2. **256K context +64K max generation** — 同 size级别里 context window 大幅领先（Devstral Small2约32K），让 agentic coding 可在长 repo + 多文件上下文中执行。
3. **30B MoE 高效推理** —3B active 让单卡 H100 可跑，是"小尺寸 + 长 context + agentic"三角平衡的代表；与 Qwen3-Coder-30B-A3B（同年同月发布）的设计哲学几乎完全重合，构成"open agentic coding30B MoE" 的双重选项。

## 对标对比

|维度 | Cohere North Mini Code | Devstral Small2 | Qwen3-Coder-30B-A3B |
|------|----------------------|------------------|---------------------|
| 总参数 |30B | ~24B |30B |
| Active |3B |24B（dense） |3B |
| Context |256K | ~32K |256K |
| License | Apache2.0 | Apache2.0 | Apache2.0 |
| Positioning | Sovereign developer | Mistral ecosystem | Alibaba 通义 |
| Benchmark |33.4 Coding Index | comparable | comparable |

## 深度分析

**1. MoE 架构的工程哲学：为何 3B Active 是关键分水岭**

30B 总参数但仅 3B active 的设计并非保守权衡，而是精准的工程定位。单 H100 @ FP8 推理时，3B active 意味着 80GB H100 可完整加载并运行推理，这是"本地 sovereign 部署"的硬件底线。 与之对比，Devstral Small2 的 24B dense 架构在同等硬件下吞吐更低，而 Qwen3-Coder-30B-A3B 采用几乎相同的设计哲学，构成"open agentic coding 30B MoE"的双子星。3B active 让 North Mini Code 在效率上形成对 dense 模型的相对优势，同时为 256K context 提供了充足的激活容量。

**2. Benchmark 透明度问题：三种 Harness 意味着什么**

Cohere 使用三种不同的评测 harness（SWE-agent、ReAct 单工具、Terminus-2）横跨 SWE-Bench Verified/Pro 和 Terminal Bench v2/Hard。 这种做法本身是合理的工程选择，但当评测方法论未在同一条技术报告中统一披露时，横向对比的可信度会受到影响。竞争对手数据来自公开报告或 Artificial Analysis Index，而非同一套标准化流程。这意味着 33.4 Coding Index 与 Devstral Small2 的对比需保留置信区间余量。

**3. 吞吐 vs 首 token 延迟：架构取舍的深层信号**

2.8× 吞吐提升 vs 30% Inter-token Latency 改善，但 TTFT 几乎持平——这组数据揭示了 North Mini Code 的核心架构取舍。 高吞吐来自更大的 batch size 和更深的 pipeline parallelism，但首 token 响应并未同等优化。对于 agentic coding 场景，这意味着模型适合"提交任务后等待批量结果"，而非"实时交互式调试"。这一特性与"编排 sub-agents + 代码审查"的定位高度一致，但对 IDE 内联补强场景不利。

**4. 256K Context 的战略价值：超越技术规格的护城河**

同尺寸开源 coding 模型中，256K context 是独占优势。Devstral Small2 约 32K context 在跨多文件 refactor 或长 repo PR review 时受限于 context overflow，而 North Mini Code 可将中等规模代码库（~20 个文件）完整加载。这将"长程任务中的 context 管理"问题转化为可忽略因素，从而在架构层面规避了长 context 场景下的 agentic 失败模式。

## 实践启示

- **agentic coding 模型选型**：当工作流需要 ≥64K generation context（如跨多文件的 refactor、长 repo PR review），256K context 是 North Mini Code 相对 Devstral Small2 的硬优势。
- **本地部署门槛**：1× H100 @ FP8 的最低配置意味着 80GB H100 是 baseline；3B active 推理对消费级 GPU（4090/RTX6000 Ada）不友好。
- **vendor 多样化**：Apache2.0 + 三家可访问渠道（Hugging Face / Cohere API / OpenRouter）让 North Mini Code 成为 "anti-vendor-lock-in"工具链中的可选项，与 Mistral Devstral、Qwen3-Coder 形成开源三足。

## 来源

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cohere-north-mini-code-agentic-coding-model.md)

**外部参考**：
- Hugging Face权重：https://huggingface.co/cohere-for-ai/north-mini-code
- Cohere Model Vault：https://docs.cohere.com/docs/model-vault
- Artificial Analysis Coding Index：https://artificialanalysis.ai/

---

