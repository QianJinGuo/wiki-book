# 阿里云 Agentic Cloud

## Ch04.311 阿里云 Agentic Cloud

> 📊 Level ⭐⭐ | 8.3KB | `entities/alibaba-agentic-cloud.md`

# 阿里云 Agentic Cloud

阿里云在520峰会上发布 Agentic Cloud 战略，将整朵云按 Agent 需求重做，目标是让 Agent 成为云的一等公民。产品、API、计费、文档、官网全部围绕 Agent 重新设计。

## 四层架构

### 芯片层（平头哥）
- 真武 AI 芯片累计出货 56 万片
- 覆盖 20+ 行业、400+ 客户
- 30+ 车企智驾研发已上线
- 倚天 Arm CPU + 镇岳存储主控 + 磐脉 400G 网卡 → 芯云模一体化

### 基础设施层（Agentic Cloud）
两件事：
1. **Agent Infra**：任务级运行环境隔离 + 多 Agent 编排 + 任务级身份鉴权 + 多模态记忆存储
   - 关键转变：传统云=资源调度（稳态 QPS），Agent 云=任务调度（突发+长尾+高并发）
2. **Agentic Products**：56 款产品 Skill 化，Agent 可直接调用
   - 已落地：OSS Agent、StarOps、Dataworks Agent
   - 本质：把云产品接口重做一遍，从读文档/调 API → 任务级/交互式对话

### 模型层（千问 Qwen）
- Qwen3.7-Max：Arena 全球盲测总榜第一梯队，超越 Kimi-K2.6、DeepSeek-v4-pro、GLM-5.1
- Hugging Face 衍生模型破 20 万个，下载量过 10 亿次
- 全球开源模型采用率 53%，超越 Meta-Llama 和 Google-Gemma
- 主流编程 Agent（Cursor、Claude Code、Qwen Code、OpenCode、Cline）已全部支持 Qwen

### 平台层（百炼）
- 冷启动降低 90%+
- 每分钟拉起 10000 Pod
- SLA 4 个 9
- 四种计费形态：按 Token / PTU / MU / Batch API
- Prompt Caching：重复上下文计算降低 98%（Claude Code 场景）

## 千问云新官网
- 定位：AI 时代版 Stripe/Linear
- 200+ 主流模型 API（Qwen、GLM、Kimi、DeepSeek、Wan）
- 模型服务打包成 Skills 和 CLI → Agent 可直接调用
- 战略含义：阿里云公开承认"云的用户不再只是人"

## 商业模式重构

### 从卖 Token 到卖结果
| 维度 | 传统云 | Agentic Cloud |
|------|--------|--------------|
| 销售指标 | GPU 销量、客户迁移量 | 付费 Token 企业客户数、Agent 自主完成闭环比例 |
| 客户对象 | IT 负责人 | 董事长/CEO/业务负责人 |
| 定价 | 按资源/量 | 按 Token → 结果付费（演进中） |
| 组织 | 现有云销售团队 | 独立 MaaS 销售团队 |

### 财务表现（FY26 Q4）
- 云外部收入增速：40%
- AI 收入占比：首破 30%
- AI 产品收入：连续 11 季度三位数同比增长
- 年化 AI 收入：358 亿

## 关键洞察

1. **Agentic Cloud 本质**：云厂商从"卖计算资源"变成"卖 Agent 工作流能力"
2. **Skill 化是最大工作量**：56 款产品接口重做，比发新品难得多
3. **结果付费是终极形态**：但需技术成熟到一定程度才能实现
4. **Qwen 开源生态价值**：53% 全球采用率意味着大量第三方 Agent 默认接入，形成推理平台锁定

## 深度分析

### Agentic Cloud 的战略意图

阿里云发布 Agentic Cloud 战略，核心判断是**"云的用户不再只是人"**。这一判断意味着人机交互范式正在发生根本性转变——AI Agent 将替代人类成为云服务的主要消费者。对于云厂商而言，这意味着：

- **客户层级上移**：从 IT 负责人到 CEO/董事长，采购决策链路缩短但客单价提升
- **产品定义重构**：从资源型产品（VM、存储、网络）到能力型产品（任务执行、工作流编排）
- **竞争维度升维**：从价格竞争（GPU 实例价格战）到生态竞争（谁能承接最多 Agent 流量）

### Skill 化战略的关键意义

56 款产品 Skill 化是本次发布中最具技术深意的一环。传统云产品的使用门槛在于：人类需要理解 API 文档、掌握调用方式、处理错误异常。Skill 化后，Agent 可以用自然语言描述任务，系统自动解析意图、调用合适的产品组合、处理边界情况。这意味着云厂商从"提供工具"变成"提供完成任务的代理"。

### 千问开源生态的护城河

53% 的全球开源模型采用率意味着 Qwen 已经成为了 AI Agent 时代的"基础设施"之一。当主流编程 Agent（Cursor、Claude Code、Qwen Code 等）全部支持 Qwen 时，任何基于这些 Agent 的开发都会形成对阿里云推理平台的隐性依赖。这种锁定比任何商业合同都更牢固。

### 财务数据的战略密码

FY26 Q4 数据显示 AI 收入占比首破 30%、年化 AI 收入 358 亿，这些数字背后是阿里云对 AI 商业化的押注正在兑现。连续 11 季度三位数同比增长说明 AI 产品已经进入正循环——客户用得越多、留存越好、续费越高。云厂商从"增长放缓的传统业务"转向"高速增长的 AI 业务"，这是资本市场最希望看到的叙事。

## 实践启示

### 对于企业技术负责人

1. **重新评估云厂商选择标准**：不再只看价格和稳定性，要看 Agent 友好度——有多少产品支持 Skill 化？Agent 编排能力如何？
2. **关注 MaaS 团队能力**：阿里云已经独立 MaaS 销售团队，这意味着其 AI 产品服务能力正在专业化。企业采购时应该找对人、问对话。
3. **Prompt Caching 成本优化**：在 Claude Code 等编程场景中，重复上下文计算降低 98%，这意味着高频 Agent 场景下的成本结构正在发生巨变。

### 对于 AI 应用开发者

1. **优先接入千问生态**：53% 的开源采用率意味着主流模型生态已经形成。围绕 Qwen 开发的应用可以获得更好的互操作性和性能优化。
2. **利用百炼平台冷启动能力**：冷启动降低 90%+、每分钟 10000 Pod，这意味着可以低成本试错、快速验证想法。
3. **关注结果付费演进**：从按 Token 计费到按结果付费是行业趋势，提前理解这一商业模式的变化有助于在定价谈判中占据主动。

### 对于行业观察者

1. **盯着 Skill 化进度**：56 款产品 Skill 化只是开始，真正的考验是这些 Skill 是否真正可用、是否真正降低了 Agent 的使用门槛。
2. **观察结果付费落地**：阿里云声称要"从卖 Token 到卖结果"，但结果付费需要解决效果衡量、责任界定等难题。这一模式能否真正落地是判断 Agentic Cloud 成败的关键。
3. **关注 Qwen 开源生态的持续性**：20 万个衍生模型、10 亿次下载，这些数字的增长或停滞可以反映阿里云在开源社区的真正影响力。

## 相关实体
- [Oz Multi Harness Cloud Agent Orchestration](ch03/044-agent.md)
- [看 Agentrun 如何玩转记忆存储最佳实践来了](ch03/044-agent.md)
- [Cong Anthropic Dao Googleagent Skills Zhengzai Jinru Sheji Moshi Jieduan](ch04/245-skill.md)
- [Agent 从能用到管好中间差了什么](ch03/044-agent.md)
- [从 Anthropic 到 Googleagent Skills 正在进入设计模式阶段](ch04/245-skill.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/alibaba-agentic-cloud.md)

---

