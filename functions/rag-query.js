// Cloudflare Pages Function: RAG Query
// Phase 1: 关键词搜索 → Phase 2: Reranker 重排序 → Phase 3: 语义搜索
// Embedding: 讯飞 xop3qwen8bembedding (8B, 1024维) via HTTP API (不计 CPU)
// Reranker: Workers AI @cf/baai/bge-reranker-base (间歇 503 Free 限制)
// Vectorize: wiki-book-embeddings-v2 (1024d, cosine)
// 返回 top 5 相关文档片段

import { corsHeaders, isAllowedOrigin } from './_shared/user-auth.js';

const STOP_WORDS = new Set([
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

const XUNFEI_URL = "https://maas-api.cn-huabei-1.xf-yun.com/v2/embeddings";
const XUNFEI_MODEL = "xop3qwen8bembedding";

function tokenize(text) {
  const tokens = text.match(/[\u4e00-\u9fff]{2,}|[a-zA-Z]{2,}/g) || [];
  return tokens.map(t => t.toLowerCase()).filter(t => !STOP_WORDS.has(t));
}

function keywordSearch(query, docs, limit = 30) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scored = docs.map(doc => {
    const titleTokens = tokenize(doc.title);
    const textTokens = tokenize(doc.text);
    let score = 0;
    for (const qt of queryTokens) {
      if (titleTokens.some(t => t.includes(qt) || qt.includes(t))) score += 3;
      if (textTokens.some(t => t.includes(qt) || qt.includes(t))) score += 1;
      if (titleTokens.includes(qt)) score += 2;
      if (textTokens.includes(qt)) score += 1;
    }
    return { ...doc, score };
  });

  return scored
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ========== 缓存 ==========
let cachedIndex = null;
let cachedTime = 0;
const CACHE_TTL = 300000;

async function loadIndex(env) {
  const now = Date.now();
  if (cachedIndex && now - cachedTime < CACHE_TTL) return cachedIndex;
  const object = await env.SEARCH_INDEX.get("search_index.json");
  if (!object) throw new Error("search_index.json not found in R2");
  const text = await object.text();
  const idx = JSON.parse(text);
  cachedIndex = idx.docs || [];
  cachedTime = now;
  return cachedIndex;
}

// Build mapping: valid_docs index → original docs index
// Vectorize now stores original docs indices directly (from build-vectorize-xunfei.py v2)
// So we can use hit.docId directly to look up docs[]
let cachedDocMap = null;
function getDocMap(docs) {
  if (cachedDocMap) return cachedDocMap;
  const map = {};
  let validIdx = 0;
  for (let i = 0; i < docs.length; i++) {
    if (docs[i].location) {
      map[validIdx] = i;
      validIdx++;
    }
  }
  cachedDocMap = map;
  return map;
}

const MAX_QUERY_LENGTH = 256;
const MAX_TOP_K = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map();

// ========== Phase 3: 语义搜索（讯飞 API + Vectorize） ==========
async function semanticSearch(query, env) {
  try {
    const xunfeiKey = env.XUNFEI_API_KEY;
    if (!xunfeiKey) {
      console.warn("XUNFEI_API_KEY not configured");
      return [];
    }

    // 1. Embed query via 讯飞 API
    const embedResp = await fetch(XUNFEI_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + xunfeiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: XUNFEI_MODEL,
        input: [query],
        dimensions: 1024,
      }),
    });

    if (!embedResp.ok) {
      console.error("Xunfei API error:", embedResp.status);
      return [];
    }

    const embedData = await embedResp.json();
    if (!embedData.data || !embedData.data[0]) {
      console.error("Xunfei API: unexpected response");
      return [];
    }

    const queryVec = embedData.data[0].embedding;

    // 2. Search Vectorize index
    let matches = [];
    try {
      matches = await env.VECTORIZE.query(queryVec, {
        topK: 15, returnValues: false, returnMetadata: true,
      });
    } catch(e) {
      return [];
    }

    if (!matches || !matches.length) return [];

    return matches.map(m => ({
      docId: parseInt(m.id, 10),
      score: m.score,
      title: m.metadata ? m.metadata.title : "",
      location: m.metadata ? m.metadata.location : "",
    }));
  } catch (e) {
    console.error("Semantic search error:", e.message);
    return [];
  }
}

export async function onRequest(context) {
  const { request, env } = context;

  if (!isAllowedOrigin(request)) return json({ error: "Origin not allowed" }, 403, request);

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(request, 'GET, OPTIONS') });
  }

  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, 405, request);
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const requestedTopK = parseInt(url.searchParams.get("top_k") || "5", 10);
  const topK = Number.isFinite(requestedTopK)
    ? Math.min(MAX_TOP_K, Math.max(1, requestedTopK))
    : 5;

  if (!query.trim()) {
    return json({ error: "Missing query parameter 'q'" }, 400, request);
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return json({ error: `Query must be at most ${MAX_QUERY_LENGTH} characters` }, 400, request);
  }

  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!checkRateLimit(clientIp)) {
    return json({ error: "Rate limit exceeded" }, 429, request, { "Retry-After": "60" });
  }

  try {
    const docs = await loadIndex(env);

    // Phase 1: 关键词搜索
    const keywordCandidates = keywordSearch(query, docs, 30);
    const keywordDocIds = new Set(keywordCandidates.map(d => docs.indexOf(d)));

    // Phase 3: 语义搜索（讯飞 API + Vectorize）
    let semanticCandidates = [];
    let semanticDebug = { vecCount: -1, overlap: 0, nullDoc: 0, added: 0, err: "" };
    try {
      const semanticHits = await semanticSearch(query, env);
      semanticDebug.vecCount = semanticHits.length;
      for (const hit of semanticHits) {
        if (hit.docId === -1 && hit.title.startsWith("VecAPI")) {
          semanticDebug.err = hit.title;
          continue;
        }
        if (keywordDocIds.has(hit.docId)) {
          semanticDebug.overlap++;
          continue;
        }
        const doc = docs[hit.docId];
        if (!doc || !doc.title) {
          // Fallback: try docMap in case IDs are valid_docs indices
          const docMap = getDocMap(docs);
          const origIdx = docMap[hit.docId];
          if (origIdx !== undefined) {
            const doc2 = docs[origIdx];
            if (doc2 && doc2.title) {
              semanticCandidates.push({ ...doc2, score: hit.score * 10 });
              semanticDebug.added++;
              continue;
            }
          }
          semanticDebug.nullDoc++;
          semanticDebug.lastId = hit.docId;
          semanticDebug.lastMap = hit.docId;
          continue;
        }
        semanticCandidates.push({ ...doc, score: hit.score * 10 });
        semanticDebug.added++;
      }
    } catch (embedErr) {
      semanticDebug.err = embedErr.message;
    }

    const mergedCandidates = [...keywordCandidates, ...semanticCandidates];

    if (mergedCandidates.length === 0) {
      return json({ results: [], source: "none" }, 200, request);
    }

    // Phase 2: Reranker 重排序（Workers AI，可能 503）
    let results;
    try {
      const rerankerInput = {
        query: query,
        texts: mergedCandidates.map(d => `标题: ${d.title}\n内容: ${d.text.substring(0, 500)}`),
      };

      const aiResp = await env.AI.run("@cf/baai/bge-reranker-base", rerankerInput);

      const scored = mergedCandidates.map((doc, i) => ({
        title: doc.title,
        location: doc.location,
        text: doc.text.substring(0, 300),
        score: aiResp.data && aiResp.data[i] ? aiResp.data[i].score : doc.score,
      }));
      scored.sort((a, b) => b.score - a.score);
      results = scored.slice(0, topK);
    } catch (aiErr) {
      console.error("Reranker error:", aiErr);
      results = mergedCandidates.slice(0, topK).map(d => ({
        title: d.title,
        location: d.location,
        text: d.text.substring(0, 300),
        score: d.score,
      }));
    }

    const source = semanticCandidates.length > 0 ? "hybrid" : "reranker";
    return new Response(JSON.stringify({ results, source }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(request, 'GET, OPTIONS'),
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("RAG query error:", err);
    return json({ error: "RAG query failed" }, 500, request);
  }
}

function checkRateLimit(ip) {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || [])
    .filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) return false;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

function json(data, status = 200, request, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request, 'GET, OPTIONS'),
      ...extraHeaders,
    },
  });
}
