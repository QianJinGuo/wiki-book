# OpenCLI

## Ch03.084 OpenCLI

> 📊 Level ⭐⭐ | 9.2KB | `entities/opencli.md`

## Overview
OpenCLI 是一个开源的 AI Agent 工具网关框架，Stars 17.1k，核心目标是将**任何网站、Electron 应用、本地二进制工具**转换为标准化的命令行接口，专为 AI Agent 设计。
> "Make Any Website & Tool Your CLI. A universal CLI Hub and AI-native runtime."

## Key Facts
| Fact | Detail |
|------|--------|
| GitHub | https://github.com/jackwener/OpenCLI |
| Stars | 17.1k |
| 技术栈 | TypeScript/JS |
| 定位 | AI Agent 的"工具网关" |

## Core Features
1. **万物 CLI 化** — 任何网站/工具 → 标准化 CLI 接口
2. **AI 原生运行时** — 内置 Agent 支持，AGENT.md 集成
3. **统一工具发现** — Agent 可发现、学习和执行工具
4. **复用浏览器会话** — 通过 Chrome 扩展桥接，复用用户已登录态，直连网站原生 API
5. **天然抗反爬** — 请求与用户手动操作完全一致，免疫 99% 反爬检测

## 工作原理
OpenCLI 通过 **Chrome 扩展 + 本地微守护进程**建立浏览器桥接：
1. 用户在 Chrome/Chromium 中登录目标网站
2. OpenCLI 拦截浏览器与网站后端的原生 API 调用
3. 将这些 API 封装为标准化命令行接口
4. AI Agent / 脚本直接调用，绕过前端 GUI
对比爬虫的关键差异见 [爬虫 vs OpenCLI 深度对比](https://github.com/QianJinGuo/wiki/blob/main/comparisons/crawler-vs-opencli.md)。

## Directory Structure
```
OpenCLI/
├── clis/          # 各类 CLI 适配器
├── skills/        # Agent Skills
├── autoresearch/  # 自动研究模块
├── src/           # 核心源码
├── extension/     # 浏览器扩展
└── docs/          # 文档
```

## 与 Agent 生态的关系
通过 `AGENT.md` 格式让 AI Agent 无缝发现和调用工具，定位为 AI Agent 的"工具网关"。

## 深度分析
### 1. 与爬虫的本质差异：模拟 vs 原生 
爬虫的核心是"假装自己是浏览器"，所有请求都来自外部模拟，需要持续和反爬体系对抗；而 OpenCLI 直接使用用户正在使用的浏览器，所有请求来自浏览器内部的合法会话，与用户手动操作没有任何区别，从根源上规避了反爬问题。

### 2. 数据获取路径：反向解析 vs 原生直连 
传统爬虫需要从渲染后的 HTML 中反向解析数据，页面改版即失效；就算走接口路线，也需要逆向加密规则和签名逻辑。而 OpenCLI 直接拿到网站前端使用的原生 API 数据，天生结构化 JSON，无需解析，几乎零维护成本。

### 3. AI Agent 适配性：额外封装 vs 原生设计 
爬虫原生不支持 AI 调用，需额外封装，HTML 解析消耗大量 Token，输出格式不统一。OpenCLI 为 AI 原生设计，统一标准化命令与结构化输出，可大幅削减 93% 的 Token 消耗。

### 4. 能力边界：读为主 vs 读写全覆盖 
爬虫核心能力是数据读取，写操作实现复杂且易被拦截。OpenCLI 能力与用户账号权限完全对齐，不仅能读，还能实现网站前端所有写操作（发帖、提交、表单等）。

### 5. 七步 AI Agent 探索工作流（明径/大淘宝技术，2026-05-22）
OpenCLI 官方工作流将浏览器自动化拆解为 7 步，每步对应明确工具：
| 步骤 | 工具 | 做什么 |
|------|------|-------|
| 0. 打开浏览器 | `browser_navigate` | 导航到目标页面 |
| 1. 观察页面 | `browser_snapshot` | 观察可交互元素（按钮/标签/链接） |
| 2. 首次抓包 | `browser_network_requests` | 筛选 JSON API 端点，记录 URL pattern |
| 3. 模拟交互 | `browser_click` + `browser_wait_for` | 点击"字幕""评论""关注"等按钮 |
| 4. 二次抓包 | `browser_network_requests` | 对比步骤 2，找出新触发的 API |
| 5. 验证 API | `browser_evaluate` | `fetch(url, {credentials:'include'})` 测试返回结构 |
| 6. 写代码 | — | 基于确认的 API 写适配器 |

### 6. 五级认证策略（cascade 命令）
OpenCLI 提供 5 级认证策略，使用 `cascade` 命令自动探测：
1. **Tier 1: public** — 直接 `fetch(url)` 公开 API，不需要浏览器
2. **Tier 2: cookie** — `fetch(url, {credentials:'include'})` 带 Cookie，最常见
3. **Tier 3: header** — 加上 Bearer / CSRF header（如 Twitter ct0 + Bearer）
4. **Tier 4: intercept** — 网站有 Pinia/Vuex Store，拦截 Store Action + XHR
5. **Tier 5: ui** — UI 自动化，穷尽所有手段后的最后手段

### 7. 懒加载机制
很多 API 是懒加载的（用户必须点击按钮/标签才会触发网络请求）。字幕、评论、关注列表等深层数据不会在页面首次加载时出现在 Network 面板中。如果 AI Agent 不主动去浏览和交互页面，永远发现不了这些 API。

### 8. AI 原生 CLI 自动生成
OpenCLI 提供 `explore` → `synthesize` → `generate` 完整流程：
1. **探索**（explore）— 深度抓取页面、自动滚动、拦截网络请求、识别框架与状态管理
2. **策略选择** — 根据鉴权头/签名等特征自动选择 Tier 1-4
3. **适配器合成**（synthesize）— 基于探索产物生成候选 YAML，自动模板化 URL/字段映射
4. **测试验证**（generate）— 串联探索→合成→注册→验证，支持目标化选择与回退策略
适配器类型选择：有 evaluate 步骤（内嵌 JS）用 TypeScript (`src/clis/<site>/<name>.ts`)，纯声明式用 YAML。

### 9. 未来竞争维度：从界面到可调用性
> "过去的软件竞争界面，未来的软件竞争可调用性。"
Agent 不会欣赏按钮做得多圆，只在乎能不能稳定调用。GUI 服务人，API 是能力底座，而 Agent 最喜欢的是更清晰的执行面：命令、参数、返回值、失败原因。未来软件的新竞争维度不是谁页面更好看，而是谁更容易被 Agent 理解、调用、验证。

## 实践启示
1. **优先选择 OpenCLI 的场景**

   - AI Agent 需自动化操作网页、执行复杂读写操作
   - 有合法账号需批量执行账号内操作
   - 目标网站反爬机制严格，传统爬虫无法突破
   - 需要快速将网站功能封装成标准化脚本供 AI 调用
2. **OpenCLI 的核心局限**

   - 仅支持本地单用户浏览器会话，无法分布式大规模爬取
   - 不适合全网级公开数据采集，只限于账号有权限访问的内容
3. **互补策略**

   - OpenCLI 解决爬虫最头疼的登录态、反爬对抗、复杂网站适配痛点
   - 爬虫负责分布式、海量无登录态公开网页的全网爬取
   - 二者不是互斥，而是针对不同场景的互补方案

## Related
- [CLI-Anything](ch03/094-cli-anything.html) — 让所有软件 Agent 原生化
- [AutoCLI](ch03/117-autocli.html) — 极速网页信息获取
- [AgentBrowser](../ch09/157-agent-browser-claude-code-qoderwork.html) — AI 专用浏览器
  > **补充**（行小招/科技充电站，2026-05-19）：四工具横向对比（browser-use / Playwright / chrome-devtools-mcp / agent-browser）核心结论：agent-browser 用 accessibility tree + @eN ref，token 最省、session 跨命令持久，适合 AI Coding 即时验证；browser-use 适合目标模糊的完整自动化；Playwright 适合 CI 稳定回归；chrome-devtools-mcp 适合底层网络/性能/JS 调试。

- [Hermes-Agent](ch03/090-hermes-agent.html) — 支持从 OpenCLI 无缝迁移
- [OpenClaw](https://github.com/QianJinGuo/wiki/blob/main/concepts/openclaw-architecture.md) — **注意：与 OpenClaw（淘天 Agent 框架）无关系**，两者仅命名相似，实为完全不同项目：OpenCLI = 网页自动化工具，OpenClaw = AI Agent 执行框架

## 相关实体

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/crawler-vs-opencli-doubao.md)

- [GBrain](../ch01/319-gbrain-yc-ceo-garry-tan-postgres-native-ai-5-llm.html)

---

