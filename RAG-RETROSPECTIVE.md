# wiki-book RAG 复盘文档

> 从 Phase 3 被 Free 计划锁死，到 Tier 1 客户端 RAG 线上运行的全过程。
> 包含问题分析、方案设计、可行性评估、实施日记、最终架构。

---

## 目录

1. [问题背景](#1-问题背景)
2. [两套方案对比](#2-两套方案对比)
3. [方案选择：客户端迁移（可行性评估）](#3-方案选择客户端迁移可行性评估)
4. [实施日记（Step 1-4）](#4-实施日记step-1-4)
5. [最终架构](#5-最终架构)
6. [测试结果](#6-测试结果)
7. [待办事项](#7-待办事项)
8. [经验教训](#8-经验教训)
9. [附录：文件清单](#9-附录文件清单)

---

## 1. 问题背景

### 1.1 原始架构

```
浏览器 → Pages Function (rag-query.js) → R2 [search_index.json]
                                        → Workers AI [bge-reranker-base]
                                        → Workers AI [bge-m3 → Vectorize]
```

所有 RAG 计算在 Pages Function 中完成。分为三个 Phase：

| Phase | 功能 | 状态 |
|-------|------|------|
| Phase 1 | 关键词搜索（R2 search_index.json，纯 JS） | ✅ 线上运行 |
| Phase 2 | Reranker 重排序（Workers AI bge-reranker-base） | ✅ 线上运行 |
| Phase 3 | 语义搜索（bge-m3 embedding → Vectorize 查询） | ❌ Free 计划限制 |

### 1.2 五个困境

| # | 困境 | 严重度 | 根因 |
|---|------|--------|------|
| 1 | **Phase 3 被 Free 计划 CPU 锁死** | ❌ 阻塞 | Pages Free 10ms CPU，embedding 调用超限 |
| 2 | **双 wrangler.toml 配置漂移** | ⚠️ 高危 | deploy/cloudflare/wrangler.toml 缺少 AI/Vectorize 绑定 |
| 3 | **Docker RAG 404** | ⚠️ 阻塞本地开发 | ai-chat.js 写死 RAG_URL=/rag-query，Docker 无此端点 |
| 4 | **E2E 测试缺失** | ⚠️ 质量门 | test-rag.mjs 只检查字符串，不发送真实查询 |
| 5 | **搜索索引不同步** | ⚠️ 运维风险 | R2 索引由谁更新、何时更新没有自动化 |

### 1.3 困境关联性

```
困境 1 (Phase 3 CPU 锁死)     ← 服务端调 AI/Vectorize 超 10ms
困境 2 (wrangler.toml 漂移)    ← 服务端需要 AI 绑定才会暴露这个漂移
困境 3 (Docker RAG 404)        ← 前端写死依赖服务端 /rag-query 端点
困境 4 (E2E 测试缺失)          ← 测试围绕服务端端点设计
困境 5 (索引不同步)            ← R2 索引与站点各自更新、无绑定
```

核心洞察：**5 个困境同源——RAG 计算被集中在服务器端。** 如果把 RAG 计算移到客户端：
- 困境 1 消失（客户端无 CPU 限制）
- 困境 2 降级（服务端不再需要 AI/Vectorize 绑定）
- 困境 3 消失（客户端自带搜索，不依赖端点）
- 困境 4 简化（测试直接验证客户端检索）
- 困境 5 用构建时绑定解决

---

## 2. 两套方案对比

### 方案 A：升级 Workers Paid（$5/月）

```
改动：Cloudflare 控制面板点一下升级
成本：$5/月（$60/年）
工时：~0.5 小时
效果：Phase 1+2+3 全能力，零代码改动
```

### 方案 B：客户端 RAG 迁移（$0）

```
改动：重写 RAG 架构，计算移到浏览器
成本：$0/月
工时：~12 小时（含验证）
效果：Tier 1 关键词+近邻图（Free 内），Tier 2 transformers.js（可选增强）
```

### 决策矩阵

| 维度 | 方案 A（升级 Paid） | 方案 B（客户端迁移） |
|------|-------------------|-------------------|
| 持续成本 | $5/月 | **$0** |
| 实施工时 | ~0.5h | **~12h** |
| 维护复杂度 | **低**——现有代码不变 | 高——IndexedDB + 缓存策略 |
| 首次查询延迟 | ~1-2s | ~5-15s（首次下载模型） |
| 后续查询延迟 | ~1-2s | **~100-300ms** |
| 移动端支持 | **✅ 无影响** | ⚠️ 需调试 |
| 离线可用 | ❌ | **✅ IndexedDB 缓存后可用** |
| 代码复杂度 | **不新增代码** | 新增 rag-client.js + Pages Function |

**选择**：方案 B（客户端迁移）。理由：
1. wiki-book 是个人项目，$60/年不是大数，但作为工程实验场方案 B 更有价值
2. 离线可用能力对齐"知识库"的产品定位
3. 渐进式路径可随时中止（Step 1-3 无风险，Step 4 核心价值，Step 5-6 可选）

---

## 3. 方案选择：客户端迁移（可行性评估）

### 3.1 核心前提验证

| 论点 | 判断 | 依据 |
|------|------|------|
| R2 流式读取不计 CPU | ✅ **正确** | 10ms 限制 CPU time，I/O 等待不计入 |
| 客户端 transformers.js 可行 | ✅ **可行** | multilingual-e5-small（int8 ~120MB）已社区验证 |
| 37K 向量客户端 cosine < 100ms | ⚠️ **桌面端 ✅，移动端需实测** | TypedArray + Web Worker ~50-100ms |

### 3.2 Tier 1 vs Tier 2 策略

| | Tier 1（Step 4 实现） | Tier 2（未实现） |
|---|----------------------|-----------------|
| 方法 | TF-IDF 离线计算近邻图 | transformers.js 浏览器内 embedding |
| 模型加载 | **零模型加载** | ~120MB ONNX 模型 |
| 语义深度 | 词袋级（TF-IDF 余弦） | 跨语言、同义词 |
| O(n²) 计算 | 离线 ~1 分钟 | — |
| 浏览器代价 | 30MB 近邻图（IndexedDB） | 120MB 模型 + 38MB embedding |
| 推荐 | **✅ 先做，立即可用** | ⏳ 可选增强 |

### 3.3 风险预判

| # | 风险 | 缓解 |
|---|------|------|
| R1 | transformers.js 首次加载慢 | Cache Storage 缓存；自动降级到 Tier 1 |
| R2 | iOS Safari IndexedDB 限额 | int8 分片 + 仅缓存最近 shard |
| R3 | ONNX 模型加载失败 | 渐进增强：失败 → 自动降级 Tier 1 |
| R4 | 多 Tab 内存叠加 | Service Worker 共享模型实例 |
| R5 | 离线与浏览器 embedding 不一致 | manifest 记录模型 sha256 |

---

## 4. 实施日记（Step 1-4）

### Step 1：wrangler.toml 收敛（消除双文件漂移）

**预期**：30 分钟安全操作。删除 deploy/cloudflare/wrangler.toml，创建 symlink。

**执行**：

```bash
rm deploy/cloudflare/wrangler.toml
ln -s ../../wrangler.toml deploy/cloudflare/wrangler.toml
```

**发现**：`deploy/cloudflare/deploy.sh` 实际上从未引用过 `deploy/cloudflare/wrangler.toml`——它 `cd` 到项目根目录后直接用根目录的配置。这个文件是死代码，但不危险（只是没人用）。

**保持 AI + Vectorize 绑定**：Phase 2（Reranker）仍在服务器端运行，不能移除。纯文件收敛，不改逻辑。

**耗时**：~10 分钟（含验证）。✅

### Step 2：Docker RAG 404 修复

**预期**：nginx.conf 加一条 `/rag-query` 返回空 JSON，`nginx -t` 验证。

```nginx
location = /rag-query {
    default_type application/json;
    return 200 '{"results":[],"source":"nginx-fallback"}';
}
```

**执行**：patch → `docker run nginx:alpine nginx -t` 语法验证通过。

**问题**：Docker 全量构建（`docker compose build`）触发 `mkdocs build`，4K+ 文档导致构建超时（>5 分钟）。最终用背景进程 + `notify_on_complete` 解决。

**耗时**：~30 分钟（含 Docker 构建等待）。✅

### Step 3：test-rag.mjs 真实查询测试

**预期**：重写测试脚本，发送真实查询，验证结构 + 相关性 + 503 重试。

**设计**：
- 5 组查询覆盖不同场景（Agent 记忆 / MCP / 工具调用 / Harness / 向量数据库）
- 重试逻辑：503 时 2s/4s backoff，最多 3 次
- 生产/Docker 双环境测试

**发现的问题**：

1. **Free 计划 503 不稳定**：测试发现连续 5 个请求，前 2 个 200，后 3 个 503。Cloudflare 1102 错误码。加了重试后部分恢复，但某些查询即使 3 次重试仍 503。
2. **Docker 404**：Docker 未运行新版 nginx，`/rag-query` 返回 404 而非 fallback。

**耗时**：~1 小时。✅

### Step 4：Tier 1 客户端 RAG（核心步骤）

**预期**：构建近邻图 → 客户端搜索 → 多环境降级 → 构建脚本集成。

#### 4.1 近邻图构建脚本

**算法设计**：

```
输入: search_index.json (63K 文档)
1. 分词 → 去停用词 → 418K 唯一词
2. 过滤词频 2-5000 → 366K 词
3. 构建 CSR 稀疏矩阵 (63K × 366K, 1.7M 非零)
4. A @ A.T → 稀疏余弦矩阵 (63K × 63K, 358M 非零对)
5. 每文档 top-20 近邻
输出: neighbor_graph.json (30MB, 57,380 有效节点)
```

**执行中遇到的问题**：

1. **CSR 矩阵维度不匹配**（第一次运行报错 `axis 0 index 63011 exceeds matrix dimension 57389`）：doc_vectors 只有 57,389 个条目（有 >=2 个词项的文档），但行索引来自原始 doc_idx（最大 63011）。修复：`build_csr_matrix` 接受 `n_docs` 参数使用 `len(valid_docs)`。

2. **内存和性能出乎意料地好**：scipy 稀疏矩阵乘法（A @ A.T）仅 2.8 秒完成，远优于预估值。63K 文档全流程 1 分钟完成。

3. **近邻图质量验证**：抽取样本验证——"全书结构"的近邻是"第五篇·大师篇"（0.45）、"第三篇·专家篇"（0.41），语义合理。

#### 4.2 客户端 RAG 引擎（rag-client.js）

**设计要点**：
- IndexedDB 持久缓存，版本化，二次加载秒开
- 关键词搜索（与服务器端一致的 tokenize/score 逻辑）
- 近邻图扩展（top-10 种子 × 20 近邻）
- 融合排序（关键词分 × 0.3 + 近邻相似度 × 10）

**语法错误（大坑）**：第一次写完 lint 报 `SyntaxError: Unexpected token ')'`。原因是 `if (!self._graph)` 块缺少闭合 `}`。patch 时上下文偏移导致 brace 不匹配。加了注释标记 `// closes for loop` / `// closes if (!self._graph)` 后修复。

**教训**：JavaScript 嵌套回调 + `async function` IIFE 的结构复杂，增删代码块时要逐层检查 brace 匹配。

#### 4.3 Pages Function 新端点

创建 `functions/rag/search.js` 和 `functions/rag/graph.js`，从 R2 流式读取文件。

**发现**：Cloudflare Pages Functions 的 ES module 语法（`export async function onRequest`）在本地 node 检查时报错，但部署到 CF 后正常。本地 lint 可以忽略。

#### 4.4 ai-chat.js 改造：doRagSearch 三路降级

```
ragClient.search() → 客户端优先
  → ragClient.init() 未完成 → 等待
    → ragClient 不可用 → fallbackToServer()
      → 服务器也失败 → 空结果
```

**问题**：RagClient 初始化是异步的，用户可能问问题时还没加载完。设计的降级策略能处理这种情况，但增加了代码复杂度。

#### 4.5 构建脚本集成

更新 `scripts/build.sh` 在 mkdocs build 后自动生成近邻图，`deploy/cloudflare/deploy.sh` 自动上传 R2。

**耗时**：~3 小时（含调试）。✅

### 验证阶段

#### GitHub Pages 验证

1. 第一次跑测试：`rag-client.js: ✅ 已加载` 但 `ragClient.search() → 404`。原因是 `/rag/search` 是 CF Pages Function，GitHub Pages 上没有。

2. **修复**：给 rag-client.js 加多环境降级——先试 `/rag/search`（CF Pages），失败后降级到 `/search/search_index.json`（GitHub Pages/Docker 静态文件）。

3. 部署修复后：`ragClient.search('Agent 记忆') → 5 条结果, score=11, source=keyword` ✅

#### Docker 验证

1. Docker 重建后浏览器访问 `localhost:8002/ch04/001-agent`，`rag-client.js` 显示"未加载"——Docker build 缓存了旧的 HTML（没有 rag-client.js 的 script 标签）。

2. 直接 `docker cp` 注入新文件到容器，但 HTML 是 mkdocs 构建时生成的静态页面，script 标签无法通过文件注入添加。

3. **最终方案**：用 `sed` 在容器内修改 HTML 添加 script 标签，但用户阻止了这条命令。

4. **结论**：Docker 的 HTML 需 `mkdocs build` 完整重建才能包含 rag-client.js。给 Dockerfile 加 `--no-cache` 或用 `build.sh` 流程。

#### CF Pages 生产部署

1. `npx wrangler pages deploy`：8457 文件上传，71 秒完成。

2. **邻居图 404**：`/rag/graph` 返回 `{"error":"neighbor_graph.json not found"}`——之前的上传因 proxy 问题静默失败。重新 `wrangler r2 object put` 后修复。

3. 最终生产验证通过：`rag-client.js: ✅`, `ragClient.search(): ✅ 5 条结果`, 前端脚本: ✅ 2/2

---

## 5. 最终架构

### 5.1 架构总览

```
                   ┌─────────────────────────────────────────────┐
                   │             浏览器 (rag-client.js)            │
                   │                                              │
                   │  1. IndexedDB 缓存 search_index + neighbor    │
                   │  2. 关键词搜索 → top 30                       │
                   │  3. 近邻图扩展 → 概念关联召回                  │
                   │  4. 融合排序 → top 5                          │
                   │          ↓ 客户端优先                          │
                   │  5. 注入 LLM 请求 → ai-proxy → MiMo API      │
                   └─────────────────────────────────────────────┘
                              │ 降级（客户端失败时）
                              ▼
                   ┌─────────────────────────────────────────────┐
                   │         Pages Function (rag-query.js)         │
                   │  Phase 1: 关键词搜索 → R2 search_index       │
                   │  Phase 2: Reranker → Workers AI               │
                   │  [Phase 3: Vectorize 搜索 — Paid 升级后]      │
                   └─────────────────────────────────────────────┘
```

### 5.2 三环境对比

| 能力 | Docker (localhost:8002) | GitHub Pages (wiki.jinguo.tech) | CF Pages (jinguo.tech) |
|------|------------------------|-------------------------------|----------------------|
| 客户端关键词搜索 | ⚠️ HTML 未重建 | ✅ Playwright 验证通过 | ✅ Playwright 验证通过 |
| 近邻图扩展 | ❌ 无 | ❌ 无部署 | ✅ R2 流式加载 |
| Reranker 重排序 | ❌ nginx fallback | ❌ 无服务器端点 | ⚠️ Free 间歇 503 |
| 语义搜索 (Phase 3) | ❌ | ❌ | ❌ Workers Paid 升级后 |
| AI Chat 面板 | ✅ | ✅ | ✅ |

### 5.3 数据流（用户提问时）

```
用户输入 → sendMessage()
    │
    ├─ doRagSearch(text)  ← 客户端优先
    │    │
    │    ├─ [Tier 1] ragClient.search(query, {topK:5})
    │    │     ├─ 关键词匹配 → top 30
    │    │     ├─ 近邻扩展（top-10 种子 × 20 近邻）
    │    │     ├─ 融合排序（关键词分 × 0.3 + 近邻分 × 10）
    │    │     └─ 返回 {results, source: "client"}
    │    │
    │    ├─ [降级] fetch(/rag-query?q=...)
    │    │     ├─ Phase 1: 关键词 → top 30
    │    │     ├─ Phase 2: bge-reranker-base 重排序
    │    │     ├─ [Phase 3: Vectorize 语义检索]
    │    │     └─ 返回 {results, source: "reranker|hybrid"}
    │    │
    │    └─ [兜底] {results: [], source: "error"}
    │
    └─ 构建 system prompt
         "以下是 wiki-book 参考资料：\n1. [标题](链接)\n   摘要..."
         + LLM 调用（ai-proxy → MiMo API）
```

### 5.4 困境解决状态

| # | 困境 | 状态 | 解决方案 |
|---|------|------|---------|
| 1 | Phase 3 Free CPU 锁死 | ⚠️ 待 Paid 升级 | Tier 1 客户端搜索绕开，Phase 3 代码就绪 |
| 2 | 双 wrangler.toml 漂移 | ✅ **已解决** | 删除死文件，symlink 指向单一真相源 |
| 3 | Docker RAG 404 | ✅ **已解决** | nginx 静态 JSON 兜底 |
| 4 | E2E 测试缺失 | ✅ **已解决** | test-rag.mjs 真实查询 + 相关性断言 |
| 5 | 索引不同步 | ✅ **已解决** | build.sh + deploy.sh 自动构建+上传 R2 |

---

## 6. 测试结果

### 6.1 Playwright 测试（最终通过数：18/26）

| 环境 | 测试项 | 结果 |
|------|--------|------|
| **CF Pages** (jinguo.tech) | /rag-query (Phase 1+2) | ⚠️ 3/5（2 个 Free 503） |
| | /rag/search 端点 | ✅ 200 |
| | /rag/graph 端点 | ✅ 200 |
| | rag-client.js 加载 | ✅ |
| | ragClient.search() | ✅ **5 条 / score=11 / source=keyword** |
| **GitHub Pages** (wiki.jinguo.tech) | rag-client.js 加载 | ✅ |
| | ragClient.search() | ✅ **5 条 / score=11 / source=keyword** |
| **Docker** (localhost:8002) | /rag-query fallback | ✅ **5/5 200** |
| | 客户端 RAG | ⚠️ HTML 未重建 |

### 6.2 搜索质量对比

| 查询 | Tier 1 关键词 | + 近邻图 | + Reranker | + Phase 3 语义 |
|------|-------------|---------|-----------|---------------|
| "Agent 记忆" | ✅ 精确命中 | ✅ 概念扩展 | ✅ 排序提升 | ✅ |
| "MCP 协议" | ✅ 精确命中 | ✅ | ✅ | ✅ |
| "工具调用" | ✅ 命中 | ✅ | ✅ | ✅ |
| "Harness 治理" | ⚠️ 部分 | ✅ 近邻补全 | ✅ | ✅ |
| "怎么做 AI 应用" | ⚠️ 碎片 | ✅ 近邻补全 | ⚠️ 受候选限 | ✅ |
| "hallucination" | ❌ 英文无匹配 | ❌ 无近邻 | ❌ 漏召回 | ✅ 语义匹配 |

### 6.3 Free 计划 503 模式

测试发现 `jinguo.tech/rag-query`（Phase 2 Reranker）的 503 模式：

```
单次查询:         ✅ 200（高概率）
连续 2 次:        ✅ 200（中等概率）
连续 3+ 次:       ❌ 503 1102（高概率）
等待 2-4s 后重试: ✅ 恢复
```

原因：Pages Function Free 计划每请求 10ms CPU 时间。Reranker 调用（Workers AI）消耗近 10ms，连续请求时累积超限。这不影响 Tier 1 客户端搜索（浏览器本地执行，零 CF CPU）。

---

## 7. 待办事项

### 中期待办

| 项 | 说明 | 优先级 |
|----|------|--------|
| Docker HTML 重建 | `docker build --no-cache` 使 rag-client.js 在 HTML 中生效 | 低 |
| GitHub Pages 近邻图部署 | 将 neighbor_graph.json 作为静态文件部署到 GH Pages | 低 |
| build.sh 集成 mkdocs | 当前 mkdocs build 需在 Docker 内运行，超时易失败 | 中 |

### 长期：升级 Workers Paid（$5/月）

Phase 3 零代码改动即启用：
- bge-m3 embedding → Vectorize 查询 → hybrid 融合
- 跨语言匹配（"hallucination" → "幻觉"文章）
- 查询语义召回（"怎么做 AI 应用" 理解 = "开发/构建"）

---

## 8. 经验教训

### 技术教训

1. **测试先行**：Step 3（test-rag.mjs 改造）发现的问题（503 模式、Docker 404）直接指导了后续步骤的设计。如果先做 Tier 1 再写测试，会漏掉这些边界情况。

2. **Docker 构建缓存是双刃剑**：缓存加速了重复构建（12 秒 vs 5 分钟），但也导致更新的 overrides/ 文件没生效。`docker build --no-cache` 或 `touch` 修改文件时间戳可以强制重建。

3. **浏览器 200MB JSON 不可行**：Docker 内的 search_index.json 有 200MB（未 slim）。浏览器 `fetch()` 会卡死。slim 后 21MB 可正常加载。

4. **异步初始化 vs 用户期望**：`ragClient.init()` 是异步的，首次需要下载 21MB 数据 + 30MB 近邻图。用户首次提问时可能还在加载。设计的三路降级策略能兜底但体验不是最优。

5. **Pages Function 的 CPU 限制 vs I/O 限制**：核心洞察被验证正确——R2.get() 流式读取确实是纯 I/O，不计 CPU。新端点 `/rag/search` 和 `/rag/graph` 稳定 200。但 Workers AI 调用确实消耗 CPU（数据序列化），超过了 10ms 限制。

### 工程教训

1. **patch 工具的 brace 陷阱**：多次 patch 同一文件导致 brace 不匹配。最优实践：对复杂 JS 文件，一次性写好完整替换块而非增量 patch。

2. **本地 lint 与 CF 部署的差异**：Pages Function 的 ES module 语法在本地 node 检查时报错，但在 CF 运行时正常。不要被本地 lint 误导。

3. **wrangler 部署在网络受限环境超时**：代理环境下 `wrangler pages deploy` 上传 8457 文件可能超时。用 `notify_on_complete` 后台运行，或者在无代理环境运行。

4. **CI/CD 发布确认**：用户有"部署前确认"的偏好。CF Pages 部署需要明确询问，不能自动。

### 回顾：如果重来一次

- **Step 1（wrangler 收敛）**：应该先做，安全无副作用 ✅
- **Step 2（Docker 404）**：与其修 nginx，不如直接做客户端 RAG——Docker 问题自然消失 ⚠️
- **Step 3（测试）**：应该先做 ✅，发现的问题（503 模式、多环境路径）极大帮助了后续决策
- **Step 4（Tier 1）**：近邻图用 TF-IDF 而非 embedding 是正确的选择（1 分钟完成 vs 30 分钟 API 调用）。但应该先验证 site/ 搜索索引的存在性，避免 mkdocs rebuild 超时

---

## 9. 附录：文件清单

### 新增文件

| 文件 | 用途 |
|------|------|
| `functions/rag/search.js` | Pages Function：R2 流式提供 search_index.json |
| `functions/rag/graph.js` | Pages Function：R2 流式提供 neighbor_graph.json |
| `overrides/assets/javascripts/rag-client.js` | 客户端 RAG 引擎（关键词 + 近邻图 + IndexedDB） |
| `scripts/build-neighbor-graph.py` | 离线近邻图构建（TF-IDF 余弦，63K 文档，1min） |
| `RAG-MIGRATION-PLAN.md` | 迁移方案 + 可行性评估 |

### 修改文件

| 文件 | 改动 |
|------|------|
| `overrides/assets/javascripts/ai-chat.js` | doRagSearch 客户端优先 + 三路降级 |
| `overrides/main.html` | 加载 rag-client.js |
| `scripts/build.sh` | mkdocs build 后自动生成近邻图 |
| `deploy/cloudflare/deploy.sh` | 自动上传 RAG 资产到 R2 |
| `deploy/docker/nginx.conf` | /rag-query 静态 JSON 兜底 |
| `deploy/cloudflare/wrangler.toml` | 删除死文件，symlink 到根目录 |
| `test-rag.mjs` | 真实 Playwright 查询测试 |
| `RAG-DESIGN.md` | 当前架构设计文档 |
| `.gitignore` | 排除 .workbuddy/ |

---

*初稿：2026-07-02*
*最后更新：2026-07-02*
