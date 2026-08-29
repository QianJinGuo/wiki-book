---
source: newsletter
source_url: https://cursor.com/blog/cloud-agent-environment
ingested: 2026-07-31
source_published: 2026-07-30
sha256: 20f2783751cf5567c18604b0d2ff0522d8dfbe2689e00a1da178b168c71f6f4c
---

# How we set up our cloud agent environment

> 来源：cursor.com/blog/cloud-agent-environment（Mathew Hogan & Arvind Saripalli, 2026-07-30, 7 min read）

## 摘要

Cursor 决定给 cloud agents 配备计算机（computer use）以便它们能自己测试变更。第一步是让 cloud agents 在自己 monorepo 里能跑好代码。经验：开发环境本身就是一个产品，只不过用户是 agent。需要让 cloud 匹配本地开发、让 repo 对 agent 足够可读（无需 tribal knowledge）、并随着代码库变化保持环境健康。^[raw/articles/how-we-set-up-our-cloud-agent-environment-cursor-2026-07-30.md]

**关键数据点**：2025 年 12 月 cloud agents 撰写了 Cursor monorepo 约 1/10 的合并 PR；到 2026 年 7 月已超过一半（7-day rolling share >50%）。^[raw/articles/how-we-set-up-our-cloud-agent-environment-cursor-2026-07-30.md]

## 正文

### Matching cloud to local development

大多数 Cursor 开发者在本地 Mac 上开发，而 cloud VM 跑 Linux。为此把各种 dev utilities 和 setup scripts 平台无关化（agnosticize）以兼容 Ubuntu VM；将关键 dev dependencies 加入 Cursor 定义的 Dockerfile，作为 cloud agents 的起始镜像。^[raw/articles/how-we-set-up-our-cloud-agent-environment-cursor-2026-07-30.md]

与安全团队合作为 cloud agent 产品加入安全特性，让用户能安全地把所需 secrets 注入 agent 环境：网络 egress 限制、scoped and proxied git remote access、commit 与 commit message 中的 secret scanning、以及 tool results 中的 secret redaction（即使 agent 尝试读取 secret 值也无法读到）。^[raw/articles/how-we-set-up-our-cloud-agent-environment-cursor-2026-07-30.md]

### A simpler interface for agents

即使 dev setup 在 Ubuntu VM 上跑通，agents 仍然不擅长运行代码——因为 devex 混乱，需要学习和记忆大量 build commands、build flags、utility scripts。Skills 可以记录正确命令，但命令本身 convoluted 且充满 footguns。^[raw/articles/how-we-set-up-our-cloud-agent-environment-cursor-2026-07-30.md]

为此构建了 CLI `anydev`：agents 用它启动所有服务；常用 utility scripts 也路由经过 anydev；anydev 带多个 `--help` 菜单解释每个 subcommand 用法；anydev 还有一个 supervisor process 监控并重启长驻 build commands，把该职责从模型身上完全移除。^[raw/articles/how-we-set-up-our-cloud-agent-environment-cursor-2026-07-30.md]

anydev 让 dev experience 简单到 agents 能可靠运行代码。Skills 帮助文档化其用法，但更大的变化是 agents 不再需要 juggle 多步 niche build commands、躲避隐藏 footguns、或 babysit 长驻进程。这是 cloud agents（各自拥有独立计算机）开始相对 local agents 产生真实价值的时刻：配合 computer use 的 recordScreen 工具和可用的 dev 环境，agents 能端到端测试变更、向用户证明正确性。agent 还能在修复 bug 后在 Slack 分享 agent-recorded demos，或在 PR 上展示。许多任务下工程师可以放心 merge 和部署 cloud agent 代码，无需本地 checkout 分支。^[raw/articles/how-we-set-up-our-cloud-agent-environment-cursor-2026-07-30.md]

### A self-healing environment

环境围绕 agent 持续变化，保持可运行意味着持续更新它的运行方式和访问范围。为了诊断和恢复不健康环境，构建了 **Cursor Cloud MCP**：选择 MCP 是因为它提供动态可发现工具，接口可以在不重建 agent loop 的情况下更改。Cloud agents 用它检查自身环境的 setup failures、egress policy、changed secrets 等，从而边出现边诊断修复，更快恢复不健康环境。^[raw/articles/how-we-set-up-our-cloud-agent-environment-cursor-2026-07-30.md]

在此基础上设置了自动化 **Cloud Doctor**：周期性检查失败、记住哪些错误可能是 transient vs salient、做 root cause analysis、并能对高置信度问题开 PR 修复。^[raw/articles/how-we-set-up-our-cloud-agent-environment-cursor-2026-07-30.md]

### Improving agent experience

即使环境健康，agents 有时也会走长路或绕路验证变更：用错 skill、在 VM 里遇到可避免的问题、或走比必要更长的 workflow。Cloud Doctor agents 检查 traces 找出另一个 agent 出错的位置、哪些 skills/commands 有误导性、哪些 workflows 系统性慢；然后修复 skill、简化路径、或改环境让下一个 agent 更容易。该 loop 持续改善 agents 自身的 developer experience。^[raw/articles/how-we-set-up-our-cloud-agent-environment-cursor-2026-07-30.md]

### Making your environment ready for cloud agents

对 cloud agents 的生产力而言，环境是决定性因素。判断 codebase 是否 ready 的三个问题：^[raw/articles/how-we-set-up-our-cloud-agent-environment-cursor-2026-07-30.md]

1. Agents 能否访问开发者能访问的同样工具和数据？
2. Agents 能否找到文档化"你的开发者实际如何工作"的 skills？
3. Agents 能否测试和验证核心 workflows？
