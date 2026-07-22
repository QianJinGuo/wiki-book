sha256: 0ac7311eae15ae79470b9caccd8e6703f616f68506bf92c90cbbec2985e80cf3
---
title: "Agents as Webs of Beliefs"
source_url: "https://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs"
ingested: 2026-06-29
type: article
---

# Agents as Webs of Beliefs


Published Time: 2026-06-27T21:45:29.440Z

Markdown Content:
In this post I’ll sketch out an informal model of intelligent agents as webs of beliefs (or belief webs for short). The belief webs framework pulls together ideas from active inference, agent foundations and machine learning. In doing so it aims to unify beliefs, goals and actions as three facets of a single phenomenon. Few of these ideas are original to me, but I haven't seen anyone tie them together in a single place before. I've flagged the frameworks I'm drawing from throughout the post.

### Beliefs are held together by local consistency constraints

The core premise of belief webs is that an agent’s beliefs are typically _locally_ consistent with nearby beliefs but not necessarily _globally_ consistent with all its other beliefs (except, perhaps, in the limit of ideal rationality). This poses a problem for frameworks which describe agents in terms of a single probability distribution (as causal graphs, Solomonoff induction, and active inference do).

Two frameworks which are capable of handling global inconsistency are [Richardson’s probabilistic dependency graphs](https://arxiv.org/abs/2202.11862) (PDGs) and [Garrabrant induction](https://www.lesswrong.com/posts/y5GftLezdozEHdXkL/an-intuitive-guide-to-garrabrant-induction). (They focus on empirical inconsistency and logical inconsistency respectively, but I’ll abstract away from that difference for now.) We can roughly analogize the nodes in PDGs to the propositions in Garrabrant inductors; I’ll call them “base-level beliefs”. The central type of base-level belief I think about is beliefs about sensory inputs.[[1]](http://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs#fn38cdnvw1q1g)

There’s then a second layer of structure in both PDGs (namely hyperedges) and Garrabrant induction (namely traders) which imposes local constraints on base-level beliefs. I think of hyperedges/traders as steps towards formalizing the concept of “concepts”.[[2]](http://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs#fnl4lxbcv75t) For example, if you see the front half of a cat starting to emerge from around the corner, a “cat” hyperedge/trader might make predictions about what you’ll see next, which shape your base-level beliefs.

However, having exactly two layers of structure seems rather artificial. In active inference/predictive processing, minds are viewed as hierarchical generative models, with each layer of the hierarchy forming new concepts with reference to lower-level concepts.[[3]](http://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs#fnq6v6sftxiih) The success of deep learning suggests that there’s something fundamentally important about this kind of hierarchical concept formation. Whereas you can’t have hyperedges connecting other hyperedges, or traders trading on other traders.

So you can think of the term “belief webs” as a (still vague) pointer towards a framework which is capable of handling both internal inconsistency and also hierarchical concept formation. The core difficulty I currently see is in figuring out what it means for a proposition formulated in terms of high-level concepts to be true or false, given that those concepts don’t have binary truth-values themselves (e.g. a trader isn’t ever discretely right or wrong, it’s just more or less profitable). However, even given this confusion, it seems possible to flesh out other interesting properties that belief webs should have, as I do below.

### **Actions are beliefs**

PDGs and Garrabrant inductors are epistemic processes, not agents. However, [Abram Demski’s post on FixDT](https://www.lesswrong.com/posts/8dbimB7EJXuYxmteW/fixdt) provides a very interesting suggestion for how to think of an epistemic process as choosing actions. Abram points out that an agent’s beliefs can sometimes affect the world directly (not just via influencing their actions). This is common in decision theory thought experiments, where predictors often make decisions based on simulating another agent. Standard decision theories vary in which such cases they consider “fair” decision problems. FDTers think it’s fair for decision problems to depend on an agent’s entire policy (including how it would act in hypothetical scenarios); whereas many CDTers think that fair decision problems can only depend on an agent’s actual decision. Both groups agree, however, that decision problems which depend on _how_ an agent chooses its policy are unfair.

However, [many real-world scenarios](https://www.lesswrong.com/posts/5FAnfAStc7birapMx/the-hostile-telepaths-problem) (including most social interactions) are affected by our thoughts, not just our external actions. So we can’t just write this dynamic off—we need to figure out what to do in such cases. In one sense, this is a complication: now we need to optimize both our thoughts and actions to achieve our goals. But in another sense it’s a simplification, because it unifies beliefs and actions: we can simply consider actions as the subset of beliefs where (we expect that) holding that belief makes it come true due to the intervention of an external actuator.[[4]](http://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs#fnz0m8aqvld5q) For example, I can think of my nervous system (or a neuralink interface) as watching out for the belief “I will move my arm” and then moving my arm in response.

I’ll call this the self-predictive model of actions (in contrast with the implicit standard “argmax model” where rational agents directly implement the action with highest expected utility). The self-predictive model is closely related to the idea of action as prediction from active inference. However, a key difference between active inference and Garrabrant induction is that only the latter can handle paradoxes of self-reference (using the probabilistic logic approach pioneered in [this paper](https://intelligence.org/files/DefinabilityTruthDraft.pdf)). So Garrabrant inductors should be capable of believing sentences like “if I believe X, then X will come true” without causing difficulties. This provides an epistemic grounding for _which_ predictions you should think of as actions, which then generalizes to things we don’t usually think of as actions. For example, if my future self will remember my current intentions and try to make them come true, then there’s a continuum between setting an intention and actually taking an action (relatedly, see [Sahil’s concept of “prayers”](https://www.lesswrong.com/posts/9KamjXbTaQpPnNsxp/live-machinery-interface-design-workshop-for-ai-safety-ea)). Or if other people can tell that I sincerely expect to win an election ([or succeed at a coup](https://www.mindthefuture.info/p/power-lies-trembling)), and will help me because of that, then holding that belief is again quite an action-like thing to do.

Indeed, in the self-predictive model of actions, much of the hard work of being an effective agent is managing your beliefs. Under the self-predictive model, there’s a gap between believing that an action is a good idea and actually taking it, because you also need to believe that you’re the kind of agent who acts on good ideas. This helps explain the central role of the ego in psychology, and why people are often so sensitive to negative feedback—since taking that feedback on board in the wrong way could harm their ability to act coherently. Instead, people typically spend a huge amount of time building up and maintaining their identity as a good, productive, trustworthy agent. Such an identity is a kind of belief, but the process of forming it can’t be described in terms of Bayesian updating, because it often involves choosing between multiple different self-fulfilling beliefs.

The self-predictive model also helps explain internal conflict (a phenomenon which the argmax model struggles with). If identifying the best action were sufficient for taking it, then we wouldn’t procrastinate or self-sabotage nearly as much. But our reasoning processes are only one input into our overall expectations about what actions we’ll take. Other inputs include our identities (which thereby serve as commitment mechanisms)[[5]](http://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs#fnblx166eyyxf), predictions that we’ll continue long-standing habits (even when we know they’re bad for us), [emotional memories and traumas](https://www.lesswrong.com/posts/i9xyZBS3qzA8nFXNQ/book-summary-unlocking-the-emotional-brain), and learned (or evolved) instincts and heuristics.

### **Goals are beliefs**

I’ve talked a lot about how to choose actions, but not much about the goals behind those choices. In Abram’s original FixDT framework, utility functions live separately from beliefs: FixDT agents search for all fixed points of their beliefs (including beliefs about the actions they’ll take) and then select the highest-utility fixed point. However, this reintroduces the ugly argmax that we’d gotten rid of by treating actions as beliefs, which causes issues like the [5-and-10 problem](https://www.lesswrong.com/w/5-and-10). It also means that taking any action requires identifying a global equilibrium (and even worse, identifying _all_ global equilibria).

But what alternative way is there to navigate towards a good fixed point?The main alternative Abram discusses is the active inference approach of interpreting goals as beliefs. Specifically, goals in active inference are beliefs which are fixed at an artificially high credence. We can then infer from those credences that we will probably take actions consistent with achieving those goals.[[6]](http://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs#fnd68tk4vexo5)

I think this doesn’t work in its current form, but is pointing in the right direction. I’ll illustrate with a toy example (though note that I still feel pretty confused about the full active inference formalism, and wouldn’t be surprised if I were missing something important). Suppose I start off with the following set of consistent beliefs:

*   P(win race next month | train this month) = 0.36
*   P(win race next month | ¬train this month) = 0.04
*   P(win race next month) = 0.12
*   P(train this month) = 0.25

I’ll treat P(train this month) as an action in the sense described in the previous section—that is, my credence in it is self-fulfilling. Now suppose that I represent my goal as a credence in winning the race that’s higher than 0.12 (I’ll arbitrarily choose 0.28 for numerical convenience), and update my other credences accordingly. Here’s one way that could become consistent:

*   P(win race next month | train this month) = 0.36
*   P(win race next month | ¬train this month) = 0.04
*   P(win race next month) = 0.28
*   P(train this month) = 0.75

So I’ve updated my action from a 25% chance of training this month to a 75% chance. That does move me towards getting what I want! But there are two big problems here. The first is that (absent other constraints) if I want to win the race I should just train with certainty. The 0.75 number is an arbitrary artefact of my initial prior on whether I’d train; it’s not what a utility-maximizer would do.

The second problem is that if I fix the belief in winning the race too high, there won’t be any action that makes that credence consistent, and I’d need to change my other beliefs instead to restore consistency. More generally, setting some beliefs artificially high seems like it would propagate falsehoods throughout the rest of our belief web.

I don’t think the active inference literature has a solution to this problem (though I haven’t explored it deeply enough to be confident). But to me it seems like the natural response is to avoid fixing goals at all, and rather think in terms of “forces” that are trying to pull credences in goals upwards (which I’ll call _drives_). Conversely, we should think about credences in empirical beliefs as being pulled into place by the force of empirical evidence (which I’ll call anchors). A belief web equilibrates when those two types of forces—drives and anchors—balance.

In our example above: we start with P(win race next month) = 0.1, and apply a force upwards on this credence. That might move P(win race next month | train this month) and P(win race next month | ¬train this month) upwards a little bit, but not very much, because their values are anchored by empirical evidence. What’s _not_ very anchored by empirical evidence is P(train this month), because any value of it is self-fulfilling. And so pulling P(win race next month) upwards will also pull P(train this month) upwards (potentially all the way up to ~1), with the whole system remaining approximately consistent the whole time.[[7]](http://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs#fnczfcbi2o0sj)

You might be concerned that we’re still in a setting where our desires can move our empirical beliefs. However, we can define a fully rational agent as the limiting case where action probabilities are moved using drives of arbitrarily small magnitude (relative to the strength of anchoring to empirical evidence). We might then be able to define such an agent’s utility function in terms of the choices it would make in that limit (though we’d need to be careful to ensure that all the drives decrease proportionately).

A version of this “drives of arbitrarily small magnitude” idea was originally explained to me by Davidad using the term “nilpotent preferences”; to my knowledge the idea is original to him (though it’s closely related to [Scott Garrabrant’s idea of actions as fixed points under self-prediction](https://www.lesswrong.com/posts/PiXS9kE4qX68KveCt/what-would-i-do-self-prediction-in-simple-algorithms)). My recollection is that Davidad first explained it as the distance between an agent's preference distribution and its belief distribution reducing towards 0. Later, he raised the possibility that we didn’t even need a preference distribution, and could just think of preferences as a vector field. In this post I talk about individual “forces” rather than a vector field because that seems more helpful on an intuitive level for reasoning about discrete beliefs (though I’m probably missing some of Davidad’s relevant intuitions).

I also call these forces “drives” rather than “preferences” because my current guess is that insofar as belief webs are a good model of humans, drives correspond to evolutionarily hardcoded desires, which affect higher-level goals only by propagating through the belief web. For example, forces applied to low-level beliefs like “I will feel pleasure tomorrow” or “I won’t be stressed this evening” might significantly affect the equilibrium credences of higher-level goals like “I’ll finish my dissertation soon”. In other words, what makes “I’ll finish my dissertation soon” a goal is just the fact that the credence we assign it is sensitive to drives applied at lower levels. However, since such forces will affect all other beliefs too to some degree (except in the limit of zero-magnitude drives), the distinction between preferences/goals and “pure” beliefs in a belief web is a matter of degree.

### **Open problems for belief webs**

I find the picture I’ve sketched out above extremely elegant. It takes the beautiful unification provided by active inference (that actions are self-fulfilling predictions, and goals are optimistic beliefs) and at least gestures towards putting it on firmer foundations. The big open problem is of course how to make all of these claims more precise and rigorous, so that we can be more confident in them.

In order to pin down such a formal framework, it feels necessary to grapple with a few core conceptual questions:

1.   Can belief webs reach the best equilibrium in principle? By default it seems like they might just get stuck in local equilibria: unlike FixDT they don’t have a mechanism to “jump” into the best equilibrium. My tentative guess for how to solve this: if a belief web is able to explore the implications of hypotheticals without interference from its existing beliefs, then it might be able to gradually shift probability mass from its current equilibrium to some other hypothesized equilibrium.
2.   It seems like belief webs implicitly implement EDT, which struggles to evaluate hypotheticals without interference from existing beliefs. But might they have emergent FDT/UDT-like properties in a way that gets the best of both worlds? The intuitive link here is that the FDT relies on considering logically impossible hypotheticals without “collapsing” them by propagating the contradiction.
3.   I’ve played pretty fast and loose with the notion of self-reference in belief webs. I’m uncertain whether this will basically turn out to be fine, or if there are important nuances that I’ve missed. For example, if we think of actions as defined by beliefs like “if I believe X, then X will happen”, then might we also need higher-order beliefs too (like “if I believe that ‘if I believe X, then X will happen’, then if I believe X, then X will happen”)? This feels quite Lobian, and makes me wonder whether something like [Lobian cooperation](https://arxiv.org/abs/1401.5577) will be necessary to ground it all out.
4.   As mentioned in the first section: what does it mean for a proposition formulated in terms of high-level concepts to be true or false, given that those concepts don’t have binary truth-values themselves?

My longer-term hope is that belief webs will allow us to think of individual agents as an emergent phenomenon, rather than something we need to bake in when reasoning about intelligent agency. You could potentially consider all intelligent beings to be part of a huge, highly non-equilibrated belief web. An “agent” could then just be a densely-connected region of that belief web which trusts updates from within that region much more than updates from outside it (but which is still affected by the latter insofar as it models or defers to other agents). While there’s still a lot to be done to pin these ideas down, I’m excited about the possibility that the initial unification of beliefs, goals and actions might pave the way for a deeper [scale-free unification](https://www.mindthefuture.info/p/towards-a-scale-free-theory-of-intelligent) of single-agent and multi-agent intelligence.

1.   **[^](http://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs#fnref38cdnvw1q1g)**
The original Garrabrant induction formalism focuses on base-level beliefs which are logical propositions, which are gradually proved. However, intuitively speaking it seems like we could replace (or perhaps augment) these with base-level beliefs about sensory inputs which are gradually observed.

2.   **[^](http://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs#fnrefl4lxbcv75t)**
I’m not claiming that all hyperedges or traders correspond to concepts; rather, I’m hypothesizing that the deeper structure which these formal terms are trying to capture has something to do with our intuitive notion of concepts.

3.   **[^](http://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs#fnrefq6v6sftxiih)**

A terminological note: I had at one point thought of predictive processing as claiming that the brain is constantly generating predictions, some of which control actions; and of active inference as additionally claiming that this happens via the free energy principle and expected free energy minimization.

But upon further checking this doesn’t seem right. It seems more accurate to instead divide the ideas up as follows:

    *   Predictive processing: the brain is constantly generating predictions
    *   Core insight of active inference: some of which control actions
    *   Full theory of active inference: via the free energy principle and expected free energy minimization

That is, I still want to say that I’m not on board with/confused about the full theory of active inference. But I should be classifying the “goals are beliefs” insight under active inference rather than predictive processing.

4.   **[^](http://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs#fnrefz0m8aqvld5q)**
Note that this introduces an asymmetry between external actuators that are cooperative vs uncooperative with you. In both cases, they’re reading your mind, and influencing the world based on what they see. But in the cooperative case, this allows you to form stable self-fulfilling beliefs; whereas in the uncooperative case such beliefs are unstable under reflection. So we might be able to salvage a criterion for a “fair” decision problem as one where the external world is cooperative in the right way.

5.   **[^](http://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs#fnrefblx166eyyxf)**
My standard example here is of a former alcoholic who forms a very strong identity as being sober, celebrates different milestones of sobriety, narrativizes his life as being transformed by sobriety, etc. The investment in developing and maintaining this identity serves as a commitment mechanism against drinking again.

6.   **[^](http://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs#fnrefd68tk4vexo5)**
Oliver Richardson discusses a similar approach to decision-making in section 4.7 of [his paper on Local Inconsistency Resolution](https://arxiv.org/abs/2604.17140); my sense is that it has the same problems (though I’m not confident).

7.   **[^](http://www.lesswrong.com/posts/M39Z2CvyfaxZdaxR4/agents-as-webs-of-beliefs#fnrefczfcbi2o0sj)**
Modulo the speed at which consistency updates propagate across the web—which might be a deep constraint, [as I discuss here](https://www.lesswrong.com/posts/FuGfR3jL3sw6r8kB4/richard-ngo-s-shortform?commentId=gmFAeHYQpjj9sdfin).
