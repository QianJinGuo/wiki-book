---
sha256: 8ff9445448b6fc00be41bac6195ecef04ad79beb31bd4aa9eeaec8fa8c935b94
title: "DeepSeek Thinking with Visual Primitives 深度解读"
source_url: "https://mp.weixin.qq.com/s/tz7Zdbv8KhHtG8fCGqQ5LQ"
author: "产品野心家"
publisher: "微信公众号 - 产品野心家"
published_date: "2026-04-30"
ingested: "2026-04-30"
review_value: 9
review_confidence: 8
review_recommendation: "strong"
review_stars: 5
type: raw
tags:
  - "deepseek"
  - "multimodal"
  - "visual-primitives"
  - "reference-gap"
  - "topological-reasoning"
  - "compression"
  - "kv-cache"
  - "grpo"
sources: []
created: 2026-05-10
updated: 2026-05-10
---
# DeepSeek Thinking with Visual Primitives 深度解读
> Source: https://mp.weixin.qq.com/s/tz7Zdbv8KhHtG8fCGqQ5LQ
> 官方论文：DeepSeek, "Thinking with Visual Primitives", 2026-04-30
## 发布背景
- 2026-04-24：DeepSeek V4 论文发布（58页），提到多模态是 V5 方向
- 2026-04-29：DeepSeek App 开始灰度内测识图模式
- 2026-04-30：论文 Thinking with Visual Primitives 公开（距 V4 论文仅 6 天）
- DeepSeek 是七大主流 coding agent（OpenAI/Anthropic/Google/Qwen/Kimi/GLM/DeepSeek）中最后一个把视觉接入主力产品的旗舰
## 核心创新：视觉原语
### 解决的问题：Reference Gap（指代鸿沟）
主流路径在解决 **Perception Gap（感知鸿沟）**：让模型"看得更清楚"，通过高分辨率切割把图切成更多 patch。代价是图像 token 暴涨，KV cache 跟着暴涨。
DeepSeek 的论点是：**感知再强，指代不准也白搭**。
### 三件不同的事
1. 看见（perceive）
2. 看清楚（see clearly）
3. 说清楚指哪个（precisely reference）
主流路径只解决了前两件。
### 视觉原语的具体形式
模型在生成思考过程时，不只输出文字，还会输出坐标：
**bounding box（边界框）**：
```
<|ref|>狗<|/ref|><|box|>[[120,340,580,890]]<|/box|>
```
意思是"这只狗在图上左上角到右下角这个矩形区域里"。坐标归一化到 0-999。
**point（点）**：
```
<|point|>[[357,369],[260,372]]<|/point|>
```
意思是"这个点和那个点"。适合抽象指代：轨迹、路径、交叉口方向。
### 范式转移
- 之前的工作（Visual CoT、CogCom、GRIT 等）：grounding 是 **post-hoc verification**（事后验证）——模型先想完，再用框来确认
- DeepSeek：grounding 是 **intrinsic medium of thought**（思考的内在媒介）——模型边想边指着图
> "思考的媒介" vs "验证的证据"，这是两码事。
## 效率对比
| 模型 | KV cache 条目（800×800图） | 7 benchmark 平均分 |
|------|--------------------------|------------------|
| Gemini-3-Flash | ~1100 | 76.5% |
| Claude-Sonnet-4.6 | ~870 | 65.3% |
| GPT-5.4 | ~740 | 71.1% |
| Qwen3-VL-235B-A22B | ~660 | 68.1% |
| Gemma-4-31B | ~289 | 69.7% |
| **DeepSeek（本文）** | **~90** | **77.2%** |
DeepSeek 用比 Claude 少 9 倍、比 Gemini 少 12 倍的 token，做出了小幅领先的平均分。
## 压缩链路
三步压缩（从 756×756 输入到 81 个 KV 条目）：
1. **ViT 切块**：DeepSeek-ViT 14×14 像素一个 patch → 2916 个 patch token
2. **3×3 空间压缩**：在 ViT 出口处，每 9 个相邻 patch token 沿通道维度压缩成 1 个 → 324 个
3. **Compressed Sparse Attention**：V4-Flash 自带机制，每 4 个再压成 1 个 → 81 个
**总压缩比：7056 倍**
## Benchmark 详细结果
### 计数任务：和 Gemini-3-Flash 互有胜负，整体打平
### 空间推理 + 通用 VQA：DeepSeek 在 4/6 上排第一，基本打平
### 拓扑推理（真正的差距所在）
| 任务 | DeepSeek | 第二名 | 领先幅度 |
|------|---------|-------|---------|
| DS_Maze_Navigation（迷宫导航） | **66.9%** | Gemini 49.4% | **+16.3pp** |
| DS_Path_Tracing（路径追踪） | **56.7%** | GPT-5.4 46.5% | **+10.2pp** |
### 为什么 frontier 模型集体在拓扑推理上翻车
迷宫/路径追踪要求模型长时间维持空间状态。纯文本 CoT 描述"现在我在左下角"，下一步又说"现在我在中间偏左"——"中间偏左"相对什么？说不清楚。多走几步就乱了。
DeepSeek 用坐标（x, y）解决：每一步都是精确数值，没有歧义。论文里有一个走 18 步迷宫的例子，每一步都是清清楚楚的坐标。
### 论文原文
> "Notably, all frontier models exhibit suboptimal performance on topological reasoning tasks, suggesting that substantial room for improvement remains in the reasoning capabilities of multimodal large language models."
礼貌地踩了所有人。
## 5阶段训练管线
### Stage 1: Pretraining（预训练）
数据：97984 个标注了 object detection 或 grounding 的数据集
两步过滤：
1. 语义审核：剔除乱码标签、私人实体、模糊缩写 → 43141 个数据集
2. 几何质量审核：剔除漏标>50%的、严重截断的、超大框的 → 31701 个数据集
结果：约 4000 万高质量训练样本，消耗"数万亿 multimodal tokens"
### Stage 2: Specialized SFT（专家化监督微调）
不是训一个模型，而是两个：
- F_TwG：专门训 thinking with grounding（用框思考）
- F_TwP：专门训 thinking with pointing（用点思考）
分开训的原因：避免模式冲突（用框和用点的思维方式有差异，混在一起训会互相干扰）
### Stage 3: Specialized RL（专家化强化学习）
算法：GRPO（V4 论文同款）
**三层奖励设计**：
1. **Format RM**：检查输出格式对不对、有没有重复输出同一个框
2. **Quality RM**：LLM 评委从5个维度打分（思考过程冗余度/与答案一致性/自相矛盾/引用有效性/reward hacking）
3. **Accuracy RM**：任务特定精度奖励
**计数任务的奖励函数**：
```
R(ŷ, y) = α · exp(−β · |ŷ−y| / (|y|+1))
α=0.7, β=3
```
预测值偏离真值越远，奖励指数衰减。不是 0/1 二值奖励，而是密集信号。
**迷宫任务 5 项加权奖励**：因果探索进度 + 探索完整性 + 穿墙惩罚 + 路径有效性 + 答案正确性
**RL 数据筛选**：
- Easy（N次都对）→ 不用学
- Normal（部分对部分错）→ 训练
- Hard（N次都错）→ 学不会，跳过
只保留 Normal-Level 数据训练。
### Stage 4: Unified RFT（统一强化微调）
把两个专家合体成一个统一模型 F。用两个专家模型生成 rollout，然后做 SFT。
### Stage 5: On-Policy Distillation（OPD，同策略蒸馏）
合体后的模型 F 在每个专项上不如各自的专家模型（"a noticeable performance gap remains"）。
所以最后做蒸馏：让统一模型 F 同时学习两个专家的输出分布，损失函数是 KL 散度的加权和。
**工程闭环**：先专家化 → 再合体 → 合体差了再用蒸馏闭合差距。每一步都不偷懒。
## 数据体量
| 任务 | 冷启动数据量 |
|------|-----------|
| 计数 | ~10000 样本 |
| 空间推理 + 通用 VQA | ~9000 样本 |
| 迷宫导航 | **460000 样本** |
| 路径追踪 | **125000 样本** |
### Anti-cheat 数据设计
**迷宫**：
- 用 DFS、Prim、Kruskal 三种算法生成可解迷宫（三种拓扑：矩形/同心圆/六边形蜂窝）
- 专门做了一批"貌似可解但实际不可解"的对抗迷宫：生成可解迷宫后在中间堵厚墙，让它看起来能走但实际走不通
- 教模型"不要光看就敢答，要真探索过"
**路径追踪**：
- 交错贝塞尔曲线，每条曲线连一个起点图标到一个终点图标
- 专门做了一批"全部曲线同色"的版本
- 如果模型靠颜色作弊（顺着颜色找），同色版会让它失败
- 强迫模型靠曲率连续性判断，每个交点必须做"这条线弯到左边还是右边"的几何判断
## 隐藏彩蛋：多语言能力
> "Although our post-training data about visual primitives does not include any Chinese corpus, the model is capable of thinking and responding in Chinese, benefiting from the multilingual capabilities inherited from the base model."
没有中文训练数据，但能中文推理。说明：视觉原语能力和语言能力是解耦的——坐标（x, y）在任何语言里都是同一个像素位置。
## 三条局限
1. **需要触发词**：模型不能自主判断"这道题需不需要用手指"。必须告诉它启用，它才会启用。目前做不到复杂数数/空间推理/走迷宫任务自动启用视觉原语。
2. **极细粒度精度不够**：坐标是 0-999 整数，800×800 图上每个单位=0.8像素。pixel-level 精确定位不够。未来可能需要把视觉原语和高分辨率感知方案结合。
3. **拓扑推理跨场景泛化**：在论文设计的迷宫和路径追踪上很猛，换一个全新的拓扑场景能不能泛化，论文自己也没把握。
## 四个关键判断（作者观点）
1. **这次发的是论文+灰度，不是模型权重**。GitHub 上没有 model file，这套能力会随下一代基座模型一起发布，不单独开源权重。和 mHC、Engram、OCR 2 一样的节奏。
2. **下一代 DeepSeek 大概率原生多模态**。V4 预测"OCR 2 这一脉的延伸"在延伸，但方向是"视觉原语作为思考媒介"而非"视觉因果流"——后者是工程优化，前者是范式转移。
3. **coding agent 视觉的标准被重定义**：之前比的是"能看 4K 图/token 多便宜"，这次换成"能不能在思考时用手指着图说话"。新维度站得住，因为 coding agent 真正卡住人的不是看不清细节，是描述不清楚"这个按钮的下面那个组件"。
4. **DeepSeek 以最贵的方式补课**：不是"做了一个差不多的视觉模型"，而是"做了一个全新范式的视觉模型，顺便把基础能力一起补上了"。