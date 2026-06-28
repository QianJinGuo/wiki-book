## Ch16.010 SGLang

> 📊 Level ⭐⭐ | 4.4KB | `entities/sglang.md`

## 概述
SGLang 是一个开源的大语言模型推理服务框架，由 UC Berkeley、CMU、 Stability AI 等机构联合开发（LMSYS 团队主导）。本次 GLM-5 的 BugFix #2（HiCache 加载时序修复）已通过 Pull Request #22811 提交至 SGLang 社区。

## 核心贡献
- **LayerSplit**：智谱提出的 KV Cache 分层存储方案，针对 Coding Agent 长上下文、高 Prefix Cache 命中率场景，通过每张 GPU 仅持有部分层的 KV Cache，显著降低单卡显存占用
- **HiCache**：多级 KV Cache 优化，通过 Load Stream 与 Forward Stream 重叠执行提高吞吐

## 深度分析
SGLang作为UC Berkeley/CMU/Stability AI联合开发的LLM推理框架，其核心价值在于为长上下文、高吞吐量场景提供生产级的KV Cache分层优化方案，与vLLM形成互补而非替代关系。
**1. LayerSplit（智谱提出）的核心洞察是：Coding Agent场景下，Prefix Cache的命中率在工具调用和系统提示词中天然很高，但不同层对KV Cache的需求强度不同。** 传统方案让每张GPU持有完整的所有层的KV Cache，导致显存浪费。LayerSplit的解法是让每张GPU仅持有部分层的KV Cache（如GPU0持有1-32层、GPU1持有33-64层），推理时按需召唤缺失层的计算结果。这本质上是模型并行与KV Cache复用的联合优化——在Coding Agent场景下，由于工具调用模式的高度重复性，跨层复用效果显著。
**2. HiCache的多级KV Cache策略是SGLang在高并发推理场景下的关键差异化能力。** Load Stream（前缀加载）与Forward Stream（实际推理）重叠执行，使得前缀复用不阻塞推理吞吐。这对多用户并发的Agent系统特别重要——每个用户的工具调用历史构成前缀，多用户前缀的并发加载不会形成瓶颈。
**3. SGLang与vLLM的关系是互补而非竞争。** vLLM的核心优势在于PagedAttention的显存管理和连续批处理，适合高吞吐的单请求场景；SGLang在需要复杂状态管理（多轮对话、工具调用链）、长上下文Prefix Cache复用、多级调度的工作流场景中更具优势。实际部署中，两者经常共存于同一系统的不同时刻（vLLM处理突发请求、SGLang处理复杂Agent工作流）。

## 实践启示
**对于LLM推理架构师：** 在设计推理系统时，不要默认vLLM是唯一选择。对于Agent工作流系统（SWE Agent、多轮对话、复杂工具调用链），SGLang的分层KV Cache和前缀复用能力可能带来显著的性能收益。建议用真实工作流trace评估两者在实际场景下的端到端延迟和显存利用率。
**对于Coding Agent开发者：** Coding Agent场景天然适合LayerSplit策略——因为工具调用的系统提示词和工具Schema高度重复，且代码补全任务的上下文窗口通常很大。按层分配KV Cache可以让单卡容纳更大的上下文，显著降低多卡推理的显存占用。
**对于云厂商和大模型团队：** HiCache的Load Stream/Forward Stream重叠设计可以与模型并行策略深度结合——在多模态推理（Visual Encoder + LLM）或MoE架构中，前缀加载与推理的重叠效果可能更加显著，因为这些场景的初始化开销更大。

## 相关页面
[GLM-5 Scaling Pain 推理复盘](ch09-120-ai-coding-agent-token.html) — 包含 HiCache BugFix #2 的详细分析
[原始存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/glm5-scaling-pain-inference.md)

---
