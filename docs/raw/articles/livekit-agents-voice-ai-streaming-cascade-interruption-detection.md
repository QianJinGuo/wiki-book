---
source_url: https://mp.weixin.qq.com/s/SMqIYoWUlbr0B_OaWbXxNA
tags: [wechat, article, claude, openai]
title: "LiveKit Agents：给大模型接上麦克风，没你想的那么简单"
author: 数有灵兮
published_date: 2026-05-19
review_value: 7
review_confidence: 8
review_recommendation: worth-reading
review_stars: 3
ingested: true
sha256: 22595975f03d16d5fe836173f93a3568a38e080049e056655fe006edf0f240c3
---
---
# LiveKit Agents：给大模型接上麦克风，没你想的那么简单
> 来源：[数有灵兮](https://mp.weixin.qq.com/s/SMqIYoWUlbr0B_OaWbXxNA)｜2026-05-19
## 一、"接上麦克风"的幻觉
很多人第一次看到大模型的语音 Demo，都会产生一种错觉：这不就是把 STT、LLM、TTS 三个 API 串起来吗？
真到了生产环境，你会发现这三行胶水代码能让你加班到凌晨三点。
**延迟是第一个杀手。** 假设 STT 需要 500ms，LLM 首 token 需要 800ms，TTS 合成需要 400ms，光这三段串行等待就是 1.7 秒。人类对话中，正常的回复间隔大概在 200-500ms。超过 1 秒，用户的耐心开始流失；超过 2 秒，他们会以为你断线了。
**打断是第二个杀手。** 人和人说话的时候，随时都可能插嘴。但如果你的语音 Agent 正在念一段长回复，用户突然开口说"等等，不对"——你怎么办？是立刻停下来？还是继续念完？如果用户只是清了个嗓子呢？如果用户说了个"嗯"呢？
**并发和调度是第三个杀手。** 一个语音 Agent 在生产环境里不可能只服务一个人。当 100 个用户同时打进来，你的 Agent Worker 怎么分配？音频流怎么路由？
## 二、流式级联：每一毫秒都在和延迟赛跑
LiveKit Agents 的核心架构是一个四层流式级联管线：**VAD → STT → LLM → TTS**。
传统的做法是"接力赛"：STT 跑完把完整文本交给 LLM，LLM 生成完整回复交给 TTS。每个环节都要等上一个环节彻底跑完，延迟能到 3-5 秒。
LiveKit 的做法是"流水线"：每个环节不等上游出完整结果，拿到一点就往下传一点。
- **VAD（Voice Activity Detection）** 是"门卫"。它实时监听音频流，逐帧判断当前是人声还是沉默。一旦检测到人声，就立刻把音频片段递给 STT
- **STT** 拿到音频片段后开始流式转写，输出 partial transcript——也就是还没转完的半截文字。这些半截文字就已经被递给了 LLM
- **LLM** 不等完整问题，而是根据已经收到的部分转写开始"预判"用户意图，准备生成回复。等最后几个词到齐，LLM 几乎能立刻开始流式输出 token
- **TTS** 收到 LLM 的前几个 token 就开始合成语音。用户听到第一个字的时候，LLM 可能还在生成第三句话
实际测试下来，用 Deepgram 做 STT + GPT-4.1-mini 做 LLM + Cartesia 做 TTS，首字响应可以压到 **500-800ms**。如果换成 OpenAI 的 Realtime API 走端到端模式，延迟甚至能到 **300ms 以下**。
```python
from livekit.agents import Agent, AgentSession, AgentServer, JobContext, function_tool
from livekit.plugins import silero
@function_tool
async def lookup_weather(context, location: str):
    return {"weather": "晴天", "temperature": 28}
server = AgentServer()
@server.rtc_session()
async def entrypoint(ctx: JobContext):
    session = AgentSession(
        vad=silero.VAD.load(),
        stt="deepgram/nova-3",
        llm="openai/gpt-4.1-mini",
        tts="cartesia/sonic-3:voice-id",
    )
    agent = Agent(
        instructions="你是一个友好的语音助手。",
        tools=[lookup_weather],
    )
    await session.start(agent=agent, room=ctx.room)
```
## 三、语义打断检测：区分"嗯"和"等等不对"
传统方案只用 VAD 做打断检测：只要 VAD 检测到用户端有声音，就认为是打断，立刻停止 TTS 输出。假阳性极高——用户咳嗽一声、说个"嗯"、甚至旁边有人经过，Agent 都会突然闭嘴。
LiveKit 的解法是两层检测：
1. **VAD**（第一层）：基础的音量检测，判断"用户那边有没有声音"。快但粗糙。
2. **语义打断检测器**（第二层）：同时分析 VAD 的声学信号和 STT 的转录文本，输出一个概率值：用户说完了这轮发言的可能性有多大？
LiveKit 提供了**自适应打断（Adaptive Interruption）** 模式：
- "嗯""对""好的""right"这些词，会被识别为附和，Agent 继续输出
- "等一下""不对""我说的不是这个"这些词，会被识别为真正的打断，Agent 立刻停下来
- 如果 Agent 判断为打断并停了下来，但之后用户那边又没有说话——说明刚才是误判，Agent 会自动从上次中断的地方继续说
```python
session = AgentSession(
    turn_detection="semantic",
    interruption_mode="adaptive",
)
```
## 四、不只是一个 Agent：多 Agent 交接
LiveKit 原生支持多 Agent 交接（Handoff）。通过函数工具的返回值触发切换：
```python
class IntroAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="你是前台接待。请询问用户姓名和需求。"
        )
    @function_tool
    async def info_gathered(self, context, name: str, need: str):
        if need == "订位":
            return ReservationAgent(name), "好的，为您转接订位专员！"
        return MenuAgent(name), "好的，为您转接点餐专员！"
```
当 `info_gathered` 返回一个新的 Agent 实例时，框架自动完成切换：上一个 Agent 的 TTS 输出"好的，为您转接订位专员！"，然后 ReservationAgent 无缝接管，带着已收集的用户信息开始工作。
## 五、MCP 和 SIP：打通生产环境的最后两公里
LiveKit Agents 原生支持 **MCP（Model Context Protocol）**：
```python
from livekit.agents import mcp
tools = await mcp.connect("http://localhost:3001")
agent = Agent(
    instructions="你是客服助手。",
    tools=tools,
)
```
另一个生产级能力是 **SIP 电话集成**。通过 LiveKit 的 SIP 模块，可以把 Agent 直接接入电话网络，配置一个 SIP trunk（对接 Twilio、Telnyx 等运营商），给 Agent 分配一个电话号码。用户拨打这个号码，来电自动映射到一个 LiveKit Room，Agent Worker 加入 Room 开始处理。
支持呼入和呼出、DTMF 按键检测、通话录音、多方会议。
## 六、开发体验：从三分钟原型到生产部署
```bash
pip install "livekit-agents[openai,silero,deepgram,cartesia,turn-detector]"
python myagent.py console   # 开发测试，不需要外部服务器
python myagent.py dev       # WebRTC 测试，支持热重载
python myagent.py start     # 生产部署
```
console 模式直接用你电脑的麦克风和扬声器做输入输出，三分钟从零到能说话。dev 模式支持热重载，打开 LiveKit 的 Agents Playground 网页就能在浏览器里测试。生产模式下，框架会自动处理 Worker 调度、负载均衡、崩溃恢复。
## 七、开源的底气：和托管平台的本质区别
LiveKit Agents 采用 Apache 2.0 协议，10k+ Stars。与托管平台相比，开源方案的优势在于：完全自主控制，无供应商锁定；可以自托管，数据不出企业；社区驱动，功能迭代快。