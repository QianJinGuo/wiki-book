export async function onRequest(context) {
  const object = await context.env.SEARCH_INDEX.get("search_index.json");
  if (!object) {
    return new Response("Not Found", { status: 404 });
  }
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Content-Length", String(object.size));
  headers.set("Cache-Control", "public, max-age=86400, immutable");
  headers.set("Access-Control-Allow-Origin", "*");
  return new Response(object.body, { headers });
}
