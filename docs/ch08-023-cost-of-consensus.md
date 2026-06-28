## Ch08.023 Cost of Consensus

> 📊 Level ⭐⭐⭐ | 3.5KB | `entities/cost-of-consensus.md`

## 核心发现
- 2.1-3.4x token 开销用于 Agent 间共识
- 共识成本是多 Agent 的主要开销来源

## 深度分析
Cost of Consensus 研究揭示了多 Agent 系统中一个关键但常被忽视的开销维度：**各 Agent 就任务结果达成共识所消耗的 token 成本，往往超过实际任务执行本身的成本**。2.1-3.4x 的共识开销系数意味着，在设计多 Agent 系统时，通信和协调成本必须被作为一等公民来对待。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
**为什么共识如此昂贵**：多 Agent 共识的本质是"让多个 Agent 对同一个结论形成一致置信"。在缺乏全局真的情况下，每个 Agent 需要：(1) 理解其他 Agent 的推理过程；(2) 评估对方论点的有效性；(3) 调整自己的置信度或提出反驳。这需要大量的上下文传递和推理 token 消耗，远超单 Agent 独立决策的开销。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
**这一发现在工程上的重量级**：如果共识开销是主要成本来源，那么多 Agent 系统的吞吐量瓶颈不在计算能力，而在 Agent 间的通信效率。优化方向应该指向：减少不必要的共识需求（Owner-Worker-Verifier 架构中 Verifier 只验证不参与讨论）、压缩共识消息的体积、减少共识轮次。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
**与单 Agent 相比的战略含义**：在任务可以由单个 Agent 完成的情况下，引入多 Agent 共识往往会增加总成本而非减少。只有在以下场景多 Agent 共识才是合理的：(1) 任务需要多专业视角（如安全审查 + 性能审查 + 业务逻辑审查并行）；(2) 单 Agent 的置信度不足以支撑高风险决策；(3) 需要冗余和交叉验证来满足审计要求。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]

## 实践启示
1. **在系统设计阶段就把共识成本纳入评估**：比较"单 Agent 完成"vs"多 Agent 共识"的实际 token 成本，不要假设多 Agent 一定更优或更可靠。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
2. **最小化共识范围**：只在关键决策点引入共识机制，非关键路径用单 Agent 决策。Owner-Worker-Verifier 模式中，Verifier 只做验证不参与讨论，可以显著降低共识开销。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
3. **用结构化输出减少歧义**：当必须进行跨 Agent 通信时，使用严格定义的输出格式（JSON schema、状态机事件）而非自然语言，减少因歧义导致的反复确认。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
4. **考虑异步共识而非同步轮询**：多 Agent 间的同步等待是成本最高的模式之一，改用事件驱动/消息队列的异步确认机制，可以在保持一致性的同时大幅降低空转开销。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
5. **在需要高置信度的关键路径上使用多 Agent 共识**：涉及资金、身份、安全、高风险决策的环节，2.1-3.4x 的共识开销可能是值得支付的保险成本。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]

## 参考
- Minimax Agent Team Mavis

## 相关实体

- MOC

---
