---
title: "清华参考 Pytorch 开源 OpenRath：以Session为核心的多Agent运行时"
source_url: "https://mp.weixin.qq.com/s/m04ZRz2FAjWzv2MUeeNUIg"
author: "Hyman的杂货铺"
published: 2026-06-28
ingested: 2026-06-28
language: zh
type: raw
sha256: "06acc1b425e3353a1739b57db3c1156e00d5fd8a955344c2a703b259ab57a618"
---

# 清华参考 Pytorch 开源 OpenRath：以Session为核心的多Agent运行时

## 一句话讲清楚

OpenRath 把多智能体系统里分散在聊天记录、工具日志、沙箱、记忆和分支里的运行状态，统一收进一个可分叉、可合并、可回放的 Session 对象，让 Agent 集群从"群聊式协作"变成"有证据链的运行时系统"。

## 上百个 Agent，最先乱掉的是状态

把一个 Agent 跑成 demo，通常不难。真正麻烦的是系统跑起来以后。

一个 Agent 复制了一份上下文，另一个 Agent 又复制了一份；某条分支跑了测试，另一条分支改了文件；记忆后端召回了一段旧经验，工具执行又落在某个沙箱目录里。最后答案出来了，但你想追问一句：这个结论到底来自哪条分支？哪个工具改过文件？哪段记忆影响了判断？

很多系统答不上来。因为这些状态通常被拆散了：聊天记录在消息列表里，工具调用在日志里，沙箱位置在执行器里，记忆在数据库里，分支关系在控制器代码里。

OpenRath 的出发点就在这里。它先把问题落到一个运行时对象上：**Agent 系统运行时，哪一个值应该承载这次工作的证据？**

答案是 Session。

## 别把 Session 理解成一份聊天记录

OpenRath 里的 Session 要大得多。它是程序真正传来传去的运行时值，里面装着按顺序排列的对话块、沙箱位置、分支血缘、token 用量、待处理工作、工具证据，以及记忆交互进入运行记录的位置。

可以把它理解成一次 Agent 工作的"运行账本"。

论文里把三类常见记录区分得很清楚：

| 记录类型 | 主要读者 | 主要内容 |
|----------|----------|----------|
| 图检查点 | 调度器 | 执行到哪一步 |
| Trace span | 观察者 | 运行时观察到什么 |
| Session | Agent 程序 | 可传递的工作状态 |

如果证据只是事后从日志里拼回来的，系统当然也能做观测。但一旦程序继续往下跑，Agent 仍然拿不到一个统一的状态对象。OpenRath 把证据挂在程序正在传递的值上，相当于让运行时状态跟着工作本身流动。

## 借 PyTorch 的程序组织方式

论文反复强调，OpenRath 借 PyTorch 作类比，重点不在张量计算，而在它组织程序的方式。

| PyTorch | OpenRath | 含义 |
|---------|----------|------|
| Tensor | Session | 流动的运行时值 |
| Device | Sandbox | 工具执行的位置 |
| Parameter | Memory | 持久状态平面 |
| Module | Workflow | 可组合工作流 |

核心对象词汇很小：Session、Agent、Tool、Sandbox、Memory、Workflow、Selector。

- Session 承载运行时状态
- Agent 是可复用的 `Session -> Session` 变换
- Tool 暴露 schema，副作用通过 Sandbox 执行
- Workflow 组合多个 Agent、工具、分支
- Selector 在运行时选择下一段 Workflow

**最值得注意的是每个对象"不拥有"什么**：Agent 不拥有完整会话图，血缘属于 Session；Tool 不拥有执行位置；Workflow 不额外制造私有调度状态；Memory 的 recall/commit 事件要进入可见的运行记录。

## 生命周期：一次运行如何变成一张图

真实任务经常是图。你会从一个 Session 分出两条支路：一条做资料检索，一条做代码实验；或者让 QA Agent 在某个中间状态上复核，再把通过的分支合并回来。

| 阶段 | 变得可审计的内容 |
|------|-----------------|
| 创建 | 初始文本、角色和块序列 |
| 放置 | 后端意图和 workspace |
| 变换 | 模型调用、工具结果和用量 |
| 分支 | 父 Session、fork、merge |
| 持久化 | JSONL、血缘、回放证据 |
| 释放 | 沙箱句柄和资源生命周期 |

两个工程化细节：
1. fork、detach、merge 都是运行时操作。fork 复制当前状态并保留父子关系；detach 切断父血缘；merge 检查沙箱兼容性。
2. 合并会检查执行环境——分支是否能合并，既看"聊天内容能不能放一起"，也看"它们的执行环境是不是同一个意义上的环境"。

## 工具调用要留下可检查的证据

OpenRath 的工具路径分层很清楚：模型看到 FlowToolCall 的 schema；Session loop 收集工具；模型返回工具调用名和参数；运行时解析工具、校验参数，通过 Session 的 Sandbox 执行。无论成功、异常、未知工具还是参数错误，最后都变成 Session 里的 tool-result chunk。

这让工具调用从"模型说它做过什么"变成"运行时记录它实际做过什么"。

## Claim-to-evidence 协议

报告里的 claim 要通过 ledger、evidence packets 和 smoke suite，才能进入 supported text 或 scoped limitation。每个结论挂证据等级：supported、partially supported、prerequisite-supported、evidence-gated。

一个 evidence packet 包含：产生该运行的命令、manifest、源代码和环境元数据、Session JSONL 或工具日志、生成产物，以及"它证明什么、不证明什么"的短说明。

## 局限

- 没有广泛 benchmark 对比
- Memory 质量未验证
- 安全属性未证明（工具使用会扩大攻击面，包括间接 prompt injection）
- OpenSandbox 在当前环境里属于 optional skip
- 云端后端未验证

## 与现有框架的区别

| 框架 | 关注点 |
|------|--------|
| AutoGen | 多 Agent 对话可编程 |
| LangGraph | 图状态解决持久执行、resume、time travel |
| OpenAI Agents SDK | agents、handoff、guardrails、trace 产品化 |
| MCP | 工具接入协议边界 |
| **OpenRath** | **运行时状态边界：效果回到 Agent 程序后以什么形态传递、分叉、合并和检查** |

## 总结

OpenRath 的价值在于，它把状态管理问题收束到一个对象上。如果说深度学习框架让开发者围绕 Tensor 和 Module 组织计算，那么 Agent 运行时也需要一个类似的核心值。

对今天的开发者来说，这篇论文最值得带走的是一条判断标准：当你的 Agent 系统开始分角色、分工具、分沙箱、分记忆、分支路时，别只问"再加哪个 Agent"。先问一句：**这次运行的真实状态，究竟由谁来拥有？**
