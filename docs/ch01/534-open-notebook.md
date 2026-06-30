# Open Notebook

## Ch01.534 Open Notebook

> 📊 Level ⭐⭐ | 6.8KB | `entities/open-notebook.md`

# Open Notebook

Open Notebook 是一个开源的 AI 知识管理工具，定位为 Google [NotebookLM](https://github.com/QianJinGuo/wiki/blob/main/entities/notebook-lm.md) 的自托管替代品。由 lfnovo 在 GitHub 上开源，MIT 协议，2025 年 10 月发布首个正式版。

## 核心差异

与 NotebookLM 相比，Open Notebook 解决了三个关键限制：

1. **数据主权**：完全自托管，数据不离开用户硬盘
2. **模型自由**：支持 18+ AI 提供商（OpenAI、DeepSeek、Claude、Ollama 本地），不绑定单一供应商
3. **API 可编程**：暴露 REST API + MCP Server，可嵌入自动化工作流

## 技术架构

| 层 | 技术 |
|---|---|
| 后端 | Python + FastAPI |
| 前端 | Next.js + React |
| 数据库 | SurrealDB |
| AI 接入层 | Esperanto（统一 18 家提供商接口） |
| 部署 | docker-compose.yml，端口 8502 |

Esperanto 是关键抽象层——在 UI 里切换模型即可，无需手写适配代码。

## 功能矩阵

### 多模型支持

Chat Model、Transformation Model、Embedding Model 三个槽位独立配置。支持推理模型（DeepSeek-R1、Qwen3 带思考链）。Ollama 本地跑可零成本使用。

### 播客生成

比 NotebookLM 更强：支持 1-4 个 AI 说话人，每个可独立配置音色、角色、语言。Episode Profile 可定义主题、风格、时长。TTS 后端支持 ElevenLabs、OpenAI TTS、Google TTS、Edge-TTS。

### RAG 聊天

基于 [RAG](https://github.com/QianJinGuo/wiki/blob/main/concepts/retrieval-augmented-generation-rag.md) 的对话系统：向量检索 → 上下文注入 → LLM 生成。支持全文/摘要切换（小灯泡功能），回答标注引用来源可溯源。支持多会话（NotebookLM 尚无此功能）。

### 双层搜索

- 全文搜索：精确关键词匹配
- 向量语义搜索：跨概念匹配（如"用户登录"匹配"鉴权模块"）

搜索范围跨所有笔记本。

### 内容转换

自动 Dense Summary + 自定义 Content Transformations 规则（如提取 PDF 中的竞品价格信息成表格）。AI 笔记与来源资料有关联标记。

### MCP 集成

作为 [MCP Server](https://github.com/QianJinGuo/wiki/blob/main/concepts/model-context-protocol-mcp.md) 接入 Claude Desktop 和 VS Code，实现：
- VS Code 中 AI 插件实时引用知识库技术文档
- Claude Desktop 搜私有知识库回答问题

REST API（端口 5055）支持全功能编程调用：上传资料、建笔记本、聊天、生成播客。

## 已知局限

- **单用户**：不支持多人协作
- **引用功能基础**：无 NotebookLM 的原文高亮定位
- **大文件性能**：纯 CPU 跑 Embedding 时大 PDF 处理慢
- **成熟度**：2025 年 10 月才发正式版，仍在快速迭代

## 与 NotebookLM 对比

| 维度 | Open Notebook | NotebookLM |
|------|--------------|------------|
| 部署 | 自托管（Docker） | 云端（Google） |
| 数据 | 本地 | Google 服务器 |
| 模型 | 18+ 供应商 | 仅 Gemini |
| 播客 | 1-4 说话人 | 2 人固定 |
| API | REST + MCP | 无 |
| 协作 | 单用户 | 多用户 |
| 定价 | 免费（自付模型费） | 免费 |
| 引用 | 基础 | 原文高亮 |

→ [AI 知识工具全景对比](https://github.com/QianJinGuo/wiki/blob/main/comparisons/ai-knowledge-tools-comparison.md)

## 深度分析

### 自托管知识工具的数据主权价值

Open Notebook 的核心定位不是"更好的 NotebookLM"，而是"数据主权优先的 NotebookLM"。在企业场景中，将内部文档上传到 Google 服务器是不可接受的；在个人场景中，敏感笔记（医疗、财务、法律）也不应离开本地。Open Notebook 通过 Docker 自托管解决了这个根本性问题，代价是需要用户自己管理部署和维护。

### Esperanto 抽象层的工程价值

18+ AI 提供商的统一接入层（Esperanto）是 Open Notebook 的关键工程决策。这不仅解决了"供应商锁定"问题，更实现了"按场景选模型"的灵活性：Chat 用 Claude、Embedding 用 OpenAI、Transformation 用 DeepSeek，三个槽位独立配置。这种设计让知识工具从"绑定单一模型"升级为"模型编排平台"。

### 播客生成的差异化竞争

Open Notebook 支持 1-4 个 AI 说话人（NotebookLM 固定 2 人），每个可独立配置音色、角色、语言。这不是功能堆砌，而是瞄准了内容创作者的需求：技术文档可以生成"专家访谈"风格，商业报告可以生成"分析师讨论"风格。TTS 后端支持 ElevenLabs、OpenAI TTS、Google TTS、Edge-TTS，进一步降低了语音生成的成本和门槛。

### MCP 集成打开了自动化工作流

作为 MCP Server 接入 Claude Desktop 和 VS Code，意味着知识库不再是孤立的应用，而是 Agent 生态的一部分。VS Code 中 AI 插件可以实时引用知识库技术文档，Claude Desktop 可以搜私有知识库回答问题。REST API（端口 5055）进一步支持全功能编程调用，让知识管理嵌入自动化管线。

### 单用户限制是当前最大瓶颈

不支持多人协作是 Open Notebook 与 NotebookLM 的最大差距。在团队场景中，知识管理天然是协作活动——多人共同编辑、评论、引用同一份知识库。这个限制决定了 Open Notebook 目前更适合个人或小团队使用，而非企业级部署。

## 实践启示

1. **数据主权是知识工具选型的首要考量**：敏感文档（内部代码、商业计划、个人笔记）应优先选择自托管方案，而非上传到云端
2. **模型灵活性比单模型性能更重要**：选择支持多提供商的知识工具，避免被单一供应商锁定。Esperanto 式的抽象层是值得投入的工程设计
3. **MCP 集成让知识库从"应用"升级为"基础设施"**：知识库应暴露 API 和 MCP 接口，让 Agent 和开发工具能直接引用
4. **播客生成是知识工具的差异化功能**：对于内容创作者，AI 播客生成比传统的"总结+问答"更有吸引力
5. **关注 Open Notebook 的协作功能演进**：单用户限制是当前最大瓶颈，团队协作能力的加入将决定其能否从"个人工具"升级为"团队平台"

## 相关链接

- GitHub: https://github.com/lfnovo/open-notebook
- → [NotebookLM](https://github.com/QianJinGuo/wiki/blob/main/entities/notebook-lm.md) — Google 的对标产品
- → [MCP 协议生态](https://github.com/QianJinGuo/wiki/blob/main/concepts/mcp-protocol-ecosystem.md) — MCP 集成的技术背景
- → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/open-notebook-open-source-notebook-lm-alternative.md)

---

