// Cloudflare Pages Function: Reading Progress API (D1)
// /api/progress                  GET    → fetch the authenticated user's progress
// /api/progress                  POST   → upsert entries
// /api/progress?file=y           DELETE → remove an entry

import {
  authenticateUser,
  corsHeaders,
  isAllowedOrigin,
} from '../_shared/user-auth.js';

const VALID_LEVELS = new Set(['read', 'explained', 'taught', 'mastered']);
const MAX_BODY_BYTES = 256 * 1024;
const MAX_ENTRIES = 5000;
const MAX_FILE_LENGTH = 512;

export async function onRequest(context) {
  const { request, env } = context;

  if (!isAllowedOrigin(request)) return json({ error: 'Origin not allowed' }, 403, request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(request, 'GET, POST, DELETE, OPTIONS') });
  }

  const auth = await authenticateUser(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status, request);

  try {
    if (request.method === 'GET') {
      return await handleGet(env, auth.userId, request);
    } else if (request.method === 'POST') {
      return await handlePost(env, request, auth.userId);
    } else if (request.method === 'DELETE') {
      return await handleDelete(env, request, auth.userId);
    }
  } catch (e) {
    console.error('Progress API error:', e);
    return json({ error: 'Internal server error' }, 500, request);
  }

  return json({ error: 'Method not allowed' }, 405, request);
}

async function handleGet(env, userId, request) {
  const { results } = await env.DB.prepare(
    'SELECT article_file, level, updated_at FROM progress WHERE user_id = ?'
  ).bind(userId).all();

  const progress = {};
  for (const row of results) {
    progress[row.article_file] = { level: row.level, updatedAt: row.updated_at };
  }
  return json({ progress }, 200, request);
}

async function handlePost(env, request, userId) {
  const contentLength = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json({ error: 'Request body too large' }, 413, request);
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return json({ error: 'Request body too large' }, 413, request);
  }

  let body;
  try { body = JSON.parse(rawBody); } catch { return json({ error: 'Invalid JSON' }, 400, request); }

  const { entries } = body || {};
  if (!Array.isArray(entries)) return json({ error: 'Missing entries' }, 400, request);

  const now = Date.now();
  const stmts = [];

  for (const entry of entries.slice(0, MAX_ENTRIES)) {
    if (!entry || !validFile(entry.file) || !VALID_LEVELS.has(entry.level)) continue;
    stmts.push(
      env.DB.prepare(
        'INSERT INTO progress (user_id, article_file, level, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, article_file) DO UPDATE SET level = excluded.level, updated_at = excluded.updated_at'
      ).bind(userId, entry.file, entry.level, safeTimestamp(entry.updatedAt, now))
    );
  }

  if (stmts.length === 0) return json({ error: 'No valid entries' }, 400, request);

  await env.DB.batch(stmts);
  return json({ ok: true, count: stmts.length }, 200, request);
}

async function handleDelete(env, request, userId) {
  const url = new URL(request.url);
  const file = url.searchParams.get('file');
  if (!validFile(file)) return json({ error: 'Missing or invalid file' }, 400, request);

  await env.DB.prepare(
    'DELETE FROM progress WHERE user_id = ? AND article_file = ?'
  ).bind(userId, file).run();

  return json({ ok: true }, 200, request);
}

function validFile(file) {
  return typeof file === 'string'
    && file.length > 0
    && file.length <= MAX_FILE_LENGTH
    && !/[\\\0\r\n]/.test(file)
    && !file.split('/').includes('..');
}

function safeTimestamp(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function json(data, status = 200, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...corsHeaders(request, 'GET, POST, DELETE, OPTIONS'),
    },
  });
}
