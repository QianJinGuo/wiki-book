---
title: "Agent skill 迭代式编写实战 — 淘天集团物流技术团队（其林）"
source_url: "https://mp.weixin.qq.com/s/59Z2eVOg914_bpRD6-WsYg"
mp: "淘天集团-物流技术团队"
pub_date: "2026-06-12"
ingested: "2026-06-12"
sha256: "544998761b218aaefc8ae1afbddadb5d79399c3a635c72339d38ef2ca04402b0"
type: source
tags: ["agent-skill", "skill-authoring", "decision-tree", "progressive-disclosure", "eval", "self-review", "taobao-logistics"]
---

# Agent skill 迭代式编写实战

## 核心定位

Agent Skill 是**模块化的能力包**，沉淀了领域知识的资产 bundle，资产包括自然语言指令、元数据和可选资源（脚本、模板），让 AI Agent 在需要时自动加载和使用。

**MCP 为 agent 提供"手"来操作工具，Skill 是"操作手册"**——教 agent 怎么用这些工具。

**Skill 通俗理解**：给 agent 准备的业务 SOP 大礼包，涵盖执行流程、背景知识、工具使用说明、模板素材、常见问题处理方式。

## 时间线

- 2025-10 中旬：Anthropic 正式发布 Claude Skills
- 2 个月后：Agent Skills 作为开放标准发布
- 后续：Cursor、OpenCode、Qoder 等主流工具陆续跟进

## Skill 的形态（文件结构）

```
skill-name/
├── SKILL.md              # 核心：YAML frontmatter + Markdown 正文
├── references/           # 补充文档（模板/规范/示例）
├── scripts/              # 确定性操作脚本（Python/Bash）
└── ...
```

**SKILL.md = YAML frontmatter（agent 判断是否触发的元数据）+ Markdown 正文（执行 SOP，建议「总-分」结构）**

**YAML description 是关键**，通常写明适用场景和关键触发词。references/ 放补充文档，**不要把大量内容堆进主文件**。scripts/ 放确定性脚本——**能写成脚本的就不要靠 agent 推理**（脚本的稳定性和可复现性远高于让 agent 猜）。

> 扩展阅读：处理三方库依赖 → `uv run` + `pep 723`

## 适合 vs 不适合的场景

**适合场景**：
- **半自动化重复流程**：同一业务流程频繁执行，部分依赖主观判断，无法完全自动化
- **领域知识导向**：业务流程依赖专家知识，LLM 泛化能力难以覆盖
- **上下文受限**：agent 职责多样且上下文窗口有限，处理其他任务时不希望无关知识占位

**不适合场景**：
- **简单任务**：直接用基础提示词，靠 LLM 泛化能力即可
- **流程完全确定性**：写代码自动化更合适
- **agent 职责高度单一**：把 skill 内容放进 system prompt，脚本用 mcp/tools 代替

## 核心特性：三层渐进式披露（Progressive Disclosure）

把技能信息拆成三层：

| 层 | 内容 | 加载成本 |
|----|------|----------|
| **第一层** | 目录/概要（让 agent 知道"有哪些手册"） | 最低 |
| **第二层** | 详细指令（按需加载具体章节） | 中 |
| **第三层** | 完整资源（详细步骤 + 工具脚本） | 最高 |

**设计原则**：哪些内容必须放 SKILL.md，哪些可以下沉到 reference。

## 配套元 skill 工具

- **skill-creator** (https://skills.sh/anthropics/skills/skill-creator) — 用于生成 skill
- **skill-judge** (https://skills.sh/softaworks/agent-toolkit/skill-judge) — 用于评估 skill

## 迭代式开发六大实践

### 1. 用决策树替代模糊判断

**决策树是正向约束**，让 agent 在需要做判断时行为可控。

异步消息问题排查片段示例：

```
### 结果处理规则
**补全未发出消息：**
  若有序事件的前序有日志、后序无日志，在报告表格中补充后序事件行，tag以外字段留空，备注标记为"消息未发出"。

**消费失败处理：**
  判断某 tag 是否失败，标准为 `resultFlag = N` 且该 tag 后续无 `resultFlag = Y` 的记录。
  - 若后续有 Y（重试成功）→ 取第一条失败行，调用错误详情查询
  - 若后续无 Y（持续失败）→ 取每一条失败行，调用错误详情查询

**错误详情查询（消费失败）：**
  [详细子流程]
```

**skill-judge 把决策树列为高质量 skill 的明确标志**，在 D1（知识增量）和 D8（实用性）两个维度都是加分项：

- **Green flags (high knowledge delta)**: Decision trees for non-obvious choices ("when X fails, try Y because Z")
- **D8 Usability**: For multi-path scenarios, is there clear guidance on which path to take?

**原因**：skill 的核心价值是封装专家才有的判断知识。**决策树把"应该怎么判断"写清楚，而不是用模糊语言把判断压力甩给 agent**。agent 不需要推理，顺着树走就行。**写 skill 时遇到分支判断，优先用树形结构，而不是让 agent 自行决策**。

### 2. 负向约束要配替代方案

告诉 agent 不能做什么（bad case/anti-pattern）时，**同步给出合法替代方案**，约束力会强很多。

单元测试编写 skill 片段示例：

```
### Mocking Restrictions
**Do NOT mock:**
- `public static` fields (e.g., `@AppSwitch`-annotated configurations) - assign values directly in `@BeforeEach` and restore originals post-test
- POJO classes or OneLog objects - initialize simple POJOs programmatically; load complex POJOs from JSON files
- Stateless static methods (e.g., utility methods for conversion/assembly) - call real implementations directly
```

**核心原则**：不要只说"不能做什么"，要给"那应该怎么做"。这也是一种 few shot。**没有替代方案的话，agent 会自己找一个——结果往往不是你想要的**。

### 3. Skill 执行后自查机制

**决策树解决的是执行前的分支判断**（走哪条路），**自查机制解决的是另一半：执行完了，产出物是否合格**。

单元测试生成 skill 的执行后自查列表示例：

```
## Post-Generation Review
After generating tests, review against this specification to ensure:
- Correct test file location and naming
- Proper mock configuration without prohibited patterns
- Complete verification of return values, state mutations, and invocations
- AssertJ assertion patterns are used consistently
- No reflection-based testing or private member verification
- Similar tests are grouped into parameterized tests where appropriate
- Parameterized tests use appropriate source types and handle null values correctly
```

**关键洞察**：agent 的自然倾向是完成任务就结束，**不会主动回头检验**。很多规范性错误恰恰在"完成"之后才能发现。**把自查写进 skill，就是强制插入一个反射节点**，把"我觉得做完了"变成"我验证过做完了"。

**自查的两个角度**：
- **规范符合性**：对照约束检查，确认没做错
- **覆盖完整性**：对照领域知识检查，确认没遗漏

**决策树是收敛的**（从多条路中选一条），**自查清单是发散的**（从一个结果出发，在多个维度验证）。有明确输出规范的 skill（代码生成、迁移、测试等），skill 成熟后建议补上自查机制。

### 4. Skill 的外部验证：eval 机制

**自查是 skill 执行时的内部静态验证**（由 agent 对照清单自检）。skill-creator 还提供**外部动态验证**：用真实输入跑 skill，对比有无 skill 的输出差距，而不是靠感觉判断好坏。

**eval 四个环节**：

| 环节 | 关键点 |
|------|--------|
| **测试用例** | 设计 2-3 个真实用户会说的提示词；同一提示词分别跑"有 skill"和"无 skill（或旧版本）"，保留两份输出用于对比；**提示词要有足够复杂度和具体背景**（skill 触发依赖 agent 对 description 的语义识别，简单 prompt 可能根本不会触发 skill） |
| **断言** | 有客观标准的 skill 设计可验证检查项（如"输出文件是否包含字段 X"），主观类 skill 基于人工反馈 |
| **迭代循环** | 评估 → 修改 → 重跑 → 再评估，每轮聚焦有明确问题的用例，直到没有明显差距；**注意：每轮只看少数用例，容易把 skill 改成只对这几个 case 有效**。改的时候要从具体反馈里抽出通用规律，而不是针对测试用例做针对性修补 |
| **description 触发率优化** | skill 内容稳定后单独优化 description，用 should-trigger / should-not-trigger 样本测试召回精度，重点关注"近似场景误触发"和"该触发却未触发"两类边界 |

**内部自查是运行时护栏，外部 eval 是开发期的标准线，定位不同，都有用**。

### 5. 多人协作 skill 管理

skills.sh 提供了配套的 skill 管理工具。多人协作时，可在 code 平台上建一个仓库，根目录放 skills 目录，下面存放各个 skill。需要时运行命令交互式安装。

### 6. 扩展视角：Skill 是简化版的专用 Agent

熟悉 ReAct / LangGraph 等框架的话，可用映射表建立认知：

| LangGraph | Skill |
|-----------|-------|
| 条件边（由调度器执行） | 决策树（由模型阅读并模拟） |
| 代码控制流 | 自然语言编码的推理路径 |

**差异决定了二者的适用边界**。

**Skill 体系的本质**：用**文件系统结构 + 文本决策树**，替代运行时服务（向量库、图引擎、路由服务），**以零基础设施依赖换取极简部署**。确定性不如专用 agent，但对大多数专业流程场景够用。

**Web 概念类比**：
- 基于 LangChain 等框架开发 ≈ IaaS/SaaS（自建 workflow、管理上下文、实现 tools、接入 mcp）
- Skill ≈ **FaaS**（agent 工具作为基座已经提供 skill 发现与加载、基于 bash 的文本操作、脚本执行能力，skill 专注业务流程抽象）

**翻译路径**：需要更高准确性/SLA 时，可把 skill "翻译"为专用 agent——用 mcp/tools 替代脚本，用流程编排替代决策树，用 observation 节点替代自查。

**FaaS 不适合长连接、高频低延迟或复杂有状态事务**。**对流程确定性要求 100% 或逻辑复杂到 context 爆炸的场景，skill 也撑不住**，要回到 LangGraph 定制专用 agent。

## 总结：三点核心

1. **明确定位**：Skill 本质是轻量级的领域知识封装，适用于半自动化、专家经验导向的场景，**而非替代专用 Agent 框架**
2. **遵循设计原则**：采用三层渐进式加载架构，用决策树替代模糊判断，负向约束配合替代方案，建立内部自查与外部 eval 的双重验证机制
3. **迭代式开发**：借助 skill-creator 和 skill-judge 等工具，通过"生成 → 评估 → 修订"的快速循环提升 Skill 质量

## 团队背景

本文作者其林，来自**淘天集团-物流技术团队**。本团队深耕于物流的数字化协同与运营领域，为淘天业务提供多样的物流经营管理方案及工具，为商家提供高效低成本的物流解决方案，为消费者提供便捷靠谱的物流体验。

## 配套链接

- skill-creator: https://skills.sh/anthropics/skills/skill-creator
- skill-judge: https://skills.sh/softaworks/agent-toolkit/skill-judge
