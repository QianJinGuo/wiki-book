# Lambda MicroVMs vs Bedrock AgentCore：AI Agent 开发者该怎么选？

## Ch11.266 Lambda MicroVMs vs Bedrock AgentCore：AI Agent 开发者该怎么选？

> 📊 Level ⭐⭐ | 2.5KB | `entities/lambda-microvms-vs-bedrock-agentcore-ai-agent-comparison.md`

# Lambda MicroVMs vs Bedrock AgentCore：AI Agent 开发者该怎么选？

# Lambda MicroVMs vs Bedrock AgentCore：AI Agent 开发者该怎么选？

摘要：2026 年 6 月，AWS 同时拥有了两个能”安全运行 AI 生成代码”的 Serverless 产品——Lambda MicroVMs 和 Bedrock AgentCore Runtime。它们底层都基于 Firecracker microVM，却处在完全不同的抽象层。本文从定位、架构、计费、适用场景等维度做深度对比，帮助 AI Agent 开发者和架构师做出正确选择。 目录 01 一、引言 02 二、定位差异：计算原语 vs Agent 框架 03 三、核心对比表 04 四、深入分析关键差异 05 五、选择决策指南 06 六、组合架构模式：Function + AgentCore + MicroVM 协作 07 七、计费对比：用具体场景算账 08 八、总结 一、引言 如果你在 2026 年构建 AI Agent，”如何安全执行 Agent 生成的代码”是一个绑不开的问题。Agent 会写 Python 脚本、调用 Shell 命令、修改文件系统——你不可能让它跑在你的业务进程里。 AWS 给出了两个答案： Lambda MicroVMs（2026 年 6 月 22 日发布）：一个全新的 Serverless 计算原语，让你用 Dockerfile 打包任意代码，运行在独立的 Firecracker VM 里，最长持续 8 小时。 Bedrock AgentCore Runtime（2025 年 8 月预览，2026 年 6 月 GA）：一个为 AI Agent 量身定制的托管运行时，内置 LLM 编排、Tool 调用、Memory、身份认证、代码解释器和浏览器沙箱。 两者底层都跑在 Firecracker microVM 上，都提供 VM 级隔离，都支持 8 小时运行时长——表面看它们很相似，但实际上它们解决的问题完全不同。 二、定位差异：计算原语 vs Agent 框架 理解这两个服务的最简单方式： Lambda MicroVMs 是”砖头”——它给你一台干净的、隔离的、有状态的小型虚拟机，你往里面放什么完全由你决定。它不知道什么是 LLM，不知道什么是 Tool Calling，不关心你跑的是 AI Agent 还是 CI Runne

## 相关实体

---

