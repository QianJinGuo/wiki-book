---
title: anthropic-pm-jess-yan-managed-agents
source_url: https://mp.weixin.qq.com/s/lF7yYI2Q2b_D5-jSsrfGcQ
publish_date: 2026-04-30
tags: [wechat, article, claude, agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 4776d3ace624b2df95b1e643e2d36587f51153c167289985c678ecce2381635d
---
## 核心观点
**PM 的手艺回来了。** 过去大半时间花在协调（跨部门会议、汇报、backlog），真正的手艺（craft）反而被挤掉。借助 Claude，压缩协调时间，把时间还给手艺。
**API 设计：从文档评审 → 先跑原型。** 不写 spec 写原型，在 Claude Code 里直接拿 pre-production API spec 跑 agent，一个下午从 hello world 到端到端原型。产品发布前就把 API abstraction 和 Claude Console UX 改了几轮。
**Claude 三件套分工：**
- **Claude**：开放式研究和探索，持续对话
- **Cowork**：其他知识工作（邮件、收件箱、待办、slides、翻 Slack）
- **Claude Code**：想清楚要解决什么问题，定制 agent
**METR 测出 41x 提升：** 从 Sonnet 3.5 (new) 的 21 分钟 → Opus 4.6 的 12 小时，16 个月人类等价时长。
> "能拿自己的产品做实验，这件事抬升了你能想象出来的下个版本的天花板。"
## PM 自己开的三个 Agent
1. **数据分析 agent**（Adoption analytics）—— 接进内部数据库，配了理解数据 schema 的 skill，带 memory，跑过的发现沉淀，下一轮在上一轮基础上推进
2. **开发者舆情监控 agent**（Developer sentiment monitoring）—— 带内置 web search，按域名清单扫开发者反馈，fan-out 到多个 agent 并行
3. **Demo 构建 agent**（Demo building）—— 接进 GitHub 仓库、品牌素材、活动 deck，生成会议版/客户版 demo
三个 agent 都在云上跑，Jess 可以走开做别的事，回来发现已经做完发布了。
## Claude Managed Agents 核心能力
2026 年 4 月 8 日公开 beta，四个核心能力：
| 能力 | 说明 |
|------|------|
| **生产级 agent sandbox** | 鉴权、工具执行替你处理 |
| **长会话** | 自主跑几小时，掉线保留进度和输出 |
| **多 agent 协作** | agent 可以拉起其他 agent 并行（research preview） |
| **可信治理** | scoped 权限、身份管理、tracing 默认配 |
## Memory for Managed Agents
2026 年 4 月 23 日开 beta，给 agent 加跨 session 学习能力：
- 底层是文件系统型 memory，agent 用 bash 和 code execution 直接读写
- 开发者可以 export 独立管理
- 所有改动有 audit log
**客户案例数字（Rakuten）：**
- first-pass 错误 -97%
- 成本 -27%
- 延迟 -34%
其他 case：Wisedocs 文档校验效率 +30%；Netflix 跨会话保留上下文（包括多轮才能挖出的洞察）；Notion 团队几十个任务并行跑；Sentry Seer 从 bug 定位到可 review PR 一气呵成。
## 定价
消费量计费，标准 Claude Platform token 单价之外，加 **$0.08 / session-hour** 的 active runtime。
## 参考材料
- [Product development in the agentic era](https://claude.com/blog/product-development-in-the-agentic-era)
- [Claude Managed Agents](https://claude.com/blog/claude-managed-agents)
- [Built-in memory for Claude Managed Agents](https://claude.com/blog/claude-managed-agents-memory)
- [Product management on the AI exponential](https://claude.com/blog/product-management-on-the-ai-exponential)