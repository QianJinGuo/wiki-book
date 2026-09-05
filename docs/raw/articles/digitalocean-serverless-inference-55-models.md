---
source: newsletter
source_url: https://digitalocean.com
ingested: 2026-05-16
feed_name: Newsletter
source_published: 2026-05-16
sha256: 39aef4d618d459e3bb2ee46139757c18bfebb92de2173e48961997efe93b7cbe
---
---
# 55+ models, every modality. One API key, one bill.
> This is a placeholder stub. Full article content pending retrieval.
## 核心要点
- Newsletter 技术洞察
- DigitalOcean Serverless Inference 提供 55+ 模型的统一 API，兼容 OpenAI 和 Anthropic 格式
- 按 token 计费，scale-to-zero，无 GPU 基础设施负担
- DeepSeek V3.2 达到 230 tok/s，被 Artificial Analysis 评为第一，比亚马逊 Bedrock 快 3.9 倍
- 支持多模态：图像（Stable Diffusion 3.5）、视频（Wan 2.2）、语音（Qwen3 TTS）、视觉语言（Nemotron、Kimi）
- VPC + 默认零数据保留，平台内置 guardrails
## 定价与成本
- Scale-to-zero：凌晨低峰期不产生费用
- Off-peak dynamic pricing：MiniMax M2.5 和 Kimi K2.5 支持峰谷动态定价
- 按实际 token 输出付费，无需预购 GPU 容量
## 性能指标
- DeepSeek V3.2：230 tok/s，Artificial Analysis 评测第一，是 AWS Bedrock 的 3.9 倍
- Hippocratic AI：400ms P99 延迟，2 倍吞吐量提升，支撑 180M+ 患者交互
- Custom-kernel 优化：针对特定 GPU 架构的深度调优
## 多模态覆盖
- 图像生成：Stable Diffusion 3.5
- 视频生成：Wan 2.2
- 语音合成：Qwen3 TTS
- 视觉语言模型：Nemotron、Kimi
## 企业级功能
- VPC 部署支持
- 零数据保留（默认）
- 平台级内容 guardrails
## Q1 2026 财务数据
- $1M+ 客户 ARR 同比增长 179%
- 80% 以上 AI 收入来自推理+核心云而非裸机
## Inference Router
- Public Preview 阶段
- 支持跨模型路由和 fallback
- 可配置当 OpenAI 模型不可用时自动切换到同等能力的开源模型