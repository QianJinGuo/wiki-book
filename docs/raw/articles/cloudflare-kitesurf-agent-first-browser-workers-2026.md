---
source: newsletter
source_url: https://blog.cloudflare.com/kitesurf/
ingested: 2026-08-08
sha256: 1d55147ff8bb29bb23c26ae73434bad2775f21a051b0c122124c831e9f7f5720
---

# Introducing Kitesurf: The agent-first browser that runs in V8 isolates on Cloudflare Workers

August 6, 2026 — Agents Week — Cloudflare Blog — Celso Martinho, Ruskin Constant, Rui Figueira, Luís Duarte — 16 min read

Should we build our own browser? This is one of those questions that has come up every few months internally at Cloudflare for years. But we never quite found the balance between the technical difficulty of such an endeavour and the unique problems we'd be solving. Until now.

Something magical happened: we reached a tipping point where a series of powerful technical advancements in our Developer Platform became a reality, while the advent of AI agents and the demand for a new kind of browser became critical at the same time. Running WebAssembly (Wasm) in Workers is now very mature. Primitives like dynamic workers, SQLite-based Durable Objects, Worker-to-worker RPC, service bindings, higher NodeJS compatibility and higher limits open doors to much more ambitious and complex applications.

Browser engines like Chromium were built for humans, not agents, and they come with overhead that AI models simply do not need. They consume so much memory and compute that providing every agent with its own instance is prohibitively expensive. AI doesn't care about tabs, themes, browser extensions, or synchronization across devices. It cares about token count, context windows, scalability, performance, and costs. The threat model in the context of AI using a browser is different: prompt injection and tool safety are top priorities.

Today we are announcing Kitesurf, a new browser that runs entirely on top of Workers that we built specifically for agents, available for free while in beta in Browser Run. Kitesurf is significantly more efficient in CPU and memory consumption than Chromium for common agentic tasks like screenshots and HTML extraction.

## How it started

We got the initial inspiration from obscura, a headless engine written in Rust for AI automation that has "no Chrome, no Node.js, no dependencies." Then, with the help of an AI agent, we tried to port it to Workers. Once we gave the AI a solid plan and a clear definition of success — detailed enough for the agent to loop endlessly and ask questions when needed — it did work.

## Design decisions

Tests, tests, tests: Web Platform Tests (WPT) gave AI agents clear goalposts for assessing feature conformance. We curated the selection and order of features to assign to the agents, allowing humans to focus on architectural work. We also implemented a combination of integration testing and visual regression testing — multistep Puppeteer tests on real websites against both Chromium and Kitesurf, comparing rendering outputs at every step.

Use Rust when possible: we opted for native Rust and compile directly to WebAssembly using wasm-bindgen, avoiding unnecessary emulation layers.

Exception handling: any failure degrades to a blank frame or a missing element, never a dead session. Catch faults at every boundary, default to something safe and empty.

Isolation: an agent is pointed at arbitrary code from arbitrary origins, so every page load is untrusted input and every session starts fresh. Each component is isolated and has access only to the resources strictly necessary for its function. Cloudflare Workers' security model is built around isolation by design, but we still have to enforce the same principle at the application level.

Stateless whenever possible: State is what makes failure expensive. A stateless component is disposable and parallel by nature: kill it the moment it stalls, run a thousand at once, and size them to demand. Wherever a component can be stateless, it should be.

## How we built it

Three main components: the Engine, PageScript, and PageRenderer.

Fetching from origins: Kitesurf fetches arbitrary assets through one single component, the SandboxOutbound worker, and nothing else can touch the network directly — enforced by Dynamic Workers. We use SandboxOutbound to enforce CORS, inject browser-shaped headers, filter responses, and keep each page's cookies in their own jar. Anything that fails our policy gets a 403.

The Engine is the only public-facing component. It handles the Chrome DevTools Protocol (CDP) WebSocket and HTTP REST APIs and stores each session state. All other components are stateless. The advantage of using CDP is client compatibility: Puppeteer, Playwright, chrome-remote-interface, and the actual Chrome DevTools frontend all work.

PageScript: every page or out-of-process iframe (OOPIF) uses Dynamic Workers to spin up a long-lived PageScript isolate that handles the page session, consisting of a clean globalThis and the DOM document object. For parsing the HTML and the CSS we use parts of Blitz, a modular rendering engine, and Stylo, Firefox's high-performance CSS parser, both written in Rust. For evals (not supported natively in Workers), we use Boa JS, an ECMAScript engine written in Rust, to compile and run on Workers — a runtime on top of a runtime.

PageRenderer generates the actual pixels: every time the engine needs a frame, PageRenderer gets the page object from PageScript (the scene), fetches the internal fonts and images from Static Assets, rasterizes everything into an image buffer, and returns it to the engine as JPEG/PNG or PDF. blitz-paint uses Parley for shaping characters into glyphs, choosing fonts, and breaking text into lines.

Workers' built-in RPC system: the Engine Worker calls renderFrame() from the PageRenderer Worker over RPC with one single call and gets a PNG. Because the renderer holds no page state (only a disposable cache), the engine can safely kill and relaunch it on any failed or stuck RPC call — each render request is self-contained, retryable, and its isolate cheap and throwaway.

## Performance

Kitesurf passes 215,000+ WPT tests and growing. Performance (medians of five Browser Run quick-action runs across a 14-URL corpus vs Chromium): CPU screenshot 380ms vs 1173ms (3.1x less), CPU HTML extraction 229ms vs 877ms (3.8x less), Memory screenshot 57.8 MiB vs 271 MiB (4.7x less), Memory HTML extraction 39.4 MiB vs 273.7 MiB (7.0x less), Wall time screenshot 1,148ms vs 637ms (1.8x slower), Wall time HTML extraction 820ms vs 472ms (1.7x slower). Chromium wins the stopwatch because a JIT that has already seen this page always beats a cold software renderer. But Kitesurf wins on memory and CPU, the things that actually drive your bill, by 3-7x.

## Try it today in Browser Run

The Browser Run CDP endpoint now supports Kitesurf as an option: existing clients Puppeteer, Playwright, chrome-remote-interface, or any AI Agent that speaks MCP and CDP already work, just add browser=kitesurf parameter. There's also a public playground with Chrome DevTools injected in the UI, including a Memory panel that reports the WebAssembly footprint of each isolate.

## When is Kitesurf better / not yet able

Kitesurf is great for AI agents that need to render pages but can accept the trade-offs of not using a full-featured, pixel-perfect Chromium browser, and for one-shot Quick Actions (extracting content, generating PDFs or screenshots). Think of Kitesurf as an ephemeral, fully-isolated, stateless engine designed to exist only for the duration of a task.

If you need to play video, render WebGL, negotiate a bot-challenge handshake with real TLS fingerprints, or start a ten-minute authenticated session that requires persistent state — Kitesurf isn't yet the right option.

## Where it goes

Kitesurf is twelve weeks old. The first commit was in May. Active work: better CDP coverage, rendering fidelity for screenshots and PDFs (LLMs can often work better from an image than from the underlying text), WPT coverage, efficiency. Kitesurf will be open sourced once ready — the goal is to let any customer deploy their own version on their own accounts.