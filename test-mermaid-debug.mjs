import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

const allLogs = [];
page.on('console', msg => allLogs.push(`${msg.type()}: ${msg.text()}`));

// Use the fresh deployment URL
await page.goto('https://95f6778c.ai-engineering-6yk.pages.dev/ch04/056-agent.html', { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(15000);

const debug = await page.evaluate(async () => {
  const pres = document.querySelectorAll('pre.mermaid');
  const preInfo = Array.from(pres).map(p => ({
    hasCode: p.querySelector('code') !== null,
    textLen: p.textContent.length,
    textPreview: p.textContent.substring(0, 100)
  }));
  
  const divs = document.querySelectorAll('div.mermaid');
  const divInfo = Array.from(divs).map(d => ({
    hasSvg: d.querySelector('svg') !== null,
    textLen: d.textContent.length,
    dataSrc: d.getAttribute('data-mermaid-src')?.substring(0, 100)
  }));

  // Try manual render
  let manualResult = 'NOT TRIED';
  if (typeof mermaid !== 'undefined') {
    try {
      const r = await mermaid.render('test-manual', 'graph LR\n  A-->B');
      manualResult = 'SUCCESS: svg length = ' + r.svg.length;
    } catch(e) {
      manualResult = 'ERROR: ' + (e.message || String(e)).substring(0, 200);
    }
  }

  return { preInfo, divInfo, manualResult, mermaidLoaded: typeof mermaid !== 'undefined' };
});

console.log(JSON.stringify(debug, null, 2));

const mermaidLogs = allLogs.filter(l => l.includes('mermaid') || l.includes('Mermaid') || l.includes('Diagram'));
if (mermaidLogs.length) console.log('Mermaid logs:', mermaidLogs.slice(0, 5));

await browser.close();
