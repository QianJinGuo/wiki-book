---
title: "最新发布！豆包搜索+Claude Code实测来了"
source_url: "https://mp.weixin.qq.com/s/I72BQlRHBZG33dXyYE47Vg"
source_account: "李秀奇 / Datawhale"
ingested: 2026-07-28
sha256: "0adc410c16e945e9c88a6f014bef5f9f0a1f231aeec9fcebadb6f312e4fc6f50"
type: raw-article
tags:
  - doubao-search
  - agent-search
  - volcengine
  - claude-code
  - search-api
  - agent-tool
  - product-review
score_v: 5
score_c: 6
score_vc: 30
decision: raw
---

# 最新发布！豆包搜索+Claude Code实测来了

> 模型是大脑，搜索是眼睛和耳朵。当搜索开始按 Agent 的用法重做——把可信度、时效、结构都提前标好，它就不再只是一个给人用的工具，而是在变成 Agent 的基础设施。

## 核心论点

做 Agent 不能只靠基础模型——模型知识停在训练截止日，需要搜索工具提供实时、可信的信息输入。

## Agent 搜索选型六维度

| 维度 | 说明 |
|------|------|
| 信源权威与可信度 | 返回内容够不够权威，Agent 能否直接采信 |
| 时效性 | 最新信息多久能被检索，精度到天/分钟 |
| 垂类深度 | 中文长尾问题、专业领域内容检索能力 |
| 多模态 | 图文混合搜索，图片带结构化元数据 |
| 调用范式 | 是否 Agent 友好：定向查询、时效控制、多轮检索 |
| 成本 | 免费额度与单价 |

## 豆包搜索实测结果

| 维度 | 豆包搜索表现 |
|------|-------------|
| 信源权威 | 官方源 + 权威等级标注（财政部/商务部/中国政府网等） |
| 时效性 | 当天精确到分钟，TimeRange 参数可控 |
| 多模态 | 图片+尺寸/清晰度/分类结构化元数据 |
| 调用范式 | 支持定向查询、时效控制等参数 |
| 成本 | 每月 500 次免费 |

### 三个实测场景
1. **政策查询**「2026年关税调整方案」：豆包返回结果全部来自财政部/商务部/国务院，标注「非常权威」，Agent 可直接按等级采信
2. **突发热点**「英伟达最新消息」：豆包 TimeRange 锁当天返回全部 7/22 新闻，精确到分钟；竞品新旧混杂横跨 2024-2026
3. **图片搜索**「火山引擎 logo」：豆包返回图片+元数据（尺寸/清晰度/分类）；竞品不支持图片搜索

## 集成方式
- 火山引擎控制台：`console.volcengine.com/search-infinity/web-search-exp`
- 每月 500 次免费，个人认证即可领
- 支持 MCP 调用接入
- 可搭配 Doubao-Seed-Evolving 模型（1M 上下文）

## 局限性
- 没有独家内容，通用搜索一样搜得到
- 抖音商城封闭原生商品数据拿不到
- 中文长尾深度和大规模稳定性需长期测试
