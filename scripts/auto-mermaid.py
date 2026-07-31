"""Auto-generate mermaid diagrams for articles based on content analysis."""
import re, os, sys

DOCS_DIR = '/Users/jinguo/wiki-book/docs'

# Template library keyed by topic patterns
TEMPLATES = {
    'agent_architecture': {
        'keywords': ['agent架构', 'agent 核心', 'agent runtime', 'agent framework', 'Agent 架构', '智能体架构'],
        'diagram': '''```mermaid
graph TB
    subgraph "Agent 架构"
        IN[输入/意图] --> PL[规划器<br/>Plan]
        PL --> EX[执行器<br/>Execute]
        EX --> OB[观察<br/>Observe]
        OB -->|"反思"| PL
    end
    subgraph "基础设施"
        MEM[记忆<br/>跨Session状态]
        SKL[技能<br/>可复用能力]
        TL[工具/MCP<br/>外部操作]
    end
    PL & EX --> MEM & SKL & TL
    classDef core fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef infra fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class IN,PL,EX,OB core
    class MEM,SKL,TL infra
```'''
    },
    'harness_engineering': {
        'keywords': ['harness', 'Harness', '护栏', 'guardrail', '编排层', 'orchestrat'],
        'diagram': '''```mermaid
graph LR
    subgraph "Harness 层次"
        OBS[可观测性<br/>日志/Trace] --> GRD[护栏<br/>审批/限制]
        GRD --> ORC[编排<br/>任务分发]
    end
    ORC --> AG[Agent 执行]
    AG -->|"结果反馈"| OBS
    classDef harness fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef agent fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    class OBS,GRD,ORC harness
    class AG agent
```'''
    },
    'memory_context': {
        'keywords': ['记忆', 'memory', '上下文管理', 'context management', 'RAG', '知识检索', '持久化'],
        'diagram': '''```mermaid
graph TB
    subgraph "记忆分层"
        WM[工作记忆<br/>上下文窗口] --> SM[短期记忆<br/>Session级]
        SM --> LM[长期记忆<br/>跨Session]
    end
    LM --> VDB[向量数据库<br/>Embedding检索]
    LM --> KB[知识库<br/>结构化存储]
    subgraph "RAG 流程"
        Q[查询] --> RET[检索] --> RK[重排序] --> CT[上下文注入]
    end
    VDB --> RET
    KB --> RET
    classDef mem fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef rag fill:#d1fae5,stroke:#059669,color:#064e3b
    class WM,SM,LM,VDB,KB mem
    class Q,RET,RK,CT rag
```'''
    },
    'skill_tool_mcp': {
        'keywords': ['skill', 'Skill', 'MCP', '工具调用', 'tool use', 'tool call', '技能'],
        'diagram': '''```mermaid
graph TB
    AG[Agent] -->|"tool_call"| TB[Tool Bus<br/>工具总线]
    TB --> FT[Function Tool<br/>应用代码]
    TB --> HT[Hosted Tool<br/>Provider托管]
    TB --> MT[MCP Tool<br/>标准协议]
    subgraph "MCP 协议"
        MT --> MCS[MCP Server]
        MCS --> RES[资源/提示/工具]
    end
    subgraph "审批"
        AP[auto: 只读] 
        MP[manual: 写操作]
    end
    FT --> AP
    HT --> AP
    MT --> MP
    classDef tool fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef mcp fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef appr fill:#fef3c7,stroke:#d97706,color:#78350f
    class FT,HT,MT,TB tool
    class MCS,RES mcp
    class AP,MP appr
```'''
    },
    'multi_agent': {
        'keywords': ['多Agent', 'multi-agent', 'Multi-Agent', '多智能体', 'A2A', 'swarm', 'Swarm', '团队协作', '子Agent'],
        'diagram': '''```mermaid
graph TB
    subgraph "协作模式"
        L["Leader<br/>编排者"] --> W1["Worker 1"]
        L --> W2["Worker 2"]
        L --> W3["Worker 3"]
    end
    subgraph "通信"
        MSG[消息队列<br/>异步]
        A2A[A2A协议<br/>Agent间]
        MCP[MCP<br/>工具调用]
    end
    W1 & W2 & W3 --> MSG
    L --> A2A
    W1 & W2 --> MCP
    classDef role fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef proto fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class L,W1,W2,W3 role
    class MSG,A2A,MCP proto
```'''
    },
    'security_attack': {
        'keywords': ['安全', 'security', '攻击', 'attack', '漏洞', 'vulnerability', '渗透', 'CVE', '威胁'],
        'diagram': '''```mermaid
graph LR
    subgraph "威胁模型"
        ATK[攻击者] --> VEC[攻击向量]
        VEC --> TGT[目标系统]
    end
    subgraph "防御层"
        WAF[WAF/网关] --> IDS[入侵检测]
        IDS --> RBAC[权限控制]
        RBAC --> AUD[审计日志]
    end
    VEC --> WAF
    classDef threat fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    classDef defense fill:#d1fae5,stroke:#059669,color:#064e3b
    class ATK,VEC,TGT threat
    class WAF,IDS,RBAC,AUD defense
```'''
    },
    'cloud_infra': {
        'keywords': ['AWS', 'Bedrock', 'Cloudflare', 'Docker', 'Kubernetes', '部署', 'deploy', 'serverless', '微服务', '容器'],
        'diagram': '''```mermaid
graph TB
    subgraph "基础设施"
        LB[负载均衡/CDN] --> GW[API Gateway]
        GW --> SVC[服务层<br/>Serverless/Container]
        SVC --> DB[数据层<br/>RDS/KV/OSS]
    end
    subgraph "Agent 运行时"
        AGT[Agent 实例] --> SANDBOX[沙箱/VM]
        SANDBOX --> FS[隔离文件系统]
    end
    SVC --> AGT
    classDef infra fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef runtime fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class LB,GW,SVC,DB infra
    class AGT,SANDBOX,FS runtime
```'''
    },
    'ai_coding': {
        'keywords': ['Claude Code', 'Codex', '编码', 'coding', '代码生成', 'code generation', 'AI编程', 'Cursor'],
        'diagram': '''```mermaid
graph LR
    subgraph "AI编程工作流"
        INT[意图理解] --> PLAN[任务拆解]
        PLAN --> GEN[代码生成]
        GEN --> VAL[验证/测试]
        VAL -->|"失败"| PLAN
    end
    subgraph "上下文来源"
        CMD[CLAUDE.md]
        SKL[Skills]
        LSP[语言服务]
    end
    INT --> CMD & SKL & LSP
    classDef flow fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef ctx fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class INT,PLAN,GEN,VAL flow
    class CMD,SKL,LSP ctx
```'''
    },
    'training_finetune': {
        'keywords': ['训练', 'training', '微调', 'fine-tun', 'RLHF', 'PPO', 'DPO', 'GRPO', 'LoRA', '蒸馏'],
        'diagram': '''```mermaid
graph LR
    subgraph "训练流水线"
        DATA[数据准备] --> SFT[监督微调 SFT]
        SFT --> RL[对齐训练 RLHF/DPO]
        RL --> EVAL[评估]
    end
    subgraph "高效方法"
        LORA[LoRA/QLoRA<br/>参数高效]
        DIST[知识蒸馏<br/>小模型]
        RLBF[GRPO<br/>无Reward Model]
    end
    SFT --> LORA
    RL --> RLBF
    EVAL --> DIST
    classDef pipeline fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef method fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class DATA,SFT,RL,EVAL pipeline
    class LORA,DIST,RLBF method
```'''
    },
    'inference_optimize': {
        'keywords': ['推理', 'inference', '优化', 'optimization', 'KV Cache', '量化', 'quantiz', '推理加速'],
        'diagram': '''```mermaid
graph LR
    subgraph "推理优化栈"
        Q[量化 INT4/INT8<br/>精度换速度] --> KV[KV Cache优化<br/>减少重复计算]
        KV --> PD[Prefill/Decode分离<br/>批处理]
        PD --> SPEC[投机采样<br/>小模型草拟]
    end
    subgraph "部署方案"
        LOC[本地 GPU]
        CLOUD[云端推理 API]
        EDGE[边缘/On-device]
    end
    Q --> LOC & CLOUD
    SPEC --> EDGE
    classDef opt fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef deploy fill:#d1fae5,stroke:#059669,color:#064e3b
    class Q,KV,PD,SPEC opt
    class LOC,CLOUD,EDGE deploy
```'''
    },
}

def find_best_template(content):
    """Find the best matching template based on content keywords."""
    scores = {}
    for name, tpl in TEMPLATES.items():
        score = 0
        for kw in tpl['keywords']:
            if kw.lower() in content.lower():
                score += 1
        if score > 0:
            scores[name] = score
    
    if not scores:
        return None
    
    # Return the template with the highest keyword match
    best = max(scores, key=scores.get)
    return TEMPLATES[best]['diagram']

def insert_diagram(filepath, mermaid_code):
    """Insert mermaid diagram into a markdown file."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    lines = content.split('\n')
    insert_idx = None
    h2_count = 0
    
    for i, line in enumerate(lines):
        if line.startswith('## ') and not line.startswith('## Ch0'):
            h2_count += 1
            if h2_count == 2:
                insert_idx = i
                break
    
    if insert_idx is None:
        for i, line in enumerate(lines):
            if line.startswith('## ') and not line.startswith('## Ch0'):
                insert_idx = i
                break
    
    if insert_idx is None:
        return False
    
    lines.insert(insert_idx + 1, '')
    lines.insert(insert_idx + 2, mermaid_code)
    lines.insert(insert_idx + 3, '')
    
    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))
    return True

# Main: process articles > 8KB without mermaid
count = 0
for ch in ['ch01', 'ch03', 'ch04', 'ch05', 'ch07', 'ch09', 'ch11', 'ch12']:
    ch_dir = os.path.join(DOCS_DIR, ch)
    if not os.path.isdir(ch_dir):
        continue
    
    for fname in sorted(os.listdir(ch_dir)):
        if not fname.endswith('.md'):
            continue
        
        fpath = os.path.join(ch_dir, fname)
        
        with open(fpath, 'r') as f:
            content = f.read()
        
        # Skip if already has mermaid
        if '```mermaid' in content:
            continue
        
        # Skip if too small
        if len(content) < 8000:
            continue
        
        # Find best template
        diagram = find_best_template(content)
        if not diagram:
            continue
        
        if insert_diagram(fpath, diagram):
            count += 1
            print(f"OK: {ch}/{fname}")

print(f"\nTotal: {count} articles updated")
