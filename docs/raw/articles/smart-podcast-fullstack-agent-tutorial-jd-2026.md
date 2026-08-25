---
source_url: https://mp.weixin.qq.com/s/IGSAgptmQ-ZDurI-pnhdog
source: wechat
title: "全栈 AI Agent 从 0 到 1 ：智能播客平台开发全记录"
ingested: 2026-08-25
type: raw-article
tags: [full-stack, ai-agent, podcast, langgraph, langchain, ag-ui, sse, streaming, multimodal, tts, asr, qwen, vue3, fastapi, audio-agent, tutorial]
sha256: 1c06046f291a6833c3d0cd74e96f3db3e97a9c3fc0ec6a9539ad60e2ad0d7c32
---

# 全栈 AI Agent 从 0 到 1 ：智能播客平台开发全记录

> 作者：蔡欣彤，京东技术（公众号）
> 个人独立开发的全栈项目 Smart Podcast Platform：用户上传视频/音频，AI 自动理解内容、设计音色、生成播客，全程无需人工干预。从后端 Python 到前端 Vue 3，从 LangGraph Agent 编排到 pydub 音频处理。

## 项目概述

Smart Podcast Platform 是端到端智能播客制作平台。传统 AI 音频工具停留在"生成文字脚本"层面，用户拿到脚本还要自己找配音、剪辑、调音效，流程割裂低效。本项目把整个链条打通：从内容理解到音色设计，从语音合成到专业混音，全部由 AI Agent 自动完成。

## 技术栈一览

| 层级 | 技术选型 | 核心作用 |
|---|---|---|
| 前端框架 | Vue 3 + TypeScript + Vite | 流式对话界面与播客管理 |
| UI 组件 | shadcn-vue + Tailwind CSS + ai-elements-vue | 深色主题现代化交互 |
| AI 框架 | LangChain 1.0 + LangGraph 1.0.3 | Agent 编排与多轮对话记忆 |
| 后端服务 | FastAPI 0.104.1 + Uvicorn | REST API + SSE 流式响应 |
| 通信协议 | AG-UI Protocol 0.1.18 | 前后端 Agent 事件标准化通信 |
| 语音引擎 | 阿里云 DashScope (Qwen-TTS) | 音色设计、语音克隆、语音合成 |
| 语音识别 | 阿里云 DashScope (Qwen-ASR) | 高精度语音转文字，ITN 标准化 |
| 多模态模型 | qwen3.5-omni-plus | 图片/视频/音频统一理解 |
| 音频处理 | pydub + FFmpeg | 音频拼接、混音、后期制作 |

## 第一阶段：核心框架搭建

### 前端
Vue 3 Composition API + TypeScript + Vite（冷启动快、HMR 无延迟）。UI 用 Tailwind 原子化 CSS + shadcn-vue（组件代码直接复制进项目可定制）+ ai-elements-vue（AI 对话组件库：Conversation/Message/PromptInput 等，省去 AI 对话 UI 基础建设）。

### 后端 FastAPI
异步 Web 框架，基于 ASGI，天然支持流式响应。`/api/chat` 接口直接返回 `StreamingResponse`，按 Accept header 决定编码（SSE 或普通）。

### AI Agent 核心：LangChain 1.0 + LangGraph
- **LangChain 1.0 API 变化大**：旧版 initialize_agent/AgentExecutor 全部废弃，新版统一用 create_agent，网上教程代码大多无法直接用
- **LLM 工厂模式**：LLM 实例创建单独抽成 factory.py，从环境变量读配置，切换模型只改环境变量不改业务代码
- **Prompt 模块抽离**：系统提示词单独放 services/prompt.py，支持动态注入工具列表描述（Agent 初始化时自动把已注册工具名称+描述拼入 Prompt，避免提示词和代码不一致）
- **Agent 创建与工具注册**：create_agent + tools + InMemorySaver() checkpointer（多轮记忆按 thread_id 隔离），模块加载时初始化一次全局复用
- **LangGraph 多轮记忆**：InMemorySaver 按 thread_id 保存完整消息历史，每次只传当前消息，LangGraph 自动从 checkpoint 恢复上下文。注意 InMemorySaver 只适合本地尝试，真实业务需数据库

### 流式通信：SSE + AG-UI 协议
SSE 单向服务器推送，基于普通 HTTP，比 WebSocket 轻量，适合"用户发一条、AI 持续回复"。AG-UI 协议定义标准事件类型：RUN_STARTED / TEXT_MESSAGE_START / TEXT_MESSAGE_CONTENT（流式增量）/ TEXT_MESSAGE_END / TOOL_CALL_START / TOOL_CALL_ARGS / TOOL_CALL_END / TOOL_CALL_RESULT（含音频 URL）/ RUN_FINISHED。

后端 StreamProcessor 把 SSE 事件编码/分发独立封装，与 Agent 逻辑解耦：AIMessage 有 tool_calls 则发 TOOL_CALL 系列事件，否则发 TEXT_MESSAGE_CONTENT（逐字符）；ToolMessage 发 TOOL_CALL_RESULT。前端 chat.ts 封装 dispatchAGUIEvent 统一解析事件类型，ChatAgent.vue 按事件类型更新 UI（打字机效果 / 工具结果音频播放器卡片）。

通信链路：用户发消息 → POST /api/chat(带 thread_id) → FastAPI StreamingResponse → LangGraph Agent 流式执行(stream_mode="messages") → StreamProcessor 转 AG-UI 事件 → 前端解析 → Vue 响应式更新。

### 第一阶段踩坑
- LangChain 1.0 API 变化大（看官方 Changelog）
- SSE 响应被缓冲：gzip 压缩中间件会缓冲，需给 SSE 响应加 `X-Accel-Buffering: no` 响应头
- 跨域+代理：前端 3000/后端 8000 端口需同时配 FastAPI CORS 中间件和 Vite proxy
- Python 虚拟环境隔离

## 第二阶段：播客后期制作能力

### 音频混音工具模块（audio_mixing.py）
三个核心工具：
- **concatenate_audio 音频拼接**：多个片段按序拼接成完整对话，支持交叉淡入淡出（crossfade）+ 静音间隔（默认 1200ms，播客推荐 1000-1500ms）+ 自动生成带时间戳唯一文件名 + 记录到音频索引
- **select_background_music 智能 BGM 选择**：基于文件名语义匹配场景描述，自动循环/裁剪匹配时长，支持直接指定 BGM 路径，自动淡出
- **mix_audio_with_bgm 音频混音**：人声+背景音乐混合生成专业播客。BGM 分段处理：开场段（前 3 秒原音量）→ 过渡段（20 步渐变到背景音量）→ 背景段（降至约 5% 音量，推荐 -24~-28dB）；人声前插静音对齐；归一化 + 淡出

### 音频资源管理 API（resources.py）
RESTful API：GET 查询所有音频、POST 上传（仅 .mp3/.wav）、DELETE 删除（移除索引 + 删物理文件）。

### 音频索引系统（audio_index.py）
JSON 文件实现轻量级音频索引（voice_index.json），供各工具共享调用。path 字段分类：audios（TTS 生成）/ bgm（背景音乐）/ podcasts（播客成品）。

### 前端语音输入
Web Speech API 实现浏览器端语音识别（zh-CN 默认，continuous + interimResults），识别后自动填入输入框并智能处理中英文空格。

## 第三阶段：多模态识别与存储架构升级

### 存储路径重构
音频/视频统一保存到临时目录 storage/temp/，与永久文件分离。save_media_to_temp() 支持三种输入：base64 字符串（解码保存）、bytes（直接保存）、AudioSegment 对象（导出文件）。音色设计/声音克隆等中间产物放 temp，用户确认满意后通过 save_voice 永久迁移到 storage/audios/。

### 定时临时文件清理（temp_cleanup.py）
自动清除 storage/temp/ 超过指定时间（默认 10 分钟）的过期文件，递归清理子目录并移除空目录，返回统计（文件数/删除数/释放空间），可接入 APScheduler。

### 音色保存工具（voice_save.py）
save_voice 将定制音色从临时目录永久保存到 storage/audios/ 并记录索引。支持文件路径/base64 两种输入，自动生成唯一文件名，用文件锁（fcntl.flock）保证索引并发写入安全。工作流：音色设计 → 临时保存 → 用户确认 → 永久保存。

### 语音识别工具（qwen_asr.py）
集成阿里云 DashScope qwen3-asr-flash：多格式支持（MP3/WAV/OGG/FLAC/M4A/AAC）、ITN 逆文本标准化（"二零二五年"→"2025年"）、智能来源解析（本地路径自动转 base64 data URI）、MIME 自动推断。

### 多模态识别工具（qwen_multimodal.py）
集成 DashScope qwen3.5-omni-plus：qwen_multimodal_tool（单媒体识别）、qwen_combined_multimodal_tool（组合识别，如图片+音频）。大视频智能分割：视频超 21MB 时用 moviepy 分割为多个 10MB 片段分别处理。支持流式输出、音频输出模态（enable_audio_output）、错误处理和日志追踪。

### 提示词优化（prompt.py）
系统提示词模块化重组：核心能力定位/工作方式/工具调用规则/沟通规范/上下文理解/执行流程；明确区分语音识别（qwen_asr_tool）和多模态理解（qwen_multimodal_tool）使用场景；工具使用策略表格化降低 LLM 误调用；音色保存流程标准化（设计→临时→确认→永久）；强调"对于简单请求，调用一次工具后立即结束回复"避免重复调用。

### 三层架构总结
内容识别层（qwen_asr_tool 语音→文字 / qwen_multimodal_tool 音视频→理解）→ 播客制作层（音色设计→temp、save_voice→audios、音频合成/混音/拼接）→ 系统维护层（temp_cleanup 定时清理）。"临时-永久"双层存储 + 定时清理。

## 第四阶段：配置管理、资源管理与工程实践

### 配置管理：多层级优先级
config.json > 环境变量 > 默认值三级优先级。用户可通过前端 VisualConfig.vue 直接修改配置（API Key/模型选择），自动持久化到 storage/config.json，降低使用门槛。

### 音频索引系统：轻量级资源管理
不引入数据库，用 JSON 文件实现音频资源索引。文件锁并发控制（fcntl.flock）、path 字段分类（audios/bgm/podcasts）、临时文件自动清理。

### 前端交互
深色主题（品牌深蓝紫配色、深空背景+蓝紫光晕+亮蓝高亮）。流式对话体验：思维链可折叠卡片展示、工具调用可视化、音频播放器嵌入对话、文件拖拽上传。四个核心页面：ChatAgent（流式对话 Agent 核心创作入口）、PodcastList（播客成品列表）、ResourceLibrary（资源库管理音色/BGM/素材）、VisualConfig（可视化配置 API Key 和模型参数）。

## 工程实践与经验

1. **工具单一职责原则**：音频处理拆分为 9 个独立工具（多模态理解/语音识别/音色设计/语音合成/音色保存/音频拼接/BGM 选择/专业混音），每个工具只做一件事，让 Agent 灵活组合而非被"大而全"工具束缚
2. **临时/永久存储分离**：temp（中间产物 10 分钟清理）/ audios（用户确认保存的音色）/ podcasts（最终成品），避免磁盘浪费同时保证用户主动保存内容不丢失
3. **真流式输出**：stream_mode="messages" 确保逐 token 流式而非"生成完再发送"的伪流式
4. **配置可视化**：降低非技术用户门槛

## 总结与心得

项目展示 AI Agent 在垂直内容创作领域的完整实践：端到端自动化、多模态融合、专业级音频质量、低门槛使用。作者心得：框架版本要锁定（LangChain 快速迭代版本差异问题多）、先跑通链路再追求完美、多看官方文档、工具设计单一职责、存储分层管理。

> 注意：这是个人独立开发项目教程，含丰富实现细节但无量化生产数据/基准/新框架——属高质量实践教程，非第一方核心工程深度文章。
