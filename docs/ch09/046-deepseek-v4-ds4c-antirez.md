# DeepSeek V4 DS4C Antirez 本地推理实践

## Ch09.046 DeepSeek V4 DS4C Antirez 本地推理实践

> 📊 Level ⭐⭐ | 12.5KB | `entities/deepseek-v4-ds4c-antirez-local-inference-qbitai.md`

# DeepSeek V4 本地推理：antirez 的专属高速公路

**来源：** 量子位 QbitAI（公众号）

**发布时间：** 2026年5月初

**人物：** Salvatore Sanfilippo（antirez），Redis 作者（2009-2020主导），2024年底以 evangelist 身份回归 Redis

## 核心事件

antirez 发布 **ds4.c**——专为 DeepSeek V4 Flash 打造的本地推理引擎。C + Metal，从头实现，无框架依赖，无抽象层，Metal-only。

**项目目标**：把 284B 总参数、13B 激活参数、100万 token 上下文的 V4 Flash 塞进 Mac 本地运行

**技术栈**：C 55.4% + Objective-C 30.2% + Metal 13.8%

## 关键技术细节

### 1. 非对称 MoE 量化

ds4.c 采用了非对称混合量化策略，专门针对 MoE（Mixture of Experts）架构设计：

- 只量化 MoE 专家层（up/gate 用 IQ2_XXS，down 用 Q2_K）
- 共享专家层、投影层、路由层保留 Q8 精度
- "2-bit 量化不是开玩笑，在 coding agent 下表现良好，能可靠地调用工具"

这种量化策略的原理是：共享层和路由层的错误会产生全局性影响（影响所有 expert 的输入/输出），而 expert 内部的错误只会影响该 expert 的局部输出。从信息量角度，共享层的 quantization error 代价更高，所以给更高精度。

### 2. KV Cache 磁盘化

通用推理引擎每次请求都重新做 prefill（无状态），而 ds4 把 KV 状态写到磁盘，下次请求匹配 token 前缀时，直接从磁盘加载跳过 prefill：

- Cache key：token ID 序列的 SHA1 哈希值
- 对 Claude Code 场景（每次启动发 25K token 初始 prompt）特别有价值

这本质上是一个以磁盘换计算的策略——用 SSD 带宽换 GPU 计算。

### 3. 双 API 兼容层

ds4.c 实现了双协议兼容，同时支持 OpenAI 和 Anthropic 两大生态：

- `/v1/chat/completions` → OpenAI 协议
- `/v1/messages` → Anthropic 协议
- tool calling 已适配，README 提供 opencode、Pi、Claude Code 配置示例

## 性能实测

| 硬件 | 量化 | 上下文 | 预填充速度 | 生成速度 |
|------|------|--------|-----------|---------|
| MacBook Pro M3 Max 128GB | 2-bit | 32K | 58.52 token/s | 26.68 token/s |
| Mac Studio M3 Ultra 512GB | 2-bit | 11709 token | **468.03 token/s** | 27.39 token/s |

## antirez 的设计哲学

> "本地推理领域有很多优秀项目，但新模型不断发布，注意力立刻被下一个要实现的模型吸走。通用引擎为了兼容所有模型，必须做抽象。抽象意味着妥协。他想做的是一条刻意的窄路，一次只赌一个模型。"

**"本地推理三件套"全栈理念**：

1. 一个带 HTTP API 的推理引擎
2. 一份针对这个引擎和这套假设特别打造的 GGUF
3. 一套和 coding agent 对接的测试和验证

**关于 AI 辅助**：README 声明"这个软件是在 GPT 5.5 的强力辅助下开发的，人类负责想法、测试和调试"。两周从 fork llama.cpp 到从头写专用引擎。

## 开发者社区反响

Hacker News 高赞评论指出：如果开始针对精确的 GPU +模型组合构建超优化推理引擎，去掉足够多的抽象层，直接针对精确硬件和模型编码，可能能优化很多。代价是模型过时，一切从头来过。

antirez 回应：当前赌的是 V4 Flash，但模型可能会换；也许会做 CUDA 支持，但仅此而已。

## 人物背景

Salvatore Sanfilippo（antirez），1977 年出生于西西里岛，2009 年创建 Redis（GitHub 7.4 万 Star），主导 11 年，2020 年离开。离开时写："我写代码是为了表达自己，代码是一件制品而不只是有用的工具。我宁可被记住为一个糟糕的艺术家，也不愿被记住为一个好程序员。"

其他作品：Kilo（<1000行C文本编辑器）、dump1090（ADS-B信号解码器）、linenoise（readline替代）、Flipper Zero 工具。2022 年出版科幻小说《WOHPE》：AI、气候变化、程序员、人类和技术的互动。

## 深度分析

### 1. 专用引擎 vs 通用引擎的技术取舍

ds4.c 代表了一种极致专用化的路线。llama.cpp、vLLM 等通用推理引擎通过抽象层支持多模型，代价是每次调用都有间接成本——矩阵运算通过通用调度层分发，内存布局服务于最广泛的兼容性，量化方案必须在精度损失可接受范围内照顾各种架构。

antirez 的判断是：对于一个被他长期使用的具体模型，**去掉抽象层带来的收益 > 模型过时的风险**。这是工程上的"狭路理论"——当资源受限时，刻意收窄目标反而能获得局部突破。M3 Ultra 跑出 468 token/s 的预填充速度，部分来自针对 Apple Metal API 的零抽象手写 Shader，通用框架很难做到这种深度硬件绑定。

这种思路的局限也显而易见：一旦 V4 Flash 被新版本替代，ds4.c 的投入可能需要大幅重构。但对于当前稳定使用的场景，这是合理的赌注。

### 2. 非对称 MoE 量化的信息论基础

ds4.c 对 MoE 架构采用非对称量化——专家内部用 2-bit（IQ2_XXS/Q2_K），共享层和路由层保留 Q8。这个策略有清晰的信息论动机：

- **共享层误差的全局性**：MoE 的 up/gate/down 专家各自独立，但 shared/expert projection 和 routing layer 的误差会传递到**所有**专家的输入/输出放大链路。2-bit 专家误差只影响该专家的局部输出，而 shared layer 的误差会污染整个 MoE block 的信号。

- **"信息量"不对等**：共享层承载的是跨 expert 的路由信息和特征压缩，丢失精度影响所有下游计算；专家内部权重即便量化损失，也只是该专家贡献的那部分激活被压缩。

从这个角度看，量化策略本身反映了设计者对 MoE 内部信息流的深度理解——不是简单套用"重要层用高精度"，而是追踪误差如何传播。

### 3. KV Cache 磁盘化的工程逻辑

预填充（prefill）阶段要把整个上下文序列过一次完整的 forward pass，代价昂贵。Claude Code 每次启动发送 25K token 的初始 prompt，如果每次都重新 prefill，计算浪费极大。

ds4.c 的解法——用 SHA1(token序列) 做 cache key，KV 状态落盘——本质上是**以 SSD 带宽换 GPU 计算**。在 M3 Ultra 512GB 机器上，SSD 顺序读写远超 GPU 计算速度，这个tradeoff成立。

但这也揭示了当前 Mac 本地推理的一个现实：虽然 Apple Silicon 统一内存带宽出色，但 **284B 参数塞进本地 DRAM 仍然局促**（V4 Flash 量化后仍有相当体积），所以需要借助磁盘缓存绕过容量限制。这是苹果统一内存架构在超大规模模型面前的物理边界。

### 4. "三件套"全栈理念的复利效应

antirez 提出的推理引擎 + 专用 GGUF + coding agent 验证三者组合，本质上是在构建一个**自洽的本地推理闭环**：

- 引擎负责推理执行
- GGUF 定义模型格式（自己定制量化参数）
- Agent 验证确保实际可用性

这个闭环的价值在于：每个组件的优化都会在另外两个上产生复利。专用 GGUF 让引擎可以假设特定内存布局，引擎优化反馈到 GGUF 格式调整，agent 测试又暴露端到端体验问题。通用框架很难获得这种垂直优化的协同效应。

## 实践启示

### 给 AI 应用开发者的建议

1. **Coding agent 场景优先考虑专用本地引擎**：如果你的 agent 应用有固定的核心模型（如 V4 Flash），ds4.c 的专项优化（KV cache 磁盘化、双协议兼容）能显著降低每次交互的延迟和计算成本。Claude Code 类场景尤其适合。

2. **量化方案选择应跟随架构理解**：不要盲目追求更低 bit 率。MoE 模型中，共享层和路由层应该用更高精度（Q8），专家内部可以用激进量化（IQ2_XXS）。这个原则可以迁移到其他 MoE 模型的量化配置中。

3. **本地推理 + 云端 API 的混合架构**：ds4.c 的双协议兼容（OpenAI + Anthropic）暗示了一种实用的工程选择——本地跑主力任务，必要时 fallback 到云端 API。本地有算力优势，云端有模型更新优势，组合使用比单独依赖任何一方更稳健。

### 给基础设施工程师的启发

1. **极限定制 vs 通用抽象的决策框架**：当你的硬件和模型组合相对稳定时，值得评估去除抽象层是否能获得显著性能提升。ds4.c 的 Metal-only 路线在 Apple Silicon 上效果拔群，但对应的代价是无法跨 GPU 架构——这是明确的工程 trade-off，需要根据业务场景判断。

2. **以磁盘换计算的策略在统一内存时代仍有效**：虽然统一内存减少了 CPU-GPU 传输开销，但对于超大规模模型（>100B），本地 DRAM 容量仍然不够。SSD 缓存 + 选择性预填充是一个实用的过渡方案。

3. **快速原型到生产的学习路径**：antirez 用两周从 fork llama.cpp 到完成 ds4.c 原型，展示了"先fork验证再重写"的高效路径。如果你的团队需要验证某个特定架构的可行性，先在现有框架上快速实验，再决定是否值得从零实现。

## 相关实体

- [ds4c-deepseek-v4-antirez](../ch01/533-ds4c-deepseek-v4-antirez.html) — 同一项目的另一篇报道
- [Redis之父下场给DeepSeek V4单独造了一台推理引擎](../ch01/318-deepseek-v4.html) — 量子位的另一篇相关报道
- [DeepSeek-V4深度拆解](../ch01/318-deepseek-v4.html) — DeepSeek V4 论文深度解读
- [DeepSeek V4 Pro vs Claude](../ch01/318-deepseek-v4.html) — V4 Pro 和 Flash 对比测试
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/coding-agent-practice.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/deepseek-v4-ds4c-antirez-local-inference-qbitai.md)

---

