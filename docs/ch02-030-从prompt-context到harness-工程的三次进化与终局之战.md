## Ch02.030 从Prompt、Context到Harness，工程的三次进化与终局之战

> 📊 Level ⭐⭐ | 3.5KB | `entities/prompt-context-harness-three-evolutions-tencent.md`

# 从Prompt、Context到Harness，工程的三次进化与终局之战

## 相关实体

- [滴滴 ibg 智能客服质检系统：3 管线（意图 86% / 合规 90%+ / voc）+ 企业 llm 落地方法论](ch01-166-滴滴-ibg-智能客服质检系统-3-管线-意图-86-合规-90-voc-企业-llm-落地方法论.html)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/prompt-context-harness-three-evolutions-tencent.md)

## 深度分析

从Prompt、Context到Harness，工程的三次进化与终局之战 涉及agent领域的核心技术议题。
### 核心观点
1. # 从Prompt、Context到Harness，工程的三次进化与终局之战
OpenAI 内部 3-7 人小团队，在五个月内让 AI 生成了将近 100 万行生产级别代码。
2. 全程没有一个工程师亲手写过一行业务逻辑代码。
3. 三个关键概念：Prompt Engineering、Context Engineering、Harness Engineering。
4. ## 第一进化：Prompt Engineering
### 核心本质
LLM 底层逻辑是一个极其擅长续写的系统。
5. 给它一段输入，它预测接下来最有可能出现的内容，不断生成，直到任务完成。

### 内容结构
- 从Prompt、Context到Harness，工程的三次进化与终局之战
- 第一进化：Prompt Engineering
- 核心本质
- 武器库
- 繁荣与衰退
- 第二进化：Context Engineering
- 核心比喻：失忆症患者困境
- 上下文窗口的层次

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **code趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](ch05-005-ai-harness-engineering.html)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch01-707-存之有序-治之有矩-agent-记忆系统的工程实践与演进.html)
- [你不知道的 Agent原理架构与工程实践 V2](ch04-455-你不知道的-agent-原理-架构与工程实践.html)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch04-125-agent-pilotdeck-token-70.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch01-170-深入理解-claude-code-源码中的-agent-harness-构建之道.html)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](ch01-781-world-s-first-native-color-lidar-gives-machines-human-like-v.html)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

---
