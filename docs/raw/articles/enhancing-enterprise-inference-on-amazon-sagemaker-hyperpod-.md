---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/enhancing-enterprise-inference-on-amazon-sagemaker-hyperpod-with-data-capture-hugging-face-nvme-and-route-53-integration
ingested: 2026-07-10
feed_name: AWS China ML
source_published: 2026-07-09
sha256: 6cbbf1aa3b514fb3bb0c342d2d8b89f46bc2f5de7e00a21ce15917540fe192f3
---

# Enhancing enterprise inference on Amazon SageMaker HyperPod with data capture, Hugging Face, NVMe, and Route 53 integration

As enterprises scale their generative AI workloads, the demand for faster, more observable, and more flexible inference infrastructure continues to grow. Amazon SageMaker HyperPod is rising to meet that challenge with a set of new capabilities designed to streamline how organizations deploy and operate large models in production. Teams can now record inputs and outputs at multiple points along the inference path: from the endpoint, to the load balancer, to the model pod itself. This provides deep observability and auditability through declarative custom resource definition (CRD) configuration. You can also deploy models directly from popular community hubs without the need to pre-stage weights in object or file storage, with built-in support for gated access, revision pinning, and token isolation across leading inference runtimes such as vLLM, TGI, and SGLang.

Beyond deployment, these enhancements deliver meaningful performance and security gains. Loading weights from node-local NVMe storage reduces cold-start latency, with automatic fallback to cloud storage when needed. HyperPod automatically manages custom domain DNS records for you, while granular pod-level AWS Identity and Access Management (IAM) permissions give infrastructure teams fine-grained control over security boundaries. Together, these capabilities create a more performant, secure, and enterprise-ready inference experience on HyperPod. Teams can ship AI applications faster without compromising on governance or operational visibility.

_Inference on Amazon SageMaker HyperPod_

## Inference data capture

With Amazon SageMaker HyperPod inference data capture, you can record inference request and response data for model monitoring, debugging, and model improvement. Inference requests flow from the Amazon SageMaker AI endpoint to the Application Load Balancer and then to the model pod. You independently control and configure data capture at each level, giving you flexibility to choose the right depth of visibility for your use case.

### Prerequisite

The following are prerequisites before you enable the data capture feature.

  * You need an Amazon Simple Storage Service (Amazon S3) bucket (using a URI like s3://amzn-s3-demo-bucket or s3://amzn-s3-demo-bucket/prefix) and the right IAM permissions for the operator to write to it. If you don’t provide one, the system uses the TLS certificate bucket instead.
  * Each tier has its own required settings. For the SageMaker Endpoint level, turn it on, set a destination S3 URI, pick at least one capture option (input, output, or both), and choose a sampling percentage. For the Load Balancer level, enable it with an s3:// URI. For the Model Pod level, enable it. It defaults to capturing both input and output at 100 percent sampling.
  * While not required, we recommend that you add an AWS Key Management Service (AWS KMS) key so you can encrypt your captured data. You can also fine-tune the buffer settings (batch size and flush interval) and set up content-type headers for CSV/JSON handling along with payload size limits.



### Capture tiers

Data capture supports three tiers, each capturing at a different point in the request flow. You can enable any combination:

  * **Tier 1 – SageMaker AI endpoint** ({s3Uri}/{hash}/sme/): Captures full input and output payloads at the SageMaker AI Runtime API boundary. This tier requires you to register the endpoint. Use Tier 1 when you need compatibility with SageMaker AI Model Monitor.
  * **Tier 2 – Application Load Balancer** ({s3Uri}/{hash}/alb/): Turns on ALB access logs, which capture request metadata such as client IPs, request paths, and latencies.
  * **Tier 3 – Model pod** ({s3Uri}/{hash}/pod/): Captures full inference input and output payloads at the inference container with configurable sampling, buffering, and payload size limits. Works without SageMaker AI endpoint registration. Use Tier 3 when you need the deepest visibility closest to the model.



### Configuring data capture

Enable data capture by adding a dataCapture section to your InferenceEndpointConfig or JumpStartModel CRD. The following example shows the overall structure with all three tiers enabled:
    
    
    dataCapture:
      s3Uri: s3://amzn-s3-demo-bucket/captures/  # Optional. Defaults to TLS bucket.
      sagemakerEndpoint:
        enabled: true
        initialSamplingPercentage: 100
        kmsKeyId: arn:aws:kms:us-east-2:123456789012:key/my-key-id
        captureOptions:
          - captureMode: Input
          - captureMode: Output
        captureContentTypeHeader:
          jsonContentTypes:
            - application/json
      loadBalancer:
        enabled: true
      modelPod:
        enabled: true
        initialSamplingPercentage: 100
        kmsKeyId: arn:aws:kms:us-east-2:123456789012:key/my-key-id
        captureOptions:
          - captureMode: Input
          - captureMode: Output
        bufferConfig:
          batchSize: 100
          flushIntervalSeconds: 60
        payloadConfig:
          maxPayloadSizeKB: 1024

### S3 storage behavior

All tiers write to your Amazon S3 bucket. If you don’t specify an s3Uri, HyperPod stores your data in the TLS certificate bucket under a /data-capture/ prefix by default. Within the bucket, each deployment gets a unique path based on a hash derived from the cluster ARN, namespace, CRD type, and deployment name. The same deployment always generates the same prefix, so data capture artifacts from multiple CRD submissions targeting the same deployment flow to the same S3 subfolder.

### IAM permissions

To enable data capture on existing clusters, add the following S3 permission to your Inference Operator Execution Role:
    
    
    {
      "Sid": "DataCaptureS3Access",
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::hyperpod-tls*/data-capture/*",
      "Condition": {
        "StringEquals": {
          "aws:ResourceAccount": "${aws:PrincipalAccount}"
        }
      }
    }

If you use a customer-managed KMS key, also add:
    
    
    {
      "Sid": "DataCaptureKmsAccess",
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:GenerateDataKey"
      ],
      "Resource": "arn:aws:kms:*:*:key/*",
      "Condition": {
        "StringLike": {
          "kms:ViaService": "s3.*.amazonaws.com",
          "kms:EncryptionContext:aws:s3:arn": "arn:aws:s3:::hyperpod-tls*"
        },
        "StringEquals": {
          "aws:ResourceAccount": "${aws:PrincipalAccount}"
        }
      }
    }

### Best practices

Follow these recommendations to optimize data capture for cost, security, and operational efficiency.

  * Use initialSamplingPercentage to control the volume of captured data. Start with a lower percentage in production and increase as needed.
  * Use payloadConfig.maxPayloadSizeKB (Tier 3) to cap the size of captured payloads and control storage costs.
  * Specify a kmsKeyId for Tier 1 and Tier 3 if your workload requires encryption at rest with your own KMS key.
  * ALB access logs (Tier 2) capture request metadata including URLs and query parameters. Use POST request bodies rather than query parameters for sensitive inputs.



To disable data capture for a tier, set its enabled field to false or remove the tier section from your CRD. To disable all data capture, remove the dataCapture section entirely.

For more information, see [Data capture for inference on HyperPod](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-model-deployment-data-capture.html>).

## Hugging Face model source

Deploy models directly from Hugging Face Hub without pre-staging to Amazon S3 or Amazon FSx. This source supports gated models through tokenSecretRef, revision pinning through commitSHA, and token isolation. It is compatible with vLLM, TGI, and SGLang runtimes. See [Deploy models from Amazon S3, Amazon FSx, or Hugging Face Hub using kubectl](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-model-deployment-deploy-ftm.html>) for details. For the Hugging Face source, the Inference Operator emits Kubernetes events for any failures or success states to track the status of the deployment.

### Prerequisites

To deploy Hugging Face models, you must provide the following prerequisite fields based on the model chosen.

  * Provide a valid `modelId`.
  * A Kubernetes Secret with your Hugging Face token (for gated models).
  * A GPU-enabled worker with a volume mount for the weights you download.



### Steps to deploy a Hugging Face model

  1. Create a Kubernetes Secret containing your Hugging Face API token. You need this token for gated models and should use it for all downloads. You can generate a token at [huggingface.co/settings/tokens](<https://huggingface.co/settings/tokens>). 
         
         kubectl create secret generic hf-token-secret --from-literal=token=hf_YOUR_TOKEN_HERE \
           -n $CLUSTER_NAMESPACE

  2. Set up a SageMaker endpoint name. 
         
         export SAGEMAKER_ENDPOINT_NAME="mistral7b-hf"

  3. Construct the following sample YAML. For the entire deployment YAML, see the Hugging Face section in [Deploy models from Amazon S3, Amazon FSx, or Hugging Face Hub using kubectl](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-model-deployment-deploy-ftm.html>)
         
         modelName: mistral-7b
         modelSourceConfig:
           modelSourceType: huggingface
           prefetchEnabled: true
           huggingFaceModel:
             modelId: "mistralai/Mistral-7B-Instruct-v0.3"
             tokenSecretRef:
               name: hf-token-secret
               key: token
         instanceType: "ml.g5.24xlarge"

  4. Deploy the YAML file with the kubectl command: 
         
         kubectl apply -f deploy_hf_inference.yaml

  5. Check if the model successfully deployed and endpoint created successfully. 
         
         kubectl describe InferenceEndpointConfig $SAGEMAKER_ENDPOINT_NAME -n $CLUSTER_NAMESPACE
         kubectl describe SageMakerEndpointRegistration $SAGEMAKER_ENDPOINT_NAME -n $CLUSTER_NAMESPACE

  6. To check the status of the deployment and debug errors check the Kubernetes events 
         
         kubectl get events -n $CLUSTER_NAMESPACE

  7. Test the deployed endpoint to verify it’s working correctly. This step confirms that your model is successfully deployed and can process inference requests. 
         
         aws sagemaker-runtime invoke-endpoint \
           --endpoint-name $SAGEMAKER_ENDPOINT_NAME \
           --content-type "application/json" \
           --body '{"inputs": "What is AWS SageMaker?"}' \
           --region $REGION \
           --cli-binary-format raw-in-base64-out \
           /dev/stdout




## Route 53 DNS management

You can automatically create and manage DNS records for custom domains through dnsConfig. For more information, see Custom certificates and Route 53 DNS management for HyperPod Inference.

Amazon SageMaker HyperPod inference now integrates with Amazon Route 53 to automatically create and manage DNS records for your inference endpoints. Specify a hosted zone ID in your CRD and the operator handles record creation, updates, and cleanup for your custom domain.

### Prerequisites

Before configuring Route 53 DNS management, make sure you have the following:

  * An AWS Certificate Manager (ACM) certificate in the Issued state covering your domain.
  * A Route 53 hosted zone for your domain.



### IAM permissions

Add the following permissions to your Inference Operator execution role:
    
    
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "ACMCustomCertificateAccess",
          "Effect": "Allow",
          "Action": [
            "acm:DescribeCertificate",
            "acm:GetCertificate"
          ],
          "Resource": "arn:aws:acm:<region>:<account-id>:certificate/*"
        },
        {
          "Sid": "S3CertificateUpload",
          "Effect": "Allow",
          "Action": [
            "s3:PutObject",
            "s3:PutObjectTagging"
          ],
          "Resource": "arn:aws:s3:::<tls-certificate-bucket>/*",
          "Condition": {
            "StringEquals": {
              "s3:RequestObjectTag/CreatedBy": "HyperPodInference"
            }
          }
        },
        {
          "Sid": "Route53DNSManagement",
          "Effect": "Allow",
          "Action": [
            "route53:GetHostedZone",
            "route53:ListResourceRecordSets",
            "route53:ChangeResourceRecordSets"
          ],
          "Resource": "arn:aws:route53:::hostedzone/<hosted-zone-id>"
        }
      ]
    }

Replace `<region>`, `<account-id>`, `<tls-certificate-bucket>`, and `<hosted-zone-id>` with your actual values. If your S3 bucket name starts with `hyperpod-tls`, the S3 permissions are already included in the `AmazonSageMakerHyperPodInferenceAccess` managed policy and you only need the ACM and Route 53 statements.

### Configuring DNS management

Enable Route 53 DNS management by adding tlsConfig and dnsConfig to your model deployment YAML:
    
    
    tlsConfig:
      customCertificateConfig:
        acmArn: arn:aws:acm:us-west-2:123456789012:certificate/abc12345-1234-1234-1234-abc123456789
        domainName: api.example.com
        tlsCertificateOutputS3Uri: s3://my-tls-bucket
    dnsConfig:
      hostedZoneId: Z1234567890ABC

The domainName must match a domain in your ACM certificate. For wildcard certificates (for example, `*.example.com`), specify the specific subdomain (for example, `api.example.com`).

### Verify DNS status
    
    
    kubectl describe InferenceEndpointConfig my-model -n my-namespace

Check the dnsStatus section:
    
    
    Status:
      Dns Status:
        Managed By Operator: true
        Record Name: api.example.com
        Hosted Zone Id: Z1234567890ABC
        Dns Health: Active
        Message: DNS record resolves successfully

After DNS health shows Active, you can access your endpoint at your custom domain.

For more information about custom domains and TLS configuration, see [Custom certificates and Route 53 DNS management for HyperPod Inference](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-model-deployment-custom-certs.html>).

## Local NVMe model deployment

Amazon SageMaker HyperPod supports loading model weights directly from a node’s local NVMe storage instead of pulling them over the network from Amazon S3 or Amazon FSx. When you read weights locally, you remove the network hop during pod startup, which helps you reduce inference pod cold-start time. You can use this approach for autoscaling events, scale-from-zero workloads, and latency-sensitive failovers. Local NVMe instance storage is typically found in P, G, and Trn instance families.

### Prerequisite

Before using local NVMe as a model source, verify the following:

  * Use GPU instances with [local NVMe drives](<https://aws.amazon.com/ec2/instance-types/accelerated-computing/>).
  * Make sure that you pre-populate model weights on the local NVMe storage of your target nodes.



### Steps to deploy model from NVMe

  1. Make sure that you pre-populate model weights on the local NVMe storage of your target nodes.
  2. Construct the following sample YAML. For the entire deployment YAML, see the [Deploy models from local NVMe storage using kubectl](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-model-deployment-deploy-nvme.html>)
         
         spec:
           modelSourceConfig:
             modelSourceType: kubernetesVolume
             kubernetes:
               volumes:
                 - name: model-weights
                   hostPath:
                     path: /opt/dlami/nvme/<YOUR_MODEL>
                     type: Directory
           worker:
             modelVolumeMount:
               name: model-weights
               mountPath: /opt/ml/model

  3. Deploy the YAML file with kubectl command: 
         
         kubectl apply -f deploy_nvme_k8s_volume.yaml

  4. Verify the deployment status: 
         
         kubectl describe InferenceEndpointConfig nvme-k8s-volume -n $CLUSTER_NAMESPACE




## Custom service accounts

By default, inference pods use the namespace’s default ServiceAccount. For workloads that need AWS credentials (such as downloading model weights from S3 in a fallback initContainer), you can assign a custom ServiceAccount with IRSA (IAM Roles for Service Accounts) support.

### Prerequisites

Custom service account support remains off by default. A cluster administrator must enable it before use:
    
    
    helm upgrade hyperpod-inference-operator <CHART_PATH> \
      --set enableCustomServiceAccounts=true \
      --reuse-values

If deployed as an Amazon Elastic Kubernetes Service (Amazon EKS) add-on, update the add-on configuration to include `enableCustomServiceAccounts: true` in the advanced configuration settings.

### Steps to set up a custom service account

  1. Create a Kubernetes ServiceAccount annotated with your IRSA role ARN: 
         
         kubectl create sa my-inference-sa -n my-namespace
         
         kubectl annotate sa my-inference-sa -n my-namespace \
           eks.amazonaws.com/role-arn=arn:aws:iam::<ACCOUNT_ID>:role/<ROLE_NAME>

The specified ServiceAccount provides permissions to all containers in the inference pod (worker, init containers, and sidecars). When you annotate the ServiceAccount with `eks.amazonaws.com/role-arn`, the pod can obtain temporary credentials for that IAM role.

  2. Label the Service Account as user-assignable. Only ServiceAccounts with the user-assignable label can be referenced by inference endpoints. This is a security control to prevent unauthorized privilege escalation: 
         
         kubectl label serviceaccount my-inference-sa \
           sagemaker.amazonaws.com/user-assignable=true \
           -n my-namespace

Only cluster administrators should add or remove this label. Use Kubernetes RBAC to restrict who can modify ServiceAccount labels in your namespace.

  3. Reference in InferenceEndpointConfig. Add the serviceAccountName field under spec.kubernetes of InferenceEndpointConfig CRD: 
         
         apiVersion: inference.sagemaker.aws.amazon.com/v1
         kind: InferenceEndpointConfig
         metadata:
           name: my-inference-endpoint
           namespace: my-namespace
         spec:
           kubernetes:
             serviceAccountName: my-inference-sa




### Validation rules

The operator validates the ServiceAccount on create and update. The operator rejects deployment with DeploymentFailed status if:

  * The ServiceAccount doesn’t exist in the namespace.
  * The ServiceAccount is missing the `sagemaker.amazonaws.com/user-assignable=true` label.
  * The ServiceAccount references the operator’s own system ServiceAccount.



### Security best practices

  * Create a dedicated ServiceAccount per inference workload. Don’t reuse across unrelated workloads.
  * Scope IRSA IAM roles to the specific S3 bucket and prefix containing your model weights. Avoid broad policies like AmazonS3FullAccess.
  * Periodically audit which ServiceAccounts carry the user-assignable label.
  * For S3/FSx model sources, the operator provisions storage automatically without requiring a custom service account.



## Conclusion

In this post, we walked through five capabilities now available in SageMaker HyperPod inference: multi-tier data capture for auditing and model improvement, direct deployment from Hugging Face Hub, local NVMe model loading for faster cold starts, automated Route 53 DNS for custom domains, and pod-level IAM through custom service accounts. These features provide additional tools and automation to support your workflow from model deployment to production. To get started, update your Inference Operator to v3.2 and try adding a `dataCapture` or `dnsConfig` section to an existing deployment. For full configuration references, see the linked documentation in each preceding section.

* * *

## About the authors

### Vinay Arora

Vinay is a Specialist Solution Architect for Generative AI at AWS, where he collaborates with customers in designing cutting-edge AI solutions leveraging AWS technologies. Prior to AWS, Vinay has over two decades of experience in finance—including roles at banks and hedge funds—he has built risk models, trading systems, and market data platforms. Vinay holds a master’s degree in computer science and business management.

### Piyush Daftary

[Piyush](<https://www.linkedin.com/in/raftaar/>) is a Sr. Software Engineer at AWS, where he builds inference systems for large language models on Amazon SageMaker HyperPod. He focuses on optimized routing, disaggregated serving, and autoscaling architectures that help customers extract maximum performance from their GPU fleets. His background spans distributed systems, databases, and search technologies. Outside of work, he enjoys traveling and spending time with family.

### Shreya Gangishetty

[Shreya](<https://www.linkedin.com/in/shreyagangishetty/>) is a Software Development Engineer at AWS, working on Amazon SageMaker with a focus on building scalable inference systems for large-scale AI workloads. She is passionate about developing reliable, high-performance solutions and delivering quality products that accelerate AI adoption through robust infrastructure. Outside of work, she enjoys traveling and cherishing moments with family.

### Ophelia Yang

[Ophelia](<https://www.linkedin.com/in/opheliayang>) is a Software Development Engineer at AWS working on Amazon SageMaker AI. She focuses on building inference infrastructure for SageMaker HyperPod that simplifies how customers deploy and manage AI models. Her background spans ML cluster management, inference systems, and model evaluations.

### Chad Chiang

[Chad](<https://www.linkedin.com/in/chchadchiang/>) is a Software Development Engineer at AWS, working on Amazon SageMaker with a focus on building inference infrastructure for SageMaker HyperPod. He develops the inference operator that enables customers to deploy and manage AI models at scale on Kubernetes, spanning GPU partitioning, intelligent routing, and custom pod configurations. His background spans distributed systems and cloud-native ML infrastructure.
