# Beyond Vibe Coding — Directed Generation as Design Methodology

> 📊 Level ⭐⭐⭐ | 10.4KB

> **Background**: Based on UX Magazine 2026-06-25 article redefining AI-assisted design workflow from a designer's perspective, proposing "directed generation" as the precise term replacing "vibe coding".

## Core Thesis

**"Vibe coding" is a mislabeling of serious design work.** Andrej Karpathy accurately described a specific low-accountability behavior in early 2025 (loose description, accept output, don't scrutinize). But the term migrated into contexts where it doesn't belong — serious designers' AI-assisted workflows.

## Directed Generation: Three Phases

Designers' interaction with AI is not passive acceptance but three **active** phases:

1. **Directing**: Composing inputs, selecting references, setting constraints — before the first token is generated
2. **Collaborating**: Running iterations, critically reading output, adjusting direction — like redirecting a technically capable developer who needs your eye
3. **Editing**: Going deep into HTML or Figma, making calls no prompt can fully anticipate — spacing feel, hierarchy landing, contrast details

**Key insight**: The model doesn't supply taste; it **pressure-tests** yours.

## Design Pattern Paradigm Shift

| Dimension | Traditional | Directed Generation |
|-----------|------------|-------------------|
| Pattern definition | Fixed artifact: defined, documented, applied | Contextual relationships: spatial, typographic, behavioral |
| Consistency source | Replication | Reliable emergence under constrained conditions |
| Designer role | Specify every instance | Define conditions for good instances to reliably emerge |
| Flexibility | First casualty | Core feature |

## Language Precision Matters

George Orwell: "slovenliness of language makes it easier to have foolish thoughts" — and the reverse: precise language enables precise thinking. When an imprecise term colonizes an emerging practice, it pre-shapes how the work gets understood, hired, and valued before anyone has defined it properly.

## Connection to Harness Engineering

This article is fundamentally about **how humans direct AI generation** — directly relevant to the wiki's harness engineering theme:
- "Judgment first" = harness constraint definition
- "Patterns from static to contextual recomposition" = skill dynamic adaptation
- "Designer role from specifying instances to defining conditions" = agent harness orchestration paradigm

→ [source archive](https://uxmag.com/articles/beyond-vibe-coding-a-designers-case-for-directed-generation)

## 深度分析

### The mechanism: a shift in where authority lives

The useful distinction is not whether AI touched the work — it is who holds authority in the loop. In [vibe coding](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/vibe-coding-paradigm.md) generation drives decisions: prompt, accept, adjust at the margins, ship. In hand-crafting the designer is the sole generator and the model is absent. Directed generation differs from both in mechanism, not slogan: judgment arrives first, and the curated reference — sketch, screenshot, visual precedent — *is* that judgment, carrying decisions about proportion, tone, hierarchy, and intent that would take paragraphs to articulate in words and still arrive less precisely. The model does not supply taste; it pressure-tests the designer's. The test for any workflow is structural: trace where authority sits at each step, not how many of the pixels a machine produced.

### Why the three phases are order-bearing, not a menu

Directing → Collaborating → Editing is a dependency chain, not three interchangeable modes. Directing front-loads intent into references and constraints, and that defines the space of everything iteration can later reach; collaborating spends that intent, re-steering the way you would redirect a capable developer who still needs your eye; editing catches the residue no prompt can fully anticipate — the spacing that feels off, the hierarchy that works technically but does not land, the consistency the model optimized for when the moment called for contrast. Strip out the first phase and collaboration has no reference to steer against, so it decays into prompt-accept-adjust — vibe coding with extra steps. Strip out the last and the model's statistical defaults win at exactly the resolution where craft becomes legible. Phase competence in isolation is worth less than correct sequencing.

### Language precision as the interface contract

Orwell's observation runs both ways — slovenly language eases foolish thoughts, precise language makes precise thinking possible — and at the model interface the vocabulary functions as a contract. Each candidate term locates authorship differently: *directed generation* names the human as the directing force, *reference-guided generation* names the curated input as the decisive act, *compositional prompting* treats the assembly of sketch, reference, constraint, and intent as the craft. A team that adopts supervisory framing asks the model for output to approve; a team that adopts directing framing composes constraints before generating. This is the lever [prompt engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/prompt-engineering-fundamentals.md) pulls, one level up: not the wording of the prompt, but the shared term that determines what goes into it at all. Because the term also travels outward — to clients, hiring managers, rate justifications — imprecision is not only a description bug but a valuation bug.

### Where the paradigm breaks down

**Priors versus intent.** Recomposition is not invention. The model recombines what its training data contains, so when intent is genuinely novel or brand-specific the reference cannot transmit it and output drifts toward the average of what the model has already seen.

**The evaluation gap.** Non-deterministic output has no fixed diff to review. If the result cannot be predicted, the acceptance test cannot be fully specified in advance either, so verification collapses onto taste — which does not scale across a team unless the primitives and constraints are shared.

**Iteration cost.** Front-loaded craft — curated references, rigorous constraints, quality primitives — is an investment paid before any output exists; cheap-looking iterations conceal an expensive setup whose payoff appears only when the pattern recurs across surfaces. Where risk tolerance is low, production components still need to be specified, reviewed, and locked.

### The through-line to harness engineering

Directed generation is the design-side instance of the move [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) makes on the engineering side: neither hand-write every artifact nor surrender the loop, but encode judgment into constraints, references, and primitives so acceptable outputs reliably emerge. "The designer authors the grammar; the system speaks it fluently" is the design twin of an agent operating inside a specification — see [specification-driven development](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/sdd-specification-driven-development-harness.md) — and agentic delivery inherits the same open problem as [agent evaluation](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-evaluation-benchmark-frameworks.md): verifying non-deterministic output at scale without re-litigating intent every run. The design-system instance is already visible where agents author the pattern vocabulary itself (see [design systems agent author evolution](https://github.com/QianJinGuo/wiki-public/blob/main/entities/design-systems-agent-author-evolution.md)), and the wider framing belongs with agentic engineering.

## 实践启示

1. **Curate the reference before writing the prompt.** Treat the sketch, screenshot, or precedent as the primary artifact of direction; a weak reference cannot be rescued by prompt wording.
2. **Sequence deliberately: direct, then collaborate, then edit.** Refuse to start iterating while the reference set and constraints are vague — an under-directed start silently converts the session into vibe coding.
3. **Reserve editing time as a first-class budget line.** Spacing, hierarchy, and contrast calls are where authorship becomes visible; they are not cleanup.
4. **Choose deterministic versus non-deterministic by risk tolerance, per phase of work.** Generative wireframing and concept exploration take the non-deterministic path; shipped components still get specified, reviewed, and locked.
5. **Invest upstream in primitives and constraints.** Because craft moves into primitive quality, reference precision, and constraint rigor, tooling spend belongs there rather than in prompt tricks.
6. **Name the practice in your own terms and defend it where it counts.** Portfolio reviews, client kickoffs, and onboarding juniors are where a precise term converts into clarity and rate justification.

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

