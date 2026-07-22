---
title: "时间序列预测增强方法总结：频域、分解、patch"
source_url: "https://mp.weixin.qq.com/s/Iu_5--O_MjSSux0Hs_nOzA"
ingested: 2026-04-30
type: raw
tags: [time-series, data-augmentation, forecasting, frequency-domain, wavelet, patch-based, deephub]
review_value: 7
review_confidence: 7
review_recommendation: worth-reading
review_stars: 3
sha256: "{pending}"
created: 2026-05-10
updated: 2026-05-10
---
# 原文存档：时间序列预测增强方法总结
## 文章信息
- **来源**：DeepHub IMBA
- **主题**：时间序列预测数据增强方法系统梳理
## 核心洞察
**Input-Target 一致性原则**：增强前先拼接 look-back 窗口（x）与预测 horizon（y），增强后再拆分——`s = x ∥ y, s̃ = 𝒜(s), (x̃, ỹ) = Split(s̃)`。只动 x 不动 y 会切断时间连续性，是大部分分类增强在预测任务失败的根本原因。
## 五条技术路线
### 1. 频域方法
| 方法 | 核心思路 | 局限 |
|------|---------|------|
| FreqMask | FFT 后用二值 mask 置零选定频率分量，迫使模型对缺失分量保持鲁棒 | 只知"哪些频率存在"，无法定位时间 |
| FreqMix | 混合两个序列的频谱，让一个序列继承另一个的结构特征 | 同上 |
| WaveMask/WaveMix | 离散小波变换（DWT）多分辨率分解，在每层系数上 mask/mix；高频事件高时间分辨率，低频趋势高频率分辨率 | — |
| Dominant Shuffle | 挑出 top-k 主导频率做 shuffle，不动其余频谱，规避分布外风险 | 整体非最强 |
**关键区别**：Fourier 只能回答"哪些频率存在"；Wavelet 额外回答"大概出现在哪里"——对含局部事件的时间序列尤为重要。
### 2. 分解方法
- **STAug**：对两序列做经验模态分解（EMD）得到 IMFs，用 mixup 式插值权重重新组合。内存开销大，大数据集上 GPU 不够用。
### 3. 其他方法
| 方法 | 思路 |
|------|------|
| wDBA | DTW 对齐下取平均构造新样本，计算开销大 |
| MBB | STL 拆分趋势/季节性/残差，从残差 bootstrap 块生成 |
| Upsample | 线性插值拉伸局部片段，相当于局部结构放大镜，稳居较强非频域基线 |
### 4. Patch-based 方法
**Temporal Patch Shuffle (TPS)**：核心流程——
1. 拼接 look-back 窗口与预测 horizon（保持一致性）
2. 用重叠 patch 提取序列（patch 长度 p、stride s；重叠让相邻 patch 共享时间步，重建过渡平滑）
3. 按 variance 评分选择 shuffle 子集（低 variance 优先——意味着变化少，shuffle 后仍合理）
4. 在重叠区域取平均重建
## 关键结论
- 预测增强比分类增强难：必须在引入多样性和保持时间一致性之间同时做好
- WaveMask/WaveMix 在 16 种 horizon 设置中 12 种第一、4 种第二
- TPS 整体最强，Upsample 是不可忽视的简单强基线
- STAug 工程代价高（EMD 内存），大数据集不友好