---
source_url: "https://netflixtechblog.com/toward-more-controllable-ai-video-editing-an-early-research-exploration-at-netflix-eb8160ed60a2?source=rss----2615bd06b42e---4"
ingested: 2026-06-26
sha256: 61f7aad57d159810
---

# Toward More Controllable AI Video Editing: An Early Research Exploration at Netflix

By [Zhuoning Yuan](<https://www.linkedin.com/in/zhuoning-yuan/>), [Ta-Ying Cheng](<https://www.linkedin.com/in/tim-ta-ying-cheng-411857139/>), [Benjamin Klein](<https://www.linkedin.com/in/benjamin-klein-usa/>), [Bahareh Azarnoush](<https://www.linkedin.com/in/bahareh-azarnoush/>)

### Introduction

At Netflix, we build technology to help storytellers bring their creative visions to life and to help members discover the stories they love.

To connect stories with diverse audiences around the world, we produce promotional assets, including trailers, teasers, and social short‑form videos, that build on and elevate the original footage. Through close collaboration with the teams crafting these assets, we identified a recurring gap in current tools. Transforming raw footage into a polished final asset often requires complex edits like seamlessly adding new visual elements, patching or replacing backgrounds, or removing unwanted objects without breaking the scene’s physical continuity. These tasks typically demand hours of specialized manual editing work. While recent generative video editing models show promise, they often struggle to preserve the integrity of the source footage. Many methods regenerate every pixel to make an edit, which can fail to isolate changes and inadvertently alter elements that should remain untouched. To execute these tasks effectively, artists need tools that empower them to dictate exactly what changes and how it changes.

Our research goal is to make this process easier for artists. We’re deliberate about where and how AI is applied, ensuring that the technology always serves the creative intent. That principle drives our recent work: exploring the benefits of generative AI in ways that protect and expand creative choice, and keeping artists in precise control of their final vision. Recent advancements in AI video editing have demonstrated impressive capabilities in streamlining complex manual editing workflows, but key challenges remain before they can reliably support professional use:

  * **Unintended edits:** When editing a specific element in a video clip, many methods regenerate the entire video, which can inadvertently alter identity, performance, and other elements like objects, backgrounds, or critical scene details.

Left: input video. Right: output from Ditto using the prompt “change the background to a winding coastal highway in California,” which completely changes the scene.

  * **Unnatural physics** : When removing objects, many methods focus only on erasing the target while ignoring the scene’s physical continuity. This can lead to inconsistent motion and implausible interactions, making the results look unnatural.

Left: the green mask denotes the target to be removed. Right: output from Gen-Omnimatte where the target was removed, but the physical continuity of the scene was ignored — the pool float shouldn’t move if there’s no interaction with it.

Today, we’re sharing two research explorations that aim to address these challenges. We believe this work can help advance the field in a way that’s both meaningful and responsible:

  * [**Vera**](<https://vera-layered-diffusion.github.io/>)**:** a layered video diffusion model. Vera generates only what needs to change as separate edit layers while leaving the rest of the video untouched, preserving the identities, performances, and other details from the source footage exactly as filmed.
  * [**VOID**](<https://void-model.github.io/>): a video inpainting model for video object and interaction deletion. VOID performs physically plausible inpainting in complex scenes: it doesn’t just remove an object, but also reconstructs the scene as if the object was never there.



Along with this blog post, we’re also publicly releasing the research papers that detail the algorithmic innovations behind [Vera](<https://drive.google.com/file/d/1CjPHJ71NS9R_HdlVok1fcfc5JcG0UoDa/view?usp=sharing>) and [VOID](<https://arxiv.org/abs/2604.02296>). We hope these publications will enable other researchers to experiment with these ideas, build upon our findings, and further advance the field.

### Vera: A Layered Video Diffusion Model

Existing video editing models regenerate the entire clip, coupling the intended edit with regions that should remain unchanged. This increases the risk of altering details of the original footage. To tackle this challenge, we introduce [**Vera**](<https://vera-layered-diffusion.github.io/>), a novel layered video diffusion framework for content-preserving video editing.

Teaser for Vera (disclaimer: This is a research prototype, not an official product).

#### Inference Pipeline

Given a source video and a text editing instruction, Vera jointly generates an edit layer and an alpha matte. These layers are then seamlessly composed with the original footage to produce the final edited result. By design, Vera supports complex tasks such as object addition and background change, while ensuring that the pixels outside the edited regions from the source video remain perfectly intact.

Inference pipeline for Vera: object addition and background replacement.

#### Training Data

One of the main challenges in developing Vera was the lack of suitable training data. Since no public dataset provides the high-quality layered data we need (clean input, alpha matte, edit layer, composite video), we built our own. Using a combination of existing open-source videos and human annotation, we constructed a layered video dataset with a total of 486k frames at 832×480 resolution. We organized it into three subsets of increasing complexity:

  * **Synthetic Composites** : Clips with high-quality foreground alpha mattes are composited over diverse, automatically generated backgrounds. This subset provides strong and reliable supervision for alpha matting in object addition and background change tasks.
  * **Realistic Single-Object Videos** : Real-world clips are processed through segmentation, matting, background inpainting/generation, and human quality filtering. This subset increases scene diversity and camera motion, improving composition quality across both tasks.
  * **Realistic Multi-Object Videos with Effects** : This extends the previous subset by isolating individual objects with curated alpha mattes, including their associated effects such as shadows and reflections. This subset improves compositing and editing in more complex, dynamic scenes.



#### Model Architecture

Beyond data, model design is another key challenge. The three target outputs Vera generates — an **edit layer** (decoupled creative edits), an **alpha matte layer**(a grayscale mask that depends on the edit content and scene interactions such as occlusions), and a **composite layer**(natural footage) — have substantially different distributions. In practice, using a single shared architecture to reconcile these differences proved data-inefficient. To address this, Vera uses a [MoT (Mixture-of-Transformers)](<https://arxiv.org/abs/2411.04996>) design. Instead of a single DiT, we use three separate DiTs, one for each output:

  * Each DiT maintains its own QKV projections and FFN weights, but we concatenate the output tokens from all three branches and then pass it to joint self-attention. This enables cross-layer interaction while allowing each branch to specialize.
  * All three DiTs are initialized from the same pretrained T2V base model. We add two additional patch-embedding layers for the input video and an optional mask video. Source-video tokens are added to the composite tokens, while mask tokens are added to the noisy alpha tokens.
  * All layers share the same [RoPE (Rotary Positional Encoding)](<https://arxiv.org/abs/2104.09864>). We also add zero-initialized learnable embeddings to the alpha and composite tokens to help the model distinguish between layers.

Architecture of Vera compared to other methods. We train two Vera variants: 1.3B and 14B parameters.

#### Evaluations and Results

To evaluate Vera, we curated a benchmark of test video-prompt pairs: 72 for object addition and 69 for background change, using open-source videos. The test set spans a range of difficulty, including slow and fast motions, various camera motions, single and multiple objects, and both simple and complex scenes. We evaluated the performance across three complementary dimensions:

  * **Content Preservation** : Measures whether regions outside the targeted edit remain strictly unaltered, evaluated using pixel-level and perceptual similarity.
  * **Instruction Compliance** : Measures how faithfully the edited video executes the text prompt.
  * **Video Quality** : Assesses the temporal coherence and per-frame spatial quality of the final edited video.



In our results, both Vera-1.3B and Vera-14B significantly outperform existing baselines on content preservation, while maintaining similar video quality and instruction compliance performance compared to strongest baselines (please see the [paper](<https://drive.google.com/file/d/1CjPHJ71NS9R_HdlVok1fcfc5JcG0UoDa/view?usp=sharing>) for full results).

Qualitative comparisons between Vera and baselines (please see more examples on Vera’s [project website](<https://vera-layered-diffusion.github.io/>)).

To complement automated metrics, we ran a human preference study comparing Vera against five baselines. We collaborated with 19 creative reviewers who evaluated 512 video trials in total. In each trial, reviewers were shown randomized side-by-side comparisons between the Vera model and a baseline model. The human consensus strongly aligned with our quantitative findings: Vera-1.3B was preferred over all baselines for content preservation and instruction compliance. Furthermore, reviewers rated Vera’s video quality as comparable to baselines on background change tasks, and noted a clear advantage for Vera on object addition tasks.

User study on test set: Vera-1.3B vs. five strong baselines.

### VOID: Video Object and Interaction Deletion

Existing video object removal methods excel at inpainting content “behind” the object and correcting appearance-level artifacts such as shadows and reflections. However, when the removed object has more significant interactions — such as collisions with other objects — current models fail to correct them and produce implausible results. To address this, we present [**VOID**](<https://void-model.github.io/>), a video object removal framework designed to perform physically-plausible inpainting in these complex scenarios.

Teaser for VOID (disclaimer: This is a research prototype, not an official product).

#### A Two-Pass Inference Pipeline

Given an input video, the user clicks on an object to remove. A **VLM-based reasoning pipeline** then analyzes the scene to identify other regions that will be causally affected, e.g., objects that will fall, collide, or change trajectory. This physical reasoning is encoded into a quadmask to guide the diffusion model:

  * **First Pass:** VOID takes the video and the quadmasks as input and generates a physically plausible counterfactual video in which the object — and its interactions — are removed.
  * **Second Pass** : Smaller video diffusion models occasionally suffer from “object morphing” when generating moving objects. If VOID detects this failure mode, it triggers a second pass that re-runs inference using [flow-warped noise](<https://arxiv.org/abs/2501.08331>) derived from the first pass, stabilizing the object’s shape along its newly synthesized trajectory.

Overview of VOID’s two-pass inference pipeline.

#### Training Data

We built on top of the [Kubric simulation engine](<https://github.com/google-research/kubric>) and the [HUMOTO](<https://arxiv.org/abs/2504.10414>) human motion capture dataset to generate synthetic counterfactual video pairs along with their corresponding quadmasks. Specifically, the counterfactual videos are generated by re-simulating the exact scene from the original video, but with the target object(s) or human removed. This resimulation creates an alternate outcome based on strict laws of physics. For example, if a person holding a lamp is removed from the scene, the simulation ensures the lamp obeys gravity and falls to the ground. The quadmasks then capture the removed object (black), the affected regions (grey), their overlaps (dark grey), and the unchanged parts of the scene (white).

Overview of VOID data engine.

#### Model Training

During model training for VOID, we introduce two improvements over prior work: (i) quadmask conditioning, which explicitly identifies regions in each frame that may change after the object is removed, and (ii) a second-pass video appearance refiner that reduces artifacts such as unwanted object morphing. VOID is finally trained on the [CogVideoX-Fun-V1.5–5b-InP](<https://huggingface.co/alibaba-pai/CogVideoX-Fun-V1.5-5b-InP>) backbone with Gen-Omnimatte’s [checkpoint](<https://github.com/gen-omnimatte/gen-omnimatte-public?tab=readme-ov-file>) and fine-tuned for video inpainting with interaction-aware quadmask conditioning.

#### Evaluations and Results

Experiments across both synthetic and real data demonstrate that VOID preserves consistent scene dynamics far better than prior video object removal methods (please see the [paper](<https://arxiv.org/abs/2604.02296>) for full results). VOID successfully maintains object structure and produces plausible motion over time across a wide variety of real-world cases. By contrast, results from both open- and closed-source baselines consistently exhibit physically inaccurate artifacts. For instance, baselines generate water splashes without human impact (see top row of the figure below) or show spinning tops being disrupted without the presence of interacting hands.

Comparison of VOID with other strong baselines (please see more examples on VOID’s [project website](<https://void-model.github.io/>)).

To complement our quantitative evaluation, we conducted a user study with 25 creative reviewers to measure the perceptual realism and physical plausibility of our counterfactual edits. Each participant was randomly assigned 5 out of 75 real-world scenarios, resulting in 125 total comparisons. For each video, participants viewed the original input alongside the outputs of VOID and six baselines (seven models total) in a randomized order. Participants were asked to select the video that best reflected how the scene should realistically appear after the object was removed, factoring in visual quality, temporal consistency, blending, the realism of scene evolution, and the absence of artifacts. VOID was selected 64.8% of the time, substantially outperforming all baseline models.

User study on real-world test examples: VOID vs. six baselines.

### Looking Ahead

Applying AI in ways that serve both member and creator needs is core to our research philosophy, and these projects reflect that approach. While Vera and VOID show promising early results, reaching production-ready quality will require addressing several limitations we encountered. For example, Vera struggles with some complex effects such as lightning or smoke due to the limited training data, and in some cases, it fails to keep background motion fully consistent with the input camera movement. Despite the various generalization capabilities VOID exhibits, we still observe domain gaps. For instance, it cannot handle videos with unusual camera angles or shots captured very close to the target object, and it currently has constraints on supported video length and resolution.

These limitations motivate continued investment in this line of research. Vera and VOID are important early efforts toward making complex video editing more controllable and accessible for artists. For this work, we used publicly available datasets with additional annotation efforts for experiments, and we hope that sharing our research will encourage the broader community to build on these ideas and advance them further.

* * *

[Toward More Controllable AI Video Editing: An Early Research Exploration at Netflix](<https://netflixtechblog.com/toward-more-controllable-ai-video-editing-an-early-research-exploration-at-netflix-eb8160ed60a2>) was originally published in [Netflix TechBlog](<https://netflixtechblog.com>) on Medium, where people are continuing the conversation by highlighting and responding to this story.
