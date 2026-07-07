# 王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战

## Ch05.037 王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战

> 📊 Level ⭐⭐ | 14.8KB | `entities/wangyunhe-harness-optimization-agentsoul.md`

## 核心命题：Agent = Models + Harness

王云鹤（华为诺亚方舟实验室）提出 **Agent = Models + Harness** 的定义框架，其中 Models 特指多模型协作而非单一 Base Model。这一定义直接回应了 Agent 概念长期缺乏清晰边界的问题。

Harness 在此语境下指围绕模型的所有高价值元素——包括 [prompt 工程](https://github.com/QianJinGuo/wiki/blob/main/concepts/prompt-engineering-fundamentals.md)、RAG（检索增强生成）、tools（工具调用）、memory（记忆）等——联动形成的有机系统。王云鹤强调，Harness 不会消亡：RAG 不是在消失而是在升级——当 RAG 加上 prompt、工具调用、知识后，它演变为 [skills](ch05/068-thin-harness-fat-skills-ai.html) 的核心组件。Harness 元素始终存在，并随模型能力和算法创新不断进化。

## 国内模型格局：七国八制与异构竞争

国内基础模型生态呈现高度异质性特征。不同厂商根据自身业务属性、训练数据和技术路线产生了显著特异化：

- **数学推理**：部分模型在数学任务上表现突出
- **编程能力**：某些模型在 coding 任务上具备优势
- **长序列处理**：长上下文窗口模型各有千秋
- **价格分层**：从开源免费到商业 API 定价差异悬殊

这种异构性格局意味着没有单一基座模型能垄断所有场景。值得注意的是，Benchmark 测试分数与具体任务表现之间的关联度可能很低——典型案例是 GPT 因过度安全校准而在量化交易任务中失利，而 [DeepSeek](../ch01/1048-deepseek-v4.html) 和通义千问反而表现优异。

Claude Code 的内部实现印证了多模型路线的有效性：通过调用 opus、sonnet、haiku 等多款模型实现综合最优效果。

## 任务冲突：为什么统一模型难以胜任

语言模型在大多数情况下并非在同一基模中学习所有任务。快慢思考（System 1 + System 2）的统一方案在 2025 年被几乎所有从业者放弃。

类比图像处理领域的经典冲突：图像超分辨率（需要高通滤波）和去模糊（需要低通滤波）在同一基模中天然存在冲突^[Chen et al., IPT, CVPR 2021]。类似地，不同任务的最优模型会产生差异性需求。

## 多模型协同的必然性

超越纯 LLM 的局限，多模态生成、具身智能等复杂场景需要多模型协同：

| 流水线阶段 | 协作模型 | 说明 |
|-----------|---------|------|
| 文案转写 | LLM-1（擅长内容生成） | 将用户需求转化为脚本 |
| 视频生成 | 多模态生成模型 | 基于文案生成视觉内容 |
| 转场稳定性保障 | 专用质量模型 | 检测连贯性、质量评分 |

具身智能领域尤为典型：感知、决策、运动控制、预测、记忆等模块需要不同专长的模型协同工作。Harness 层的时间窗口预计持续 3-5 年以上。

### Claude Code 的多模型实现

Claude Code 内部通过调用 opus、sonnet、haiku 等多款模型实现综合最优效果：

- **Opus**：复杂推理、长程任务规划
- **Sonnet**：日常编码、中等复杂度任务
- **Haiku**：快速补全、轻量级操作

这种分级模型架构体现了资源与能力的动态匹配，是多模型协作的典型工程实践。

## Harness Engineering：形式化优化框架

王云鹤将 [Harness 工程](ch05/062-harness-engineering.html) 形式化为一个优化问题：

**Agent 价值范式** = 任务价值 × 成功率 × Token 性价比（Intelligence/Token）

**优化目标**：对于给定任务 T，从模型集合 M 中选择最优模型序列，并为每个模型调优 Harness 组件参数——包括 、RAG、memory、safety 等——至最优状态。

**四大优化手段**：

| 优化手段 | 描述 | 适用场景 |
|---------|------|---------|
| **handcrafted 经验规则** | 基于专家经验的规则化配置 | 快速原型、冷启动 |
| **human-in-the-loop 反馈** | 人工标注、偏好学习、人工调试 | 高价值任务、安全关键场景 |
| **LLM as optimizer** | 使用 LLM 自身作为优化器搜索最优配置 | 复杂参数空间、大规模搜索 |
| **AutoML 经验迁移** | 借鉴 AutoML 的超参调优、架构搜索经验 | 标准化 pipeline、大规模生产 |

这一框架将传统的  从艺术转变为可系统化求解的优化问题。

## Model Parameters + Harness Parameters 联合优化

下一代 AGI 的演进路径指向 **Model Parameters 与 Harness Parameters 的迭代优化或联合优化**。

Anthropic 的实践提供了典型案例：

- opus 4 → Claude Code 1.0
- opus 4.5 → Claude Code 2.0
- opus 4.6 → Claude Code 3.0

基座模型与 Harness 迭代互促，形成正向飞轮。

## AI"灵魂"之争：核心哲学问题

如果 Harness 能控制模型行为、选择调用哪个模型、甚至基于 Harness 数据增训模型实现自主进化——那么 AI 的"大脑"或"灵魂"到底在基座模型还是在 Harness 层？

这一哲学拷问关乎 AGI 时代的控制权归属和技术演进方向：

| 视角 | 立场 | 论据 |
|------|------|------|
| **基座模型派** | 智能本质在模型参数中 | 推理能力、涌现行为、泛化能力源自模型 |
| **Harness 派** | 智能体现在配置与编排 | 任务执行、智能调配、知识组织由 Harness 决定 |
| **融合派** | 二者共同进化 | `联合优化`形成正向飞轮 |

### 为什么这个问题重要

- **控制权**：如果 Harness 决定调用哪个模型、反馈什么数据，微调什么参数，那么模型本身是否只是"计算资源"？
- **价值分配**：AGI 时代，价值会集中在模型提供商还是 Harness 层？
- **技术演进**：理解"灵魂"所在，决定研发投入的方向

> [!quote] 王云鹤的核心洞察
> 基座模型与 Harness 迭代互促，形成正向飞轮——两者的边界正在模糊，但博弈从未停止。

## 深度分析

**洞察 1：Agent 概念的核心突破在于将优化视角从模型转向系统**

王云鹤最深刻的贡献在于将 Agent 从模糊的概念定义转向可量化的系统优化问题。Agent 价值范式（任务价值 × 成功率 × Token 性价比）提供了评估 Agent 系统性的统一度量框架，使得不同技术路线的比较成为可能。在此框架下，"哪个模型最强"不再是唯一问题，"在给定成本和任务约束下如何配置最优系统"才是真正的工程问题。

**洞察 2：多模型协同的本质是差异化任务匹配，而非简单集成**

模型"七国八制"的异构性格局表明，没有单一基座模型能在所有任务维度同时达到最优。Benchmark 与实际任务表现的低关联度进一步证实，脱离具体业务场景的模型评测价值有限。Claude Code 采用 opus-sonnet-haiku 分级调用体现的核心原则是：资源与能力的动态匹配——复杂推理任务分配高端模型，快速补全任务分配轻量级模型，以实现全局最优而非局部最优。

**洞察 3：Harness 的生命周期被显著低估**

业界曾预期 RAG 等技术会随模型能力增强而逐渐消亡，但实际观察到的却是"升级而非消失"。当 RAG 与 prompt、工具调用、知识整合后，它演变为 skills 系统的核心组件，其技术生命力的延续来自于不断扩大的应用场景而非被替代。这种升级路径意味着 Harness 层的创新空间实际上比纯模型优化更为丰富，尤其在企业级 Agent 应用中，Harness 的工程价值将持续释放。

**洞察 4：四大优化手段构成完整的 Agent 工程方法论**

从 handcrafted 经验规则到 human-in-the-loop 反馈，再到 LLM as optimizer，最后到 AutoML 经验迁移，这四个层次构成了从冷启动到大规模生产的完整路径。每种手段对应不同的工程成熟度阶段：专家规则适用于快速验证想法，人工反馈适用于高价值场景的精度提升，LLM as optimizer 适用于复杂参数空间的探索，AutoML 经验则适用于标准化生产环境的规模化优化。

**洞察 5：Model-Harness 联合优化是 AGI 演进的关键分水岭**

Anthropic 的 Claude Code 版本迭代路径（opus 4 → Claude Code 1.0 → opus 4.5 → Claude Code 2.0）揭示了一个重要规律：基座模型能力的提升会解锁新的 Harness 应用场景，而 Harness 的优化反过来也在定义对下一代模型的需求。这不是简单的版本对应，而是一种共同进化的飞轮机制。理解这一点对于 AGI 时代的技术战略布局至关重要——仅关注模型能力或仅关注 Harness 优化都是不完整的。

## 实践启示

1. **建立多模型评测体系而非依赖单一 Benchmark**
国内模型生态的异质性要求 Agent 开发者在选型时进行任务级的针对性评测。Benchmark 分数与实际任务表现之间的低关联度是一个重要警示：必须围绕自身业务场景建立多模型对比矩阵，而非简单依据公开榜单做决策。对于特定领域的 Agent 系统，应该设计包含准确率、延迟、Token 消耗、稳定性等多维度的评测体系。

2. **采用分层模型架构来优化性能与成本**
Claude Code 的 opus-sonnet-haiku 分级调用是资源与能力动态匹配的典型案例。在设计 Agent 系统时，应预先定义任务复杂度分级标准，并为每个级别匹配相应的模型资源。复杂推理和长程规划任务使用高端模型，日常编码和中等复杂度任务使用中端模型，轻量级操作如补全、格式化、验证使用低端模型。这种分层设计能够在保证输出质量的前提下显著优化 Token 成本。

3. **将 Harness Engineering 纳入正式的技术债务管理**
提示词、RAG、memory、safety 等 Harness 组件不应被视为"临时配置"或"魔法调参"。建议将这些配置纳入版本控制，建立 handcrafted 规则基线，通过 human-in-the-loop 反馈积累偏好数据，在复杂参数空间中使用 LLM as optimizer 搜索最优配置，并借鉴 AutoML 的持续优化经验。只有将 Harness 优化作为系统工程来管理，才能实现可复制、可迭代的 Agent 工程能力。

4. **关注 Model-Harness 联合优化的战略布局**
Model Parameters 与 Harness Parameters 的联合优化代表着一个明确的技术演进方向。Anthropic 的 Claude Code 迭代飞轮已经验证了这一路径的可行性。对于有资源投入的企业团队，应该提前在以下方面进行布局：基座模型能力演进路线图与 Harness 版本规划的协同；Harness 配置数据（偏好反馈、任务轨迹）作为模型微调基础数据的管道建设；以及在组织层面建立模型团队与 Harness 工程团队的协同机制。

5. **重视 Agent 哲学层面的问题研究**
"AI 灵魂之争"并非纯粹哲学讨论，而是直接关系到 AGI 时代的控制权归属和价值分配问题。Harness 层正在获得对模型行为的控制权——选择调用哪个模型、基于 Harness 数据增训模型——这意味着未来 AGI 生态中，Harness 层的价值占比可能会超过模型本身。建议技术决策者在关注模型能力的同时，也投入精力研究 Harness 层的战略布局，包括数据管道、编排逻辑、反馈机制等核心组件的所有权和控制权问题。

## 参考文献

- [r1] Trivedy, Vivek. "The Anatomy of an Agent Harness." LangChain Blog, 2026.
- [r2] Liu, Rui, et al. "AgentOS." arXiv:2603.08938, 2026.
- [r3] He, Chaoyue, et al. "Harness Engineering for Language Agents." 2026.
- [r4] Chen, Hanting, et al. "Pre-trained Image Processing Transformer." CVPR 2021.
- [r5] Tian, Yuchuan, et al. "Instruct-IPT." arXiv:2407.00676, 2024.
- [r6] Yang, Chengrun, et al. "Large Language Models as Optimizers." ICLR 2024.
- [r7] Trivedi, Prashant, et al. "Align-Pro." AAAI 2025.

## 相关实体
- [Ai Coding 入门指南 如何更好地让Ai真正帮你干活 V2](ch05/082-ai-coding.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/wangyunhe-harness-optimization-agentsoul.md)

- [Prompt Context Harness Three Evolutions Tencent](ch05/009-harness.html)
- [Openclacky Prompt Cache Harness V2Ex 799662C56Ba6](ch05/009-harness.html)
- [Agent Tools Research](../ch03/045-agent.html)

---

