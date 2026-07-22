---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/disaggregated-prefill-and-decode-for-llm-inference-on-sagemaker-hyperpod
ingested: 2026-07-11
feed_name: AWS China ML
source_published: 2026-07-10
sha256: b031a344eb3500309c08aa18b3eb6d4a8dbf9347975d5953d6f151f2bc521e7a
---

# Disaggregated prefill and decode for LLM inference on SageMaker HyperPod

When prefill and decode share a GPU, long prompts stall token generation for every concurrent request. Disaggregated Prefill and Decode (DPD) removes this interference by running each phase on separate GPU pools connected through Elastic Fabric Adapter (EFA) with Remote Direct Memory Access (RDMA). Large language model (LLM) inference has two fundamentally different phases. Prefill is compute-bound. It processes the entire input prompt in parallel to generate the initial key-value (KV) cache. Decode is memory-bound. It generates one token at a time and requires substantial memory bandwidth to access model weights and the growing KV cache. By disaggregating these into specialized engines, you can assign different parallel strategies to each phase. With this separation, you can tune time to first token (TTFT) and inter-token latency (ITL) independently, control tail latency more reliably than chunked prefill tuning, and keep long-context prefills from blocking ongoing decode requests. vLLM improves single-node efficiency through continuous batching and PagedAttention. However, organizations that deploy at scale still face challenges when they orchestrate multi-node deployments and optimize routing.

In this post, we show how to implement DPD with vLLM on [Amazon SageMaker HyperPod](<https://aws.amazon.com/sagemaker/ai/hyperpod/>) using the [HyperPod Inference Operator](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-model-deployment.html>).

## When to use disaggregated inference

Disaggregating prefill and decode delivers the strongest gains for long-context, high-concurrency streaming workloads: chat assistants, agentic pipelines, document-analysis endpoints, and Retrieval Augmented Generation (RAG) with large retrieved contexts. In these cases, a single long prompt on a colocated GPU stalls in-flight decode for every other request, causing per-token latency spikes that DPD removes by construction.

**Consider DPD when your workload has:**

  * Input prompts that regularly exceed 4,096 tokens.
  * Multiple concurrent users or requests.
  * Streaming responses where consistent token delivery matters.
  * Mixed traffic with both long and short prompts.



A colocated deployment is the simpler choice when GPU contention is not a real concern: batch or offline workloads optimizing for TTFT, low-concurrency deployments, or short-prompt-only traffic. Below the routing threshold, the fixed cost of transferring KV cache over EFA RDMA outweighs the benefit of isolating decode. The DPD router sends those requests straight to a decoder. A single endpoint therefore handles mixed long and short traffic automatically, without manual routing logic.

DPD requires at minimum one prefill node and one decode node with RDMA-capable EFA networking. For supported instance types, see the Deploy a DPD model endpoint to your HyperPod cluster section.

## Architecture

The HyperPod DPD implementation is built on the [vLLM](<https://vllm.ai/>) Production Stack router, with [LMCache](<https://lmcache.ai/>) providing the KV cache transfer layer over NIXL and EFA. The deployment has three components plus a transport stack.

### Intelligent router

The router is the control plane. It tokenizes each prompt and applies a configurable token threshold to decide whether the request takes the disaggregated path or runs end-to-end on a decoder. Long-context prompts go through a prefiller then a decoder. Short prompts skip the prefiller, avoiding cross-GPU KV transfer that isn’t worthwhile. For disaggregated requests, it directs the prefiller to compute and push KV cache to a decoder, then forwards the request to that decoder for generation. It also supports per-prefiller routing strategies (`prefixaware`, `kvaware`, `session`, `roundrobin`) through `intelligentRoutingSpec.routingStrategy` to maximize cache locality across replicas.

### Prefiller pod

The prefiller is a vLLM worker with LMCache as its KV connector through `LMCacheConnectorV1`. It computes KV cache for long prompts and pushes it to the chosen decoder via LMCache’s PD sender backend layer-by-layer, overlapping compute and transfer to keep its GPUs saturated. LMCache also gives each prefiller an L1 CPU cache. When a prefix recurs (system prompts, multi-turn history, retrieval contexts), it serves from CPU memory without GPU recomputation. This produces significant TTFT gains. Activating DPD on an `InferenceEndpointConfig` provisions both the connector and the cache automatically.

### Decoder pod

The decoder is a vLLM worker with LMCache as its receiver. It reserves GPU memory (the PD buffer, sized by `PD_BUFFER_SIZE`) for incoming KV transfers. It runs full CUDA graphs for the decode kernel and starts generation as soon as the transfer completes. Because it never executes prefill, decode latency stays stable under concurrency and adding a long-context request never disturbs tokens already streaming.

### KV transfer

KV cache transfer uses a four-layer stack (LMCache PD → NIXL → `libfabric` → EFA) that HyperPod composes end-to-end. LMCache’s PD backend orchestrates the prefiller-side put and decoder-side retrieval. NIXL provides a unified memory abstraction across GPU, CPU, and remote peers and selects the right RDMA operation. The `libfabric` provider exposes EFA as kernel-bypass, GPU-Direct RDMA, keeping the host CPU off the data path. This makes transfer cost negligible relative to prefill compute: on `ml.p5.48xlarge` with 3,200 Gbps of EFA, an 8,000-token transfer for Llama 3.3 70B takes single-digit milliseconds. HyperPod ships the stack pre-integrated, so you select a DPD-supported worker image and the operator wires up the connector, NIXL, and EFA on every pod.

## Deployment overview

Disaggregated Prefill and Decode (DPD) is a functionality implemented by the HyperPod Inference Operator. This section covers prerequisites, installation of the inference operator and deployment of an inference endpoint that uses DPD for efficiently serving a Llama 70B model.

### Prerequisites and HyperPod Inference Operator installation

Make sure you have the [AWS Command Line Interface](<https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html>) (AWS CLI), [kubectl](<https://kubernetes.io/docs/tasks/tools/>) access to your HyperPod cluster, a [HuggingFace](<https://huggingface.co/>) token, and sufficient service quota. Set up your local `kubectl` configuration to connect to your HyperPod cluster. For more information, see [Disaggregated Prefill and Decode for HyperPod inference](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-model-deployment-dpd.html>).

DPD requires HyperPod Inference Operator version 3.2 or later. The operator is installed by default on new HyperPod EKS clusters. For installation, setup, and upgrade instructions, see [_Unlock efficient model deployment: simplified Inference Operator setup on Amazon SageMaker HyperPod_](<https://aws.amazon.com/blogs/architecture/unlock-efficient-model-deployment-simplified-inference-operator-setup-on-amazon-sagemaker-hyperpod/>).

Verify your operator version by running:
    
    
    kubectl get deployment hyperpod-inference-operator-controller-manager \
      -n hyperpod-inference-system \
      -o jsonpath='{.spec.template.spec.containers[?(@.name=="manager")].image}{"\n"}'

The output is the full container image reference. The tag at the end encodes the version, for example:
    
    
    XXXXXXXXXXX.dkr.ecr.us-east-2.amazonaws.com/hyperpod-inference-operator:v3.2

If your operator version is not up-to-date, upgrade before continuing by following the upgrade instructions in the [HyperPod Inference Operator Release Notes](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-inference-release-notes.html#sagemaker-hyperpod-inference-release-notes-20260506>).

### Deploy a DPD model endpoint to your HyperPod cluster

In this example, we deploy the Meta Llama 3.3 70B model on two `ml.p5.48xlarge` instances. Verify that the instances are available in an instance group within the HyperPod cluster before proceeding. For DPD inference deployments, choose instance types that support both NVLink and EFA. EFA needs to support RDMA in read and write mode. This includes the [P5](<https://aws.amazon.com/ec2/instance-types/p5/>) and [P6](<https://aws.amazon.com/ec2/instance-types/p6/>) instance families on AWS. Note that instances are required to be located within the same Availability Zone (AZ) for EFA high-bandwidth communication. Although G6, G6e, and G7e instance families do support EFA with RDMA read/write, performance on multi-GPU instances is bottlenecked by GPU-to-GPU communication over PCIe.

The worker image for the inference deployment must include vLLM, LMCache, NVIDIA NIXL, and the EFA `libfabric` provider. At the time of writing, we support two image options:

  * Open source LMCache: [lmcache/vllm-openai v0.4.3](<https://hub.docker.com/r/lmcache/vllm-openai/tags>).
  * SageMaker Deep Learning Container (DLC): vllm:server-hyperpod-cuda-v1.1.



#### Model checkpoint location

The HyperPod Inference Operator supports a broad range of checkpoint loading sources, including [Amazon Simple Storage Service (Amazon S3) buckets, Amazon FSx file systems, and direct pulling from HuggingFace](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-model-deployment-deploy-ftm.html>) and the [instance NVMe storage](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-model-deployment-deploy-nvme.html>). For this post, we load the model checkpoint from an Amazon S3 bucket.

Verify that you have downloaded your preferred model checkpoint to an S3 bucket in the same Region as your HyperPod cluster. If you haven’t done so yet, set up your bucket name and HuggingFace token, then download Meta Llama 3.3 70B Instruct from HuggingFace and sync it to Amazon S3. To achieve high-bandwidth networking to Amazon S3, we recommend that you run this from an Amazon Elastic Compute Cloud (Amazon EC2) instance.
    
    
    export MODEL_BUCKET=<YOUR_BUCKET>
    export MODEL_PREFIX=Llama-3.3-70B-Instruct
    export AWS_REGION=<CLUSTER_REGION>
    export HF_TOKEN=<YOUR_HUGGINGFACE_TOKEN>
    pip install -U "huggingface_hub[cli]" "huggingface_hub[hf-transfer]"
    HF_HUB_ENABLE_HF_TRANSFER=1 hf download meta-llama/Llama-3.3-70B-Instruct \
      --local-dir ./$MODEL_PREFIX \
      --token "$HF_TOKEN"
    aws s3 sync ./$MODEL_PREFIX \
      s3://$MODEL_BUCKET/$MODEL_PREFIX/ \
      --region "$AWS_REGION"

Prepare the model deployment manifest and change the environment variables as needed:
    
    
    export DEPLOYMENT_NAME="dpd-test-deployment"
    export ENDPOINT_NAME="dpd-test"
    export MODEL_NAME="meta-llama-3-3-70b"
    export NAMESPACE="default"
    export INSTANCE_TYPE="ml.p5.48xlarge"
    export GPUS_PER_NODE="8"
    export MODEL_IMAGE="lmcache/vllm-openai:v0.4.3"

For the full deployment YAML, see [Deploy a DPD endpoint](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-model-deployment-dpd.html#sagemaker-hyperpod-model-deployment-dpd-deploy>).

#### DPD-relevant fields in the deployment manifest

Most `InferenceEndpointConfig` fields are shared with non-DPD endpoints and documented in the [Inference Operator documentation](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-model-deployment.html>). The fields below are required or have different semantics for DPD.

**spec.pdSpec** : Declares the prefill/decode topology and specifies arguments. Presence of this field is what makes the endpoint disaggregated: the operator creates separate `Deployment` objects for prefill and decode and wires them together through the router and LMCache PD backend.

  * `replicas`: Scale prefill and decode independently.
  * `resources`: Applied to the role’s pod spec. Top-level `worker.resources` is ignored for DPD pods. Per-role values override.
  * `routingThreshold`: Token length threshold above which requests use the disaggregated path. Below the threshold, requests bypass the prefiller and go directly to the decoder.
  * `args`: vLLM flags specific to that role, merged into `worker.args` at startup. Flags already in `worker.args` are replaced with the per-role value, and flags not present are appended.



**spec.worker.environmentVariables** : These environment variables are applied identically to both the prefiller and decoder containers. There is no per-role environment-variable field today. For per-role behavior, use `pdSpec.{prefillSpec,decodingSpec}.args` instead.

More details about environment variables are in [Deploy a DPD endpoint](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-model-deployment-dpd.html#sagemaker-hyperpod-model-deployment-dpd-deploy>).

## Apply the manifest and validate the deployment
    
    
    kubectl apply -f inference_endpoint_dpd_config.yaml

The operator creates two `Deployment` objects in your namespace and a router `Deployment` in `hyperpod-inference-system`. Image pull and model load take a few minutes. The pods first enter `ContainerCreating`, then become `Running` as containers come up. List the pods across both namespaces:
    
    
    kubectl get pods -A \
      | grep -E "prefill-${DEPLOYMENT_NAME}|decode-${DEPLOYMENT_NAME}|${DEPLOYMENT_NAME}-${NAMESPACE}-router"
    
    
    NAMESPACE                   NAME                                           READY   STATUS    RESTARTS   AGE
    default                     prefill-dpd-test-deployment-XXXX               3/3     Running   0          7m
    default                     decode-dpd-test-deployment-XXXX                3/3     Running   0          7m
    hyperpod-inference-system   dpd-test-deployment-default-router-XXXX        2/2     Running   0          7m

Each model pod has 3 containers: the vLLM worker, an Nginx reverse proxy, and an OpenTelemetry collector. The router pod has 2 containers (router, otel). The IEC condition reports readiness:
    
    
    kubectl get inferenceendpointconfig ${DEPLOYMENT_NAME} -n ${NAMESPACE} \
      -o jsonpath='{.status.conditions[0].message}{"\n"}'
    
    
    DPD prefill and decode deployments are ready

## Invoke the endpoint and verify KV transfer

Once the endpoint is ready, send a short and a long prompt to exercise both routing paths. Check the prefiller and decoder logs to confirm KV cache is being transferred over EFA. The following commands assume the IEC was deployed with `${NAMESPACE}`, `${ENDPOINT_NAME}`, and `${DEPLOYMENT_NAME}` set as in the preceding manifest.

Get the required pod names and router url:
    
    
    PREFILL_POD=$(kubectl get pod -n ${NAMESPACE} \
      -l 'inference.sagemaker.aws.amazon.com/dpd-role=prefill' \
      -o jsonpath='{.items[0].metadata.name}')
    DECODE_POD=$(kubectl get pod -n ${NAMESPACE} \
      -l 'inference.sagemaker.aws.amazon.com/dpd-role=decode' \
      -o jsonpath='{.items[0].metadata.name}')
    ROUTER_POD=$(kubectl get pods -n hyperpod-inference-system -o name \
      | grep -- "${DEPLOYMENT_NAME}-${NAMESPACE}-router" | head -1)
    ROUTER_URL=http://${DEPLOYMENT_NAME}-${NAMESPACE}-routing-service.hyperpod-inference-system.svc.cluster.local:443/v1/chat/completions

### Short prompt (below threshold, direct-to-decoder path)

Run a short prompt through a pod within the cluster that invokes the endpoint:
    
    
    kubectl run curl-short --rm -it --image=curlimages/curl --restart=Never -- \
      curl -s -k -X POST "$ROUTER_URL" \
        -H "Content-Type: application/json" \
        -d '{
          "model": "/opt/ml/model",
          "messages": [{"role": "user", "content": "What is disaggregated prefill-decode in one sentence?"}],
          "max_tokens": 80,
          "temperature": 0.0
        }'
    
    
    {
      "id": "chatcmpl-7-...",
      "object": "chat.completion",
      "model": "/opt/ml/model",
      "choices": [{
        "index": 0,
        "message": {"role": "assistant", "content": "Disaggregated prefill-decode is an inference architecture that ..."},
        "finish_reason": "stop"
      }]
    }

### Long prompt (above threshold, DPD path)

A prompt above the 4,096-token routing threshold is routed through the prefiller, then to the decoder for token generation. The following example builds a roughly 6,000-token prompt by repeating a sentence:
    
    
    kubectl run curl-long --rm -it --image=curlimages/curl --restart=Never -- sh -c '
    ROUTER="'"$ROUTER_URL"'"
    LONG=""
    i=0; while [ $i -lt 600 ]; do LONG="${LONG}The quick brown fox jumps over the lazy dog. "; i=$((i+1)); done
    curl -s -k -X POST "$ROUTER" \
      -H "Content-Type: application/json" \
      -d "{\"model\":\"/opt/ml/model\",\"messages\":[{\"role\":\"user\",\"content\":\"${LONG}\"}],\"max_tokens\":30,\"temperature\":0.0}"
    '
    
    
    {
      "id": "chatcmpl-7-...",
      "object": "chat.completion",
      "model": "/opt/ml/model",
      "choices": [{
        "index": 0,
        "message": {"role": "assistant", "content": "The text is a repetitive sequence of ..."},
        "finish_reason": "length"
      }]
    }

To confirm that the invocation used the disaggregated path, we can check the router pod logs:
    
    
    kubectl logs $ROUTER_POD -n hyperpod-inference-system -c router-container --tail=20 \
      | grep -E "Conditional routing|prefill selection|prefill time|to decoder"

For the long prompt, you can observe the following output:
    
    
    [INFO] Conditional routing: estimated_tokens=6750, threshold=4096, disaggregate=True
    [INFO] DPD prefill selection: delegating to PrefixAwareRouter with 1 endpoints
    [INFO] DPD prefill selection: PrefixAwareRouter selected http://10.1.54.203:8081
    [INFO] <req-id> prefill time (TTFT): 7.1913
    [INFO] Routing request <req-id> to http://10.1.54.203:8081 at 1780486382.5954, process time = 7.1929
    [INFO] Routing request <req-id> to decoder http://10.1.172.158:8081 at 1780486382.6098, process time = 0.0144

`disaggregate=True` confirms the request took the prefiller path. The two `Routing request` lines show the prefill hop followed by the decode hop.

## Scaling guidance

DPD currently supports a single decoder replica with multiple prefiller replicas. This means you scale prefill capacity independently while the decoder remains fixed at one instance.

**Start with a 1:1 prefill-to-decode ratio** for balanced workloads (chat, code generation) where input and output lengths are comparable. **Scale to 2:1 or 3:1** when your workload is prefill-heavy: summarization, classification, or RAG with long retrieved contexts. This ratio is appropriate when you observe TTFT climbing under load while per-token output latency (TPOT) remains stable.

With multiple prefillers, set `intelligentRoutingSpec.routingStrategy` on your workload. Use `kvaware` for workloads with repeated prefixes (this maximizes L1 cache hits across prefiller partitions). Use `session` for multi-turn conversations that benefit from keeping a user’s context on one prefiller.

If instead TPOT is climbing and output throughput plateaus despite prefiller availability, the single decoder is saturated. In that case, increase `PD_BUFFER_SIZE`, reduce `max-model-len`, or reduce concurrency to the endpoint until multi-decoder support is available.

## Benchmarking performance

Benchmarks used `genai-bench` with fixed-length synthetic prompts (4,096 input tokens, 256 output tokens) at concurrency levels 8, 16, and 32. Each concurrency level ran until results stabilized. DPD configuration: 1 prefiller and 1 decoder across 2 nodes (16 GPUs), KV-aware routing, `enforce-eager` on the prefiller, and CUDA graphs on the decoder. Baseline: single node (8 GPUs), same model and GPU settings. Hardware: `ml.p5.48xlarge` (8x H100 80GB, EFA enabled). Model: Llama-3.3-70B-Instruct with `tensor-parallel-size=8` and `max-model-len=16,384`. The following charts show the percentage improvement DPD delivers over the colocated baseline on two instance families. Higher bars indicate larger DPD advantage.

The following chart shows the same benchmarks on `ml.p5en.48xlarge` instances with H200 GPUs, where DPD gains are equally pronounced.

Across both hardware configurations, DPD delivers consistent gains on per-token output latency (TPOT), end-to-end latency, and throughput as concurrency grows:

  * **Per-token latency stays flat under load**. DPD isolates decode from prefill interference, keeping TPOT constant regardless of concurrent long-context requests. For D(4096,256) workloads at concurrency 8 to 32, improvement ranges from 22% at low concurrency to 66% at high concurrency on H100, and 28% to 48% on H200.
  * **Throughput scales with concurrency**. The dedicated decoder runs at full CUDA graph efficiency without prefill interruption. Output throughput improves up to 35% on H100 and up to 64% on H200 at higher concurrency.
  * **End-to-end latency improves at P50**. The cumulative TPOT savings across output tokens outweigh the KV transfer cost. E2E P50 improves 14-32% on H100 and 29-41% on H200.



DPD does introduce a modest increase in time to first token because of the KV cache transfer over EFA RDMA. For streaming workloads where consistent per-token delivery matters more than initial response, this tradeoff is favorable. The conditional routing threshold (default 4,096 tokens) is designed to make sure that short requests bypass disaggregation entirely, avoiding transfer overhead where it is not needed.

## Observability

You can monitor DPD metrics through the SageMaker HyperPod Observability features. For more information, see [Accelerate foundation model development with one-click observability in Amazon SageMaker HyperPod](<https://aws.amazon.com/blogs/machine-learning/accelerate-foundation-model-development-with-one-click-observability-in-amazon-sagemaker-hyperpod/>).

DPD metrics are available in the Inference dashboard.

Additional metrics that may be useful are CPU/GPU usage, which is available in the **Tasks** dashboard, as well as the metrics available in the **Cluster Overview** dashboard.

## Clean up

To avoid ongoing charges, delete the resources created during this walkthrough when you are done experimenting.

  * Delete the `InferenceEndpointConfig` to remove the prefill pod, decode pod, router, and all associated services: 
        
        kubectl delete inferenceendpointconfig ${DEPLOYMENT_NAME} -n ${NAMESPACE}

  * (Optional) Remove the model from S3 if you uploaded it specifically for this walkthrough: 
        
        aws s3 rm s3://${MODEL_BUCKET}/${MODEL_PREFIX}/ --recursive --region ${AWS_REGION}

  * (Optional) Scale down or remove the HyperPod instance group if the GPU instances were provisioned solely for this deployment. Refer to the [Managing HyperPod clusters](<https://docs.aws.amazon.com/sagemaker/latest/dg/smcluster-scale-down.html>) documentation for instructions.



## Conclusion

Disaggregated Prefill and Decode (DPD) on Amazon SageMaker HyperPod runs prefill and decode on separate GPU pools. KV cache transfers between them over EFA using GPU-Direct RDMA. Prefill is compute-bound. Decode is memory-bandwidth-bound. When colocated, the two phases compete for the same GPU resources. A single long prompt can stall in-flight decoding and inflate tail per-token latency. Separating them removes that interference, produces more predictable latency under mixed traffic, and lets you scale each phase independently.

The HyperPod Inference Operator handles the underlying orchestration: provisioning the router, wiring the prefill and decode pods together, and integrating with HyperPod observability. You activate DPD by adding a few fields to the same `InferenceEndpointConfig` resource you already use for non-disaggregated endpoints.

You can get started today by deploying a DPD endpoint on your HyperPod EKS cluster following the steps in this post. To learn more, visit the [Amazon SageMaker HyperPod documentation](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod.html>), the [HyperPod Inference Operator model deployment guide](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-model-deployment.html>) or directly try out the example manifest in this post.

* * *

## About the authors

### Xuan Lu

Xuan is a Software Development Engineer at AWS, where he works on Amazon SageMaker HyperPod Inference to build scalable inference systems for large-scale AI workloads. His technical interests include distributed systems, large language model (LLM) serving, Kubernetes, and AI infrastructure, with a focus on performance optimization and scalable system design. Outside of work, Xuan enjoys traveling, exploring nature, and reading science fiction.

### Nicolas Jourdan

Nicolas is a Specialist Solutions Architect at AWS, where he helps customers unlock the full potential of AI and ML in the cloud. Nicolas has extensive hands-on experience across industries, including autonomous driving, drones, and manufacturing, having worked in roles ranging from research scientist to engineering manager. He has contributed to award-winning research, holds patents in object detection and anomaly detection, and is passionate about applying cutting-edge AI to solve complex real-world problems.

### Vinay Arora

Vinay is a Specialist Solution Architect for Generative AI at AWS, where he collaborates with customers in designing cutting-edge AI solutions leveraging AWS technologies. Prior to AWS, Vinay has over two decades of experience in finance—including roles at banks and hedge funds—he has built risk models, trading systems, and market data platforms. Vinay holds a master’s degree in computer science and business management.

### Piyush Daftary

[Piyush](<https://www.linkedin.com/in/raftaar/>) is a Senior Software Engineer at AWS, working on Amazon SageMaker with a focus on building performant, scalable inference systems for large language models. His technical interests span AI/ML, databases, and search technologies, where he specializes in developing production-ready solutions that enable efficient inference at scale. His work involves optimizing system performance, implementing intelligent routing mechanisms, and designing architectures that support both research and production workloads, with a passion for solving complex distributed systems challenges and making advanced AI capabilities more accessible to developers and organizations. Outside of work, he enjoys traveling, hiking, and spending time with family.

### Kirupa Gunaseelan

Kirupa is a Software Development Engineer at AWS, working on Amazon SageMaker HyperPod Inference to optimize performance for large-scale AI workloads. She enjoys diving deep into technical challenges and continuously expanding her engineering knowledge. Outside of work, Kirupa likes to read, play music, and spend time with friends and family.

### Richa Shalom Gadagotti

Richa is a Software Development Engineer at AWS, working on Amazon SageMaker HyperPod Inference. Her technical interests span AI/ML, distributed systems, and cloud-native technologies. Richa holds a master’s degree in computer science and is passionate about solving complex engineering challenges and making advanced AI capabilities more accessible.

### Swapnil Palod

Swapnil is a Senior Manager at AWS, leading the Amazon SageMaker Inference team. He focuses on building scalable, high-performance ML inference systems that make deploying and serving models at scale seamless for customers. His technical interests span AI/ML infrastructure, distributed systems, and platform engineering. He is passionate about growing high-performing engineering teams and solving complex distributed systems challenges at the intersection of AI and infrastructure. Outside of work, he enjoys spending time with the family, sports, and traveling.
