import { chromium } from 'playwright';

const browser = await chromium.launch();
const testPages = [
  { name: 'Ch04 Agent Core (章节页)', url: 'https://wiki.jinguo.tech/ch04-agent-core.html' },
  { name: 'Ch09/008 Skill Stack (新)', url: 'https://wiki.jinguo.tech/ch09/008-anthropic-95-agent-skill-21-95.html' },
  { name: 'Ch09/011 Claude Code (新)', url: 'https://wiki.jinguo.tech/ch09/011-claude-code.html' },
  { name: 'Ch09/013 Agent增强层 (新)', url: 'https://wiki.jinguo.tech/ch09/013-agent-agent.html' },
  { name: 'Ch04/056 子文章 (旧)', url: 'https://wiki.jinguo.tech/ch04/056-agent.html' },
];

let pass = 0, fail = 0;

for (const tp of testPages) {
  const page = await browser.newPage();
  try {
    await page.goto(tp.url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(12000);

    const r = await page.evaluate(() => {
      const divs = document.querySelectorAll('div.mermaid');
      const withSvg = Array.from(divs).filter(d => d.querySelector('svg') !== null).length;
      const emptyDivs = Array.from(divs).filter(d => !d.querySelector('svg') && d.textContent.trim() === '').length;
      const bigSvgs = Array.from(document.querySelectorAll('svg')).filter(s => s.innerHTML.length > 2000).length;
      return { divs: divs.length, withSvg, emptyDivs, bigSvgs };
    });

    const ok = r.withSvg > 0 && r.emptyDivs === 0;
    if (ok) pass++; else fail++;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${tp.name}: divs=${r.divs} svg=${r.withSvg} empty=${r.emptyDivs} bigSvgs=${r.bigSvgs}`);
  } catch(e) {
    fail++;
    console.log(`FAIL ${tp.name}: ${e.message.substring(0, 80)}`);
  }
  await page.close();
}

// Also count total mermaid diagrams across a sample of pages
const countPage = await browser.newPage();
try {
  await countPage.goto('https://wiki.jinguo.tech/ch04-agent-core.html', { waitUntil: 'load', timeout: 30000 });
  await countPage.waitForTimeout(10000);
  const ch04core = await countPage.evaluate(() => document.querySelectorAll('div.mermaid svg').length);
  console.log(`\nCh04章节页 mermaid SVG数: ${ch04core}`);
} catch(e) {}
await countPage.close();

console.log(`\n${pass + fail} tested: ${pass} passed, ${fail} failed`);
await browser.close();
