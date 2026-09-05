---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/how-outpost-vfx-uses-aws-to-accelerate-ai-model-training-for-visual-effects
ingested: 2026-07-01
sha256: 6b6abca1a5e9f57034757ee258963273794294f1e5091f6680064e5d9c1312c6
feed_name: AWS China ML
source_published: 2026-06-30
---

# How Outpost VFX Uses AWS to Accelerate AI Model Training for Visual Effects

_This post was co-written with Tim Chauncey and Dheeraj Bhadani of Outpost VFX._

AI model training for visual effects (VFX) can take weeks, creating bottlenecks in production timelines. For Outpost VFX, which operates studios across the UK, Canada, and India delivering high-end film and episodic content, every day of delay impacts client deliverables and project schedules.

In this post, we explore how Outpost VFX achieved 8x faster training speeds using AWS infrastructure to transform their face replacement workflow, the technical architecture they implemented to overcome single-GPU limitations, and the measurable results achieved through AWS multi-GPU training.

## The challenge: Single-GPU bottlenecks in AI training

Traditional face replacement workflows in visual effects production require over 5 days of compositing or specialist beauty and de-aging support to create initial versions for director approval. While effective, these methods create bottlenecks early in the iterative approval process, the phase that is most critical to production timelines. For VFX professionals, slow AI training translates directly to missed deadlines, increased costs, and delayed client feedback cycles.

Outpost VFX had developed an AI model capable of training on on-set footage to accelerate face replacement processes. However, efficiency was constrained by single-GPU compute limitations. The existing face swap tool could only utilize one GPU at a time, limiting video random access memory (VRAM) access and processing capacity for model training operations. This prevented the team from realizing the full potential of their AI-assisted approach.

## Design considerations

Outpost VFX identified three critical technical requirements for optimizing their AI workflow:

  * **Compute scalability** – The team needed to parallelize face replacement model training across multiple GPUs to achieve meaningful efficiency improvements. Single-GPU training was creating week-long delays in model iteration cycles.
  * **Infrastructure security** – As an AWS customer since 2022 with a fully virtualized technology stack, Outpost VFX needed the solution to adhere to its exacting security requirements for processing highly sensitive production data.
  * **Performance optimization** – Beyond raw speed improvements, the architecture needed to support larger datasets and higher-resolution images to improve output quality.



To address these requirements, Outpost VFX collaborated with AWS Generative AI Innovation Center developers who worked as an extension of their technology department to modernize their AI learning algorithms. The AWS Generative AI Innovation Center is a team of strategists, data scientists, engineers, and solutions architects that works step-by-step with customers to build bespoke solutions that harness the power of generative AI. Learn more about how to engage with the team on the [Generative AI Innovation Center](<https://aws.amazon.com/ai/generative-ai/innovation-center/>) webpage.

## Architecture implementation

The solution involved adapting the Outpost VFX existing face swap model codebase to support distributed GPU training across multiple GPUs. The implementation used AWS multi-GPU Amazon Elastic Compute Cloud (Amazon EC2) P5 instances within a segregated, secure cloud environment that aligned with the Outpost VFX existing infrastructure requirements.

Originally, Outpost VFX trained their face swap models on GPU-accelerated workstations. This involved collecting small datasets of actors and their stunt doubles and fine-tuning a base model on RTX 3090 GPUs. While this method worked, the Outpost team found that training time was slow, at around 1–2 weeks per fine-tune. Scaling up would have been difficult because of the management overhead of those cloud workstations. At this point, they looked at training on P5 instances.

P5 instances feature NVIDIA H100 GPUs, which are purpose-built for distributed training workloads. Unlike G-series instances that use PCIe communication between GPUs, P5 instances provide NV Link interconnects offering significantly higher bandwidth for gradient synchronization, which is a critical factor when training across multiple GPUs. The H100’s 14,592 CUDA cores and 80GB of high-bandwidth HBM3 memory also represented a substantial upgrade over their local RTX 3090 setup.

Outpost VFX worked with the Generative AI Innovation Center to help them get their model running on the P5 instances. Over a 6-week advisory period, AWS scientists converted the model code to use PyTorch Distributed Data Parallel (DDP) training strategy. DDP is a parallelization technique that copies model weights to each GPU, allowing the system to process more images in each training batch. This approach increases the number of images that can be fitted into each batch, directly accelerating the training process.

The technical implementation included multi-GPU parallelization of face replacement model training, enhanced security architecture for sensitive production data, and integration with Outpost VFX existing AWS-based technology stack. As Outpost VFX continues to evolve their AI pipeline, the team sees potential in services like Amazon SageMaker AI with managed training, model versioning and hosted inference to further streamline how they develop and deploy models across their global studios.

## Measuring performance improvements

To test the speed improvement of the multi-GPU training, Outpost VFX collected an image dataset for training, fixed model hyperparameters, and measured the time for the training to reach a specific loss threshold. They set the baseline as one GPU on a G5 instance compared to running the models on the P5 instances.

The combined development effort between Outpost VFX and AWS achieved up to 8x improvement in face replacement model learning speeds. This performance increase directly translated to faster iteration cycles, enabling more rapid director approval processes for early versions. The ability to train models on higher-resolution images and larger datasets improved output quality. Most significantly, v001 delivery to clients for initial review now takes 2 days, compared to the previous 1–2 week timeline.

> _“We are now able to iterate much faster thanks to our parallelized workflow and the ability to harness multiple top-end GPUs at once,”_ explains Tim Chauncey, CTO of Outpost VFX._“Speed of iteration is critical to VFX work, and this architecture provides more robust and scalable capabilities for future development.”_

A future improvement could include increasing the quality of image outputs. Outpost could increase the image resolutions passed to the model and use newer generations of Amazon EC2 P5 instances with more VRAM to process these larger images and larger datasets.

## Conclusion

The AWS-optimized architecture enables Outpost VFX to offer enhanced AI-assisted face replacement capabilities to clients while maintaining the security and scalability requirements of high-end visual effects production. The parallelized workflow architecture including a migration from local consumer NVIDIA GPUs to enterprise NVIDIA GPUs provides a foundation for future AI tool development and scaling across Outpost VFX global studio operations.

> _“What excites me most is that these models are no longer research experiments; they are becoming an integral part of the modern VFX pipeline,”_ says Dheeraj Bhadani, Lead Software Architect at Outpost VFX._“Multi-GPU acceleration is the foundation on which next-generation creative tools will be built.”_

## Next steps

If you’re looking to accelerate your own AI training workflows, consider these steps:

  * Evaluate your current GPU utilization: Identify whether single-GPU constraints are limiting your training performance
  * Explore multi-GPU architectures: Amazon EC2 P5 instances provide scalable compute for distributed training workloads
  * Engage with AWS Generative AI Innovation Center: the same team that helped Outpost VFX parallelize their training workflow



You can achieve similar results by implementing distributed training strategies tailored to your specific use case and infrastructure requirements.

### Acknowledgments

The authors would like to thank the following contributors for their support on this project Josh Chappatte, Laksh Puri and Ruchi Bhatia.

* * *

## About the authors

### Alex Newton

Alex is a Data Scientist at the AWS Generative AI Innovation Center, helping customers solve complex problems with generative AI and machine learning. He enjoys applying state of the art ML solutions to solve real world challenges.

### Hanno Bever

Hanno is a Senior Machine Learning Engineer in the AWS Generative AI Innovation Center based in London. In his 6 years at Amazon, he has helped customers across all industries run machine learning workloads on AWS. He specializes in scaling distributed model training and optimizing inference on AWS Trainium and GPU instances.

### Stephen Smith

Stephen is a Senior Solutions Architect at AWS, based in the UK. He works with enterprise customers to design modern, scalable, cost-effective cloud architectures across a range of industries. With over 7 years at AWS, Stephen is passionate about helping customers adopt modern data and AI solutions to solve real business challenges.

### Tim Chauncey

Tim has been Chief Technology Officer at UK-headquartered Outpost VFX since 2022. His tenure has seen a revolution in how the studio delivers high-end film and episodic productions, including a successful migration from traditional on-prem solutions to a unified cloud infrastructure running globally on AWS. He is now leading a team integrating bleeding-edge ML production tools and agentic systems into Outpost’s production workflows.

### Dheeraj Bhadani

Dheeraj is a Lead Software Architect at Outpost VFX with more than two decades of experience in the VFX and animation industry. An innovative and seasoned architect, he has played key roles in technological advancements recognized by the Academy Sci-Tech Awards. Dheeraj is passionate about designing and building highly distributed, scalable, and resilient systems from inception through implementation. In recent years, he has focused on architecting and developing strategic, production-grade AI and machine learning tools, integrated into Digital Content Creation applications, and deployed as standalone solutions.
