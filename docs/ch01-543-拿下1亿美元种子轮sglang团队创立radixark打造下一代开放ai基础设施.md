# 拿下1亿美元种子轮sglang团队创立radixark打造下一代开放ai基础设施

## Ch01.543 拿下1亿美元种子轮sglang团队创立radixark打造下一代开放ai基础设施

> 📊 Level ⭐⭐ | 6.5KB | `entities/拿下1亿美元种子轮SGLang团队创立RadixArk打造下一代开放AI基础设施.md`

## 深度分析

**1. SGLang 的 Day-0 支持能力是推理引擎竞争的核心壁垒**
SGLang 在新模型发布当天即实现支持，这依赖的不是模型架构的先验知识，而是底层系统级优化（ShadowRadix 前缀缓存、Flash Compressor、Lightning TopK）带来的泛化适配能力。4 月 25 日 DeepSeek-V4 发布时，SGLang 与 Miles 同时支持推理和 RL 训练，这说明工程纪律（而非研究突破）是 Day-0 支持的真正驱动因素。

**2. 「训练-RL-推理」完整链路的效率整合是 RadixArk 的差异化定位**
当前大模型团队的痛苦不是任何单点优化不足，而是从训练到 RL 再到上线推理这条完整链路上的边界摩擦。Miles（SGLang 强化学习框架）与 SGLang（推理引擎）的组合，试图填平「训练-RL-推理」完整链路的效率断层。对于需要在生产环境持续微调模型的团队，这种全链路优化比单点推理加速更有价值。

**3. 顶级硬件厂商集体入局种子轮，反映了「硬件解耦」的行业焦虑**
NVIDIA、AMD、联发科、Broadcom、Intel 五家核心硬件厂商同时出现在投资人名单中，在 AI Infra 历史上几乎不可想象。这些厂商的共同诉求是：一个不被任何竞争对手锁定、不依赖特定芯片厂商的开源推理系统，对整个生态的健康发展至关重要。使用社区共同维护、多家硬件厂商共同支持的开源系统，是硬件厂商的高维度基础设施战略。

**4. 开源 SGLang 的群众基础已形成事实标准壁垒**
SGLang 在两年内积累 27K+ GitHub stars，被部署在 400K+ GPU，生产流量每天万亿 token，用户包括 Google、Microsoft、NVIDIA、Oracle、AMD、LinkedIn、xAI。这种部署广度意味着新进入者很难在生态兼容性和性能调优成熟度上与 SGLang 竞争。RadixArk 的商业化路径是「在开源内核之上建托管平台」，利用现有用户基数和品牌优势实现商业变现。

**5. 创始人组合的技术深度是投资机构下注的关键因素**
CEO 盛颖是 LMSYS Org 发起者、SGLang 主要创始人之一，博士期间研究方向为注意力稀疏化和 KV 缓存复用（RadixAttention 机制）。CTO 朱邦华师从 Michael I. Jordan，博士期间联合创立 Nexusflow 后被英伟达收购，在 NVIDIA 担任 Principal Research Scientist期间积累了工业级训练系统的完整经验。这种「研究型创始人 + 工业级系统工程经验」的组合，在 AI Infra 创业中极为稀缺。

## 实践启示

1. **对于需要快速跟进新模型能力的团队，优先评估 SGLang 的 Day-0 支持状态而非自行实现适配**：SGLang 的 Day-0 支持能力意味着团队可以直接复用已有的基础设施，减少在新模型发布时重新适配的工程成本。每周跟踪 SGLang 的 GitHub release 可以第一时间获取新模型支持信息。

2. **使用 Miles 框架进行领域专属模型的 RL 训练时，应设计好训练-推理的镜像构建流程**：Miles 打通 FP8 推理到 BF16 训练的完整 RL 管线，这意味着团队在定义 RL 训练任务时应同时规划推理服务的部署格式，避免训练产物与推理运行时的不匹配。

3. **对于有异构硬件（多品牌 GPU）需求的团队，SGLang 的硬件无关优化是关键考量**：Databricks 和多家硬件厂商的支持意味着 SGLang 在不同硬件平台上的性能调优已通过实际部署验证，团队在采购决策中可以优先考虑硬件无关性而非单一平台的峰值性能。

4. **在搭建 LLM 推理基础设施时，SGLang 的 prefix cache 机制对多任务共享系统特别有价值**：如果团队同时运行多个共享前缀的任务（如相同的 system prompt），RadixAttention 的树状前缀缓存可以显著降低重复计算成本。建议在系统设计阶段就测量 prefix 复用率，评估 SGLang 的实际收益。

5. **关注 RadixArk 托管平台的免费积分活动以降低早期实验成本**：团队在正式生产部署前，可以使用 RadixArk 的托管平台进行小规模推理实验，利用免费积分验证 SGLang 在目标模型上的实际性能，避免自行部署的运维复杂度。

## 相关实体
- [Nvidia Embraces Ai Investor Topping 40 Billion In Equity Bets 2026](/ch01-429-nvidia-embraces-role-of-ai-investor-pushing-past-40-billio/)
- [Edgeclaw Bemit Lobster](/ch04-426-edgeclaw-端云两栖龙虾框架/)
- [Claude Opus 47](/ch01-195-claude-opus-47-并不是一次全面升级甚至部分能力大幅衰退nn大家应该在合适的场景下选择使用nn昨晚-opus/)
- [Hermes Agent Getting Started Guide 2026](/ch04-418-hermes-agent/)
- [Gpt 54 烧完额度后我把七家国产 Ai 公司 Coding Plan 对比了一遍想不到最应该买的竟然是这家](/ch09-033-gpt-54-烧完额度后我把七家国产-ai-公司-coding-plan-对比了一遍想不到最应该买的竟然是这家/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/拿下1亿美元种子轮SGLang团队创立RadixArk打造下一代开放AI基础设施.md)

---

