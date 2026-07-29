import { chromium } from 'playwright';

const BASE = 'https://jinguo.tech';
const results = [];

function log(test, pass, detail = '') {
  const icon = pass ? '✅' : '❌';
  results.push({ test, pass, detail });
  console.log(`${icon} ${test}${detail ? ' — ' + detail : ''}`);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n=== 404 Fix E2E Tests ===\n');

  // ── Test 1: Article direct access (clean URL) ──
  console.log('--- 1. Direct article access (clean URLs) ---');
  
  const testArticles = [
    { path: '/ch04/704-claude-managed-agents', desc: '704 (renamed from 702)' },
    { path: '/ch04/001-agent', desc: '001-agent (known good)' },
    { path: '/ch04/037-qoder-skills-agent-skill-ai', desc: 'qoder-skills' },
    { path: '/ch04/047-hermes-agent-eval-harness-skill-7-taskset-harnessadapt', desc: 'hermes-agent-eval' },
  ];

  for (const { path, desc } of testArticles) {
    try {
      const resp = await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const status = resp?.status() || 0;
      log(`${desc} (${path})`, status === 200, `HTTP ${status}`);
    } catch (e) {
      log(`${desc} (${path})`, false, e.message.slice(0, 80));
    }
  }

  // ── Test 2: .html URLs redirect to clean URLs ──
  console.log('\n--- 2. .html redirects ---');
  const htmlTest = '/ch04/001-agent.html';
  try {
    const resp = await page.goto(BASE + htmlTest, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const status = resp?.status() || 0;
    // Should 308 redirect to clean URL, then 200
    log(`${htmlTest} resolves`, status === 200, `HTTP ${status}, final URL: ${page.url()}`);
  } catch (e) {
    log(`${htmlTest} resolves`, false, e.message.slice(0, 80));
  }

  // ── Test 3: Dashboard loads and renders articles ──
  console.log('\n--- 3. Dashboard loads and renders ---');
  try {
    await page.goto(BASE + '/dashboard/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);
    
    // Check that articles loaded (not showing loading state)
    const content = await page.textContent('#content');
    const isLoading = content?.includes('加载文章数据') || false;
    log('Dashboard loads articles', !isLoading, isLoading ? 'Still loading' : 'Articles rendered');
    
    // Check for console errors
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    
    // Check that article URLs are clean (no .html)
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('.card-title a, .daily-title a'));
      return anchors.slice(0, 10).map(a => ({ href: a.href, text: a.textContent?.slice(0, 40) }));
    });
    
    const htmlLinks = links.filter(l => l.href.includes('.html'));
    log(`Article links without .html`, htmlLinks.length === 0, 
        htmlLinks.length > 0 ? `${htmlLinks.length} links still have .html: ${htmlLinks[0].href}` : 'All clean URLs');
    
    // Log sample links
    if (links.length > 0) {
      console.log('  Sample links:');
      for (const l of links.slice(0, 3)) {
        console.log(`  → ${l.href}`);
      }
    }
  } catch (e) {
    log('Dashboard test', false, e.message.slice(0, 100));
  }

  // ── Test 4: Click a dashboard link and verify 200 ──
  console.log('\n--- 4. Click dashboard link ---');
  try {
    await page.goto(BASE + '/dashboard/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);
    
    const firstLink = await page.$('.card-title a');
    if (firstLink) {
      const href = await firstLink.getAttribute('href');
      log('Dashboard has article link', !!href, href ? `Found link: ${href?.slice(0, 60)}` : '');
      
      // Navigate to it
      if (href) {
        const resp = await page.goto(new URL(href, BASE).href, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const status = resp?.status() || 0;
        log(`Dashboard link resolves to 200`, status === 200, `HTTP ${status}`);
      }
    } else {
      log('Dashboard has article link', false, 'No .card-title a found');
    }
  } catch (e) {
    log('Click dashboard link', false, e.message.slice(0, 80));
  }

  // Summary
  console.log('\n=== Summary ===');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`${passed} passed, ${failed} failed out of ${results.length} tests`);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => {
  console.error('Test failed:', e.message);
  process.exit(1);
});
