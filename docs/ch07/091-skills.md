# 面向复杂业务场景的智能分析 Skills 架构设计与演进实践

## Ch07.091 面向复杂业务场景的智能分析 Skills 架构设计与演进实践

> 📊 Level ⭐⭐ | 2.6KB | `entities/面向复杂业务场景的智能分析-skills-架构设计与演进实践.md`

# 面向复杂业务场景的智能分析 Skills 架构设计与演进实践

> WeChat-阿里技术 | 发布于 2026-07-17 | 评分入库 v×c≥49

## 核心内容

原创 钟雨洁 2026-07-17 18:18 浙江 关于搭建领域知识密集型 Skill 或正面临「prompt 越写越长但效果越来越差」的困境，本文能提供一些思路 这是2026年的第 37 篇文章 （ 本文阅读时间：约 15 分钟 ） 背景 过去一个月，我们在搭建一个面向本地生活业务的分析类 Skill，让 AI 能像资深分析师一样做经营诊断、归因拆解和趋势预测。业务覆盖几十个行业，每个行业有独立的经营框架和指标体系，复杂度远超一个 prompt 能承载的范围。﻿ 搭建过程中，我们经历了三次架构重构（V1 → V2 → V3），每次都是被真实问题逼出来的。这篇文章完整复盘了这个演进过程，最终提炼为六条 Skill 架构设计原则。﻿ 如果你正在搭建领域知识密集型 Skill，或正面临「prompt 越写越长但效果越来越差」的困境，这篇文章或许能够提供一些思路。每章独立成节，可按需跳读。 01 V1：用软件工程思维设计 Skill， 踩了什么坑 大部分团队搭建 Skill 的路径都类似：大 prompt → 打补丁 → 越来越长 → 没人敢改。我们绕过了大 prompt，但踩进了另一个坑，那就是用软件工程思路做分层解耦，结果过度工程化。﻿ Skill 的能力上限不取决于模型，取决于你喂给它的知识架构。 设计直觉 我们面对的业务场景有几个特点：覆盖几十个行业，每个行业有独立的经营框架和指标体系；分析方法涉及归因、趋势、预测、漏斗、分层等十几种；输出形式从日报到诊断报告到决策备忘各不相同。﻿ 一个 prompt 显然装不下。所以我们很自然地借用了软件工程的经典范式：分层解耦，把 Sk。

## 关键要点

- 原文完整记录：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/面向复杂业务场景的智能分析-skills-架构设计与演进实践.md)
- 关联主题：[Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)、[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)

## 相关实体

[Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) [Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)

---

