// Cloudflare Worker: AI Chat CORS Proxy
// API Key 内置，前端无需配置

const API_BASE = "https://token-plan-cn.xiaomimimo.com/v1";
const API_KEY = "tp-cjlpeijmrznmyivz3f4fbven5kmdtrwnlmhr3nuqdc1vd9a1";
const MODEL = "mimo-v2.5-pro";

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const targetUrl = API_BASE.replace(/\/$/, "") + "/chat/completions";
      const body = await request.text();

      let payload;
      try { payload = JSON.parse(body); } catch(e) { payload = {}; }
      payload.model = MODEL;
      if (!payload.max_tokens) payload.max_tokens = 2048;

      const resp = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + API_KEY,
        },
        body: JSON.stringify(payload),
      });

      const headers = new Headers(resp.headers);
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Expose-Headers", "*");

      return new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers: headers,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};
