# Red Queen Gödel Machine (RQGM)：共进化 Agent 与评估器的递归自改进框架

## Ch01.1084 Red Queen Gödel Machine (RQGM)：共进化 Agent 与评估器的递归自改进框架

> 📊 Level ⭐⭐ | 3.5KB | `entities/rqgm-red-queen-godel-machine-cambridge-nvidia-2026.md`

# Red Queen Gödel Machine (RQGM)：共进化 Agent 与评估器的递归自改进框架

Cambridge + NVIDIA (2026-06-24) 提出的进化框架，解决自改进 Agent 的根本性局限：评估标准假设是固定的，但进化要求评估器也一起进化。

## 核心问题

现有自改进 Agent 假设评估标准是平稳的（stationary）：固定的 verifier、benchmark、标注数据集。但这违背了进化的核心规律：物种不是在静止环境中优化自己，而是和不断变化的环境一起改变。

## 历史脉络

| 阶段 | 方案 | 局限 |
|------|------|------|
| Gödel Machine (2003, Schmidhuber) | 数学证明自修改有益 | 计算成本不可行 |
| Darwin/Huxley Gödel Machine | 进化替代证明（突变→测试→生存） | 评估器静态不变 |
| **RQGM (2026)** | 评估器和 Agent 共进化 | 本文贡献 |

## 核心机制：受控效用进化 (Controlled Utility Evolution)

RQGM 将搜索组织为 epoch：
1. **epoch 内**：评估器冻结 → 信号稳定
2. **epoch 边界**：效用可以更新
3. **新评估器**必须在留出的锚点数据上统计意义上打败老评估器
4. **选择性擦除**：只丢掉被替换评估器打过的分，保留其他证据

这确保了自改进保证在每个 epoch 内成立，同时目标跨 epoch 演化。

## 实验结果

**代码编写 (Polyglot)**：
- 通过率：69.9% → 71.7%（+1.8% over SOTA）
- Token 效率：省 1.35-1.72x
- 机制：agent-as-judge 代码审查信号（比多轮测试便宜）

**科学论文写作**：
- 接收率：21.8% → 40.5%（1.78-1.86x 提升）
- 共进化写手 + 多样化 agent-as-judge 评审团

**奥赛级数学证明**：
- 评分器准确率：比静态基线高 9%
- 搜索成本：降低 3x

**论文评审（偏见修正）**：
- 问题：最强基线审稿人过度接受 AI 论文（1.91x 人类接受率）
- 解法：对抗性目标发现对 AI 和人类同样严格的审稿人
- 结果：平等对待，同时保持 80% 真值准确率

## 关键意义

1. **Novel 框架**：首次将评估纳入递归自改进循环
2. **实用结果**：代码、论文、数学多领域强改进
3. **偏见修正**：修复 LLM 过度接受 AI 生成内容的倾向
4. **效率提升**：通过更智能的评估显著节省 token
5. **理论基础**：用进化原则扩展 Gödel Machine 概念

## 相关实体

- [AI 递归自改进](../ch05/082-ai.html) — 自改进的更广泛背景
- [Agent 自改进六机制](../ch03/045-agent.html) — 自改进机制分类
- [验证器驱动开发](https://github.com/QianJinGuo/wiki/blob/main/concepts/verifier-driven-development.md) — 验证器在 Agent 系统中的角色

---

