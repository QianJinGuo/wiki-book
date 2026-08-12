---
source: newsletter
source_url: "https://research.nvidia.com/labs/sil/projects/WorldTrace/"
ingested: 2026-08-12
sha256: 20c0c43148f10d135c05a7e29d26fb4f58b4fe53ef9061f2d289c6c9a14bd41b
---

# WorldTrace: Addressable Memory for Video World Models

**来源**: NVIDIA Research / Spatial Intelligence Lab（SIL），ICML 2026 F2S Workshop Best Paper。

**作者**: Xindi Wu（NVIDIA + Princeton）、Sven Elflein（NVIDIA + Toronto）、James Lucas、Olga Russakovsky、Laura Leal-Taixé、Despoina Paschalidou、Jonathan Lorraine、Aljosa Osep。arXiv: 2608.07408。

## TL;DR

WorldTrace 用固定分布内 slot 位置保持压缩记忆可寻址，再用 canonical-key writers 实现两个目标：WorldTrace-Field（更平滑的长 rollout）与 WorldTrace-Landmark（回忆已访问场景），全部无需重训生成器。

## 摘要（论文 Abstract）

研究自回归视频世界模型中的视觉持久性（visual persistence）——KV cache 存储不断增长的视觉记忆，但超出训练时域后难以检索。根因是**训练时域外的分布外 temporal RoPE offsets**：过去的观察可能仍被缓存，但对 attention 已不可寻址。WorldTrace 是无训练框架，通过给每个 slot 分配相对于当前帧的固定分布内位置保持压缩记忆可寻址。基于此可寻址 cache，WorldTrace-Field 用旋转不变历史聚合改善连贯长 rollout，WorldTrace-Landmark 保存逐字场景轨迹用于长程回忆。

## Motivation

自回归视频世界模型承诺交互式世界，但生成超过训练时域后视觉持久性崩溃。核心问题：生成长度任意时，模型能否可靠记住自己去过哪里？

### 为什么记忆在训练时域外失效

两个耦合瓶颈：

1. **可寻址性（Addressability）**：temporal RoPE offsets 超过训练范围，即使记忆物理存在也读不出——past the trained window, attention queries see phases the model never learned to address。
2. **内容保真度（Content fidelity）**：naive key averaging 在 RoPE 旋转空间混合不相容相位，phase cancellation 破坏压缩摘要携带的信号。

## 方法：WorldTrace

双层 KV cache：逐字近期窗口 + $N_s$ 个 summary slots，位置只由 slot rank 分配（与 horizon 无关），任何生成长度下每个 summary 都保持 in-distribution。两个互补 writer 填充 slots：

**Slot-rank position assignment**：summary slot $s$ 的 virtual position $v_s = q - (L_train - 1 - s) \cdot F$，其中 $q$ 是当前 query position，$L_train$ 是训练上下文长度，$F$ 是每个自回归块的帧数。Slot 位置取决于 rank 而非 rollout 长度。

**Canonical WT-Field writer**：$K_{field}^{(k)}(t_v) = R(\theta_k t_v) \frac{1}{M}\sum_{m=1}^{M} R(-\theta_k t_m) K_{t_m}^{(k)}$——keys 先对齐到共享 canonical phase，平均，再旋转回 summary slot 位置。避免 phase cancellation 并保留平均 attention logits。WT-Field 目标是压缩下的时间连贯性，不是回忆机制。

**Frozen WT-Landmark writer**：$K_{land}^{(k)}(t_v) = R(\theta_k t_v) R(-\theta_k t_{\ell^*}) K_{t_{\ell^*}}^{(k)}$——从 canonical-key signal 检测场景入口帧，逐字存入 summary slots，插入后冻结以避免 bfloat16 drift。WT-Landmark 保持 slot-rank 位置不变，目标长 rollout 的 episodic recall。

## 结果

### WorldTrace-Landmark：episodic recall

LoopMem benchmark 测试"回到之前访问过的场景"能力，用 Position-Aligned CLIP (PAC) 评分。WT-Landmark 在 topology、path length、camera orientation、multi-revisit 全部设置下优于 sliding-window recall：

- 长 ABA path：0.825 vs 0.627 PAC
- 标准 ABA：0.864 vs 0.723
- ABABA：0.941 vs 0.892
- 最难 360° pan：0.577 vs 0.559（最小的增益，把局限暴露在明处而非藏进聚合数）

### WorldTrace-Field：coherence rollouts

固定 content operator（canonical averaging）、只变 position assignment，slot-rank positions 在 8× horizon 时领先 Block-Rel +5.9% TempSSIM、16× 时 +2.8%；24×（N=48）时 WT-Field 比 sliding-window 提高 +15.5% TempSSIM 且降低 Local Scene Drift——每个 N-dependent position 公式都非单调退化。

## Takeaways

- **诊断**：长 horizon 失败是 position 问题，不是 content 问题。RoPE 旋转空间的 naive averaging 造成 phase cancellation。纯压缩摘要一旦 slot 落到训练范围外就塌缩成 sliding window。
- **方法**：slot-rank virtual positions 让每个 summary 在任何 horizon 都保持 in-distribution；WT-Field 做 canonical-key averaging 保连贯性；WT-Landmark 用冻结逐字轨迹做回忆。
- **影响**：24× 训练 horizon 下 +15.5% TempSSIM（WT-Field）；LoopMem 全场景更高 PAC（WT-Landmark）；无训练、$O(1)$ summary cache，可即插即用于 AR 视频世界模型。

## Citation

@inproceedings{wu2026worldtrace, title={Addressable Memory for Video World Models}, author={Xindi Wu and Sven Elflein and James Lucas and Olga Russakovsky and Laura Leal-Taixé and Despoina Paschalidou and Jonathan Lorraine and Aljosa Osep}, booktitle={ICML 2026 Workshop: From Frames to Stories (F2S)}, note={Oral presentation}, year={2026}, eprint={2608.07408}, archivePrefix={arXiv}, primaryClass={cs.CV}}
