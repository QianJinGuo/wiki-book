# 一句话生图要过时了？开源图像生成Agent进化出「工具编排」

## Ch04.449 一句话生图要过时了？开源图像生成Agent进化出「工具编排」

> 📊 Level ⭐⭐ | 6.4KB | `entities/一句话生图要过时了开源图像生成agent进化出工具编排.md`

# 一句话生图要过时了？开源图像生成Agent进化出「工具编排」

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

近期，来自香港科技大学（广州）、美团、香港科技大学、新加坡国立大学等机构的研究团队提出  GenEvolve  ，一个面向开放图像生成的自我进化智能体框架。它将一次生成建模为一「  工具编排轨迹」：智能体先理解请求，再调用搜索、图像检索和生成知识工具，最后

## 核心要点

> 本文为微信公众号文章，由 WeChat backfill 收录。

## 详细信息

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

仅有轨迹级奖励仍然不够。它能告诉模型「  哪条轨迹更好」，却很难说

## 原文

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/一句话生图要过时了开源图像生成agent进化出工具编排.md)

---

