---
title: "3篇Agent技能自演化文章阅读：OpenSkill / SkillBoost / SkillHone"
source_url: https://www.xiaohongshu.com/explore/6a81a01c000000002403c6ae
short_url: https://xhslink.cn/o/4cDepk1hAzx
source: xiaohongshu
author: 小红书论文解读号（合集）
publish_date: 2026-08-18
ingested: 2026-08-18
type: raw-article
tags: [agent, skill, self-evolution, xiaohongshu, openskill, skillboost, skillhone]
sha256: eb6cf09b79aa05bf30d03203aca90ceb85d79f7ae7c498eac18bb43c2a7a1b32
review_value: 6
review_confidence: 5
---
# 3篇Agent技能自演化文章阅读：OpenSkill / SkillBoost / SkillHone

> 小红书论文解读号把 OpenSkill / SkillBoost / SkillHone 三篇并列解读，聚焦同一个问题：Agent 的技能如何自我进化——不重训练、不改权重，由 Agent 在使用中自己编辑技能文件持续改进。选择 skill 层的理由：权重更新昂贵且不可逆，技能文件只是一组可编辑文本，是 Agent 系统中最自然的可更新位置。

## 三道关卡与三篇解法
三篇论文分别解决 skill 自演化路径上的三道关卡，互不覆盖、恰好互补，拼合成完整技能进化流水线：

1. **冷启动（OpenSkill）**：部署环境没有标注反馈，三类常规证据来源全部失效。OpenSkill 将开放世界同时作为知识来源与练习场，用独立可验证的事实构造虚拟测试，替代缺失的监督信号——全程不接触隐藏答案。（OpenSkill 已在库：openskill-open-world-self-evolution-agent-2026-07-22）
2. **过拟合（SkillBoost）**：反馈存在但会误导——skill 学到的是当前批次的具体模式而非可迁移知识。SkillBoost 将演化重构为受约束搜索，接受门槛要求「净改进为正，且不破坏已解案例」，从机制上抑制过拟合。（SkillBoost 已在库：skillboost-skill-overfitting-self-evolving-agent-arxiv-2026）
3. **跨会话失忆（SkillHone）**：常规演化只保留最终产物，决策历史随会话丢失，后续 Agent 会重复已被淘汰的修复。SkillHone 为每次修订记录持久决策历史 h_t=(q, r, e, o)，使修订理由、评估证据与最终决策跨会话可查。（SkillHone 全库零覆盖 = 本文新增维度）

## 呈现方式
本文以 8 张图解呈现：三篇共享的五环节统一流程、三篇论文的原文框架图与逐块中文讲解、四条可复用的设计模式、三者融合后的完整演化蓝图。
