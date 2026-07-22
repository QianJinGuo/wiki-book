---
title: Agent Hooks：把 Agent 工作流变成可编程的
source_url: https://mp.weixin.qq.com/s/O7oQ3Uc8PQ0Kh_WhOdYvnQ
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
ingested: 2026-05-21
sha256: 15e3ad0cbb39b16d2c558105cf18baff80094b12e70e7529e8bfa9b0af6c3acb
---
---
# Agent Hooks：把 Agent 工作流变成可编程的
**来源:** ChallengeHub
**URL:** https://mp.weixin.qq.com/s/O7oQ3Uc8PQ0Kh_WhOdYvnQ
**GitHub:** https://github.com/dabit3/agent-hooks-in-depth/tree/main
**日期:** 2026年5月16日
**标签:** #AgentHooks #工作流可编程 #生命周期 #ClaudeCode
---
## 核心论点
Hooks 将 Agent 工作流从"模型记住规则"变成"确定性自动化"——把可重复的规则从模型记忆里挪出来，搬进会在已知生命周期节点上自动运行的代码。
> 提示词负责"引导"，Hooks 负责"那些每次都必须发生的行为"。
项目说明写"别改自动生成的文件"只是叮嘱，PreToolUse Hook 能在编辑真正落地之前就把它拦下来——前者是叮嘱，后者是闸门。
## 生命周期模型
```
event → optional matcher/filter → handler → outcome
```
六个核心生命周期节点，覆盖主流程全链路：
| 节点 | 时机 | 典型用途 |
|------|------|----------|
| **SessionStart** | 会话开始 | 加载项目约定、受保护路径、测试命令 |
| **UserPromptSubmit** | 模型看到提示词之前 | 补充上下文、做请求路由、挡掉已知问题提示 |
| **PreToolUse** | 工具调用执行前 | 检查文件路径/命令，决定放行/拦截/改写 |
| **PostToolUse** | 工具调用成功后 | 测试、格式化、扫描、记录日志、保存状态 |
| **Stop** | 判断是否可以结束 | 质量闸门没过则阻止收工 |
| **SessionEnd** | 会话结束 | 写审计日志、刷新指标、导出总结 |
## 设计原则
**"提示词管引导，Hooks 管控制"**
- 提示词：编码风格、架构指导、命名约定、测试偏好
- Hooks：必需的上下文、前置策略、后置校验、完成闸门、审计日志
- CI：在 Agent 产出 diff 之后做独立的二次验证
- 人工评审：产品判断、权衡取舍、不可逆风险
**经验法则：** 当一条需求出现"总是"、"绝不"、"拦截"、"记录"、"运行"、"校验"这类词——它八成属于 Hook，而不该只待在提示词里。
## 核心价值：确定性
把具体的检查和副作用从模型的记忆里挪出来，搬进显式的控制点。
- 模型该选什么方案、走什么恢复路径，照样自由推理
- 但测试、策略、日志、完成闸门，作为工作流里确定性的那部分，雷打不动地跑起来
## 落地路径
1. **第一个 Hook：** PreToolUse 挡掉对 generated/、.env、敏感夹具的编辑——好解释、好测试、立刻有价值
2. **第二个：** PostToolUse 质量闸门 + Stop Hook 组合：编辑后跑测试，结果写入 .hook-state/last_quality_gate.json，测试没过就不让收工
3. **再补：** SessionStart 上下文注入、UserPromptSubmit 路由、SessionEnd 审计记录
## 相关概念
- AgentHarnessEngineering — Harness 工程化框架（实体不存在，待创建）
- ClaudeCodeHooks — Claude Code Hooks 具体实现（实体不存在，待创建）