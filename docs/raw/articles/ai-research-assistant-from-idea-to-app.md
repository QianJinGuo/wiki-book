---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/idea-to-ai-app-research-assistants/
ingested: 2026-06-01
sha256: e12f31077ff009a6
---

# From idea to AI app: Creating intelligent research assistants with Strands

Building an AI app shouldn’t require a PhD in machine learning (ML) or months of wrestling with complex architectures. Yet that’s exactly what happens when you try to orchestrate multiple API calls, manage conversation state, and create agents that can reason on their own. I’ve seen straightforward AI ideas balloon into sprawling projects that demand specialized knowledge in natural language processing and distributed systems. But here’s what changed: using [Strands Agents](https://aws.amazon.com/blogs/opensource/introducing-strands-agents-an-open-source-ai-agents-sdk/) and AWS services, I built a fully functional AI research assistant in just 30 lines of code. In this post, I walk you through exactly how I did it—from initial concept to working application.

Amazon Web Services (AWS) offers multiple options for building [agentic AI](https://aws.amazon.com/ai/agentic-ai/) applications. [Amazon Bedrock](https://aws.amazon.com/bedrock/) provides access to foundation models (FMs) that can power intelligent agents, while services like [Kiro](https://kiro.dev/) enable developer-focused AI assistance directly within the IDE. You can use these tools to create custom AI agents tailored to specific use cases and domains.

Kiro is an AI-powered IDE that writes code so developers can focus on decisions. [Kiro Powers](https://kiro.dev/powers/) extend the Kiro IDE with specialized, on-demand capabilities by packaging MCP servers, steering files, and hooks into reusable units. The [Strands power](https://github.com/kirodotdev/powers/tree/main/strands), for example, bundles SDK documentation search, getting started guides, and correct API patterns so Kiro can scaffold agents accurately. With over 50 curated powers from AWS, partners, and the community—covering design, deployment, security, and observability—developers install with one click and start building immediately.

[Strands Agents](https://strandsagents.com/) is an open source framework that directly addresses these development challenges by providing a straightforward way to create intelligent agents that can perform tasks like research, analysis, and content generation. Strands Agents combine the capabilities of large language models (LLMs) with custom logic and APIs through Python code. For more information about Strands Agents, see [Introducing Strands Agents, an Open Source AI Agents Software Development Kit (SDK)](https://aws.amazon.com/blogs/opensource/introducing-strands-agents-an-open-source-ai-agents-sdk/).

## Why choose Strands Agents: Simplified AI development for AWS environments

Strands Agents addresses the core challenges you face when building AI applications through its model-driven approach. Instead of complex hardcoding, it uses LLMs for autonomous reasoning and planning, so you can create agents with only a prompt and tools list while the LLM handles the logic and tool usage.

The framework’s flexible architecture supports everything from single agents to multi-agent networks and hierarchical systems, making it suitable for projects of various scale. You can integrate external functions and APIs through the [@tool decorator](https://strandsagents.com/0.1.x/documentation/docs/user-guide/concepts/tools/python-tools/), while the model-agnostic design works with various LLM providers including Amazon Bedrock, Anthropic, and OpenAI.

For AWS environments, Strands integrates naturally with services like Amazon Bedrock and AWS Lambda, and it’s already production-ready. AWS teams use it in services like Amazon Q and AWS Glue. The open source framework is Apache-2.0 licensed with active community contributions, and the same code runs smoothly in both local development and production environments. Real-time streaming responses make it a good fit for interactive applications that need immediate feedback.

For more information about the technical deep dive, see [Strands Agents SDK: A technical deep dive into agent architectures and observability](https://aws.amazon.com/blogs/machine-learning/strands-agents-sdk-a-technical-deep-dive-into-agent-architectures-and-observability/).

### **Prerequisites**

Before you dive into the solution, make sure that you have the following in place:

*   An AWS account.
*   [User configured in AWS IAM Identity Center](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/getting-started-idc.html) or [Builder ID](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/getting-started-builderid.html).
*   Install [Kiro](https://kiro.dev/).
*   **Configure AWS credentials to access Amazon Bedrock** — Set up authentication using AWS IAM Identity Center (the recommended approach for human access). Run the following commands to configure and log in:

```
aws configure sso

aws sso login --profile research-assistant
```

*   Next, attach a scoped inline AWS Identity and Access Management (IAM) policy to the role or permission set that you use. This policy grants only the necessary permissions for this tutorial—invoking the Claude Sonnet model through Amazon Bedrock.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:Converse"
      ],
      "Resource": "arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0"
    }
  ]
}
```

*   Add [Build an agent with Strands](https://github.com/kirodotdev/powers/tree/main/strands) (power) to Kiro.

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/14/image-ML-196841.png)

## Solution overview

### Building an intelligent research assistant

This section shows how Strands Agents streamline the development of agentic AI capabilities. Our example research assistant showcases how you can quickly integrate intelligent features into your applications with minimal code. You start by creating an agent with an Agent() initialization, then define the agent’s behavior through prompt engineering. Next, you add autonomous research capabilities by providing tools and process responses for clean output.

The solution requires only 30 lines of code, demonstrating how Strands can reduce AI development complexity into straightforward implementation. While we use Streamlit for visualization, the core functionality lies in Strands’ ability to handle autonomous reasoning, tool selection, and task execution with minimal intervention from you.

### Getting started with Strands Agents:

You will start by building a straightforward Q&A style research assistant using Strands Agents. In your IDE, install the Strands Agents SDK:

Kiro -> Terminal

```
pip install strands-agents
```

We also need Streamlit for our research assistant, so use the following command to install Streamlit:

Then you will create your first agent as a Python file. Let’s call it `research.py`_._

```
from strands import Agent

# Create an agent with default settings
agent = Agent()

# Ask the agent a question
agent("Tell me about agentic AI")
```

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/14/image-ML-196842.png)

That’s it. You’ve just built your first AI agent. Now, let’s see what it can do when you run it.

In your terminal, run the following command:

With this foundation established, let’s enhance our implementation by using prompt engineering to create a more sophisticated research assistant. We will build a web interface using Streamlit that can be used to dynamically input topics and receive comprehensive research reports powered by Strands Agents.

### AI-assisted development with Kiro: Generating our research assistant implementation

Let’s accelerate our development process by using capabilities of [Kiro](https://kiro.dev/) to generate our research assistant code through natural language prompting and conversation. We will use natural language to describe our requirements, and Kiro can help us create a functional research assistant application with Strands Agents and Streamlit.

Complete the following steps:

1.  Open Kiro.
2.  Create a new Python file (for example, `research_assistant.py`).
3.  Provide the following prompt:

```
Create a Streamlit research assistant app using strands Agent library with these exact requirements:

1. App title: "Research Assistant" with subtitle "Enter a topic to get research analysis and recommendations"
2. Text input field with placeholder "e.g., renewable energy, artificial intelligence" 
3. "Generate Research Report" button that when clicked:
   - Shows spinner with "Researching and analyzing..." message
   - Redirects stdout to prevent terminal output interference (import sys, os and use devnull)
   - Creates Agent() instance
   - Uses this exact prompt template: "You are a research assistant. For the topic '{topic}': 1. Overview of the topic in about 50 words 2. Find recent 2 articles about {topic} in 20 words each 3. Things to know relevant to the topic and description as prerequisites in 20 words each like if topic is agentic ai then prereq is machine learning and generative ai 4. 2 key contributors and well known people in this field of research topic including their bio in 25 words each 5. give relevant 2 urls to read more and any research papers from https://arxiv.org/"
   - Displays response using st.subheader(f"Research Report: {topic}") and st.write(response.message['content'][0]['text'])
   - Restores stdout in finally block
   - Shows warning if no topic entered

Use try/finally pattern for stdout redirection. Keep code minimal and functional.
```

Kiro will generate the complete implementation, which we can then save and run.

The following is the code from Kiro.

```
import sys
import os
import streamlit as st
from strands import Agent

st.title("Research Assistant")
st.write("Enter a topic to get research analysis and recommendations")

topic = st.text_input("Research Topic", placeholder="e.g., renewable energy, artificial intelligence")

if st.button("Generate Research Report"):
    if topic:
        with st.spinner("Researching and analyzing..."):
            old_stdout = sys.stdout
            try:
                sys.stdout = open(os.devnull, "w")
                agent = Agent()
                response = agent(
                    f"You are a research assistant. For the topic '{topic}': "
                    f"1. Overview of the topic in about 50 words "
                    f"2. Find recent 2 articles about {topic} in 20 words each "
                    f"3. Things to know relevant to the topic and description as prerequisites in 20 words each "
                    f"like if topic is agentic ai then prereq is machine learning and generative ai "
                    f"4. 2 key contributors and well known people in this field of research topic including their bio in 25 words each "
                    f"5. give relevant 2 urls to read more and any research papers from https://arxiv.org/"
                )
            finally:
                sys.stdout = old_stdout

            st.subheader(f"Research Report: {topic}")
            st.write(response.message["content"][0]["text"])
    else:
        st.warning("Please enter a topic to research.")
```

Note: Without a web-browsing tool, the agent generates URLs from its training knowledge. These may not reflect the latest papers. _For live retrieval, add appropriate MCP server as a tool_.

**Choosing MCP servers responsibly**

*   Pin the MCP server to a specific version or commit hash (for example, `pip install "arxiv-mcp==X.Y.Z"`).
*   Review the source before installing. I recommend Amazon Bedrock-native retrieval (Knowledge Bases/RAG) for production use cases.
*   For customer-facing or cross-organization deployments, route third-party MCP servers through your organization’s legal and security review process.
*   MCP servers share the agent’s process privileges, including any AWS credentials available to the process. Treat them as part of your trust boundary.

_For production workloads, consider [AWS managed remote MCP servers via Amazon Bedrock AgentCore](https://aws.amazon.com/blogs/machine-learning/build-long-running-mcp-servers-on-amazon-bedrock-agentcore-with-strands-agents-integration/), which provide process isolation, centralized auth, and eliminate local credential exposure._

**Security considerations for production**

*   **Validate user input.** Cap topic length and strip non-printable characters before passing the string to the agent (see the code in this post).
*   **Enable Amazon Bedrock Guardrails.** Attach a guardrail to the model call for prompt-injection and unsafe-output filtering. For more information, see [Detect and filter harmful content by using Amazon Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html).
*   **Turn on logging.** Enable Amazon Bedrock model-invocation logging and AWS CloudTrail data events on `bedrock:InvokeModel` and `bedrock:Converse` so you can attribute misuse and reconstruct incidents.
*   **Bound cost.** Set an Amazon Bedrock on-demand quota alarm and a per-session query cap to prevent topic-flood/cost-exhaustion.
*   **Classify persisted data.** If you store conversation history, classify the data and redact sensitive values before writing.
*   **Review the shared responsibility model.** See the [AWS Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/) for the split between what AWS manages and what you own.

If you want to understand the code better, you can ask Kiro _`Can you explain code in context?`_

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/14/image-ML-196843.png)

Kiro responds as follows:

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/14/image-ML-196845.png)

During initial development, the agent’s output was streaming correctly in the Streamlit interface but also appearing in the terminal, where it would get cut off abruptly. While this didn’t affect the application’s functionality, it created unnecessary noise in the development environment. Through further conversation with Kiro, I refined the code to include stdout redirection, to verify the agent’s responses would only display in the intended interface.

This illustrates a key advantage of coding with Kiro—the ability to iteratively improve your implementation through natural language feedback. When you encounter such edge cases, you can describe the desired behavior, and Kiro will help modify the code accordingly – for example, try asking Kiro to add error handling for empty or malformed agent responses.

Let’s now see our refined application in action.

## Bringing your agent to life

In the terminal, go to the directory where the file `research_assistant.py` is saved and run the following command:

```
streamlit run research_assistant.py
```

This will bring up the Streamlit app.

**Note:** streamlit run binds to 127.0.0.1 by default, so the UI is reachable only from this machine. Don’t expose it to the LAN (–server.address=0.0.0.0) or the internet without adding authentication, CSRF protection, and an Amazon Bedrock cost cap. Browser DNS-rebinding against localhost is a known concern for local developer tools. Consider Streamlit’s built-in authentication or reverse-proxying through an authenticated gateway for any shared use.

After you run the previous command, you will be greeted with following note. You can choose to leave the email as blank.

> _Welcome to Streamlit!_
> 
> _If you’d like to receive helpful onboarding emails, news, offers, promotions,_
> 
> _and the occasional swag, please enter your email address below. Otherwise,_
> 
> _leave this field blank._
> 
> _Email:_

Next, you will get the link to open Streamlit app.

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/14/image-ML-196847.png)

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/14/image-ML-196848.png)

You can enter a topic of interest and choose **Generate Research Report.**

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/14/image-ML-1968411.png)

which will generate the research report as follows:

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/14/image-ML-1968413.png)

If you want to get a different report or other details, you can ask Kiro to modify the code when you have the file in context or you can proceed to alter the code yourself.

### Conclusion

In this post, we explored how Strands Agents streamline the development of agentic AI applications. By combining the power of Strands’ model-driven approach with Kiro’s code generation capabilities, I demonstrated how you can build sophisticated AI features with minimal code.

Our exploration shows that Strands Agents can reduce complex AI development through intuitive agent creation, while Kiro can enhance your productivity through AI-assisted coding. The resulting applications are both powerful and maintainable, and you can quickly make custom modifications through prompt engineering. As AI continues to evolve, tools like Strands Agents and Kiro are making it increasingly accessible for you to create intelligent, autonomous applications that can enhance your specific use cases and workflows.

### License & disclaimer

The example code in this post is licensed under MIT-0. This post and its code are provided as-is without warranty; readers are responsible for the security, cost, and operational posture of any system they deploy based on this guidance.

**Considerations before using in production**

*   **Cost** — each research query consumes Amazon Bedrock tokens; set a quota alarm and a per-session query cap before exposing this app beyond a single user.
*   **Data** — research topics and the model’s output are sent to a foundation model; do not submit confidential or regulated data without appropriate controls.
*   **Operational** — the tutorial ships with no audit trail, no input validation, and no authentication on the Streamlit UI. See the _Security considerations for production_ section above before reusing this pattern.

* * *

## About the author