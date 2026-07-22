---
title: "一句话生图要过时了？开源图像生成Agent进化出「工具编排」"
source_url: "https://mp.weixin.qq.com/s/qY75YeOY2Gnj-YfILEFuQg"
ingested: 2026-07-01
sha256: 5e8f14d4dd090f8097c748aeca69d00a485fe14edb8f7d5c78710e4d98cca7b7
---
---
source: wechat
source_url: https://mp.weixin.qq.com/s/qY75YeOY2Gnj-YfILEFuQg
ingested: 2026-07-01
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-07-01
---

# 一句话生图要过时了？开源图像生成Agent进化出「工具编排」

图像生成正在从「  一句话生成一张图」，走向更接近真实创作流程的开放任务。

在实际使用中，用户常常不只是给出一个 prompt：他可能要求画面对齐某个地标、人物、商品或事件，也可能要求参考图身份一致、材质特殊、或者要求模糊的描述也能表达清楚。面对这些需求，单靠生成模型一次前向推理很难稳定完成。

近期，来自香港科技大学（广州）、美团、香港科技大学、新加坡国立大学等机构的研究团队提出  GenEvolve  ，一个面向开放图像生成的自我进化智能体框架。它将一次生成建模为一「  工具编排轨迹」：智能体先理解请求，再调用搜索、图像检索和生成知识工具，最后把外部证据、视觉参考和硬约束整理成 prompt-reference program，交给不同底层生成器渲染。

* 论文标题：  GenEvolve: Self-Evolving Image Generation Agents via Tool-Orchestrated Visual Experience Distillation

* 论文链接：https://arxiv.org/abs/2605.21605

* 项目页面：https://ephemeral182.github.io/GenEvolve/

* 代码链接：https://github.com/MeiGen-AI/GenEvolve

* 模型权重：https://huggingface.co/MeiGen-AI/GenEvolve

* 数据与评测：https://huggingface.co/datasets/MeiGen-AI/GenEvolve-Data-Bench

GenEvolve 使用同一套智能体策略，分别搭配开源 Qwen-Image-Edit 与强生成器 Nano Banana Pro。

从 prompt 到工具轨迹

GenEvolve 关注两类开放生成需求。第一类是  Knowledge-Anchored  ：生成结果依赖外部世界知识，例如真实建筑、公众人物、商品结构或事件线索。第二类是  Quality-Anchored  ：结果依赖可校验的视觉质量约束，例如文字、计数、布局、属性绑定、解剖、材质和美学。

为此，GenEvolve 给智能体配置三类工具：文本搜索 search (q) 用于补充事实证据；图像搜索 image_search (q) 用于获取视觉参考；生成知识查询 query_knowledge (skill) 用于激活内部对于文字渲染、空间布局、材质一致性等复杂需求所需要的技能。

因此，一次生成不再只是「  写一个更长的 prompt」，而是多轮决策：搜什么、看哪张参考图、调用哪类生成知识、最终程序里必须写入哪些约束。

数据与评测

为了训练这样的智能体，研究团队构建了 GenEvolve-Data 和 GenEvolve-Bench。作者团队没有直接收集普通 prompt-image 对，而是从约 2 万条结构化 recipe 出发，覆盖实体、地标、产品、事件、文字、布局、计数、属性、解剖、材质、美学和创意转化等场景。

每个请求都会先交给 Teacher Agent 走一遍完整工具流程：查事实、找参考、调用生成知识、写出最终 prompt-reference program。之后，数据还要经过程序检查、VLM 审计、GT 图像渲染和视觉过滤，最后切分成 SFT 轨迹、自我进化样本和 对应的 benchmark。

GenEvolve-Data 数据闭环：从结构化 recipe 到工具轨迹、VLM 审计、GT 图像过滤，再切分为训练和评测视图。

自我进化：先筛出更好的轨迹

训练过程分为两步。

首先，GenEvolve 使用高质量 Teacher 轨迹对 Qwen3-VL-8B-Instruct 做 SFT 冷启动，让模型学会基本工具调用和程序写法。

随后进入自我进化的 Rollout 阶段：对同一请求采样多条 rollout，渲染成图像后由视觉判分器和文本判分器共同打分，并使用 GRPO 优化轨迹级奖励。

视觉经验自蒸馏：把「  好在哪里」教给模型

仅有轨迹级奖励仍然不够。它能告诉模型「  哪条轨迹更好」，却很难说明「  好在哪里」。  因此，  GenEvolve 引入视觉经验自蒸馏：系统比较同一请求下的最优与最差轨迹，把差异总结成结构化 Decision Guide，例如该搜索什么、该选择哪类参考、该避免哪些失败写法。

接下来，这些经验只提供给训练阶段的 privileged teacher。Student 在同一批样本上仍然只看到普通输入，不直接读取经验库；teacher 则在 Decision Guide 的帮助下给出更好的 token 分布。我们再通过 token 级反向 KL，把 teacher 在关键决策 token 上的偏好蒸馏给 student。这样，模型学到的不是一条离线记忆，而是「  看到类似请求时应该如何搜索、选参考、组织约束」的决策习惯。

这也是 GenEvolve 和只做 RL 打分优化的主要区别。GRPO 提供的是「  哪条轨迹更值得强化」的方向，视觉经验自蒸馏提供的则是更细的 credit assignment：好轨迹到底好在工具计划、参考选择，还是最终 prompt-reference program 的某个约束写法。部署时，student 不需要再查 Decision Guide 或经验 buffer，经验已经被压进模型参数里。

GenEvolve 方法总览：智能体采样多条工具轨迹，比较最优与最差结果，将视觉经验蒸馏回部署模型。

实验结果

在自建的 GenEvolve-Bench 上，研究团队比较了主流直接生成模型和 agentic 工作流。当底层生成器固定为开源 Qwen-Image-Edit-2511 时，GenEvolve 的整体 KScore 达到  0.3663  ，超过 Gen-Searcher 的  0.3493  ；在更依赖事实和视觉细节的 Knowledge-Anchored 任务上，提升尤其明显。

当搭配更强的 Nano Banana Pro 渲染器时，GenEvolve 的 KScore 进一步提升到  0.5739  ，高于 Nano Banana Pro 裸生成的  0.5298  。这说明 GenEvolve 学到的不是某个生成器上的 prompt trick，而是一套可以迁移到不同渲染器上的工具编排策略。

GenEvolve-Bench 主结果。GenEvolve 在开源生成器设置和强生成器设置下均取得稳定提升。

消融实验显示，未调优的 Qwen3-VL 工作流已经能利用工具入口，但结果不够稳定；SFT 提升工具调用和最终程序质量；GRPO 提供轨迹级优化信号；加入视觉经验自蒸馏后，模型在 Visual correctness、Knowledge-Anchored 和 Quality-Anchored 等关键维度上继续提升。

研究团队还在公开的 WISE 知识密集型图像生成基准上进行了外推评估。在不做 in-domain 微调的情况下，GenEvolve 使用 8B 开源策略与开源 Qwen-Image-Edit 渲染器，整体 WiScore 达到  0.82  ，超过 GPT-4o 的  0.80  。

WISE 结果。GenEvolve 在开源生成器设置和强生成器设置下超过了之前的开源和闭源模型。

定性对比：橙色示例更依赖外部知识，蓝色示例更依赖内部生成技能。

小结

GenEvolve 的意义在于，它把开放图像生成从单次 prompt 优化，推进到可学习的工具编排过程。对于需要外部知识、参考图一致性和多重硬约束的任务，智能体不只是「  调用工具」，而是在训练中学会如何把工具结果转化为有效的生成程序。

目前，GenEvolve 已开源模型、代码、数据与评测集。对于图像生成智能体、工具使用、视觉反馈强化学习和开放生成评测等方向，这套框架提供了一个可复现的起点。

作者与单位

论文作者包括 Sixiang Chen、Zhaohu Xing、Tian Ye、Xinyu Geng、Yunlong Lin、Jianyu Lai、Xuanhua He、Fuxiang Zhai、Jialin Gao、Lei Zhu，来自港科广、美团、港科大和新加坡国立大学。

© THE END

转载请联系本公众号获得授权

投稿或寻求报道：liyazhou@jiqizhixin.com

