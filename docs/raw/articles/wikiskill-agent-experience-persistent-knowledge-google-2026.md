---
title: "谷歌 WikiSkill：将 Agent 经验编译为持久知识以驱动技能进化"
source_url: "https://mp.weixin.qq.com/s/fXdxOo0ghm6-B9VNUdr23Q"
author: "Hyman的杂货铺"
publisher: "Hyman的杂货铺"
published: 2026-08-29
ingested: 2026-08-29
language: zh
type: raw-article
sha256: "b538f017285d17dddb88523cfb6e87dd03bb17c6f1e5e02c3cd2a4e0b72c8264"
---

# 超越SkillOpt！谷歌发布 WikiSkill：技能进化配上持久知识库，9B 反超 27B模型

> 论文标题：WikiSkill: Compiling Agent Experience into Persistent Knowledge for Skill Evolution（Google Research，arXiv 2608.27454）

## 一句话

Google Research 发布的 WikiSkill，把 Agent 的执行经验整理成持续累积的持久知识库（wiki），再让技能进化建立在这份知识之上；在 5 个基准、5 个模型上平均分全面领先现有方法，9B 小模型带技能可反超 27B 大模型无技能。

## 背景：技能自动进化的痛点

现在给大模型配的 Agent 已能完成不少真实任务，但有一类能力很难靠参数训练获得：某个领域里「具体怎么做」的操作经验（按规则改电子表格、在长文档里找证据、按步骤整理物品）。这类知识更新快又依赖环境，写进模型参数不划算，于是业界做成 skill（技能）：一个文件夹装说明文档、脚本、适用条件，Agent 干活时读它。技能轻量、可审计、可复用，能在不改模型参数的情况下积累知识。

技能的问题在于怎么写。手工编写成本高；近两年出现自动技能进化（EvoSkill、Trace2Skill、SkillOpt），但每轮把分析结论散落在各自优化记录里，没有形成一份独立的、持续演进的知识表示，下一轮改技能时很难系统地站到以前学过的内容之上。

## WikiSkill 三层架构

WikiSkill 把 Agent 的工作区分成三层：

1. **原始轨迹层**：存放每轮训练采样得到的完整执行轨迹（推理过程、工具调用、最终答案）。只写不改，保留原始历史。
2. **持久知识层（wiki）**：把原始轨迹整理成结构化、可累积的知识。含 pattern（模式）目录（每份 markdown 记录一种失败模式或成功策略及应对办法）、logs.md（每轮发现）、skill-impact.md（每个提案的 diff、验证分数、接受/拒绝结果）。
3. **可执行技能层**：当前生效的技能。每技能目录含 SKILL.md（技能全文）和 PURPOSE.md（由哪些 wiki 模式催生、经历过什么演化）。

关键设计：技能更新可回滚，但 wiki 永不重置，跨轮累积，让后续提案能看到完整历史（被拒方案、反复错误、真正提升验证分数的修改）。这份审计轨迹正是 EvoSkill/Trace2Skill/SkillOpt 缺失的部分。

## 每轮循环：四个组件

1. **执行 Agent**：用当前技能在训练集上跑任务，产出不可变轨迹（被禁止读 wiki）。
2. **知识库维护 Agent**：每轮从训练轨迹采样最多 8 条（≤5 失败做根因分析、3 成功提炼策略，单条日志截断 15000 字符），对照现有 wiki 新增/更新 pattern、修订索引、追加演化日志。
3. **技能提案 Agent**：以 ReAct 方式自主行动，先读 wiki 索引、技能影响追踪、训练结果摘要，按需读 pattern 页和原始轨迹，给出聚焦提案（新建技能或对现有技能打补丁式小改动）。
4. **验证门控与回滚**：候选技能在验证集跑，只有分数严格超过历史最优才接受；否则回滚。外层 harness 把提案元数据、diff、验证分数、接受结果自动写入 skill-impact.md。

被拒修改只在技能层回滚，wiki 层保留全部记录，下一轮不重复踩坑。

## 案例：ALFWorld 循环修复

用 Qwen-3.6-27B 演示：第 0 轮维护 Agent 发现基础循环行为（拿起-检查-放回-重复），提案 Agent 提出 goal-directed-action 技能，验证无提升被拒，但 skill-impact.md 保留 diff 与拒绝结论；第 1 轮提案 Agent 参考拒绝历史创建更具体的 break-repetition-loop 技能（「不要把物品放回原位」）被接受；第 2-3 轮无新技能被接受但 wiki 持续补充证据（multi-operation-loop 模式累积新循环变体），第 4 轮据此给技能加第二条规则「每种操作对每个物品只做一次」。

## 主结果：提升随模型规模增大，小模型可反超

5 基准：LiveMath（数学竞赛推理）、SealQA（网络检索问答）、SpreadSheet（表格操作）、OfficeQA（长文档问答）、ALFWorld（交互式家庭任务）。推理模型：Qwen-3.5-4B / Qwen-3.5-9B / Qwen-3.6-27B / Gemma-4-31B / Gemini-3.5-Flash。所有方法从空技能集出发，技能写进 system prompt，报告三次独立完整演化的测试平均分，配对自助法做显著性检验。

- WikiSkill 全面领先：与每个模型的最强对比方法相比平均分高 3.3 / 5.1 / 10.0 / 5.8 / 12.0 个百分点（对应 Qwen-4B/9B/27B、Gemma-31B、Gemini-Flash）。Gemini-Flash 在 LiveMath 从 33.0%→72.6%，SpreadSheet 从 50.5%→76.6%；Qwen-27B 在 ALFWorld 从 52.8%→77.6%。
- 对比方法不稳定：EvoSkill 在 LiveMath 把 Qwen-9B 从 28.2%→58.1%，同基准 Gemma-31B 反被从 33.9% 拖到 29.8%；SkillOpt 在 SealQA 把 Gemini-Flash 从 29.4% 掉到 28.2%。WikiSkill 既强又稳。
- 技能进化与模型规模互补：Qwen 家族平均提升从 4B 的 +12.3 涨到 27B 的 +23.9；SpreadSheet 上 27B 比 4B 多赚约 34 个百分点（+40.9 vs +6.5）。Qwen-3.5-9B 配 WikiSkill 平均 47.4% 超过 Qwen-3.6-27B 无技能 39.4%；Qwen-3.5-4B 配技能也有 38.5%。
- 不同基准受益不同：LiveMath 全部 5 模型受益（+20.6 到 +39.6 个百分点）；ALFWorld 除提前停止的 Gemini-Flash 外 14.0-29.3 提升；OfficeQA 例外——大模型能执行多步检索流程（27B +11.6、Gemini-Flash +12.1），而 Qwen-4B 在长上下文丢失多步指令、退回默认阅读行为反而略降。

## 跨模型迁移：别人炼的技能可能比自炼更好

- 迁移经常有效甚至反超自炼：Qwen-27B 炼的技能把 Qwen-9B 在 SpreadSheet 带到 50.5%（无技能 24.3%、自炼 33.6%）；同技能把 Gemma-31B 在 LiveMath 带到 73.7%（无技能 33.9%、自炼 56.7%）；Qwen-9B 用 Qwen-27B 技能在 ALFWorld 拿 70.2% 高于自炼 63.4%。
- 负迁移真实存在：Qwen-4B 技能把 Gemini-Flash 在 SpreadSheet 从 50.5% 打到 18.1%。原因：①4B 技能编码低层绕行技巧（单行 Python 命令、字符串转换规则），束缚强模型写完整端到端脚本；②碎片化诊断流程带来冗余工具调用，用光 Gemini-Flash 工具调用次数。
- OfficeQA 上 Qwen-4B 技能降低自己的成绩（30.2%→28.5%）却把 Qwen-27B 从 42.1% 提到 52.9%——技能发现（从经验提炼程序性知识）与技能执行（推理时用出来）是两种能力，跨模型实验把它们分开了。迁移好坏取决于技能捕获的是通用流程还是模型特定绕行技巧，后者是负迁移主要来源。

## 消融：持久知识库值多少分

用 Gemini-3.5-Flash 控制执行 Agent 和技能提案 Agent 能否访问 wiki：

| 配置 | 平均准确率 |
|---|---|
| 无技能基线 | 40.4% |
| 只有执行 Agent 读 wiki | 45.3% |
| 两边都不读（无知识累积） | 48.7% |
| 两边都读 wiki | 60.9% |
| 默认：只有提案 Agent 读 wiki | 63.7% |