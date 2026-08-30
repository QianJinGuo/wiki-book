# DeepSeek视觉原语论文：当所有人在堆图像分辨率时，它在堆「指代精度」！

## Ch01.417 DeepSeek视觉原语论文：当所有人在堆图像分辨率时，它在堆「指代精度」！

> 📊 Level ⭐⭐ | 7.9KB | `entities/deepseek视觉原语论文当所有人在堆图像分辨率时它在堆指代精度-v2.md`

# DeepSeek视觉原语论文：当所有人在堆图像分辨率时，它在堆「指代精度」！

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/deepseek视觉原语论文当所有人在堆图像分辨率时它在堆指代精度-v2.md)

## 摘要

2026 年 4 月 30 日，距 V4 论文仅 6 天，DeepSeek 发布多模态论文 Thinking with Visual Primitives，提出「视觉原语」范式：让模型在思考过程中直接输出坐标（点与边界框），把定位从「事后验证」变成「思考的内在媒介」，让 AI 一边想一边用手指着图说话。与主流「堆图像分辨率」相反，DeepSeek 在「堆指代精度」：一张 800×800 图仅约 90 个 KV cache 条目（约为对手 1/9 到 1/12），平均分反小幅领先，拓扑推理领先 10 到 26 个百分点。

## 核心要点

- 视觉原语即「思考时输出坐标」：边界框（box）定位具体物体，点（point）表达轨迹等抽象指代，坐标归一化 0-999，嵌在思考链中而非答案里。
- 范式转移：Visual CoT、GRIT 等把 grounding 当 post-hoc verification（事后验证），DeepSeek 让它成为 intrinsic medium of thought——「指」就是「想」。
- 反共识：主流用高分辨率切割解决 Perception Gap，DeepSeek 认为瓶颈是 Reference Gap（指代鸿沟）——自然语言的模糊指代让多步空间推理逻辑坍塌。
- 效率：800×800 图仅约 90 个 KV 条目（Claude ~870、Gemini ~1100），平均分 77.2% 领先，像素到 KV 条目压缩比 7056 倍。
- 拓扑推理断层领先：迷宫导航 66.9%（领先 16.3 分）、路径追踪 56.7%（领先 10.2 分），论文直言「所有 frontier 模型在拓扑推理上均表现欠佳」。
- 5 阶段管线：预训练 → 双专家 SFT（F_TwG 框 / F_TwP 点分开训）→ GRPO 三层奖励 RL → Unified RFT 合体 → On-Policy 蒸馏闭合专家差距。
- 数据真砸 + anti-cheat：迷宫 46 万样本（含「貌似可解实则不可解」对抗样本）、路径追踪 12.5 万（含同色曲线防作弊）；97,984 个数据集滤出约 4,000 万样本。
- 语言解耦：后训练数据无中文语料，模型仍能用中文做视觉推理——坐标与语言无关，多语言能力由基座模型继承。

## 深度分析

### 视觉原语：让「指」成为思考本身

两种坐标原语各有分工：边界框适合精确定位具体物体，点适合表达框不出来的抽象指代（运动轨迹、路径方向）。关键在于坐标嵌在思考过程中间而非最终答案里——模型边推理边「指一个想一下」，指和想互为表里。论文里数宝可梦的例子：先框候选、逐个排除、最后点数，每次定位都参与推理。

与之前 grounding + CoT 路线的区别，论文用两个术语点破：先前工作把 grounding 当 post-hoc verification（事后验证）——想完再用框确认；DeepSeek 让视觉原语成为 intrinsic medium of thought（思考的内在媒介）。这也是它能缓解 Reference Gap 的原因：自然语言指代（「左数第三个穿红衣服的」）在多步推理中累积歧义直至逻辑坍塌，坐标则每一步都无歧义。

### 反共识路线：不堆分辨率，堆指代精度

主流把多模态推理失败归因于 Perception Gap——「没看清所以推错」，解法是高分辨率切割，代价是 token 与 KV cache 暴涨（如 Opus 4.7 分辨率拉到 2576px）。DeepSeek 的论点相反：看见 ≠ 看清楚 ≠ 说清楚指哪个，感知再强、指代不准也白搭。最有力的证据是拓扑推理：迷宫导航要每步记住「我在哪、走过哪、哪些岔路没探」，路径追踪要在十几个交点上每次做对方向判断，纯文本 CoT 必然崩盘——「中间偏左」相对什么说不清，坐标则每步无歧义（示例中 18 步迷宫每步带坐标）。

### 效率与 token 压缩：7056 倍的工程链路

三步压缩：DeepSeek-ViT 以 14×14 像素 patch 切图（756×756 → 2916 token）；ViT 出口 3×3 空间压缩沿通道维度 9 合 1（→324）；V4-Flash 的 Compressed Sparse Attention 每 4 个视觉 token 压成 1 个 KV 条目（→81），总压缩比 7056 倍，同一份硬件可处理近 10 倍请求——像扔掉书但记得重点在第几页，需要时直接报坐标。诚实标注：Claude/Gemini 的 KV 数是 DeepSeek 的估算（token ≠ KV 条目），方向成立但数字别较真；对比 GPT-5.4 而非 GPT-5.5 也应是评测周期时差。

### 对 coding agent 视觉接入的意义

DeepSeek 是七大 coding agent 玩家中最后一个把视觉接入主力产品的（比 GLM-5V-Turbo 晚 28 天、比 Anthropic 晚两年），但补课方式最贵：不是「我也做一个差不多的视觉模型」，而是「做一个全新范式的视觉模型」。对 coding agent，视觉已是必需品：截前端页面判断布局崩没崩、截报错定位问题、读设计稿生成组件代码，这些用文字根本说不清「左边那个按钮的右边有个图标」。

论文重定义了 coding agent 视觉竞争的维度：以前比「能看 4K 图」「token 便宜」，现在比「思考时能不能用手指着图说话」。按 DeepSeek「论文先铺路、模型后亮相」的节奏，下一代基座大概率原生多模态，视觉原语是范式转移而非工程优化。

## 实践启示

1. 接截图输入别只堆分辨率——先检查模型能否「指得准」：思考时输出坐标比切更多 patch 更能解决空间指代任务。
2. 把 grounding 从「事后验证」前移到「思考中间」：在 CoT 里输出归一化坐标当 scratchpad，消除多步推理的歧义累积。
3. 用拓扑推理任务（迷宫、路径追踪）当空间推理试金石——能快速暴露纯文本 CoT 的崩溃点。
4. 奖励工程参考 GRPO + 三层 RM 与指数衰减连续奖励（偏离越远惩罚越重），rollout 按 Easy/Normal/Hard 分档只训 Normal。
5. 训练数据主动 anti-cheat：构造「貌似可解实则不可解」的对抗样本、去掉颜色等捷径线索，逼出真实能力。
6. 把「截图反馈闭环」做成 coding agent 标配（UI 还原、报错诊断、视觉回归），评估优先看指代密集型 prompt。

## 相关实体

- [DeepSeek Visual Primitives](../ch09/118-deepseek-visual-primitives.html)
- [Thinking with Visual Primitives 深度解读](../ch09/118-deepseek-visual-primitives.html)
- [同文 v1 解读](417-deepseek.html)
- [DeepSeek V4](708-deepseek-v4.html)
- [DeepSeek V4 论文深读](708-deepseek-v4.html)
- [DeepSeek KV cache](417-deepseek.html)
- [DeepSeek Code Harness](../ch09/003-deepseek-code-harness.html)
- [DeepSeek-VL 与 VLM 原理](417-deepseek.html)

---

