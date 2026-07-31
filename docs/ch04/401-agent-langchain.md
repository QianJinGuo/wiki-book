# 改进 Agent：数据挖掘视角与 LangChain 实践

## Ch04.401 改进 Agent：数据挖掘视角与 LangChain 实践

> 📊 Level ⭐⭐ | 7.6KB | `entities/agent-improvement-data-mining-trace-framework.md`

# 改进 Agent：数据挖掘视角与 LangChain 实践

> LangChain Labs 研究员 Viv 提出：持续学习、Harness 工程、后训练本质上都归结为同一件事——大规模地整理数据，用于运行实验、改进 Agent。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-improvement-data-mining-trace.md)


## 概念导图

```mermaid
mindmap
  root(("改进 Agent：数据挖掘视角与 LangChain 实践"))
    核心框架
      Trace 是 Agent 改进的「货币」
      数据整合闭环
      Harness vs 微调三明治
      核心公式
    LangChain 实践
    关键概念
    深度分析
      1. Trace 作为 Agent 改进的「货…
      2. Harness → 微调 → Harne…
      3. 评测集即训练数据：数据挖掘视角的统一框架
      4. Trace Judge Model：用小…
    实践启示
```

## 核心框架

### Trace 是 Agent 改进的「货币」

Agent 的行为比传统代码更不透明。我们用确定性换取了自主性，然后用 Trace 填补理解鸿沟。Trace 是 Agent 在环境中经验的投影，转化为可挖掘、可理解的数据格式。

### 数据整合闭环

| 方式 | 说明 |
|------|------|
| SFT/RL 整合回权重 | 收集训练数据微调模型 |
| Harness 工程 | 增加指令、工具、技能、编排策略 |
| 记忆库整合 | 用于上下文检索 |

### Harness vs 微调三明治

**Harness 工程 → 微调 → Harness 工程**

- Harness 工程：即时反馈、高带宽，适合大多数团队
- 微调：遇到智能天花板后，整理数据进行更长反馈周期的实验
- 再次 Harness 工程：探索新模型能力边界

### 核心公式

评测集 = Agent 的训练数据。找到好数据 + 找到好的拟合函数 = 改进 Agent。

## LangChain 实践

```mermaid
graph LR
    subgraph "数据准备"
        RAW[原始数据] --> CLEAN[清洗过滤]
        CLEAN --> ANNOTATE[标注/质量筛选]
        ANNOTATE --> SPLIT[训练/验证分割]
    end
    subgraph "训练阶段"
        PRE[预训练<br/>Next-Token]
        SFT[监督微调<br/>指令跟随]
        ALIGN[对齐<br/>RLHF/DPO/GRPO]
    end
    SPLIT --> PRE --> SFT --> ALIGN
    subgraph "高效训练"
        LORA[LoRA/QLoRA<br/>参数高效]
        DISTIL[知识蒸馏<br/>模型压缩]
        DS[DeepSpeed<br/>分布式]
    end
    SFT --> LORA
    ALIGN --> DISTIL
    PRE --> DS
    subgraph "评估"
        AUTO[自动评测<br/>基准测试]
        HUMAN[人工评测<br/>对抗测试]
    end
    ALIGN --> AUTO & HUMAN
    classDef data fill:#fef3c7,stroke:#d97706
    classDef train fill:#dbeafe,stroke:#2563eb
    classDef eff fill:#ede9fe,stroke:#7c3aed
    classDef eval fill:#d1fae5,stroke:#059669
    class RAW,CLEAN,ANNOTATE,SPLIT data
    class PRE,SFT,ALIGN train
    class LORA,DISTIL,DS eff
    class AUTO,HUMAN eval
```


- **Trace Judge Model**：微调开源小模型处理大规模 Trace，在窄任务上优于闭源前沿模型且成本低数个数量级
- **LangSmith Engine**：专用 Agent 阅读每条 Trace，发现信号、生成修复、生成评测集
- **Terminal Bench 2.0**：通过 Harness 调优 + Trace 理解取得 13.7% 提升

## 关键概念

- **Scaling Dreaming（规模化造梦）**：在大规模数据、长时间跨度上，将 Agent 数据整合回 Agent 本身
- **稠密反馈信号**：Trace 让反馈信号比简单标量奖励更丰富

## 深度分析

### 1. Trace 作为 Agent 改进的「货币」——重新定义观测性

Agent 的行为比传统代码更不透明，我们用确定性换取了自主性，然后用 Trace 填补理解鸿沟。Trace 不是简单的日志，而是 Agent 在环境中经验的完整投影——包含决策上下文、工具调用链、中间推理过程和最终结果。将 Trace 转化为可挖掘、可理解的数据格式，使得 Agent 改进从"猜它为什么错了"升级为"分析数据发现模式"。正如文章所说：每一家做持续学习的公司，本质上都是一家可观测性公司。

### 2. Harness → 微调 → Harness 的"三明治"改进策略

文章提出了一个简洁而深刻的改进策略循环：先用 Harness 工程获得即时反馈（增指令、加工具、改编排策略），遇到智能天花板后再收集训练数据做微调，微调后用新的 Harness 工程探索模型新能力边界。这个三明治结构的核心洞见是：Harness 工程适合大多数团队，反馈周期短、带宽高；微调是遇到天花板后的长反馈周期手段。两者不是替代关系，而是互补关系——Harness 工程决定上限在哪里，微调把上限往上推。

### 3. 评测集即训练数据：数据挖掘视角的统一框架

文章的核心公式是：评测集 = Agent 的训练数据。找到好数据 + 找到好的拟合函数 = 改进 Agent。这个视角将所有 Agent 改进手段（SFT/RL、Harness 工程、记忆库）统一为"数据整合问题"——区别仅在于整合的目标位置不同（权重、配置、上下文）。这种统一框架让团队不再是"看哪个方向火就试哪个"，而是基于数据驱动决策：分析 Trace → 发现改进点 → 整理评测集 → 运行实验，形成一个可测量、可复现的改进飞轮。

### 4. Trace Judge Model：用小模型解决窄任务的成本效益

LangChain 实践中的一个关键发现是：微调开源小模型处理大规模 Trace，在窄任务上不仅优于闭源前沿模型，而且成本低数个数量级。这意味着 Agent 改进的基础设施不必依赖昂贵的闭源 API——用更小的模型做更专注的任务（比如判断 Trace 中的错误模式），在成本和效果上都能取得更好的平衡。LangSmith Engine 进一步复用这个思路：一组专用 Agent 阅读每条 Trace，发现信号、生成修复、生成评测集。

### 5. Scaling Dreaming：规模化造梦的概念

Scaling Dreaming（规模化造梦）描述的是在大规模数据、长时间跨度上，将 Agent 数据整合回 Agent 本身的过程。这一概念与传统的"Scaling Law"的区别在于：它关注的不是模型参数量或训练数据量的简单增长，而是 Agent 在真实环境中产生的交互数据如何被系统性地回收、提炼、重新注入 Agent 系统的循环过程。这是一个从"被动训练"到"主动进化"的范式转变——Agent 不再是训练一次就固化的产物，而是持续从自身经验中学习的系统。

## 实践启示

1. **Trace 是 Agent 工程中最被低估的基础设施**：大多数团队只关心 Agent 能不能完成任务，不关心任务完成后留下的 Trace。但 Trace 是 Agent 改进的唯一可靠数据源。建议从第一天起就设计 Trace 收集方案——至少包含决策上下文、工具调用时序、中间推理和最终结果。

2. **先做 Harness 工程，再考虑微调**：对于大多数团队，Harness 工程的投入产出比远高于微调。Terminal Bench 2.0 仅通过优化 Harness 就取得 13.7% 的提升就是最好的证据。只有在 Harness 层面已经做到极致、遇到明确的智能天花板时，才值得启动微调。

3. **评测集就是你的训练数据**：整理高质量评测集不是"测试阶段的事"，而是 Agent 改进的核心资产。好的评测集应该来自真实 Trace 中的失败模式，而非人工编写的理想场景。每次修复一个 Agent 错误，都应该将其归入评测集。

4. **用小模型做 Trace 分析，用大模型做决策**：Trace Judge Model 的实践证明，在 Trace 分析这类窄任务上，微调小模型的效果和成本远优于通用大模型。建立"专用小模型过滤 → 大模型决策"的分层分析管道，是 Agent 改进工程化的关键架构决策。

5. **Agent 改进是一个数据飞轮，不是一次性工程**：Scaling Dreaming 的核心启示是——Agent 改进不能靠"一次性优化"完成，而必须建立从 Trace 收集 → 数据分析 → 改进实验 → 重新部署的持续闭环。每轮循环的产出就是下一轮的输入。

## 关联

- [Agent vs Workflow 控制权连续谱](ch04/678-agent-vs-workflow.html) — Agent 工程化
- [Loop Engineering](../ch05/004-loop-engineering.html) — Agent 循环决策与 Harness 工程的交叉
- [Spec Kit/OpenSpec/Superpowers 融合 Harness](../ch05/050-openspec.html) — Harness 工程实践

---

