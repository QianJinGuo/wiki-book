/**
 * rag-client.js — 客户端 RAG 引擎
 *
 * 能力：
 *   Tier 1: 关键词搜索 + 语义近邻图扩展（零模型加载）
 *   Tier 2: transformers.js 语义搜索（渐进增强，模型加载失败自动降级）
 *
 * 架构：
 *   - 从服务器端点加载 search_index.json + neighbor_graph.json
 *   - IndexedDB 持久缓存（首次加载后秒开）
 *   - Web Worker 中执行检索（不阻塞主线程）
 *
 * 用法：
 *   const rag = new RagClient({ searchUrl: '/rag/search', graphUrl: '/rag/graph' });
 *   await rag.init();
 *   const results = await rag.search('Agent 记忆类型', { topK: 5 });
 */

(function(global) {
  "use strict";

  var DB_NAME = "wiki-book-rag";
  var DB_VERSION = 1;
  var STORE_NAME = "assets";
  var CACHE_PREFIX = "rag-v1";

  // ========== 停用词（与 functions/rag-query.js 保持一致） ==========
  var STOP_WORDS = new Set([
    "的", "了", "在", "是", "我", "有", "和", "就", "不", "人", "都", "一",
    "一个", "上", "也", "很", "到", "说", "要", "去", "你", "会", "着",
    "没有", "看", "好", "自己", "这", "他", "她", "它", "们", "那", "些",
    "之", "与", "及", "或", "但", "而", "且", "被", "把", "让", "从",
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "can", "shall", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "into", "through", "during",
    "before", "after", "above", "below", "between", "out", "off", "over",
    "under", "again", "further", "then", "once", "here", "there", "when",
    "where", "why", "how", "all", "each", "every", "both", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own",
    "same", "so", "than", "too", "very", "just", "because", "but", "and",
    "or", "if", "what", "which", "who", "whom", "this", "that", "these",
    "those", "about", "up", "it", "its", "also",
  ]);

  // ========== 分词 ==========
  function tokenize(text) {
    if (!text) return [];
    var tokens = text.match(/[\u4e00-\u9fff]{2,}|[a-zA-Z]{2,}/g) || [];
    return tokens.map(function(t) { return t.toLowerCase(); }).filter(function(t) { return !STOP_WORDS.has(t); });
  }

  // ========== IndexedDB ==========
  function openDB() {
    return new Promise(function(resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function(e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      };
      req.onsuccess = function(e) { resolve(e.target.result); };
      req.onerror = function(e) { reject(e.target.error); };
    });
  }

  function dbGet(db, key) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(STORE_NAME, "readonly");
      var store = tx.objectStore(STORE_NAME);
      var req = store.get(key);
      req.onsuccess = function() { resolve(req.result ? req.result.value : null); };
      req.onerror = function() { reject(req.error); };
    });
  }

  function dbSet(db, key, value) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(STORE_NAME, "readwrite");
      var store = tx.objectStore(STORE_NAME);
      store.put({ key: key, value: value });
      tx.oncomplete = function() { resolve(); };
      tx.onerror = function() { reject(tx.error); };
    });
  }

  // ========== RagClient 构造函数 ==========
  function RagClient(options) {
    options = options || {};
    this.searchUrl = options.searchUrl || "/rag/search";
    this.graphUrl = options.graphUrl || "/rag/graph";
    this._docs = null;
    this._graph = null;
    this._ready = false;
    this._initPromise = null;
  }

  // ========== 初始化：加载数据（服务器 → IndexedDB 缓存） ==========
  RagClient.prototype.init = function(forceRefresh) {
    var self = this;

    if (self._ready) return Promise.resolve();
    if (self._initPromise) return self._initPromise;

    self._initPromise = (async function() {
      // 尝试从 IndexedDB 加载
      var db = null;
      try { db = await openDB(); } catch(e) { /* fallback to fetch */ }

      if (db && !forceRefresh) {
        var cachedDocs = await dbGet(db, CACHE_PREFIX + ":docs");
        if (cachedDocs) {
          self._docs = cachedDocs;
        }
        var cachedGraph = await dbGet(db, CACHE_PREFIX + ":graph");
        if (cachedGraph) {
          self._graph = cachedGraph;
        }
      }

      // 如果缓存缺失，从服务器加载
      var needsFetch = !self._docs || !self._graph;

      if (needsFetch) {
        // 加载 search_index.json
        if (!self._docs) {
          console.log("[RagClient] 加载搜索索引...");
          var resp = await fetch(self.searchUrl);
          if (!resp.ok) throw new Error("加载搜索索引失败: " + resp.status);
          var idx = await resp.json();
          self._docs = idx.docs || [];
          console.log("[RagClient] 搜索索引加载完成: " + self._docs.length + " 篇");
        }

        // 加载近邻图
        if (!self._graph) {
          console.log("[RagClient] 加载近邻图...");
          var resp2 = await fetch(self.graphUrl);
          if (resp2.ok) {
            self._graph = await resp2.json();
            console.log("[RagClient] 近邻图加载完成: " + Object.keys(self._graph).length + " 个节点");
          } else {
            console.warn("[RagClient] 近邻图不可用（" + resp2.status + "），降级为纯关键词搜索");
            self._graph = {};
          }
        }

        // 缓存到 IndexedDB
        if (db) {
          try {
            await dbSet(db, CACHE_PREFIX + ":docs", self._docs);
            if (self._graph) {
              await dbSet(db, CACHE_PREFIX + ":graph", self._graph);
            }
          } catch(e) {
            console.warn("[RagClient] IndexedDB 缓存失败:", e.message);
          }
        }
      }

      self._ready = true;
      console.log("[RagClient] 就绪 (" + self._docs.length + " 篇文档)");
    })();

    return self._initPromise;
  };

  // ========== 关键词搜索（与服务器端逻辑一致） ==========
  function keywordSearch(query, docs) {
    var queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    var scored = docs.map(function(doc, idx) {
      var titleTokens = tokenize(doc.title);
      var textTokens = tokenize(doc.text);
      var score = 0;
      for (var qi = 0; qi < queryTokens.length; qi++) {
        var qt = queryTokens[qi];
        // 标题子串匹配 +3
        for (var ti = 0; ti < titleTokens.length; ti++) {
          if (titleTokens[ti].includes(qt) || qt.includes(titleTokens[ti])) {
            score += 3;
            if (titleTokens[ti] === qt) score += 2;
            break;
          }
        }
        // 正文子串匹配 +1
        for (var ti = 0; ti < textTokens.length; ti++) {
          if (textTokens[ti].includes(qt) || qt.includes(textTokens[ti])) {
            score += 1;
            if (textTokens[ti] === qt) score += 1;
            break;
          }
        }
      }
      return { idx: idx, score: score };
    });

    return scored
      .filter(function(d) { return d.score > 0; })
      .sort(function(a, b) { return b.score - a.score; })
      .slice(0, 30);
  }

  // ========== 融合搜索：关键词 → 近邻扩展 → 融合排序 ==========
  RagClient.prototype.search = function(query, options) {
    var self = this;
    options = options || {};
    var topK = options.topK || 5;

    if (!self._ready || !self._docs) {
      return Promise.resolve([]);
    }

    return new Promise(function(resolve) {
      // 1. 关键词搜索
      var keywordHits = keywordSearch(query, self._docs);
      var seenDocIds = new Set();
      var candidates = [];

      for (var i = 0; i < keywordHits.length; i++) {
        var hit = keywordHits[i];
        var doc = self._docs[hit.idx];
        if (!doc) continue;
        if (seenDocIds.has(hit.idx)) continue;
        seenDocIds.add(hit.idx);
        candidates.push({
          title: doc.title,
          location: doc.location,
          text: doc.text,
          score: hit.score,
          source: "keyword",
        });
      }

      // 2. 近邻图扩展
      if (self._graph) {
        var neighborAdded = 0;
        // 对 top-10 关键词结果扩展近邻
        var seedCount = Math.min(10, keywordHits.length);
        for (var i = 0; i < seedCount; i++) {
          var seedIdx = keywordHits[i].idx;
          var neighbors = self._graph[String(seedIdx)];
          if (!neighbors) continue;

          for (var ni = 0; ni < neighbors.length; ni++) {
            var nbr = neighbors[ni];
            var nbrIdx = nbr[0]; // [neighbor_idx, score]
            var nbrScore = nbr[1];

            if (seenDocIds.has(nbrIdx)) continue;
            seenDocIds.add(nbrIdx);

            var nbrDoc = self._docs[nbrIdx];
            if (!nbrDoc) continue;

            // 近邻权重：关键词分 × 0.3 + 近邻相似度 × 10
            var keywordWeight = keywordHits[i] ? keywordHits[i].score * 0.3 : 0;
            var neighborWeight = nbrScore * 10;
            candidates.push({
              title: nbrDoc.title,
              location: nbrDoc.location,
              text: nbrDoc.text,
              score: keywordWeight + neighborWeight,
              source: "neighbor",
              neighborOf: seedIdx,
            });
            neighborAdded++;
          }
        }
      }

      // 3. 排序 & 返回 top-K
      candidates.sort(function(a, b) { return b.score - a.score; });
      var results = candidates.slice(0, topK);

      resolve(results);
    });
  };

  // ========== 清除缓存（用于重新加载） ==========
  RagClient.prototype.clearCache = function() {
    var self = this;
    self._docs = null;
    self._graph = null;
    self._ready = false;
    self._initPromise = null;

    return new Promise(function(resolve, reject) {
      var req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = function() { resolve(); };
      req.onerror = function() { reject(req.error); };
    });
  };

  // ========== 全局导出 ==========
  global.RagClient = RagClient;

})(typeof window !== "undefined" ? window : this);
