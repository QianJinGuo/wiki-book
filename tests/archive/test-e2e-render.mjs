import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const consoleErrors = [];
const pageErrors = [];
page.on('console', msg => { if(msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => pageErrors.push(err.message));

console.log('=== 1. Loading page ===');
await page.goto('https://jinguo.tech/dashboard/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(8000);

// ── Screenshot 1: Full top section ──
await page.screenshot({ path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/e2e-01-top.png' });

// ── Check header + phase bar + stats ──
console.log('\n=== 2. Header & Phase Bar ===');
const headerH1 = await page.locator('.header h1').textContent();
console.log('Header:', headerH1?.trim());
const phaseChips = await page.locator('.phase-chip').count();
console.log('Phase chips:', phaseChips);
const statsCount = await page.locator('.stat').count();
console.log('Stats cards:', statsCount);

// ── Check tag filters ──
console.log('\n=== 3. Tag Filters ===');
const tagChips = await page.locator('#tag-filters .tag-chip').count();
console.log('Tag chips:', tagChips);
const tagWrapBox = await page.locator('#tag-filters-wrap').boundingBox();
console.log('Tag wrap box:', JSON.stringify(tagWrapBox));
// Check if tag chips are clipped/overflowing
const tagOverflow = await page.locator('#tag-filters').evaluate(el => {
  const r = el.getBoundingClientRect();
  const parent = el.parentElement.getBoundingClientRect();
  return { right: Math.round(r.right), parentRight: Math.round(parent.right), overflow: r.right > parent.right };
});
console.log('Tag overflow check:', JSON.stringify(tagOverflow));

// ── Check controls layout ──
console.log('\n=== 4. Controls ===');
const controlsBox = await page.locator('.controls').boundingBox();
console.log('Controls box:', JSON.stringify(controlsBox));
const searchBox = await page.locator('.search-box').boundingBox();
console.log('Search box:', JSON.stringify(searchBox));
const chapterFilters = await page.locator('#chapter-filters .chip').count();
const levelFilters = await page.locator('#level-filters .chip').count();
console.log('Chapter filter chips:', chapterFilters, '| Level filter chips:', levelFilters);

// ── Check progress bars ──
console.log('\n=== 5. Progress Bars ===');
const progressBars = await page.locator('.phase-progress').count();
console.log('Progress bars:', progressBars);

// ── Check heatmap ──
console.log('\n=== 6. Heatmap ===');
const heatmapCells = await page.locator('.heatmap-cell').count();
console.log('Heatmap cells:', heatmapCells);

// ── Check viz section ──
console.log('\n=== 7. Visualization Section ===');
const vizTabs = await page.locator('.viz-tab').count();
console.log('Viz tabs:', vizTabs);
const vizTabTexts = await page.locator('.viz-tab').evaluateAll(els => els.map(e => e.textContent.trim()));
console.log('Viz tab texts:', vizTabTexts);

// ── Check daily section ──
console.log('\n=== 8. Daily Section ===');
const dailyGrid = await page.locator('#smart-daily-grid').innerHTML();
console.log('Daily grid HTML length:', dailyGrid.length);
console.log('Daily grid (first 200):', dailyGrid.slice(0, 200));

// ── Check cards ──
console.log('\n=== 9. Article Cards ===');
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
const cardCount = await page.locator('.card').count();
console.log('Total cards:', cardCount);
const cardTagCount = await page.locator('.card-tag').count();
console.log('Card tags:', cardTagCount);

// Check first card structure
const firstCardInfo = await page.locator('.card').first().evaluate(el => {
  const r = el.getBoundingClientRect();
  const title = el.querySelector('.card-title')?.textContent?.trim()?.slice(0, 50);
  const tags = el.querySelector('.card-tags');
  const tagTexts = tags ? Array.from(tags.querySelectorAll('.card-tag')).map(t => t.textContent) : [];
  return { title, tags: tagTexts, w: Math.round(r.width), h: Math.round(r.height) };
});
console.log('First card:', JSON.stringify(firstCardInfo, null, 2));

// Screenshot 2: Cards
await page.evaluate(() => window.scrollBy(0, 600));
await page.waitForTimeout(500);
await page.screenshot({ path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/e2e-02-cards.png' });

// ── Check card grid alignment ──
console.log('\n=== 10. Card Grid Alignment ===');
const gridInfo = await page.locator('.grid').first().evaluate(el => {
  const cs = window.getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return { display: cs.display, cols: cs.gridTemplateColumns, width: Math.round(r.width) };
});
console.log('Grid info:', JSON.stringify(gridInfo));

// Check first row card heights
const rowHeights = await page.locator('.card').evaluateAll((cards) => {
  const rows = {};
  cards.slice(0, 12).forEach(c => {
    const r = c.getBoundingClientRect();
    const rowTop = Math.round(r.top);
    if(!rows[rowTop]) rows[rowTop] = [];
    rows[rowTop].push(Math.round(r.height));
  });
  return Object.entries(rows).map(([top, heights]) => ({ top: parseInt(top), heights }));
});
console.log('Card row heights:', JSON.stringify(rowHeights));

// ── Tag filter test ──
console.log('\n=== 11. Tag Filter Test ===');
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await page.locator('#tag-filters .tag-chip[data-tag="security"]').click();
await page.waitForTimeout(800);
const securityCards = await page.locator('.card').count();
console.log('Cards after "security" filter:', securityCards);
// Check all visible cards have security tag
const allHaveSecurity = await page.locator('.card').evaluateAll((cards) => {
  return cards.filter(c => {
    const tags = Array.from(c.querySelectorAll('.card-tag')).map(t => t.textContent);
    return !tags.includes('security');
  }).length;
});
console.log('Cards WITHOUT visible security tag:', allHaveSecurity, '(expected: some, since cards only show top 4 tags)');
await page.screenshot({ path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/e2e-03-tag-filter.png' });
// Reset
await page.locator('#tag-filters .tag-chip').first().click();
await page.waitForTimeout(500);

// ── Concept map test ──
console.log('\n=== 12. Concept Map ===');
await page.locator('#viz-toggle').click();
await page.waitForTimeout(500);
await page.locator('.viz-tab[data-tab="concept"]').click();
await page.waitForTimeout(2000);
await page.screenshot({ path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/e2e-04-concept-map.png' });

const svgBox = await page.locator('#concept-map-container svg').boundingBox();
console.log('SVG box:', JSON.stringify(svgBox));
const nodeCount = await page.locator('.concept-node').count();
const edgeCount = await page.locator('.concept-edge').count();
const labelCount = await page.locator('.concept-node-label').count();
console.log('Nodes:', nodeCount, '| Edges:', edgeCount, '| Labels:', labelCount);

// Label overlap check
const labels = await page.locator('.concept-node-label').evaluateAll(els =>
  els.map(e => {
    const r = e.getBoundingClientRect();
    return { text: e.textContent.slice(0, 20), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  })
);
let labelOverlaps = 0;
let overlapPairs = [];
for(let i = 0; i < labels.length; i++) {
  for(let j = i+1; j < labels.length; j++) {
    const a = labels[i], b = labels[j];
    if(a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) {
      labelOverlaps++;
      overlapPairs.push([a.text, b.text]);
    }
  }
}
console.log('Label overlaps:', labelOverlaps);
if(overlapPairs.length) console.log('Overlap pairs:', JSON.stringify(overlapPairs));

// Node overlap check
const nodeOverlaps = await page.locator('.concept-node circle').evaluateAll(els => {
  const pos = els.map(e => {
    const r = e.getBoundingClientRect();
    return { cx: r.x + r.width/2, cy: r.y + r.height/2, radius: r.width/2 };
  });
  let count = 0;
  for(let i = 0; i < pos.length; i++) {
    for(let j = i+1; j < pos.length; j++) {
      const dx = pos[i].cx - pos[j].cx;
      const dy = pos[i].cy - pos[j].cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < pos[i].radius + pos[j].radius + 2) count++;
    }
  }
  return count;
});
console.log('Node overlaps:', nodeOverlaps);

// Labels outside SVG check
const labelsOutside = labels.filter(l => {
  return l.x < svgBox.x || l.x + l.w > svgBox.x + svgBox.width || l.y < svgBox.y || l.y + l.h > svgBox.y + svgBox.height;
});
console.log('Labels outside SVG:', labelsOutside.length);
if(labelsOutside.length) console.log('Outside labels:', JSON.stringify(labelsOutside));

// ── Concept detail test ──
console.log('\n=== 13. Concept Detail ===');
await page.locator('.concept-node').first().click();
await page.waitForTimeout(500);
await page.screenshot({ path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/e2e-05-concept-detail.png' });

const detailOpen = await page.locator('#concept-detail.open').count();
console.log('Detail panel open:', detailOpen > 0);
const detailTitle = await page.locator('.concept-detail-title').textContent();
const detailMeta = await page.locator('.concept-detail-meta').textContent();
const detailArticles = await page.locator('#concept-detail .concept-detail-article').count();
console.log('Detail title:', detailTitle?.trim());
console.log('Detail meta:', detailMeta?.trim());
console.log('Detail articles:', detailArticles);

// Concept filter
await page.locator('#concept-detail .tag-chip.active').click();
await page.waitForTimeout(800);
const activeTag = await page.locator('#tag-filters .tag-chip.active').textContent();
const conceptFilteredCards = await page.locator('.card').count();
console.log('After concept filter:', activeTag.trim().slice(0,40), '| Cards:', conceptFilteredCards);
await page.screenshot({ path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/e2e-06-concept-filter.png' });

// ── Other viz tabs ──
console.log('\n=== 14. Other Viz Tabs ===');
await page.locator('#tag-filters .tag-chip').first().click();
await page.waitForTimeout(300);

for(const tab of ['graph', 'flow', 'coverage', 'path']) {
  await page.locator('.viz-tab[data-tab="'+tab+'"]').click();
  await page.waitForTimeout(1000);
  const panelVisible = await page.locator('#viz-'+tab).isVisible();
  const hasContent = await page.locator('#viz-'+tab).evaluate(el => el.children.length > 0 && el.innerHTML.length > 50);
  console.log(`Tab "${tab}": visible=${panelVisible}, hasContent=${hasContent}`);
}

// ── Errors summary ──
console.log('\n=== 15. Errors ===');
console.log('Console errors:', consoleErrors.length);
consoleErrors.forEach(e => console.log('  ', e));
console.log('Page errors:', pageErrors.length);
pageErrors.forEach(e => console.log('  ', e));

await browser.close();
console.log('\n=== E2E Complete ===');
