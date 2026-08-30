import { chromium } from 'playwright';

const DASHBOARD_URL = 'http://localhost:8765/dashboard/index.html';
const results = [];

function log(test, pass, detail = '') {
  const icon = pass ? '✅' : '❌';
  results.push({ test, pass, detail });
  console.log(`${icon} ${test}${detail ? ' — ' + detail : ''}`);
}

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  console.log('\n=== Dashboard E2E Tests ===\n');

  await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  log('Page loads without crash', true);

  log('No console errors', consoleErrors.length === 0,
    consoleErrors.length > 0 ? `${consoleErrors.length} errors: ${consoleErrors[0]?.slice(0,80)}` : '');

  const h1 = await page.$eval('h1', el => el.textContent);
  log('Header renders', h1.includes('AI 工程'), `h1="${h1}"`);

  const faviconLinks = await page.$$eval('link[rel="icon"], link[rel="apple-touch-icon"]',
    els => els.map(e => ({ rel: e.rel, href: e.href })));
  log('Favicon links present', faviconLinks.length >= 4,
    `${faviconLinks.length} links`);

  // Daily article card
  const dailySection = await page.$('#daily-section');
  log('Daily article section exists', !!dailySection);

  const dailyLabel = await page.$eval('#daily-section .daily-label', el => el.textContent);
  log('Daily label: 每日一读', dailyLabel === '每日一读', `got "${dailyLabel}"`);

  const dailyTitle = await page.$eval('#daily-section .daily-title', el => el.textContent.trim());
  log('Daily article has title', dailyTitle.length > 5, `title="${dailyTitle.slice(0, 50)}"`);

  const readBtn = await page.$('.daily-read-btn');
  const readBtnTag = readBtn ? await readBtn.evaluate(el => el.tagName) : '';
  log('Start reading is a button', readBtnTag === 'BUTTON', `tag="${readBtnTag}"`);

  const skipBtn = await page.$('.daily-skip-btn');
  log('Skip button exists', !!skipBtn);

  // Recall section
  const recallSection = await page.$('#recall-section');
  log('Recall section exists', !!recallSection);

  const recallHeader = await page.$eval('#recall-header h2', el => el.textContent);
  log('Recall header: 艾宾浩斯 Recall', recallHeader.includes('艾宾浩斯'), `got "${recallHeader}"`);

  const recallPanelOpen = await page.$eval('#recall-panel', el => el.classList.contains('open'));
  log('Recall panel starts collapsed', !recallPanelOpen);

  await page.click('#recall-header');
  await page.waitForTimeout(300);
  const afterClick = await page.$eval('#recall-panel', el => el.classList.contains('open'));
  log('Recall panel expands on click', afterClick);

  const recallStats = await page.$eval('#recall-stats', el => el.textContent);
  log('Recall stats render', recallStats.includes('总计'), `stats="${recallStats.slice(0, 60)}"`);

  await page.click('#recall-header');
  await page.waitForTimeout(300);
  const collapsed = await page.$eval('#recall-panel', el => !el.classList.contains('open'));
  log('Recall panel collapses on second click', collapsed);

  // Phase bar
  const phaseChips = await page.$$('.phase-chip');
  log('Phase bar renders', phaseChips.length >= 6, `${phaseChips.length} chips`);

  // Stats row
  const statsRow = await page.$('#stats-row');
  const statsHtml = await statsRow.evaluate(el => el.innerHTML);
  log('Stats row renders', statsHtml.includes('stat'), 'has content');

  // Article cards
  const cards = await page.$$('.card');
  log('Article cards render', cards.length > 0, `${cards.length} cards`);

  // Mark an article as read — should add to recall queue
  const levelBtn = await page.$('.level-btn');
  if (levelBtn) {
    const beforeRecallCount = await page.evaluate(() =>
      Object.keys(JSON.parse(localStorage.getItem('wiki-learn-recall-v1') || '{}')).length
    );
    await levelBtn.click();
    await page.waitForTimeout(500);
    const afterRecallCount = await page.evaluate(() =>
      Object.keys(JSON.parse(localStorage.getItem('wiki-learn-recall-v1') || '{}')).length
    );
    log('Marking read adds to recall queue', afterRecallCount > beforeRecallCount,
      `queue: ${beforeRecallCount} → ${afterRecallCount}`);
  } else {
    log('Marking read adds to recall queue', false, 'no level button found');
  }

  // Skip daily article
  const beforeSkipTitle = await page.$eval('#daily-section .daily-title', el => el.textContent.trim());
  await page.click('.daily-skip-btn');
  await page.waitForTimeout(500);
  const afterSkipTitle = await page.$eval('#daily-section .daily-title', el => el.textContent.trim());
  log('Skip changes daily article', beforeSkipTitle !== afterSkipTitle,
    `changed: "${beforeSkipTitle.slice(0,30)}" → "${afterSkipTitle.slice(0,30)}"`);

  // Start reading switches phase
  const currentPhaseBefore = await page.evaluate(() => currentPhase);
  const dailyPhase = await page.evaluate(() => {
    const article = getDailyArticle();
    return article ? article.phase : null;
  });
  await page.click('.daily-read-btn');
  await page.waitForTimeout(500);
  const currentPhaseAfter = await page.evaluate(() => currentPhase);
  log('Start reading switches to article phase',
    dailyPhase !== null && currentPhaseAfter === dailyPhase,
    `phase: ${currentPhaseBefore} → ${currentPhaseAfter} (article: ${dailyPhase})`);

  // Summary
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
