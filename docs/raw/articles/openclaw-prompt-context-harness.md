---
title: openclaw-prompt-context-harness
source_url: https://mp.weixin.qq.com/s/JycTfNd7EnmWCnJK-QCf0Q
publish_date: 2026-04-25
tags: [wechat, article, agent, harness, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: f2153003f9ea4d71b0cd6a0ccc7856c63acbab5a53b03be4409d85d3f1cd0463
---
深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践
原创 飞樰 阿里云开发者
2026年4月13日 08:30 浙江
本文核心思路是从Prompt、Context和Harness三个维度展开，分析OpenClaw的设计思路，提炼可复用的方法论。
【背景】
OpenClaw将近年来Agent发展的关键技术进行系统性集成：Prompt动态组装、Context压缩机制、Memory管理、Agent Skills模块化复用和渐进式披露、Hook机制、Guardrail设计、Computer Use。
Prompt Engineering → Context Engineering → Harness Engineering是现代AI系统三大关键阶段：分别聚焦"如何说"、"让AI看什么"、"构建怎样的运行环境"。
【Prompt Engineering：动态组装与文件驱动】
System Prompt由buildAgentSystemPrompt()函数构建，接收几十个参数，按固定顺序将模块像搭积木一样拼在一起。
三种提示词模式：
- full（完整模式）：主Agent直接对话，所有模块全加载
- minimal（精简模式）：子Agent执行独立任务，只保留核心模块
- none（极简模式）：只有一行身份标识
System Prompt的23个组装模块：
1. 身份标识 [永远存在]
2. 工具清单 [full/minimal]
3. 工具调用风格 [full]
4. 安全准则 [full]
5. OpenClaw CLI操作指令 [full]
6. 技能（Agent Skills）—— 条件加载
7. 记忆召回 —— 条件加载
8. 自更新管理
9. 模型别名
10. 工作区信息（Workspace）
11. 参考文档
12. 沙箱（Sandbox）
13. 授权发送者
14. 时间信息
15. Workspace的文件注入
16. 回复标签
17. 消息系统
18. 语音合成（Voice/TTS）
19. 群聊回复
20. 推理格式（Reasoning）
21. 静默回复
22. 心跳机制（Heartbeats）
23. 运行时信息（Runtime）
六个核心.md文件构成Agent的"灵魂"与"骨架"：
- AGENTS.md（总纲）：Agent运行的核心规范要求
- SOUL.md（灵魂）：人格特质、性格倾向、说话风格
- IDENTITY.md（身份信息）：名字、类型、头像风格
- USER.md（主人档案）：用户个性化信息
- TOOLS.md（工具清单）：可用工具及使用说明
- HEARTBEAT.md（心跳任务）：定时任务逻辑
- BOOTSTRAP.md（首次启动）：引导对话，完成后自动删除
- MEMORY.md（长期记忆）：跨会话持久记忆
【Context Engineering：扩展、压缩和记忆】
三大核心：可扩展的Agent Skills机制、动态上下文压缩与修剪、分层记忆存储系统。
可扩展Skills机制：
Skill采用渐进式披露（Progressive Disclosure）：默认只注入名称和描述，任务需要时才读取对应SKILL.md。通过ClawHub市场获取第三方Skill包。
上下文压缩（Compaction）：
- 手动触发：/compact命令
- 自动触发：token用量 > 上下文窗口大小 - 预留空间时自动触发
- 自适应分块：BASE_CHUNK_RATIO=0.4, MIN_CHUNK_RATIO=0.15, SAFETY_MARGIN=1.2
- 摘要分层三函数：summarizeInStages() → summarizeChunks() → summarizeWithFallback()
修剪（Pruning）：
- 头尾保留，中间省略（Exception/Error/Traceback在首尾）
- 裁剪比例不超过50%
- KV Cache时间窗口优化
Memory双层管理：
- 长期记忆（MEMORY.md）：高价值持久事实，每次新对话注入System Prompt，截断到200行
- 每日记忆（memory/日期.md）：低频日常交互，BM25+向量双路召回
- 时间衰减公式：衰减系数 = e^(-λ × 天数), λ=ln(2)/30, 30天衰减为50%
【Harness Engineering：约束与引导控制】
核心使命：确保模型"可控地做（How Controlled）"。
Workflow vs Harness本质区别：
- Workflow：主导权在"人"，大模型是执行者，固定执行路径
- Harness：主导权在"AI大模型"，Harness只是辅助约束
OpenClaw的Harness实践：
全生命周期Hook钩子机制：
- before_prompt_build：构建提示词之前
- before_tool_call：执行工具之前，拦截或修改工具参数
- after_tool_call：工具执行之后
- before_compaction / after_compaction：上下文压缩前后
- message_received / message_sending：消息收发声
实战：参数校验与自动纠错
- before_tool_call阶段通过Hook脚本做参数校验
- 正则表达式拦截错误格式，迫使模型重新发起tool_call修正参数
安全沙箱护栏机制（三层纵深防御）：
第一层：文件系统沙箱——严格限制Workspace访问范围
第二层：命令执行沙箱——Security模式白名单+Ask模式人工确认+safeBins豁免名单
第三层：网络访问沙箱——白名单域名控制+防泄露机制
防注入攻击、防越权调用、防敏感泄露、防恶意篡改。
强约束执行与人工干预：
- HEARTBEAT.md心跳机制：强制模型定期完成任务
- BOOTSTRAP.md启动脚本：强制完成身份确认和环境检查
- 人在环路（Human-in-the-Loop）：高风险操作时暂停等待人工指令
总结：学习OpenClaw的终极目的不是跟风"养虾"，而是透过现象看本质，理解设计哲学背后的核心原因，迁移应用到我们自己的业务系统中。