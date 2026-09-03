# Harness 之后：Agent 可靠性的关键，是状态边界和失败闭环

> 📊 Level ⭐⭐ | 3.1KB | `entities/harness-之后-状态边界与失败闭环-若飞.md`

# Harness 之后：Agent 可靠性的关键，是状态边界和失败闭环

## 相关实体

- [how to build an ai-native startup](../ch05/018-ai-native.html)
- [垂类 ai 创企的自救：flashlabs 从 flashintel 到 ai native](257-ai.html)
- [latest open artifacts (#19): qwen 3.5, glm 5, minimax 2.5 —](https://github.com/QianJinGuo/wiki/blob/main/entities/latest-open-artifacts-19-qwen-35-glm-5-minimax-25-chinese-la.md)
- [perplexity 首次公开了内部 skill 设计指南](../ch07/054-skill.html)
→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/harness-之后-状态边界与失败闭环-若飞.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/data-infrastructure.md)
## 深度分析

Harness 之后：Agent 可靠性的关键，是状态边界和失败闭环 涉及agent领域的核心技术议题。
### 核心观点
1. # Harness 之后：Agent 可靠性的关键，是状态边界和失败闭环
## 太长不看
- Harness Engineering 这轮讨论的价值，是把模型外面的执行环境、工具、上下文、生命周期、可观测、验证和治理，明确看成一个独立系统层（ETCLOVG 七层：Execution / Tooling / Context / Lifecycle / Observability / Verification / Governance）。
2. - 但 Harness 不能只写成组件清单。
3. Agent 真进入工程流程以后，可靠性取决于这些组件能不能形成一套**状态清楚、证据可查、失败可恢复**的运行时闭环。
4. - 长上下文不等于长期状态管理，memory 也不等于治理。
5. 很多失败不是模型不会想，而是系统没有区分候选动作、已验证动作和已提交状态。

### 关联实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch03/004-agent.html)
- [Karpathy Vibe Coding Agentic Engineering](098-karpathy-vibe-coding-agentic-engineering.html)
- [你不知道的 Agent原理架构与工程实践 V2](../ch03/004-agent.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](176-openclaw.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](176-openclaw.html)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](../ch05/057-harness-engineering.html)

---

