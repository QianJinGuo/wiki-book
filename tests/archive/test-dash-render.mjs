import { chromium } from 'playwright';

const URL = 'http://localhost:8766/dashboard/';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
const consoleMsgs = [];
const failedRequests = [];

page.on('console', msg => {
  const type = msg.type();
  if (type === 'error' || type === 'warning') {
    consoleMsgs.push(`[${type}] ${msg.text()}`);
  }
});
page.on('pageerror', err => {
  errors.push(err.message);
});
page.on('requestfailed', req => {
  failedRequests.push(`${req.url()} - ${req.failure()?.errorText}`);
});

console.log('Loading page...');
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000);

// Check what's visible
const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
console.log('\n=== BODY TEXT (first 500 chars) ===');
console.log(bodyText);

// Check for null element issues
const nullChecks = await page.evaluate(() => {
  const results = {};
  const ids = ['content', 'stats', 'heatmap-grid', 'smart-daily-grid', 'recall-list', 
    'tag-stats', 'tag-cloud', 'concept-canvas', 'concept-detail', 'challenge-stats',
    'challenge-questions', 'coverage-chart', 'dag-view', 'collision-box',
    'sankey-chart', 'mermaid-diagram', 'output-log', 'feynman-modal',
    'daily-title', 'daily-meta', 'daily-actions'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    results[id] = el ? 'exists' : 'NULL';
  });
  return results;
});
console.log('\n=== ELEMENT CHECKS ===');
console.log(JSON.stringify(nullChecks, null, 2));

// Check which tabs/sections exist
const tabInfo = await page.evaluate(() => {
  const tabs = document.querySelectorAll('.viz-tab, [data-tab], .tab');
  const sections = document.querySelectorAll('section, .section');
  return {
    tabCount: tabs.length,
    sectionCount: sections.length,
    tabTexts: Array.from(tabs).map(t => t.textContent?.trim()).slice(0, 20),
    sectionIds: Array.from(sections).map(s => s.id || s.className).slice(0, 20)
  };
});
console.log('\n=== TAB/SECTION INFO ===');
console.log(JSON.stringify(tabInfo, null, 2));

// Take screenshot of full page
await page.screenshot({ path: '/tmp/dashboard-full.png', fullPage: true });
console.log('\nFull page screenshot saved');

// Take viewport screenshot
await page.screenshot({ path: '/tmp/dashboard-viewport.png', fullPage: false });
console.log('Viewport screenshot saved');

// Click through tabs to check for errors
const vizTabs = await page.$$('.viz-tab');
console.log(`\n=== TESTING ${vizTabs.length} VIZ TABS ===`);
for (let i = 0; i < vizTabs.length; i++) {
  const tabText = await vizTabs[i].textContent();
  const beforeErrors = errors.length;
  try {
    await vizTabs[i].click();
    await page.waitForTimeout(1500);
    const afterErrors = errors.length;
    if (afterErrors > beforeErrors) {
      console.log(`Tab "${tabText}": ${afterErrors - beforeErrors} new errors`);
    } else {
      console.log(`Tab "${tabText}": OK`);
    }
  } catch(e) {
    console.log(`Tab "${tabText}": click failed - ${e.message}`);
  }
}

console.log('\n=== PAGE ERRORS ===');
if (errors.length === 0) console.log('No page errors');
errors.forEach(e => console.log(`  ${e}`));

console.log('\n=== CONSOLE ERRORS/WARNINGS ===');
if (consoleMsgs.length === 0) console.log('No console errors/warnings');
consoleMsgs.forEach(m => console.log(`  ${m}`));

console.log('\n=== FAILED REQUESTS ===');
if (failedRequests.length === 0) console.log('No failed requests');
failedRequests.forEach(r => console.log(`  ${r}`));

await browser.close();
