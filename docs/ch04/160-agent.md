# Agent 上下文窗口管理对比

## Ch04.160 Agent 上下文窗口管理对比

> 📊 Level ⭐⭐ | 12.8KB | `entities/context-window-management.md`

## Overview
对比 Pi、OpenClaw、Claude Code、Letta 四个主流 agent 框架的上下文窗口管理策略——文件读取截断、工具结果预算、会话压缩（compaction）、子 agent 隔离。揭示四大框架在上下文管理上的设计收敛：**硬上限+分页+LRU+LLM驱动压缩已成工程共识**，类比传统计算的内存管理系统分层设计哲学。
**核心洞察：** 上下文不再只是 transcript 里刚好能放下的内容。它变成了系统必须主动管理的对象。最佳设计应让模型自主管理上下文预算，类似于内存管理系统对程序不可见的分层管理。

## 文件读取策略对比
| 框架 | 截断策略 | 上限 | 特色 |
|------|---------|------|------|
| Pi | 头部截断 + 继续提示 | 2,000行 / 50KB | harness 优先，主动保护+教模型分页 |
| OpenClaw | 头部+尾部切分（75/25） | bootstrap 12K字符/60K总计，工具结果 16K字符/30%上下文 | 纵深防御，多层上限叠加 |
| Claude Code | 头部截断 + 双层门禁 | 256KB 字节门禁 + 25,000 token 预算，支持远程调参 | 文件去重（同一范围重复读取返回 stub） |
| Letta | 向量嵌入+LRU | 按上下文窗口分档：8K→5K, 32K→15K, 128K→25K, 200K+→40K | memory 优先，向量库+原始文本双存储 |

## 会话压缩（Compaction）策略对比
| 框架 | 触发条件 | 压缩方式 | 安全机制 |
|------|---------|---------|---------|
| Pi | 超过 contextWindow - 16,384 tokens | LLM 总结，前置为合成 user message | 保持 tool-call/result 边界完整 |
| OpenClaw | 历史超过上下文窗口 50% | 分阶段多轮 LLM 总结+merge，压缩前 agent 主动持久化状态到 memory 文件 | repairToolUseResultPairing 修复孤立工具结果；第二层 5 分钟缓存 TTL soft-trim/hard-clear |
| Claude Code | 超过有效上下文窗口 - 13,000 tokens（200K 模型约 167K 时触发） | 九段结构化 prompt 总结，scratchpad 分离；compaction 后自动重新附加最多 5 个最近读取文件 | 分离 tagged blocks 生成 analysis scratchpad + final summary；prompt-too-long 确定性 head-drop 兜底 |
| Letta | 超过上下文窗口 90% | 滑动窗口（从 30% 消息开始，每轮+10%）；self-compact（用自己模型总结）；两阶段兜底（钳制到 5K字符→中间截断 30%/30%） | 两阶段防止 summarizer 本身溢出 |

## 子 Agent 隔离策略对比
| 框架 | 隔离策略 | 上下文继承 |
|------|---------|-----------|
| Pi | 每个任务新进程，内存中新会话 | 只收到任务字符串，无父历史 |
| OpenClaw | 默认 fresh isolated sessions | fork 模式才复制父 transcript，只适用于 same-agent spawns；workspace 过滤到 allowlist |
| Claude Code | typed-agent 默认空白对话；fork 路径复制完整父消息历史 | prompt cache sharing；skills 提前预加载为 user messages；worker 工具按自己权限重建 |
| Letta | 普通工具完全不 fork，主 agent loop 内执行 | 通过 conversation search 和 archival memory search 访问历史 |

## 关键收敛发现
**功能层面（四个框架共同点）：**   ^["raw/articles/context-window-management-comparison"]
1. 对文件读取设置硬上限   ^["raw/articles/context-window-management-comparison"]
2. 支持 offset/limit 分页   ^["raw/articles/context-window-management-comparison"]
3. 限制工具结果大小   ^["raw/articles/context-window-management-comparison"]
4. 隔离子智能体会话   ^["raw/articles/context-window-management-comparison"]
5. 由 token 阈值触发、LLM 驱动的 compaction   ^["raw/articles/context-window-management-comparison"]
6. 估算上下文使用量并检测压力   ^["raw/articles/context-window-management-comparison"]
**具体设计押韵：**   ^["raw/articles/context-window-management-comparison"]

- Pi + OpenClaw：文件读取头部截断 + 继续提示
- Claude Code + OpenClaw：超大工具结果持久化到磁盘
- Pi + OpenClaw + Claude Code：compaction 期间保持 tool-call/result 边界安全
- 三个支持父 transcript fork 到子 agent
**跨领域独立收敛：** Arize Alyx（数据探索 agent，非代码编辑）独立走到了同样的设计模式——工具结果 10K-token 预算、二分搜索找最大数据集切片、长 cell value 头尾截断+back-reference、50K tokens 强制 checkpoint。这说明这些模式是同一工程问题的收敛解法。

## 与传统内存管理的类比
| 计算系统 | Agent Harness |
|---------|--------------|
| 寄存器/缓存 | 高价值状态（当前任务、最近读取文件） |
| 虚拟内存/分页 | offset/limit 分页读取 |
| 内存置换 | LLM 驱动的 compaction/summarization |
| 程序视角 | 模型只管执行，系统自动管理工作集 |

## 深度分析
**1. 设计哲学的收敛不是巧合，而是工程约束的必然**   ^["raw/articles/context-window-management-comparison"]
Pi、OpenClaw、Claude Code、Letta 四个框架在上下文管理上独立演进，却收敛到几乎相同的设计模式：硬上限 + 分页 + LRU + LLM 驱动压缩。这不是因为团队互相参考（它们几乎是同期独立开发的），而是因为上下文窗口是一个硬性物理边界——任何试图优雅地管理它的系统都会被这个约束推向同样的局部最优。
**2. Compaction 的触发线设计反映了框架对"安全"的优先级排序**   ^["raw/articles/context-window-management-comparison"]
| 框架 | 触发线 | 压缩方式复杂度 | 安全机制层数 |
|------|--------|--------------|------------|
| Pi | contextWindow - 16,384 | 单轮 LLM 总结 | 1（边界完整性） |
| OpenClaw | 50% 历史 | 多阶段 merge + 持久化 | 3（repair + TTL缓存 + 过滤） |
| Claude Code | effective窗口 - 13,000 | 九段结构化 prompt | 2（scratchpad 分离 + stub兜底） |
| Letta | 90% 窗口 | 滑动窗口 + self-compact | 2（两阶段防溢出） |
Claude Code 和 OpenClaw 的安全机制最复杂——这与它们面向"生产级长时间任务"的用户定位一致。Letta 的 90% 触发线看起来激进，但它的滑动窗口设计天然地分散了压缩压力，不需要一次性大手术。
**3. 子 Agent 隔离策略揭示了"记忆所有权"的核心问题**   ^["raw/articles/context-window-management-comparison"]
Pi 的完全隔离（每个任务新进程、无父历史）和 Letta 的完全共享（普通工具不 fork，通过 memory search 访问）代表了两个极端：前者简单安全但效率低，后者高效但引入了记忆混淆风险。OpenClaw 和 Claude Code 的 fork 模式是在这两个极端之间的实用主义折中——按需复制，而非强制隔离或强制共享。
**4. 向量嵌入 + LRU 的 Letta 方案代表了一条尚未被充分验证的路**   ^["raw/articles/context-window-management-comparison"]
Letta 的双存储（向量库 + 原始文本）理论上可以兼顾检索效率和保真度，但向量化的语义压缩是否会在某些边界 case 下丢失关键上下文细节（如精确的代码位置、变量名）仍未被生产环境充分验证。这是一个值得持续跟进的架构方向。

## 实践启示
**对于 Agent 框架开发者：**   ^["raw/articles/context-window-management-comparison"]

- 不要试图用单一策略管理所有上下文场景——分层设计（截断层 + 预算层 + 压缩层）才是鲁棒的
- Compaction 触发线应留有远程可调参数，让运维人员根据实际任务类型动态优化
- 子 agent 的记忆隔离策略应作为框架的"一级配置项"，而非事后补丁
**对于 Agent 应用开发者：**   ^["raw/articles/context-window-management-comparison"]

- 在设计任务时，预估上下文消耗并主动做"上下文预算"——比如长任务拆分为多个短任务，每个任务独立的上下文窗口
- 使用 OpenClaw/Claude Code 时，利用 fork 机制将复杂任务拆解为"规划子 agent + 执行子 agent"，避免单一长会话的上下文压力
- 监控 compaction 频率——频繁触发 compaction 往往是任务设计有问题的信号，而非框架问题
**对于评估与选型：**   ^["raw/articles/context-window-management-comparison"]

- 评估框架时，不仅看上下文上限数字，更要看：① 压缩后信息的保真度；② 压缩触发的确定性（是否可预测、可调）；③ 工具结果是否会被意外截断
- 如果你的场景是"短任务高并发"（如客服 bot），Pi 的进程隔离模型更安全；如果是"长任务深度推理"（如代码生成），OpenClaw/Claude Code 的 fork + 压缩模型更高效

## Related
- [OpenClaw 架构解析](https://github.com/QianJinGuo/wiki/blob/main/concepts/openclaw-architecture.md) — bootstrap 文件机制、工具结果预算、compaction 实现
- [Claude Code 架构解析](../ch03/076-claude-code.html) — 文件读取双层门禁、查询前优化、compaction 触发机制
- [Agent Skill 编写指南](ch04/265-agent-skill.html) — Skill 的渐进式上下文注入机制
- [AI Agent工具数量陷阱——5个边界清楚的工具胜过20个模糊工具](ch04/030-ai-agent.html)
- [Claude Code vs OpenClaw Agent 记忆系统对比](../ch03/076-claude-code.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch01/456-claude-code-harness-deep-understanding.html)
- [两万字详解Claude Code源码核心机制](../ch03/076-claude-code.html)
- [OpenCLAW 完全指南](../ch11/225-openclaw.html)
- [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](../ch07/006-claude-code-skills-mcp-rules.html)
- [OpenClaw Agent 可观测性体系 — Session 审计日志 + OTEL + SLS](../ch01/1139-openclaw-agent.html)
- [Anthropic 官方技能最佳实践：14 个可复用的 Agent Skills 设计模式](ch04/392-agent-skills.html)
- [Claude Code 源码拆解：从启动到多 Agent 扩展层](../ch03/076-claude-code.html)
- [Claude Code MCP Server](../ch07/027-claude-code-mcp-server.html)
- [Agent 可靠性的工程解法：从 Skillify 看持续改进机制](ch04/267-skill.html)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](../ch03/046-agent.html)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](../ch03/046-agent.html)
- [Claude 发布官方报告，承认存在 3 处质量退化问题](../ch01/1149-claude.html)

- [Claude Code 开发负责人：为何放弃 RAG 而选择 Agentic Search](../ch03/076-claude-code.html)
- [Harness如何支撑Agent在生产环境稳定运行？](../ch05/018-harness.html)
- [Harness Engineering 七层框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-7-layers-framework.md)
[Context Window 管理对比](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/context-window-management-comparison.md)

## 相关实体
- [AIAIGC峰会嘉宾阵容](ch04/501-aiaigc.html)

- [OpenClaw 完全指南：这可能是全网最新最全的系统化教程了！（3.2W字，建议收藏）](../ch11/225-openclaw.html)
- [Boris Cherny — 从 IDE 到 Agent 控制台](../ch03/046-agent.html)
- [Hermes Agent vs OpenClaw 对比分析](../ch03/092-hermes-agent.html)
- [AutoClaw 使用体验：自带 66 个 Skill、可接入聊天工具、安全性高](ch04/267-skill.html)
- [Skills 系统设计三方对比](https://github.com/QianJinGuo/wiki/blob/main/comparisons/skill-system-design-comparison.md)
- [Claude Code vs OpenClaw 记忆系统 — 向量数据库必要性反思](../ch03/076-claude-code.html)

---

