# Trellis vs Superpowers 源码对比：不同抽象层的工程框架

## Ch05.041 Trellis vs Superpowers 源码对比：不同抽象层的工程框架

> 📊 Level ⭐⭐ | 12.5KB | `entities/trellis-superpowers-source-code-comparison-abstraction-layer.md`

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

## 深度分析

### 抽象层设计的根本权衡：物理注入 vs 行为约束

Trellis 与 Superpowers 的核心分歧不在于功能多寡，而在于对 AI 能力的基本假设。Trellis 假设 AI 不可靠，因此通过 `.trellis/` 目录的物理文件将规范、任务上下文、工作流状态直接注入到子代理的 prompt 中——AI "不用记得，照着执行即可"。Superpowers 假设 AI 足够服从，因此仅靠 description 中的强约束措辞（"YOU ABSOLUTELY MUST invoke the skill"）和行为方法学文档来引导 AI。这一分歧贯穿了从状态管理、任务跟踪到团队协作的每一个设计决策。

### Mem 子系统：跨会话记忆的工程化突破

Trellis 的 mem 子系统是其被低估的杀手锏。在 agent 工程中，跨会话记忆是最难解决的问题之一——AI 每次对话都是"全新开始"。Trellis 通过按阶段（phase.ts）、按来源（filter.ts）、按角色过滤的结构化对话检索，将 session 日志转化为可查询的记忆库。这一设计比 Superpowers 的纯文档驱动方法在长期项目中具有质的优势，但也带来了显著的维护成本。

### 文档与源码的偏差：Trellis 的状态机真相

Trellis 对外宣传的"四阶段循环 Plan → Implement → Verify → Finish"与内部实际的三阶段状态机（Plan → Execute → Finish）存在显著偏差。这是一个重要的工程警示：框架的 README 描述的是"理想工作流"，而源码揭示的是"实际执行路径"。这一偏差并非欺骗，而是框架演进过程中文档未同步的产物——但在选型评估时，源码分析才是可信的信息源。

### 20 Configurator：多平台适配的工程智慧

Trellis 的 20 个 configurator 将同一份 `.trellis/` 配置翻译成不同 AI 编程工具的 hooks/commands/agents 格式。这是对"多工具混用"这一现实需求的工程回应——不同团队使用不同的 AI 编程工具（Cursor、Claude Code、Codex、Windsurf 等），但共享同一套项目规范、任务跟踪和记忆系统。这种"一次规范，多处适配"的架构是企业在标准化与灵活性之间取得平衡的关键模式。

### Superpowers 的 Continuous Execution：减少人类瓶颈

Superpowers v6.0 引入的 continuous execution 模式（任务之间不暂停问人，除非 BLOCKED 或全部完成）直接解决了 agent 工作流中最大的效率瓶颈——人类审批延迟。通过将人类介入点从"每个任务"减少到"每个阶段末尾"，Superpowers 实现了约 2x 速度提升和约 50% token 节省。这一模式对高吞吐量的开发场景（bug 修复批次、批量重构）有直接借鉴价值。

## 实践启示

1. **从小处着手，逐步升级**：Superpowers 的零侵入、一行命令部署使其成为个人项目的理想起点。当项目跨越多天、多人、多 session 时，自然演进到 Trellis 的工程化模式。不必在一开始就搭建完整的 `.trellis/` 体系。

2. **源码可信度高于文档**：Trellis 的"四阶段 vs 三阶段"偏差提醒我们，在评估任何 agent 框架时，必须直接检查源码而非依赖 README。这同样适用于 Superpowers 的效果声称——实际体验才是最终的评估标准。

3. **许可证审查不可跳过**：Trellis 的 AGPL-3.0 许可证对商业使用有实质性影响（网络使用即触发源码公开义务）。在企业环境中，许可证兼容性往往比技术特性更具决定性——MIT 许可的 Superpowers 在这方面有明显优势。

4. **记忆系统是长期项目的核心基础设施**：如果项目预期跨越多个 session（一周以上），跨会话记忆能力（Trellis 的 mem 子系统或等效方案）应被视为必需品而非奢侈品。缺少记忆系统的 agent 工作流会随着时间推移产生严重的上下文碎片化。

5. **人类介入点的设计决定效率天花板**：无论是 Trellis 的 3-phase 状态机还是 Superpowers 的 continuous execution，都围绕"何时需要人类决策"这一核心问题设计。减少不必要的审批点、在关键节点设置 checkpoint，是 agent 工作流从"演示级"升级到"生产级"的关键一步。

## 互补关系

- → [GSD vs OpenSpec vs Superpowers 源码对比](ch05/081-gsd-openspec-superpowers-context-rot.html)（同一作者的前作，聚焦 context rot）
- → [Superpowers v6 SDD 重写](https://github.com/QianJinGuo/wiki/blob/main/entities/superpowers-6-sdd-review-redesign-file-handoff.md)（SDD 细节补充）
- → [Superpowers 深度解析](ch05/089-ai.html)（superpowers 全景）

---

