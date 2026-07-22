---
title: Building AI Agents in Accounting
type: raw
source: newsletter
source_url: https://www.onlycfo.io/p/building-ai-agents-in-accounting
tags: [finance, ai]
fetcher: jina
review_value: 8
review_confidence: 9
review_recommendation: worth-reading
ingested: 2026-05-18
sha256: 7ba9e709519226e81b7873f8c27c781014177c5eef1dc8cb63c6a642e2ddbaf2
---
Title: Building AI Agents in Accounting
URL Source: https://www.onlycfo.io/p/building-ai-agents-in-accounting
Published Time: 2026-05-15T11:22:48+00:00
Markdown Content:
[![Image 1](https://substackcdn.com/image/fetch/$s_!Uw1Z!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc5a85e8b-c35c-41a3-884e-4e1fca2f4a1a_1940x500.png)](https://www.deel.com/resources/a-guide-to-eor-for-startups/?utm_medium=sponsored-newsletter&utm_source=onlycfo&utm_campaign=ww_engage_download_onlycfo_sponnewsletter_fin-eorforstartups-feb26_eor_smb&utm_content=engage_eor_sponnewsletter_eorforstartups-sponnews400-fin_en)
For finance leaders, managing international payroll and compliance requires expertise. Our ‘[Guide to EOR](https://www.deel.com/resources/a-guide-to-eor-for-startups/?utm_medium=sponsored-newsletter&utm_source=onlycfo&utm_campaign=ww_engage_download_onlycfo_sponnewsletter_fin-eorforstartups-feb26_eor_smb&utm_content=engage_eor_sponnewsletter_eorforstartups-sponnews400-fin_en) for Startups’ offers a detailed look at efficient global payroll management & compliance. This guide will help you:
*   Manage cross-border payroll easily
*   Navigate tax implications across jurisdictions
*   Reduce financial risks associated with global growth
Take control of your financial strategy today.
[EOR Guide](https://www.deel.com/resources/a-guide-to-eor-for-startups/?utm_medium=sponsored-newsletter&utm_source=onlycfo&utm_campaign=ww_engage_download_onlycfo_sponnewsletter_fin-eorforstartups-feb26_eor_smb&utm_content=engage_eor_sponnewsletter_eorforstartups-sponnews400-fin_en)
AI has dramatically changed how my team operates and we are still early (lots more work to do)…
I built an AI agent that turned a 2-hour task for my accounting team into 5 minutes. And we used this same AI flow across many similar processes (which cut a full day off of the month-end close).
**I just launched a separate newsletter ([CFOpilot](https://www.cfopilot.com/)) to write about everything I am learning and building with AI**.
_*The below post was shared at **CFOpilot** a few days ago. I got a ton of feedback on how valuable it was, so I wanted to share it here as well._*
I built our first AI agent to tackle accounting reconciliations (focused on prepaids initially).
Here is the process I ended up with…
[![Image 2](https://substackcdn.com/image/fetch/$s_!Lhf-!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6b899397-f242-4608-b2a7-d3798883a4af_1200x630.png)](https://substackcdn.com/image/fetch/$s_!Lhf-!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6b899397-f242-4608-b2a7-d3798883a4af_1200x630.png)
An “agent” is essentially the worker that navigates all of these systems and steps to complete a task.
> _**Skill**: A self-contained workflow an agent runs. A system prompt that defines what to do. MCP connectors to the systems it needs. A trigger that kicks it off. A config that drives the behavior. You build it once and it runs forever._
Every skill has a SKILL.md file. The skill defines the inputs, workflows, rules, output, edge cases, etc. My prepaid skill is ~200 lines.
You’re not writing a prompt every time you run it. You’re writing it once. And then updating it if/when something changes.
My config (YAML file) contains:
*   Prepaid GL account codes
*   Vendor → coding map
*   Materiality threshold
*   Partial-month convention
*   Routing: who gets pinged, in which channel
When something changes, you edit the config (not the skill**).**
This is one thing I was doing wrong before. I was dumping everything into a prompt (or a skill). Every time something changed, I would have to update the skill and re-do it.
Having a separate config file with the stuff that might change breaks things up so it’s easier to maintain. It’s like why you don’t put your entire model and all the components in one giant tab or make Excel model formulas huge.
Putting everything in one skill file also makes it so you can’t reuse your skill in other recons, entities, etc because it contains the exact detail for one prepaid recon process. To make it scalable/reusable, you separate out those details into the config file. Then you can reuse the skill and just update the config file.
> **MCP (Model Context Protocol)**: A standard way for an AI agent to plug into your software systems (Deel, NetSuite, Google Drive, etc) so it can read data, do work, and take actions in those systems on your behalf.
A surprisingly large number of companies I talk to still use AI like a simple chatbot.
The biggest unlock comes from giving AI visibility to everything…Only then can AI agents perform meaningful work end-to-end. The primary way to do that is via MCP connectors.
[![Image 3](https://substackcdn.com/image/fetch/$s_!PjnU!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fefb5df7d-b8b0-4f48-a153-43debe93fc76_994x690.png)](https://substackcdn.com/image/fetch/$s_!PjnU!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fefb5df7d-b8b0-4f48-a153-43debe93fc76_994x690.png)
If AI is not connected to all your systems, then it lacks context, so it will require a lot more manual human effort for each handoff and coordination. AI needs to “see” all the context and have the ability to take actions (even if read-only) to be really useful.
My prepaid agent queries my ERP GL directly via the MCP. No CSV exports/imports.
The skill I created reads the config file to know which prepaid accounts to pull. The agent calls the ERP connector and pulls current period activity for those GL accounts.
If you don’t have an MCP connector to your ERP, that’s the first thing to fix.
The workpapers don’t live in your ERP. They live in GDrive, Box, SharePoint, etc.
The skill needs to:
*   Read last month’s workpaper
*   Write the new workpaper to a new file
*   Enable the AI agent to create and edit the new prepaid workpaper
An MCP connector for the shared drive handles this.
Slack is the UI for my AI agent.
**Slash command**: I kick off the recon by typing “/prepaid April”. Or I just chat in Claude “I want to kick off the prepaid recon for April” and it will find it.
The agent will find the prior workpaper (location is defined in the config file), copy that workpaper to the current month-end close folder. It will then use that as the starting point for adding new prepaids, adding a new month of amortization, etc. The agent is trained just like a human would be…it brings over Excel formulas just like the prior month so the amortization calculates correctly.
When the agent finishes, it posts a digest with the workpaper, the JE CSV, and a tag for the preparer.
_Below is an AI-generated Slack example of what I see (done with AI so you don’t see my actual Slack…)_
[![Image 4](https://substackcdn.com/image/fetch/$s_!KTuZ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8e176d3a-2548-43cf-9eff-172fbcae95a4_1016x760.png)](https://substackcdn.com/image/fetch/$s_!KTuZ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8e176d3a-2548-43cf-9eff-172fbcae95a4_1016x760.png)
If the AI agent flags something I need to fix, then I’ll do one of two things:
1.   Open up the workpaper and fix the errors/flags (e.g., add the Cloudflare term from the example above). Then I add a ✅ to the Slack thread, which signals to the agent that I am done so it re-reads the files to see if I fixed the flags. It updates the files and posts a follow-up message for the reviewer.
2.   If the issue will be repeating, then I will update the skill or config files to automatically fix it going forward.
The skill doesn’t auto-post the JE. We still have a human preparer and reviewer.
*   **Human preparer**: Person managing the agent and fixing the flags/errors that come up. They also do a review of the agent’s work.
*   **Human reviewer**: This is the same process that the reviewer has always performed, and is an important control in accounting.
Essentially, we have turned both of these humans into reviewers. The preparer does the first pass and makes sure the agent did everything properly and then the normal reviewer acts as the final control and sign-off.
_But we have even changed the reviewer’s process as well…more on that to come in future CFOpilot articles._
What previously took lots of manual steps (copy workpaper to new location, open up ERP, download detail, update workpaper, create JE upload file, etc) is now 90%+ completed by our AI agent.
**From ~2 hours of human work to ~5 minutes.**
It did take longer the first time I ran the reconciliation, but then the team took it and kept iterating and improving the skill and the config to automate more and more. Eventually, you get some major time savings.
And then repeat that across your other recons and you will shave off days from your month-end close…Smaller accounting teams, faster close, fewer errors, etc
*   **Download this [EOR guide](https://www.deel.com/resources/a-guide-to-eor-for-startups/?utm_medium=sponsored-newsletter&utm_source=onlycfo&utm_campaign=ww_engage_download_onlycfo_sponnewsletter_fin-eorforstartups-feb26_eor_smb&utm_content=engage_eor_sponnewsletter_eorforstartups-sponnews400-fin_en)** from Deel. Every company looking to expand internationally should read this.
*   If you are in finance/accounting, then check out my new AI newsletter (**[CFOpilot](https://www.cfopilot.com/)**).
[Subscribe to CFOpilot](https://www.cfopilot.com/)