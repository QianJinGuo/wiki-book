---
title: "Cloudflare Turnstile requiring fingerprintable WebGL"
source_url: https://hacktivis.me/articles/cloudflare-turnstile-webgl-fingerprinting
source: newsletter
created: 2026-06-01
updated: 2026-06-01
type: article
tags: [newsletter, article]
sha256: 92a43f69622b0bca
---

# Cloudflare Turnstile requiring fingerprintable WebGL


Published Time: Sun, 31 May 2026 00:34:51 GMT

Markdown Content:
Since about a week, Cloudflare Turnstile (their "Verify you're human" device verification) has been looping indefinitely in my [webkit-gtk based browser](https://hacktivis.me/projects/badwolf). Preventing access to quite few websites ([previously](https://hacktivis.me/articles/blocking%20cloudflare%20IP-range%20be%20like), but it even went worse lately). 

 Turns out it's because Cloudflare wants to have a fingerprint of your device via WebGL, the only reason for doing this would be tracking.

![Image 1](https://hacktivis.me/images/cloudflare-webgl-fingerprinting.png?serial=2026053100)

Screenshot of [Turnstile test page](https://browser-compat.turnstile.workers.dev/), "WebGL renderer info is spoofed"

Their pro-tracking non-justification copied here just in case:

> Turnstile uses browser fingerprinting to verify you're human. Privacy tools that block or randomize fingerprinting make your browser look like a bot trying to hide its identity. Temporarily allowing fingerprinting for this site will fix the issue.

Such things are blocked in WebKit, and have been for years. Meaning it's tracking so awful that even Apple would block it, and as far as I can tell it's not the kind of privacy protection you can easily disable in it.

 So Cloudflare just **banned all WebKitGTK browsers** as I guess they put an exception for Safari.

As an aside, if you're wondering, Mozilla Firefox screwed up their WebGL fingerprinting protection: [Bugzilla#1916271: Gecko reveals sanitized GPU Characteristics; webkit and blink return hardcoded strings for all users](https://bugzilla.mozilla.org/show_bug.cgi?id=1916271)

![Image 2](https://hacktivis.me/images/cloudflare-webgl-fingerprinting-firefox-default.png?serial=2026053100)

Screenshot of Turnstile test page on Firefox 145.0 passing with no issues.

Plus `privacy.resistfingerprinting` isn't enabled even when selecting "Strict" "Enhanced Privacy Protection" in the settings, great job there Mozilla.

 But I guess with it enabled, privacy-conscious Firefox users might not be able to pass Cloudflare's device verification in the future.

![Image 3](https://hacktivis.me/images/cloudflare-webgl-fingerprinting-firefox-much-resist.png?serial=2026053100)

Screenshot of Turnstile test page on Firefox 145.0 passing with just "Canvas Randomization Detected"; after enabling `privacy.resistfingerprinting` manually.

