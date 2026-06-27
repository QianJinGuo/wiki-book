# Hermes Agent SOUL.md：3 层提示词、14 个内置人格，从源码看身份定制的完整设计

## Ch01.847 Hermes Agent SOUL.md：3 层提示词、14 个内置人格，从源码看身份定制的完整设计

> 📊 Level ⭐⭐ | 2.9KB | `entities/hermes-agent-soul-md-personality-shugex.md`

# Hermes Agent SOUL.md：3 层提示词、14 个内置人格，从源码看身份定制的完整设计

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-agent-soul-md-personality-shugex.md)

## 深度分析

Hermes Agent SOUL.md：3 层提示词、14 个内置人格，从源码看身份定制的完整设计 涉及agent领域的核心技术议题。
### 核心观点
1. # Hermes Agent SOUL.
2. md：3 层提示词、14 个内置人格，从源码看身份定制的完整设计
> 来源：术哥无界 | 作者：术哥（运维有术） | 2026-06-03 08:30 山东
> 「术哥无界」系列第 129 篇，Hermes Agent 最佳实战「2026」系列第 8 篇
> 原文地址：https://mp.
3. com/s/_xojuGE6fWX4LiaHj38njQ
## 核心命题
同一个 AI Agent，在项目 A 里回复得专业克制，到了项目 B 却突然变得絮絮叨叨——**这不是模型的问题，是人格定义方式的问题**。
4. 大部分 Agent 框架把身份、风格、项目规范全塞在一个 system prompt 里。
5. Hermes Agent 用三层架构解决：
- **SOUL.

### 内容结构
- Hermes Agent SOUL.md：3 层提示词、14 个内置人格，从源码看身份定制的完整设计
- 核心命题
- 1. 三层提示词架构
- stable 层 14 部分分解
- 2. SOUL.md 加载流程
- 关键设计点
- 3. 安全扫描：防注入第一道门
- 截断机制

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **architecture趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [两万字详解Claude Code源码核心机制](/ch01-734-两万字详解claude-code源码核心机制/)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](/ch01-715-龙虾装上了-可以用来干啥-分享下我的-openclaw-多智能体团队搭建经验/)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](/ch04-125-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/)
- [构建基于多智能体架构的深度思考交易系统 V2](/ch01-728-构建基于多智能体架构的深度思考交易系统/)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](/ch01-642-openclaw-完全指南-这可能是全网最新最全的系统化教程了-3-2w字-建议收藏/)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](/ch01-167-深入理解-claude-code-源码中的-agent-harness-构建之道/)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

## 相关实体

- MOC

---

