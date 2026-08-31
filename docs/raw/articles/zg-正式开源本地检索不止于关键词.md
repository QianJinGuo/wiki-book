---
source: rss
source_url: https://mp.weixin.qq.com/s?__biz=Mzg4NTczNzg2OA==&mid=2247511367&idx=1&sn=7a7ea589cdf19b68dc5eb8b9f04e8030
ingested: 2026-09-01
feed_name: WeChat-阿里技术
source_published: 2026-08-31
sha256: a7af89e7abbe8cf9
---

|---|---  
代码| C/C++、Go、Java、JavaScript/TypeScript、Python、Rust，以及 Vue、Svelte 组件文件| 对支持结构解析的语言提取符号、签名与层级信息；从 Vue、Svelte 中提取脚本内容；其他代码按通用文本处理  
文档| Markdown、纯文本、RST、HTML/XML| Markdown 按标题与章节提取，其他文档切分为可定位的文本片段  
文本与数据文件| CSV、JSON、TOML、YAML，以及其他可识别为文本的文件| 通过通用文本提取参与索引  
  
代码仓库、项目文档、研究资料与本地知识库都可以成为检索对象；路径、Glob、文件类型和忽略规则可以进一步限定检索范围，让内容覆盖的扩大不以增加结果噪声为代价。

### **少走弯路，更省 Token 与时间**

zg 关注的不只是单次查询速度，更是 Agent 完成整个任务所需的搜索轮次、Token 与时间。为减少反复尝试关键词、读取无关文件和拼接上下文产生的消耗，zg 对完整检索链路进行了针对性优化：

  * **检索决策优化** ：通过 MCP 工具描述与使用指引，帮助 Agent 根据问题中是否存在明确关键词、位置或符号，选择适合的检索方式，并在信息充分时停止搜索，减少无效试探；
  * **召回与排序优化** ：联合 BM25 与向量检索生成候选结果，通过 RRF（Reciprocal Rank Fusion）完成多路结果融合、去重与统一排序，让相关内容更早出现，减少无关文件读取；
  * **内容组织优化** ：按代码符号、文档章节等结构提取可独立定位的信息单元，并保留文件路径与来源位置，减少 Agent 从完整文件中手工拼接上下文的成本；
  * **上下文输出优化** ：默认返回经过排序的紧凑结果与有限预览，需要时再读取完整内容，避免大量无关文本直接进入 Agent 上下文。



这些优化最终需要在完整任务中体现价值，而不只是让单次查询看起来更快。为此，我们在代码仓库问答 **SWE-QA-Bench** 和深度研究问答 **BrowseComp-Plus** 上进行了配对 A/B 评测。其中，SWE-QA-Bench 包含 20 个真实代码仓库问答任务，要求 Agent 跨文件定位实现并完成多步推理；BrowseComp-Plus 包含 80 个深度研究问题，要求 Agent 从大规模固定语料中检索并整合多文档证据。

> 评测说明：每组实验均保持 Agent、模型、Prompt、运行环境与任务限制一致。Baseline 使用 Agent 的标准工具，zg 方案仅增加预建索引、MCP 工具与使用指引。预建索引会产生一次性时间与计算开销，远程 Embedding 还会带来 Token 与调用费用；但索引可跨查询和 Agent 任务复用，后续仅需增量处理变化内容，成本经持续摊薄后通常可以忽略，因此未计入上表。

在 SWE-QA-Bench 中，zg 在将**工具调用减少超过一半、输入 Token 减少近一半** 的同时，评审得分提升了 1.50 分；在 BrowseComp-Plus 中，准确率由 98.67% 提升至 99.00%，**输入 Token 减少 37.56%、工具调用减少 43.52%、Agent 耗时减少 38.58%** 。两项结果表明，zg 能够在**代码与非代码场景中减少无效搜索和上下文消耗，同时保持任务质量** 。完整评测协议、指标定义与复现方式参见**性能测试文档** 。

### **本地优先，数据流向由你决定**

代码、内部文档等本地内容往往包含未公开或敏感信息，检索过程中的数据流向至关重要。因此，zg 将本地处理设为默认：**文件扫描、内容提取、本地 Embedding、索引与检索均在设备内完成** ，完整流程无需上传内容或依赖外部服务。

这套本地路径由端侧模型与嵌入式索引实现：

  * **本地 Embedding** ：内置十一种端侧模型，覆盖代码、文档、多语言、长输入与轻量运行等不同需求。默认的 `local/potion-code-16m-v2` 是 16M 级静态模型，本地缓存约 32 MiB，无需 GPU 即可运行；在 SWE-QA-Bench 上，它在取得**接近**`**qwen/qwen3.7-text-embedding**`**的任务效果** 的同时，**大幅缩短 Embedding 耗时并免去远程调用成本** ，以 Django 仓库（3,457 个文件）为例，在 Apple M4 Pro 上完整索引耗时不超过半分钟；**  
**


  * **端侧存储与检索** ：Zvec 以嵌入式方式将向量与 BM25 索引存储在设备内，无需部署和维护独立数据库服务。CLI 与 MCP 可以复用同一份本地索引，让人与 Agent 的核心检索流程无需依赖外部存储服务。



在默认本地路径之外，zg 也保留了模型选择的灵活性。当本地模型无法满足检索质量、多语言覆盖或设备资源条件时，用户可以按需使用远程 Embedding。远程能力不会自动启用，相关文本或查询只有在显式授权后才会离开设备，从而兼顾能力扩展与数据隐私。

04

现状与规划

目前，zg 已覆盖本地检索的核心链路，并在此基础上向更完整的检索基础设施演进。下表对比了不同工具的产品侧重与能力边界，同时标明 zg 的现有能力与后续方向。

> ✅ / ❌ 表示当前是否支持，❌* 表示 zg 已规划但尚未支持；High / Medium / Poor 表示能力深度。定级分别考察属性过滤的可用维度、Embedding 的模型覆盖与配置能力，以及代码和文本的格式覆盖、识别粒度、结构化切分与元数据保留。

面向更完整的检索基础设施，zg 将重点推进四个方向：

  * **增强检索能力** ：在 BM25、向量检索与 rg 之外，引入图检索和更多结构化信号，完善查询规划、结果融合、重排与解释能力，更好地覆盖从模糊探索到精确验证的完整过程；
  * **拓展内容边界** ：逐步支持 PDF、Word、PowerPoint，并完善图片 OCR、版面结构提取与跨模态理解，让更多本地信息能够被提取、组织和检索；
  * **提高上下文效率** ：持续优化结果去重、组织、预览与上下文选择，提高有效信息密度，让 Agent 用更少的搜索轮次和 Token 获得任务所需的信息；
  * **增强本地能力** ：持续优化本地模型、索引效率与资源占用，在完善 macOS、Windows 和 Linux 体验的同时，探索适配 iOS、Android 及更多资源受限的本地运行环境。



与此同时，安装、升级、卸载、增量索引、并发访问、服务自恢复、运行诊断与索引兼容等基础工程也会持续打磨，为上述能力提供顺畅、一致的使用体验。

05

加入我们

zg 基于 Apache 2.0 协议开源。项目仍在起步阶段，我们尤其期待这些反馈与贡献：

  * **真实场景** ：分享 zg 在大型代码库、知识库或 Agent 工作流中的效果与问题；
  * **检索评测** ：共同完善搜索质量、性能与 Agent 上下文效率的可复现 Benchmark；
  * **代码与文档** ：贡献新格式提取、模型支持、Agent 集成、缺陷修复与教程；
  * **产品方向** ：告诉我们哪些检索任务最难、哪些结果最有用，以及哪些默认行为仍不够自然。



**项目地址** ：github.com/zvec-ai/zvec-grep

### **参考资料**

[01]SWE-QA-Bench

<https://github.com/zvec-ai/zvec-grep/blob/main/benchmarks/swe-qa-bench/README_CN.md>

[02]BrowseComp-Plus

<https://github.com/zvec-ai/zvec-grep/blob/main/benchmarks/browse-comp-plus/README_CN.md>

[03]性能测试文档

<https://github.com/zvec-ai/zvec-grep/blob/main/benchmarks/README_CN.md>

[04]Django

<https://github.com/django/django>

[05]zg

<https://github.com/zvec-ai/zvec-grep>

[06]rg

<https://github.com/BurntSushi/ripgrep>

[07]Semble

<https://github.com/MinishLab/semble>

[08]qmd

<https://github.com/tobi/qmd>

[09]CodeGraph

<https://github.com/colbymchenry/codegraph>

欢迎留言一起参与讨论~

[阅读原文](<http://github.com/zvec-ai/zvec-grep>)

[跳转微信打开](<https://wechat2rss.xlab.app/link-proxy/?k=2ff1732f&r=1&u=https%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzg4NTczNzg2OA%3D%3D%26mid%3D2247511367%26idx%3D1%26sn%3D7a7ea589cdf19b68dc5eb8b9f04e8030>)