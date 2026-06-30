# Latest open artifacts (#19)：Qwen 3.5、GLM 5、MiniMax 2.5 — 中国实验室的前沿推进

## Ch01.375 Latest open artifacts (#19)：Qwen 3.5、GLM 5、MiniMax 2.5 — 中国实验室的前沿推进

> 📊 Level ⭐⭐ | 9.8KB | `entities/latest-open-artifacts-19-qwen-35-glm-5-minimax-25-chinese-la.md`

# Latest open artifacts (#19)：Qwen 3.5、GLM 5、MiniMax 2.5 — 中国实验室的前沿推进

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/latest-open-artifacts-19-qwen-35-glm-5-minimax-25-chinese-la.md)

## 摘要

Interconnects 第 19 期 "Latest open artifacts" 汇总了 2026 年 2-3 月中国 AI 实验室在开放权重（open-weights）模型上的密集发布：Qwen、MiniMax、Z.ai、Ant Ling、StepFun 等均推出旗舰模型；同时行业仍密切关注 DeepSeek V4 的即将发布。本期引入新的"相对采用度指标"（Relative Adoption Metrics, RAM），用于在同一规模类别内标准化比较模型下载量，GPT-OSS 与 Kimi K2 Thinking 在 RAM 评分中表现突出。

## 核心要点

1. **Qwen3.5-397B-A17B**：Qwen 团队发布跨多个尺寸的更新（dense 0.8B 到 27B，MoE 35B-A3B 到 397B-A17B），全部多模态、默认使用推理，基于 Qwen-Next 架构与 GDN 层；指令跟随、多语言、风格均有显著提升，但小模型仍存在"过度思考"问题。
2. **Step-3.5-Flash**：StepFun 推出 196B-A11B MoE，跨多个基准表现强劲，尤其在数学任务上击败多个尺寸数倍于它的模型。
3. **GLM-5**：智谱（Z.ai）发布 744B-A40B 模型，需求大增导致其编码计划（coding plan）价格上涨，并附有完整技术报告（arXiv:2602.15763）。
4. **MiniMax-M2.5**：尽管参数量相对较小，MiniMax-M2.5 已能与 GLM-5、Kimi K2.5 比肩，迅速成为社区最受欢迎模型之一。
5. **OpenThinker-Agent-v1**：OpenThoughts 团队（此前以 OpenThoughts 3 等开放推理数据集著称）首次进军 agentic reasoning，发布 SFT 与 RL 数据以及"lite"版本的终端任务评测集。
6. **Tri-21B-Think 与 MiniCPM-SALA**：分别来自韩国 Trillion Labs（21B 推理模型，支持英/韩/日）与 openbmb（8B 稀疏注意力，支持 1M 上下文窗口）。

## 深度分析

### 开放权重前沿的"中国加速"

过去一个月开放权重模型生态发生了显著变化：**所有头部中国实验室**——Qwen、MiniMax、Z.ai、Ant Ling、StepFun——均发布了旗舰模型。这是开放权重 AI 前沿推进最密集的一波。

与此同时，**DeepSeek V4 的发布仍是行业焦点**，"传闻持续加速"。其前身 DeepSeek V3.2 在 RAM 评分上表现"远低于 DeepSeek 2025 年初的发布"，意味着 V4 面临更高的预期压力。

### RAM：相对采用度指标的引入

Interconnects 与 Atom Project 联合推出的 **Relative Adoption Metrics (RAM)** 是一个衡量开放权重模型相对采用度的标准化工具：

- **核心思想**：在同一参数规模类别内，将某模型的下载量与同类模型归一化比较。
- **判定基准**：RAM 分数 >1 意味着该模型有望成为其规模类别下历史下载量前 10 的模型。
- **典型赢家**：GPT-OSS "实际上是 Llama 3.1 以来最受欢迎的开放权重美国模型"；Kimi K2 Thinking 与多个 OCR 模型表现优异。
- **典型输家**：DeepSeek V3.2 等近期大模型采用度"远低于 DeepSeek 2025 年初的发布"。

这一指标比单纯的 HuggingFace 下载量计数更有意义——它控制了**规模类别**与**发布时长**两个变量，更能反映真实的社区采用情况。

### Qwen3.5：架构升级与权衡

Qwen3.5 是 Qwen 团队的长期等待更新，亮点包括：

- **架构创新**：基于 **Qwen-Next 架构 + GDN 层**（Gated Delta Network，一种状态空间模型变体，区别于传统 Transformer 的 attention 机制）。
- **多模态原生**：所有尺寸模型均支持多模态。
- **推理默认开启**：默认使用链式推理。
- **小尺寸版本实用化**：提供 0.8B 到 27B 的 dense 模型，覆盖边缘部署场景。
- **指令跟随与多语言增强**：相比 Qwen 3 显著提升。
- **已知问题**：小模型"过度思考"（overthinking）仍存在，可通过在 chat template 中禁用推理缓解。

**Qwen 品牌 + 混合架构**的组合是否能在 Qwen 3 的基础上进一步扩大采用，是 Interconnects 重点关注的问题之一。

### GLM-5：商业化压力的信号

GLM-5 由智谱 Z.ai 推出：

- **规格**：744B-A40B MoE，总参数 744B，每次推理激活 40B。
- **市场反响**：需求大增导致编码计划（coding plan）价格上涨。
- **完整技术报告**：arXiv:2602.15763 提供详细架构与训练信息。

价格上涨本身是一个重要信号——开放权重模型在**编码场景**下开始具备商业化定价能力，挑战了"开源模型只能免费"的传统认知。

### 智能体推理（Agentic Reasoning）的开放化

**OpenThinker-Agent-v1** 是本期最值得关注的"非传统模型"项目：

- **OpenThoughts 团队背景**：此前以 OpenThoughts 3（1.2M 数据集）等开放推理数据集著称。
- **首次进军 agentic reasoning**：发布 SFT（监督微调）与 RL（强化学习）数据。
- **配套评测**：提供"lite"版本的终端任务评测集，用于评估小模型。

这一动向意味着 agentic reasoning 训练数据的开放化已拉开序幕，对 [Agent 工程能力图谱](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-engineering-capability-map.md) 中"训练数据"维度的开放生态具有结构性意义。

### 稀疏注意力与长上下文

**MiniCPM-SALA** 由 openbmb 发布，8B 参数 + 稀疏注意力，支持 **1M 上下文窗口**。

稀疏注意力（Sparse Attention）的应用意味着模型可以在有限算力下处理远超传统 attention 机制的上下文长度，这对**长文档理解、代码库级推理、多轮对话记忆**等场景具有直接价值。

## 实践启示

1. **选型应基于 RAM 而非纯下载量**：在评估开放权重模型时，关注同一规模类别下的 RAM 分数，能更准确判断模型的真实采用趋势与社区支持活跃度。GPT-OSS、Kimi K2 Thinking 等"被低估"的模型可能更适合作为基础底座。
2. **GDN 等非 Transformer 架构值得关注**：Qwen-Next + GDN 层的组合表明状态空间模型（SSM）变体在主流大模型中开始占据一席之地。对推理延迟敏感的场景，应优先评估此类架构的推理成本优势。
3. **Agent 训练数据开始开放化**：OpenThinker-Agent-v1 的 SFT/RL 数据开放，为中小团队构建垂直 agent 提供了新基座。可结合 [Agent 循环设计](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-loop-design.md) 与 [Agent 评测基准](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md) 进行二次微调。
4. **开放权重模型的商业化路径已打开**：GLM-5 编码计划涨价证明开放权重 + 增值服务（API、托管、fine-tuning 服务）的混合商业模式具备可持续性。对希望控制成本的团队，付费开放权重 API 可能优于闭源 API。
5. **"小而强"路线持续被验证**：MiniMax-M2.5 以相对小的参数量达到 GLM-5 级别性能，说明数据质量 + 训练方法学的进步比单纯堆参数更重要。在 [Agent 工程能力图谱](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-engineering-capability-map.md) 中，应将"小模型 + 强推理"视为独立分支评估。
6. **稀疏注意力是长上下文的关键路径**：1M 上下文的 MiniCPM-SALA 表明稀疏注意力工程化已成熟。对 RAG、代码库分析、多文档摘要等场景，应优先评估稀疏注意力模型。

## 关联实体

- [DeepSeek V4](ch01/528-deepseek-v4.md) — 业界关注度最高、即将发布的中国前沿模型
- [CybersecQwen 4B](ch12/096-cybersecqwen-4b.md) — Qwen 在安全垂域的专用模型
- [OpenClaw 完全指南](ch11/207-openclaw.md) — Agent 工具栈的实践参考
- [Agent 记忆系统的工程实践](ch04/503-agent.md) — 长上下文在 Agent 记忆中的工程化
- [Claude Code 源码核心机制](ch03/073-claude-code.md) — 编码场景的 Agent 实现细节
- [Agent 循环设计](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-loop-design.md) — Agent 评测与训练的核心范式

---

