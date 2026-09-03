import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const source = await readFile(new URL('../functions/_shared/user-auth.js', import.meta.url), 'utf8');
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const { authenticateUser, createUserSession, isAllowedOrigin } = await import(moduleUrl);

const env = { USER_DATA_SECRET: 'test-only-secret-that-is-at-least-32-bytes' };

test('creates and authenticates a capability token', async () => {
  const session = await createUserSession(env);
  const request = new Request('https://jinguo.tech/api/user-data', {
    headers: { Authorization: `Bearer ${session.token}` },
  });

  assert.match(session.userId, /^[A-Za-z0-9_-]{22}$/);
  assert.match(session.token, /^[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}$/);
  assert.deepEqual(await authenticateUser(request, env), {
    ok: true,
    userId: session.userId,
  });
});

test('rejects tampered and missing credentials', async () => {
  const session = await createUserSession(env);
  const [userId, signature] = session.token.split('.');
  const changedFirstByte = signature[0] === 'A' ? 'B' : 'A';
  const tampered = `${userId}.${changedFirstByte}${signature.slice(1)}`;

  const invalid = await authenticateUser(new Request('https://jinguo.tech', {
    headers: { Authorization: `Bearer ${tampered}` },
  }), env);
  const missing = await authenticateUser(new Request('https://jinguo.tech'), env);
  const unconfigured = await authenticateUser(new Request('https://jinguo.tech'), {});

  assert.equal(invalid.status, 401);
  assert.equal(missing.status, 401);
  assert.equal(unconfigured.status, 503);
});

test('only allows the published site origins', () => {
  assert.equal(isAllowedOrigin(new Request('https://jinguo.tech', {
    headers: { Origin: 'https://wiki.jinguo.tech' },
  })), true);
  assert.equal(isAllowedOrigin(new Request('https://jinguo.tech', {
    headers: { Origin: 'https://attacker.example' },
  })), false);
  assert.equal(isAllowedOrigin(new Request('https://jinguo.tech')), true);
});
