---
source: https://mp.weixin.qq.com/s/qehsKZfTs2WDggV80BkGfg
title: "AReaL 2.0：面向自演进 Agent 的在线强化学习系统"
author: 机器之心
source_account: 机器之心
created: 2026-07-02
fetched: 2026-07-02
sha256: 72f04c62aef49da051fd7290fe6d360537507d5c6505601b8a50db64d7c0a715
---

AReaL 2.0 由蚂蚁集团 + 香港科技大学 + 清华大学联合推出，面向真实部署中 Agent 的在线强化学习训练基础设施。

## 自演进 Agent 的三根支柱

### ATDP（Agent Trajectory Data Protocol）
面向学习的智能体轨迹协议。以步骤为单位记录完整决策过程：Agent 观察到的状态、内部 Harness 状态、选择的动作与结果、奖励/反馈到达时间、模型版本、工具版本、租户、成本、权限、治理状态等元数据。一次复杂任务被拆分为可追责、可回放、可归因的学习样本。

### Agentic Data Proxy
部署在 Agent 与模型/工具/检索/记忆/人类反馈等关键边界上的学习数据层。负责拦截、采集、脱敏、权限控制、轨迹持久化、奖励收集和回放管理。数据进入训练队列前治理先完成——哪些字段可见/脱敏、哪些轨迹具备训练资格、哪些只用于审计。

### Agent Evolution Control Plane
把「是否更新、更新哪里」变成可治理的系统性决策。根据轨迹统计、用户修正率、工具失败簇、评估器得分、成本信号、安全约束和分布漂移，判断演进应落在哪个层面（记忆/tool schema/Harness/策略模型）。每一次更新须经过回放评估、离线回归测试、租户级安全检查、灰度发布和版本化追踪。

## 工程架构：Online RL 微服务化

AReaL 2.0 将 RL 基础设施拆分为可组合的服务组件：

**Gateway**：链路入口，支持 HTTP/WebSocket 和 OpenResponses bridge（/v1/responses 兼容）。

**Router**：维护 session 与 Data Proxy 的绑定关系，确保同一会话持续落到对应后端，支持横向扩展。

**Data Proxy**：会话状态和轨迹管理。在推理服务中记录轨迹，在训练服务中提供训练数据。把普通 Agent 调用整理成可被训练系统消费的经验轨迹。

**Agent-Compute Worker**：接收 AgentRunnable 协议请求，每次调用对应一轮执行。在推理服务中实例化 SGLang/vLLM 等后端；在训练服务中使用 Megatron/FSDP。

**Controller**：调度组件，启动 guard worker，管理扩容/缩容/流量排空/健康检查。

## 实践案例

### Hermes Agent 接入
将标准推理后端替换为 AReaL 2.0 管理的 Agent-Compute Worker，即可将真实交互纳入 RL 闭环，无需重写规划逻辑、工具调用、沙箱或记忆模块。

### Claude Code SWE 训练
- 数据筛选：只保留至少有一个外部模型能解出的问题
- Agent Infra：基于大规模并发 sandbox + 分布式调度 + 毫秒级 fork 启动 + 镜像预热
- 算法：KPop 稳定化策略，token 级自适应过滤 logp diff
- 防 reward hacking：禁用部分 git 操作
- 效果：800 步训练后稳定涨分

## 开源生态

AReaL 已从蚂蚁 inclusionAI 孵化成为独立社区并加入 PyTorch Foundation Ecosystem 项目。华为云提供昇腾 NPU 端到端适配，MindLab 提供 LoRA 低算力方案。

参考链接：
- 论文：https://arxiv.org/pdf/2607.01120
- GitHub：https://github.com/areal-project/AReaL
- Hermes 范例：https://github.com/areal-project/AReaL/tree/main/examples/hermes
- SWE 范例：https://github.com/areal-project/AReaL/tree/main/examples/swe
