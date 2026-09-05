---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/asynchronous-patterns-for-calling-amazon-bedrock-agentcore-agents-in-serverless-pipelines
ingested: 2026-08-20
feed_name: AWS China ML
source_published: 2026-08-19
sha256: 038865e0353d396c73b092287c0324dba3aa12a32a9bd40c39f843e573ac05c4
---

# Asynchronous patterns for calling Amazon Bedrock AgentCore agents in serverless pipelines

Asynchronous invocation patterns for Amazon Bedrock AgentCore agents in serverless pipelines remove idle compute costs while your AI agent processes requests. A common example is document validation: in a real-estate financing back office, an agent can read a property record or loan contract, reason about whether the information is complete and consistent, and return a verdict that downstream steps act on. [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>) provides a platform to build, connect, and optimize agents at scale, with any framework or model.

These agents introduce a characteristic that traditional pipeline steps do not have: they think for a while before they answer. How long depends on the prompt, the model, and the document, but it’s rarely instant, and that latency changes how you should call it. The most common first implementation is a compute service, such as an [AWS Lambda](<https://aws.amazon.com/lambda/>) function, that invokes the agent and waits for the response. While that function waits, it does nothing, but it is still running, and you are billed for every second of it.

It helps to see where the cost actually lands, because the two sides of the call are billed differently. Amazon Bedrock AgentCore runtime, a capability of Amazon Bedrock AgentCore, has a consumption-based model that doesn’t charge for CPU while the agent is idle. For instance, while it waits on a large language model to generate a response, or on a tool or Model Context Protocol (MCP) call to return, you are billed for memory during that time, but not for CPU. The compute service that called the agent has no such behavior. A Lambda function, container, or [Amazon Elastic Compute Cloud](<https://aws.amazon.com/ec2/>) (Amazon EC2) instance that issues a synchronous call sits blocked. It holds (and pays for) its full compute allocation until the agent responds. So the waste is not on the agent side. It’s the caller, idling on an open connection.

That makes the caller’s cost track the agent’s runtime. A function that blocks on the agent is billed for essentially the entire processing time, whereas a function that starts the agent and returns is billed only for the brief dispatch. The fix is to release the caller’s compute during the wait and resume the pipeline only when the agent has a result. In this post, we show three patterns that do this (task-token callback, direct service integration, and durable function) and contrast them with the blocking anti-pattern.

## An example pipeline

To compare the patterns on equal footing, we run each one through the same pipeline and change only the step that calls the agent. The pipeline is a deliberately simple, made-up scenario (validating documents for real-estate financing) chosen to keep the orchestration clear. It’s not the point of the post. It stands in for any workflow that calls an agent (or another slow service) and then acts on the result, so picture your own use case in its place.

The pipeline has five stages:

  1. **Extract** : An AWS Lambda function performs optical character recognition (OCR) and text extraction on the document. (Extraction is simulated, so the scenario runs without real documents.)
  2. **Identify** : A Lambda function classifies the document and sets routing flags (`shouldOrganize`, `shouldValidate`).
  3. **Route** : A Choice state directs the flow based on those flags.
  4. **Organize and Validate** : A Parallel state organizes the document while, in a separate branch, the Amazon Bedrock AgentCore agent validates it. This Validate branch is the only part that changes between patterns.
  5. **Result** : A Lambda function processes the agent’s verdict and decides the next action (approve, or return for correction).



The following diagram shows the pipeline. It stays the same in every case. Only the Validate branch is swapped to demonstrate each invocation pattern.

  
Figure 1: The example pipeline. Only the highlighted Validate branch changes between patterns

A single Amazon Bedrock AgentCore agent serves all four cases. The agent inspects each invocation and chooses how to respond: if it receives an [AWS Step Functions](<https://aws.amazon.com/step-functions/>) _task token_ , it wakes that execution when done. If it receives a durable-function _callback ID_ , it wakes the durable function. If it receives neither, it returns the verdict directly in the response. This means you can change the orchestration pattern without changing or redeploying the agent.

## How the agent returns control without blocking the caller

The mechanism is a return-of-control action in the agent’s action group. When the agent finishes reasoning, it calls a Lambda that posts the result and the task token back to Step Functions. (Pattern 2, described later, eliminates this Lambda entirely by having Step Functions integrate directly with AgentCore.)

The following code shows the core of that Lambda:
    
    
    # The tool the agent calls once it reaches a verdict
    @tool
    def conclude_validation(approved: bool, issues: list, summary: str) -> str:
        verdict = {"approved": approved, "issues": issues,
                   "summary": summary, "source": "agentcore"}
    
        # A Step Functions task token was passed: resume that execution
        if task_token:
            sfn.send_task_success(taskToken=task_token, output=json.dumps(verdict))
            return "Step Functions resumed."
    
        # A durable-function callback ID was passed: resume the durable function
        if callback_id:
            lambda_client.send_durable_execution_callback_success(
                CallbackId=callback_id, Result=json.dumps(verdict).encode("utf-8"))
            return "Durable function resumed."
    
        # Neither was passed: this is a synchronous call, return the verdict inline
        return "Verdict recorded."

The entrypoint decides whether to run in the background or synchronously based on the same signals:
    
    
    @app.async_task
    async def validate_document_async(prompt, document, extracted_text):
        # Background work; conclude_validation fires the right callback when done
        agent = build_agent()
        await agent.invoke_async(message(prompt, document, extracted_text))
    
    @app.entrypoint
    async def handler(event):
        task_token  = event.get("taskToken")    # passed by the task-token pattern
        callback_id = event.get("callbackId")   # passed by the durable-function pattern
    
        # Asynchronous: start the work and return "accepted" right away
        if task_token or callback_id:
            asyncio.create_task(validate_document_async(...))
            return {"status": "accepted"}
    
        # Synchronous: run now and return the verdict in the response
        agent = build_agent()
        await agent.invoke_async(message(...))
        return verdict

With the agent in place, the rest of the post focuses on the four ways to call it.

## Calling the agent: Four approaches

We start with the blocking anti-pattern to establish the baseline cost, then show the three patterns that avoid it. The code and infrastructure definitions throughout are excerpts from the sample, included to illustrate each pattern.

### The blocking anti-pattern

The most direct implementation calls the agent and waits for the answer in the same Lambda function. It works, and it is straightforward to implement, which is why it’s so common, but the function stays alive for the entire time the agent is thinking.
    
    
    // The Lambda function blocks here until the agent responds
    const response = await agentcore.send(
      new InvokeAgentRuntimeCommand({
        agentRuntimeArn: AGENT_RUNTIME_ARN,
        payload: new TextEncoder().encode(JSON.stringify(payload)),
        runtimeSessionId: sessionId,
      })
    );
    // The function stays alive and billed for the entire time the agent is thinking.

The function’s billed duration ends up approximately equal to the agent’s processing time. The next three patterns eliminate this idle cost, each making a different trade-off. In particular, Pattern 2 uses the Step Functions optimized integration for [AgentCore Harness (InvokeHarness)](<https://docs.aws.amazon.com/step-functions/latest/dg/connect-bedrockagentcore.html>), removing the Lambda entirely.

### Pattern 1: Task-token callback with a dispatcher function

This pattern keeps a Lambda function in the path for custom logic but removes the idle cost. Step Functions invokes the function with the `waitForTaskToken` integration, which passes a task token and then pauses the execution. The function uses the token to start the agent, then returns in a few seconds. The execution stays paused, billing nothing for compute, until the agent calls `SendTaskSuccess` with that token to resume it.
    
    
    // Start the agent, pass the task token, and return without waiting
    const response = await agentcore.send(
      new InvokeAgentRuntimeCommand({
        agentRuntimeArn: AGENT_RUNTIME_ARN,
        payload: new TextEncoder().encode(JSON.stringify({ ...payload, taskToken })),
        runtimeSessionId: sessionId,
      })
    );
    // Returning here does not complete the step. Step Functions stays paused until
    // the agent calls SendTaskSuccess with this task token.
    return { dispatched: true };

The corresponding state passes the token from context and sets a timeout and heartbeat as a safety net, so a silent agent fails the execution cleanly rather than leaving it paused indefinitely:
    
    
    "ValidateDispatch": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke.waitForTaskToken",
      "Parameters": {
        "FunctionName": "${ValidateDispatcherFunctionArn}",
        "Payload": {
          "taskToken.$": "$$.Task.Token",
          "document.$": "$.document",
          "extractedText.$": "$.extract.extractedText",
          "executionId.$": "$$.Execution.Id"
        }
      },
      "TimeoutSeconds": 120,
      "HeartbeatSeconds": 60,
      "Next": "AgentCoreValidation"
    }

**Cost.** A Lambda function runs, but only long enough to start the agent and return: a few seconds, regardless of how long the agent then takes. You pay for that brief dispatch, not for the wait, because the function has already shut down while the agent works. The wait is held by the paused Step Functions execution, which doesn’t bill for idle compute. This is the key difference from the blocking version, where the function’s billed time tracks the agent’s processing time.

### Pattern 2: Direct service integration

When you don’t need custom code around the agent call, you can remove the dispatcher function and take Lambda out of the path entirely. Step Functions can call Amazon Bedrock AgentCore directly through its AWS SDK service integration, so the agent’s response flows straight into the next state. The Validate branch then becomes a single Task state:
    
    
    "ValidateDirect": {
      "Type": "Task",
      "Resource": "arn:aws:states:::aws-sdk:bedrockagentcore:invokeAgentRuntime",
      "Parameters": {
        "AgentRuntimeArn": "${AgentRuntimeArn}",
        "RuntimeSessionId.$": "States.Hash($$.Execution.Id, 'SHA-256')",
        "Payload.$": "States.JsonToString($.prep.agentInput)"
      },
      "ResultSelector": { "raw.$": "$.Response" },
      "TimeoutSeconds": 120,
      "Next": "ParseVerdict"
    }

**Cost.** There’s no Lambda function in the path, so there is no idle Lambda compute to pay for. Step Functions holds the wait, and a Standard workflow bills per state transition rather than for the duration of the wait, so the meaningful cost during processing is the agent itself.

### Pattern 3: Lambda durable function

If you would rather express the orchestration as code in one place instead of a state machine, a Lambda durable function gives you the same cost behavior. With the `@aws/durable-execution-sdk-js` SDK, the pipeline stages become `context.step` calls, the parallel work becomes `context.parallel`, and the wait for the agent becomes `context.waitForCallback`. During that wait the function suspends and is not billed for compute. The agent resumes it with `SendDurableExecutionCallbackSuccess`.
    
    
    // Suspend the function until the agent calls back
    const result = await ctx.waitForCallback(
      "validate-agentcore",
      async (callbackId) =>
        dispatchAgentCore(callbackId, document, extractedText, executionId),
      { timeout: { seconds: 120 } }
    );

**Cost.** A single function holds the whole pipeline, but it doesn’t bill for compute while it is suspended waiting for the agent. You pay for the short bursts of execution between suspensions, the same economics as the task-token pattern, rather than for the wait.

## Measuring the difference

The point isn’t any particular number. The agent’s runtime varies with the prompt, the model, and the document. What matters is the _relationship_ between two values in the task-token pattern: how long the Validate state was active, versus how long the dispatcher function was actually billed. A single run from our testing makes the relationship visible:
    
    
    Step Functions, ValidateDispatch state
       Returned (TaskSubmitted): 14:08:19   <- the function returned and shut down
       Resumed  (TaskSucceeded): 14:08:34   <- the agent woke the execution
       State active ........ 19.6s
    
    Lambda, dispatcher function (CloudWatch REPORT)
       Billed duration ..... 4.8s
    
    Result: the state was active for 19.6s, but the function was billed for 4.8s.
    The ~14.8s in between is wait time with no Lambda function running.

You can see the same thing in the Step Functions event history: with the task-token pattern, a `TaskSubmitted` event (the function returned) is separated from `TaskSucceeded` (the agent resumed the flow) by the agent’s processing time. A synchronous invocation has no such gap.

The following table summarizes how the Validate branch (highlighted in the preceding diagram) is implemented in each pattern:

| **Blocking (anti-pattern)** | **Pattern 1: Task token** | **Pattern 2: Direct integration** | **Pattern 3: Durable function**  
---|---|---|---|---  
Orchestrator | Step Functions | Step Functions | Step Functions | Lambda (code)  
Lambda function in the path | yes, alive and billed | yes, but it returns early | none | the durable function (suspends)  
Idle Lambda compute during the wait | pays the full wait | none | none | none  
Custom code around the agent call | yes | yes | limited (state transformations) | yes  
Decouples the caller from the agent | no | yes | no | yes  
Relative complexity | lowest | higher (token and callback IAM) | lowest | medium (checkpoint/replay)  
  
One caveat on reading this: the _total_ pipeline duration isn’t a useful comparison metric, because it’s dominated by the agent’s own reasoning time, which varies from run to run and is essentially the same in every scenario. The meaningful difference is how much compute you pay for during that wait, captured by the table and the billed-duration reading. The dispatcher’s billed time stays flat while the agent’s runtime grows. The preceding numbers come from a single run. Treat them as an illustration of the relationship, not a benchmark, and measure your own workload.

## Choosing a pattern

The following table summarizes the trade-offs to help you choose a pattern:

| **Blocking (anti-pattern)** | **Pattern 1: Task-token** | **Pattern 2: Direct integration** | **Pattern 3: Durable function**  
---|---|---|---|---  
**Caller cost** | Full agent processing time | Seconds (dispatch only) | Zero (no Lambda) | Seconds (dispatch only)  
**Integration effort** | Low | Medium-high (IAM, heartbeat, timeout) | Low (single Task state) | Medium (checkpoint-and-replay model)  
**Business logic location** | In Lambda (before + after) | In Lambda (before + after) | In Amazon States Language (ASL) only (intrinsic functions) | In Lambda (sequential code)  
**Best for** | Prototypes, short agents | Custom pre/post-processing logic | Pure orchestration, no custom code | Complex async workflows in one function  
  
## Best practices

**Guard against an agent that never answers.** Set `TimeoutSeconds` on every `waitForTaskToken` state so the execution fails with `States.Timeout` instead of hanging indefinitely. If your agent sends heartbeats, also set `HeartbeatSeconds` for faster dead-agent detection. Catch the error and route to a failure or human-review path.

**Use a stable session ID across retries.** Set `sessionId` to a value derived from the execution context (such as the Step Functions execution name) so that retries resume the same agent session rather than starting fresh. In the task-token pattern, set it in the dispatcher. In the direct-integration pattern, set it in the Task state parameters.

**Turn on AWS X-Ray.** Enable `Tracing: Active` in your Step Functions and Lambda configurations. X-Ray shows exactly how long the agent spent thinking versus how long the caller spent waiting, confirming that your pattern actually released compute during the gap.

**Size the dispatcher function for speed, not for the agent’s workload.** The dispatcher only serializes a request and invokes an endpoint. 256 MB of memory and a 30-second timeout are usually sufficient. The heavy work happens on the agent side.

## Costs

These patterns incur charges for Lambda compute, Step Functions state transitions, durable-function execution storage, and, common to every approach, Amazon Bedrock AgentCore runtime and Amazon Bedrock model inference. The agent and model cost is the same in all four cases. The architecture changes only the orchestration overhead and, in the blocking anti-pattern, the wasted idle Lambda compute. For current pricing, see the pricing pages for each service.

## Conclusion

Putting an AI agent in a pipeline is the straightforward part. Calling it economically is what separates a prototype from a production design. A Lambda function that blocks on the agent is straightforward to implement but quietly expensive, spending most of its billed time waiting. In this post, we showed three ways to avoid that: a task-token callback when you need a Lambda function in the path, a direct service integration for the simplest case, and a durable function when you prefer orchestration as code. All three are driven by the same Amazon Bedrock AgentCore agent, which adapts its response to however it is called.

The full sample, including the complete agent, the state machine definitions, and the durable function, is available in the [sample-bedrock-agentcore-async-stepfunctions](<https://github.com/aws-samples/sample-bedrock-agentcore-async-stepfunctions>) repository on GitHub. To go deeper, review the Amazon Bedrock AgentCore documentation on asynchronous task processing.

For production deployments, use [Amazon Bedrock Guardrails](<https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html>) to enforce responsible-AI controls on agent inputs and outputs.

* * *

## About the authors

### Daniel Abib

Daniel is a senior specialist solutions architect at AWS, focused on generative AI and Amazon Bedrock — and passionate about serverless. He helps startups and enterprises build AI-powered applications and modernize with cloud-native architectures. A three-time Ironman finisher and four-time re:Invent speaker, he brings the same endurance mindset to building cloud solutions.

### Alexandre Farber

Alexandre is a senior manager at AWS, helping LATAM’s most promising startups grow by architecting compute, data, and AI workloads. A former startup CTO who built tech and data teams from zero to thirty, he brings hands-on experience across e-commerce, fintech, and payment platforms to every customer engagement.
