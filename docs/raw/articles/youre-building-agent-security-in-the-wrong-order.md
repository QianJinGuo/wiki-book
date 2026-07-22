---
source: rss
source_url: https://blog.crewai.com/youre-building-agent-security-in-the-wrong-order
ingested: 2026-06-09
feed_name: CrewAI Blog
source_published: 2026-04-02
sha256: 0ae6b25a8b63791a425033f5d9c57be3690f41e229751c9f90c58e65b37c3680
---

# You're building agent security in the wrong order

The agent security market woke up. In two weeks, I've seen companies shipping runtime identity enforcement for autonomous agents, a full platform for discovering shadow agents, revoking permissions in real time, and much more.  
Serious teams behind them. I respect the work.  
But they're all solving step three.

## **The sequence problem**

I've spent the last two years watching enterprise teams deploy agents and we've processed billions of executions at CrewAI, it seems most of the pattern is similar for sequencing problems.  
  
A team gets the mandate: "deploy AI agents." The CISO immediately asks about security. The board wants compliance answers. So the team starts there: IAM policies, authorization scopes, runtime monitoring. They build a security stack around their agents.Then they actually try to run the agents. And the agents can't reliably find the right tools. State drifts between steps. Coordination between agents breaks at every handoff. The security layer is solid. The thing it's securing doesn't work.  
  
I watched a Fortune 500 company come to us with a team that spent three months on this exact path, and they implemented a full enterprise agentic IAM. Beautiful compliance documentation, but then they plugged agents in and realized the harness wasn't there.  
  
This isn't a capability problem, the engineers are good, but I do think there is a sequencing problem.

## **What the sequence actually is**

**First, the harness.** Think about the memory, the efficient tool usage, the state across steps without drifting. When something breaks, how do your agents react, do they surface it to a human or hallucinate around it? You gotta ask yourself if you are optimizing for the right thing, you might find out you don't have something worth securing yet.  
  
CrewAI's Flows architecture addresses this problem by using deterministic routing, observable execution, and escalation paths wired in before you give your workflow different levels of agency. Not because we're paranoid, but because I've seen what happens when teams skip it.

**Second, governance.** Once the harness is reliable, you can define what agents are allowed to do, which data they touch, which operations need human sign-off, where the audit trail lives and more, don’t think of this step as a compliance checkbox, but architecture instead, it will shape the overall workflows it runs, and how it escalates, it’s the process through which you're designing trust into the system.

**Third, identity and auth.** Now you know what your agents do and what they're allowed to touch. Zero trust, least privilege, runtime scoping, it all lands correctly because you're enforcing rules against a known surface area, you're not guessing at what an unpredictable agent might try. In the industry, some might advocate pouring money into step three while most teams haven't finished step one.

## **Why everyone got this backwards**

Because security is the enterprise buying gate.  
Teams lead with the security story because that's what unlocks budget, so the vendors followed the demand. The harness problem doesn't have a deadline, it just causes quiet failures in staging that eventually get very loud in production.  
  
I get it. I'm not saying these vendors are wrong to build what they built, agent governance is real, and identity work is necessary. These are good products solving a real problem. They just can't solve it unless the harness is there.

## **What I keep telling our customers**

Build the harness first, make it boring but make it reliable, make it something you can describe to a security team in one sentence: _" here's exactly what this agent does, here's exactly where it can fail, here's exactly what happens when it fails."_

The teams running production agents at scale all got the order right. Let the security step do its job, give it something real and comprehensible to secure, by then the governance slots in naturally, and you know the surface area. You can define policies that match reality.

The difference is almost never intelligence, it's mostly sequence. Start at step one.
