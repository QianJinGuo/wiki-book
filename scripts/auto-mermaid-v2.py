"""Auto-generate mermaid diagrams v2 — lower threshold, more templates, smarter matching."""
import re, os

DOCS_DIR = '/Users/jinguo/wiki-book/docs'
MIN_SIZE = 4000  # 4KB threshold

TEMPLATES = {
    # --- Agent & Architecture ---
    'agent_react': {
        'match': ['react', 'ReAct', 'reasoning+act', '推理+行动', '反思循环', 'reflection loop'],
        'score': 3,
        'diagram': '''```mermaid
graph LR
    IN[输入] --> TH[思考<br/>Thought]
    TH --> AC[行动<br/>Action]
    AC --> OB[观察<br/>Observation]
    OB -->|"循环"| TH
    TH --> OUT[输出]
    classDef core fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    class IN,TH,AC,OB,OUT core
```'''
    },
    'agent_arch': {
        'match': ['agent架构', 'agent 核心', 'agent runtime', '智能体架构', 'agent framework', 'agent loop', 'agent run'],
        'score': 3,
        'diagram': '''```mermaid
graph TB
    IN[意图输入] --> PL[规划器]
    PL --> EX[执行器]
    EX --> OB[观察结果]
    OB -->|"反思调整"| PL
    PL --> OUT[交付]
    subgraph "支撑"
        M[记忆] 
        S[技能]
        T[工具]
    end
    PL & EX --> M & S & T
    classDef core fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef sup fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class IN,PL,EX,OB,OUT core
    class M,S,T sup
```'''
    },
    'harness': {
        'match': ['harness', 'Harness', '护栏', 'guardrail', '编排层', 'orchestrat', '套具'],
        'score': 3,
        'diagram': '''```mermaid
graph LR
    OBS[可观测性] --> GRD[护栏]
    GRD --> ORC[编排]
    ORC --> AG[Agent]
    AG -->|"反馈"| OBS
    classDef h fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef a fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    class OBS,GRD,ORC h
    class AG a
```'''
    },
    'memory_rag': {
        'match': ['记忆', 'memory', 'RAG', '知识检索', '持久化', '向量检索', 'embedding', '上下文管理', 'context eng'],
        'score': 3,
        'diagram': '''```mermaid
graph TB
    Q[查询] --> R[检索]
    R --> K[重排序]
    K --> C[上下文注入]
    C --> LLM[LLM生成]
    subgraph "存储"
        VDB[向量库] 
        KB[知识库]
    end
    R --> VDB & KB
    classDef flow fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef store fill:#d1fae5,stroke:#059669,color:#064e3b
    class Q,R,K,C,LLM flow
    class VDB,KB store
```'''
    },
    'skill_mcp': {
        'match': ['skill', 'MCP', '工具调用', 'tool use', 'tool call', '技能', 'MCP Server', 'MCP协议'],
        'score': 3,
        'diagram': '''```mermaid
graph TB
    AG[Agent] --> TB[Tool Bus]
    TB --> FT[Function Tool]
    TB --> MT[MCP Tool]
    subgraph "MCP"
        MCS[Server] --> RES[资源/工具]
    end
    MT --> MCS
    classDef t fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef m fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    class AG,TB,FT,MT t
    class MCS,RES m
```'''
    },
    'multi_agent': {
        'match': ['多Agent', 'multi-agent', 'Multi-Agent', '多智能体', 'A2A', 'swarm', '团队', '子Agent', 'sub-agent'],
        'score': 3,
        'diagram': '''```mermaid
graph TB
    L[Leader] --> W1[Worker 1]
    L --> W2[Worker 2]
    L --> W3[Worker 3]
    W1 & W2 --> MSG[消息总线]
    W3 --> MSG
    classDef l fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef w fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class L l
    class W1,W2,W3,MSG w
```'''
    },
    'security': {
        'match': ['安全', 'security', '攻击', 'attack', '漏洞', 'vulnerab', '渗透', 'CVE', '威胁', '威胁检测', '零日'],
        'score': 3,
        'diagram': '''```mermaid
graph LR
    ATK[攻击向量] --> WAF[防护层]
    WAF --> IDS[检测]
    IDS --> RSP[响应]
    RSP --> AUD[审计]
    classDef t fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
    classDef d fill:#d1fae5,stroke:#059669,color:#064e3b
    class ATK t
    class WAF,IDS,RSP,AUD d
```'''
    },
    'cloud_aws': {
        'match': ['AWS', 'Bedrock', 'Cloudflare', 'Docker', 'Kubernetes', 'K8s', 'serverless', '微服务', 'EKS', 'EC2', 'S3', 'Lambda'],
        'score': 2,
        'diagram': '''```mermaid
graph TB
    LB[负载均衡] --> GW[API Gateway]
    GW --> SVC[服务层]
    SVC --> DB[数据层]
    subgraph "Agent"
        AGT[实例] --> SB[沙箱]
    end
    SVC --> AGT
    classDef i fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef a fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class LB,GW,SVC,DB i
    class AGT,SB a
```'''
    },
    'ai_coding': {
        'match': ['Claude Code', 'Codex', '编码Agent', 'coding agent', '代码生成', 'AI编程', 'Cursor', 'Windsurf', 'Kiro'],
        'score': 3,
        'diagram': '''```mermaid
graph LR
    INT[意图] --> PLN[拆解]
    PLN --> GEN[生成]
    GEN --> VAL[验证]
    VAL -->|"失败"| PLN
    subgraph "上下文"
        CM[CLAUDE.md]
        SK[Skills]
    end
    INT --> CM & SK
    classDef f fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef c fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class INT,PLN,GEN,VAL f
    class CM,SK c
```'''
    },
    'training': {
        'match': ['训练', 'training', '微调', 'fine-tun', 'RLHF', 'PPO', 'DPO', 'GRPO', 'LoRA', '蒸馏', 'distill', 'SFT'],
        'score': 3,
        'diagram': '''```mermaid
graph LR
    D[数据] --> SFT[SFT]
    SFT --> RL[RLHF/DPO]
    RL --> EV[评估]
    subgraph "高效方法"
        L[LoRA] 
        DS[蒸馏]
    end
    SFT --> L
    EV --> DS
    classDef p fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef m fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class D,SFT,RL,EV p
    class L,DS m
```'''
    },
    'inference': {
        'match': ['推理优化', 'inference', 'KV Cache', '量化', 'quantiz', '推理加速', 'speculat', '投机解码', 'Flash Attention'],
        'score': 3,
        'diagram': '''```mermaid
graph LR
    Q[量化] --> KV[KV Cache]
    KV --> PD[Prefill/Decode]
    PD --> SP[投机采样]
    classDef o fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    class Q,KV,PD,SP o
```'''
    },
    'multimodal': {
        'match': ['多模态', 'multimodal', '视觉', 'vision', '图像生成', 'image generat', 'VLM', '文生图'],
        'score': 3,
        'diagram': '''```mermaid
graph LR
    T[文本] --> ENC[多模态编码器]
    I[图像] --> ENC
    A[音频] --> ENC
    ENC --> FUS[融合层]
    FUS --> DEC[解码器]
    DEC --> OUT[输出]
    classDef in fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef core fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class T,I,A in
    class ENC,FUS,DEC,OUT core
```'''
    },
    'robotics': {
        'match': ['机器人', 'robot', '具身', 'embodied', 'ROS', '自动驾驶', '仿真'],
        'score': 3,
        'diagram': '''```mermaid
graph TB
    PER[感知] --> DEC[决策]
    DEC --> ACT[执行]
    ACT --> ENV[环境]
    ENV --> PER
    subgraph "学习"
        RL[强化学习]
        SIM[仿真训练]
    end
    DEC --> RL
    RL --> SIM
    classDef c fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef l fill:#d1fae5,stroke:#059669,color:#064e3b
    class PER,DEC,ACT,ENV c
    class RL,SIM l
```'''
    },
    # --- Broader/catch-all templates with lower score ---
    'data_pipeline': {
        'match': ['数据', 'data pipeline', 'ETL', 'Kafka', 'Flink', 'Spark', '数据湖', '数据仓库', '数据治理', '数据质量'],
        'score': 1,
        'diagram': '''```mermaid
graph LR
    SRC[数据源] --> ING[采集]
    ING --> PROC[处理]
    PROC --> STO[存储]
    STO --> SERV[服务]
    classDef s fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    class SRC,ING,PROC,STO,SERV s
```'''
    },
    'mlops_eval': {
        'match': ['MLOps', '评估', 'eval', 'benchmark', '基准测试', 'A/B测试', '模型评估', 'CI/CD', '模型监控'],
        'score': 1,
        'diagram': '''```mermaid
graph LR
    TRAIN[训练] --> EVAL[评估]
    EVAL --> DEPLOY[部署]
    DEPLOY --> MON[监控]
    MON -->|"指标回传"| EVAL
    classDef s fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    class TRAIN,EVAL,DEPLOY,MON s
```'''
    },
    'product_business': {
        'match': ['商业模式', 'business model', 'SaaS', '创业', 'startup', '融资', '投资', '估值', 'PMF', '增长', 'ROI'],
        'score': 1,
        'diagram': '''```mermaid
graph LR
    PROB[问题] --> SOL[解决方案]
    SOL --> MKT[市场验证]
    MKT --> GROW[增长飞轮]
    GROW --> REV[收入]
    REV -->|"再投入"| SOL
    classDef s fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    class PROB,SOL,MKT,GROW,REV s
```'''
    },
    'llm_general': {
        'match': ['LLM', '大模型', 'GPT', 'Claude', 'Gemini', '开源模型', 'open model', 'Transformer', '注意力', 'attention'],
        'score': 2,
        'diagram': '''```mermaid
graph TB
    IN[输入Token] --> EMB[嵌入层]
    EMB --> ATT[自注意力]
    ATT --> FFN[前馈网络]
    FFN --> OUT[输出]
    subgraph "优化"
        KV[KV Cache]
        Q[量化]
    end
    ATT --> KV
    FFN --> Q
    classDef c fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef o fill:#d1fae5,stroke:#059669,color:#064e3b
    class IN,EMB,ATT,FFN,OUT c
    class KV,Q o
```'''
    },
}

def score_content(content):
    """Score content against all templates, return (best_name, best_diagram) or None."""
    lower = content.lower()
    scores = {}
    for name, tpl in TEMPLATES.items():
        s = 0
        for kw in tpl['match']:
            if kw.lower() in lower:
                s += tpl['score']
        if s > 0:
            scores[name] = s
    
    if not scores:
        return None
    
    best = max(scores, key=scores.get)
    return TEMPLATES[best]['diagram']

def insert_diagram(filepath, mermaid_code):
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

# Process all chapters
count = 0
by_ch = {}
for ch in ['ch01', 'ch03', 'ch04', 'ch05', 'ch07', 'ch09', 'ch11', 'ch12']:
    ch_dir = os.path.join(DOCS_DIR, ch)
    if not os.path.isdir(ch_dir):
        continue
    ch_count = 0
    for fname in sorted(os.listdir(ch_dir)):
        if not fname.endswith('.md'):
            continue
        fpath = os.path.join(ch_dir, fname)
        with open(fpath, 'r') as f:
            content = f.read()
        if '```mermaid' in content:
            continue
        if len(content) < MIN_SIZE:
            continue
        diagram = score_content(content)
        if not diagram:
            continue
        if insert_diagram(fpath, diagram):
            count += 1
            ch_count += 1
    by_ch[ch] = ch_count

print(f"\nTotal: {count} articles updated")
for ch, c in sorted(by_ch.items(), key=lambda x: -x[1]):
    if c > 0:
        print(f"  {ch}: +{c}")
