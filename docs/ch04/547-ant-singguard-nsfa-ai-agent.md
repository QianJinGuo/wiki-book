# Ant SingGuard-NSFA: 蚂蚁开源AI Agent安全双模推理护栏框架

## Ch04.547 Ant SingGuard-NSFA: 蚂蚁开源AI Agent安全双模推理护栏框架

> 📊 Level ⭐⭐ | 4.4KB | `entities/ant-singguard-nsfa-agent-security-2026.md`

# Ant SingGuard-NSFA: 蚂蚁开源AI Agent安全双模推理护栏框架

> **Background**: 本文基于量子位对蚂蚁开源 AI 安全框架的报道建立。该框架包括面向智能体行为的 SingGuard-NSFA 和面向多模态大模型安全的 SingGuard 两个组件。

## 概述

2026年7月，蚂蚁集团开源了两套AI安全框架：**SingGuard-NSFA**（智能体安全）和 **SingGuard**（多模态安全），旨在将AI安全的焦点从传统的"内容审核"转向"行为安全"。

这一开源背景是Claude Code和OpenClaw等Agent产品屡屡曝出安全漏洞（后门隐患、高危险漏洞），行业意识到单靠打补丁无法应对持续演变的风险。

## SingGuard-NSFA: 智能体行为安全护栏

SingGuard-NSFA提供0.8B、2B、4B、9B四个尺寸，核心设计理念是将安全检查**前置到智能体执行之前**，在请求拦截和响应兜底两端同时设卡。

### 风险分类体系

以经典的CIA三元组（机密性、完整性、可用性）为理论底座，结合三份OWASP大模型与智能体安全指南的实践经验，拆解智能体可能出现的风险。

### 双模推理机制

框架采用两种模式同步进行风险拦截：

- **生成式模式**：逐条输出基于NSFA定义的链式推理分析，使每一步判断都有据可查，适用于离线合规审计
- **判别式模式**：每次前向传播直接给出各风险域的置信度，延迟可压到45-57ms，适用于高吞吐实时在线拦截

### 原生可扩展设计

骨干网络冻结，真正下判断的是外挂在上面的轻量分类头。出现新风险时只需补训一个小头，实现原生可扩展。可作为插件使用——为Llama Guard 3额外增加一个分类头后，用户请求安全基准的F1值直接提升17.6个百分点。

### 评测表现

在3大评测基准（用户请求安全、模型响应安全、跨数据集泛化）上均取得SOTA。最小的0.8B模型就能比肩8B竞品，9B尺寸在泛化上达到91.29% F1，精度与召回更加均衡。

## SingGuard: 多模态安全框架

面向多模态大模型，同样包括0.8B、2B、4B、8B四个尺寸。最大特点是把安全规则做成**运行时输入**——不同业务域可以现场下发各自的红线，模型据此逐条判定。

推理侧采用**快慢分工**：快思考负责低延迟秒判，慢思考负责逐规则深度推理，两者之间通过early exit自动切换。针对线上多条规则并行审核的效率瓶颈，提出RI-Mask让共享的图文上下文只编码一次，多条规则并行判断，多模态推理最高可提速5倍以上。

## 蚂蚁AI安全体系脉络

蚂蚁在AI安全上的布局逐步形成体系：从漏洞挖掘（发现多个OpenClaw高危漏洞），到场景化解法（与清华联合开源ClawAegis），再到可复用的底层框架。其智能体安全产品已通过信通院泰尔实验室最高等级评级。

## 相关实体

- [Agent安全三步序列](../ch05/018-harness.html)
- [AI Agent安全综述](ch04/030-ai-agent.html)
- [AI工具投毒漏洞](ch04/432-ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-s.html)
- [Claude Code Trojan](../ch01/331-anthropic-claude-code.html)
- [OpenClaw架构](../ch03/046-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-security-ant-singguard-nsfa-2026.md)

---

