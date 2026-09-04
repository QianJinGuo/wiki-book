# Introducing Seer Agent: The answer is already in Sentry. Now you can ask for it.

> 📊 Level ⭐⭐ | 7.3KB | `entities/introducing-seer-agent-the-answer-is-already-in-sentry-now-you-can-ask-for-it.md`

# Introducing Seer Agent: The answer is already in Sentry. Now you can ask for it.

→ [原文存档](https://blog.sentry.io/introducing-seer-agent/)

## 摘要

Sentry 于 2026 年 4 月向所有用户开放 Seer Agent 测试版：开发者可在 Sentry 任意页面按 `Cmd + /`、或在 Slack 中 @ 提及它，用自然语言提问，由 Agent 基于 Sentry 已积累的全部遥测数据给出答案。其核心论断是"答案已经在 Sentry 里，只是过去没人能问"——Seer Agent 把调试的起点从"定位问题"前移为"描述症状"，让工程师直接向数据提问。

## 核心要点

- **开放测试**：面向所有 Sentry 用户，入口为页面内 `Cmd + /`（或 "Ask Seer" 按钮）与 Slack @ 提及
- **产品定位**：负责"导航到调试现场"——当问题不来自某个明确 Issue 时，替工程师完成跨 trace、logs、region、服务的数据遍历
- **遥测即图**：Sentry 的 trace-connected 数据在 ingest 时即构成图，Agent 直接沿图遍历，而非像通用 LLM 搜索那样猜测时间范围
- **实战验证**：Sentry AI 负责人 Indragie 用它数秒定位 Seer 自身故障——gemini-2.5-flash-lite 在欧洲特定区域被 Vertex AI 限流，根因是上游基础设施故障
- **典型场景**：根因在上游的故障、不触发告警的缓慢劣化（p99 尾延迟）、跨服务传播的故障
- **Slack 多人模式**：频道内任何人可中途重定向、补充上下文或旁观学习；调查线程事故后保留，可检索复用
- **Autofix 联动**：告警新增 "Fix with Seer" 按钮，可从 Slack 直接触发完整 Autofix 工作流
- **路线图**：incident 创建即自动侦查、主动建议下一步问题、消息排队与强制中断

## 深度分析

### 调试范式转移：从"调查者"到"提问者"

Seer 的原始设计始于一个具体 Issue：栈追踪、trace、日志、replay、提交历史与代码都已与它关联，调查有明确起点。但大量调试并不始于错误——错误信息没有帮助、真正故障在上游、或只是"感觉变慢了"。传统流程中，工程师要先完成大量导航动作（打开 trace explorer、按环境过滤、按 region 分组、切到 logs、检查上游服务错误率），文章直言："你还没有在调试，你只是在赶往调试发生的地方。" Seer Agent 把这整段导航内化为 Agent 的图遍历，工程师的角色从"调查者"变为"提问者"，瓶颈从"该往哪里看"转移到"发现之后该怎么办"。

### 遥测即图：与"带搜索工具的 LLM"的本质区别

Sentry 的 Explore 产品已允许查询遥测，但前提是你必须先知道数据的形状——"Explore 奖励已经持有地图的操作者"。Seer Agent 不同：错误发生时，Sentry 在 ingest 阶段就把 trace、span、span 内日志、当时的部署与提交连接成图；Agent 直接沿这些连接行走，问一个错误时能精确拉取产生它的 trace、span、日志与源码行，全程不需要一条 `WHERE timestamp BETWEEN` 子句，还能反向遍历——哪些其他服务参与了触及该端点的 trace，同一时刻哪些服务不健康、错误率如何。Indragie 的案例中，四次手工 pivot 被压缩为一次遍历：Agent 拿到 Issue 后自动识别失败调用被路由到的区域，与同一 provider 下其他模型的调用交叉比对，发现特定模型族在特定区域失败而其他模型正常，从而暴露上游模式。

### 三类"难问题"与瓶颈转移

文章明确了 Seer Agent 最擅长的三类问题：**根因在上游**——栈追踪止步于自己的调用点，真实原因是别家数据中心的 429，Agent 在打开新标签页前就把流量与请求形状（provider、model、region、time）关联起来；**不触发干净告警**——单端点缓慢劣化、两小时前开始的 1% 错误率、只在 p99 可见的尾延迟，Agent 拉取基线做统计比对，判断"你注意到的东西"是真实信号还是噪声；**跨服务蔓延**——A 服务报错但根因是 B 服务十分钟前开始返回畸形响应，trace-connected 图是唯一能干净呈现它的方式，而人类手工走图两跳就会丢失上下文，Agent 不会。其共同效果是让工程师把时间花在"对发现采取行动"而非"找到发现"。

### 调试的社交化：Slack 多人模式与知识沉淀

在 Sentry UI 中 Seer Agent 是单人工具；在 Slack 中调查变成多人协作——频道里任何人都可以在中途重定向它、补充 Agent 缺失的上下文，或只是旁观遍历过程来学习系统。更重要的是调查线程在事故解决后依然保留：下个月同样的模式再次出现时，团队可以直接检索而非从头再来。这使 Seer Agent 从"监控工具"向"组织知识库"演进，资深工程师的排查路径被隐式编码为可复用的调查记录。路线图上的 auto-triage（incident 创建即自动开调查并把发现回帖）、主动跟进建议、消息排队与强制中断，则进一步把 Agent 塑造为值班团队中的一等公民。

## 实践启示

1. **开发者**：遇到"说不清哪里出了问题"的排查时，先向 Seer Agent 用自然语言描述症状（而非先写查询），再与手工排查结果对照——这是校准"何时该信任 Agent"的最快路径
2. **工程团队**：把 Slack 中的 Seer Agent 调查线程当作可检索的故障知识库运营，事故复盘时回看 Agent 的遍历路径，可显著降低同类问题复发时的重建成本
3. **可观测性产品团队**：Seer Agent 证明"把 LLM 接进已有数据图"远比"给监控工具加聊天界面"更有价值——ingest 阶段的数据建模（trace-connected 图）比 prompt 工程更决定 Agent 上限
4. **AI 应用开发者**：构建 AI Debugging 产品的关键挑战不在模型推理能力，而在把遥测建模为可遍历的图、让 Agent 做多跳推理，而不是靠文本检索碰运气
5. **SRE / 值班团队**：关注其对"不干净告警"（p99 劣化、低比例错误率）的基线比对能力，这类问题正是传统告警阈值体系的盲区
6. **平台选型者**：留意 Seer 产品矩阵（Agent / Autofix / AI Code Review）从"发现问题"到"修复问题"的闭环，以及 MCP 集成带来的工具链扩展空间

## 相关实体

- [Seer Agent Workshop](../ch03/004-agent.html)
- [Introducing The Ettin Reranker Family](303-introducing-the-ettin-reranker-family.html)
- [Ai Phishing Attacks Are On The Rise Are You Prepared Bitward](../ch12/088-ai-phishing-attacks-are-on-the-rise-are-you-prepared-bi.html)
- [Alphaevolve Deepmind Discovery Agent](../ch03/004-agent.html)
- [Ai Agents Inside Perimeter Hackernews](../ch04/279-ai-agent.html)

---

