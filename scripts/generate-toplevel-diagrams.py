"""Generate mermaid diagrams for top-level chapter pages and special pages."""
import re, os

DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'docs'))

DIAGRAMS = {
    # --- 章节主页 (精心设计) ---
    'ch01-ai-basics.md': 'graph TB\n    subgraph "LLM 基础"\n        TK[Tokenizer<br/>分词] --> EMB[Embedding<br/>嵌入]\n        EMB --> ATT[Attention<br/>注意力]\n        ATT --> FFN[FFN<br/>前馈]\n        FFN --> OUT[输出]\n    end\n    subgraph "关键能力"\n        GEN[生成] \n        REA[推理]\n        COD[代码]\n        MM[多模态]\n    end\n    OUT --> GEN & REA & COD & MM\n    subgraph "演化"\n        GPT2["GPT-2"] --> GPT3["GPT-3"]\n        GPT3 --> GPT4["GPT-4"]\n        GPT4 --> GPT5["GPT-5"]\n    end\n    ATT --> GPT4\n    classDef core fill:#dbeafe,stroke:#2563eb,color:#1e3a8a\n    classDef cap fill:#ede9fe,stroke:#7c3aed,color:#4c1d95\n    classDef evo fill:#d1fae5,stroke:#059669,color:#064e3b\n    class TK,EMB,ATT,FFN,OUT core\n    class GEN,REA,COD,MM cap\n    class GPT2,GPT3,GPT4,GPT5 evo',

    'ch02-prompt.md': 'graph TB\n    subgraph "提示词工程层次"\n        P1["L1 指令设计<br/>Zero/Few-shot"] --> P2["L2 上下文工程<br/>RAG + 长上下文"]\n        P2 --> P3["L3 Agent Loop<br/>自主循环"]\n    end\n    subgraph "技术"\n        COC["Chain-of-Thought"]\n        TOT["Tree-of-Thought"]\n        RAG["RAG 检索增强"]\n    end\n    P1 --> COC & TOT\n    P2 --> RAG\n    subgraph "趋势"\n        INS["从 Prompt → Agent"]\n    end\n    P3 --> INS\n    classDef level fill:#dbeafe,stroke:#2563eb,color:#1e3a8a\n    classDef tech fill:#ede9fe,stroke:#7c3aed,color:#4c1d95\n    classDef trend fill:#d1fae5,stroke:#059669,color:#064e3b\n    class P1,P2,P3 level\n    class COC,TOT,RAG tech\n    class INS trend',

    'ch03-ai-tools.md': 'graph LR\n    subgraph "AI 工具生态"\n        CLI["CLI Agent<br/>Codex/Claude Code"]\n        IDE["IDE 插件<br/>Cursor/Windsurf"]\n        PLT["平台<br/>OpenClaw/Hermes"]\n        MCP["MCP<br/>工具协议"]\n    end\n    CLI & IDE & PLT --> MCP\n    subgraph "能力"\n        CODE["代码"] \n        BROWSER["浏览器"]\n        DATA["数据"]\n    end\n    CLI --> CODE\n    IDE --> CODE\n    PLT --> BROWSER & DATA\n    classDef tool fill:#ede9fe,stroke:#7c3aed,color:#4c1d95\n    classDef cap fill:#dbeafe,stroke:#2563eb,color:#1e3a8a\n    class CLI,IDE,PLT,MCP tool\n    class CODE,BROWSER,DATA cap',

    'ch11-infra.md': 'graph TB\n    subgraph "云基础设施"\n        LB[负载均衡/CDN] --> GW[API Gateway]\n        GW --> SVC[Serverless/Container]\n        SVC --> DB[RDS/KV/OSS]\n    end\n    subgraph "Agent 运行时"\n        AGT[Agent] --> SB[沙箱/VM]\n        SB --> FS[隔离文件系统]\n    end\n    SVC --> AGT\n    subgraph "提供商"\n        AWS["AWS"]\n        CF["Cloudflare"]\n        GCP["GCP"]\n    end\n    LB --> AWS & CF & GCP\n    classDef infra fill:#dbeafe,stroke:#2563eb,color:#1e3a8a\n    classDef runtime fill:#ede9fe,stroke:#7c3aed,color:#4c1d95\n    classDef prov fill:#d1fae5,stroke:#059669,color:#064e3b\n    class LB,GW,SVC,DB infra\n    class AGT,SB,FS runtime\n    class AWS,CF,GCP prov',

    'ch12-security.md': 'graph TB\n    subgraph "AI 安全防线"\n        ATK[威胁建模] --> DEF[防御层]\n        DEF --> DET[检测]\n        DET --> RSP[响应]\n    end\n    subgraph "威胁类型"\n        INJ[Prompt注入]\n        POI[工具投毒]\n        DAT[数据泄露]\n        ADV[对抗攻击]\n    end\n    ATK --> INJ & POI & DAT & ADV\n    subgraph "治理"\n        RBAC[权限控制]\n        AUD[审计日志]\n        CMP[合规]\n    end\n    RSP --> RBAC & AUD & CMP\n    classDef threat fill:#fee2e2,stroke:#dc2626,color:#7f1d1d\n    classDef defense fill:#d1fae5,stroke:#059669,color:#064e3b\n    classDef gov fill:#ede9fe,stroke:#7c3aed,color:#4c1d95\n    class ATK,INJ,POI,DAT,ADV threat\n    class DEF,DET,RSP defense\n    class RBAC,AUD,CMP gov',

    'ch13-mlops.md': 'graph LR\n    TRAIN[训练] --> EVAL[评估]\n    EVAL --> DEPLOY[部署]\n    DEPLOY --> MON[监控]\n    MON -->|"反馈"| EVAL\n    subgraph "工具链"\n        EXP[实验追踪<br/>MLflow/W&B]\n        CI[CI/CD]\n        OBS[可观测性]\n    end\n    EVAL --> EXP\n    DEPLOY --> CI\n    MON --> OBS\n    classDef flow fill:#dbeafe,stroke:#2563eb,color:#1e3a8a\n    classDef tool fill:#ede9fe,stroke:#7c3aed,color:#4c1d95\n    class TRAIN,EVAL,DEPLOY,MON flow\n    class EXP,CI,OBS tool',

    'ch14-data.md': 'graph LR\n    SRC[数据源] --> ING[采集/ETL]\n    ING --> PROC[处理/计算]\n    PROC --> STO[存储<br/>湖/仓/库]\n    STO --> SERV[服务/API]\n    subgraph "质量"\n        VAL[验证] \n        GOV[治理]\n    end\n    ING --> VAL\n    STO --> GOV\n    classDef flow fill:#dbeafe,stroke:#2563eb,color:#1e3a8a\n    classDef qual fill:#fef3c7,stroke:#d97706,color:#78350f\n    class SRC,ING,PROC,STO,SERV flow\n    class VAL,GOV qual',

    'ch15-training.md': 'graph LR\n    DATA[数据准备] --> SFT[SFT 监督微调]\n    SFT --> RL[RLHF/DPO 对齐]\n    RL --> EVAL[评估]\n    subgraph "高效训练"\n        LORA[LoRA/QLoRA]\n        DS[知识蒸馏]\n        DIST[分布式训练]\n    end\n    SFT --> LORA\n    EVAL --> DS\n    SFT --> DIST\n    classDef pipeline fill:#dbeafe,stroke:#2563eb,color:#1e3a8a\n    classDef efficient fill:#d1fae5,stroke:#059669,color:#064e3b\n    class DATA,SFT,RL,EVAL pipeline\n    class LORA,DS,DIST efficient',

    'ch16-inference.md': 'graph LR\n    Q[量化 INT4/8] --> KV[KV Cache优化]\n    KV --> PD[Prefill/Decode分离]\n    PD --> SP[投机采样]\n    subgraph "部署"\n        LOC[本地GPU]\n        CLD[云端API]\n        EDG[边缘设备]\n    end\n    Q --> LOC & CLD\n    SP --> EDG\n    classDef opt fill:#dbeafe,stroke:#2563eb,color:#1e3a8a\n    classDef deploy fill:#d1fae5,stroke:#059669,color:#064e3b\n    class Q,KV,PD,SP opt\n    class LOC,CLD,EDG deploy',

    'ch17-multimodal.md': 'graph LR\n    T[文本] --> ENC[多模态编码器]\n    I[图像] --> ENC\n    A[音频] --> ENC\n    V[视频] --> ENC\n    ENC --> FUS[融合层]\n    FUS --> DEC[解码器]\n    DEC --> OUT[输出]\n    classDef in fill:#dbeafe,stroke:#2563eb,color:#1e3a8a\n    classDef core fill:#ede9fe,stroke:#7c3aed,color:#4c1d95\n    class T,I,A,V in\n    class ENC,FUS,DEC,OUT core',

    'ch18-robotics.md': 'graph TB\n    PER[感知] --> DEC[决策规划]\n    DEC --> ACT[动作执行]\n    ACT --> ENV[环境反馈]\n    ENV --> PER\n    subgraph "学习"\n        RL[强化学习]\n        SIM[仿真训练]\n        IMI[模仿学习]\n    end\n    DEC --> RL & SIM & IMI\n    classDef core fill:#dbeafe,stroke:#2563eb,color:#1e3a8a\n    classDef learn fill:#d1fae5,stroke:#059669,color:#064e3b\n    class PER,DEC,ACT,ENV core\n    class RL,SIM,IMI learn',

    'ch19-research-frontier.md': 'graph TB\n    subgraph "前沿方向"\n        AGI[AGI 路径] --> EMB[具身智能]\n        AGI --> NEU[神经符号]\n        AGI --> SELF[自我改进]\n    end\n    subgraph "理论"\n        SCAL[Scaling Laws]\n        EME[涌现能力]\n        COMP[复杂性理论]\n    end\n    SELF --> SCAL & EME\n    subgraph "挑战"\n        ALIGN[对齐]\n        INT[可解释性]\n        SAF[安全]\n    end\n    AGI --> ALIGN & INT & SAF\n    classDef dir fill:#dbeafe,stroke:#2563eb,color:#1e3a8a\n    classDef theory fill:#ede9fe,stroke:#7c3aed,color:#4c1d95\n    classDef challenge fill:#fef3c7,stroke:#d97706,color:#78350f\n    class AGI,EMB,NEU,SELF dir\n    class SCAL,EME,COMP theory\n    class ALIGN,INT,SAF challenge',

    'ch20-ai-philosophy.md': 'graph TB\n    subgraph "核心问题"\n        WHAT["AI是什么?"] --> CON["意识问题"]\n        CON --> VAL["价值对齐"]\n        VAL --> FUT["未来图景"]\n    end\n    subgraph "伦理框架"\n        UTI[功利主义] \n        DEO[义务论]\n        VIR[美德伦理]\n    end\n    VAL --> UTI & DEO & VIR\n    subgraph "治理"\n        REG[监管]\n        OPEN[开源]\n        GLO[全球协作]\n    end\n    FUT --> REG & OPEN & GLO\n    classDef question fill:#dbeafe,stroke:#2563eb,color:#1e3a8a\n    classDef ethic fill:#ede9fe,stroke:#7c3aed,color:#4c1d95\n    classDef gov fill:#d1fae5,stroke:#059669,color:#064e3b\n    class WHAT,CON,VAL,FUT question\n    class UTI,DEO,VIR ethic\n    class REG,OPEN,GLO gov',

    # --- 特殊页面 ---
    'PATH.md': 'graph LR\n    BEGIN["开始"] --> FUND["基础<br/>LLM+编程"]\n    FUND --> ENG["工程<br/>Agent+Harness"]\n    ENG --> SPEC["专精<br/>训练/安全/infra"]\n    SPEC --> MAST["大师<br/>前沿+哲学"]\n    classDef stage fill:#dbeafe,stroke:#2563eb,color:#1e3a8a\n    class BEGIN,FUND,ENG,SPEC,MAST stage',

    'index.md': 'graph LR\n    subgraph "五篇二十章"\n        P1["入门篇<br/>Ch01-03"] --> P2["工程师篇<br/>Ch04-10"]\n        P2 --> P3["专家篇<br/>Ch11-14"]\n        P3 --> P4["科学家篇<br/>Ch15-18"]\n        P4 --> P5["大师篇<br/>Ch19-20"]\n    end\n    classDef part fill:#ede9fe,stroke:#7c3aed,color:#4c1d95\n    class P1,P2,P3,P4,P5 part',
}

for filename, diagram_code in DIAGRAMS.items():
    filepath = os.path.join(DOCS_DIR, filename)
    if not os.path.exists(filepath):
        print(f"SKIP: {filename} not found")
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    if '```mermaid' in content:
        print(f"SKIP: {filename} already has mermaid")
        continue
    # Insert after the second ## heading
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
        lines.append('\n## 架构图\n')
        lines.append('```mermaid')
        lines.append(diagram_code)
        lines.append('```')
    else:
        lines.insert(insert_idx + 1, '')
        lines.insert(insert_idx + 2, '```mermaid')
        lines.insert(insert_idx + 3, diagram_code)
        lines.insert(insert_idx + 4, '```')
        lines.insert(insert_idx + 5, '')
    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))
    print(f"OK: {filename}")

