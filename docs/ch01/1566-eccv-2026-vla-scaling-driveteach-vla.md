# ECCV 2026｜自驾VLA Scaling有戏了，北航清华DriveTeach-VLA：用图像轨迹打通驾驶场景与基模预训练

## Ch01.1566 ECCV 2026｜自驾VLA Scaling有戏了，北航清华DriveTeach-VLA：用图像轨迹打通驾驶场景与基模预训练

> 📊 Level ⭐⭐⭐ | 2.9KB | `entities/eccv-2026自驾vla-scaling有戏了北航清华driveteach-vla用图像轨迹打通驾驶场景与基模预训练.md`

# ECCV 2026｜自驾VLA Scaling有戏了，北航清华DriveTeach-VLA：用图像轨迹打通驾驶场景与基模预训练

> WeChat-机器之心 | 发布于 2026-08-10 | 评分入库 v×c≥49

## 核心内容

机器之心 2026-08-10 17:30 北京 该论文已经被 ECCV 2026 正式接收，相关代码和模型已全部开源。 论文的团队来自于清华大学产业研究院（AIR），滴滴，北京航空航天大学。团队近年在自动驾驶与具身智能领域发表论文数十篇，并和国内外知名高校、科研机构广泛开展合作。 该论文的第一作者为杨予光，北京航空航天大学博士研究生，研究方向为自动驾驶与具身智能，提出首个 MLLM 原生自动驾驶模型 CuriousVLA，也是当前自动驾驶领先模型 CLOVER 的重要贡献者。迄今已在 ICLR、NeurIPS、CVPR、ICCV、ECCV 等顶级会议发表论文 7 篇，长期担任相关顶会审稿人，并获 CCF 中国计算机学会年度应用奖励。 本文主要介绍来自该团队的最新论文 Teaching Vision-Language-Action Models What to See and Where to Look，目前该论文已经被 ECCV 2026 正式接收，相关代码和模型已全部开源。 该工作聚焦于自动驾驶场景中的自回归型 VLA 模型的训练，主要的观点是现有 VLA 的交通相关数据在很大程度上依赖以文本为中心的视觉问答和思维链推理数据，这类数据更强调语言推理，而非基于动作的规划。为解决这一问题，该工作提出利用交通要素蒸馏的方式纠正 VLA 模型的关注要素，使其更加关注视觉要素；同时，该工作还提出了一种将 BEV 轨迹映射到图像像素空间进行学习的技术，这能够充分利用基模已有的视觉能力，使轨迹内在的空间含义对模型更加可理解。DriveTeach-VLA 在 NAVSIM 上进行了评测，达。

## 关键要点

- 原文完整记录：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/eccv-2026自驾vla-scaling有戏了北航清华driveteach-vla用图像轨迹打通驾驶场景与基模预训练.md)
- 关联主题：[Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)、[Evaluation Harness Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md)、[Embodied Intelligence Frontier](https://github.com/QianJinGuo/wiki/blob/main/concepts/embodied-intelligence-frontier.md)

## 相关实体

[Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md) [Evaluation Harness Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md) [Embodied Intelligence Frontier](https://github.com/QianJinGuo/wiki/blob/main/concepts/embodied-intelligence-frontier.md)

---

