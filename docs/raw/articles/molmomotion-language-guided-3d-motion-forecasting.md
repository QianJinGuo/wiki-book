---
source_url: "https://huggingface.co/blog/allenai/molmomotion"
ingested: 2026-06-26
sha256: 2a77ac9a1636ff23
---

# MolmoMotion: Language-guided 3D motion forecasting


Published Time: 2026-06-17T15:26:44.501Z

Markdown Content:
[Back to Articles](https://huggingface.co/blog)

[![Image 1: Kyle Wiggers's avatar](https://huggingface.co/avatars/fee5cceec7536851d7c6712760716a71.svg)](https://huggingface.co/Ai2Comms)

*   [MolmoMotion: Under the hood](http://huggingface.co/blog/allenai/molmomotion#molmomotion-under-the-hood "MolmoMotion: Under the hood")

*   [Introducing MolmoMotion-1M and PointMotionBench](http://huggingface.co/blog/allenai/molmomotion#introducing-molmomotion-1m-and-pointmotionbench "Introducing MolmoMotion-1M and PointMotionBench")

*   [Experiments and performance](http://huggingface.co/blog/allenai/molmomotion#experiments-and-performance "Experiments and performance")
    *   [3D motion forecasting](http://huggingface.co/blog/allenai/molmomotion#3d-motion-forecasting "3D motion forecasting")

    *   [Downstream evaluation: robotics planning](http://huggingface.co/blog/allenai/molmomotion#downstream-evaluation-robotics-planning "Downstream evaluation: robotics planning")

    *   [Downstream evaluation: video generation](http://huggingface.co/blog/allenai/molmomotion#downstream-evaluation-video-generation "Downstream evaluation: video generation")

*   [Limitations and what's next](http://huggingface.co/blog/allenai/molmomotion#limitations-and-whats-next "Limitations and what&#39;s next")

🧠 Models: [https://huggingface.co/collections/allenai/molmomotion](https://huggingface.co/collections/allenai/molmomotion) | 📄 Tech Report: [https://allenai.org/papers/molmomotion](https://allenai.org/papers/molmomotion) | 📊 Data: [https://huggingface.co/datasets/allenai/molmo-motion-1m](https://huggingface.co/datasets/allenai/molmo-motion-1m) | 💻 Code: [https://github.com/allenai/molmo-motion.git](https://github.com/allenai/molmo-motion.git) | 🌐 Project Page: [https://molmomotion.github.io/](https://molmomotion.github.io/)

Machines have become remarkably good at perceiving motion. Given a video, modern models can track how objects and points move through a scene with exceptionally high confidence. But perception is inherently retrospective: it explains motion that has already happened. Many of the systems and applications we want to build need to _look forward_ instead. A robot reaching for a cup has to anticipate how the cup will move before it touches it. A video generator has to know what realistic motion comes next if it's going to produce physically plausible frames.

Predicting motion is harder than observing it, but it's also far more useful in many scenarios.

This idea was the motivation behind **[MolmoMotion](https://huggingface.co/collections/allenai/molmomotion)**, a new motion forecasting model we're releasing today. Given a video frame, 3D points marked on an object, and written instructions describing the intended action (e.g., “Move and rotate the wooden bowl with fruit on the table”), MolmoMotion predicts where those points will move over the next few seconds in 3D space—achieving substantially stronger performance than existing forecasting methods.

[Video 26](https://stream.mux.com/tFUDQIEocknFyVAHy2uLFlSh9HMoXets/high.mp4)
_Given an RGB observation, a set of query points on an object, and an action description, MolmoMotion predicts the object's future 3D point trajectory. These predicted trajectories can then drive downstream applications such as robotics planning and trajectory-conditioned video generation._

Alongside the model, we're publishing **[MolmoMotion-1M](https://huggingface.co/datasets/allenai/molmo-motion-1m)**, the largest collection of 3D point trajectories paired with action descriptions, drawn from 1.16M videos. We're also releasing **[PointMotionBench](https://huggingface.co/datasets/allenai/PointMotionBench)**, a human-validated benchmark designed to measure object-centric 3D motion forecasting accuracy, containing 2.7K video clips.

We find that motion forecasters like MolmoMotion can be useful across a range of downstream tasks, from robot planning to controllable video generation. We're releasing the model weights, the MolmoMotion-1M dataset, and our PointMotionBench benchmark openly for the community to study, improve, and customize.

### [](http://huggingface.co/blog/allenai/molmomotion#molmomotion-under-the-hood) MolmoMotion: Under the hood

MolmoMotion represents motion in a deliberate, highly efficient way: as object-attached 3D points in world space, which capture motion without the cost of rendering full video. We chose it because we needed a general motion representation with three properties:

1.   Class-agnostic: not tied to templates for human bodies, hands, rigid objects, or any other fixed category.
2.   View-stable: the same physical motion should be represented consistently across cameras and viewpoints.
3.   Directly usable by downstream systems that need to reason about physical motion.

Among the representations we considered, it was the only one that satisfied all three. A sparse set of surface points can describe rigid, articulated, and (within limits) deformable motion without assuming the type of object being moved. Because the points live in a shared world frame, their trajectories remain stable across camera motion and viewpoint change. And because they're compact explicit trajectories in 3D space, they can be passed directly to systems such as robot policies or video generation models.

To forecast those trajectories, MolmoMotion uses Molmo 2 as its backbone, allowing it to connect language instructions to objects and points in an image. Given a short video history, an action description, and a set of query points with their initial 3D positions, the model first identifies the object being referred to, the query points, and the motion the instruction describes. It then predicts the future 3D trajectory of each point.

We train two variants of MolmoMotion:

*   The autoregressive variant (MolmoMotion-AR) predicts future coordinates step by step. It represents 3D coordinates as structured text, following the coordinate-style prediction used by VLMs, and writes out the future trajectory in temporal order. Because each new coordinate is conditioned on the trajectory already generated, this encourages smooth rollouts and gives the strongest accuracy when the future path is well-defined.
*   The flow-matching variant (MolmoMotion-FM) predicts trajectories in continuous 3D space by transforming noise into motion, which makes it better suited for representing uncertainty when an instruction admits multiple plausible futures.

[![Image 2: model_arc (1)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/HHvNyFV4Hq5XBrzTNZEG2.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/HHvNyFV4Hq5XBrzTNZEG2.png)

_The MolmoMotion architecture. The shared input to the Molmo 2 backbone consists of image tokens of RGB observations, text tokens of action description, and 2D query point feature tokens sampled from the Molmo 2 vision encoder. MolmoMotion-AR encodes the initial 3D query coordinates and decodes future trajectories as quantized coordinate text, while MolmoMotion-FM represents them directly in continuous 3D coordinate space._

### [](http://huggingface.co/blog/allenai/molmomotion#introducing-molmomotion-1m-and-pointmotionbench) Introducing MolmoMotion-1M and PointMotionBench

To train MolmoMotion, we needed data that didn’t yet exist: large-scale videos with 3D point trajectories grounded to specific objects and paired with action descriptions. Existing 3D-track datasets were small and domain-limited, and while internet videos have all the scale and diversity we wanted for a forecaster like MolmoMotion, they didn’t include 3D annotations. So we built an automatic pipeline that extracts object-grounded 3D trajectories from unconstrained video.

Given an input video and its action description, our annotation pipeline produces object-grounded 3D point trajectories in metric world coordinates. (The figure below shows each stage.) The challenging part is that raw tracks from unconstrained video are noisy – with depth and tracking errors that leave points jittering and drifting – and that objects often stay still for much of a video. To make the data more trustworthy, we filter out points that don't move coherently with the rest of the object, smooth the remaining trajectories, and segment each clip to the window where the object actually moves.

Running our pipeline at scale yielded MolmoMotion-1M—to our knowledge the largest corpus of action-described, object-grounded 3D point trajectories assembled to date, spanning 736 motion types and 5.6K distinct objects.

[Video 27](https://stream.mux.com/ESYTT69ckxwlqP7Cn02V1qYduekjvTW026/high.mp4)
_An overview of our data annotation pipeline. Given a video of an action event and its description, we first ground the moving object and sample query points on it. We then track dense 2D points on the object, lift these tracks into a shared metric 3D frame, and use object-level spatial and temporal consistency priors to filter unreliable trajectories. Finally, we clip the video around intervals where the grounded object undergoes meaningful motion._

_Top instruction: **"Move and rotate wooden bowl with fruits on the table."** Bottom instruction: **"Roll a lint roller on a blue cloth."**_

_Top instruction: "**A silver car follows the road and slowly turns to the right."** Bottom instruction: **"A flamingo dips its beak into the water while walking to the right."**_

To evaluate MolmoMotion’s forecasting performance, we also built PointMotionBench, a human-validated benchmark of held-out 3D trajectories. It covers 2.7K clips spanning 111 object categories and 61 motion types, including indoor manipulation, egocentric hand-object interaction, and outdoor dynamic scenes. For each clip, models are given the current observation, object query points, and an action description, and are evaluated on how accurately their predicted 3D point trajectories match the object’s actual future motion. This gives us a direct quantitative test of 3D motion forecasting rather than relying on whether a generated point track merely looks plausible.

### [](http://huggingface.co/blog/allenai/molmomotion#experiments-and-performance) Experiments and performance

We evaluate MolmoMotion in three ways. First, we test whether it forecasts future 3D motion more accurately than existing methods. Second, we test whether what it has learned about motion helps a robot carry out manipulation tasks. Third, we test whether that same knowledge can help guide the motion in generated video.

#### [](http://huggingface.co/blog/allenai/molmomotion#3d-motion-forecasting) 3D motion forecasting

On PointMotionBench, MolmoMotion outperforms all existing 3D motion forecasting methods we tested – including pixel-space video generators, parametric 3D methods, and a simple constant-velocity baseline – across a range of objects, scenes, and actions.

MolmoMotion can forecast many kinds of object and scene motions, like how a lint roller will move back and forth on cloth, how a bowl will slide and rotate on a table, how a flamingo will walk to the right while dipping its beak in a body of water, or how a car will follow a road as it turns. In each case, the predicted path follows the instruction MolmoMotion was given and stays extremely close to the ground truth motion in our benchmark.

[![Image 3: precision-capture-2026-06-08T04-51-19--1of3-pointmotionbench-benchmark-results](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/VqvfWJJxdm5q_8FXaPdUs.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/VqvfWJJxdm5q_8FXaPdUs.png)

#### [](http://huggingface.co/blog/allenai/molmomotion#downstream-evaluation-robotics-planning) Downstream evaluation: robotics planning

What MolmoMotion learns about motion should carry over from one setting to another—lifting a cup with a human hand and lifting it with a robot gripper are very different actions, but the cup itself follows a similar path through 3D space. That makes MolmoMotion a natural fit for robotics, where a robot has to plan how objects should move before moving them.

After fine-tuning on DROID, a large open dataset of real-world robot manipulation videos, we find that MolmoMotion can predict sensible object paths across different objects, camera viewpoints, scenes, and tasks for a wide range of robot planning scenarios.

[Video 28](https://stream.mux.com/K1wj01GkBAEVH9I5ME2z62j02WCJCYnAAr/high.mp4)[Video 29](https://stream.mux.com/hwSRRuqjub4qivRJSfjNrJeXh7hzuHkG/high.mp4)
_Top instruction: **“Take cloth out of container."** Bottom instruction: **“Move lid on pot.”**_

In simulation, a control policy built on MolmoMotion succeeds on 76.3% of pick-and-place tasks versus 56.0% for the same policy built on Molmo 2—and it learns faster, reaching 51% after 10K training steps where the Molmo 2 version tops out at 19%. On real robots (after fine-tuning), MolmoMotion reaches the same test L2 error that the Molmo 2 baseline achieves after 12K training steps in only about 2K steps.

[![Image 4: unnamed - 2026-06-05T152016.702](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/-3uk4z6uTrbYDcxKwVllz.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/-3uk4z6uTrbYDcxKwVllz.png)

#### [](http://huggingface.co/blog/allenai/molmomotion#downstream-evaluation-video-generation) Downstream evaluation: video generation

[Video 30](https://stream.mux.com/LsZyR8f2PAp9opog1o02BlUGi02x27rUyR/medium.mp4)[Video 31](https://stream.mux.com/S5T8i1WBNEAc3ZVXhRSYEH96QtzCTFrm/medium.mp4)[Video 32](https://stream.mux.com/ulSaEQIo3XJKlT5JJMKKcBYHsAyQVxS9/medium.mp4)
_Instruction: **“A flamingo dips its beak into the water while walking to the right.”** From top to bottom: DaS + MolmoMotion, CogVideoX-5B, and WAN-14B._

[Video 33](https://stream.mux.com/IwNFj8I1HcIlyM1cGJ4qA02Em014xzpzHR/high.mp4)[Video 34](https://stream.mux.com/ccUZyS7NFxkAwLH8OldRD27qfa96h6b9/high.mp4)[Video 35](https://stream.mux.com/102ovjPjH00KTK3nWmRY02zcJy00bwXDWssH/high.mp4)
_Instruction: **"Take the round light brown plate from the table.”** From top to bottom: DaS + MolmoMotion, CogVideoX-5B, and WAN-14B._

MolmoMotion's predicted paths can also steer video generation. Instead of letting an image-to-video model guess motion from a text instruction alone, you can feed in MolmoMotion's predictions. The result is generated video that follows requested actions more closely, especially for small and precise movements a prompt can only describe vaguely.

The metrics back this up. Used to guide a video generator, MolmoMotion improves motion quality over the base model on all five motion-related metrics we measure, and beats a much larger image-to-video model on four of the five.

[![Image 5: unnamed - 2026-06-05T152020.572](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/q03BAwgpKBOwmFl2Dqn6f.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/q03BAwgpKBOwmFl2Dqn6f.png)

### [](http://huggingface.co/blog/allenai/molmomotion#limitations-and-whats-next) Limitations and what's next

MolmoMotion is a capable model, but there are still some limitations to note. It uses eight query points per object during training—enough to forecast a useful trajectory but not enough to densely represent surface geometry. This limits the model's handling of complex deformable motion.

We think forecasting – anticipating how objects in the world will move _before_ they move – is as fundamental to machine intelligence as perceiving what's already there. MolmoMotion is a step toward this—3D motion prediction that generalizes across object categories without per-category templates, learned from ordinary video, and the most accurate 3D motion forecaster we've measured on PointMotionBench. We expect many applications will follow in robotics, video, and beyond.

We encourage you to try MolmoMotion by [downloading the weights](https://huggingface.co/collections/allenai/molmomotion), [inspecting the training data](https://huggingface.co/datasets/allenai/molmo-motion-1m), and [evaluating our methods against PointMotionBench](https://huggingface.co/datasets/allenai/PointMotionBench).

