# SemaPLC：验证门控的 PLC 代码生成 Agent Harness

## Ch04.648 SemaPLC：验证门控的 PLC 代码生成 Agent Harness

> 📊 Level ⭐⭐ | 5.3KB | `entities/semaplc-verification-gated-agent-harness-plc-codegen-2026-08-26.md`

# SemaPLC：验证门控的 PLC 代码生成 Agent Harness

上海交通大学联合 Sema 研究团队推出的 **SemaPLC**：把 AI Agent 与 PLC 工程工具链彻底连接起来，让自然语言需求一路走到可编译、可验证、可仿真的控制程序。论文《SemaPLC: A Project-Grounded, Verification-Gated Agent Harness for PLC Code Generation》已在 arXiv 公开，代码在 GitHub 开源。

## 核心洞察：从「生成代码」到「工程闭环」

PLC 控制的是产线、设备、阀门、电梯和安全联锁——不是「代码看起来对」就可以交差，必须确认程序能不能编译、运行时是否符合需求、异常场景下会不会出错、现场人员能不能理解控制行为。因此 AI 写 PLC 代码不是终点，**工程闭环才是 PLC 智能化开发的关键**——从「AI 帮人写一段代码」变成「AI 参与 PLC 程序从需求到验证的完整流程」。

## 架构：Agent 即工程闭环

SemaPLC 的核心设计思路是将 AI Agent 与 PLC 编译、运行、变量读写、行为验证、过程仿真等工程能力解耦封装，以工具套件形式提供。上层可接入不同大模型，中间由 Agent 组织任务闭环，下层由 PLC 工具套件执行真实工程动作。

- **Web IDE**：浏览器工作台，同一界面完成需求输入、代码查看、梯形图阅读、变量监控、验证结果查看和过程仿真，把分散在多个软件里的工作收拢到连续交互流程
- **PLC 工具套件**：负责编译、部署运行、变量读取与强制、轨迹记录、行为验证和仿真生成，围绕 IEC 61131-3 标准的 ST（结构化文本）建立生成、编译、运行、验证工具链
- **可复用性**：工具既被 Web IDE 调用，也通过命令行和 MCP 服务对外提供，是一套可被其他系统、插件或自动化流程复用的 PLC 智能化基础能力

## 核心能力

- **自然语言生成 PLC 程序**：描述控制需求（如四层电梯控制器），生成 ST 程序供工程师审查、修改、完善；适合电机启停、急停联锁、交通灯、停车场闸机、水箱液位控制、电梯运行控制、顺序动作控制等
- **自动验证程序行为**：不只检查能否编译，还检查运行是否符合需求；场景未通过时给出变量变化与预期结果的差异，并让 AI 根据反馈继续修复
- **浏览器过程仿真**：实时读取 PLC 变量并驱动设备元素变化（电梯移动、门开、指示灯亮、水位上升、阀门开关），让变量变成可见动作，利于开发、演示和培训
- **单界面闭环**：把开发、验证、仿真整合到一个浏览器窗口

## 实验验证：验证门控的收益

SemaPLC 的系统实证评估以 LLM4PLC、AutoPLC、Agents4PLC 三个业界代表性系统为基线，所有方法调用相同模型接口，在 GPT、DeepSeek、Qwen、GLM、MiniMax 等 7 个主流大模型上评测。

- **函数级基准**：117 个独立 PLC 功能块生成任务，由独立于生成过程的形式化验证工具统一判分
- **项目级基准**：65 个真实工业项目任务，覆盖十类工业装置，生成的控制逻辑必须能在既有项目中编译、部署并正确运行

**结果**：函数级在全部 7 个模型上均排名第一，平均通过率 72.6%，比最强基线 Agents4PLC（63.9%）高 8.8 个百分点；即使搭配表现最弱的模型仍达 67.5%，高于所有基线平均水平。项目级从集成编译、静态行为、动态行为三层指标衡量，三项均值均排名第一。

## 意义

SemaPLC 是「验证门控 Agent Harness」在工业代码生成领域的落地：用形式化验证与真实部署作为 Agent 生成质量的闭环门控，让 AI 编程从「能生成」走向「可交付」。其设计（工具套件解耦 + MCP 对外暴露 + 验证反馈修复循环）可迁移到其他领域的工程代码生成场景。

## 相关实体与概念

- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Coding Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/coding-harness-engineering.md)
- [代码生成评测](https://github.com/QianJinGuo/wiki/blob/main/concepts/code-generation-evaluation.md)
- [Harness 门控评测](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-gate-evaluation.md)
- [Agent 形式化验证 AI 代码](../ch03/006-agent.html)
- [LLM-as-a-Verifier](../ch01/527-llm-as-a-verifier-a-general-purpose-verification-framework.html)
- [从 Spec 驱动到环境验证驱动](../ch05/129-ai-coding.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/semaplc-verification-gated-agent-harness-plc-codegen-2026-08-26.md)

---

