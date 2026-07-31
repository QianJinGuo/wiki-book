import { chromium } from 'playwright';

async function testMermaidHtml() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const testUrl = 'https://4b355509.ai-engineering-6yk.pages.dev/ch04/699-17-agent';
  console.log(`Testing: ${testUrl}`);
  
  await page.goto(testUrl, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  // Get the HTML structure of mermaid elements
  const html = await page.evaluate(() => {
    const mermaids = document.querySelectorAll('.mermaid, pre.mermaid, [class*="mermaid"]');
    const results = [];
    mermaids.forEach((el, i) => {
      results.push({
        index: i,
        tag: el.tagName,
        className: el.className,
        innerHTML: el.innerHTML.slice(0, 300),
        childCount: el.children.length,
        firstChild: el.firstElementChild ? {
          tag: el.firstElementChild.tagName,
          className: el.firstElementChild.className
        } : null
      });
    });
    return results;
  });
  
  console.log('\n=== Mermaid HTML Structure ===');
  console.log(JSON.stringify(html, null, 2));
  
  // Also check for SVGs anywhere in article
  const svgInfo = await page.evaluate(() => {
    const svgs = document.querySelectorAll('article svg');
    return Array.from(svgs).slice(0, 3).map((svg, i) => ({
      index: i,
      viewBox: svg.getAttribute('viewBox'),
      className: svg.className,
      parentTag: svg.parentElement.tagName,
      parentClass: svg.parentElement.className,
      width: svg.getAttribute('width') || svg.style.width
    }));
  });
  
  console.log('\n=== SVG Info ===');
  console.log(JSON.stringify(svgInfo, null, 2));
  
  await browser.close();
}

testMermaidHtml().catch(console.error);
