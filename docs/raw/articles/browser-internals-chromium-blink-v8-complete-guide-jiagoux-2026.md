---
title: "现代浏览器内部机制全面解析：Chromium/Blink/V8 从网络到渲染全管线"
source_url: "https://mp.weixin.qq.com/s/UBlsPgnOLaa3yBGRD0TjRg"
author: "架构师 JiaGouX"
source: "架构师（JiaGouX）"
ingested: 2026-07-01
sha256: placeholder
---

Web 开发者常把浏览器当成一个黑盒：它似乎能把 HTML、CSS 和 JavaScript 自动变成可交互的 Web 应用。实际情况要复杂得多。Chrome（Chromium）、Firefox（Gecko）或 Safari（WebKit）这样的现代浏览器，本身就是一套庞大的软件系统。它要调度网络请求，解析并执行代码，用 GPU 加速图形渲染，还要把页面内容隔离在沙箱进程中，保证安全性。

这篇文章会拆开现代浏览器的工作方式。主线放在 Chromium 的架构和内部机制上，同时说明其他引擎在哪些地方不同。我们会从网络栈、解析管线一路讲到 Blink 渲染、V8 JavaScript 引擎、模块加载、多进程架构、安全沙箱和开发者工具。目标是给开发者一个清楚的心智模型，看懂页面背后到底发生了什么。

## 1 网络与资源加载

每次页面加载，都从浏览器网络栈获取 Web 资源开始。输入 URL 或点击链接后，浏览器 UI 线程，也就是运行在"浏览器进程"里的线程，会发起一次导航请求。

浏览器进程是主控进程，负责管理其他进程和浏览器用户界面。凡是不属于某个具体网页标签页内部的事情，基本都由浏览器进程控制。

URL 解析与安全检查 → DNS 查询 → 建立连接（TLS 握手）→ 发送 HTTP 请求 → 接收响应 → 重定向与后续步骤。

这些步骤都发生在网络栈中。在 Chromium 里，网络栈运行在专门的 Network Service 中，现在通常是单独进程，这是 Chrome "服务化"的一部分。

### 推测加载与资源优化

现代浏览器会在网络阶段做性能优化：DNS 预取、preconnect、HTTP 缓存。Chromium 有复杂的 preload scanner——它会在主 HTML 解析器前方扫描原始 HTML 标记。主解析器被 CSS 或同步 JavaScript 阻塞时，预加载扫描器仍然可以继续发现图片、脚本、样式表等资源，并并行请求。

Early Hints（HTTP 103）允许服务器在生成主响应时先发送资源提示。Speculation Rules API 用 JSON 规则描述哪些 URL 可以根据用户行为提前预取或预渲染。HTTP/2 与 HTTP/3 通过并发传输和减少握手开销改善加载性能。

浏览器还给不同资源分配优先级：HTML 和 CSS 最高、脚本居中、图片通常更低。开发者可以用 `link rel=preload` 和 Fetch Priority 影响这种优先级。

## 2 解析 HTML、CSS 和 JavaScript

渲染器进程收到 HTML 后，主线程按 HTML 规范开始解析。HTML 解析的结果是 DOM（Document Object Model，文档对象模型）。解析是增量进行的，可以和网络读取交错执行。

HTML 解析过程中也会遇到需要加载的资源。解析器大多数时候可以继续往下走，只有脚本是一个重要例外：默认情况下，HTML 解析器遇到 `<script>` 会暂停解析，先执行脚本。开发者可以用 `defer`、`async` 或 ES module 脚本改变这种行为。

CSS 解析生成 CSSOM（CSS Object Model）。浏览器的 CSS 解析器读取 CSS 文件或 `<style>` 块，生成 CSS 规则列表。之后浏览器把 DOM 和 CSSOM 结合起来，判断每个元素匹配哪些规则，经过级联、继承和默认样式后得到最终 computed style。

HTML 解析可以在 CSS 尚未完全加载时继续，但首屏渲染通常会等 head 中的 CSS 加载完——避免无样式内容闪烁。

## 3 样式与布局

此时浏览器已经知道 DOM 结构和每个元素的 computed style。下一步是布局（layout/reflow）：计算每个元素的几何信息。

浏览器遍历 DOM，生成布局树（layout tree / render tree）。布局树结构接近 DOM，但会去掉非视觉元素（script、meta）。`display:none` 的元素不会进入布局树，`visibility:hidden` 仍有布局盒子但不参与绘制。`::before`、`::after` 伪元素会进入布局树。

布局计算是递归过程：从根 `<html>` 开始，先确定视口尺寸，再布局子元素。JavaScript 后续修改元素尺寸或插入内容，可能导致 reflow。浏览器会标记布局树中的 dirty 部分，只重新计算必要区域。

## 4 绘制、合成与 GPU 渲染

布局完成后，Chrome 在渲染器主线程上遍历布局树，生成 paint records / display list——一组有坐标的绘图操作。现代浏览器先记录绘制命令，再通过合成阶段组装最终图像。

合成是一种优化：浏览器把页面拆成多个可以独立处理的层。带 CSS transform、动画、视频或 canvas 的元素可能会获得自己的层。浏览器可以分别光栅化每一层，再由合成器把它们混合到屏幕上（通常由 GPU 完成）。

Chromium 管线：DOM → style → layout → paint → layerize → raster（瓦片）→ composite（GPU）。Firefox 的 WebRender 不显式构建传统层，而是把 display list 交给 GPU 进程，用 GPU shader 处理大部分绘制。

## 5 JavaScript 引擎内部：V8

V8 分多个执行层级：Ignition（解释字节码）→ Sparkplug（baseline JIT）→ Maglev（中层优化 JIT）→ TurboFan（最高级优化 JIT，backend 正被 Turboshaft 替代）。

后台编译：从 Chrome 66+ 开始，V8 可以在后台线程编译 JavaScript 源码。脚本运行时，Ignition 解释字节码并执行程序，同时收集 profiling 数据。运行次数多的代码值得花更多编译成本优化。

V8 的 GC（Orinoco）：分代（young/nursery → old）、增量、并发。新对象分配在 young generation，频繁执行快速的 scavenging；多次存活的对象晋升到 old generation，使用 mark-and-sweep 并带 compaction。大量标记工作已在后台线程并发完成。

## 6 模块加载与 Import Maps

JavaScript Modules (ES6 modules) 有不同的加载和执行模型。`<script type="module" src="main.js">` 会构建模块依赖图，全部获取并解析后再按依赖顺序执行。`dynamic import()` 可以在运行时加载模块。Import Maps 是一段 JSON 配置，告诉浏览器如何把模块说明符解析成真实 URL——让无打包开发成为可能。

## 7 浏览器多进程架构

Chrome 使用多进程架构：一个 Browser Process（UI、导航、进程管理）+ 多个 Renderer Process（每个标签页/站点）+ GPU Process + Network Process + 各种 Utility Processes。

多进程收益：
- 稳定性：渲染器崩溃不会拖垮整个浏览器
- 安全性（沙箱）：Web 内容运行在受限进程中
- 性能隔离：重型 Web 应用困在自己的进程中
- 内存分割：进程间内存隔离，关闭标签页可高效回收

Chrome 最初每标签页一个进程，演进为每站点一个进程（99% 桌面用户默认启用站点隔离）。两个同站点标签页可能共用进程以节省内存；跨站点 iframe 默认放在不同进程。

Firefox（Electrolysis e10s + Project Fission）和 Safari（WebKit2）都已收敛到类似的多进程+站点隔离设计。

## 8 站点隔离与沙箱

站点隔离（Site Isolation）：不同网站运行在不同渲染器进程中。Spectre 漏洞后得到强化——恶意 JavaScript 可能利用推测执行读取不该读取的内存。Chrome 默认让每个站点拥有自己的进程，包括跨源 iframe（OOPIF）。

沙箱：渲染器进程在受限权限中运行。Windows 上使用 job object 并降低权限；Linux 上使用 namespaces 和 seccomp filters。渲染器基本只能计算和渲染内容，不能直接打开文件、摄像头或麦克风。

站点隔离落实最小权限原则：源 A 的代码不能访问源 B 的数据。沙箱保证恶意代码不能直接碰系统。攻击者需要链式漏洞：先突破渲染器，再逃出沙箱。

## 9 Chromium、Gecko 和 WebKit 的差异

| 维度 | Chromium/Blink | Gecko (Firefox) | WebKit (Safari) |
|------|---------------|-----------------|-----------------|
| CSS 引擎 | C++ 单线程 | Stylo（Rust 多线程） | C++ 单线程 |
| 渲染 | CPU 光栅→GPU | WebRender（GPU 原生） | CoreAnimation |
| JS 引擎 | V8 | SpiderMonkey (WarpMonkey) | JavaScriptCore (LLVM FTL) |
| 进程模型 | 每站点一进程 | 8 内容进程+Fission | 每标签页一进程 |

## 10 总结

浏览器本质上像一个小型操作系统：管理进程、线程、内存和大量复杂子系统。对开发者的几个要点：优化网络使用、让 HTML/CSS 结构更高效、批处理 DOM 更新、动画使用合成友好的属性、关注 JS 执行、拥抱安全特性、善用 DevTools。
