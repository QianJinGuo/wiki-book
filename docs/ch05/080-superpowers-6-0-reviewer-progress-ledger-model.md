# Superpowers 6.0 反作弊重写：reviewer 只读怀疑论者 + 上下文经济学 + progress ledger + model 纪律 —— 术哥源码级拆解 158 commits

> 📊 Level ⭐⭐⭐⭐ | 12.1KB

> 原文存档：[原文存档](https://mp.weixin.qq.com/s/fcmV4qQw867VqxC3A5mZcA)

## Superpowers 6.0 反作弊重写：守门人焊死工程

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

## 深度分析

### 只读不是洁癖：把「说服」这条路封死

三条闸门封的是同一类漏洞——reviewer 的判断可以被语言改变。5.x 里 implementer 写一句「故意保持简单」就能让缺陷降级，controller 一句 treat it as Minor at most 就能在 dispatch 时预先定价严重性。rubric 写细也补不了这个洞：只要 reviewer 还读理由，解释空间就随 rubric 一起长。6.0 因此收窄输入本身——只读（历史上真有 reviewer 自己跑 git checkout，导致后续提交成孤儿）、禁辅导、plan-mandated 时作者身份也不能给自家产物免责。这是委托代理问题的结构解而非激励解：不指望守门人自觉，而是删掉能影响它的通道。

### 上下文经济学：粘贴的成本是复利

粘进 dispatch 的 diff 与 subagent 打印回来的内容都会常驻 controller context 并逐轮重读，所以多 reviewer 的成本要按轮次乘算，而不是按单次输入算。这正是 [多 agent 上下文隔离](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-context-isolation.md) 的成本侧论证。三个脚本（task-brief / review-package / sdd-workspace，合计 106 行）把 task 文本、diff、工作区路径外置成文件，context 里只留一行路径，官方口径单独省约 10%。但隔离不是免费的：implementer 看不到邻居 task，writing-plans 因此强制每个 task 带 Consumes/Produces 精确签名——省下的 token 若不用 plan 层契约补回，会以集成返工加倍偿还。

### progress ledger：换掉记忆的权威来源

compaction 之后 controller 会「自我一致地算错」：从残缺记忆出发，把整套已完成 task 重新派发一遍，原文称这是观测到的最贵失败。解法不是记得更牢，而是换权威源——git-ignored 账本每 task 追加一行，恢复时以账本加 git log 覆盖自己的回忆。它与只读 reviewer 共享同一条认识论：自述不可信，可审计记录才可信。brief、review diff、ledger 同居 .superpowers/sdd/，成为以文件为媒介的状态机，与 [Agent 记忆系统设计](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-system-design.md) 的落盘判断同构。

### model 纪律：计价单位是轮次

漏填 model 就静默继承 session 顶配，一次运行可能让 26 个 reviewer 全跑高档——不报错、不告警，只让账单变厚。但比这个 fix 更值钱的是那条反直觉规律：turn count beats token price，便宜模型在多步任务上跑 2-3 倍轮次，整体反而更贵。所以纪律的实质是匹配而非降档：reviewer 这种单轮判定型任务用中档，implementer 降档会被轮次反弹。与 [上下文窗口经济学](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md) 连起来看，工具省的是绝对读取量（风险近零），降档省的是条件性单价（押注模型一次做对），两者不可混为一谈。

### 耦合与失效顺序：谁是谁的前提

六条杠杆有硬依赖，当清单抄会失效。上下文隔离是「一次 diff 出两个裁决」与账本落盘的前提——没有文件化，单一 reviewer 无法只读一次 diff，ledger 也无处安放；去方言化则是只读约束跨 11 种 harness 成立的条件，否则同一条 prompt 在各家 runtime 上的执行力并不一致。失效也按依赖顺序传导：Claude Code 禁写 .git/，早期把产物写进 .git/sdd/ 的实现在写入中途被 block，只能整体迁到 self-ignoring 目录——目录一旦不可写，ledger、brief、diff 同时失效，系统退回粘贴与自述；其次才是 controller 辅导复发，那会让三条闸门一起空转。可见护城河不在 rubric 多严，而在状态有没有一个 agent 改不动、也忘不掉的落点，这也是 [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) 把约束落在环境而非提示词上的同一条思路。

## 实践启示

1. **先删掉守门人能被说服的输入，再谈 rubric 精细化**：只读 + 不接受 implementer 自述 + 禁止 dispatch 时预判严重性；理由只参与讨论，不参与降级。
2. **把粘贴记成成本项**：dispatch 里粘的 diff 会常驻并逐轮重读，改为写文件、只传路径，收益约 10% 且随 session 变长放大。
3. **隔离多少上下文，就在 plan 里补多少契约**：每个 task 写 Consumes/Produces 精确签名，否则省下的 token 会在集成阶段还回去。
4. **进度状态永远是文件，不是对话**：每 task 追加一行到 git-ignored 账本，恢复以账本加 git log 为准；出现「重跑已完成工作」的团队，先查这个落点。
5. **model 按任务形状匹配，并设成必填**：判定型 review 用中档，多步实现降档会被轮次反弹；别让「继承顶配」当默认值。
6. **验收 harness 适配层，而不只验收 prompt**：换 runtime 前先验证产物目录可写（例如禁写 .git/），否则整套状态机会在运行中断掉。

## Wiki 关联

- reviewer 重写是 [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) 在 multi-agent review 场景的具体实现
- progress ledger 与 [Agent 记忆系统设计](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-system-design.md) 模式一致
- 委托代理隔离 → [Loop Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-addy-osmani-challengehub.md) 中 evaluator 与 executor 分离的同构解法
- "harder to game" → 对应 [对抗验证](https://github.com/QianJinGuo/wiki-public/blob/main/entities/adversarial-verification.md) 原则

---

