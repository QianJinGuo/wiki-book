# Codex AGENTS.md 项目说明书完整指南

## Ch09.063 Codex AGENTS.md 项目说明书完整指南

> 📊 Level ⭐⭐ | 9.8KB | `entities/codex-agentsmd-project-instructions-rookie.md`

# Codex AGENTS.md 项目说明书完整指南

## 概述

AGENTS.md 是 Codex 的「项目说明书」——每次启动会话前必读的持久指令文件，相当于 Claude Code 的 CLAUDE.md。但 Codex 的发现机制、覆写规则、字节上限自成一套，与 Claude Code 有显著差异。

## AGENTS.md 的定位

AGENTS.md 是你写给 Codex 的一份持久指令，它每次启动、动手干活之前都先读一遍，当成这个项目的背景装进脑子。没有 AGENTS.md，你就得每次重新解释一遍上下文。

类比：**交接班的工作清单**。工厂三班倒，上一班下班前在墙上写清楚注意事项，下一班接手照着干。AGENTS.md 就是 Codex 的那块交接板——而且是每次接班前都会先扫一眼的那块。

什么时候该往里加内容？
- Codex 第二次犯同一个错
- 你又敲了一遍上轮敲过的那句更正
- 代码审查时发现它本该知道这个代码库的某个约定
- 新队友需要同样的背景才能快速上手

最佳实践：**把它当反馈回路**——Codex 做了错误假设，别光在对话里纠正（一次性的），直接让它把修正写进 AGENTS.md。

## Codex 发现链（全局层 → 项目层 → 合并）

Codex 构建指令链分两步：

### 第一步：全局层（Global scope）

在 ~/.codex（或 $CODEX_HOME）里，Codex 先看有没有 `AGENTS.override.md`，有就用它；没有才读 `AGENTS.md`。**这一层只取第一个非空文件**，不会两个都读。

### 第二步：项目层（Project scope）

从项目根目录（通常是 Git 根）开始，一路往下走到当前所在目录。沿途**每个目录里只挑一个文件**，按这个优先级：
1. `AGENTS.override.md`
2. `AGENTS.md`
3. `project_doc_fallback_filenames` 里自定义的备选文件名

### 第三步：合并

从根到叶**依次拼接**，中间用空行隔开。**越靠近当前目录的文件，排在拼接结果越后面，优先级越高**。

**两个要点**：
1. **是拼接不是覆盖**——全局和项目同时生效，后面的不会整个顶掉前面的
2. **更近的赢**——冲突条目以靠后（更近）的为准

## AGENTS.override.md：Codex 独有的「临时盖章」

这是 Codex 独有的设计，Claude Code 没有对应物。

原理：在文件上盖一张「以此为准」的便签。它在时，同级的 AGENTS.md 被跳过；删了它，原来那份立刻恢复。

典型场景：
- **全局临时覆写**：~/.codex/AGENTS.override.md 写一套临时全局指导，原 AGENTS.md 不动
- **子目录特殊规则**：某子目录需要一套完全不同的规矩（如支付服务目录放 override）

关键理解：override 只在自己那一层二选一，不影响整条链的拼接规则。

## 该写什么 vs 不该写什么

### 该写的五类
| 类别 | 内容 |
|------|------|
| 项目概述 | 一句话说清项目定位 |
| 技术栈 | 语言、框架、数据库、关键工具 |
| 常用命令 | 测试、构建、lint 怎么跑 |
| 代码约定 | 风格、命名、硬性规范 |
| 明确的「不要做」 | 禁改文件、必须先确认的操作 |

### 不该写的
- ❌ 长篇大论的背景信息（公司介绍、产品愿景）
- ❌ 过时信息（换了包管理器却未更新）
- ❌ 看代码就能自证的东西（目录结构、ESLint/Prettier 规则）

### 大小红线
Codex 按**字节**算上限（Claude Code 按行数）：
- 默认 `project_doc_max_bytes = 32 KiB`（合并后总大小）
- 超了就被截断，可能把更重要的文件顶出窗口
- 撞上限：优先拆到多级子目录，其次精简，最后才抬上限

## 两个配置旋钮

### project_doc_fallback_filenames
让 Codex 认你已有的文件名（如 `TEAM_GUIDE.md`）。不在列表里的文件名一律忽略。

### project_doc_max_bytes
抬高合并上限（默认 32 KiB）。建议优先拆/删而非硬抬。

> ⚠️ 改完 config.toml 记得重启 Codex。

## 验证流程

三步验证法：
1. 建玩具项目：`mkdir agents-md-demo && cd agents-md-demo && git init`
2. 写精简 AGENTS.md（十几行即可）
3. 运行：`codex --ask-for-approval never "Summarize the current instructions."`——Codex 会复述它读到的指令

子目录覆写验证：在子目录放 AGENTS.override.md，Codex 在此目录干活时会优先使用 override 的规则。

## 深度分析

### AGENTS.md 是「上下文工程」的核心实践载体

AGENTS.md 与 CLAUDE.md 的兴起代表了 AI 工程领域一个更深层的趋势：**上下文工程（Context Engineering）**——将 AI 模型的隐性行为约束通过显式的、持久化的文档工程手段来实现。这本质上是「提示工程」的继承与升级：提示工程关注单轮对话中的指令设计，而上下文工程关注的是跨会话、跨项目的持久化指令体系。AGENTS.md 正是这一理念在产品层面的落地——它不仅是配置文件，更是团队与 AI 之间达成「隐式契约」的媒介。

### 发现链设计中的「Unix 哲学」基因

Codex 的 AGENTS.md 发现机制（全局层 → 项目层 → 子目录逐级 → 合并）在架构设计上与 Unix 的 `.bashrc`/`.profile` 继承链、Git 的 `.gitignore` 叠加规则一脉相承。这种**继承+覆盖+就近优先**的设计模式具有三个工程优势：全局约定可统一推行、团队可在项目级覆盖、个人可在子目录级微调。相比之下，Claude Code 的 CLAUDE.md 仅支持逐级加载而无显式 override 机制，灵活性略逊一筹。

### AGENTS.override.md：从「配置」到「动态编排」的跃迁

AGENTS.override.md 是 Codex 对比 Claude Code 最具差异化的设计。它不仅是一个配置机制，更是一种**动态指令编排能力**——允许在不修改基础文件的前提下临时替换指令集。这一设计在以下场景显示出独特价值：
- **A/B 测试**：在 override 中实验不同的指令策略，验证效果后固化到基础文件
- **紧急热修复**：生产环境出现指令误导时，override 可以秒级生效
- **上下文隔离**：不同类型的工作（开发 vs 审查 vs 部署）使用不同的 override 指令集

这是一个从「静态配置」向「动态编排」的范式跃迁——将 AGENTS.md 从「死文档」变成了「可编程的指令基础设施」。

### 字节上限 vs 行数上限：两种上下文管理哲学

Codex 按字节（默认 32 KiB）与 Claude Code 按行数（建议 ~200 行）的限制方式反映了不同的上下文管理哲学。字节计数更精确地反映 token 消耗，但增加了作者的心智负担（需要估算字节数）；行数计数对作者更友好，但不同行的实际 token 消耗差异巨大。实践中，两者都需要内容精简，但 Codex 的字节上限更容易触发「静默截断」——指令被无声地切掉，这是比可见错误更危险的故障模式。

### 「用 AI 改善 AI 指令」的元反馈回路

原文所述「让 Codex 把修正写进 AGENTS.md」代表了一种**元反馈回路**——不仅用 AI 处理任务，更用 AI 改进 AI 自身的指令系统。这与「AI 自我改进」的概念一脉相承，但应用层次更低、更容易落地：通过在 AGENTS.md 中积累 Codex 的错误假设修正，实现「每次错误都让系统变得更好」的正向循环。

## 实践启示

1. **将 AGENTS.md 当作活的工程产物而非静态文档**：AGENTS.md 的价值不在于写完的那一刻，而在于持续迭代的过程中。每次 Codex 做出错误假设，都应视为 AGENTS.md 需要更新的信号。建立「发现错误 → 写入 AGENTS.md → 验证 → 固化」的闭环流程。

2. **优先利用层级结构而非堆叠内容**：遇 32 KiB 上限时，优先通过子目录层级分散指令（每个子目录放专属的 AGENTS.md），而非提高上限。层级结构不仅绕开了大小限制，还自然地实现了「越具体的指令越靠近工作目录」的原则。

3. **用 override 机制实现「配置即编排」**：将 AGENTS.override.md 作为临时指令编排工具——分支切换、紧急修复、实验性策略都通过 override 实现，避免污染基础配置文件。完成验证后，将稳定的 override 内容合并回 AGENTS.md 并删除 override 文件。

4. **与团队共享 AGENTS.md 最佳实践**：AGENTS.md 不应是个人工具。团队应建立 AGENTS.md 的模板规范、Code Review 流程和定期更新机制。与 .gitignore 的管理流程类似——一人发现、全队受益。

5. **验证是确保指令生效的最后一道防线**：务必使用 `codex --ask-for-approval never "Summarize the current instructions."` 命令验证 AGENTS.md 是否被正确读取和解析。这条验证步骤在首次配置、重大修改或切换分支后尤其重要。

## 与 Claude Code 的 CLAUDE.md 对比

| 维度 | Codex AGENTS.md | Claude Code CLAUDE.md |
|------|----------------|----------------------|
| 文件名 | AGENTS.md / AGENTS.override.md | CLAUDE.md |
| 全局层 | ~/.codex/ | ~/.claude/ 等 |
| 子目录支持 | 逐级从 Git 根到当前目录 | 逐级加载 |
| override 机制 | ✅ AGENTS.override.md（独有） | ❌ 无 |
| 大小上限 | 按字节（默认 32 KiB） | 按行数（建议 200 行内） |
| 发现顺序 | override → AGENTS.md → fallback 文件名 | 逐级 CLAUDE.md |
| 拼接规则 | 拼接不覆盖，越近越优先 | 拼接不覆盖 |

---

