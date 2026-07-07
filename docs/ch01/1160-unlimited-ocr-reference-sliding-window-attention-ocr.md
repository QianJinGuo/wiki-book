# 百度提出 Unlimited OCR：用 Reference Sliding Window Attention 实现长文档 OCR 常量 KV Cache

## Ch01.1160 百度提出 Unlimited OCR：用 Reference Sliding Window Attention 实现长文档 OCR 常量 KV Cache

> 📊 Level ⭐⭐⭐ | 9.3KB | `entities/baidu-unlimited-ocr-sliding-window-attention.md`

# 百度提出 Unlimited OCR：用 Reference Sliding Window Attention 实现长文档 OCR 常量 KV Cache

## 摘要

百度提出的 Unlimited OCR 通过 **Reference Sliding Window Attention（R-SWA）** 替代 DeepSeek-OCR 解码器中的标准注意力机制，使长文档 OCR 的 KV cache 从随输出长度线性增长降为常量。R-SWA 的核心洞察是：OCR 是 reference-based parsing 任务，每个新 token 不需要回看完整的输出历史——参考源（视觉 token 和 prompt）需要全程可见，而已生成文本只需要保留最近一小段（默认窗口 128）。在 OmniDocBench v1.5 上，Unlimited OCR 以 93.23 总体分超越 DeepSeek-OCR 的 87.01，并可在 40+ 页文档上保持稳定推理。

## 核心要点

1. **R-SWA 的核心思想**：视觉参考 token 全程静态可见（保留完整 prefill cache），已生成文本只保留最近 128 token 的滑动窗口——输出侧 KV cache 变为常量上界
2. **性能提升**：在 OmniDocBench v1.5 上总体分从 87.01 提升到 93.23，文本编辑距离从 0.073 降到 0.038，公式 CDM 从 83.37 升到 92.61
3. **长文档能力**：40+ 页文档 Distinct-35 达 96.90%，Edit Distance 为 0.1069，输出不崩为重复循环或越跑越慢
4. **推理吞吐**：6,144 token 输出时 R-SWA 的 TPS 约 7,847，标准 MHA 约 5,822——越长优势越明显
5. **务实的设计**：直接建立在 DeepSeek-OCR checkpoint 上，仅训练 LLM 参数（冻结 DeepEncoder），4,000 steps 继续训练，8 张 A800 GPU 即可完成

## 深度分析

### R-SWA 的注意力机制设计

R-SWA 的注意力集合由两段组成：**prefix 段**（视觉 token + prompt，全程固定）和 **decode region 的滑动窗口**（最近 W 个输出 token，默认 W=128）。这个设计比普通 Sliding Window Attention（SWA）更适合 OCR：普通 SWA 把所有 token 都放进滑动状态，视觉 token 也会被"滚动"更新，参考图像特征可能在长序列中逐步变糊。R-SWA 将参考 token 排除在状态转移之外，让视觉信息长期静态保留——模型一直能看清原图，只对输出历史做"软遗忘"。

数学上，R-SWA 没有发明新的注意力算子——仍然是标准 softmax 注意力。改变的是注意力能访问哪些位置：可访问集合为 `P ∪ S_W`，其中 P 是固定长度的 prefix segment，S_W 是 decode region 上宽度为 W 的 causal sliding window。KV cache 从 `L_prefix + L_generated` 变为 `L_prefix + W`，当输出足够长时节省比例趋近 `L_generated / W`。

### DeepEncoder 与 R-SWA 的协同效应

Unlimited OCR 的成功建立在 DeepSeek-OCR 的 DeepEncoder 之上。DeepEncoder 将 SAM-ViT 和 CLIP-ViT 级联，在 bridge 处做 16 倍 Token 压缩——一张 1024×1024 的 PDF 图像可压到 256 个视觉 token。这一高压缩率使多页文档的 prefill 成为可能。

R-SWA 解决的则是 decoder 侧的长序列瓶颈。假设 1 个视觉 Token 对应 10 个输出文本 Token，10K 个视觉 Token（约 20-30 页文档）可能需要 100K 级别的输出长度。标准 full attention 下 KV cache 随输出线性增长，显存越来越紧、延迟越来越高。R-SWA 将输出侧增长掐掉，使长文档推理的显存可预测。

输入侧压缩 + 输出侧常量 KV cache，两者协同才能支持"几十页文档一次读完"的场景。

### 窗口宽度 128 为何足够

很多人看到滑动窗口注意力会担心准确率下降——OCR 中这种担心更合理，因为文档解析既要识别字符，还要处理公式、表格结构和阅读顺序。窗口太窄，模型可能忘记前面版面的结构。

Unlimited OCR 的基准测试给出了反直觉的结果：窗口 128 时，OmniDocBench 上的几乎所有指标都有提升（Overall 87.01 → 93.23）。RSWA 窗口宽度 128 在 OCR 任务中踩中了一个"甜点"——足够保存局部生成状态避免重复/跳行/迷路，又足够短把 cache 增长压住。它不适合需要频繁回看长历史、做多轮推理或保持全局设定一致的生成任务，但在参考源稳定、输出顺序明确、远处历史主要承担"已完成标记"的解析任务中表现最佳。

### 工程价值：在已有模型上做手术

Unlimited OCR 最有工程价值的地方在于：它没有要求重训一个庞大的 OCR 基座，而是在 DeepSeek-OCR 的基础上改 decoder attention，再用相对集中的文档数据继续训练 4,000 steps。训练资源仅需 8 张 16GB A800 GPU。推理侧在 Transformers 和 SGLang 两套框架中都已实现 R-SWA 的 KV cache 管理。

这比"从零训练一个更大模型"更有行业落地参考意义。尤其对需要处理长文档 OCR 的工程团队——在已有模型上替换注意力机制并进行短程继续训练，是一条成本可控的升级路径。

### 尚未解决的限制

Unlimited OCR 还没有真正摆脱上下文长度。DeepEncoder 压缩率虽高，但页数继续增加时 prefill 仍然会变长。当前最大序列长度为 32K，更多页面仍会碰到输入侧限制。论文提出的短期方案是训练 128K 上下文版本，长期设想是构建 prefill pool 让模型学会自动取回需要的 prefill KV chunk（类比喻翻书——看到当前页时，需要时再翻回参考位置，避免一次性塞进整本书）。

另一个现实问题是长文档 OCR 的评价——公开 benchmark 目前偏单页或短文档。40+ 页的结果（Edit Distance 0.1069）说明长页数仍会损失一些准确率，主要集中在低分辨率小字体的场景，这部分瓶颈在 encoder 侧而非 decoder。

### 超出 OCR 的通用潜力

论文将 R-SWA 定位为"通用解析注意力机制"。适用的任务需满足三个条件：(1) 有固定参考源（图像、音频、原文句段）；(2) 输出大体按顺序生成，不需要频繁回看很远的历史；(3) 远处输出对当前 Token 的价值主要是"已完成"标记。ASR（音频固定，转写文本按时间展开）和翻译（如果配合术语表机制）都可能受益。但 R-SWA 不适合需要长距离术语一致性、篇章照应、指代推理的生成任务——它的优雅之处也同时是它的局限。

## 实践启示

1. **端到端 OCR 的解码过程值得重新审视**：当任务本质是"看着参考源连续抄写"时，decoder 真的需要完整输出历史吗？R-SWA 的答案是"参考源完整保存，输出历史选择性遗忘"。这个视角可推广到其他 reference-based 生成任务。

2. **高压缩 encoder + 常量 cache decoder 是长文档推理的黄金组合**：DeepEncoder（16x 压缩）+ R-SWA（常量 KV cache）的协同效应才是 Unlimited OCR 的真正工程创新，单一优化无法实现几十页文档一次读完。

3. **在已有模型上替换注意力机制是务实的落地路径**：仅训练 4,000 steps、8 张 A800 GPU 即可实现从 DeepSeek-OCR 到 Unlimited OCR 的升级——对想在长文档 OCR 上做改进的团队有直接参考价值。

4. **窗口宽度需按任务调整**：OCR 默认 128 合理，ASR 或翻译未必相同。窗口太短可能丢失术语一致性，太长又会削弱缓存收益。这是个需要实验探索的超参数。

5. **输入侧仍是最终限制**：即便 decoder 的 KV cache 变为常量，prefill 长度仍制约能一次处理多少文档。长期来看，prefill pool + 按需取回（类 RAG）可能是真正"unlimited"的架构方向。

## 相关实体

- [DeepSeek 效率之争与 JetSpec](ch01/1146-deepseek.html) — 探讨 LLM 解码加速技术，与 R-SWA 的常量 KV cache 设计形成互补
- [LLM 可解释性](https://github.com/QianJinGuo/wiki/blob/main/entities/条条电路通罗马大模型可解释性的唯一机制可能从一开始就不存在.md) — 探讨注意力机制的可解释性，为理解 R-SWA 的窗口设计提供理论背景
- [组件过期模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-component-expiry-evidence.md) — 探讨 AI 系统的缓存策略与状态管理，与 R-SWA 的 KV cache 管理有共通之处

## 参考来源

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/baidu-unlimited-ocr-sliding-window-attention.md)

---

