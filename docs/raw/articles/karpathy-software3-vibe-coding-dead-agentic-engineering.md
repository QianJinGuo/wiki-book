---
title: "Karpathy加入Anthropic后首讲：Vibe Coding已死，Software3.0来了"
description: "Karpathy最新访谈：Software 1.0/2.0/3.0三代范式，Vibe Coding分叉(S原型/P生产)，LLM是幽灵(Jagged智能)，可验证性是核心变量，Agentic Engineering能力图谱"
source_url: "https://mp.weixin.qq.com/s/Ab_dbrinxK8wNSWvYRCxFw"
feed_name: "萤火AI百宝箱"
author: "FLY AI CLOUD"
ingested: "2026-05-29"
type: article
tags: [karpathy, software-3.0, vibe-coding, agentic-engineering, llm, verifiability, framework]
sha256: "43ebab143443ddc72d4d3e8c24d30d6a833909aef69c892e9c0c538d4ffeb757"
---

# Karpathy加入Anthropic后首讲：Vibe Coding已死，Software3.0来了

> 来源：萤火AI百宝箱 | 2026-05-25 | 基于Karpathy最新访谈

## 核心框架：Software 1.0/2.0/3.0 三代范式

| 范式 | 编程方式 | 本质 |
|------|---------|------|
| Software 1.0 | 显式代码 | 告诉计算机"怎么做" |
| Software 2.0 | 神经网络/RL | 训练数据定义行为 |
| **Software 3.0** | **提示词+上下文** | **告诉LLM"做什么"，Prompt=新代码，Context=新编程环境** |

**关键洞察**：Software 3.0时代，编程本质已变——不再告诉计算机"怎么做"，而是告诉LLM"做什么"。

## Vibe Coding分叉：从狂欢到严肃

**Karpathy修正**（2026年）：
- Vibe Coding 在**原型阶段（Prototype）**依然有效
- 进入**生产环境（Production）**必须有更严肃的工程框架 → **Agentic Engineering（智能体工程）**

**Karpathy精确表述**：
> "Vibe Coding 是提升每个人的软件能力下限；Agentic Engineering 是在保持原有专业水准的前提下，用AI获得速度提升。前者是让更多人能做软件，后者是让会做软件的人做得更快、更好。"

对产品经理的启示：产品原型可用Vibe Coding快速验证假设，但进入工程化阶段必须建立系统性评估框架（Eval Harness）——否则在积累技术债而非加速。

## LLM是幽灵（Ghost），不是动物（Animal）

**Jagged（锯齿状）智能**：最先进模型能重构10万行代码库、发现零日漏洞，却可能说"洗车店只有50米，走着去"——因为不知道你开车来是为了洗车。

**启示**：
- 不要因AI在某领域表现惊艳就假设它在所有领域同样可靠
- 始终为AI输出保留人工复核环节，尤其在"训练盲区"
- 关注它的数据分布，而非"情绪状态"

## 可验证性（Verifiability）：核心变量

**矩阵逻辑**：
- 传统计算机自动化：能被精确规定的任务（可编码性）
- 现代LLM自动化：能被精确验证的任务（可验证性）
- 实验室大量RL训练 = 在可验证环境中不断迭代 → 形成峰值能力

**寻找"高可验证性 × 低实验室关注"的行业场景**——AI创业蓝海。例如：专业法律合规检查、特定工业质检流程。

## Agentic Engineering核心能力图谱

**Karpathy最重要的一句话**：
> "You can outsource thinking, but you can't outsource understanding."

AI产品经理的核心能力：不是"谁能用好AI工具"，而是"谁真正理解用户、业务和技术的本质"。工具可以外包，理解不能。

## 行动建议

1. **重新定义"产品验证"流程**：建立系统性评估框架（Eval Harness），不只是看演示效果
2. **寻找高可验证性场景**：AI创业蓝海在"验证环境明确但实验室没专门做RL"的领域
3. **区分Vibe Coding和Agentic Engineering场景**：原型用Vibe快速验证，生产用Agentic严格工程化

---

→ [[raw/articles/karpathy-software3-vibe-coding-dead-agentic-engineering|原文存档]]
