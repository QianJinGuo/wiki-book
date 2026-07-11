# 蚂蚁灵波 LingBot-VLA 2.0：60,000 小时开源通用 VLA 模型

## Ch01.242 蚂蚁灵波 LingBot-VLA 2.0：60,000 小时开源通用 VLA 模型

> 📊 Level ⭐ | 2.3KB | `entities/lingbot-vla-2-60000h-open-source-vla.md`

# 蚂蚁灵波 LingBot-VLA 2.0

> 蚂蚁灵波发布的开源通用 VLA（视觉-语言-动作）模型，60,000 小时真实物理数据训练，覆盖 20 种机器人构型，在 GM-100 基准上超越 GR00T N1.7 和 π0.5。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/lingbot-vla-2-60000h-open-source-vla.md)

## 数据

- **总量**：60,000 小时（50K 小时机器人轨迹 + 10K 小时第一视角人类操作视频）
- **覆盖**：20 种机器人构型（Leju、Franka、AgileX、ARX Lift2、Galaxea R1Pro、Astribot S1、Unitree G1、Fourier GR-2、AgiBot A2 等）
- **V1.0→V2.0**：从 20,000 小时增长 3 倍，半年时间

## 技术升级

| 维度 | 升级内容 |
|------|---------|
| 动作空间 | 从双臂扩展到头部、腰部、移动底盘、灵巧手 |
| 空间理解 | 融合 LingBot-Depth 2.0 深度模型 |
| 未来预测 | 引入未来深度预测 + 语义特征预测，DINO-Video 蒸馏监督 |
| 推理性能 | RTX 4090 上 < 130ms 延迟 |

## GM-100 评测

在 GM-100 多任务 Generalist Benchmark 的关键结果：

| 平台/任务 | VLA 2.0 | π0.5 | GR00T N1.7 |
|-----------|---------|------|-----------|
| AgileX 双臂平均 | **66.2/34.4** | 59.1/32.2 | 36.3/17.8 |
| 冰箱收纳 (ID) | **77.1/60.0** | 65.3/46.7 | — |
| 冰箱收纳 (OOD) | **37.0/13.3** | 30.3/6.7 | — |
| 清理灶台 (ID) | **84.3/66.7** | 79.9/60.0 | — |

## 关联

- [算力风洞](../ch05/019-ai-native.html) — GPU 集群稳定性验证，与 VLA 的具身计算需求互补
- [GS-Playground 具身仿真](ch01/951-20.html) — 具身智能仿真平台

---

