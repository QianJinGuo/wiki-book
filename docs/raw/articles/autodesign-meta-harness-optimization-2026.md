---
title: "AutoDesign：优化「设计方法本身」的元支架优化 Agent（本地代码库快照）"
source_url: "file:///Users/jinguo/phd/AutoDesign"
source: "local|phd 合集（arXiv:2608.13560，MIT）"
author: "AutoDesign 团队"
ingested: "2026-08-29"
type: raw-article
tags: []
source_type: local
sha256: "37e3c03581e6cba00029a77187a3695742bb19e57fb45a66ef0c70735d88a54e"
---

围绕**固定的** LLM/MLLM（不改权重），自动优化可复用的 DesignHarness，把一篇论文变成可编辑的海报/幻灯片/网页/视频。核心机制（提炼自 /Users/jinguo/phd/AutoDesign 的 README 与 autodesign/schema.py）：

- **两个嵌套反馈循环**：内层 Designer（coding-agent 直接编辑原生 HTML）↔ Critic（规则验证器 + VLM）多轮修订；外层 MetaHarnessOptimizer 分析执行轨迹做 **rollout → evaluation → update proposal → acceptance**，**每次只更新一个支架组件**。
- **双验收门 + 防泄漏**：候选须在 training set 提升 **且** 不降低独立 development set 才被接受；**development set 的执行轨迹不暴露给更新提议器**——eval 与 optimizer 之间的信息隔离被写进架构。
- **DesignHarness 五类组件**：Context and Memory / Tools and Specifications / Execution Runtime / Orchestration / Evaluation and Feedback——harness 本身被对象化为可优化产物。
- **证据约束**：`claim_graph_extractor.py` 把论点/图片/表格的来源随运行保留；参考海报只迁移视觉系统，其文字/论点/Logo 绝不成为内容证据。最多 12 次修订；预算内无候选通过则用保留的尝试历史做受约束回退。
- **AttemptCandidate schema**（schema_version=1）：`candidate_id, source_sha256, dependency_fingerprint, hard_blockers[], previous_candidate_id, repair_source_attempt`——每次尝试的完整谱系含修复来源与 SHA256 指纹都持久化；`AttemptSelectionJournal` 用幂等键保证交付只发生一次。
- **PosterBench**：七维度 Faithfulness/Coverage/Density/Visual Evidence/Layout/Readability/Aesthetics（权重 10/10/15/10/20/25/10），程序化 OCR/CV 证据 + VLM 判断聚合后再套 record-level 分数上限（四类 ceiling），判分模型固定。
- **self-hosting**：用自己给自己 arXiv 论文生成了海报/24 页幻灯片/落地页/6 分钟 1080p 会议视频。
