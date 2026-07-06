# Google Ads Expanded Experiment Support in v24.1: What Changed for AI Max, Video, Demand Gen, and Performance Max

## Ch03.115 Google Ads Expanded Experiment Support in v24.1: What Changed for AI Max, Video, Demand Gen, and Performance Max

> 📊 Level ⭐⭐ | 5.1KB | `entities/almcorp-google-ads-expanded-experiment-v24-1.md`

## 核心要点
- Google Ads v24.1 扩展了 AI Max、视频、Demand Gen 和 Performance Max 的实验支持
- 涵盖 AI Max 策略更新和实验配置变化
- 对广告技术从业者有参考价值

## 深度分析
### 1. 自动化与测量之间的结构性矛盾
v24.1 的核心意义在于：Google 并没有减少自动化，而是**在增加自动化的同时提供更正式的验证路径**。这是一个重要的信号——Google 意识到"黑盒自动化"会失去广告主的信任，而"可测量的自动化"才能维持广告主的投入。
AI Max、Demand Gen、Performance Max 这些 campaign 类型本身就是高度自动化的产物。传统 A/B 测试方法（复制 campaign、分割流量、对比结果）在这些新类型上几乎失效，因为平台在多个层面同时做决策，变量无法隔离。v24.1 的实验支持扩展本质上是在说：我们承认你们的测量需求，我们来帮你测量。

### 2. 三种实验类型的分层设计
Google Ads API 实际上已经建立了一套分层实验架构：

- **System-managed experiments**：创建独立的 treatment campaign 与 control 并行跑，适合迁移类决策
- **Intra-campaign experiments**：在单个 campaign 内部切分流量测试特定功能，适合 AI Max 这类不适合整体切换的场景
- **Asset optimization experiments**：专门针对 Performance Max 的素材组合测试
这种分层设计反映了 Google 对"不是所有测试都应该用同一种方法"的理解。广告主需要根据决策类型选择对应的实验模式，而不是把所有问题都套用同一种测试框架。

### 3. 报告层的统计化是重大进步
传统实验报告只提供原始数据（clicks、conversions、impressions），v24.1 引入的 p-values、point estimates 和 margin of error 意味着 Google 开始提供**统计显著性上下文**。这是一个从"看数字"到"理解数字含义"的质变。
对于广告技术团队而言，这意味着：

- 不再需要自己计算 statistical significance
- 可以区分"真实提升"和"噪声"
- 可以在置信区间内做决策而不是凭直觉

### 4. API-UI 对齐的战略意图
`ADOPT_AI_MAX`、`PMAX_REPLACEMENT_SHOPPING` 等 API 类型与 UI 操作的映射，不是单纯的技术文档。它意味着**实验不再只是开发者的事情**，而是跨越 API 开发者、媒体经理、分析师和决策者所有人的共同语言。这种对齐减少了团队间的沟通损耗。

## 实践启示
### 1. 建立实验优先级矩阵
不是所有变化都需要实验。团队应该建立优先级框架：
| 决策类型 | 影响程度 | 可逆性 | 推荐实验类型 |
|---------|---------|--------|-------------|
| 迁移到 Performance Max | 高 | 低 | System-managed |
| 开启 AI Max | 高 | 中 | Intra-campaign |
| 素材组合优化 | 中 | 高 | Asset optimization |
| 出价策略调整 | 高 | 中 | System-managed |

### 2. 定义明确的成功标准再开始实验
常见错误：先跑实验，再根据结果定义"成功"。正确做法是在实验设计阶段就明确：

- 主要指标是什么（conversion value？CPA？）
- 统计显著性阈值是多少（p < 0.05？）
- 最小可接受 lift 是多少？

### 3. 重视异步操作的错误处理
实验的 scheduling 和 promotion 是异步操作，错误不会立即返回。工程团队必须：

- 轮询 operation status
- 主动获取 async errors
- 建立实验状态监控 dashboard

### 4. 连接外部数据做下游验证
Google Ads 实验数据是平台级别的，但业务影响是全链路的。成熟的团队会将 Google Ads 实验结果与 CRM 数据、电商数据打通，验证"平台层面的提升"是否真的转化为"业务价值"。

### 5. 建立实验命名和治理规范
随着实验覆盖范围扩大，命名混乱会成为真实问题。建议：

- 命名格式：`{campaign_type}_{hypothesis}_{date}`
- 每个实验关联决策 owner
- 建立实验库，记录所有历史实验和结论
## 相关实体
- [3Rdfsmp](https://github.com/QianJinGuo/wiki/blob/main/entities/3rdfsmp.md)
- [Announcing Openai Compatible Api Support For Amazon Sagemaker](ch04/069-ai.md)
- [Building Ai Agents For Business Support Using Amazon Bedrock](ch04/073-building-ai-agents-for-business-support-using-amazon-bedrock.md)
- [Aeo And Geo For Ai Overviews Chatgpt Claude Gemini And Perplexity](ch04/069-ai.md)
- [Building Blocks For Foundation Model Training And Inference On Aws](ch04/069-ai.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/almcorp-google-ads-expanded-experiment-v24-1.md)

---

