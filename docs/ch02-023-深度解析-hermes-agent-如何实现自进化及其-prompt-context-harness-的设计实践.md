## Ch02.023 深度解析 Hermes Agent 如何实现自进化及其 Prompt / Context / Harness 的设计实践

> 📊 Level ⭐⭐ | 6.8KB | `entities/agent-tools-research.md`

# 深度解析 Hermes Agent 如何实现自进化及其 Prompt / Context / Harness 的设计实践

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-tools-research.md)

## 摘要

阿里云开发者飞樰撰文深度分析 Hermes Agent（Nous Research，开源，40k+ Stars）的 Self-Evolving 机制，聚焦两条进化路径：Skill 动态生成（外挂式进化）和 RL 训练（内功式进化）。文章同时横向对比了四个 Agent 工具项目：CLI-Anything（32.4k ⭐）、OpenCLI（17.1k）、AutoCLI（2.4k）、AgentBrowser（~25 stars）。

## 核心要点

### Hermes Agent 双轨自进化机制

**外挂式进化：Skill 动态生成**

Hermes Agent 的 Skill 系统允许 Agent 在运行时动态创建、修改和加载新能力模块。这是一种"不改模型权重，扩展能力边界"的轻量级进化方式：

- **Skill 创建**：Agent 在执行任务过程中，可以将重复性操作抽象为可复用的 Skill 文件
- **Skill 注入**：新的 Skill 通过配置文件动态加载，无需重新训练模型
- **Skill 演进**：已有 Skill 可以被 Agent 自行修改和优化，形成自我改进循环

这种机制的核心优势是**零成本扩展**——不需要 GPU 训练，不需要数据标注，Agent 通过实际使用经验自动积累能力。

**内功式进化：RL 训练**

与外挂式进化互补的是基于强化学习的模型内部优化：

- 通过收集 Agent 执行任务的成功/失败信号作为 reward
- 对基础模型进行 RL 微调，提升特定场景下的推理和决策能力
- 这种进化更深层但也更昂贵，需要计算资源和高质量反馈数据

### Prompt / Context / Harness 三层架构

**Prompt 层：指令设计**

- System Prompt 定义 Agent 的人格、能力边界和行为规范
- Skill-specific Prompt 为每个能力模块提供执行指令
- 动态 Prompt 组装：根据当前任务上下文组合相关 Skill 的 Prompt

**Context 层：信息管理**

- 短期记忆：当前对话和任务上下文
- 长期记忆：跨会话的知识积累（通过 Memory 系统）
- 外部知识：文件系统、数据库、API 等运行时可访问的信息源

**Harness 层：执行框架**

- 工具调用调度：决定何时使用哪个工具
- 权限控制：不同操作的安全边界
- 错误处理与重试：异常情况的恢复策略
- 人机协作：何时请求人类确认

### Agent 工具项目横向对比

| 项目 | Stars | 核心定位 | 特点 |
|------|-------|----------|------|
| **CLI-Anything** | 32.4k | 通用 CLI Agent | 最广泛的命令行自动化 |
| **OpenCLI** | 17.1k | 开源 CLI 框架 | 社区驱动的 CLI Agent |
| **Hermes Agent** | 40k+ | 自进化 Agent | Skill 动态生成 + RL 训练 |
| **AutoCLI** | 2.4k | 轻量 CLI 工具 | 简化的命令行自动化 |
| **AgentBrowser** | ~25 | 浏览器 Agent | 浏览器自动化方向 |

## 深度分析

### 自进化的两难：外挂 vs 内功

Hermes Agent 的双轨进化策略实际上反映了 Agent 能力扩展的根本张力：

- **外挂式进化（Skill）**：快速、低成本、可解释，但受限于基础模型的理解能力上限。如果基础模型无法理解某个复杂概念，再好的 Skill 框架也无法突破这个天花板。
- **内功式进化（RL）**：深层、持久、可突破模型能力边界，但昂贵、缓慢、需要高质量数据。

最优策略是两者结合：用 Skill 快速覆盖新场景，用 RL 持续提升核心能力。这与 持续学习 的研究方向一致。

### Harness Engineering 的兴起

Hermes Agent 的 Harness 层设计体现了 Harness Engineering 的核心理念：Agent 的能力不仅取决于模型本身，更取决于围绕模型构建的执行框架。Harness 决定了：

- Agent 能看到什么信息（Context 管理）
- Agent 能做什么操作（工具注册）
- Agent 的行为边界（权限控制）
- Agent 如何从错误中恢复（容错机制）

这解释了为什么同样基础模型在不同 Harness 下表现差异巨大。

### Skill 生态的网络效应

Hermes Agent 的 Skill 系统具有潜在的网络效应：

1. 用户创建 Skill → Skill 被社区复用 → 更多用户参与
2. 更多 Skill → Agent 能力更强 → 吸引更多用户
3. 更多使用数据 → 更好的 Skill 质量 → 正向循环

这种模式类似插件生态（VS Code Extensions、Chrome Extensions），但有一个关键区别：Agent 的 Skill 可以被 Agent 自己创建和修改，形成自我加速的进化飞轮。

## 实践启示

1. **Skill 优先策略**：对于快速扩展 Agent 能力，Skill 动态生成是最高效的路径——无需训练，即时生效
2. **Harness 是核心竞争力**：投资于 Context 管理、工具调度、权限控制等 Harness 层设计，而非仅关注模型能力
3. **渐进式进化**：先用 Skill 覆盖场景，收集数据后再用 RL 微调，避免盲目训练
4. **评估 Agent 框架时关注 Harness**：选择 Agent 框架时，Harness 层的工程质量比底层模型选择更影响实际效果
5. **构建 Skill 复用机制**：企业内部应建立 Skill 库和复用流程，避免每个团队重复造轮子

## 相关实体

- [Harness Engineering](ch05-076-dipg-host-research-verify-agent-verify-c-aigc.html)
- [Karpathy: Vibe Coding 到 Agentic Engineering](ch04-070-agent-harness-engineering-a-survey.html)
- [Claude Code 源码中的 Agent Harness 构建之道](ch01-170-深入理解-claude-code-源码中的-agent-harness-构建之道.html)
- [Claude Code 源码核心机制](ch09-056-claude-code-routines-agent.html)
- [Harness Engineering 概念解析](ch05-005-ai-harness-engineering.html)
- [OpenClaw 完全指南](ch01-642-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita.html)
- MOC

---
