# Wiki-Book E2E 测试报告

**测试时间**: 2026-06-29
**测试方法**: curl HTTP 检测 + HTML 结构分析 + Playwright 渲染验证
**总文章数**: 4,132 篇 (20 章)

---

## 一、测试结果总览

| 检测项 | 结果 | 状态 |
|--------|------|------|
| HTTP 200 | 4,131/4,132 | ✅ 99.98% |
| Entity 存在 | 4,123/4,128 | ✅ 99.88% |
| 有 h1 标题 | 4,132/4,132 | ✅ 100% |
| 有 article 标签 | 4,132/4,132 | ✅ 100% |
| 正文 >500 字 | 4,132/4,132 | ✅ 100% |
| 章节索引页链接 | 0 断链 | ✅ 100% |
| Playwright 渲染 | 20/20 正常 | ✅ 100% |

---

## 二、问题清单

### 问题 1: 404 页面 (1 篇)

**文件**: `ch01-003-5-things-to-know-about-the-clarity-act.html`
**原因**: 此文件是旧构建的残留孤儿文件，不在 `docs/` 中，Docker 重新构建时不会包含它。
**影响**: 从外部链接访问会 404，但站内无任何页面链接指向它。
**修复**: 无需修复，下次 Docker 重建后 site/ 中的孤儿文件会被清除。

### 问题 2: Entity 缺失 (5 篇)

| 文章 | 缺失的 Entity | 原因 |
|------|---------------|------|
| ch01-195 (Claude Opus 47) | `claude-opus-47-并不是一次全面升级...` | entity slug 过长（含重复文字），需截断 |
| ch01-448 (GPT-5.5) | `gpt-55实测有点翻车...` | entity slug 过长，需截断 |
| ch01-003 (CLARITY Act) | `clarity-act-financial.md` | 文章本身是孤儿文件，entity 也缺失 |
| ch07-062 (鹅厂 Skill) | `tencent-skill-writing.../classroom.md` | 路径包含子目录 `/classroom.md`，entity 不存在 |
| ch01-174 (Prowler) | `基于-prowler-.../classroom.md` | 路径包含子目录 `/classroom.md`，entity 不存在 |

**修复方案**:
1. **ch01-195, ch01-448**: 在 `~/wiki/entities/` 中创建对应的 entity 文件（或修正 book_compiler 中的 slug 生成逻辑，避免过长 slug）
2. **ch01-003**: 删除 `site/` 中的孤儿文件，或在 `docs/` 中创建对应源文件
3. **ch07-062, ch01-174**: 这两篇引用了 OpenMAIC 课堂版 entity（路径含 `/classroom.md`），属于 book_compiler 的路径拼接 bug

### 问题 3: 内容质量问题 (抽样发现)

从 Playwright 抽样 20 篇（每章 1 篇）的渲染结果看：
- 所有文章结构完整（h1 + article + 正文）
- 所有文章有 footer prev/next 导航
- 所有文章有右侧 TOC 目录
- 未发现布局错乱或渲染异常

---

## 三、修复方案

### Step 1: 修复 Entity 缺失

```bash
# 1. 检查 book_compiler 的 slug 生成逻辑
# 对于 ch01-195 和 ch01-448，slug 过长导致 entity 文件名超长
# 需要在 book_compiler 中限制 slug 长度

# 2. 对于 ch07-062 和 ch01-174，修复路径拼接
# 当前: entities/xxx/classroom.md (错误)
# 应为: entities/xxx.md (正确)
```

### Step 2: 清理孤儿文件

```bash
# 删除 site/ 中的孤儿文件
rm /Users/jinguo/wiki-book/site/ch01-003-5-things-to-know-about-the-clarity-act.html
```

### Step 3: 重新构建 Docker

```bash
cd ~/wiki-book
# 重新构建（会清除 site/ 中的孤儿文件）
docker compose up -d --build
```

### Step 4: 验证修复

```bash
# 用 curl 检查所有文章的 HTTP 状态
cd ~/wiki-book/site
for f in ch*.html; do
  code=$(curl -sI --max-time 3 "http://localhost:8002/$f" | head -1)
  if [[ "$code" != *"200"* ]]; then
    echo "FAIL: $f -> $code"
  fi
done
```

---

## 四、长期建议

1. **Book Compiler 改进**:
   - slug 长度限制（建议 max 80 字符）
   - 路径拼接时避免子目录引用（`/classroom.md`）
   - 构建前自动检测 entity 是否存在

2. **CI 集成**:
   - 在 `scripts/deploy.sh` 中加入 HTTP 状态码检测
   - 构建后自动运行 `wiki-lint.mjs` 检查 entity 引用

3. **定期清理**:
   - 每次 Docker 构建前清理 `site/` 目录
   - 定期检查 `docs/` 和 `site/` 的文件一致性

---

*报告生成: Hermes Agent | 2026-06-29*
