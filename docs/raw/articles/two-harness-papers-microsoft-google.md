---
title: 两篇Harness论文：微软M⋆记忆进化 + 谷歌AutoHarness动作约束
source_url: https://mp.weixin.qq.com/s/pnQpiRspZH68UoGR8YFSiA
publish_date: 2026-04-25
tags: [wechat, article, gpt, agent, harness, llm, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: fca5510a878f8a75bc64350b38d47e0f7fe0908335ff21d2307851f5342c31ab
---

## 二、AutoHarness：自动生成代码Harness防止非法动作
### 核心问题
尽管LLM在代码生成和数学推理上表现卓越，但在严格定义的环境中（如棋类游戏），它们经常提出非法动作。在Kaggle GameArena国际象棋比赛中，**78%的Gemini-2.5-Flash失败**都源于非法移动。
传统方法需要为每个游戏手工编写约束代码，既费力又容易出错。
### 方法：树搜索+Thompson采样的代码合成
将Harness生成建模为程序搜索问题，使用**Thompson采样引导的树搜索**平衡探索与利用。
**三种Harness模式**：
| 模式 | 说明 |
|------|------|
| harness-as-action-filter | 生成合法动作候选集，由LLM排序选择 |
| harness-as-action-verifier | LLM生成动作→代码验证合法性→非法则重试（主要实验） |
| harness-as-policy | 完全用Python代码实现策略，测试时无需LLM调用 |
**关键机制**：
- 反馈驱动：环境返回动作是否合法及奖励信号
- 迭代优化：基于错误案例和轨迹，LLM生成代码补丁（V4A格式）
- 编译-修复循环：自动处理语法错误和运行时约束违反
### 实验结果
**TextArena 145个游戏测试**：
- **训练效率**：平均14.5次树搜索迭代即可达到100%合法动作率，19/32个游戏在10次迭代内收敛
- **2P对战**：Gemini-2.5-Flash + Harness vs Gemini-2.5-Pro → **9/16胜率**（总体胜率56.3% vs 38.2%）
  > 较小的模型配合专用Harness可击败更大模型
- **1P游戏**：平均奖励0.745，超越Gemini-2.5-Pro（0.707）和GPT-5.2（0.635）
- **极限模式Harness-as-Policy**：16个1P游戏取得**0.870平均奖励**，超越GPT-5.2-High（0.844），且测试时成本几乎为零（无需LLM调用）
---
## 核心洞察
1. **记忆结构任务特异性**：不同任务需要完全不同的记忆Harness，跨任务迁移无效。必须与任务协同优化。
2. **Harness使小模型胜大模型**：专用Harness可以让较小模型击败较大模型，Harness-as-Policy模式测试时零LLM调用成本。
3. **AI研究风向**：从"如何让模型更聪明"转向"如何给Agent配一个更合适的Harness框架"。