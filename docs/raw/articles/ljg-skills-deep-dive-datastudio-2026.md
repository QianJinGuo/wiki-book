---
title: "深度拆解「prompt之神」李继刚的 23 个 Skills"
source_url: "https://mp.weixin.qq.com/s/A1uO-XjksHnlnmZn3-hJYw"
ingested: 2026-07-03
sha256: c1c97b5ccbcb110d85826dadebc6c5f26d86359a44182eeb5bec81d7de7b0237
author: 云朵君
publisher: 数据STUDIO (转载自 智性未来)
---

深度拆解李继刚（lijigang）的 23 个 Skills 体系。李继刚的 GitHub 简介只有一句话，做的 23 个零代码、纯 Markdown prompt 的 Skill，在短时间内拿到 6k+ star。

核心洞察：ljg 的 23 个技能不是一堆工具，而是一条「认知工序流水线」：

Read (6) → Think (5) → Write (5) → Publish (5)
读进来 → 想清楚 → 写出来 → 被看见

加上两个工作流（paper-flow、word-flow），把相邻工序串成端到端链路。

四段结构服从制造业流水线逻辑：每一道工序都有不可削减的存在理由。跳段即崩——跳过 Read 直接 Think 是在重新排列已有的偏见；跳过 Think 直接 Write 是语言的自动补全不是思想；跳过 Write 直接 Publish 是在传播从未检验过的东西。

ljg-learn 八维法：历史、辩证、现象、语言、形式、存在、美感、元反思。每一维都是一个问题不是答案。最容易被跳过的是第八维元反思：「我为什么这样理解它？我的视角有没有问题？」——强制你看见自己的认知框架。

测试环境：claude-sonnet-4-6, macOS, Claude Code 2.x。23 个技能全部通过 /ljg-{name} 触发词加载。测试了 ljg-learn 八维解剖、ljg-plain 白话改写、ljg-think 纵向深钻、ljg-writes 观点展开、ljg-roundtable 多角色辩论。

ljg-paper 流程：输入论文后生成七拍叙事骨架（困境→现状→问题→方向→想法→论证→结论），确保非学术读者能理解论文的价值。

ljg-think 纵向深钻：从给定观点出发，像箭一样一路向下钻到不可再分的本质。

ljg-roundtable：围绕议题请来 3-5 位真实人物（如乔布斯、瑞·达利欧、埃隆·马斯克），定义开场，逐轮交锋，每轮收一张 ASCII 结构图。
