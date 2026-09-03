// Cloudflare Pages Function: AI Chat Proxy
// 从环境变量读取 SITE_TOKEN，自动加上后转发到 Worker
// 浏览器端不需要知道 token
// 包含 IP 频率限制

import { corsHeaders, isAllowedOrigin } from './_shared/user-auth.js';

const WORKER_URL = "https://ai-chat-proxy.jinguo.workers.dev";
const MAX_BODY_BYTES = 32 * 1024;
const MAX_MESSAGES = 32;
const MAX_MESSAGE_LENGTH = 8000;
const ALLOWED_ROLES = new Set(['system', 'user', 'assistant']);
const ALLOWED_PROVIDERS = new Set(['', 'mimo', 'opencode', 'sensenova']);

// IP 频率限制（内存中，每边缘节点独立）
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) return false;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (!request.headers.get('Origin') || !isAllowedOrigin(request)) {
    return json({ error: "Origin not allowed" }, 403, request);
  }

  // OPTIONS 预检
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(request, 'POST, OPTIONS') });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, request);
  }

  // IP 频率限制（CF-Connecting-IP 是真实客户端 IP）
  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!checkRateLimit(clientIp)) {
    return json({ error: "Rate limit exceeded: 30 requests per minute" }, 429, request, { "Retry-After": "60" });
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

  if (!env.SITE_TOKEN) {
    return json({ error: "AI proxy is not configured" }, 503, request);
  }

  // 转发到 Worker，自动加上 SITE_TOKEN
  let resp;
  try {
    resp = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Site-Token": env.SITE_TOKEN,
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("AI proxy upstream error:", error);
    return json({ error: "Upstream AI request failed" }, 502, request);
  }

  // 透传响应
  const headers = new Headers(resp.headers);
  Object.entries(corsHeaders(request, 'POST, OPTIONS')).forEach(([key, value]) => headers.set(key, value));
  headers.set("Access-Control-Expose-Headers", "Retry-After");
  headers.set("Cache-Control", "no-store");

  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: headers,
  });
}

function validateRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Invalid request body";
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > MAX_MESSAGES) {
    return "Invalid messages";
  }
  if (body._provider !== undefined && (typeof body._provider !== "string" || !ALLOWED_PROVIDERS.has(body._provider))) {
    return "Invalid provider";
  }
  if (body.model !== undefined && (typeof body.model !== "string" || body.model.length > 128)) {
    return "Invalid model";
  }
  if (body.max_tokens !== undefined && (!Number.isInteger(body.max_tokens) || body.max_tokens < 1 || body.max_tokens > 2048)) {
    return "Invalid max_tokens";
  }
  for (const message of body.messages) {
    if (!message || typeof message !== "object" || !ALLOWED_ROLES.has(message.role)
      || typeof message.content !== "string" || message.content.length > MAX_MESSAGE_LENGTH) {
      return "Invalid message";
    }
  }
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
