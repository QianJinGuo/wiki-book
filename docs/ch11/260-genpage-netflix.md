# GenPage: Netflix 端到端生成式首页构建

## Ch11.260 GenPage: Netflix 端到端生成式首页构建

> 📊 Level ⭐⭐⭐ | 4.7KB | `entities/genpage-netflix-generative-homepage-construction.md`

# GenPage: Netflix 端到端生成式首页构建

## 核心洞察

Netflix 用单一 decoder-only Transformer 模型替代传统的多阶段推荐流水线（候选生成 → 行级排序 → 实体级排序），将首页构建视为**自回归序列生成问题**：用户上下文作为 prompt，整页布局作为 response。

**关键突破**：不是生成扁平排序列表（如 TIGER、HSTU、OneRec），而是同时生成行（rows）、实体（entities）和布局（layout），实现真正的端到端页面构建。

## 架构设计

### 自定义 Tokenization

领域专用 tokenizer 而非通用文本 tokenizer：

- **实体/行 = 单 token**：每个 movie/show/game 和每个行（如"韩剧推荐"）各占一个 token
- **上下文 token**：用户行为历史（action type + entity ID + time bucket + duration bucket）、用户画像、请求上下文
- **压缩效率**：用户行为"30天前看了50分钟 OITNB"→ 4 tokens（vs GPT-5 tokenizer 16 tokens）
- **产品控制**：token 和产品概念直接映射，便于约束解码

### 训练三阶段

1. **预训练（Next-Token Prediction）**：从头训练，学习用户上下文 → 成功首页的映射。用生产环境收到正反馈的首页印象做训练数据
2. **WBC 后训练（Weighted Binary Classification）**：将生成转化为 token 级价值预测。每个 token 的 logit = 该位置生成该 token 的价值估计。简单高效，但只优化实体级指标
3. **RL 后训练（Dr. GRPO）**：真正的整页优化。训练 reward model 预测页面级奖励，用 KL penalty 防止 reward hacking

### RL 训练细节

- **算法**：Dr. GRPO（GRPO 变体，缓解训练目标偏差）
- **Reward Model**：从预训练 checkpoint 初始化，预测页面级奖励（实体级奖励之和）
- **KL Penalty**：保持策略接近预训练 checkpoint，防止 reward hacking
- **格式奖励**：规则引导（页面应为行列表，关键行/实体不能太靠下）

## 生产挑战与解决方案

### 冷启动

新实体缺乏交互数据 → **语义嵌入融合**：
- 实体表示 = ID embedding ⊕ content-based embedding（synopsis、cast、transcript、genres、video content）
- 训练时随机替换实体 ID 为 fallback token，确保模型能从 content embedding 单独推荐

### 多节奏增量训练

- 大规模预训练 + 后训练：按可调频率在宽历史窗口上运行
- 每日增量更新：从昨日 checkpoint 继续后训练，混合最新数据 + 历史采样
- 防止灾难性遗忘 + 保持模型新鲜度

### 业务规则约束解码

- 每步生成计算合法 token mask，应用到输出 logit
- 自定义 tokenization 简化了约束解码：单 token = 单实体/行，规则直接映射到 token mask
- 支持：去重、行固定、类别一致性、位置约束

## 生产效果

**在线 A/B 测试**：
- 核心用户参与度指标统计显著提升（用于上线决策的指标）
- 端到端服务延迟降低 20%

**离线发现**：
- **prompt 丰富化 > 模型扩容**：在当前规模下，丰富 prompt 比增大模型更有效
- **RL 后训练意外提升多样性**：即使多样性不在目标中，RL 也增加了首页多样性

## 与其他方案的差异化

| 维度 | GenPage | TIGER/HSTU/OneRec | 传统多阶段 |
|------|---------|-------------------|-----------|
| 输出 | 行 + 实体 + 布局 | 扁平排序列表 | 分阶段排序 |
| 优化 | 整页级 RL | 实体级 | 各阶段独立 |
| Token | 领域专用 | 通用/semantic ID | 无 |
| 延迟 | -20% | - | 基线 |

## 可复用经验

1. **生成式推荐 ≠ LLM 套用**：需要领域专用 tokenization，通用文本 tokenizer 效率太低
2. **RL 后训练的意外收益**：整页 RL 优化可能带来多样性等涌现属性
3. **Prompt > 参数**：在推荐系统当前规模下，特征工程（prompt 丰富化）的边际收益大于模型扩容
4. **约束解码是生产必需**：业务规则不能只靠训练信号保证，必须在推理时硬约束

---
