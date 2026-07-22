---
source_url: "https://mp.weixin.qq.com/s/6Zr-ysk7F2UyaJzJ2YKjeQ"
title: "Superpowers：给 Claude Code 装上'工程大脑'"
source: "百度Geek说 / 奔跑的脆皮肠"
ingested: 2026-06-15
sha256: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6"
type: raw
tags: [superpowers, claude-code, skill, brainstorming, tdd, harness, jesse-vincent, obra, probability-control, engineering-discipline]
---

Superpowers：给 Claude Code 装上"工程大脑"

作者 | 奔跑的脆皮肠 | 全文 17319 字

一句话定位：Superpowers 不是让 Claude 变聪明，而是让 Claude 变守纪律。14 个内置技能，强制 AI 遵循"澄清→设计→规划→执行→验证"的工程流程。

01 三大原罪

原罪一：回答的随机性——模型是概率预测器，每次采样都是"掷骰子"
原罪二：直觉快思考——模型只有"快思考"（直觉联想），没有"慢思考"（系统推理）。认知负荷理论：把"一次性想清楚所有事"拆成"每次只想一件事"
原罪三：注意力稀释——长上下文中的注意力衰减，导致"顾此失彼"。《清单革命》：术前清单使术后并发症死亡率下降 47%

02 实战案例：querit.ai 订阅支付前端

裸跑 Claude Code：4 天，10+ 轮交互，状态机设计混乱、mock 数据不对、前后端割裂
Superpowers：brainstorming 先问清 8 个关键问题（状态范围/mock方案/后端数据格式/xstate使用范围），再写设计文档，再按计划执行

03 作者：Jesse Vincent（obra）

30 年开源老兵（Perl/RT/JesseVincent）。2025 年 10 月起完全依赖 AI 编码代理开发。
方法论来自"2000 年代初通过 IRC 远程指挥 MIT 实习生那一套东西的复刻"——管理 AI 代理和管理初级程序员本质上是同一个问题。
说服科学：Cialdini《影响力》原则（权威/承诺/社会认同）对 LLM 同样有效。MUST 等权威词汇、推荐方案触发承诺一致性。

项目热度：0→170k Stars（2025.10→2026.05），Anthropic 官方市场安装量近 30 万次（第三方第一）。
知名案例：chardet v7 重写——5 天完成，性能最高提升 48 倍，代码相似度仅 1.29%

04 14 个核心技能

澄清类：brainstorming / spec-document-reviewer
规划类：writing-plans / subagent-driven-development / executing-plans
质量类：test-driven-development / verification-before-completion / code-style-consistency
工程类：using-git-worktrees / finishing-a-development-branch / creating-mcps
辅助类：elements-of-style / visual-companion

05 实现原理：从概率到确定性

系统提示词注入："永远不要直接开始写代码"→"正确行为"概率被大幅提升
自回归锁定效应：每一步的输出成为下一步的强条件，概率被"锁定"在正确路径上
The Bitter Lesson 辩证：约束"如何让模型在当前任务中稳定表现"≠ 约束"如何让模型变聪明"

06 brainstorming Skill 深度解析

SKILL.md 关键设计：
- 强制触发："You MUST use this before any creative work"
- 单问题约束：One question per message（一次问5个→概率分布指数增长；一次问1个→聚焦高质量）
- 多方案探索：Propose 2-3 different approaches
- YAGNI ruthlessly：硬编码进 Skill
- 输出物规范：写入 docs/plans/YYYY-MM-DD-<topic>-design.md + git commit
- 链式调用：→ using-git-worktrees → writing-plans

概率操控技巧：(1) 强制词汇（MUST → 触发概率 20%→80%）(2) 结构模板（具体数字1,2-3,200-300作锚点）(3) 状态锁定（强制文件输出持久化对话状态）(4) 链式调用（显式指定下一个Skill）

Visual Companion：本地 WebSocket 服务器，Claude 生成 HTML → 服务器检测变化 → 浏览器实时刷新 → 用户点击选择 → 事件写回文件

07 querit.ai 深度复盘

裸跑四大坑：(1) 状态机设计混乱 (2) Mock 数据和真实后端对不上 (3) UI 状态遗漏 (4) 组件和状态机耦合
Superpowers 完整流程：brainstorming(8问题) → design spec → writing-plans(10任务) → subagent-driven → 逐任务审查

08 最佳实践

后悔成本决策表：低后悔成本(改文案)→裸跑；中后悔成本(新功能)→部分流程；高后悔成本(支付/安全)→全流程

11 负向收益（7 项）

1. 简单任务：流程开销 > 收益
2. 创意性任务：约束扼杀灵感
3. 上下文窗口浪费
4. 过度工程化倾向（YAGNI的讽刺）
5. 学习曲线和认知负担
6. 团队协作摩擦
7. "安全感陷阱"（流程规范 ≠ 结果正确）

核心警示：Superpowers 提高下限，不保证上限

12 总结

大模型 = 能力，Superpowers = 纪律，你 = 方向
能力决定能做多难的事，纪律决定能做多稳的事，方向决定做的是不是对的事
