---
title: "别再给智能体硬塞 System Prompt 了"
source: wechat-mp
source_url: https://mp.weixin.qq.com/s/RkCp-TgitKtSp5Hn9z03Bg
author: ZeaTalk (架构师带你玩AI)
published: 2026-06-12
ingested: 2026-06-12
type: article-summary
tags: [system-prompt, post-training, dpo, sft, agent-engineering, prompt-engineering, behavioral-constraints]
sha256: 0f1832fb68888fc5c917ea75320c72a8521bf569ebf9091038105981eb8ac0fa
---

# 别再给智能体硬塞 System Prompt 了 (ZeaTalk / 架构师带你玩AI)

## 一、核心论点

System Prompt 不是"写"出来的，是"训"出来的。System Prompt 适合"业务参数"（API 端点、用户偏好、当下任务），**行为约束**应该 post-training。"写 System Prompt 让 agent 按你要求执行"是 2024 年思维。

## 二、两个对比实验

### 2.1 System Prompt 路线（反例）

Prompt 文本："你必须用 `<think>` 标签输出思考过程，然后才回答。"

跟踪 Claude 在 production 环境**多日执行**：
- D1：100% 遵循
- D30：约 70% 遵循
- **D91：已"覆盖"初始指令，开始混入错误标签**，行为漂移
- 原因：每次调用都重新解码 System Prompt，"被告知的知识"在大模型权重空间分配是临时的

### 2.2 Post-training 路线（正例）

把"必须用 `<think>` 标签"约束通过 **DPO/SFT** 写入模型权重。

跟踪结果：
- D1-D91：**100% 遵循**
- 无行为漂移
- 推理时不再需要"重复告知"

## 三、底层机制

| 维度 | System Prompt | Post-training |
|------|---------------|---------------|
| 实现位置 | 输入 token 序列 | 模型权重 |
| 每次调用代价 | 重新解码 + 算 attention | 0（已 baked in） |
| 行为一致性 | 弱（被上下文漂移影响） | 强（写进先验） |
| 调整成本 | 修改 prompt 字符串 | 重训 / DPO |
| 类比 | 查字典 | 记住 |
| 适合范围 | 当下任务参数 | 行为规则/约束 |

## 四、"硬塞"是反智能

- 把行为约束塞进 System Prompt = 让模型在**每次调用**都重新"读规则"
- Post-training 让模型**已经把规则内化为先验**
- 两者在权重空间分配完全不同：System Prompt 占用输入 embedding 位置，Post-training 改变 transformer 层的 attention / FFN 权重
- **"被告知的知识" ≠ "被训练的知识"**

## 五、工程判断框架

**Q：怎么判断"我应该训"还是"我应该写"？**

| 约束类型 | 选什么 | 例子 |
|----------|--------|------|
| **当下任务参数** | 写 System Prompt | API 端点、用户偏好、当前任务描述、上下文数据 |
| **行为/规则/约束** | **训**（SFT/DPO） | 输出格式约束、禁用词、风格要求、合规红线 |
| **业务策略** | 写 System Prompt | 折扣规则、当下优惠、用户权限 |
| **价值取向/伦理** | **训** | 不说脏话、不输出政治敏感内容 |

**反例警示**：
- "你必须用 JSON 输出" → 应该 SFT/DPO
- "你不能用 [敏感词]" → 应该 DPO
- "你是 helpful assistant" → 应该 SFT（模型底座）
- "今天用户是 VIP" → 应该 System Prompt

## 六、行业趋势判断

- **2024 年**：Prompt Engineering 作为独立工种
- **2026 年 Q3 之后**：Prompt Engineering 工种**会大幅萎缩**
  - 因为：行为约束 → 训练（不需要 prompt engineer）
  - 任务参数 → 由应用层 LLM 框架自动注入（不需要 prompt engineer）
  - 真正能提供价值的是 **Post-training Engineer** + **Agent Harness Engineer**

## 七、引用源

- 原文：https://mp.weixin.qq.com/s/RkCp-TgitKtSp5Hn9z03Bg
- 关联：[[raw/articles/llm-post-training-full-guide|LLM Post-Training 全景指南]]
- 关联：[[raw/articles/how-harnesses-and-post-training-close-the-open-weight-bug-finding-gap-20260606|Harness + Post-Training bug-finding gap]]
- 关联：[[raw/articles/qoder-skills-完全指南从零开始让-ai-按你的标准执行-v2|Qoder Skills 指南]]（讨论 skill 约束与 prompt 边界）
