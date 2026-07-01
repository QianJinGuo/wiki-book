# SenseNova-U1 — 商汤原生统一多模态模型

## Ch01.979 SenseNova-U1 — 商汤原生统一多模态模型

> 📊 Level ⭐⭐⭐ | 9.1KB | `entities/sensnova-u1.md`

## 核心架构：NEO-Unify
NEO-Unify 完全去掉 VE 和 VAE，图像直接转化为 token，理解和生成在同一表示空间协同建模。

### 三组核心矛盾与解法
**矛盾一（接口层）**：消除模块割裂 → **Encoder-free 设计**

- 输入：两层卷积+GELU 替代预训练 VE，每个 token 对应 32×32 像素块
- 输出：MLP 直接预测原始像素块
- 效果：NEO-unify（2B）在 MS COCO 2017 图像重建 PSNR 达 31.56、SSIM 达 0.85，接近 Flux VAE 的 32.65/0.91
**矛盾二（训练层）**：动态分辨率信噪比失衡 → **分辨率自适应噪声尺度**

- 分辨率越高 → token 数越多 → 噪声标准差按平方根比例同步上调
- 保证 Flow Matching 过程中 SNR 分布一致
**矛盾三（参数层）**：理解与生成的梯度干扰 → **原生 MoT 架构**

- Mixture-of-Transformers：底层共享自注意力上下文，Q/K/V/O 投影和 MLP 层按 token 类型动态路由
- "知识共享、专才专用"

### 其他架构要点
- **三维 RoPE**（T/H/W 三轴独立频率基）：对齐语言顺序和图像空间结构
- **混合注意力 Mask**：文本 token 走因果注意力，同块图像 token 双向关注

## 四步训练策略
1. **理解预热**：注意力融合，恢复语义骨干
2. **生成预训练**：冻结理解分支，256-2048 动态分辨率掌握图像生成
3. **统一中期训练**：双分支同时激活，84k 步端到端联合训练
4. **统一 SFT**：高质量指令微调 9k 步 + Flow-GRPO 强化学习两阶段

## 核心 benchmark 成绩
| 基准 | A3B-MoT | 亮点 |  
|------|---------|------|  
| MMMU | 80.55 | 超越 Qwen3.5-9B 2.15 分 |  
| MMMU-Pro | 72.83 | 领先 2.73 分 |  
| GenEval | 0.91 | 开源第一 |  
| OCRBench | 91.90 | 文本密集图像超竞品 |  
| RealUnify | 52.4 | 理解增强生成/生成增强理解双方向开源第一 |  
| RISEBench（CoT）| 30.0 | 推理驱动编辑开源第一 |  
| IFBench | 79.79 | 比 Qwen3.5-9B 高 15.29 分 |  

## 推理系统：LightLLM + LightX2V 解耦部署
- LightLLM：多模态理解、文本流式输出、请求调度
- LightX2V：图像生成
- 锁页共享内存 + FlashAttention3 后端
- 2048×2048 图像生成：5090 每步 0.415s，L40S 每步 0.443s

## 模型规格
| 版本 | 参数量 | 类型 |  
|------|--------|------|  
| SenseNova-U1-8B-MoT | 8B | 稠密，端侧可跑 |  
| SenseNova-U1-A3B-MoT | 38B 总 / 3B 激活 | MoE |  
训练语料：超 3.4 万亿 token，预训练 2.1 万亿（图文对、信息图理解、纯文本）

## 开源生态
- GitHub: https://github.com/OpenSenseNova/SenseNova-U1
- HuggingFace: https://huggingface.co/collections/sensenova/sensenova-u1
- arXiv: https://arxiv.org/abs/2605.12500

## 技术演进判断
- **过去**：VE+VAE 拼接，理解与生成是天生的异构系统
- **现在**：原生统一，图像和语言在同一条链路中协同理解与生成
- **趋势**：以更少训练 token 实现更高性能，数据扩展效率显著优于同类方法
- **下一步**：VLA（视觉-语言-动作）、世界建模（WM）

## 深度分析
### 架构创新的本质：消解模态之间的「异构墙」
传统多模态模型将理解和生成视为两个独立任务，各自依赖专用编码器（VE）和解码器（VAE），中间靠适配器拼凑。这种"缝合"架构的根问题是：两个模态的表征空间天然不同，信息和生成之间的语义对齐只能近似，从而产生「角色在连续生成中形象走样」等典型失败案例。
NEO-Unify 的釜底抽薪之计是把 VE 和 VAE 都拿掉，让图像直接进入 Transformer 的 token 序列。这意味着理解和生成从第一天起就在同一个表征空间里协作，不存在跨空间的适配损失。

### 三组核心矛盾的设计启示
**接口层（矛盾一）**：用两层卷积+GELU 替代预训练 VE，看似简单，却抓住了关键——32×32 像素块直接 token 化，等于是把图像当作一种「高带宽语言」来处理。这与 Diffusion Transformer 将图像视为 patch 序列的思路一脉相承，但 NEO-Unify 的创新在于输入输出使用同一套表示，彻底消除了编码器和解码器之间的重建误差。
**训练层（矛盾二）**：分辨率自适应噪声尺度的设计极为精妙。Flow Matching 的核心是在噪声和数据之间插值，SNR（信噪比）分布决定了学习信号的质量。高分辨率图像 token 数多，若噪声标准差不变，则高分辨率区域的 SNR 偏低，导致结构崩坏；低分辨率若标准差过高，则细节丢失。按平方根比例同步上调噪声标准差，本质上是在保持不同分辨率在特征域的 SNR 一致性，从而让模型对分辨率缩放具有鲁棒性。
**参数层（矛盾三）**：MoT（Mixture-of-Transformers）的路由机制解决了统一模型中最棘手的问题——理解任务和生成任务对模型参数的需求是不同的，有时甚至冲突。共享底层自注意力保证了知识共享，按 token 类型动态路由 Q/K/V/O 和 MLP 则让「专才专用」成为可能。这种设计在 MoE 架构中常见，但 NEO-Unify 将其引入统一多模态任务，是一种有效的跨任务参数隔离方案。

### 开源战略的市场意义
SenseNova-U1 的开源选择（GitHub + HuggingFace + arXiv）是一个完整的三层开源布局：代码吸引开发者生态，模型权重吸引直接用户，论文建立学术影响力。结合商汤的 Skill 生态（sn-infographic 等），这是在 OpenAI GPT-4o 之后、多模态统一模型开源领域的一次重要卡位。

## 实践启示
### 对于多模态模型研发团队
1. **Encoder-free 不是噱头，是真实的方向**：NEO-unify（2B）在图像重建上接近 Flux VAE 的水平（PSNR 31.56 vs 32.65），证明了无编码器路径的可行性。这条路线的核心优势是端到端 gradient flow 更顺畅，不存在表征空间对齐的梯度断层。
2. **MoT 路由是统一模型参数隔离的首选方案**：当一个模型需要同时处理理解和生成时，静态的参数分离（如冻住理解分支训练生成）效率低且效果上限明显；动态路由可以在 token 级别决定哪个专家处理，灵活度更高。
3. **数据扩展效率优于参数扩展**：U1 用 3.4 万亿 token 训练实现了对标更大参数模型的能力，关键在于预训练数据的质量（图文对、信息图理解、纯文本的配比）和课程设计（四步训练策略的顺序不可颠倒）。

### 对于考虑部署统一多模态模型的企业
1. **连续性图文创作是核心差异点**：如果业务场景需要文字和图像在同一输出中自然交叠（如操作教学、漫画生成、信息图），U1 的原生统一架构相比拼接方案有结构性优势。
2. **LightLLM + LightX2V 解耦部署架构值得参考**：理解任务和生成任务的算力需求和延迟敏感度不同，解耦部署允许独立扩缩容，是降本增效的有效手段。
3. **当前局限需要针对性评估**：32K 上下文上限对超长图文创作有约束；人物复杂场景的稳定性问题在娱乐内容生成场景需要额外后处理或人工审核。

## 相关技术
- [DeepSeek Visual Primitives](ch09/130-deepseek-visual-primitives.md) — 视觉原语作为思考媒介（同期多模态前沿）
- [Kimi AttnRes](https://github.com/QianJinGuo/wiki/blob/main/entities/kimi-attention-residuals-preNorm-dilution-block-attnres.md) — 训练效率优化
- [Attention Mechanism](https://github.com/QianJinGuo/wiki/blob/main/concepts/attention-mechanism.md) — 注意力机制基础
- [Transformer Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/transformer-architecture.md) — Transformer 架构演进

## 局限
- 上下文 32K 上限
- 人物复杂场景细节不稳
- 长文字渲染偶有拼写/排版错误
- 连续性图文创作仍在 beta
## 相关实体

- [商汤开源 sensenova-u1：一个模型，同时「看懂」和「画懂」](https://github.com/QianJinGuo/wiki/blob/main/entities/sensnova-u1-sensetime.md)

---

