---
title: "claude-code-skill-writing-guide"
created: 2026-06-10
type: raw
sha256: 14b08702fc5d189029c184f98d5730e1f3fc29b8258e1d6bebe1e36f2d2ed3e0
---
# 同事惊呆了："Claude Skills 我也在用，但你 SKILL.md 写了 2000 行，是把它当 Prompt 还是当文档？"

source_url: https://mp.weixin.qq.com/s/f9nBtx__G1y3-LBYoTGquw
source: JavaGuide
author: Guide
published: 2026-05-25
score: 8×8=64

## 摘要

本文讲解如何正确编写 Claude Code SKILL.md：不是越长越好，而是说清楚什么时候用、正文怎么组织（500行以内）、如何渐进式披露、自由度如何把控。

## 核心观点

- Skill 不是把长 Prompt 换个地方保存
- SKILL.md 写得越长不代表效果越好
- 真正有价值的是踩坑清单，不是概念解释
- 主文件控制在 500 行以内，细节拆到 references/

## SKILL.md 结构

- Frontmatter: name + description（触发时机）
- 正文：Rule + Flow + Done Checklist
- references/：按需加载的参考资料
- scripts/：执行脚本，不进上下文

## 元数据规范

name: 小写字母+数字+连字符，最多64字符，不能含保留字
description: 说清楚"做什么+什么时候用+触发词"

## 自由度三类

高（分析/评审）：给方向不写死
中（模板化）：给模板+参数+边界
低（迁移/部署/删文件）：给精确命令

## 坑

1. 把 Skill 当 README 写
2. 想做万能助手（应拆小）
3. 给 Agent 太多选择
4. 术语来回换
5. 让 LLM 做确定性工作（交给脚本）
