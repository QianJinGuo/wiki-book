# Anthropic 实战分享：如何让 AI Agent 持续工作几天？

## Ch01.848 Anthropic 实战分享：如何让 AI Agent 持续工作几天？

> 📊 Level ⭐⭐ | 2.9KB | `entities/anthropic-long-running-agent-architecture-6h-retroforge.md`

# Anthropic 实战分享：如何让 AI Agent 持续工作几天？

## 相关实体

- [蔚蓝babyalpha a3消费级机器狗撕开英伟达垄断](https://github.com/QianJinGuo/wiki/blob/main/entities/weilan-babyalpha-a3-machine-dog.md)
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-long-running-agent-architecture-6h-retroforge.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/mlops-training-inference.md)
## 深度分析

Anthropic 实战分享：如何让 AI Agent 持续工作几天？ 涉及agent领域的核心技术议题。
### 核心观点
1. # Anthropic 实战分享：如何让 AI Agent 持续工作几天？
2. > 进化 AI 实验室 | 2026-05-19 | 安徽
一年前，Claude 连写个 Bash 命令和转义字符串都费劲，每次任务顶多运行约 20 分钟；而现在，Claude Code 几乎所有的代码都是由它自己编写，且能有效运行数天。
3. ——Boris（Claude Code 之父）
在极简架构下，Agent 自主完成任务的连续运行时间，已经从一年前的 1 小时（Opus 3.
4. 7）提升到了现在的 12 小时（Opus 4.
5. 仅仅一年左右，提升了 **10 倍以上**。

### 内容结构
- Anthropic 实战分享：如何让 AI Agent 持续工作几天？
- 为什么让 Agent 长时间运行这么难？
- 1. 上下文（Context）
- 2. 规划（Planning）
- 3. 自我评判（Self-judgment）
- Agent SDK：结构化管理
- 对抗式架构（Adversarial Architecture）
- 审美也是可以量化的

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **anthropic趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [你不知道的 Agent原理架构与工程实践 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/你不知道的-agent原理架构与工程实践-v2.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- [Karpathy Vibe Coding Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-vibe-coding-agentic-engineering.md)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/龙虾装上了可以用来干啥分享下我的-openclaw-多智能体团队搭建经验-v2.md)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](https://github.com/QianJinGuo/wiki/blob/main/entities/ethan-he-cosmos-grok-imagine-latent-space-video-agent-20260606.md)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](https://github.com/QianJinGuo/wiki/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

---

