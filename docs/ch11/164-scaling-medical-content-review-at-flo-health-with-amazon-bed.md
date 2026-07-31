# Scaling medical content review at Flo Health with Amazon Bedrock

## Ch11.164 Scaling medical content review at Flo Health with Amazon Bedrock

> 📊 Level ⭐⭐ | 7.5KB | `entities/flo-health-medical-content-review-bedrock.md`

# Scaling medical content review at Flo Health with Amazon Bedrock – Part 2


## 概念导图

```mermaid
mindmap
  root(("Scaling medical content review at"))
    关键技术架构
      MACROS 架构适配
      AI 内容生成管道
      渐进式内容呈现
    AI 在高信任度领域的边界设计哲学
    多 Judge 架构的模块化价值
    结构化反馈循环作为系统级学习机制
    YAML 胜于 JSON 的工程启示
```

## 摘要

```mermaid
graph TB
    subgraph "边缘层"
        CDN[CDN/缓存] --> LB[负载均衡]
        LB --> GW[API Gateway<br/>认证+限流]
    end
    subgraph "服务层"
        SVC_A[业务服务A]
        SVC_B[业务服务B]
        AGENT_SVC[Agent 服务]
    end
    GW --> SVC_A & SVC_B & AGENT_SVC
    subgraph "Agent 运行时"
        SANDBOX[沙箱隔离]
        RUNTIME[执行引擎]
        POOL[连接池]
    end
    AGENT_SVC --> SANDBOX --> RUNTIME
    RUNTIME --> POOL
    subgraph "数据层"
        DB[(关系数据库)]
        CACHE[(Redis缓存)]
        OBJ[(对象存储)]
        VDB[(向量数据库)]
    end
    SVC_A --> DB & CACHE
    AGENT_SVC --> OBJ & VDB
    classDef edge fill:#fef3c7,stroke:#d97706
    classDef svc fill:#dbeafe,stroke:#2563eb
    classDef runtime fill:#ede9fe,stroke:#7c3aed
    classDef data fill:#d1fae5,stroke:#059669
    class CDN,LB,GW edge
    class SVC_A,SVC_B,AGENT_SVC svc
    class SANDBOX,RUNTIME,POOL runtime
    class DB,CACHE,OBJ,VDB data
```


Flo Health 工程团队基于 AWS Generative AI Innovation Center 的 PoC，构建了一套基于 Amazon Bedrock 的 AI 驱动的医疗内容审核与生成系统。该系统通过引入专门的 AI Judge（分别负责医疗准确性、法律合规、品牌风格等维度），结合 MACROS 架构和 Retrieval Augmented Generation (RAG)，将每篇内容的审核时间缩短了 60%，内容吞吐量翻了三倍，且无需扩大医疗团队。

## 核心要点

- **AI Judge 分工架构**：为不同审核维度（医疗准确性、法律合规、品牌风格）分别配置独立的 AI Judge，每个 Judge 拥有独立的 prompt 和测试集，可独立迭代优化而不产生回归问题
- **分层模型选择策略**：针对不同任务选用不同层级的 Claude 模型——Haiku 用于轻量分类和例行分析，Sonnet 用于高保真内容生成和复杂推理，在成本和质量之间取得平衡
- **YAML 替代 JSON**：作为输出格式，YAML 的缩进式结构比 JSON 更加鲁棒，解析错误显著减少；Amazon Bedrock 后推出结构化输出功能可进一步解决格式一致性问题
- **结构化反馈循环**：将每次专家修正转化为可复用的规则和示例，重复错误减少 70% 以上，例行合规修正减少 80%
- **三层验证体系**：内部医疗指南检查 → 外部可信医学来源验证 → 人类专家终审，确保 AI 始终作为智能助手而非替代品

## 关键技术架构

### MACROS 架构适配

Flo Health 的内容管道采用 MACROS 模式——将长文本拆分为可管理的片段（content chunks），这与 Flo 的 Contentful CMS 中内容存储为预分块格式（graph steps）天然契合。每个 step 再细分为 button text、title、description 等更小的片段，逐一提交给 AI Judge 评估

### AI 内容生成管道

生成管道采用多阶段 Chain-of-Thought 提示策略：

1. **知识检索**：从 Amazon S3 知识库中通过语义搜索检索相关医学指南、规则和上下文信息
2. **内容结构化**：使用 Claude 模型从模板库中生成 step-by-step 内容流，保持格式化一致性
3. **验证反馈**：对生成内容进行医学准确性和品牌合规校验，如果发现问题则触发自动重处理

### 渐进式内容呈现

系统采用渐进式加载策略——每阶段的中间结果就绪后立即展示，用户无需等待整个管道完成即可开始审核输出，显著提升了使用体验。架构包含 Amazon API Gateway 维护实时通信、AWS Step Functions 编排端到端工作流、DynamoDB 管理状态和元数据

### 具体案例优于抽象规则

项目过程中团队发现，随着规则集不断膨胀，规则之间会出现冲突，使模型难以正确排序。向规则中注入具体示例（few-shot examples）比单纯说明"要做什么、避免什么"效果更好，显著提升了输出遵从度

## 深度分析

### AI 在高信任度领域的边界设计哲学

Flo Health 案例展示了一个关键洞察：在医疗等高信任度领域，AI 系统设计的核心不是"实现自动化"，而是"设计人机协作的接口"。三层验证体系（内部指南 → 外部来源 → 人类终审）实际上构建了一个**递进式信任链**——AI 在前两层提供效率和覆盖面，人类在最后一层掌握最终决策权。这种设计比端到端自动化更能适应医疗场景的复杂性，因为医学知识本身就在不断演进，任何静态规则集都无法覆盖所有边缘情况。

### 多 Judge 架构的模块化价值

独立 AI Judge 的设计比单一庞大 prompt 更符合软件工程中的单一职责原则（Single Responsibility Principle）。每个 Judge 可以：
- 独立使用最合适的模型（成本/质量权衡）
- 独立迭代 prompt 和测试集
- 独立进行 A/B 测试而不影响其他维度

这种架构使系统能够渐进式提升质量，而非大爆炸式重构。从运维角度看，一个 Judge 的回归不会级联到其他维度，降低了生产风险。

### 结构化反馈循环作为系统级学习机制

将专家修正转化为可复用规则和示例，本质上是构建了一个**系统级的持续学习回路**。每次人工审核不再是一次性事件，而是对系统知识库的增量更新。这类似于机器学习中的在线学习（online learning），但在 prompt 工程语境下表现为规则库和示例集的演化。70% 的重复错误减少说明了这种机制的有效性——它打破了传统 AI 辅助系统中"错误反复出现、专家反复修正"的死循环。

### YAML 胜于 JSON 的工程启示

在 LLM 输出格式选型上，YAML 因其缩进式结构的容错性优于 JSON，这一经验不仅适用于医疗内容审核场景，也推广到其他需要结构化输出的 agent 系统中。随着 Bedrock 引入结构化输出功能，团队有了额外的选择——可以将格式强制统一在 API 层面，而不是依赖 prompt 约束。

## 实践启示

1. **从 PoC 到生产的渐进式迁移策略**：Flo Health 选择逐步扩大 AI 能力边界，通过持续验证建立信任。这比一次性全量替换更可控，也更容易获得团队认同。

2. **为每个 AI Judge 建立专属测试集**：结合合成数据和真实匿名案例，持续衡量每个 Judge 的首遍准确率，减少对 AI 输出的全面复核需求。

3. **模型分层选择是 ROI 最大化的关键**：不应对所有任务使用最强模型。为简单分类任务使用 Haiku、为复杂生成任务使用 Sonnet 的分层策略，在保持质量的同时控制了推理成本。

4. **具体示例比抽象规则更有效**：当 prompt 规则集膨胀到相互冲突时，注入具体示例（few-shot examples）是更可靠的改进方式。建议团队在积累了一定规则后，主动转向"规则 + 示例"的混合模式。

5. **用户信任通过透明度建立**：向用户展示 AI 的每一步判断依据和引用来源，比隐藏"黑箱"更能建立长期信任。Flo Health 在 UI 中高亮 AI 建议的变更、提供来源链接的设计值得借鉴。

## 相关实体

- [企业 AI Native 转型](../ch05/018-ai-native.html)
- [后端 AI 友好架构](../ch05/022-ai-friendly.html)
- [RAG](https://github.com/QianJinGuo/wiki/blob/main/concepts/rag-retrieval-augmented-generation.md)
- [企业 Agent 编排](../ch04/518-agent-orchestration.html)
- [AI Native 开发工作流](../ch05/018-ai-native.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/flo-health-medical-content-review-bedrock.md)

---

