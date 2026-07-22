---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/training-azerbaijani-language-models-on-amazon-sagemaker-ai
ingested: 2026-06-07
feed_name: AWS China ML
source_published: 2026-05-28
sha256: c1ff5ddaddd19c9276c3a1515bb3cbe85a2b67d373181af37217e5c8b826e4d2
---

# Training Azerbaijani language models on Amazon SageMaker AI

_This solution builds on open source tools including PyTorch, Hugging Face Transformers, and Liger Kernels. The authors would also like to thank Aiham Taleb, Arefeh Ghahvechi, Manav Choudhary, Rohit Thekkanal, Daz Akbarov, Jamila Jamilova, Ross Povelikin, Almas Moldakanov, Christelle Xu, and Ivan Khvostishkov for their contributions in making this project possible._

[Azercell Telecom LLC](<https://www.azercell.com/en/>), Azerbaijan’s leading telecommunications provider, wanted to build an Azerbaijani large language model (LLM) on [Amazon SageMaker AI](<https://aws.amazon.com/sagemaker/ai/>) for telecom use cases and a customer-facing chatbot. The challenge: adapting foundation models (FMs) to a morphologically rich language with limited training data and no existing blueprint for efficient LLM training in Azerbaijani. In a six-week collaboration, Azercell worked with the [AWS Generative AI Innovation Center](<https://aws.amazon.com/ai/generative-ai/innovation-center/>) to establish a production-ready framework on Amazon SageMaker AI that delivered a 23% higher training throughput and 58% lower peak GPU memory usage through kernel-level optimizations on an [ml.p5.48xlarge](<https://aws.amazon.com/ec2/instance-types/p5/>) instance. The framework also achieved a 2× improvement in tokens per word using a custom tokenizer, effectively doubling the amount of Azerbaijani text that fits within the model’s context window. If you work with low-resource or morphologically complex languages, this post walks through the approach so you can evaluate similar techniques.

## Solution overview

The framework implements three sequential stages, each producing artifacts that feed the next.

  * **Stage 1: Tokenizer development** builds an efficient tokenizer for Azerbaijani. We evaluated three approaches (baseline English-optimized tokenizers, vocabulary extension, and custom monolingual tokenizers) measuring encoding efficiency through standardized metrics. The custom monolingual tokenizer achieved the strongest results, halving the tokens per word compared to the baseline.
  * **Stage 2: Continued pre-training (CPT)** adapts an FM ([Llama 3.2 1B](<https://huggingface.co/meta-llama/Llama-3.2-1B>)) to understand Azerbaijani using distributed training and Liger Kernel optimizations on Amazon SageMaker AI training jobs. This allows for larger batch sizes and higher throughput on the same hardware. While distributed training wasn’t required for this 1B-scale proof-of-concept, it will be essential as Azercell scales to larger models.
  * **Stage 3: Supervised fine-tuning with Low-Rank Adaptation (LoRA)** transforms the pre-trained model into a conversational assistant. After CPT, the model can predict Azerbaijani tokens but can’t engage in dialogue. Stage 3 applies LoRA, a parameter-efficient fine-tuning method that significantly reduces trainable parameters.



The training stages (CPT and LoRA fine-tuning) were run as Amazon SageMaker AI training jobs launched from [Amazon SageMaker Unified Studio](<https://aws.amazon.com/sagemaker/unified-studio/>), each pointing to a custom training script. Each job provisions fresh [Amazon Elastic Compute Cloud (Amazon EC2)](<https://aws.amazon.com/ec2/>) instances and terminates after completion, so you pay only for actual compute time with no idle cluster cost.

The following diagram illustrates the modular architecture, where each stage can be optimized independently. Tokenizer improvements benefit every subsequent training stage, and CPT configurations transfer across fine-tuning tasks.

Figure 1. The training pipeline architecture. Operators launch training jobs from Amazon SageMaker AI Notebook Instances. Training data and model artifacts are stored in Amazon Simple Storage Service (Amazon S3). Training metrics are tracked with TensorBoard in Amazon SageMaker AI, and system metrics are captured through Amazon CloudWatch.

## Developing an Azerbaijani tokenizer

Languages like Azerbaijani are morphologically rich, with single words encoding grammatical meaning through suffixes that English would express using multiple words. However, standard English-optimized tokenizers fragment these complex word forms. For example, splitting “kitablardan” (meaning from the books) into multiple subword tokens as illustrated in Figure 2, which reduces the actual content that fits within a fixed-size context window.

Figure 2. Comparison of baseline and custom tokenization for Azerbaijani text, showing reduced token fragmentation.

To address this, we trained a custom tokenizer on Azerbaijani text using a Byte-Level Byte-Pair Encoding (BBPE) algorithm, which iteratively merges the most frequent byte pairs into vocabulary entries. Starting from raw bytes rather than predefined character sets provides full coverage of Azerbaijani-specific characters without requiring manual alphabet definitions. We experimented with vocabulary sizes ranging from 50k–100k tokens to find the right balance: too small and the tokenizer over-fragments words, too large and rare tokens lack sufficient training signal.

We trained custom tokenizers using the [Hugging Face tokenizers](<https://huggingface.co/docs/tokenizers/index>) library with the same configuration as the native Llama 3.2 tokenizer, varying only vocabulary size. After training and evaluating multiple tokenizers with different vocabulary sizes, we selected a final vocabulary of 100k tokens. To verify that the custom tokenizer didn’t sacrifice modeling quality, we compared models after continued pre-training using Bits-Per-Byte (BPB) rather than perplexity, because BPB normalizes for vocabulary differences by measuring prediction quality at the byte level. The model using the custom tokenizer achieved a BPB of 0.5795 on the validation set, compared to the baseline’s 0.6830, confirming that improved encoding efficiency came without a quality trade-off.

Beyond preserving modeling quality, the custom tokenizer delivers substantial practical efficiency gains. Encoding efficiency can be quantified through fertility score—the average number of tokens per word, where lower values indicate more efficient encoding. The baseline Llama 3.2 tokenizer averaged 3.22 tokens per Azerbaijani word, while the custom monolingual tokenizer achieved 1.59—a 2× improvement in encoding efficiency. With Llama 3.2’s 128k-token context window, this translates to real capacity differences: approximately 40k words with the baseline tokenizer versus 80k with the optimized one—effectively doubling the content the model considers at once.

## Continued pre-training

Continued pre-training adapts the FM (Llama 3.2 1B) to understand Azerbaijani. The primary bottleneck for this stage is GPU memory: optimizing memory utilization directly determines how much of the hardware investment translates into training throughput. We benchmarked on both [ml.p4d.24xlarge](<https://aws.amazon.com/ec2/instance-types/p4/>) (8× NVIDIA A100 GPUs) and [ml.p5.48xlarge](<https://aws.amazon.com/ec2/instance-types/p5/>) (8× NVIDIA H100 GPUs) instances. The following sections describe the two optimization approaches benchmarked: distributed training with [PyTorch’s Fully Sharded Data Parallel (FSDP)](<https://pytorch.org/tutorials/intermediate/FSDP_tutorial.html>) and Liger Kernel integration.

### Distributed training with Fully Sharded Data Parallel (FSDP)

A model’s memory footprint includes not just weights, but also gradients, optimizer states, and activations. These components can exceed 100 GB for larger models like Llama 3.1 8B in mixed precision. We developed and validated the distributed training setup on the 1B model so that scaling to larger architectures requires only a configuration change, not a re-architecture of the pipeline. Standard Distributed Data Parallel (DDP) replicates the full model on each GPU, which limits the batch size and model scale you can achieve. FSDP shards parameters, gradients, and optimizer states across GPUs, dynamically gathering only what is needed during each computation step. This reduced per-GPU model state memory from 9.23 GB to 1.17 GB on ml.p4d.24xlarge, freeing headroom for larger batch sizes.

### Liger Kernel integration

[Liger Kernels](<https://github.com/linkedin/Liger-Kernel>) are memory-efficient, [Triton](<https://triton-lang.org/>)-based implementations of common LLM operations that fuse multiple operations into single GPU kernel launches, reducing intermediate memory allocations while producing numerically equivalent results. They support several popular model architectures including Llama. We recommend that you verify compatibility with your architecture before adoption.

Integration requires minimal code changes: a single function call patches the model with optimized kernels before instantiation, and Liger Kernels work with PyTorch FSDP without modifications to the distributed training setup. We validated correct execution with [PyTorch Profiler](<https://docs.pytorch.org/tutorials/recipes/recipes/profiler_recipe.html>), confirming fused operations in the trace. The following table summarizes the cumulative impact of each optimization step across both instance types. Note that DDP memory and throughput on p5 instances weren’t benchmarked because FSDP was the target configuration.

**Metric** | **DDP** | **FSDP** | **FSDP + Liger**  
---|---|---|---  
Max batch size per GPU on ml.p4d.24xlarge (8× NVIDIA A100 GPUs) | 2 | 4 | 14  
Max batch size per GPU on ml.p5.48xlarge (8× NVIDIA H100 GPUs) | 4 | 10 | 18  
Peak GPU memory incl. activations (GB) on ml.p5.48xlarge | — | 64 | 27  
Training throughput per GPU (tokens/s) on ml.p5.48xlarge | — | 63,771 | 78,319  
  
On ml.p4d.24xlarge, the full optimization stack delivered a 7× increase in maximum batch size over DDP. On ml.p5.48xlarge, peak GPU memory dropped 58% and per-GPU throughput increased 23% when adding Liger Kernels to FSDP.

### Pre-training setup

Each tokenizer configuration from Stage 1 was carried through CPT end-to-end to compare convergence behavior and downstream quality. With the custom Azerbaijani tokenizer (100k vocabulary), the training corpus amounts to approximately 2.5B tokens.

The custom training script supports configurable context windows, BFloat16 mixed precision, cosine learning rate scheduling with [AdamW](<https://docs.pytorch.org/docs/stable/generated/torch.optim.AdamW.html#torch.optim.AdamW>), and automatic checkpointing to Amazon S3 for fault tolerance. We set the context window to 2,048 tokens because over 90% of training samples fell below this length after tokenization, though the configuration supports up to the model’s native 128k-token limit.

When new tokens are added to the vocabulary, CPT follows a two-phase approach. In the first phase, the model backbone is frozen and only the embedding layer is trained. This adapts the new token representations to the model’s existing internal space without disrupting pre-trained knowledge. In the second phase, the parameters are unfrozen for full training, allowing the model to deeply learn Azerbaijani language patterns. The following table shows the training configuration using the Azerbaijani custom tokenizer (100k vocabulary). Training used two ml.p4d.24xlarge instances (16 NVIDIA A100 GPUs total) with FSDP and Liger Kernel optimizations.

**Parameter** | **Phase 1: Embedding Adaptation** | **Phase 2: Full Training**  
---|---|---  
Frozen backbone | Yes | No  
Learning rate | 0.0032 | 0.0024  
Batch size per GPU | 14 | 14  
Steps | 5,000 | 15,000  
Training time | ~11,400 seconds (~3.2 hours) | ~43,000 seconds (~11.9 hours)  
  
A lower learning rate in the full-training phase preserves the knowledge acquired during embedding adaptation. With an effective batch size of 224 (14 per GPU × 16 GPUs) and a 2,048-token context window, each training step processes approximately 450k tokens, yielding an estimated per-epoch time of approximately 4.3 hours on this configuration. On ml.p5.48xlarge, higher per-GPU throughput and larger batch sizes would reduce per-epoch time further.

## Supervised fine-tuning with LoRA

After CPT, the model can fluently predict the next Azerbaijani token, but it has no concept of conversational structure. Given a question, it generates plausible continuations rather than helpful answers. LoRA bridges this gap efficiently by freezing the pre-trained weights and training small low-rank decomposition matrices injected into the model’s attention and feed-forward layers. Instead of updating a full weight matrix, LoRA trains two smaller matrices whose product approximates the full update—reducing trainable parameters to a small fraction of the total. The following table summarizes the LoRA fine-tuning configuration.

**Parameter** | **Rank** | **Alpha** | **Dropout** | **Target modules** | **Max sequence length**  
---|---|---|---|---|---  
**Value** | 64 | 28 | 0.05 | q, k, v, o projections; gate, up, down projections | 1,024  
  
This compact footprint meant fine-tuning ran on a single [ml.g5.8xlarge](<https://aws.amazon.com/ec2/instance-types/g5/>) instance (1× NVIDIA A10G GPU), completing in minutes. Fine-tuning used approximately 2,000 single-turn Azerbaijani question-answer pairs using Hugging Face’s [SFTTrainer](<https://huggingface.co/docs/trl/sft_trainer>) with a learning rate of 1e-4—higher than CPT’s learning rates because LoRA adapters are randomly initialized and benefit from stronger gradient updates.

Training used a Llama-style chat template with assistant-only loss masking: the model is penalized only for predicting the assistant’s response tokens and the end-of-turn token (<|eot_id|>), while user prompts and template delimiters are excluded from the loss. As a result, the model focuses its learning capacity on generating appropriate responses rather than memorizing user input patterns.

## Results and validation

Continued pre-training used approximately 2.5B tokens with the custom Azerbaijani tokenizer, and fine-tuning used 2,000 question-answer pairs. The framework delivered measurable improvements across four dimensions:

  * **2× encoding efficiency through custom tokenization** The custom monolingual tokenizer halved the fertility score (from 3.22 to 1.59 tokens per word), effectively doubling the Azerbaijani content that fits within the model’s 128k-token context window. A BPB score of 0.5795 versus the baseline’s 0.6830 confirmed this gain didn’t sacrifice modeling quality.
  * **Significant memory and throughput optimization Fully Sharded Data Parallel (FSDP)** sharding and Liger Kernel integration allowed larger batch sizes on the same hardware, up to 7× on ml.p4d.24xlarge and 4.5× on ml.p5.48xlarge over their respective DDP baselines—while reducing peak GPU memory by 58% and increasing per-GPU throughput by 23%.
  * **Production-ready, scalable infrastructure** Validated configurations across ml.p4d.24xlarge and ml.p5.48xlarge instances give Azercell a flexible foundation that scales as training requirements grow, with the distributed setup designed so that moving to larger models requires only a configuration change.
  * **Coherent Azerbaijani language generation** The off-the-shelf Llama 3.2 1B drifts into repetitive, incoherent output when prompted in Azerbaijani, a common failure mode for underrepresented languages. The fine-tuned model produces concise, semantically coherent responses that demonstrate clear Azerbaijani language understanding. This is illustrated in the following table for a sample prompt provided by Azercell.

**Prompt** | **Azerbaijani output** | **English translation**  
---|---|---  
**Input prompt** | Yeni bir dil öyrənmək yalnız ünsiyyət imkanlarını genişləndirmir.**..** | Learning a new language not only expands communication opportunities…  
**Llama 3.2 1B** |  **Yeni bir dil öyrənmək yalnız ünsiyyət imkanlarını genişləndirmir**. Bu, əksinə, dili öyrənən insanlara yeni bir dil öyrənmək üçün fərqli məqsədlərlə yanaşı, onların özü də yeni bir dil öyrənməyə başlayır. Dil öyrənməsi, həmçinin, yeni bir dil öyrənməyə olan istiqamətlərin və təcrübələrinin genişləndirilməsinə səbəb olur. Yeni bir dil öyrənməyə olan istiqamətləri və təcrübələrinin genişləndirilməsindən sonra, yeni bir dil öyrənməyə olan istiqamətlərin və təcrübələrinin genişləndirilməsi… | **Learning a new language not only expands communication opportunities**. On the contrary, it also leads people who learn a language to approach language learning with different goals, and they themselves begin the process of learning a new language. Language learning also contributes to the expansion of directions and experiences related to learning a new language. After expanding these directions and experiences, the development of approaches and experiences in learning a new language continues…  
**Fine-tuned Llama 3.2 1B** | **Yeni bir dil öyrənmək yalnız ünsiyyət imkanlarını genişləndirmir** , həm də yeni dostlar və əlaqələr yaradır. | **Learning a new language not only expands communication opportunities** but also creates new friendships and connections.  
  
## Conclusion

In this post, we showed how Azercell and the AWS Generative AI Innovation Center built a framework for training Azerbaijani language models on Amazon SageMaker AI. The three-stage pipeline (custom tokenization, continued pre-training with FSDP and Liger Kernel optimizations, and LoRA fine-tuning) transforms a general-purpose foundation model into an Azerbaijani conversational assistant while maximizing GPU utilization. Azercell now operates the framework independently, with a methodology that supports larger corpora, scaled architectures, and expanded use cases. To learn more, explore the following resources:

  * [Amazon SageMaker AI](<https://aws.amazon.com/sagemaker/ai/>) – managed machine learning service for training and deployment
  * [AWS Generative AI Innovation Center](<https://aws.amazon.com/ai/generative-ai/innovation-center/>) – collaborative AI development programs
  * [Distributed training in Amazon SageMaker AI](<https://docs.aws.amazon.com/sagemaker/latest/dg/distributed-training.html>) – distributed training concepts
  * [PyTorch FSDP tutorial](<https://pytorch.org/tutorials/intermediate/FSDP_tutorial.html>) – implementation guide
  * [Liger Kernels](<https://github.com/linkedin/Liger-Kernel>) – memory-efficient kernel implementations
  * [Hugging Face Tokenizers](<https://huggingface.co/docs/tokenizers>) – tokenizer training library
  * [Llama 3.2 1B](<https://huggingface.co/meta-llama/Llama-3.2-1B>) – base model



To explore implementing a similar solution, reach out to your AWS account team or visit the [AWS Generative AI Innovation Center](<https://aws.amazon.com/ai/generative-ai/innovation-center/>). If you’re training LLMs for low-resource languages or optimizing GPU utilization on SageMaker AI, we’d love to hear from you. Share your thoughts and questions in the comments.

* * *

## About the authors

**Aleksei Iancheruk** is a Data Scientist at the AWS Generative AI Innovation Center (GenAIIC). He specializes in search and retrieval systems, recommender systems, and AI agents. With experience spanning both large enterprises and startups/scaleups, he has designed and shipped production AI systems across diverse technical environments.

**Debby Wehner** is a Machine Learning Engineer at the AWS GenAIIC, specializing in large language model customization and optimization. Previously at Amazon, she built AI-powered shopping applications as a full-stack software engineer. She holds a PhD in Computational Geophysics from the University of Cambridge, as well as a BSc and MSc from Freie Universität Berlin.

**Hanno Bever**  is a Senior Machine Learning Engineer in the AWS GenAIIC. In his six years at Amazon, he has helped customers across various industries run machine learning workloads on AWS. He specializes in scaling distributed model training and optimizing inference on AWS Trainium and GPU instances.

**Sabir Mardanov** leads Azercell’s Data & AI organization, shaping the AI strategy behind the company’s transformation from a traditional telco to a tech-centric leader. His work has delivered measurable impact across efficiency, revenue, and productivity. He oversees the development of scalable AI capabilities while embedding strong governance and a data-driven culture across the enterprise.

**Irada Bunyatova** is a Senior Data Scientist at Azercell, specializing in speech technologies, large language models and agentic AI systems. She designs and deploys production-grade AI solutions across diverse business applications. She holds an MSc&T in Artificial Intelligence and Advanced Visual Computing from École Polytechnique.
