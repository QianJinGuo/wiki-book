---
title: "意识的分界线，在 Claude 大脑里自己长出来了？Anthropic 发现大模型「全局工作空间」"
source_url: "https://mp.weixin.qq.com/s/tZE9rD9uqx4fIYNXTQhuNw"
author: "ChallengeHub小编"
feed_name: "机器之心"
publish_date: 2026-07-07
created: 2026-07-07
ingested: 2026-07-07
tags: [anthropic, llm, interpretability, j-space, global-workspace, jacobian-lens, mechanistic-interpretability]
type: article
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
sha256: 9842415fcaa2b5edd6cdb5c96f46f29abfeb04d381ec6f13c706ccba295fede6
---

# 意识的分界线，在 Claude 大脑里自己长出来了？Anthropic 发现大模型「全局工作空间」

Anthropic 可解释性团队发布新研究《A global workspace in language models》，发现 Claude 内部存在 J-Space（雅可比空间）——类似人脑「全局工作空间」的角色。本文是机器之心第2篇关于该研究的详细报道，与第一篇报道侧重不同，更详细地枚举了5大实验证据。

## 什么是 J-space

研究团队把这组特殊模式的集合命名为 J-space，探测技术为 J-lens（雅可比透镜）。J-lens 的思路：对 Claude 词表中的每一个词，寻找会让模型「未来某个时刻更可能说出这个词」的内部激活模式。

## 五大证据：这真的是一个「全局工作空间」

**其一，Claude 能报告 J-space 里的内容。** 让 Claude 默默想一个体育项目，J-lens 榜首是「Soccer」，随后 Claude 果然回答「足球」。把「Soccer」模式抹掉换成等强度「Rugby」，Claude 改口说橄榄球。注入「lightning」模式，Claude 报告被注入的念头是关于闪电的。

**其二，Claude 能按要求调控自己的 J-space。** 让 Claude 边抄写无关句子边「心里想着柑橘类水果」，J-space 里出现「orange」「fruits」。边抄写边心算 3² − 2，J-space 里先出现「nine」再出现「seven」。要求「不要想」某个概念时——白熊效应：越叫你别想，越挥之不去。同时「damn」和「failure」也频频亮起。

**其三，Claude 真的用 J-space 来思考。** 「会结网的动物有几条腿」——模型先得想到「蜘蛛」再回忆腿数。J-lens 显示「spider」在处理中途亮起；换成「ant」，答案变成「6」。写押韵对句时，模型提前把韵脚词放进 J-space。

**其四，表征可灵活复用。** 用四个提示问法国（首都/语言/大洲/货币），把 J-space 里的「France」换成「China」，四个回答齐刷刷变成北京/中文/亚洲/人民币。说明它们读的是同一份共享表征——信息写入一次，多个系统都能取用。从连接结构看，读写 J-space 的组件数量远超普通模式（高出约 100 倍）。

**其五，大部分处理不经过 J-space。** J-space 同一时刻只装几十个概念，占内部总活动量不到十分之一。把 J-space 整个删掉：Claude 依然说话流利、能做情感分类、能答选择题——但多步推理直接掉到接近零。西班牙语实验：把 J-space 里的「Spanish」换成「French」，问语言答法语，问作家从马尔克斯换成雨果——但续写照旧写西班牙语，完全不受影响。

## 后训练给了 J-space 一个「立场」

J-space 在预训练模型中存在时主要服务于预测后文。经过后训练后，开始装载 Claude 自己的「反应」：
- 用户提到吃了危险剂量的药物但没意识到危险 → 后训练模型在读消息的当下，J-space 就亮起「WARNING」「dangerous」
- 角色扮演时，每轮开头 J-space 亮起「fictional」「disclaimer」

## 更多发现

- 「体验式语言」依赖 J-space：删掉 J-space 后回答依然流利但变得干瘪机械——无论是描述自己还是别人
- **反事实反思训练**（counterfactual reflection training）：只训练模型「如果被中途打断并要求反思会说什么」，完全不训练实际行为。训练后，模型的不诚实行为率下降，J-lens 显示「honest」和「integrity」在 J-space 中亮起。教模型「该说什么」，塑造了它「怎么想」

## 关于意识

Anthropic 的回答很克制：无法证明 Claude 拥有人类那种主观体验。但结果确实说明 J-space 承载着 Claude 能报告、能主动唤起、能用于推理的那些想法，而其余处理在其下自动运行——这套结构在训练中自己长了出来。

差异同样显著：人脑靠循环回路维持，Claude 在单次前向传播中演化；人类工作记忆几秒消退，Claude 凭注意力随时召回文本缓存；Claude 的工作空间几乎全部由词构成。
