---
title: "a16z 最新一期播客：Agent 真的不需要界面吗？"
source_url: "https://mp.weixin.qq.com/s/MXNqdmTUZR9Zscady3eqvA"
source_site: "深思圈"
author: "深思圈"
ingested: "2026-07-08"
sha256: "e20e429354338308d6dc53818c271ea7deb03a68e817b2714613671b8041ee70"
type: raw
tags:
  - headless-software
  - agent-architecture
  - a16z
  - enterprise-software
  - ui-design
  - api
---

> 你有没有想过，我们天天挂在嘴边的 AI agent，到底还需不需要一个软件界面。

## Headless 软件的本质

Salesforce 推出的 Headless 360 将 headless 概念推向大众。Seema Amble 指出，headless 软件这个词不新，但整个行业都在往这个方向靠：如果访问软件的不再是人而是 agent，那 agent 不需要看界面，只需要数据和逻辑。^[raw/articles/...]

传统软件为人设计，人要登录、点击、走完工作流。agent 访问软件时，界面成了累赘。Notion 也做了 headless 产品，因其用户群体技术能力更强，更倾向于自己搭 agent。

## Agent 和 API 的三类区分（Steven Sinofsky）

1. **查找（Look up）**：单纯找信息，所有系统都干得不错
2. **执行操作（Execute）**：以谁的身份执行、用谁的权限、是否占付费席位——企业软件最头疼的问题全冒出来
3. **分析（Analyze）**：最适合 agent 发挥，跨多系统、花时间试错，但幻觉风险最大

Steven 还幽默地指出，agent 就是给"可能跑很久也可能跑不完的程序"起了个好听的名字。

## 软件粘性的来源

- 围绕人的使用习惯搭建，形成肌肉记忆和组织流程
- 合规和法律层面要求唯一可信数据
- **收钱最有粘性**：一旦在收钱，客户想停下来都难
- 粘性经常不是设计出来的，而是软件长进组织的血肉里长出来的

## SAP 为什么死不了

真正值钱的不是数据存在哪个数据库里，而是封装在 SAP 里的那套**业务逻辑**。创业公司常拿自己团队的规模去想象客户的复杂度，别人的系统看起来笨重，可能恰恰是因为它扛住了你没经历的规模和例外情况。

## 例外处理才是核心

- 重点从采集数据变成让数据可对话、可用
- 非技术驱动的工作流才是真正的高价值领域
- "数据 + AI + 合规"三合一是护城河
