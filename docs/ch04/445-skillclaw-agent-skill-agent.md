# 高德 SkillClaw：让 Agent Skill 学会进化——跨会话、跨Agent、跨设备、跨用户

## Ch04.445 高德 SkillClaw：让 Agent Skill 学会进化——跨会话、跨Agent、跨设备、跨用户

> 📊 Level ⭐⭐ | 5.2KB | `entities/skillclaw-collective-intelligence.md`

# 高德 SkillClaw：让 Agent Skill 学会进化——跨会话、跨Agent、跨设备、跨用户
> 原文：https://mp.weixin.qq.com/s/Qy8TFzm6rhLxW3EbzjZZSA
> 来源：高德技术（官方技术号）| 2026-04-22
> 论文：https://arxiv.org/abs/2604.08377
> 代码：https://github.com/AMAP-ML/SkillClaw

## 相关实体
- [Hermes Skill System Winty](ch04/245-skill.md)
- [Ai Skill Skill Creator 源码拆解](ch04/245-skill.md)
- [Agentic Ai System Architecture Harness Skill Mcp](ch04/245-skill.md)
- [Agent Skill Writing Guide](ch04/245-skill.md)
- [Agent Memory Engineering Tax Aws China 2026](ch03/044-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skillclaw-collective-intelligence.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)
## 深度分析

**群体智能的实现需要突破"单实例经验孤岛"，而这需要分层递进的架构设计。** SkillClaw 将群体智能划分为四个层次：单个用户内跨会话汇聚压缩、多 Agent 间经验共享、多设备间技能库同步、多用户间团队经验沉淀 。每一层都解决不同范围的经验共享问题，但底层共享同一个进化机制。这四个层次的递进关系揭示了一个重要洞察：群体智能不是一蹴而就的，而是从最小单元（个人会话）开始，逐步扩展到更大范围。

**进化器本身被设计为 Agent 是 SkillClaw 最重要的架构创新。** 传统做法依赖预定义规则（相似度去重、频率淘汰、按模板合并），这种被动式信息处理只能覆盖已预见到的模式 。SkillClaw 的做法是让进化器自己成为一个 LLM Agent，由它主动阅读所有实例聚合的会话证据，自主判断每个 Skill 应该如何更新——理解失败的根因、区分 Skill 缺陷和环境因素、决定修改的范围和方式。这是"Agentic"的核心含义：不是规则驱动，而是有自主判断力的 Agent 驱动 。

**Client Proxy 与 Evolve Server 的分离设计体现了工程上的务实与可扩展性平衡。** 两个模块只通过共享存储（OSS/S3/本地文件系统）交互，Client Proxy 负责拦截请求、录制会话轨迹、管理本地技能库；Evolve Server 负责从对象存储拉取数据、分析并更新技能 。这种设计的精妙之处在于：用户可以先只装 Client 获得基本能力，后续再叠加 Evolve Server 实现自动进化。渐进式的架构降低了使用门槛，同时为更复杂的组织场景预留了扩展空间。

**验证机制（validated 模式）引入了 CI/CD 思维，是 Skill 进化系统可靠性的关键保障。** 候选更新先进入验证队列，Client Proxy 在空闲时拉取任务，让新旧版本在相同场景下跑对比，只有新版本确实更好才会被接受 。这避免了错误 Skill 更新对生产环境的破坏，也让进化过程变得可追溯和可回滚。这种"测试先行"的机制对于将 Skill 进化投入实际生产环境至关重要。

## 实践启示

**如果你的团队或项目涉及多个 Agent 并行工作，优先解决经验孤岛问题。** SkillClaw 的四层群体智能模型可以帮助你判断当前最需要突破的是哪一层：从个人层面的会话经验汇聚开始，逐步扩展到团队层面的共享。

**在设计 Skill 进化机制时，优先考虑用 LLM Agent 替代纯规则的压缩策略。** 预定义规则的去重和合并虽然确定性高，但无法处理复杂和模糊的场景；而 LLM Agent 驱动的进化器可以理解失败根因、区分 Skill 缺陷与环境因素，做出更符合真实场景的编辑决策 。

**采用 validated 模式进行 Skill 更新，即使在个人使用场景下也不例外。** 在将新的 Skill 版本推广泛化之前，用旧版本在相同场景下做对比验证，确保新版本确实更好。这和软件工程中 CI/CD 的理念一致，可以有效防止"进化破坏" 。

**SkillClaw 的架构兼容性设计值得借鉴：Client Proxy + 共享存储 + 可选 Evolve Server 的模式，可以适配各种规模的组织。** 小规模使用只需部署 Client Proxy，无需引入复杂的服务器端组件；随着需求增长，再叠加 Evolve Server 实现自动化进化。这种架构思路同样适用于其他 Agent 系统的设计。

**在选择 Agent 框架时，优先选择与 SkillClaw 兼容或本身就支持的框架（Hermes、OpenClaw、CoPaw 等），以便未来能够接入群体智能的进化体系。** SkillClaw 目前支持多种主流 Agent 框架，且任何 OpenAI 兼容 API 都可以接入 。

---

