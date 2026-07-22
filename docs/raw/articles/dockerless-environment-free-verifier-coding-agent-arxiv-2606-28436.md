---
title: "Dockerless: 免环境补丁验证器，让 Coding Agent 后训练不再依赖 Docker"
source_url: "https://mp.weixin.qq.com/s/940okCms5A4PdJEdrh2Gtg"
author: "AGI Hunt"
created: 2026-07-02
updated: 2026-07-02
type: raw
tags: [dockerless, coding-agent, verifier, swe-bench, agent-training, sft, rl, grpo, post-training]
ingested: 2026-07-02
sha256: d6875c5bf3b88ce8653ca50892026fc5a79d509902678a691a4ad957b45173be
---

# Dockerless: 免环境补丁验证器，让 Coding Agent 后训练不再依赖 Docker

上海交通大学与抖音集团提出 Dockerless——一种无需为每个仓库单独配 Docker 环境的 Agent 式补丁验证器，靠并行子 Agent 在代码库里搜证据来判断补丁对不对；用它做 SFT 筛选和 RL 奖励，整条后训练流水线都可以免环境，SWE-bench 三项基准上分别达到 62.0%、50.0%、35.2% 的解决率，与跑测试的常规方案几乎打平。

论文标题：Dockerless: Environment-Free Program Verifier for Coding Agents
论文链接：https://arxiv.org/abs/2606.28436

## 核心问题：Verifier 是后训练瓶颈

训练 Coding Agent 的标准流程：SFT 喂高质量轨迹 → RL 用奖励信号推动模型。两条线都绕不开同一个裁判——验证器（Verifier）。

传统做法：把补丁丢进仓库专属 Docker 镜像，跑单元测试。这在 SWE-bench 基准上可行，但在真实世界：
- 每个仓库需定制 Docker 镜像、锁定依赖版本、写执行脚本
- 企业内部代码、遗留系统常常没有可复现的测试环境
- Agent 可能改对了，但没法用测试来确认

现有免环境验证器大多只看补丁文本，拿候选补丁和参考补丁做表面比对，或让 LLM 凭 diff 打分，从不真正翻代码库。

## Dockerless 方法

两阶段 Agent 流水线：

**第一阶段：出题 + 并行探索**
验证器从 Issue 和参考补丁里提炼 2-4 个验证问题（如：修复落在哪？预期行为？会不会误伤其他模块？）。每个问题派一个子 Agent，用只读 shell 工具在代码库里搜证据，返回带来源定位的短答案。

**第二阶段：综合判决**
主模型拿到 Issue、两个补丁、所有问答对，输出二元判决 token（0/1）。推理时把 verdict token 的 logit 转成连续分数，作为 SFT 筛选和 RL 奖励信号。

### 训练
- 数据：SWE-Gym + Multi-SWE-RL 共 3.7K Issue
- 教师模型：GLM-5
- 拒绝采样：只保留判决正确的轨迹
- 骨干：Qwen3.5-9B（与下游 Agent 同尺度）

### 免环境后训练管线

**SFT 数据筛选（RFT）**：在最小 Linux 镜像里采集 16K 轨迹，Dockerless 打分取 top 4K 做 SFT。

**RL（GRPO + Dockerless 奖励）**：每条 rollout 的补丁用 Dockerless 打分作为奖励，GRPO 优化。

## 核心结果

| 模型 | Verified | Multilingual | Pro |
|------|----------|-------------|-----|
| Qwen3.5-9B 基座 | 59.6 | 41.3 | 32.3 |
| SWE-Lego-8B（次强开源） | 41.2 | 19.0 | 16.1 |
| Dockerless-RL-9B | **62.0** | **50.0** | **35.2** |
| Test-Execution RL（oracle） | 62.4 | 51.3 | 35.7 |

SFT 阶段：Dockerless 筛轨迹 vs 有环境采集几乎打平（60.6 vs 60.0）。
RL 阶段：Dockerless 奖励 vs 真跑测试的 oracle 奖励差距仅 0.4-1.3 个点。

**验证器 AUC**：Dockerless 81.0，DeepSWE Verifier 66.7（+14.3），GPT-5.4 零样本 75.9。

## 关键洞察

1. **前沿模型可在「裸 Linux」里干活**：去掉 per-repo 环境，解决率仅掉 3.0-13.9 个百分点，远未崩盘
2. **验证问题数量**：2-4 个最优，过多引入冗余/噪声
3. **Agent 式仓库探索**：判决依据来自仓库的真是文件片段和调用关系，而非补丁文本相似度
