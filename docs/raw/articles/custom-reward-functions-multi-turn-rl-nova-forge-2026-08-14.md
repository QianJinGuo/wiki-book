---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/custom-reward-functions-for-multi-turn-reinforcement-learning-with-amazon-nova-forge
ingested: 2026-08-15
feed_name: AWS China ML
source_published: 2026-08-14
sha256: 21bebec61ceb6fc9
---

# Custom reward functions for multi-turn reinforcement learning with Amazon Nova Forge

In multi-turn reinforcement learning (RL), your custom reward function decides what the model actually learns. A subtly wrong reward can quietly teach the wrong thing while every training curve looks healthy. Designing a reward that holds up over multi-turn, agentic tasks is one of the hardest parts of customizing [Amazon Nova models](<https://aws.amazon.com/nova/>). For multi-turn training, [Amazon Nova Forge](<https://aws.amazon.com/nova/forge/>) runs your reward logic in your own environment through its [Bring Your Own Orchestration (BYOO)](<https://docs.aws.amazon.com/nova/latest/nova2-userguide/nova-hp-rft-forge.html>) capability. You can focus on defining what a good outcome looks like while Nova Forge coordinates rollouts, message passing, and conversation state across turns. Nova Forge also offers a serverless multi-turn RL option, now generally available, for teams that prefer not to manage that environment. This post uses the BYOO path.

Amazon Nova offers multiple customization approaches, with [reinforcement fine-tuning](<https://docs.aws.amazon.com/nova/latest/nova2-userguide/nova-reinforcement-fine-tuning.html>) (RFT) standing out because it can teach models the behaviors you want through iterative feedback. RFT takes a different approach from supervised fine-tuning (SFT). Rather than requiring curated examples with annotated reasoning paths, it learns from evaluation signals on the model’s own outputs. Multi-turn RFT extends this to agents that act over a sequence of steps, such as calling tools, executing code, or recovering from a mistake. It optimizes cumulative reward across the whole trajectory rather than grading a single response. At the heart of RFT lies the reward function: the scoring mechanism that guides the model, and the part you design.

_Figure 1 — Out-of-distribution (OOD) performance after equal-compute post-training from a shared checkpoint. RL improves OOD generalization across all task variants while SFT degrades. Adapted from Chu et al., 2025_

This post focuses on the reward function itself: how to design a composite multi-turn reward that [Group Relative Policy Optimization (GRPO)](<https://arxiv.org/pdf/2402.03300>) can learn from. This post also shows how to execute model-generated code safely inside the reward, and why to instrument each component so you can trust what training is learning. [Part 1 of this series](<https://aws.amazon.com/blogs/machine-learning/deploying-multi-turn-rl-infrastructure-for-amazon-nova-on-amazon-sagemaker-hyperpod/>) covers the Amazon SageMaker HyperPod and Nova Forge infrastructure. It also covers the training configuration that runs these rewards. We close with the pitfalls that can quietly collapse a reward, drawn from a real run where the highest-weighted component silently contributed no learning signal at all. We show how to catch them. The code throughout is illustrative. Use it as a starting point for your own reward implementation.

## Prerequisites

To follow along, you need the following:

  * An [Amazon Nova Forge](<https://aws.amazon.com/nova/forge/>) subscription, which provides the Nova Customization SDK and the multi-turn RFT APIs.
  * The [multi-turn RFT infrastructure from Part 1](<https://aws.amazon.com/blogs/machine-learning/deploying-multi-turn-rl-infrastructure-for-amazon-nova-on-amazon-sagemaker-hyperpod/>) of this series: 
    * An [Amazon SageMaker HyperPod](<https://aws.amazon.com/sagemaker/ai/hyperpod/>) cluster, a customer-managed environment on Amazon Elastic Container Service (Amazon ECS).
    * An Amazon Simple Storage Service (Amazon S3) bucket for rollout data and checkpoints.
  * The example code for this post, including the reward environment and a walkthrough, from the [aws-samples/sample-nova-multi-turn-rl-infra](<https://github.com/aws-samples/sample-nova-multi-turn-rl-infra>) repository.
  * The custom reward environment is opt-in: in [cdk.json](<https://github.com/aws-samples/sample-nova-multi-turn-rl-infra/blob/main/cdk.json#L30>), set use_custom_env to “true” and [custom_env_id](<https://github.com/aws-samples/sample-nova-multi-turn-rl-infra/blob/main/cdk.json#L31>) to your environment ID (for example, “my-custom-env”) before you deploy. By default the stack uses the built-in wordle environment.
  * Familiarity with reinforcement fine-tuning and GRPO.



## Building custom rewards with Amazon Nova Forge

RFT works by sampling completions from the current model and scoring them with a reward function. In Nova Forge, the reward function is a grader you write in code, and not a separately trained reward model. It can be a rule-based check that verifies the output (reinforcement learning with verifiable rewards), or it can call another large language model (LLM) to judge the response, an approach known as LLM-as-Judge.

RFT then adjusts the model weights to make higher-reward completions more likely. Nova Forge uses GRPO. For each conversation, GRPO uses the reward function to rank K model rollouts. GRPO uses the highest-ranked model completions to update the model according to the normalized reward (the advantage) of the batch. RFT with GRPO is a fundamental technique achieving noticeable performance gains over initial SFT.

> A reward signal influences learning only through the variation it creates _within a group_. If a term takes the same value for every completion in a group, it contributes nothing to the advantage. It therefore contributes nothing to the gradient.

How your reward function runs with Nova Forge depends on the task. With single-turn RFT, you register the reward as an AWS Lambda function and point your recipe at it through `reward_lambda_arn`. Multi-turn tasks like the one in this post exceed what a single Lambda invocation supports. Multi-turn conversations and long-running scoring run past the 15-minute Lambda invocation limit. For these, Nova Forge uses BYOO. You set `rollout.delegate: true` and run your environment and reward logic in an environment container, for example on Amazon ECS. Nova Forge delegates each rollout to your environment. It then collects the completed episodes back for training. Your container manages the multi-turn interaction and conversation state: it runs the user simulator, executes code, and calls a verifier. It then returns an aggregate reward per sample (`aggregate_reward_score`), plus an optional list of per-component scores (`metrics_list`). [Part 1 of this series](<https://aws.amazon.com/blogs/machine-learning/deploying-multi-turn-rl-infrastructure-for-amazon-nova-on-amazon-sagemaker-hyperpod/>) covers this infrastructure and its AWS Cloud Development Kit (AWS CDK) deployment. This post focuses on the reward.

## How reward evaluation works

The training job generates candidate rollouts from the Nova model for each prompt. In a multi-turn task, a rollout is a full _episode_ with a sequence of turns (a _trajectory_), not a single response. Your reward function receives each rollout and performs three steps:

  * **Runs the task logic.** For a conversational task, this can include a user simulator that responds to the model turn by turn.
  * **Scores the completed trajectory** across one or more reward components (for example, task correctness, an intermediate-behavior signal, and penalties), reporting each through `metrics_list`.
  * **Returns an aggregate reward per rollout** (`aggregate_reward_score`), which training turns into within-group advantages.



_Figure 2 — A single multi-turn rollout: Nova Forge delegates to your environment container, which asks the simulator or runs the committed code, then returns a reward score for GRPO_

This cycle repeats over many training steps, progressively shaping the model to maximize cumulative reward across the whole sequence. The model optimizes toward whatever your reward actually rewards, which, as we show, is not always what you think you wrote.

## Choosing the structure of a multi-turn reward

Single scalar rewards are straightforward to game, and a single terminal reward is often too sparse to learn from in multi-turn tasks. Most production multi-turn rewards therefore combine three kinds of signal: outcome rewards, behavioral rewards, and penalties.

Episode-level (outcome) rewards capture whether the final artifact satisfied the goal. For example, did the unit tests pass, or did the workflow complete? They target the thing you ultimately care about, but they tend to be sparse and near-zero early in training.

Turn-level (behavioral) rewards capture whether the model exhibited the intermediate behavior you want, such as asking before acting, calling the right tool, or avoiding loops. They are best for shaping behavior the outcome reward is too sparse to teach, though they can be earned without real progress if not designed carefully. Penalties explicitly discourage a failure mode such as guessing, repeating, or stalling. They separate good and bad strategies so the optimizer sees a gradient.

Combine these so the model learns both the behavior _and_ the outcome, without one component masking or starving the other. The rest of this post makes that concrete. We design a four-component reward for a real task and execute model-generated code safely inside it. Then we walk through the pitfalls that can collapse such a reward and how to fix them.

## Worked example: Teaching Amazon Nova Lite 2.0 to ask before coding

We built a multi-turn collaborative-coding task over 500 unique programming tasks. We trained Amazon Nova Lite 2.0 on it with multi-turn RFT, using GRPO with Low-Rank Adaptation (LoRA), on [Amazon SageMaker HyperPod](<https://aws.amazon.com/sagemaker/ai/hyperpod/>), implementing the reward inside a customer-managed environment container (the Nova Forge BYOO path).

The mechanics are as follows:

  * The model sees a brief, **under-specified** coding request.
  * A **user simulator** holds the full specification privately and reveals a detail only when the model asks.
  * Each turn, the model either asks a clarifying question or commits code. If it asks, the simulator answers and the conversation continues. If it commits code, the rollout ends and your reward handler executes that code against hidden unit tests to score correctness. (Running model-generated code safely is a concern we return to later.)



The design intent is that guessing produces wrong code, while asking surfaces the hidden detail and leads to correct code. “Ask first” should be forced by the task.

### Designing the reward

Make the target behavior directly and independently rewardable, and penalize the failure mode explicitly. For this task, the reward is a weighted sum of four components:

**Component** | **Weight** | **Definition**  
---|---|---  
`correctness` | 1.0 | fraction of hidden unit tests passing on the final code  
`asked_before_coding` | 0.6 | 1.0 if asked on turn 1 then committed; 0.6 if asked later then committed; else 0 (un-gated)  
`guessed_immediately` | 0.4 | penalty: -1.0 if the first turn is code with no question  
`loop_penalty` | 0.2 | -0.5 if the last two turns are more than 80% similar  
  
Two principles drive the design. First, un-gate the behavior you want: `asked_before_coding` is credited on its own, not conditioned on `correctness`, but it does require the model to eventually commit code, which closes the “ask forever, never answer” loophole. Second, penalize the failure mode: `guessed_immediately` makes guessing strictly worse than asking, which restores variation between strategies within a GRPO group, the variation the algorithm needs to produce a gradient.

Call these component scorers inside the reward handler in the environment container, and report each value through `metrics_list`:
    
    
    def asked_before_coding(completion, answer, **kw) -> float:
        msgs = _messages(completion, kw)
        first_q = _first_question_turn(msgs, parser)
        final = _final_code(completion, parser)
        committed = bool(final) and not _is_question(final)
        if first_q == 1 and committed:
            return 1.0          # asked first, then committed (ideal)
        if first_q is not None and committed:
            return 0.6          # asked later, then committed
        return 0.0              # never asked, or asked but never committed
    
    def guessed_immediately(completion, answer, **kw) -> float:
        for m in _assistant_turns(completion, kw):
            code = _code_of(parser.parse(m["content"]))
            return -1.0 if (code and not _is_question(code)) else 0.0
        return 0.0

### Executing model-generated code safely

The `correctness` component runs model-generated code against unit tests. **Model output under RL is optimized through exploration, so treat it as not validated.** The container runs in its own isolated execution environment, but you should still take precautions. Do not expose credentials or network to the generated code. Apply resource limits and run in a temporary directory. Use a per-run random sentinel so the model cannot forge the result by writing the expected marker to stderr. For execution that requires additional isolation, call a dedicated sandbox. This harness shows the pattern:
    
    
    import resource, secrets, subprocess, sys, tempfile
    from pathlib import Path
    
    def run_tests(code: str, test: str, timeout_s: int = 30) -> float:
        nonce = secrets.token_hex(8)                       # unforgeable per-run marker
        harness = (
            "import sys, unittest, json\n"
            f"{code}\n\n{test}\n\n"
            'if __name__ == "__main__":\n'
            "    r = unittest.TextTestRunner(stream=sys.stderr, verbosity=0).run(\n"
            "        unittest.TestLoader().loadTestsFromModule(sys.modules[__name__]))\n"
            f"    sys.stderr.write('__{nonce}__' + json.dumps("
            "{'total': r.testsRun, 'passed': r.testsRun - len(r.failures) - len(r.errors)}) + '__"
            f"{nonce}__')\n"
        )
        def _limit():
            resource.setrlimit(resource.RLIMIT_CPU, (timeout_s, timeout_s))
            resource.setrlimit(resource.RLIMIT_AS, (2 * 1024**3, 2 * 1024**3))   # 2 GB
            resource.setrlimit(resource.RLIMIT_NPROC, (64, 64))
        with tempfile.TemporaryDirectory() as cwd:
            path = Path(cwd) / "h.py"
            path.write_text(harness)
            try:
                proc = subprocess.run(
                    [sys.executable, str(path)], capture_output=True, text=True,
                    timeout=timeout_s, cwd=cwd, env={"PATH": "/usr/bin"},   # no creds, no network env
                    preexec_fn=_limit,
                )
            except Exception:
                return 0.0
        # parse the nonce-delimited summary and validate the test count before scoring
        ...

Also validate the number of tests actually run against the number expected, so the model cannot dilute the score with its own trivially-passing tests. For reward functions deployed in live environments, implement these security measures rather than treating them as optional.

## Pitfalls: What makes a reward collapse, and how to fix it

Multi-turn reward design has a well-known set of failure modes. Reward hacking is where the model games a proxy instead of achieving the goal. Training instability is where updates diverge and entropy collapses or the Kullback-Leibler (KL) term blows up. Reward collapse is where the signal degenerates until within-group variation disappears and learning quietly stops. The first two usually announce themselves in transcripts or in loss and KL curves. Collapse is the dangerous one: aggregate reward, loss, and completion-length curves can all look healthy while a component you’re counting on contributes nothing. This section covers the two collapse failures that cost us the most time on this task, and how to catch them.

### When a reward collapses to a single strategy

An earlier version of this reward gated the asking bonus behind `correctness`. You earned the asking reward only if the final code also passed. It also added an efficiency term that rewarded shorter conversations. Training collapsed. The model converged to guessing on turn one. The mean reward froze, and the GRPO advantage went to zero.

Two design errors caused it. First, the gate sat behind an unreachable condition. Correctness was near zero on these hard tasks, so the asking bonus almost never fired. The behavior we wanted to reward was invisible to the optimizer. Second, the efficiency term had a degenerate optimum. Fewer turns maximized it, so the policy collapsed onto a single, non-committal turn. Every completion looked alike, within-group variation vanished, and learning stopped.

The fix is the design in the previous section: un-gate the behavior you want, and penalize the failure mode explicitly. With both in place, distinct strategies keep producing distinct rewards within a group, which preserves the variance GRPO needs to learn.

### Silently dead component

When a reward component returns the same value for every completion in a GRPO group, its within-group variance is zero. As a result, it contributes nothing to the advantage or the gradient, even at the highest weight. The components that still vary keep aggregate reward, policy loss, advantage, and completion length looking healthy, so the curves never reveal it. One common cause in code rewards is a correctness scorer that returns 0 on every rollout because the harness never executes the model’s output. This can happen because of mismatched entry-point names, failed imports, or a setup error that makes every test fail before its assertions run. In our run, this is exactly what happened: the model’s clarifying-question rate rose from roughly 34–96 percent. Code correctness barely moved, because the `correctness` scorer was returning the same value on every rollout.

To catch a dead component, track each component’s within-group standard deviation, not the aggregate reward curve. Aggregate curves hide a dead channel behind the live ones. If that spread sits at or near zero, the component isn’t training, whatever its weight. The usual root cause in code rewards is a correctness scorer stuck at 0 because the harness never actually binds to and runs the model’s output. Fix that and confirm the spread becomes non-zero.

### Instrument so you catch these early

Several habits catch these failures, and would have caught ours on day one:

  1. **Instrument per-component contribution to the advantage, not just per-component reward.** Report each component through `metrics_list`, and track its mean _and_ its within-group standard deviation. Any component with near-zero within-group variance contributes nothing to learning, regardless of its weight. You might dismiss a flat reward mean of 0.000 as “these tasks are just hard,” but a flat within-group variance is unambiguous. Automate this as a per-component advantage-variance panel so dead channels are flagged automatically, without manual inspection.
  2. **Read transcripts sorted by the component you’re testing, not by total reward.** Sorting by total reward hides a dead component behind the live ones. Sorting by the suspect component surfaces the problem immediately.
  3. **Ablate or revive every component you claim is doing work.** If removing a component changes nothing, it was not doing work. If reviving a component recovers a metric you assumed was already optimized, it was not in the objective.
  4. **Design for within-group variance.** GRPO learns from differences between completions of the same prompt. Unreachable gates, degenerate shaping optima, and saturating terms all collapse that variation and stop learning even when the reward looks fine. Un-gate the target behavior and penalize the failure mode so strategies separate.
  5. **Watch for one dense reward starving another.** Once our dense asking reward saturated, the sparse `correctness` reward could not move the policy. If a behavioral shaping term dominates, the outcome term you care about may never get a gradient. Consider down-weighting a shaping term once it saturates, or up-weighting the outcome term.
  6. **Treat model output as not validated.** Sandbox any execution of generated code (no credentials, no network, resource limits) and make verifiers unforgeable (random sentinels, test-count validation).



## Clean up

The training run and environment in this post use SageMaker HyperPod and Amazon ECS resources that incur cost while they run. When you finish experimenting, follow the teardown steps in Part 1 of this series to delete the SageMaker HyperPod cluster and the Amazon ECS environment, which stops the largest charges. Remove the rollout data and checkpoints from your Amazon S3 bucket if you no longer need them.

## Conclusion

The reward function is the part of RFT you design, and it is where the subtle failures live. In your runs, the model may learn the behavior you train for while a term you care about contributes nothing to learning, with no aggregate metric revealing it. Better instrumentation, not a better algorithm, fixed the issue. Measure each component’s contribution to the advantage, read transcripts through the lens of the component you’re testing, and ablate what you claim is working. With a custom reward function on Amazon Nova Forge you have full control over the reward, which means the responsibility for getting it right is yours. For the infrastructure and AWS CDK deployment that make these runs reproducible, see [Part 1 of this series.](<https://aws.amazon.com/blogs/machine-learning/deploying-multi-turn-rl-infrastructure-for-amazon-nova-on-amazon-sagemaker-hyperpod/>)

### Acknowledgements

Special thanks to Mahima Chaudhary for their review and contributions to this post.

* * *

## About the authors

### Maria Masood

Maria specializes in agentic AI, reinforcement fine-tuning, and multi-turn agent training. She has expertise in Machine Learning, spanning large language model customization, reward modeling, and building end-to-end training pipelines for AI agents. A sustainability enthusiast at heart, Maria enjoys gardening and making lattes.

### Nick Biso

Nick is a Machine Learning Engineer at AWS Professional Services. He solves complex organizational and technical challenges using data science and engineering. In addition, he builds and deploys AI/ML models on the AWS Cloud. His passion extends to his proclivity for travel and diverse cultural experiences.

### Laurent Mombaerts

Laurent is a Senior Applied Scientist on the Science and Economics team within AWS Worldwide Sales and Marketing. His research spans LLM post-training, multimodal agentic systems, and search and information retrieval, with an emphasis on translating advances in AI into practical solutions for AWS customers. He holds a PhD in Engineering from the University of Luxembourg, with doctoral research conducted in collaboration with the University of Cambridge.
