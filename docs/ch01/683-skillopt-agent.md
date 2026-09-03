# SkillOpt：把 Agent 技能文档变成可训练对象

> 📊 Level ⭐⭐ | 2.5KB | `entities/skillopt-skill-document-training-microsoft-sjtu.md`

# SkillOpt：把 Agent 技能文档变成可训练对象

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/skillopt-skill-document-training-microsoft-sjtu.md)

## 深度分析

SkillOpt：把 Agent 技能文档变成可训练对象 涉及agent领域的核心技术议题。
### 核心观点
1. # SkillOpt：把 Agent 技能文档变成可训练对象
> 整理自 VibeCoder 团队对 SkillOpt 论文的中文报道
> 原文：https://mp.
2. com/s/l5ZtF-TPtttCtjyLiiGYUQ
> 论文：Microsoft × 上海交大 × 同济 × 复旦
> 推特点评：Rohan Paul「像训练小程序一样训练 agent 技能」
## 一句话定位
**SkillOpt = 冻结模型参数，把 agent 外部技能文档当作可训练对象，用验证集门控每一次编辑。
3. ** 部署阶段零额外模型调用（optimizer 只在训练阶段参与）。
4. > 类比：LoRA 冻结模型主体、只训练一个小参数适配层；**SkillOpt 冻结全部模型参数、只训练一份外挂 skill 文件** —— 社区直接称"LoRA for skills"。
5. ## 解决的工程盲区
三种主流 skill 生产方式，同一个问题：**没有验证机制**。

### 关联实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch03/004-agent.html)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](../ch03/004-agent.html)
- [Karpathy Vibe Coding Agentic Engineering](../ch04/098-karpathy-vibe-coding-agentic-engineering.html)
- [你不知道的 Agent原理架构与工程实践 V2](../ch03/004-agent.html)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](../ch04/176-openclaw.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](../ch04/176-openclaw.html)

---

