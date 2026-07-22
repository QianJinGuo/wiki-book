# 京东JoyAI-VL-Interaction：全球首个全栈开源实时视频交互模型

## Ch01.1287 京东JoyAI-VL-Interaction：全球首个全栈开源实时视频交互模型

> 📊 Level ⭐⭐⭐ | 2.7KB | `entities/joyai-vl-interaction-jd-open-source-real-time-video-2026.md`

# 京东JoyAI-VL-Interaction：全球首个全栈开源实时视频交互模型

京东开源的全栈实时视频视觉语言交互模型，让大模型从"一问一答"走向"边看边说"，获得vLLM-Omni的day-0原生支持。

## 三重技术突破

JoyAI-VL-Interaction的三个核心创新是：主动判断（持续观察视频流，自主决定何时回应）、实时响应（面向正在发生的视频流而非离线分析）、智能体委托（前台实时观察+后台Agent处理复杂任务）。这三重突破让AI从被动问答进化到能持续在场、主动响应的交互模型。

## 全栈开源

与大多数只提供基础推理能力的开源模型不同，JoyAI-VL-Interaction开源了完整技术栈，包括模型权重、交互数据集、训练方案和完整可部署系统。支持摄像头、直播流、监控流等多种视频输入，ASR/TTS/可视化界面/后台模型均可按需替换。

## 评测表现

在58个真人盲评中，覆盖监控预警、实时计数、实时翻译、直播导览等真实流式场景：
- 对比豆包视频通话助手：总体胜率77.6%
- 对比Gemini视频通话助手：总体胜率87.9%
- 监控预警场景对两个基线均取得100%胜率

## 京东AI模型矩阵

JoyAI-VL-Interaction是京东2026年模型基建系列的一部分，与[JoyAI-Echo长视频生成框架](../ch05/090-ai.html)、JoyAI-Image-Edit、JoyAI-LLM Flash等共同构成京东的开源AI矩阵。

## 与交互模型范式的关联

JoyAI-VL-Interaction代表了从"问答式AI"到"在场式AI"的范式转变，与[Interaction Models](../ch03/102-interaction-models-a-scalable-approach-to-human-ai-collabor.html)中描述的实时多模态人机协作范式高度一致。模型内建的主动交互判断能力（而非依赖外部规则触发）是其与传统回合制模型的核心区别。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/joyai-vl-interaction-jd-open-source-real-time-video-2026.md)

---

