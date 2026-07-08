# DeepSeek做大→Mega MoE，Tri Dao团队加快→SonicMoE

## Ch01.236 DeepSeek做大→Mega MoE，Tri Dao团队加快→SonicMoE

> 📊 Level ⭐ | 2.3KB | `entities/deepseek做大mega-moetri-dao团队加快sonicmoe.md`

# DeepSeek做大→Mega MoE，Tri Dao团队加快→SonicMoE

**来源**: 机器之心

**发布日期**: 2026-05-04

**原文链接**: https://mp.weixin.qq.com/s/aZWTQxXqrfzc5rboCof4DA

---

编辑｜Panda

「快！」

说到索尼克，不管是刺猬索尼克还是音速索尼克，大家的第一印象多半就是「快」，而「快」也是现在许多 AI 模型和应用优化的一大核心目标。

近日，由普林斯顿大学 Tri Dao（FlashAttention 的一作）和加州大学伯克利分校 Ion Stoica 领导的一个联合研究团队也做出了一个超快的索尼克： S onic MoE 。

一作 Wentao Guo 的推文，他目前正在普林斯顿大学就读计算机科学博士

据介绍，SonicMoE 能在英伟达 Blackwell GPU 上以峰值吞吐量运行！并且运算性能超过了 DeepSeek 之前开源并引发巨大轰动的 DeepGEMM。

有趣的是，DeepSeek 前些天还在 DeepGEMM 库中开源了新的技术  Mega MoE  ，即巨型 MoE—— 从名字也能看出来，这与 SonicMoE（音速 MoE）显然是两个不同的方向，我们也期待能看到「 大 」与「 快 」这两个方向的更直接的对比。

下面我们就基于官方技术博客，简单了解下 SonicMoE。

- 博客地址：https://tridao.me/blog/2026/sonicmoe-blackwell/

- 代码库：https://github.com/Dao-AILab/sonic-moe

- 论文地址：https://arxiv.org/abs/2512.14080

MoE 与它的隐患

要理解 SonicMoE 解决的是什么问题，先得认识一种正在主导前沿 AI 的架构设计 —— 混合专家模型（Mixture of Experts，MoE）。

细粒度 MoE 架构

想象一家医院。面对每一位患者，医院不会让所有科室同时出动，而是先由全科医生判断，再分诊给最合适的专科。MoE 架构的逻辑与此相似：模型内部有大量「专家」子网络，每一个输入的信息片段（即 token，可以理解为文字或词语）只会被路由到其中一小部分专家处理，而不是流经所有

---

