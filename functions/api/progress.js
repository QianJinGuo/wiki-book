// Cloudflare Pages Function: Reading Progress API (D1)
// /api/progress?user=xxx         GET    → fetch progress
// /api/progress                  POST   → upsert entries
// /api/progress?user=x&file=y    DELETE → remove entry

const VALID_LEVELS = new Set(['read', 'explained', 'taught', 'mastered']);

export async function onRequest(context) {
  const { request, env } = context;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const url = new URL(request.url);

  try {
    if (request.method === 'GET') {
      return await handleGet(env, url);
    } else if (request.method === 'POST') {
      return await handlePost(env, request);
    } else if (request.method === 'DELETE') {
      return await handleDelete(env, url);
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleGet(env, url) {
  const userId = url.searchParams.get('user');
  if (!userId) return json({ error: 'Missing user parameter' }, 400);

  const { results } = await env.DB.prepare(
    'SELECT article_file, level, updated_at FROM progress WHERE user_id = ?'
  ).bind(userId).all();

  const progress = {};
  for (const row of results) {
    progress[row.article_file] = { level: row.level, updatedAt: row.updated_at };
  }
  return json({ progress });
}

async function handlePost(env, request) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const { user, entries } = body;
  if (!user || !Array.isArray(entries)) return json({ error: 'Missing user or entries' }, 400);

  const now = Date.now();
  const stmts = [];

  for (const entry of entries) {
    if (!entry.file || !VALID_LEVELS.has(entry.level)) continue;
    stmts.push(
      env.DB.prepare(
        'INSERT INTO progress (user_id, article_file, level, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, article_file) DO UPDATE SET level = excluded.level, updated_at = excluded.updated_at'
      ).bind(user, entry.file, entry.level, entry.updatedAt || now)
    );
  }

  if (stmts.length === 0) return json({ error: 'No valid entries' }, 400);

  await env.DB.batch(stmts);
  return json({ ok: true, count: stmts.length });
}

async function handleDelete(env, url) {
  const userId = url.searchParams.get('user');
  const file = url.searchParams.get('file');
  if (!userId || !file) return json({ error: 'Missing user or file' }, 400);

  await env.DB.prepare(
    'DELETE FROM progress WHERE user_id = ? AND article_file = ?'
  ).bind(userId, file).run();

  return json({ ok: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
