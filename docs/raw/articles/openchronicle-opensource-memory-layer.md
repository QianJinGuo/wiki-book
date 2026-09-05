---
title: OpenChronicle：把AI记忆变成可复用的基础设施
source_url: https://mp.weixin.qq.com/s/yqmDsRCeZbBWMqM7oDa5qQ
publish_date: 2026-04-25
tags: [wechat, article, claude, openai, gpt, agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 618860333a9495e17bfae781fda6ba9d4456dc1cd817083c597bc630d8307629
---
# OpenChronicle：把AI记忆变成可复用的基础设施
## 背景
4月20日，OpenAI发布Chronicle——AI可以直接"看见屏幕"并持续记忆上下文，仅对ChatGPT Pro用户开放（$100/月）。
48小时后，00后开发者团队Vida发布OpenChronicle开源项目，将"看屏幕+持续记忆"这件事从付费墙中拆解出来。
GitHub: https://github.com/Einsia/OpenChronicle
## 核心定位
> "OpenAI的Chronicle指向了一个重要的未来。但AI的记忆，不应该被锁在100美元/月的付费墙之后。所以，我们把它开源了。"
三件更激进的事：
1. **完全本地运行** — 可用本地模型总结记忆，数据不出设备
2. **可接任意模型** — 包括本地模型
3. **可被多Agent共享调用** — 不同工具共享同一份用户上下文
**核心价值**：将"AI的眼睛和记忆"从单一产品中拆解出来，AI第一次拥有可复用的"记忆层"。
## 三个具体用例
### 1. 结合上下文理解指代
没有持续记忆时，问"what's the bug of that?"模型不知所云。
接入OpenChronicle后，Agent直接调取当前屏幕上下文（VS Code里的文件、报错信息），将"that"精准解析为具体代码。
### 2. 跨会话连续性
测试：全新对话中让Claude写OpenChronicle的logo prompt，从未在Claude中提过OpenChronicle。
- **无记忆**：Claude第一步反问"OpenChronicle是什么？"
- **有OpenChronicle**：直接从其他软件（浏览器、飞书、VS Code）的操作中检索项目信息，一步给出结果
### 3. 让Agent学会你的习惯并执行
OpenChronicle发现用户习惯：工作用Google Calendar，家庭用Apple/Fantastical。
当用户说"Add dinner with my parents this Sunday"，Agent自动路由到"家庭日历"，而非工作日历。
## 与主流Memory的区别
主流AI Memory：记住聊天内容。
OpenChronicle：观察你正在使用的应用（IDE/Notion/Figma），读取屏幕内容（代码/文档/界面），记录任务如何一步步推进。
> 它记住的不是聊天，而是"你在干什么"。
## 技术实现
- **存储格式**：Markdown
- **检索引擎**：SQLite
- **结构暴露**：AX Tree
- **可迁移**：可以读、可以改、可以迁移
本地优先：可随时暂停、恢复。记忆可以很强，但不一定要变成"全程监控"。
## 架构意义
**记忆层 = 基础设施**
- 不同Agent之间第一次可以共享同一份"用户上下文"
- 不再需要为每个Agent单独做一套记忆系统
- 模型可以换，工具可以换，但"上下文"始终连续
## 核心洞察
| 维度 | Chronicle（闭源） | OpenChronicle（开源） |
|------|------------------|---------------------|
| 运行 | 云端，仅Pro用户 | 完全本地，可接任意模型 |
| 记忆控制权 | 平台 | 用户 |
| 记忆边界 | 锁在应用中 | 可流动/可复用 |
| 记忆形态 | 产品能力 | 数据层/基础设施 |
**下一步核心命题**：AI能否持续陪伴并参与你的世界——记忆的控制权/边界/形态，才是真正的分歧所在。