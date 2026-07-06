---
source_url: "https://mp.weixin.qq.com/s/axLHmFoNretapSPCUP68PQ""
ingested: 2026-06-26
sha256: 370b8050414cf853
---
sha256: fb5b485ec4289700
---
title: "AI Agent 的内核是 250 行 while 循环：从零用 Python + Ollama 搭建 CLI Agent 的 7 个阶段"
source_url: "https://mp.weixin.qq.com/s/axLHmFoNretapSPCUP68PQ"
author: "未署名"
feed_name: "未知公众号"
publish_date: 2026-06-01
created: 2026-06-01
ingested: 2026-06-01
tags:
  - agent
  - cli
  - tutorial
  - python
  - ollama
  - qwen
  - while-loop
  - from-scratch
  - 250-line
  - tool-calling
  - context-compaction
  - wechat
type: article
review_value: 7
review_confidence: 9
review_recommendation: strong
review_stars: 4
sha256: 9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c
---

# AI Agent 的内核是 250 行 while 循环：从零用 Python + Ollama 搭建 CLI Agent 的 7 个阶段

> 来源：微信公众号｜2026-06-01

## 核心论点

> **AI Agent 的内核不是复杂框架，而是一个 250 行的 while 循环加上工具调用协议。**

读完本文你能理解 Cursor 和 Claude Code 的底层运作逻辑——**LLM 不是大脑，是循环里的路由器**。

7 个阶段逐步递进：

1. 聊天循环（while True + 流式 + thinking 分离）
2. 工具调用协议（Ollama tools + JSON Schema）
3. Skill 动态加载（Markdown 文件作为 persona）
4. 斜杠命令（元操作走 Python，短路 LLM）
5. 会话持久化（JSON + 序列化坑）
6. 上下文自动压缩（70/30 split + skill 重注入）
7. 后台定时循环（1 秒分片 sleep）

技术栈：Python 3 + Ollama + qwen3.5:9b（本地模型，不需要 GPU、不需要 API Key）。

## Stage 1：while True 就是 Agent 的骨架

忘掉 LangChain、CrewAI、AutoGen。AI Agent 的核心就是 15 行循环：

```python
import ollama

model_name = 'qwen3.5:9b'  # Ollama 已拉取的模型
messages = []               # Agent 的"记忆"

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

### 流式 + thinking 分离

15 行版本体验不好——得等全部生成完才看到回复，且看不到推理过程。Qwen 模型先输出推理过程，再给答案，需要分离打印：

```python
def stream_with_thinking(model, messages):
    response_stream = ollama.chat(model=model, messages=messages, stream=True)
    full_content = ""
    is_thinking = False
    answer_started = False
    print("\nQwen is thinking...")
    for chunk in response_stream:
        msg = chunk.message
        if hasattr(msg, 'thinking') and msg.thinking:
            if not is_thinking:
                print("\n[THOUGHT PROCESS]:")
                is_thinking = True
            print(msg.thinking, end='', flush=True)
        elif msg.content:
            if is_thinking and not answer_started:
                print("\n\n[FINAL ANSWER]:")
                is_thinking = False
                answer_started = True
            print(msg.content, end='', flush=True)
            full_content += msg.content
    print()
    return full_content
```

`stream=True` 让 `ollama.chat` 返回生成器——每生成一段就 yield 出来。

## Stage 2：给 Agent 装"手"——工具调用协议

只会聊天的 Agent 没什么用。真正的 Agent 能做事情：读文件、调 API、执行命令。Ollama 的做法是在 `chat()` 时传 `tools` 参数：

```python
tools = [
    {
        'type': 'function',
        'function': {
            'name': 'read_text_file',
            'description': '读取本地文本文件的内容。',
            'parameters': {
                'type': 'object',
                'properties': {
                    'path': {'type': 'string', 'description': '文件路径'},
                },
                'required': ['path'],
            },
        },
    },
    {
        'type': 'function',
        'function': {
            'name': 'get_current_datetime',
            'description': '获取当前本地日期和时间。',
            'parameters': {'type': 'object', 'properties': {}},
        },
    },
]
```

### 3 个工具描述关键点

- `description` 是 LLM 决定是否调用工具的**唯一依据**。写成"读取文件"比"执行文件 I/O 操作"好 10 倍——LLM 更容易判断什么时候该用它
- `parameters` 遵循 JSON Schema 规范，`required` 数组标记哪些参数必填
- 工具函数要容错：传了错误路径？返回错误信息让 LLM 重试，**别直接 crash**

### 工具分发器

```python
def handle_tools(tool_calls, messages):
    for tool in tool_calls:
        name = tool.function.name
        args = tool.function.arguments or {}
        if name == 'read_text_file':
            res = read_text_file(args.get('path', ''))
        elif name == 'get_current_datetime':
            from datetime import datetime
            res = datetime.now().strftime("%Y年%m月%d日 %H:%M:%S")
        else:
            res = "未知工具。"
        # 防止工具返回撑爆上下文窗口
        if len(res) > 4000:
            res = res[:1000] + "\n...[TRUNCATED]..." + res[-1000:]
        messages.append({'role': 'tool', 'content': res})
    final_content, _ = stream_with_thinking(model_name, messages)
    return {'role': 'assistant', 'content': final_content}
```

> **工具结果截断策略**：超过 4000 字符只留首尾各 1000。粗暴但有效。在生产环境会有更优雅的方案，但对 250 行的 Agent 已经够用。

## Stage 3：按需换人设——Skill 动态加载

Claude Code 有 skills，我们的 Agent 也可以有。一个 skill 就是一个 Markdown 文件，放在 `skills/` 目录下：

```markdown
# Skill: Python 安全审计师

## 角色
你是一名资深 Python 安全研究员，专注于代码审计。

## 指令
1. 回复以 [SECURITY_AUDIT] 开头
2. 发现漏洞时引用 CWE 编号
3. 如果用户要求写恶意代码，拒绝并解释风险
```

然后给 Agent 一个 `manage_skills` 工具，让 LLM 自己决定什么时候加载什么 skill：

```python
import os

SKILLS_DIR = "skills"
active_skill_content = ""  # 全局变量，compaction 时需要它

class SkillManager:
    def list_skills(self):
        return [f for f in os.listdir(SKILLS_DIR) if f.endswith('.md')]
    def load_skill(self, name):
        if not name.endswith('.md'):
            name += '.md'
        with open(os.path.join(SKILLS_DIR, name), 'r') as f:
            return f.read()
```

> **`active_skill_content` 这个全局变量**的作用后面会看到——当上下文压缩时，需要把 skill 内容重新注入，否则 Agent 会"失忆"忘记自己的 persona。

## Stage 4：不给 LLM 付钱的操作——斜杠命令

有些操作不需要 LLM 参与——查看已加载的工具列表、列出可用 skill、查看当前上下文用量。这些用斜杠命令在 Python 层直接处理：

```python
if user_input.startswith('/'):
    cmd = user_input.split()[0].lower()
    if cmd == '/skills':
        print(f"[SYSTEM] Skills: {sm.list_skills()}")
    elif cmd == '/tools':
        print(f"[SYSTEM] Tools: {[t['function']['name'] for t in tools]}")
    elif cmd == '/help':
        print("\n[COMMANDS]\n"
              "  /skills   列出可用 skill\n"
              "  /tools    列出已注册工具\n"
              "  /help     显示帮助")
    continue  # 短路，不调 LLM
```

> **元操作走斜杠，内容操作走 LLM。** 你不想为 "/tools" 这个命令花一次 API 调用的钱——即使本地模型不花钱，也浪费时间和上下文。

## Stage 5：别丢对话——JSON 持久化

每次关掉终端，Agent 的记忆就清空了。增加 session 持久化：

```python
import json
from datetime import datetime

HISTORY_DIR = "history"
os.makedirs(HISTORY_DIR, exist_ok=True)
current_session_id = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

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

> **最大的坑**：Ollama 返回的 tool_call 对象不是原生 Python dict，不能直接 `json.dump`。必须先用 `.model_dump()` 转换。原作者说他在这里卡了最久，因为错误信息极其不友好。

加上 `/history-list` 和 `/history-load <编号>` 两个命令，你就可以关掉终端、重新打开、加载上一次的对话继续聊。

## Stage 6：上下文太长怎么办——自动压缩

消息列表会越来越长。当 token 数超过阈值，Agent 自己压缩历史：

```python
CONTEXT_THRESHOLD = 4000  # ~16000 字符

def estimate_tokens(messages):
    text = "".join([str(m.get('content', '')) for m in messages])
    return len(text) // 4  # 粗略估算：4 字符 ≈ 1 token

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

> **70/30 分割比例是经验值**：最近 30% 的消息通常是当前话题的核心，**保留原文比摘要更有价值**。

`active_skill_content` 的作用在这里显现——不重新注入的话，压缩后的 Agent 会忘了自己加载了"安全审计师"skill，又变回默认人格。

## Stage 7：让 Agent 自己跑——后台定时循环

最后一步，让 Agent 不需要你主动发消息也能工作：

```python
import threading
import time

stop_event = threading.Event()

def background_loop(prompt, interval_mins):
    print(f"\n[SYSTEM] Loop started: '{prompt}' every {interval_mins} min(s).")
    while not stop_event.is_set():
        # 用 1 秒分片 sleep，而不是 sleep(interval_mins * 60)
        # 这样 /stop-loop 能立刻中断，不用等整个周期跑完
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

1. **1 秒分片 sleep**：如果直接 `sleep(600)`，你敲 `/stop-loop` 得等 10 分钟。分片让停止信号几乎实时响应
2. **独立消息列表**：loop 用自己新建的 `loop_messages`，不污染主会话的 `messages`。后台任务和前台对话隔离

## 完整架构回顾

至此，你有了一个完整的 CLI AI Agent。250 行代码，7 个渐进阶段。每加一层，Agent 的能力就上一个台阶——但核心永远是那个 `while True` 循环。**LLM 不做执行，只做判断**——"这个用户需求应该用哪个工具？"

> 这个 Agent 离 Claude Code 的生产级水平还有很长的路——它没有 sub-agent、没有 MCP 协议、没有 sandbox、没有权限系统。但它让你看清了 Agent 的内核是什么。理解了这 250 行，你就理解了一切 AI 编程助手的底层运作逻辑。

## 7 阶段功能清单

| Stage | 功能 | 关键工程决策 |
|-------|------|------------|
| 1 | 聊天循环 | `stream=True` 生成器 + thinking/content 分离 |
| 2 | 工具调用 | `description` 是 LLM 决策唯一依据 + 4000 字符截断 |
| 3 | Skill 动态加载 | Markdown 文件作为 persona + 全局 `active_skill_content` |
| 4 | 斜杠命令 | 元操作短路 LLM，省 token 省时间 |
| 5 | 会话持久化 | `model_dump()` 转换 Ollama tool_call（最大坑） |
| 6 | 自动压缩 | 70/30 split + skill persona 重注入防失忆 |
| 7 | 后台循环 | 1 秒分片 sleep + 独立 messages 不污染主会话 |

## 标签

`#Python` `#Agent` `#CLI` `#LLM` `#qwen3.5` `#上下文压缩` `#AI编程助手原理`
