# 让GUI Agent不再「边做边忘」：快手、浙大提出MemGUI-Agent，攻克长程GUI任务

## Ch04.715 让GUI Agent不再「边做边忘」：快手、浙大提出MemGUI-Agent，攻克长程GUI任务

> 📊 Level ⭐⭐⭐ | 8.7KB | `entities/让gui-agent不再边做边忘快手浙大提出memgui-agent攻克长程gui任务.md`

# 让GUI Agent不再「边做边忘」：快手、浙大提出MemGUI-Agent，攻克长程GUI任务

## 摘要

MemGUI-Agent 是由浙江大学 APRIL 实验室和快手主站技术部联合提出的面向长程手机 GUI 任务的端到端 Agent。其核心创新是 **ConAct（Context-as-Action）** 范式——将上下文管理提升为和 UI 点击、输入、滑动同级的"第一类动作"，让 Agent 在执行操作的同时主动决定如何管理自己的工作记忆。配合全链路开源的数据集 **MemGUI-3K**（平均步数 28.8 步，为业界最长），MemGUI-8B-SFT 刷新了 MemGUI-Bench 和 MobileWorld 两个长程评测基准上 open-data 模型的最好成绩。

## 核心要点

1. **长程 GUI 任务的两个核心瓶颈**：传统 ReAct 风格 Agent 在长程任务中面临"prompt explosion"（历史线性膨胀）和"information loss"（关键事实被噪声淹没）。几十步后，Agent 可能只记得"查过参数"但忘了具体数值。

2. **ConAct（Context-as-Action）设计**：将上下文管理定义为与 UI 操作同级的"第一类动作"。Agent 每步输出五段结构化内容——thinking、folding、tool_call、ui_observation、action_intent——其中 tool_call 既可以是常规 UI 操作，也可以是 memory_add/update/delete 等记忆操作。

3. **三个结构化上下文字段**：Folded Action History（完成的子任务被压缩为可复用摘要）、Folded UI State（保存关键 UI 事实的完整内容，而非模糊摘要）、Recent Step Record（最近一步的原始记录作为可靠原料）。

4. **MemGUI-3K 数据集**：从 MemGUI-Bench 的 128 个种子任务扩展而来，经过实体替换、记忆操作增强、任务简化三种方式扩展到 7303 个任务。最终包含 2956 条成功轨迹，覆盖 26 个 Android App、7 类功能场景，提取出 64430 个 SFT 样本。平均轨迹长度 28.8 步，65.1% 的轨迹使用了至少一次 memory action。

5. **两档模型均取得显著提升**：MemGUI-Agent-235B（零样本使用 ConAct 协议）在 MemGUI-Bench 上 Pass@1 提升 13.3pp 至 37.5%；MemGUI-8B-SFT（LoRA SFT）达到 23.4% Pass@1，刷新 8B 规模 open-data 最佳。在分布外 benchmark MobileWorld GUI-Only 上，235B 提升 14.6pp，8B 提升 8.5pp。

6. **ConAct 三个组件缺一不可**：消融实验显示，单独加 UI memory 提升到 17.5%，单独加 history folding 提升到 22.5%，单独加 self-describing step 提升到 25.0%，但完整 ConAct 达到 40.0%。history folding 控制增长、UI memory 保存事实、self-describing step 提供可靠原料——三者解决不同问题。

7. **失败分析：ConAct 主要减少上下文诱发的幻觉**：Full ConAct 将总失败数从 99 降到 58（↓41%），其中 process hallucination 从 52 降到 30，output hallucination 从 30 降到 13——说明 ConAct 的核心价值在于缓解"上下文导致的幻觉"，而非提升模型的知识储备或意图理解。

## 深度分析

### 从"被动追加"到"主动管理"的范式转变

传统 ReAct 风格 Agent 的上下文管理是被动的：每一步的思考、动作和结果被机械追加到消息列表中。在短程任务中这足够自然，但在跨越几十步、多个 App、多次页面跳转的长程任务中，这种方式的缺陷是结构性的——Agent 无法区分"已完成"和"进行中"的信息，也无法将"已消失的 UI 状态"中的关键事实持久化。

MemGUI-Agent 的 ConAct 设计从根本上改变了这一范式：**上下文管理被建模为与 UI 操作同级的决策问题**。Agent 在每一步不仅要决定"点击哪里"，还要决定"该压缩什么历史""该记住什么 UI 事实"。这个决策由同一个多模态策略模型在单次前向推理中完成，无需外部总结器、检索器或规则模块。

### ConAct 不是 Prompt Trick——需要训练才能习得

论文的一个重要发现是：ConAct 协议并非简单的"加个提示词就能用"。在 Qwen3-VL 不同规模模型上的零样本实验显示，只有最强的 235B-Thinking 版本能明显受益于 ConAct；较小规模模型或 235B-Instruct 在零样本下使用 ConAct 反而性能下降。这说明主动上下文管理是一种需要**专门训练**的能力——模型必须学会何时压缩历史、何时写入 UI 记忆、如何生成可复用的步骤描述。这正是 MemGUI-3K 数据集的核心价值：它不仅教模型执行 UI 操作，更教模型如何在长程任务中管理工作记忆。

### 与 Context Management 领域的关联

MemGUI-Agent 的技术路线与 **Context Management** 领域的最新进展高度契合。其"主动压缩历史 + 精确保存事实"的设计，与 **Context Caching** 和 **Memory-Augmented Agent** 的思路一致。不同于 RAG 风格的外部检索方案，ConAct 将记忆管理**内化到 Agent 的决策循环中**，避免了检索延迟和表示不一致的问题。这种"模型即记忆管理器"的架构，可能成为长程 Agent 任务的标准范式。

### 8B 模型泛化到分布外场景的意义

MemGUI-8B-SFT 在 MobileWorld（与 MemGUI-Bench 完全不同的 App 集合和任务类型）上超过 OpenMobile-8B，证明 ConAct 学到的上下文管理能力不是过拟合到特定 App 或任务模板的——它具有一定的**跨任务泛化能力**。这对于将小模型部署到手机端等资源受限场景具有重要意义：8B 模型可以通过 SFT 获得长程上下文管理能力，并在未见过的 App 上保持效果。

## 实践启示

1. **将系统问题建模为 Agent 的"第一类动作"**：MemGUI-Agent 的最大设计启示是——不要将系统级问题（如上下文管理）外包给外部模块，而是将其建模为 Agent 自身能力的一部分。类似思路可推广到安全合规检查、质量验证等其他系统级关注点。

2. **模型规模 × 训练数据的组合策略**：235B 模型可通过 zero-shot 获得 ConAct 能力，但 8B 模型需要专门训练数据。在实际部署中，可根据资源约束选择不同路线——云端用大模型零样本，端侧用小模型 SFT。

3. **消融实验的价值**：ConAct 的组件消融清晰展示了"整体大于部分之和"——三个组件各有贡献但缺一不可。这提醒我们在设计 Agent 系统时，不要过度依赖单个能力模块，而应关注多模块协同效应。

4. **数据集构建的"teacher→student"范式**：MemGUI-3K 的构建流程（强 teacher 执行 → 轨迹级过滤 → step-level 合理性过滤 → 弱 student SFT）是一个可复用的范式，适用于领域特定 Agent 数据集的低成本构建。

5. **失败类型分析指导优化优先级**：ConAct 主要解决上下文诱发的幻觉，但 knowledge deficiency 和 intent misunderstanding 改善较小——说明后续优化应聚焦在 App 知识理解、任务意图鲁棒性等方向。

## 相关实体

- **Context Management**
- **Memory-Augmented Agent**
- **GUI Agent**
- **Multi-Modal Agent**
- **ReAct Agent**
- **Agent Evaluation Benchmark**

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/让gui-agent不再边做边忘快手浙大提出memgui-agent攻克长程gui任务.md)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- 相关: [Agent 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)

---

