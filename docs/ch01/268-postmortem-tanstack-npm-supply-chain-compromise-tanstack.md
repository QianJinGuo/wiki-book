# Postmortem: TanStack npm supply-chain compromise | TanStack Blog

## Ch01.268 Postmortem: TanStack npm supply-chain compromise | TanStack Blog

> 📊 Level ⭐⭐ | 24.3KB | `entities/npm-supply-chain-compromise-postmortem.md`

# "Postmortem: TanStack npm supply-chain compromise | TanStack Blog"
URL Source: https://tanstack.com/blog/npm-supply-chain-compromise-postmortem

## TL;DR
On 2026-05-11 between 19:20 and 19:26 UTC, an attacker published 84 malicious versions across 42 @tanstack/* npm packages by combining: the pull_request_target "Pwn Request" pattern, GitHub Actions cache poisoning across the fork↔base trust boundary, and runtime memory extraction of an OIDC token from the GitHub Actions runner process. No npm tokens were stolen and the npm publish workflow itself was not compromised.
The malicious versions were detected publicly within 20 minutes by an external researcher ashishkurmi working for stepsecurity. All affected versions have been deprecated; npm security has been engaged to pull tarballs from the registry. We have no evidence of npm credentials being stolen, but we strongly recommend that anyone who installed an affected version on 2026-05-11 rotate AWS, GCP, Kubernetes, Vault, GitHub, npm, and SSH credentials reachable from the install host.
**Tracking issue:** [TanStack/router#7383](https://github.com/TanStack/router/issues/7383) **GitHub Security Advisory:** [GHSA-g7cv-rxg3-hmpx](https://github.com/TanStack/router/security/advisories/GHSA-g7cv-rxg3-hmpx)

## Impact
### Packages affected
42 packages, 84 versions (two per package, published roughly 6 minutes apart). See the tracking issue for the full table. Confirmed-clean families: @tanstack/query*, @tanstack/table*, @tanstack/form*, @tanstack/virtual*, @tanstack/store, @tanstack/start (the meta-package, not @tanstack/start-*).

### What the malware does
When a developer or CI environment runs npm install, pnpm install, or yarn install against any affected version, npm resolves the malicious optionalDependencies entry, fetches the orphan payload commit from the fork network, runs its prepare lifecycle script, and executes a ~2.3 MB obfuscated router_init.js smuggled into the affected tarball. The script:

* Harvests credentials from common locations: AWS IMDS / Secrets Manager, GCP metadata, Kubernetes service-account tokens, Vault tokens, ~/.npmrc, GitHub tokens (env, gh CLI, .git-credentials), SSH private keys
* Exfiltrates over the Session/Oxen messenger file-upload network (filev2.getsession.org, seed{1,2,3}.getsession.org) — end-to-end encrypted with no attacker-controlled C2, so blocking by IP/domain is the only network mitigation
* Self-propagates: enumerates other packages the victim maintains via registry.npmjs.org/-/v1/search?text=maintainer:<user> and republishes them with the same injection
Because the payload runs as part of npm install's lifecycle, anyone who installed an affected version on 2026-05-11 must treat the install host as potentially compromised.
---

## Timeline
All times UTC. Local timestamps from GitHub API and npm registry.

### Pre-attack (cache poisoning phase)
| Time | Event |
| --- | --- |
| 2026-05-10 17:16 | Attacker creates fork [github.com/zblgg/configuration](https://github.com/zblgg/configuration) (a fork of TanStack/router, deliberately renamed to evade fork-list searches) |
| 2026-05-10 23:29 | Malicious commit 65bf499d16a5e8d25ba95d69ec9790a6dd4a1f14 authored on the fork by fabricated identity claude <claude@users.noreply.github.com>. Adds packages/history/vite_setup.mjs (a ~30,000-line bundled JS payload). Commit message prefixed with [skip ci] to suppress CI on the push event |
| 2026-05-11 ~10:49 | PR #7378 opened against TanStack/router#main titled "WIP: simplify history build" by zblgg |
| 2026-05-11 10:49 onwards | bundle-size.yml and labeler.yml (both pull_request_target) auto-run for the PR — no first-time-contributor approval required because pull_request_target bypasses that gate. pr.yml (which uses pull_request) does NOT run, blocked pending approval that never came |
| 2026-05-11 11:01–11:11 | Multiple force-pushes by zblgg to the PR head, each triggering more pull_request_target runs |
| 2026-05-11 11:11 | Force-push lands 65bf499d (the malicious commit) on the PR head. bundle-size.yml's benchmark-pr job checks out refs/pull/7378/merge, runs pnpm install + pnpm nx run @benchmarks/bundle-size:build — this executes vite_setup.mjs |
| 2026-05-11 11:29 | Cache entry Linux-pnpm-store-6f9233a50def742c09fde54f56553d6b449a535adf87d4083690539f49ae4da11 (1.1 GB) saved to GitHub Actions cache for TanStack/router, scope refs/heads/main — keyed to match what release.yml will look up on the next push to main |
| 2026-05-11 11:31 | Attacker force-pushes the PR back to current main HEAD (b1c061af), making the visible PR a 0-file no-op. PR closed and branch deleted in the same minute. Cache poison persists. |

### Detonation (publish phase)
| Time | Event |
| --- | --- |
| 2026-05-11 19:15 | Manuel merges PR #7369 (Shkumbin's CSS.supports fix) → push to main triggers release.yml. Workflow run 25613093674 starts (19:15:44), and fails. |
| 2026-05-11 19:20:39 | npm registry receives publish for @tanstack/history@1.161.9 and 41 sibling packages (~84 versions across 42 packages, but only ~half show this exact second; the remainder come during run #2). Publish is authenticated via OIDC trusted-publisher binding for TanStack/router release.yml@refs/heads/main — but it does not come from the workflow's defined Publish Packages step, which was skipped because tests failed. It comes from the malware running during the test/cleanup phase, which mints an OIDC token via the workflow's id-token: write permission and POSTs directly to registry.npmjs.org |
| 2026-05-11 19:20:47 | Run 25613093674 completes (status: failure) |
| 2026-05-11 19:16 | Manuel merges PR #7382 (jiti tsconfig paths fix) → second push to main triggers release.yml |
| 2026-05-11 19:16:22 | Workflow run 25691781302 starts. Same poisoned cache restored |
| 2026-05-11 19:26:14 | npm registry receives publish for the second-version-per-package set (@tanstack/history@1.161.12 etc.). Same OIDC mechanism |
| 2026-05-11 19:26:20 | Run 25691781302 completes (status: failure) |

### Detection and response
| Time | Event |
| --- | --- |
| 2026-05-11 ~19:50 | External researcher ashishkurmi working for StepSecurity opens issue #7383 with a complete writeup of the malicious optionalDependencies fingerprint and the package list (initially 14 of the 42) |
| 2026-05-11 ~19:50 | Researcher notifies npm security directly |
| 2026-05-11 ~20:00 | Manuel acknowledges in #7383 — incident response begins |
| 2026-05-11 ~20:10 | Manuel removes all other team push permissions on GitHub in case of user machines have been compromised |
| 2026-05-11 ~20:30 | Tanner emails security@npmjs.com with full IOC list and request to pull tarballs registry-side. Formal malware reports are submitted via npm |
| 2026-05-11 ~21:00 | Comprehensive scan of all 295 @tanstack/* packages confirms scope: 42 packages, 84 versions. Tanner begins npm deprecation process for all 84 affected packages. Public Twitter/X/LinkedIn/Bluesky disclosure from @tan_stack and maintainers |
| 2026-05-11 21:30 | Investigation identifies bundle-size.yml pull_request_target cache-poisoning vector and the zblgg/configuration fork. All cache entries for all TanStack/* GitHub repositories purged via API. Hardening PR merged: bundle-size.yml restructured, repository_owner guards added, third-party action refs pinned to SHAs. Official GitHub Security Advisory is published, CVE requested |
---

## Root cause
Three vulnerabilities chained together. Each is necessary for the attack; none alone is sufficient.

### 1. pull_request_target "Pwn Request" pattern in bundle-size.yml
bundle-size.yml ran pull_request_target for fork PRs and, inside that trigger context, checked out the fork's PR-merge ref and ran a build:
```yaml
on:
  pull_request_target:
    paths: ['packages/**', 'benchmarks/**']
jobs:
  benchmark-pr:
    steps:

      - uses: actions/checkout@v6.0.2
        with:
          ref: refs/pull/${{ github.event.pull_request.number }}/merge # fork's merged code

      - uses: TanStack/config/.github/setup@main # transitively calls actions/cache@v5
      - run: pnpm nx run @benchmarks/bundle-size:build # executes fork-controlled code
```
The author of the workflow attempted a trust split (the comment-pr job is separate from benchmark-pr, with a comment in the YAML noting the intent to keep benchmark-pr "untrusted with read-only permissions"). The split is correct in spirit but missed two facts:

* actions/cache@v5's post-job save is not gated by permissions:. Cache writes use a runner-internal token, not the workflow GITHUB_TOKEN. Setting permissions: contents: read does not block cache mutation.
* Cache scope is per-repo, shared across pull_request_target runs (which use the base repo's cache scope) and pushes to main. A PR running in the base repo's cache scope can poison entries that production workflows on main will later restore.

### 2. GitHub Actions cache poisoning across trust boundaries
The malicious vite_setup.mjs was specifically designed to write data into the pnpm-store directory under a key the legit release.yml workflow would compute and look up: Linux-pnpm-store-${hashFiles('**/pnpm-lock.yaml')}. When the benchmark-pr job ended, actions/cache@v5's post-step saved the (now-poisoned) pnpm store to that exact key. When release.yml next ran on a push to main, its Setup Tools step restored the poisoned entry — entirely as designed.
This is the class of attack documented by Adnan Khan in 2024. It's not a TanStack-specific bug; it's a known GitHub Actions design issue that requires conscious mitigation.

### 3. OIDC token extraction from runner memory
release.yml declares id-token: write (legitimately needed for npm OIDC trusted publishing). When the poisoned pnpm store is restored on the runner, attacker-controlled binaries are now on disk and get invoked during the build step. Those binaries:

* Locate the GitHub Actions Runner.Worker process via /proc/*/cmdline
* Read /proc/<pid>/maps and /proc/<pid>/mem to dump the worker's memory
* Extract the OIDC token (which the runner mints lazily, in memory, when id-token: write is set)
* Use the token to authenticate POST requests directly to registry.npmjs.org — bypassing the workflow's Publish Packages step entirely
This is the same memory-extraction technique (and verbatim Python script, with attribution comment) used in the tj-actions/changed-files compromise of March 2025. The attacker did not invent novel tradecraft; they recombined published research.

### Why none alone is enough
* pull_request_target alone is fine for trusted operations (labeling, comments)
* Cache poisoning alone (e.g., from inside an already-compromised dep) requires a separate publish vehicle
* OIDC token extraction alone requires existing code execution on the runner
The chain only works because each vulnerability bridges the trust boundary the others assumed: PR fork code crossing into base-repo cache, base-repo cache crossing into release-workflow runtime, and release-workflow runtime crossing into npm registry write access.
---

## Detection
### How we found out
Detection was external. External researcher ashishkurmi working for StepSecurity opened issue #7383 ~20 minutes after the publish, with full technical analysis. Tanner received a phone call from Socket.dev just moments after starting the war room confirming the situation.

### IOC fingerprints (for downstream maintainers and security tools)
In any @tanstack/* package's manifest:
```json
"optionalDependencies": {
  "@tanstack/setup": "github:tanstack/router#79ac49eedf774dd4b0cfa308722bc463cfe5885c"
}
```

* File: router_init.js (~2.3 MB, package root, not in "files")
* Cache key: Linux-pnpm-store-6f9233a50def742c09fde54f56553d6b449a535adf87d4083690539f49ae4da11
* 2nd-stage payload URLs: https://litter.catbox.moe/h8nc9u.js, https://litter.catbox.moe/7rrc6l.mjs
* Exfiltration network: filev2.getsession.org, seed{1,2,3}.getsession.org
* Forged commit identity: claude <claude@users.noreply.github.com> (note: not the real Anthropic Claude — fabricated GitHub no-reply email)
* Real attacker accounts: zblgg (id 127806521), voicproducoes (id 269549300)
* Attacker fork: [github.com/zblgg/configuration](https://github.com/zblgg/configuration) (fork of TanStack/router renamed to evade fork searches)
* Orphan payload commit (in fork network): 79ac49eedf774dd4b0cfa308722bc463cfe5885c
* Workflow runs that performed the malicious publishes: 
  * [github.com/TanStack/router/actions/runs/25613093674](https://github.com/TanStack/router/actions/runs/25613093674) (attempt 4)
  * [github.com/TanStack/router/actions/runs/25691781302](https://github.com/TanStack/router/actions/runs/25691781302)
---

## 深度分析
### 攻击链的工程复杂度
此次攻击并非依赖 0day，而是将三个已知技术组合成完整杀伤链：pull_request_target 信任边界穿越、Actions 缓存污染、运行时内存 OIDC token 提取。每个环节单独存在都不致命，但串联后形成完整攻击面。这体现了供应链攻击的工程化趋势——攻击者不再寻找单个漏洞，而是构建跨越多个信任边界的攻击路径。

### 信任边界的三重穿越
第一重：fork PR 代码通过 pull_request_target 触发器进入 base repo 的 Actions 运行上下文，获得与受信任工作流相同的缓存读写权限。第二重：被污染的缓存通过正常的 cache restore 机制注入到正式发布的 workflow 运行时，绕过代码审查。第三重：恶意二进制在发布 workflow 中运行，从 GitHub Runner 进程内存提取 OIDC token，直接向 npm registry 认证。三次边界穿越分别利用了 Actions 权限模型、缓存作用域共享、OIDC 动态 token 生成的设计特性。

### OIDC Trusted Publisher 的安全隐患
npm 的 OIDC Trusted Publisher 设计假设：只要 workflow 声明了 `id-token: write` 并通过 GitHub Actions 环境运行，任何代码路径都可以获取发布令牌。这意味着恶意代码一旦在拥有 OIDC 权限的 workflow 中执行，就可以绕过原定的 "Publish Packages" step，直接调用 npm API 完成发布。TanStack 的发布流程被设计为跳过（因为测试失败），但 malware 在 test/cleanup 阶段执行并自行完成发布。这是 OIDC Trusted Publisher 模式的设计盲点——权限下放到了 workflow 级别而非 step 级别。

### 自传播 payload 的想象空间
攻击 payload 包含自我传播逻辑：枚举受害者维护的其他 npm 包并用相同 injection 重新发布。如果受害者是某大型项目的维护者，其本地 credentials 和 SSH key 被盗后，malware 会尝试向其名下所有包注入恶意版本。这意味着攻击的受益不只是横向移动，而是纵深化——从单一机器扩展到整个 npm 发布权限链。

### 检测窗口的双面性
攻击在 20 分钟内被外部研究员发现，表面看是快速发现，但实际上有两个因素对防御方有利：一是攻击 payload 破坏了测试导致 publish step 跳过（使得攻击更显眼），二是攻击者使用了公开的 memory-dump 脚本（使得 IOC 匹配更快）。一个更谨慎的攻击者若保持安静，可能让恶意版本在 npm 上存活数小时甚至数天。外部检测依赖研究员主动性，而非组织内部能力——这是供应链安全的基本面弱点。
---

## 实践启示
### 对开源维护者的建议
1. **审计所有 pull_request_target 工作流**：检查是否在 fork PR 上下文中执行了构建、测试或任何代码执行。若是，立即重构为仅执行读取操作（ labeling、评论等），或迁移到 GitHub App 认证模式。
2. **隔离 cache 作用域**：pull_request_target 触发的工作流不应与 main/trunk 触发的工作流共享缓存命名空间。可使用唯一前缀或完全禁用该 workflow 的缓存写入。
3. **固定第三方 Action SHA**：不使用 `@main`、`@v6.0.2` 等浮动引用，将所有第三方 Action 锁定到具体 commit SHA。这防止供应链攻击通过 Action 更新的间接路径入侵。
4. **OIDC Trusted Publisher 权限最小化**：在 workflow 级别声明 `id-token: write` 意味着所有代码路径都可获取发布 token。若流程中有不可信代码段（构建、测试、lint），考虑迁移到 classic token + manual approval 模式，或使用 npm provenance 的源代码级验证。
5. **监控自己的发布行为**：TanStack 此次被外部研究员先于内部发现，暴露了发布监控缺失。建议对 npm scope 配置主动监控（版本发布、异常文件变更、异常发布时间），缩短发现周期。

### 对安全团队的建议
1. **建立供应链安全基线**：针对 GitHub Actions 权限模型、npm OIDC Trusted Publisher 限制、缓存污染风险制定安全基线，纳入 CI/CD 审计范围。
2. **关注 fork 网络中的恶意 commit**：攻击者使用 fork 而非直接推送，利用了维护者不会审查 fork 网络的盲点。在代码审查流程中增加对 fork 来源的特殊标记和额外审查。
3. **准备 incident response 手册**：明确当 npm 包被恶意发布时的响应步骤——包括快速贬值流程、tarball 清理请求、与 npm安全的联络渠道。npm 的 "no unpublish if dependents exist" 政策意味着需要依赖 registry 端清理，响应手册需提前纳入此延迟风险。
4. **rotated 所有暴露的 credentials**：所有在 2026-05-11 安装过受影响版本的机器，应立即 rotated 来自该主机的所有 credentials（AWS、GCP、K8s、Vault、GitHub、npm、SSH）。malware 的自传播逻辑意味着受害者的发布权限本身也成为攻击向量。
---

## Lessons learned
### What went well
* External researchers noticed and reported with full technical detail within ~20 min of the incident
* Maintainer team coordinated immediately and effectively across many timezones
* The detection community already had a clear public IOC pattern within hours

### What could have been better
* No internal alerting. We learned about the compromise from a third party. We need monitoring on our own publishes. We'll be working closely with security researcher firms in the ecosystem that have the ability to detect these issues very quickly, potentially even in-house, and making the feedback loop even tighter.
* pull_request_target workflows had not been audited despite being a long-known dangerous pattern
* Floating refs (@v6.0.2, @main) on third-party actions create standing supply-chain risk independent of this incident
* Unpublish was unavailable for nearly all affected packages because of npm's "no unpublish if dependents exist" policy. We have to rely on npm security to pull tarballs server-side, which adds hours of delay during which malicious tarballs remain installable
* The 7-maintainer list on the npm scope means seven separate credential-theft targets for the same blast radius
* OIDC trusted-publisher binding has no per-publish review. Once configured, any code path in the workflow can mint a publish-capable token. We need either (a) move to short-lived classic tokens with manual review, or (b) add provenance-source-verification to detect publishes from unexpected workflow steps

### What we got lucky on
* The attacker chose a payload that broke tests, which made the publish step (which would have produced cleaner-looking tarballs) skip — meaning the attack was loud enough to detect quickly. A more careful attacker who didn't break tests could have published silently for hours longer
* The attacker reused public tradecraft (verbatim memory-dump script with attribution comment) instead of writing novel code — making the IOC-matching faster
---

## Open questions
These need answers before we close the postmortem.

* Did bundle-size.yml's Setup Tools step actually call actions/cache@v5? Verify by reading the post-job logs from one of the pull_request_target runs against PR #7378 (e.g., run id 25666610798). Tanner has access; needs to be done manually
* What was in the initial PR head commit (before the force-pushes wiped it)? GitHub's reflog may have it. Check via gh api or the GitHub support team
* How did the malicious commit get into the fork's git object store specifically — was it pushed directly via git, or was it created via the GitHub web UI (which would leave audit-log entries)?
* Was voicproducoes a real account or a sock puppet? Cross-reference its activity history
* Did the npm cache also get poisoned (the 6 duplicate linux-npm-store-* entries)? Were any actually used?
* Can we identify any other fork in the TanStack/router fork network that contains the orphan payload commit? (If yes, the cleanup is harder — every fork hosting it keeps it accessible via github:tanstack/router#79ac49ee...)
* Are any other TanStack repos (router, query, table, form, virtual, etc.) using the same bundle-size.yml-style pattern? Audit needed
* How many users actually downloaded the affected versions during the publish window? Get from npm support
* Did any of the seven listed maintainers' machines get compromised separately? (None of the malicious publishes used a maintainer's npm token, but maintainer machines could have been the secondary target via the self-propagation logic)
---

## References
* Tracking issue: [TanStack/router#7383](https://github.com/TanStack/router/issues/7383)
* GitHub Security Advisory: [GHSA-g7cv-rxg3-hmpx](https://github.com/TanStack/router/security/advisories/GHSA-g7cv-rxg3-hmpx)
* Related research: 
  * Adnan Khan, "The Monsters in Your Build Cache: Github Actions Cache Poisoning" (May 2024) — [adnanthekhan.com](https://adnanthekhan.com/2024/05/06/the-monsters-in-your-build-cache-github-actions-cache-poisoning/)
  * GitHub Security Lab, "Keeping your GitHub Actions and workflows secure: Preventing pwn requests" — [securitylab.github.com](https://securitylab.github.com/research/github-actions-preventing-pwn-requests/)
  * StepSecurity, "Harden-Runner detection: tj-actions/changed-files action is compromised" (March 2025) — [stepsecurity.io](https://www.stepsecurity.io/blog/harden-runner-detection-tj-actions-changed-files-action-is-compromised)
* npm policies: 
  * Unpublish: [docs.npmjs.com/policies/unpublish](https://docs.npmjs.com/policies/unpublish)
  * Provenance: [docs.npmjs.com/generating-provenance-statements](https://docs.npmjs.com/generating-provenance-statements)
---

## Appendix A — Affected versions
See the GitHub Security Advisory for the full list of affected versions: [GHSA-g7cv-rxg3-hmpx](https://github.com/TanStack/router/security/advisories/GHSA-g7cv-rxg3-hmpx)
## 相关实体
- [Postmortem Tanstack Npm Supply Chain Compromise Tanstack Blog](https://github.com/QianJinGuo/wiki/blob/main/entities/postmortem-tanstack-npm-supply-chain-compromise-tanstack-blog.md)
- [Checkmarx Jenkins Plugin Compromised In New Supply Chain Attack](https://github.com/QianJinGuo/wiki/blob/main/entities/checkmarx-jenkins-plugin-compromised-in-new-supply-chain-attack.md)
- [Www Wiz Io Mini Shai Hulud Strikes Again Tanstack More Npm Packages Compromised](https://github.com/QianJinGuo/wiki/blob/main/entities/www-wiz-io-mini-shai-hulud-strikes-again-tanstack-more-npm-packages-compromised.md)
- [Rigged Game Scarcruft Compromises Gaming Platform Supply Chain Attack](https://github.com/QianJinGuo/wiki/blob/main/entities/rigged-game-scarcruft-compromises-gaming-platform-supply-chain-attack.md)
- [Semgrep Intercom Php Supply Chain](https://github.com/QianJinGuo/wiki/blob/main/entities/semgrep-intercom-php-supply-chain.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/npm-supply-chain-compromise-postmortem.md)

---

