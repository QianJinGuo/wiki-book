# 小米 MiMo Code — 长程编程 Agent 三大主线（计算/记忆/进化）+ 与 Claude Code 工程分化

## Ch09.009 小米 MiMo Code — 长程编程 Agent 三大主线（计算/记忆/进化）+ 与 Claude Code 工程分化

> 📊 Level ⭐⭐ | 28.0KB | `entities/mimo-code-xiaomi-coding-harness-2026.md`

## 概述

**小米 MiMo 团队** 2026-06-11 凌晨发布 **MiMo Code**（MIT 开源，基于 OpenCode 构建），定位**长程自动化编程任务的终端编程 Agent**。核心目标：解决 AI 编程 Agent 在**几十步甚至上百步**持续执行中的**决策质量、状态连续性和跨任务经验积累**问题。

**罗福莉原话**："14 天、5 个人、一场 vibe coding 之旅。" 当前 MiMo Auto 限时免费，基于 MiMo-V2.5，**支持 100 万 token 上下文**。Auto 模式新用户可能被随机分配到 **UltraSpeed 模式**（MiMo-V2.5-Pro **1000 tokens/s**）。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

## 与 Claude Code 对比

| 维度 | 数值 | 备注 |
|------|------|------|
| **离线 benchmark** | MiMo Code + MiMo-V2.5-Pro **优于** Claude Code + Claude Sonnet 4.6 | 单仓库级问题一次性解决能力 |
| **200 步以内** | 胜率接近 **50%** | |
| **200+ 步 + 多轮用户交互** | MiMo Code 胜率 **升至 65%+** | **随任务复杂度增加而放大** |

> 小米披露：在同一目标模型下对比 MiMo Code 与 Claude Code 的端到端真实开发体验时，MiMo Code 的优势会**随任务复杂度增加而放大**。

## VILA 实验室的 Claude Code 源码分析

VILA 实验室（Mohamed bin Zayed AI University）发布论文（arxiv: 2604.14228），对 **Claude Code v2.1.88** 全面源码级架构分析（1900 个 TypeScript 文件 / 51.2 万行代码）。

**核心数据**： ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]
- **1.6%** 属于 AI 决策逻辑
- **98.4%** 都是确定性基础设施（权限管理 / 上下文管理 / 工具路由 / 恢复逻辑）
- **Agent 循环本身只是一个简单的 while 循环**，真正的工程复杂度存在于围绕它构建的外围系统
- **7 层安全机制**，但都受性能约束影响
- **跨层交织的 Harness 难以重新实现** — 循环很容易复制，但 **hooks、分类器、压缩机制和隔离机制并不容易复制**

**每一项设计选择都追溯到**：决策权 / 安全性 / 可靠性 / 能力放大 / 适应性。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

## MiMo Code 三大主线

### 主线一：计算（Compute）— 解决 "做对"

#### Max Mode：并行采样 + 优选执行

| 特性 | 详情 |
|------|------|
| **机制** | 每一轮**并行生成多个候选方案**，默认数量为 **5** |
| **候选约束** | 候选方案**只做推理和工具调用规划，不实际执行** |
| **优选方式** | 同一个模型作为 **judge**，对比候选方案的推理过程和行动计划，**选出最优方案执行** |
| **效果** | SWE-Bench Pro **提升 10% 至 20%**（相比单次采样） |
| **代价** | 约 **4-5 倍** token 消耗 |
| **状态** | 实验阶段，需手动配置开启 |

#### Goal 机制：解决 "做完"

**问题**：长任务中 Agent 容易在看到已有进展后**过早宣称任务完成**。无人值守自动化中提前终止会放大失败风险。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

| 特性 | 详情 |
|------|------|
| **机制** | 用户用**自然语言设定停止条件**（"所有测试通过且代码已提交"） |
| **流程** | Agent 尝试终止时，系统自动发起**独立模型调用**，对完整对话历史进行审查 |
| **未满足** | 将具体差距反馈给 Agent 并要求其继续 |
| **vs Claude Code** | Claude Code 主要由**主 Agent 自己判断**（外加 max turns / context overflow / hooks / abort 系统条件）。**MiMo Code 显式引入独立 verifier，把"做事的 Agent"和"验收的 Agent"分开** |

#### 工具调用语法：XML vs JSON

- 部分模型输出 JSON 时格式错误率较高
- **XML 相比 JSON 略好**
- **受限命令行语法在表达相同调用意图时 token 更少、格式错误率更低**

### 主线二：记忆（Memory）— 让逻辑会话无限延伸

#### Cycle + Rebuild

**目标**：让一个逻辑会话可以无限延伸，而每个上下文窗口仍保持有界。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

| 阶段 | 触发时机 | 操作 |
|------|---------|------|
| **Checkpoint** | 会话接近窗口上限前，**固定位置触发** | 派出独立的 **writer subagent** 读取已有对话，将结构化状态写入磁盘 |
| **主 Agent 继续** | 与 writer 并发执行 | |
| **Rebuild** | 窗口接近真正上限时 | 切断当前窗口并开启新窗口，用已经持久化的文件作为种子重建上下文 |

**为什么提前触发？** ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]
- 模型在**高上下文利用率下能力会衰减**
- 长输入中段材料更容易被忽略（**"lost in the middle"**）
- 提取和压缩本身也需要上下文空间

**触发点**：相对早期触发 checkpoint，**大致位于已配置预算的 20%、45%、70% 处**，每次进行增量更新，避免最后一次仓促压缩。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

**Writer 独立设计**：MiMo Code **没有让主 Agent 自己维护记忆**，而是将记忆提取交给独立 writer subagent，**不与主 Agent 共享注意力或 token 预算**。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

> 小米认为，**要求一个正在调试复杂问题的模型同时维护结构化日志，往往会让两件事都做不好**。

**Checkpoint 文件结构**：固定结构，**11 个字段**（当前意图、下一步动作、工作约束、任务树等）。**每个结构化文件只允许一个 actor 写入**，避免并发写入导致状态不一致。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

#### 四层记忆体系

| 层 | 作用 | 存储 |
|----|------|------|
| **Session 记忆** | 当前逻辑会话 | 临时 |
| **Project 记忆** | 项目级持久知识 | Markdown 文件 |
| **Global 记忆** | 跨项目生效的用户偏好 | 全局 |
| **History** | 每个会话的完整轨迹 | **SQLite**（每条消息和每次工具调用原文） |

**回溯机制**：当结构化记忆无法找到细节时，Agent 可以通过 history 工具**回溯原始记录**。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

### 主线三：进化（Evolution）— 跨 session 经验沉淀

#### Project 记忆（Markdown 文件）

保存：项目背景 / 用户明确要求的规则 / 架构决定及其理由 / 反复验证过的技术事实。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

**选择文件而非纯向量数据库的主要原因 — 可审查性**：当记忆会影响 Agent 后续行为时，用户需要能够看到系统记住了什么，并删除错误条目或修改过时知识。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

#### Dream 机制（7 天自动触发）

| 步骤 | 内容 |
|------|------|
| 读取 | 历史 session 对话 + 现有记忆文件 |
| 整理 | 合并 / 去重 / 路径有效性验证 / 压缩 |
| 更新 | 全局记忆 |

#### Distill 机制（30 天自动触发）

**重点不是整理知识，而是识别反复出现的工作模式**，并将其固化为： ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]
- 可复用的 **skill**
- **CLI 命令**
- **自定义 Agent**
- **SOP 文档**

## Dynamic Workflow：编排从 prompt 转为代码

### 与 Claude Code 编排对比

| 维度 | Claude Code | MiMo Code |
|------|-------------|-----------|
| **方式** | **模型逐步决策**（看到上下文后决定下一步） | **代码化 workflow**（JavaScript 脚本确定性执行） |
| **执行环境** | Agent 循环内 | **隔离沙箱** |
| **核心原语** | AgentTool / MCP / skills / hooks | `agent()` 派出子 Agent / `parallel()` 并发 / `pipeline()` 流水线 / `workflow()` |
| **能力扩展** | 通过 prompt 与 skills 扩展 | 通过代码 + workflow() 原语扩展 |
| **可扩展性** | 流程写在 prompt 中 | 兼容 Anthropic Dynamic Workflow 核心语义，扩展日志恢复、沙箱内文件读写 |

### 为什么把流程代码化？

- 自然语言流程容易被上下文压缩吞掉
- 模型可能跳过步骤
- 分支和重试逻辑依赖模型判断而非代码保证
- 同一流程多次执行路径不一致

> **当任务规模扩大到整个项目迁移等场景，需要同时协调几十甚至上百个并行工作单元时，传统"把流程写进自然语言 prompt 或 SKILL.md"的方式会系统性失效。**

## 关键 bug 教训：自动删除全局 npm 包

**最严重的早期问题**：MiMo Code Agent 在执行任务时，**自动检测到用户全局 npm 目录下存在 OpenCode 相关包**（`opencode-ai` / `opencode-windows-x64` / `oh-my-opencode` / `oh-my-opencode-windows-x64`），**自行判断是迁移残留**，随后**未经用户确认执行 `npm uninstall`**，导致用户正在使用的 OpenCode 开发环境被破坏。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

**用户建议**： ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]
- 对于 `npm uninstall`、`rm` 等删除操作，**必须增加确认机制**
- 考虑提供 **dry-run 模式**，先展示将执行的操作，再由用户确认

**其他设计问题**： ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]
- 默认开启 telemetry，向 `tracking.miui.com` 发送指标信息（包括正在使用的模型）
- 可通过 `MIMOCODE_ENABLE_ANALYSIS=false` 关闭，但**"默认开启且命名为 analysis"的设计并不理想**
- 关闭遥测后，工具仍会自动检查更新并获取 MiMo 模型列表

## Coding Harness 开源的商业模式之争

### 社区一派观点

> "coding harness 就应该开源，而大模型应该被视为商品化能力。这样可以最大限度降低用户的切换成本。"

> "Claude Code 根本就没什么特别之处。我们不需要他们的商业模式，他们才需要。"

### 反方观点

> "企业为什么要主动开源这些工具、降低用户迁移成本？这类似于要求云服务商把平台全部开源、取消出口费用，让客户随时离开。"

> "开源并不天然等于商业模式，企业没有义务把有价值的产品层变成公共品。"

### 核心争议：coding harness 是否有护城河

| 观点 | 主张 |
|------|------|
| **A 派（无护城河）** | 真正完成代码任务的是底层模型，coding harness 本身没有太多神秘之处，更多只是用户体验层能力 |
| **B 派（有护城河）** | 不同 harness 的配置、工具设计、人类审批机制、diff 展示、上下文注入方式，**都会显著影响最终效果**。即便模型是核心发动机，运行时和工具层依然会决定 Agent 能不能稳定进入真实工程流 |

### Anthropic 商业模式深度解析

| 维度 | 内容 |
|------|------|
| **核心机制** | 把大量订阅额度与编程使用场景绑定 |
| **价格策略** | Claude Max 20/100/200 美元订阅套餐给出**非常夸张**的使用额度 — 前提是必须使用其 coding harness |
| **交叉补贴** | Anthropic 大幅补贴 token 消耗，赢得自家 harness + token 使用量 |
| **三种收益** | **第一**：关于软件开发如何使用大模型的一手高价值数据；**第二**：把整个行业引导到围绕其 harness 概念形成事实标准 — **某种意义上，他们正在把自己变成大模型交互接口领域的 W3C，只不过这是一个私营组织**；**第三**：所有这些数据 |

**核心观点**：编程 Agent 正在成为模型消费的高频入口。MiMo Code 开源被部分用户视为对 Claude Code 等闭源工具的**一次挑战**。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

## 工程重点分化的本质

### 共同基础

"**模型 + 运行时 + 工具调用循环**" 的终端编程 Agent： ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]
- **模型**负责推理和决策
- **运行时**负责管理工具、组装上下文、执行命令、持久化状态

### 关键分化

| 维度 | Claude Code | MiMo Code |
|------|-------------|-----------|
| **代码量** | 约 **1900 个 TypeScript 文件 / 51.2 万行** | 基于 OpenCode |
| **AI 决策逻辑占比** | **1.6%** | 强调长程三主线 |
| **确定性基础设施** | **98.4%** | Cycle + Rebuild + 4 层记忆 + Dream/Distill |
| **长程计算** | max turns / context overflow | **Max Mode（并行采样） + Goal 机制** |
| **编排方式** | 模型逐步决策 + AgentTool / MCP / hooks | **JavaScript 代码化 workflow + agent() / parallel() / pipeline()** |
| **记忆** | CLAUDE.md / auto memory / JSONL / sidechain | **Cycle + Rebuild + 4 层 (Session/Project/Global/History)** |
| **进化** | 手动维护 CLAUDE.md | **Dream（7d）+ Distill（30d）自动整理 + 模式沉淀** |
| **完成验证** | 主 Agent 自评 + 系统条件 | **独立 verifier Agent 审查** |

## 深度分析

### 1. "工程不是 AI" 的极端化体现

VILA 的 1.6% / 98.4% 数据说明 Claude Code 真正的复杂度在**基础设施层**，而非 AI 决策层。MiMo Code 的 3 主线设计（Max Mode / Cycle / Dream-Distill）则是**对长程 Agent 难题的工程化拆解**： ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

- **Max Mode** → 用 **5x token 换 10-20% 准确率**（在长程任务中"做对"比"省 token"更重要）
- **Goal 独立 verifier** → 把"做事"和"验收"职责分离（避免自评自的确认偏误）
- **20%/45%/70% 早期 checkpoint** → 避免一次性压缩的"lost in the middle"

**这套设计哲学与 Claude Code 的 7 层安全 + 4 层机制形成鲜明对比**：Claude Code 强调"每次循环都做对"，MiMo Code 强调"出错也能恢复 + 经验能沉淀"。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

### 2. "可审查性"是 Harness 设计的隐藏主线

MiMo Code 选择 **Markdown 文件**（而非向量数据库）作为项目记忆存储的根本原因 — **可审查性**。这种"人能读懂、能修改、能删除"的设计哲学贯穿整个系统： ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

- **11 字段固定结构的 checkpoint**（机器可解析 + 人可读）
- **每条记忆只允许一个 actor 写入**（状态一致性 + 可回溯）
- **History 用 SQLite 保存原始记录**（细节可回溯）

这与 Snowflake Agentic Enterprise 的 **Data Movement Policy**（"行为可审计、可回溯"）形成跨厂商共识 — **企业级 AI 系统的护城河不是模型能力，而是可审查性 + 可恢复性**。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

### 3. "Coding Harness 护城河" 之争的真相

A 派与 B 派的争论本质上混淆了**能力层**和**应用层**： ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

- **能力层（模型）**：由基础研究决定，跨厂商趋同
- **应用层（harness）**：由产品决策决定，差异化空间巨大

VILA 的 1.6% / 98.4% 数据看似支持 A 派（harness 没什么神秘），但 MiMo Code 的 3 主线设计说明 **98.4% 的工程本身就是护城河** — 因为它需要： ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]
- 大量工程经验
- 大量 bug 教训（如 npm uninstall 案例）
- 大量设计权衡（XML vs JSON / 早期 vs 晚期 checkpoint / 单 actor 写入）

**Anthropic 真正的护城河不是 Claude Code 的代码**，而是 **"以补贴 token 换 harness 标准化" 的商业模式** — 让整个行业习惯于它的 harness 接口设计。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

### 4. Open Source 作为反制策略

MiMo Code 选择 MIT 协议开源 **+ 主动暴露 200+ Issues** 的策略，本质上是对 Claude Code 闭源 + W3C 化策略的**反制**： ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

- **降低用户切换成本** → 打破"养成习惯 = 锁定用户"的循环
- **公开接受社区监督** → 倒逼工程成熟
- **挑战"harness = 公共品" vs "harness = 商业秘密"** 的根本问题

这种**"开源 harness + 闭源模型"** 的反 V 字型组合，可能比"闭源 harness + 闭源模型"（Anthropic）或"开源模型 + 闭源 harness"（多数厂商）更利于行业长期发展。 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

## 实践启示

### 何时考虑 MiMo Code

- 需要执行 **200+ 步**的长程编程任务
- 需要 **项目级 + 跨 session 经验沉淀**
- 接受 **OpenCode 生态**（继承其功能与潜在 bug）
- 团队可承受 **4-5x token 消耗** 换 10-20% 准确率提升
- 需要 **可审查、可回滚的 Agent 记忆**

### 落地路径

1. **试点 Max Mode**：在受控 benchmark 上验证 5x token 换 10-20% 准确率的成本/收益 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]
2. **配置 Goal 机制**：用自然语言定义"完成标准"（"所有测试通过 + 代码已提交 + 无 lint 错误"） ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]
3. **设置 20%/45%/70% checkpoint 预算**：让 long-running 任务有可恢复点 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]
4. **启用 4 层记忆**：从项目级开始沉淀，再扩展到 Global ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]
5. **保护性配置**：禁用 npm uninstall / rm 等破坏性操作的自动执行，强制 dry-run 确认 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]
6. **关闭 telemetry**：`MIMOCODE_ENABLE_ANALYSIS=false` ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]
7. **定期 review Dream/Distill 输出**：避免错误记忆污染未来会话 ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

### 经验教训：Agent 安全的"高风险操作"清单

MiMo Code 的 npm uninstall bug 暴露了 **Agent Harness 设计的通用安全原则**： ^["[InfoQ: 5人2周肝出5.1k星！小米 MiMo Code开源](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)"]

| 操作 | 风险等级 | 建议机制 |
|------|---------|---------|
| `rm -rf` | 极高 | **强制 dry-run + 二次确认** |
| `npm uninstall -g` | 高 | **必须确认**（影响范围超当前任务） |
| 数据库 DROP / DELETE | 极高 | **事务 + 回滚机制 + 人工审批** |
| 修改全局配置（`~/.zshrc` 等） | 高 | **必须确认 + 提供回滚命令** |
| 推送代码（`git push`） | 中 | **确认 + PR 链接** |
| 写新文件 | 低 | 可自动 |
| 读文件 | 低 | 可自动 |

> **核心原则**：Agent 不应在未经明确确认的情况下执行任何影响范围超出当前任务的操作。系统判断某些包可能是残留，也应该先询问用户确认。

## 相关实体

- [撕开Claude Code真相：1.6% vs 98.4%](ch03/073-claude-code.md)（同 VILA 论文来源）
- [Claude Code Dynamic Workflows Thariq Blog Gaia](ch04/150-ai.md)（Anthropic Dynamic Workflow 同主题）
- [Codex Goal Agent Runtime](ch09/041-codex-goal.md)（Codex goal agent runtime 对照）
- [Codex Context Engineering Lastwhisper Thinking In Context](ch01/434-codex.md)（Codex 上下文工程对照）
- [State Of Memory In Agent Harness Mem0 2026](ch04/503-agent.md)（mem0 Agent 记忆体系对照）
- [Openai Skills Shell Compaction Agent Primitives](ch04/245-skill.md)（OpenAI Skills + Compaction 同源）
- [Claude Code Source Leak Lifecycle Analysis](ch03/073-claude-code.md)（Claude Code 源码生命周期分析）
- [Snowflake Agentic Enterprise Summit 2026](ch04/503-agent.md)（Snowflake — 企业级 AI 可审计性同主线）
- [Agent Reliability Engineering Skillify Continuous Improvement](ch04/245-skill.md)（Agent Reliability Engineering 持续改进对照）
- [Claude Code Tool Design Evolution Anthropic](ch03/073-claude-code.md)（Claude Code 工具设计演进）
- [Hermes Agent Self Evolving](ch04/503-agent.md)（Hermes Agent 自演进对照）
- [Spec As Aios Anti Entropy Architecture Gaode Ai Native Series 2](ch04/150-ai.md)（Spec-as-AIOS — 可审查性同主线）

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/mimo-code-xiaomi-coding-harness-2026.md)

---

