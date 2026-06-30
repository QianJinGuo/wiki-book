// Quick test to check qwen3-embedding dimension
export async function onRequest(context) {
  const { env } = context;
  try {
    const resp = await env.AI.run("@cf/qwen/qwen3-embedding-0.6b", {
      text: ["测试中文效果"]
    });
    const dims = resp.data && resp.data[0] ? resp.data[0].length : 'unknown';
    return new Response(JSON.stringify({ dims, data: resp.data[0].slice(0, 5) }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
