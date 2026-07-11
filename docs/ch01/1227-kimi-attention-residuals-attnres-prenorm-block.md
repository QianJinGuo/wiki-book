# Kimi Attention Residuals（AttnRes）— PreNorm 稀释问题与 Block 折中方案

## Ch01.1227 Kimi Attention Residuals（AttnRes）— PreNorm 稀释问题与 Block 折中方案

> 📊 Level ⭐⭐⭐ | 7.7KB | `entities/kimi-attention-residuals-preNorm-dilution-block-attnres.md`

## 一句话总结
Kimi 提出 Attention Residuals 机制：用注意力机制让每层自己选择关注哪些前驱层，替代残差连接的固定等权累加，解决 PreNorm 稀释问题，实现 **1.25x 算力节省**，48B 模型 12 个 benchmark 全部提升。
---

## 核心洞察
### 问题：PreNorm 稀释
传统残差连接将前面所有层输出**等权相加**，导致：

- 后面层无法选择性调用前层信息（只能接收"一锅乱炖"）
- 层越深，贡献越被稀释，大量层形同虚设
- 各层梯度分布极不均匀

### 解法：AttnRes
让每层有一个专属小向量，用注意力机制计算对前驱层的关注权重，**按需加权求和**：

- 注意力层和 MLP 层可关注不同历史层
- 早期层信息不会被淹没，可按需取用
- 参数量增加可忽略不计

### 工程折中：Block AttnRes
存储量从 O(N) → O(N/block_size)。**分成约 8 块**即可恢复绝大部分效果，推理延迟增加 <2%。
---

## 关键数据
| 指标 | 数据 |
|------|------|
| 算力节省 | 同等性能 = 0.8x 算力（多训练 1.25x） |
| GPQA-Diamond 提升 | +7.5 分 |
| Math 提升 | +3.6 分 |
| HumanEval 提升 | +3.1 分 |
| benchmark 跌分 | 0（12 个全部提升） |
| 推理延迟增加 | <2% |
---

## 技术要点
1. **残差连接的问题被长期忽视**：2015 年至今几乎无根本性改动
2. **注意力机制的新应用**：不是关注哪些词，而是关注哪些层
3. **Block 折中是工程关键**：既保效果又降开销
4. **多步推理任务受益最大**：后层可选择调用早期层中间结果
5. **各层梯度分布更均匀**：每层都在被有效训练
---

## 深度分析
### PreNorm 稀释的数学本质
PreNorm（Pre-Layer Normalization）架构中，每层输出为：
```
output = Norm(x + F(x))
```
其中 x 是上一层输出（即前面所有层累加后的混合表示）。当网络深度增加时，x 携带的历史信息呈指数混合状态，后层对特定前层信号的感知能力被稀释。从梯度视角看，早期层承担了整个网络的信息压缩任务，接收到的梯度信号被后期层的等权累加所稀释，导致各层训练信号极不均匀。

### AttnRes 的选择性路由机制
AttnRes 将传统等权累加替换为注意力加权：
```
AttnRes(x_0, x_1, ..., x_n) = Σ_i softmax(q_k · k_i) · v_i
```
每层有一个专属 query 向量，去 query 所有前驱层的 key，产生注意力权重后加权求和。与传统注意力不同，这里关注的是**层**而非 token——模型学会了对哪些层的输出感兴趣，而非对哪些词的位置感兴趣。
值得注意的是，注意力层和 MLP 层各自有独立的 query 向量，可关注不同的历史层。Kimi 可视化结果显示，MLP 层更关注近邻层，注意力层的感受野更宽，这种分工是模型自己学出来的。

### Block 折中的边界效益分析
Full AttnRes 需要存储所有前驱层输出用于注意力计算，对 N 层模型存储量为 O(N)，跨 block 通信量也为 O(N)。Block AttnRes 将 N 层划分为 B 个 block，每个 block 内部保留传统残差累加（O(1) 存储），block 输出压缩为一个向量存于块边界。
Kim i的实验表明，块数从 1（相当于 baseline）增加到 8 时，效果快速提升；超过 8 块后，边际收益急剧减小。这说明大多数层的跨块信息需求可以用约 8 个 block 满足——这是一个工程意义上接近最优的离散选择。

### 与既有工作的对比
- **RevNet**：通过可逆操作减少内存，但不改变累加方式，等权问题未解
- **Highway Network / LSTM**：门控机制选择跳过哪些层，但门控是标量，表达能力有限
- **AttnRes**：用注意力（向量运算）做路由选择，表达能力更强，且对既有架构改动最小
---

## 实践启示
1. **优先在多步推理场景使用**：数学推理、代码生成、科学问答等任务受益最显著，知识密集型任务也有稳定提升但幅度较小。当模型需要"回溯"早期层的中间结果时，AttnRes 的价值最大。
2. **块数选取建议**：从 8 块开始尝试，这是 Kimi 实验中效果与开销的最佳平衡点。如果模型层数较少（如 < 20 层），可以尝试更小的 block_size（即更多块）；如果层数极多（如 > 100 层），8 块仍可能最优。
3. **直接替换残差连接即可**：AttnRes 不依赖任何架构改动，可直接替代现有残差连接。训练 pipeline 无需调整，只需在每层前驱输出处插入注意力路由计算。
4. **对训练效率和模型质量的双重收益**：在同等算力预算下，可训练 1.25x 更多 tokens；在同等 tokens 预算下，12 个 benchmark 全部提升。这意味着无论你是算力受限还是数据受限，AttnRes 都是高优先级尝试的优化。
5. **实现时注意通信开销**：训练场景下跨流水线并行的通信量仍需关注，Block 折中是必需项而非可选项。优先确保 block 划分不会破坏流水线并行的均衡性。
6. **开源可用**：代码已开源（MoonshotAI/Attention-Residuals），有预训练实现可参考，降低了复现门槛。
---

## 与既有知识库内容的互补
- 补充了  中注意力机制在跨层信息路由方向的新进展
- 为  中残差连接提供工程优化视角
- 为 Scaling Law 研究（）提供新的训练效率维度
## 相关实体
- [Agent Reliability Context Drift Tool Hallucination](../ch03/045-agent.html)
- [How Llms Actually Work 0Xkato](ch01/1217-how-llms-actually-work-0xkato-transformer-walkthrough.html)
- [Ai Employment Eight Changes Tencent Research](../ch05/082-ai.html)
- [Kimi K2 6 Tidb Agent Database](../ch03/045-agent.html)
- [Hermes Agent K2 6 Tutorial](../ch03/090-hermes-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/kimi-attention-residuals-preNorm-dilution-block-attnres.md)

---

