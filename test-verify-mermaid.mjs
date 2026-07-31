import { chromium } from 'playwright';

const browser = await chromium.launch();
const testPages = [
  { name: 'Ch04 Agent Core', url: 'https://wiki.jinguo.tech/ch04-agent-core.html' },
  { name: 'Ch05 Harness', url: 'https://wiki.jinguo.tech/ch05-harness.html' },
  { name: 'Ch06 Memory', url: 'https://wiki.jinguo.tech/ch06-memory.html' },
  { name: 'Ch10 RAG', url: 'https://wiki.jinguo.tech/ch10-rag.html' },
  { name: 'Ch04/056 子文章', url: 'https://wiki.jinguo.tech/ch04/056-agent.html' },
];

let allPass = true;

for (const tp of testPages) {
  const page = await browser.newPage();
  try {
    await page.goto(tp.url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(10000);

    const r = await page.evaluate(() => {
      const mermaidDivs = document.querySelectorAll('div.mermaid');
      const withSvg = Array.from(mermaidDivs).filter(d => d.querySelector('svg') !== null).length;
      const withDataSrc = Array.from(mermaidDivs).filter(d => d.getAttribute('data-mermaid-src')).length;
      const emptyDivs = Array.from(mermaidDivs).filter(d => !d.querySelector('svg') && d.textContent.trim() === '').length;
      const bigSvgs = Array.from(document.querySelectorAll('svg')).filter(s => s.innerHTML.length > 2000).length;
      return { mermaidDivs: mermaidDivs.length, withSvg, withDataSrc, emptyDivs, bigSvgs };
    });

    const ok = r.withSvg > 0 && r.emptyDivs === 0;
    if (!ok) allPass = false;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${tp.name}: divs=${r.mermaidDivs} svg=${r.withSvg} empty=${r.emptyDivs} dataSrc=${r.withDataSrc} bigSvgs=${r.bigSvgs}`);
  } catch(e) {
    allPass = false;
    console.log(`FAIL ${tp.name}: ${e.message.substring(0, 80)}`);
  }
  await page.close();
}

console.log(`\n${allPass ? 'ALL PASSED' : 'SOME FAILED'}`);
await browser.close();
