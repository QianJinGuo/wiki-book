import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://jinguo.tech/ch04/699-17-agent', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  // Find where SVGs are located
  const svgParents = await page.evaluate(() => {
    const svgs = document.querySelectorAll('article svg');
    return Array.from(svgs).slice(0, 5).map(svg => {
      let path = [];
      let el = svg;
      while (el && el.tagName !== 'ARTICLE') {
        path.unshift({ tag: el.tagName, class: el.className });
        el = el.parentElement;
      }
      return { path, viewBox: svg.getAttribute('viewBox') };
    });
  });
  
  console.log('=== SVG Parent Paths ===');
  console.log(JSON.stringify(svgParents, null, 2));
  
  await browser.close();
}

test().catch(console.error);
