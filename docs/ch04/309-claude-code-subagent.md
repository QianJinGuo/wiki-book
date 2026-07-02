# Claude Code Subagent 详解：把探索过程关进独立工作区

## Ch04.309 Claude Code Subagent 详解：把探索过程关进独立工作区

> 📊 Level ⭐⭐ | 8.4KB | `entities/qy_zaCZTCs1Ql3BIFmBMgg.md`

# Claude Code Subagent 详解：把探索过程关进独立工作区

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/qy_zaCZTCs1Ql3BIFmBMgg.md)

## 摘要

来自微信公众号「架构师（JiaGouX）」的一篇译注文章，把 Claude Code 的 Subagent 机制放进 Agent Harness 上下文管理的整体框架里重新理解。核心论点是：Subagent 的价值不是"多一个 Agent 一起干活"，而是把那些"必须做、但做完不值得留在主窗口里"的探索过程隔离到独立工作区，主会话只回收结果。文章的副线呼应了 Kaxil Naik 的判断——「Harness matters more than the model」——并给出三层价值拆解：隔离、压缩、并行。

## 核心要点

- **核心定位**：Subagent = 独立工作区调用，不是"多一个 Agent 帮忙"。子代理有自己的上下文、系统提示词、工具集合、权限范围，主代理只回收结论
- **三类内置子代理**：Claude Code 自带 Explore、Plan 等内置子代理，已把最脏的探索阶段挡在主窗口之外
- **两种调用模式**：fresh subagent（默认，隔离输入）vs fork subagent（继承父会话完整背景，但放弃部分输入隔离）
- **`description` 是路由契约**：写得越清楚，Claude Code 越容易把任务派给正确的子代理
- **三层价值**：隔离（保护主 Agent 注意力）、压缩（50 次工具调用 → 3 行结论）、并行（独立调查路径并行跑）
- **使用边界**：能按上下文边界切开的任务才适合交给 Subagent；上下文切不干净、需要反复协商、共享中间状态的任务留在主循环里更稳
- **配置位置优先级**：组织级 managed settings → `--agents` CLI flag → `.claude/agents/`（项目级）→ `~/.claude/agents/`（个人级）
- **Harness > Model**：Kaxil Naik 在 Airflow/Astronomer 实践里复用 Skills、Hooks、MCP、CLI、Subagents、Agent teams 后的核心结论

## 深度分析

### 长会话为什么会变脏

半小时的 Claude Code 任务，模型读了 20-50 个文件，跑了几十次 `grep` / `find` / `ls`，执行测试、查看日志、调整方案。每次工具调用的输入和输出都会进入会话历史。在短任务里这不算什么，但在长任务中会出现三个层次的退化：

1. **密度下降**：几十次搜索结果、重复的目录列表、被截断的日志、已经排除的代码路径堆在同一段上下文里，真正有价值的信息被低密度内容稀释
2. **压缩损失**：上下文接近上限时系统做 compaction，把前面的内容压成摘要。如果窗口里大部分是探索痕迹，摘要很容易把"无用噪音"和"关键事实"混在一起
3. **决策依据磨平**：最后主 Agent 看到的是一段看似完整、实际变薄的历史，关键决策的依据可能在压缩中被磨掉，只剩一个貌似合理的总结

Daniel San 在原帖里给出一个直观数字：半小时之后可能积累 80k token 的噪音，这些信息再也不会回头看一遍。

### Subagent 的三层价值

文章把这件机制真正值钱的地方分成三层展开：

**第一层：隔离。** 子代理有自己的上下文窗口。它可以读 20 个文件、跑 30 次搜索、看一堆日志，主会话完全不用看这些过程，只接收最后的结论、证据和风险。

**第二层：压缩。** 子代理返回的是最终结果，不是完整探索轨迹。一段低密度过程被自然压成了高密度信号。原帖描述：原本主窗口里 50 次工具调用的过程，最后只剩 3 行结论，其余中间状态全部丢弃。Token 节省是次要的，主要价值是保护主 Agent 的注意力。

**第三层：并行。** 互不依赖的调查路径可以并行跑。一个子代理看认证模块，一个看数据库迁移，一个看 API 调用链，最后由主 Agent 汇总。配合 Subagent 的工具限制和权限范围，并行还能做到安全隔离——读日志的子代理和执行 SQL 的子代理是分开的。

### Subagent 文件结构

Claude Code 的 Subagent 用一个带 frontmatter 的 Markdown 文件定义。最简形态（来自原帖 code-reviewer 例子）：

```yaml
---
name: code-reviewer
description: Review code quality, security, and maintainability after code changes.
tools: Read, Grep, Glob, Bash
model: sonnet
---

You are a senior code reviewer.

When invoked:
1. Run git diff to inspect recent changes
2. Focus only on modified files
3. Start the review immediately
```

Claude Code 自动扫描这些文件，根据 `description` 决定何时调用哪个子代理。`description` 在这里承担路由契约的功能，写得越具体，调度就越准。

### 配置位置的优先级

| 优先级 | 位置 | 用途 |
|--------|------|------|
| 1 | 组织级 managed settings | 跨团队统一下发 |
| 2 | `--agents` CLI flag | 当前会话临时注入 |
| 3 | `.claude/agents/` | 项目级，适合纳入版本控制、团队共享 |
| 4 | `~/.claude/agents/` | 个人级，跨项目可用 |

项目级配置天然适合放进版本控制，让"团队对 Subagent 的约定"和"代码本身"一起演进。

### 使用边界与反模式

文章用 Metabase 团队的真实案例佐证这条边界——他们在一个 50 万行的 Clojure 后端代码库上做了 10 个 custom subagents，按子系统拆分，因为 Claude 每次为了理解一个子系统都要重新搜索、读取、摸索，这些探索会很快吃掉主上下文。他们的解法不是再加一个更全能的 Agent，而是按领域把工作边界拆成更具体的子代理。

反过来，下列场景不适合 Subagent：
- 需要频繁来回讨论的任务（多 Agent 交接成本高于隔离收益）
- 规划、实现、测试之间共享大量中间状态的任务（边界切不开）
- 一次性短任务（Subagent 启动成本反而高于直接执行）

### Harness > Model 的统一主线

把 Kaxil Naik、Metabase 团队、本文作者的材料放在一起看，作者提炼出一条贯穿 2026 年的统一主线：从「模型会不会写代码」悄悄挪到「上下文、权限、工具、知识和验证边界能不能管住」。Subagent 是其中一块拼图，但它的价值完全依附在 Harness 这层抽象上——再聪明的模型，在一个没有边界的 workspace 里也会变成一锅粥。

文章最让人警醒的一个细节是 Kaxil Naik 提到的"Agent 失败很多时候不是程序崩了，而是看起来挺对，差点就发出去了"——这恰恰是上下文污染的极致形态：模型被噪音稀释后，输出了语法上正确、语义上不靠谱的总结。Subagent 通过隔离探索过程，间接提高了最终判断的可信度。

## 实践启示

- **把 Subagent 当作上下文卫生工具**而不是多智能体表演：当一段工作"必须做但结果不需要追溯"时，是 Subagent 的甜区
- **`description` 字段是路由契约不是装饰**：要让 Claude Code 知道什么时候派这个子代理，必须用一句话写明触发场景和返回物
- **fresh vs fork 模式按需选择**：能完全独立的探索用 fresh（输入隔离优先）；需要继承父会话历史做协调的用 fork（上下文连贯优先）
- **把项目级 Subagent 配置纳入版本控制**：`.claude/agents/` 下的 Subagent 文件应和 `CLAUDE.md` 一起成为仓库的"运行说明书"
- **避免滥用 Subagent**：交接成本和上下文切分失败会消耗更多 token，反而更慢。能一个 Agent 干的事不要硬拆
- **关注工作集而非聊天记录**：Harness 层的核心 KPI 不是"保存发生了什么"，而是"下一轮推理到底需要什么"——Subagent 正是这种 KPI 的具体实现

## 相关实体

- [Harness Engineering Core Patterns Claude Code](ch03/074-claude-code.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch03/044-agent.md)
- [Claude Code Harness Deep Understanding](ch01/378-claude-code-harness-deep-understanding.md)
- [Claude Code Harness Deep Dive Founder Park](ch03/074-claude-code.md)
- [Hermes Agent V014 Architecture Shugex](ch03/044-agent.md)
- [Ai Agent Engineer Learning Roadmap Backend 2026](ch04/150-ai.md)
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [k-dense — the model is no longer the bottleneck](ch04/157-k-dense-the-model-is-no-longer-the-bottleneck.md)

---

