// Cloudflare Worker: MiMo TTS 代理

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
      const { text, model } = await request.json();
      if (!text) {
        return new Response(JSON.stringify({ error: "Missing text" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const apiKey = "tp-cjlpeijmrznmyivz3f4fbven5kmdtrwnlmhr3nuqdc1vd9a1";
      const baseUrl = "https://token-plan-cn.xiaomimimo.com/v1/chat/completions";
      const ttsModel = model || "mimo-v2.5-tts";

      // MiMo TTS 要求: assistant role 放待合成文本，user role 放风格指令
      const payload = {
        model: ttsModel,
        messages: [
          { role: "assistant", content: text }
        ],
        audio: { voice: "mimo_default" },
        stream: false,
      };

      const resp = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        return new Response(JSON.stringify({ error: "MiMo " + resp.status + ": " + errText.substring(0, 300) }), {
          status: 502,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      const data = await resp.json();
      const audioData = data.choices?.[0]?.message?.audio?.data;

      if (!audioData) {
        return new Response(JSON.stringify({ error: "No audio data", raw: JSON.stringify(data).substring(0, 500) }), {
          status: 502,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      return new Response(JSON.stringify({ audio: audioData, format: "wav", sampleRate: 24000 }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};
