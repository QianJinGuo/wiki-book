---
title: build-ai-powered-dashboard-automation-agents-with-nlp-on-ama
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/build-ai-powered-dashboard-automation-agents-with-nlp-on-amazon-bedrock-agentcore/
tags: [aws-china-blog, agentic-ai, context-engineering]
author: 
publish_time: 
sha256: 6a8b00fcc462
created: 2026-05-22
updated: 2026-05-22
---


# Build AI-powered dashboard automation agents with NLP on Amazon Bedrock AgentCore

Business analysts often wait days for dashboard modifications when responding to changing business requirements. Traditional processes involve submitting modification requests to IT teams, who interpret requirements, navigate API documentation, understand table schemas, and deploy changes. While this approach maintains proper oversight and quality control, it can result in multi-day turnaround times when rapid dashboard updates are needed.

This solution combines the power of [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/), [Strands Agents](https://github.com/strands-agents/sdk-python/tree/main), and [Amazon Quick](https://aws.amazon.com/quick/) transforms to deliver a secure, scalable, and intelligent system for building and operating AI agents while transforming data into actionable business insights.

## **Solution overview**

In this solution, we use a multi-agent architecture built with Amazon Bedrock AgentCore and the Strands framework. Amazon Bedrock AgentCore is an agentic platform for building, deploying, and operating effective agents securely at scale, no infrastructure management needed. It accelerates agents to production with intelligent memory and a gateway to enable secure, controlled access to tools and data. It runs agents with production-grade security and dynamic scaling and monitors performance and quality in production. Strands Agents is a code-first framework for building agents with integration to AWS services. The solution also uses Amazon Quick which delivers AI-powered BI capabilities, transforming your scattered data into strategic insights for everyone so you can make faster decisions and achieve better business outcomes.

The architecture comprises three specialized agents working together. The _Find Dashboard Agent_ performs discovery operations including searching dashboards and retrieving column metadata from dashboards and datasets. The _Modify Dashboard Agent_ executes configuration changes by validating columns, updating table visuals, and creating new dashboard versions. The _Orchestrator Agent_ routes user requests to the appropriate specialized agents based on intent classification.

The Orchestrator Agent serves as the entry point for user interactions. When users submit natural language queries like “Add lastname to the testing dashboard”, Amazon Nova classifies requests as conversational or operational. Conversational queries receive direct responses using Nova’s large language model (LLM) capabilities. Operational requests are routed through the Strands framework to specialized agents, validates changes against available dataset columns, and executes modifications autonomously while maintaining security controls, audit trails, and preserving original dashboards for rollback purposes.The following diagram illustrates the solution architecture and workflow.

![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/20/image-35.png)

The architecture includes the following components:

*   **Amazon Bedrock AgentCore** – Hosts the Strands Agent orchestrator and specialized sub-agents.
*   **Amazon Nova** – Provides natural language processing (NLP) and reasoning capabilities.
*   **Amazon Quick** – The target service for dashboard discovery and modification operations.
*   **AgentCore Memory** – Maintains conversation context and session state.
*   **Amazon Bedrock AgentCore Observability** – Logs agent decisions and traces API interactions.

To implement the agentic AI solution for Quick self-service, complete the following high-level steps:

1.  Build the agents (Find Dashboard Agent, Modify Dashboard Agent, and Orchestrator Agent).
2.  Deploy the agents to Amazon Bedrock AgentCore.
3.  Test the agent through the AWS Management Console.

## **Prerequisites**

To implement this solution, you must have the following prerequisites:

*   An AWS account with permissions for Amazon Bedrock, Amazon Quick, and AWS Identity and Access Management (IAM). For creating a new dashboard, refer to [Create an Amazon Quick dashboard](https://docs.aws.amazon.com/quick/latest/userguide/example-create-a-dashboard.html) for more information.
*   An active Amazon Quick account with existing dashboards ([creating guide](https://docs.aws.amazon.com/quick/latest/userguide/example-prepared-data-set.html)).
*   IAM permissions configured to grant the agent access to Quick Application Programming Interfaces (APIs):
    *   `quicksight:ListDashboards`
    *   `quicksight:DescribeDashboard`
    *   `quicksight:DescribeDashboardDefinition`
    *   `quicksight:DescribeDataSet`
    *   `quicksight:CreateDashboard`
*   Python 3.10 or later (Python 3.10-3.13 supported for direct code deployment).
*   The uv package manager installed ([installation guide](https://docs.astral.sh/uv/getting-started/installation/)).
*   AWS Command Line Interface (AWS CLI) configured with appropriate credentials.
*   Basic understanding of Python and AWS services.

## **Walkthrough**

To build, deploy, and test your AI-powered dashboard automation solution using Amazon Bedrock AgentCore_,_ follow these four steps:

### **Step 1: Build Quick self-service agents to find and modify dashboards**

Build three core agents that power the Quick self-service solution:

1.  Find Dashboard Agent for discovery operations.
2.  Modify Dashboard Agent for modification operations.
3.  Orchestrator Agent that coordinates between them.

Let’s explore each agent’s role and implementation.

**1.1 Build the Find Dashboard Agent**

This agent handles dashboard discovery operations required for subsequent viewing or modification actions. For example, when a user submits a natural language query such as “show me a report with name ‘testing’,” the orchestrator invokes this agent, which executes the `list_dashboards` API to retrieve dashboard metadata, filters results based on search criteria, and returns matching dashboards in a structured format.

This discovery agent offers three core capabilities: dashboard search with support for both exact and partial name matching, listing available dashboards in the account, and retrieving column information from both dashboards and their underlying datasets. These discovery functions serve as a prerequisite for dashboard operations, as identifying the target dashboard is required before executing modifications or retrievals.

Each capability is implemented as a Strands @tool function. The following snippet shows the find dashboard tool, which calls the `list_dashboards` API and filters results using partial name matching:

```
from strands import Agent, tool
from strands.models import BedrockModel

@tool

def find_dashboard_tool(dashboard_name: str = "") -> str:
  """Find Quick dashboards by name (supports partial matching)"""
  client = boto3.client('quicksight', region_name=REGION)

  response = client.list_dashboards(AwsAccountId=AWS_ACCOUNT_ID)

  dashboards = response.get('DashboardSummaryList', [])

  # List all dashboards if no search term provided

  if not dashboard_name or dashboard_name.strip() == "":
   all_names = [d['Name'] for d in dashboards]
   return f"All dashboards ({len(all_names)}): {all_names}"

  # Filter using case-insensitive partial matching

  matches = [d['Name'] for d in dashboards if dashboard_name.lower() in d['Name'].lower()]
      return f"Found {len(matches)} dashboards: {matches}"
```

The agent then wraps these tool functions inside a Strands Agent and exposes itself as a @tool so the orchestrator can invoke it with natural language queries:

```
_find_agent = Agent(
  model=BedrockModel(model_id=MODEL_ID),
  tools=[find_dashboard_tool, get_columns_tool],
  system_prompt="You are the Find Dashboard Agent. Help users find dashboards and view columns."

)

@tool

def find_dashboard_agent(query: str) -> str:
 """Agent wrapper exposed as a tool for the orchestrator to invoke"""
 response = _find_agent(query)
 return str(response)
```

This agent-as-tool pattern is what enables the multi-agent architecture. The orchestrator doesn’t call Quick APIs directly, it invokes this agent, which handles natural language understanding and API calls internally.

**1.2 Build the Modify Dashboard Agent**

With discovery capabilities in place, the next agent handles dashboard configuration changes through a validation-first workflow. Consider a user request like “add lastname to the testing dashboard.” The orchestrator routes this to the Modify Dashboard Agent, which validates the column exists in the dataset schema, retrieves the complete dashboard definition using the `describe_dashboard_definition` API, updates table visual field wells and field options, and creates a new dashboard version using the create\_dashboard API.

This modification agent supports two primary operations: adding columns to dashboards (after validating the requested column exists in the underlying dataset but isn’t already present) and removing columns from dashboards (after confirming the column is currently displayed). Rather than modifying existing dashboards, it creates new dashboards with unique identifiers, preserving the original for audit purposes and supporting rollback if needed.

This validation-first approach helps validate data integrity and prevent configuration errors, while preserving original dashboards supports compliance with governance requirements and provides an audit trail for modifications.

The following snippet shows the core modification tool. It validates the request, updates the dashboard definition’s table visual field wells, and creates a new dashboard:

```
@tool

def modify_dashboard(dashboard_name: str, action: str, column_name: str) -> str:
"""Modify a dashboard by adding or removing columns"""
client = boto3.client('quicksight', region_name=REGION)
info = _get_dashboard_and_dataset_info(dashboard_name)

# Validation-first: verify column state before making changes
if action == "add":
if column_name in info["dashboard_columns"]:
return f"Column '{column_name}' is already in the dashboard."
if column_name not in info["dataset_columns"]:
return f"Column '{column_name}' doesn't exist in dataset."
elif action == "remove":
if column_name not in info["dashboard_columns"]:
return f"Column '{column_name}' is not in the dashboard."

# Update table visual field wells in the dashboard definition
updated_definition = info["definition"]
for sheet in updated_definition.get('Sheets', []):
for visual in sheet.get('Visuals', []):
if 'TableVisual' in visual:
field_wells = visual['TableVisual']['ChartConfiguration']['FieldWells']
existing_fields = field_wells['TableAggregatedFieldWells']['GroupBy']
if action == "add":
existing_fields.append({
'CategoricalDimensionField': {
'FieldId': str(uuid.uuid4()),
'Column': {
'DataSetIdentifier': dataset_id,
'ColumnName': column_name
}
}
})

elif action == "remove":
existing_fields = [f for f in existing_fields
if f['CategoricalDimensionField']['Column']['ColumnName'] != column_name]

# Create new dashboard with UUID suffix, original is preserved for rollback
new_uuid = str(uuid.uuid4())[:8]
client.create_dashboard(
AwsAccountId=AWS_ACCOUNT_ID,
DashboardId=f"dashboard_{new_uuid}",
Name=f"{info['dashboard_name']}_dashboard_{new_uuid}",
Definition=updated_definition
)

Like the Find Dashboard Agent, this tool is wrapped inside a Strands Agent and exposed as a @tool for the orchestrator:
_modify_agent = Agent(
model=BedrockModel(model_id=MODEL_ID),
tools=[modify_dashboard],
system_prompt="You are the Modify Dashboard Agent. You add or remove columns from dashboards."
)

@tool
def modify_dashboard_agent(query: str) -> str:
"""Agent wrapper for the orchestrator to invoke with natural language"""
response = _modify_agent(query)
return str(response)
```

The agent extracts the dashboard name, action, and column name from the user’s natural language query and passes them to the `modify_dashboard` tool, which handles validation and execution.

**1.3 Create the Orchestrator Agent**

The final component coordinates the Find Dashboard Agent and Modify Dashboard Agent as tools within the Strands framework. This orchestrator defines system prompts that instruct routing logic, specifying which agent handles discovery operations versus modification operations. The configuration includes tool registration for both specialized agents, allowing the orchestrator to invoke them based on classified intent.

The routing logic handles multiple query patterns through natural language understanding. Direct requests containing explicit parameters such as dashboard names and column names are immediately delegated to the appropriate specialized agent. Ambiguous requests lacking required parameters trigger follow-up questions to gather missing information before routing. This implementation pattern allows the orchestrator to function as a coordinator rather than an executor, delegating Quick API operations to specialized agents while focusing solely on intent analysis and routing decisions.

The following snippet shows the orchestrator registering both agents as tools and defining the routing logic through its system prompt:

```
from find_dashboard_agent import find_dashboard_agent
from modify_dashboard_agent import modify_dashboard_agent
orchestrator = Agent(
model=BedrockModel(model_id=MODEL_ID),
tools=[find_dashboard_agent, modify_dashboard_agent],
system_prompt="""You are an Amazon Quick Orchestrator. Route user requests to specialized agents.

AGENTS:
- find_dashboard_agent: Finding dashboards, listing, showing columns
- modify_dashboard_agent: Adding/removing columns

ROUTING LOGIC:
- "find", "show", "list", "get", "columns" → find_dashboard_agent
- "add", "remove", "modify", "delete" → modify_dashboard_agent"""
)
```

The Bedrock AgentCore integration exposes this orchestrator as the entry point that receives user requests:

```
app = BedrockAgentCoreApp()
@app.entrypoint
def invoke(payload):
user_input = payload.get("prompt", "")
response = orchestrator(user_input)
return response.message['content'][0]['text']
```

Because `find_dashboard_agent` and `modify_dashboard_agent` are each wrapped as @tool functions, the orchestrator treats them like any other tool. Amazon Nova analyzes the user’s intent and invokes the appropriate agent automatically.

### **Step 2: Set up project for agent deployment**

Deploy the agents to Amazon Bedrock AgentCore using direct code deployment. This involves initializing the project, adding dependencies, creating the agent files, and deploying to the runtime environment.

**2.1 Initialize project**

Set up a new Python project using the uv package manager, then navigate into the project directoryuv init quicksight-selfservice-agentcd quicksight-selfservice-agentThis creates a new project structure with the necessary configuration files for managing dependencies and deploying your agent.

**2.2 Add dependencies for the project**

Install the required Amazon Bedrock AgentCore libraries and development tools for your project. In this example, dependencies are added using the uv add command:

```
uv add bedrock-agentcore strands-agents strands-agents-tools

uv add --dev bedrock-agentcore-starter-toolkit
```

Activate the virtual environment:

```
# For Linux/macOS

source .venv/bin/activate

# For Windows

source .venv/Scripts/activate
```

These dependencies provide the core framework for building and deploying your agent, including the Strands SDK for agent creation and the Amazon Bedrock AgentCore toolkit for deployment management.

**2.3 Create the agent.py file**

Download the complete implementation from the [GitHub repository](https://code.aws.dev/personal_projects/alias_s/sathvel/agenticai-quicksight/-/tree/ah/agents_v1?ref_type=heads) as a zip file. Extract the zip and copy the following files to your project root directory:

*   `agent.py` – Main orchestrator agent entry point with Amazon Bedrock AgentCore integration
*   `find_dashboard_agent.py` – Specialized agent for dashboard discovery operations
*   `modify_dashboard_agent.py` – Specialized agent for dashboard modification operations
*   `shared/` folder – Contains config.py for shared AWS service client configuration

Other required files such as pyproject.toml and configuration files are already part of the project setup from the initialization step. With these files in place, you can now deploy the Quick self-service agent to Amazon Bedrock AgentCore.

### **Step 3: Deploy to Amazon Bedrock AgentCore Runtime**

Amazon Bedrock AgentCore provides a managed environment for deploying Strands Agents with two deployment options: container-based deployment and direct code deployment. For this solution, we can use direct code deployment.

**3.1 Configure your agent to Amazon Bedrock AgentCore**

Run the following command to configure the Quick self-service agent

```
agentcore configure --entrypoint agent.py --name qs_selfservice_agent

Detected dependency file: pyproject.toml
Press Enter to use this file, or type a different path (use Tab for autocomplete):
Path or Press Enter to use detected dependency file: pyproject.toml
✓ Using requirements file: pyproject.toml
Deployment Configuration
Select deployment type:
Direct Code Deploy (recommended) - Python only, no Docker required
Container - For custom runtimes or complex dependencies
Choice [1]: 1
Select Python runtime version:
PYTHON_3_10
PYTHON_3_11
PYTHON_3_12
PYTHON_3_13
Choice [4]: 4 ✓ Deployment type: Direct Code Deploy (python.3.13)
Execution Role
Press Enter to auto-create execution role, or provide execution role ARN/name to use existing
Execution role ARN/name (or press Enter to auto-create):
✓ Will auto-create execution role
S3 Bucket Press Enter to auto-create S3 bucket, or provide S3 URI/path to use existing S3 URI/path (or press Enter to auto-create):
✓ Will auto-create S3 bucket
Authorization Configuration  Note: AgentCore uses IAM authorization.
Configure OAuth authorizer instead? (yes/no) [no]:
✓ Using default IAM authorization
Request Header Allowlist Configure which request headers are allowed to pass through to your agent.
Common headers: Authorization, X-Amz-Bedrock-AgentCore-Session-.
Configure request header allowlist? (yes/no) [no]:
✓ Using default request header configuration
Configuring BedrockAgentCore agent: Agent1

Memory Configuration
Tip: Use --disable-memory flag to skip memory entirely

MemoryManager initialized for region: us-east-1
Existing memory resources found:
1. agent_mem-RLr7b8Hsif
ID: agent_mem-RLr7b8Hsif
2. orchestrator_agent_mem-kP9yQc96nd
ID: orchestrator_agent_mem-kP9yQc96nd
Options:
• Enter a number to use existing memory
• Press Enter to create new memory
• Type 's' to skip memory setup
Your choice:
✓ Short-term memory will be enabled (default)
• Stores conversations within sessions
• Provides immediate context recall

Optional: Long-term memory
• Extracts user preferences across sessions
• Remembers facts and patterns
• Creates session summaries
• Note: Takes 120-180 seconds to process

Enable long-term memory? (yes/no) [no]:
✓ Using short-term memory only
Will create new memory with mode: STM_ONLY
Memory TTL duration: Short term only
Network mode: PUBLIC
Changing default agent from 'Agent1' to 'Agent2'
```

The configuration process prompts you to configure deployment settings including deployment type (select option 1 for Amazon Simple Storage Service (Amazon S3) deployment) and default to all other instructions.

**3.2 Deploy your agent to the AgentCore Runtime environment:**

Run the following command to [deploy](https://aws.github.io/bedrock-agentcore-starter-toolkit/api-reference/cli.html) the Quick self-service agent to Amazon Bedrock

This command builds and pushes the code to Amazon S3, and deploys the agent in Amazon Bedrock AgentCore, making it ready to receive and process requests.

### **Step 4: Test the agent**

Test your agent using the AWS Management Console. The console provides a built-in test environment through the Amazon Bedrock AgentCore interface. Follow these steps to test your agent:

1.  Navigate to the Amazon Bedrock AgentCore console.
2.  Verify that the agent got created.
    1.  Navigate to the Amazon Bedrock AgentCore console in the AWS Management Console.
    2.  Locate your agent in the Runtime resources list (for example, `qs_selfservice_agent`) should appear with a “Ready” status and a green checkmark in the Status column.
    3.  The Endpoints section shows the DEFAULT endpoint with a “Ready” status.
    4.  After both the agent and its endpoint show “Ready” status, your agent has been successfully created and deployed.
3.  Select the agent ‘DEFAULT’ endpoint and Test endpoint. ![Amazon Bedrock AgentCore Runtime console showing the qs\_selfservice\_agent configuration with Ready status, DEFAULT endpoint, Version 1, and observability metrics.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/09/ML-18921-image-2-2.png)
4.  In the testing window, provide the following prompt to invoke “Find dashboard agent”:

_{“prompt” : “can you show dashboards with name testing”}_

![Amazon Bedrock AgentCore Agent Sandbox testing interface showing qs\_selfservice\_agent with a dashboard search query input and agent response confirming a matching dashboard found.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/09/ML-18921-image-3-1.png)

5.  The agent responds with relevant number of dashboards it found. Further prompt to modify the dashboard to invoke modify dashboard agent.

_{“prompt” : “Can you add firstname column to the testing\_dashboad”}_

![Amazon Bedrock AgentCore Agent Sandbox showing qs\_selfservice\_agent successfully adding a firstname column to a QuickSight testing dashboard with a detailed success response.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/09/ML-18921-image-4-1.png)

6.  The initial “XYZ\_testing” dashboard doesn’t contain the firstname column, as shown in the following table.

**employeenumber**

**lastname**

**clientid**

**A1001**

LN1

A

**A1002**

LN2

A

**A1003**

LN3

A

**A1004**

LN4

A

**A1005**

LN5

A

**B1001**

LN6

B

**B1002**

LN7

B

**B1003**

LN8

B

**B1004**

LN9

B

**B1005**

LN10

B

**C1001**

LN11

C

**C1002**

LN12

C

**C1003**

LN13

C

**C1004**

LN14

C

**C1005**

LN15

C

7.  The modified “XYZ\_testing” dashboard includes the newly added firstname column, as shown in the following table.

**employeenumber**

**lastname**

**clientid**

**Firstname**

**A1001**

LN1

A

FN1

**B1005**

LN10

B

FN10

**C1001**

LN11

C

FN11

**C1002**

LN12

C

FN12

**C1003**

LN13

C

FN13

**C1004**

LN14

C

FN14

**C1005**

LN15

C

FN15

**A1002**

LN2

A

FN2

**A1003**

LN3

A

FN3

**A1004**

LN4

A

FN4

**A1005**

LN5

A

FN5

**B1001**

LN6

B

FN6

**B1002**

LN7

B

FN7

**B1003**

LN8

B

FN8

**B1004**

LN9

B

FN9

As you see, firstname column got added successfully and newly modified dashboard got created. You have created a solution that uses a multi-agent architecture powered by Amazon Bedrock AgentCore and the Strands framework to enable self-service dashboard management for finding a dashboard or modifying a dashboard. You also created an Orchestrator Agent that intelligently routes user requests based on intent.

## **Clean up**

To avoid incurring future charges, delete the following resources:

1.  **Delete the AgentCore Runtime deployment** using the AWS Console or CLI:
    
    ```
    aws bedrock-agentcore delete-agent-runtime --agent-id <agent-id> --region <region>
    ```
    
2.  **Remove the ECR repository** – Navigate to the [Amazon Elastic Container Registry (Amazon ECR) console](https://console.aws.amazon.com/ecr/) and delete the container repository created during deployment, or use the following CLI command:
    
    ```
    aws ecr delete-repository --repository-name <repository-name> --region <region> --force
    ```
    
3.  **Remove test Quick dashboards** – Navigate to the [Amazon Quick console](https://quicksight.aws.amazon.com/) and delete modified dashboard versions with UUID suffixes created during testing, or use the following CLI command:
    
    ```
    aws quicksight delete-dashboard --aws-account-id <account-id> --dashboard-id <dashboard-id> --region <region>
    ```
    
4.  **Delete Amazon CloudWatch Log groups** – Navigate to the [Amazon CloudWatch console](https://console.aws.amazon.com/cloudwatch/) and remove log groups associated with the agent (format: `/aws/bedrock/agentcore/<agent-id>`), or use the following CLI command:
    
    ```
    aws logs delete-log-group --log-group-name /aws/bedrock/agentcore/<agent-id> --region <region>
    ```
    

## **Conclusion**

In this post, we combined Strands Agents, Amazon Bedrock AgentCore, and Amazon Nova to turn multi-day dashboard modification requests into seconds-long natural language interactions. The orchestrator-subagent pattern extends beyond Quick to other API-driven services where business users depend on IT for routine changes. Using this pattern, organizations can build autonomous AI systems that accelerate operational workflows while maintaining enterprise security, audit trails, and rollback capabilities.

Try out the solution, and if you have any comments or questions, leave them in the comments section.

* * *

## About the authors
