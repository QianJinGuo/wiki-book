---
source_url: "https://mistral.ai/news/robostral-navigate/"
source_type: newsletter
title: "Robostral Navigate: single-camera AI navigation | Mistral AI"
tags: ["newsletter", "ai", "model"]
score_vxc: 64
score_value: 8
score_confidence: 8
score_stars: 4
ingested_at: 2026-07-09T18:59:54Z
sha256: 7126d54a8fe5c1760bef26ba353f49155cff89b39f9afb8820a902b0abe1a677
---
---

# Robostral Navigate: single-camera AI navigation | Mistral AI

> Source: [https://mistral.ai/news/robostral-navigate/](https://mistral.ai/news/robostral-navigate/)

Markdown Content:
Thinking

Summary

Robostral Navigate is an 8B model that enables robots to autonomously navigate complex environments using only a single RGB camera, achieving 76.6% success on unseen R2R-CE benchmarks—outperforming multi-sensor approaches while being more efficient. Built entirely in-house with simulated data and token-efficient techniques, it generalizes across robot types and adapts to real-world obstacles unseen during training. The model combines pointing-based navigation with reinforcement learning for continuous improvement, paving the way for unified embodied AI in robotics.

Today we're introducing Robostral Navigate, our first model built for embodied navigation. It's an 8B model that takes RGB images and a plain-language instruction and moves a robot through an environment:

> “Leave the lobby, walk through the corridor, enter the supply room, and stop to face the second shelf.”

To perform such tasks, other models often employ depth sensors, LiDAR, or several cameras working together. Robostral Navigate uses only one ordinary RGB camera and no depth sensors, yet still achieves 76.6% on R2R-CE (Room-to-Room in Continuous Environments) validation unseen, the benchmark for following instructions in environments held out of training. Consequently, it beats the best single-camera approach by 9.7 points and the best system using depth or multiple cameras by 4.5 points, despite using neither.

Our model is designed for robotic navigation, enabling robots to autonomously navigate complex environments, including offices, residential and commercial buildings, and outdoor settings.

[Video 3](https://www.youtube.com/watch?v=7dpLB9NoY1A)

_Robostral Navigate running fully autonomously in one long-horizon instruction route through a working office._

This technology unlocks numerous applications across manufacturing, delivery, logistics, and hospitality, making it one of the most in-demand capabilities for our customers today. Give Robostral Navigate one instruction and it completes the entire task on its own, moving through a live space full of people and obstacles it was never shown, capable of adapting to any setting.

## **Highlights**

*   State-of-the-art performance on R2R-CE

*       *   **79.4% Success Rate** on validation seen

    *   **76.6% Success Rate** on validation unseen

*   Operates from a single RGB camera, with no LiDAR or depth sensors

*   8B model, built in-house and trained entirely in simulation

*   Runs on wheeled, legged, and flying robots, and generalizes across robot sizes

*   Robust to differences in camera intrinsics

*   Token-efficient training via prefix-caching

![Image 1](https://mistral.ai/cms-media/api/media/file/model-performance-comparison-(success-rate-%E2%86%91)%203-1.svg)

![Image 2](https://mistral.ai/cms-media/api/media/file/model-performance-comparison-(oracle-success-rate-%E2%86%91)%203-1.svg)

![Image 3](https://mistral.ai/cms-media/api/media/file/model-performance-comparison-(success-weighted-by-path-length-%E2%86%91)%203-1.svg)

![Image 4](https://mistral.ai/cms-media/api/media/file/model-performance-comparison-(navigation-error-%E2%86%93)%203-1.svg)

## **Navigation via pointing**

Given a task and a history of observations, Robostral Navigate predicts where the robot should move next via _pointing_: it infers the image coordinates of the target location in the robot's current camera view, together with the desired orientation upon arrival. Unlike commands relying on metric displacements, pointing makes the policy naturally robust to changes in camera intrinsics and world scale.

However, this method cannot handle cases where the target location lies outside the current field of view. When pointing does not apply, the model falls back to displacements in the robot's local coordinate frame, such as:

> "Move 2 meters forward, 1.5 meters to the left, and turn 25 degrees left."

## **Built from the ground up**

Robostral Navigate is built entirely in-house and does not rely on existing open-source VLMs.

The model is initialized from our vision-language model specialized for grounding tasks such as pointing, counting, and object localization. Navigation emerges as a natural extension of these capabilities: once it understands where things are, it learns how to move.

We built an efficient data generation pipeline entirely in simulation. This enabled rapid iteration on the data, resulting in a dataset of approximately **400,000 trajectories collected across 6,000 scenes**.

## **Efficient supervised training**

A key ingredient of Robostral Navigate is an efficient training algorithm based on prefix-caching. Using a tree-based attention-masking strategy, our method compresses an entire episode into a single sequence, enabling training on all time steps in a single forward pass while preventing information leakage between time steps.

Compared to training with one sample per time step, our approach reduces the number of training tokens by **22×** while preserving all of the learning signals. In practice, this method **transforms training runs that would take months into runs that complete in days.**

**Online reinforcement learning**

We leverage our knowledge of post-training LLMs at scale, using online reinforcement learning, to boost the performance of Robostral Navigate. After the supervised training stage, we further improve the model's performance using CISPO, an online reinforcement learning algorithm. This enables the model to learn from trial and error, recover from failures, and acquire exploratory behaviors, effectively mitigating the distribution shift issue of vanilla behavior cloning. This alone improved the success rate by 3.2%. We are not seeing any plateauing, so we are confident that more training and more experiments will continue to push this number up.

## **What's Next**

Robostral Navigate is only the first step toward a unified embodied agent.

We believe navigation is a foundational capability for general-purpose robotics. By combining large-scale simulation, efficient training, and strong grounding priors, Robostral Navigate demonstrates that state-of-the-art embodied navigation can be achieved with a compact model and a single RGB camera.

Start your journey to embodied frontier AI, [talk with our team](https://mistral.ai/contact).

## BTW, we're hiring!

The release of our navigation models marks a significant step forward, but our journey is far from over. Our ambition is to enable robots to autonomously navigate complex environments—offices, homes, commercial buildings, and outdoor spaces—and there's a lot more work to do. We are actively expanding our robotics team and looking for talented research scientists and engineers who share our ambition.

If you're interested in joining us on our mission to bring seamless navigation to robots everywhere, we welcome your applications [to join our team!](https://jobs.lever.co/mistral?team=Research)

_By Théo Cachet, Arjun Majumdar, Srijan Mishra, Thomas Chabal, Chris Bamford, Elliot Chane-Sane, Benjamin Tibi, Ludovic Ho Fuh, Olivier Duchenne - AI Science Robotics_
