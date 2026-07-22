sha256: 73cb7aebde88e8a52769352d15a04d4e98ecb33ad90cfd4c8c50379283ab5d60
---
title: "Enhance your Supply Chain Security with our Package Proxy Tool"
source_url: "https://blog.thinkst.com/2026/06/introducing-package-proxy-supply-chain-safety-checks-without-client-side-software.html"
ingested: 2026-06-29
type: article
tags: []
---

# Enhance your Supply Chain Security with our Package Proxy Tool


Published Time: 2026-06-05T06:43:41+00:00

Markdown Content:
## Introducing Package Proxy: supply-chain safety checks without client-side software

Supply chains are getting wrecked with back-doored and malicious packages every few days it seems. Today we’ve released [Package Proxy](https://packageproxy.dev/), our imaginatively (descriptively?) named Cloudflare-based tool which implements a bunch of in-line checks for popular package managers (npm, pip, uv, and cargo). Read on for why we built it, or head to the [GitHub repo](https://github.com/thinkst/package-proxy) to trivially deploy into Cloudflare yourself.

## Sulfurous supply chains

Software dependency risk used to be primarily concerned with old versions; if one of your tools bundled a [vulnerable OpenSSL version](https://nvd.nist.gov/vuln/detail/CVE-2014-0160) then you had to upgrade that tool to get patched against the 3rd party bug. Apart from old versions, the software dev industry wasn’t thinking too hard about where code came from except that it was from a recognised package repo. The push towards SBoMs is an artifact of that attitude: “if we know all the libraries used in this tool then we can ensure the vendor keeps them updated; _dusts hands_“.

However, security folks have been speaking about expanded software supply chain risk for a while, pointing out that the vast majority of code in most tools resides in libraries and extensions, and _that_ introduces transitive trust of hundreds-to-thousands of unknown and unknowable authors. Ten years ago, our Az and Nick [demonstrated backdoored plugins to the Atom code editor](https://44con.com/2016/09/07/azhar-desai-nicholas-rohrbeck-effortless-agentless-breach-detection-in-the-enterprise-token-all-the-things/), and they weren’t the first to think about [backdoored tools](https://www.cs.cmu.edu/~rdriley/487/papers/Thompson_1984_ReflectionsonTrustingTrust.pdf). The idea of deliberately malicious dependencies has been kicking around for a long time, but threat actors largely stayed away. It’s been confined to the security world for the most part, with developers largely unaware of the risks.

Seven years ago, it was notable when [12 malicious packages](https://www.zdnet.com/article/twelve-malicious-python-libraries-found-and-removed-from-pypi/?_gl=1%2ajmv81j%2a_up%2aMQ..%2a_ga%2aMTAwMTgzNTU0My4xNzc5ODc0MjA5%2a_ga_1Q25KQB2WE%2aczE3Nzk4NzQyMDkkbzEkZzAkdDE3Nzk4NzQyMDkkajYwJGwwJGgw) were found on PyPI. Last week, Socket reported [639 compromised npm packages](https://socket.dev/blog/antv-packages-compromised) in just one coordinated attack and that news passed by quickly. The world has clearly moved on, and supply chain risk has become an issue for developers too. The [Axios breach](https://github.com/axios/axios/issues/10636) was a foghorn-level alert to developers about the change in the sophistication of these attacks. As a vendor, we’ve been exploring ways to introduce additional controls to reduce our supply chain risk so that we remain unaffected.

## Idealised protection

As the dev world scrambled to contain the risk, a few heuristics cropped up. For back-doors inserted surreptitiously into valid packages, the exposed window tended to be narrow before the issue was discovered (i.e. hours to days). For typo-squatted or fake packages, they typically had low numbers of installs. For compromised maintainer accounts, expired or re-registered domains was a strong indicator, as was a change in the package upload process. There are also block lists of known bad packages, and allow lists of known fixed packages that have been assessed.

In the ideal world, before any package is installed we would perform checks like:

*   Require the package to be at least N days old (say, 10), to give a window in which others encounter the issue first.
*   Check whether the package was uploaded to the repo in a different way from before. Some repos will indicate whether the package was uploaded directly or through an automated process, and attackers who compromise maintainers often directly upload packages instead of using the pipeline (because it is less visible).
*   Check whether there are domains associated with the package (e.g. email addresses), and see if any are expired or have been registered recently. Attackers look for expired domains in order to re-register them and gain access to unmaintained packages.
*   Perform a diff on the package from between its two most recent versions, and analyse for back-doors
*   Run a code scanner on the full package to identify back-doors
*   See if the package and/or its version is in a list of known bad packages
*   See if the package is already trusted by us through an out-of-band assessment.

Now, we can’t do all of these in-line. Running a code scan will take minutes to hours, far too long for actual use. Some are wishful (maintainer emails are not mandatory for PyPI packages). But package age, upload method, and allow and block lists are all fast to check.

Of course, even if all of these checks were applied to every package, it’s still possible to construct an attack path past all of these tests. However they raise the effort required by attackers (thereby increasing their cost).

Package Proxy is a simple idea. Many package managers (notably uv, pip, cargo, and npm) use an index URL to fetch metadata (e.g. [https://pypi.org/simple](https://pypi.org/simple) for `pip`). That index URL can be changed through configuration so the package managers instead pull metadata from the Package Proxy. The Package Proxy sees all requests for metadata, and can infer which packages the client wants to install. The Package Proxy performs checks you desire, and simply returns 404 for packages that don’t meet your policies, or will fetch the package for you and serve it to the client if the package passes the policy check.

It relies on Cloudflare Workers so it is very tied to Cloudflare, but similar ideas can be implemented elsewhere. The released Package Proxy implements these checks out the box:

*   Ensures packages are at least 10 days old (PyPI, npm, cargo)
*   Where the package upload mechanism is visible, check that it has not regressed (PyPI, npm)
*   Bypass for explicit audit fix steps (npm)
*   Block list (PyPI, npm, cargo)
*   Allow list (PyPI, npm, cargo)

We’re making the source available on [our Github](https://github.com/thinkst/package-proxy), and you can [1-click deploy to Cloudflare](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2Fthinkst%2Fpackage-proxy) for your own hosted Package Proxy.

Internally we run a fork which enforces a stronger version of the allow list; we block `npm` packages by default and developers have to request additions to the allow list.

## What this means

Other approaches to this problem hinge on deploying a wrapper around the package manager, with both commercial and open source options. We elected to go with the proxy approach, because it meant we didn’t need an additional dependency in a whole bunch of new places, we just needed a config change. Wrappers have their own benefits, but the proxy gave us an immediate control we could roll out through a background fleet-wide deployment without needing to change workflows or habits.

It also helps supply uniform checks when your clients have different versions of package managers. For example, while `uv` supports a notion of “don’t install packages published in the last week”, `pip`‘s `--uploaded-prior-to` option takes a fixed timestamp. With the Package Proxy, we can enforce a uniform check regardless of the package manager.

Since the proxy was rolled out, these recent breaches did not affect us:

1.   [TanStack](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem) (due to age checks)
2.   [BitWarden](https://community.bitwarden.com/t/bitwarden-statement-on-checkmarx-supply-chain-incident/96127) (due to age & integrity downgrade checks)
3.   TeamPCP’s [latest round of npm targets](https://www.wiz.io/blog/mini-shai-hulud-teampcp-hits-antv-supply-chain) (due to age checks)
4.   We could ensure that the malicious NPM packages `logger-active` and `utils-terminal` targeting common utility library names hadn’t been installed by mistake (due to age checks)

## Proxy setup

Deployment is via Cloudflare and Github; if you have accounts on both then a [deploy to Cloudflare](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2Fthinkst%2Fpackage-proxy) will clone our repo into your Github, then set up Cloudflare Workers.

After deploying, the “Domains & Routes” page will list your production Worker URL; this is your Package Proxy URL to use. You can also configure a custom domain here if you prefer not to use the auto-generated URLs.

The Package Proxy logs its usage into a D1 Database; browse to the [Cloudflare dashboard](https://dash.cloudflare.com/) and run queries such as:

*   **Return all the users that have installed a package (and each version)**: `SELECT DISTINCT UserId, CONCAT(PackageName, '@', PackageVersion) as Installed FROM Installs WHERE PackageName LIKE ?;`
*   **Fetch the total number of installed packages**: `SELECT COUNT(*) FROM Installs;`
*   **Fetch all installed package names**: `SELECT DISTINCT PackageName FROM Installs;`

## Proxy configuration

To manage your Proxy, configure it through the Cloudflare dashboard. There you can add a [sub-]domain that is directed to the proxy as well as view usage and request logs.

Once the proxy has handled a request it will create a default configuration. You can change this configuration with a few Wrangler commands:

`$ NAMESPACE_ID="..." # Your KV store's namespace ID`

`$ npx wrangler kv key get "default" --namespace $NAMESPACE_ID --remote > config.json`

[edit the `config.json` file]

`$ npx wrangler kv key put "default" --namespace $NAMESPACE_ID --remote --path config.json`

## Deploy configuration to your endpoints

With the proxy in place, you need to tell your endpoints about it. For developers laptops, we pushed out [this script](https://github.com/thinkst/package-proxy/blob/main/scripts/SetupPackageProxy.sh) which sets up the proxy for npm, pip, uv, and cargo.

You can also (in some cases) make the proxy per-repo. `uv`’s `pyproject.toml` supports configuring the index in a particular project with the following settings:

## Dealing with incidents

When (not if) the next supply chain compromise takes place, you don’t need to do anything immediately. The Package Proxy will give you 10 days grace (by virtue of the enforced minimum package age), which historically has been enough time for backdoors to be discovered and the packages yanked from the repos.

Should an attack like Axios happen (in which the integrity of the package regressed because the upload mechanism changed) then the Package Proxy will never allow that version regardless of the time.

There are times when a critical update does occur that you need to roll out. For NPM packages, the proxy will (as a default configuration) allow `npm audit` to see the latest packages. For the other registries you can add a specific package and version combination to your allow list with Cloudflare’s tools. For example, you can add `test@2.3.4` to the default allow list (with [Wrangler](https://developers.cloudflare.com/workers/wrangler/) installed):

1.   `$ cd path/to/repo/with/your/wrangler.jsonc`
2.   `$ npx wrangler kv key get "default" --binding PACKAGE_PROXY_CONFIG --remote | jq '.allowlist += {"npm/test": ["2.3.4"]}' > new_config.json`
3.   `$ npx wrangler kv key put "default" --binding PACKAGE_PROXY_CONFIG --remote --path new_config.json`

It is also possible to edit the KV values directly from the Cloudflare dashboard in your browser.

## Give it a whirl

We think this approach has legs and haven’t seen others try it. It’s working for us and has seen real wins.

