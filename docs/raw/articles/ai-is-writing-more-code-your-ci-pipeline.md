---
title: "AI Is Writing More Code. Your CI Pipeline Can’t Keep Up"
type: raw-article
source: newsletter
source_url: https://www.cloudbees.com/blog/ai-is-writing-more-code-your-ci-pipeline-cant-keep-up
tags: [cloudbees, ci-cd]
ingested: 2026-05-20
sha256: a1b6732292841cce
review_value: 7
review_confidence: 8
review_recommendation: strong
review_stars: 4
---
# AI Is Writing More Code. Your CI Pipeline Can’t Keep Up
Title: AI Is Writing More Code. Your CI Pipeline Can’t Keep Up
URL Source: https://www.cloudbees.com/blog/ai-is-writing-more-code-your-ci-pipeline-cant-keep-up
Markdown Content:
AI-assisted development and management’s ever-faster release expectations are driving a surge in code changes.
Teams push more commits, trigger more builds, and run more pipelines than ever before. It’s accelerating delivery—but it’s also driving up costs.
Every code change triggers a CI run. Every CI run executes a test suite. At enterprise scale, those tests create longer pipelines, higher cloud costs, and slower feedback loops that block developers from moving forward.
Organizations that want to ship faster while controlling infrastructure costs need to rethink how testing works. That means shifting from running every test to running the tests that matter most.
In this article, we'll break down where CI costs actually come from, what's driving them up, and how intelligent test selection brings them back down, drawing on production data and real customer outcomes.
## [CI Pipelines Are an Infrastructure Cost](https://www.cloudbees.com/blog/ai-is-writing-more-code-your-ci-pipeline-cant-keep-up#ci-pipelines-are-an-infrastructure-cost)
Most engineering leaders think about cloud spend in terms of production systems like applications serving customers, databases, APIs, and uptime.
But a large portion of compute spend never touches production.
It runs in your CI pipelines.
Every time a developer pushes code, your CI system starts a new job. That job spins up compute, builds the application, and runs tests.
Now, multiply that across a typical enterprise. With a team of hundreds of developers, you’re likely pushing dozens of code commits per hour. Each commit triggers a pipeline, and each one of those pipelines runs hundreds of tests.
That adds up quickly.
If 500 developers each trigger just five pipelines per day, that’s 2,500 pipeline runs daily. If each run executes 1,000 tests, you’re running 2.5 million tests every day. Each one consumes compute, time, and infrastructure.
And that’s a conservative estimate.
These workloads run continuously, often in parallel, and scale automatically with engineering activity. But unlike production systems, they rarely get the same level of cost scrutiny or optimization.
At enterprise scale, CI pipelines become one of the largest and fastest-growing sources of compute spend. Most organizations don’t realize it, because they’re just not measuring pipeline that way.
## [Test Execution Drives Most CI Spend](https://www.cloudbees.com/blog/ai-is-writing-more-code-your-ci-pipeline-cant-keep-up#test-execution-drives-most-ci-spend)
When teams look at CI costs, they often focus on builds or deployment because those steps are the most visible, easiest to measure, and directly tied to shipping code.
But build steps are short and predictable. They compile code, install dependencies, and package the application. In most pipelines, this takes a few minutes.
Deployment is even less frequent. Many teams only deploy after tests pass, and often only from specific branches or at certain stages. They don’t deploy after every commit, and so deployment doesn’t dominate pipeline time.
Meanwhile, every code change triggers a pipeline. Based on CloudBees Smart Tests [production benchmarks](https://www.cloudbees.com/ci-waste-calculator), the tests can last anywhere from 45 to 90 minutes. For a team of 50 engineers running a 60-minute suite at industry-average costs, that adds up to more than $250,000 in annual CI waste—and that’s before accounting for the engineering time lost to triage and reruns.
And not all of those tests add value.
In any given suite, you’ll have many tests that are redundant or low-value, plus flaky tests that cause reruns and debugging cycles. According to our production benchmarks, roughly a third of CI failures are flaky—failures with no underlying code change, triggered by infrastructure noise or timing issues—meaning a significant share of rerun compute is pure waste.
But teams still run all of them, on every commit. This creates three compounding consequences:
*   **Cloud compute cost**. Every unnecessary test keeps compute running longer.
*   **Developer waiting time**. Longer test runs slow feedback and reduce productivity.
*   **Delayed releases**. Long pipelines delay validation, which slows fixes, approvals, and release cycles.
## [AI Has Killed the “Run Everything” Model](https://www.cloudbees.com/blog/ai-is-writing-more-code-your-ci-pipeline-cant-keep-up#ai-has-killed-the-run-everything-model)
AI adoption by developers is widespread and accelerating.
[Most developers](https://survey.stackoverflow.co/2025/ai) now use AI in their workflows, and half do so daily. A recent study showed that daily users increase their [pull request output](https://getdx.com/blog/ai-assisted-engineering-q4-impact-report-2025/#:~:text=Looking%20across%20more,1.4%20PRs/week.) by nearly 65 percent over those who don’t use AI at all.
If you do a full test suite on all that additional code development, those 2.5 million tests now become 4.1 million tests. The increase in tests erodes the very productivity gains AI is supposed to deliver.
AI helps developers write code faster. But if every additional change triggers a longer pipeline, developers spend more time waiting for feedback, rerunning tests, and investigating failures.
In short, the “run everything” model breaks at modern scale.
The historical model of running the entire test suite on every change was designed for smaller codebases and slower development cycles.
At enterprise scale, this approach forces a tradeoff. You can either run all tests at the cost of slower pipelines and higher CI costs. Or, you can run fewer tests and live with reduced confidence in your releases.
## [A Smarter Approach: Intelligent Test Selection](https://www.cloudbees.com/blog/ai-is-writing-more-code-your-ci-pipeline-cant-keep-up#a-smarter-approach-intelligent-test-selection)
There is a better way to approach testing.
Instead of running every test on every change, teams can run only the tests that are relevant to the newly introduced code.
This approach, often called intelligent test selection, analyzes what changed in the codebase and identifies which tests are most likely to catch issues. It then prioritizes those tests and skips the ones that don’t add value for that specific change.
Teams shift from running all tests every time to running the right tests at the right time.
This approach reduces the amount of work each pipeline performs.
For example, imagine a developer updates the payment validation logic in a single service.
In a traditional pipeline, that change still triggers the entire test suite. The CI will run UI tests for unrelated features like search or user profiles. You’ll waste time running integration tests for notifications and reporting systems. Finally, the system will run end-to-end tests that simulate entire user journeys across the application.
That’s potentially thousands of tests.
With CloudBees Smart Tests, the pipeline focuses only on what matters for that change. Using AI-driven test selection, the platform analyzes what changed and automatically identifies the relevant tests—no manual configuration required.
For that payment validation update, that might mean unit tests for the payment logic, integration tests for the payment service and its dependencies, and end-to-end tests covering checkout and payment flows.
Instead of thousands of tests in a 45-to-90-minute run, you're looking at roughly 100 highly relevant ones. By running the fewest tests necessary to identify bugs, you can safely reduce CI runtime, maintain release confidence, and avoid unnecessary compute usage.
## [The Benefits of Faster CI Pipelines](https://www.cloudbees.com/blog/ai-is-writing-more-code-your-ci-pipeline-cant-keep-up#the-benefits-of-faster-ci-pipelines)
Faster CI pipelines change how the entire organization delivers software.
When pipelines complete faster, developers can validate whether their fixes worked sooner. That speed reduces developer idle time and keeps work flowing through the system.
At the same time, shorter pipelines reduce infrastructure usage. One CloudBees customer, a DevOps test data management platform, [used SmartTests](https://www.cloudbees.com/customers/test-data-platform-doubles-release-velocity) to save three to five cloud virtual machine (VM) instances per test hour. On top of the cloud cost savings, they reallocated more than 40,000 engineering hours each year toward building instead of waiting, rerunning, and debugging.
Faster pipelines also reduce developer interruptions. Instead of waiting on slow or noisy test results, teams can focus on building and shipping. Less time spent rerunning flaky tests or investigating irrelevant failures means more time spent on meaningful work.
And most importantly, faster pipelines accelerate delivery. The customer doubled their annual release velocity after adopting Smart Tests, moving from quarterly to monthly releases.
When validation happens quickly, changes move through the software delivery lifecycle faster, and features reach production sooner. All of these improvements compound over time.
## [Faster Software Delivery Starts with Smarter Testing](https://www.cloudbees.com/blog/ai-is-writing-more-code-your-ci-pipeline-cant-keep-up#faster-software-delivery-starts-with-smarter-testing)
Engineering teams have spent years optimizing how they build and deploy software. But as development velocity increases, testing has become the limiting factor.
What once ensured quality at small scale now creates friction at enterprise scale. Running every test on every change no longer guarantees better outcomes. Instead, it increases pipeline runtime, drives up infrastructure costs, and slows the feedback loops teams depend on to move quickly.
The path forward is not to run fewer tests blindly. It’s to run the right tests based on what actually changed and what is most likely to fail. CloudBees Smart Tests makes that possible. Customers have cut regression testing time by up to 80% and reduced pre-commit testing from six hours to two. Faster pipelines, lower compute costs, and teams that can actually focus on shipping.
[![Image 1: CloudBees CI Waste Calculator](https://images.ctfassets.net/vtn4rfaw6n2j/3Vxcwo12LMqPEmDcGNpUyL/57541ba6b9b3c01bcfde0757ace08164/CTA_-_CloudBees_CI_Waste_Calculator.png?fit=pad)](https://www.cloudbees.com/ci-waste-calculator)