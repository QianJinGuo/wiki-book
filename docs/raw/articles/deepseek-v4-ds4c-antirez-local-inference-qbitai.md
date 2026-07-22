---
tags: [wechat, article, claude, openai]
title: "deepseek v4 ds4c antirez local inference qbitai"
type: raw
url: https://mp.weixin.qq.com/s/9X0bcfUGZYxoXuQwt89zkQ
ingested: 2026-05-08
sha256: 9f2951cfd8217340ace9c67ee7d9173822fc27a8b66f28d0f55df8dbcfa03308
review_value: 8
review_confidence: 8
review_stars: 4
review_product: 64
review_recommendation: STRONG
source: 量子位 QbitAI
published: ~2026-05-06
created: 2026-05-10
updated: 2026-05-10
---
# DeepSeek V4 本地推理：antirez 的专属高速公路
**来源：** 量子位 QbitAI（公众号）
**发布时间：** 2026年5月初
**人物：** Salvatore Sanfilippo（antirez），Redis 作者（2009-2020主导），2024年底以 evangelist 身份回归 Redis
## 核心事件
antirez 发布 **ds4.c**——专为 DeepSeek V4 Flash 打造的本地推理引擎。C + Metal，从头实现，无框架依赖，无抽象层，Metal-only。
- **项目目标**：把 284B 总参数、13B 激活参数、100万 token 上下文的 V4 Flash 塞进 Mac 本地运行
- **技术栈**：C 55.4% + Objective-C 30.2% + Metal 13.8%
- **关键数字**：
  - M3 Max 128GB：短prompt预填充 58.52 token/s，生成 26.68 token/s
  - M3 Ultra 512GB：长prompt（11709 token）预填充 **468.03 token/s**，生成 27.39 token/s
## 关键技术细节
### 1. 非对称量化
- 只量化 MoE 专家层（up/gate 用 IQ2_XXS，down 用 Q2_K）
- 共享专家层、投影层、路由层保留 Q8 精度
- "2-bit 量化不是开玩笑，在 coding agent 下表现良好，能可靠地调用工具"
### 2. KV Cache 写磁盘
- 通用引擎每次请求重新做 prefill（无状态）
- ds4 把 KV 状态写到磁盘，下次请求匹配 token 前缀，直接从磁盘加载跳过 prefill
- Cache key：token ID 序列的 SHA1 哈希值
- 对 Claude Code 场景（每次启动发 25K token 初始 prompt）特别有价值
### 3. 双 API 兼容层
- `/v1/chat/completions` → OpenAI 协议
- `/v1/messages` → Anthropic 协议
- tool calling 已适配，README 提供 opencode、Pi、Claude Code 配置示例
## antirez 的设计哲学
> "本地推理领域有很多优秀项目，但新模型不断发布，注意力立刻被下一个要实现的模型吸走。通用引擎为了兼容所有模型，必须做抽象。抽象意味着妥协。他想做的是一条刻意的窄路，一次只赌一个模型。"
**"本地推理三件套"全栈理念**：
1. 一个带 HTTP API 的推理引擎
2. 一份针对这个引擎和这套假设特别打造的 GGUF
3. 一套和 coding agent 对接的测试和验证
**关于 AI 辅助**：README 声明"这个软件是在 GPT 5.5 的强力辅助下开发的，人类负责想法、测试和调试"。两周从 fork llama.cpp 到从头写专用引擎。
## 开发者社区反响
- Hacker News 高赞：如果开始针对精确的 GPU +模型组合构建超优化推理引擎，去掉足够多的抽象层，直接针对精确硬件和模型编码，可能能优化很多
- 代价：模型过时，一切从头来过
- antirez 回应：当前赌的是 V4 Flash，但模型可能会换；也许会做 CUDA 支持，但仅此而已
## 人物背景
- 真名 Salvatore Sanfilippo，1977 年出生于西西里岛
- 2009 年创建 Redis（GitHub 7.4 万 Star），主导 11 年，2020 年离开
- 离开时写："我写代码是为了表达自己，代码是一件制品而不只是有用的工具。我宁可被记住为一个糟糕的艺术家，也不愿被记住为一个好程序员。"
- 其他作品：Kilo（<1000行C文本编辑器）、dump1090（ADS-B信号解码器）、linenoise（readline替代）、Flipper Zero 工具
- 2022 年出版科幻小说《WOHPE》：AI、气候变化、程序员、人类和技术的互动
- 个人主页第一行："我把"
---
*评审：Value 8 × Confidence 8 = 64 | ★★★★ | 推荐入库*