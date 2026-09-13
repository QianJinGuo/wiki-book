# TimeLens2: Generalist Video Temporal Grounding with Multimodal LLMs

> 📊 Level ⭐ | 4.4KB

## TimeLens2: Generalist Video Temporal Grounding

TimeLens2 是南京大学与上海 AI 实验室提出的视频时序定位（Video Temporal Grounding）通用模型，基于 Qwen3-VL 底座，通过一套统一的「时间段集合」标注与训练框架，让同一个模型在长短视频、单段或多段证据、陈述句或问句、第三人称或第一人称视角里直接输出一组起止时间段。

## 动机

多模态大模型能描述视频内容，却通常给不出可点开的时间出处。现有做法有三层不足：

- **标注层：** 答案本该是「可能有多段」的时间段集合，长视频却常被整段只判一次，容易漏掉重复证据或起止偏粗。
- **训练层：** 常规微调先学会「把时间写成规定格式」。用 tIoU 做强化学习时，预测和答案完全错开时分数一律是 0——偏了两秒和偏了两分钟训练信号无差别。
- **多段对齐：** 强制「预测每一段对上答案每一段」时，一旦拆开、合并或段数不等，分数也会乱。

## 方法

### 数据标注（TimeLens2-93K）

来自按时长分层、领域多样的 YouTube 视频，最终保留 23,793 条视频、93,232 条定位样本（其中 12,091 条带多段证据），视频平均时长约 10.2 分钟。采用六步流水线：先按内容切 20–60 秒小段并生成字幕，据此写陈述式查询和粗略候选；再由两个定位模型（Qwen3-VL-30B-A3B 与 TimeLens-8B）各自独立预测，两次结果需满足时间段交并比 > 0.9 且语义嵌入相似度 ≥ 0.5 才通过；最后在边界附近 ±3 秒做局部精修，合并间隔 ≤ 1 秒的相邻段。

### 两阶段训练

基于 Qwen3-VL 的 2B / 4B / 8B 指令版模型：

1. **长上下文监督微调（SFT）：** 使用 TimeLens2-93K + TimeLens-100K + Ego4D-NLQ，4B/8B 打包到 100K token。同一条时间段用多种提问措辞和时间写法渲染，防止格式过拟合。
2. **GRPO 强化学习校准：** 奖励由三项组成——重叠比例奖励(tIoU)、解析失败惩罚、以及关键的时间 **Wasserstein 奖励**。后者将预测段和答案段映射为时间轴上的分布，测量两者间的传输距离，解决了零分坑（完全错开时区分「差两秒」与「差两分钟」）。

诊断结果：在 4,332 个「重叠为零」的有效预测中，加入 Wasserstein 奖励后，近处漏检的 21.9% 恢复出正重叠，远处仅 5.7%；原来整组 0 分的样本中 75.8% 重新排出远近。

## 关键结果

| 指标 | TimeLens2-2B | TimeLens2-4B | TimeLens2-8B |
|------|-------------|-------------|-------------|
| 平均 mIoU | 44.5 | 47.7 | 48.0 |
| 相对 Qwen3-VL 底座提升 | +14.2 | +13.0 | +18.1 |

TimeLens2-4B 平均超过 Qwen3.5-397B-A17B 约 7.5 个 mIoU 点，在全部七项基准上更高。最难场景的增益最大：VUE-TR +19.6、VUE-TR-V2 +27.8、MomentSeeker +12.6、Ego4D-NLQ +7.2。

> [!note] 「超过 397B」只成立在这七项时序定位基准上，不代表通用视频理解能力。

## 消融关键发现

- TimeLens2-93K 前 5% 数据将平均 mIoU 从 34.7 拉到 42.8；全量到 45.8
- 标签精炼各阶段（原始→对齐→语义校验→边界精修）：42.0 → 43.4 → 44.1 → 45.8

## 相关实体

- [LLaVA-OneVision-2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llava-onevision-2-full-frame-rate-vlm.md)（同类全帧率视频语言模型）
- [Video RAG 分块策略](https://github.com/QianJinGuo/wiki-public/blob/main/entities/video-rag-chunking-strategy.md)（视频检索的互补方向）

→ [原文存档](https://mp.weixin.qq.com/s/Dl39LOdIS0l_OInxTjoUrw)

---

