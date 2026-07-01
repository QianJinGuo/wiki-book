# AutoClaw 使用体验：自带 66 个 Skill、可接入聊天工具、安全性高

## Ch04.264 AutoClaw 使用体验：自带 66 个 Skill、可接入聊天工具、安全性高

> 📊 Level ⭐⭐ | 9.4KB | `entities/autoclaw-使用体验自带-66-个-skill可接入聊天工具安全性高.md`

## 摘要
AutoClaw 是智谱推出的 OpenClaw 本地客户端，旨在降低 AI Agent 的使用门槛。用户只需 1 分钟即可在本地电脑安装完整的 OpenClaw 环境，自带 66 个内置 Skill，支持接入飞书等办公协作工具，数据全程留在本地，安全性高。相比云端方案，AutoClaw 在启动成本、响应速度、数据安全和模型自由度方面具有明显优势。

## 核心要点
- **零门槛安装**：下载客户端 → 注册登录 → 选择模型，1 分钟完成安装^
- **66 个内置 Skill**：覆盖大多数日常办公和创作需求^
- **多模型支持**：智谱 GLM/ Pony2、DeepSeek、Kimi、MiniMax、Google Banana2 等^
- **飞书接入**：支持一键自动配置（Mac）或手动配置（Windows），可将 Agent 拉入群聊协作^
- **本地优先**：数据不出本机，能力不降级，成本可控^

## 安装与配置
AutoClaw 提供极简安装流程：
1. 下载客户端并注册登录
2. 点击快速配置，选择内置模型直接使用
3. 如有自有 API，可在偏好设置中填入（支持 GLM、DeepSeek、Kimi、MiniMax）
对于已安装过 OpenClaw 的用户，AutoClaw 提供配置迁移功能，自动完成环境迁移。登录后会显示风险警示，建议认真阅读——OpenClaw 本身存在一定安全风险，但只要管控到位影响可控。

## 内置 Skill 与扩展机制
AutoClaw 内置 **66 个 Skill**，基本覆盖普通用户的日常需求。用户还可以安装外部 Skill（如 baoyu-skills 用于生成文章配图），安装过程极为简单——直接告诉 AutoClaw 帮忙安装即可。
支持的 Skill 安装来源包括 GitHub 上的社区 Skill 仓库，安装后在 `/.agent/skills` 目录中可见。

## 飞书接入
AutoClaw 支持接入飞书（Feishu/Lark），提供两种配置方式：
**一键配置（仅 Mac）**：点击开启自动配置后，AutoClaw 会自动打开浏览器并操控完成自动化安装，用户只需扫码登录。
**手动配置（Windows/Mac）**：需在飞书开放平台创建应用，获取机器人 ID 和 Secret，按步骤配置权限、事件回调，并等待管理员审批。
接入完成后，用户可在飞书群聊中与 AutoClaw 对话，支持查询新闻、创建 PPT、设置定时提醒等功能。

## 深度分析
### 1. 降低 Agent 门槛的战略意义
AutoClaw 的核心价值不在于技术突破，而在于**门槛消除**。OpenClaw 虽有 300K GitHub Stars，但实际使用率远低于关注量——高门槛挡住了 99% 的潜在用户。智谱选择做"人人都能养的龙虾"，本质上是抢占 Agent 普及化的先机。
 
### 2. 本地 vs 云端：两条不同的 Agent 路线
云端方案（腾讯云、KimiClaw 等）采用"共享工位"模式——Agent 托管在远程服务器，用户通过网络访问。这种模式的问题是：

- 需付费租用，按月计费
- 响应速度依赖服务器负载和网络状况
- 数据经过第三方，存在隐私风险
- 通常绑定平台指定模型，缺乏灵活性
AutoClaw 的本地方案则将 Agent 直接运行在用户本机，优势在于秒级响应、数据不出门、模型任意选、长期成本可控。
 
### 3. Skill 生态是竞争关键
66 个内置 Skill 解决了"从 0 到 1"的问题，但要留住用户，关键在 Skill 生态的丰富度。AutoClaw 支持外部 Skill 安装，但目前社区 Skill 数量和质量尚需积累。长期来看，Skill 市场的丰富程度将决定 AutoClaw 能否从"尝鲜工具"进化为"日常助手"。
 
### 4. 多模型支持的战略眼光
AutoClaw 不绑定单一模型，支持 GLM、DeepSeek、Kimi、MiniMax、Google Banana2 等多种选择。这种灵活性对于用户而言降低了厂商锁定风险，也满足了不同场景下的需求——例如图片生成任务可用 Google Banana2，中文对话可用智谱 GLM-5 或 Pony2。
 
### 5. 安全与管控的平衡
文章提到 OpenClaw 存在安全风险，需"管控到位"。智谱在 AutoClaw 中加入了风险警示、配置迁移安全检查等机制。这种主动告知的策略，一方面体现了对安全的重视，另一方面也为用户提供了心理预期的校准。
 
## 实践启示
### 1. 选型建议
- **优先选择 AutoClaw 的场景**：个人用户、小团队、对数据隐私有顾虑的组织
- **仍选云端方案的场景**：缺乏本地算力、需要 7×24 小时后台运行、技术运维能力不足的企业

### 2. 快速上手路径
1. 从 [autoglm.zhipuai.cn/autoclaw](https://autoglm.zhipuai.cn/autoclaw) 下载安装
2. 使用智谱内置模型（Pony2 或 GLM-5）快速体验
3. 根据需要接入飞书，测试群聊协作场景
4. 探索内置 Skill 清单，找到适合自己工作流的组合

### 3. 安全使用建议
- 首次使用前认真阅读风险警示
- 对敏感数据操作时，确认 Agent 无权限访问无关内容
- 定期检查 `/.agent/skills` 目录，确保无未知 Skill 被安装

### 4. 效率提升技巧
- 图片生成任务：切换 Google Banana2 模型效果更佳（直接告诉 AutoClaw 配置即可）
- 定时提醒：使用自然语言直接创建，如"下午三点提醒我开会"
- PPT 创建：结合最新新闻，让 AutoClaw 自动生成内容后自行校对时间准确性

### 5. 关注演进方向
AutoClaw 目前仍处于早期阶段，建议持续关注：

- Skill 生态的丰富度（社区 Skill 数量和质量）
- Windows 版一键配置功能的完善
- 更多办公工具（钉钉、企业微信）的接入支持

## 相关实体
- [Coding Harness 工程本质](https://github.com/QianJinGuo/wiki/blob/main/concepts/coding-harness-engineering.md)
- [Hermes Agent 记忆系统深度拆解](ch03/044-agent.md)

- [语音输入喊了这么多年，千问电脑版一出手就把键盘卷没了？](https://github.com/QianJinGuo/wiki/blob/main/entities/语音输入喊了这么多年千问电脑版一出手就把键盘卷没了.md)
- [特斯拉百万年薪招数据标注员，朝九晚五，无需AI经验](ch04/150-ai.md)
- [我给Hermes配了4个Agent，真正有用的是这些事](ch03/044-agent.md)
- [AIAIGC峰会嘉宾阵容](ch04/150-ai.md)
- [Hermes Agent vs OpenClaw 对比分析](ch03/044-agent.md)
- [OpenClaw 完全指南：这可能是全网最新最全的系统化教程了！（3.2W字，建议收藏）](ch11/210-openclaw.md)
- [OpenCLAW 完全指南](ch11/210-openclaw.md)
- [OpenClaw Agent 可观测性体系 — Session 审计日志 + OTEL + SLS](ch03/044-agent.md)
- [IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群](ch03/074-claude-code.md)
- [Agent 上下文窗口管理对比](https://github.com/QianJinGuo/wiki/blob/main/entities/context-window-management.md)
- [Agent 可靠性的工程解法：从 Skillify 看持续改进机制](ch04/245-skill.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)

---

