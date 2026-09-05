---
source: newsletter
source_url: https://github.blog/ai-and-ml/llms/accelerating-researchers-and-developers-building-multilingual-ai-with-a-new-open-dataset/
ingested: 2026-06-17
sha256: c2cb157530632d53a7b946e6af197a42c7d0eba83f2557e872aacfb713ea9e58
---

# Accelerating researchers and developers building multilingual AI with a new open dataset

Published Time: 2026-06-15T12:17:30-07:00

Markdown Content:
A new repository-level dataset, published on GitHub under CC0-1.0, helps researchers and developers discover multilingual developer content across READMEs, issues, and pull requests.

June 15, 2026

|

5 minutes

*    Share: 
*   [](https://x.com/share?text=Accelerating%20researchers%20and%20developers%20building%20multilingual%20AI%20with%20a%20new%20open%20dataset&url=https%3A%2F%2Fgithub.blog%2Fai-and-ml%2Fllms%2Faccelerating-researchers-and-developers-building-multilingual-ai-with-a-new-open-dataset%2F)
*   [](https://www.facebook.com/sharer/sharer.php?t=Accelerating%20researchers%20and%20developers%20building%20multilingual%20AI%20with%20a%20new%20open%20dataset&u=https%3A%2F%2Fgithub.blog%2Fai-and-ml%2Fllms%2Faccelerating-researchers-and-developers-building-multilingual-ai-with-a-new-open-dataset%2F)
*   [](https://www.linkedin.com/shareArticle?title=Accelerating%20researchers%20and%20developers%20building%20multilingual%20AI%20with%20a%20new%20open%20dataset&url=https%3A%2F%2Fgithub.blog%2Fai-and-ml%2Fllms%2Faccelerating-researchers-and-developers-building-multilingual-ai-with-a-new-open-dataset%2F)

Software may be written in programming languages, but human language is at the heart of developer collaboration. Developers explain how projects work in READMEs. They ask for help in issues. They review, debate, and improve code in pull requests. That collaboration often happens in English—but not always. As AI becomes a bigger part of how developers build software, multilingual developer content matters more than ever.

Today, GitHub is publishing the **GitHub Multilingual Repositories Dataset**, a repository-level metadata dataset designed to help researchers and developers discover public GitHub repositories with evidence of non-English natural-language content. When building the dataset, we found that language distribution differs across READMEs, issues and pull requests: Korean is the most common non-English language in issue text, but only the fifth-most common in READMEs. Portuguese tops the non-English README list with more than 3 million repositories.

The dataset is now available on [GitHub](https://github.com/github/multilingual-repositories) under CC0-1.0. It follows through on a commitment we made in 2025, as part of [Microsoft’s European Digital Commitments,](https://blogs.microsoft.com/on-the-issues/2025/07/20/eudigitalunlock/) to make multilingual data more accessible, including to open source AI developers.

## What’s in the dataset

The GitHub Multilingual Repositories Dataset is intentionally not a dump of repository content. Instead, it is a metadata dataset that helps developers and researchers find repositories where multilingual collaboration may be happening. The dataset covers **over 80 million classification rows across more than 40 million repositories**. For each public repository, we provide:

*   Language classifications of the README, the most-commented issue, and the most-commented pull request, with the first 150 characters of each used as the input sample. We exclude texts under 20 characters.
*   Classifications for each text source, from [fastText](https://fasttext.cc/), [gcld3](https://github.com/google/cld3), and [lingua-py](https://github.com/pemistahl/lingua-py), each with a confidence score. The dataset only includes classifications with >0.5 confidence.
*   Repository metadata: creation timestamp, disk usage, stars, forks, primary programming language, SPDX license, issue and pull request counts, and the snapshot date.

We deliberately did not collapse the three classifiers into a single label. Different classifiers have different coverage and confidence calibration, especially for lower-resource languages. By exposing all three, we let you decide how strict you want to be. Want a high-precision Greek subset? Require all three classifiers to agree above some confidence threshold. Want broad recall for an exploratory study of Romance languages? One classifier may be enough.

## What you can build with it

The dataset is designed for the kind of work that’s hard to do with general web text:

*   **Discover** repositories likely to contain developer documentation or collaboration in specific languages.
*   **Study** how non-English developer communities use issues, pull requests, and READMEs.
*   **Build** evaluation sets for AI coding tools, doc generators, or review assistants that need to behave well across languages.
*   **Encourage** decision-makers to expand language coverage for new developer tools and AI features using data-backed arguments on the rich multilingual diversity of developers.
*   **Measure** representation of European and other underrepresented languages in open source.

## Some caveats

Language identification is hard, especially in software repositories. Repository text is often short. It may include badges, templates, installation commands, code snippets, usernames, or mixed-language content. A 150-character sample may not represent the whole repository. Classifiers also vary in coverage and calibration, especially for lower-resource languages.

That is why the dataset should not be treated as a ground-truth benchmark for language identification. Instead, it is designed as a transparent discovery tool. Users can inspect classifications, confidence scores, and sources, then choose the precision and recall tradeoffs that fit their own research or development workflow.

The dataset also should not be used to infer sensitive attributes about repository owners, contributors, or communities. The signals are repository-level metadata, not person-level attributes.

## Why open multilingual data matters

Today, many European languages remain underrepresented in the online text used to build and evaluate AI systems. That creates a risk that AI tools work well for some developers, languages, and communities, while leaving others behind. Open data can help close that gap. We built this dataset because developer content is different from general web text. READMEs, issues, and pull requests contain the language of software collaboration: installation instructions, bug reports, feature requests, review comments, and community norms. That context can help build AI systems that better understand how developers actually work.

By making multilingual developer-content signals easier to find and analyze, this dataset gives researchers, open source developers, and model builders another tool for studying language representation in software development. It can help identify gaps, support better evaluation, and inform more inclusive AI tools for developers across Europe and beyond. It also reflects a broader principle: Building AI for developers should include the communities, languages, and workflows developers actually use.

## What’s next

We’ll be discussing the dataset, and the broader importance of open data for multilingual AI, at the [Open Innovation Dialogue Hub](https://www.microsoft.com/en-eu/european-policy/events/open-innovation-dialogue-hub/default.aspx) in Strasbourg on June 16. The event is co-organized by the Microsoft Open Innovation Center, the Council of Europe, and GitHub, and will bring together policymakers, researchers, cultural institutions, and open innovation leaders to discuss AI, linguistic diversity, cultural heritage, and open data.

Multilingual AI needs multilingual developer communities. We hope this dataset helps more people study, support, and build for them. By releasing it under CC0-1.0 on GitHub, we’re inviting researchers, open source maintainers, and model builders to use it, critique it, extend it, and build evaluation sets and tools on top of it.

If you do something interesting with it, [we’d love to hear about it](https://github.com/github/multilingual-repositories/discussions).

## Written by

![Image 1: Kevin Xu](https://avatars.githubusercontent.com/u/4744405?v=4&s=200)

Staff Software Engineer, CELA

## Related posts

## We do newsletters, too

Discover tips, technical guides, and best practices in our biweekly newsletter just for devs.

Your email address
