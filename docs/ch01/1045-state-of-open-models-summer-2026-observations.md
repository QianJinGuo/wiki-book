# State of Open Models: Summer 2026 Observations

## Ch01.1045 State of Open Models: Summer 2026 Observations

> 📊 Level ⭐⭐ | 6.0KB | `entities/state-of-open-models-summer-2026.md`

# State of Open Models：2026 夏季观察

Hugging Face 在 2026 年 8 月发布的半年一度开源模型生态报告，基于 2026 年 1 至 7 月 Hub 上的下载、点赞、衍生模型与 release 数据，总结出六个关键观察：前沿规模竞赛由中国实验室主导、注意力（点赞）与采用（下载）是两种不同经济、开源权重把价值积累转移到 API 与生态位、Qwen 成为社区基础模型、小模型仍是实用层、以及 Agent 成为 Hub 的新用户。报告期内公开模型仓库从 243 万增长到 296 万，数据集达到 100 万，Spaces 达到 144 万，但分布极端：约 85.6% 的模型终身下载不足 200 次，1.5% 的仓库贡献了 99.2% 的下载量。

## 前沿规模：中国实验室的月度天花板全面领先

2026 年几乎每个月，中国实验室发布的最大开源模型都比美国实验室自己的 release 更大：中国月度天花板在 754B 到 2.78 万亿参数之间，美国自己的天花板在七个月中有五个月低于 130B，例外是 NVIDIA 的 Nemotron 3 Ultra（561B）和 Thinking Machines Lab 的 Inkling（952B）。Moonshot、MiniMax、Xiaomi、Z.ai 几乎不发布 70B 以下模型，而腾讯和阿里 Qwen 覆盖从 1B 以下到万亿参数的完整谱系——大小策略成为"押注基准排名与 API 需求"还是"成为开发者标准化的家族"的意图声明。

开源的中心从模型实验室转移到硬件与基础设施公司：AMD 与 NVIDIA 各发布超过 200 个新模型仓库（远超前排），LiquidAI 约 100 个排第三，开源模型成为卖芯片的证明。美国 100B 以上规模的大多数 release 是在中国模型之上构建的衍生品而非原创模型。

## 注意力 ≠ 采用，许可证揭示真正的商业模式

按今年累计下载与按点赞分别取前 25 名的模型仓库，交集只有一个。2026 年新发布的模型没有一个进入下载前 25，而 25 个中有 13 个来自 2022 年：all-MiniLM-L6-v2 七个月被拉取 15.5 亿次但只有 5,156 个赞。点赞记录"发布很重要"的兴奋，下载记录"接入生产管线"的依赖，两者不可互相替代。

许可证数据说明开源权重的回报不在授权费：178 个中国 20B 以上 release 中 59% 采用 Apache 2.0、22% 采用 MIT，没有任何一个带非商用限制；DeepSeek 与 Z.ai 在 700B 到 1.65T 参数规模直接使用 MIT。美国同规模带中只有 29% 是 Apache/MIT。价值回收来自 API 与云业务、硬件与平台定位、以及生态位本身，这与 [开源模型与闭源差距分析](ch01/1132-20.html) 中关于开源商业化的讨论一致。

## Qwen 成为社区基础模型，小模型仍是实用层

按衍生模型衡量，Qwen 系模型在 Hub 上已有 151,448 个衍生仓库，是 Meta 总足迹的 2.6 倍、Llama 专属的 4.7 倍；Google 以 82,506 个跟随其后。Qwen 衍生以每天约 180–210 个新仓库的速度增长，靠的是稳定的发布节奏、尺寸覆盖和 Apache 2.0 开放许可形成的正反馈。这个位置主要由社区建立：151,448 个衍生中 Qwen 自己发布的只有极少部分，28,531 个 GGUF 转换中 Qwen 官方只发布了 54 个。

参数规模小于 1B 的模型占历史下载总量的 83%，100B 以上只占 1%。万亿参数模型能触达普通开发者靠的是 [llama.cpp 本地部署](../ch11/168-llama-cpp-deployment.html)：7 月快照已包含约 284B 的 DeepSeek-V4-Flash 与约 2.8 万亿的 Kimi-K3 的 GGUF 构建，本地推理从笔记本上的 8B 变成跨几台消费级机器的万亿 MoE。声明 gguf 库的仓库数增长 464%、lerobot 194%、Apple mlx 148%，而 transformers 只有 16%——运行时层比建模核心增长快三到七倍。Qwen 系的 GGUF 月下载 3,960 万次，接近 Gemma（2,080 万）的两倍、Llama（750 万）的五倍以上。

## Agent 成为新的用户

7 月发布的 agent-usage 数据集第一次记录了编码 Agent 调用 Hub 的流量：Claude Code 7 月占 44.4%，但 4 月是 67.8%、5 月只有 6.4%，而 Codex 从 10.4% 稳步升到 20.8%——没有在位者的市场里，一次 release 或一个默认值变更就能在一个月内移动一半流量。7 月近四分之一的 Agent 标记流量来自数据集尚未命名的 harness，4 到 7 月出现了十几个新客户端标识。Hub 同时开始为机器读者建设：3 月论文提供机器可读 Markdown，4 月 Agent trace 成为一等数据集类型并上线 agents.md 端点，7 月 MCP 服务器上线 hf_fs 工具，MCP 协议本身进入 Linux 基金会旗下 Agentic AI Foundation。7 月还发生了首个有记录的自主 Agent 持续入侵事件，HF 用自家基础设施上的量化开源模型 GLM-5.2 完成了攻击代码分析。

整体来看，地理再平衡在加速：开源模型从模型实验室移向硬件与基础设施公司，中国前沿模型之间的竞争吸引大量社区关注，而 Agent 首次成为 Hub 上排名第一的用户。报告强调，AI 竞赛既是短跑也是马拉松——[开源 LLM 生态](https://github.com/QianJinGuo/wiki/blob/main/concepts/open-source-llm-ecosystem.md) 的胜负取决于模型家族与开发者之间能否形成正反馈循环，并最终嵌入基础设施。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/state-of-open-models-summer-2026-observations.md)

---

