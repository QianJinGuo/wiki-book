---
title: "Open Notebook：开源版 Google Notebook LM 替代品"
source_url: "https://mp.weixin.qq.com/s/ACLLu6zMlnEgXcte7v1JYQ"
ingested: 2026-06-26
sha256: ""
type: raw
---

# Open Notebook：开源版 Google Notebook LM 替代品

Google Notebook LM 用起来确实爽，丢个 PDF 进去，AI 帮你读完、总结、还能生成两个人对着聊的播客。但 Google Notebook LM 有几个问题：需要制作的文档资料需要存在 Google 服务器上、只能用 Google 的模型、没有 API，不能借助智能体实现自动化工作流。

Open Notebook 解决的就是这个事。

## 项目简介

Open Notebook 是 lfnovo 在 GitHub 上开源的一个项目，MIT 协议，完全免费。2025 年 10 月发了第一个正式版，到现在还在持续更新。

它做的事情跟 Notebook LM 很像：把各种资料丢进去，AI 帮你读、帮你提炼、帮你生成播客。区别在于它跑在你自己的机器上，数据不离开你的硬盘。而且你想用什么模型就用什么模型，OpenAI、DeepSeek、Claude、Ollama 本地跑，随便你。

后端 Python + FastAPI，前端 Next.js + React，数据库 SurrealDB。AI 接入层用了一个叫 Esperanto 的库，把 18 家提供商的接口包了一层，你在 UI 里切换模型就行了，不用自己写适配代码。

部署方式就一个 docker-compose.yml，两分钟拉起来，浏览器打开 http://localhost:8502 就能用。

## 功能详情

### 支持 18+ 个 AI 模型

Notebook LM 你只能用 Gemini，Open Notebook 接了多少模型？

配置流程不复杂，左边菜单进 Models，选提供商，填 API key，点 Test 测试一下能不能通，通了就 Sync Models 把模型列表拉下来，勾上你要用的。不想花钱的话直接接 Ollama 跑本地模型，API key 都不用填。

往下拉，Chat Model、Transformation Model、Embedding Model 三个槽位对应三种用途，分别指定用哪个模型。

推理模型也支持，DeepSeek-R1 和 Qwen3 这种带思考链的都能接，碰到需要深度分析的问题，模型会先琢磨一阵再回你，回答质量确实比普通模型高。

模型接得多还有个好处：OpenAI 哪天涨价了，Anthropic 哪天挂了，切到 DeepSeek 或者 Groq 继续用，不耽误事。被一家供应商绑死是 SaaS 最让人烦的地方，自己部署的好处就在这里。

### 什么格式都能往里扔

建一个笔记本点一下 Create Notebook 就行。填名字的时候顺手写个描述，说清楚这个笔记本要干什么，后面 AI 跟你聊天的时候会用这段描述理解你的意图。

支持的格式非常多：PDF 直接拖，音频文件、网页链接、TXT、PPT、Word 文档，都能往里丢。

丢进去之后 Open Notebook 在后台自动把这些资料做向量化和索引，等它处理完就可以开始问了。

不同项目可以建不同的笔记本，互不干扰，路线图里写了后面要支持跨笔记本共享资料，一份 PDF 多个项目公用，不用重复传。

### 播客生成，最多 4 个 AI 说话人

Notebook LM 的播客功能刚出的时候确实好玩，但只能两个人，而且你改不了脚本。

Open Notebook 的播客可以配 1 到 4 个说话人，每个说话人的音色、角色、语言都能单独设置。还能给每期播客写 Episode Profile，定主题、风格、时长。

TTS 后端接了 ElevenLabs、OpenAI TTS、Google TTS，想要高质量花钱用 ElevenLabs，想省钱白嫖 Edge-TTS 也行。

### RAG 聊天 + 引用溯源

资料加进去以后，右边聊天面板就能直接提问了。它不是简单的关键词匹配，走的是 RAG 那套流程：先用向量检索找到跟你问题相关的资料片段，再把片段塞进 LLM 的上下文窗口里让它生成回答。回答会标注引用来源，哪个回答是从哪份资料的哪一段来的，能溯源。

有一个小功能挺实用：每个资料来源旁边有个小灯泡，点了可以切换使用全文还是使用摘要。

聊出来的好东西可以保存成笔记。点一下 Save to note，它就进到 Notes 面板里了。

一个笔记本里还能拉多个聊天会话，不同话题分开聊。Notebook LM 到现在还没这个功能，所有对话混在一起。

### 全文搜索 + 向量语义搜索

资料一多，找东西就变成体力活，Open Notebook 搞了两层搜索。一层是传统全文搜索，跟 Ctrl+F 一样精确匹配关键词。另一层是向量语义搜索，你问"这个项目怎么处理用户登录的"，就算资料里写的是"鉴权模块"和"身份认证流程"，它也能匹配到。

搜索范围跨所有笔记本，不用记住哪个文件放在哪个笔记本里。

### 内容转换和 AI 辅助笔记

每份资料进去之后，Open Notebook 会自动出一个 Insights 面板。默认给你生成一份 Dense Summary，把长文档压成几个要点。

Content Transformations 可以自己定制。你写个转换规则，让它按你指定的格式去处理资料，提取你要的信息，输出你要的结构。

笔记这块，手动写也行，让 AI 根据资料生成也行。AI 出的笔记不是瞎编的，是从你上传的资料里提炼的，每条笔记跟来源资料之间都有关联标记。

### REST API 和 MCP 集成

Open Notebook 暴露了一套完整的 REST API，端口 5055。Web 界面上能干的，API 都能干：上传资料、建笔记本、发起聊天、生成播客，全能用代码调。

MCP 集成是更狠的东西。Open Notebook 能作为 MCP Server 接到 Claude Desktop 或者 VS Code 里，你在这两个工具里就能直接搜、读自己知识库里的内容。

你在 VS Code 里写代码，AI 插件可以实时引用你笔记本里的技术文档当上下文。你在 Claude Desktop 里做研究，Claude 能搜你的私有知识库来回答问题。

## 快速上手

唯一的前提：装了 Docker Desktop。

把 docker-compose.yml 拉下来：

```
curl -o docker-compose.yml https://raw.githubusercontent.com/lfnovo/open-notebook/main/docker-compose.yml
```

打开这个文件，找到加密密钥那行，把默认值改掉：

```
- OPEN_NOTEBOOK_ENCRYPTION_KEY=change-me-to-a-secret-string
```

然后启动：

```
docker compose up -d
```

等十几二十秒，浏览器打开 http://localhost:8502 。

进去直奔 Models 页面，选你的 AI 提供商，填 API key。配好之后点 Test 测试连接，通了就 Sync Models 把可用模型列表拉下来。

想一分钱不花的话，先把 Ollama 装上，拉个 Qwen3 或者 Llama 模型到本地，然后在 Open Notebook 里选 Ollama 当提供商就行。

## 使用感受

18 家 AI 提供商，从 OpenAI、DeepSeek 到本地 Ollama 全覆盖，可选择性非常高。Esperanto 这个抽象层做得干净，加新提供商不用到处改代码。

播客功能比 Notebook LM 强太多了，4 个说话人、自己写 Episode Profile、自定义音色，Google 那边根本没开放。

MCP 集成是真正拉开差距的地方。它不是又一个"聊天套壳"，是能嵌进你日常开发工具链里的东西。

不好的地方也有：目前只支持单用户，多人协作别想了。引用功能还比较基础，跟 Notebook LM 那种带原文高亮定位的引用比，有差距。大文件处理速度看你机器配置。

GitHub地址：https://github.com/lfnovo/open-notebook
