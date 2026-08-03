---
source_url: "https://www.xiaohongshu.com/explore/6a28548300000000350304bd?xsec_source=app_share&xsec_token=CB6JwCBUsrZmMn40gHsqwfVI6m06gfLTATBXtxifdX_5U="
source_author: "会敲代码的泡"
source_title: "分享电商Agent项目-Harness/自进化/多Agent"
source_date: "2026-07-13"
source_publication: "小红书（个人项目分享）"
ingested: "2026-08-03"
sha256: "bcf7c29bad28d06de50f9461c85ca363f14fd8445db46ed1445f8b2cc1ff997f"
---

分享电商Agent项目-Harness/自进化/多Agent

统一回复下大家我在做的Agent项目：全球购物 Agent--Globex。

## 整体架构

- **决策层**：一个 AgentLoop 范式的主智能体
- **multi agent**：主 loop 自己扛大部分任务；只在两类场景 fork 子 Agent
- **召回层**：一塔保相关性、一塔保个性化
- **工程层**：上下文压缩 + AGUI协议 + 长期记忆 + 评测训练闭环

## 收获6大认知

1. **最好的压缩是不让大内容进上下文**。工具层先拦一刀，比事后摘要省一个数量级。
2. **多 Agent 不是越多越好**。
3. **AGUI 是事件流**，前端体验和线上排查都得抓瞎。
4. **记忆不是上下文备份，是另一种数据结构**。长上下文按 token 涨钱，长期记忆按条目持久化。
5. **评测体系是 Agent 的命门**。没有 reward 就只能修 bad case 修到怕。
6. **续写永远优于重试**。流式中断别 panic，把已有输出留住、注入续写指令。

大家在做什么 Agent？

#ai #agent #agent项目 #校招 #实习 #秋招 #harness #agent开发 #求职 #agent开发实战
