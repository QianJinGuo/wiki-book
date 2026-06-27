# 从 Prompt 到 Harness：Claude 官方学习资料

## Ch01.664 从 Prompt 到 Harness：Claude 官方学习资料

> 📊 Level ⭐⭐ | 4.7KB | `entities/from-prompt-to-harness-claude-official.md`

# 从 Prompt 到 Harness：Claude 官方学习资料
> 作者：张嘎（公众号「有戏圈」），2026-05-07。
> 对 Learn Harness Engineering 课程 + OpenAI/Anthropic 官方资料的实践者解读。
> 核心判断：很多 AI 编码翻车不是模型能力不够，而是仓库没有给 Agent 一套能可靠工作的系统。
1. **指令子系统** — 告诉 Agent 项目是什么、技术栈、不可违反的规则

## 相关实体
- [Claude Code Harness Deep Understanding](../ch01-367-claude-code-harness-deep-understanding)
- [Claude Code Harness Deep Dive Founder Park](../ch01-558-claude-code-harness-深度分析)
- [Claude Opus 47](../ch01-195-claude-opus-47-并不是一次全面升级甚至部分能力大幅衰退nn大家应该在合适的场景下选择使用nn昨晚-opus)
- Openclaw Prompt Context Harness
- [Anthropic Managed Agents Scaling](../ch01-677-anthropic)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/from-prompt-to-harness-claude-official.md)

## 深度分析

**Agent 失败的根因是"系统缺失"而非"模型能力不足"。** 文章的核心判断——"很多 AI 编码翻车不是模型能力不够，而是仓库没有给 Agent 一套能可靠工作的系统"——揭示了当前 AI 编码工具的核心瓶颈。OpenAI Frontier 团队实现了空 repo 到 5 个月约 100 万行代码的自动化，说明模型能力早已不是瓶颈，差距在于基础设施设计 。

**Harness 五子系统形成了一个完整的 Agent 运行环境闭环。** 指令子系统定义项目上下文，工具子系统提供执行能力，环境子系统保证依赖可复现，状态子系统维持长任务连续性，反馈子系统验证执行正确性。这五个子系统缺少任何一个都会导致 Agent 行为的不确定性增加 —— 特别是反馈子系统最容易被低估 。

**WIP=1 原则直接针对 Agent 的"过度延伸"行为模式。** Agent 最大的问题不是不勤奋，而是太勤奋地把事情做散。坑开太多（过度延伸）和跑通很少（不足完成）是两种常见错误，WIP=1 原则通过强制单任务完成后再开始新任务来对抗这一倾向 。

**验证不是收尾动作——验证会塑造实现方式。** 这一洞察颠覆了传统开发流程中"先实现后测试"的思维。在 Agent 场景下，由于 Agent 的自信来自局部代码判断而非系统级验证，必须将验证设计前置，才能确保实现方式本身是可测试的 。

**OpenAI 案例（空 repo → 100 万行代码、1500 PR、0 人工 review）和 Stripe Minions（每周 1300+ PR）** 证明了在成熟 Harness 体系下，AI 代码生成的规模效应是真实的。这为"AI 写代码是否可行"提供了实践层面的正面证据 。

## 实践启示

**立即为你的项目编写 `AGENTS.md`** —— 这是最小可行的 Harness 入口文件，应包含：项目是什么、怎么启动、怎么测试、硬约束、更多文档去哪看。不要写成百科全书，要写成地图目录 。

**落实 WIP=1 原则，为每个功能建立三字段清单**：行为描述 → 验证命令 → 当前状态。Agent 每次只做一个功能，做完必须验证，验证通过后才能开始下一个。这直接减少了"过度延伸"和"不足完成"两类错误 。

**实施三层终止检查作为每次完成的闸门**：静态检查（语法、类型、lint）→ 运行时验证（服务启动、关键路径）→ 系统级确认（E2E 走一遍）。没有验证证据不允许说完成 。

**把架构约定和上线禁忌文档化到仓库本身** —— 不在 Slack，不在老员工脑子里。重要约束要靠近代码，过时文档必须清掉。仓库是唯一事实来源 。

**每次会话结束执行"清洁状态五件事"**：构建通过、测试通过、进度更新、临时垃圾清掉、下一个会话能直接启动。这确保了下一次 Agent 接入时系统处于确定性的干净状态 。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/from-prompt-to-harness-claude-official.md)

---

