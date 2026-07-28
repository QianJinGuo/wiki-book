// Unified User Data API (D1)
// GET  /api/user-data?user=xxx        → fetch all user data
// POST /api/user-data                 → upsert all data types

export async function onRequest(context) {
  const { request, env } = context;

  // CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    }
  } catch (e) {
    return json({ error: e.message }, 500);
  }

  return json({ error: 'Method not allowed' }, 405);
}

async function handleGet(env, url) {
  const userId = url.searchParams.get('user');
  if (!userId) return json({ error: 'Missing user parameter' }, 400);

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

  return json({ progress, feynman, recall });
}

async function handlePost(env, request) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const { user, progress, feynman, recall } = body;
  if (!user) return json({ error: 'Missing user parameter' }, 400);

  const now = Date.now();
  const stmts = [];

  // Progress entries
  if (progress && Array.isArray(progress)) {
    const VALID_LEVELS = new Set(['read', 'explained', 'taught', 'mastered']);
    for (const entry of progress) {
      if (!entry.file || !VALID_LEVELS.has(entry.level)) continue;
      stmts.push(
        env.DB.prepare(
          'INSERT INTO progress (user_id, article_file, level, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, article_file) DO UPDATE SET level = excluded.level, updated_at = excluded.updated_at'
        ).bind(user, entry.file, entry.level, entry.updatedAt || now)
      );
    }
  }

  // Feynman notes
  if (feynman && typeof feynman === 'object') {
    for (const [file, note] of Object.entries(feynman)) {
      if (!note) continue;
      stmts.push(
        env.DB.prepare(
          `INSERT INTO feynman (user_id, article_file, level, got, missed, insight, next, question, threads, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
           ON CONFLICT(user_id, article_file) DO UPDATE SET 
             level = excluded.level, got = excluded.got, missed = excluded.missed, 
             insight = excluded.insight, next = excluded.next, question = excluded.question, 
             threads = excluded.threads, updated_at = excluded.updated_at`
        ).bind(
          user, file, note.level || 'read', note.got || '', note.missed || '',
          note.insight || '', note.next || '', note.question || '',
          JSON.stringify(note.threads || []), note.updatedAt || now
        )
      );
    }
  }

  // Recall queue
  if (recall && typeof recall === 'object') {
    for (const [file, data] of Object.entries(recall)) {
      if (!data) continue;
      stmts.push(
        env.DB.prepare(
          `INSERT INTO recall (user_id, article_file, added_at, next_review, step, total_reviews, successes, last_review) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
           ON CONFLICT(user_id, article_file) DO UPDATE SET 
             added_at = excluded.added_at, next_review = excluded.next_review, step = excluded.step, 
             total_reviews = excluded.total_reviews, successes = excluded.successes, last_review = excluded.last_review`
        ).bind(
          user, file, data.addedAt || now, data.nextReview || now, data.step || 0,
          data.totalReviews || 0, data.successes || 0, data.lastReview || null
        )
      );
    }
  }

  if (stmts.length === 0) return json({ error: 'No valid entries' }, 400);

  await env.DB.batch(stmts);
  return json({ ok: true, count: stmts.length });
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
