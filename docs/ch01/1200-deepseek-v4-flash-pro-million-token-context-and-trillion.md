# DeepSeek V4 Flash & Pro: Million-Token Context and Trillion-Parameter Inference

## Ch01.1200 DeepSeek V4 Flash & Pro: Million-Token Context and Trillion-Parameter Inference

> 📊 Level ⭐⭐⭐ | 13.5KB | `entities/deepseek-v4-flash-pro-通往百万级上下文与万亿参数推理的新纪元-v2.md`

# DeepSeek V4 Flash & Pro: Million-Token Context and Trillion-Parameter Inference

## 相关实体

- [pithtrain：陈天奇 + cmu flame center 推出的 agent-native moe 训练框架（1](../ch03/046-agent.html)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/deepseek-v4-flash-pro-通往百万级上下文与万亿参数推理的新纪元-v2.md)

## 摘要

DeepSeek 实验室于 2026-04-24 发布第四代旗舰模型 DeepSeek V4，包含 V4-Pro（极致推理/长文本）与 V4-Flash（高吞吐/低延迟）两个版本。V4 通过混合注意力架构（CSA + HCA）、流形约束超连接（mHC）、Muon 优化器三项架构创新，将 1M tokens 上下文窗口推入标准化生产阶段；在保持/超越硅谷闭源模型性能的同时实现推理成本数量级下降。V4-Pro 总参 1.6T（激活 49B），V4-Flash 总参 284B（激活 13B），均支持 FP4 + FP8 混合精度。

## 核心要点

- **双版本策略**：V4-Pro（1.6T/49B 激活，深度推理/智能体编码/长文本）vs V4-Flash（284B/13B 激活，高速响应/RAG 路由）
- **混合注意力架构**：CSA（压缩稀疏注意力）+ HCA（极度压缩注意力）协同，1M token 下 FLOPs 仅 V3.2 的 27%、KV 缓存显存仅 10%
- **流形约束超连接（mHC）**：将层间权重约束在黎曼流形上，万亿规模训练中信号放大从无约束的 3000x 降到 2x 以内
- **Muon 优化器**：梯度正交化的二阶优化器，比 AdamW 收敛更快、泛化更好
- **1M token 上下文生产化**：14.8T tokens 预训练全程零崩溃，标准化生产 1M 上下文
- **本地部署门槛**：V4-Pro FP8 约 865GB 权重 + 10GB KV 缓存；V4-Flash FP8 约 284GB；INT4 Q4 量化门槛可降至 4x H200
- **运行时要求**：Ubuntu 22.04/24.04，CUDA 12.6+，Python 3.11+，vLLM ≥0.20.0，transformers ≥4.51.1
- **基准表现**：LiveCodeBench Pass@1 93.5%（超过 Claude 4.6/4.7 估值的 88.8%），SWE-bench Verified 80.6% 与 Claude 旗鼓相当
- **自适应思维模式**：Thinking Mode 通过 extra_body 参数控制，可显著降低长任务错误率

## 深度分析

### 1. 混合注意力机制：CSA + HCA 的双层压缩哲学

DeepSeek V4 的核心架构创新在于**对超长上下文 KV 缓存的两层压缩**：

**CSA（Compressed Sparse Attention）**：
- 在 token 级别对 KV 条目做动态序列压缩，降低显存占用
- 接着用 DSA（DeepSeek Sparse Attention）对注意力矩阵做稀疏化
- 把"密集注意力"变成"压缩后再稀疏"的混合形态

**HCA（Heavily Compressed Attention）**：
- 针对超长距离上下文，把 KV 缓存以 **128:1 的比例**压缩为稠密的 MQA（Multi-Query Attention）流
- 同时保留一个 **128 token 的滑动窗口**维持近期依赖
- 模拟人类大脑记忆系统：即时工作记忆（滑动窗口）+ 长期记忆（高度压缩的语义摘要）

这种设计的哲学意义在于：**承认了不同距离的注意力需求是不同的**——近期 token 需要细粒度，远期 token 只需要语义摘要。V4 把这种直觉变成了工程实现。

**实际效果（1M token 场景）**：
- 单 token 推理 FLOPs：V3.2 的 27%
- KV 缓存显存：V3.2 的 10%
- 意味着同等硬件可处理 10x 上下文

### 2. mHC：万亿规模训练的稳定性保障

当模型参数量达到 1.6T 时，传统残差连接的稳定性问题被指数级放大：

- **信号衰减**：跨数百层传播时梯度/信号被稀释
- **信号爆炸**：某些路径出现 3000x 放大，导致 loss spike
- **训练中断**：常见做法是 checkpoint + 回滚，浪费数天 GPU 时间

**流形约束超连接（mHC）**的解法：
- 把层间权重更新约束在**黎曼流形（Riemannian Manifold）**上
- 信号放大从 3000x 降低到 **2x 以内**
- 整个 14.8T tokens 预训练过程**零不可恢复崩溃**

这个数字在超大规模模型训练史上极为罕见。mHC 的真正价值不只是"训练更稳"，而是"解锁了更大规模训练的可能性"——如果信号放大无法控制，万亿参数训练几乎不可能完成。

### 3. Muon 优化器：二阶梯度信息的复兴

Muon（Momentum + Orthogonalization）的核心创新是**梯度正交化**：

- 传统 AdamW 的一阶动量：保留梯度的"方向"
- Muon 的正交化：进一步消除冗余更新方向，让每步更新携带最大新信息

在大规模预训练测试中，Muon 展示了：
- **更快收敛速度**（每步信息增益更高）
- **更好泛化质量**（正交化天然防止过拟合到训练分布）

工程含义：在有限 GPU 时间内，Muon 让 DeepSeek 用更少算力达到 frontier-class 性能。这是 V4 推理成本下降的**算法层面根源**——很多"成本优势"其实是优化器创新的副产品。

### 4. 1M 上下文的工程含义：从"炫耀性参数"到"生产工具"

百万 token 上下文能力是 2026 年 LLM 竞争的关键战场。V4 让 1M context 进入生产级别的关键是**把成本压到了可商用区间**：

- V4-Flash FP8 + INT4 量化：~160GB 显存门槛，可用 8x RTX 4090 部署
- V4-Flash FP8：~284GB，4x H100 / 8x A100
- 1M context 的 KV 缓存：~10GB（仅 V3.2 的 10%）

**应用场景的质变**：
1. **完整代码库作为上下文**：不再需要 RAG 检索，整个 monorepo 直接喂入
2. **法律文书分析**：一次处理几百页合同而非切片
3. **长程 agent 工作流**：跨小时级 session 保留全部上下文
4. **科研文献综合**：一次阅读整篇综述+所有引用

### 5. 基准表现的诚实解读

| 维度 | DeepSeek-V4-Pro | Claude 4.6/4.7 | GPT-5.4/5.5 |
|------|-----------------|----------------|--------------|
| LiveCodeBench Pass@1 | 93.5% | 88.8% | 72.8% (CursorBench) |
| SWE-bench Verified | 80.6% | 80.8% | 80.0% |
| GPQA Diamond | 90.1% | 90.5% | 93.0% |
| MMLU-Pro | 87.5% | 91.0% | 87.5% |
| MRCR 1M Comprehension | 83.5% | N/A | N/A |
| Terminal-Bench 2.0 | 67.9% | 69.4% | 82.7% |
| HMMT 2026 | 95.2% | 96.2% | 97.7% |

**关键观察**：
- 编程能力（LiveCodeBench）上 DeepSeek 已微弱领先 Claude——开源模型首次在编码 benchmark 上超过闭源旗舰
- 智能体编码（SWE-bench）三家已趋同（80% 附近），差距不再显著
- 终端任务（Terminal-Bench）GPT-5.5 仍有优势（82.7% vs 67.9%）
- 数学竞赛 HMMT 与 GPQA 顶级闭源仍领先约 3-7%
- HLE 等专家级通识测试 DeepSeek 仍有约 9% 差距

**结论**：DeepSeek V4 在编程/工程任务上已达到 frontier-class，可与 Claude/GPT-5 在 SWE-bench 上肉搏；但在数学/通识顶尖 benchmark 上仍有差距。开源 ≠ 弱，但开源 ≠ 全胜。

### 6. 部署工程：本地化的真实成本

V4 模型的硬件门槛是工程师最关心的问题。基于显存需求矩阵：

**V4-Flash 本地部署推荐配置**：
- 入门：双 RTX 5090 (32GB) + 4-bit 量化（限制 context 长度）
- 生产：4x H100 (80GB) 或 8x A100 (80GB)，FP8 原生
- 极致压缩：8x RTX 4090 (24GB)，INT4 Q4

**V4-Pro 本地部署推荐配置**：
- 完整 BF16：16-24x H100 (80GB)，约 3.2TB 显存
- FP8 原生：8x H200 或 12x H100
- INT4 Q4：4x H200 或 24x RTX 4090

**KV 缓存的特殊性**：即便架构已大幅压缩，1M context 仍需约 10GB 专用 KV 缓存空间——这是不可逾越的物理下限。

### 7. 思维模式的 API 接入

DeepSeek V4 的最大吸引力之一是**内生的思维模式（Thinking Mode）**：

```python
# OpenAI SDK 兼容
response = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[...],
    extra_body={
        "thinking_mode": True,  # 启用内生思维链
        "thinking_depth": "adaptive"
    }
)
```

在处理复杂智能体工作流时，Thinking Mode 能显著降低错误率——因为模型会在给出最终答案前进行隐性 CoT 推理。

## 实践启示

1. **百万上下文是 2026 年的标准生产工具**：不要再把 1M context 当作 demo 炫技，它已经可以商用——重构你的 RAG 架构，把"完整文档/完整代码库"作为优先选项。
2. **混合注意力是长上下文 LLM 的未来方向**：关注其他厂商（Mistral / Qwen / Llama 4）是否跟进 CSA+HCA 范式；如果都跟进，意味着这条路线已经被验证。
3. **优化器创新比参数增加更具杠杆**：Muon 的成功表明，二阶优化器 / 正交化等"小创新"可能比"再训 1T 参数"更值得投入研究资源。
4. **本地部署 V4-Flash 是 2026 年的 sweet spot**：相比 V4-Pro 的 16x H100 门槛，V4-Flash 在 4x H100 上就能跑——大多数企业的内部 AI 工作流用 Flash 就够了。
5. **开源策略重塑了模型选型逻辑**：DeepSeek V4 让"默认选 Claude/GPT"不再是唯一答案——在编程/工程任务上 V4-Pro 已具备替代能力，且成本低一个数量级。
6. **关注 vLLM 0.20.0+ 生态**：V4 的部署依赖较新的推理框架——选择 vLLM 还是 SGLang 还是 TensorRT-LLM，需要结合你的硬件栈和 latency 要求评估。
7. **思维模式应作为默认开启**：除非是极低延迟要求的场景，否则让 Thinking Mode 默认开启——它对长 agent 任务的错误率改善是显著的。

## 关联实体

- [Ai Infra Llm Efficient Inference Vllm](ch01/1204-ai-infra.html) — LLM 高效推理基础设施综述（vLLM 推荐 0.20.0+）
- [Recent Developments In Llm Architectures Kv Sharing Mhc And Compressed Attention](ch01/045-recent-developments-in-llm-architectures-kv-sharing-mhc-a.html) — LLM 架构最新进展：KV Sharing、mHC 与压缩注意力
- [Deepseek Moe Parallel Strategy](ch01/425-deepseek.html) — DeepSeek MoE 并行策略
- [Msa Sparse Attention Three Kingdoms Huashu](https://github.com/QianJinGuo/wiki/blob/main/entities/msa-sparse-attention-three-kingdoms-huashu.md) — MSA 稀疏注意力（三国华术）
- [Kimi Attention Residuals Prenorm Dilution Block Attnres](https://github.com/QianJinGuo/wiki/blob/main/entities/kimi-attention-residuals-preNorm-dilution-block-attnres.md) — Kimi 注意力残差与 PreNorm 稀释
- [2026 Llm Rl Algorithms Deeplog Imba Ppo Dpo Grpo Marl](ch01/1235-llm.html) — 2026 LLM RL 算法综述（DeepSeek V4 训练方法背景）

---

