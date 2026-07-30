---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/deploying-kimi-k3-on-aws
ingested: 2026-07-31
feed_name: AWS China ML
source_published: 2026-07-30
sha256: f4caca0de781f010e95a750278a9d466fddddab8db4289ff3049f90e092318df
---

# Deploying Kimi K3 on AWS

Open weight models have become powerful enough to handle complex tasks such as multi-step agentic workflows, advanced reasoning, and long-horizon coding. However, as these models grow in capability, they also grow in size and hosting multi-trillion parameter architectures requires purpose-built infrastructure, high-end GPU compute, and optimized serving frameworks. On July 27, 2026, Moonshot AI released Kimi K3, a 2.8 trillion parameter Mixture of Experts (MoE) model that represents the [first open-weight system](<https://platform.kimi.ai/docs/guide/kimi-k3-quickstart>) to reach the 3 trillion parameter class. Kimi K3 delivers [frontier-level intelligence](<https://artificialanalysis.ai/models/kimi-k2>) while making its weights publicly available, so that organizations can self-host one of the most capable models in existence on their own infrastructure.  
  
This post walks through deploying Kimi K3 on AWS using two approaches: Amazon SageMaker HyperPod, and Amazon Elastic Kubernetes Service (Amazon EKS) cluster.

# **About Kimi K3**

Kimi K3 is built on a differentiated architecture featuring Kimi Delta Attention (KDA), Gated Multi Head Latent Attention (MLA), and a Stable LatentMoE framework. The model distributes its 2.8 trillion parameters across 896 specialist experts, activating only 16 per token. This means approximately 104 billion parameters are active during any single forward pass, yielding a [2.5x improvement](<https://platform.kimi.ai/docs/guide/kimi-k3-quickstart>) in scaling efficiency over its predecessor, Kimi K2.

**Attribute** | **Value**  
---|---  
Total Parameters | 2.8 Trillion  
Active Parameters per Token | 104 Billion  
Architecture | Mixture of Experts (MoE)  
Expert Count | 896 (16 activated per token)  
Context Window | 1 Million Tokens  
Modality | Native Multimodal (Text + Vision)  
Release Date | July 27, 2026  
  
Kimi K3 excels at long-horizon coding tasks, agentic workflows, and complex reasoning. It supports native tool calling, structured output, and an always-on thinking mode for multi-step problem solving.

# **Model availability and format**

The open weights for Kimi K3 are available on Hugging Face under the model identifier moonshotai/Kimi-K3. The weights are distributed in **MXFP4** (Microscaling Floating Point 4-bit) format, which provides an effective balance between model quality and memory efficiency for large-scale inference deployments.

Given the model’s architecture and size, serving Kimi K3 requires a vLLM day-0 inference container for Kimi K3. At the time of writing, vllm commits for Kimi K3 are in `vllm/vllm-openai:kimi-k3`. We expect these to be merged to the main vllm container in the upcoming releases. vLLM provides native support for MoE architectures, tensor parallelism, and the MXFP4 quantization format, making it the recommended serving engine for this model.

# **Infrastructure requirements**

Deploying a model of this scale requires substantial GPU compute. Kimi K3 requires a **p6-b300** instance (`ml.p6-b300.48xlarge`), which provides 8 NVIDIA B300 Blackwell Ultra GPUs with high-bandwidth interconnects necessary for efficient tensor-parallel inference across the full expert pool.

AWS offers two primary mechanisms to procure this capacity:

  1. **Flexible Training Plans (for SageMaker HyperPod):** Provide committed capacity reservations that can be allocated to your HyperPod cluster, so that GPU resources are available for sustained inference workloads.
  2. **Capacity Blocks:** Allow you to reserve EC2 GPU instances for a defined period, providing guaranteed access to p6-b300 capacity without long-term commitments. **Amazon EKS** workloads consume these reservations by targeting the reserved capacity.



# **Option 1: Deploying on Amazon SageMaker HyperPod**

Amazon SageMaker HyperPod with the Inference Operator provides the simplest path to deploying Kimi K3. The Inference Operator is installed automatically as part of cluster creation, and it abstracts away the complexity of container orchestration, model loading, and endpoint management.

## **Prerequisites**

Before deploying the model, complete the following two prerequisite steps to set up your infrastructure.

### **Step 1: Create a SageMaker HyperPod cluster with EKS orchestration**

Before deploying the model, you must provision a HyperPod cluster. Navigate to the Amazon SageMaker AI console and follow the cluster creation workflow:

  1. Open the SageMaker AI console and select **HyperPod Clusters > Cluster Management > Create HyperPod cluster**.
  2. Choose **Orchestrated by Amazon EKS** from the list.
  3. Select **Quick setup** to provision a cluster with default networking, storage, and IAM resources, or choose **Custom setup** to integrate with existing VPC, subnets, and security groups.
  4. Under **Orchestration** , either create a new EKS cluster or attach an existing one. Verify that the **Use default Helm charts and add-ons** option is selected so that the Inference Operator and other required operators are installed automatically.
  5. Under **Instance groups** , add a worker group configured with the `ml.p6-b300.48xlarge` instance type.
  6. Review the configuration and choose **Submit** to begin provisioning.



For the complete walkthrough, refer to the [Creating a SageMaker HyperPod cluster with Amazon EKS orchestration](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-eks-operate-console-ui-create-cluster.html>) documentation.

### **Step 2: Procure capacity using a Flexible Training Plan**

The `ml.p6-b300.48xlarge` instance type requires reserved capacity. A Flexible Training Plan provides a committed capacity reservation for your Blackwell GPU nodes, guaranteeing that p6-b300 instances are available to your cluster without contention from the general on-demand pool. Go to SageMaker Console, select a FTP block based on your timeline and instance count. To create or attach a training plan:

  1. In the instance group configuration, choose **Training plan** as the capacity source.
  2. Select an existing plan that covers `ml.p6-b300.48xlarge` capacity, or create a new reservation specifying the instance count and duration that you want.
  3. Set the **Target Availability Zone** to match the zone where your training plan capacity is allocated.



Once the cluster reaches an Active state with healthy p6-b300 nodes, you are ready to deploy the model.

## **Deploying the model**

To deploy Kimi K3 on HyperPod, apply the following `InferenceEndpointConfig` manifest to your cluster:
    
    
    apiVersion: inference.sagemaker.aws.amazon.com/v1
    kind: InferenceEndpointConfig
    metadata:
      name: kimik3
    spec:
      modelName: Kimi-K3
      instanceType: ml.p6-b300.48xlarge
      invocationEndpoint: v1/chat/completions
      replicas: 1
      modelSourceConfig:
        huggingFaceModel:
          modelId: moonshotai/Kimi-K3
        modelSourceType: huggingface
      worker:
        image: vllm/vllm-openai:kimi-k3
        modelInvocationPort:
          containerPort: 8000
          name: http
        modelVolumeMount:
          mountPath: /opt/ml/model
          name: model-weights
        resources:
          limits:
            nvidia.com/gpu: 8
          requests:
            nvidia.com/gpu: 8
        args:
          - "--model"
          - "moonshotai/Kimi-K3"
          - "--trust-remote-code"
          - "--load-format"
          - "fastsafetensors"
          - "--enable-prefix-caching"
          - "--enable-auto-tool-choice"
          - "--tool-call-parser"
          - "kimi_k3"
          - "--reasoning-parser"
          - "kimi_k3"
          - "--served-model-name"
          - "Kimi-K3"
          - "--moe-backend"
          - "auto"
          - "--tensor-parallel-size"
          - "8"
          - "--no-enable-flashinfer-autotune"
        environmentVariables:
          - name: "VLLM_ENABLE_K3_LATENT_MOE_TAIL_FUSION"
            value: "1"

This yaml is also provided in the [GitHub repository](<https://github.com/aws-samples/sagemaker-genai-hosting-examples/blob/main/SageMakerHyperpod/kimi-k3/kimi-k3.yaml>). Apply this configuration with:`kubectl apply -f kimi-k3.yaml`

The Inference Operator handles model download from Hugging Face, container scheduling, health checks, and endpoint readiness. Once the endpoint transitions to a ready state, it exposes an OpenAI compatible API at the configured invocation path.

# **Option 2: Deploying on Amazon EKS**

For teams that prefer to manage their own Kubernetes infrastructure, you can deploy Kimi K3 on a standalone Amazon EKS cluster and procure GPU capacity through **EC2 Capacity Blocks** , which allow you to reserve p6-b300 instances for a defined duration without long-term commitments.

## **Key deployment steps**

The [AI on EKS](<https://github.com/awslabs/ai-on-eks-charts/blob/main/charts/inference-charts/values-kimi-k3-vllm-b300.yaml>) project provides an inference-ready cluster recipe that automates the end-to-end provisioning. At a high level, the deployment involves the following stages:

### **1\. Provision the EKS cluster**

Use the provided Terraform modules to create a GPU-optimized EKS cluster. This includes VPC networking, managed node groups, and the necessary IAM roles and policies for GPU workloads.

### **2\. Reserve GPU capacity with Capacity Blocks**

Create a Capacity Block reservation for `p6-b300.48xlarge` instances in your target Availability Zone. Capacity Blocks guarantee that the requested GPU nodes will be available for the reserved time window. Once the reservation becomes active, the instances join your EKS cluster as worker nodes.

### **3\. Install GPU drivers and device plugin**

The recipe installs the NVIDIA device plugin and GPU drivers on the node group, so that Kubernetes can discover and schedule against the available GPUs.

### **4\. Deploy the vLLM inference server**

A Helm chart or Kubernetes manifest deploys the vLLM container with Kimi K3 specific arguments, including tensor-parallel size of 8, the MXFP4 load format, MoE backend configuration. The model identifier points to the Hugging Face repository, or as an alternative, you can sync the model weights to Amazon Simple Storage Service (Amazon S3) for faster model loading. The serving arguments mirror those shown in the HyperPod configuration above.

### **5\. Expose the inference endpoint**

A Kubernetes Service (type LoadBalancer or via an Ingress controller) exposes the vLLM server on port 8000, providing the OpenAI compatible `/v1/chat/completions` endpoint to your applications.

### **6\. Validate**

Confirm the deployment by sending a test request to the endpoint and verifying a successful model response.

For the full deployment walkthrough, including Terraform modules, Helm values, and step-by-step instructions, refer to the [AI on EKS Kimi K3 recipe](<https://github.com/awslabs/ai-on-eks/tree/main/infra/solutions/inference-ready-cluster/recipes/kimi-k3>).

# **Invoking the endpoint**

Once deployed, the Kimi K3 endpoint exposes an OpenAI compatible chat completions API. You can invoke it using the OpenAI Python SDK or a simple curl command.

## **Using the OpenAI Python SDK**
    
    
    from openai import OpenAI
    client = OpenAI(
        base_url="http://<ENDPOINT_URL>:8000/v1",
        api_key="not-needed"
    )
    
    
    response = client.chat.completions.create(
        model="Kimi-K3",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Explain the benefits of mixture of experts architectures."}
        ],
        temperature=0.7,
        max_tokens=1024
    )
    print(response.choices[0].message.content)

## **Using curl**
    
    
    curl -X POST http://<ENDPOINT_URL>:8000/v1/chat/completions \
      -H "Content-Type: application/json" \
      -d '{
        "model": "Kimi-K3",
        "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Explain the benefits of mixture of experts architectures."}
        ],
        "temperature": 0.7,
        "max_tokens": 1024
      }'

Replace `<ENDPOINT_URL>` with the service endpoint exposed by your HyperPod Inference Operator or EKS ingress configuration.

# Clean up

To avoid ongoing charges, delete the resources you created during this walkthrough when you no longer need them.For SageMaker HyperPod deployments:

  1. Delete the `InferenceEndpointConfig` by running `kubectl delete -f kimi-k3.yaml`.
  2. In the SageMaker AI console, navigate to HyperPod Clusters, select your cluster, and choose Delete.
  3. Release or cancel your Flexible Training Plan reservation if it is no longer needed.



For Amazon EKS deployments:

  4. Delete the vLLM deployment and associated Kubernetes services.
  5. Terminate the GPU node group or delete the EKS cluster using Terraform (`terraform destroy`).
  6. Release your Capacity Block reservation if it has not yet expired.
  7. For pricing details on p6-b300 instances and Capacity Block reservations, refer to the Amazon EC2 pricing page.



# **Conclusion**

Kimi K3 represents a new frontier in open-weight model capabilities, and AWS provides the infrastructure and managed services to deploy it at scale. Whether you choose the streamlined HyperPod Inference Operator path or the flexibility of a self-managed EKS cluster, the combination of p6-b300 GPU instances, vLLM serving, and MXFP4 quantized weights delivers a deployment with built-in health checks, auto-recovery, and endpoint readiness verification for the world’s largest open model.To get started, here are some links

  1. [SageMaker HyperPod Kimi K3 Example](<https://github.com/aws-samples/sagemaker-genai-hosting-examples/blob/main/SageMakerHyperpod/kimi-k3/kimi-k3.yaml>)
  2. [AI on EKS Kimi K3 Recipe](<https://github.com/awslabs/ai-on-eks/tree/main/infra/solutions/inference-ready-cluster/recipes/kimi-k3>)
  3. [Creating a SageMaker HyperPod Cluster (AWS Documentation)](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-eks-operate-console-ui-create-cluster.html>)
  4. [Kimi K3 on Hugging Face](<https://huggingface.co/moonshotai/Kimi-K3>)
  5. [vLLM Documentation](<https://docs.vllm.ai/>)



* * *

## About the authors

Andrew Smith is a Sr. Cloud Support Engineer in the SageMaker, Vision & Other team at AWS, based in Sydney, Australia. He supports customers using many AI/ML services on AWS with expertise in working with Amazon SageMaker. Outside of work, he enjoys spending time with friends and family as well as learning about different technologies.

Erez Zarum is a Senior Startups Solutions Architect at AWS. Erez is passionate about Containers and the AI/ML landscape, and his unique approach empowers Startups to accelerate AI/ML workloads on Amazon EKS.

[Vivek Gangasani](<https://www.linkedin.com/in/vivekgangasani/>) is a Worldwide Leader for Solutions Architecture, SageMaker Inference. He leads Solution Architecture, Technical Go-to-Market (GTM) and Outbound Product strategy for SageMaker Inference. He also helps enterprises and startups deploy and optimize  a GenAI models and build AI workflows with SageMaker and GPUs. Currently, he is focused on developing strategies and content for optimizing inference performance and use-cases such as Agentic workflows, RAG etc. In his free time, Vivek enjoys hiking, watching movies, and trying different cuisines
