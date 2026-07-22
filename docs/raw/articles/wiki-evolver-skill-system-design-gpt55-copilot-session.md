---
title: "wiki evolver skill system design gpt55 copilot session"
source_url: file:///Users/jinguo/wiki/copilot/copilot-conversations/copilot-session-vault-evolves-GPT5.5.md
tags: [wechat, article, claude, openai]
ingested: 2026-05-01
sha256: local-copilot-session-export
type: raw
created: 2026-05-10
updated: 2026-05-10
---
# Wiki Evolver Skill System Design (GPT-5.5 Copilot Session)
来源：`copilot/copilot-conversations/copilot-session-vault-evolves-GPT5.5.md`
以下保留该会话中与知识库长期演化最相关的关键产出，作为后续实体页、导航页、backlog 页的原始设计依据。
## 核心判断
不要再做一个“更强采集器”，而是做一个上层编排 Skill：`wiki-evolver`。它把已有的 `web-content-reviewer` 和 `llm-wiki` 变成一个长期自进化系统：输入不是终点，知识库必须持续产生问题、连接、论文、工程实践和下一代 Skill。
现有基础：
- `SCHEMA.md` 已有 ingest → synthesize → index → log → lint 闭环
- `queries/topic-map.md`、`queries/review-queue.md`、`queries/wiki-health-dashboard.md` 已具备导航/治理层
- `web-content-reviewer` 负责单篇 URL 严格评审
缺失层：**涌现层（emergence layer）**
## 建议的 Skill 目录
```text
~/.hermes/skills/research/wiki-evolver/
├── SKILL.md
├── references/
│   ├── operating-model.md
│   ├── source-strategy.md
│   ├── emergence-loop.md
│   ├── talk-to-vault.md
│   ├── paper-factory.md
│   ├── engineering-practice-factory.md
│   ├── governance.md
│   └── output-templates.md
└── scripts/
    ├── vault-stats.mjs
    ├── graph-report.mjs
    ├── stale-pages.mjs
    └── source-dedupe.mjs
```
## Skill 目标
这个 Skill 不是采集器，而是知识库的 operating system。目标是把 sources、conversations、failures、experiments、questions 全部转化成一个可复利增长的 Obsidian wiki，它能够：
1. answer from the vault
2. discover gaps and contradictions
3. generate original synthesis
4. produce papers and engineering practices
5. improve its own Skills over time
## 激活条件
当用户要求以下事情时使用 `wiki-evolver`：
- improve or evolve the wiki
- process feeds or source backlogs
- talk to the vault
- generate research papers / essays / engineering practices / playbooks / learning paths
- find missing topics / contradictions / stale knowledge / frontier questions
- design or refine knowledge workflows and Skills
## Core Contract
每次运行至少产出一个 durable outcome：
1. ingested/updated source material
2. updated synthesis page
3. updated query/navigation page
4. new research question or frontier map
5. paper/practice draft grounded in vault sources
6. governance repair: index/log/lint/schema/links
7. improved Skill/playbook/checklist
## Operating Loop
```text
1. Orient
2. Route
3. Triage
4. Synthesize
5. Emerge
6. Govern
```
### Orient
Read `SCHEMA.md`, `index.md`, recent `log.md`, and relevant `queries/`.
### Route
- URL/article → `web-content-reviewer`
- Wiki write/query/lint → `llm-wiki`
- Broad evolution task → `wiki-evolver`
### Triage
除了 source quality，还要评估 `vault_delta`：
- 是否更新了已有 belief
- 是否连接了以前分离的 cluster
- 是否引入了新 mechanism / pattern / failure mode
- 是否能转化成研究/实践产物
### Synthesize
更新 `entities/`, `concepts/`, `comparisons/`, `queries/`，要求有 wikilinks 和 provenance。
### Emerge
从本轮结果中提取：
- new questions
- contradictions
- missing pages
- reusable patterns
- candidate papers
- candidate engineering practices
- candidate Skill improvements
### Govern
更新 `index.md`、`log.md`，并在文件变化时运行 structural validation。
## Knowledge Ladder
```text
raw source
→ claim
→ mechanism
→ pattern
→ comparison
→ principle
→ playbook
→ paper
→ Skill
```
关键判断：知识库真正产生价值，不是因为 source 多，而是因为高层产物仍然牢牢系在低层 provenance 上。
## 建议的运行模式
- `feed-scout`
- `vault-query`
- `frontier-map`
- `paper-factory`
- `engineering-practice-factory`
- `skill-refine`
## 建议新增的 Query 页面
```text
queries/research-frontier-map.md
queries/paper-backlog.md
queries/engineering-practice-backlog.md
queries/vault-evolution-dashboard.md
```
这些页面分别回答：
- 现在知识库最值得深挖的前沿问题是什么？
- 哪些主题已经积累到足以写论文/长文？
- 哪些理论可以沉淀成工程实践？
- 哪些页面过时、孤立、重复、矛盾、低置信？
## 总结
目标不是把 vault 做成“AI 资料库”，而是把它做成一个 **Agent Research Harness**：
```text
Source → Synthesis → Connection → Question → Artifact → Practice → Skill → Better Agent → Better Source Selection
```
在这套分工里：
- `web-content-reviewer` 负责守门
- `llm-wiki` 负责落库
- `wiki-evolver` 负责让整个系统产生复利和涌现