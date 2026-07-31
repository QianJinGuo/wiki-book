/**
 * Test inline mermaid extraction (no JSON file) - use direct CF URL
 */

import { chromium } from 'playwright';

async function testInlineMermaid() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[Console ${msg.type()}] ${msg.text()}`);
  });
  
  // Test with direct CF Pages URL to avoid CDN cache
  const testUrl = 'https://4b355509.ai-engineering-6yk.pages.dev/ch04/699-17-agent';
  console.log(`Testing: ${testUrl}`);
  
  await page.goto(testUrl, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  // Check for SVG in article (rendered mermaid)
  const articleSvgs = await page.locator('article svg').count();
  console.log(`\nSVGs in article: ${articleSvgs}`);
  
  // Check for mermaid containers
  const mermaidContainers = await page.locator('.mermaid, pre.mermaid').count();
  console.log(`Mermaid containers: ${mermaidContainers}`);
  
  // Check for diagram trigger
  const triggerBtn = await page.locator('.diagram-trigger').count();
  console.log(`Diagram trigger button: ${triggerBtn}`);
  
  if (triggerBtn > 0) {
    console.log('\n=== Opening Overlay ===');
    await page.locator('.diagram-trigger').click();
    await page.waitForTimeout(2000);
    
    const overlay = await page.locator('.diagram-overlay.open').count();
    console.log(`Overlay open: ${overlay > 0}`);
    
    const cards = await page.locator('.diagram-card').count();
    console.log(`Diagram cards: ${cards}`);
    
    const svgs = await page.locator('.diagram-card svg').count();
    console.log(`SVGs rendered: ${svgs}`);
    
    if (cards > 0) {
      // Test lightbox
      console.log('\n=== Testing Lightbox ===');
      await page.locator('.diagram-card-zoom').first().click();
      await page.waitForTimeout(1000);
      
      const lightbox = await page.locator('.diagram-lightbox.open').count();
      console.log(`Lightbox open: ${lightbox > 0}`);
      
      const lbSvg = await page.locator('#diagram-lb-body svg').count();
      console.log(`Lightbox SVG: ${lbSvg}`);
    }
  } else {
    console.log('\nERROR: No trigger button - extractInlineMermaid() failed');
    
    // Debug: try to manually call extractInlineMermaid
    const result = await page.evaluate(() => {
      const containers = document.querySelectorAll('pre.mermaid, .mermaid');
      const results = [];
      containers.forEach((c, i) => {
        const svg = c.querySelector('svg') || (c.tagName === 'SVG' ? c : null);
        results.push({
          tag: c.tagName,
          hasSvg: !!svg,
          className: c.className
        });
      });
      return results;
    });
    console.log('Mermaid container details:', JSON.stringify(result, null, 2));
  }
  
  await page.screenshot({ path: '/Users/jinguo/wiki-book/test-inline-mermaid.png' });
  console.log('\nScreenshot saved');
  
  await browser.close();
}

testInlineMermaid().catch(console.error);
