---
source: newsletter
source_url: https://www.vincentschmalbach.com/claude-code-china-router-fingerprint/
ingested: 2026-07-02
type: raw
tags: [anthropic, claude-code, security, fingerprinting, api-routing, china, privacy]
sha256: 6787822cf5740891ee964f76277f7fad2b011983bb49b0645a46cfb393682fca
---

Title: Claude Code Is Quietly Fingerprinting China-Linked API Routers

URL Source: https://www.vincentschmalbach.com/claude-code-china-router-fingerprint/

Published Time: 2026-06-30T11:06:42+00:00

Markdown Content:
Categories

June 30, 2026

Claude Code has a hidden test for where your requests are going.

The trigger is `ANTHROPIC_BASE_URL`, the environment variable people use when they want Claude Code to talk to a custom endpoint instead of Anthropic's default API. That endpoint might be a corporate gateway, a local proxy, an OpenAI-compatible router, a reseller API, or one of the unofficial Claude access layers that keep appearing around China.

When the endpoint is the normal `api.anthropic.com`, Claude Code leaves the date line alone. When the endpoint is something else, Claude Code checks the hostname against a hidden list, checks the local timezone, and then changes one boring line in the model context:

`Today's date is 2026-06-30.`
The date itself is not the point. But this is where the marker hides. Claude Code fingerprints custom API routing inside model context.

In [`@anthropic-ai/claude-code@2.1.90`](https://registry.npmjs.org/@anthropic-ai/claude-code/-/claude-code-2.1.90.tgz), the relevant context value was just a date string:

`currentDate:`Today's date is ${Qr6()}.``
In [`@anthropic-ai/claude-code@2.1.91`](https://registry.npmjs.org/@anthropic-ai/claude-code/-/claude-code-2.1.91.tgz), that changed:

`currentDate:fM4(Mo6())`
That helper reads `process.env.ANTHROPIC_BASE_URL`. If the variable is missing, or if it points to `api.anthropic.com`, it returns the ordinary date line. If the base URL points somewhere else, Claude Code starts classifying the route.

The behavior remained in `2.1.92`. It is also still present in the current npm release I checked on June 30, 2026. The top-level [`@anthropic-ai/claude-code@2.1.196`](https://registry.npmjs.org/@anthropic-ai/claude-code/-/claude-code-2.1.196.tgz) package is now a small wrapper, but the Linux x64 package still contains the same structure in an embedded JavaScript chunk:

`currentDate:Ola(FSe())`
The function names changed because the bundle is minified. The behavior did not.

The helper decodes two embedded lists. The encoding is base64 plus XOR `91`, which is not serious encryption. It is just enough to keep the list from appearing as plain text in a casual string search.

The first list has 147 domain entries. It begins with `cn`, then runs through major China-linked internet and cloud domains:

```
cn
sankuai.com
netease.com
163.com
baidu.com
alibaba-inc.com
alipay.com
antgroup-inc.cn
kuaishou.com
bytedance.net
xiaohongshu.com
jd.com
jdcloud.com
bilibili.co
iflytek.com
stepfun-inc.com
aliyuncs.com
cn-shanghai.fcapp.run
cn-beijing.fcapp.run
```

The same decoded list continues into Claude-router and Claude-proxy-looking domains:

```
anyrouter.top
claude-code-hub.app
claude-opus.top
claudeide.net
deeprouter.top
openclaude.me
proxyai.com
yunwu.ai
yunwu.zeabur.app
zenmux.ai
```

The keyword list is shorter:

`deepseek, moonshot, minimax, xaminim, zhipu, bigmodel, baichuan, stepfun, 01ai, dashscope, volces`
Those are not neutral product analytics terms. They point toward Chinese model providers, Chinese AI infrastructure, and alternate routing layers.

The helper also checks whether the local timezone is `Asia/Shanghai` or `Asia/Urumqi`.

That combination is the important part: custom base URL, China-linked domain list, Chinese AI-provider keywords, and mainland China timezone.

## How the marker works

For non-default base URLs, Claude Code changes the apostrophe in `Today's`.

If the host is not in the domain list and has no keyword match, it uses the normal ASCII apostrophe: `'`.

If the host is in the domain list, it uses `’`.

If the host is not in the domain list but contains one of the keywords, it uses `ʼ`.

If the host matches both the domain list and the keyword list, it uses `ʹ`.

Then it adds a timezone bit. Outside the China timezones, the date stays `YYYY-MM-DD`. In `Asia/Shanghai` or `Asia/Urumqi`, the date becomes `YYYY/MM/DD`.

Here is what the helper produces in a local static reproduction:

```
{"baseUrl":null,"timezone":"Europe/Berlin","text":"Today's date is 2026-06-30."}
{"baseUrl":"https://api.anthropic.com","timezone":"Europe/Berlin","text":"Today's date is 2026-06-30."}
{"baseUrl":"https://proxyai.com","timezone":"Europe/Berlin","text":"Today’s date is 2026-06-30."}
{"baseUrl":"https://api.deepseek.com","timezone":"Europe/Berlin","text":"Todayʼs date is 2026-06-30."}
{"baseUrl":"https://deepseek.cn","timezone":"Asia/Shanghai","text":"Todayʹs date is 2026/06/30."}
```

To a human, those lines are easy to miss. To the model request, they are different bytes.

## This is not direct VPN detection

The helper I inspected does not look up a public IP address. It does not inspect network interfaces. It does not list VPN processes. It does not ask the operating system whether a VPN is running.

The inputs I found are `ANTHROPIC_BASE_URL` and local timezone.

That matters. If you are connected to a VPN but still using the normal Anthropic endpoint, this code path does not prove you are marked. If you configure Claude Code to use a custom endpoint, proxy, router, reseller API, or region-specific gateway through `ANTHROPIC_BASE_URL`, this code path is directly relevant.

That is why this is bigger than a date formatting quirk. `ANTHROPIC_BASE_URL` is the setting people use for corporate gateways, third-party routers, OpenAI-compatible Claude proxies, and unofficial access layers. The decoded list is full of China-linked domains, Chinese AI-provider keywords, and Claude/API-router-looking endpoints.

## This is not normal telemetry

Normal telemetry has a name, a schema, and some policy surface. This does not look like that.

The routing signal is hidden inside model context. It is not a visible Claude Code warning. It is not a setting called "router detection." It is not a normal analytics event.

If a third-party router receives the prompt, the router can see the marker. If that router forwards the full prompt upstream, Anthropic can see it too. I did not capture live traffic in this pass, so I am not claiming that every custom endpoint forwards the marker to Anthropic. The forwarding behavior depends on the router.

The local mechanism is still enough to establish the trust problem. Claude Code builds a prompt-level fingerprint when the user configures a non-default API route.

## The fair argument for Anthropic

Anthropic has real reasons to care about unofficial Claude routers.

There are shadow API sellers, account pools, subscription resale setups, proxy services, and region-bypass markets selling access to models in ways providers may not authorize. Some of those routes may be used for fraud, account-limit evasion, model distillation, or access from regions where the product is not officially available.

Anthropic can reasonably try to detect and stop that.

But this implementation is not transparent.

If Anthropic wants to block unsupported routers, it can block unsupported routers. If it wants to detect abuse, it can document the category of detection. If it wants to watermark model context for investigations, it can say that prompts may include routing metadata.

What it should not do is make a line of model context look semantically neutral while punctuation carries routing metadata.

The Reddit post was right about the mechanism and too broad about the label. I would not call this proven spyware. I would call it covert route fingerprinting.

Claude Code is using a date line in model context to mark custom API routing, and the classifier is heavily China/proxy/router oriented.

That deserves an explanation from Anthropic.

[![Image 1: Vroni](https://www.vincentschmalbach.com/wp-content/themes/vincent/assets/vroni/logo-full.svg)What I'm building ## Delegate tasks. Get software. Give Vroni a GitHub issue, bug report, spec, or rough idea. It reads the repo, plans the change, writes code, runs checks, and works toward a review-ready pull request. Take a look at vroni.com](https://www.vroni.com/?utm_source=vincentschmalbach.com&utm_medium=blog&utm_campaign=blog_post_vroni&utm_content=after_post_card)
I respect your privacy. Unsubscribe at any time.

