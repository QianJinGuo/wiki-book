# 手把手：用 Hermes Skills + Karpathy 的 LLM Wiki 让 AI 越用越懂你

> 📊 Level ⭐⭐ | 2.9KB | `entities/hermes-skills-llm-wiki-self-improving-knowledge-system.md`

# 手把手：用 Hermes Skills + Karpathy 的 LLM Wiki 让 AI 越用越懂你

→ [原文存档](https://mp.weixin.qq.com/s/KE4BRvYJJysKpoy3jpaFbQ)

## 深度分析

手把手：用 Hermes Skills + Karpathy 的 LLM Wiki 让 AI 越用越懂你 涉及agent领域的核心技术议题。
### 核心观点
1. # 手把手：用 Hermes Skills + Karpathy 的 LLM Wiki 让 AI 越用越懂你
## 整体结构：三层互相喂养
- **Memory**：记住你是谁（事实类）
- **Skills**：记住怎么干活（方法类）
- **Wiki**：目录把零散知识组织起来（空间+时间维度）
三者互相喂养，越用越厚。
2. ## 第一步：确认 Skills 目录存在
ls ~/.
3. hermes/skills/
# 如果不存在：
mkdir -p ~/.
4. hermes/skills/
## 第二步：理解 SKILL.
5. md 的结构
name: writing-pr-descriptions
description: "按团队规范写 PR 描述"
version: 1
## When to Use
当完成功能开发，准备提交 PR 的时候。

### 关联实体

- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/004-agent.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](../ch04/176-openclaw.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](../ch04/176-openclaw.html)
- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](651-scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on.html)
- [你不知道的 Agent原理架构与工程实践 V2](../ch03/004-agent.html)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/data-infrastructure.md)

---

