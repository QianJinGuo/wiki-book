---
title: "QQ音乐 Harness Engineering 实践（大仓多服务场景）"
source_url: https://mp.weixin.qq.com/s/yw3DvqKBIV5fIZkSG12zdA
ingested: 2026-06-02
author: "黄欣欣（QQ音乐商业化团队）"
feed: "腾讯云开发者"
published: 2026-05-21
tags: [harness-engineering, qq-music, tencent, monorepo, microservices, context-engineering]
sha256: fe3f8b3bd17c594614c7645bfa403f049af4541b4cd7d6a0f50f95ee7a8a2382
---

# QQ音乐 Harness Engineering 实践（大仓多服务场景）

> 来源：腾讯云开发者 / 2026-05-21 / 黄欣欣（QQ音乐商业化团队）
> 场景：单仓多服务（Monorepo Microservices）50+ 微服务 + 业务仓/IDL 契约仓/Harness 规范仓三仓联动

## 1. 核心命题

当 AI 让"写代码"变快，真正的瓶颈变成"看不完、想不清、管不住"。

**Harness Engineering = 把 AI 协作从"对话式编码"升级为"可控、可审计、可复用的工程过程"。**

理念：AI 参与问题分析、方案设计、编码实现、审查和验证，但**最终判断权始终在工程师手中**。Engineering 的本质是约束下的优化——Harness 不是让 AI 绕过约束的捷径，而是把 AI 接在正确轨道上的挽具。

## 2. 核心公式：代码产出 = AI 能力 × 上下文质量

### 2.1 为什么是乘法（不是加法）

**乘法的关键含义：当上下文质量趋近于零时，模型再强，产出也是零。**

加法假设下"模型足够强时上下文差一点也无妨"——错误。乘法假设下"不掌握团队规范的 AI 即使推理能力再强也会产出不符合约束的代码"——正确。

观察事实：模型能力过去两年快速提升，但 AI 在真实业务仓中的"可用度"并没有同步提升——**瓶颈不在模型，而在上下文**。

### 2.2 真实业务仓里的上下文五类缺口

| 缺口类型 | 典型问题 | AI 的盲区 |
|---------|---------|-----------|
| 隐性规范 | 锁机制、埋点规则、错误码空间 | AI 不知道这些规范存在 |
| 历史决策 | "为什么选 A 不选 B" | 训练语料里没有团队决策记录 |
| 服务契约 | IDL 字段冻结状态、下游依赖 | AI 看到文本，不理解字段动不得 |
| 跨服务依赖 | 同需求要改哪几个服务、谁调谁 | AI 缺乏全局视角 |
| 演进轨迹 | 某模块上次大改的坑、灰度策略 | AI 无跨会话记忆 |

### 2.3 工程化杠杆：把"补上下文"从人工操作变成一次投入、持续生效的工程基建

| 缺口 | 工程化落点 |
|------|-----------|
| 隐性规范 | 写进 `context/team/`，所有 AI 会话自动继承 |
| 历史决策 | 沉淀到 `context/project/{module}/experience/` |
| 服务契约 | 编码进 `.service-matrix/dependencies.yaml` + IDL 门禁 |
| 跨服务依赖 | 服务矩阵自动解析，影响面分析从"搜索"变"查表" |
| 演进轨迹 | Self-Refinement 闭环，纠错沉淀为团队资产 |

**杠杆点选择原则：提升上下文质量，比提升模型能力更高效——因为模型能力依赖外部厂商，上下文质量完全掌握在团队自己手中。**

## 3. Harness 的语义：挽具的隐喻

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

### QQ音乐 业务场景：Harness 接管的是企业级 Multi-Agent 治理

```
Harness Engineering 接管的范围
  Team Agent Governance
  = Multi-Agent × Multi-Service × Multi-Lifecycle
  (让团队 AI 协作跨会话、跨工具、跨服务可治理)
```

## 4. QQ音乐 Harness Engineering 框架

### 4.1 业务复杂度：50+ 微服务 + 三仓协同

业务代码分布在 50+ 微服务中；业务仓、IDL 契约仓、Harness 规范仓之间需保持一致。一个看似简单的需求，牵动服务调用链、配置、灰度、埋点、错误码、接口契约和历史兼容性。

**AI 面对的不是"代码"，而是"业务拓扑"**：从 TAPD 单 → 需求评审 → 技术方案 → 服务影响面 → IDL 契约 → 业务代码 → 测试 → CR → 灰度 → 稳定运行，全链路工程问题。

### 4.2 四类约束必须进入框架

| 业务约束 | 具体问题 | Harness 落点 |
|---------|---------|------------|
| 流程约束 | 需求/设计/开发/交付跳步 | 五阶段主流程 + 四道门禁 + `main-process-numbering.md` |
| 拓扑约束 | AI 不知道服务依赖 | `.service-matrix/dependencies.yaml` + 影响面分析 |
| 契约约束 | IDL 兼容性和分支一致性 | 三仓联动 + `idl_required` + 服务仓库检查门禁 |
| 知识约束 | 团队规范不在模型上下文 | `context/team/`、`context/harness-framework/`、`context/project/` 三层知识 |
| 演进约束 | AI 错误修完就丢 | Self-Refinement + `experience/*.md` 版本化沉淀 |

### 4.3 自研不是重造 IDE，而是补齐 L5 工程治理层

```
L5  Harness Engineering 治理层（自研）
   五阶段流程 / 四道门禁 / 三层知识体系
   服务矩阵 / Self-Refinement / 多运行时适配
L3/L4 执行层（开源）
   代码阅读 / 文件编辑 / 命令执行 / 测试修复
L1/L2 体验层（IDE）
   补全 / 对话 / diff 可视化
```

复用 Claude Code / Gemini CLI / Codex CLI / Continue / CodeBuddy 作为执行层，只补齐 L5 工程治理层。

### 4.4 技术路线：业务约束编码成 AI 可执行的工程制品

| 工程制品 | 作用 |
|---------|------|
| `AGENTS.md` | 全局协作规范和硬规则入口 |
| `.codebuddy/skills/` | 可复用能力单元 |
| `.codebuddy/agents/` | 专家角色定义 |
| `.codebuddy/commands/` | 标准化入口 |
| `context/team/` | 团队级规范（Git/错误码/日志） |
| `context/harness-framework/` | 框架工程规范 |
| `context/project/` | 服务级知识（架构/经验/约束） |
| `.service-matrix/dependencies.yaml` | 服务拓扑与仓库路径 |
| `requirements/` | 需求生命周期产物 |
| `scripts/install.sh` | 多运行时渲染 |

**这些文件全部在仓库里，可 code review / diff / 回滚 / 持续演进。** 对 AI 是上下文，对团队是资产，对工程管理是审计线索。

### 4.5 典型需求链路

```
需求进入 → /requirement:new 创建标准目录
需求定义 → AI 补齐背景/目标/非目标/验收标准 → 评审门禁
影响面分析 → 从 dependencies.yaml 读服务依赖，识别业务仓/IDL 仓
设计阶段 → 生成详细设计，建立"需求条目→设计决策→开发任务"追溯关系
设计门禁 → Agent 检查方案完整性、服务边界、IDL 风险
开发准备 → 检查三仓分支一致性、服务仓库就位
编码执行 → 调用底层 CLI/IDE 的 AI 能力
交付沉淀 → 踩坑经验、规则修正写入 context/，进入下一轮复用
```

## 5. 五阶段 + 四门禁

```
阶段 1 初始化 → 阶段 2 ⭐ 需求定义 → 阶段 3 ⭐ 设计
  → 阶段 4 ⭐⭐ 开发（4.1 任务拆分 / 4.2 Dev 进入门禁 / 4.3 服务仓库检查门禁 / 4.4 编码循环）
  → 阶段 5 交付
```

### 5.1 错误代价递增曲线 + 门禁锚点

| 门禁 | 位置 | 阻塞条件 |
|------|------|---------|
| 需求评审门禁 | 阶段 2.2 | 需求文档不合格 / 评审未通过 |
| 设计门禁 | 阶段 3.3 | 设计评审未通过 / 追溯链不达标 |
| Dev 进入门禁 | 阶段 4.2 | `tasks/features.json` 缺失或不合法 |
| 服务仓库检查门禁 | 阶段 4.3 | 三仓分支不一致 / 服务仓库未就位 |

**门禁设计原则：尽量少、尽量靠前。** 4 个门禁分别对应"意图、方案、任务、环境"四个最容易出大错、改动代价又最低的节点。

### 5.2 门禁是"机读"的，不是"口头的"

每个门禁都有对应 Agent / Skill + markdown 检查规范：
- `requirement-quality-reviewer` Agent（需求评审）
- `detail-design-quality-reviewer` Agent（设计）
- `traceability-gate-checker` Skill（追溯链校验）
- `managing-requirement-lifecycle/gates/service-repo-check.md`（服务仓库检查）

门禁结论写入文件、固定格式、可读、可审计——避免"AI 口头说通过，但没有任何可追溯记录"。

## 6. 三层知识体系 + 三仓联动

### 6.1 三层知识架构

| 层级 | 位置 | 范围 | 典型内容 |
|------|------|------|---------|
| 团队级 | `context/team/` | 所有项目必须遵循 | Git 规范、错误码空间、日志规范 |
| 框架工程级 | `context/harness-framework/` | 所有需求研发必须遵循 | 五阶段流程、门禁规则、文档模板 |
| 服务级 | `context/project/{project-name}/{module-name}/{service-name}/` | 特定服务 | 架构图、API、运维手册、踩坑经验 |

**每层有 `INDEX.md` 入口，AI 按"团队 → 项目 → 模块 → 服务"逐层缩小，O(1) 命中。** 这是"渐进式披露"的物理实现。

### 6.2 `.service-matrix/dependencies.yaml` 单一真相源

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

设计要点：
- **路径从不硬编码**：`{business-repo}` / `{idl-repo}` 占位符，跨机器跨账号无缝迁移
- **多团队共用同一 Harness 仓**：`teams:` 块让不同业务团队有各自的业务仓 + IDL 仓
- **Active Team 三级解析**：`$HARNESS_TEAM` > `.harness/local.yaml` > `default_team`
- **校验脚本**：`scripts/validate-service-matrix.js` 在 CI 跑过，保证占位符能正确解析

实际管理 **57 个服务**，路径深度分布：1 级 21、2 级 32、3 级 4——超过一半服务含"子域"层，框架不能对深度作过强假设。

### 6.3 三仓联动：同一条 TAPD 单的三个分支

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

### 6.4 占位符词典（唯一真相源）

| 占位符 | 语义 | 例子 |
|--------|------|------|
| `{business-repo}` | 业务代码仓根的磁盘路径（绝对） | `/data/workspace/music_commercial_go_proj` |
| `{business-repo-name}` | 业务代码仓根的目录名 | `music_commercial_go_proj` |
| `{idl-repo}` / `{idl-repo-name}` | IDL 契约仓 | 对称 |
| `{project-name}` | 逻辑项目名 | `music_commercial_go_proj` |
| `{requirement-id}` | 需求 ID | `minimal-requirement-practice` |
| `{module-name}` / `{service-name}` | 业务模块 / 服务 | `vip` / `vipapi` |

**写路径 vs 写归属两个语境绝不混用。** "纪律性的枯燥"换来可扫描、可 sed、可自动生成的结构化规范。

## 7. Skill / Agent / Command 三件套

### 7.1 三种能力原子的分工

| 类型 | 定位 | 数量 | 调用方式 |
|------|------|------|---------|
| Skill | 可复用工作流/规范/最佳实践 | 34 | 主对话按需 load / Agent 调用 |
| Agent | 自主子任务执行者（可调工具/可调 Skill） | 24 | 主对话 Task 委派 / 命令触发 |
| Slash Command | 固定入口 + 标准化参数 | 35 | 用户输入 `/xxx:yyy` |

三类能力都是版本化 markdown 文件，**任何一次修改都能 code review、都能 diff、都能 rollback**——这是 Knowledge as Code 的物理实现。

### 7.2 按阶段组织的 Agent 体系（24 个）

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

### 7.3 35 个 Slash Command

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

## 8. Self-Refinement：让 AI 从错误中沉淀经验

LLM 没有跨会话记忆，但团队的每一个"纠正"都是一次宝贵的信号。

### 8.1 闭环流程

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

### 8.2 产物示例

- `context/project/music_commercial_go_proj/campaign/DEPENDENCY_ANALYSIS.md` — 子域依赖影响分析真实记录
- `context/project/music_commercial_go_proj/{module}/experience/*.md` — 踩坑经验（分页必须有上限、goroutine 泄漏、🔒字段约束）
- `context/project/{project}/sop/*.md` — 从经验提炼出的标准操作规程

### 8.3 Meta 案例：写文章本身就是 Self-Refinement

- 最早文档里 `{project-root}` / `{business-repo}` / `{project-name}` 三个占位符分工模糊
- 有人 IDE 选中一行问"这个定义清楚吗？"
- 发起 **MR !49**：把占位符词典写进 AGENTS.md 作为唯一真相源，废弃 `{project-root}` 别名
- 后续 **MR → 51** 修正 rollback 文档路径错误

**框架自身的演进就是 Self-Refinement 的活样本。**

## 9. 与 Claude Code / Cursor / Cline 的关系

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

## 10. 端到端效率 vs 生成速度

如果只统计"从一句话到生成 diff 的时间"，Superpower 类方案非常强。但在生产环境里，**真正的效率是端到端交付效率**：

- 需求是否被正确理解
- 影响面是否漏掉
- 设计是否覆盖关键约束
- 代码是否能追溯到需求
- 契约变更是否安全
- 问题是否能在更便宜的阶段被发现
- 经验是否能进入下一次任务

Harness Engineering 对效率的定义更接近**软件工程的总成本**：少返工、少漏改、少口径漂移、少重复踩坑、少工具迁移成本。

## 11. 结语

> **Harness Engineering = 把 AI 接在正确轨道上的挽具。Context Engineering + Spec-First + Knowledge as Code，构成可验证、可演进的 AI 协作工程基线。**

工程化不是慢，是稳。

---

- 原创作者：黄欣欣
- 所属：QQ音乐商业化团队
- 发布：腾讯云开发者 / 2026-05-21
