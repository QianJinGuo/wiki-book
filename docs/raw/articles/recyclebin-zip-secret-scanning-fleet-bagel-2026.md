---
title: "Detecting and removing dangerous secrets on dev workstations"
source: recyclebin-zip
source_url: https://recyclebin.zip/posts/2026-05-25-secret-scanning-fleet-bagel/
author: recyclebin.zip
publish_date: 2026-05-25
ingested: 2026-06-16
tags: [security, secret-scanning, fleet-management, dev-workstation, bagel, devsecops]
sha256: pending
type: article
review_value: 7
review_confidence: 7
review_recommendation: worth-reading
review_stars: 4
---

# Detecting and removing dangerous secrets on dev workstations

> **RecycleBin.zip 实战长文** — 把 Secret Scanning 从「CI 流水线加一道门」升级为「开发机 Fleet 级实时防护」，用 Rust 写的 `bagel` 工具提供 pre-commit + file-system 守护 + 后台 daemon 三层防御。配套 GitHub Actions + `scc-watch` 把扫描结果转成 SARIF → Code Scanning Dashboard。

## 1. 为什么 dev workstation 才是 secrets 的真正泄漏面

- 公开泄漏的 secrets 案例 70%+ 起源于开发者本地：`~/.aws/credentials` 被 IDE 插件读取、`git add .` 误提交、`.env` 备份到云盘
- 现有方案（CI gate、pre-commit hook）的盲区：仅在 commit/push 时拦截，无法阻止「本地调试时把 token 贴进 `curl`」「AI 编程助手读取工作目录后泄露给 LLM API」「编辑器 plugin 写入 telemetry 文件夹」等 runtime 行为
- 真正的「Defense in depth」需要在 **file system layer** 持续监听，**而不是只在 git 边界**

## 2. bagel 工具架构

`bagel` 是 RecycleBin.zip 开源的 Rust 实现，github.com/RecycleBinzi/bagel：

- **Daemon 模式**：`bagel watch ~/code` 启动后监听整个文件树，新文件/修改/重命名触发 re-scan
- **Pre-commit 模式**：`bagel scan --staged` 在 git 提交前扫描 staged 文件
- **Detector plugins**：内置 14 个 provider（AWS、GCP、GitHub、OpenAI、Slack、Stripe 等），每条规则用 `regex + entropy + provider-context` 三段式判定，降低误报
- **输出格式**：JSON / SARIF / plain text，可直接对接 GitHub Code Scanning、GitLab Code Quality、自建 dashboard

## 3. Fleet 级部署

- 通过 `fleet.yaml` 描述组织拓扑（team → repo → developer-machine-tag），`bagel fleet apply` 推送到所有开发机
- MDM（Jamf / Intune）配合：开发机开机自动安装 daemon、开机自启
- 集中 dashboard：每个 developer 看自己的 findings，组织看聚合视图（哪些 team 泄漏最多、哪类 secret 出现频率上升）
- 误报反馈闭环：developer 标记 false-positive → rule 调优 → 自动 re-scan

## 4. 集成 GitHub Actions + SARIF

```yaml
- name: Bagel scan
  run: |
    bagel scan --staged --format sarif > bagel.sarif
- uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: bagel.sarif
```

- SARIF → Code Scanning Dashboard 自动出 PR check、security tab 可见
- 增量扫描：相比全量扫描，daemon 模式内存占用 < 50MB，CPU 闲时 < 1%

## 5. 与 AI 编程助手的交互风险

- 2026 年起新发现：Cursor / Continue / Claude Code 等 IDE plugin 会读取工作区文件 → 上传到 LLM provider
- 如果 `~/.aws/credentials` 在工作区路径下，**会被 LLM 看到**（即使没主动询问）
- bagel 的 daemon 模式正好覆盖这个场景：实时监听新文件，AI plugin 一旦尝试读取 secret 文件，立即 block + alert
- 与传统 secret scanning 互补：CI gate 防 commit，daemon 防 runtime access

## 6. 实战数据 + 部署建议

- RecycleBin.zip 自家 400 人 engineering org 部署 6 个月：捕获 17 起真实泄漏事件（10 起在 commit 前、6 起在 editor plugin、1 起在 AI 编程助手）
- 误报率从首月 38% 降至第三月 11%（rule 调优效果）
- 部署成本：每 100 dev machines 约 2-3 台 SRE 兼职维护，工具本身 MIT 开源免费

## 7. 与现有 secret scanning 工具对比

| 工具 | 部署位置 | 实时性 | AI 编程风险覆盖 | License |
|------|----------|--------|----------------|---------|
| gitleaks | CI / pre-commit | 仅边界 | ❌ | MIT |
| trufflehog | CI / pre-commit | 仅边界 | ❌ | AGPL |
| detect-secrets | CI / pre-commit | 仅边界 | ❌ | Apache 2.0 |
| **bagel** (RecycleBin.zip) | **File system daemon + CI** | **实时** | **✅** | **MIT** |
