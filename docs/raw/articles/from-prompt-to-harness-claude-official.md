---
title: 从 Prompt 到 Harness：Claude 官方学习资料
source_url: https://mp.weixin.qq.com/s/CRgnx9wMv6xvAeE-KG6K4A
publish_date: 2026-05-07
tags: [wechat, article, claude, openai, agent, harness]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: cf1142d34e151d30a02f029c14eec788550d02bb0f8ae1ecbdddaef0d51b8c08
---
# 从 Prompt 到 Harness：Claude 官方学习资料
> 作者：张嘎（公众号「有戏圈」），2026-05-07。
> 对 Learn Harness Engineering 课程 + OpenAI/Anthropic 官方资料的实践者解读。
> 核心判断：很多 AI 编码翻车不是模型能力不够，而是仓库没有给 Agent 一套能可靠工作的系统。
## 核心框架：Harness 五子系统
1. **指令子系统** — 告诉 Agent 项目是什么、技术栈、不可违反的规则
2. **工具子系统** — 读文件、跑命令、看日志、打开浏览器，而不是只靠脑补
3. **环境子系统** — 依赖/运行时/启动方式可复现，不让 Agent 浪费上下文在"为什么 npm 装不上"
4. **状态子系统** — 长任务有进度记录、决策记录、功能状态，而不是每次新会话都从失忆开始
5. **反馈子系统** — 测试、lint、构建、E2E 验证告诉 Agent 做对没有（最容易被低估）
## 关键观点
### 仓库是唯一事实来源
- 架构约定在 Slack = 不存在；上线禁忌在老员工脑子里 = 不存在
- 根目录：短入口文件（像地图目录，不是百科全书）
- 重要约束靠近代码
- 过时文档必须清掉
### WIP=1 原则
- 一次只做一个功能。做完→验证→记录→做下一个
- Agent 最大的问题不是不勤奋，而是太勤奋地把事情做散
- 功能清单三字段：行为描述 → 验证命令 → 当前状态
### 三层终止检查
1. **静态检查**：语法、类型、lint
2. **运行时验证**：服务启动、关键路径执行
3. **系统级确认**：像真实用户走一遍 E2E
验证不是收尾动作——验证会塑造实现方式。
## 最小 Harness 五步动作
1. 写短 `AGENTS.md`：项目是什么、怎么启动、怎么测试、硬约束、更多文档去哪看
2. 验证命令写具体：`npm test` / `npm run build` / `pytest`，区分快速验证和完整验证
3. 建 `feature_list.json`：行为描述 + 验证方式 + 状态
4. 进度文件：每次会话结束写——完成了什么、验证结果、阻塞项、下一步
5. "完成"设闸门：没有验证证据不允许说完成
## 相关知识点
- **可观测性两层**：运行时可观测（系统启动/接口返回/日志）+ 过程可观测（任务范围/验收标准/评分标准）
- **清洁状态五件事**：构建通过、测试通过、进度更新、临时垃圾清掉、下一个会话能直接启动
- **过度延伸 vs 不足完成**：Agent 容易同时犯两种错误——坑开太多（过度延伸），跑通很少（不足完成）
- **过早宣告胜利**：Agent 的自信来自局部代码判断，真实系统正确性在边界上
## 数据支撑
- OpenAI Frontier 团队：空 repo → 5 个月约 100 万行代码、约 1500 个 PR，工程师从 3 人到 7 人，接近 0 人工代码 + 0 人工 review
- Stripe Minions：每周 1300+ PR 合并，AI 生成 + 人工 review
来源：Learn Harness Engineering 中文课程、OpenAI Harness Engineering 文章、Anthropic long-running agents / harness design 文章。