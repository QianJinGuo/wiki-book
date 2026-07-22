---
sha256: ac9928d5365adeee23ed63d086f8408171117e74c0e5d99e1215d5596692c5da
title: "The Anatomy of an Agent Harness 解读"
source_url: "https://mp.weixin.qq.com/s/YYurQM9EUuyshuW20YAMJQ"
author: "技术极简主义"
publisher: "微信公众号 - 技术极简主义"
published_date: "2026-04-30"
ingested: "2026-04-30"
review_value: 7
review_confidence: 7
review_recommendation: "worth-reading"
review_stars: 3
type: raw
tags:
  - "agent-harness"
  - "langchain"
  - "context-management"
  - "filesystem"
  - "sandbox"
  - "ralph-loop"
  - "self-verification"
sources: []
created: 2026-05-10
updated: 2026-05-10
---
# The Anatomy of an Agent Harness 解读
> Source: https://mp.weixin.qq.com/s/YYurQM9EUuyshuW20YAMJQ
> 原文：LangChain《The Anatomy of an Agent Harness》
## 核心框架
**Agent = Model + Harness**
模型本身只是能力的来源，只有通过 Harness 把状态、工具调用、反馈循环和约束机制串起来，它才真正变成一个 Agent。
## 为什么需要 Harness
模型本质：输入 → 输出的函数。它本身不会：
- 在多轮交互中记住状态
- 执行代码
- 获取实时信息
- 操作环境
这些能力都在 Harness 里补。
## Harness 核心组件
### 1. 文件系统：持久化存储和上下文管理
文件系统是最基础的 Harness 原语。
有了文件系统后的能力：
- Agent 有了工作空间，可以读写数据、代码和文档
- 信息按需加载，不一股脑塞进上下文
- 中间结果落盘，状态跨会话保留
- 文件本身就是协作接口（人 + 多个 Agent 围绕同一份内容协同）
加上 Git 版本控制后：
- 记录每一步改动
- 出问题可以回滚
- 可以开分支做不同尝试
### 2. Bash + 代码执行：通用问题解决工具
固定工具列表的局限：你不可能穷举所有工具。
**解决方案**：提供 Bash + 代码执行能力。
- 模型可以自己写脚本解决问题
- 可以临时"造工具"
- 可以组合已有能力，拼出新工作流
本质：不再"设计工具列表"，而是提供通用执行环境。
### 3. 沙箱环境：安全执行与工作验证
沙箱解决两个核心问题：
- **安全性**：隔离执行环境，限制命令/禁用网络/控制权限
- **可扩展性**：按需创建环境，多任务并行执行，用完销毁
还需要合理的默认工具（语言运行时/Git/测试工具/浏览器），让 Agent 能观察工作结果。
### 4. 记忆与搜索：持续学习能力
**模型没有记忆**：知识只来自训练时的权重 + 当前上下文。
把新知识放进模型的方式：上下文注入。
**记忆文件机制**（如 AGENTS.md）：
- Agent 在运行中往里面写信息
- 下次启动时加载进上下文
- 跨会话积累经验（不改权重，但能做到经验积累）
**外部知识获取**：Web Search、Context7 等 MCP 工具——把模型"看不到"的信息拉进上下文。
## 对抗 Context Rot：智能压缩策略
Context Rot（上下文衰减）：
- 信息变多，但有效信息比例下降
- 关键线索被淹没
- 推理能力不稳定
**三种核心手段**：
### 1. 压缩（Compaction）
上下文快满时，对已有对话做总结，保留关键信息，把细节移出上下文。
### 2. 工具输出卸载（Tool Output Offloading）
- 只保留工具输出的开头 + 结尾（关键信号）
- 完整内容写入文件系统
- 需要时再读取
本质：不让"噪音"占据上下文。
### 3. 技能（Skills）与延迟加载（渐进式披露）
问题：Agent 启动时把所有工具说明/MCP 描述全部塞进上下文，还没干活就被污染。
解决方案：按需加载。
- 先给最小必要信息
- 需要某个能力时，再把相关内容引入
- Skills = 对工具和能力的"懒加载机制"
## 长期自主执行
### 核心问题
- 容易提前结束（还没做完就停了）
- 不擅长拆解复杂任务
- 跨多个上下文窗口后不连贯
### 解决方案叠加
#### Ralph 循环：防止"做一半就停"
- 拦截"我要结束"的信号
- 重新给一个干净上下文
- 继续朝目标推进
- 关键：上下文可以重置，但状态不能丢（文件系统是前提）
#### 规划（Planning）
- 把目标拆成步骤，写进文件
- 持续更新
- 每一步都有"参照物"，不容易偏离方向
#### 自我验证（Self-Verification）
- 每做完一步就检查：跑测试/看日志/检查输出
- 失败时把错误信息喂回模型继续修
形成闭环：执行 → 检查 → 反馈 → 修正
## 模型与 Harness 的共同进化
Claude Code 和 Codex 是模型和 Harness 同时演化的结果。训练过程中，模型不仅学习生成文本，还被训练去更好地使用 Harness 提供的工具和流程。
**反馈循环**：
1. Harness 提供原语和操作能力
2. 模型学习如何使用这些原语
3. 训练结果反馈回下一代模型
4. 模型在相同 Harness 环境中表现越来越好
**副作用**：模型可能对特定工具或逻辑"过拟合"，换了不同 Harness 环境性能可能下降。
**证据**：
- Terminal Bench 2.0：Claude Code 中 Opus 4.6 得分远低于其他 Harness 中的 Opus 4.6
- LangChain 通过优化 Harness（文档结构/验证回路/追踪系统），编码 Agent 排名从全球第 30 升到第 5，得分 52.8% → 66.5%
## 结语
Harness Engineering 仍然对构建高效 Agent 起关键作用，原因：
- Harness 不仅是弥补模型不足
- 它是设计系统的方式，让模型能更有效地完成任务
- 配置良好的环境/合适的工具/持久状态/验证循环，让任何模型都能发挥最大效率
**类比**：Harness 是舞台和幕后控制系统，Agent 是舞台上的演员。再出色的演员，没有舞台和规则也难以发挥全部能力。
## 参考来源
- LangChain Blog: "The Anatomy of an Agent Harness" (Vivek Trivedy)
  https://blog.langchain.com/the-anatomy-of-an-agent-harness