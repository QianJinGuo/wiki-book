# AI Coding Agent Token 成本控制五层模型

> 📊 Level ⭐⭐⭐⭐ | 10.4KB | `entities/token-cost-control-coding-agent-devinyzeng-tencent.md`

> 原文归档：[原文归档](https://mp.weixin.qq.com/s/x8ssQ-trmIqHMPlvQSE9SA)

AI Coding Agent Token 成本优化的完整五层模型：使用习惯→模型路由→Context 工程→代码图谱→Agent 架构。devinyzeng/腾讯技术工程。

## 一句话

**成本 = 重复上下文搬运，优化 = 减少重复 + 合理路由 + 精准检索 + 清晰分工。核心不是少问一句话，是让系统少重复做无效工作。**

## 五层优化模型

| 层级 | 解决什么 | 方法 |
|------|---------|------|
| 使用习惯 | 无意义历史和废 Token | 一 session 一事 / 及时 compact / 外置长期信息 / CLI 优先 |
| 模型路由 | 贵模型干便宜活 | 任务分档 / 升级链路 / 预算旋钮 / Skill 绑模型 |
| Context 工程 | 同样前缀重复发送 | RTK/Caveman/headroom/context-mode |
| 代码图谱 | 每次从零找代码 | Graphify/CodeGraph |
| Agent 架构 | 所有任务塞同一大上下文 | subagent 隔离 / Orchestrator-Worker |

## 成本结构（核心洞察）

典型请求分布：

- System Prompt 5K + 项目说明 10K + Skill 定义 20K + Tool/MCP 定义 30K + 历史会话 100K + 代码文件 50K + **用户问题 0.1K**
- **贵的是系统塞进去的东西，不是你写的那句话**

五种成本：输入 Token / 输出 Token / 推理 Token / **工具往返** / **重试**（后两项最易被低估）

## Prompt Cache 三推论

1. 省的是重复成本不是首次
2. 缓存是"写稳"不是"写短"
3. 缓存优化和上下文治理是一回事

## 四个压缩工具对比

| 工具 | 压缩什么 | 典型节省 |
|------|---------|---------|
| RTK | 终端命令输出 | 89%（vitest -99.6%） |
| Caveman | AI 回复输出 | 65-75% |
| headroom | 所有进上下文的内容 | 47-92%（可逆压缩） |
| context-mode | MCP 工具结果+会话连续性 | 98%（工具输出） |

## 代码图谱实测

- **Graphify**：Tree-sitter 知识图谱，-71.5× Token 消耗，22k stars
- **CodeGraph**：7 仓库 benchmark：-16pp 成本 / -47pp Token / -58pp Tool Call（vs 无 CodeGraph 基线）

## Orchestrator-Worker 成本对比

单 Agent 全程：215K tokens × N 轮 → Orchestrator 10K + Worker 14K + Worker 10K = **每轮压缩 5-10 倍**

端到端示例：Go API 重构，单 Agent 800K-1.2M → Orchestrator-Worker 100K-150K（**-70~85%**）

## 数据流转四原则

1. 输出格式结构化 JSON（自然语言跨 Agent 传递易歧义）
2. 进度文件追踪状态（.agent/progress.json）
3. Worker context 精心裁剪（Orchestrator 明确"只读哪些"）
4. 临时文件及时清理

## 六大误区

上下文越多越好 ✗ / MCP 越多越强 ✗ / 所有 Agent 上最强模型 ✗ / 聊天记录当长期记忆 ✗ / 只看单价不看总成本 ✗ / Prompt 越短越好 ✗

## 核心公式

更低成本 = 更少重复上下文 + 更合理模型路由 + 更精准代码检索 + 更清晰 Agent 分工

## 深度分析

### 1. 五层模型的本质：从「优化信号」到「优化架构」的递进

五层不是并列清单，而是一条 ROI 与固定投入都逐层抬高的优化阶梯。使用习惯层改的是行为，几乎零基建成本、立竿见影；模型路由层需要一套 routing/预算基础设施；Context 工程层要引入压缩工具链；代码图谱层要搭图数据库与索引；Agent 架构层则要重构整个任务编排方式。每一层恰好命中一种不同的成本来源——习惯治「无意义历史与废 Token」，路由治「贵模型干便宜活」，Context 工程治「同样前缀重复发送」，代码图谱治「每次从零找代码」，Agent 架构治「所有任务塞同一大上下文」。

因此「五层」的价值不在罗列技巧，而在给出一个**自底向上的排障顺序**：先确认习惯层没漏（最便宜），再谈路由与压缩，最后才动代码图谱和架构。跳过低层直接上高层基建，往往是在放大一个本就该修掉的行为问题。这一递进关系也与 [Context 工程](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) 的「信号→系统」分层视角一致。

### 2. Prompt Cache 的杠杆本质：把线性会话成本变成亚线性

典型请求里固定前缀（System 5K + 项目说明 10K + Skill 20K + Tool/MCP 30K ≈ 65K）才是成本主体，而用户问题只有 0.1K。Prompt Cache 的意义正是让这段**稳定前缀在重复轮次中近乎免费**——所以真正的杠杆不是把 Prompt 写短，而是把它**写稳**，让命中率尽量高。三条推论（省重复不省首次、写稳不写短、缓存优化即上下文治理）其实收敛成一句话：**缓存优化 ≡ 上下文治理**。

这也解释了为什么「让固定前缀保持字节级稳定」比「每次精简 Prompt」更有效——前者把每轮成本压到亚线性，后者只是省了零星几 K。相关实证见 [625 分钟缓存规则](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tokenomics-the-625-minute-rule-for-claudes-cache.md) 与 [OpenClacky Prompt Cache Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclacky-prompt-cache-harness-v2ex-799662c56ba6.md)。

### 3. 压缩工具的取舍：无损 vs 有损的「信息保真度预算」

RTK / Caveman / headroom / context-mode 站在数据流的不同位置，取舍的本质是**在信息保真度与省 Token 之间分配预算**。RTK 压缩终端命令输出（-80%~-99.6%），属高损但对诊断噪音免疫；Caveman 压缩 AI 回复输出（-65~75%）；headroom 对所有进上下文的内容做**可逆压缩**（-47~92%，按需还原，牺牲一点压缩率换信息无损）；context-mode 沙箱化 MCP 工具输出（-98%）并保跨 compact 会话连续性。

关键判断是：**越接近「过程细节」越用高损压缩（终端输出、工具结果），越接近「必须还原的事实」越用可逆压缩（代码、错误栈、诊断上下文）**。headroom 的「可逆 + 按类型路由 + 按需还原」正是为后者设计的。参见 [headroom 上下文压缩](https://github.com/QianJinGuo/wiki-public/blob/main/entities/headroom-context-compression-agent-vibecoder.md) 与 [TACO 终端压缩](https://github.com/QianJinGuo/wiki-public/blob/main/entities/taco-terminal-agent-context-compression.md)。

### 4. Orchestrator-Worker 的成本不对称：分工即缓存

单 Agent 全程每轮 215K tokens，而 Orchestrator-Worker 拆成 Orchestrator 10K + Worker 14K + Worker 10K，每轮压缩 5-10 倍（端到端 -70~85%）。这不只是「上下文更小」，更关键的是**隔离本身就是缓存**：每个 Worker 的 context 被精心裁剪到只带必要信息，系统前缀稳定、可命中 Prompt Cache，且彼此不互相污染。四条数据流转原则（结构化 JSON、进度文件、裁剪 context、清理临时文件）存在的全部意义，就是让这种隔离做到**无损**——拆开上下文而不丢状态。

也就是说，Orchestrator-Worker 的成本收益来自「把一个大而有损的上下文，换成多个小而精确的上下文」，而非简单地少问几轮。参见 [Orchestrator-Worker](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/orchestrator-worker-architecture.md) 与 [多 Agent 上下文隔离](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-context-isolation.md)。

## 实践启示

1. **先修习惯、再上基建**：一 session 一事、聊天记录外置、CLI 优先、@完整路径——零成本、立即见效，永远先做这一层。
2. **让固定前缀稳定而非精简**：稳定 System Prompt / Skill / Tool 定义以最大化 Prompt Cache 命中率，「写稳」优于「写短」。
3. **按复杂度分档路由，匹配优先而非便宜优先**：用「便宜模型先跑 → 判断复杂度 → 需要才升级」的链路，避免让最强模型干所有活；给 Skill/Agent 绑模型。
4. **按数据流位置选压缩工具**：终端输出用 RTK、AI 回复用 Caveman、全上下文用 headroom（可逆）、MCP 工具输出用 context-mode；关键信息永远走可逆压缩。
5. **用代码图谱消灭「从零找代码」**：对代码频繁的 repo 上 Graphify / CodeGraph，把每次重复读文件变成一次性图谱检索（-71.5x Token / -47% Token / -58% Tool Call）。
6. **用 Orchestrator-Worker 拆上下文并保证无损**：强模型做规划、便宜模型执行，配合结构化 JSON + 进度文件 + 裁剪 context + 临时文件清理，把单 Agent 大上下文拆成多个便宜且隔离的 Worker。

## 相关实体

- [Harness Engineering](../ch05/066-harness-engineering.html)
- [Claw-SWE-Bench](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claw-swe-bench-harness-evaluation-benchmark-tokenrhythm.md) — Pareto 成本分析
- [快手 RCA Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/rca-agent-kuaishou-guo-yongliang-qcon-2026.md) — Workflow 快思考+Agent 慢思考
- [Skill 版本对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-version-comparison-five-principles-winty.md) — Token/时延门禁
- [12 Agent 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/twelve-agent-design-patterns-yunduojun-datastudio.md) — 分层记忆+上下文隔离

---

