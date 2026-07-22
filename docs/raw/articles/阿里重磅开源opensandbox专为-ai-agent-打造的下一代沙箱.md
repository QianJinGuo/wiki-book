---
title: "阿里重磅开源！OpenSandbox：专为 AI Agent 打造的下一代沙箱"
source: wechat
url: https://mp.weixin.qq.com/s/zN8FidEku-a8rZ-DohPveQ
ingest_date: 2026-07-04
vxc: 56
stars: 4
sha256: 19522b5c50c82fe14b44901b20f68cb2dbf76a83b3d49f82dc9b1f2d3271b773
---

# 阿里重磅开源！OpenSandbox：专为 AI Agent 打造的下一代沙箱

**来源**: 阿里技术

**发布日期**: 2026-01-29

**原文链接**: https://mp.weixin.qq.com/s/zN8FidEku-a8rZ-DohPveQ

---

这是 2026 年的第 2 篇文章

（ 本文阅读时间：15分钟 ）

01

当 AI 需要执行代码时，我们该怎么办？

想象这样一个日常开发场景： 你正在使用 Claude Code 帮你重构一段清理逻辑，或者让 Gemini 写个自动化脚本处理数据，甚至是一个 LangGraph 驱动的 Agent 正在你的指令下调用系统 API。

你满怀期待地按下运行键，但危险往往就在这一刻： 如果 AI 在处理路径时产生了一个逻辑偏移，将清理范围锁定在了根目录；或者它引入的一个第三方库，在安装瞬间静默扫描了你的
.ssh
目录。

AI 生成的代码是一把双刃剑。
直接在宿主机“裸奔”，无异于将系统权限交给一个可能随时“幻觉”的黑盒。资源隔离、环境依赖、权限越权 —— 这些都是 AI 能力落地到真实环境时绕不开的挑战。

今天，我们正式开源 OpenSandbox —— 一个面向 AI 应用场景设计的「通用沙箱平台」，为大模型相关的能力提供安全、可靠的执行环境。

02

什么是 OpenSandbox？

OpenSandbox 是阿里巴巴开源的通用沙箱基础设施，专门为 AI 应用场景设计。它为大模型相关的能力 —— 命令执行、文件操作、代码执行、浏览器操作、Agent 运行等提供：

- 多语言 SDK
  ：Python、Java/Kotlin、JavaScript/TypeScript；

- 企业级并发调度能力
  ：
  基于 Kubernetes 的池化加速方案；

- 统一沙箱协议
  ：基于 OpenAPI 的标准化接口；

- 灵活运行时
  ：Docker 和 Kubernetes 双支持；

- 丰富沙箱环境
  ：代码解释器、浏览器自动化、远程开发环境。

03

六大核心亮点

3.1 多语言 SDK，开发者友好

无论你使用 Python、Java、Kotlin 还是 JavaScript/TypeScript，OpenSandbox 都提供了统一的 API 设计，跨语言一致性让你无缝切换。

以下为Python SDK示例，更多语言SDK示例请参考github项目空间。

import asynciofrom datetime import timedelta  
from code_interpreter import CodeInterpreter, SupportedLanguagefrom opensandbox import Sandboxfrom opensandbox.models import WriteEntry  
async def main() -> None:    # 1. Create a sandbox    sandbox = await Sandbox.create(        "sandbox-registry.cn-zhangjiakou.cr.aliyuncs.com/opensandbox/code-interpreter:latest",        entrypoint= ["/opt/opensandbox/code-interpreter.sh"],        env={"PYTHON_VERSION": "3.11"},        timeout=timedelta(minutes=10),    )  
    async with sandbox:  
        # 2. Execute a shell command        execution = await sandbox.commands.run("echo 'Hello OpenSandbox!'")        print(execution.logs.stdout[0].text)  
        # 3. Write a file        await sandbox.files.write_files([            WriteEntry(path="/tmp/hello.txt", data="Hello World", mode=644)        ])  
        # 4. Read a file        content = await sandbox.files.read_file("/tmp/hello.txt")        print(f"Content: {content}") # Content: Hello World  
        # 5. Create a code interpreter        interpreter = await CodeInterpreter.create(sandbox)  
        # 6. 执行 Python 代码（单次执行：直接传 language）        result = await interpreter.codes.run(            """                  import sys                  print(sys.version)                  result = 2 + 2                  result              """,            language=SupportedLanguage.PYTHON,        )  
        print(result.result[0].text) # 4        print(result.logs.stdout[0].text) # 3.11.14  
    # 7. Cleanup the sandbox    await sandbox.kill()  
if __name__ == "__main__":    asyncio.run(main())

3.2 统一沙箱协议，开放可扩展

OpenSandbox 采用协议优先（Protocol-First）设计，所有交互都通过 OpenAPI 规范定义。这意味着：

- 你可以基于规范实现自己的运行时

- 不同语言 SDK 之间完全兼容

- 社区可以共建扩展能力

3.3 双运行时支持，灵活部署

自研的高性能 Kubernetes 沙箱调度器，支持大规模并发场景。

- 批量沙箱支持：通过 Kubernetes Operator 实现批量沙箱生命周期管理；

- 高性能调度：优化的调度算法，支持大规模并发创建和销毁。

3.4 沙箱粒度网络控制策略

{  "defaultAction": "deny",  "egress": [    {"action": "allow", "target": "api.openai.com"},    {"action": "allow", "target": ".pypi.org"},    {"action": "allow", "target": ".npmjs.org"}  ]}

3.5 开箱即用的沙箱流量入口代理

3.6 丰富的沙箱使用案例助你快速上手

04

典型企业应用场景

4.1 Alibaba Coding Agent

阿里巴巴内部的 Coding Agent 是 OpenSandbox 的核心应用场景之一。
作为企业级 AI 编程助手，它不仅需要高度隔离的独立沙箱，也对环境的拉起效率与
会话恢复能力
有着极致追求。

OpenSandbox 提供的 Code Interpreter 能力完美契合这些需求，让 Coding Agent 能够安全、高效地“动手”编写并验证代码。

4.2 Coding 产品评测环境

针对 Coding 产品的评测与验证，社区贡献了 Harbor 这一卓越的环境驱动框架。它通过对评测环境的高度
封装
，确保了测试过程的
一致性与可复现性
。针对复杂 Agent 评测中单机效率低下的痛点，Harbor 凭借出色的
工程化弹性伸缩能力
，能够调度成千上万个环境进行大规模并行测试。而 OpenSandbox 则作为
底层基础设施
，为这一高效评测流程提供了理想的沙箱环境与性能支撑。

4.3 Agentic RL 训练环境

强化学习（RL）训练 Agent 依赖高频的环境交互与海量的样本数据采集。

OpenSandbox 为
Agentic RL
构建了高性能的基础设施支撑：

- 极致并发与秒级响应
  ：通过资源池化与预创建机制，支持数千个沙箱并发运行，实现环境的秒级分配。

- 高效任务编排
  ：
  内置任务执行引擎，支持异构任务的灵活分发，确保每个沙箱可独立承担不同的训练指令。

- 强力状态隔离
  ：
  各训练环境互不干扰，确保样本数据的独立性与实验结果的可复现性。

- 弹性资源管理
  ：
  根据训练负载动态分配与回收资源，极大优化了集群整体的资源利用率。

目前，OpenSandbox 已在阿里巴巴大规模 Agentic RL 训练场景中得到实证，显著缩短了训练周期并提升了算力效率。

4.4 Remote Agent Sandbox

OpenSandbox 支持将 Claude Code、Gemini CLI 等 Agent 实例封装在远程沙箱中，通过将 Agent 行为“远程化”，解决本地环境配置复杂与安全合规问题：

环境隔离与沙箱化
：
通过远程部署实现 Agent 执行环境与宿主机的完全解耦，消除环境污染风险。

灵活的运行时预设
：
支持针对异构 Agent 定制专属运行时（Runtime），包括特定版本的编程语言环境与依赖包。

计算下沉与远程执行
：
核心代码执行逻辑下沉至云端沙箱，本地仅承载交互指令与结果渲染，实现轻量化办公。

05

开源与社区

OpenSandbox 遵循 Apache 2.0 开源协议，你可以自由地将其用于个人或商业项目。

我们正在积极建设社区，欢迎你：

🌟
给项目点个 Star

🐛
提交 Issue 反馈问题

💡
参与 Feature 讨论

🤝
贡献代码完善功能

GitHub 地址：
https://github.com/alibaba/OpenSandbox

微信扫码加入交流群

06

写在最后

AI 正在重塑软件开发的方式，而 OpenSandbox 致力于成为 AI 应用场景下最可靠的通用沙箱基础设施。

无论你是正在构建内部 AI 平台的企业技术团队，还是需要大规模沙箱调度能力的 SaaS 服务商，OpenSandbox 都能为你提供：

- 安全可靠的隔离环境；

- 灵活多变的部署方式；

- 完整的企业级能力；

- 开放可扩展的架构。

但我们深知，一个优秀的开源项目离不开社区的共建。

OpenSandbox 的未来，期待你的加入，让我们一起打造 AI 场景下的通用沙箱基础设施！

欢迎关注我们的 GitHub，获取最新动态！

欢迎留言一起参与讨论~
