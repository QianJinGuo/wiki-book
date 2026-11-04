# SLF：Loop 会随项目线性增长，所以要按 Sprint 切开

> 📊 Level ⭐⭐⭐⭐⭐ | 14.4KB

## 一句话结论

基础 Loop Engineering 解决了"让 Agent 自己跑起来"，但隐含假设是 **Loop 一次性设计、永远不变**。Sprint Loop Framework（SLF）把这个假设换掉：**"Loop 应该像代码一样，按 Sprint 迭代、跨项目复用、持续演进。"** 触发点是三条实测曲线——**Sprint 1（3 模块 / 150 检查点）跑得动 → Sprint 12（10 模块 / 350 检查点）每次回归 15 分钟 → Sprint 33（全模块 / 900+ 检查点）Agent 改一行触发 900 个检查、3 个不通过、反馈 300 行，"Agent 根本不知道该修哪个"**。结论一句：**"Loop 随项目线性增长，维护成本指数增长。"**

## 一、它反驳的是"Trace 自动驱动改进"

LangChain 四层循环假设 **Trace 数据能自动驱动 Loop 改进**。作者认为这在复杂项目中不成立：**"Trace 不能告诉你'Sprint 10 应该加什么检查'——那是 Sprint 目标决定的。"** 正确的因果顺序是**先有 Sprint 目标，再据目标设计 Skills / Harness / Grade**；Trace 是**回顾素材**，不是驱动者。

## 二、四个核心原则

**原则 1 · Sprint 目标驱动，非 Trace 驱动**（同上）。

**原则 2 · 每个 Sprint 独立设计四要素**：

| 要素 | 定义 | 本 Sprint 要写什么 |
|---|---|---|
| **Skills** | Agent 需要知道什么 | 新增技术知识 + 继承自之前 Sprint 的知识 |
| **Harness** | Agent **不能**做什么 | 新增约束 + 继承的约束 |
| **Grade** | 怎么验证做对了 | 本 Sprint 新增检查 + **对之前核心路径的回归** |
| **Loop** | 失败后怎么处理 | 重试策略、熔断条件、退出后的问题解决流程 |

**原则 3 · Loop 策略随项目 Phase 演进**（一种策略跑到底是不对的）：

| Phase | 策略 | 目的 |
|---|---|---|
| **1 探索期** | 激进重试、宽容熔断 | 大量试错，**收集 Agent 的失败模式** |
| **2 成长期** | 关键路径重试，性能/误报不重试 | 核心功能可靠，边缘 case 人工判断 |
| **3 成熟期** | 保守重试、严格熔断 | 稳定压倒一切，**任何退化立即停止** |
| **4 自治期** | 极少重试、ML 相关问题不重试 | Agent 只做确定性工作，不确定的升级给人 |

**原则 4 · 退出不是"升级给人"，是一条多路径流程**：

```
重试 3 次仍不通过 →
  记录 TODO List（不阻塞当前 Sprint）
  → 已知故障模式：自动修复
  → 未知故障：多 Agent 议会（安全/架构/性能/产品 + 批评者）
  → 方案选择：
     ≥90% 解决 → 自动执行
     80-90%   → 执行 + 剩余标记"已知限制"，传入下个 Sprint
     <80%     → 生成分析报告，提交给人决策
```

理由来自对真实工作的观察：**"人遇到复杂问题时不会卡在原地死磕——先记录到 TODO 不阻塞当前工作；然后拉个专题讨论从多个角度分析；找到一个 90% 的方案就先用着；剩下的 10% 留到下个版本。"** 而这里最关键的变化是：**"人不被 Agent 的失败打断。人只在决策点介入，而且收到的是分析报告，不是错误堆栈。"**

## 三、Landing Zone：每个 Sprint 的"出发区"

来自作者早前的《Spec Coding 的 Landing Zone》。四部分各自派生 Loop 的不同组件：

| Landing Zone | 内容 | 主要派生出 |
|---|---|---|
| **Spec（规范）** | API 契约、技术栈、数据模型 | **Grade ~70%**、**Skills ~80%** |
| **安全最佳实践** | 无硬编码密钥、SQL 参数化 | **Harness ~50%**、Grade ~15% |
| **团队编码规范** | 命名约定、目录结构 | Grade ~10%、**Harness ~20%** |
| **Sprint 范围** | 做什么、不做什么 | **CLAUDE.md 边界声明** |

**这条"1:1 映射"是全文最有工程价值的发现**：**"Grade 的约 70% 可以直接从 Spec 的 API 契约自动生成。人写 Spec，大部分 curl + 断言不需要手写。Spec 变了，Grade 自动跟着变。"** 剩下约 30% 来自安全实践与团队规范——**"API 响应中不要返回 password_hash""不要在日志中打印密码""不用 bare except"** 这类 Spec 通常不会写的东西。

## 四、电商示例：一个 Sprint 的实际文件

12 个 Sprint 拆分：**1-2 用户（注册/登录/JWT/个人信息）、3-4 商品（CRUD/分类/搜索/SKU）、5-6 购物车（增删改/价格校验/库存校验）、7-8 订单（创建/状态流转/取消/退款）、9-10 库存（出入库/防超卖/预警）、11-12 管理后台（审核/订单管理/报表）**。

Sprint 1 的约束文件序列（按顺序编写）：

```
01-grade.py          ← 从 API 契约派生：12 个 curl + 断言
02a-harness-guard.py ← 从安全实践派生：路径白名单、命令白名单、代码扫描
02b-CLAUDE.md        ← 从 Sprint 范围派生：框架自动加载进提示词
03-skills.md         ← 从技术栈派生：Flask 语法、JWT 用法、数据库结构
04-memory.yaml       ← 状态分区配置
05-trigger.yaml      ← 触发规则配置
```

**12 条机器可执行检查**（注意它们全是行为断言，没有一条要求措辞）：注册正常/用户名已存在/用户名过短/email 非法/缺必填、登录正常/密码错误/用户不存在/**账号锁定（5 次错 → 第 6 次 423）**、Token 有效/缺失、**安全-响应无密码（不含 password_hash）**。

**Harness 硬约束**（Agent 绕不过）：`guard_file_write`（每个 `write_file` 前检查路径是否在允许列表）、`guard_command`（每个 `run_command` 前拦截 `rm`/`sudo`/`git push`）。

运行实测很朴素：**第 1 次 0/12 通过 → 反馈注入 → 第 2 次 7/12 → 继续修正或进退出流程**。分工一句：**"人做的事：定义 Landing Zone + 写约束文件。Agent 做的事：在约束下生成代码、自动验证、失败自动重试。代码是 Agent 在约束下生成的，不是人写的。"**

## 五、完整框架与适用边界

架构自上而下：**Landing Zone（Spec + 安全实践 + 团队规范 + Sprint 范围）→ 每 Sprint 的四要素（Skills / Harness / Grade / Loop）→ 共享基础设施（Trigger 共享调度器、Memory 各自分区）→ 多路径退出（Tier 0 重试 → Tier 1 TODO+分析 → Tier 2 议会 → ≥90% 方案/升级）→ 跨 Sprint 资产沉淀（Grade / Harness / Loop Patterns，下个项目直接复用，"从 2 个 Sprint 起步"）**。

**什么时候用**（作者自己划的边界，这点很诚实）：
- **适合**：周期 > 6 个月、模块 > 5 个、希望 Agent **逐步自治**而非一步到位、需要跨版本管理交付质量；
- **不需要**：单模块短周期（**基础 LE 足够**）、Agent 只做辅助且人不依赖其交付（**连 Grade 都不需要**）、一次性任务（直接 `/goal` 跑完）。

定位一句：**"它不是替代 LangChain 或 Claude Code 的方案——它是跑在这些工具之上的一层。你仍然用 /goal 和 /loop，但你不再一次性设计一个巨型 Loop，而是每个 Sprint 设计一个小而精准的 Loop，然后把它们串起来。"**

## 深度分析

### 它抓到的是 Loop 的**组合爆炸**，不是"模型不够强"

150 → 350 → 900+ 检查点的曲线说明：**Loop 的成本不是随模块数线性增长，而是随"模块 × 回归范围"增长**——因为每加一个模块，既要加它的检查，又要保证它不破坏之前所有模块。这是典型的集成测试问题，只是换了个名字。**所以解法也不是"更强的模型"，而是"更小的范围"**：Sprint 化把回归集合限制在"当前 Sprint 新增 + 核心路径"，才把指数拉回线性。

### "Grade 的 70% 从 Spec 自动派生"是这套方法能落地的真正原因

任何"多写文档"的倡议都会死在人力上，除非它能**减少**工作量。这里的等式很漂亮：**人写一次 Spec（本来就要写），自动得到 70% 的可执行断言**——Spec 变则 Grade 变，1:1 映射。这让"验收标准"从额外负担变成**规范书的副产品**。剩下 30% 来自安全与规范，恰是 Spec 通常不覆盖、又最容易被模型踩的部分（不返回 `password_hash`、日志不打密码、不用 bare except）。**这条经验可以直接搬到任何 API 型任务上。**

### 多路径退出，本质是承认"Agent 的失败分三种，人只该处理第三种"

已知故障 → 自动修复（模式已存在于知识里）；未知但可解 → 议会多角度分析，**≥90% 就执行，80–90% 执行并标记已知限制**；<80% → 出报告给人。这套设计把"人工"从"每次失败都来救火"变成"只在真正拿不准时决策"，而且**收到的是分析报告而不是 300 行错误日志**。作者那句"人不被 Agent 的失败打断"是核心——**打扰成本才是 Agent 落地的隐形天花板**。

### Phase 化的重试策略，等于给"自治度"装了一个旋钮

探索期要"多犯错"（激进重试、宽容熔断）才能收集失败模式；成熟期要"零退化"（保守重试、严格熔断）；到自治期反而**极少重试**——因为此时该做的是确定性工作，不确定的就升级。**这与"越成熟越敢放手"的直觉相反：成熟期的正确策略是更保守，而不是更激进。** 与 HarnessPro 的"三档成本"、高德的"校验按风险分档"同属一类思想：**策略强度必须随场景/阶段变化，而不是全局常量。**

### 与"Loop 会自动进化"的叙事划清界限

这篇最清醒的地方是它对 RSI 式叙事的限定：Trace 不能决定下一个 Sprint 该加什么检查，**那是目标问题不是数据问题**。换句话说，**Loop 的"进化"不是自发的，是被 Sprint 目标牵引的**。这与 RSIHub 的"换起点、换任务，领先方法就变"、Harmony 的"按功能接受导致负迁移"共享同一个底层判断：**没有目标约束的自动优化会漂移。**

## 实践启示

1. **先量一下你的 Loop 有多大**：检查点数量、单次回归耗时。超过"Agent 一次改动能读完的反馈量"，就该拆 Sprint。

2. **每个 Sprint 独立写四要素**：Skills / Harness / Grade / Loop，且都要写"继承了什么"——否则约束会在迭代中丢失。

3. **Grade 从 Spec 派生**：API 契约 → curl + 断言，1:1 映射；Spec 变 Grade 跟着变，避免两套真相。

4. **补那 30% 非 Spec 检查**：不返回敏感字段、日志不打密码、不用 bare except——这些来自安全与规范，Spec 不会写。

5. **Harness 做在调用前**：`write_file` 查路径白名单、`run_command` 拦危险命令，而不是靠提示词劝阻。

6. **失败先记 TODO，别阻塞 Sprint**：退出流程的第一步不是求人，而是登记并继续。

7. **退出分三档**：≥90% 自动执行、80–90% 执行并标"已知限制"、<80% 出报告给人——**给人报告，不给错误堆栈**。

8. **重试策略跟着 Phase 走**：探索期激进、成长期选择性、成熟期保守、自治期极少；**成熟期该更保守而非更激进**。

9. **范围声明进 CLAUDE.md**：本 Sprint 做什么/不做什么，比"尽量做好"更有效。

10. **跨 Sprint 沉淀 Patterns**：Grade/Harness/Loop 模式复用能让新项目"从 2 个 Sprint 起步"。

11. **别对短项目用重框架**：单模块几周就能完的，`/goal` 够用；一次性任务连 Grade 都不必。

## 与相关实体的关系

- [Claude Code Loop Engineering 指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-loop-engineering-guide.md)、[Loop Engineering 八问](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-loop-engineering-handbook-8-questions-chen-jin-tencent-self-2026.md) 讲的是**单个 Loop 怎么设计好**；本篇讲**多个 Loop 怎么切分与串联**——一个管内，一个管间。
- [Agentic Loop Engineering 实证框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-loop-engineering-handbook-empirical-framework.md) 提供循环的分层与度量；本篇补上"**Loop 规模本身会变成瓶颈**"这条边界条件。
- Harness Engineering 与 [Skill 路由](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-routing-description-self-evolution-qwen-platform-2026-11-03.md) 对应本篇四要素中的 Harness 与 Skills 两支。
- [vivo PM 视角的 Harness 契约](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vivo-pm-agent-harness-design-task-card-contract-2026-11-04.md) 同样强调"契约要写在可校验的地方（Schema/Policy/断言）而不是 Prompt"；本篇的"Grade 从 Spec 派生"是它在验收侧的具体实现路径。
- [HarnessPro](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harnesspro-pareto-self-evolution-cost-performance-thu-zhipu-2026-11-04.md) 的三档成本、[高德 Data Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amap-data-agent-two-way-translation-cfhl-framework-2026-11-04.md) 的校验分档，与本篇的 **Phase 化重试** 构成同一族"策略强度随场景变化"的三次独立实践。

→ [原文存档](https://developer.cloud.tencent.com/article/2708615)

---

