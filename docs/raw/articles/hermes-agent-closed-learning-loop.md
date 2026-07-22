---
title: hermes-agent-closed-learning-loop
source_url: https://mp.weixin.qq.com/s/4Gfu2WmSKep0uCQXXFuoww
publish_date: 2026-05-07
tags: [wechat, article, agent, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 144fcc3ff0ef4737df4b771b4fee1d1ae0e790df8f60500a32bd4dd1e086e898
---
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
| **Memory** | 声明性知识（知道什么） | 用户偏好、环境事实、长期信息 |
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
- OpenClaw: [[concepts/openclaw-architecture]]