# Build Live Translation Apps with gpt-realtime-translate

## Ch01.094 Build Live Translation Apps with gpt-realtime-translate

> 📊 Level ⭐ | 6.9KB | `entities/build-live-translation-apps-with-gpt-realtime-translate.md`

# Build Live Translation Apps with gpt-realtime-translate

> -> [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/build-live-translation-apps-with-gpt-realtime-translate.md)

## 摘要

gpt-realtime-translate 是 OpenAI 推出的专用实时语音翻译模型：输入任意语言的连续语音，自动检测源语言，直接流式输出目标语言的合成语音与文本转写，开发者只需指定目标语言。它针对口译场景做了两项关键优化——训练自数千小时专业口译音频、只做翻译不执行其他指令，以及边接收输入边流式回传译文，实现真正低延迟的同传体验。

## 核心要点

- **专用口译模型**：基于专业口译音频训练，倾向只翻译、等待足够上下文再开口，避免通用语音模型"答非所问"式地执行指令而非翻译。
- **连续流式架构**：无 turn 生命周期，不依赖 `response.create`，输入侧持续追加 24kHz PCM16 音频（含静音），输出侧以 200ms 分块流式返回译文音频与转写增量。
- **动态语音适配**：不固定输出音色，译文语音跟随源说话人的语调、音高与说话风格；多人会话中会随说话人切换而变化。
- **配置极简**：仅需设置 `session.audio.output.language` 指定目标语言；当前支持 70+ 输入语言、13 种输出语言，暂不支持自定义 prompt 与音色选择。
- **两大应用模式**：广播式（直播、讲座、财报电话会，一对多）与会话式（客服中心、视频通话，多对多）。
- **三种接入路径**：浏览器标签页音频（getDisplayMedia + WebRTC）、电话（Twilio Media Streams + WebSocket）、视频会议（LiveKit 订阅远端麦克风轨道）。
- **密钥安全模型**：浏览器端使用服务端签发的短期 client secret，OpenAI API key 永不下发到客户端。

## 深度分析

### 为何需要专用翻译模型而非通用语音模型

通用语音模型即使被提示去做翻译，仍可能回答问题或执行指令而不是翻译；同时它们依赖轮次式交互，说话人必须停顿等待模型生成译文，无法支撑流畅的口译。gpt-realtime-translate 的定位是"赋能人类多语言交流"而非构建语音 Agent——若目标是语音 Agent，官方建议使用 gpt-realtime-2。模型在数千小时专业口译音频上训练，能够等待足够语境再开口，这对语序差异大的语言对尤为关键。

### 会话模型：从轮次制到连续音频流

与标准 Realtime voice session 不同，翻译会话没有 turn 生命周期：没有 `response.create`、助手轮次、工具调用或会话状态需要管理。连接专用端点 `/v1/realtime/translations` 后，输入侧持续 append 24kHz PCM16 音频（包括短语间的静音），输出侧持续收到 200ms 的译文音频块与目标语言转写增量。协议选择上，浏览器端用 WebRTC（`oai-events` 数据通道承载事件），后端媒体管线用 WebSocket（Twilio、SIP、广播接入等场景）。

### 三条集成路径的工程要点

1. **浏览器标签页翻译**：`getDisplayMedia()` 捕获标签页音频（支持 `suppressLocalAudioPlayback` 避免同时听到原声与译文），WebRTC 建立会话，译文经远端音轨播放、字幕经数据通道渲染；服务端签发 client secret，目标语言在密钥请求中指定。
2. **Twilio 电话翻译**：后端处理格式边界——把 Twilio 的 8kHz u-law 转码重采样为 24kHz PCM16 再送入翻译会话，译文再转回 Twilio media 消息；双人通话通常需要两条会话（A→B 与 B→A），每条会话的目标语言是收听方的语言。
3. **LiveKit 视频会议翻译**：为每个远端发言人创建一个翻译 sidecar，订阅其麦克风 `MediaStreamTrack`，译文只在本机播放（不回传房间），并用 ducking（如音量降至 0.15）混合原声与译文。

多对多场景的会话数 = 活跃发言人数 × 目标语言数，官方建议按源发言人分轨、按目标语言扇出，而非把所有说话人混入一条共享流。

### 生产化：限制、混合语言与评估

模型存在几个已知边界：不做同语种翻译（若说话人切换成输出语言，该段可能静音，混合语言如 Spanglish→English 会显生硬）；不支持术语表、自定义提示词与发音指南，专有名词可能被替换错误；当前输出语言仅 13 种。评估上，官方建议将源音频、译文音频、转写与参考文本放在一起，回答三个问题——模型听到了什么、说了什么、应该说什么；按语义而非逐字评分（BLEU 只是弱代理），延迟与质量分开度量，并人工复核低分样本以捕捉名字、数字、漏译等问题。

## 实践启示

1. **先定模式再选路径**：广播式一对多翻译优先考虑浏览器 WebRTC；电话与 SIP 等后端媒体管线用 WebSocket；已有视频房间则用 LiveKit sidecar 模式，避免重复造轮子。
2. **API key 留在服务端**：浏览器一律走短期 client secret，由服务端 `/session` 端点签发并指定模型与目标语言，防止密钥泄露。
3. **保留原声通道**：混合语言场景不要整体静音原音频，采用 ducking 混合或提供原声/译文切换控件，规避同语种段落的静音问题。
4. **按"发言人 × 语言"规划并发**：多语言会议按源发言人分轨、目标语言扇出，避免混流导致的字幕错位、说话人身份丢失与重叠语音处理困难。
5. **用生产条件做验收**：用与线上一致的音频、语言组合、网络条件测试全链路；术语、人名等敏感词汇直接进评测集，因模型无术语表兜底。
6. **质量与延迟分开评估**：建立"听到/说出/应说"三段对照的评测集，用人工参考（如人工字幕、口译稿）而非自动转写作 ground truth。

## 相关实体

- [Openai Gpt Realtime Voice Models Qbitai](ch01/1081-openai-gpt-realtime-voice-models-qbitai.html) — GPT Realtime Voice 模型信息，与 gpt-realtime-translate 同族
- [Openai Realtime Api Architecture](ch01/122-openai-realtime-api.html) — OpenAI Realtime API 的整体架构
- [Openai Three Voice Models Kill Simultaneous Translation](ch01/276-openai.html) — OpenAI 语音模型矩阵与同传能力的讨论
- [Openai Realtime Voice Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/openai-realtime-voice-architecture.md) — Realtime 语音架构概念
- [OpenAI 开发者生态 MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/openai-developer-ecosystem.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/build-live-translation-apps-with-gpt-realtime-translate.md)

---

