# DeepSeek-V4-Flash means LLM steering is interesting again

> 📊 Level ⭐⭐⭐ | 6.9KB

## 核心要点
- Well-structured technical article explaining steering vectors with good clarity and logical flow. Demonstrates solid understanding of both naive and sophisticated steering approaches, referencing rele
## 相关实体
- [Llm Steering Behavior Guidance](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-steering-behavior-guidance.md)
- [Wetesteddeepseekv4Proandflashagainstclau](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wetesteddeepseekv4proandflashagainstclau.md)
- [Deepseek V4 Flash Pro 通往百万级上下文与万亿参数推理的新纪元 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-flash-pro-通往百万级上下文与万亿参数推理的新纪元-v2.md)
- [Deepseek V4 Pro Vs Claude](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-pro-vs-claude.md)

→ [原文存档](https://www.seangoedecke.com/steering-vectors/)

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/llm-core-technology.md)
## 深度分析

### 为什么是 DeepSeek-V4-Flash：开源权重是 steering 的入场券

Steering 的前提是能够直接读写模型的激活值，这意味着两件事：拿到模型权重，以及在本地跑推理。这两个条件把三类人划到了门外——大实验室不需要它，API 用户够不着它，而开源社区此前又没有一个强到值得这样做的模型。DeepSeek-V4-Flash 改变了这一格局：作者认为它可能是第一个足以与前沿模型低端 agentic coding 竞争的本地模型，让"本地模型 + steering"第一次成为工程师值得认真尝试的实验。 antirez 的 DwarfStar 4 正是这种可能性的产物——把 llama.cpp 精简为只跑 DeepSeek-V4-Flash 的专用运行时，并将 steering 作为一等公民内建。尽管其实现仍很初步（基本只是通过 prompting 也能复现的 "verbosity" 玩具示例），但首发仅八天，值得持续追踪。

### Steering 的机制：从激活差值到特征提取

最朴素的路径是"激活差值法"：把同一批 prompt 各喂给模型两次——一次正常、一次追加目标指令（如 "respond tersely"）——然后逐对相减激活矩阵，得到的差就是 steering vector，理论上注入到任意 prompt 的同一层即可复现该效果。激活的测量点很多（attention 之后、各层之间），可以任选或多试。 更精细的路径是训练第二个模型，从激活中提取"特征"——反复一起出现的激活模式——再把它们映射回具体概念加以放大。这就是 Anthropic 用 sparse autoencoder 做的事：原理相同，但能捕捉更深层的模式，代价是在时间、算力和专业门槛上都昂贵得多。

### "中产阶级"困境：谁能用、谁用不上

Steering 在 AI 研究中是个尴尬的"中产阶级"想法。它够不着金字塔的两端：大实验室用不上——他们想让模型按某种方式行事时直接训练，不需要在推理中途做"脑外科手术"，Anthropic 关注这一领域也主要出于可解释性与安全视角；普通 API 用户够不着——通过 API 使用模型意味着既拿不到权重也拿不到激活，只有 OpenAI 自己能为 GPT-5.5 找出或暴露 steering vector。中间地带此前是空的，开源权重模型补上了它。雪上加霜的是，steering 的多数基础应用会被 prompting 直接击败：prompt token 本身就在操纵模型的大脑，且控制粒度更细——想让模型更啰嗦，直接开口要求即可，何必注入向量。

### 实用主义的中间地带：steering 真正可能的用武之地

剩下两条路径对应 steering 的真正想象空间。其一是 steering "无法被 prompt 的概念"：老一代模型还吃"you are an expert"这一套，当前模型已把专家性内化进人格，prompting 对它失效——但作者对能否找到"intelligence"向量持怀疑态度，因为如此复杂的概念，其 steering vector 可能与整个权重集几乎重合，提取它等价于"训练一个聪明模型"；极端情形下，逐层换入更强模型的激活只会让你实际上在和更强模型对话——智能在 steering 里而不在模型里。其二是 steering 作为"上下文压缩"：把"了解我的代码库"这类需要海量 token 表达的概念从 working memory 挪进 implicit memory，为 context window 腾出空间。直觉上可行（这类知识想必埋在激活里），但作者同样怀疑它复杂到需要完整微调——而业界的"在代码库上微调"实践也大多不成功。 社区反馈补上了作者没想到的一块拼图：HN 评论（包括 antirez 本人）指出 steering 能改变已训练进去的行为，最典型的是移除 refusal——这正是开源模型 uncensoring/abliteration 已在使用的做法；且运行时注入可按需启用，比 LoRA 这类权重修改对模型能力的损伤更小。作者的最终判断是审慎的悲观：多数收益用 prompt 复现更高效，最雄心勃勃的目标用训练/微调复现更划算；但开源社区此前几乎没在 steering 上下功夫，未来六个月将是对这个经验问题的真正检验。

## 实践启示
1. **用 DwarfStar 4 跑本地 Steering 实验**：不再受 API 限制，直接在模型激活层操作，对"Verbosity/Terseness"等简单概念尝试提取 steering vector
2. **构建 per-model Steering 库**：每当有新的热门开源模型发布，社区不仅做量化版本，也同步提取 boostable features 集合，形成可复用的 Steering 资产
3. **在本地知识库场景压缩上下文**：尝试将"熟悉我的代码库"这类长 token 序列概念提取为 Steering vector，从 working memory 转移到 implicit memory，减少 context window 占用
4. **用组合式 Steering 代替单一大向量**：复杂的概念（如"代码审查严格模式"）可能需要多个简单向量组合叠加，避免单一向量与整个模型权重高度重叠
5. **Steering 作为 Agent Harness 的条件开关**：在 Agent 系统中根据任务类型动态注入不同的 Steering 向量——例如 coding agent 注入"精确性"向量，闲聊 agent 注入"随和性"向量，无需重新加载模型

---

