# How OpenAI Delivers Low-Latency Voice AI for 900M Users

## Ch01.1066 How OpenAI Delivers Low-Latency Voice AI for 900M Users

> 📊 Level ⭐⭐⭐ | 1.1KB | `entities/openai-low-latency-voice-ai-900m-users-bytebytego.md`

# How OpenAI Delivers Low-Latency Voice AI for 900M Users

ByteByteGo's teardown of OpenAI's real-time voice AI infrastructure serving 900M users covers the full latency budget: speech recognition (ASR) → LLM inference → text-to-speech (TTS). The architecture uses WebRTC for real-time audio streaming, Whisper for ASR with voice activity detection (VAD), GPT-4o for response generation with streaming tokens, and a custom TTS engine. Key optimizations include: pre-warmed GPU instances to eliminate cold starts, speculative decoding for LLM inference, quantized audio codecs for low-bitrate streaming, and geographic routing to minimize network hops. The end-to-end latency target is under 300ms for conversational parity.

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openai-low-latency-voice-ai-900m-users-bytebytego.md)

---

