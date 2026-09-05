---
source: wechat
source_url: https://mp.weixin.qq.com/s/8NsgMxXYqL3wJKdVMSku7A
ingested: 2026-07-27
feed_name: 数据STUDIO
wechat_mp_fakeid: MP_WXS_3949259461
source_published: 2026-07-27
sha256: 6e9d63cb1b760e1ebc602551a676bfc00ce34c1b7c3a4020b082b3d43d7ec82a
sha256: 15379de3404fa2c9a7b81eccda7383ccf5a33971bb8394bc1b5e8053c5f18a48
---

# 北大开源的 DataFlow-Harness 霸榜了！

北京大学 DCAI 团队联合上海算法创新研究院、北京中关村学院于 2026 年 7 月发布 DataFlow-Harness（arXiv 2607.16617），上线后登上 HuggingFace Papers 当日榜第 2。论文里最值得注意的一组数据是：只给 Code Agent MCP 工具、却不给程序性知识（Skills）时，端到端通过率反而从自由脚本的 91.7% 降到 83.3%。加入 Skills、typed mutations 和 Request-Validate-Commit 机制后，通过率回升到 93.3%，成本同时下降 72.5%。做大模型训练、微调或 RAG 知识库，技术路线可以有很多种，但最后几乎都会撞上同一块硬骨头：数据准备。

一个看起来并不复杂的需求，比如“从一批 PDF 教材里抽取高质量 VQA 数据集”，真正拆开后，可能要经过文档解析、版面恢复、图片与表格识别、问题和答案对齐、低质量样本过滤、字段统一，最后才能得到可用于训练的 AI-ready 数据集。

这里面没有哪一步特别特殊，麻烦在于它们必须按正确顺序连起来。每一步又可能依赖不同的算子、Schema、质量标准和执行环境。少一个环节，或者顺序错一下，最后产出的数据就可能“格式没问题，内容却不能用”。

现在常见的做法，是工程师自己写脚本，或者让 Code Agent 先生成一批一次性脚本，再人工拼起来。它通常能解决眼前的任务，但很难进入平台的长期生命周期：数据团队不方便在图形化界面里审计、修改和复用，也很难把它沉淀成一条标准的数据资产。

更现实的问题是，模型会调用不存在的算子，会默认某个参数“应该有”，也会凭旧版本框架知识写出一套看起来合理、实际接不进平台的流程。

DataFlow-Harness 论文把这段距离称为 **NL2Pipeline gap** ：用户说的是自然语言里的工作流意图，生产环境真正需要的，却是一条可检查、可编辑、可复用的平台原生流水线。

DataFlow-Harness 就是在处理这道 gap。它建立在 DataFlow 开源生态之上——DataFlow 已有 7000+ Stars，并获得 ICML SeePhy 比赛冠军和智源 LIC 挑战赛冠军——再叠加一套 Harness 工程约束，让 Agent 只能在真实平台的能力边界内完成数据处理。

最终交付物也不再是一段一次性 Python 脚本，而是一条可以持久化、继续编辑的 Native DAG。

  * 论文地址：https://huggingface.co/papers/2607.16617
  * 开源仓库（DataFlow-Harness 工程交互入口）：https://github.com/OpenDCAI/DataFlow-WebUI
  * 开源仓库（DataFlow 主库）：https://github.com/OpenDCAI/DataFlow

## 01NL2Pipeline gap：MCP 工具给够了，通过率为什么反而下降

我看完整篇论文后，最在意的不是主表里的最高分，而是一个有点反常识的消融结果。

  * 端到端构建：DataFlow-Harness 达到 93.3% observed end-to-end pass rate，接近 Context-Aware Claude Code 的 94.2%。

  * 成本控制：相比 Vanilla Claude Code，成本从 $0.950 降至 $0.261，下降 72.5%。

  * 生成延迟：相比 Vanilla Claude Code，延迟从 190.7s 降至 95.5s，下降 49.9%。

  * 平台产物：DataFlow-Harness 输出的是 Native DAG，可在 DataFlow-WebUI 中查看、编辑和复用。

实验使用同一个 Claude Opus 4.7 模型，覆盖 12 个数据工程任务，每种方法各运行 10 次：

表 1：综合效果对比

MCP-only 是这组实验里最关键的对照。

它已经给了 Agent MCP Tools Layer，也给了实时 operator registry。Agent 能查到平台里有哪些算子、每个算子的参数和 Schema，能读取当前 pipeline 状态，也能提交结构化修改。

唯一拿掉的是 Skills：不再告诉 Agent，这些算子应该按什么顺序连接，哪些步骤不能交换，哪些检查不能省略。

结果，通过率从自由脚本模式的 91.7% 降到 83.3%，少了 8.4 个百分点。

这组下降把 NL2Pipeline gap 直接量化了出来。

给 Agent 一套完整的平台工具，并不等于它会使用这套平台。它知道“有哪些积木”，却未必知道先搭哪一块、哪些块能连在一起，以及什么时候必须先做质量检查。

在自由脚本模式里，模型还能依赖训练中见过的大量代码模式，写出一段大概率能跑的代码。进入平台约束后，它需要同时理解算子依赖、字段流转、Schema 兼容和质量检查顺序。任务没有变简单，只是错误从“代码写错”变成了“流程编排错”。

把 12 个任务按复杂度拆开后，这种差异更明显：

  * **程序性知识密集任务** ，包括 QA 生成、QA with filter、Text-to-QA chain：MCP-only 合计通过 18/30 次，DataFlow-Harness 是 29/30。MCP-only 生成的 DAG 在结构上通常合法，问题出在业务顺序上。比如，它不知道 PDF 解析后要先做 layout recovery，再做 QA matching；也不知道 nested field flatten 之前不能直接做 semantic filter。
  * **自明性路由任务** ，包括字段重命名、Nested flatten、长度过滤、LLM semantic filter：两种方法都是 40/40 通过。这类任务的路径几乎唯一，算子说明本身已经足够。
  * **非合成瓶颈任务** ，例如多字段评分类：两种方法的失败率相同。失败原因来自数值约束，而不是 DAG 结构，流程知识在这里帮不上忙。

所以，Skills 的价值边界其实很清楚。

它不会凭空让 Agent“更聪明”，而是把工程师长期积累的程序性知识编码进去：某类任务应该选哪些算子、顺序怎么排、字段怎么接、哪一道检查不能跳过。

Operator registry 回答的是“平台里有什么”，Skills 回答的是“怎样把这些东西连成一条真正可用的流水线”。

## 02四组件架构：怎样一步步缩小 Agent 的犯错空间

DataFlow-Harness 围绕四个核心组件搭建。它们看起来各自负责一块功能，实际上是一套逐层收紧的约束系统：越往后，Agent 可以自由发挥的地方越少，能犯的低级错误也越少。

### 1\. Data Pipeline Backend：所有修改只认一个状态

Data Pipeline Backend 是整个系统的单一真相源。

一条 pipeline 被形式化为五元组：
    
    
    P = (D, O, E, S, R)  
    

其中，D 表示数据源和 URI 集合，O 表示配置好的算子实例，E 表示算子之间的有向依赖边，S 记录输入输出字段 Schema，R 保存运行时状态，例如模型服务端点。

无论修改来自 Agent 对话，还是用户在 DAG 画布上的手动拖拽，最后都作用在同一份五元组状态上，并写入同一个持久化后端。

这件事听起来只是工程实现细节，却决定了系统能不能持续工作。Agent 和人不再各维护一份“自己理解的 pipeline”，也不需要靠导入导出来同步版本。

### 2\. MCP Tools Layer：Agent 不能直接写脚本，只能提交结构化变更

MCP Tools Layer 负责把 Agent 的意图转换成结构化操作。

Agent 不直接输出 Python 代码，而是通过 typed mutations 修改 pipeline，例如：

  * 添加算子；
  * 删除算子；
  * 更新参数；
  * 连接节点。

每次修改都要经过 Request-Validate-Commit 三步协议：

  1. **Request** ：获取当前 pipeline 状态，其中也包括用户自上一轮对话以来在画布上做过的手动编辑；
  2. **Validate** ：检查两条硬规则——更新后的 DAG 必须无环，相邻算子的 output schema 与 input schema 必须兼容；
  3. **Commit** ：校验通过后写入后端，再通过 WebSocket 把变化广播到前端 DAG 画布。

校验不通过，修改就会被直接拒绝。

这就是 typed mutations 和自由脚本最本质的区别。自由脚本允许 Agent 写出“语法像真的”代码：调用不存在的算子、假设不存在的参数、把两个 Schema 不兼容的节点硬接起来，直到运行时才暴露问题。

在 typed mutations 模式下，这类结构错误在提交前就会被挡住。

不过，论文也很诚实地划出了边界：**structural validity only, not semantic correctness** 。

DAG 无环、Schema 兼容，只能证明结构合法，不能证明流程逻辑正确。系统可以判断算子 A 的输出能不能接到算子 B，却不能自动判断这个任务究竟应该先用 A，还是先用 C。

这部分需要 Skills 补上。

### 3\. DataFlow-Skills：把“会调工具”推进到“会做流程”

DataFlow-Skills 注入的是 MCP Tools Layer 本身没有的程序性知识，主要分成两类。

第一类是 **Procedural Blueprints** ：算子选择模式、Schema 推断规则、参数配置经验、服务端点验证步骤。

第二类是 **Compositional Constraints** ：算子兼容规则、模态匹配约束、嵌套字段的流转约定。例如，某些 OCR 或 text extraction 环节必须出现在 QA matching 之前，某些字段没有先展开，就不能直接进入语义过滤。

这里的 Skills 不是几句泛泛的 Prompt Engineering 提示。它编码的不是“如何做好数据工程”，而是更具体的平台经验：在 DataFlow 上处理某一类任务时，哪些算子应该怎样连接。

表 2： 10 次独立测试中各任务的端到端通过次数

从消融实验看，这层知识是否存在，决定了 MCP-only 的 83.3% 能不能回到 93.3%。

### 4\. DataFlow-WebUI：人和 Agent 操作的是同一条流水线

DataFlow-WebUI 提供两种入口。

用户可以在对话窗口里直接描述需求，让 Agent 自动搭建工作流；也可以在 DAG 画布上拖拽节点、修改参数和调整连线。

两种操作共享同一份 pipeline 状态。

用户在画布上手动改过的内容，会立即提交到后端，下一轮 Agent 对话自动读取最新状态。Agent 生成的 pipeline，也会实时显示在前端 DAG 画布里。WebSocket 负责保持两端同步，不需要额外刷新，也不需要来回导入导出。

这解决了 Code Agent 落地中一个很实际的问题：Agent 生成的流程，工程师通常不敢闭着眼直接跑，总要先看一遍。

如果产出是一段脚本，工程师得逐行读代码，才能判断哪里有问题。换成可视化 DAG 后，很多错误一眼就能看出来：为什么 filter 放在 generate 前面？为什么少了 layout recovery？为什么两个不该相连的节点被接到了一起？

工程师可以直接拖动修改。更重要的是，改完以后，Agent 知道这条 pipeline 已经被人调整过，不会下一轮又从旧状态重新开始。

## 03从 Textbook-to-VQA 到下游训练：上游流程质量会继续往下传

只证明 Agent 能生成一条合法 DAG，还不足以说明这套方法真的有用。

论文除了 12 个数据工程任务，还设计了一个更接近真实生产的 Textbook-to-VQA 场景，以及两个下游训练案例。它们想回答的是另一个问题：流水线搭得更稳，最终训练出来的数据和模型会不会也更好？

### Textbook-to-VQA：复杂流程里，自由度未必是优势

Textbook-to-VQA 要从教材、解答手册和考试答案页中抽取视觉问答数据。

这不是“读一个 PDF，再调用一次模型”就能完成的任务。它需要 PDF 解析、版面结构恢复、OCR、图表抽取、多模态理解，以及跨页面的问题—答案对齐。任何一个环节漏掉，都可能让后面的数据看起来完整，实际上已经错位。

实验中，DataFlow-Harness 的 Precision 达到 0.972，Coverage Rate 达到 0.873，均高于 Vanilla CC（0.621 / 0.533）、Context-Aware CC（0.893 / 0.801）和 MCP-only（0.784 / 0.621）。

表 3：Textbook-to-VQA 抽取性能

这里最值得注意的是 Harness 与 Context-Aware CC 的对比。

Context-Aware CC 拥有完整上下文注入，也可以输出任意合法 Python 代码，自由度比 Harness 更高。但到了多算子协同的复杂流程里，自由度反而扩大了搜索空间：模型需要自己决定使用哪些库、如何连接步骤、怎样保存中间状态，还要不断处理执行错误。

Harness 的做法更克制。它把 Agent 的选择空间压缩到 DataFlow 已有算子体系内，再用 typed mutations 和 Skills 约束组合方式。

论文对此有一句很准确的总结：Harness 的优势来自成熟平台资产的系统性复用，而不是模型推理能力突然变强。

### 数学推理：质量检查有没有被漏掉，会直接反映在训练结果里

数学推理场景中，Agent 要搭建一条完整的数据清洗和合成流水线，包括题目验证、低质样本过滤、问题扩展、推理链生成和 n-gram 去重。

表 4：数学数据合成流水线的下游训练效果

生成的数据用于微调 Qwen2.5-32B-Instruct。训练 2 epochs 后，Harness 数据的平均分为 55.7，Vanilla CC 数据为 54.5。

差距最明显的，是对数据污染更敏感的 benchmark：

  * AIME24@32：1 epoch 时从 25.1 提升到 35.9；
  * AIME25@32：1 epoch 时从 21.6 提升到 34.5。

这类 benchmark 很容易受到“表面正确、推理链却有问题”的样本影响。Harness 管道把验证、过滤和去重固定成流水线步骤，减少了 Agent 漏做某一道质量检查的机会。

这里的提升不是因为 Agent 在某一刻突然写出了更聪明的推理，而是因为数据生产过程中少漏了几道本来就该做的检查。

### 通用 SFT：稳定的数据生产流程也会影响代码能力

通用 SFT 场景中，Agent 从零构建通用指令数据合成流程：主题条件生成、critique-then-rewrite、LLM-as-judge 评分过滤。

表 5：通用 SFT 数据合成流水线的下游训练效果

最终产出 10K 条 instruction-response 数据，用于微调 Qwen2.5-7B-Base。九个 benchmark 的总体平均分从 61.5 提升到 63.8。

提升较明显的两个代码 benchmark 是：

  * HumanEval：78.0 → 80.5；
  * MBPP：64.6 → 75.4。

代码任务对训练数据中的逻辑瑕疵尤其敏感。一条结构完整、但关键步骤有错的指令数据，可能比普通知识问答里的噪声更难被模型“忽略”。

Harness 把 critique、rewrite、judge 等环节组织成固定流程后，每一步都必须被执行，也更容易检查中间结果。它减少的不是所有错误，而是“某一步被 Agent 顺手跳过了”这种很难追踪的错误。

论文把两个下游实验明确标注为 **controlled case studies** ，只提供初步证据，不构成因果估计。两个实验都没有进行多次独立重复，也没有统计检验。

边界需要保留，但方向同样值得注意：上游的数据流水线更稳定，确实可能把质量优势继续传导到训练数据和下游模型表现。

## 04从 DataFlow 到 Harness：底座和接口缺一不可

DataFlow-Harness 的应用价值，来自两层能力叠加。

第一层是 DataFlow 本身。

DataFlow 已经围绕数据生成、清洗、过滤、评估、去重和流水线编排，形成了一套面向 AI 数据准备的工具体系。它提供 100+ 算子，覆盖文本合成、数学推理、代码生成、PDF→QA 转换、Agentic RAG、Text2SQL 等场景；提供类似 PyTorch 的 Pipeline→Operator→Prompt 编程层级；并基于 Ray 做分布式编排调度。

对于基模训练、领域微调、RAG 知识库和评测集构建来说，它提供的是一套已经存在、可以继续扩展的数据处理底座。ICML SeePhy 比赛冠军和智源 LIC 挑战赛冠军，也为这套底座提供了独立于论文之外的竞赛验证。

第二层是 Harness 化封装。

DataFlow-Harness 通过 MCP 把 DataFlow 的算子、Schema、流水线状态和运行能力暴露给 Code Agent。过去需要人工查文档、写配置、连节点和调脚本的流程，现在可以通过对话完成。

但它没有让 Agent 绕开平台。对话最后生成的，仍然是与人工在 WebUI 中搭建相同类型的 Native DAG：可持久化、可编辑，也可以继续被团队审计和维护。

这两层不是并列关系，而是底座和接口。

Harness 没有重新发明一套算子，也没有把算子设计权交给 Agent。它做的是在成熟算子体系上增加一层安全、可审计的 Agent 调用方式。

这个选择看起来不够“万能”，却更接近真实工程：算子能力由平台长期维护，Agent 负责理解意图和完成组合。边界清楚，出了问题也更容易定位。

## 05写在最后

DataFlow-Harness 可以看作 Harness Engineering 范式在 AI 数据准备场景中的一次完整开源实现。

它证明的重点，不是 Code Agent 会不会写数据处理脚本。这个问题早已有答案。更值得关注的是：当 Agent 的产出被限制为平台原生的 typed mutations，再用 Skills 补上程序性知识，它可以在不牺牲成功率的前提下，降低成本，并产出一条能够继续维护的 Native DAG。

这里的几项收益并不是简单的 tradeoff。

Typed mutations 缩小了幻觉空间，Agent 无法调用注册表里不存在的算子；结构校验减少了无效尝试，Schema 不兼容的连接在提交前就会失败；Skills 又补上了“结构合法但流程顺序错误”的那一层知识。最终得到的 DAG，本身就是平台原生资产，不需要再把一次性代码重新翻译回系统。

代价也同样明确：Agent 的能力边界被限制在算子注册表以内。

如果 DataFlow 缺少某个关键算子，Harness 也无法凭空补出来。Typed mutations 能约束已有能力的调用，却不能创造不存在的平台能力。这不是实现缺陷，而是 Harness 范式本身的取舍。

因此，选择这条路线的团队，真正要长期投入的并不只有 Agent，还包括算子生态、Schema、验证协议和程序性知识库的维护。

模型当然重要，但把模型放进什么样的工程环境里，往往更决定它最后能不能稳定地产生价值。

  


## 06参考材料

  * DataFlow-Harness 论文 — HuggingFace Papers, arXiv 2607.16617 — huggingface.co/papers/2607.16617
  * DataFlow 主仓库（7000+ Stars, as of 2026-07）— github.com/OpenDCAI/DataFlow
  * DataFlow-WebUI 交互入口 — github.com/OpenDCAI/DataFlow-WebUI
  * DataFlow-Skills — github.com/OpenDCAI/DataFlow-Skills
  * Harness Engineering 概念 — faros.ai/blog/harness-engineering