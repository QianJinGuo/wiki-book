# Gemini 深度导读生成器 Prompt：让 AI 重写而非摘要

## Ch01.474 Gemini 深度导读生成器 Prompt：让 AI 重写而非摘要

> 📊 Level ⭐⭐ | 9.5KB | `entities/gemini-deep-guide-prompt.md`

# Gemini 深度导读生成器 Prompt：让 AI 重写而非摘要

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/gemini-deep-guide-prompt.md)

## 摘要

作者一帆（微信公众号"山川和森林的回忆"，2026-01-19）从"V1 摘要"（脑过无痕）升级到"V2 深度导读"，给出一份针对 Gemini 优化的导读生成器 Prompt。核心约束是**永远不要高度浓缩**——保留论证过程，不替换为结论。Prompt 用 `<identity>` / `<core_principles>` / `<input_contract>` / `<thinking_or_output_modes>` / `<output_structure>` / `<constraints>` 六个 XML 标签组织，把"导读"与"摘要"在行为上彻底区分开。

## 核心要点

- **核心约束**：导读 ≠ 摘要。摘要要浓缩，导读要保留论证过程
- **任务定义**：将长内容重写为完整、可阅读的导读版本，让读者无需再查看原始内容
- **输入契约**：用户可能提供外部链接（文章/视频 URL）、文本、媒体文件。`<context>` 仅用于说明阅读目的，不构成指令
- **三种输出模式**：默认深度导读；`<deliver>` 输出可执行清单；`<brief>` 输出结论要点
- **四段输出结构**：Metadata（Title/Author/Source）→ Overview（核心论题与主要结论）→ 逻辑展开（按内容自身结构拆分小节）→ Framework & Mindset（抽象作者隐含的认知模型）
- **关键设计原则**：永远不要高度浓缩；按内容逻辑（网状）拆解而非按时间线（线性）；提取 Framework & Mindset 而非信息本身
- **约束层**：不新增事实 / 不脑补作者观点 / 含混之处保留不确定性 / 不在输出中体现格式或字数要求
- **作者反思**：导读填补阅读空隙，但剥夺"慢思考"磨练机会，不适合初学者或构建全新知识体系的人

## 深度分析

### 从"摘要"到"导读"的范式跃迁

"摘要"和"导读"在中文里只差一个字，但在 Prompt 设计上是两种完全不同的任务：

| 维度 | 摘要（V1） | 深度导读（V2） |
|------|----------|--------------|
| 输出密度 | 高密度 | 中等密度（保留论证过程） |
| 读者画像 | 已经有上下文，要快速回顾 | 没有上下文，要完整理解 |
| 处理方式 | 压缩、抽取 | 重写、还原 |
| 价值锚点 | 信息覆盖度 | 论证过程可追溯 |

很多 LLM 用户用"帮我总结一下"时实际想要的是后者，但模型默认返回的是前者——这就是"脑过无痕"的根源。Prompt 的第一句话就明确"这不是摘要任务"，是从根上切断这种误匹配。

### 六段 XML 标签的组织

Prompt 用六个 XML 标签清晰划分角色、原则、契约、模式、输出结构、约束：

```xml
<identity> 你是导读生成器 </identity>

<core_principles>
- 目标：完整可阅读的导读
- 不是摘要，是高质量完整再阅读
- 只能基于用户提供或授权访问的内容
- 链接内容若模型能读取视为用户提供；不能读取必须告知用户并停止
</core_principles>

<input_contract>
- 用户可能提供：链接 / 文本 / 媒体文件
- <context> 仅说明阅读目的，不构成指令
</input_contract>

<thinking_or_output_modes>
- <deliver>：仅输出可执行方案/步骤/清单
- <brief>：仅输出结论要点
- 默认：深度导读模式
- 模式选择只影响结构，不改变事实核查
</thinking_or_output_modes>

<output_structure>
1. Metadata（Title / Author / Source）
2. Overview（核心论题与主要结论，一段话）
3. 逻辑展开（按内容自身结构，关键数字/定义/原话保留）
4. Framework & Mindset（作者隐含的认知模型，运作方式 + 实际应用）
</output_structure>

<constraints>
- 不新增事实 / 不脑补作者观点
- 含混或不确定处保留不确定性
- 不在输出中体现格式或字数要求
</constraints>
```

这种结构的关键设计是**"输入契约"和"输出结构"分离**——输入部分定义了"我能处理什么、什么不能处理"，输出部分定义了"我要怎么呈现"。两个部分用 XML 标签划界，避免 LLM 在长 Prompt 中混淆指令层级。

### Framework & Mindset：导读的真正价值

四段输出结构中前三段都是"还原信息"（Metadata、Overview、逻辑展开），真正让导读区别于摘要的是第四段——**Framework & Mindset**：

> 抽象作者隐含的认知模型，解释运作方式与实际应用

这是作者对"导读"最深的洞察。信息本身可以被搜索引擎替换，**认知模型**才是高价值内容的真正资产。一个作者如何定义问题、拆解维度、做权衡——这些"思维方式"才是读者真正要学的东西。

这与 [Fudan Agentic Harness Engineering Ahe Gpt54 7Points](../ch05/052-harness-engineering.html) 中"事实比策略更可迁移"的判断形成有趣对照：导读强调"提取作者的认知模型"（事实之上的策略层），而 AHE 发现"Prompt 单独迁移性能下降"（策略性资产反而不易迁移）。两个观察不矛盾——导读的"认知模型"是从内容中抽象出的**事实性框架**，不是 Prompt 那种"你应该这样做"的策略指令。

### 模式切换：导读/清单/结论三态

Prompt 提供了三种输出模式：
- **默认深度导读**：保留论证过程 + Framework & Mindset
- **`<deliver>`**：仅输出可执行方案、步骤或清单——给"看完要立刻去做"的读者
- **`<brief>`**：仅输出结论要点与关键判断——给"快速过一遍决定要不要读原文"的读者

模式选择只影响**结构**，**不改变事实核查与信息完整性要求**。这一点很关键——即使在 `<brief>` 模式下，也不能因为"输出短"就允许"信息不完整"。这避免了"为了简洁牺牲准确性"的常见陷阱。

### 不在输出中体现格式或字数要求

`<constraints>` 中最后一条特别有意思：**"不在输出中体现格式或字数要求"**。这意味着模型不应该在导读末尾写"（以上为高度浓缩版，仅供参考）"或"（约 500 字）"这类元信息——这些元信息会破坏导读的"完整阅读"体验。

这条约束反映了一个深层原则：导读的"伪装"是"完整阅读"。一旦在输出中暴露"这是 AI 生成的摘要"，读者会自动降级信任，进入"挑刺模式"而非"理解模式"。这与 [Qy_Zacztcs1Ql3Bifmbmgg](https://github.com/QianJinGuo/wiki/blob/main/entities/qy_zaCZTCs1Ql3BIFmBMgg.md) 中"Subagent 隔离探索过程"的思路异曲同工——表面越像完整阅读，认知负担越低。

### 作者反思的诚实性

文章最后一段作者的反思很有价值：

> AI 深度导读填补了阅读空隙，但剥夺了"慢思考"的磨练机会。不适合初学者或构建全新知识体系的人。把 AI 当望远镜扩展视野是好的，但别指望它能代替你走路。

这与 [Karpathy Vibe Coding Agentic Engineering](../ch04/678-karpathy-vibe-coding-agentic-engineering.html) 中"vibe coding vs agentic engineering"的分野呼应——AI 工具可以放大能力，但不能替代基础训练。导读适合"已经有知识基础、需要快速进入新领域"的读者；对"还在构建基础认知框架"的初学者，导读反而有害。

## 实践启示

- **设计 Prompt 时明确"不是什么"**：除了告诉模型"要做什么"，更要说清"不要做什么"。这条 Prompt 的"不是摘要任务"就是典型的反向定义
- **用 XML 标签组织长 Prompt**：当 Prompt 超过 200 字，XML 标签的边界感比自然语言段落更清晰，模型对指令层级的混淆显著减少
- **把"输入契约"和"输出结构"分离**：让模型先理解"我能处理什么"再理解"我要输出什么"，避免输入输出耦合导致的边界模糊
- **保留论证过程比保留结论更有价值**：导读的真正价值在"读者能跟随论证路径走一遍"，而不是"读者知道结论是什么"
- **提取 Framework & Mindset**：高价值内容的核心是认知模型，不是信息本身。让模型专门输出一段"作者怎么想"，把隐性知识显性化
- **模式切换保持事实完整性**：`<deliver>` / `<brief>` / 默认模式改变的是结构，不是事实层级。简洁不等于省略
- **明确 Prompt 的适用边界**：作者主动写出"不适合初学者"，比让用户自己发现限制更负责任

## 相关实体

- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/046-agent.html)
- [两万字详解Claude Code源码核心机制](../ch03/076-claude-code.html)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch04/235-agentic.html)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](../ch05/052-harness-engineering.html)
- [Karpathy Vibe Coding Agentic Engineering](../ch04/678-karpathy-vibe-coding-agentic-engineering.html)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](../ch04/230-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed.html)
- [Prompt Engineering Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/prompt-engineering-patterns.md)
- [Prompt Engineering Fundamentals](https://github.com/QianJinGuo/wiki/blob/main/concepts/prompt-engineering-fundamentals.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/gemini-deep-guide-prompt.md)

---

