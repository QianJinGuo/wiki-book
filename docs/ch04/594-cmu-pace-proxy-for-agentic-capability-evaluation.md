# CMU PACE — Proxy for Agentic Capability Evaluation

## Ch04.594 CMU PACE — Proxy for Agentic Capability Evaluation

> 📊 Level ⭐⭐ | 1.9KB | `entities/cmu-pace-proxy-agent-evaluation-cheap.md`

# CMU PACE — Proxy for Agentic Capability Evaluation

> 文章 "Agent评测太贵？CMU发布PACE：不到1%成本摸清模型的Agent能力" (2026-07-07) 的实体整理。

PACE 从 19 个便宜原子评测里自动挑出 100 道题，花不到完整 Agent 评测 **1% 的成本**，就能预测 GAIA、SWE-Bench 等四项基准的模型得分。

## 核心方法

从 19 个非 Agent 基准（覆盖 11 类能力）自动选出 100 道题，用其得分预测目标 Agent 基准表现：

- **Local 选题**：按每道题得分与 Agent 总分的 Spearman 相关排序
- **Global 选题**：在源题矩阵上做 SVD，用杠杆分数选全局高信息量题目
- **Bootstrap**：对目标实例重采样再拟合回归，MAE 降 0.77pp

## 结果

| 指标 | 值 |
|---|---|
| MAE | 3.80% |
| Spearman | 0.81 |
| 两两排序准确率 | 84.37% |
| 成本比 | ~1/100 of full agent eval |

## 各 Agent 基准的能力指纹

| 基准 | 核心能力需求 |
|---|---|
| GAIA | 指令遵循 + 验证测试 |
| SWE-Bench Verified | 规划 + 代码生成 + 验证 + 错误恢复 |
| SWE-Bench Multimodal | 长上下文聚合 |
| SWT-Bench | 验证测试 + 规划 |

## 限制

1. 标定模型需代表未来模型分布
2. 预测的是特定 harness 下的分数

## 参考

- 论文: arXiv:2607.02032
- GitHub: https://github.com/neulab/pace
- 数据集: https://huggingface.co/datasets/neulab/pace-bench

→ [raw/articles/cmu-pace-proxy-agent-evaluation-cheap|原文存档]

---

