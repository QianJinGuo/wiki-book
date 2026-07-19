# Langsmith Evaluation Concepts

## Ch03.130 Langsmith Evaluation Concepts

> 📊 Level ⭐⭐ | 3.6KB | `entities/langsmith-evaluation-concepts.md`

# LangSmith Evaluation Concepts

- 对 agent 要拆成 output、retrieval、tool invocation、trajectory 等关键部件
- 先用 5-10 个 curated examples 定义 ground truth
- offline evaluation 适合 benchmarking / regression / backtesting
- online evaluation 适合生产监控与异常发现

## 相关实体
- [Cursor Harness Model Production Floor](../ch01/310-cursor-harness-model-production-floor.html)
- [Agent Eval Wallezhang Yaml Driven Agent Evaluation Framework](ch03/046-agent.html)
- [Four Browser Automation Tools Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/four-browser-automation-tools-comparison.md)
- [Agent Memory Architecture Past Influence Future Ruofei](../ch04/121-agent-memory.html)
- [Cong 30 Fen Zhong Shou Gu Agent Dao Harness Cheng Wei Xin Hou Duan](../ch05/018-harness.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/langsmith-evaluation-concepts.md)

## 深度分析

LangSmith 的评估体系揭示了 agent 评估的核心挑战：与传统 ML 评估不同，agent 的输出具有多维性——不仅包含最终答案，还涉及检索过程、工具调用序列和完整轨迹。这种多维度特性使得简单的输出比对无法满足评估需求，必须对每个关键组件进行独立评估。

Ground truth 的定义是评估的基础。LangSmith 建议使用 5-10 个精心策划的示例来建立基准数据集。这个数字看似很少，但恰恰体现了"小而精"的评估哲学——在 agent 开发初期，与其追求大规模数据集，不如先确保核心场景的正确性。当基础场景稳定后，再逐步扩展评估集。

Offline 与 online 评估的选择反映了对评估目的的深刻理解。Offline 评估适用于 benchmarking、regression testing 和 backtesting，这些场景需要对实验进行精确控制，不受生产环境波动影响。Online 评估则更适合生产监控，能够实时捕捉模型退化、异常模式和用户行为变化。两者并非替代关系，而是形成闭环：线上发现的问题转化为线下数据集，经过回归验证后再部署。

对于 wiki-evolver 这类知识管理工具，LangSmith 的框架提供了直接的实践指引。当前阶段适合采用 offline benchmarking 方法，因为任务可以被整理成小规模的 curated suite，先比较 with/without skill 的效果差异。等工具高频运行后，再考虑引入 online monitoring 机制实现持续评估。

## 实践启示

1. **分解评估维度**：在设计 agent 评估体系时，首先将 agent 拆分为 output、retrieval、tool invocation、trajectory 等关键组件，为每个组件设计独立的评估指标
2. **小规模 Ground Truth**：使用 5-10 个精心策划的示例定义 ground truth，优先保证核心场景的正确性，而非追求数据集规模
3. **Offline 首步**：新 agent 或 skill 开发阶段采用 offline evaluation 进行基准测试和回归验证，确保实验可复现
4. **闭环迭代**：建立线上问题→线下数据集→回归验证→部署的反馈循环机制，实现评估的持续优化
5. **场景适配**：根据评估目的选择 offline 或 online 评估——开发期重控制，生产期重监控

---

