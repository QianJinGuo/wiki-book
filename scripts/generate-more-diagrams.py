"""Generate mermaid diagrams for high-value articles without them."""
import re, os

DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'docs'))

# Diagrams keyed by filename
DIAGRAMS = {
    # ch09 - AI编程 (0 mermaid currently)
    'ch09/008-anthropic-95-agent-skill-21-95.md': '''```mermaid
graph TB
    subgraph "Skill Stack 分层架构"
        L1["基础层<br/>数据读取/清洗<br/>自动化: 95%"] --> L2["分析层<br/>统计/可视化<br/>自动化: 80%"]
        L2 --> L3["推理层<br/>因果/预测<br/>自动化: 40%"]
        L3 --> L4["判断层<br/>业务决策<br/>自动化: 5%"]
    end
    subgraph "覆盖率曲线"
        C1["描述统计 95%"] --> C2["趋势分析 90%"]
        C2 --> C3["异常检测 85%"]
        C3 --> C4["因果推断 20%"]
        C4 --> C5["业务判断 5%"]
    end
    L1 -.-> C1
    L2 -.-> C2 & C3
    L3 -.-> C4
    L4 -.-> C5
    classDef layer fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef curve fill:#d1fae5,stroke:#059669,color:#064e3b
    class L1,L2,L3,L4 layer
    class C1,C2,C3,C4,C5 curve
```''',

    'ch09/011-claude-code.md': '''```mermaid
graph TB
    subgraph "五扩展点 Harness"
        CM["CLAUDE.md<br/>上下文文件"] --> HK["Hooks<br/>生命周期钩子"]
        HK --> SK["Skills<br/>可复用能力"]
        SK --> PL["Plugins<br/>第三方扩展"]
        PL --> MC["MCP<br/>工具协议"]
    end
    subgraph "导航方式"
        AG["Agent式搜索<br/>实时遍历文件系统"] 
        RG["RAG 检索<br/>嵌入索引(可能过时)"]
    end
    CM --> AG
    subgraph "辅助能力"
        LSP["LSP 集成<br/>类型检查/跳转"]
        SA["子 Agent<br/>并行委派"]
    end
    SK --> LSP
    PL --> SA
    classDef ext fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef nav fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef aux fill:#d1fae5,stroke:#059669,color:#064e3b
    class CM,HK,SK,PL,MC ext
    class AG,RG nav
    class LSP,SA aux
```''',

    'ch09/013-agent-agent.md': '''```mermaid
graph TB
    subgraph "通用 Agent 基座"
        BASE["Codex / Claude Code<br/>任务理解/代码/工具/协作"]
    end
    subgraph "业务增强层"
        BK["业务知识<br/>术语/模板/验收标准"]
        BT["内部工具<br/>API/CLI/MCP"]
        BR["流程规则<br/>约束/确认/回滚"]
        BP["权限边界<br/>可见范围/操作授权"]
        BE["评测集<br/>回归/指标/归因"]
        BO["线上观测<br/>日志/trace/告警"]
    end
    BASE --> BK & BT & BR & BP & BE & BO
    subgraph "三步落地"
        S1["1. 跑裸基座 baseline"] --> S2["2. 补短板增强"]
        S2 --> S3["3. MVP 闭环 + 增量评测"]
    end
    BK & BT & BR --> S2
    BE & BO --> S3
    classDef base fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef aug fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef step fill:#d1fae5,stroke:#059669,color:#064e3b
    class BASE base
    class BK,BT,BR,BP,BE,BO aug
    class S1,S2,S3 step
```''',

    'ch09/009-ai-coding-ai.md': '''```mermaid
graph LR
    subgraph "AI 编程工具矩阵"
        CC["Claude Code<br/>自主编程"]
        CX["Codex CLI<br/>任务委派"]
        CU["Cursor/Windsurf<br/>辅助编程"]
        OT["Qoder/Trae<br/>桌面 Agent"]
    end
    subgraph "编程范式"
        V1["Vibe Coding<br/>氛围驱动"] --> V2["Agentic Coding<br/>自主循环"]
        V2 --> V3["Loop Engineering<br/>设计循环"]
    end
    CC & CX --> V2
    CU --> V1
    OT --> V2
    V3 --> CC & CX
    classDef tool fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef paradigm fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    class CC,CX,CU,OT tool
    class V1,V2,V3 paradigm
```''',

    'ch09/010-coding-agent-agent-loongsuite-pilot-3-agent.md': '''```mermaid
graph TB
    subgraph "Coding Agent 架构"
        PM["Prompt Manager<br/>意图解析"] --> PL["Planner<br/>任务拆解"]
        PL --> EX["Executor<br/>代码生成/修改"]
        EX --> VL["Validator<br/>测试/检查"]
        VL -->|"不通过"| PL
    end
    subgraph "安全机制"
        SB["沙箱执行<br/>隔离环境"]
        RL["回滚机制<br/>Git worktree"]
        HR["人工确认<br/>高风险操作"]
    end
    EX --> SB
    VL --> RL
    EX -.->|"高风险"| HR
    classDef core fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef safe fill:#fef3c7,stroke:#d97706,color:#78350f
    class PM,PL,EX,VL core
    class SB,RL,HR safe
```''',

    'ch09/012-mimo-code-agent-claude-code.md': '''```mermaid
graph LR
    subgraph "MiMo Code Agent"
        M["MiMo<br/>代码理解+生成"] --> R["RAG 增强上下文"]
        R --> D["Diff 验证"]
        D --> T["测试执行"]
    end
    subgraph "vs Claude Code"
        C["Claude Code<br/>Agent式搜索"] --> S["Skills 扩展"]
        S --> H["Hooks 生命周期"]
    end
    M -.->|"互补"| C
    classDef mimo fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef claude fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    class M,R,D,T mimo
    class C,S,H claude
```''',

    # ch07 - 技能/MCP (1 mermaid currently)
    'ch07/090-microsoft-agent-framework-tools-4-provider-tool-ap.md': '''```mermaid
graph TB
    subgraph "4 类工具"
        FT["Function Tools<br/>应用代码 @tool<br/>可移植性最好"]
        HT["Hosted Tools<br/>Provider 托管<br/>Code Interpreter/File Search"]
        MT["MCP Tools<br/>标准协议接入<br/>Hosted/Local"]
        FX["Foundry 扩展<br/>项目级连接<br/>Toolboxes/A2A"]
    end
    subgraph "Tool Approval"
        AU["auto_approve<br/>只读/低风险"]
        MA["manual_approve<br/>写操作/高风险"]
    end
    FT --> AU
    HT --> AU
    MT --> MA
    FX --> MA
    classDef tool fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef approve fill:#fef3c7,stroke:#d97706,color:#78350f
    class FT,HT,MT,FX tool
    class AU,MA approve
```''',

    # ch03 - AI工具
    'ch03/053-agentscope-java-harness-framework-2-0-agent-harness.md': '''```mermaid
graph TB
    subgraph "AgentScope Java 2.0 架构"
        WA["工作区驱动<br/>人格+知识+技能+记忆"] --> FS["可插拔文件系统<br/>本地/OSS/Redis"]
        FS --> CM["上下文管理<br/>压缩+双层记忆+检索"]
        CM --> ORC["子Agent编排<br/>同步/异步委派"]
    end
    subgraph "企业级五障碍"
        O1["多用户多副本"]
        O2["隔离执行"]
        O3["分布式文件系统"]
        O4["Multi-Agent编排"]
        O5["上下文管理"]
    end
    WA --> O1
    FS --> O2 & O3
    ORC --> O4
    CM --> O5
    classDef arch fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef obs fill:#fef3c7,stroke:#d97706,color:#78350f
    class WA,FS,CM,ORC arch
    class O1,O2,O3,O4,O5 obs
```''',

    'ch03/054-harness-engineering-ai-coding-90.md': '''```mermaid
graph LR
    subgraph "Harness Engineering 价值链"
        M["模型能力"] --> H["Harness 质量"]
        H --> R["实际产出"]
    end
    subgraph "关键发现"
        D1["给完整信息: 50%"]
        D2["给摘要: 34%"]
        D3["差距 > 换模型"]
    end
    H --> D1 & D2
    D1 & D2 --> D3
    classDef chain fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef finding fill:#d1fae5,stroke:#059669,color:#064e3b
    class M,H,R chain
    class D1,D2,D3 finding
```''',

    # ch05 - Harness (already has 24, add a few more for big articles)
    'ch05/115-harness-engineering-ai.md': '''```mermaid
graph TB
    subgraph "Harness 工程成熟度"
        L1["L1 脚手架<br/>CLAUDE.md + 基础提示"] --> L2["L2 护栏<br/>Hooks + 审批"]
        L2 --> L3["L3 技能<br/>Skills + MCP"]
        L3 --> L4["L4 自优化<br/>评测 + 回归"]
    end
    L4 -.feedback.-> L1
    subgraph "投入回报"
        ROI["Harness ROI > 模型切换<br/>7.7pp 提升 vs 1-2pp"]
    end
    L3 --> ROI
    classDef level fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    classDef val fill:#d1fae5,stroke:#059669,color:#064e3b
    class L1,L2,L3,L4 level
    class ROI val
```''',

    'ch05/003-harness-engineering-ai.md': '''```mermaid
graph TB
    subgraph "Harness 三层结构"
        O["Observability<br/>日志/trace/指标"] --> G["Guardrails<br/>审批/限制/回滚"]
        G --> E["Orchestration<br/>任务编排/委派"]
    end
    subgraph "吴恩达三层 Loop"
        A1["Layer 1: 单步反思"] --> A2["Layer 2: 工具调用循环"]
        A2 --> A3["Layer 3: 自主 Agent Loop"]
    end
    E --> A3
    G --> A1 & A2
    classDef harness fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef loop fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class O,G,E harness
    class A1,A2,A3 loop
```''',

    # ch01 - LLM基础 (4 currently, add more for key articles)
    'ch01/1220-ai-agent-5-l1-l2-l3-6-benchmark-llm-as-jud.md': '''```mermaid
graph TB
    subgraph "Agent 自我改进六层"
        L1["L1 Reflection<br/>输出自审"] --> L2["L2 Memory<br/>持久记忆"]
        L2 --> L3["L3 Evolutionary Search<br/>进化搜索"]
        L3 --> L4["L4 Adversarial Training<br/>对抗训练"]
        L4 --> L5["L5 Self-Modification<br/>自我修改"]
        L5 --> L6["L6 Meta-Harness<br/>编排自优化"]
    end
    L6 -.feedback.-> L1
    L2 -.feedback.-> L1
    L5 -.feedback.-> L2
    subgraph "评估"
        B["LLM-as-Judge<br/>6维 Benchmark"]
    end
    L6 --> B
    classDef layer fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef eval fill:#fef3c7,stroke:#d97706,color:#78350f
    class L1,L2,L3,L4,L5,L6 layer
    class B eval
```''',

    'ch01/1226-claude-code-agent-agent.md': '''```mermaid
graph LR
    subgraph "Claude Code Agent 模式"
        U["用户意图"] --> P["CLAUDE.md<br/>上下文加载"]
        P --> S["Skills<br/>能力匹配"]
        S --> E["执行循环<br/>搜索→修改→验证"]
        E -->|"不通过"| E
        E -->|"通过"| D["交付结果"]
    end
    subgraph "扩展"
        MCP["MCP Server"] 
        HK["Hooks"]
        SK["Skills"]
    end
    S --> MCP & HK & SK
    classDef core fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef ext fill:#ede9fe,stroke:#7c3aed,color:#4c1d95
    class U,P,S,E,D core
    class MCP,HK,SK ext
```''',
}

count = 0
for filename, mermaid_code in DIAGRAMS.items():
    filepath = os.path.join(DOCS_DIR, filename)
    if not os.path.exists(filepath):
        print(f"SKIP: {filename} not found")
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    if '```mermaid' in content:
        print(f"SKIP: {filename} already has mermaid")
        continue
    
    # Insert after the first ## heading
    # Find the first ## heading that's NOT the title
    lines = content.split('\n')
    insert_idx = None
    h2_count = 0
    for i, line in enumerate(lines):
        if line.startswith('## ') and not line.startswith('## Ch0'):
            h2_count += 1
            if h2_count == 2:  # Insert after second ## heading
                insert_idx = i
                break
    
    if insert_idx is None:
        # Fallback: insert after first ## heading
        for i, line in enumerate(lines):
            if line.startswith('## ') and not line.startswith('## Ch0'):
                insert_idx = i
                break
    
    if insert_idx is None:
        print(f"WARN: {filename} - no suitable insertion point")
        continue
    
    # Insert the diagram after the heading
    lines.insert(insert_idx + 1, '')
    lines.insert(insert_idx + 2, mermaid_code)
    lines.insert(insert_idx + 3, '')
    
    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))
    
    count += 1
    print(f"OK: {filename}")

print(f"\nTotal: {count} articles updated")
