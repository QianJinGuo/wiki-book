import { chromium } from 'playwright';

const browser = await chromium.launch();
const pages = [
  'ch04-agent-core.html',
  'ch05-harness.html',
  'ch06-memory.html',
  'ch10-rag.html'
];

for (const p of pages) {
  const page = await browser.newPage();
  try {
    await page.goto('https://f5ee4701.ai-engineering-6yk.pages.dev/' + p, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(8000);
    
    const result = await page.evaluate(() => {
      const divs = document.querySelectorAll('div.mermaid');
      const svgDivs = Array.from(divs).filter(d => d.querySelector('svg') !== null).length;
      const emptyDivs = Array.from(divs).filter(d => d.textContent.trim() === '' && !d.querySelector('svg')).length;
      const dataSrc = Array.from(divs).filter(d => d.getAttribute('data-mermaid-src')).length;
      const totalSvgs = document.querySelectorAll('svg').length;
      const graphSvgs = Array.from(document.querySelectorAll('svg')).filter(s => s.innerHTML.length > 2000).length;
      return { mermaidDivs: divs.length, svgDivs, emptyDivs, dataSrc, totalSvgs, graphSvgs };
    });
    
    console.log(p + ': ' + JSON.stringify(result));
  } catch(e) {
    console.log(p + ': ERROR - ' + e.message.substring(0, 100));
  }
  await page.close();
}

await browser.close();
