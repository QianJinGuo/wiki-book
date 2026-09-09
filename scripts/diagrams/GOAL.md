# GOAL: 全站文章 Mermaid 图生成(一次全量,循环推进)

目标:为 `docs/ch*/*.md` 的每篇文章(已含内联 mermaid 的除外)生成一张内容锚定的
mermaid 图,存入 `diagrams-src/`,装配为 `docs/diagrams/<key>.json` 供前端 overlay
挂载。图不进文章 md,全程非侵入。

## 工具(均在 wiki-book 仓库根执行)

- `python3 scripts/diagrams/pipeline.py queue > /tmp/diagram-queue.jsonl` — 生成队列(级别、篇幅降序)
- `python3 scripts/diagrams/pipeline.py progress` — 进度(diagrams-src 现有 / 应生成)
- `python3 scripts/diagrams/pipeline.py validate` — 语法+锚点门禁
- `python3 scripts/diagrams/pipeline.py assemble` — diagrams-src → docs/diagrams/*.json(含 prune)
- `python3 scripts/diagrams/digest.py docs/chXX/slug.md ...` — 取文章摘要(标题/级别/要点/目录)

## 每批流程(一次跑一批,约 20 篇)

1. `progress` 查看剩余;若剩余为 0 → 跳到「收尾」。
2. 取队列中**尚无对应 .mmd** 的前 20 篇,用 digest.py 生成摘要并阅读。
3. 逐篇产出 `diagrams-src/<chXX>/<slug>.mmd`,首行 `%% title: <中文标题>`,第二行起
   `graph TD`(统一用 flowchart,不用 mindmap——缩进敏感易错)。
4. `progress` 确认本批落盘;`validate` 必须全绿;不合格当场修或删。
5. `assemble` 后 git add diagrams-src docs/diagrams scripts/diagrams 并 commit
   (英文消息,如 `diagrams: batch N — 20 article diagrams`;先
   `export PATH="$HOME/.volta/bin:$PATH"`)。只 commit 不 push,push 留给收尾。

## 图表规范(硬性)

- 6–14 个节点,深度 ≤ 4;标签用双引号包裹,≤ 22 字,用文章真实术语(标题词必须出现
  在图内,锚点检查会拦)。
- 不用 classDef/style;括号、百分号只能出现在引号内;标签里禁用 `-->`、`|`、反引号。
- 结构映射:概念类=分层/组成图;流程类=带判断的流程;对比类=并行分支;演进类=主干
  +分支。宁缺毋滥:内容撑不起图的写极简 3–5 节点结构图。

## 收尾(队列清空时执行一次)

1. `validate` 全量确认;`assemble`。
2. `touch diagrams-src/.done` 作为完成标记。
3. `git push origin main`;再跑仓库根 `deploy.sh`(三环境部署;wrangler 失败会自动
   走 127.0.0.1:7897 代理兜底)。

## 时间窗避让

每夜 03:00 有 wiki 同步占用本仓库。**02:30–04:00 之间不得做批次工作或 assemble**
(避免 docs/ 脏区卡死同步),到点直接结束本次运行。

## 完成判定

`diagrams-src/.done` 存在且 `progress` 剩余为 0 → 本目标已完成,后续运行直接退出。
