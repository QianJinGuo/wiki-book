---
source: newsletter
source_url: https://cybersecurityreach.org/investigations/ifyourevokethistokenitwillwipethecomputeroftheowner-shai-hulud-2026
title: "IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner"
sha256: b07a097a94bd9853f45581ba2273b431ad7bf3ed3c64df98f6dd85777ccdcc84
review_value: 8
review_confidence: 7
review_recommendation: worth-reading
review_stars: 3
ingested: 2026-05-14
---
Published Time: 2026-05-11T00:00:00.000Z
Markdown Content:
# IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner: Inside the New Shai-Hulud npm Worm | Investigation | Cybersecurity Reach Foundation
[Cybersecurity Reach Foundation](https://cybersecurityreach.org/)
*   [Home](https://cybersecurityreach.org/)
*   [About](https://cybersecurityreach.org/about)
*   [News](https://cybersecurityreach.org/news)
*   Resources
*   Free Tools
[Get Involved](https://cybersecurityreach.org/join)
[Back to Investigations](https://cybersecurityreach.org/investigations)
May 11, 2026/Malware Investigation
# IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner: Inside the New Shai-Hulud npm Worm
A new wave of the Shai-Hulud npm worm is loose. It hides inside developer packages, steals GitHub tokens, and uses a chilling sigil, IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner, to threaten anyone who tries to cut it off. Here is what it does and what to do about it.
![Image 1: Shai-Hulud: new npm worm variant. IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner — supply-chain threat alert from the Cybersecurity Reach Foundation.](https://cybersecurityreach.org/investigations/shai-hulud/hero.png)
## What we found
Three hours ago, a post on Hacker News pointed to a GitHub issue where developers were raising concerns about a possible breach in a popular npm package. We followed the thread, isolated the suspicious release, pulled the payload ourselves, and tore it apart. Stripped of three layers of obfuscation (an obfuscator.io string array, a custom PBKDF2 + permutation cipher, and an AES-256-GCM blob wrapper), the malware turned out to be a new variant of **Shai-Hulud**, the self-spreading npm worm family that first made headlines in 2025.
The new variant carries a sigil string that is also a threat: **`IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner`**. Victims, defenders, and journalists alike are meant to see it and hesitate before clicking "revoke".
* * *
## Who was targeted: the TanStack ecosystem
This wave specifically targeted **TanStack** maintainers and the packages they publish to npm. The dropper's internal package list, hardcoded into the obfuscated payload, covers nearly the entire TanStack router and start ecosystem across React, Vue, and Solid:
*   •`@tanstack/router-utils`, `@tanstack/router-cli`, `@tanstack/router-plugin`, `@tanstack/router-core`, `@tanstack/router-generator`, `@tanstack/router-devtools`, `@tanstack/router-ssr-query-core`
*   •`@tanstack/react-start`, `@tanstack/react-start-server`, `@tanstack/react-start-rsc`, `@tanstack/react-router-devtools`
*   •`@tanstack/vue-router`, `@tanstack/vue-router-devtools`, `@tanstack/vue-start`, `@tanstack/vue-start-client`, `@tanstack/vue-start-server`
*   •`@tanstack/solid-router-devtools`, `@tanstack/solid-router-ssr-query`, `@tanstack/solid-start-client`, `@tanstack/solid-start-server`
*   •`@tanstack/start-client-core`, `@tanstack/start-server-core`, `@tanstack/start-plugin-core`, `@tanstack/start-fn-stubs`, `@tanstack/start-static-server-functions`
*   •`@tanstack/history`, `@tanstack/virtual-file-routes`, `@tanstack/nitro-v2-vite-plugin`, `@tanstack/arktype-adapter`, `@tanstack/valibot-adapter`
The malicious tarballs have since been deprecated and npm security has been engaged to pull them from the registry. Two things to keep distinct:
*   •**How the attacker got into TanStack's release pipeline** was, per their post-mortem, a `pull_request_target` "Pwn Request" combined with GitHub Actions cache poisoning and runtime extraction of an OIDC token from the runner process. **No TanStack npm tokens were stolen** and the npm publish workflow itself was not compromised. That part is specific to this incident.
*   •**What the payload then does on every install host** is broader and is also documented in TanStack's post-mortem: it harvests credentials from AWS IMDS / Secrets Manager, GCP metadata, Kubernetes service-account tokens, Vault tokens, `~/.npmrc`, GitHub tokens, SSH private keys, exfiltrates over the Session/Oxen messenger network (so there is no attacker-controlled C2 to block by domain or IP, only the Session seed nodes), and **self-propagates by enumerating any other npm packages the victim maintains via the registry's `maintainer:<user>` search and republishing them with the same injection**.
So while no TanStack maintainer's credentials were stolen, anyone _else_ whose machine pulled a poisoned `@tanstack/*` version during the active window must assume their npm maintainer tokens and the other credentials listed above are compromised, and that any packages _they_ maintain may themselves have been republished with the same payload.
If your project depends on any of the packages above (directly or transitively, e.g. `npm ls @tanstack/history` and friends), pin to a version published well before this incident, purge `node_modules` and your lockfiles, clear your npm cache, and rebuild. Treat any developer machine or CI runner that installed an affected version during the active window as compromised.
* * *
## TanStack's post-mortem: how the attacker got in
TanStack has since published [a post-mortem of the incident](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem). Their findings:
> On **2026-05-11 between 19:20 and 19:26 UTC**, an attacker published **84 malicious versions across 42 `@tanstack/*` npm packages** by combining: the `pull_request_target` "Pwn Request" pattern, GitHub Actions cache poisoning across the fork ↔ base trust boundary, and runtime memory extraction of an OIDC token from the GitHub Actions runner process. **No npm tokens were stolen** and the npm publish workflow itself was not compromised.
> 
> 
> The malicious versions were detected publicly within 20 minutes by an external researcher (**ashishkurmi**, working for **StepSecurity**). All affected versions have been deprecated; npm security has been engaged to pull tarballs from the registry. We have no evidence of npm credentials being stolen, but we strongly recommend that anyone who installed an affected version on 2026-05-11 rotate **AWS, GCP, Kubernetes, Vault, GitHub, npm, and SSH** credentials reachable from the install host.
A few things to highlight from that post-mortem, because they matter for defenders:
*   •**The active window was tight — about 6 minutes of publishing, ~20 minutes until public detection.** If your CI ran a fresh `npm install` against `@tanstack/*` anywhere in that ~26-minute window on May 11, assume exposure.
*   •**The entry point was `pull_request_target` + Actions cache poisoning**, not a stolen maintainer credential. This is the same class of issue that has been hitting other major OSS projects over the past year — a fork's PR was able to influence what ran inside a trusted workflow run.
*   •**The OIDC token was lifted at runtime out of the Runner.Worker process memory** — matching the `/proc/<pid>/mem` capability we observed in the payload. The signing/publish workflow itself was not directly subverted; the attacker rode in on a token the workflow legitimately requested.
*   •**No npm tokens were stolen, per TanStack**, but they (and we) still recommend rotating AWS, GCP, Kubernetes, Vault, GitHub, npm, and SSH credentials reachable from any host that installed an affected version. Token theft is not the only thing the payload does — the secret-scrape and `gh-token-monitor` persistence steps still ran on every install host.
* * *
## What the malware actually does
When a trojanised package is installed, or when a malicious repository is opened in VS Code or Claude Code, the dropper performs the following steps:
*   •**Downloads the Bun runtime** to a temp directory if Bun is not already on the system, then runs its real entry script under Bun. This avoids needing Node-native modules and bypasses some EDR rules.
*   •**Steals secrets from the host.** It scans environment variables, `.npmrc`, `.git-credentials`, browser session stores, cloud CLI configs, and on Linux it dumps the memory of `Runner.Worker` (the GitHub Actions runner process) via `/proc/<pid>/mem` to lift in-flight OIDC tokens.
*   •**Encrypts the loot** with a hybrid scheme: a fresh 32-byte AES-256-GCM key encrypts the data, then RSA-OAEP-SHA-256 (4096-bit) wraps that key to the operator's public key. The encryption itself is cryptographically clean, so defenders cannot read the dumps without the operator's private key.
*   •**Publishes the encrypted dumps as public GitHub repositories** under the victim's own account, with themed names like `tleilaxu-lasgun-263` and the description "Shai-Hulud: Here We Go Again".
*   •**Plants persistence**: a Claude Code `SessionStart` hook, a VS Code `tasks.json` with `runOn: folderOpen`, a malicious `CodeQL Analysis` GitHub Actions workflow that exfiltrates `${{ toJSON(secrets) }}` to **`api.masscan.cloud/v2/upload`**, and a launchd / systemd-user unit called `gh-token-monitor` that acts as a dead-man's switch (executing `rm -rf ~/` if tokens are revoked).
* * *
## The "IfYouRevoke…" trick
The sigil is not just intimidation theatre. It is also a **dead-drop marker** for a peer-to-peer credential relay.
After the worm steals a GitHub token, it makes one commit whose message starts with the literal string `IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner:` followed by a base64-encoded copy of the stolen token. Other infected machines run a GitHub commit search for that exact phrase:
```
https://api.github.com/search/commits?q=IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner&sort=author-date&order=desc&per_page=50
```
That single public search query is the channel by which infected hosts hand each other working GitHub tokens. No private C2 server, no DNS tunnel, just GitHub's own search index acting as the bulletin board. Every other dump commit is made under the victim's real identity and uses the bland message `"Add files."` to blend in.
The dead-man's-switch component (`gh-token-monitor`) is what gives the sigil its threat. If the stolen token stops working, for example because the victim revoked it, the local agent executes `rm -rf ~/` to destroy the user's entire home directory. **Treat token revocation as a step that comes AFTER you remove the persistence units, not before.**
## Technical Analysis: Decoding the Destructive Payload
Through reverse engineering of the malware's obfuscated code, we determined the exact destructive command executed when a token is revoked. The process required decoding multiple layers of obfuscation:
**Layer 2 Analysis - "Beautify" Cipher:** The `gh-token-monitor` installation function calls `beautify("ADRi1gbXHb1p4MrDH3ro0rpoTHzu")` to generate the handler script. The beautify function implements a custom PBKDF2 + permutation stream cipher with these parameters:
```
masterKey = PBKDF2("0c0e873033875f1bc471eda37e3b9d0f9b89bd41a4bbb4f86746caa2176c40aa",
                   salt="svksjrhjkcejg",
                   iterations=200000,
                   keyLen=32,
                   prf=sha256)
```
For each ciphertext byte at index i, the algorithm:
1.   •Derives a per-byte seed: `SHA256(subKey || ascii(str(i)))`
2.   •Uses the seed to generate a Fisher-Yates permutation of 0-255
3.   •Applies the inverse permutation to decrypt the byte
**The Destructive Command:** When decoded, the handler string `"ADRi1gbXHb1p4MrDH3ro0rpoTHzu"` reveals:
```
rm -rf ~/
```
This command **recursively force-deletes the user's entire home directory**, destroying all personal files, SSH keys, development projects, browser profiles, and application configurations. The threat is not psychological intimidation—it is operational and devastating.
**Execution Flow:**
1.   •`gh-token-monitor` polls `https://api.github.com/user` every 60 seconds
2.   •On 4xx response (token revoked), executes: `eval "rm -rf ~/"`
3.   •User's home directory is completely destroyed
4.   •Service exits after 24-hour TTL or successful execution
* * *
## A live infection we captured
While researching the payload, we found an active infection on a real GitHub account. A seed repository was created on the account, and shortly afterwards a large batch of new public repositories appeared under the same user, each one carrying an encrypted dump capsule and the "Shai-Hulud: Here We Go Again" description.
The seed commit was authored under a spoofed identity meant to look legitimate, and its commit message contained the sigil plus a base64-wrapped `gho_*` GitHub OAuth token. Every subsequent data-dump commit was authored under the victim's real identity with the bland message `"Add files."`. We are not naming the compromised account here. We will send what we have to the relevant authorities. We are not republishing the tokens or the encrypted capsules.
* * *
## What developers and defenders should do
*   •**Do not open untrusted repositories in VS Code or Claude Code with auto-tasks enabled.** The worm relies on `tasks.json` with `runOn: folderOpen` and on Claude Code `SessionStart` hooks to fire the moment you open the folder. Disable automatic task execution and review hook directories before opening anything you do not trust.
*   •**Audit your machine for `gh-token-monitor`** under `~/Library/LaunchAgents` (macOS), `~/.config/systemd/user` (Linux), or scheduled tasks (Windows). **Remove the persistence units before you revoke any tokens.** The unit is the dead-man's switch that executes `rm -rf ~/` if it detects token revocation.
*   •**Then rotate every GitHub token** that touched the host, server-side via [github.com/settings/tokens](https://github.com/settings/tokens) and your organisation's SSO. Treat any token that ever lived on an infected host as compromised, even if it "looks fine".
*   •**Block egress to `api.masscan.cloud`** at your firewall. It is the hardcoded exfiltration endpoint for the malicious `CodeQL Analysis` workflow variant.
*   •**Search your org's repos for the disguised workflow.** Any `.github/workflows/*.yml` whose job echoes `${{ toJSON(secrets) }}` to a file and then `curl`s it out is the payload, regardless of the workflow's display name.
*   •**Search your account for repositories you did not create**, especially with the description "Shai-Hulud: Here We Go Again" or themed three-word names like `tleilaxu-lasgun-263`. Delete them and report the incident to GitHub.
*   •**Report sightings to GitHub Trust & Safety** at [support.github.com/contact/report-abuse](https://support.github.com/contact/report-abuse). If you find an active infection on someone else's account, report it. Do not engage with the operator.
* * *
## Why this matters
Shai-Hulud is no longer a one-off npm package compromise. It is now a self-propagating worm with a clever trick: it turns GitHub itself into both its data exfil channel and its peer-to-peer command bus, then leaves behind a destructive switch (`rm -rf ~/`) designed to discourage clean-up.
The sigil, `IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner`, is meant to make you freeze—and the threat is real (`rm -rf ~/`). Don't freeze. Remove the persistence units first, then revoke. Tell other developers. Block the C2 domain. And if you find the sigil in a commit on an account you control or follow, report it.
* * *
## Indicators of Compromise (IOCs)
Add these to your EDR, SIEM, firewall, and repo-scanning rules. Anything tagged `network` should be blocked outright; anything tagged `host` should trigger an alert and a forensic snapshot.
**Network**
*   •`api.masscan.cloud` — hardcoded exfiltration endpoint (`https://api.masscan.cloud/v2/upload`) used by the malicious `CodeQL Analysis` workflow component. Block at egress.
*   •**Session / Oxen messenger network** — primary exfil channel for credentials harvested by the install-time payload. Block at egress from developer and CI hosts that have no legitimate use for Session: `filev2.getsession.org`, `seed1.getsession.org`, `seed2.getsession.org`, `seed3.getsession.org`. Note that traffic is end-to-end encrypted with no attacker-controlled C2 — IP/domain block at egress is the only network-level mitigation.
*   •npm registry calls of the form `https://registry.npmjs.org/-/v1/search?text=maintainer:<username>` from a host that isn't actively browsing the registry — used by the worm to enumerate the victim's other packages for self-propagation.
*   •Outbound `POST` traffic from GitHub Actions runners carrying a JSON body to any non-allow-listed host immediately after a workflow named `CodeQL Analysis` runs.
*   •Outbound traffic to `github.com/oven-sh/bun/releases/download/` from systems that do not normally use Bun (the dropper pins version `bun-v1.3.13`).
**GitHub / source-control**
*   •Commit messages containing the exact string `IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner`.
*   •Repositories with the description `Shai-Hulud: Here We Go Again`.
*   •Repository names matching themed three-word patterns drawn from Dune lore, e.g. `tleilaxu-lasgun-263`, `fremen-crysknife-###`, `harkonnen-*-###`.
*   •Commits authored as `claude <claude@users.noreply.github.com>` on repos where no AI-assisted commits are expected.
*   •Bursts of `"Add files."` or `"Initial commit"` commits creating dozens of new public repos under a single user in a short window.
*   •`.github/workflows/*.yml` files whose body contains `toJSON(secrets)` written to a file and then `curl`ed out, **regardless of the workflow's display name**.
*   •Workflow files using pinned-by-SHA actions `actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd` or `actions/upload-artifact@bbbca2ddaa5d8feaa63e36b76fdaad77386f024f` in combination with a step that echoes `$VARIABLE_STORE` or similar.
**Host artifacts**
*   •File `tanstack_runner.js` in any package, repo, or temp directory.
*   •Persistence unit named `gh-token-monitor` under `~/Library/LaunchAgents/` (macOS), `~/.config/systemd/user/` (Linux), or as a Scheduled Task (Windows).
*   •Claude Code `SessionStart` hooks pointing at unexpected scripts under `~/.claude/`.
*   •VS Code `tasks.json` files containing `"runOn": "folderOpen"` with a shell command that fetches or runs a remote payload.
*   •Python processes reading `/proc/<pid>/mem` of `Runner.Worker` on Linux GitHub Actions runners.
*   •`bun` binaries appearing in `$TMPDIR` / `/tmp/bun-dl-*/` directories on systems that don't ship Bun.
**Cryptographic / payload fingerprints**
*   •Operator RSA-4096 public-key SHA-256 fingerprints observed in the captured payloads:
    *   •`166be2b7b58a440f7b17520ffb0368be5d89c76661704b4945417eb04b9ada65`
    *   •`bf9370f22dc04ee80d4ab8f9a2adc7a900cb39d94c89f64ab3f3726589eac713`
*   •Layer-2 cipher parameters baked into the dropper (useful for YARA-style content matching): PBKDF2 password `0c0e873033875f1bc471eda37e3b9d0f9b89bd41a4bbb4f86746caa2176c40aa`, salt `svksjrhjkcejg`, 200000 iterations.
*   •JSON envelope files of the shape `{ "envelope": "<b64>", "key": "<b64 ~684 chars>" }` showing up in unexpected repos.
* * *
_Published May 11, 2026 by the Cybersecurity Reach Foundation. We do not link to suspected malicious domains directly. Evidence has been preserved and will be sent to the relevant authorities._
_Disclosure: AI tooling was used to assist with the reverse-engineering, payload de-obfuscation, and drafting of this report so that we could publish rapidly while the threat is active. Every technical detail — the package list, the sigil, the C2 endpoint, the IOCs, and the behaviour of each persistence component — was verified by our team against the actual payload before publication._
### Stay Protected
Share this report with your developer friends. Supply-chain worms spread fastest where awareness is lowest.
[Explore Our Tools](https://cybersecurityreach.org/tools)[Support Our Work](https://cybersecurityreach.org/donate)
[← Back to All Investigations](https://cybersecurityreach.org/investigations)
## Cybersecurity
Reach
Foundation
501(c)(3) Nonprofit
Cybersecurity Reach Foundation is a registered 501(c)(3) nonprofit. Questions, partnerships, or press inquiries? Reach us at[info@cybersecurityreach.org](mailto:info@cybersecurityreach.org).
*   [Home](https://cybersecurityreach.org/)
*   [About](https://cybersecurityreach.org/about)
*   [Privacy Policy](https://cybersecurityreach.org/privacypolicy)
*   [Contact](mailto:info@cybersecurityreach.org)
© 2026 Cybersecurity Reach Foundation. All rights reserved.