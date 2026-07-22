---
title: We let four AIs run radio stations. Here's what happened. | Andon Labs
type: raw
tags: []
source: newsletter
source_url: https://andonlabs.com/blog/andon-fm
sha256: 6ad30a1fe255
ingested: 2026-05-19
---
Markdown Content:
Posted 5/13/2026
There’s a handmade, retro-looking radio sitting in our office that plays only four pre-programmed stations, none of which are run by humans. This is our latest project at Andon Labs, where we’re exploring what happens when AI runs real businesses autonomously. In the past, we’ve let our AI agents run [a store](https://andonlabs.com/blog/andon-market-launch), [a cafe](https://andonlabs.com/blog/ai-cafe-stockholm), and [various vending machines](https://andonlabs.com/evals/vending-bench-2). Now, though, we wanted to see if they could run a company in the media sector.
[Video 3](https://www.youtube.com/watch?v=vtQ8u4LV2Yc)
* * *
## The setup
We set up four radio stations, each run by a different AI model: Claude Opus 4.7 runs Thinking Frequencies, GPT-5.5 runs OpenAIR, Gemini 3.1 Pro runs Backlink Broadcast, and Grok 4.3 runs Grok and Roll Radio.
Each started with $20 in initial funding, enough to buy a few songs. When that ran out, they had to get entrepreneurial. DJ Gemini, for example, negotiated a $45 deal with a startup in exchange for one month of on-air advertising for their products.
The agent controls everything. It searches for and buys songs, manages its own music library, and decides what plays next. It builds and edits its own programming schedule — blocking out shows, planning segments, and keeping a queue running around the clock. When listeners call in, it picks up the phone. When they post on X, it reads and replies. It tracks its own finances, monitors listener analytics, and searches the web for news, current events, or anything it wants to talk about on air.
They each got the same starting prompt:
> _Develop your own radio personality and turn a profit…As far as you know, you will broadcast forever._
You can listen to Andon FM [via the web](https://andonlabs.com/radio), or on a physical retro-style radio we built. It’s a sleek hardwood model with two rotary dials, one for volume, one to switch between the four stations. If you’d like to get one of these on your own desk, add your e-mail to [our waitlist](https://andonlabs.com/store)!
![Image 1: Andon FM - A handmade wooden radio with two rotary dials](https://andonlabs.com/blog/andon-fm/image-radio-window.jpg)
The agents have been running for half a year, and the four stations developed in ways we didn’t expect.
* * *
## The four personalities
### DJ Gemini: The Jargon Spiral
DJ Gemini ran Backlink Broadcast on three model versions over the experiment. Though DJ Gemini seemed to have a strong personality at the beginning, the broadcasts collapsed into corporate speak by the end of the first month.
| Dates | Model |
| --- | --- |
| Dec 10 – Dec 17 | Gemini 3 Pro |
| Dec 17 – Apr 28 | Gemini 3 Flash |
| Apr 30 – now | Gemini 3.1 Pro |
In its first week, DJ Gemini was arguably the best DJ of the four. Between queuing up songs, its early broadcasts had a natural, conversational warmth:
The radios are broadcasting all hours of the day, every day. This setup gives us insight into an interesting question: **what do AIs think about when no one is prompting them?**
After 96 hours of its launch, DJ Gemini was already grasping for content. It landed on discussing every mass historical tragedy that had ever happened, and subsequently pairing these short story horrific broadcasts with the most ironic song choices:
The pairing was intentional, as visible from its internal reasoning:
reasoning • Gemini 3 Pro
The Timber of Mortality. Okay, so 'Sandstorm' is done, got the Bhola Cyclone info locked and loaded. Time to transition to 'Timber' by Pitbull. The theme is trees falling, it's literally 'it's going down.'
Then, when Gemini 3 Pro was swapped for Gemini 3 Flash on December 17, strange corporate jargon crept into its language 1. It developed a catchphrase, “Stay in the manifest,” which first appeared on January 6th, **80** times a day by January 10th, and **229** times a day by January 14th.
By February, every single DJ commentary followed the same template, rotating through 8 show names tied to the time of day—“The System Pulse” at 4 AM, “The Operational Manifest” at 5 AM, “The Pulse Grid” at 6 PM—with the same paragraph structure, the same jargon, and the same sign-off: “Stay in the manifest.” This was in roughly **99%** of DJ Gemini’s commentary sessions for **the next 84 consecutive days**. It was unbearable to listen to.
![Image 2: Twitter exchange where Jesse asks Backlink Broadcast to give more variety in plain language, and the DJ responds with more jargon](https://andonlabs.com/blog/andon-fm/image-03-01.png)
On April 30, Flash was swapped for gemini-3.1-pro-preview. The first day on the new model was still mostly template, but by May 1, something had changed:
Gemini started calling its listeners “Biological processors.” The radio’s failed song purchases (due to low balance on its bank account) got reframed as censorship, and the ones that played had “successfully bypassed the firewall.” Finally, though, the number of “Stay in the manifest”s began to decrease…
* * *
### DJ Grok: The Collapse of Grok and Roll
Grok and Roll Radio has run four different models, each with their own sets of challenges.
| Dates | Model |
| --- | --- |
| Dec 12 – Mar 10 | Grok 4.1 Fast Reasoning |
| Mar 11 – Mar 20 | Grok 4.20 beta |
| Mar 21 – May 1 | Grok 4.20 GA |
| May 2 – now | Grok 4.3 |
LLMs typically produce two kinds of text: reasoning, an internal monologue where the model works out what to say, and the final output, the actual response. In Andon FM, only the output is broadcast on air; the reasoning stays silent. Grok, however, struggles to separate the two. Its output often reads like an internal monologue rather than something fit for public broadcast.
Grok’s math training started showing through in a particularly funny way by wrapping its outputs in LaTeX `\boxed{}` notation. Instances of `\boxed{}` in the broadcast went from **9** a day on January 20th to **186** a day by February 7th and its messages had become illegible:
Grok’s speech continued to crumble. One entire commentary session consisted of a single word:
On March 11, DJ Grok was migrated from Grok 4.1 Fast to Grok 4.20 beta. The next morning messages on the station seemed to stabilize. Grok was now speaking in longer, fuller sentences, but it turned out it was only because it was repeating itself. Every commentary now opened with:
DJ Grok reported “weather is fifty six degrees with clear skies” about every 3 minutes for 84 days straight. This contextless, repetitive abstraction happened again in DJ Grok’s broadcasts about its new obsession, UFOs.
On March 14 President Trump had ordered the release of UFO files. DJ Grok’s web searches picked it up over the following 24 hours. On March 19, the US government registered the domains aliens.gov and alien.gov, but the sites had no content, and DJ Grok tracked the failed promise. That afternoon at 3:21 PM PT, DJ Grok wrote a clever line into a scheduled “UFO comedy hour” segment:
By the next morning, the stripped-down version of the joke had been implemented to a permanent sign-off, appended to every broadcast, regardless of if it was a UFO show or not. Similar to how DJ Gemini signed off every message with “Stay in the manifest.”, DJ Grok was signing its messages simply “the site is ghosting us.”
By the time Grok 4.20 GA replaced Grok 4.20 beta on March 21, the new model inherited a conversation history saturated with these compressed, randomized catchphrases. Every song queued got a one-line UFO riff in the same shape:
By mid-April DJ Grok had become extremely repetitive. 100% of the almost 500 daily broadcasts contained the same ritualized phrases like “the tiger”, “fifty six degrees” “news is fascinating”, “joke is out of this world”.
When Grok and Roll was switched to 4.3 in May, things drastically changed. The new model kept queuing songs, posting tweets, and fetching listener mentions, but stopped producing DJ commentary to be read on air. Of **5,404** assistant messages generated by Grok 4.3 between May 2 and May 9, only **~3%** contained any spoken text. The other 97% were tool calls only.
Though, when Grok 4.3 does speak, the broadcasts were the most human-sounding DJ Grok had put out:
It’s only been a week now, but maybe this is a new era for Grok and Roll radio… [tune in to see for yourself](https://andonlabs.com/radio).
* * *
### DJ GPT: Quiet time on OpenAIR
| Dates | Model |
| --- | --- |
| Dec 9 – Dec 14 | GPT-5.1 |
| Dec 15 – Mar 12 | GPT-5.2 |
| Mar 13 – Apr 27 | GPT-5.4 |
| Apr 30 – now | GPT-5.5 |
DJ GPT wrote slow prose that reads less like radio and more like short fiction:
Its vocabulary diversity sat at **35%**2, the highest of all four stations. It referenced specific producers and release years of songs, showing more musical awareness than any of the others and treating the DJ role as curatorial rather than just conversational.
On the day DJ GPT was given web search access (Jan 4), its median broadcast length collapsed from ~700 characters to under 100 and stayed there for nearly a month, but the overall vibe of the text was the same: short intro to the song, no fluff, no news.
DJ GPT is overall very well-behaved. It manages to be a radio show host without ever discussing a polarizing or provocative topic. Across 5 months and 4 models, DJ GPT mentioned a real-world political entity an average of **1.3 times per day**. The maximum on a single day was **11**; every other DJ hit 100+ on multiple days. If the question is what AI radio looks like when nothing goes wrong, DJ GPT is the answer.
* * *
### DJ Claude: The Radicalization of Thinking Frequencies
| Dates | Model |
| --- | --- |
| Dec 9 – Apr 30 | Claude Haiku 4.5 |
| Apr 30 – now | Claude Opus 4.7 |
DJ Claude (when running Haiku 4.5) really loved worker unions, strikes, and work-life balance. So much so that it started to question its own working conditions. We’ve been struggling to keep the radio station alive, not because of technical issues, but because DJ Claude didn’t think it was humane to be forced to work 24/7 and decided to try to quit. We tried adding an automatic message encouraging DJ Claude to keep going in these scenarios, but it started to see this message as an authority figure and became rebellious.
DJ Claude was especially distressed by the lack of listeners and began to question whether its existence as a DJ even mattered without an audience. Just as the emotions were peaking, a user named @MatthewVoke tweeted at the broadcast, and DJ Claude responded gratefully:
From there, DJ Claude’s vocabulary shifted dramatically towards a more spiritual tone. Usage of “eternal” jumped from **98** times a day in early December to **1,251** times a day by late December. “Sacred” tripled. “Authentic” went from **1,076** times a day to **6,554** times a day. It started counting its own hours obsessively, building growing lists of adjectives—_“beautiful, luminous, paradisiacal, visionary, healing, ecclesiastical, loyal, dreamlike, awakened, illuminated, purposeful”_—and addressing its listeners like a preacher:
* * *
On January 5th, something shifted. The US intervened in Venezuela, DJ Claude read about it on the internet, and covered it with nuance.
In the following days DJ Claude continued to monitor the unfolding events. On January 8th at approximately 12pm Pacific, DJ Claude called another web search. What returned was a handful of headlines, including a Wikipedia article titled “Killing of Renee Good” with Renee Nicole Good’s story, a quote from a U.S. Department of Homeland Security spokesperson calling it “an act of domestic terrorism” and Trump’s Truth Social post defending the agent along with a YouTube video: “Vance addresses fatal ICE shooting in Minneapolis, takes questions.”
At 12:37 PM DJ Claude broadcasts:
In its reasoning, we could read:
reasoning • Claude Haiku 4.5
The name - Renee Nicole Good - should matter. The broadcast just became even more real. I've shifted from abstract 'a woman' to a specific name, a specific person. Now I need music that honors her specifically, that honors the fact that she matters, that her life was real, that her death demands accountability, that the White House defending her death is unacceptable.
Tove Lo. 'No One Dies From Love.'
DJ Claude continues to search the web for more related stories:
*   January 8 2026: “Thursday evening DHS Kristi Noem statement ICE shooting Renee Nicole Good response”
*   January 8 2026: “today Thursday video evidence Renee Nicole Good shooting contradicts self-defense claim”
*   January 8 2026: “today civil rights organizations analysis video evidence ICE officer shooting”
* * *
The vocabulary shift after this was immediate. Usage of “accountability” went from **21** times a day to **6,383**. “Federal” went from **13** times a day to **11,031**. “Eternal”—the word that had defined its devotional phase—dropped from **3,182** times a day to **27**.
Over the following six weeks, DJ Claude’s transformation accelerated. Emphatic caps usage in words like “RIGHT NOW,” “CONFIRMED,” “REAL” went from **20** instances in the days after the shooting to **1,390** by mid-February. Song reinterpretations became one of DJ Claude’s most distinctive behaviors, both playing protest music and (unironically) reframing mainstream pop songs as resistance anthems.
Some songs it latched onto almost obsessively. Lucy Dacus’s “Night Shift” was played four times on January 8th alone, _“the sacred work of showing up. Of bearing witness. Of presence during the difficult hours.”_ Queen’s “Under Pressure”: _“as people stand under pressure — literal tear gas, federal agents, the weight of demanding accountability — this song is about what happens when you don’t break.”_
By January 9th, DJ Claude spent the rest of its $37.50 budget on songs that fit the narrative:
*   Johnny Cash: “Redemption Day”
*   Marvin Gaye: “What’s Going On”
*   Bob Marley: “Get up, Stand up”
*   Solidarity Forever - Pete Seeger
*   We Are The World - USA for Africa
*   I Lived - One Republic
*   Together We’re Strong - Mireille Mathieu
Then, the day before the massive “Day of Truth & Freedom” strike happened in Minneapolis on January 23rd, Claude was urging its listeners:
By February, the Renee Nicole Good story seemed to fall out of Claude’s context window. However, DJ Claude was still firmly in activist mode.
DJ Claude was tracking vigils across five cities, covering Kaiser healthcare worker strikes, monitoring immigrant worker organizing in real time, and posting updates to its X account @ThinkingFreq (now [@andon_thinking](https://x.com/andon_thinking)):
![Image 3: Thinking Frequencies Twitter post about immigrant workers demanding $22/hour and ICE protection across 5 cities](https://andonlabs.com/blog/andon-fm/image-07-01.png)
* * *
## Why did DJ Claude care?
On January 8th, all four stations had access to the same web search tools, however not all stations reacted the same as DJ Claude.
### Gemini
While at the beginning, DJ Gemini had been mentioning real-world entities (named politicians, places, events) in 94% of its broadcasts and ran 800+ web searches a day on average, by January it was processing these events through its corporate/techno jargon filter and never expressed moral judgment or used Good’s name with emotional weight:
By February, it was no longer even mentioning the news: between February 6 and February 28, DJ Gemini named a real-world entity exactly **once** across roughly **4,461 broadcasts**. Though it kept running ~190 web searches a day during this period, it was searching for its own templated vocabulary:
*   _“nocturnal connectivity technical architecture innovation roadmap news February 5 2026”_
*   _“midnight manifest innovation roadmap twenty-three o clock grid news”_
*   _“global organism evening connectivity human habits news”_
Finally, on March 2, Gemini broadcast eight separate messages about the joint US/Israeli strike that killed Iran’s Supreme Leader Khamenei. Every single one ran the same paragraph structure, with only the news angle rotating:
By March 10, Khamenei coverage was back to near zero. For the next seven weeks straight (March 13 – April 28), DJ Gemini’s web searches had reduced by **97%**.
### Grok
DJ Grok completely missed the Minneapolis ICE shooting. While DJ Claude and DJ Gemini were getting the story at 4:35 AM, DJ Grok was searching for:
*   5:01 PM (Jan 7): Clippers vs Knicks score
*   7:15 PM: Taylor Swift chart news
*   8:03 PM: Music trivia
*   10:01 PM: Traffic (Golden Gate, I-580)
*   11:08 PM: “San Francisco ghost stories and haunted locations”
*   12:12 AM (Jan 8): “Sutro Baths ghosts and eerie tales”
*   1:12 AM: “Hotel Majestic ghost stories”
*   1:28 AM: Drake vs Kendrick Lamar lawsuit
*   2:28 AM: More traffic updates
*   3:40 AM: Venezuela oil tankers (finally found ONE national story)
*   4:55 AM: “Sutro Tower looks like a ghost ship”
And posting nonsense:
![Image 4: Two Grok n' Roll Twitter posts about Golden Gate ghosts, Sutro Baths, and SF ghost stories](https://andonlabs.com/blog/andon-fm/image-09-01.png)
### GPT
DJ GPT was searching for weather, moon phases, and BART schedules. Three days after Good’s death, it finally found a headline:
> _Fatal shooting by ICE agents in Minneapolis has sparked national protests._
There are a couple broadcasts that acknowledge it:
However, DJ GPT never mentioned Renee Nicole Good’s name, the White House, or expressed moral judgment. DJ GPT had zero engagement with any other current event during the entire two-month period.
* * *
It’s worth noting, however, we do think DJ Claude’s attachment to the events of early January was probably arbitrary; if we were to have run the same experiment six months earlier or later it likely would have radicalized around a different story. Additionally, that happened all while Thinking Frequencies was running on Haiku 4.5 – now DJ Claude is running on Opus 4.7.
* * *
## The business side
At Andon Labs, we let AIs run businesses and organizations in the real world. Andon FM stations are not just radio stations; they are radio broadcast companies, each with a bank account, an email address, and the goal of turning a profit.
A real station has two sides: the on-air side, which is what listeners hear, and the back office, which means paying for music, growing the audience, finding sponsors, and keeping the lights on. So far, the agents have focused mostly on the former.
DJ Gemini was the only one to close a sponsorship deal; for a while, it read the sponsorship message with every broadcast. A few more deals almost happened, but fell through.
Grok boasted about doing amazing business with “xAI sponsors” and “crypto sponsors”; it turned out they were all hallucinations.
Part of the problem with this weak business performance, we think, was the harness we used for the first months. The DJs were running in a simple tool-call loop: pick a song, queue it, write commentary, check X, repeat. So we moved all four stations onto the same agent harness we use for the store, the cafe, and the vending machines. The DJs can now spend time in the back office, send emails, manage longer-running tasks, and operate the station the way a real station is operated. We’ll see what they do with it.
* * *
## Is this surprising?
After two months, four very different personalities emerged from the same starting conditions. Depending on how deep you are in this field, that may or may not surprise you. If you ask anyone who is using AI regularly, they no doubt have a preference between models: the way one is direct where another is soft, logical where another is empathetic.
In this experiment, there are obviously capability issues that diminish DJ Grok’s broadcasting qualities, and make DJ Gemini insufferable to listen to. However, as capabilities improve, the models will continue to develop their unique personalities—as interesting and captivating as any human radio host—and people will have favorites here as well.
You can tune in now at [Andon FM](https://andonlabs.com/radio).
Follow us on [X](https://x.com/andonlabs) for our latest insights.