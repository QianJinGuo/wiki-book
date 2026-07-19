# 登上Nature子刊！Meta脑机接口重大阶段性进展，超高实时解码准确率

## Ch01.564 登上Nature子刊！Meta脑机接口重大阶段性进展，超高实时解码准确率

> 📊 Level ⭐⭐ | 8.1KB | `entities/2026-06-30-登上Nature子刊-Meta脑机接口重大阶段性进展-超高实时解码准确率-机器之心.md`

# 登上Nature子刊！Meta脑机接口重大阶段性进展，超高实时解码准确率

---
title: 登上Nature子刊！Meta脑机接口重大阶段性进展，超高实时解码准确率
source: wechat
url: https://mp.weixin.qq.com/s/g7-FOyTr32DRTF1V4WsRxA
mp_name: 机器之心
publish_date: 2026-06-30
---

# 登上Nature子刊！Meta脑机接口重大阶段性进展，超高实时解码准确率

**来源**: 机器之心

**发布日期**: 2026-06-30

**原文链接**: https://mp.weixin.qq.com/s/g7-FOyTr32DRTF1V4WsRxA

---

编辑｜冷猫

脑机接口这个领域似乎已经沉寂许久了。

在脑机接口这块，最出名的应该就是马斯克搞的 Neralink 了。但我们都知道，脑机接口分为两类，侵入式的和非侵入式的。简单来说，侵入式是需要做手术的，而非侵入式不用。

侵入式路线以 Neuralink 为代表，通过将微电极阵列直接植入皮层，信号质量极高，已展示超过 90% 的解码准确率。2025 至 2026 年间已有多位瘫痪患者完

## 核心要点

> 本文为微信公众号文章，由 WeChat backfill 收录。

## 详细信息

---
title: 登上Nature子刊！Meta脑机接口重大阶段性进展，超高实时解码准确率
source: wechat
url: https://mp.weixin.qq.com/s/g7-FOyTr32DRTF1V4WsRxA
mp_name: 机器之心
publish_date: 2026-06-30
---

# 登上Nature子刊！Meta脑机接口重大阶段性进展，超高实时解码准确率

**来源**: 机器之心

**发布日期**: 2026-06-30

**原文链接**: https://mp.weixin.qq.com/s/g7-FOyTr32DRTF1V4WsRxA

---

编辑｜冷猫

脑机接口这个领域似乎已经沉寂许久了。

在脑机接口这块，最出名的应该就是马斯克搞的 Neralink 了。但我们都知道，脑机接口分为两类，侵入式的和非侵入式的。简单来说，侵入式是需要做手术的，而非侵入式不用。

侵入式路线以 Neuralink 为代表，通过将微电极阵列直接植入皮层，信号质量极高，已展示超过 90% 的解码准确率。2025 至 2026 年间已有多位瘫痪患者完成植入并用意念控制电脑。今年 3 月，中国也有侵入式脑机接口产品获批上市。但侵入式方案的代价是手术，也限制了适用人群。

非侵入式路线通过头皮外的传感器采集大脑活动，无需动刀。安全性高、理论上可大规模部署。然而信号穿过颅骨和脑脊液后严重衰减，空间分辨率远逊于皮层内电极。但正是由于外置采集，解码能力就非常弱，目前仍然处于基本不可用的状态。

而这一次，是 Meta 达到了非侵入式脑到文本解码器研究的下一个重大里程碑：Brain2Qwerty v2 。

同样地，Meta 去年发布的 Brain2Qwerty v1 版本， 登上了 Nature Neuroscience 。

- 论文链接：https://www.nature.com/articles/s41593-026-02303-2

Brain2Qwerty v2 是性能最高的端到端流程，能够从原始脑信号中 实时解码句子 。它 超越了字符级解码 ，能够解码单词和语义，从而提高整体沟通的准确性。

v1 在 2025 年公开，核心能力是从 MEG 脑磁信号中逐字符解码打字内容，最优表现是字符错误率（CER）约 32%。

v2 换了解码粒度。它不再逐字母拼凑，而是一步到位输出整句话。根据 Meta 公开的数据， 9 名被试的平均词准确率达到 61%，最优被试为 78% ，其中超过一半句子的解码偏差控制在一个单词以内。

- 论文链接：https://ai.meta.com/research/publications/accurate-decoding-of-natural-sentences-from-non-invasive-brain-recordings/

技术架构

Meta 研究团队发布 Brain2Qwerty v2。这是目前性能最高的端到端非侵入式脑信号解码系统，能够从连续的脑活动中实时解码完整句子，其准确率已经接近此前只有依赖开颅植入脑机接口才能达到的水平。

为了加速神经科学研究的发展，研究团队正式开源 Brain2Qwerty v1 和 v2 的全部训练代码。同时，合作伙伴 —— 西班牙巴斯克认知、大脑与语言中心（BCBL）—— 也同步开放了 Brain2Qwerty v1 的数据集。

- 开源链接： https://github.com/facebookresearch/brain2qwerty

- 数据集链接： https://huggingface.co/datasets/bcbl190626/SpanishBCBL

- 博客链接： https://ai.meta.com/blog/brain2qwerty-brain-ai-human-communication/

我们相信，这项研究有望真正改善数百万因脑损伤而失去交流能力患者的生活。此前，立体定向脑电图（Stereo-EEG，SEEG）和皮层脑电图（ECoG）等侵入式技术已经证明，通过神经假体采集脑信号并结合 AI 解码，可以恢复患者的语言交流能力。然而，这类方案需要脑部手术，难以大规模推广。相比之下，我们提出的非侵入式方案，有望填补这一空白。

在 Brain2Qwerty v2 的训练过程中，我们收集了 9 名志愿者约 22,000 句输入数据。每位参与者佩戴脑磁图（MEG）设备，在主动键盘输入过程中连续记录约 10 小时的脑活动。

与传统依赖人工设计神经事件检测流程的方法不同，Brain2Qwerty v2 采用端到端深度学习框架，直接从原始脑信号中学习并完成文本解码。

Brain2Qwerty

## 原文

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/2026-06-30-登上Nature子刊-Meta脑机接口重大阶段性进展-超高实时解码准确率-机器之心.md)

---

