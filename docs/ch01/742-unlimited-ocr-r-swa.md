# 百度 Unlimited OCR：R-SWA 参考滑动窗口注意力实现超长文档连续解析

## Ch01.742 百度 Unlimited OCR：R-SWA 参考滑动窗口注意力实现超长文档连续解析

> 📊 Level ⭐⭐ | 4.1KB | `entities/baidu-unlimited-ocr-rswa-attention.md`

# 百度 Unlimited OCR：R-SWA 参考滑动窗口注意力

## 核心创新

百度开源的 Unlimited OCR 在 OmniDocBench 上刷新 SOTA（93.23%，超 DeepSeek OCR +6.22%），核心创新是 **R-SWA（Reference Sliding Window Attention）**——一种让模型学会"遗忘"的注意力机制，实现超长文档连续解析而 KV Cache 不膨胀。

> "与其让模型记住一切，不如让它学会像人一样遗忘。"

## R-SWA 机制

人类抄书时不会每写一个字翻阅前面几十页——只保留当前状态和最近几行。论文称之为**软遗忘（Soft Forgetting）**。

### 两层注意力分离

| 组件 | 关注范围 | 策略 |
|------|----------|------|
| **Reference Tokens**（视觉+提示词） | 全部，始终可见 | 类比：原书始终摊开在桌上 |
| **Text History**（已生成文本） | 最近 128 个 Token | 类比：手边只保留最近写下的几行字 |

### 固定 KV Cache 设计

KV Cache 设计成固定长度队列：每生成新 Token，最旧状态自动移出，新状态补进来。**无论生成几千还是几万 Token，KV Cache 规模始终恒定**。

### 三种注意力机制对比

| 机制 | KV Cache | 视觉信息 | 文本历史 | 问题 |
|------|----------|----------|----------|------|
| **Full Attention** | 随解码膨胀 | 全保留 | 全保留 | 显存爆炸 |
| **传统 SWA** | 固定大小 | 被滑出 | 局部保留 | 视觉信息逐渐模糊 |
| **R-SWA** | **固定大小** | **始终保留** | **局部保留** | ✅ 无退化 |

关键区别：R-SWA 将视觉 Token 单独保留，不参与滑动窗口更新。**图像始终保持清晰，发生滑动的只有输出文本本身。**

## Benchmark 结果

| 指标 | Unlimited OCR | DeepSeek OCR | 提升 |
|------|-------------|-------------|------|
| OmniDocBench v1.5 | **93.23%** | 87.01% | +6.22% |
| OmniDocBench v1.6 | **93.92%** | — | SOTA |
| 40+ 页 Distinct-35 | 96.90% | — | 无内容混淆 |
| 6000 Token 推理速度 | — | 基线 | **+35%** |
| 长文档延迟 | 稳定 | 飙升 | **无飙升** |

## 与长上下文研究的关系

传统长上下文思路是**扩容**（128K→1M→10M），R-SWA 反着来：

- 不是让模型记住更多信息，而是设计合理的遗忘机制
- 修改的是注意力机制本身——大模型共同的基础设施
- OCR 只是第一站，计划扩展到语音识别、机器翻译

**路线图**：短期 128K 上下文 → 长期 Prefill Pool（按需调取历史 KV）→ 跨任务扩展

## 与 DeepSeek OCR 的关系

Unlimited OCR 沿用 DeepSeek OCR 提出的 DeepEncoder（高压缩率视觉编码器），创新重点放在解码阶段的长期记忆机制。

| 维度 | DeepSeek OCR | Unlimited OCR |
|------|-------------|---------------|
| 视觉编码 | DeepEncoder | 沿用 DeepEncoder |
| 解码注意力 | 标准 | **R-SWA** |
| KV Cache | 膨胀 | **固定** |
| 长文档 | 逐页处理 | **连续解析** |

核心作者"YY"疑似前 DeepSeek OCR 研究员魏浩然（GOT-OCR2.0 + DeepSeek OCR/OCR2），研究路线从"怎么看"（视觉编码）延伸到"怎么记"（长期记忆）。

## 开源

- GitHub: https://github.com/baidu/Unlimited-OCR
- HuggingFace: https://huggingface.co/baidu/Unlimited-OCR

## 相关实体
- [Deepseek V4 Training 58 Page Paper Deep Dive](ch04/150-ai.md)
- [Context Management Agent Systems](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-management-agent-systems.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/baidu-unlimited-ocr-rswa-attention.md)

---

