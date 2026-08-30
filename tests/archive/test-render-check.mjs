import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

await page.goto('http://localhost:8766/dashboard/');
await page.waitForTimeout(3000);

// Check concept map
await page.locator('#viz-toggle').click();
await page.waitForTimeout(300);
await page.locator('.viz-tab[data-tab="concept"]').click();
await page.waitForTimeout(1000);

const svgBox = await page.locator('#concept-map-container svg').boundingBox();
console.log('SVG box:', JSON.stringify(svgBox));

// Check node positions for spread
const nodes = await page.locator('.concept-node').evaluateAll(els => {
  const positions = els.map(e => {
    const c = e.querySelector('circle');
    const r = c.getBoundingClientRect();
    return { cx: Math.round(r.x + r.width/2), cy: Math.round(r.y + r.height/2), radius: Math.round(r.width/2) };
  });
  const xs = positions.map(p => p.cx);
  const ys = positions.map(p => p.cy);
  return {
    count: positions.length,
    xRange: [Math.min(...xs), Math.max(...xs)],
    yRange: [Math.min(...ys), Math.max(...ys)],
    xSpread: Math.max(...xs) - Math.min(...xs),
    ySpread: Math.max(...ys) - Math.min(...ys),
    sample: positions.slice(0, 5)
  };
});
console.log('Node spread:', JSON.stringify(nodes, null, 2));

// Check labels
const labelCount = await page.locator('.concept-node-label').count();
console.log('Visible labels:', labelCount);

// Check edges
const edgeCount = await page.locator('.concept-edge').count();
console.log('Edges:', edgeCount);

// Check for overlapping nodes (distance < 2*radius)
const overlaps = await page.locator('.concept-node circle').evaluateAll(els => {
  const positions = els.map(e => {
    const r = e.getBoundingClientRect();
    return { cx: r.x + r.width/2, cy: r.y + r.height/2, radius: r.width/2 };
  });
  let overlapCount = 0;
  for(let i = 0; i < positions.length; i++){
    for(let j = i+1; j < positions.length; j++){
      const dx = positions[i].cx - positions[j].cx;
      const dy = positions[i].cy - positions[j].cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const minDist = positions[i].radius + positions[j].radius + 4;
      if(dist < minDist) overlapCount++;
    }
  }
  return overlapCount;
});
console.log('Overlapping node pairs:', overlaps);

await page.screenshot({ path: '/Users/jinguo/.codex/visualizations/2026/08/01/019fbc6b-d8e4-7f43-b60f-db40648a03be/concept-map-fixed.png', fullPage: false });

console.log('Done');
await browser.close();
