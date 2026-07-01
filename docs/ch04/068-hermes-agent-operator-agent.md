# Hermes Agent Operator 上手：把一个 Agent 养成可运营系统

## Ch04.068 Hermes Agent Operator 上手：把一个 Agent 养成可运营系统

> 📊 Level ⭐⭐ | 19.0KB | `entities/hermes-agent-operator上手-把一个-agent-养成可运营系统-若飞.md`

## 一句话总结

本文是 Shann³《How to Become a Hermes Agent Operator》的中文解读 + 本土化补充，提出**把单个 Agent 从聊天窗口养成可运营系统的最小化路径**：先建控制室（5文件），再养真实任务（3次纠偏），最后决定要不要拆 Agent / 加编排 / 上 cron。

## 核心架构：控制面 vs. 运行面

两个核心目录对应 Agent 的两个侧面：

| 目录 | 定位 |
|------|------|
| `/root/vps-agents` | 控制室（Control Room）：文档、规则、Runbook、架构图 |
| `/srv/<agent-name>/data` | 运行时（Runtime）：密钥、记忆、Skills、会话、cron |

分开这两个目录，就是**"个人玩具"和"工程资产"的分界线**。控制室让 Agent 从"只有我自己知道怎么用"变成"别人也能 hold 得住"。

## 控制室 5 文件模板

| 文件 | 回答的问题 |
|------|-----------|
| `inventory.md` | **身份**——Agent 负责什么、不负责什么、人找谁、工具清单、谁批高风险动作 |
| `env-map.md` | **凭据**——密钥名称、提供方、作用域、轮换周期、撤销步骤（不放密钥值） |
| `runbook.md` | **恢复**——怎么启动/停止/看日志/重放失败任务/撤销变更/判断可恢复 |
| `backup.md` | **状态**——哪些目录要备份、备份频率、恢复步骤、有没有演练 |
| `security.md` | **边界**——哪些工具默认允许、哪些动作必须审批、不可信来源、Skill/Memory 写入规则 |

## Agent 三组件与沉淀顺序

| 组件 | 文件 | 作用 |
|------|------|------|
| brain | `MEMORY.md` + `USER.md` | 稳定事实、用户偏好、业务上下文 |
| personality | `SOUL.md` | 输出风格、沟通习惯、角色边界 |
| skillset | `skills/` | 反复出现的流程、动作、工具用法 |

**顺序比内容更重要**：第一周目标是让 Agent **住下来**——有身份、有边界、有记录。先跑真实任务跑错纠偏，再慢慢沉淀成 Skill。不要第一天就写 Skills（多半是脑补的）。

## 三条访问路径（优于"四级演进"）

| 路径 | 场景 | 登场顺序 |
|------|------|---------|
| **direct path** | 起步期——路径短、状态少、出问题方便回溯 | 最早 |
| **control path** | 管理面——改系统、看系统、恢复系统，不跑业务 | 并行 |
| **orchestrated path** | 等多个专职 Agent 成熟后——经常遇到路由/合并问题再考虑 | 最后 |

**拆新 Agent 的三个条件**（只有满足才拆）：
1. 有独立凭据
2. 有独立长期记忆
3. 有稳定流程且反复出现

否则拆出来只是给自己添麻烦。mega-agent 也不健康——所有密钥/记忆/风格都塞进去，撤权难、记忆互相污染、出错时边界不清楚。

## SEO Agent 案例：强顺序链路不宜硬拆容器

Shann 的 21 步 SEO Agent（research → production → distribution）三组 sub-agent **都塞在同一个 Docker 容器**里，共享 env、memory、tools、文件系统。

原因：SEO 是**强顺序链路**——研究阶段的意图判断影响 brief，brief 影响 outline，outline 影响正文，正文又反向影响配图、QA、分发、监控。硬拆到三个隔离容器，状态每搬一次就多一次掉上下文的机会。

**原则**：别按岗位名拆，按上下文边界拆；上下文不是聊天记录，是工作集。

## 四道门：原型 → 生产

| 门 | 动作 | 验收标准 |
|----|------|---------|
| 第一道门 | 在主 Agent 里原型化 | 把流程用真实语言描述，跑一遍，把错暴露出来 |
| 第二道门 | 真实任务跑 2-3 次 | 盯纠偏——顺序、输出标准、工具稳定性、上下文取舍 |
| 第三道门 | 拉到独立工作区收紧 | 整理提示、固定路由、补错误处理、定验证标准 |
| 第四道门 | 上 VPS/Docker/cron | 跑过一周真实任务，失败时停得住、结果能复盘、状态能恢复 |

> **cron 不是自动化。** cron 只是把一次错误变成周期性错误。少了目标、预算、验证、停止条件，跑得越久攒下的问题越多。

## 安全：延迟触发型 Prompt Injection

常驻 Agent 的风险会跨时间、跨入口、跨介质悄悄传播（延迟触发）。常见场景： ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]

- 邮件诱导 Agent 把错误规则记进 Memory
- 网页内容诱导改掉某个 Skill
- 聊天消息诱导创建定时任务

**应对**：在设计阶段评估渗透半径——边界清楚，Agent 才敢多做一点；边界不清，越自动越心虚。

## 模型路由

- 创意/文案/语气/hook/草稿 → 擅长写作和品味的模型
- 编码/规划/多步骤流程/浏览器自动化/抓取 → 适合结构化执行的模型
- **最强模型留给**：编排 Agent + 需要做判断取舍的关键 Agent
- 便宜模型接：批量研究、初稿、格式转换、风险可控的重复处理

## 7 天落地行动清单

| 天 | 行动 |
|----|------|
| Day 1 | 挑一个重复任务（周会整理、竞品归档、PR 预检、客服摘要） |
| Day 2 | 建控制室：`inventory.md` / `env-map.md` / `runbook.md` / `security.md` |
| Day 3 | 写稳定上下文：业务事实、输出标准、禁用动作、审批边界 |
| Day 4-5 | 真实任务跑三次，每次留 `task-result.md`（输入/动作/产物/人工改动/不可靠判断/修正计划） |
| Day 6 | 回头看要不要写 Skill（只有稳定形状才沉淀，含触发条件/输入/步骤/完成标准/失败处理/下线条件） |
| Day 7 | 决定要不要升级（稳定 + 需独立凭据/记忆/职责 → 拆专职 Agent；多个专职 Agent 需路由/合并 → 编排层；恢复/日志/审批/owner 齐全 → cron） |].md]

## 深度分析

### 从"玩具"到"系统"的本质跃迁

Agent 从聊天窗口走向可运营系统，核心转变在于**外部化程度**。聊天窗口里的 Agent 依赖：].md]

- 人类在场的上下文维持
- 隐性的记忆（人类记得之前说过什么）
- 不需要恢复预案（会话重启=状态清零）

可运营系统要求：].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]

- **显性的身份边界**（inventory.md）
- **可审计的凭据管理**（env-map.md）
- **可复现的启动/恢复流程**（runbook.md）
- **独立于创建者的记忆沉淀**（MEMORY.md / USER.md）

这个跃迁的本质是从"**会话级状态**"到"**文件级状态**"——Agent 的上下文不再只存在于模型的隐含注意力窗口里，而是沉淀到磁盘上的持久化文件。].md]

### 控制面/运行面分离的工程意义

| 维度 | 控制面（Control Room） | 运行面（Runtime） |].md]
|------|----------------------|-------------------|].md]
| 变更频率 | 低（架构性决策） | 高（每次任务执行） |].md]
| 权限要求 | 人类操作员可读写 | Agent 只读/特定目录可写 |].md]
| 备份策略 | 版本控制（Git） | 定时快照（cron + 差量） |].md]
| 泄露后果 | 业务逻辑暴露 | 凭据泄露 |].md]

这种分离解决了 Agent 运营中最常见的矛盾：**既要让 Agent 能自主执行，又要在它出错时能快速接管**。控制面就是人类干预的锚点。].md]

### "四道门"的生产哲学

传统的 Agent 开发思路是**先设计再实现**：架构师画好流程图，工程师写好代码，测试通过后上线。].md]

若飞/ Shann 的思路是**先养再拆**：].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]
1. 先在主 Agent 里跑通流程（第一道门）].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]
2. 用真实任务暴露不稳定因素（第二道门）].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]
3. 确认流程稳定后再独立部署（第三道门）].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]
4. 验证长期可维护性后才上 cron（第四道门）].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]

这个思路背后的逻辑：**Agent 的流程不是设计出来的，是从真实任务里涌现出来的**。过早的架构设计只会导致"架构美观但跑不通"的困境。].md]

### 延迟触发型 Prompt Injection 的深层威胁

传统安全模型假设攻击是**即时性**的——恶意输入立刻产生恶意输出。但常驻 Agent 引入了**时间维度**：].md]

```].md]
Day 1: 恶意内容被写入 Memory].md]
Day 3: 看似无关的任务触发 Memory 中的恶意规则].md]
Day 5: 攻击者早已不在现场，但 Agent 执行了预期外的操作].md]
```].md]

这类似于网络安全中的"**高级持续性威胁（APT）**"——攻击者获得初始入口后，长期潜伏、等待时机。防御思路不是"阻止所有不可信输入"，而是**限制渗透半径**：即使恶意内容写入 Memory，Agent 也没有权限执行高风险动作。].md]

### 模型路由的本质：任务-能力匹配

把不同模型分配给不同任务，不是因为"便宜模型够用"，而是**每个模型的注意力机制和知识激活模式适合不同任务类型**：].md]

- 写作模型：更长上下文窗口，更强的跨段落语义追踪
- 编码模型：更结构化的输出，更强的精确性偏好
- 通用模型：平衡但无专长

最强模型留给编排层的原因：编排 Agent 需要做**判断和取舍**——在多个子 Agent 的结果中决定哪个更可信、哪个需要重跑、哪个可以合并。这是最接近"元认知"的任务。].md]

## 实践启示

### 落地优先级：先止血再健身

很多团队第一次建 Agent 时的错误是：**上来就设计完美架构**。结果是：].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]

- 建了一堆 Skills，但 Agent 跑真实任务时频繁失败
- 控制室文件齐全，但没人维护
- 拆了多个 Agent，但互相调用时丢上下文

**正确优先级**：].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]
1. **止血**：让一个 Agent 先跑通一个真实任务].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]
2. **记录**：把纠偏过程记下来（task-result.md）].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]
3. **健身**：从纠偏记录里提炼 Skill].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]

### 控制室建设的最少必要知识

不需要第一天就写完 5 个文件。根据任务风险程度逐步完善：].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]

| 阶段 | 必须 | 建议补 | 可延后 |].md]
|------|------|--------|--------|].md]
| 原型期 | inventory.md（身份） | env-map.md（凭据清单） | runbook.md / backup.md |].md]
| 部署期 | inventory.md + env-map.md | runbook.md | backup.md |].md]
| 稳定期 | 全部 | 定期演练 | — |].md]

**inventory.md 是最小可行的控制室**——只要这个 Agent 跑死时有人知道怎么接手，就算及格。].md]

### 判断"要不要拆 Agent"的简化标准

如果无法明确回答这三个问题，**先不要拆**：].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]
1. 这个 Agent 需不需要独立的 API 凭据？].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]
2. 这个 Agent 的记忆会不会污染其他 Agent？].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]
3. 这个 Agent 的失败会不会拖垮其他 Agent？].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]

如果三个都是"是"或"很可能"，才值得拆。如果有任何一个"不确定"，说明对边界的理解还不够深。].md]

### cron 上线检查清单

上 cron 前必须确认：].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]

- [ ] **停止条件**：任务在什么情况下应该停？
- [ ] **验证机制**：谁/什么检查 cron 的输出质量？
- [ ] **预算追踪**：这次 cron 消耗多少资源？
- [ ] **Owner**：谁是这个 cron 的责任人？
- [ ] **恢复步骤**：cron 跑挂了，谁来救、怎么救？

缺少任何一个，cron 只是在**积累技术债**。].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]

### Prompt Injection 防御的三个层次

| 层次 | 措施 | 适用场景 |].md]
|------|------|----------|].md]
| 边界层 | Docker 隔离、allowlist、危险命令审批 | 所有常驻 Agent |].md]
| 记忆层 | Memory 写入需二次确认、高风险内容标记 | 写入频繁的 Agent |].md]
| 行为层 | 限制 cron 创建、高风险动作需审批 | 外部输入多的 Agent |].md]

**不要只靠一层防御**。边界层可能被穿透，记忆层可能被污染，行为层需要人工介入成本。真正的防御是三层叠加。].md]

### 模型路由的实践建议

建立**模型能力矩阵**，而不是"能用哪个用哪个"：].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]

```].md]
| 任务类型 | 推荐模型 | 原因 |].md]
|----------|----------|------|].md]
| 文案/创意 | GPT-4o (写作版) | 长上下文、风格一致性 |].md]
| 结构化代码 | Claude 3.5 Sonnet | 精确性、格式遵循 |].md]
| 批量研究 | GPT-4o Mini | 成本可控、质量够用 |].md]
| 编排判断 | 最强模型 | 元认知需求 |].md]
```].md]

路由策略确定后，写进 inventory.md，下次换模型时知道影响哪些任务类型。].md] ^["https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"]

## 相关概念

- agent-harness-engineering（实体不存在，待创建） — Agent 工程的 Harness 视角
- `Hermes Agent` — Hermes Agent 系统本身
- multi-agent-collaboration（实体不存在，待创建） — 多 Agent 协作模式
- context-engineering（实体不存在，待创建） — 上下文管理（不是聊天记录，是工作集）
- prompt-injection-security（实体不存在，待创建） — Prompt Injection 安全问题

## 相关实体
- [Hermes Observability Aliyun](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-observability-aliyun.md)
- [Hermes Agent Memory System Vs Openclaw](ch04/502-agent.md)
- [Hermes Agent Vs Openclaw Comparison](ch04/502-agent.md)
- [Hermes Agent Self Evolving Source Analysis](ch04/040-hermes-agent-self-evolving-source-analysis.md)
- [Small Hermes Self Evolving Agent Architecture](ch04/502-agent.md)

---

