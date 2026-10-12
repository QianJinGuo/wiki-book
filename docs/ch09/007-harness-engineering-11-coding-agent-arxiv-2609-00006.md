# Harness Engineering 源码研究：11 个 Coding Agent 的解剖（arXiv:2609.00006）

> 📊 Level ⭐ | 4.0KB

## Harness Engineering 源码研究：11 个 Coding Agent 解剖

2026-07-15 上 arXiv 的 83 页论文《Harness Engineering: Anatomy, Architecture, and Evolution of Coding Agents》（arXiv:2609.00006）：作者**逐行分析了 11 个 Coding Agent 的源码**——Claude Code、Codex CLI、Gemini CLI、Mistral Vibe、OpenHands、Aider、Mini-SWE-Agent、Hermes、Pi、OpenCode、OpenClaw，以 Omnigent 为 meta-harness 对照，产出 13 条横向观察、29 个复用模式、18 条设计建议和一个约 90 行的最小 Harness 骨架。研究边界：对 Claude Code 的分析来自 2026 年 3 月源码快照，非当前闭源实现的完整审计。

## 七个责任边界

论文把 Harness 拆成七块，强调它们**不是功能菜单而是运行时的责任边界**：Agent 循环（下一步怎么推进、何时停）/ 模型接入（协议、流式、缓存、错误）/ 工具与动作（读写执行、结果回传）/ 记忆与上下文（本轮看什么、历史怎么压、什么跨会话留存）/ 安全与权限（动作准入、执行环境边界）/ 编排（子 Agent 分工与汇总）/ 扩展（Skills、MCP、Hooks、插件、客户端协议）。

七块接成的运行链路：**Goal → Context → Decide → Act → Observe → Verify → State → Next**。Planner、MCP、Memory、Reflection 只有放进这条链里边界才清楚，否则"每个词都懂，系统还是跑不稳"。

## 循环很短，责任在循环外面

最小循环（组装输入→调模型→执行工具→返回观察→再调模型）本身不神秘，差异在循环外：状态、并发、取消、恢复和验证的处理方式：
- **Mini-SWE-Agent**：线性循环 + 一个 shell 工具，最小骨架（研究取向）。
- **OpenHands**：执行过程写成持久事件日志，围绕会话/分支/回放组织状态；工具调用按资源加锁——两个读操作未必互斥，写同一文件的要排队。
- **Claude Code**：按工具是否适合并发分批，读取和搜索可并行（源码快照节选）。

## 方法论定位：源码研究不是排行榜

论文不是同一模型/同一任务/同一环境下的性能对照实验，引用的基准成绩模型、日期、环境各异，不能排座次。合适的读法是看**每个系统在替模型承担什么责任**——Agent 之间的很多差异已经落在模型之外的 Harness 上。这与本库 [Agent Harness Engineering: A Survey](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-2026.md)（CMU/Amazon 系，2026-05）是**两篇不同的综述**：前者是学术框架综述，本篇是源码级逐系统解剖，且时间晚两个月、覆盖了 Claude Code 快照。

## 相关实体

- [Agent Harness Engineering Survey](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-2026.md)
- [Agent Harness 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture.md)——若飞同作者更早的运行链拆解（7 层视角），本篇是论文转述版
- [微软 M⋆ + 谷歌 AutoHarness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/two-harness-papers-microsoft-google.md)
- [Harness 7 层框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1anu.md)

→ [原文存档](https://mp.weixin.qq.com/s/HK1qFKZTsMzMg_c6YIn-jw)

---

