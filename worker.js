// Worker: serve search_index.json from R2
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/search/search_index.json') {
      const object = await env.SEARCH_INDEX.get('search_index.json');
      if (!object) {
        return new Response('Not Found', { status: 404 });
      }
      return new Response(object.body, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    return fetch(request);
  },
};
