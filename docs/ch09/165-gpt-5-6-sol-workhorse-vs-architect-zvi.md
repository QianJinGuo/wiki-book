# GPT-5.6 Sol：Workhorse vs Architect — Zvi 深度对比分析

## Ch09.165 GPT-5.6 Sol：Workhorse vs Architect — Zvi 深度对比分析

> 📊 Level ⭐⭐ | 2.9KB | `entities/better-call-sol-the-workhorse-openai-gpt-56-sol-vs-fable-zvi-2026.md`

# GPT-5.6 Sol：Workhorse vs Architect — Zvi 深度对比分析

> **Background**：本文基于 Zvi（thezvi.wordpress.com）对 OpenAI GPT-5.6 Sol 的全面分析，整合官方基准测试、社区反馈、基准验证、安全评估和实际使用模式，聚焦 Sol 作为"Workhorse"定位与 Claude Fable 作为"Architect"定位的范式对比。

## 核心定位：Workhorse vs Architect

Zvi 的核心框架将 Sol 和 Fable 定位为互补而非竞争对手：

| 维度 | Sol (Workhorse) | Fable (Architect) |
|------|:---------------:|:-----------------:|
| 角色 | 执行者、实干者 | 合作者、架构师 |
| 擅长的任务 | 已知如何完成的事 | 需要规划和架构的任务 |
| 任务类型 | CLI、终端测试、浏览器自动化 | 开放式仓库级代码修改 |
| 效率 | 定价更低，任务路径清晰时速度快 | 定价更高，但开放性问题质量更高 |
| 安全性 | 较低尾风险 | 需要更严格控制 |
| 最佳搭档 | Codex / ChatGPT Work | Claude Code / Cowork |

## 基准测试对比

两种模型在不同基准测试中展现出截然不同的优势：

- Sol 在 Agents' Last Exam、AA Agent Coding Index v1.1、BrowseComp 上领先——这些评测偏向任务路径清晰、步骤可拆分的场景
- Fable 在 SWE-Bench Pro 上以 80% vs 64.6% 大幅领先——评测反映开放式仓库级代码修改能力
- Terminal-Bench 2.1 Ultra：Sol 91.9% vs Fable 约 83%——Sol 在明确任务路径上一骑绝尘

## 定价与分层

Sol API 定价 $5/$30（输入/输出每百万 token），Terra $2.50/$15，Luna $1/$6。对比：Claude Opus $5/$25，Fable $10/$50。

## 实际应用模式

Zvi 建议的实践模式：
- 对同一个任务向两家发查询，对比结果
- 提升期望值——Sol 使得更多任务变得可能
- 降低构建工具的阈值——让大量工作自动化
- Sol 适合"已知如何做的任务"，Fable 适合"需要想清楚再做的任务"

## 相关实体
- [GPT-5.6 Sol/Terra/Luna 分层定价](../ch01/521-codex.html)
- [GPT-5.6 Preview System Card](../ch01/545-gpt-5-6-preview-system-card-community-detection-benchmar.html)
- [Claude Opus 4.8 System Card (Zvi)](../ch01/1286-claude-opus-4-8.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/better-call-sol-the-workhorse-openai-gpt-56-sol-vs-fable-zvi-2026.md)

---

