---
title: "MSA上桌，稀疏注意力玩家开始三国杀：MSA/DSA/MoBA/NSA 四方案深度对比"
source_url: "https://mp.weixin.qq.com/s/4ij1qsval_7k2GwehW1Tzg"
source: "wechat|花叔"
author: "花叔"
publish_date: "2026-06-12"
ingested: "2026-06-12"
type: article
tags: []
source_type: wechat
sha256: "71ba55ee91be9c4bd18c801d656de5843b22461b01256c822d37caedd5a0ad05"
---

MiniMax M3 发布，配套技术论文 *MiniMax Sparse Attention* (MSA) 公开，30 页全文解读。把 2026 年稀疏注意力赛道的 4 份方案（NSA、DSA、MoBA、MSA）摆到一张桌上对比，发现 3 个核心分歧轴 + 1 条训练配方的收敛暗线。

## 一、为什么大家都奔向稀疏

Transformer 的 full attention 计算量是 O(n²)，1M 上下文下算力直接吃满，KV cache 把显存也吃满。稀疏注意力的核心思路：**生成下一个词时，没必要真的回头看完前面 100 万个 token，挑出真正相关的一小撮来精算**。

挑谁、怎么挑、挑多细——这就是三国杀的全部分歧。

## 二、MSA 的做法：粗筛 + 精算

MSA 的架构是两条分支：**Index Branch（索引分支）+ Main Branch（主分支）**。

**第一步：粗筛**。索引分支把上下文切成一块一块的（每块 128 个 token），用很轻的打分动作估每块的相关性：先给块内每个 token 打分，取**块内最高分**当这块的分（论文叫 block max pooling），然后挑出 16 块——当前位置所在的块必选，其余按得分高低挑。

**第二步：精算**。主分支只在挑出的 16 块上跑完整 attention，剩下未选中的直接跳过。16 块 × 128 token = 每生成一个词，**固定只精算 2048 个 token**——不管上下文是 10 万还是 100 万。这就是省钱的来源。

### 索引分支的训练：KL 对齐

挑 top-k 这个动作**不可导**——索引分支不能用正常训练方法教它"该挑哪块"。论文的解法：

- 让索引分支拿主分支的 attention 分布当老师，用 **KL 散度对齐**
- 训练信号只更新索引分支自己的参数（梯度截断）
- 开头 40B 个 token 先跑全 attention 热身，等索引分支学得差不多再开启稀疏

**效果**：索引分支挑出来的块，覆盖了主分支**九成以上**的 attention 权重。

### Kernel 设计：Outer Gather Q

常规稀疏 kernel 以 query 为中心：每个 query 各自去把它要的 KV 块捞出来，**同一块数据被不同 query 反复读**。MSA 反过来——**以 KV 块为外层**：把所有选中了这块的 query 聚集到一起，一次性算完，每块数据只读一次。

GPU 是算得快、搬数据慢的架构（瓶颈在访存），衡量 kernel 看 **计算访存比**：
- Query 为中心：约等于组内头数（实验模型下 16）
- KV 块为中心：约等于块大小的 2/3（128 块下 85）

**仅 top-k 选择这一步 kernel 就实现快 3-5 倍**。

### 性能数据（109B 实验模型，1M 上下文）

| 指标 | 数字 |
|------|------|
| 注意力计算量 | 缩到全 attention 基线的 **1/28** |
| H800 prefilling 加速 | **14.2×** |
| H800 decoding 加速 | **7.6×** |

论文老实承认实测加速追不上 28.4 倍理论值——建索引、挑 top-k、聚集 query 这些动作本身有开销。

### 能力掉不掉？3T token 对照实验

同一个 109B 模型，一个用全 attention 训，一个从头用 MSA 训，**loss 曲线几乎重合**。下游 benchmark：

- **从头稀疏训练版（MSA-PT）**：长文本检索、数学、视频理解等好几项反超全 attention 基线
- **RULER-8K：84.2 vs 79.8**（MSA-PT vs Full Attention）

### MSA-CPT：现成模型的改装入口

拿一个已经训好的全 attention 模型，花 **400B token 继续训练**，就能改装成稀疏 attention，能力几乎无损。这意味着 Qwen、GLM 等模型如果想做 1M 上下文，都有便宜的路可走。

**改装版（MSA-CPT）的残余差距**：综合检索分还差全 attention 0.6 分，重排序任务差 2 分多。要靠更长的稀疏训练或加大选择预算去填。

### 附录最有意思的部分：head 涌现的模式

把训练好的索引分支到底在挑什么可视化出来，三种模式：

1. **沿对角线的深色带**——永远关注最近的内容
2. **最左边一条竖线**——所有头都盯着开头几个 token 不放（**attention sink** 现象）
3. **各组各不相同的斜向条纹**——不同头各自负责回看不同距离的远程信息

没人教过它这些，全是 KL 对齐训练自己涌现的。

**试过强制规则都砍掉了**：
- 试过显式加 sink 参数（GPT-OSS 思路）→ 没收益，砍掉
- 试过强制索引分支选开头第一块 + 附近窗口 → 模型自己就会这么选，强制规则纯属多余，砍掉
- 最终版**只保留一条强制规则**：当前 token 所在块必选

**论文开篇自己写了**：遵循奥卡姆剃刀，消融实验做完，只留下必不可少的组件。

## 三、三国杀：3 个分歧点

场上四份方案：**NSA**（DeepSeek 2025-02 论文）、**DSA**（DeepSeek 2025-09 V3.2 生产实现）、**MoBA**（Kimi 2025-02）、**MSA**（MiniMax 2026-06）。NSA 和 DSA 是同源思想（论文 vs 落地）不同实现。

### 分歧一：挑得多细？token 级还是块级

| 方案 | 颗粒度 | 细节 |
|------|--------|------|
| DSA | token 级 | Lightning Indexer 给每个历史 token 单独打分（ReLU + FP8），精确挑 2048 个 |
| MSA | 块级 | 16 块 × 128 token = 2048 个 token 预算 |
| MoBA | 块级 | 把块内所有 key 向量取平均当代表，无额外参数 |

**对仗细节**：DSA 每个 query 挑 2048 token，MSA 挑 16 块 × 128 = 2048 token，**预算一模一样，分歧全在颗粒度**。

赌的：token 级能捞到散落的零碎信息；块级赌相关内容通常成段聚着，且块状访存对 GPU 友好。MSA 论文点了 token 级一句：长上下文下，光是从 100 万 token 里做 top-k 挑选本身就占不可忽略的延迟。

### 分歧二：压不压 KV？

**DeepSeek 这路是两层叠加**：
- 底层 **MLA** 把 KV 压成更小的潜向量（"与其存高清原图，不如存压缩图，放大有点糊但大轮廓都在"），省显存
- DSA 叠在 MLA 上，在压缩后的 KV 上做 token 级稀疏选择

DSA 官方报告里写得很直白：**DSA 是"建在 MLA 之上"**。DeepSeek 又压又选，省显存一以贯之。

**MSA 不压 KV，纯选择器**——论文原话 "selector-only design"，KV 原原本本存着，所有功夫花在"选得准"上。

**两种信念**：
- DeepSeek：信息禁得起压，糊一点没关系，省下来的显存更值钱
- MiniMax：要省就省在挑选上，真正要算的那一下别糊

### 分歧三：要不要辅助分支？

**NSA 是三件套**，三条分支并行：
- 压缩分支（把连续块压成代表）
- 选择分支（挑最重要块精算）
- 滑动窗口分支（照顾最近 token）

三条各管一摊，最后用学出来的门控加权汇总。**复用压缩分支算 attention 的副产品**作选块分数，几乎零成本。

**MSA 砍掉另外两条**，只留初筛 + 精算的选择动作。**减法是对照实验做出来的**：固定只看开头一块 + 最近窗口的 baseline 在一堆 agent 任务上一致地更差——位置固定的稀疏模式不如让模型自己动态挑。滑窗分支不是忘了做，是验证过不值得单独留。

**MoBA** 的特殊取舍：**能在全 attention 和稀疏 attention 之间灵活切换**——百万上下文实验里：模型最后 3 层保留全 attention、其余层用 MoBA；预填充阶段用稀疏、生成阶段切回全 attention。说明 Kimi 自己也清楚稀疏在哪些环节有短板，用混合配置绕开。

### 暗线：训练配方正在收敛

四家给了三种答案教"挑块的小脑"：

| 方案 | 训练方式 |
|------|----------|
| NSA | 端到端一起训（搭主结构便车） |
| MoBA | 蹭主模型学习信号（不给小脑配参数） |
| DSA + MSA | 单独给小脑找老师（KL 对齐） |

**越靠近生产的方案，越往第三种靠**——千亿参数规模，训练稳定性比架构优雅重要得多。

## 四、为什么「便宜」才是 1M 的真问题

四份方案都在干同一件事：**把长上下文从"能做"变成"用得起"**。长程 Agent 连干十几个小时、百万行代码库排查问题、几小时视频一次喂进去——这些能力全压在"长上下文用得起"这个前提上。

**DeepSeek V4**（2026-04）更新：1M 上下文下每 token 推理计算量压到 V3.2 的 **27%**，KV cache 剩 **10%**——靠的是压缩得更狠的新一代 attention。DeepSeek 把"压"的信念贯彻到底；MiniMax 刚交的是"选"的答卷。

**M3 没冲到的项**：PostTrainBench 0.371，排在 Opus 4.7（0.424）、GPT-5.5（0.393）后面。Anthropic 已更到 Opus 4.8（6-9 又放 Fable 5）。

但 M3 的强项是**编程到前沿 + 原生多模态 + 真 1M 三样凑一块，且开源**。论文承诺 MSA 推理 kernel 单独开源（截稿时仓库地址 404，等放出来）。

## 总结：长上下文之争转向"成本"

哪种赌注能赢，得等更多真实场景的长跑验证。但**长上下文这场仗，比的不再是谁能做到 1M，而是谁能让 1M 便宜到随便用**。

**参考资料**：
- [MiniMax Sparse Attention 论文](https://github.com/MiniMax-AI/MSA/blob/main/docs/MiniMaxSparseAttention.pdf)
- [MiniMax M3 官方博客](https://minimaxi.com/blog/minimax-m3)
- [Why Did M2 End Up as a Full Attention Model?](https://www.minimax.io/news/why-did-m2-end-up-as-a-full-attention-model)
- [DeepSeek DSA (V3.2, DSA instantiated under MLA)](https://api-docs.deepseek.com/news/news250929)
- [NSA 论文 (arXiv 2502.11089)](https://arxiv.org/pdf/2502.11089)
- [MoBA 论文 (arXiv 2502.13189)](https://arxiv.org/pdf/2502.13189)
