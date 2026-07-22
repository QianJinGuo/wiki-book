---
source_url: "https://tomtunguz.com/so-you-want-to-sell-inference/"
ingested: 2026-06-26
sha256: 9b52631ceeaa6da6
---

# "So You Want to Sell Inference"


Published Time: 2026-06-22T00:00:00Z

Markdown Content:
The fastest-growing companies in AI are either selling inference or reselling it. They’re its [first derivative](https://tomtunguz.com/first-derivative-of-inference/). But reselling inference at cost is a zero-margin business : a payment rail, not a software company.

So how do you keep 30 points of gross margin or more?

It comes down to the same distinction every sales pitch makes : cost-plus pricing versus value-based pricing.

[![Image 1: The token path has two cost-based mechanics : cost-plus markup above the inference line, cost optimization below it](https://res.cloudinary.com/dzawgnnlr/image/upload/w_1512,h_912,c_fill,g_auto,q_auto,f_auto/sk1kutsqjx8annjx2dvh)](https://res.cloudinary.com/dzawgnnlr/image/upload/q_auto,f_auto/sk1kutsqjx8annjx2dvh)

The chart shows the two cost-based mechanics. The solid orange line is cost-plus : customer price rides 30% above. The dotted green line is optimization : delivered cost starts near the inference line & falls away as the engine compounds. Value-based pricing isn’t on the chart : it’s decoupled from the inference line entirely.

**Cost-plus : markup.** Price above the inference line. The harness : the product, workflow, & UX wrapped around the model.[1](http://tomtunguz.com/so-you-want-to-sell-inference/#fn:1) It has to be superior enough to justify a premium. But cost-plus caps willingness to pay at the inference cost. The customer compares your price to the raw API & routes around you. As inference commoditizes, the markup compresses toward zero.

**Value-based : charge for the work.** Price against the outcome. Charge per resolved ticket, per completed task, per generated report : a fraction of the surplus created.[2](http://tomtunguz.com/so-you-want-to-sell-inference/#fn:2) The customer buys work & never sees your inference cost. Sierra charges when an agent resolves a ticket, zero for failures. Devin sells Agent Compute Units, not tokens — the same abstraction Databricks & Snowflake use with credits to decouple pricing from raw compute. Margin is decoupled from the inference line. Durable.

**Optimization : spend less.** Under either pricing model, widen margin by reducing the inference cost to $0.70 via model routing, caching, & distillation to proprietary small models. Routing & caching are tactical & copyable. Distillation is defensible for a while : run production traffic through frontier teacher models, distill to a sub-8b parameter student, deploy on cheap hardware. You end with a proprietary model competitors can’t replicate, at a fraction of the cost.

And there’s one more variable : what if the customer wants to bring their own key?

A customer who brings their own key sees the raw inference cost on their cloud bill. Cost-plus breaks : a markup is a visible tax on something they already buy, & they route around it. Value-based survives : you’re selling work, & the customer pays inference direct while paying you for the outcome. Optimization survives too : they bring the key, not the engine, & you charge a platform fee for making their budget go further. Either way, you sell the platform, not the token.

Every board should be asking which pricing model their inference reselling business is running. Cost-plus is a payment processor with a dashboard. Value-based is software. The answer determines which one you’re building.

* * *

1.   [Harnessing AI](https://tomtunguz.com/harnessing-ai/) : tomtunguz.com.[↩︎](http://tomtunguz.com/so-you-want-to-sell-inference/#fnref:1)

2.   [Framing Your Startup’s Sales Pitch : Focus on Value, Not on Cost](https://tomtunguz.com/framing-your-startups-sales-pitch-focus-on-value-not-on-cost/) : tomtunguz.com, 2013.[↩︎](http://tomtunguz.com/so-you-want-to-sell-inference/#fnref:2)
