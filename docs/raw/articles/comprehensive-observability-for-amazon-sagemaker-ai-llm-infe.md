---
title: "Workflow architecture"
source_url: 
ingested: 
sha256: 0deab48054686913d108d5c0da771dbdbaa995ba190e91e9048dc79023d13231
tags: [rss, article]
---

# Comprehensive observability for Amazon SageMaker AI LLM inference: From GPU utilization to LLM quality

Deploying large language models (LLMs) at scale on [Amazon SageMaker AI Inference](<https://aws.amazon.com/sagemaker/ai/deploy/>) makes observability a critical pillar of any production machine learning (ML) strategy. Unlike conventional software that returns deterministic outputs, LLMs generate variable, free-form responses that are difficult to validate with standard metrics. LLM output quality can change over time as input distributions shift, and quality monitoring helps detect these changes early. For generative AI workloads, observability also includes the model serving infrastructure, where unpredictable token consumption, GPU memory pressure, and latency spikes make capacity planning and cost control a moving target.

A comprehensive observability approach for LLM inference must address two distinct but complementary dimensions: model serving infrastructure (quantity) and LLM quality. Quantity monitoring focuses on the operational health of inference infrastructure, tracking request throughput and resource utilization. These metrics help detect bottlenecks, right-size compute resources, and control costs. Quality monitoring focuses on the performance of the LLMs themselves, evaluating response accuracy, compliance, and consistency over time.

Most teams build LLM observability in stages. The first stage establishes visibility into core operational metrics such as latency, errors, and resource utilization. These signals confirm the reliability of inference endpoints. The next stage adds LLM quality through sampling and evaluation, which surface issues such as model drift, degradation, or unexpected behavior in generated responses.

With both dimensions in place, you can introduce thresholds and automated alerts that combine infrastructure and quality signals. Over time, the practice extends to comparative analysis across models and configurations so you can continuously tune cost, performance, and output quality. Quantity and quality metrics are interdependent: an endpoint can appear operationally healthy while producing poor or unsafe responses, or it can deliver high-quality outputs while running inefficiently on over-provisioned infrastructure. Production-grade LLM observability emerges when both dimensions are monitored, correlated, and optimized together.

This post demonstrates a comprehensive observability solution using [Amazon Managed Grafana](<https://docs.aws.amazon.com/grafana/latest/userguide/what-is-Amazon-Managed-Service-Grafana.html>) dashboards that provides a holistic view of both quality and quantity for LLMs served on Amazon SageMaker AI endpoints with inference components.

## Workflow architecture

For full visibility into LLMs across the two monitoring dimensions of quantity and quality, we built a solution using three core AWS services, each chosen for a specific role in LLM observability. The following high-level data flow diagram shows the three core components: Amazon SageMaker AI endpoints with inference components, Amazon CloudWatch, and Amazon Managed Grafana.

[Amazon SageMaker AI Inference Components](<https://aws.amazon.com/sagemaker/ai/deploy/>) serve as the model hosting layer. A single SageMaker AI endpoint can host multiple inference components, each running a different LLM (for example, `gpt-oss-20b` and `Qwen2.5-7B-Instruct` as shown in the preceding architecture). Inference components let you deploy, scale, and manage multiple models on shared infrastructure while keeping per-model isolation for traffic routing, scaling policies, and metric attribution.

[Amazon CloudWatch](<https://aws.amazon.com/cloudwatch/>) serves as the centralized metrics store. It receives two distinct streams of data from each inference component: enhanced metrics and custom quality metrics. Enhanced metrics are published automatically by SageMaker AI when you enable them on the endpoint configuration. The metrics include instance-level, container-level, and per-GPU dimensions, giving you granular visibility into invocation counts, latency, error rates, and GPU/CPU utilization per model. Enhanced metrics are logged to the `/aws/sagemaker/InferenceComponents/<model-name>` namespace (for example, `/aws/sagemaker/InferenceComponents/gpt-oss-20b`). For details, see the [Amazon SageMaker AI enhanced metrics documentation](<https://docs.aws.amazon.com/sagemaker/latest/dg/monitoring-cloudwatch-enhanced-metrics.html>) and the [enhanced metrics deep-dive blog post](<https://aws.amazon.com/blogs/machine-learning/enhanced-metrics-for-amazon-sagemaker-ai-endpoints-deeper-visibility-for-better-performance/>).

Custom quality metrics capture LLM output quality, such as composite quality scores, safety scores, and evaluation latency. These are published to a separate user-configured CloudWatch namespace at `/aws/sagemaker/inference-quality/<model-name>`, which keeps quality signals cleanly separated from operational metrics. The following table summarizes the two CloudWatch metric namespaces.

**CloudWatch Metric Namespace** | **Captures** | **Purpose**  
---|---|---  
/aws/sagemaker/InferenceComponents/ | Enhanced metrics: instance-level, container-level, and per-GPU dimensions | Provides granular visibility into invocation counts, latency, error rates, and GPU/CPU utilization per model  
/aws/sagemaker/inference-quality/ | Custom quality metrics: composite quality scores, safety scores, and evaluation latency | Captures LLM output quality signals, kept cleanly separated from operational metrics  
  
[Amazon Managed Grafana](<https://docs.aws.amazon.com/grafana/latest/userguide/what-is-Amazon-Managed-Service-Grafana.html>) provides the visualization layer, using [CloudWatch as its native data source](<https://docs.aws.amazon.com/grafana/latest/userguide/using-amazon-cloudwatch-in-AMG.html>). In this post, we describe two dedicated dashboards that surface SageMaker AI endpoint LLM quantity and quality metrics, as shown in the following screenshot.

The Grafana quantity-based dashboard displays GPU memory utilization, CPU usage, and invocation metrics per inference component. The quality-based Grafana dashboard displays composite quality scores, safety scores, and quality evaluation latency, compared across models, as shown in the following image. You can extend the Grafana dashboard by creating new dashboards based on your business or application use cases.

## Monitoring quantity

Quantity monitoring gives you operational visibility into LLMs served on SageMaker AI endpoints. Without it, you can lose track of traffic patterns, resource saturation, cost attribution, and scaling behavior, all of which directly impact availability and spend. For multi-model endpoints using inference components, quantity monitoring answers critical operational questions: `How many requests is each model serving? Are GPUs right-sized or over-provisioned? Which model is driving cost?`

Beyond infrastructure metrics, quantity monitoring helps you assess the operational health and business impact of your LLM inference components across performance and reliability, resource utilization, and any business metrics specific to your organization. Together, these views show where latency is occurring, whether cost increases are driven by traffic growth or inefficient GPU allocation, and whether scaling policies are responding appropriately to demand.

The following Amazon Managed Grafana dashboard samples put these quantity monitoring dimensions into practice across three key areas. The first group of panels covers LLM invocations and latency. As shown in the following sample Grafana dashboard output, panels display Model Latency as a time-series trend, Total Invocations comparing models (for example, gpt-oss versus Qwen), and Per-Copy Invocations broken down for each model. These panels help operators understand request throughput patterns, identify latency spikes, and compare invocation distribution across model copies.

The next panel focuses on GPU compute and memory utilization. The following Grafana dashboard samples present GPU Compute percentage and GPU Memory percentage panels for both the models (for example, Qwen and gpt-oss). This cross-model comparison helps ML engineers and site reliability engineers (SREs) quickly determine whether a performance issue is GPU-compute-bound or memory-limited, and whether one model is consuming disproportionate resources on shared infrastructure.

The third set of panels provides endpoint usage and cost details. The following Cluster Overview and Cost Grafana dashboard sample shows Used GPUs versus Free GPUs and Total Instances to visualize cluster capacity, alongside per-model Cost/hour panels (for example, gpt-oss and Qwen). This view shows which model is driving cost, whether GPUs are over-provisioned or saturated, and whether auto scaling policies are responding to demand.

The following table summarizes the three quantity monitoring areas covered in the Grafana dashboard, along with their associated metrics and purpose:

**Metric Type** | **Dashboard Metric Names** | **Captures** | **Purpose**  
---|---|---|---  
Model Invocations & Latency | Model Latency, Total Invocations (gpt-oss vs Qwen), Per-Copy Invocations (gpt-oss), Per-Copy Invocations (Qwen) | Request throughput, response time, and per-copy invocation distribution | Identify latency spikes, compare model throughput, and understand invocation load balancing across copies  
GPU Compute & Memory Utilization | GPU Compute % (Qwen), GPU Compute % (gpt-oss), GPU Memory % (Qwen), GPU Memory % (gpt-oss) | Per-model GPU compute and memory utilization percentages | Determine if issues are GPU-compute-bound or memory-limited, and detect disproportionate resource consumption across models  
Endpoint Usage & Cost | Used GPUs / Free GPUs / Instances, Cost/hour (gpt-oss), Cost/hour (Qwen) | Cluster capacity, GPU allocation status, and per-model hourly cost attribution | Identify cost drivers, detect over-provisioned or saturated GPUs, and validate auto scaling responsiveness  
  
Together, these dashboards give operators a single pane of glass to correlate cost, capacity, and utilization across models served on the endpoint. To set up these dashboards in your environment, follow the [AWS samples GitHub repository sample notebook](<https://github.com/aws-samples/sample-aiops-on-amazon-sagemakerai/tree/main/monitoring/resource-monitoring-grafana>) and extend the solution to create dashboards tailored to your organization’s requirements.

## Monitoring quality

While quantity metrics tell you whether the LLM serving infrastructure is healthy, quality metrics tell you whether LLMs are still performing as expected. LLM performance can degrade silently over time because of changes in input prompt distributions, concept drift, or shifts in real-world conditions. Unlike a latency spike or a 500 error, quality degradation rarely triggers traditional alerts.

Quality monitoring addresses this by evaluating model outputs across dimensions that matter to the business: response quality (relevance to user queries, factual accuracy, completeness, and consistency), safety and compliance (harmful content detection, bias monitoring, privacy compliance, and regulatory adherence), user experience quality (helpfulness, clarity, appropriate tone, and multi-turn conversation coherence), and domain-specific quality (technical accuracy for specialized domains, citation quality for Retrieval Augmented Generation (RAG) applications, and code correctness for programming assistants). Together, these dimensions help governance teams enforce guardrails, product owners track user-facing quality over time, and data scientists pinpoint whether a quality drop is caused by a specific prompt pattern, a model update, or a data distribution shift.

The following Amazon Managed Grafana dashboard sample output demonstrates quality monitoring across the SageMaker AI endpoint inference components (for example, LLMs `gpt-oss-20b` and `Qwen2.5-7B-Instruct`). The example dashboard tracks four quality scores, each displayed as a time-series line chart with configurable alert thresholds (shown as dashed lines at approximately 85% and 95%). The first panel shows the Composite Quality Score, an aggregate health indicator that combines quality dimensions. This metric displays the overall quality trend over time, making it straightforward to spot sustained degradation versus intermittent quality drops that may correlate with specific prompt types.

The second group of panels tracks specific LLM response quality metrics: Safety Score, Relevance Score, and Professional Tone Score. Safety Score monitors harmful or non-compliant content detection. On the dashboard output, this score remains the most stable of all four metrics, consistently hovering within the target threshold band, which indicates reliable safety guardrails across both models. Relevance Score measures how well LLM responses address user intent, helping teams identify prompt categories that may challenge an LLM’s comprehension. Professional Tone Score evaluates whether outputs maintain an appropriate tone for the deployment context.

These quality scores are computed using evaluation metrics such as an LLM-as-judge pattern with configurable evaluation rubrics. In these examples, we use Anthropic Claude Sonnet 4.6 served via Amazon Bedrock as the evaluator model, which is permitted under standard Amazon Bedrock service terms for LLM-as-judge use cases. You can substitute your own evaluation system, provided you confirm the chosen model’s terms permit evaluating outputs from other models, you verify the data-residency requirements are met, and you pin the evaluator model to a specific version so quality scores remain comparable over time.

At a glance, you can compare quality across LLMs side by side, identifying which LLM is more stable, which quality dimension is the primary risk driver, and whether quality issues are intermittent (suggesting sensitivity to specific prompt types) or sustained (suggesting model degradation). Beyond visualization, threshold-based alert rules are deployed automatically via Grafana Alerting, dimensioned by the inference component so that alerts fire per inference component. When a quality score breaches its configured threshold, you can receive these notifications via Amazon Simple Notification Service (Amazon SNS), enabling rapid SRE triage. Modern SRE teams use their existing automated triage processes, for example by integrating these alerts with Slack, PagerDuty, or OpsGenie to cut response times to seconds by automatically correlating logs, classifying alert severity, and prioritizing incidents for mitigation.

The following Grafana Alerting dashboard sample output shows threshold-based alert rules firing per inference component, with notifications routed to configured channels for immediate SRE triage.

This view gives governance and product teams the evidence needed to make decisions about engineering adjustments, remediation actions, root cause analysis, model swapping, or other refinements. To set up this dashboard in your environment and learn more about the quality metrics, follow the [AWS samples GitHub repository notebook](<https://github.com/aws-samples/sample-aiops-on-amazon-sagemakerai/tree/main/monitoring/quality-monitoring-with-grafana>).

## Conclusion

Observability of LLM inference stacks in production requires more than tracking uptime and error rates. As this post demonstrated, a comprehensive strategy must address two complementary dimensions: quantity and quality. Quantity covers the operational health of your infrastructure, including GPU utilization, cost attribution, scaling behavior, and request throughput. Quality covers the ongoing performance of your models, including response relevance, safety compliance, factual accuracy, and professional tone.

By combining Amazon SageMaker AI endpoint enhanced metrics, Amazon CloudWatch, and Amazon Managed Grafana, you can build a unified observability layer without custom instrumentation. Enhanced metrics give you per-model, per-GPU granularity on shared infrastructure. CloudWatch provides a single metrics store for both operational and quality signals. Grafana brings it together in dashboards that serve different stakeholders: SREs monitoring resource saturation and scaling, governance teams tracking safety and compliance thresholds, and product owners comparing model quality side by side.

To get started, check out the [AWS samples GitHub repository](<https://github.com/aws-samples/sample-aiops-on-amazon-sagemakerai/tree/main>), which includes sample notebooks to [configure enhanced metrics](<https://github.com/aws-samples/sample-aiops-on-amazon-sagemakerai/blob/main/monitoring/resource-monitoring-grafana>), [publish custom quality metrics and alerts](<https://github.com/aws-samples/sample-aiops-on-amazon-sagemakerai/blob/main/monitoring/quality-monitoring-with-grafana>), and set up the Grafana dashboards shown in this post.

* * *

## About the authors

### Sandeep Raveesh-Babu

Sandeep is a GenAI GTM Specialist Solutions Architect at AWS. He works with customers through their LLM training, LLM inference, and GenAI observability. He focuses on product development helping AWS build and solve industry challenges in the generative AI space. You can connect with Sandeep on [LinkedIn](<https://www.linkedin.com/in/sandeep-raveesh-750aa630/>) to learn about generative AI solutions.

### Jonathan Kola

Jonathan is a Senior Specialist Solutions Architect, GenAI/ML at AWS.
