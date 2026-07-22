# Ch16 推理优化与架构

> 让模型跑得更快：投机解码、MoE、PD 分离、量化

> 本章收录 **31 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 1 |
| ⭐⭐ 工程师 | 需编程基础 | 13 |
| ⭐⭐⭐ 专家 | 需ML基础 | 16 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 1 |

---

## 导读

模型训练好了，怎么高效地跑起来？

本章覆盖推理优化的核心技术：投机解码（DFlash 4.3× 吞吐提升）、MoE 架构（DeepSeek V4 万亿参数只激活一小部分）、PD 分离（Prefill 与 Decode 分开部署）、量化（从 FP16 到 INT4 的精度-速度权衡）。

你还会看到 Ben Thompson 的关键区分：Answer Inference（给人类答案）vs Agentic Inference（Agent 自主任务），以及为什么推理芯片的架构可能与训练芯片有本质不同。

推理成本是 AI 系统的"电费"——优化它就是优化商业模式。

---

## Ch16.001 从 Chroma 换成 Qdrant，我踩了 100 万向量的坑

> 📊 Level ⭐ | 8.2KB | `entities/chroma-to-qdrant-1m-vector-migration.md`

# 从 Chroma 换成 Qdrant，我踩了 100 万向量的坑
> 原文：从 Chroma 换成 Qdrant，我踩了 100 万向量的坑
> 来源：https://mp.weixin.qq.com/s/Aovqh95_LBYtVOj8_tTD_w

- 选向量库不是在比功能，是把你的场景参数（数据量、查询复杂度、运维条件）套进决策框架
- Chroma 是嵌入式帮手（零运维、<100 万向量最佳），Qdrant 是独立引擎（生产级、过滤不伤召回率）

## 相关实体
- [Vector Db Chroma Vs Qdrant](https://github.com/QianJinGuo/wiki/blob/main/entities/vector-db-chroma-vs-qdrant.md)
- [Deepseek V4 Pro Vs Claude](https://github.com/QianJinGuo/wiki/blob/main/entities/deepseek-v4-pro-vs-claude.md)
- [Gateway Architecture Openclaw Claude Hermes Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/gateway-architecture-openclaw-claude-hermes-comparison.md)
- [Context Engineering Three Memory Paradigms Comparison](https://github.com/QianJinGuo/wiki/blob/main/entities/context-engineering-three-memory-paradigms-comparison.md)
- [别为了用龙虾而用龙虾一个技术管理者折腾三周唯一留下的场景却是这个](https://github.com/QianJinGuo/wiki/blob/main/entities/别为了用龙虾而用龙虾一个技术管理者折腾三周唯一留下的场景却是这个.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/chroma-to-qdrant-1m-vector-migration.md)

## 深度分析

**选型逻辑的本质：场景参数驱动而非功能对比**

"Chroma 和 Qdrant 哪个更好"这个问题本身是错误的起点。两个向量数据库代表截然不同的架构哲学：Chroma 是嵌入式设计（Python 原生、零运维、进程内执行），Qdrant 是独立服务架构（Rust 实现、分布式、高可用）。这种差异不是功能多寡的问题，而是**运维模型和数据规模边界的根本不同**。

**100 万向量阈值的真实含义**

作者通过亲身踩坑发现了 Chroma 的性能边界在 100 万向量附近。延迟从 50ms 漂移到 800ms，根因并非 embedding 模型，而是 Chroma 在数据量过阈值后合并层扛不住。这不是理论推演，而是真实生产事故的学费。

从技术角度分析，Chroma 的性能退化来自两个叠加因素：Python/Rust 跨语言通信在大数据量时成为瓶颈（进程内零拷贝在数据膨胀后反而成了负担），以及元数据连接的内存膨胀触发 GC 抖动。这说明 Chroma 的架构设计在<100 万向量时非常优雅，但缺乏横向扩展的路径——它的"简洁"是设计选择，不是技术限制。

**架构哲学的深层差异**

Chroma 的"开放式厨房"模式（厨师同时切菜、炒菜、装盘）适合需要**数据即刻可见性**的场景——例如 Agent 记忆管理，新插入的数据立刻能被搜索，不需要等待索引构建。这种设计在 RAG 原型阶段是巨大优势，因为原型阶段的核心矛盾是"快速验证想法"而非"稳定服务生产流量"。

Qdrant 的"分区仓库"模式（进货区、存储区、出货区物理隔离）则将写入路径和查询路径完全解耦。WAL 预写日志保证持久性，段合并在后台静默进行，前台查询不受影响。这种架构在 100 万向量以上展现出明显优势，但在<10 万向量时完全感知不到收益——此时多维护一个 Docker 容器的负担反而成了累赘。

**过滤查询：被低估的选型维度**

文章指出"查询过滤是最容易被忽略的杀手"，这是一个极其重要的洞见。大多数选型讨论聚焦在向量检索的 ANN 算法（HNSW、IVF等），但忽视了**元数据过滤与向量检索的交叉执行问题**。

Chroma 的做法是"先搜再过滤"或"先过滤再搜"——无论哪种顺序，都存在精度或性能的取舍。Qdrant 的 Filterable HNSW 则在 HNSW 图遍历时直接应用位图掩码，语义搜索和条件过滤同时完成。这个差异在过滤条件复杂（多字段组合、时间范围、状态标签交叉）时会显著影响召回率和延迟。

**成本结构的关键分歧**

文章提到 Chroma+S3 比纯内存便宜 250 倍，这是一个被多数选型文章忽视的维度。Qdrant 的高性能依赖内存中的向量数据，当数据规模达到 TB 级时，内存成本会成为决策瓶颈。Chroma 的持久化选项（S3/本地存储）在这个场景下提供了 Qdrant 难以匹配的成本优势。

然而，这个成本优势只在"预算极紧 + 数据量超大"的组合条件下成立。如果数据量在百万级但预算正常，Qdrant 的运维成本（Docker 容器、监控、高可用配置）通常低于自建 Chroma+S3 的隐含成本（工程师时间、S3 访问费用、数据一致性维护）。

## 实践启示

**以数据驱动选型而非理论推导**

作者建议"新项目一律 Chroma 起步，快速验证想法。等到数据量和查询复杂度真的摸到阈值了，再迁 Qdrant"。这个建议的深层逻辑是：**选型的最优时机是问题变得清晰的时候，而不是问题开始的时候**。

提前迁移 Qdrant 的代价是增加运维复杂度和过早的架构锁定；过晚迁移则面临生产环境的迁移风险和可能的性能危机。最佳策略是建立明确的监控指标（延迟 P99、QPS、内存使用率），当这些指标触发阈值时再触发迁移流程，而不是凭感觉或追随潮流。

**读写隔离是 Chroma 的隐性要求**

文章提到 Flask 服务中 Chroma 的 GIL 问题：向量计算和 HTTP 响应绑在一起，整条链路都在等待。根因不是 Chroma 本身不行，而是没有做好读写隔离——但 Chroma 的嵌入式设计确实让这种错误更容易犯。

对于使用 Chroma 的生产系统，必须显式考虑读写分离架构：写入队列、后台索引构建、查询服务分离。这不是 Chroma 的 bug，而是嵌入式设计的固有约束——它要求开发者主动管理并发模型，而不是依赖服务化架构天然提供的隔离。

**四问题选型框架的实际应用**

文章提出的四问题框架（数据量、查询复杂度、运维条件、预算）应该作为选型决策的 Checklist，但每个问题的权重需要根据实际阶段调整：

- **数据量**：不仅看当前值，要看增长曲线。如果一年内会超过 100 万，提前迁移的成本低于在高峰期被迫迁移
- **查询复杂度**：过滤条件的复杂度往往被低估。建议用实际查询模式（而非理论上的查询类型）做基准测试
- **运维条件**：评估团队是否有能力维护独立服务。如果 DevOps 能力弱，Chroma 的简洁性是优势；如果基础设施成熟，Qdrant 的可控性更有价值
- **预算**：区分固定成本（服务费用）和可变成本（工程师时间）。在初创团队，工程师时间通常是最稀缺的资源

**Agent/RAG 场景的 Chroma 优先策略**

文章建议"做 Agent / 上下文管理用 Chroma（原生支持更好）"。这个判断基于 Agent 场景的特殊需求：高频写入（用户交互产生的新上下文）、即时召回（新数据必须立刻可搜索）、原型阶段快速迭代。这些需求与 Chroma 的设计优势高度吻合：进程内嵌入减少了网络延迟，零运维降低了 Agent 系统的复杂度的增加来源。

---

## Ch16.002 Build real-time voice applications with Amazon SageMaker AI and vLLM

> 📊 Level ⭐⭐ | 21.2KB | `entities/build-real-time-voice-applications-with-amazon-sagemaker-ai.md`

## 核心要点

- 使用 SageMaker AI 双向流式推理 + vLLM Realtime API 部署实时语音转录服务
- 支持 Voxtral-Mini-4B-Realtime-2602 等流式语音模型
- 全托管基础设施，无需自建流式处理服务
- 适用于语音 agent、实时字幕、呼叫中心分析、无障碍工具
- vLLM 开源模型 serving 层 + SageMaker AI 托管基础设施的组合方案

## 技术背景与问题动机

### 传统 request-response 推理的局限性

传统 ASR（自动语音识别）推理采用 request-response 模式：客户端必须先上传完整音频文件，服务器接收完全部数据后才能开始处理。这种模式在以下场景存在根本性问题：

- **语音 agent**：用户期望实时响应，等待完整音频上传会导致明显的延迟体验
- **实时字幕**：会议或直播场景下，转录必须与语音同步输出
- **呼叫中心分析**：需要实时监控通话质量或触发实时干预
- **无障碍工具**：听障用户依赖实时转录，延迟直接影响使用体验

### 解决方案：双向流式推理

2025年11月，Amazon SageMaker AI 推出[双向流式实时推理](https://aws.amazon.com/blogs/machine-learning/introducing-bidirectional-streaming-for-real-time-inference-on-amazon-sagemaker-ai/)，支持客户端与模型容器之间的双向持续数据流。同时，vLLM 的 [Realtime API](https://docs.vllm.ai/en/latest/serving/openai_compatible_server/?h=realtime+api#realtime-api) 提供原生 WebSocket 端点 `/v1/realtime`，实现了音频流式输入与转录增量输出的能力。

这两个能力的结合，使得从语音输入到转录输出的端到端延迟可以低至数百毫秒级别

## 架构深度解析

### 三层连接架构

![Architecture diagram showing the three-layer connection flow from client through SageMaker AI to the Docker container running vLLM](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/08/ML-20779-1.jpg)

该解决方案涉及三层架构 ：

**Layer 1 - Client → SageMaker AI Runtime（HTTP/2）**

客户端通过 HTTP/2 连接到 SageMaker AI Runtime 端点的 8443 端口。HTTP/2 支持多路复用和双向流式传输。vLLM Realtime 协议的 JSON 消息（如 `input_audio_buffer.append`、`transcription.delta`）封装在 `RequestPayloadPart` 中，DataType 设置为 "UTF8"，指示 SageMaker AI 将数据作为 WebSocket text frame 转发。响应通过 `ResponsePayloadPart` 事件返回。

**Layer 2 - SageMaker AI → Docker Container（协议桥接）**

SageMaker AI 自动完成 HTTP/2 事件流与 WebSocket 协议的桥接。它在容器端建立 WebSocket 连接至 `ws://localhost:8080/invocations-bidirectional-stream`（SageMaker AI 预期的双向流路径），并在两个方向上转发数据帧。设置 `DataType="UTF8"` 时，桥接器向容器发送 WebSocket text frame。

**Layer 3 - Docker Container 内部（FastAPI Bridge + vLLM）**

容器内运行轻量级 FastAPI 应用（`app.py`）监听 8080 端口的 `/invocations-bidirectional-stream` 路径。当接收到 SageMaker AI 的 WebSocket 连接时，它建立到 vLLM Realtime API（`ws://localhost:8081/v1/realtime`）的第二个 WebSocket 连接，并双向转发消息。FastAPI Bridge 负责路径转换：`/invocations-bidirectional-stream` → `/v1/realtime`。同时代理 `/ping` 健康检查到 vLLM 的 `/health` 端点，满足 SageMaker AI 托管契约。

vLLM 服务器运行在 8081 端口，服务于默认的 `/v1/realtime` WebSocket 端点，无需修改源码

### Realtime API 协议详解

vLLM 的 Realtime API 采用 WebSocket 协议，提供基于音频流转录的实时能力 ：

```
1. Client → Server: 连接到 ws://host/v1/realtime
2. Server → Client: 发送 session.created 事件
3. Client → Server: （可选）发送 session.update 配置模型参数
4. Client → Server: 发送 input_audio_buffer.commit 表示音频准备就绪
5. Client → Server: 发送 input_audio_buffer.append 事件（base64 PCM16 chunks）
6. Server → Client: 发送 transcription.delta 事件（增量转录文本）
7. Server → Client: 发送 transcription.done 事件（最终转录 + 使用统计）
8. 重复步骤5-7处理下一段语音
```

关键特性：模型在获得足够音频上下文后立即开始转录，在客户端继续发送音频 chunk 的同时就开始返回 `transcription.delta` tokens。客户端可发送 `input_audio_buffer.commit` 并设置 `final=True` 来标识音频输入结束，适用于音频文件流式传输场景。

![Sequence diagram showing the Realtime API message flow between client and server for streaming audio transcription](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/08/ML-20779-2.jpg)

## 核心组件详解

### Voxtral-Mini-4B-Realtime-2602

Mistral AI 开发的紧凑型实时语音模型 ：

- **参数量**：4B（40亿参数），单 GPU 可部署
- **上下文长度**：支持最长 262,144 tokens 的上下文，约等于 1 小时音频（3600秒 / 0.08秒每token）
- **实时性**：增量处理音频块，输出转录 tokens
- **硬件需求**：ml.g6.4xlarge（单张 NVIDIA L4 GPU）即可托管

### vLLM Realtime API

vLLM 提供的原生 WebSocket 流式推理接口 ：

- **端点**：`/v1/realtime` WebSocket 路径
- **CUDA Graph 优化**：piecewise CUDA graph 执行模式减少 GPU kernel 启动开销，降低 per-token 延迟
- **音频格式**：接收 base64 编码的 PCM16 音频（16kHz 单声道）
- **输出格式**：JSON 格式的 `transcription.delta` 事件，包含增量转录文本

### SageMaker AI 双向流式推理

SageMaker AI 托管基础设施的核心能力 ：

- **协议桥接**：自动桥接客户端 HTTP/2 事件流与容器端 WebSocket 协议
- **端口**：客户端连接 8443 端口
- **连接管理**：ping/pong keepalive 帧（60秒间隔），5次无响应则关闭连接
- **健康检查**：自动对容器进行健康检查
- **监控**：通过 Amazon CloudWatch 提供端点级监控

### FastAPI WebSocket Bridge

轻量级协议转换层（~50行代码），实现 SageMaker AI 预期路径到 vLLM 原生端点的路由 ：

```python
VLLM_WS_URL = "ws://localhost:8081/v1/realtime"

@ app.websocket("/invocations-bidirectional-stream")
async def websocket_bridge(sm_ws: WebSocket):
    await sm_ws.accept()
    async with websockets.connect(VLLM_WS_URL) as vllm_ws:
        async def sm_to_vllm():
            while True:
                message = await sm_ws.receive()
                if "text" in message and message["text"]:
                    await vllm_ws.send(message["text"])
                elif "bytes" in message and message["bytes"]:
                    await vllm_ws.send(message["bytes"].decode("utf-8"))

        async def vllm_to_sm():
            async for msg in vllm_ws:
                if isinstance(msg, str):
                    await sm_ws.send_text(msg)
                elif isinstance(msg, bytes):
                    await sm_ws.send_bytes(msg)

        await asyncio.gather(sm_to_vllm(), vllm_to_sm())
```

关键设计点：由于客户端设置 `DataType="UTF8"`，SageMaker AI 传递 text frames 给 Bridge，无需帧类型转换。二进制解码 fallback 仅为未设置 DataType 的客户端准备。

## 部署流程详解

### 自定义 Docker 容器构建

基于 SageMaker AI vLLM Deep Learning Container 构建自定义镜像 ：

```dockerfile
FROM public.ecr.aws/deep-learning-containers/vllm:0.17.1-gpu-py312-cu129-ubuntu22.04-sagemaker-v1.0-soci

# 声明容器支持双向流式推理
LABEL com.amazonaws.sagemaker.capabilities.bidirectional-streaming=true

WORKDIR /opt/ml/code

# 安装 bridge 依赖
COPY requirements.txt .
RUN pip install --upgrade --no-cache-dir -r requirements.txt

# WebSocket Bridge 和入口脚本
COPY app.py .
COPY sagemaker-entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:8080/ping || exit 1
```

**关键 Docker Label**：`com.amazonaws.sagemaker.capabilities.bidirectional-streaming=true` 是 SageMaker AI 识别双向流式容器的标志，缺少此 label 将导致 SageMaker AI 拒绝建立 WebSocket 连接。

### 环境配置与端点创建

vLLM 环境变量配置 ：

```python
vllm_env = {
    "SM_VLLM_MAX_MODEL_LEN": "45000",
    "SM_VLLM_COMPILATION_CONFIG": '{"cudagraph_mode": "PIECEWISE"}'
}
```

- **MAX_MODEL_LEN=45000**：支持约1小时音频的实时转录（3600秒 / 0.08秒每token）
- **COMPILATION_CONFIG cudagraph_mode: PIECEWISE**：启用 CUDA graph 优化提升推理吞吐

端点创建流程：Model.create() → EndpointConfig.create() → Endpoint.create() → wait_for_status("InService")

### 客户端实现

#### 文件级转录客户端

`sagemaker_bidi_client.py` 封装双向流 SDK 的 `SageMakerRealtimeClient` 类 ：

- 发送 `session.update` 事件选择模型
- 以 4KB PCM16 chunk 流式发送音频文件
- 背景 asyncio.Task 运行接收循环，主协程发送音频 chunk
- `await asyncio.sleep(chunk_duration)` 控制发送节奏（~128ms/4KB at 16kHz），让接收任务有处理机会

#### 实时麦克风客户端

`sagemaker_bidi_microphone_client.py` 基于 Gradio 的实时麦克风 demo ：

- 从浏览器通过 Gradio streaming audio input 捕获麦克风音频
- 重采样至 16kHz PCM16
- base64 编码后通过 SageMaker AI 双向流发送
- 说话同时 UI 实时更新转录文本，无需等待说话结束

## 性能优化与生产考量

### 延迟优化

chunk size 是延迟与吞吐量的关键权衡点 ：

| Chunk Size | 音频时长 | 延迟 | 开销 |
|------------|---------|------|------|
| 2 KB | ~64ms | 最低 | 高（更多消息） |
| 4 KB | ~128ms | 中等 | 中等 |
| 8 KB | ~256ms | 较高 | 低（更少消息） |

建议根据应用场景调整：低延迟需求选小 chunk，生产环境批量处理选大 chunk。

### 连接韧性

SageMaker AI WebSocket 连接管理细节 ：

- **Keepalive**：ping/pong 帧每 60 秒发送
- **超时**：5 次 ping 无响应则关闭连接
- **长会话**：实现客户端重连逻辑，不要假设连接永久保持
- **错误处理**：区分 `ResponseStreamEventModelStreamError`（模型级错误）和 `ResponseStreamEventInternalStreamFailure`（平台级错误）

### 音频格式要求

vLLM Realtime API 严格要求输入格式 ：

- **编码**：base64
- **采样率**：16 kHz
- **声道**：单声道 mono
- **位深**：PCM16

非标准格式音频需在客户端预处理后发送。

## 适用场景扩展

此架构不仅限于语音转文字，可扩展至以下场景 ：

- **语音 Agent**：多轮对话式 AI，结合 LLM 实现意图识别与响应生成
- **实时翻译**：流式音频 → 转录 → 翻译 → 语音合成流水线
- **交互式音频生成**：TTS 模型的双向流式调用
- **多轮流式对话**：结合 text LLM 实现端到端语音对话系统
- **实时字幕**：会议、直播等场景的低延迟字幕生成

## 清理与成本优化

SageMaker AI 端点按实例运行时长计费 ：

1. 删除 SageMaker AI Endpoint（最重要）
2. 删除 Endpoint Configuration
3. 删除 Model
4. 删除 Amazon ECR 中的自定义容器镜像
5. 删除 S3 中的模型 artifacts

## 深度分析

**三层架构的协议正交性设计**：该方案的核心工程价值在于每一层协议的完全解耦。Client ↔ SageMaker AI 使用 HTTP/2 + JSON（标准化），SageMaker AI ↔ Container 使用 WebSocket（标准化），Container 内部 FastAPI Bridge 仅做路径转换。三个协议层各自独立演进，任何一层的实现变更不会影响其他层。这种设计使得 vLLM 版本升级或 SageMaker AI 协议变更都可以独立进行，大幅降低了系统耦合度 。

**双向流"同时性"的技术实现细节**：文章揭示了一个关键实现细节——`await asyncio.sleep(chunk_duration)` 控制发送节奏，确保 HTTP/2 流的双向同时活跃。没有这个 sleep，客户端会全速发送chunk，使接收循环失去并发处理机会，看似双向实则串行。在生产系统中，任何涉及双向流的场景（语音、实时游戏、协作编辑）都需要类似的背压机制来保证真正的并发交互 。

**Docker Label 是 SageMaker AI 双向流的唯一准入证**：`com.amazonaws.sagemaker.capabilities.bidirectional-streaming=true` 这个 label 是 SageMaker AI 建立 WebSocket 连接的必要条件，缺少则直接拒绝连接。这是 SageMaker AI 的容器能力声明机制——与 Kubernetes 的 capabilities 类似，平台根据 label 决定是否向容器暴露特定能力。在扩展到其他 Realtime API 兼容模型时，首先检查该模型是否声明了 Realtime capability 是排查连接失败的首要步骤 。

**FastAPI Bridge 的最小化设计原则**：整个 Bridge 代码约 50 行，仅负责路径转换和消息转发，不涉及任何业务逻辑或数据处理。这种设计符合 sidecar 模式的核心原则——足够薄以至于几乎不会出错，且不需要单独的测试周期。Base64 解码的 fallback 分支（bytes→utf-8）仅在非标准客户端场景下激活，正文路径完全不经过该分支，体现了防御性编程与最小化意外路径的平衡 。

**Gradio 流式音频捕获的工程参考价值**：Gradio 的 streaming audio input 在浏览器端捕获原始音频流，通过 `await asyncio.sleep(chunk_duration)` 的发送节奏控制，实现说话同时显示转录文本。这为前端流式音频采集提供了一个可直接复用的工程范本，无需自研音频捕获模块。麦克风→重采样→base64→发送的完整链路可作为无障碍工具或实时字幕产品的参考架构起点 。

## 实践启示

**1. 部署前必查 Docker Label**：首次部署时若遇到 SageMaker AI 拒绝 WebSocket 连接，第一个排查点就是 `LABEL com.amazonaws.sagemaker.capabilities.bidirectional-streaming=true` 是否存在于 Dockerfile。在调试阶段，可通过 `docker inspect` 验证 label 是否被正确写入镜像。这一机制与 Kubernetes 的 capability gating 完全独立，是 SageMaker AI 特有的准入控制 。

**2. 生产环境必须实现自动重连逻辑**：SageMaker AI 的 ping/pong keepalive 间隔为 60 秒，5 次无响应后关闭连接。对于 7×24 运行的语音 agent，这意味着客户端需要感知连接断开并自动重建。实现时应使用指数退避避免风暴，并在重连成功后重新发送 `session.update` 以恢复会话状态。纯语音转文字场景可选择短会话规避这一问题 。

**3. 客户端音频处理链路标准化**：vLLM Realtime API 严格要求 16kHz 单声道 PCM16 base64，任何非标准格式都必须在前端完成转换。建议将音频预处理封装为独立函数，接收任意格式 AudioBlob，返回标准化 PCM16 chunks，以便在不同输入源（麦克风、电话 PCM、浏览器 MediaRecorder）间复用同一处理逻辑 。

**4. 延迟敏感场景选 2KB chunk，吞吐优先场景选 8KB**：2KB 对应 ~64ms 音频，是语音对话的最小感知单元（人类语音音节通常 >100ms），适合语音 agent 和无障碍转录；8KB 对应 ~256ms，适合录音后处理或直播字幕等可容忍轻微延迟的场景。在 Whisper 等非流式模型对比下，4KB chunk 在延迟和开销之间取得平衡，可作为默认初始配置 。

**5. 端点删除是成本控制的第一优先级**：SageMaker AI 按实例运行时长计费，端点不删除即持续计费。部署完成后应立即验证功能，随后执行完整的清理流程（端点→配置→模型→ECR→S3）。在原型验证阶段，可使用 `wait_for_status("InService")` 后立即调用一次测试，然后执行清理，避免端点长时间空转产生费用 。

## 相关资源

- [GitHub: sagemaker-genai-hosting-examples](https://github.com/aws-samples/sagemaker-genai-hosting-examples/tree/main/03-features/bidirectional-streaming-vLLM/)
- [vLLM Realtime API 文档](https://docs.vllm.ai/en/latest/serving/openai_compatible_server/?h=realtime+api#realtime-api)
- [SageMaker AI 双向流式推理介绍](https://aws.amazon.com/blogs/machine-learning/introducing-bidirectional-streaming-for-real-time-inference-on-amazon-sagemaker-ai/)
- [Voxtral-Mini-4B-Realtime-2602 on HuggingFace](https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602)
- [aws-sdk-sagemaker-runtime-http2 Python 包](https://pypi.org/project/aws_sdk_sagemaker_runtime_http2/)

## 扩展阅读

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/build-real-time-voice-applications-with-amazon-sagemaker-ai.md)
→ [Voice Agent 设计 - Nova Sonic 多 Agent 工具与会话](https://github.com/QianJinGuo/wiki/blob/main/entities/scalable-voice-agent-design-with-amazon-nova-sonic-multi-agent-tools-and-session.md)
→ [Nova Sonic WebRTC 实时语音流](https://github.com/QianJinGuo/wiki/blob/main/entities/build-real-time-voice-streaming-with-amazon-nova-sonic-and-webrtc.md)
→ [OpenAI Realtime Voice 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/openai-realtime-voice-architecture.md)

---

## Ch16.003 Apple Siri 私有推理（Private Inference）不私有：三个对抗者都不受加密学保护

> 📊 Level ⭐⭐ | 16.6KB | `entities/apple-siri-private-inference-lethal-trifecta-matthew-green.md`

# Apple Siri 私有推理（Private Inference）不私有：三个对抗者都不受加密学保护

> **Source**：[原文存档（Matthew Green / Cryptography Engineering, 2026-06-09）](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/apple-siri-private-inference-cryptography-green.md)

## 核心论点

Apple 2026-06-08 宣布 Siri AI 与 Google Gemini + Apple Private Cloud Compute (PCC) 整合的方案。PCC 设计目标：通过专用 Apple Silicon 服务器 + 加密传输 + 无状态推理，确保**用户数据在 inference 阶段不被 Apple/Google 看到**。

**Matthew Green 的反论点**：PCC 只能防御 *operator* 对 inference 数据的偷看，但**当 agent 必须与外部世界对话时（search LLM 查询、calendar invite、text message 发送），隐私就完全依赖 agent 的 discretion / prompting / 法律管辖**——而这三者**都不在加密学的保护范围内**。

## 三个对抗者（Adversary）分析

### 对抗者 1：Search Operator 的数据货币化

Agent 要完成任务（如"为下周聚餐找餐厅"）必然需要：(a) 读取私人上下文（messages, email, calendar），(b) 向非私有 search LLM（Gemini / ChatGPT / Claude）查询具体要求。

**数据泄漏路径**：
```
private context (on device)
    ↓
agent 提取 30 个 facts about attendees / 会议目的
    ↓
上传至 public search LLM：
"Hey, LLM search engine, here is a list of thirty detailed facts
about my attendees and the purpose of this meeting, find me a
restaurant that works for everyone."
```

**结果**：即使 inference 完全 private（无 Apple/Google 直接读取），30 个 facts 已经通过 search LLM 查询**外流**到 search operator。Google（运营 search LLM）获得所有这些 facts 的副本。

**经济学动机**：Generative AI 让"知道用户私密信息"变得 *wildly more lucrative* 用于广告定向。如果 search operator 同时**设计 prompting + 训练 model + 提供 search LLM**，这是数据货币化的 best-case 场景。

### 对抗者 2：Remote Prompt Injection（致命三要素 Lethal Trifecta）

**Simon Willison 的 Lethal Trifecta 定义**：当一个 agent 同时具备 (a) 访问私人数据、(b) 解析不可信内容、(c) 发送外部通信能力时，就形成**远程 prompt injection 数据外流的完美条件**。

**Apple Siri AI 场景**：
- (a) 访问 iMessage / email / contacts / notes → ✅
- (b) 解析不可信内容（incoming emails, text messages, web content）→ ✅
- (c) 发送 calendar invites, text messages → ✅

**结果**：Apple Siri AI 是 lethal trifecta 的 nightmare case。即使 private inference 完美设计，**任何能 induce agent 误行为的人**（attacker）都能触发数据外流。

**当前未解决**：OpenAI 2026-06-06 推出 "lockdown mode"（限制 ChatGPT web search 防止 prompt injection upload sensitive docs）本身就证明**问题远未解决**。

**未来威胁放大**："If you think spam directed at humans is bad, wait until it's spam directed at agents."

### 对抗者 3：政府管辖（Government Surveillance）

Agent 看到用户的所有数据后，技术上能**检测犯罪行为**（CSAM、terror、tax fraud）。

**法律压力点**：
- **UK OFCOM**：要求加密 messengers 检测 CSAM
- **EU Commission Chat Control proposals**：类似方案
- **UK Technical Capability Notices (TCNs)**：可强制全球设备变更
- **US 4th Amendment**：仅限制 government，但**私公司（Apple/Google）可先 collect crimes → 报告给 government**（Apple 2021 CSAM scanning 提案即如此）

**关键洞察**："the difference between a helpful private agent, a corporate advertising bot, and a government spy comes down mainly to a matter of prompting, and maybe a bit of model fine-tuning"——**prompt 决定一切**。

## 加密学的本质局限

**加密学的传统承诺**：*remove trust*——用"I can't" 替代 "I promise not to look"。

**Private inference 的局限**：对抗**设计 private inference 的对手**（执行 inference 的 provider）时，private inference 也许有效。但这只是 agentic system 的**极小一片**。

**真实对手**：直接与 model 交互的对手，或**设计 model / 指定其技术要求**的对手。**没有任何加密学原语**能保护用户免于：
- "upload your search facts to Google"（prompting 行为）
- "report anything suspicious to the government because I programmed you that way"（model fine-tuning）

**结论**："That protection, if it exists at all, lives in law and politics and corporate incentives: the exact messy human institutions that cryptography was invented to let us stop trusting."

## 与现有实体的差异化定位

| 维度 | `end-to-end-encrypted-ml-inference-sagemaker-fhe`（AWS FHE） | 本 entity（Apple PCC） |
|---|---|---|
| 加密原语 | Fully Homomorphic Encryption (FHE) 端到端 | 硬件 enclave + 加密传输 + 无状态推理 |
| 防御对象 | 模型本身看不到 plaintext（数学保证） | Operator 看不到 plaintext（硬件保证） |
| 失败模式 | 计算成本高，不实用 | 突破到 agent 外部对话时完全失效 |
| 适用场景 | 一次性 inference（文档摘要等） | 持续 agent 任务（搜索、订餐、消息） |
| 作者视角 | 工程方案（AWS 实施细节） | 安全批判（cryptographer's lens） |

**互补关系**：两者都试图用 cryptographic primitives 解决 ML inference privacy，但**FHE 局限于纯 inference 任务，Apple PCC 在 agent 场景下被 prompt + 行为流绕过**。Green 文章的核心贡献是指出"private inference ≠ private agent"的关键区分。

## 与 [Simon Willison vibe-coding](https://github.com/QianJinGuo/wiki/blob/main/entities/vibe-coding-agentic-engineering-convergence-simon-willison.md) 的呼应

Willison 的 **lethal trifecta** 框架（被 Green 引用）是同一问题的另一个 framing：Willison 从 LLM application 角度（数据访问 + 不可信输入 + 出站通信）描述 agentic 系统固有的安全风险，Green 从 cryptographic 角度证明**即使最强的 private inference 设计也无法缓解这个风险**。两者是**lethal trifecta 的两层解释**：
- Willison：识别 trifecta 模式
- Green：证明 cryptographic primitive 无法防御 trifecta 的 prompt injection 路径

## 实践启示

1. **评估 agent 隐私风险时，不能只看 inference 阶段**。一个 agent 即使使用 private inference，只要它 (a) 能读私人数据 + (b) 解析不可信输入 + (c) 能发送外部通信，就已经处于 lethal trifecta 中。
2. **法律/政策/公司激励**比 cryptographic primitive 更重要。Apple/Google 自身的商业激励（广告 / 商业模式）就是数据货币化的源头。
3. **OpenAI 2026-06 lockdown mode** 证明即使 frontier labs 也无法工程化解决 prompt injection。Agent 安全需要**整体架构**（隔离 agent、限制权限、人类审批循环）而非 cryptographic 修补。
4. **未来监管方向**：EU/UK 已经把 CSAM detection 法律延伸到 AI agent 层面。任何大规模部署 personal AI agent 的公司必须考虑这些法律风险。

## 与现有实体的关联

- [End To End Encrypted Ml Inference Sagemaker Fhe](https://github.com/QianJinGuo/wiki/blob/main/entities/end-to-end-encrypted-ml-inference-sagemaker-fhe.md)：互补（不同加密学原语，同一目标）
- [Vibe Coding Agentic Engineering Convergence Simon Willison](https://github.com/QianJinGuo/wiki/blob/main/entities/vibe-coding-agentic-engineering-convergence-simon-willison.md)：lethal trifecta 概念同源
- [Apple Silicon Costs More Than Openrouter](https://github.com/QianJinGuo/wiki/blob/main/entities/apple-silicon-costs-more-than-openrouter.md)：Apple 硬件成本视角
- [Apple Corecrypto Formal Verification Blueprint](https://github.com/QianJinGuo/wiki/blob/main/entities/apple-corecrypto-formal-verification-blueprint.md)：Apple 加密学基础设施

## 深度分析

### 核心观点：Private Inference ≠ Private Agent

Matthew Green 的核心贡献是建立了 **"private inference" 与 "private agent" 之间的关键区分**。Private Cloud Compute（PCC）设计的目标是确保用户数据在 inference 阶段不被 Apple/Google 看到——这是一个技术边界明确的问题。然而，当 Siri 作为 agent 必须与外部世界交互时（search LLM 查询、calendar invite、text message 发送），数据流就脱离了加密学的保护范围。这个区分对整个 personal AI agent 领域都有深远意义：即使每个 provider 都实现了 private inference，agent 作为整体系统仍然可能暴露用户数据。

### 技术要点：加密学对 "行为" 无能为力

加密学的传统承诺是 *remove trust*——用 "I can't" 替代 "I promise not to look"。Private inference 可以在这个意义上保护 inference 数据，但**无法保护 agent 的 prompting 行为**。当 agent 被指示 "上传你的搜索事实到 Google"（通过 prompt engineering）或 "因为我是这样编程的所以报告任何可疑行为"（通过 model fine-tuning），这些都是在加密学保护范围之外的。Green 的洞察是：prompt 决定一切，prompt 可以绕过任何 cryptographic primitive。

### 实践价值：Lethal Trifecta 是架构性缺陷而非实现 bug

Simon Willison 的 lethal trifecta（私人数据访问 + 不可信输入解析 + 出站通信能力）被 Green 证明是**任何 agentic 系统的架构性特征**，而非某个实现的 bug。Apple Siri AI 是 lethal trifecta 的 nightmare case，因为它同时具备 iMessage/email/contacts 访问、不可信内容解析、以及发送 calendar invites/text messages 的能力。这意味着**不存在"安全的 agent architecture"——只有将 trifecta 的某个环节最小化或隔离的工程权衡**。

### 核心观点：法律管辖比技术更能突破隐私保护

对抗者 3（政府监控）展示了加密学保护的根本局限：当 UK OFCOM 要求加密 messengers 检测 CSAM、EU Chat Control 提案延伸法律到 AI agent、企业被强制先收集犯罪证据再报告政府时，技术上的加密学保护被**法律强制力直接绕过**。Apple 2021 CSAM scanning 提案就是这种模式的具体案例——私公司被法律压力转化为 government spy 的前端。Private inference 保护不了这种情况。

### 技术要点：数据货币化激励使 search operator 成为对抗者

当 search operator 同时设计 prompting + 训练 model + 提供 search LLM 时，用户搜索事实成为广告定向的原材料。Generative AI 让"知道用户私密信息"变得 *wildly more lucrative*。这意味着**数据货币化的激励结构本身就是隐私威胁的源头**——即使 PCC 技术完美，只要 agent 需要调用外部 search LLM，数据就会流向有商业动机货币化它的对手。

## 实践启示

### 1. 评估 agent 隐私风险必须追踪完整数据流

评估任何 personal AI agent 的隐私风险时，不能只看 inference 阶段的技术指标。必须追踪完整数据流：私人数据从哪里进入 agent、经过哪些处理节点、以什么形式流向外部服务。即使每个节点都"合规"，整体数据流可能已经暴露了用户的私密事实。**数据流追踪是隐私评估的第一步**。

### 2. 打破 lethal trifecta 是 agent 架构设计的核心目标

当 agent 同时需要 (a) 访问私人数据、(b) 解析不可信内容、(c) 发送外部通信时，它就处于 lethal trifecta 中。架构设计的目标应该是**最小化同时满足三者的场景**：例如，使用隔离的 sandbox 处理不可信内容；将敏感数据访问限制在最小权限范围内；在发送外部通信前加入人类审批循环。参见 [Agent Security Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-architecture.md)。

### 3. Prompt injection 防御需要主动的内容隔离策略

Remote prompt injection 是 lethal trifecta 被 exploit 的主要路径。"If you think spam directed at humans is bad, wait until it's spam directed at agents." 防御策略包括：对所有外部来源内容进行 sandboxed 解析；使用 prompt 过滤和清理；在 agent 的 system prompt 中明确区分可信指令和外部内容。参见 [Prompt Injection Defense](https://github.com/QianJinGuo/wiki/blob/main/concepts/prompt-injection-defense.md)。

### 4. 法律合规需要提前布局——尤其是涉及跨司法管辖的 AI agent

UK Technical Capability Notices (TCNs) 可以强制全球设备变更，EU Chat Control 提案将 CSAM detection 法律延伸到 AI agent 层面。任何计划部署 personal AI agent 的公司必须**在产品设计阶段就考虑目标市场的法律环境**，而不是在法律通过后才被动合规。政府监控这条路径在加密学上完全无法防御。

### 5. 隐私保护需要技术 + 法律 + 商业激励三位一体

Green 的结论是：隐私保护（如果存在）活在法律、政策和商业激励中——正是那些" messy human institutions " cryptography 被发明来让我们停止信任的东西。对于 AI agent 的隐私，不能依赖单一的技术解决方案（无论是 private inference 还是 FHE），而需要**技术边界 + 法律保护 + 商业激励重新设计**三者配合。

## 参考链接

- Original article: https://blog.cryptographyengineering.com/2026/06/09/apples-siri-ai-or-more-shouting-into-the-void-about-private-agents/
- Simon Willison's lethal trifecta: https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/
- Apple Private Cloud Compute expansion: https://security.apple.com/blog/expanding-pcc/
- Google Confidential Inference: https://blog.google/innovation-and-ai/products/google-private-ai-compute/

---

## Ch16.004 GLM-5 Scaling 痛点与推理优化

> 📊 Level ⭐⭐ | 14.6KB | `entities/glm5-scaling-pain-inference.md`

# glm5-scaling-pain-inference
对 Scaling Law 的信仰不仅驱动着我们在模型参数与数据规模上不断突破，也同样在不断逼近 Infra 工程的极限，这一过程伴随着不可避免的阵痛，我们称之为" Scaling Pain "。
随着大模型应用从简单对话全面转向更复杂的、更长程的 Coding Agent 任务，我们的推理基础设施迎来了前所未有的压力，每天承受着数亿次 Coding Agent 调用。过去几周，部分用户在使用 GLM-5 系列模型执行复杂 Coding Agent 任务时，遭遇了多种异常：乱码、复读，以及偶现的生僻字。这些问题在标准推理环境下是不存在的，只在高并发、长上下文的 Coding Agent 场景下才会触发，很难稳定复现。
我们经过数周的推演、排查与压测，最终定位并修复了几个相互独立的底层竞态 Bug，并对其中所反映的系统瓶颈进行了针对性优化，显著提高了推理系统的稳定性和效率。
---

## 从线下复现到异常识别
自 3 月起，我们在 GLM-5 的线上监控和用户反馈中观察到三类异常现象：**乱码（garbled output）、复读（repetition），以及生僻字（rare character）**。这些现象在表面上与长上下文场景下常见的"降智"相似，但由于我们并没有上线任何降低模型精度的优化，一个更关键的问题是：**异常究竟源于模型本身，还是源于推理链路？**
如果源于模型，异常会表现为针对特定输入的稳定、可重复行为；反之，若异常与系统压力或运行时状态相关，则更可能指向推理基础设施中的链路或状态管理问题。
排查初期，我们先对用户反馈的 bad cases 做本地回放，并将同一批请求重复推理数百次，但始终未能复现异常，说明大概率不是模型本身的问题。为进一步模拟线上环境的压力，我们对线上日志做脱敏处理，并尽可能保留原始并发分布与请求时序，在本地进行全量回放。起初仍未复现异常，直到进一步调整 PD 分离比例并持续提高系统负载，模拟高峰期的 Prefill 堆积和 Decode 侧 KV Cache 压力后，才在约每万次请求中稳定复现 3-5 次异常。这种"与请求内容无关、与系统压力相关"的特征，说明问题可能来自高负载下的推理状态管理。
与此同时，线下复现的异常频率仍低于线上反馈的频率，说明现有检测方法可能存在漏检，或仍有部分触发场景尚未覆盖。
**如何可靠识别异常输出成为了新的挑战。** 三类异常中，复读相对容易检测，而乱码与生僻字比较棘手。我们尝试过正则表达式、字符集匹配等启发式方法，也尝试过基于模型判别的方式，但前者存在明显的漏判与误伤，后者则难以满足大规模消融实验的效率要求。
在反复分析推理日志后，我们发现了一个意想不到的切入点：**投机采样（Speculative Decoding）指标可以作为异常检测的重要参考。**
投机采样原本是一个性能优化技术，先由草稿模型生成候选 token，再由目标模型校验并决定是否接受，从而在不改变最终输出分布的前提下提升 decode 效率。如图 1 所示，我们观察到，两个指标在异常发生时呈现出稳定模式：

- **乱码和生僻字**：通常伴随极低的 spec_accept_length（目标模型连续接受的 draft token 前缀长度），即草稿模型生成的候选 token 几乎全部被目标模型拒绝，表明目标模型所看到的 KV Cache 状态与草稿模型预期之间存在显著偏差。
- **复读**：通常伴随偏高的 spec_accept_rate（draft token 被接受的比例），表明损坏的 KV Cache 可能使注意力模式退化，并将生成过程推向高置信度的重复循环。
基于上述观察，我们进一步实现了一套在线异常监控策略：当 spec_accept_length 持续低于 1.4 且生成长度已超过 128 token，或 spec_accept_rate 超过 0.96 时，系统主动中止当前生成，并将请求交由负载均衡器重试。
--- See also [Karpathy Vibe Coding To Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-vibe-coding-to-agentic-engineering.md)

## BugFix #1：PD 分离架构下的 KV Cache 竞态
### 原因分析：异步 Abort 引发的 KV Cache 复用竞态
为限制尾延迟，推理引擎中引入了基于超时的请求终止机制：当 Prefill 阶段未在规定时间内完成时，Decode 侧会对请求执行 Abort，并回收其占用的 KV Cache 资源。
然而，该 Abort 信号未被正确传播至 Prefill 侧，同时 Decode 侧也缺乏判断 KV Cache 是否可安全回收与复用的充分信息。因此，在 Decode Abort 并将对应 KV Cache 空间分配给新请求之后，先前已发起的 RDMA 写入以及正在执行的 Prefill 计算仍持续执行，未被同步取消。
**具体时序（两个请求在 PD 分离架构下的交互）：**
1. Req1 被发送至 Prefill-1（P1）和 Decode（D）
2. 由于调度或排队等原因，Req1 在 P1 侧经历了一段等待后才开始执行 Prefill Forward
3. Decode 侧在一段时间内未收到对应的 KV Cache 数据，触发超时机制，并对 Req1 执行 Abort
4. Decode 侧回收 Req1 占用的 KV Cache 槽位，但没有正确通知 P1
5. 新请求 Req2 到达，被分配至 Prefill-2（P2）和 Decode，由于内存复用策略，被分配到与 Req1 相同的 KV Cache 地址
6. P2 开始执行 Prefill Forward 并进行 KV Transfer，并在较短时间内完成，使 Decode 侧进入生成阶段
7. 与此同时，P1 侧针对 Req1 发起的 KV Cache 写入仍在继续，其数据会写入已被 Req2 复用的显存区域，从而覆盖 Req2 的部分 KV Cache
8. **最终，Req2 在 Decode 阶段读取到被覆盖的数据，导致生成结果异常**

### 修复方案：KV Cache 释放的时序一致性保证
为消除上述竞态，在推理引擎中引入了更严格的时序约束，在请求终止与 KV Cache 写入完成之间建立显式同步关系：

- Decode 在触发 Abort 后，会向 Prefill 侧发送通知
- Prefill 仅在以下条件满足时返回"可释放"信号：相关 RDMA 写入尚未开始，或所有已提交写入均已完成
- Decode 仅在收到该确认后，才允许回收并复用对应的 KV Cache 槽位
**修复效果**：异常输出的发生率由约万分之十几下降至万分之三以下。
---

## BugFix #2：HiCache 加载时序缺失
### 原因分析：流水线同步缺失导致的 read-before-ready
Coding Agent 场景显著提高了输入长度（平均超过 70K tokens），同时伴随较高的前缀复用率。这类负载使 HiCache（多级 KV Cache）成为线上服务中的关键优化手段。然而，在 KV Cache 换入与计算重叠执行的情况下，当前实现未能保证数据在使用前已完成加载，导致可能出现未就绪 KV Cache 被访问的情况。
系统会从 CPU 内存异步换入（swap-in）历史前缀缓存，并通过 Load Stream 与 Forward Stream 的重叠执行来提高吞吐。Load Stream 负责加载 KV Cache 与 Indexer Cache，而 Forward Stream 依次执行 Index 计算与后续的 Sparse Attention。
理论上，Forward Stream 中的 Indexer 计算应在对应的 Indexer Cache 完成加载后才能启动。然而，在原始实现中，该依赖未被显式表达。具体而言，Indexer 算子在启动时未对 Load Indexer Cache 的完成建立同步约束。因此，Forward Stream 可能先于 Load Stream 完成数据加载而开始执行，从而出现 **Read-before-Ready** 的访问模式。

### 修复方案：重构算子流水线的原子性
在 Indexer 算子启动前引入与 Load Stream 的同步点，确保对应层级的 Indexer Cache 已完成加载。Forward Stream 仅在数据就绪后才启动计算。
**该修复上线后，在相同负载条件下，由执行时序不一致引起的异常完全消失，系统行为趋于稳定。**
该修复已通过 Pull Request #22811 提交至 SGLang 社区。
---

## 优化：KV Cache 分层存储 LayerSplit
上述两个竞态问题揭示了一个共同的系统瓶颈：在长上下文的 Coding Agent Serving 场景中，Prefill 阶段主导了系统性能。
为了控制 Prefill 排队带来的 TTFT，我们引入了超时 Abort；为了缓解 Prefill 侧 KV Cache 容量压力，我们引入了 HiCache。在修复这些状态一致性问题后，我们进一步回到瓶颈本身：如何提升 Prefill 吞吐、降低 Prefill 侧 KV Cache 显存压力。为此，我们设计并实现了 **KV Cache 分层存储方案 LayerSplit**。
Coding Agent 负载通常呈现出上下文长度较长、Prefix Cache 命中率较高的特征。Context Parallel（CP）成为线上 Prefill 节点的主要并行策略。然而，现有的 SGLang 开源实现存在 KV Cache 冗余存储的问题，导致有限的 KV Cache 容量成为 GPU 计算资源利用率的限制因素。
**LayerSplit 方案**：每张 GPU 不再保存全部层的 KV Cache，而是仅持有部分层的 KV Cache，从而显著降低单卡的显存占用。
在计算过程中，不同 CP rank 按照协同方式完成 Prefill：持有某一层 KV Cache 的 rank 会在执行 Attention 计算前，将该层 Cache 广播给其他相关 rank。为降低通信开销，进一步设计了 KV Cache 广播与 indexer 计算的重叠机制，使二者在时间上相互掩盖。整体流程中仅引入了 Indexer Cache 广播的额外开销，其规模约为 KV Cache 的 1/8，因此整体通信成本较低。
**实验结果（Cache 命中率 90% 条件下，请求长度 40k-120k）：**

- 系统吞吐量提升幅度在 **10% 至 132%** 之间
- 上下文长度越长，收益越显著
---

## 总结
当智能真正进入高并发、长上下文的 Coding Agent 场景后，推理基础设施的挑战已经不只是吞吐、延迟和可用性，**维护它的输出质量变得至关重要**。每一次对 Scaling Law 的追求，都必须有同等强度的系统工程作为支撑。
---
**参考链接：**

- 技术 blog 原版（推荐阅读，含完整图表）：https://z.ai/blog/scaling-pain
- SGLang PR #22811（HiCache 修复已开源）：https://github.com/sgl-project/sglang/pull/22811
- 中科加禾 × 中国科学院计算技术研究所处理器芯片全国重点实验室 联合研究

## 深度分析
GLM-5的Scaling Pain案例揭示了高并发Coding Agent场景下推理系统面临的核心挑战：
**1. 异常检测的范式创新**：投机采样指标（spec_accept_length/spec_accept_rate）被发现可用于异常检测，这是将性能优化技术转化为可观测性工具的典型案例。乱码/生僻字与低spec_accept_length相关，复读与高spec_accept_rate相关，形成稳定的异常模式指纹。
**2. 竞态Bug的隐蔽性与系统性**：两个Bug（PD分离KV Cache竞态、HiCache加载时序）都是典型的分布式系统状态一致性问题的不同表现形式。它们的共同特征是：只在高负载、长上下文场景下触发，难以本地稳定复现，根因隐藏在对时序敏感的状态管理中。
**3. 系统瓶颈的根源**：两个Bug的修复揭示了共同的系统瓶颈——Prefill阶段主导了Coding Agent场景的系统性能。LayerSplit优化正是针对这一瓶颈的根本性解决方案，通过KV Cache分层存储降低单卡显存压力。

## 实践启示
1. **利用性能优化技术的副产物进行异常检测**：投机采样原本是性能优化手段，但其指标（spec_accept_length、spec_accept_rate）在异常时呈现稳定模式，可作为在线监控的锚点。这种"用优化技术的副产物做可观测性"的思路值得借鉴。
2. **高负载压测是暴露隐式Bug的必要条件**：本地回放无法稳定复现异常，只有在接近真实负载的条件下（调整PD分离比例、持续提高系统负载）才能稳定触发。线上问题排查需要构建压力环境模拟能力。
3. **时序一致性是分布式推理系统的核心 invariant**：KV Cache释放必须与RDMA写入完成建立显式同步，流水线各阶段必须在数据就绪后才能启动计算。任何违反这一原则的设计都可能引入隐蔽的竞态条件。
4. **修复应优先于优化**：在两个竞态Bug修复之前，LayerSplit等优化方案的效果会被系统不稳定掩盖。先修Bug，再做优化，才能获得可衡量的效果提升。
## 相关实体

- [lightseek token speed inference](https://github.com/QianJinGuo/wiki/blob/main/entities/lightseek-token-speed-inference.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/wiki-master-map.md)

---

## Ch16.005 EAGLE-3 投机解码与 USP 长序列训练优化

> 📊 Level ⭐⭐ | 14.2KB | `entities/eagle-3-speculative-decoding-optimization.md`

## 核心问题：为什么 Agent 场景需要 EAGLE-3
Agent 场景（自动化代码工程、长文档分析、多轮工具调用）带来了与大模型传统推理场景截然不同的挑战：
| 维度 | Chat 场景 | Agent 场景 |
|------|-----------|-----------|
| 上下文长度 | 千级 token | 64K/128K+ |
| 延迟容忍度 | 秒级可接受 | 复合放大，10轮循环可达分钟级 |
| 高熵片段密度 | 低 | 高（工具调用、链式推理） |
| Accept Len 稳定性 | 较稳定 | 骤降风险大 |
**投机解码加速效果取决于两个因素**：
1. Draft 生成成本
2. Accept Len 的长度与稳定性
关键不在于"有没有 Draft"，而在于 Draft 能否以较低的成本，持续生成可被稳定接收的长序列草稿。

## EAGLE-3 vs MTP：为什么长序列要选 EAGLE-3
**MTP 的局限**：在一次前向中直接生成多步候选，一旦早期 token 出现偏差，后续更容易出现连锁放大。工程上通常将有效步长控制得较短，通过校验/回退机制降低风险，但限制了整体加速收益。
**EAGLE-3 的核心创新：TTT（Training-Time Test）**：

- 训练时不再只依赖 ground truth 历史，而是让 Draft 先前向生成一段 token，再将这些"自生成的历史"用于下一步训练
- 本质：把推理流程搬进训练，让模型在训练阶段即适应"带误差历史"的输入环境
- 效果：连锁误差提前暴露到训练过程，使模型学会在"带误差历史"下维持更长的稳定接收长度 
**对比结果**（滴滴实测）：

- EAGLE-3 Accept Len ≈ MTP 的 **2.2–2.3×**
- EAGLE-3 Mean TPOT ≈ MTP 的 **41%**（降低约 59%）
- EAGLE-3 P95 TPOT 比 MTP 低 **35%–44%**

## EAGLE-3 训练为什么容易 OOM
### 显存放大的两个"放大器"
**放大器 1：多层特征参与训练**
EAGLE-3 融合 Target 的低层/中层/高层特征，提升多步预测稳定性，但需要保留多层特征参与计算 + 保存更多中间激活。
**放大器 2：TTT 的多步展开**
普通 SFT 基本是"一次前向算完 loss"。TTT 需要将过程展开 k 次（模拟 k 步 decode），反向传播需要保存每一步的中间结果，显存开销近似按 k 倍放大。
**公式**：显存问题 = L（序列长度）× k（TTT 展开步数）× 多层特征额外中间态

### 为什么不是参数问题
即使 Draft 参数量约 1.5B 不算大，但长序列训练时：

- Attention 中间激活（Q/K/V 张量、softmax 相关中间量）随 L 快速增长
- TTT 多步展开引入 k 轮中间态堆叠
- 128K 下单卡训练无法启动
**瓶颈在激活，不在参数**——所以必须引入 SP（Sequence Parallelism）。

## 解决方案：USP（Unified Sequence Parallelism）
### 两种序列并行方式
| 方式 | 切分维度 | 优点 | 缺点 |
|------|---------|------|------|
| **Ulysses** | 按 head 维度（All-to-All） | 吞吐易提升 | 切分粒度受 head 数限制，长序列时显存仍难覆盖 |
| **Ring** | 按序列/token 维度 | 显存随 SP 规模近似线性下降 | 通信更频繁 |

### USP 核心设计：三步走
```
Step 1（主干 Main）：ring attention
  → 主干历史按 token 分片分布到多卡
  → ring 通信完成 causal attention 计算
  → 得到 Out_main + LSE_main
Step 2（分支 Branch）：本卡增量更新
  → TTT 分支仅涉及少量新增 token 的 KV（通常 ≤7 步）
  → 单卡承担的主干分片往往达万级 token
  → 无需 ring 跨卡，本卡完成增量计算
  → 得到 Out_branch + LSE_branch
Step 3（Fusion）：流式 softmax 融合
  → 分支结果作为增量并入主干
  → 采用流式 softmax 保持数值稳定
  → 保证归一化口径一致
```

### USP 解决的三个工程目标
1. **显存可控**：每张卡仅需保存 1/SP 的主干 KV 与中间态
2. **训练更稳**：LSE 融合保证分布式切分下归一化口径一致，训推一致，Accept Len 稳定
3. **吞吐更高**：最重主干计算走高效 ring attention 路径，分支走轻量级增量更新

## 工程实践：三块地基
### 1. 输入与 loss 计算都按 SP 分片
- 将"切分"前移到数据入口
- 每个 SP rank 仅加载自身对应 token 分片
- loss/metric 按 SP 口径处理
- 效果：显存随 SP degree 基本线性缩放

### 2. 统一训练口径
- 引入 adapter 抽象层
- 将 step view、分布式 loss/metric reduction、position_ids 等训练口径统一收敛
- 减少长序列训练中最难定位的"漂移问题"

### 3. 压缩 hidden states
- 磁盘占用下降约 25%
- Accept Len 不变（1.93 vs 1.93）
- time/step 仅增加 4%（0.45s → 0.47s）

## 当前挑战
1. **OOD（分布偏移）双因素驱动**：

   - OOD-A：数据/流程分布漂移（提示词模板、工具参数、工作流编排变化）
   - OOD-B：模型能力不足（现有 Draft 表达能力/泛化能力不足）
   - 两者缺一不可：需要更快训练更新机制 + 更强更可泛化的 Draft 能力
2. **长序列训练与特征管线成本仍高**：

   - Offline：依赖 hidden states 落盘与搬运，TB 级存储
   - Online：Target 特征生成与训练过程强耦合，容易与线上服务争抢资源
3. **系统要面向"稳定收益"**：P95/P99 的稳定收益比 mean 更重要
4. **算法快速演进**：需要抽象出"数据/特征接口、验证接口、调度策略"以支持范式演进

## 后续规划
- **A**：分离式特征生成 + 训练解耦（复用 Mooncake store 样本）
- **B**：近线/在线快速迭代（周/月级 → 天级/小时级）
- **C**：更强表达的 Draft + 路由专精（MoE / Routing Draft）
- **D**：面向未来范式的可插拔框架

## 深度分析
### EAGLE-3 的本质：训练-推理分布对齐
EAGLE-3 之所以能在长序列 Agent 场景取得显著超越 MTP 的效果，核心在于其 TTT 机制彻底弥合了训练与推理之间的分布偏差。传统 SFT 以 ground truth 历史 token 为条件进行训练，但推理时模型实际面对的是自己生成的历史——这个"自生成历史"与"ground truth 历史"的分布差异在短序列场景下不显著，但在长序列高熵片段（工具调用、链式推理）中会被急剧放大，导致 Accept Len 骤降。
TTT 的解决思路是"让训练过程模拟推理过程"：Draft 模型先生成一步预测，再用这个预测结果作为下一步输入，循环往复。通过这种方式，模型在训练阶段就习惯了"带误差历史"的输入环境，连锁误差得以在训练过程中提前暴露并被学习。

### USP 的设计哲学：主干稳、分支轻、融合准
USP 的三步设计（ring attention 主干 → 本卡增量分支 → 流式 softmax 融合）体现了明确的工程哲学：

- **主干稳**：最重的计算（万级 token 的主干历史）走 ring attention 路径，通信模式稳定，计算密度高
- **分支轻**：TTT 分支仅涉及 ≤7 步增量，单卡即可完成，无需跨卡通信开销
- **融合准**：采用流式 softmax 持续维护归一化过程，保证 LSE 融合的数值稳定性，确保训推一致性

### 显存瓶颈的根源：激活而非参数
文章反复强调"EAGLE-3 的显存问题来自激活而非参数"，这个判断具有重要的工程含义：
1. 单纯缩小 Draft 参数量并不能解决 OOM 问题
2. 序列并行（SP）是解决问题的唯一有效路径，因为激活随序列长度 L 超线性增长
3. 选择 ring attention 而非 Ulysses，是因为长序列场景下显存压力是主要矛盾，ring 的线性扩展特性更适配
4. 分支走本卡增量更新而非全局 ring，避免了 TTT 多步展开带来的通信瓶颈

### OOD 问题的双因素框架
滴滴提出的 OOD-A（数据漂移）和 OOD-B（模型能力不足）构成的双因素框架，对理解投机解码的长期维护具有重要价值：

- OOD-A 意味着系统需要更快的训练更新周期（周/月级 → 天级/小时级），这驱动了近线/在线训练的需求
- OOD-B 意味着 Draft 模型本身的表达能力是瓶颈，MoE / Routing Draft 是值得探索的方向
- 两者相互独立又相互加强：即便数据分布稳定，Draft 泛化能力不足也会导致 Accept Len 下降；即便 Draft 能力足够，数据/流程的变化也会使其失效

## 实践启示
### 1. 投机解码选型：先分析场景特征，再选算法
不是所有场景都适合 EAGLE-3。其核心收益来源是"长上下文 + 高熵片段"带来的 Accept Len 提升。如果业务场景的上下文长度在 4K 以内且熵较低（闲聊、问答），MTP 可能已经足够。EAGLE-3 的优势需要 64K+ 上下文长度才能充分发挥。

### 2. 长序列训练的第一步是搞清楚瓶颈在哪
在投入 SP 之前，需要先确认瓶颈是激活还是参数。方法：单卡跑一个前向，监控显存占用，如果模型参数本身不超显存但激活导致 OOM，则必须引入 SP。盲目扩大集群规模而不对应调整并行策略，可能反而引入不必要的通信开销。

### 3. USP 三步走的工程可借鉴性
USP 的"主干 ring + 分支本卡 + 流式融合"设计不只适用于 EAGLE-3，任何涉及"长序列主计算 + 短序列增量分支"的场景都可借鉴。其核心思想是将"最重的部分用最高效的并行方式处理，最轻的部分用最低开销的方式处理"，流式 softmax 保证了两者融合时的数值稳定性。

### 4. 训推一致性是 Accept Len 稳定的前提
滴滴在 USP 设计中特别强调 LSE 融合保证归一化口径一致，训推一致。这个教训在实际工程中容易被忽视：很多团队在训练侧做各种优化但忽视与推理侧的一致性，最终导致训练时指标好看但推理时 Accept Len 不稳定。

### 5. 系统设计要面向 P95/P99 而非 mean
滴滴强调"P95/P99 的稳定收益比 mean 更重要"，这对生产系统设计具有普遍意义。均值优化容易让长尾问题被掩盖，但长尾延迟在 Agent 多轮循环场景下会直接转化为用户体验的剧烈波动。面向 P95/P99 优化意味着在系统设计时需要预留足够的 buffer，而非单纯追求平均吞吐。

### 6. 算法快速演进期，infra 必须可插拔
滴滴在规划中特别提到"算法快速演进，需要抽象出数据/特征接口、验证接口、调度策略"，这在当前投机解码算法快速迭代的背景下非常重要。建议在设计系统初期就将 Draft 模型视为可替换组件，预留特征管线的抽象接口，避免新算法出来后需要大幅重构 infra。

### 7. hidden states 压缩是值得投入的工程优化
滴滴的实验显示，hidden states 压缩可降低约 25% 磁盘占用，同时 Accept Len 完全不变（1.93 vs 1.93），time/step 仅增加 4%。这是一个回报率非常高的优化方向，尤其在需要存储/搬运大量中间特征的离线训练场景。

### 8. 在线特征生成的资源隔离问题不可忽视
滴滴指出"Online 特征生成与线上服务争抢资源"是当前痛点之一。建议在架构设计阶段就将特征生成管线与在线服务在不同资源池中部署，避免资源竞争导致的延迟尖峰。

## 参见
- [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/didi-eagle-3-speculative-decoding-agents.md)
- [SpecForge GitHub PR #425](https://github.com/sgl-project/SpecForge/pull/425)
- [SpecForge GitHub PR #454](https://github.com/sgl-project/SpecForge/pull/454)

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/queries/ai-model-research-latest-directions.md)

- [小米AI — ICML 2026 论文矩阵（11篇）](https://github.com/QianJinGuo/wiki/blob/main/entities/xiaomi-ai-icml-2026-11papers.md)
- [OpenClacky — Prompt Cache 命中率 90% 的 Harness 工程实践](https://github.com/QianJinGuo/wiki/blob/main/entities/openclacky-harness-prompt-cache.md)
- [百度文心大模型后训练进化（ERNIE 3.0→5.0）](https://github.com/QianJinGuo/wiki/blob/main/entities/baidu-wenxin-post-training-evolution.md)

---

## Ch16.006 PithTrain：陈天奇 + CMU Flame Center 推出的 agent-native MoE 训练框架（11K Python / 双重效率）

> 📊 Level ⭐⭐ | 12.1KB | `entities/pith-train-agent-native-moe-training-framework.md`

## 摘要

**PithTrain 是陈天奇团队（MLC-AI）+ CMU Flame Center 联合推出的精简 agent-native MoE 训练框架**，约 **1.1 万行 Python**，训练吞吐追平生产级（差距 < 1.4%），同时**显著降低 AI coding agent 使用成本**。

**核心贡献**：提出 **agent-task efficiency** 作为与训练吞吐并列的第二维度，定义"agent 完成任务所需成本"。在 Claude Code Opus 4.7 + 固定任务的对照实验中，PithTrain **最多减少 62% 对话轮数、节省 64% GPU 时间、少用 78% 输出 token**。

## 双重效率（dual efficiency）

- **训练吞吐**：tokens/s, MFU。PithTrain 追平 Megatron-LM/DeepSpeed（差距 < 1.4%）
- **agent-task efficiency**：完成任务所需成本（轮数/GPU 时间/token）。PithTrain **最多 62% 轮数 ↓、64% GPU 时间 ↓、78% token ↓**

两者**并不矛盾**：1.1 万行 Python + 四条设计原则同时实现。

## 四条 agent-native 设计原则

**一、精简**
- 1.1 万行 vs 成熟生产级十几万行
- 关键洞察：coding agent 支持 20 万-100 万 token 上下文 → 精简代码让 agent **有能力在一个上下文窗口内把整个框架全读进来，一览无余**

**二、Python-native**
- 整个栈纯 Python → agent 自始至终只集中在一门语言
- 报错：清晰 Python traceback，不用等编译扩展重新 build
- Triton 写少数 kernel → 训练首次跑到时自动 JIT 编译

**三、不要 implicit indirection**
- 不存 callable、不查 registry、不用字符串解析、若干模型不共用 modeling 骨架
- 每个模型老老实实待在 `models/` 下专属于它的文件里，自成一体
- Tradeoff：略微牺牲"跨模型复用"换"一个模型能在一处从头读到尾"

**四、提供 agent skills**
- 人类开发者经验知识 agent 光靠读代码读不出来（多卡 run 怎么起、正常 loss 曲线长什么样、profile 怎么搞才干净）
- agent skill = 简短、即时加载的 playbook，传授经验的绝佳方式
- PithTrain 打包一组 agent skills：移植模型 / profile 显存 / 跑 Nsight Systems trace / 验证正确性
- **每个 skill 落到一个具体可执行脚本，给出明确 PASS/FAIL 结果**

## 性能基准

**吞吐**：在 H100/B200、BF16/FP8、单机/多机、Qwen3-MoE/GPT-OSS 测试中**追平 Megatron-LM/DeepSpeed**。靠的全是标准手段：
- DualPipeV + EP 计算-通信 overlap
- torch.compile
- 延迟计算 weight gradient
- 融合 SwiGLU kernel
- Expert dispatch 去重
- 跨 micro-batch 复用 FP8 权重

**正确性**：预训练 loss 曲线在几十亿 token 尺度与生产级一致；6 个下游 benchmark 精度落在统计噪声范围；checkpoint 导出 HuggingFace 格式可在 vLLM/SGLang/lm-evaluation-harness 跑。

## Agent-Task Efficiency 量化

**方法学创新**：常规 coding agent benchmark（SWE-bench）固定代码库、轮换不同 agent；PithTrain **固定 agent + 任务，每次只替换底层框架** → agent 表现差异只可能来自框架本身。

**三档任务**：
- **Understand**：回答"device mesh 怎么搭起来的"等 12 个问题
- **Operate**：环境配好、训练跑通、采集 routing trace、profile 报最慢 3 个 kernel
- **Extend**：移植 4 个新架构（Differential Transformer / DynMoE / MoBA / MoE++）

**结果（固定 Claude Code Opus 4.7）**：

- **Understand**：最多 **67% 轮数 ↓**，每轮 token 更少
- **Operate (Getting Started)**：88→26 轮（70% ↓），78% token ↓；一半代码精简，一半 agent skill 自触发
- **Extend (DynMoE)**：62% 轮数 ↓；bug 落在刚改文件 + Python traceback
- **Extend (4 架构 GPU 时间)**：比 Megatron-LM 省 **44%**，比 TorchTitan 省 **64%**
- **Skill 对口任务**：轮数砍掉约 **70%**

**具体 MoBA 例子（editing 阶段 token）**：
- PithTrain 4.7K
- Megatron-LM 13.1K
- TorchTitan 22.2K

**Exploring 阶段**：PithTrain 2.2K vs Megatron-LM 10.2K。

## 三层架构

- **应用层**：训练循环
- **引擎层**：DualPipeV scheduler、优化器、checkpointing
- **算子层**：custom Triton kernel

**支持**：NVIDIA Hopper + Blackwell、BF16/FP8、Qwen3-MoE/GPT-OSS。四种并行：pipeline（DualPipeV schedule）/ FSDP / context / expert。

## 团队与背景

- **作者**：赖睿航（CMU CS Ph.D.）
- **指导**：Todd Mowry、熊辰炎、陈天奇
- **合作者**：Hao Kang、Haozhan Tang、Akaash Parthasarathy、Zichun Yu、邵俊儒
- **机构**：CMU Flame Center + 陈天奇团队（MLC-AI）
- **GitHub**：https://github.com/mlc-ai/pith-train
- **Paper**：https://arxiv.org/abs/2605.31463

## 与现有实体的关系

- **与 [Skill 自进化三路线](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-self-evolution-three-approaches.md)** 呼应：PithTrain 的 agent skills 哲学与 SkillOS/SkillOpt 一脉相承（>30% 重复劳动 → 技能化）
- **与 [SaaS-Bench](https://github.com/QianJinGuo/wiki/blob/main/entities/saas-bench-gui-agent-eval-unipat.md)** 平行：两者都创建"为 agent 量身定制的工程指标" —— SaaS-Bench 测 GUI Agent 完成率，PithTrain 测训练框架的 agent-task efficiency
- **与 [Matt Van Horn 22 黑客技巧](https://github.com/QianJinGuo/wiki/blob/main/entities/matt-van-horn-claude-code-workflow-philosophy.md)** 呼应：Matt 的"任何做超过 2 次的事 → 技能"是 PithTrain agent skills 哲学的应用层验证
- **与 [Agent 六机制](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-self-improvement-six-mechanisms.md)** 平行：双重效率思想是六机制中"系统-环境协同"的具体实现

## 核心洞察

> "如今 coding agent 基本支持 20 万到 100 万 token 的上下文窗口，代码足够精简意味着 agent 有能力在一个上下文窗口内把整个框架全读进来，一览无余，而不必反复 grep、四处摸索。"

> "PithTrain 的做法刚好'相反'：维持 agent 不变、任务不变，每次只替换底下那套框架。这样一来 agent 表现差异只可能是框架带来的，跟模型本身无关。"

## 深度分析

**一、dual efficiency 标志着 AI 基础设施评估进入二维时代**。传统框架只追训练吞吐（tokens/s, MFU），PithTrain 引入 agent-task efficiency 作为并列维度——衡量 agent 完成任务所需成本。这两者并不矛盾，1.1 万行 Python + 四条设计原则可以同时实现。dual efficiency 的提出意味着，未来评估 AI 训练框架，不能只看 GPU 峰值，还要看 agent 实际用起来贵不贵。

**二、"Python-native + 不要 implicit indirection" 本质上是面向 20 万–100 万 token 上下文窗口的代码哲学**。当 agent 能在一个上下文窗口内读完整个框架时，代码的"可全景化"就成了新的设计约束。人类工程师习惯用间接层和 registry 管理复杂度，agent 却因此需要跨多个文件跳转才能理解一个模型——这是给 agent 写代码和给人写代码的核心分歧。

**三、agent skill 是把人类隐性经验转移给 agent 的最佳载体**。多卡 run 怎么起、正常 loss 曲线长什么样、profile 怎么搞才干净——这些人类靠经验积累的知识，agent 只读代码永远读不出来。Playbook 式的短脚本 + PASS/FAIL 判定，是目前最高效的经验传递方式。这与 SkillOS/SkillOpt 的"超过 30% 重复劳动 → 技能化"思路一脉相承。

**四、agent-task efficiency 的方法学创新在于"固定 agent、替换框架"**。常规 benchmark 固定任务、轮换 agent；PithTrain 固定 agent 和任务、只换底层框架——这样 agent 表现差异只可能是框架带来的。这个方法学可以推广到所有"框架 vs agent 表现"的研究中。

**五、PithTrain 的 agent-native 设计原则重新定义了什么叫"简洁"**。精简不只是减少 bug，也不只是降低维护成本——而是让 agent 有能力"一览无余地理解整个系统"。这是 AI 时代代码质量的新维度：不仅人类能读懂，AI 也要能读懂。

## 实践启示

1. **选框架先评估"agent 可读性"**：在评估一个训练框架是否适合 agent 使用时，先数一下它的代码行数——超过 agent 单上下文窗口容纳能力的框架，天然不适合 agent-native 工作流。PithTrain 的 1.1 万行是一个参考基准。

2. **Python-first + Triton 补性能是 agent-native 框架的最优技术路线**：纯 Python 保证全链路可读，Triton JIT 编译保证性能，两者兼顾。避免用 C++/Rust 扩展库，除非性能瓶颈确实无法用 Triton 解决。

3. **把人类经验知识写成 agent-playbook 是提升 agent 任务效率的最快路径**：在模型不变、任务不变的前提下，光靠把框架代码精简到 agent 能读完，轮数就能砍掉约 50%；再加上对应的 agent skill 触发，还能再砍 70%。两者叠加是最高效的优化组合。

4. **评估框架时同时测训练吞吐和 agent-task efficiency**：用固定 agent（如 Claude Code）+ 固定任务，每次只换底层框架，分别统计轮数、GPU 时间、token 消耗，才能得到完整的能力图谱。

5. **借鉴 GitHub Copilot 的 staleness 处理机制**：28 天自动过期 + just-in-time citation verification，是目前最强的"记忆过时处理"方案。设计 memory 系统时，staleness 处理必须作为一等公民来考虑，不能等到系统上线后再打补丁。

## 快速上手

```bash
git clone https://github.com/mlc-ai/pith-train && cd pith-train && uv sync
bash examples/build_tokenized_corpus/launch.sh dclm-qwen3
bash examples/pretrain_language_model/launch.sh qwen3-30b-a3b
```

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/pith-train-agent-native-moe.md)

---

## Ch16.007 刚刚DeepSeek开源推理神器DSpark，V4最高提速85%，连底层训练全家桶都开源了

> 📊 Level ⭐⭐ | 9.5KB | `entities/deepseek-dspark-v4-speculative-decoding-deepspec.md`

# 刚刚DeepSeek开源推理神器DSpark，V4最高提速85%，连底层训练全家桶都开源了

## 摘要

DeepSeek 开源了 DSpark V4 推理优化方法，同时发布完整的训练框架 DeepSpec。DSpark V4 采用**半自回归生成 + 置信度调度验证 + 异步零开销调度**的架构，在 DeepSeek V4 生产环境中实现了吞吐量和延迟提升最高 **85%**。DeepSpec 是配套的完整工具链，包含数据准备、草稿模型实现、训练代码和评估脚本，目前支持 DSpark、DFlash 和 Eagle3 三种推测解码算法。这一开源举措使社区能够完整复现和扩展推测解码技术，极大降低了推理优化门槛。

## 推测解码的技术背景

大型语言模型逐 token 生成的根本特性导致了推理阶段的核心瓶颈：**显存带宽受限，GPU 算力吃不饱**。推测解码（Speculative Decoding）的核心理念是使用一个小型的"草稿模型"先快速生成多个候选 token，然后由大模型并行验证这些 token 的正确性——全对就一次性输出，错了就从出错点重新计算。

然而传统方法存在两大硬伤：

1. **顺序草稿模型太慢**：串行生成草稿本身就消耗大量时间，拖累整体收益
2. **并行草稿模型质量差**：一次性生成所有草稿词虽然快，但词间无关联，越靠后的草稿被驳回概率越高

此外，在系统满载时，注定被废弃的草稿会白白抢占计算资源，导致整体吞吐量暴跌。

## DSpark V4 核心技术

### 半自回归生成 —— 两全其美的草稿策略

DSpark V4 的核心创新是将并行计算与串行依赖建模相结合：

- **主体并行框架**：保持并行计算的极致生成速度
- **轻量级串行依赖模块**：在 block 边界处添加一个极轻量的顺序处理单元，使草稿词之间建立上下文联系（前一个词预测"理所"，后一个词自然地生成"当然"），从而将长序列草稿的采纳率维持在较高水平

### 硬件感知的置信度调度验证

DSpark V4 引入了一个双层调度机制：内层给草稿模型装上一个"打分器"，预测每个草稿词的通过概率；外层实时监控系统的算力负载状态：

- **低负载时**：放行更多草稿词去验证，充分榨取空闲算力
- **高并发时**：冷酷地砍掉低分草稿词，确保有限计算资源只花在最有可能成功的 token 上

这套机制在不增加 GPU 的条件下，从系统层面拉高了整个推理服务的天花板。

### DeepSpec 全栈工具链

DeepSpec 是 DSpark V4 的配套开源代码库，包含完整的训练和评估管线：

- **数据准备**：训练草稿模型所需的数据处理和格式化工具
- **多种草稿模型实现**：内置三种推测解码算法（DSpark、DFlash、Eagle3）
- **训练代码**：完整的训练脚本，支持不同规模的草稿模型
- **评估脚本**：标准化的性能评估流程，可用于 benchmark 对比

[已有 DSpark 实体](https://github.com/QianJinGuo/wiki/blob/main/entities/deepseek-dspark-speculative-decoding-2026.md) 涵盖了 DSpark 的整体架构设计。

## 生产环境实战成绩

DSpark V4 在 DeepSeek V4 线上服务系统中的实测数据显示：

- **吞吐量与延迟提升**：在保持与老基线相同整体吞吐能力的前提下，每个用户的生成速度提升最高达 **85%**
- **高并发稳定性**：在极限高并发下，老系统因资源争抢崩溃掉速，DSpark 通过动态缩减验证长度稳住响应底线
- **兼容性**：在 Qwen 和 Gemma 等不同规模的模型上进行了验证，草稿采纳长度全面超越现有方案

## 深度分析

### 1. 从"算法优化"到"系统优化"的范式跃迁

DSpark V4 的最大贡献不在于提出了新的草稿模型架构，而在于它将推测解码从算法层面提升到了**系统层面**。置信度调度器同时考虑了"草稿质量"和"系统负载"两个维度——这实际上是一个横跨 ML 推理和系统调度的联合优化问题。这种跨层次的优化视角，与 [vLLM 等推理引擎](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-infra-llm-efficient-inference-vllm.md)的设计哲学一致：孤立地优化模型或孤立地优化系统都有天花板，真正的突破来自两者的协同设计。

### 2. 开源 DeepSpec 的战略意义

DeepSpec 的开源不仅仅是技术共享——它同时具有战略层面的多重意义：

- **生态锁定**：同时支持 DSpark、DFlash、Eagle3 三种算法，使 DeepSpec 成为推测解码领域的"标准工具链"候选
- **降低进入门槛**：社区开发者可以基于 DeepSpec 快速实验和对比不同的草稿模型方案，加速推理优化领域的创新
- **促进公平对比**：标准化的训练和评估脚本确保了不同算法之间在相同条件下的公平比较，推动领域从"论文指标对比"走向"可复现基准" 

这也呼应了 [LMSys DFlash](https://github.com/QianJinGuo/wiki/blob/main/entities/lmsys-dflash-speculative-decoding-2026-06.md) 和 [滴滴 Eagle3](https://github.com/QianJinGuo/wiki/blob/main/entities/didi-eagle-3-speculative-decoding-agents.md) 等推测解码工作中提到的"平台化"趋势——推测解码正在从单点技术创新走向系统化工具链交付。

### 3. 半自回归生成：平行与顺序的协调

半自回归生成的创新本质是在并行计算架构上叠加一个可控的顺序约束。这与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 中的"约束设计"思路有深刻的相似之处——不是在完全自由（纯并行）和完全约束（纯顺序）之间二选一，而是在最关键的"瓶颈点"施加最少的必要约束，以最小的代价换取最大的质量提升。DSpark 在 block 边界处添加的轻量顺序模块，正是这种"最小必要约束"思想的体现。

### 4. 对推理成本结构的影响

85% 的性能提升意味着在相同硬件条件下，推理吞吐量几乎翻倍。这对于 AI 推理成本结构有着深远影响——[推理的转变](https://github.com/QianJinGuo/wiki/blob/main/entities/the-inference-shift.md) 趋势中提到的"推理成本持续下降"将进一步由此类优化加速。DSpark V4 的成本含义非常直接：**无需新增任何 GPU，即可使现有推理服务的用户感知性能提升接近一倍**。对于大规模部署场景，这意味着每年数百万美元的 GPU 成本节省。

## 实践启示

1. **推理优化应同时关注算法和系统维度**：纯算法层面的优化很快会遇到边际递减。DSpark V4 的经验是：在优化草稿模型质量的同时，同样需要优化"什么时候验证、验证多少"的系统调度策略。软硬协同、模型与系统协同是推理优化下半场的核心方法论。

2. **开源工具链可以成为技术标准**：DeepSpec 同时支持三种主流推测解码算法，为公平对比和快速实验提供了基础设施。如果你的团队正在研究或部署推测解码，DeepSpec 应作为首选参考实现。

3. **在推理瓶颈处考虑"半自回归"模式**：当遇到"串行太慢、并行太差"的经典困境时，DSpark 的"主体并行 + 关键点串行"模式是一个可复用的设计模式——在保证吞吐的同时，在关键决策点恢复 token 间依赖。

4. **高并发场景更需要推理优化**：DSpark V4 在高并发下的表现尤其突出——动态缩减验证长度避免了系统过载崩盘。任何面向大量用户的生产级部署都应考虑在推理栈中加入类似的动态负载感知机制，而不是对所有请求一视同仁。

## 相关实体

- [DeepSeek DSpark 推测性解码工程落地](https://github.com/QianJinGuo/wiki/blob/main/entities/deepseek-dspark-speculative-decoding-2026.md)
- [DeepSeek V4 模型总览](https://github.com/QianJinGuo/wiki/blob/main/entities/deepseek-v4.md)
- [DeepSeek V4 Flash/Pro 推理新纪元](https://github.com/QianJinGuo/wiki/blob/main/entities/deepseek-v4-flash-pro-通往百万级上下文与万亿参数推理的新纪元.md)
- [滴滴 Eagle3 推测解码](https://github.com/QianJinGuo/wiki/blob/main/entities/didi-eagle-3-speculative-decoding-agents.md)
- [LMSys DFlash 推测解码](https://github.com/QianJinGuo/wiki/blob/main/entities/lmsys-dflash-speculative-decoding-2026-06.md)
- [推理的转变 — 推理经济变迁](https://github.com/QianJinGuo/wiki/blob/main/entities/the-inference-shift.md)
- [vLLM 高效推理基础设施](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-infra-llm-efficient-inference-vllm.md)
- [GLM-5 推理 Scaling Pain](https://github.com/QianJinGuo/wiki/blob/main/entities/glm5-scaling-pain-inference.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/刚刚deepseek开源推理神器dsparkv4最高提速85连底层训练全家桶都开源了.md)

---

## Ch16.008 具身智能 Sim-to-Real 迁移：主动推理、行为树与内在动机引擎的工程化方案

> 📊 Level ⭐⭐ | 9.1KB | `entities/embodied-intelligence-sim-to-real-active-inference-behavior-tree-intrinsic-motivation-chenzhiyan-2026-06-17.md`

# 具身智能 Sim-to-Real 迁移：主动推理、行为树与内在动机引擎的工程化方案

## 摘要

数据派THU 陈之炎的系统性教程，拆解具身智能机器人 Sim-to-Real 迁移的三大核心技术：主动推理开源库（pymdp/spm）的 ROS2 集成、感控闭环的模块化行为树模板、内在动机引擎开发套件。每项技术均含环境安装、核心架构、代码模板、参数调优、工业避坑指南，面向工程化落地。

## 深度分析

### 1. 主动推理（Active Inference）的 ROS2 集成

**核心框架**：主动推理通过最小化预测误差实现感知-行动闭环，相比传统强化学习更符合生物智能机制，具备更强的环境适应性和抗干扰能力。

**pymdp vs spm 对比**：

| 维度 | pymdp | spm |
|------|-------|-----|
| 语言 | Python | C++（支持 Python 绑定） |
| 场景 | 快速原型、算法验证 | 工程化部署、实时控制 |
| 性能 | 轻量、≤100Hz | 高性能、≤1ms 推理延迟、1000Hz 控制 |
| ROS2 | 原生 Python 接口 | C++ 生命周期节点、DDS 通信 |
| 社区 | 活跃、文档完善 | 工业级支持、稳定性强 |

**pymdp 集成架构**（单节点模式）：感知层（ROS2 订阅传感器）→ 主动推理核心（变分推断更新信念状态）→ 执行层（ROS2 发布控制指令）。

**spm 集成架构**（生命周期节点模式）：遵循 ROS2 生命周期规范（配置→激活→运行→停用→清理），支持多模态感知融合、微秒级实时主动推理、DDS 可靠传输（≤10ms）。

**避坑要点**：pymdp 需离散化连续空间、ROS2 回调需加锁防数据竞争；spm 需 Release 模式编译（Debug 性能降 50%+）、DDS 需配置实时优先级；通用：偏好矩阵 C 合理设计、信念更新频率匹配传感器采样频率、复杂场景需分层主动推理。

### 2. 感控闭环的模块化行为树（Behavior Tree）

**为什么不用 FSM**：传统有限状态机存在状态爆炸、耦合度高、可维护性差等问题。行为树通过模块化、层次化、可复用、可中断、可回溯的特性，完美适配具身智能"感知→决策→执行→反馈"闭环。

**BT.CPP + ROS2 工业级框架**：基于 C++ 的高性能开源行为树库，原生支持 ROS2，提供可视化编辑器、动态加载、节点复用。

**五大核心模块**（跨任务、跨机器人复用）：
- **感知模块**：CheckObstacle、DetectTarget、GetPose、ForceFeedback
- **决策模块**：PlanPath、GraspPlan、TaskSwitch
- **执行模块**：MoveToTarget、GraspObject、PlaceObject、StopRobot
- **反馈模块**：CheckArrival、CheckGrasp、CheckSafety
- **异常处理模块**：AvoidObstacle、RetryGrasp、EmergencyStop、ReturnHome

**工程化最佳实践**：每个节点单一职责、所有执行节点加超时机制、关键任务加重试、安全节点优先级最高、高频节点控制 10-50Hz、行为树层级 ≤5 层。XML 定义行为树结构，无需修改代码即可调整逻辑，支持可视化调试（bt_viewer），调试效率提升 50%+。

### 3. 内在动机引擎开发套件

**核心定义**：环境感知→预测模型→奖励计算→策略优化的闭环，基于好奇心/新颖性/预测误差生成内在奖励，驱动机器人自主探索学习。

**主流算法对比**：

| 算法 | 核心机制 | 优势 | 劣势 | 适用场景 |
|------|---------|------|------|---------|
| 好奇心驱动（ICM） | 预测误差作奖励 | 简单稳定 | 易陷入随机噪声 | 结构化环境 |
| 新颖性驱动（RND） | 状态访问次数 | 探索效率高 | 计算量大 | 复杂未知环境 |
| 技能熟练度驱动 | 技能掌握程度 | 渐进式学习 | 收敛慢 | 长期自主学习 |
| 信息增益驱动（VIME） | 贝叶斯信息增益 | 理论完备 | 实现复杂 | 研究级 |

**工程首选**：好奇心驱动 + 技能熟练度驱动融合算法，兼顾稳定性与探索效率。

**五大核心模块**（ROS2 + PyTorch，开箱即用）：数据采集→特征编码（轻量化 CNN）→内在奖励计算→策略学习（PPO，轻量化适配嵌入式）→行为联动（与行为树感控闭环对接）。

**与行为树联动**：内在动机引擎输出内在奖励 → 行为树动态调整任务优先级 → 机器人自主切换探索/执行任务。高内在奖励触发自主探索，低内在奖励触发预设任务，异常状态触发感控闭环异常处理。

### 4. 分机器人参数调优方案

| 机器人类型 | 好奇心权重 | 熟练度权重 | 学习率 | 特殊配置 |
|-----------|-----------|-----------|-------|---------|
| 机械臂/抓取 | 0.5 | 0.5 | 5e-4 | 禁止过高探索，避免碰撞 |
| 移动机器人 | 0.8 | 0.2 | — | 探索半径 0.2m |
| 人形机器人 | 0.7-0.9 | — | — | 特征维度 64，执行频率 20Hz |

**调优判断标准**：内在奖励 0.3-0.8 为优秀（主动探索+高效执行）；>1.0 为过探索（乱动不执行任务）；<0.1 为欠探索（僵化不适应新环境）。

**安全约束**：探索范围硬限制（不突破机械臂限位）、优先级机制（安全节点 > 内在动机探索 > 常规任务）、奖励截断（设置上限防疯狂探索）。

**部署流程**：仿真调试（Gazebo）→ 参数调优 → 实体机部署 → 与行为树联动 → 现场迭代。

## 实践启示

1. **主动推理是具身智能的理论基石**：pymdp 适合快速验证，spm 适合工业部署，两者互补覆盖从科研到产品的全链路。
2. **行为树替代 FSM 是工程化必然**：XML 定义逻辑、可视化调试、节点跨项目复用，将感控闭环开发从"写代码"变为"搭积木"。
3. **内在动机引擎实现"被动执行+主动探索"双模式**：与行为树深度联动，8 个核心参数即可完成全品类机器人适配。

## 相关页面

- [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/embodied-intelligence-sim-to-real-active-inference-behavior-tree-intrinsic-motivation-chenzhiyan-2026-06-17.md)

---

## Ch16.009 How to Calculate the Inference Efficiency Ratio

> 📊 Level ⭐⭐ | 8.1KB | `entities/how-to-calculate-the-inference-efficiency-ratio.md`

## 深度分析
**IER 的本质是将 AI 推理成本从"基础设施黑箱"中剥离出来，成为独立可追踪的 COGS 维度。** 文章的核心贡献是提出了 Inference Efficiency Ratio（IER = AI 产品收入 ÷ 推理成本）这一指标，并将其定位为 SaaS 财务框架第六支柱（AI Economics）的锚点指标。 传统 SaaS COGS 主要由固定成本构成（服务器、带宽、人力），而 AI inference cost 是纯usage-driven 的变量成本，其规模随产品功能扩展而非线性增长——这个本质差异是现有 gross margin 分析框架失效的根源。
**AI-native 与 AI-infused 的业务模型划分决定了 IER 基准的根本差异，不可混用。** 文章明确指出：AI-infused（AI 是附加功能，客户为底层工作流付费）需要 10:1 以上的健康 IER 才能保持与传统 SaaS 可比的毛利率；AI-native（AI 是核心产品，价值交付本身就是推理过程）接受低至 5:1 的健康 IER，因为 inference cost 本身就是商业模式的一部分。 混淆这两个模型会导致定价策略错位：AI-infused 产品若采用 AI-native 的成本容忍度，会持续侵蚀已有毛利率；而 AI-native 产品若强制追求 AI-infused 的 IER 基准，可能因过度压缩 inference 质量而丧失产品竞争力。
**Agentic 工作流正在系统性推高单位任务的 token 消耗量，可能抵消 per-token 定价下降的收益。** 文章指出了一个反直觉的现象：2023 年以来，虽然模型层面的 per-token 定价持续下降，但 agentic 架构（多步骤工具调用、长对话历史、海量 context window）的普及使每个任务消耗的 token 总量大幅上升，部分公司的 AI 成本反而在上升而非下降。 这意味着不能简单依赖"市场定价会自然解决效率问题"的假设——IER 的改善必须来自产品层面的主动优化（模型路由、prompt caching、usage-tiered pricing），而非被动等待上游降价。
**P95 用户成本是 IER 失真的最大隐藏来源。** 文章揭示了一个典型的 CFO 盲区：平均值看起来健康的 IER，可能被 top 5% 的 power user 严重拉低——这些用户拥有巨大的 context window、重度工具调用和超长对话历史，其单用户 inference cost 是普通用户的 10-100 倍。 没有 customer-level 和 percentile-level 的 cost tracking，根本无法识别这个风险集中点。这是"blended metrics"欺骗性的典型案例。
**IER 与 gross margin 的关系是因果而非平行：IER 是领先指标，gross margin 是滞后结果。** 文章明确了两者的分工：gross margin 告诉你"整体结果是什么"（所有 COGS 扣除后的剩余），IER 告诉你"增长最快的成本驱动因素效率如何"。 当 gross margin 下降时，IER 可以快速定位是否是 inference cost 导致；当 IER 改善但 gross margin 不变，说明 COGS 中有其他因素在吞噬利润。这个因果链条使得 IER 成为 CFO 日常监控仪表盘的必要组成，而非年底回顾时才看的指标。
**定价架构与 inference cost 的脱节是 AI-infused 产品的结构性风险。** 如果重度 AI 用户与轻度用户支付相同的 flat subscription 费用，公司实际上在补贴 power user 的 inference cost。Usage-tiered 或 outcome-based 定价是唯一可持续的解决方案，但实施的前提是能够以 customer-level 和 feature-level 追踪 inference cost——否则根本没有数据支撑定价改革。
**从 ICONIQ 和 Bessemer 的数据来看，AI 产品毛利率从 41%（2024）提升到 52%（2026 预测）的驱动因素是 operator 学会了管理 inference cost，而非模型定价自然下降。** 这验证了 IER 作为运营指标的实践价值：行业毛利率提升的来源是每一家公司 individually 优化 IER 的结果，而非市场整体趋势的自动馈赠。

## 实践启示
**1. 立即将 AI Inference Cost 设为独立 COGS 科目，从 blended infrastructure costs 中剥离出来。** 这是实施 IER 的第一步，也是最难的一步——大多数公司现有的 cost tracking 将 AI API 费用混入"第三方 API"或"基础设施"科目。独立列账本身就是一个强制函数，暴露了数据采集的盲区。
**2. 用 IER 公式（AI 产品收入 ÷ inference 成本）计算公司当前的 IER，优先在 customer-level 和 feature-level 拆分。** Blended IER 告诉你是否有问题，customer-level IER 告诉你问题在哪里。如果 top 5% 的账户占据了 50% 以上的 inference cost，这些账户的 pricing 漏洞就是最优先的修复项。
**3. 确认公司属于 AI-infused 还是 AI-native，这是选择 IER 基准的前提。** 判断标准：如果移除所有 AI 功能，公司是否仍能产生有意义的收入？若答案为是，则适用 AI-infused 基准（健康值 10:1 以上）；若答案为否，则为 AI-native（健康值 5:1 以上）。大多数向现有 SaaS 产品添加 AI 功能的成熟公司属于前者。
**4. 将 IER 设立为新 AI 功能发布的前置门槛——任何将 IER 拉低至 floor 以下的功能发布，需要同时提交 mitigation plan（模型替换方案、usage limits、定价调整）。** 这个机制类似于传统软件时代的重大产品线发布审批流程，目的是在 feature 砍不动 gross margin 之前就识别风险，而非之后。
**5. 模型路由是改善 IER 性价比最高的工程投入：简单任务走小模型，复杂任务才调用大模型。** Acme SaaS 的案例中，通过模型路由（轻量级 Sonnet 处理简单任务，Opus 保留给复杂任务）将 inference cost 从 $95K 降至 $52K，IER 从 4.4:1 提升至 8:1——这个改善不需要改变定价或用户体验，纯工程优化。
**6. 建立 P50 和 P95 两套 IER 追踪体系。** P50 IER 反映典型用户体验对应的效率水平；P95 IER 反映 tail user 带来的成本压力。如果两者差距过大（例如 P50 IER 12:1 但 P95 IER 仅 3:1），说明 pricing model 没有正确覆盖 tail cost，需要重新设计 usage tiering。
**7. 不要假设推理成本会自然下降——建立 IER 的月度 trend 追踪。** Agentic 功能的引入往往会导致 token 消耗量 per task 显著上升，与 per-token 定价下降形成对冲。主动追踪 IER trend（上升/下降/平稳）比关注绝对值更重要，因为趋势决定了是否需要立即采取行动。
→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/how-to-calculate-the-inference-efficiency-ratio.md)

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/queries/ai-model-research-latest-directions.md)

- [How Superset built the IDE for AI agents on Vercel](https://github.com/QianJinGuo/wiki/blob/main/entities/vercel-com-how-superset-built-the-ide-for-ai-agents-on-vercel.md)
- [What Is Urban Density Design? A Clear Guide to How Cities Get Built Denser](https://github.com/QianJinGuo/wiki/blob/main/entities/what-is-urban-density-design-a-clear-guide.md)
- [Toto 2.0: Time series forecasting enters the scaling era](https://github.com/QianJinGuo/wiki/blob/main/entities/toto-2.md)

---

## Ch16.010 Disaggregated Prefill and Decode for LLM Inference on SageMaker HyperPod

> 📊 Level ⭐⭐ | 6.1KB | `entities/disaggregated-prefill-decode-llm-inference-sagemaker.md`

# Disaggregated Prefill and Decode for LLM Inference on SageMaker HyperPod

AWS 在 SageMaker HyperPod 上实现了 Disaggregated Prefill and Decode（DPD），将 LLM 推理的 prefill（计算密集型）和 decode（内存密集型）阶段分离到不同的 GPU 池，通过 Elastic Fabric Adapter（EFA）与 RDMA 互联。

## 技术原理

当 prefill 和 decode 共享 GPU 时，长 prompt 会阻塞所有并发请求的 token 生成。DPD 通过拆分两个阶段到独立 GPU 池来消除干扰，可为每阶段分配不同的并行策略，独立调优首 token 时延（TTFT）和 token 间时延（ITL），更可靠地控制尾部时延。

## 与 vLLM 集成

在 SageMaker HyperPod 上使用 HyperPod Inference Operator 部署 vLLM，实现多节点编排和路由优化。适用于大规模 LLM 部署场景。

## 深度分析

### 1. DPD 的适用边界与路由决策

DPD 并非适用于所有场景 — 其核心收益集中在长上下文、高并发、流式响应的推理负载上。AWS 的实现通过一个智能路由器（Intelligent Router）对每个请求做条件路由：当输入 token 数超过可配置阈值（默认 4,096）时走拆分解码路径，短请求则直接发送到 decoder 避免 KV 缓存跨节点传输的开销。 这种设计保证了短请求不会因为拆分的固定开销而受损，而长请求能够获得稳定的 token 间延迟。在请求低于 4,096 token 的场景下，拆分的 KV 传输开销超过了隔离收益，路由器自动绕过 prefiller。

### 2. 四层 KV 传输栈与硬件依赖

DPD 的核心技术挑战是如何高效地在 prefiller 和 decoder 之间传递 KV 缓存。AWS 的解决方案是构建了一个四层传输栈：LMCache PD → NIXL → libfabric → EFA。 LMCache 负责 orchestrator 层的缓存管理，NIXL 提供跨 GPU、CPU 和远程 peer 的统一内存抽象，libfabric 暴露 EFA 的内核旁路 GPU-Direct RDMA 能力。实测在 ml.p5.48xlarge（8×H100 80GB，3,200 Gbps EFA）上，8,000 token 的 KV 传输仅需个位数毫秒。 这意味着 KV 传输开销相对于 prefill 计算时间几乎可以忽略。

### 3. 性能基准与收益量化

Benchmark 数据揭示了 DPD 在不同并发度下的具体收益。 在 4,096 输入 token、256 输出 token 的标准负载下：
- **Per-token 延迟（TPOT）**：并发度从 8 增至 32 时，H100 上改善 22%→66%，H200 上改善 28%→48%
- **吞吐量**：H100 上提升最高 35%，H200 上最高 64%
- **端到端 P50 延迟**：H100 改善 14-32%，H200 改善 29-41%

TPOT 随并发度保持稳定的原因是 decoder 不再受 prefill 干扰 — decoder 运行完整的 CUDA graph，不会因为突然插入的 prefill 计算而打断 token 的流式生成。 代价是首 token 延迟（TTFT）有小幅增加，因为 KV 缓存传输增加了固定的延迟开销。

### 4. 弹性扩缩与部署形态

DPD 当前支持单个 decoder replica 搭配多个 prefiller replica 的拓扑。 推荐起始比例为 1:1（prefiller:decoder），当 TTFT 攀升而 TPOT 稳定时说明 prefill 成为瓶颈，可扩展至 2:1 或 3:1。多 prefiller 场景下支持四种路由策略：`prefixaware`、`kvaware`、`session`、`roundrobin`，其中 `kvaware` 对重复前缀（系统提示词、多轮历史）的缓存命中率最优。

### 5. 对推理基础设施设计的启示

DPD 架构正在改变推理基础设施的设计范式。传统"单节点尽可能多塞模型"的思路被"为不同阶段分配差异化资源"的范式取代。Prefill 节点需要高计算密度（NVLink + 高带宽显存），decode 节点需要高内存带宽（HBM3/HBM3e）和低延迟互联。考虑到 P5/P6 实例系列的 EFA RDMA 要求，同一可用区内部署的约束意味着实际部署需要仔细规划集群拓扑。

## 实践启示

1. **优先评估工作负载特征**：DPS 并非通用方案。当平均输入 token 数低于 4,096、并发度不高或非流式场景时，colocated 方案更简单、成本更低。上线前应使用实际负载（而非合成 benchmark）评估拆分阈值和路由比例。

2. **从 1:1 比例起步，监控双指标**：建议从 1:1 prefiller:decoder 起步，同时监控 TTFT 和 TPOT 两个指标。TTFT 升高 → 增加 prefiller；TPOT 升高 → 检查 decoder 饱和度、增加 PD_BUFFER_SIZE 或降低 max-model-len。

3. **利用 KV-aware 路由优化缓存效率**：对于有重复前缀负载（如多轮对话、RAG 系统提示），启用 `kvaware` 路由策略可显著提升 L1 CPU 缓存命中率，降低 TTFT。

4. **警惕 EFA 网络约束**：所有 DPD 节点必须在同一可用区，且依赖 RDMA-capable EFA。P5/P6 实例系列之外的选择（如 G6/G6e/G7e）在 multi-GPU 场景下受 PCIe 瓶颈限制，不适合 DPD 部署。

5. **观测指标先行**：部署前确保 HyperPod Observability 已启用。重点关注 router 日志中的 `disaggregate=True/False` 分布、`prefill time (TTFT)` 和 `to decoder` 时间戳，这些是诊断拆分行为正确性的第一手数据。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/disaggregated-prefill-and-decode-for-llm-inference-on-sagema.md)

---

## Ch16.011 Unlocking asynchronicity in continuous batching

> 📊 Level ⭐⭐ | 4.9KB | `entities/continuous-async.md`

> 来源：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/continuous-async.md)

## 核心要点
- HuggingFace 深度技术文章，解析连续批处理的异步优化
- 核心问题：同步批处理中 CPU 和 GPU 交替等待，造成近 24% 的 GPU 空闲时间
- 解决方案：使用 CUDA streams 和 events 实现 CPU/GPU 并行执行
- 实验结果：GPU 利用率从 76% 提升至 99.4%，生成速度提升 22%

## 深度分析
### 同步批处理的本质缺陷
连续批处理（Continuous Batching）通过动态打包请求显著提升了 GPU 利用率，但它默认是同步的——CPU 准备新批次时 GPU 空闲，GPU 计算时 CPU 等待。在高频推理场景下（每秒数百步），这些空闲间隙累积成显著的效率损失。
HuggingFace 的实验数据揭示了这一问题的严重性：生成 8K tokens、batch size 32、8B 模型，总时间 300.6 秒，其中 24% 时间为空闲 GPU。这意味着如果能消除 CPU 开销，理论上可获得 24% 的免费加速——无需任何新 kernel 或模型修改。

### CUDA Streams 的并发机制
CUDA streams 是理解异步批处理的关键。每个 stream 是 GPU 操作的顺序队列，同一 stream 内操作串行，不同 stream 可并发。通过将 H2D 传输（Host-to-Device）、计算、D2H 传输（Device-to-Host）分配到独立 stream，可实现数据传输与计算的重叠。
但这里存在一个问题：非默认 stream 不会自动等待其他 stream 的操作完成——需要显式同步。

### CUDA Events 的同步语义
CUDA event 是一个标记，可记录到 stream 中，当 GPU 执行到该点时标记为完成。通过 `stream.wait(event)` 可让一个 stream 阻塞直到某个 event 被设置，而 CPU 端调用立即返回。这种纯 GPU 侧的同步机制，使得 CPU 可以真正"放手"，让硬件自行管理依赖关系。

### 双 buffer 槽位设计
异步批处理需要在 GPU 处理 batch N 时准备 batch N+1 的输入。这引发两个技术挑战：
1. **数据竞争**：batch N 和 batch N+1 不能共享同一内存区域，否则 GPU 可能读到部分覆写的数据。解决方案是使用两个独立的内存槽位（slot A 和 slot B），交替使用。
2. **CUDA Graphs 兼容性**：生产环境常使用 CUDA Graphs 加速，但每个 graph 绑定特定内存地址。双 memory pool 方案允许多个 graph 共享池化内存，总 VRAM 接近单个 graph 的使用量。

### Carry-over 机制
请求通常跨越多个 batch。当 batch N 产生新 token 时，该 token 需要作为 batch N+1 的输入。但由于 batch N 仍在计算，这个 token 还不存在。解决方案是使用占位符（placeholder）构建 batch N+1 输入，在 batch N 完成后通过 "carry-over" 将实际 token 填充进去。这四个操作（选择、置零、截断、相加）足够轻量，可被 CUDA Graph 捕获。

## 实践启示
1. **推理优化应关注 CPU/GPU 协同**：对于 LLM 推理工作负载，CPU 端调度开销常被忽视。即使 GPU 计算能力充足，CPU 侧的批次准备可能成为瓶颈。HuggingFace 的方法展示了如何通过异步化将 CPU 和 GPU 利用率同时最大化。
2. **使用非默认 CUDA Stream 避免隐式同步**：在 PyTorch 中显式使用非默认 stream 处理异步操作，可避免默认 stream 的全局同步阻塞效应。但要注意：任何传输操作都必须是非阻塞的（`torch.cuda.Stream` + 适当的流管理）。
3. **双 buffer 槽位是异步推理的标准模式**：任何需要"一边执行一边准备"的场景，都应考虑双缓冲。空间换时间的 tradeoff 在 GPU 内存充足时通常是值得的。
4. **CUDA Graphs 仍是延迟优化的关键**：异步批处理提升了吞吐量，但 CUDA Graphs 对单批次延迟的优化不应被放弃。通过 memory pool 可在保持 Graphs 优化效果的同时支持多 batch 并行。
5. **实践建议**：如果你的 LLM 推理服务吞吐量不达预期，在优化模型或硬件之前，先用 profiling 工具（如 HuggingFace 提供的脚本）确认是否存在 CPU-GPU 交替空闲问题。22% 的加速可能是免费午餐。
## 相关实体
- [Continuousasync](https://github.com/QianJinGuo/wiki/blob/main/entities/continuousasync.md)
- [Gemma 4 Multi Token Prediction Drafters](https://github.com/QianJinGuo/wiki/blob/main/entities/gemma-4-multi-token-prediction-drafters.md)
- [How To Calculate The Inference Efficiency Ratio](https://github.com/QianJinGuo/wiki/blob/main/entities/how-to-calculate-the-inference-efficiency-ratio.md)
- [Introducing The Ettin Reranker Family](https://github.com/QianJinGuo/wiki/blob/main/entities/introducing-the-ettin-reranker-family.md)
- [Lightseek Tokenspeed](https://github.com/QianJinGuo/wiki/blob/main/entities/lightseek-tokenspeed.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/nvidia-gpu-acceleration.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/continuous-async.md)

---

## Ch16.012 SGLang

> 📊 Level ⭐⭐ | 4.5KB | `entities/sglang.md`

## 概述
SGLang 是一个开源的大语言模型推理服务框架，由 UC Berkeley、CMU、 Stability AI 等机构联合开发（LMSYS 团队主导）。本次 GLM-5 的 BugFix #2（HiCache 加载时序修复）已通过 Pull Request #22811 提交至 SGLang 社区。

## 核心贡献
- **LayerSplit**：智谱提出的 KV Cache 分层存储方案，针对 Coding Agent 长上下文、高 Prefix Cache 命中率场景，通过每张 GPU 仅持有部分层的 KV Cache，显著降低单卡显存占用
- **HiCache**：多级 KV Cache 优化，通过 Load Stream 与 Forward Stream 重叠执行提高吞吐

## 深度分析
SGLang作为UC Berkeley/CMU/Stability AI联合开发的LLM推理框架，其核心价值在于为长上下文、高吞吐量场景提供生产级的KV Cache分层优化方案，与vLLM形成互补而非替代关系。
**1. LayerSplit（智谱提出）的核心洞察是：Coding Agent场景下，Prefix Cache的命中率在工具调用和系统提示词中天然很高，但不同层对KV Cache的需求强度不同。** 传统方案让每张GPU持有完整的所有层的KV Cache，导致显存浪费。LayerSplit的解法是让每张GPU仅持有部分层的KV Cache（如GPU0持有1-32层、GPU1持有33-64层），推理时按需召唤缺失层的计算结果。这本质上是模型并行与KV Cache复用的联合优化——在Coding Agent场景下，由于工具调用模式的高度重复性，跨层复用效果显著。
**2. HiCache的多级KV Cache策略是SGLang在高并发推理场景下的关键差异化能力。** Load Stream（前缀加载）与Forward Stream（实际推理）重叠执行，使得前缀复用不阻塞推理吞吐。这对多用户并发的Agent系统特别重要——每个用户的工具调用历史构成前缀，多用户前缀的并发加载不会形成瓶颈。
**3. SGLang与vLLM的关系是互补而非竞争。** vLLM的核心优势在于PagedAttention的显存管理和连续批处理，适合高吞吐的单请求场景；SGLang在需要复杂状态管理（多轮对话、工具调用链）、长上下文Prefix Cache复用、多级调度的工作流场景中更具优势。实际部署中，两者经常共存于同一系统的不同时刻（vLLM处理突发请求、SGLang处理复杂Agent工作流）。

## 实践启示
**对于LLM推理架构师：** 在设计推理系统时，不要默认vLLM是唯一选择。对于Agent工作流系统（SWE Agent、多轮对话、复杂工具调用链），SGLang的分层KV Cache和前缀复用能力可能带来显著的性能收益。建议用真实工作流trace评估两者在实际场景下的端到端延迟和显存利用率。
**对于Coding Agent开发者：** Coding Agent场景天然适合LayerSplit策略——因为工具调用的系统提示词和工具Schema高度重复，且代码补全任务的上下文窗口通常很大。按层分配KV Cache可以让单卡容纳更大的上下文，显著降低多卡推理的显存占用。
**对于云厂商和大模型团队：** HiCache的Load Stream/Forward Stream重叠设计可以与模型并行策略深度结合——在多模态推理（Visual Encoder + LLM）或MoE架构中，前缀加载与推理的重叠效果可能更加显著，因为这些场景的初始化开销更大。

## 相关页面
[GLM-5 Scaling Pain 推理复盘](https://github.com/QianJinGuo/wiki/blob/main/entities/glm5-scaling-pain.md) — 包含 HiCache BugFix #2 的详细分析
- [基于SGLang的大模型推理部署实践](https://github.com/QianJinGuo/wiki/blob/main/entities/sglang-inference-deployment-practice-benchmark-tuning.md) — Benchmark 方法论、部署方案选型与调优实战指南

---

## Ch16.013 End-to-end encrypted ML inference with Amazon SageMaker AI and FHE

> 📊 Level ⭐⭐ | 3.3KB | `entities/end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-a.md`

# End-to-end encrypted ML inference with Amazon SageMaker AI and FHE

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-a.md)

## 深度分析

End-to-end encrypted ML inference with Amazon SageMaker AI and FHE 涉及apple领域的核心技术议题。基于原文内容的深入分析：

### 核心观点

1. # End-to-end encrypted ML inference with Amazon SageMaker AI and FHE
2. Machine learning (ML) inference often requires processing sensitive data—medical records, proprietary business information, or personal communications
3. FHE is a form of encryption that allows encrypted data to be processed in encrypted form without decryption
4. * **Healthcare** : A health insurance company wants to provide doctors with an ML model that predicts medical procedure outcomes based on diagnostic data

### 内容结构

- End-to-end encrypted ML inference with Amazon SageMaker AI and FHE
- Solution overview
- Prerequisites
- Training
- Build and deploy the training container
- Verify that the container is available

### 技术要点

本文在apple方向提供以下关键技术洞察：

- **技术架构**: 基于apple的设计理念和实现路径
- **工程挑战**: 实际落地中面临的关键问题和解决思路
- **行业趋势**: 该领域的发展方向和新兴范式

### 与现有知识体系的关联

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](https://github.com/QianJinGuo/wiki/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏.md)
- [你不知道的 Agent原理架构与工程实践 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/你不知道的-agent原理架构与工程实践-v2.md)

## 实践启示

1. **工程落地**: 将apple领域的理论转化为可执行方案时，需关注可观测性和可维护性
2. **技术选型**: 根据实际场景需求选择合适的技术栈，避免过度工程化
3. **持续迭代**: 建立反馈闭环，通过数据驱动的方式持续优化系统表现
4. **风险管控**: 在引入新技术时，充分评估其对现有系统稳定性的影响

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/data-infrastructure.md)

---

## Ch16.014 全球首个小时级世界模型来了！中国造，已开源

> 📊 Level ⭐⭐ | 2.7KB | `entities/全球首个小时级世界模型来了中国造已开源.md`

# 全球首个小时级世界模型来了！中国造，已开源

> **LingBot-World 2.0** 是由蚂蚁灵波团队推出的全新一代实时交互世界模型，全球首个支持小时级时长实时生成的视频世界模型。该模型在 720p 分辨率下稳定跑出 60fps，并引入 Agentic Harness「大脑-小脑」双Agent架构，让 AI 世界具备自主演化的能力。

LingBot-World 2.0 最核心的突破在于解决了「长时漂移」顽疾。此前视频世界模型只要时间轴一拉长，物体就开始扭曲、细节塌陷、场景结构崩坏。2.0 版本通过一套「教师-学生」两阶段设计——先训练一个能长时间稳定的因果世界模型作为教师，再用一致性蒸馏和分布匹配蒸馏压缩出学生模型——实现了长达一小时、跨越 20 个不同场景的画质无衰减生成。

## 核心技术亮点

**交互维度大幅扩展。** 在 1.0 版本仅支持 WASD 移动的基础上，2.0 加入了攻击、施法、射击等复杂交互，并支持文本驱动的事件注入——用户可以通过打字直接改写世界规则，如输入「变成冰窟」即可将场景从岩洞冻结为极寒秘境。

**Agentic Harness 双Agent架构。** 模型内置了 Pilot Agent（负责规划和执行角色行为）和 Director Agent（基于世界状态实时生成并注入新事件与环境元素），让世界拥有自主性。即使用户不操作，世界也会自己往前演化——天气会变，角色会动，新的事件会不请自来。

**因果架构设计。** 2.0 把世界模拟形式化为沿时间轴的因果生成过程，每一个状态只依赖历史上下文与当前输入。团队设计了 MoBA（双向与自回归混合）注意力掩码，在保证因果性的同时为模型补上全局视野以抑制长序列过拟合。这种结构性抗漂移能力使模型在长达一小时的连续生成中保持画质稳定。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/全球首个小时级世界模型来了中国造已开源.md)

---

## Ch16.015 小米多篇论文入选 ECCV 2026 — 人脸修复、视频大模型推理加速

> 📊 Level ⭐⭐⭐ | 12.5KB | `entities/xiaomi-eccv-2026-face-restoration-video-llm-inference.md`

# 小米多篇论文入选 ECCV 2026 — 人脸修复、视频大模型推理加速

> 小米 AI 团队与自动驾驶团队共有 12 篇论文入选 ECCV 2026（录用率约 27.5%），覆盖人脸视频修复、GUI Agent、端到端图像翻译、多模态检索、流式视频推理、图像美学评估，以及自动驾驶世界模型、VLA 决策、安全规划等多个方向。这些工作系统性地展示了小米在视觉理解、多模态交互、智能体能力和自动驾驶等基础能力建设上的技术积累。

## 摘要

小米团队在 ECCV 2026 上发表了 12 篇论文，涵盖三大方向：视觉理解与生成（人脸视频修复、图像美学评估、流式视频推理）、大模型应用（GUI Agent 动作评判、端到端图像翻译、多模态检索）、自动驾驶（因果世界模型、VLA 决策、安全规划）。其中 TIGER 人脸视频修复方法采用结构化三先验融合框架实现单步推理修复；VST 提出"边看边想"的流式视频理解范式，响应速度提升 15.7 倍；GAIA 构建了 GUI Agent 数据飞轮，任务成功率最高提升超过 10%。

## 核心要点

- **TIGER**：结构化三先验融合（身份、几何、生成先验）实现单步 Rectified Flow 人脸视频修复，身份保持和时序稳定性领先
- **VST（Video Streaming Thinking）**：流式视频理解范式中模型边看边思考，响应速度提升 15.7 倍
- **RED-Aes**：相对美学差异学习替代传统绝对打分，2B 轻量版超越所有现有基线
- **GAIA**：基于数据飞轮的 GUI Agent Critic 模型训练框架，任务成功率提升超 10%
- **CausalDrive**：实时因果世界模型（12 FPS），将自动驾驶世界模型从"视频生成"推向"社会交互模拟"
- **MindDrive**：采用离散语言空间中的在线强化学习，为驾驶模型部署后持续进化开辟路径

## 方向一：视觉理解与生成

### TIGER：结构化三先验融合的人脸视频修复

人脸视频修复是视频恢复中最具挑战性的任务之一，需同时解决模糊/噪声/伪影去除、身份保持、表情姿态自然、时序稳定等多重约束。TIGER 提出了结构化三先验融合框架：

1. **Identity 先验**：利用参考图像提取稳定的身份嵌入
2. **Geometry 先验**：将参考线索提升到解耦的三维参数空间，构建时序一致的几何先验
3. **Generative 先验**：利用视频生成模型的生成先验，将修复建模为 single-step Rectified Flow

TIGER 在身份保持、时序稳定性和视觉真实感方面均取得了领先效果，能够在高效推理的同时生成身份一致、细节丰富且动态自然的修复视频。

### VST：边看边想的流式视频推理

传统 VideoLLM 通常是"先看完整段视频，再开始推理回答"，带来明显响应延迟且易遗忘早期线索。VST 提出 **thinking while watching** 的流式视频理解范式：

- 模型在视频流持续输入过程中同步激活推理能力
- 随着新片段到来持续生成中间思考，实时整理事件、实体、因果关系和关键线索
- 构建 VST-SFT 和 VST-RL 后训练流程，设计基于视频知识图谱的自动训练数据合成管线

实验显示：VST-7B 在 StreamingBench 达到 79.5%，在 OVO-Bench 达到 59.3%；相比 Video-R1，在 VideoHolmes 上响应速度提升 15.7 倍并获得 +5.4% 性能增益。

### RED-Aes：相对美学差异学习

传统图像美学评估方法让模型学习绝对美学分数，但人类审美往往是比较判断。RED-Aes 从问题建模上做了转换：不再学习单张图的绝对分数，而是学习编辑前后图像的相对美学差异。

研究团队构建 RED-20k 数据集，利用多个图像编辑大模型生成源图像-编辑图像对，通过专家模型标注相对美学差异和思维链解释。训练上，先通过对比与因果预训练注入美学知识，再用 GRPO 强化学习优化排序能力。实验显示 RED-Aes 的 7B 模型在五个公开基准的零样本评估中全面超越 GPT-5 及此前专家模型。

## 方向二：大模型应用

### GAIA：GUI Agent 动作评判数据飞轮

GUI Agent 操作具有不可逆性，一次错误点击可能直接中断任务流程。GAIA 提出基于数据飞轮的直觉判别模型训练框架：

- 从真实 Agent 交互中构建高质量正负样本
- 训练轻量级 Critic Model，仅需单 token 即可完成判断
- 推理时通过多候选动作采样与 Critic 筛选实现 Test-Time Scaling
- 利用 Critic 挖掘困难样本回流训练，形成"数据-模型-数据"闭环

在多个 GUI 基准上，该方法为开源与闭源模型带来稳定提升，任务成功率最高提升超过 10%。

### UniTranslator：统一多模态图像内翻译

UniTranslator 实现了端到端的图像内机器翻译——将翻译结果直接"画"回图片，保持原有排版和空间位置。它设计了理解-生成对齐模块解决语义不一致问题，以及空间掩码解码器解决几何错位问题，无需中间 OCR 检测、文本擦除等复杂步骤。

### ELVA：基于排序的多模态检索

ELVA 将排序思想引入多模态检索训练，不再只优化"相关/不相关"的二元判断，而是通过可验证奖励引导模型学习候选结果之间的相关性排序。在 M-BEIR 通用多模态检索基准上取得领先表现，在多粒度检索基准 MRBench 上相比 LamRA-Ret-7B 提升 13.1%。

## 方向三：自动驾驶

### CausalDrive：实时因果世界模型

现有驾驶世界模型大多把未来预测当成视频生成任务。CausalDrive 提出实时因果世界模型，仅凭前视画面、自车轨迹和文本提示，在屏蔽背景车辆未来信息的前提下迫使模型学习因果交互。Context-Forced DMD 架构结合连续流匹配与自纠正蒸馏，实现 12 FPS 的实时交互式模拟。

### MindDrive：语言空间中的在线强化学习 VLA

MindDrive 采用共享基座、双 LoRA 的 LLM 架构——决策专家将驾驶场景理解为离散语言指令，动作专家再将语言指令映射为精确轨迹点。关键创新在于将动作执行后获得的环境奖励反馈至语言决策层，在**离散的语言空间中完成试错优化**，比连续轨迹空间中的 RL 高效稳定得多。

### 其他自动驾驶工作

- **SWAM**（空间感知世界动作模型）：单次前向推理中联合生成视觉路径和动作轨迹，仅需单目 RGB 输入
- **DriveVA**：统一视频-动作自动驾驶世界模型，在 NAVSIM v1 上取得 90.9 PDMS，零样本跨域泛化
- **BeyondDrive**：从困难负样本中学习安全驾驶行为，NAVSIMv2 EPDMS 达到 90.1
- **DriveFine**：基于掩码扩散的 VLA 框架，实现"先生成、再修正"的轨迹规划能力

## 深度分析

### 小米 ECCV 2026 的核心技术战略

从这 12 篇论文的分布可以看出小米在 AI 基础能力建设上的系统布局：

1. **终端视觉**（人脸修复、美学评估、流式视频推理）——直接服务于手机、相机等核心硬件产品的体验升级
2. **智能体能力**（GUI Agent、图像翻译、多模态检索）——面向 MIUI 系统级 AI 助手的能力建设
3. **自动驾驶**（因果世界模型、VLA 决策、安全学习）——支撑小米汽车战略的技术积累

这三大方向分别对应了小米的三大核心业务场景：智能终端、智能生活（AI 助手）、智能汽车。论文不只是学术产出，更是技术进入产品之前的一次公开验证。

### VST 的流式推理范式突破

VST 的"边看边想"范式是对传统 VideoLLM"先看后想"模式的根本性改变。在实时交互场景（如视频通话、直播、自动驾驶）中，这种流式推理能力是实用化的前提。15.7 倍的响应速度提升意味着延迟从秒级降至百毫秒级，使得 VideoLLM 从"不可用"变为"可用"。这项工作与流式视频处理领域的趋势（如 Streaming Bench 等基准的建立）相呼应，标志着视频理解正从离线分析走向实时交互。参见 [VLX 流式视频 VLM 系列](https://github.com/QianJinGuo/wiki/blob/main/entities/om-ai-vlx-flow-streaming-video-vlm-vlx系列开篇-2026.md)。

### 语言空间 RL 的创新性

MindDrive 在离散语言空间中完成试错优化的设计巧妙地绕过了连续动作空间 RL 的收敛难题。这一思路与语言模型 RLHF 的成功有相通之处——将复杂问题映射到具有结构化语义的离散空间，降低了优化难度。该方法为"驾驶模型在部署后持续进化"开辟了可行路径，这对于自动驾驶系统的长期迭代具有重大意义。

## 实践启示

1. **流式推理是从演示到实用的关键一步**：VST 将 VideoLLM 响应速度提升 15.7 倍，证明了"边看边想"架构的工程可行性，为实时多模态交互提供了明确的技术路径

2. **相对学习优于绝对打分**：RED-Aes 的相对美学差异学习方法在多个基准上超越传统绝对打分方法——这种"比较学习"范式可推广到其他主观评估任务

3. **GUI Agent 需要动作级验证**：GAIA 的 Critic 模型在动作执行前验证"该不该点"，将错误率降低 10%+，在 Agent 系统中增加动作验证层是提升可靠性的关键工程手段

4. **语言空间 RL 降低自动驾驶训练门槛**：MindDrive 的离散语言空间 RL 避免了连续控制优化难题，为自动驾驶模型的持续进化提供了可实践的路径

5. **系统布局 vs 单点突破**：小米的 12 篇论文覆盖终端、智能体、汽车三大场景，展示了企业级 AI 研究需要与产品战略对齐的系统性布局思路

## 相关实体

- [VLX 流式视频 VLM 系列](https://github.com/QianJinGuo/wiki/blob/main/entities/om-ai-vlx-flow-streaming-video-vlm-vlx系列开篇-2026.md) — 流式视频理解与实时交互的架构设计
- [南大 SAME MoE 多模态持续微调](https://github.com/QianJinGuo/wiki/blob/main/entities/icml-2026-南大same稳住moe缓解多模态持续微调双重遗忘.md) — 多模态模型持续学习的相关研究
- [LongCat VitaBench 长期动态 Agent 基准](https://github.com/QianJinGuo/wiki/blob/main/entities/meituan-longcat-vitabench-20-long-term-dynamic-agent-benchmark.md) — Agent 长期任务评估方法
- [ACL 2026 扩散语言模型推理评估](https://github.com/QianJinGuo/wiki/blob/main/entities/acl-2026-diffusion-lm-block-size-reasoning-t-star.md) — 模型推理评估与优化方法论
- [Harness Engineering 的核心地位](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-2026-why-it-matters.md) — 系统级可靠性工程

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/一步修复严重退化人脸视频边看边想让视频大模型响应速度提升157倍小米多篇论文入选-eccv-2026.md)

---

## Ch16.016 The next generation of speculative decoding: DFlash and Spec V2 - LMSYS Blog

> 📊 Level ⭐⭐⭐ | 11.1KB | `entities/lmsys-dflash-speculative-decoding-2026-06.md`

# The next generation of speculative decoding: DFlash and Spec V2 - LMSYS Blog

> Source: [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/lmsys-dflash-speculative-decoding-2026-06.md)

## 摘要

LMSYS、Modal 与 Z Lab 在 2026 年 6 月联合发布的工程博文，介绍新一代 speculative decoding 方案 **DFlash** 及其在 SGLang 上的 **Spec V2** 引擎集成。核心创新是把"块扩散（block diffusion）"作为 draft 模型架构，并在每一层把目标 LLM 的 KV cache 注入到 draft 模型中——从而在 Qwen 3.5 397B-A17B 上 HumanEval 任务相对基线取得 **>4.3× 吞吐**、相对 MTP 取得 **1.5× 吞吐**。博文包含基准、消融实验和可直接复现的 `sglang.launch_server` 命令。

## 核心要点

1. **DFlash 核心机制** — diffusion 风格 + KV injection 的 speculative decoding 新方案：用一个小型 block diffusion draft 模型并行生成整块 draft token，并把目标 LLM 的 hidden representation 注入到 draft 模型的 KV cache 中。
2. **Qwen 3.5 397B-A17B 部署就绪** — 公开 release 三份 HuggingFace 模型权重（z-lab / modal-labs / lmsys），并提供完整 sglang 启动命令，硬件目标 8×B200。
3. **Spec V2 引擎** — SGLang 全新 speculative decoding 引擎，通过减少 host-device 同步点（overlap scheduling）把推理吞吐再提升 33%+（Qwen 3-8B 单 B200 并发 32 下从 11.4 ktok/s 到 15.3 ktok/s）。
4. **消融实验清晰** — 把 DFlash 的两个组件（diffusion drafting + KV injection）单独消融，分别证明各自对 acceptance length 与端到端加速的贡献。
5. **与现有方案的对比** — 相比 EAGLE-3 5-layer、native MTP（Gemma 4、DeepSeek-V4）在所有 benchmark setting 下吞吐都更高。

## 深度分析

### 背景：为什么 speculative decoding 还值得继续做

Transformer LLM 的自回归解码一次产生一个 token，arithmetic intensity 低，与现代 GPU/TPU 的并行能力不匹配。

经典 speculative decoding 用一个小、快的 draft 模型先提出一批候选 token，再由目标 LLM 并行验证——质量无损（接受/拒绝由目标模型决定），但吞吐大幅提升。

许多主流方案（EAGLE 系列、原生 MTP 模块，如 Gemma 4、DeepSeek-V4）仍然依赖**顺序自回归**，只不过把自回归从目标模型挪到了 draft 模型——draft 模型逐 token 生成的代价同样受限于硬件利用率不高。

### DFlash 的两大组件

Z Lab 的 DFlash（论文 [arXiv:2602.06036](https://arxiv.org/abs/2602.06036)）用**块扩散（block diffusion）draft 模型**一次性并行生成整块 token，更贴合现代硬件的并行能力。小米的 MiMo v2.5-Pro-UltraSpeed 已用 DFlash 达到超过 1k output tps。

但"用块扩散做 drafter"本身不是新想法，过去有两个失败模式：

- 直接训练一个小型块扩散模型作为 drafter → acceptance length 太低。
- 用现成的大块扩散 LLM（如 SpecDiff-2）作为 drafter → 显存太大、draft 成本太高。

DFlash 的关键洞察：**目标 LLM 最懂上下文**。受 Medusa、EAGLE、MTP 启发，从目标模型提取上下文 token 的 hidden representation；区别是不只在 drafter 输入处用，而是**直接注入到 draft 模型的 KV cache 里**。

这样：

- draft 模型不必从零建模完整上下文，只需专注于"预测下一块 token"。
- 可以复用目标模型后几层的张量，draft 模型保持极小且高效。
- 在更高 draft depth 下也能保持高 acceptance length。

### Benchmark：Qwen 3-4B + 5-layer drafter

EAGLE-3 5-layer vs DFlash 5-layer 在相同数据集上训练，端到端结果（`acc_len / speedup`）：

| Task | EAGLE-3 (5 layers) | DFlash |
| --- | --- | --- |
| GSM8K | 4.2 / 2.1× | **4.2 / 3.3×** |
| HumanEval | 4.3 / 2.2× | **4.0 / 3.2×** |
| MT-Bench | 3.1 / 1.4× | **3.0 / 2.2×** |

### 消融 1：diffusion drafting 单独贡献

DFlash 的"diffusion only" 变体（去掉 KV injection，保持块扩散）：

| Task | EAGLE-3 (5 layers) | DFlash (diffusion only) |
| --- | --- | --- |
| GSM8K | 4.2 / 2.1× | **3.5 / 2.9×** |
| HumanEval | 4.3 / 2.2× | **3.5 / 2.9×** |
| MT-Bench | 3.1 / 1.4× | **2.6 / 2.0×** |

DFlash 即使在更低的 acceptance length 下，也比 EAGLE-3 端到端更快——核心来自"drafting cost" 的下降。

### 消融 2：KV injection 单独贡献

DFlash 的"injection only" 变体（去掉 diffusion drafting，回到自回归 drafter）：

| Task | EAGLE-3 (5 layers) | DFlash (injection only) |
| --- | --- | --- |
| GSM8K | 4.2 / 2.1× | **4.8 / 2.4×** |
| HumanEval | 4.3 / 2.2× | **4.6 / 2.3×** |
| MT-Bench | 3.1 / 1.4× | **3.4 / 1.5×** |

证明 KV injection 让 acceptance length 显著提升，且端到端加速更明显。

### 工程实现：DFlash 在 SGLang V1 → V2 的演进

**V1 阶段**（已弃用）：在原 speculative decoding 引擎里新增 `DFlashWorker` 与 `DFlashDraftModel`，并支持跨 draft/target 的 KV cache 集成。

SGLang 的 scheduler（运行在 host 上）调度 worker（运行在加速器上）。注意一个反直觉点：**draft 模型 worker 才是与 scheduler 对话的一方**（通过 `.forward_batch_generation` 等方法），它包装目标模型 worker 用于验证步骤。

KV injection 的工程难点：

- 不想存储那些 latents（占用 KV cache 空间）。
- 想让共享 prefix 的请求共用 radix cache。
- 因此在 draft forward pass 主体之前做"立即物化"——加一层 batched 线性 projection + 融合的 Triton kernel 处理 norm + RoPE。

**V2 阶段**：在 V2 speculative decoding 引擎里集成 DFlash，关键目标是减少 host-device 同步点。两个核心 overlap 机会：

1. host 端 `pop_and_process`（N-1 批的 stop token 检测、metadata 更新）与 GPU 上 N 批工作重叠。
2. host 端 `prepare_for_decode` 里 N 批的 KV allocation 与 GPU 上 N-1 批工作重叠。

效果：Qwen 3-8B 单 B200 并发 32 下从 ~11.4 ktok/s 提升到 ~15.3 ktok/s（+33%）。

### Headline 数字：Qwen 3.5 397B-A17B on 8×B200

- HumanEval concurrency 1：**>4.3×** baseline，**1.5×** MTP。
- 在所有 benchmark setting（GSM8K / HumanEval / MT-Bench，concurrency 1-32）下都比 baseline 与 native MTP 吞吐更高。

### 复现路径

```
export SGLANG_ENABLE_OVERLAP_PLAN_STREAM=1
python -m sglang.launch_server \
  --model-path Qwen/Qwen3.5-397B-A17B \
  --trust-remote-code \
  --speculative-algorithm DFLASH \
  --speculative-draft-model-path modal-labs/Qwen3.5-397B-A17B-DFlash \
  --speculative-dflash-block-size 8 \
  --speculative-draft-attention-backend fa4 \
  --attention-backend trtllm_mha \
  --linear-attn-prefill-backend triton \
  --linear-attn-decode-backend flashinfer \
  --mamba-scheduler-strategy extra_buffer \
  --tp-size 8 \
  --max-running-requests 32 \
  --cuda-graph-max-bs-decode 32 \
  --cuda-graph-backend-prefill tc_piecewise \
  --enable-flashinfer-allreduce-fusion \
  --mem-fraction-static 0.8 \
  --host 0.0.0.0
```

draft 模型权重三处 release：`z-lab/Qwen3.5-397B-A17B-DFlash`、`modal-labs/Qwen3.5-397B-A17B-DFlash`、`lmsys/Qwen3.5-397B-A17B-DFlash`。

### 致谢

- **Z Lab**：Jian Chen, Yesheng Liang, Zhijian Liu
- **Modal**：David Wang, Charles Frye
- **SGLang**：Qiaolin Yu, Liangsheng Yin, Khoa Pham

## 与现有实体的差异化

- 这是 LMSYS 2026-06 的最新 speculative decoding 技术博客，与现有 speculative decoding 相关实体（如 EAGLE、MEDUSA 早期工作）相比，时间新且含实证 benchmark
- vLLM 集成路径明确，可直接复现
- DFlash 是 block diffusion + KV injection 的组合创新，比单纯沿用 Medusa/EAGLE 风格的 next-token head 路线更进一步

## 实践启示

- 评估 LLM 推理加速方案时，DFlash + vLLM 是 2026 年值得测试的 baseline 之一
- 关注 LMSYS blog 系列作为 speculative decoding 进展的可靠信号源
- 如果你已经在用 EAGLE 或 MTP，遇到 acceptance length 瓶颈时可以考虑 DFlash 的 KV injection 思路（即使不上 block diffusion 也能拿到显著的 acceptance 提升）
- SGLang Spec V2 的 overlap scheduling 思路（host-device 重叠）值得借鉴到其他推理引擎的设计中

## 原文链接

- [https://www.lmsys.org/blog/2026-06-15-next-generation-speculative-decoding-dflash-v2/](https://www.lmsys.org/blog/2026-06-15-next-generation-speculative-decoding-dflash-v2/)

## 相关实体

- [automation anywhere collaborates with cisco, nvidia, okta, a](https://github.com/QianJinGuo/wiki/blob/main/entities/automation-anywhere-collaborates-with-cisco-nvidia-okta-and-openai-launching-ent.md)
- [ettin reranker family](https://github.com/QianJinGuo/wiki/blob/main/entities/ettin-reranker-family.md)
- [mathematical optimization at enterprise scale: aws innovatio](https://github.com/QianJinGuo/wiki/blob/main/entities/mathematical-optimization-aws-innovation-center-enterprise.md)
- [DDoSing Software Delivery Pipelines](https://github.com/QianJinGuo/wiki/blob/main/entities/varoa-ddosing-software-delivery-pipelines-2026.md)
- [AI GPUs probably live longer than three years](https://github.com/QianJinGuo/wiki/blob/main/entities/seangoedecke-ai-gpus-live-longer-than-three-years-2026.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/lmsys-dflash-speculative-decoding-2026-06.md)

---

## Ch16.017 TLiveOmni vLLM 适配与量化方案

> 📊 Level ⭐⭐⭐ | 10.1KB | `entities/tliveomni-vllm-quantization.md`

→ [返回总览](https://github.com/QianJinGuo/wiki/blob/main/entities/面向电商直播场景的全模态大模型推理加速方案.md)

## vLLM 架构适配
### 模型注册
自定义模型不在 vLLM 官方支持列表，采用 Out-of-tree models 方式通过 Plugin 注册，无需修改 vLLM 源码。
```python
def register():
    from vllm import ModelRegistry
    from your_code import YourModelForCausalLM
    ModelRegistry.register_model("YourModelForCausalLM", YourModelForCausalLM)
```

### 多模态数据处理
vLLM 数据前处理三阶段（"占位符 → Token 序列 → Embedding 向量"三级映射）：
1. **数据预处理**（`tlive_process`）：多模态数据读取与向量化
2. **标识与排布**：

   - 定义标识（`get_placeholder_str`）：指定 Prompt 中多模态 Token 模版（如 `<video_pad>`）
   - Token 展开与排布（`prompt_updates`）：将占位符替换为 N 个连续视觉占位 Token
3. **向量对齐与更替**（`_maybe_apply_prompt_updates`）：Encoder 计算 Embedding 后填入对应位置
---

## 框架适配与精度对齐
### 多模态对齐问题
#### Interleave 排布修复
vLLM 默认将多模态特征 Embedding 拼接成连续序列，但 **TLiveOmni 采用 V/A 交替排布**（Vision Token 和 Audio Token 交替）。vLLM 默认连续拼接逻辑会导致：

- 连续视觉 Embedding 覆盖 Audio Token 位置
- 映射错位，模型输出与训练产生误差
修复方案：修改代码确保 Token 和 Embedding 排布方式与训练时一致。

#### Audio Token 自动 Padding 修复
vLLM 为优化 Cache 效率（保证特征维度是 8 的倍数）会在音频特征提取前 padding，导致 Token 长度不一致。解决方案：去除 vLLM 中 Audio 特征自动补全部分，严格按原始长度处理。

#### 浮点运算差异
vLLM 和 Transformers 对 DeepStack 和 Residual 部分**相加顺序不同**：

- 数学上 A+B+C = (A+C)+B
- 但 GPU 浮点运算不满足加法结合律
- `residual` 输出大，先加大数还是先加小数会导致不同精度
- 误差随模型层数逐层放大
修复方案：修改 vLLM 计算逻辑，确保 DeepStack 和 Residual 计算顺序与 Transformers 一致。

### 通用对齐问题
#### Flash-Attention 差异
vLLM 对 Vision 和 Language 模块采用不同 Attention 后端：

- Vision 模块（Qwen3-VL 等）：直接调用 `flash_attn_varlen_func`，结果与训练一致
- Language 模块（vLLM）：调用 `torch.ops.vllm.unified_attention_with_output`，这是 vLLM 为 PagedAttention 专门重写的算子
差异来源：CUDA 实现层面与原版 Flash-Attention 在累加精度、Scaling 处理或算子融合上存在微小差异。当前版本无法完全解决，但误差在可接受范围内。

#### RSNorm 对齐
vLLM 原生 RMSNorm 使用优化的 CUDA 算子（`fused_add_rms_norm`），但在 `residual` 加法和数据类型转换顺序上与 Transformers 存在偏差。Q、K 的 Norm 结果有 1e-4 级误差会经 Attention 矩阵乘法放大累积，因此对 vLLM 的 Norm 进行了替换。
---

## 模型量化方案
### 量化核心优势
- **释放显存**：INT4/INT8 量化可释放 50%-75% 显存，使大模型能在消费级显卡（如 RTX 4090）上运行
- **降低延迟**：权重与激活值位宽减小，访存压力降低，配合 GPU 低精度计算单元显著缩短执行时间

### 量化对象与维度
- **权重（Weight）**：减少模型占用显存
- **激活（Activation）**：减少显存 + 整型算子加速（W8A8）
- **KV Cache**：提高长序列处理能力
- **梯度（Gradients）**：训练阶段加速反向传播

### 量化精度格式
| 格式 | 说明 |
|------|------|
| WxAy | W=权重位数，A=激活值位数 |
| FP8 | NVIDIA 新一代量化格式，H100/L40S 原生硬件支持 |

### 量化阶段分类
| 类型 | 说明 |
|------|------|
| QAT（量化感知训练） | 在线量化，需要训练数据结合反向传播调整权重 |
| PTQ（后训练量化） | 离线量化，在已训练模型上进行 |
| - Post Dynamic | 无校准数据，直接量化（QLoRA 采用） |
| - Post Calibration | 需要校准数据集（GPTQ 采用） |

### 量化方法分类
- **通道级量化**：LLM.int8、SmoothQuant、AWQ — 不同通道应用不同缩放因子
- **基于优化目标**：GPTQ — 最小化量化前后输出误差
- **基于旋转矩阵**：QuaRot、SpinQuant — 旋转变换消除离群点

### 复合量化方案：SmoothQuant + GPTQ
**SmoothQuant**：解决离群点问题

- 当 LLM 参数量超过 7B 后，激活值中出现远超均值的离群点（通常比正常值大 100 倍以上）
- INT8 量化会使大多数激活值被清零
- SmoothQuant 引入平滑因子 s，将激活值离群点转移到权重上（权重分布更平滑、更易量化）
**GPTQ**：最小化量化前后权重差异

- 起源于 Yann LeCun 1990 年提出的 OBD 算法（剪枝方法）
- 核心思路：找到量化权重使新权重和原权重输出结果差别最小

### 校准数据抽取策略
| 原则 | 说明 |
|------|------|
| 任务完整性 | 覆盖所有训练任务和能力边界 |
| 任务难度/敏感度 | 对数值波动敏感任务给予更多样本权重 |
**高敏感任务（精度型）**：

- OCR/Markdown：一个像素偏差可能导致"8"量化成"0"
- Visual Grounding：权重微小扰动使边界框漂移几十像素
- Temporal Grounding：微小扰动导致时间轴偏移
最终形成 **5000 条高质量数据**的校准池。
---

## 性能评测
### 精度评估（H20 单卡）
量化方案：SmoothQuant + GPTQ 复合量化，主要针对 Language Model 部分量化。
各量化方案精度损失均 **<1.5%**，其中 FP8 量化精度损失最小，图像与视频任务甚至有微弱性能提升。

### 推理速度测试（H20 单卡）
量化后综合加速比 **2.5x~3.5x**：

- Video（Short）加速收益不明显：vLLM 多模态预处理效率低于 Torch，时延占比重
- Video（Long）预处理占比相对较低，推理加速优势更充分体现

### 硬件对比：H20 vs RTX 4090
| 维度 | H20 | RTX 4090 |
|------|-----|----------|
| 显存 | 96GB HBM3 | 48GB GDDR6X |
| 带宽 | ~3.6TB/s | ~1TB/s |
| 最优方案 | FP8 | W4A16 |
| 长视频延迟 | 19.66s | 30.74s |
**H20 优势**：

- HBM3 高带宽支持超长序列 KV Cache 实时读取
- Hopper 架构原生 FP8 Tensor Core，FP8 模式下不仅减轻访存压力，还通过高效 FP8 算子加速
**RTX 4090 局限**：

- GDDR6X 带宽远低于 HBM3，长序列解码频繁访存导致 GPU 算力无法高效利用
- 48GB 显存应对超长上下文时利用已近极限

### 部署建议
| 场景 | 首选方案 |
|------|---------|
| 大规模生产/长序列（电商直播、视频密集描述） | H20 + vLLM-FP8 |
| 边缘计算/显存受限场景 | RTX 4090 + vLLM-W4A16 |
| 系统级优化 | 同步关注 CPU 算力，优化数据加载减少前处理占比 |
---

## 关键发现
1. **vLLM 多模态支持仍有缺陷**：引擎死锁（#28375）、多模态模型精度大幅下降（#29595）
2. **版本迭代断裂**：vLLM v0.11.1 提供 Omni 支持，但 Qwen3-Omni 官方适配版本停止维护
3. **异构硬件需不同量化策略**：H20 适配 FP8，4090 适配 W4A16
4. **前处理不可忽视**：多模态数据推理中 CPU 频率影响整体 Latency

## 深度分析
### vLLM 多模态适配的本质困难
### 量化精度 vs 推理效率的工程权衡
### 硬件差异化选型的底层逻辑
### 校准数据的任务敏感度分级
## 实践启示
### 量化方案选型决策树
1. **确认硬件**：H20 → 优先 FP8；RTX 4090 / 消费级卡 → W4A16
2. **确认量化对象**：权重优先（显存释放最大）→ INT4；需要加速激活计算 → W8A8；长序列 → 同步量化 KV Cache
3. **选择量化方法**：有离群点问题（LLM >7B 激活值分布不均）→ SmoothQuant + GPTQ；无明显离群点 → 直接 GPTQ/AWQ
4. **校准数据**：高敏感任务（OCR/VG/TG）→ 高权重覆盖；一般任务 → 均匀采样，确保 5000 条高质量数据池

### vLLM 多模态适配检查清单
当需要将自定义多模态模型适配到 vLLM 时，以下检查点按优先级排序：

- [ ] **多模态 Token 排布**：确认训练时 V/A 是连续还是交替排布，vLLM 默认连续拼接需要修改
- [ ] **Audio Padding**：检查 vLLM 是否会自动对音频特征补齐，如有需要去除
- [ ] **浮点累加顺序**：确认 DeepStack/Residual 相加顺序与训练代码一致（误差会逐层放大）
- [ ] **Flash-Attention 后端**：Language 模块使用 vLLM 自研 unified_attention 算子，与原版 flash_attn 有微小精度差异（当前无法完全消除）
- [ ] **RMSNorm 实现**：检查 vLLM fused_add_rms_norm 的数据类型转换顺序，必要时替换

### 部署架构建议
| 场景 | 硬件 | 量化方案 | 关键注意事项 |
|------|------|---------|-------------|
| 电商直播/视频密集描述（长序列） | H20 | FP8 | 关注前处理占比，优化 CPU 数据加载 |
| 边缘计算/实时推理 | RTX 4090 | W4A16 | 显存受限，长序列时注意 KV Cache 容量 |
| 高精度 OCR/Grounding 任务 | H20 | FP8 + 专用校准数据 | 校准池需覆盖高精度边界 case |
| 混合负载 | H20 + RTX 4090 混部 | 按任务分流 | 建立任务→硬件路由层 |

### 前处理优化方向
多模态推理中前处理（CPU 端）往往被忽视，但对短内容场景影响最大。建议：
1. **图像**：使用 TurboJPEG/libjpeg-turbo 替代默认解码器，resize 用 NEON 加速
2. **音频**：音频特征提取（Mel Spectrogram 等）用 PyTorch 批处理而非 vLLM 内置逻辑
3. **视频**：关键帧采样策略在摄入端完成，不要在推理引擎内做动态采样
---
## 相关实体
- [ai-infra-auto-driven-skills v0.1.0：给 codex / claude code 的推理](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-infra-auto-driven-skills-v0-bbuf-giantpanda.md)
- [gemma 4 multi token prediction drafters](https://github.com/QianJinGuo/wiki/blob/main/entities/gemma-4-multi-token-prediction-drafters.md)
- [tokenspeed agentic inference engine](https://github.com/QianJinGuo/wiki/blob/main/entities/tokenspeed-agentic-inference-engine.md)

---

## Ch16.018 vLLM V0→V1 迁移中的 logprob 差异修复

> 📊 Level ⭐⭐⭐ | 9.4KB | `entities/vllm-v0-to-v1-correctness-before-corrections.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/vllm-v0-to-v1-correctness-before-corrections.md)

## 核心发现
- V1 默认返回 **raw logprobs**（未经后处理），而 trainer 期望 **processed logprobs**
- V1 的 prefix caching / async scheduling 改变了执行路径
- 先修 backend 再调 objective，不要反过来
- Clip rate 是最敏感的 mismatch 指示器

## 影响范围
所有使用 vLLM 做 rollout generation 的 online RL 方法（PPO、GRPO、GSPO）

## 相关链接
→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/vllm-v0-to-v1-correctness-before-corrections.md)

## 相关实体
<!-- ⚠️ 以下交叉引用在 lint 时未通过，请确认 slug 后再取消注释 -->
<!-- - [servicenow vllm correctness](https://github.com/QianJinGuo/wiki/blob/main/entities/servicenow-vllm-correctness.md) -->
<!-- - [servicenow vllm correctness huggingface](https://github.com/QianJinGuo/wiki/blob/main/entities/servicenow-vllm-correctness-huggingface.md) -->

## 深度分析
### 背景：为什么 V0→V1 迁移是个高风险操作
vLLM 的 V1 引擎对 V0 做了大量底层重构，包括调度器架构、内存管理、KV cache 分配策略和 logprob 计算路径的重大变化。对于大多数推理场景，这些变化是透明的、性能正交的。但对于 **RL 训练**（尤其是需要精确 token-level logprob 的 PPO/GRPO/GSPO），这些变化直接影响了 `logprob` 的数值语义，进而影响 policy gradient 的计算精度。
V0 的 logprob 输出经过完整的 `temperature → repetition_penalty → min_length/truncate` 后处理流水线。而 V1 为了降低延迟，默认返回 **raw model logits** 经过 log-softmax 后的值，跳过了这部分后处理。这导致即使模型权重完全相同，V0 和 V1 的 `logprob` 也会系统性偏差。

### 四个 backend 问题的逐层解析
**问题一：Logprob Semantics（最关键）**
V1 新增的 `logprobs_mode` 参数控制 logprob 的计算方式。默认值在 V0 和 V1 之间存在语义差异：V0 默认执行完整后处理，V1 默认不执行。当 `use_v1: true` 时，必须显式设置 `logprobs_mode: "processed_logprobs"` 来恢复 V0 语义。否则 reward shaping、entropy bonus、value estimation 全部会带上系统性偏差。
这个问题的影响范围极广：所有依赖 `logprob` 计算 advantage estimation 的 RL 方法都会受影响。PPO 的 clipped surrogate objective 直接依赖 `logprob` 比率，GRPO 的 group-relative advantage 依赖 `logprob` 的精确值。哪怕 0.01 的均值偏移，在数万次迭代的累积下也会导致训练曲线漂移。
**问题二：Runtime Defaults — Prefix Caching 与 Async Scheduling**
V1 引入了 prefix caching（相同 prompt 前缀的 KV cache 复用）和 async scheduling（异步 token 生成调度）。这两个优化在推理场景下是重大性能收益，但在 RL 训练中引入了非确定性：相同 `input_ids` 可能因为 cache 命中状态不同而走不同的执行路径，导致 `logprob` 在 token 位置上有微小差异。
对于 RL 训练的可复现性（reproducibility）要求，这种不确定性是不可接受的。ServiceNow-AI 团队的建议是：在训练阶段显式关闭这两个特性（`enable_prefix_caching: false`, `async_scheduling: false`），只在推理部署时启用。
**问题三：Inflight Weight Updates**
V1 的权重更新路径（weight update during inference）与 V0 有差异。这主要影响的是 online RL 中的 weight update 频率和时机。如果在 rollout 过程中进行权重更新（常见于 PPO 的 async PPO 变体），V1 可能因为权重同步时机不同导致 logprob 计算不一致。
**问题四：fp32 lm_head 精度**
`lm_head`（final projection layer）的计算精度在 V0 和 V1 默认配置下可能不同。V0 有时依赖 implicit FP8 或混合精度优化，而 V1 的默认精度策略可能不同。确保 `lm_head` 在 FP32 下运行可以避免低精度累积误差影响 logprob 精度。

### Clip Rate 作为Mismatch 指示器
PPO 和 GRPO 训练中，clip rate（被 clip 的 policy ratio 的比例）是一个关键的可观测指标。正常训练时，clip rate 通常在 1%–20% 区间。如果 clip rate 出现剧烈波动（尤其是从极低突然升高）或训练曲线出现"台阶式"突变，这通常是 logprob 不匹配的信号。ServiceNow-AI 特别指出：在 V0→V1 迁移的初期，clip rate 是最容易读到的系统性 mismatch 信号，应该作为第一优先级监控指标。

## 实践启示
### 迁移检查清单
在将 RL 训练 pipeline 从 V0 切换到 V1 时，以下配置是**必须**验证的：
```
vllm_config:
  use_v1: true
  vllm_kwargs:
    logprobs_mode: processed_logprobs    # 恢复 V0 logprob 语义
    enable_prefix_caching: false           # 关闭 cache 非确定性
    async_scheduling: false                # 关闭 async 调度非确定性
    lm_head_precision: fp32               # 确保 lm_head 精度对齐
```

### 推荐迁移策略
**阶段一：逐项隔离验证**
不要一次性切换所有配置。先在固定随机种子下，对比 V0 和 V1 相同输入的 logprob 输出。使用一个简单的 dummy prompt（如 "The capital of France is"），对比每个 token 位置的 logprob 差异。如果差异超过 `1e-3`，说明 logprob 语义未对齐。
**阶段二：短期 RL 跑分**
在确认 logprob 数值对齐后，用一个小型模型（如 1B–3B）在短数据集上做 100–500 步的 RL 训练。对比 V0 和 V1 的训练曲线（特别是 clip rate 和 policy entropy）。如果两者在 1% 以内对齐，再切换到完整训练。
**阶段三：prod 迁移后持续监控**
V1 的默认行为会随着 vLLM 版本更新而变化。每次升级 vLLM 后，都应该重新跑一遍上述对齐验证 pipeline。

### 对不同 RL 方法的影响差异
- **PPO**：对 logprob 精度最敏感，因为 PPO 的 importance sampling ratio (`π_new/π_old`) 直接依赖精确 logprob 值
- **GRPO**：相对宽容一些，group-relative advantage 计算会做归一化，但 logprob 均值偏差仍会影响 advantage baseline
- **GSPO**（格尔茨随机策略优化）：和 GRPO 类似，但由于采样策略更激进，logprob 不匹配会放大采样方差

### 配置管理的工程建议
建议在 RL 训练代码中，通过环境变量或 config 文件集中管理 vLLM 的版本兼容配置，而非散落在各个调用点。这样可以在切换 V0/V1 时保持单一配置来源，减少因配置不一致导致的难以复现的 bug。
---

## 总结
vLLM V0→V1 迁移中的 logprob 差异，本质上是 **推理引擎默认行为变化** 与 **RL 训练对数值精度的严格要求** 之间的冲突。核心修复路径是：显式设置 `logprobs_mode: processed_logprobs`，关闭 prefix caching 和 async scheduling 确保执行路径确定性，并在训练初期以 clip rate 为核心监控指标验证对齐状态。不要在 backend 未对齐的情况下尝试通过调整 RL objective 来"掩盖"问题——那样只会引入更难追踪的隐式错误。

---

## Ch16.019 京东 JoyAI-VL-Interaction — 全栈开源视频语言交互模型

> 📊 Level ⭐⭐⭐ | 8.6KB | `entities/jd-joyai-vl-interaction-video-language-open-source.md`

# 京东 JoyAI-VL-Interaction — 全栈开源视频语言交互模型

## 摘要

京东开源的 JoyAI-VL-Interaction 是全球首个全栈开源的实时视频视觉语言交互模型和系统，实现了大模型从"一问一答"到"边看边说"的跨越。该模型支持持续观察视频流、自主判断何时回应、在关键时刻主动预警，并具备后台 Agent 任务委派机制。作为全栈开源项目，覆盖了模型权重、交互数据集、训练方案和完整可部署系统，获得 vLLM-Omni 的 day-0 原生支持，在 58 个真实流式场景盲评中对标豆包视频通话助手胜率 77.6%、对 Gemini 视频通话助手胜率 87.9%。

## 核心要点

### 三重突破：从"被动问答"到"主动在场"

JoyAI-VL-Interaction 相比传统多模态模型有三重关键突破：

1. **主动判断，而非被动回答**：传统模型需等用户发起问题才开始处理画面；JoyAI-VL-Interaction 可持续观察视频流，自主判断何时该说话、何时该沉默。例如，设置"裁判出示红牌时提醒我"，模型会持续值守画面并在事件发生时自动预警。

2. **实时响应，而非事后总结**：传统视频理解需上传完整视频后再分析；JoyAI-VL-Interaction 面向正在发生的视频流，画面变化时就能即时响应，适用于安防预警、实时翻译、直播解说等对时序敏感的场景。

3. **后台 Agent 委派**：当模型遇到生成代码、调用工具、复杂推理等任务时，可交给后台大模型或 Agent 处理。前台模型继续观察现场，后台处理复杂任务，结果返回后自然接回对话——形成"前台实时助手 + 后台智能大脑"的协作系统。

### 全栈开源架构

JoyAI-VL-Interaction 开源的是完整技术栈，并非单一模型：

- **模型权重**：开源交互模型的核心权重参数
- **交互数据集**：专门设计的实时视频交互训练数据集
- **训练方案**：完整的训练流程和配置
- **可部署系统**：支持摄像头、直播流、监控流等多种视频输入，也支持语音输入输出、可视化界面、长期记忆和后台模型接口
- **vLLM-Omni 集成**：获得 vLLM-Omni day-0 原生支持，可一键拉起服务

### 技术架构

JoyAI-VL-Interaction 每秒做一次判断：继续观察、保持沉默、发现关键事件主动回应、遇到复杂任务交给后台 Agent。ASR、TTS、可视化界面、后台模型、外部工具和业务模块均可按需替换，开发者可以接入自己的语音服务、Agent、API、业务系统或前端界面。

## 深度分析

### "边看边说"背后的技术挑战

实现实时视频流中的主动交互面临多项关键技术挑战：

1. **时序对齐**：模型需要在视频帧流与语言输出之间保持精确的时序对齐，确保"看到"和"说到"的是同一时刻的内容
2. **自主触发**：从"用户提问→模型回答"的被动模式转变为"模型自主判断→主动响应"的主动模式，需要模型学会区分"需要回应的事件"和"无需关注的噪声"
3. **沉默策略**：一个好的 AI 助手不应该一直打扰用户——模型需要知道什么时候该出现，什么时候该安静。这对模型的上下文理解和社交智能提出了更高要求
4. **前台/后台协同**：前台模型保持实时观察的同时，后台模型执行复杂推理或工具调用，两个上下文需要保持一致性

这些技术挑战使得 JoyAI-VL-Interaction 不仅仅是一个视觉语言模型，更是一个实时的自主交互系统。

### 与 Agent 架构的深度融合

JoyAI-VL-Interaction 的"前台实时助手 + 后台智能大脑"架构，与 [Hermes Agent 技能设计](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-skill-design-analysis.md) 中的多层架构有异曲同工之处。前台模型类似于"感知-响应"的快速路径（System 1），后台模型类似于"推理-规划"的慢速路径（System 2）。

这种架构设计在实际应用中具有明确的合理性：实时视频场景要求毫秒级响应，不能等后台模型慢速推理后再决定是否回应；而遇到需要复杂推理的任务时，前台模型又没有足够的能力处理——因此将两者解耦，前台负责快速判断和实时交互，后台负责深度处理和工具调用。

### 从数字世界到物理世界

JoyAI-VL-Interaction 代表了 AI 从"数字世界的问答"到"物理世界的在场交互"的转变。传统大模型的价值体现在文字对话和代码生成中，而 JoyAI-VL-Interaction 的应用场景直指安防监控、老人小孩看护、直播讲解、AI 眼镜、无障碍辅助等物理世界场景。

京东拥有全球领先的物理世界运营网络（仓储、配送、门店、直播、客服、售后），这些场景每天都在发生人、货、场的实时互动——对这些物理世界数据的理解和利用，是 JoyAI-VL-Interaction 的独特优势。这也与 [NVIDIA XR/AR 眼镜 Agent 基础设施](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-xr-ai-ar-glasses-agent-infrastructure.md) 中讨论的"物理世界 AI 入口"趋势相互印证。

### 开源策略的行业影响

JoyAI-VL-Interaction 选择全栈开源，与许多大模型企业的闭源策略形成鲜明对比。全栈开源降低了开发者的使用门槛——开发者无需从零搭建视频接入、语音交互、前后端协同等工程基础设施，可以快速从模型研究走向真实场景落地。获得 vLLM-Omni day-0 支持进一步扩大了其生态影响力，使开发者可以在熟悉的高性能推理框架上直接部署。

## 实践启示

1. **实时视频交互是 Agent 走入物理世界的关键入口**：JoyAI-VL-Interaction 展示了 Agent 从"屏幕内"到"现实世界"的技术路径——实时视频流处理能力是物理世界 Agent 的基础模块。

2. **"何时沉默"与"何时回应"同样重要**：优秀的 AI 交互设计不仅需要强大的回复能力，还需要精准的触发判断。对于希望部署自主 Agent 的团队，"沉默策略"（什么时候不打扰用户）是值得投入的设计维度。

3. **前台/后台双层架构是实时 Agent 的工程标配**：将快速感知与慢速推理分离的架构设计，在实时性要求高的 Agent 场景中具有普遍参考价值——前台保证响应速度，后台保证处理深度。

4. **全栈开源加速 Agent 生态建设**：提供完整可部署系统（而非仅有模型权重），显著降低开发者的工程集成成本。对于希望构建 Agent 平台的企业，开源完整技术栈是快速建立生态的有效策略。

5. **盲评对比是交互模型评估的黄金标准**：JoyAI-VL-Interaction 在 58 个真人盲评案例中的胜率数据，为交互模型的评估方法论提供了参考——真实的流式场景盲评比离线基准测试更能反映模型的实用价值。

## 相关实体

- [WWW 2026 频谱解耦与增强](https://github.com/QianJinGuo/wiki/blob/main/entities/www-2026-spectral-disentanglement-multimodal-denoising.md)
- [NVIDIA XR/AR 眼镜 Agent 基础设施](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-xr-ai-ar-glasses-agent-infrastructure.md)
- [Hermes Agent 技能设计分析](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-skill-design-analysis.md)
- [Claude Code 系统工程能力](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-capability-systems-engineering-anthropic.md)
- [NVIDIA 多模态 RAG 知识系统](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-multimodal-rag-knowledge-systems.md)
- [Agent Harness 架构](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-harness-architecture.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/全球首个京东全栈开源joyai-vl-interaction让大模型从一问一答走向边看边说.md)

---

## Ch16.020 ServiceNow vLLM V0→V1 正确性修复

> 📊 Level ⭐⭐⭐ | 8.3KB | `entities/servicenow-vllm-correctness-huggingface.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/servicenow-vllm-correctness-huggingface.md)

## 核心问题：训练-推理 logprob 不匹配

PipelineRL 的训练器直接消费 rollout 产生的 token logprobs 来计算策略比率、KL 散度、clip rate、entropy 和 reward。任何 logprob 计算语义的变化都会改变训练动态。

vLLM V1 默认返回**原始模型输出的 logprobs**（在 temperature scaling、penalties、top-k/top-p 过滤之前），而 PipelineRL 期望的是**经过采样器处理的分布的 logprobs**。这一语义差异导致初始 V1 跑通后，clip rate、KL、entropy、reward 全面漂移。

## 四个后端修复

### 1. Logprob 语义修复

设置 `logprobs-mode=processed_logprobs` 移除了明显的均值偏移，使策略比率均值稳定在 1.0 附近。但训练曲线仍有差距——说明单一修复不够，下一个问题在推理路径本身。

### 2. 运行时默认值对齐

V1 的 prefix caching（默认开启）和 async scheduling（默认开启）引入了 V0 不存在的执行路径差异。在 online RL 场景下，prefix cache 命中可能在权重更新边界之前重用已计算状态，导致 actor 拿到过期推理结果。

对齐配置：

```yaml
vllm_config:
  use_v1: true
  vllm_kwargs:
    logprobs-mode: processed_logprobs
    enable-prefix-caching: false
    async-scheduling: false
```

### 3. Inflight Weight Updates 语义对齐

V0 的权重同步机制：阻塞在引擎边界 → 加载新权重 → 恢复执行，不显式清除缓存。V1 等效方案：

```python
await engine.pause_generation(mode="keep", clear_cache=False)
await engine_client.collective_rpc_async(
    "receive_weight_update",
    args=(request.model_dump_json(),),
)
await engine.resume_generation()
```

关键：`mode="keep"` 和 `clear_cache=False` 匹配了 V0 的隐式语义。

### 4. fp32 lm_head 最终投影精度

即使前三项修复完成，最终 parity 仍需要 fp32 `lm_head`。MiniMax-M1 技术报告和 ScaleRL 论文都独立发现了这个问题：RL 更新直接消费 token logprobs，而 lm_head 输出的 logits 精度变化会传播到 logprobs，进而影响策略比率、KL 散度和 clip rate。

## 核心工程原则：先修后端，再谈目标

ServiceNow 的经验是：**错误的顺序（先改目标函数再修后端）会导致目标侧的修正掩盖后端问题，使训练曲线难以解读**。正确的问题分解应该是：

1. 推理后端是否产生了正确的 logprobs？
2. 给定正确的 logprobs，目标函数是否还需要 off-policy 或 async 修正？

这两个问题需要分离处理。

## 相关实体

- [ServiceNow vLLM Correctness（更完整的分析）](https://github.com/QianJinGuo/wiki/blob/main/entities/servicenow-vllm-correctness.md)
- [vLLM V0→V1 迁移中的 logprob 差异修复](https://github.com/QianJinGuo/wiki/blob/main/entities/vllm-v0-to-v1-correctness-before-corrections.md)

## 深度分析

vLLM V0 到 V1 的迁移表面上是同一个推理引擎的版本升级，实际上是一次架构重写带来的行为契约变化。 ServiceNow 团队设定的迁移目标"让 V1 返回与 V0 等效的 rollout logprobs"看似技术性极强，实则揭示了 RL 训练系统中的一个深层依赖：训练器对推理后端的输出语义做了隐式假设。这些假设在 V0 时代是正确的，但在 V1 重写后若不显式声明和强制对齐，就会成为训练不稳定的隐秘根源。

logprobs 的语义差异（原始模型输出 vs. 采样器处理后分布）是四个修复中最初级但也最关键的一个。 它之所以关键，不是因为修复困难，而是因为它揭示了一个更普遍的问题：推理引擎版本升级时，默认配置的语义变化往往不会出现在升级指南中，却会直接影响消费推理输出的上游系统。这一问题在 PipelineRL 这类直接消费 token logprobs 计算训练目标的架构中尤为致命——logprob 均值偏移直接体现为策略比率的系统性偏差。

prefix caching 在 RL 推理中的危险性被这一案例充分暴露。 Prefix caching 的设计目的是通过重用已计算的 KV cache 加速推理，这在静态场景（固定模型权重、固定对话前缀）下是合理的优化。然而，在 online RL 场景下，模型权重在训练过程中持续更新，prefix cache 命中可能在权重更新边界之前重用已计算状态，导致 actor 获取与当前权重不对应的过期推理结果。这一问题在异步调度和并发请求混合时进一步复杂化，因为缓存失效边界与权重更新边界的对齐无法得到保障。

fp32 lm_head 的发现在多个独立研究中得到印证（MiniMax-M1 技术报告、ScaleRL 论文），表明这是一个跨团队、跨方法的普遍性问题而非 ServiceNow 特有。 fp16 lm_head 输出的 logits 精度变化通过 logprobs 传播到 RL 更新的每一个计算环节——策略比率、KL 散度、clip rate 均受影响。这意味着在大型 RL 训练任务中，lm_head 投影精度的选择并非性能优化问题，而是正确性前提。ScaleRL 将 fp32 logits/head 计算纳入标准 RL 配方，意味着这一实践正在从个别案例上升为社区共识。

ServiceNow 总结的核心工程原则——"先修后端，再谈目标"——具有超出 vLLM 迁移场景的方法论价值。 在引入任何目标侧修正（truncated importance sampling、off-policy correction、async correction）之前，必须首先确保推理后端在等效条件下运行。这一原则的反面教训同样重要：在推理后端行为未对齐的情况下，目标侧的修正会与后端问题产生混合效应，使得训练曲线难以解读，也无法判断改进来源于修正本身还是后端修复的附带结果。

## 实践启示

- **推理引擎升级时的必检清单**：在将推理引擎升级到新版本后，第一步应验证 rollout logprobs 与旧版本的语义等效性，而非直接进行目标函数调优或训练超参数调整；具体检查项应包括 logprobs 计算位置（原始输出 vs. 采样后）、默认精度（fp16 vs. fp32）和默认优化项（prefix caching、async scheduling）的状态变化。
- **online RL 场景下禁用 prefix caching**：在模型权重持续更新的训练场景中，prefix caching 引入的缓存重用语义与权重更新边界可能产生冲突；建议在 online RL 训练中显式设置 `enable-prefix-caching: false`，直到推理引擎提供权重更新感知的缓存失效机制。
- **inflight weight update 的语义声明**：在实现权重更新逻辑时，应明确声明 `mode` 和 `clear_cache` 参数的语义选择并与推理引擎版本对齐；`mode="keep"` 和 `clear_cache=False` 的组合匹配了 V0 的隐式语义，但新引擎版本可能有不同的默认值，需要显式对齐。
- **lm_head 投影精度作为 RL 正确性前提**：对于直接消费 token logprobs 的 RL 训练系统，建议将 fp32 lm_head 作为基线配置而非可选优化；这一选择与 ScaleRL 论文的推荐一致，在不引入显著性能损失的情况下消除了数值精度传播这一隐蔽的正确性风险。
- **问题分解的工程顺序**：当训练曲线出现异常时，应严格遵循"推理后端等效性 → 目标函数修正"的处理顺序；在确认推理后端正确性之前，避免在目标侧引入修正——否则修正效果与后端修复效果混合，使得训练异常的根因诊断变得不可信。

---

## Ch16.021 Profiling in PyTorch (Part 2): From nn.Linear to a Fused MLP

> 📊 Level ⭐⭐⭐ | 8.2KB | `entities/huggingface-torch-mlp-fusion-profiling-2026.md`

# Profiling in PyTorch (Part 2): From nn.Linear to a Fused MLP

> **Background**: Hugging Face team profiling series part 2 (2026-06-11). Climbs from single nn.Linear to 3-layer MLP with ReLU activation, profiles GPU kernel launch overhead, and shows torch.compile Inductor fusion reducing 9+ launches to 3 fused triton kernels.

## Core problem

- nn.Linear is the building block of nearly all deep learning models
- Single nn.Linear call produces multiple kernel launches (matmul + bias add)
- ReLU activation adds additional launches
- At small batch size (1024x1024), each layer can produce 5+ launches
- Kernel launch overhead (10-20us each) dominates total latency in overhead-bound regime

## Key findings

1. **3-layer MLP produces 9+ kernel launches** (3 Linear x 3 ops/Linear + 2 ReLU), single launch 10-20us, launch overhead 30%+ of total
2. **torch.compile auto-fusion**: Inductor backend fuses matmul + bias_add + relu into a single triton kernel, reducing 3 launches per layer to 1, total 9 to 3
3. **Compute-bound vs overhead-bound crossover**: at batch=1024 launch overhead dominates; at batch>=4096 compute dominates and fusion gains diminish
4. **CPU dispatch chain is hidden overhead**: each op traverses torch.add -> aten::add -> aten::add.out -> aten::copy_ dispatch layers, visible in profiler but not in user code
5. **torch.compile guard / recompile**: dynamic shapes trigger multiple recompiles, so first call can be slower than eager mode

## Practical takeaways

- Latency-sensitive small batch inference (batch<=2048): prefer torch.compile fusion
- Large batch training (batch>=4096): eager and compile modes have similar performance
- When profiling, focus on cudaLaunchKernel duration field, not just Self CUDA Time
- Use torch.profiler.profile(activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA]) with record_function decorator to localize bottlenecks

## Wiki cross-links

- Same series (profiling part 1) - not yet ingested; check entities/torch-compile-* for related Inductor backend content
- Candidate associations: kernel fusion, launch overhead, Inductor backend (no existing entity)

## 深度分析

### 核心观点

1. **单算子层面的"融合"已接近极限，融合优化的主战场正在向算子间边界迁移**
   - `nn.Linear` 的 bias 加法已经通过 cuBLAS GEMM 的 **epilogue** 机制在单 kernel 内部融合（`addmm`），`torch.compile` 在单 Linear 层上没有更多融合空间
   - 真正的融合收益出现在 **算子间**：GeLU + element-wise mul + reshape 这三个独立 kernel 在 compile 后融合为一个 Triton kernel，消除了中间结果在 HBM 的往返
   - 这意味着未来优化应关注"哪些算子之间有中间结果往返"，而非在单算子内部寻找融合机会

2. **CPU 端的 dispatch 开销是被忽视的瓶颈，尤其在 overhead-bound 场景**
   - 每个 PyTorch 算子经过 `aten::linear → aten::t → aten::addmm` 的 dispatch 链，每次 dispatch 触发 Python/C++ binding 开销
   - `torch.compile` 通过 Inductor 在编译时展开这个链，直接发射 `aten::addmm`，消除了中间 view 操作带来的 CPU 开销
   - 对 batch<=2048 的小 batch 推理，这个 CPU 开销占总延迟的 30%+，是 fused kernel 带来的主要收益来源

3. **静态 shape 特化 vs 通用性是一个根本性权衡**
   - Inductor 的 fused kernel 为 `[8192, 3072]` 形状专门生成，执行时间 89.4µs；Liger 手写 kernel 泛化任意形状执行时间 92.8µs
   - 差距仅 3.4µs，但背后是 compile-time shape specialization 的代价——动态 shape 触发 recompile，重编译成本可能远超单次执行节省
   - 实际工程选择应基于输入 shape 是否稳定，而非绝对性能数字

4. **GEMM 形状影响 kernel 选型，从而影响性能——同样的 FLOPs 不等于同样的速度**
   - gate_proj 和 up_proj：M·K·N = 8192·768·3072，执行时间 0.19ms
   - down_proj：M·K·N = 8192·3072·768，执行时间 0.17ms（快约 10%）
   - 原因：N=768 vs N=3072 导致 cuBLAS 选择了不同的 tile 配置（128×256 with stages_64x3 vs 128×128 with stages_32x5），更深 pipeline 的 tile 在该形状下复用更好

### 技术要点

- **GEMM epilogue**：矩阵乘 kernel 在写回 HBM 前执行 bias add / activation，避免单独发起一次 HBM 读写
- **Triton pointwise fusion**：Inductor 的 Triton 后端将 pointwise 算子（GeLU、mul、reshape）融合为单一 kernel，intermediate 留在寄存器而非 HBM
- **cuBLAS occupancy query**：每次 GEMM 发射前调用 `cudaOccupancyMaxActiveBlocksPerMultiprocessor` 确认最优 grid 配置，pointwise kernel 则直接发射无查询
- **View 不产生 kernel**：`aten::t`、`aten::transpose`、`aten::as_strided` 只改 tensor metadata（shape + stride），不搬动数据，不发射 GPU kernel

### 实践价值

- 对**ML 工程师**：小 batch 推理（batch≤2048）优先用 `torch.compile`，收益最大；大 batch 训练（batch≥4096）可保留 eager mode 省去编译开销
- 对**性能工程师**：profiler 表中看到 `0.000us` CUDA 时间的 op 名称（如 `aten::t`）应忽略，它们是纯 CPU 元数据操作，不是真正的 GPU 负载
- 对**框架开发者**：设计新算子时考虑是否有 epilogue融合机会——在 GEMM 尾部做激活函数比单独发射 kernel 更高效

### 相关实体

- [Deepseek V4 Triton Fp4 Optimization](https://github.com/QianJinGuo/wiki/blob/main/entities/deepseek-v4-triton-fp4-optimization.md) — 同样涉及 Triton kernel 优化，与本文的 pointwise fusion 优化角度互补
- [Inference Optimization](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md) — 推理优化通识，包含本文未覆盖的量化 / 蒸馏 / serving 层面的优化策略

## 实践启示

1. **建立"先猜测再验证"的 profiler 习惯**：每次看 trace 前先在脑中构建预期，trace 打开后第一时间关注"预期与现实的差异"——差异就是最有价值的发现
2. **小 batch 推理优先 torch.compile**：batch≤2048 时融合收益最高（kernel launch overhead 占 30%+）；batch≥4096 后 compute-bound 主导，compile 收益递减
3. **关注 cudaLaunchKernel duration 而非只看 Self CUDA Time**：Self CUDA Time 漏掉了 kernel launch 调度开销，duration 字段包含 launch 和实际执行两部分
4. **动态 shape 场景慎用 torch.compile**：若输入 shape 在每次推理时都可能变化（如 streaming 输入），compile 的 recompile 成本会抵消甚至超过融合收益，此时用 Liger 类手写 fused kernel 更稳定
5. **用 kernels 库分发预编译 kernel**：避免本地编译的痛苦（版本不匹配、GPU 架构差异），通过 `get_kernel("kernels-community/liger-kernels", version=N)` 下载 CI 预编译的版本化二进制

## Source

Original URL: https://huggingface.co/blog/torch-mlp-fusion

Source: [raw archive](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/huggingface-torch-mlp-fusion-profiling-2026.md)

---

## Ch16.022 MiMo-V2.5 推理系统全链路优化：Hybrid SWA + MoE + 多模态生产级落地

> 📊 Level ⭐⭐⭐ | 6.7KB | `entities/mimo-v2-5-inference-system-optimization-hybrid-swa.md`

# MiMo-V2.5 推理系统全链路优化

## 摘要

小米 MiMo-V2.5 系列模型的推理系统全链路优化方案，围绕 Hybrid SWA + MoE + 多模态复合架构，系统性重构了 KVCache 管理、调度策略、Prefill/Decode 链路，实现 API 降价最高 99%。这是业内首篇全面覆盖该组合架构的大规模工程落地方案。

## 核心要点

1. **Hybrid SWA 架构**：70 层 Transformer 中 10 层 Full Attention + 60 层 Sliding Window Attention（窗口 128 token），KVCache 降至 1/7，Prefill 计算量降至 1/7
2. **KVCache 系统重构**：双池分治（Full KV Pool + SWA KV Pool环形缓冲区）、前缀缓存树重构、GCache 三级缓存（GPU→CPU→NVMe SSD）
3. **调度优化**：KVCache 亲和调度（L2 命中率+25%）、计算量感知优先调度（TTFT P90 -30%）、EP 缩减与三级长度分桶
4. **Decode 加速**：MTP 投机解码（前 128 token 加速 2.3×）、SWA 显存扩容（有效容量 +5 倍）
5. **多模态链路并行化**：Encoder 跨请求 Batch、GPU 图片预处理、视频多 chunk 并行（1 小时视频 156s→23s）

## 深度分析

### 1. Hybrid SWA 是生产级 LLM 推理的成本最优解之一

MiMo-V2.5 证明了一个关键假设：在 70 层模型中仅用 14% 的 Full Attention 层即可维持足够质量，同时将 KVCache 和 Prefill 计算量降至 1/7。这意味着 **Attention 的稀疏化不是质量牺牲而是架构设计选择**——Sliding Window Attention 对局部依赖建模能力与 Full Attention 接近，而全局依赖由少量 Full Attention 层承载。这一设计在长序列场景下优势更显著，与当前模型上下文窗口持续扩张的趋势高度契合。

### 2. 前缀缓存树重构是 SWA 工程化的核心挑战

SWA 模式下传统「token 序列相等 → KV 也相等」的缓存假设被打破，因为窗口滑动导致相同前缀在不同请求中的 KVCache 表示不同。MiMo 团队的解决方案——将匹配规则升级为「窗口安全长度」（尾部至少 W 个 token 仍有有效 slot），并让淘汰路径与请求生命周期绑定——是针对 SWA 特性的关键工程创新。线上命中率平均 93% 证明了这种方案的有效性。这一思路对任何采用 SWA 或其变体的推理系统都有普适参考价值。

### 3. GCache 三级缓存的零成本策略值得所有推理系统借鉴

GCache 利用 GPU 机器上已被分配的 CPU 内存和 NVMe SSD，作为 KVCache 的二级/三级存储，实现了「额外存储成本为零」。RDMA 通信实现 170 GB/s 读吞吐和 280μs 延迟，使三级缓存在性能上也可接受。这种「混部存算」的思路——在推理节点上复用已有的 CPU/NVMe 资源作为缓存层——比独立部署缓存集群更经济。与 `Agent 评测的分层评分引擎` 的成本分层思路一致。

### 4. 计算量感知调度是对传统负载均衡的范式改进

传统负载均衡考虑的是请求数量均衡，而 MiMo 的「计算量感知优先调度」考虑的是真实计算 token 数量。这一差异在混合 Attention 架构下至关重要——不同请求的 Prefill 计算量可能相差数十倍（取决于输入长度和处理 attention 的层数）。优先处理计算量小的请求再辅以等待时间惩罚避免饥饿，这种「先易后难 + 公平补偿」的策略使 TTFT P90 降低 30%，同时不牺牲吞吐。

### 5. 多模态链路并行化的架构设计原则

MiMo 在多模态优化上的设计体现了一个重要原则——**将瓶颈操作从 CPU/IO 路径迁移至 GPU 计算路径**。图片预处理从 CPU 侧迁移至 GPU 消除大图瓶颈，视频解码多 chunk 多线程并行化，Encoder 支持跨请求 Batch。这背后是对「GPU 利用率高但 CPU/IO 成为瓶颈」现象的工程回应——当模型推理本身已高度优化时，数据预处理和传输的瓶颈就会凸显。随着多模态 Agent 场景增多（输入含图片、音频、视频），这一优化原则将变得越来越关键。

## 实践启示

1. **Attention 架构选择是推理成本的根本杠杆**：在模型设计阶段，对 Attention 比例的取舍直接影响部署成本。MiMo 的 Hybrid SWA 实践证明 10% 的全注意力层就足以维持质量。模型团队应在训练前就评估推理成本，而非先训后优化。

2. **前缀缓存在 SWA 架构下需要重新设计**：传统基于精确 token 匹配的缓存策略在 SWA 下失效。如果团队部署的模型使用 SWA 或变体，应参考 MiMo 的「窗口安全长度」方案重新设计缓存逻辑。

3. **推理优化要系统性考虑 KVCache、调度、Decode 三个维度**：单一维度的优化效果有限，MiMo 证明三维联动（KVCache 亲和调度 + 双池分治 + 投机解码）的协同效果远超各维度之和。建议推理系统团队以「全链路」视角而非「单点优化」视角制定优化计划。

4. **多模态 Agent 场景的瓶颈正在从模型推理转移到数据处理**：随着推理效率提升，图片/视频预处理和传输将逐渐成为延迟的主要贡献者。将预处理迁移到 GPU 并支持跨请求 Batch 是当前最有效的缓解策略。

5. **开源回馈是检验工程质量的试金石**：MiMo 将部分优化以 PR 形式回馈 SGLang 开源社区。回馈开源的过程强制团队将临时方案标准化为通用设计，本身就是工程自检。

## 相关实体

- `AReaL 2.0 在线 RL 系统` — 推理基础设施的另一个维度（RL 训练方）
- `Agent 评测体系化指南` — 分层效率设计的评估维度
- `洞察 Agent 可信推理链路` — 企业级推理应用场景
- `Codex Agent 项目配置` — Agent 推理客户端实践

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/mimo-v2-5-inference-system-optimization-hybrid-swa.md)

---

## Ch16.023 LLM 推理流水线完整解析：Prefill-Decode 双阶段模型

> 📊 Level ⭐⭐⭐ | 6.3KB | `entities/llm-inference-pipeline-internals.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/llm-inference-pipeline-internals.md)

# LLM 推理流水线完整解析

## 一句话

系统讲解 LLM 推理的完整流水线——从 tokenization 到流式输出，核心框架是 **prefill（计算受限）vs decode（内存受限）双阶段模型**，所有推理优化都针对其中一个阶段。

## 核心框架：Prefill vs Decode

LLM 的 `generate()` 调用在同一块 GPU 上经历两个截然不同的计算阶段：

| 阶段 | 工作方式 | 瓶颈 | 关键指标 |
|------|---------|------|---------|
| **Prefill** | 所有输入 token 并行处理，矩阵乘矩阵 | GPU 算术吞吐（compute-bound） | TTFT（Time to First Token） |
| **Decode** | 逐个 token 生成，query 向量 × 缓存矩阵 | 内存带宽（memory-bound） | ITL（Inter-Token Latency） |

**诊断原则**：当有人说模型慢，先判断是启动慢（prefill-bound → 优化 TTFT）还是流式输出慢（decode-bound → 优化 ITL）。二者消耗不同的硬件资源。

## 完整推理路径

### 1. Tokenization & Embedding

BPE tokenizer 将文本转为词表整数 ID（词表规模约 50K），映射到 `[vocab_size, hidden_dim]` embedding 矩阵。位置编码使用 **RoPE**（Rotary Position Embeddings）——通过旋转向量而非额外位置向量来编码位置。

### 2. Transformer 层

每层依次执行：
- **Self-attention**：为每个 token 计算 Q/K/V 投影，query 与所有 key 打分 → softmax → 加权混合 value
- **FFN**：两层 MLP 独立处理每个 token 向量（attention 跨位置传递信息，FFN 变换位置表示）

### 3. Prefill 阶段

所有输入 token 并行经过每一层，attention 以大型矩阵乘矩阵运行，GPU 利用率高。此阶段同时填充 **KV cache**（每层的 K/V 张量存入 GPU 内存供 decode 复用）。输出第一个 token。

### 4. Decode 阶段

每步只为新 token 计算 Q，与缓存中的 K/V 做 attention。算术量小但需从内存加载全部权重 + 完整 KV 缓存，瓶颈切换为内存带宽。

## KV Cache：推理的核心约束

无缓存时生成 1K token 回答需每步重算完整 attention（平方级复杂度）。KV cache 将 K/V 存一次、增量追加，提速约 5 倍以上。

**代价**：
- 13B 模型：每个 token 约消耗 1 MB KV cache
- 4K 上下文：仅 KV cache 占 4 GB 显存
- 直接与 batch size 争夺 GPU 内存 → 并发能力下降

**四种缓解方法**：

| 方法 | 原理 |
|------|------|
| KV cache 量化（INT8/INT4） | 降低缓存精度 |
| Sliding window attention | 丢弃固定窗口外的 token |
| GQA（Grouped-Query Attention） | 多个 head 共享 K/V，减少缓存张量 |
| PagedAttention（vLLM） | 像 OS 虚拟内存一样分页管理缓存，消除碎片 |

## DeepSeek V4：从结构上压缩 KV Cache

DeepSeek V4 Preview（2026-04-24）没有把 KV cache 当固定成本管理，而是重新设计 attention 让缓存结构性更小：

- **CSA**（Compressed Sparse Attention）：softmax-gated pooling 压缩 KV 4 倍 → sparse attention
- **HCA**（Heavily Compressed Attention）：128 个 token 的 KV 合并为 1 个压缩条目 → dense attention

效果（1M-token 上下文 vs V3.2）：
- 单 token 推理 FLOPs：**27%**
- KV cache：**10%**（bf16 下 9.62 GiB vs 83.9 GiB）
- 叠加 fp4/fp8 量化可再缩小 2 倍

→ 相关实体：[DeepSeek V4 本地推理](https://github.com/QianJinGuo/wiki/blob/main/entities/deepseek-v4-ds4c-antirez-local-inference-qbitai.md)

## 量化：收益最高的优化手段

内存节省与 bit width 线性相关：

| 精度 | 7B 模型显存 |
|------|-----------|
| FP32 | 28 GB |
| FP16/BF16 | 14 GB |
| INT8 | 7 GB |
| INT4 | 3.5 GB |

- INT4 是 7B 模型在笔记本 GPU（4-6 GB）上运行的关键
- GPTQ / AWQ 使用 per-channel scaling 降低质量损失
- INT4 通常只比全精度低 1-2 个百分点
- FP16→INT8 推理延迟通常减半，质量损失可忽略

## 推理服务基础设施

现代推理服务器的三种核心优化：

| 技术 | 作用 |
|------|------|
| **Continuous batching** | 同一 GPU step 交错处理多请求的 token，decode 阶段也能保持高利用率 |
| **Speculative decoding** | 小 draft model 先提多个 token → 大模型一次 forward pass 验证，串行→并行 |
| **PagedAttention**（vLLM） | 固定大小 block 管理 KV cache，消除碎片，提升并发 |

框架组合：vLLM、TensorRT-LLM、TGI。一块 GPU 可服务几十并发用户——decode 阶段大量闲置算力被 continuous batching 填满。

## 实践结论

1. **长 prompt 成本在 TTFT**（prefill），**长输出成本在 ITL**（decode）——消耗不同硬件资源
2. **上下文长度不免费**——膨胀 KV cache，直接降低 batch capacity
3. **decode 阶段 GPU 利用率可能仅 30%**——瓶颈在内存带宽不在算术计算
4. **解决方向**：更快的内存 + 更小的缓存 + 更好的 batching，而非更多算力

## 与现有知识的关联

- → [DeepSeek V4 本地推理](https://github.com/QianJinGuo/wiki/blob/main/entities/deepseek-v4-ds4c-antirez-local-inference-qbitai.md)：V4 的 CSA/HCA 架构创新（本文第 6 节）与 antirez 的 ds4.c 本地推理引擎互补
- → [GLM-5 Scaling Pain](https://github.com/QianJinGuo/wiki/blob/main/entities/glm5-scaling-pain-inference.md)：高并发推理下的竞态 Bug，是本文第 8 节"推理服务基础设施"的反面案例
- → [vLLM](https://github.com/QianJinGuo/wiki/blob/main/entities/vllm.md)：PagedAttention 的具体实现

---

## Ch16.024 elasticpp重塑elasticsearch查询性能的c内核引擎

> 📊 Level ⭐⭐⭐ | 6.2KB | `entities/elasticpp重塑elasticsearch查询性能的c内核引擎.md`

# elasticpp：重塑Elasticsearch查询性能的C++内核引擎

## 相关实体
- [Overcoming Reward Signal Challenges Verifiable Rewards Based Reinforcement Learn](https://github.com/QianJinGuo/wiki/blob/main/entities/overcoming-reward-signal-challenges-verifiable-rewards-based-reinforcement-learn.md)
- [Claude Code Hidden Settings 18](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-hidden-settings-18.md)
- [Alphaevolve交出一周年炸裂成绩单Ai自我改进不再科幻](https://github.com/QianJinGuo/wiki/blob/main/entities/alphaevolve交出一周年炸裂成绩单ai自我改进不再科幻.md)
- [Rag Chunking Optimization 2025](https://github.com/QianJinGuo/wiki/blob/main/entities/rag-chunking-optimization-2025.md)
- [Wangyunhe Harness Optimization Agentsoul](https://github.com/QianJinGuo/wiki/blob/main/entities/wangyunhe-harness-optimization-agentsoul.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/elasticpp重塑elasticsearch查询性能的c内核引擎.md)

## 深度分析

### 问题本质：JVM 查询引擎的结构性瓶颈

Elasticsearch 基于 Lucene 构建，而 Lucene 本质上是一个 Java 库。这意味着所有查询执行路径都运行在 JVM 上，受到 Java 虚拟机的固有约束。文章精准识别了两个相互强化的核心问题：

1. **长尾查询的线程池饱和**：ES 的查询线程池大小固定，当中长尾查询（涉及数十万到百万级文档的聚合、排序、扫描）密集出现时，线程池被长时间占用，导致所有查询（包括短查询）排队等待，延迟急剧恶化
2. **GC 抖动造成的延迟不确定性**：大量中间对象（迭代器、打分器、收集器）的频繁创建和销毁触发 GC，而 JVM 的垃圾回收是不可预测的——一次 Full GC 可将稳定在个位数毫秒的查询延迟推高到数百毫秒甚至秒级

这两个问题不是通过调参能解决的，因为它们的根源在于 **架构层面**：GC 问题的根因在 JVM，只要还在 JVM 上运行就无法彻底消除；而 Lucene 逐条处理文档的执行模型在大数据量下效率不高，但这是 Lucene 架构设计的固有特性。

### 技术路径：C++ Native 查询引擎的重新设计

elasticpp 没有选择替换整个 Elasticsearch，而是将最核心、最耗性能的查询执行路径用 C++ 重新实现，作为 ES 的插件通过 JNI 调用。这种「外科手术式」的改造有几个关键决策：

- **产品形态**：用户无需修改 DSL、无需迁移数据，甚至无需知道 elasticpp 的存在，通过 fallback 机制自动回退未支持的查询类型
- **索引兼容性**：完整实现了 Lucene 索引格式的读取能力，覆盖 Lucene90、Lucene99、Lucene101 及 ES 自定义编码，支持主流查询和常用聚合
- **性能优化三板斧**：批处理（降低函数调用次数，编译期模板特化消除虚函数调用）、预取（批量加载 DocValue 到连续内存，提升 CPU 缓存命中率）、零拷贝与解压缓存（合并解码和处理步骤，对频繁访问的压缩数据块缓存解压结果）

### 一个值得重视的工程教训：批处理的隐藏陷阱

文章中提到的 bug 很有代表性。将文档收集从逐条改为批处理后，部分查询的排序结果与 ES 原生引擎不一致。根因是 Lucene 查询体系中存在「分数改写」机制：某些查询类型会在初始打分后对分数进行二次改写（如将所有分数替换为常量，或乘以权重系数）。在逐条处理模式下，改写是串行发生的；而在批处理模式下，一批文档的分数先统一计算，如果后续改写逻辑没有正确作用于整个批次，就会出现分数不一致。

这个教训的普适性在于：**批处理不是简单地把「处理一个」改成「处理一批」。原有逐条处理逻辑中可能隐含着各种顺序依赖和状态改写，批量化之后都需要被重新审视。** 性能优化永远不能以正确性为代价。

### 效果与局限

从测试结果看，elasticpp 在聚合和排序类的长尾查询中有明显性能提升，已在生产环境中覆盖数十 TB 索引规模。但未来方向（存储计算分离、异步查询）说明当前方案仍有局限性——它本质上仍是单机计算模型，扩展性受到单机磁盘容量和资源的约束。

## 实践启示

### 架构层面

- **性能瓶颈的根因往往在架构，而非参数调优**。ES 的 GC 和长尾查询问题不是调整 JVM 参数能解决的，需要从执行模型层面重新设计
- **JNI/Native 集成是提升 Java 应用计算性能的可行路径**，但需要完整的索引格式兼容能力和 fallback 机制保证正确性
- **插件化改造是低风险的技术演进策略**：在不改变用户接口和现有数据的前提下，通过插件替换核心路径，降低了迁移风险和用户改造成本

### 工程层面

- **批处理改造必须重新审视所有隐式状态和顺序依赖**。特别是涉及分数改写、权重计算等操作时，要确保批处理模式下的语义等价性
- **对比调试（Native 侧 GDB + Java 侧 IDEA）是排查 JNI 问题的有效手段**，问题只在特定查询组合下触发时，单一语言的单元测试难以覆盖
- **性能优化的效果是叠加的**。批处理、预取、零拷贝每个单独看都只是节省少量开销，但叠加在数十万次文档处理上，效果非常明显

### 系统设计层面

- **线程池饱和是分布式查询系统的共性问题**。当查询执行时间的长尾分布较重时，固定大小的线程池会成为系统瓶颈。异步查询和更灵活的资源管理是长期方向
- **延迟不确定性问题对 SLA 承诺的影响**。GC 抖动的不可预测性使得延迟敏感业务难以承诺稳定的 SLA，这是推动向 native 层迁移的核心业务动机之一
- **存储计算分离是索引规模持续增长后的必然选择**，单机磁盘容量会成为瓶颈，计算和存储需要能独立扩展

---

## Ch16.025 腾讯混元 Hy3 preview 在 Hopper 卡上的推理优化实践

> 📊 Level ⭐⭐⭐ | 5.0KB | `entities/tencent-hunyuan-hy3-preview-hopper-inference-optimization.md`

# 腾讯混元 Hy3 preview 在 Hopper 卡上的推理优化实践

腾讯混元 AI Infra 推理团队对 Hy3 preview（GQA+MoE，295B/21B，256K 上下文）在 NVIDIA Hopper 96G 卡上进行了全栈推理优化，覆盖算子优化与融合、并行策略、多级缓存、MTP 异步调度、量化与稀疏五大维度。

## 算子优化

**动态调度 Attention**：所有请求按统一 Tile 粒度拆分，贪心装桶算法实现极致均分，Task Assign 模块每次推理前生成专属任务映射表。单 batch 长文本加速 2.95x，混合长度 batch 加速 1.59x~1.76x。

**双 BF16 Router GEMM**：FP32 权重拆分为高位 BF16 + 低位残差 BF16，两次 BF16 GEMM 线性组合，融合至单一 Kernel，全程无 HBM 往返。相比 FP32(cuBLAS) 2.86x~3.22x 加速。

**FusedMoE 全流水线重构**：路由与索引预处理、Gate-Up GEMM、激活量化+Down GEMM、Top-K 加权聚合、PDL 无气泡串联。TP=8/EP=1 场景相比 vLLM CUTLASS/Triton、SGLang 1.5x~1.6x 加速。

## 算子融合

**Fused Rope+Norm+Hadamard+Quant+Store KV**：5 个 Element-wise 算子重构为单一微型流水线 Kernel，寄存器级数据流转，在线量化直接低比特写入 KV Cache，加速约 5x。

**Fused AllReduce+Norm+Add**：通信、残差计算、归一化全链路融合，高吞吐版（NVSwitch 多播）+ 低延迟版（Lamport P2P），覆盖 8~32k tokens，最高加速 1.68x。

**采样融合算子**：10 余个零碎 Kernel 融合为 2 个核心 CUDA Kernel，全词表单次加载，GPU 闭环惩罚计算，相比 vLLM/FlashInfer 提升约 5.5x/2.5x。

**GEMM+Comm 通算融合**：SM 显式划分为计算 SM（矩阵乘）与通信 SM（RS 搬运），Load→MMA→Epilogue 三级流水，Tile 级计算与通信重叠，加速比 1.68x~1.81x。

## 并行策略

**Prefill TPSP**：SP 拆分 + 通算融合 + 通信量化 + 并行模式调整。Prefill 16k TTFT 降 29.9%（764→536ms），32k 降 24.5%（1885→1424ms）。

**Decode DP+EP**：Attention DP + MoE EP 跨节点混合并行，自研 HPC Kernel，Async EPLB 权重重排与 Decode 完全重叠，端到端吞吐提升 15.7~44.7%。

## 多级缓存

GPU→CPU→KVStore 三级缓存体系，请求按 L1→L2→L3 顺序查询可复用前缀，新 Block 异步下沉至 L2/L3。

## MTP 异步调度

解除 CPU 对真实接收长度的同步依赖，按最大接收长度提前准备，减少 decode 间 5~10ms CPU 气泡，端到端提升 10%~20%。

## 量化压缩

**AngelSlim 量化**：GPTQ 权重重建 + 激活平滑与旋转变换 + QAT 轻量化微调。Attn FP8 + W4A8 配置下精度无损（与 BF16 基线差距 < 1%），端到端吞吐提升 28%+。

**Stem 稀疏注意力**：Token Position-Decay（头部 k_start 线性衰减到尾部 k_end = μ·k_start）+ Output-Aware Metric（OAM: QK^T + β·max(0, log(||V_j||₂))）。25% 计算预算实现接近稠密注意力精度，128K 上下文 Prefill 延迟降低 3.6x。

## 与现有知识库的关联

- [腾讯混元 Hy3 preview 发布](https://github.com/QianJinGuo/wiki/blob/main/entities/腾讯混元新里程碑hy3-preview-发布开源agent-表现全面提升.md)：互补实体，该篇讲模型能力与发布，本篇讲推理优化技术细节
- [LLM 推理流水线](https://github.com/QianJinGuo/wiki/blob/main/entities/llm-inference-pipeline-internals.md)：推理优化基础知识，本篇是 Hy3 的具体工程实践
- [模型蒸馏与压缩](https://github.com/QianJinGuo/wiki/blob/main/concepts/model-distillation-compression.md)：量化压缩（W4A8、AngelSlim）是模型压缩的推理侧实践
- [Transformer 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/transformer-architecture.md)：GQA + MoE 架构是 Hy3 的基础

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/tencent-hunyuan-hy3-preview-hopper-inference-optimization.md)

---

## Ch16.026 vLLM V0 to V1: Correctness Before Corrections in RL

> 📊 Level ⭐⭐⭐ | 4.6KB | `entities/servicenow-vllm-correctness.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/servicenow-vllm-correctness-huggingface.md)

## 深度分析
vLLM V0 到 V1 是实质性重写，而非增量迭代。ServiceNow AI 的这篇博客核心贡献是展示了在 RL 训练中进行推理引擎迁移时，如何系统性地隔离和修复正确性差距，而非直接诉诸目标函数层面的修正。
**logprobs 语义不匹配是首个拦路虎。** vLLM V1 默认返回原始模型输出的 logprobs（在 temperature scaling、penalties、top-k/top-p 过滤之前），而 PipelineRL 期望的是经过采样器处理的分布的 logprobs。设置 `logprobs-mode=processed_logprobs` 修复了均值偏移，但训练曲线仍有差距——说明单一修复不够，下一个问题的根因在推理路径本身。
**V1 运行时默认值引入的隐性差异。**  prefix caching（默认开启）和 async scheduling（默认开启）在 V1 中与 V0 行为不同。prefix caching 在 online RL 场景下尤其危险：前缀缓存命中可能在权重更新边界之前重用已计算状态，导致 actor 拿到过期推理结果。禁用 prefix caching 和 async scheduling 是还原 V0 等效行为的必要步骤。
**inflight weight update 的语义对齐。** V0 的权重同步机制本质上是：阻塞在引擎边界 → 加载新权重 → 恢复执行，不显式清除缓存状态。V1 的等效方案是 `pause_generation(mode="keep", clear_cache=False)` → RPC 传递权重更新 → `resume_generation()`。关键在于 `mode="keep"` 和 `clear_cache=False` 匹配了 V0 的隐式语义。
**fp32 lm_head 的必要性有独立文献支撑。** MiniMax-M1 技术报告已经发现 RL 训练/推理 token 概率不匹配问题并归因于 LM 输出头，ScaleRL 论文也将 fp32 logits/head 计算纳入大规模 RL 配方并 ablation 验证。这是 RL 推理引擎迁移时不可忽略的数值精度问题，因为 logprobs 直接进入策略比率、KL 和裁剪计算。

## 实践启示
**推理引擎迁移时先做后端等效性验证，再调整 RL 目标函数。** 这是 ServiceNow 最核心的经验。错误的顺序（先改目标函数再修后端）会导致目标侧的修正掩盖后端问题，使训练曲线难以解读，无法判断收益来源是目标改进还是后端补偿。
**online RL 场景下 prefix caching 需要特别谨慎。** 论文描述的问题本质是：缓存的生命周期管理在权重异步更新场景下与静态推理场景不同步。如果你的 RL pipeline 有并发请求、异步调度或 inflight weight updates，prefix caching 可能引入难以察觉的状态污染。
**logprobs 模式选择是 vLLM V1 迁移的第一个检查项。** 任何 PipelineRL/GSPO/PPO/GRPO 系统在切换到 V1 前，首先确认 `logprobs-mode` 设置与训练器期望一致。默认值差异会导致所有 downstream metrics（clip rate、KL、entropy、reward）全面漂移。
**lag 是有用的运行时诊断信号。** 初始 V1 路径在训练后期携带更多持续性 lag，最终 V1 修正路径的 lag 曲线更接近 V0 参考。这提供了一个可直接观察的训练健康度指标——如果你的 rollout engine 和 trainer 之间的权重 lag 在训练后期持续扩大，说明后端同步机制可能存在问题。
**后端等效性恢复后，下一步是 async/off-policy 清理。** 保持 rollout 时刻的 behavior policy logprobs，在优化时重新计算 trainer-side old policy logprobs，将后端差异修正与策略更新比率分离，跟踪 ESS 等诊断指标——这些是后端 parity 达成后的自然下一步。

## 相关实体
- [servicenow vllm correctness huggingface](https://github.com/QianJinGuo/wiki/blob/main/entities/servicenow-vllm-correctness-huggingface.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/vllm-v0-to-v1-correctness-before-corrections.md)

- [vLLM V0→V1 迁移中的 logprob 差异修复](https://github.com/QianJinGuo/wiki/blob/main/entities/vllm-v0-to-v1-correctness-before-corrections.md)
- [无惧off-policy偏移！bengio团队解绑后训练，大模型rl提速50倍](https://github.com/QianJinGuo/wiki/blob/main/entities/trajectory-balance-asynchrony-tba-bengio-papweekly.md)

---

## Ch16.027 Bonsai Image 4B: 1-bit 和 Ternary 量化

> 📊 Level ⭐⭐⭐ | 4.4KB | `entities/bonsai-image-4b-quantization.md`

# Bonsai Image 4B: 1-bit 和 Ternary 量化

> **Background**: 本文档基于对外部技术来源的评分入库建立，v×c=7×7=49。

## 核心要点

1-bit 和 Ternary 量化图像扩散模型 Bonsai Image 4B 的技术发布，8.3x 和 6.4x 相比 FP16 的压缩比

---

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/introducing-1-bit-and-ternary-bonsai-image-4b-image-generati-352fe9.md)

## 深度分析

**1. Group-wise Scaling Factor 是量化质量的关键**

1-bit 和 Ternary 量化的核心不在于简单地将权重二值化或三值化，而在于保留了 FP16 分组缩放因子。每个权重分组拥有独立的缩放系数，使得 1-bit 模型实际达到 1.125 有效位数，Ternary 模型达到 1.71 有效位数。这种设计在极端压缩下仍能保留大部分模型能力，是 Bonsai 系列的核心技术路径。

**2. Precision-sensitive Projection Layers 保留策略**

虽然主体 transformer 权重被压缩到 1-bit 或 Ternary，但约 5% 的投影层（projection layers）被保留为 FP16 精度。原文指出这些是"precision-sensitive"的组件，表明并非所有权重对量化同等敏感。这一发现意味着未来量化研究可以针对不同层类型采取差异化的精度策略。

**3. Ternary 的 {−1, 0, +1} 提供了重要的表征灵活性**

相比 1-bit 的 {−1, +1}，Ternary 加入了 0 状态，形成 {−1, 0, +1}。这一额外的中间态显著提升了视觉质量和提示词忠实度：Ternary 保留了原模型的 95% 性能，而 1-bit 仅有 88%。零值状态在稀疏计算中有潜在优势，可以在推理时跳过零值计算，进一步提升效率。

**4. 质量–体积 Pareto 前沿的实质性推进**

Bonsai Image 4B 在 6.4x 压缩下仅损失 5% 质量（GenEval 0.723 vs 0.819），而体积相似的 BK-SDM-Small（0.98GB）仅保留 42% 性能。这说明 Bonsai 的量化不是以线性质量损失为代价，而是在相同体积下实现了能力的大幅跃升，重新定义了"小模型能做什么"的标准。

**5. iPhone 部署验证了移动端可行性的临界点**

Bonsai Image 4B 是其参数级别上首个直接在 iPhone 上运行的图像生成模型。在 iPhone 17 Pro Max 上生成 512x512 图像仅需 9.4 秒，这意味着移动端图像生成的交互延迟已进入可接受范围。平均活跃内存 1.5–1.96GB 的表现证明极量化和架构共同构成了移动部署的可行路径。

## 实践启示

**1. 优先考虑 Ternary 量化作为质量–压缩平衡点**

如果应用场景对图像质量有要求，Ternary 的 6.4x 压缩比和 95% 性能保留是更优选择。只有在极端内存约束（如 1GB 以下 transformer）时，才考虑 1-bit 方案。Apache 2.0 许可下可直接商用，无需考虑授权成本。

**2. 结合 [Ai Infra Llm Efficient Inference Vllm](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-infra-llm-efficient-inference-vllm.md) 进一步降低推理延迟**

虽然 Bonsai 本身已针对 Apple Silicon（MLX）和 CUDA（Gemlite）做了 kernel 优化，但在端侧部署时可结合推理优化技术（如批处理策略、KV cache 管理）进一步提升吞吐。Bonsai Studio iOS app 的部署案例提供了参考实现路径。

**3. 利用文本编码器 offloading 策略降低运行时内存**

在 512x512 图像生成时，平均活跃内存（1.5GB / 1.96GB）显著小于总部署 payload（3.42GB / 3.88GB），因为文本编码器在提示词编码完成后即可卸载。这一策略可直接应用于类似架构的部署优化，在长 prompt 场景下收益尤其明显。

**4. 关注 zero-state 的稀疏计算加速潜力**

Ternary 权重中的零值可以在推理时跳过相关计算，结合稀疏 kernel 可能实现进一步加速。这意味着在设计端侧推理 engine 时，应考虑对 {0} 值的条件分支优化或 mask 化处理。

**5. 评估跨平台推理栈的统一抽象层**

Bonsai 同时支持 Apple Silicon（MLX）和 CUDA（Gemlite），对于需要跨平台部署的团队，建议关注 MLX（Apple）和 Gemlite（NVIDIA）背后的底层 kernel 差异，或探索如 llama.cpp 风格的统一推理抽象，以同时覆盖手机端和桌面端 GPU 场景。

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/vision-multimodal.md)

---

## Ch16.028 Pytorch in Kernel Recsys Optimization

> 📊 Level ⭐⭐⭐ | 4.4KB | `entities/pytorch-in-kernel-recsys-optimization.md`

## 深度分析

**消除而非优化：Kernel 层设计的方法论突破：** IKBO 的核心洞察是"broadcast 是数据布局问题，而非计算必需"——传统方法在系统层面处理 broadcast 复制，浪费内存带宽和计算资源；而 IKBO 在计算原语层面消除复制，让 kernel 内部处理 mismatched batch sizes。这个思维转换将优化方向从"workaround 问题"转向"消除问题根源"，实现了 2/3 的延迟降低。这种**在根源处解决问题**而非在表面做修补的思想，对其他 AI 系统优化有普遍借鉴意义。 See also [Harness Production Agent Engineering Deficit](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-production-agent-engineering-deficit.md)

**Kernel-Model-System 三层协同设计是性能突破的关键：** IKBO 的成功不只是 kernel 优化的功劳，而是 kernel、ML 编译器、inference runtime 三层协同设计的结果。Kernel 层提供支持 mismatched RO/NRO batch sizes 的原生接口；编译器层需要 per-operator dynamic shape ranges 来选择正确形状的 kernel；runtime 层通过 candidate-to-user mapping 而非 materializing broadcast 传递信息。任何一层单独优化都无法达到最终效果，**系统级协同优化才能实现数量级突破**。

**渐进式协同设计是工程落地的合理路径：** IKBO Linear Compression 经历了四个阶段的渐进优化：matmul decomposition → memory alignment → broadcast fusion → warp-specialized multi-stage fusion via TLX，最终在 H100 SXM5 上实现 ~4× 加速。这个过程说明**性能优化不是一步到位的**，而是需要持续迭代、逐步逼近硬件极限。每一步优化都为下一步创造条件，最终的 warp-specialized fusion 无法在初始阶段直接实现。

**IO-bound 到 compute-bound 的转变是性能优化的分水岭：** IKBO 将 Flash Attention kernel 从 IO-bound 推向 compute-bound，峰值达到 621 BF16 TFLOPs（H100 SXM5）。在 GPU 编程中，IO-bound 意味着 kernel 性能受限于内存带宽，而非算力——此时增加更多计算单元也无法提升性能。**转变为 compute-bound 是优化的关键里程碑**，意味着 kernel 已经充分利用了硬件的算力潜能，继续优化需要从算法或数据布局入手。

**RecSys 推理优化的独特挑战来自 user-candidate 不对称性：** 与传统 DNN 不同，RecSys 的 user embeddings 对所有 candidate 都相同，但 candidate 数量（10-10,000+）远大于 user 数量，导致 broadcast 复制开销随 candidate 数量线性增长。这个问题在 CV/NLP 任务中不存在，因为它们的 batch 维度天然对称。理解这个**领域特有的不对称性**，是设计高效 RecSys 系统的前提。

## 实践启示

- **遇到性能瓶颈时，先判断是 IO-bound 还是 compute-bound**：如果 kernel 已经是 compute-bound，继续优化算法或数据布局才有意义；如果是 IO-bound，优化方向应该是减少内存访问或提高内存访问效率，而非增加计算量。

- **Kernel 优化采用渐进式策略**：先实现功能正确的版本，再逐步优化——从基础 matmul 到 decomposition，再到 memory alignment，最后做 fusion。一次性写出最优 kernel 既不现实也不高效。

- **RecSys 系统的 broadcast 开销需要专门优化**：当 user-candidate 不对称时，传统的 explicit replication 会造成严重的内存和计算浪费。考虑在 kernel 内部处理 broadcast，而非在系统层面 materialization。

- **Inference-time transformation 可实现无感的系统升级**：Meta 的 IKBO 支持在推理时自动替换标准操作为 IKBO 等效操作，无需模型代码变更。这种**无破坏性升级**能力对生产系统非常重要。

- **Custom kernel 开发需要工具链配合**：TLX (Triton Low-Level Extensions) 提供了 warp-specialized fusion 能力，但需要与 ML 编译器、inference runtime 配合使用。单独优化 kernel 而忽视其他层级，往往无法达到预期效果。

---

## Ch16.029 14× faster embeddings: how we rebuilt the ONNX path in Manticore

> 📊 Level ⭐⭐⭐ | 4.2KB | `entities/14-faster-embeddings-how-we-rebuilt-the-onnx-path-in-mantico.md`

# 14× faster embeddings: how we rebuilt the ONNX path in Manticore

> Source: [14× faster embeddings: how we rebuilt the ONNX path in Manticore](https://manticoresearch.com/blog/onnx-embeddings-speedup) | Score: v*c=81

## Overview

Published Time: 2026-06-25T00:00:00.00Z

Markdown Content:
When we shipped [Auto Embeddings](https://manticoresearch.com/blog/auto-embeddings/) — the feature that turns any text column into a vector automatically, with no separate model service to run — the most common piece of feedback was about speed. The previous path went through SentenceTransformers on top of [Candle](https://github.com/huggingface/candle) , Hugging Face's pure-Rust ML inference runtime, and it left a lot of CPU on the floor: most workloads sat in the low-double-digits of docs/sec no matter how we fed them, and concurrent calls serialised on a single model session.

So we spent a few weeks rebuilding how Manticore runs ONNX models. The new ONNX Runtime backend shipped in [Manticore Search 27.1.5](https://manticoresearch.com/blog/manticore-search-27-1-5/) . ONNX (Open Neural Network Exchange) is the portable model format that most of the popular open-source embedding models — MiniLM, BGE, E5, and friends — already publish. The result is a backend that's **~14× faster on average than the previous SentenceTransformers/Candle path** on the same hardware (average cheap 16 cores / 32 threads server), same model, same weights, averaged over the full `threads × batch` workload grid — and that advantage holds whether you run 1 client thread or 32. The old path stayed in the 5–11 docs/sec range across the entire grid; the new one lives in the 70–230 docs/sec band.

This post is the engineering log: what we tried, what surprised us, what we threw away, and what the final design looks like.

## TL;DR

*   **~14× faster on average than the previous SentenceTransformers/Candle path**, averaged across the full `threads × batch` workload grid (1 / 2 / 4 / 8 / 16 / 32 threads × batch sizes 1…128) on the same box (16 cores / 32 threads), same model, same weights.
*   Released in [Manticore Search 27.1.5](https://manticoresearch.com/blog/manticore-search-27-1-5/) , the new ONNX path is now the default fast path for any HuggingFace model that ships an `.onnx` file.
*   On `all-MiniLM-L12-v2`, the old Candle path sat at **5–11 docs/sec** across every configuration we tried. The new ONNX path lands in the **70–230 docs/sec** range — the **same ~14× margin holds whether you run 1 client thread or 32**.
*   Single-insert latency on our test box: **~14 ms** with a single client, **~56 ms** under 8-way concurrent load — both well below the 200+ ms Candle was hitting.
*   **Want maximum bulk ingest throughput?** Use a **high batch size** (32–128) on a **single client thread**. The new backend parallelises inside the call, so client-side fan-out just piles coordination overhead on top — peak on our box was **233 docs/sec at 1 thread + batch=64**.
*   The two changes that mattered most: turning **`intra_op_spinning` off**, and giving up on batching documents inside the worker.
*   No user-facing API changes. A table that already points at an ONNX-capable `MODEL_NAME` picks up the new path automatically

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/14-faster-embeddings-how-we-rebuilt-the-onnx-path-in-mantico.md)

---

## Ch16.030 Model Routing Is Simple. Until It Isn't — IBM Research 多目标优化路由

> 📊 Level ⭐⭐⭐ | 3.0KB | `entities/ibm-research-model-routing-optimization-2026.md`

# Model Routing Is Simple. Until It Isn't — IBM Research 多目标优化路由

> **IBM Research 在 Hugging Face 发表的生产级模型路由实践**：将路由从分类问题（"哪个模型最适合这个任务"）重新定义为多目标优化问题，在成本、质量和延迟之间找到最佳 operating point。

## 核心洞察

传统的模型路由被当作分类问题——评估任务难度，分配给相应能力的模型。IBM Research 指出这种思路在生产中失效，原因有三：

**1. 成本不仅是模型定价。** Agent 工作负载往往跨步骤复用大量上下文。当缓存命中率高时，有效输入成本大幅下降。Sonnet 的低 cache-read 定价使其从这一模式中受益显著。只看定价表的路由器是在优化错误的目标。

**2. 复杂度不仅是任务难度。** 一个看似简单的请求（如"总结这份合同"）可能触发检索、合规检查、工具调用和多轮细化。任务的真实复杂度在运行前不可见。生产中路由器需要同时平衡成本、延迟、模型专业化、可靠性、合规要求和数据驻留规则。

**3. 延迟不仅是模型速度。** 用户实际感受到的响应时间取决于硬件、缓存状态、端点负载等基础设施因素。每一步都做路由提供更大的灵活性，但每次决策都会引入延迟和操作复杂度。

## 系统实现

IBM Research 的路由器将路由重新定义为**优化问题**而非分类问题：

- 算法同时在 cost-quality-latency 三个维度上优化
- 轻量级设计：每个任务仅 6ms 和 2KB 内存
- 提供多个 operating point 供选择

在 AppWorld Test Challenge + CodeAct agent 上的实测结果：

| 配置 | 准确率 | 成本 | 延迟 | 相比 Opus 单独运行 |
|------|--------|------|------|-------------------|
| 延迟优化 | 84% | $93 | 83s | 成本↓21%, 延迟↓9%, 准确率仅↓4% |
| 成本优化 | 略低 | 更低 | - | 进一步压降成本 |

传统的基于难度的路由器（difficulty-based）能达到相近准确率范围但成本更高——因为它无法像优化方法一样探索完整的 tradeoff 空间。

## 相关信息

- [Netflix Switchboard → Lightbulb](https://github.com/QianJinGuo/wiki/blob/main/entities/netflix-switchboard-lightbulb-model-routing.md) 侧重 A/B 实验和 ML serving 基础设施
- [Amazon Bedrock 开源 Model Router](https://github.com/QianJinGuo/wiki/blob/main/entities/simplify-model-selection-in-amazon-bedrock-with-open-source-model-router.md) 侧重 AWS 生态下的集成方案

- → [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ibm-research-model-routing-optimization-2026.md)

---

## Ch16.031 PUMA — 语义保持的推理模型早停（Semantic-Preserving Early Exit for Reasoning Models）

> 📊 Level ⭐⭐⭐⭐ | 7.4KB | `entities/puma-semantic-early-exit-reasoning-convergence-2605.md`

# PUMA — 语义保持的推理模型早停

PUMA（**P**reserving se**U**mantics for reasoning convergence dete**M**in**A**tion）是一种用于推理大模型（LRM）的早停方法，核心思路是从语义收敛性而非答案置信度来判断推理是否完成。

## 背景：LRM 的过度思考问题

推理大模型（如 DeepSeek-R1、o1、Qwen3-Thinking）靠长思维链拿高分，但存在普遍过度思考问题。研究表明，五个代表性模型中有 41–52% 的推理 token 生成在模型首次给出最终答案之后，大量算力浪费在答案后的冗余续写。

现有 inference-time early-exit 方法大多盯着 trial answer 的 readiness——从当前推理前缀探测临时答案，检查置信度、连续性等信号。但答案看起来稳定不代表推理真的收敛：模型可能在探索、自我纠错过程中短暂给出高置信甚至连续一致的错误答案。

## PUMA 的核心思路

PUMA 的早停思路是：**不只看答案是否稳定，主要看最近的推理是否还在产生新的语义进展**。当推理开始反复复述既有结论、不再提供新的语义信息时，说明推理大概率已收敛，此时才值得考虑停止。

## 实验结果

在 5 个模型 × 5 个高难度基准上平均减少 **26.2%** 推理 token 且保持准确率。方法具有以下特性：

- **零样本迁移**：可迁移到代码生成与多模态推理场景
- **可学习**：可作为训练信号内化进模型，实现推理效率的内生优化
- **跨模型迁移**：在不同规模与架构的推理模型上均有效

## 相关信息

- 论文：*Stop When Reasoning Converges: Semantic-Preserving Early Exit for Reasoning Models*
- arxiv：2605.17672
- 代码：https://github.com/giovanni-vaccarino/PUMA

## 深度分析

### 1. 从"答案就绪"到"推理收敛"：早停信号的范式转移

PUMA 的核心贡献在于识别出"答案就绪（Readiness）"和"推理收敛（Convergence）"是两种不同的概念，而现有早停方法都错误地混用了它们。实验量化了这一盲区：置信度信号的误停率平均约 44%、答案一致性约 64%，其中相当一部分属于"过早退出"——若不打断，模型本能继续自我纠正并最终答对。阈值扫描表明这一权衡无法靠调参消除。PUMA 改而观察"最近的推理是否还在产生新的语义进展"——当推理开始反复复述既有结论、不再提供新的语义信息时，说明推理大概率已收敛，此时才值得考虑停止。

### 2. 冗余探测器 + 答案复核的双层决策架构

PUMA 的设计巧妙地将"在哪里考虑停"和"到底能不能停"拆分为两个独立决策层。第一层是一个轻量级冗余探测器（基于 Qwen3-Embedding-0.6B 对比学习微调的嵌入模型），实时计算当前推理步骤与近邻步骤的语义相似度，语义冗余升高时标记为候选退出点。第二层是答案复核——仅在候选点上触发，检查试探答案的置信度、多个候选点的一致性、置信度有无明显下滑。两层都通过才真正停止。这种分层架构大幅降低了误停率，同时将冗余探测器的计算开销控制在极低水平（0.4–1.1% 总耗时）。

### 3. 多维度可迁移性：零样本跨越任务、模态和模型

PUMA 的语义收敛信号展现出优秀的多维度可迁移性：(1) 任务迁移——从数学推理零样本迁移到代码生成（LiveCodeBench，仅调整冗余阈值 τ_sim=0.50）减少 18–19% token、pass@1 波动 ≤1.5%；(2) 模态迁移——多模态推理（MathVista/MathVision）不重训不调参，token 减少 23.8–33.6%；(3) 内化迁移——将退出位置作为监督信号通过 SFT/DPO/GRPO 内化进模型后，部署时无需 PUMA 模块也能自主早停，平均准确率（67.0）与 token 缩减（34.9%）甚至反超免训练版。

### 4. LRM 过度思考的定量证据与工程影响

论文给出的定量数据对推理效率工程有直接指导意义：五个代表性模型中 41–52% 的推理 token 在模型首次给出最终答案之后生成，多数模型在推理进度 40–60% 附近就已达到最终会提交的答案。这意味着部署 LRM 的推理成本中，近一半可能花在冗余续写上。PUMA 平均减少 26.2% token 且保持准确率，部分设置下因避开了答案后的"后期漂移"准确率反而略有上升——压缩了冗余却不压缩必要推理，这是与简单 prompt 压缩（使准确率从 81.7% 跌至 45–60%）的本质区别。

## 实践启示

1. **LRM 推理优化应优先关注"答案后冗余"而非简单压缩**：41–52% 的推理 token 生成在最终答案之后，这意味着推理成本优化空间巨大。但简单要求模型"少说一点"会连必要推理一起压掉（准确率从 81.7% 跌至 45–60%）。应优先采用 PUMA 这类语义收敛检测方法，它做的是"删掉收敛后的冗余"，不是把思考过程生硬砍半。

2. **语义相似度可作为早停的稳健信号**：PUMA 证明，基于语义嵌入的步骤间相似度在收敛时才明显升高，其误停率远低于基于答案置信度或一致性的方法。对于部署推理模型的团队，可以考虑在推理框架中集成类似的语义冗余探测器作为性能优化层。

3. **早停信号的内化为模型训练提供了新范式**：PUMA 证明退出位置可以通过 SFT/DPO/GRPO 内化进模型，使模型在部署时无需外部模块也能自主早停。这意味着可以将推理效率优化从"推理时中间件"进化为"训练时内化能力"，这是推理效率工程的长期方向。

4. **LoRA/Adapter 级别的推理优化值得探索**：PUMA 的早期退出点定位仅依赖轻量嵌入模型（0.6B 参数，0.4–1.1% 耗时），说明推理优化的关键不在模型大小而在于信号设计的质量。对于资源受限的部署场景，可以探索类似 LoRA 或 Adapter 级别的早停模块，以极小的参数代价换取显著的 token 缩减。

## 相关实体

- 关于推理模型过度思考的信号早在 [Qwen 3.5 分析](https://github.com/QianJinGuo/wiki/blob/main/entities/latest-open-artifacts-19-qwen-glm-minimax-interconnects.md) 中已有提及（小模型 overthinking 倾向）
- 推理效率优化是 [LLM 推理成本与安全](https://github.com/QianJinGuo/wiki/blob/main/entities/llm-thonking-reasoning-effort-security-triage.md) 讨论的重要维度

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/puma-semantic-early-exit-reasoning-convergence-2605.md)

---
