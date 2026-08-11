---
source: newsletter
source_url: https://www.anthropic.com/research/riemann-zeta
ingested: 2026-08-11
sha256: 2b4bb6cf942ea3c29ad135a5df47a1d1facafe9e5fcfa38b01fa5f2ace3b65e0
title: "Learning more about Claude's mathematical capabilities"
vxc_score: 64 (LLM deepseek-v4-flash)
---

# Learning more about Claude's mathematical capabilities

**Published**: Aug 10, 2026 · **Source**: Anthropic Research

## 核心结果

Anthropic 未发布的研究版 Claude 在尝试黎曼猜想（Riemann hypothesis）时，意外改进了黎曼 zeta 函数满足假设的零点比例下限——从 **41.6% 提升到 67.2%**。Claude 未能证明黎曼猜想本身（1859 年提出，百万美元悬赏），但在相关问题上取得实质进展。两位 Anthropic 数学家（Levent Alpöge 和 Ralph Furman）研究并验证了 Claude 的论文，Brian Conrey 和 Dan Goldston 两位领域专家审查了结果。Claude 还产出了 Lean 形式化证明，通过标准验证工具 comparator。

## 方法论（多智能体编排细节）

- 未发布的研究版 Claude 在 Claude Code 中两个会话内完成，共消耗 **3100 万输出 token**
- Jarred Sumner（Anthropic 员工，非数学家）提示 Claude "认真尝试"黎曼猜想，数学选择完全交给模型
- 最初 Claude 生成并尝试了 650 个想法，全部失败
- 重试后，Claude 协调了约 **60 个 Claude 子代理**，花了一天半：子代理间运行了 **2400 条 shell 命令**，编写数百个 Python 脚本
- 子代理对已知 zeta 零点运行数千次数值检查，并相互评审工作
- Jarred 的输入主要是鼓励性消息（"继续"、"相信你自己"）——帮助 Claude 克服最初的自我怀疑
- Claude 自我验证：子代理审查证明、搜索反例、下载 54 篇 arXiv 论文确认结果未被发现、从零独立重证

## 技术要点

Claude 的发现：将 Baluyot、Goldston、Suriajaya、Turnage-Butterbaugh 系列工作与 Bombieri 2000 年论文结合，可超越 41.6% 的下限。技术解释：Claude 构造 Weil 诱导二次型函数空间，利用线上/线下零点的正/负定子空间，写出关于二次型秩的不等式（涉及一阶/二阶矩信息）。关键勇气步骤：同时处理整个空间的正/负定性质，允许二次型非对角。

## 意义

- AI 模型数学能力进展速度的最新例证；研究结果作为尝试黎曼猜想的意外副产品
- Claude 最初对自己发现持怀疑态度（可能因训练数据中学到开放数学问题的难度）
- 团队明确表示：不期待该技术能证明黎曼猜想本身
