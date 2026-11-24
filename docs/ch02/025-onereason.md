# OneReason：快手将推理注入推荐基模的系统性尝试

> 📊 Level ⭐⭐⭐⭐ | 10.7KB

> 原文归档：[原文归档](https://mp.weixin.qq.com/s/-qZ_Z8RMm67tv0ciFbpSSA)

快手技术团队 OneRec 团队推出的 **OneReason**——把 Reasoning 真正注入推荐基模的系统性尝试。核心包括：578B 数据三阶段预训练、归纳/溯因/演绎推荐 CoT 设计、"先专后合"强化学习。首次在推荐基础模型上让 thinking 稳定超越 non-thinking（Pass@4 +13.45%），业务收益年化数亿元。

## 一句话

**OneReason 用完整闭环回答了三个曾经悬而未决的问题：**(1) 推荐基模能不能"会推理"？(2) 推荐 CoT 应该长什么样？(3) 推理基模能不能上线工业场景？

## 核心创新

### 578B 数据三阶段预训练

四层递进式数据架构实现 item 与自然语言深度语义对齐：

| 粒度 | 内容 | 目标 |
|------|------|------|
| Token | 单 Token 释义、前缀语义预测 | 子单元语义绑定 |
| Item | 容量感知粗粒化、多视角 QA | 单品内容双向映射 |
| Relational | 看后搜、协同过滤、共窗共现 | 隐式偏好翻译为可解释语义 |
| User | 分域分组、全时序穿插 | 全场景用户兴趣对齐 |

三阶段训练策略：预热(110B)→全参(449B)→长序列(19B)，上下文窗口放开至 32K。

**效果：** R0 物品锚定 +160.5%，R3 跨域推荐 +65.1%。

### 推荐专属 CoT 三模块

不同于数学推理的演绎式，推荐推理是溯因式的——从噪声行为中提取信号、假设兴趣、收敛到决策。

```
用户抽象 (Persona Abstraction)
    ↓
兴趣发散 (Interest Expansion) —— "少即是多"消融实验: n=1,3,5 最佳，n=10,20 衰减
    ↓
兴趣推断 (Transition Inference)
```

### 先专后合的强化学习

针对推荐奖励稀疏问题的 GRPO 改进：

1. **两阶段轨迹生成**：先生成推理轨迹，再扩展多个候选
2. **Set-wise 奖励**：从 point-wise 抬升到 set-wise，评估覆盖度与多样性
3. **优化稳定策略**：推理文本 token 和推荐 itemic token 采用不同裁剪范围

融合路线：RFT (高质量轨迹筛选) vs MOPD (多教师在策略层面落)。

## 关键突破

### 技术突破1: 首次让 thinking 稳定超越 non-thinking

之前 OneRec-Think、OpenOneRec 都观察到 thinking 模式不稳定优于 non-thinking 的反常识现象。OneReason 在 Pass@4 上让 thinking 平均领先 +13.45%，把"思考"在推荐基模上第一次变成正资产。

### 技术突破2: 证明 RL 是解锁推理收益的必备环节

仅 SFT 时 thinking 表现劣于 non-thinking；经过"先专后合"的 RL 方案后 thinking 实现反超。同时发现 **CoT 能力内化现象**：引入 CoT 不仅提升 think 能力，还能间接反哺 non-think 性能。

### 技术突破3: Fast-Slow Thinking 工业部署

| 部署方式 | 曝光 | 广告收入 |
|----------|------|---------|
| Slow (近线慢思考) | +0.94% | +4.53% |
| Fast (实时快思考) | +6.83% | +4.64% |
| **Combined** | **+10.33%** | **+8.23%** |

对应年化数亿元人民币级别商业增量，**ROI > 5**。

## 四层能力梳理

| 层级 | 能力 | SFT 数据量 | 核心任务 |
|------|------|-----------|---------|
| R0 | 感知 | ~941K | 单 itemic token 还原物料语义 |
| R1 | 推导 | ~400K | LLM judge 筛选解释高质量 i2i 关系 |
| R2 | 演进 | ~130K | 合成带 CoT 的兴趣演化数据 |
| R3 | 推荐 | ~885K | 归纳/溯因/演绎合成 CoT 冷启数据 |

## 与已有实体的关联

- [华为伏羲推荐系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/huawei-fuxi-recommendation-system-ascend-npu-scaling-law.md) — 另一个大规模生成式推荐实践
- [Agent Harness Engineering Survey](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-2026.md) — 推理系统的 harness 范式
- [高德 Marketing AutoResearch](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gaode-marketing-autoresearch-ai-native-practice.md) — 同样涉及算法模型迭代自动化
- [OpenClaw Agent Loop](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-agent-loop-design-patterns.md) — Fast-Slow Thinking 与 Loop 设计范式对照

## 下一步：Agentic Recommender Harness

OneReason 把推荐基模的 Reasoning 补上了关键一步。下一步是打造 **Agentic Recommender Harness**，让推荐基模具备：

- **规划能力**：能够制定多步推荐策略
- **工具调用**：能够调用外部检索、计算工具
- **长程对话**：支持多轮交互式推荐

最终驱动推荐系统从"千人一面的固定流水线"走向"千人千策、能规划、能用工具、能多轮对话"的 Agentic 推荐系统。

## 深度分析

### 1. 溯因式 CoT：推荐推理不是"更长的思考"

OneReason 对推荐 CoT 的核心回答在"格式"层面：推荐推理天然是**溯因**而非演绎——行为是果、兴趣是因，要从带噪、跨域的行为序列反推物料"为什么适合此刻"，因此直接套用数学式演绎 CoT 无效。 三模块每步都是信息压缩：用户抽象把稀疏行为收敛为 20 类可解释偏好先验；兴趣发散生成候选假设，消融显示 n=1,3,5 最佳而 n=10,20 衰减——"少即是多"；兴趣推断按证据强度、近期性、画像匹配、目标域兼容性收敛到决策。 五维质检（Safety/Logic/Factuality 等）里，Logic 与 Factuality 直指"看似推理、实为复述"的通病，并强制锚定真实行为序列。

### 2. RL 是推理收益的开关：SFT 无法激活思考

最反直觉的结论：仅 SFT 的模型 thinking 反而劣于 non-thinking——思考能力无法靠模仿"抄"出来，必须经 RL 激活。 GRPO 三项改造均针对推荐奖励特性：奖励稀疏 → 两阶段轨迹生成，先推理再扩展多候选、一次思考多次评估；输出结构化 → set-wise 奖励按整组候选的覆盖度与多样性评估；自然语言与 itemic token 差异化裁剪以稳定训练。 多业务规模化靠"先专后合"：先单域训专家，再经 RFT（离线学习成功轨迹）或 MOPD（on-policy 多教师蒸馏）融合。 RFT 后全域 Delta LL 转正说明 CoT 经成功轨迹筛选才真正辅助决策；CoT 能力内化（反哺 non-think）则暗示推理改变了基模表征本身。

### 3. 预训练语义对齐是推理的地基

RL 增益的前提是基模"看得懂"物料：578B token 四层递进数据（OpenOneRec 仅 160B）完成 itemic token 与自然语言的双向映射——Token 层子单元语义绑定、Item 层多视角 QA、Relational 层把看后搜/协同过滤/共窗等协同信号翻译成可解释语言、User 层全时序对齐；三阶段先冻结主干只训 item 嵌入，再全参对齐，最后放开 32K 上下文。 R0 物品锚定 +160.5%、R3 跨域推荐 +65.1% 表明感知与跨域两端获益最大：前者是对齐的直接收益，后者说明协同信号的语言化带来了跨域迁移能力。结构性结论：reasoning 取决于"协同信号 → 语义空间"的翻译质量——通用大模型缺协同特征，ID 模型缺语义，OneReason 用对齐把两边先验装进同一模型，再让 RL 激活推理。

### 4. Fast-Slow 分层部署：把推理移出延迟路径

推理基模上线的最大障碍是延迟，OneReason 把"思考"拆出请求路径：慢思考（近线）离线生成推理召回，快思考（实时）提供轻量推理信号，结果在排序层融合。 10 天 A/B 组合收益（曝光 +10.33%、收入 +8.23%、ROI>5）中，快路径贡献大部分曝光增量（+6.83% vs +0.94%）——工业价值主要来自"实时但轻"的推理，重推理适合近线画像与召回池。 这与 [Fast-Slow Loop 设计范式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-agent-loop-design-patterns.md) 是同一趋势：慢系统外置、快系统在环。启示：别在延迟预算内做重推理，要让推理结果可缓存、可复用——这决定推理是成本项还是资产项。

## 实践启示

### 1. 关键推荐场景引入推理
对高价值推荐场景（如医疗、金融、教育）引入推理驱动推荐，提升质量和信任。

### 2. 推理结果作为推荐解释
将推理过程转化为用户可理解的推荐解释——不只是"你可能在想什么"，而是"为什么这个适合你"。

### 3. 推理型推荐的 A/B 测试
量化推理型推荐 vs 匹配型推荐的质量差异和成本差异——用数据驱动决策。

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/reinforcement-learning-rlhf.md)

---

