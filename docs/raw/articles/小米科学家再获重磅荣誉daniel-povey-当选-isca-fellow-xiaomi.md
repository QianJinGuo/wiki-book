---
source: wechat
source_url: https://mp.weixin.qq.com/s/652S8VHjLuQLNN58Rbjc0g
ingested: 2026-07-22
feed_name: 小米技术
wechat_mp_fakeid: MP_WXS_3510410326
source_published: 2026-07-16
sha256: 328a3e7dc52aa4b67735a8e85a11158bee52d7dc8a7d9c3a7815cada4f3f0d86
---
# 小米科学家再获重磅荣誉！Daniel Povey 当选 ISCA Fellow

---
source: wechat
source_url: https://mp.weixin.qq.com/s/652S8VHjLuQLNN58Rbjc0g
ingested: 2026-07-22
source_published: 2026年7月16日 11:43
---

# 小米科学家再获重磅荣誉！Daniel Povey 当选 ISCA Fellow

**近日，国际语音通信协会（ISCA）正式公布 2026 年 ISCA Fellow 名单，小米集团语音首席科学家 Daniel Povey 凭借其在语音识别声学建模、序列训练创新方法、开源语音工具 Kaldi 以及对全球语音通信领域的深远贡献成功入选！这是继 2023 年当选 IEEE Fellow 后，Daniel 再获 ISCA Fellow 殊荣，作为一个****定义了一个时代的工具和创造行业基础设施** 的科学家，“双料 Fellow” 实至名归。

  


图片来源：https://isca-speech.org/Latest-News/13652479

  


ISCA 成立于 1988 年，是全球语音通信与口语处理领域最具权威性的国际学术组织。ISCA Fellow 是协会授予会员的最高学术荣誉，旨在表彰在语音科学、技术与工程领域作出卓越、持久贡献的学者，每年当选人数极少，是语音圈公认的顶级殊荣。该奖项设立于 2007 年，每年新晋 Fellow 不超过当年ISCA 会员总数的千分之三。自设立以来，全球 ISCA Fellow人数仅100余人。

  


**今年全球共 8 位学者当选，Daniel 是唯一一位创建了行业基础设施级开源软件****， 在学术和工业界都有突出贡献的****科学家。**

  


**  
**

**01**

**从剑桥到北京，一位语音科学家的二十年征程**

Daniel Povey 的国际学术与职业生涯始于剑桥大学。他于 2003 年在剑桥大学获得博士学位，随后进入工业界，先后在 IBM T.J. Watson 研究中心 和 微软研究院 工作了约十年时间，深耕语音识别核心技术。

  


  


  


之后，为了全身心投入 Kaldi 开源软件，他加入约翰斯·霍普金斯大学 任教七年，正是在这一时期，他打造了 Kaldi 语音识别工具包，将智能语音技术一次次推向新高度。这是全球使用最广泛的语音识别开源框架，几乎所有语音团队都曾或正在使用它。他还参与创建了著名的 LibriSpeech 数据集，成为全球语音研究的标准基准之一。

  


早在 Kaldi 诞生之前，Daniel 就提出了 Minimum Phone Error（MPE）序列训练方法，这是早期将区分性训练引入语音识别的开创性工作之一，为后续的 LF-MMI 等一系列方法奠定了理论基础。Daniel 也是将深度学习用于语音识别领域的重要引领者。在语音识别中推广了时延神经网络，配合 LF-MMI 训练，是2015-2020 年学术界和工业界普遍使用的最佳组合。 他还是深度学习在声纹识别领域的重要引领者。提出的 X-vectors 方法是第一个取得成功并被普遍应用的深度学习说话人识别方法，至今仍被广泛使用。他的谷歌学术引用量已超 6 万次。

  


2019 年 11 月，Daniel 正式移居北京，加入小米集团AI实验室，出任语音首席科学家。

  


**  
**

**02**

###  新一代 Kaldi，智能语音新突破

加入小米后，Daniel 带领团队推出了新一代 Kaldi 开源项目（包含 k2 / Lhotse / Icefall / Sherpa 四大子项目），在语音识别与合成方向持续取得里程碑式进展：

  


  


  * Zipformer & Zapformer 编码器：Zipformer 是首个严格超越 Google Conformer 的语音编码器，被 ICLR 2024 接收为 Oral 论文（前 1.2%）；2026 年升级版 Zapformer 将识别精度再提升 10%-15%，大幅增强训练稳定性和泛化性。

  * OmniVoice 多语言 TTS：2026 年发布支持 600+ 语言/方言的零样本语音合成模型 OmniVoice（0.8B 参数，Qwen3 初始化），仅需 3-10 秒参考音频即可跨语言克隆音色，中英文 Seed-TTS / LibriSpeech-PC 基准达 SOTA，在客观评测集下超越 MiniMax 和 ElevenLabs 等商用模型，开源 3 个月，Huggingface 下载量超 500 万次。

  * CR-CTC（Consistency-Regularized CTC）：被 ICLR 2025 接收，让纯 CTC 模型性能比肩 Transducer，在 LibriSpeech / AISHELL-1 / GigaSpeech 等基准上刷新 SOTA，显著降低 ASR 训练与部署门槛。

  * ZipVoice 零样本语音合成：基于 Flow Matching + Zipformer 骨干，推出 ZipVoice（零样本单说话人 TTS）与 ZipVoice-Dialog（零样本对话 TTS），参数量少、推理快，CPU 单线程可达实时，配套 OpenDialog 数据集同步开源。

  * sherpa-onnx 全平台部署：新一代 Kaldi 的端云一体推理引擎 sherpa-onnx，支持高通/昇腾/瑞芯微等主流 NPU，覆盖 Android / iOS / 嵌入式 / 服务端，被开发者称为“智能语音领域的瑞士军刀”。

  


  


新一代 Kaldi 团队在 Interspeech、ICASSP、ICLR、ACL 等顶会发表论文**数十****篇** ，已成为全球开发者构建 AI 语音系统的核心基础设施之一。

  


03

开源开放，让全球每个人享受科技带来的美好生活

新一代 Kaldi 自诞生之初，便秉承了 Daniel 一贯的信念：开源开放。所有核心模块均采用 Apache-2.0 开源协议，代码完全公开、且没有商业使用限制。这不仅降低了全球开发者进入语音领域的门槛，也让学术界和工业界能够站在同一平台上共同推进技术进步。

  


小米将开源视为推动技术普惠的重要路径，而新一代 Kaldi 正是这一理念的最佳实践——它不是小米内部的专属工具，而是属于全世界的公共基础设施。

  


新一代 Kaldi 的技术突破正在赋能小米“人车家全生态”——加速小爱同学在手机、音箱、电视、汽车、IoT 设备上的语音识别与合成迭代，让语音交互更精准、更低延迟、更自然。

  


从学术实验室到创业公司，从嵌入式设备到云端服务，它也在帮助全球开发者更高效地构建智能场景：

  


  * 智能家居：搭载 sherpa-onnx 的智能音箱，在离线状态下也能流畅识别中文方言和英文指令，响应速度低于 100 毫秒，老人和孩子无需联网也能轻松唤醒、控制家电。

  * 农业与偏远地区：基于 Zipformer 的轻量级 ASR 模型部署在低功耗嵌入式设备上，帮助农民通过语音输入完成田间记录、查询天气和农技知识，无需智能手机也能享受信息服务。

  * 无障碍沟通：OmniVoice 的多语言零样本 TTS 能力，让视障人士可以用自己熟悉的方言朗读屏幕内容。

  * 跨国企业与出海产品：面向东南亚的电商公司利用新一代 Kaldi 的 Zipformer + ZipVoice 方案，快速搭建了支持印尼语、泰语、越南语的客服语音系统。

  


这些场景背后，是新一代 Kaldi 不断提升性能，降低算力门槛的努力：Zipformer 不仅性能优秀，还可以在树莓派上实时运行，sherpa-onnx 支持高通、昇腾、瑞芯微等多种国产 NPU，真正做到 “一次训练，随处部署” 。

  


-

再次祝贺 Daniel Povey 当选 ISCA Fellow！小米将继续坚持“技术为本”，以开源开放推动全球智能语音技术进步，让每个人都能享受科技带来的美好生活。

  


  
  
  
END
