# Ask anything about your application — Seer Agent answers | Sentry

## Ch04.552 Ask anything about your application — Seer Agent answers | Sentry

> 📊 Level ⭐⭐ | 3.5KB | `entities/seer-agent-workshop.md`

## 深度分析

Sentry 的 Seer Agent 代表了**AI 原生可观测性**的重大跃迁：不是将 LLM 作为聊天界面叠加在现有监控工具之上，而是将自然语言查询直接嵌入遥测数据的语义层。Paul Jaffre 在这个 workshop 中展示的核心场景——用自然语言提问"端到端用户感知延迟是多少"并获得精确答案——意味着开发者无需理解 Sentry 的查询语法或 MetricsQL，直接用业务语言就能驱动调试流程 。 See also [Harness Engineering](ch05/061-harness-engineering.md)

Seer Agent 的三个学习目标揭示了 AI 在可观测性领域的三个层次：**行为询问**（"告诉我应用的行為模式"）、**事故调查**（"为什么这个错误率突然升高，哪些功能受影响"）和**隐性问题发现**（"为什么用户有时看到空白设置页"）。这三个层次对应了监控->可观测性->主动发现的技术演进路径，说明 Seer Agent 不仅是一个问答工具，而是一个具备一定推理能力的监控代理 。

从 Sentry 平台整体战略看，Seer Agent 与 Autofix、AI Code Review 共同构成了 Sentry 的 AI 产品矩阵，覆盖了从发现（Monitor）到修复（Fix）的完整闭环。Sentry 近期发布的 Blog 文章"Debugging multi-agent AI when the failure is in the space between agents"进一步表明，Sentry 正在将 AI 可观测性能力延伸至 Agent 间协作问题的诊断，这是一个值得关注的新方向 。

在技术实现层面，Sentry 通过 MCP（Model Context Protocol）连接 Sentry CLI 和 MCP 服务器，实现与外部工具的标准化集成。这一选择与 Claude Code、Codex 等主流 Agent 平台对 MCP 的支持保持一致，表明 MCP 作为 Agent 与外部工具通信的开放协议正在获得广泛采用 。

## 实践启示

- **用自然语言驱动 Sentry 调试工作流**：在日常开发中尝试用业务语言（如"哪个页面的加载最慢"或"最近有哪些 API 错误"）替代结构化查询，可显著降低排查问题的认知门槛，特别适合不熟悉 Sentry 查询语法的新团队成员 。

- **利用 Seer Agent 做事故前的主动健康检查**：在发布新功能前，向 Seer Agent 询问"有哪些潜在的性能回归风险"或"近期错误率是否有异常趋势"，将被动监控转化为主动防御，提前发现隐蔽问题 。

- **结合 Seer Agent 与 Sentry 的 AI Code Review**：当 Seer Agent 识别出特定代码路径是问题根源时，直接在同一次会话中触发 AI Code Review 对该文件进行分析，实现从"发现问题"到"定位根因"再到"生成修复建议"的单流工作体验 。

- **关注 Sentry 的多 Agent 协作可观测性能力**：随着 AI Agent 系统复杂度提升，Agent 间的通信故障和状态不一致问题将成为新的挑战，Sentry 在这一领域的提前布局值得关注，相关问题可参考其 Blog 文章进行预防性监控设计 。

- **使用 Sentry MCP 实现与现有工具链的集成**：通过 MCP 协议将 Sentry 遥测数据接入 Claude Code 或 Codex 等主流 Agent 平台，在代码编辑环境中直接进行自然语言驱动的调试，形成"编码-监控-调试"一体化工作流 。

---

