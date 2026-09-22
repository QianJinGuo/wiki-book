# Lean Software Scaling Laws

> 📊 Level ⭐⭐⭐⭐ | 10.9KB

> **Source**: [gwern.net](https://gwern.net/lean-scaling)

## 摘要

Gwern's proposal argues that the way to compare programming languages in the LLM era is not to benchmark current performance but to measure the *scaling law of predictability* — how fast a language's per-token perplexity (BPC) improves as codebase and context window grow. The prediction: Lean has a worse baseline constant than Python or JavaScript today but the best scaling exponent, so it should eventually cross over and become easier for LLMs to read, repair and write at large codebase sizes. If true, it justifies buying training data to pull the crossover earlier and porting existing code to Lean.

## 核心要点

- **Predictability is the scaling property.** A strongly-typed, memory-safe, well-architected codebase becomes *increasingly* predictable as you read more of it; bad code becomes increasingly *unpredictable*, because globals, overrides and outright bugs mean seeing more never helps you understand the rest.
- **Lean = worse constant, better exponent.** With 2026-era LLMs Lean loses on absolute loss today but is predicted to have the best exponent, so it crosses over eventually — though possibly not at any reasonable codebase length.
- **Weak languages win small, strong languages win large.** Dynamic-typed, invariant-poor languages are easy at thousands of lines but have worse exponents, and get crossed by Haskell-class languages at hundreds of thousands to millions of lines.
- **It can be measured cheaply.** Concatenate per-language corpora, run frozen pretrained LLMs over growing context windows, record per-token loss, normalize to bytes and line length, then fit and extrapolate.
- **The cross-checks are the real experiment**, and the thesis is falsifiable: if ecosystem maturity and corpus priors dominate language-level invariants, tooling and conventions beat formal properties — at least for now.

## 深度分析

### The scaling law of predictability

The proposal reframes language choice as forecasting rather than benchmarking: neural scaling law methodology is under-applied to validating approaches and forecasting applications. The thesis is that perplexity (bits per character) is a weak but usable proxy for a system's predictability, and predictability is itself a key *scaling* property: languages whose large-scale systems become increasingly predictable will eventually work better with LLMs.

Predictability is not uniformity, though: boilerplate is predictable without indicating good design, and bruteforce proofs are the limiting case — you learn nothing from each one, so each is exactly as predictable as the last.

### Worse constant, better exponent

Lean sits at the extreme end of language power: total functions, no exceptions, no memory-safety holes, proof obligations for properties like lossless compression (zlib already has a Lean rewrite). The cost is that almost no Lean source exists, so priors are thin and the *constant* is high — poor absolute loss today, and models that cannot yet autonomously translate complex codebases. Gwern forecasts that Lean will not cross over in absolute loss at any reasonable length, but has the best exponent, so it crosses over at some point regardless.

The crossover point is therefore the decision-relevant quantity: at what codebase size does Lean become more absolutely predictable than equivalent Python, and how large must a coding LLM be — including via in-context learning or dynamic evaluation — to reach adequate performance? Constants and exponents become design metrics rather than fitting parameters. This also dissolves the chicken-and-egg problem: you need large Lean codebases to train on and training to produce them, unless the exponent justifies buying the data with labelers or producing it via agentic transpilation (roughly log scaling in attempts).

### Cheap measurement versus expensive training

Methodologically, none of this needs training from scratch: encode per-language corpora as single large text files with metadata headers, run frozen pretrained LLMs forward for per-token loss across the full context window, normalize into bytes to cancel tokenizer bias and per language to cancel line-of-code differences (languages differ up to 10×), average by token position, fit per-language scaling laws, and extrapolate for crossovers. The expensive alternative — finetuning on code, or training from scratch — controls more factors at vastly greater cost, and Gwern doubts it is worth it.

Each cross-check turns a perplexity number into a falsifiable experiment. Bug injection as inverse scaling: insert subtly broken but stylistically perfect code (missing bounds check, sign error, silent dtype cast, plausible-but-wrong lemma) and check that surprise rises, since flagging these needs semantic understanding of the whole codebase, not local style. Lean signatures: can the model complete a module from its signature header alone — do type signatures constrain the space so tightly that there is only one way to do it? The coreset/minimal-context test then operationalizes modularity: the LLM should find the minimal context matching full-prefix loss, and shorter is better.

### Language priors, confounds, and in-context learning

The strongest counterargument is data-hunger and lock-in: LLMs are better at common languages, and Luo et al 2025 argue programming is especially corpus-hungry, so upgrading to Haskell or Lean might be permanently impossible. The rebuttal is that popularity buys only a default starting advantage — a corpus is a *prior* with a measurable exchange rate, so better Python skill partially transfers to Haskell (Yang et al 2025). At scale the binding constraint is not corpus size but invariants: one unpredicted interaction is fatal and can cost a human weeks of debugging.

The confound is population, not language — Lean code emphasizes mathematics and its programmers are unusual, while JavaScript emphasizes web and business code by ordinary programmers, so controls must be topic-matched codebase pairs or synthesized comparisons such as C zlib versus the Lean zlib. A related worry — that models are simply too ignorant of Lean for in-context scaling to mean anything — Gwern doubts, suspecting the residual gap is corpus size; the diagnostic is watching whether the estimated exponent moves as training data grows. If the exponents hold, comprehension and repair shift from "read ten files to guess runtime behaviour" toward "read the types," minimal-context local repair becomes tractable, and the software surface converges on systems where entire vulnerability classes — memory safety, exceptions, out-of-bounds access — are structurally absent.

### What would falsify it

The proposal names its own most likely fatal failure mode: ecosystem maturity and corpus prior effects dominating language-level invariants. That would itself be useful — it would mean tooling, conventions and documentation beat formal language properties for agentic programming, at least for now.

Concretely, the thesis dies if the exponent fails to reproduce across model families, corpus orderings and normalization choices, or vanishes once line-length and tokenizer normalization are handled properly; if the ranking flips under confound control, meaning the naive analysis measured programmers rather than languages; or if Lean's deficit is a pure thin-corpus artifact, with finetuned or from-scratch models flattening the within-context slope instead of improving it. It also dies if the proxy breaks — refactors humans judge as improvements fail to raise prediction accuracy, or low loss is driven mainly by boilerplate — or if exponents are ordered as predicted but never cross within any practically available codebase size or training budget. And the mathslop scenario kills it directly: real Lean codebases collapse into a big ball of mud of ad hoc, non-reusable bruteforce proofs whose hallmark — each case exactly as predictable as the last — destroys the exponent advantage the argument rests on.

## 实践启示

1. **Measure the exponent before betting on a language or a rewrite.** Encode per-language corpora as single text files, freeze a pretrained model, record per-token loss across context positions, fit per-language curves, extrapolate to the codebase sizes you actually operate at, and report the crossover point rather than a leaderboard score.
2. **Normalize aggressively and publish both versions.** Convert loss to bytes to cancel tokenizer bias and normalize per language for line-of-code length (up to 10× spread); if a ranking survives only one normalization, you have measured the normalization, not the language.
3. **Treat the cross-checks as the experiment, not as extras.** Inject stylistically perfect bugs and verify surprise rises; truncate context and count compiles/test passes; attempt signature-only Lean module completion.
4. **Use minimal-context loss as a modularity metric.** Find the smallest token set reproducing full-prefix loss: short and stable means well-abstracted and locally repairable, long and unstable means hidden coupling and a coming bug-farm.
5. **Score refactors by predictability gain**, and use that gain as a cheaper taste benchmark for coding agents than iteratively adding new requirements.
6. **Control the population confound, then price the data purchase.** Pair codebases by topic or synthesize one spec in two languages at matched quality, then regress the constant on corpus size to estimate how much Lean training data moves the crossover down to your repository scale.

## 相关实体

- [Scaling Laws](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/scaling-laws.md) — 神经 scaling law 方法论背景；本页把其从模型规模迁移到「编程语言的可预测性」
- [Scaling Laws 汇总](https://github.com/QianJinGuo/wiki-public/blob/main/entities/posts-2026-06-24-scaling-laws.md) — 同期的通用 scaling law 梳理
- Model Size Scaling 2023-2031 — 规模外推主线，与本文常数/指数外推法互为参照
- [Claude 形式化费马大定理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/formalizing-fermats-last-theorem-claude-lean-anthropic-2026.md) — Lean 语料扩张证据，关系本文「鸡生蛋」问题
- [AtomWorld Scaling Law 基准](https://github.com/QianJinGuo/wiki-public/blob/main/entities/scaling-law-atomworld-icml2026-crystal-structure-benchmark.md) — scaling law 用于评测基准设计的对照

---

