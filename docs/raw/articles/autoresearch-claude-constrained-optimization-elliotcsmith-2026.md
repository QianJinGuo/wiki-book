---
source_url: https://www.elliotcsmith.com/autoresearch-claude-and-constrained-optimization/
source_type: newsletter
ingested: 2026-07-04
sha256: bd04c58424e8d344ae69cd325a7b2b332d82970716f2045552fc99b957eae7bd
---

# Autoresearch, Claude and Constrained Optimization

You don't need to look far to find claims that folks have been using AI to do the work of dozens of people. I tend to be skeptical of any claim that discusses improvements without evidence. I decided to take that skepticism and put it to work. This had a minor overlap with the whole 'loops' discussion on X but that's coincidental.

Over the last few weeks I have put together a project in the theme of Karpathy's 'Autoresearch'. I wanted to choose a problem that was not a traditional machine learning or numerical optimization problem but one that still had some objective measure of success.

I chose file compression because the objective and the constraints were simple. A compression algorithm is better if the final file size is smaller. I added two constraints to the problem, one being that the uncompressed file needed to match perfectly and the other that neither compression or decompression could exceed 300 seconds.

I used Claude Code with default settings on Sonnet 4.6. Prior to any agent involvement I setup a basic scaffold for the project. I picked Rust because some of the implicit constraints like "don't modify the function signature" were easily enforceable via the type system. I put together a stub of the compress and decompress function which both just copied the bytes across.

I then put in place a couple of basic unit tests to test the compress-decompress round trip on both a string and a simple file. From there I put together a benchmarking script. This script fetched some public domain file samples across video, audio and text as well as created some files filled with random data of various sizes.

I ran ten iterations and then completed a final extended benchmark against some common compression tools and on a new dataset to control for any data-specific optimization. These iterations were run over the course of about two weeks usually kicked off and left to run while I was doing other things.

Results: The agent-driven compression improved file size by 34% on average compared to the stub implementation. The best-performing iteration combined LZ4-style dictionary encoding with a bit-packing layer. Against production tools (gzip -9, zstd, brotli), the agent's algorithm achieved 68% of zstd's compression ratio while being 2x faster to decompress. All code available at github.com/smitec/agent-compression.

This demonstrates that an AI agent can autonomously develop a non-trivial algorithmic solution to a constrained engineering problem, with measurable success metrics. The approach is significantly different from traditional ML-based optimization because it doesn't require gradient computation — it uses the agent's ability to search the design space through code modification and empirical testing.
