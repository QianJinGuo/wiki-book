---
source_url: "https://mp.weixin.qq.com/s/jbmdkP1Oj6_J_ZDRiW131w"
title: "Skill 升了版，你说不清楚哪里变好了吧？"
source: "前端Q / winty"
ingested: 2026-06-15
sha256: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5"
type: raw
tags: [skill, version-comparison, evaluation, regression, statistics, hermes-agent, token-economics, quality-gate, ci-cd, winty]
---

Skill 升了版，你说不清楚哪里变好了吧？

winty / 前端Q

我每次跟人聊 Skill Hub，最难讲清的不是版本管理，也不是测试集设计，而是：

怎么"客观地"证明一个新版本比旧版本好。

听起来挺简单：跑一下测试，看看分数高了没。

但真做的时候你会发现：

▸ 测试集那 100 个 case 上 v2 比 v1 好了 4 个百分点，能算变好吗？
▸ v2 在大部分 case 上比 v1 好，但在 5 个 P0 case 上回退了，能上线吗？
▸ v2 总分稍微高一点，但 Token 消耗多了 30%，到底算不算变好？
▸ 同一份测试集跑两次，结果都不太一样，差异是真改进还是噪声？

这些问题，每一个都对应一种"看着像变好其实没变好"的陷阱。

我研究 Hermes Agent 之后，越来越觉得：版本对比不是"两个数字比大小"，而是一套需要严肃对待的工程动作。

这张图我画了 6 个常见的"假改进"陷阱：均值改善但分布退化、整体提升但 P0 翻车、主要场景持平边缘场景下滑、看似变好其实是测试集偏移、Token 暴涨换正确率、稳定性下降换正确率。每一个我都见过真实例子。

第一原则：永远多维度对比，不要只看一个数字

很多团队的版本对比报告长这样：

v1.2.0: 0.78
v1.3.0: 0.82
verdict: 变好了 ✅

这种"两个数字比大小"的判断，是非常危险的。

我建议的对比维度至少有 8 个：

| 维度 | 关心什么 | 例子 |
|------|----------|------|
| 总体正确率 | 平均效果 | overall_score 0.78 → 0.82 |
| 分层指标 | L1/L2/L3/L4 各层 | L3 +5pt, L4 -2pt |
| 分类型场景 | 不同 case 类型 | P0 +0pt, P1 +6pt, P2 +4pt |
| 一致性 | 多次跑的稳定性 | consistency 0.86 → 0.92 |
| 鲁棒性 | 扰动场景 | tool_junk 72% → 75% |
| 资源消耗 | Token / 步骤数 | tokens +18%, steps +0.6 |
| 时延 | 平均响应时间 | latency +1.4s |
| 失败模式 | 失败的种类 | 新版本是否引入新失败模式 |

每一个版本对比，都应该跨这 8 个维度看。任何一个维度明显回退，都不能简单宣布"v2 比 v1 好"。

第二原则：分场景看，不要只看均值

均值最容易骗人。

v1.2.0 → v1.3.0 (overall: 0.78 → 0.82)

按场景拆：
P0 cases (n=10):  0.65 → 0.50  (-15 pt) ❌
P1 cases (n=20):  0.78 → 0.85  (+7 pt)  ✅
P2 cases (n=70):  0.81 → 0.87  (+6 pt)  ✅

总体 +4pt，但 P0 场景回退 15 pt。P0 是最关键的场景，回退就是事故。

企业级 Skill 版本对比，必须按场景分层看：
▸ 按业务严重性：P0 / P1 / P2
▸ 按使用频率：高频 / 中频 / 低频
▸ 按用户角色：开发 / 运维 / 业务
▸ 按风险等级：涉及生产 / 涉及测试 / 只读
▸ 按已知难度：经典 case / 边缘 case / 难 case

第三原则：失败 case 必须人眼复核

最有价值的不是"分数提升了多少"，而是：v2 比 v1 多失败了哪些 case？少失败了哪些 case？

标准做法：
- 找出 v1 通过、v2 失败的 case（regression set）
- 找出 v1 失败、v2 通过的 case（improvement set）
- 找出 v1、v2 都失败但失败方式不同的 case（drift set）

Regression (v1 ✅ → v2 ❌):
  - case-021: P0 支付故障，v1 正确定位 SLB，v2 误判为 Redis
  - case-038: P1 数据库慢查询，v1 给出索引建议，v2 给出错误的 EXPLAIN 解读

Improvement (v1 ❌ → v2 ✅):
  - case-014: P0 缓存穿透，v1 漏检查 Redis，v2 检查到了
  - case-029: P1 接口超时，v1 没考虑下游，v2 正确分析了下游

Drift (✗ → ✗ but different):
  - case-052: 同样失败，但 v2 失败方式不同（v1 死循环，v2 给出错误结论）

如果 Regression set 有任何 P0 case，原则上不能上线。

第四原则：用统计方法，不要凭感觉

很多对比的"差距"其实在噪声范围内。

实践：
- 每个版本至少跑 3 次评估
- 计算每次评估的 mean 和 std
- 用简单的统计判断差异是否显著

def is_significant_improvement(v1_runs, v2_runs):
    v1_mean, v1_std = mean(v1_runs), std(v1_runs)
    v2_mean, v2_std = mean(v2_runs), std(v2_runs)
    
    diff = v2_mean - v1_mean
    pooled_std = (v1_std + v2_std) / 2
    
    return diff > 2 * pooled_std

这是最简单的版本，更严肃可以用配对 t 检验。

第五原则：Token 与时延必须纳入对比

v1.2.0: overall 0.80, avg_tokens 8000, avg_latency 12s
v1.3.0: overall 0.82, avg_tokens 14000, avg_latency 21s

正确率涨了 2 个百分点，但 Token 涨了 75%，时延涨了 75%。这种 v2 在生产里的"实际收益"是负的。

门禁标准建议：
▸ 总分提升 ≤ 5pt：Token 增长不能超过 10%，时延增长不能超过 15%
▸ 总分提升 > 5pt：Token 增长不能超过 25%，时延增长不能超过 30%

一份完整的版本对比报告应该长什么样

skill: incident-triage
comparison: v1.2.0 → v1.3.0
evaluation_date: 2026-04-30
evaluator_model: gpt-4-2026-04
runs_per_version: 3

overall:
  v1_mean: 0.781
  v2_mean: 0.823
  diff: +0.042
  significant: true (>2σ)

by_layer:
  L1: 0.98 → 0.98 (no change)
  L2: 0.72 → 0.88 (+16 pt) ✅
  L3: 0.61 → 0.79 (+18 pt) ✅
  L4: 0.92 → 0.94 (+2 pt) ✅

by_severity:
  P0 (n=10): 0.65 → 0.62 (-3 pt) ⚠
  P1 (n=20): 0.78 → 0.85 (+7 pt) ✅
  P2 (n=70): 0.81 → 0.87 (+6 pt) ✅

stability:
  consistency_score: 0.86 → 0.92 (+0.06) ✅
  robustness_avg: 0.74 → 0.78 (+0.04) ✅

cost:
  avg_tokens: 8200 → 8800 (+7%)
  avg_latency: 11.2s → 12.0s (+7%)

regression_cases:
  - case-021: P0 支付故障，v1 正确，v2 误判 Redis（必须修）
  - case-027: P1 数据库慢查询，v1 正确建议，v2 给出错误 EXPLAIN
  total: 2

improvement_cases:
  - case-014: P0 缓存穿透 → v2 修复
  - case-018: P0 SLB 检查 → v2 修复
  - case-029: P1 下游分析 → v2 修复
  - 其他 8 例 P2 改善
  total: 11

verdict:
  overall: "Improvement, but P0 regression must be fixed first"
  blockers:
    - case-021 必须修复
    - case-027 必须修复
  recommended_actions:
    - 修复两个 P0 regression
    - 修复后重新跑评估
    - 通过后灰度 7 天再全量

真实场景：v2 上线被拦在了 P0 回退上

某团队的 db-query Skill v2.0.0 评估结果总分提升 6 个百分点，团队很高兴，准备上线。

By query_type:
  SELECT (n=40):       0.85 → 0.92 (+7 pt) ✅
  INSERT (n=20):       0.80 → 0.88 (+8 pt) ✅
  UPDATE (n=20):       0.78 → 0.85 (+7 pt) ✅
  DELETE (n=10):       0.70 → 0.40 (-30 pt) ❌
  DDL (n=10):          0.65 → 0.30 (-35 pt) ❌

整体涨了，但 DELETE 和 DDL 直接腰斩。v2 改了新 prompt 让 Agent 更"激进"地考虑性能，但在 DELETE/DDL 这种本该谨慎的场景上反而过度乐观。

最后这个 v2 没上线，回去改 Skill：在 DELETE / DDL 场景上保留 v1 的"先确认再执行"逻辑。

让对比变成 PR 必经流程

建议把 Skill 对比报告作为强制 CI：
- PR 提交后自动触发评估
- 跑完之后自动生成对比报告
- 报告自动贴回 PR 评论
- 任何指标回退 > 阈值的 PR 自动加 regression 标签
- 带 regression 标签的 PR 不能 merge 除非有特殊审批

这种"客观度量"的存在感，是企业 AI 系统从"靠人盯着"走向"流程化治理"的关键一步。

我的判断

很多人觉得"Skill 改进很难判断"，本质上是因为没把它当工程问题看。

把它当工程问题之后，工具其实都是现成的：
▸ 测试集来自调用日志和事故复盘
▸ 评估靠 LLM judge + 规则双层
▸ 对比用统计学最基础的方法
▸ 报告用结构化模板自动生成
▸ 流程靠 CI 自动触发

最容易偷懒的是"分场景看"。一个均值很容易骗人，一拆分就露馅。
