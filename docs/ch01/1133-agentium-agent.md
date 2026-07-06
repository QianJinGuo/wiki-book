# Agentium — 从零实现 Agent 系统的开源框架

## Ch01.1133 Agentium — 从零实现 Agent 系统的开源框架

> 📊 Level ⭐⭐⭐ | 11.7KB | `entities/agentium-agent-framework.md`

- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agentium-agent-framework.md)

## 核心理念
> 门面薄，线在中间，底子能换。
Agentium 是一个的教学型开源 Agent 框架，用来演示「如何把 Chat 包装成一套可上线的多平面软件系统」。不是生产级框架，但架构分层思路值得借鉴。

## 三张架构读图尺子
### 1. 操作系统尺子
把 Agent 的多轮对话类比成**用户态进程**，关注：
| 问题 | 对应架构关切 |
|------|-------------|
| 谁在跑？ | 会话生命周期管理 |
| 能不能优雅打断？ | Turn 中断 / 可取消的执行上下文 |
| 写盘/出站是否走固定入口？ | 工具契约、网关边界、沙箱隔离 |
关键教训：**入口（API/CLI）和配额要分开**，否则账算不清。

### 2. 控制论尺子
把 Agent 目标达成类比成**反馈控制系统**：
```
目标(给定值) → Agent动作 → 外部世界变化(对象侧)
                    ↑
               观测(日志/账单/评测/人要插嘴)
                    ↑
策略/限流/编排(调节器) ←
```
**审批、发布门、内容检查**必须是并联闭环，不能假装「模型更懂事」就能跳过合规。

### 3. 容器思维尺子
三个可落地机制：

- **配额** → 租户预算 / cgroup 类比
- **快照** → 每次 run 固化一份配置快照 / 不可变镜像类比
- **收紧默认** → 默认关闭高风险出站能力 / seccomp/SELinux 类比
**三件事连成一句话：边界（OS）+ 闭环（控制论）+ 配额与快照（容器）**，足够撑住第一轮架构评审。

## 分层架构
```
┌─────────────────────────────────────────┐
│         接口层  facade (api / cli)       │  ← 薄门面，只翻译格式
├─────────────────────────────────────────┤
│              装配层  app (runtime boot)  │  ← 接线：单例对象注入
├─────────────────────────────────────────┤
│    运行层 run                            │
│  · core (调度与生命周期)                 │
│  · coordination (会话与 Turn 编排)        │
│  · ai_gateway (模型网关)                 │
│  · channels / tools / memory /           │
│    sandbox / plugins …                   │  ← 业务逻辑主要所在
├─────────────────────────────────────────┤
│  治理层 gov (security / evaluation /      │
│            audit / 限流 / 合规)          │  ← 横切能力，并联闭环
├─────────────────────────────────────────┤
│    基础设施 infra (db / mq / telemetry)  │  ← 可替换，不绑架业务
└─────────────────────────────────────────┘
```
依赖规则：**谁不许反向依赖谁**（domain 不依赖 infra 具体实现，coordination 不把叙事写死路由文件）。

## 多平面设计
同一套领域语义，可部署为四个平面：
1. **对话主线** — 用户可见的聊天交互
2. **后台异步** — 定时任务、长时运行操作
3. **控制面** — 运维视角：配额、限流、日志、实例管理
4. **评测演练** — 红队/评测 agent 执行环境

## 关键模块
| 模块 | 职责 |
|------|------|
| `core` | 生命周期管理、调度、可打断执行上下文 |
| `coordination` | 会话管理、Turn 序列编排、loop 控制 |
| `ai_gateway` | LLM 调用、模型路由、超时重试 |
| `governance` | 安全策略、内容审核、审计日志、预算配额 |
| `sandbox` | 工具执行隔离、环境变量、权限控制 |
| `infra` | DB/MQ/Telemetry 可插拔实现 |

## 与 demo 相比，上线还需要什么
| 维度 | 最小 demo | 企业级 |
|------|----------|--------|
| 入口 | HTTP → LLM → 工具 | API Gateway + 鉴权 + 限流 |
| 执行 | 单轮 loop | 可打断的 Turn + 状态机 |
| 工具 | 直接调用 | Sandbox 隔离 + 工具契约 |
| 观测 | 无 | 完整审计日志 + 账单 + 遥测 |
| 合规 | 无 | Governance 并联闭环（审批/内容检查） |
| 存储 | 无状态 | 可替换存储（DB/MQ）+ Session 持久化 |

## 相关框架对比
- Agentium 是**教学型框架**，不是 AutoGen/CrewAI/LangGraph 的替代品
- 核心价值：**展示如何把多平面架构画在一张白板上**，让团队对齐
- 与 LangGraph 的区别：LangGraph 关注**图的构建**，Agentium 关注**系统分层和依赖方向**

## 系列文章
1. **本文** — Agent 系统是什么：问题空间与架构切片

## 深度分析
Agentium 的核心价值不在于成为一个生产级框架，而在于**演示了一种将 AI 能力系统化的思维方式**。三个"尺子"（操作系统、控制论、容器）的借用，本质上是在解决一个根本问题：如何让团队在白板前对齐认知，而不是各说各话。
**分层架构的依赖规则**是理解 Agentium 的关键。"谁不许反向依赖谁"这句话背后是：

- domain 层不依赖 infra 具体实现 → 业务逻辑与存储解耦
- coordination 不把叙事写死路由文件 → 编排逻辑与入口解耦
- facade 只做格式翻译 → 接口层极薄，方便替换
这种依赖方向的一致性，使得系统可以在不破坏核心逻辑的情况下替换底层组件（比如把内存存储换成 Redis，把本地 LLM 换成云端 API）。
**多平面设计的实践意义**在于：同一个 Agent 系统可以有四套部署形态——对话界面给用户、异步任务给后台、运维面板给 SRE、评测环境给红队——而无需为每个平面重写业务逻辑。代码复用与关注点分离在这里是同一件事的两个面。
**Governance 并联闭环**的设计选择尤为值得注意：作者强调审批、内容检查必须是与主流程并联的闭环，而不是假装"模型更懂事"就能跳过合规。这反映了一种务实的工程态度——承认模型的局限性，在架构层面而不是 prompt 层面解决风险问题。

## 实践启示
1. **从小 demo 到可上线系统，差的不止是 prompt**：最小 demo 通常只有"进来 → 网关 → loop → 工具"一条线；生产系统还需要治理与安全、异步后台、控制面、可替换存储。这些不是功能堆砌，而是**架构分层后自然长出来的能力**。
2. **入口（API/CLI）和配额要分开**：这是操作系统思维的直接应用。如果入口层混杂了预算控制、限流逻辑，团队协作时会陷入"账算不清"的困境。薄门面 + 独立治理层的组合是解法。
3. **工具执行必须走沙箱隔离**：工具是 Agent 与外部世界交互的唯一通道。如果工具调用没有契约约束和沙箱隔离，系统上线后几乎必然面临"模型 prompt 注入绕过安全边界"的问题。
4. **三件事连成一句话可撑住第一轮架构评审**：边界（OS）+ 闭环（控制论）+ 配额与快照（容器）。如果评审时能用这三句话解释清楚系统的设计选择，就已经过了最难的沟通关。
5. **框架选型要区分目标**：Agentium 是教学型框架，核心价值是**展示如何画架构图**，而不是替代 AutoGen/CrewAI/LangGraph。如果你的目标是快速构建生产 Agent系统，选生产级框架；如果目标是让团队对齐架构认知，Agentium 的分层思路值得借鉴。

## 来源
- 微信公众号「贵慜」，2026-05-17
- GitHub: https://github.com/ichbinderek/agentium

## 相关实体
- [Scalable voice agent design with Amazon Nova Sonic: multi-agent, tools, and session segmentation](https://github.com/QianJinGuo/wiki/blob/main/entities/scalable-voice-agent-design-with-amazon-nova-sonic-multi-agent-tools-and-session.md)
- [Claude Code 架构解析](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-architecture.md)
- [Agent 时代架构师技能指南](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-era-architect-skills-guide.md)

- [基于多智能体架构的深度思考交易系统](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)

---

