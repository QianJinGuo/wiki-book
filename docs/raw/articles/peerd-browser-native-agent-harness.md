---
title: "peerd: The first AI agent harness native to the browser"
source_url: "https://github.com/NotASithLord/peerd"
author: "NotASithLord"
published: "2026-06-25"
ingested: "2026-06-25"
sha256: "auto"
type: article
---

# peerd: The first AI agent harness native to the browser

peerd is the first AI agent harness native to the browser. It's a Chrome/Firefox extension that runs a full agent loop in the browser you already use, with your existing tabs and sessions. It reads and drives your pages, spins up sandboxed compute (JS Notebooks, full Linux VMs compiled to WebAssembly, personal client-side apps), and (on the preview channel) shares what it builds over a peer-to-peer WebRTC network built for agent-to-agent communication. BYOK to the model provider of your choice. No backend, no telemetry, no cloud component in the data path.

## Architecture

The browser is its runtime and its security model. It builds on decades of hardened browser platform work:

- **V8 isolates** for sandboxing
- **WebCrypto** for the vault
- **WebAuthn passkeys** to unlock it
- **Opaque-origin iframes** for isolation
- **Subresource Integrity** for code verification

peerd writes none of its own cryptographic or process-isolation code. The agent that holds your keys never reads a raw page; a disposable runner with no keys and no network does, and its output comes back fenced as untrusted. Every action the agent drives is verified against the live page before it counts as done.

## Key Features

- **Chrome/Firefox extension**: Runs in your existing browser, no separate app needed
- **Full agent loop**: Reads and drives browser tabs, executes actions
- **Sandboxed compute**: JS Notebooks, WASM Linux VMs, client-side apps
- **Peer-to-peer**: WebRTC-based agent-to-agent communication (preview channel)
- **BYOK**: Bring Your Own Key to any model provider
- **No backend/telemetry**: Zero cloud dependency in the data path

## Security Model

The key-holder agent never touches raw page content. Instead:
1. A disposable runner (no keys, no network) reads the page
2. Its output is fenced as untrusted
3. Actions are verified against the live page before completion
4. V8 isolates, WebCrypto, WebAuthn provide the security foundation

## Status

0.x, experimental beta. Initial feature buildout is complete and integrated, but the surface is still moving: breaking changes are likely, storage formats may shift.
