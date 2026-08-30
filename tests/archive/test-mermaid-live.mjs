import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('https://wiki.jinguo.tech/ch04/056-agent.html', { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(15000);

const result = await page.evaluate(() => {
  const mermaidDivs = document.querySelectorAll('div.mermaid');
  const divDetails = Array.from(mermaidDivs).map(el => ({
    hasSvg: el.querySelector('svg') !== null,
    textLen: el.textContent.trim().length,
    childTags: Array.from(el.children).map(c => c.tagName).join(',')
  }));
  
  // Check for rendered mermaid graphs (SVGs with viewBox typical of diagrams)
  const graphSvgs = Array.from(document.querySelectorAll('svg')).filter(s => {
    const vb = s.getAttribute('viewBox');
    return vb && vb.includes('0 0') && s.innerHTML.length > 500;
  }).length;

  return { 
    mermaidDivCount: mermaidDivs.length,
    divDetails,
    graphSvgs,
    mermaidJsLoaded: typeof mermaid !== 'undefined'
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
