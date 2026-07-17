# Skill Hell：Agent Skill 工程方法论

## Ch04.352 Skill Hell：Agent Skill 工程方法论

> 📊 Level ⭐⭐ | 8.0KB | `entities/skill-hell-agent-skill-engineering-ruofei.md`

> 本文基于 Matt Pocock 的 "writing-great-skills" 与 AI Engineer World's Fair 2026 Keynote，由公众号"架构师"（若飞）深度解读，系统梳理了 Agent Skill 从设计、触发、执行、维护到安全审计的工程方法论。

## 核心概念：Skill Hell

Matt Pocock 提出的 **Skill Hell** 概念：当 Skill 越来越容易下载、复制和安装后，团队开始缺一套评估、路由、验证和修剪的方法。与 **Tutorial Hell**（教程多但项目没长出来）、**Framework Hell**（框架多但系统边界没稳定）并列，是 Agent 工程时代的治理困境。

**Skill Hell 的四种失败模式**：
- **Duplication** — 同一个意思散在多处
- **Sediment** — 旧规则沉积下来，没人确认是否还有效
- **Sprawl** — 即便每一行都还活着，文件本身也太长
- **No-op** — 看起来像规则，实际不改变模型行为

## 信息分层（Progressive Disclosure）

Skill 应遵循三层信息架构，与 `CLAUDE.md 入口上下文`、`Loop 工程`、`Harness 工程`形成互补：

| 层级 | 功能 | 典型材料 |
|------|------|----------|
| 入口上下文 | Agent 进来少猜错什么 | AGENTS.md, CLAUDE.md, 项目边界 |
| 过程接口 | 这类任务下一步怎么做 | Skills, Runbook, 验证流程 |
| 硬门禁 | 哪些风险不能只靠模型自觉 | Hooks, 权限, CI, 审计 |

Skill 自身的三层内部结构：
1. **description** — 路由契约：决定 Agent 什么时候想到、什么时候不该用。需说明触发词和不适用场景
2. **SKILL.md** — 主流程：只放 5-8 个会改变行为的步骤，每个带 completion criterion
3. **references/, scripts/, assets/** — 详细材料：Agent 需要时再读

## description 路由设计

description 是 Skill 的第一道路由，最容易忽视的是它同时决定了"什么时候该用"和"什么时候不该用"。

**好的 description 示例**：
```yaml
description: Review a code diff for correctness, test coverage, security risk, and scope creep.
              Use when the user asks for code review, PR review, diff review, security review,
              or asks whether a change is safe to merge.
```

**触发方式取舍**：

| 触发方式 | 适合场景 | 主要成本 |
|----------|----------|----------|
| 自动触发 | 高频、低风险、边界清楚 | 常驻描述占上下文，可能误触发 |
| 手动触发 | 低频、高影响、需要人判断 | 人要记得并主动调用 |
| Router Skill | 手动 Skill 太多记不住 | 需要维护路由表和触发说明 |

## Completion Criterion（完成标准）

Skill 的步骤不能只有建议，必须有 Agent 自己能判断、人能核对的完成标准。

**弱示例**（不改变行为）：
```
1. Understand the task.
2. Make a plan.
3. Test your work.
```

**强示例**（改变行为、留下证据）：
```markdown
## Steps
1. 识别变更的模块范围。
   Completion criterion: 每个修改的模块名、文件和测试文件都被列出。
2. 运行测试子集。
   Completion criterion: 命令、退出码、失败用例名都被记录。
3. 检查外部副作用。
   Completion criterion: 不使用生产凭据、真实支付端点或不可逆写入。
4. 交付证据。
   Completion criterion: 最终回复包含变更文件、运行命令、结果和未验证风险。
```

不同任务类型的证据形式不同：
- 调研类 — 每个关键断言对应一个来源链接
- 代码审查 — 每个高风险问题给出文件、行号和可复现路径
- 产品规格 — 每个需求映射到用户场景、非目标或验收证据

## Leading Words（语义压缩）

利用模型训练中已存在的稳定概念，用更短的词调动过程先验。

**有效词**：red-green-refactor, vertical slice, tracer bullet, maker/checker, single source of truth, Chesterton's Fence

**原则**：
1. **不要硬造** — 团队内部新词模型无先验，需更多解释
2. **避免词汇漂移** — 同一概念不要换来换去（vertical slice ≠ 端到端切片 ≠ 最小闭环 ≠ 薄切片）
3. **词要能改变行为** — "be careful" 太弱，大概率是 no-op

## Skill 维护与删除

Skill 最常见的问题是只加不删。维护纪律比写作技巧更重要：

- **先删 no-op**：删掉不改变 Agent 行为的规则（"Write clean code", "Be careful", "Think step by step"）
- **Single source of truth**：每个规则只在一个权威位置出现，其他地方只做引用
- **每次失败也删一段**：每次 Skill 导致明显失败，不只加规则，也顺手删一段旧内容 — 防止 Skill 变成"只进不出"的上下文垃圾场

## 安全审计

当 Agent 拥有文件系统、bash、浏览器、网络权限时，外部 Skill 不再是普通文档。用以下检查项审计第三方 Skill：

| 检查项 | 要看什么 |
|--------|----------|
| 触发范围 | description 是否过宽，会不会误触发高风险流程 |
| 文件访问 | 是否要求读取不必要的目录、密钥、配置 |
| 脚本行为 | scripts/ 是否有网络请求、删除、写入、安装依赖 |
| 外部依赖 | 是否会从 URL 拉取内容当指令执行 |
| 权限边界 | 是否需要生产环境、支付、邮件、工单、数据库写 |
| 证据要求 | 是否有测试、日志、报告、退出条件 |
| 维护状态 | 作者、版本、最近更新、许可证 |

## 实践工作流

新建 Skill 的推荐顺序：

1. 选一个最近两周反复出现的任务，**只做一个 Skill**
2. 写 description，先把触发词和不适用场景写清楚
3. SKILL.md 只保留 **5-8 个主步骤**，每一步带 completion criterion
4. 把模板、术语表、测试卡拆到 references/
5. 能确定执行的检查，尽量写成**脚本**，不让模型靠感觉判断
6. 用 **3 个真实任务试跑**，记录误触发、漏读、提前完成和证据缺失
7. 删掉 no-op 和重复内容，再决定要不要自动触发

## 与 wiki 已有知识的关联

|- `Agent Skills 系统综述：Skills 和技术债` — 互补视角，本文更侧重方法论而前篇侧重系统分类
|- `Claude Code Skills 实践：验证比生成更值得写进流程` — 本文的 completion criterion 理念与该篇的"验证优先"方向一致
|- `CLAUDE.md 拆解：Agent 进仓库前的上下文入口` — Skill 与入口上下文的分工互补
|- `Harness Engineering` / `Loop Engineering` — Skill 是 Harness 中的过程接口层
- `应用宝活动平台 Harness 工程实践` — 生产环境 Harness 中的 Skill 角色
- `Code is Cheap：Harness 方法论` — 过程稳定性设计的思想共鸣

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/raw-skill-hell-agent-skill-writing-ruofei.md)

---

