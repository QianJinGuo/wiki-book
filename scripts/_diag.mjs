import { chromium } from "playwright-core";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext();
await context.addInitScript(() => { try { localStorage.setItem("wb-live-lang", "en"); } catch(e) { console.log("LS ERR", e); } });
const page = await context.newPage();
page.on("requestfailed", r => console.log("REQFAIL:", r.url().slice(0,100), r.failure()?.errorText));
page.on("response", r => { if (r.url().includes("/assets/tr/") || r.url().includes("/api/translate")) console.log("RESP:", r.status(), r.url().slice(0,110)); });
await page.goto("https://jinguo.tech/course.html", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(6000);
const diag = await page.evaluate(() => ({
  lang: localStorage.getItem("wb-live-lang"),
  hasWBL: typeof window.WBLiveTranslate,
  pill: document.querySelector(".wb-live-pill")?.textContent || null,
  bodyClass: document.body.className.slice(0, 60),
  sample: Array.from(document.querySelectorAll(".md-content h1, .md-content h2")).slice(0,3).map(h => h.textContent.trim().slice(0,50)),
}));
console.log(JSON.stringify(diag, null, 1));
await browser.close();
