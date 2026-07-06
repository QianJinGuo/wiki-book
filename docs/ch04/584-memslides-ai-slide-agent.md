# MemSlides — 层级记忆驱动的 AI Slide 生成 Agent

## Ch04.584 MemSlides — 层级记忆驱动的 AI Slide 生成 Agent

> 📊 Level ⭐⭐ | 2.0KB | `entities/memslides-hierarchical-memory-ai-slide-agent-tsinghua-shanghaijiao.md`

# MemSlides — 层级记忆驱动的 AI Slide 生成 Agent

MemSlides 是清华和上交联合提出的一种层级记忆驱动的 AI Slide 生成 Agent 框架，在 HuggingFace 获得日榜第一（GitHub 400+ stars）。

核心创新在于**三层级记忆架构**：User Profile（用户偏好画像）、Working Memory（当前编辑上下文）、Episodic Memory（历史操作序列）。这三层记忆协同工作，使得模型能够在多轮编辑中保持对 PPT 结构的全局理解和局部修改意图的一致性。

与传统的单轮 Prompt 生成方案相比，MemSlides 解决了 Slide 生成中的 stateful 多轮交互问题——用户可以在已有 PPT 基础上进行精确的局部修改，而不是每次都需要重新生成整体内容。这与 [Agent 记忆架构](ch03/045-agent.md) 和 [Harness 上下文管理工作集](ch05/085-harness.md) 中的层级化记忆设计思路一脉相承。

该工作表明：在 Agent 记忆管理领域，层级化设计（Profile + Working + Episodic）正在成为处理复杂创作任务的标准范式，与 [Agent 记忆力工程税](ch01/216-0.md) 中讨论的工程化挑战相呼应。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/huggingface热榜第一清华上交推出memslides精准锁定ppt局部修改.md)

---

