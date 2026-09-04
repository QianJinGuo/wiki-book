import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const gate = join(process.cwd(), "scripts", "check-public-build.mjs");

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "wiki-public-gate-"));
  mkdirSync(join(root, "docs", "raw", "articles"), { recursive: true });
  mkdirSync(join(root, "site"), { recursive: true });
  writeFileSync(
    join(root, "docs", "raw", "articles", "card.md"),
    [
      "---",
      "type: source-card",
      'title: "A public source card"',
      'source: "example.org"',
      'author: "Example author"',
      'source_url: "https://example.org/source"',
      'published: "2026-01-01"',
      'collected: "2026-01-02"',
      'license: "未发现可验证的再发布许可证；本仓库仅保留来源卡片"',
      "---",
      "",
      "# A public source card",
      "",
      "## 原创摘要",
      "",
      "这份来源卡片记录一篇围绕“A public source card”的第三方资料，主题标签为相关 AI 工程主题。完整事实、论据、上下文与原文请以原始来源为准；公开仓库不保存正文副本。",
      "",
      "> 公开版仅保留来源信息和原创摘要，不替代原始来源的阅读。",
      "",
    ].join("\n"),
  );
  writeFileSync(join(root, "site", "index.html"), "<!doctype html><title>public</title>\n");
  return root;
}

function runGate(root) {
  try {
    execFileSync(process.execPath, [gate, "--source", root, "--site", join(root, "site")], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, stderr: "" };
  } catch (error) {
    return { status: error.status ?? 1, stderr: String(error.stderr ?? "") };
  }
}

test("public gate accepts the minimal source-card fixture", () => {
  const root = makeFixture();
  try {
    assert.equal(runGate(root).status, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("public gate rejects private directories and symlinks in the deploy tree", () => {
  const root = makeFixture();
  try {
    const privateDir = "site-" + "private";
    mkdirSync(join(root, "site", privateDir));
    writeFileSync(join(root, "site", privateDir, "secret.txt"), "private\n");
    const privateDirResult = runGate(root);
    assert.notEqual(privateDirResult.status, 0);
    assert.match(privateDirResult.stderr, /forbidden private directory/);

    rmSync(join(root, "site", privateDir), { recursive: true, force: true });
    writeFileSync(join(root, "site", "secret.txt"), "private\n");
    symlinkSync(join(root, "site", "secret.txt"), join(root, "site", "leak"));
    const symlinkResult = runGate(root);
    assert.notEqual(symlinkResult.status, 0);
    assert.match(symlinkResult.stderr, /must not be a symlink/);
    assert.equal(readlinkSync(join(root, "site", "leak")), join(root, "site", "secret.txt"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("public gate rejects credential-bearing source URLs and extra card fields", () => {
  const root = makeFixture();
  const card = join(root, "docs", "raw", "articles", "card.md");
  try {
    const base = [
      "---",
      "type: source-card",
      'title: "A public source card"',
      'source: "example.org"',
      'author: "Example author"',
      'source_url: "https://user:password@example.org/source?api_key=redacted"',
      'published: "2026-01-01"',
      'collected: "2026-01-02"',
      'license: "MIT"',
      'extra: "unexpected"',
      "---",
      "",
      "# A public source card",
      "",
      "## 原创摘要",
      "",
      "这份来源卡片记录一篇围绕“A public source card”的第三方资料，主题标签为相关 AI 工程主题。完整事实、论据、上下文与原文请以原始来源为准；公开仓库不保存正文副本。",
      "",
      "> 公开版仅保留来源信息和原创摘要，不替代原始来源的阅读。",
      "",
    ].join("\n");
    writeFileSync(card, base);
    const result = runGate(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /no reliable http\(s\) source_url|unexpected source-card fields/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
