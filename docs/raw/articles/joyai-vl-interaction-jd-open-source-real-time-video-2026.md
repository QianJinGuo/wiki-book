---
source: wechat
source_url: http://mp.weixin.qq.com/s?__biz=MzU1MzE2NzIzMg==&mid=2247502346&idx=1&sn=b8985e0242992be3780ebe060606413c&chksm=fbf47ae5cc83f3f30335e4b265fe7547d5b86265fee9d2ce2653302b8ea4e0374684f84bb1e2#rd
ingested: 2026-07-03
feed_name: 京东技术
wechat_mp_fakeid: MP_WXS_3553167232
source_published: 2026-06-22
sha256: 4d7fde34f193326469cc0740cdb1a03658fe038e5b515c1439273fc6a35867c7
---

# 全球首个！京东全栈开源JoyAI-VL-Interaction，让大模型从"一问一答"走向"边看边说"

一场火灾发生的瞬间，监控系统可以实时发出警报；独居老人在家摔倒，AI可以马上提醒远方的亲人；视障人士外出，智能眼镜随时解读附近环境、指明方向……这些看似科幻的场景，在AI时代可能很快会成为现实。

近日，京东开源实时视频视觉语言交互模型JoyAI-VL-Interaction，这也是全球首个全栈开源的interaction模型和系统，并获得vLLM-Omni的day-0原生支持。它让大模型从"一问一答"走向"边看边说"，开发者基于这套框架，可以快速搭建能持续观察、自主判断、即时响应的实景AI助手。

代码：https://github.com/jd-opensource/JoyAI-VL-Interaction
模型：https://huggingface.co/jdopensource/JoyAI-VL-Interaction-Preview
数据集：https://huggingface.co/datasets/jdopensource/JoyAI-VL-Interaction

## 三重突破

相比传统模型，JoyAI-VL-Interaction有三重突破：

1. 主动判断，而非被动回答。传统模型通常要等用户发起问题才开始处理当前画面，而JoyAI-VL-Interaction可以持续观察视频流，自主判断什么时候该说话，什么时候该沉默。比如用户设置"裁判出示红牌时提醒我"，模型就会持续值守画面，并在事件发生时自动预警。

2. 实时响应，而非事后总结。传统视频理解更多是上传完整视频后再分析，而JoyAI-VL-Interaction面向正在发生的视频流，画面变化时就能响应。

3. 适时智能体委托，同时保持观察和交互。当模型遇到生成代码、调用工具、复杂推理等任务时，可以交给后台大模型或Agent。前台模型继续观察现场，后台模型处理复杂任务，结果返回后再自然接回对话。形成"前台实时助手+后台智能大脑"的协作系统。

## 开源一套系统，而不只是一个模型

JoyAI-VL-Interaction每秒都会做一次判断，即"什么时候说话"成为模型自己学会的能力。模型会自己判断：继续观察、保持沉默、发现关键事件主动回应、遇到复杂任务交给后台Agent处理。

JoyAI-VL-Interaction支持摄像头、直播流、监控流等多种视频输入，支持语音输入输出、可视化界面、长期记忆、后台模型接口和vLLM部署方案。ASR、TTS、可视化界面、后台模型、外部工具和业务模块都可以按需替换。

## 评测数据

在覆盖监控预警、实时计数、实时翻译、时间感知、直播导览解说等真实流式场景中，58个真人盲评：
- 对比豆包视频通话助手：总体胜率77.6%
- 对比Gemini视频通话助手：总体胜率87.9%
- 监控预警场景对两个基线均取得100%胜率

## 京东AI基建布局

今年京东在模型基建方面取得多项进展：
- 3月：开源基础大模型JoyAI-LLM Flash Instruct
- 4月：开源图像模型JoyAI-Image-Edit
- 6月3日：开源长视频生成模型JoyAI-Echo
- 6月22日：开源JoyAI-VL-Interaction（实时视频交互模型）

JoyAI-VL-Interaction获得了vLLM-Omni的day-0原生支持，已原生合入vLLM-Omni主线。
