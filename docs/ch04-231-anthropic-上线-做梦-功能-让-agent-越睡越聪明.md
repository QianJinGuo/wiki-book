# Anthropic 上线「做梦」功能，让 Agent 越睡越聪明

## Ch04.231 Anthropic 上线「做梦」功能，让 Agent 越睡越聪明

> 📊 Level ⭐⭐ | 10.1KB | `entities/anthropic-dreaming-claude-managed-agents-ovZ5v7jJkqDKSu9xmxwt8w.md`

## 核心功能
### 1. Dreaming（做梦）— 记忆整理
**问题背景：**.md]
Agent 在每次 session 中会往 memory store 写东西，记住自己学到了什么。但时间长了，memory 里会堆满重复条目、过时信息和相互矛盾的记录。.md]
**解决方案：**.md]
Dreaming 是一个在 session 之间运行的异步任务，读取现有的 memory store 和过去的 session 记录（最多 100 个），然后生成一个全新的、整理好的 memory store：.md]

- 重复的合并
- 过时的替换成最新值
- 还能从多个 session 的交叉分析中发现新模式
**关键约束：**.md]

- 处理过程中**不会修改原始数据**。输入的 memory store 保持原样，输出写到一个新的 store 里。不满意可以直接丢掉，不影响原始数据
- 支持 claude-opus-4-7 和 claude-sonnet-4-6 两个模型
- 耗时通常几分钟到几十分钟，按标准 API token 费率计费
- 目前是 research preview，需单独申请访问权限
**官方定位：** memory 让 Agent 在工作中记住学到了什么，dreaming 让 Agent 在工作间隙想明白这些经验意味着什么。一个是即时学习，一个是反思整理。.md]

### 2. Outcomes（成果评估）
**用途：** 把"干完了需要人工检查"这个环节自动化。.md]
**工作流程：**.md]
1. 写一份评分标准（rubric）— 按维度列出什么算合格.md]
2. Agent 干完活后，一个独立的 grader 会对着 rubric 逐项打分.md]
3. Grader 运行在独立的上下文窗口里，不影响原 Agent 上下文.md]
4. Grader 判定某些条目没达标，会把具体差在哪里反馈给 Agent.md]
5. Agent 拿着反馈改，改完再评，直到全部达标或迭代次数用完（默认 3 次，最多 20 次）.md]
**Anthropic 内部测试数据：**.md]

- Outcomes 比标准 prompting loop 的任务成功率高了最多 **10 个百分点**
- 在文件生成任务上：docx 成功率 +8.4%，pptx 成功率 +10.1%
- 越难的任务提升越明显
**Rubric 示例（DCF 模型场景）：**.md]

- 营收预测要用过去 5 年的历史数据
- WACC 计算要标注假设来源
- 敏感性分析必须包含在内
**集成方式：** 配合 Webhooks，定义好 outcome，让 Agent 去干，干完了 webhook 通知你。不用盯着看。.md]

### 3. Multi-Agent（多 Agent 协作）
**架构：**.md]

- Lead agent 把任务拆成几块，分给不同的 specialist agent 并行处理
- 每个 specialist 有自己的模型、prompt 和工具集
- 在自己的 session thread 里工作，上下文互相隔离
- **共享同一个文件系统**：一个 agent 写了文件，另一个 agent 能读到
**可见性：** Claude Console 里的多 Agent session 追踪界面，每个 agent 做了什么一目了然。.md]
**持久化：** 线程是持久的 — lead agent 可以回头找之前调用过的 agent 继续聊，那个 agent 还记得之前做了什么。.md]
**有意的限制：只支持一层委托。** Lead agent 可以调用其他 agent，但被调用的 agent 不能再调用下一层。这是为了防止 agent 链式调用失控。.md]
---.md]

## 真实用户案例
| 公司 | 场景 | 效果 |.md]
|------|------|------|.md]
| **Harvey**（法律科技） | 用 Managed Agents 协调长文法律文书起草。加了 dreaming 之后，Agent 能记住上次 session 里学到的文件格式技巧和工具使用模式 | 完成率涨了约 **6 倍** |.md]
| **Netflix** 平台工程 | 日志分析 agent，处理几百个 build 在不同来源的日志。用 multiagent 并行分析各批日志，只浮出反复出现的问题模式，忽略一次性的噪音 | — |.md]
| **Spiral（by Every）** | 写作工具。模型分层方案：Haiku 当领队接需求，然后把写作任务分给 Opus 的子 agent 干。多稿件并行跑，用 outcomes 对着编辑标准和用户个人风格打分 | 不达标不交 |.md]
| **Wisedocs**（医疗文档） | 用 outcomes 的 rubric 对照内部质检标准审核文档。AI + 人类协作比纯人类审核快了 **50%**，多抓了 **30%** 的错误。但 pipeline 处理速度是 Managed Agents 的 7 倍、成本只有十分之一 | 只把 Managed Agents 用在 QA 审核环节 |.md]
---.md]

## 技术接入
- 官方博客：https://claude.com/blog/new-in-claude-managed-agents
- 开发文档：https://platform.claude.com/docs/en/managed-agents/overview
- 申请访问 Dreaming：https://claude.com/form/claude-managed-agents
---.md]

## 深度分析
### Memory 的本质：增量写入的问题
Dreaming 的设计揭示了一个根本性问题：Agent 的 memory store 是增量写入的，每次 session 都会追加新条目，但从不清理。这种模式导致：.md]

- **重复条目堆积**：相同信息在不同 session 中被多次写入，memory store 膨胀
- **过时信息滞留**：旧的记录不会被自动更新，新旧数据冲突
- **矛盾记录积累**：相互冲突的信息并存，Agent 无法判断哪个更可信
这本质上是数据随时间污染的问题，需要像 Dreaming 这样的异步后处理机制来解决。.md]

### 跨 Session 学习的可能性
Dreaming 读取最多 100 个历史 session，意味着它能发现单次 session 看不到的跨会话模式。Harvey 的案例中，Agent 记住了文件格式技巧和工具使用模式，完成率提升 6 倍 — 这种跨 session 的知识整合价值巨大。.md]

### Outcomes 的本质：把人工验收自动化
Outcomes 的设计非常务实：把"干完了需要人工检查"这个环节自动化。它通过 grader 在独立上下文里评分，把反馈发给 Agent 重新处理，直到达标或迭代次数用完（默认 3 次，最多 20 次）。这种设计模拟了人类工作流程中的"修改-审核-通过"循环，但将人工介入降到最低。.md]

### Multi-Agent 的隔离与共享边界
Multi-Agent 架构中，每个 specialist agent 在自己的 session thread 里工作，上下文互相隔离，但**共享同一个文件系统**。这个设计在隔离性和协作性之间找到了平衡 — 文件系统的共享成为 agent 间通信的隐式通道。.md]

### 一层委托限制的深层原因
只支持一层委托是一个务实的约束，防止 agent 链式调用失控。如果允许无限层嵌套，系统的行为会变得不可预测，调试几乎不可能。这个限制确保了系统的可控性。.md]

### Dreaming vs RAG：主动整理 vs 被动查询
Dreaming 不是 RAG。它不是在查询时从大量文档中检索信息，而是在 session 之间主动整理和压缩 memory store。这是一种**主动的、后验的整理机制**，与 RAG 的实时查询机制有本质区别。.md]
---.md]

## 实践启示
### 何时使用 Dreaming
Dreaming 适合需要跨 session 累积知识的 Agent 场景，特别是处理长周期任务、需要进行经验总结的 Agent。对于一次性任务或短期 Agent，Dreaming 的价值有限。.md]

### Outcomes 的适用场景
Outcomes 适合有明确质量标准的任务，如文档生成、代码编写、报告撰写等。对于质量标准模糊或主观性强的任务，Rubric 设计会变得困难，Outcomes 的效果也会打折扣。.md]

### Multi-Agent 的设计建议
在设计 Multi-Agent 系统时，需要明确 lead agent 和 specialist agent 的职责边界，定义好通信协议和文件共享方式。同时要充分利用一层委托限制来防止系统过于复杂。.md]

### 与现有系统的集成
Dreaming 和 Outcomes 可以独立使用，也可以组合使用。先用 Outcomes 确保单次任务的质量，再用 Dreaming 在 session 之间整理经验，这是一个自然的增量策略。.md]
---.md]

## 关联概念

## 相关实体
- [Anthropic 官方生产级 Agent 最佳实践12 个可复用的 Mcp 设计模式](/ch01-677-anthropic/)
- [Anthropic 12 Mcp Production Patterns](/ch01-677-anthropic/)
- [Anthropic 14 Skill Patterns Best Practices](/ch01-677-anthropic/)
- [Anthropic 官方技能最佳实践14 个可复用的 Agent Skills 设计模式](/ch01-677-anthropic/)
- [Anthropic Multi Agent Research System](/ch01-677-anthropic/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-dreaming-claude-managed-agents-ovZ5v7jJkqDKSu9xmxwt8w.md).md]

- [Harness Engineering 框架](/ch05-041-harness-engineering-概念框架/) — Managed Agents 是 Anthropic 官方 Harness 产品
- MOC

---

