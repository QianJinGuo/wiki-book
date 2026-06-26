# 给 Openclaw瘦身-利用Nova MME 和 S3 Vector实现Skill按需召回 | 亚马逊AWS官方博客

## Ch11.121 给 Openclaw瘦身-利用Nova MME 和 S3 Vector实现Skill按需召回 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 8.5KB | `entities/openclaw-leveraging-nova-mme-s3-vector-implement-skill.md`

## 概述
给 Openclaw瘦身-利用Nova MME 和 S3 Vector实现Skill按需召回 by awschina on 19 3月 2026 in Artificial Intelligence Permalink Share 摘要：本文介绍一种针对 OpenClaw 的智能Skills召回方案，基于 Amazon Bedrock Nova Multimodal Embeddings 和 Amazon S3 Vector，通过向量语义检索实现skill按需召回，将每次对话注入的技能描述 Token 降低约 90%，并提升响应速度。 目录 01 一、背景概述 02 二、解决方案 03 三、模块设计详解 04 四、效果对比 05 五、总结 06 六、相关资源 一、背景概述 随着 OpenClaw 的生态日趋丰富，越来越多开发者为自己的 OpenClaw 实例配置了大量 Skills 来扩展能力边界。然而，一个容易被忽视的问题随之浮现：当skill数量从个位数增长到数十甚至上百个时，每次对话都将全部技能描述注入到 System Prompt 中，造成了显著的 Token 浪费和成本攀升。 1.1 OpenClaw 的 Skills 机制 OpenClaw 采用 AgentSkills 规范的技能目录结构。每个技能是一个包含 SKILL.md 文件的目录，通过 YAML frontmatter 定义名称、描述和元数据。OpenClaw 从三个位置加载技能，当同名技能存在时，按以下优先级覆盖（从高到低）： Workspace Skills：位于工作空间目录下的 skills/ 目录，优先级最高 Managed Skills：位于 ~/.openclaw/skills/，跨工作空间共享 Bundled Skills：随 OpenClaw 安装包内置 当存在可用技能时，OpenClaw 会在 System Prompt 中注入一段紧凑的 XML 列表： available_skills skill name feishu-doc /name description Feishu document read/write operations... /description location ~/.openclaw/extensions/feishu/skills/feishu-doc/SKILL.md /location /skill !-- 更多 skills... -- /available_skills 根据 OpenClaw 官方文档，这段列表的 Token 开销是确定性的，其计算公式为： 总字符数 = 195（基础开销）+ 每个 Skill 的（97 + name 长度 + description 长度 + location 长度） [图1] 模型在识别到相关技能后，通过 read 工具按需加载对应 SKILL.md 的完整内容来获取详细指令，当技能数量增长到 30、50 甚至更多时，仅技能列表本身就会产生可观的 Token 消耗。一个直观的例子：当用户说"帮我查飞书文档"时，System Prompt 中注入了天气查询、音乐播放、邮件管理等 50 个技能的描述，其中只有 feishu-doc、feishu-wiki、feishu-drive 这 3 个与请求相关。这意味着绝大部分技能描述 Token 被浪费了。 二、解决方案 本文介绍一种针对 OpenClaw 的智能Skills召回方案ISS (Intelligent Skill Selection)，基于 Amazon Bedrock Nova Multimodal Embeddings 和 Amazon S3 Vector，通过向量语义检索实现skill按需召回，将每次对话注入的技能描述 Token 降低约 90%，并提升响应速度。其中： Amazon Nova Multimodal Embeddings ：提供高质量的文本向量化能力，将技能描述和用户查询映射到 1024 维向量空间，支持语义级别的相似度计算。单次嵌入生成延迟约 150ms，按调用计费，无需维护独立的嵌入服务。 Amazon S3 Vector ：作为向量数据的持久化存储层，无需管理向量数据库实例或索引，S3 作为全托管对象存储自动处理可用性和持久性。每个技能的向量以 JSON 文件形式存储，包含技能元数据和 1024 维嵌入向量。客户端在运行时加载向量并在本地执行余弦相似度计算。 整体架构图如下： [图2] ISS Hook在 `message:preprocessed` 事件（消息预处理完成后、发给 Agent 前）拦截消息 Nova MME 模型将用户消息转为向量 检索skills，在客户端计算余弦... [truncated]

## 核心技术
OpenClaw、Amazon Bedrock、Agentic AI、MCP、Amazon Nova、Nova Lite

## 深度分析
本文提出的 Intelligent Skill Selection (ISS) 方案代表了 AI Agent 技能管理领域的一种重要优化范式。当 OpenClaw 生态中的技能数量从个位数扩展到数十甚至上百时，传统地将所有技能描述注入 System Prompt 的方式带来了显著挑战：技能列表的 Token 消耗从 195 基础开销起步，每个技能还需额外计入名称、描述和路径长度，按 50 个技能估算，即使只有 3 个相关，实际 97% 的 Token 也被浪费了。
**向量检索的技术选型值得关注**：方案选择 Amazon Nova Multimodal Embeddings 而非自建嵌入服务，体现了云服务"按调用计费、无需维护"的设计理念。1024 维向量空间配合约 150ms 的单次嵌入延迟，对于技能召回这一离线预处理场景是合理的性能指标。
**S3 Vector 的设计巧思**：将向量数据以 JSON 文件形式存储在 S3 上，而非使用专用的向量数据库，是该方案的一大亮点。这一设计避免了向量数据库的运维复杂性，同时利用 S3 的全托管特性和高持久性保证。但这也意味着向量检索在客户端本地执行，对于技能数量极大的场景，客户端的内存和计算负担需要关注。
**Token 降低 90% 的意义**：在当前 LLM 推理成本仍然是 Agent 应用主要成本构成的背景下，90% 的 Token 削减意味着近乎线性的成本下降。对于日处理量大的生产环境，这一优化可将技能调用成本从不可忽视的占比降低到可以忽略的水平。

## 实践启示
**技术实现建议**： ^[https://aws.amazon.com/cn/blogs/china/openclaw-leveraging-nova-mme-s3-vector-implement-skill/]
1. **技能向量预计算**：在 OpenClaw 初始化阶段即对所有技能描述进行向量嵌入并上传至 S3，避免运行时重复计算。技能描述变更时触发增量更新机制。 ^[https://aws.amazon.com/cn/blogs/china/openclaw-leveraging-nova-mme-s3-vector-implement-skill/]
2. **召回数量阈值设置**：ISS 方案需要在召回精度与 Token 节省之间取得平衡。建议根据实际场景测试不同召回数量（如 top-3、top-5、top-10）对任务完成率的影响，选择最优阈值。 ^[https://aws.amazon.com/cn/blogs/china/openclaw-leveraging-nova-mme-s3-vector-implement-skill/]
3. **混合召回策略**：纯向量相似度召回可能遗漏语义相关但表述不同的技能。可考虑结合关键词匹配或规则匹配作为补充，确保关键技能始终能被召回。 ^[https://aws.amazon.com/cn/blogs/china/openclaw-leveraging-nova-mme-s3-vector-implement-skill/]
4. **监控与告警**：建立技能召回命中率监控机制，当用户意图与召回技能匹配率下降时，及时调整向量模型或补充训练数据。 ^[https://aws.amazon.com/cn/blogs/china/openclaw-leveraging-nova-mme-s3-vector-implement-skill/]
**架构演进思路**： ^[https://aws.amazon.com/cn/blogs/china/openclaw-leveraging-nova-mme-s3-vector-implement-skill/]
ISS 方案的核心思想可以泛化至其他 Agent 框架中的上下文管理场景。无论是 MCP Tools 的按需加载、Memory 的向量检索，还是 RAG 场景中的文档召回，本质上都是"如何在有限上下文窗口内高效传递最相关信息"这一问题的不同解法。随着 Agent 应用规模的扩大，这类优化技术的重要性将持续提升。

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/openclaw-leveraging-nova-mme-s3-vector-implement-skill/)

## 相关实体

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openclaw-leveraging-nova-mme-s3-vector-implement-skill.md)

- [Claude Code vs OpenClaw 记忆系统 — 向量数据库必要性反思](../ch01-342-读完-claude-code-和-openclaw-的-memory-源码-我对-agent记忆需要向量数据库-这件)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/openclaw-architecture.md)

---

