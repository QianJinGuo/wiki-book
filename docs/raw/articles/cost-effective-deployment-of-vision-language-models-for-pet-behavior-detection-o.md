---
title: "Cost effective deployment of vision-language models for pet behavior detection on AWS Inferentia2"
url: https://aws.amazon.com/blogs/machine-learning/cost-effective-deployment-of-vision-language-models-for-pet-behavior-detection-on-aws-inferentia2/
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/cost-effective-deployment-of-vision-language-models-for-pet-behavior-detection-on-aws-inferentia2/
tags: [aws-china-blog, agentic-ai, context-engineering]
sha256: 9e2471d77659a88e
ingested: 2026-05-11
---
<p><a href="https://furbo.com/us" target="_blank" rel="noopener">Tomofun</a>, the Taiwan-headquartered pet-tech startup behind the Furbo Pet Camera, is redefining how pet owners interact with their pets remotely. Furbo combines smart cameras with AI to detect behaviors such as barking, running, or unusual activity, and alerts owners in real time. At the core of this capability are computer vision and vision-language models that interpret pet actions from the video streams.</p> 
<p>Originally, Furbo’s inference workloads were hosted on GPU-based Amazon Elastic Compute Cloud (Amazon EC2) instances. While GPUs provided high throughput, they were also costly because the always-on inference needed to support real-time pet activity alerts at scale. To reduce costs and maintain accuracy, Tomofun turned to <a href="https://aws.amazon.com/ec2/instance-types/inf2/" target="_blank" rel="noopener">EC2 Inf2 instances</a> powered by&nbsp;AWS Inferentia2, the Amazon purpose-built AI chips. In this post, we walk through the following sections in detail.</p> 
<h2>Challenge: Reducing GPU inference cost for real-time vision-language models at scale</h2> 
<p>Running advanced vision-language models like <a href="https://huggingface.co/Salesforce/blip-vqa-base" target="_blank" rel="noopener">Bootstrapping Language-image Pre-Training (BLIP)</a>, detailed in the original <a href="https://arxiv.org/pdf/2201.12086" target="_blank" rel="noopener">paper</a>, were hosted on GPU instances and proved less cost-effective for always-on, real-time inference workloads at scale. The challenge was twofold: Tomofun needed to sustain cost efficiency for nearly continuous pet behavior monitoring across hundreds of thousands of devices, while also maintaining model fidelity and throughput. Tomofun needed to do this without rewriting large portions of the BLIP code base already optimized for PyTorch.</p> 
<h2>Solution overview</h2> 
<p>Before diving into the architecture, the following diagram provides a high-level view of how the system processes pet behavior detection at scale across AWS services.</p> 
<p><img loading="lazy" class="alignnone size-large wp-image-129263" src="https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/21/Tomofun-Archtecture-1-1024x949.png" alt="Tomofun Archtecture" width="1024" height="949"></p> 
<ol> 
 <li><strong>Webcam interaction</strong> – Furbo’s API sits at the center of Tomofun’s pet-behavior detection service, orchestrating image streams from customer’s pet cameras to inference endpoints in AWS. The diagram shows the architecture of Elastic Load Balancing (ELB) and Amazon EC2 Auto Scaling group implemented using EC2 Inf2 instances providing scaling as the inference volume grows in real-time. When a camera captures a frame, the data is routed through Amazon CloudFront and an ELB to the first layer of the EC2 Auto Scaling group that hosts the&nbsp;pet-behavior detection API servers.&nbsp;After the API layer processes each request, it forwards the image to a second-layer Auto Scaling group dedicated to running model inference.</li> 
 <li><strong>Model inference</strong> – After processing, the images are forwarded to a second layer&nbsp;EC2 Auto Scaling group containing inference instances. Inside this group, containers host the BLIP model, which can run on Inferentia2-based EC2 Inf2 instances.&nbsp;The BLIP model components compiled using the&nbsp;<a href="https://aws.amazon.com/ai/machine-learning/neuron/" target="_blank" rel="noopener">Neuron SDK</a> are loaded into containers on Inf2 instances. In the early implementation, Furbo’s API routed inference calls exclusively to GPU containers, but now it can also direct requests to Inf2-based containers without changing the upstream API or downstream alert logic. This architecture allows Tomofun to direct inference requests to and switch between GPU and Inferentia2 backends in real-time. This maintains high availability and gives them the flexibility to scale cost-efficient inference while preserving the same API surface for Furbo users.</li> 
 <li><strong>Metrics collection</strong> – Amazon CloudWatch monitors key operational metrics across the inference fleet, including latency, throughput, and error rates. These signals provide the observability needed to detect performance degradation early and ensure that service-level objectives are met as traffic patterns shift throughout the day.</li> 
 <li><strong>Scaling with Demand</strong> – The ELB dispatches requests to the available instances within the Auto Scaling group, which manages the size of the instance pool size based on the incoming request count as the CloudWatch metric. This metric-driven approach is adopted because the throughput benchmarks for each instance type have already been established through stress testing, so scaling decisions can be driven directly by the volume of image requests. The result is an architecture that scales cost-efficient inference capacity in real time, maintaining high availability as demand grows.</li> 
</ol> 
<h3>Improving BLIP on Inferentia2</h3> 
<p>Before diving into the model details, the following diagram provides a high-level overview of the BLIP architecture and how its core components interact.</p> 
<p><img loading="lazy" class="alignnone size-large wp-image-129261" src="https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/21/Architecture2-1024x435.png" alt="Model Architecture" width="1024" height="435"></p> 
<p>Source: BLIP: Bootstrapping Language-Image Pre-training for Unified Vision-Language Understanding and Generation, 2022&nbsp;<a href="https://arxiv.org/pdf/2201.12086" target="_blank" rel="noopener">https://arxiv.org/pdf/2201.12086</a></p> 
<p>BLIP is composed of three components—the Image Encoder, Text Encoder, and Text Decoder, as shown in the image. For support on Inferentia2, models can be broken into components and wrapped to fit input and output shapes. Tomofun applied this method to BLIP, creating lightweight wrappers for each of the three components of the BLIP model so the original architecture remained unchanged. Each component was compiled independently with <code>torch_neuronx</code> and then combined into the inference pipeline, allowing inputs to flow sequentially. This modular approach maintained compatibility with Inferentia2 without altering BLIP’s pretrained logic.</p> 
<h3>Original model code</h3> 
<p>The first step is to isolate the original BLIP <code>Text Encoder</code> so it can be compiled without modifying its internal logic. The TextEncoder class is a thin wrapper around the original submodule (<code>model.text_encoder.model</code>) that standardizes the forward output by returning only the primary tensor. This makes the component straightforward to trace and compile with Neuron while preserving the original architecture.</p> 
<div class="hide-language"> 
 <pre><code class="lang-code">class TextEncoder(torch.nn.Module):
&nbsp;&nbsp; &nbsp;def __init__(self, model):
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;super().__init__()
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;self.model = model
&nbsp;&nbsp; &nbsp;def forward(self, input_ids, attention_mask, encoder_hidden_states, encoder_attention_mask):
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;output = self.model(
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;input_ids=input_ids,
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;attention_mask=attention_mask,
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;encoder_hidden_states=encoder_hidden_states,
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;encoder_attention_mask=encoder_attention_mask,
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;return_dict=False,
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;)
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;return output[0]</code></pre> 
</div> 
<p>During the <strong>compilation phase</strong>, the original model (<code>model.text_encoder.model</code>) is passed directly into <code>torch_neuronx.trace()</code> and compiled into a Neuron-optimized TorchScript artifact, without modifying the pretrained BLIP logic.</p> 
<h3>Wrapper code</h3> 
<p>A wrapper is needed because the <code>torch_neuronx.trace()</code> API expects a tensor tuple of tensors as input and output. To avoid rewriting the model, lightweight wrappers act as an adapter layer that reformats inputs and outputs while keeping the original architecture unchanged. This approach minimizes code changes and allows the compiled components to integrate seamlessly into the existing inference pipeline.</p> 
<div class="hide-language"> 
 <pre><code class="lang-code">class TextEncoderWrapper(torch.nn.Module):
&nbsp;&nbsp; &nbsp;def __init__(self, model):
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;super().__init__()
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;self.model = TextEncoder(model)
&nbsp;&nbsp; &nbsp;@classmethod
&nbsp;&nbsp; &nbsp;def from_model(cls, model):
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;wrapper = cls(model)
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;wrapper.model = model
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;return wrapper
&nbsp;&nbsp; &nbsp;def forward(self, input_ids, attention_mask, encoder_hidden_states, encoder_attention_mask, return_dict):
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;output = self.model(input_ids, attention_mask, encoder_hidden_states, encoder_attention_mask)
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;return (output,)</code></pre> 
</div> 
<p>The wrapper is used only at deployment to load the compiled model and format I/O, so it fits the existing BLIP pipeline.</p> 
<ul> 
 <li><strong>Compile</strong>: use the original model (<code>model.text_encoder.model</code>)</li> 
 <li><strong>Deploy</strong>: use <code>TextEncoderWrapper</code> to run the compiled model</li> 
</ul> 
<p>This keeps the original code unchanged while making the compiled model easy to plug into production.</p> 
<h3>Model compilation for Inferentia2</h3> 
<p>In the following code snippet, <code>model.text_encoder.model</code> represents the unmodified Text Encoder submodule, which is compiled into a Neuron-optimized TorchScript format.</p> 
<div class="hide-language"> 
 <pre><code class="lang-code">def trace_model(model, directory, compiler_args=f"--auto-cast-type fp16 --logfile {LOG_DIR}/log-neuron-cc.txt"):
&nbsp;&nbsp; &nbsp;if os.path.isfile(directory):
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;print(f"Provided path ({directory}) should be a directory, not a file")
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;return
&nbsp;&nbsp; &nbsp;os.makedirs(directory, exist_ok=True)
&nbsp;&nbsp; &nbsp;os.makedirs(LOG_DIR, exist_ok=True)
&nbsp; &nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;# Skip trace if the model is already traced
&nbsp; &nbsp;&nbsp;if not os.path.isfile(os.path.join(directory, 'text_encoder.pt')):
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;print("Tracing text_encoder")
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Step 1: Provide pseudo input data with expected shapes and dtypes
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;inputs = (
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;torch.ones((1, 8), dtype=torch.int64),
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;torch.ones((1, 8), dtype=torch.int64),
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;torch.ones((1, 577, 768), dtype=torch.float32),
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;torch.ones((1, 577), dtype=torch.int64),
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;)
&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Step 2: Use torch_neuronx.trace() to compile the model for Inferentia
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;encoder = torch_neuronx.trace(model.text_encoder.model,
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; inputs,
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; compiler_args=compiler_args)
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Step 3: Save the compiled model as TorchScript artifact
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;torch.jit.save(encoder, os.path.join(directory, 'text_encoder.pt'))
&nbsp;&nbsp; &nbsp;else:
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;print('Skipping text_encoder.pt')</code></pre> 
</div> 
<p>To compile BLIP components for Inferentia2, Tomofun defined a trace function that automates the conversion of GPU-trained PyTorch models into Inferentia-optimized artifacts. The process begins by preparing pseudo input tensors that represent the expected shapes and data types of the model’s inputs, which guides the tracing process. After the inputs are defined, the function calls <code>torch_neuronx.trace()</code> to compile the BLIP sub-model for Inferentia execution, producing a Neuron-optimized version of the original code. Finally, the compiled artifact is saved with <code>torch.jit.save</code>, making it ready for deployment on Inf2 instances. This three-step flow—loading the wrapper, providing pseudo input data, and compiling with Neuron—makes sure that Tomofun can migrate BLIP’s TextDecoder and other components without changing the original model code.</p> 
<h3>Model&nbsp;deployment&nbsp;on Inferentia2</h3> 
<p>In the deployment phase, the compiled submodules are loaded through wrapper classes to assemble the final BLIP inference pipeline. This separation creates a clear workflow where the original model components are used directly for Neuron improvement during compilation, while the wrapper classes handle input and output formatting during inference to ensure compatibility with Inferentia2. The deployment phase code is as following:</p> 
<p><code>models.text_encoder = TextEncoderWrapper.from_model(</code><br> <code>&nbsp; &nbsp; torch.jit.load(os.path.join(directory, 'text_encoder.pt')))</code></p> 
<p>This design preserved the original BLIP architecture without modification while meeting the Neuron SDK’s I/O interface requirements through lightweight wrapper classes. It also enabled a modular, component-level workflow for both compilation and deployment, allowing each BLIP submodule to be compiled and managed independently. As a result, the use of <code>model.text_encoder.model</code> is essential during the compilation phase for direct Neuron optimization, whereas the wrapper classes handle input and output formatting during inference to ensure smooth execution on Inferentia2.</p> 
<h3>Stress testing</h3> 
<p>To validate performance at scale, Tomofun conducted stress tests simulating real-world Furbo camera workloads. Each video stream triggered action detection queries such as “Is the dog barking?”, “Is the dog playing?”, or “Is the dog chewing furniture?”. These tests confirmed that Inf2 instances (one Inferentia2 chip, 32 GB memory) could sustain the required throughput while maintaining low latency. In addition to accuracy, the tests highlighted that the Inf2 deployment could handle simultaneous requests across hundreds of thousands of devices, making it well-suited for Furbo’s always-on global customer base. Importantly, the comparison baseline was running GPU-based instances with an on-demand pricing model, which reflected the cost Tomofun was paying before migration to Inf2. By migrating from those GPU on-demand deployments to Inf2.xlarge instances with Inferentia2, Tomofun achieved 83% cost reduction without compromising performance.</p> 
<p>The chart illustrates how inference latency changes as server and client concurrency increase. The X-axis represents combinations of&nbsp;the labels represent #server threads – #client threads to simulate performance under different load scenarios. When only a few server threads are available, adding more client threads causes latency to rise quickly. Increasing the number of server threads helps absorb this load and keeps latency lower.&nbsp;At higher concurrency levels, latency increases and gains level off, indicating saturation. This experiment shows that teams should use load testing to identify the right balance between client concurrency and server capacity, and then limit concurrency to that range to achieve the right latency–cost tradeoff in production.</p> 
<p><img loading="lazy" class="alignnone size-large wp-image-129260" src="https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/21/Benchmark-1024x684.png" alt="" width="1024" height="684"></p> 
<h2>Conclusion</h2> 
<p>By migrating BLIP inference on <a href="https://aws.amazon.com/ec2/instance-types/inf2/" target="_blank" rel="noopener">AWS Inferentia-based EC2 Inf2 instances</a>, Tomofun reduced their Furbo application deployment costs by 83%. The transition from GPU to Inferentia2 was seamless, as the migration required only lightweight wrapper classes and left BLIP’s core logic untouched. Testing confirmed that using Inferentia2 not only reduced the deployment costs, but also maintained high throughput for real-time inference at scale. Tomofun plans to migrate more workloads to Inferentia2 as it supports workloads beyond vision-language models, such as audio event detection for barking recognition and potential future integration with large language models to enhance pet-owner interactions. Additionally, the adoption of AWS Deep Learning Containers (DLCs) has been scheduled into the roadmap as a next step, using pre-built, improved container images to simplify dependency management and streamline inference workflows.</p> 
<p>To learn how to implement similar improvements, explore the AWS Neuron documentation and examples you can reference <a href="https://awsdocs-neuron.readthedocs-hosted.com/" target="_blank" rel="noopener">AWS Neuron Document</a>.&nbsp;You can also visit <a href="https://furbo.com/tw">Furbo website</a> to explore Furbo’s AI-powered features and see how the Furbo ecosystem keeps your pets safe.</p> 
<hr> 
<h3>About the authors</h3> 
<footer> 
 <div class="blog-author-box"> 
  <div class="blog-author-image">
   <img loading="lazy" class="wp-image-129265 alignleft" src="https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/21/1682954852320.jpg" alt="Chen-Hsin" width="245" height="245">
  </div> 
  <p><strong>Chen-Hsin Ding</strong> is a Staff Machine Learning Engineer at Tomofun, with over 10 years of software development experience. He leads Generative AI projects and works closely with backend teams to design practical AI system architectures, focusing on bringing MLOps best practices into the AI team and delivering production-ready LLM and RAG applications. Outside of work, Chen-Hsin enjoys brewing coffee and listening to movie soundtracks and jazz on his hi-fi audio system.</p> 
 </div> 
 <div class="blog-author-box"> 
  <div class="blog-author-image">
   <img loading="lazy" class="wp-image-129266 alignleft" src="https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/21/1718264470380.jpg" alt="Ray" width="245" height="245">
  </div> 
  <p><strong>Ray Wang</strong> is a Senior Solutions Architect at AWS. With 15 years of experience in the IT industry, Ray is dedicated to building modern solutions on the cloud, especially in NoSQL, big data, machine learning, and Generative AI. As a hungry go-getter, he passed all 12 AWS certificates to make his technical field not only deep but wide. He loves to read and watch sci-fi movies in his spare time.</p> 
 </div> 
 <div class="blog-author-box"> 
  <div class="blog-author-image">
   <img loading="lazy" class="wp-image-129264 alignleft" src="https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/21/1665845476654.jpg" alt="Howard" width="245" height="245">
  </div> 
  <p><strong>Howard Su </strong>is a Solutions Architect at AWS. With extensive experience in software development and system operations, he has served in various roles including RD, QA, and SRE. Howard has been responsible for the architectural design of numerous large-scale systems and has led several cloud migrations. Following years of deep technical accumulation, he is now dedicated to advocating for DevOps by leveraging Generative AI to build self-healing, “AI-Native” infrastructures, transitioning the SDLC from traditional orchestration to a truly intelligent, predictive ecosystem.</p> 
 </div> 
</footer>