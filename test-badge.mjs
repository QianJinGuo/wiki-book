import { chromium } from 'playwright';

const URL = 'http://localhost:8765/dashboard/';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log('\n=== Badge States Test ===\n');

  // 1. Check unread card - should have no badge
  console.log('1. Unread article (no badge):');
  const unreadCard = await page.$('.card');
  const unreadBadge = await unreadCard.$('.feynman-badge');
  console.log(unreadBadge ? '   ❌ Should not have badge' : '   ✅ No badge on unread');

  // 2. Mark as read
  console.log('\n2. Mark article as read:');
  const unreadBtn = await page.$('.level-btn:not(.read):not(.explained):not(.taught):not(.mastered)');
  await unreadBtn.click();
  await page.waitForTimeout(500);
  
  const badge1 = await page.$('.feynman-badge');
  const text1 = badge1 ? await badge1.evaluate(el => el.textContent) : '';
  console.log(`   Badge: "${text1}"`);
  console.log(text1 === '📝' ? '   ✅ Shows 📝 (no note)' : '   ❌ Wrong state');

  // 3. Save feynman note
  console.log('\n3. Save feynman note:');
  await page.click('.feynman-badge');
  await page.waitForTimeout(300);
  await page.fill('#feynman-got', 'Test concept');
  await page.click('.feynman-save');
  await page.waitForTimeout(500);
  
  const badge2 = await page.$('.feynman-badge');
  const text2 = badge2 ? await badge2.evaluate(el => el.textContent) : '';
  console.log(`   Badge: "${text2}"`);
  console.log(text2 === '📝✓' ? '   ✅ Shows 📝✓ (has note)' : '   ❌ Wrong state');

  // 4. Add thread
  console.log('\n4. Add thread:');
  await page.click('.feynman-badge');
  await page.waitForTimeout(300);
  await page.fill('#thread-name-input', 'Discussion');
  await page.fill('#thread-url-input', 'codex://threads/test');
  await page.click('.thread-add-btn');
  await page.waitForTimeout(200);
  await page.click('.feynman-save');
  await page.waitForTimeout(500);
  
  const badge3 = await page.$('.feynman-badge');
  const text3 = badge3 ? await badge3.evaluate(el => el.textContent) : '';
  console.log(`   Badge: "${text3}"`);
  console.log(text3 === '📝💬' ? '   ✅ Shows 📝💬 (has note + threads)' : '   ❌ Wrong state');

  // 5. Verify only one badge
  console.log('\n5. Verify single badge:');
  const allBadges = await page.$$('.feynman-badge, .thread-badge');
  console.log(`   Total badges: ${allBadges.length}`);
  console.log(allBadges.length === 1 ? '   ✅ Only one badge' : '   ❌ Multiple badges found');

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
