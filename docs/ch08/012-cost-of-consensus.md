# Cost of Consensus

> 📊 Level ⭐⭐⭐ | 7.4KB

## 摘要
Cost of Consensus 是 MiniMax Agent Team（Mavis）在其架构分享中引用的研究：在特定模型与同质 debate 设置下，多 Agent 达成共识的 token 消耗可达单 Agent 自我修正的 **2.1–3.4 倍**，且准确率并未提升甚至更差。这一结论指向一个反直觉的设计原则：多 Agent 不是默认选项，共识是系统的主要成本驱动，必须用架构手段（而非 prompt 堆砌）来约束它。

## 核心要点
- **共识开销系数 2.1–3.4x**：同质 debate 场景下，多 Agent 的 token 消耗显著超过单 Agent 自我修正，且没有换来准确率收益。
- **没有结构、没有验证、没有停止条件的多 Agent 不成立**：Mavis 的结论是"多 Agent 需要纪律"，而不是"多 Agent 一定浪费"。
- **Verifier 只验证、不参与讨论**：Owner-Worker-Verifier 三角色中，Verifier 与 Worker 是对抗关系，通过减少"全员讨论"来压缩共识范围。
- **三类额外成本**：交接成本（信息重组）、共享成本（每轮重复付费）、聚合成本（合并十份结果最难，没有捷径）。
- **Verifier 自身也有三笔成本**：验证本身、重试成本（必须要有退出机制）、人类决策成本（高风险动作必须人签字）。
- **共识的适用边界**：多专业视角审查、单 Agent 低置信度的高风险决策、审计与冗余要求——这些场景才值得支付共识溢价。

## 深度分析
### 共识为什么贵：从"达成一致"到"形成相互制衡"
共识成本的本质不是多问几个 Agent 那么简单。同质 debate 中，每个 Agent 都基于近似相同的上下文与推理路径产生输出，它们的"讨论"往往是同一误差的循环确认，token 开销翻倍而信息增量趋近于零——这正是 2.1–3.4x 开销却无准确率提升的机理。Mavis 的应对不是取消多 Agent，而是把"共识"从自由讨论改造成**对抗式验证**：Worker 停止的条件是 Verifier 启动的原因，Verifier 停止的条件是尽可能发现问题，发现的问题又成为 Worker 重启的原因。三者之间是相互制衡的闭环，而不是互相说服的圆桌。

### 成本的三个放大点：交接、共享与聚合
即使架构正确，多 Agent 仍有三个天然的成本放大器。**交接成本**：Agent 之间传递信息需要重新组织，研究 Agent 收回的几十个网页，写作 Agent 根本用不了，解法是让 Agent 之间通过结构化文件和摘要通信，而非把全部上下文塞进一个 prompt。**共享成本**：每多共享一段内容，每个 Agent 每一轮都要为它付一次 token，解法是按需加载——每个 Agent 只看到与自己任务相关的摘要，需要细节时再读全文。**聚合成本**：派十个 Agent 并行查资料容易，但把十份结果合成一份事实一致、引用准确、风格统一的交付物极难，这一步没有捷径，Owner 必须投入真实的合并精力。这三者共同决定了：多 Agent 的吞吐量瓶颈不在算力，而在通信与协调效率。

### 架构约束取代 prompt 劝说：状态机与上下文隔离
Mavis 把三个关键架构差异当作控制共识成本的手段。一是**对抗式验证**：验证不是可选附加步骤，而是架构核心，类似研发与质量部门的关系。二是**状态机管理**：什么时候验证、什么时候重试、什么时候停止，都是引擎层面的硬性约束，而不是模型自由判断——这直接限制了共识讨论的轮次上限。三是**隔离上下文**：受 Harness 思想启发，每个环节的上下文相互隔离，而不是所有 Agent 共享一个不断膨胀的对话历史，这从源头压缩了共享成本。Prompt/Skill 编排只是"发工作手册"，Team Engine 才是让这些约束成立的活系统。

### 什么时候共识值得买：成本收益的边界条件
Cost of Consensus 的结论不能外推为"所有多 Agent 都是浪费"。判断标准取决于任务属性：任务越复杂、链路越长、风险越高、经验越可复用，越值得上 Team；任务越短、越低风险、越确定，单 Agent 甚至脚本就够了。具体到共识本身，值得支付的场景包括：需要多专业视角并行审查（安全 + 性能 + 业务逻辑）、单 Agent 置信度不足以支撑高风险决策、以及需要冗余和交叉验证满足审计要求。Mavis 同时强调"能做 ≠ 能交付"——文档场景中 Planner/Writer/Formatter/Tool Agent/Evaluator 的流水线之所以成立，是因为每个环节有独立的验收标准，这正是共识成本换来的质量保障。

## 实践启示
1. **在系统设计阶段就把共识成本纳入评估**：比较"单 Agent 完成"与"多 Agent 共识"的实际 token 成本，不要默认多 Agent 更可靠；同质模型间的 debate 尤其容易陷入"开销翻倍、收益为零"。
2. **最小化共识范围**：只在关键决策点引入共识，非关键路径用单 Agent；采用 Owner-Worker-Verifier 模式时，让 Verifier 只做验证、不参与自由讨论，可显著压缩共识开销。
3. **用结构化输出减少歧义**：跨 Agent 通信时使用严格定义的格式（JSON schema、状态机事件、结构化文件与摘要）而非自然语言，减少因歧义引发的反复确认轮次。
4. **为验证环节设计退出机制**：认真验证就要花时间和 token，但必须设置重试上限与停止条件，否则"越跑越贵"；走过场的验证不如不设。
5. **把人类决策成本显式入账**：高风险动作（如合并代码、资金操作）不能让 Agent 拍板，Agent 交付的不只是结果，还要留下完整过程记录，让人能判断和接管。
6. **聚合步骤预留真实投入**：并行派发很容易，合并很难；Owner 要在事实一致性、引用准确性与风格统一上花真实精力，聚合是共识流水线中最容易被低估的一环。

## 相关实体
- [MiniMax Agent Team（Mavis）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/minimax-agent-team-mavis.md) — 本研究的出处与架构上下文
- [多智能体系统](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-systems.md) — 共识成本所在的研究领域
- 多智能体编排 — 编排层是控制共识轮次的约束点
- [多智能体协作模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-collaboration-patterns.md) — debate 与对抗式验证的对比
- [多智能体上下文隔离](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-context-isolation.md) — 压缩共享成本的核心手段
- [Verifier 驱动开发](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-driven-development.md) — 对抗式验证理念的延伸实践
- [Orchestrator-Worker 架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/orchestrator-worker-architecture.md) — Owner-Worker-Verifier 的近亲模式
- [多智能体协调 MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/multi-agent-coordination.md) — 相关主题导航

→ [原文存档](https://mp.weixin.qq.com/s/TIL7o92f71DsPPLWT4_37A)

---

