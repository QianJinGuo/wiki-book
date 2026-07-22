---
source_url: "https://aws.amazon.com/blogs/machine-learning/how-loka-built-a-natural-low-latency-voice-agent-with-amazon-nova-2-sonic/"
ingested: 2026-06-26
sha256: 15a497dff146ca21
---

# How Loka Built a Natural, Low-Latency Voice Agent with Amazon Nova 2 Sonic

[Loka](<https://www.loka.com/>) transformed customer voice interactions by building a conversational AI agent with [Amazon Nova 2 Sonic](<https://nova.amazon.com/sonic>) that keeps customers engaged with natural, responsive experiences. Their AWS-based solution achieves high speech reasoning accuracy on [Big Bench Audio](<https://huggingface.co/datasets/ArtificialAnalysis/big_bench_audio>) while delivering significantly lower costs and faster response times than traditional voice AI pipelines. In this post, we demonstrate the architecture and approach Loka used to solve a common frustration: robotic, slow voice assistants that cause customers to hang up, damaging brand reputation and driving up support costs.

## Why traditional voice assistants fall short

Traditional voice assistants follow a three-step process that creates the fundamental problem. First, they convert your speech into text using Speech-to-Text systems. Next, they process that text through a Large Language Model (LLM). Finally, they convert the text response back into speech using Text-to-Speech technology. This pipeline introduces compounding delays at every step. The result is often a 3 to 5 second pause before you hear a response. That delay destroys the feeling of natural conversation. It makes interrupting or correcting the assistant feel clunky and frustrating.

Consider a real scenario at an automotive dealership. A customer calls and says, _“I’m looking for that SUV you advertised, but not the hybrid one. I can only come in after 5 PM.”_ The assistant needs to parse multiple pieces of information simultaneously. It must understand the intent, negation, and scheduling constraints. Traditional systems struggle with this complexity because they lose crucial information during conversion. Tone, hesitation, and urgency disappear when speech becomes text. The dealership context makes these limitations painfully clear. Customers expect immediate, helpful responses when they call. A five-second pause feels like an eternity in a sales conversation. Worse, if the assistant misunderstands and needs clarification, delays compound. The conversation becomes tedious rather than helpful.

Beyond the technical delays, there’s an economic problem. Serving thousands of locations requires strict cost control. Traditional real-time voice systems can become cost-prohibitive at scale, particularly when processing continuous audio streams. The combination of poor experience and high cost has limited voice AI adoption. Businesses need a better solution.

## Native speech-to-speech models

Recent advances in AI have unlocked a fundamentally different approach. Developers can now send audio streams directly to speech-to-speech models that handle understanding, reasoning, and generation as a unified system. By processing audio end-to-end, these models capture tone, emotion, and subtle cues that traditional text-only pipelines miss.

To validate this approach, rigorous testing was essential. We used [Big Bench Audio](<https://huggingface.co/datasets/ArtificialAnalysis/big_bench_audio>), a benchmark that measures reasoning over speech inputs. [Amazon Nova 2 Sonic](<https://nova.amazon.com/sonic>) achieved a speech reasoning score of 87.0. This outperformed [Gemini 2.5 Flash Native Audio (Live API)](<https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/2-5-flash-live-api>) at 71.0 and exceeded [GPT Realtime](<https://developers.openai.com/api/docs/models/gpt-realtime>)’s 83.0. These scores confirmed that native audio processing doesn’t sacrifice intelligence for speed. The model could handle complex, multi-part requests in real dealership scenarios.

_Figure 1 – Speech reasoning scores comparison – Big Bench Audio_

Reasoning ability alone isn’t enough for production systems. Latency determines whether conversations feel natural or robotic. Nova 2 Sonic achieved Time to First Audio of 1.39 seconds. This response time allows for natural “barge-in” behavior. When users interrupt the conversation, the voice agent responded naturally. This experience matches human conversation patterns.

_Figure 2 – Time to first Audio comparison – Big Bench Audio_

Cost efficiency also improved. [Nova 2 Sonic costs approximately $0.27 per hour](<https://aws.amazon.com/nova/pricing/>) of the input audio (based on pricing as of the time of publishing). This is lower than comparable real-time models and traditional methods.

_Figure 3 – Cost per hour of audio comparison – Big Bench Audio_

To measure quality beyond latency and cost, we needed a structured evaluation. We built an automated pipeline using LLM as a judge. Each conversation was scored on five dimensions using a 1-5 scale. Response Appropriateness measured whether replies were relevant and contextually correct. Intent Understanding assessed whether the agent grasped the user’s underlying goal. Completeness tracked required information or actions were provided. Conversational Naturalness measured flow, turn-taking, tone, and human-likeness.

Comparing Amazon Nova Sonic to Amazon Nova 2 Sonic revealed clear progress. Response Appropriateness improved from 2.5 to 2.9. Intent Understanding rose from 2.9 to 3.0. Most significantly, Completeness jumped from 1.8 to 2.5. This meant agents were far more likely to finish complex tasks. Conversational Naturalness improved from 2.5 to 2.8. The overall score increased from 2.4 to 2.7. These gains translated directly to better customer outcomes at dealerships.

**Metric (1-5 Scale)** | **Nova Sonic (Baseline)** | **Nova 2 Sonic** | **Change**  
---|---|---|---  
**Response Appropriateness** | 2.5 | **2.9** | **+0.4**  
**Intent Understanding** | 2.9 | **3.0** | **+0.1**  
**Completeness** | 1.8 | **2.5** | **+0.7**  
**Conversational Naturalness** | 2.5 | **2.8** | **+0.3**  
**Overall Judge Score** | 2.4 | **2.7** | **+0.3**  
  
_Table 1 – Speech-to-speech model metrics comparison on the five dimensions_

## Engineering conversational AI agents

With a strong foundation model, the next challenge was optimization. We treated prompts like code, iterating based on measured performance. The baseline Nova 2 Sonic configuration scored 2.7 overall. After the first prompt refinement, the score rose to 3.1. The second iteration achieved 3.8 out of 5.0. This improvement came from better turn discipline and repetition control. The agent learned when to speak, when to listen, and when to ask clarifying questions.

**Configuration** |  **Response** **Appropriateness** | **Intent Understanding** | **Completeness** | **Error Recovery** |  **Conversational** **Naturalness** |  **Overall** **Judge Score**  
---|---|---|---|---|---|---  
**Amazon Nova 2 Sonic (Baseline)** | 2.9 | 3.0 | 2.5 | 2.6 | 2.8 | 2.7  
**Amazon Nova 2 Sonic (Prompt v1)** | 3.2 | 3.3 | 3.0 | 2.8 | 3.9 | 3.1  
**Amazon Nova 2 Sonic (Prompt v2)** | **3.7** | **3.9** | **3.9** | **3.8** | **4.1** | **3.8**  
  
_Table 2 – Speech-to-speech model metrics comparison on the five dimensions after prompt enhancements_

The team enhanced the baseline prompt in several ways, evolving it into two prompt templates. They replaced hardcoded dealership details with templatized variables like `{assistant_name}` and `{dealership_address}`. This change made the prompt reusable across any dealership.

The team shifted formatting from numbered lists to bullet points under clearly labeled headings. Headings like “Tool Usage Rules,” “Error Recovery,” and “Conversation Endings” gave the model sharper behavioral boundaries. This structure reduced instruction bleed between topics.

The team added concrete behavior examples throughout the prompt. These examples showed exactly how to acknowledge without echoing the caller. They also introduced a pre-response checklist that prompts the model to self-audit before every reply.

[Amazon Bedrock Prompt Management](<https://aws.amazon.com/bedrock/prompt-management/>) became a natural home for this entire lifecycle. It allowed the team to store each template version with a unique Amazon Resource Name (ARN). They could promote changes from draft to production without touching application code.

When a new dealership was onboarded, their specific variables were injected at runtime through the [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) API. This meant the same core prompt served every client while remaining fully customizable.

The team added [AWS Identity and Access Management (AWS IAM)](<https://aws.amazon.com/iam/>) access controls to restrict who could author, approve, or deploy prompt changes. This brought a proper governance layer to what was previously an informal editing process.

This approach turned prompt engineering from a one-off task into a repeatable, auditable workflow. The workflow scaled as the number of dealerships and use cases grew.

Real-world testing required edge cases that mirror actual dealership calls. We tested angry customers, busy parents, chatty customers, confused customers, and elderly callers.

The Busy Parent scenario scored 5.0 across the five dimensions. The agent handled interruptions, background noise, and time pressure flawlessly. The Angry Customer case scored 4.5 overall. The agent remained calm, empathetic, and solution focused. The Confused Customer scenario also scored 4.5. The agent patiently clarified without sounding condescending.

**Chat Examples** | **Response Appropriateness** | **Intent Understanding** | **Completeness** | **Error Recovery** | **Conversational Naturalness** | **Overall****Judge Score**  
---|---|---|---|---|---|---  
**Angry Customer** | 4.5 | 4.5 | 4.0 | 4.5 | 4.5 | 4.5  
**Busy Parent Customer** | 5.0 | 5.0 | 5.0 | 5.0 | 5.0 | 5.0  
**Chatty Customer** | 3.5 | 3.0 | 2.5 | 2.0 | 4.0 | 3.0  
**Confused Customer** | 4.5 | 4.5 | 4.5 | 5.0 | 4.5 | 4.5  
**Elderly Customer** | 3.5 | 3.0 | 2.5 | 2.0 | 4.0 | 3.0  
**Average** | **4.2** | **4.0** | **3.7** | **3.7** | **4.4** | **4.0**  
  
_Table 3 – Speech to Speech model evaluation based on customer personas_

Two scenarios revealed the remaining opportunities. The Chatty Customer and Elderly Customer cases both scored 3.0 overall. When users provided long, meandering inputs, the voice agent struggled with the structure. Completeness scores dropped to 2.5 in these situations. Error recovery fell to 2.0. These results identified clear areas for future prompt engineering. Still, the average edge-case score of 4.0 indicated strong real-world readiness.

Building the right architecture was important for production deployment. We designed a serverless, event-driven system using [LiveKit](<https://livekit.io/>) as the transport layer. LiveKit abstracts the complexities of [WebRTC](<https://webrtc.org/>) for web clients and [Session Initiation Protocol (SIP)](<https://www.sipforum.org/technology/sip-technology/>) for phone calls. This allowed the engineering team to focus entirely on agent logic.

_Figure 4 – Conversational AI assistant – Solution architecture_

The voice agent integrates with dealership operations through Python function-based tools, which represent actions the assistant can perform during a conversation. Common tools include inventory search, appointment booking, and customer data lookup. These tools act as the integration layer between Amazon Nova 2 Sonic and backend services. The model decides when a tool should be used, and the Python function executes the corresponding GraphQL query or mutation, returning structured data back to the agent.

[AWS Fargate](<https://aws.amazon.com/fargate/>) provided the compute layer. We containerized LiveKit Agents on [Amazon Elastic Container Service (Amazon ECS)](<https://aws.amazon.com/pm/ecs>). This enabled independent scaling of agent workers versus media servers. Resources could be optimized dynamically during peak dealership hours. [Amazon Relational Database Service (Amazon RDS)](<https://aws.amazon.com/rds/>) was used as the persistent relational store for structured application data including dealership configurations, conversation history, and customer records.

Real-time voice agents cannot tolerate database latency. [Amazon ElastiCache](<https://aws.amazon.com/elasticache/>) is used to handle room management and ephemeral session coordination across distributed tasks. Amazon Bedrock provided direct access to the Nova 2 Sonic model.

Browser clients connected using [WebRTC](<https://webrtc.org/>) (Web Real-Time Communications), open-source framework for peer-to-peer audio, video and data transmission. Traditional phone calls entered through a SIP Trunk routed via Network Load Balancer. This allowed TCP/UDP throughput for media packets.

Observability came from [Langfuse](<https://langfuse.com/>), self-hosted on AWS. It traced every agent decision and tool call. This data was fed back into the evaluation pipeline for continuous improvement.

## Demo

The following video demonstrates the functionality.

## A new standard for conversational AI

The transition from text-based chatbots to real-time voice agents represents more than an interface change. It requires fundamentally different infrastructure and thinking. Nova 2 Sonic hits three critical engineering requirements simultaneously. First, it provides high reasoning capability without intermediate text conversion. Second, it delivers low latency that enables natural, human-like interruption. Third, it offers production viability with cost-effectiveness for thousands of locations.

For automotive dealerships, this technology is already driving revenue in production. Customers receive immediate, helpful responses when they call. Complex requests get handled smoothly in a single conversation. Appointments get scheduled correctly without frustrating back-and-forth exchanges.

The implications extend far beyond automotive sales. Industries requiring real-time, intelligent voice interactions can benefit. Imagine a travel agent that helps you plan an entire holiday through natural conversation. Picture an educational tutor that adapts to your speaking style and learning pace. Consider healthcare scheduling systems that handle complex insurance and availability questions.

Speech-to-speech AI has reached production readiness. Start experimenting with Nova 2 Sonic in your own AWS environment. Build prototypes, test edge cases, and explore what’s possible for your business.

This post represents a collaboration between AWS and Loka, who specialize in building production-ready AI solutions. Loka’s team has already solved the hard problems around architecture, evaluation, and optimization. Their automotive dealership experience translates directly to other industries.

Speech-to-speech AI is still in its early days. The best applications haven’t been invented yet. Your industry knowledge combined with this technology could create breakthrough solutions. Start your journey with [Nova 2 Sonic](<https://nova.amazon.com/sonic>) and [Loka](<https://partners.amazonaws.com/partners/0010h00001hfV65AAE/Loka>) today. Transform how your customers experience conversation with your business.

* * *

## About the authors

### Bojan Jakimovski

Bojan Jakimovski is a Machine Learning Lead at Loka, an AWS Ambassador, and a 9x AWS Certified professional. He holds a Master’s degree in Electrical Engineering and Information Technologies from FEEIT, specializing in Dedicated Computer Systems, and brings expertise across machine learning, deep learning, MLOps, and cloud-native architectures on AWS. As a hands-on practitioner, he designs and deploys scalable AI systems, with a strong focus on Generative AI, distributed training, and production-grade ML infrastructure. His interests also extend to high-performance computing, federated learning and real-time sensitive systems, where he continues to explore efficient and scalable approaches to modern AI systems.

### Nina Cvetkovska

Nina Cvetkovska is a Machine Learning Engineer at Loka and an AWS Certified Machine Learning Specialist. She holds a background in Software Engineering from FCSE, bringing a strong academic foundation to her hands-on work in ML and AI. As a practitioner, Nina focuses on building and deploying machine learning solutions with interests in computer vision, edge AI, and real-time multimodal systems, including speech-to-speech applications, where she explores efficient and low-latency approaches to modern AI.

### Venkat Gomatham

Venkat Gomatham is a Senior Partner Solutions Architect at AWS, providing strategic guidance to partners in their cloud transformation journey. With 22+ years as an IT architect, he drives innovation and digital transformation initiatives, helping organizations modernize their IT landscapes through cutting-edge technologies like Agentic and Physical AI.

### Arabinda Pani

Arabinda Pani is a Principal Generative AI Specialist Solutions Architect at AWS, where he helps enterprise customers and strategic partners design, build, and scale generative AI and agentic AI solutions. As part of the AMER Generative AI Specialist PSA team, he leads technical enablement and thought leadership initiatives centered on Amazon Bedrock, Amazon Nova, and agentic AI — driving significant partner adoption and business impact across the Americas. With 22+ years of IT experience spanning database engineering, cloud architecture, and AI/ML, Arabinda brings deep technical expertise and a strong track record of translating complex AI capabilities into real-world business value. He holds an MBA from San Diego State University, a B.Tech. from NIT Warangal, and is an AWS Certified Solutions Architect – Professional.
