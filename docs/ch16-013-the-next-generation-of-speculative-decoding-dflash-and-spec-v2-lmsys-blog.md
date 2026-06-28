## Ch16.013 The next generation of speculative decoding: DFlash and Spec V2 - LMSYS Blog

> 📊 Level ⭐⭐⭐ | 11.1KB | `entities/lmsys-dflash-speculative-decoding-2026-06.md`

# The next generation of speculative decoding: DFlash and Spec V2 - LMSYS Blog

> Source: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/lmsys-dflash-speculative-decoding-2026-06.md)

## 摘要

LMSYS、Modal 与 Z Lab 在 2026 年 6 月联合发布的工程博文，介绍新一代 speculative decoding 方案 **DFlash** 及其在 SGLang 上的 **Spec V2** 引擎集成。核心创新是把"块扩散（block diffusion）"作为 draft 模型架构，并在每一层把目标 LLM 的 KV cache 注入到 draft 模型中——从而在 Qwen 3.5 397B-A17B 上 HumanEval 任务相对基线取得 **>4.3× 吞吐**、相对 MTP 取得 **1.5× 吞吐**。博文包含基准、消融实验和可直接复现的 `sglang.launch_server` 命令。

## 核心要点

1. **DFlash 核心机制** — diffusion 风格 + KV injection 的 speculative decoding 新方案：用一个小型 block diffusion draft 模型并行生成整块 draft token，并把目标 LLM 的 hidden representation 注入到 draft 模型的 KV cache 中。
2. **Qwen 3.5 397B-A17B 部署就绪** — 公开 release 三份 HuggingFace 模型权重（z-lab / modal-labs / lmsys），并提供完整 sglang 启动命令，硬件目标 8×B200。
3. **Spec V2 引擎** — SGLang 全新 speculative decoding 引擎，通过减少 host-device 同步点（overlap scheduling）把推理吞吐再提升 33%+（Qwen 3-8B 单 B200 并发 32 下从 11.4 ktok/s 到 15.3 ktok/s）。
4. **消融实验清晰** — 把 DFlash 的两个组件（diffusion drafting + KV injection）单独消融，分别证明各自对 acceptance length 与端到端加速的贡献。
5. **与现有方案的对比** — 相比 EAGLE-3 5-layer、native MTP（Gemma 4、DeepSeek-V4）在所有 benchmark setting 下吞吐都更高。

## 深度分析

### 背景：为什么 speculative decoding 还值得继续做

Transformer LLM 的自回归解码一次产生一个 token，arithmetic intensity 低，与现代 GPU/TPU 的并行能力不匹配。

经典 speculative decoding 用一个小、快的 draft 模型先提出一批候选 token，再由目标 LLM 并行验证——质量无损（接受/拒绝由目标模型决定），但吞吐大幅提升。

许多主流方案（EAGLE 系列、原生 MTP 模块，如 Gemma 4、DeepSeek-V4）仍然依赖**顺序自回归**，只不过把自回归从目标模型挪到了 draft 模型——draft 模型逐 token 生成的代价同样受限于硬件利用率不高。

### DFlash 的两大组件

Z Lab 的 DFlash（论文 [arXiv:2602.06036](https://arxiv.org/abs/2602.06036)）用**块扩散（block diffusion）draft 模型**一次性并行生成整块 token，更贴合现代硬件的并行能力。小米的 MiMo v2.5-Pro-UltraSpeed 已用 DFlash 达到超过 1k output tps。

但"用块扩散做 drafter"本身不是新想法，过去有两个失败模式：

- 直接训练一个小型块扩散模型作为 drafter → acceptance length 太低。
- 用现成的大块扩散 LLM（如 SpecDiff-2）作为 drafter → 显存太大、draft 成本太高。

DFlash 的关键洞察：**目标 LLM 最懂上下文**。受 Medusa、EAGLE、MTP 启发，从目标模型提取上下文 token 的 hidden representation；区别是不只在 drafter 输入处用，而是**直接注入到 draft 模型的 KV cache 里**。

这样：

- draft 模型不必从零建模完整上下文，只需专注于"预测下一块 token"。
- 可以复用目标模型后几层的张量，draft 模型保持极小且高效。
- 在更高 draft depth 下也能保持高 acceptance length。

### Benchmark：Qwen 3-4B + 5-layer drafter

EAGLE-3 5-layer vs DFlash 5-layer 在相同数据集上训练，端到端结果（`acc_len / speedup`）：

| Task | EAGLE-3 (5 layers) | DFlash |
| --- | --- | --- |
| GSM8K | 4.2 / 2.1× | **4.2 / 3.3×** |
| HumanEval | 4.3 / 2.2× | **4.0 / 3.2×** |
| MT-Bench | 3.1 / 1.4× | **3.0 / 2.2×** |

### 消融 1：diffusion drafting 单独贡献

DFlash 的"diffusion only" 变体（去掉 KV injection，保持块扩散）：

| Task | EAGLE-3 (5 layers) | DFlash (diffusion only) |
| --- | --- | --- |
| GSM8K | 4.2 / 2.1× | **3.5 / 2.9×** |
| HumanEval | 4.3 / 2.2× | **3.5 / 2.9×** |
| MT-Bench | 3.1 / 1.4× | **2.6 / 2.0×** |

DFlash 即使在更低的 acceptance length 下，也比 EAGLE-3 端到端更快——核心来自"drafting cost" 的下降。

### 消融 2：KV injection 单独贡献

DFlash 的"injection only" 变体（去掉 diffusion drafting，回到自回归 drafter）：

| Task | EAGLE-3 (5 layers) | DFlash (injection only) |
| --- | --- | --- |
| GSM8K | 4.2 / 2.1× | **4.8 / 2.4×** |
| HumanEval | 4.3 / 2.2× | **4.6 / 2.3×** |
| MT-Bench | 3.1 / 1.4× | **3.4 / 1.5×** |

证明 KV injection 让 acceptance length 显著提升，且端到端加速更明显。

### 工程实现：DFlash 在 SGLang V1 → V2 的演进

**V1 阶段**（已弃用）：在原 speculative decoding 引擎里新增 `DFlashWorker` 与 `DFlashDraftModel`，并支持跨 draft/target 的 KV cache 集成。

SGLang 的 scheduler（运行在 host 上）调度 worker（运行在加速器上）。注意一个反直觉点：**draft 模型 worker 才是与 scheduler 对话的一方**（通过 `.forward_batch_generation` 等方法），它包装目标模型 worker 用于验证步骤。

KV injection 的工程难点：

- 不想存储那些 latents（占用 KV cache 空间）。
- 想让共享 prefix 的请求共用 radix cache。
- 因此在 draft forward pass 主体之前做"立即物化"——加一层 batched 线性 projection + 融合的 Triton kernel 处理 norm + RoPE。

**V2 阶段**：在 V2 speculative decoding 引擎里集成 DFlash，关键目标是减少 host-device 同步点。两个核心 overlap 机会：

1. host 端 `pop_and_process`（N-1 批的 stop token 检测、metadata 更新）与 GPU 上 N 批工作重叠。
2. host 端 `prepare_for_decode` 里 N 批的 KV allocation 与 GPU 上 N-1 批工作重叠。

效果：Qwen 3-8B 单 B200 并发 32 下从 ~11.4 ktok/s 提升到 ~15.3 ktok/s（+33%）。

### Headline 数字：Qwen 3.5 397B-A17B on 8×B200

- HumanEval concurrency 1：**>4.3×** baseline，**1.5×** MTP。
- 在所有 benchmark setting（GSM8K / HumanEval / MT-Bench，concurrency 1-32）下都比 baseline 与 native MTP 吞吐更高。

### 复现路径

```
export SGLANG_ENABLE_OVERLAP_PLAN_STREAM=1
python -m sglang.launch_server \
  --model-path Qwen/Qwen3.5-397B-A17B \
  --trust-remote-code \
  --speculative-algorithm DFLASH \
  --speculative-draft-model-path modal-labs/Qwen3.5-397B-A17B-DFlash \
  --speculative-dflash-block-size 8 \
  --speculative-draft-attention-backend fa4 \
  --attention-backend trtllm_mha \
  --linear-attn-prefill-backend triton \
  --linear-attn-decode-backend flashinfer \
  --mamba-scheduler-strategy extra_buffer \
  --tp-size 8 \
  --max-running-requests 32 \
  --cuda-graph-max-bs-decode 32 \
  --cuda-graph-backend-prefill tc_piecewise \
  --enable-flashinfer-allreduce-fusion \
  --mem-fraction-static 0.8 \
  --host 0.0.0.0
```

draft 模型权重三处 release：`z-lab/Qwen3.5-397B-A17B-DFlash`、`modal-labs/Qwen3.5-397B-A17B-DFlash`、`lmsys/Qwen3.5-397B-A17B-DFlash`。

### 致谢

- **Z Lab**：Jian Chen, Yesheng Liang, Zhijian Liu
- **Modal**：David Wang, Charles Frye
- **SGLang**：Qiaolin Yu, Liangsheng Yin, Khoa Pham

## 与现有实体的差异化

- 这是 LMSYS 2026-06 的最新 speculative decoding 技术博客，与现有 speculative decoding 相关实体（如 EAGLE、MEDUSA 早期工作）相比，时间新且含实证 benchmark
- vLLM 集成路径明确，可直接复现
- DFlash 是 block diffusion + KV injection 的组合创新，比单纯沿用 Medusa/EAGLE 风格的 next-token head 路线更进一步

## 实践启示

- 评估 LLM 推理加速方案时，DFlash + vLLM 是 2026 年值得测试的 baseline 之一
- 关注 LMSYS blog 系列作为 speculative decoding 进展的可靠信号源
- 如果你已经在用 EAGLE 或 MTP，遇到 acceptance length 瓶颈时可以考虑 DFlash 的 KV injection 思路（即使不上 block diffusion 也能拿到显著的 acceptance 提升）
- SGLang Spec V2 的 overlap scheduling 思路（host-device 重叠）值得借鉴到其他推理引擎的设计中

## 原文链接

- [https://www.lmsys.org/blog/2026-06-15-next-generation-speculative-decoding-dflash-v2/](https://www.lmsys.org/blog/2026-06-15-next-generation-speculative-decoding-dflash-v2/)

## 相关实体

- [automation anywhere collaborates with cisco, nvidia, okta, a](ch04-013-automation-anywhere-collaborates-with-cisco-nvidia-okta-a.html)
- [ettin reranker family](ch01-374-introducing-the-ettin-reranker-family.html)
- [mathematical optimization at enterprise scale: aws innovatio](ch11-060-mathematical-optimization-at-enterprise-scale-aws-innovatio.html)
- [DDoSing Software Delivery Pipelines](/ch14-data/)
- [AI GPUs probably live longer than three years](ch01-044-recent-developments-in-llm-architectures-kv-sharing-mhc-a.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/lmsys-dflash-speculative-decoding-2026-06.md)

---
