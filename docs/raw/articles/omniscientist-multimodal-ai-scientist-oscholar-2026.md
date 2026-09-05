---
source_url: https://www.xiaohongshu.com/explore/6a8d117c0000000017003033?xsec_source=app_share&xsec_token=CBkaJz2djldgBScQYz-X-MIO2HHKRjfRdxP9rl-RDktoc=
source: xiaohongshu
title: "全模态AI Scientist来了！从原始数据做科研！"
ingested: 2026-08-25
type: raw-article
tags: [ai-scientist, omniscientist, multimodal, ai-for-science, scientific-discovery, research-agent, raw-data, evidence, nus, oxford]
sha256: 12e6b1b7a7d5ba6d2548afdf9776b112f00110f3edc3ccec21b146e706689853
---

# 全模态AI Scientist来了！从原始数据做科研！

> 作者：Oscholar（小红书研究组解读号）
> 解读新加坡国立大学（NUS）与牛津团队提出的全模态、全流程 AI Scientist——OmniScientist：AI Scientist 已能跑完整科研流程，但若它只看到人类预处理后的文本、标签和特征而非原始科学证据，它到底是在做研究，还是在执行研究流程？

## 核心：全模态感知贯穿完整科研生命周期

OmniScientist 不是单纯给科研 Agent 加一个视觉模型，而是让感知贯穿完整科研生命周期。系统直接读取图像、信号、音频、视频、3D 结构、轨迹、表格、公式和图等原始证据，再由 **Ideation、Experiment、Writeup** 三个 Agent 完成"观察 → 提出可证伪假设 → 执行实验 → 生成论文"。同一套系统可以处理地震波、病理图像、CAD 点云甚至知识图谱等不同科研数据。

## 防编故事：代码强制执行的 Checks

为避免 AI "看到结果再编故事"，团队加入代码强制执行的 **Idea、Rigour 和 Claim Checks**，检查创新性、数据泄漏、有效样本量、多重比较和执行记录，并要求论文中的数字与结论都能追溯到真实证据。

## 实测结果

- 在 **5 大学科、36 个真实数据案例**上测试，OmniScientist 全部完成从原始数据到完整论文的端到端流程
- 在 0～10 分评审体系下平均论文评分达 **6.3**
- 相比只能读取预计算标量特征的"盲眼版"，直接感知原始证据的版本在**全部 7 项指标上均有提升**，并赢得 **85% 的两两比较**

## 关键发现：看见原始数据改变 AI 做什么研究

更值得关注的是，"看见"原始数据直接改变了 AI 做什么研究：
- 系统从 750 条被标记为噪声的地震数据中发现，**21.7% 实际存在真实瞬态信号**
- 另一案例中发现常规随机划分会掩盖泛化问题，**跨家族测试误差高出 3.1～7 倍**
- 论文的机制分析发现，直接感知会影响问题选择、实验设计乃至最终研究路径，而不只是让论文写得更好

当科研流程逐渐能够被自动化，下一步更关键的问题可能是：AI 能否真正从未经人类预先解释的科学证据中发现问题，并让证据决定研究什么、如何验证以及最终得出什么结论。
