---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/reduce-asr-inference-costs-by-75-with-nvidia-mps-on-amazon-ec2
ingested: 2026-08-29
feed_name: AWS China ML
source_published: 2026-08-27
sha256: ca8cc99f4a2033beb2c6bcc645326885b2ab9eca56821f963c5d931ac81d03b1
---

# Reduce ASR inference costs by 75% with NVIDIA MPS on Amazon EC2

_This post is a collaboration between AWS, NVIDIA and  [Heidi](<https://www.heidihealth.com/>)._

Reducing automatic speech recognition (ASR) inference costs on [Amazon Elastic Compute Cloud (Amazon EC2)](<https://aws.amazon.com/ec2/>) becomes critical when GPU utilization per request is low but latency requirements are strict. A single ASR inference request typically uses only 15–20 percent of a GPU’s compute capacity, yet the default time-slicing behavior in NVIDIA CUDA® forces sequential access, leaving 80 percent of the hardware idle. Heidi Health is an AI Care Partner that processes over 2.4 million clinical consultations per week across 190 countries. To sustain sub-second transcription latency at peak traffic, this inefficiency forces the company to run 16 GPU instances.

In [a previous post](<https://aws.amazon.com/blogs/machine-learning/fine-tuning-nvidia-nemotron-speech-asr-on-amazon-ec2-for-domain-adaptation/>), you learned how to fine-tune a Nemotron speech model, NVIDIA Parakeet TDT 0.6B V2 for clinical speech recognition. In this post, we focus on what comes after fine-tuning: serving that model efficiently. We demonstrate how NVIDIA CUDA Multi-Process Service (MPS), combined with NVIDIA Triton Inference Server on Amazon EC2 GPU instances, reduces GPU infrastructure requirements by 75 percent (from 16 instances to 4). This setup maintains sub-second latency at 92.1 requests per second (RPS) per GPU.

## Solution overview

This section covers the following:

  * The GPU utilization challenge.
  * The three available sharing mechanisms.
  * Model-level optimizations with ONNX and TensorRT.
  * Request scheduling with Triton.
  * How these components integrate on Amazon EC2.



### The GPU utilization problem

A single ASR inference request on the Parakeet TDT 0.6B V2 model uses roughly 15–20 percent of an NVIDIA L40S GPU’s 142 streaming multiprocessors (SMs). The remaining 80 percent sits idle during each forward pass. CUDA’s default time-slicing behavior compounds this waste by giving each process exclusive GPU access. Processes take turns, context switching adds overhead between them, and no concurrent execution occurs.

The result: a single GPU handles only approximately 62 RPS at acceptable latency (mean < 650 ms, p99 < 1,000 ms). This requires 16 GPUs in Heidi’s current production deployment to handle peak traffic with sufficient headroom for latency service-level agreements (SLAs).

To address this utilization gap, we evaluated three GPU sharing mechanisms available on NVIDIA hardware, each with different tradeoffs between isolation, concurrency, and operational complexity.

The following diagram compares default GPU time-slicing behavior with CUDA MPS concurrent execution, showing how MPS eliminates idle SM capacity.

  
Figure 1: GPU time-slicing versus CUDA MPS. Left: default time-slicing where each request uses only ~20% of SMs with ~80% idle and context-switch overhead, requiring 16 GPUs. Right: CUDA MPS partitions the GPU into 4 concurrent instances at 25% SM each, achieving 92.1 RPS with only 4 GPUs (75% reduction)

### Understanding GPU sharing: time-slicing, MIG, and MPS

NVIDIA GPUs offer three mechanisms for multi-tenant sharing, each with different tradeoffs:

**Mechanism** | **Isolation** | **Concurrent Execution** | **Best For**  
---|---|---|---  
Time-slicing (default) | Full context switch | No — sequential | Few large models  
MIG (Multi-Instance GPU) | Hard physical partition | Yes — fixed partitions | Multi-tenant isolation  
MPS (Multi-Process Service) | Shared context, soft SM limits | Yes — concurrent kernels | Many small models on one GPU  
  
**NVIDIA CUDA MPS** is a binary-compatible alternative implementation of the CUDA API. It allows multiple processes to share a GPU concurrently without code changes. Unlike time-slicing (where processes rotate access) or Multi-Instance GPU (MIG, which creates hard physical partitions with dedicated memory controllers), MPS funnels all CUDA work through a single GPU context managed by an MPS daemon process.

Key advantages for our workload:

  * Removes context-switching overhead: all processes share one set of GPU scheduling resources.
  * Supports concurrent kernel execution, where kernels from different processes run simultaneously on different SMs.
  * Configurable partition size through the CUDA_MPS_ACTIVE_THREAD_PERCENTAGE environment variable.
  * Works without code changes. Existing CUDA applications run unmodified.
  * Memory protection between clients through separate address spaces.



For this workload, deploy two separate MPS configurations on dedicated GPU instances. Transcription instances use 25 percent SM allocation with four concurrent processes (each using approximately 2.5 GB of the 48 GB VRAM). Diarization instances use 12 percent SM with eight concurrent processes (approximately 1.8 GB each).

Although MPS addresses GPU utilization, we can further reduce per-request compute time through model-level optimizations. The next layer in our optimization stack converts the model’s compute-heavy encoder to a hardware-optimized format.

### ONNX Runtime with TensorRT

ONNX Runtime is a high-performance inference engine that runs Open Neural Network Exchange (ONNX) models using hardware-specific Execution Providers. The TensorRT Execution Provider routes ONNX graph nodes to NVIDIA TensorRT, which applies kernel fusion, precision calibration (FP16/INT8), and memory optimization to produce a hardware-tuned engine.

For our workload, the pipeline uses a hybrid approach. The compute-heavy Conformer encoder (24 layers, 1024 hidden dimensions) runs through ONNX Runtime with TensorRT EP, benefiting from operator fusion and FP16 precision calibration. The RNN-T Token-and-Duration Transducer (TDT) decoder runs natively in PyTorch CUDA, where variable-length token generation with CUDA graph caching is more flexible than a static TensorRT engine.

### NVIDIA Triton Inference Server

NVIDIA Triton Inference Server handles request scheduling and batching for production inference. The pipeline uses two batching strategies:

  1. **Dynamic batching (transcription):** accumulates requests for a configurable delay (50 ms), then dispatches them as a batch. Preferred batch sizes [4, 8, 16] allow the scheduler to form optimal groups.
  2. **Sequence batching (diarization):** maintains per-recording streaming state server-side. Each client sends 15-second audio chunks with a correlation ID, and Triton routes them to the correct model instance. Sessions auto-expire after 600 seconds of inactivity (max_idle_timeout).



Each Triton model instance maps to one MPS partition, providing natural integration between the batching scheduler and the GPU partitioning layer.

These three technologies compose into a unified inference pipeline on Amazon EC2, described in the following section.

### Inference pipeline architecture

The inference pipeline runs on Amazon EC2 g6e.4xlarge and g7e.4xlarge instances (NVIDIA L40S, 48 GB) with three containerized components orchestrated with Docker Compose:

The following diagram shows the three-layer inference architecture deployed on a single Amazon EC2 GPU instance.

  
Figure 2: Solution architecture on Amazon EC2. The FastAPI gateway decodes audio and routes requests through gRPC to Triton Inference Server, which dispatches across MPS-partitioned model instances

The three layers are:

**FastAPI gateway:** OpenAI Whisper-compatible REST API that decodes uploaded audio into raw 16 kHz mono float32 tensors before forwarding to Triton through gRPC. Runs on 4 uvicorn workers on port 8002.

**NVIDIA Triton Inference Server:** Manages dynamic batching (preferred batch sizes [4, 8, 16], max_queue_delay_microseconds: 50000) for transcription, and sequence batching for streaming diarization. Dispatches requests across model instances.

**CUDA MPS daemon:** Starts inside the Triton container before the inference server. Partitions the GPU into concurrent execution contexts (four instances at 25 percent SM for transcription, or eight at 12 percent SM for diarization).

Supporting AWS services:

  * [Amazon Elastic Container Registry (Amazon ECR)](<https://aws.amazon.com/ecr/>): Stores the Triton and gateway container images (nvcr.io/nvidia/tritonserver:26.03-py3 base).
  * [Amazon Elastic Block Store (Amazon EBS)](<https://aws.amazon.com/ebs/>): Model checkpoints, TensorRT engine cache, and ONNX exports.
  * [Amazon CloudWatch](<https://aws.amazon.com/cloudwatch/>): Prometheus metrics ingestion, log aggregation, and p50/p90/p95/p99 latency dashboards.
  * [Amazon Simple Storage Service (Amazon S3)](<https://aws.amazon.com/s3/>): Model artifact archive and checkpoint storage.



## Prerequisites

The following prerequisites apply to the accompanying repository. With them in place, you can follow the deployment steps in the following sections.

  * An AWS account with access to Amazon EC2 g6e.4xlarge or g7e.4xlarge instances (NVIDIA L40S, 48 GB).
  * NVIDIA drivers 535+ with CUDA 12.x.
  * Docker with NVIDIA Container Toolkit.
  * NVIDIA Triton Inference Server container (nvcr.io/nvidia/tritonserver:26.03-py3).
  * NVIDIA NeMo Toolkit 2.7+ and a Parakeet TDT 0.6B V2 model checkpoint (.nemo format).
  * torchcodec for audio decoding (pip install torchcodec).
  * tritonclient[grpc] for gateway-to-Triton communication.



## Key implementation details

An open source repository accompanying this post provides the complete implementation. The following sections walk through deployment, configuration, and the key design decisions behind stable operation under CUDA MPS. The repository contains everything needed to build and deploy the inference pipeline: Dockerfiles, the Triton model backend, the FastAPI gateway, and orchestration configuration.

**Clone the accompanying repository and deploy with three commands:**
    
    
    # 1. Build (provide your fine-tuned .nemo checkpoint)
    docker build -f Dockerfile.single \
      --build-arg LOCAL_NEMO_FILENAME=your_model.nemo \
      -t parakeet-mps:latest .
    
    # 2. Run with 4 concurrent instances on one GPU
    docker run --gpus all --shm-size=2g \
      -e MPS_INSTANCE_COUNT=4 \
      -p 8002:8002 \
      parakeet-mps:latest
    
    # 3. Transcribe (OpenAI Whisper-compatible API)
    curl -X POST http://localhost:8002/v1/audio/transcriptions \
      -F file=@audio.wav -F model=parakeet-tdt

The container handles MPS daemon startup, model loading, and health monitoring automatically. The service is ready when /health returns 200 (typically 90-120 seconds after start). Refer to the repository README for the full quick-start guide.

### Explore the repository

The repository supports two deployment modes: a single all-in-one container (Dockerfile.single) or a two-container split through Docker Compose for independent scaling of the GPU inference and CPU gateway layers.
    
    
    ├── Dockerfile.single           # All-in-one: MPS daemon + Triton + gateway
    ├── Dockerfile.triton           # Triton-only (GPU container)
    ├── Dockerfile.gateway          # Gateway-only (CPU container)
    ├── docker-compose.yml          # Two-container orchestration
    ├── start-single-container.sh   # Single-container entrypoint
    ├── auto_config.py              # MPS instance count -> Triton config
    ├── server.py                   # FastAPI gateway (OpenAI-compatible API)
    └── triton_model_repo/
        └── parakeet_asr/
            ├── config.pbtxt        # Dynamic batching configuration
            └── 1/model.py          # Python backend - direct forward pass

### Build and run the container

Build the container image with your fine-tuned .nemo checkpoint as a build argument, then run with the MPS instance count you want. The Dockerfile bakes the checkpoint into the image and applies local attention optimization during the build step.
    
    
    # Build the all-in-one image
    docker build -f Dockerfile.single \
      --build-arg LOCAL_NEMO_FILENAME=your_model.nemo \
      -t parakeet-mps:latest .
    
    # Run with 4 MPS instances (25% SM each) on a single GPU
    docker run --gpus all --shm-size=2g \
      -e MPS_INSTANCE_COUNT=4 \
      -p 8002:8002 \
      parakeet-mps:latest

The container startup sequence is: (1) start the CUDA MPS daemon, (2) run auto_config.py to set the Triton instance count and SM percentage, (3) launch tritonserver. Refer to the repository for complete build and run instructions.

### Configure the deployment

Environment variables (MPS_INSTANCE_COUNT, GATEWAY_WORKERS, TRITON_URL, CUDA_VISIBLE_DEVICES) control all runtime behavior. The same container image works across GPU types by changing MPS_INSTANCE_COUNT, which sets both the Triton instance group count and the SM percentage per instance. Refer to the repository README for the full configuration reference.

### Understand the key design decisions

The implementation makes several important design choices that are critical for stable operation under CUDA MPS. We highlight the most important ones in this section.

**Direct forward pass.** The Triton backend calls model.forward() directly instead of calling model.transcribe() through NeMo, removing approximately 50 ms of framework overhead per request. Combined with bfloat16 autocast and a dedicated CUDA stream per instance, a single instance processes 45-second audio in approximately 160 ms.

**Serialized model loading.** Loading a 600M-parameter model from four processes simultaneously would exceed GPU memory. The backend serializes initialization using a file lock (fcntl.flock), with each instance loading, moving to GPU, freezing weights, and performing CUDA graph warmup before releasing the lock.

**CUDA graph warmup envelope.** The TDT decoder uses CUDA graphs to eliminate kernel launch overhead. During initialization, the backend pre-warms all expected production shapes (5, 15, 30, 45, and 60 seconds at batch size 1, plus batch size 2 at 61 seconds). Shapes within this envelope replay cached graphs at approximately 165 ms. Shapes exceeding it fall back to eager execution (approximately 500 ms) for that call only.

**MPS-safe CUDA graph fallback.** Under MPS, when NeMo’s decoder encounters a new tensor shape, it attempts to recapture the CUDA graph. During the 1.5–2.5 second recapture window, sibling MPS instances corrupt the capture, causing cudaErrorIllegalAddress and crashing the process.

**Wedge sentinel health monitoring.** Under sustained load, CUDA errors in one MPS instance can leave it unrecoverable. When the backend detects a wedged instance (through a CUDA stream probe failure), it writes a sentinel file to tmpfs (/tmp/parakeet_wedged).

**Dynamic batching.** Triton accumulates requests up to batch size 16 (preferred sizes 4, 8, 16) with a 50 ms max queue delay, balancing latency against throughput.

**Gateway-side audio decoding.** The FastAPI gateway handles audio decoding (WAV, WebM/Opus, MP3, M4A, FLAC) using torchcodec, keeping the Triton input as raw float32 tensors so the gateway can run on CPU-only nodes.

### Streaming diarization

The speaker diarization model (NVIDIA Streaming Sortformer 4-speaker v2) uses eight MPS instances at 12 percent SM each with sequence batching for per-recording state. Each recording gets a unique correlation ID for chunk routing, with sessions auto-expiring after 600 seconds. The model runs as a TensorRT + ONNX engine with warmup optimization at container start.

### API endpoints

The gateway exposes an OpenAI Whisper-compatible API (POST /v1/audio/transcriptions), making it a drop-in replacement for existing integrations. Additional endpoints include /health (liveness + wedge sentinel check) and /metrics (Prometheus-format latency quantiles). Response formats include json, verbose_json, text, srt, and vtt. Refer to the repository for the full API reference.

## Results

The benchmark sweeps concurrency from 1 to 100 on each configuration, averaging 5 rounds of measurements. Audio samples are representative clinical consultation segments. The SLA threshold is: mean latency < 650 ms AND p99 < 1,000 ms.

### Configuration 1: Triton + MPS (g6e.4xlarge)

**Conc** | **RPS** | **RPM** | **p50 (ms)** | **Mean (ms)** | **p99 (ms)** | **SLA**  
---|---|---|---|---|---|---  
1 | 6.3 | 376 | 161.1 | 161.1 | 164.2 |   
4 | 24.1 | 1,448 | 166.2 | 166.8 | 182.9 |   
8 | 43.2 | 2,592 | 183.9 | 186.3 | 244.6 |   
16 | 55.9 | 3,352 | 303.1 | 289.0 | 355.0 |   
20 | 62.3 | 3,736 | 318.4 | 325.7 | 409.2 |   
28  | 60.8 | 3,650 | 374.6 | 470.5 | 947.1 |   
32 | 60.9 | 3,654 | 452.1 | 538.7 | 1,169.1 |   
64 | 62.0 | 3,720 | 1,131.9 | 1,082.2 | 2,200.8 |   
  
_Optimal operating point – last concurrency where mean < 650 ms AND p99 < 1,000 ms._

**Result: 4 GPUs recommended (compared to 16 today), a 75 percent reduction.**

### Configuration 2: Triton + MPS (g7e.4xlarge) – Selected production path

**Conc** | **RPS** | **RPM** | **p50 (ms)** | **Mean (ms)** | **p99 (ms)** | **SLA**  
---|---|---|---|---|---|---  
1 | 8.3 | 498 | 121.0 | 121.1 | 123.7 |   
8 | 48.7 | 2,920 | 163.9 | 165.6 | 186.2 |   
16 | 78.2 | 4,692 | 208.3 | 206.1 | 249.8 |   
24 | 91.3 | 5,480 | 220.5 | 265.8 | 455.9 |   
32  | 92.1 | 5,528 | 290.5 | 352.5 | 768.8 |   
64 | 99.7 | 5,980 | 739.1 | 659.4 | 958.3 |   
100 | 106.0 | 6,362 | 964.7 | 989.3 | 1,544.6 |   
  
Compared to g6e, g7e delivers over 51 percent throughput and under 25 percent latency at the optimal operating point.

**Result: 4 GPUs recommended (compared to 16 today), a 75 percent reduction.**

### Configuration 3: TensorRT + ONNX + MPS

**Conc** | **RPS** | **RPM** | **p50 (ms)** | **Mean (ms)** | **p99 (ms)** | **SLA**  
---|---|---|---|---|---|---  
1 | 8.7 | 522 | 115.5 | 115.5 | 117.9 |   
4 | 27.7 | 1,664 | 144.4 | 144.9 | 152.8 |   
8 | 53.3 | 3,200 | 149.8 | 151.0 | 160.8 |   
16 | 88.1 | 5,288 | 182.4 | 182.8 | 210.4 |   
24 | 101.5 | 6,088 | 199.1 | 239.1 | 392.9 |   
32 | 104.5 | 6,272 | 353.4 | 310.2 | 464.8 |   
64  | 111.6 | 6,696 | 569.4 | 590.3 | 895.7 |   
100 | 112.1 | 6,728 | 629.3 | 932.1 | 1,799.9 |   
  
**Result: 2 GPUs recommended (compared to 16 today), an 88 percent reduction.**

### Configuration comparison

**Configuration** | **Instance** | **Max Conc** | **RPS** | **Mean** | **p99** | **Savings**  
---|---|---|---|---|---|---  
Triton Baseline | g6e.4xlarge | 20 | 62.3 | 606 ms | 788 ms | —  
Triton + MPS | g6e.4xlarge | 28 | 60.8 | 470 ms | 947 ms | 75%  
Triton + MPS  | g7e.4xlarge | 32 | 92.1 | 352 ms | 769 ms | 75%  
TensorRT+ONNX+MPS | g7e.4xlarge | 64 | 111.6 | 590 ms | 896 ms | 88%  
  
The following chart compares throughput scaling across all configurations. Look for the point where each line crosses into the SLA-violation zone (dashed region), which determines the maximum sustainable concurrency per configuration.

Figure 3: Throughput scaling with concurrency for all configurations. The dashed region indicates SLA violation (mean > 650 ms or p99 > 1,000 ms). The selected production path (Triton + MPS on g7e) achieves 92.1 RPS per GPU with 75% infrastructure savings

### Diarization results

We benchmarked the diarization model before and after TensorRT engine warmup optimization:

**Metric** | **Before Warmup** | **After Warmup** | **Improvement**  
---|---|---|---  
Mean | 309.04 ms | 238.73 ms | -23%  
p50 | 348.21 ms | 237.67 ms | -32%  
p95 | 469.32 ms | 355.82 ms | -24%  
p99 | 499.45 ms | 389.21 ms | -22%  
  
The warmup optimization also reduced standard deviation from 12.62 ms to 7.13 ms (under 44 percent), indicating significantly more predictable inference latency. The model processes 60-second recordings in four chunks of 15 seconds each, all well within the overall pipeline budget.

In operational terms, diarization processes a 60-second consultation in four chunks of 15 seconds at 238 ms mean latency per chunk (total under 1 second, real-time factor 0.016x). The eight diarization instances run on a separate MPS partition from transcription without contention.

## Clean up resources

To avoid incurring ongoing charges after testing, clean up the resources you created while following this post:

  * Stop and terminate the Amazon EC2 GPU instances (g6e.4xlarge or g7e.4xlarge).
  * Delete attached Amazon EBS volumes (model checkpoints, TensorRT cache).
  * Remove Docker images from Amazon ECR if pushed.
  * Delete any Amazon CloudWatch log groups created during testing.



## Conclusion

In this post, we showed how NVIDIA CUDA MPS on Amazon EC2 reduces ASR inference infrastructure by 75 percent (from 16 GPUs to 4) while maintaining sub-second latency SLAs (mean < 650 ms, p99 < 1,000 ms). On g7e.4xlarge, MPS achieves 92.1 RPS per GPU at 352 ms mean latency. The TensorRT + ONNX + MPS optimization pushes further to 111.6 RPS (88 percent reduction) for workloads where ONNX re-export on each fine-tuning cycle is acceptable.

These optimizations are model-agnostic: the MPS architecture, direct forward-pass pattern, CUDA graph safety mechanism, and wedge sentinel apply to any encoder-decoder model served through Triton on NVIDIA GPUs. The same approach has been validated with NVIDIA Canary and OpenAI Whisper large-v3 checkpoints. The pattern extends to any workload where individual requests use a small fraction of available GPU compute.

For production deployments, start with four MPS instances on g7e.4xlarge and monitor GPU SM utilization with nvidia-smi. If p99 latency has headroom, increase MPS_INSTANCE_COUNT incrementally. The TensorRT + ONNX + MPS path delivers an additional 21 percent throughput gain (111.6 compared to 92.1 RPS). The tradeoff is a longer deployment pipeline that requires weekly ONNX re-export.

The [accompanying GitHub repository](<https://github.com/aws-samples/genai-ml-platform-examples/tree/main/infrastructure/nvidia-parakeet-model-mps>) contains the complete implementation: Dockerfiles, Triton model configurations, the FastAPI gateway, CUDA graph safety patch, health monitoring, and benchmark scripts, ready to deploy on any EC2 GPU instance.

To get started, explore the following resources:

  * [Accompanying GitHub repository with complete implementation](<https://github.com/aws-samples/genai-ml-platform-examples/tree/main/infrastructure/nvidia-parakeet-model-mps>).
  * [Amazon EC2 G6e and G7e instances](<https://aws.amazon.com/ec2/instance-types/g6e/>).
  * [NVIDIA Triton Inference Server documentation](<https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/index.html>).
  * [Part 1: Fine-tuning NVIDIA NeMoTron Speech ASR on Amazon EC2 for domain adaptation](<https://aws.amazon.com/blogs/machine-learning/fine-tuning-nvidia-nemotron-speech-asr-on-amazon-ec2-for-domain-adaptation/>).



### Acknowledgements

The authors thank the following AWS and Heidi team members for their contributions to this post: [Faisal Masood](<https://www.linkedin.com/in/faisalmas/>), [Prem Oommen](<https://www.linkedin.com/in/analystprem/>), [Xuetong Wu](<https://www.linkedin.com/in/xuetong-wu-5b8048182/?locale=en>), [Taha Ansari](<https://www.linkedin.com/in/tahaaansari/>), and [Ocha Cakramurti](<https://www.linkedin.com/in/cakramurti/>).

* * *

## About the authors

### Iman Abbasnejad

[Iman](<https://www.linkedin.com/in/iman-abbasnejad-34562957/>) is an Applied Scientist at the Generative AI Innovation Center at Amazon Web Services (AWS). He collaborates closely with AWS customers to design, develop, and deploy advanced generative AI models and solutions. His work focuses on bridging the gap between theoretical AI research and practical, real-world applications, helping organizations accelerate their adoption of generative AI technologies.

### Daniel Wirjo

[Daniel](<https://www.linkedin.com/in/wirjo/>) is a Solutions Architect at AWS, focused on AI and SaaS startups. As a former startup CTO, he enjoys collaborating with founders and engineering leaders to drive growth and innovation on AWS. Outside of work, Daniel enjoys taking walks with a coffee in hand, appreciating nature, and learning new ideas.

### Jerron Chua

[Jerron](<https://www.linkedin.com/in/jerron-chua-wei-quan-6991a517a/>) is a Deep Learning Architect at the Generative AI Innovation Center at Amazon Web Services (AWS). His work focuses on custom model optimization, striking the right balance between speed, cost, and accuracy to deliver solutions that perform well under real-world production constraints. He partners closely with customers to translate their requirements into efficient, scalable AI workloads on AWS.
