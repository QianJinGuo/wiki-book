---
source_url: https://mp.weixin.qq.com/s/_ctmgcnt-G46bmrFmR2vZg
source: wechat
title: "从 Agent Flow 到 AI Native：为什么通用 Agent 是「饮鸩止渴」"
ingested: 2026-08-05
type: raw-article
tags: [agent-flow, ai-native, hardcode, orchestration, opinion, alibaba]
sha256: d5bc50db51af96a1a912d1e62f20313a54e38736f871b1e116aa97ca5a49feaf
---

# 从 Agent Flow 到 AI Native：为什么通用 Agent 是「饮鸩止渴」

> 作者：陈以强（阿里技术 公众号，2026-08-05 投喂；文末注明"个人技术思考，不代表公司官方立场"）

## 核心论点

通用 Agent（world agent）是"饮鸩止渴"——用户要的不是无所不能的超级智能助手，而是确定地、可靠地完成具体任务。作者自建 Agent Flow（开源项目 SymphLo: github.com/huisezhiyin/symphlo）作为替代方案。

## Agent Flow 是什么

传统 Flow 的强化版：核心不是让用户理解节点/连线/JSON，而是让用户用自然语言描述目标，LLM 理解目标、生成 Flow、修改 Flow、运行 Flow。Flow 降级为编排层（不管 Node 细节），只负责链路控制、任务下发和结果回收；具体任务由 Node 负责（QwenWork、Codex CLI、影刀 RPA、千牛接口、阿里内部运维 Agent 等）。

案例：电商用户汇总报表——QwenWork 取数 + 影刀 RPA 取数 + 千牛接口取数 → 汇总 → DWS 写钉钉文档 → 发钉钉群。以前写 Skill 几乎不可能在单任务 loop 跑通，Agent Flow 可无介入直接跑通。

设计哲学：把整条任务链路拆成合适的 Node，把任务"外包"给合适的 Agent Node，跳出单个 Agent，上升到编排层和控制层；**把 Agent 作为能力之一，而不是当成一切**。

## 最小任务单元理念

由于 LLM 输出概率性 + 上下文窗口有限，每次派发的任务最好是：具体上下文、工作量适中、可闭环确认结果的单元（最小混沌单元）。YAML/Flow/hardcode 是可靠的，纯自然语言不可靠；基于 YAML 的 Flow 自生成自维护，远比松散 Skill 简单高效。

通用 Agent 的困境：同一任务开两个对话可能用两种不同思路，一个成功一个失败。业界靠堆"记忆（Memory）"系统解决——但至今没有通用 Agent 敢说记忆系统能彻底解决问题。用户要的是最低认知负担、确定可靠地完成复杂任务。

## 用户为什么选择你的 Agent（两条）

1. **只有你能解决某些问题**：数据壁垒。爬虫/数据获取重新炙手可热——大模型没数据只是 Chatbot。"AI 前女友"案例：能做好的寥寥无几，因为很难拿到完整聊天记录。淘宝商品数据、钉钉聊天记录才是 Agent 最宝贵的财富。谁有真实高质量数据、能背靠核心产品和功能，谁就能做独一无二的 Agent。
2. **你真的能解决问题**：用户只关心"我的问题解决了吗"。RAG/MCP/Tool Calling/Multi-Agent/Agent Loop 对用户毫无意义。大部分客户真实需求只需三个有顺序的 LLM Call + 两个 API。Agent 核心不是架构/loop/harness，而是**用户是否愿意为它解决的问题付费**。

## Hardcode 是美丽的

过去排斥 hardcode 是惯性（人工写代码成本高，追求抽象/通用/平台化）。LLM 时代前提变了：**代码是廉价的**，代码维护者变成了 LLM，10 个 if else 比一大堆抽象工厂更容易被 LLM 理解。客户问题能用三个 LLM Call + 两个 API 解决就那样写；固定审批辅助链路就写死；客户付费要每周可靠报告就做可靠 Flow。

反面：问题没解决、客户没付费，先设计通用 Agent 平台（Loop/Memory/Harness/MCP/RAG），用户用不起来成本压不住——本末倒置。

## AI Native / LLM Native 的本质

AI Native = **基于 LLM，让 AI 解决用户的问题**。不是产品看起来有 AI，不是架构先进，不是让用户学 Agent/Loop/RAG/MCP。用户真的有问题、AI 真的解决得更轻松更可靠更便宜更自然，用户愿意继续用甚至付费，才是 AI Native。

现在很多是"旧系统贴 AI 皮"：旧框架旧流程只是某个环节多调一次 LLM、多塞一个聊天框。例：AI 搜索把 LLM 别扭地接入推荐系统是 LLM 套皮；OneRec（直接原生推荐大模型）才接近 LLM Native（作者非意在赞扬 OneRec，仅举例）。OneRec: arxiv.org/abs/2502.18965。

未来会出现"LLM 新生代"用户——用户不一定懂 loop/memory/RAG/MCP，但知道好不好用、靠不靠谱、值不值得付费。AI Native 产品 = 基于大模型对产品交互、业务流程、对客服务进行重塑。强硬态度"砍掉"所有挡路的东西，只保留一个念头：**用户的一句自然语言，到底能不能把这个任务完整跑通？**

## 程序员的自我修养（研发侧）

技术引入 LLM 的目的就是提效：干掉所有"挡路"的流程/审批/权限，用最好模型和 Code Agent 让 LLM 真正参与写代码、测试、发布链路。

作者放弃 WarRoom 研发助手项目的经历：日志系统需人工授权且无法 A2A、代码库需手动开权限、中间件无 AK/SK 管理、审批批不下来、外部模型无法访问内网——"每一步都在受阻"，人变成"人肉胶水"（Agent 说查日志我去点，说看权限我去申请，说验证结果我切后台截图复制喂回去）。**过去 20 年所有基建都是为"人类"设计的，不是 LLM friendly 的**。

Aone 团队把内部运维 Agent 做出来了：把日志/trace/代码直接喂给现成 Code Agent——证明只要基础设施对 LLM 足够友好，模型和 Agent 就能进研发现场修 bug 写需求。location 很重要：Power is like real estate — it's all about location。

## 组织架构：一千张 A4 纸叠起来依然是厚的

作者发现自己越来越像 Master Agent（持续接收任务→拆解分发→Sub-agent 执行）。当前组织架构和任务流对 LLM 极度不友好。扁平不是物理空间近，而是**组织的链路足够短**：需求沟通少一个转发人，原始内容清晰度多一倍。理想状态：每个人成为"超级自由人"，不被部门和权限限制，看到问题直接写代码提交推送部署并全权负责；任务分发点对点对接。

从 LLM-based 研发角度：把人做成"Agent"，把任务和交流变成 TCP/IP 协议——点对点、可靠、稳定、充分。当 Agent 能一次性拿到所有需要的上下文，任务就变成简单的 goal 模式。

## 总结

Agent 方向不是花里胡哨的技术名词和复杂通用架构，通用 Agent 都不是恰当目标。从用户问题出发，哪怕 hardcode、哪怕 if else、哪怕几个固定 LLM Call，只要帮用户在 LLM 洪流里更简单可靠地解决问题，就是 Good Agent。

## 关联
- SymphLo 项目：github.com/huisezhiyin/symphlo
- OneRec 论文：arxiv.org/abs/2502.18965
- 与 [[entities/agent-orchestration-multi-agent-systems|Agent 编排]]、[[entities/openspec-spec-driven-development-trae-solo|OpenSpec/SDD]] 理念互补：都强调"任务结构化 + 可靠执行"而非通用智能
