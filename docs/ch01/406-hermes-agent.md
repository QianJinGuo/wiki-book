# Hermes Agent 闭环学习机制

## Ch01.406 Hermes Agent 闭环学习机制

> 📊 Level ⭐⭐ | 11.4KB | `entities/hermes-agent-closed-learning-loop.md`

[Hermes Agent Closed Learning Loop](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-agent-closed-learning-loop.md)

## 文章概要
Hermes Agent 是 Nous Research 于 2025 年 2 月开源的自托管智能体框架，GitHub 50.6K star，被认为是 OpenClaw 的首个真正竞争对手。其核心差异在于内置**闭环学习循环**（A Closed Learning Loop），通过"触发 → review → 写回 → 再注入"把 self-improving 飞轮真正跑通。

## 核心机制
### 系统架构三层
1. **用户界面层** — 对外交互入口
2. **核心代理层** — AIAgent、PromptBuilder、SessionDB、工具系统；闭环学习循环主要落在此层
3. **执行后端层** — 底层工具和资源调度

### 闭环学习飞轮（Self-Improving Flywheel）
```
触发条件 → 后台异步 review（不阻塞主对话）
         → 知识提取（MEMORY_REVIEW_PROMPT / SKILL_REVIEW_PROMPT）
         → 知识固化（memory_tool / skill_manage 写回）
         → 能力提升 → 更好的对话体验 → 下一轮触发
```

### 两个 Nudge 触发机制
| 机制 | 触发条件 | 默认间隔 | 写入目标 |
|------|----------|----------|----------|
| **Memory Nudge** | 对话轮次 | 每 10 轮 | MEMORY.md（环境事实）、USER.md（用户档案） |
| **Skill Nudge** | 工具调用次数 | 每 15 次 | skills/ 技能文件 |
配置位于 `config.yaml`：
```yaml
memory:
  nudge_interval: 10    # 轮
skills:
  creation_nudge_interval: 15   # 工具调用次
```

### 核心代码：spawn_background_review
```python
def _spawn_background_review(
    self,
    messages_snapshot: List[Dict],
    review_memory: bool = False,
    review_skills: bool = False,
) -> None:
    """
    Spawn a background thread to review the conversation for memory/skill saves.
    Creates a full AIAgent fork with the same model, tools, and context as the
    main session. The review prompt is appended as the next user turn in the
    forked conversation. Writes directly to the shared memory/skill stores.
    Never modifies the main conversation history or produces user-visible output.
    """
    import threading

    # Pick the right prompt based on which triggers fired
    if review_memory and review_skills:
        prompt = self._COMBINED_REVIEW_PROMPT
    elif review_memory:
        prompt = self._MEMORY_REVIEW_PROMPT
    else:
        prompt = self._SKILL_REVIEW_PROMPT
    def _run_review():
        import contextlib, os as _os
        review_agent = None
        try:
            with open(_os.devnull, "w") as _devnull, \
                 contextlib.redirect_stdout(_devnull), \
                 contextlib.redirect_stderr(_devnull):
                review_agent = AIAgent(
                    model=self.model,
                    max_iterations=8,
                    quiet_mode=True,
                    platform=self.platform,
                    provider=self.provider,
                )
                review_agent._memory_store = self._memory_store
                review_agent._memory_enabled = self._memory_enabled
                review_agent._user_profile_enabled = self._user_profile_enabled
                review_agent._memory_nudge_interval = 0
                review_agent._skill_nudge_interval = 0
                review_agent.run_conversation(
                    user_message=prompt,
                    conversation_history=messages_snapshot,
                )
```
关键设计点：

- **完整 fork**：用相同 model/tools/context 创建独立 review agent
- **静默写回**：直接写 shared memory/skill stores，不修改主对话历史
- **异步非阻塞**：后台线程执行，不影响用户交互延迟

### 知识系统区分
| 系统 | 知识类型 | 示例 |
|------|----------|------|
|| **M
emory** | 声明性知识（知道什么） | 用户偏好、环境事实、长期信息 |
| **Skills** | 程序性知识（知道怎么做） | 复杂任务流程、试错方法、可重用技能 |
两个系统相互补充，共同构建 Agent 的智能基础。

## 与 OpenClaw 的核心差异
| | Hermes Agent | OpenClaw |
|--|-------------|----------|
| 学习循环 | 内置闭环，主动触发 review | 依赖外部工具调用链 |
| Self-improving | 通过 Memory/Skill Nudge 原生实现 | 工具驱动，较少原生支持 |
| 触发机制 | 计数器驱动（轮次/工具调用） | 工具执行后被动总结 |
| 知识存储 | MEMORY.md + USER.md + skills/ | 工具链输出 |

## 关键要点
1. **后台异步 review** 通过 `spawn_background_review` 实现，不阻塞主对话
2. **双计数器机制**：`_turns_since_memory` 和 `_iters_since_skill`
3. **真正的自改进系统**：无需人工干预即可持续进化
4. Memory 提供"知道什么"，Skills 提供"知道怎么做"

## 相关链接
- GitHub: [Hermes Agent](https://github.com/NousResearch/Hermes-Agent)

## 深度分析
### 闭环学习架构的设计哲学
Hermes Agent 的闭环学习循环代表了一种**主动式自我改进**而非被动式经验积累的架构范式。与传统 AI Assistant 仅在用户明确请求时保存上下文不同，Hermes Agent 通过计数器驱动的 Nudge 机制在后台异步触发知识固化，实现了"无感知的持续进化" 。
这一设计的核心价值在于**解耦了知识获取与主对话流程**。传统方案中，记忆保存需要用户主动触发或依赖工具链断裂而失效。而 Hermes Agent 将记忆固化为后台进程的一部分，通过 `_turns_since_memory` 和 `_iters_since_skill` 两个计数器在达到阈值时自动触发 Review，确保知识捕获的可靠性 。

### Fork 模式的工程权衡
`_spawn_background_review` 采用完整 fork AIAgent 的方式创建独立的 Review Agent，而非在主 Agent 内直接执行 Review 逻辑。这一选择体现了明确的工程权衡 ：
**优势：**

- **隔离性**：Review 过程不会污染主对话的消息历史或状态
- **可扩展性**：Review Agent 可以独立配置 max_iterations、quiet_mode 等参数
- **并行性**：多轮对话可以并发触发多次 Review 而不互相阻塞
**代价：**

- 每次触发需要完整加载模型上下文，内存开销翻倍
- 需要维护共享的 memory_store 和 skill_store 状态
这种"用空间换时间和隔离性"的设计选择在资源充足的服务器端部署场景下是合理的，但对于资源受限的边缘设备可能需要优化。

### Memory 与 Skills 的知识表示分离
将声明性知识（Memory）与程序性知识（Skills）分离是 Hermes Agent 知识系统的核心洞察 。这种分离与认知科学中的"知道什么"（declarative knowledge）与"知道如何"（procedural knowledge）的区分高度一致。
| 维度 | Memory | Skills |
|------|--------|--------|
| 知识类型 | 声明性 | 程序性 |
| 更新频率 | 随对话累积 | 随任务完成固化 |
| 检索方式 | 上下文检索 | 模式匹配 |
| 适用场景 | 用户偏好、环境事实 | 复杂流程、试错经验 |
这种分离使得 Agent 能够针对不同类型的知识采用差异化的存储和检索策略，提升了知识系统的整体效率。

### 与 OpenClaw 的范式对比
从架构视角看，Hermes Agent 与 OpenClaw 代表了两种不同的 Agent 自我改进范式 ：

- **Hermes Agent**：计数器驱动的主动触发，强调"原生内置"
- **OpenClaw**：工具链驱动的被动总结，强调"外部扩展"
前者适合需要持续运行、长生命周期部署的场外；后者适合需要明确工具调用边界、审计追踪要求的场景。两者并非替代关系，而是对应了不同的部署需求。

## 实践启示
### 对于 Agent 系统开发者
1. **计数器 + 异步 Review 是实现真正自改进的关键**：仅靠工具调用链被动总结容易遗漏中间状态知识，建议采用计数器驱动的双轨触发机制（对话轮次 + 工具调用次数）
2. **知识分离存储是复杂对话系统的必经之路**：将"知道什么"与"知道如何"分离存储，可以显著提升知识检索的精准度和系统可解释性
3. **Fork 模式提供了良好的隔离边界**：如果你的 Review 逻辑可能干扰主对话流程，优先考虑进程/线程 fork 而非在主上下文中直接执行

### 对于企业部署者
1. **评估资源成本**：后台 Review 会导致同一时刻存在多个模型实例运行，需要评估 GPU/CPU 资源是否满足峰值负载
2. **配置调优**：根据实际对话密度调整 `nudge_interval` 参数 — 过于频繁会浪费计算资源，过于稀疏可能遗漏重要知识
3. **知识质量审计**：随着 Agent 运行时间增长，memory 和 skills 文件会持续膨胀，建议建立定期审计和清理机制

### 对于 AI 研究者
1. **闭环学习是通往 AGI 的必经阶段**：Hermes Agent 的设计验证了"无需人工干预的持续自我改进"在工程上是可行的
2. **异步非阻塞设计是用户体验的关键**：后台 Review 不应影响主对话的响应延迟，这是保持用户体验的工程底线
3. **知识表示的分离是认知架构的基础**：将不同类型的知识用不同的机制处理，这一致知框架值得在更多 Agent 系统中推广
## 相关实体
- [Hermes Agent Vs Openclaw Comparison](../ch03/092-hermes-agent.html)
- [Skill System Design Three Way Comparison](../ch04/267-skill.html)
- [Hermes Agent Memory System Vs Openclaw](../ch03/092-hermes-agent.html)
- [Hermes Agent Goal Runtime Architecture State Persistence Judge Closed Loop](../ch04/365-hermes-agent-goal.html)
- [Small Hermes Self Evolving Agent Architecture](../ch03/046-agent.html)

---

