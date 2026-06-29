# Mnilax：CLAUDE.md 规则从 Karpathy 的 4 条增加到 12 条，Claude 错误率从 41% 降到 3%

## Ch01.765 Mnilax：CLAUDE.md 规则从 Karpathy 的 4 条增加到 12 条，Claude 错误率从 41% 降到 3%

> 📊 Level ⭐⭐ | 3.6KB | `entities/claude-md-12-rules-mnilax-cf2019.md`

## Mnilax：CLAUDE.md 规则从 Karpathy 的 4 条增加到 12 条，Claude 错误率从 41% 降到 3%

## 相关实体

- [《从零实现 agent 系统》连载 01｜agent 系统是什么：问题空间与架构切片](/ch04-404-从零实现-agent-系统-连载-01-agent-系统是什么-问题空间与架构切片/)
- [rod johnson 回归：embabel 与「最后一波由人类选择的框架」](/ch07-019-embabel/)
- [你的ai代码越写越乱，他72小时合了14个pr——差距只在一个机制](/ch01-497-garry-tan/)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-md-12-rules-mnilax-cf2019.md)

- MOC
## 深度分析

Mnilax：CLAUDE.md 规则从 Karpathy 的 4 条增加到 12 条，Claude 错误率从 41% 降到 3% 涉及agent领域的核心技术议题。
### 核心观点
1. # Mnilax：CLAUDE.
2. md 规则从 Karpathy 的 4 条增加到 12 条，Claude 错误率从 41% 降到 3%
作者：Cf2019 / fantoAGI
## 文章背景
2026 年 1 月，Andrej Karpathy 发帖吐槽 Claude 写代码的三个问题：静默错误假设、过度复杂化、波及非目标代码。
3. Forrest Chang 将这些问题提炼成 4 条行为规则放入 CLAUDE.
4. md 文件，传到 GitHub 后两天获 5,582 颗星，两周 6 万书签，至今 12 万星——2026 年增长最快的单文件仓库。
5. 5 月，Mnilax 发现 Karpathy 的模板是为 1 月的代码编写问题设计的，但 5 月的 Claude Code 生态出现了新的病灶：Agent 冲突、Hook 级联、Skill 加载冲突、跨会话断裂的多步工作流。

### 内容结构
- Mnilax：CLAUDE.md 规则从 Karpathy 的 4 条增加到 12 条，Claude 错误率从 41% 降到 3%
- 文章背景
- 一、CLAUDE.md 是 AI 编程栈里最被低估的文件
- 二、原版 4 条规则——底线，不是天花板
- 三、补齐的 8 条规则——每条都来自一个真实翻车场景
- 规则 5：模型只做判断，不做决策
- 规则 6：硬性 Token 预算，没有例外
- 规则 7：暴露冲突，不要折中

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **architecture趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [两万字详解Claude Code源码核心机制](/ch01-734-两万字详解claude-code源码核心机制/)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](/ch01-707-存之有序-治之有矩-agent-记忆系统的工程实践与演进/)
- [你不知道的 Agent原理架构与工程实践 V2](/ch04-455-你不知道的-agent-原理-架构与工程实践/)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](/ch01-715-龙虾装上了-可以用来干啥-分享下我的-openclaw-多智能体团队搭建经验/)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](/ch04-199-openclaw-完全指南/)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](/ch04-125-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

---

