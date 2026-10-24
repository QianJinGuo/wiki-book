# How to Write an Effective Software Design Document

> 📊 Level ⭐⭐⭐ | 12.9KB

> **来源**: [How to Write an Effective Software Design Document](https://refactoringenglish.com/excerpts/write-an-effective-design-doc/)

A good design doc can save you years of development time. Writing a design doc forces you to think through important decisions before you waste time on the wrong implementation or paint yourself into a corner. It’s also the best way to coordinate design decisions among teammates and partner teams.

I’ve written design docs as a developer at Google, Microsoft, and within [my own companies](https://mtlynch.io/projects/). The specifics vary, but the underlying principles remain the same. A design doc should articulate the hard problems you’re solving and help your teammates give you feedback.

Below, I share my approach to creating effective design docs and explain what belongs in a design doc and what does not.

*   [An example design doc](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#an-example-design-doc)
*   [When should you write a design doc?](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#when-should-you-write-a-design-doc)
*   [How much should you invest into your design doc?](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#how-much-should-you-invest-into-your-design-doc)
*   [What belongs in a design doc?](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#what-belongs-in-a-design-doc)
    *   [What’s the cost of getting it wrong?](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#whats-the-cost-of-getting-it-wrong)

*   [Components of a design doc](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#components-of-a-design-doc)
    *   [Title](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#title)
    *   [Metadata](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#metadata)
    *   [Objective](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#objective)
    *   [Background](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#background)
    *   [Related documents](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#related-documents)
    *   [Goals](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#goals)
    *   [Non-goals](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#non-goals)
    *   [Scenarios](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#scenarios)
    *   [Diagrams](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#diagrams)
    *   [Glossary](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#glossary)
    *   [Constraints](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#constraints)
    *   [Service level objectives (SLOs)](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#service-level-objectives-slos)
    *   [Monitoring / alerting](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#monitoring--alerting)
    *   [Timeline](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#timeline)
    *   [Interfaces](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#interfaces)
    *   [Dependencies / infrastructure](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#dependencies--infrastructure)
    *   [Security](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#security)
    *   [Privacy](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#privacy)
    *   [Legal considerations](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#legal-considerations)
    *   [Logging](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#logging)
    *   [Open issues](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#open-issues)
    *   [Resolved issues](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#resolved-issues)
    *   [Alternatives considered](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#alternatives-considered)

*   [Driving Your Design Doc through Review](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#driving-your-design-doc-through-review)

## An example design doc[🔗](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#an-example-design-doc)

The most common question I get about design docs is where to find a good one. I’ve never seen a public design doc that I consider high-quality. All of mine are hidden away at the companies that paid me to write them.

So, I wrote [a design doc from scratch](https://refactoringenglish.com/excerpts/write-an-effective-design-doc/little-moments-design-doc/) based on the principles I’m sharing here. It lays out the design for [a real web app I’m building](https://codeberg.org/mtlynch/little-moments).

[Video 3](https://refactoringenglish.com/excerpts/write-an-effective-design-doc/little-moments-demo.mp4)
I created the design doc before writing any code, and I’m adhering to the design [as I implement the app](https://codeberg.org/mtlynch/little-moments#status).

*   [Little Moments Design Doc](https://refactoringenglish.com/excerpts/write-an-effective-design-doc/little-moments-design-doc/)

The design is more exhaustive than what I’d normally write for a solo hobby project, but this is roughly the length and depth of a design doc I’d create if I were coordinating work with other people on a professional project.

## When should you write a design doc?[🔗](http://refactoringenglish.com/excerpts/write-an-effective-design-doc/#when-should-you-write-a-design-doc)

The more complex or risky the project, the more valuable it is to write a design doc.

Consider these questions:

*   Will multiple people coordinate work to implement the design?
*   Will the project take more than three months of full-time dev work?
*   Will the implementation run in production for several years?

→ [原文存档](https://refactoringenglish.com/excerpts/write-an-effective-design-doc/)

## 深度分析

### A design doc is a forcing function, not paperwork

The article's core claim is economic, not bureaucratic: writing the doc forces you to think through important decisions *before* you waste time on the wrong implementation or paint yourself into a corner, and a good doc "can save you years of development time". Its second function is coordination — the doc is the best way to align design decisions among teammates and partner teams, which is why the author (a design-doc veteran of Google, Microsoft, and his own companies) treats it as the interface through which teammates give feedback, not an artifact for its own sake.

### Effort scales with risk, and zero is a valid answer

The triage is a six-question checklist: will multiple people coordinate the work, will it take more than three months of full-time dev, will it run in production for years, does it involve cross-team collaboration, are goals and requirements ambiguous, and are there catastrophic risks (security flaws, legal exposure) preventable at design time. One "yes" makes a doc likely worth the effort; two or more makes it almost certain. Investment itself has no universal rule — anything from a one-pager to a 50-page document requiring signoff from five teams — and sometimes the right amount to invest is zero.

### The "cost of getting it wrong" filter decides what belongs in the doc

The central heuristic for content selection is a single question: *what's the penalty for being wrong?* Specifying every possible detail would mean writing the implementation during the design phase, defeating the doc's purpose. Decisions split by reversibility: building a web app in C++ and realizing 200k lines later that Ruby on Rails was the better choice leaves you stuck, because a from-scratch rewrite would never work; a "load more" pagination button, by contrast, is fixable in a few hours if user feedback disagrees, so it deserves neither doc space nor review cycles. The doc exists for the irreversible, high-penalty choices.

### The component list is a menu to prune, not a template to fill

The 23 listed components (title, metadata, objective, background, related documents, goals, non-goals, scenarios, diagrams, glossary, constraints, SLOs, monitoring/alerting, timeline, interfaces, dependencies, security, privacy, legal, logging, open/resolved issues, alternatives considered) form a menu — you generally don't need every section, so choose the subset that makes sense. Underneath, the sections cluster by job: context sections (objective, background) exist so the doc makes sense to a reader who never heard your verbal explanation, which is why that context belongs on the first page; scope sections (goals, non-goals, scenarios) head off mistaken assumptions about what the project covers; SLOs convert vague adjectives like "performant" into concrete numbers before code-complete; and the dependencies section isolates choices that are hard to change later (languages, storage backends) from the ones that swap out in an afternoon (third-party email providers).

### Honest uncertainty is a first-class part of the document

Open Issues record design flaws you can't yet solve, options you're torn between, and gaps awaiting information — each with the problem, candidate resolutions, and an immediate next step (e.g., the RAM-sizing issue that prices a test simulation at 3.0 dev days and proposes 128 GB untested because dev time costs more than RAM). Resolved issues move to a separate section with the decision summarized and the full discussion retained for posterity, and "alternatives considered" proactively answers "why didn't you do X?" in a few brief lines rather than an exhaustive log of every rejected idea. The doc thereby doubles as a decision ledger: reviewers see not just the design but the boundary between what is decided and what remains open.

## 实践启示

1. Triage before writing anything: run the six questions (coordination, duration, production lifespan, cross-team work, ambiguity, catastrophic risk); for low-risk solo work, a zero-investment decision is legitimate.
2. Filter every candidate decision through "what's the penalty for being wrong?": document the irreversible choices (language, storage engine, trust boundaries), and leave reversible UI details out of the doc and out of review entirely.
3. Write the objective and background so a reader with no verbal context from you can understand them, and put that context on the first page of the doc.
4. Build diagrams in editable tools (Excalidraw, draw.io, Mermaid, D2, Graphviz) and link the drawing source; never freeze a photographed whiteboard into the doc, because the first draft is never the last.
5. Replace vague quality words ("performant on mobile") with numeric SLOs across uptime, latency, and scale, then define monitoring and alerting thresholds that measure those SLOs in production.
6. Surface unknowns in an Open Issues appendix with options and a next step, move resolved ones onward with the decision and discussion retained, and answer "why not X?" proactively and briefly under alternatives considered.

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

