---
title: "VoxCPM2：OpenBMB 开源 TTS，Voice Design 文字描述生成声音，3.2 万 Star"
source_url: "https://mp.weixin.qq.com/s/y5Xwen3ys5CnABDgPyLlTA"
author: "极客之家"
published: 2026-06-30
ingested: 2026-06-30
language: zh
type: raw
sha256: "efea03b8e92c553a82aed6e4ee5405da7fc640ac84cf019bb9a4e020eb29c2ab"
---

# VoxCPM2：OpenBMB 开源 TTS，Voice Design 文字描述生成声音，3.2 万 Star

OpenBMB（面壁智能 / 清华实验室）在 2026 年 4 月开源的 TTS 模型 VoxCPM2，不到三个月 3.2 万 Star。2B 参数，Apache 2.0 协议，可商用。

## 技术路线：Tokenzier-free 语音合成

跟主流 TTS 路线最大的区别：不走离散 token 那条路。主流方案是把语音切成离散 token，再拿语言模型预测，最后用声码器合成——token 压缩太狠，细节全丢。VoxCPM 直接在连续空间里做扩散自回归生成。

**四阶段流水线**：Local Encoder → Text-Semantic LM → Residual Acoustic LM → Local DiT，最后通过 AudioVAE V2 解码成 48kHz 波形。

底层语言模型跑在 MiniCPM-4 上，扩散部分借鉴 DiTAR，流匹配参考 CosyVoice，AudioVAE 骨架来自 DAC。200 万小时多语种语音数据训练。

## 三种生成模式

### 1. Voice Design（核心亮点）
写一段文字描述，模型直接生成你想要的声音。不需要参考音频。

```python
wav = model.generate(
    text="(一位年轻女性，声音温柔甜美)你好，欢迎使用VoxCPM2！",
    cfg_value=2.0,
    inference_timesteps=10,
)
```

性别、年龄、音色、情绪、语速、口音，都能控制。ElevenLabs 有类似付费功能，VoxCPM2 免费。InstructTTSEval 评测上中文三项和 Qwen3TTS 并列第一，英文三项压过 Hume 和 Mimo-Audio。

### 2. 可控声音克隆
音色从参考音频提取，风格用文字指令控制——传统声音克隆把音色和风格一起复制，VoxCPM2 拆开了。

### 3. 高保真克隆（Ultimate Cloning）
给参考音频 + 准确文本转录，完整复刻音色、节奏和停顿。不控风格，要的就是一模一样。

## 多语言与方言

支持 30 种语言（中英日韩法德西俄阿拉伯等），模型自动检测语种。9 种汉语方言：四川话、粤语、吴语、东北话、河南话、陕西话、山东话、天津话、闽南话。

## 性能

- 输出 48kHz 音频（AudioVAE V2 非对称编解码：编码 16kHz → 解码 48kHz）
- RTX 4090 上 RTF ≈ 0.30，Nano-vLLM 加速可到 0.13
- 8G 显存即可运行
- Seed-TTS-eval: WER 1.84, SIM 75.3%
- CV3-eval 多语种与 Fish Audio S2、CosyVoice3 同级
- 30 语言内部 ASR 基准平均词错率 1.68%

## 微调与部署

支持 SFT 全量微调和 LoRA 微调。5-10 分钟说话人音频即可适配特定声音。社区部署方案：
- Nano-vLLM / vLLM-Omni（高性能，OpenAI 兼容 API）
- VoxCPM.cpp（GGUF 量化，CPU 可跑）
- VoxCPM-ONNX（ONNX 导出）
- VoxCPMANE（Apple Neural Engine）
- ComfyUI 节点插件（3 个）
- Rust 重写版

## 快速上手

```bash
pip install voxcpm
```

三行代码出声音：
```python
from voxcpm import VoxCPM
import soundfile as sf
model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False)
wav = model.generate(text="VoxCPM2 是目前推荐的多语言语音合成版本。", cfg_value=2.0, inference_timesteps=10)
sf.write("demo.wav", wav, model.tts_model.sample_rate)
```

CLI：`voxcpm design --text "你好世界" --output out.wav`

## References

- GitHub: https://github.com/OpenBMB/VoxCPM
