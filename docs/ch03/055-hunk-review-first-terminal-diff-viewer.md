# Hunk - Review-first Terminal Diff Viewer

> 📊 Level ⭐⭐⭐⭐ | 9.4KB

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

传统 diff 工具（`git diff`、delta、diff-so-fancy）把 diff 当作**文本渲染问题**：读入 patch、着色、分页输出，任务即完成。Hunk 的 review-first 范式则把 diff 当作一个**交互式 review session**：`hunk diff`、`hunk show` 刻意沿用 Git 的命令形态，但打开的不是纯文本，而是带 sidebar 导航、可交互的多文件 changeset 视图。命令语义与交互模型被有意分离——用户保留肌肉记忆，工具重新定义"看 diff"这件事的内涵。

当 changeset 的作者是 AI agent 而非人类时，这种分离从"更好用"变成"必需"：agent 一次产出往往横跨多个文件且混有 untracked 散文件，逐文件线性阅读在规模上失效；而 review 的本质未变——人类仍要在合并前理解并批准每一处变更。由此产生四个具体需求：信息密度（sidebar 导航的 review stream）、上下文增强（AI 注解解释变更意图）、实时协作（watch 模式随 agent 编辑刷新）、多输入模态（键盘、鼠标、pager、Git difftool 各服务一类场景）。Hunk 的功能面几乎逐条对应这张需求清单，这正是它在 agentic coding 流程中成为关键基础设施的原因。

### AI 注解：diff 之上的第二层信息

Hunk 在竞品对比表中独有的行是 inline agent/AI annotations——在代码旁边直接显示 AI 生成的注解。这一设计隐含一个判断：agentic 流程中 diff 本身不再是充分的信息载体。agent 生成的代码，其意图（为什么改、受什么约束、放弃了哪些替代方案）并不写在 hunk 里；注解层把"agent 的理由"绑定到"代码的位置"，让 review 从逆向猜测意图变成顺向读取解释。

配置层面同样暴露了这层设计的成熟度：`agent_notes` 默认关闭，说明注解是可选层而非强制层；`--agent-context` 工作流则表明注解内容可由 agent 在 live session 中写入。于是分工变成：agent 为自己的输出做注解，人类带着注解做裁决——human-in-the-loop 从流程口号落实为工具层的具体交互。

### Changeset 规模与 watch 模式：agent-human 协作循环

watch 模式不只是自动刷新的便利功能，它是协作循环的时间轴基础：agent 在一个终端持续编辑工作区，人类在另一个终端开着 `hunk diff --watch`，review 视图随文件变化实时更新——review 与生成在时间上重叠，而非"生成完再审"的串行关系。官方 agent 工作流三步（打开 Hunk → 让 agent 加载 `hunk skill path` 返回的 skill 文件 → agent 对 live Hunk session 执行 review）进一步把工具变成双方共享的工作面：人类看视图，agent 经由 skill 读写同一个 session。

这个循环也解释了 Hunk 为何收宽输入通道：untracked files 直接进 review、`git diff --no-color | hunk patch -` 从 stdin 读 patch、`hunk diff before.ts after.ts` 任意对照两个文件——agent 产出的各种中间形态（未提交散文件、管道 patch、临时版本对）都能进同一个 review 界面。输入通道的宽窄，直接决定协作循环能覆盖多少真实场景。

### 技术栈选择的信号：OpenTUI + Pierre diffs 与嵌入策略

Hunk 建立在 OpenTUI（Node.js 18+ 的 TUI 框架）与 Pierre diffs（diff 引擎库）之上，并把 `HunkDiffView` 组件从 `hunkdiff/opentui` 对外发布，供其他 OpenTUI 应用嵌入同款渲染器。这个组合释放两个信号：其一，TUI 正在成为 agent 时代开发者工具的一等界面——同一视图要同时服务人类交互（键盘/鼠标）与脚本化管道（pager、difftool、stdin patch）；其二，review UI 开始按"可复用组件"思路构建，diff 界面本身成为可嵌入资产，而不只是单一终端工具。

边界同样清晰：与 difftastic 对比，Hunk 不做 AST 级结构化 diff，专注交互层。在"生成（agent）→ 审查（Hunk）→ 集成（Git 工作流）"的分层里，它不与任何一环竞争，只把 review 这一环的界面做厚，为 agent 输出提供 human-in-the-loop 的验证层。[Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

## 实践启示

- **Agentic 工作流**：在 CI/CD 或 agent pipeline 中集成 Hunk 作为 review gate
- **团队协作**：watch mode 适合 pair programming 场景，一方编辑另一方实时 review
- **OpenTUI 生态**：如果需要构建自定义 diff UI，可以直接使用 Hunk 的 OpenTUI 组件
- **多 VCS 环境**：在 Jujutsu/Sapling 项目中也能无缝使用

## 相关实体

- Agentic Coding — Hunk 为 agentic coding 工作流设计
- Claude Code — 典型的 agentic coder，Hunk 的主要集成目标
- Human-in-the-loop — Hunk 的核心价值主张

→ [原文存档](https://github.com/modem-dev/hunk)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

