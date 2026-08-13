# Prime Agent — 以 RLM + Continual Harness 双抽象为核心的自改进编码 Harness

## Ch09.162 Prime Agent — 以 RLM + Continual Harness 双抽象为核心的自改进编码 Harness

> 📊 Level ⭐⭐ | 4.7KB | `entities/prime-agent-self-improving-rlm-agent.md`

# Prime Agent — 以 RLM + Continual Harness 双抽象为核心的自改进编码 Harness

## 核心主张

Prime Intellect 于 2026-08-05 发布 Prime Agent——一个围绕两个抽象构建的自改进编码 harness：**Recursive Language Model (RLM)** 与 **Continual Harness**。其论点在于：现代 harness 设计基于早期模型能力，固定 tool-calling schema 与 context compaction 迫使模型绕开自身脚手架工作；静态的 sub-agent / prompt / skill / memory 在设计时一次设定、运行中从不适应。Harness 应外推当前模型能力，向下一前沿推理模式演进。

## 两大核心抽象

**RLM（Recursive Language Model）**：把 context 视为变量、把 sub-agent 委派视为 REPL 内的函数调用。持久 IPython REPL 给模型对其历史、sub-agent、工具的程序化访问权——agent 可以把「语言模型程序」写成作用于自身 context 的动作，从而在任意长会话中不丢失对自身过去信息的访问（信息存于变量中）。

**Continual Harness**：把 harness 自身状态（抽象为 prompts、skills、memory、sub-agents）视为 agent 可以从自身轨迹中 **CRUD**（create/read/update/delete）的对象。配合 agent-to-agent 通信，该机制支持跨 sub-agent 甚至跨 Prime Agent session 的编排——例如 spawn 持久 sub-agent、在轨迹后期给它们发消息、与另一个 Prime Agent session 直接通信。

## 架构要点

- **单一工具 = 持久 IPython kernel**：模型只有 kernel 一个工具，其他标准 harness 功能（包括 sub-agent，每个都是另一个 prime-agent 实例）作为 kernel 内函数被调用。
- **后台 daemon + Agents View**：daemon 通过本地 socket 持有所有活跃 session，可 attach/detach 而不影响 agent 循环；session 树跑在可恢复的 worker 进程中，worker 崩溃后从 session JSONL + kernel 状态快照恢复。Agents View 递归连接 agent 与 sub-agent（Running-Idle-Inactive 状态机，空闲 30 分钟卸载、被寻址时从磁盘重载）。
- **Session 历史 = append-only JSONL**：每行一个 JSON 条目（消息、模型切换、compaction 摘要、扩展条目）；branching/fork/clone 通过移动 leaf pointer 在同一文件内完成，`/tree` 可恢复全历史。Compaction 触发时用 spawn 的 agent 充当垃圾收集器，异步同时清理 kernel 与主 context。
- **PTC（Programmatic Tool-Calling）**：kernel 初始化时预导入每个 skill/tool 为模块，包括用于递归程序化 sub-agent 调用的 `rlm`。

## 定位与意义

Prime Agent 定位为通用编码助手、长程自主评估的默认 runtime、以及 research/autoresearch 协作器，完全开源。其「harness 状态可被 agent 自身 CRUD」与「context 作为 REPL 变量」的设计，与 [Agent Harness Engineering 范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md) 中「harness 即产品表面」的演化方向一致，也是 RLM 训练思路（见同团队 NanoGPT 递归自改进实验 [Prime Intellect 递归自改进实验](../ch05/105-ai.html)）从训练侧延伸到 harness 设计侧的落地。

## 相关

- [Agent 自改进循环](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-self-improvement-loops.md)
- [Agent 记忆系统设计](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-system-design.md)
- [Sub-agent 派生模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/subagent-spawning-pattern.md)
- [Coding Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/coding-harness-engineering.md)
- [Agent Harness 架构](../ch05/042-agent-harness.html)
- [Harness 12 组件 / 7 决策](../ch05/042-agent-harness.html)
- [Agent 自改进六机制](../ch03/037-agent.html)
- [Lilian Weng 自改进 survey](../ch05/065-harness-engineering.html)
- [Autoresearch 反馈环](../ch03/037-agent.html)
- [Agent Context 管理模式](../ch03/037-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/prime-agent-self-improving-rlm-agent.md)

---

