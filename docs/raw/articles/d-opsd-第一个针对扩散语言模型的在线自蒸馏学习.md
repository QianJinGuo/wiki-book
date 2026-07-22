---
type: source
source_url: https://mp.weixin.qq.com/s/0RDsRfkaclvB1Jb5saoiiQ
sha256: df21dc3fdc63beeccdf7d84c95ea3b14b4a91a9f00d5e04dea96cd6ed0446016
ingested: 2026-07-09
source: 机器之心（微信公众号）
source_title: d-OPSD：第一个针对扩散语言模型的在线自蒸馏学习
source_published: 2026-07-09 13:40
review_value: 8
review_confidence: 8
review_stars: 4
---

# d-OPSD：第一个针对扩散语言模型的在线自蒸馏学习

马普所联合清华大学推出 d-OPSD，第一个针对扩散语言模型（dLLMs）的在线自蒸馏（On-policy Self-distillation）学习范式。

论文：Learning from the Self-future: On-policy Self-distillation for dLLMs.
<https://arxiv.org/abs/2606.18195>
代码：<https://github.com/xingzhejun/d-OPSD>

**背景**：在线自蒸馏（OPSD）作为新兴后训练手段，凭借密集监督信号的优势，展现超越RL的后训练效果和远超RL的训练效率。但对于扩散大语言模型（dLLMs），OPSD仍是空白。

现有自回归LLM的OPSD问题：采用将参考解作为特权信息加入教师模型prompt的范式。近期工作表明，这会产生"参考解幻觉"——学生模型在蒸馏学习中默认"参考解"存在，无法给出正确答案。

**d-OPSD的创新点**：

1. **彻底重构教师模型构建方法**：针对dLLMs任意顺序生成的特性，让学生模型先在线采样，将这些学生的自我"未来"（self-future）随机保留，反馈给教师模型作为特权信息。彻底摆脱参考解注入的范式。

2. **On-policy贯彻到底**：之前的OPSD仅仅是轨迹生成上由学生驱动，特权信息注入仍是Off-policy的静态参考解。d-OPSD让特权信息也完全由学生模型生成。

3. **监督层级从token升至step**：针对dLLMs迭代解码特性，提供更精准的密集监督信号。

4. **合适的"教师-学生"差异**：教师恰好拥有学生不会的新知识，又能和学生拥有相当的共同语言。传统参考解注入范式会导致教师与学生之间overlap过大，限制了蒸馏学习上限。

**实验结果**：
- 在四个数学推理benchmark上，d-OPSD在大部分任务上展现更好的推理表现
- 训练效率远超RL：RL需上千步收敛，d-OPSD仅需数百步（约1/10）
- 全面优于传统"参考解注入"OPSD范式
