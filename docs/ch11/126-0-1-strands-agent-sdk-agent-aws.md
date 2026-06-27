# 从0到1:联想基于Strands Agent SDK的资源智能巡检Agent创新 | 亚马逊AWS官方博客

## Ch11.126 从0到1:联想基于Strands Agent SDK的资源智能巡检Agent创新 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 8.3KB | `entities/strands-agent-sdk-resource-intelligent-inspection-agent-innovation.md`

## 概述
从0到1:联想基于Strands Agent SDK的资源智能巡检Agent创新 by awschina on 21 11月 2025 in Industries Permalink Share 前言 数字化浪潮已推动企业从传统数据中心迁移至公有云平台，现在正经历着另一场巨大的技术变革，站在从数字化向智能化转型的巨浪上。这一转变不仅是技术升级，更是运维理念的根本变革。 AI技术的快速发展为运维转型提供了强大动力，使我们能够实现三个关键目标：从被动响应故障转向主动预测隐患；通过AI及时识别潜在风险；提升运维效率与准确性。对一线运维人员而言，这一转型意义重大。他们将从繁琐的日常巡检和例行维护等重复性工作中解放出来，转而专注于系统架构优化、性能调优等更具创造性和挑战性的任务。这使得他们能够充分发挥多年积累的专业经验，真正体现在处理复杂问题时的独特价值。 Lenovo运维巡检的挑战与智能化需求 在Lenovo的公有云运维团队，关注服务状态、预防潜在问题，这是确保系统稳定运行的关键日常工作之一。传统资源巡检方法依赖人工操作，存在明显局限性。这种方式不仅耗时费力，还容易出现疏漏，导致故障难以及时发现，严重时会影响业务连续性。随着云资源部署规模扩大，人工巡检也已经无法实现全面覆盖，而且公有云运维团队缺乏基于项目维度的巡检报告作为参考，这也使得难以评估各项目状态，智能化解决方案迫在眉睫。 AI Agent技术以及LLM能力的日渐成熟为解决这些挑战提供了新思路。Lenovo的创新中心团队需要发展智能化多Agent协作的智能运维系统来解决大量资源的日常巡检问题，基于私域知识和最佳实践处理复杂的业务报告生成需求，解决人工无法解决的问题。智能化转型既是技术升级，也是运维理念变革，这将确保Lenovo的公有云运维团队在云资源规模不断扩大的环境中保持高效可靠的IT运维能力，也是开发智能巡检助手的初衷。

## 核心技术
Strands Agent SDK、Amazon Bedrock、AgentCore、Amazon Nova、Nova Lite、Fine-tuning

## 深度分析
### 技术选型：为什么是Strands Agent SDK
Lenovo在技术选型时提出了三个核心需求：**上手快、复杂度低、功能完善**。Strands Agent SDK正好满足这三个要求。作为AWS开源的轻量级Agent开发框架，Strands采用**Agent Loop**设计理念——这一概念充分利用了LLM的原生推理、规划和工具选择能力，使得代码结构清晰易懂。对于需要快速迭代的企业级Agent项目，这种"模型能力驱动"的设计思路显著降低了开发门槛。
值得注意的优势包括：

- **多模型支持**：除Amazon Bedrock外，还支持Anthropic API、Llama API、Ollama、LiteLLM等
- **天然可扩展**：基于Agent Loop构建的系统新功能添加流畅
- **学习曲线平缓**：新开发者能快速掌握框架运作机制 

### 三层架构设计亮点
系统采用**UI层/用户接入层、网关层、业务层**的三层架构设计：
**UI层**由ALB作为流量入口，Nginx提供反向代理，Vue.js前端实现用户交互。**网关层**承担用户鉴权、Agent路由、会话管理（短期记忆）、FastAPI服务四大功能。**业务层**则包含两个核心Agent——公有云巡检助手（专注监控数据、配置、运维记录）和知识库助手（擅长AWS信息检索与内部知识提取）。
这种分层设计实现了关注点分离，便于独立演进和扩展

### 多Agent协作模式的价值
联想创新中心采用**多Agent协作**解决大量资源的日常巡检问题。这种模式的价值体现在：
1. **任务分解**：不同Agent专注不同领域（巡检 vs 知识检索）
2. **私域知识集成**：基于内部知识和最佳实践处理复杂业务需求
3. **人工无法解决的问题**：AI能够实现全面覆盖和及时风险识别
这代表了运维从"被动响应"向"主动预测"的根本转变

## 实践启示
1. **技术选型应优先考虑学习曲线和可扩展性**：Strands Agent SDK的Agent Loop模式降低了团队门槛，同时保持了扩展能力，这对于需要快速交付的企业项目非常重要
2. **分层架构是复杂Agent系统的基础**：UI层、网关层、业务层的分离使得各层可以独立优化，也便于后续功能扩展
3. **多Agent协作适合复杂巡检场景**：单一Agent难以处理所有巡检需求，按领域分解任务能显著提升效率和准确性
4. **智能化转型需要配套的组织变革**：技术升级需要配合运维理念更新，一线人员需要从重复性工作中解放出来专注于更高价值的工作
5. **基于项目维度的巡检报告是刚需**：Lenovo明确指出缺乏项目维度报告是痛点，这提示我们在构建类似系统时需要考虑多维度的报告能力

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/strands-agent-sdk-resource-intelligent-inspection-agent-innovation/)

## 相关实体
- [基于Strands Agents SDK和Amazon Bedrock AgentCore构建商品详情图广告词审查Agent | 亚马逊AWS官方博客](/ch11-078-基于-strands-agents-sdk-和-amazon-bedrock-agentcore-的商品广告图审查-ag/)
- [基于Strands SDK 构建的企业智能问数解决方案实践 | 亚马逊AWS官方博客](/ch11-158-基于strands-sdk-构建的企业智能问数解决方案实践-亚马逊aws官方博客/)
- [用 Strands Agents SDK 构建确定性数据分析：语义层 + VQR 在 Amazon Bedrock 上的实践 | 亚马逊AWS官方博客](/ch11-188-用-strands-agents-sdk-构建确定性数据分析-语义层-vqr-在-amazon-bedrock-上的/)
- [Cline releases open-source agent runtime SDK](/ch01-299-cline-releases-open-source-agent-runtime-sdk/)
- [CLI、MCP、API 选型：Agent 接入层决策指南](/ch07-053-cli系列④-选型cli-mcp还是api/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/5-ways-to-curb-ai-sprawl-without-stifling-innovation.md)

- [快时尚电商行业智能体设计思路与应用实践（五）借助 AgentCore Runtime 与 Bedrock 模型平台，轻松实现 Claude Agent SDK 的生产级部署 | 亚马逊AWS官方博客](/ch11-111-快时尚电商行业智能体设计思路与应用实践-五-借助-agentcore-runtime-与-bedrock-模型平台-轻松/)

---

