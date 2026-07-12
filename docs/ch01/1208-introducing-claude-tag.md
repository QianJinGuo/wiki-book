# Introducing Claude Tag

## Ch01.1208 Introducing Claude Tag

> 📊 Level ⭐⭐⭐ | 11.9KB | `entities/introducing-claude-tag.md`

# Introducing Claude Tag

> **Background**：Anthropic 官方 2026-06-24 发布的产品公告，介绍 Claude Tag——一种在 Slack 中以团队成员身份工作的 Agent 协作机制。Anthropic 内部 65% 的产品代码由 Claude Tag 创建，展示了 Agent 在企业协作场景中的实际采用程度。

## 摘要

Claude Tag 是 Anthropic 推出的 Agent 协作框架，允许 Claude 以团队成员身份加入 Slack 频道。用户通过 @Claude 标签来委派任务，Claude 在后台异步工作并返回结果。关键特性包括多人协作、上下文学习、主动行为和异步工作。Anthropic 内部 65% 的产品代码由 Claude Tag 创建，证明了 Agent 在企业环境中的高采用率。

## 核心要点

### 1. 多人协作的 Agent 模式

Claude Tag 的核心创新在于**多人协作**：

- 在给定的 Slack 频道中，只有一个 Claude 与所有人互动
- 任何人都可以看到它正在做什么，并从上一个人离开的地方继续对话
- 这与单一聊天或单一任务的工作方式完全不同——更像是与团队成员协作

这种模式解决了传统 Agent 交互的一个关键问题：**上下文孤岛**。在传统模式中，每个用户与 Agent 的交互是独立的，Agent 无法从团队的集体知识中受益。

### 2. 上下文学习与积累

Claude Tag 的另一个关键特性是**持续学习**：

- Claude 跟随频道的对话，逐步构建对工作的理解
- 用户不需要每次都从头解释事情
- 如果获得权限，Claude 可以从其他 Slack 频道和数据源自动学习
- 这为它提供了提供最佳工作所需的**隐性知识**

这种上下文积累机制使得 Claude Tag 能够随时间变得更有效，而不是每次交互都从零开始。

### 3. 主动行为与异步工作

Claude Tag 支持**主动行为**（如果启用了"ambient"模式）：

- 主动更新用户可能需要知道的信息
- 标记来自频道和工具的相关信息
- 跟进已安静但未解决的线程或任务

同时，Claude Tag 支持**异步工作**：
- 设置任务后，用户可以专注于其他优先事项
- Claude 可以为自己安排任务，自主执行项目数小时或数天
- Anthropic 内部现在花更多时间将任务并行委派给多个 Claude

### 4. 权限与安全模型

Claude Tag 的权限设计针对企业环境：

- 管理员指定模型可以访问哪些工具和信息，在哪些频道中
- 为不同用途创建独立的 Claude 身份
- 销售工作的 Claude 不会将记忆传递给工程工作的 Claude
- 也不会给工程师访问销售数据或工具的权限
- 管理员可以设置 token 支出限制（组织和频道级别）
- 可以查看 @Claude 所做的一切的日志

### 5. 技术实现

Claude Tag 使用 **Opus 4.8** 模型，替代了现有的 Claude in Slack 应用。迁移期为 30 天，Anthropic 为符合条件的 Enterprise 和 Team 组织提供启动积分。

## 深度分析

### Agent 协作模式的演进

Claude Tag 代表了 Agent 协作模式的重要演进：

| 模式 | 交互方式 | 上下文 | 适用场景 |
|------|---------|--------|---------|
| 单次对话 | 一对一 | 无状态 | 简单问答 |
| Claude Code | 一对一 | 有状态 | 代码开发 |
| Claude Cowork | 一对一 | 有状态 | 任务协作 |
| **Claude Tag** | **多对一** | **持续积累** | **团队协作** |

这个演进方向表明，Agent 正在从"工具"向"团队成员"转变。

### 与 Claude Cowork Task Boundary 的关系

Claude Tag 在 Claude Cowork 的基础上增加了几个关键维度：
- **多人协作**：不再局限于单一用户
- **持续上下文**：不再局限于单次会话
- **主动行为**：不再局限于被动响应

这些扩展使得 Claude Tag 更适合企业环境中的复杂协作需求。

### 65% 代码创建率的意义

Anthropic 内部 65% 的产品代码由 Claude Tag 创建，这个数据点有几层含义：

1. **Agent 的采用率正在加速**：从辅助工具到主要创建者
2. **代码质量必须足够好**：如果代码质量差，Anthropic 不会在生产中使用
3. **人机协作模式正在改变**：从"人写代码，AI 辅助"到"AI 写代码，人审查"

这与 Vibe Coding Reality Gap 的讨论形成有趣对照——在 Anthropic 内部，Agent 创建的代码已经达到了生产质量。

### 对 Agent 基础设施的需求

Claude Tag 的特性对 Agent 基础设施提出了新的要求：

1. **上下文管理**：需要高效的方式来存储、检索和更新 Agent 的上下文
2. **权限隔离**：需要细粒度的权限控制来支持多租户环境
3. **异步执行**：需要可靠的异步任务执行框架
4. **可观测性**：需要全面的日志和监控来追踪 Agent 的行为

## 实践启示

### 对企业 Agent 采用的建议

1. **从 Slack 开始**：Slack 是团队协作的自然起点，降低了采用门槛
2. **定义清晰的权限边界**：不同团队的 Agent 应该有独立的上下文和权限
3. **从小范围试点开始**：先在一个频道或团队中测试，再逐步扩展
4. **投资上下文工程**：Agent 的效果很大程度上取决于它能访问多少上下文

### 对 Agent 产品设计的启示

1. **多人协作是关键差异化**：单用户 Agent 的价值有限
2. **上下文积累是核心竞争力**：Agent 应该随时间变得更聪明
3. **主动行为增加粘性**：被动响应的 Agent 容易被遗忘
4. **异步工作扩展使用场景**：同步交互限制了 Agent 的应用范围

### 对 Agent 安全的考量

1. **权限隔离至关重要**：不同业务线的 Agent 必须有独立的上下文
2. **审计日志是必需品**：企业需要追踪 Agent 的所有行为
3. **Token 支出控制**：防止 Agent 产生意外的高额费用

## 相关实体

- Claude Cowork Task Boundary — Claude 协作边界分析
- [Claude Code Agent View](../ch09/001-claude-code-agent-view.html) — Claude Code 的 Agent 架构
- [Context Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md) — 上下文工程的理论与实践
- [Agent Harness Context Management](../ch05/039-agent-harness.html) — Agent 上下文管理

## 参考

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/introducing-claude-tag.md)

## 第 2 来源 — 新智元报道：Claude Tag 的独立身份与频道权限架构

2026 年 6 月 23 日发布的 Claude Tag 本质上是一个常驻 Slack 频道的 AI 团队成员——有自己的身份、自己的账号、自己的审计轨迹。Anthropic 称之为「智能体身份（agent identity）」。

Claude Tag 最核心的设计不是产品功能，而是**权限架构**。传统 AI 助手用人类账号的权限，但 Claude Tag 是多人的——一个频道里三五个人轮流 @它，用谁的权限都不对。Anthropic 的解法是「谁的权限都不借，直接给 AI 发自己的工牌」。

权限不跟人走，而是跟着频道走。管理员在工作区级别定义基线身份，频道级别做覆盖——工程频道给 GitHub 和数据仓库权限，CRM 锁死在该频道，法务频道有独立的工具箱。Claude 在法务频道中学到的东西永远不会出现在工程频道。撤权更简单：撤销一个身份，Claude 在所有接入点同时断开。

Ramp 2026 年 5 月数据显示，34.4% 的美国企业已在用 Claude 付费订阅，超过 OpenAI 的 32.3%。大型企业中非人类身份数量是员工数的 50 到 80 倍。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-tag-agent-identity-slack-xinzhiyuan-2026.md)

---

## 第 3 来源 — 架构师 JiaGouX 报道：Karpathy 三段式 LLM UI/UX 范式 + Boris Cherny 原话（2026-06-30）

> Source: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-tag-karpathy-three-paradigms-jiagoux-2026.md)
> Author: 架构师（JiaGouX）
> Date: 2026-06-30

本来源为 Claude Tag 发布新闻的跟进报道，核心增量是 **Andrej Karpathy 的 LLM UI/UX 三阶段演化框架**，为 Claude Tag 提供了宏观历史定位。

### 核心增量

1. **Karpathy 三段式 LLM UI/UX 范式**（本来源独家）：
   - **第一范式**：LLM 是一个你需要专门访问的网站（ChatGPT 等 chat 界面）
   - **第二范式**：LLM 是一个你下载到电脑上的应用程序（Claude Desktop、Copilot 等本地 App）
   - **第三范式**：LLM 是一个具备组织级工具和上下文的、自包含的、持久化的异步实体，与人类团队并肩工作（Claude Tag）
   - 这是 Claude Tag 首次被纳入 LLM 交互模式的宏观演化框架，前 2 来源均未涉及

2. **Boris Cherny 原话**（本来源独家引用）："在 Slack 中 @Claude，它就能像同事一样在频道里与你协同工作。它具备主动性、支持多用户协作，并且拥有独立的身份和记忆。这不仅仅是一个 Slack 机器人。在过去几个月里，它彻底改变了我们使用 Claude 的方式。"

3. **Ambient behavior 细化描述**（比前 2 来源更具体）："标记来自所处频道和已连接工具的相关信息，跟进那些已搁置但尚未解决的线程或任务"——不仅是"主动更新"，还包括**未解决问题追踪**

### 与已有来源的衔接

- **Karpathy 三范式框架**（本来源独家）与 [Context Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md) 的"人机交互演化"叙事一致——从"访问网站"到"本地应用"到"内嵌团队成员"，每一步都对应交互模式的抽象层级提升
- **Ambient behavior 的未解决问题追踪**（本来源独家补充）补全了第 1 来源"主动行为"定义的**遗漏方向**——不仅"提醒新信息"，还"追踪已发现的未解决问题"
- **Boris Cherny 原话**提供了第 1 来源（Anthropic 官方公告）所缺少的**个人视角**——官方公告偏技术规格，Boris 原话偏使用体验

### 关键独到判断

> "Karpathy 看来，这是 LLM UI/UX 的第三次重大重构。第一种范式：LLM 是一个你需要专门访问的网站。第二种范式：LLM 是一个你下载到电脑上的应用程序。第三种范式：LLM 是一个具备组织级工具和上下文的、自包含的、持久化的异步实体，与人类团队并肩工作。"

> "如果你曾使用过 Claude Code 或 Cowork，就会对 Claude Tag 感到熟悉。只需用简单的语言 @Claude 并提出需求，它就会将任务拆解为若干阶段，然后利用其拥有的工具逐一执行。"

> "它还可以为自己安排任务，在数小时或数天内自主推进项目。"

→ [第3原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-tag-karpathy-three-paradigms-jiagoux-2026.md)

---

