---
title: "AI 驱动研发体系的实践和思考 — Price360-KB 项目 Harness"
source_url: "https://mp.weixin.qq.com/s/OSYCiNajJw6c5-hGFSAfYw"
ingested: "2026-09-02"
sha256: "1ba33f88300ce882f9e754b03f985a5ab2b69445b3790b87c76d76472c3023d3"
author: "默达"
account: "大淘宝技术"
team: "淘天集团-营销&交易技术"
tags: [project-harness, ai-driven-rdd, llm-wiki, context-engineering, knowledge-management, karpathy, fde, taobao]
---

# AI 驱动研发体系的实践和思考 — Price360-KB 项目 Harness

> **来源**：大淘宝技术（默达，营销&交易技术团队，原创）
> **时间**：2026-09-02
> **灵感**：Karpathy LLM Wiki 思路
> **实践**：Price360-KB（价格力业务内部实践）

## 核心公式

三个层次的演进：
1. **AI 辅助编程**：人在提示词输入框中告诉 AI 怎么修改，业务规则每次重输
2. **Coding Agent**：`Agent = Model + Harness`，模型之外都是 Harness
3. **项目 Harness**：`业务研发Agent = Model + Coding Agent通用Harness + 项目Harness`

## 核心洞察

### 真正的瓶颈是上下文
模型决定通用能力，上下文决定它在具体项目中能走多远。业务 AI 研发的上限不只由模型决定——同一个问题，换一次会话、换一个人或换一个 Agent，结果可能完全不同。

### 本地优先：Agent + 文件夹 + Git 🌟
尽可能将项目需要的所有信息放进同一个文件夹，用 Git 管理。Coding Agent 天然操作文件系统，Git 补上版本、分支、评审、来源和回滚。稳定上下文进入 Git，动态事实（Aone/测试环境/日志/数据库）留在权威系统通过 MCP/CLI 提供。

### 迭代过程本身就是知识飞轮 🌟
每个阶段都在为下一个阶段生产上下文：PRD 补充业务定义→技术方案记录链路→开发和测试校验→归档时确认后的长期知识回流到 wiki 和 tech。项目开始时不需要完美知识库，知识建设可以成为真实产品迭代的副产物。

### 老系统冷启动
通过 Git submodule 关联代码仓库到 src/，文档资料关联到 raw/，设计清洗 SKILL 从代码和凌乱文档中清洗结构化知识。通过钉钉 AI 听记采访核心开发/产品，让 Coding Agent 整理到知识库。

## 知识库应该保存什么

Price360-KB 将长期知识分为 **wiki** 和 **tech**：
- **wiki**：面向产品/运营/测试和 Agent，保存业务概念、规则、口径、角色、流程和异常处理
- **tech**：保存代码无法独立表达但影响 Agent 判断的技术上下文（跨系统链路、接口关系、新旧切换、废弃状态、运行态拓扑）

**知识库不应该复制代码。它保存的是代码之外会影响业务和技术判断的信息。**

## Price360-KB 项目 Harness

不是独立研发平台，而是可被 Coding Agent 直接打开和执行的 Git 工作空间。

### 核心目录结构
```
price360-kb/
├── AGENTS.md          # 项目协作协议与总入口
├── iterations/        # 每个需求的 PRD、方案、测试与归档
├── wiki/              # 业务知识
├── tech/              # 跨系统链路与关键技术上下文
├── raw/               # 未经改写的原始事实材料
├── src/               # 关联的业务代码仓库（Git submodule）
├── olap/              # 指标、表结构与分析 SQL
├── briefs/            # 基于事实源生成的专题说明
├── outputs/           # 可重建的索引和分析结果
└── .agents/
    ├── skills/        # PRD、方案、测试、排障、归档等领域能力
    ├── scripts/       # 工作区、校验、同步和发布门禁
    ├── repositories.json
    └── skill-dependencies.json
```

### 三层结构
1. **AGENTS.md**：项目级协作协议（事实源、研发阶段、人工决策点、授权边界、完成条件）
2. **.agents/skills**：可组合的领域能力（PRD/技术方案/测试/回放/排障/知识归档）
3. **.agents/scripts**：确定性执行动作（工作区检查、产物校验、状态同步、提交推送、发布后回查）

### 知识文件 Metadata
```yaml
---
title: "价格归因领域知识"
category: "规则"
tags: ["价格", "归因"]
status: "有效"
version: "v1.1"
source:
  - "raw/existing_docs/xxx说明.md"
  - "tech/01-链路详解/xxx处理管线.md"
---
```
title/category/tags/status 让 Agent 读取全文前判断文档适用性；source 是事实来源字段；tech 文档通过 wiki_ref 关联业务知识。

## 机器可读迭代协议

每个需求有独立迭代目录（prd.md/solution.md/test/design.md/test/cases*.md/test/report.md/archive.md）。状态、版本、依赖和证据字段采用固定格式，Agent 可检查"某个验收标准是否有方案承接、是否有测试覆盖"。

阶段不自动越过：PRD 未确认不写方案，方案和测试未确认不进入代码，没有真实测试证据不进入发布。上游变化时下游必须更新。

## 人负责决策，Agent 负责执行完整

Agent 检索上下文、生成产物、执行检查、调用工具、收集证据；人描述需求、选择方案、确认测试设计、验收预发结果、授权合并和发布。高风险动作不会因概括性同意就自动执行。

## 结语：当 Harness 不断收缩

Model 和通用 Coding Agent 的 Harness 能力在扩大，项目 Harness 会收缩。但不会消失的：业务知识及其事实治理、项目规则与决策边界、领域工具和系统适配、验证标准和质量责任。

技术人员角色将更接近 **FDE（Forward Deployed Engineer）**：深入业务现场，把问题、知识、系统和交付结果连接起来。
