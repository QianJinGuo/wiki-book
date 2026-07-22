---
source_url: "https://guoxudong.io/post/skills-for-real-engineers"
source_title: "Skills For Real Engineers：把工程基本功装进 AI Agent"
source_author: "顾旭东"
ingested: 2026-07-08
sha256: "ca30b0c0136fae3457f43acd1bbc63bdf25995fedc5b47a815563ae2f8e20255"
type: raw-source
status: ingested
tags: [ai-agent, claude-code, codex, skills, engineering, matt-pocock]
---

# Skills For Real Engineers：把工程基本功装进 AI Agent

> 顾旭东对 Matt Pocock 开源项目 Skills For Real Engineers 的深度分析。
> 原文链接：https://guoxudong.io/post/skills-for-real-engineers

## AI 时代加速的不是代码，而是工程问题

很多 AI 编程工具的问题不是"不会写代码"，而是太快了。它可以很快写出一大段实现，也可以很快把一个误解放大成一整套错误设计。需求没对齐、领域语言没讲清、测试反馈不足、架构边界松散——这些老问题到了 Agent 时代不会消失，只会被加速。

Skills For Real Engineers 的副标题写得很直白：**给真实工程师用的 skills，不是 vibe coding**。

## 四类失控

### 1. 对齐失败
你以为 Agent 明白了需求，等它交付才发现理解的是另一个问题。
- `grill-me`：在开工前让 Agent 追问细节
- `grill-with-docs`：把含糊的计划逼到足够明确

### 2. 语言失配
人和系统里的概念没有统一，Agent 用泛泛的描述绕来绕去。
- `grill-with-docs` 把会话里的领域语言沉淀到 `CONTEXT.md` 和 ADR 里

### 3. 反馈不足
Agent 写了代码，但没有可靠方式知道它是否真的工作。
- `tdd`：红绿重构循环，先写失败测试再实现
- `diagnose`：复现 → 最小化 → 假设 → 插桩 → 修复 → 回归测试的诊断循环

### 4. 架构失控
Agent 能加速编码，也能加速软件熵。
- `zoom-out`：修改陌生代码前先解释它在系统里的位置
- `improve-codebase-architecture`：用已有领域语言和 ADR 寻找"加深模块"机会

> 工程主线：**先做判断，尽快得到反馈，把经验写进仓库。**

## 小而可组合 vs. 全流程接管

Matt 在 README 中提到：GSD、BMAD、Spec-Kit 等方法试图接管流程来帮你交付，但也可能把控制权拿走，让流程自身的 bug 更难修。

Skills For Real Engineers 的选择：**每个 skill 尽量小，容易改，能和其他 skill 组合**。

分类体系：
- `engineering`：日常代码工作（diagnose, tdd, to-prd, to-issues, triage, zoom-out）
- `productivity`：通用工作流（grill-me, handoff, teach, write-a-skill）
- `misc`：不常用但实用的工具（git-guardrails, setup-pre-commit, migrate-to-shoehorn）
- `personal`, `in-progress`, `deprecated`：边界明确

## /setup-matt-pocock-skills 是入口，不是装饰

安装：`npx skills@latest add mattpocock/skills`

Setup skill 问三个问题：
1. 你用哪个 issue tracker
2. triage 时使用哪些标签
3. 文档要保存在哪里

这不是安装向导。它是在给仓库建立一层 **Agent 可读的项目配置**。

to-issues / to-prd / triage 需要知道 issue 写到哪里；triage 需要知道真实标签和 triage role 映射；grill-with-docs 和架构类 skill 需要知道 CONTEXT.md、ADR、agent 文档的位置。setup 把这些约束落成文件，让其他 skill 消费。

## 共享语言（Ubiquitous Language）

项目很重视 CONTEXT.md。里面明确定义了"Issue tracker""Issue""Triage role"等术语，并标出哪些词应该避免。

这不是文档洁癖。Agent 在代码库里最怕同一个概念有三种叫法。今天叫 ticket，明天叫 backlog item，后天叫 issue，模型每次都要猜。这和 DDD 的 ubiquitous language 很接近，区别是：过去主要服务人类协作，现在也服务 Agent 协作。

## 工程基本功可执行

- "开工前想清楚"→ `grill-me`
- "别只靠模型自信"→ `tdd` 和 `diagnose`
- "先理解系统再改代码"→ `zoom-out`
- "把大计划拆成独立交付任务"→ `to-issues`
- "不让架构变泥球"→ `improve-codebase-architecture`

这些动作不新。变化在于：它们被打包成 Agent 每次都能调用的工作流，不再依赖工程师临场提醒。

## 适合什么团队

- 已经在用 Claude Code、Codex 等 coding agent，感到上下文/规则/反馈不稳定
- 团队有 issue、ADR、测试和代码评审流程，希望 Agent 接入现有工程系统
- 个人开发者想沉淀工程习惯为可复用 skill

前提：得愿意维护这些 skill 和文档。CONTEXT.md 会过期，ADR 会漏写，标签词汇会变。

## 对 Codex 用户的启发

1. **别把 AGENTS.md 写成百科全书**——当路标，告诉 Agent 去哪找项目规则
2. **把高频工程动作做成 skill**——需求追问/TDD/问题诊断/PRD 到 issue 拆分/架构审视
3. **让 skill 消费项目事实**——issue tracker、标签、文档目录、测试命令、ADR 位置是明确配置
4. **保留人的控制权**——Agent 是放大器，不是替身

## 结语

AI 编程的下一个分水岭，可能不是谁的模型更会写代码，而是谁更会把工程系统设计成 Agent 能稳定参与的样子。

答案很朴素：需求要问清楚，语言要统一，测试要先行，诊断要有循环，架构要持续投资。这些都是老基本功，只是在 Agent 时代需要从人的习惯变成**仓库里可执行的技能**。
