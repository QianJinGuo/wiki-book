# 打通感知-理解-交互链路，全栈视频理解大模型VideoChat3开源了

## Ch01.1282 打通感知-理解-交互链路，全栈视频理解大模型VideoChat3开源了

> 📊 Level ⭐⭐⭐ | 3.9KB | `entities/打通感知-理解-交互链路全栈视频理解大模型videochat3开源了.md`

# 打通感知-理解-交互链路，全栈视频理解大模型VideoChat3开源了

## 摘要

VideoChat3 是由南京大学、上海人工智能实验室、南洋理工大学和北京大学研究团队联合发布的面向通用视频理解的 4B 参数多模态大模型。该模型围绕 "全面、高效、开源" 三个目标，从视觉编码器架构（Inflated 3D Vision Transformer, I3D-ViT）、流式感知机制（自适应帧分辨率与三状态主动响应）和训练数据体系（三套全新高质量开源数据集）三个层面进行了系统设计。VideoChat3 在时序感知、长视频理解、视频推理、时序定位和在线流式理解等多类任务上取得了具有竞争力的结果，并在长视频推理中显著降低了视觉 token 数量与计算成本。研究团队进行了全栈开源，开放了模型权重、代码和数据。

## 核心要点

- **架构创新 - I3D-ViT**：提出 Inflated 3D Vision Transformer，将时序建模前移到视觉编码阶段，使视觉编码器具有原生时空建模能力。通过连续帧划分为短时片段、联合时空注意力建模和时间维池化，实现约 16 倍时空压缩，显著减少送入语言模型的视觉 token 数量。
- **流式感知机制**：设计自适应帧分辨率机制，通过三个状态（Silence/静默、Standby/待命、Response/响应）构成模型状态驱动的闭环。常规片段用低分辨率编码，检测到线索后提升至高分辨率，可在合适时刻提高感知精度而非始终维持高分辨率，视觉预算约为始终高分辨率方案的 30.2%。
- **三套开源数据集**：构建了 VideoChat3-Academic2M（227 万条学术数据改写，将稀疏答案转为含证据的自然语言回答）、VideoChat3-LV116K（11.62 万条长视频数据，建立可核验的 "事件账本"）、VideoChat3-OL617K（61.72 万条在线流式样本，将 "看完再答" 转化为 "持续观察、积累证据、适时回答"）。
- **四阶段渐进训练**：包括视频视觉编码器预训练、视频-语言对齐、视频指令微调、长视频与流式指令微调。累计仅使用 25M 条训练样本，体现高效数据利用效率。
- **评测表现**：在 Video-MME 基准上取得 70.1 分；与 Qwen3-VL-4B 相比，在 19 个可比较指标中有 18 个提升；在 TimeLens 上全面领先同规模开源模型并超过 GPT-5 等闭源模型；ODVBench 得分 72.3，StreamingBench 指标 83.0；在 OVO-Timing 上平均 F1 达 35.5，高于专用模型 Em-Garde。
- **效率优势**：输入 2048 帧时，总延迟从 Qwen3-VL 的 44.449 秒降至 20.412 秒，FLOPs 从 15.150×10¹⁵ 降至 5.738×10¹⁵，显存占用从 106.913 GB 降至 80.775 GB。视频越长，I3D-ViT 前置压缩的价值越明显。
- **全栈开源**：开放模型权重、训练代码、全部三套数据集及评测代码，旨在促进视频理解大模型开源生态建设。

## 相关实体链接

- [Self Harness Shanghai Ai Lab Agent Improves Harness](../ch05/018-harness.html) — 上海人工智能实验室（合作方之一）相关工作
- [Shotstream Streaming Multi Shot Video Cuhk Kling Eccv2026](ch01/888-20.html) — 流式视频生成（与 VideoChat3 的流式视频理解互补）
- [Joyai Vl Interaction Jd Open Source Real Time Video 2026](ch01/1291-joyai-vl-interaction.html) — 京东 JoyAI-VL 实时视频交互开源模型
- [Crayotter Traceable Multi Agent Long Form Video Editing Ustc 2026](../ch03/046-agent.html) — 长视频编辑多智能体框架
- [Liteframeefficientvisionencodersunlockframescalinginvideollms](ch01/546-scaling.html) — 高效视觉编码器与视频 LLM 帧缩放

---

