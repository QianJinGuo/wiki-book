# Harness 工程之道：Skill 原理与最佳实践

> 📊 Level ⭐⭐⭐⭐⭐ | 9.9KB

> **Background**<br>
> 本文来自阿里云开发者公众号，作者结合真实工程化项目 trade-ab-skill，系统性讲解了 Agent Skill 的结构规范、触发机制、作用域优先级以及最佳实践。Skill 格式已被 Claude Code、Cursor、GitHub Copilot、Gemini CLI 等 40+ 主流 Agent 产品采纳。

## Skill 的定义

> "Agent Skills are a lightweight, open format for extending AI agent capabilities with specialized knowledge and workflows."
> 
> Agent Skills 是一种轻量、开放的格式，用于通过专业知识和工作流扩展 AI Agent 的能力。

## 核心理念：渐进性披露（Progressive Disclosure）

Skill 体系最核心的设计理念是渐进性披露，即只在需要时才加载需要的知识，而非一次性加载全部。

### 三阶段模型

| 阶段 | 加载内容 | 成本特征 |
|------|---------|---------|
| **Discovery（发现）** | 仅加载 name 和 description | 常驻上下文，持续占用 |
| **Activation（激活）** | 读取完整 SKILL.md，加载路由表和全局规则 | 任务匹配时一次性加载 |
| **Execution（执行）** | 按路由表加载对应模块，按需读取参考文档 | 仅加载当前任务真正需要的知识 |

该模型用最小的上下文成本，换取了最大的知识覆盖范围，确保上下文窗口留给真正重要的信息。

## System Prompt 与 Skill 的区别

| 维度 | System Prompt | Skill |
|------|---------------|-------|
| **定位** | 项目级全局规则、编码规范 | 特定领域能力封装 |
| **加载策略** | 会话启动时全量加载 | 渐进式按需加载 |
| **生效范围** | 当前项目 | 可跨项目、跨会话 |
| **上下文成本** | 恒定占用，与任务无关也消耗 | 仅在命中时加载，未命中零成本 |
| **结构化** | 单文件，扁平组织 | 多文件模块化，支持脚本和资源 |
| **适用场景** | 编码风格、项目约定、通用约束 | 完整工作流、多步骤流程、领域专家知识 |

**简单记法：** System Prompt 是"这个项目的规矩"，Skill 是"一种可复用的能力"。

## 目录结构规范

```
my-skill/                      # 必需：skill名称，短横线分隔
├── SKILL.md              # 必需：主文件，包括元信息 + 指令
├── scripts/              # 可选：可执行脚本
├── references/           # 可选：参考文档
└── assets/               # 可选：模板、资源
```

**核心思想：主文件做路由，模块文件做执行。**

## SKILL.md 文件结构

### frontmatter 元信息

最核心的两个字段是 `name` 和 `description`：

```yaml
---
name: trade-ab-skill
description: 为用户提供 AB 实验的创建与修改能力，支持实验创建、调流量、加桶删桶、实验下线等操作。当用户提到创建实验、修改实验、调流量、加桶删桶、实验下线等场景时触发。
---
```

### 其他关键字段

| 字段 | 类型 | 用途 |
|------|------|------|
| `argument-hint` | 可选 | 参数提示格式，如 `[source directory] [output format]` |
| `disable-model-invocation` | 布尔 | 禁止模型自动调用该 Skill |
| `user-invocable` | 布尔 | 用户是否可以直接调用 |
| `allowed-tools` | 列表 | 工具白名单，如 `Read, Grep, Glob, Write, Bash(python:*)` |
| `model` | 字符串 | 指定使用的模型（如 `haiku`、`sonnet`） |
| `context` | 字符串 | 执行上下文，设为 `fork` 时在隔离子智能体中执行 |
| `hooks` | 对象 | 生命周期事件钩子（`PreToolUse`, `PostToolUse` 等） |

## 与现有实体的关系

- 补充 [50 Ai Agent Skills For Designers And Pms](https://github.com/QianJinGuo/wiki-public/blob/main/entities/50-ai-agent-skills-for-designers-and-pms.md) 的工程实践角度

---

→ [原文存档](https://mp.weixin.qq.com/s/yo2f5edeNNkYtCte9P0yhQ)

---

## 深度分析

### 渐进性披露的上下文经济学

渐进性披露本质上是一套上下文经济的分层定价机制：Discovery 阶段的 name + description 是"货架成本"——常驻上下文、持续付费；Activation 阶段的完整 SKILL.md 是"进店成本"——语义命中时一次性支付；Execution 阶段的模块文件才是"消费成本"——按任务真实需求逐层加载。 其巧妙之处在于：Skill 数量增长时唯一线性膨胀的只有 description 索引，而单条成本被 1024 字符上限锁死。 这与传统 Prompt 工程"全量塞入导致注意力稀释、关键信息被淹没"的失败模式形成对比。

### SKILL.md 的结构工程学：路由器而非知识仓库

本文最有价值的洞见是把 SKILL.md 正文定义为"路由器"而非"知识仓库"：只保留意图路由表和全局安全红线，业务细节全部下沉到模块文件，总量控制在 500 行（约 2000-3000 token）。 这实质是对 Agent 注意力的架构约束——文件超 300 行、单 Step 规则超 100 行就是拆分信号。 配套原则是知识按使用频率分层：越常用离入口越近，trade-ab-skill 的 creator 模块细化到"参数清单仅 Step 2 读、校验规则仅 Step 3 读"。 触发层面，description 是 Skill 唯一的触发器，需同时回答 WHAT 和 WHEN、枚举口语化触发词、用第三人称描述——触发质量甚至比内容更重要。

### 阿里 trade-ab-skill 的工程化护栏

trade-ab-skill 把 Skill 从"文档"升级为"有护栏的工程系统"。其一是模块级工具隔离：每模块 tools.md 白名单制，创建接口仅在 creator 白名单，modifier 只能用修改接口，审批/发布接口全局禁止，直接 HTTP 等万能工具被封杀。 其二是脚本增强：确定性逻辑（MCP 预检、日志采集）封装为脚本而非让 Agent 推导，遵循自愈、JSON 输出、幂等、安全边界四原则。 其三是快照参数传递：各阶段产出写入 Snapshot、下阶段读取，配门卡校验完整性，关键参数持久化到 user-prefs.json 实现跨会话注入。 结论：生产级 Skill 的难点不在知识写作，而在触发精度、权限边界和状态管理的工程化。这些思想与 [Skill Engineering Principles](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/skill-engineering-principles.md) 印证，也符合 [Context Window Economics](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md) 的成本约束。

## 实践启示

1. **先写触发器，再写内容。** description 用"功能定义 + 触发场景 + 核心能力"公式，回答 WHAT 和 WHEN 并枚举口语化触发词；准备约 10 个变体做触发测试，同时验证不相关输入不误触发。
2. **把 SKILL.md 当路由器管理。** 正文只留意图路由表和全局安全红线；引用辅助文件时写明"触发时机 + 资源位置 + 预期产出"的契约，不能只给路径。
3. **用行数预算约束拆分。** 单文件超 300 行或单 Step 规则超 100 行即拆分；SKILL.md 控制在 500 行以内，把上下文窗口留给任务本身。
4. **确定性逻辑一律下沉为脚本。** "LLM 做有概率出错、脚本做 100% 完成"的逻辑（格式读写、环境检测、复杂计算）封装为脚本，要求自愈、JSON 输出、幂等、限定操作边界。
5. **跨阶段状态用快照 + 门卡管理。** 每阶段产出写入 Snapshot、下阶段读取，门卡校验完整性；关键参数持久化为偏好文件，下次自动注入。
6. **测试别只跑 happy path。** "无 Skill vs 有 Skill"各跑 5 次对比 Token 与质量，故意输入边界值、模拟工具不可用、尝试禁止接口来暴露问题；迭代用日志埋点做观测驱动。

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

