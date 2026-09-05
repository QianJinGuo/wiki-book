---
title: 浏览器 Agent 的失忆问题：Autobrowse 如何让每次探索变成永久技能
source_url: https://mp.weixin.qq.com/s/QvYspe3V6eoA9ZUA0AxocA
publish_date: 2026-05-08
tags: [wechat, article, agent, harness]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: cb3888bed4630ab65afc28424627ae89755d9d7ff19df83a8f2bbc5352be9f8b
---
> **Source**: https://mp.weixin.qq.com/s/QvYspe3V6eoA9ZUA0AxocA
> **Author**: Sense AI / 深思SenseAI
> **Date**: 2026-05-08
> **Category**: Browser Agent / Memory / Skills
# 浏览器 Agent 的失忆问题：Autobrowse 如何让每次探索变成永久技能
## 核心问题：探索税（Discovery Tax）
Browserbase 的 Kyle Jeong 提出的概念。浏览器 Agent 每次会话结束，学到的一切都跟着蒸发。成本曲线是一条没有任何学习斜率的直线。
> 凯恩斯在《概率论》里描述过一个「没有海马体的天才」的思想实验——这个人每次从零推导出同样精妙的结论，却无法在昨天的洞察上继续前进。现在的浏览器 Agent，就是这个思想实验的工程化现实。
## 根本瓶颈是记忆，不是推理
过去两年浏览器 Agent 推理能力突飞猛进（JS 渲染、反爬、多步流程、验证码处理），但跨会话传递知识的能力没有改善。
**Kyle Jeong 的观点**：现有的记忆方案（会话录像、execution trace、embedding 向量）要么不可读，要么不可复用。真正有用的记忆必须：
- 能被人读懂
- 能被 Agent 执行
- 能被团队共享和版本控制
这就是 Autobrowse 把记忆存成 **markdown** 而不是向量或截图的原因。
## Autobrowse 是什么
Browserbase 内部工程师 Shubhankar 开发、后开源的工作流——**用 AI 来改进 AI**。受 Andrej Karpathy 的 autoresearch harness 启发。
核心思路：
1. 给 Agent 一个真实任务，在真实网站上反复尝试
2. 每次从自己的失败里学习，直到方法收敛
3. 收敛后，把「最短可靠路径」写成一个可复用的 **SKILL.md**
4. 连同辅助脚本提交到公共技能库
**经济逻辑**：第一次运行是故意昂贵的——这是为所有后续运行付学费。技能文件编码的最短路径使后续每次运行的成本压低。
## 五步学习循环
### 1. 目标（Objective）
给 Agent 真实、具体的任务（如「在 OpenTable 预订今晚 7 点的位置」），暴露真实的摩擦点。
### 2. 运行（Run）
Agent 端到端执行，产生完整操作 trace——每个工具调用、每次页面交互、每个 token，全部记录。
### 3. 研究（Study）
Agent 读自己的 trace，做元认知反思：哪里卡住了？哪里靠猜测蒙混？哪些步骤浪费 token？有无可用轻量级确定性工具替代？
### 4. 迭代（Iterate）
外层循环维护一个 `strategy.md`——Agent 的学习笔记。每次迭代写观察：什么路径有效、什么失败、下次优先尝试什么、哪些步骤删掉。下次迭代先读这份笔记，知识在迭代间叠加。
### 5. 收敛与毕业（Converge → Graduate）
连续几次迭代成本和轮次数不再下降时停止。最终最优策略写成 `SKILL.md`，含辅助脚本（CLI、fetch、Python helper、CSS 选择器）。
> **短路条件**：通常只跑 3-5 次迭代，相邻迭代改善幅度收窄时主动停止。目标不是全局最优，而是「足够好、足够可靠、足够便宜」。
## Craigslist 基准测试
**任务**：旧金山 Craigslist 搜索 North Beach / Russian Hill 两居室，$5000-7000，带室内洗衣机。
| 指标 | 原始 Agent 循环 | Autobrowse 毕业技能 |
|------|:---:|:---:|
| 耗时 | 71秒 | 27秒（快 2.6x） |
| 成本 | $0.22 | $0.12（便宜 45%） |
| 结果 | 60个全市范围，精确匹配 **0** | 2个精准匹配 |
**核心发现**：Craigslist 搜索页面完全 JS 渲染，`browse snapshot` 返回 0 个引用。真实数据藏在未文档化 JSON API `https://sapi.craigslist.org/web/v8/postings/search/full`，无需鉴权、无需 cookie，唯一坑是需加 `postal=` 参数锁定地理位置。
> Kyle Jeong：「关键不是速度，也不是成本，而是正确性。一个『更快失败』的 Agent 不比一个『慢但正确』的 Agent 更有价值。」
## 哪些情况不该用（自我批评）
Browserbase 团队踩过的坑：把 Autobrowse 用在一个 167 行静态 HTML 州立法规目录上。四次迭代，~$24 美元，仍无法在单次输出中返回完整数据。
**正确做法**：~200 行确定性 Python + `browse fetch` + BeautifulSoup——亚秒级运行，零推理成本。
**使用规范**（已写入技能文件本身）：
1. 遇到网站先用 `browse fetch` 探一下
2. 数据直接在响应里 → 写解析器
3. 响应空/动态渲染 → 升级到 Autobrowse
**Agency 层级**：确定性脚本 → 路由式工具调用 → 完全自主多 Agent 循环。选择正确的层级本身就是工程决策。
## 技能文件才是真正的交付物
**关键洞察**：技能文件让 Agent 的工作成果变得**可读、可审计、可移交**。
当前问题：Agent 完成工作后，客户只收到执行日志、会话回放录像或推理描述——产品经理读不懂，运营团队读不懂，工程师也很难把 trace 转化成标准操作程序。
技能文件的本质：
- 有结构的 markdown 文件（名称、描述、推荐方法、替代路径、API 步骤、坑点、验证方式）
- 工程师可读、可编辑、可版本控制
- 非技术人员也能读懂并发现错误
- 从「信任 Agent 的输出」到「读懂 Agent 的操作手册」的本质跃迁
**复利效应**：技能库不断增长，Agent 在长尾重复性工作上越来越便宜、越来越快。Kyle Jeong 称之为「浏览器 Agent 能力工厂」。
## 递归自我改进
Autobrowse 最令人期待的方向：用同样的方式改进自己的运作方式——让 Agent 学习更好的迭代提示词、更聪明的网页探索先验（「先 fetch，能拿到数据就不必开浏览器」）、更完善的技能模板结构。
> 能力工厂可以把自己的流水线也当成需要优化的对象来运行。
## 结论
> 让 Agent 系统真正变得可靠和经济可行的，不只是更聪明的推理，而是更好的记忆机制——具体来说，是一种人类能读懂、能编辑、能版本控制，机器也能直接加载执行的记忆形式。Autobrowse 是对这个问题的一个具体答案。
---
**来源**：Kyle Jeong（Browserbase），Autobrowse: The Mythos moment for Browser Agents is here，2026-05-07
**原文**：https://x.com/kylejeong/status/2052103973377867913