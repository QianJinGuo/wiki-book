---
title: "🧠 字节新作：Agent Skill也能自进化了？"
source_url: "https://www.xiaohongshu.com/explore/6a1712dc0000000006030cbe"
created: 2026-07-02
updated: 2026-07-02
type: article
tags: [xiaohongshu, muse, autoskill, bytebrain, skill, self-evolving, agent]
ingested: 2026-07-02
sha256: b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3
---

# 🧠 字节新作：Agent Skill也能自进化了？

## Agent Skill 的痛点

现在 Agent 虽然能写代码、调工具，但它的 Skill 大多是一次性的，生成了就不会改。这次在数据分析上翻了车，下次换个任务还是犯同样的错。技能之间孤立、静态，缺乏长期的记忆和优化机制。

## MUSE-Autoskill：全生命周期管理

字节跳动这篇论文提出：Skill 不应只是几行脚本，而应变成有生命周期的自我进化闭环。五阶段：

1. **创建 (Creation)**：按需生成，自动编写 SKILL.md 文档和配套脚本
2. **记忆 (Memory)**：关键创新点——引入 skill-level 记忆，每个 skill 有专属的 `.memory.md`，记录踩过的坑和适配建议。同时保留短期和长期记忆架构
3. **管理 (Management)**：自动索引、合并同类项，精简掉没用的废技能
4. **评估 (Evaluation)**：Skill 必须通过单元测试才能进入库中
5. **精化 (Refinement)**：根据运行报错自动 Patch 修复，越用越稳

## 评测结果

| 指标 | MUSE | Codex | Hermes |
|------|------|-------|--------|
| SkillsBench 准确率 | **68.4%** | 67.3% | 61.2% |
| with-skills vs without-skills 提升 | **+15.2pp** | — | — |

更值得关注：MUSE 自己生成的 skill 在 **35 个任务上超过了人类手写的 skill**，说明好的 skill 生命周期管理，产出效果完全可以超越人工设计的经验。
