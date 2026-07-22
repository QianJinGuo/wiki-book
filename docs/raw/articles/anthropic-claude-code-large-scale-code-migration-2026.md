---
source_url: https://claude.com/blog/ai-code-migration
source: web
title: "How Anthropic runs large-scale code migrations with Claude Code"
ingested: 2026-07-18
type: raw
tags: [claude-code, code-migration, agent, loop]
sha256: 758f871f5c3e53b84f1ee7a4ea191ab17e31e67e96ae4dd8986a347d419c3701
---

# How Anthropic runs large-scale code migrations with Claude Code

A step-by-step guide to running large code migrations with AI agents — including Bun's million-line Zig-to-Rust port.

**Date**: July 16, 2026
**Category**: Claude Code, Enterprise AI
**Product**: Claude Code

## Overview

Individual developers at Anthropic migrated 10 code packages using Claude Fable 5, Claude Opus 4.8, and dynamic workflows. Two key examples:

- **Jarred Sumner** (Bun founder): Migrated Bun from Zig to Rust — 1M+ lines in <2 weeks, 100% test suite passing before merge, 19 regressions fixed post-merge. Cost: 5.9B uncached input tokens + 690M output tokens (~$165K at API pricing).
- **Mike Krieger** (co-lead Anthropic Labs): Migrated a Python codebase to 165K lines of TypeScript over a weekend. Hundreds of agents, 8 phase gates, 3 adversarial review rounds.

Core insight: "You don't fix the code. You fix the process (loop) that produced the code."

## Six-Step Migration Process

### Prerequisites: Build a Strong Judge
A judge must evaluate both original and target code on equal terms. Steps:
1. Categorize existing tests (identify external vs internal-dependent tests)
2. Rewrite for portability (convert external-facing tests to assertions for both codebases)
3. Validate judge against original code and deliberately broken code

### Step 1: Rulebook, Dependency Map, Gap Inventory
- **Rulebook**: Translation rules (structure-preserving) or design document (redesign)
- **Dependency map**: File dependency analysis for parallel workstreams
- **Gap inventory**: Language-specific gaps (Zig→Rust: memory management; Python→TS: interfaces)

### Step 2: Stress-Test the Rules
Mini-migration as "shakedown cruise": translate 3 files with rulebook, 3 files "like a senior engineer," use diff to create new rules. Catch critical issues before fan-out.

### Step 3: Translate Everything
Multi-agent loop architecture: implement, review, fix. Use smaller models for implementers, larger models for reviewers. Adversarial review with 2 reviewers, disagreement → 3rd agent. Rulebook grows, code never gets hand-patched.

### Steps 4-6: Compile, Run, Match Behavior
Same loop architecture with progressively less human judgment. Fixer agents work through compiler errors, smoke test crashes, and test failures. Build daemon serializes rebuilds.

## Best Practices
- Individual failures are the loop's job — focus on patterns
- Adversarial review + mechanical verification
- Don't use largest model for everything
- Front-load human hours (rulebook + stress test)
- Make work queue mechanical and resumable
- Review loop results, not individual code

## Results
Bun Rust port: unsafe blocks = 4% of code. Memory leaks fixed (6,745MB → 609MB on 2,000 builds). Binary 19% smaller on Linux/Windows. 2-5% faster on HTTP serving and real workloads.
