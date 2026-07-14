# Tsinghua AIR AIM：AI 数学家从解题到参与前沿研究的协同工作流

## Ch04.583 Tsinghua AIR AIM：AI 数学家从解题到参与前沿研究的协同工作流

> 📊 Level ⭐⭐ | 3.8KB | `entities/tsinghua-air-aim-ai-mathematician.md`

# Tsinghua AIR AIM：AI 数学家从解题到参与前沿研究的协同工作流

清华大学智能产业研究院（AIR）刘洋教授团队开发的 **AIM（AI Mathematician）** 系统，是面向数学研究的智能体系统。与专注于解题的 AI 不同，AIM 尝试参与更早一步的科研工作：帮助研究者发散思路、组织定理、生成证明草稿。

## 核心案例：84页量子算法论文

AIM 深度参与了一项量子算法研究（Sign Embedding Quantum Algorithms for Matrix Equations and Matrix Functions），最终形成 84 页论文。研究从人类研究者提出的宏观直觉出发——"有理逼近能否成为量子算法设计原则"——AIM 协助完成了从思路发散到定理组织的全流程。

## 五阶段人机协同工作流

| 阶段 | 内容 | 人类角色 | AI/AIM 角色 |
|------|------|---------|------------|
| ① 发散性路线扩展 | 元想法 → 候选问题/路线 | 提供核心直觉 | 扩展为多个方向、跨领域连接 |
| ② 人类价值把关 | 筛选聚焦方向 | 依据品味+可行性判断筛选 | 提供候选方案 |
| ③ 定理形成与推导 | 思路 → 定理/引理/证明草稿 | 确认方向 | 组织材料、生成证明 |
| ④ 复杂度审计与修复 | 假设、复杂度检查 | 关键判断 | 推导、对照、重写 |
| ⑤ 验证与整合 | 最终核查、编辑 | 全面核查、整合成文 | 提供已审计的材料 |

核心模式：**"高通量候选生成 + 人类价值门控 + AI辅助审计修复 + 人类最终整合"**

## 关键洞察

### AI 数学能力从"解题"走向"研究"

此前 AI 数学主要面向明确任务（给定命题证明/优化目标/可评分搜索空间），而真实前沿研究的进展常发生在定理正式出现之前。AIM 开始参与**问题形成**阶段——这是与以往 AI 数学系统的本质区别。

### AI Scientist 的工作流启示

对于 AI4Math 和 AI Scientist 研究：
- 理论研究的反馈信号不是实验分数，而是**数学判断**
- 系统需要支持：长程记忆、路线管理、假设记录、复杂度审计、反驳性检查
- 人类研究者的核心能力将转向：判断"什么问题真正值得研究"、识别表面合理但有隐藏条件的路线

### 与 AI Scientist 其他方案的对比

- → [AutoResearch：AI 科学发现 L0-L4](../ch05/085-ai.html) — 定义了 AI Scientist 的自主性层级
- → [Harness Engineering Self-Improvement Survey](../ch05/069-harness-engineering.html) — Lilian Weng 的自我改进综述，覆盖 AI Scientist 领域
- AIM 的不同：强调 **human-in-the-loop 的协同工作流**，而非全自动发现；专注于 **数学理论（而非实验科学）**；用清晰的五阶段流程定义人机分工

## 参考文献

- AIM 应用报告: https://arxiv.org/abs/2606.24899
- 量子算法论文: http://arxiv.org/abs/2604.25333
- AIM 开源仓库: https://github.com/TheoryFoundry/AIMv2
- AIM 博客: https://ai-mathematician.net

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/tsinghua-air-aim-ai-mathematician-84-page-quantum-paper.md)

---

