import { chromium } from 'playwright';

const URL = 'http://localhost:8766/dashboard/';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on('pageerror', err => errors.push(err.message));

await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000);

// Get detailed layout info for all visible elements
const layoutInfo = await page.evaluate(() => {
  const issues = [];
  const allEls = document.querySelectorAll('*');
  const visibleEls = [];
  
  for (const el of allEls) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    
    // Skip non-visible
    if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0) continue;
    
    visibleEls.push({
      tag: el.tagName,
      id: el.id || '',
      cls: el.className?.toString()?.substring(0, 50) || '',
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      w: Math.round(rect.width),
      h: Math.round(rect.height),
    });
  }
  
  // Check for zero-height containers that should have content
  const containers = document.querySelectorAll('.card, .stat, .viz-panel, .panel, .tag-chip, .chip, .concept-canvas-wrap, .heatmap-wrap, [id$="-view"], [id$="-chart"]');
  const emptyContainers = [];
  for (const c of containers) {
    const rect = c.getBoundingClientRect();
    if (rect.height < 2 && rect.width > 50) {
      emptyContainers.push({
        tag: c.tagName,
        id: c.id,
        cls: c.className?.toString()?.substring(0, 60),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      });
    }
  }
  
  // Check for overlapping elements at same z-level
  const overlaps = [];
  const checkEls = Array.from(document.querySelectorAll('.stat, .card, .viz-tab, .phase-chip, .chip, .tag-chip, .level-chip, .chapter-chip'));
  for (let i = 0; i < checkEls.length; i++) {
    for (let j = i + 1; j < checkEls.length; j++) {
      const r1 = checkEls[i].getBoundingClientRect();
      const r2 = checkEls[j].getBoundingClientRect();
      if (r1.x < r2.x + r2.width && r1.x + r1.width > r2.x &&
          r1.y < r2.y + r2.height && r1.y + r1.height > r2.y) {
        const overlap = Math.min(r1.x + r1.width, r2.x + r2.width) - Math.max(r1.x, r2.x);
        const overlapY = Math.min(r1.y + r1.height, r2.y + r2.height) - Math.max(r1.y, r2.y);
        if (overlap > 5 && overlapY > 5) {
          overlaps.push(`${checkEls[i].id || checkEls[i].className?.toString()?.substring(0,30)} overlaps ${checkEls[j].id || checkEls[j].className?.toString()?.substring(0,30)} (${Math.round(overlap)}x${Math.round(overlapY)}px)`);
        }
      }
    }
    if (overlaps.length > 10) break;
  }
  
  // Check concept map canvas
  const canvas = document.querySelector('canvas');
  const canvasInfo = canvas ? {
    w: canvas.width,
    h: canvas.height,
    visible: canvas.getBoundingClientRect().width > 0
  } : 'no canvas';
  
  // Check for elements extending beyond viewport width
  const overflowEls = [];
  for (const el of visibleEls) {
    if (el.x + el.w > 1450 && el.w < 2000) {
      overflowEls.push(`${el.tag}#${el.id}.${el.cls} at x=${el.x} w=${el.w}`);
    }
  }
  
  return {
    totalVisible: visibleEls.length,
    emptyContainers: emptyContainers.slice(0, 15),
    overlaps: overlaps.slice(0, 10),
    canvasInfo,
    overflowEls: overflowEls.slice(0, 10),
    bodyHeight: document.body.scrollHeight,
    viewportHeight: window.innerHeight,
  };
});

console.log('=== LAYOUT ANALYSIS ===');
console.log(JSON.stringify(layoutInfo, null, 2));

// Check the concept map section specifically
console.log('\n=== CONCEPT MAP SECTION ===');
const conceptInfo = await page.evaluate(() => {
  // Find the concept map tab and click it
  const tabs = document.querySelectorAll('.viz-tab');
  let conceptTab = null;
  for (const t of tabs) {
    if (t.textContent.includes('概念')) { conceptTab = t; break; }
  }
  if (conceptTab) conceptTab.click();
  
  return new Promise(resolve => {
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      const wrap = document.querySelector('.concept-canvas-wrap, [class*="concept"]');
      const detail = document.getElementById('concept-detail');
      resolve({
        canvas: canvas ? { w: canvas.width, h: canvas.height, displayW: Math.round(canvas.getBoundingClientRect().width) } : null,
        wrap: wrap ? { cls: wrap.className, w: Math.round(wrap.getBoundingClientRect().width), h: Math.round(wrap.getBoundingClientRect().height) } : null,
        detail: detail ? { html: detail.innerHTML.substring(0, 200) } : null,
      });
    }, 2000);
  });
});
console.log(JSON.stringify(conceptInfo, null, 2));

// Check tag section
console.log('\n=== TAG SECTION ===');
const tagInfo = await page.evaluate(() => {
  const tagList = document.querySelector('[id*="tag"], .tag-list, .tag-cloud');
  const tagChips = document.querySelectorAll('.tag-chip, .chip[class*="tag"]');
  const tagStats = document.querySelector('[id*="tag-stat"]');
  return {
    tagListExists: !!tagList,
    tagListHTML: tagList?.innerHTML?.substring(0, 300),
    tagChipsCount: tagChips.length,
    tagStatsExists: !!tagStats,
  };
});
console.log(JSON.stringify(tagInfo, null, 2));

// Check color scheme
console.log('\n=== COLOR SCHEME ===');
const colorInfo = await page.evaluate(() => {
  const body = document.body;
  const bs = window.getComputedStyle(body);
  const header = document.querySelector('h1, h2, .header, header');
  const hs = header ? window.getComputedStyle(header) : null;
  const card = document.querySelector('.card, .stat');
  const cs = card ? window.getComputedStyle(card) : null;
  return {
    bodyBg: bs.backgroundColor,
    bodyColor: bs.color,
    headerBg: hs?.backgroundColor,
    cardBg: cs?.backgroundColor,
    cardBorder: cs?.borderColor,
    cssVars: {
      accent: getComputedStyle(document.documentElement).getPropertyValue('--accent'),
      surface: getComputedStyle(document.documentElement).getPropertyValue('--surface'),
      bg: getComputedStyle(document.documentElement).getPropertyValue('--bg'),
    }
  };
});
console.log(JSON.stringify(colorInfo, null, 2));

console.log('\n=== PAGE ERRORS ===');
if (errors.length === 0) console.log('No errors');
else errors.forEach(e => console.log(`  ${e}`));

await page.screenshot({ path: '/tmp/dashboard-concept.png' });

await browser.close();
