import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://jinguo.tech/ch04/699-17-agent', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Find pre.mermaid blocks
  const preMermaid = await page.evaluate(() => {
    const pres = document.querySelectorAll('pre.mermaid');
    return Array.from(pres).map(p => ({
      outerHTML: p.outerHTML.slice(0, 500),
      textContent: (p.textContent || '').slice(0, 100)
    }));
  });
  
  console.log(`Found ${preMermaid.length} pre.mermaid blocks`);
  preMermaid.forEach((p, i) => {
    console.log(`\nBlock ${i}:`);
    console.log(p.outerHTML);
  });
  
  // Also find div.mermaid
  const divMermaid = await page.evaluate(() => {
    const divs = document.querySelectorAll('div.mermaid');
    return Array.from(divs).map(d => ({
      outerHTML: d.outerHTML.slice(0, 500),
      innerHTML: d.innerHTML.slice(0, 200)
    }));
  });
  
  console.log(`\n\nFound ${divMermaid.length} div.mermaid blocks`);
  divMermaid.forEach((d, i) => {
    console.log(`\nDiv ${i}:`);
    console.log(d.outerHTML);
  });
  
  await browser.close();
}

test().catch(console.error);
