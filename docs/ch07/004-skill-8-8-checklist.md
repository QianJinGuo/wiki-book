# 企业级 Skill 8 块最小骨架 + 8 条 checklist 设计规范

## Ch07.004 企业级 Skill 8 块最小骨架 + 8 条 checklist 设计规范

> 📊 Level ⭐⭐ | 24.2KB | `entities/skill-design-spec-8-block-checklist-winty.md`

# 企业级 Skill 8 块最小骨架 + 8 条 checklist 设计规范

## 概述

winty（前端Q）2026-06-02 关于**企业级 Skill 设计规范**的完整论述（Hermes Agent 系列第 4 篇）。核心命题：**Skill 不是文档，是程序**——Agent 不会脑补，任何含糊都会导致执行偏离。系统提出 8 块最小骨架（frontmatter 元数据 / When to use / Do not use when / Inputs / Steps / Verification / Failure handling / Pitfalls & Examples）+ 8 条 checklist 评判标准 + 完整可复用 frontend-release-check 模板。

## 核心命题

> **Skill 不是文档，是程序。**

写文档可以模糊、可以省略、可以靠"读者自己脑补"。**但 Skill 不一样——Agent 不会脑补**。

Agent 会：
- 逐字读 Skill
- 按写的步骤执行
- 按写的判断条件分支
- 按写的失败处理 fallback

**任何一处含糊，要么 Agent 跳过这一步，要么 Agent 自己编一套，要么 Agent 直接卡住问你**。

### 第一原则

> **写 Skill 的时候，要假设这个 Skill 之后会被一个不熟悉业务的实习生 Agent 反复执行。**
>
> 每一步都得明确。每个判断都得有依据。每个失败都得有 fallback。 

## 8 块最小骨架总览

```
---
name: kebab-case-name
version: 1.0.0
owner: team-or-person
status: active | deprecated | experimental
last_updated: 2026-04-30
tags: [domain, scenario]
required_tools: [git, kubectl, jira-mcp]
required_permissions: [read:repo, write:branch]
---

## When to use
## Do not use when
## Inputs
## Steps
## Verification
## Failure handling
## Pitfalls
## Examples
```

**8 块看起来多，但每一块都对应"如果不写就会出事"的场景。**

## 8 块逐一拆解

### ▎1. 元数据 frontmatter：让 Skill 进入治理体系

很多人写 Skill 直接从内容开始，没有 frontmatter。**意味着 Skill Hub 拿不到任何结构化信息**：版本未知、owner 未知、是否废弃未知、需要什么工具未知。

**最低限度字段及对应治理通道**：

| 字段 | 作用 | 治理通道 |
|------|------|---------|
| `name` | 稳定标识，不允许重名，建议 kebab-case | 检索 |
| `version` | 语义化版本 | 升级路径 |
| `owner` | 到具体人或团队，**不要写 "platform-team" 这种模糊词** | 通知 |
| `status` | active / deprecated / experimental | 检索 |
| `last_updated` | 超过 90 天没更新自动告警 | 维护提醒 |
| `tags` | 检索用（release/incident/db） | 检索 |
| `required_tools` | 声明需要哪些 tool / MCP | 运行时检查 |
| `required_permissions` | 声明需要的权限范围 | **运行时拦截** |

**`required_tools` 和 `required_permissions` 是企业里最容易被忽视的两块**：
- 没有声明的工具 → 执行失败
- 没有声明的权限 → 治理层**直接拦截**

> 少写一个字段，对应的那条治理通道就断了。

### ▎2. When to use：让 Agent 知道什么时候用

**最容易被写成"使用场景"**——但 Hermes 官方 Skill 模板强调的是**触发条件**。

**差别**：
- "使用场景"是给人看的："这个 Skill 用于处理紧急线上故障"
- "触发条件"是给 Agent 用的：可逐条对照上下文判断

```markdown
## When to use

Use this skill when ALL of the following conditions are met:
- The user is reporting a production incident
- The incident has been confirmed in monitoring (not a user-side issue)
- The affected service is one of: payment, checkout, order
- The current on-call engineer is the user themselves
```

Agent 看到这种写法，会**逐条对照当前上下文是否满足**，再决定要不要用这个 Skill。

### ▎3. Do not use when：明确的边界比触发条件更重要

太多事故的根源：Skill 写了"什么时候用"，但**没写"什么时候绝对不能用"**。Agent 在边缘场景上自由发挥，结果跑出问题。

**这一节本质上是 Skill 的"禁飞区"**。Hub 里所有涉及生产数据、支付、用户隐私、批量改动的 Skill，**必须显式声明禁飞区**：

```markdown
## Do not use when
- The user is in a sandbox or test environment but asks for prod-level checks
- The action would touch the payment flow without explicit user confirmation
- The on-call schedule shows another engineer is actively handling the incident
```

### ▎4. Inputs：把模糊的"上下文"变成显式参数

很多 Skill 不写 Inputs → 同一个 Skill 在不同调用方身上表现完全不同。

**反例**：一个"代码评审 Skill"，A 团队默认看安全漏洞，B 团队默认看性能——不显式写 Inputs，Agent 只能靠对话上下文**猜**，猜错就翻车。

```markdown
## Inputs
- repo_path (required): absolute path to the local repo
- review_focus (optional, default="general"):
  - "general" – correctness, readability
  - "security" – vulnerability scan
  - "performance" – hot path analysis
- target_branch (optional, default="main")
```

**隐藏好处**：未来 Skill Hub 做评估时，可以**直接拿 Inputs 当测试参数**。

### ▎5. Steps：可执行、可检查、可失败的步骤

这是 Skill 的核心。"差 Skill"几乎都死在 Steps 上。

**差写法**：
```markdown
1. 拉代码
2. 跑测试
3. 部署
```

**好写法**（每一步都是可执行单元）：

```markdown
1. **Pull latest code**
   - Run `git pull --rebase origin main`
   - If rebase has conflicts, abort and notify the user
   - Verify HEAD matches remote with `git status`

2. **Install dependencies if lockfile changed**
   - Compare current lockfile hash with last successful build
   - If different, run `pnpm install --frozen-lockfile`

3. **Run quality gates in this order**
   - `pnpm lint` – must pass
   - `pnpm typecheck` – must pass
   - `pnpm test` – must pass
   - `pnpm build` – must pass
   - If any step fails, stop and report which step failed
```

**每一步要满足三个条件**：
- **可执行**：写明确的命令或工具调用，不要写"做某事"
- **可检查**：写清楚成功/失败的判断条件
- **可失败**：失败之后明确该做什么（停止/跳过/fallback）

> 特别强调"可失败"——这是新手最容易忽略的。Agent 一旦在中间一步出错，没有失败处理就会**瞎补救，最后越补越糟**。

### ▎6. Verification：怎么知道这次执行真的成功了

**被严重低估的部分**。很多 Skill 写完 Steps 就完了——Agent 把命令跑完一遍，然后宣布"完成"。

> **"命令成功执行" ≠ "任务真的完成"。**

**4 个经典反例**：
- `pnpm test exit 0`，但其实跳过了一半测试
- `git push` 成功，但 push 到了错的分支
- `kubectl apply` 成功，但 Pod 还没真正起来
- `curl 200`，但返回的是缓存页面

```markdown
## Verification

After completing all steps, verify:
- `git log -1` shows the expected commit hash
- The CI run on the new commit is green within 5 minutes
- The deployed pod count matches replicas declared in manifest
- The health check endpoint returns 200 with the new build hash

If any of these fail, do NOT report success.
```

> **Verification 是 Skill 走出"我跑完了"和"我做对了"的分水岭。** 

### ▎7. Failure handling：失败之后该干嘛

**每一个企业级 Skill 都必须假设："这一步是会失败的。"**

失败处理至少要回答三件事：
1. 哪一步失败的？
2. 已经做到什么状态？
3. 接下来该做什么（重试 / 回滚 / 通知人）？

```markdown
## Failure handling

If any step fails:
1. Capture the failed step name and error message
2. Snapshot current state:
   - Current git HEAD
   - Local uncommitted changes
   - Last 50 lines of relevant logs
3. Decide recovery action:
   - lint/typecheck/test failure → report and stop, do not deploy
   - build failure → check if cache is stale, retry once with clean cache
   - deploy failure → run `kubectl rollout undo` and notify on-call
4. Always leave the working tree in a recoverable state
```

> 这一段非常关键。后面讲 Skill **稳定性评估和回滚机制**时，全都依赖 Skill 自己有"知道怎么收拾烂摊子"的能力。

### ▎8. Pitfalls 与 Examples：把踩过的坑写进 Skill

**这一节是 Skill 越用越聪明的体现**——每一次 Skill 在线上踩了坑，都应该把坑沉淀回来。

```markdown
## Pitfalls

- ❌ Don't run `pnpm install` without `--frozen-lockfile` in CI; it silently bumps versions
- ❌ Don't deploy on Friday after 16:00 unless explicitly approved
- ❌ Don't trust local `pnpm test` if `node_modules` is older than 24h; reinstall first
- ❌ Don't assume the user knows the staging URL; always print it explicitly
```

Examples 用"对话片段 + 期望行为"给 Agent 参照：

```markdown
## Examples

### Example 1: 标准发版
User: "帮我发版到 staging"
Agent: 检查工作树 → 跑全套测试 → build → 部署 staging → 提示需要人工 QA 的页面

### Example 2: 发版前发现脏工作树
User: "帮我发版"
Agent: 发现未提交变更 → 列出变更文件 → 询问用户是否要 stash → 不要自动 commit
``` 

## 完整可复用 Skill 模板

把 8 块串起来就是企业里立刻可上线的模板：

```yaml
---
name: frontend-release-check
version: 1.0.0
owner: zhang@team-frontend
status: active
last_updated: 2026-04-30
tags: [release, frontend, ci]
required_tools: [git, pnpm, kubectl, vault-mcp]
required_permissions: [read:repo, write:branch, read:vault]
---

## When to use
Use when ALL conditions are met:
- The user explicitly asks for a frontend release
- The target environment is one of: staging, prod
- The current branch is `main` or a release branch

## Do not use when
- The user is on a feature branch and hasn't merged to main
- The change touches `pages/payment/*` without QA sign-off
- It's after 16:00 on Friday in production environment

## Inputs
- environment (required): staging | prod
- skip_qa_check (optional, default=false)

## Steps
1. **Pull and verify clean tree**
2. **Install deps if lockfile changed**
3. **Run quality gates: lint → typecheck → test → build**
4. **Pull env vars from vault**
5. **Deploy and wait for rollout**
6. **Run smoke tests**

## Verification
- `kubectl rollout status` reports success
- `/healthz` returns 200 with the new commit hash
- All declared smoke tests pass

## Failure handling
- Quality gate failure → stop, report
- Build failure → retry once with clean cache
- Deploy failure → rollout undo, notify on-call
- Smoke test failure → rollout undo, snapshot logs, notify on-call

## Pitfalls
- ❌ Never deploy with uncommitted changes
- ❌ Never deploy if last test run is older than 1h
- ❌ Always verify staging URL before claiming success

## Examples
（略：见 examples 目录）
```

**这个模板看着复杂，但写完一次之后，组织里所有发版动作都可以以它为基线。**

## 8 条 checklist 评判可上线性

| # | 检查项 | 判断 |
|---|--------|------|
| 1 | frontmatter 完整且有 owner | Y / N |
| 2 | 触发条件具体到可对照 | Y / N |
| 3 | 显式声明了禁飞区 | Y / N |
| 4 | Inputs 有默认值与类型说明 | Y / N |
| 5 | 每一步都可执行、可检查、可失败 | Y / N |
| 6 | Verification 写明了怎么算成功 | Y / N |
| 7 | Failure handling 覆盖主要失败场景 | Y / N |
| 8 | Pitfalls 至少写了 3 条踩过的坑 | Y / N |

> **8 条全 Y 才是企业级可上线的 Skill。少一条都先别进 Hub。**

## 核心判断

很多人写 Skill 第一反应是"AI 反正聪明，写糙一点没事"。

**但企业里 AI 落地真正的痛，从来不是 AI 不够聪明，而是 AI 不够稳定。**

不稳定的根源，往往不在模型，而在 Skill 写得不规范：
- 触发条件含糊 → Skill 在不该用的时候被用
- Steps 没写清判断条件 → Agent 自己脑补
- 没有 Verification → "看起来成功"
- 没有 Failure handling → 出事之后越补越糟

> **把 Skill 当成"程序"来写，而不是当成"备忘"来写，是企业级 AI 系统迈向可治理的第一步。** 

## 与现有 skill-writing 实体的差异化

| 维度 | 本文（winty） | 现有 `agent-skill-writing-guide`（10.9KB） |
|------|--------------|---------------------------------------|
| 视角 | **企业级 / Skill Hub 治理** | **个人 agent / Prompt 注入** |
| 核心框架 | **8 块最小骨架 + 8 条 checklist** | Skill = 岗位说明书 + SOP + 避坑指南 |
| 触发条件 | **明确 vs 使用场景的差别** | description 字段编写（提及但未深入） |
| 禁飞区 | **独立"Do not use when"块** | 无 |
| Verification | **"我跑完了" vs "我做对了" 分水岭 + 4 个反例** | 无 |
| Failure handling | **三件事（哪步/状态/恢复）+ 完整模板** | 无 |
| Steps 质量 | **可执行/可检查/可失败三原则** | 一般性建议 |
| 完整模板 | **frontend-release-check 可复用 YAML** | 无 |
| 评判标准 | **8 条 checklist 量化** | 无 |

**关键判断**：本文是**企业级 Skill 设计规范的工程化完整方案**，与现有 skill-writing 实体的"个人 agent 视角"完全不同。**新 entity 决策正确**。

## 系列上下文

本文是 winty 关于 Hermes Agent 的第 4 篇，构成完整闭环：

| # | 主题 | 关注点 |
|---|------|--------|
| 1 | 100 个 AI 同时跑，谁来管权限？ | 多 Agent 权限 |
| 2 | Skill 系统：经验沉淀 | 个人 agent 视角 Skill |
| 3 | Skill Hub：组织资产化 | 企业组织视角 |
| **4** | **Skill 8 块骨架 + 8 条 checklist** | **设计规范/工程化** |
| 5（下一篇） | Skill 版本管理 | v1 → v2 怎么避免越改越差 |

## 深度分析

### 3.1 触发条件设计决定 Skill 可用性上限

winty 在本文中反复强调"触发条件"与"使用场景"的区别，这是一个被大多数 Skill 设计者忽略的核心问题。使用场景是给人看的叙事性描述，触发条件是给 Agent 用的可执行判断清单。

从工程视角看，触发条件的质量直接决定 Skill 在生产环境中的**精确率（Precision）**和**召回率（Recall）**。一个好的触发条件应该满足：上下文可枚举、边界可判断、Agent 无需额外推理。如果触发条件写得像"当用户需要发布前端时使用"，Agent 在实际场景中只能靠猜测。反之，如果写成"用户明确说出'发布'或'deploy'，且当前分支是 main 或 release/*，且不是周五 16:00 后"，Agent 的执行路径就是确定性的。

这个差异在单人 Agent 场景下不明显，但在企业多 Agent 协作环境中，模糊触发条件会导致 Skill 被错误调用，进而引发连锁反应。

### 3.2 Failure handling 是 Skill 可治理性的分水岭

本文提出的"失败处理三件事"框架——哪一步失败、当前状态是什么、下一步怎么做——本质上是将**运维思维**引入 Skill 设计。大多数 Skill 失败不是因为执行出错，而是因为出错后 Agent 盲目重试或跳过，导致状态污染。

Failure handling 的完整性决定了 Skill 的**自愈能力**。一个有完整 Failure handling 的 Skill，在部署失败时可以自动回滚；在测试失败时可以保留现场供人工介入；在依赖工具不可用时可以切换到替代方案。没有 Failure handling 的 Skill，一旦出错就成为"孤儿进程"——既不工作也不死亡，只是卡在未知状态消耗资源。

这个观点与企业 IT 运维中的"可观测性"理念高度一致：Skill 需要输出明确的失败信号，而不是沉默失败。

### 3.3 Verification 解决的是"信任代理"问题

winty 提出的"命令成功执行 ≠ 任务真正完成"是本文最具工程深度的观点。在多 Agent 系统中，每个 Agent 都需要向其他 Agent 或人类证明自己完成了任务，而证明的依据不是"我跑完了"，而是"我验证了结果的正确性"。

Verification 的设计本质上是在构建**信任链条**。当 Skill A 调用 Skill B 时，Skill B 如果只报告"执行成功"而没有 Verification 数据，Skill A 就无法判断 B 是否真的完成了任务。这种情况下，多 Agent 系统的可靠性会随着调用层级增加而指数级下降。

因此，Verification 不仅是 Skill 的质量门禁，更是多 Agent 协作中的**信任传递机制**。

### 3.4 八块骨架与知识治理的对应关系

将 frontmatter 的八个字段对应到治理通道，是本文最有结构化价值的贡献。在传统 IT 治理中，配置管理数据库（CMDB）承担类似角色——但 CMDB 依赖人工维护，而 Skill 的 frontmatter 是结构化数据，可被系统直接消费。

这种设计让 Skill Hub 具备了两个关键能力：**运行时检查**（required_tools、required_permissions 在执行前拦截不合规调用）和**维护管理**（last_updated 触发过期告警、owner 定向通知）。这是从"文档化管理"到"系统化管理"的关键跃迁。

### 3.5 模板可复用性是组织级 Skill 资产化的基础

frontend-release-check 模板的价值不在于模板本身，而在于它证明了**Skill 是可复制的组织资产**。当一个团队验证了一个 Skill 的有效性，其他团队可以以其为基线定制，零成本复用最佳实践。

这与软件工程中的"模式语言"概念相通——好的 Skill 模板不是限制创造力，而是降低认知成本，让设计者聚焦在业务差异上而不是通用流程上。

## 实践启示

### 4.1 将触发条件改写为可执行判断清单

在设计任何 Skill 时，第一件事不是写 Steps，而是写 When to use 的触发条件。检验标准：把这个条件交给一个不了解业务的 Agent，它能否无需额外推理就判断出是否该用这个 Skill？如果答案是"不确定"，就继续细化。

建议用"All of the following conditions are met"格式，每条条件都是上下文中可直接验证的事实（用户说了某句话、在某个分支、当前时间等），而不是模糊的概念（用户想发布、生产环境）。

### 4.2 在 Steps 中为每个命令编写失败分支

不要写裸命令，而是写"命令 + 预期输出 + 失败处理"。例如：`git pull --rebase origin main` 后面跟着"If rebase has conflicts, abort and notify the user"。这样 Agent 在遇到非预期结果时不会卡住或盲目重试。

### 4.3 Verification 必须包含结果验证而非状态验证

很多 Skill 的 Verification 只检查"命令是否成功"，而不检查"结果是否正确"。正确的 Verification 应该检查：数据是否落地、外部系统是否可见、关联流程是否触发。例如：部署命令成功后检查 health endpoint 返回的 commit hash 是否匹配。

### 4.4 为每个 Skill 编写至少 3 条真实踩坑记录

Pitfalls 不是设计时想象出来的警告，而是实际上线后沉淀下来的真实案例。建议在 Skill 上线后 2 周内复盘，将真实发生的错误写入 Pitfalls。每条 Pitfalls 应该包含具体的命令或操作，以及因此导致的后果。

### 4.5 用 frontmatter 的 required_permissions 实现运行时拦截

不要把权限检查留给 Agent 事后判断。在 frontmatter 中显式声明 required_permissions，当 Skill 被调用时，治理层可以直接拦截未授权的调用，而不是让 Agent 执行到一半才发现权限不足。这个设计将权限治理从"事后审计"变成"事前拦截"。

## 进一步阅读

- Hermes Agent Skills 模板：https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
- Anthropic：Effective tool use with Claude（关于 schema 和指令明确性的部分）

---

## 相关实体
- [Skill Hub Organization Asset Winty](/ch07-001-skill-hub-企业级-ai-经验资产化的关键-组织能力视角-winty-前端q-3-篇合集-组织资产-质量//)
- [Openspec Spec Driven Development Trae Solo](/ch05-023-openspec-规范驱动开发-sdd-框架-proposal-design-tasks-specs-四类文档意图锁//)
- Skills Refiner Design Quality Evaluation Framework
- [Perplexity Internal Skill Design Guide](/ch07-018-perplexity-内部-skill-设计指南-四维体系与维护方法论//)
- [Hermes Skill System Winty](/ch04-135-skill-系统-agent-如何把经验沉淀成可复用能力//)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-design-spec-8-block-checklist-winty.md)
- [skill 产品哲学：歸藏做了爆款 skill 后的产品反思](/ch07-014-skill-产品哲学-歸藏做了爆款-skill-后的产品反思//)

---

