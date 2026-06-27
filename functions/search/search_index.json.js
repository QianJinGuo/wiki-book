export async function onRequest(context) {
  const object = await context.env.SEARCH_INDEX.get("search_index.json");
  if (!object) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(object.body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
