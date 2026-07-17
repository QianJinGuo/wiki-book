# 超级AI背后的秘密武器：Agent Harness深度解析

## Ch01.1075 超级AI背后的秘密武器：Agent Harness深度解析

> 📊 Level ⭐⭐ | 3.6KB | `entities/超级ai背后的秘密武器agent-harness深度解析.md`

# 超级AI背后的秘密武器：Agent Harness深度解析

**来源**: Unknown

**发布日期**: 2026-04-15

**原文链接**: https://mp.weixin.qq.com/s/Y0kRzN1DbX7My3cz4eVR1Q

---

# 你的 AI 为什么总在演示时掉链子？

你做过一个聊天机器人。也许还接上了几个工具，跑个 ReAct 循环。演示的时候一切正常。

然后你尝试把它做成生产级产品，轮子就开始掉了：模型三步之后就忘了自己干了什么，工具调用悄无声息地失败，上下文窗口里塞满了垃圾数据。

问题不在你的模型。问题在模型周围的一切。

LangChain 证明了这一点：他们只改了 LLM 外围的基础设施（同样的模型，同样的参数），排名就从 TerminalBench 2.0 的前 30 名之外一路飙升到第 5 名。还有一个研究项目，让 LLM 自己优化基础设施，最终达到 76.4% 的通过率，超过了手工设计的系统。

这套基础设施，现在有个专门的名字： Agent Harness 。

## 什么是 Agent Harness？

这个术语是 2026 年初正式提出的，但概念早就存在了。Harness 是包裹 LLM 的完整软件基础设施：编排循环、工具、记忆、上下文管理、状态持久化、错误处理和防护机制。

Anthropic 的 Claude Code 文档说得很直白：SDK 就是"驱动 Claude Code 的 Agent Harness"。OpenAI 的 Codex 团队用同样的框架，明确把"Agent"和"Harness"等同起来，指的都是让 LLM 有用的非模型基础设施。

我很喜欢 LangChain 的 Vivek Trivedy 那句经典公式： "如果你不是模型，那你就是 Harness。"

这里有个容易混淆的区别。"Agent"是涌现出来的行为——那个有目标导向、会使用工具、能自我纠正的实体，是用户实际交互的对象。Harness 是产生这种行为背后的 machinery。当有人说"我做了个 Agent"，他们的意思是"我做了个 Harness，然后接了个模型"。

Beren Millidge 在 2023 年的文章里把这个类比讲得更精确。他把原始 LLM 比作一台只有 CPU、没有内存、没有硬盘、没有输入输出设备的计算机。上下文窗口充当内存（快但容量有限），外部数据库充当硬盘存储（容量大但慢），工具集成充当设备驱动。 Harness 就是操作系统 。

正如 Millidge 写的："我们重新发明了冯·诺依曼架构"，因为这对任何计算系统来说都是自然的抽象。

## 工程三层论

围绕着模型，有三个同心圆式的工程层次：

- •
  提示工程
  ：雕琢模型收到的指令

- •
  上下文工程
  ：管理模型能看到什么、什么时候看到

- •
  Harness 工程
  ：涵盖以上两者，再加上整个应用基础设施——工具编排、状态持久化、错误恢复、验证循环、安全执行和生命周期管理

Harness 不是提示的包装器。它是让自主 Agent 行为成为可能的完整系统。

## 生产级 Harness 的 11 个核心组件

综合 Anthropic、OpenAI、LangChain 和更广泛的实践社区，一个生产级的 Agent Harness 有 12 个不同的组件。

### 1. 编排循环

这是心脏跳动。它实现了思想 - 行动 - 观察（TAO）循环，也叫 ReAct 循环。循

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/超级ai背后的秘密武器agent-harness深度解析.md)

---

