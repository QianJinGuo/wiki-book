# RAG 架构迁移方案（不升级 Workers）

> 目标：在不升级 Workers Paid（$5/月）的前提下，彻底解决 Phase 3 语义搜索 + 4 个工程困境。
> 核心思路：**把 AI 计算从 Pages Function 移到客户端浏览器，Pages Function 退化为纯 I/O 静态资源服务。**

---

## 0. 核心判断

5 个困境同源：

```
困境 1 (Phase 3 CPU 锁死)     ← 服务端调 AI/Vectorize 超 10ms
困境 2 (wrangler.toml 漂移)    ← 服务端需要 AI 绑定才会暴露这个漂移
困境 3 (Docker RAG 404)        ← 前端写死依赖服务端 /rag-query 端点
困境 4 (E2E 测试缺失)          ← 测试围绕服务端端点设计
困境 5 (索引不同步)            ← R2 索引与站点各自更新、无绑定
```

一旦把 RAG 计算移到客户端：
- 困境 1 消失（客户端无 CPU 限制）
- 困境 2 降级（服务端不再需要 AI/Vectorize 绑定，只需 R2）
- 困境 3 消失（客户端自带关键词搜索，本地/Docker 也能跑）
- 困境 4 简化（测试直接验证客户端检索结果）
- 困境 5 用构建时绑定解决（embedding 与 search_index 同一次构建产出）

---

## 1. 架构总览

```
旧: 浏览器 → Pages Function [关键词+reranker+embedding+vectorize, 10ms CPU 锁死] → R2/Vectorize/Workers AI
新: 浏览器 [关键词+向量检索+reranker 全在客户端] + Pages Function [纯 I/O 流式传文件] → R2 [search_index + 预计算 embedding 分片]
```

| 层 | 旧 | 新 |
|----|----|----|
| 浏览器 | 只发 `/rag-query?q=...` | 关键词搜索 + 向量检索 + reranker 全在客户端 |
| Pages Function | 调 Workers AI / Vectorize（撞 10ms） | 只 `env.R2.get()` 流式吐文件（纯 I/O，不耗 CPU） |
| R2 | search_index.json | search_index.json + 预计算 int8 embedding 分片 + manifest |
| 构建时 | 仅 mkdocs build | 额外离线生成 embedding（用 CF AI REST API，不占运行时 CPU） |

**关键洞察**：Cloudflare 10ms 限制的是 **CPU 时间**，不是 wall-clock。`env.R2.get().body` 流式返回是纯 I/O 等待，不计 CPU。所以 Pages Function 当"静态文件网关"完全合规且零风险。

---

## 2. 困境逐条解法

### 困境 1：Phase 3 被 10ms CPU 锁死 → 客户端语义搜索

分两档，可渐进：

#### Tier 1（轻量，先做，零模型加载）：预计算语义近邻图

构建时离线算好"每篇文档的语义 top-20 近邻"，存成查表 JSON。运行时关键词命中 doc → 查表扩展召回。

- 能力：扩展关键词召回（"Agent 记忆"→ 命中"记忆"文章 → 自动带出"上下文管理""长程记忆"等语义近邻）
- 局限：不能对 query 本身做语义匹配（英文问中文仍漏）→ 需 Tier 2

#### Tier 2（完整语义，主方案）：客户端 query embedding + 向量检索

**构建时（离线，不占 Pages CPU）：**
```bash
python3 scripts/build-embeddings-static.py
```
改造自现有 `build-vectorize.py`，但产物从"写 Vectorize 索引"改为"生成本地静态文件"：
- 用 Cloudflare AI REST API（`https://api.cloudflare.com/.../ai/run/@cf/baai/bge-m3`）批量生成所有文档 embedding
- **量化 int8**：每维 float32 → int8（存 per-vector scale），37K×1024×1byte = 38MB；改用 384 维小模型则 14MB
- **分片**：切成 ~1MB 的 shard（`embeddings/shard_000.bin` ... `shard_013.bin`）
- 生成 `embeddings/manifest.json`：`{ dims, shards, doc_ids, scales }`
- 上传 R2（带版本号 `embeddings/v{timestamp}/`）

**运行时（客户端）：**
新增 `overrides/assets/javascripts/rag-client.js`：
1. 首次使用 → 后台加载 embedding 分片到 **IndexedDB**（~14-38MB，永久缓存，带版本号失效）
2. query → **transformers.js** 加载 `Xenova/multilingual-e5-small`（int8 ~120MB，缓存到 Cache Storage，二次访问秒加载）生成 query embedding
3. Web Worker 里做 cosine 检索 top-30
4. 与关键词结果融合（去重，向量分 ×0.7 + 关键词分 ×0.3）
5. 可选 reranker：transformers.js 加载 `Xenova/bge-reranker-base`，或直接用融合分（省一个模型）

**模型选择务实建议：**
- 主推 `Xenova/multilingual-e5-small`（384 维，中英支持，int8 ~120MB）
- 不要在浏览器跑 bge-m3（568M 参数太重）
- reranker 可选；不加 reranker 仅用融合分也能解决 80% 场景

**为什么这彻底绕开限制：**
- query embedding 在用户浏览器跑 → 不消耗 Cloudflare 任何 CPU
- 向量检索在 Web Worker 跑 → 37K×384 cosine ~50-100ms，用户无感
- Pages Function 只 `env.R2.get("embeddings/shard_000.bin")` 流式返回 → 纯 I/O

### 困境 2：双 wrangler.toml 漂移 → 单一配置源

新架构下服务端不再需要 AI / Vectorize 绑定（计算都在客户端），所以两个 wrangler.toml 应该收敛成**同一个最小配置**：

```toml
# wrangler.toml（根目录，唯一真相源）
name = "ai-engineering"
pages_build_output_dir = "./site"

[[r2_buckets]]
binding = "SEARCH_INDEX"
bucket_name = "ai-engineering-search"
```

**操作：**
1. 把根目录 `wrangler.toml` 精简为上面这个（删掉 `[[vectorize]]` 和 `[ai]`）
2. 删除 `deploy/cloudflare/wrangler.toml`
3. `deploy/cloudflare/deploy.sh` 改为 `--config ../wrangler.toml` 或直接 cd 到根目录部署
4. 用 symlink 兜底：`deploy/cloudflare/wrangler.toml → ../../wrangler.toml`（防止再漂移）

**收益**：Vectorize 索引和 Workers AI 绑定彻底移出生产路径，配置漂移这个"最危险的 bug"物理消失。

### 困境 3：Docker 本地 RAG 404 → 环境感知 + 客户端兜底

`ai-chat.js` 写死 `RAG_URL = "/rag-query"`，Docker 没这个端点。新架构下客户端自带搜索能力，直接解决：

```javascript
// ai-chat.js 改造
function detectRagMode() {
  var host = location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "client";   // Docker/本地：纯客户端关键词搜索，无需端点
  }
  return "client";     // 生产也走客户端（新架构统一）
}
```

本地环境：客户端从 `site/search/search_index.json`（Docker 里有完整版，68MB，本地无所谓）加载做关键词搜索。生产：从 R2 经 Pages Function 加载裁剪版。

**额外兜底**：`nginx.conf` 加一条，本地 `/rag-query` 直接返回静态 JSON，防止旧逻辑残留 404：
```nginx
location = /rag-query {
    default_type application/json;
    return 200 '{"results":[],"source":"client"}';
}
```

### 困境 4：E2E 测试缺失 → 真实查询 + 相关性验证

现有 `test-rag.mjs` 只检查 `RAG_URL` 字符串存在。改造为真实发查询 + 验证结果质量：

```javascript
// test-rag.mjs 改造核心
// 1. 真实查询
const resp = await page.request.get(LOCAL_URL + "/rag-query?q=" + encodeURIComponent("Agent 记忆类型"));
const data = await resp.json();

// 2. 验证返回结构
assert(data.results, "results 字段存在");
assert(Array.isArray(data.results), "results 是数组");
assert(data.results.length > 0, "至少 1 条结果");
assert(data.results.length <= 5, "不超过 top_k");
assert(data.results[0].title, "每条有 title");
assert(data.results[0].location, "每条有 location");

// 3. 验证相关性（关键词命中）
const topTitle = data.results[0].title;
assert(topTitle.includes("记忆") || topTitle.includes("Agent"),
       "top1 标题与查询相关");

// 4. 多组查询覆盖不同场景
const cases = [
  { q: "MCP 协议", expect: ["MCP", "协议", "Model Context"] },
  { q: "hallucination 幻觉", expect: ["幻觉", "hallucination"] },  // 跨语言（Tier 2 才过）
  { q: "工具调用", expect: ["工具", "function", "tool"] },
];
```

**客户端模式测试**：直接在 Playwright 里 `page.evaluate(() => window.ragClient.search("..."))` 验证客户端检索结果，不依赖端点。

### 困境 5：索引不同步 → 构建时原子绑定

把 embedding 生成和 search_index 上传绑进 `scripts/build.sh`，站点构建 = 索引构建，同一次产物：

```bash
# scripts/build.sh 末尾追加
echo "=== 构建搜索索引 + embedding ==="
python3 scripts/build-embeddings-static.py   # 生成 embedding 分片
python3 scripts/slim-search-index.py          # 裁剪 search_index（已有）
python3 scripts/upload-search-assets.py       # 统一上传 R2（search_index + embedding 分片 + manifest），带版本号
```

`upload-search-assets.py` 关键逻辑：
- 上传到 `embeddings/v{build_timestamp}/` 和 `search_index/v{build_timestamp}.json`
- 更新 `manifest.json` 指向最新版本
- 客户端首次加载读 `manifest.json` 获取当前版本，IndexedDB 缓存按版本失效
- 保留最近 3 个版本（回滚用），老的删除

**原子性保证**：build.sh 一次性产出 site/ + R2 资产。部署 site 和上传 R2 在同一脚本内顺序执行，失败则整体回滚（R2 版本号机制天然支持）。

---

## 3. 实施顺序（建议）

```
Step 1 (1h)   困境 2: 收敛 wrangler.toml 为单一最小配置 → 消除最危险 bug
Step 2 (1h)   困境 3: ai-chat.js 环境感知 + nginx 兜底 → 本地能跑
Step 3 (2h)   困境 4: test-rag.mjs 真实查询测试 → 有验证基线
Step 4 (2h)   困境 1 Tier 1: 预计算近邻图 + 客户端关键词搜索 → 纯客户端 RAG 跑通
              ↑ 到这里 5 个困境已全部解决，生产可用（关键词+近邻扩展）
Step 5 (4h)   困境 1 Tier 2: build-embeddings-static.py + rag-client.js + transformers.js → 完整语义搜索
Step 6 (1h)   困境 5: build.sh 绑定 + R2 版本化 → 索引自动同步
```

**Step 1-4 完成 = 5 困境全部解决，生产可用**（覆盖专有名词、短概念、近邻扩展）。Step 5-6 是能力增强（跨语言、口语化匹配）和运维自动化。

---

## 4. 风险与验证

| 风险 | 缓解 |
|------|------|
| transformers.js 首次加载 120MB 模型慢 | Cache Storage 永久缓存；按需加载（用户首次提问后才拉）；降级到 Tier 1 |
| 37K 向量客户端检索卡顿 | 放 Web Worker 不阻塞主线程；int8 量化；IndexedDB 缓存 |
| R2 embedding 分片加载流量 | 分片按需加载（先加载 manifest + doc_id 索引，命中相关分片才拉）；CDN 缓存 |
| 离线 embedding 生成耗时长 | 复用现有 build-vectorize.py 的批量逻辑；37K 文档 ~30min 一次性；只在内容变更时跑 |
| 客户端模型与离线模型不一致 | 强制用同一模型（multilingual-e5-small），manifest 记录模型名+版本，不匹配则重新生成 |

**验证清单：**
```
□ Docker 本地 AI Chat 能搜索（困境 3）
□ 生产 /rag-query 返回客户端可用的静态资源（困境 1）
□ test-rag.mjs 真实查询通过（困境 4）
□ deploy.sh cloudflare 部署后搜索正常（困境 2）
□ 内容更新后 build.sh 自动同步索引（困境 5）
□ 跨语言查询 "hallucination" 能命中中文"幻觉"文章（Tier 2）
```

---

## 5. 与现有代码的对应改造点

| 现有文件 | 改造 |
|---------|------|
| `functions/rag-query.js` | 简化为只读 R2 静态资源；或保留作 fallback 端点（纯关键词，不调 AI） |
| `functions/search/search_index.json.js` | 保留，新增 `functions/embeddings/[shard].js` 同款流式读取 |
| `overrides/assets/javascripts/ai-chat.js` | `RAG_URL` → 改调 `window.ragClient.search(q)` |
| `overrides/assets/javascripts/rag-client.js` | **新增**：客户端 RAG 引擎（关键词 + 向量 + 融合） |
| `scripts/build-vectorize.py` | 改造为 `scripts/build-embeddings-static.py`（产物从 Vectorize 改本地文件） |
| `scripts/build.sh` | 末尾追加 embedding 生成 + R2 上传 |
| `wrangler.toml` | 精简为仅 R2 绑定 |
| `deploy/cloudflare/wrangler.toml` | 删除（用 symlink 指向根目录） |
| `test-rag.mjs` | 改造为真实查询 + 相关性断言 |
| `nginx.conf` | 加 `/rag-query` 静态 JSON 兜底 |

---

*方案制定：2026-07-02*
*前提：不升级 Workers Paid，Free 计划内彻底解决*

---

## 6. 可行性评估（2026-07-02）

> 基于对方案逐条逻辑、技术约束和工程代价的独立分析。

### 6.1 核心前提验证

| 论点 | 判断 | 依据 |
|------|------|------|
| R2 流式读取不计 CPU | ✅ 正确 | Cloudflare 文档明确：CPU time = 计算时间，I/O 等待不计入 |
| 客户端 transformers.js 跑 embedding 模型 | ✅ 可行 | multilingual-e5-small (int8 ~120MB) 已被社区验证 |
| 37K×384 维向量客户端 cosine 搜索 < 100ms | ⚠️ 桌面端 ✅，移动端需实测 | TypedArray + Web Worker 下 14M 次浮点运算约 50-100ms |

### 6.2 逐困境解法评估

#### 困境 1（Phase 3 被 Free 锁死）— 客户端语义搜索

**Tier 1（预计算近邻图）：✅ 可行，零模型加载，推荐先做**
- 不需要浏览器加载任何 ML 模型
- 查询时：关键词命中 doc → 查表扩展 top-20 近邻 → 零额外延迟
- O(n²) 离线计算成本：37K²/2 ≈ 684M 次余弦比较，用 numpy/scipy 在 M1 MacBook 预计 **2-4 小时**
- 对比 Workers AI API 速率限制（~50 req/s），本地 numpy 向量化运算快数个数量级

**Tier 2（transformers.js 客户端 embedding）：⚠️ 可行但需评估代价**

| 风险点 | 严重程度 | 缓解措施 |
|--------|---------|---------|
| 首次加载 ~120MB 模型 | **高**——用户首次提问需等 5-15s 下载 | Cache Storage 永久缓存；显示加载进度；超时自动降级到 Tier 1 |
| iOS Safari IndexedDB 限额 | **中**——~50MB 可用，38MB 接近边界 | int8 分片 + 仅缓存最近使用的 shard |
| ONNX 模型加载失败（WebGL 不支持等） | **中**——旧浏览器、无头模式 | 渐进增强：transformers.js 失败 → 自动降级 Tier 1 |
| 多 Tab 内存叠加 | **中**——每 Tab ~160MB（模型120+embedding38） | 用 Service Worker 共享模型实例；或 `navigator.locks` 协调 |
| 浏览器与离线 embedding 不一致 | **低**——同一 ONNX 模型版本一致 | manifest 记录模型 sha256，版本不匹配时降级 |

#### 困境 2（双 wrangler.toml 漂移）— ✅ 解法最干净

服务端不再需要 AI/Vectorize 绑定后，两个 wrangler.toml 自然收敛为同一最小配置。删除 `deploy/cloudflare/wrangler.toml` 用 symlink 指向根目录即可物理消除漂移源。

**成本极低，收益极大，安全无副作用。可立即执行，不依赖其他步骤。**

#### 困境 3（Docker RAG 404）— ✅ 客户端搜索天然解

客户端 RAG 对运行环境透明（浏览器能跑 JS 就行）。Docker / GitHub Pages / localhost 全部自动可用。nginx 兜底条是额外安全网。

#### 困境 4（E2E 测试缺失）— ✅ 改造后更易验证

客户端搜索的测试更简单：不需要 mock 服务端端点，直接 `page.evaluate(() => window.ragClient.search(q))` 验证结果，比当前依赖 `/rag-query` 端点的测试更健壮。

#### 困境 5（索引不同步）— ⚠️ 原子性需小心设计

`build.sh` 里 mkdocs build 后执行 embedding 生成 + R2 上传。如果中途失败，site 已更新但搜索索引不一致。

**建议方案：** 两步原子提交
1. 先上传到 `v{timestamp}/` 临时路径
2. 全部成功后再原子切换 manifest 指针
3. 保留最近 3 个版本自然支持回滚

### 6.3 实施顺序评估

```
Step 1 (1h)  wrangler.toml 收敛          ← 安全无副作用，可立即做
Step 2 (1h)  ai-chat.js 环境感知         ← 简单改造，独立可测试
Step 3 (2h)  test-rag.mjs 真实测试       ← 验证基线，预防回归
Step 4 (2h)  Tier 1 近邻图               ← 核心能力上线
              ↑ 到这里 5 个困境全部解决，生产可用
Step 5 (4h)  Tier 2 transformers.js      ← 增强能力（跨语言匹配）
Step 6 (1h)  build.sh 绑定               ← 运维自动化
```

**Step 1-4 合计 ~6h，确实能解决全部 5 个困境**。每步可独立验证、独立部署、独立回退。工时估算合理，但 Tier 1 的离线近邻图预计算（2-4h）未计入"构建机环境准备"时间。

### 6.4 与"升级 Workers Paid"对比

| 维度 | 客户端 RAG 迁移方案 | 升级 Workers Paid ($5/月) |
|------|-------------------|-------------------------|
| 持续成本 | $0 | $5/月（$60/年） |
| 实施工时 | ~12h（含验证） | ~0.5h（改计划 + 验证） |
| 维护复杂度 | **高**——JS 模型 + IndexedDB + 缓存策略 | **低**——现有代码不变 |
| 首次查询延迟 | ~5-15s（下载模型） | ~1-2s（当前水平） |
| 后续查询延迟 | ~100-300ms | ~1-2s |
| 移动端支持 | ⚠️ 需调试 | ✅ 无影响 |
| 多设备一致性 | 每个浏览器独立缓存 | 服务端统一 |
| 离线可用 | ✅ 是（IndexedDB 缓存后） | ❌ 否 |
| 代码复杂度 | 新增 rag-client.js + Web Worker | 不新增代码 |

### 6.5 结论

**技术可行性：✅ 完全可行。** 没有原理性障碍，Tier 1 和三方库生态已经过验证。

**工程合理性：⚖️ 12h 工时 vs $60/年的权衡。**
- 如果 wiki-book 是个人项目且用户不介意 $5/月，升级 Workers Paid 是性价比最高的选择——0.5h 工时 vs 12h+ 工时，代码复杂度最低。
- 如果要保持 **$0 成本**、或需要 **离线可用**、或把这个项目当作工程实验场，这个迁移方案是合理的。

**建议渐进式路径，每步可独立回退：**
1. 先做 Step 1-2-3（~4h，无风险，解决 wrangler 漂移 + Docker 404 + 测试缺失）
2. 再做 Tier 1 近邻图（~3h，零模型加载，立即可用）
3. Tier 2 作为可选增强，上线充分测试后再推送

### 6.6 新增风险清单

| # | 风险 | 触发条件 | 影响 | 缓解 |
|---|------|---------|------|------|
| R1 | transformers.js 模型下载失败 | WebGL/WebGPU 不支持、Safari、内存不足 | 语义搜索不可用 | 降级到 Tier 1 近邻图；超时 10s 自动降级 |
| R2 | 多 Tab 内存累积 | 用户打开 3+ Tab 同时提问 | 浏览器 OOM | Service Worker 共享模型实例 |
| R3 | 部分文档更新后 embedding 过期 | 新增/修改文档但未全量重建 | 新文档搜索不到 | 增量 update API；标记版本不匹配时降级到关键词 |
| R4 | 跨域模型加载失败 | GitHub Pages 部署 + CDN 无 CORS header | Tier 2 不可用 | 将模型托管到同域 R2 + Pages Function 代理 |
| R5 | ONNX Runtime Web 版本更新 break | 依赖升级 | 语义搜索不可用 | 固定 ONNX Runtime 版本号；CI 测试 |

### 6.7 验证清单（更新版）

```
□ Step 1: deploy.sh cloudflare 部署后，wrangler.toml 唯一化（困境 2）
□ Step 2: Docker 本地 AI Chat 能搜索（困境 3）
□ Step 3: test-rag.mjs 真实查询通过（困境 4）
□ Step 4: 近邻图扩展后，概念关联查询召回率提升（困境 1）
□ Step 5: Web Worker 中 37K 向量检索 < 200ms（桌面端）
□ Step 5: iOS Safari 上 transformers.js 模型加载成功
□ Step 5: 跨语言查询 "hallucination" 能命中中文"幻觉"文章
□ Step 6: 内容更新后 build.sh 自动同步索引（困境 5）
□ 多 Tab 打开时内存 < 400MB
□ 降级路径验证：transformers.js 加载失败后自动使用 Tier 1
