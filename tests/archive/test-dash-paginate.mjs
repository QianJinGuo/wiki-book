import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on('pageerror', err => errors.push(err.message));

await page.goto('http://localhost:8766/dashboard/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000);

// Check pagination
const pageInfo = await page.evaluate(() => {
  const cards = document.querySelectorAll('.card');
  const loadMoreBtn = document.querySelector('.load-more-btn');
  const resultCount = document.querySelector('.result-count');
  return {
    cardCount: cards.length,
    bodyHeight: document.body.scrollHeight,
    hasLoadMoreBtn: !!loadMoreBtn,
    loadMoreText: loadMoreBtn?.textContent,
    resultCountText: resultCount?.textContent,
  };
});
console.log('=== PAGINATION CHECK ===');
console.log(JSON.stringify(pageInfo, null, 2));

// Click load more and check
if (pageInfo.hasLoadMoreBtn) {
  await page.click('.load-more-btn');
  await page.waitForTimeout(1000);
  const afterLoad = await page.evaluate(() => {
    return {
      cardCount: document.querySelectorAll('.card').length,
      bodyHeight: document.body.scrollHeight,
      hasLoadMoreBtn: !!document.querySelector('.load-more-btn'),
    };
  });
  console.log('\n=== AFTER LOAD MORE ===');
  console.log(JSON.stringify(afterLoad, null, 2));
}

// Test filter reset - click Phase 1
console.log('\n=== TEST FILTER RESET ===');
await page.evaluate(() => {
  // Click "全部" phase to reset
  const chips = document.querySelectorAll('.phase-chip');
  if (chips[0]) chips[0].click();
});
await page.waitForTimeout(1500);
const afterFilter = await page.evaluate(() => ({
  cardCount: document.querySelectorAll('.card').length,
  hasLoadMoreBtn: !!document.querySelector('.load-more-btn'),
}));
console.log(JSON.stringify(afterFilter, null, 2));

console.log('\n=== ERRORS ===');
if (errors.length === 0) console.log('No errors');
else errors.forEach(e => console.log(`  ${e}`));

await browser.close();
