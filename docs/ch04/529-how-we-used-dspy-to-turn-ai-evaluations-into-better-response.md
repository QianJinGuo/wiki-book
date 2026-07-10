# How we used DSPy to turn AI evaluations into better responses in Dash chat

## Ch04.529 How we used DSPy to turn AI evaluations into better responses in Dash chat

> 📊 Level ⭐⭐ | 4.5KB | `entities/how-we-used-dspy-to-turn-ai-evaluations-into-better-response.md`

# How we used DSPy to turn AI evaluations into better responses in Dash chat

> Source: [How we used DSPy to turn AI evaluations into better responses in Dash chat](https://dropbox.tech/machine-learning/how-we-turned-ai-evaluations-into-better-responses-in-dash-chat) | Score: v*c=81

## Overview

Markdown Content:
The AI features in Dropbox bring together company knowledge from documents, messages, meetings, and other sources. Users can then ask questions in one place and get answers from the Dash chat agent. Agent quality—how well our chat agent helps users accomplish their goals—is evaluated using a suite of large language model-as-judge evaluations. These evaluations provide a way to measure how well an agent is performing and identify opportunities to improve. Rather than judging only a final response, they inspect the full trajectory an agent takes to satisfy a user’s goal: how it interprets intent, gathers context, uses tools, handles ambiguity, grounds its answer, and completes the task.

We built agent evaluations as the foundation for improving the chat agent. These evaluations are the powerhouses behind the judges that measure the chat outcomes, given the context available to the agent, including relevance, reasoning quality, evidence use, robustness, task completion, and alignment with user asks. Once we had that foundation, we used DSPy to turn evaluation into improvement. DSPy is an open-source framework for [optimizing AI systems](https://dropbox.tech/machine-learning/optimizing-dropbox-dash-relevance-judge-with-dspy) using evaluation feedback.

We applied DSPy and its optimization algorithms in two stages. First, we used it to improve the judges themselves, calibrating them against a small set of human-labeled examples so their scores better matched human judgment. Then, we used those improved judges to optimize the chat agent’s system prompt. This created a feedback loop: human labels improved the judges, the judges produced scalable evaluation signals, and those signals improved the agent. As a result, users saw significantly fewer incomplete answers and we were able to reduce our token usage too, without compromising answer quality.

In this story, we’ll explain how we set up the evaluation layer, calibrated judges against human labels, applied DSPy—along with its optimization algorithms such as GEPA and MIPROv2 to improve judge performance—and then used those judges to optimize the chat agent itself.

## The hidden complexity of agent evals

Agent evaluation is significantly more complex than traditional search relevance evaluation because the object being judged is no longer a single, isolated output. Instead, it is the result of a multi-step process. The agent must interpret user intent, gather context, and decide when and how to use tools. It also needs to synthesize information across sources before determining whether to answer directly, search for more information, summarize its findings, or ask for clarification.

This makes evaluation much broader. A good agent response might depend on multiple knowledge sources, including documents, prior messages, meeting notes, or tool calls such as search and read documents. The quality of the final answer depends not only on what information was found, but also on how the

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/how-we-used-dspy-to-turn-ai-evaluations-into-better-response.md)

---

