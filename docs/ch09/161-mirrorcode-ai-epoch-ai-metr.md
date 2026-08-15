# MirrorCode: AI 从行为重建完整程序的长时程基准（Epoch AI × METR）

## Ch09.161 MirrorCode: AI 从行为重建完整程序的长时程基准（Epoch AI × METR）

> 📊 Level ⭐⭐ | 4.8KB | `entities/mirrorcode-long-horizon-benchmark-epoch-ai-metr.md`

# MirrorCode: AI 从行为重建完整程序的长时程基准（Epoch AI × METR）

## 核心定义

MirrorCode 是 Epoch AI 与 METR 联合开发的软件工程基准，用于测试 AI 模型在**长时程编码任务**上的能力：模型被要求**端到端重新实现整个程序**，且无法访问原始源代码——只能根据程序行为推断实现，AI 生成的解决方案必须在端到端测试（含 held-out 测试）上与原始程序输出完全一致。

25 个目标程序覆盖 Unix 工具、数据序列化与查询工具、生物信息学、解释器、静态分析、密码学与压缩等计算领域。

## 与现有 SWE 基准的关键差异

大多数软件工程基准（如 SWE-bench）聚焦短任务——修 bug 或实现单个 feature，且推理预算通常限制在 $1–10。MirrorCode 提供**足够大的推理预算**让模型认真尝试：最大的任务单次运行花费 $2,600，AI 无人工干预连续工作 19 天。

- **任务形态**：从行为重建完整程序（black-box reimplementation），而非补丁式修复
- **预算规模**：单任务可达 $2,600 / 19 天；正式 leaderboard 每任务 100 亿 token + 7 天预算，每任务跑 3 次
- **测试设计**：模型永远看不到端到端测试，防止构建 lookup table 伪造输出
- **沙箱约束**：无网络、无原始代码库、无作弊路径

## 实测结果：Claude Opus 4.7 重建 gotree

Claude Opus 4.7 成功重新实现了 gotree——约 16,000 行 Go 代码、40+ 命令的生物信息学工具包，耗时 14 小时、成本 $251。人类工程师无 AI 辅助完成同一任务预计需要 2–17 周。

最佳 AI gotree 实现通过了 2000/2001 个测试——仅在一个处理日期标注的边缘命令上失败，被视为近乎完美的重建。

## 数据污染（memorization）控制

由于任务涉及重建开源程序，模型预训练中很可能见过原始代码库，可能虚增分数。MirrorCode 内置 **memorization screen**：AI 成功重建了通过该筛查的目标程序，而未能重建筛查显示存在记忆证据的程序——表明结果并非主要由记忆驱动，但无法完全排除记忆的贡献。

## 开放资源与评估协议

- 开放 scaffold + 25 个目标程序中的 22 个（共 132 个任务实例，覆盖 6 种编程语言），其余 3 个目标作为私有测试集保留
- 正式 leaderboard 固定任务集：Medium + Large 桶的 15 个目标程序，每个程序用两种语言（通常 Go + Ada）评估，共 30 个任务
- 论文：arXiv 2606.30182，作者 Tom Adamczewski / David Owen / David Rein 等

## 与 Wiki 现有概念的关系

MirrorCode 填补了 [Agent 评估基准](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md) 中长时程维度的空白——现有 [LLM 基准全景](https://github.com/QianJinGuo/wiki/blob/main/concepts/llm-benchmark-landscape.md) 以短任务为主，而 MirrorCode 把「重建整个程序」变成可评测任务，与 [Agentic RL 长时程实践](../ch04/312-agentic-rl.html) 互补。

其推理预算设计（$2,600 / 19 天）与 [长时程 Agent 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/long-running-agent-architecture.md) 直接呼应——评测预算必须匹配任务的真实难度，否则短预算只会测出「短时程能力」。

同时它也是 [编码基准 reward hacking](https://github.com/QianJinGuo/wiki/blob/main/entities/cursor-reward-hacking-coding-benchmarks.md) 讨论的反面样本——通过 held-out 测试 + 沙箱 + memorization screen 三重设计降低作弊面。

## 相关实体

- [Agent 评估基准](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)
- [LLM 基准全景](https://github.com/QianJinGuo/wiki/blob/main/concepts/llm-benchmark-landscape.md)
- [Claude Opus 4.7](../ch01/1233-claude.html)
- [Agentic RL 长时程实践](../ch04/312-agentic-rl.html)
- [长时程 Agent 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/long-running-agent-architecture.md)
- [编码基准 reward hacking](https://github.com/QianJinGuo/wiki/blob/main/entities/cursor-reward-hacking-coding-benchmarks.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/mirrorcode-long-horizon-benchmark-epoch-ai-metr.md)

---

