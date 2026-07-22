---
title: "对话灵感实验室：全帧率 VLM、低成本与分层部署"
source: "https://mp.weixin.qq.com/s/hRJu9iQWhvrKzERsbcV1bA"
tags: [llava, onevision, vlm, video]
created: 2026-05-20
sha256: 7dbe035586df304c2d36adda888acbd36694c9d931b1e92b4a54188fa02df675
---
---
# 对话灵感实验室：全帧率 VLM、低成本与分层部署
**来源:** InfoQ 采访 — 陈姚戈
**URL:** https://mp.weixin.qq.com/s/hRJu9iQWhvrKzERsbcV1bA
**受访者:** 冯子勇（格灵深瞳灵感实验室负责人）、谢尹（核心成员）、闫梓祯（研发副总裁）
**日期:** 2026年5月20日
**标签:** #VLM #视频理解 #全帧率 #LLaVA-OneVision #视觉编码
---
## 核心问题：视频被当图片处理
**浪费一：算力浪费**
- 视频原本连续，相邻帧天然存在关系
- 传统流程把视频解码成静态图片，连续结构被打散
- 模型用昂贵计算把关系重新学回来
**浪费二：信息结构浪费**
- 视频编码器早已建模：I帧（完整空间上下文）、P帧（记录运动和残差变化）、运动向量、残差
- 现有 VLM 把这些结构全部解开，再让模型重新发现一遍
## 核心方案：OneVision-Encoder
**架构：** 延续 LLaVA 系列"视觉基座—projector—LLM"
- 视觉编码器：OneVision-Encoder（24层 ViT）
- 位置编码：共享时间、高度、宽度三个维度
- 视频输入策略：基于 codec 的密集视频输入
**关键思路：** 直接利用视频 codec 中已有的信息结构（I帧/P帧/运动向量/残差），构建更 compact 的 token 或表示，让本来就存在于视频里的运动、变化和连续关系直接传给模型。
## 关键数字
| 指标 | 数值 |
|------|------|
| 一小时视频帧数（24 FPS） | ~9万帧 |
| 一秒视频 token 数 | ~2400 token |
| 100万上下文窗口 | 仅容纳约7分钟全帧率视频 |
| LLaVA-OneVision-2.0 token 节省 | 约 **1/8** 推理成本 |
| 训练框架 | 百度百舸 LoongForge |
| 视频理解扩展能力 | 30秒 → 10-15分钟长视频 |
| 能力 | 2D/3D空间定位 + 物体追踪 |
## 全帧率 vs 抽帧
**抽帧的问题：** 关键动作只发生在很短一瞬间。固定间隔抽帧可能刚好没抽到。判断事件何时开始/结束，全帧率更精准。
**全帧率的价值：** 时序定位精准；视频 Agent（剪辑Agent）底层需要准确定位动作起点和终点；coding agent 表现更好是因为代码是高质量文本，视频 agent 面对的是长视频+密集时序+大量视觉冗余。
## 分层部署路径
```
大模型冷启动 → 中等模型快速迭代 → 小模型规模化部署
(从无到有)        (2000卡→200卡)      (长期低成本运行)
```
- 边缘哨兵：现场解析原始视频为结构化信息，筛掉无效数据，传有价值信息给上级
- 算法运营中心：二次识别复核、报警管理、模型迭代、业务编排
- 算法训练中心：私有化部署到客户数据中心，解决数据不能离开客户体系的问题
## 具身智能
- VLM 高效处理连续视频 + 空间关系 + 目标变化 → 可能成为具身系统主干模型
- 视频理解还没被很好解决，理解是底座
## 相关链接
- GitHub: https://github.com/EvolvingLMMs-Lab/LLaVA-OneVision-2
- 模型: https://huggingface.co/lmms-lab-encoder/LLaVA-OneVision-2-8B-Instruct
- 数据: https://huggingface.co/datasets/mvp-lab/LLaVA-OneVision-2-Data
- 技术报告: https://cdn.jsdelivr.net/gh/anxiangsir/ov2_asset@main/LLaVA_OneVision_2.pdf
- Blog: https://evolvinglmms-lab.github.io/LLaVA-OneVision-2
## 相关概念
- [[LLaVA系列]] — LLaVA 视觉基座—projector—LLM 架构
- [[视频理解]] — 全帧率 vs 抽帧
- [[视觉编码器]] — OneVision-Encoder
- [[分层部署]] — 大模型→中模型→小模型的分层路径