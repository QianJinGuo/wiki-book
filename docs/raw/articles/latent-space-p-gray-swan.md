---
source_url: "https://www.latent.space/p/gray-swan"
ingested: 2026-06-26
sha256: 122d5805ae16a203
---

# Red-Teaming after Mythos — Zico Kolter & Matt Fredrikson, Gray Swan


Published Time: 2026-06-22T21:06:55+00:00

Markdown Content:
[AI Engineer World’s Fair](http://ai.engineer/wf) regular bird tix will sell out ~today! [Join us next week](https://www.latent.space/p/exclusive-250-off-ai-engineer-tix) ahead of the Late Bird price hike and [get >$40,000 in sponsor credits for attending](https://www.latent.space/p/ainews-not-much-happened-today-e7b)!

Thanks to [the US Government issuing an export control directive on Mythos and Fable](https://www.latent.space/p/ainews-fable-and-mythos-officially), the risks of [jailbreaks and (industry term) indirect prompt injection](https://www.cnet.com/tech/services-and-software/anthropic-claude-fable-mythos-us-export-controls/) are suddenly the talk of the town, though we have been covering AI security for a few years now, from [Hackaprompt](https://www.latent.space/p/learn-prompting) to the enigmatic [Pliny the Elder](https://www.latent.space/p/jailbreaking-agi-pliny-the-liberator).

Zico Kolter, member of [OpenAI’s board of directors on the Safety & Security Committee](https://openai.com/index/zico-kolter-joins-openais-board-of-directors/), and Matt Fredrikson, CMU professor and [CEO of Gray Swan](https://www.mattfredrikson.com/), co-authored the definitive paper on [Indirect Prompt Injections](https://arxiv.org/abs/2603.15714), and [Gray Swan](https://www.grayswan.ai/) were cited authorities on the [Mythos model card](https://www-cdn.anthropic.com/08ab9158070959f88f296514c21b7facce6f52bc.pdf), directly investigating the exact capabilities that are under scrutiny right now:

[![Image 1](https://substackcdn.com/image/fetch/$s_!ipA_!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3e363710-556e-469c-949c-a0942736c562_1348x934.png)](https://substackcdn.com/image/fetch/$s_!ipA_!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3e363710-556e-469c-949c-a0942736c562_1348x934.png)

We seized the opportunity to ask them the state of AI Red Teaming, and [Shade](https://www.grayswan.ai/solutions/platform/shade), the adversarial red teaming tool that Anthropic used to evaluate the robustness of their models against prompt injection attacks in coding environments. Shade is part of their overall toolkit covering [Simon Willison’s Lethal Trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/), including [Cygnal](https://www.grayswan.ai/solutions/platform/cygnal), an AI guardrails product, and the world’s largest [AI Red Teaming Arena](https://app.grayswan.ai/arena), including AIRT celebrity [Wyatt Walls](https://x.com/lefthanddraft).

All of this security tooling, and yet, we’re only staving off the inevitable.

The risks of extremely smart AI increasingly feel like gray swan events: **an event that everyone can see coming.**

[Video 3](https://www.youtube.com/watch?v=j8BAficRjEc)

In this episode, Gray Swan cofounders Zico Kolter and Matt Fredrikson join swyx to explain why **AI security is not just “cybersecurity with AI,”** why agents introduce a new class of vulnerabilities, and why the next major AI incident may be a gray swan: unlikely, but clearly visible before it happens.

We go deep on **prompt injection**, **automated red teaming**, model robustness, agent identity, **computer-use agents**, enterprise guardrails, and the emerging AI insurance/compliance stack. Zico and Matt also explain why frontier models are not automatically safer as they scale, why **specialized red-teaming models** can now **beat humans at breaking AI systems**, and why the future of AI security may depend on AI systems attacking, defending, and interpreting other AI systems.

**We discuss:**

*   Why AI systems need a different **security mindset** from traditional software

*   How **prompt injection** creates a new exploit class for agents like Codex and Claude Code

*   **Gray Swan Arena** and the rise of community red teaming

*   **Shade**: AI that can outperform humans at breaking models

*   Why LLMs are an **alien form of intelligence** that fail differently from humans

*   **Human vs browser-agent robustness** and why humans ranked fourth

*   Why **eval awareness** and capability elicitation matter

*   **Cygnal**: Gray Swan’s guardrail model for policy enforcement

*   Why bigger models do not automatically become **more robust**

*   The **lethal trifecta**: untrusted data, private data, and exfiltration

*   Why “just prompt it better” is not enough for **enterprise AI security**

*   **OpenClaw**, computer-use agents, and the agent security nightmare

*   **Agent-native identity**, permissions, and enterprise deployment

*   Why AI security may become part of **insurance and compliance**

*   Why the first major **AI prompt-injection breach** may be inevitable

**Gray Swan**

*   **Website:**[https://www.grayswan.ai/](https://www.grayswan.ai/)

**Zico Kolter**

*   **X:**[https://x.com/zicokolter](https://x.com/zicokolter)

*   **Website:**[https://zicokolter.com/](https://zicokolter.com/)

*   **LinkedIn:**[https://www.linkedin.com/in/zico-kolter-560382a4/](https://www.linkedin.com/in/zico-kolter-560382a4/)

**Matt Fredrikson**

*   **Website:**[https://www.mattfredrikson.com/](https://www.mattfredrikson.com/)

*   **LinkedIn:**[https://www.linkedin.com/in/matt-fredrikson-7596349/](https://www.linkedin.com/in/matt-fredrikson-7596349/)

**00:00:00** Introduction

**00:02:31** Why AI Security Is Different

**00:06:38** Testing Claude, Codex, and Prompt Injection

**00:07:47** Gray Swan Arena and Automated Red Teaming

**00:11:14** AI That Breaks Models Better Than Humans

**00:14:00** LLMs as Alien Intelligence

**00:19:00** Humans vs AI Agents

**00:24:35** Red Teaming, Jailbreaks, and Capability Elicitation

**00:26:11** Cygnal: Guardrails for AI Agents

**00:34:04** The Lethal Trifecta

**00:39:31** Can AI Automate AI Research?

**00:45:47** OpenClaw and the Computer-Use Security Problem

**00:50:44** Agent Identity, Permissions, and Enterprise AI

**00:54:24** The Future of AI Security

**01:00:30** AI Insurance and Compliance

**01:04:32** The Gray Swan Event Everyone Sees Coming

**01:06:04** Closing Thoughts

**Swyx [00:00:00]:** We’re here in the studio with Gray Swan, Matt and Zico. Welcome.

**Zico [00:00:08]:** Great to be here.

**Matt [00:00:09]:** Thanks for having us.

**Swyx [00:00:10]:** You’re visiting from Pittsburgh? The home of all good computer science. I don’t know if I’m overstating things. A very strong university.

**Zico [00:00:18]:** CMU has been the center of a lot of AI since really the dawn of the field.

**Swyx [00:00:22]:** Especially a lot of self-driving and some language learning. Congrats on your Series A. You’re here because you’re attending Snowflake Summit, and Snowflake is one of your investors. Let’s introduce crisply at the top: what is Gray Swan, and what have you chosen as your startup domain?

**Matt [00:00:42]:** At Gray Swan, our mission is to empower everyone to use AI safely and securely. Large language models are software, and if you want to deploy them or build applications on top of them, you need to understand the vulnerabilities and what can go wrong. That includes everyday mistakes, like an agent making the wrong tool call, but also worst-case scenarios where an attacker has an incentive to make your agent misbehave, leak data, or steal credentials. Gray Swan grew out of our research at Carnegie Mellon, where Zico and I have spent over a decade studying new vulnerabilities and attack surfaces in deep learning systems: how to test for them, understand their severity, and make inference more robust.

**Swyx [00:02:05]:** Honestly, a very fruitful area of study for any academic. Throwback, this is 10 years ago, which is basically the entirety of me. I got a lot of inspiration from Ian Goodfellow, a friend of the pod, and this is one of those initial adversarial settings.

**Matt [00:02:23]:**
