---
title: "Why the Human Genome's Tangled Physicality May Confound AI"
source_url: "https://www.quantamagazine.org/why-the-human-genomes-tangled-physicality-may-confound-ai-20260618/"
ingested: "2026-06-19"
sha256: "92500ad8c39c1ad2"
---

## Introduction

Since its molecular structure was deduced in the 1950s, DNA has been hailed by many biologists as the secret of life. They’ve read and studied the information stored in the DNA found in the cells of living organisms, known as their genomes, and claimed that this genetic database must be some kind of blueprint, code script, or computer. But if DNA really does harbor some greater secret about how life works, biologists have yet to find it.

In fact, the human genome is less a script than a puzzle that gets harder the closer they look. Knowing the entire sequence — the order of all 3 billion or so of our DNA’s chemical building blocks, nearly fully deduced by the international Human Genome Project between 1990 and 2003 — hasn’t helped much. That investigation showed that barely 2% of the human genome consists of actual genes, the information-coding sequences of DNA.

It’s now clear that understanding the human genome is no longer a matter of figuring out what each gene does. The deeper and much harder question is how those genes are used, or regulated, a question that seems to involve some and perhaps much of the rest of the genome. By switching suites of genes on and off, the many different cell types in our bodies can all be created from the same material. Cells also regulate their genes from moment to moment in response to a constant inflow of signals from their neighbors and surroundings. But the processes that govern gene regulation are proving so complex that some biologists wonder whether a full understanding of it — of how the genome really works — will ever be within the grasp of our puny minds.

Some are counting on outsourcing the analysis to artificial intelligence. Genomic “foundation models” such as Evo 2, Genos, and Google DeepMind’s AlphaGenome are [trained on vast quantities of genomic data](https://www.quantamagazine.org/the-poetry-fan-who-taught-an-llm-to-read-and-write-dna-20250205/), which biologists use to make predictions about how differences in DNA sequence affect biological processes and ultimately the traits (including disease risk) of a whole organism. These algorithms don’t worry about the complicated regulatory stuff going on; all of that is supposedly subsumed by the algorithm’s “training,” through which it deduces correlations from cases we already know about.

This approach is likely to be useful, but for those who crave real understanding of how the genome, and ultimately life itself, works, a computational black box will never suffice. And perhaps more to the point, the genome might not submit to the kind of straightforward input-output approach that such AI models ultimately assume.

That’s because the genome is no blueprint or algorithm. It is something else.

## **The Old View**

Given that it’s the product of around 4 billion years of evolution, perhaps it’s not surprising that our genome is complicated. The surprise has been what those complications are. “Our genome is not what we might make it if we sat down at the drawing board,” said the biologist [Karen Adelman (opens a new tab)](https://adelman.hms.harvard.edu/people), who studies gene regulation at Harvard Medical School.

The traditional view posits that a small proportion of our DNA holds the code for making the protein molecules that orchestrate our cells’ chemistry. Each instruction for a protein is held in a corresponding gene — we have around 20,000 of these — and gene sequences can range in length from a couple of dozen to almost 3 million DNA “letters” (representing molecules called nucleotides). Making a protein from its gene is a two-stage affair. First the DNA is read, letter by letter, by an enzyme called a polymerase, which creates a copy of that code in a related molecule called messenger RNA (mRNA). This is called transcription. The mRNA is then read by a piece of molecular machinery called the ribosome, which constructs the protein — a process called translation. The proteins made by the ribosome then go off to do their jobs in making and sustaining the organism.

This picture is still more or less correct. But it turns out that “the genes are probably not the most interesting part of the genome,” Adelman said.

What matters more is how our genes, many of which we share with simpler organisms, are regulated: turned on and off. Which proteins a cell needs changes over time and according to cell type: muscle, brain, skin, and so on. How the genes that encode those proteins are regulated depends on some of the genome that doesn’t code for proteins.

Biologists have known about gene regulation, and the involvement of “noncoding” DNA, since the 1960s. But for many years, most of what they understood about this came from studies of simple organisms like bacteria, where the principles are generally straightforward. It has gradually become clear, though, that in [complex eukaryotic organisms](https://www.quantamagazine.org/meet-the-eukaryote-the-first-cell-to-get-organized-20241028/) like us, gene regulation is far more complicated, involving overlapping systems of oversight and control, each with its own intricacies.

![Image 1](https://www.quantamagazine.org/wp-content/uploads/2026/06/Large-spot-3.webp)

## **Transcription Factors**

Transcription gets started by proteins called transcription factors, which are like the operations managers of gene regulation. These proteins stick to sections of DNA (typically close to the target gene) and recruit the polymerase enzyme to make an mRNA copy. In bacteria, transcription factors are rather like keys that fit the locks of unique binding sites on DNA. But that’s not how they work in complex organisms. In us, the logic of transcription factors is more difficult to parse.

For one thing, our transcription factors don’t show strong preferences for particular DNA binding sites. What’s more, they tend to work in pairs or groups. And a given transcription factor might have different effects in different contexts, such as activating gene transcription in one cell type but suppressing it in another, depending on which other transcription factors are around.

In bacteria, regulation tends to have an “OR” logic, Adelman said, whereby a particular signal turns a gene on or off: It’s either this _or_ that. But in the human genome the logic is more like what computer scientists designate “AND.” Many signals are integrated to reach a regulatory decision: this _and_ that _and_ _also_ that other thing. In this case, regulation can be more responsive to nuances of context, and the regulatory knobs are tunable rather than being just on/off. “This is part of the beauty” of our regulatory complexity, Adelman said.

When they interact with the genome, transcription factors bind to pieces of DNA called enhancers — which present a puzzle of their own.

## **Enhancers**

Enhancers are gathering points for transcription factors, and they are thought to be the decisive influence on transcription: They deliver the “go” signal for a waiting polymerase to make an mRNA version of the DNA sequence. Seems simple enough, but mapping enhancers to their respective genes is far from straightforward. Our genome has hundreds of thousands, perhaps millions, of enhancers. That means we have many more of them than we have genes. Each gene might be influenced by many enhancers, and each enhancer might influence multiple genes.

“It’s embarrassing that 25 years after the Human Genome Project, we don’t know where all the enhancers are in the genome, let alone what they do when they act and which genes they control,” said [Wendy Bickmore (opens a new tab)](https://institute-genetics-cancer.ed.ac.uk/research/research-groups-a-z/bickmore-group/wendy-bickmore-spatial-organisation-of-the-human), a genome biologist at the University of Edinburgh.

Biologists do know that most enhancers won’t respond to a single transcription factor. Their activation “requires a cocktail,” Bickmore said. “That’s what gives [an enhancer] that exquisite specificity — because it’s only in a particular cell at a particular time that you have the right combination of factors to bind and activate that enhancer.”

Some enhancers are, as you’d expect, close to the genes they regulate, or even sit on DNA inside a gene. But others sit far away from the gene — perhaps millions of nucleotides away, with more genes in between.

The existence of such so-called “distal” enhancers “seems bonkers,” Bickmore said. “How do you get that information from over there to over here, to the gene that needs to be activated? That’s a largely unanswered question.”

One of the answers comes in the form of a loop.

## **Loops and Hubs**

Distal enhancers are brought to the gene they regulate on [great loops of DNA](https://www.quantamagazine.org/loops-of-dna-equipped-ancient-life-to-become-complex-20251008/) or, more strictly, of chromatin, the combination of DNA and its packaging proteins that are unraveled as if from a ball of wool. The loops are created by a protein motor called cohesin, which runs up and down the DNA strand and extrudes it as needed.

Once cohesin has formed a loop to bring elements together, what then? It was once thought that they then stick together or assemble into a molecular machine, but they don’t. Rather, the components appear to form a loose but dense blob in which they interact rather weakly, fleetingly, and indiscriminately — a sort of committee, sometimes called a condensate.

These transcription hubs are extremely fluid and differ from one cell to another. “There’ll be a bit of loop extrusion going on over here, in the next cell it might be over here, and the whole thing is turning over incredibly fast,” Bickmore said. Even if the cells are notionally identical — both skin cells, say — exactly what the gene-regulatory machinery is up to at any moment is never quite the same in any two of them.

Chromatin loops are just one reason why a gene’s transcription depends on the shape and structure of the chromatin around it.

## **Chromatin Shape**

The textbook image of a chromosome — one of the 46 units into which our genomes are divided — is of a [compact, X-shaped cluster of chromatin](https://www.quantamagazine.org/how-cells-pack-tangled-dna-into-neat-chromosomes-20180222/). But any time a cell is not actively dividing, its chromatin is unwound into what looks like a tangled mess. There is order to the chaos, however. Some parts of chromatin are densely packed into a form called heterochromatin. The compacted DNA there is relatively inaccessible to transcription factors; the genes it contains are typically silenced. Meanwhile, other parts are relatively loose, open, and accessible: This is called euchromatin.

There are special enzymes involved in packaging and repackaging chromatin, thereby controlling transcription. In other words, what matters is not just the encoded information in the DNA but also how it exists physically and dynamically in space. “We’ve stopped thinking about the genome as a linear piece of DNA code,” Bickmore said. “Thinking about this incredibly dynamic three-dimensional folding as absolutely inherent to regulation is a very exciting change.”

One aspect of this 3D organization is the clustering of segments of chromatin into compartments called topologically associating domains (TADs). Within a TAD, the genes seem to be coregulated: switched on or off in groups. Such groups keep suites of genes active or silent together to form and provide function in different cell types. Cohesin is also involved in the shuffling of chromatin to construct TADs — a dynamic process in which the chromatin is constantly rearranged in our cells.

Chromatin shape can also be influenced by chemical modifications called epigenetic marks: small molecules attached to DNA packaging proteins called histones or stuck directly to DNA. Some of these epigenetic modifications can alter the electrical charges on histones, which changes how the proteins attract or repel one another and so rejigs the chromatin packing. Epigenetic modifications to chromatin are like annotations of the DNA script that change its meaning in a given context. When cells divide, the epigenetic annotations are copied, too.

How and when the marks get added and changed, and what each type of mark means for gene activity, are complex questions with no simple answers. Some researchers talk of an “epigenetic code” governing this aspect of gene regulation, but it’s far from clear if anything so systematic really exists.

All of these processes and others can determine whether a gene gets transcribed into mRNA. But there are further layers of regulation that determine whether the mRNA is then translated into a corresponding protein — and which protein arises.

## **RNA Interventions**

This post-transcriptional regulation is often controlled by RNA molecules that are said to be noncoding. These short-lived molecules aren’t templates for proteins, as mRNA is, but have other jobs of their own. While mRNA is produced from the protein-coding areas of DNA (so-called “coding genes”), noncoding RNAs are transcribed from other DNA regions now generally described as noncoding genes. These [noncoding RNAs are versatile](https://www.quantamagazine.org/cells-across-the-tree-of-life-exchange-text-messages-using-rna-20240916/), taking on varied roles in a cell. Researchers are learning more about what they can do every day, and many if not most of them seem to be involved in gene regulation.

Small noncoding RNAs called microRNAs, for example, can silence mRNAs before they can be translated into proteins. They do this by guiding special enzymes to a particular mRNA to degrade or chemically modify it. The microRNAs don’t do this job alone but, not unlike transcription factors, act combinatorially, in groups, and in a rather promiscuous manner: A given microRNA might regulate many mRNAs, and a given mRNA might be regulated by many microRNAs.

Why make an mRNA only to stop it getting translated in a protein? This sort of post-transcriptional regulation is like having another checkpoint: Does the cell really need this protein? MicroRNAs can be mobilized to allow cells to adjust gene expression [depending on the immediate context (opens a new tab)](https://doi.org/10.1101/gr.166702.113). In this way, the workings of the genome are less like a program’s inevitable progression and more like an adaptive and responsive process.

Another post-transcriptional complication is that mRNAs get translated to protein only after they have been reorganized. Fresh from transcription, an mRNA contains sequences that encode bits of protein, called exons, as well as sequences that shouldn’t be translated and need to be snipped out, called introns. (Strictly speaking, this pre-edited RNA is called pre-mRNA.) The job of editing introns out and splicing exons together is done by a molecular assembly called the spliceosome, which is made from several proteins together with various noncoding RNAs.

The spliceosome too can be sensitive to context, so that it might splice the pre-mRNA to encode one protein in one cell type and a slightly different protein in another. Sometimes these different protein “isoforms” can have very different roles. Transcription factors, for example, are often alternatively spliced in this way, and their isoforms can [take on different regulatory tasks (opens a new tab)](http://dx.doi.org/10.1016/j.molcel.2025.03.004) — some might activate gene expression, for instance, while others repress it.

## **Checks and Balances**

All told, these and other regulatory mechanisms show that the genome is far from some automated program running in the background to build us and keep us alive. Our cells are, in effect, making complex decisions about how to use their genes — both the information they contain and the structure they assume.

Thus, cells need to assemble a rather loose and fuzzy committee of components, such as transcription factors and enhancers, to get transcription underway, which also depends on how the chromatin strand is shaped and molded at that moment. Then there are further layers of decision-making and action-taking in between mRNA and the final, functional protein.

![Image 2](https://www.quantamagazine.org/wp-content/uploads/2026/06/Spot-6.webp)![Image 3](https://www.quantamagazine.org/wp-content/uploads/2026/06/Spot-6-Mobile.webp)

Remember, too, that all the players — from transcription factors to noncoding RNAs — are themselves produced from the genome in the same kind of context-dependent process. That makes the genome rather like a recursive, self-referential system that the computer scientist Douglas Hofstadter dubbed “[a strange loop (opens a new tab)](https://www.hachettebookgroup.com/titles/douglas-r-hofstadter/i-am-a-strange-loop/9780465030798/).” It acts on itself, mindful of its own history (which determines chromatin conformation and epigenetic markings, say) and heedful of messages from inside and outside the cell. Not, then, a blueprint.

And for that reason, not at all easy to understand. “I wouldn’t have designed it this way if I was God,” Bickmore said. “But here we are!”

Why is gene regulation in animals like us so darned complicated? One potential answer is that evolution doesn’t have the foresight to design with efficiency and transparent logic, but merely tinkers with what it has already available. Maybe so — but eukaryotic gene regulation isn’t just a messy version of what happens in bacteria. It has different principles, and there’s surely a reason for them.

Bickmore suspects that the complexity of regulation and of genome organization might have been the only means of generating complexity in the organism. For example, organisms with many tissue types and varied lifestyles required more control over which genes were on or off in a given cell. One thing this demanded was more and more noncoding regulatory sequences in DNA. But then they couldn’t all fit close to the gene itself.

“As you get more complexity, you need to add more and more enhancers,” Bickmore said. “But where are you going to put them? You start to put them farther and farther away. Once they are [far enough], you start to need TADs and three-dimensional [chromatin] folding to allow those things to work.”

We also need regulatory complexity because, over evolutionary time, the human genome has accumulated DNA from parasitic viruses in the form of jumping genetic material called [transposable elements](https://www.quantamagazine.org/scientists-catch-jumping-genes-rewiring-genomes-20210512/). These sequences have inserted themselves all over our chromosomes and are good at replicating themselves. To sift the good DNA from the bad, we needed additional layers of regulation to ensure that cells weren’t translating RNAs they don’t really need or that could be actively harmful.

With so many context-dependent checks and balances in the workings of our genome, it is evidently not a program or algorithm that predictably generates the same outcome in every situation. It’s an open informational system that responds to external inputs and the genome’s dynamic internal conditions. This poses a challenge if AI relies solely on the genetic sequences within genomes to predict what genomes will do.

## **“A Highly Sensitive Organ”**

Researchers developing AI-based genomic foundation models such as AlphaGenome hope that all these layers of regulation — transcription factors, splicing, epigenetic marks, loops, chromatin packing, and so on — will be implicitly included in the correlations that the algorithms learn between genetic sequence and organismal traits. They’re content for the complexity described above to be in a black box, so long as the model generates accurate predictions. But will that work?

“I’m sure [AlphaGenome] is going to be useful, but with limitations,” Bickmore said. “To me the big gap is in the complexity of the human body — in all the cell types and how they change over time in development. And all that data is missing.”

Fundamentally, the challenge is that the genome is not a set of static, linear instructions. It is highly dynamic, and it uses its information contextually, with combinatorial and promiscuous logic. “Whether we’ll ever be able to capture that aspect” in algorithms like AlphaGenome, “I don’t know,” she said.

Yet the problem goes even deeper because the functioning of specific organisms, including each of us, doesn’t just depend on genomes. Other factors, such as diet, environment, microbiome and, for us at least, culture, can matter hugely, too — not just in terms of how we act and how healthy we are but also in the state of our genome itself. The biologist [Adrian Woolfson (opens a new tab)](https://adrianwoolfson.com/about/), co-founder of California-based biotech company Genyro, which aims to use AI systems for so-called “generative biology,” calls this information cloud the “informiome.”

“While the human genome forms the foundation of the human informiome, other layers of extra-genetic information are equally important,” Woolfson wrote in his book [_On the Future of Species_ (opens a new tab)](https://mitpress.mit.edu/9780262054898/on-the-future-of-species/), published in April 2026. Genomic foundation models won’t even be able to predict all the consequences of genetic mutations, he argued, because the relevant information is not in the genome sequence in the first place.

So how should we think about the genome? Maybe the only metaphors that can capture the way the genome really works must come from biology itself. In 2020, the biological historian [Evelyn Fox (opens a new tab)](https://news.mit.edu/2023/professor-emerita-evelyn-fox-keller-dies-0925) compared the genome to “an exquisitely sensitive reactive system.” Rather than a sequence of genes leading to the formation of traits, she said, it’s more of “a device for regulating the production of specific proteins in response to constantly changing signals it receives from its environment.”

That sounds close to the picture painted by the geneticist Barbara McClintock in [the address she delivered (opens a new tab)](https://www.nobelprize.org/uploads/2018/06/mcclintock-lecture.pdf) upon being awarded the 1983 Nobel Prize in Physiology or Medicine for her discovery of transposons. The genome, she declared, is “a highly sensitive organ of the cell, monitoring genomic activities and correcting common errors, sensing the unusual and unexpected events and responding to them, often by restructuring the genome.”

Research since that time has fleshed out this image, revealing how the shape of chromatin can matter as much as the information its DNA sequences encode and how an army of molecules collaborates to reorganize it and make collective decisions about how to use its genetic information in context-dependent ways. There is no human technology that works this way, so metaphors such as blueprints, programs, or computers will always fall short.

Bickmore is optimistic that the workings of the genome are understandable, despite its complexity. “We’ve got a handle on it now,” she said. “We might not know the details, but I think the whole field is coalescing now into a framework where we’re thinking along similar lines.” AI can surely help with this sense-making, but in the end, human reasoning will be needed to discern the fundamental principles.

“McClintock was far more on point than people realized at the time,” Adelman said. “What she said was that the genome isn’t static — it’s living.”

![Image 4](https://www.quantamagazine.org/wp-content/uploads/2026/06/Spot-7-copy.webp)![Image 5](https://www.quantamagazine.org/wp-content/uploads/2026/06/Spot-7-End-Mobile.webp)