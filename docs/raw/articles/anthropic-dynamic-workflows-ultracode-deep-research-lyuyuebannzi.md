---
source_url: "https://mp.weixin.qq.com/s/KmlyQ0UxWyoZ2ha9i0nx-g"
ingested: 2026-06-26
sha256: 57a23eed1ae7a072
---

# Anthropic Dynamic Workflows 深度实战：JavaScript 编排脚本 + ultracode 模式 + /deep-research + 保存复用

> 来源：林月半子的AI笔记（2026-06-05）
> **关系**：与现有 5+ 译本（机器之心 / Thariq / 玉澄 / 架构师 JiaGouX）的同源不同公众号报道。保留独家数据：ultracode 模式 + /deep-research + 3 步跑起来 + 编排者哲学（"AI 写编排代码 vs 人写编排代码"）。

## 一、Dynamic Workflows 是什么？

上周 Anthropic 发布了 Dynamic Workflows，24 小时不到就被人公开指控"抄袭"。一个叫 Sisyphus Labs 的团队直接在推特上@了 Anthropic，说 Claude Code 新推的 **ultracode 模式**跟他们做的 OMO 工具里的 ultrawork 和 atlas 功能几乎一模一样。

抄没抄的，我不评价。但这件事背后有个更值得想的问题：**让 AI 自己写编排脚本这个能力，已经成了 Coding Agent 赛道的兵家必争之地**。

OpenAI 的 Codex 也在用 `/goal` 模式干类似的事，第三方开源工具像 OMO 也早就跑通了类似的路线。**路径各不相同，但所有人都要解决同一个问题：AI 要能自己拆任务、调度一支 Agent 舰队去干大活。**

## 二、Dynamic Workflows 的核心机制

很多人看到 Workflow 这个词，以为是某种跑在 Anthropic 服务端的编排引擎。**Dynamic Workflows 就是一段 JavaScript 脚本**。

Claude Code 根据你的任务，**临场现写这段脚本**，然后在本机后台跑。脚本里每碰到一个 `agent()` 调用，就派生一个 subagent 去读文件、改代码、跑命令。**脚本只管调度，不碰文件系统，也不碰 shell**。

> **如果你是 n8n 用户，可以这样理解**：
>
> - **n8n** = **静态路由**——你得提前画好死流程，每次执行走的路线都一样
> - **Dynamic Workflows** = **动态路由**——AI 根据前一个 Agent 返回的结果，现场决定下一步是该加 5 个 agent 去修 bug 还是直接收工

### 关键设计

- **编排脚本是 Claude 看到你的任务后临时用 JavaScript 写出来的，不是预先配好的模板**
- 每次任务不同，脚本就不同；同一个任务换个说法，脚本的结构也可能不一样
- 脚本**不在主对话的 session 里执行**——Claude 把它丢到后台独立跑
- **主 Agent 全程在睡觉，只在最后被叫醒去读结果**。所以触发一个 Workflow 之后，主对话还可以继续干别的事

## 三、与 Subagent / Skill 的核心区别

三者的区别是**协作规模不同**。核心问题只有一个：**谁握着计划？**

| 类型 | 谁决定下一步 | 中间结果流向 | 适用 |
|------|------------|------------|------|
| **Subagent** | Claude 逐轮判断 | 所有中间结果回到你的对话上下文 | "帮我去查一下这个文件里有什么"——**跑腿** |
| **Skill** | Claude 决定，按 prompt 走 | 同样回到对话上下文 | 预写好的 Markdown 指令——**SOP** |
| **Dynamic Workflows** | **脚本自己决定下一步** | 循环/分支/中间结果全在脚本变量里流转 | **流水线作业** |

### 上下文占用差异

**用 subagent 或 skill 派 10 个小弟去干活，10 份结果全部作为 tool result 回到你的对话里，上下文越跑越臃肿，到后面 Claude 的注意力都被过程信息稀释了。**

**Workflow 的 10 份中间结果在脚本变量里流转，最后只有一份汇总报告回到 Claude 的上下文。**

> **需要"跑腿"用 subagent，需要"按手册操作"用 skill，需要"流水线作业"用 Workflow。**

## 四、3 步跑起来你的第一个 Workflow

### 准备工作：确保功能已开启

打开 Claude Code，输入 `/config` 命令，检查 Dynamic workflows 那一行是不是已经开启。**版本要求 Claude Code v2.1.154 或更高**。

### 触发方式一：在 prompt 里说 "workflow"

最简单的方式，就是在 prompt 里包含 `workflow` 这个关键词。Claude Code 会把它高亮成彩色，提示你可能触发一个工作流。回车之后，Claude 会先写一段 Workflow 脚本，然后在后台开始运行。

### 触发方式二：开启 ultracode 模式

不想每次手动判断"这个任务值不值得起 Workflow"，可以把这个决定权交给 Claude：

```
/effort ultracode
```

这条命令做两件事：
- **把推理努力拉到最高档（xhigh）**
- **允许 Claude 自动判断什么时候该用 Workflow**

**开了 ultracode 之后，一个复杂的请求可能被拆成连续好几个 Workflow**，比如先跑一个理解代码，再跑一个做修改，最后跑一个验证。

> ultracode 模式下每个请求消耗的 token 明显更高，**别在简单任务上开着忘关了**。想退回日常模式，`/effort high` 就行。

### 触发方式三：使用内置的 /deep-research

Anthropic 内置了一个现成的 Workflow——`/deep-research`，后面跟一个问题就行：

```
/deep-research What changed in the Node.js permission model between v20 and v22?
```

它从多个角度发起搜索，抓取并交叉核对来源，对每一条结论投票表决，最后产出一份带出处的报告。**没通过交叉验证的结论会被直接剔除**。

> **想感受 Workflow 是什么体验，跑一个 `/deep-research` 最快。**

## 五、运行中可以干什么

Workflow 启动之后，可以随时查看运行状态。输入 `/workflow` 命令，就能看到当前 Workflow 的进度。用方向键切换到不同的阶段，看每个阶段跑到哪了。

| 操作 | 快捷键 | 效果 |
|------|--------|------|
| **查看详情** | Enter / → | 看调了什么模型/花了多少 token/用了几次工具/跑了多久/完整 prompt 和输出 |
| **暂停运行** | `p` | 随时暂停，再按 `p` 恢复，已经完成的工作不会白费 |
| **保存 Workflow** | `s` | 保存成 `/命令名` 斜杠命令，下次直接调用 |

### 保存的位置

- `.claude/workflows/`——**项目级**，克隆仓库的人都能用
- `~/.claude/workflows/`——**个人级**，只有你能看到，但在每个项目里都能用

> **"保存"这个操作看着不起眼，但它可能是 Dynamic Workflows 最长期的价值。**
>
> **被沉淀下来的不是一个 n8n 工作流，而是一整套 Agent 协作的编排逻辑。**

## 六、硬约束

Workflow 不是万能的，有几个硬约束先记下来：

- **token 消耗**——ultracode 模式下每个请求消耗的 token 明显更高
- **版本要求**——Claude Code v2.1.154 或更高
- **脚本不碰 shell / 不碰 FS**——只管调度，所有副作用都通过 `agent()` 调用

## 七、核心价值：抹平了编排的技术门槛

在官方推出这个功能之前，想让多个 Agent 并行干活、结果汇总、错误重试，**你得自己写编排代码，处理并发控制、限流重试、中间状态管理、结果聚合，全是脏活**。

**Dynamic Workflows 把编排这层的技术门槛直接抹平了。**

> **以前是人写编排代码、手搓各种脏活，AI 只管卖力气。**
>
> **现在是 AI 自己根据任务现场生成编排逻辑，跑在官方提供的运行时里。**
>
> **门槛从"会写编排代码"降到了"会定义目标"。**

## 八、什么时候该用 Workflow

不是每个任务都需要起 Workflow。它是用大量并行 agent 来换效率，**对短小任务反而是负担**。

## 九、行业背景

**抄没抄的，我不评价。但这件事背后有个更值得想的问题：让 AI 自己写编排脚本这个能力，已经成了 Coding Agent 赛道的兵家必争之地。**

- OpenAI Codex `/goal` 模式
- OMO（开源）ultrawork + atlas
- Anthropic Dynamic Workflows

**路径各不相同，但所有人都要解决同一个问题：AI 要能自己拆任务、调度一支 Agent 舰队去干大活。**

## 关联笔记

→ [[entities/claude-code-dynamic-workflows-multi-agent-orchestration|Merged into Claude Code Dynamic Workflows 7th translation (Nth source)]]
