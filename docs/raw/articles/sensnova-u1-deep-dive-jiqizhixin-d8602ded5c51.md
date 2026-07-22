---

title: 商汤SenseNova U1深度拆解，原生统一架构终结缝合时代
author: 机器之心（关注多模态的）
date: 2026-05-14
source: https://mp.weixin.qq.com/s/60m6GzLGlRAfWYWWkIDCOA
sha256: d8602ded5c51
review_value: 8
review_confidence: 9
review_score: 72
review_recommendation: 入库
tags:
  - sensnova-u1
  - neo-unify
  - multimodal
  - unified-architecture
  - senseNova
  - 商汤
  - image-generation
  - text-generation
  - mixture-of-transformers
  - encoder-free
  - dynamic-resolution
  - flow-matching
  - 3d-rope
  - vision-language

---
# 商汤SenseNova U1深度拆解，原生统一架构终结缝合时代
> 原创 机器之心，2026-05-14 北京 | 编辑：杜伟
## 核心结论
多模态从"拼接"走向"原生统一"：NEO-Unify 架构完全去掉 VE（视觉编码器）和 VAE（变分自编码器），图像直接转化为 token，理解和生成在同一表示空间协同建模。
## 三组核心矛盾与解法
### 矛盾一（接口层）：消除模块割裂 → Encoder-free 设计
- 输入：两层卷积+GELU 替代预训练 VE，每个 token 对应 32×32 像素块
- 输出：MLP 直接预测原始像素块，放弃 VAE
- 效果：NEO-unify（2B）在 MS COCO 2017 图像重建 PSNR 达 31.56、SSIM 达 0.85，接近 Flux VAE 的 32.65/0.91
### 矛盾二（训练层）：动态分辨率信噪比失衡 → 分辨率自适应噪声尺度
- 分辨率↑ → token 数↑ → 噪声标准差按平方根比例同步上调
- 保证 Flow Matching 过程中 SNR 分布一致，避免高分辨率结构崩坏/低分辨率丢失细节
### 矛盾三（参数层）：理解与生成的梯度干扰 → 原生 MoT 架构
- Mixture-of-Transformers：底层共享自注意力上下文
- Q/K/V/O 投影、归一化、MLP 层完全参数解耦，按 token 类型动态路由
- "知识共享、专才专用"
## 四步训练策略
1. **理解预热**：注意力融合，恢复语义骨干
2. **生成预训练**：冻结理解分支，256-2048 动态分辨率掌握图像生成
3. **统一中期训练**：双分支同时激活，84k 步端到端联合训练
4. **统一 SFT**：高质量指令微调 9k 步
## 推理系统：LightLLM + LightX2V 解耦部署
- LightLLM：多模态理解、文本流式输出、请求调度
- LightX2V：图像生成
- 锁页共享内存 + FlashAttention3 后端
- 2048×2048 图像生成：5090 每步 0.415s，L40S 每步 0.443s
## 核心 benchmark 成绩
| 基准 | A3B-MoT 成绩 | 亮点 |
|------|-------------|------|
| MMMU | 80.55 | 超越 Qwen3.5-9B 2.15 分 |
| MMMU-Pro | 72.83 | 领先 2.73 分 |
| GenEval | 0.91 | 开源第一 |
| OCRBench | 91.90 | 文本密集图像超竞品 |
| RealUnify | 52.4 | 理解增强生成/生成增强理解双方向开源第一 |
| RISEBench（CoT）| 30.0 | 推理驱动编辑开源第一 |
## 架构演进判断
- **过去**：VE+VAE 拼接，理解与生成是天生的异构系统
- **现在**：原生统一，图像和语言在同一条链路中协同理解与生成
- **趋势**：以更少训练 token 实现更高性能，数据扩展效率显著优于同类方法
- **下一步**：VLA（视觉-语言-动作）、世界建模（WM）