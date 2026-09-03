import { corsHeaders, createUserSession, isAllowedOrigin } from '../_shared/user-auth.js';

export async function onRequest(context) {
  const { request, env } = context;

  if (!isAllowedOrigin(request)) return json({ error: 'Origin not allowed' }, 403, request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(request, 'POST, OPTIONS') });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, request);
  }

  try {
    const session = await createUserSession(env);
    return json(session, 201, request, { 'Cache-Control': 'no-store' });
  } catch {
    return json({ error: 'Sync authentication is not configured' }, 503, request);
  }
}

function json(data, status = 200, request, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(request, 'POST, OPTIONS'),
      ...extraHeaders,
    },
  });
}
