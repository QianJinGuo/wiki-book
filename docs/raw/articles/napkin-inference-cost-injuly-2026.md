---
title: "Inference cost at scale with napkin math"
source_url: "https://injuly.in/blog/napkin-inference-cost/index.html"
source: newsletter
ingested: '2026-06-15'
sha256: "92f18880105a116e09e5f2bb02ff2ee019cbe0832e036021cfdc5a7c7f26dc0e"
tags: [newsletter, ai, llm]
ingest_v: 7
ingest_c: 7
ingest_stars: 4
ingest_vxc: 49
---

# Inference cost at scale with napkin math

> Source: [https://injuly.in/blog/napkin-inference-cost/index.html](https://injuly.in/blog/napkin-inference-cost/index.html)


Published Time: Sun, 14 Jun 2026 18:25:22 GMT

Markdown Content:
[index](https://injuly.in/)[about](https://injuly.in/about/)[blog](https://injuly.in/blog/)[work](https://injuly.in/work/)[now](https://injuly.in/now/)

Jun 14

If you serve AI models as a part of your product's stack (hard not to in 2026), you've done the math on how much juice you can get out of a single A100/H100/H200/B200/whatever. This directly affects the pricing for subscription-based products.

I want to show that even as models, hardware, and inference engines evolve; the dollar price-per-user remains straightforward to work out on paper. This exercise should also reveal how various optimizations in inference engines help SaaS products remain profitable.

If you were actually working this out on paper, you'd need only the following information:

1.   **GPU hardware specs**: Memory bandwidth and peak throughput (explained below). 
2.   **Context length:** assumed 200k tokens. 
3.   **Active parameter count of the model:** Assumed 32B to keep things simple on a single GPU. 
4.   **Some idea about your product**: Whether it's driven by user prompts or programmed loops, duty cycle of your user profile (explained at the end), etc. 

The specifics of the model architecture matter surprisingly little, unless it's something entirely different like diffusion.

If you're comfortable/familiar with the architecture of LLMs, use this legend to skip to the sections that interest you:

*   [Resources on a single GPU](http://injuly.in/blog/napkin-inference-cost/index.html#resources-on-a-single-gpu)
*   [Cost of a Matrix Multiplication](http://injuly.in/blog/napkin-inference-cost/index.html#cost-of-a-matrix-multiplication)
*   [An Overview of Language Models](http://injuly.in/blog/napkin-inference-cost/index.html#an-overview-of-language-models)
*   [Attention in Greater Detail](http://injuly.in/blog/napkin-inference-cost/index.html#attention-in-greater-detail)
*   [Reducing Compute with KV-Cache](http://injuly.in/blog/napkin-inference-cost/index.html#reducing-compute-with-kv-cache)
*   [How much does a token cost?](http://injuly.in/blog/napkin-inference-cost/index.html#how-much-does-a-token-cost)
*   [How many users can you serve realistically?](http://injuly.in/blog/napkin-inference-cost/index.html#how-many-users-can-you-serve-realistically)
*   [Optimizing for hundreds of users on a GPU](http://injuly.in/blog/napkin-inference-cost/index.html#optimizing-for-hundreds-of-users-on-a-gpu)
*   [Tokens Per Second](http://injuly.in/blog/napkin-inference-cost/index.html#tokens-per-second)
*   [Dollar cost per user](http://injuly.in/blog/napkin-inference-cost/index.html#dollar-cost-per-user)

## Resources on a single GPU

For any GPU on the market, you can find on its spec sheet two key metrics:

1.   **Peak throughput:** Number of floating-point operations executed per second. Usually in TeraFLOPs (1 TFLOP/s = ops/sec). 
2.   **Memory bandwidth**: Amount of data that can be moved from global memory (VRAM) to registers (SRAM). Usually in TB/sec. 

We'll assume FP-8 quantization to compute throughput, though it's easy to adjust the math for FP-16 as well.

## Cost of a Matrix Multiplication

If you bothered to click on this article, you know that AI models do _many_ matrix multiplications on _massive_ matrices. That we start by finding the cost of a matmul should be no surprise then.

Assume two matrices: and . Let their product be the matrix . From high school algebra, we know that each element of can be computed as:

In this, we find our first insight into the "cost" of a matrix multiplication. For each , we need to start with an initial value of 0 and:

1.   Load from memory. 
2.   Load (B^{j,k}) from memory. 
3.   Multiply them together. 
4.   Add the result of #3 to the cumulative sum so far. 

And this is done a total of times _per item._ So, the cost of a `(N,d)*(d,M)` matrix product is memory accesses and floating-point operations.

With an optimization called tiling, the memory access goes down to about . The details aren't necessary to proceed, but [Alvin's blog post](https://alvinwan.com/how-to-tile-matrix-multiplication/) has them for those curious.

## An Overview of Language Models.

At their core, LLMs are simple – they receive a sequence of `N` words and generate the `N+1`th. Each word is represented as a vector with `d` entries. Using repeated applications of a function called "attention" (explained later), they predict the next word.

A single forward pass roughly looks like this:

```
y = input() # y = matrix of size N x d
for each layer in the network:
  y = attention(y)
 
# Convert the final layer's output to word-probs.
# W_vocab = matrix of size d x vocab_len,
# and vocab_len is the number of all words
# in the model's vocabulary.
token_probs = softmax(y * W_vocab)
next_tok    = token_probs(argmax(token_probs))
# next_tok is a (1 x d) vector
```

This is also why LLMs are called auto-regressive. They can keep doing multiple forward passes over their own output until a `<stop>` token is generated.

This is a simplified overview of where I'm skipping RoPE, the MLP layers in between, token sampling at the end, and much more. As mentioned earlier, you can add those in and still verify that our math will work out by a [Fermi estimation](https://en.wikipedia.org/wiki/Fermi_problem).

## Attention in Greater Detail

Let's place the `attention` function under a magnifying glass.

As you saw, the input is a matrix , and is a single dimensional vector. For every "layer" in the network, the model stores matrices , and computes "attention" as follows:

, and

Or, in python:

```
def attention(X, W_q, W_k, W_v):
    Q,K,V = X @ W_q, X @ W_k, X @ W_v
    Q_KT = Q @ K.transpose(2,1)
    return softmax(Q_KT / sqrt(d_model)) @ V
```

Where `@` is the dot-product of two matrices.

In reality, multiple LLM conversations are processed in parallel. So inference is batched—where we process chats concurrently. This means our input sequence .

Work the math out on paper to verify it tracks.

In our Python code, just the transpose arguments change:

```
- Q_KT = Q @ K.transpose(2, 1)
+ Q_KT = Q @ K.transpose(0, 2, 1)
```

Only, there's one trouble with our implementation of attention: it **reads too much data from memory.** Let's look at a single matmul, the . Companies that serve models will allow you to chat with them for up to 200k or so tokens. For a single `K@W_k` matmul, it looks like this:

```
X   = tensor(B, N, d) # "B" chats, each with a maximum of "N" 'tokens'.
W_k = tensor(d, d)    # weights have no batch dimension
O   = tensor(B, N, d) # result of X @ W_k
```

Notice that the output is another tensor.

As established in the matmul cost section, to compute each , we need memory reads and compute operations.

For a batch size of (number of concurrent conversations), we get:

1.   **Floating-point operations:** . 
2.   **Memory accesses:** . 

Assume N to be roughly 200k, and d to be `8192` (most common outside frontier labs). Meaning that to generate one token for a single user, we need **26 trillion floating-point ops** and **1.7 billion memory accesses.** This is _with_ the tiled matmuls. That's **way** more compute ops than memory reads. In fact, we're doing four orders of magnitude more compute than memory accesses. The next batch of input will have to wait tens of thousands of cycles for the GPU to finish with the current batch.

On diagramming the above matmuls out on paper, you'll notice a key detail— we're wasting far too many resources to re-compute the matmul products for tokens that **were already processed in a previous iteration**.

Recall that LLMs are auto-regressive. They:

1.   Take a list of tokens , do a bunch of matmuls. 
2.   Repeatedly do `attention(X, weights)` at L (for L layers), and generate a new token 
3.   append to (the chat thus far). 
4.   Put the output of 3 back into step 1, until a "STOP" token is generated. 

To avoid re-processing the entire chat history _again_ for every new word, inference engines will cache the pairs for reuse.

## Reducing Compute with KV-Cache

The intermediate output on every chat, namely and , is cached at every layer, and stored in a region of VRAM called the **KV Cache.** Inference engines like vLLM allow programmers to decide what percentage of VRAM should be pre-allocated for this.

Of course, it's not as easy as I made it sound. There's a lot of cleverness applied to make optimal use of the memory vLLM is handed, the details for which you can find in [this presentation](https://youtu.be/5ZlavKF_98U) by the original authors.

For our napkin math, the existence of KV-cache allows one simplification: **for every forward pass, we get to process only the most recently generated word, rather than the entire history**. i.e., instead of processing a , we get (the most recent token).

The math for `X @ W_k` now becomes:

```
X   = tensor(B, 1, d)
W_k = tensor(d, d)
O   = tensor(B, 1, d)
```

For a batch size of (number of concurrent conversations), we get:

1.   ~26.2 million memory accesses 
2.   ~52.4 million ops 

Meaning that for every memory access made, we need only perform _two_ operations rather than 10 thousand. For the entire batch, we're doing **2*B operations per memory access.** This is fantastic! Now, let's pull out the spec-sheet for the fastest GPU available and figure out how many tokens we can generate per second (and for how many users).

## How much does a token cost?

Let's take the NVIDIA B200 as our leading example for the remainder of this. From a web search, you'll find that it has the following specs:

1.   Memory bandwidth: 8 TB/s (Or bytes accessed per second). 
2.   Compute intensity: 4500 TFLOP/s (Or bytes crunched per second). 

See that? A Blackwell class GPU can crunch bytes **562 times faster** than it can load them. Put differently, to get the most out of such a chip, we should be doing **562 computations for every byte loaded.** Any more, and we have memory bandwidth sitting idle (e.g: without a KV-cache). Any less, and we have compute cores sitting idle.

We're doing **2*B**. So, how many users should we serve to fully exhaust a B200's compute and bandwidth budget?

With a single NVIDIA B200 GPU, we should be serving **331 users concurrently** to get the most out of our investment. Of course, this is a theoretical ceiling. In reality, VRAM is limited. We'll have to squeeze the model weights in there along with the huge KV-cache.

## How many users can you serve realistically?

We'll assume a 32B dense model – about as much as a 192G chip can comfortably support. This could be a Gemma, Qwen, DeepSeek, whatever. Different techniques and parameter sizes cancel out to yield roughly the same result, off by maybe a 5-10% margin. Back to our problem: we have a 32B model. This is `32*10^9` bytes, or 32GB, in VRAM. Let's assume a context window of =200k tokens. The input is –dimensional at every layer.

For each layer, we need to store bytes for a pair of K and V matrices. A model of our size will typically have `d=8192` and `L=64`. Giving us:

```
KV cache size = 2 *    N    *  L *  d
              = 2 * 200_000 * 64 * 8196
              = 210 GB (!!)
```

That's more VRAM than our GPU has!

Here, I'll invoke another optimization that models of this size use: [Grouped-Query-Attention](https://arxiv.org/pdf/2305.13245). If attention was new to you, you may save this for future reading and rely on my claim that it cuts down the KV cache size by about 8x.

But if you're familiar with Multi-Head-Attention then GQA is simple: It shares the same KV-head across multiple Query heads. So for 64 query heads, we'll use a total of only 8 KV-heads; i.e: Q-heads 0-7 share the first KV-head, Q-heads 8-15 the next one, and so on.

With GQA our KV-cache is now at ~**26GB**_per chat sequence (or per user)_.

We're already using **32GB** for weights, so how many concurrent chat contexts can we store in the KV-cache in the remaining 160GB? That's 160/26 = 6.

So about six chat's going parallely. That seems… low.

## Optimizing for hundreds of users on a GPU.

Most contexts will never reach the 200k token limit, even if that is the context window you advertise to customers. Depending on your product, the median LLM-conversation can be anywhere between 4-40k tokens.

We can split the KV-cache into chunks, and then allocate those chunks to different users as their token use increases. Conversation threads that are abandoned/cold can be flushed out of the cache. This is what vLLM does with [PagedAttention](https://hamzaelshafie.bearblog.dev/paged-attention-from-first-principles-a-view-inside-vllm/). Depending on the median user activity, you can serve anywhere between **40-60 users per Blackwell chip**, depending on what you assume for the conversation length.

Remember that the nature of your product matters too. In most ChatGPT-style apps the user spends more time reading than prompting. For a median chat session, a user will likely have 80% idle time. Here, the GPU has a duty cycle of 20% (!).

So realistically, one chip can serve ~300-800 users comfortably depending on the style of app. Of course, this won't hold if you're using some harness to feed the agent with data in a loop.

## Tokens Per Second

Earlier, we saw that we can comfortably support 6 users at 100% duty cycle. But what would be the speed observed by them?

Again, this is a direct consequence of our memory-to-compute ratio. For a single forward pass, we'll move all the model weights + KV-cache from VRAM to registers _once_. Then, we'll do 2*B operations for every byte loaded.

So the total time spent is:

```
time spent moving data (in seconds)
    = memory in GB  / bandwidth in GBps 
    = 190GB / (8*10**3) GBps 
    = 0.02375 seconds
    = 23.75 ms 

time spent computing 
    = 190 * 2 * 6 / 4500 TFLOPs
    = 0.5ms
```

Since both happen in parallel, the compute cores are idle 98% of the time.

Every 24ms, we generate B=6 tokens. For 1s (=1000ms), we generate roughly 250 tokens for 6 users, or about 40 tokens per user per second.

Assuming the LLM output is meant for reading (unlike, say, building SQL queries in the background), 40 tokens per second is beyond most people's reading speed.

## Dollar cost per user

This largely depends on whether you own or rent your hardware. At $40,000 per B200, your lifetime cost per user is `40_000/num_users`.

In the 100% duty cycle case (worst for cost), that's 6k$ per user. Realistically, serving 500 users per GPU you'll spend a lifetime cost of about $133 per user, plus the datacenter/upkeep bill.

If you rent the GPU, the cost is more straightforward. At $3 per hour for a B200, your cost per user per hour is `3/num_users`. for `num_users=500` you get a cost of about $0.006 per user per hour, or `$4.32` per month.

So as long as you charge them more than $4.32, your operating costs are covered.

As an AI company, you'll have more than one GPU (I hope). So you'll be load balancing users across a cluster of GPUs where our equations change somewhat. Sadly, we're out of space on our napki-

