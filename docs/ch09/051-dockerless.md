# Dockerless: 免环境补丁验证器

> 📊 Level ⭐⭐⭐ | 7.2KB

## 摘要

Dockerless 是上海交通大学与抖音集团提出的免环境（environment-free）补丁验证器，通过 Agent 式两阶段流水线（并行子 Agent 代码库探索 + 综合判决）评估 Coding Agent 补丁的正确性。在 SWE-bench Verified/Multilingual/Pro 三项基准上，Dockerless-RL-9B 分别达到 62.0%/50.0%/35.2%，与依赖 Docker 测试的 oracle 方案仅差 0.4-1.3 个百分点。验证器 AUC 81.0，比最强开源 DeepSWE Verifier 高 14.3 点。

## 核心要点

1. **方法**：两阶段 Agent 流水线——(1) 从 Issue 提炼 2-4 个验证问题，派子 Agent 用只读 shell 工具搜代码库证据；(2) 综合判决输出 0-1 连续分数
2. **训练**：GLM-5 教师生成轨迹 → 拒绝采样（只保留判对轨迹）→ Qwen3.5-9B 骨干端到端微调，共 3.7K Issue 数据
3. **免环境 SFT**：16K 免环境轨迹中 Dockerless 打分 top 25% 做 SFT，效果与有 Docker 环境采集几乎持平 (60.6 vs 60.0 Verified)
4. **免环境 RL**：Dockerless 分数直接当 GRPO 奖励信号，与 oracle 测试奖励差距仅 0.4-1.3 点
5. **核心洞察**：前沿模型在裸 Linux 环境（无 per-repo Docker）的解决率仅掉 3-14 个百分点，验证器而非 rollout 环境才是后训练瓶颈

## 深度分析

### 瓶颈的重定位：从 rollout 环境到验证器

论文最有价值的贡献不是 62.0% 这个数字，而是对后训练瓶颈的一次实证重定位。直觉上，去掉 per-repo Docker 后解决率理应大幅崩塌；实测仅下降 3.0-13.9 个百分点。这说明主流模型的能力已足以在最小环境中完成绝大多数仓库的探索与修改，真正卡住后训练规模化的不是执行环境，而是裁判——没有可信验证器，SFT 轨迹无从筛选，RL 奖励无从计算。这解释了企业内部代码与遗留系统长期游离于 Agent 后训练之外的原因：不是模型不会改，而是没人能确认改对了。Dockerless 把「补环境」这个重资本、强人工的环节替换成纯算力可复制的验证调用。 这一结论与 [Agentic RL 执行环境](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentenv-agentic-rl-execution-environment.md) 中「环境供给决定训练规模」的判断互相印证，也呼应了 [Agent 自进化的 Evaluator 瓶颈](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-self-evolution-evaluator-bottleneck.md) 的观察。

### 判决的 grounding：从补丁文本比对到仓库证据链

现有免环境验证器的失败模式在于「看 diff 打分」：或做候选补丁与参考补丁的表面相似度比对，或让 LLM 凭 diff 直接主观评分，判决与代码库的真实语义完全脱钩。Dockerless 的关键设计是把开放式判断分解为 2-4 个可局部验证的问题——修复落在哪、预期行为是什么、是否误伤其他模块——再由并行子 Agent 用只读 shell 工具在仓库内搜集带来源定位的文件片段作为证据，主模型综合问答对输出判决。判决因此建立在仓库的真实文件与调用关系之上，AUC 从 DeepSWE Verifier 的 66.7 提升到 81.0，也超过 GPT-5.4 零样本的 75.9。这种「分解提问 → 并行取证 → 综合判决」结构，本质上是 [Owner-Worker-Verifier 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/owner-worker-verifier-architecture.md) 在验证器场景的应用：worker 负责局部证据搜集，owner 汇总全局判决。2-4 个问题的经验上限还揭示了证据冗余的代价——问题过多引入噪声反而稀释判决质量。

### 连续奖励与同尺度训练链路

Dockerless 输出的并非二元 0/1 判决，而是 verdict token 的 logit 转换出的连续分数，这一设计让它能同时服务两条训练线：SFT 阶段对 16K 轨迹打分取 top 4K 做 RFT 筛选，RL 阶段直接作为 GRPO 的密集奖励信号，避免稀疏二值奖励带来的优化困难。与真跑测试的 oracle 奖励相比，最终解决率差距仅 0.4-1.3 个点，意味着奖励信号的精度损失在优化过程中被大幅吸收——验证器不必完美，只需足够接近 oracle 即可驱动有效学习。训练链路同样有讲究：教师模型（GLM-5）生成轨迹后做拒绝采样，只保留判决正确的样本，并以 3:1 的负正样本比上限控制类别不平衡；骨干选 Qwen3.5-9B 与下游 Agent 同尺度，避免验证器与被验证模型之间的能力断层。

### 边界与风险：验证器成为单点故障

免环境路线把可靠性集中到验证器这一个单点上。AUC 81.0 意味着判决仍有约五分之一的模糊地带，而 RL 会放大系统性偏差：若模型学会产出「Dockerless 喜欢的补丁」而非真正正确的补丁，就构成验证器特有的 reward hacking 风险，必要时可结合 [对抗性验证](https://github.com/QianJinGuo/wiki-public/blob/main/entities/adversarial-verification.md) 思路做交叉校验。方法本身还有两个输入依赖：验证问题需从 Issue 与参考补丁中提炼，对「只有需求描述、无参考解」的开放任务尚未覆盖；3.7K Issue 的训练规模也意味着验证能力受数据分布约束。

## 实践启示

1. **免环境后训练路线可行**：Dockerless 验证了整条后训练流水线可脱离 per-repo Docker 运行，为 Agent 训练基础设施简化提供了方向
2. **Agent 式验证优于文本比对**：让 Agent 翻阅代码库找证据，比单纯比较补丁文本或 LLM 看 diff 更准确
3. **子 Agent 并行探索**：多问题并行探索控制延迟（2-4 个问题），平衡准确率和探索成本
4. **连续奖励信号**：Dockerless 的连续分数（非二元）可作为 GRPO 等 RL 算法的密集奖励信号，避免稀疏奖励问题

## 相关实体

- [RLHF/GRPO 训练](https://github.com/QianJinGuo/wiki-public/blob/main/entities/fine-tuning-with-trl.md)
- [SWE-bench Agent 评测](https://github.com/QianJinGuo/wiki-public/blob/main/entities/swe-bench-agent-evaluation.md)
- [Generator-Evaluator Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-generator-evaluator-anthropic.md)

→ [原文存档](https://mp.weixin.qq.com/s/940okCms5A4PdJEdrh2Gtg)

---

