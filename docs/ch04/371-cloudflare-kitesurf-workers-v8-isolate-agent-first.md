# Cloudflare Kitesurf：运行在 Workers V8 isolate 上的 agent-first 浏览器

## Ch04.371 Cloudflare Kitesurf：运行在 Workers V8 isolate 上的 agent-first 浏览器

> 📊 Level ⭐⭐ | 5.1KB | `entities/cloudflare-kitesurf-agent-first-browser-workers-2026.md`

# Cloudflare Kitesurf：运行在 Workers V8 isolate 上的 agent-first 浏览器

Cloudflare 2026-08-06 发布的**专为 AI Agent 设计的浏览器**（Agents Week），完全运行在 Workers 之上，面向 agentic 任务（截图/HTML 提取）比 Chromium 省 3-7 倍 CPU/内存。核心洞察：**浏览器引擎为人类设计，不为 agent 设计**——agent 不关心标签页/主题/扩展/跨设备同步，只关心 token 数、上下文窗口、可扩展性、性能和成本。

## 设计决策

- **测试驱动**：用 Web Platform Tests (WPT) 给 AI agent 明确的功能符合性目标；人类专注架构与审查。WPT 之外补充真实网站上的多步 Puppeteer 集成测试 + 视觉回归测试（对比 Chromium 与 Kitesurf 每步渲染输出）
- **Rust 优先**：原生 Rust 直接编译到 WebAssembly（wasm-bindgen），避免 Emscripten 模拟层
- **异常处理铁律**：任何失败降级为空白帧/缺失元素，绝不 dead session；每个边界捕获 fault，默认安全空值
- **隔离假设**：每个页面加载都是不可信输入、每个会话全新开始；组件间最小权限（借 Workers 的 isolate 安全模型 + 应用级强制）
- **无状态优先**：状态是失败昂贵的根源；无状态组件可随时 kill、千并发并行、按需伸缩——"凡能无状态的组件都应无状态"

## 三组件架构

**SandboxOutbound**：唯一可直连网络的组件（Dynamic Workers 强制），负责 CORS 执行、浏览器形态 header 注入、响应过滤、每页独立 cookie jar；违反策略一律 403。

**Engine**：唯一对外组件，处理 CDP WebSocket + HTTP REST API，存储会话状态。用 CDP 保证客户端兼容——Puppeteer/Playwright/chrome-remote-interface/Chrome DevTools 前端直接可用。

**PageScript**：每页/OOPIF 用 Dynamic Workers 拉起长生命周期 isolate（干净 globalThis + DOM document 对象）。HTML/CSS 解析用 Rust 的 Blitz（模块化渲染引擎）+ Stylo（Firefox 的 CSS 解析器）；`eval` 用 Rust 的 Boa JS 引擎（runtime-on-runtime，Workers 原生不支持 eval 的过渡方案）。

**PageRenderer**：从 PageScript 取 scene → 拉内部字体/图片 → blitz-paint + Parley 光栅化 → 返回 JPEG/PNG/PDF。通过 Workers 内建 RPC 单调用 renderFrame()，渲染器无状态可随时 kill 重启。

## 性能实测（14-URL 语料 vs Chromium warm pool）

| 指标 | Kitesurf | Chromium | 相对 |
|------|----------|----------|------|
| CPU 截图 | 380 ms | 1,173 ms | **3.1× 省** |
| CPU HTML 提取 | 229 ms | 877 ms | **3.8× 省** |
| 内存 截图 | 57.8 MiB | 271 MiB | **4.7× 省** |
| 内存 HTML 提取 | 39.4 MiB | 273.7 MiB | **7.0× 省** |
| 墙钟 截图 | 1,148 ms | 637 ms | 1.8× 慢 |
| 墙钟 HTML 提取 | 820 ms | 472 ms | 1.7× 慢 |

Chromium 胜在墙钟（JIT 已见该页），Kitesurf 胜在 CPU/内存（决定账单）。已通过 215,000+ WPT 测试且每周增长。

## 与既有 AI 浏览器的关系

区别于 [AI 浏览器三条技术路线](../ch05/018-ai-native.html)（侧栏/Agent/AI 原生）的路线分类：Kitesurf 是 AI 原生路线的**具体工程实现**——用 Workers isolate 替代 Chromium 进程模型，把 agent 关注的指标（token/成本/可扩展性）作为首要设计目标。与 [agent-browser](270-chromium-blink-v8-agent-browser-use.html) 概念互补：后者定义 agent 浏览器应具备的能力，Kitesurf 给出在无进程模型环境下如何构建的方案。

## 当前边界与路线

不支持视频/WebGL/真实 TLS 指纹反爬握手/需持久状态的长会话（走 Browser Run 默认 Chromium）；CDP 子集实现持续扩展中；计划开源，允许客户自部署。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/cloudflare-kitesurf-agent-first-browser-workers-2026.md)

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

