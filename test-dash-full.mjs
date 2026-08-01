import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });

// Desktop test
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', err => errors.push(err.message));
page.on('console', msg => { if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`); });

await page.goto('http://localhost:8766/dashboard/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000);

// Check overall layout
const layout = await page.evaluate(() => {
  const stats = document.querySelectorAll('.stat');
  const statInfo = Array.from(stats).map(s => ({
    label: s.querySelector('.label')?.textContent,
    num: s.querySelector('.num')?.textContent,
    hasIcon: !!s.querySelector('.stat-icon'),
  }));
  
  const cards = document.querySelectorAll('.card');
  const firstCard = cards[0];
  const cardInfo = firstCard ? {
    title: firstCard.querySelector('.card-title')?.textContent?.substring(0, 50),
    hasTags: !!firstCard.querySelector('.card-tags'),
    tagCount: firstCard.querySelectorAll('.card-tag').length,
    hasLevelBtn: !!firstCard.querySelector('.level-btn'),
    rect: {
      w: Math.round(firstCard.getBoundingClientRect().width),
      h: Math.round(firstCard.getBoundingClientRect().height),
    }
  } : null;
  
  return { statInfo, cardCount: cards.length, cardInfo };
});
console.log('=== DESKTOP LAYOUT ===');
console.log('Stats:', JSON.stringify(layout.statInfo, null, 2));
console.log('First card:', JSON.stringify(layout.cardInfo, null, 2));

// Test all viz tabs
console.log('\n=== VIZ TABS ===');
const vizTabs = await page.$$('.viz-tab');
for (const tab of vizTabs) {
  const text = await tab.textContent();
  const beforeErrors = errors.length;
  await tab.click();
  await page.waitForTimeout(2000);
  const activePanel = await page.evaluate(() => {
    const p = document.querySelector('.viz-panel.active');
    if (!p) return null;
    const svg = p.querySelector('svg');
    const canvas = p.querySelector('canvas');
    return {
      id: p.id,
      height: Math.round(p.getBoundingClientRect().height),
      hasSVG: !!svg,
      svgChildren: svg ? svg.children.length : 0,
      hasCanvas: !!canvas,
    };
  });
  const newErrors = errors.length - beforeErrors;
  console.log(`Tab "${text.trim()}": panel=${activePanel?.id} h=${activePanel?.height} svg=${activePanel?.hasSVG}(${activePanel?.svgChildren} children) canvas=${activePanel?.hasCanvas} errors=${newErrors}`);
}

// Mobile test
console.log('\n=== MOBILE TEST ===');
const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
const mobileErrors = [];
mobilePage.on('pageerror', err => mobileErrors.push(err.message));
await mobilePage.goto('http://localhost:8766/dashboard/', { waitUntil: 'networkidle', timeout: 30000 });
await mobilePage.waitForTimeout(2000);

const mobileInfo = await mobilePage.evaluate(() => ({
  bodyHeight: document.body.scrollHeight,
  cardCount: document.querySelectorAll('.card').length,
  cardWidth: document.querySelector('.card')?.getBoundingClientRect().width,
  statsPerRow: (() => {
    const stats = document.querySelectorAll('.stat');
    if (stats.length < 2) return 0;
    return Math.round(stats[0].getBoundingClientRect().width) === Math.round(stats[1].getBoundingClientRect().width) 
      ? Math.round(375 / stats[0].getBoundingClientRect().width) : 'mixed';
  })(),
  hasOverflow: document.body.scrollWidth > 375,
}));
console.log(JSON.stringify(mobileInfo, null, 2));
if (mobileErrors.length > 0) console.log('Mobile errors:', mobileErrors);

console.log('\n=== ALL ERRORS ===');
if (errors.length === 0 && mobileErrors.length === 0) console.log('No errors');
else [...errors, ...mobileErrors].forEach(e => console.log(`  ${e}`));

await browser.close();
