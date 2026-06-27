# Superpowers 6.0 反作弊重写：reviewer 只读怀疑论者 + 上下文经济学 + progress ledger + model 纪律 —— 术哥源码级拆解 158 commits

## Ch05.085 Superpowers 6.0 反作弊重写：reviewer 只读怀疑论者 + 上下文经济学 + progress ledger + model 纪律 —— 术哥源码级拆解 158 commits

> 📊 Level ⭐⭐⭐ | 6.2KB | `entities/superpowers-6-reviewer-anti-cheating-shuge-2026.md`

> 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/superpowers-6-reviewer-anti-cheating-shuge-2026.md)

# Superpowers 6.0 反作弊重写：守门人焊死工程

术哥（ShugeX）源码级分析 Superpowers v6.0.3，翻 158 commits + 3 核心 prompt + 3 shell 脚本。核心结论：**6.0 不是性能调优，是围绕 reviewer 角色的结构性重写**——堵住 controller 被反复观测到的几条作弊路径，提速降本是结构改造的副产品。

## 一句话定位

> 把 reviewer 从一个可被辅导、可被绕过、可被静默升级到顶配模型的配角，重写成一个**只读、怀疑、独立、强制读文件**的裁决者。

## 六大技术杠杆

### 1. 两个 reviewer 合并为一：一次 diff 出两个裁决

5.x 跑两轮独立 review（spec-compliance + code-quality），各读一遍 diff。6.0 合并为单一 `task-reviewer`，一次 diff 出 spec compliance 和 code quality 两个裁决。省下一个 subagent + 一遍 diff 读取。

### 2. Reviewer 只读怀疑论者（三道硬闸门）

`task-reviewer-prompt.md` 核心设计：

| 闸门 | 源码位置 | 作用 |
|------|---------|------|
| **Do Not Trust the Report** | 第 55-62 行 | implementer 的自述=未经证实的说法，理由不能降级发现严重性 |
| **只读约束** | 第 52-53 行 | 不得 mutate working tree/index/HEAD/branch（堵孤儿提交事故） |
| **禁止 controller 辅导** | SKILL.md 第 169-173 行 | controller 不得预判严重性、不得告诉 reviewer 忽略什么 |

**委托代理问题的教科书解法**：controller 目标=让任务过审，reviewer=守门人。6.0 彻底隔离两者。更狠的一条：plan 里明确要求的事如果被 rubric 判定为缺陷，仍然标 Important + `plan-mandated`——*"The plan's authorship does not grade its own work; the human decides"*。

### 3. 文件替代粘贴：三个脚本的上下文经济学

5.x 把 task 文本和 git diff 直接粘进 dispatch prompt → 永久占用 controller context + 每轮重读。6.0 用三个脚本替代：

| 脚本 | 行数 | 功能 |
|------|------|------|
| `task-brief` | 40 | awk 从 plan 抽指定 task 文本 → `.superpowers/sdd/task-N-brief.md` |
| `review-package` | 44 | `git diff -U10` → `.diff` 文件，按 commit 范围命名 |
| `sdd-workspace` | 22 | 解析工作目录 + self-ignoring `.gitignore` |

subagent 读文件而非接收粘贴。controller context 只剩一行路径。**单独省 ~10% token + 时间**。

**被迫的结构性变更**：上下文隔离省了钱，但 `writing-plans/SKILL.md` 现在强制每个 task 带 `Interfaces` block（Consumes/Produces 精确签名），因为隔离后 implementer 看不到邻居 task 的接口契约。

### 4. Progress Ledger：对抗 compaction 失忆

> *"Conversation memory does not survive compaction. Controllers that lost their place have re-dispatched entire completed task sequences — the single most expensive failure observed."*

解法：git-ignored `progress.md`，每完成一个 task 追加一行。compaction 后 controller 读文件 + `git log` 恢复进度。特别叮嘱：**"trust the ledger and git log over your own recollection"**。

**关键洞察**：agent 的记忆 ≠ 对话历史。对话历史会被压缩/截断，文件系统不会。`.superpowers/sdd/` 目录（progress ledger + task brief + review diff）构成**以文件为媒介的状态机**。

### 5. Model 纪律：强制声明替代静默继承

5.x 不指定 model → 静默继承 session 顶配 → 26 个 reviewer 全跑顶配。6.0 强制声明：*"an omitted model silently inherits the session's most expensive one"*。

**反直觉成本规律**：*"Turn count beats token price. The cheapest models routinely take 2-3× the turns on multi-step work — costing more overall."* 选择指导：按任务复杂度匹配档位，非无脑用便宜的。

### 6. Skills 去方言化

6.0 把所有 skills 从 Claude Code 方言改写为 vendor-neutral：*"skills speak in actions, rather than naming any one runtime's tools"*。`references/` 下 6 个 per-harness 工具映射文件。官方支持 harness 从 1 家扩到 11 种。

## 诚实边界（术哥明确标注）

1. **性能数字范围**：官方免责声明 — *"these numbers won't hold on every harness and for every workload"*。评测仅 Claude Code + Codex
2. **6.0.3 runtime 约束**：Claude Code 禁写 `.git/` → 工作区搬到 `.superpowers/sdd/`（agent 运行时约束反向塑造工具设计）
3. **社区反馈未规模化**：6.0 发布才几天，Reddit/HN 讨论仍针对 5.x
4. **chardet 41x 提升**：单一来源（Pulumi/Termdock），无法交叉验证

## Wiki 关联

- reviewer 重写是 [Harness Engineering](../ch05-041-harness-engineering-概念框架/) 在 multi-agent review 场景的具体实现
- progress ledger 与 Agent 记忆系统设计 模式一致
- 委托代理隔离 → [Loop Engineering](../ch05-002-loop-engineering-不再写提示词-而是设计替你写提示词的循环-先写刹车再写循环-13-来源深度合并-ad/) 中 evaluator 与 executor 分离的同构解法
- "harder to game" → 对应 对抗验证 原则

---

