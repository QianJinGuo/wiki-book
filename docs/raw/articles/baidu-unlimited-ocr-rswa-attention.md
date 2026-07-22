---
source_url: "https://mp.weixin.qq.com/s/rM2Y3Re8cqRd1Z8d7l88Iw"
ingested: 2026-06-23
sha256: 3ff3f1b95a05fab6
---

# 一次吃下一本书！百度开源新OCR——Unlimited OCR

量子位 | henry

国产开源OCR又刷新SOTA！百度开源了全新的OCR新模型——Unlimited OCR。它主打一口气读完几十页长文档，并在OmniDocBench上刷新SOTA，整体成绩超过此前的DeepSeek OCR。

与传统OCR处理长文档时"一页一页读，再把结果拼回去"的思路不同，Unlimited OCR模仿了一种酷似人类抄录员的工作方式：不再死记硬背前面已经抄写过的内容，而是只保留当前工作需要的信息和进度。

## for-loop只是权宜之计

传统OCR每生成一个新Token，都需要回头查看之前生成过的所有Token，KV Cache持续膨胀，显存占用和注意力计算开销随之增长。现有OCR系统很难一次读完几十页文档，通常只能采用"逐页处理+结果拼接"的方案。

## 参考滑动窗口注意力（R-SWA）

核心创新：不再让模型记住更多东西，而是让模型学会像人一样"遗忘"。

**设计思路**：人类抄写一本书时，不会每写一个字都重新翻阅前面几十页。只会保留当前阅读状态和刚刚写下的一小段内容。论文将这种机制称为**软遗忘（Soft Forgetting）**。

**R-SWA 机制**：
- 对于每个待生成Token，模型始终关注**全部参考Token（Reference Tokens）**——即视觉Token和提示词
- 在输出端只保留最近 n 个历史Token（默认128个）参与注意力计算
- 类比：原书始终摊开在桌上可随时查看，手边只保留最近写下的几行字追踪进度，更早内容自然淡出工作记忆

**KV Cache 设计**：
- 固定长度队列：每生成一个新Token，最旧状态自动移出，新状态补进来
- 无论生成几千还是几万Token，KV Cache规模始终恒定，显存占用和计算成本不增长

**与其他注意力机制的区别**：

| 机制 | KV Cache | 视觉信息 | 文本历史 |
|------|----------|----------|----------|
| Full Attention | 随解码膨胀 | 全保留 | 全保留 |
| 传统 SWA | 固定大小 | 被滑出（变模糊） | 局部保留 |
| **R-SWA** | **固定大小** | **始终保留**（Reference Tokens） | **局部保留**（滑动窗口） |

R-SWA将视觉Token单独保留，不参与滑动窗口更新。图像始终保持清晰，发生滑动的只有输出文本本身。

## 实验结果

| 指标 | Unlimited OCR | DeepSeek OCR | 提升 |
|------|-------------|-------------|------|
| OmniDocBench v1.5 | 93.23% | 87.01% | +6.22% |
| OmniDocBench v1.6 | 93.92% | — | SOTA |
| 40+页 Distinct-35 | 96.90% | — | 稳定 |
| 编辑距离(40+页) | ≤0.1069 | — | 无退化 |
| 6000 Token TPS | — | 基线 | +35% |
| 延迟 | 稳定 | 长文档飙升 | 无飙升 |

## OCR之外：一种新的长上下文思路

过去两年长上下文主流思路是扩容（128K→1M→10M）。R-SWA反着来：与其让模型记住一切，不如让它学会像人一样遗忘。

Unlimited OCR修改的是注意力机制本身，而注意力是今天几乎所有大模型共同的基础设施。

**路线图**：
- 短期：训练更长上下文版本，扩展到128K
- 长期：构建"预填池（Prefill Pool）"机制，按需调取历史KV状态
- 扩展：将R-SWA应用到语音识别、机器翻译等任务

## 作者线索

三位核心贡献者中，"YY"被标注为技术总监。社区猜测为前DeepSeek OCR研究员魏浩然（曾主导GOT-OCR2.0，参与DeepSeek OCR/OCR2研发）。沿用DeepEncoder，致谢DeepSeek OCR和PaddleOCR。

## 参考链接

[1] GitHub: https://github.com/baidu/Unlimited-OCR
[2] HuggingFace: https://huggingface.co/baidu/Unlimited-OCR
