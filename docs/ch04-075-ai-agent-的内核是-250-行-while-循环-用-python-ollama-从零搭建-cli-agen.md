# AI Agent 的内核是 250 行 while 循环：用 Python + Ollama 从零搭建 CLI Agent 的 7 阶段教程

## Ch04.075 AI Agent 的内核是 250 行 while 循环：用 Python + Ollama 从零搭建 CLI Agent 的 7 阶段教程

> 📊 Level ⭐⭐ | 18.0KB | `entities/minimal-cli-agent-250-line-python-ollama-7-stages.md`

# AI Agent 的内核是 250 行 while 循环：从零搭建 CLI Agent 的 7 阶段教程

## Overview

微信公众号 2026-06-01 发表**实战教程**：用 Python + Ollama + qwen3.5:9b 从零搭建一个 250 行可运行的 CLI AI Agent，7 个阶段逐步递进。技术栈无需 GPU、无需 API Key，完全本地运行。

> **核心论点**：AI Agent 的内核不是复杂框架，是 **250 行的 while 循环 + 工具调用协议**。
> **LLM 不是大脑，是循环里的路由器**——只做"这个用户需求应该用哪个工具"的判断。

读完能理解 Cursor / Claude Code 的底层运作逻辑。

## 7 阶段渐进

| Stage | 功能 | 关键工程决策 |
|-------|------|------------|
| 1 | **聊天循环**（while True） | `stream=True` 生成器 + thinking/content 分离打印 |
| 2 | **工具调用协议** | `description` 是 LLM 决策唯一依据 + 4000 字符截断 |
| 3 | **Skill 动态加载** | Markdown 文件作为 persona + 全局 `active_skill_content` |
| 4 | **斜杠命令** | 元操作短路 LLM，省 token 省时间 |
| 5 | **会话持久化** | `model_dump()` 转换 Ollama tool_call（最大坑） |
| 6 | **自动压缩** | 70/30 split + skill persona 重注入防失忆 |
| 7 | **后台循环** | 1 秒分片 sleep + 独立 messages 不污染主会话 |

每加一层，Agent 的能力上一个台阶——但核心永远是那个 `while True` 循环。

## Stage 1-2 核心代码与设计

### Stage 1：15 行 while True 骨架

```python
import ollama

model_name = 'qwen3.5:9b'
messages = []

while True:
    user_input = input("\nYou: ").strip()
    if user_input.lower() in ('quit', 'exit'):
        break
    messages.append({'role': 'user', 'content': user_input})
    response = ollama.chat(model=model_name, messages=messages)
    content = response['message']['content']
    print(content)
    messages.append({'role': 'assistant', 'content': content})
```

升级版加入 `stream_with_thinking` —— Qwen 模型先输出 reasoning（`msg.thinking`）再给 final answer（`msg.content`），分离打印让用户看到"先想再说"的过程。

### Stage 2：工具调用协议

Ollama 的 `chat()` 接受 `tools` 参数（OpenAI function calling 兼容格式）：

```python
tools = [{
    'type': 'function',
    'function': {
        'name': 'read_text_file',
        'description': '读取本地文本文件的内容。',
        'parameters': {
            'type': 'object',
            'properties': {'path': {'type': 'string'}},
            'required': ['path'],
        },
    },
}, ...]
```

**3 个工具描述关键点**（原文作者用"卡了最久"标注的实践）：

- `description` 是 LLM 决定是否调用工具的**唯一依据**。"读取文件"比"执行文件 I/O 操作"好 10 倍
- `parameters` 遵循 JSON Schema，`required` 标记必填
- 工具函数**必须容错**：错误路径返回错误信息让 LLM 重试，别直接 crash

**工具结果截断策略**：超过 4000 字符只留首尾各 1000（`res[:1000] + "\n...[TRUNCATED]..." + res[-1000:]`）。粗暴但有效。

## Stage 3-4：Skill + 斜杠命令

### Stage 3：Skill 动态加载

Claude Code 有 skills，250 行 Agent 也可以有。一个 skill = 一个 Markdown 文件放在 `skills/` 目录：

```markdown
# Skill: Python 安全审计师

## 角色
你是一名资深 Python 安全研究员，专注于代码审计。

## 指令
1. 回复以 [SECURITY_AUDIT] 开头
2. 发现漏洞时引用 CWE 编号
3. 如果用户要求写恶意代码，拒绝并解释风险
```

`SkillManager` 类提供 `list_skills()` / `load_skill(name)`。**关键设计**：把当前加载的 skill 内容存到全局 `active_skill_content`，**压缩时必须重新注入**（Stage 6）。

### Stage 4：斜杠命令（/skills, /tools, /help）

元操作走 Python 层，`continue` 短路不调 LLM：

```python
if user_input.startswith('/'):
    cmd = user_input.split()[0].lower()
    if cmd == '/skills':
        print(f"[SYSTEM] Skills: {sm.list_skills()}")
    elif cmd == '/tools':
        print(f"[SYSTEM] Tools: {[t['function']['name'] for t in tools]}")
    elif cmd == '/help':
        print("\n[COMMANDS]\n  /skills   列出可用 skill\n  ...")
    continue  # 短路，不调 LLM
```

> 原则：元操作走斜杠，内容操作走 LLM。不为 "/tools" 这种命令花 API 调用钱——即使本地模型不花钱，也浪费时间和上下文。

## Stage 5-6：持久化 + 自动压缩

### Stage 5：JSON 持久化（最大坑）

```python
def save_history(messages):
    serializable = []
    for m in messages:
        if isinstance(m, dict):
            m_copy = dict(m)
            # Ollama tool_call 对象不是 JSON 可序列化的
            if 'tool_calls' in m_copy and m_copy['tool_calls']:
                m_copy['tool_calls'] = [
                    tc.model_dump() if hasattr(tc, 'model_dump') else tc
                    for tc in m_copy['tool_calls']
                ]
            serializable.append(m_copy)
    with open(os.path.join(HISTORY_DIR, f"{current_session_id}.json"), 'w') as f:
        json.dump(serializable, f, indent=4, ensure_ascii=False)
```

> **最大的坑**：Ollama 返回的 tool_call 对象不是原生 Python dict，**不能直接 `json.dump`**。必须先用 `.model_dump()` 转换。原作者说他在这里卡了最久，因为错误信息极其不友好。

加上 `/history-list` 和 `/history-load <编号>` 两个命令，关掉终端再开能加载上一次的对话继续聊。

### Stage 6：上下文自动压缩

```python
CONTEXT_THRESHOLD = 4000  # ~16000 字符

def compact_history(messages):
    if len(messages) < 4:
        return messages
    print(f"\n[SYSTEM] Auto-compacting context ({estimate_tokens(messages)} tokens)...")
    split_idx = int(len(messages) * 0.7)
    to_summarize = messages[:split_idx]   # 前 70% 摘要
    keep_fresh = messages[split_idx:]     # 后 30% 保留原文
    summary_prompt = "用一段话总结以上对话，保留关键事实和当前目标。"
    resp = ollama.chat(model=model_name,
                       messages=to_summarize + [{'role': 'user', 'content': summary_prompt}])
    summary = resp['message']['content']
    new_history = [{'role': 'system', 'content': f"PREVIOUS SUMMARY: {summary}"}]
    if active_skill_content:
        # 关键：把 skill persona 重新注入，防止压缩后"失忆"
        new_history.insert(0, {'role': 'system', 'content': f"Active Skill: {active_skill_content}"})
    new_history.extend(keep_fresh)
    return new_history
```

**70/30 分割比例是经验值**：最近 30% 的消息通常是当前话题的核心，**保留原文比摘要更有价值**。

`active_skill_content` 的作用在这里显现——不重新注入，压缩后 Agent 会忘了自己加载了"安全审计师"skill，又变回默认人格。

## Stage 7：后台定时循环

```python
def background_loop(prompt, interval_mins):
    print(f"\n[SYSTEM] Loop started: '{prompt}' every {interval_mins} min(s).")
    while not stop_event.is_set():
        for _ in range(interval_mins * 60):
            if stop_event.is_set():
                return
            time.sleep(1)
        loop_messages = []
        if active_skill_content:
            loop_messages.append({'role': 'system', 'content': f"Context: {active_skill_content}"})
        loop_messages.append({'role': 'user', 'content': prompt})
        content, tool_calls = stream_with_thinking(model_name, loop_messages, tools=tools)
        if tool_calls:
            loop_messages.append({'role': 'assistant', 'tool_calls': tool_calls})
            handle_tools(tool_calls, loop_messages)
```

### 两个关键设计决策

1. **1 秒分片 sleep**：直接 `sleep(600)` 你敲 `/stop-loop` 得等 10 分钟；分片让停止信号几乎实时响应
2. **独立消息列表**：loop 用自己新建的 `loop_messages`，**不污染主会话的 `messages`**。后台任务和前台对话隔离

## 核心工程经验

### 1. `description` 是 LLM 决策唯一依据

"读取文件" vs "执行文件 I/O 操作"——同样的功能，不同描述导致 LLM 调用率差 10 倍。描述要写**用户能理解的动词 + 目标对象**，别用内部技术术语。

### 2. 工具结果截断不能省

4000 字符以上只留首尾各 1000。生产环境会有更优雅的方案（chunking、selective retrieval），但 250 行版本这个粗暴策略**已经够用**。

### 3. Ollama tool_call 必须 `.model_dump()`

Ollama 返回的 tool_call 不是原生 Python dict，**直接 `json.dump` 会抛 TypeError，错误信息极其不友好**。必须先 `.model_dump()` 转换。

### 4. Compaction 必须重注入 Skill persona

否则 Agent 压缩后"失忆"，忘记自己加载了哪个 skill 变回默认人格。这是 `active_skill_content` 全局变量存在的唯一原因。

### 5. 后台循环必须分片 sleep

否则 `/stop-loop` 要等整个 interval 跑完才能响应。1 秒分片让停止信号**几乎实时生效**。

## 与 Claude Code 生产版的差距

| 维度 | 250 行版本 | Claude Code |
|------|----------|-------------|
| Sub-agent | ❌ | ✅（Task 工具） |
| MCP 协议 | ❌ | ✅ |
| Sandbox | ❌ | ✅ |
| 权限系统 | ❌ | ✅（YOLO mode / 细粒度审批） |
| Hooks | ❌ | ✅（生命周期钩子） |
| Plan Mode | ❌ | ✅ |
| 多 Provider | ❌（只 Ollama） | ✅（Anthropic / OpenRouter / 本地） |
| Token 预算精细管理 | ❌ | ✅ |

> 但**理解这 250 行，就理解了一切 AI 编程助手的底层运作逻辑**。

## 与已有实体的关系

本文是 **"Learning by Building" 风格**的最小可运行参考：

- [从零复刻 Claude Code](/ch05-057-准备开一个新坑从零复刻一个-claude-codenn目标是在这个过程中和大家一起学习-claude-code-的-ha/) — ConardLi 的 30 模块**路线图**（roadmap）
- 本文 — 7 模块**完整可运行实现**（minimal 250-line implementation with Ollama）
- [Harness Engineering 框架](/ch05-041-harness-engineering-概念框架/) — Anthropic/OpenAI 抽象框架
- [Claude Code Harness 深度理解](/ch01-367-claude-code-harness-deep-understanding/) — 生产级深度

两者互补：ConardLi 给"我要做哪些 30 件事"的路线，本文给"这 7 件事怎么做、能跑、可改"的具体代码。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/minimal-cli-agent-250-line-python-ollama-7-stages.md)

## 深度分析

### 1. while 循环作为 Agent 内核的架构意义

250 行的 while 循环不是一个教学简化，而是一个**执行上下文的声明**——它定义了"在哪里运行 AI 判断"的物理边界。所有外部代码（工具、Skill、会话）都是这个循环的依赖注入。这个模式在 [Claude Code Harness Deep Understanding](/ch01-367-claude-code-harness-deep-understanding/) 中被验证为生产级 harness 的核心：循环体越小、越专注，工具层和状态层的接入点就越清晰。理解"循环即内核"，比理解"LLM 是大脑"更接近实际架构真相。

### 2. 工具描述作为 LLM 决策的唯一契约

原文强调 `description` 是 LLM 调用工具的"唯一依据"——这个表述的深层含义是：**描述文本就是 Prompt 和执行层之间的唯一桥梁**。当 description 质量差，即使工具实现正确，LLM 也不会调用它。这意味着在 Agent 架构中，工具描述工程师（prompt engineer 的变体）与工具实现工程师是两个独立技能树。这个洞察与 [Harness Engineering Framework](/ch05-041-harness-engineering-概念框架//) 中"上下文管理决定 Agent 上限"的核心论点一致——description 是上下文的最窄瓶颈。

### 3. 斜杠命令是分层架构的最小实践

斜杠命令将元操作（系统控制）与内容操作（LLM 处理）在 Python 层分离，不需要 LLM 介入。这个设计体现了一个关键工程原则：**不要让模型处理可以通过确定性代码完成的事情**。在 [Harness Engineering Framework](/ch05-041-harness-engineering-概念框架/) 中，这个原则扩展为"硬约束 vs 软约束"的区分——凡是可以通过规则引擎或 Python 代码确定处理的事情，都不应该消耗模型的上下文和推理预算。斜杠命令是这个原则在最简形态下的实现。

### 4. active_skill_content 是状态压缩下人格保持的最小解

全局变量 `active_skill_content` 不是优雅的设计，但它解决了压缩场景下的核心问题：如何在上下文重写后保持 Agent 的人格连续性。这个模式的本质是：**状态重构时，被保留的不仅是历史消息，还有当前执行上下文的元信息**。在更复杂的生产系统中，这对应 [Claude Code Harness Deep Understanding](/ch01-367-claude-code-harness-deep-understanding/) 描述的"Compaction vs Reset"决策——本文选择的是 Compaction 路径，并通过重新注入 skill persona 来防止"失忆"。

### 5. 后台循环的两个决策揭示了真实系统的基础需求

1 秒分片 sleep 和独立消息列表这两个设计决策，揭示了所有生产级 Agent 系统都必须面对的两个基础问题：**可中断性**（stop 信号能否快速响应）和**状态隔离**（后台任务是否污染主会话上下文）。这两个问题在 250 行版本通过简单手法解决，但它们在 [Claude Code Harness Deep Understanding](/ch01-367-claude-code-harness-deep-understanding/) 中对应的是细粒度的权限系统、独立 Session 管理和生命周期钩子。250 行版本和生产版本解决的是同一个问题的不同复杂度层级。

## 实践启示

### 1. 在生产环境中，工具 description 值得单独评审

工具描述的质量直接决定 LLM 调用率——"读取文件"与"执行文件 I/O"差了 10 倍调用率。建议为每个工具的 description 设立独立的评审环节，类比代码 review 的角色分配。同时，description 应经过实际调用测试（触发率）而非仅靠主观判断。

### 2. 实现 `model_dump()` 序列化层作为 Agent 框架的基础设施

Ollama tool_call 对象的序列化问题是本文"卡了最久"的坑——这类隐式类型问题在生产中比逻辑错误更难发现。建议在框架初始化阶段建立**序列化一致性检查**：任何进入 `messages` 的对象类型，在 `json.dump` 前必须经过验证。这比事后调试 TypeError 的性价比高得多。

### 3. 上下文压缩必须配套元信息保留机制

压缩算法（如 70/30 split）只解决历史消息量的问题，不解决人格和上下文元信息的丢失问题。任何一个上下文压缩方案上线前，必须回答：**压缩后 Agent 的 skill、角色设定、当前目标是否仍然有效？** 如果答案不确定，需要在压缩逻辑中增加类似 `active_skill_content` 的重注入步骤。

### 4. 后台任务必须使用独立消息列表

后台循环的 `loop_messages` 与主会话 `messages` 的隔离是防止状态污染的关键。这个模式可以推广：任何非同步的后台任务（定时查询、主动监控、周期性总结）都应该拥有独立的消息上下文，并在完成后通过结构化方式（summary、flag）向主会话汇报，而不是直接追加到主会话。这是保持 Agent 系统可推理性的基础。

### 5. 用最小可运行版本快速验证架构假设

本文的 "Learning by Building" 方法论的价值在于：**250 行代码暴露架构假设的速度远快于读论文或文档**。当你不确定"上下文压缩是否会导致 Agent 失忆"这个假设时，写一个 250 行版本跑一遍，比在任何框架里尝试配置更直接。这个方法论与 [Harness Engineering Framework](/ch05-041-harness-engineering-概念框架//) 的"通过迭代 Harness 来验证假设"思路一致，但更适用于个人开发者在早期阶段的快速原型验证。

---

