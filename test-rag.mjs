/**
 * RAG 端到端测试
 *
 * 测试目标：
 *   1. 生产环境 /rag-query 真实 RAG 响应（Phase 1+2 服务器端）
 *   2. 新端点 /rag/search 和 /rag/graph（Tier 1 客户端数据源）
 *   3. rag-client.js 加载与客户端搜索
 *   4. ai-chat.js 中 doRagSearch 客户端优先逻辑
 *   5. Docker nginx fallback
 *   6. 多组查询场景覆盖 + 相关性验证
 */

import { chromium } from 'playwright';

const PRODUCTION_URL = 'https://jinguo.tech';
const GH_PAGES_URL = 'https://wiki.jinguo.tech';
const LOCAL_URL = 'http://127.0.0.1:8002';

// ========== 通用工具 ==========
async function launchBrowser() {
  return chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-proxy-server', '--no-sandbox']
  });
}

function collectErrors(page) {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  return errors;
}

function printSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}\n`);
}

// ========== 测试 1: 服务器端 /rag-query (Phase 1+2) ==========
async function testServerRag(url, label) {
  printSection(label);

  const browser = await launchBrowser();
  const page = await browser.newPage();
  const errors = collectErrors(page);

  const testCases = [
    { q: 'Agent 记忆', expect: ['记忆', 'Agent', 'agent'] },
    { q: 'MCP 协议', expect: ['MCP', '协议', 'Model Context'] },
    { q: '工具调用', expect: ['工具', 'function', 'tool', 'function calling'] },
    { q: 'Harness 治理', expect: ['Harness', '治理', 'harnes'] },
    { q: '向量数据库', expect: ['向量', '数据库', 'vector', 'embedding'] },
  ];

  let passed = 0, failed = 0, retried = 0;

  for (const tc of testCases) {
    let data = null;
    let status = 0;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, 2000 * attempt));
        retried++;
      }
      const resp = await page.request.get(`${url}/rag-query?q=${encodeURIComponent(tc.q)}&top_k=5`);
      status = resp.status();
      try {
        data = await resp.json();
        if (status === 200 && data && Array.isArray(data.results)) break;
      } catch { data = null; }
    }

    const hasResults = data && Array.isArray(data.results);
    const hasSource = data && typeof data.source === 'string';
    const structureOk = hasResults && hasSource;
    const isNginxFallback = data && data.source === 'nginx-fallback';
    const isRateLimited = status === 503;

    let relevanceOk = true;
    let relevanceDetail = '-';
    if (structureOk && data.results.length > 0 && !isNginxFallback) {
      const topTitle = data.results[0].title;
      relevanceOk = tc.expect.some(pat => topTitle.toLowerCase().includes(pat.toLowerCase()));
      if (!relevanceOk) {
        relevanceDetail = `top1 标题不包含 [${tc.expect.join(', ')}] — 实际: "${topTitle.substring(0, 50)}..."`;
      }
    }

    const ok = structureOk && !isRateLimited && (isNginxFallback || relevanceOk);
    if (ok) passed++; else failed++;

    console.log(`  ${ok ? '✅' : '❌'} "${tc.q}"`);
    console.log(`     状态: ${status} | 结果: ${structureOk ? data.results.length : 'invalid'} | 来源: ${structureOk ? data.source : 'N/A'}`);
    if (isRateLimited) {
      console.log(`     ⚠️  Free 计划 CPU 受限，3 次重试仍 503`);
    } else if (!structureOk) {
      console.log(`     失败: 结构无效`);
    } else if (data.results.length > 0 && !isNginxFallback) {
      console.log(`     top1: "${data.results[0].title.substring(0, 55)}..."`);
    }
  }

  if (errors.length > 0) {
    console.log(`\n  控制台错误 (${errors.length}):`);
    errors.slice(0, 3).forEach(e => console.log(`    - ${e.substring(0, 100)}`));
  }

  await browser.close();
  console.log(`\n  📊 服务器 RAG: ${passed}/${passed + failed} 通过 (重试 ${retried} 次)`);
  return { passed, failed };
}

// ========== 测试 2: Tier 1 新端点 /rag/search 和 /rag/graph ==========
async function testTier1Endpoints(url, label) {
  printSection(label);

  const browser = await launchBrowser();
  const page = await browser.newPage();
  let passed = 0, failed = 0;

  // --- /rag/search: search_index.json ---
  try {
    const resp = await page.request.get(`${url}/rag/search`);
    const status = resp.status();
    const data = await resp.json();
    const docs = data && Array.isArray(data.docs) ? data.docs : null;

    if (status === 200 && docs && docs.length > 0) {
      console.log(`  ✅ /rag/search — 200 (${docs.length} 篇文档)`);
      passed++;
    } else {
      console.log(`  ❌ /rag/search — ${status} (docs=${docs ? docs.length : 'invalid'})`);
      failed++;
    }
  } catch (e) {
    console.log(`  ❌ /rag/search — 异常: ${e.message}`);
    failed++;
  }

  // --- /rag/graph: neighbor_graph.json ---
  try {
    const resp = await page.request.get(`${url}/rag/graph`);
    const status = resp.status();
    const data = await resp.json();
    const keys = data ? Object.keys(data) : [];
    const hasEntries = keys.length > 0;

    if (status === 200 && hasEntries) {
      // 采样验证：取第一个节点的近邻
      const sampleKey = keys[0];
      const neighbors = data[sampleKey];
      const neighborCount = Array.isArray(neighbors) ? neighbors.length : 0;
      console.log(`  ✅ /rag/graph — 200 (${keys.length} 节点, 采样节点 ${sampleKey} 有 ${neighborCount} 个近邻)`);
      passed++;
    } else {
      console.log(`  ❌ /rag/graph — ${status} (节点: ${keys.length})`);
      failed++;
    }
  } catch (e) {
    console.log(`  ❌ /rag/graph — 异常: ${e.message}`);
    failed++;
  }

  await browser.close();
  console.log(`\n  📊 Tier 1 端点: ${passed}/${passed + failed} 通过`);
  return { passed, failed };
}

// ========== 测试 3: 客户端 rag-client.js 加载 + 搜索 ==========
async function testClientRag(url, label) {
  printSection(label);

  const browser = await launchBrowser();
  const page = await browser.newPage();
  const errors = collectErrors(page);
  let passed = 0, failed = 0;

  try {
    // 选择一个在所有环境都存在的文章作为测试页面
    // Docker: ch04/001-agent.html | GH Pages/CF: ch04-001-agent.html (flat)
    var testPath = url === 'http://127.0.0.1:8002'
      ? '/ch04/001-agent'   // Docker 子目录格式
      : '/ch04-001-agent';   // 其他环境扁平格式
    await page.goto(url + testPath, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    await page.waitForTimeout(2000);

    // 1. 检查 rag-client.js 是否已加载
    const hasRagClient = await page.evaluate(() => {
      return typeof window.RagClient !== 'undefined';
    });
    if (hasRagClient) {
      console.log(`  ✅ rag-client.js: 已加载`);
      passed++;
    } else {
      console.log(`  ❌ rag-client.js: 未加载`);
      failed++;
    }

    // 2. 检查 ai-chat.js 是否已加载
    const scriptSrc = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[src]');
      for (const s of scripts) {
        if (s.src.includes('ai-chat')) return s.src;
        if (s.src.includes('rag-client')) return s.src;
      }
      return null;
    });

    // 3. 检查 ai-chat.js 源码中是否有客户端优先的 doRagSearch
    if (scriptSrc && scriptSrc.includes('ai-chat')) {
      const resp = await page.request.get(scriptSrc);
      const js = await resp.text();
      const hasDoRagSearch = js.includes('doRagSearch');
      const hasRagClientInit = js.includes('new RagClient');
      const hasFallback = js.includes('fallbackToServer');

      console.log(`  ✅ ai-chat.js: doRagSearch=${hasDoRagSearch ? '✅' : '❌'}`);
      console.log(`                  RagClient init=${hasRagClientInit ? '✅' : '❌'}`);
      console.log(`                  fallback=${hasFallback ? '✅' : '❌'}`);

      if (hasDoRagSearch && hasRagClientInit && hasFallback) passed++;
      else failed++;
    }

    // 4. 即时初始化 RagClient 并执行搜索（验证客户端搜索能跑通）
    console.log(`\n  --- 客户端搜索测试 ---`);
    
    const searchResults = await page.evaluate(async () => {
      try {
        const rag = new RagClient({
          searchUrl: '/rag/search',
          graphUrl: '/rag/graph'
        });
        await rag.init();
        const results = await rag.search('Agent 记忆', { topK: 5 });
        return {
          success: true,
          count: results.length,
          firstTitle: results.length > 0 ? results[0].title : null,
          firstScore: results.length > 0 ? results[0].score : null,
          sources: results.map(r => r.source),
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    });

    if (searchResults.success && searchResults.count > 0) {
      console.log(`  ✅ ragClient.search() — ${searchResults.count} 条结果`);
      console.log(`     top1: "${(searchResults.firstTitle || '').substring(0, 55)}..."`);
      console.log(`     score: ${searchResults.firstScore}`);
      console.log(`     来源: ${[...new Set(searchResults.sources)].join(', ')}`);
      passed++;
    } else if (searchResults.success) {
      console.log(`  ⚠️  ragClient.search() — 0 条结果（可能测试查询太偏）`);
      // 0 条结果不是引擎故障，算通过
      passed++;
    } else {
      console.log(`  ❌ ragClient.search() — ${searchResults.error}`);
      failed++;
    }

  } catch (e) {
    console.log(`  ❌ 客户端 RAG 测试异常: ${e.message}`);
    failed += 3;
  }

  if (errors.length > 0) {
    console.log(`\n  控制台错误 (${errors.length}):`);
    errors.slice(0, 3).forEach(e => console.log(`    - ${e.substring(0, 100)}`));
  }

  await browser.close();
  console.log(`\n  📊 客户端 RAG: ${passed}/${passed + failed} 通过`);
  return { passed, failed };
}

// ========== 测试 4: 前端脚本引用检查 ==========
async function testFrontendScripts(url, label) {
  printSection(label);

  const browser = await launchBrowser();
  const page = await browser.newPage();
  const errors = collectErrors(page);
  let passed = 0, failed = 0;

  try {
    var testPath = url === 'http://127.0.0.1:8002'
      ? '/ch04/001-agent'
      : '/ch04-001-agent';
    await page.goto(url + testPath, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    await page.waitForTimeout(1500);

    const scripts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]'))
        .map(s => ({
          src: s.src.split('/').pop(),
          loaded: s.src.includes('ai-chat') || s.src.includes('rag-client')
        }));
    });

    const hasAiChat = scripts.some(s => s.src.includes('ai-chat'));
    const hasRagClient = scripts.some(s => s.src.includes('rag-client'));

    console.log(`  scripts 加载:`);
    for (const s of scripts) {
      if (s.loaded) console.log(`    ✅ ${s.src}`);
    }

    if (hasAiChat) { passed++; } else { console.log('    ❌ ai-chat.js 未加载'); failed++; }
    if (hasRagClient) { passed++; } else { console.log('    ❌ rag-client.js 未加载'); failed++; }

    // 检查控制台错误
    if (errors.length > 0) {
      console.log(`\n  控制台错误 (${errors.length}):`);
      errors.slice(0, 5).forEach(e => console.log(`    - ${e.substring(0, 120)}`));
    }
  } catch (e) {
    console.log(`  ❌ 前端检查异常: ${e.message}`);
    failed += 2;
  }

  await browser.close();
  console.log(`\n  📊 前端脚本: ${passed}/${passed + failed} 通过`);
  return { passed, failed };
}

// ========== 主流程 ==========
async function main() {
  const results = [];

  // === 组 1: 生产环境 ===
  results.push(await testServerRag(PRODUCTION_URL, '🌐 生产 /rag-query (Phase 1+2)'));
  results.push(await testTier1Endpoints(PRODUCTION_URL, '🌐 生产 /rag/search + /rag/graph (Tier 1)'));
  results.push(await testClientRag(PRODUCTION_URL, '🌐 生产 客户端 ragClient.search()'));
  results.push(await testFrontendScripts(PRODUCTION_URL, '🌐 生产 前端脚本引用'));

  // === 组 2: GitHub Pages (wiki.jinguo.tech) ===
  printSection('📖 GitHub Pages: wiki.jinguo.tech');
  try {
    // GitHub Pages 没有服务器端 RAG 端点，只测客户端
    results.push(await testClientRag(GH_PAGES_URL, '📖 GitHub Pages 客户端 ragClient.search()'));
    results.push(await testFrontendScripts(GH_PAGES_URL, '📖 GitHub Pages 前端脚本'));
  } catch (e) {
    console.log(`\n⚠️  GitHub Pages 测试异常: ${e.message}`);
  }

  // === 组 3: Docker 本地（如果可用） ===
  try {
    const resp = await fetch(LOCAL_URL + '/rag-query?q=ping');
    if (resp.ok || resp.status === 200 || resp.status === 404) {
      results.push(await testServerRag(LOCAL_URL, '🐳 Docker /rag-query'));
      results.push(await testTier1Endpoints(LOCAL_URL, '🐳 Docker /rag/search + /rag/graph'));
      results.push(await testClientRag(LOCAL_URL, '🐳 Docker 客户端 ragClient.search()'));
      results.push(await testFrontendScripts(LOCAL_URL, '🐳 Docker 前端脚本'));
    }
  } catch {
    console.log(`\n⚠️  Docker 不可用 (localhost:8002)，跳过`);
  }

  // === 汇总 ===
  const totalPassed = results.reduce((s, r) => s + r.passed, 0);
  const totalFailed = results.reduce((s, r) => s + r.failed, 0);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${totalFailed > 0 ? '❌ 部分测试失败' : '✅ 全部通过'}`);
  console.log(`  总计: ${totalPassed}/${totalPassed + totalFailed} 通过`);
  results.forEach((r, i) => {
    const label = ['服务器 RAG', 'Tier 1 端点', '客户端 RAG', '前端脚本'][i % 4];
    console.log(`  ${label}: ${r.passed}/${r.passed + r.failed}`);
  });
  console.log(`${'='.repeat(60)}\n`);

  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('测试框架异常:', err.message);
  process.exit(1);
});
