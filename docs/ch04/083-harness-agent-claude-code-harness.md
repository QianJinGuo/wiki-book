# Harness 工程搭建式业务 Agent 评测方案：Claude Code 作 Harness 搭建者

## Ch04.083 Harness 工程搭建式业务 Agent 评测方案：Claude Code 作 Harness 搭建者

> 📊 Level ⭐⭐ | 17.5KB | `entities/harness-engineered-business-agent-evaluation-aliyun-boyu.md`

# Harness 工程搭建式业务 Agent 评测方案：Claude Code 作 Harness 搭建者

> 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/harness-engineered-business-agent-evaluation-aliyun-boyu.md)

阿里云泊予（2026-06-05）基于 6 个业务 Agent 评测实战，提出"用强 Agent 搭建评测 Harness"的工程范式：将评测逻辑从 Python 脚本（test_runner.py / report_generator.py）升级为 Agent 提示词（评测 Agent System Prompt）+ 三层指标框架 + system.question 数据列规范，单 Agent 评测全流程从 ~1.5 周压缩到 ~1-2 天。

## 核心洞察

- **范式转变**：传统评测是"人写评测代码 → 跑脚本 → 人看结果 → 人改代码"（周级启动，天级迭代）；Harness 式是"CC 搭建 Harness → 平台跑批 → CC 分析 → CC 调整 Harness"（天级启动，小时级迭代）。 
- **关键洞察**：评测 Harness 的本质是一套结构化的评估规则 + 执行流程。传统做法把它编码为 Python 脚本，而我们把它编码为 Agent 提示词——更灵活、更可读、更易迭代。 
- **核心矛盾**：业务 Agent 迭代快（天级），传统评测工程搭建慢（周级）。 

## 三层指标框架（L1 / L2 / L3）

经过 6 个 Agent 实战沉淀的通用框架：

| 层级 | 名称 | 内容 | 适用 |
|------|------|------|------|
| L1 | 通用基础指标 | 输出格式合规率（JSON 可解析）、字段完整率 | 所有 Agent 必报 |
| L2 | 按能力类型选用 | 分类判断（分类准确率）/ 二元决策（Recall/Precision）/ 数值提取（精确匹配率）/ 连续评分（MAE + 分档一致率）/ 文本生成（LLM-as-Judge 1-5 分） | 从菜单按需勾选 |
| L3 | Agent 专属指标 | 文案生成（违禁词清洁率、关键信息保留率）；风格匹配（不适用风格过滤合规率）等 | 按需自定义 |

**新 Agent 接入流程**：确定能力类型 → 从 L2 菜单勾选 → 追加 L3 专属 → 设目标阈值。

## Harness 五步搭建法

1. **规则层（CC 角色：方案架构师）**：输入被测 Agent 的 prompt + 业务上下文 → CC 输出评测方案文档（维度、指标、阈值、边界用例）。**10 分钟交互**完成一份方案。
2. **数据层（CC 角色：数据工程师）**：编写脚本拉取业务数据 → 格式化为 JSON → CC 辅助 GT 标注（人复核）→ 打包 Excel。**关键设计：system.question 列**——每行 JSON 包含被测 Agent 全部输入字段 + ground_truth，评测 Agent 读取这一列即可获得输入和预期输出。
3. **执行逻辑层（CC 角色：Harness 工程师）**：**整套方案最核心的创新**——把 test_runner.py 替换为评测 Agent 提示词。结构模板：角色定义 + 工具声明 + 约束 + 工作流（7 步：解析输入 → 调用被测 Agent → 解析输出 → 硬规则自动检查 → LLM-as-Judge 打分 → 错误归因 → 输出 JSON）+ 输出 Schema。
4. **输出层（CC 角色：数据分析师）**：CC 读取跑批 Excel 输出报告，增值在于：自动归因（"18 条误过滤中 12 条都是把某评分维度<60 当过滤条件"）、跨批次对比、给出可操作建议（"建议在 prompt 第三段加入明确的过滤条件边界"）。
5. **可迭代层**：评测 Agent 自身也需要版本管理（v1 调试模式 → v2 跑批模式 → v3+ 持续调优），评测系统 bug ≠ 被测 Agent bug。

## 与传统评测工程的对照

| 传统评测工程 | Harness 式评测 | 变化 |
|--------------|----------------|------|
| test_config.yaml | 评测方案 .md | 规则从配置文件变为自然语言文档 |
| test_data.json | 评测集 Excel（system.question） | 数据格式统一，人可直接看懂 |
| test_runner.py（数百行） | 评测 Agent 提示词（数千字） | 执行逻辑从代码变为 Prompt |
| conftest.py + fixtures | GT 标注 + ground_truth 字段 | 预期结果内嵌在数据中 |
| report_generator.py | CC 实时分析 | 报告生成从脚本变为交互 |
| requirements.txt + CI | 评测平台一键跑批 | 零部署成本 |

## 加速比（6 个 Agent 实战数据）

| 阶段 | 传统 | CC 协助 | 加速 |
|------|------|---------|------|
| 评测方案设计 | 1-2 天 | 10-30 分钟 | ~10x |
| 评测集构建 | 2-3 天 | 半天（含人工标注） | ~5x |
| 评测脚本/Agent 开发 | 2-3 天 | 1-2 小时 | ~10x |
| 跑批执行 | 同 | 同 | 1x |
| 结果分析 + 报告 | 半天-1 天 | 10-20 分钟 | ~5x |
| **单 Agent 全流程** | **~1.5 周** | **~1-2 天** | **~5x** |

## 评测 Agent 调被测 Agent 的 4 个常见踩坑

| 坑 | 解法 |
|----|------|
| 评测 Agent 忘记调用工具 | 在 Constraints 中强调"必须先调用工具" |
| 工具参数传递失败 | 在提示词中显式写明参数构造逻辑 |
| 评测 Agent 重试耗尽 token | 添加"禁止重试"约束 |
| 输出截断 | 减少推导过程，只输出最终 JSON |

**执行链**：评测平台 → 调用评测 Agent（一个 LLM 实例）→ 评测 Agent 通过工具调用被测 Agent（另一个 LLM 实例）→ 获得原始输出 → 多维度评分 → 返回结构化 JSON。

## 评测集设计四原则

| 原则 | 说明 | 反例 |
|------|------|------|
| 小而精 | 20-55 条足够，覆盖所有边界场景 | 200+ 条但都是简单 case |
| 分布均衡 | 正/负例比例合理，边界场景必须有 | 全是正例，评不出问题 |
| GT 可复核 | 每条 GT 标注有据可查 | GT 靠感觉打分 |
| 版本化管理 | 评测集跟随被测 prompt 版本变更 | 用 v1 评测集评 v3 prompt |

## LLM-as-Judge Rubric 设计心得

对文本生成类 Agent 嵌入 1-5 分 rubric：

```
5 分：改写自然，传达原文单一核心意图，一次读完即懂
4 分：基本达标，有轻微瑕疵但整体可读
3 分：勉强可接受，但存在轻度问题
2 分：明显问题：信息压缩过度或照抄原文
1 分：严重错误：与输入无关或完全无法理解
```

**注意事项**：每个分值必须有具体、可区分的判定标准；避免"好/较好/一般"这类主观描述。

## 可复用资产（沉淀模板）

| 资产 | 说明 | 复用方式 |
|------|------|----------|
| 三层指标框架模板 | L1/L2/L3 | 新 Agent 对照选用 |
| 评测方案文档模板 | 目标+维度+数据集+流程+错误分类 | 填空式生成 |
| 评测 Agent 提示词模板 | 角色+工具+约束+工作流+输出 schema | 替换业务逻辑即可 |
| 评测集 Excel 格式 | system.question 列规范 | 标准化接入评测平台 |
| 评测报告模板 | 执行情况+指标汇总+问题分析+建议 | CC 自动填充 |
| 错误分类体系 | FORMAT_ERROR/WRONG_CHOICE/... | 按需扩展 |
| Agent 平台调用经验 | 接口格式/参数/踩坑记录 | 减少试错 |

## 适用场景与局限

**高适合度（⭐⭐⭐⭐⭐）**：Prompt 迭代验证、多 Agent 横向对比
**中适合度（⭐⭐⭐⭐）**：新 Agent 上线前验收
**低适合度（⭐⭐⭐）**：线上问题复盘

**局限**：LLM-as-Judge 本身有偏差（对关键决策用人工抽检兜底）；评测集规模受限（人工 GT）；依赖评测平台稳定性（token 截断、API 超时需容错）；首次搭建有学习成本（第二个 Agent 起复用率很高）。

## 深度分析

### 1. 范式转变：从"评测代码"到"评测即 Prompt"

传统评测工程将评测逻辑编码为 Python 脚本（test_runner.py / report_generator.py），本质上是一套固化、编译执行的规则体系。Harness 式评测将评测逻辑本身编码为自然语言提示词，由一个 LLM 实例（评测 Agent）读取并执行。这一转变的深远意义在于：**评测逻辑从"代码态"升级为"文本态"，带来了迭代粒度的根本变化**——改一行 prompt 等价于改一段代码并重新部署，但无需经历编译、CI、上线的完整流程。

### 2. 三层指标框架的通用性：L1/L2/L3 是一个可组合菜单

经过 6 个不同类型 Agent（内容审核、文案生成、风格匹配、图片理解等）的实战沉淀，L1/L2/L3 框架被验证具有跨 Agent 类型的通用性。L1 是所有 Agent 的基础约束（格式合规、字段完整）；L2 是按能力类型从"菜单"中勾选（分类/二元决策/数值提取/连续评分/文本生成）；L3 是Agent 专属的定制指标。这一设计的精髓在于：**将评测指标抽象为可插拔的组合层**，新 Agent 接入时只需确定能力类型 → 勾选 L2 → 追加 L3，而非从零设计整套指标体系。

### 3. 五步搭建法的结构化复用价值

规则层（方案架构师）→ 数据层（数据工程师）→ 执行逻辑层（Harness 工程师）→ 输出层（数据分析师）→ 可迭代层，这五步不是线性流程，而是一套**模块化职责边界**。每一步都有明确的输入、输出和 CC 角色对应，且各步骤的产出物（评测方案 .md、评测集 Excel、评测 Agent 提示词、评测报告）均为独立可复用的文本资产。这使得第二个 Agent 的评测搭建变成"替换业务内容"而非"重新设计框架"，解释了为什么"首次搭建有学习成本，但第二个 Agent 起复用率很高"。

### 4. 核心矛盾的精确描述：业务 Agent 迭代速度 vs. 评测工程搭建成本

文章最核心的问题定义是"业务 Agent 迭代快（天级），传统评测工程搭建慢（周级）"。这个矛盾的本质不是"速度差异"，而是**两种工程模式的节奏失配**：传统评测是"人写代码"的工程模式，天然带有编译-部署-验证的长周期；Harness 式评测引入了一个中间层（CC 搭建 Harness + 平台跑批），将人从脚本编写中解放出来，变为规则设计者和决策者，从而将评测工程的节奏从"人写代码的周级"压缩到"人审方案的天级"。

### 5. 评测 Agent 自身的版本化管理：被忽视的关键细节

方案中一个容易被忽略但至关重要的设计细节是：**评测 Agent 本身也需要版本管理（v1 调试模式 → v2 跑批模式 → v3+ 持续调优）**。这一点揭示了一个深层洞察——当"评测逻辑"变成"Prompt"后，评测系统本身也会像被测系统一样出现 bug（匹配逻辑过严、GT 覆盖缺口、Token 截断），也需要调试、迭代和版本追踪。这意味着企业引入 Harness 式评测后，需要同时维护两套 Agent 的版本：被测 Agent 版本 + 评测 Agent 版本。

## 实践启示

### 1. 按五步法结构化推进，不要跳步或混合职责

评测方案设计（规则层）和评测集构建（数据层）是后续执行逻辑层的基础——顺序不能颠倒。建议在实际项目中严格按照"规则层（10-30 分钟 CC 交互）→ 数据层（半天含标注）→ 执行逻辑层（1-2 小时）→ 跑批 + 出报告"的节奏推进。每一步都有明确的可验收产出物：评测方案文档、含 system.question 列的 Excel、完整的评测 Agent 提示词。跳步会导致返工成本远高于按顺序执行。

### 2. 新 Agent 接入从 L1+L2 菜单开始，L3 按需追加

不要试图在第一次评测时就设计完整的 L3 专属指标。正确流程是：先确定 Agent 涉及的能力类型（分类/二元决策/数值提取/连续评分/文本生成），从 L2 菜单勾选对应指标跑通全流程，再根据实际评测中发现的 Agent 特有问题追加 L3 指标。这样可以避免过早陷入细节，确保基础指标（L1+L2）已经稳定可用。

### 3. 利用 Claude Code 的深度理解能力做方案设计，而非仅做代码生成

方案设计中 Claude Code 的核心价值不只是生成文档，而是**分析被测 Agent 的 prompt 逻辑后主动提出应覆盖的边界场景**。实际对话中 CC 会主动识别 prompt 中的过滤条件边界并建议相应评测维度。这是区别于普通代码生成的关键能力：利用 CC 的推理能力做"方案共创"而非"指令执行"。

### 4. system.question 列是评测集设计的核心规范，必须严格执行

每行 JSON 数据中的 system.question 列必须包含：被测 Agent 所需的全部输入字段 + ground_truth 标注。评测 Agent 读取这一列即可获得完整的输入输出对，无需额外配置。这个设计是整个执行逻辑层成立的前提条件——如果数据格式不统一，评测 Agent 提示词就无法做到"替换业务逻辑即可"的复用效果。

### 5. 评测 Agent 自身需要独立的调试-验证-上线周期

在正式跑批前，用 2-3 条数据对评测 Agent 做人工核对（调试模式带推导过程），确认评测逻辑与预期一致后再切换为跑批模式（纯 JSON 输出）。评测 Agent 的 bug ≠ 被测 Agent 的 bug，需要分别定位和修复。这个"评测系统也需要 QA"的心态是 Harness 式评测成熟团队的标志。

## 与现有评测体系实体差异化

**本实体关注"工程实施"：具体的 prompt 模板、数据列规范、5 步搭建法、6 个 Agent 实战数据**（1.5 周 → 1-2 天 5x 加速比）。

- [Harness Engineering实践做了一个平台让Ai一晚上自动评测和优化你的系统](../ch01-364-harness-engineering实践做了一个平台让ai一晚上自动评测和优化你的系统/) — 关注"AI 全自动做评测 + 系统级自动优化循环"（产品/平台视角，AI 自主从入口到分析）。本实体是"评测方案设计"的方法论层，那个是"评测平台产品"的实现层；两者形成"方法论 ↔ 平台实现"互补。
- [Ai Evals Methodology](../ch01-187-ai-evals-评估方法论/) — Langfuse 出品的通用 AI Evals 三种方法（人工 / 自动 / LLM-as-Judge）。本实体是"业务 Agent 评测"的具体工程方案；那个是评估方法论的科普。
- [Agent Eval Wallezhang Yaml Driven Agent Evaluation Framework](../ch04-141-agenteval-yaml驱动的agent评测框架/) — Go 语言 YAML 驱动的 AgentEval 框架（pass@k + pass^k + SQLite + CI/CD）。本实体是"Prompt 即评测逻辑"路线（评测逻辑编码为自然语言）；那个是"YAML 配置驱动"路线（评测逻辑仍是代码）。两条互补路径。
- [Cursor Harness Model Production Floor](../ch01-235-cursor-harness-model-production-floor/) — Cursor 复盘"模型 + Harness 组合发布" + 三层评估（离线/线上/代理）。本实体是"Harness 评测自身"的方法论；那个是"被评测的 Harness"如何运营。
- [Better Harness Eval Trace Harness Hill Climbing](../ch05-058-从-autoresearch-到-better-harness-自动优化真正难在评价信号/) — Trace-driven 评测 + Harness hill-climbing 自优化循环。本实体是"评测方案设计"的人工智能辅助；那个是"评测驱动的 Harness 优化"反馈环。

## 相关实体
- Claude Code Best Practices Prompt Engineering

- [perplexity computer empirical study: how ai agents reshape k](../ch04-085-perplexity-computer-empirical-study-how-ai-agents-reshape-k/)

- MOC
## 相关主题

- Ahe Agentic Harness Engineering — AHE 通用 Harness 工程框架
- [Claude Code Architecture](../ch01-571-claude-code-架构解析/) — Claude Code 架构（作为 Harness 搭建者的能力来源）
- LLM-as-Judge 通用方法
- [Ai Coding Agent Quality Defense Five Control Mechanisms](../ch09-016-ai-编程智能体的质量防线-5-个代码质量控制机制-反馈传感器-语义评估-重构边界-来源追溯-智能体攻击/) — AI Coding Agent 质量防御五机制（评测即其中一环）

---

