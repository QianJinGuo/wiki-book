---
title: "第 9 章 状态与记忆：让系统不遗忘"
---

# 第 9 章 状态与记忆：让系统不遗忘

!!! abstract "学习目标"
    - 理解记忆的第一性原理：模型无状态，所以记忆必须在磁盘上，不在上下文里；
    - 掌握 Anthropic 长程任务的经典模式：功能清单 + 进度文件 + 启动序列 + 检查点；
    - 会做记忆治理：写什么、记多少、何时衰减——记忆是治理问题，不是容量问题；
    - 了解两条技术路线的分野：Harness 层外部制品 vs 模型层状态持续。

## 9.1 第一性原理：仓库不遗忘，模型遗忘

LLM 是无状态的：每个新会话从零开始，上下文窗口之外的一切都不存在。因此状态记忆的设计原则只有一条（`topics/agent-harness-deep-dive-qa`）：

> **记忆必须在磁盘上，不在上下文里。**

Samuel McDonnell 的表述更锋利："仓库不遗忘，但模型遗忘。"（`entities/loop-engineering-feedback-control-system`）。聊天记录是低质量的记忆载体——它记录了"说了什么"，却丢失了"为什么这样做"和"这样做的结果是什么"。团队真正该投资的是**过程资产**：稳定的排障路径、发布检查清单、PR 审查规范、数据迁移步骤、安全红线——把工程经验变成 Agent 可执行的流程文档。

**行业共识**：记忆不是容量问题，而是**治理问题**——决定哪些信息被允许持续影响未来决策，而非存储更多上下文（`topics/agent-memory-systems`）。

## 9.2 分层：工作集与长期记忆

`topics/agent-memory-systems` 收口的四类记忆：

| 记忆类型 | 载体 | 特点 |
|---------|------|------|
| 工作记忆 | 上下文窗口 | 短期，实时交互 |
| 程序性记忆 | Skills | 可复用的操作模式 |
| 持久记忆 | 向量库/图数据库/文件 | 跨会话积累 |
| 隐式记忆 | 模型权重 | 训练形成（不在我们手里） |

设计上真正可控的是中间两层。而"存什么"要同时建模四个对象（`concepts/agent-memory-system-design`，经 topic 页收口）：**用户模型**（偏好、决策模式）、**任务模型**（被否决的方案、已确认结论、未完成的承诺）、**世界模型**（环境约束、系统边界、数据新鲜度）、**自我模型**（试过什么、哪条路径失败、哪个工具在什么场景不稳定）。意图是这四层长期耦合后浮现的能力，不是单独存储的字段。

## 9.3 经典模式：Anthropic 的长程任务配方

Anthropic《Effective Harnesses for Long-Running Agents》给出的长程模式是本章的核心工件（`topics/agent-harness-deep-dive-qa`、`queries/harness-minimum-checklist`）：

1. **初始化 Agent** 生成 200+ 功能的 JSON 清单——全部 `passes: false`；
2. **编码 Agent** 每个会话只做一件事：读进度 → 跑测试 → 做一个功能 → 更新清单；
3. **标准启动序列**：`pwd` → 读 Git 日志和进度 → 选最高优先级未完成功能 → 起服务器 → 跑端到端测试 → 才开始新功能；
4. **JSON 优于 Markdown**：Agent 意外覆盖结构化数据的概率低得多；
5. **增量 Git 提交作为检查点**：失败可回滚，任意时刻可恢复。

```json
{
  "id": "F042",
  "name": "导出报表支持时间范围",
  "status": "in_progress",
  "passes": false,
  "notes": "依赖 F031 的日期工具函数；上次失败于时区边界"
}
```

反模式：让 Agent 一口气完成所有事——上下文耗尽，下个会话看到部分进展就提前宣布完成而不验证（One-shot Syndrome 的会话版）。

**两条路线的分野**（`topics/agent-harness-deep-dive-qa`）：Harness 层外部制品（Anthropic：进度文件、Git 历史） vs 模型层状态持续（Google Salt Signatures：模型调工具前生成加密推理状态，传回对话恢复精确推理链路）。预判是两条路线会融合——模型内生的状态持续性 + Harness 层的可审计外部记忆。在融合到来之前，外部制品是唯一可控、可审计的选择。

## 9.4 检索：三路融合与检索-推断耦合

持久记忆的读取端有两个经过验证的设计：

- **三路检索融合**：BM25 + 向量 + 图检索，用 RRF 公式融合。代码场景里文件路径、函数名、错误码、commit SHA 都是精确关键词，纯向量检索会稀释它们，BM25 正好补位（`topics/agent-memory-systems` 记录的 AgentMemory 实现）。
- **检索-推断耦合**：`retrieve(query)` 升级为 `read(task_context, belief_graph)`——根据当前任务上下文动态调整检索策略。最相关的记忆往往语义距离很远，纯相似度召回捞不到（同源）。

## 9.5 记忆治理：生命周期哲学

"存进去"只是开始，"活得健康"靠治理（`concepts/agent-memory-lifecycle-philosophies`，经 topic 页收口）：

- **写入预算**：不是值得记的就都记——记忆有维护成本，写入要配额；
- **整合与冲突处理**：新记忆与旧记忆冲突时，谁覆盖谁要有规则（时间戳？来源可信度？验证状态？）；
- **衰减**：与"claim half-life"（第 2 章）同源——过期结论自动降权或归档；
- **来源追踪与权限**：每条记忆可溯源；谁写入的、谁能读的要管住。

腾讯 AI 团队给出的工程化版本（`queries/why-agent-poc-fails-production`）：五层知识存储（个人偏好 → 团队约定 → 技术知识 → 业务知识 → 项目知识），五种知识类型打标签（model/decision/guideline/pitfall/process），三级成熟度（draft → verified → proven）配自动衰减——**保证知识库不随时间腐化**。工作流只是管道，知识才是流过管道的活水。

两个流派的哲学分歧值得了解（`topics/agent-memory-systems`）：OpenClaw 让子智能体完全没有持久记忆（"显式优于隐式"，安全但无法积累经验）；Claude Code 维护七层上下文压缩体系（保留决策相关信息，但更复杂）。没有标准答案，只有与你威胁模型的匹配度。

## 9.6 反模式

- **无状态设计**：每次对话重新开始，上次的坑这次照踩——七反模式之一。
- **上下文当存储**：进度、决策、教训全靠会话历史"记住"，窗口一满全丢。
- **记忆只写不清**：没有衰减与冲突处理的记忆库会腐化成垃圾堆——垃圾记忆比没有记忆更糟，因为它带着"经验"的可信外壳。
- **Markdown 清单当唯一事实源**：模型意外编辑自然语言清单的概率远高于 JSON；清单要结构化 + 措辞保护。

## 9.7 本章小结

- 记忆在磁盘不在窗口；聊天记录丢失"为什么"，过程资产才是复利载体。
- 四类记忆中可控的是程序性与持久记忆；存储按用户/任务/世界/自我四对象建模。
- Anthropic 长程配方 = 功能清单（JSON）+ 单功能会话 + 启动序列 + Git 检查点。
- 检索端：三路融合（BM25+向量+图）+ 检索-推断耦合。
- 记忆是治理：写入预算、冲突规则、衰减、来源与权限；知识库要防腐化。

## 9.8 练习

**动手**

1. 为你的项目实现最小记忆配方：`feature_list.json` + `progress.md` + 启动序列脚本。连续开 5 个新会话推进同一个任务，验证第 5 个会话能否无缝接上。
2. 给你的记忆库加衰减：为每条记忆标记"最后验证时间"，超过一个阈值的自动降级为"待复核"。一个月后统计被降级记忆的比例——它度量的是你知识库的腐化速度。

**思辨**

1. OpenClaw 的"零隐式记忆"与 Claude Code 的"七层压缩"是安全与积累的取舍。你的业务里哪个失败更贵——记住不该记的，还是忘了该记的？
2. "意图是四层记忆耦合后浮现的能力"——这句话如果成立，"给用户建模"的正确路径是先存偏好字段，还是先积累任务/世界/自我模型？

## 9.9 本章参考

- 库内：`topics/agent-harness-deep-dive-qa`（Anthropic 长程配方、JSON>Markdown、启动序列、Salt Signatures）；`topics/agent-memory-systems`（记忆类型、四建模对象、三路检索、OpenClaw vs Claude Code、生命周期哲学收口）；`queries/why-agent-poc-fails-production`（五层知识存储、五种类型、三级成熟度、"工作流只是管道"）；`queries/harness-minimum-checklist`（feature_list.json 模板）；`entities/loop-engineering-feedback-control-system`（外循环、"仓库不遗忘"）；`concepts/agent-memory-system-design`、`concepts/context-management-agent-systems`、`concepts/agent-memory-lifecycle-philosophies`（经 topic 页转引）。
- 公开：Anthropic《Effective Harnesses for Long-Running Agents》(2025-11)；Google Salt Signatures 技术报告（经库内笔记转引）。
