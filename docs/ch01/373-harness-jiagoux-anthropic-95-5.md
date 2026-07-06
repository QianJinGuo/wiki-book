# 数据级 Harness：架构师 JiaGouX 解读 Anthropic 95% 数据分析与 5 个反直觉边界

## Ch01.373 数据级 Harness：架构师 JiaGouX 解读 Anthropic 95% 数据分析与 5 个反直觉边界

> 📊 Level ⭐⭐ | 12.9KB | `entities/anthropic-95pct-data-analysis-jiagoux-data-level-harness-20260606.md`

# 数据级 Harness：架构师 JiaGouX 解读 Anthropic 95% 数据分析与 5 个反直觉边界

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-95pct-data-analysis-jiagoux-data-level-harness-20260606.md)

## 摘要

架构师 JiaGouX 对 Anthropic 6 月 3 日发布的《How Anthropic enables self-service data analytics with Claude》做了一次结构性解读。文章把那个吸睛的 "95% 准确率" 拆解成 5 个反直觉边界：信息存在 ≠ 用对、SQL 写对 ≠ 答案对、RAG 解决"有没有"但不解决"权威性"、Skills 是规程不是模板、Agent 错起来比人错更危险。核心结论是企业级 AI 数据分析需要 **数据级 Harness**：把语义层、血缘图、Skill 工作流、对抗性评测、来源页脚、人审纠错封装进 Agent 运行环境。

## 深度分析

### 1. 95% 这个数字到底在说什么

Anthropic 原文披露：内部约 95% 的业务分析查询已由 Claude 自动化处理，整体准确率约 95%。JiaGouX 提醒的口径是：

- **不是** 95% 的数据科学判断交给 Claude
- **不是** 把模型接进数据仓库加聊天框就能得到同样效果
- **更接近**：重复、日常、口径稳定的数据请求从"人查"转到"Agent 按流程查"

人被释放去做因果建模、预测、机器学习、更复杂的业务分析。Genloop 的评论很直接：Anthropic 的 95% 是被资深数据团队持续维护后的**稳态结果**，不是新团队冷启动表现。

### 2. 错得很安静：false sense of precision

很多公司的 AI 数据分析第一步很容易走成这样：把数据仓库接给大模型 → 用户用自然语言提问 → 模型写 SQL → 返回图表和结论。Demo 好看，但可能在第一步就选错定义：

- "上周" 是最近 7 天，还是完整自然周？
- "企业客户" 是否排除测试账号、欺诈账号、内部账号？
- "收入" 是账单收入、确认收入、净收入，还是某个业务团队自己的口径？

这些问题已经超出 SQL 语法层面。SQL 写得再漂亮，也可能查的是错表、错字段、错时间窗口。更麻烦的是，业务用户看不到底层数据模型，他只看到答案。**答案越流畅，越容易被转发到周报、会议、经营分析里**。Anthropic 用了 "false sense of precision" 这个词。

### 3. Data is not software：执行层反馈对比

| 维度 | AI Coding | AI Analytics |
|------|-----------|--------------|
| 执行反馈 | 测试会红，类型报错，函数跑不通 | 查询能跑通，图表能画出 |
| 错误模式 | 系统给出反向信号 | 答案仍可能错 |
| 错误原因 | 执行失败 | 定义错了 |
| 难点 | 执行和回归验证 | 先在定义 |

写代码时 Agent 有大量反向信号；数据分析给不了这么多硬反馈。AI Coding 难点在执行和回归验证，AI Analytics 难点先在定义。

### 4. 反直觉边界：检索 ≠ 用对

团队第一反应是"既然模型容易选错，就丢进检索库"。Anthropic 做了消融实验，结果反直觉：

- 给 Agent 直接开放数千个 Dashboard、转换模型、Notebook SQL 的检索访问 → 准确率变化**不到 1 个百分点**
- 约 80% 的错误问题里，正确答案**其实就在语料库中**
- 信息存在，模型也看到了，但它仍然没有用对

RAG 解决的是"有没有材料可读"，数据分析 Agent 要补的是另一层判断：
- 这次问题里，哪份材料才算**权威**
- 哪份已经**过期**
- 哪份只适合某个**团队**
- 哪份**不能直接套用**

信息越多，如果没有排序、归属、路由和验证，反而变成噪声。

### 5. Skills 是规程不是模板

Claude Code 体系里 Skill 是带 `SKILL.md` 的目录，可带参考文档、脚本、模板和资源文件。官方指南有个边界：

> **MCP 提供工具和连接，Skill 提供做事的方法**

数据仓库 Skill 至少要写清：

| 必填项 | 原因 |
|--------|------|
| 什么时候默认先查语义层 | 避免走错表 |
| 什么时候要澄清时间窗口、分母、用户范围 | 强制反问而非猜测 |
| 哪些指标有权威定义，哪些表已经废弃 | 路由决策 |
| 哪些问题只能返回数据，不能替业务下结论 | 红线 |
| 涉及隐私/受限数据时，权限由系统层拦住 | 不要靠 prompt 限制 |
| 最终回答要带来源、新鲜度、置信度、负责人 | 可追溯 |

Anthropic 给出生产里的硬证据：**没有 Skills 时 Claude 在内部分析评测里的准确率不超过 21%；加入 Skills 后整体长期稳定超过 95%，一些领域接近 99%**。

### 6. 数据级 Harness：模型不是唯一主角

把这套系统画出来，更接近这样：模型当然重要，但它不是唯一主角。让系统可用的是围绕模型的一圈东西：

- 权威数据集减少候选项
- 语义层提供一致指标
- 血缘和转换图说明数据从哪里来
- **Skill 固化工作流程**
- 离线评测暴露盲区
- 对抗性审查挑战错误假设
- 来源页脚暴露可信度
- 用户纠错回流到文档、评测和 Skill

JiaGouX 把这套圈层叫做**数据级 Harness**。它不保证答案永远正确，但至少把"为什么这么查、用的是什么口径、靠什么验证、错了怎么改"放进了系统里。

### 7. 5 个反直觉边界（账本）

**(1) 维护成本不低**：Skill 描述的是每天都在变化的数据模型。如果不维护，几周内就会失真。Anthropic 看到过离线准确率从 95% 漂移到 65%。他们后来把 Skill Markdown 和数据转换模型放在同一个 repo 里——数据模型 PR 如果没有同步改 Skill，会被代码审查 hook 标出来，现在约 90% 的数据模型 PR 都包含 Skill 变更。

**(2) 验证也要付成本**：对抗性审查在评测集上带来 6% 的准确率提升，代价是 token 增加 32%、延迟增加 72%。高风险分析里划算，日常临时问题里要按场景算账。

**(3) 权限不能交给提示词**：让 Agent "优先走语义层"是流程约束，不是安全边界。行级权限、隐私字段、财务数据、客户数据要在系统层执行。只在 Skill 里写一句访问限制挡不住真实风险。

**(4) 组织边界会断开维护链路**：数据工程、BI、财务、销售运营、产品分析如果各自维护自己的口径和文档，Agent 看到的就会是一个拼出来的世界。人类分析师还能靠经验知道"这个看板别用，那个字段老了"，Agent 不一定知道——除非这些经验被写进可维护、可审查、可过期的系统资产里。

**(5) 静默失败还没有彻底解法**：最难的是没人指出来的错误——答案错了，但语气自然、数字完整、图表漂亮，于是它被放进汇报、周会和决策材料。来源页脚、领导汇报前的人审、核心 KPI 每天对权威看板都只能降低风险。

### 8. 数据科学家没有退场

JiaGouX 把这条线接上 Hamel Husain《The Revenge of the Data Scientist》：LLM API 让团队觉得自己可以绕过数据科学，可系统真要稳定，最后还是要回到 traces、错误分类、评测集、指标设计、标签质量、数据漂移这些基本功。Josh Wills 2012 年那条经典推文今天反而更贴切：数据科学家是比软件工程师更懂统计、又比统计学家更懂软件工程的人。

角色会变，但能力没有退场。它只是从"亲手产出每一个分析结果"往"**设计数据口径、评测方法、错误分类、验证流程和反馈闭环**"迁移。

### 9. AutoResearch Loop 的可迁移性

Karpathy 的 AutoResearch 让 Agent 修改训练代码、跑固定 5 分钟实验、用 `val_bpb` 指标判断有没有改进，然后保留或丢弃。好看的地方不是"AI 自己跑实验"，而是它把自动循环放进了一个很小的 Harness：

- 固定文件边界
- 固定时间预算
- 固定指标
- 可回放日志
- 可审查 diff

Aakash Gupta 把这个结构往外推了一步：凡是有清楚评分的系统都可以迁移这种循环。日常临时业务问题没有像 `val_bpb` 那样干净的分数，但**高频问题、权威指标、固定口径、历史正确答案、核心看板对账**，可以先凑出一批可回放的评测点。这和 Anthropic 的实践方向上是通的。

### 10. 落地清单：小步快跑

JiaGouX 建议避开"公司级聊天查数入口"，更小一点反而更稳。先列一张表：

| 要补的东西 | 先做到什么程度 |
|-----------|---------------|
| 高频问题 | 选 10 个反复被问的业务问题 |
| 权威指标 | 每个问题只绑定一个主口径 |
| 权威数据集 | 少数 canonical datasets，明确 Owner |
| 离线评测 | 几十条真实问题，保留期望口径和答案依据 |
| Skill | 一个薄的知识路由，一个分析流程 Skill |
| 输出格式 | 每次回答带来源、新鲜度、置信度、负责人 |
| 红线边界 | PII、财务、领导汇报等场景先设人审或只返回 SQL |
| 监控信号 | 语义层命中率、纠错语言比例、核心 KPI 对账结果 |
| 纠错回流 | 错一次，就补评测、补文档、补 Skill |

一开始覆盖面小没关系，关键是先把闭环跑起来。能不能稳定回答 10 个高频问题、错了能不能复盘、口径变了能不能同步、权限能不能挡住、成本和延迟能不能接受——这些跑顺以后再扩领域。

## 实践启示

1. **把"AI 数据分析"当成数据治理问题，而不是 prompt 工程问题**：SQL 写不对只是表象，"上周" "企业客户" "收入" 这些定义不在语义层注册，Agent 永远猜不到。先建语义层，再谈 Agent。

2. **Skills 不是模板，是资深分析师的工作规程**：把"什么时候先查语义层、遇到歧义怎么问、什么时候停下来、最后怎么交付可追溯答案"写进运行时。模板数量不决定质量，能不能把一次性经验变成过程资产才决定。

3. **RAG 解决"有没有"，Context Layer 解决"用哪个"**：信息存在不等于用对。要补的是权威、过期、归属、套用边界这层判断。a16z / Snowflake / Benn Stancil / Atlan 四篇参考材料方向一致：MCP 是传递上下文的线，不是上下文的生产、治理、版本系统。

4. **维护成本必须算进账**：Anthropic 自己经历过 95% → 65% 的漂移。把 Skill Markdown 和数据转换模型放在同一个 repo 里，PR 审查 hook 强制同步变更。这种"数据模型 + 工作流" 同仓同审是必经之路。

5. **静默失败的真解法是组织 + 系统，不是模型**：来源页脚、人审、核心 KPI 对账都只能托住一部分风险。承认它没彻底解法，把"错一次补一处"做成团队肌肉记忆，比追求一个完美模型更现实。

## 相关实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch03/045-agent.md)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](../ch05/092-harness-engineering.md)
- [Karpathy Vibe Coding Agentic Engineering](../ch04/134-karpathy-vibe-coding-agentic-engineering.md)
- [你不知道的 Agent原理架构与工程实践 V2](../ch03/045-agent.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](../ch11/213-openclaw.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](../ch11/213-openclaw.md)
- [Anthropic Institute When Ai Builds Itself Jiagoux Interpretation](ch01/833-anthropic.md)
- [Claude Code Dynamic Workflows Jiagoux Architect Perspective](../ch09/078-claude-code-dynamic-workflows.md)
- [Agent Reliability Engineering Skillify Continuous Improvement](../ch04/262-skill.md)
- [Agent Skill Writing Evaluation](../ch04/260-agent-skill.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/mlops-training-inference.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-95pct-data-analysis-jiagoux-data-level-harness-20260606.md)

---

