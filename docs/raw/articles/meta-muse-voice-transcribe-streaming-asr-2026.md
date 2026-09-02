---
source: newsletter
source_url: https://research.meta.ai/blog/introducing-muse-voice-transcribe
ingested: 2026-09-03
source_published: 2026-09-01
sha256: 010aa013a80e13be853bb82e5533a5900534c802264d4f12211f78267db4fd95
---

# Introducing Muse Voice Transcribe

We're excited to introduce Muse Voice Transcribe, the first real-time audio perception model developed by Meta Superintelligence Labs.

Muse Voice Transcribe marks a first milestone in bringing our real-time voice models to you. It delivers real-time streaming ASR, diarization with 20+ speakers, and endpointing. It is multilingual with seamless code-switching and improves accuracy with language, keyword, and context biasing.

We rank first on Artificial Analysis on streaming speech-to-text and on public diarization benchmarks. Model inclusion and rankings as of September 1, 2026.

## Streaming ASR as the Foundation

Muse Voice Transcribe is an autoregressive multimodal model from the Muse Spark family.

Audio is processed in 80ms chunks (12.5 Hz), each of which is transformed into a single soft token. At each audio chunk, the model decides to either continue listening to the next audio chunk or emit a text token. When the model decides to continue listening, it predicts a `<|next_audio|>` special token and replaces `<|next_audio|>` with the actual audio chunk for the next input.

When the audio stream stops, we insert a special `<|empty_audio|>` token to inform the model there are no more audio chunks. The model emits all remaining text tokens without producing any `<|next_audio|>` tokens after seeing `<|empty_audio|>`.

Since the model has full control over when to listen, it decides on the amount of audio context before transcribing a word (we call this "delay"). There is a tradeoff between accuracy and delay. The longer the model waits to predict, the more accurate the transcript, but the higher the latency. Muse Voice Transcribe has "adaptive delay," dynamically changing delay for each word based on difficulty. This is enabled with reinforcement learning (RL), where word error rate (WER) reward and a delay reward are combined multiplicatively.

With adaptive delay, Muse Voice Transcribe achieves the Pareto front on speed-accuracy trade-off measured by time to final transcription.

## Building Diarization and Endpointing on Top of ASR

With streaming ASR as the foundation, we can easily support other audio perception tasks by introducing additional special tokens.

For diarization, we introduce a `<|start_of_turn|>` token to mark potential speaker switch and `<|speaker_{A-Z}|>` tag to differentiate the speaker. `<|start_of_turn|>` is predicted as soon as speaker switches and speaker tag prediction is delayed to the end of the chunk.

For endpointing, we introduce a `<|speech_onset|>` token to mark beginning of the speech and `<|speech_endpoint|>` token to mark when the user finishes speaking.

We train both tasks together with streaming ASR and add extra rewards on top of the ASR reward for diarization and endpointing respectively.

## Capabilities

### Language Coverage
Muse Voice Transcribe is trained with 70+ languages, of which 25 are extensively verified. In the initial release, 25 validated languages are recommended, with support for additional languages also available.

### Code-Switching
Muse Voice Transcribe natively supports arbitrary code-switching, either within sentence or between sentence. Context biasing further improves recognition accuracy.

### Long Context
Supports long-form audio transcription with maintained accuracy.

## Architecture Details

- Autoregressive multimodal model from Muse Spark family
- Audio processed in 80ms chunks at 12.5 Hz → single soft token per chunk
- Adaptive delay via reinforcement learning (WER reward × delay reward)
- Special tokens: `<|next_audio|>`, `<|empty_audio|>`, `<|start_of_turn|>`, `<|speaker_{A-Z}|>`, `<|speech_onset|>`, `<|speech_endpoint|>`
- 70+ languages trained, 25 extensively verified
- Real-time streaming with Pareto-optimal speed-accuracy trade-off
