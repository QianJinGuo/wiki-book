## Ch19.013 From AGI to ASI

> 📊 Level ⭐⭐⭐⭐ | 6.3KB | `entities/arxiv-2606-12683-from-agi-to-asi.md`

# From AGI to ASI

## 摘要

DeepMind 团队（Tim Genewein、Shane Legg、Marcus Hutter 等 14 位作者）于 2026 年 6 月发表的研究报告，系统性地探讨了从人类水平 AGI 到人工超级智能（ASI）的转换路径。报告将 Universal AI 作为理论终点，聚焦 AGI 到 ASI 的过渡——即比大型人类组织更聪明、认知能力更强的系统。报告识别了四条潜在路径，讨论了摩擦因素和瓶颈，并指出由于巨大的不确定性，不能排除 AI 进展在未来几年继续加速的可能。

## 核心要点

### 1. ASI 的定义与特征

报告将 ASI 定义为"比大型人类组织更聪明、认知能力更强的系统"。这不是 AGI 的简单递进，而是质的飞跃——ASI 需要具备超越人类集体智慧的能力，包括但不限于：跨领域知识整合、大规模协调、自主发现新范式等。理论终点 Universal AI（AIXI 框架下的最优智能体）提供了形式化基础。

### 2. 四条 AGI→ASI 路径

报告识别了四条潜在路径：

- **Scaling AGI**：通过扩大计算规模、数据规模和模型规模来提升 AGI 能力。这是当前最直观的路径，但面临物理和经济约束。
- **AI Paradigm Shifts**：通过根本性的架构创新（类似 Transformer 对 RNN 的替代）实现能力跃迁。历史上每次范式转换都带来了数量级的能力提升。
- **Recursive Improvement**：AI 系统改进自身架构、训练数据或推理流程，形成自我强化循环。这是最危险也最有潜力的路径。
- **Multi-Agent Collectives**：大量 AI Agent 大规模协作，涌现出超越单个 Agent 的集体智能。

### 3. 摩擦因素与瓶颈

报告详细讨论了可能延缓或阻止 ASI 出现的摩擦因素：
- **计算瓶颈**：物理硬件限制、能源成本、芯片供应链
- **数据瓶颈**：高质量训练数据的稀缺、数据质量退化
- **算法瓶颈**：当前范式可能存在根本性限制
- **社会摩擦**：监管、公众态度、国际竞争
- **Alignment 约束**：安全要求可能限制能力发展的速度

### 4. 关键洞察：渐进式变革 vs 阶跃式变革

报告提出一个重要观点：AGI 引入社会可能不会带来单一的"变革时刻"，而是**一系列由 AI 驱动的跨领域科技进步所引发的渐进式社会变革**。这一洞察挑战了"AGI 时刻"的流行叙事，暗示社会适应过程可能比预期更渐进但更广泛。

### 5. 开放研究问题

报告列出了 ASI 路径上的关键开放问题：
- Self-modifying architectures 的安全性
- Constitutional AI 的规模化可行性
- 跨 Agent 协作的 emergent behavior 可预测性
- Alignment window（AGI 到 ASI 过渡期的监管窗口）设计
- 能力评估的新 benchmark 需求

## 深度分析

### Recursive Self-Improvement 的临界点

报告聚焦于 recursive self-improvement（递归自我改进）作为 AGI→ASI 的关键转折点。这不是简单的自我训练，而是 Agent 能够改进自身的**架构设计能力**——修改自己的学习算法、优化自己的训练流程、设计自己的评估标准。一旦这种能力达到临界水平，改进速度可能呈指数增长。

### Alignment Window 的紧迫性

AGI 到 ASI 的过渡窗口（alignment window）是 alignment research 的核心目标。如果 ASI 的出现比预期更快，人类可能没有足够时间设计和部署有效的监管机制。报告暗示这一窗口可能比通常认为的更短，因为 AI 进展可能持续加速。

### 与现有 ASI 讨论的差异化

与 Superintelligence（Bostrom 2014）的哲学性讨论不同，本报告更注重工程路径分析；与 Scaling Laws 的实证研究不同，本报告关注超越 scaling 的路径。报告的独特价值在于将理论（Universal AI）与实践（四条路径）结合，提供了可操作的研究方向地图。

### Multi-Agent Collectives 路径的独特性

Multi-agent collective 路径在现有 ASI 讨论中较少被关注。报告认为，大量专业化 AI Agent 的大规模协作可能涌现出超越任何单个 Agent 的集体智能，这类似于人类社会的组织智慧。这一路径的实现不需要单个 Agent 达到 AGI 水平，降低了对单一系统能力的要求。

## 实践启示

1. **Alignment 研究的时间窗口可能比预期更短**：不能假设 AGI 到 ASI 的过渡是缓慢的
2. **Recursive self-improvement 需要新的安全框架**：传统的"关闭电源"式安全措施在 self-improving 系统面前可能失效
3. **多路径并行准备**：四条路径可能同时推进，需要跨领域的协调应对
4. **渐进式变革的政策含义**：社会需要为一系列持续的 AI 驱动变革做准备，而非等待单一"AGI 时刻"
5. **跨学科协作的必要性**：报告强调需要"massively interdisciplinary endeavour of global scope"来应对 ASI 挑战

## 相关实体

- [mira + mpa：深度原理 ai scientist 递归自训练打造材料基座模型，40 项实验全面 sota](ch01-183-chatgpt-26.html)
- [some ideas for what comes next, may 2026 (interconnects)](ch01-910-some-ideas-for-what-comes-next-may-2026-interconnects.html)
- [agi 之路，可能从一开始就走错了（腾讯研究院·王鹏）](ch01-258-csp-html-chrome.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/arxiv-2606-12683-from-agi-to-asi.md)

---
