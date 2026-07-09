# Claude Code 从 Demo 到产线 · 企业 Harness 工程化的 8 道关卡（黄佳/咖哥 CSDN）

## Ch09.020 Claude Code 从 Demo 到产线 · 企业 Harness 工程化的 8 道关卡（黄佳/咖哥 CSDN）

> 📊 Level ⭐⭐ | 18.7KB | `entities/claude-code-demo-to-production-8-gates-huang-jia-csdn-2026.md`

## 核心定位

黄佳（咖哥）在 CSDN「AI 进化论」分享的 **Harness 工业化 8 道关卡**，是面向"百万行级代码库 + 多系统编排 + 长周期任务"的企业级 Agent 落地清单。每关给出"痛点 → 解法 → 工程模板"三段式。

**核心公式**：`Agent = Model + Harness` —— 模型是智力引擎，Harness 是工程化基础设施（上下文管理 / 工具调度 / 事件拦截 / 状态持久化）。**关键规律**：同一模型在不同 Harness 下的表现差异，远大于不同模型在同一 Harness 下的差距（TerminalBench 单改 Harness 即可由榜外冲进 Top 5）。

> 黄佳："2025 年我们都在玩 Vibe Coding，而 2026 年，企业真正需要的是 Harness Engineering。"

## 8 道关卡总览

| # | 关卡 | 痛点 | 核心解法 |
|---|------|------|----------|
| 1 | 读懂巨型代码库 | AI 记不住规范、大库读不完 | 五层记忆体系 + P0-P3 上下文分诊 |
| 2 | 控制幻觉 | 长会话压缩丢反馈回路 | 结构化输入 + Stop Hook 质量门禁 |
| 3 | 经验复用 | 好 Prompt 锁在个人 | Prompt → 声明式 Skill（渐进式披露） |
| 4 | Token 经济学 | 算力贵、用量不透明 | 三层路由 + 反向选型 + Talker-Reasoner |
| 5 | 约束与放手 | 顺手改坏安全逻辑 | 约束行动而非思考，HITL 介入不可逆 |
| 6 | 编排载体 | SubAgent/Skill/Workflow 混淆 | 四方图（岗位手册/专职员工/SOP/虚拟团队） |
| 7 | 长任务状态漂移 | 跑着跑着偏离目标 | 三平面分立 + 草稿纸看板 |
| 8 | 合规治理 | 谁对 AI 出错负责 | Provenance 来源坐标 + Pre-task gating |

## 第一关：读懂巨型代码库

**痛点**：百万行级代码库，AI "读不完"或"读了后面忘前面"。

**五层记忆体系**（按作用域从大到小）：
- **Enterprise 级 CLAUDE.md**：企业全局，写入安全合规硬约束（禁发外部 API、禁硬编码密钥）
- **User 级**：个人编码偏好（语言、快捷指令）
- **Project 级 CLAUDE.md**：团队规范（如 Fastify + pnpm），**Anthropic 硬指标 ≤ 200~300 行**（P0 槽）
- **Rules 级**：YAML frontmatter `paths` 字段做 Glob 条件化加载（如 `tests/**` 激活测试规范）
- **Local 级**：`.gitignore`，不提交

**P0-P3 上下文分诊** —— **LLM = CPU，Context = 内存，文件 = 磁盘**，借用 OS 虚拟内存思想：
- **P0** 系统/工具/MCP 注入（必读）
- **P1** 项目级硬规范（CLAUDE.md）
- **P2** 相关代码片段
- **P3** 历史工单 / 长时记忆

**实测**：排查"订单扣款失败"时，仅调 3 段核心日志（P0/P1）+ 5 段历史工单句柄（P3），**18K → 2K Token**，定位准确度反而更高。

## 第二关：控制幻觉

**痛点**：95% 容量自动压缩时，487-token 的"连接池耗尽"错误堆栈被压成 `a database error occurred`，AI 丢失反馈回路，原地打转。

**结构化输入**（注入而非生成）：
- ❌ 反例：帮我优化这个函数
- ✅ 正例：优化 `src/utils/parser.ts` 的 `parseConfig` 函数，瓶颈在第 42 行的循环

**Stop Hook 契约**（"Prompt 是请求，Hook 是契约"）—— 在 AI 完成响应后、准备交付前自动跑 `pnpm lint && pnpm test`，不通过则阻断并回喂 AI 自愈：

```json
{
  "hooks": {
    "Stop": [
      {"matcher": "All", "command": "pnpm lint && pnpm test", "blocking": true}
    ]
  }
}
```

## 第三关：经验复用（Skill 渐进式披露）

**解法**：把好用的 Prompt 封装为 `.claude/skills/<name>/SKILL.md` 资产 + Git 版本控制。

**渐进式披露**（3 阶段，按需加载）：

| 阶段 | 触发条件 | 加载内容 | Token 量 |
|------|---------|----------|----------|
| 启动 | 启动时 | name + description 元数据 | ~100 tokens |
| 匹配 | 用户输入命中语义 | 完整 SKILL.md | 视 Skill 而定 |
| 执行 | 需要动作时 | bundled 脚本/外部资源 | 按需 |

**多 Skill 系统的 Token 节省 ≈ 98%**。

## 第四关：Token 经济学

### 三层模型路由

业务复杂度分布统计：**41% 查询只是 SQL 模板填空**，根本用不上 Opus。

```
Haiku (60%) → Sonnet (30%) → Opus (10%)
```

**实测**：月账单 **48 万 → 12 万**，综合成本下降 **65%~75%**。

### 反向选型（受限模型下的模式选择）

当只能本地部署 Qwen-32B 时，**模式 > 模型**：
- Haiku 写代码 + Haiku 做 Code Review，**迭代 2 轮** → 综合算力低于单次 Opus，质量反超

### Talker-Reasoner 双系统

针对实时对话/Voice 高频交互场景，reasoning 模型动辄 24 秒会让用户以为系统卡死。

借鉴 Kahneman 双系统：
- **Talker**（200ms Haiku）：立即回复用户、边聊边等
- **Reasoner**（慢速 Opus/reasoning）：后台深度推理，**belief state 源源不断喂给 Talker**

→ 把思考延迟"藏"在用户感知之外。

## 第五关：约束与放手

> "约束限定的是行动的边界，而不是思考的自由。约束不是能力的保障，而是能力的容器。"

按 **爆炸半径（blast radius）** 分三档：

| 动作等级 | 操作类型 | 工程策略 |
|---------|---------|----------|
| 只读/低 | 查代码、看文档 | 自动放行，不中断 |
| 可写/中 | 文件修改、API 调用 | 留痕放行（Keyed log + replay 溯源） |
| 高/不可逆 | 删除、部署、转账 | **HITL 人工审核面板**，人手确认 |

## 第六关：编排载体四方图

四种编排载体映射四种工作实体，**不是竞争而是互补**：

| 载体 | 现实映射 | 关键属性 | 适用场景 |
|------|---------|---------|---------|
| **Skill** | 岗位操作手册 | 静态、跨任务复用、SOP 模板 | 跨项目共享能力 |
| **SubAgent** | 专职员工 | 独立隔离上下文、用完即销毁 | 防污染的短任务 |
| **Workflow** | SOP 流程图 | 显式确定性控制流、冻结在代码 | nightly build / 多步长流程 |
| **Agent Team** | 虚拟团队 | 长期多角色对话、持久化 Session | 持续协作的复杂任务 |

## 第七关：长任务状态漂移

黄佳引述 **梁博**（金融级 SaaS 智能体落地）的三权分立状态平面管理：

| 平面 | 内容 | 防漂移机制 |
|------|------|----------|
| **执行调度平面** | DAG 任务状态 + 执行流 | 不掺自然语言，纯结构化 |
| **机械参数平面** | 严格键值字典 | API 入参唯一可审计来源 |
| **叙事对齐平面** | 目标与进展 | "防波堤"（锚/账/集） |

**叙事对齐平面的三件套**：
- **锚（Anchor）**：用户原始最终目标，每轮校准
- **账（Ledger）**：里程碑台账，"做到哪一步"
- **集（Collection）**：投影工作集，每步只给最小上下文

**草稿纸看板**：将 AI 内部思考流**外化**为可读、可审计、可恢复的物理看板（落盘），崩溃后瞬间恢复。

## 第八关：合规治理

> "AI 是概率性模型，无法承担生产安全责任。'背锅'的永远是人。"

**Provenance 来源坐标体系**：对每个机械参数严格链路追踪（哪个工具产生、响应哪条路径、第几 turn、哪个用户输入）—— 出事能精准回溯。

**两条铁的纪律**：
1. **角色规则前置**：别等出事再补 Prompt，必须写进 Skill 或 `agent.md`
2. **Pre-task gating**：动手写代码前先评估（"要做什么还需要补充什么信息、明确哪些问题"）—— **不评估，不准写代码**

## ADPS 共同体

为避免踩坑经验回到封闭的个人脑里，黄佳联合**茹炳晟、姜宁、梁博**发起 **Agent 设计模式共同体（Agent Design Patterns Society, 简称 ADPS）**—— 集合软件工程、长程多智能体编排、企业级落地三方面资深专家。

## 互补角度（与现有实体对比）

1. **8 道关卡的关卡框架**本身：与 `agent-harness-12-components-7-decisions` 的"12 组件"和 `agent-harness-engineering-survey-2026` 的"ETCLOVG 7 层"是**第三种分类法**（按"痛点→解法"组织，而非按"组件/层"）
2. **P0-P3 上下文分诊**（CPU/内存/磁盘 隐喻 + 18K→2K 实测）—— 比 `agent-harness-context-management-working-set` 的"工作集"视角更轻量、比 `agent-memory-architecture` 的 5 层记忆更可操作
3. **Stop Hook 质量门禁**（blocking + 自愈循环）—— 现有实体未系统化
4. **三层模型路由（Haiku 60/Sonnet 30/Opus 10）+ 反向选型** —— 具体路由比例 + 48万→12万 数据是新的
5. **Talker-Reasoner 双系统**（Kahneman 映射 + belief state 供给）—— 现有 entity 未涵盖
6. **三平面分立（执行/参数/叙事） + 锚账集** —— 现有 `agent-reliability-context-drift-tool-hallucination` 的"漂移"概念的新解法
7. **Pre-task gating 纪律**（"不评估，不准写代码"）—— 工程化新规则

## 相关实体

- [Agent Harness Engineering Survey 2026](../ch05/050-harness-engineering.html) — 学术 Survey 的 ETCLOVG 7 层分类（不同分类法）
- [Agent Harness Context Management Working Set](../ch05/039-agent-harness.html) — 上下文管理的"工作集"视角
- [Agent Harness 12 Components 7 Decisions](../ch05/039-agent-harness.html) — 12 组件 + 7 决策框架
- [Agent Production Harness Engineering](../ch05/050-harness-engineering.html) — 工程赤字 + Demo vs 生产型判别
- [Harness Engineering Systematic Framework](../ch05/050-harness-engineering.html) — Harness 工程系统化
- [Agent Skill Writing](../ch04/264-agent-skill.html) — Skill 编写实践（第三关深入）
- [Agent Reliability Context Drift Tool Hallucination](../ch03/045-agent.html) — 漂移与幻觉的关联分析

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-demo-to-production-8-gates-huang-jia-csdn-2026.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/memory-context-systems.md)
## 深度分析

### 核心洞察：Harness 是比模型更大的变量

黄佳提出的核心公式 `Agent = Model + Harness` 揭示了一个反直觉规律：**同一模型在不同 Harness 下的表现差异，远大于不同模型在同一 Harness 下的差距**。TerminalBench 仅通过 Harness 层优化，就将同一模型从基线以下拉升至 Top 5。这说明在企业级落地场景中，购买更贵的模型不如投资更好的 Harness 工程化能力——Harness 才是真正的竞争差异化所在。

### 技术要点：上下文分诊的 OS 虚拟内存类比

P0-P3 上下文分诊的核心价值在于将 LLM 视作 CPU、Context 视作内存、文件系统视作磁盘，从而借用 OS 虚拟内存的分页调度思想。**18K→2K Token 的实测压缩**不是 magic，而是"只调相关段"的工程必然。[Agent Harness Context Management Working Set](../ch05/039-agent-harness.html) 的"工作集"视角与此处 P0-P3 分诊本质同构，但黄佳的 OS 类比更易于向传统工程师传达。

### 技术要点：Stop Hook 作为确定性工程契约

"Prompt 是请求，Hook 是契约"这句话点出了 [Agent Reliability Context Drift Tool Hallucination](../ch03/045-agent.html) 中幻觉问题的工程解法核心——不是靠更好的 Prompt 提示，而是靠 Hook 在响应交付前强制插入确定性检查环。blocking + 自愈循环（不通过则阻断→回喂 AI→重试）将概率性 AI 输出重新置于确定性工程的控制之下。

### 技术要点：三层模型路由的成本结构性压缩

Haiku 60% / Sonnet 30% / Opus 10% 的路由比例背后有数据支撑：41% 的查询只是 SQL 模板填空，根本用不上 Opus。**月账单 48 万→12 万**不是通过压缩质量实现，而是通过正确的任务-模型匹配实现。[Agent Harness 12 Components 7 Decisions](../ch05/039-agent-harness.html) 的 12 组件框架可为此路由决策提供系统性组件视角。

### 实践价值：Pre-task Gating 是防呆机制而非流程负担

"不评估，不准写代码"的 Pre-task Gating 纪律，本质上是将 [Harness Engineering Systematic Framework](../ch05/050-harness-engineering.html) 中的"工程赤字"概念落实为可执行规则。黄佳将其定位为"防呆"而非"审批"，是因为它防止的是 AI 在信息不完整时产生大量不可靠输出的情况——这种输出在长周期任务中的修复成本远高于前置评估的时间投入。

### 实践价值：ADPS 共同体将个人踩坑经验转化为组织资产

[Agent Skill Writing](../ch04/264-agent-skill.html) 解决个人级经验复用，而 ADPS 共同体解决跨组织级经验沉淀。Harness Engineering 的坑多数是共通的（上下文压缩、Token 成本、状态漂移），但行业内缺乏共享词汇表。ADPS 的价值在于建立共同的工程语言，使"某团队已解决的第 7 关问题"能快速映射为"另一团队的启动手册"。

## 实践启示

1. **优先建立五层记忆 + P0-P3 分诊，而非直接上 Agent**：在[Agent Production Harness Engineering](../ch05/050-harness-engineering.html) 的"Demo vs 生产型"判别中，上线前的第一件事就是建立上下文管理基础设施。没有 P0-P3 分诊的 Agent 等于没有内存管理的 CPU——看起来在跑，实际上在受罪。

2. **用 Stop Hook 将质量门禁自动化**：在 CI/CD pipeline 中嵌入 Stop Hook（`pnpm lint && pnpm test`，blocking=true），让每次 AI 交付都经过确定性检查。这是[Agent Reliability Context Drift Tool Hallucination](../ch03/045-agent.html) 中"反馈回路丢失"问题的最低成本解法，无需改模型，只要改 Harness 配置。

3. **三层模型路由是 token 成本控制的第一优先级**：先用 Haiku 做路由分类（41% 查询根本不需要 Sonnet），再考虑压缩上下文。对应[Agent Skill Writing](../ch04/264-agent-skill.html) 的渐进式披露原则——系统应该先判断"这个问题需要多少智能"，再分配对应算力。

4. **HITL 人工审核不可省，特别是删除/部署/转账类操作**：第五关的爆炸半径分级是 Harness Engineering 的安全基线。[Agent Harness Engineering Survey 2026](../ch05/050-harness-engineering.html) 的 ETCLOVG 7 层框架中"安全层"与此呼应——高爆炸半径操作的 HITL 不是流程繁琐，而是防止不可逆损失的最后防线。

5. **三平面分立 + 草稿纸看板是长周期任务的必选项**：[Agent Reliability Context Drift Tool Hallucination](../ch03/045-agent.html) 已记录漂移的危害，而三平面分立提供了结构化解法。叙事对齐平面（锚/账/集）确保目标不漂移，草稿纸看板确保崩溃可恢复。任何计划超过 2 小时的 Agent 任务都应该引入此架构。

---

