// Cloudflare Pages Function: RAG Query
// Phase 1: 关键词搜索 → Phase 2: Reranker 重排序
// 返回 top 5 相关文档片段

// 停用词（中文 + 英文）
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
  // 中英文混合分词：匹配中文词（2+ 字符）、英文词（2+ 字符）
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
      // 标题匹配权重 3x
      if (titleTokens.some(t => t.includes(qt) || qt.includes(t))) score += 3;
      // 正文匹配权重 1x
      if (textTokens.some(t => t.includes(qt) || qt.includes(t))) score += 1;
      // 精确匹配额外加分
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

// 缓存 search_index.json（边缘节点级别）
let cachedIndex = null;
let cachedTime = 0;
const CACHE_TTL = 300000; // 5 分钟

async function loadIndex(env) {
  const now = Date.now();
  if (cachedIndex && now - cachedTime < CACHE_TTL) {
    return cachedIndex;
  }
  const object = await env.SEARCH_INDEX.get("search_index.json");
  if (!object) throw new Error("search_index.json not found in R2");
  const text = await object.text();
  const idx = JSON.parse(text);
  cachedIndex = idx.docs || [];
  cachedTime = now;
  return cachedIndex;
}

export async function onRequest(context) {
  const { request, env } = context;

  // 只允许 GET
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
    // Phase 1: 关键词搜索
    const docs = await loadIndex(env);
    const candidates = keywordSearch(query, docs, 30);

    if (candidates.length === 0) {
      return new Response(JSON.stringify({ results: [], source: "keyword" }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Phase 2: Reranker 重排序
    let results;
    try {
      const rerankerInput = {
        query: query,
        texts: candidates.map(d => `标题: ${d.title}\n内容: ${d.text.substring(0, 500)}`),
      };

      const aiResp = await env.AI.run("@cf/baai/bge-reranker-base", rerankerInput);

      // 按 reranker 分数排序
      const scored = candidates.map((doc, i) => ({
        title: doc.title,
        location: doc.location,
        text: doc.text.substring(0, 300),
        score: aiResp.data && aiResp.data[i] ? aiResp.data[i].score : doc.score,
      }));
      scored.sort((a, b) => b.score - a.score);
      results = scored.slice(0, topK);
    } catch (aiErr) {
      // Reranker 失败时降级到关键词排序
      console.error("Reranker error:", aiErr);
      results = candidates.slice(0, topK).map(d => ({
        title: d.title,
        location: d.location,
        text: d.text.substring(0, 300),
        score: d.score,
      }));
    }

    return new Response(JSON.stringify({ results, source: "reranker" }), {
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
