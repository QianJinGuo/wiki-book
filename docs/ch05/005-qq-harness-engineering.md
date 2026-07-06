# QQ音乐 Harness Engineering 实践（大仓多服务场景）

## Ch05.005 QQ音乐 Harness Engineering 实践（大仓多服务场景）

> 📊 Level ⭐⭐ | 28.8KB | `entities/qq-music-harness-engineering-monorepo-microservices.md`

# QQ音乐 Harness Engineering 实践（大仓多服务场景）

## 概述

QQ音乐商业化团队（黄欣欣，2026-05-21）落地在 Monorepo Microservices 场景的开源工程框架。核心命题：当 AI 让"写代码"变快，真正的瓶颈变成"看不完、想不清、管不住"。本文**提出"代码产出 = AI 能力 × 上下文质量"核心公式**（乘法 vs 加法），把 Harness Engineering 从概念推进到 50+ 微服务 / 业务仓 + IDL 契约仓 + Harness 规范仓三仓协同的可执行工程体系。

## 核心命题与核心公式

### 1. 核心命题

**Harness Engineering = 把 AI 协作从"对话式编码"升级为"可控、可审计、可复用的工程过程"。**

工程化不是慢，是稳。AI 参与问题分析、方案设计、编码实现、审查和验证，但**最终判断权始终在工程师手中**。Engineering 的本质是约束下的优化——Harness 不是让 AI 绕过约束的捷径，而是把 AI 接在正确轨道上的挽具。

### 2. 核心公式：代码产出 = AI 能力 × 上下文质量

**乘法的关键含义：当上下文质量趋近于零时，模型再强，产出也是零。** 

加法假设下"模型足够强时上下文差一点也无妨"——错误。乘法假设下"不掌握团队规范的 AI 即使推理能力再强也会产出不符合约束的代码"——正确。

**观察事实**：模型能力过去两年快速提升，但 AI 在真实业务仓中的"可用度"并没有同步提升——**瓶颈不在模型，而在上下文**。

**杠杆点选择原则**：提升上下文质量，比提升模型能力更高效——因为模型能力依赖外部厂商，上下文质量完全掌握在团队自己手中。

### 3. 上下文五类缺口

| 缺口类型 | 典型问题 | AI 的盲区 | 工程化落点 |
|---------|---------|-----------|-----------|
| 隐性规范 | 锁机制、埋点规则、错误码空间 | AI 不知道这些规范存在 | `context/team/` |
| 历史决策 | "为什么选 A 不选 B" | 训练语料里没有团队决策记录 | `context/project/{module}/experience/` |
| 服务契约 | IDL 字段冻结状态、下游依赖 | AI 看到文本，不理解字段动不得 | `.service-matrix/dependencies.yaml` + IDL 门禁 |
| 跨服务依赖 | 同需求要改哪几个服务、谁调谁 | AI 缺乏全局视角 | 服务矩阵自动解析 |
| 演进轨迹 | 某模块上次大改的坑、灰度策略 | AI 无跨会话记忆 | Self-Refinement 闭环 |

每一类缺口都在拉低上下文质量这个乘数因子。当前行业主流解法（写更长的 prompt、贴更多的文档）本质是用人力填补上下文，成本高、不可持续、无法复用。

## Harness 的语义：挽具的隐喻

```
原始 LLM = 一匹烈马
  能力强 ✅  方向不定 ❌
  速度快 ✅  走不了远路 ❌
  理解广 ✅  没有持久记忆 ❌

加上 Harness（挽具）→ 能稳定完成复杂任务的 Agent
  工具编排 / 记忆 / 沙箱 / 校验 / 反馈
  上下文工程 / 生命周期 / 人机协同
```

### Harness Engineering 四大标准组件

1. **运行时控制系统** — 工具编排 / 状态持久化 / 错误恢复 / 反馈循环
2. **上下文工程** — Context Window 优化 / 动态检索 / 摘要 / 防 Context Rot / 信息优先级
3. **工具集成与防护** — API 标准化 / 预执行校验 / 阻止幻觉执行 / 安全护栏
4. **生命周期管理** — 多步长任务 / Checkpoint / Crash Recovery / Human-in-the-Loop / 跨会话状态

QQ音乐业务场景下，Harness 接管的是**企业级 Multi-Agent 治理**：
```
Harness Engineering 接管的范围
  Team Agent Governance
  = Multi-Agent × Multi-Service × Multi-Lifecycle
```

## QQ音乐 Harness Engineering 框架

### 业务复杂度：50+ 微服务 + 三仓协同

业务代码分布在 50+ 微服务中；业务仓、IDL 契约仓、Harness 规范仓之间需保持一致。一个看似简单的需求，牵动服务调用链、配置、灰度、埋点、错误码、接口契约和历史兼容性。

**AI 面对的不是"代码"，而是"业务拓扑"**：从 TAPD 单 → 需求评审 → 技术方案 → 服务影响面 → IDL 契约 → 业务代码 → 测试 → CR → 灰度 → 稳定运行，全链路工程问题。

### 四类约束必须进入框架

| 业务约束 | Harness 落点 |
|---------|------------|
| 流程约束 | 五阶段主流程 + 四道门禁 + `main-process-numbering.md` |
| 拓扑约束 | `.service-matrix/dependencies.yaml` + 影响面分析 |
| 契约约束 | 三仓联动 + `idl_required` + 服务仓库检查门禁 |
| 知识约束 | `context/team/` / `context/harness-framework/` / `context/project/` 三层知识 |
| 演进约束 | Self-Refinement + `experience/*.md` 版本化沉淀 |

注意：每一类约束**都不是"提示词写得更详细"就能解决的**。提示词可提醒模型但无法保证长期一致；聊天记录可解释当下任务但无法成为团队资产；单个工具可提升效率但无法替团队定义流程和审计口径。

### L5 治理层 vs L3/L4 执行层 vs L1/L2 体验层

```
L5  Harness Engineering 治理层（自研）
   五阶段流程 / 四道门禁 / 三层知识体系
   服务矩阵 / Self-Refinement / 多运行时适配
L3/L4 执行层（开源）
   代码阅读 / 文件编辑 / 命令执行 / 测试修复
L1/L2 体验层（IDE）
   补全 / 对话 / diff 可视化
```

复用 Claude Code / Gemini CLI / Codex CLI / Continue / CodeBuddy 作为执行层，**只补齐 L5 工程治理层**。

### 技术路线：业务约束编码成 AI 可执行的工程制品

| 工程制品 | 作用 |
|---------|------|
| `AGENTS.md` | 全局协作规范和硬规则入口 |
| `.codebuddy/skills/` | 可复用能力单元（34 个） |
| `.codebuddy/agents/` | 专家角色定义（24 个） |
| `.codebuddy/commands/` | 标准化入口（35 个） |
| `context/team/` | 团队级规范（Git/错误码/日志） |
| `context/harness-framework/` | 框架工程规范 |
| `context/project/` | 服务级知识（架构/经验/约束） |
| `.service-matrix/dependencies.yaml` | 服务拓扑与仓库路径 |
| `requirements/` | 需求生命周期产物 |
| `scripts/install.sh` | 多运行时渲染 |

**这些文件全部在仓库里，可 code review / diff / 回滚 / 持续演进。** 对 AI 是上下文，对团队是资产，对工程管理是审计线索。

## 五阶段 + 四门禁

```
阶段 1 初始化 → 阶段 2 ⭐ 需求定义 → 阶段 3 ⭐ 设计
  → 阶段 4 ⭐⭐ 开发（4.1 任务拆分 / 4.2 Dev 进入门禁 / 4.3 服务仓库检查门禁 / 4.4 编码循环）
  → 阶段 5 交付
```

### 错误代价递增曲线 + 门禁锚点

| 门禁 | 位置 | 阻塞条件 |
|------|------|---------|
| 需求评审门禁 | 阶段 2.2 | 需求文档不合格 / 评审未通过 |
| 设计门禁 | 阶段 3.3 | 设计评审未通过 / 追溯链不达标 |
| Dev 进入门禁 | 阶段 4.2 | `tasks/features.json` 缺失或不合法 |
| 服务仓库检查门禁 | 阶段 4.3 | 三仓分支不一致 / 服务仓库未就位 |

**门禁设计原则：尽量少、尽量靠前。** 4 个门禁分别对应"意图、方案、任务、环境"四个最容易出大错、改动代价又最低的节点。

**门禁是"机读"的，不是"口头的"**：每个门禁都有对应 Agent / Skill + markdown 检查规范。
- `requirement-quality-reviewer` Agent（需求评审）
- `detail-design-quality-reviewer` Agent（设计）
- `traceability-gate-checker` Skill（追溯链校验）
- `managing-requirement-lifecycle/gates/service-repo-check.md`（服务仓库检查）

门禁结论写入文件、固定格式、可读、可审计——避免"AI 口头说通过，但没有任何可追溯记录"。

## 三层知识体系 + 三仓联动

### 三层知识架构

| 层级 | 位置 | 范围 | 典型内容 |
|------|------|------|---------|
| 团队级 | `context/team/` | 所有项目必须遵循 | Git 规范、错误码空间、日志规范 |
| 框架工程级 | `context/harness-framework/` | 所有需求研发必须遵循 | 五阶段流程、门禁规则、文档模板 |
| 服务级 | `context/project/{project-name}/{module-name}/{service-name}/` | 特定服务 | 架构图、API、运维手册、踩坑经验 |

**每层有 `INDEX.md` 入口，AI 按"团队 → 项目 → 模块 → 服务"逐层缩小，O(1) 命中。** 这是"渐进式披露"的物理实现。

### `.service-matrix/dependencies.yaml` 单一真相源

```yaml
workspace: ".."
business_repo: "music_commercial_go_proj"
idl_repo: "qqmusicjce"
default_team: "music-commercial"

teams:
  music-commercial:
    business_repo: "music_commercial_go_proj"
    idl_repo: "qqmusicjce"

modules:
  vip:
    team: music-commercial
    name: 会员核心域

services:
  vipapi:
    module: vip
    repo_path: "{business-repo}/vipapi"
    idl_required: true
  assetcardmallcgi:
    module: assetcard
    repo_path: "{business-repo}/assetcard/mall/assetcardmallcgi"
```

**设计要点**：
- **路径从不硬编码**：`{business-repo}` / `{idl-repo}` 占位符，跨机器跨账号无缝迁移
- **多团队共用同一 Harness 仓**：`teams:` 块让不同业务团队有各自的业务仓 + IDL 仓
- **Active Team 三级解析**：`$HARNESS_TEAM` > `.harness/local.yaml` > `default_team`
- **校验脚本**：`scripts/validate-service-matrix.js` 在 CI 跑过，保证占位符能正确解析

实际管理 **57 个服务**，路径深度分布：1 级 21、2 级 32、3 级 4——超过一半服务含"子域"层，框架不能对深度作过强假设。

### 三仓联动：同一条 TAPD 单的三个分支

```
TAPD 单 T12345
  ├─ Harness 仓 (脑)   feature/Base/T12345   需求文档/设计/门禁/知识/状态
  ├─ 业务代码仓 (手脚)  feature/Base/T12345   代码/测试
  └─ IDL 契约仓 (神经)  feature/Base/T12345   .jce 契约 (仅当涉及 IDL 变更)
                              │
                  阶段 4.3 门禁强制校验
                  三仓分支名必须完全一致
```

回滚时三仓同步，避免"代码回了、IDL 没回"的不一致状态。**这条基础约束，是所有跨仓协调的锚点。**

### 占位符词典（唯一真相源）

| 占位符 | 语义 | 例子 |
|--------|------|------|
| `{business-repo}` | 业务代码仓根的磁盘路径（绝对） | `/data/workspace/music_commercial_go_proj` |
| `{business-repo-name}` | 业务代码仓根的目录名 | `music_commercial_go_proj` |
| `{idl-repo}` / `{idl-repo-name}` | IDL 契约仓 | 对称 |
| `{project-name}` | 逻辑项目名 | `music_commercial_go_proj` |
| `{requirement-id}` | 需求 ID | `minimal-requirement-practice` |
| `{module-name}` / `{service-name}` | 业务模块 / 服务 | `vip` / `vipapi` |

**写路径 vs 写归属两个语境绝不混用。** "纪律性的枯燥"换来可扫描、可 sed、可自动生成的结构化规范。

## Skill / Agent / Command 三件套

### 三种能力原子的分工

| 类型 | 定位 | 数量 | 调用方式 |
|------|------|------|---------|
| Skill | 可复用工作流/规范/最佳实践 | 34 | 主对话按需 load / Agent 调用 |
| Agent | 自主子任务执行者（可调工具/可调 Skill） | 24 | 主对话 Task 委派 / 命令触发 |
| Slash Command | 固定入口 + 标准化参数 | 35 | 用户输入 `/xxx:yyy` |

三类能力都是版本化 markdown 文件，**任何一次修改都能 code review、都能 diff、都能 rollback**——这是 Knowledge as Code 的物理实现。

### 按阶段组织的 Agent 体系（24 个）

- **Init/**：project-bootstrapper、repo-ops-runner
- **RequirementManagement/**：universal-context-collector
- **Startup/**（阶段 1）：requirement-bootstrapper
- **Definition/**（阶段 2）：requirement-input-normalizer、requirement-quality-reviewer
- **TechResearch/**（阶段 3.1）：tech-feasibility-assessor
- **OutlineDesign / DetailDesign/**（阶段 3.2）：quality-reviewer
- **Implementation/**（阶段 4.4）：auxiliary-checker / code-review-preparer / **complexity / concurrency / error / security / design / traceability-consistency** checker（6 个）
- **Acceptance/**（阶段 5）：test-runner
- **KnowledgeMaintenance/**

**亮点：阶段 4.4 代码审查拆成 8 个维度的独立 Agent 并行执行。** `code-review-preparer` 收集 diff + 上下文后分发给 6 个 checker + auxiliary-checker，由 `code-review-report` Skill 聚合结论写入 `reviews/*.md`——典型的多视角审查，效果远好于单次"AI 通读 + 写意见"。

### 35 个 Slash Command

```bash
# 需求生命周期
/requirement:new / :continue / :next / :gate-check
/req-task:list / start / context / done

# Agentic
/agentic:code-review / :load-service / :note

# 服务
/service:deps / :onboard / :load-domain

# 知识
/knowledge:extract-experience / :generate-sop
```

35 个 Command 构成口径统一的交互表面：同一个命令对应同一套流程，**无论用 Claude Code / Gemini CLI / Codex CLI / Continue，体验一致。**

## Self-Refinement：让 AI 从错误中沉淀经验

LLM 没有跨会话记忆，但团队的每一个"纠正"都是一次宝贵的信号。

### 闭环流程

```
① 用户纠正 AI 某个错误
  ↓
② AI 识别：这是"模式性教训"还是"一次性 diff"？
  ↓ 模式性
③ AI 主动提议沉淀层级
   团队级 → context/team/
   框架工程级 → harness-framework/
   服务级 → context/project/{...}
  ↓ 用户确认
④ 生成 experience 文档 / 更新 Skill / 修订规范
  ↓
⑤ 下次同类场景 AI 主动引用
   新会话 / 新模型 / 新人也受益
📌 错误不再"走一次算一次"，而是成为团队资产
```

### 产物示例

- `context/project/music_commercial_go_proj/campaign/DEPENDENCY_ANALYSIS.md` — 子域依赖影响分析真实记录
- `context/project/music_commercial_go_proj/{module}/experience/*.md` — 踩坑经验（分页必须有上限、goroutine 泄漏、🔒字段约束）
- `context/project/{project}/sop/*.md` — 从经验提炼出的标准操作规程

### Meta 案例：写文章本身就是 Self-Refinement

- 最早文档里 `{project-root}` / `{business-repo}` / `{project-name}` 三个占位符分工模糊
- 有人 IDE 选中一行问"这个定义清楚吗？"
- 发起 **MR !49**：把占位符词典写进 AGENTS.md 作为唯一真相源，废弃 `{project-root}` 别名
- 后续 **MR → 51** 修正 rollback 文档路径错误

**框架自身的演进就是 Self-Refinement 的活样本。**

## 与 Claude Code / Cursor / Cline 的关系

| 类型 | 代表 | 角色 |
|------|------|------|
| Claude Code / Cursor / Cline / Gemini CLI / Codex CLI / Continue | 执行层 | 提供 AI 能力、代码理解、文件编辑、命令执行、测试修复 |
| Harness Engineering | 治理层 | 定义流程、门禁、知识体系、服务矩阵、三仓联动、经验沉淀 |

Harness 仓 `.codebuddy/skills/` / `agents/` / `commands/` 是真相源；`scripts/install.sh` 渲染到各 CLI 的本地目录：

```
.claude/     ← Claude Code 读这个
.gemini/     ← Gemini CLI 读这个
.codex/      ← Codex CLI 读这个
.continue/   ← Continue 读这个
```

这些是 gitignored 的镜像目录。修改规范只改 `.codebuddy/`，不同 CLI 自动受益。

**三句话概括**：
1. **执行交给工具**：读代码、改代码、跑测试、修复报错，交给更强的 AI IDE / CLI
2. **规则留在仓库**：流程、门禁、服务拓扑、团队知识、经验沉淀，保留为可 review 的工程资产
3. **协议连接两者**：Skill / Agent / Command 把团队规范翻译成执行层工具可消费的上下文

**核心结论：工程规范与 AI 工具解耦。今天用 Claude Code，明天换 Superpower 类新工具，流程和知识都不丢。**

## 端到端效率 vs 生成速度

如果只统计"从一句话到生成 diff 的时间"，Superpower 类方案非常强。但在生产环境里，**真正的效率是端到端交付效率**：

- 需求是否被正确理解
- 影响面是否漏掉
- 设计是否覆盖关键约束
- 代码是否能追溯到需求
- 契约变更是否安全
- 问题是否能在更便宜的阶段被发现
- 经验是否能进入下一次任务

Harness Engineering 对效率的定义更接近**软件工程的总成本**：少返工、少漏改、少口径漂移、少重复踩坑、少工具迁移成本。

## 与现有 harness-engineering entity 的差异化

| 维度 | 本文（QQ音乐） | 现有 `harness-engineering-systematic-framework` |
|------|--------------|---------------------------------------|
| 场景 | Monorepo Microservices 50+ 服务 / 3 仓联动 | 通用 Harness 概念梳理 |
| 核心公式 | **代码产出 = AI 能力 × 上下文质量**（乘法 vs 加法） | 1.6% AI / 98.4% 工程基建 |
| 上下文缺口 | **五类缺口分类法**（隐性规范/历史决策/服务契约/跨服务依赖/演进轨迹） | 七环节控制回路 |
| 流程骨架 | **五阶段 + 四门禁**（机读门禁 + 错误代价曲线） | Generator/Evaluator 模式 |
| 知识体系 | **三层知识架构 + 服务矩阵 YAML**（团队/框架/服务级 INDEX.md） | 渐进披露原则 |
| 多服务协调 | **三仓联动**（Harness/业务/IDL 同分支）+ 占位符词典 | 无（单仓视角） |
| 能力原子 | **34 Skill + 24 Agent + 35 Command** + 多运行时渲染 | 概念层 |
| 经验沉淀 | **Self-Refinement 闭环**（错误→模式识别→层级沉淀） | 通用 |
| 治理边界 | L5 治理层 vs L3/L4 执行层 vs L1/L2 体验层（明确分层） | 模糊 |

**本文独有内容（不应合并到现有 entity）**：
- Monorepo Microservices 真实生产案例
- 服务矩阵 YAML 工程制品 + 57 个服务的真实路径深度分布
- 三仓联动（同 TAPD 单 → 三仓同名分支）
- 占位符词典（写路径 vs 写归属语境不混用）
- Self-Refinement 闭环
- 多运行时渲染架构（`.codebuddy/` → `.claude/.gemini/.codex/.continue/`）
- 8 维度并行代码审查 Agent

## 一句话总结

> **Harness Engineering = 把 AI 接在正确轨道上的挽具。Context Engineering + Spec-First + Knowledge as Code，构成可验证、可演进的 AI 协作工程基线。**

工程化不是慢，是稳。

## 深度分析

### 1. 分层治理架构：从 L1/L2 到 L5 的职责分离

五层模型清晰地划定了 AI 协作工具链的治理边界：L1/L2 体验层由 IDE 负责（LSP 补全、对话式交互、diff 可视化），L3/L4 执行层由开源 CLI 负责（代码阅读、文件编辑、命令执行、测试修复），L5 治理层由自研 Harness 框架负责（五阶段流程、四道门禁、三层知识体系、服务矩阵、Self-Refinement）。

这个架构的关键洞察在于：**自研只做 L5**。执行层完全复用 Claude Code / Gemini CLI / Codex CLI / Continue / CodeBuddy 等开源工具，Harness 仓只补齐这些工具缺失的工程治理能力。这意味着团队不需要重复造 IDE 的"轮子"，而是把工程投入集中在流程可控性和知识复用性这两个大模型厂商无法提供的维度上。当新工具出现时（如新的 AI CLI），只需修改渲染脚本（`scripts/install.sh`）重新生成镜像目录，治理逻辑零改动。

### 2. 三仓联动 vs 单仓开发：跨仓协调心智模型的本质差异

三仓联动（业务仓 / IDL 契约仓 / Harness 规范仓）不仅仅是一个仓库管理策略，它是一套**跨仓变更传播的心智模型**。当一条 TAPD 需求同时涉及业务代码和 IDL 契约变更时，三仓同名分支（`feature/Base/T12345`）保证了变更的原子性：回滚时如果代码回了但 IDL 没回，分支名不一致立即暴露问题——这是三仓联动最直接的价值。

更深层的价值在于**占位符词典**（`{business-repo}`、`{idl-repo}`、`{service-name}` 等）作为"路径 vs 归属"两种语境的强制分离机制。写路径时用磁盘绝对路径的占位符（可解析、可 sed），写归属时用逻辑项目名（与具体机器解耦）。这种"纪律性的枯燥"让自动化脚本能够可靠地跨机器、跨账号运行，同时让人类能够快速理解服务归属关系。

### 3. 门禁即代码：机读门禁将"流程合规"变成"自动化检查"

传统研发流程中的"评审"往往是口头或文档形式，存在"AI 口头说通过但没有任何可追溯记录"的漏洞。QQ音乐框架的门禁是**完全机读**的：每个门禁对应一个 Agent/Skill + markdown 检查规范，检查结论写入文件、固定格式、可 code review。

这个设计的经济意义在于"错误代价递增曲线"的工程化落地：在改动成本最低的阶段（需求定义、设计方案、任务拆分、环境就绪）插入自动化检查，比在编码完成后发现错误要便宜一到两个数量级。门禁的结论文件本身就是审计轨迹，让"流程合规"从人员责任变成系统检查。

### 4. 乘法公式的工程推论：上下文质量是内生的、可积累的

"代码产出 = AI 能力 × 上下文质量"这个乘法公式有一个反直觉但重要的推论：**当上下文质量趋近于零时，模型再强也没有用**。这解释了为什么模型能力过去两年快速提升，但团队感受到的"AI 可用度"并没有同步提升——瓶颈不在模型能力，而在上下文管理。

更重要的是，上下文质量是**内生的**（完全掌握在团队自己手中），而模型能力是**外生的**（依赖外部厂商）。这意味着提升上下文质量是比等待更强模型更高效的投资——后者依赖外部商业决策，前者只需要团队内部的工程纪律。而且上下文质量具有积累效应：今天的经验沉淀会降低明天的上下文缺口，持续提升这个乘数因子。

### 5. Self-Refinement 的反馈经济学：从"浪费"到"投资"

传统研发中，AI 犯错的纠正成本完全是浪费——修正完就丢了，下次同类场景还会再犯。Self-Refinement 闭环把这个成本变成了投资：AI 识别"模式性教训"后主动提议沉淀层级（团队级 / 框架工程级 / 服务级），用户确认后生成 experience 文档，后续所有会话自动受益。

框架自身演进就是 Self-Refinement 的活样本这一观察尤为精到：占位符词典的混乱（`{project-root}` / `{business-repo}` / `{project-name}`）通过社区反馈被识别，发起 MR !49 修正后沉淀为规范，后续所有使用者都受益于这次"教训"。错误不再是一次性的成本，而是永久降低同类错误概率的疫苗。

## 实践启示

### 1. 建立上下文缺口的系统性盘点和定级机制

在团队内部推行"Harness Engineering 上下文审计"：每个迭代结束后，让 AI 识别本周所有"上下文缺口导致的返工"，按隐性规范、历史决策、服务契约、跨服务依赖、演进轨迹五类填表统计。统计结果直接输入下一轮 `context/` 完善工作的优先级排序，避免"哪个缺口的呼声最高就先补哪个"的随机性。

### 2. 优先在最贵的错误代价节点部署门禁

对照"错误代价递增曲线"，如果团队目前在"需求定义"阶段的返工率最高，就把需求评审门禁作为第一个自动化的 Agent/Skill，不要等到编码快完成了才发现需求理解偏差。门禁部署的优先级应该由各阶段实际返工成本数据决定，而不是按框架描述的顺序依次部署。

### 3. 把路径和归属两个语境严格分离并写入 CI 校验

制定占位符词典并强制执行：所有路径引用必须用占位符（`{business-repo}`、`{service-name}`），禁止硬编码绝对路径；所有归属引用必须用逻辑名（`vip`/`assetcard`）。两条规则写入 CI 校验脚本，任何混用的 MR 直接 blocking。初期阻力会比较大，但三个月后自动化脚本的跨环境稳定性会证明这个"纪律性枯燥"的价值。

### 4. 以三仓分支一致性作为跨仓协调的最小锚点

对于已经开始 Monorepo Microservices 转型的团队，强制要求所有涉及多仓的需求使用统一的分支命名策略（如 `feature/Base/{TAPD_ID}`），并在阶段 4.3 门禁中自动校验三仓分支一致性。跨仓协调的最小锚点不是"统一的工具链"，而是"一致的分支命名"，后者比前者容易实施得多，但已经能覆盖 80% 的跨仓不一致场景。

### 5. 从第一周开始积累 Self-Refinement experience 文档

不要等到"框架成熟"才开始经验沉淀：从第一个 AI 导致的错误纠正开始，就在 `context/project/{service}/experience/` 下生成经验文档，标注"模式性教训"还是"一次性 diff"。前者写入 experience 目录供后续引用，后者记录但不强制引用。让每一次纠正都成为可引用的团队资产，同时避免无差别沉淀导致 `context/` 臃肿。

---

## 相关实体
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering.md)
- [Fudan Peking Ahe Agentic Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/fudan-peking-ahe-agentic-harness-engineering.md)
- [Fudan Agentic Harness Engineering Ahe Gpt54 7Points](https://github.com/QianJinGuo/wiki/blob/main/entities/fudan-agentic-harness-engineering-ahe-gpt54-7points.md)
- [Harness Engineering Alibaba Java Case Study](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-alibaba-java-case-study.md)
- [Tencent Cdn Lego Harness](https://github.com/QianJinGuo/wiki/blob/main/entities/tencent-cdn-lego-harness.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/qq-music-harness-engineering-monorepo-microservices.md)

---

