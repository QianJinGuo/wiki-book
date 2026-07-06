# 打造高效易用的Agent Skill

## Ch01.1033 打造高效易用的Agent Skill

> 📊 Level ⭐⭐ | 3.5KB | `entities/打造高效易用的agent-skill.md`

# 打造高效易用的Agent Skill

**来源**: 百度Geek说

**发布日期**: 2026-03-09

**原文链接**: https://mp.weixin.qq.com/s/TpmrSdx13CqApwN3iZQVew

---

。

点击蓝字，关注我们

作者 |
无糖可乐

导读

introduction

Agent 能写代码、能调工具，但它不了解你团队的规范、流程和质量标准，每次对话都从零教起，既低效又不稳定。Skill 机制正是为解决这个问题而生：把你的经验和流程结构化地交给 Agent，让它像拿到工作手册一样自主执行。本文从设计原理、编写方法到评测迭代，梳理 Skill 的实践路径，帮助开发者打造高效易用的Agent Skill。

全文8605字，预计阅读时间16分钟

GEEK TALK

01

Skill 是什么，为什么需要它

1.1 Agent 的先天缺陷

大模型很聪明，但它有一个根本问题： 没有你的私域知识和专属能力 。

你团队的代码规范是什么？做 Code Review 要看哪几个维度？创建一份 PPTX 应该遵循什么品牌样式？这些东西不在训练数据里，每次对话都重新教一遍既低效又不稳定。

更现实的问题是，即使你通过 MCP 给了 Agent 工具调用能力，能读 GitHub、能查 Sentry、能操作 Linear，它依然不知道 该按什么流程、什么顺序、什么标准去使用这些工具 。而 Skill 就可以提供这些信息，帮助Agent更好地执行任务。

1.2 从 MCP 到 Skill：能力扩展的演进

Agent 能力扩展的路径，经历了几个关键节点：

MCP（Model Context Protocol） 解决了"连接"问题。2024 年 11 月 Anthropic 开源 MCP，让 Agent 能够标准化地调用外部工具和数据源。这是基础设施层面的突破，Agent 终于能"伸手"触达外部世界了。

AGENTS.md 是社区自发的探索。随着 Cursor、Claude Code 等 AI 编码助手的普及，开发者很快意识到一个问题：这些 Agent 能写代码，但不了解项目的技术栈选择、代码风格约定、架构决策背景。于是社区开始在仓库根目录放置  AGENTS.md  ，用自然语言把项目的上下文和规范写给 Agent 看。

Skill 则是 Anthropic 在 2025 年 10 月正式推出的标准化方案。它把 AGENTS.md 的理念系统化，不仅仅是一个 Markdown 文件，而是一个结构化的文件夹，包含指令、脚本、参考文档和资源文件，形成完整的知识包。随后，Cursor、Windsurf 等产品也纷纷推出类似机制，Skill 正在成为 Agent 能力扩展的主流范式。

1.3 Skill 的核心设计：渐进式披露

Skill 最精妙的设计在于它的三级渐进式披露（Progressive Disclosure）机制，不会一次性把内容全塞给模型，而是分层按需加载：

第一级：YAML frontmatter 中的  description  字段。 本质上是一段结构化的自然语言声明，包含三层信息：这个 Skill 干什么用 （"分析 Figma 设计稿并生成开发交付文档"）、 核心能力是什么 （"设计规范提取、组件文档生成、标注导出"）、 什么时候触发 （"当用户上传 .fig 文件或要求'设计转代码交付'时"）。它始终存在于 Agent 的系统提示词中，作用类似索引，当用户输入到来

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/打造高效易用的agent-skill.md)

---

