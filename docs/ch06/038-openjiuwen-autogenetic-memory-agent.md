# OpenJiuwen AutoGenetic Memory — 华为开源自主生长Agent记忆引擎

## Ch06.038 OpenJiuwen AutoGenetic Memory — 华为开源自主生长Agent记忆引擎

> 📊 Level ⭐⭐ | 4.6KB | `entities/openjiuwen-autogenetic-memory-agent-2026-07-02.md`

# OpenJiuwen AutoGenetic Memory — 华为开源自主生长Agent记忆引擎

> AutoGenetic Memory 是华为 openJiuwen 社区开源的 Agent 自主生长记忆引擎，采用 L0-L3 分层记忆架构、AutoDreaming 后台异步加工、MemoryTurbo 涡轮加速、Graph Memory 关系图谱与 Swarm 群体记忆等核心机制，在 LoCoMo 基准上实现准确率提升 15%、Token 消耗降低超 60%。

## 核心架构

### L0-L3 分层记忆体系

JiuwenMemory 设计了四层记忆架构，让信息从原始对话逐级抽象为结构化知识：

- **L0 原始信息层** — 完整保留对话历史与时间戳，支持回溯与全量分析
- **L1 摘要记忆层** — LLM 压缩单次会话关键结论，降低 Token 消耗
- **L2 结构化记忆层** — 拆分为情景记忆（事件/决策时间轴）与语义记忆（背景知识/技术细节）
- **L3 用户画像层** — 核心特征刻画（偏好、习惯、角色、结构化变量）

分层价值：信息密度逐级放大、偏好与技术细节分离、全量历史免加载、Token 成本降低。

### AutoDreaming（"梦中"异步记忆加工）

借鉴认知神经科学的记忆固化理论，将高成本记忆提取操作从在线路径剥离，放到后台定时离线异步完成：

- **浅睡** — 增量筛选
- **REM 阶段** — LLM 单遍完成提取与归类
- **深睡** — 语义去重、冲突消解后写入长期记忆
- 多重控本：守护进程定时触发、忙碌退避、断点续扫、批次封顶

### MemoryTurbo（前台/后台动能解耦）

前台对话产生"排气"（新增信息），后台飞轮旋转转化为"增压"（结构化记忆）。原始对话瞬间写入缓存层向量库完成更新，记忆提取在后台按算力负载异步调度。

- 用户感知时延降低 80%
- Token 使用量进一步降低 50%+
- 提取未完成时缓存层仍可检索

### Graph Memory（关系图谱记忆）

将对话、文档和结构化内容转化为可持续演进的记忆知识图谱，Agent 沿着实体和关系理解长期记忆。

- 实体与关系链路召回，解决纯语义检索遗漏
- Episode 保留来源溯源
- 跨会话信息组织成关系网络

### Swarm 群体记忆

基于蜂群协作范式，每个 Agent 独立积累个体记忆，同时将共享经验沉淀至组织级记忆池，新 Agent 直接继承已有知识。

### 动态 Adapter 层（双维度解耦）

- **Plugin 维度** — 面向 Agent 平台（已支持 OpenClaw）
- **Provider 维度** — 面向记忆引擎（已内置 JiuwenMemory 和 Mem0）
- 记忆跨平台继承，避免被单一框架锁定

## 基准性能

- **LoCoMo 测评集**：JiuwenMemory 接入 OpenClaw，准确率提升 15%，Token 消耗降低超 60%

## 相关资源

- 开源仓库：https://gitcode.com/openJiuwen/agent-memory/
- openJiuwen 官网：https://www.openjiuwen.com/

## 相关交叉链接

- [OpenJiuwen Swarm 协作工程](https://github.com/QianJinGuo/wiki/blob/main/entities/jiuwenswarm-coordination-engineering.md) — 同一社区的 Agent 协作框架
- [Agent 记忆架构](../ch04/524-perplexity-brain-self-improving-agent-memory-architecture.html) — Agent 记忆系统设计模式
- [若飞 Agent 记忆架构](../ch04/180-agent-memory.html) — 分层记忆视角对比
- [Hermes Agent 记忆系统](ch06/014-hermes-agent-memory.html) — 记忆引擎实现对比
- [Agent Harness 记忆现状](../ch05/043-agent-harness.html) — Mem0 等同类引擎
- [淘宝 Agent 记忆评估全景](../ch04/180-agent-memory.html) — 记忆评估体系
- [AI Agent 记忆系统综述](../ch04/180-agent-memory.html) — 记忆系统综合对比
- [三种记忆范式对比](ch06/049-memory.html) — 范式级对比
- [Claude Code 七层记忆架构](../ch03/085-claude-code.html) — 分层记忆设计对比

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/openjiuwen-autogenetic-memory-agent-2026-07-02.md)

---

