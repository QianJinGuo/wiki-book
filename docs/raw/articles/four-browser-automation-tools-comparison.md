---
title: "四款浏览器自动化工具横向对比：browser-use / Playwright / chrome-devtools-mcp / agent-browser"
url: https://mp.weixin.qq.com/s/2aqrTvswa6FtqI-GK-EmvQ
author: 行小招
source: 科技充电站
date: 2026-05-19
created: 2026-05-19
type: raw
tags: [browser-automation, computer-use, playwright, chrome-devtools-mcp, agent-browser, ai-coding, tool-comparison]
review_value: 6
review_confidence: 7
sha256: c4404966369f425a672dc9ac43425df8a838e1ed658ec852c020277a53c59699
status: supplemental
supplements: entities/opencli
---
# 四款浏览器自动化工具横向对比：browser-use / Playwright / chrome-devtools-mcp / agent-browser
> 来源：[行小招 - 科技充电站](https://mp.weixin.qq.com/s/2aqrTvswa6FtqI-GK-EmvQ)，2026-05-19
> 评分：v=6, c=7, v×c=42 → 作为 [[entities/opencli|OpenCLI]] entity 的补充
## 四工具横向对比
| 维度 | chrome-devtools-mcp | Playwright | agent-browser | browser-use |
|------|--------------------|-----------|---------------|-------------|
| 语言/运行时 | Node.js | Node.js，多语言绑定 | Rust，原生二进制 | Python |
| 浏览器协议 | CDP 直接暴露 | 自有协议封装 CDP | CDP | Playwright |
| 依赖链 | Chrome + Node | Chrome + Node | 仅 Chrome | Chrome + Python + Playwright |
| 感知方式 | DOM / 网络 / JS 原语 | DOM selector / locator | Accessibility tree + @eN ref | 截图 + DOM 混合 |
| AI 集成方式 | MCP tool 调用 | 外部调用脚本 | MCP / CLI 调用 | 内置 LLM 循环 |
| 状态持久 | 无，每次连接 | 需配置 persistent context | 跨命令持久 session | Agent 自己维护状态 |
| 并发支持 | 依赖调用方 | 很强，多 context | 支持并行子 agent | Cloud 版更适合 |
## 四层抽象
- **chrome-devtools-mcp** → 暴露 CDP 原语，最底层
- **Playwright** → 脚本化测试框架，人类写脚本
- **agent-browser** → AI 友好的 CLI 工具箱，命令驱动
- **browser-use** → AI 自己思考和操作的 Agent 闭环，最高层
## 选型结论
- **AI 即时验证（AI Coding Agent 边写边看）** → `agent-browser`：accessibility tree 省 token、@eN ref 定位短、跨命令 session 持久
- **CI / 稳定回归** → `Playwright`：一次写脚本，后面零 token 跑 N 次
- **模糊目标的完整自动化** → `browser-use`：think-act 循环，适合登录+动态页面+不确定结果
- **底层调试（网络/性能/JS）** → `chrome-devtools-mcp`：CDP 级别控制
## 决策树
| 场景 | 推荐工具 |
|------|---------|
| AI 写代码时顺手验证页面 | agent-browser |
| 固定流程回归测试 / CI | Playwright |
| 模糊目标的完整自动化任务 | browser-use |
| 网络、性能、JS、CDP 级调试 | chrome-devtools-mcp |
> 固定流程看成本，模糊任务看完成度，AI 即时验证看调用摩擦。