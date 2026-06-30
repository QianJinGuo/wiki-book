# RoadmapBench: Long-Horizon Agentic Software Development 基准评估

## Ch04.525 RoadmapBench: Long-Horizon Agentic Software Development 基准评估

> 📊 Level ⭐⭐ | 2.8KB | `entities/roadmapbench-long-horizon-agentic-software-development.md`

# RoadmapBench: Long-Horizon Agentic Software Development 基准评估

> RoadmapBench 是一个面向长期、多目标软件开发的编码 Agent 评估基准，包含 115 个基于真实开源版本升级的长期任务，覆盖 17 个仓库和 5 种编程语言。最强模型 Claude-Opus-4.7 仅解决 39.1% 的任务，揭示长期软件开发仍是未解决难题。

## 摘要

现有编码 Agent 基准（如 SWE-bench）主要聚焦单 issue 的 Python 仓库 bug 修复，以粗粒度的 pass/fail 作为评估结果，无法捕捉真实工程规模下的长期、多目标开发能力。RoadmapBench 填补了这一空白：每个任务将 Agent 置于源版本代码快照上，提供多目标的 roadmap 指令，要求实现目标版本引入的功能，中位修改量 3700 行跨 51 个文件。

## 核心贡献

1. **真实场景**：基于 17 个真实开源仓库的版本升级，非人工构造
2. **多语言覆盖**：Python、Rust、Go、TypeScript、Java 5 种语言
3. **长期跨度**：中位 3700 行修改，51 个文件，远超现有基准
4. **细粒度评估**：不仅仅是 pass/fail，提供多维度质量评估

## 基准设计

每个任务包含：
- **源版本**：升级前的代码快照
- **目标版本**：升级后的代码快照
- **Roadmap 指令**：多步骤、多目标的开发指令
- **评估指标**：功能正确性、代码质量、架构一致性等多维度

## 主要发现

| 模型 | 解决率 |
|------|--------|
| Claude-Opus-4.7 | 39.1% |
| 最弱模型 | 5.2% |

- 现有 bug-fix 基准与长期开发能力之间存在巨大差距
- 即使最强模型也远未达到实用水平
- 长期规划、跨文件协调、架构一致性是主要瓶颈

## 实践启示

- 编码 Agent 评估需要从单 issue 修复向长期开发任务演进
- RoadmapBench 可作为 Agent 长期规划能力的标准化评估工具
- 对 Agent 架构设计提出新要求：需要支持长期上下文、任务分解、增量验证

## 相关实体

- [Self-Taught RLVR](ch01/663-self-taught-rlvr.md)
- [AWS GRPO RLVR](ch11/098-aws-grpo-rlvr-sagemaker-math-reasoning.md)
- [Verifiable Rewards RL](https://github.com/QianJinGuo/wiki/blob/main/entities/overcoming-reward-signal-challenges-verifiable-rewards-based-reinforcement-learn.md)
- [Cursor Reward Hacking](https://github.com/QianJinGuo/wiki/blob/main/entities/cursor-reward-hacking-coding-benchmarks.md)
- [Lessons from 2B Agentic Workflows](ch04/365-lessons-from-2-billion-agentic-workflows.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/arxiv-2605-15846-roadmapbench.md)

---

