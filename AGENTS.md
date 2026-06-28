# AGENTS.md — Wiki-Book 运维手册

## 项目概览

**Wiki-Book** 是基于 wiki 知识库编撰的《AI 工程》电子书，使用 MkDocs Material 构建。

```
站点名称: AI 工程
源文件:   docs/ (4,046 篇文章)
章节:     20 章 (Ch01-Ch20)
域名:     jinguo.tech
仓库:     github.com/QianJinGuo/wiki-book
```

---

## 三环境部署架构

```
docs/ (源文件，共享)
  ↓
MkDocs 构建 → site/ (构建产物)
  ↓
┌─────────────────────────────────────────────────┐
│ Docker (localhost:8002)  │ Dockerfile + nginx.conf │
│ Cloudflare Pages         │ wrangler.toml           │
│ GitHub Pages             │ .github/workflows/      │
└─────────────────────────────────────────────────┘
```

### 环境目录结构

```
deploy/
├── docker/
│   ├── Dockerfile         # 多阶段构建: python→nginx
│   ├── nginx.conf         # 缓存 + 清洁 URL 处理
│   └── docker-compose.yml
├── cloudflare/
│   └── wrangler.toml
└── github/
    └── deploy.yml         # GitHub Actions 工作流

scripts/
├── build.sh               # 共享构建脚本
└── deploy.sh              # 主部署脚本 (docker|cloudflare|github|all)
```

### 环境隔离原则

| 文件类型 | 影响范围 | 修改注意事项 |
|---------|---------|-------------|
| `docs/` | 所有环境 | 源文件，修改后需重新构建所有环境 |
| `site/` | 构建产物 | 不要直接修改，会被覆盖 |
| `deploy/docker/` | 仅 Docker | nginx.conf、Dockerfile |
| `deploy/cloudflare/` | 仅 Cloudflare | wrangler.toml |
| `deploy/github/` | 仅 GitHub Pages | deploy.yml |
| `mkdocs.yml` | 所有环境 | 构建配置 |
| `overrides/` | 所有环境 | MkDocs 主题覆盖 |

### 部署命令

```bash
# 部署全部环境
./scripts/deploy.sh all --build

# 仅部署 Docker
./scripts/deploy.sh docker --build

# 仅部署 Cloudflare
./scripts/deploy.sh cloudflare

# 仅部署 GitHub Pages
./scripts/deploy.sh github

# 手动构建
./scripts/build.sh --clean
```

---

## Cloudflare Pages 配置

### 搜索引擎策略

**问题**: MkDocs 搜索索引 (search_index.json) 原始大小 68.5MB，超过 Cloudflare Pages 25MB 限制。

**解决方案**: 构建后裁剪搜索索引。

```python
# 裁剪策略
- 移除空文本文档
- 文本截断到 80 字符
- location 截断到 50 字符
- JSON 紧凑格式 (无缩进)
- 结果: 21.3MB → Cloudflare 自动压缩到 ~8.4MB
```

**搜索功能状态**:
```
Docker:           ✅ 完整搜索 (68.5MB 索引)
Cloudflare Pages: ✅ 搜索可用 (21.3MB 裁剪索引)
GitHub Pages:     ✅ 完整搜索
```

### 缓存策略

**Cloudflare Pages 默认缓存** (无需额外配置):
```
静态资源 (CSS/JS/图片): 自动 CDN 缓存
HTML 页面:              每次请求回源验证
搜索索引:               浏览器缓存 (首次加载后命中)
```

**Docker (nginx) 缓存**:
```
静态资源:              30天, immutable
搜索索引:              1小时, must-revalidate
HTML:                  无显式缓存
```

### 部署限制

```
单文件大小:  ≤25MB (搜索索引需裁剪)
总站点大小:  无硬限制
带宽:        免费无限
```

---

## 站点内容更新策略

### 更新流程

```
1. 编辑源文件 (docs/*.md)
2. 构建站点 (mkdocs build)
3. 裁剪搜索索引 (如需部署到 Cloudflare)
4. 部署到目标环境
5. 验证链接和搜索
```

### 内容来源

```
wiki 实体 (~/wiki/entities/) → book_compiler → docs/ 文章
手动编辑                    → 直接修改 docs/*.md
```

### 更新频率

```
wiki 实体更新: 每日自动同步 (book_compiler)
手动编辑:     按需
部署:         内容更新后手动触发
```

---

## 验证策略

### Playwright 端到端测试

**规则**: 所有链接修复必须用 Playwright 点击测试，不能只用 curl 或直接访问 URL。

```javascript
// ✅ 正确: 模拟用户操作
browser_navigate("http://localhost:8002/ch01-ai-basics")
browser_click(link_ref)  // 点击文章链接
browser_console("window.location.href")  // 验证跳转

// ❌ 错误: 直接访问目标 URL
browser_navigate("http://localhost:8002/ch01-001-article")
```

### 验证清单

```
□ 按用户描述的步骤完整走一遍
□ 用 Playwright 点击链接 (不是直接访问)
□ 验证目标 URL 正确
□ 验证页面内容加载正常
□ 验证搜索功能可用
□ 检查所有环境 (Docker/Cloudflare/GitHub)
```

### CSS 加载验证

**已知问题**: 子目录页面 CSS 路径可能错误。

**根因**: MkDocs Material 的 `<base href="/">` 标签确保相对路径从站点根目录解析。

**验证方法**:
```javascript
// 检查 CSS 是否正确加载
document.querySelectorAll('link[rel="stylesheet"]')[0].href
// 应该是: http://localhost:8002/assets/stylesheets/...
// 不是:   http://localhost:8002/ch01-xxx/assets/stylesheets/...
```

---

## 已知问题与解决方案

### 1. 尾部斜杠 404

**问题**: `http://localhost:8002/ch01-xxx/` 返回 404。

**解决**: nginx 配置 `location ~ ^(.+)/$` 处理尾部斜杠。

### 2. MkDocs Material 链接拦截

**问题**: 从章节索引页点击链接不跳转。

**原因**: MkDocs Material 的 JavaScript 拦截链接点击进行 SPA 导航。

**解决**: 确保 `<base href="/">` 标签存在 (overrides/main.html)。

### 3. 搜索索引过大

**问题**: search_index.json 超过 Cloudflare Pages 25MB 限制。

**解决**: 构建后裁剪索引 (截断文本到 80 字符)。

### 4. 重复文件

**问题**: 同一文章有中英文两个 slug 版本。

**解决**: 保留中文 slug 版本，删除英文版本。

---

## 快速参考

```bash
# 本地开发
cd ~/wiki-book && docker compose up -d --build

# 部署到 Cloudflare
cd ~/wiki-book && npx wrangler pages deploy site --project-name=ai-engineering

# 验证搜索
curl -sI https://ai-engineering-6yk.pages.dev/search/search_index.json

# 检查链接
curl -sI http://localhost:8002/ch01-001-article | head -1

# Playwright 测试
browser_navigate("http://localhost:8002/ch01-ai-basics")
browser_click(link_ref)
```

---

*更新时间: 2026-06-28*
*维护者: Hermes Agent*
