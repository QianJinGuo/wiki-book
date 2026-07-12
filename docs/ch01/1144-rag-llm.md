# 视频 RAG 中分块策略：基于停顿、滑动窗口与基于 LLM 的方法

## Ch01.1144 视频 RAG 中分块策略：基于停顿、滑动窗口与基于 LLM 的方法

> 📊 Level ⭐⭐ | 3.1KB | `entities/video-rag-chunking-strategy-deephub-imba.md`

# 视频 RAG 中分块策略：基于停顿、滑动窗口与基于 LLM 的方法

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/video-rag-chunking-strategy-deephub-imba.md)

## 深度分析

视频 RAG 中分块策略：基于停顿、滑动窗口与基于 LLM 的方法 涉及agent领域的核心技术议题。
### 核心观点
1. # 视频 RAG 中分块策略：基于停顿、滑动窗口与基于 LLM 的方法
> DeepHub IMBA 作者 Rishav Aich 原文，数据派THU 2026-06-09 17:00 翻译转发。
2. ## 核心问题
**"这个视频整体在讲什么？
3. "** —— 系统出现幻觉或返回泛泛的答案。
4. 检索器只看到孤立的短片段，**看不到整体**。
5. 问题不在 LLM，而在分块策略本身。

### 内容结构
- 视频 RAG 中分块策略：基于停顿、滑动窗口与基于 LLM 的方法
- 核心问题
- 三种分块策略
- 1. 基于停顿的分块 (Pause-Based Chunking)
- 2. 基于 LLM 的主题分块 (LLM-Based Topic Chunking)
- 3. 复合 Pipeline (生产级 RAG 同时用)
- 一句话总结
- 核心论断

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **architecture趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](../ch03/045-agent.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](../ch11/225-openclaw.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](../ch11/225-openclaw.html)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/045-agent.html)
- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](ch01/1120-scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on.html)
- [你不知道的 Agent原理架构与工程实践 V2](../ch03/045-agent.html)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

---

