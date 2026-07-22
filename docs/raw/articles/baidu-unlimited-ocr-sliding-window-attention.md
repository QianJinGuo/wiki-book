---
title: "百度提出 Unlimited OCR：用 Reference Sliding Window Attention 实现长文档 OCR 常量 KV Cache"
source_url: "https://mp.weixin.qq.com/s/0iBP0zGJlHFhyiObsdXDVQ"
created: 2026-07-01
updated: 2026-07-01
type: article
tags: [wechat, ocr, baidu, attention, deepseek-ocr]
ingested: 2026-07-01
sha256: ff528d65002b34fd1cd83b1564fa142ca0eaac534d33a21f11733ace7936c045
---

# 百度提出 Unlimited OCR：用 Reference Sliding Window Attention 实现长文档 OCR 常量 KV Cache

一句话讲清楚👉🏻 百度提出 Unlimited OCR ，用 Reference Sliding Window Attention 替换 DeepSeek-OCR 解码器里的标准注意力，让长文档 OCR 的 KV cache 保持常量，同时在 OmniDocBench 上把总体分数推到 93.23 。

论文标题：Unlimited OCR Works Welcome the Era of One-shot Long-horizon Parsing

论文链接：https://arxiv.org/abs/2606.23050

Github 链接：https://github.com/baidu/Unlimited-OCR

长文档 OCR 最让工程师头疼的地方，通常出现在多页连续解析。

一页 PDF 送进去，模型吐出文字、公式、表格和阅读顺序，这件事已经被很多端到端 VLM 做得相当成熟。真正麻烦的是几十页文档连在一起：合同、论文、教材、扫描书、会议材料，一旦页面数上来，系统通常会退回到 page-by-page 的 for-loop 。

这个方案好用，但很笨。每一页都重新编码、重新解析、重新拼接，模型本身没有连续工作状态，外部调度器负责把几十个短任务缝起来。页面边界附近的上下文会断开，速度也不稳定；如果输出越长，解码器的 KV cache 越大，后面的 token 会越来越慢。

换到工程视角看，它更像把 OCR 系统从“每页重新开工”的批处理脚本，改成一个能连续工作的解析进程：原图一直挂在内存里，输出历史只保留最近一小段状态。

Unlimited OCR 就是把这个工作记忆机制塞进 OCR 解码器。

论文的核心改动叫 Reference Sliding Window Attention ，简称 R-SWA 。 每个输出 token 仍然能看见完整的参考信息，也就是视觉 token 和 prompt ；但对已经生成的文本，只看最近  个 token ，默认窗口宽度为 128 。这样一来，模型的输出侧 KV cache 从“随生成长度增长”变成“固定在一个小窗口里”。

R-SWA 的注意力范围：参考 token 全程可见，输出 token 只保留最近窗口，从而让 KV cache 保持常量。

长文档 OCR 卡在解码器

传统文档 OCR 多数是 pipeline ：先检测版面块，再对文字、公式、表格分别识别，最后重组阅读顺序。近几年端到端模型开始流行，把检测和识别压进一个 VLM ，让模型直接从页面图像生成结构化文本。

这条路线的优势很明显：流程更统一，复杂版面里的跨块关系也更容易由模型直接建模。 DeepSeek-OCR 、 PaddleOCR-VL 、 MinerU 、 olmOCR 、 dots.ocr 等工作都在往这个方向走。

可端到端 OCR 有一个天然压力：视觉输入要压缩得足够狠，文本输出还要生成得足够长。 如果视觉 token 太多， prefill 阶段就会吃掉大量显存；如果输出 token 太长， decoder 的 KV cache 又会一路增长。

DeepSeek-OCR 的 DeepEncoder 已经解决了前半段压力。它把 SAM-ViT 和 CLIP-ViT 级联起来，在 bridge 处做 16 倍 token 压缩。论文里给出的数字很直观：一张 1024×1024 的 PDF 图像可以压到 256 个视觉 token 。对多页文档来说，这个压缩率非常关键。

剩下的瓶颈转移到了 decoder 。

假设 1 个视觉 token 大约对应 10 个输出文本 token ，那么 10K 个视觉 token ，也就是大约 20 到 30 页文档，就可能需要 100K 级别的输出长度。标准 full attention 会让每一步都看见完整历史，表达力强，但 KV cache 也随  增长。长文档越往后，显存越紧，延迟越高。

Unlimited OCR 的判断很直接： OCR 这种 reference-based parsing 任务，并不需要每个新 token 都回看完整输出历史。模型需要完整参考源，需要附近输出状态来定位进度，远处输出只要已经被“写完”，就可以从解码窗口里退出。

R-SWA ：参考信息常驻，历史输出滑动

R-SWA 的注意力集合由两段组成。

第一段是 prefix ，也就是视觉 token 和 prompt ，长度记为 。这部分在一次推理里保持固定，所有后续 token 都能访问。

第二段是 decode region 的滑动窗口，宽度记为 。它只包含当前 token 之前最近的一段输出。

论文给出的可访问集合是：

这里， 表示长度为  的 prefix segment ， 表示 decode region 上宽度为  的 causal sliding window 。换成 OCR 语境， 就是“原文一直摆在眼前”， 就是“只记得刚刚写过的一小段”。

在这个集合上，注意力权重仍然是标准 softmax ：

输出表示也还是对 value 做加权求和：

其中 、、 分别是 query 、 key 、 value 向量， 是 key 向量维度。也就是说， R-SWA 没有发明一套奇怪的新算子，它改变的是注意力能访问哪些位置。

这个设计比普通 Sliding Window Attention 更适合 OCR 。普通 SWA 如果把所有 token 都放进滑动状态里，视觉 token 也会被一起“滚动”和更新，参考图像特征可能在长序列里逐步变糊。 R-SWA 把参考 token 排除在状态转移之外，让视觉信息长期静态保留。模型一直能看清原图，只对输出历史做软遗忘。

KV cache 从线性增长变成常量上界

标准 MHA 的 cache 长度可以写成：

 是已经生成的 token 总数。输出越长， cache 越长。

R-SWA 下，模型保存完整 prefix cache ，同时只保留最近  个输出 token ：

如果进一步看两者比例：

当输出足够长，且  时，比例会变成：

长文档场景里， 往往远大于 。这意味着输出越长， R-SWA 相对标准 MHA 的 cache 节省越明显。

这里有个值得注意的取舍： Unlimited OCR 的改动集中在输出侧。视觉 token 仍然要先进 prefill ，模型最大上下文长度仍然限制一次能塞进去多少页。论文里的“unlimited”更准确地说，是把 decode-side 的线性增长掐掉，让长输出不再成为主要瓶颈。

Unlimited OCR 架构： DeepEncoder 负责高压缩视觉编码， MoE-LLM decoder 的所有注意力层替换为 R-SWA ，输出 KV 以固定容量队列维护。

模型怎么训练

Unlimited OCR 直接建立在 DeepSeek-OCR checkpoint 上。

架构上，它保留 DeepEncoder ，也保留 MoE decoder 的规模设定：总参数 3B ，推理时激活 500M 。训练时冻结 DeepEncoder ，只训练 LLM 参数。这个选择很务实： DeepEncoder 已经足够适合高分辨率文档图像，论文要验证的是 decoder attention 的替换能不能撑住长文档解析。

数据方面，论文构建了约 200 万个文档 OCR 样本，单页和多页比例为 9:1 。单页 PDF 数据用 Paddle OCR 做标注，把每个 block 的坐标和内容拼成端到端检测、解析的 ground truth ；坐标归一化到 0 到 1000 。多页数据则由单页数据随机拼接合成，约 20 万条，页数从 2 到 50 页不等，并用页面分隔符连接。

训练设置也给得比较清楚：

■
继续训练 4,000 steps 。
■
global batch size 为 256 。
■
最大序列长度为 32K 。
■
使用 8 张 16GB A800 GPU 。
■
优化器为 AdamW ，学习率初始值 1e-4 ，并采用 cosine annealing scheduler 。
■
为支持 32K 训练，使用 DeepEP ， expert parallelism 设置为 4 。
■
训练 pipeline 基于 Megatron-LM 。

推理侧，团队在 Transformers 里实现了 R-SWA 的 KV cache 管理，也在 SGLang 推理引擎里做了支持和优化。论文强调，两套框架都能让 Unlimited OCR 在推理时保持稳定 TPS 和稳定显存。

我理解这篇论文最有工程价值的地方，也在这里：它没有要求重训一个庞大的 OCR 基座，而是在已有 DeepSeek-OCR 的基础上改 decoder attention ，再用相对集中的文档数据继续训练。对行业落地来说，这比“从零训练一个更大模型”更有参考意义。

单页 benchmark ：准确率没有被滑窗吃掉

很多人看到滑动窗口注意力，第一反应会担心准确率下降。 OCR 里这种担心更合理，因为文档解析既要识别字符，还要处理公式、表格结构和阅读顺序。窗口太窄，模型会不会忘记前面版面的结构？

OmniDocBench 结果给出的答案相当强。

在 v1.5 上， Unlimited OCR 相比 DeepSeek-OCR 的 overall 从 87.01 提升到 93.23 ，提升 6.22 分； Text Edit Distance 从 0.073 降到 0.038 ； Formula CDM 从 83.37 升到 92.61 ； Table TEDS 从 84.97 升到 90.93 ； Reading Order Edit Distance 从 0.086 降到 0.045 。

模型
	
Overall↑
	
文本 Edit↓
	
公式 CDM↑


GPT-4o
	
75.02
	
0.217
	
79.70


Qwen2.5-VL
	
87.02
	
0.094
	
88.27


DeepSeek-OCR
	
87.01
	
0.073
	
83.37


DeepSeek-OCR 2
	
89.17
	
0.049
	
86.85


Unlimited OCR
	
93.23
	
0.038
	
92.61

表格指标也很亮眼： Unlimited OCR 的 Table TEDS 是 90.93 ， Table TEDS-S 是 94.07 ，阅读顺序 edit distance 为 0.045 。论文还在 v1.6 上和更新的端到端 OCR 模型比较， Unlimited OCR 的 overall 达到 93.92 ，略高于 Qianfan-OCR 的 93.90 ，也高于 FireRed-OCR 、 Logics-Parsing-v2 、 DeepSeek-OCR 2 等模型。

更值得盯住的是窗口宽度 128 这个设定：如果它太短，模型会跳行、重复或丢阅读顺序；现在这些指标反而上升，说明局部输出状态已经足够支撑单页解析。

论文在子类别上也做了拆分。 OmniDocBench v1.5 包含 PPT 、学术论文、书籍、彩色教材、试卷、杂志、报纸、笔记、研究报告 9 类。 Unlimited OCR 在文本 edit distance 和阅读顺序上整体表现稳定，尤其在报纸、笔记、杂志这类版面更复杂的材料上，没有因为替换 attention 而出现明显短板。

我的判断是， R-SWA 的窗口宽度 128 在 OCR 任务里踩中了一个比较舒服的位置：足够保存局部生成状态，避免重复、跳行、迷路；又足够短，能把 cache 增长压住。它不适合那种需要频繁回看长历史、做多轮推理或保持全局设定一致的生成任务；它最吃香的场景，是参考源稳定、输出顺序明确、远处历史主要承担“已完成标记”的解析任务。

长文档： 40 页以上仍能跑

单页结果只是基础。 Unlimited OCR 真正想证明的是 one-shot long-horizon parsing 。

论文构建了内部长文档测试集，材料包括小说、文档和论文，并按页数分成 2 、 5 、 10 、 15 、 20 、 40+ 页，每个类别不少于 10 本。指标包括 Distinct-n 和 Edit Distance 。 Distinct-n 衡量生成文本中独特 n-gram 占比，越高表示重复问题越少； Edit Distance 越低表示识别越准确。

结果可以压缩成三句话：

■
2 页到 20 页范围内， Distinct-20 基本维持在 97% 到 99% 以上。
■
40+ 页时， Distinct-35 仍有 96.90%， Edit Distance 为 0.1069 。
■
重复错误集中在小字号 PDF 上，这也提醒我们： R-SWA 解决的是解码侧越跑越慢、越跑越占 cache 的问题；如果输入图像本身被 1024 分辨率压得太狠，识别精度仍会被 encoder 上限卡住。

40+ 页结果还谈不上完美。 0.1069 的 edit distance 说明长页数仍然会损失一些准确率。更值得看的是输出过程没有崩成重复循环，也没有因为 KV cache 持续膨胀而越跑越慢。

对真实应用来说，这一点很要紧。 OCR 系统常见的失败包括整段重复、漏页、顺序错乱，或者后半部分速度越来越慢。 R-SWA 试图把这些问题从架构层面压下去。

速度曲线：越长越占便宜

论文单独测了 Flash Attention v3 kernel 的延迟。 DeepSeek-OCR 使用标准 MHA ，随着 decode length 增长，每次调用的耗时上升； Unlimited OCR 使用 R-SWA 后，耗时基本保持平坦。

Flash Attention v3 kernel 延迟对比：标准 MHA 随输出长度增长变慢， R-SWA 基本保持稳定。

论文还给了理论推理性能上限对比。 prefill length 固定为 10 ，其他设置相同：

输出长度
	
DeepSeek-OCR TPS
	
Unlimited OCR TPS
	
差距


256
	
7229.32
	
7229.52
	
接近


1024
	
7422.50
	
7840.94
	
UOW 更快


4096
	
6430.21
	
7905.18
	
差距扩大


6144
	
5822.87
	
7847.71
	
约 35%优势

在短输出里，两者差距很小；输出到 6,000 token 左右，标准 MHA 的 TPS 已经明显掉下去， Unlimited OCR 还能保持在 7,800 以上。论文在 OmniDocBench 上也报告了实际吞吐： Unlimited OCR 达到 5580 TPS ， DeepSeek-OCR 为 4951 TPS ，在 Base DeepEncoder 模式下提升 12.7%。

对部署方来说，这个变化很具体：队列里塞进一批长合同或扫描书时，系统不用担心后半段 token 越生成越慢，显存预算和处理时长都更容易提前估出来。做批量文档解析时，稳定吞吐往往比峰值吞吐更重要，因为系统要估算成本、排队时间和服务容量。

为什么这件事可能超出 OCR

论文把 R-SWA 定位成 general-purpose parsing attention mechanism ，潜在应用包括 ASR 、翻译等 reference-based 任务。

这个说法可以理解，但需要稍微收窄一点看。

R-SWA 适合的任务最好满足三个条件：

1.
有一个固定参考源，比如图像、音频、原文句段或长文档。
2.
输出大体按顺序生成，不需要频繁回看很远的输出历史。
3.
远处输出对当前 token 的价值主要是“已经完成过”，参与复杂推理的需求较弱。

OCR 符合得很好。 ASR 也有相似之处：音频参考源固定，转写文本按时间展开，当前词通常依赖邻近文本和对应音频片段。翻译稍复杂一些，长距离术语一致性、篇章照应、指代关系可能会要求更长历史；但如果把 reference token 设计好，再加上术语表或记忆机制，也有机会受益。

我不太愿意把它说成“注意力的新终局”。更准确的评价是：在一类 reference-driven 的生成任务里， full attention 可能过度奢侈。把参考源常驻、输出历史滑动化，是一种很干净的复杂度削减。

也别忽略限制

Unlimited OCR 还没有真正摆脱上下文长度。

论文自己也承认，有限 context length 下无法做到真正无限解析。 DeepEncoder 虽然压缩率高，但页数继续增加， prefill 仍然会变长。现在模型最大序列长度是 32K ，更多页面仍会碰到输入侧限制。

短期方案是训练更长上下文版本，比如 128K ，以支持更多页面的 prefill 。长期设想更有意思：构建一个 prefill pool ，让模型学会自动取回需要的 prefill KV chunk 。论文把它类比为人翻书，看到当前页时，需要时再翻回参考位置，避免把整本书一次性塞进工作记忆。

还有一个现实问题：长文档 OCR 的评价很难。内部测试集能说明趋势，但公开 benchmark 目前还更偏单页或短文档。未来如果要证明“几十页一次读完”具备生产可用性，还需要更开放的长文档集合，覆盖扫描质量、字体大小、跨页表格、目录、脚注、双栏论文、手写笔记等复杂情况。

最后， R-SWA 的窗口宽度也可能需要按任务调整。 OCR 默认 128 合理， ASR 或翻译未必相同。如果窗口太短，模型可能丢掉术语一致性；太长，又会削弱节省 cache 的收益。这部分还有实验空间。

我的看法

这篇论文的吸引力，不在于把 OCR benchmark 又刷高了几个点，而在于它重新审视了端到端 OCR 的解码过程。

过去很多优化会集中在更强的 encoder 、更大的 VLM 、更好的数据、更复杂的后处理。 Unlimited OCR 换了一个角度：如果任务本质是“看着参考源连续抄写”，那 decoder 真的需要完整输出历史吗？

R-SWA 给出的答案是：参考源要完整保存，输出历史可以有选择地遗忘。

这句话很简单，但落到系统里就是显存、延迟、页数上限和批量吞吐的变化。它也让 DeepSeek-OCR 这类高压缩 encoder 的价值被进一步放大：输入侧压得住，输出侧不膨胀，几十页文档才可能在一次 forward pass 里完成。

如果代码和权重后续保持活跃，这个方向最值得看的会是实际文档工作流：一份 40 页合同能不能稳定解析，跨页表格能不能保住结构，扫描书的小字能不能在高分辨率模式下改善， SGLang 部署时吞吐是否能稳定复现。

OCR 终于从“逐页处理的工具链”，开始向“连续阅读的模型”迈了一步。

⭐️关注我，实时跟进 AI 最新进展⭐️