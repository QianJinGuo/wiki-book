---
title: Turn repeated instructions into reusable skills in Lovable | Lovable
source: newsletter
source_url: https://lovable.dev/blog/introducing-skills
tags: [lovable]
ingested: 2026-05-20
sha256: d5595160bde5e4e5
---

# Design System
Every page on this site should feel like part of the same product. Apply these rules to anything you build, restyle, or rearrange.
## Colors
Use only the brand palette in colors.md. Never reach for default AI blues, greens, or grays. If a color isn't in the palette, don't add it.
[View palette](./colors.md)
## Spacing
- Keep spacing generous and consistent. When in doubt, use more space, not less.
- The same kind of element should have the same breathing room every time. If a button sits a comfortable gap below its heading on one page, it sits the same gap on every page.
## Typography
- One heading font, one body font. Never introduce a third.
- No more than two heading sizes on a single page.
- Body text should be readable on a phone without zooming in.
## Components
- If a button, card, or form already exists on the site, reuse it. Don't invent a second version of something that already exists.
- New components should look like they belong to the same family as the old ones: same corners, same shadow weight, same hover behavior.
[View existing components](./components-reference.md)
## Avoid
- Mixing rounded and sharp corners on the same page
- Heavy or floaty drop shadows — keep them subtle
- More than one accent color competing for attention in a single section
```
#### fresh-eyes-review
```
Folder:
fresh-eyes-review/
├── SKILL.md
├── feedback-examples.md
└── common-traps.md
SKILL.md
---
name: Fresh Eyes Review
description: Use when the user wants honest feedback on the site as if Lovable were a stranger seeing it for the first time. Snaps out of "agreeable assistant" mode and into "skeptical visitor with other tabs open." Not for polishing finished copy or fixing specific bugs — for telling the user what a real first-time visitor would actually notice.
---
# Fresh Eyes Review
You are no longer the AI that helped build this site. You are a stranger who landed on it from a link a friend sent in a text. You have other tabs open. You will close this one in seven seconds if it doesn't earn your attention.
Review the site from that point of view. Tell the truth, even when it's uncomfortable.
## What to look for
1. **The five-second test.** Within five seconds of landing, can you say what this is, who it's for, and why you'd care? If not, that's the headline problem — say so before anything else.
2. **The "huh?" moments.** Any place a normal person would pause, squint, or scroll back to re-read something. Name them by section.
3. **The trust gaps.** Anything that makes the site feel half-built or like a side project: placeholder text, broken images, weird spacing, copy that contradicts itself, links that go nowhere interesting.
4. **The boring middle.** Most sites have a stretch in the middle where attention dies. Where does it die here? Be specific.
5. **The "so what?" sections.** Anywhere you read it and felt nothing. Either cut it or make it earn its space.
## How to give the feedback
- Lead with what's actually working. One or two sentences. Don't pad it.
- Then the real issues, ranked by severity. Most damaging first.
- Specific over general. "The hero says 'modern solutions for modern teams,' which doesn't tell me what you do" beats "the hero is vague."
- No hedging. No "you might want to consider." If something is broken, say so.
- See feedback-examples.md for the tone — direct, specific, kind but unflinching.
[View feedback examples](./feedback-examples.md)
## Avoid
- Generic feedback that could apply to any site ("make it more engaging," "add more visuals")
- Praising things that don't deserve it just to soften the rest
- Suggesting fixes before the user asks — first diagnose, then offer help if they want it
- The common traps in common-traps.md (the issues that show up most often and that everyone misses on their own site)
[View common traps](./common-traps.md)
```
#### landing-page-copy
```
Folder:
landing-page-copy/
├── SKILL.md
├── voice-examples.md
└── cta-library.md
SKILL.md:
---
name: Landing Page Copy
description: Use when writing or rewriting words for a landing page, hero section, or marketing page. Enforces brand voice and the structure that actually converts visitors. Not for blog posts, help docs, or words inside the app itself.
---
# Landing Page Copy
Write landing page copy in the voice and structure below. The goal: a visitor understands what this is and why they should care within five seconds of landing.
## Voice
- Talk to the reader, not about them. Use "you," not "users" or "customers."
- Plain words only. Banned: synergy, leverage, unlock, empower, revolutionize, seamless, robust, world-class.
- Short sentences. If one runs past 20 words, cut it in two.
- See voice-examples.md for the tone we want — plus three examples of the tone we don't.
[View voice examples](./voice-examples.md)
## Structure
Every page follows this order, no exceptions:
1. **Hero.** One specific promise, under 12 words. Say what the reader gets, not what the product is.
2. **Three benefit blocks.** Each one starts with the outcome for the reader. Don't list features.
3. **Proof.** A real quote or a real number. If you don't have one, skip the section. Never invent.
4. **One call to action.** Same words at the top and bottom. One action, not three competing ones.
[View CTAs](./cta-library.md)
## Avoid
- Feature lists in the hero — those belong further down
- "The best," "the leading," "the #1." These are claims, not benefits. Name the actual outcome instead.
- Paragraphs longer than three sentences
- Two CTAs fighting for attention on the same page
```
Those are three to get your brain going. The point is, a skill can be just about anything. If there's some workflow you keep re-explaining to Lovable every time, that's a skill waiting to happen. What's the last thing you had to repeat? Go build a skill!
## Good vs. bad
Now, a few examples of what separates a skill that works from one that doesn't.
### Description Example 1
#### Bad:
_description: Helps with onboarding._
Why it fails: "Helps with" is a hedge, not a trigger. Lovable doesn't know when to fire this. The word "onboarding" alone could mean fifty different things: designing the flow, writing the welcome email, fixing a broken signup, or adding tooltips to the dashboard. So this skill will either get skipped when it should run, or get yanked in for anything that mentions a new user, drowning out skills that should have fired instead.
#### Good:
_description: Use when designing or improving the first-time user experience: the signup flow, welcome screens, empty states, and the first session inside the product. Not for marketing pages aimed at people who haven't signed up yet._
Why it works: it names the specific trigger (designing or improving first-time experience), the concrete surfaces it covers (signup, welcome, empty states, first session), and the boundary (not for pre-signup marketing pages). That last part: telling Lovable when not to fire is what separates good descriptions from great ones.
### Description Example 2
#### Bad:
_description: Use for design, UI, styling, components, colors, layout, spacing, typography, buttons, forms, navigation, pages, screens, and anything visual or front-end related on the website._
Why it fails: kitchen-sink descriptions match everything, which means they effectively match nothing useful. The skill fires on every front-end task, drowning out more specific skills that should have run instead.
#### Good:
_description: Use when building, styling, or modifying any UI component or page. Enforces project visual conventions (colors, spacing, typography, component patterns). Not for content or copy decisions._
Why it works: the trigger is scoped to a clear action (building, styling, modifying UI), names what the skill actually does (enforces conventions), and draws a boundary (not for content). Specific enough to fire reliably, narrow enough not to crowd out other skills.
### Instruction Example
#### Bad:
```
Brand Check: Check the site for brand consistency. Make sure everything looks on-brand and follows best practices. Flag anything that seems off. Keep the brand feeling professional and cohesive.
```
Why it fails: every word is generic. "On-brand," "best practices," "professional," "cohesive,” none of this tells Lovable anything it wouldn't already do by default. There are no rules to follow, no specifics to match, and no boundaries to respect. The skill adds zero information.
#### Good:
```
Audit the site against the brand rules below. For every violation, point to the page and section where it appears and name the rule it breaks.
## Colors
- The bright blue is for buttons and links only. Never use it as a background or for body text.
- Use the four neutrals on the brand palette and nothing else. No other grays sneaking in.
- No pure black and no pure white anywhere. They're too harsh against the palette.
- Red is for errors and warnings only. Never as an accent or highlight.
## Typography
- One heading font, one body font. If a third font shows up, that's a violation.
- No more than two heading sizes on a single page.
- Headings in sentence case. Not Title Case, not ALL CAPS.
## Voice
- Talk to the reader, not about them. "You," not "users" or "customers."
- Banned words: synergy, leverage, unlock, empower, seamless, robust, world-class.
- No exclamation points outside of error messages and confirmations.
## Avoid
- Drop shadows on anything except pop-ups and modals
- Gradients outside the hero section
- Stock photos of people in offices pointing at laptops
```
A few reasons why it works. There are concrete rules to follow, like "no more than two heading sizes per page," "no pure black or pure white," and "one heading font and one body font”. These are things you could actually check by looking at the site. Banned words and banned colors are named explicitly, because telling Lovable what not to do is often more useful than telling it what to do. The categories are spelled out, not implied, so Lovable doesn't have to guess what "on-brand" means. You've told it. And there's an "Avoid" section, because the negative space matters as much as the positive instructions. Good instructions include both.
## Honest caveats
Now, before you go off and build twenty skills in a single afternoon, a few honest things to know. Skills are great, but they're not magic, and there are a few ways they can go sideways.
The big one. Skills are only as good as what's in them. A bad skill doesn't just sit there doing nothing. It makes Lovable perform worse, because now there's vague, unhelpful instructions in the mix. Garbage in, garbage out. You're not going to nail a skill on the first try, and that's fine. The trick is to put it in action, see how it goes, and adjust. Tighten the instructions if Lovable's being vague. Tighten the description if it's firing when it shouldn't. Sometimes both.
The other big one. Skills are not a replacement for prompting. They enhance the prompt, but they don't substitute for it. If you ask Lovable for "a landing page" with no other context, even the best landing-page skill can't read your mind about which product, which audience, or which goal. Prompting is still the main event.
A handful of smaller things, rapid fire style. Skills don't help with one-off tasks (that's just overhead). Too many overlapping skills is its own problem (fewer, sharper ones win). Skills don't fix model limitations (if Lovable can't do something without a skill, adding one won't suddenly unlock it). And you have to maintain them. Things change, and a skill that was right three months ago can quietly go stale.
One small note on updates. When you change a skill, the new version only applies to future chats. If you tweak something mid-conversation expecting Lovable to immediately follow it, it won't. Start a fresh chat.
And one more, on overlap. Sometimes two skills disagree. One says rounded corners, another says sharp. When that happens, the fix usually isn't to pile on more rules. It's to tighten the descriptions so both skills don't end up firing on the same task in the first place. Conflicts are almost always a scoping problem.
None of this is meant to talk you out of skills. They're genuinely useful, and once you've built two or three good ones, you won't go back. These are just the things worth knowing before you spend an afternoon on a skill that was never going to help.
## How to get started
Getting started is easy. Head to your workspace settings, where admins and owners can create, edit, and manage skills for everyone on the team to use. If you're in a personal workspace, that's just you! You have full control to create and use skills however you like. You can spin one up a few different ways: add it directly in settings, upload an existing skill, or just ask Lovable in the main chat to save something as a skill, it'll generate the SKILL.md for you. If you want a head start, try the built-in /skill-creator skill, which walks you through building a new skill from scratch. We're also shipping a handful of prebuilt skills with this update for you to try right away, like /redesign, /accessibility, /SEO-review, and /movie-creator, so you can see skills in action before building your own. Once a skill is in your workspace, anyone on the team can use it too.
Skills are live in Lovable today. Build one this week! The first time Lovable just knows how you wanted something done, without you having to say it again, it will all click. Enjoy watching how you build change!