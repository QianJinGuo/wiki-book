# Software After AI

## Ch01.769 Software After AI

> 📊 Level ⭐⭐ | 6.1KB | `entities/tomtunguz-com-software-after-ai.md`

# Software After AI

## 深度分析

URL Source: https://tomtunguz.com/harnessing-ai/

Published Time: 2026-05-27T00:00:00Z

Markdown Content:
The end of the software era is the beginning of the harness era.

AI outmoded SaaS managed databases with fixed workflows with intelligence. Like a mustang, AI is powerful but wild. Harnessing the power means domestication.

[![Image 1: The seven components of an AI agent harness arranged radially around the LLM at the center : context & memory, tools & action, orchestration & loop, state & persistence, sandbox & compute, observability & governance, & cost & workflow optimization](https://res.cloudinary.com/dzawgnnlr/image/upload/w_1512,h_1208,c_fill,g_auto,q_auto,f_auto/cqywnzvfzccdohec4kjw)](https://res.cloudinary.com/dzawgnnlr/image/upload/q_auto,f_auto/cqywnzvfzccdohec4kjw)

There are seven parts to this domestication :

1.   Context & memory : General models need bespoke retrieval. The system that fetches the right context for a radiologist is not the system that fetches it for a paralegal.

Sometimes it’s a lot of short-term memory. What was the agent working on 45 seconds ago? Other times it’s large-scale image retrieval, say for radiology or for video generation. Other times it’s a keyword search across a billion documents. Those systems will be bespoke to each individual use case to drive the best accuracy.

Sitting alongside retrieval is the context database, the recipe book of how each business actually runs. The standard operating procedures we all carry in our heads & bring to work every day are those recipes. Capturing them initially & evolving them as both people & process change is the essence of the context database.

2.   Tools & action : Tools are how the agent affects the outside world. The recipes in the context database describe what to do. Tools are the ingredients & utensils that actually do it.

A modern harness exposes tools through a registry, validates the arguments the model passes, dispatches the call, gates sensitive actions behind approvals, & parses the result back into the agent’s loop. MCP has emerged as the connective tissue. The quality of a harness depends on how many tools it can safely expose & how cleanly it handles their failures.

3.   Orchestration & loop : The agentic loop is think, act, observe, repeat. Planning, decomposition, sub-agents, retries, & stop conditions define how the work gets done.

We also expect our software to improve as we use it. Closed loop patterns that learn from each run will separate different vendors.

4.   State & persistence : In a large-scale enterprise with lots of different people working on a system, the system needs to be resilient. When a harness crashes at step 7 of a 10 step task, it should resume at step 8, not restart from zero. File systems, checkpoints, session threads, & artifact storage are the mechanisms that prevent lost work.

5.   Sandbox & compute : Each agent needs a sandbox in which to play. Isolated Unix workspaces, controlled network egress, & credentials that live outside the model are what make sandboxes secure, confidential, & fast at scale.

6.   Observability & governance : You cannot trust what you cannot see. Tracing every step, logging every tool call, running evals as regression tests, & putting humans in the loop for the highest stakes decisions are how a demo becomes a production system. Guardrails enforce policy. Evals catch regressions before customers do.

7.   Cost & workflow optimization : The seventh discipline is architectural judgment. What should be deterministic versus non-deterministic? Which model is the right one for each step, state of the art, medium, small, or fine-tuned? What knowledge belongs in skills versus in memory?

The result is a new competitive dynamic in software.

This won’t work in every category. The markets the major labs prioritize will benefit from their ability to move quickly & their direct control of the models. But that leaves thousands of separate markets up for startups.

What happens when every company has access to the same model? The best riders win.

The 1-minute read that turns tech data into strategic advantage.

 Read by 150k+ founders & operators.

GP at Theory Ventures. Former Google PM. Sharing data-driven insights on AI, web3, & venture capital.

[Bloomberg](https://www.bloomberg.com/news/articles/2025-04-30/google-places-ads-inside-chatbot-conversations-with-ai-startups "Quoted on AI monetization strategies") • [WSJ](https://www.wsj.com/tech/tech-media-telecom-roundup-market-talk-f8f0355a "Featured in tech market analysis") • [Economist](https://www.economist.com/business/2023/07/25/next-generation-googles-run-a-tighter-ship "Quoted on next-generation tech leadership")

## 相关实体
- [Novee Security How To Get A 100 Conference Acceptance Rate The No](ch01/1211-0.html)
- [How Aws Smgs Uses An Ai Powered Conversational Assistant To ](../ch05/088-ai.html)
- [滴滴国际化客服质检智能化之路基于 Amazon Bedrock 的多语种多业务线质检实践](../ch11/157-amazon-bedrock.html)
- [Automate Aml Alert Triage With Amazon Quick And Snowflake Co](../ch11/214-amazon-quick.html)
- [对抗 Agent 遗忘Kollab 基于Amazon Bedrock Agentcore 的团队Ai工作空间实践](../ch04/532-amazon-bedrock-agentcore.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/tomtunguz-com-software-after-ai.md)

## 相关主题

---

