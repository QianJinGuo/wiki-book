---
title: "Codex Discovered a Hidden HTTP/2 Bomb"
source_url: https://blog.calif.io/p/codex-discovered-a-hidden-http2-bomb
feed_name: Calif.io (HTTP/2 security research)
source_published: 2026-06-02T19:08:22+00:00
ingested: 2026-06-04
sha256: pending
---

# Codex Discovered a Hidden HTTP/2 Bomb

By Quang Luong, Jun Rong, Duc Phan (Calif.io) — published 2026-06-02.

## Disclosure Summary

Calif.io is publishing **HTTP/2 Bomb**, a remote denial-of-service exploit against most major web servers in their default configuration:

- nginx
- Apache httpd
- Microsoft IIS
- Envoy
- Cloudflare Pingora

The attack was discovered by **Codex** (OpenAI's coding model), which chained two techniques known to humans for a decade: a compression bomb and a Slowloris-style hold. The bomb targets **HPACK** (HTTP/2's header compression scheme); one byte on the wire becomes one full header allocation on the server, repeated thousands of times per request. The hold is a zero-byte flow-control window that keeps the server from ever freeing any of it.

**Attack scale:** Shodan search found **880,000+ websites** running HTTP/2 on these servers. A home computer on 100Mbps can render a vulnerable server inaccessible within seconds. Against Apache httpd and Envoy, a single client can consume and hold **32GB of server memory in ~20 seconds**.

## The Two Chained Techniques

### 1. HPACK Indexed Reference Bomb

[HPACK (RFC 7541)](https://www.rfc-editor.org/rfc/rfc7541) is a stateful compression scheme. Each side of an HTTP/2 connection maintains a dynamic table of recently seen headers. A sender can insert a header into the table once and then refer to it on later requests by index, usually a single byte. The receiver looks up the index and materializes a fresh copy of the full header into the request it's assembling.

**Exploit pattern:** seed the dynamic table with one header, then emit thousands of 1-byte indexed references to it. Each reference costs the attacker one wire byte and the server:
- ~70 bytes (nginx, IIS, Pingora)
- ~4,000 bytes (Apache httpd, Envoy)

of allocation per reference.

### 2. HTTP/2 Window Stall

[HTTP/2 (RFC 9113)](https://www.rfc-editor.org/rfc/rfc9113) adds per-stream flow control: the receiver advertises a window, and the sender can't transmit DATA beyond that window until it gets a `WINDOW_UPDATE`. The client controls the window for the server's responses.

**Exploit pattern:** advertise a zero-byte flow-control window so the server can never finish sending its response, then drip 1-byte `WINDOW_UPDATE` frames to keep resetting the send timeout, pinning every allocation in memory for as long as the server's timeout allows.

## Why This Variant Is Novel

The classic "HPACK Bomb" pattern (CVE-2016-6581, CVE-2025-53020) stuffs a large value into the table and references it repeatedly, so servers learned to cap the total decoded header size.

**This new variant** goes the other way: the header is **nearly empty**, and the amplification comes from the per-entry bookkeeping the server allocates around it. The decoded-size limit never fires because there's almost nothing to decode.

**Cookie crumb bypass** (for servers that cap header-field count instead of size — Apache, Envoy): [RFC 9113 §8.2.3](https://www.rfc-editor.org/rfc/rfc9113#section-8.2.3) explicitly allows splitting the Cookie header into one field per crumb, and these servers weren't counting crumbs against the limit. From there the amplification depends on how the server reassembles the cookie:

- **Envoy**: appends each crumb into a buffer → 4 KB cookie value referenced 32k times = logical ~3,600:1 ratio; measured RSS ratio up to **~5,700:1** on a single stream
- **Apache httpd**: rebuilds the whole merged string on every crumb, leaving older copies live → even an **empty cookie gives ~4,000:1**

## Kill Strategy (Beyond Simple OOM)

In a real attack you probably don't want the process to OOM at all, since a killed worker just respawns clean. The more effective play is to **hold memory pressure just under the kill threshold, push the box into swap, and let every other request on the machine crawl**.

## Disclosed Vulnerabilities + Fix Status

| Server | Disclosed | Status | CVE / Fix |
|--------|-----------|--------|-----------|
| nginx | April 2026 | **Fixed in 1.29.8** — added `max_headers` directive (default 1000), imported from freenginx | commit `365694160a` |
| Apache httpd | May 27, 2026 | **Fixed same day** by Stefan Eissing — `cookie` now counts against `LimitRequestFields`. Fix in mod_http2 v2.0.41 (not yet in 2.4.x) | **CVE-2026-49975** |
| Microsoft IIS | notified | **No patch** | Disable HTTP/2 or front with header-count cap |
| Envoy | notified | **Patches released** (GHSA-22m2-hvr2-xqc8), being validated | June 3, 2026 |
| Cloudflare Pingora | notified | **No patch** | Disable HTTP/2 or front with header-count cap |

## Mitigations

**nginx**: Upgrade to 1.29.8+ (adds `max_headers` directive with default 1000). Fallback: `http2 off;`.

**Apache httpd**: mod_http2 v2.0.41 (not in 2.4.x release yet). Fallback: `Protocols http/1.1`. `LimitRequestFieldSize` shrinks blast radius but is partial — only `LimitRequestFields` against `cookie` crumbs would help (but it currently doesn't count them).

**Microsoft IIS, Envoy, Cloudflare Pingora**: Disable HTTP/2 or front the server with a hard cap on header count per request.

**Generally**: cap the **decoded header size** AND the **header field count**, AND consider HPACK dynamic-table-size limits.

## Historical Context

- **CVE-2016-6581** (2016): Cory Benfield coins "HPACK Bomb"
- **CVE-2025-53020** (2025): Gal Bar Nahum hits ~4000x amplification against Apache httpd
- **CVE-2016-8740**: unbounded CONTINUATION frames
- **CVE-2016-1546**: worker-thread starvation in Apache httpd

## Significance: AI as Vulnerability Discoverer

This is one of the first major public security disclosures where **the attack chain was discovered by an AI coding model (Codex)** rather than by human researchers. The fix commits in nginx/Apache were public; Codex turned those diffs into a working exploit that revealed Microsoft IIS, Envoy, and Pingora were also vulnerable. The disclosure states explicitly: "any capable AI model can turn those diffs into a working exploit."

This signals a regime change: the commit-to-exploit window has compressed from weeks (human reverse engineering) to minutes (AI-driven), forcing vendors to ship coordinated fixes simultaneously or risk zero-day exposure.
