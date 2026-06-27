# Recent Developments in LLM Architectures: KV Sharing, mHC, and Compressed Attention

## Ch01.417 Recent Developments in LLM Architectures: KV Sharing, mHC, and Compressed Attention

> 📊 Level ⭐⭐ | 8.8KB | `entities/recent-developments-in-llm-architectures-kv-sharing-mhc-and-compressed-attention.md`

## 核心主题
2026年4-5月推出的主要开源权重模型（Gemma 4、Laguna XS.2、ZAYA1-8B、DeepSeek V4）共同指向一个核心趋势：**长上下文效率优化**。随着推理模型和 Agent 工作流需要保留更多 token，KV-cache 大小、内存带宽和注意力计算成本成为主要瓶颈，各大厂商纷纷引入架构层面的 trick 来降低这些成本。

## 主要模型架构分析
### Gemma 4：KV Sharing + PLE
Gemma 4 E2B/E4B 引入两项效率优化：
**Cross-Layer KV Sharing（跨层 KV 共享）**：后续层复用前面层的 key-value 状态，而非每层独立计算 K/V 投影。E2B 共35层，前15层独立计算 KV，后20层复用；E4B 共42层，前24层独立计算，后18层共享。该设计可将 128K 上下文下的 KV cache 内存减少约一半（E2B 节省 2.7GB，E4B 节省 6GB）。代价是模型容量略有降低，但对小模型影响较小。
**Per-Layer Embeddings（PLE，每层嵌入）**：Gemma 4 E2B 标称 2.3B 有效参数，实际含嵌入层共 5.1B；E4B 标称 4.5B，实际含嵌入层共 8B。PLE 在注意力/FFN 主路径之后增加一层专属的 token 向量，通过门控机制添加到残差路径中，以低成本增加表征容量，而不扩大整个 transformer 堆栈的参数量。

### Laguna XS.2：Layer-wise Attention Budgeting
Poolside 推出的 Laguna XS.2 共40层，其中30层为滑动窗口注意力（512 tokens window）、10层为全局注意力。核心创新在于**每层差异化 Query Head 数量**：滑动窗口层每 KV head 配 8 个 Q head，全局层每 KV head 配 6 个 Q head（KV head 固定为8个）。全局注意力成本更高（需看到完整上下文），因此分配更少的 Query Head 以节省计算。

### ZAYA1-8B：Compressed Convolutional Attention (CCA)
ZAYA1-8B 采用 CCA + 4:1 GQA 布局。与 MLA（压缩 K/V 表示但每 token 保留一条 latent entry）不同，CCA 直接在压缩后的 latent 空间执行注意力计算，同时在压缩后的 Q、K 上应用卷积混合（convolution mixing），为压缩后的向量注入局部上下文信息。优势在于不仅减少 KV cache，还减少 prefill 和训练阶段的注意力 FLOPs。实验表明 CCA 在相同压缩比下性能优于 MLA。

### DeepSeek V4：mHC + CSA/HCA
DeepSeek V4 引入两大架构变化：
**mHC（Manifold-Constrained Hyper-Connections）**：基于 Hyper-Connections（将单一残差流扩展为多条并行残差流 + 线性映射），mHC 对残差映射施加流行约束——投影到双随机矩阵空间（非负、行列和为1），使信息跨流重分布更加稳定。4路残差流（n=4）仅增加 6.7% 训练时间开销。mHC 改善了残差路径的信息流动效率，与注意力侧的 CSA/HCA 形成互补。
**CSA/HCA（Compressed Sparse Attention / Heavily Compressed Attention）**：与 MLA（压缩每 token 的 KV 表示但保留每 token 一条 entry）不同，CSA/HCA 在**序列维度**上压缩。CSA 以 m=4 的压缩率 + DSA 风格 top-k 选择；HCA 以 m'=128 的重度压缩，然后对高度压缩后的 entries 执行密集注意力。两者均保留最近128 tokens 的滑动窗口分支。DeepSeek V4-Flash 在 1M token 上下文下仅需 DeepSeek V3.2 的 10% FLOPs 和 7% KV cache。

## 深度分析
### 长上下文效率：架构演进的主轴
2026年春季的这批开源模型释放了一个明确信号：LLM 架构设计进入"效率优先"阶段。GQA（Grouped Query Attention）作为经典方案已被普遍采用，而新一代方案则从不同维度进一步压缩：
| 优化维度 | 技术方案 | 代表模型 |
|---------|---------|---------|
| KV cache 跨层共享 | Cross-Layer Attention | Gemma 4 |
| 参数量感知的 Embedding 扩展 | PLE | Gemma 4 |
| 每层注意力预算差异化 | Layer-wise Q Head Budgeting | Laguna XS.2 |
| 注意力计算压缩 | CCA（Latent Space Attention） | ZAYA1-8B |
| 序列维度压缩 | CSA/HCA | DeepSeek V4 |

### 压缩范式的本质区别
两代压缩技术有本质差异：

- **MLA 系列**：压缩的是每条 entry 的表示维度（per-token latent representation），KV cache 长度不变、宽度收窄
- **CSA/HCA 系列**：压缩的是序列长度本身，多个 token 被合并为一个压缩 entry
DeepSeek V4 的 CSA/HCA 代价更高（丢失 token 级细节），但通过 CSA（轻压缩+稀疏选择）和 HCA（重压缩+密集注意力）的交替使用，在效率和建模质量间取得平衡。 See also [Context Window Management](/ch04-149-agent-上下文窗口管理对比//)

### mHC 的意义：从"注意力改造"到"残差流改造"
大多数架构改进聚焦于注意力机制（MQA→GQA→MLA→DSA→CCA）或 MoE 路由，而 mHC 首次在生产级大模型中验证了"残差路径宽化"的价值。传统观点认为残差连接已足够高效，但 mHC 证明通过多条并行残差流 + 约束性映射，可以在几乎不增加 FLOPs 的前提下提升信息流动性。这与 CSA/HCA 在注意力侧的优化形成正交互补。

### 复杂度 vs 效率的权衡
这些优化显著增加了实现复杂度。基本 transformer block 可用约50-100行 PyTorch 实现，而当前这些注意力变体的组合实现可能10倍于此。但这是有意义的复杂——每个优化都在**降低运行时成本**，而非增加功能。架构演进的方向是让相同的定稿模型在推理时消耗更少资源，同时保持建模质量。

## 实践启示
### 对模型选择的影响
当需要**超长上下文**（>128K）应用时，DeepSeek V4 的 CSA/HCA 架构提供了最激进的效率收益（1M token 下 FLOPs 降至10%）。但需要注意，这是以更复杂的实现和潜在的 token 级细节丢失为代价的。对于中等上下文长度（32K-128K），Gemma 4 的 KV 共享方案在实现复杂度与效率收益间有更好的平衡。

### 对 Agent 系统设计的启发
Agent 工作流通常需要长时间记忆和上下文窗口。架构层面的 KV cache 优化直接降低了长程推理的成本。这意味着：

- 未来 Agent 系统可以更激进地保留更多对话历史
- 滑动窗口 + 全局注意力分层设计（如 Laguna XS.2）适合"近期上下文高分辨率、远期上下文低分辨率"的 Agent 记忆模式

### 对自研模型的建议
1. **小模型（<10B）**：优先考虑 KV 共享和 PLE，可在小参数预算下获得更高有效容量
2. **长上下文场景**：关注 CSA/HCA 或类似序列压缩方案，但要预留足够测试验证压缩率对任务的影响
3. **资源受限部署**：ZAYA1-8B 的 CCA 方案值得关注，它同时压缩了计算和缓存

### 警惕点
这些架构优化大多有隐含代价：KV 共享降低模型容量、CSA/HCA 丢失 token 级精度、mHC 增加实现复杂度。在生产环境中引入前，建议：

- 评估压缩导致的精度损失是否在业务可接受范围
- 确认硬件和框架对这些注意力变体的支持程度
- 预留足够的基准测试和 A/B 对比实验
---
> [!contradiction] 相关矛盾
> - MLA、DSA、GQA 等注意力变体的详细解释可参考各模型官方技术报告

## 相关实体

- MOC

---

