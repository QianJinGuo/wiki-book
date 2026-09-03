"""Generate mermaid diagrams for chapter pages and insert them."""
import re, os

DIAGRAMS = {
    'ch04-agent-core.md': '''```mermaid
graph TB
    subgraph "Agent 核心架构演化"
        R[ReAct<br/>推理+行动] --> PE[Plan-and-Execute<br/>规划+执行]
        PE --> RF[Reflection<br/>自省循环]
        RF --> DW[Dynamic Workflows<br/>动态工作流]
        DW --> MA[Multi-Agent<br/>多 Agent 协作]
    end
    subgraph "关键组件"
        H[Harness<br/>编排层] --> M[Memory<br/>记忆层]
        M --> S[Skill<br/>技能层]
        S --> T[Tool/MCP<br/>工具层]
    end
    R & PE & RF --> H
    DW & MA --> H
    H -.->|"Big Harness > Big Model"| PE
    classDef core fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef infra fill:#d1fae5,stroke:#059669,color:#064e3b
    class R,PE,RF,DW,MA core
    class H,M,S,T infra
```''',
    'ch05-harness.md': '''```mermaid
graph LR
    subgraph "Harness 五层架构"
        L1[Observability<br/>可观测性] --> L2[Guardrails<br/>护栏]
        L2 --> L3[Orchestration<br/>编排]
        L3 --> L4[Memory<br/>持久记忆]
        L4 --> L5[Self-Improvement<br/>自优化]
    end
    L5 -.feedback.-> L1
    subgraph "部署形态"
        D1[Docker<br/>本地开发]
        D2[CF Pages<br/>边缘部署]
        D3[GitHub Actions<br/>CI/CD]
    end
    L3 --> D1 & D2 & D3
    classDef layer fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef deploy fill:#fef3c7,stroke:#d97706,color:#78350f
    class L1,L2,L3,L4,L5 layer
    class D1,D2,D3 deploy
```''',
    'ch06-memory.md': '''```mermaid
graph TB
    subgraph "三种记忆范式"
        WM[Working Memory<br/>工作记忆<br/>上下文窗口] --> SM[Short-term Memory<br/>短期记忆<br/>Session 级]
        SM --> PM[Long-term Memory<br/>长期记忆<br/>跨 Session]
    end
    subgraph "实现方案"
        C1[Letta Code<br/>Agent 绑定] 
        C2[Hermes Skill<br/>技能提炼]
        C3[Memory Files<br/>文件持久化]
    end
    PM --> C1 & C2 & C3
    subgraph "核心命题"
        INS[权重冻结下<br/>外部状态层积累能力]
    end
    PM --> INS
    classDef mem fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef impl fill:#d1fae5,stroke:#059669,color:#064e3b
    classDef insight fill:#fef9c3,stroke:#ca8a04,color:#713f12
    class WM,SM,PM mem
    class C1,C2,C3 impl
    class INS insight
```''',
    'ch07-skill-tool.md': '''```mermaid
graph TB
    subgraph "Agent 技能栈"
        SK[Skill<br/>可复用能力] --> TL[Tool<br/>原子操作]
        TL --> MCP[MCP Protocol<br/>工具协议]
    end
    subgraph "技能生命周期"
        D[Discovery<br/>发现] --> A[Acquisition<br/>习得]
        A --> R[Refinement<br/>提炼]
        R --> E[Evolution<br/>进化]
    end
    E -.-> D
    SK --> D
    subgraph "MCP 生态"
        M1[Anthropic 12 模式]
        M2[OpenClaw 工具链]
        M3[社区 MCP Server]
    end
    MCP --> M1 & M2 & M3
    classDef skill fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef lifecycle fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef mcp fill:#d1fae5,stroke:#059669,color:#064e3b
    class SK,TL,MCP skill
    class D,A,R,E lifecycle
    class M1,M2,M3 mcp
```''',
    'ch08-multi-agent.md': '''```mermaid
graph TB
    subgraph "多 Agent 协作模式"
        S[Single Agent<br/>单体] --> O[Orchestrator<br/>编排者]
        O --> T[Team<br/>团队协作]
        T --> SW[Swarm<br/>群体智能]
    end
    subgraph "通信协议"
        A2A[Agent-to-Agent<br/>Google A2A]
        MPC[MCP<br/>工具调用]
        MSG[Message Queue<br/>异步消息]
    end
    O & T --> A2A
    T & SW --> MPC
    SW --> MSG
    subgraph "典型架构"
        Claude[Claude Code<br/>Dynamic Workflows]
        OpenClaw[OpenClaw<br/>多 Agent 团队]
        AgentRun[AgentRun<br/>A2A 协议]
    end
    O --> Claude
    T --> OpenClaw
    SW --> AgentRun
    classDef mode fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef proto fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef arch fill:#d1fae5,stroke:#059669,color:#064e3b
    class S,O,T,SW mode
    class A2A,MPC,MSG proto
    class Claude,OpenClaw,AgentRun arch
```''',
    'ch09-ai-coding.md': '''```mermaid
graph LR
    subgraph "AI 编程演进"
        V1[Vibe Coding<br/>氛围编程] --> V2[Agentic Coding<br/>自主编程]
        V2 --> V3[Autonomous Engineering<br/>自主工程]
    end
    subgraph "工具生态"
        CC[Claude Code]
        CX[Codex CLI]
        CU[Cursor/Windsurf]
        OT[Qoder/Trae]
    end
    V2 --> CC & CX & CU & OT
    subgraph "核心能力"
        ED[代码理解] --> GN[代码生成]
        GN --> DBG[调试修复]
        DBG --> TST[测试验证]
    end
    V2 --> ED
    classDef stage fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef tool fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef cap fill:#d1fae5,stroke:#059669,color:#064e3b
    class V1,V2,V3 stage
    class CC,CX,CU,OT tool
    class ED,GN,DBG,TST cap
```''',
    'ch10-rag.md': '''```mermaid
graph TB
    subgraph "RAG 四层架构"
        L1["Layer 1: 关键词<br/>BM25/FTS"] --> L2["Layer 2: 近邻图<br/>TF-IDF 余弦"]
        L2 --> L3["Layer 3: 语义搜索<br/>Embedding + Vectorize"]
        L3 --> L4["Layer 4: Reranker<br/>重排序"]
    end
    subgraph "索引构建"
        IDX[61K 文档] --> TFIDF[TF-IDF 稀疏矩阵]
        TFIDF --> GRAPH[57K 节点 × 20 近邻]
    end
    IDX --> L1
    GRAPH --> L2
    subgraph "部署"
        BROWSER[浏览器 IndexedDB<br/>0ms]
        SERVER[Pages Function<br/>~50ms]
        CLOUD[讯飞 + Vectorize<br/>~300ms]
    end
    L1 --> BROWSER
    L2 --> BROWSER
    L3 --> CLOUD
    L4 --> SERVER
    classDef layer fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef idx fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef deploy fill:#d1fae5,stroke:#059669,color:#064e3b
    class L1,L2,L3,L4 layer
    class IDX,TFIDF,GRAPH idx
    class BROWSER,SERVER,CLOUD deploy
```'''
}

DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'docs'))

for filename, mermaid_code in DIAGRAMS.items():
    filepath = os.path.join(DOCS_DIR, filename)
    if not os.path.exists(filepath):
        print(f"SKIP: {filename} not found")
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if mermaid already exists
    if '```mermaid' in content:
        print(f"SKIP: {filename} already has mermaid")
        continue
    
    # Find the insertion point: after "## 导读" section, before "## 本章内容"
    # Look for the pattern: end of 导读 section (---) followed by ## 本章内容
    insert_pattern = r'(\n---\s*\n)(## 本章内容)'
    if re.search(insert_pattern, content):
        new_content = re.sub(
            insert_pattern,
            r'\1\n## 架构图\n\n' + mermaid_code + r'\n\n\2',
            content
        )
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"OK: {filename} - mermaid diagram inserted")
    else:
        # Try inserting after the first ## heading
        first_h2 = content.find('\n## ')
        if first_h2 > 0:
            # Find the end of this heading's content
            next_h2 = content.find('\n## ', first_h2 + 4)
            if next_h2 > 0:
                insert_pos = next_h2
                new_content = content[:insert_pos] + '\n## 架构图\n\n' + mermaid_code + '\n\n' + content[insert_pos:]
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"OK: {filename} - mermaid diagram inserted (fallback)")
            else:
                print(f"WARN: {filename} - could not find insertion point")
        else:
            print(f"WARN: {filename} - no headings found")

