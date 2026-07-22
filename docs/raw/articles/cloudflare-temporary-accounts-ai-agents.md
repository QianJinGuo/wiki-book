---
title: "Temporary Cloudflare Accounts for AI agents"
source_url: "https://blog.cloudflare.com/temporary-accounts/"
author: "Cloudflare"
publish_time: "2026-06"
ingested: true
sha256: "pending"
---

# Temporary Cloudflare Accounts for AI agents


Published Time: 2026-06-19T14:00+01:00

Markdown Content:
2026-06-19

4 min read

![Image 1](https://cf-assets.www.cloudflare.com/zkvhlag99gkb/TaeUUpmHSgKNA48R3gp9q/71645cfc910b9f32689980930010913d/image1.png)

Everyone's writing code with AI agents today. But the moment an agent needs to deploy something — and needs to sign up and create an account — it slams face-first into a wall built for humans: a browser-based OAuth flow, a dashboard to click through, an API token to copy-paste, a multi-factor authentication prompt to satisfy. For an interactive copilot sitting next to a developer, that's annoying. For a background agent, it's a hard stop.

Today we're rolling out Temporary Cloudflare Accounts for Agents.

Agents can now deploy [websites](https://www.cloudflare.com/solutions/frontends/), [APIs](https://www.cloudflare.com/products/workers/), and [agents](https://www.cloudflare.com/products/agents/) right away, without first needing to sign up for an account.

![Image 2](https://cf-assets.www.cloudflare.com/zkvhlag99gkb/6joSXmAJAARgyGphPhXGla/9c3e8cef6f269df6a9c458495c5fe40b/image2.png)
Any agent can now run `wrangler deploy --temporary`and deploy a Worker to Cloudflare. This temporary deployment stays live for 60 minutes, during which time you can claim the temporary account, making it permanently your own. If you don't, it expires on its own.

![Image 3](https://cf-assets.www.cloudflare.com/zkvhlag99gkb/7IKqILTXCvDH4QjNFtx2pp/798c00b190c9b9909a4501f29b8c18bb/image4.png)
Our goal? Let your agent code and ship.

## Why frictionless deployments matter for AI agents

Frictionless temporary accounts matter more than it might first seem:

*   **Background AI sessions have no human in the loop, and are becoming the norm**. Any auth step that needs a browser, a copy-paste, or "click here in 60 seconds" means an agent gets stuck and may choose to deploy elsewhere.

*   **Trial-and-error is the agent's superpower**. Agents need a tight write → deploy → verify loop. They need cheap, throwaway deployment targets, so they can curl their own output and decide whether they got it right.

*   **Agent platforms are building their own ways for deploying code to "just work" without extra steps or credentials**. People are starting to expect that this process just works, without the need to sign up for other services that they've not used before or heard of.

## How it works

Temporary accounts are built around [Wrangler](https://developers.cloudflare.com/workers/wrangler/), our Developer Platform command-line interface (CLI) tool that lets developers bootstrap new projects, manage their configurations and resources, and deploy and update them.

Wrangler usage is widely [documented](https://developers.cloudflare.com/workers/examples/) online and agents know how to use it very well. But if you hadn’t yet signed in and granted Wrangler permission to your Cloudflare account, when the agent tried to deploy, it would get stuck at the sign-up and authentication step. And you might rightly ask: How do agents and LLMs know that this new `--temporary` flag in Wrangler exists, so that they actually use it without a human explicitly telling them to do so?

To solve this, we updated Wrangler to prompt the agent with a message that tells it about the `--temporary` flag:

![Image 4](https://cf-assets.www.cloudflare.com/zkvhlag99gkb/4pF05TQ9S8HXvOmwD1zoG0/d99ae0ec7d82f26f85dbd5957759697e/image3.png)
When the agent discovers this, and then runs `wrangler deploy` again with the `--temporary` flag, Cloudflare provisions a temporary account for the agent to use, gives Wrangler an API token to work with, and provides a claim URL that the agent can give back to the human.

## Let’s go over every step of the flow

### Deploying and iterating on a new project

Make sure you’re using the latest [Wrangler release](https://github.com/cloudflare/workers-sdk/releases), fire up your favorite coding agent, and write a prompt to deploy a "hello world" app in build mode:

> `Make a very simple hello world Cloudflare Worker in TypeScript and deploy it using wrangler, don't ask me questions, do the best you can`

The agent will run wrangler, pick up the `--temporary` flag from the output messages, build your script, and deploy it instantly, no human in the loop required:

![Image 5](https://cf-assets.www.cloudflare.com/zkvhlag99gkb/1Okmqkf7nBH7Hu2wsKWmnc/879cb6025e630bbd8a99b546de935828/image7.png)
As you can see, the agent wrote the script, deployed it using the `--temporary` flag, curled the preview link it got from the output, and verified that the result matches the code.

This is great, but agentic coding is often not about one single deployment. A session can go through a cycle of multiple code changes. This is not a problem: the agent can iterate on the Worker script and redeploy the changes as many times as it wants (within the 60-minute claim window). Type this prompt:

> `Now change hello world to "hello cloudflare" and redeploy`

Look at the agent changing the source code, reusing the previously created temporary account, redeploying a new version and rechecking the result:

![Image 6](https://cf-assets.www.cloudflare.com/zkvhlag99gkb/3W86UmPyW5oQxpGkmEEJzL/6168e21df00111aedab481fee5b0a313/image5.png)
### Claiming the account

At any point, you can claim the temporary account and make it yours permanently. When you click the claim link you will be taken to a page where you can either sign up for or sign in to Cloudflare, and then claim the temporary account that your Worker was deployed to. This includes claiming not just Workers, but resources like databases and other bindings, too.

![Image 7](https://cf-assets.www.cloudflare.com/zkvhlag99gkb/3rrCw7HiJJxy6k3eyipWLR/5aca8cdcb2fc391ea27bab5f335449b0/image6.png)
If you do not claim these temporary accounts within 60 minutes, they will be automatically deleted.

## The road to frictionless agentic deployments

This is just one way we’re eliminating the signup barrier for agents. We recently [announced a partnership with Stripe](https://blog.cloudflare.com/agents-stripe-projects/) and a new protocol we co-designed that lets agents provision Cloudflare on behalf of their users — creating an account, starting a subscription, registering a domain, and getting an API token to deploy code, with no copy-pasting tokens or entering credit card details. Last month, we collaborated with WorkOS on the launch of [auth.md](https://workos.com/auth-md), which anyone can adopt, to let agents provision new accounts using well-established, existing OAuth standards.

There’s a ton going on in this space, and we’re excited to keep making it easier for agents to use Cloudflare, and for developers to make their own apps [agent-ready](https://isitagentready.com/). Temporary accounts are one more step toward frictionless agentic deployments — stay tuned for more.

Temporary accounts have some limitations, and their capabilities may change over time; check the [developer documentation](https://developers.cloudflare.com/workers/platform/claim-deployments/) for more information and then go build something. Point your agent at Cloudflare, see how far it gets, and tell us what we can improve or what delights you — share what you’ve built on [X](https://x.com/CloudflareDev) or hop into the [Cloudflare Community](https://community.cloudflare.com/).

[Agents](https://blog.cloudflare.com/tag/agents/)[Wrangler](https://blog.cloudflare.com/tag/wrangler/)[AI](https://blog.cloudflare.com/tag/ai/)[Cloudflare Workers](https://blog.cloudflare.com/tag/workers/)

