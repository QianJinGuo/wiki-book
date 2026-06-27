# VMAF v1: Netflix 视频质量度量的全面升级

## Ch11.005 VMAF v1: Netflix 视频质量度量的全面升级

> 📊 Level ⭐ | 2.3KB | `entities/netflix-vmaf-v1-video-quality-metric-upgrade.md`

# VMAF v1: Netflix 视频质量度量的全面升级

Netflix 开源 VMAF v1——视频质量度量的行业标准全面升级。核心改进：CSF 调制统一多设备模型、CAMBI 带状伪影检测、chroma 特征、NEG 默认启用、运动特征修正。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/vmaf-v1-good-is-not-good-enough.md)

## VMAF v0 → v1 关键改进

| 改进项 | v0 问题 | v1 方案 |
|--------|---------|---------|
| 压缩伪影敏感度 | DLM 对 blockiness 不够敏感 | 加入 AIM（additive impairments）组件 |
| 多设备模型 | 手机模型用多项式映射，泛化差 | CSF 调制：基于归一化观看距离调整特征值 |
| 带状伪影 | 未检测 | 集成 CAMBI（Contrast Aware Multiscale Banding Index） |
| Chroma 伪影 | 仅提取 luma 特征 | SpEED-QA 应用于 chroma 通道 |
| NEG 模式 | 需要单独模型 | 默认启用，无需单独模型 |
| 运动特征 | 无上界 + 高帧率低估 | 硬阈值 + 更大时间窗口 |

## CSF 调制：统一多设备模型

- v0：手机模型 = 多项式映射（难以泛化）
- v1：基于 Barten CSF 模型，根据归一化观看距离调整空间对比敏感度函数
- 同一模型可应用于：手机（4-5H）、4K@3H、4K@1.5H
- 原理：观看距离增加 → 更多像素落入单位视角 → 伪影可见性降低

## CAMBI 带状伪影检测

- 带状伪影（banding）：本应平滑的区域出现阶梯状边缘
- CAMBI：Contrast Aware Multiscale Banding Index
- 已在之前的技术博客中详细介绍，v1 正式集成为核心特征

## 运动特征修正

- v0 问题 1：运动特征无上界 → 高运动场景质量高估
- v0 问题 2：仅连续帧差分 → 高帧率（60fps）质量低估
- v1 方案：硬阈值 + 更大时间窗口选项

## 技术栈

- SVR（Support Vector Regressor）融合基础特征
- 训练数据：主观质量评分数据集
- 开源：[Netflix/vmaf](https://github.com/Netflix/vmaf)
- 用途：编码评估、codec 开发（AV2）、码率优化

---

