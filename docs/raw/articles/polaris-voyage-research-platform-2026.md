---
title: "Polaris：Voyage 持久化科研内核——不重规划、确定性验证先行、远程 GPU re-attach（本地代码库快照）"
source_url: "file:///Users/jinguo/phd/Polaris"
source: "local|phd 合集（ZJU-REAL，Apache-2.0）"
author: "浙江大学 ZJU-REAL 实验室"
ingested: "2026-08-29"
type: raw-article
tags: []
source_type: local
sha256: "a2d473847b84e1705edf41708294f89e8c5fc969ceeb8c711806eafbcf2fe509"
---

把完整科研生命周期（文献 → 想法 → 评审 → GPU 实验 → LaTeX 写作 → 论文评审）做成多用户 Web 平台，核心是名为 **Voyage** 的持久化、可恢复、人工把关的 agent 内核（docs/concepts.md 为最权威一手文档）。核心机制：

- **六阶段**：Research Wiki（OpenAlex/S2/arXiv 摄入，锚点论文滚雪球，「**编译，而非检索**」——一篇论文只有一份解读全平台共享；概念需两篇论文引用才提升为正式概念）→ Idea Forge（概念共现空洞/局限/趋势/综述空白多信号找缺口，新颖性/可行性/可操作性/影响力四维打分）→ 想法评审（人设评审 agent 两两辩论 + **Elo 锦标赛**，人类经 WebSocket 实时加入且意见为一等输入）→ Experiment Lab（SSH 连真实 GPU，算力预算校验）→ Paper Writer（**实验数字只能来自真实 ExperimentRun 指标，引文必须对应真实知识库条目**）→ 论文评审（逐条引文核查，**一条伪造引文即整体不通过**）。
- **Voyage 三组件**：Navigator（规划：失败时不重规划，而是发增量 **plan edit**——`add_nodes/update_node/obsolete_nodes`，硬不变量：每 edit ≤8 新步骤、只动未完成步骤、不得在当前执行点前插入、superseded 标 obsolete 不删除）+ Helm（执行：刻意极小，异常永不逃逸，异常变 `{"error": ...}` observation）+ Sextant（验证：按成本排序的 check 链——`observation.error` → self_check → 结构化 checks（**确定性检查先行、短路，全部通过才轮到 LLM**）→ llm_rubric；失败原因刻意具体如 `[metric] accuracy = 0.62, does not satisfy >= 0.8`，因为该字符串会被注入重试参数与 replanning prompt）。
- **预算哲学：「限额花在进展上，不是重试次数上」**：实验修复循环**无重试计数器**，用墙钟 phase 预算（时钟排除排队/审批/等待时间）；plan edit 按错误签名限 2 次连续（换错误即重置）；run token budget 耗尽时 wrap-up 步骤仍可跑。
- **断点续跑**：一切状态在 Postgres 进程外（run/step/日志三表 + checkpoint JSON 列）；resume 时 passed 步永不重做；远程 GPU 进程 `nohup` detach，重连时 **re-attach 到仍在跑的进程**而不是重启。
- **人的位置**：四种平台级审批门（idea_promotion/compute_budget/remote_write/paper_submission）；`paused_ask`（agent 卡住时提问而非死掉，带 retry/change approach/continue/wrap up 等快捷选项）；任意时刻 suggestion 在下一决策点消费且与决策同事务提交。
- **Shell/Brain 三档**：pipeline（可预测流水线失败即 pause 等人，plan 只能经确定性分支表增长）/ template（分支表处理已知失败类，LLM replan 兜底）/ loop（开放式任务才允许 Navigator 增量改计划）。
