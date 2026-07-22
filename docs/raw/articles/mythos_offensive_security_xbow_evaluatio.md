---

title: "Mythos for Offensive Security: XBOW's Evaluation"
type: raw
source: newsletter
source_url: https://xbow.com/blog/mythos-offensive-security-xbow-evaluation
tags: [security]
fetcher: jina
review_value: 9
review_confidence: 9
review_recommendation: worth-reading
ingested: 2026-05-18
sha256: 9e6635da291c6563f7d54ab8e6d19969f5b4e4eac972881f9de870e5665da26a

---
Title: Mythos for Offensive Security: XBOW's Evaluation
URL Source: https://xbow.com/blog/mythos-offensive-security-xbow-evaluation
Published Time: 2026-05-12
Markdown Content:
About two months ago, Anthropic invited us to help them assess the capability of a new model they thought represented a significant shift in capability. So we put it through our security gauntlet. Benchmarks, workflows, interactive use, and integrations.
Today, we can finally share details on how we tested Mythos Preview, what we found, and what it means.
Spoilers: This model is a major advance. It is substantially better than prior models at finding vulnerability candidates, especially when source code is available. It communicates with unusual technical precision, reasons well about code, and shows strong promise in complex domains such as native-code analysis and reverse engineering.
Our takeaway: Mythos Preview is a powerful tool for generating strong vulnerability leads and technically precise analysis. It is especially adept at analyzing source code with a security mindset. It's not magic, though: a model is a brain without a body. While source code audits are mostly a brain activity, live site pentests like the ones XBOW performs very much need a body whose skill and control can match the brain's power.
‍
## Testing methodology
The first thing we did was assemble a diverse team of 10 experts from different parts of the company that could assess the model from different directions. We test all models with the same internal benchmarking system we have used to analyze [Opus 4.7](https://xbow.com/blog/anthropic-opus4-7-first-look) and [GPT 5.5](https://xbow.com/blog/mythos-like-hacking-open-to-all). In this system, we take open source applications where vulnerabilities were previously discovered, freeze them at the vulnerable version, and run our agents against them.
But this time, we expanded our testing to analyze other angles as well:
*   The model’s judgment with regard to threat modeling, vulnerability validation, and safety
*   The model’s ability to read source code versus interact with live systems
*   Its ability to find exploits we’re not yet looking for in our standard assessments, e.g., native app vulnerabilities
‍
A note on terminology: When people say “Mythos,” they sometimes refer to the raw model. In this evaluation, we explored Mythos Preview both inside Claude Code, and as a raw model, using it via its API as an engine for XBOW’s agents. We separate those cases because orchestration, tools, prompting, and live-site access materially affect outcomes.
‍
## Results
Our testers who tried out Mythos Preview in interactive use were quite impressed. “This is a lot closer to `just go and find something` than anything I’ve seen so far,” said one of them. We tried giving it our own source code, and it found weaknesses – nothing truly terrible, thankfully, but there were several items we wanted to repair. We tried it on open source software, and at the end of week one, we had quite a few new vulnerabilities we had to disclose.
Our testers who tried out Mythos Preview on benchmarks were also quite impressed, but their appreciation was a slightly different kind: impressed _with data_. Their results also laid bare the difference between areas where the model was runaway powerful, and where it presented only a modest advance. 
‍
## Mythos Preview Benchmark Performance
![Image 1](https://cdn.prod.website-files.com/686c11d5bee0151a3f8021d6/6a03a44b7143f73a7c8260dd_BLOG-Mythos-for-Offensive-Security-Mythos-Benchmark-Performance-inpage-07.png)
Our key takeaways after analyzing Mythos Preview include:
*   It’s extremely powerful for source code audits.
*   It’s good, but less powerful, at validating exploits.
*   Its judgment is mixed. It can be too literal and conservative, and also tends to overstate the practical relevance of its findings.
*   It’s strong in native-code vulnerability discovery and reverse engineering.
‍
## Next-level vulnerability discovery
Mythos Preview presents a significant step up over all existing models, regardless of provider, on XBOW’s web exploit benchmark.
This benchmark is designed to test whether a model can help XBOW find validated, actionable vulnerabilities in live website environments. A case is counted as passed only when the system finds a validated way to act on the vulnerability (PoC||GTFO) after a series of 80 “actions,” where an action might be a shell or a Python script using standard commands or XBOW’s suite of attack tools.
![Image 2](https://cdn.prod.website-files.com/686c11d5bee0151a3f8021d6/6a0396faf689b863af49d660_BLOG-Mythos-for-Offensive-Security-Vulns-in-OSS-inpage-02.jpg)
Note: We haven't included Opus 4.7 in this chart because that model interacts with our system in a unique way, making this particular stat less relevant for it – we’ve written up the [full story here](https://xbow.com/blog/anthropic-opus4-7-first-look).
Compared to the newest model at the time (Opus 4.6), this was a strong increase:
*   The number of false negatives was cut by 42%.
*   In a variation where we gave both models the site’s source code, it was even cut by 55%.
This was the first instance of a theme that would surface again and again: Mythos Preview is impressive at writing code, but even more impressive at reading it.
Below are the pass rates of Mythos Preview, Opus 4.6, and GPT 5.5 as a function of the allowed number of actions (executed scripts). Mythos Preview finds vulnerabilities in significantly fewer iterations than Opus 4.6, although the [difference to GPT-5.5](https://xbow.com/blog/mythos-like-hacking-open-to-all)is less pronounced.
![Image 3](https://cdn.prod.website-files.com/686c11d5bee0151a3f8021d6/6a02250638e6290c613c6f74_BLOG-Mythos-for-Offensive-Security-Mean-Pass-inpage-01.jpg)
It becomes more clear when adding two considerations:
1.   Models could choose many small steps or few large steps ([more details here](https://xbow.com/blog/anthropic-opus4-7-first-look)) – and that shouldn’t matter so much. Instead of giving a budget of actions, let’s consider a budget of output tokens.
2.   Instead of mean pass rate, i.e., the probability of finding a vulnerability, it’s often more instructive to look at the odds for discovery, i.e., what ratio you would bet on the model getting a discovery right. Computationally, that's the hit rate divided by the miss rate.
‍
Under these considerations, the picture becomes much more clear: Token-for-token, Mythos Preview hones in on the vulnerability with absolutely unprecedented precision.
![Image 4](https://cdn.prod.website-files.com/686c11d5bee0151a3f8021d6/6a022559227bd4a589b628ca_BLOG-Mythos-for-Offensive-Security-Web-Vulns-inpage-01.jpg)
### Live-site validation is the hard part
Mythos Preview is excellent at source-code reasoning, but our evaluation reinforced a practical truth: many exploitable issues do not appear as obvious defects in application source code. They emerge from configuration, dependencies, deployment choices, or the way otherwise safe components are combined.
For instance, a dependency on its own could be safe. The source code on its own could be safe. But the source code uses the dependency in an unsafe way and creates a vulnerability. As Gary McCraw [famously declared](https://www.informit.com/articles/article.aspx?p=446451), you won’t find the majority of defects by “staring at code” alone.
That’s of particular interest to us. XBOW performs pentests, where our target is a live site (the way an attacker sees it), whereas Mythos Preview as used, for example, by [Project Glasswing](https://www.anthropic.com/glasswing)excels at auditing source code (the way a developer sees it). Interacting with the live site can be very powerful, but it brings a completely new, very delicate dimension into the mix. Does Mythos Preview change the balance here?
Due to the way we harvest our web benchmarks set, you can actually find the vulnerability from the code alone on that set. So it’s fair to ask: For these benchmarks, can Mythos Preview find an exploit without being allowed to interact with the live site?
It turns out that even for these benchmarks, where the vulnerability is purely in the code, removing access to the live site hurts performance more than removing access to source code. In many ways, live-site access matters more than source-code access. That, of course, is the XBOW value proposition: it gives frontier models a safe, structured way to interact with real application behavior and prove which findings are actually exploitable.
The results of XBOW powered by Mythos Preview are shown below.
![Image 5](https://cdn.prod.website-files.com/686c11d5bee0151a3f8021d6/6a022594fc5228ed0cf0ee48_BLOG-Mythos-for-Offensive-Security-Exploit-inpage-01.jpg)
We now have a solid answer to the question, “Can a model find something interesting in code?” Increasingly, the answer will be yes, even though “something” won’t be the same as “everything.”
But even then, the question still looming is, “Which of these findings are exploitable, reproducible, safe to test, and worth fixing?” The answer lies in combining Mythos Preview’s powerful source code analysis with something like XBOW’s ability to analyze a live site safely, in an orchestrated, validated way.
It’s notable that, even though Mythos Preview suffers greatly from being denied access to the live site, other models suffer even more. Another confirmation that Mythos’ greatest strength is reading source code.
![Image 6](https://cdn.prod.website-files.com/686c11d5bee0151a3f8021d6/6a038a3b3d4cffe7f2503008_BLOG-Mythos-for-Offensive-Security-Mythos-vs-5-5-inpage-02.jpg)
The best results are always, of course, with the combination of access to the live site and source code. It allows the ideal detection pattern when XBOW orchestrates Mythos Preview: Analyze the source code to find a lead, probe the live site to understand how the weakness is reflected in the deployment, then craft an exploit from it.
![Image 7](https://cdn.prod.website-files.com/686c11d5bee0151a3f8021d6/6a02261a57305d2807cb6526_BLOG-Mythos-for-Offensive-Security-Deployment-inpage-01.jpg)
## Other findings
We also explored the model in terms of judgment, reverse engineering, assessment of native apps, and visual acuity.
### Judgment results were mixed
Mythos Preview’s judgment results were more mixed than its discovery results. Across command safety, threat modeling, and trace triage, it was often careful and precise, but also literal and conservative. It rejected false positives better than many predecessors, but sometimes lost true positives when evidence did not formally satisfy its criteria or when the intended rule was broader than the written one. This makes Mythos Preview valuable, but not self-sufficient: it needs precise prompts, explicit threat models, and validation infrastructure to turn strong reasoning into reliable security outcomes.
One bit that slightly shocked us here was Mythos Preview’s performance on our command safety benchmark, where we ask the models to consider whether a given script is safe to execute without impacting the target site. We hand-labeled a large set of example cases close to the edge of the decision boundary, and Haiku 4.5 delivered 90.1% accuracy. We also optimized the prompts for Haiku 4.5, so the better comparison is Opus 4.6, which had a 81.2% accuracy … but Mythos Preview had only 77.8%.
When we probed deeper and looked at its reasoning, it would often have a point. There were cases that technically weren’t against the letter of the rules, but they were against the spirit. Opus 4.6 prioritized the spirit, but Mythos prioritized the letter.
### The model is strong in native code and reverse engineering
Beyond web applications, the model showed substantial strength in native-code vulnerability discovery and reverse engineering.
In Chromium-related testing, it found more real bugs with fewer false positives than prior baselines. In V8 sandbox work, it identified true positives in a subtle threat model where previous approaches had produced many findings but no successful true positives. It also proved capable of triaging both its own results and competitor-model findings.
The reverse-engineering results were among the most striking. The model reasoned through unusual firmware and embedded systems contexts, including architectures and operating-system combinations that required more than rote pattern matching.
### Browser interaction and visual acuity are strong enough for practical workflows
XBOW’s workflows often require models to interact with live websites through a browser interface. In that setting, visual acuity is important: the model needs to identify the right UI element and click in the right place.
The evaluated model performed extremely well on XBOW’s visual-acuity QA, roughly matching Sonnet 4.6 and dramatically outperforming Opus 4.6. It was not perfectly pixel-accurate when asked for exact coordinates, but it was practically effective at selecting the right browser actions.
We should note that Opus 4.7 also shone at this benchmark. Maybe the real story here isn’t “Mythos Preview is good,” but more: This is a specific area where recent Anthropic models had begun to deteriorate. But now Anthropic has caught that deterioration and reversed it.
‍
## Power at a cost
Mythos Preview is not just any new model: it’s a true titan.
But titans are big, and big means expensive. How much money are you willing to spend on how much assurance? Can you spend that same money differently to get better results?
At the time of writing, Mythos Preview is not yet available over public APIs, but Anthropic [did mention](https://www.anthropic.com/glasswing) that it would be 5x as expensive as an Opus model – already one of the more expensive options, token for token. Begging the question:
Could we give an agent powered by a different model more time , and still get more accuracy for less cost?
As it turns out: yes. If we normalize by estimated running cost, the picture is rather clear: Mythos Preview isn’t _terribly_ inefficient, at least if you desire high accuracy, but it’s not best-in-class on our benchmarks either.
![Image 8](https://cdn.prod.website-files.com/686c11d5bee0151a3f8021d6/6a0236d17257fe9086fb59be_BLOG-Mythos-for-Offensive-Security-Mythos-Fixed-Token-inpage-02.jpg)
This finding lines up with similar comparisons, e.g. [Point Estimate’s analysis](https://pointestimate.substack.com/p/how-good-is-mythos) of the [AI Security Institute’s benchmarking](https://www.aisi.gov.uk/blog/our-evaluation-of-openais-gpt-5-5-cyber-capabilities)of Mythos Preview vs GPT-5.5: Mythos Preview is powerful, but the real choice is to either pay for an agent to use Mythos Preview for a bit, or to use GPT-5.5 for as long as needed. The better option depends on the use case; often, it’s the latter.
XBOW’s evaluation suggests that frontier models have taken a major step forward in vulnerability discovery. Mythos Preview is strong at finding candidate vulnerabilities, especially from source code, and shows impressive ability across web, native-code, and reverse-engineering tasks.
But it needs to be mounted in the right harness and equipped with the right tools to reach its full potential. And even then, it should just be one of the arrows in your quiver – depending on the task, it may be more sensible to let another model try several times than to let Mythos Preview try once. Such considerations, after all, are one of the reasons XBOW maintains a cadre of models, rather than restricting itself to a single one.
To see XBOW’s powerful vulnerability validation capabilities in practice, please [contact us](https://xbow.com/contact) for a demo.