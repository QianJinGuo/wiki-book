sha256: 6562fe60c1e2e43bf073433e2f4d1c8f3bd5bceffed6ea0a011ce3dde917244f
---
source: newsletter
source_url: https://www.implicator.ai/sakana-fugu-launches-with-93-2-livecodebench-score-after-claude-ban/
ingested: 2026-07-01
feed_name: newsletter
---

# Sakana Fugu Launches With 93.2 LiveCodeBench Score After Claude Ban

Sakana Fugu Launches With 93.2 LiveCodeBench Score
Tuesday, June 30, 2026 · San Francisco
Subscribe
Sign In
AI News
Sakana Fugu Launches With 93.2 LiveCodeBench Score After Claude Ban
Sakana AI released Fugu after Anthropic suspended Fable 5 and Mythos 5 access. Fugu Ultra beat Fable on LiveCodeBench and starts at $5 per million input tokens, but the service asks buyers to trust a black-box router at the center of their AI stack.
Marcus Schuler
June 23, 2026, 7:30 AM PST ·
10 min read
Sakana AI released
Fugu and Fugu Ultra
this week, turning its multi-agent orchestration research into a commercial API after Anthropic said a US government directive forced it to suspend access to Claude Fable 5 and Claude Mythos 5. Sakana said Fugu Ultra scored 93.2 on LiveCodeBench, ahead of Fable 5's 89.8, and matched or beat several top models on science and software benchmarks. The Tokyo company is selling the service as one endpoint that can route work across a pool of models instead of tying a customer to one provider.
Anthropic announced on
June 12
that the US government, citing national security authorities, directed it to suspend access to Fable 5 and Mythos 5 by foreign nationals, including Anthropic employees. The company said it had to disable the models for customers to comply, while access to other Anthropic models would remain unaffected. Sakana co-founder and Chief Executive David Ha framed that disruption as the commercial opening for Fugu.
"Relying on a single company's model for national infrastructure is a massive risk," Ha wrote on X, according to VentureBeat. "Fugu simply routes around vendor restrictions by relying on an entirely swappable agent pool."
Key Takeaways
Sakana AI released Fugu and Fugu Ultra as one API for multi-model orchestration.
Fugu Ultra scored 93.2 on LiveCodeBench, ahead of Claude Fable 5 at 89.8.
The service starts at $5 per million input tokens and $30 per million output tokens.
Critics say Fugu adds another black box because users cannot see which models handle each task.
AI-generated summary, reviewed by an editor.
More on our AI guidelines
.
Sakana posts 93.2 on LiveCodeBench
Sakana describes Fugu as a language model trained to call other language models, including instances of itself, and to decide when to delegate, verify and combine work. The company said the system builds on two ICLR 2026 papers, TRINITY and Conductor, which trained coordinator models to assign tasks to specialized agents instead of using fixed workflows.
The benchmark claims are the center of the launch. Sakana said Fugu Ultra scored 73.7 on SWE-Bench Pro, ahead of Anthropic's Claude Opus 4.8 at 69.2 and OpenAI's GPT-5.5 at 58.6, while trailing the restricted Fable 5 score of 80.0. On GPQA-Diamond, Fugu and Fugu Ultra each scored 95.5, above the 94.6 Sakana attributed to Mythos Preview.
The scores come with a caveat Sakana itself notes. Fable 5 and Mythos Preview are not in Fugu's agent pool because they are not publicly accessible, and Sakana has not disclosed which models Fugu uses for a given request. The Verge's Richard Lawler noted that the pitch amounts to using other frontier models more carefully, while leaving customers without a view into which model performed which part of the work.
Fugu Ultra starts at $5 per million input tokens
Sakana is offering two versions. Fugu is aimed at coding, chat and lower-latency work; Fugu Ultra is aimed at harder tasks such as AI research, paper reproduction, cybersecurity assessment and patent search. Both are available through an OpenAI-compatible API.
Fugu Ultra starts at $5 per million input tokens and $30 per million output tokens, with cached input priced at 50 cents per million tokens, according to Sakana's documentation cited by VentureBeat. For contexts above 272,000 tokens, the Ultra rate rises to $10 per million input tokens, $45 per million output tokens and $1 per million cached input tokens.
The standard Fugu service uses variable pricing based on the highest-tier underlying model activated for a request, rather than stacking charges for every agent in the workflow. Sakana also says enterprise users can exclude specific providers or models from the routing pool and can opt out of prompt use for future training. The service is not available in the EU or EEA while the company works through data compliance issues.
Get Implicator.ai in your inbox
Strategic AI news from San Francisco. No hype, no "AI will change everything" throat clearing. Just what moved, who won, and why it matters. Daily at 6am PST.
Email address
Subscribe
Check your inbox. Click the link to confirm.
No spam. Unsubscribe anytime.
Critics point to the black box
Sakana said nearly 500 beta users tested Fugu before launch, with reported uses in code review, security assessment, patent search and automated research. OfficeChai cited an AutoResearch run in which Fugu Ultra ran 123 training experiments over 14 hours on one H100 GPU.
Know someone who'd find this useful?
✉️ Email it to a friend in one click
, or they can
subscribe free here
.
Outside testers have reported mixed results. VentureBeat cited Mark Santos of Mark Studios, who compared Fugu Ultra and Claude Opus 4.8 on a Three.js game build. Santos said Fugu Ultra finished in 22 minutes, used about 89,000 tokens and cost roughly $7.32, while Opus took 79 minutes, used about 940,000 tokens and cost nearly $37.85. He still judged Opus better on final application design and function.
Elie Bakouch, a research engineer at Prime Intellect, objected to Sakana's sovereignty framing. "This is a closed source orchestrator on top of closed source models," he wrote on X, according to VentureBeat. "If before you didn't control the models, now you don't even control which ones are used or how much."
Sakana's next test is adoption rather than another benchmark. The company says it will add open models and its own models to the pool over time, and the commercial version is now generally available outside the restricted European regions. Customers weighing Fugu will have to decide whether one more black box is an acceptable price for less dependence on any single model provider.
Frequently Asked Questions
What is Sakana Fugu?
Sakana Fugu is a commercial API from Sakana AI that coordinates multiple language models behind one OpenAI-compatible endpoint. The system decides when to delegate, verify and combine work across its model pool.
How did Fugu Ultra perform on LiveCodeBench?
Sakana said Fugu Ultra scored 93.2 on LiveCodeBench, while standard Fugu scored 92.9 and Anthropic's Claude Fable 5 scored 89.8 on the same coding benchmark.
Why does the Anthropic directive matter?
Anthropic said on June 12 that a US government directive required it to suspend Fable 5 and Mythos 5 access for foreign nationals and disable the models for customers to comply.
How much does Fugu Ultra cost?
Fugu Ultra starts at $5 per million input tokens and $30 per million output tokens. For contexts above 272,000 tokens, the rate rises to $10 input and $45 output per million tokens.
What is the main criticism of Fugu?
Critics note that Fugu is proprietary and does not disclose which underlying models handle a request. That can reduce dependence on one vendor while adding a new black-box layer.
AI-generated summary, reviewed by an editor.
More on our AI guidelines
.
AI Models Working in Concert Outperform Solo Systems by 30 Percent, Sakana Study Finds
Japanese researchers prove AI models work better as teams than alone, boosting performance 30%. TreeQuest lets companies mix different AI providers instead of relying on one.
The Implicator
OpenClaw Creator Says Anthropic Is Pushing Developers Off Claude Subscriptions
OpenClaw creator Peter Steinberger says Anthropic is pushing developers off Claude consumer subscriptions and toward API keys.
The Implicator
You are Managing Five Expensive AI Interns
Anthropic multi-agent Claude Code lets developers run several assistants at once. The token bills tell a different story about who benefits.
The Implicator
AI News
Share
Copy link
X / Twitter
LinkedIn
Email
Marcus Schuler
San Francisco
Editor-in-Chief and founder of Implicator.ai. Former ARD correspondent and senior broadcast journalist with 10+ years covering tech. Writes daily briefings on policy and market developments. Based in San Francisco.
E-mail: editor@implicator.ai
The Morning Briefing
Get the Morning Briefing in your inbox.
Sign up to our free daily morning newsletter and free member articles. Only our special weekly Pro Briefing is available for $8/month.
Sign Up Free
Related Stories
AI News
Samsung and SK Hynix Plan $590 Billion South Korea Chip Buildout
Marcus Schuler ·
Jun 29, 2026
AI News
OpenAI Restricts GPT-5.6 Release to Government-Approved Partners
Marcus Schuler ·
Jun 27, 2026
AI News
OpenAI Leans Toward 2027 IPO as SoftBank and AI Stocks Slide
Marcus Schuler ·
Jun 26, 2026
ESC
The AI Briefing
Join Free
