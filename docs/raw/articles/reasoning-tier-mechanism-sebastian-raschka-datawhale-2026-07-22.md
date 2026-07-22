---
source_url: "https://mp.weixin.qq.com/s/Rf32OCWDM-mf1ocfKKQbUw"
title: "Codex、Claude Code的推理档位，其实就是一句提示词"
author: "Sebastian Raschka / Datawhale（译）"
ingested: 2026-07-22
sha256: "b7a9e0c8f3d2a4b6c5e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8"
source_platform: weixin
tags: [reasoning-effort, reasoning-tier, rlvr, inference-scaling, test-time-compute, system-prompt, deepseek, gpt-56]
---

# Codex、Claude Code 的推理档位，其实就是一句提示词

> 作者：Sebastian Raschka（原文）/ Datawhale（翻译）
> 公众号：Datawhale
> 日期：2026-07-22

现在打开 Codex、Kimi Code、Claude Code 里任何一个，选完模型，旁边往往还有一个推理档位的选择器。大部分人凭手感拨一个，简单问题拨低、难题拨高，但很少有人说得清：拨动的那一刻，模型到底变了什么。

本文把推理档位讲清楚了：从你看到的下拉菜单，一直讲到训练管线里那行 reward。

## 一、「推理模型」不是真在推理

AI 里的技术名词大多不能按字面理解。推理模型指的是：模型在给出最终答案前，先输出一段中间的思考过程（reasoning trace），相当于把草稿纸上的步骤也一并写出来。左边是普通 LLM（直接给答案），右边是推理模型（先绕一段中间过程再作答）。

## 二、只给答案打对错分，它自己就学会了推理

DeepSeek-R1 给出了 RLVR（可验证奖励的强化学习）配方：答对给 1，答错给 0。前提是这个领域能自动核对对错——数学用 SymPy 或 WolframAlpha 验算，代码用编译器或单元测试跑。

关键反直觉之处：训练时并不评判那段草稿本身写得好不好，只看最终答案对不对。DeepSeek 团队试过把草稿也纳入训练信号，发现帮助不大就去掉了。只靠「奖励结果」这一条，模型自己学会了写中间步骤、回头检查、发现错了再改——Aha moment。

## 三、<think> 标签是装饰性的

推理模型输出里的 `<think></think>` 标记的是草稿的起止，不是思考本身。这对标签对推理能力本身没有贡献，唯一作用是让界面把它折叠隐藏。DeepSeek-R1 的总奖励是 `R_accuracy + R_format` 两部分相加，后者只是一条简单的格式规则检查。

## 四、第一代推理模型只有一种个性：全程啰嗦

DeepSeek-R1 是「专职」推理模型，不管问什么都长篇大论，没有关闭推理的开关。Qwen3 等后来模型做混合：同一个模型既能当普通指令助手，也能按需切推理模式。Qwen3 用 `enable_thinking=True/False` 控制，关掉时在回答开头塞一个空的 `<think></think>` 让模型直接跳到答案。

## 五、推理档位本质上是 system prompt

到了 GPT-5、GPT-5.6 这一代，开关从「开/关」变成 low/medium/high/max。从 OpenAI 开源的 gpt-oss 能看出端倪：档位通过 system prompt 控制，往每个请求前面加一句 `Reasoning effort: low/medium/high`。ChatGPT 界面上那个选择器，大概率只是把选择映射成这么一句话。

## 六、模型能「听懂」这句话的两种配方

随便一个模型，加 system prompt 也不会理你。要让它听懂，训练时必须配合：

- **路线一 · RLVR 阶段动手脚**：不同 system prompt 配不同长度惩罚。说「low」时对 token 数罚得重逼它写短；说「high」时几乎不罚放它写长。
- **路线二 · RLVR 之后再补一轮 SFT**：喂进「这个 prompt 对应这么长的推理」的样本，让模型把档位标签和目标长度对应起来。

两条路也能组合。作者推测 gpt-oss 和 GPT-5.6 就是组合着用的。

## 七、换模型和调档位是互不干涉的两个 scaling 轴

选模型（训练 scaling）和调档位（推理 scaling）对应两个不同的旋钮。有意思的是曲线会重叠：小模型开高档有时能追平大模型开低档的分数。

## 八、档位不是越高越好，边际递减明显

GPT-5.6 Sol 的曲线：档位越高 token 花得越多精度也越高，但到某个点会饱和，最高档收益明显变小。「拨到 max」不等于「答得更对」。多数任务里，中间档才是精度/成本/延迟三者的甜点区。

## 九、国产旗舰各有做法

- **DeepSeek V4**：训了三个「专家」— Non-think、Think High、Think Max，每个用不同的上下文窗口和长度惩罚，最后蒸馏进同一个 checkpoint。Think Max 的 system 指令「Reasoning Effort: 绝对最大，不允许走捷径」背后有专门训练撑着。
- **Kimi K2.5**：Toggle 方法在训练时交替「限预算」和「不限预算」两个 RL 阶段，能把生成 token 砍掉约 25-30%，benchmark 几乎不掉。K3 提供 low/high/max 三档。

## 往后看

GPT-5 曾做过 Auto 模式想自动选档，败多胜少后撤了。近期推理档位仍会是显式输入（通过 system prompt 传进去），但 Agent 外面那层 harness 会越来越多地根据任务状态和剩余预算自动推断该用哪一档。
