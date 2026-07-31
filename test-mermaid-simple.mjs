import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Use a shorter timeout and load event only
  await page.goto('https://jinguo.tech/ch04/699-17-agent', { waitUntil: 'load', timeout: 30000 });
  
  // Wait for mermaid to render
  console.log('Waiting 10 seconds...');
  await page.waitForTimeout(10000);
  
  // Check mermaid
  const info = await page.evaluate(() => {
    const mermaids = document.querySelectorAll('.mermaid');
    const svgs = document.querySelectorAll('svg');
    return {
      mermaidCount: mermaids.length,
      svgCount: svgs.length,
      mermaidHasSvg: Array.from(mermaids).map(m => !!m.querySelector('svg'))
    };
  });
  
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
}

test().catch(console.error);
