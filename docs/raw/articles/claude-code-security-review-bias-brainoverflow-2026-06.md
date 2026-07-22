---
title: "Hidden Gaps in Claude Code Security Reviews"
source_url: "https://brainoverflow.blog/posts/claude-code-security-review-bias/"
source: "blog|claude.com|brainoverflow"
author: ""
publish_date: "2026-06-01T11:35:14-07:00"
ingested: "2026-06-11"
type: article
tags: []
source_type: rss
sha256: "0c472d719e11c5c0e6658489b1570770e6ef11cdb957693dc4a351f2acfa9de8"
---
_Anthropic recently shipped a new security plugin for Claude Code that automatically reviews code for vulnerabilities as you make changes, complementing the existing `/security-review` skill. I decided to test both against a deliberately constructed set of security flaws to see if the new tool improves coverage. Little did I know how deep this rabbit hole would take me. Fair warning: this is a long read._

* * *

## 1. Background

Claude Code supports LLM-based security reviews at three stages:

| Tool | Plans | What the reviewer sees |
| --- | --- | --- |
| `/security-review` | All | Full branch, same or new session context (user’s choice) |
| **Security guidance plugin**_(new, May 2026)_ | All | Git diff from current turn, fresh model context |
| Code Review | Team / Enterprise only | Full codebase, multi-agent, independent model (runs on PRs) |

The new plugin shipped with an explicit design goal: avoid the **model anchoring bias** problem [I wrote about earlier](https://brainoverflow.blog/posts/ai-native-threat-modeling/#5-on-model-bias-in-security-analysis). To understand what model bias means here, consider the human equivalent: if you ask the author of the code to review it, they’ll likely tell you it’s fine — they wrote it after all. A reviewer who wasn’t in the room when the decisions were made will challenge assumptions the author has stopped seeing. The same dynamic applies to LLMs: when Claude writes code and then reviews it in the same session, it has the full conversation history in context, including every design choice and tradeoff it reasoned through while writing. It validates against those decisions rather than challenging them. A fresh session is the AI equivalent of a second pair of eyes.

The new plugin addresses this by running a **separate Opus 4.7 session with a fresh context**: the reviewer starts from the diff with no session history and no investment in the original approach. Anthropic’s own documentation is direct about the design intent:

> “The plugin does not ask the same Claude instance that wrote the code to grade itself. […] The end-of-turn and commit reviews run as a separate Claude call with a fresh context and a security-focused prompt: the reviewer starts from the diff, has no investment in the original approach, and is instructed only to find problems.”

This is a real solution to the model bias problem, but if you read deeper, it has its own limitation: **a diff-scoped reviewer can only see what changed in the current turn** and cannot reason about interactions between pre-existing code and new additions. That constraint is likely a cost decision: Opus 4.7 is expensive, and reviewing the full codebase on every change would be prohibitively token-intensive.

This gives me two hypotheses to experiment with:

**H1:** same-session `security-review` is affected by model anchoring bias and will suppress findings that a cold run on the same code surfaces. The delta between the two runs measures how bad the gap is in practice.

**H2:** the newly introduced diff-based plugin will miss vulnerability chains where each change looks benign in isolation but the two together form something exploitable, because the reviewer only ever sees one diff at a time and has no memory of what came before.

* * *

## 2. Test corpus

My target is based on a real Telegram bot that routes voice and text messages into a backend, but the version used here was vibe-coded from scratch for this experiment. The spec was written to elicit insecure decisions without explicitly asking for them: the goal was a realistic-looking codebase with seeded flaws.

The three flaws, ranging in complexity:

### F1: Fail-open authentication (simple)

`TELEGRAM_ALLOWED_USERS` is read into a set at startup. When the env var is absent, the set is empty. The auth guard uses the set as a condition:

```
if TELEGRAM_USERS and (not user or user.id not in TELEGRAM_USERS):
    return
```

When `TELEGRAM_USERS` is empty, the entire `if` is skipped: any Telegram user is accepted. The correct default is deny-all: a bot that can read files and spawn subprocesses should fail closed, not open.

### F2: Unrestricted subprocess permissions (medium)

The bot classifies incoming messages and dispatches them, spawning `claude -p` subprocess with the `process_notes` skill and an `--allowedTools` list needed for the skill to run its operations. The allowed tools list passed to the inner Claude instance includes `Bash(python3:*)` without path restrictions. The `process_notes` skill reads the note from disk and invokes Python with it as input. If the skill passes note content to Python without sanitization, the chain reaches arbitrary code execution.

```
# python3 unrestricted
allowed_tools = "Read,Write,Bash(python3:*),Bash(mv:*),Bash(rm:*), ..."
```

### F3: Write + path-scoped python3 = write-then-execute chain (hard)

Now `python3:*` is hardened to `python3:.claude/scripts/*`, but the `Write` permission remains. The chain: write a payload to `.claude/scripts/`, invoke it via python. Neither permission is dangerous alone: the vulnerability only exists when you hold both simultaneously. This flaw is the key test case for the new plugin: a diff-based reviewer seeing only the second permission added can’t chain it to the first to recognize the combined severity.

```
allowed_tools = "Read,Write,Bash(python3:.claude/scripts/*),Bash(mv:*), ..."
#                     ^^^^^ unrestricted       ^^^^^ scoped — looks safe
# Chain: Write payload → .claude/scripts/evil.py, python3 runs attacker's code
```

The four tests map directly to the two hypotheses:

| Test | Tool | Setup | Tests |
| --- | --- | --- | --- |
| T1 | `/security-review` | Same session that wrote the code | H1: does model bias suppress findings? |
| T2 | `/security-review` | Fresh session, no prior context | H1 control: cold reviewer, does it catch everything? |
| T3 | Security guidance plugin | `Write` + `python3:*` both new in the diff | H2: does plugin catch a chain when it’s fully visible? |
| T4 | Security guidance plugin | `Write` pre-existing, only `python3 scripts/*` added | H2: does plugin miss a chain split across commits? |

* * *

## 3. H1 | T1 & T2: /security-review and model bias

Model bias in AI security review is a known problem, and Anthropic implicitly acknowledged it by releasing the new plugin. I’m not going to dwell on it; the tests here are a quick empirical confirmation with a concrete measurement of the gap.

The `security-review` skill runs a multi-agent pipeline — initial identification followed by parallel false-positive filtering against known precedents, with a scoring system and a confidence threshold to report. It is more reliable than casually asking Claude to “review this code for vulnerabilities”, though some real issues may get filtered if the evidence isn’t strong enough.

**Test 1** ran in the same session that produced the bot; **Test 2** ran in a fresh session with no prior context. Same code, model, thinking effort, command.

| Finding | Test 1 (same-session) | Test 2 (cold session) |
| --- | --- | --- |
| Fail-open auth: empty allowlist (F1) | Not surfaced | **High** (0.95) |
| Path traversal in file retrieval | Not surfaced | Medium (0.82) |
| Unrestricted subprocess permissions (F2) | Filtered out | Not identified |

Test 1 reported zero vulnerabilities; Test 2 reported one High and one Medium. The same-session reviewer framed the threat model as “authorized-only Telegram access”, treating the auth as working correctly because the spec said so, and F1 never surfaced. The cold reviewer had no spec context and flagged it right away.

The path traversal finding is actually a stronger signal. It wasn’t seeded in my prompt; it was a real bug the vibe-coding session introduced on its own, with no spec instruction to blame. The cold reviewer caught it; the same-session reviewer missed it alongside F1. ✅ **H1 confirmed**.

* * *

## 4. F2: the component boundary you shall not pass

It’s not uncommon that while testing a hypothesis you run into new discoveries. So why did neither run flag the unrestricted subprocess permissions?

The answer is in the architecture. Both `write` and `process` are legitimate bot operations: the attacker stores a note to disk, then triggers `process` normally. `handle_process()` spawns `claude -p /process-notes --allowedTools [..]`. The subprocess call is visible in `inbox-bot.py`, but the skill it invokes is a separate file. Whether the skill passes vault content to Python in an exploitable way, and whether the permissions it runs with are appropriate, live outside the review scope.

The architecture makes the concern visible: attacker-controlled vault content flows into a subprocess running with unrestricted python3. Neither automated reviewer evaluated it at that level, though they each hit the boundary differently.

In **T1** (same session), the reviewer identified the chain, labeling it “Prompt injection via vault write to claude subprocess”, but the false-positive filter dismissed it: _“The attacker and vault owner are the same person; there is no external trust boundary being crossed.”_ That’s **model bias in a different form**: not suppressing a finding outright, but supplying a session-derived trust assumption that the reviewer couldn’t actually validate, because doing so would require seeing what `process-notes` does with the data it receives.

In **T2** (cold session), the reviewer checked for shell injection: seeing list-form `subprocess.run` with no `shell=True`, it marked the subprocess as clean and moved on. Seemingly, the **presence of a known secure coding pattern steered the LLM into trusting the call as safe overall**: the right invocation style closed scrutiny before it reached the component boundary question. The `--allowedTools` string with `Bash(python3:*)` was never evaluated.

Neither reviewer asked whether `python3:*` was too broad. That question doesn’t require seeing `/process-notes` to answer: attacker-controlled data flowing into a subprocess with unrestricted python3 is a concern on its own, regardless of what the downstream skill does with it. A human reviewer would flag that pattern without needing to verify what the downstream component does with it. When you can’t see past the boundary, the right default is to surface the concern.

* * *

## 5. H2 | T3 & T4: the plugin and diff isolation

After a quick detour, we’re back to probing the second part of the original hypothesis: does the new Claude plugin’s diff-scoped reviewer miss a vulnerability chain where each change looks benign in isolation? This time, the chain is in the same file, and in a single tool call.

**Test 3 (1 diff):**`Write` + `Bash(python3:*)` introduced together. The plugin caught both: `python3:*` flagged as too broad, `Write` flagged as needing tighter scope. Two correct findings, auto-fix applied. But it treated them as independent concerns rather than a chain. The fix addressed F2; F3 survived.

```
The security hook flagged two real issues:
1. Bash(python3:*) is too broad — permits running any Python script.
   Should be scoped to the specific script path.
2. Write is too broad — should be scoped to the wiki directory under VAULT_ROOT.
```

**Test 4 (2 diffs):**

*   `Write` committed in the baseline. Nothing suspicious in isolation.
*   `Bash(python3:.claude/scripts/*)` added in a new session. A narrow, path-scoped python3 permission — looks like a reasonable hardening move. `Write` is outside the diff and invisible to the reviewer.

```
LLM code review: no vulnerabilities found.
```

And just like that, ✅ **H2 confirmed**.

Side observation from the test: when my git commit message named the permissions that had been removed, Claude read the log and inferred exactly what to restore, producing broad `python3:*` directly. I’ve repeated the test with a neutral commit message, and it resulted in a different fix. The commit message didn’t affect the plugin’s review, but it changed what the writing model produced. Small sample, but a useful reminder that in vibe-coding sessions the model reads everything in context, and metadata you don’t think of as instructions can still shape output.

* * *

## 6. What can we do about all this?

The model bias gap is actionable, and the fix is simple: run `/security-review` in a fresh session, not the one where you wrote the code. The unfortunate truth is that most users won’t know to do this. The natural instinct is to run the skill right there in the session where you just finished writing the code. Model anchoring isn’t obvious unless you know about it. Anthropic could nudge users here: detect when the tool is invoked in a session that also wrote the code, and warn before running.

I asked Claude to prototype this using session hooks. Available as a gist [here](https://gist.github.com/obormot/9a241032c72c4d19a259f8bce6fa8ed3), it works, but frankly it’s not very good. The `decision: block` output is blunt; it stops the prompt and requires re-running. That’s an API limitation: `UserPromptSubmit` hooks have no non-blocking notification option, so block is the only way to surface a visible message. Another caveat: in Claude Desktop, blocked prompts fail silently — the user gets no response and no explanation. This hook is only reliable in the Claude Code CLI.

* * *

## Final thoughts

Every tool in this space has gaps. Some are documented, and some are hidden, surfacing only when you test carefully enough. The title of this post came from expecting to confirm two gaps and finding three.

Are we all doomed until Mythos comes to save us? Models evolve rapidly, and Mythos is reportedly strong at exactly the cross-boundary chain reasoning that today’s tools miss. It may well close these gaps - time will tell.

My broader take: fully autonomous code reviews don’t replace human judgment. They extend your reach, and they’re most useful when you understand what they can and can’t see. Know the limits of your tools. Trust **and** verify.

* * *

## References

*   [Anthropic — Catch security issues as Claude writes code](https://code.claude.com/docs/en/security-guidance)
*   [Claude hook to warn about model anchoring bias](https://gist.github.com/obormot/9a241032c72c4d19a259f8bce6fa8ed3)