# ChatGPT Memory

## Ch01.399 ChatGPT Memory

> 📊 Level ⭐⭐ | 11.5KB | `entities/chatgpt-memory.md`

# ChatGPT Memory & Knowledge Features
## Overview
OpenAI ChatGPT 提供了一系列记忆和知识管理功能：Memory（跨对话记忆）、Custom GPTs（自定义 GPT）、Projects（项目文件夹）。这些功能让 ChatGPT 从一个对话工具演变为一个持久化的个人 AI 助手。

## Key Features
### ChatGPT Memory
ChatGPT 会主动学习并记住用户在不同对话中提供的信息。记忆分为两类：
1. **自动记忆**：ChatGPT 自动从对话中提取关于用户的事实（偏好、工作、兴趣等）
2. **手动记忆**：用户可在设置中查看、编辑、删除记忆
记忆是**跨对话**的——下次对话时，ChatGPT 会主动调用相关记忆，无需重复说明背景。
访问方式：`Settings > Personal > Memory`

### Custom GPTs
Custom GPTs 是用户（或开发者）创建的自定义 AI 助手，可在 GPT Store 分享。
创建方式：

- `Create a GPT` → 定义指令、上传知识文件、设置能力（网页浏览/代码执行/DALL-E 等）
- 可设置公开或私有
用途：

- 针对特定领域（编程/写作/学习/产品）的专用助手
- 上传文档作为知识库（PDF、文本等）
- 与 API 集成实现自动化

### ChatGPT Projects
Projects 让用户将相关对话组织成文件夹/项目：

- 上传文件到项目（作为上下文知识）
- 设置 Custom Instructions（项目级系统提示）
- 跨对话保持上下文连贯性
- 适合：长期项目、主题研究、持续性任务

### ChatGPT Canvas
Canvas 是 OpenAI 在 2024 年推出的写作/编程 AI 协作界面，与普通对话不同，它在一个独立的"画布"中展开，允许你直接编辑 AI 生成的文本或代码。
核心特点：

- **独立画布**：与普通对话隔离，适合长文写作或代码项目
- **内联编辑**：你可以直接高亮、编辑 AI 生成的内容
- **支持写作 + 代码**：横跨写作助手和编程助手两个场景
- **发布时需 ChatGPT Plus 订阅**
> 注：Canvas 经常被误认为"Study 模式"，但它本质上是**协作编辑界面**，不是专门为学生设计的功能。

### ChatGPT for Education（Edu）
ChatGPT Edu 是 OpenAI 面向高等教育机构推出的专属方案：
| 特性 | 内容 |
|------|------|
| **目标用户** | 大学、教职员工、学生 |
| **AI 模型** | GPT-4o（教育版，无使用限制） |
| **数据政策** | **不用于模型训练** |
| **对话历史** | 保留，供以后访问 |
| **Custom GPTs** | 可创建和共享 |
| **API 访问** | 提供 API 配额 |
| **定价** | 机构定价（通常 $20-30/席位/月 或校方统谈）|
ChatGPT Edu 的核心优势是**数据隔离**——对话不用于训练，且有更高的使用限额。

### Study 用途总结
| 功能 | 是否存在 | 说明 |
|------|---------|------|
| 专属"Study Mode" | ❌（不存在） | 没有专门的学习模式开关 |
| Canvas | ✅ 存在 | 可用于写作/代码，适合作业 |
| 作业批改/讲解 | ⚠️ 间接 | 通过对话实现，无专门功能 |
| AI Tutor | ⚠️ 通用 | GPT-4o 可做辅导，但非专用 |
| 多学科 Custom GPT | ✅ | 可创建各学科专用 GPT |
**结论**：ChatGPT 没有专门的"Study Mode"，但通过 **Canvas + Custom GPTs + Projects** 的组合，可以搭建出一套完整的学习辅助工作流。核心优势是灵活性和生态系统，缺点是幻觉问题和缺乏 Source Grounding。

## Pricing
| Plan | 价格 | Memory | Custom GPTs | Projects |
|------|------|--------|-------------|---------|
| **Free** | $0 | 有限 | ❌ | ❌ |
| **Plus** | $20/月 | ✅ | ✅ 创建 | ✅ |
| **Pro** | $200/月 | ✅ | ✅ | ✅ |
| **Team** | ~$25-30/人/月 | ✅ | ✅ | ✅ + 共享 |
| **Enterprise** | 定制 | ✅ | ✅ | ✅ + SSO |

## Comparison with NotebookLM
| 维度 | ChatGPT Memory | NotebookLM |
|------|----------------|-------------|
| 核心定位 | 通用对话 + 记忆助手 | 研究 + 文档分析 |
| 记忆机制 | 跨对话 + 项目 | 仅基于上传文档 |
| AI 模型 | GPT-4o / o1 | Gemini |
| 文档分析 | 有限（文件上传） | 深度（Ground Truth） |
| 幻觉问题 | 存在（通用对话） | 极低（Source Grounding） |
| 音频概览 | ❌ | ✅ |

## Strengths
- **跨对话记忆**：无需重复提供背景信息
- **Custom GPTs**：可创建无限多专用 AI 助手
- **Projects**：长期项目上下文连贯
- **生态系统**：GPT Store 生态丰富
- **多模态**：支持文本、图像、语音、代码
- **生态完善**：API 文档、Playground、开发者工具

## Weaknesses
- **记忆不可见**：不总是知道 AI 记住了什么（需手动检查）
- **记忆可能错误**：长期记忆可能混淆或过时
- **幻觉**：通用对话中仍存在事实错误
- **数据隐私**：对话可能被用于训练（除非关闭）
- **付费墙**：高级功能需要 Plus ($20/月) 起

## 深度分析
### 记忆机制的工程局限
ChatGPT Memory 本质上是将对话中的用户事实提取为结构化记忆向量，存储在用户级别。与 NotebookLM 基于文档的 Source Grounding 不同，ChatGPT 的记忆在推理时以 Prompt context 的方式注入，而非直接检索。这带来两个根本问题：
1. **记忆可见性差**：用户无法系统性地查看 AI 记住了什么、记住了多少，只能手动在设置中翻阅，且无法知道每条记忆被调用的频率或置信度。
2. **记忆污染风险**：长期使用中，相似信息可能被错误合并或覆盖，尤其当用户兴趣随时间迁移时，旧记忆可能产生隐性偏见。
从工程角度看，OpenAI 选择将 Memory 实现为跨对话的 global context 而非项目隔离的 local context，这意味着同一个 ChatGPT 实例的记忆在不同项目间是共享的，与 Custom GPTs 的设计逻辑存在张力。

### Custom GPTs 的生态位
Custom GPTs 实质上是 **Prompt Template + 知识文件 + Actions API** 的打包产物。创建门槛低，但深度定制能力受限于：

- 知识文件有大小限制（每个文件最大 512MB？）
- 自定义指令（System Prompt）有 token 上限
- Actions 鉴权依赖 OpenAPI Schema，对于复杂内部系统接入不够灵活
GPT Store 的分发机制对创作者激励不足，目前优质 Custom GPT 多为个人生产力和垂直领域工具，而非社区共享的知识库。

### Projects 的定位模糊
Projects 功能在 2024 年底推出，本意是解决"跨对话上下文连续性"问题，但其实现与 Custom GPTs 有大量功能重叠：

- 两者都可以上传文件作为上下文
- 两者都可以设置 Custom Instructions
- Projects 额外提供文件夹管理和跨 GPT 共享
这导致用户在选择"用 Projects 还是用 Custom GPT"时缺乏清晰的决策框架，本质上是产品迭代过程中的功能堆砌而非统一设计。

### ChatGPT Edu 的战略意图
ChatGPT Edu 的推出是 OpenAI 切入高等教育市场的关键一步，核心打法是**数据隔离**（不用于训练）+ **机构级配额**。这直接对标 Google AI Studio for Education 和微软 Copilot for Education。但实际部署中，高校 IT 采购周期长、数据合规审查严格，OpenAI 的 enterprise pitch 能力并非其优势。

### Canvas 的产品逻辑
Canvas 被设计为"独立画布"而非对话线程的延伸，这是它与普通 GPT 对话的核心区别。从 UX 角度，Canvas 解决了 AI 协作编辑的两个痛点：上下文窗口的管理（长文写作时不需要把历史对话都塞进 context）和直接编辑的便捷性（无需在"复制粘贴修改"循环中切换）。但它本质上是轻量级 AI 编辑器，与 Notion AI、Quillbot 等产品在同一赛道竞争。

## 实践启示
### 个人用户
1. **主动管理记忆**：每月检查一次 `Settings > Personal > Memory`，删除不准确或过时的记忆，避免长期使用中积累记忆噪声。
2. **Custom GPT 用于高频场景**：将重复性高的任务封装为 Custom GPT（如"论文降重助手"、"代码 review 助手"），比每次重新描述指令更高效。
3. **Projects 隔离敏感项目**：涉及隐私或长期专注的项目用 Projects 隔离，而非依赖 global memory，避免记忆串台。
4. **Canvas 替代笨重的文档协作**：对于 2000 字以上的写作任务，优先使用 Canvas 而非在对话中反复修改。

### 团队/机构
1. **企业版优先考虑数据政策**：如果团队处理敏感信息，Enterprise 版的 SSO + 数据隔离是必要条件，而非可选项。
2. **知识库建设用 Custom GPT + 外挂 API**：对于需要引用内部文档的场号，将文档上传至 Custom GPT 并通过 Actions 接入内部 API，比直接开放 ChatGPT 企业版更安全可控。
3. **高等教育场景优先看 Edu 合规**：在高校场景中，ChatGPT Edu 的"不用于训练"承诺是刚需，但采购前需确认学校的 IT 合规流程。

### 产品/开发者视角
1. **不要将 ChatGPT Memory 视为持久化数据库**：它的记忆机制更接近"偏好缓存"而非可靠的 fact storage，任何需要精确记忆的功能都应自建。
2. **Custom GPT 的 Actions 是半成品**：OpenAPI Schema 解析能力有限，复杂 API 接入建议通过 GPT Builder 的"Converse API"绕道而非直接用 Actions。
3. **竞品差异化机会**：ChatGPT 在"记忆可见性"和"Source Grounding"上是短板，NotebookLM 的音频概览功能 ChatGPT 至今没有复现，任何专注于"可验证记忆 + 引用溯源"的产品都有切入空间。

## Related
- [AI 知识管理工具横向对比](https://github.com/QianJinGuo/wiki/blob/main/comparisons/ai-knowledge-tools-comparison.md)
- [NotebookLM](https://github.com/QianJinGuo/wiki/blob/main/entities/notebook-lm.md) — 文档驱动的 AI 研究助手
- [Obsidian](ch09/112-obsidian-claude-code-integration-guide.md) — 本地离线笔记
## 相关实体

- [entrypoint hijacking](ch01/546-entrypoint-hijacking.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-memory-architecture.md)

---

