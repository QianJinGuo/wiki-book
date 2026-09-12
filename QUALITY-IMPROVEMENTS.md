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

### 1. slug 生成管线修复
**问题**：实体 slug 从 URL 路径自动生成时产生垃圾值（如 `3rdfsmp`、`5237875`、`2026`）。
**修复方案**：在 sync 管线中增加 slug 验证——slug 长度 < 8 或不含语义字符时，回退到标题拼音/翻译生成。
**影响范围**：ch11/123（3rdfsmp）、ch12/022（5237875）等。

### 2. 来源合并管线 QC 元数据过滤
**问题**：第 N 来源合并时，v×c/score/MERGE 决策元数据被写入正文。
**修复方案**：在合并逻辑中增加过滤器，移除以下模式：
- `v×c=\d+`
- `→ MERGE`
- `candidate pipeline`
- `value=N, confidence=N`
**影响范围**：ch11/167/170、ch01/387 等。

### 3. M 重复入库检测
**问题**：同一文章从不同来源（不同 URL/不同 slug）被多次收录。
**修复方案**：入库时以原文存档 URL 为查重主键。运行 `python3 scripts/post-sync-qc.py --quiet` 即可检测。
**影响范围**：Nightmare-Eclipse（4-5 变体）、TeamPCP（双条）、Grafana（双条）等。

### 4. Level 默认值统一
**问题**：不同批次装配管线使用不同默认值（ch11 后段 ⭐⭐⭐⭐/⭐⭐⭐⭐⭐ vs ch12 前段 ⭐）。
**修复方案**：统一为 ⭐⭐⭐（3 星），已通过批处理修复存量。新入库文章应在模板中硬编码 ⭐⭐⭐。
**状态**：存量已修复，管线端待改。

### 5. MOC 文件实践启示排除
**问题**：MOC/overview 文件（docs/ch02-prompt.md 等）因聚合多来源而自然存在多个 ## 实践启示 标题，不应被 QC 标记。
**修复方案**：已在 post-sync-qc.py 中排除 MOC 文件（通过路径判断：直接位于 docs/ 根目录的文件为 MOC）。
**状态**：已实现。

## 遗留的 P3 长尾

以下问题已逐页记录在 reviews/ 目录的评审文件中，适合在日常维护中逐步处理：

| 类型 | 估计页数 | 修复难度 |
|------|----------|----------|
| 概述段截断（需读原文重写） | ~40 | 高（需原文） |
| 裸文本实体补链 | ~20 | 低 |
| 英文正文压缩/翻译 | ~15 | 中 |
| 双存档块合并 | ~25 | 低 |
| Level/引号/错别字残留 | ~10 | 低 |
