sha256: 30c580b1e73cf1a4e7d20097145aa599648dc7ac4438b5a86c9963d99bfcd383
---
title: "打造 Claude Code 可持续推进的工作流：Loop Engineering 完整上手攻略"
source: 技术极简主义（兔兔AGI）
date: 2026-07-01
url: https://mp.weixin.qq.com/s/cyAIYsdsPwWegGlt8D5ldQ
---

# 打造 Claude Code 可持续推进的工作流：Loop Engineering 完整上手攻略

如果你还在「一问一答」地使用 Claude Code，那么你可能错过了一个更重要的能力——让工作自己推进。

Claude Code 负责人 Boris Cherny 说过一句话：

> I'm no longer prompting Claude. I'm just running a loop that prompts him and then thinks about what to do next. My job is to write loops.

意思很简单：我不再亲自给 Claude 写提示词了。我只是在跑一个循环，让它自己给自己写提示词，自己思考下一步。我的工作是设计这个循环。

用 AI 和设计 AI 的工作方式，已经是两件完全不同的事了。

## 为什么「设计循环」取代了「写好提示词」

2024 年，大家聊的是「写好 Prompt」。

2025 年，话题变成了「同时跑多个 Agent」。

到了 2026 年 6 月，又变了。

最近「Loop」这个词在社区突然火了起来。事情起点是 OpenClaw 作者 Peter Steinberger 发的一条对比图。

原因不复杂——我们受够了「人肉 Loop」。

传统模式下，AI 是工人，人是导演、监工、质检员。你输入一个 prompt，等着看结果，不满意就再输入下一个 prompt，再等，再看……每一轮循环都需要你手动触发。表面上你在用 AI，实际上你才是那个被卡在循环里的人。

Loop Engineering 要做的，就是把这个局面翻转过来。

不再是每次手动输入指令，而是设计一个系统——把任务交给 AI，让它自己执行、自己审查结果、判断是否完成、如未完成就继续下一轮。这整个迭代过程被设计为一个自治系统。

人要完成的身份转变：从「输入提示词的人」变成「设计提示词系统的人」。

2024 到 2026 的三年：

- 2024：Prompt Engineering——解决「一句话怎么问得好」
- 2025：Multi-Agent Orchestration——解决「多个任务怎么分派得开」
- 2026：Loop Engineering——解决「整个流程怎么自己转得动」

Prompt Engineering 解决的是这一轮怎么问好，Loop Engineering 解决的是整个流程怎么持续变好。

## Loop 的三种形态

Loop 是可以自己设计的。它可以跑在绝大多数 Agent Harness 上。问题在于「怎么接线」，不在于「用什么工具」。

### 单 Agent 循环

最简单的一种形态：一个 Agent 自己在循环中反复迭代。

研究 → 起草初稿 → 对照目标检查 → 修复薄弱区域 → 重复，直到超出标准

你不需要在每个步骤点「继续」。Agent 自己跑完整条轨迹。就好像一个人反复修改自己的稿子，改到满意才交出来。

### 多 Agent 舰队循环（Fleet Loop）

更大规模的配置下，一群 Agent 协同运转。

目标交到 Orchestrator（编排 Agent）手里。Orchestrator 把大目标拆成多个碎片，分派给不同的 Specialist（专家 Agent）。每个 Specialist 再把更细粒度的任务下发给 Sub-agent。

整个树状结构构成一个「发现 → 规划 → 执行 → 验证」的持续闭环，直到目标达成。

**单 Agent 循环是「一个人反复改稿」，Fleet Loop 是「一支团队端到端跑完整个项目」。**

### 核心区分：Open-loop 与 Closed-loop

理解这两种 Loop 的差异，实战中会少踩很多坑。

| 维度 | Open-loop（开环） | Closed-loop（闭环） |
|------|------------------|-------------------|
| 自由度 | 高，Agent 可自主探索多条路径 | 低，在人类预设的路径内运行 |
| Token 消耗 | 极高，自由探索吞掉大量 Token | 可控，路径受限所以预算可控 |
| 适用场景 | 探索性任务，创造未预先定义的结果 | 执行性任务，有明确目标和验收标准 |
| 当前成熟度 | 前景广阔，但成本是硬伤 | 这是当前真正产出成果的模式 |
| 核心风险 | 预算不设限的团队才玩得起 | 创造力被限制在框架内 |

Open-loop：给 Agent 宽广的探索空间，让它可以尝试多条路径，创造出启动时没有完整定义的东西。方向是对的，但现实是——90% 的人没有无限预算，Open-loop 在当下不现实。

Closed-loop：人预先设计端到端的 pass，Agent 在人类搭好的轨道上跑。

每轮执行把学习传给下一轮，精度随执行次数递增。

Closed-loop 中的角色分工可以简化为四层：

- Orchestrator——掌握整体目标
- Specialist——拥有并执行特定步骤
- Sub-agent——执行细节任务
- Evaluation Gate——防止低质量或草率输出通过

**先跑稳 Closed-loop，再考虑 Open-loop 做探索。这个次序别搞反。**

## 理论基础：ReAct 与 Reflexion

### ReAct：推理 + 行动

来自 Princeton 和 Google 联合研究的 ReAct 模式，是一种推理与行动交替进行的架构。

思考（Thought） → 行动（Action）—执行工具 → 观察（Observation）—接收结果 → 思考（Thought）—回到这里 → ... → 最终答案（Final Answer）

映射到编码场景：

1. 理解目标
2. 写代码
3. 跑代码，观察输出（或报错）
4. 推断问题出在哪
5. 修正并重新运行
6. 重复，直到测试通过

ReAct 是 Loop 的引擎。每一次「改 → 跑 → 看 → 改」就是一次循环迭代。

### Reflexion：失败即燃料

Reflexion 是 ReAct 的进阶版本，核心模式是把失败口头化，变成下一次尝试的依据。

任务执行 → 失败 → 用自然语言反思失败原因 → 将反思存入记忆 → 下一次尝试时使用反思以提升成功率

在 Loop Engineering 中，Reflexion 的落地形式就是 SKILL.md 和 progress.txt——这些文件存储了跨轮次的学习，让每一次失败都转化为可复用的经验。

ReAct 是 Loop 的引擎，Reflexion 是 Loop 的学习机制。两者缺一不可。

## Claude Code 内置的 Loop 工具

「重复执行同一任务」的概念已经被直接内置到了 Claude Code 中。

| 命令 | 触发方式 | 适用场景 | 版本要求 |
|------|---------|---------|---------|
| /loop | 时间驱动，定时重复 | 轮询检查类任务 | — |
| /goal | 目标驱动，持续工作直到满足条件 | 有明确完成标准的任务 | v2.1.139（2026.5.11） |
| Dynamic Workflows | AI 自己编写工作流程，拆分为数十到数百个 Sub-agent 并行执行 | 超大规模复杂任务编排 | v2.1.154（2026.5.28） |

三者的共同点：减少了「人给指令 → 看结果 → 再给指令」的来回拉扯。

**从 /goal 开始试，最不容易出错。**

## Loop 的双层结构：Inner Loop 与 Outer Loop

### Inner Loop：单任务内的自我验证

同一个任务内，Agent 在交付结果前自己验证了自己的工作。

❌ 弱 Agent：改完文件 → 「完成了！」

✅ 强 Agent：改完文件 → 写测试 → 跑测试 → 发现边界失败 → 修边界 → 重新跑 → 全部绿灯 → 「完成了！」

Inner Loop 不需要额外配置。它靠的是 Agent 自身的自驱验证行为。

### Outer Loop：跨会话的经验沉淀

多个会话之间，Agent 从过去的经历中学习。

Session 1：处理分页逻辑时失败了 → 把「分页最佳实践」记入 SKILL.md → Session 2：遇到同类任务 → 读取 SKILL.md，直接跳过上次踩的坑

| 维度 | Inner Loop | Outer Loop |
|------|-----------|------------|
| 范围 | 单任务内 | 跨会话 |
| 目的 | 提升任务可靠性 | 随时间持续改进 |
| 状态维护 | 在上下文窗口内 | 持久化文件（SKILL.md、progress.md 等） |
| 当前成熟度 | 很多 Agent 已实现 | 仍在快速发展中 |

Loop Engineering 在设计上同时涵盖这两层。Inner Loop 决定你这一轮跑不跑得通，Outer Loop 决定你下一轮还踩不踩同一个坑。

## Loop 的「5+1」工程组件

Addy Osmani 总结了一个可运转的 Loop 由五个组件加记忆构成。

| 组件 | 解决的问题 | 实现方式 | 关键提醒 |
|------|------------|---------|---------|
| ① Automations | 让 Loop 自己跑起来 | cron + bash 脚本 | 必须有停止条件 |
| ② Worktrees | 多个 Agent 并行时避免文件冲突 | Git worktree 隔离分支 | 只解决机械冲突，不解决审查带宽 |
| ③ Skills | 项目知识不丢失 | .claude/skills/*.md | 没有 Skills，每轮都在重新理解项目 |
| ④ Plugins | 让 Agent 接入真实工具链 | MCP Server 配置 | 权限边界要提前锁死 |
| ⑤ Sub-agents | 分离生成与验证 | Generator/Evaluator GAN 模式 | 高风险环节才启用 |
| + ⑥ Memory | 跨会话不遗忘 | progress.md / lessons.md | 没有 Memory，每次都是从头再来 |

### ① Automations：循环的起搏器

最简形式的自动化循环——死循环 + sleep：

```bash
while true; do
    claude --print \
        --system-prompt "$(cat system_prompt.md)" \
        "$(cat task_prompt.md)" \
        >> output.log
    sleep 300  # 每 5 分钟执行一次
done
```

关键是停止条件。没有停止条件的 Loop 就是一个吞噬 Token 的黑洞。

### ② Worktrees：并行工作的隔离层

当多个 Agent 同时在一个仓库上工作时，Git Worktree 提供独立的工作空间：

```bash
git worktree add ../agent-1-workspace feature/auth-fix
git worktree add ../agent-2-workspace feature/api-refactor
# agent-1 和 agent-2 在不同分支上同时工作 → 不会互相踩文件
```

### ③ Skills：项目知识的沉淀池

把「这个项目怎么写代码」这件事沉淀为可复用文件：

```markdown
<!-- .claude/skills/testing.md -->
# Testing Guidelines

- 测试框架：Vitest
- 文件命名规范：*.test.ts
- Mock 库：MSW
- 覆盖率目标：≥ 80%
- 边界用例：始终包含边界和错误场景的测试
```

没有 Skills，Loop 每轮都在重新理解项目；有了 Skills，项目意图开始形成复利。

### ④ Plugins / Connectors：接入真实工具链

让 Agent 不仅能「给你一个建议」，还能「直接参与流程」：

```yaml
mcp_servers:
  github:
    command: "github-mcp-server"
    env:
      GITHUB_TOKEN: "${GITHUB_TOKEN}"
  slack:
    command: "slack-mcp-server"
    env:
      SLACK_BOT_TOKEN: "${SLACK_BOT_TOKEN}"
```

Agent 从「给你建议」变成了「参与流程」。

⚠️ 权限边界要提前锁死。Agent 能操作 GitHub 不等于它可以 force push 到 main。

### ⑤ Sub-agents：分离生成者与检验者

这个模式从 GAN（生成对抗网络）借鉴了灵感：让「写的」和「查的」分开由不同 Agent 承担。

```
├───────┐      生成代码       ├───────┐
│ Generator │ ──────────→ │ Evaluator │
│（生成者）  │                  │（检验者）  │
│           │ ←─────────────  │           │
└───────┙      反馈          └───────┙
     ↑                      │
     │        提供计划          │
     │      ├───────┐           │
     └────→ │ Planner │ ←──────┘
              │（规划者）  │  评估结果
              └───────┙
```

最危险的结构，就是让写代码的人自己去验证自己的代码。Anthropic 内部采纳了这三 Agent 循环，达到了单 Agent 无法企及的质量水平。

提醒：Sub-agent 模式只在高风险环节启用，普通 CRUD 没必要上这个复杂度。

### ⑥ +1 Memory：让循环不失忆

循环的生命线。通过在对话之外持久化状态，突破上下文窗口的限制。

```markdown
<!-- progress.md -->

## 已完成任务
- [x] 重构认证模块（PR #142）
- [x] 为 API 端点补充测试（PR #143）

## 进行中
- [ ] 数据库迁移

## 经验教训
- PostgreSQL 16 中 JSON 路径语法已变更
- 测试环境必须提供 Redis mock
```

> The agent forgets, the repository doesn't.
> —— Addy Osmani

没有 Memory，每次启动 Loop 都像从头再来。有了 Memory，Loop 是一个持续累积的进程。

## 端到端实战：每日 Issue 自动分诊修复 Loop

以「每天早上 6 点自动检查新 Issue、修复、发 PR」为例。

**Step 1：定义目标与停止条件**

- 目标：自动发现项目中的新 Issue，尝试修复，创建 PR
- 停止条件：（a）所有 Issue 处理完毕，输出 DONE；（b）达到最大重试次数（5 轮）
- 最大迭代次数：MAX_ITERATIONS=5

**Step 2：搭建目录结构**

```
project/
├── .loop/
│   ├── progress.md          # Memory 文件
│   └── run.log               # 执行日志
├── .claude/
│   ├── loop_system.md        # 系统提示词
│   └── skills/
│       └── testing.md        # 测试规范
└── daily_loop.sh            # 入口脚本
```

**Step 3：编写循环入口脚本**

```bash
#!/bin/bash
# daily_loop.sh — 每天早上 6 点由 cron 触发

REPO_DIR="/path/to/project"
PROGRESS_FILE="$REPO_DIR/.loop/progress.md"
MAX_ITERATIONS=5

cd "$REPO_DIR"

for i in $(seq 1 $MAX_ITERATIONS); do
    echo "=== 第 $i 轮 / 共 $MAX_ITERATIONS 轮 ==="

    claude --print \
        --system-prompt "$(cat .claude/loop_system.md)" \
        "读取 progress 文件，处理下一个未完成的 Issue。
         完成修复后更新 progress 文件。
         如果所有 Issue 已处理完毕，输出 DONE。" \
        2>&1 | tee -a .loop/run.log

    # 硬停止：检测到 DONE 就退出
    if grep -q "DONE" .loop/run.log; then
        echo "所有任务已完成。"
        break
    fi
done
```

**Step 4：Memory 文件设计**

progress.md 就是 Loop 的记忆。每次运行先读它，知道「上次跑到哪了、踩过什么坑」，再继续推进。

**Step 5：配置 cron 触发**

```bash
# 每天早上 6:00 触发
0 6 * * * /path/to/project/daily_loop.sh
```

完整流转图：

```
[cron 每天早上 6:00] ——→ 启动 daily_loop.sh
                          │
         ┌─────────────────────┘
         │
    ┌─────────────────┐
    │ progress.md          │ ← 读取上次进度
    │（加载状态）          │
    └─────────────────┘
         │
    ┌─────────────────┐
    │ 拉取 GitHub Issues     │ ← Plugin 接入
    │ 筛选未解决的 Issue    │
    └─────────────────┘
         │
    ┌─────────────────┐
    │ 创建 Git Worktree     │ ← 隔离工作区
    │ 在独立分支上工作    │
    └─────────────────┘
         │
    ┌─────────────────┐
    │ 参考 Skills/ 规范     │ ← Skills 层
    │ 应用代码修改          │
    └─────────────────┘
         │
    ┌─────────────────┐
    │ 跑测试 & Lint          │ ← 机械验证
    │ npm test && npm run lint│
    └─────────────────┘
         │
    测试通过？
    否 ——→ 重试修复
    是      │
     │   ┌────┘
     │   │ Sub-agent 交叉   │
     │   │ 验证修复质量   │
     │   └────┐
     │      │
┌────────────────────┐
│ 创建 Pull Request      │
│ 更新 progress.md       │ ← Memory 更新
└────────────────────┘
         │
  下一个 Issue 或终止
```

## 让 Loop 持续变好的四个设计原则

### 原则一：从小闭环开始

别一上来就想建一个全自主 Agent 舰队。从最简单的 Closed-loop 开始——定义一个清晰的目标，设置好停止条件，让它在有限范围内跑。先跑通一个「10 分钟内能验证」的小 Loop。

### 原则二：每个 Loop 必须有停止条件

三种最常用的终止方式：

1. 验证通过停止——所有测试绿灯，lint 零告警
2. 达到上限停止——迭代次数到上限，自动挂起并通知人类
3. 标记挂起——Agent 判断当前任务超出能力范围，将 Issue 标记为 needs-human 并附上已完成的分析

没有停止条件的 Loop 不是系统，是 bug。

### 原则三：让 Outer Loop 形成经验复利

Inner Loop 让你跑完这一轮，Outer Loop 让你下一轮跑得更快。每次循环结束后花 30 秒更新 lessons.md，写下「这次遇到了什么问题、最终怎么解决的」。写那一行的成本极低，但下一轮读到它的 Agent 能直接跳过一个坑。

这是 Loop Engineering 区别于普通脚本的地方——系统随着运行的次数变得越来越聪明。

### 原则四：认知要跟得上代码

这是最后也是最重要的一条。

Loop 跑起来之后，你最容易犯的错误就是「不管了，让它在后台跑就是了」。但 Loop 是杠杆——它能放大一个工程师的判断力，也能放大一个工程师的缺席。

每隔一段时间，Review 一下你的 Loop 的产出。看它做的决策对不对，看它的经验教训写得有没有价值。设计 Loop 的人，仍然是最终对输出质量负责的人。

## 结语

从 2024 年大家砏磨「怎么写好 Prompt」，到 2025 年开始「同时跑多个 Agent」，再到 2026 年认真讨论「设计能自己转的循环」——每一年，人跟 AI 协作的方式都在往深里走一步。

如果把 Loop Engineering 概括为一句话：

把精力从「给高能力的个体无限放权」转移到「为它搭建一个能持续产出的环境」。

同样的道理也适用于人类团队——你招了聪明人不等于团队能有效运转，上下文、规则、反馈、评估标准、进度管理，这些东西一样不能少。

AI 时代的管理，正在从「给出详细指令」转向「设计好的约束」。

**设计循环，而不是提示词。**
