---
title: "MemoHarness：同一模型只改 harness，终端任务成功率提升 8.4 个百分点"
source_url: "https://mp.weixin.qq.com/s/1UfFSdrtnp07WIqe1gX0Nw"
source_account: "Hyman的杂货铺"
author: "Hyman"
ingested: 2026-07-22
type: raw-article
tags: [memoharness, harness-engineering, self-improvement, harness-tuning, nd-saint-marys, terminal-bench, livecodebench, financeagent]
review_value: 7
review_confidence: 6
review_vxc: 42
review_decision: supplementary
supplements: entities/harness-engineering-self-improvement-survey-lilian-weng
---

# MemoHarness：同一模型只改 harness，终端任务成功率提升 8.4 个百分点

> **来源**：Hyman的杂货铺，2026-07-20
> **评分**：v=7, c=6, v×c=42 → **Supplementary** → [[entities/harness-engineering-self-improvement-survey-lilian-weng]]
> **论文**：MemoHarness: Agent Harnesses That Learn from Experience (arXiv:2607.14159, 圣母大学)

## 核心贡献

MemoHarness 提出：把 Agent harness 拆成六个可改维度，用历史执行记录在每道新题上单独改一版配置。Terminal-Bench 成功率相对最强固定 harness 基线提升 8.4 个百分点（0.722 → 0.806），同模型同工具，只换 harness。

## Harness 的六维分解

按一次推理的时间顺序拆成六个控制维度：

| 维度 | 控制面 | 作用 |
|------|--------|------|
| D1 | 输入拼装 | 调用前怎么拼输入（指令、示例、上下文） |
| D2 | 工具与检索 | 外部工具和检索是否启用 |
| D3 | 生成长度与采样 | 解码参数（温度、top-p、max_tokens） |
| D4 | 多步编排 | 单次还是多步，步骤间如何衔接 |
| D5 | 跨轮记忆 | 轮与轮之间保留什么信息 |
| D6 | 输出处理 | 调用后怎么抽答案、校验格式 |

六维相互耦合：开检索→提示多留证据位→生成预算加长→步骤可能变多轮→结尾校验从"原样输出"改成"抽字段"。

## 两阶段流程

**训练期**：在有标签的搜索集上反复试候选。按平均正确率排序，打平时挑更省 token 的。每次执行把轨迹、得分、成本、维度诊断写进经验库。

**测试期**：经验库冻结。对新题捞相似的成功/失败案例，把训练得到的全局 harness 改成案例级配置，然后执行一轮出答案。中间不重新搜索，不根据对错再学。

## 经验库设计

两层结构：
- **案例层**：逐题执行记录（配置差、轨迹、奖励、token 成本、诊断）
- **全局层**：从反复失败里蒸馏的规律

查询按题目特征、失败统计和维度诊断取有限几条，避免历史积越多撑爆窗口。

## 主结果

| 基准 | 初始基线 | MemoHarness | 提升 |
|------|---------|-------------|------|
| Terminal-Bench（长程 shell Agent） | 0.722 (Codex) | 0.806 | +8.4pp |
| LiveCodeBench（单次代码生成） | 0.900 | 0.967 | +6.7pp |
| FinanceAgent（多步金融推理） | 0.600 | 0.767 | +16.7pp |

对照包括 Codex、Claude Code、Terminus、OpenCode 的既有 harness。MemoHarness 与 Codex 共用 GPT-5.3-Codex，分差接近"只换 harness"的纯粹对比。

## 成本特征

多出来的输入主要来自检索到的历史案例，但这些案例在连续、相似题目上大量被缓存命中。实践中输入膨胀可控。

## 边界与借鉴意义

- 测试期改编本身不引入额外搜索，一次检索后直接执行
- 适应信息全部来自经验库，不看答案也不重搜索
- 跨模型迁移性：搜索好的六维配置可以迁移到不同模型
- 简单题继续走轻量路径，只有历史支持时才启用重流程
