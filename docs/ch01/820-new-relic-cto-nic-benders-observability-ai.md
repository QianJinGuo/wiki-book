# New Relic CTO Nic Benders：Observability 三大时代演进与 AI 可观测性的双面挑战

## Ch01.820 New Relic CTO Nic Benders：Observability 三大时代演进与 AI 可观测性的双面挑战

> 📊 Level ⭐⭐ | 5.4KB | `entities/new-relic-observability-evolution-ai-nic-benders-infoq-2026-06-30.md`

# New Relic CTO Nic Benders：Observability 三大时代演进与 AI 可观测性的双面挑战

New Relic CTO Nic Benders 在 Software Engineering Daily 播客中深度讨论了 observability 从 instrumentation 到 intelligence 的三大时代演进，以及 AI for observability / observability for AI 的双面挑战。

## Observability 三大时代

Nic Benders 将 observability 的演进划分为三个时代：

1. **Instrumentation 时代**：给更多关键系统做插桩（Ruby、Java、.NET、Python、浏览器、移动端）。但很快数据量大到处理不过来。
2. **Data Platform 时代（2013-2014）**：New Relic 推出 NRDB，核心价值是"你可以问那些你原本不知道该问的问题"——数据先全部收进来，之后再探索。
3. **Intelligence 时代（当前）**：数据太多，多到你甚至不知道该问什么。重点不再是"你能问什么"，而是系统告诉你"你应该问什么"。
4. **Action 时代（未来展望）**：让系统不仅能看，还能直接动手解决问题。

## Dashboards 和 Alerts 的尽头

核心洞察：现在的 dashboards 本质上和 90 年代做的没什么区别——区别只是从 3 个图变成了 300 个图。没有任何一个 dashboard 小到可以让你"看见一切"。以 dashboards 和 alerts 为核心的 observability，已经走到尽头了。

## 统计方法、ML 与 Neural Networks 三层

一个好的 observability 产品应该三者都有：
- **数学和统计**：signal analysis、baseline deviation
- **Machine Learning**：hyperparameters 自动调整告警基准
- **Neural Networks（现在的 AI）**：transformer 架构出现后才真正"好用"

趋势：neural networks 成为"决策层"，但它背后调用的工具应该包括各种 machine learning 和统计能力。

## LLM 在大规模系统理解中的角色

关键方法：不能直接把 petabyte 级数据喂给 LLM——成本高到离谱。先统计方法找 anomaly，再把这些"可疑片段"交给 LLM 判断意义。

需要三样东西：海量数据输入、结构化数据（明白什么指标对应什么系统）、空间和时间上的关联。

## 告警疲劳的解决方案

增加 alert 并不会提升响应能力——它会训练人产生"先等一下，看看它会不会自己恢复"的反应。噪音越多，响应越慢。

三层解决路径：
1. **过滤**：用 intelligence 在通知人之前判断严重性
2. **优化**：分析哪些 alert 总是一起触发、哪些从来不可操作
3. **根本解决**：系统检测到 anomaly 时先自己判断——是否有趣？是否可以自动处理？是否需要人类介入？

未来大部分系统都应该 self-healing。很多今天需要 runbook 的事情最终都会变成"顺带发生"的事情。

## Observability for AI

AI 系统是非确定性的（non-deterministic），AI 系统的 golden signals 与传统 web 系统不同：

- token 使用量、成本
- response 质量
- 用户情绪（sentiment）
- 评估"答案是否正确"

**核心比喻**：创建了一个由一群不太靠谱的员工组成的"虚拟呼叫中心"。需要一个"主管"在走廊里来回巡视，确保这些 AI Agents 没在胡说八道。评估答案的质量，就是 AI 时代不同于数据库或云基础设施的新信号。

工具厂商必须提供"默认判断"（opinionated guidance）——不能只是说"你想监控什么都可以"。

## 对新人开发者的建议

1. 用新工具（如 Claude Code）真正构建软件，但不要把它们当成黑盒——当成"可以解释的老师"。
2. 写作时不让 AI 帮你写内容，但让 AI 帮你"读"文章，问它"作为读者，你觉得哪里没讲清楚？"
3. 新一代开发者会从更高的起点出发，去到我们甚至想象不到的地方。

## 相关实体

- [Agent Harness 可观测性：生产级 AI 项目必须补上的一课](../ch05/039-agent-harness.html)
- [Agentic Incident Triage Assistant with Amazon Quick, New Relic MCP Server, and Asana](../ch11/213-amazon-quick.html)
- [让 Coding Agent 从黑盒到透明：阿里云 Agent 观测审计数据采集实践](../ch09/048-coding-agent.html)
- [AI 系统可观测性](https://github.com/QianJinGuo/wiki/blob/main/concepts/observability-monitoring-ai.md)

---

