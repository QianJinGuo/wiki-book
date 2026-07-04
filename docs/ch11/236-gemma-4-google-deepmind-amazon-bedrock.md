# Gemma 4 模型发布 — Google DeepMind 开源权重家族在 Amazon Bedrock 上线

## Ch11.236 Gemma 4 模型发布 — Google DeepMind 开源权重家族在 Amazon Bedrock 上线

> 📊 Level ⭐⭐ | 3.7KB | `entities/gemma-4-models-amazon-bedrock-deepmind-open-weights.md`

# Gemma 4 模型发布 — Google DeepMind 开源权重家族在 Amazon Bedrock 上线

> Source: [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/introducing-gemma-4-models-on-amazon-bedrock.md)

## 背景

2026-06-15 Amazon Bedrock 上线 Gemma 4 系列。Gemma 4 由 Google DeepMind 构建、Apache 2.0 许可发布，是"智能密度（intelligence-per-parameter）"导向的开源权重家族。

## 模型规格

### 三个变体

| 变体 | 类型 | 参数规模 | 主要特点 |
|------|------|---------|---------|
| Gemma 4 31B | Dense | 30.7B | 旗舰 dense 模型，Intelligence Index = 39（4B-40B 开源类中位数 15 的 2.6x） |
| Gemma 4 26B-A4B | MoE | 总参 26B / 激活 4B | 推理成本低，仅激活部分参数 |
| Gemma 4 E2B | Compact | 2.3B effective | 轻量部署、边缘场景 |

### 共同能力

- 内置 reasoning mode
- 原生 function calling（agent workflow）
- 多模态输入（text + image）
- 35+ 语言支持（预训练覆盖 140+）
- 智能密度优化（intelligence-per-parameter focus）

## 关键基准

**Artificial Analysis 智能指数**：
- Gemma 4 31B Intelligence Index = 39
- 同类（4B-40B 开源权重）中位数 = 15
- 高出中位数 2.6 倍

## Bedrock 集成价值

### 数据保护

- 推理完全在 AWS 基础设施上运行
- prompts 和 completions 不用于训练其他模型
- 内容不与第三方共享

### 部署灵活性

- 通过完全托管服务访问
- 无需 provision 基础设施
- 无需 hosting 模型权重
- 无需 operate 推理栈

### 应用场景

官方推荐使用场景：
- 多模态 agent
- 轻量级应用
- 文档理解 pipeline
- 软件工程工作流

## 实践启示

- **Gemma 4 31B 是开源权重 + 智能密度 + 推理托管 的最佳组合** — 在 Bedrock 上跑开源权重，规避了自托管运维负担
- **MoE 变体适合成本敏感场景** — 26B-A4B 总参大但激活小，推理成本接近小模型
- **Gemma 4 E2B 适合边缘 + 轻量应用** — 2.3B effective 参数可在资源受限环境运行
- **AWS Bedrock 的差异化是"开源 + 托管 + 合规"** — 不是新模型能力，而是把开源模型的部署门槛降到零

## 上线状态

- 2026-06-15 在 Amazon Bedrock 模型目录上线
- 通过 Bedrock on-demand inference 访问
- 完整支持的 API（Converse + InvokeModel）
- 模型卡片与定价详见 AWS Bedrock 文档

## 原文链接

## 相关实体
- [gemma 4 12b：google 多模态本地模型 —— 扔掉编码器](https://github.com/QianJinGuo/wiki/blob/main/entities/gemma-4-12b-google-multimodal-local.md)
- [amazon bedrock模型推理的serverless异步架构 – 处理在线多模态高负载案例](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-bedrock-serverless-async-inference-multimodal.md)
- [gemma 4 multi token prediction drafters](https://github.com/QianJinGuo/wiki/blob/main/entities/gemma-4-multi-token-prediction-drafters.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/introducing-gemma-4-models-on-amazon-bedrock.md)
- [diffusiongemma：扩散式文本生成模型（google 26b moe，4× 推理加速）](https://github.com/QianJinGuo/wiki/blob/main/entities/diffusiongemma-4x-faster-text-generation-google-2026-06.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/vision-multimodal.md)

---

