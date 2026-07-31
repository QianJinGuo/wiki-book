"""Auto-generate mermaid diagrams v3 — cover ALL articles, zero threshold, catch-all fallback."""
import re, os, sys

DOCS_DIR = '/Users/jinguo/wiki-book/docs'
MIN_SIZE = 300  # basically everything

# Topic-specific templates (higher score = preferred when multiple match)
TEMPLATES = {
    'agent_react': {
        'match': ['react', 'ReAct', '推理+行动', '反思循环', 'reflection loop', 'critic'],
        'score': 4,
    },
    'agent_arch': {
        'match': ['agent架构', 'agent 核心', 'agent runtime', '智能体架构', 'agent framework', 'agent loop', 'agent run', 'agent 架构'],
        'score': 4,
    },
    'harness': {
        'match': ['harness', 'Harness', '护栏', 'guardrail', '编排层', 'orchestrat', '套具', '编排'],
        'score': 4,
    },
    'memory_rag': {
        'match': ['记忆', 'memory', 'RAG', '知识检索', '持久化', '向量检索', 'embedding', '上下文管理', 'context eng', '检索增强'],
        'score': 4,
    },
    'skill_mcp': {
        'match': ['skill', 'MCP', '工具调用', 'tool use', 'tool call', '技能', 'MCP Server', 'MCP协议', 'tool bus'],
        'score': 4,
    },
    'multi_agent': {
        'match': ['多Agent', 'multi-agent', 'Multi-Agent', '多智能体', 'A2A', 'swarm', '团队协作', '子Agent', 'sub-agent'],
        'score': 4,
    },
    'security': {
        'match': ['安全', 'security', '攻击', 'attack', '漏洞', 'vulnerab', '渗透', 'CVE', '威胁', '零日', '0day', '恶意'],
        'score': 4,
    },
    'cloud_aws': {
        'match': ['AWS', 'Bedrock', 'Cloudflare', 'Docker', 'Kubernetes', 'K8s', 'serverless', '微服务', 'EKS', 'EC2', 'S3', 'Lambda', '部署', 'deploy'],
        'score': 3,
    },
    'ai_coding': {
        'match': ['Claude Code', 'Codex', '编码Agent', 'coding agent', '代码生成', 'AI编程', 'Cursor', 'Windsurf', 'Kiro', 'vibe coding'],
        'score': 4,
    },
    'training': {
        'match': ['训练', 'training', '微调', 'fine-tun', 'RLHF', 'PPO', 'DPO', 'GRPO', 'LoRA', '蒸馏', 'distill', 'SFT', '对齐'],
        'score': 4,
    },
    'inference': {
        'match': ['推理优化', 'inference', 'KV Cache', '量化', 'quantiz', '推理加速', 'speculat', '投机解码', 'Flash Attention', '推理架构'],
        'score': 4,
    },
    'multimodal': {
        'match': ['多模态', 'multimodal', '视觉', 'vision', '图像生成', 'image generat', 'VLM', '文生图', 'TTS', '语音'],
        'score': 4,
    },
    'robotics': {
        'match': ['机器人', 'robot', '具身', 'embodied', 'ROS', '自动驾驶', '仿真', 'simulat'],
        'score': 4,
    },
    'data_pipeline': {
        'match': ['数据', 'data pipeline', 'ETL', 'Kafka', 'Flink', 'Spark', '数据湖', '数据仓库', '数据治理', '数据质量', 'Iceberg'],
        'score': 2,
    },
    'mlops_eval': {
        'match': ['MLOps', '评估', 'eval', 'benchmark', '基准测试', 'A/B测试', '模型评估', 'CI/CD', '模型监控', '可观测'],
        'score': 2,
    },
    'product_business': {
        'match': ['商业模式', 'business model', 'SaaS', '创业', 'startup', '融资', '投资', '估值', 'PMF', '增长飞轮', 'ROI', '盈利'],
        'score': 2,
    },
    'llm_general': {
        'match': ['LLM', '大模型', 'GPT', 'Claude', 'Gemini', '开源模型', 'open model', 'Transformer', '注意力', 'attention', 'token'],
        'score': 3,
    },
    'open_source': {
        'match': ['开源', 'open source', 'open-source', 'GitHub', '社区', 'community', 'Apache', 'MIT License'],
        'score': 2,
    },
    'cost_efficiency': {
        'match': ['成本', 'cost', '降本', '效率', 'efficiency', '优化', 'optimiz', '省', '节省'],
        'score': 2,
    },
    'regulation_compliance': {
        'match': ['合规', 'compliance', '监管', 'regulat', 'GDPR', '隐私', 'privacy', '伦理', 'ethics', '治理', 'governance'],
        'score': 2,
    },
}

# Diagram code for each template
DIAGRAM_CODE = {
    'agent_react': 'graph LR\n    IN[输入] --> TH[思考]\n    TH --> AC[行动]\n    AC --> OB[观察]\n    OB -->|"循环"| TH\n    TH --> OUT[输出]',
    'agent_arch': 'graph TB\n    IN[意图] --> PL[规划器]\n    PL --> EX[执行器]\n    EX --> OB[观察]\n    OB -->|"反思"| PL\n    subgraph "支撑"\n        M[记忆]\n        S[技能]\n        T[工具]\n    end\n    PL & EX --> M & S & T',
    'harness': 'graph LR\n    OBS[可观测性] --> GRD[护栏]\n    GRD --> ORC[编排]\n    ORC --> AG[Agent]\n    AG -->|"反馈"| OBS',
    'memory_rag': 'graph TB\n    Q[查询] --> R[检索]\n    R --> K[重排序]\n    K --> C[上下文注入]\n    C --> LLM[生成]\n    subgraph "存储"\n        VDB[向量库]\n        KB[知识库]\n    end\n    R --> VDB & KB',
    'skill_mcp': 'graph TB\n    AG[Agent] --> TB[Tool Bus]\n    TB --> FT[Function]\n    TB --> MT[MCP]\n    MT --> MCS[Server]',
    'multi_agent': 'graph TB\n    L[Leader] --> W1[Worker 1]\n    L --> W2[Worker 2]\n    L --> W3[Worker 3]\n    W1 & W2 & W3 --> MSG[消息]',
    'security': 'graph LR\n    ATK[攻击] --> WAF[防护]\n    WAF --> IDS[检测]\n    IDS --> RSP[响应]\n    RSP --> AUD[审计]',
    'cloud_aws': 'graph TB\n    LB[负载均衡] --> GW[Gateway]\n    GW --> SVC[服务]\n    SVC --> DB[数据]\n    subgraph "Agent"\n        AGT[实例] --> SB[沙箱]\n    end\n    SVC --> AGT',
    'ai_coding': 'graph LR\n    INT[意图] --> PLN[拆解]\n    PLN --> GEN[生成]\n    GEN --> VAL[验证]\n    VAL -->|"失败"| PLN\n    subgraph "上下文"\n        CM[配置]\n        SK[技能]\n    end\n    INT --> CM & SK',
    'training': 'graph LR\n    D[数据] --> SFT[SFT]\n    SFT --> RL[RLHF/DPO]\n    RL --> EV[评估]\n    subgraph "高效"\n        L[LoRA]\n        DS[蒸馏]\n    end\n    SFT --> L\n    EV --> DS',
    'inference': 'graph LR\n    Q[量化] --> KV[KV Cache]\n    KV --> PD[Prefill/Decode]\n    PD --> SP[投机采样]',
    'multimodal': 'graph LR\n    T[文本] --> ENC[编码器]\n    I[图像] --> ENC\n    A[音频] --> ENC\n    ENC --> FUS[融合]\n    FUS --> OUT[输出]',
    'robotics': 'graph TB\n    PER[感知] --> DEC[决策]\n    DEC --> ACT[执行]\n    ACT --> ENV[环境]\n    ENV --> PER\n    DEC --> RL[强化学习]',
    'data_pipeline': 'graph LR\n    SRC[数据源] --> ING[采集]\n    ING --> PROC[处理]\n    PROC --> STO[存储]\n    STO --> SERV[服务]',
    'mlops_eval': 'graph LR\n    TRAIN[训练] --> EVAL[评估]\n    EVAL --> DEPLOY[部署]\n    DEPLOY --> MON[监控]\n    MON -->|"回传"| EVAL',
    'product_business': 'graph LR\n    PROB[问题] --> SOL[方案]\n    SOL --> MKT[验证]\n    MKT --> GROW[增长]\n    GROW --> REV[收入]\n    REV -->|"再投入"| SOL',
    'llm_general': 'graph TB\n    IN[Token] --> EMB[嵌入]\n    EMB --> ATT[注意力]\n    ATT --> FFN[前馈]\n    FFN --> OUT[输出]\n    subgraph "优化"\n        KV[KV Cache]\n        Q[量化]\n    end\n    ATT --> KV\n    FFN --> Q',
    'open_source': 'graph TB\n    SRC[源码] --> FORK[Fork]\n    FORK --> CONTR[贡献]\n    CONTR --> REV[Review]\n    REV --> MERGE[合并]\n    MERGE --> REL[发布]',
    'cost_efficiency': 'graph LR\n    IN[输入] --> ANALY[分析]\n    ANALY --> OPT[优化]\n    OPT --> MEAS[度量]\n    MEAS -->|"迭代"| ANALY',
    'regulation_compliance': 'graph TB\n    REQ[法规要求] --> MAP[映射]\n    MAP --> IMPL[实施]\n    IMPL --> AUD[审计]\n    AUD --> RPT[报告]\n    RPT -->|"更新"| MAP',
}

# Catch-all for anything that doesn't match specific templates
CATCHALL_DIAGRAM = 'graph LR\n    IN[输入] --> PROC[处理]\n    PROC --> OUT[输出]\n    PROC -->|"反馈"| IN'

def score_content(content):
    lower = content.lower()
    scores = {}
    for name, tpl in TEMPLATES.items():
        s = 0
        for kw in tpl['match']:
            if kw.lower() in lower:
                s += tpl['score']
        if s > 0:
            scores[name] = s
    if scores:
        best = max(scores, key=scores.get)
        return DIAGRAM_CODE[best]
    return CATCHALL_DIAGRAM

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
        # Last resort: append at end
        lines.append('\n## 架构图\n')
        lines.append('```mermaid')
        lines.append(mermaid_code)
        lines.append('```')
        with open(filepath, 'w') as f:
            f.write('\n'.join(lines))
        return True
    lines.insert(insert_idx + 1, '')
    lines.insert(insert_idx + 2, '```mermaid')
    lines.insert(insert_idx + 3, mermaid_code)
    lines.insert(insert_idx + 4, '```')
    lines.insert(insert_idx + 5, '')
    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))
    return True

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
        diagram_code = score_content(content)
        if insert_diagram(fpath, diagram_code):
            count += 1
            ch_count += 1
    by_ch[ch] = ch_count

print(f"\nTotal: {count} articles updated")
for ch, c in sorted(by_ch.items(), key=lambda x: -x[1]):
    print(f"  {ch}: +{c}")
