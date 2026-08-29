---
title: "Arbor：假设树驱动的自主科研实验 Agent（本地代码库快照）"
source_url: "file:///Users/jinguo/phd/Arbor"
source: "local|phd 合集（RUC-NLPIR + 微软，arXiv:2606.11926，Apache-2.0）"
author: "RUC-NLPIR + Microsoft"
ingested: "2026-08-29"
type: raw-article
tags: []
source_type: local
sha256: "6729e3682aec74d7dcdfa944f2c08ce50acaecfd0af1d0937a2272a3e62d81b5"
---

给定基准与研究目标后自主提出假设、改代码、跑真实实验的 agent。核心机制（提炼自 /Users/jinguo/phd/Arbor 的 README、docs/self-evolution.md、src/coordinator/idea_tree.py）：

- **双 agent**：Coordinator（研究总监，维护 Idea Tree，不写代码）+ Executor（研究工程师，在隔离 git worktree 中实现单个假设）。
- **六步循环**：OBSERVE → IDEATE → SELECT → DISPATCH → **BACKPROPAGATE**（把结果/分数/洞察向上抽象写回祖先节点的 `insight` 字段——树本身即长期记忆）→ DECIDE（合并/剪枝/pending/终止）。depth 0=根，depth 1=研究方向，depth 2+=具体方法。
- **实验纪律**：只在开发集 B_dev 迭代；留出测试集 B_test 提升超过 `merge_threshold`（默认 5.0%）才合并到 run 专属 trunk 分支，用户满意才手动进 main。剪枝 = 无净收益分支，失败教训以 `insight` 形式向祖先传播。
- **经验的刻意克制**：`RecordFinding` 工具实时记录 `{kind: leverage|pitfall, about, note, source}` 到会话级 `findings.jsonl`；`experience.jsonl` 记 `{node_id, status, insight, result, score}`；finalize 时蒸馏 `EXPERIENCE.md`。三条克制设计：经验**保持具体、不做抽象**（文档原话：不试图把发现抽象成通用原则）、**per-session 存储**（recall 限定当前项目）、**复用需 intake 对话征询用户同意**。重复出现的 finding 标 `[xN]` 排前。
- **文献把关**：`arbor idea-check` 输出 novel / partial-overlap / prior-art-exists 三档新颖性判定；`auto_search_on_add` 让新想法入树即后台审查，结果写入节点 `related_work`，执行器开跑前就能修订或剪掉。
- **Node schema**：`id`（层级编号 ROOT/1/1.1/1.1.1）、`parent_id`、`status`（pending|running|done|needs_retry|merged|pruned）、`insight`、`result`、`score`+`score_split`（dev|test）、`code_ref`（git 分支）、`related_work`、`grounding`、`eval_status`、`attempt`。
- 三种发行形态：原生 CLI；无密钥 harness 集成（`arbor install` + `arbor mcp`，宿主 Claude Code/Codex 模型驱动）；11 个独立 skills。
