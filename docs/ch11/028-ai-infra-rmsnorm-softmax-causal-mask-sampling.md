# AI Infra 入门：RMSNorm、Softmax、Causal Mask、Sampling 的数学与底层优化

## Ch11.028 AI Infra 入门：RMSNorm、Softmax、Causal Mask、Sampling 的数学与底层优化

> 📊 Level ⭐⭐ | 15.9KB | `entities/ai-infra-math-foundations-rmsnorm-softmax-causal-mask-sampling-binnnliu-2026-06-17.md`

# AI Infra 入门：RMSNorm、Softmax、Causal Mask、Sampling 的数学与底层优化

## 摘要

腾讯工程师 binnnliu 的 AI Infra 入门系列第二篇，从数学第一性原理出发，拆解大模型推理中四个核心操作（RMSNorm、Softmax、Causal Mask、Sampling）背后的数学本质与 Infra 优化逻辑。核心论点：Infra 优化的本质，是用数学等价变换或精度适度妥协，换取更高的硬件利用率和极致推理速度。文章涵盖方差→标准差→Z-score→LayerNorm→RMSNorm 的完整数学推导链、Softmax 的 Safe/Online/FlashAttention 演进、Gumbel-Max Trick 的采样统一，以及 FlashAttention v1→v4 的架构进化全景。

## 深度分析

### 1. RMSNorm：从方差到归一化的数学推导链

**为什么需要归一化**：Transformer 数十上百层的矩阵乘加操作导致数值分布剧烈变化，引发两个致命问题——梯度消失/爆炸（算法收敛困难）和 FP16/BF16 精度下的溢出与截断（硬件层面）。FP16 精度高但数值范围小（上限 65504），BF16 数值范围大但尾数仅 7 bit，容易"大数吃小数"。

**数学推导链**（方差→标准差→Z-score→LayerNorm→RMSNorm）：
- **方差**：每个数据与均值距离的平方的平均数，衡量离散程度。选择平方而非绝对值，因为平方函数平滑可导（抛物线），绝对值在底部不可导（V 字形），无法用于微积分求最优解。
- **标准差**：对方差开根号，还原真实数据单位和尺度。几何意义上，标准差就是高维空间中数据点到均值中心点的直线物理距离（勾股定理）。
- **Z-score 标准化**：减均值除以标准差，使新数组均值为 0、方差为 1。LayerNorm 本质就是 Z-score 在神经网络中的应用。

**LayerNorm vs RMSNorm**：
- LayerNorm 是 Memory-bound 算子，包含两次 Global Reduction，且存在致命数据依赖——必须先算均值 μ 才能算方差 σ²。
- RMSNorm（Biao Zhang 等，2019）通过实验发现：LayerNorm 有效主要因为缩放（除以标准差），平移（减均值）贡献微乎其微。砍掉均值计算后，只需一次单向 Reduction，打破数据依赖。
- RMSNorm 相对 LayerNorm 的收益：减少寄存器/SRAM 占用、节省大量 ALU 指令（消除 element-wise 减法）、可与无 bias Linear 层协同（现代 LLM 几乎所有 Linear 层都去掉了 Bias）。

**Post-Norm → Pre-Norm 演进**：
- Post-Norm（Transformer 2017）：残差相加后归一化。主干路径被多个 Norm 打断，梯度回传时被 Norm 导数反复衰减，深层梯度极大、浅层梯度消失，需要长周期 Warm-up 打补丁。
- Pre-Norm（2020 年前后）：先归一化再送入子层。主干路径变成纯恒等映射 x + F(Norm(x))，梯度无损回传，让深层网络训练成为可能。代价是前向传播中表征坍塌（Representation Collapse）——越深层新特征越微不足道，因此砍掉最后几层性能下降不明显。
- 历史重演：NLP 领域从 Post-Norm 到 Pre-Norm，本质是时隔几年重走 CV 领域 ResNet-v1→ResNet-v2 的路。

### 2. Softmax：概率归一化的数学与工程

**核心原理**：将任意实数 Logits 转化为总和为 1 的概率分布，同时放大差异。通过指数函数 eˣ 同时实现去负数（非负性）、求比例（归一化）、放大差距（赢家通吃）、平滑可导（导数即自身）四重目标。

**Safe Softmax（-M 平移）**：减去最大值 M 防止 eˣ 上溢。数学上结果不变（Softmax 只关心相对差值），工程上最大项变成 e⁰=1，彻底解决溢出。

**缩放机制（÷√dₖ）**：点积结果的方差随维度 dₖ 线性膨胀（Var(Q·K) = dₖ），导致 Softmax 从"Soft"退化到"Hard"（梯度消失）。除以 √dₖ 将 Logits 方差缩放回 1，锁定在 Softmax 梯度最饱满的舒适区。基于理想统计假设（Q/K 独立、均值 0、方差 1），虽在真实网络中不严格成立，但初始化第一步稳住量级后，网络参数更新会自适应。

**权重初始化**：Q/K 权重初始化要求均值 0（阻断上一层偏置传递）和方差 1/dₖ（保持前向方差一致）。实际代码中 std=0.02 是经验值，量级对了就行。残差出口层（o_proj、down_proj）额外除以 √(2×num_layers) 防止 160 个残差支流累加引发方差爆炸（GPT-2 论文）。

### 3. Causal Mask 与 Online Softmax

**Causal Mask 原理**：对 j>i 位置的 Logit 加 -∞（FP16 下用 -65504），Softmax 后未来 Token 权重归零。

**FlashAttention 的块稀疏优化**：不再生成全局 N×N 掩码矩阵，而是在 Tile 调度层面分类处理——对角线上方 Block 完全跳过（砍掉一半计算量和访存量），对角线下方 Block 正常计算，横跨对角线 Block 才实时判定并写入 -∞。Causal Mask 只在训练和 Prefill 阶段生效，Decode 阶段 Query 长度=1 且所有 Key 都是历史，无需显式掩码。

**Online Softmax**：打破 Softmax 的 3 Pass 全局数据依赖（找最大值→算分母→算结果），通过维护 Running Max 和 Running Sum，在读入新块时用动态缩放因子 exp(m_old - m_new) 修正旧结果，实现 1 Pass 流式计算。

**FlashAttention 将此推广到整条 Attention 流水线**：对每个 Q tile，沿 K/V 方向一次融合遍历同时完成 S=QKᵀ、Online Softmax、O=PV 三件事，中间矩阵 S/P 始终活在寄存器中不写回 HBM。

**FlashAttention v1→v4 进化逻辑**：
- FA1：外 KV 内 Q，并行度不足（Grid 仅 batch×heads），Q 状态需多次 HBM round-trip。
- FA2：外 Q 内 KV，Grid 加入 seqlen_q 维度提升并行度，Q 状态长驻 Warp 物理寄存器，O 只在最后写回一次 HBM。依赖 GPU L2 cache 降低 KV 重复读取（脆弱——长上下文可能挤出 L2）。
- FA3（Hopper SM90）：引入 WGMMA 指令、TMA 异步传输、Warp-Group 专门化（Producer/Consumer），GEMM 间流水线重叠。
- FA4（Blackwell SM100/110）：tcgen05.mma 指令、TMEM 张量内存、Warp 级专门化（逻辑 5 职/物理 6 组）、多级微架构流水线（Q 双缓冲 ∥ Softmax 双 warp 组并行 ∥ split_P 早到机制 ∥ Correction warp 异步修正）。

**LSE（Log-Sum-Exp）的关键作用**：通过数学恒等代换 Softmax(zᵢ) = e^(zᵢ - LSE)，将 2 个 FP32 变量（m, ℓ）压缩为 1 个 FP32 标量（LSE）。支撑三大核心机制：反向传播时 P 矩阵精准重算（化除法为减法）、Flash-Decoding 的 Split-K 局部归约合并、Sequence Parallelism 中 Ring Attention 的 KV 传输与计算重叠。

### 4. Sampling：从 Multinomial 到 Gumbel-Max 的统一

**Temperature 控制**：T→0 放大差异（确定性高），T→∞ 缩小差异（创造性高）。

**Multinomial Sampling 的 GPU 瓶颈**：需要对 128K-256K 词表算前缀和（Cumulative Sum），极度不利于 GPU 并行，存在显存同步开销。

**Gumbel-Max Trick**：给每个对数概率加标准 Gumbel 噪声后取 argmax，数学上等价于 Multinomial Sampling。vLLM 实现为 `probs.div_(q).argmax()`，其中 q~Exp(1)。数学推导：argmax(p/q) = argmax(ln(p/q)) = argmax(ln p - ln q) = argmax(logit + Gumbel noise)。

**Infra 价值**：将串行前缀和转化为完全独立的 element-wise 并行运算（指数分布生成→除法→argmax），消灭分支发散。在张量并行场景下，采样退化为满足结合律的 reduce 运算——每张卡本地算局部最大值及索引，All-Reduce(MAX with index) 拿到全局结果，通信量从 O(V) 降到 O(world_size)。

### 5. 四个操作符的对比总结

| 操作符 | 核心作用 | 作用位置 | 生命周期 | 针对维度 |
|--------|---------|---------|---------|---------|
| -M（减最大值） | 防止浮点上溢（NaN）→ safe | 所有 Softmax | 训练+推理 | 硬件物理限制 |
| Mask（上三角 -∞） | 因果掩码 | 仅 Attention | 训练+推理（仅 Prefill） | 序列长度 |
| ÷√dₖ（缩放因子） | 防止梯度消失 → soft | 仅 Attention | 训练+推理 | 隐藏层维度 dₖ |
| Temperature | 控制生成多样性 → soft | 仅 Sampling | 仅推理 | 词表大小 V |
| Online Softmax 动态缩放 | 打破全局依赖，3 Pass→1 Pass | CUDA/Triton Kernel | 训练+推理 | Block Tile |
| ÷q（Gumbel 噪声） | 消除前缀和串行依赖 | 仅 Sampling | 仅推理 | 词表大小 V |

### 6. 附录亮点

**常数 e 的由来**：雅各布·伯努利 1683 年研究复利极限发现 lim(1+1/n)ⁿ = e ≈ 2.71828。欧拉正式命名并证明为无理数，发现泰勒级数 e = Σ(1/n!)。e 的核心性质：eˣ 的导数等于自身，统治所有自然连续增长与衰退。

**SFU 硬件瓶颈**：GPU 中 SFU（特殊函数单元）数量远少于常规 ALU（Hopper/Blackwell 每 SM 仅 16 个 SFU vs 128 个 FP32 单元）。FlashAttention 提升算术强度后，Softmax 的 exp 计算耗时竟逼近矩阵乘法。FA4 采取软硬协同分流：75-90% 用硬件 SFU，10-25% 用 ALU 多项式逼近模拟，让 SFU 和 ALU 首次在超越函数计算上实现完美并行。

**RoPE cos_sin_cache**：sin/cos 是超越函数，SFU 吞吐仅为 FP32 ALU 的 1/4。vLLM 在引擎初始化时预计算 cos_sin_cache（几 MB 到几十 MB），RoPE kernel 运行时按位置索引查表，本质是空间换时间/访存换算力。

## 核心金句

1. "Infra 优化，本质上就是在用数学上的等价变换，或者对精度的适度妥协，去换取更高的硬件利用率和极致的推理速度。"
2. "大模型本身就是基于科学假设的实验科学。试错的速度，往往决定了模型进化的速度。"
3. "别那么认真，你就说实验效果变没变好吧，毕竟大模型本身就是个实验科学。"（论 √dₖ 缩放的理论近似）
4. "历史总是惊人的相似。错误也在一直重复。大模型从 Post-Norm 演进到 Pre-Norm，本质上就是 NLP 领域在时隔几年后，重新把 CV 领域 ResNet-v1 升级到 ResNet-v2 的路，又走了一遍。"
5. "π 统治了圆和周期，而 e 统治了所有自然的、连续的增长与衰退。"

## 实践启示

1. **RMSNorm 优于 LayerNorm 的本质**：不是数学上更优，而是砍掉均值计算后打破了数据依赖，使 Kernel 融合更丝滑。工程效率驱动架构选择。
2. **Pre-Norm 的 trade-off**：用前向传播的表征坍塌换取反向传播的梯度稳定。理解这个 trade-off 才能理解为什么砍掉最后几层影响不大，以及为什么 DeepNorm 没有被广泛采用。
3. **Gumbel-Max 是采样统一的优雅解**：将贪心和随机采样统一为 argmax，消灭分支发散；在 TP 场景下通信量从 O(V) 降到 O(world_size)。
4. **LSE 是 FlashAttention 空间压缩的基石**：一个标量替代两个标量，看似微小，但在反向传播重计算、Split-K 归约、Sequence Parallelism 三个关键路径上都产生质变。
5. **SFU 正在成为新瓶颈**：Tensor Core 算力翻倍但 SFU 未同步扩展，FA4 的软硬协同分流（SFU+ALU 混合计算 exp）是未来趋势。

## 相关页面

- [AI Infra 入门：vLLM 推理管线](/ch01-865-ai-infra-入门干货总结-大模型是如何高效推理的/) — 同作者同系列第一篇
- 模型推理对比
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ai-infra-math-foundations-rmsnorm-softmax-causal-mask-sampling-binnnliu-2026-06-17.md)

## 相关实体

- MOC

---

