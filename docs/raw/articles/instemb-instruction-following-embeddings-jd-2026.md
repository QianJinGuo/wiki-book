---
title: "InstEmb：未来感知指令嵌入（ICML 2026，京东 Oxygen AIIC）"
source_url: "https://mp.weixin.qq.com/s/XWKkRBiO_5s-mm0Lnil0jA"
author: 京东零售技术
platform: WeChat
ingested: 2026-08-13
slug: instemb-instruction-following-embeddings-jd-2026
sha256: 147644630716a16fc121ac951446bf4eed51ca3b1d4fee3c9862379d123d4794
---

京东零售技术发布 ICML 2026 论文解读：InstEmb（Instruction-Following Embeddings through Glimpses of the Future），面向 Oxygen AIIC 商品知识表征的指令遵循 embedding 框架。

## 核心思想

在不进行额外解码的情况下，让 embedding 获得"未来输出"的语义线索。InstEmb 在输入后追加一组可学习的 look-ahead tokens，通过 frozen teacher 的输出条件表示进行自蒸馏，使 look-ahead tokens 学习 output-aware semantics；同时用多视图对比学习强化最后一个输入 token 对 input-intrinsic semantics 的建模；最终用 Dual-Anchor Alignment Pooling（DAAP）将两类语义显式融合。

一句话：让 embedding 不只理解"输入说了什么"，也尽可能理解"模型接下来会如何回答"。

## 背景：指令遵循 embedding 的两个语义来源

- **Input-Intrinsic Semantics**：输入文本和指令本身显式表达的语义，主要由最后一个输入 token 承载。
- **Output-Aware Semantics**：模型响应指令时可能生成的回答中隐含的语义，分布在输出 token 序列中。

现有方法两类不足：①last-token pooling 偏 input-intrinsic，捕捉不到输出侧隐含语义；②HyDE 类 decode-then-encode 引入额外解码开销 + 离散文本到连续表示的重构间隙。

理想框架需同时满足：保留输入语义 + 未来输出语义；获取 output-aware 不引入额外解码延迟、不依赖生成后二次编码。

## 方法

### Look-ahead tokens 捕捉未来语义

- Student input: [instruction + input + <eos> + look-ahead tokens]
- Teacher input: [instruction + input + <eos> + truncated gold output]
- teacher 冻结、看到真实输出（output-conditioned semantic info）；student 看不到输出，训练目标 = student 的 look-ahead token states 对齐 teacher 在真实输出位置的表示。
- 推理时无需生成输出，一次 prefilling pass 即可。look-ahead tokens 类似连续空间中的"未来语义占位符"——在 hidden state 层面学习"如果模型继续回答，输出大概会携带什么语义"。

### 表征自蒸馏（两种目标）

- **MSE loss**：直接对齐 hidden states——更直接约束表示空间，适合细粒度指令遵循任务。
- **KL divergence loss**：通过语言模型头对齐输出概率分布——分布层面知识迁移，通用 embedding 任务更稳健。

### 多视图对比学习（强化输入语义锚点）

最后输入 token 上构造四类视图：student 第一次编码 / student 第二次编码（不同 dropout mask，SimCSE 风格）/ frozen teacher 对输入序列编码 / student 对目标输出序列编码。同样本为正例集、不同样本为负例，多正例 InfoNCE 对比损失。防止 embedding collapse、保持输入语义稳定性。

### DAAP：与训练目标对齐的池化

- Input-Intrinsic Anchor：最后一个输入 token 的 hidden state
- Output-Aware Anchor：look-ahead tokens 的平均 hidden state
- 最终 embedding = 二者平均

使训练时显式优化的两个位置在推理时都被纳入最终 embedding，避免经验性 pooling 搜索。

## 实验结果

- Backbone：LLaMA-3-8B-Instruct；训练数据 ~20 万条 abstractive QA 样本（11 个 QA 数据集）；1 epoch；推理用 8 个 look-ahead tokens。
- **指令遵循检索**：InstEmb-MSE 在 FollowIR 平均 score 28.5、p-MRR +15.6，超 FollowIR-7B 与 Promptriever；InfoSearch 也最高 p-MRR。
- **指令遵循 embedding + 通用**：InstEmb-MSE-DAAP 指令任务平均 67.08（Inbedder reimplementation 59.90）；InstEmb-KL-DAAP 通用任务 63.39（保持通用能力）。
- **backbone 迁移**：Qwen2.5 backbone 上同样有效——通用训练范式而非单 backbone 特化。

## 消融

- 蒸馏目标：去除对比学习后，MSE/KL 均优于 CE baseline（连续表示/分布模仿 > 离散 token 预测）；MSE 指令任务更强、KL 通用任务更优。
- Look-ahead 长度：0→1 即明显提升（哪怕一个 token 也引入额外 output-aware signal）；输出短/信息密度高的任务继续增加收益有限，NYTCluster 等依赖扩展语义的任务较长序列更好。
- 多视图对比：移除第二个 student dropout view 明显下降；同时去掉第二个 student input view 与 student output view 时指令任务均值 67.08→56.44——SimCSE-style dropout augmentation 对防 embedding collapse 至关重要。
- Pooling：DAAP 整体最佳；仅 InputLast 指令任务强但通用任务低于 DAAP；AllMean 明显落后——最后输入 token 与 look-ahead tokens 不是可随意平均的普通 token。

## 可解释性

- Attention pattern：原始 LLaMA-3-8B-Instruct 有明显 attention sink（注意力集中在序列开头）；InstEmb 训练后注意力更选择性，更多关注 system prompt 结尾、instruction 结尾等语义关键位置。
- Hidden-state 相似度：最后输入 token 与后续位置相似度低（专注 input-intrinsic）；look-ahead tokens 与 golden output tokens 相似度高（承担 output-aware semantics 角色）。

## 小结

InstEmb 为指令遵循 embedding 提供兼顾性能与效率的路径：一次 prefilling pass 得到融合两类语义的向量表示，避免 decode-then-encode 的延迟与重构间隙。方向启示：embedding 不应只压缩输入，还可以在连续表示空间中预览输出。Oxygen 是京东零售产研对外发布的电商创新 AI 架构体系（Joy AI 大模型为底座，赋能购物、供应链等电商场景）。
