# Dockerless: 免环境补丁验证器

## Ch09.177 Dockerless: 免环境补丁验证器

> 📊 Level ⭐⭐⭐ | 4.7KB | `entities/dockerless-environment-free-verifier-coding-agent.md`

# Dockerless: 免环境补丁验证器

## 摘要

Dockerless 是上海交通大学与抖音集团提出的免环境（environment-free）补丁验证器，通过 Agent 式两阶段流水线（并行子 Agent 代码库探索 + 综合判决）评估 Coding Agent 补丁的正确性。在 SWE-bench Verified/Multilingual/Pro 三项基准上，Dockerless-RL-9B 分别达到 62.0%/50.0%/35.2%，与依赖 Docker 测试的 oracle 方案仅差 0.4-1.3 个百分点。验证器 AUC 81.0，比最强开源 DeepSWE Verifier 高 14.3 点。

## 核心要点

1. **方法**：两阶段 Agent 流水线——(1) 从 Issue 提炼 2-4 个验证问题，派子 Agent 用只读 shell 工具搜代码库证据；(2) 综合判决输出 0-1 连续分数
2. **训练**：GLM-5 教师生成轨迹 → 拒绝采样（只保留判对轨迹）→ Qwen3.5-9B 骨干端到端微调，共 3.7K Issue 数据
3. **免环境 SFT**：16K 免环境轨迹中 Dockerless 打分 top 25% 做 SFT，效果与有 Docker 环境采集几乎持平 (60.6 vs 60.0 Verified)
4. **免环境 RL**：Dockerless 分数直接当 GRPO 奖励信号，与 oracle 测试奖励差距仅 0.4-1.3 点
5. **核心洞察**：前沿模型在裸 Linux 环境（无 per-repo Docker）的解决率仅掉 3-14 个百分点，验证器而非 rollout 环境才是后训练瓶颈

## 深度分析

### 验证器瓶颈的工程意义

Coding Agent 的后训练（SFT + RL）长期依赖 per-repo Docker 环境来做补丁验证。Dockerless 的核心突破在于证明了「Agent 式代码库探索」可以替代「跑测试」作为验证手段，且精度逼近 oracle。这对工业级 Agent 训练有直接意义：企业内部代码无需搭建测试环境即可进行 SFT 数据筛选和 RL 奖励计算。

### 与现有验证器的对比

| 维度 | Docker 测试 | LLM 凭 diff 打分 | Dockerless |
|------|------------|-----------------|------------|
| 环境依赖 | per-repo Docker | 无 | 最小 Linux |
| 仓库 grounding | 强（实际执行） | 无 | 强（代码库探索） |
| 可扩展性 | 差 | 好 | 好 |
| AUC (Verified) | — | ~66.7 (DeepSWE) | **81.0** |
| SWE-bench Ver. | 62.4 (oracle) | — | **62.0** |

Dockerless 占据「免环境 + 有仓库 grounding」的独特生态位。

### 关键技术细节

- 验证问题数量 2-4 最优（过多引入噪声）
- 连续分数（通过 logit 转换）可作为 RL 密集奖励，非二元判决
- 骨干 Qwen3.5-9B 与下游 Agent 同尺度，便于链路对齐
- 拒绝采样中负正样本比上限 3:1 缓解类别不平衡

## 实践启示

1. **免环境后训练路线可行**：Dockerless 验证了整条后训练流水线可脱离 per-repo Docker 运行，为 Agent 训练基础设施简化提供了方向
2. **Agent 式验证优于文本比对**：让 Agent 翻阅代码库找证据，比单纯比较补丁文本或 LLM 看 diff 更准确
3. **子 Agent 并行探索**：多问题并行探索控制延迟（2-4 个问题），平衡准确率和探索成本
4. **连续奖励信号**：Dockerless 的连续分数（非二元）可作为 GRPO 等 RL 算法的密集奖励信号，避免稀疏奖励问题

## 相关实体

- [RLHF/GRPO 训练](../ch01/1292-trl.html)
- [SWE-bench Agent 评测](../ch04/664-swe-bench-agent.html)
- [Generator-Evaluator Harness](../ch01/1299-anthropic.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/dockerless-environment-free-verifier-coding-agent-arxiv-2606-28436.md)

---

