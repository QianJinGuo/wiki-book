---
title: "How LLMs Actually Work"
source_url: https://www.0xkato.xyz/how-llms-actually-work/
source: 0xkato.xyz
author: 0xkato
publish_date: 2026-06-01
ingested: 2026-06-09
sha256: 95683f3fe17b06e2325d6d2df60fdc5837850ea1a9d4ee3954c688de01745eaa
---

# How LLMs Actually Work

Monday. June 01, 2026 -  26 mins

This post is a walkthrough of how LLMs work. Modern LLMs are mostly built by stacking transformer blocks over and over, so understanding the transformer machinery gets you most of the way there.

I'll cover the core mechanisms inside modern transformer-based LLMs, without all that sticky math stuff. Don't get me wrong, you should learn the math, but this can serve as an introduction.

Most modern LLMs share the same transformer-family skeleton. The differences come from what each one was trained on, the scale and configuration choices, and the post-training done on top. By the end, you should be able to read many modern LLM papers or model cards and know which piece of the architecture each section is talking about.

Here's the path:

1. Tokens, how a string of text becomes a sequence of integers
2. Embeddings, how those integers get meaning
3. Positional encoding, how the model knows what order the tokens came in
4. Attention, how tokens share information with each other
5. Multi-head attention, how the model tracks many kinds of relationships at once
6. The feed-forward network, where a large share of the model's stored structure lives
7. The residual stream and layer normalization, what makes deep stacks trainable
8. Predicting the next token, what the model actually outputs and how the generation loop works
9. Architecture vs trained weights, what's broadly shared across modern LLMs, and what's different

Tiny explainers appear throughout so anyone can follow along, regardless of background.

## Tokenization

Models don't read text directly. They read integer IDs. The step that converts your prompt into a sequence of those integers.

That conversion step is called tokenization. A tokenizer takes a string and produces a sequence of integers, where each integer points to an entry in a fixed vocabulary. Modern LLM vocabularies usually contain tens of thousands to a few hundred thousand entries.

> **Tiny explainer: token ID**
> A token ID is the integer the model uses for one vocabulary entry. The model works with the number, not the written word itself.

Tokens aren't usually whole words. They're usually subword pieces. The word "tokenization" might split into ["token", "ization"]. The word "running" might split into ["run", "ning"]. The reason is efficiency. Whole-word vocabularies are too big and don't generalize to new words. Character-level vocabularies are too small and force the model to learn even the simplest patterns from scratch. Subword tokenization sits in the middle. The most common pieces become single tokens, and rare or novel words get composed from smaller pieces.

> **Tiny explainer: vocabulary**
> The vocabulary is the tokenizer's fixed list of pieces. Each piece has an ID, and the model can only directly receive IDs from that list.

The trade-off shows up in places people don't expect. The classic example: ask an LLM how many R's are in "strawberry." LLMs used to get it wrong. That's not the model failing at counting. It's the model not operating on letters directly, only token IDs that happen to spell out a word a human would split letter by letter.

Different model families use different tokenizers. GPT models use Byte Pair Encoding variants. SentencePiece is common in LLaMA-style models. The choice matters for compute (fewer tokens means less work) and for things like multilingual coverage, but the basic shape is the same. Text in, integers out.

Now that the prompt is a sequence of integers, the next step is to give those integers meaning.

## Embeddings

A token ID like 1024 is just a row index. It doesn't mean anything by itself. The thing that gives it meaning is a giant table called the embedding matrix.

Every model has one. It has one row per entry in the vocabulary, and each row is a long vector of numbers. The length of each row is the model's hidden size. In many 7B-class models, that means 4,096 numbers per token. Larger models usually use wider vectors.

> **Tiny explainer: vector**
> A vector is a list of numbers. In a transformer, each token becomes a vector so the model can do math with it.

When the tokenizer hands the model an integer, the model looks up that row and uses the vector instead. That vector is the token's embedding. It's the model's representation of what that token "means," learned during training.

> **Tiny explainer: embedding matrix**
> The embedding matrix is a lookup table. Token ID in, learned vector out.

The interesting property of these embeddings is that semantically similar tokens end up with similar vectors. The vector for "king" is close in space to the vector for "queen," and the vector for "Paris" is close to "France." None of this is hard-coded. It emerges from training on enough text, and the model learns these positions because they let it predict text well.

You can do arithmetic on embeddings and it sometimes works. The famous example is king - man + woman ≈ queen. The geometry of embedding space carries real semantic structure, even though nobody told the model to build it that way.

Worth being clear on: at this stage every token has been replaced by its embedding, but the embedding alone says nothing about where the token sits in the sequence. The vector for "dog" is the same vector whether "dog" is the first word in your prompt or the fifth. That's a problem.

That's the gap positional encoding fills.

## Positional encoding

Plain self-attention doesn't have a built-in representation of word order. Without some positional signal, it has no direct way to know that "dog" came before "bites" instead of after it.

Word order changes meaning. So the model needs another piece. It needs a way to inject the position of each token into the math.

> **Tiny explainer: positional encoding**
> Positional encoding is how the model gets order information. It tells the model where each token sits in the sequence.

The original transformer paper (Vaswani et al. 2017) did this by giving each position its own pattern of numbers and adding it directly to each token's embedding before any other processing. Position 1 had one pattern, position 5 had a different pattern, position 100 had another. The patterns came from sine and cosine waves at different frequencies. Now the embedding for "dog" at position 1 was different f
