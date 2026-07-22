---
source_url: https://mp.weixin.qq.com/s/ItjK7a6EoyJSidSDTnJgww
title: "Hermes Agent 工具系统实战解析：40+ 工具为什么不用配置表"
author: 术哥（运维有术）
account: 术哥无界
published: 2026-05-23
source: wechat
tags: [hermes-agent, tool-system, registry, toolset, agent-framework, nous-research]
created: 2026-05-23
sha256: 280d8153484d0c60e40de6f7c9dc15f21ad2fcad16b7defe11655199283297e4

---

# Hermes Agent 工具系统实战解析：40+ 工具为什么不用配置表

## 概述

GitHub 上不到一年的项目，Star 数冲到 14.9 万。2026 年 5 月 9 日单日 Token 消耗超过 2710 亿，在 OpenRouter 排行榜首次登顶。

这是 Hermes Agent - Nous Research 开源的自进化 AI Agent 框架。它的工具系统设计：一个单例注册表、AST 分析自动发现、import 即注册的机制，把 40+ 内置工具管理得井井有条。

## 1. 整体架构：4 层调用链

Hermes Agent 的工具系统分成 4 层，每一层职责清晰：

```
tools/*.py          ← 各工具文件（模块导入时自注册）
   ↓ register()
tools/registry.py    ← 单例注册中心（ToolRegistry）
   ↓ get_definitions() / dispatch()
model_tools.py       ← 编排层（发现 + Schema 提供 + 调度）
   ↓ resolve_toolset()
toolsets.py          ← Toolset 定义（工具分组、组合）
   ↓
run_agent.py/cli.py  ← 入口（消费工具定义，驱动 Agent Loop）
```

这 4 层各管各的：`tools/*.py` 只管注册自己，`registry.py` 只管存取，`model_tools.py` 做编排调度，`toolsets.py` 负责分组组合。没有交叉依赖，也没有上帝类。

## 2. ToolRegistry：一个单例管所有工具

### 2.1 核心数据结构

`tools/registry.py` 是整个工具系统的中枢。核心类 `ToolRegistry`，模块级单例：

```python
# 模块级单例
registry = ToolRegistry()
```

每个工具注册进来，存的是 `ToolEntry` 对象：

```python
class ToolEntry:
    __slots__ = (
        "name", "toolset", "schema", "handler", "check_fn",
        "requires_env", "is_async", "description", "emoji",
        "max_result_size_chars", "dynamic_schema_overrides",
    )
```

| 字段 | 用途 |
|------|------|
| name | 工具名，全局唯一标识 |
| toolset | 所属工具集（如 file、web） |
| schema | OpenAI Function Calling 格式的 JSON Schema |
| handler | 处理函数，同步或异步 |
| check_fn | 可用性检查函数，带 30s TTL 缓存 |
| requires_env | 所需环境变量列表 |
| is_async | 是否异步处理器 |
| max_result_size_chars | 返回结果字符上限，防止上下文溢出 |
| dynamic_schema_overrides | 运行时动态覆盖 Schema 的回调 |

### 2.2 注册安全机制

`register()` 方法有一套防护逻辑：

```python
def register(self, name, toolset, schema, handler, ..., override=False):
    existing = self._tools.get(name)
    if existing and existing.toolset != toolset:
        # MCP-to-MCP 允许覆盖（服务器刷新场景）
        both_mcp = (existing.toolset.startswith("mcp-")
                   and toolset.startswith("mcp-"))
        if both_mcp:
            pass  # 允许
        elif override:
            pass  # 显式允许（插件场景）
        else:
            # 拒绝 - 防止意外覆盖内置工具
            logger.error("Tool registration REJECTED: ...")
            return
```

不同 toolset 的同名工具注册会被拒绝。除非是 MCP 工具刷新，或者显式传了 `override=True`。

### 2.3 两个辅助函数

```python
def tool_error(message, **extra) -> str:
    result = {"error": str(message)}
    if extra:
        result.update(extra)
    return json.dumps(result, ensure_ascii=False)

def tool_result(data=None, **kwargs) -> str:
    if data is not None:
        return json.dumps(data, ensure_ascii=False)
    return json.dumps(kwargs, ensure_ascii=False)
```

## 3. 自注册模式：import 即注册

### 3.1 模块级注册

每个工具文件在模块末尾直接调用 `registry.register()`。模块被 import 的时候，Python 执行模块级代码，注册就自动完成了。

```python
# tools/file_tools.py 末尾
registry.register(name="read_file", toolset="file", schema=READ_FILE_SCHEMA,
    handler=_handle_read_file, check_fn=_check_file_reqs,
    emoji="📖", max_result_size_chars=100_000)
registry.register(name="write_file", toolset="file", schema=WRITE_FILE_SCHEMA,
    handler=_handle_write_file, check_fn=_check_file_reqs,
    emoji="✍️", max_result_size_chars=100_000)
registry.register(name="patch", toolset="file", schema=PATCH_SCHEMA,
    handler=_handle_patch, check_fn=_check_file_reqs,
    emoji="🔧", max_result_size_chars=100_000)
registry.register(name="search_files", toolset="file", schema=SEARCH_FILES_SCHEMA,
    handler=_handle_search_files, check_fn=_check_file_reqs,
    emoji="🔎", max_result_size_chars=100_000)
```

### 3.2 AST 分析 + 动态导入

`discover_builtin_tools()` 函数先用 AST 分析，只导入真正注册了工具的模块：

```python
def discover_builtin_tools(tools_dir=None):
    tools_path = Path(tools_dir) or Path(__file__).resolve().parent
    module_names = [
        f"tools.{path.stem}"
        for path in sorted(tools_path.glob("*.py"))
        if path.name not in {"__init__.py", "registry.py", "mcp_tool.py"}
        and _module_registers_tools(path)  # AST 分析
    ]
    for mod_name in module_names:
        importlib.import_module(mod_name)  # 触发自注册
```

`_module_registers_tools()` 的判断逻辑：解析 `.py` 文件的 AST，检查模块顶层是否存在 `registry.register(...)` 调用。只看模块顶层，不深入函数体。

## 4. 工具调度全流程

```
Agent Loop → handle_function_call()
                ↓
            coerce_tool_args()        # 参数类型强转
                ↓
            pre_tool_call hook        # 插件拦截
                ↓
            registry.dispatch()       # 路由到处理器
                ↓
            async bridge (_run_async) # 异步桥接（如果需要）
                ↓
            post_tool_call hook       # 后置处理
                ↓
            transform_tool_result     # 结果转换
                ↓
            返回 JSON 字符串
```

### 4.1 参数类型强转

`coerce_tool_args()` 处理 LLM 返回参数类型和 Schema 不匹配的问题：

- `"42"` → `42`（string → integer）
- `"true"` → `True`（string → boolean）
- `"https://a.com"` → `["https://a.com"]`（bare value → array）
- JSON 字符串 `"['a','b']"` → `['a', 'b']`（解析嵌套结构）

源码注释里写得很直接：**Open-weight models (DeepSeek, Qwen, GLM) sometimes emit `{"urls": "https://a.com"}` when the tool expects `{"urls": ["https://a.com"]}`**.

### 4.2 异步桥接

`_run_async()` 是同步上下文里跑异步工具的关键。分了三种情况：

| 场景 | 处理方式 |
|------|---------|
| CLI 主线程 | 持久化事件循环（避免 `asyncio.run()` 反复创建/销毁循环导致 "Event loop is closed" 错误） |
| 工作线程（delegate_task 线程池） | 每线程一个持久化循环 |
| 已有异步上下文（gateway） | 新建独立线程运行，带 300s 超时保护 |

### 4.3 错误处理

工具执行出错不会抛异常，而是返回结构化错误 JSON：

```python
try:
    if entry.is_async:
        return _run_async(entry.handler(args, **kwargs))
    return entry.handler(args, **kwargs)
except Exception as e:
    raw = f"Tool execution failed: {type(e).__name__}: {e}"
    sanitized = _sanitize_tool_error(raw)  # 脱敏处理
    return json.dumps({"error": sanitized})
```

`_sanitize_tool_error()` 会剥离结构性 framing token（XML 标签、CDATA、代码围栏），防止错误信息里的特殊内容干扰模型的上下文理解。

## 5. check_fn：可用性检查的 30 秒缓存

`check_fn` 是零参函数，返回 bool：

```python
def check_vision_requirements():
    """检查视觉分析所需依赖"""
    try:
        import some_vision_lib
        return True
    except ImportError:
        return False
```

30 秒 TTL 缓存实现：

```python
_CHECK_FN_TTL_SECONDS = 30.0
_check_fn_cache: Dict[Callable, tuple[float, bool]] = {}

def _check_fn_cached(fn):
    now = time.monotonic()
    cached = _check_fn_cache.get(fn)
    if cached and (now - cached[0]) < _CHECK_FN_TTL_SECONDS:
        return cached[1]  # 命中缓存
    try:
        value = bool(fn())
    except Exception:
        value = False  # 异常 = 不可用
    _check_fn_cache[fn] = (now, value)
    return value
```

`get_definitions()` 返回 Schema 时会过滤：check_fn 返回 False 的工具不会出现在给模型的工具列表里。

## 6. Toolset：工具分组与组合

### 6.1 基本结构

`TOOLSETS` 字典定义所有工具集：

```python
TOOLSETS = {
    "web": {
        "description": "Web research and content extraction tools",
        "tools": ["web_search", "web_extract"],
        "includes": []
    },
    "debugging": {
        "description": "Debugging and troubleshooting toolkit",
        "tools": ["terminal", "process"],
        "includes": ["web", "file"]  # 组合其他 toolset
    },
    "safe": {
        "description": "Safe toolkit without terminal access",
        "tools": [],
        "includes": ["web", "vision", "image_gen"]  # 纯组合，无直接工具
    },
}
```

`includes` 支持递归解析和钻石依赖（去重）。

### 6.2 平台预设

| 平台 Toolset | 说明 |
|-------------|------|
| hermes-cli | CLI 完整工具集 |
| hermes-telegram / hermes-discord 等 | 各消息平台工具集 |
| hermes-gateway | 网关工具集（组合所有平台） |
| hermes-acp | 编辑器集成（VS Code、Zed） |
| hermes-api-server | OpenAI 兼容 API |

### 6.3 运行时创建自定义 Toolset

```python
from toolsets import create_custom_toolset

create_custom_toolset(
    name="my_workflow",
    description="Custom workflow toolset",
    tools=["my_tool", "web_search"],
    includes=["file"]
)
```

## 7. 三种工具注册模式

### 7.1 同步工具

```python
READ_FILE_SCHEMA = {
    "name": "read_file",
    "description": "Read file contents...",
    "parameters": {
        "type": "object",
        "properties": {
            "path": {"type": "string", "description": "File path to read"},
            "offset": {"type": "integer", "description": "Starting line number", "default": 1},
            "limit": {"type": "integer", "description": "Max lines to return", "default": 500},
        },
        "required": ["path"]
    }
}

def _handle_read_file(args, **kw):
    tid = kw.get("task_id") or "default"
    return read_file_tool(
        path=args.get("path", ""),
        offset=args.get("offset", 1),
        limit=args.get("limit", 500),
        task_id=tid
    )

registry.register(
    name="read_file",
    toolset="file",
    schema=READ_FILE_SCHEMA,
    handler=_handle_read_file,
    check_fn=_check_file_reqs,
    emoji="📖",
    max_result_size_chars=100_000,
)
```

### 7.2 异步工具

```python
registry.register(
    name="web_extract",
    toolset="web",
    schema=WEB_EXTRACT_SCHEMA,
    handler=lambda args, **kw: web_extract_tool(
        args.get("urls", [])[:5] if isinstance(args.get("urls"), list) else [],
        "markdown"),
    check_fn=check_web_api_key,
    requires_env=_web_requires_env(),
    is_async=True,  # 标记为异步
    emoji="📄",
    max_result_size_chars=100_000,
)
```

唯一区别是 `is_async=True`。

### 7.3 动态 Schema 覆盖

`dynamic_schema_overrides` 在 `get_definitions()` 被调用时执行，返回的字典会浅合并到原始 Schema：

```python
def _build_dynamic_schema_overrides() -> dict:
    overrides_params = {**DELEGATE_TASK_SCHEMA["parameters"]}
    overrides_params["properties"] = {
        k: dict(v) for k, v in
        DELEGATE_TASK_SCHEMA["parameters"]["properties"].items()
    }
    overrides_params["properties"]["tasks"]["description"] = (
        _build_tasks_param_description()
    )
    return {
        "description": _build_top_level_description(),
        "parameters": overrides_params,
    }
```

## 8. Schema 设计规范

### 8.1 Schema 结构

统一遵循 OpenAI Function Calling 格式：

```json
{
    "name": "search_files",
    "description": "Search file contents or find files by name...",
    "parameters": {
        "type": "object",
        "properties": {
            "pattern": {"type": "string", "description": "Regex pattern..."},
            "target": {
                "type": "string",
                "enum": ["content", "files"],
                "default": "content"
            },
            "limit": {"type": "integer", "default": 50},
        },
        "required": ["pattern"]
    }
}
```

### 8.2 设计要点

- **description 要写清楚**：search_files 的 description 足有 3 行，解释了两种搜索模式和各自的行为
- **enum 约束枚举值**：减少模型误调用
- **合理设置 default**：limit 默认 50，不是无限制返回
- **maxItems 限制数组长度**：防止一次传太多 URL

## 9. 最佳实践

### 9.1 工具边界设计

一个工具做一件事。`read_file`、`write_file`、`patch`、`search_files` 是四个独立工具，而不是一个 `file_operation` 工具带 action 参数。

### 9.2 结果大小控制

设置 `max_result_size_chars`。file_tools.py 里设的是 100,000 字符（约 25-35K tokens）。

### 9.3 错误处理模式

用 `tool_error()` 返回结构化错误，不要抛异常。

### 9.4 check_fn 必须加

依赖外部状态的工具一定要提供 `check_fn`。如果不加，工具会出现在模型可用的工具列表里，但调用时必然失败。

### 9.5 Toolset 组合策略

按场景分组，用 `includes` 组合复用。

### 9.6 MCP 集成

MCP 工具动态注册到 registry，toolset 名为 `mcp-<server_name>`：

```yaml
mcp_servers:
  filesystem:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
    timeout: 120
  remote_api:
    url: "https://my-mcp-server.example.com/mcp"
    headers:
      Authorization: "Bearer sk-..."
```

## 总结

Hermes Agent 工具系统做对了几件事：

1. **import 即注册**：新增工具文件不需要修改任何注册逻辑
2. **单例注册表**：所有工具的 Schema、handler、可用性检查集中管理
3. **分层清晰**：注册、发现、编排、分组各层独立
4. **防御性设计**：注册隔离、错误脱敏、Schema 清洗、参数强转、结果截断

这这套架构不是什么复杂的设计模式，就是"每个工具自己管自己，注册表统一收口"的思路。但正因为它简单，所以好扩展、好调试、好理解。
