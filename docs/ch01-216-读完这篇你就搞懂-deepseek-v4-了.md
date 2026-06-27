# 读完这篇你就搞懂 DeepSeek v4 了

## Ch01.216 读完这篇你就搞懂 DeepSeek v4 了

> 📊 Level ⭐⭐ | 16.8KB | `entities/读完这篇你就搞懂-deepseek-v4-了-v2.md`

# 读完这篇你就搞懂 DeepSeek v4 了

> 腾讯技术工程 2026-04-28 发布，作者 dorian。2026-04-24 DeepSeek 突然上线 V4 预览版并同步开源——技术报告「DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence」。本文系统解读 V4 在 attention、residual、kernel 三个层面的架构创新，是中文社区最完整的 V4 深度解读之一。
> → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/读完这篇你就搞懂-deepseek-v4-了-v2.md)

## 摘要

DeepSeek-V4 包含两个独立预训练的 MoE 模型：V4-Pro（1.6T 总参数，稀疏激活 49B，1M 默认上下文）和 V4-Flash（284B 总参数，稀疏激活 13B，1M 默认上下文）。两者都默认 1M 上下文，服务端不再区分"长/短"模型。在编程、数学、Agent、长文本四个维度同时刷进第一梯队，接近 GPT-5.4 / Claude 4.6 / Gemini 3.1。但真正硬核的不是 1.6T 参数 + 1M 上下文，而是从 **attention 到 kernel 的系统级重构**——三项核心架构创新：**mHC（Manifold-Constrained Hyper-Connections）** 解决万亿参数深度网络的残差稳定性、**CSA / HCA 混合注意力** 把 1M 上下文的计算量压到工程可承受、**Muon 优化器** 加速大规模训练收敛。

## 核心要点

- **模型规格**：
  - DeepSeek-V4-Pro：1.6T 总参数，稀疏激活 49B，1M 上下文
  - DeepSeek-V4-Flash：284B 总参数，稀疏激活 13B，1M 上下文
  - 两个都是独立预训练的 MoE，不是蒸馏关系
  - 两档都默认 1M 上下文，服务端不再区分"长/短"模型
- **为什么需要 1M 上下文**：
  - Agent 多轮任务：30 轮 Coding Agent 跑下来数十万 token 起步
  - 整仓库级代码理解：中型 Python 项目 15 万行 ≈ 80-120 万 token，RAG 漏一个调用点就是一个 bug
  - 长文档推理：200 页法律合同、500 页学术综述，单文档 50-80 万 token 很常见
- **Transformer 在 1M 时代的三大瓶颈**：
  1. 标准残差机制在万亿参数 + 百层以上时出现梯度消失 / 激活爆炸
  2. Attention 计算复杂度 O(L²)，L 提升 8× prefill FLOPs 提升 64×；Decode 阶段 KV 显存占用和带宽与 L 成正比
  3. 万亿参数、深度更大的模型网络训练稳定性
- **架构三项核心创新**：
  - **mHC（Manifold-Constrained Hyper-Connections）**：多流约束的残差连接，把 Hres 限制为"双随机矩阵"，从根本上解决梯度消失/爆炸
  - **CSA / HCA（Hybrid Attention）**：压缩稀疏注意力 + 高度压缩注意力，把 1M 上下文的 KV 缓存与计算量压到工程可承受
  - **Muon 优化器**：二阶优化器，在特定场景收敛更快，降低训练成本
- **评分**：
  - V4-Pro 在 SWE Verified 拿到 80.6（与"一口气读完整个项目"直接相关）
  - V4-Pro 在 MRCR 1M 拿到 83.5（开源最高）
  - 编程、数学、Agent、长文本四个维度同时刷进第一梯队

## 深度分析

### 一、为什么 1M 上下文是"必须"而不是"军备竞赛"

文章最有说服力的部分是用三个真实场景反驳"1M 上下文是军备竞赛"的质疑：

**场景一：Agent 多轮任务**

30 轮 Coding Agent 的 token 消耗结构：
- 用户指令（每轮几百 token）
- 读 3-4 个源文件（每轮几千到几万 token）
- 执行 shell 命令 + stdout（每轮几千 token）
- reasoning trace（每轮几千 token）
- 30 轮总数 = 数十万 token 起步

V3.2 在新用户消息来时丢弃 thinking history——不是不想留，是**留不下**。这就是为什么 1M 上下文对 Agent 时代是必要基础设施。

**场景二：整仓库级代码理解**

中型 Python 项目（300 个文件 / 15 万行代码）tokenize 后约 80-120 万 token。RAG（向量检索挑相关文件）的问题：**重构、跨文件一致性检查、类型推导**这类任务，漏一个调用点就是一个 bug。V4 在 SWE Verified 80.6 的成绩与"一口气读完整个项目"直接相关。

**场景三：长文档推理**

200 页法律合同、500 页学术综述、季度财报的四个附件——单文档 50-80 万 token 很常见。切块摘要再合并会丢失前后逻辑，**在原始材料上做跨段落推理**才是正确路径。MRCR 1M 指标就是测这个——V4-Pro 拿到 83.5。

**含义**：1M 上下文的真正驱动者是 **Agent 工作流 + 整仓代码 + 长文档推理**——这三类任务在 2026 年是高频生产场景，不是边缘需求。

### 二、mHC：多流约束残差连接——万亿参数训练稳定性的根本解

mHC 是文章最技术深度的部分。它要解决的问题是：**为什么标准残差在百层 + 万亿参数时崩溃**？

**标准残差的三种失败模式**：
1. **容量瓶颈**——所有层共用一条残差通路，浅层信息和深层信息"相互踩踏"
2. **路由僵硬**——"无论如何都要均等的接受每一层的贡献"，没有阀门调节，重要层贡献被稀释
3. **深度上限**——多层累加的隐状态值无衰减累加 → 梯度消失 / 激活爆炸

**Hyper-Connections (HC) 的修法**：
- 把"一条通天电梯井"改成"多流并行"——维护 n 个流
- 每次层间变换（ATTN/FFN）前先降流为 1，变换后再升流为 n
- 关键突破：每层的贡献是**带权重、多流并行**的

**HC 的剩余问题**：
- 每层系数是 Hres 矩阵的连乘
- 如果 Hres / Hpre / Hpost 没有任何约束，矩阵连乘会衰减/爆炸
- → 梯度消失 / 梯度爆炸

**mHC 的精妙修法（双随机矩阵约束）**：
- 残差映射矩阵 Hres **限制为"双随机矩阵"**——每行和 = 1、每列和 = 1、所有元素 ≥ 0
- 降流矩阵 Hpre / 升流矩阵 Hpost **仅需 sigmoid 限制在 (0,1)**
- **非对称约束的精髓**：对高风险矩阵（连乘）施加强约束，对低风险矩阵（单层）保持灵活
- **双随机矩阵的乘法封闭性**——连乘后仍然是双随机矩阵 → 每层系数均保持在 (0,1) → 根本解决梯度问题

**理论意义**：
- mHC 理论上可达通道数 m 种函数表示路径（标准残差只有 1 种），网络表达能力数学上严格更强
- 双随机矩阵的引入让"百层 + 万亿参数"的训练稳定性有了**严格数学保证**，不是工程经验

**业界其他解法**（Kimi）：
- 注意力残差（Attn-Res）+ 分块注意力残差（Block Attn-Res）
- 把"无权加和"改为"有权加和"，权重由注意力机制计算
- 块数设为 8 时可达全注意力残差几乎同样效果，开销可控
- **不同团队对同一问题给出风格完全不同的解法**——这是当前 LLM 架构设计最有趣的特征

### 三、CSA / HCA：把 1M 上下文从理论推到工程

标准 Transformer attention 的两个根本成本：
- **Prefill**：计算复杂度 O(L²)，L 提升 8× → prefill FLOPs 提升 64×
- **Decode**：每生成一个 token 都要把前面所有 L 组 KV 从 HBM 搬一遍，显存占用和带宽与 L 成正比

1M 上下文意味着 L=1,000,000——计算量膨胀 6.5 万倍，KV Cache 膨胀 256 倍。

**CSA（Compressed Sparse Attention）的比喻**：

想象每场会议有一排"会议记录员"——他们不是会议参与者，而是站在外围专门做纪要的第三方：
- **步骤一（压缩）**：每位记录员负责把相邻两组的发言综合成一份纪要；同一组的内容会被两份不同的纪要覆盖（保证切割后语义连贯）；每份纪要按"发言维度"独立打分加权（时间维度、情感维度等）——既压缩又保留独到见解
- **步骤二（闪电索引）**：用快速算法（与 V3.2 DSA 一致）算出每个 token 与所有纪要的关联度分数，按头加权后选 top-k
- **步骤三（精细查询）**：对 top-k 纪要做标准 attention 计算

**HCA（Heavily Compressed Attention）的比喻**：

HCA 是"速记员版"的 CSA——每场会议参与人数更多，速记员记录更大范围的会议内容（每份纪要覆盖更多人）。总纪要份数少，直接逐一查阅。

**压缩机制（CSA 步骤一）**：
- 把全部 token 分组（每组 m 个 token）
- 组内每个 token 的贡献加权
- 连续两组压缩内容拼接，保证切割后语义连贯
- 4 个 W 矩阵 + 2 个 B 偏置矩阵可学习

**闪电索引（CSA 步骤二）**：
- 与 V3.2 DSA 机制一致
- 快速计算每个 token 与全部纪要的关联度分数
- 每个注意力头加权后选 top-k

**注意力计算（CSA 步骤三）**：
- 标准 attention 计算
- KV 共享，K 来自闪电索引选出的 top-k 压缩信息

**HCA 步骤简化**：
- 没有"相邻两组合并"，单一组压缩
- 压缩比更高，但纪要数量更少，可直接逐一查阅

**工程意义**：
- 1M 上下文的 KV 缓存与计算量被压到工程可承受范围
- **压缩 + 稀疏采样**的双重机制让"百层 + 1M 上下文 + 万亿参数"成为可能
- 这是 V4 真正"硬核"的地方——不是参数规模，而是**架构创新让大参数 + 长上下文同时可承受**

### 四、Muon 优化器

文章提到 V4 使用 Muon 优化器，但篇幅较少。Muon 是矩阵感知优化器（matrix-aware optimizer）的代表，相比 AdamW 在大规模训练中**收敛更快、训练成本更低**。它通过矩阵正交化近似二阶信息，避免 AdamW 在大矩阵上的各向同性假设。

### 五、对中文社区的意义

DeepSeek V4 不仅是技术里程碑，也是中国 LLM 团队在**架构创新**上的代表：
- 之前中国 LLM 的标签是"工程优化 + 性价比"
- V4 之后中国 LLM 也有了自己的"架构创新"标签——mHC / CSA / HCA 都有理论贡献

这与 [DeepSeek MoE 并行策略](/ch01-673-deepseek-moe-并行策略与gpu通信优化/)、[DeepSeek 成本迁移系统层 KV Cache Harness](/ch05-034-deepseek-成本迁移-从-kv-cache-到-harness-的系统层/)、[DeepSeek V4 Training 58-page Paper Deep Dive](/ch01-751-deepseek-v4是怎么训练出来的-58页论文深入解读/) 等文章形成完整图景。

### 六、与其他 V4 解读的关系

- [DeepSeek V4 Flash/Pro: 百万级上下文与万亿参数推理新纪元](/ch01-726-deepseek-v4-flash-pro-通往百万级上下文与万亿参数推理的新纪元/) 关注产品侧
- [DeepSeek V4 Flash/Pro v2](/ch01-726-deepseek-v4-flash-pro-通往百万级上下文与万亿参数推理的新纪元/) 是上一条的更新版
- [DeepSeek V4 Pro vs Claude](/ch01-623-we-tested-deepseek-v4-pro-and-flash-against-claude-opus-4-7/) 关注对比评测
- [DeepSeek V4 Flash Means LLM Steering is Interesting Again](/ch01-737-deepseek-v4-flash-means-llm-steering-is-interesting-again/) 关注 V4 Flash 的"可控生成"能力
- [DeepSeek V4 DS4C / Antirez 本地推理](/ch09-040-deepseek-v4-ds4c-antirez-local-inference-qbitai/) 关注本地部署
- [DeepSeek V4 Training 58-page Paper Deep Dive](/ch01-751-deepseek-v4是怎么训练出来的-58页论文深入解读/) 关注训练侧
- [DeepSeek Code Harness](/ch09-068-deepseek-code-harness/) 关注 V4 在 Agent / Harness 场景的工程实践
- [DeepSeek Code Harness 竞争者 Tina](/ch09-068-deepseek-code-harness/) 关注竞品分析

## 实践启示

- **不要把 1M 上下文看作营销概念**——Agent 多轮任务、整仓代码理解、长文档推理三类场景是真实生产需求，1M 上下文是必须基础设施。
- **关注架构创新而不是参数规模**——V4 真正硬核的是 mHC / CSA / HCA 让大参数 + 长上下文同时可承受，不是 1.6T 参数本身。
- **mHC 的"非对称约束"是设计哲学**——对高风险组件（连乘、累积、级联）施加强约束，对低风险组件保持灵活。这种哲学适用于 harness 设计、prompt 模板设计、agent 编排等所有"系统级稳定性"问题。
- **压缩 + 稀疏采样的双层机制值得借鉴**——CSA 的"粗筛 + 精查"模式可推广到 RAG、tool selection、context retrieval 等场景。
- **关注 V4 在 Agent / Harness 场景的工程实践**——V4 的能力需要 harness 配合才能在生产中稳定输出，关注 [DeepSeek Code Harness](/ch09-068-deepseek-code-harness/) 等。
- **开源模型的能力边界正在快速逼近闭源模型**——V4 在编程、数学、Agent、长文本同时接近 GPT-5.4 / Claude 4.6 / Gemini 3.1 水平，AI 选型需要重新评估成本效益。
- **关注 DeepSeek 系列在企业场景的落地案例**——V4 的成本优势 + 长上下文能力可能解锁大量新应用（整仓 refactor、长合同审查、跨文档问答）。

## 关联实体

- [DeepSeek V4 Flash/Pro: 百万级上下文与万亿参数推理新纪元](/ch01-726-deepseek-v4-flash-pro-通往百万级上下文与万亿参数推理的新纪元/)
- [DeepSeek V4 Flash/Pro v2](/ch01-726-deepseek-v4-flash-pro-通往百万级上下文与万亿参数推理的新纪元/)
- [DeepSeek V4 Pro vs Claude](/ch01-623-we-tested-deepseek-v4-pro-and-flash-against-claude-opus-4-7/)
- [DeepSeek V4 Flash Means LLM Steering is Interesting Again](/ch01-737-deepseek-v4-flash-means-llm-steering-is-interesting-again/)
- [DeepSeek V4 DS4C / Antirez 本地推理](/ch09-040-deepseek-v4-ds4c-antirez-local-inference-qbitai/)
- [DeepSeek V4 Training 58-page Paper Deep Dive](/ch01-751-deepseek-v4是怎么训练出来的-58页论文深入解读/)
- [DeepSeek MoE 并行策略](/ch01-673-deepseek-moe-并行策略与gpu通信优化/)
- [DeepSeek 成本迁移系统层 KV Cache Harness](/ch05-034-deepseek-成本迁移-从-kv-cache-到-harness-的系统层/)
- [DeepSeek Code Harness](/ch09-068-deepseek-code-harness/)
- [DeepSeek Code Harness 竞争者 Tina](/ch09-068-deepseek-code-harness/)
- [17 种 agent 架构演进](/ch04-507-17种agent架构演进-控制流设计的完整演化史/)
- [Harness Engineering](/ch05-041-harness-engineering-概念框架/)

---

