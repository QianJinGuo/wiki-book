---
title: "不要把老师的答案整包学走：VAD 用反事实视觉证据重构多模态蒸馏目标"
source_url: "https://mp.weixin.qq.com/s/zW290BgBmfmFGpCxuiMR-A"
source_name: "爱折腾研究组"
author: "爱折腾的小七"
ingested: 2026-08-22
sha256: dea0d2a8303c76669be8a4e6b005e723b016fc7e0bdf764c7cfe18061dcd3380
---

# VAD：Attributing Visual Evidence for Target Reconstruction in Multimodal On-Policy Distillation

> 来源：爱折腾研究组（2026-08-22），"On Policy Distillation 论文合集"系列。论文：arXiv:2607.28590，作者单位含上海交大/小红书/港中文/浙大/东南；代码 DeepExperience/VAD_Multimodal_OPD，模型 Qwen3.5-4B/9B。

## 一句话概述

多模态 On-Policy Distillation（OPD）的关键问题不只是"哪些 token 应该多学一点"，而是"老师提出的哪些修改确实由视觉证据支持"。VAD 用同一个冻结教师分别查看"证据存在"与"证据被移除"的图像，以二者分布差作为视觉证据方向，再从完整教师修正中提取与之对齐的部分，重构一个以学生当前分布为锚点的新 target。VAD 不再照单全收 privileged teacher 的整份答案，只把能被受控视觉干预解释的修正写进主要监督信号。在六个细粒度视觉评测上，VAD 的 4B/9B 平均准确率 78.32%/79.93%，比同规模最佳后训练基线高 2.40/2.80 个百分点。

## 研究背景与动机

- 多模态模型的错误常从很小的视觉误判开始（漏看词/混淆颜色纹理/读反空间关系），后续生成仍流畅但建立在错误视觉前提上。
- On-policy distillation：先让学生生成自己的轨迹，教师再在学生真实到达的 prefix 上提供 next-token 监督，教师看到学生部署时真正可能犯错的位置。
- **source-mixed teacher correction**：Vision-OPD 让教师看高质量 crop 再把完整 next-token distribution 蒸馏给学生，但教师与学生分布差不全是视觉，还混有语言偏好/格式/停止时机/教师不确定性。作者在冻结 Qwen3.5 Base 上分析 512 样本（4B 64,340 个生成位置 / 9B 47,161 个），最强四分之一教师修正中仅 23.2%（4B）/22.8%（9B）同时属于视觉对齐度最高四分之一。
- VA-OPD/V-Zero 用 visual advantage 判断哪些 token/轨迹更依赖视觉再调整 loss 权重，但每个位置匹配的 target 仍是完整 evidence-present 分布；且正值 advantage 不直接表达"证据应压低学生已选错的 token"（如 checkered→striped）。

## 核心方法

1. **构造三种分布**（固定学生 prefix）：pS0（学生看全图）、pT+（冻结教师看 evidence-present 2× crop）、pT-（同一教师看 evidence-degraded crop，0.1× 双线性下采样再最近邻上采样）。教师是初始学生模型的冻结副本。三分布映射到学生 top-100 token + tail bucket 共享坐标空间，log-probability 中心化消除全 token 相同的 logit 偏移。
2. **归因视觉方向**：r = φ(pT+)-φ(pS0)（完整教师修正）；u = φ(pT+)-φ(pT-)（视觉干预代理方向）。u(i)>0 表示证据推高该 token，<0 表示反驳。对 r、u 做带稳定项单边投影：内积为正才保留 r 在 u 上的分量 rvis，不一致则投影系数置零；残差 rres = r - rvis 谨慎称为 proxy-unexplained residual。
3. **支持/反驳分开分配预算**：把 u 拆成 u+ 与 u-，按 agreement score 分配视觉修正预算 B=||rvis||₂。只对正分支设上限 τ+（防止不可靠支持证据占过多预算），负分支保留反证能力。
4. **围绕学生分布重构 target**：rVAD 加到学生当前中心化 logits 上再 softmax 得 qT,VAD。新 target 以学生已学能力为出发点，只有被视觉干预支持的 candidate-level odds 被改写。本质区别：重构监督目标 vs 复制完整教师目标；也不同于 VA-OPD 的 loss reweighting（直接改变该位置应匹配的概率分布）。
5. **弱正则守语言行为**：主目标用 token-level JSD 匹配重构目标；另加较弱 privileged-teacher regularizer（未视觉归因比例越高其 token 权重越大），轻度锚定语义/格式/长度/停止行为，是稳定器、不入 VAD 重构 target。推理阶段仍为普通全图学生模型，零额外开销。

## 数据集与设置

Qwen3.5-4B/9B，Vision-OPD 公开 6,241 条合成视觉问答样本（与六主评测不重叠）。batch 96、每 prompt 8 rollout、lr 2×10⁻⁶、投影稳定项 ζ=10⁻³、坐标裁剪 c=20、弱正则 λ=0.1、正分支上限 τ+ 4B=0.8/9B=0.7。六评测：VStar/ZoomBench/HRBench-4K/HRBench-8K/MME-RealWorld 英中。对照：GRPO、Vision-OPD、VA-OPD、V-Zero、Decomposed OPD，共享同规模初始化/数据/预算。

## 实验与评估

- **主结果**：4B Avg₆ 78.32%（vs Base 70.85 +7.47、vs Vision-OPD 75.92 +2.40、vs Decomposed OPD +2.95）；9B 79.93%（vs Base 73.86 +6.07、vs V-Zero +2.80、vs Decomposed OPD +2.88）。4B 六项全部第一；9B 五项第一（ZoomBench VA-OPD 62.84 vs 62.49）。跨模型超 Gemini 3 Flash/3.1 Pro/Qwen3.5-397B（仅参数效率展示，非严格因果对照）。
- **语义分离**：视觉属性/对象内容/A-D 决策 token 在 rvis 占 42.0%，高于完整 r 的 26.7% 与残差 rres 的 17.7%；语言/格式与 artifact/meta 分别 58.0%/73.3%/82.3%。vertical/metal/A-D 选项进 rvis，to/inside 等脚手架进 rres。作者不包装成可识别纯视觉分解。
- **消融**：直接匹配 pT+ 75.92；只缩范数保方向 76.19（+0.27，说明"少学一点"≠"换正确方向"）；one-sided→VAD target 77.06→78.06（+1.00）；加弱正则后 one-sided/VAD 77.52/78.32。主要收益来自 branch-aware target reconstruction。
- **token 级影响**：完整教师修正对正确 token +7.52 支持、错误 token 6.29 压制；scalar 7.64/6.37、one-sided 7.76/6.47、VAD 7.89/6.61。置信区间重叠，结论是"方向一致"非逐行显著。
- **超参敏感性**：最佳 (λ,τ+)=(0.10,0.80) 78.32，邻近组合 0.20 分内；边界 (0.00,0.50) 降至 76.81。
- **Held-out**：MMVP/CV-Bench/MMStar/POPE，4B 79.14(+0.24)/9B 82.62(+0.23)，唯一两尺度正增量方法；部分基线 9B 退化 1-3 分（specialization drift 风险）。
- **Divergence**：JSD 78.32/79.93 最均衡，Forward KL 77.62/79.21，Reverse KL 77.85/79.56。
- **训练成本**：H800/8 GPU/batch 96，4B 每 step 7.84min（8.49h/67.9 GPUh，step time 较 Vision-OPD/VA-OPD 高 3.8%/3.1%）；9B 11.11min（12.03h/96.3 GPUh，高 11.1%/3.9%）。推理成本不变。

## 案例与可解释性

纹理例子：学生选错 D.checkered、正确答案 B.striped。完整 crop teacher 改变大量 token 概率；VAD 观察同一教师从 degraded 切清晰后哪些候选 odds 升/降，若 striped 被支持而 checkered 被压低，u 同时带正负坐标，投影只保留与之一致的部分。正值 advantage 的局限：被采样错误 token 在清晰图下概率下降时其正值 advantage 被截零，无法区分"被证据反驳"与"一般低 advantage"。可解释性三层相互印证：受控视图差定义方向 → 投影给分量 → 语义统计检查分量内容。

## 总结与不足

总结：重新定义问题（判断教师修正哪部分可由视觉证据解释）；反事实视觉归因；重构而非照抄；显式处理反证；弱正则稳定语言行为；4B/9B 78.32/79.93；推理部署友好。

不足：单一视图对限制归因丰富度；rvis 仍可能残留非视觉教师效应、rres 不能视为纯语言噪声；训练依赖已标注关键区域；验证范围有限（Qwen3.5 4B/9B 细粒度 VQA）；训练成本非零增加（9B step time +11.1%）。未来：多视图证据基、更强 grounding constraint、自动化 view construction、扩展到视频/多图/文档理解/agentic visual reasoning、优化训练效率（缓存教师分布/稀疏候选/自适应反事实查询）。
