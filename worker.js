import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

addEventListener("fetch", (event) => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  try {
    return await getAssetFromKV(event, {
      mapRequestToAsset: (req) => {
        const url = new URL(req.url);
        // Serve index.html for paths ending with /
        if (url.pathname.endsWith("/")) {
          url.pathname += "index.html";
        }
        // Try adding .html for clean URLs
        if (!url.pathname.includes(".")) {
          url.pathname += ".html";
        }
        return new Request(url.toString(), req);
      },
    });
  } catch (e) {
    // Fallback to 404
    return new Response("Not Found", { status: 404 });
  }
}
