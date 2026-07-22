---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/amazon-sagemaker-ai-async-inference-now-supports-inline-request-payloads/
ingested: 2026-06-18
sha256: dfe78424b8fc8ac939932f345bc958d7ab3f5481cd278f392ab017b95662c350
feed_name: AWS China ML
source_published: 2026-06-17T20:56:36Z
---


# Amazon SageMaker AI Async Inference now supports inline request payloads

Today, we’re announcing inline payload support for Amazon SageMaker AI Async Inference. Customers can now send inference payloads directly in the request body of the `InvokeEndpointAsync` API, removing the need to upload input data to Amazon Simple Storage Service (Amazon S3) before each invocation.

For payloads up to 128,000 bytes, this removes an entire network round-trip, simplifies client-side code, and reduces the operational surface area of asynchronous inference workloads.

In this post, we explain the motivation behind this feature, walk through the customer experience before and after, and show you how to start using inline payloads today.

## Background: How async inference worked before

You can use [Amazon SageMaker AI Async Inference](<https://docs.aws.amazon.com/sagemaker/latest/dg/async-inference.html>) to queue inference requests and process them asynchronously. It’s a good fit for workloads with large payloads, variable traffic, or tolerance for seconds-to-minutes latency. It supports automatic scaling to zero, making it cost-efficient for bursty or batch-style workloads.

Until now, the workflow required two steps on every invocation:

  1. **Upload** the input payload to an Amazon S3 bucket.
  2. **Invoke** the endpoint, passing the S3 object URI as `InputLocation`.



The endpoint processes the request asynchronously and writes the output to a configured S3 output location, which the client polls or receives via Amazon Simple Notification Service (Amazon SNS) notification.

This two-step pattern works well for large payloads (images, audio, multi-MB documents). But for customers with small input payloads (in KB) who need longer processing times than real-time inference allows, the mandatory S3 dependency added unnecessary complexity.

## What’s new: Inline payload via the Body parameter

With today’s launch, `InvokeEndpointAsync` accepts a new `Body` parameter. When present, the payload is sent inline in the API request itself, with no S3 upload required.

**Key details:**

**Aspect** | **Details**  
---|---  
**New parameter** | `Body`, raw bytes, capped at 128,000 bytes.  
**Max inline size** | 128,000 bytes (raw payload).  
**Mutual exclusivity** | `Body` and `InputLocation` are mutually exclusive. The API rejects requests that set both.  
**Output behavior** | Unchanged. Output is written to the S3 `OutputLocation`.  
**Endpoint compatibility** | Designed to work with existing async endpoints; no model or container changes expected.  
**Error handling** | Size and mutual-exclusivity violations return synchronous `ValidationError` responses.  
**Availability** | Available in 31 commercial AWS Regions _(BOM, PDX, YUL, IAD, CMH, SFO, LHR, ICN, SYD, HKG, YYC, GRU, QRO, DUB, CDG, FRA, ZRH, ARN, ZAZ, NRT, KIX, SIN, CGK, MEL, KUL, BKK, HYD, TPE, CPT, MXP, TLV)_.  
  
## Before and after: The customer experience

The change is clearest in code. The two examples that follow perform the same async invocation against the same endpoint. The first uses the S3 upload step that was required until now, and the second uses the inline `Body` parameter that replaces it.

### Before: Upload to S3 first, then invoke
    
    
    import boto3, json, uuid
    
    s3 = boto3.client("s3")
    sagemaker_runtime = boto3.client("sagemaker-runtime")
    
    payload = json.dumps({"inputs": "your prompt here"}).encode("utf-8")
    
    # 1. Upload the request payload to S3 (extra latency + cost)
    input_key = f"async-input/{uuid.uuid4()}.json"
    s3.put_object(Bucket="my-async-bucket", Key=input_key, Body=payload)
    input_location = f"s3://my-async-bucket/{input_key}"
    
    # 2. Invoke the endpoint
    response = sagemaker_runtime.invoke_endpoint_async(
        EndpointName="my-async-endpoint",
        InputLocation=input_location,
        ContentType="application/json",
    )
    
    print(response["OutputLocation"])

This approach requires:

  * An S3 client and input bucket provisioned.
  * AWS Identity and Access Management (IAM) `s3:PutObject` permission on the caller.
  * A naming scheme (UUID or similar) to avoid key collisions.
  * A cleanup strategy for stale input objects.



### After: Send the payload inline
    
    
    import boto3, json
    
    sagemaker_runtime = boto3.client("sagemaker-runtime")
    
    payload = json.dumps({"inputs": "your prompt here"}).encode("utf-8")
    
    # One call, no S3 upload, no input bucket needed
    response = sagemaker_runtime.invoke_endpoint_async(
        EndpointName="my-async-endpoint",
        Body=payload,
        ContentType="application/json",
    )
    
    print(response["OutputLocation"])

No S3 client, no `uuid`, no input bucket, no IAM grants on the input path, no stale-object cleanup.

## Customer benefits

Sending the payload inline removes a network hop and a dependency from each request. That translates into five concrete benefits:

  * **Reduced latency.** One network round-trip and one S3 PUT removed per request. For fan-out workloads, this latency savings compounds meaningfully.
  * **Simpler architecture.** Avoids the input bucket provisioning, lifecycle policies, cross-account access patterns, and the caller’s IAM `s3:PutObject` permission on the input path.
  * **Fewer error paths.** The request is a single API call. It either enqueues or it doesn’t.
  * **Lower cost.** Removes the S3 PUT charge for the input upload on every inline invocation.
  * **Immediate validation feedback.** Size and mutual-exclusivity errors are returned synchronously.



## When to use each approach

Inline payloads are typically the simpler choice for small payloads, but `InputLocation` still has its place. Use the following table to decide which path fits a given workload:

**Scenario** | **Recommended approach**  
---|---  
Payload <= 128,000 bytes (JSON prompts, structured data) | **Inline`Body`.** Simpler. Avoids one network round-trip and S3 PUT charges.  
Payload > 128,000 bytes (images, audio, large documents) | **`InputLocation`.** Upload to S3 first.  
Mixed workload with variable payload sizes | **Branch on size.** Use `Body` for small, `InputLocation` for large.  
Need to retain input data in S3 for audit or replay | **`InputLocation`.** Keeps inputs in your bucket.  
  
## Getting started

See the [example code notebook](<https://github.com/aws-samples/sagemaker-genai-hosting-examples/blob/main/03-features/async-inference-inline-payload/async_inline_payload.ipynb>) for a full walkthrough.

Before you begin, make sure you have:

  * An existing Amazon SageMaker AI Async Inference endpoint (verify with `aws sagemaker describe-endpoint --endpoint-name my-async-endpoint`).
  * The latest AWS SDK for Python (Boto3) installed and configured with credentials.
  * IAM permissions for `sagemaker:InvokeEndpointAsync`.
  * An S3 output bucket configured for your async endpoint (for example, `my-output-bucket`).



**Note:** Following this guide uses billable AWS resources. SageMaker AI async inference endpoints incur charges for instance hours, and S3 buckets incur charges for storage and requests. Follow the cleanup steps after completing the tutorial to avoid ongoing charges.

### Steps

Inline payload support is available today. To use it:

  1. **Update your AWS SDK.** Install or upgrade Boto3 to the latest version: `pip install --upgrade boto3`.
  2. **Verify the installation:** `pip show boto3`.
  3. **Replace your invocation code.** In your application, substitute the S3 upload + `InputLocation` pattern with a direct `Body` parameter, as shown in the preceding code example.
  4. **Test your invocation** by calling the `InvokeEndpointAsync` API with the `Body` parameter.
  5. **Verify the response** contains an `OutputLocation` field.
  6. **Poll or monitor the S3`OutputLocation`** to confirm your inference result was written successfully.



No changes are needed to your endpoint configuration, model container, or output S3 setup.

## Clean up

To avoid ongoing charges, delete the resources used in this walkthrough:

  1. Delete the SageMaker AI endpoint if it was created for testing: 
         
         aws sagemaker delete-endpoint --endpoint-name my-async-endpoint

  2. Delete the output S3 bucket (if no longer needed). **Warning:** Deleting an S3 bucket permanently removes the objects within it. Verify you have backed up any inference results you need to retain. 
         
         aws s3 rb s3://my-output-bucket --force

  3. Remove any IAM policies created specifically for this tutorial.



## Conclusion

Inline payload support for SageMaker AI Async Inference removes a common friction point in asynchronous inference workflows: the mandatory S3 upload for every request. For the majority of inference payloads that fit within 128,000 bytes, you can now make a single API call and let SageMaker AI handle the rest.

The feature is designed to be backward-compatible. Existing `InputLocation` workflows continue unchanged. Both inline and S3 inputs are processed identically once the request is accepted, and models receive identical requests regardless of input source.

Get started today by updating your AWS SDK and using the `Body` parameter on the [SageMaker AI InvokeEndpointAsync API](<https://docs.aws.amazon.com/sagemaker/latest/APIReference/API_runtime_InvokeEndpointAsync.html>). To learn more about asynchronous inference, see the [Amazon SageMaker AI Async Inference documentation](<https://docs.aws.amazon.com/sagemaker/latest/dg/async-inference.html>).

* * *

## About the authors

### Dan Ferguson

Dan is a Solutions Architect at AWS, based in New York, USA. As a machine learning services expert, Dan works to support customers on their journey to integrating ML workflows efficiently, effectively, and sustainably.

### Bruce Wang

Bruce is a Software Development Engineer on the SageMaker AI Inference DataPlane team at AWS. He builds the infrastructure that powers real-time and asynchronous inference for SageMaker AI customers.
