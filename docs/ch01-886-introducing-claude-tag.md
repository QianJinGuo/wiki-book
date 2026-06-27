# Introducing Claude Tag

## Ch01.886 Introducing Claude Tag

> 📊 Level ⭐⭐⭐ | 6.6KB | `entities/introducing-claude-tag.md`

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
- [Claude Code Agent View](/ch09-001-claude-code-agent-view/) — Claude Code 的 Agent 架构
- Context Engineering — 上下文工程的理论与实践
- Agent Harness Context Management — Agent 上下文管理

## 参考

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/introducing-claude-tag.md)

---

