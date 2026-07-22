---
source: newsletter
source_url: https://venturebeat.com/technology/perceptron-mk1-shocks-with-highly-performant-video-analysis-ai-model-80-90-cheaper-than-anthropic-openai-and-google
tags: [venturebeat]
url: https://venturebeat.com/technology/perceptron-mk1-shocks-with-highly-performant-video-analysis-ai-model-80-90-cheaper-than-anthropic-openai-and-google
title: "Perceptron Mk1 shocks with highly performant video analysis AI model 80-90% cheaper than Anthropic, OpenAI & Google"
sha256: 168a5a4965e1b203006f1f9cb4119c8561ec07325ce1d1154ab23f49b69961c3
date: 2026-05-13
type: raw
review_value: 7
review_confidence: 8
review_recommendation: neutral
ingested: 2026-05-16
review_stars: 5
---
Published Time: 2026-05-12T18:45:17.739Z
Markdown Content:
# Perceptron Mk1 shocks with highly performant video analysis AI model 80-90% cheaper than Anthropic, OpenAI & Google | VentureBeat
[](https://venturebeat.com/)
*   [Orchestration](https://venturebeat.com/category/orchestration)
*   [Infrastructure](https://venturebeat.com/category/infrastructure)
*   [Data](https://venturebeat.com/category/data)
*   [Security](https://venturebeat.com/category/security)
More
[Newsletters](https://venturebeat.com/newsletters)
Featured
# Perceptron Mk1 shocks with highly performant video analysis AI model 80-90% cheaper than Anthropic, OpenAI & Google
[Carl Franzen](https://venturebeat.com/author/carlfranzen)
 11:45 am, PT, May 12, 2026 
![Image 1: Robot in cinema watching warehouse security video](https://venturebeat.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fjdtwqhzvc2n1%2F792xpzV56beWnPgMn8j8Ku%2F2e0da2eadb098389cada35ebac209693%2FChatGPT_Image_May_12__2026__02_26_29_PM.png%3Fw%3D1000%26q%3D100&w=3840&q=85)
Credit: VentureBeat made with OpenAI ChatGPT-Images-2.0
[](https://www.google.com/preferences/source?q=venturebeat.com "Add to Google Preferred Source")
AI that can see and understand what's happening in a video — especially a live feed — is understandably an attractive product to lots of enterprises and organizations. Beyond acting as a security "watchdog" over sites and facilities, such an AI model could also be used to clip out the most exciting parts of marketing videos and repurpose them for social, identify inconsistencies and gaffs in videos and flag them for removal, and identify body language and actions of participants in controlled studies or candidates applying for new roles.
While there are some AI models that offer this type of functionality today, it's far from a mainstream capability. The two-year-old startup Perceptron Inc. is seeking to change all that, however. Today, it announced the release of its [flagship proprietary video analysis reasoning model, Mk1](https://www.perceptron.inc/blog/introducing-perceptron-mk1) (short for "Mark One") at a cost — $0.15 per million tokens input / $1.50 per million output through its application programming interface (API) —that comes in about 80-90% less than other leading proprietary rivals, namely, Anthropic's Claude Sonnet 4.5, OpenAI's GPT-5, and Google's Gemini 3.1 Pro.
![Image 2: Perceptron Mk1 cost Pareto chart](https://venturebeat.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fjdtwqhzvc2n1%2Fz1tv4Ll3X1zUVTV2d5UR6%2F2fbbdce5f138018762f715851423cb80%2FHIILZy7aoAAhX0x-1.jpg%3Fw%3D1000%26q%3D100&w=3840&q=75)
Perceptron Mk1 cost Pareto chart. Credit: Perceptron
Led by Co-founder and CEO Armen Aghajanyan, formerly of Meta FAIR and Microsoft, the company spent 16 months developing a "multi-modal recipe" from the ground up to address the complexities of the physical world.
This launch signals a new era where models are expected to understand cause-and-effect, object dynamics, and the laws of physics with the same fluency they once applied to grammar.
Interested users and potential enterprise customers can try it out for themselves on a [public demo site from Perceptron here.](https://www.perceptron.inc/demo)
## **Performance across spatial and video benchmarks**
The model's performance is backed by a suite of industry-standard benchmarks focused on grounded understanding.
![Image 3: Perceptron Mk1 benchmark comparison table](https://venturebeat.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fjdtwqhzvc2n1%2F3bni0DmcvLXuHo4w2ONZ4u%2F46dae281c21ab8b46670fd3c19f0888e%2FHIILjZib0AA7C-h.jpg%3Fw%3D1000%26q%3D100&w=3840&q=75)
Perceptron Mk1 benchmark comparison table. Credit: Perceptron
In spatial reasoning (ER Benchmarks), Mk1 achieved a score of 85.1 on EmbSpatialBench, surpassing Google’s Robotics-ER 1.5 (78.4) and Alibaba’s Q3.5-27B (approx. 84.5).
In the specialized RefSpatialBench, Mk1's score of 72.4 represents a massive leap over competitors like GPT-5m (9.0) and Sonnet 4.5 (2.2), highlighting a significant advantage in referring expression comprehension.
![Image 4: Perceptron Mk1 video benchmark comparison chart](https://venturebeat.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fjdtwqhzvc2n1%2F35ngcNAZi1NDyOEtWicTD5%2F5903b1acd47de4f5a094475bcc4e0f20%2FHIILeIcaIAA38MS-1.jpg%3Fw%3D1000%26q%3D100&w=3840&q=75)
Perceptron Mk1 video benchmark comparison chart. Credit: Perceptron
Video benchmarks show similar dominance; on the EgoSchema "Hard Subset"—where first-and-last-frame inference is insufficient—Mk1 scored 41.4, matching Alibaba’s Q3.5-27B and significantly beating Gemini 3.1 Flash-Lite (25.0).
On the VSI-Bench, Mk1 reached 88.5, the highest recorded score among the compared models, further validating its ability to handle actual temporal reasoning tasks.
## **Market positioning and the efficiency frontier**
Perceptron has explicitly targeted the "Efficiency Frontier," a metric that plots mean scores across video and embodied reasoning benchmarks against the blended cost per million tokens.
Benchmarking data reveals that Mk1 occupies a unique position: it matches or exceeds the performance of "frontier" models like GPT-5 and Gemini 3.1 Pro while maintaining a cost profile closer to "Lite" or "Flash" versions.
Specifically, Perceptron Mk1 is priced at $0.15 per million input tokens and $1.50 per million output tokens. In comparison, the "Efficiency Frontier" chart shows GPT-5 at a significantly higher blended cost (near $2.00) and Gemini 3.1 Pro at approximately $3.00, while Mk1 sits at the $0.30 blended cost mark with superior reasoning scores.
This aggressive pricing strategy is intended to make high-end physical AI accessible for large-scale industrial use rather than just experimental research.
## **Architecture and temporal continuity**
The technical core of Perceptron Mk1 is its ability to process native video at up to 2 frames per second (FPS) across a significant 32K token context window.
Unlike traditional vision-language models (VLMs) that often treat video as a disjointed sequence of still images, Mk1 is designed for temporal continuity.
This architecture allows the model to "watch" extended streams and maintain object identity even through occlusions, a critical requirement for robotics and surveillance applications.
Developers can query the model for specific moments in a long stream and receive structured time codes in return, streamlining the process of video clipping and event detection.
## **Reasoning with the laws of physics**
A primary differentiator for Mk1 is its "Physical Reasoning" capability. Perceptron defines this as a high-precision spatial awareness that allows the model to understand object dynamics and physical interactions in real-world settings.
For example, the model can analyze a scene to determine if a basketball shot was taken before or after a buzzer by jointly reasoning over the ball's position in the air and the readout on a shot clock.
This requires more than just pattern recognition; it requires an understanding of how objects move through space and time.
The model is capable of "pixel-precise" pointing and counting into the hundreds within dense, complex scenes. It can also read analog gauges and clocks, which have historically been difficult for purely digital vision systems to interpret with high reliability.
It also seems to have strong general world and historical knowledge. In my brief test, I uploaded a vintage public domain[film of skyscraper construction in New York City dated 1906](https://www.loc.gov/item/00694391) from the U.S. Library of Congress, and Mk1 was able to not only correctly describe the contents of the footage —including odd, atypical sights as workers being suspended by ropes — but did so rapidly and even correctly identified the rough date (early 1900s) from the look of the footage alone.
![Image 5: Screenshot of Perceptron Mk1 VentureBeat demo test](https://venturebeat.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fjdtwqhzvc2n1%2F5Xu3QOTR61DXPjZ0kKUNtF%2F713248a7571127a03e1491ba55d57555%2FScreenshot_2026-05-12_at_1.29.45%25C3%25A2__PM.png%3Fw%3D1000%26q%3D100&w=3840&q=75)
Screenshot of Perceptron Mk1 VentureBeat demo test
## **A developer platform for physical AI**
Accompanying the model release is an expanded developer platform designed to turn these high-level perception capabilities into functional applications with minimal code.
The Perceptron SDK, available via Python, introduces several specialized functions such as "Focus," "Counting," and "In-Context Learning".
The Focus feature allows users to zoom and crop into specific regions of a frame automatically based on a natural language prompt, such as detecting and localizing personal protective equipment (PPE) on a construction site. The Counting function is optimized for dense scenes, such as identifying and pointing to every puppy in a group or individual items of produce.
Furthermore, the platform supports in-context learning, allowing developers to adapt Mk1 to specific tasks by providing just a few examples, such as showing an image of an apple and instructing the model to label every instance of Category 1 in a new scene.
## **Licensing strategies and the Isaac series**
Perceptron is employing a dual-track strategy for its model weights and licensing. The flagship Perceptron Mk1 is a closed-source model accessed via API, designed for enterprise-grade performance and security.
However, the company is also maintaining its "Isaac" series, which kicked off with the [launch of Isaac 0.1 in September 2025](https://www.perceptron.inc/blog/introducing-isaac-0-1), as an open-weights alternative.[Isaac 0.2-2b-preview](https://www.perceptron.inc/blog/introducing-isaac-0-2), released in December 2025, is a 2-billion parameter vision-language model with reasoning capabilities that is available for edge and low-latency deployments.
While the weights for the Isaac models are open on the popular AI code sharing community [Hugging Face](https://huggingface.co/PerceptronAI), Perceptron offers commercial licenses for companies that require maximum control or on-premise deployment of the weights.
This approach allows the company to support both the open-source community and specialized industrial partners who need proprietary flexibility. The documentation notes that Isaac 0.2 models are specifically optimized for sub-200ms time-to-first-token, making them ideal for real-time edge devices.
## **Background on Perceptron founding and focus**
Perceptron AI is a Bellevue, Washington-based physical AI startup founded by Aghajanyan and Akshat Shrivastava, both former research scientists at Meta’s Facebook AI Research (FAIR) lab.
The company’s public materials date its founding to November 2024, while a Washington corporate filing record for Perceptron.ai Inc. shows an[earlier foreign registration filing on October 9, 2024](https://www.bizprofile.net/wa/carnation/perceptron-ai-inc?utm_source=chatgpt.com), listing Shrivastava and Aghajanyan as governors.
In founder launch posts from late 2024, [Aghajanyan](https://www.linkedin.com/posts/armenag_after-nearly-6-years-at-meta-im-excited-share-7265412761990369280-Aoyw/?utm_source=chatgpt.com) said he had left Meta after nearly six years and “joined forces” with Shrivastava to build AI for the physical world, while Shrivastava said the company grew out of his work on efficiency, multimodality and new model architectures.
The founding appears to have followed directly from the pair’s work on multimodal foundation models at Meta. In May 2024, [Meta researchers published Chameleon](https://www.researchgate.net/publication/380635519_Chameleon_Mixed-Modal_Early-Fusion_Foundation_Models?utm_source=chatgpt.com), a family of early-fusion models designed to understand and generate mixed sequences of text and images, work that Perceptron later described as part of the lineage behind its own models.
A July 2024 follow-on paper, [MoMa](https://arxiv.org/abs/2407.21770), explored more efficient early-fusion training for mixed-modal models and listed both Shrivastava and Aghajanyan among the authors. Perceptron’s stated thesis extends that research direction into “physical AI”: models that can process real-world video and other sensory streams for use cases such as robotics, manufacturing, geospatial analysis, security and content moderation.
## **Partner ecosystems and future outlook**
The real-world impact of Mk1 is already being demonstrated through Perceptron's partner network. Early adopters are using the model for diverse applications, such as auto-clipping highlights from live sports, which leverages the model's temporal understanding to identify key plays without human intervention.
In the robotics sector, partners are curating teleoperation episodes into training data, effectively automating the process of labeling and cleaning data for robotic arms and mobile units.
Other use cases include multimodal quality control agents on manufacturing lines, which can detect defects and verify assembly steps in real-time, and wearable assistants on smart glasses that provide context-aware help to users.
Aghajanyan stated that these releases are the culmination of research intended to make AI function best in the physical world, moving toward a future where "physical AI" is as ubiquitous as digital AI.
##### Subscribe to get latest news!
Deep insights for enterprise AI, data, and security leaders
VB Daily
AI Weekly
AGI Weekly
Security Weekly
Data Infrastructure Weekly
VB Events
All of them
By submitting your email, you agree to our[Terms](https://venturebeat.com/terms-of-service)and[Privacy Notice](https://venturebeat.com/privacy-policy).
Get updates
You're in! Our latest news will be hitting your inbox soon.
## More
[](https://venturebeat.com/)
[](https://www.facebook.com/venturebeat)[](https://www.instagram.com/venturebeat)[](https://twitter.com/venturebeat)[](https://www.linkedin.com/company/venturebeat)[](https://www.youtube.com/venturebeat)
*   [Press Releases](https://venturebeat.com/press-releases)
*   [Contact Us](https://venturebeat.com/contact-2)
*   [Advertise](https://media.venturebeat.com/)
*   [Share a News Tip](https://venturebeat.com/contact-2)
*   [Contribute](https://venturebeat.com/guest-posts)
*   [Privacy Policy](https://venturebeat.com/privacy-policy)
*   [Terms of Service](https://venturebeat.com/terms-of-service)
*   [Consent Preferences](https://venturebeat.com/technology/perceptron-mk1-shocks-with-highly-performant-video-analysis-ai-model-80-90-cheaper-than-anthropic-openai-and-google#)
*   [Do Not Sell or Share My Personal Information](https://app.termly.io/notify/f592675e-4484-4dc9-bb50-462a84720662)
*   [Limit the Use Of My Sensitive Personal Information](https://app.termly.io/notify/f592675e-4484-4dc9-bb50-462a84720662)
© 2026 VentureBeat. All rights reserved.