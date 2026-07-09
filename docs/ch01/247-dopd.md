# 蒸馏效果起飞！DOPD破解「特权幻觉」，让在线策略蒸馏更有效

## Ch01.247 蒸馏效果起飞！DOPD破解「特权幻觉」，让在线策略蒸馏更有效

> 📊 Level ⭐ | 2.0KB | `entities/蒸馏效果起飞-dopd破解-特权幻觉-让在线策略蒸馏更有效.md`

# 蒸馏效果起飞！DOPD破解「特权幻觉」，让在线策略蒸馏更有效

> **核心价值**：v×c=64，stars=4，来自 机器之心

---
source: wechat
source_url: https://mp.weixin.qq.com/s/xlcvfTUivsWGdl9CRgmIGA
ingested: 2026-07-09
source_published: 2026年7月8日 20:30
---

# 蒸馏效果起飞！DOPD破解「特权幻觉」，让在线策略蒸馏更有效

得益于令人印象深刻的效果，「在线策略蒸馏」 (On-policy Distillation) 一直是近期的热门话题。这种方式通过使用密集的教师 Token 级信号监督学生采样轨迹，提供卓越的能力转移。为了提供高质量的监督源，从而提升蒸馏的性能，一个直观的方向是将「特权信息」 (Privileged Information) 注入教师或学生自身。然而，这种 "开外挂" 的方式，不一定能让学生学得更好，反而可能陷入「特权幻觉」(Privilege Illustion) 的陷阱。

  

  

  * 论文标题: DOPD: Dual On-policy Distillation

  * 论文链接: https://arxiv.org/abs/2606.30626

  

最近，来自新加坡国立大学、香港中文大学 MMLab、北京大学和京东探索研究院的研究团队提出了一种全新的在线策略蒸馏方法: DOPD (Dual On-policy Distillation) ，通过优势感知的双重蒸馏范式，成功破解了这一难题。

  

实验结果令人惊艳：在 LLM 设置下，DOPD 让学生模型平均提升 7.5 分，闭合了 89.8% 的初始师生差距；在 VLM 设置下也提升了 6.0 分。在师生模型尺寸差距最大的情况下 (8B→0.6B) ，DOPD 的提升幅度是 Vanilla OPD 的 4 倍！

  

图一: DOPD 在基于 LL

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/蒸馏效果起飞-dopd破解-特权幻觉-让在线策略蒸馏更有效.md)

---

