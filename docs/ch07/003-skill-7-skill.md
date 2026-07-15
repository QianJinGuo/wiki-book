# 工作流的 Skill 怎么写？从 7 个顶级 Skill 中提炼的模式与最佳实践

## Ch07.003 工作流的 Skill 怎么写？从 7 个顶级 Skill 中提炼的模式与最佳实践

> 📊 Level ⭐⭐ | 24.6KB | `entities/skill-writing-patterns-best-practices.md`

## 一、Skill 是什么
Skill 是一个文件夹，核心是 `SKILL.md` 文件，使用 YAML frontmatter + Markdown 正文的格式。当 LLM 判断需要某个 Skill 时，会调用 `skill` 工具加载它，SKILL.md 的全部内容会作为 tool-result 注入到对话上下文中，LLM 读到后自主决定怎么执行。
```
my-skill/
├── SKILL.md              # 主文件（必须）
├── scripts/              # 可执行脚本（可选）
├── references/            # 详细参考文档（可选，按需加载）
├── resources/             # 模板、清单等资源（可选）
└── examples/              # 示例（可选）
```
**关键机制：** Skill 本质是"知识注入"——它不会动态生成新工具，而是把指令文本注入到 LLM 的上下文中，LLM 用已有的工具（bash、read、edit 等）来执行这些指令。

## 二、Frontmatter：决定 Skill 是否被加载的"门面"
### 2.1 必填字段
| 字段 | 作用 | 示例 |
|------|------|------|
| name | 唯一标识符，小写连字符 | test-driven-development |
| description | 最关键——LLM 通过它决定是否加载 | 见下方对比 |

### 2.2 Description 的写法决定加载率
```yaml

# ✅ 好的 description — 包含触发短语和关键词
description: Deploy applications and websites to Vercel. Use when the user
  requests deployment actions like "deploy my app", "push this live",
  or "create a preview deployment".

# ✅ 好的 description — 定义时序位置
description: Use when implementing any feature or bugfix, before writing
  implementation code

# ❌ 差的 description — 太模糊
description: Helps with deployment stuff
```
**核心原则：**

- 列举触发短语：把用户可能说的话写进去（"deploy my app"、"push this live"）
- 定义时序位置：说明"在什么之前/之后"使用（"before writing implementation code"）
- 包含产品关键词：如果覆盖大平台，把所有产品名著出来

### 2.3 可选扩展字段
| 字段 | 来源 | 作用 |
|------|------|------|
| references | OpenCode cloudflare | 声明最重要的参考文档 |
| allowed-tools | Google Labs stitch-loop | 声明需要的工具权限 |
| type | Dean Peters discovery-process | 声明 Skill 类型（workflow/component） |
| best_for | Dean Peters discovery-process | 最适合的场景列表 |
| scenarios | Dean Peters discovery-process | 具体的触发场景示例 |
| estimated_time | Dean Peters discovery-process | 预估执行时间 |

## 三、5 种核心设计模式
### 模式 1：线性流程
**适用场景：** 部署、安装、迁移等有明确步骤的操作。
**代表：** openai/skills — vercel-deploy（77 行）
**结构：**
```

# 标题
## Prerequisites（前置条件）
## Quick Start（主流程：Step 1 → 2 → 3）
## Fallback（降级方案）
## Troubleshooting（故障排除）
```
**关键技巧：**
| 技巧 | 示例 | 为什么有效 |
|------|------|----------|
| 安全默认值 | "Always deploy as preview, not production" | 防止 LLM 做出危险操作 |
| 具体命令 | 每步给出可直接执行的 bash 命令 | LLM 不需要猜测 |
| 超时提示 | "Use a 10 minute (600000ms) timeout" | 防止 LLM 因超时中断 |
| 降级方案 | CLI 失败有 Fallback 脚本 | 提供 B 计划 |
| 负面指令 | "Do not curl the deployed URL to verify" | 明确禁止不该做的事 |
**适用判断：** 如果你的 Skill 可以用"先做 A，再做 B，最后做 C"描述，就用线性模式。
---

### 模式 2：决策树 + 按需加载
**适用场景：** 大型平台选型、产品导航、问题诊断。
**代表：** openai/skills — cloudflare-deploy（224 行）
**结构：**
```

## Authentication（认证前置）
## Quick Decision Trees（决策树）
  ### "I need to run code"（按用户意图分类）
  ### "I need to store data"
  ### "I need AI/ML"
## Product Index（产品索引表）
```
**关键技巧：**
| 技巧 | 示例 | 为什么有效 |
|------|------|----------|
| 用户意图分类 | "I need to run code" 而非 "Compute products" | 用用户语言而非技术术语 |
| 树形导航 | ├─ 边缘无服务器函数 → workers/ | LLM 快速定位正确产品 |
| 渐进式披露 | 主文件 7KB，references/ 按需展开到几十万字 | 不浪费上下文窗口 |
| 产品索引表 | Product → Reference 的映射表 | 结构化的快速查找 |
**进阶：** 同一个知识域可以拆成两个 Skill——导航型（cloudflare）只做选型，操作型（cloudflare-deploy）包含认证、命令、故障排除。
---

### 模式 3：循环迭代
**适用场景：** TDD、代码审查、设计评审等需要反复执行的流程。
**代表：** obra/superpowers — test-driven-development（371 行）
**结构：**
```

## The Iron Law（铁律——不可违反的核心原则）
## Red-Green-Refactor（循环体）
  ### RED — 写失败的测试
  ### Verify RED — 验证确实失败
  ### GREEN — 写最少的代码
  ### Verify GREEN — 验证确实通过
  ### REFACTOR — 清理
  ### Repeat（回到 RED）
## Common Rationalizations（借口反驳表）
## Verification Checklist（退出条件）
```
**关键技巧：**
| 技巧 | 示例 | 为什么有效 |
|------|------|----------|
| 强硬语气 | "Delete it. Start over." | LLM 倾向于"灵活变通"，强硬语气提高遵从率 |
| Good/Bad 对比 | 用 <Good> 和 <Bad> 标签包裹代码示例 | 对比教学效果最好 |
| 借口反驳表 | 预判 LLM 可能的 12 种偷懒借口并逐一反驳 | 堵死所有逃避路径 |
| 验证清单 | 8 项 checklist 作为循环退出条件 | 确保质量达标才能结束 |
| 人类兜底 | "ask your human partner" | 不确定时交给人 |
---

### 模式 4：接力棒循环（跨 Session 持久化）
**适用场景：** 多次迭代的长期项目，需要跨多个 session 持续工作。
**代表：** google-labs-code/stitch-skills — stitch-loop（203 行）
**结构：**
```

## Overview（接力棒模式概述）
## The Baton System（接力棒文件规范）
## Execution Protocol（6 步执行协议）
  ### Step 1: Read the Baton（读接力棒）
  ### Step 2: Consult Context Files（查阅上下文）
  ### Step 3: Generate（执行任务）
  ### Step 4: Integrate（集成结果）
  ### Step 5: Update Documentation（更新文档）
  ### Step 6: Prepare the Next Baton ⚠️（写下一个接力棒——关键！）
## File Structure Reference（文件协议）
## Orchestration Options（编排方式）
```
**与模式 3 的区别：**
| 维度 | 循环迭代（TDD） | 接力棒循环（Stitch Loop） |
|------|----------------|-------------------------|
| 状态存储 | LLM 对话上下文 | 外部文件系统 |
| 跨 session | ❌ | ✅ |
| 循环退出 | Checklist 全部打勾 | 路线图清空 |
| 适用时长 | 单次会话（分钟~小时） | 长期项目（天~周） |
---

### 模式 5：多阶段 + 检查点 + Skill 编排
**适用场景：** 复杂的多周流程，需要在关键节点做 Go/No-Go 决策。
**代表：** deanpeters/Product-Manager-Skills — discovery-process（502 行）
**结构：**
```

## Key Concepts（核心概念 + 反模式）
## Phase 1: Frame the Problem（阶段 1）
  ### Activities（调用哪些子 Skill）
  ### Outputs（阶段产出）
  ### Decision Point 1（检查点：YES/NO + 时间影响）
## Phase 2-6...（重复相同结构）
## Complete Workflow（端到端时间线）
## Common Pitfalls（常见陷阱）
## References（引用的子 Skill 列表）
```
---

### 特殊模式：思维框架（控制 LLM"怎么想"）
**适用场景：** 安全审计、代码审查、架构分析等需要深度思考的场景。
**代表：** trailofbits/skills — audit-context-building（302 行）
**结构：**
```

## Purpose（定位：控制思维方式，不是控制行为）
## When to Use / When NOT to Use
## Rationalizations（借口反驳表）
## Phase 1: Initial Orientation（定向扫描）
## Phase 2: Ultra-Granular Function Analysis（逐行分析——核心）
  ### Per-Function Checklist（函数微分析清单）
  ### Cross-Function Flow Analysis（跨函数追踪）
  ### Output Requirements（输出格式 + 量化阈值）
  ### Completeness Checklist（完整性检查）
## Phase 3: Global System Understanding（全局理解）
## Stability Rules（反幻觉规则）
## Non-Goals（明确禁止做的事）
```
**关键技巧：** 第一性原理/5 Why/5 How 等思维工具、量化阈值（"每个函数最少 3 个不变量、5 个假设"）、非目标约束、反幻觉规则（"Never reshape evidence to fit earlier assumptions"）。

## 四、通用写作技巧
### 防止 LLM 偷懒的 4 种武器
| 武器 | 原理 | 示例来源 |
|------|------|---------|
| 强硬语气 | LLM 对命令式语气的遵从率更高 | TDD："Delete it. Start over." |
| 借口反驳表 | 预判 LLM 的自我合理化路径并堵死 | TDD：12 种借口 + 反驳；审计：6 种借口 |
| 量化阈值 | 给出硬性的最低标准 | 审计："最少 3 个不变量、5 个假设" |
| 负面指令 | 明确说"不要做 X" | vercel-deploy："Do not curl the URL" |

### 教学的 3 种有效方式
| 方式 | 原理 | 示例来源 |
|------|------|---------|
| Good/Bad 对比 | 对比学习效果最好 | TDD：<Good> vs <Bad> 代码示例 |
| 具体命令 | LLM 擅长执行具体指令 | vercel-deploy：每步都有 bash 命令 |
| 完整示例 | 展示期望的输出格式 | 审计：引用 FUNCTION_MICRO_ANALYSIS_EXAMPLE.md |

### 安全与边界的 3 条原则
| 原则 | 做法 | 示例来源 |
|------|------|---------|
| 安全默认值 | 默认选择最安全的选项 | vercel-deploy："Always deploy as preview" |
| 权限最小化 | 只在必要时提升权限 | vercel-deploy："Do not escalate the installation check" |
| 人类兜底 | 不确定时交给人 | TDD："ask your human partner" |

### 知识组织的 3 层架构
| 层级 | Token 预算 | 内容 |
|------|-----------|------|
| Frontmatter | ~100 tokens | name + description |
| 主文件 | 2K-5K tokens | 核心指令 |
| 参考文档（单个） | 1K-3K tokens | 按需加载 |
| **总上下文占用** | **<10K tokens** | 主文件 + 1-2 个参考文档 |

## 五、模式选择决策树
```
你的 Skill 需要做什么？
│
├─ 执行一个有明确步骤的操作
│  └─ → 模式 1：线性流程
│
├─ 在大量选项中帮用户选择正确的方向
│  └─ → 模式 2：决策树 + 按需加载
│
├─ 在单次会话中反复执行"做→验证→改进"
│  └─ → 模式 3：循环迭代
│
├─ 跨多个 session 持续推进一个长期项目
│  └─ → 模式 4：接力棒循环
│
├─ 跨越多天/多周，有阶段划分和 Go/No-Go 决策
│  └─ → 模式 5：多阶段 + 检查点
│
└─ 需要 LLM 进行深度分析而非快速执行
   └─ → 特殊模式：思维框架
```

## 六、快速上手模板
### 最小可用 Skill（线性模式）
```yaml
---
name: my-skill
description: [一句话描述做什么 + 什么时候触发]
---

# Skill 名称
[一句话核心原则 + 安全默认值]

## Prerequisites
- [前置条件 1]
- [前置条件 2]

## Steps
### Step 1: [动作]
```bash
[具体命令]
```

### Step 2: [动作]
[具体指令]

### Step 3: [动作]
[具体指令]

## Troubleshooting
| Issue | Solution |
|-------|----------|
| [问题 1] | [解决方案]
```

### 循环迭代 Skill 模板
```yaml
---
name: my-loop-skill
description: [描述 + 触发时机]
---

## Core Principle
[不可违反的铁律]

## The Loop
### Phase A — [动作]
[具体指令]

### Verify A
[验证命令]

### Phase B — [动作]
[具体指令]

### Verify B
[验证命令]

### Repeat
回到 Phase A。

## Rationalizations
| Excuse | Reality |
|--------|----------|
| "[借口 1]" | [反驳] |

## Completion Checklist
- [ ] [条件 1]
- [ ] [条件 2]
```

## 七、参考资源
**官方规范：**
1. Agent Skills 开放标准 — https://agentskills.io/
2. anthropics/skills — https://github.com/anthropics/skills/tree/main/template
3. anthropics/skills 规范文档 — https://github.com/anthropics/skills/tree/main/spec
**精选仓库：**
1. openai/skills — OpenAI Codex 官方 Skill 目录
2. obra/superpowers — 14 个工作流型 Skill
3. google-labs-code/stitch-skills — 设计到代码的 Skill
4. deanpeters/Product-Manager-Skills — 40+ 产品管理 Skill
5. trailofbits/skills — 安全审计 Skill
6. openclaw/clawhub — Skill 注册中心
**精选列表：**
1. VoltAgent/awesome-agent-skills — 500+ Skill 索引
2. travisvn/awesome-claude-skills — 精选列表 + Skill vs MCP 对比

## 八、本文分析的 7 个 Skill 速查表
| # | Skill | 来源 | 模式 | 行数 | 一句话精髓 |
|---|-------|------|------|------|-----------|
| 1 | vercel-deploy | OpenAI | 线性 | 77 | 最小但完整的 Skill 模板 |
| 2 | cloudflare-deploy | OpenAI | 线性+决策树 | 224 | 大平台的渐进式披露 |
| 3 | cloudflare | OpenCode | 纯决策树 | 211 | 导航型 vs 操作型的区别 |
| 4 | test-driven-development | obra | 循环迭代 | 371 | 堵死 LLM 偷懒的所有退路 |
| 5 | stitch-loop | Google Labs | 接力棒循环 | 203 | 文件即状态，跨 session 持久化 |
| 6 | discovery-process | Dean Peters | 多阶段+检查点 | 502 | 编排器模式，调度 10+ 子 Skill |
| 7 | audit-context-building | Trail of Bits | 思维框架 | 302 | 控制 LLM"怎么想"而非"做什么" |

## 深度分析
### 1. Skill 本质是"上下文工程"而非"代码生成"
本文最核心的洞察是 Skill 的机制定位：Skill 不会动态生成新工具，而是通过 YAML frontmatter + Markdown 正文把指令文本注入 LLM 上下文。这意味着 Skill 设计本质上是**上下文工程**——如何把领域知识、执行流程、安全边界压缩成精炼的文本，让 LLM 在有限的上下文窗口内做出正确决策。

### 2. Description 的质量直接决定 Skill 的可用性
Description 是 LLM 判断是否加载 Skill 的唯一依据，这在架构上是一个巧妙的"触发器设计"。好的 Description 需要包含三重信息：（1）**触发短语**——用户可能说的话；（2）**时序位置**——在什么阶段使用；（3）**产品关键词**——覆盖范围的边界。这个设计体现了 Agent 系统中"意图识别"与"知识检索"的分离——Description 是索引，正文是内容。

### 3. 五种模式对应五种认知负荷分配策略
| 模式 | 认知负荷分配 | 隐含假设 |
|------|-------------|---------|
| 线性流程 | 作者已完全理解步骤，LLM 无需决策 | 操作路径唯一 |
| 决策树 | 作者理解选项结构，LLM 做选择导航 | 选项可控 |
| 循环迭代 | 作者理解循环不变式，LLM 执行验证 | 退出条件明确 |
| 接力棒循环 | 状态外置，LLM 每次重读上下文 | 跨 session 有记忆需求 |
| 多阶段+检查点 | 作者理解阶段边界，LLM 做 Go/No-Go | 需要人工介入点 |
每种模式都代表一种对 LLM 认知能力的信任程度和容错策略。

### 4. "防止 LLM 偷懒"是 Skill 设计的独特命题
传统系统设计假设执行者是可靠的、顺从的。Skill 设计需要面对一个新命题：LLM 会自我合理化、跳过步骤、降低标准。这要求 Skill 作者预判 LLM 的逃避路径，并通过以下机制应对：强硬语气提高遵从率；借口反驳表堵死合理化借口；量化阈值提供客观衡量标准；人类兜底处理边界情况。这个洞察来自安全审计领域（Trail of Bits），因为在安全场景下"偷懒"的后果最严重。

### 5. 渐进式披露是大型平台 Skill 的必选项
Cloudflare Skill 展示了"主文件 7KB + references/ 按需展开到几十万字"的架构。这种设计的核心洞察是：**LLM 的上下文窗口是有限的，但领域知识的总量可能是无限的**。通过 Frontmatter 的 description 字段做粗粒度过滤，通过主文件的决策树做中粒度导航，通过 references/ 子文档做细粒度展开，实现了知识组织的分层解耦。

### 6. 思维框架模式开启"元认知控制"的先河
Audit-context-building 模式最独特的地方在于它不是告诉 LLM"做什么"，而是控制 LLM"怎么想"：通过 Stability Rules（反幻觉规则）和 Non-Goals（明确禁止）来约束思维路径，通过量化阈值（每个函数最少 3 个不变量、5 个假设）来设定思维质量标准。这代表了 Skill 设计的一个新方向——从行为控制进化到元认知控制。

### 7. 知识组织三层架构的 Token 预算约束
文章提出的三层架构（Frontmatter ~100 tokens、主文件 2K-5K tokens、参考文档 1K-3K tokens）本质上是一个 **Token 预算约束下的知识组织原则**。这个约束来自 LLM 上下文窗口的物理限制，也来自"注入内容越多、embedding 衰减越严重"的经验规律。Skill 作者需要在这个预算下做出取舍：什么放主文件、什么放 references/、什么完全依赖 LLM 的内生知识。

## 实践启示
### 1. 设计新 Skill 前的第一步：选择模式
在动手写 Skill 之前，先用决策树判断适合的模式：

- 有明确步骤 → 线性流程
- 需要在选项中导航 → 决策树 + 按需加载
- 需要反复验证 → 循环迭代
- 跨 session 持久化 → 接力棒循环
- 多阶段人工介入 → 多阶段 + 检查点
- 需要深度思考 → 思维框架
错误地选择模式会导致 LLM 行为偏离预期，且难以通过优化 Description 修正。

### 2. Description 写作的"三重触发"检查清单
写完 Description 后，检查是否包含：

- **用户触发短语**：把用户可能说的话原文复制进去（"deploy my app"）
- **时序触发**：明确"在 X 之前/之后使用"或"当用户说 X 时使用"
- **产品触发**：如果涉及平台，把所有相关产品名列出
缺少任何一个维度都会导致 Skill 的触发率下降。

### 3. 安全默认值是 Skill 设计的默认原则
每一个 Skill 都应该回答一个问题："如果 LLM 完全忽略我的指令，损失有多大？"如果大，就必须在 Description 或正文开头明确安全默认值。"Always deploy as preview, not production"是最简洁有力的示范——一句话把风险降到零。

### 4. 借口反驳表是防止质量退化的有效工具
在 Skill 中引入 Rationalizations 或 Common Pitfalls 部分，预判 LLM（和人类）的自我合理化路径：

- "这只是小改动，不需要完整测试"
- "这个错误可以忽略，逻辑上没问题"
- "临时方案，以后再改"
每一条借口都应该有对应的硬性反驳或量化阈值。

### 5. 主文件行数控制在 200 行以内为佳
根据 7 个顶级 Skill 的统计，主文件行数中位数为 224 行（cloudflare-deploy），最精简的是 77 行（vercel-deploy）。超过 300 行的主文件会显著增加 LLM 的阅读负担，建议通过 references/ 拆解。

### 6. 导航型 Skill 与操作型 Skill 应该分离
同一个平台（如 Cloudflare）应该拆成两个 Skill：

- **导航型**（cloudflare）：只做选型，提供产品索引和决策树
- **操作型**（cloudflare-deploy）：包含认证、命令、故障排除
这符合单一职责原则，也让 LLM 的调用更精准——需要选型时加载导航型，需要执行时加载操作型。

### 7. 跨 Skill 编排需要"检查点设计"
当一个 Skill 需要调用其他 Skill 时（如 discovery-process 调度 10+ 子 Skill），应该在每个子 Skill 调用前后设置检查点：

- **Decision Point**：Yes/No + 时间影响说明
- **Outputs**：当前阶段的明确产出物
- **Activities**：需要调用的子 Skill 列表
这样即使某个子 Skill 失败，也能定位问题并人工介入。

### 8. 与 `agent-skill-writing-practices` 的关系
本文聚焦于** Skill 的设计模式和写作技巧**，而  更侧重于 **Skill 在 Agent 系统中的实践应用**，包括与 `上下文管理` 和 `多 Agent 协作` 的集成。两者结合可以构建完整的 Skill 开发知识体系。

### 9. 与 `Anthropic 14 Skill Patterns Best Practices` 的对比
 是 Anthropic 官方发布的 14 个生产级 Skill 设计模式，强调**可复用性和生产就绪**。本文的 5 种核心设计模式更偏向**分类框架**，而 Anthropic 的 14 个模式更偏向**具体场景模板**。在实际开发中，建议先用本文的决策树定位模式，再用 Anthropic 的模板细化实现。
## 相关实体
- [Agent Skills Comprehensive Survey](../ch04/391-agent-skills.html)
- [Ai Skill Skill Creator 源码拆解](../ch04/429-skill-skill.html)
- [Yidian Tianxia Context Engineering Agentic Ai](../ch04/252-yidian-tianxia-context-engineering-agentic-ai.html)
- [Rag Chunking Vectorization Rerank Distillation](../ch01/1081-rag.html)
- [Ai Skill Evolution底层逻辑](ch07/010-ai-skill-evolution.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skill-writing-patterns-best-practices.md)

---

