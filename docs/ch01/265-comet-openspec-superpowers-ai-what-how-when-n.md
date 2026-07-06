# 三器合一（Comet + OpenSpec + Superpowers）：用文件系统给 AI 编程上工程纪律 — 术哥源码级深度分析（WHAT/HOW/WHEN-NEXT 分工 + 9 平台 Hook + 上下文压缩 + 多 Agent 协作 + Shell+YAML 工程取舍）

## Ch01.265 三器合一（Comet + OpenSpec + Superpowers）：用文件系统给 AI 编程上工程纪律 — 术哥源码级深度分析（WHAT/HOW/WHEN-NEXT 分工 + 9 平台 Hook + 上下文压缩 + 多 Agent 协作 + Shell+YAML 工程取舍）

> 📊 Level ⭐⭐ | 24.9KB | `entities/three-tools-comet-openspec-superpowers-ai-coding-shuge-2026-06-17.md`

# 三器合一（Comet + OpenSpec + Superpowers）：用文件系统给 AI 编程上工程纪律

> **来源说明**：本文基于术哥（ShugeX / 运维有术）2026-06-17 发布的深度源码分析整理（《AI 编程总失控？Comet + OpenSpec + Superpowers 用文件系统管住 AI》，术哥无界系列第 142 篇 / AI 编程最佳实战「2026」系列第 42 篇）。作者显式声明「源码分析基于本地仓库版本，尚未在生产环境中完成全场景验证」，按 web-content-reviewer `honest-second-hand-interpretation-scoring` 自觉的局限性披露提高 c 评分。

## 一、核心论点：AI 编程的瓶颈是工程纪律，不是模型能力

术哥通过拆解三个 GitHub 开源项目的源码得出结论：

> **AI 编程的核心瓶颈不在模型能力，而在工程纪律。**

- **Superpowers** 用 Markdown Skill 给 AI 加**方法论纪律**
- **OpenSpec** 用文件系统给需求加**规格纪律**
- **Comet** 用 YAML 状态机给流程加**阶段纪律**

三个项目都没有依赖复杂的基础设施，核心载体就是 **Markdown 文件、YAML 配置和 Shell 脚本**。

## 二、三器分工：WHAT / HOW / WHEN-NEXT

这不是同类竞品，而是一条流水线的三层：

| 工具 | 管什么 | 核心载体 | 解决的核心问题 |
|------|--------|---------|--------------|
| **OpenSpec** | **WHAT**（做什么） | TypeScript CLI + Markdown 模板 | 需求不能只活在聊天记录里 |
| **Superpowers** | **HOW**（怎么做） | 12+ 个 SKILL.md 文件 + 57 行 Shell 引导 | AI 不需要自己记住该用什么 Skill |
| **Comet** | **WHEN + NEXT**（何时 + 下一步） | YAML 状态机 + Shell 守卫 | 工程纪律不能寄希望于 AI 自觉 |

**关键工程考量**：Comet 的 CLAUDE.md 中明确写道：

> **Comet 不修改 OpenSpec 和 Superpowers 的原始 Skill 文件。它是纯粹的编排层，不侵入底层项目。**

**好处**：Superpowers 和 OpenSpec 各自迭代时 Comet 不受影响，用户可单独用任何一个，不需要装全家桶。
**代价**：Comet 没法深度定制底层行为，只能靠编排规则约束。

## 三、Superpowers：57 行 Shell 脚本的自举魔法

### 核心反直觉点

Superpowers 的源码结构很反直觉：**核心是十几个 SKILL.md 文件，几乎没有可执行代码**。真正能算代码的只有 `hooks/session-start` 这 **57 行的 Shell 脚本**。

### session-start 脚本核心逻辑

```bash
# 简化版
using_superpowers_content=$(cat "${PLUGIN_ROOT}/skills/using-superpowers/SKILL.md")

# JSON 转义后注入为会话上下文
session_context="<EXTREMELY_IMPORTANT>\nYou have superpowers.\n\n${using_superpowers_escaped}\n</EXTREMELY_IMPORTANT>"

# 根据宿主平台输出不同格式的 JSON
printf '{\n  "hookSpecificOutput": {\n    "hookEventName": "SessionStart",\n    "additionalContext": "%s"\n  }\n}\n' "$session_context"
```

`hooks.json` 注册了 `SessionStart` 事件监听，matcher 是 `startup|clear|compact`。**会话启动、清空上下文、上下文压缩三种情况都会触发**。AI 在第一轮对话时就自动获得了检查和使用 Skill 的指令。

### 平台适配三层逻辑

同一个脚本根据环境变量判断运行平台：

| 条件 | 输出格式 |
|------|---------|
| `CURSOR_PLUGIN_ROOT` 存在 | `additional_context`（Cursor 的 snake_case） |
| `CLAUDE_PLUGIN_ROOT` 存在且无 `COPILOT_CLI` | `hookSpecificOutput.additionalContext`（Claude Code 嵌套） |
| 其他 | `additionalContext`（SDK 标准） |

**这说明 Superpowers 设计时就考虑了多平台兼容，不是只为 Claude Code 服务**。

### Skill 依赖链路（软件工程流程的 Skill 化）

```
brainstorming → using-git-worktrees → writing-plans → subagent-driven-development
                                                  ↓ (内部调用)
                                                  test-driven-development
                                                  requesting-code-review
                                                  receiving-code-review
                                                  → finishing-a-development-branch
                                                  → verification-before-completion
```

**设计探索（brainstorming）是入口不可跳过**。Git Worktree 隔离是第二步，然后写计划、执行计划，中间穿插 TDD 和代码审查，最后分支完成和验证。**本质上是把标准软件工程流程固化成 AI 能执行的指令**。

## 四、OpenSpec：Delta Spec + Artifact Graph

### Delta Spec — 增量规格（brownfield-first）

OpenSpec 的 Delta Spec 机制针对**存量项目**。不重写整个规格，只描述变更部分：

```
# Delta for Auth

## ADDED Requirements
### Requirement: Two-Factor Authentication
（新增需求）

## MODIFIED Requirements
### Requirement: Session Expiration
（修改需求，替换原有）

## REMOVED Requirements
### Requirement: Remember Me
（废弃需求）
```

归档时三个部分被分别应用：ADDED 追加 / MODIFIED 替换 / REMOVED 删除。**MODIFIED 的处理规则很严格**：必须复制整个需求块（从 `### Requirement:` 到所有 scenarios），在副本上修改。如果用 MODIFIED 但只写了部分内容，归档时会丢失细节。

### Artifact Graph — 制品依赖图

```yaml
artifacts:
  - id: proposal
    generates: proposal.md
    requires: []              # 无依赖，首先创建
  - id: specs
    generates: specs/**/*.md
    requires: [proposal]      # 需要 proposal
  - id: design
    generates: design.md
    requires: [proposal]      # 可与 specs 并行
  - id: tasks
    generates: tasks.md
    requires: [specs, design] # 需要 specs 和 design
```

**关键洞察**：依赖是**使能器（enabler）而非门控（gate）**——它们表示**可以创建什么**，而不是**必须创建什么**。你可以跳过 design，也可以先创建 specs 再回头补 design。

设计哲学四个词：**fluid not rigid, iterative not waterfall, easy not complex, brownfield-first**。规格应该跟着开发节奏走，而不是反过来。

### 26 个平台适配器

`src/core/command-generation/adapters/` 目录下 26 个适配器文件，覆盖 Claude Code、Cursor、Codex、Gemini、OpenCode 等主流工具。**OpenSpec 的工作流逻辑只写一次，通过适配器分发到各个平台**——新增平台只需要加一个适配器文件。

## 五、Comet：YAML 状态机的工程纪律

Comet 是三项目中**工程量最重**的：

- `comet-state.sh` 1245 行
- `comet-guard.sh` 752 行
- `comet-handoff.sh` 390 行

核心创新：用 `.comet.yaml` 一个简单文件充当 AI Agent 的**外部记忆**。

### 五阶段状态机

`open → design → build → verify → archive`

状态字段分三类：

| 类别 | 字段 | 含义 |
|------|------|------|
| **阶段控制** | `workflow` | full/hotfix/tweak |
|  | `phase` | open/design/build/verify/archive |
|  | `archived` | 归档终态 |
| **构建决策** | `build_mode` | subagent-driven-development |
|  | `isolation` | branch/worktree |
|  | `tdd_mode` | tdd/direct |
|  | `subagent_dispatch` | confirmed（子代理派发） |
| **验证交接** | `verify_mode` | light/full |
|  | `verify_result` | pending/pass/fail |
|  | `handoff_hash` | 交接上下文 SHA256 指纹 |

### 合法的转换事件（5 种）

| 事件 | 转换 |
|------|------|
| `open-complete` | open → design（full）或 open → build（hotfix/tweak） |
| `design-complete` | design → build |
| `build-complete` | build → verify（**需校验构建决策**） |
| `verify-pass` | verify → archive（**需校验验证证据**） |
| `verify-fail` | verify → build（保留分支状态） |

**每次转换前 `comet-guard.sh` 检查前置条件，不满足就阻断（退出码 1）**。

### 阶段检测 first-match-wins 链路

```
archived: true           → 工作流完成
verify_result: pass      → 进入归档
verify_result: fail      → 验证失败决策阻塞点
phase: verify 或 tasks.md 全勾选 → 进入验证
phase: build             → 按工作流路由
phase: design            → 进入设计
phase: open              → 进入提案
无活跃变更                → 创建新变更
```

**关键**：每次恢复上下文时都要重新执行 Step 0 和 Step 1，**不能信任对话历史**（可能被压缩或截断）。只有文件系统的状态是可靠的。

### Guard 守卫：脚本强制纪律

**核心约束 1 — 构建决策强制（require_build_decisions）**：离开 build 阶段之前，`isolation` 必须已设置（branch 或 worktree），`build_mode` 必须已选择。full workflow 还必须选 `tdd_mode`。`subagent-driven-development` 模式必须 `subagent_dispatch: confirmed`。

**核心约束 2 — 验证证据强制（require_verification_evidence）**：进入 archive 之前，`verification_report` 必须指向实际存在的报告文件，`branch_status` 必须是 `handled`。**没有验证报告就不能归档**。

```bash
# guard.sh 中的 tasks_all_done 函数（关键代码）
if ! grep -q '\- \[x\]' "$tasks"; then
  echo "tasks.md has no completed tasks." >&2
  return 1
fi
if grep -q '\- \[ \]' "$tasks"; then
  echo "Unfinished tasks:" >&2
  grep -n '\- \[ \]' "$tasks" >&2 || true
  return 1
fi
```

**AI 没法跳过测试直接宣称完成**——没有已完成任务就阻断，有未完成任务也阻断。

### 规模评估（auto verify_mode）

从三个维度评估变更规模：

```bash
task_count=$(grep -c '^\- \[' "$tasks_file")
delta_spec_count=$(find "$change_dir/specs" -name "spec.md" | wc -l)
changed_files=$(git diff --name-only "$base_ref"...HEAD | wc -l)

if [ "$task_count" -gt 3 ] || [ "$delta_spec_count" -gt 1 ] || [ "$changed_files" -gt 4 ]; then
  verify_mode="full"
else
  verify_mode="light"
fi
```

**任务 > 3 / delta spec > 1 / 变更文件 > 4 → 自动 full 验证模式**。小改动走 light 模式不浪费时间。

## 六、嵌套 Skill 触发：让 AI 真正执行而非模仿

### 模仿 vs 真正触发的本质区别

- **模仿行为**：AI 读 Skill 描述后自己尝试执行，可能遗漏关键步骤
- **真正触发**：通过宿主平台的 Skill 工具加载 Skill 完整内容，**确保所有指令都被执行**

Comet 在 CLAUDE.md 中定义**统一触发表述规范**：

> **中文**：**立即执行：** 使用 Skill 工具加载 `<skill-name>` 技能。**禁止跳过此步骤**。
>
> **英文**：**Immediately execute:** Use the Skill tool to load the `<skill-name>` skill. Skipping this step is prohibited.

**这个规范不是建议，是强制要求**。

### PreToolUse Hook 写保护机制

`comet-hook-guard.sh` 注册为 PreToolUse Hook，**当 Comet 处于 open/design/archive 阶段时，如果 AI 试图写入代码文件（非文档和配置），hook 直接拦截并拒绝**。

设计意图：**AI 在需求未确认、设计未完成或归档进行中时，不能偷偷写代码**。

### 9 平台 Hook 支持差异

| hookFormat | 平台 |
|-----------|------|
| `claude-code` | Claude Code / Codex / Amazon Q |
| `gemini` | Gemini CLI |
| `windsurf` | Windsurf |
| `copilot` | GitHub Copilot |
| `qwen` | Qwen Code |
| `kiro` | Kiro |
| `qoder` | Qoder |

**不支持 hooks 的平台（如 Cursor）只能依赖 SKILL.md 中的文字指令，可靠性会打折扣**。

## 七、上下文压缩：25-30% Token 节省 + SHA256 追踪

### 两种压缩模式

```yaml
context_compression: off   # 或 beta
```

- **off 模式**：完整 Spec 内容嵌入交接包，不做压缩（适合上下文窗口充裕场景）
- **beta 模式**：只保留 Design Doc 和源文件的 **SHA256 哈希引用**，不嵌入完整内容（AI 需某个文件细节时按哈希引用读原文件）

### 交接包结构（脚本确定性生成）

```
# Comet Design Handoff

- Change: rate-limit
- Phase: design
- Mode: beta
- Context hash: a1b2c3...

OpenSpec remains the canonical capability spec.
This handoff is a deterministic, source-traceable context pack,
not an agent-authored summary.

## openspec/changes/rate-limit/proposal.md

- Source: openspec/changes/rate-limit/proposal.md
- Lines: 1-42
- SHA256: d4e5f6...
```

**关键设计决策**：交接包**不是 AI 写的摘要**，而是脚本**确定性生成**的。每一行都标注源文件路径、行号范围和 SHA256 哈希。上下文可追溯——如果 build 阶段 AI 对某个规格有疑问，可直接打开源文件验证。

### 基准测试数据（README + CONTEXT-COMPRESSION.md）

| 指标 | off 模式 | beta 模式 | 差异 |
|------|---------|----------|------|
| Build 阶段输入 token | 100% | **70-75%** | **减少 25-30%** |
| 测试通过率 | 基准 | 基准 | **不受影响** |
| Spec 覆盖率 | **100%** | 95% | 仅边缘案例细节少量丢失 |

**更重要的是跨会话恢复可靠**：上下文压缩后 AI 不需要依赖对话历史，只需读 `.comet.yaml` 和交接包就能恢复全部状态。

## 八、多 Agent 协作模式：上下文隔离是关键

### Superpowers 的 subagent-driven-development 模式

```
主 Agent（协调者）
  ├── 分派任务 → Implementer Subagent（写代码）
  ├── 审查结果 → Spec Compliance Reviewer（规格合规性）
  ├── 审查结果 → Quality Reviewer（代码质量）
  └── 继续下一个任务或回退修复
```

每个子代理获得**全新的上下文**，只接收当前任务所需的信息。**好处：避免上下文污染——一个任务的细节不会干扰另一个任务的判断**。

### Comet 的 subagent_dispatch 状态约束

`.comet.yaml` 中引入 `subagent_dispatch` 字段，要求在 `build_mode: subagent-driven-development` 时必须为 `confirmed`：

- **已确认**：主窗口只协调不执行，检查第一个未完成任务，如已实现则勾选，否则派遣后台子代理
- **未确认**：恢复时提示确认子代理派发，或切换到 `executing-plans` 模式

这条规则**堵了一个常见漏洞**：AI 声称使用子代理模式但实际在主窗口直接执行所有任务。子代理模式的价值在于上下文隔离，在主窗口执行这个价值就丧失了。

## 九、工程取舍：为什么 Shell + YAML 不是 Node.js

### YAML vs 数据库

**好处**：零运行时依赖。Git 可追踪每次变更，AI 可直接读取。
**代价**：并发写入无保护（后写覆盖先写）。AI 编程场景下并发写入很少，通常只有一个活跃 Agent。

### Shell vs Node.js

**原因**：Shell 脚本可直接调用 `git/grep/awk/sha256sum` 等系统工具，不需要 Node.js 运行时。AI 在执行 Shell 脚本时可理解每一行做什么，出了问题可以调试。

**跨平台兼容性约束**：

- 禁止 `sed -i`（GNU/BSD 不兼容），用 `awk` 替代
- 必须兼容 `sha256sum`（GNU）和 `shasum -a 256`（BSD/macOS）
- 所有可选 grep 结果加 `|| true`

从 `comet-state.sh` 的 `strip_inline_comment` 函数可以看到——为了处理 YAML 行内注释（`#` 后面的内容），作者没用 `sed`，而写了 **20 多行的 `awk` 程序逐字符解析**。这就是跨平台兼容的代价。

### 不修改底层 Skill（关注点分离）

Comet 的 CLAUDE.md 硬规则：**不能直接修改 Superpowers 和 OpenSpec 的原始 Skill**。

Comet 能做的是决定**什么时候调用哪个 Skill，在调用前后加什么校验**，**不能改变 Skill 本身的内容**。如果 Superpowers 的 TDD Skill 需要调整，得去 Superpowers 仓库改。

## 十、可扩展性 + 演进方向

### 平台覆盖范围对比

| 项目 | 平台数 | 扩展方式 |
|------|--------|---------|
| Superpowers | 8+ | 插件清单文件（.claude-plugin、.cursor-plugin 等） |
| OpenSpec | **26** | `command-generation/adapters/` 目录下的适配器 |
| Comet | **29** | `platforms.ts` 中的 Platform 接口定义 |

Comet 的 `platforms.ts` 是三项目中最完善的平台抽象。每个 Platform 对象包含技能目录、检测路径、OpenSpec 工具 ID、规则文件配置、Hook 支持等十几个字段。**新增一个平台只需要在数组里加一个对象**。

### OpenSpec Schema 自定义

```yaml
# openspec/schemas/research-first/schema.yaml
name: research-first
artifacts:
  - id: research
    generates: research.md
    requires: []
  - id: proposal
    generates: proposal.md
    requires: [research]
```

可在 proposal 之前加 research 阶段，适合需要前期调研的项目。

### Comet 演进趋势

- **0.3.7+** 引入 **CodeGraph 语义索引**（README 数据：成本降低 16%，工具调用减少 58%）
- **上下文压缩处于 Beta 阶段**
- `auto_transition` 配置项让阶段过渡可自动执行
- `hotfix` 和 `tweak` 预设工作流为小改动提供快捷路径

**变化方向**：减少手动操作，增加自动化，同时保持工程纪律不被绕过。

## 十一、与其他三器组合的关系

- **vs [三器合一：gstack + Superpowers + OpenSpec](https://github.com/QianJinGuo/wiki/blob/main/entities/three-tools-in-one-gstack-superpowers-openspec-engineering-ai-coding.md)**（AgentBuff, 2026-05-12）：第三器不同（gstack vs Comet），视角也不同（AgentBuff 偏「HARD-GATE 串联」+「TDD 与 /review 互补」，术哥偏「源码机制 + 平台适配 + 工程取舍」）。术哥文章更深入到 Shell 脚本 + YAML 状态机 + 9 平台 Hook + SHA256 追踪的具体实现
- **vs [Superpowers 深度拆解](https://github.com/QianJinGuo/wiki/blob/main/entities/superpowers-deep-dive-kaiyuandakashuo.md)**（开源圆桌）：单项目深度。本实体是三项目系统视角
- **vs [Hermes Agent Skills 源码分析](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-skills-source-code-analysis-shuge.md)**（术哥本人）：术哥对 Hermes 的源码分析风格一致（57 行 Shell、Markdown 为主、平台适配）。本实体是术哥对外部三项目（Comet/OpenSpec/Superpowers）的源码分析
- **vs [OpenSpec 规范驱动开发 SDD](https://github.com/QianJinGuo/wiki/blob/main/entities/openspec-spec-driven-development-trae-solo.md)**：OpenSpec 单项目视角（Trae 原生支持）。本实体是三项目流水线视角

## 相关实体

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/three-tools-comet-openspec-superpowers-ai-coding-shuge-2026-06-17.md)
→ [Three Tools In One Gstack Superpowers Openspec Engineering Ai Coding](https://github.com/QianJinGuo/wiki/blob/main/entities/three-tools-in-one-gstack-superpowers-openspec-engineering-ai-coding.md) — 同期同主题：gstack 作为第三器的视角
→ [Superpowers Deep Dive Kaiyuandakashuo](https://github.com/QianJinGuo/wiki/blob/main/entities/superpowers-deep-dive-kaiyuandakashuo.md) — Superpowers 单项目深度
→ [Openspec Spec Driven Development Trae Solo](https://github.com/QianJinGuo/wiki/blob/main/entities/openspec-spec-driven-development-trae-solo.md) — OpenSpec 单项目深度
→ [Openspec 四步法深度复盘 流程完整不等于代码正确](https://github.com/QianJinGuo/wiki/blob/main/entities/openspec-四步法深度复盘-流程完整不等于代码正确.md) — OpenSpec 四步法实战复盘
→ [Ai Production Development Workflow Openspec Superpowers Gstack](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-production-development-workflow-openspec-superpowers-gstack.md) — gstack + OpenSpec + Superpowers 生产级实践
→ [Claude Code Skills Superpowers Practice](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-skills-superpowers-practice.md) — Claude Code + Superpowers 实践
→ [Hermes Agent Skills Source Code Analysis Shuge](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-skills-source-code-analysis-shuge.md) — 术哥本人对 Hermes Agent Skills 的源码分析（方法论参照）
→ [缝合怪识别与减法决策论：OpenSpec + Superpowers 融合方案下线记](https://github.com/QianJinGuo/wiki/blob/main/entities/openspec-superpowers-decommissioning-frankenstein-three-questions-shuge-2026-06-18.md) — 同期同作者 24h 后反思

---

