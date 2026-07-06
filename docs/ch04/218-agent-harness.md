# Agent Harness 架构

## Ch04.218 Agent Harness 架构

> 📊 Level ⭐⭐ | 10.8KB | `entities/agent-harness-architecture.md`

## 7 层架构
| 层级 | 核心职责 | 关键设计 |
|------|---------|---------|
| **L1 执行引擎** | 双循环稳定性 | 快执行循环 + 慢思考循环（每3步/出错触发），成功率 60%→90%+ |
| **L2 工具系统** | 安全可控 | 五级风险分级（L0-L4）+ 路径安全 + MCP 生态 |
| **L3 上下文** | 成本控制 | 阶梯压缩降 52% Token + 会话隔离 |
| **L4 记忆系统** | 知识准确 | 三层记忆架构 + 知识编译（幻觉率 30%→5%）|
| **L5 决策引擎** | 自主运行 | 愿景→目标→任务→动作 四层目标分解 |
| **L6 多 Agent** | 协作 | 任务分配 + 共识 + 冲突解决 |
| **L7 行业应用** | 业务落地 | 医疗/法律/金融/研发 |

## 核心设计原则
- **Harness = 底盘 + 刹车 + 仪表盘 + 安全带**：框架给工具，Harness 给系统级保障
- **稳定压倒一切**：断点续跑、多模型容灾、五级风险分级
- **成本意识**：上下文压缩 52%、简单任务用便宜模型
- **知识编译**：写入时做对，读取时直接用，而非让大模型总结

## 工具系统设计
- **L0**：只读操作，自动执行
- **L1**：新文件写入，自动执行 + 日志
- **L2**：修改已有文件，Diff 预览 + 10 秒自动执行
- **L3**：删除/系统命令，必须人工审批
- **L4**：格式化/高危命令，直接拦截

## 深度分析
**架构演进逻辑：从工具箱到操作系统**
Agent Harness 的 7 层架构体现了从「单点工具调用」向「系统级保障」的范式转变。传统框架（如 LangChain）聚焦于「给 Agent 提供工具」，而 Harness 强调「给 Agent 提供运行环境」——这类似于从「给汽车提供零件」到「提供整车底盘+安全系统」的区别。L1 执行引擎的双循环设计是核心，它将快速执行（响应速度）与慢速复盘（质量保障）分离，避免了单循环模式下「为快失准」的问题。
**稳定性设计的工程价值**
断点续跑机制是生产级系统的分水岭。在复杂长程任务中，网络波动、模型超时、外部 API 不可用等问题不可避免。没有断点续跑，Agent 从头重来的成本极高；有了断点续跑，任务可以在任意稳定点恢复。这将「任务完成率」从「尽力而为」提升到「可承诺」。多模型容灾层进一步保障了单一模型故障不影响整体系统可用性，成本降 50% 的数字背后是「用便宜模型处理简单任务，昂贵模型处理复杂任务」的精细化成本管理。
**工具系统的风险分级哲学**
五级风险分级（L0-L4）将「人工介入」从全局要求降级为按需触发。L0 只读操作完全自动化，L4 高危命令直接拦截，中间层级提供渐进式安全保障。这种设计的精妙之处在于：它不追求「零风险」，而是追求「风险可见且可控」。每个操作的风险等级由系统判定而非人工判断，审批节点仅在必要时触发，这解决了完全人工审批带来的效率瓶颈问题。
**记忆系统的知识编译范式**
传统 RAG 的问题是「读取时让大模型总结」——这意味着每次检索都依赖模型的推理能力，且推理质量不稳定。知识编译范式反其道而行：在写入时完成知识的结构化和 QA 化，读取时直接获取准确答案。幻觉率从 30% 降至 5%，准确率 95%+ 的代价是在写入阶段投入更高成本，但读取阶段的延迟和成本都大幅降低。这是典型的「写入时花功夫，读取时享便利」的设计理念。

## 实践启示
**1. 从单层尝试逐步构建**
不要试图一次性实现完整 7 层架构。建议从 L1 执行引擎 + L2 工具系统开始，验证双循环稳定性后再逐步引入上下文工程和记忆系统。每一层的复杂度都需要工程团队有相应的运维能力。
**2. 工具风险分级需要结合业务场景定制**
五级分级是通用框架，具体阈值（如 L3 审批的触发条件）需要根据业务风险承受能力调整。医疗场景的 L3 可能对应法律场景的 L2。风险分级表应该作为配置项而非硬编码。
**3. 上下文压缩策略应成为成本控制核心**
52% Token 降低不是一次性优化，而是持续的成本管理实践。建议在 L3 上下文工程层建立压缩效果的监控面板，追踪每日的 Token 消耗趋势，识别异常的上下文膨胀。
**4. 知识编译需要提前投入**
知识编译的收益在读取侧，但成本在写入侧。如果业务场景中读取频率远高于写入频率（如客服、知识库查询），知识编译的 ROI 极高。但如果写入频率也很高，需要评估维护知识库的成本是否超过收益。
**5. 多模型容灾的路由规则需要持续优化**
20+ 路由规则不是一次性配置，而是随着业务运行持续调优的系统。建议建立模型表现的历史数据库，定期分析「哪些任务类型适合哪个模型」，让路由规则从经验积累中迭代进化。
**6. 多 Agent 协作优先解决冲突检测**
L6 多 Agent 层最难的不是任务分配，而是冲突解决。建议在初期就建立冲突检测机制——当多个 Agent 对同一资源或同一决策有不同意见时，系统能够记录冲突并触发人工审核或规则仲裁。

## 参见
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agent-harness-architecture-design-production-guide.md)
- [Harness Engineering](ch05/091-harness-engineering.md)（Harness 工程方法论）

## 相关实体
- [Agent架构关键变化：Harness正在成为新后端](ch05/085-harness.md)
- [Agent Harness 组件解析](ch04/069-ai.md)
- [Harness Engineering - 让 Coding Agent 可靠完成长程任务](ch05/085-harness.md)
- [Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南](ch05/085-harness.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch03/075-claude-code.md)
- [Agent Harness 12 组件与 7 个关键决策](ch05/085-harness.md)
- [Agent架构关键变化：Harness正在成为新后端](ch05/085-harness.md)
- [你不知道的 Agent 原理架构与工程实践](ch04/317-agent-principle-architecture-engineering-practice.md)
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Thin Harness Fat Skills](ch04/258-skill.md)
- [Design Patterns for AI Agents 2026](ch04/069-ai.md)
- [Martin Fowler AI 研发 Harness：非确定性承重层](ch04/069-ai.md)
- [Harness Engineering：让 Coding Agent 可靠完成长程任务](ch05/085-harness.md)
- [Harness Engineering: 让 Coding Agent 可靠完成长程任务](ch09/047-coding-agent.md)
- [Agent 与后端统一架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-backend-unification.md)
- [从多智能体编排到AI自主决策：资损防控体系的架构演进](ch04/069-ai.md)
- [AI Native 时代 —— 研发组织何去何从](ch04/069-ai.md)
- [长周期 Agent 详解：从 Ralph Loop 到可接管 Harness](ch05/085-harness.md)
- [Harness Design Peer Review Framework](https://github.com/QianJinGuo/wiki/blob/main/queries/harness-peer-review-framework.md)
- [Agent Memory 架构解析](ch03/045-agent.md)
- [From Agent Protocol to Harness Skill](ch04/383-from-agent-protocol-to-harness-skill.md)
- [Agent Harness 解析：智能体架构深度拆解](ch05/085-harness.md)
- [Claude Code 源码拆解：从启动到多 Agent 扩展层](ch03/075-claude-code.md)
- [Agent Memory System 设计指南](https://github.com/QianJinGuo/wiki/blob/main/queries/agent-memory-system-design.md)
- [两万字详解Claude Code源码核心机制](ch03/075-claude-code.md)
- [Agent 自我改进的六条路](ch03/045-agent.md)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](ch04/134-karpathy-vibe-coding-agentic-engineering.md)
- [深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践](ch05/085-harness.md)
- [基于多智能体架构的深度思考交易系统](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统.md)
- [Claude Code 设计原则与对照分析](ch03/075-claude-code.md)
- [Claude Code 源码核心机制详解](ch03/075-claude-code.md)
- [Agent Memory 系统性框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-systematic-framework.md)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](ch03/045-agent.md)
- [Harness如何支撑Agent在生产环境稳定运行？](ch05/085-harness.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agent-harness-architecture-deep-dive-aksahy.md)

- [Code as Agent Harness 综述](ch09/051-code-as-agent-harness.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-engineering-guide.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/loop-engineering.md)

---

