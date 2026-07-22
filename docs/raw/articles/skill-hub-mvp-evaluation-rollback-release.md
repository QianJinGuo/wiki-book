---
title: "手把手搭 AI Skill Hub：可评估、可回滚、可发布"
source_url: https://mp.weixin.qq.com/s/XekEZio-Up6wuwkzo6FkMA
source_site: 前端Q
author: winty
date: 2026-07-10
ingested: 2026-07-10
sha256: 8c8e6e48bb8ff152d26d2d5738ef991029fe08951c1ed1eda4341101315acab5
---

# 手把手搭 AI Skill Hub，可评估、可回滚、可发布

winty 前端Q 2026年7月10日 广东

## 设计目标

一个最小但能跑的 Skill Hub MVP（~400 行 Python），不依赖商用工具和外部数据库，mock LLM 调用，但跑通完整核心闭环：Skill 注册、版本评估、跨版本对比、自动门禁、灰度路由、一键回滚。

## 6 个组件

| 组件 | 功能 |
|------|------|
| SkillRegistry | 文件系统版本管理（hub/skills/{name}/{version}/skill.md + state.json） |
| EvalEngine | 跑评估出 4 层指标（L1-L4）+ 一致性 + 资源消耗 |
| CompareService | 多版本对比 + Blocker 检测 |
| PromotionGate | 自动门禁：canary 看 metrics，stable 看 compare+天数 |
| CanaryRouter | 按调用方灰度路由 |
| RollbackService | 一键回滚（promote 时记 history） |

## 评估体系

每个 case 跑 3 次（一致性），4 层指标加权：L1(10%) + L2(20%) + L3(50%) + L4(20%)

Gate 规则硬编码在 CI 中：
- L3/L4 回退 > 3pt → 拦截
- L4 < 90% → 硬底线拦截
- Token 增幅 > 25% → 拦截
- Canary 灰度天数 < 7 → 不能 promote 到 stable

## 灰度路由

CanaryRouter 维护 allowlist，在名单的 caller 路由到 canary 版本，否则走 stable。

## 关键坑

1. 测试集太干净 → 60% 真实日志+30% 故障复盘+10% 人工策展
2. Judge 模型太弱 → 必须用比 Skill 更强的模型作 judge
3. Gate 太松 → 按 severity/scenario 分桶
4. 回滚没人测 → 每季度做一次回滚演练

## 核心判断

Skill Hub 解决的是"AI 经验到生产"的链路（Skill→评估→灰度→回滚→监控），与 DevOps 解决"代码到生产"链路一脉相承。主体从"代码"变成"Skill"，但工程治理逻辑不变。唯一不同的是 Skill 的评估取代了传统测试，成为整套体系的核心。
