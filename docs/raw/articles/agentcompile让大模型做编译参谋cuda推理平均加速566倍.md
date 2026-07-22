---
sha256: df5fb2794a54b7068a86df8deb0cd26b68a37bb6275507e6a1a609294cdeaa4d
source: wechat
source_url: https://mp.weixin.qq.com/s/IDPj1f3cXd1b4Y3u1IUxjA
ingested: 2026-07-22
feed_name: PaperWeekly
wechat_mp_fakeid: MP_WXS_3201788143
source_published: 2026-07-16
---

# AgentCompile让大模型做“编译参谋”，CUDA推理平均加速5.66倍

---
source: wechat
source_url: https://mp.weixin.qq.com/s/IDPj1f3cXd1b4Y3u1IUxjA
ingested: 2026-07-22
source_published: 2026年7月16日 23:24
---

# AgentCompile让大模型做“编译参谋”，CUDA推理平均加速5.66倍

随着大语言模型进入真实应用，推理成本正在成为限制落地的重要瓶颈。

  


一次生成任务背后，往往包含长上下文预填充、逐 token 解码、KV cache 读写、矩阵乘法、注意力计算和大量框架调度开销。

  


PyTorch、torch.compile 和 vLLM 已经分别从动态图执行、图编译融合、服务调度等方向进行优化，但真实 Transformer 模型的计算图复杂且动态。

  


哪些区域值得生成 CUDA 内核、哪些实现族更有潜力、哪些融合边界足够安全，仍需要更强的语义判断。

  


这也是论文试图解决的核心矛盾。传统编译器可靠、可验证，但面对复杂模型图时常依赖人工规则和保守策略。

  


大模型具备模式理解和经验推断能力，却不能被直接信任去决定底层 GPU 代码。

  


CUDA 内核稍有索引、同步、越界、数据类型或 launch 配置错误，就可能造成错误结果甚至程序崩溃。

  


因此，团队选择把大模型用于“搜索和判断”，而把“执行和验收”留给编译系统。

  


香港城市大学及香港城市大学（东莞）团队提出 AgentCompile，一个面向 Transformer 推理优化的 LLM 引导编译框架。

  


  


  


论文标题：

AgentCompile: An LLM-Guided Compiler for Direct CUDA Inference

论文地址：

https://arxiv.org/abs/2606.07665

  


它的核心思想不是让大模型直接写 CUDA 代码，而是让大模型只在“语义决策”环节提供建议：识别图区域的计算模式，给出候选实现优先级、参数提示和风险标注。

  


真正涉及正确性和执行行为的部分，始终由编译器控制，包括候选空间构造、接口检查、模板化 CUDA 生成、编译、数值验证、性能测试和失败回退。

  


因此，AgentCompile 把大模型放在“参谋”位置，而不是“最终裁判”或“代码执行者”。

  


具体而言，AgentCompile 首先从 PyTorch 或 HuggingFace 模型中捕获计算图，并记录张量形状、数据类型、布局、依赖关系等元数据。

  


随后，图分析器将计算图划分为可优化区域，识别 GEMM、softmax、归一化、elementwise 链、reduction-pointwise 等模式。

  


规划器在编译器定义的合法空间内枚举融合方式、调度方案、内存策略和并行参数。

  


LLM 看到的是结构化区域摘要和有边界的候选空间，可以建议区域语义、模板优先级和参数风险，但不能创建越界候选，也不能绕过硬件、接口和依赖约束。

  


论文中的三张图进一步说明了这一设计。

  


图 1 从推理栈角度对比标准 PyTorch 与 AgentCompile：前者更多依赖框架层调度、动态缓存和通用库调用，后者作为编译与运行时替换层，将 Python 模型代码下沉到更直接的 CUDA 执行路径。

  


  


图 2 以代表性区域 r5 为例，展示“从图区域到已验证 CUDA 候选”的流程：Graph Analyzer 先生成结构化区域摘要，LLM 可判断其类似 softmax 或 normalization 并给出标签、候选偏好、参数和风险提示。

  


Planner 仍要检查依赖、归约语义、dtype、layout、模板可用性和硬件限制，只有通过约束过滤的 kernel plan 才会进入 CUDA Code Generator，并在验证后成为最终候选。

图 3 展示 Llama-3.2-3B-Instruct 上不同输入、输出长度下的扩展趋势，对比 PyTorch eager、torch.compile+FlashAttention 和 AgentCompile，说明 AgentCompile 在长输出和长上下文场景中能持续减少解码侧开销。

从图示也可以看出，AgentCompile 并不是单一 kernel 技巧，而是一条完整链路：前端捕获模型，构建统一中间表示；中间阶段分析图区域，构造受限候选计划；后端再生成 CUDA、验证、基准测试并打包输出。

  


三张图分别对应“替换哪些推理栈”“核心运行机理”“端到端性能如何随长度变化”。

  


在 CUDA 生成阶段，系统采用确定性模板实例化候选内核，覆盖 elementwise、reduction、softmax、LayerNorm/RMSNorm、GEMM、Tensor-Core GEMM 以及面向解码的 GEMV 等类型。

  


生成后的候选必须经过编译过滤、接口检查、数值对比、结构化测试、冒烟测试和端到端一致性检查。

  


最终选择不是依据大模型的“信心分数”，而是只在通过验证的候选中按实测延迟选择最快实现。如果没有候选符合“安全+有利”原则，系统会回退到原框架路径。

  


论文还将编译器生成能力与端到端运行时优化明确区分。

  


AgentCompile 推理路径结合了 CUDALinear、自定义 GEMV、FlashAttention with KV cache update、固定 KV 缓存管理、CUDA Graph replay 以及若干 Triton/C++ 融合解码内核。

  


自回归解码阶段大量线性层实际是 M=1 的 GEMV 工作负载，通用 GEMM 路径会带来不必要的布局和调度开销。

  


AgentCompile 为这一场景生成专门 GEMV 路径，并结合 CUDA Graph 减少逐 token 循环中的 Python 调度和 kernel launch 成本。

  


实验在 NVIDIA A800 SXM4 80GB GPU 上进行，模型包括 Qwen3-1.7B、Qwen3-4B、Llama-3.2-1B-Instruct 和 Llama-3.2-3B-Instruct，采用 float16 精度，覆盖 128 到 40960 token 输入和 32 到 32768 token 输出。

  


这类设置覆盖了短提示、长上下文和超长输出，更接近真实应用中不断增长的上下文窗口和连续生成需求。

  


结果显示，对于 Qwen3-1.7B、Qwen3-4B 和 Llama-3.2-1B-Instruct 三个模型，AgentCompile 相对 PyTorch eager 分别取得平均 5.66 倍、4.05 倍和 4.26 倍加速，相对 torch.compile 分别取得平均 2.27 倍、1.79 倍和 1.81 倍加速。

  


与 vLLM 相比，在 Qwen3-1.7B 和 Llama-3.2-3B-Instruct 上也保持略快的平均端到端表现（1.06~1.07 倍加速）。

  


这项研究给出了一个更保守也更工程化的“大模型+编译器”协作范式：大模型负责语义理解和搜索排序，编译器负责边界、正确性和测量。

  


相比直接让 LLM 生成 GPU 内核，AgentCompile 降低了错误索引、同步缺陷、越界访问、数据类型处理不当和硬件假设错误等风险。

  


相比传统纯规则编译器，它又能利用大模型对复杂图模式和候选优先级的语义判断能力。对于依赖长上下文和高吞吐推理的大模型应用，这种 “LLM 引导、编译器把关”的路线提供了兼顾性能、可靠性与可扩展性的探索方向。

  


更重要的是，这种路线具有可迁移意义。未来如果模型结构、硬件平台或 kernel 模板继续变化，系统可以继续由编译器定义合法候选空间，再让 LLM 帮助排序和发现高价值区域。

  


它不要求完全相信大模型，也不放弃传统编译系统的确定性，而是把二者放在各自擅长的位置上：一个负责理解，一个负责约束；一个提出假设，一个用编译、验证和实测来决定是否采用。

  


  


**更多阅读**

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721092&idx=2&sn=13679791b1dc6f5fc4e420bf8788522f&scene=21#wechat_redirect>)[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247720971&idx=2&sn=dbc7ce93a7438c76efc3a48af0dfbb9d&scene=21#wechat_redirect>)[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247720875&idx=1&sn=8de98ec12cea35a3f51c4c9372d43690&scene=21#wechat_redirect>)  
  


**# 投 稿 通 道#**

**  让你的文字被更多人看到 **

  


  


如何才能让更多的优质内容以更短路径到达读者群体，缩短读者寻找优质内容的成本呢？**答案就是：你不认识的人。**

  


总有一些你不认识的人，知道你想知道的东西。PaperWeekly 或许可以成为一座桥梁，促使不同背景、不同方向的学者和学术灵感相互碰撞，迸发出更多的可能性。 

  


PaperWeekly 鼓励高校实验室或个人，在我们的平台上分享各类优质内容，可以是**最新论文解读** ，也可以是**学术热点剖析** 、**科研心得** 或**竞赛经验讲解** 等。我们的目的只有一个，让知识真正流动起来。

  


📝 **稿件基本要求：**

• 文章确系个人**原创作品** ，未曾在公开渠道发表，如为其他平台已发表或待发表的文章，请明确标注 

• 稿件建议以 **markdown**  格式撰写，文中配图以附件形式发送，要求图片清晰，无版权问题

• PaperWeekly 尊重原作者署名权，并将为每篇被采纳的原创首发稿件，提供**业内具有竞争力稿酬** ，具体依据文章阅读量和文章质量阶梯制结算

  


📬 **投稿通道：**

• 投稿邮箱：hr@paperweekly.site 

• 来稿请备注即时联系方式（微信），以便我们在稿件选用的第一时间联系作者

• 您也可以直接添加小编微信（**pwbot02** ）快速投稿，备注：姓名-投稿

  


**△长按添加PaperWeekly小编**

  


  


  


🔍

  


现在，在**「知乎」** 也能找到我们了

进入知乎首页搜索**「PaperWeekly」**

点击**「关注」** 订阅我们的专栏吧

  


  


·
