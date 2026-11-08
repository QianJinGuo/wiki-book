# 50 design token files, one problem: your agents can't read the meaning

> 📊 Level ⭐⭐⭐ | 10.1KB

> **Background**: Based on learn.thedesignsystem.guide analysis of 50 real design system token files, exploring how AI Agents consume structured design data.

## Core Problem

Design tokens are the atomic variables of design systems -- colors, spacing, fonts, shadows. When AI Agents need to operate design systems, a key obstacle emerges: **token file semantics are opaque to agents**.

Findings from 50 design systems:
- Token file formats are fragmented (JSON, YAML, CSS custom properties, SCSS variables)
- Naming conventions lack a unified semantic layer (color.primary.500 vs --brand-blue-dark)
- Agents cannot infer token usage and constraints from file structure alone

## Three-Layer Analysis

### 1. Format Layer: Parseability of Token Files

Different design systems export tokens in vastly different formats. JSON is most agent-friendly, but CSS variables and SCSS mixed formats require additional conversion layers.

### 2. Semantic Layer: Naming Convention Comprehensibility

Agents need to understand whether spacing.large and margin.xl are equivalent. Currently no cross-system semantic mapping standard exists.

### 3. Constraint Layer: Inter-Token Dependencies

Color tokens may depend on theme tokens, spacing tokens may have grid alignment constraints. These implicit constraints are invisible to agents.

## Practical Insights

- **Production Prompt Templates**: The article provides prompt engineering templates for agents to consume token files
- **Tool Comparison**: Compares Style Dictionary, Token Studio, Cobalt UI for agent-friendliness
- **50 System Data**: Covers Material Design, Ant Design, Chakra UI and other mainstream systems

## Unique Contributions

1. **50-system empirical data** -- not theoretical, real structured comparison of token files
2. **Agent readability framework** -- format/semantic/constraint three-layer analysis model
3. **Production prompt templates** -- directly reusable prompt engineering for agent token consumption

## 深度分析

### Readability is a semantics gap, not a format gap

The audit started from the opposite intuition: tokens already live in JSON, already move between Figma and code, and are already structured, so they should be the easiest design-system data an agent could consume. The result inverted that assumption. A token file can be perfectly valid for a build pipeline and still be thin context for an agent, because the two consumers are doing different jobs: the pipeline only needs to resolve `color.red.500` into a usable value, while the agent needs to know whether that red means danger text, destructive buttons, error borders, alert backgrounds, brand moments, a chart series, or something that should never be referenced directly.

Seen that way, agent-readiness is a set of questions the file almost never answers — what does this token mean, when should it be used, when must it not be used, is it deprecated, which component or state depends on it, which decision created it, which platform does it map to. Without that layer the agent can still read the file; it simply has to guess, and guessing is what produces the failure mode of reusing a danger red on a decorative chart or a disabled control.

### Naming is the de facto interface

This is the dimension that correlates most directly with agent success. A compiled value carries no reason, so the name is the only field an agent can reason over: `color.primary.500` and `--brand-blue-dark` may resolve to the same pixel, but only one of them tells an agent whether the token is a scale step or an intent. Where the naming encodes intent, role and hierarchy, the agent gets a usable contract for free; where names encode appearance, the agent is left inventing meaning from a hex value it cannot interpret.

### Structure and taxonomy matter more than file format

The format layer is the shallowest of the three, and the easiest to fix. Eight formats are in active use — DTCG JSON, Style Dictionary JSON, Theo YAML, plain JSON, TypeScript objects, CSS custom properties, SCSS maps, and LESS or compiled CSS variables — and there is no standard location either: Spectrum's tokens sit in a standalone `spectrum-design-data` repo, Polaris ships them inside `polaris-react`, and GitLab bundles them in the `@gitlab/ui` package.

That fragmentation is real but mechanical: a converter or a resolution manifest can bridge formats and locations, which is the same problem category as [Agent-Ready API Design Patterns](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-ready-api-design-patterns-2026.md). What no converter can recover is the missing semantics — the meaning, roles and dependencies that were never written down. Hence naming, structure and taxonomy are the deep, expensive layer, and file format is the cheap one; effort spent normalising formats is worthwhile only if it buys room to author the meaning layer on top.

### Scale size is an opinion that propagates to the consumer

Every count in the study measures the same thing: how many decisions the system makes for you versus how many it leaves to you. A small scale is an opinion; a large scale is a palette. Neither is wrong for humans, but the asymmetry is sharp for machines — a large palette multiplies the number of plausible candidates for "a danger colour" and raises the rate of plausible-but-wrong picks, while an opinionated scale narrows the search space and pushes the judgement back into the system where it is documented.

### The gap between the documentation and the contract

The study deliberately compared the raw source an agent would actually load rather than the polished documentation, and that is where the central gap appears: the prose sites, Figma descriptions and team conventions are full of intent, while the machine-loaded file contains only values. Anything that exists solely in human docs therefore drifts from the contract the agent obeys. Closing that gap — treating the token file itself as the contract and expressing meaning, deprecation and dependencies in machine-parseable form, as [DESIGN.md](https://github.com/QianJinGuo/wiki-public/blob/main/entities/design-md-google-stitch-voltagent-ai-design-agent.md) attempts — is the real design-system work, and it is closer to [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) than to asset export.

## 实践启示

1. **Ship a semantics layer alongside the value layer.** For each token, publish what it means, when it may be used, when it must not be, whether it is deprecated, which component or state depends on it, and which decision created it. Those seven questions are the deliverable; the compiled value is only the input.
2. **Make tokens findable before you make them pretty.** Publish where the tokens live and in which format, per platform. Knowing the location is day-one onboarding knowledge for a human and the identical pointer an agent needs — without it, agent behaviour is decided by luck.
3. **Prefer an opinionated scale over an exhaustive palette.** Every extra shade is a decision handed back to the consumer; a small scale reduces the agent's candidate set and the odds of a confident wrong choice.
4. **Automate the format layer, author the taxonomy layer.** DTCG, Style Dictionary, Theo YAML, TypeScript objects, CSS variables and SCSS maps are all mechanically translatable; names, roles and constraints are not. Treat conversion as tooling and naming as design work with a reviewer.
5. **Make dependencies and constraints explicit.** Theme coupling, grid alignment and component/state usage are invisible to an agent even when they are obvious to the team — the same missing-relationship problem that blocks [AI system understanding of component libraries](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-understanding-component-library-intelligent-d2c-architecture-aws-kiro-mcp-skills.md). Encode them as data, not as tribal knowledge.
6. **Verify against what the agent actually loads, and keep it authoritative.** Audit the raw source file, not the documentation site, then either keep both in sync or accept that agent output follows the file. This is the same discipline the [design-to-code loop](https://github.com/QianJinGuo/wiki-public/blob/main/entities/design-to-code-loop-figma.md) and [agent-era design system](https://github.com/QianJinGuo/wiki-public/blob/main/entities/design-systems-agent-author-evolution.md) both depend on.

## Related

- [DESIGN.md](https://github.com/QianJinGuo/wiki-public/blob/main/entities/design-md-google-stitch-voltagent-ai-design-agent.md) -- also an AI Agent interface for design systems
- [Claude Design Skill](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-design-skill-web-design-engineer.md) -- agent operating design systems in practice

-> [Original Article Archive](https://learn.thedesignsystem.guide/p/50-design-token-files-one-problem)

---

