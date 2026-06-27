export async function onRequest(context) {
  const object = await context.env.SEARCH_INDEX.get("search_index.json");
  if (!object) {
    return new Response("R2 object not found", { status: 404 });
  }
  const size = object.size;
  return new Response(JSON.stringify({ ok: true, sizeMB: (size / 1024 / 1024).toFixed(1) }), {
    headers: { "Content-Type": "application/json" },
  });
}
