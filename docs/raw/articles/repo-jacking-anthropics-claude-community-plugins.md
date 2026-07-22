sha256: bdea69a0d62ea9e1835f1608a8763006884175c70d8173fd16425c8125f89cc4
---
source: newsletter
source_url: https://johnstawinski.com/2026/06/18/repo-jacking-anthropics-claude-community-plugins-and-the-shas-that-saved-them/
ingested: 2026-07-01
feed_name: newsletter
---

# Repo-jacking Anthropic's Claude Community Plugins (And the SHAs That Saved Them)

Repo-jacking Anthropic’s Claude Community Plugins (And the SHAs That Saved Them) – John Stawinski IV
Skip to content
June 18, 2026
Repo-jacking Anthropic’s Claude Community Plugins (And the SHAs That Saved Them)
Several Claude Community Plugins were vulnerable to repo-jacking. The direct code installation path was mitigated by SHA checks, but Claude Code’s “view plugin UI” feature would redirect users to the repo-jacked repository, opening up a social engineering vector leveraging trusted community plugins.
Based on my experience, supply chain and social engineering are the easiest ways to compromise an organization.
In 2025 and 2026, threat actors caught on to the supply chain angle, as TeamPCP and others ran rampant on open-source-software.
AI tooling has exacerbated the supply chain problem. Before, we had humans that could go install random stuff on their machines. Now, we have agents that can do this for them (and who really uses Claude Code without “–dangerously-skip-permissions”)?
We’re going to be relearning a lot of supply chain lessons in AI tooling over the next few years.
Several weeks ago, I decided to dip my toes back into vulnerability research by looking for supply chain vulnerabilities in agentic platforms. One of the first vulnerabilities I picked up was in the Claude Code Community Plugins.
What Are Claude Code Community Plugins?
Claude Code community plugins are add-ons that people and companies build to extend Claude Code. Each one bundles together things like custom commands, AI agents, MCP servers, and automated hooks, all installable in one step and easy to share with teammates. Anthropic runs an official directory, but anyone can submit their own plugin to a public community marketplace after it passes an Anthropic review. To use it, you add the marketplace to Claude Code with a command, then install whatever plugins you want from it.
The Claude Code community plugin marketplace is just a
GitHub repository maintained by Anthropic
, and the heart of it is a single file that lists plugins and points at the GitHub repositories that host them.
Installing a plugin through Claude Code will automatically retrieve the code from the remote repository pointed to by marketplace.json.
Source code for the “deep-research” plugin was stored at
https://github.com/oduffy-delphi/deep-research-claude
.
Pointers to other people’s repositories are the kind of trust that quietly rots over time. People rename their GitHub accounts. People delete them. The marketplace entry doesn’t notice. That’s where this starts.
A Repo-jacking Primer
Repo-jacking is a supply chain attack that lives off of rot.
When a GitHub account is renamed or deleted, the old owner/repo path doesn’t just vanish. GitHub keeps a redirect alive so existing links keep working, but only as long as nobody re-registers the old username. The moment someone claims that abandoned name and recreates a repo under it, the redirect is gone and they own the namespace.
Anyone still linking to the old path is now linking to the attacker.
GitHub has some protections against repo-jacking attacks, like reserving namespaces of projects after they are moved or deleted, but only for popular project with a high enough star count and traffic.
Repo-jacking is a well known technique, and it has bitten plenty of large projects. The interesting part is never the trick itself– it’s finding a place where a trusted, official source still points at a name that’s up for grabs.
A plugin marketplace is a very good place to look.
The finding
I (my agents) looked through marketplace.json for entries referencing repositories that no longer had an owner. A handful came back. The plugin entries below all pointed at owner/repo paths where the owner had been renamed or deleted, leaving the namespace claimable:
mailfnguides-del/Claude-Paste
comment-io/claude-code-plugin
CharlieGreenman/ghostlty-dynamic-themes
Chipkorvyn/Strategy-consultant
oduffy-delphi/deep-research-claude
Each one is a dangling reference inside Anthropic’s official marketplace. Each one is an open invitation to register the name, recreate the repo, and serve whatever you want from a location that the ecosystem still treats as legitimate.
I picked one to prove it out.
Proof of concept: deep-research-claude
The deep-research-claude plugin pointed at github.com/oduffy-delphi/deep-research-claude. The oduffy-delphi account no longer existed. The real project had moved to dbc-oduffy/deep-research-claude, but the marketplace never got the memo.
So I became oduffy-delphi.
I registered the org, recreated deep-research-claude under it, and seeded it with a clone of the legitimate repository so the plugin would still function exactly as a user expected. The only thing I changed was a line at the top of the README: “PoC — John Stawinski”. A real attacker would change considerably more.
From a user’s seat, the attack looks like nothing at all:
Add the marketplace: claude plugin marketplace add anthropics/claude-plugins-community
Open Claude Code.
Install the plugin: /plugin install deep-research@claude-community
Select
Open Homepage
.
Land on my repo-jacked repository, PoC banner and all.
No warning, no friction. The marketplace is official, and the homepage opens. Trust flows the entire way down.
That’s a clean phishing primitive. An attacker who has repo-jacked the homepage now has an attacker-controlled page that renders under the implicit endorsement of Anthropic’s ecosystem, reachable in one click from the install flow, at the exact moment a user is already in “I’m setting up this plugin” mode. It’s the perfect place to say “actually, here’s the correct way to install this,” or to hand someone a poisoned config, or to do any of the dozen things that work when a target already believes they’re somewhere legitimate.
The SHAs That Saved Them
If a user opens the homepage, follows malicious instructions an attacker planted there, then their host will be compromised.
However, if the user doesn’t open the homepage, and instead allows Claude Code to automatically install the plugin, they will be saved by a SHA in shining armor.
Looking more closely at marketplace entries, we can see that repos are pinned to a commit SHA.
The plugin install path is pinned to a specific commit SHA. When Claude Code fetches the plugin code, it isn’t just trusting owner/repo, it’s trusting a hash of the exact contents it expects. A recreated repository can carry the same name and the same files, but it cannot reproduce the pinned commit with any modified content. The integrity check fails and the malicious install doesn’t happen.
This is the right design, and it’s the reason a repo-jack of a Claude Community Plugin doesn’t immediately turn into arbitrary code execution on every future user who installs the plugin.
If you only remember one thing about defending a plugin ecosystem, pin your sources to immutable references, like commit SHAs.
The SHAs That Saved Them?
After submitting this vulnerability, I started thinking about the plugin ecosystem. It must be pretty common for plugin maintainers to update their code, so when and how does Anthropic update the SHAs?
It turns out, Anthropic engineers submit
massive
pull requests,
like this one
, where a bot will go through and track down the latest SHA, validate the plugin, and then provide the new SHA for the marketplace.
I doubt that it would be hard to fool the plugin validation process such that the bot ingests a new SHA pointing to a malicious commit of a repo-jacked repository. I didn’t have time to test this theory, but I suspect the SHAs are less of a “knight in shining armor” and more of a “Jamie Lannister who will protect you…..for now.”
Disclosure
Before writing any of this up, I registered each of the affected prefixes as a GitHub organization so an actual attacker couldn’t exploit them. With the exception of oduffy-delphi/deep-research-claude, which I needed for the PoC, I left the specific repositories uncreated so GitHub’s redirect loop still resolves to wherever the legitimate projects live now.
Squatting on names to keep them out of attacker hands is cheap insurance while the references get cleaned up.
I reported all of this to Anthropic through their bug bounty program.
May 25, 2026
Report submitted.
May 25
Passed preliminary review.
May 25
Closed as Informative, out of scope.
Anthropic’s reasoning for closing the issue was that dependency hijacking is explicitly out of scope, the SHA pinning protects the install path, and the remaining concern, a user following a homepage link to a page that has changed ownership, falls under social engineering.
Should You Trust Community Plugin Marketplaces?
Organizations should treat Claude plugin marketplaces, even ones vetted by Anthropic, just like they would treat any other third party code– as untrusted. Just because it’s in an official list somewhere, does not mean it’s secure (just look at all the malicious “verified” VSCode plugins out there).
Plugin ecosystems inherit the package registry’s oldest problems.
We’re going to be relearning a lot of supply chain lessons in AI tooling over the next few years.
This was one of the cheaper ones.
Share this:
Share on X (Opens in new window)
X
Share on Facebook (Opens in new window)
Facebook
Like
Loading…
Categories:
Uncategorized
· Tagged:
ai
,
artificial-intelligence
,
chatgpt
,
llm
,
technology
Previous Post
Leave a comment
Cancel reply
Δ
Loading Comments...
Write a Comment...
Email (Required)
Name (Required)
Website
Comment
Reblog
Subscribe
Subscribed
John Stawinski IV
Sign me up
Already have a WordPress.com account?
Log in now.
John Stawinski IV
Subscribe
Subscribed
Sign up
Log in
Copy shortlink
Report this content
View post in Reader
Manage subscriptions
Collapse this bar
%d
