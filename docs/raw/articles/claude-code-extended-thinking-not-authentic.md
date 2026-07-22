---
source_url: "https://patrickmccanna.net/the-text-in-claude-codes-extended-thinking-output-is-not-authentic""
ingested: 2026-06-26
sha256: d37d17b3047e231e
---

# The text in Claude Code’s “Extended Thinking” output is not authentic. – blog


Markdown Content:
Claude Code records each session to disk. Those logs include “thinking blocks” — the model’s own reasoning as it works.

I went to inspect that reasoning this weekend and found a `signature` (600 characters long) and no text.

So I read the docs: [https://platform.claude.com/docs/en/build-with-claude/extended-thinking](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)

Some details worth being aware of:

*   Claude encrypts its reasoning into that signature.
*   Anthropic holds the key. Your machine doesn’t receive it.
*   The API hands back a SUMMARY of reasoning, NOT the reasoning itself.
*   Getting the full thinking output requires an enterprise agreement.

[Matt Green looked into this and has some more detailed observations on the signature blocks.](https://blog.cryptographyengineering.com/2026/05/29/fooling-around-with-encrypted-reasoning-blobs/)

This is worth knowing before you promise anyone an audit trail. Also- BEWARE: T[he “extended-thinking” output from ctrl+o is a summary of Fable/Opus’ thinking.](https://platform.claude.com/docs/en/build-with-claude/extended-thinking#summarized-thinking) It isn’t the actual thinking that drove the model’s actions in a session- but a summary of the thinking logic. This is like saving a bmp as a .jpeg and then editing the .jpeg and saving it back as a .bmp. The conversion produces data loss. [edit: I originally had the order inverted, which triggered some HN readers. Apologies!]

I’m underwhelmed by how Anthropic is presenting the behavior of their application. If you ever need a record of the logic a used by YOUR AGENT during a session:

*   you can’t produce the logic using the local files. The reasoning logs on your system are not accessible to you.
*   You can log the inputs, the outputs, and the actions of a running Claude code with some scrappy scraping- but even then- it’s not the actual reasoning that drove the agent’s behavior.

And the language in the docs is awfully indirect. If you haven’t had your coffee, you might miss that “extended thinking returns a summary of Claude’s full thinking process”

![Image 1](https://i0.wp.com/patrickmccanna.net/wp-content/uploads/2026/06/IMG_0730.jpeg?resize=740%2C147&ssl=1)

Screenshot

Performance improvements in Open Source models need to come faster.

