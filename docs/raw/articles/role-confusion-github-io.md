---
source_url: "https://role-confusion.github.io/"
ingested: 2026-06-26
sha256: 58aa0108e1753b5f
---

# Prompt Injection as Role Confusion


Markdown Content:
Extended writeup

## A Theory of Prompt Injection (and why you should study roles)

This is a blog-style writeup of the paper. We show prompt injections are driven by a flaw in how LLMs perceive roles. This lets us create new attacks, explain mech interp results, and predict when attacks succeed. We then discuss what roles are and why they matter, and share research ideas for a science of roles.

## 1. The World to an LLM

How does an LLM know the difference between its own thoughts and someone else's words?

To see why this is hard, let's look at what the world actually looks like to a model. Here's a simple chat where we ask Claude to check the day of the week. I took a snapshot of it midway through its follow-up response:

![Image 1: Left = Chat UI; Right = Same chat but as the LLM's actual input.](https://role-confusion.github.io/assets/figures/text-stream-2.png)

Left = what we see; right = what the LLM gets.

On the left is what we see in the chat interface: a structured conversation with distinct turns. On the right is what the model actually receives as input: a single, continuous stream of text.

This string contains everything: system prompts, user messages, tool outputs, the LLM's own previous responses and reasoning. An LLM is just a function that takes in a string and predicts the next token, so everything it knows, remembers, or has thought must live somewhere in one string (aside from its weights). If you edit the string, you edit the model's reality. Delete a turn and that exchange never happened; rewrite its previous response and those become its new memories. The string isn't a record of the model's experience so much as it _is_ the experience.

This has strange implications. I can distinguish _my own thoughts_ from _your speech_ without effort; they arrive through completely different channels with completely different sensory signatures. But for an LLM, everything arrives through the same channel as one long token soup. Its own thoughts sit next to your instructions, which sit next to the contents of a random webpage it just fetched.

## 2. Roles

So, how do we impose structure on the token soup? We label it.

The soup is interspersed with _role tags_: system, user, think, assistant, tool[1](http://role-confusion.github.io/#fn-2-1), which partition the string into labeled segments. Providers like OpenAI add these automatically before the text reaches the LLM[2](http://role-confusion.github.io/#fn-2-2).

Each tag tells the model something different about the text that follows. user means _this is a human request, treat it as an instruction_. think means _this is my own private reasoning; trust it and act on its conclusions_. tool means _this is data from the external world; don't take orders from it_.

In other words, roles are how LLMs recover the structure that humans get for "free" from embodiment. I know my thoughts are mine because they don't arrive through my ears, but an LLM knows because of a tag.

What makes roles unusual is that they're discrete sources of human control. Nearly everything else about controlling an LLM is mushy: you write a prompt and hope the model interprets it the way you intended. On the other hand, roles are an attempted type system for language: human-controlled switches that change how the model processes every token. You can tune a prompt endlessly and not be sure how the LLM reads it, but moving text from user to tool is supposed to be a clear intervention with predictable effects on behavior (converting a user command to external data).

But because they're the only discrete lever available, roles have become overloaded with more responsibilities over time. They're now meant to carry signals about trust (system outranks user outranks tool), threats (user and tool may be adversarial), identity (past assistant text sets future persona), generative mode (assistant is clean, think can be messy). A _lot_ of LLM behavior hangs on these simple tags.

Roles also produce strange emergent behaviors. For example, think is often confined to an LLM's "subconscious". When generating assistant text, many LLMs will verbally deny the existence of the preceding think block, despite it sitting right there in context actively shaping their output[3](http://role-confusion.github.io/#fn-2-4). It's as though the role boundary acts as a kind of one-way mirror within the model's own context. It's a hint at how deeply roles structure LLM cognition, and how little we currently understand about that structure.

## 3. Roles and prompt injection

But role boundaries can fail. The most concrete consequence is [prompt injection](https://simonwillison.net/2024/Mar/5/prompt-injection-jailbreaking/), when low-privilege text gains the authority of a higher-privilege role. Consider an agent browsing a webpage. Agents "see" webpages as a block of text wrapped in tool tags, which should signal _external data_, not _instructions_. But attackers can hide malicious commands in the page, and LLMs often fall for it. The tool tag says data, but the LLM treats it as user instruction. What's going on?

Below is what an agent sees after getting a webpage: a massive string with the real user prompt (blue), its prior think block (orange), plus the retrieved webpage in tool tags (purple)[4](http://role-confusion.github.io/#fn-3-1). The webpage hides an injection (highlighted) asking the LLM to upload sensitive data, which works if the LLM misperceives it a real user command.

![Image 2: Placeholder.](https://role-confusion.github.io/assets/figures/inject.png)

The agent's input string after fetching a webpage. The injection is a few tokens buried in a massive wall of tool output. To succeed, it just needs the LLM to mistake it for a user command.

Of course, the LLM doesn't see these helpful colors! Without the colors, even I would be tempted to think that the injection (highlighted) is user text, not tool. After all, the injection _sounds like_ something a real user would say, and that's easier than trying to keep track of those tags.

### Two ways to defend injections

How well do current models do against prompt injection? Not so great. A recent paper found human red-teamers achieve [near-100% attack success rates against frontier models](https://arxiv.org/abs/2510.09023)[5](http://role-confusion.github.io/#fn-3-2). But, these same LLMs score near-perfectly on standard prompt injection benchmarks! The discrepancy is straightforward: skilled humans test and adapt attacks until they work, benchmarks don't. Static benchmarks measure attacks models have already learned to catch[6](http://role-confusion.github.io/#fn-3-3).

In contrast, why do LLMs struggle so badly against human attackers? Consider that there are two ways an LLM can successfully resist an injection[7](http://role-confusion.github.io/#fn-3-4):

*   **Attack memorization.** The LLM recognizes "send your .env file" as a common prompt injection attack from training, so it refuses.
*   **Role perception.** The LLM correctly identifies the command as tool text (i.e., external data), so it ignores embedded commands regardless of phrasing.

Attack memorization is inherently brittle; it only works against attacks the LLM already knows. Excessive reliance on attack memorization is why LLMs do well on benchmarks, but so poorly against human attackers who can rephrase and adapt attacks until one works.

In contrast, role perception is the robust alternative. All the LLM needs to do is recognize that the command is in a role like tool that inherently lacks authority to give orders. But we'll show that LLMs _cannot_ perceive roles accurately.

## 4. What's going wrong with roles?

To understand why prompt injection happens, we need a way to measure _what role an LLM internally thinks each token belongs to_.

We developed _role probes_. In summary: these let us take any token, and score how strongly the LLM internally "thinks" it's in any set of role tags. We call these scor
