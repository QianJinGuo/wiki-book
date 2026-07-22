---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/how-to-leveraging-agentcore-openviking-quick-build-efficient-agent
ingested: 2026-07-06
feed_name: AWS China Blog
source_published: 2026-07-06
sha256: efe09c332107add020411d0ef5798095a51d17b7671155f263743f973cf8f8ee
---

# 如何利用 AgentCore + OpenViking 快速搭建具备高效记忆的 Agent

摘要：本文将利用AWS AgentCore结合开源上下文数据库OpenViking快速搭建具备高效记忆的Agent，并演示两种典型的应用场景  
  
**目录**

01 Agent 为什么需要记忆

02 Agent 记忆系统选型

03 AgentCore 集成 OpenViking 方案

04 总结

* * *

## **1\. Agent为什么需要记忆**

### 1.1 Agent 记忆系统是什么

人类之所以能进行连贯的对话和高效的协作，依赖的是记忆——我们记得对方是谁、之前讨论过什么、达成了哪些共识。AI Agent 同样需要类似的能力。

Agent 记忆系统是指一套机制，使 Agent 能够：

  * 在当前会话中保持对话连贯性（短期记忆）
  * 跨会话记住用户偏好、历史事实和交互经验（长期记忆）
  * 自我进化——从过去的成功与失败中学习，持续提升能力



没有记忆系统的 Agent，每次对话都像”失忆”一样从零开始。用户不得不反复自我介绍、重复需求，Agent 也无法积累经验变得更好。

### 1.2 Agent 记忆系统的价值

LLM 自身有一个”上下文窗口”（如 200K tokens），但这远远不够：

挑战 | 说明  
---|---  
上下文窗口有限 | 200K tokens ≈ 15 万字，超长交互会溢出  
每次调用独立 | LLM 本身无状态，上次对话的信息不会自动带入下次  
Token 成本高 | 把所有历史原文塞入 Context = 巨额 Token 费用  
注意力衰减 | 即使窗口够大，过长的 Context 会导致 LLM “注意力分散”  
信息信噪比低 | 100 轮对话中可能只有 5 条信息与当前问题相关  
  
记忆系统的价值就在于：在有限的 Context 窗口中，注入最相关的历史信息，以最小的 Token 成本获得最高的任务执行成功率。

### 1.3 行业 Agent 记忆方案概览

目前业界有全托管服务和开源方案两类：

方案 | 类型 | 定位  
---|---|---  
AWS AgentCore Memory | 全托管服务 | 生产级记忆基础设施，开箱即用  
OpenViking | 开源 | 自包含上下文数据库，Token 高效 + Agent 自进化  
Mem0 | 开源 | 记忆编排层，多向量 DB 后端 + Graph Memory  
MemGPT/Letta | 开源 | 虚拟上下文管理，OS 式分页内存  
  
本文将重点介绍 AgentCore Memory 和 OpenViking，分析它们的设计差异，并给出两种结合方案。

## **2\. Agent记忆系统选型**

### 2.1 AgentCore Memory

AgentCore Memory 是 [AWS Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/>) 推出的全托管记忆服务，为开发者提供开箱即用的完整记忆解决方案。

**双层架构**

**短期记忆（Events）——对话的即时备份**

  * 原文实时持久化，信息零丢失
  * 零 LLM 开销，毫秒级响应
  * 按 Session 组织，时间序列检索
  * batch_size 灵活控制写入频率



**长期记忆（Memory Records）——知识的持久沉淀**

  * 4 种内置 Strategy 从不同视角自动蒸馏（事实/偏好/摘要/片段）
  * 向量余弦相似度检索，精准召回
  * 自动 Consolidation 去重合并
  * 支持自定义 Strategy（自选模型 + Prompt）



**核心优势**

特性 | 说明  
---|---  
即时可用 | 几行配置即可为 Agent 赋予完整记忆能力  
全托管免运维 | 无需部署数据库、管理向量索引  
生产级可靠 | 实时持久化、自动扩展、高可用  
框架原生集成 | Strands SDK SessionManager 自动处理读写检索  
灵活可控 | 自定义 Strategy、namespace 隔离、按需开关  
成本透明 | 按调用次数 + 存储量计费  
  
### 2.2 OpenViking

OpenViking 是字节跳动（火山引擎）开源的上下文数据库，采用文件系统范式（viking:// URI）统一管理 Agent 的记忆、资源和技能。

**核心能力**

能力 | 说明  
---|---  
自研 C++ 向量引擎 | 嵌入式设计，可以按需外接向量数据库  
8 类结构化记忆 | 4 类用户记忆 + 4 类 Agent 记忆  
渐进加载 | 返回目录摘要,逐级目录读取,减小搜索范围，精确控制 Token 注入量  
Agent 自我进化 | tools/skills/patterns/cases 让 Agent 从使用中学习  
支持本地化 | 搭配 Ollama 可离线运行，数据不出设备  
Plugin 架构 | 通过Rust支持虚拟化文件系统，底层支持S3、EFS等后端  
  
**8 类记忆分类**

用户记忆 | Agent 记忆  
---|---  
profile（身份信息） | cases（问题+解法）  
preferences（主观偏好） | patterns（可复用模式）  
entities（人/项目/组织） | tools（工具使用经验）  
events（决策/里程碑） | skills（工作流策略）  
  
**渐进加载机制**
    
    
    检索 30 条候选记忆 → 按 score 排序
      → 高分记忆：读取全文注入 Context（type="full"，占 max_chars 预算）
      → 超出预算的：只给 URI（type="link"）
      → LLM 需要时：主动调 openviking_multi_read 深读
    Token 注入量精确可控（max_chars），不浪费 Context 窗口
    

### 2.3 核心功能对比

维度 | AgentCore Memory | OpenViking  
---|---|---  
定位 | 全托管记忆服务 | 自包含上下文数据库  
短期记忆 | Events（原文存储，时间序列） | 在 Session/ 目录  
长期分类 | 4 Strategy（面向用户） | 8 类（4 用户 + 4 Agent）  
Agent 自进化 | 通过自定义 Strategy 可实现 | 内置 tools/skills/patterns/cases  
Token 控制 | top_k 按条数 | max_chars 按字符 + 渐进加载  
检索精度 | 向量余弦相似度 | 向量余弦相似度（相同）  
运维 | 零运维 | 需运维 Server + 模型  
部署要求 | 需要 AWS 账号 | 可完全离线/本地  
  
### 2.4 选型建议

场景 | 推荐方案  
---|---  
快速 PoC / 标准 Agent | AgentCore Memory  
生产级多租户 SaaS | AgentCore Memory  
Token 成本敏感 | AgentCore Runtime + OpenViking  
Agent 需要持续进化 | AgentCore 短期 + OpenViking 长期  
  
## **3\. AgentCore 集成 OpenViking 方案**

根据不同需求，我们提供两种集成方案：

### 3.1 方案一：面向 Token 效率—AgentCore Runtime + 纯 OpenViking 记忆

**适用场景**

  * Token 成本敏感，需要极致控制 Context 注入量
  * 对话较长（50+ 轮），传统全量加载历史代价过高
  * 可接受”蒸馏式”记忆（不需要精确回放每句原文）



**方案设计**

AgentCore：仅提供 Agent 运行时基础设施（Runtime），不启用 AgentCore Memory

OpenViking：承担全部记忆职责（短期 + 长期）

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/03/how-to-leveraging-agentcore-openviking-quick-build-efficient-agent-1.png>) [图1 方案一架构图：AgentCore Runtime + 纯 OpenViking 记忆]  
---  
  
**数据流**
    
    
    用户发送消息
        │
        ├─ 1. 短期: 从进程内 buffer 读取最近 N 轮对话
        │
        ├─ 2. 长期: OpenViking search_memory(query=用户输入)
        │     → 渐进加载：高分给全文，超限给 URI
        │     → max_chars 精确控制 Token 总量
        │
        ├─ 3. 组装 Context → 送入 LLM
        │     （Context = 短期 buffer + 长期记忆 + 用户输入）
        │
        ├─ 4. LLM 推理（如需深读，调 openviking_multi_read）
        │
        └─ 5. 写入: 追加到 buffer，定期 commit 到 OpenViking
              → commit 时 LLM 提取 8 类记忆
              → commit 后 buffer 可清空（信息已蒸馏为长期记忆）
    

**核心代码**
    
    
    import os
    import sys
    import openviking as ov
    from bedrock_agentcore.runtime import BedrockAgentCoreApp
    from strands import Agent, tool
    from strands.models import BedrockModel
    # 配置
    REGION = os.environ.get("AWS_REGION", "us-west-2")
    MODEL_ID = os.environ.get("MODEL_ID", "xxxx")
    OV_URL = os.environ.get("OV_SERVER_URL", "https://xxxx.com")
    OV_API_KEY = os.environ["OV_API_KEY"]
    MAX_RECENT_TURNS = int(os.environ.get("OV_MAX_RECENT_TURNS", "5"))
    MAX_CHARS = int(os.environ.get("OV_MAX_CHARS", "4000"))
    COMMIT_EVERY = int(os.environ.get("OV_COMMIT_EVERY", "5"))
    class OVMemory:
        """短期 = 进程内 buffer；长期 = OpenViking（检索/写入/提取）。"""
        def __init__(self, session_id: str):
            self.session_id = session_id
            self.client = ov.SyncHTTPClient(url=OV_URL, api_key=OV_API_KEY, timeout=60.0)
            self.client.initialize()
            self.client.get_session(session_id, auto_create=True)
            self.turn_buffer: list[tuple[str, str]] = []
            self.turns_since_commit = 0
        def retrieve(self, query: str) -> str:
            """语义检索记忆目录，按预算渐进加载。"""
            result = self.client.find(
                query, target_uri="viking://user/memories", limit=30,
            )
            contexts = sorted(result.memories or [], key=lambda c: c.score or 0, reverse=True)
            budget = MAX_CHARS
            full_parts, link_parts = [], []
            for ctx in contexts:
                if budget > 200 and ctx.level == 2:
                    try:
                        content = self.client.read(ctx.uri)
                    except Exception:
                        content = ""
                    if content and len(content) <= budget:
                        full_parts.append(f"### {ctx.uri}\n{content}")
                        budget -= len(content)
                        continue
                if ctx.abstract:
                    link_parts.append(f"- {ctx.uri} — {ctx.abstract[:200]}")
            # ... 组装返回文本 ...
        def record_turn(self, user_msg: str, assistant_msg: str) -> str | None:
            """记录一轮对话。每轮即落盘，每 COMMIT_EVERY 轮触发提取。"""
            self.turn_buffer += [("user", user_msg), ("assistant", assistant_msg)]
            self.client.batch_add_messages(self.session_id, [
                {"role": "user", "content": user_msg},
                {"role": "assistant", "content": assistant_msg},
            ])
            self.turns_since_commit += 1
            if self.turns_since_commit >= COMMIT_EVERY:
                return self.commit()
            return None
        def commit(self) -> str | None:
            result = self.client.commit_session(self.session_id)
            self.turns_since_commit = 0
            self.turn_buffer = self.turn_buffer[-(MAX_RECENT_TURNS * 2):]
            return result.get("task_id")
    app = BedrockAgentCoreApp()
    model = BedrockModel(model_id=MODEL_ID, region_name=REGION)
    _memories: dict[str, OVMemory] = {}
    def chat_once(session_id: str, prompt: str, force_commit: bool = False) -> dict:
        mem = _memories.setdefault(session_id, OVMemory(session_id))
        @tool
        def read_memory(uri: str) -> str:
            """读取一条长期记忆的完整内容。"""
            try:
                return mem.client.read(uri)
            except Exception as e:
                return f"读取失败: {e}"
        long_term = mem.retrieve(prompt)
        history = [{"role": r, "content": [{"text": t}]} for r, t in mem.recent_history()]
        agent = Agent(
            model=model,
            system_prompt=f"你是一个有长期记忆的中文助手。\n\n{long_term}",
            messages=history,
            tools=[read_memory],
        )
        answer = str(agent(prompt))
        mem.record_turn(prompt, answer)
        return {"result": answer, "session_id": session_id}
    @app.entrypoint
    def invoke(payload: dict, context) -> dict:
        return chat_once(
            session_id=payload.get("session_id") or "default-session",
            prompt=payload.get("prompt", ""),
        )
    

**Token 效率分析**
    
    
    传统方案（全量加载 50 轮历史）:
      50 轮 × ~200 tokens/轮 = 10,000 tokens 注入 Context
    本方案:
      短期 buffer（最近 5 轮）:  ~1,000 tokens
      长期检索（max_chars=4000）: ~1,300 tokens
      ─────────────────────────────────────────
      总计:                      ~2,300 tokens  （节省 ~77%）
    

**注意事项**

风险 | 缓解措施  
---|---  
commit 前崩溃导致数据丢失 | 在commit 前，通过 add_message 将对话写入 session  
自运维 OpenViking Server | 配置健康检查和自动重启  
  
### 3.2 方案二：面向 Agent 持续进化—AgentCore 短期记忆 + OpenViking 长期记忆

**适用场景**

  * Agent 需要从交互中学习（代码 Agent、技术助手、研究 Agent）
  * 需要可靠的短期对话保持（任务型对话、多步确认）
  * 既要生产级可靠性，又要 Agent”越用越好”



**方案设计**

AgentCore 角色：提供 Runtime + 短期记忆（Events），不启用长期 Strategy

OpenViking 角色：承担全部长期记忆职责（8 类提取 + 渐进加载检索）

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/03/how-to-leveraging-agentcore-openviking-quick-build-efficient-agent-2.png>) [图2 方案二架构图：AgentCore 短期记忆 + OpenViking 长期记忆]  
---  
  
**数据流**
    
    
    用户发送消息
        │
        ├─ 1. 读短期: AgentCore ListEvents(session=当前)
        │     → 本 Session 全部对话历史（确定性，零遗漏）
        │
        ├─ 2. 读长期: OpenViking search_memory(query=用户输入)
        │     → 语义检索用户记忆 + Agent 经验
        │     → 渐进加载（max_chars 控制注入量）
        │
        ├─ 3. 组装 Context → 送入 LLM
        │
        ├─ 4. LLM 推理（如需深读，调 openviking_multi_read）
        │
        ├─ 5. 写短期: AgentCore CreateEvent()
        │     → 原文即时持久化（毫秒级，零 LLM）
        │
        └─ 6. 写长期: OpenViking commit_async()
              → 后台 LLM 提取 8 类记忆（不阻塞对话）
              → Agent 经验持续积累
    

**核心代码**
    
    
    import os
    import sys
    import openviking as ov
    from bedrock_agentcore.memory.client import MemoryClient
    from bedrock_agentcore.runtime import BedrockAgentCoreApp
    from strands import Agent, tool
    from strands.models import BedrockModel
    # 配置
    REGION = os.environ.get("AWS_REGION", "us-west-2")
    MODEL_ID = os.environ.get("MODEL_ID", "xxxxx")
    AC_MEMORY_ID = os.environ.get("AC_MEMORY_ID", "ovHybridShortTermMemory-xxxxx")
    ACTOR_ID = os.environ.get("ACTOR_ID", "default-user")
    SHORT_TERM_TURNS = int(os.environ.get("SHORT_TERM_TURNS", "20"))
    OV_URL = os.environ.get("OV_SERVER_URL", "https://xxxx.com")
    OV_API_KEY = os.environ["OV_API_KEY"]
    MAX_CHARS = int(os.environ.get("OV_MAX_CHARS", "4000"))
    COMMIT_EVERY = int(os.environ.get("OV_COMMIT_EVERY", "5"))
    class HybridMemory:
        """短期 = AgentCore Events；长期 = OpenViking。"""
        def __init__(self, session_id: str):
            self.session_id = session_id
            self.ac = MemoryClient(region_name=REGION)
            self.ov = ov.SyncHTTPClient(url=OV_URL, api_key=OV_API_KEY, timeout=60.0)
            self.ov.initialize()
            self.ov.get_session(session_id, auto_create=True)
            self.turns_since_commit = 0
        def read_history(self) -> list[dict]:
            """取本 session 最近 N 轮原文（跨进程/跨重启仍在）。"""
            turns = self.ac.get_last_k_turns(
                memory_id=AC_MEMORY_ID, actor_id=ACTOR_ID,
                session_id=self.session_id, k=SHORT_TERM_TURNS,
            )
            messages = []
            for turn in reversed(turns):
                for msg in turn:
                    role = (msg.get("role") or "user").lower()
                    content = msg.get("content")
                    text = content.get("text") if isinstance(content, dict) else str(content)
                    if text:
                        messages.append({"role": role, "content": [{"text": text}]})
            return messages
        def retrieve(self, query: str) -> str:
            """OpenViking 语义检索 + 渐进加载（与方案一相同）。"""
            result = self.ov.find(query, target_uri="viking://user/memories", limit=30)
            # ... 与方案一相同的渐进加载逻辑 ...
        def write_turn(self, user_msg: str, assistant_msg: str) -> str | None:
            # 写短期：AgentCore 即时持久化原文
            self.ac.create_event(
                memory_id=AC_MEMORY_ID, actor_id=ACTOR_ID,
                session_id=self.session_id,
                messages=[(user_msg, "USER"), (assistant_msg, "ASSISTANT")],
            )
            # 写长期：同一段对话落盘 OpenViking，定期 commit 提取
            self.ov.batch_add_messages(self.session_id, [
                {"role": "user", "content": user_msg},
                {"role": "assistant", "content": assistant_msg},
            ])
            self.turns_since_commit += 1
            if self.turns_since_commit >= COMMIT_EVERY:
                return self.commit()
            return None
        def commit(self) -> str | None:
            result = self.ov.commit_session(self.session_id)
            self.turns_since_commit = 0
            return result.get("task_id")
    app = BedrockAgentCoreApp()
    model = BedrockModel(model_id=MODEL_ID, region_name=REGION)
    _memories: dict[str, HybridMemory] = {}
    def chat_once(session_id: str, prompt: str, force_commit: bool = False) -> dict:
        """①读短期 → ②读长期 → ③推理 → ④写短期 → ⑤写长期。"""
        mem = _memories.setdefault(session_id, HybridMemory(session_id))
        @tool
        def read_memory(uri: str) -> str:
            try:
                return mem.ov.read(uri)
            except Exception as e:
                return f"读取失败: {e}"
        history = mem.read_history()
        long_term = mem.retrieve(prompt)
        agent = Agent(
            model=model,
            system_prompt=f"你是一个有长期记忆的中文助手。\n\n{long_term}",
            messages=history,
            tools=[read_memory],
        )
        answer = str(agent(prompt))
        mem.write_turn(prompt, answer)
        return {"result": answer, "session_id": session_id}
    @app.entrypoint
    def invoke(payload: dict, context) -> dict:
        return chat_once(
            session_id=payload.get("session_id") or "default-session",
            prompt=payload.get("prompt", ""),
        )
    

**Agent 自进化示例**
    
    
    第 1 周: 用户问 "怎么用 boto3 查 S3 对象"
      → Agent 回答（可能查文档）
      → OpenViking commit → 提取到 tools 类记忆：
        "boto3 S3: client.list_objects_v2(Bucket=..., Prefix=...)"
    第 2 周: 用户问类似问题
      → OpenViking search → 找到之前的 tools 记忆
      → Agent 直接使用，无需重新查文档
    第 1 月: 用户反复使用某种工作模式
      → OpenViking commit → 提取到 patterns 类记忆：
        "该用户习惯先看架构图再看细节，优先用中文回答"
    后续: Agent 的所有回答自动适配这些积累的经验
    

**注意事项**

要点 | 说明  
---|---  
AgentCore 不配 strategies | 创建 Memory 时不传 strategies 参数 → 不触发长期提取 → 避免与 OV 重复  
短期数据有冗余 | AgentCore 存原文（保底） + Openviking 也读到同一段对话做提取 (提升)  
长期只由 OV 提供 | 检索时只调 OpenViking，不调 AgentCore RetrieveMemoryRecords  
  
### 3.3 两种方案对比

维度 | 方案一（Token 效率） | 方案二（Agent 进化）  
---|---|---  
AgentCore Memory | 不使用 | 仅短期（Events）  
OpenViking | 全部记忆（短期+长期） | 仅长期  
Token 消耗 | 最低 | 中等（短期全量加载）  
Agent 自进化 | 支持 | 支持  
运维复杂度 | 中（OpenViking Server） | 中（OpenViking Server + AgentCore 配置）  
适合场景 | 长对话 + 成本敏感 + 离线 | 生产级 + 需要可靠 + 需要进化  
  
## **4\. 总结**

Agent 记忆系统是让 AI Agent 从”工具”变为”伙伴”的关键基础设施。

AgentCore 提供了生产级的 Agent 运行时和全托管记忆服务，是快速搭建 Agent 的坚实基座。OpenViking 作为开源上下文数据库，在 Token 效率和 Agent 自我进化方面提供了差异化能力。

根据不同需求，可以选择：

方案一：追求极致 Token 效率和本地化部署时，AgentCore Runtime + 纯 OpenViking 记忆

方案二：需要生产级可靠性 + Agent 持续进化时，AgentCore 短期记忆 + OpenViking 长期记忆

两种方案的共同原则：用 AgentCore 解决”Agent 怎么跑”的问题，用 OpenViking 解决”Agent 怎么高效地记”的问题。

本文基于 AWS AgentCore Memory 官方文档和 OpenViking 开源仓库（volcengine/OpenViking）源码分析撰写。代码示例为方案示意，实际使用请参考各平台最新 SDK 文档。

**下一步行动：**

**相关产品：**

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=2>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=3>) — 加快代理投入生产的速度
  * [Amazon EFS](<https://aws.amazon.com/cn/efs/?p=bl_pr_efs_l=4>) — 弹性文件存储



**相关文章：**

  * [取之有度，用之有节-从Harness视角破解Agent应用Token爆炸难题](<https://aws.amazon.com/cn/blogs/china/harness-agent-application-token/?p=bl_ar_l=1>)
  * [当 OpenClaw 学会”团队记忆”：一个面向多客户服务的企业级共享记忆系统设计](<https://aws.amazon.com/cn/blogs/china/openclaw-service-enterprise-share-system-design/?p=bl_ar_l=2>)
  * [（下篇）Solutions Memory：让 AI Agent 从成功案例中持续学习 —— 双 Memory 架构实践](<https://aws.amazon.com/cn/blogs/china/solutions-memory-ai-agent-case-study-memory-architecture-practice/?p=bl_ar_l=3>)
  * [当 AI Agent 学会”忘记”：Amazon Bedrock AgentCore Memory 的记忆哲学”](<https://aws.amazon.com/cn/blogs/china/when-ai-agents-learn-to-forget-amazon-bedrock-agentcore-memory-philosophy/?p=bl_ar_l=4>)
  * [OpenClaw 安全和功能增强实践](<https://aws.amazon.com/cn/blogs/china/openclaw-security-and-feature-enhancement-practices/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 刘欣然

亚马逊云科技解决方案架构师, 目前负责互联网媒体行业云端应用的架构设计与技术咨询。在加入AWS之前从事多年互联网开发工作，目前专注于Devops与边缘计算领域。

### 刘智恒

火山引擎 Viking 高级研发工程师，专注于 Agent 上下文管理技术与国际市场拓展，开源项目 OpenViking 主要贡献者。

### 董家

亚马逊云科技客户解决方案经理。她热衷于钻研亚马逊云科技的人工智能与机器学习服务，通过为客户搭建定制化解决方案，助力客户达成业务目标。工作之余，贾冬喜欢旅行、练习瑜伽以及看电影。

### 李响

亚马逊云科技合作伙伴解决方案架构师，目前负责战略合作伙伴和媒体娱乐行业云应用的架构设计和技术咨询，在加入亚马逊云科技之前从事多年互联网产品技术架构和管理工作，专注于 GenAI 领域。

### 唐健

亚马逊云科技解决方案架构师，负责基于云计算方案的架构设计，同时致力于云服务在移动应用与互联网行业的应用和推广。拥有多年移动互联网研发及技术团队管理经验，丰富的互联网应用架构项目经历。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
