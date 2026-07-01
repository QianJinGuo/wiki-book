# TACO: Terminal Agent Context Compression Framework

## Ch04.494 TACO: Terminal Agent Context Compression Framework

> 📊 Level ⭐⭐ | 3.8KB | `entities/taco-terminal-agent-context-compression.md`

# TACO: Terminal Agent Context Compression Framework

TACO (Terminal Agent Compression) 是一个无需训练、即插即用的终端智能体自进化观测压缩框架，让 CLI Agent 在真实交互轨迹中学习 compression rules，在过滤低价值 terminal output 的同时保留关键行动线索。

## 核心问题

长程 CLI Agent 面临的瓶颈不是上下文窗口不够大，而是上下文在多轮交互中变得越来越"脏"。安装日志、编译输出、测试结果、构建 trace 等低价值环境反馈容易堆满上下文，淹没关键行动线索。

TerminalBench 2.0 的轨迹分析显示，在 Qwen3-Coder-480B、DeepSeek-V3.2 和 MiniMax-M2.5 的运行轨迹里，24.6%–44.1% 的 raw prompt 内容可被人工抽取为低价值冗余。

## 技术方案

TACO 的核心是一个轻量级的自进化规则引擎。所谓"规则"由触发条件、保留模式和剔除模式组成的函数，而非模糊的自然语言提示词。

三阶段闭环流转机制：

1. **Terminal Output Compression**: 根据当前任务的 active rules 对输出进行压缩。包含显式错误、异常、失败信号或关键诊断信息的输出采取保守策略，非关键重复性输出（安装进度、编译流水、下载日志等）通过规则过滤。

2. **Intra-Task Rule Set Evolution**: 当遇到当前规则无法处理的高输出命令时生成新的压缩规则加入 active rule set。后续重新请求完整输出、重复执行同一命令或表现出缺失信息的行为被视为 over-compression signal，降低相关规则使用并生成更保守的替代规则。

3. **Global Rule Pool Evolution**: 跨任务复用的压缩模式（如 pip install 下载进度、apt-get Unpacking/Setting up 行、git clone transfer progress、编译输出中的 error/warning/undefined reference 等）沉淀到 Global Rule Pool，后续任务启动时检索相关规则初始化 active rules。

## 实验结果

TACO 在 TerminalBench 1.0、TerminalBench 2.0 以及多个 terminal-related benchmark（SWE-Bench Lite、CompileBench、DevEval、CRUST-Bench）上同时提升了任务成功率和 token 效率。

在相同 token budget 下，TACO 在六个模型上都获得了更高准确率，证明终端观测压缩并非单纯节省上下文空间，过滤低价值输出后模型反而更容易关注任务相关信息。

## 实现资源

- arXiv: http://arxiv.org/abs/2604.19572
- GitHub: https://github.com/multimodal-art-projection/TACO
- Hugging Face: https://huggingface.co/papers/2604.19572

## 相关实体

- [Terminus CLI Agent](ch03/044-agent.md)
- [SWE-Bench](https://github.com/QianJinGuo/wiki/blob/main/entities/swe-bench-software-engineering-benchmark.md)
- [Context Compression Techniques](ch01/890-llm.md)
- [Autonomous Coding Agents](ch09/043-coding-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/taco-cli-agent-context-compression-terminalbench.md)

---

