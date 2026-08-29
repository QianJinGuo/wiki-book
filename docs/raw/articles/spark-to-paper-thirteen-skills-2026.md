---
title: "Spark-to-Paper：13 个 Skills 把一句话想法变成编译好的 PDF 论文（本地代码库快照）"
source_url: "file:///Users/jinguo/phd/spark-to-paper-skills"
source: "local|phd 合集（arXiv:2608.11924，MIT，HF Daily Papers #1）"
author: "spark-to-paper 团队"
ingested: "2026-08-29"
type: raw-article
tags: []
source_type: local
sha256: "09fec9a4720c2f376e87855992d4e92956741bfe933416981afe7527e6c1fa5f"
---

1 个 orchestrator + 13 个 composable Claude Code skills，把一句话想法（或 proposal / proposal+数据）变成编译好的 PDF 论文——真引用、可编辑矢量图、机器可查完整性，零基础设施。核心机制（提炼自 /Users/jinguo/phd/spark-to-paper-skills 的 README 与 skills/ts-paper/SKILL.md）：

- **流水线**：ROUTE（4 类输入路由）→ plan（blueprint.json：贡献恰 3 条、每节 target_words/paragraph_outline/figures）→ cite（真引用 WebSearch+Crossref；**双轴覆盖检查**：全局 floor + 每节分布 band，证据型正文节零引用是 HARD error）→ write（一个 holistic pass 写全部节）→ refine（right-size + de-AI scrub：语境无关 AI 套话由 `draft_lint` 代码硬 fail，语境相关的只做判断不做代码检查——防误伤产生「逗号汤」）→ review（**对抗式评审**：3 个隔离 reviewer 各读整篇 + **逐字引用 anti-skim 防跳读** + skeptic 视角试图反驳每个 issue + loop until dry，每个 fix 绑定 `close_criterion`）→ figure → latex → experiment（可选 AUTO）。
- **两种相反的 integrity 模式（核心卖点）**：`proposal` 模式**绝不允许句中出现任何具体数字**——百分比/小数/带符号 delta/x 倍数/文字量级（"doubles"）/占位符全部硬 fail，结果表只许 `--`；裸整数（"256 dimensions"、年份）刻意不审（防误报）。`data_aware` 模式每个数字溯源到 `results.facts.json` 真实数据。**没有真论文支撑的 claim → 弱化/删除 claim，绝不造引用**；裸 `@misc{key, title}` bib stub 被禁。
- **PaperBanana+ 图形引擎**：AI 图像模型出光栅候选（科学正确性优先于美观）→ 学其风格（palette/type scale → style.json）→ **从论文自己的事实原生重绘为 live-text SVG**（"bitmap in an XML costume is still blurry"）→ `audit_svg.py` 零依赖几何审计（溢出/文字重叠/z-order 压字/悬空连接点/亚可读字号）迭代到过。回退序：native redraw → 保光栅优化 → 保留已批 PNG，从不 lossy redraw。
- **上游 research-pattern KG**：每篇论文抽 `base_problem / solution_pattern / story`（**anti-summary 规则：不是摘要而是 reframe**——"this work reframes X from Y to Z"）→ embed → cluster → 三轴打分（stability/novelty/domain_distance）→ story.json 8 字段。
- **Quality stack 四层**：确定性 gates（run_gates.py 按 stage 跑 template/blueprint/citations/draft lint）→ 自审 → 对抗评审 → VLM 视觉批评。**Definition of Done**：`run_gates.py all` 退出码 0 + 零 LaTeX 错误 + 每 cite 映射完整 bib + 无编造数字 + 每图可编辑矢量 + 评审已跑。`logs/*.io.md` 记录每阶段 INPUT/DECISIONS/OUTPUT 全轨迹。
