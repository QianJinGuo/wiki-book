# Bedrock 多模态模型对比测试平台：基于 Converse API 的统一游戏 AI UI 定位评估

## Ch11.279 Bedrock 多模态模型对比测试平台：基于 Converse API 的统一游戏 AI UI 定位评估

> 📊 Level ⭐⭐ | 4.0KB | `entities/amazon-bedrock-multimodal-model-benchmark-gaming-qa-2026.md`

# Bedrock 多模态模型对比测试平台：基于 Converse API 的统一游戏 AI UI 定位评估

> **Background**：本文基于 AWS China Blog 发布的指南，介绍基于 Amazon Bedrock 构建的多模态模型对比测试平台。该平台面向游戏 QA 自动化场景，通过标准化测试用例和自动化执行，帮助开发团队量化对比 Claude、Nova、Llama、Gemma、Mistral、Qwen 等多模态模型在 UI 元素定位（bounding box）精度、响应速度和 token 消耗上的表现。

## 核心价值：数据驱动的模型选型

游戏 AI QA 自动化的核心链路是：模型识别游戏画面 → 输出需要点击的 UI 元素坐标（bounding box）→ 执行点击操作。坐标不准，测试就会失败。不同模型在元素定位精度、响应速度、token 消耗上各有差异，靠主观感受很难做出有说服力的技术决策。该平台通过标准化测试用例和自动化执行，用量化数据为模型选型提供依据。

## 平台架构

**Converse API 统一调用**：平台使用 Amazon Bedrock Converse API 统一调用所有模型，屏蔽了不同厂商模型之间的请求格式差异。无论是 Claude、Nova 还是第三方模型，调用代码完全一致。支持多图输入（同时传主图和参考图做跨图识别）。

**双策略 Bounding Box 解析**：不同模型对同一个"输出 bounding box"指令的输出格式不尽相同——有的输出结构化 JSON，有的用自然语言描述坐标。解析器同时支持两种格式，并自动完成 0-1000 归一化坐标系到像素坐标的转换和越界裁剪。

**健壮的容错设计**：限流自动重试（指数退避）、模型 ID 自动兼容（跨区域推理 ID 的 us. 前缀问题）、单模型失败隔离（一个模型调用失败不影响其他模型的测试继续执行）。

## 设计要点

- **0-1000 归一化坐标系**：Claude 和 Nova 系列都使用 0-1000 坐标系而非像素坐标，`pixel_x = model_x * (image_width / 1000)` 转换。不了解此约定直接使用会导致定位偏移。
- **Discover Bedrock Models**：可自动查询当前 AWS 账号下所有可用多模态模型，一键批量导入配置。
- **结果叠加对比**：多模型 bounding box 叠加显示在同一截图上，不同颜色区分，直观对比各模型的识别范围和精度。
- **项目已开源**：`github.com/aws-samples/sample-multimodal-model-analysis`

## 相关实体

- [Bedrock 图像内容精确分析](ch11/314-bedrock.html)
- [Amazon Bedrock 模型推理 Serverless 异步架构](ch11/310-amazon-bedrock.html)
- [Agentic Vision：基于 Bedrock + MCP 构建视觉智能](ch11/314-bedrock.html)
- [Habby 游戏借助 AWS DevOps Agent 实现智能运维](ch11/297-aws-devops-agent.html)
- [vivo LLM 游戏推荐表达层](../ch01/867-llm.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/amazon-bedrock-multimodal-model-benchmark-gaming-qa-2026.md)

---

