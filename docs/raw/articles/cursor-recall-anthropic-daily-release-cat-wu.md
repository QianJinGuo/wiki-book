---
title: 从Cursor返聘归来，90后华裔女高管带Claude开启日更模式：token成本比工程师工资低多了！
source_url: https://mp.weixin.qq.com/s/PNSujYlQCaEtYdPRvcYU7g
publish_date: 2026-04-30
tags: [wechat, article, claude, agent, harness, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: e30d2c112dea698d6f852696e142d7ffc192d7b9eafbc2b74586d31f3329d251
---

## 核心要点
### Cat Wu 背景
- 本科毕业于普林斯顿大学计算机科学专业
- 曾任 Scale AI 产品工程师、Dagster 工程经理、Index Ventures 风险投资人
- 2024年8月加入 Anthropic
- 2025年7月初被 Cursor 挖角，约两周后回归 Anthropic，全面接管 Claude Code 产品线
### Anthropic 发布节奏
- 产品功能开发周期从 6 个月压缩到 1 个月，有时甚至只需要一天
- 核心手段：
  1. 减少流程，移除所有阻碍发布的因素
  2. 以"研究预览"（Research Preview）形式发布，降低承诺成本
  3. 工程师完成内部使用后，发到发布频道，文档、PMM、开发者关系团队立刻跟进，次日发布公告
### PM 角色的演变
- **过去**：6-12个月 roadmap 对齐，强调跨团队协同
- **现在**：PM 的核心能力是极大缩短"从想法到用户手中"的时间
- **关键转变**：招聘有产品感的工程师，减少发布摩擦
- **团队结构**（约30-40个PM）：
  - 研究 PM 团队：收集模型用户反馈，传递给研究团队
  - 云开发者平台团队：维护 Claude Code API，发布托管 Agent 等能力
  - Claude Code 团队：负责 Claude Code 和 Cowork 核心产品
  - 企业团队：成本控制、权限管理、安全等
  - 增长团队：整个产品线增长
### 工程师和 PM 边界正在重叠
- PM 在做工程的事，工程师在做 PM 的事，设计师既做 PM 也写代码
- "产品感"是最稀缺的能力
- 核心优势：判断"该写什么"、理解实现难度来影响优先级
### 使命驱动决策
- 使命："为全人类带来安全 AGI"
- 把使命放在单一产品之上，所以可以在组织层面快速决策
- 极端例子：如果 Claude Code 失败了，但 Anthropic 整体成功了，会非常开心
- 决策逻辑：优先支持第一方产品和 API，OpenClaw 限制订阅用户使用是出于此逻辑
### Claude Code vs Cowork 使用边界
- **Claude Code**：输出是代码时使用（desktop 或 CLI）
- **Cowork**：输出不是代码时使用（清空 Slack、邮箱、做 PPT、写文档等）
- Desktop：适合前端工作，有预览面板，同时用 Claude Code + desktop 实时看效果
- Mobile：最大的优势是"随时随地发起任务"，不需要带着电脑
### Cowork 实际用例
- Cat Wu 用 Cowork 做演讲 PPT（Code with Claude 大会）：连接 Google Drive 和 Slack，自动获取素材，整合成20页 PPT
- Applied AI 团队：用 Cowork 做"作战简报"，总结明天所有客户会议，每个客户关注什么、提出过什么需求
### Token 成本
- 人均 token 消耗随模型升级而上升，但成本仍远低于工程师平均薪资
- 浪费 token 是不被鼓励的，但内部有上限，不限量使用
### 新模型发布后的变化
- 更大的变化是"删除功能"：很多功能原本是为了弥补模型能力不足
- 新模型解锁全新功能：如 code review，并行运行多个 review Agent 扫描代码库
### AI PM 最重要的能力
1. 定义"一个月后的产品应该是什么样"：从用户"突破产品边界"中看到模式
2. 对 AGI 有"恰到好处"的信仰：在当前模型能力下最大化潜力
3. 做 eval：10 个高质量 eval 就足以帮助团队明确目标、衡量进展
### 关于职业发展的建议
- 自动化要做到 100%，95% 程度的自动化价值不大
- 做那些每天都会用的自动化工作流，才能真正获得价值
- 简单配置往往比过度优化更有效
- 用 AI 做事，才能真正理解它的能力
### 闪电问答
- 喜欢《How Asia Works》《The Technology Trap》《The Paper Menagerie》
- 最近喜欢的产品（非自家）：Waymo——改变了通勤方式，在车内可以开工作会议
- 生活信条："直接去做"——职位是虚构的，理解约束条件后，可以判断自己能做什么，然后尽快去做
---
## 相关文章
- [[entities/claude-code-prompt-context-harness]] — Claude Code 提示词与上下文管理
- [[entities/agent-self-improvement-six-mechanisms]] — Agent 自我改进六条路
- [[concepts/openclaw-architecture]] — OpenClaw 架构（Anthropic 竞品）