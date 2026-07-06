# Claude Managed Agents

## Ch04.482 Claude Managed Agents

> 📊 Level ⭐⭐ | 5.2KB | `entities/claude-managed-agents.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-managed-agents-official.md)

# New in Claude Managed Agents
Anthropic's official Claude managed agents: persistent sessions, tool use, memory across conversations, enterprise SSO, agent patterns and API details.
**Source**: [raw article](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-managed-agents-official.md) | **Review**: value=8 confidence=9

## 相关实体
- [Claude Managed Agents 官方 Harness 平台指南](ch03/045-agent.md)
- [claude managed agents official](ch04/511-claude-managed-agents-official.md)
- [Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南](ch05/009-harness.md)
- [Anthropic Claude Managed Agents 平台正式发布](ch01/216-0.md)
- [Claude Managed Agents 开发者指南](ch03/045-agent.md)
- [Multica — 开源 Managed Agents 平台](ch07/059-multica-managed-agents.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)
## 深度分析
Claude Managed Agents 的发布标志着 Anthropic 从模型提供商向平台提供商的关键跃迁。2026年5月6日的更新引入三项核心能力：**Dreaming**（自省式记忆优化）、**Outcomes**（基于评分 rubric 的结果导向执行）和**Multi-Agent Orchestration**（多智能体协作编排），三者共同构成了一个完整的 Agent 生命周期管理系统。
**Dreaming 的意义**超出自愈记忆本身——它是一种跨会话的元学习机制。Agent 在会话结束后，系统性地回顾记忆存储、提取模式、重组高价值记忆，使后续会话的起点持续提升。这与人类认知中的"睡眠时记忆巩固"高度类比，区别在于 AI 可以精确追踪每一次工具调用失败的原因并显式改写记忆结构。Harvey 在测试中将完成率提升约 6 倍印证了这一机制的有效性。
**Outcomes 范式**将 AI 执行从"过程导向"转变为"结果导向"。传统的 Agent 循环依赖人类的中间步骤审查，而 Outcomes 引入了独立 Grader——一个在独立上下文中评估输出的模型，不受 Agent 推理过程的影响。这一设计解决了 AI Agent 自我评估时的"确认偏误"问题。Spiral 团队使用 Haiku 作为调度层、Opus 作为写作执行层的架构，表明不同模型可以承担不同认知成本的子任务。
**Multi-Agent Orchestration** 的核心创新在于持久化事件与共享文件系统。每个子 Agent 的中间状态被持久化，Lead Agent 可以在工作流中途重新查询其他 Agent 的状态，而非仅在任务完成后才能聚合结果。Netflix 利用此特性并行分析数百个构建日志、只聚类高价值模式，体现了"并行扫荡 + 智能收敛"的设计哲学。
从商业视角看，Managed Agents 填补了"Anthropic 提供模型、合作伙伴构建 Agent 平台"这一空隙。平台本身托管会话持久化、SSO、Webhook 等企业级基础设施，使合作伙伴可以聚焦垂直场景而非运维。这种定位与 OpenAI 的 Agent SDK、 Google's Vertex AI Agent Builder 形成直接竞争，但 Anthropic 的差异化在于对模型可控性和安全性的强调。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-pm-jess-yan-managed-agents.md)

## 实践启示
1. **在生产 Agent 系统中引入 Dreaming 循环**：对于长生命周期、高频使用的 Agent，定期触发记忆重组可显著提升后续任务成功率。建议设置"每周 dream"计划任务，自动清理低价值记忆片段并强化跨会话学习模式。
2. **用 Outcomes 替代人工审核节点**：对于文档生成、代码编写、报告起草等可量化标准的任务，定义清晰的评分 rubric 并让 Agent 自我迭代直至通过评审，可将人工介入成本降低 50% 以上（Wisedocs 案例印证）。Rubric 应包含具体格式要求、风格一致性和内容覆盖度三维指标。
3. **Multi-Agent 架构中区分调度层与执行层**：Spiral 的 Haiku/Opus 分离模型策略值得借鉴——轻量模型负责任务分发和路由，重量模型负责高质量输出。在预算受限场景下可用 Sonnet 替代 Opus。
4. **利用 Webhook 构建事件驱动 Pipeline**：在定义 Outcomes 后配合 Webhook 通知，可实现"发起任务 → Agent 执行 → 自动评分 → 通知结果"的无人值守闭环，适合夜间批量处理和 CI/CD 集成场景。
5. **企业 SSO 是生产级 Agent 平台的门槛**：Anthropic 将 SSO 作为 Managed Agents 的内置功能，表明企业市场对身份治理的硬性要求。选型时需评估与现有 IdP（Okta、Entra ID）的兼容性。

---

