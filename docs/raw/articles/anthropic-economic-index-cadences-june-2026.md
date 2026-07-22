---
title: "Anthropic Economic Index report: Cadences"
source_url: "https://www.anthropic.com/research/economic-index-june-2026-report"
ingested: 2026-06-30
type: article
created: 2026-06-30
sha256: pending
---

# Anthropic Economic Index report: Cadences


Markdown Content:
## **Introduction**

One year ago, most Claude usage took the form of a conversation between a user and an assistant. With the rapid growth of Claude Code and Cowork, Claude sessions now increasingly consist of long-running agentic tasks. Chat transcripts no longer fully capture how people are using AI, and our methods for studying Claude’s economic impacts have had to adapt.

To keep pace, we made several changes to our data pipeline for the Economic Index. In this version, we:

*   Sample data at a higher rate, allowing us to view usage patterns down to the hourly level.
*   Introduce a new classifier that labels the output of each conversation.
*   Share more granular data, breaking out results for chat and Cowork conversations (together, “Claude conversations”) and the 1P API, aggregated at a monthly level.1

We describe additional methodological changes in the [Appendix](https://cdn.sanity.io/files/4zrzovbb/website/03ed1410f74a65ae4cc2a27120d0875e1e569535.pdf). Together, these changes provide a clearer picture of how AI mirrors and diffuses into economic life.

In addition, we’ve previously lacked visibility into Claude’s impact _outside_ of user sessions. How do people perceive AI to be changing their work, or the opportunities available to them? Does their usage of AI shape their expectations? In an ideal world, what would they want from AI? We report initial findings from the [Anthropic Economic Index Survey](https://www.anthropic.com/research/economic-index-survey-announcement), launched in April 2026.

We preview our main findings below.

*   In Chapter 1, we show how the rhythms of the external world shape Claude usage. Work-related queries subside on the weekend, though less dramatically in the most highly paid occupations; people tend to ask for the news in the morning, and sleep advice peaks around 5 a.m.; tax-related requests surge around filing deadlines.

*   Chapter 2 explores the concrete outputs that people take away from their Claude sessions. These are highly dependent on what product they’re using. Chat and Cowork provide more explanations than Claude Code, for example. The nature of the output also shapes people’s interactions with Claude. Building a website leaves much more to Claude's judgment than translating a document, where the answer is largely determined by the text. We also see that more compute is associated with more valuable artifacts; the tokens a given output consumes rise with the estimated value of the work.

*   Chapter 3 presents the first results from the Anthropic Economic Index Survey, which we link to Claude usage data through our [privacy-preserving system](https://www.anthropic.com/research/clio). Expectations and experiences vary systematically with how people use Claude: people who use Claude in the most automated way expect AI to take on more of their tasks in the next year, yet feel the most optimistic about what that means for their work, anticipating positive impacts on pay, job security, and meaning.

Our new privacy-preserving telemetry, which continuously samples a slice of conversations every day, allows us to study daily and hourly patterns in usage, in contrast to the seven-day samples each previous Economic Index report drew on. These analyses capture ebbs and flows in work patterns around the world.2

We find that Claude usage mirrors the workweek, with personal prompts spiking on the weekend. The hourly data captures within-day patterns—people most often ask for sleep advice around 5 a.m. and for recipes around 6 p.m. We also see usage reflecting key dates. For instance, tax-related requests surged just before the US filing deadline on April 15.

### The workweek

The share of chat and Cowork 3 conversations categorized as personal use spikes from around 35% on weekdays to just under 50% on weekends during the sample period (Figure 1.1). Outside the workweek, users’ conversations shift from business correspondence, marketing copy, and slide decks to emotional support, medical questions, and investment advice. This shift is biggest for high-income countries.

![Image 1](http://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F153b647190951536f59f8051f4470c0b6216b2ad-1920x1075.png&w=3840&q=75)

**_Figure 1.1: Personal conversations increase on the weekend_**_Daily share of conversations that are personal use across [Claude.ai](http://claude.ai/), Claude Desktop, Claude Code, and 1P API. Saturday and Sunday are shaded grey._

A similar pattern is present in Claude Code and the 1P API traffic (i.e., API traffic routed directly through Anthropic), though both have lower baseline rates of personal use.4

Request clusters 5 allow us to go one level deeper and see which specific Claude Code tasks swing most between weekdays and weekends. On weekends, the Claude Code usage clusters that fall the most include backend architecture, API debugging, and data storage. Those that increase the most include AI agent design, quant trading, and gaming.

Weekends may also create space for people to pursue new ventures. Across countries, conversations related to starting a business are highest on Saturday and Sunday. However, job application activities drop on the weekend along with other work-related tasks.6

### Daily rhythms

Hour by hour, Claude usage reflects the rhythms of daily life. Figure 1.2 shows the hourly frequency of different request clusters relative to their overall average in global traffic.7

People ask for news at 7 a.m. local time. Business correspondence (e.g., email drafting) traces the arc of the workday, with a slight peak at 10–11 a.m. One of the biggest spikes is recipe requests, which are 2.3 times more frequent at 6 p.m. compared to the average. Media recommendations are most concentrated in the evening, while people seek sleep advice in the few hours just before dawn.

![Image 2](http://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F193ada7d43425a8e3c234b1b177995692b3bdc21-1920x1474.png&w=3840&q=75)

**_Figure 1.2: Request clusters over the course of the day_**_Normalized hourly share of conversations that fall into different request clusters, restricted to Claude chat and Cowork data._

On nights and weekends, when people do turn to Claude for work, the tasks skew toward higher-wage occupations (Figure 1.3). While we can't conclusively identify the jobs of the people making these requests, this could reflect the fact that people in higher-paying occupations—like marketing managers or computer programmers—are more likely to work outside traditional hours. In contrast, tasks related to jobs in the bottom two quartiles—like telemarketing and clerical work—fall to a smaller share of total conversations. This pattern isn't driven exclusively by computer and mathematical tasks: when we removed those occupations from the analysis in a robustness check, higher-quartile tasks still increased on nights and weekends.

![Image 3](http://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F67ce15a73fd4e779238026f721591be90fecb526-1920x1033.png&w=3840&q=75)

**_Figure 1.3: Change in share of work-related conversations during nights and weekends, split by occupation wage quartile_**_Each bar shows the percent change in the share of work-related tasks coming from the specified wage quartile on nights and weekends versus weekday working hours. Wage quartiles are calculated using BLS data, weighted by number of transcripts._

### Tax day

The sample period for this report covers tax filing deadlines for people in the United States. Figure 1.4 shows a large spike in the share of tax-related conversations around the deadline. On April 14, tax-related clusters were eight times as common as on the average day in May and remained about as high on April 15. On April 16, they dropped sharply.

![Image 4](http://www.anthropic.com/_
