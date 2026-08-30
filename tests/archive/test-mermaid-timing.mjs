import { chromium } from 'playwright';

async function testMermaidTiming() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const testUrl = 'https://4b355509.ai-engineering-6yk.pages.dev/ch04/699-17-agent';
  console.log(`Testing: ${testUrl}`);
  
  await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 120000 });
  
  // Wait longer for mermaid to render
  console.log('\nWaiting 5 seconds for mermaid to render...');
  await page.waitForTimeout(5000);
  
  // Check for mermaid SVGs
  const mermaidInfo = await page.evaluate(() => {
    const mermaids = document.querySelectorAll('.mermaid');
    const results = [];
    mermaids.forEach((el, i) => {
      results.push({
        index: i,
        tag: el.tagName,
        className: el.className,
        innerHTML: el.innerHTML.slice(0, 200),
        childCount: el.children.length,
        hasSvg: !!el.querySelector('svg')
      });
    });
    return results;
  });
  
  console.log('\n=== Mermaid Info ===');
  console.log(JSON.stringify(mermaidInfo, null, 2));
  
  // Check for any SVGs in the page
  const allSvgs = await page.locator('svg').count();
  console.log(`\nTotal SVGs in page: ${allSvgs}`);
  
  await browser.close();
}

testMermaidTiming().catch(console.error);
