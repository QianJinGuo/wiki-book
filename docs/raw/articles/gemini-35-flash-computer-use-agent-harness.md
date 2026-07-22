---
title: "Introducing computer use in Gemini 3.5 Flash"
source_url: "https://deepmind.google/blog/introducing-computer-use-in-gemini-3-5-flash/"
author: "Mateo Quiros"
published: "2026-06-24"
ingested: "2026-06-25"
sha256: "auto"
type: article
---

# Introducing computer use in Gemini 3.5 Flash

Computer use is now a built-in tool supported in Gemini 3.5 Flash, delivering our best performance yet for agentic computer use tasks. Previously only available as a standalone Gemini 2.5 computer use model, computer use is now integrated natively in the main Gemini Flash model. Gemini already excels at function calling and using built-in tools like Search and Maps grounding. With built-in computer use capability, developers can now use 3.5 Flash to reliably build custom agents that can see, reason and take action across browser, mobile and desktop environments. This unlocks improved performance for long-horizon and enterprise automation tasks like continuous software testing and knowledge work across professional applications.

Developers and enterprises can start using computer use in 3.5 Flash via the Gemini API and Gemini Enterprise Agent Platform.

3.5 Flash uses computer use to analyse the Gemini app and return a categorized list of features.

3.5 Flash with computer use audits its own documentation for accessibility issues.

## Making computer use safe in 3.5 Flash

To mitigate some of the prompt injection risks for agents operating in live environments, we use targeted adversarial training for computer use in Gemini 3.5 Flash. We're also releasing two optional enterprise safeguard systems that enable enterprises to:

- Require explicit user confirmation for sensitive or irreversible actions.
- Automatically stop tasks if an indirect prompt injection is identified.

Taking a "defense-in-depth" approach, we encourage developers to combine these features with secure sandboxing, human-in-the-loop verification and strict access controls. Additional information on safety measures can be found in our best practices documentation.

We are already seeing customers drive value with computer use. Here's what some of them have to say:

To start building with computer use today:

- Try it now: Test the capabilities in a demo environment hosted by Browserbase.
- Start building: Dive into our reference implementation and documentation via Gemini API and Gemini Enterprise Agent Platform.
