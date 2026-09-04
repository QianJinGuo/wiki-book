import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULTS = {
  wikiPublicBaseUrl: "https://github.com/QianJinGuo/wiki-public/blob/main",
};

function loadConfig() {
  const configured = process.env.WIKI_BOOK_LINK_CONFIG;
  const candidates = [
    configured ? resolve(configured) : null,
    join(PROJECT_ROOT, "site-links.json"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    try {
      const value = JSON.parse(readFileSync(candidate, "utf8"));
      if (value && typeof value === "object") return value;
    } catch {
      // Fall through to the checked-in defaults.
    }
  }
  return {};
}

function baseUrl(envName, configName) {
  return String(
    process.env[envName] || loadConfig()[configName] || DEFAULTS[configName],
  ).replace(/\/+$/, "");
}

export const linkConfig = {
  version: 1,
  wikiPublicBaseUrl: baseUrl("WIKI_PUBLIC_BASE_URL", "wikiPublicBaseUrl"),
};

export function wikiPublicUrl(path) {
  const normalized = String(path).replace(/^\/+/, "").replace(/\.md\.md$/, ".md");
  return `${linkConfig.wikiPublicBaseUrl}/${normalized}`;
}
