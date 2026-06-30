// Cloudflare Pages Function: AI Chat Proxy
// 从环境变量读取 SITE_TOKEN，自动加上后转发到 Worker
// 浏览器端不需要知道 token
// 包含 IP 频率限制

const WORKER_URL = "https://ai-chat-proxy.jinguo.workers.dev";

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

  // OPTIONS 预检
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // IP 频率限制（CF-Connecting-IP 是真实客户端 IP）
  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded: 30 requests per minute" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Retry-After": "60",
      },
    });
  }

  // 读取请求体
  const body = await request.text();

  // 转发到 Worker，自动加上 SITE_TOKEN
  const resp = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Site-Token": env.SITE_TOKEN || "",
    },
    body: body,
  });

  // 透传响应
  const headers = new Headers(resp.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Expose-Headers", "*");

  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: headers,
  });
}
