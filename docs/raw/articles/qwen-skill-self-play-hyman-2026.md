---
source_url: https://mp.weixin.qq.com/s/czQ1AnCD5qwswhKmutLGgQ
ingested: 2026-07-28
sha256: 75f606344b7ce21dc3a35a407b7723579c9733d30c9da2adabdf409fa572d298
source_published: 2026-07-28
title: "阿里Qwen开源 Skill-SP：自博弈实现模型和Skill协同进化新范式"
author: Hyman的杂货铺
feed_name: Hyman的杂货铺
---

# 阿里Qwen开源 Skill-SP：自博弈实现模型和Skill协同进化新范式

一句话讲清楚👉🏻 阿里 Qwen 大模型应用团队开源 Skill Self-Play （ Skill-SP ）：用会进化的 skill 库同时管「出什么题」和「怎么自动判对错」，让自博弈既能覆盖开放任务，又能挡住假题；工具调用最高抬 42.9 分，逻辑推理上也能把几乎起不来的弱模型拉回正轨。

论文标题：Skill Self-Play: Pushing the Frontier of LLM Capability with Co-Evolving Skills
论文链接：https://arxiv.org/abs/2607.22529
Github 链接：https://github.com/Qwen-Applications/skill-self-play

## 三个角色

Skill-SP 拆成三个角色：
- **Proposer**（出题）：挑题型出题
- **Solver**（做题）：解题
- **Controller**（管 skill 库）：维护 skill 库，包括改写、归档与新增

每一轮先记三步：挑题型出题，拦假题，只留「大概半对半错」的题进训练池。后面的策略更新，以及 skill 的改写、归档与新增，都围着这批题转。

## 核心机制

一个可验证任务写成两份材料：solver 能看到的提示，以及环境独占的校验契约（单元测试、参考答案等）。solver 答完后，环境给出 0 到 1 的校验奖励。

Skill-SP 先过「这题能不能学」的门：格式乱、校验不过、参考对不上，直接零分。过门之后，才看成功率是不是卡在五五开附近。

**Skill** 是一份出题说明书（路由规则、硬规则、生成提示与例子、自动判对错方法、使用统计）。**探索流**不加 skill 约束，专门探新模式，避免整库塌进少数模板。

**训练池**从两流的有效候选里按难度排序后各取一半。Proposer 与 Solver 都用 GRPO 更新。默认跑 5 轮；工具调用每轮训练池 8000 题，逻辑推理 1920 题。

## 库的演进（改、删、加）

- **改**：根据无效生成与执行轨迹，重写说明书内容并更新使用统计
- **删**：长期太简单、前沿奖励过低的 skill 归档
- **加**：从探索流里挑难度合适的新题，让 controller 抽象成新 skill 包

## 主要结果

**工具调用**（API-Bank L1-L3, BFCL）：Qwen3-4B-Inst 总均分 +6.5（60.2→66.7）。Ministral-3-8B 从 20.7 到 63.6（+42.9），Ministral-3-14B 从 22.2 到 64.5（+42.3）。

**逻辑推理**（ZebraLogic）：Qwen3-4B 网格正确率从 72.1 到 73.5（+1.4）。Qwen3-8B 从 23.6 到 32.4（+8.8）。

## 消融关键发现

- 去掉 skill 编排（无引导自博弈）：整体低 2.6 分
- 只用 skill 流（无探索流）：跨场景表现下降
- 均匀路由 vs 动态路由：-1.9
- 冻结 skill 库：-2.3
- 冻结出题器：-2.1
- 冻结 feedback solver：-3.0
- 两边都冻结：-3.2
