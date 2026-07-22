sha256: 28c8540562b6520e718baef2585dd4475a5c6f0a455b513edc1061db8665ff70
---
title: "Ollama 已经不是 2024 年那个了！一键配齐 Claude Code/Codex/OpenClaw"
source: wechat
url: https://mp.weixin.qq.com/s/PxjcYy6PT9QmK233D4n36g
publish_date: "2026-07-01"
ingest_date: "2026-07-01"
vxc: 56
stars: 4
---

# Ollama 已经不是 2024 年那个了！一键配齐 Claude Code/Codex/OpenClaw

###  全文速览

* Ollama 2026 上半年做了三件事——GGUF 生态解锁、ollama launch、MLX 引擎——它不再只是本地模型的 Docker，而是本地 AI 工具的入口层。
* v0.30.0 让 HuggingFace 上几十万个 GGUF 模型可以直接 ollama run，不再需要写 Modelfile 转换；ollama launch 一键配齐 Claude Code/OpenCode/Codex/OpenClaw。
* Mac 上 LM Studio 的 MLX 后端比 Ollama 快 26-60%，但 Ollama 的模型覆盖面、工具集成和跨平台支持让它仍然是 2026 年年中最均衡的本地 AI 入口。

##  01  Ollama 还是那个 Ollama 吗？

上个月我升级了 Ollama，敲了一行  ` ollama launch claude  ` ，然后坐在屏幕前愣了一下。

Claude Code 自动连上了我本机跑的 Qwen3.5，API endpoint、模型名、上下文窗口——全配好了。没写一行配置，没改一个环境变量。

这不是我 2024 年认识的那个 Ollama。那个 Ollama 做的事情很明确：  ` pull  ` 下载模型，  ` run  ` 启动对话，  ` serve  ` 暴露一个 OpenAI 兼容 API。好用，但也止步于此——它是本地模型的 Docker，不是本地 AI 的"操作系统入口"。

165k Star 之后，Ollama 在做一个比跑模型更重要的决定。

这篇文章拆的，就是 2026 年上半年 Ollama 的三次关键升级——以及它们合在一起，指向了一个什么样的新定位。

##  02  第一次跃迁：从 llama.cpp 到"本地模型 Docker"

快速回顾下 Ollama 的起点——你大概率已经知道这部分，快速过。

Ollama 最初解决的问题很简单：  ** 在本地跑大模型太TM麻烦了  ** 。llama.cpp 能跑，但要自己编译、自己找 GGUF 文件、自己配量化参数、自己写 Python 调 API。Ollama 用 Go 写了一个管理层，把这一整套流程压缩成两条命令：

    ollama pull llama3.2  
    ollama run llama3.2  

这就是 Ollama 的第一次跃迁——从"一堆散装零件"到"一键可以跑的容器"。Docker 把应用的"构建-分发-运行"标准化了，Ollama 把模型的"下载-量化-推理"标准化了。

但这个阶段的天花板也一目了然：Ollama 能跑的模型，只有官方库和社区手动转换的那几百个。如果你在 HuggingFace 上看到一个有意思的 GGUF 模型——对不起，你得自己写 Modelfile 转。

2026 年上半年，Ollama 开始拆这个天花板。

##  03  第一变：GGUF 生态解锁——HuggingFace 模型随便跑

v0.30.0（2026 年 6 月 2 日发布）做了 Ollama 历史上最大的一次架构变化：  ** 不再需要 Modelfile 转换，直接跑 HuggingFace 上任意 GGUF 模型  ** 。

    # 这行命令在 v0.30.0 之前是不存在的  
    ollama run hf.co/bartowski/Llama-3.2-3B-Instruct-GGUF:latest  

所以呢？Ollama 的模型库从"官方精选几百个"变成了"HuggingFace 上几十万个 GGUF 文件"。你不再需要等社区大佬帮你转模型——在 HuggingFace 上看到任何 GGUF 文件，复制路径，  ` ollama run  ` 就起来了。

别小看这一行命令。在 v0.30.0 之前，如果你想让 Ollama 跑一个 HuggingFace 上好几个人都推荐、但没进官方库的模型，流程是这样的：下载 GGUF 文件 → 写 Modelfile → 调量化参数 →  ` ollama create  ` → 调试失败 → 搜 issue → 发现模板不对 → 再改 Modelfile → 终于跑起来。现在只需要一步。

** 但有一点要注意  ** ：v0.30.0 有一个 breaking change——  ` nomic-embed-text  ` 现在会对输入做 lowercase 处理。如果你在用 Ollama 跑 embedding（很多人在做本地 RAG），你已有的向量数据库  ** 需要全量重建索引  ** ，否则检索结果会乱套。如果你还没升级，先把这行看进去再升。

    # 升级前检查：如果你在用 nomic-embed-text 做 embedding  
    ollama list | grep nomic-embed-text  
    # 如果有输出 → 升级前先备份向量库，升级后全量重建  

##  04  第二变：ollama launch——给你的不是 API，是整套环境

2026 年 1 月，Ollama 发布了  ` ollama launch  ` 。这个功能单独拿出来说，是因为它改变了"Ollama 能用来干什么"这个问题的答案。

` ollama launch  ` 不是"启动一个推理服务"，而是  ** 自动配置并拉起整个 AI 开发工具  ** 。以 Claude Code 为例：

    ollama launch claude     # 一行，配好模型+API+上下文，Claude Code 直接开始工作  

同样的配方覆盖了四款工具：

* ** Claude Code  ** ——Anthropic 的 AI Coding agent，launch 后自动连上本地模型
* ** OpenCode  ** ——开源 AI coding 工具，主打终端原生体验
* ** Codex  ** ——OpenAI 的 coding agent，也能接本地模型
* ** OpenClaw  ** ——2026 新星，个人 AI 管家，接 WhatsApp/Telegram/Discord

每个 launch 目标内部是一个预配置的"工具配方"。Ollama 知道这个工具需要什么模型格式、什么 API endpoint、什么环境变量，自动帮你填好。你不需要知道  ` OPENAI_BASE_URL  ` 应该设成什么——它帮你设好了。

这个变化的本质是：Ollama 从"给你一个推理 API"变成了"给你一个能干活的环境"。Docker 从  ` docker run  ` （自己配网络、卷、端口）到  ` docker compose up  ` （全套栈一步到位）。Ollama 在走同一条路。

在 terminal 里跑一下，你就能看到它自动配置了什么：

这就是"从 API 到环境"的体验差异。

##  05  第三变：MLX 引擎——Mac 上的速度翻倍，但竞争已经杀到门口

2026 年 3 月，Ollama 给 Apple Silicon 用户送了一个大礼：MLX 引擎 preview。MLX 是 Apple 专为 M 系列芯片优化的 ML 框架，它不经过 CPU-GPU 之间的内存拷贝——直接用统一内存，所以比 llama.cpp 的 Q4_K_M 后端快。

    # 在 Mac 上切换 MLX 引擎  
    OLLAMA_ACCELERATE=mlx ollama run qwen3.5  

根据 XDA Developers 和 The Mac Observer 的实测，Ollama 的 MLX 引擎在 Mac 上输出速度相比 llama.cpp 后端提升了约 20%，而且支持 NVFP4 量化——精度损失比 Q4_K_M 小一半。

** 但这里有一个不能回避的事实。  **

LM Studio，Ollama 在桌面上最直接的竞品，从一开始就是纯 MLX 原生——不是"llama.cpp 为主 + MLX 为辅"的混合模式。结果呢？

模型规模  |  Ollama MLX (tok/s)  |  LM Studio MLX (tok/s)  |  差距
---|---|---|---
1B  |  149  |  237  |  +59%
8B  |  ~40  |  ~55  |  +38%
27B  |  24  |  33  |  +38%

LM Studio 在 MLX 上的快不是一点点，是 38-59%。

我不回避这个数据，因为这篇文章的读者不是来找"Ollama 天下第一"的自我安慰的。在 Mac 上，LM Studio 的推理速度确实比 Ollama 快。这是事实。

但 Ollama 的优势在别处：

1. ** 模型覆盖面  ** ：v0.30.0 GGUF 解锁后，Ollama 能跑的模型远多于 LM Studio
2. ** 工具集成  ** ：  ` ollama launch  ` 一键配齐四款 AI 开发工具，LM Studio 只给你一个 API
3. ** 平台覆盖  ** ：Windows / Linux / macOS 全部支持，LM Studio 的 Docker 支持还停在 CPU-only preview
4. ** 社区生态  ** ：165k Star 的社区带来更快的模型适配、更多的 issue 回复、更多的第三方集成

所以这个比较的实质不是"谁更快"——而是"你更需要什么"。如果你只在乎 Mac 上的推理速度，LM Studio 更强。如果你需要  ** 模型选择自由度 + AI 工具集成 + 跨平台  ** ，Ollama 仍然是最均衡的选择。

##  06  从模型启动器到本地 AI 网关

把 GGUF 解锁、ollama launch、MLX 引擎三条线放在一起，Ollama 的战略就清楚了：

    HuggingFace 几十万个 GGUF → [Ollama 模型层] → llama.cpp + MLX [推理层] → launch 生态 [工具层]  
        ↑ 模型来源不受限了          ↑ 双引擎各司其职              ↑ 开发者体验的护城河  

Ollama 不想赢推理性能的战争。那是 llama.cpp（极致兼容性）和 vLLM（极致吞吐量）的战场，Ollama 在中间层——  ** 它让"用模型干活"这件事不再需要关心底层  ** 。

这跟 Docker 的战略一模一样：Docker 没做最好的容器 runtime（containerd / runC 才是），但它做了最好的开发者体验——镜像生态 + docker-compose + 一键编排。Ollama 在做完全一样的事：不造最好的推理引擎，造最顺手的本地 AI 入口。

我不是说它必然成功。两个真实的风险：

* ** vLLM 从生产端下压  ** ：如果 vLLM 推出一键安装的消费版、内置 model hub 和 OpenAI 兼容 API，Ollama 的"简单好用"优势会被大幅削弱
* ** LM Studio 在 Mac 上蚕食  ** ：更流畅的 GUI + 内置 MCP 支持 + 更好的 MLX 性能——如果 LM Studio 再补上 launch 级别的工具集成，Mac 用户没有理由不换

Ollama 的战略是对的，但它能守住入口的时间窗口是有限的。

##  07  10 分钟从零到本地 AI 开发环境

说了这么多，给你一个可以今天就跑通的流程：

    # 1. 升级到最新版（Mac）  
    brew upgrade ollama  

    # 或者直接下载 v0.30.x+  
    # https://ollama.com/download  

    # 2. 验证版本  
    ollama --version  
    # 应该输出 v0.30.x 或更高  

    # 3. 直接从 HuggingFace 拉一个 GGUF 模型  
    ollama run hf.co/bartowski/Qwen2.5-7B-Instruct-GGUF:Q4_K_M  

    # 4. 确认模型在本地  
    ollama list  

    # 5. 在 Mac 上测试 MLX 引擎（仅 Apple Silicon）  
    OLLAMA_ACCELERATE=mlx ollama run qwen3.5  

    # 6. 一键启动 Claude Code 连本地模型  
    ollama launch claude  
    # Claude Code 现在用你本机的模型在工作了  

第六步如果你还没试过，值得花 10 分钟跑一遍。"本地模型 + AI Coding 工具"这个组合，体验和半年前完全不一样。

##  08  该不该升级？——2026 年年中 Ollama 的使用建议

分三种情况说。

** 如果你只是偶尔跑跑本地模型  ** ——升。不需要犹豫。GGUF 生态解锁让模型选择多了两个数量级，MLX 引擎在 Mac 上免费提速，无脑升级到最新版。唯一要注意的就是  ` nomic-embed-text  ` 的 breaking change（前面说了），如果你在用 embedding，先备份向量库。

** 如果你是 Mac 性能党  ** ——升，但两种用法并行。Ollama 最新版 + MLX 引擎做日常使用；如果某天要跑一个长推理任务、每 token 速度都很关键，装 LM Studio 做主力推理，Ollama 留着做  ` ollama launch  ` 的工具集成。两者完全可以共存——都用 localhost API，换端口就行。

** 如果你在搭生产环境  ** ——Ollama 不改。但如果你需要多用户并发或高吞吐（比如 50 人以上的团队共享一个推理节点），该上 vLLM。Ollama 内部没有 continuous batching，多个请求是串行处理的——这是它的架构选择，不是 bug，但也是它和 vLLM 之间最根本的差距。

* * *

Ollama 正在变成一个不需要你关心底层推理引擎的平台。它能不能成功，取决于它能不能在  ` ollama launch  ` 生态上跑得比竞品快——在 LM Studio 追上来之前，让更多工具变成 "Ollama 一键启动"。

这是 2026 年下半年最值得观察的本地 AI 故事线。不是推理性能的战争，是生态入口的战争。

我升级完敲下 ollama launch claude 那一刻才反应过来——它已经不是工具了，是入口。
