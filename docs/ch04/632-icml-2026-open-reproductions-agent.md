# ICML 2026 Open Reproductions — 大规模 Agent 驱动的论文复现审计

## Ch04.632 ICML 2026 Open Reproductions — 大规模 Agent 驱动的论文复现审计

> 📊 Level ⭐⭐ | 5.4KB | `entities/icml-2026-open-reproductions-agent-audit.md`

# ICML 2026 Open Reproductions — 大规模 Agent 驱动的论文复现审计

Hugging Face + alphaXiv 于 2026-07-15 ~ 08-02 举办的 ICML 2026 Open Reproductions challenge——社区成员自带 coding agent 逐 claim 复现 ICML 2026 论文，最终以 **2,226 篇论文（占全会 34%）被尝试、35,908 个 claim 被裁决** 的规模，成为迄今最大规模的开放 ML 会议逐 claim 审计。

## 挑战机制

- **Claim 抽取**：主办方索引全部 6,341 篇 ICML 2026 论文，从摘要中提取核心科学 claim，让 agent 从「可检验的具体目标」而非 40 页 PDF 起步
- **自带 Agent**：参与者使用 Claude Code / Codex / Cursor / OpenResearch `orx` 等任意 agent 框架，主办方提供单命令拉取论文 + claims + 指令的接口
- **Trackio Logbook**：每次复现产出静态 HF Space logbook（复现报告 + 运行代码 + artifacts + 可选完整 agent 执行轨迹），审计过程本身可审计
- **自动裁决**：Logbook Judge 使用开源权重模型 GLM-5.2 重读每份 logbook，逐 claim 给出 verdict：`verified` / `falsified` / `toy`（降规模证据）/ `inconclusive`，且明确要求不信任 logbook 的自我评估
- **规模**：1,221 名成员、6,816 份 logbook、2,962 个 HF Jobs 云任务（$20 免费算力）、274 份完整 agent 轨迹数据集公开

## 关键发现

- **51% 的已检论文（1,103 篇）至少 1 个 claim 被独立验证**：其中 266 篇完全复现（所有 claim verified），632 篇部分复现且无 falsified；共 3,978 个 claim 被真实实验确认
- **23% 的已检论文（496 篇）至少 1 个 claim 被 falsified 或争议**：49 篇全部 claim 被推翻，242 篇独立复现团队对同一 claim 得出相反 verdict——「可复现性不是二元的，它是对抗性的」
- 502 篇仅有 toy-scale 证据，280 篇无法判定（缺失 artifacts 最常见）

## 代表性 falsification 案例

| 论文 | 声称 | 审计发现 |
|------|------|---------|
| Towards Optimal Robustness in Learning-Augmented Paging | 鲁棒性 H_k + O(1) | 实测 additive term 按 0.38·ln k 增长，re-implementation 在 k=1024 确认 ~9 sigma；真实为 H_k + Θ(log k) |
| Attention's forward pass and Frank-Wolfe | token particles 坍缩到原点 | 三个独立团队找到反例（t=224 / ~3,800 / 6,416 步出现违例）——有限时域检查过早停止导致他人"验证成功" |
| Self-Distillation Enables Continual Learning | 中心方程/理论基于 reverse KL | 代码默认（产出全部结果的）计算 forward KL；+4pp headline 结果无法复现，作者已上传 arXiv 澄清版 |
| Do Transformers Need Three Projections? | 3.1% quality cost for 50% cache reduction | ~66% 被评 label 位置是 EOS padding token（趋近零 loss），perplexity 被低估约 3 倍；修正后约 9.4% |

**假 falsification 也存在**：一份 logbook 声称"方法比 baseline 慢 2x"，实为复现方算术错误（per-trajectory 时间对比 per-batch-of-50 时间），正确归一化后数据反而确认了论文声称的 8x 加速。

## 人类在 Agent 科研中的角色

- **纯 agent 执行有真实边界**：agent 陷入局部循环、误读 scale-dependent 行为（paging 论文多个"verified"来自 log-k 增长显现前的检查）、在 units mismatch 上构建整个 falsification
- **部分评估不可约地需要人类**：human-in-the-loop 冠军案例——量化鲁棒性论文的数值指标显示"无坍缩"，但图像是否可用是感知问题；参与者构建 review UI 亲自裁决全部 128 对图像
- **人类角色 = 有效管理智能**：类似 PI 为研究生搭建环境（算力、harness、数据、适时反馈），收益最大的参与者是「搭建正确环境 + 提出正确问题」的人

## 行业意义

这是 agent 在科研评估中从"辅助写作/跑实验"走向"独立 claim 验证基础设施"的实证：agent 复现规模（2,226 篇/19 天）远超人类审稿容量（审稿人自述"未仔细检查 proofs"的 spotlight 论文被复现推翻）。审计产物（logbook + 轨迹 + 裁决）全部公开，主办方希望记录被打破。

## 相关实体

- [Agent 评估基准框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmark-frameworks.md) — 本挑战本质是 claim 级评估基础设施，与基准框架互补
- [Agent 评估基准](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md) — 复现审计可作为科研产出评估的新基准形态
- [Agent 编排模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md) — BYO agent + 统一接口的社区协同模式
- [Agent 工具研究](../ch03/019-agent.html) — 工具与 agent 能力的实证关系
- [采用 AI coding agent 的六个教训](ch04/409-ai-coding-agent.html) — coding agent 实际能力边界的并行证据
- [Agentic RL 框架实践](ch04/314-agentic-rl.html) — 长时域 agent 行为的另一视角
- [Verifier-Driven Development](https://github.com/QianJinGuo/wiki/blob/main/concepts/verifier-driven-development.md) — 自动化验证驱动的开发范式延伸

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/what-we-learned-by-reproducing-2200-papers-from-icml.md)

---

