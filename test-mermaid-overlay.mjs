/**
 * Test mermaid diagram overlay functionality
 */

import { chromium } from 'playwright';

const PRODUCTION_URL = 'https://jinguo.tech';

async function testMermaidOverlay() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const testUrl = `${PRODUCTION_URL}/ch04/700-cpu-agent-l1-l2-l3-execute-code`;
  console.log(`Testing: ${testUrl}`);
  
  // Collect console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Navigate to page - use 'load' instead of 'networkidle'
  await page.goto(testUrl, { waitUntil: 'load', timeout: 60000 });
  console.log('Page loaded, waiting for JS...');
  await page.waitForTimeout(3000);
  
  // 1. Check for mermaid blocks in page
  const mermaidBlocks = await page.locator('pre.mermaid').count();
  console.log(`\n=== Page Analysis ===`);
  console.log(`Mermaid blocks in page: ${mermaidBlocks}`);
  
  // Check mermaid block content
  if (mermaidBlocks > 0) {
    const mermaidContent = await page.locator('pre.mermaid').first().textContent();
    console.log(`First mermaid block preview: ${mermaidContent.slice(0, 60)}...`);
  }
  
  // 2. Check if diagram trigger button exists
  const triggerBtn = await page.locator('.diagram-trigger').count();
  console.log(`Diagram trigger buttons: ${triggerBtn}`);
  
  if (triggerBtn === 0) {
    console.log('\nERROR: No diagram trigger button found!');
    console.log('Possible causes:');
    console.log('  1. extractInlineMermaid() returned empty');
    console.log('  2. init() threw an error');
    console.log('  3. Page is not an article page (chXX regex failed)');
    
    // Check if the JS loaded
    const jsContent = await page.locator('script[src*="diagram-overlay"]').count();
    console.log(`Diagram overlay script tags: ${jsContent}`);
    
    // Check page path
    const url = page.url();
    console.log(`Current URL: ${url}`);
    
    // Try calling extractInlineMermaid manually
    const inlineCount = await page.evaluate(() => {
      const pres = document.querySelectorAll('pre.mermaid');
      return pres.length;
    });
    console.log(`Mermaid blocks via evaluate: ${inlineCount}`);
    
    await browser.close();
    return;
  }
  
  // 3. Click trigger button
  console.log(`\n=== Opening Overlay ===`);
  await page.locator('.diagram-trigger').click();
  await page.waitForTimeout(1500);
  
  // 4. Check overlay state
  const overlay = await page.locator('.diagram-overlay.open').count();
  console.log(`Overlay open: ${overlay > 0}`);
  
  const diagramCards = await page.locator('.diagram-card').count();
  console.log(`Diagram cards: ${diagramCards}`);
  
  // 5. Check if mermaid rendered (look for SVGs)
  const cardSvgs = await page.locator('.diagram-card svg').count();
  console.log(`SVGs in cards: ${cardSvgs}`);
  
  // Check for loading/error states
  const loading = await page.locator('.diagram-loading').count();
  const error = await page.locator('.diagram-error').count();
  console.log(`Loading states: ${loading}, Error states: ${error}`);
  
  // Check diagram card body content
  if (diagramCards > 0) {
    const cardBody = await page.locator('.diagram-card-body').first().innerHTML();
    console.log(`First card body length: ${cardBody.length} chars`);
    if (cardBody.length < 200) {
      console.log(`Card body content: ${cardBody}`);
    }
  }
  
  // 6. Click zoom button to open lightbox
  const zoomBtn = await page.locator('.diagram-card-zoom').count();
  console.log(`\n=== Lightbox Test ===`);
  console.log(`Zoom buttons: ${zoomBtn}`);
  
  if (zoomBtn > 0) {
    await page.locator('.diagram-card-zoom').first().click();
    await page.waitForTimeout(1000);
    
    const lightbox = await page.locator('.diagram-lightbox.open').count();
    console.log(`Lightbox open: ${lightbox > 0}`);
    
    const lightboxSvg = await page.locator('#diagram-lb-body svg').count();
    console.log(`SVGs in lightbox: ${lightboxSvg}`);
    
    const lightboxWrapper = await page.locator('#diagram-lb-wrapper').count();
    console.log(`Lightbox wrapper: ${lightboxWrapper}`);
    
    // Check lightbox body content
    const lbBody = await page.locator('#diagram-lb-body').innerHTML();
    console.log(`Lightbox body length: ${lbBody.length} chars`);
    if (lbBody.length < 100) {
      console.log(`Lightbox body content: ${lbBody}`);
    }
  }
  
  // 7. Take screenshot
  await page.screenshot({ path: '/Users/jinguo/wiki-book/test-mermaid-screenshot.png', fullPage: false });
  console.log(`\nScreenshot saved to test-mermaid-screenshot.png`);
  
  // 8. Report errors
  if (errors.length > 0) {
    console.log(`\n=== Console Errors ===`);
    errors.slice(0, 5).forEach(e => console.log(e));
  }
  
  await browser.close();
  console.log('\nTest complete.');
}

testMermaidOverlay().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
