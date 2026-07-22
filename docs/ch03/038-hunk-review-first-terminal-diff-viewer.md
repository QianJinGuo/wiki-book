# Hunk - Review-first Terminal Diff Viewer

## Ch03.038 Hunk - Review-first Terminal Diff Viewer

> 📊 Level ⭐ | 5.6KB | `entities/hunk-diff-viewer.md`

# Hunk - Review-first Terminal Diff Viewer

## 摘要

Hunk 是 modem-dev 开源的终端 diff 查看器，专为 AI agent 生成的 changeset 设计。它不是传统的 diff 工具，而是一个 **review-first 的交互式 UI**，内置多文件导航、AI 注解、响应式布局和 watch 模式。基于 [OpenTUI](https://github.com/anomalyco/opentui) 构建，使用 [Pierre diffs](https://www.npmjs.com/package/@pierre/diffs) 作为 diff 引擎。2026-06-24 通过 TLDR newsletter 发现。

## 核心要点

### Review-first 设计理念

Hunk 的核心差异化在于它不把 diff 当作纯文本来展示，而是当作一个 **review session**。这意味着：

- **多文件 review stream + sidebar 导航**：可以在一个 session 中浏览整个 changeset，而不是逐文件切换
- **Inline AI/Agent annotations**：在代码旁边显示 AI 辅助注释，这是同类工具中独有的能力
- **响应式 auto split/stack 布局**：根据终端宽度自动切换分屏或堆叠模式
- **Watch 模式**：`hunk diff --watch` 自动监控文件变化并实时刷新 review
- **全输入支持**：键盘、鼠标、pager 模式、Git difftool 模式

### Agentic 工作流集成

Hunk 专门为 agentic coder 设计了工作流：

1. 在终端打开 Hunk：`hunk diff` 或 `hunk show`
2. 让 agent 加载 Hunk skill 文件：`hunk skill path` 返回 skill 路径
3. Agent 使用 skill 对 live Hunk session 进行 review

这意味着 AI agent 可以直接与 Hunk 的实时 review session 交互，实现 **人机协作 code review**。

### 多 VCS 支持

Hunk 不仅支持 Git，还自动检测 Jujutsu (jj) 和 Sapling 仓库：

```bash
hunk diff                      # review 当前变更（含 untracked files）
hunk diff --watch              # 自动 reload
hunk show                      # review 最新 commit
hunk show HEAD~1               # review 早期 commit
hunk diff before.ts after.ts   # 直接比较两个文件
git diff --no-color | hunk patch -  # 从 stdin 读取 patch
```

### 竞品对比

| 能力 | Hunk | lumen | difftastic | delta | diff-so-fancy |
|------|------|-------|------------|-------|---------------|
| Review-first 交互 UI | ✅ | ✅ | ❌ | ❌ | ❌ |
| 多文件 review stream + sidebar | ✅ | ✅ | ❌ | ❌ | ❌ |
| Inline agent/AI 注解 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 响应式 auto split/stack | ✅ | ❌ | ❌ | ❌ | ❌ |
| 鼠标支持 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 结构化 diff | ❌ | ❌ | ✅ | ❌ | ❌ |

Hunk 在交互式 review 场景下能力最全面，但在结构化 diff（AST 级别）方面不如 difftastic。

### 配置与定制

支持持久化配置文件 `~/.config/hunk/config.toml` 或 `.hunk/config.toml`：

- **主题系统**：内置 `github-dark-default`、`github-light-default` 等主题，支持自定义主题继承和覆盖
- **自定义主题**：基于 Catppuccin Mocha 等内置主题继承，仅覆盖关心的颜色
- **Git 集成**：`git config --global core.pager "hunk pager"` 将 Hunk 设为默认 pager
- **OpenTUI 组件**：发布 `HunkDiffView` 组件供嵌入到自定义 OpenTUI 应用

### 技术架构

- **运行时**：Node.js 18+
- **平台**：macOS、Linux、Windows
- **安装**：`npm i -g hunkdiff` 或 `brew install modem-dev/tap/hunk`
- **许可**：MIT
- **构建基础**：OpenTUI + Pierre diffs

## 深度分析

### 为什么 Agent 时代需要 Review-first Diff 工具？

传统 diff 工具（`git diff`、delta、diff-so-fancy）面向人类逐行审查设计。但当 AI agent 生成大量代码变更时，review 的范式发生了根本变化：

- **信息密度需求**：agent 生成的 changeset 通常更大、更分散，需要 sidebar 导航
- **上下文增强需求**：纯 diff 不够，需要 AI 注解来解释变更意图
- **实时协作需求**：agent 在编辑，人类需要实时看到变化（watch mode）
- **多输入模态**：不同场景需要键盘、鼠标、pager 等不同交互方式

Hunk 的设计正好回应了这些需求，使其成为 agentic coding 时代的关键基础设施。

### 与其他 developer tools 的定位

Hunk 聚焦于 **review 环节**，与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 中的其他工具形成互补：

- **代码生成**：Claude Code、Codex 等 agent 负责
- **代码审查**：Hunk 提供 review-first 的交互界面
- **代码集成**：Git 工作流负责

这个定位使 Hunk 不与 agent 竞争，而是为 agent 输出提供 human-in-the-loop 的验证层。

## 实践启示

- **Agentic 工作流**：在 CI/CD 或 agent pipeline 中集成 Hunk 作为 review gate
- **团队协作**：watch mode 适合 pair programming 场景，一方编辑另一方实时 review
- **OpenTUI 生态**：如果需要构建自定义 diff UI，可以直接使用 Hunk 的 OpenTUI 组件
- **多 VCS 环境**：在 Jujutsu/Sapling 项目中也能无缝使用

## 相关实体

- Agentic Coding — Hunk 为 agentic coding 工作流设计
- Claude Code — 典型的 agentic coder，Hunk 的主要集成目标
- Human-in-the-loop — Hunk 的核心价值主张

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/hunk-diff-viewer.md)

---

