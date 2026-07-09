# Trellis vs Superpowers 源码对比：不同抽象层的工程框架

## Ch05.057 Trellis vs Superpowers 源码对比：不同抽象层的工程框架

> 📊 Level ⭐⭐ | 8.4KB | `entities/trellis-superpowers-source-code-comparison-abstraction-layer.md`

# Trellis vs Superpowers 源码对比：不同抽象层的工程框架

> **来源**：运维有术（术哥）"AI编程最佳实战「2026」"系列第 49 篇。基于 Trellis (mindfold-ai/Trellis, commit 2026-07-07) 和 superpowers (obra/superpowers, v6.1.1, commit 2026-07-05) 的本地源码静态分析。

## 核心差异：不同抽象层

| 维度 | Trellis | superpowers |
|------|---------|-------------|
| **自我定位** | engineering framework（工程框架） | methodology + skills（方法学） |
| **核心资产** | `.trellis/` 目录（7类持久化资产） | 14 个 SKILL.md + 1 个 bootstrap hook |
| **是否进仓库** | 进，git tracked，团队共享 | 不进，插件目录，个人安装 |
| **运行时依赖** | Node ≥18 + Python ≥3.9，CLI + Python 脚本 | 零运行时脚本，纯 Markdown |
| **License** | AGPL-3.0 | MIT |
| **主要语言** | TypeScript CLI + Python 脚本 | Shell + Markdown |

## Trellis：重资产工程框架

### `.trellis/` 目录结构（7 类资产）

```
.trellis/
├── workflow.md     # 708 行的工作流"宪法"
├── config.yaml     # 项目级配置
├── spec/           # 按 package/layer 组织的项目规范（人 + AI 共写）
├── tasks/          # 每个任务一个目录：prd.md / design.md / implement.md / *.jsonl
├── workspace/      # 按开发者分的 session 日志（journal-N.md）
├── agents/         # 子代理定义：architect / check / implement / plan / research
└── scripts/        # Python 脚本：task.py / get_context.py / add_session.py
```

### 内部 3-Phase 状态机（workflow.md）

与 README 对外宣传的"四阶段循环 Plan → Implement → Verify → Finish"不同，内部真实状态机只有 3 个 Phase：

```
Phase 1: Plan   → 分类请求、获取建任务许可、产出规划产物
Phase 2: Execute → 仅在 task.py start 之后才开始改码
Phase 3: Finish  → 验证、回写 spec、提交、归档
```

状态迁移靠 `task.py start` 和 `task.py archive` 完成。[workflow-state:STATUS] breadcrumb 契约是逐轮对话里仅有的信号源——hook 在每个对话开头注入 AI 当前阶段和下一步指示。

### mem 子系统（被低估的杀手锏）

`packages/core/src/mem/` 下的跨会话记忆检索系统：

- `phase.ts`：按工作流阶段过滤
- `filter.ts`：按来源/角色过滤
- `dialogue.ts`：把原始 session 转成干净对话
- CLI 入口：`trellis mem list / search / context / extract / projects`

### channel 子系统（多 worker 协作）

- `trellis channel spawn` 能起独立 worker
- `config.yaml` 有 `worker_guard`（idle_timeout: 5m、max_live_workers: 6）做 OOM 防护

### 20 个 configurator

`packages/cli/src/configurators/` 下正好 20 个文件（antigravity、claude、codebuddy、codex、copilot、cursor、devin、droid、gemini、kilo、kiro、opencode、pi、qoder、reasonix、trae、zcode……），把同一份 `.trellis/` 翻译成各平台能识别的 hooks/commands/agents 配置。

### Task 状态机

`task.py` 完整状态机：`planning → in_progress → completed → archived`。配合 `implement.jsonl` / `check.jsonl` 上下文清单，任务可跨 session、跨平台 resume。清单在任务创建时播种，子代理 dispatch 时 hook 自动注入清单引用。

## Superpowers：轻提示方法学

### 14 个 skill 清单（v6.1.1）

1. `brainstorming` — 苏格拉底式设计细化，HARD-GATE
2. `writing-plans` — 拆成 2-5 分钟可执行任务
3. `executing-plans` — 批量执行 + 人类 checkpoint
4. `subagent-driven-development` — fresh 子代理 + 两阶段评审
5. `dispatching-parallel-agents` — 并发子代理工作流
6. `using-git-worktrees` — 隔离工作树开发
7. `test-driven-development` — RED-GREEN-REFACTOR
8. `systematic-debugging` — 4 阶段根因分析
9. `verification-before-completion` — 完成前必须验证
10. `requesting-code-review` — 评审前置清单
11. `receiving-code-review` — 回应纪律
12. `finishing-a-development-branch` — merge/PR/丢弃决策
13. `writing-skills` — 写新 skill 的规范
14. `using-superpowers` — 启动时注入的 bootstrap 元 skill

### 触发机制：description 强约束措辞

- 唯一 hook：`hooks/hooks.json` 注册 SessionStart，注入 `using-superpowers`
- 之后所有 skill 触发靠 AI 自主判断
- description 措辞极强："YOU ABSOLUTELY MUST invoke the skill."
- 无运行时脚本，无仓库侵入，无持久化状态

### SDD v6.0 重写（2026-06-16）

流程：读计划 → 建全局 todo → 每个任务 dispatch fresh implementer → implementer 自评写 diff → dispatch task reviewer（两阶段评审：spec 合规 + 代码质量）→ 不通过则 dispatch fix 子代理 → 全部完成后 dispatch final code reviewer → 决策合并

关键设计：**continuous execution**——任务之间不暂停问人，除非 BLOCKED 或全完成。官方声称快 ~2x、省 ~50% token（自测数据）。

### v6.1.0 轻量化（2026-06-30）
- 压缩 `using-superpowers` bootstrap（删 graphviz 图、折叠 Instruction-Priority 段、删工具映射表）
- 移除 Gemini CLI 支持
- Codex 不再装 SessionStart hook（Codex 自有 skill 触发，hook 反而降 UX）

### v6.1.1 bugfix（2026-07-02）
- 修复 v6.1.0 引入的 Codex hook 回退 bug

## 设计哲学对比：物理注入 vs 行为约束

| Trellis | superpowers |
|---------|-------------|
| spec 文件**物理注入**到子代理 prompt | 靠 AI **自觉读** description 规则 |
| AI 不用记得，照着上下文执行 | AI 必须主动记得调用 skill |
| 更工程化，更可控 | 更轻量，依赖模型服从度 |
| 代价：维护 spec/hook/.trellis/ 复杂度 | 代价：AI 可能不遵守 |

## 10 维决策框架

| 维度 | 占优 | 证据强度 | 适用场景 |
|------|------|----------|----------|
| AI 长期记忆 | **Trellis** | 极强（mem SDK vs 无） | 长期项目、多人协作 |
| 项目规范沉淀与团队共享 | **Trellis** | 极强（spec 进 git vs 插件目录） | 团队工程化 |
| 任务/PRD 全生命周期 | **Trellis** | 强（task.py 状态机 vs 无跟踪） | 多天多 session 任务 |
| 多平台一份配置复用 | **Trellis** | 强（20 configurator vs 每平台装） | 多工具混用团队 |
| 学习/部署成本 | **superpowers** | 强（一行命令 vs init + 团队共识） | 个人/临时项目 |
| TDD/调试纪律 | **superpowers** | 中（独立 skill vs check 附带） | TDD 信仰者 |
| 子代理评审工程化 | **superpowers** | 中（SDD + eval vs agents/*.md） | 量化质量追求者 |
| License 友好度 | **superpowers** | 极强（MIT vs AGPL-3.0） | 企业/闭源商用 |
| 生态/作者可信度 | **superpowers** | 中（RT 作者 + eval + 商业支持） | 风险厌恶型选型 |
| 仓库侵入性 | **superpowers** | 强（零侵入 vs .trellis/ 目录） | 仓库洁癖 |

## 重要陷阱

1. **Hook 依赖风险**：breadcrumb 协议完全依赖 hook 注入。如果平台不支持 hooks，整个工作流会瘸
2. **README ≠ 源码**：Trellis 对外四阶段 vs 内部三阶段状态机，"千万别被命名绕晕"
3. **AGPL-3.0 企业雷**：网络使用即触发源码公开义务，企业落地法务必问
4. **记忆需要场景**：Trellis 的 mem/spec/task 在长期团队项目中才兑现价值，个人使用过度工程

## 选型建议

- **个人开发者、临时项目、信仰 TDD** → superpowers：轻、纪律硬、License 干净
- **团队工程化、长期项目、多平台混用** → Trellis：记忆和 spec 沉淀的价值在此兑现
- **企业落地、有法务审核** → 确认 AGPL 接受度，否则 superpowers 更稳
- **两个都用** → 完全可行：superpowers 约束个人习惯，Trellis 做团队工程沉淀

## 互补关系

- → [GSD vs OpenSpec vs Superpowers 源码对比](ch05/075-gsd-openspec-superpowers-context-rot.html)（同一作者的前作，聚焦 context rot）
- → [Superpowers v6 SDD 重写](https://github.com/QianJinGuo/wiki/blob/main/entities/superpowers-6-sdd-review-redesign-file-handoff.md)（SDD 细节补充）
- → [Superpowers 深度解析](ch05/081-ai.html)（superpowers 全景）

---

