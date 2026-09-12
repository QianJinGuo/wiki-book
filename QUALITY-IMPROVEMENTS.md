# Content Quality System Improvements

> 2026-09-12 | 基于 1,511 篇全站人读评审发现的管线级缺陷及改进方案

## 已完成的改进

### 1. 构建门禁增强 (check-public-build.mjs)
新增 7 个 QC 评分正则拦截：
- `v×c=N` / `v=N × c=N` / `v=N × c=N = total` 各变体
- `value=N, confidence=N` 格式
- `Article ingested from newsletter candidate pipeline`
- `评分：v=N` 短形式
- `Ingest score ... v=N`

排除检测工具自身（post-sync-qc.py、check-public-build.mjs）。

### 2. 部署流程 QC 集成 (deploy.sh)
新增 `post-sync-qc.py` 调用：
- 默认非阻断（警告模式）
- `STRICT_QC=1` 环境变量可切换为阻断模式
- 在 build 之后、deploy 之前运行

### 3. Post-sync QC 脚本 (post-sync-qc.py)
检测 11 类缺陷：
| # | 类别 | 严重性 | 说明 |
|---|------|--------|------|
| 1 | K-leak | Critical | QC 评分元数据泄漏到正文 |
| 2 | Scraper-metadata | Critical | Published Time / Markdown Content 残留 |
| 3 | Dual-practice-section | Critical | 双实践启示标题（MOC 文件排除） |
| 4 | M-duplicate | Warning | 同一存档 URL 出现在多个文件 |
| 5 | Garbage-slug | Warning | 短链/日期/纯数字 slug |
| 6 | Level-anomaly | Warning | 非 ⭐⭐⭐ 的 Level 标注 |
| 7 | Empty-section | Info | 空节头（## 来源/Notes 等） |
| 8 | Bare-quoted-entity | Info | `- "Entity Name"` 无链接 |
| 9 | Citation-artifact | Info | `]"]` 引注残渣 |
| 10 | Dangling-archive | Info | `→ 原文存档` 无 URL |
| 11 | Arch-placeholder | Info | `架构图待生成` 占位符 |

使用方式：
```bash
# 完整报告
python3 scripts/post-sync-qc.py

# 仅摘要
python3 scripts/post-sync-qc.py --quiet

# 指定目录
python3 scripts/post-sync-qc.py --docs-dir docs/

# 跳过 M 重复检测（大量合法同源时）
python3 scripts/post-sync-qc.py --skip-archive-dedup
```

## 待实施的中期改进

### 1. slug 生成管线修复（待实施）
**问题**：实体 slug 从 URL 路径自动生成时产生垃圾值（如 `3rdfsmp`、`5237875`、`2026`）。
**修复方案**：在 wiki 入库管线中增加 slug 验证——slug 不含语义字符时回退到标题派生生成。
**影响范围**：3 页残留（QC Garbage-slug 项持续跟踪）。

### 2. 来源合并管线 QC 元数据过滤 — ✅ 已实施（2026-09-12）
**修复**：`~/wiki/scripts/book_compiler.py` 新增 `_sanitize_qc_leaks()`，投影进书前剥离：
- 评分元数据行/内联段（`v×c=`、`v=N × c=N`、`value=N, confidence=N`、`评分：v=N`、`Ingest score`）
- MERGE 决策行与行内 `→ **MERGE**` 决策尾巴
- `Article ingested from newsletter candidate pipeline`
- `review_recommendation:` / `review_value:` 字段
- `Published Time:…Markdown Content:` scraper 残留
- `]"]` 引注残渣、悬挂 `→ 原文存档` 无 URL 行
- 重复 `→ [原文存档](同URL)` 行（保首个）；空 `## 原文链接` 死节
- 第 2+ 个 `## 实践启示` 标题改名为 `## 实践启示（续）`
幂等，单测覆盖。效果：K-leak 86 → 0。

### 3. 同源实体去重 — ✅ 已实施（2026-09-12，保守版）
**修复**：`book_compiler.py` `_dedup_same_source()`：同一存档 URL 且标题归一相似度 ≥0.85 的实体视为同文双入库，保留较大写本入书，孪生实体进 quarantine（reason=duplicate_source_of:*）。
**边界**：仅共享损坏 digest URL 的不同文章（标题不相似）双双保留——无法自动区分，由 post-sync-qc.py 的 M-duplicate 警告供人工裁决（评审 repos 里有 52 组逐对手工裁决记录）。

### 4. Level 分级归属管线 — ✅ 裁定（2026-09-12）
编译器 `classify_level()` 按设计确定性分级（⭐×N，入门→大师五阶，首页层级条可视化）。此前文档级「统一 ⭐⭐⭐」是对管线设计的误判，已被 sync 正确回滚；post-sync-qc.py 的 Level-anomaly 检查已退役。

### 5. MOC 文件实践启示排除 — ✅ 已实现
post-sync-qc.py 排除 docs/ 根目录 MOC 文件（聚合多来源天然多节）。

### 6. 遗留项清理轮 — ✅ 已实施（2026-09-12 第三轮，444 → 22）
- **裸引号 bullet（364 → 0）**：`- "整句"` 强调式引语是访谈实录文体包装，非坏实体链接。编译器净化器整行去引号（容忍行尾 `^[raw/articles/…]` 溯源脚注——脚注由下游剥离，行尾锚定正则在编译期会失配，此坑实测两次）。
- **架构图占位符（18 → 0）**：占位符不是编译期注入，而是 `fix-docs-links.py` 把死 `assets/c4/*.html` 链接降级成 `（架构图待生成: …）`。改为降级成纯文本标签。
- **垃圾 slug（3 → 0）**：wiki 侧重命名 `820297.md`/`5237875.md`/`2026.md` 为语义 slug，更新 MOC/index 全部入链（含 2 个 500B 空壳孪生删除）。
- **M 重复（59 → 22）**：`_entity_archive_url()` 三处修复后同源去重真正生效——wikilink 形态 `[[raw/articles/slug.md|…]]` 需读 raw frontmatter 取 URL、全文读取（链接可在长文深处）、剥离 `.md` 尾缀与 `?source=rss` 查询串。另将 20 个人工裁决的低标题相似真重复 slug 写入 `book_duplicate_slugs.py` 排除清单（保大进书、孪生进 quarantine）。
- **剩余 22 条 M 重复警告**：全部为「不同文章共享损坏 digest URL」假阳性（back.engineering 聚合页、微信短链家族），自动信号无法区分，有意保留待 wiki 入库侧修复 digest URL 后自然消解。

## 遗留的 P3 长尾

以下问题已逐页记录在 reviews/ 目录的评审文件中，适合在日常维护中逐步处理：

| 类型 | 估计页数 | 修复难度 |
|------|----------|----------|
| 概述段截断（需读原文重写） | ~40 | 高（需原文） |
| 裸文本实体补链 | ~20 | 低 |
| 英文正文压缩/翻译 | ~15 | 中 |
| 双存档块合并 | ~25 | 低 |
| Level/引号/错别字残留 | ~10 | 低 |
