// Cloudflare Pages Function: batched real-time translation for the live
// English mode (overrides/assets/javascripts/live-translate.js).
// Same guard pattern as ai-proxy.js: origin allowlist, per-IP rate limit,
// body caps. Calls SenseNova's OpenAI-compatible endpoint directly with
// the server-side SENSENOVA_API_KEY secret (never exposed to the client).
// Segments travel as numbered lines instead of JSON so a reasoning model
// cannot break the protocol; finish_reason=length degrades to untranslated
// source lines, never to broken output.

import { corsHeaders, isAllowedOrigin } from '../_shared/user-auth.js';

const UPSTREAM_URL = "https://token.sensenova.cn/v1/chat/completions";
const DEFAULT_MODEL = "deepseek-v4-flash";
const MAX_BODY_BYTES = 64 * 1024;
const MAX_TEXTS = 24;
const MAX_TEXT_LENGTH = 2000;
const MAX_TOTAL_CHARS = 12000;
const MAX_TOKENS = 4096;
const UPSTREAM_TIMEOUT_MS = 45000;
const TARGET = "en";

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 60;
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) return false;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

const SYSTEM_PROMPT = [
  "You are a translation engine for a technical AI-engineering documentation site.",
  "Translate each numbered line from Chinese to natural, concise English.",
  "Rules:",
  "- Keep the line numbering exactly; never merge, split, add or drop lines.",
  "- Keep technical terms, product names, code identifiers, URLs and numbers intact.",
  "- Keep emoji and inline formatting as-is.",
  "- Every line containing Chinese characters MUST be translated into English.",
  "  NEVER return a Chinese-containing line unchanged, even if it is a sentence",
  "  fragment, starts with punctuation, or looks like a table cell.",
  "- Only lines with no Chinese at all may be copied unchanged.",
  "Output ONLY the numbered translated lines. No commentary, no code fences.",
].join("\n");

export async function onRequest(context) {
  try {
    return await handle(context);
  } catch (error) {
    console.error("translate unhandled:", String(error && error.stack || error).slice(0, 500));
    return json({ error: "Internal error", detail: String(error && error.stack || error).slice(0, 300) }, 500, context.request);
  }
}

async function handle(context) {
  const { request, env } = context;

  if (!request.headers.get('Origin') || !isAllowedOrigin(request)) {
    return json({ error: "Origin not allowed" }, 403, request);
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(request, 'POST, OPTIONS') });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, request);
  }

  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!checkRateLimit(clientIp)) {
    return json({ error: "Rate limit exceeded: 60 requests per minute" }, 429, request, { "Retry-After": "60" });
  }

  const contentLength = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json({ error: "Request body too large" }, 413, request);
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return json({ error: "Request body too large" }, 413, request);
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON" }, 400, request);
  }

  const validationError = validateRequest(body);
  if (validationError) return json({ error: validationError }, 400, request);

  if (!env.SENSENOVA_API_KEY) {
    return json({ error: "Translation proxy is not configured" }, 503, request);
  }

  let texts;
  try {
    texts = await translateTexts(body.texts, env);
  } catch (error) {
    console.error("translate upstream error:", String(error).slice(0, 300));
    return json({ error: "Upstream translation failed" }, 502, request);
  }

  return json({ texts }, 200, request);
}

async function translateTexts(texts, env) {
  const numbered = texts
    .map((t, i) => `${i + 1}. ${t.replace(/\s+/g, " ").trim()}`)
    .join("\n");

  let resp;
  try {
    resp = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.SENSENOVA_API_KEY}`,
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      body: JSON.stringify({
        model: env.SENSENOVA_MODEL || DEFAULT_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: numbered },
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.2,
        stream: false,
      }),
    });
  } catch (error) {
    throw new Error(`upstream fetch failed: ${error}`);
  }

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    throw new Error(`upstream ${resp.status}: ${detail.slice(0, 200)}`);
  }

  const data = await resp.json().catch(() => null);
  const content = data && data.choices && data.choices[0]
    && data.choices[0].message && data.choices[0].message.content;
  if (typeof content !== "string") {
    throw new Error("upstream returned no message content");
  }

  const lines = parseNumberedLines(content, texts.length);
  // Keep output aligned with input; any missing line falls back to the source.
  return texts.map((src, i) => (lines[i] !== undefined ? lines[i] : src));
}

function parseNumberedLines(content, expected) {
  const cleaned = content.replace(/```[a-z]*\n?/gi, "").trim();
  const parts = cleaned.split(/\n(?=\s*\d+\s*[.、)）]\s*)/);
  const out = new Array(expected);
  for (const part of parts) {
    const m = part.match(/^\s*(\d+)\s*[.、)）]\s*([\s\S]*)$/);
    if (!m) continue;
    const idx = parseInt(m[1], 10) - 1;
    const text = m[2].trim();
    if (idx >= 0 && idx < expected && text) out[idx] = text;
  }
  return out;
}

function validateRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Invalid request body";
  if (body.target !== undefined && body.target !== TARGET) return "Unsupported target language";
  if (!Array.isArray(body.texts) || body.texts.length === 0 || body.texts.length > MAX_TEXTS) {
    return `texts must be an array of 1-${MAX_TEXTS} strings`;
  }
  let total = 0;
  for (const t of body.texts) {
    if (typeof t !== "string" || t.length === 0 || t.length > MAX_TEXT_LENGTH) {
      return `each text must be a non-empty string of 1-${MAX_TEXT_LENGTH} chars`;
    }
    total += t.length;
  }
  if (total > MAX_TOTAL_CHARS) return "texts exceed the total character budget";
  return "";
}

function json(data, status = 200, request, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request, 'POST, OPTIONS'),
      ...extraHeaders,
    },
  });
}
