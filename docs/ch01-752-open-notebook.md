# Open Notebook

## Ch01.752 Open Notebook

> 📊 Level ⭐⭐ | 3.7KB | `entities/open-notebook.md`

# Open Notebook

Open Notebook 是一个开源的 AI 知识管理工具，定位为 Google [NotebookLM](/ch01-017-notebooklm/) 的自托管替代品。由 lfnovo 在 GitHub 上开源，MIT 协议，2025 年 10 月发布首个正式版。

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

基于 RAG 的对话系统：向量检索 → 上下文注入 → LLM 生成。支持全文/摘要切换（小灯泡功能），回答标注引用来源可溯源。支持多会话（NotebookLM 尚无此功能）。

### 双层搜索

- 全文搜索：精确关键词匹配
- 向量语义搜索：跨概念匹配（如"用户登录"匹配"鉴权模块"）

搜索范围跨所有笔记本。

### 内容转换

自动 Dense Summary + 自定义 Content Transformations 规则（如提取 PDF 中的竞品价格信息成表格）。AI 笔记与来源资料有关联标记。

### MCP 集成

作为 MCP Server 接入 Claude Desktop 和 VS Code，实现：
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

→ AI 知识工具全景对比

## 相关链接

- GitHub: https://github.com/lfnovo/open-notebook
- → [NotebookLM](/ch01-017-notebooklm/) — Google 的对标产品
- → MCP 协议生态 — MCP 集成的技术背景
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/open-notebook-open-source-notebook-lm-alternative.md)

---

