---
source_url: "https://aws.amazon.com/blogs/machine-learning/monitor-and-debug-generative-ai-inference-with-sagemaker-detailed-metrics-and-insights-dashboard-on-cloudwatch/"
ingested: 2026-06-26
sha256: a32729c4170a0cc4
---

# Monitor and debug generative AI inference with SageMaker detailed metrics and Insights dashboard on CloudWatch

Monitoring and troubleshooting generative AI inference endpoints operating at scale is challenging. When your large language model (LLM) endpoint’s P99 latency spikes, you must determine in minutes whether the root cause is GPU memory pressure, a saturated KV cache, unbalanced traffic across Availability Zones, or an auto scaling policy that hasn’t triggered. The shift from training to serving is reshaping how teams deploy LLMs and other generative AI models in production. Machine learning (ML) platform engineers, MLOps teams, and site reliability engineers (SREs) must keep inference endpoints healthy, responsive, and cost-efficient, often across dozens of models and hundreds of GPU instances.

[Amazon SageMaker AI](<https://aws.amazon.com/sagemaker/ai/>) provides fully managed real-time inference hosting for machine learning models. You deploy a model to a SageMaker endpoint backed by one or more compute instances, and SageMaker handles provisioning and scaling. SageMaker supports multiple endpoint architectures. This post focuses on the two most relevant to generative AI workloads with detailed observability:

  * Single-model endpoints (SME) – Each endpoint hosts one model on dedicated instances. SMEs are straightforward to set up and reason about, but each model requires its own fleet of GPU instances.
  * Inference component (IC) endpoints – Multiple models share the same set of instances through inference components. Each inference component defines a model, its resource requirements (CPU, GPU, memory), and its scaling policy. IC endpoints are the recommended architecture for production generative AI workloads because they support multi-model hosting on shared GPU infrastructure, independent scaling per model, and high availability (HA) through copy distribution across AZs.



SageMaker endpoints emit metrics like invocation counts, model latency, and overhead latency to [Amazon CloudWatch](<https://aws.amazon.com/cloudwatch/>). These aggregate metrics are useful for understanding overall endpoint health. Because teams scale to multi-model deployments on GPU fleets, they need deeper signals. Amazon SageMaker AI now emits over 100 detailed inference metrics. These cover GPU health, token-level latency, KV cache pressure, traffic distribution across AZs, inference component placement, and cold start diagnostics. These metrics flow to a built-in SageMaker Insights dashboard in Amazon CloudWatch, a fully managed observability solution that removes the need for custom Grafana dashboards and Prometheus configuration. The SageMaker Insights dashboard supports both endpoint types and automatically shows IC-specific panels when inference components are detected.

For more details on SageMaker inference, see [Deploy models for real-time inference](<https://docs.aws.amazon.com/sagemaker/latest/dg/realtime-endpoints.html>).

In this post, you will learn how to:

  * Turn on detailed observability metrics on new and existing SageMaker inference endpoints.
  * Navigate the SageMaker Insights dashboard to monitor fleet health across Performance, Capacity, and Reliability views.
  * Connect the metrics to your own observability tool (Grafana, Datadog) through the PromQL-compatible endpoint.



## SageMaker inference observability overview

SageMaker inference endpoints emit native OpenTelemetry metrics to CloudWatch. The SageMaker Insights dashboard is located in the CloudWatch console under Infrastructure Monitoring → SageMaker Insights. It queries these metrics using PromQL and renders visualizations at the fleet, endpoint, and inference-component level across three tabs: Performance, Capacity, and Reliability.

  * **Performance** – Fleet health, token latency, throughput, errors, engine pressure.
  * **Capacity** – GPU, CPU, and memory utilization of the fleet.
  * **Reliability** – Availability Zone distribution, scaling events, cold start anatomy, and insufficient capacity errors.



### Key services

  * **Amazon SageMaker AI** – Managed inference with endpoints and inference components.
  * **Amazon CloudWatch** – Native support for OpenTelemetry metrics and PromQL queries through SageMaker Insights.



For background on the OpenTelemetry and PromQL support in CloudWatch, see [Introducing OpenTelemetry PromQL support in Amazon CloudWatch](<https://aws.amazon.com/blogs/mt/introducing-opentelemetry-promql-support-in-amazon-cloudwatch/>).

## Prerequisites

You must have the following to follow along with this post.

  * An AWS account with at least one SageMaker real-time inference endpoint.
  * AWS Identity and Access Management (IAM) permissions: `sagemaker:CreateEndpointConfig`, `sagemaker:UpdateEndpoint`, and `cloudwatch:GetMetricData`.
  * vLLM or SGLang container framework (required for token-level metrics like TTFT and ITL).



GPU instances receive per-accelerator utilization metrics in addition to the CPU and memory metrics available on all instance types. For the full setup guide, see [Getting started with detailed observability](<https://docs.aws.amazon.com/sagemaker/latest/dg/monitoring-detailed-observability-getting-started.html>).

## Activate detailed metrics on your endpoints

### New endpoints: Automatic (default-on)

For any new endpoint configurations you create, detailed metrics are turned on by default. The `EnableDetailedObservability` parameter in your endpoint configuration defaults to `true`. No additional code is required.
    
    
    import boto3
    
    sm = boto3.client("sagemaker")
    
    # Create endpoint config — observability turned on by default
    response = sm.create_endpoint_config(
        EndpointConfigName="my-llm-config",
        ProductionVariants=[{
            "VariantName": "primary",
            "InstanceType": "ml.g6.4xlarge",
            "InitialInstanceCount": 2,
            "ManagedInstanceScaling": {
                "Status": "ENABLED",
                "MinInstanceCount": 2,
                "MaxInstanceCount": 8
            }
        }],
        ExecutionRoleArn="arn:aws:iam::123456789012:role/SageMakerExecutionRole"

The `EnableDetailedObservability` flag in your endpoint configuration defaults to `true`, so no additional configuration is needed. You can also explicitly set the publishing frequency using `MetricsPublishFrequencyInSeconds` in `MetricsConfig`. The default is 60 seconds. For workloads that need near real-time monitoring, you can set it to less than a minute.
    
    
    # Create endpoint
    sm.create_endpoint(
        EndpointName="my-llm-endpoint",
        EndpointConfigName="my-llm-config"
    )

Within 2 minutes of the endpoint reaching `InService`, the OpenTelemetry format metrics begin flowing to CloudWatch.

### Existing endpoints: Opt-in

Existing endpoints require an explicit opt-in. Create a new endpoint configuration with the `MetricsConfig` flag, then update your endpoint. This follows the same pattern as any endpoint configuration change.
    
    
    # Step 1: Create new config with detailed observability turned on
    sm.create_endpoint_config(
        EndpointConfigName="my-existing-config-v2",
        ProductionVariants=[{
            "VariantName": "primary",
            "ModelName": "my-existing-model",
            "InstanceType": "ml.g6.4xlarge",
            "InitialInstanceCount": 2
        }],
        MetricsConfig={"EnableDetailedObservability": True},
        ExecutionRoleArn="arn:aws:iam::123456789012:role/SageMakerExecutionRole"
    )
    
    # Step 2: Update endpoint
    sm.update_endpoint(
        EndpointName="my-existing-endpoint",
        EndpointConfigName="my-existing-config-v2"
    )

The SageMaker console also provides a guided three-step wizard after you choose **Enable detailed observability** : learn about the metrics, turn on OTel enrichment, and select which endpoints to opt in.

### Enable OTel enrichment for classic CloudWatch metrics

Native OpenTelemetry metrics flow automatically to CloudWatch after enablement. However, existing classic metrics (Invocations, ModelLatency, OverheadLatency) require OTel enrichment to be visible in the SageMaker Insights dashboard and queryable with PromQL.

Navigate to **CloudWatch Console** then **Settings** and turn on **OTel metric enrichment** and **Resource tags for telemetry**. This is a one-time, account-level and AWS Region-level setting.

## Navigate to the SageMaker Insights dashboard from the SageMaker console

You can access the SageMaker Insights dashboard through either the SageMaker console or the CloudWatch console. Within SageMaker, there are three entry points, each pre-filtered to their context:

**#** | **Entry Point** | **Filter Applied** | **Use Case**  
---|---|---|---  
1 | Endpoints list page → “Open SageMaker Insights” | Fleet-level (all endpoints) | “Give me the big picture”  
2 | Endpoint detail page → “View in SageMaker Insights” | Filtered to that endpoint | “Drill into this specific endpoint”  
3 | IC tab → per-IC “Metrics” link | Filtered to endpoint + IC | “Debug this inference component”  
  
Every path deep-links with pre-applied filters, so you won’t land on a blank dashboard searching for your resources.

## Performance tab: Monitoring fleet health and debugging latency

The Performance tab is where most customers spend their time. It answers questions like “Is everything running well?” and “If not, which component is the problem?” The Performance tab includes several time-series panels that work together to pinpoint latency issues.

### Performance health and instance performance table

Color-coded hexagons visualize every resource in your fleet. Toggle between Instances, IC Copies, and Endpoints views. The hexagon color indicates state:

  * Green for OK.
  * White for no alarms detected.
  * Red for in alarm.



Hover over any hexagon to see instance type, TTFT, output TPS, concurrent requests, KV cache utilization, and CloudWatch alarm status. Choose **Filter by this instance** to drill down. Every panel on the page updates to show only that instance’s data.

The table shows every instance with performance metrics side-by-side. Use this table to spot outliers in TTFT, output TPS, and concurrent requests. The TTFT, Output TPS, Concurrent Requests, and KV Cache columns show data emitted by the vLLM and SGLang frameworks only.

The **Token streaming panel** plots Time to First Token (TTFT) and Inter-Token Latency (ITL) over time with a P50/P99 toggle. TTFT measures how long users wait before seeing the first response character. ITL measures time between consecutive tokens, which directly affects streaming smoothness. You can filter by endpoint, inference component name, or model to isolate which component contributes to latency.

When you identify a TTFT spike, the **Latency breakdown panel** helps you attribute it. This panel separates total latency into Model Latency (time the model spends processing) and Overhead Latency (time the platform spends routing and scheduling). An Invoke tab shows the full request path, and a Streaming tab shows time-to-first-chunk specifically. If both Model Latency and Overhead Latency are normal but TTFT is still elevated, the model’s inference engine might be holding requests in its internal queue, for example, waiting for KV cache slots. Check the **Engine and request pressure panel** to confirm.

The **Traffic distribution panel** shows per-instance or per-inference-component request flow with Availability Zone filtering. Toggle the AZ dropdown to isolate traffic by zone. If one AZ shows zero traffic while others are loaded, that indicates a routing or placement issue. You can use the instance/IC toggle to switch between “Which machines handle traffic?” and “Which models handle traffic?” views.

Finally, the **Token throughput panel** measures actual tokens processed per second, broken down by input/output, percentiles, or by instance. This directly measures inference efficiency. For example, if your `ml.g6.4xlarge` delivers 150 tokens per second output when the model benchmark shows 500, that indicates a resource constraint, configuration issue, or KV cache pressure. The multi-framework legend (SGLang, vLLM, DJL) lets multi-model endpoints compare throughput across inference engines.

### Engine and request pressure

The Engine and request pressure panel is your early warning system for preventing outages.

The time-series view shows the per-framework breakdown, with tooltips that show exact values at any timestamp. If you see KV cache repeatedly climbing to 40–50 percent during business hours, configure autoscaling to trigger at a threshold value before customers feel the impact.

## Capacity tab: Planning deployments and resource management

The Capacity tab answers questions like “Do I have enough resources?”, “Where is there headroom?”, and “Can I fit another model?”

### Capacity health

The same honeycomb visualization from Performance reappears here, with **resource utilization percentages** in the hover card: GPU, GPU memory, CPU, CPU memory, and Disk.

Before you deploy a new model or scale copies, hover over instances in your target endpoint. If GPU memory is at 89 percent, there’s limited VRAM headroom for additional model weights.

### Fleet utilization over time

This panel shows resource consumption trends with toggles for **Instance** , **IC copies** , and **Endpoint** aggregation. Key signals include the following:

  * GPU Memory trending upward over days indicates that you’re approaching capacity limits. Add instances before utilization reaches the limit.
  * GPU Memory dropping suddenly indicates that a model crashed or was unloaded. Investigate.
  * Disk spikes that recur periodically correlate with model downloads during cold starts.



## Reliability tab: Supporting high availability and resilience view

The Reliability tab answers questions like “If an AZ goes down, will my inference fleet survive?”, “Are scaling events working?”, and “Why are cold starts slow?”

### Availability Zone distribution

A bar chart shows instance and IC copy counts per AZ. This view shows your high availability posture.

**Distribution** | **Risk** | **Action**  
---|---|---  
Even across over 3 AZs | Low | No action  
Concentrated in 1-2 AZs | Medium | Rebalance  
0 instances in any AZ | High | Single AZ failure takes you offline  
  
Toggle between **Instances** and **IC Copies**. Instances might be balanced, but IC copies could be concentrated on a few machines.

### Cold start anatomy

Every IC provisioning event displayed as a horizontal stacked bar with four phases:

**Phase** | **Color** | **What it measures** | **Optimization**  
---|---|---|---  
Model download | Blue | Pull model weights from Amazon Simple Storage Service (Amazon S3) | Compress artifacts, use Amazon Elastic File System (Amazon EFS) caching  
GPU load | Purple | Load weights onto GPU | Smaller quantization, pre-warming  
Container start | Orange | Container initialization | Reduce dependencies  
  
In the screenshot, `gma-ic-vllm` took 237.6 seconds, with model download dominating, while `gma-rblk-ic-tiny` was only 41.4 seconds because it’s a smaller model. This view tells you which phase to optimize for faster scaling response times.

### ICE diagnostics

The ICE diagnostics view tracks insufficient capacity errors (ICE), which occur when SageMaker can’t provision requested instances. The table shows:

  * **When** the failure occurred.
  * **Which endpoint** was affected (deep-links to the console).
  * **Which instance type** was unavailable.
  * **Which AZ** had no capacity.



In the preceding screenshot, all 12 ICE events are for `p5.48xlarge` across all four AZs, indicating complete regional exhaustion for this instance type. You now know to switch to [other instance types as a fallback](<https://docs.aws.amazon.com/sagemaker/latest/dg/realtime-endpoints-heterogeneous.html>).

## Connect to your own observability tool

For teams with existing Grafana or other PromQL-compatible tools, you can query SageMaker Insights metrics directly from your platform without switching to the CloudWatch console. The following walkthrough demonstrates the setup using Grafana. The same steps apply to self-hosted Grafana or other compatible tools, with minor configuration differences.

### Step 1: Get the PromQL endpoint URL

Navigate to SageMaker Console, then select **Endpoints**. From there, select your endpoint and then choose **Connect to your observability tool**. Copy the displayed endpoint URL. It follows the format shown in the SageMaker console.

### Step 2: Configure your Grafana data source

In Amazon Managed Grafana (Classic CloudWatch 2.4+) or self-hosted Grafana with the Amazon Managed Service for Prometheus plugin (v3.0.0+):

  * Navigate to Configuration, Data Sources, then Add data source. Select **Amazon Managed Service for Prometheus** and set the URL to the PromQL endpoint URL from Step 1.
  * Under **Service Provider** , enter `monitoring`.
  * Configure SigV4 authentication with an IAM role that has the `cloudwatch:GetMetricData` and `cloudwatch:ListMetrics` permissions.
  * Choose **Save & Test**. You should see **Data source is working**.



### Step 3: Import the pre-built dashboard template

Download the dashboard template JSON from the same **Connect to your observability tool** page in the SageMaker console. Import the downloaded JSON template into Grafana (Dashboards → Import), select the Prometheus data source you configured in Step 2, and you get pre-configured Performance, Capacity, and Reliability panels matching the SageMaker Insights layout.

### Step 4: Query metrics with PromQL

With the data source connected, you can write custom PromQL queries. For example:
    
    
    KV cache
    vllm:kv_cache_usage_perc{"aws.sagemaker.endpoint.name"="ep-prsn-ic","aws.sagemaker.inference_component.name"="ic-qwen3-4b"}
    
    # Active requests
    vllm:num_requests_running{"aws.sagemaker.endpoint.name"="ep-prsn-ic","aws.sagemaker.inference_component.name"="ic-qwen3-4b"}
    
    # TTFT P99
    histogram_quantile(0.99, rate(vllm:time_to_first_token_seconds{"aws.sagemaker.endpoint.name"="ep-prsn-ic","aws.sagemaker.inference_component.name"="ic-qwen3-4b"}[5m]))

## Pricing

SageMaker doesn’t charge separately for emitting detailed observability metrics. The metrics are published to Amazon CloudWatch in OpenTelemetry data format, and standard CloudWatch OpenTelemetry ingestion pricing applies. OpenTelemetry metrics ingested into CloudWatch are charged at $0.50 per GB ingested. If you turn on OTel vended metric enrichment (required to view classic CloudWatch metrics like Invocations and ModelLatency in the Insights dashboard), enriched metrics are also charged at $0.50 per GB. For detailed pricing examples and a cost calculator, see the OpenTelemetry Metrics section on the [Amazon CloudWatch pricing page](<https://aws.amazon.com/cloudwatch/pricing/>).

## Clean up

To avoid ongoing charges, delete test resources in this order:
    
    
    # Delete inference components first (if IC endpoint)
    aws sagemaker delete-inference-component --inference-component-name my-ic
    
    # Delete endpoints
    aws sagemaker delete-endpoint --endpoint-name my-endpoint
    
    # Wait for deletion, then delete configs
    aws sagemaker delete-endpoint-config --endpoint-config-name my-config

GPU instances are billed per second while endpoints are `InService`. Delete promptly after testing.

## Conclusion

In this post, you enabled SageMaker detailed metrics on inference endpoints and used the built-in SageMaker Insights dashboard to monitor fleet health, debug latency using token-level metrics, validate high availability, and plan capacity for new deployments.

To get started, see the following resources:

  * [Activate detailed observability on your endpoints](<https://docs.aws.amazon.com/sagemaker/latest/dg/monitoring-cloudwatch-detailed-observability.html>). Follow the step-by-step guide to create an endpoint configuration with detailed metrics and verify data is flowing to CloudWatch.
  * [Navigate the SageMaker Insights dashboard](<https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/sagemaker-insights.html>). Learn how to use the Performance, Capacity, and Reliability tabs to monitor fleet health and drill into instance-level data.
  * [Connect your Grafana workspace through the PromQL endpoint](<https://docs.aws.amazon.com/sagemaker/latest/dg/monitoring-detailed-observability-promql.html>). Add the CloudWatch PromQL endpoint as a Prometheus data source and import the pre-built dashboard template.



## Acknowledgments

The SageMaker Insights dashboard and detailed observability metrics are the result of close collaboration between the Amazon SageMaker AI and Amazon CloudWatch teams. We thank the engineering, product, and solutions architecture teams whose work made this launch possible.

We also thank the following contributors for their review and inputs on this blog post:

  * Felipe Lopez – Principal GenAI/ML Architect, AWS
  * Sandeep Raveesh-Babu – Sr. Worldwide Specialist SA, GenAI, AWS
  * Johna Liu – Sr. Software Development Engineer, Amazon SageMaker
  * Raviprakash Darbha – Sr. Software Development Engineer, Amazon SageMaker
  * Prajwal Kammardi – Software Development Engineer, Amazon SageMaker
  * Jiaxi Xu – Software Development Engineer, Amazon SageMaker
  * Orcun Berkem – Principal Engineer, Observability, Amazon CloudWatch
  * Steve McCurry – Principal Product Manager, Amazon CloudWatch



* * *

## About the author

### Apoorva Chandra

Apoorva is a Senior Product Manager on the Amazon SageMaker AI Inference team at AWS. She leads the inference observability initiative, focused on helping ML platform teams monitor, debug, and optimize GenAI workloads in production. Prior to SageMaker, she worked with the commercial application team on AWS for modernizing enterprise SAP customers’ journey on AWS. Outside of work, Apoorva enjoys hiking, exploring coffee shops, and spending time with friends.
