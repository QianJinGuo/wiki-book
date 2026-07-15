# Claude Managed Agents Official

## Ch04.559 Claude Managed Agents Official

> 📊 Level ⭐⭐ | 4.1KB | `entities/claude-managed-agents-official.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-managed-agents-official.md)

# Claude Managed Agents 官方平台发布
Anthropic Claude Managed Agents 官方平台发布，Harness 架构 + 企业级安全 + 多智能体编排

## 摘要
[](https://claude.com) * [Claude](/product/overview)

## 深度分析
Claude Managed Agents 官方发布的三大核心能力——dreaming、outcomes、multiagent orchestration——构成了一个完整的企业级 Agent 开发平台，分别解决记忆巩固、质量保证和任务编排三大问题。
**Dreaming（自改进机制）**：这是最有战略意义的能力。Dreaming 在后台定期回顾 Agent 会话和记忆存储，提取模式（recurring mistakes、converged workflows、shared preferences），主动优化记忆结构。关键设计：用户可选择完全自动更新或人工审核后生效，既保证了进化能力又防止记忆污染。Harvey 在测试中通过 Dreaming 实现 completion rates 提升约 6 倍，验证了跨会话学习对复杂法律工作的实际价值。
**Outcomes（质量Rubric）**：通过独立的 grader 在独立 context window 中评估输出质量，避免 grader 被 Agent 推理过程影响。实测任务成功率提升最高 10 个点，docx 生成质量 +8.4%，pptx +10.1%。这个机制解决了"AI 输出质量难以量化控制"的核心痛点。
**Multiagent Orchestration（多智能体编排）**：lead agent 分解任务并委托给专业子 agent（各自独立模型、prompt、工具），子 agent 并行工作于共享文件系统，结果汇聚到 lead agent 上下文。Netflix 平台团队用这个能力并行分析数百个构建的日志，只聚合跨应用的高价值模式。

## 实践启示
- **从 memory 到 dreaming 是关键跃迁**：如果团队已经在用 Managed Agents，第一优先级应该是接入 dreaming 能力——它让 Agent 从"每次会话独立"变为"持续自我改进"，这是能力边界的质变
- ** Outcomes 适用于可量化质量的场景**：结构化框架、演示标准、文件格式规范、品牌调性等可定义"好"标准的任务，特别适合 outcomes 机制；高度主观或创意类任务仍需人工审核
- **Multiagent 选型判断**：当单 Agent 因上下文限制无法高效处理时（如任务涉及多个不相关领域、需要并行独立调查），才需要引入多 agent 编排；不要为了用而用
- **Webhook 触发的工作流**：定义 outcome → Agent 自动运行 → Webhook 通知完成，这个模式适合需要长时间运行的批处理任务（如报告生成、数据分析），用户无需持续在线

## 原文存档
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-managed-agents-official.md)

## 相关资源
- [Agent Memory 架构](ch04/404-perplexity-brain-self-improving-agent-memory-architecture.html)
- [Claude Managed Agents 开发者指南](ch04/668-claude-managed-agents.html)

## 相关实体
- [Claude Managed Agents 官方 Harness 平台指南](../ch01/267-anthropic-claude-managed-agents.html)
- [Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南](ch04/668-claude-managed-agents.html)
- [Anthropic Claude Managed Agents 平台正式发布](../ch01/267-anthropic-claude-managed-agents.html)
- [claude managed agents](ch04/668-claude-managed-agents.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/05-11-the-great-memory-panic-of-2026.md)

- [从 Prompt 到 Harness：最小实操指南](../ch05/099-harness.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)

---

