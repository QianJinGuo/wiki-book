---
title: fudan-peking-ahe-agentic-harness-engineering
source_url: https://mp.weixin.qq.com/s/QKZb2kzZI2K7OEa96X0Flw
publish_date: 2026-05-07
tags: [wechat, article, gpt, deepseek, agent, harness, coding, llm, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 08a7e44b6c3d662721bfebdf779eccd662dc140a3828da4278635c1e7c6c9bb0
---
Coding Agent 的性能不仅取决于底层大模型，更取决于包围它的 Harness（系统提示、工具、中间件、记忆等）。复旦&北大提出 AHE（Agentic Harness Engineering），通过组件可观测性、经验可观测性、决策可观测性三大支柱，让另一个「进化 Agent」自动迭代优化 Harness。10 轮迭代即可在 Terminal-Bench 2 上将 pass@1 从 69.7% 提升至 77.0%，不仅超越人类设计的 Codex-CLI（71.9%），且进化后的Harness能零样本迁移到 SWE-bench 和多个异构模型家族。
1. 被忽视的「Harness Engineering」瓶颈
Coding Agent 的进展不只取决于 Base Model 的智商，更取决于它外围的工程架构——Harness。Harness 是模型与外部世界之间的「中介层」，包括：System Prompt、Tools、Middleware、Skills/Sub-agents、Long-term Memory。
核心问题：如何让一个「进化 Agent」自动、稳定地联合优化 Harness 的所有可编辑组件？
作者抛出了一个反直觉的判断：进化 Agent 稳定优化 Harness瓶颈，不是因为 Agent 不够聪明，而是因为整个进化循环缺乏可观测性。
2. AHE 核心设计：三大可观测性支柱
AHE 的核心洞察是：瓶颈不在 Agent 能力，而在可观测性（Observability）。整个闭环由三大支柱支撑：
2.1 组件可观测性：文件级解耦 Harness
AHE 将 Harness 显式解耦为 7 种正交组件类型：System Prompt、Tool Description & Implementation、Middleware、Skill、Sub-agent Configuration、Long-term Memory。每个失败模式都能映射到单一组件类别。
种子 Harness 被刻意设计得极简（只有一个 shell 执行工具，无中间件、无技能），迫使后续每个组件都必须靠实测数据「挣」到自己的位置。
2.2 经验可观测性：分层蒸馏轨迹证据
原始轨迹是数百万 token 的「噪音海洋」。AHE 引入 Agent Debugger 框架，输出两层报告：Per-task Analysis（每个任务的根因分析）和 Benchmark-level Overview（聚合所有任务的全局概览）。这种渐进式披露既省 token，又保证决策有据可依。
2.3 决策可观测性：可证伪的编辑契约
进化 Agent 每轮读取分层证据后，决定增删改哪些组件。AHE 对编辑施加两道约束：
- 可控性：进化 Agent 只能在 Harness 工作区内写入，运行目录、验证器、LLM 配置均为只读，种子 System Prompt 不可删除
- 自声明预测：每个编辑附带 Manifest 记录，包含：失败证据推断的根因、目标修复方案、预测影响
3. 实验结果
3.1 AHE 能否超越人类与自动化基线？
在 Terminal-Bench 2（89 个任务，k=2 rollout/任务）上运行 10 轮 AHE：
- AHE 从种子 69.7% 提升至 77.0%
- 超越人类设计的 Codex-CLI（71.9%）和自进化基线 ACE（68.9%）、TF-GRPO（72.3%）
为什么 ACE 和 TF-GRPO 追不上？它们只编辑单一表面（Prompt 或工具序列），但 AHE 的增益恰恰来自工具实现、中间件和记忆。
3.2 进化结果是否过拟合？
跨基准迁移（SWE-bench-verified）：
- AHE 取得最高整体成功率，比种子少用 12% token
- ACE 和 TF-GRPO 的 Prompt 级注入在跨任务表面时变成「昂贵噪音」
跨模型迁移（5 个不同基座）：
- GPT-5.4 medium: +2.3 pp
- GPT-5.4 high: +7.3 pp
- GPT-5.4 xhigh: +2.3 pp
- Gemini-3.1-flash-lite: +5.1 pp
- DeepSeek-v4-flash: +10.1 pp
- Qwen-3.6-plus: +6.3 pp
规律：离饱和越远的模型，增益越大。
3.3 增益从哪来？自归因可靠性
组件消融：
- Long-term Memory: +5.6 pp
- Tools: +3.3 pp
- Middleware: +2.2 pp
- System Prompt: -2.3 pp（回归）
自归因可靠性：
- Fix Precision: 33.7%（随机基线 6.5%）
- Fix Recall: 51.4%（随机基线 10.6%）
- Regression Precision: 11.8%（随机 5.6%）
- Regression Recall: 11.1%（随机 5.4%）
进化 Agent 能可靠地知道自己要修什么，但预见不到自己的改动会搞坏什么。这是 AHE 当前最大的局限。
https://arxiv.org/pdf/2604.25850