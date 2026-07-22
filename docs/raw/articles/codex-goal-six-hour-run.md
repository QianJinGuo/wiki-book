---
tags: [wechat, article, claude, openai]
title: "codex goal six hour run"
type: raw
url: https://tectontide.com/en/blog/codex-goal-six-hour-run/
ingested: 2026-05-09
sha256: 42aa6ff39ea8db3b1254aac0f14de1bbfb2a9bcf9914585b93b57efbbcb6f16c
review_value: 8
review_confidence: 8
review_stars: 4
review_product: 64
review_recommendation: STRONG
source: Tecton & Tide (Yannik Zuehlke)
published: 2026-05-01
created: 2026-05-10
updated: 2026-05-10
---
# /goal: The Six-Hour Codex Run That Survived a Five-Hour Pause
**来源：** Tecton & Tide Blog (Yannik Zuehlke)
**发布时间：** 2026-05-01
**作者：** Yannik Zuehlke
**链接：** https://tectontide.com/en/blog/codex-goal-six-hour-run/
## TL;DR
- **`/goal`** shipped in **Codex CLI v0.128.0** on **April 30, 2026** as a named headline feature.
- It introduces **persisted goals**: a goal state that survives terminal restarts, laptop sleeps, and multi-hour pauses without re-prompting.
- **Runtime continuation** means Codex injects a developer message on resume rather than waiting for you to type anything.
- Real session on a TypeScript monorepo: Wall time ~**6h 44min**. Model compute ~**41 minutes**. Final status: `TASK_COMPLETE`.
- ~**6.8M cumulative input tokens** at ~94% cache hit rate. Auto-context-compaction fired once.
## What Shipped on April 30
Codex CLI `v0.128.0` (tagged `rust-v0.128.0`) dropped on April 30, 2026. From the release notes: "Added persisted /goal workflows with app-server APIs, model tools, runtime continuation, and TUI controls for create, pause, resume, and clear."
Key components:
- **Persisted goals** — goal state stored in app-server, outlives the process
- **App-server APIs** — local server layer tracking goal state
- **Model tools** — model gets tools for interacting with the goal lifecycle (signal completion, request continuation, inspect state)
- **Runtime continuation** — on resume, Codex injects a developer message prompting the model to continue
- **TUI controls** — visible goal state, pause/resume without killing the process
## What /goal Actually Does
`/goal` persists a goal description across Codex process restarts. When you close the terminal and come back, Codex resumes automatically via runtime continuation. The model signals completion with `TASK_COMPLETE` or the `task_complete` tool.
Before `/goal`, a closed terminal meant a dead session. You could approximate continuity by carefully managing context files and re-injecting prompts (the Ralph Wiggum Loop approach). `/goal` makes continuity a first-class feature.
Key config: `model_auto_compact_token_limit` in `~/.codex/config.toml`, `approval_policy`, `sandbox_mode`.
## A Real Six-Hour Run
- **Project**: TypeScript monorepo, voice interview system with end-to-end scenarios
- **Setup**: `approval_policy = "never"`, `sandbox_mode = "danger-full-access"`
- **Prompt**: ~600 words with XML-style blocks, reading list, working rules, `done_when` contract, anti-pattern fences
- **Model**: `gpt-5.5` with reasoning effort `high`
- **Timeline**: 9:19 PM submitted → 9:20 PM first turn (57s, interrupted) → 5.5h pause → ~2:50 AM auto-resume → TASK_COMPLETE
- **Context compaction**: fired once at ~6.7M tokens
- **Tokens**: ~6.8M input, ~10K output, ~2.6K reasoning tokens, ~94% cache hit
- **Wall time**: 6h 44min. Actual model compute: ~41 minutes.
- **Final status**: `TASK_COMPLETE` — all four target end-to-end voice scenarios passed verification.
Notable: Model documented a real-world ceiling (TTS first-byte timing field not measurable due to upstream library limitation). Explicit nulls in artifact with explanation.
## /goal vs the Ralph Wiggum Loop
| Dimension | Ralph Wiggum Loop | `/goal` |
|-----------|-------------------|---------|
| Setup | Shell script or plugin, external orchestration | Built into Codex CLI |
| State persistence | Git history, files on disk | App-server APIs, native goal state |
| Resume behavior | Manual re-invocation | Automatic runtime continuation |
| Context management | Fresh context per iteration | Compaction within session |
| Reasoning continuity | Stateless between iterations | Continuous within session |
| Model | Claude Code | Codex with `gpt-5.5` |
| Good for | Tasks benefiting from fresh eyes each pass | Long-horizon tasks with accumulating context |
## When /goal Is the Wrong Choice
1. **Undefined success criteria** — `done_when` contract is not optional
2. **Exploratory work** — early-stage "figure out this codebase" benefits from human-in-the-loop
3. **Security-critical paths** — authentication systems, payment flows, sensitive data
4. **Unclear external dependencies** — risk of hitting a wall at hour five
5. **Short tasks** — overhead not worth it under ~10 minutes of interactive work
## The Mindset Shift
> Old: Autonomous AI runs are sessions you monitor, ready to intervene when things go sideways.
> New: Autonomous AI runs are contracts you write upfront, then get out of the way.
The shift is **from supervisor to architect**. Quality determined almost entirely before the first turn runs. Prompt quality, success criteria, anti-pattern fences, reading list. Once it starts, your job is mostly done.
## Sources
- https://github.com/openai/codex/releases/tag/rust-v0.128.0
- https://developers.openai.com/codex/changelog
- https://developers.openai.com/codex/cli/features
- https://ghuntley.com/ralph/