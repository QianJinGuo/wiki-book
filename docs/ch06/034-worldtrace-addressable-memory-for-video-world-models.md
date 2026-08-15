# WorldTrace：视频世界模型的可寻址记忆（Addressable Memory for Video World Models）

## Ch06.034 WorldTrace：视频世界模型的可寻址记忆（Addressable Memory for Video World Models）

> 📊 Level ⭐⭐ | 4.8KB | `entities/worldtrace-addressable-memory-video-world-models.md`

# WorldTrace：视频世界模型的可寻址记忆

> **来源**: NVIDIA Spatial Intelligence Lab（SIL）+ Princeton + Toronto + Vector Institute，ICML 2026 F2S Workshop Best Paper（oral）。arXiv: 2608.07408。

## 核心主张

自回归视频世界模型的长程视觉持久性崩溃，根因是 **position 问题而非 content 问题**：temporal RoPE offsets 一旦超过训练时域，缓存的记忆物理上仍在、但对 attention 已不可寻址。WorldTrace 用 slot-rank 虚拟位置让每个压缩记忆槽在任何生成长度下都保持 in-distribution，无需重训生成器。

## 问题诊断：记忆为何在训练时域外失效

- **可寻址性失效**：KV cache 中存储的视觉记忆超过训练窗口后，attention queries 看到的 phase 是模型从未学会寻址的——记忆"存在但读不出"。
- **内容保真度失效**：naive key averaging 在 RoPE 旋转空间混合不相容相位，phase cancellation 摧毁压缩摘要携带的信号。

## 方法：双层 cache + 两种 writer

WorldTrace 构建两层 KV cache：逐字近期窗口 + $N_s$ 个 summary slots。核心创新是 **slot-rank position assignment**——虚拟位置 $v_s = q - (L_{train} - 1 - s)\cdot F$ 只由 slot 的 rank 决定，与 rollout 长度无关，因此任何 horizon 下 summary 都保持在训练分布内。

两个互补 writer 填充 slots：

| Writer | 机制 | 目标 |
|--------|------|------|
| **WT-Field** | canonical-key averaging：keys 先对齐到共享相位、平均、再旋转回 slot 位置，避免 phase cancellation | 压缩下的时间连贯性（smooth long rollouts），非回忆机制 |
| **WT-Landmark** | 从 canonical-key signal 检测场景入口帧，逐字存储进 summary slots 并冻结（防 bfloat16 drift） | 长 rollout 的 episodic recall（回忆已访问场景） |

## 关键结果

**WT-Landmark（episodic recall，LoopMem benchmark，PAC 指标）**：

- 长 ABA path：0.825 vs 0.627（sliding-window baseline）
- 标准 ABA：0.864 vs 0.723
- ABABA：0.941 vs 0.892
- 360° pan（最难）：0.577 vs 0.559——增益最小，把局限暴露在明处而非藏进聚合数

**WT-Field（coherence rollouts，TempSSIM）**：

- 8× horizon：+5.9% vs Block-Rel；16×：+2.8%
- 24× horizon（N=48）：+15.5% vs sliding-window，且降低 Local Scene Drift
- 所有 N-dependent 位置公式均非单调退化，唯 slot-rank 单调有效

## 工程意义

- **训练无关、$O(1)$ summary cache**：即插即用型 drop-in 方案，不需要重训生成器，适配现有 AR 视频世界模型。
- **"记忆失效是位置问题"的普适诊断**：对 KV cache 压缩、长上下文技术有迁移价值——压缩后记忆的可寻址性（而非容量）是长程任务的真正瓶颈。
- **phase cancellation 的显式处理**：RoPE 空间中的 key averaging 需要先对齐相位再平均，这一原则适用于任何基于 RoPE 的缓存压缩方案。

## 相关实体

- [李飞飞掩码视觉动作世界模型](../ch01/1129-20.html) — 同为世界模型方向，WorldTrace 聚焦记忆寻址而非动作预测
- [BAAI Orca 世界模型](../ch05/108-ai.html) — 下一状态预测范式对照
- [A2RD 长视频自回归扩散](../ch04/740-agentic.html) — 长视频生成的自回归一致性
- [The great memory panic of 2026](../ch01/1156-the-great-memory-panic-of-2026.html) — 记忆/上下文基础设施的行业视角
- [高德 Abot Earth 3D 原生世界模型](../ch01/1296-3d.html)

## 相关概念

- [视频生成模型](https://github.com/QianJinGuo/wiki/blob/main/concepts/video-generation-models.md)
- [Agent 记忆架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-architecture.md)
- [长上下文技术](https://github.com/QianJinGuo/wiki/blob/main/concepts/long-context-techniques.md)
- [上下文窗口经济学](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-window-economics.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/worldtrace-addressable-memory-video-world-models.md)

---

