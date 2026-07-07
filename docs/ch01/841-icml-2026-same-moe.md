# ICML 2026 | 南大SAME稳住MoE，缓解多模态持续微调双重遗忘

## Ch01.841 ICML 2026 | 南大SAME稳住MoE，缓解多模态持续微调双重遗忘

> 📊 Level ⭐⭐ | 4.5KB | `entities/icml-2026-南大same稳住moe缓解多模态持续微调双重遗忘.md`

# ICML 2026 | 南大SAME稳住MoE，缓解多模态持续微调双重遗忘

# ICML 2026 | 南大SAME稳住MoE，缓解多模态持续微调双重遗忘

---
source: wechat
source_url: https://mp.weixin.qq.com/s/uJqE_5Acw9war3laNVFGcw
ingested: 2026-07-05
source_published: 2026年7月1日 14:21
---

# ICML 2026 | 南大SAME稳住MoE，缓解多模态持续微调双重遗忘

多模态大语言模型（MLLM）通过指令微调获得了强大的视觉-语言理解能力，但真实部署场景中，模型往往需要持续学习新的任务、领域和回答格式，这使多模态持续指令微调（Multimodal Continual Instruction Tuning，MCIT）成为重要问题。

  

近年来，MoE 与 LoRA 结合的稀疏专家结构被用于 MCIT，希望通过专家路由实现任务专门化。

  

然而，本文发现 MoE-based MCIT 中存在两个核心漂移问题：

  

第一是路由漂移，即旧任务样本在后续训练后会被路由到不同专家；

  

第二是专家漂移，即即使路由恢复，专家本身的功能也可能被新任务覆盖。

  

为此，本文提出 SAME，即 Stabilized Mixture-of-Experts。SAME 从三个方面稳定 MoE 持续学习过程：

  * 使用谱感知路由（Spectral-aware Routing）约束路由器更新，减少旧样本被重新分配到错误专家；

  * 使用曲率感知缩放（Curvature-aware Scaling）基于历史输入协方差调节专家更新，降低专家功能被覆盖的风险；

  * 使用自适应专家激活（Adaptive Expert Activation）在当前任务训练时冻结部分“当前任务不常用但历史重要”的专家，减少冗余计算和跨任务干扰。

  

实验表明，SAME 在 TriGap、CoIN 和 UCIT 三个 MCIT 基准上均取得领先性能，同时提升训练效率。

  

  

  

  

论文标题：

SAME: Stabilized Mixture-of-Experts for Multimodal Continual Instruction Tuning

论文作者：

Zhen-Hao Xie, Jun-Tao Tang, Yu-Cheng Shi, Han-Jia Ye, De-Chuan Zhan, Da-Wei Zhou

收录会议：

ICML 2026

论文地址：

https://arxiv.org/abs/2602.01990

代码链接：

https://github.com/LAMDA-CL/Prism

  

  

引言

MLLM 通常由视觉编码器、多模态投影器和大语言模型组成，并通过多模态指令数据训练，使模型能够处理视觉问答、OCR、定位、图像描述、科学推理等多种任务。

  

传统训练通常假设所有任务数据一次性可得，但真实应用更接近一个持续过程：新任务、新领域、新指令格式不断到来，模型需要在学习新能力的同时保留旧能力。

  

在 MCIT 中，参数高效微调是常见选择。LoRA 只更新少量低秩参数，MoE 则通过多个专家和路由器实现条件计算。

  

看起来，MoE 很适合持续学习：不同任务可以激活不同专家，从而降低冲突。但本文通过诊断实验发现，MoE 并不能天然避免遗忘。

  

首先是路由漂移。以 Task 1 测试样本为例，模型在学习后续任务后，路由器对同一批旧样本的专家激活分布会逐渐改变。也就是说，旧任务样本原本依赖的专家组合不再稳定。

  

〓 图一：随着训练推进，Task 1 样本的专家激活分布逐渐偏离原始状态，体现路由漂移。

  

  

其次是专家漂移。论文进一步固定后续阶段的专家，只在 Task 1 数据上重新训练路由器。即便在这种有利设置下，Task 1 准确率也无法恢复到最初水平，说明遗忘并不只是“路由错了”，而是专家功能本身已经被新任务更新破坏。

〓 图二：重新训练路由器后，旧任务准确率仍随任务推进下降，说明专家本身发生功能漂移。

  

基于上述观察，本文提出 SAME。其核心思想是：既要稳定输入到专家的路由路径，也要限制专家在历史重要方向上的破坏性更新，还要避免当前任务无关专家被无意义扰动。

  

本文贡献可以总结如下：

  

  * 系统识别 MoE-based MCIT 中的路由漂移与专家漂移问题。

  * 提出谱感知路由，在历史输入协方差诱导的子空间中约束路由器更新。

  * 提出曲率感知专家缩放，用

-> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/icml-2026-南大same稳住moe缓解多模态持续微调双重遗忘.md)

---

