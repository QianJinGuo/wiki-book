# Amazon Nova 2 Lite 视觉对象检测（自然语言驱动）

## Ch11.108 Amazon Nova 2 Lite 视觉对象检测（自然语言驱动）

> 📊 Level ⭐⭐ | 9.3KB | `entities/object-detection-with-amazon-nova-2-lite.md`

# Amazon Nova 2 Lite 视觉对象检测（自然语言驱动）

## 概述

Amazon Nova 2 Lite 是 AWS Bedrock 上的多模态基础模型，通过**自然语言 prompt** 实现零训练目标检测 —— 无需数据标注、无需训练、无需基础设施管理。给定图像和目标列表（如 "vehicle"、"person"、"dent"），模型返回结构化 JSON 的精确 bounding box 坐标。

## 核心架构

四步 pipeline 即可部署：

1. **Prompt Engineering** — 模板化指令结构，动态注入 `elements` 和 `schema` 变量
2. **Amazon Bedrock Converse API** — 统一多模态推理接口，无需管理 GPU 基础设施
3. **Coordinate Processing** — Nova 归一化坐标 (0-1000 尺度) → 像素坐标转换
4. **Visualization** — PIL/Pillow 渲染 bounding box 用于验证

## 关键 Prompt 模板设计

`elements` 和 `schema` 两个变量动态构造，支持任意目标类别。模板要求模型：
- Think step-by-step（CoT 推理）
- 严格输出指定 JSON 结构（含 "json" 字面量字段）
- 去重 bounding box
- 紧密贴合 (tightly fit) 检测框

## 成本与定位

| 维度 | 数值 |
|------|------|
| Bedrock 输入 | $0.0003 / 1K tokens |
| Bedrock 输出 | $0.0025 / 1K tokens |
| 单图成本 | ~$0.0006 (230 input + 200 output tokens) |
| 10K 图示例 | ~$5.69 |
| 部署时长 | 30-45 分钟 |

## 应用场景

- **制造业**：缺陷检测、装配验证
- **农业**：作物识别、病害检测
- **物流**：包裹计数、损坏检测

## 与现有 entity 差异化

| 维度 | 本文章 (Nova 2 Lite) | Nova Lite 1.0 Fine-Tuning (existing) |
|------|----------------------|--------------------------------------|
| 任务类型 | 通用目标检测 (prompt-driven) | 指令遵循优化 (fine-tuned) |
| 训练需求 | 零训练 | 需微调 + 8-10 张校准图 |
| 部署方式 | Bedrock Converse API | Custom Model + Provisioned TPUT |
| 适用场景 | 快速 POC、动态目标类别 | 固定场景高准确率 |
| 成本模式 | 按 token 计费 (~$0.0006/图) | 训练 $0.02 + 推理 |

## 深度分析

### 零训练检测的实现机制

Nova 2 Lite 的零样本能力源于其多模态预训练阶段积累的视觉-语言对齐。在传统计算机视觉流程中，每新增一类目标都需要重新标注数据、训练模型、验证调优；而 Nova 2 Lite 将"目标类别"作为自然语言输入，通过 prompt 中的 `elements` 变量注入，绕过了这一成本。 这一设计与 Prompt Engineering 基础 中强调的"任务描述即规格"范式一脉相承——模型依赖语言理解能力而非记忆特定类别的视觉特征。AWS 官方博客的 street scene 示例验证了这一点：仅凭 "vehicle" 和 "stop sign" 两个词，模型能检测小目标、远处目标和部分遮挡目标，且 bounding box 贴合紧密。

### 归一化坐标系统的工程影响

Nova 采用 0-1000 归一化坐标而非直接的像素坐标，这是一个影响下游处理的关键设计选择。归一化坐标使 API 响应与图像分辨率解耦——同一坐标在不同尺寸图像上都能通过简单线性变换还原为对应像素位置。 这一机制对 Inference 优化 有直接意义：图像预处理（resize、normalize）不需要在调用 Bedrock 前完成，客户端只需在渲染阶段做一次坐标变换，降低了端到端延迟。

### Serverless 架构的成本经济学

文章推荐的 Lambda + API Gateway + S3 + CloudFront 组合，本质上是将"空闲成本"降为零。Lambda 按调用计费，无请求时完全不产生费用；Bedrock API 本身也是按 token 计费。 结合 [Bedrock Serverless 架构案例](../ch11-067-amazon-bedrock-model-inference-serverless-architecture-case/) 的经验，这种模式在日均处理量波动大或不可预测的场景下（农业季节性采集、物流大促期间）具有明显优势。对于日均 1.2M 张图像的农业场景，$200/season 的成本远低于自建 GPU 集群的固定支出。

### 三行业用例的泛化性分析

三个应用场景（制造业质量控制、精确农业、物流分拣）覆盖了工业视觉的核心场景，其共同特征是：目标类别随业务需求动态变化（"dent"vs"scratch"、病害类型、损坏形态），且数据标注成本高、专家稀缺。 这与 Agentic Workflow Patterns 中描述的"动态任务分配"场景高度吻合——Nova 2 Lite 在这类场景中替代了传统的专用检测模型，降低了 AI 落地的门槛。值得注意的是，这些用例均未使用任何额外训练数据，验证了 prompt-driven 范式在垂直行业的泛化潜力。

### Prompt 模板的可复用性工程

模板中 `elements`（检测目标列表）和 `schema`（输出 JSON 结构）作为变量动态注入，使同一模板可复用于完全不同的检测任务。 这种设计将"任务定义"与"执行引擎"分离，是 [Nova Lite Fine-Tuning](../ch11-054-amazon-nova-lite-fine-tuning-高性价比的视觉检测模型微调案例与实践-亚马逊aws官方博/) 一文中微调路线的对立面——后者通过训练固化任务知识，前者通过语言输入动态指定任务。对于需要频繁切换检测目标的场景（如质检线上切换产品类型），模板化设计的工程价值尤为突出。

## 实践启示

### 快速验证优先于复杂架构

30-45 分钟即可完成端到端部署意味着团队应**先验证再优化**。在投入生产级基础设施前，用 Lambda + Bedrock Converse API 原型验证目标类别的检测效果。对于street scene 这类开放场景，"vehicle" 和 "stop sign" 的 baseline 测试能快速暴露模型在遮挡、小目标上的能力边界。 验证完成后再决定是否需要 [Nova Lite 微调](../ch11-054-amazon-nova-lite-fine-tuning-高性价比的视觉检测模型微调案例与实践-亚马逊aws官方博/) 或自定义模型。

### Prompt 模板是核心工程资产

`elements` + `schema` 的模板化设计是整个方案最重要的工程决策。模板质量直接决定检测准确率和 JSON 输出可用性。关键要素包括：CoT（step-by-step）推理开启、tightly fit bounding box 约束、去重逻辑明确。 建议将模板作为代码资产纳入版本控制，并在 Prompt Engineering 基础 框架下建立评估集，持续优化模板在不同场景下的准确率。

### 生产部署优先考虑 Serverless 弹性

对于日均处理量不可预测的场景（农业季节性采集、电商大促、突发质检任务），Lambda 的自动扩缩容 + Bedrock 按调用计费是最优成本结构。 当日均调用量超过约 50K 张图像时，可评估 Bedrock Provisioned Throughput 的预留容量方案，将边际成本降低 30-50%。[详细架构参考](../ch11-067-amazon-bedrock-model-inference-serverless-architecture-case/)。

### 坐标转换是必须处理的实现细节

Nova 归一化坐标 (0-1000) 需要在客户端做一次线性变换才能用于图像渲染：

```
x_pixel = (x_norm / 1000) * image_width
y_pixel = (y_norm / 1000) * image_height
```

这一步骤在 PIL/Pillow 中通常用 `ImageDraw.rectangle()` 实现。建议将其封装为独立函数并配合单元测试，防止坐标错误导致 bounding box 偏移。这是将 prompt-driven 检测结果转化为可视化输出的必经之路。

### 成本估算应包含隐性基础设施成本

文章给出的 $0.0006/图 仅涵盖 Bedrock token 费用。生产环境中还应计入：Lambda 调用费（$0.20/M requests）、API Gateway 调用费、S3 存储费（如缓存原始图像）。 对于高吞吐场景（日均 >100K 图），Lambda + API Gateway 的调用费用可能达到 Bedrock费用的 10-20%。建议用 AWS Calculator 建模全链路成本，而不仅是 token 费用。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/object-detection-with-amazon-nova-2-lite.md)

---

