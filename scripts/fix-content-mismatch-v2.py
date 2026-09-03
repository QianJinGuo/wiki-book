"""Fix content-diagram mismatch v2 — chapter-aware + better keyword coverage.

Key improvements over v1:
1. Chapter-based priors: articles in ch04 prefer agent diagrams, ch11 prefer infra, etc.
2. Added generic keywords: 'agent' alone scores for agent_arch, etc.
3. Stronger title weight (3x instead of 2x)
4. Minimum score threshold raised
"""
import re, os, sys

DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'docs'))
DRY_RUN = '--dry' in sys.argv

# Chapter → preferred diagram types (with boost weight)
CHAPTER_PRIORS = {
    'ch01': {'llm_core': 5, 'coding': 3, 'training': 3, 'cost': 2, 'product': 2},
    'ch03': {'coding': 5, 'agent_tool': 3, 'infra': 2},
    'ch04': {'agent_arch': 8, 'agent_react': 6, 'multi_agent': 5, 'agent_tool': 4, 'harness': 3},
    'ch05': {'harness': 8, 'agent_arch': 4, 'security': 3},
    'ch07': {'agent_tool': 8, 'agent_arch': 4, 'opensource': 3},
    'ch09': {'coding': 8, 'agent_arch': 3, 'agent_tool': 3},
    'ch11': {'infra': 8, 'mlops': 4, 'data_pipeline': 3, 'cost': 3},
    'ch12': {'security': 8, 'compliance': 5, 'infra': 3},
}

# Enhanced topic profiles with generic keywords
PROFILES = [
    ('agent_react', {
        'react': 5, '推理+行动': 5, '反思循环': 5, 'reflection loop': 5, 'critic': 3,
        '观察-思考-行动': 5, 'chain-of-thought': 3, 'reasoning trace': 4,
        '反馈循环': 4, 'feedback loop': 4, '自改进': 4, 'self-improv': 4,
        'autoresearch': 5, 'introspect': 5,
    }, 'agent_react'),
    ('agent_arch', {
        'agent架构': 6, '智能体架构': 6, 'agent runtime': 5, 'agent loop': 5,
        '规划器': 4, 'planner': 4, 'plan-and-execute': 5, '执行器': 4, 'executor': 4,
        '观察器': 3, 'observer': 3, 'agent 核心': 5, 'agent core': 5,
        '自主': 3, 'autonomous': 3, 'agent framework': 5,
        'agent': 2, '智能体': 2, '闭环': 3, 'closed loop': 3,
    }, 'agent_arch'),
    ('agent_tool', {
        'mcp': 5, 'function call': 5, 'tool call': 5, '工具调用': 5,
        'tool bus': 4, '技能': 3, 'skill': 3, 'function tool': 4,
        'mcp server': 5, 'mcp协议': 5, '工具总线': 4, '工具选择': 4,
        '工具': 2,
    }, 'agent_tool'),
    ('multi_agent', {
        '多agent': 6, 'multi-agent': 6, '多智能体': 6, 'swarm': 4,
        '团队协作': 4, '子agent': 4, 'sub-agent': 4, 'worker': 3,
        'orchestrator': 3, 'a2a': 5, '协作模式': 4, '协调': 3,
    }, 'multi_agent'),
    ('harness', {
        'harness': 5, '护栏': 5, 'guardrail': 5, '编排层': 4, 'orchestrat': 4,
        '可观测性': 4, 'observability': 4, '审批网关': 4, 'approval gateway': 4,
        '评估框架': 3, 'eval framework': 3, '治理': 3, 'governance': 3,
        '编排': 3, '护栏': 4,
    }, 'harness'),
    ('memory', {
        '记忆': 5, 'memory': 4, '上下文管理': 4, 'context eng': 4,
        '工作记忆': 5, '长期记忆': 5, '会话存储': 4, '遗忘': 3,
        '持久化': 3, '记忆检索': 4, '知识积累': 3, '上下文窗口': 3,
    }, 'memory'),
    ('rag', {
        'rag': 6, '检索增强': 6, '知识检索': 5, '向量检索': 5,
        '检索': 4, 'recall': 3, '召回': 4, 'reranker': 5, 'rerank': 5,
        'bm25': 4, '近邻图': 4, '语义搜索': 5, 'embedding': 3,
        '知识库': 3, '重排序': 4, '上下文注入': 4,
    }, 'rag'),
    ('security', {
        '安全': 5, 'security': 4, '攻击': 5, 'attack': 4, '漏洞': 5, 'vulnerab': 4,
        '渗透': 4, 'cve': 5, '威胁': 4, '零日': 4, '0day': 4, '恶意': 5,
        '注入攻击': 5, 'prompt inject': 5, '越狱': 4, '防护': 3,
        'waf': 3, 'ids': 3, '入侵': 4, '勒索': 4, 'ransomware': 4,
        '基础设施安全': 5, 'fortif': 4,
    }, 'security'),
    ('cloud_infra', {
        'aws': 4, 'bedrock': 5, 'cloudflare': 4, 'docker': 4, 'kubernetes': 5,
        'k8s': 5, 'serverless': 4, '微服务': 3, 'eks': 5, 'ec2': 4,
        's3': 3, 'lambda': 4, '部署': 2, 'deploy': 2, 'devops': 3,
        'terraform': 4, 'nginx': 3, 'cdn': 3, '负载均衡': 3,
        'infrastructure': 3, 'infra': 3,
    }, 'infra'),
    ('ai_coding', {
        'claude code': 6, 'codex': 5, '编码agent': 6, 'coding agent': 6,
        '代码生成': 5, 'ai编程': 5, 'cursor': 5, 'windsurf': 5, 'kiro': 5,
        'vibe coding': 5, '代码补全': 4, 'copilot': 4, 'ide': 3,
        '编程': 3, '代码': 2,
    }, 'coding'),
    ('training', {
        '训练': 5, 'training': 4, '微调': 5, 'fine-tun': 5, 'rlhf': 5,
        'ppo': 4, 'dpo': 5, 'grpo': 5, 'lora': 5, '蒸馏': 4, 'distill': 4,
        'sft': 5, '对齐': 4, 'alignment': 4, '预训练': 4, 'pretrain': 4,
        '监督微调': 5, 'reward model': 4,
    }, 'training'),
    ('inference', {
        '推理优化': 6, '推理加速': 5, 'inference': 3, 'kv cache': 5,
        '量化': 4, 'quantiz': 5, '投机解码': 5, 'speculat': 5,
        'flash attention': 5, '推理架构': 5, 'vllm': 5, 'tensorrt': 4,
        'paged attention': 5, '连续批处理': 4, 'continuous batching': 4,
        'sglang': 4, 'prefill': 4, '推理引擎': 5,
    }, 'inference'),
    ('multimodal', {
        '多模态': 6, 'multimodal': 6, '视觉': 4, 'vision': 4, '图像生成': 5,
        'image generat': 5, 'vlm': 5, '文生图': 5, 'tts': 4, '语音': 4,
        '扩散模型': 4, 'diffusion': 4, '视频生成': 5, '音频': 3,
    }, 'multimodal'),
    ('robotics', {
        '机器人': 6, 'robot': 5, '具身': 6, 'embodied': 6, 'ros': 4,
        '自动驾驶': 5, '仿真': 3, 'simulat': 3, '运动控制': 4,
        '感知': 2, 'slam': 4,
    }, 'robotics'),
    ('data_pipeline', {
        '数据管道': 5, 'data pipeline': 5, 'etl': 5, 'kafka': 4, 'flink': 4,
        'spark': 4, '数据湖': 5, '数据仓库': 5, '数据治理': 4,
        '数据质量': 4, 'iceberg': 4, '特征工程': 4, '特征存储': 4,
    }, 'data_pipeline'),
    ('mlops', {
        'mlops': 6, 'benchmark': 4, '基准测试': 5,
        'a/b测试': 4, '模型评估': 5, 'ci/cd': 4, '模型监控': 5,
        '实验管理': 4, 'mlflow': 4, 'wandb': 4,
    }, 'mlops'),
    ('product_business', {
        '商业模式': 5, 'business model': 5, 'saas': 4, '创业': 4,
        'startup': 4, '融资': 4, '投资': 3, '估值': 4, 'pmf': 5,
        '增长飞轮': 4, 'roi': 3, '盈利': 4,
    }, 'product'),
    ('llm_general', {
        'llm': 4, '大模型': 4, 'gpt': 3, 'gemini': 3, '开源模型': 3,
        'open model': 3, 'transformer': 4, '注意力': 3, 'attention': 3,
        'token': 3, 'embedding': 3, 'tokenizer': 4, '语言模型': 4,
        '参数分配': 5, 'tapered': 5, 'model arch': 4,
    }, 'llm_core'),
    ('opensource', {
        '开源': 4, 'open source': 4, 'open-source': 4, 'github': 2,
        '社区': 2, 'community': 2, 'apache': 3, 'mit license': 3,
        '贡献': 2, 'fork': 2, '捐赠': 4, 'donate': 4,
    }, 'opensource'),
    ('cost_efficiency', {
        '成本': 5, 'cost': 4, '降本': 5, '效率': 3, 'efficiency': 3,
        '优化': 2, 'optimiz': 2, '节省': 4, 'spot实例': 4,
        '性价比': 4, '降本增效': 5,
    }, 'cost'),
    ('regulation', {
        '合规': 5, 'compliance': 5, '监管': 4, 'regulat': 4, 'gdpr': 5,
        '隐私': 4, 'privacy': 4, '伦理': 4, 'ethics': 4, '治理': 3,
        'governance': 3, '审计': 3, 'cisa': 5, '法案': 4,
    }, 'compliance'),
]

# Same DIAGRAMS dict as before
DIAGRAMS = {}  # Will be populated below

def load_diagrams():
    """Load diagram templates from the v4 script."""
    global DIAGRAMS
    # Inline the diagrams (same as v4/fix-v1)
    DIAGRAMS = {
        'agent_react': '''graph TB
    subgraph "ReAct 循环"
        IN[用户输入] --> TH[思考<br/>Reasoning]
        TH --> AC[行动<br/>Action]
        AC --> OB[观察<br/>Observation]
        OB -->|"新信息触发"| TH
        TH -->|"推理完成"| OUT[最终回答]
    end
    subgraph "记忆"
        WM[工作记忆<br/>上下文窗口]
        SM[短期记忆<br/>会话存储]
    end
    TH --> WM
    OB --> SM
    SM -->|"回忆"| TH
    classDef think fill:#dbeafe,stroke:#2563eb
    classDef act fill:#d1fae5,stroke:#059669
    classDef mem fill:#fef3c7,stroke:#d97706
    class TH,OUT think
    class AC,OB act
    class WM,SM mem''',
        'agent_arch': '''graph TB
    subgraph "Agent 内核"
        PL[规划器<br/>Planner] --> EX[执行器<br/>Executor]
        EX --> OB[观察器<br/>Observer]
        OB -->|"反馈"| PL
    end
    subgraph "能力层"
        SK[技能<br/>Skills]
        TL[工具<br/>Tools]
        MM[记忆<br/>Memory]
    end
    PL --> SK
    PL --> MM
    EX --> TL
    OB --> MM
    subgraph "护栏"
        GRD[输入校验]
        OUT_GRD[输出过滤]
    end
    IN[用户意图] --> GRD --> PL
    OUT[响应] --> OUT_GRD --> USR[用户]
    classDef core fill:#dbeafe,stroke:#2563eb
    classDef cap fill:#ede9fe,stroke:#7c3aed
    classDef guard fill:#fee2e2,stroke:#dc2626
    class PL,EX,OB core
    class SK,TL,MM cap
    class GRD,OUT_GRD guard''',
        'agent_tool': '''graph TB
    subgraph "Agent 核心"
        INT[意图理解] --> PLAN[任务规划]
        PLAN --> EXEC[工具选择与调用]
        EXEC --> VERIFY[结果验证]
        VERIFY -->|"失败重试"| PLAN
    end
    subgraph "工具层"
        direction LR
        FT[Function<br/>自定义函数]
        MT[MCP Server<br/>外部服务]
        API[REST API<br/>HTTP调用]
    end
    EXEC --> FT
    EXEC --> MT
    EXEC --> API
    subgraph "安全层"
        AUTH[权限检查]
        SANDBOX[沙箱隔离]
        AUDIT[审计日志]
    end
    EXEC --> AUTH --> SANDBOX
    SANDBOX --> AUDIT
    classDef agent fill:#dbeafe,stroke:#2563eb
    classDef tool fill:#d1fae5,stroke:#059669
    classDef sec fill:#fee2e2,stroke:#dc2626
    class INT,PLAN,EXEC,VERIFY agent
    class FT,MT,API tool
    class AUTH,SANDBOX,AUDIT sec''',
        'multi_agent': '''graph TB
    subgraph "编排层"
        COORD[协调器<br/>Orchestrator]
        QUEUE[消息队列]
    end
    subgraph "Agent 团队"
        W1["Worker A<br/>专项能力1"]
        W2["Worker B<br/>专项能力2"]
        W3["Worker C<br/>专项能力3"]
    end
    COORD --> QUEUE
    QUEUE --> W1 & W2 & W3
    W1 & W2 & W3 -->|"结果"| QUEUE
    QUEUE -->|"汇总"| COORD
    subgraph "共享层"
        SHARED_MEM[共享记忆]
        TOOL_BUS[工具总线]
    end
    W1 & W2 & W3 --> SHARED_MEM
    W1 & W2 & W3 --> TOOL_BUS
    IN[任务输入] --> COORD
    COORD --> OUT[结果输出]
    classDef coord fill:#dbeafe,stroke:#2563eb
    classDef worker fill:#ede9fe,stroke:#7c3aed
    classDef shared fill:#fef3c7,stroke:#d97706
    class COORD,QUEUE coord
    class W1,W2,W3 worker
    class SHARED_MEM,TOOL_BUS shared''',
        'harness': '''graph TB
    subgraph "可观测性层"
        LOG[日志采集] --> TRACE[链路追踪]
        TRACE --> METRIC[指标聚合]
        METRIC --> DASH[仪表盘/告警]
    end
    subgraph "护栏层"
        IN_CHK[输入校验<br/>提示注入检测]
        RATE[速率限制<br/>成本控制]
        OUT_CHK[输出过滤<br/>PII脱敏]
    end
    subgraph "编排层"
        ORC[工作流引擎]
        STATE[状态管理]
        RETRY[错误恢复]
    end
    REQ[请求] --> IN_CHK --> ORC
    ORC --> AGENT[Agent 执行]
    AGENT --> OUT_CHK --> RES[响应]
    DASH -->|"异常信号"| RATE
    ORC --> STATE --> RETRY
    classDef obs fill:#dbeafe,stroke:#2563eb
    classDef guard fill:#fee2e2,stroke:#dc2626
    classDef orch fill:#d1fae5,stroke:#059669
    class LOG,TRACE,METRIC,DASH obs
    class IN_CHK,RATE,OUT_CHK guard
    class ORC,STATE,RETRY orch''',
        'memory': '''graph TB
    subgraph "工作记忆"
        CTX[上下文窗口<br/>当前对话]
        ATTN[注意力机制<br/>关键信息加权]
    end
    subgraph "短期记忆"
        SESSION[Session 存储<br/>对话历史]
        CACHE[临时缓存<br/>中间结果]
    end
    subgraph "长期记忆"
        VDB[(向量数据库<br/>语义检索)]
        KG[(知识图谱<br/>关系存储)]
        STRUCT[(结构化存储<br/>用户画像)]
    end
    CTX --> ATTN --> SESSION --> CACHE
    CACHE --> VDB & KG & STRUCT
    subgraph "记忆管理"
        IMPORT[重要性评分]
        COMPRESS[压缩摘要]
        FORGET[遗忘策略]
    end
    VDB & KG & STRUCT --> IMPORT
    IMPORT --> COMPRESS
    IMPORT --> FORGET
    COMPRESS -->|"注入"| CTX
    classDef work fill:#fee2e2,stroke:#dc2626
    classDef short fill:#fef3c7,stroke:#d97706
    classDef long fill:#dbeafe,stroke:#2563eb
    classDef mgmt fill:#ede9fe,stroke:#7c3aed
    class CTX,ATTN work
    class SESSION,CACHE short
    class VDB,KG,STRUCT long
    class IMPORT,COMPRESS,FORGET mgmt''',
        'rag': '''graph TB
    subgraph "查询处理"
        Q[用户查询] --> REWRITE[查询改写]
        REWRITE --> EXPAND[查询扩展]
    end
    subgraph "多路召回"
        BM25[BM25<br/>关键词检索]
        VDB[向量检索<br/>语义相似度]
        GRAPH[近邻图<br/>TF-IDF余弦]
    end
    EXPAND --> BM25 & VDB & GRAPH
    subgraph "重排序与融合"
        RERANK[Reranker<br/>交叉编码器]
        MERGE[分数融合<br/>RRF/加权]
    end
    BM25 & VDB & GRAPH --> RERANK --> MERGE
    subgraph "上下文工程"
        INJECT[上下文注入]
        COMPRESS[压缩/摘要]
    end
    MERGE --> INJECT --> COMPRESS
    COMPRESS --> LLM[LLM 生成]
    LLM --> ANS[回答]
    classDef query fill:#dbeafe,stroke:#2563eb
    classDef recall fill:#ede9fe,stroke:#7c3aed
    classDef rerank fill:#fef3c7,stroke:#d97706
    classDef ctx fill:#d1fae5,stroke:#059669
    class Q,REWRITE,EXPAND query
    class BM25,VDB,GRAPH recall
    class RERANK,MERGE rerank
    class INJECT,COMPRESS,LLM ctx''',
        'security': '''graph TB
    subgraph "攻击面"
        PROMPT_INJ[提示注入]
        DATA_LEAK[数据泄露]
        SUPPLY[供应链攻击]
        ADVERSARIAL[对抗样本]
    end
    subgraph "防御纵深"
        WAF[应用防火墙]
        INPUT_GUARD[输入护栏<br/>意图检测]
        SANDBOX[沙箱隔离<br/>权限最小化]
        OUTPUT_GUARD[输出审查<br/>PII过滤]
    end
    subgraph "检测响应"
        IDS[入侵检测<br/>行为异常]
        SIEM[安全事件中心]
        AUTO_BLOCK[自动阻断]
        FORENSIC[取证分析]
    end
    PROMPT_INJ --> INPUT_GUARD
    DATA_LEAK --> OUTPUT_GUARD
    SUPPLY --> SANDBOX
    ADVERSARIAL --> WAF
    INPUT_GUARD & OUTPUT_GUARD --> IDS
    WAF & SANDBOX --> IDS
    IDS --> SIEM --> AUTO_BLOCK & FORENSIC
    classDef attack fill:#fee2e2,stroke:#dc2626
    classDef defense fill:#dbeafe,stroke:#2563eb
    classDef detect fill:#fef3c7,stroke:#d97706
    class PROMPT_INJ,DATA_LEAK,SUPPLY,ADVERSARIAL attack
    class WAF,INPUT_GUARD,SANDBOX,OUTPUT_GUARD defense
    class IDS,SIEM,AUTO_BLOCK,FORENSIC detect''',
        'infra': '''graph TB
    subgraph "边缘层"
        CDN[CDN/缓存] --> LB[负载均衡]
        LB --> GW[API Gateway<br/>认证+限流]
    end
    subgraph "服务层"
        SVC_A[业务服务A]
        SVC_B[业务服务B]
        AGENT_SVC[Agent 服务]
    end
    GW --> SVC_A & SVC_B & AGENT_SVC
    subgraph "Agent 运行时"
        SANDBOX[沙箱隔离]
        RUNTIME[执行引擎]
        POOL[连接池]
    end
    AGENT_SVC --> SANDBOX --> RUNTIME
    RUNTIME --> POOL
    subgraph "数据层"
        DB[(关系数据库)]
        CACHE[(Redis缓存)]
        OBJ[(对象存储)]
        VDB[(向量数据库)]
    end
    SVC_A --> DB & CACHE
    AGENT_SVC --> OBJ & VDB
    classDef edge fill:#fef3c7,stroke:#d97706
    classDef svc fill:#dbeafe,stroke:#2563eb
    classDef runtime fill:#ede9fe,stroke:#7c3aed
    classDef data fill:#d1fae5,stroke:#059669
    class CDN,LB,GW edge
    class SVC_A,SVC_B,AGENT_SVC svc
    class SANDBOX,RUNTIME,POOL runtime
    class DB,CACHE,OBJ,VDB data''',
        'coding': '''graph TB
    subgraph "意图理解"
        NAT[自然语言描述] --> PARSE[意图解析]
        PARSE --> CTX[上下文收集<br/>代码库/配置]
    end
    subgraph "代码生成"
        PLAN[任务分解] --> GEN[代码生成]
        GEN --> REVIEW[静态分析]
        REVIEW -->|"问题"| GEN
    end
    subgraph "验证闭环"
        TEST[运行测试]
        LINT[风格检查]
        FIX[自动修复]
    end
    GEN --> TEST & LINT
    TEST -->|"失败"| FIX --> GEN
    subgraph "知识库"
        SKILLS[技能/模板]
        DOCS[文档/示例]
    end
    CTX --> PLAN
    PLAN --> SKILLS & DOCS
    classDef intent fill:#dbeafe,stroke:#2563eb
    classDef gen fill:#ede9fe,stroke:#7c3aed
    classDef verify fill:#d1fae5,stroke:#059669
    classDef kb fill:#fef3c7,stroke:#d97706
    class NAT,PARSE,CTX intent
    class PLAN,GEN,REVIEW gen
    class TEST,LINT,FIX verify
    class SKILLS,DOCS kb''',
        'training': '''graph LR
    subgraph "数据准备"
        RAW[原始数据] --> CLEAN[清洗过滤]
        CLEAN --> ANNOTATE[标注/质量筛选]
        ANNOTATE --> SPLIT[训练/验证分割]
    end
    subgraph "训练阶段"
        PRE[预训练<br/>Next-Token]
        SFT[监督微调<br/>指令跟随]
        ALIGN[对齐<br/>RLHF/DPO/GRPO]
    end
    SPLIT --> PRE --> SFT --> ALIGN
    subgraph "高效训练"
        LORA[LoRA/QLoRA<br/>参数高效]
        DISTIL[知识蒸馏<br/>模型压缩]
        DS[DeepSpeed<br/>分布式]
    end
    SFT --> LORA
    ALIGN --> DISTIL
    PRE --> DS
    subgraph "评估"
        AUTO[自动评测<br/>基准测试]
        HUMAN[人工评测<br/>对抗测试]
    end
    ALIGN --> AUTO & HUMAN
    classDef data fill:#fef3c7,stroke:#d97706
    classDef train fill:#dbeafe,stroke:#2563eb
    classDef eff fill:#ede9fe,stroke:#7c3aed
    classDef eval fill:#d1fae5,stroke:#059669
    class RAW,CLEAN,ANNOTATE,SPLIT data
    class PRE,SFT,ALIGN train
    class LORA,DISTIL,DS eff
    class AUTO,HUMAN eval''',
        'inference': '''graph TB
    subgraph "模型优化"
        QUANT[量化<br/>INT4/GPTQ/AWQ]
        PRUNE[剪枝<br/>稀疏化]
        DISTIL[蒸馏<br/>小模型]
    end
    subgraph "运行时优化"
        KV[KV Cache<br/>PagedAttention]
        MQA[GQA/MQA<br/>注意力压缩]
        SPEC[投机解码<br/>Draft→Verify]
    end
    subgraph "调度策略"
        PRE[Prefill<br/>首token计算]
        DEC[Decode<br/>自回归生成]
        CB[连续批处理<br/>Dynamic Batching]
    end
    QUANT --> KV
    PRUNE --> MQA
    DISTIL --> SPEC
    KV --> PRE & DEC
    PRE & DEC --> CB
    subgraph "部署架构"
        DP[数据并行]
        TP[张量并行]
        PP[流水线并行]
    end
    CB --> DP & TP & PP
    classDef model fill:#dbeafe,stroke:#2563eb
    classDef runtime fill:#ede9fe,stroke:#7c3aed
    classDef sched fill:#fef3c7,stroke:#d97706
    classDef deploy fill:#d1fae5,stroke:#059669
    class QUANT,PRUNE,DISTIL model
    class KV,MQA,SPEC runtime
    class PRE,DEC,CB sched
    class DP,TP,PP deploy''',
        'multimodal': '''graph TB
    subgraph "编码器"
        T_ENC[文本编码器<br/>Tokenizer+Embedding]
        I_ENC[视觉编码器<br/>ViT/Patch Embedding]
        A_ENC[音频编码器<br/>Whisper/Encodec]
    end
    subgraph "对齐层"
        PROJ_T[文本投影]
        PROJ_I[视觉投影]
        PROJ_A[音频投影]
    end
    T_ENC --> PROJ_T
    I_ENC --> PROJ_I
    A_ENC --> PROJ_A
    subgraph "融合"
        FUSE[跨模态注意力<br/>融合层]
    end
    PROJ_T & PROJ_I & PROJ_A --> FUSE
    subgraph "生成"
        LLM[语言模型<br/>自回归解码]
        DEC_I[图像解码<br/>扩散模型]
        DEC_A[音频解码<br/>TTS]
    end
    FUSE --> LLM
    LLM --> DEC_I & DEC_A
    classDef enc fill:#dbeafe,stroke:#2563eb
    classDef align fill:#fef3c7,stroke:#d97706
    classDef fuse fill:#ede9fe,stroke:#7c3aed
    classDef dec fill:#d1fae5,stroke:#059669
    class T_ENC,I_ENC,A_ENC enc
    class PROJ_T,PROJ_I,PROJ_A align
    class FUSE fuse
    class LLM,DEC_I,DEC_A dec''',
        'robotics': '''graph TB
    subgraph "感知层"
        VISION[视觉感知<br/>RGB-D/点云]
        TOUCH[触觉传感<br/>力反馈]
        PROPRIO[本体感受<br/>关节状态]
    end
    subgraph "认知层"
        MAP[环境建图<br/>SLAM]
        LOC[定位<br/>GPS+IMU]
        UNDERSTAND[场景理解<br/>目标检测]
    end
    VISION --> MAP & UNDERSTAND
    TOUCH & PROPRIO --> LOC
    subgraph "决策层"
        PLAN[任务规划<br/>LLM/VLM]
        MOTION[运动规划<br/>RRT/MPC]
        RL[强化学习<br/>Sim-to-Real]
    end
    MAP & UNDERSTAND --> PLAN
    LOC --> MOTION
    PLAN --> MOTION
    MOTION --> RL
    subgraph "执行层"
        CTRL[运动控制<br/>PID/阻抗]
        SAFETY[安全约束<br/>力限/避障]
    end
    RL --> CTRL
    CTRL --> SAFETY
    SAFETY --> ENV[物理环境]
    ENV --> VISION & TOUCH
    classDef perc fill:#dbeafe,stroke:#2563eb
    classDef cog fill:#ede9fe,stroke:#7c3aed
    classDef dec fill:#fef3c7,stroke:#d97706
    classDef exec fill:#d1fae5,stroke:#059669
    class VISION,TOUCH,PROPRIO perc
    class MAP,LOC,UNDERSTAND cog
    class PLAN,MOTION,RL dec
    class CTRL,SAFETY exec''',
        'data_pipeline': '''graph TB
    subgraph "数据源"
        API[API 接口]
        DB_SRC[(数据库)]
        STREAM[流式数据]
        FILES[文件/日志]
    end
    subgraph "采集层"
        INGEST[数据摄入<br/>Kafka/Flink]
        CDC[变更捕获<br/>CDC]
    end
    API & DB_SRC --> INGEST
    DB_SRC --> CDC
    STREAM & FILES --> INGEST
    subgraph "处理层"
        CLEAN[清洗/去重]
        TRANSFORM[转换/计算]
        QUALITY[质量校验]
    end
    INGEST & CDC --> CLEAN --> TRANSFORM --> QUALITY
    subgraph "存储层"
        LAKE[数据湖<br/>Iceberg/Delta]
        WH[数据仓库<br/>ClickHouse]
        FEAT[特征存储<br/>Feast]
    end
    QUALITY --> LAKE
    QUALITY --> WH
    QUALITY --> FEAT
    classDef src fill:#fef3c7,stroke:#d97706
    classDef ing fill:#dbeafe,stroke:#2563eb
    classDef proc fill:#ede9fe,stroke:#7c3aed
    classDef sto fill:#d1fae5,stroke:#059669
    class API,DB_SRC,STREAM,FILES src
    class INGEST,CDC ing
    class CLEAN,TRANSFORM,QUALITY proc
    class LAKE,WH,FEAT sto''',
        'mlops': '''graph TB
    subgraph "实验管理"
        TRACK[实验追踪<br/>MLflow/W&B]
        HP[超参调优<br/>Optuna]
        REG[模型注册<br/>版本管理]
    end
    subgraph "评估流水线"
        BENCH[基准测试<br/>自动评测]
        HUMAN[人工评估<br/>LLM-as-Judge]
        DRIFT[漂移检测<br/>数据/概念漂移]
    end
    subgraph "部署流水线"
        PACKAGE[模型打包<br/>ONNX/TensorRT]
        TEST[Integration测试<br/>回归检测]
        DEPLOY[灰度发布<br/>A/B测试]
    end
    TRACK --> HP --> REG
    REG --> BENCH & HUMAN
    BENCH & HUMAN --> DRIFT
    DRIFT --> PACKAGE --> TEST --> DEPLOY
    subgraph "监控"
        PERF[性能监控<br/>延迟/吞吐]
        ALERT[告警规则<br/>异常检测]
        RETRAIN[触发再训练]
    end
    DEPLOY --> PERF --> ALERT --> RETRAIN --> TRACK
    classDef exp fill:#dbeafe,stroke:#2563eb
    classDef eval fill:#ede9fe,stroke:#7c3aed
    classDef deploy fill:#fef3c7,stroke:#d97706
    classDef mon fill:#d1fae5,stroke:#059669
    class TRACK,HP,REG exp
    class BENCH,HUMAN,DRIFT eval
    class PACKAGE,TEST,DEPLOY deploy
    class PERF,ALERT,RETRAIN mon''',
        'product': '''graph TB
    subgraph "发现"
        PROB[问题定义<br/>用户痛点]
        JTBD[任务理解<br/>JTBD框架]
        SEG[市场细分<br/>目标用户]
    end
    subgraph "验证"
        MVP[MVP构建<br/>最小可行]
        PMF[产品市场匹配<br/>PMF验证]
        ITER[快速迭代<br/>用户反馈]
    end
    PROB --> JTBD --> SEG --> MVP --> PMF --> ITER
    ITER -->|"Pivot"| PROB
    subgraph "增长"
        FLYWHEEL[增长飞轮<br/>自增强循环]
        UNIT_ECO[单位经济<br/>LTV/CAC]
        SCALE[规模化<br/>渠道扩展]
    end
    PMF --> FLYWHEEL --> UNIT_ECO --> SCALE
    classDef discover fill:#dbeafe,stroke:#2563eb
    classDef validate fill:#ede9fe,stroke:#7c3aed
    classDef growth fill:#d1fae5,stroke:#059669
    class PROB,JTBD,SEG discover
    class MVP,PMF,ITER validate
    class FLYWHEEL,UNIT_ECO,SCALE growth''',
        'llm_core': '''graph TB
    subgraph "输入处理"
        TOK[Tokenizer<br/>BPE分词] --> EMB[Embedding<br/>语义嵌入]
        EMB --> POS[位置编码<br/>RoPE/ALiBi]
    end
    subgraph "Transformer Block ×N"
        ATT[Multi-Head Attention<br/>自注意力]
        ADD1[残差连接+LayerNorm]
        FFN[FFN / MoE<br/>前馈/混合专家]
        ADD2[残差连接+LayerNorm]
        POS --> ATT --> ADD1 --> FFN --> ADD2
    end
    subgraph "输出"
        PROJ[输出投影]
        SOFT[Softmax / Sampling]
        NEXT[Next-Token]
    end
    ADD2 --> PROJ --> SOFT --> NEXT
    subgraph "优化技术"
        KV[KV Cache<br/>PagedAttention]
        QUANT[量化 INT4/8]
        SPEC[投机解码]
    end
    ATT --> KV
    FFN --> QUANT
    SOFT --> SPEC
    classDef input fill:#fef3c7,stroke:#d97706
    classDef block fill:#dbeafe,stroke:#2563eb
    classDef output fill:#d1fae5,stroke:#059669
    classDef opt fill:#ede9fe,stroke:#7c3aed
    class TOK,EMB,POS input
    class ATT,ADD1,FFN,ADD2 block
    class PROJ,SOFT,NEXT output
    class KV,QUANT,SPEC opt''',
        'opensource': '''graph TB
    subgraph "项目生命周期"
        INIT[项目创建<br/>License选择]
        FORK[Fork/Clone<br/>本地开发]
        CONTR[贡献代码<br/>PR流程]
    end
    subgraph "质量门禁"
        CI[CI自动化<br/>测试+Lint]
        REVIEW[Code Review<br/>同行评审]
        MERGE[合并决策<br/>维护者审批]
    end
    CONTR --> CI --> REVIEW --> MERGE
    subgraph "发布"
        VERSION[版本管理<br/>SemVer]
        REL[发布<br/>Changelog]
        DIST[分发<br/>PyPI/npm]
    end
    MERGE --> VERSION --> REL --> DIST
    subgraph "社区"
        DISCUSS[讨论区<br/>Issue/Discord]
        GOV[治理模型<br/>BDFL/委员会]
    end
    DIST --> DISCUSS --> GOV
    GOV -->|"方向反馈"| INIT
    classDef life fill:#dbeafe,stroke:#2563eb
    classDef quality fill:#ede9fe,stroke:#7c3aed
    classDef release fill:#fef3c7,stroke:#d97706
    classDef community fill:#d1fae5,stroke:#059669
    class INIT,FORK,CONTR life
    class CI,REVIEW,MERGE quality
    class VERSION,REL,DIST release
    class DISCUSS,GOV community''',
        'cost': '''graph TB
    subgraph "成本分析"
        MEASURE[度量<br/>Token/延迟/存储]
        PROFILE[剖析<br/>瓶颈定位]
        COMPARE[对比<br/>方案ROI]
    end
    subgraph "优化手段"
        MODEL_OPT[模型优化<br/>量化/蒸馏/剪枝]
        INFRA_OPT[基础设施<br/>Spot/自动扩缩]
        PROMPT_OPT[提示优化<br/>缓存/压缩]
    end
    MEASURE --> PROFILE --> COMPARE
    COMPARE --> MODEL_OPT & INFRA_OPT & PROMPT_OPT
    subgraph "效果验证"
        A_B[A/B测试]
        METRIC[指标对比<br/>成本vs质量]
    end
    MODEL_OPT & INFRA_OPT & PROMPT_OPT --> A_B --> METRIC
    METRIC -->|"迭代"| MEASURE
    classDef analysis fill:#dbeafe,stroke:#2563eb
    classDef optimize fill:#ede9fe,stroke:#7c3aed
    classDef verify fill:#d1fae5,stroke:#059669
    class MEASURE,PROFILE,COMPARE analysis
    class MODEL_OPT,INFRA_OPT,PROMPT_OPT optimize
    class A_B,METRIC verify''',
        'compliance': '''graph TB
    subgraph "法规要求"
        GDPR[GDPR<br/>数据保护]
        INDUSTRY[行业标准<br/>金融/医疗]
        LOCAL[地方法规<br/>网安法/个保法]
    end
    subgraph "实施层"
        MAP[合规映射<br/>要求→措施]
        IMPL[技术实施<br/>加密/脱敏/审计]
        TRAIN[人员培训<br/>意识提升]
    end
    GDPR & INDUSTRY & LOCAL --> MAP
    MAP --> IMPL & TRAIN
    subgraph "审计层"
        INTERNAL[内部审计<br/>自查自纠]
        EXTERNAL[外部审计<br/>第三方认证]
        REPORT[合规报告<br/>持续更新]
    end
    IMPL --> INTERNAL --> EXTERNAL --> REPORT
    REPORT -->|"法规变化"| MAP
    classDef req fill:#fee2e2,stroke:#dc2626
    classDef impl fill:#dbeafe,stroke:#2563eb
    classDef audit fill:#d1fae5,stroke:#059669
    class GDPR,INDUSTRY,LOCAL req
    class MAP,IMPL,TRAIN impl
    class INTERNAL,EXTERNAL,REPORT audit''',
        'catchall': '''graph TB
    IN[输入/需求] --> ANALYZE[分析理解]
    ANALYZE --> DESIGN[方案设计]
    DESIGN --> IMPL[实现执行]
    IMPL --> VERIFY[验证评估]
    VERIFY -->|"不达标"| DESIGN
    VERIFY --> OUT[输出/交付]
    subgraph "支撑"
        KB[知识库<br/>经验沉淀]
        TOOL[工具链<br/>自动化]
        FEEDBACK[反馈环<br/>持续改进]
    end
    ANALYZE --> KB
    IMPL --> TOOL
    VERIFY --> FEEDBACK
    FEEDBACK --> KB
    classDef main fill:#dbeafe,stroke:#2563eb
    classDef support fill:#ede9fe,stroke:#7c3aed
    class IN,ANALYZE,DESIGN,IMPL,VERIFY,OUT main
    class KB,TOOL,FEEDBACK support''',
    }


def score_content(content, chapter):
    """Score content + chapter prior to find best diagram."""
    lower = content[:3000].lower()
    title_m = re.search(r'^#\s+(.+)', content, re.MULTILINE)
    title = title_m.group(1).lower() if title_m else ''
    combined = title + ' ' + title + ' ' + title + ' ' + lower  # 3x title weight
    
    best_profile = None
    best_score = 0
    
    # Get chapter priors
    priors = CHAPTER_PRIORS.get(chapter, {})
    
    for profile_name, keywords, diagram_key in PROFILES:
        score = 0
        for kw, weight in keywords.items():
            count = combined.count(kw.lower())
            score += count * weight
        
        # Add chapter prior
        if diagram_key in priors:
            score += priors[diagram_key] * 3  # Prior boost
        
        if score > best_score:
            best_score = score
            best_profile = diagram_key
    
    if best_score >= 5:
        return best_profile
    return 'catchall'


def is_mismatch(current_subgraphs, correct_key):
    """Check if current diagram matches the correct key."""
    sg_str = '|'.join(current_subgraphs).lower()
    mapping = {
        'agent_react': ['react', '循环'],
        'agent_arch': ['agent 内核'],
        'agent_tool': ['agent 核心', '工具层'],
        'multi_agent': ['agent 团队'],
        'harness': ['可观测性层'],
        'memory': ['工作记忆', '短期记忆', '长期记忆'],
        'rag': ['查询处理', '多路召回'],
        'security': ['攻击面', '防御纵深'],
        'infra': ['边缘层', '服务层'],
        'coding': ['意图理解', '代码生成'],
        'training': ['数据准备', '训练阶段'],
        'inference': ['模型优化', '运行时优化'],
        'multimodal': ['编码器', '对齐层'],
        'robotics': ['感知层', '认知层'],
        'data_pipeline': ['数据源', '采集层'],
        'mlops': ['实验管理', '评估流水线'],
        'product': ['发现', '验证', '增长'],
        'llm_core': ['输入处理', 'transformer'],
        'opensource': ['项目生命周期'],
        'cost': ['成本分析'],
        'compliance': ['法规要求'],
        'catchall': [],
    }
    expected = mapping.get(correct_key, [])
    if not expected:
        return True
    for exp in expected:
        if exp in sg_str:
            return False
    return True


def fix_article(filepath, chapter):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Find the architecture diagram (non-mindmap)
    blocks = list(re.finditer(r'\`\`\`mermaid\n(.*?)\`\`\`', content, re.DOTALL))
    arch_match = None
    for m in blocks:
        code = m.group(1).strip()
        if not code.startswith('mindmap'):
            arch_match = m
            break
    
    if arch_match is None:
        return False
    
    code = arch_match.group(1).strip()
    subgraphs = re.findall(r'subgraph\s+"([^"]+)"', code)
    
    # Determine correct diagram based on content + chapter
    correct_key = score_content(content, chapter)
    
    if not is_mismatch(subgraphs, correct_key):
        return False
    
    # Replace
    new_code = DIAGRAMS.get(correct_key, DIAGRAMS['catchall'])
    new_block = f'```mermaid\n{new_code}\n```'
    new_content = content[:arch_match.start()] + new_block + content[arch_match.end():]
    
    if not DRY_RUN:
        with open(filepath, 'w') as f:
            f.write(new_content)
    return correct_key


load_diagrams()
count = 0
changes = {}
for ch in ['ch01', 'ch03', 'ch04', 'ch05', 'ch07', 'ch09', 'ch11', 'ch12']:
    ch_dir = os.path.join(DOCS_DIR, ch)
    if not os.path.isdir(ch_dir):
        continue
    for fname in sorted(os.listdir(ch_dir)):
        if not fname.endswith('.md'):
            continue
        fpath = os.path.join(ch_dir, fname)
        result = fix_article(fpath, ch)
        if result:
            count += 1
            changes[result] = changes.get(result, 0) + 1

print(f"\nTotal: {count} articles fixed")
for k, v in sorted(changes.items(), key=lambda x: -x[1]):
    print(f"  → {k}: {v}")
