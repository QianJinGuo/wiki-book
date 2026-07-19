# DeepSeek Visual Primitives：视觉原语作为思考媒介

## Ch09.170 DeepSeek Visual Primitives：视觉原语作为思考媒介

> 📊 Level ⭐⭐⭐ | 10.0KB | `entities/deepseek-visual-primitives.md`

## 核心定位
DeepSeek 2026-04-30 发布的视觉原语论文。核心创新：让模型在思考过程中输出坐标（bounding box / point）作为"用手指着图说话"的媒介，把 grounding 从 post-hoc verification 变成 intrinsic medium of thought。 ^["raw/articles/deepseek-visual-primitives-thinking"]

## 核心概念：Reference Gap
### Perception Gap vs Reference Gap
| 术语 | 含义 | 主流解决方案 |
|------|------|------------|
| Perception Gap（感知鸿沟） | 模型没看清 | 高分辨率切割、动态分块 |
| Reference Gap（指代鸿沟） | 模型说不清楚"指哪个" | 视觉原语（坐标） |
DeepSeek 认为：感知再强，指代不准也白搭。 ^["raw/articles/deepseek-visual-primitives-thinking"]

### "看见" vs "看清楚" vs "说清楚指哪个"
这是三件不同的事。主流路径只解决了前两件。 ^["raw/articles/deepseek-visual-primitives-thinking"]

### Point 为什么比框更适合拓扑推理
- 框适合定位具体物体（定位准、信息量大）
- 点适合抽象指代（轨迹、路径、交叉口方向）
- 迷宫/路径追踪用坐标（x, y）没有歧义，纯文本 CoT 走几步就乱了

## 关键技术数据
### 压缩效率
| 模型 | KV cache 条目（800×800图） | 7 benchmark 平均分 |
|------|--------------------------|------------------|
| Gemini-3-Flash | ~1100 | 76.5% |
| Claude-Sonnet-4.6 | ~870 | 65.3% |
| GPT-5.4 | ~740 | 71.1% |
| Qwen3-VL-235B-A22B | ~660 | 68.1% |
| Gemma-4-31B | ~289 | 69.7% |
| **DeepSeek（本文）** | **~90** | **77.2%** |
**DeepSeek 用比 Claude 少 9 倍、比 Gemini 少 12 倍的 KV cache 条目，做出了小幅领先平均分。** ^["raw/articles/deepseek-visual-primitives-thinking"]

### 压缩链路（三步）
1. ViT 切块（DeepSeek-ViT，14×14 像素/patch）→ 2916 个 patch token ^["raw/articles/deepseek-visual-primitives-thinking"]
2. 3×3 空间压缩（相邻9个 patch 压成1个）→ 324 个 ^["raw/articles/deepseek-visual-primitives-thinking"]
3. Compressed Sparse Attention（每4个压成1个）→ 81 个 ^["raw/articles/deepseek-visual-primitives-thinking"]
**总压缩比：7056 倍** ^["raw/articles/deepseek-visual-primitives-thinking"]

### 拓扑推理领先幅度
| 任务 | DeepSeek | 第二名 | 领先 |
|------|---------|-------|------|
| 迷宫导航 | **66.9%** | Gemini 49.4% | **+16.3pp** |
| 路径追踪 | **56.7%** | GPT-5.4 46.5% | **+10.2pp** |
**所有 frontier 模型在拓扑推理任务上均表现欠佳**（论文原话）。 ^["raw/articles/deepseek-visual-primitives-thinking"]

## 5阶段训练管线
```
Pretraining → Specialized SFT（F_TwG + F_TwP） → Specialized RL → Unified RFT → OPD蒸馏
```

### 专家化设计
- F_TwG：thinking with grounding（用框思考）
- F_TwP：thinking with pointing（用点思考）
- 分开训避免模式冲突

### 三层 RL 奖励
1. **Format RM**：格式合规、防止重复框 ^["raw/articles/deepseek-visual-primitives-thinking"]
2. **Quality RM**：LLM 评委5维打分（冗余度/一致性/自相矛盾/引用有效性/reward hacking） ^["raw/articles/deepseek-visual-primitives-thinking"]
3. **Accuracy RM**：任务特定精度奖励 ^["raw/articles/deepseek-visual-primitives-thinking"]

### OPD 蒸馏
合体后的统一模型在每个专项上不如各自的专家模型，用蒸馏闭合差距。 ^["raw/articles/deepseek-visual-primitives-thinking"]

## 数据设计亮点
### Anti-cheap 思维
- 对抗迷宫（看似可解实不可解）：教模型"不要光看就敢答，要真探索过"
- 同色路径追踪：强迫模型靠曲率连续性判断，不能靠颜色作弊

### 多语言零-shot
没有中文训练数据但能中文推理——说明视觉原语和语言能力是解耦的。 ^["raw/articles/deepseek-visual-primitives-thinking"]

## 局限
1. **需要触发词**：模型不能自主判断"需不需要用视觉原语" ^["raw/articles/deepseek-visual-primitives-thinking"]
2. **极细粒度精度不够**：坐标 0-999 整数，800×800 图上每单位=0.8像素 ^["raw/articles/deepseek-visual-primitives-thinking"]
3. **拓扑推理跨场景泛化未验证** ^["raw/articles/deepseek-visual-primitives-thinking"]

## 对 coding agent 的意义
DeepSeek 是七大 coding agent 旗舰中最后一个把视觉接入主力产品的，但以最贵的方式补课：不是"做了一个差不多的视觉模型"，而是"做了一个全新范式的视觉模型"。 ^["raw/articles/deepseek-visual-primitives-thinking"]
coding agent 真正卡住人的不是"看不清细节"，是"描述不清楚这个按钮的下面那个组件"。视觉原语能力对这类场景有独特优势。 ^["raw/articles/deepseek-visual-primitives-thinking"]

## 深度分析
### 1. Reference Gap 是比 Perception Gap 更根本的视觉理解瓶颈
主流路线在高分辨率切割、动态分块上持续投入，但这解决的是"感知鸿沟"——让模型看得更清楚。DeepSeek 的核心论点是：感知再强，如果说不清楚"我指的是图上哪个位置"，视觉理解仍是不完整的。"看见""看清楚""说清楚指哪个"是三件不同的事，主流只解决了前两件。 ^["raw/articles/deepseek-visual-primitives-thinking"]

### 2. 视觉原语将 grounding 从验证工具升级为思考媒介
这是范式层面的转移。之前的工作（Visual CoT、CogCom、GRIT）将 grounding 定位为 post-hoc verification：模型先用文字想完，再用框来事后验证自己的判断。DeepSeek 将 grounding 变为 intrinsic medium of thought：模型边思考边用坐标指着图说话，坐标本身就是思考的一部分，而非思考的结果。这一转变使视觉信息在 token 序列中的角色从"证据"变为"载体"。 ^["raw/articles/deepseek-visual-primitives-thinking"]

### 3. 7056 倍压缩效率重新定义多模态 LLM 的工程可行边界
DeepSeek 用 ~90 KV cache 条目实现 77.2% 平均分，而 Claude 用 ~870 条目只有 65.3%——压缩效率与性能同时领先。3×3 空间压缩 + Compressed Sparse Attention 的两段式压缩链路证明了：在 ViT 输出端做token-level 压缩，比在attention 层面压缩更高效且信息损失更小。 ^["raw/articles/deepseek-visual-primitives-thinking"]

### 4. 拓扑推理是所有 frontier 模型共同的能力缺口
论文原文"Notably, all frontier models exhibit suboptimal performance on topological reasoning tasks"——这是对 GPT-5.4、Gemini-3-Flash、Claude-Sonnet-4.6 的集体点名。迷宫导航 DeepSeek 66.9% vs Gemini 49.4%（+16.3pp），路径追踪 56.7% vs GPT-5.4 46.5%（+10.2pp）。差距的根源在于：纯文本 CoT 无法长时间维持精确空间状态，而坐标（x, y）是歧义最低的空间语言。 ^["raw/articles/deepseek-visual-primitives-thinking"]

### 5. 专家化训练→统一→蒸馏的工程闭环值得 Agent 系统借鉴
DeepSeek 的 5 阶段管线（Stage 2 专家化 SFT → Stage 3 专家化 RL → Stage 4 统一 RFT → Stage 5 OPD 蒸馏）展示了一个完整的"分-合-调"工程哲学：先让专家各司其职，再合体，最后用蒸馏弥合合体的损失。这与 multi-agent 系统中"专家 agent → 协调 agent → 知识蒸馏"的路径高度相似。 ^["raw/articles/deepseek-visual-primitives-thinking"]

## 实践启示
### 1. 拓扑推理类 coding agent 任务应优先考虑 DeepSeek 视觉原语方案
需要视觉定位的 coding 场景（UI 组件定位、代码-截图对应、图表理解）中，DeepSeek 的 point 能力（坐标指代）在指代精确度上显著优于基于框的方法。选型评估时应将"指代精度"而非"图像分辨率"作为视觉能力的关键指标。 ^["raw/articles/deepseek-visual-primitives-thinking"]

### 2. coding agent 视觉能力评估应新增"说清楚指哪个"维度
当前 coding agent 评测普遍关注分辨率支持、token 成本、响应速度，对"能否在思考过程中用坐标指代图上具体位置"缺乏评测标准。DeepSeek 的论文表明，这一能力与 agent 的调试、UI 修改、视觉审查等任务高度相关——这些正是现有 benchmark 的盲区。 ^["raw/articles/deepseek-visual-primitives-thinking"]

### 3. 多语言部署无需额外微调视觉原语能力
视觉原语（坐标、框）是视觉-语言解耦的表示，中文语境下模型直接复用基模的多语言能力。这意味着非英语市场的 coding agent 集成时，视觉原语模块不需要额外的本地化训练投入。 ^["raw/articles/deepseek-visual-primitives-thinking"]

### 4. 警惕触发词限制对自动化场景的影响
DeepSeek 目前无法自主判断"是否需要用视觉原语"，必须由外部触发。这一限制在 human-in-the-loop 场景下可接受，但在 fully autonomous coding agent 中会导致模型在需要指代时忘记用坐标。系统设计时应加入触发词策略层（rule-based 或 LLM 判断）。 ^["raw/articles/deepseek-visual-primitives-thinking"]

### 5. 极细粒度视觉任务需结合高分辨率方案而非单独使用视觉原语
坐标精度 0-999（对应 800×800 图每单位 0.8 像素）在 pixel-level 精确定位场景不够用。未来的正确路径是：视觉原语（粗粒度指代）+ 高分辨率感知（细粒度验证）结合，而非单独依赖任一方案 。 ^["raw/articles/deepseek-visual-primitives-thinking"]

## 相关阅读
## 相关阅读
- [SenSNova U1](https://github.com/QianJinGuo/wiki/blob/main/entities/sensnova-u1.md)（中国首个真实超 GPT-4.5 的 MoE）
> 原文链接：https://mp.weixin.qq.com/s/tz7Zdbv8KhHtG8fCGqQ5LQ

## 相关实体
- [DeepSeek视觉原语论文：当所有人在堆图像分辨率时，它在堆「指代精度」](../ch01/1026-deepseek.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/vision-multimodal.md)

---

