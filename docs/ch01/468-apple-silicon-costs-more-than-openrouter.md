# Apple Silicon costs more than OpenRouter

## Ch01.468 Apple Silicon costs more than OpenRouter

> 📊 Level ⭐⭐ | 10.3KB | `entities/apple-silicon-costs-more-than-openrouter.md`

## 核心发现：本地推理成本是云端的 3~10 倍

文章通过四个维度的详细计算，揭示了 Apple Silicon 本地推理的真实成本结构 ：

### 电力成本极低

在 50~100W 功耗、$0.18/kWh 电价下，每小时电费仅 $0.009~$0.018，日均满负载运行约 $0.48 美金。电力成本在总成本中仅占 10~20% 。

### 硬件折旧主导成本

一台 M5 Max MacBook Pro（$4299）在 3/5/10 年折旧期限下，每小时摊薄成本为 $0.164/$0.098/$0.049——是电力成本的 5~10 倍 。这意味着**硬件折旧才是本地推理的最大成本项**，而非电力。

### Token 生成效率受限

M5 Max 运行 Gemma 4 31b 的吞吐量为 10~40 tokens/秒，对应每小时 36,000~144,000 tokens。OpenRouter 上同类模型可达 60~70 tokens/秒，速度是本地 MacBook Pro 的 3~7 倍 。

### 成本区间对比

以 $0.18/kWh 计算，本地推理的百万 token 成本约为 ：

| 场景 | Token 速率 | 使用年限 | 百万token成本 |
|------|-----------|---------|--------------|
| 悲观 | 10 tokens/秒 | 3年 | ~$4.79 |
| 基准 | 25 tokens/秒 | 5年 | ~$2.00 |
| 乐观 | 40 tokens/秒 | 10年 | ~$0.40 |

OpenRouter 上 Gemma 4 31b 的价格约为 $0.38~$0.50/百万 token，这意味着：

- **最乐观假设下**：本地与云端成本持平
- **常规场景下**：本地贵约 3 倍
- **极端场景下**：本地贵 10 倍

## 为什么本地推理仍然有吸引力

尽管数字不划算，作者指出了本地部署的不可替代价值 ：

- **隐私合规**：数据不离本地，适合处理敏感信息
- **离线可用性**：无网络依赖，适合野外/受限环境
- **高度定制**：可自由选择模型版本、量化方式、系统提示词
- **无速率限制**：不受 API 调用配额约束

## 关键变量：折旧期与利用率

"5 年折旧"是基准假设，但实际硬件寿命受以下因素影响 ：

- **加速折旧风险**：持续 100W 满负载运行会显著缩短电池和芯片寿命
- **真实利用率**：如果每日只跑几分钟推理，摊薄成本会远高于计算值
- **换机周期**：企业通常 3 年换机，实际折旧成本更高

## 深度分析：与专用推理引擎的技术路线对比

### Apple Silicon 的定位

Apple Silicon 在本地推理领域的核心竞争力不是性价比，而是**能效比**。M 系列芯片的统一内存架构（Unified Memory）在内存带宽上有显著优势，配合 Metal GPU 加速，对于特定模型（如 Gemma 4 31b、DeepSeek V4 Flash）可以达到令人印象深刻的 performance per watt 。

### 专用引擎 vs 通用引擎的成本结构

[ds4.c 项目](ch09/041-deepseek-v4-ds4c-antirez-local-inference-qbitai.md)（Redis 作者 antirez 开发的 DeepSeek V4 专用推理引擎）展示了另一种路线：

- **通用引擎**（llama.cpp、vLLM）：支持多模型，代价是间接成本和抽象层妥协
- **专用引擎**：针对单一模型 + 硬件组合深度优化，放弃跨模型兼容性换取极致性能

ds4.c 在 M3 Ultra 128GB 配置下达到 **468 token/s 预填充速度** 和 **27 token/s 生成速度**，远超一般 MacBook Pro 的表现。这种专用引擎路线证明了：当硬件+模型组合固定时，Apple Silicon 的本地推理潜力远比"通用估算"展现的更大。

### 量化策略对成本的影响

采用激进但信息论驱动的方案：

- 共享层/路由层：Q8 精度（高）
- 专家内部：IQ2_XXS/Q2_K（2-bit 低）

这个策略的原理：共享层误差影响所有 expert 的输入/输出，具有全局性；专家内部误差只影响局部。从信息量角度，共享层量化误差代价更高，所以分配更高精度 。

量化技术的进步直接影响本地推理的成本方程——更低的显存占用意味着可以在同一硬件上运行更大的模型，或者以更低硬件配置运行同等模型。

## 与 OpenRouter 的战略差异

| 维度 | Apple Silicon 本地 | OpenRouter 云端 |
|------|-------------------|-----------------|
| **速度** | 10-40 tokens/s | 60-70 tokens/s |
| **成本（百万 token）** | $0.40-$4.79 | $0.38-$0.50 |
| **延迟** | 高 | 低 |
| **隐私** | ✅ 数据不离设备 | ❌ 数据上传云端 |
| **离线可用性** | ✅ 完全离线 | ❌ 依赖网络 |
| **速率限制** | 无 | 有（受套餐限制） |
| **模型更新** | 需手动下载 | 自动更新 |
| **适合规模** | 小规模（<10万 token/天） | 大规模（>100万 token/天） |

对于**需要高速推理的生产场景**（每日处理百万级 token），直接使用 OpenRouter 更经济。但对于**私密数据处理、离线开发、定制化工作流**等场景，本地 Apple Silicon 的溢价有其战略合理性 。

## 成本计算框架：IER 视角

[Inference Efficiency Ratio（IER）](https://github.com/QianJinGuo/wiki/blob/main/entities/how-to-calculate-the-inference-efficiency-ratio.md) 提供了一个更系统的成本评估框架：

- **AI-infused 产品**（AI 是附加功能）：需要 10:1 以上的健康 IER 才能保持与传统 SaaS 可比的毛利率
- **AI-native 产品**（AI 是核心价值交付）：接受低至 5:1 的健康 IER

本地 Apple Silicon 推理的成本结构更适合 AI-infused 场景中的特定用例——当隐私和离线需求是硬约束时，溢价成本可以被其他维度的价值吸收。

值得注意的是， 还指出 **Agentic 工作流正在系统性推高单位任务的 token 消耗量**，可能抵消 per-token 定价下降的收益。这意味着即便是云端 API，总拥有成本（TCO）也不一定会随着模型降价而线性下降 。

## 推理优化技术对本地部署的启示

[推理系统优化](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md)领域的关键技术（如 KV Cache 优化、连续批处理、Prefix Caching）对本地 Apple Silicon 部署有直接意义 ：

- **KV Cache 磁盘化**（ds4.c 采用）：用 SSD 带宽换 GPU 计算，对 Apple Silicon 统一内存架构下的超大规模模型特别有价值
- **Prefix Caching**：系统 prompt 和工具描述在多轮对话中复用，可以显著降低重复计算成本
- **非对称量化**：不同层分配不同精度，在降低显存占用的同时最大化了模型质量

这些优化技术的组合应用，使 Apple Silicon 本地推理从"不可能"变为"可实现但贵"——对于有特定隐私或离线需求的场景，这是值得评估的技术路径。

## 实践启示

1. **成本计算公式**：本地推理真实成本 ≈ 硬件折旧 ÷ 预期吞吐量，而非单纯计算电力成本。电力通常只占 10~20%，硬件折旧才是大头 。

2. **选型建议**：如果追求本地推理性价比，选择更新一代芯片（如 M5 Max 相比 M3）和更大内存配置，可以通过更高吞吐量摊薄单位成本 。

3. **适用场景判断**：

   - 日均 token 消耗 <10 万的小规模个人项目，本地 MacBook Pro 成本可忽略
   - 日均 >100 万 token 的高频场景，云端 API 更经济
   - 隐私敏感场景，无论规模，本地都有战略价值

4. **折旧估算**：文中 $4299/5年 的假设适合个人开发者；企业采购需根据实际换机周期重新计算，并考虑批量采购折扣 。

5. **速度差距不可忽视**：本地 10-20 tokens/秒 vs 云端 60-70 tokens/秒，在需要快速反馈的场景（如交互式 coding assistant），延迟差异会影响实际工作效率 。

6. **混合架构可行性**：一种折中方案——将需要隐私的低频高价值任务放本地，通用高频任务走 OpenRouter——可能是当前最具成本效益的架构选择 。

7. **专用引擎评估**：如果使用固定模型（如 DeepSeek V4 Flash），评估 ds4.c 这类专用引擎是否能通过极致优化弥补成本劣势。M3 Ultra 128GB + ds4.c 的组合在特定场景下可能比通用方案更具性价比 。

## 相关实体

- [离线 LLM 能量使用](ch01/890-llm.md) — 同一作者的另一篇相关文章
- [LightSeek TokenSpeed](ch01/854-lightseek-tokenspeed.md) — 推理引擎优化技术（Speculative Decoding、KV Cache、Continuous Batching）
- [Ollama 安全问题](ch12/013-bleeding-llama-critical-unauthenticated-memory-leak-in-ollam.md) — 本地推理基础设施的安全考量

## 相关概念

-  — KV Cache、PD 分离、量化等核心优化技术的系统性梳理

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/apple-silicon-costs-more-than-openrouter.md)

---

