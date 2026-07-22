---
title: "while breathless in stodgy viridian"
source: rss
source_url: https://stochasticparrot.substack.com/p/while-breathless-in-stodgy-viridian
tags: [newsletter, llm]
ingested: 2026-05-08
feed_name: Stochastic Parrot
source_published: 2025-09-11
sha256: 31e596bc4279
type: raw
created: 2026-05-10
updated: 2026-05-10
---
# While breathless, in stodgy viridian
[](<https://substackcdn.com/image/fetch/$s_!CGbM!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5693471a-8073-4be4-b7ce-b710c5124f79_1024x1024.png>)
Stochastic Parrot is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.
Consider a training corpus of the same general size and shape as those used for common language models but composed entirely of sentences like the following:
  * Colorless green ideas sleep furiously. 
  * The hesitant algorithm sings broccoli into oblivion.
  * Lavender equations snorkel wistfully through calendars.
  * Spherical grammar dissolves the velvet contradiction.
  * Crumpled serenades harvest binary fog with umbrellas.
The first sentence, which serves as the template for the remaining, is well-known by linguists and deserves some comment. The sentence was used by Noam Chomsky to show that grammaticality could not be identified with either semantic or statistical notions. The first point is established by contrasting the sentence with "Furiously sleep ideas green colorless." Both are nonsense but any English speaker would nonetheless recognize only the original sentence as grammatical. The same essential argument is made for the second point: only the original sentence is grammatical even though both equally improbable (well, that is until they were utilized in the most well-known linguistic text of the 20th century). 
Contrast this nonsense with Lewis Carroll's _Jabberwocky_.
Text within this block will maintain its original spacing when published
         'Twas brillig, and the slithy toves
               Did gyre and gimble in the wabe;
         All mimsy were the borogoves,
              And the mome raths outgrabe.     
This is nonsense only because we don't know the meaning of any of the words. But consider the next stanza:
Text within this block will maintain its original spacing when published
         Beware the Jabberwock, my son!
              The jaws that bite, the claws that catch!
         Beware the Jubjub bird, and shun
              The frumious Bandersnatch!
There is a lot we don't know, but the Jabberwock is a dangerous creature, as is the Jubjub bird and Bandersnatch. And it probably pays to avoid any animal that tends towards the frumious.
And the remaining poem is oddly clear, perhaps not in detail, but in the gist of the general arc. Even the final stanza which repeats the first now possesses a vague but pastoral sense of peace and calm.
Text within this block will maintain its original spacing when published
         One, two! One, two! And through and through
              The vorpal blade went snicker-snack!
         He left it dead, and with its head
              He went galumphing back. 
         And hast thou slain the Jabberwock?
              Come to my arms, my beamish boy!
         O frabjous day! Callooh! Callay!
              He chortled in his joy.
         Twas brillig, and the slithy toves
              Did gyre and gimble in the wabe;
         All mimsy were the borogoves,
              And the mome raths outgrabe.
The poem delights by conveying substantial meaning with insubstantial means, more than the words should permit. 
Chomsky's sentence is different. While all the words have meaning, there is no meaningful relation between any two of them. The result is pure nonsense. However, there is the pull of the metaphoric, and since all the components have meaning we strive to find meaning to the ensemble. The American poet John Hollander does this in _Coiled Alizarine_ , a poem dedicated to Chomsky:
Text within this block will maintain its original spacing when published
              Curiously deep, the slumber of crimson thoughts:
              While breathless, in stodgy viridian, 
              Colorless green ideas sleep furiously. 
Like _Jabberwocky_ , this poem delights by pulling out sense from nonsense, contrasting the sloth of all things red with the fury of green thought. Bizarrely, by adding equally nonsensical statements Hollander produces something that has more sense rather than less. 
All of this is by way of saying that the text corpus for this thought experiment will have none of this. Every sentence is nonsense, pure nonsense, and every nonsense sentence in a passage has no sensible relation with any other nonsense sentence in the passage. It is all nonsense, through and through, all the way down. 
There should be no surprise that the resulting language model only generates grammatical nonsense. During training the model will still be able to detect that some words function as nouns in a sentence, while other words will function as verbs, adjectives, determiners etc. And it will be able to detect the patterns for these word-types can be ordered to form sentences. But this is as far as the language model can go because there are no further patterns to detect. Other than following a grammatical order, the selected words for any sentence are completely random. There will be some patterns to detect because that is the nature of random behavior. So these patterns are minor, arbitrary and without meaning. 
The nature of random behavior means that while the language model is trained on a corpus composed entirely of nonsense sentences, the model will nonetheless on occasion generate semantically coherent and true statements. So ironically the set of generated text from this language model will actually be less nonsensical than the data it is trained on. 
None of this is controversial or surprising; rather it is dull and obvious. But the example exposes the feature of language models that is most important towards understanding their abilities. Language models model a corpus of text and a language model's behavior is a reflection of that text. The model of the thought experiment generates no true statements because it was not trained on any statements that were true; nor will it generate semantically coherent statements because it was not trained on any semantically coherent statements. In contrast, standard foundation models such as GPT and Claude will generate true statements because they were trained on a massive corpus of text that is composed of thousands of reliable sources. And if this corpus contains biases then the models will exhibit the same biases. Whatever capabilities, knowledge or intelligence a language model exhibits is based upon what is contained in that text. 
This sounds a theme for subsequent posts. I'm going to be exploring how specifying aspects of a training corpus will affect the resulting language model. Each specification will determine different behavior, a different level of capability. The general point I want to foreground is that you can best understand how a language model behaves by focusing on the text data it is trained on. What this simple thought experiment has shown is that if a language model spouts only nonsense then this is because it was trained on nonsense. I conjecture that any magic seen in language models is actually magic contained in the training data. 
Stochastic Parrot is a reader-supported publication. To receive new posts and support my work, consider becoming a free or paid subscriber.