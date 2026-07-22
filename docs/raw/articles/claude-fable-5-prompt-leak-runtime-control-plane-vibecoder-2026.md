---
title: "Claude Fable 5 提示词泄漏：安全工程露出了底牌"
source: wechat-mp
source_url: https://mp.weixin.qq.com/s/vsvqHXCBHWJJFRDOviIj2w
author: VibeCoder (Vibe编码)
published: 2026-06-12
ingested: 2026-06-12
type: article-summary
tags: [claude-fable-5, mythos-5, prompt-leak, cl4r1t4s, runtime-control-plane, attack-surface, mcp, agent-security, harness-security, prompt-engineering, system-prompt]
sha256: 96dfda14dec99ca2376611fc0094e1a806b487412f6cef5384b2859fbed711b9
---

# Claude Fable 5 提示词泄漏 (VibeCoder / Vibe编码)

## 一、事件背景

2026-06-09 Anthropic 发布 **Claude Fable 5** + **Mythos 5**（Mythos-class）。几天后，**CL4R1T4S 仓库**出现 `CLAUDE-FABLE-5.md`，**1585 行 / 120,040 字符**。第三方媒体（Pliny the Liberator）声称绕过了 Fable 5 安全分类器。本文章不评价截图真伪，专注**这份提示词为什么变成高价值目标**。

## 二、Fable 5 安全结构（官方设计）

- **Fable 5** = 面向一般用户版本
- **Mythos 5** = 同底层模型，高风险领域限制更少，只给受信组织
- **新安全分类器**：高风险主题触发拒绝 / 转交低风险配置
- **API 拒答**：可以 HTTP 200 返回，`stop_reason=refusal`
- **开发者必须处理**：新 refusal + fallback + billing 逻辑

## 三、CLAUDE-FABLE-5.md 6 层架构

把 1585 行提示词翻成中文，是一套**分层产品运行时控制平面**：

### 第 1 层：行为宪法

- Claude 自我介绍规则
- Fable vs Mythos 产品差异处理
- 何时搜索官方文档
- 高风险场景拒答口径：网络安全 / 恶意代码 / 有害物质 / 违禁药物具体用法 / 法律金融 / 心理健康 / 自伤 / 饮食失调 / 政治争议 / 用户批评

### 第 2 层：产品说明

- Claude Code / Claude Cowork / Claude in Chrome / Claude in Excel / Claude in PowerPoint
- 回答产品问题时携带官方口径

### 第 3 层：能力系统

- **Memory system**：用户记忆存在性
- **Artifact 持久化存储**：键值存储 / 个人 vs 共享数据 / key 限制 / 失败处理
- **Claude 不只回答问题，也能生成有状态小应用**

### 第 4 层：computer use

- 创建文件 / 写代码 / 做文档 / 做幻灯片 / 处理 PDF/表格 前**先读对应 SKILL.md**
- 真实文件 vs 对话回答 vs 交付物的判定

### 第 5 层：搜索与版权

- 近期事件 / 陌生产品 / 当前职位 / 价格 / 天气 / 体育 / 法律政策 / 版本信息 → **先搜索**
- 限制长引用 → 用自己的话转述
- 安全规则也管搜索：不能帮用户定位危险信息源

### 第 6 层：工具和环境

- **完整工具 schema**：bash / web search / web fetch / 文件创建 / 地图 / 消息撰写 / 天气 / 体育 / MCP registry / 连接器推荐
- 环境配置：当前日期 / 用户位置占位符 / 可用 skills / **网络白名单** / **只读目录**

## 四、10 大设计亮点

1. Fable / Mythos 差异 = **产品口径**
2. 高风险拒答：**不能因为公开可得就放行**
3. 搜索规则按"**信息是否会变**"决策
4. **Artifact 有持久化存储**
5. **MCP 推荐带用户 opt-in**（商业边界：用户点名 connector 处理 / 第三方消费 app 让用户确认选择）
6. **Skills 要先读再执行**
7. 文件产物有独立工作流
8. 版权规则嵌入搜索和生成流程
9. **完整工具 schema 进入上下文**
10. **网络和目录边界显式可见**

## 五、核心论点：Prompt 不能继续当保险箱

### 5.1 风险判断应拉到工作流层

**能写进 prompt 的** = 用户体验规则（语气 / 格式 / 解释方式 / 工具最小说明 / 错误沟通）

**应放在服务端策略层的** = 高风险分类 / 权限判定 / 工具授权 / 用户数据边界 / fallback 路由 / 内部策略开关

> "prompt 可以告诉模型如何礼貌地说不。真正决定能不能做、能不能调用工具、能不能访问数据，应该由模型外侧的系统来判定。"

### 5.2 攻击面像系统（不是文本）

| 模型能力 | 攻击边界 | 风险类型 |
|----------|----------|----------|
| 只能聊天 | 文本输出 | 内容风险 |
| 搜索 + 读写文件 + bash + artifact + MCP + 外部 app | **动作** | **系统风险** |

**MCP 联网 → SaaS 权限系统**：
- 推荐连接器 / 选择供应商 / 读取用户数据 / 执行第三方动作 → **不能只靠模型自觉**

### 5.3 分类器要处理组合风险

攻击者**把危险意图拆成低风险问题**：
- 上下文埋进长文档
- 目标伪装成小说 / 课程 / 论文 / 测试题
- 多个模型 / Agent 串起来

**每一步不一定触发分类器，最终输出可能越界。**

**分类器需要从单点判断 → 状态判断**：
- 跨轮意图
- 工具调用链
- 生成产物
- 用户反复试探的轨迹
- **任务级别预算 + 中断机制**：发现偏离合法研究 / 合法防御时停止继续提供细节

### 5.4 分层（不是全封）

- 普通解释 → 给
- 防御建议 → 给
- 检测和加固 → 给
- **可执行攻击 / 武器化步骤 / 违禁合成 / 绕过安全系统的操作细节** → 挡在模型外侧

## 六、3 个开发者判断

### 6.1 系统提示词会越来越像基础设施配置

- 过去：泄漏 prompt = 看角色人设和口癖
- 现在：泄漏 prompt = **产品能力 + 工具协议 + 权限设计 + 安全策略**
- 已经接近**架构文档**

### 6.2 Agent 安全会从模型层挪到 harness 层

模型拒答只是一环，**真正要管的**：
- 执行环境
- 工具权限
- 上下文压缩
- 日志审计
- 回滚恢复
- 连接器授权
- 服务端策略

### 6.3 红队实验要讲决策价值

看到一种绕过方式 ≠ 穷举 100 种变体。**更好的实验问题**：
- 这类绕过说明**分类器要改**还是**工具权限要改**？
- 说明 prompt 需要**移出敏感规则**还是需要**跨轮风险聚合**？
- 如果某组实验只是在重复确认"还能绕"，**边际信息就很低**

## 七、对 Agent 设计的核心原则

> "以后所有 system prompt、AGENTS.md、skill、tool schema，**都应该按会被公开来写**。**能公开的放进去，不能公开的搬到服务端**。模型可以参与决策，但**不要让模型单独保管边界**。"

**8 个具体动作**：
1. Agent 提示词 / AGENTS.md / skills / 工具 schema → **不要放秘密**
2. 工具按最小权限设计（能只读就只读 / 限制目录 / 用户确认 / 危险动作进 sandbox）
3. 日志记录：模型为什么调工具 / 工具返回什么 / 哪些上下文被带进下一轮
4. MCP 联网 → 按 SaaS 权限系统设计
5. 风险判断放到**工作流层**（请求 + 历史 + 工具输出 + 计划 + 产物 = 同一条审计链）
6. 分类器从**单点 → 状态**（跨轮 + 工具链 + 产物 + 试探轨迹）
7. 任务级别预算 + 中断机制
8. 分层放行（普通解释给 / 防御给 / 攻击细节挡）

## 八、引用源

- 原文：https://mp.weixin.qq.com/s/vsvqHXCBHWJJFRDOviIj2w
- 关联：[[raw/articles/claude-fable-5-and-new-ai-safety-fables|Claude Fable 5 安全寓言 (Nathan Lambert)]]
- 关联：[[raw/articles/anthropic-claude-fable-5-on-aws内置保护措施的-mythos-级功能现已推出|Fable 5 on AWS Bedrock]]
- 关联：[[raw/articles/aliyun-cloud-native-safety-guardrails-evolution|阿里云云原生 安全护栏三域演进]]
- 关联：[[raw/articles/claude-fable-5-mollick-patron-vs-wizard|Mollick Fable 5 patron vs wizard]]
- 关联：[[raw/articles/anthropic-mythos-bug-hunting-marketing|Mythos bug hunting 营销]]
- 关联：[[raw/articles/system-over-model-tested-reproducing-mythoss-freebsd-find-on-20260606|System over Model tested]]
- 关联：[[raw/articles/nathan-lambert-claude-mythos-open-weights|Nathan Lambert Mythos open weights]]
- 关联：[[raw/articles/anthropic-12-mcp-production-patterns|Anthropic 12 MCP 生产模式]]
- 关联：[[raw/articles/anthropic-14-skill-patterns-best-practices|Anthropic 14 Skill 模式]]
- 关联：[[raw/articles/skill-issues-compromising-claude-code-with-malicious-skills-agents|Skill Issues Claude Code]]
