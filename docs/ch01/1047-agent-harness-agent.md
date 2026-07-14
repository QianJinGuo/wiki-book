# Agent Harness 综述：同一个模型，为什么做出来的 Agent 差这么远

## Ch01.1047 Agent Harness 综述：同一个模型，为什么做出来的 Agent 差这么远

> 📊 Level ⭐⭐ | 3.6KB | `entities/agent-harness-综述同一个模型为什么做出来的-agent-差这么远.md`

# Agent Harness 综述：同一个模型，为什么做出来的 Agent 差这么远

**来源**: 架构师

**发布日期**: 2026-04-19

**原文链接**: https://mp.weixin.qq.com/s/h49UiGERvz8BMkMW0_4Gwg

---

架构师（JiaGouX）

我们都是架构师！

架构未来，你来不来？

最近多看几篇 Agent 文章，就会反复遇到同一个词： Harness 。

但这个词越讲越糊。

有人把它理解成工具系统。有人把它理解成 Prompt 外面那层壳。也有人把它理解成多 Agent 编排、Memory、Sandbox、Hooks、Skills 这些东西的总和。

这些说法都沾边，但都还没有落到主要承重的地方。

这两天反复读 Akshay 写的  The Anatomy of an Agent Harness  ，最有启发的地方，不是又盘了一遍产品名单，而是它把视角从“模型有多强”挪到了“模型外面那套系统到底在干什么”。

原文信息量很大，也铺得很开。我们不做逐段翻译，有兴趣可以直接看原文。我们换另外一个角度来看：

同一个模型，为什么做出来的 Agent 会差这么远。

我自己的理解是： Harness 是在模型和真实交付之间，补上一套可运行、可恢复、可验证、可治理的软件系统。

把这个问题想清楚以后，Harness 不再像一个什么都能往里装的热词了。

## 太长不看版

- • Harness 是包住模型的整套运行系统：主循环、工具、上下文、状态、权限与错误、验证。

- • Prompt 管怎么表达任务，Context 管模型看到什么，Harness 管系统怎么跑、怎么停、怎么纠偏。

- • 2026 年大家都在讲 Harness，因为模型能力上来之后，瓶颈从“能不能答”转向“能不能稳定交付”。

- • 同一个模型，只换 Harness，不换权重，结果可能差出一个量级。LangChain 只换外围基础设施，就从 TerminalBench 2.0 前 30 名外拉到第 5。

- • 模型和 Harness 是协同演化的。Claude Code 的模型在训练阶段就把特定 Harness 放进了训练回路。

- • Harness 的演进方向是变薄，Manus 半年内重建五次，每次都在做减法。但 Harness 不会消失。

- • 如果一个 Agent 还不稳定，值得先检查的，通常是 Harness。

## Harness 不只是一层壳

我们先把三个词分开看。

- •
  Prompt Engineering
  ：解决的是“怎么对模型说”。

- •
  Context Engineering
  ：解决的是“让模型在这一轮看到什么”。

- •
  Harness Engineering
  ：解决的是“整套系统怎么运行，怎么持久化，怎么验证，怎么兜底”。

这三层是包含关系。

Prompt 更像指令。

Context 更像喂给模型的工作台。

Harness 更像操作系统。 Akshay 引用了 Beren Millidge 2023 年的类比：裸的 LLM 是一颗没有 RAM、没有磁盘、没有 I/O 的 CPU。上下文窗口充当内存，外部数据库充当磁盘，工具集充当设备驱动。让这台机器持续跑起来的，是外面这套调度、执行、校验和保护机制。

Harness 回答的是一个工程问题：怎样把一个无状态、会推理的模型，变成一个能持续交付结果的系统。

聊天模

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-综述同一个模型为什么做出来的-agent-差这么远.md)

---

