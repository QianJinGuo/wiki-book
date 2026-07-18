# AWS Bedrock 多智能体协作指南

## Ch11.009 AWS Bedrock 多智能体协作指南

> 📊 Level ⭐⭐ | 35.9KB | `entities/aws-bedrock-multi-agent-collaboration-guide.md`

## 一、AWS Bedrock 多智能体核心架构

### 1.1 关键服务组件

| 组件 | 用途 | 文档 |
|------|------|------|
| **Amazon Bedrock Agent** | 创建和编排自主 Agent | [官方文档](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html) |
| **AgentForce** | Salesforce 原生多智能体编排 | [官方文档](https://aws.amazon.com/agentforce/) |
| **Bedrock Converse API** | 统一模型调用接口 | [官方文档](https://docs.aws.amazon.com/bedrock/latest/userguide/api-interaction.html) |
| **Bedrock Runtime** | 模型推理端点 | [官方文档](https://docs.aws.amazon.com/bedrock/latest/userguide/br-runtime.html) |
| **Cross-Account Inference** | 跨账户模型调用 | [官方文档](https://docs.aws.amazon.com/bedrock/latest/userguide/cross-account-inference.html) |

### 1.2 Agent 基本结构

```python

# Bedrock Agent 核心组件
agent_config = {
    "agent_name": "multi-agent-coordinator",
    "foundation_model": "anthropic.claude-sonnet-4-20250514",
    "instruction": """You are a task orchestration agent.
    Coordinate specialized agents to complete complex tasks.""",
    "tools": [
        "arn:aws:bedrock:us-east-1:123456789012:agent/agent-id-1",  # 搜索 Agent
        "arn:aws:bedrock:us-east-1:123456789012:agent/agent-id-2",  # 编码 Agent
    ],
    "action_group": {
        "name": "task_delegation",
        "description": "Delegate tasks to specialized agents"
    }
}
```

## 二、Bedrock Agent 创建与配置

### 2.1 单 Agent 创建流程

```python
import boto3

bedrock = boto3.client('bedrock-agent', region_name='us-east-1')

# 创建 Agent
response = bedrock.create_agent(
    agentName='research-agent',
    agentResourceRoleArn='arn:aws:iam::123456789012:role/BedrockAgentRole',
    description='Research specialist agent',
    foundationModel='anthropic.claude-sonnet-4-20250514',
    instruction='''You are a research specialist.
    Your role is to gather, analyze, and synthesize information.
    Always cite your sources and verify facts before reporting.''',
)

agent_id = response['agent']['agentId']
print(f"Created agent: {agent_id}")
```

### 2.2 Agent Alias 与版本管理

```python

# 创建 Agent 版本（快照）
bedrock.create_agent_version(
    agentId=agent_id,
    description='Production version 1.0'
)

# 创建 Alias（指向特定版本）
bedrock.create_agent_alias(
    agentId=agent_id,
    agentAliasName='production',
    agentVersion='1'
)

# 通过 Alias 调用（生产推荐）
alias_arn = f"arn:aws:bedrock:{region}:{account}:agent-alias/{agent_id}/production"
```

## 三、多 Agent 协作模式实现

### 3.1 Orchestrator-Worker 模式

**架构图：**
```
┌─────────────────────────────────────────────────────────┐
│                    Orchestrator Agent                   │
│         (任务分解 → 分配 → 结果聚合 → 响应)              │
└────────────────────────────┬────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ Search Agent │      │  Coder Agent │      │  Doc Agent  │
│  (信息检索)   │      │   (代码编写)  │      │  (文档生成)  │
└─────────────┘      └─────────────┘      └─────────────┘
```

**Python 实现：**

```python
import boto3
from concurrent.futures import ThreadPoolExecutor, as_completed

class BedrockMultiAgentOrchestrator:
    def __init__(self, region='us-east-1'):
        self.bedrock = boto3.client('bedrock-agent-runtime', region_name=region)
        self.agents = {
            'search': 'arn:aws:bedrock:...:agent/search-agent-alias',
            'coder': 'arn:aws:bedrock:...:agent/coder-agent-alias',
            'writer': 'arn:aws:bedrock:...:agent/writer-agent-alias',
        }

    def orchestrate(self, task: str) -> dict:
        """Orchestrator 主流程"""

        # Step 1: 任务分解
        subtasks = self._decompose_task(task)

        # Step 2: 并行执行 Worker Agents
        results = self._execute_workers_parallel(subtasks)

        # Step 3: 结果聚合
        final_response = self._aggregate_results(results)

        return {
            'task': task,
            'subtasks': subtasks,
            'worker_results': results,
            'final_response': final_response
        }

    def _decompose_task(self, task: str) -> list:
        """使用 Orchestrator 分解任务"""
        prompt = f"""Decompose this task into independent subtasks:
        Task: {task}

        Return a JSON array of subtasks, each with:

        - "subtask_id": unique identifier
        - "description": what to do
        - "required_agent": search/coder/writer
        """

        response = self.bedrock.invoke_agent(
            agentAliasId='orchestrator-alias',
            agentId='orchestrator-agent-id',
            sessionId='session-123',
            inputText=prompt
        )

        return self._parse_subtasks(response['completion'])

    def _execute_workers_parallel(self, subtasks: list) -> dict:
        """并行执行多个 Worker Agents"""
        results = {}

        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = {
                executor.submit(self._invoke_agent, subtask): subtask 
                for subtask in subtasks
            }

            for future in as_completed(futures):
                subtask = futures[future]
                try:
                    results[subtask['subtask_id']] = future.result()
                except Exception as e:
                    results[subtask['subtask_id']] = {'error': str(e)}

        return results

    def _invoke_agent(self, subtask: dict) -> dict:
        """调用单个 Worker Agent"""
        agent_alias = self.agents[subtask['required_agent']]

        response = self.bedrock.invoke_agent(
            agentAliasId=agent_alias.split('/')[-1],
            agentId=agent_alias.split(':agent/')[1].split('/')[0],
            sessionId=f"session-{subtask['subtask_id']}",
            inputText=subtask['description']
        )

        return {'agent': subtask['required_agent'], 'output': response['completion']}

    def _aggregate_results(self, results: dict) -> str:
        """聚合 Worker 结果生成最终响应"""
        prompt = f"""Aggregate the following worker results into a coherent response:

        Results: {results}

        Provide a clear, well-structured final answer."""

        response = self.bedrock.invoke_agent(
            agentAliasId='orchestrator-alias',
            agentId='orchestrator-agent-id',
            sessionId='session-aggregate',
            inputText=prompt
        )

        return response['completion']
```

### 3.2 Hierarchical 层叠模式

**架构图：**
```
┌─────────────────────────────────────────────────┐
│              Level 2: Strategy Manager           │
│        (全局规划、资源分配、风险评估)            │
└────────────────────────┬────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Manager A  │   │  Manager B  │   │  Manager C  │
│ Level 1     │   │ Level 1     │   │ Level 1     │
│ (领域A协调)  │   │ (领域B协调)  │   │ (领域C协调)  │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Executor   │   │  Executor   │   │  Executor   │
│  (执行器)    │   │  (执行器)    │   │  (执行器)    │
└─────────────┘   └─────────────┘   └─────────────┘
```

**跨层级通信实现：**

```python
class HierarchicalAgentManager:
    def __init__(self):
        self.strategy_manager = 'arn:aws:bedrock:...:agent/strategy-manager'
        self.domain_managers = {
            'engineering': 'arn:aws:bedrock:...:agent/eng-manager',
            'sales': 'arn:aws:bedrock:...:agent/sales-manager',
            'operations': 'arn:aws:bedrock:...:agent/ops-manager',
        }

    def process_enterprise_request(self, request: str) -> dict:
        """层级处理企业级请求"""

        # Level 2: 战略分解
        strategy_response = self._invoke_agent(
            self.strategy_manager,
            f"""Analyze this enterprise request and create a hierarchical plan:
            Request: {request}

            Return:

            - Strategic objective
            - Domain assignments (engineering/sales/operations)
            - Coordination requirements
            """
        )

        domain_tasks = strategy_response['domain_assignments']

        # Level 1: 领域管理并行执行
        domain_results = {}
        for domain, task in domain_tasks.items():
            domain_results[domain] = self._invoke_agent(
                self.domain_managers[domain],
                task
            )

        # Level 2: 战略整合
        final_response = self._invoke_agent(
            self.strategy_manager,
            f"""Integrate domain results into final strategic response:

            Domain Results: {domain_results}

            Provide unified recommendation with risk assessment.
            """
        )

        return {
            'strategy': strategy_response,
            'domain_results': domain_results,
            'final': final_response
        }
```

### 3.3 Agent-to-Agent 通信协议

```python

# 使用 Bedrock Converse API 实现 Agent 间通信
class AgentCommunication:
    def __init__(self):
        self.bedrock = boto3.client('bedrock-agent-runtime')

    def agent_to_agent_message(
        self,
        from_agent: str,
        to_agent: str,
        message: str,
        context: dict = None
    ) -> dict:
        """Agent 间直接消息传递"""

        payload = {
            'source_agent': from_agent,
            'target_agent': to_agent,
            'message': message,
            'context': context or {},
            'protocol': 'bedrock-a2a-v1',
            'timestamp': datetime.utcnow().isoformat()
        }

        response = self.bedrock.invoke_agent(
            agentAliasId=to_agent.split('/')[-1],
            agentId=to_agent.split(':agent/')[1].split('/')[0],
            sessionId=f"a2a-{from_agent}-{to_agent}",
            inputText=f"""Process this agent-to-agent message:

            From: {from_agent}
            Message: {message}
            Context: {context}

            Provide a structured response for the sending agent.
            """
        )

        return {
            'status': 'delivered',
            'response': response['completion'],
            'metadata': payload
        }
```

## 四、跨账户多 Agent 协作

### 4.1 跨账户调用架构

```
Account A (Agent Owner)          Account B (Agent Consumer)
┌─────────────────────┐         ┌─────────────────────┐
│  MyAgent            │         │  Application        │
│  Alias: production  │◄────────│                     │
│                     │  Invoke │                     │
└─────────────────────┘         └─────────────────────┘
         ▲                                 │
         │    Cross-Account Role          │
         │    (bedrock:GetAgent)          │
         └────────────────────────────────┘
```

### 4.2 跨账户配置

```python
import boto3
from botocore.config import Config

# Account B: 配置跨账户访问 Account A 的 Agent
class CrossAccountAgentClient:
    def __init__(self, provider_account_id, provider_region='us-east-1'):
        self.provider_account_id = provider_account_id

        # 配置跨账户客户端
        self.bedrock = boto3.client(
            'bedrock-agent-runtime',
            region_name=provider_region,
            config=Config(
                signature_version='v4',
                retries={'max_attempts': 3}
            )
        )

        # Account B 的执行角色（需被 Account A 信任）
        self.execution_role = 'arn:aws:iam::222222222222:role/BedrockCrossAccountRole'

    def invoke_provider_agent(
        self, 
        agent_id: str,
        alias_id: str,
        input_text: str,
        session_id: str = None
    ) -> dict:
        """跨账户调用 Provider 的 Agent"""

        # 使用 AssumeRole 获取临时凭证
        sts = boto3.client('sts')
        assumed = sts.assume_role(
            RoleArn=f'arn:aws:iam::{self.provider_account_id}:role/BedrockCrossAccountInvoke',
            RoleSessionName=f'bedrock-cross-account-{session_id or uuid.uuid4().hex[:8]}'
        )

        # 用临时凭证创建客户端
        client = boto3.client(
            'bedrock-agent-runtime',
            aws_access_key_id=assumed['Credentials']['AccessKeyId'],
            aws_secret_access_key=assumed['Credentials']['SecretAccessKey'],
            aws_session_token=assumed['Credentials']['SessionToken']
        )

        response = client.invoke_agent(
            agentAliasId=alias_id,
            agentId=agent_id,
            sessionId=session_id or str(uuid.uuid4()),
            inputText=input_text
        )

        return response

# Account A: 设置跨账户信任策略
trust_policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::222222222222:root"
            },
            "Action": [
                "bedrock:GetAgent",
                "bedrock:InvokeAgent"
            ],
            "Resource": [
                "arn:aws:bedrock:us-east-1:111111111111:agent/agent-id/*"
            ]
        }
    ]
}
```

## 五、Tool Use 与函数调用

### 5.1 Action Groups 定义

```python

# 定义 Action Group (相当于 MCP Tools)
action_group = {
    "name": "code_analysis_tools",
    "description": "Tools for code analysis and refactoring",
    "apiSchema": {
        "openapi": "3.0.0",
        "info": {"title": "Code Analysis API", "version": "1.0"},
        "paths": {
            "/analyze": {
                "post": {
                    "summary": "Analyze code structure",
                    "requestBody": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "code": {"type": "string"},
                                        "language": {"type": "string"}
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "Analysis result",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "complexity": {"type": "number"},
                                            "issues": {"type": "array"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
```

### 5.2 函数调用模式

```python

# 使用 Bedrock Converse API 进行函数调用
class FunctionCallingAgent:
    def __init__(self):
        self.bedrock = boto3.client('bedrock-agent-runtime')

    def invoke_with_functions(
        self,
        agent_id: str,
        alias_id: str,
        messages: list,
        functions: list
    ) -> dict:
        """带函数调用的 Agent 调用"""

        response = self.bedrock.invoke_agent(
            agentAliasId=alias_id,
            agentId=agent_id,
            sessionId=str(uuid.uuid4()),
            inputText=messages[-1]['content'],
            inferenceConfiguration={
                'maxTokens': 4096,
                'temperature': 0.7,
                'topP': 0.9
            },
            toolConfiguration={
                'functions': {
                    'properties': {f['name']: {'description': f['description']} for f in functions}
                }
            }
        )

        # 处理函数调用响应
        if 'functionInvocations' in response:
            for invocation in response['functionInvocations']:
                result = self._execute_function(
                    invocation['name'],
                    invocation['arguments']
                )
                messages.append({
                    'role': 'user',
                    'content': f"Function {invocation['name']} returned: {result}"
                })

        return response

    def _execute_function(self, name: str, args: dict) -> dict:
        """执行函数并返回结果"""
        function_map = {
            'search_code': self._search_code,
            'read_file': self._read_file,
            'write_file': self._write_file,
            'run_tests': self._run_tests,
        }

        if name in function_map:
            return function_map[name](**args)
        return {'error': f'Unknown function: {name}'}
```

## 六、最佳实践与性能优化

### 6.1 Session 管理

```python
class BedrockSessionManager:
    """优化 Session 重用以提升性能"""

    def __init__(self):
        self.sessions = {}  # session_id -> metadata
        self.default_ttl = 3600  # 1 hour

    def get_or_create_session(
        self, 
        agent_id: str, 
        user_id: str,
        reset_if_exists: bool = False
    ) -> str:
        """获取或创建 Session"""
        session_key = f"{agent_id}:{user_id}"

        if session_key in self.sessions and not reset_if_exists:
            session_data = self.sessions[session_key]
            if self._is_valid(session_data):
                return session_data['session_id']

        # 创建新 Session
        session_id = str(uuid.uuid4())
        self.sessions[session_key] = {
            'session_id': session_id,
            'agent_id': agent_id,
            'user_id': user_id,
            'created_at': datetime.utcnow(),
            'last_used': datetime.utcnow(),
            'turn_count': 0
        }

        return session_id

    def update_session_activity(self, session_id: str):
        """更新 Session 活跃时间"""
        for session_data in self.sessions.values():
            if session_data['session_id'] == session_id:
                session_data['last_used'] = datetime.utcnow()
                session_data['turn_count'] += 1
                break
```

### 6.2 并发控制

```python
from functools import wraps
import threading

class BedrockConcurrencyController:
    """控制 Agent 调用并发，避免限流"""

    def __init__(self, max_concurrent=10, rate_limit=50):
        self.semaphore = threading.Semaphore(max_concurrent)
        self.rate_limiter = TokenBucket(rate_limit, window=60)  # 50 req/min
        self._lock = threading.Lock()
        self._active_calls = 0

    def execute_with_control(self, func, *args, **kwargs):
        """带并发控制的执行"""
        with self.semaphore:
            if not self.rate_limiter.consume(1):
                raise BedrockRateLimitError("Rate limit exceeded, retry later")

            with self._lock:
                self._active_calls += 1

            try:
                return func(*args, **kwargs)
            finally:
                with self._lock:
                    self._active_calls -= 1

class TokenBucket:
    """简单的 Token Bucket 限流器"""

    def __init__(self, rate: int, window: int = 60):
        self.rate = rate
        self.window = window
        self.tokens = rate
        self.last_refill = time.time()

    def consume(self, tokens: int = 1) -> bool:
        self._refill()
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False

    def _refill(self):
        now = time.time()
        elapsed = now - self.last_refill
        new_tokens = (elapsed / self.window) * self.rate
        self.tokens = min(self.rate, self.tokens + new_tokens)
        self.last_refill = now
```

### 6.3 错误处理与重试

```python
from botocore.exceptions import ClientError
import backoff

class BedrockAgentRetry:
    """Agent 调用的智能重试策略"""

    def __init__(self, max_retries=3):
        self.max_retries = max_retries

    @backoff.on_exception(
        backoff.expo,
        (ClientError,),
        max_tries=3,
        base=2,
        jitter=backoff.full_jitter,
        factor=1.0
    )
    def invoke_with_retry(self, agent_id: str, alias_id: str, input_text: str):
        """带指数退避的重试调用"""
        try:
            response = bedrock.invoke_agent(
                agentAliasId=alias_id,
                agentId=agent_id,
                sessionId=str(uuid.uuid4()),
                inputText=input_text
            )
            return response

        except ClientError as e:
            error_code = e.response['Error']['Code']

            if error_code == 'ThrottlingException':

                # 限流，等待后重试
                raise
            elif error_code == 'ResourceNotFoundException':

                # Agent 不存在，不重试
                raise BedrockNotFoundError(f"Agent {agent_id} not found") from e
            elif error_code == 'AccessDeniedException':

                # 权限问题，不重试
                raise BedrockAccessDeniedError(f"Access denied to agent {agent_id}") from e
            else:
                raise
```

## 七、安全与权限管理

### 7.1 Agent 资源策略

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "arn:aws:iam::123456789012:root",
                    "arn:aws:iam::222222222222:root"
                ]
            },
            "Action": [
                "bedrock:InvokeAgent"
            ],
            "Resource": "arn:aws:bedrock:us-east-1:111111111111:agent/agent-id/*"
        },
        {
            "Effect": "Deny",
            "Principal": "*",
            "Action": [
                "bedrock:InvokeAgent"
            ],
            "Resource": "arn:aws:bedrock:us-east-1:111111111111:agent/agent-id/*",
            "Condition": {
                "IpAddress": {
                    "aws:SourceIp": ["10.0.0.0/8"]
                }
            }
        }
    ]
}
```

### 7.2 护栏（Guardrails）配置

```python

# 为 Agent 配置安全护栏
bedrock.put_agent_guardrail(
    agentIdentifier=f"arn:aws:bedrock:{region}:{account}:agent/{agent_id}",
    guardrailIdentifier='guardrail-xxxxx',
    guardrailVersion='DRAFT',

    # 或使用正式版本
    # guardrailVersion='1'
)
```

## 八、监控与可观测性

### 8.1 CloudWatch 指标

```python
import boto3

cloudwatch = boto3.client('cloudwatch')

def emit_agent_metrics(agent_id: str, metrics: dict):
    """向 CloudWatch 发送 Agent 指标"""

    metric_data = [
        {
            'MetricName': 'InvocationCount',
            'Dimensions': [
                {'Name': 'AgentId', 'Value': agent_id}
            ],
            'Value': metrics.get('count', 1),
            'Unit': 'Count'
        },
        {
            'MetricName': 'Latency',
            'Dimensions': [
                {'Name': 'AgentId', 'Value': agent_id}
            ],
            'Value': metrics.get('latency_ms', 0),
            'Unit': 'Milliseconds'
        },
        {
            'MetricName': 'ErrorRate',
            'Dimensions': [
                {'Name': 'AgentId', 'Value': agent_id}
            ],
            'Value': metrics.get('error_rate', 0),
            'Unit': 'Percent'
        }
    ]

    cloudwatch.put_metric_data(
        Namespace='AWS/Bedrock/Agent',
        MetricData=metric_data
    )
```

### 8.2 CloudWatch Logs 集成

```python
import logging
import watchtower

# 配置 Agent 日志到 CloudWatch
logger = logging.getLogger('bedrock-agent')
logger.addHandler(watchtower.CloudWatchLogHandler(
    log_group='/aws/bedrock/agents',
    stream_name='prod-agent-01',
    boto3_session=boto3.Session()
))

def log_agent_interaction(
    agent_id: str,
    session_id: str,
    input_text: str,
    output_text: str,
    latency: float,
    error: str = None
):
    """结构化日志记录"""
    logger.info({
        'event': 'agent_interaction',
        'agent_id': agent_id,
        'session_id': session_id,
        'input_length': len(input_text),
        'output_length': len(output_text),
        'latency_ms': latency,
        'error': error
    })
```

## 九、常见部署架构

### 9.1 微服务集成架构

```
┌──────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│                    /api/agents/*                             │
└────────────────────────┬─────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Lambda 1   │   │  Lambda 2   │   │  Lambda N   │
│ Agent A     │   │ Agent B     │   │ Agent ...   │
│ (搜索专家)   │   │ (编码专家)   │   │             │
└──────┬──────┘   └──────┬──────┘   └─────────────┘
       │                  │
       ▼                  ▼
┌─────────────────────────────────────────────────┐
│              Amazon Bedrock                      │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│    │ Agent A │  │ Agent B │  │ Agent C │        │
│    └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────┘
```

### 9.2 Event-Driven 架构

```python
import boto3

# 使用 EventBridge 触发 Agent
events = boto3.client('events')

# 创建 EventBridge 规则
events.put_rule(
    Name='agent-trigger-rule',
    EventPattern={
        "source": ["aws.custom"],
        "detail-type": ["AgentTask"],
        "detail": {
            "priority": ["high", "medium"]
        }
    },
    RoleArn='arn:aws:iam::123456789012:role/EventBridgeRole'
)

# 关联 Lambda 目标
events.put_targets(
    Rule='agent-trigger-rule',
    Targets=[
        {
            'Id': 'AgentLambda',
            'Arn': 'arn:aws:lambda:us-east-1:123456789012:function:AgentInvoker',
            'InputTransformer': {
                'InputPathsMap': {'task': '$.detail.task'},
                'InputTemplate': '{"task": <task>, "priority": <priority>}'
            }
        }
    ]
)
```

## 十、相关资源

- → [Multi Agent Collaboration Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-collaboration-patterns.md) — 多智能体协作模式通用理论
- → [Openclaw Multi Agent Team Practice](../ch04/048-openclaw-multi-agent-team-practice-v2.html) — OpenClaw 多智能体团队实践
- → [Building Enterprise Agentic Ai With Kiro On Aws](../ch04/568-agentic-ai.html) — Kiro 在 AWS 上的企业 Agent 构建

---

## 深度分析

**1. 多智能体架构的核心设计思想：从单体Agent到分布式认知体系。** AWS Bedrock的多智能体协作并非简单的"多个Agent拼在一起"，而是模拟了人类社会中的专业化分工与协作机制。Orchestrator-Worker模式将任务分解与执行解耦，Hierarchical层叠模式实现了战略层与执行层的关注点分离，Agent-to-Agent通信协议则提供了点对点的认知交换能力。这种架构的深层逻辑在于：复杂任务无法由单一Agent高效完成，因为模型本身存在上下文窗口限制和专业化能力缺口，而多Agent协作本质上是用「认知分工」换「认知带宽」，用「并行处理」换「串行延迟」。

**2. 跨账户调用暴露了企业级AI架构的核心安全命题。** 当Agent作为企业资产被跨账户共享时，AWS的IAM信任策略和AssumeRole机制实际上构建了一个「最小权限」的安全模型。Provider账户通过资源策略精确控制哪些Consumer账户可以调用哪些Agent的哪些版本，这种粒度控制在传统API密钥模式下几乎不可能实现。更值得注意的是，Bedrock引入了Agent Alias机制——调用方永远通过Alias而非Agent ID直接寻址，这意味着Provider可以在不破坏Consumer集成的前提下安全地更新或回滚Agent版本，实现了「版本管理与访问控制」的真正解耦。

**3. Session管理是生产级Agent系统的性能瓶颈与可靠性保障的交汇点。** 文档中展示的BedrockSessionManager看似简单，实际上揭示了一个关键事实：Agent是有状态的。这种状态不仅体现在多轮对话的上下文连续性上，更体现在跨调用保留中间结果、避免重复计算的需求上。Session的TTL设计、reset策略、turn_count追踪，都是在「状态保持收益」与「内存资源消耗」之间寻找平衡点。当系统规模扩大，Session管理器的可扩展性会成为整个Agent编排系统的关键瓶颈。

**4. 函数调用（Tool Use）本质上是Agent能力边界的动态扩展机制。** 传统的LLM调用是「输入→输出」的单一映射，而Bedrock的Action Groups/OpenAPI Schema机制让Agent可以在运行时动态发现和调用外部工具。这种设计的精妙之处在于：它不要求Agent「知道」所有工具的存在，而是通过Schema描述让Agent在需要时「理解」如何使用工具。这与MCP（Model Context Protocol）的设计哲学高度一致——工具不是硬编码的能力，而是可发现的接口。当多个Agent共享同一个Action Group时，实际上是在构建一个「工具联邦」，每个Agent按需从联邦中选取工具，无需关心工具的具体实现。

**5. 并发控制与错误处理揭示了分布式AI系统的核心工程挑战。** TokenBucket限流器和指数退避重试策略的存在，说明Bedrock Agent调用本质上是一个存在竞态条件的分布式事务。ThrottlingException、ResourceNotFoundException、AccessDeniedException三种错误的不同处理策略——重试、不重试、不重试——体现了「区分瞬时故障与永久故障」的工程原则。这种精细化的错误分类和处理，在单Agent场景下可能被忽视，但在多Agent并发场景下会成为系统稳定性的决定性因素。一旦某个Worker Agent频繁超时或被限流，整个Orchestrator的响应质量都会受到影响。

## 实践启示

**1. 生产部署务必使用Agent Alias而非Agent ID进行调用。** 文档中多次强调Alias的「生产推荐」用法，这不是最佳实践建议而是必须遵守的工程纪律。当Agent需要更新逻辑或修复bug时，基于Alias的版本切换可以在秒级完成，且不影响任何下游Consumer的调用方式。建议建立Alias命名规范，例如`production`、`staging`、`canary`，并为每个Alias绑定固定的Agent版本，形成「版本冻结→灰度验证→全量切换」的标准化发布流程。

**2. 在设计Orchestrator-Worker协作时，优先保证子任务的独立性。** 任务分解的质量直接决定了并行执行的收益。高度耦合的子任务不仅无法真正并行，还会增加结果聚合的复杂度。实践中建议为每个子任务定义清晰的输入输出契约（JSON Schema），并在Orchestrator层面进行Schema验证，避免因某个Worker返回格式不一致导致整个聚合流程失败。同时，Worker数量应控制在5-8个以内——超出这个规模后，Orchestrator的结果聚合成本会抵消并行带来的延迟收益。

**3. 跨账户Agent调用必须配置完善的错误处理和幂等性保障。** 跨账户调用引入了额外的网络延迟和故障点，AssumeRole获取的临时凭证也有明确的失效时间。建议在Consumer侧实现「凭证缓存+自动刷新」机制，确保长时间运行的任务不会因凭证过期而中断。此外，跨账户调用的日志追踪需要额外记录`x-ray-trace-id`或自定义的`correlation-id`，以便在多个账户的CloudWatch Logs之间进行关联查询。

**4. 为所有Agent配置Guardrails护栏，即使当前没有发现明显的内容风险。** 安全护栏不仅是防护机制，更是一种「运行时审计」能力。通过护栏，企业可以记录所有被拦截的请求内容，分析潜在的指令注入攻击模式，并据此调整提示词工程。护栏配置应遵循「先宽松、后收紧」的上线节奏：初期以监控模式（Draft版本）运行，积累足够的误拦截样本后，再切换到强制执行模式。

**5. 监控体系必须覆盖「Agent调用链路」的端到端可观测性。** 单一Agent的Latency和ErrorRate指标不足以支撑多Agent场景的故障排查。建议在Orchestrator入口处生成全局`trace-id`，并将此ID一路传递给所有下游Worker Agent，在日志和指标中均以此ID为关联键。CloudWatch的`Embedded Metric Format`可以用于在日志中嵌入结构化指标，配合Grafana或Datadog实现「日志即指标」的统一观测体验。对于延迟敏感的线上服务，还应设置P99延迟告警，因为平均值掩盖的尾部延迟往往才是用户体验的真正杀手。

---

*本文档基于 AWS Bedrock 官方文档和行业最佳实践编写，适用于生产环境部署参考。*

## 相关实体
- [Multi Agent Collaboration 2025 Top 10 Challenges](https://github.com/QianJinGuo/wiki/blob/main/queries/multi-agent-collaboration-2025-top-10-challenges.md)
- [aws bedrock dynamic document extraction pipeline](https://github.com/QianJinGuo/wiki/blob/main/entities/extract-data-with-on-demand-and-batch-pipelines-dynamically.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)

---

