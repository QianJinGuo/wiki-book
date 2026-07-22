---
source_url: "https://aws.amazon.com/blogs/machine-learning/build-a-healthcare-appointment-agent-with-amazon-nova-2-sonic/"
ingested: 2026-06-26
sha256: 62a10c7fd9909cd4
---

# Build a healthcare appointment agent with Amazon Nova 2 Sonic

If you run a clinic or hospital network, you already know the cost of missed appointments. The average no-show rate across US healthcare sits between 5–30 percent, [depending on specialty](<https://www.healthcarefinancenews.com/news/missed-appointments-cost-providers-150-billion-annually-report-says>). Each empty slot represents lost revenue, idle provider time, and delayed patient care. The standard fix, calling patients one by one to confirm or reschedule, doesn’t scale.

In this post, you will learn how to build a voice agent that handles appointment reminder conversations using [Amazon Nova 2 Sonic](<https://docs.aws.amazon.com/nova/latest/nova2-userguide/using-conversational-speech.html>) and [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>). The agent authenticates patients by voice, manages appointments (confirm, cancel, or reschedule), collects pre-visit health information, and escalates to human staff when needed. You handle routine calls at scale, which can help reduce no-show rates. This sample focuses on the agentic side of the problem: voice conversation and tool orchestration. A browser-based interface is included for testing. To connect the agent to actual phone lines for outbound dialing, you would integrate a telephony service such as [Amazon Connect Customer](<https://aws.amazon.com/connect/>).

This walkthrough takes you through the full build. You get a working voice agent on Amazon Bedrock that conducts natural appointment conversations using the speech-to-speech capabilities of Amazon Nova 2 Sonic, plus seven healthcare-specific tools built with the Strands Agents SDK for patient authentication, scheduling, and escalation. The serverless deployment runs on Amazon Bedrock AgentCore with [Amazon Cognito](<https://aws.amazon.com/cognito/>) authentication, [Amazon DynamoDB](<https://aws.amazon.com/dynamodb/>) persistence, and [Amazon Simple Notification Service (Amazon SNS)](<https://aws.amazon.com/sns/>) notifications. A browser-based React frontend streams bidirectional audio over authenticated WebSocket connections.

## Solution overview

To automate appointment calls effectively, you need a conversational AI system that handles multiple steps in a single interaction: verifying identity, presenting appointment details, processing changes, and collecting health information.

A traditional approach chains together separate services. A speech-to-text model transcribes the patient’s words, a text-based large language model (LLM) generates a response, and a text-to-speech model reads it back. Each handoff introduces latency and drops context. The transcription step discards vocal cues like tone, hesitation, and urgency. The LLM doesn’t hear _how_ the patient said something, only _what_ they said. In healthcare, where a patient’s anxiety or confusion should change how the agent responds, that loss matters.

This agent takes a different approach by combining two AWS services.

### Amazon Nova 2 Sonic

Amazon Nova 2 Sonic is a speech-to-speech model available on Amazon Bedrock that enables real-time conversational AI with bidirectional streaming. Instead of chaining separate transcription, reasoning, and synthesis services, Nova 2 Sonic processes speech natively in a single model—so vocal context like tone and pace isn’t lost to transcription. For more information about how Nova 2 Sonic processes speech and adapts to acoustic context, see the [Introducing Amazon Nova Sonic](<https://aws.amazon.com/blogs/aws/introducing-amazon-nova-sonic-human-like-voice-conversations-for-generative-ai-applications/>) blog post.

For this agent, Nova 2 Sonic provides several key capabilities. Its native speech-to-speech processing retains vocal nuance across turns, so the agent picks up on hesitation or concern without losing context. Tool-calling accuracy keeps multi-step healthcare workflows on track. The model knows when to authenticate, when to query schedules, and when to book. Low-latency bidirectional streaming keeps conversations responsive. The model is also designed to handle background noise common in home and clinical environments, and accented English. Finally, multilingual support lets the agent switch to the patient’s preferred language mid-conversation without configuration changes. See the [Amazon Nova 2 Sonic documentation](<https://docs.aws.amazon.com/nova/latest/nova2-userguide/using-conversational-speech.html>) for supported languages.

### Amazon Bedrock AgentCore

Amazon Bedrock AgentCore provides a serverless, framework-agnostic runtime for running AI agents at scale with enterprise security. You deploy your agent logic as a container, and AgentCore handles infrastructure, scaling, and AWS Identity and Access Management (IAM)-authenticated WebSocket endpoints. This implementation uses the Strands Agents SDK’s `BidiAgent` class to manage bidirectional voice streaming with Nova 2 Sonic.

## Architecture

The following diagram shows how the components connect. A React frontend communicates with Amazon Bedrock AgentCore through a SigV4-signed WebSocket connection. The Strands `BidiAgent`, powered by Nova 2 Sonic, handles real-time voice conversations and invokes healthcare tools that read from and write to DynamoDB tables and publish to Amazon SNS.

_Figure 1: Architecture for the healthcare appointment agent_

The React frontend captures microphone audio in the browser and streams it to the agent over a WebSocket, a protocol that keeps a persistent two-way connection open between client and server. To secure that connection, the frontend authenticates users through Amazon Cognito (an identity service that issues temporary AWS credentials) and signs each request with SigV4, the standard AWS request-signing protocol.

Amazon Bedrock AgentCore Runtime hosts the containerized Strands `BidiAgent`, managing infrastructure and scaling. Nova 2 Sonic receives audio input, reasons for the conversation, invokes tools when needed, and generates audio responses. Three DynamoDB tables store patient records, appointment details, and available time slots. Amazon SNS publishes escalation notifications when a patient asks to speak with a human.

### Wiring it together

The Strands SDK handles the complexity of bidirectional voice streaming. The entire agent setup fits in a few lines:
    
    
    from strands.experimental.bidi import BidiAgent
    from strands.experimental.bidi.models import BidiNovaSonicModel
    
    model = BidiNovaSonicModel(
        region="us-east-1",
        model_id="amazon.nova-2-sonic-v1:0",
        provider_config={
            "audio": {
                "input_sample_rate": 16000,
                "output_sample_rate": 16000,
                "voice": "tiffany",
            }
        },
        tools=tools,  # The seven healthcare tools listed below
    )
    
    agent = BidiAgent(
        model=model,
        tools=tools,
        system_prompt=system_prompt,
    )
    
    # In the WebSocket handler, connect inputs and outputs
    await agent.run(
        inputs=[receive_audio],
        outputs=[send_audio],
    )

You pass your tools list and system prompt to `BidiAgent`, point it at Nova 2 Sonic, and the SDK manages the streaming session. It receives audio, invokes tools when the model decides to, and sends audio responses back.

## Healthcare tools

The voice agent uses seven tools to move through each call. Each tool is implemented as a Python function decorated with the Strands Agents SDK’s `@tool` decorator. Nova 2 Sonic decides when to invoke each tool based on what the patient says. For example, when a patient asks to reschedule, Nova 2 Sonic calls `find_available_slots` to query DynamoDB, presents the options by voice, and then calls `book_appointment_slot` to finalize the change.

This tool-based design means you can swap or extend individual tools without rewriting the rest of the agent. To add a new capability (for example, collecting insurance information), you write one new `@tool` function and update the system prompt.

**Tool** | **What it does** | **How it works**  
---|---|---  
`authenticate_patient` | Verifies identity using first name, last name, and last four digits of SSN. | Queries the DynamoDB Patients table through a [Global Secondary Index (GSI)](<https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html>). Enforces a three-attempt limit per name combination. On success, returns patient details and upcoming appointments.  
`confirm_appointment` | Confirms an existing appointment. | Updates appointment status from `Scheduled` or `Rescheduled` to `Confirmed` in DynamoDB. Includes idempotent checks to prevent double-confirmation.  
`cancel_appointment` | Cancels an appointment with an optional reason. | Updates status to `Canceled` with a timestamped note. Only operates on `Scheduled`, `Confirmed`, or `Rescheduled` appointments.  
`find_available_slots` | Queries open time slots for rescheduling. | Looks up the provider from the appointment record and queries the `AvailableSlots` table through the `ProviderDateIndex` GSI. Returns up to three options to keep the voice conversation concise.  
`book_appointment_slot` | Books a selected time slot. | Uses DynamoDB conditional writes to atomically mark the slot as taken, preventing double-booking under concurrent requests. Updates the appointment with the new date and time.  
`record_health_update` | Captures pre-visit health information. | Appends timestamped notes to the appointment record. Collects four items (medical conditions, allergies, accompaniment, specific concerns); each asked one at a time.  
`escalate_to_agent` | Flags the call for human callback. | Generates a six-digit reference number, updates the appointment status to `Escalated`, and publishes an Amazon SNS message with patient information and the escalation reason.  
  
## How the agent handles a call

When the agent connects to a patient, the `BidiAgent` manages the full conversation through four phases. The conversation flow is defined in the [agent’s system prompt](<https://github.com/aws-samples/sample-Nova-Sonic-AgentCore-Healthcare-Call-Center/blob/main/backend/prompts/healthcare_system_prompt.txt>), which you can customize for your use case. Here is an excerpt from the reschedule flow, which shows how the prompt drives multi-tool orchestration:
    
    
    ## RESCHEDULE FLOW
    If the patient wants to reschedule:
    1. Ask about their preferred time (morning/afternoon, specific days)
    2. Use the find_available_slots tool to find available slots
    3. Present 2-3 options and let them choose
    4. After rescheduling, gather health information (same 4 questions as confirmation)

Nova 2 Sonic follows these instructions to decide when to invoke each tool. You can add new flows or modify existing ones by editing the prompt.

  * **Authentication** – Nova 2 Sonic greets the patient and asks for their full name and the last four digits of their Social Security Number. Before verifying, the agent repeats back what it heard and asks the patient to confirm. This catches speech recognition errors on names or digits. The `authenticate_patient` tool queries DynamoDB to verify the identity. If verification fails after three attempts, the agent escalates to a human for security.
  * **Appointment management** – After verification, Nova 2 Sonic presents the upcoming appointment details, including provider name, date, and time. The patient chooses to confirm, cancel, or reschedule. If they reschedule, the agent gathers preferences (morning or afternoon, preferred dates), queries available slots, presents up to three options, and books the new time.
  * **Health information collection** – For confirmed or rescheduled appointments, the agent collects pre-visit health information. It asks about existing medical conditions, allergies, whether someone will accompany the patient, and any specific concerns for the visit. Each question is asked one at a time for natural conversation flow.
  * **Escalation** – At any point, if the patient asks to speak with a human, the agent captures the reason, generates a six-digit reference number, and publishes an Amazon SNS notification so staff can call the patient back within 24 hours.



## Deploying the agent

The complete source code is available in the [GitHub repository](<https://github.com/aws-samples/sample-Nova-Sonic-AgentCore-Healthcare-Call-Center>). Follow these steps to deploy the agent in your AWS account.

### Prerequisites

Before you start, make sure you have the following:

  * An [AWS account](<https://aws.amazon.com/free/>) with access to [Amazon Bedrock](<https://aws.amazon.com/bedrock>) and the Nova 2 Sonic model in your target AWS Region.
  * [AWS Cloud Development Kit (AWS CDK) v2](<https://docs.aws.amazon.com/cdk/v2/guide/getting-started.html>) installed and [bootstrapped](<https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html>) in your account.
  * [Python 3.12](<https://www.python.org/downloads/>) or later.
  * [Node.js 20](<https://nodejs.org/en/download>) or later.
  * [Docker](<https://docs.docker.com/get-docker/>).



### Step 1: Clone the repository
    
    
    git clone https://github.com/aws-samples/sample-Nova-Sonic-AgentCore-Healthcare-Call-Center.git
    cd sample-Nova-Sonic-AgentCore-Healthcare-Call-Center

### Step 2: Deploy the infrastructure

The AWS CDK stack provisions all the resources you need: Cognito user and identity pools, DynamoDB tables, an Amazon SNS topic, and the AgentCore Runtime with your containerized agent.
    
    
    cd infrastructure
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    cdk deploy --require-approval never

When the deployment finishes, note the AWS CloudFormation outputs. You need the Cognito User Pool ID, Client ID, Identity Pool ID, and AgentCore Runtime ARN to configure the frontend.

### Step 3: Create a test user

Create a Cognito user for testing. Replace `<UserPoolId>` with the value from your CDK output:
    
    
    aws cognito-idp admin-create-user \
        --user-pool-id <UserPoolId> \
        --username testuser \
        --temporary-password TempPass123!
    
    aws cognito-idp admin-set-user-password \
        --user-pool-id <UserPoolId> \
        --username testuser \
        --password <YourSecurePassword> \
        --permanent

### Step 4: Configure and run the frontend

Copy the environment template and fill in the values from your CDK output:
    
    
    cd ../frontend
    npm install
    cp .env.example .env
    # Edit .env with your CDK output values
    npm run dev

Open `http://localhost:5173` in your browser, sign in with your test user, choose a patient from the menu, and choose **Start Call** to begin a voice conversation.

### Step 5: Seed demo data

The CDK stack seeds sample patient records automatically during deployment. If you need to re-seed or customize the data, run:
    
    
    python3 scripts/seed_data.py

For testing, use any of these pre-configured patients:

**Patient name** | **SSN last 4**  
---|---  
John Smith | 1234  
Jane Doe | 5678  
Michael Johnson | 9012  
  
## Sample conversation

The following transcript comes from a test deployment. It shows a complete rescheduling interaction where the agent authenticates the patient, finds a new time slot, books it, and collects pre-visit health details.

_Figure 2: The Healthcare Voice Assistant interface during a live patient call_

Watch the [full demo on YouTube](<https://www.youtube.com/watch?v=KsTOk5iizoo>).

**Agent:** “Hello, this is Nova from Acme Healthcare. I’m calling about your upcoming appointment. For verification, may I have your full name and the last four digits of your Social Security Number?”

**Patient:** “John Smith, 1234.”

**Agent:** “Let me confirm. I heard John Smith, one, two, three, four. Is that correct?”

**Patient:** “Yes, that’s right.”

**Agent:** “Thank you for verifying. I’m calling about your Annual Checkup with Dr. Johnson scheduled for June 14th at 4:30 PM. Would you like to confirm this appointment?”

**Patient:** “Actually, I need to reschedule.”

**Agent:** “I’d be happy to help. Do you prefer morning or afternoon?”

**Patient:** “Morning works better.”

**Agent:** “I found these morning slots with Dr. Johnson: Tuesday July 1st at 9:00 AM or Thursday July 3rd at 10:30 AM. Which works for you?”

**Patient:** “Tuesday at 9 AM.”

**Agent:** “I’ve rescheduled your appointment. Before we finish, I’d like to gather some information to help Dr. Johnson prepare. Do you have any existing medical conditions we should know about?”

**Patient:** “I have high blood pressure.”

**Agent:** “Thank you. Do you have any allergies?”

**Patient:** “I’m allergic to penicillin.”

**Agent:** “Noted. Any specific concerns for this visit?”

**Patient:** “I’ve been having some knee pain.”

**Agent:** “I’ve documented everything for Dr. Johnson. Your appointment is confirmed for Tuesday July 1st at 9:00 AM. Have a great day!”

### Multilingual support

Nova 2 Sonic detects and switches to the patient’s preferred language mid-conversation without any configuration changes on your part. You can find [Spanish and Hindi demos in the GitHub repository](<https://github.com/aws-samples/sample-Nova-Sonic-AgentCore-Healthcare-Call-Center?tab=readme-ov-file#demo>).

## Important considerations

This sample is a reference implementation for demonstration purposes. Amazon Nova Sonic isn’t designed to provide opinions or advice, including medical, legal, or financial advice, and shouldn’t be used as a substitute for clinical judgment. Production deployments that handle protected health information (PHI) require a HIPAA compliance review, an executed Business Associate Addendum (BAA) with AWS, and security and clinical reviews appropriate to your use case.

## Clean up

To avoid ongoing charges, delete the resources when you finish testing:
    
    
    cd infrastructure
    cdk destroy --force

The `cdk destroy` command might not remove all Amazon CloudWatch log groups. Check the [CloudWatch console](<https://console.aws.amazon.com/cloudwatch/home#logsV2:log-groups>) for any remaining log groups created by this deployment and delete them manually.

## Conclusion

In this post, you learned how to build a voice agent that handles appointment reminder conversations using Nova 2 Sonic and Amazon Bedrock AgentCore. This architecture can also adapt to other industries that handle a high volume of customer calls, such as retail or hospitality, by replacing the healthcare tools with your domain’s logic.

## Next steps

Clone the [repository](<https://github.com/aws-samples/sample-Nova-Sonic-AgentCore-Healthcare-Call-Center>) and deploy the agent in your AWS account using the steps in this post. The README covers customization, production readiness, and compliance considerations.

* * *

## About the authors

### Jimin Kim

[Jimin](<https://www.linkedin.com/in/ziggyzimin/>) is a Sr. Prototyping Architect on the AWS Prototyping and AI Customer Engineering (PACE) team. She builds prototypes that help enterprise customers explore what’s possible on AWS. Beyond launching the initial AWS MCP Servers, she guides enterprises in adopting AI-driven development practices. Outside of work, she enjoys knitting, piano, and kettlebell training.

### Shree Krishnamurthi

[Shree](<https://www.linkedin.com/in/shreekrish/>) is a Technical Program Manager with the AWS Prototyping and AI Customer Engineering (PACE) Team in AWS, where she leads strategic prototyping initiatives in artificial intelligence and emerging technologies. With her experience spanning software development, enterprise solutions, and cloud transformation, she specializes in turning cutting-edge technology concepts into practical business solutions.
