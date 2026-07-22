---
title: "browser harness github"
source_url: https://github.com/browser-use/browser-harness
ingested: 2026-05-01
sha256: 99a408dedffe6ecfd45b925eadabddda32c895c9bc7daee9fbc7522cb029cf34
type: raw
created: 2026-05-10
updated: 2026-05-10
tags: [github]
---
# Browser Harness — 自愈型浏览器 Agent 框架
**项目地址：** https://github.com/browser-use/browser-harness
**Stars：** 8,917（持续增长中）
**语言：** Python
**许可证：** MIT
**收录来源：** 智猩猩AI（微信公众号，2026-04-27）
Browser Harness 是一个自愈型浏览器 Agent 框架，基于 Chrome DevTools Protocol (CDP) 直连浏览器，核心卖点是去框架化薄桥接 + 自愈（self-healing）机制。
---
## 项目理念
去框架化，给 LLM 最大自由。
传统浏览器自动化工具构建了厚重的抽象层、预设 recipe 和严格的 rails，限制了大模型的推理能力。Browser Harness 只做最薄的桥梁：WebSocket 直连 CDP，Daemon 进程管理会话和通信，run.py 加载预置的 helpers 工具。
Agent 可以调用 helpers.py 中的浏览器操作函数，也可以在需要时通过 JavaScript 或 raw CDP 获取更底层的页面信息。
## 核心创新：自愈机制（Self-Healing）
当 Agent 发现 helpers.py 里缺少某个函数（如 `upload_file()`），它不会报错退出，而是读取当前 helpers 代码，理解现有函数的模式，实时在文件中添加新函数并继续执行任务。
这种 mid-task 编辑能力让 Browser Harness 本身成为一个可进化的基础设施。
```
agent: 想要上传一个文件
│
helpers.py → 文件里缺少了 upload_file() 函数
│
agent 修改了浏览器辅助函数文件，并补写该函数。
  helpers.py 192 → 199 lines
  + upload_file()
✓ 文件上传成功
```
## Domain-Skills 自动生成
Agent 在处理 GitHub、LinkedIn、Amazon 等特定网站时，会沉淀出针对性的交互模式，保存在 `domain-skills/` 目录中。鼓励由 Agent 在真实任务中总结生成这些技能，而非人工手写，这样更容易记录实际网页中可复用的选择器、交互流程和异常处理经验。
## 安装
```bash
git clone https://github.com/browser-use/browser-harness
cd browser-harness
uv tool install -e .
command -v browser-harness
# 首次连接
browser-harness --setup
# 验证连接
uv run browser-harness <<'PY'
goto_url("https://github.com/browser-use/browser-harness")
wait_for_load()
print(page_info())
PY
```
也可在 Claude Code 或 Codex 中使用 Prompt 引导安装。
## 安全边界
连接到的是用户真实 Chrome，禁止 Agent 直接处理密码、验证码、私密页面和高风险操作。遇到登录墙应停止并询问用户，Agent 只在授权后的页面执行明确、可验证的任务。
## 与同类工具的定位差异
| 维度 | Browser Harness | Playwright/Selenium | AgentBrowser |
|------|----------------|-------------------|-------------|
| 抽象层 | 薄（CDP 直连） | 厚（API 封装） | 中等（语义理解层） |
| 自愈 | ✅ mid-task 加函数 | ❌ 需预写选择器 | ❓ 站点记忆 |
| Domain Skills | ✅ 自动沉淀 | ❌ 无 | ❌ 无 |
| 适用场景 | Agent 原生操作浏览器 | 测试自动化 | Agent 浏览器运行时 |