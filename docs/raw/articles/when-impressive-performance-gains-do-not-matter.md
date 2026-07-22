sha256: c6f7793978d068e3a098454e5bb7746b07a015a1a2f6aeaa74d35f81de84afcd
---
title: "When Impressive Performance Gains Do Not Matter"
source_url: "https://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/"
ingested: 2026-06-29
type: article
tags: []
---

# When Impressive Performance Gains Do Not Matter


Published Time: 2026-06-28T17:08:50.000Z

Markdown Content:
Jun 28, 2026

![Image 1: When Impressive Performance Gains Do Not Matter](https://storage.ghost.io/c/d3/13/d313bae5-6633-4ef2-8565-d9e72c1a5da1/content/images/size/w2000/2026/06/vondelpark.jpg)
Of anything I’ve worked on in my career, performance work has been the most rewarding. I enjoy making systems more efficient, especially when it opens up brand new possibilities for customers. I also find developing an empirical understanding of systems is one of the best ways to learn how systems work from first principles, especially how complex systems interact, at scale, or under load. But one of the greatest benefits of performance work is the creativity that comes from working intimately with systems. Through performance work, I find people develop a wealth of ideas for how products and services can be improved, most of which are not even related to performance optimization.

While improving performance always feels good, impressive claims like “10 times faster” or “an order-of-magnitude more efficient” or “fifty percent fewer resources” may not have the impact you anticipate due to constraints that are not always obvious or intuitive. This is an essay about three of those constraints.

## Attention Threshold

Recently, I worked on improving the query performance of a new database that returns data to a user interface for graphing and interactive analysis. We were developing the new database with the goal of improving response time by an order-of-magnitude over the existing database that had been used for many years. The most expensive queries against the old database took between 5 and 10 minutes. After months of difficult engineering, we got the same queries to complete between 30 seconds and 1 minute—an order-of-magnitude improvement.[[1]](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fn1) A presentation to management highlighting these performance gains would look very impressive—queries that used to take 10 minutes now return in 1 minute. However, I insisted it wouldn’t have the impact we wanted unless we squeezed out an additional order-of-magnitude.

Human-factors research identifies 10 seconds as the limit for keeping someone’s attention.[[2]](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fn2) For delays longer than this, people will perform other tasks while they wait.[[3]](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fn3) Therefore, even though a query that used to take 5 minutes now took 30 seconds, both were well above the 10-second threshold of attention. In both cases, people will context-switch—check their messages, go for coffee, start a conversation, start another task. When they finally return their attention a few minutes or hours later, the user interface will have loaded, but the time it actually took is immaterial.

Ultimately, if we could not complete queries in under 10 seconds, our performance improvements would not have an impact on changing the way people work. In complex systems, improving performance by an order of magnitude is often an incredibly difficult feat.[[4]](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fn4) Sadly, we needed another order-of-magnitude improvement—queries had to complete in under 10 seconds to hold users’ attention.[[5]](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fn5)

## Going From One to Two

Years ago, I worked on a project where we made incredible gains in efficiency by automating manual tasks, removing unnecessary steps, parallelizing parts of the process, and deferring steps that could be completed later, asynchronously. It improved the overall process from a few hours to reliably under an hour—somewhere between a 25 to 50 percent improvement. We were understandably excited about this impact.

As it turned out, this improvement in software performance didn’t impact the overall process because it was constrained by logistics. To demonstrate, consider a plumber, an electrician, or a carpenter. They each need to schedule work at a location, travel to that location, and then complete the work. For the sake of argument, if they work 8 hours in a day, and it takes 8 hours to complete the work at a location, then it doesn’t really matter if a process improvement just saved 2 or 3 hours, because there still isn’t enough time to travel to a new location and complete a new job. If you can’t get each job below 4 hours, including travel time, then you can’t complete two in a day. Breaching thresholds like this can be incredibly difficult and the efficiency gains along the way don’t pay off until you do. Going from one to two can be incredibly hard.[[6]](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fn6)

## Backpressure in Pipelines

The software infrastructure for many businesses includes data pipelines where events are produced from many different sources—vehicles, factory equipment, mobile phones, financial transactions—then processed reliably to drive many other services and applications. The events are usually persisted to a durable log from which downstream services consume and process events. To achieve high throughput at scale, the log must be partitioned and the downstream services use techniques like batching, pipelining, parallelism, efficient memory allocation, dynamic scaling, and more.

Performance bottlenecks in data pipelines can be hard to find because the system dynamics are correlated. A slow stage in the pipeline will backpressure to the upstream stages, by design.[[7]](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fn7) If there are multiple bottlenecks in the pipeline—and with these systems, this is common—the overall throughput will not improve until every last bottleneck is removed.

It is a good engineering practice to break pipelines into stages and understand the performance dynamics and limitations of each stage. But many times I have seen engineers disappointed when they improve a single stage by many orders of magnitude only to see it have no effect on the overall throughput.[[8]](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fn8) If you are going to make throughput improvements to pipelines, the number that matters is the end-to-end throughput.

## Conclusion

Performance work can be incredibly challenging, but it is also a discipline for intimately understanding complex systems and engineering better products.[[9]](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fn9) Just be sure that incredible gains in performance actually have the desired outcomes.

If you need to hold people’s attention, you only have about 10 seconds. If whole increments are a constraint, percentage gains are not enough, you need to be able to go from one to two. To maximize throughput in pipelines that backpressure, often you need to resolve all the bottlenecks, not just one or two. Otherwise, in each of these examples, even order-of-magnitude improvements in performance may not matter.[[10]](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fn10)

* * *

1.   I had developed a number of prototypes that convinced me we had the right architecture and that the technologies we were betting on were going to continue to mature in the right direction. But engineering production systems is always way harder than developing prototypes, with inevitable surprises along the way. People usually underestimate this. Elon Musk [commenting](https://x.com/elonmusk/status/1308284091142266881) on battery manufacturing: "The extreme difficulty of scaling production of new technology is not well understood. It’s 1000% to 10,000% harder than making a few prototypes." [↩︎](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fnref1)

2.   Robert B. Miller’s 1968 paper [Response Time in Man-Computer Conversational Transactions](https://dl.acm.org/doi/10.1145/1476589.1476628) is often cited and others have built on this work. 0.1 seconds is the threshold for perceiving immediate feedback, about 1 second for task continuity, and approximately 10 seconds to maintain attention on the overall task. Providing feedback through mechanisms like progress indicators or time estimates can help with holding a person’s attention. [↩︎](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fnref2)

3.   I have a theory that people are willing to wait longer during their initial investment in a task. For example, if you are searching for airline tickets, you will be patient while it takes 10 seconds or more to complete the search, as long as the rest of the process is fast after the initial results are displayed. I am not aware of research that tries to quantify this. [↩︎](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fnref3)

4.   Improving any engineered process by an order of magnitude can be incredibly difficult. Improving it by two orders of magnitude is that much harder. The investment required is usually nonlinear. [↩︎](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fnref4)

5.   In the end, we were able to get the majority of queries to complete in under 10 seconds, even for some queries that were impossible to make before because they would exceed timeouts. Beyond the query latency of the data, the query latency for the metadata and the rendering time of the webpage were also important breakthroughs in improving the overall performance. I am hopeful we are not done. Through improvements to asynchronous IO and data aggregation, there is a chance we could improve performance by a third order-of-magnitude. If so, queries that currently take seconds, and used to take minutes, will return in under 1 second. [↩︎](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fnref5)

6.   This is a good example of where focusing on performance had many other benefits. With all the attention paid to this process, we ended up making many quality and reliability improvements that directly impacted the customer experience. Not to be underestimated in situations like this, even small gains in performance can improve iteration speed in test environments, which will support faster development of new features and resolution of defects, even if the performance improvements were not the breakthrough needed in production. [↩︎](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fnref6)

7.   See [Reactive Streams](https://www.reactive-streams.org/) for a formalization of the concept of backpressure in software systems. [↩︎](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fnref7)

8.   I find the best way to understand the dynamics and bottlenecks of systems like this is to work empirically starting at the beginning, incrementally adding steps in the pipeline until the throughput degrades. For example, start by reading events off the distributed log and throwing them away—if you already cannot hit the desired throughput, optimizing any of the downstream stages will be a waste of time. I’m regularly surprised by the number of engineers who start from the downstream, or are quick to reach for profiling tools, rather than use this first-principles approach. You might care about the downstream benchmark—for example, the number of rows per second that can be inserted into a database—but you need to start with the upstream. [↩︎](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fnref8)

9.   Simulation is also a valuable practice to understand complex systems, including performance. See Marc Brooker’s blog [Simple Simulations for System Builders](https://brooker.co.za/blog/2022/04/11/simulation.html) and his talk [Try again: The tools and techniques behind resilient systems](https://www.youtube.com/watch?v=rvHd4Y76-fs) for a few examples. [↩︎](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fnref9)

10.   Why the picture at the top of this blog? Because performance optimization is no walk in the park? No, I wrote this blog sitting on a park bench and that was my view. I thought it would be a nice reminder. [↩︎](http://blog.colinbreck.com/when-impressive-performance-gains-do-not-matter/#fnref10)

