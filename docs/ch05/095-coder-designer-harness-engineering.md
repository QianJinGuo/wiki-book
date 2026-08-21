# 从 Coder 到 Designer：电商团队数据研发的 Harness Engineering 实践

## Ch05.095 从 Coder 到 Designer：电商团队数据研发的 Harness Engineering 实践

> 📊 Level ⭐⭐ | 6.4KB | `entities/从coder到designer-电商数据研发-harness-engineering.md`

# 从 Coder 到 Designer：电商团队数据研发的 Harness Engineering 实践

阿里技术（白林林）分享的电商团队数据研发 AI 化实践，目标是让 AI 像资深数研一样思考，且比人类更稳定、更可追溯、越用越准。项目围绕「数据研发效率提升」和「数据价值交付」两个命题，调研发现两个共性问题：横向拓展能力不足（已有平台能力换业务接入只能发挥约 30%）、数据资产沉淀不足（NL2SQL 准确度强依赖语义层资产质量且缺乏统一标准）。问题的本质是「数据研发的知识是碎片化的，流程是非标准化的」，解法是知识工程（解决「AI 凭什么能做对」）+ Harness Engineering（解决「AI 如何稳定运行」）双轮驱动。

方案复用兄弟团队 NL2SQL 约 60% 已有能力，自建业务域特有的数据资产、预定义 SQL 模板、业务语义知识库，在大促场景完成落地。语义层走 NL2DSL2SQL 路线：先将自然语言映射到标准化的指标-维度语义，再从语义生成 SQL；指标治理遵循「先治理再录入」原则，计划通过「标准名称+别名映射+语义边界」规范体系解决同义词混用导致的 RAG 召回偏差，并构建资产防腐双循环机制（上线前数仓小组拦截语义重复资产，上线后定期资产健康度评估清理冗余）。

## 知识工程：让 AI「有据可依」

建设三层架构的知识体系：方法论层（Spec 指导需求分析、Plan 规范技术方案、Task 定义执行标准，形成「文档即接口」的多 Agent 协同机制，实现 SPEC→PLAN→SQL 链式生成）、协作机制（文档状态机驱动 8 阶段研发流程，AGENTS.md 记录协作规范、Skills 引擎执行核心操作、Knowledge 库沉淀研发经验）、执行原则（基于数研经验初始化，通过需求调试持续优化）。质量保障有三层安全网：流程标准化（配置文件和技能清单固定流程）、质量把关（技术规范+人工复核双重保险）、知识管理（业务经验和调优方案系统化沉淀）。知识消费的核心是「研发即沉淀」——SPEC、PLAN、SQL、验证报告自动归档到 Archival Memory，踩过的坑记录到 anti-patterns.md，从「人可用」转型到「AI 可食」的资产格式。

## Harness Engineering：让 AI「稳定可控」

Harness Design 的核心目标不是让模型更聪明，而是通过结构化控制而非算法优化，确保 AI 在复杂任务中稳定、安全、可回溯地运行：分离关注点（决策与执行分离、知识检索与代码生成分离）、施加约束（Gate 机制、规范校验、强制审批）、管理上下文（控制信息输入量）、管理熵值（持续「整理」和「矫正」防止行为漂移）。与传统 CI/CD Pipeline 相比，Harness 需要额外处理的核心挑战是 AI 的不确定性——传统 Pipeline 每步是确定性的，AI Agent 每步都可能产生意料之外的输出。

团队构建了 7 Agent 协同工作流（老架、小需、小语、小检等角色），采用顺序协作模式（Agent 按预定义顺序执行，形成严格流水线）和反馈循环模式（下游发现问题可回滚到上游环节）的组合，关键节点人工 Gate 审批——「AI 做执行，人做决策」。稳定性工程针对幻觉：技能幻觉检测 Hook（技能执行后自动对比声称结果与实际系统状态）、执行结果强制校验（关键操作必须产出可验证产物）、日志必看原则；空间隔离（独立 Workspace、`{domain}_{date}_{seq}` 命名规范、MCP/Skill 加载路径优先级）；配置治理（自动化 Git 备份、agents.md 同步机制、模板化重新配置）。

## 自动化自我迭代：心跳机制

心跳机制分三层：执行监控（定期回顾执行历史、成功率、失败原因、用户修正记录）→ 模式识别（识别反复出现的问题模式，如某类指标 RAG 召回准确率持续偏低）→ 自动优化（优化 Prompt 模板、补充知识条目、调整工作流参数）。最关键的一点是人工修正 Agent 行为时产生的反馈会被自动捕获并写回知识库和规则配置——实现「以 Agent 养 Agent」，通过人对大模型的反馈实现大模型的「经验升级」。

## 演进方向：从 Coder 到 Designer

最终愿景是实现「只做选择，不做配置」：数研同学的角色从「写代码的人」转变为「做设计的人」，人专注于需求理解、方案选型、质量决策，AI 负责资产检索、代码生成、环境部署、数据验证等一切可自动化的执行工作。知识工程确保 AI「做对事」，Harness Engineering 确保 AI「稳定做事」，两者协同构成数据研发 AI 化的完整技术底座；从 NL2SQL 到 ChatBI 的延伸则把这套能力从「服务数研同学」拓展到「服务业务用户」。

## 相关实体

- [阿里数据研发 Harness 工程](ch05/065-harness-engineering.html)
- [NL2SQL 数仓架构实践](../ch01/1438-nl2sql.html)
- [上下文工程](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md)
- [Agent 编排模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md)
- [Harness Gate 评估](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-gate-evaluation.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/从-coder-到-designer-电商团队数据研发的-harness-engineering-实践.md)

---

