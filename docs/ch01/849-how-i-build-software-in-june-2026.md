# How I Build Software in June 2026

## Ch01.849 How I Build Software in June 2026

> 📊 Level ⭐⭐ | 5.2KB | `entities/how-i-build-software-june-2026.md`

# How I Build Software in June 2026

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/how-i-build-software-june-2026.md)

## 摘要

Stafford Williams 在 2026 年 6 月分享了他当前的软件开发工作流——几乎所有工作都通过自研的 **assist** 编排器发起和管理。从 2025 年 12 月开始构建 assist，到 2026 年 4 月实现完整编排能力，他的开发方式已从「人写代码 + AI 辅助」演变为「AI 执行 + 人做决策」的范式。核心理念是：通过精心定义 backlog、自动化验证、并行管理多个 Agent session，将人机交互瓶颈最小化，从而实现高速软件交付。

## 核心要点

### 编排器驱动的工作流

Williams 在 Addy Osmani 定义的 [AI 采用层级](https://addyosmani.com/blog/code-agent-orchestra/) 中处于最高级——构建了一个完整的编排器。assist 最初是 CLI/技能辅助工具，配合 Claude Code 使用；2026 年 4 月实现编排功能后，转变为控制 Claude Code 和 Codex 的中心枢纽，管理工作流在 Agent 之间的流转。

关键转变：从 `assist draft` CLI 命令 → UI 按钮点击触发，降低了操作摩擦。

### 个人 Backlog 系统

assist 维护一个按仓库分类的「个人 backlog」，分为 bug 和 feature 两类。每个 backlog 项具有以下特征：

- **小粒度**：协作式快速定义，仅需少量问答
- **分阶段执行**：每个 phase 对应一个 Agent 上下文窗口
- **验收标准**：用于后续非确定性验证
- **可迭代精化**：通过 `/refine` 命令在 UI 中协作更新

这不替代团队 backlog，而是替代了笔记应用中的个人待办清单。

### Agent Session 管理

- 每天早晨从空状态开始，选择要启动的 backlog 项
- 每个 session 初始由 backlog 项的 detail 和当前 phase 任务驱动
- Agent 以 [auto mode](https://code.claude.com/docs/en/auto-mode-config) 运行，权限请求通过 assist 工具链路由（如 `git commit` 受控）
- UI 以卡片形式展示 session 状态：running / done / waiting
- 同时运行 2-6 个 Agent session

### 交付速度的理想条件

当以下条件全部满足时，可实现极速交付：

1. backlog 项范围小
2. 代码库结构合理、质量高
3. 验证约束严格
4. 模型选择和配置正确
5. 模型不足之处的分析已纳入指导（如 `CLAUDE.md`）
6. 模型提供商行为透明

满足理想条件时，部分 backlog 项可无需人工干预完成全流程，瓶颈从「写代码」转移到「tokens/秒」和「人工交互频率」。

## 深度分析

### 从 CLI 到 UI 的编排演进

Williams 的经历展示了 Agent 工具链的自然演进路径：先用 CLI 验证概念，再在信息密度不足时迁移到 UI。多 terminal 窗口难以维持 flow state——关键信息隐藏在滚动文本中。UI 的核心价值是**快速呈现需要人工交互的 session**，而非替代终端。

### Token 经济学与并行化

订阅制定价意味着并行化不会增加成本。Williams 使用 Claude 团队账户（雇主付费）+ ChatGPT Plus（自费）的组合。RTX 4090 已就位但尚未用于日常开发，暗示本地模型即将进入工作流。

### 持续改进的不变性

尽管 AI 工具大幅改变了编码方式，Williams 强调 [Kaizen（持续改善）](https://en.wikipedia.org/wiki/wiki/Kaizen) 比以往更重要。LLM 的复杂性和局限性使软件开发同时变得更简单和更困难——自动化了更多事情，但也引入了新的失败模式。

## 实践启示

- **从小 backlog 开始**：粒度越小，Agent 一次通过率越高
- **投资验证体系**：自动验证是减少人工瓶颈的关键杠杆
- **UI 信息架构优先**：编排器的核心不是启动 Agent，而是快速判断哪个需要人
- **模型提供商透明度**是隐性依赖——Williams 明确提到「提供商不应暗中削弱模型」
- **不要将 AI 编排视为银弹**：仍有「绝望兔子洞」需要人的经验和判断

## 相关实体

- [Harness Engineering Paradigm Shift](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-paradigm-shift.md)：Williams 的 assist 是 Agent 编排的实践案例
- [Harness Engineering 7 Layers](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-7-layers-framework.md)：编排器属于 Harness 层工程
- [Claude Code MCP Server](../ch07/027-claude-code-mcp-server.html)：assist 控制的核心执行引擎之一
- [Claude Code Paradigm](https://github.com/QianJinGuo/wiki/blob/main/concepts/kairos-claude-code-paradigm.md)：从「引导 vibe」到「编排 Agent」的演进

---

