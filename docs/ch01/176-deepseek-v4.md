# DeepSeek-V4深度拆解：一篇论文同时做了五件大事

> 📊 Level ⭐⭐⭐ | 10.8KB

> -> [原文存档](https://mp.weixin.qq.com/s/BELLFDV6hlmmFoAcJy1RZg)

---
wechat_mp_fakeid: MP_WXS_3871912638

DeepSeek-V4深度拆解：一篇论文同时做了五件大事

↑阅读之前记得关注+星标⭐️，😄，每天才能第一时间接收到更新

这篇对DeepSeek v4论文解读来自Pierre-Carl Langlais（@Dorialexander）开源AI基础设施开发者，Pleias联合创始人，首席技术官。
这篇论文让我看了整整一周。
DeepSeek-V4的论文试图同时完成多件事，而且这些事之间的联系出乎意料地紧密，很难单独拆开来讲。
下面逐一说清楚。
第一件事：正面追赶闭源模型的架构差距
业内一直有个传言：Anthropic的Opus系列和GPT-5里的最大模型，属于完全不同量级的东西。

它们的特征是：规模极大、极度稀疏的混合专家架构（MoE），能够在保持可服务性的前提下维持前所未有的宽搜索空间。

## 关键要点
- 技术领域：AI / WeChat
- 来源：微信公众号

## 链接
- [原文](https://mp.weixin.qq.com/s/jcqQS4W4QW61PaIzJuUxeg)

## 相关实体
- [ds4c deepseek v4 antirez](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ds4c-deepseek-v4-antirez.md)
- [We Tested DeepSeek V4 Pro and Flash Against Claude Opus 4.7 and Kimi K2.6](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-pro-vs-claude.md)
- [Redis之父下场，给DeepSeek V4单独造了一台推理引擎](https://github.com/QianJinGuo/wiki-public/blob/main/entities/redis之父下场给deepseek-v4单独造了一台推理引擎.md)
- [We Tested DeepSeek V4 Pro and Flash Against Claude Opus 4.7 and Kimi K2.6](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wetesteddeepseekv4proandflashagainstclau.md)
- [Transformer Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/transformer-architecture.md)
- [Design Patterns for AI Agents 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/design-patterns-for-ai-agents-2026.md)

### 1. 架构追赶背后的工程化壁垒
DeepSeek-V4的核心意图是正面挑战Anthropic Opus系列和GPT-5最大模型代表的闭源架构差距。这类超大稀疏MoE模型的关键特征是：规模极大、极度稀疏，能够在保持可服务性的前提下维持前所未有的宽搜索空间。
**深层含义**：这种架构差距的本质不是算法创新，而是工程能力的积累——需要从底层算子（kernel）开始重写，才能精细调度节点互联通信，将通信时间嵌入计算时间中并行完成。这是对整个AI基础设施团队能力的考验。

### 2. CSA/HCA混合注意力：推理经济学的再次颠覆
DeepSeek-V4用两套注意力压缩方案处理长上下文：

- **HCA（重度压缩注意力）**：每128个token压缩成一个条目，处理模糊但全局性的上下文
- **CSA（压缩稀疏注意力）**：轻量级索引器精准召回远距离相关内容
这种设计以更大的head_dim（512）为代价，换取更高压缩率的KV缓存——而KV缓存正是prefill阶段的真正瓶颈。继MLA之后，DeepSeek再次颠覆推理经济学。
**预判**：CSA/HCA混合方案在2026年底前将成为主流架构标配。

### 3. 训练不稳定性的隐患
论文最有野心的部分——mHC和CSA/HCA混合机制——同时也是最不完整的部分。mHC输出维度仅24的矩阵乘法引入了不确定性，加上softmax→sqrt(softplus)、两阶段混合Muon优化等大量非标准参数组合，导致训练过程出现明显不稳定性。
这表明即使是全球顶尖AI实验室，面对消融实验的组合爆炸也无能为力。目前缺乏系统性理论支撑架构选择。

### 4. 硬件生态的长期布局
DeepSeek与华为昇腾的深度合作是3-5年以上的战略计划。论文中的详细硬件愿望清单对英伟达意义有限，但对新硬件进入者（特别是国产芯片）非常合理。这暗示了未来AI实验室与硬件合作伙伴深度绑定、芯片设计反向适配模型需求的趋势。

### 5. 生态系统动态的浮现
DeepSeek与Moonshot的深度协作关系，暗示一种生态系统分工正在形成：DeepSeek专注硬核基础设施问题，其他方向由生态伙伴分头推进。32T token训练数据中约50%可能是合成数据，但这次DeepSeek将精力集中在基础设施、架构和规模化上，系统性重训练留到后续。

## 深度分析

### 三处大改：infra-first 的最短路径

V4 没有推倒 V3 重来：MoE 框架沿用，动刀只有三处——残差升级 mHC、注意力拆成 CSA+HCA、优化器换 Muon。 三处各对应一个 V3 瓶颈：mHC 管深度稳定，CSA+HCA 管上下文算力，Muon 管训练效率。 这印证了 DeepSeek 的 infra-first 哲学：创新不在高层架构，而在信号流动与梯度更新两个底座上。背景见 [DeepSeek-V3 MoE 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v3-moe-architecture.md)、[MoE 混合专家](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/moe-mixture-of-experts-2025.md)。

### 算力受限下的效率押注

训练方法论透着同一张底牌：算力受限，每 FLOP 的边际收益必须最大化。稳定性侧，1.6T 的 loss spike 连回滚都救不回来，最终靠 Anticipatory Routing 与 SwiGLU Clamping 救场，且 DeepSeek 坦承原理未完全理解。 推理侧，1M 上下文单次成本比 4K 高约 6 万倍，CSA+HCA 把 KV cache 压到传统 baseline 的约 2%，成本降至 V3.2 的约 1/4。 后训练侧，混合 RL 被整体替换为 On-Policy Distillation：分领域训专家、反向 KL 蒸馏合并，把 RL 的不稳定隔离在专家内部。 三层指向同一判断，详见 [DeepSeek-V4 训练方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-training-methodology.md)、[模型蒸馏与压缩](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-distillation-compression.md)。

### 适用边界：偏科模式与工程代价

评测呈清晰偏科：有明确答案的任务顶尖（Putnam 满分、Codeforces 3206），品味型任务掉档——Agent 落后闭源，工程编程距 Opus 4.6 差 13 分。 可信解释是招聘结构：竞赛选手主导的团队，品味直接塑造模型性格。 另有两点边界：128K 内性能稳定，1M 处降至 0.59、勉强可用； V4-Pro 因吞吐受限定价暂不便宜，性价比主要在 Flash 档。 "百万上下文 + 可接受价格"今天实际兑现的是 128K 级 Agent 场景，而非全量 1M。

### OPD 的外溢价值与下一代伏笔

OPD 的意义可能超出 V4：MoE 是推理时混合，OPD 是训练时混合，组合空间大得多——小团队可先训专家再蒸馏合并，新增能力只需训新专家入池，不必重跑 RLHF。 论文还把继续稀疏化（Engram 一脉）与原生多模态列入路线图，下一代轮廓是查找式记忆、多模态、更低延迟的 agentic。 换言之，V4 是基础设施级更新而非天花板突破：闭源卷上限，开源卷地板，地板抬高速度决定 AI 应用爆发的规模。
## 实践启示
### 对AI基础设施团队
1. **重新审视通信与计算的重叠调度**：DeepSeek-V4展示了精细调度互联网络隐藏延迟的可行性。对于团队而言，这意味着在设计分布式训练框架时，需要将通信调度作为一等公民来考虑，而非事后优化。
2. **关注KV缓存优化**：CSA/HCA方案的核心启示是，推理效率的瓶颈已从计算转向内存访问。对于实际部署，理解并优化KV缓存压缩率将带来显著收益。
3. **硬件-软件协同设计**：DeepSeek与昇腾的合作模式表明，未来的竞争优势将来自硬件与软件的深度绑定。建议团队在选型时考虑硬件原生支持度与定制化空间。

### 对模型开发者
1. **警惕架构创新的组合爆炸**：大量非标准组件的组合会导致训练不稳定。建议采用更保守的渐进式架构演进策略，而非一次性引入多个未知变量。
2. **强化学习训练信号扩展**：DeepSeek正在重新审视RL+推理训练方案的两阶段设计（专项模型RL→在线蒸馏）。这为模型训练提供了新的思路：可验证流水线本身就是一种极端形式的离线强化学习。

### 对技术决策者
1. **合成数据的战略价值**：32T token训练数据中约50%为合成数据已是常态。在数据采购预算有限的情况下，投资高质量合成数据生成能力可能是更务实的选择。
2. **生态协作模式**：DeepSeek-Moonshot模式展示了专注基础设施、开放生态合作的可行性。对于资源有限的团队，这提供了一种差异化竞争思路——不必成为全栈选手，而是在某个环节做到极致。

> [!note] 时间对儿（发布周期 ≈109 天）
> 本页是发布前**预期端**（2026-05-13 入库，解读 05-03 论文）；交付端见 [2026-08-30 正式版实测](https://github.com/QianJinGuo/wiki-public/blob/main/entities/连夜实测deepseek-v4-pro-正式版低于预期不推荐接入codex.md)——"不适合作为 Codex 的主力模型"。预期 vs 交付对账已录入 [预测对账台账](https://github.com/QianJinGuo/wiki-public/blob/main/queries/prediction-ledger.md) #1。
---

---

