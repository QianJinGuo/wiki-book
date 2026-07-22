---
title: 清华系团队出手！一张4090即可「爆改」，1.3B小钢炮震撼开源
source_url: https://mp.weixin.qq.com/s/_KJYvvvte-7_rMZ9y9jCyQ
publish_date: 2026-05-13
tags: [article, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 5c80ca3e0109f4e9df3ca50c3859396642ff4f725d064561c79681a21438f653
---
# 清华系团队出手！一张4090即可「爆改」，1.3B小钢炮震撼开源
**作者**：新智元（编辑：YHluck）  
**平台**：微信  
**原始链接**：https://mp.weixin.qq.com/s/_KJYvvvte-7_rMZ9y9jCyQ  
**抓取日期**：2026-05-13  
**来源**：新智元
## 概要
面壁智能开源 MiniCPM-V 4.6，1.3B 多模态模型，超越 Qwen3.5-0.8B 和 Gemma 4 E2B-it；一张 RTX 4090 即可微调；RTX 4090 + vLLM 环境下 3136² 图片首响 75.7ms（比 Qwen3.5-0.8B 快 2.2 倍）；吞吐量 2624 token/s（每秒 14.3 张图）。
## 核心性能数据
| 指标 | 数值 |
|------|------|
| 参数规模 | 1.3B |
| 16 倍压缩 TTFT（3136²） | 75.7ms（Qwen3.5-0.8B 的 2.2 倍快） |
| 吞吐量（1344², 200 token 输出） | 2624 token/s（14.3 张/秒） |
| Token 利用率（对比 Qwen3.5-0.8B） | 仅用 2.5% 的 Token 吞吐量实现超越 |
| iPhone 17 实测 | 3024² 图片二次追问毫秒级秒回 |
## 技术亮点
### ViT 内部视觉 Token 早压缩
传统 ViT 全局编码让注意力计算随分辨率呈二次方增长。LLaVA-UHD v4 采用切片编码 + 早期 ViT 内压缩模块，通过窗口注意力机制增强邻近 Token 上下文交互，浮点运算量降低 55.8%。
### 4 倍 / 16 倍混合视觉 Token 压缩
4 倍压缩模式：性能拉满，适合细粒度视觉解析  
16 倍压缩模式：速度起飞，适合算力受限终端和高并发工业场景
## 落地案例
- 快手 OneRec 推荐大模型：MiniCPM-V-8B 承接短视频推荐主场景 **25% 请求**
- 联想、吉利、上汽大众、广汽等企业实际业务落地
## 相关链接
- Hugging Face：https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub：https://github.com/OpenBMB/MiniCPM-V
- Modelscope：https://modelscope.cn/models/OpenBMB/MiniCPM-V-4.6