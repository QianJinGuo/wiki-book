import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:8766/dashboard/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000);

// Find what's causing the extreme height
const heightAnalysis = await page.evaluate(() => {
  const results = [];
  const body = document.body;
  
  // Check direct children of body for height
  for (const child of body.children) {
    const rect = child.getBoundingClientRect();
    if (rect.height > 1000) {
      results.push({
        tag: child.tagName,
        id: child.id,
        cls: child.className?.toString()?.substring(0, 60),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
      });
    }
  }
  
  // Also check for elements with extreme height
  const allEls = document.querySelectorAll('div, section, main, article');
  const tallEls = [];
  for (const el of allEls) {
    const rect = el.getBoundingClientRect();
    if (rect.height > 5000) {
      tallEls.push({
        tag: el.tagName,
        id: el.id,
        cls: el.className?.toString()?.substring(0, 60),
        height: Math.round(rect.height),
      });
    }
    if (tallEls.length > 20) break;
  }
  
  return { directChildren: results, tallElements: tallEls, bodyHeight: body.scrollHeight };
});

console.log('=== HEIGHT ANALYSIS ===');
console.log('Body height:', heightAnalysis.bodyHeight);
console.log('\nDirect children > 1000px:');
heightAnalysis.directChildren.forEach(c => console.log(`  ${c.tag}#${c.id}.${c.cls} h=${c.height} top=${c.top}`));
console.log('\nElements > 5000px:');
heightAnalysis.tallElements.forEach(c => console.log(`  ${c.tag}#${c.id}.${c.cls} h=${c.height}`));

// Now check the article list - is it rendering all 4107 articles?
const articleCount = await page.evaluate(() => {
  const cards = document.querySelectorAll('.card');
  const content = document.getElementById('content');
  return {
    cardCount: cards.length,
    contentChildCount: content?.children?.length,
    contentHeight: content ? Math.round(content.getBoundingClientRect().height) : 0,
  };
});
console.log('\n=== ARTICLE LIST ===');
console.log(JSON.stringify(articleCount, null, 2));

// Check the concept map - why no canvas?
const conceptDebug = await page.evaluate(() => {
  // Click the concept tab
  const tabs = document.querySelectorAll('.viz-tab');
  let conceptTab = null;
  for (const t of tabs) {
    if (t.textContent.includes('概念')) { 
      conceptTab = t; 
      t.click();
      break;
    }
  }
  
  return new Promise(resolve => {
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      const conceptWrap = document.querySelector('[id*="concept"], [class*="concept-canvas"]');
      const allConceptEls = Array.from(document.querySelectorAll('[id*="concept"], [class*="concept"]'));
      const vizPanels = Array.from(document.querySelectorAll('.viz-panel'));
      
      resolve({
        canvasExists: !!canvas,
        conceptTabFound: !!conceptTab,
        conceptEls: allConceptEls.map(e => ({ 
          tag: e.tagName, id: e.id, cls: e.className?.toString()?.substring(0, 40),
          w: Math.round(e.getBoundingClientRect().width),
          h: Math.round(e.getBoundingClientRect().height),
          visible: e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0
        })),
        vizPanels: vizPanels.map(p => ({
          id: p.id, 
          display: window.getComputedStyle(p).display,
          h: Math.round(p.getBoundingClientRect().height)
        })),
      });
    }, 2000);
  });
});
console.log('\n=== CONCEPT MAP DEBUG ===');
console.log(JSON.stringify(conceptDebug, null, 2));

await browser.close();
