# 试用 Amazon Bedrock 中的新控制台体验：该体验针对兼容 Anthropic 和 OpenAI 的 API 进行了优化

## Ch11.115 试用 Amazon Bedrock 中的新控制台体验：该体验针对兼容 Anthropic 和 OpenAI 的 API 进行了优化

> 📊 Level ⭐⭐ | 8.8KB | `entities/试用-amazon-bedrock-中的新控制台体验该体验针对兼容-anthropic-和-openai-的-api-进.md`

# 试用 Amazon Bedrock 中的新控制台体验

## 概览

Amazon Bedrock 重新设计的控制台——**针对 OpenAI / Anthropic 兼容 API 优化**的新工作流，包括模型目录、并排比较、基于项目的组织、预填代码片段的项目感知文档。这是 AWS 在 2026 年 Q2 推进 Bedrock 平台化的核心 UI 升级。

## 五大新能力

### 1. 模型目录 (Model Catalog)
- 中心化的模型发现入口
- 按厂商（Anthropic / OpenAI / Cohere / Mistral / Meta / Amazon）/模态（文本/图像/嵌入）/定价 分组
- 每个模型卡片含：上下文窗口、定价、区域可用性、最佳实践模板

### 2. 并排比较 (Side-by-side Comparison)
- 选 2-4 个模型 + 同一 prompt → 同步输出 + 延迟 + 成本对比
- 适合评估阶段的快速筛选

### 3. 基于项目的组织 (Project-based Organization)
- 一个项目 = 一组模型配置 + IAM 角色 + 知识库 + Guardrails
- 取代原来"散落各处"的 model invocation log
- 适合多团队共享 Bedrock 但需要资源隔离的场景

### 4. 项目感知文档 (Project-aware Documentation)
- 文档自动注入当前项目的 region、IAM role、模型 ID
- 代码片段一键复制（不用手填 placeholder）

### 5. bedrock-mantle 兼容端点

```bash
# 新增的 OpenAI/Anthropic 兼容端点
curl https://bedrock-mantle.us-east-1.amazonaws.com/v1/chat/completions \
  -H "Authorization: Bearer ..." \
  -d '{"model": "anthropic.claude-fable-5", "messages": [...]}'
```

支持的 API 兼容：
- OpenAI `/v1/chat/completions`、`/v1/embeddings`
- Anthropic `/v1/messages`
- 自动路由到 Bedrock 后端的实际模型

## 区域可用性

| 区域 | bedrock-mantle | 新控制台 |
|------|---------------|---------|
| us-east-1 | ✅ | ✅ |
| us-west-2 | ✅ | ✅ |
| eu-west-1 | ✅ | ✅ |
| ap-northeast-1 | ✅ | ✅ |
| ap-southeast-1 | ✅ | ✅ |
| cn-north-1 (北京) | ❌ | ❌ |
| cn-northwest-1 (宁夏) | ❌ | ❌ |

**重要**：中国区域不支持 bedrock-mantle，使用中国区域需继续用 bedrock-runtime 端点。

## 实践启示

- **OpenAI 客户端零修改迁移**到 Bedrock：换 base_url 即可
- 项目级隔离比账户级隔离更灵活——避免创建多个 AWS 账户
- 模型目录的"按定价筛选"是评估多模型成本的关键功能
- bedrock-mantle + 项目感知文档 = 减少新成员 onboarding 时间

## 与其他 Bedrock 文档的差异化

- `amazon-bedrock-model-inference-serverless-architecture-case-study.md` — 服务端架构
- 本文档：**客户端用户体验**（控制台 UI 升级 + 兼容端点）

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/试用-amazon-bedrock-中的新控制台体验该体验针对兼容-anthropic-和-openai-的-api-进.md)

## 深度分析

### 核心观点

1. **API 兼容层是云厂商 AI 平台化的战略拐点**
   - `bedrock-mantle` 通过实现 OpenAI `/v1/chat/completions` + Anthropic `/v1/messages` 双协议兼容，让现有 OpenAI SDK 客户端代码无需修改即可切换到 Bedrock 后端
   - 这消除了厂商锁定壁垒——用户换云厂商只需改 `base_url`，而非重写应用层代码，是 AI 平台竞争的关键差异化

2. **项目感知文档重新定义了控制台作为"开发者入口"的角色**
   - 传统控制台只提供通用示例代码；新控制台在文档中动态注入项目级变量（region、IAM role、model ID），代码片段从"参考"变成"可运行的生产代码"
   - 这一设计将 onboarding 摩擦从"复制 → 填 placeholder → 验证"压缩为"一键复制 → 直接运行"

3. **模型目录的并排比较解决了一个被忽视的评估痛点**
   - 在多模型时代，评估成本 / 延迟 / 上下文窗口差异本是工程决策，但散落在文档中的信息需要大量人工聚合
   - 将比较能力内嵌到控制台，使评估从"文档研究"变成"实时交互"，大幅缩短模型选型周期

4. **中国区域不支持 bedrock-mantle 揭示了合规性约束对 AI 产品路线的影响**
   - 北京和宁夏区域无法使用新端点，强制要求继续用 `bedrock-runtime` 端点
   - 这意味着在中国区部署需要维护两套 API 调用路径，跨国企业的一致性架构设计必须考虑区域能力差异

### 技术要点

- **兼容端点路由**：bedrock-mantle 自动将 OpenAI/Anthropic 协议请求路由到 Bedrock 后端实际模型，协议转换对用户透明
- **IAM + 项目双重隔离**：项目级配置（模型 + IAM 角色 + 知识库 + Guardrails）比账户级隔离更灵活，适合多团队共享同一 AWS 账户
- **模型卡元数据**：每个模型卡片包含上下文窗口、定价、区域可用性，支持按模态 / 厂商 / 定价排序和筛选

### 实践价值

- 对**平台工程师**：可以用同一套客户端代码对接多个云厂商的 LLM，降低多云管理复杂度
- 对**AI 应用团队**：新成员加入后，通过项目感知文档可以零学习成本写出可运行代码，减少 team onboarding 时间
- 对**成本优化**：模型目录的定价筛选 + 用量仪表板让多模型成本对比成为日常操作，而非月底复盘

### 相关实体

- [Amazon Bedrock Agentcore Runtime Deep Dive And Scenario Analysis](https://github.com/QianJinGuo/wiki/blob/main/entities/amazon-bedrock-agentcore-runtime-deep-dive-and-scenario-analysis.md) — Bedrock runtime 体系深度解析，与 bedrock-mantle 兼容端点互补
- [Agentops Operationalize Agentic Ai Amazon Bedrock](https://github.com/QianJinGuo/wiki/blob/main/entities/agentops-operationalize-agentic-ai-amazon-bedrock.md) — Bedrock 上 agent 的 production 化路径，包含 Guardrails / 知识库等安全机制

## 实践启示

1. **多云 LLM 策略的落地路径**：先用 OpenAI SDK 写应用，通过换 `base_url` 接入 Bedrock；后续逐步切到 Bedrock 原生 API 以获取更多控制能力（如 Guardrails、Knowledge Bases）
2. **模型选型流程改造**：放弃"读文档 → 人工比较"的串行流程，改为在控制台并排比较 2-4 个模型的真实输出 + 延迟 + 成本数据，评估周期从天级压缩到小时级
3. **项目化组织建议**：每个业务线或环境（dev/staging/prod）创建独立 Bedrock 项目，利用项目级 IAM 角色实现资源隔离，避免共享账户的权限混乱
4. **中国区特殊处理**：若涉及跨境多区域架构，需要维护两套 API 路径（北京区用 `bedrock-runtime`，其他区用 `bedrock-mantle`），建议在应用层做端点抽象
5. **安全与合规优先部署**：在 production 上线前务必配置 Bedrock Guardrails + row-level entitlements，即使当前用例看起来"不需要"，也为未来扩展到敏感场景预留安全基础

---

