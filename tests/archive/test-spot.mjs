import { chromium } from 'playwright';
const browser = await chromium.launch();
const tests = [
  'https://wiki.jinguo.tech/ch04/029-ai-agent.html',
  'https://wiki.jinguo.tech/ch09/018-how-claude-code-works-in-large-codebases-best-practices-and.html',
  'https://wiki.jinguo.tech/ch11/014-agent-creaoai.html',
  'https://wiki.jinguo.tech/ch12/042-how-amazon-bedrock-catches-ai-generated-phishing.html',
];
for (const url of tests) {
  const p = await browser.newPage();
  try {
    await p.goto(url, { waitUntil: 'load', timeout: 30000 });
    await p.waitForTimeout(10000);
    const r = await p.evaluate(() => {
      const d = document.querySelectorAll('div.mermaid');
      return { divs: d.length, svg: Array.from(d).filter(x => x.querySelector('svg')).length };
    });
    console.log(`${r.svg > 0 ? 'PASS' : 'FAIL'} ${url.split('/').pop()}: divs=${r.divs} svg=${r.svg}`);
  } catch(e) { console.log('FAIL ' + url.split('/').pop() + ': ' + e.message.slice(0,60)); }
  await p.close();
}
await browser.close();
