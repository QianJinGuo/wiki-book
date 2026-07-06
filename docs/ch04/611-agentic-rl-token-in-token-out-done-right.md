# Agentic RL: Token-In, Token-Out Done Right

## Ch04.611 Agentic RL: Token-In, Token-Out Done Right

> 📊 Level ⭐⭐⭐ | 6.4KB | `entities/agentic-rl-token-in-token-out.md`

# Agentic RL: Token-In, Token-Out Done Right

## 深度分析

Published Time: May 28, 2026

Markdown Content:
You’re training an LLM with RL. Single-turn looks great: clean curves, sane rewards, things converge. But modern models are enhanced with tools, and that’s exactly what you want: to train an _agent_.

So you upgrade your training loop to allow the model to call a tool mid-rollout. You start with an easy task, and the curves get weird. Loss occasionally spikes for no obvious reason. And eventually it fails with a shape mismatch error.

What’s almost certainly going on: your rollout loop is silently violating the **Token-In, Token-Out** (TITO) invariant. You parsed the model’s response to detect tool calls, then re-tokenized the updated conversation for the next turn. Usually that round-trip gives back the same tokens. Sometimes it doesn’t, and the gradient ends up on a sequence the model never sampled. The code doesn’t crash, but the math is silently broken and the gradient signal becomes completely unreliable.

Two ways to fix it.

The first is to abstract the chat template behind a per-model interface. For every family you train on, you hand-code a renderer that knows how to format messages, parse completions, and bridge between turns without re-rendering. It’s tricky to get right. The [`renderers`](https://github.com/PrimeIntellect-ai/renderers) library does this. It works, and it covers the major open-weights families today. The cost is structural: every new model needs a new hand-coded renderer, and changes to any template propagate as ongoing maintenance.

The second is to design the training around one rule: **never re-encode tokens you’ve decoded.** Follow it, and the tricky edge cases vanish. You’re left with a single property to check on the chat template: it must be prefix-preserving for tool messages (we’ll explain). Turns out the vast majority of templates in the wild already satisfy it. This is Token-In, Token-Out done right, and that’s what this post is about.

## [Train on the model’s own tokens](https://qgallouedec-tito.hf.space/#train-on-the-models-own-tokens)

tl;dr RL updates the model on the exact tokens it sampled, and nothing else. Simple now, load-bearing later.

Reinforcement learning, in one breath: you sample a prompt, the model generates a completion, you score the completion, you backprop the gradient through the model’s generated tokens.

Single-turn RL loop.

sample prompt

`[{"role": "user", "content": "What's 2+2?"}]`

tokenize prompt

10 23 42 17 99"<user>What's 2+2?</user><eos>"

generate completion

4 7 99"4.<eos>"

compute reward

+1

backprop on assistant tokens

∇ on 4 7 99

One detail matters more than it looks. The gradient is computed on the tokens the model generated. That sounds obvious. What else would you train on? It is obvious. Remember it anyway, because you’re going to break it sooner than you think.

Multi-turn doesn’t change much. The model is allowed to call a tool mid-rollout: it emits a tool call, something on the outside runs the tool, the result is appended back into the conversation, and the model picks up from there. The rollout is just longer now: a few model turns, a few tool turns, a final answer.

Multi-turn RL loop, with a tool call.

sample prompt

`[{"role": "user", "content": "What's 2+2?"}]`

tokenize prompt

10 23 42 17 99"<user>What's 2+2?</user><eos>"

generate completion

50 71 13 99"<tool_call>calc(2+2)</tool_call><eos>"

execute tool and append result

60 4 61 99"<result>4</result><eos>"

generate completion

4 7 99"4.<eos>"

compute reward

+1

backprop on assistant tokens

∇ on 50 71 13 99+4 7 99

The rule carries over: backprop on the tokens the model produced. Not the tool’s response (those didn’t come from the policy).

The takeaway is small and very specific: **in RL, you optimize on the exact tokens the model produced.** Right now it reads like a definition. Later in the post, it’s the thing that breaks.

## [Decoding doesn’t undo encoding](https://qgallouedec-tito.hf.space/#decoding-doesnt-undo-encoding)

tl;dr Tokenization isn’t reversible: decode a sequence, re-encode the text, and you can land on different tokens.

Going from messages to tokens is mechanical: a chat template renders the messages into a string, then the tokenizer chops that string into integer IDs.

```
>>> from transformers import AutoTokenizer
>>> tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct")
>>> messages = [
...     {"role": "user", "content": "What's 2+2?"},
...     {"role": "assistant", "content": "4."}
... ]
>>> tokenizer.apply_chat_template(messages, return_dict=False)
[151644, 8948, 198, 2610, 525, 1207, 16948, 11, 3465, 553, 54364, 14817, 13, 1446, 525, 264, 10950, 17847, 13, 151645, 198, 151644, 872, 198, 3838, 594, 220, 17, 10, 17, 30, 151645, 198, 151644, 77091, 198, 19, 13, 151645, 198]
```

Most of the time you don’t think about it. You feed messages, you get tokens, the model does its thing.

Multi-turn is where it starts to matter. When the assistant emits tokens, you d

## 相关实体
- [Claude Code开发负责人 为何放弃Rag而选择Agentic Search](../ch03/075-claude-code.md)
- [Skill Os Learning Skill Curation Self Evolving Agents](ch04/216-self-evolving-agents.md)
- [Hermes Agent Deep Dive](../ch03/090-hermes-agent.md)
- [Baixing Ontoz Enterprise Ontology Multi Agent](../ch03/045-agent.md)
- [Yann Dubois Openai Post Training Interview](../ch01/435-openai.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/reinforcement-learning-rlhf.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentic-rl-token-in-token-out.md)

---

