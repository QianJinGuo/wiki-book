# What Is Software, and Will LLMs Replace It?

## Ch01.630 What Is Software, and Will LLMs Replace It?

> 📊 Level ⭐⭐ | 7.2KB | `entities/what-is-software-llms-replace-tomassetti-2026.md`

# What Is Software, and Will LLMs Replace It?

## 摘要

Federico Tomassetti（Software Language Consulting 创始人）对"LLM 是否会取代软件"这一命题的深度分析。核心论点：LLM 正在吞噬软件的**接口层**（UI、API 文档、配置逻辑），但软件的**确定性内核**（数据组织、一致性约束、流程引导）仍然不可替代。文章通过 CRM 这一"无聊但必要"的软件类型，论证了软件在 LLM 时代的持续价值。

## 核心要点

### 软件的四大不可替代功能

Tomassetti 归纳了软件持续提供价值的四个维度：

1. **数据组织与规范化**：将非结构化信息转化为结构化、可查询的记录
   - CRM 示例：一个 opportunity 不是文本 blob，而是关联到公司、联系人、来源、历史合同的结构化记录
   - 价值：可以在毫秒内回答"过去 6 个月来自推荐、成交额 >€50K 的机会"，而非生成一段"听起来合理"的文字

2. **一致性与完整性约束**：强制执行业务规则
   - 不能在没有公司的情况下创建 opportunity
   - 不能删除仍有未关闭合同的公司
   - 这些约束是数据质量的基石

3. **可视化与模式发现**：将数据以帮助发现模式的方式呈现
   - 仪表盘、图表、趋势线——这些不是"漂亮"，而是认知工具

4. **流程引导与知识捕获**：将多年积累的操作知识编码为可执行的工作流
   - "如何正确完成一项工作"的经验被固化在软件中

### LLM 吞噬的是接口层

文章的关键洞察：LLM 真正改变的是软件的**接口层**，而非软件本身：

| 被 LLM 吞噬的 | 不会被 LLM 替代的 |
|---------------|-----------------|
| UI 交互（按钮、表单） | 数据模型（实体关系） |
| API 文档（如何调用） | 业务逻辑（约束、规则） |
| 配置界面（设置选项） | 事务处理（ACID 保证） |
| 帮助系统（使用说明） | 安全验证（权限控制） |

"Type 'show me sales for the last five years' and you get a chart" — 这展示了 LLM 接口的便利性，但底层的销售数据模型、聚合逻辑、权限控制仍然是传统软件在承担。

### CRM 为什么是完美的论证载体

选择 CRM 作为论证载体的巧妙之处：

- **Boring but essential**：每个 B2B 公司都有 CRM，但没人觉得它"酷"
- **数据密集**：CRM 的核心价值在于数据组织，而非界面
- **约束密集**：业务规则（销售流程、权限、审批）是 CRM 的骨架
- **LLM 的甜蜜点**：CRM 的界面层恰好是 LLM 最擅长替代的部分

## 深度分析

### 新分层架构：LLM → 编排层 → 确定性内核

文章暗示的未来软件架构分层：

```
┌─────────────────────────────────────┐
│     LLM 层（理解意图、自然语言）      │  ← 概率性
├─────────────────────────────────────┤
│     编排层（分解任务、路由请求）       │  ← 混合
├─────────────────────────────────────┤
│     确定性内核（数据、约束、事务）     │  ← 确定性
└─────────────────────────────────────┘
```

这与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 的核心理念完全一致：
- LLM 做意图理解和任务规划（概率层）
- 工具做确定性执行（确定性层）
- Harness 管理两层之间的边界

### Agent 架构验证了这一分层

现代 agent 架构（如 [Claude Code](../ch09/092-claude-code-dynamic-workflows.html)、Codex）的设计本质上就是这一分层的实现：

1. **LLM 层**：理解用户意图，规划执行步骤
2. **编排层**：决定调用哪些工具，以什么顺序
3. **工具层**：文件操作、API 调用、数据库查询——都是确定性操作

Agent 之所以有效，正是因为将 LLM 的"创造性"限制在规划和理解层面，而将执行委托给确定性工具。

### 软件工程师角色的转变

文章暗示的角色转变：**从"写逻辑"转向"设计边界"**。

传统软件工程师的核心技能：实现业务逻辑、编写代码。
LLM 时代软件工程师的核心技能：
- 设计数据模型（约束 LLM 的理解空间）
- 定义 API 契约（约束 LLM 的操作空间）
- 建立验证机制（确保 LLM 输出的正确性）
- 管理概率层与确定性层的边界

这与 [Anthropic 数据分析](ch01/1295-anthropic.html) 的实践相呼应——即使 LLM 能生成分析，数据的结构化组织仍然是前提。

### 对 "Vibe Coding" 的隐含回应

文章的分析隐含了对"vibe coding"（纯靠 LLM 生成代码）的回应：LLM 可以生成代码，但代码背后的**数据模型设计**、**约束定义**、**流程设计**仍然是人类工程师的核心工作。LLM 是更好的"编码接口"，但不是软件设计的替代品。

## 实践启示

### 对产品设计的指导

1. **拥抱 LLM 接口**：将现有软件的 UI 层用自然语言接口替换，降低使用门槛
2. **强化确定性内核**：投资数据模型设计、约束定义、事务处理
3. **明确边界**：清晰定义哪些操作由 LLM 决定，哪些必须由确定性逻辑处理

### 对 Agent 开发的指导

1. **工具设计优先**：Agent 的能力上限取决于工具的质量，而非 LLM 的能力
2. **约束即能力**：给 LLM 更多约束（语义层、schema、验证规则），反而能获得更好的结果
3. **确定性兜底**：关键操作（支付、删除、权限变更）必须有确定性验证

### 对职业发展的指导

- **数据建模**技能的价值在上升
- **系统设计**（而非编码）成为核心竞争力
- **理解 LLM 的局限性**比掌握 LLM 的使用更重要

## 相关实体

- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — 概率层与确定性层的边界管理
- [Agent Harnesses](../ch04/686-agent-harnesses-are-dead-long-live-agent-harnesses.html) — Agent 架构的演进
- [Claude Code Workflows](../ch09/092-claude-code-dynamic-workflows.html) — Agent 工作流设计
- [本文实体](ch01/603-llm.html) — Tomassetti 的分析
- [AI Agent Hype](../ch04/030-ai-agent.html) — 对 AI agent 过度炒作的冷静分析

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/what-is-software-llms-replace-tomassetti-2026.md)

---

