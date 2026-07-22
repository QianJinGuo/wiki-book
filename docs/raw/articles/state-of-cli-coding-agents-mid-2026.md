---
source: newsletter
source_url: https://blog.arcbjorn.com/state-of-cli-coding-agents-2026
ingested: 2026-07-08
sha256: f49a1c1ec80b1a1846b3069def790ef8ce1c3f69586e4f97b33345014e3b2806
---

# State of CLI Coding Agents, Mid-2026

The terminal was an unlikely winner. In 2024 the bet was on IDEs — Copilot already lived in the editor, Cursor was climbing, and "agent" still meant chat with shell access bolted on. By mid-2026 the serious usage ran from CI, SSH, and machines with no GUI at all. Scriptable, boring, and the model never fights something else for the window manager.

35 actively maintained CLI coding agents as of July 3, 2026. Crowded field.

[Skip to feature by feature comparison](http://blog.arcbjorn.com/state-of-cli-coding-agents-2026#feature-by-feature) · [Skip to conclusions](http://blog.arcbjorn.com/state-of-cli-coding-agents-2026#where-to-start)

## Short history

The 1st wave arrived in 2023, before anyone called these things agents. [gptme](https://github.com/gptme/gptme) (March 2023) let a model run shell commands from the terminal. [Aider](https://github.com/Aider-AI/aider) (mid-2023) built AI pair programming around git, with atomic commits as the unit of change. [Open Interpreter](https://github.com/OpenInterpreter/open-interpreter) (July 2023) generalized the idea to controlling the whole computer. All 3 survive — gptme as a daemon, Aider as a pair programmer, Open Interpreter as a general computer controller.

Anthropic's [Claude Code](https://claude.com/pricing) research preview in February 2025 set the shape: agentic loop, file and shell tools, project memory file, permission prompts, plan mode, hooks, subagents. Everyone else cloned it. OpenAI shipped [Codex CLI](https://developers.openai.com/codex/changelog) in April 2025 (later rewritten in Rust). Google followed with [Gemini CLI](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/) in June 2025 and an aggressive free tier. By the 2nd half of 2025 the releases piled up in one quarter — Cursor, Amp, [Augment](https://www.augmentcode.com/product/cli), Factory, Charm, and 12 open-source teams.

Teams that standardized on Gemini CLI in 2025 still have configs from last fall. December 2025 is when the standards people showed up: the Linux Foundation formed the [Agentic AI Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) (AAIF), anchored by Anthropic's [Model Context Protocol](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-
