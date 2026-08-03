import { chromium } from 'playwright';

const URL = 'http://localhost:8765/learn/';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const modules = await page.locator('.module-item').count();
  if (modules !== 16) throw new Error(`expected 16 modules, got ${modules}`);
  if (!(await page.locator('h1').textContent()).includes('LLM')) throw new Error('course heading did not render');

  await page.locator('.read-button').first().click();
  if (!(await page.locator('.read-button').first().textContent()).includes('已读')) throw new Error('read state did not render');
  await page.locator('[data-action="accept"]').first().click();
  await page.locator('[data-action="lab"]').click();
  if (!(await page.locator('[data-action="lab"]').textContent()).includes('已完成')) throw new Error('lab state did not render');

  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('wiki-learn-course-progress-v2')));
  if (!state?.m01?.lab || !Object.keys(state.m01.read || {}).length || !state.m01.accepted?.[0]) {
    throw new Error('learning-site progress was not persisted');
  }
  if (errors.length) throw new Error(`browser errors: ${errors.join('; ')}`);

  console.log(`✅ learning site: ${modules} modules rendered, independent progress persisted`);
  await browser.close();
}

run().catch(error => {
  console.error(`❌ ${error.message}`);
  process.exitCode = 1;
});
