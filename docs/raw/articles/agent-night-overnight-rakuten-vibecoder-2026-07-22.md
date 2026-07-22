---
title: "Agent 能够长时夜间稳定运行，公司的瓶颈会转向人类判断"
source_url: "https://mp.weixin.qq.com/s/RvKY88aZIDTtwJuqhXQktA"
source_account: "Vibe编码"
author: "VibeCoder"
ingested: 2026-07-22
type: raw-article
tags: [agent, overnight, long-running, rakuten, fable-5, verification, self-reflection, review-queue, human-in-the-loop]
review_value: 7
review_confidence: 6
review_vxc: 42
review_decision: supplementary
supplements: entities/anthropic-long-running-agent-architecture-6h-retroforge
---

# Agent 能够长时夜间稳定运行，公司的瓶颈会转向人类判断

> **来源**：Vibe编码（VibeCoder），2026-07-22
> **评分**：v=7, c=6, v×c=42 → **Supplementary** → [[entities/anthropic-long-running-agent-architecture-6h-retroforge]]

## 核心命题

Rakuten AI for Business 负责人 Yusuke Kaji 称 Claude Fable 5 可在睡觉时继续完成细致的长任务，并在凌晨两三点前自己发现路线偏了。但原文未公布任务集、样本量、失败率、基线与绝对成本——应视为一线产品信号而非通用生产 SLA。

## 错误假设级联（Error Assumption Cascade）

目标里的歧义 → Agent 在第一轮形成错误假设 → 后续计划和工具调用继承旧前提 → 文件已改、工单已更新、局部测试可能通过 → 终点离原始目标越来越远。

**错误发现延迟**：错误假设经过多少步骤才被抓到，错误路径消耗了多少 token、工具调用和返工时间。

## Self-reflection vs Verification 分离

- **Self-reflection**：处理路径问题——旧假设还成立吗？环境是否已变？计划是否继续服务原始目标？
- **Verification**：处理证据问题——代码是否通过测试？数据能否对账？结论能否回链来源？

两层必须分开。模型自省再好，也可能拿同一套错误标准给自己判分。

## 六层夜间控制环

1. **睡前任务契约**：目标、完成证据、不变量、允许工具、禁止动作、时间与金额预算
2. **一次一个可回滚工作包**：每轮保存当前假设和证据
3. **外部验证**：执行后触发，通过才写入 verified checkpoint
4. **回滚机制**：失败后回到假设登记或上一个安全点
5. **暂停条件**：相同失败连续两次就暂停；碰到不可逆动作就等人批准
6. **早晨交接包**：diff、测试与来源、未知项、总成本、回滚点、建议动作

> Anthropic 自己的长程 harness 实验也采用相近方向：任务清单、增量执行、进度文件、Git 提交与端到端测试。

## 委派单位上移

早期模型需人先拆成定义清楚的小块 → 现在可交出更完整任务，并行运行多项工作。人的注意力向目标设定、边界控制和最终签字移动。

Rakuten 与 Cognition 差异：Cognition 用独立 VM + 聚焦会话 + 测试与代码审阅；Rakuten 扩展到销售/营销/财务，自动验收更弱，模糊判断更多。

## 新瓶颈：晨间验收队列（Review Queue）

Agent 迅速扩大执行供给，人类判断不会同步扩容。平台不仅要管 execution queue，还要管 review queue。

关键指标：
- 验收通过率与 silent failure
- 错误被发现前的步骤数
- 晨间审阅和返工分钟
- 每个被接受任务的总成本

> 产出很多、接受率很低，只会制造新的库存。

## 任务分级

| 级别 | 描述 | 示例 |
|------|------|------|
| 夜间开放 | 可验证、可回滚 | 测试补齐、依赖升级、受控重构、CI 修复 |
| 夜间草案 | 偏主观但可撤销 | 设计方案、营销内容、产品候选 |
| 人工审批 | 不可逆/高风险 | 生产发布、资金转移、权限变更、数据删除 |

## 模型路由策略

同时看 task completion ratio 和 cost per task：
- 易验证低风险 → 小模型
- 长链路前沿能力显著影响结果 → 升级模型
- 高影响不可逆动作 → 人执行
