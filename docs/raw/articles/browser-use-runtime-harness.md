---
title: "Browser Use：为 Agent 构建 Runtime Harness"
sha256: 6f0a2983e2478646f49d6a9305e2fffec3394aa8051b4b95431e6de3ee29d5cb
source_url: https://mp.weixin.qq.com/s/0qpUPTF_Ddbahj21OGuQFA
author: 无糖可乐
publisher: 百度Geek说
published: 2026-05-13
created: 2026-05-14
type: raw
tags: [computer-use, browser-automation, cdp, chrome-devtools-protocol, agent-harness, runtime-verification, frontend-agent]
  - browser-use
  - browser-automation
  - cdp
  - chrome-devtools-protocol
  - agent-harness
  - runtime-verification
  - frontend-agent
review_value: 8
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
review_stars: 4
summary: 百度工程师的Browser Use Runtime Harness——基于CDP的六维验证(路径/内容Contract/视觉/交互/控制台/网络)，让Agent感知真实浏览器渲染结果，而非仅静态代码分析。开源browser-automation仓库，评分56。
---

## 技术实现：Chrome DevTools Protocol
### CDP 作为核心通道
CDP（Chrome DevTools Protocol）是 Chrome 内置的远程调试协议，允许外部程序连接控制浏览器：导航、点击、注入脚本、截图。
Agent 通过 CDP 与浏览器对话，用截图来"看"渲染结果。
### 运行形态选择
1. **带界面 Chrome**：开发机直接启动，Agent 和开发者同时可见
2. **Headless Chrome**：无图形界面后台运行，适合 CI/服务器
3. **NoVNC 方案**：远程容器跑 Chrome，通过 Web 远程桌面访问，适合协同调试
### CDP 接入
- Chrome 启动：`--remote-debugging-port=9222`
- Agent 访问：`http://localhost:9222/json` 获取所有 Tab 信息（Tab ID + WebSocket 地址）
- 后续所有操作通过这些信息定位目标 Tab
---
## 架构：让 Agent 知道两件事
1. **CDP 在哪里**：`localhost:9222`
2. **开发环境怎么打开**：Agent 应能通过脚本自动启动本地项目，不需要每次问人"帮我把项目跑起来"
---
## 工具开源
- **仓库**：https://github.com/hixuanxuan/browser-automation
- **安装**：`npx skills add hixuanxuan/browser-automation --skill visual-verify`
- **功能**：面向日常前端开发验收，Agent 主动打开真实浏览器检查六维，输出带截图和断言结果的验收记录
---
## 为什么重要
传统前端测试（Playwright/Puppeteer）由人类编写测试脚本。但 Agent 时代需要 Agent **自己验证自己生成的代码**——这要求验证系统能被 Agent 驱动，且验证结果能被 Agent 解读。
六个维度覆盖了一个 Web 产品"能不能用"的核心问题。