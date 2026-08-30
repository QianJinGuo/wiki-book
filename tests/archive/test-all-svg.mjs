import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://jinguo.tech/ch04/699-17-agent', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  // Find all SVGs and their locations
  const allSvgs = await page.evaluate(() => {
    const svgs = document.querySelectorAll('svg');
    return Array.from(svgs).map(svg => {
      // Find closest meaningful parent
      const parent = svg.closest('pre, code, .mermaid, .highlight, figure, div[class]');
      return {
        parentTag: parent ? parent.tagName : 'none',
        parentClass: parent ? parent.className : 'none',
        viewBox: svg.getAttribute('viewBox'),
        hasText: (svg.textContent || '').length > 50
      };
    });
  });
  
  console.log(`Found ${allSvgs.length} SVGs`);
  console.log(JSON.stringify(allSvgs.slice(0, 10), null, 2));
  
  await browser.close();
}

test().catch(console.error);
