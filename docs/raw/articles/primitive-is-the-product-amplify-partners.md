---
source_url: https://amplifypartners.com/blog-posts/the-primitive-is-the-product
ingested: 2026-07-02
source: newsletter
sha256: bc7a3a1f2e4d5c6b7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f
---

# The primitive is the product

Lenny Pruss — Amplify Partners

For as long as software has existed it's been principally designed for human consumption.

Users clicked buttons, navigated workflows, learned new interfaces. They spent years developing muscle memory for products like Excel, Photoshop, Salesforce, Github, Jira, etc.

And so emerged a simple logic governing software economics: own more workflows, capture more value. In this era, features became the currency of software. Every new feature expanded the product's surface area, increased switching costs, and pulled users deeper into the platform.

AI completely subverts this logic.

The most important characteristic of the AI platform shift has less to do with the new technological foundation (e.g. the model) we're building on, and much more to do with the new type of user (e.g. the agent) we've introduced.

Agents, which are already consuming a rapidly expanding share of software, have a completely different interaction model than humans. They don't navigate software so much as they intuit and compose it. Because the native language of the agent is code, they don't see your GUI, but they do consume your API spec.

More plainly, agents couldn't care less about dashboards, buttons, settings pages, etc. They care purely about capabilities, e.g. the inputs, outputs, and explicit constraints of your program and whether those can be invoked and chained reliably.

My friend David Crawshaw, founder of exe.dev (and before that Tailscale), put it best: "the best product for an agent is just the best product for a developer." It's no surprise that agents become dramatically more reliable when a prompt simply begins with ssh!

Suddenly, every software company needs to start thinking like a developer tools company.

**The Tao of HashiCorp**

Long before LLMs, HashiCorp figured out something many software companies missed.

Users don't want features, they want outcomes. Thus, the job of a product is to collapse complexity into the smallest yet most powerful abstraction that enables those outcomes.

This philosophy became known as the Tao of HashiCorp.

HashiCorp understood that the hardest problem in software is not implementation, rather it's deciding where to draw these lines of abstraction. Where should the system be opinionated vs. where should it remain extensible? Where should complexity be hidden vs. where should it be exposed?

The magic of HashiCorp was never in building the most feature-complete products which provisioned infrastructure or managed secrets. Their genius was in deeply understanding the practitioner and their workflows and identifying the right abstraction for the job to be done.

Take Terraform. Rather than encoding the logic for every infra management workflow into the product itself, it exposed a lower-level building block: a declarative graph of resources and their dependencies. It landed exactly at the right abstraction layer. Not too high (which would have made it inflexible), not too low (which would have made it impractical). It gave practitioners just enough power to be dangerous while collapsing infinite complexity.

The Tao of HashiCorp is more relevant now than ever because the AI era forces every software company to make the same set of choices HashiCorp made 15 years ago.

**The product is the primitive**

Agents treat your software like an API. The quality of that API and the primitives it exposes determines how effectively agents can compose your product.

This suggests a new first principle: the product is the primitive. Not "the product is the set of features" or "the product is the workflow" but "the product is the primitive" — the smallest composable unit of capability that an agent (or developer) can combine with other primitives to achieve outcomes.

Stripe understood this early. Stripe's API didn't try to own the entire payments workflow. Instead, it exposed the primitive: a charge. Everything else — subscriptions, invoices, fraud detection — was built on top of that single primitive. The charge primitive was so well-designed that it became the foundation for an entire ecosystem.

Similarly, Twilio's SMS primitive (send a message to a phone number) became the foundation for communications. AWS S3's object storage primitive (store and retrieve objects via HTTP) became the foundation for cloud storage. GitHub's git primitive (push, pull, merge) became the foundation for modern software collaboration.

In the AI era, the primitive question becomes: what is the simplest, most composable capability your software can expose? Not what's the most feature-rich product you can build, but what's the smallest unit of functionality that, when combined with other primitives, creates disproportionate value?

**Primitives, not platforms**

VCs love platforms. Platforms have network effects, high switching costs, and own entire categories. Primitives sound small and commoditizable by comparison.

But primitives have a different kind of power. A well-designed primitive becomes infrastructure. It gets embedded into workflows, composed into larger systems, and eventually becomes so fundamental that replacing it is unthinkable.

The primitive is defensible not because it's hard to build, but because it's hard to design well. The right abstraction requires deep understanding of the practitioner, their workflows, and the job to be done. A poorly-designed primitive is worse than no primitive at all — it introduces complexity, cognitive overhead, and composability friction.

When I see a ~10-person team trying to build a data platform, I now gently suggest they spend six months finding their primitive instead.

**Where the puck is going**

If software is increasingly consumed by agents, then every software company's most important product decision is not "what features should we build" but "what primitives should we expose." The company that designs the best primitives for agents will win, not the company with the most features.

This has profound implications for product strategy, pricing, distribution, and even organizational design. Product managers need to think like API designers. Engineers need to think about composability and constraints, not just implementation. Sales teams need to articulate value in terms of capabilities, not workflows.

The primitive is the product. Everything else is detail.
