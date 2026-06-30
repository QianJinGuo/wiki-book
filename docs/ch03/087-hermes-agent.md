# Hermes Agent 工具系统架构分析

## Ch03.087 Hermes Agent 工具系统架构分析

> 📊 Level ⭐⭐ | 8.2KB | `entities/hermes-agent-tool-system-architecture.md`

## 核心结论

Hermes Agent 的工具系统核心是**单例注册表 + import 即自注册 + AST 扫描**的组合：新增工具文件不需要修改任何注册逻辑，只要文件里有 `registry.register()` 调用就会被自动发现和加载。

## 4 层架构

```
tools/*.py        → 自注册层（import 时执行 registry.register()）
tools/registry.py → 单例注册表（ToolRegistry）
model_tools.py    → 编排层（get_definitions / dispatch）
toolsets.py       → 工具分组与组合
run_agent.py/cli.py → 入口
```

每层职责单一，无交叉依赖。

## ToolEntry 数据结构

| 字段 | 用途 |
|------|------|
| `name` | 工具名，全局唯一 |
| `toolset` | 所属工具集（如 file、web） |
| `schema` | OpenAI Function Calling JSON Schema |
| `handler` | 处理函数（同步/异步） |
| `check_fn` | 可用性检查，30s TTL 缓存 |
| `max_result_size_chars` | 返回字符上限，防上下文溢出 |
| `dynamic_schema_overrides` | 运行时动态覆盖 Schema 的回调 |

## 自注册机制

`discover_builtin_tools()` 用 AST 分析只导入真正注册了工具的模块：

```python
_module_registers_tools(path)  # 检查 AST 顶层是否有 registry.register(...)
importlib.import_module(mod_name)  # 触发自注册
```

## 注册安全

不同 toolset 同名工具注册会被拒绝（MCP 刷新和显式 `override=True` 除外），防止意外覆盖内置工具。

## 工具调度流程

```
coerce_tool_args() → pre_tool_call hook → registry.dispatch()
  → _run_async(异步桥接) → post_tool_call hook → transform_tool_result
```

**参数强转**：处理 LLM 返回 string 而 Schema 声明 integer 的不匹配问题。

**异步桥接**：CLI 主线程用持久化事件循环（避免反复创建/销毁导致 "Event loop is closed" 错误）。

## check_fn 30s TTL 缓存

用户通过 `hermes tools enable` 改配置后约 30 秒生效。太短浪费资源，太长体验差。

`get_definitions()` 返回 Schema 时会过滤：check_fn 返回 False 的工具不出现在模型可用列表里。

## Toolset 组合

```python
TOOLSETS = {
    "debugging": {
        "tools": ["terminal", "process"],
        "includes": ["web", "file"]  # 组合复用
    },
    "safe": {
        "tools": [],
        "includes": ["web", "vision", "image_gen"]  # 纯组合，无直接工具
    },
}
```

支持递归解析和钻石依赖去重。

## 动态 Schema 覆盖

`dynamic_schema_overrides` 是零参回调，在 `get_definitions()` 被调用时执行，返回值浅合并到原始 Schema。用于 `delegate_task` 等需要根据运行时配置动态调整 Schema 的工具。

## 最佳实践

- **一个工具做一件事**：read_file、write_file、patch、search_files 四个独立工具，而非一个带 action 参数的 file_operation
- **设置 max_result_size_chars**：file_tools 设 100,000 字符（约 25-35K tokens）
- **check_fn 必须加**：依赖外部状态的工具不加 check_fn 会导致模型调用必然失败
- **用 tool_error() 返回结构化错误**：不要抛异常
- **MCP 工具**：toolset 名为 `mcp-<server_name>`，与内置工具完全等价

## 相关实体
- [Hermes Agent V014 Core Architecture Shugex](ch04/503-agent.md)
- [Hermes Agent Memory System Three Layer Architecture](ch04/503-agent.md)
- [Hermes Agent Deep Dive](ch04/503-agent.md)
- [Hermes Agent Self Evolution Tengxun](ch04/503-agent.md)
- [Hermes Agent Memory System Architecture](ch04/503-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-agent-tool-system-analysis.md)

## 深度分析

### 自注册模式的工程哲学

Hermes Agent 的工具系统核心设计思路是**"约定大于配置"**——开发者只需要在工具文件末尾调用一次 `registry.register()`，剩余的发现、加载、调度全部由框架自动完成。与传统的配置表驱动（YAML/JSON 声明式）相比，import 即注册的模式有本质区别：

- **配置表模式**：新增工具 → 修改配置 → 重启服务。配置和代码必须同步维护，容易出现配置漂移。
- **自注册模式**：新增工具 → import 触发注册 → 自动被发现。代码即配置，天然一致。

这种设计降低了对开发者的约束——不需要记住"要去哪里声明"。只要文件里有 `registry.register()`，框架的 AST 扫描器在启动时就会自动找到它。^[Hermes Agent Tool System Analysis](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-agent-tool-system-analysis.md)

### ToolEntry 字段设计的信息密度

`ToolEntry` 的 `__slots__` 定义了 11 个字段，每个字段都有明确的工程含义：

- `max_result_size_chars`：防止 LLM 上下文溢出，是成本控制的关键。file_tools 设 100,000 字符（约 25-35K tokens），这是一个经过权衡的经验值。
- `dynamic_schema_overrides`：运行时根据配置调整 Schema，支持 `delegate_task` 等需要条件参数的复杂工具。
- `check_fn`：零参函数 + 30s TTL 缓存，在可用性和性能之间取得平衡。^[Hermes Agent Tool System Analysis](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-agent-tool-system-analysis.md)

### check_fn 缓存策略的精妙

30 秒 TTL 不是随意选的。太短（如 5s）会导致频繁重新执行检查；太长（如 5min）会导致用户改配置后长时间体验不一致。30 秒恰好覆盖了用户修改配置后的人工感知周期，同时不会给系统带来频繁检查的开销。^[Hermes Agent Tool System Analysis](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-agent-tool-system-analysis.md)

### 注册安全的三层防护

工具名冲突的防护分了三种场景：

1. **不同 toolset 同名** → 拒绝注册（防止意外覆盖内置工具）
2. **MCP-to-MCP 刷新** → 允许（MCP 服务器刷新时重新注册同名工具）
3. **显式 `override=True`** → 允许（插件场景需要主动覆盖）

这个分层设计确保了框架的防御性，同时不阻塞合理的扩展场景。^[Hermes Agent Tool System Analysis](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-agent-tool-system-analysis.md)

## 实践启示

### 工具设计原则

- **原子化**：`read_file`、`write_file`、`patch`、`search_files` 四个独立工具，而不是一个带 action 参数的 `file_operation`。原子工具更容易独立测试和维护。
- **Schema 描述充分**：description 应该解释工具的行为边界和参数约束，如 search_files 的 description 解释了两种搜索模式的差异。
- **设置结果上限**：每个工具都应设置 `max_result_size_chars`，防止单次调用返回过多内容淹没上下文。^[Hermes Agent Tool System Analysis](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-agent-tool-system-analysis.md)

### 异步工具的 `is_async=True`

异步工具和同步工具在注册时完全一致，唯一的区别是 `is_async=True` 标记。这个标记触发异步桥接逻辑，让框架在 `_run_async()` 中正确处理事件循环的生命周期。CLI 主线程使用持久化事件循环（避免 `asyncio.run()` 反复创建/销毁导致的"Event loop is closed"错误），这是一个值得学习的异步编程实践。^[Hermes Agent Tool System Analysis](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-agent-tool-system-analysis.md)

### 错误处理规范

工具执行出错应该使用 `tool_error()` 返回结构化 JSON，而不是抛异常。异常会打断调用链的正常执行路径，而结构化错误可以让 Agent Loop 继续运行，模型也能理解错误原因。`_sanitize_tool_error()` 剥离 XML 标签、CDATA 等结构性 framing token 的逻辑值得注意——错误信息里的特殊内容如果不做脱敏，可能会干扰模型的上下文理解。^[Hermes Agent Tool System Analysis](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-agent-tool-system-analysis.md)

### MCP 集成

MCP 工具动态注册到 registry，toolset 名为 `mcp-<server_name>`，与内置工具完全等价。配置文件中声明 MCP 服务器后，框架自动处理扫描和加载。不同 MCP 服务器之间、以及 MCP 与内置工具之间，如果有同名工具，框架的注册安全机制会介入防护。^[Hermes Agent Tool System Analysis](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-agent-tool-system-analysis.md)

## 关联阅读

---

