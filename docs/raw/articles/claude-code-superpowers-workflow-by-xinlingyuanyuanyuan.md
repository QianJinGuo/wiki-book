---

title: "给 Claude Code 装上\"超能力\" — 它干活比我还靠谱"
url: https://mp.weixin.qq.com/s/HyAo0ieoj1LBD0z7iuTbPw
author: 新世界圆圆圆
source: 赛博虾酱
date: 2026-03-24
created: 2026-05-19
type: raw
tags: [claude-code, superpowers, ai-coding, skills, agentic-workflow]
review_value: 6
review_confidence: 7
sha256: c7a8f2e3d4b1c9a0e8f7d2c6b4a3e1f0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4
status: supplemental
supplements: entities/claude-code-skills-superpowers-practice

---
# 给 Claude Code 装上"超能力" — 它干活比我还靠谱
> 来源：[新世界圆圆圆 - 赛博虾酱](https://mp.weixin.qq.com/s/HyAo0ieoj1LBD0z7iuTbPw)，2026-03-24
> 评分：v=6, c=7, v×c=42 → 作为 [[entities/claude-code-skills-superpowers-practice|Superpowers entity]] 的补充
## 核心洞察
Claude Code 不只是需要一个会写代码的助手，它需要一个会干活的人。会干活的人什么样？
- 接到任务，先问清楚需求 → `brainstorming`
- 动手之前，先画出方案 → `writing-plans`
- 写完代码，自己先跑一遍测试 → `verification-before-completion`
- 有疑问知道找人 review → `requesting-code-review`
- 交付之前，确保东西真的能跑
## 14 个核心 Skills（英文版）
| Skill | 作用 |
|-------|------|
| brainstorming | 需求分析，先想清楚再动手 |
| writing-plans | 把需求拆成可执行的实施步骤 |
| executing-plans | 按计划执行，每步都有验证 |
| test-driven-development | 严格 TDD，先写测试再写代码 |
| systematic-debugging | 四阶段调试法：定位→分析→假设→修复 |
| requesting-code-review | 主动发起代码审查 |
| receiving-code-review | 严谨处理审查反馈 |
| verification-before-completion | 证据先行，声称完成前必须验证 |
| subagent-driven-development | 多 agent 并行开发 |
| using-git-worktrees | 隔离式特性开发 |
| finishing-a-development-branch | 合并/PR/保留/丢弃，四选一 |
| writing-skills | 教你如何创建新 Skill |
## 5 个中国特色 Skills（中文版 superpowers-zh）
- **中文代码审查** — 符合国内团队沟通文化的审查规范
- **中文 Git 工作流** — 适配 Gitee / Coding / 极狐 GitLab
- **中文技术文档** — 中文排版规范，告别机翻味
- **中文提交规范** — Conventional Commits 中文适配
- **MCP 服务器构建** — 教 Claude Code 构建生产级 MCP 工具
## 安装方式
```bash
# 方式一：一键安装中文版（推荐）
npx superpowers-zh
# 方式二：手动安装英文版
git clone https://github.com/obra/superpowers.git ~/.claude/skills
# 方式三：手动安装中文版
git clone https://github.com/jnMetaCode/superpowers-zh.git ~/.claude/skills
```
## GitHub
- 英文版：https://github.com/obra/superpowers（175k Stars）
- 中文版：https://github.com/jnMetaCode/superpowers-zh