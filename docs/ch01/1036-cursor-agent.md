# Cursor如何把一个通用模型，训成顶级编程 Agent

## Ch01.1036 Cursor如何把一个通用模型，训成顶级编程 Agent

> 📊 Level ⭐⭐ | 3.6KB | `entities/cursor如何把一个通用模型训成顶级编程-agent.md`

# Cursor如何把一个通用模型，训成顶级编程 Agent

**来源**: 高可用架构

**发布日期**: 2026-03-31

**原文链接**: https://mp.weixin.qq.com/s/q-YQp4LaUNzunupo4cnNhw

---

导读：该文章详细解读了Cursor Composer 2模型的技术报告，聚焦于其两阶段训练流程：持续预训练阶段使用Kimi K2.5基础模型增强编码领域知识，并引入多 token 预测以提升推理效率。

强化学习阶段强调 agentic 软件工程能力，通过 Anyrun 环境和 Firecracker 虚拟机实现安全执行，奖励系统结合任务成功率与非线性长度惩罚，采用 GRPO 变体进行异步训练。

CursorBench 基准基于真实用户任务设计，包括模糊指令和复杂诊断问题，不断迭代以避免饱和，提供模型在实际开发场景中的可靠评估。

作者 AVB（@neural_avb），知名 AI 研究解读博主，YouTube“Neural Breakdown”频道主理人。专注拆解前沿 AI 论文，以清晰、教育性方式解读大模型训练、强化学习与软件工程Agent技术。擅长用 AI 工具辅助阅读论文，深受开发者与研究者欢迎。

上周，Cursor 发布了 Composer 2 。这是他们专为智能体（Agentic）软件工程设计的前沿级 AI 模型。本文将根据其技术报告，深入浅出地解析核心要点：这些模型是如何训练的、强化学习（RL）框架是如何设计的，以及 “CursorBench” 基准测试到底在衡量什么。

注：Cursor 并未赞助此文，我只是喜欢研读新论文并记录所学。

Cursor(@cursor_ai) Composer 2 is now available in Cursor.

特别说明： 本文旨在提供教育性科普。我将严格专注于技术部分，拒绝废话，不带节奏，也不会提及发布周期间发生的任何争议。

以下是根据 Cursor 官方技术报告整理的 Composer 2 诞生过程 👇🏼

## 两阶段训练流程

Composer 2 遵循一个两阶段训练流水线，旨在构建深厚的知识储备和执行能力：

- 持续预训练（Continued Pretraining, CPT）：
  此阶段侧重于增强模型的潜在编程能力和特定领域知识，确保模型对编程语言、模式和文档有“深度”理解。

- 大规模强化学习（Large-Scale RL）：
  这是“智能体化”的训练步骤。RL 用于提升模型的端到端表现。AI 在此学习如何推导问题、在终端执行命令，并在长任务中保持一致性。

## 第一阶段：持续预训练（Continued Pretraining, CPT）

持续预训练是语言模型训练中常见的后期处理步骤。CPT 的目标是让基础语言模型成为特定领域的专家。

你向模型输入特定领域（例如“牙科”）的大规模文本数据，并进行“下一个 Token 预测”训练。目标是增强模型在该领域的知识，即使这可能会以降低不相关领域（如“扑克牌”）的性能为代价。

Composer 2 的 CPT 阶段旨在将基础模型（ Kimi K2.5 ）转化为“编程专家”，之后才会通过强化学习让它学习如何使用工具或与环境交互。

核心观点： CPT 并不是为了训练“能力”，更多是为了增加模型的“领域知识”。

### 1. 基础模型选择：Kimi K2.5

Cursor 团队选择 Kimi K2.5 作为 Composer 2 的底座。

- Ki

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cursor如何把一个通用模型训成顶级编程-agent.md)

---

