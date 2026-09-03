import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const coverDir = path.dirname(fileURLToPath(import.meta.url));
const exportDir = path.join(coverDir, "exports");
const magick = process.env.MAGICK_BIN || "magick";

await mkdir(exportDir, { recursive: true });

async function renderSvg(filename, width, height, output) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`file://${path.join(coverDir, filename)}`, { waitUntil: "load" });
    await page.locator("svg").screenshot({ path: output });
  } finally {
    await browser.close();
  }
}

const portrait = path.join(exportDir, "ai-engineering-cover-1600x2400.png");
const wide = path.join(exportDir, "ai-engineering-cover-1920x1080.png");
const social = path.join(exportDir, "ai-engineering-cover-1200x630.png");
const socialJpg = path.join(exportDir, "ai-engineering-cover-1200x630.jpg");
const thumbnail = path.join(exportDir, "ai-engineering-cover-thumbnail.png");

await renderSvg("ai-engineering-cover.svg", 1600, 2400, portrait);
await renderSvg("ai-engineering-cover-wide.svg", 1920, 1080, wide);

execFileSync(magick, [wide, "-resize", "1200x630^", "-gravity", "center", "-extent", "1200x630", "-strip", social], { stdio: "inherit" });
execFileSync(magick, [social, "-quality", "92", "-strip", socialJpg], { stdio: "inherit" });
execFileSync(magick, [wide, "-resize", "400x200^", "-gravity", "center", "-extent", "400x200", "-strip", thumbnail], { stdio: "inherit" });

console.log(`Rendered cover assets to ${exportDir}`);
