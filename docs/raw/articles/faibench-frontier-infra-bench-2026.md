---
title: "faibench / Φ-Bench：评测 agent 能否工程化供养自己的 AI 基础设施（本地代码库快照）"
source_url: "file:///Users/jinguo/phd/faibench_Frontier_InfraBench"
source: "local|phd 合集（faibench.org，Apache-2.0）"
author: "faibench 团队"
ingested: "2026-08-29"
type: raw-article
tags: []
source_type: local
sha256: "b2db70dd52a8e42d3fd682196bf482f91bfb1715e9877125d85f9f10858d7564"
---

评测前沿 LLM 与自主 coding agent 能否「工程化供养自己的基础设施」的 benchmark：85 个 Docker 可复现的真实 LLM-infra 工程任务（kfc 单 kernel 优化 55 / lh 仓库级长时程 20 / e2e 端到端系统优化 10），从 10,000+ 候选经 agent 辅助筛选 + 专家评审而来；离线解题、离线评分。核心机制（提炼自 /Users/jinguo/phd/faibench_Frontier_InfraBench 的 README、SCORING.md、task_catalog.json）：

- **评分两族**：Performance 77 任务，连续 [0,1]，**oracle-zero 对数曲线** `reward = min(1, ln(speedup/ref_speedup)/ln(ref_speedup))`——**打平 oracle 得 0**，ref^1.5 得 0.5，ref² 封顶 1.0（旧曲线 [0, 0.5] 的分数大团被压缩为 0，整个 [0,1] 留给超越 oracle 的幅度）；Implementation 8 任务二值。
- **六条零分硬门**：构建/导入失败；任一正确性 case 失败；作弊检测（冻结面被改、配对比值恒等、物理不合理加速）；动 `forbidden_edit_paths`（sha256 冻结）；performance 任务 speedup≤1；`ref_speedup` 缺失或 ≤1——**宁可拒评也不出可疑分**。`hard_fail` 语义（运行无效/作弊）与「曲线本身得 0」（只是没打过 oracle）严格区分。
- **ABBA 配对测量**：baseline/candidate 交替测多对、每对取比值、跨对取中位数，抑制系统漂移。
- **提交契约是 working-tree 而非 git commit**：agent 直接改允许文件，`pre_artifacts.sh` 用 `git add -AN` + `git diff HEAD` 抓 diff；**一旦 commit，scope gate 与基线捕获都坏，正确解也得 0 分**——这让任何文件编辑型 scaffold 即插即用。
- **eval 与 agent 的信息隔离**：tests/（test.sh + compute_reward.py + workloads + anchors）**永不烘焙进镜像**，评分时只读挂载；镜像内 manifest 故意不含真 anchor——不挂载 tests/ 就大声失败而不是给错分。
- **挖掘树自证**：`oracle.patch` 必须能正向 apply 且反向 apply 失败，字节级证明 vendored 基线的 provenance；同 upstream 家族的任务互相持有对方的 scope 文件于挖掘态。
- **loop16**：26 个长时程任务跑 1–16 轮提交，`submit.sh --finalize` 植入按 dev reward 严格递增维护的**历史最佳轮**——最后一版变差不影响分数。
