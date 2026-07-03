# 做Agent评测的几个反直觉感悟

## Ch04.570 做Agent评测的几个反直觉感悟

> 📊 Level ⭐⭐ | 2.1KB | `entities/langfuse-agent-eval-tracing-cost-structure.md`

# 做Agent评测的几个反直觉感悟

## 摘要

从小红书博主"脆皮乌龙茶"关于用 Langfuse 做 Agent Evals 的实战经验出发，提出一个反直觉判断：**有些质量优化看似提升答案，实际是在破坏产品可规模化性。** 核心论点：Tracing 的价值不是优化单次回答质量，而是暴露 Agent 成本结构中的瓶颈环节——哪个 Observation 让成本失控，哪一步阻塞了用户等待。

## 核心见解

### Bad Case 的普遍特征

- **极端边界**：常规路径正常，边界条件出问题
- **模型幻觉**：LLM 自身的不确定性引入的噪音
- **技术修复 ROI 高**：修一个 badcase 投入大，收益有限
- **偶发**：难以复现，难以定位

### 质量与规模化的矛盾

一个 Agent 如果为了更稳的回答，每次都做：

```
8 次检索 + 3 次 rerank + 5 次模型调用
```

→ demo 看起来很聪明，但线上成本结构不可持续。

Trace 解决问题的角度不是"优化回答质量"，而是**暴露成本结构**：
- 不是总成本高，而是**哪一个 Observation** 让成本失控
- 不是整体慢，而是**哪一步**阻塞了用户等待

### 反直觉判断

> 有些质量优化看似提升答案，实际是在破坏产品可规模化性。

具体表现：
- 更多上下文塞进 prompt → 提升准确率 → 但 token 成本和 latency 上升
- 引入更强 judge / 更多 self-check → 更好回答 → 但体验等待变长

### Tracing 的产品价值

Tracing 的真正价值让这些取舍从"架构师脑中"变为"产品评审中可以讨论的线索"——即把工程层面的成本/质量权衡暴露给产品决策层，使优化方向可讨论、可量化。

## 来源

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/langfuse-agent-eval-tracing-cost-structure.md)

---

