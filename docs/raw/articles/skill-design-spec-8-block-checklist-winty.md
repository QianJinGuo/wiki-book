---
title: "AI 总跑偏？Skill 太人话了：企业级 Skill 8 块最小骨架 + 8 条 checklist"
source_url: https://mp.weixin.qq.com/s/pwm9e_wMhqlbBh8ICWJWxQ
ingested: 2026-06-02
sha256: 755cf5e9c5959ea1fcf54d7181aa84635c419b54ad2f48bcef6153620aa773c3
author: "winty"
feed: "前端Q"
published: 2026-06-02
tags: [skill-design, skill-specification, skill-hub, hermes-agent, winty, skill-template, enterprise-skill, agent-skill, when-to-use, verification, failure-handling]
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

**8 块听起来多，其实每一块都对应"如果不写就会出事"的场景。**

## 3. 8 块逐一拆解

### ▎1. 元数据 frontmatter：让 Skill 进入治理体系

很多人写 Skill 直接从内容开始，没有 frontmatter。**意味着 Skill Hub 拿不到任何结构化信息**：版本未知、owner 未知、是否废弃未知、需要什么工具未知。

最低限度 frontmatter 字段：

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

少写一个字段，对应的那条治理通道就断了。

### ▎2. When to use：让 Agent 知道什么时候用

**最容易被写成"使用场景"**——但 Hermes 官方 Skill 模板强调的是**触发条件**。

**差别在哪**：
- "使用场景"是给人看的："这个 Skill 用于处理紧急线上故障"
- "触发条件"是给 Agent 用的：可逐条对照上下文判断

正确写法（可对照清单）：

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

正确写法（显式参数化）：

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

**Verification 必须显式写**：

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

## 4. 完整可复用 Skill 模板

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

## 5. 8 条 checklist 评判可上线性

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

## 6. 我的判断

很多人写 Skill 第一反应是"AI 反正聪明，写糙一点没事"。

**但企业里 AI 落地真正的痛，从来不是 AI 不够聪明，而是 AI 不够稳定。**

不稳定的根源，往往不在模型，而在 Skill 写得不规范：
- 触发条件含糊 → Skill 在不该用的时候被用
- Steps 没写清判断条件 → Agent 自己脑补
- 没有 Verification → "看起来成功"
- 没有 Failure handling → 出事之后越补越糟

> **把 Skill 当成"程序"来写，而不是当成"备忘"来写，是企业级 AI 系统迈向可治理的第一步。**

---

- 原文：winty / 前端Q / 2026-06-02
- 系列：Hermes Agent：构建自进化 Agent 系统
- 下一篇预告：写完 Skill 之后，怎么管它的版本（v1 改 v2 如何避免"越改越差"）

## 进一步阅读

- Hermes Agent Skills 模板：https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
- Anthropic：Effective tool use with Claude（关于 schema 和指令明确性的部分）
