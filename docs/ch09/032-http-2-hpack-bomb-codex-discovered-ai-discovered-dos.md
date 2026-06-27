# HTTP/2 HPACK Bomb — Codex Discovered AI-Discovered DoS

## Ch09.032 HTTP/2 HPACK Bomb — Codex Discovered AI-Discovered DoS

> 📊 Level ⭐⭐ | 14.0KB | `entities/http2-hpack-bomb-codex-ai-discovery-32gb-dos.md`

# HTTP/2 HPACK Bomb — Codex Discovered AI-Discovered DoS

> **Source**: Calif.io disclosure 2026-06-02 by Quang Luong, Jun Rong, Duc Phan. Attack discovered by OpenAI Codex from public fix commits. Affects nginx, Apache httpd, Microsoft IIS, Envoy, Cloudflare Pingora in default configuration. 880,000+ vulnerable websites per Shodan.

## 三个独有贡献（不应合并到现有 entity）

1. **AI-as-vulnerability-discoverer (Codex)** — First major security disclosure where the attack chain was discovered end-to-end by an AI coding model reading public fix commits. Signals a regime change in commit-to-exploit windows (weeks → minutes).
2. **Novel HPACK bomb variant — empty-header amplification** — Bypasses server's decoded-size cap by stuffing nearly-empty headers into the dynamic table and exploiting per-entry bookkeeping. Apache/Envoy add Cookie crumb-splitting bypass (RFC 9113 §8.2.3) for 4,000-5,700x amplification.
3. **HTTP/2 window stall as memory-pinning primitive** — Zero-byte WINDOW_UPDATE + 1-byte drips keeps every allocation live until server timeout. The "kill" tactic is to hold pressure below the OOM threshold and degrade all other requests via swap, not OOM the worker.

## Attack Anatomy

Two decade-old techniques, chained in a way humans hadn't combined before:

### Component 1: HPACK Indexed Reference Bomb

[HPACK (RFC 7541)](https://www.rfc-editor.org/rfc/rfc7541) maintains a stateful dynamic table of recently seen headers. A sender inserts a header once, then refers to it on later requests by **1-byte index**. The receiver materializes a full header copy per reference.

- Seed dynamic table with one header
- Emit thousands of 1-byte indexed references
- Wire cost: 1 byte per reference
- Server cost: ~70 bytes (nginx/IIS/Pingora) to ~4,000 bytes (Apache/Envoy) per reference

### Component 2: HTTP/2 Window Stall

[HTTP/2 (RFC 9113)](https://www.rfc-editor.org/rfc/rfc9113) per-stream flow control lets the receiver advertise a window. The client controls the window for the server's responses.

- Advertise zero-byte window → server can't finish response
- Drip 1-byte WINDOW_UPDATE frames → reset send timeout
- Every allocation pinned in memory until server timeout

## Why the Classic Defenses Don't Catch It

| Defense | Classic HPACK Bomb (CVE-2016-6581, CVE-2025-53020) | New Codex Variant |
|---------|---------------------------------------------------|-------------------|
| Decoded header size cap | **Catches** — large value stuffed into table | **Bypasses** — header is nearly empty, no decoded size to limit |
| Header field count cap | n/a | **Bypasses** for Apache/Envoy — Cookie can be split into per-crumb fields (RFC 9113 §8.2.3) and crumbs aren't counted |
| Per-stream memory cap | Effective against classic | **Bypasses** — pinned via window stall, not freed |

**Cookie crumb amplification** (Apache httpd rebuilds the whole merged string on every crumb, leaving older copies live → even an empty cookie gives ~4,000:1 ratio). Envoy appends each crumb into a buffer → 4KB cookie value × 32k references = measured RSS ratio up to 5,700:1 on a single stream.

## Impact

- **880,000+ websites** exposed (Shodan: nginx/Apache/IIS/Envoy/Pingora with HTTP/2)
- **32GB server memory** consumption in **~20 seconds** from a single 100Mbps client (Apache/Envoy)
- Single client on home broadband can render a server inaccessible in **seconds**
- "Smart" attack: hold memory pressure just under kill threshold → swap thrash → all other requests crawl (killed worker just respawns clean)

## Disclosure Timeline

| Server | Disclosed | Status | Identifier |
|--------|-----------|--------|------------|
| nginx | April 2026 | **Fixed in 1.29.8** — added `max_headers` directive (default 1000), imported from freenginx | commit `365694160a` |
| Apache httpd | May 27, 2026 | **Fixed same day** by Stefan Eissing — `cookie` now counts against `LimitRequestFields` | **CVE-2026-49975**, mod_http2 v2.0.41 (not in 2.4.x) |
| Microsoft IIS | notified | **No patch** | Disable HTTP/2 or front with header-count cap |
| Envoy | notified | **Patches released** (GHSA-22m2-hvr2-xqc8), being validated 2026-06-03 | |
| Cloudflare Pingora | notified | **No patch** | Disable HTTP/2 or front with header-count cap |

## Mitigations

- **nginx**: Upgrade to 1.29.8+. Fallback `http2 off;`.
- **Apache httpd**: mod_http2 v2.0.41. Fallback `Protocols http/1.1`. `LimitRequestFieldSize` shrinks per-stream blast radius but is **partial** — only `LimitRequestFields` against cookie crumbs would help (currently it doesn't).
- **IIS / Pingora / Envoy** (no patch): disable HTTP/2 or front with hard header-count cap.
- **General**: cap **decoded header size** AND **field count** AND consider HPACK dynamic-table-size limits.

## Historical Lineage

- 2016: Cory Benfield coins "HPACK Bomb" → CVE-2016-6581
- 2016: HTTP/2 Slowloris variants → CVE-2016-8740, CVE-2016-1546
- 2025: Gal Bar Nahum → ~4,000x amplification vs Apache httpd → CVE-2025-53020
- 2026: Codex chain → 5 servers, 880k+ sites, 32GB / 20s

## Significance: AI-Driven Vulnerability Discovery

The disclosure states: *"any capable AI model can turn those diffs into a working exploit, which is exactly how we found that Microsoft IIS, Envoy, and Pingora are also vulnerable."*

This is the canonical example of:
- **Public fix commits becoming AI attack seeds** — the diffs in nginx/Apache were enough for Codex to construct the exploit against 3 other servers
- **Compressed commit-to-exploit window** — weeks (human reverse engineering) → minutes (AI-driven)
- **Vendor coordination pressure** — disclosing to all 5 vendors becomes mandatory because the moment one fix ships, AI can fan out the exploit
- **A new threat model for security research** — open-source fix commits are no longer safe to publish before all downstream consumers are also patched

## Why a New Entity (not raw supplement)

This article covers a **disclosure + vulnerability class + AI discovery regime** that no existing entity captures. The closest related entities (1password machine identities, AI agent security surveys, etc.) are general security topics; none address:
- The specific HPACK bomb variant mechanics
- The AI-vulnerability-discovery pattern as a phenomenon
- The HTTP/2 protocol-level DoS primitive (window stall as memory-pinning)

Created as new entity: `http2-hpack-bomb-codex-ai-discovery-32gb-dos.md`. The Calif.io disclosure is the source; this entity is the synthesis.

## Related Topics

- HTTP/2 protocol flow control (RFC 9113)
- HPACK dynamic table attacks (RFC 7541)
- OpenAI Codex
- Slowloris DoS
- AI-generated exploit primitives
- AI agent security (see [1Password Securing Ai Agents Machine Identities](https://github.com/QianJinGuo/wiki/blob/main/entities/1password-securing-ai-agents-machine-identities.md), [Ai Agents Security Survey Attack Defense](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-agents-security-survey-attack-defense.md))
- CVE disclosure conventions (CVE-2016-6581, CVE-2025-53020, CVE-2026-49975)

## 深度分析

### 1. 从单向量攻击到双元绑架：协议层 DoS 的范式转移

传统 HTTP/2 DoS (Slowloris, connection exhaustion) 依赖的是**单维度资源耗尽**——要么吃满连接数，要么吃满请求体。HPACK Bomb + Window Stall 的组合做了一件以前没人做过的事：**用压缩状态机的引用语义把一个字节的 wire cost 映射到 70-5700 字节的 server allocation，然后用一个永远不完成的响应把这个 allocation 钉死在内存里**。

这意味着攻击者的瓶颈从"我能打开多少连接"变成了"我能在动态表里塞多少索引引用"。一个连接 + 20KB 的请求包，在 Apache/Envoy 下可以产生 32GB 的内存驻留，压缩比超过一百万倍。这种量级的放大不是因为协议有漏洞，而是因为**两个 RFC 定义的正常机制在组合时产生了非线性的副作用**。

### 2. AI 发现攻击的供应链效应：fix commits 作为攻击预测信号

Codex 发现此漏洞的路径不是扫描，不是 fuzz，而是**读 public fix commits**。nginx 和 Apache httpd 的修复 commit 被公开后，Codex 从 diff 中还原出了攻击向量的原型，然后用它对 IIS、Pingora、Envoy 做了攻击预测——三家里两家确认有漏洞。这个路径的隐含意义是：**任何带 diff 的安全修复，在 patch window 内都是零日候选**。

这和传统的 commit-to-stable 分发模式产生了根本性的张力：安全更新的协调成本本来就高，现在还要多一个"AI 能否从 fix 反推 exploit"的威胁模型。以前是"修完就安全"，现在是"修完到用户部署之间的窗口期内，公开 fix 就是攻击手册"。

### 3. 未能修复的服务器暴露了一个不对称的缓解失效问题

IIS 和 Cloudflare Pingora 在本文发布时**没有补丁**，建议是"disable HTTP/2 或在前端加 header count cap"。这个建议的问题在于：它把缓解责任从服务器层转移到了基础设施运营层，且没有任何服务器内置的默认保障。这意味着大量无法快速修改架构的生产环境（特别是企业内网、遗留系统）处于无解状态——不是不知道风险，而是没办法在合理时间内做掉风险。

Envoy 发了 patch，但"being validated"的表态说明补丁质量本身还未被社区验证。对于关键基础设施而言，**patch 而不是 disable HTTP/2** 是更合理的选项，但这要求运维能快速滚动更新——这个能力本身就是一种资源不对称的体现。

### 4. "Just under OOM" 策略：针对有弹性恢复机制的系统的新 kill 哲学

攻击者不在 OOM threshold 上面停留，而是**维持在 OOM threshold 之下把服务器推进 swap**，让所有其他请求延迟退化。这个策略的目标不是杀死进程（被 kill 的 worker 会 respawn clean），而是让服务器在低性能状态持续服务。这个攻击逻辑在容器化和 K8s 环境里尤其有效：Pod OOMKill 会重启，但重启后的 Pod 立即再次被 swap thrash，调度器会不断把它往有问题的节点上调度，形成一种**稳态性能退化**。

### 5. HPACK 安全研究的演化路径：从 2016 到 2026

从 Cory Benfield 的 CVE-2016-6581（ coined "HPACK Bomb"），到 2025 年 Gal Bar Nahum 的 4000x 放大，再到 2026 年 Codex 发现的三漏洞组合，HPACK 攻击经历了三次演化：第一次是"概念证明"（ stuffing large values），第二次是"放大工程"（Cookie crumb 分解 + 重组），第三次是"协议原语组合"（Indexed Reference Bomb + Window Stall）。每次演化都利用了前一次被修复的边界条件的**相邻未保护区域**。这个 pattern 说明 HPACK 的安全 space 比想象中更深——RFC 9113 和 RFC 7541 的交叉地带还有大量末被系统性审计的角落。

## 实践启示

1. **任何带 diff 的安全 fix，在部署完成前都应视为潜在攻击手册**。尤其是 nginx/Apache 这种主流通用服务器的 fix，应该在 diff 公开的同时评估 AI 能否反推，然后加速协调 disclosure。 

2. **HPACK 动态表的安全默认值需要重新评估**。当前大多数服务器的动态表大小限制（通常 4KB-64KB）是以"有效压缩"为目标的，没有考虑"单连接注入大量引用"场景下的内存乘数效应。建议对 max_entries 和 max_header_list_size 做联调评估，而不是分别设置。 

3. **HTTP/2 flow control window 不应该被用来作为长期资源保留机制**。对于需要长时间保持连接的场景（如 Server-Sent Events、长轮询），应该显式设置连接超时和最大请求生命周期，而不是依赖 flow control window 来"暂停"响应。 

4. **Cookie crumb 的计数逻辑需要重新对齐 RFC 9113 §8.2.3**。Apache httpd 和 Envoy 没有把 crumb 分裂后的字段计入 LimitRequestFields，导致这个 RFC 条款从"兼容性特性"变成了"放大器"。任何做 header 字段 count limit 的服务器，都需要确认 crumb 分裂后的字段是否被正确计入。 

5. **无补丁服务器（IIS/Pingora）的缓解路径需要纳入架构层而不是应用层**。如果无法快速升级到有 patch 的版本，HTTP/2 禁用或前端硬性 header count cap 需要在 load balancer 或 API gateway 层实现，而不是在应用层——因为应用层的 mitigation 在高并发下本身可能成为 DoS 向量。

---

