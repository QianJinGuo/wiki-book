# SkillClaw × Nacos：从一次 Agent 会话到可治理 Skill Registry 的自动演化闭环

## Ch04.423 SkillClaw × Nacos：从一次 Agent 会话到可治理 Skill Registry 的自动演化闭环

> 📊 Level ⭐⭐ | 6.5KB | `entities/skillclaw-nacos-evolution-registry.md`

# SkillClaw × Nacos：从一次 Agent 会话到可治理 Skill Registry 的自动演化闭环

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skillclaw-nacos-evolution-registry.md)

## 摘要

高德技术团队（墨松）提出了 SkillClaw × Nacos 联合方案，解决 Agent 经验从"一次个人成功实践"到"可复用团队资产"的演化难题。SkillClaw 从真实 Agent 会话中提炼候选 Skill，Nacos AI Registry 承接 draft→review→online 的治理流程、版本标签分发、审计回滚，形成从 Memory 到 Skill Registry 的完整闭环。

## 核心要点

### 产生之困 + 共享之困

Agent Skill 的落地面临两个核心难题：

1. **产生之困**：Agent 在真实任务中沉淀的经验难以从"一次个人成功实践"转化为可复用 Skill。经验停留在本地 memory，没有形成团队资产
2. **共享之困**：即使提炼成 Skill，如何被团队发现、使用、版本管理、审核、回滚？Skill 只是本地文件就无法团队级复用

这两个困境本质上是 [Agent 记忆系统](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-architecture.md) 从"个人记忆"到"组织知识"跃迁的核心瓶颈。

### SkillClaw 与 Nacos 各解决什么问题

**SkillClaw（高德技术）**：Agent 运行时框架，通过本地 proxy 接管模型调用，注入 Skill 目录，记录 Agent 执行过程（会话 turn、工具调用、结果、错误、Skill 命中）。Evolve Server 基于数据判断：是否有可复用经验？已有 Skill 需改进？应生成新 Skill？

核心能力：
- 从真实使用数据中发现可复用模式→沉淀 Skill
- 持续改进已有 Skill
- 为不同 Agent 客户端提供统一 Skill 生成/同步入口

**Nacos AI Registry**：将 Skill 作为 AI Resource 注册管理，支持：
- 版本、标签管理
- draft/reviewing/online 状态机
- Pipeline 审核、label 分发、审计、Trace

这与 [Agent Capability Library](ch03/045-agent.md) 的设计理念相通——都需要一个中心化的 Skill 治理基础设施。

## 深度分析

### 闭环运转机制

SkillClaw × Nacos 的联合工作流程：

1. **Registry 后端对接**：SkillClaw 内置 Nacos 作为 Skill Registry 后端，本地候选 Skill 提交到 Nacos
2. **生命周期治理**：候选 Skill 默认进入 Nacos draft→review→online 治理流程
3. **版本与标签分发**：Nacos label 管理 Skill 版本，SkillClaw 客户端按标签（如 `latest`）拉取同步到本地

### 治理保障

治理设计确保安全性和可控性：

- SkillClaw 生成候选 Skill，**不做最终发布决策**
- Nacos 承接 draft→review→online 治理流程，以及 label、审计、回滚、上下线
- Agent 运行时只读取 Skill，**不持有发布和删除权限**
- 敏感信息、危险命令、越权工具等检查，通过 Nacos Pipeline 和 `skill-scanner` 插件接入

这种"生成-治理分离"的架构与 [Anthropic 对抗式架构](ch03/045-agent.md) 中的"合同谈判机制"有异曲同工之妙——都强调生成方和验证方的职责隔离。

### QuickStart 流程（7 步）

1. 安装部署 Nacos
2. 启动 SkillClaw Proxy 和 Evolver（配置 LLM、Nacos 连接、会话目录）
3. 启动 Agent 并对话（通过多次对话教会 Agent 特定格式/流程）
4. 查看 Evolver 生成结果（日志中查找 uploaded skill 确认）
5. 登录 Nacos 查看 Skill Registry（验收候选 Skill 列表）
6. 新会话测试 Skill 复用（一句话调用已注册 Skill）
7. 停止并恢复 Agent 配置

### 落地场景

| 场景 | 描述 |
|------|------|
| 新人接手老项目 | 资深同学带 Agent 跑过需求后，SkillClaw 沉淀实操经验为 Skill，Nacos 审核后发给团队 |
| 反复处理同类线上问题 | 排查过程中 SkillClaw 提炼排障 Skill，Nacos 审核发布 |
| 平台能力推广 | 平台同学完成接入后 SkillClaw 提炼接入步骤，Nacos 按版本标签分发 |
| 统一 Agent 工作方式 | SkillClaw 从多人真实使用中提炼稳定工作模式，Nacos 统一管理分发 |
| 一线支持沉淀高频问题 | 支持类 Skill 审核发布，减少重复答疑 |

这些场景与 [Skill 编写最佳实践](ch04/258-skill.md) 中总结的 Skill 设计模式高度吻合。

### 未来方向

- **打通生成链路与会话追踪**：每次 Skill 版本变更记录基于哪次会话、验证得分、发布原因
- **从 Skill 扩展到 AgentSpec**：模型配置、Skill 集合、Prompt 引用、安全策略都从真实运行中持续生长

## 实践启示

1. **Skill 不是写出来的，是长出来的**：最有价值的 Skill 来自真实任务执行中的模式发现，而非人工预先设计
2. **治理先于分发**：没有审核流程的 Skill 分发是危险的——需要 draft→review→online 的完整生命周期管理
3. **生成与治理必须分离**：让 Agent 自己决定什么 Skill 可以发布，等于没有质量控制
4. **版本标签是协作基础**：团队级 Skill 复用需要明确的版本管理和标签分发机制
5. **审计回滚是生产必需**：Skill 一旦出问题，需要能快速回滚到上一个稳定版本

## 相关实体

- [Agent Capability Library](ch03/045-agent.md)
- [工作流的 Skill 怎么写从 7 个顶级 Skill 中提炼的模式与最佳实践](ch04/258-skill.md)
- [Qoder Skills 完全指南从零开始让 Ai 按你的标准执行](ch07/031-qoder-skills.md)
- [Perplexity Internal Skill Design Guide Xiaojianke](ch04/258-skill.md)
- [Deli Auto Research Skill V2 Continual Learning Self Improvement](ch04/258-skill.md)
- [Agent 记忆系统六大学派](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-architecture.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/mlops-training-inference.md)

---

