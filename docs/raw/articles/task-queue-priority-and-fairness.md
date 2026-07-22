---
source: newsletter
source_url: https://temporal.io/blog/task-queue-priority-and-fairness-your-task-queue-your-way
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 5
ingested: 2026-05-15
sha256: f890e4c0c1955e52987ad354f930efbfb34dddee47669ba46e7451f9b9d5d155
---
# Task Queue Priority and Fairness: Your Task Queue, your way
Published Time: 2026-05-12
Markdown Content:
As Temporal users scale, many hit the same wall: _a single Task Queue with no execution controls isn’t enough_. You start building your own prioritization logic on top of Temporal, spinning up separate Queues as a workaround, or discovering that one high-volume tenant is quietly delaying everyone else.
We’ve seen teams assemble elaborate homegrown solutions (multiple additional infrastructure components and custom scheduling logic) just to get the basic execution control their applications needed.
**Task Queue Priority and Fairness**, now [Generally Available](https://docs.temporal.io/develop/task-queue-priority-fairness) for all SDKs, address these problems directly. Priority lets you control which [Tasks](https://docs.temporal.io/tasks) execute first. Fairness ensures no single Workflow, user, or tenant can monopolize your Workers. Together, they give you the primitives to build sophisticated, equitable Task execution strategies without the custom infrastructure.
## **Priority: Execute your most important Tasks first**[#](https://temporal.io/blog/task-queue-priority-and-fairness-your-task-queue-your-way#priority-execute-your-most-important-tasks-first)
**Task Queue Priority** lets you assign priority levels to your Workflows and Activities, so higher-priority Tasks get processed before lower-priority Tasks. This is especially useful when critical and background work share the same Task Queue.
### How it works[#](https://temporal.io/blog/task-queue-priority-and-fairness-your-task-queue-your-way#how-it-works)
You assign an integer Priority from `1` (highest) to `5` (lowest) to Workflows, Activities, or Child Workflows. Tasks are dispatched in Priority order: all `priority-key=1` Tasks are processed before any `priority-key=4` Tasks, for example. When multiple Tasks share the same Priority level, they’re processed in FIFO order, unless you also enable Fairness (more below).
```
await client.start_workflow(
  MyWorkflow.run,
  args="hello",
  id="my-workflow-id",
  task_queue="my-task-queue",
  priority=Priority(priority_key=1), # highest priority
)
```
### Use cases[#](https://temporal.io/blog/task-queue-priority-and-fairness-your-task-queue-your-way#use-cases)
**Time-sensitive operations.** Consider an e-commerce platform where payment processing Workflows share Workers with inventory sync Workflows. Payment Workflows need to complete quickly, while inventory syncs can tolerate some delay. Assigning higher Priority to payment Workflows ensures customers aren’t waiting while a bulk operation consumes all Worker capacity.
**SLA-based processing.** If you offer tiered service levels (Enterprise, Professional, Free), Priority lets you ensure Enterprise customer Workflows are processed before Free-tier ones during high-load periods, with no separate infrastructure required per tier.
**Emergency overrides.** When a critical situation arises (a system alert, a VIP customer request), you can start a Workflow at maximum Priority to cut through any backlog. You can set the Priority level when starting a Workflow as well as modify the Priority level for one that’s already running.
**AI agent workloads.** In agentic AI systems, some Tasks are on the critical path of a user-facing response while others run in the background. Priority lets you ensure that user-blocking inference calls or tool executions complete before background enrichment or logging Tasks consume Worker capacity. If your agents handle both interactive requests and scheduled batch work, Priority is the right tool for keeping latency predictable for end users.
## **Fairness: Equitable resource distribution**[#](https://temporal.io/blog/task-queue-priority-and-fairness-your-task-queue-your-way#fairness-equitable-resource-distribution)
**Priority** allocates Tasks to virtual queues based on Priority level, while **Fairness** ensures that Tasks within the same virtual queue are dispatched according to the weights you specify.. In multi-tenant systems, one customer’s high-volume workload can quietly starve everyone else. Fairness prevents that.
### How it works[#](https://temporal.io/blog/task-queue-priority-and-fairness-your-task-queue-your-way#how-it-works-1)
**Fairness Keys** group Tasks into logical buckets. A weighted round-robin algorithm then selects Tasks across those buckets, ensuring each Key gets a proportional share of execution time regardless of how deep any individual Task Queue gets.
```
await client.start_workflow(
  MyWorkflow.run,
  args="hello",
  id="my-workflow-id",
  task_queue="my-task-queue",
  priority=Priority(fairness_key="a-key", 
fairness_weight=2.0 # dispatch twice as often vs default
),
)
```
Even if Tenant A has 1,000 Workflows queued and Tenant B has only 10, Workers will alternate between processing Tasks from both tenants. Tenant B’s Workflows don’t get buried behind Tenant A’s backlog.
### Use cases[#](https://temporal.io/blog/task-queue-priority-and-fairness-your-task-queue-your-way#use-cases-1)
**Multi-tenant SaaS applications.** This is the most common use case. Without Fairness, a single large customer submitting thousands of Workflows can delay every other tenant on your platform. By using tenant IDs as Fairness Keys, you guarantee consistent service for all customers regardless of volume.
**Department or team isolation.** In enterprise settings where multiple teams share a Temporal Cluster, Fairness gives each team predictable access to Worker resources. **Fairness Weights** let you go further: you might give your team a larger proportional share of Workers when contention is high, while still allowing other teams to use available capacity freely when Workers are idle. This is more flexible than hard resource caps and better suited to variable Workloads.
## Combining Priority and Fairness[#](https://temporal.io/blog/task-queue-priority-and-fairness-your-task-queue-your-way#combining-priority-and-fairness)
The two features are more powerful together. **Priority** determines execution order; **Fairness** determines how execution is distributed across tenants or logical groups. Used in combination, you can support differentiated service levels and a guaranteed performance floor at the same time.
Here’s an example for a multi-tenant reporting platform:
```
result = await client.execute_workflow(
      OrderWorkflow.run,
      "order-42",
      id="order-42",
      task_queue="shared-queue",
      priority=Priority(
          priority_key=1,
          fairness_key="tenant-acme",
          fairness_weight=5.0,
      ),
  )
  print(result)
```
What this achieves:
*   Tasks are dispatched in **Priority** order first, so urgent work always moves ahead
*   Within the same Priority level, **Fairness** Keys ensure each tenant gets a proportional share of Workers.
*   No single tenant can starve others, regardless of how many Tasks they have queued or how high their Priority is set.
This combination is well-suited to SaaS platforms that need to offer differentiated service tiers (via Priority) while guaranteeing every tenant a baseline of service (via Fairness).
## **Getting started**[#](https://temporal.io/blog/task-queue-priority-and-fairness-your-task-queue-your-way#getting-started)
Task Queue Priority and Fairness are Generally Available.
To use **Priority** in Temporal Cloud, simply set `priority-key` on your Workflows, Activities, or Child Workflows. For self-hosted Temporal Server, ensure the `matching.useNewMatcher` and `matching.enableMigration` dynamic configuration options are set to `true`.
To use **Fairness** in Temporal Cloud, navigate to the Namespace Overview page and activate the Fairness toggle, then set `fairness-key` and optionally `fairness weight` on your Workflows, Activities, or Child Workflows. For self-hosted Temporal Server, ensure the `matching.useNewMatcher`, `matching.enableFairness`, and `matching.enableMigration` dynamic configuration options are set to `true`.
Priority and Fairness work with your existing Task Queues and require no changes to your Worker code. Workers automatically respect Priority ordering and fair distribution when polling for Tasks.
## **Best practices**[#](https://temporal.io/blog/task-queue-priority-and-fairness-your-task-queue-your-way#best-practices)
**Start simple.** Use a small number of Priority levels (`3` to `5`) rather than designing a complex scheme from the start. You can always add more granularity later once you understand your load patterns.
**Monitor your Task Queues.** Temporal’s observability tools include Task Queue metrics broken down by Priority. Use these to verify that your configuration is having the intended effect, and to spot Priority inversions or unexpected backlog buildups early.
**Document your strategy.** Define clear guidelines for what each Priority level means and what your Fairness Keys represent. This pays off as your team grows and more engineers start writing Workflow code.
**Test under load.** Priority and Fairness produce their most visible effects under high load when there is a Task backlog. Test your configuration with realistic traffic patterns before relying on it in production.
## **What’s next**[#](https://temporal.io/blog/task-queue-priority-and-fairness-your-task-queue-your-way#whats-next)
Task Queue Priority and Fairness are our first step toward richer multi-tenant control in Temporal. We have more to share on that front, so stay tuned.
Both Priority and Fairness are available for self-hosted Temporal users. For Temporal Cloud users, using Fairness will incur additional charges. For each hour a Namespace has the Fairness feature enabled, an additional 0.1 Actions will be charged per Action in the Namespace. For more details on Fairness pricing, check out [these docs](https://docs.temporal.io/cloud/pricing#fairness-pricing).
We’d love to hear how you use these features. Join the conversation in the [Temporal Community Slack](https://t.mp/slack) or our [Forum](https://community.temporal.io/), and let us know what you build.
Check out the [Documentation](https://docs.temporal.io/develop/task-queue-priority-fairness) to get started.