// Cloudflare Pages Function: RAG Query
// Phase 1: 关键词搜索 → Phase 2: Reranker 重排序 → Phase 3: 语义 Embedding 补充
// Embedding: 讯飞 xop3qwen8bembedding (8B, 1024维)
// Reranker: Workers AI @cf/baai/bge-reranker-base
// 返回 top 5 相关文档片段

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

// ========== Phase 3: 语义搜索（Vectorize 托管向量搜索） ==========
async function vectorSearch(query, env) {
  try {
    // 1. Embed query via Workers AI bge-m3
    const aiResp = await env.AI.run("@cf/baai/bge-m3", { text: [query] });
    if (!aiResp || !aiResp.data || !aiResp.data[0]) return [];

    const queryVec = aiResp.data[0];

    // 2. Search Vectorize index
    const matches = await env.VECTORIZE.query(queryVec, {
      topK: 15,
      returnValues: false,
      returnMetadata: true,
    });

    if (!matches || !matches.length) return [];

    return matches.map(m => ({
      docId: parseInt(m.id, 10),
      score: m.score,
      title: m.metadata.title,
      location: m.metadata.location,
    }));
  } catch (e) {
    console.error("Vectorize search error:", e);
    return [];
  }
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const topK = parseInt(url.searchParams.get("top_k") || "5", 10);

  if (!query.trim()) {
    return new Response(JSON.stringify({ error: "Missing query parameter 'q'" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const docs = await loadIndex(env);

    // Phase 1: 关键词搜索
    const keywordCandidates = keywordSearch(query, docs, 30);
    const keywordDocIds = new Set(keywordCandidates.map(d => docs.indexOf(d)));

    // Phase 3: 语义搜索（Vectorize）
    let semanticCandidates = [];
    try {
      const semanticHits = await vectorSearch(query, env);
      for (const hit of semanticHits) {
        if (!keywordDocIds.has(hit.docId)) {
          const doc = docs[hit.docId];
          if (doc) {
            semanticCandidates.push({ ...doc, score: hit.score * 10 });
          }
        }
      }
    } catch (embedErr) {
      console.error("Embedding error:", embedErr);
    }

    const mergedCandidates = [...keywordCandidates, ...semanticCandidates];

    if (mergedCandidates.length === 0) {
      return new Response(JSON.stringify({ results: [], source: "none" }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Phase 2: Reranker 重排序（仍用 Workers AI）
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
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}
