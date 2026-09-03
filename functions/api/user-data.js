// Unified User Data API (D1)
// GET  /api/user-data                 → fetch the authenticated user's data
// POST /api/user-data                 → upsert the authenticated user's data

import {
  authenticateUser,
  corsHeaders,
  isAllowedOrigin,
} from '../_shared/user-auth.js';

const MAX_BODY_BYTES = 512 * 1024;
const MAX_ENTRIES = 5000;
const MAX_FILE_LENGTH = 512;
const MAX_NOTE_LENGTH = 4000;
const MAX_THREADS = 20;
const VALID_LEVELS = new Set(['read', 'explained', 'taught', 'mastered']);

export async function onRequest(context) {
  const { request, env } = context;

  if (!isAllowedOrigin(request)) return json({ error: 'Origin not allowed' }, 403, request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(request, 'GET, POST, OPTIONS') });
  }

  const auth = await authenticateUser(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status, request);

  try {
    if (request.method === 'GET') {
      return await handleGet(env, auth.userId, request);
    } else if (request.method === 'POST') {
      return await handlePost(env, request, auth.userId);
    }
  } catch (e) {
    console.error('User data API error:', e);
    return json({ error: 'Internal server error' }, 500, request);
  }

  return json({ error: 'Method not allowed' }, 405, request);
}

async function handleGet(env, userId, request) {
  // Fetch all three tables in parallel
  const [progressRes, feynmanRes, recallRes] = await Promise.all([
    env.DB.prepare('SELECT article_file, level, updated_at FROM progress WHERE user_id = ?').bind(userId).all(),
    env.DB.prepare('SELECT article_file, level, got, missed, insight, next, question, threads, updated_at FROM feynman WHERE user_id = ?').bind(userId).all(),
    env.DB.prepare('SELECT article_file, added_at, next_review, step, total_reviews, successes, last_review FROM recall WHERE user_id = ?').bind(userId).all(),
  ]);

  // Transform to object format
  const progress = {};
  for (const row of progressRes.results) {
    progress[row.article_file] = { level: row.level, updatedAt: row.updated_at };
  }

  const feynman = {};
  for (const row of feynmanRes.results) {
    feynman[row.article_file] = {
      level: row.level,
      got: row.got || '',
      missed: row.missed || '',
      insight: row.insight || '',
      next: row.next || '',
      question: row.question || '',
      threads: row.threads ? JSON.parse(row.threads) : [],
      updatedAt: row.updated_at,
    };
  }

  const recall = {};
  for (const row of recallRes.results) {
    recall[row.article_file] = {
      addedAt: row.added_at,
      nextReview: row.next_review,
      step: row.step,
      totalReviews: row.total_reviews,
      successes: row.successes,
      lastReview: row.last_review,
    };
  }

  return json({ progress, feynman, recall }, 200, request);
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

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json({ error: 'Invalid request body' }, 400, request);
  }

  const { progress, feynman, recall } = body;

  const now = Date.now();
  const stmts = [];

  // Progress entries
  if (progress && Array.isArray(progress)) {
    for (const entry of progress.slice(0, MAX_ENTRIES)) {
      if (!entry || !validFile(entry.file) || !VALID_LEVELS.has(entry.level)) continue;
      stmts.push(
        env.DB.prepare(
          'INSERT INTO progress (user_id, article_file, level, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, article_file) DO UPDATE SET level = excluded.level, updated_at = excluded.updated_at'
        ).bind(userId, entry.file, entry.level, safeTimestamp(entry.updatedAt, now))
      );
    }
  }

  // Feynman notes
  if (feynman && typeof feynman === 'object') {
    for (const [file, note] of Object.entries(feynman).slice(0, MAX_ENTRIES)) {
      if (!validFile(file) || !note || typeof note !== 'object') continue;
      if (note.level && !VALID_LEVELS.has(note.level)) continue;
      stmts.push(
        env.DB.prepare(
          `INSERT INTO feynman (user_id, article_file, level, got, missed, insight, next, question, threads, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
           ON CONFLICT(user_id, article_file) DO UPDATE SET 
             level = excluded.level, got = excluded.got, missed = excluded.missed, 
             insight = excluded.insight, next = excluded.next, question = excluded.question, 
             threads = excluded.threads, updated_at = excluded.updated_at`
        ).bind(
          userId, file, note.level || 'read', safeText(note.got), safeText(note.missed),
          safeText(note.insight), safeText(note.next), safeText(note.question),
          JSON.stringify(normalizeThreads(note.threads)), safeTimestamp(note.updatedAt, now)
        )
      );
    }
  }

  // Recall queue
  if (recall && typeof recall === 'object') {
    for (const [file, data] of Object.entries(recall).slice(0, MAX_ENTRIES)) {
      if (!validFile(file) || !data || typeof data !== 'object') continue;
      stmts.push(
        env.DB.prepare(
          `INSERT INTO recall (user_id, article_file, added_at, next_review, step, total_reviews, successes, last_review) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
           ON CONFLICT(user_id, article_file) DO UPDATE SET 
             added_at = excluded.added_at, next_review = excluded.next_review, step = excluded.step, 
             total_reviews = excluded.total_reviews, successes = excluded.successes, last_review = excluded.last_review`
        ).bind(
          userId, file, safeTimestamp(data.addedAt, now), safeTimestamp(data.nextReview, now),
          safeInteger(data.step, 0, 0, 30), safeInteger(data.totalReviews, 0, 0, 100000),
          safeInteger(data.successes, 0, 0, 100000), safeTimestamp(data.lastReview, null)
        )
      );
    }
  }

  if (stmts.length === 0) return json({ error: 'No valid entries' }, 400, request);

  await env.DB.batch(stmts);
  return json({ ok: true, count: stmts.length }, 200, request);
}

function validFile(file) {
  return typeof file === 'string'
    && file.length > 0
    && file.length <= MAX_FILE_LENGTH
    && !/[\\\0\r\n]/.test(file)
    && !file.split('/').includes('..');
}

function safeText(value) {
  return typeof value === 'string' ? value.slice(0, MAX_NOTE_LENGTH) : '';
}

function safeInteger(value, fallback, min, max) {
  const number = Number(value);
  return Number.isInteger(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function safeTimestamp(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function normalizeThreads(threads) {
  if (!Array.isArray(threads)) return [];
  return threads.slice(0, MAX_THREADS).flatMap(thread => {
    if (!thread || typeof thread !== 'object') return [];
    const name = safeText(thread.name);
    const url = safeText(thread.url);
    return name || url ? [{ name, url }] : [];
  });
}

function json(data, status = 200, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...corsHeaders(request, 'GET, POST, OPTIONS'),
    },
  });
}
