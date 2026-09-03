"""Upgrade generic template mermaid diagrams to content-aware, semantically deeper diagrams.

Strategy:
1. Read article title + first 500 chars to determine topic
2. Match to one of ~40 specialized diagram templates with richer structure
3. Replace the first generic mermaid block with a content-aware one
4. Templates have more nodes, data flows, and C4-style boundaries
"""
import re, os, sys

DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'docs'))
DRY_RUN = '--dry' in sys.argv

# Generic template signatures (first line of mermaid code) → replacement category
GENERIC_SIGS = {
    'graph LR\n    OBS[可观测性] --> GRD[护栏]': 'harness',
    'graph LR\n    OBS[可观测性] --> GRD[护栏]': 'harness',
    'graph TB\n    LB[负载均衡] --> GW[Gateway]': 'infra',
    'graph TB\n    IN[Token] --> EMB[嵌入]': 'llm_core',
    'graph TB\n    IN[输入Token] --> EMB[嵌入层]': 'llm_core',
    'graph LR\n    ATK[攻击] --> WAF[防护]': 'security',
    'graph LR\n    ATK[攻击向量] --> WAF[防护层]': 'security',
    'graph LR\n    D[数据] --> SFT[SFT]': 'training',
    'graph LR\n    INT[意图] --> PLN[拆解]': 'coding',
    'graph TB\n    AG[Agent] --> TB[Tool Bus]': 'agent_tool',
    'graph TB\n    Q[查询] --> R[检索]': 'rag',
    'graph TB\n    L[Leader] --> W1[Worker 1]': 'multi_agent',
    'graph LR\n    IN[输入] --> ANALY[分析]': 'cost',
    'graph LR\n    Q[量化] --> KV[KV Cache]': 'inference',
    'graph LR\n    T[文本] --> ENC[编码器]': 'multimodal',
    'graph TB\n    PER[感知] --> DEC[决策]': 'robotics',
    'graph TB\n    IN[意图] --> PL[规划器]': 'agent_arch',
    'graph TB\n    SRC[源码] --> FORK[Fork]': 'opensource',
    'graph LR\n    IN[输入] --> PROC[处理]': 'catchall',
    'graph TB\n    REQ[法规要求] --> MAP[映射]': 'compliance',
    'graph LR\n    SRC[数据源] --> ING[采集]': 'data_pipeline',
    'graph LR\n    TRAIN[训练] --> EVAL[评估]': 'mlops',
    'graph LR\n    PROB[问题] --> SOL[方案]': 'product',
    'graph TB\n    ATK[攻击] --> WAF[防护]': 'security',
}

# Content-aware diagram templates — much richer than the generic ones
# Keyed by category + sub-topic detected from content
RICH_DIAGRAMS = {
    # ===== AGENT =====
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

    # ===== HARNESS =====
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

    # ===== INFRA =====
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

    # ===== SECURITY =====
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

    # ===== RAG =====
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

    # ===== TRAINING =====
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

    # ===== CODING =====
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

    # ===== LLM CORE =====
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

    # ===== INFERENCE =====
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

    # ===== MULTIMODAL =====
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

    # ===== ROBOTICS =====
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

    # ===== DATA PIPELINE =====
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

    # ===== MLOPS =====
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

    # ===== COST/OPTIMIZATION =====
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

    # ===== COMPLIANCE =====
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

    # ===== OPENSOURCE =====
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

    # ===== PRODUCT =====
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

    # ===== CATCHALL (generic but richer) =====
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

# Map (category, content hints) → best rich diagram
def pick_rich_diagram(content, category):
    """Pick the best rich diagram based on content analysis."""
    lower = content.lower()
    title_match = re.search(r'^#\s+(.+)', content)
    title = title_match.group(1).lower() if title_match else ''
    
    # Agent sub-categories
    if category == 'agent_tool':
        if any(kw in lower for kw in ['react', '推理+行动', '反思循环', 'reflection']):
            return 'agent_react'
        if any(kw in lower for kw in ['规划', 'planner', 'plan-and-execute', '编排']):
            return 'agent_arch'
        if any(kw in lower for kw in ['mcp', 'function call', 'tool bus', '工具调用']):
            return 'agent_tool'
        if any(kw in lower for kw in ['多agent', 'multi-agent', 'swarm', '协作', '团队']):
            return 'multi_agent'
        # Default to agent_arch for agent articles
        return 'agent_arch'
    
    if category == 'harness':
        return 'harness'
    if category == 'infra':
        return 'infra'
    if category == 'security':
        return 'security'
    if category == 'rag':
        return 'rag'
    if category == 'training':
        return 'training'
    if category == 'coding':
        return 'coding'
    if category == 'llm_core':
        return 'llm_core'
    if category == 'inference':
        return 'inference'
    if category == 'multimodal':
        return 'multimodal'
    if category == 'robotics':
        return 'robotics'
    if category == 'data_pipeline':
        return 'data_pipeline'
    if category == 'mlops':
        return 'mlops'
    if category == 'cost':
        return 'cost'
    if category == 'compliance':
        return 'compliance'
    if category == 'opensource':
        return 'opensource'
    if category == 'product':
        return 'product'
    
    # Fallback: try to detect from content
    if any(kw in lower for kw in ['react', 'agent', '智能体', '自主']):
        return 'agent_arch'
    if any(kw in lower for kw in ['安全', '攻击', '漏洞', '防护']):
        return 'security'
    if any(kw in lower for kw in ['rag', '检索', '召回', '向量']):
        return 'rag'
    if any(kw in lower for kw in ['训练', '微调', 'rlhf', 'sft']):
        return 'training'
    if any(kw in lower for kw in ['推理', '量化', 'kv cache', 'vllm']):
        return 'inference'
    if any(kw in lower for kw in ['编码', '代码生成', 'codex', 'claude code']):
        return 'coding'
    
    return 'catchall'


def identify_generic_block(content):
    """Find the first generic template mermaid block and return its category."""
    for m in re.finditer(r'```mermaid\n(.*?)```', content, re.DOTALL):
        code = m.group(1)
        first_line = code.strip().split('\n')[0] if code.strip() else ''
        for sig, category in GENERIC_SIGS.items():
            sig_first = sig.split('\n')[0]
            if first_line.strip() == sig_first.strip():
                # Verify second line too for disambiguation
                sig_lines = sig.split('\n')
                code_lines = code.strip().split('\n')
                if len(sig_lines) > 1 and len(code_lines) > 1:
                    if sig_lines[1].strip() == code_lines[1].strip():
                        return category, m.start(), m.end()
                # Just first line match is enough for most
                return category, m.start(), m.end()
    return None, None, None


def upgrade_article(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    category, start, end = identify_generic_block(content)
    if category is None:
        return False
    
    # Pick rich diagram based on content
    rich_key = pick_rich_diagram(content, category)
    rich_code = RICH_DIAGRAMS.get(rich_key, RICH_DIAGRAMS['catchall'])
    
    # Replace the generic block
    new_block = f'```mermaid\n{rich_code}\n```'
    new_content = content[:start] + new_block + content[end:]
    
    if not DRY_RUN:
        with open(filepath, 'w') as f:
            f.write(new_content)
    return True


# Main
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
        if upgrade_article(fpath):
            count += 1
            ch_count += 1
    by_ch[ch] = ch_count

print(f"\nTotal: {count} articles upgraded")
for ch, c in sorted(by_ch.items(), key=lambda x: -x[1]):
    print(f"  {ch}: {c}")
