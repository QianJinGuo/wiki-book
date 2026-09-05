---
source_url: https://mp.weixin.qq.com/s/DV0k1WzYJm-qJ6bO2kuouw
ingested: 2026-07-28
sha256: 20227131b579393ffc790931f90d7303084e68495d761d3641891960c487ee53
source_published: 2026-07-28
title: "全球首个大规模 Agentic 扩散模型来了！"
author: 机器之心
feed_name: 关注大模型的
---

# 全球首个大规模 Agentic 扩散模型来了！

蚂蚁团队发布并开源 LLaDA2.2，全球首个大规模 Agentic 扩散模型。

## 背景：扩散语言模型的瓶颈

此前扩散语言模型在 Agent 任务中存在三个核心问题：
1. **一次性生成**：编辑能力被限制在等长替换（T2T: keep/substitute），无法删除或插入
2. **《The Flexibility Trap》(ICML 2026 Best Paper)**：扩散模型的任意顺序生成在推理任务上构成陷阱，解空间过早坍缩
3. **Agent 任务不稳定**：反复尝试同一失败动作，难以维持严格 JSON schema

## LLaDA2.2 核心创新

### 四种原子操作（Levenshtein 编辑）
将动作空间从两种扩展到四种：**KEEP**（保留）、**SUBSTITUTE**（替换）、**DELETE**（删除）、**INSERT**（插入）。DELETE 移除当前 token 并将后续左移；INSERT 将 x_i 扩展为 `[MASK], x_i`，为后续去噪创造可填充位置。

序列长度与 token 位置首次成为并行解码中可动态改写的对象。

监督信号来源：计算模型草稿与 ground truth 的最长公共子序列（LCS），以匹配位置为锚点推导编辑标签。

消融：SWE-bench Verified 上，启用 Levenshtein 编辑 vs 不启用 = 44.4 vs 35.8，绝对提升 8.6 个百分点。

### L-EBPO（Levenshtein 编辑证据下界的分块策略优化）

两层控制体系：
- **外层 EBPO**：优化跨越 Agent 交互轮次的轨迹级决策
- **内层**：管理块内的拼接编辑（何时、何处施加 DELETE/INSERT）

奖励信号完全来自环境反馈：工具调用执行正确性 + 输出格式合法性 + 任务整体完成度。

### 128K 原生上下文
从 LLaDA2.1 的 8K 扩展到 128K（16 倍）。两级推进：先在 64K 续训 300B token，再在 128K 续训 200B token。采用文档感知 packing 与注意力边界防止文档间干扰。Agent 数据在最后 128K 阶段才加入。

### Block Routing（块路由）
MoE 架构下，块扩散一步并行处理 32-64 个 token。若每个 token 各自独立路由，一个块触及的专家集合是并集，导致 HBM 流量上升。Block Routing 将路由单元与扩散生成单元对齐：块级准入分数通过 token racing 计算，每块固定容量专家池 C。保持 token 级专精的同时提供可预测的专家工作集上界。

## 评测结果

**7 项 Agent 基准**：LLaDA2.2-flash 平均 53.83，Ling-2.6-flash 55.74，分数非常相近。
- τ²-Bench：80.33 vs 76.36（领先）
- PinchBench：81.66 vs 81.30（领先）
- MCP-Atlas：46.21 vs 41.12（领先 5.09）
- Claw-Eval：64.22 vs 64.56（持平）

**10 项通用基准**：LongBench v2 上 45.13 vs 42.94（领先）。

**效率**：BF16 平均吞吐量达 Ling-2.6-flash 的 1.64 倍；FP8 量化后额外提升 18.6%。

## 资源
- 模型：https://huggingface.co/inclusionAI/LLaDA2.2-flash
- 代码：https://github.com/inclusionAI/LLaDA2.X
- 技术报告：https://github.com/inclusionAI/LLaDA2.X/blob/main/LLaDA2_2_tech_report.pdf
