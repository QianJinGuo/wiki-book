# How to Detect AI Agents on Your Website | Full Guide

## Ch04.012 How to Detect AI Agents on Your Website | Full Guide

> 📊 Level ⭐ | 6.3KB | `entities/detect-ai-agents-website.md`

# How to Detect AI Agents on Your Website

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/detect-ai-agents-website.md)

## 摘要

随着 AI Agent 大规模渗透 Web 生态，网站面临前所未有的自动化流量挑战。传统 bot 检测手段已无法有效识别基于浏览器的智能 Agent，因为它们的行为模式越来越接近真实用户。本文系统梳理了四层检测体系（身份、网络、浏览器、行为），并指出从"是否为 bot"到"意图分类"的范式转变。cside 内部测试显示，81% 的 AI Agent 可绕过传统 bot 检测平台。

## 核心要点

### 四层检测信号体系

| 信号层 | 检测维度 | 典型手段 |
|--------|----------|----------|
| **身份层** | User-Agent 声明、bot 签名 | 已知爬虫签名库交叉比对 |
| **网络层** | IP 信誉、ASN 分析、TLS 指纹 | JA3/JA4 指纹、数据中心 vs 住宅 IP |
| **浏览器层** | 自动化框架痕迹、API 一致性 | CDP 追踪、WebGL/Canvas/Audio 指纹 |
| **行为层** | 打字速度、导航时序、鼠标轨迹 | 点击位置分析、表单填充模式 |

### 六类 AI Agent 流量分类

1. **AI 搜索爬虫**：Perplexity、Google AI Overviews 等，抓取内容用于 AI 生成搜索结果
2. **LLM 训练爬虫**：GPTBot、ClaudeBot、CCBot，用于模型训练数据采集
3. **外部抓取器**：竞品价格监控、聚合服务数据采集、盗版内容搬运
4. **用户操作 Agent（信息检索）**：消费者委托 ChatGPT 研究产品、Claude 比价
5. **用户操作 Agent（任务执行）**：Perplexity Comet 代购、浏览器自动化下载 PDF
6. **欺诈性 Agent**：批量信用卡测试、薅羊毛多账号注册、优惠码滥用

### 三种检测方法对比

| 方法 | 可检测范围 | 局限性 | 成本 |
|------|-----------|--------|------|
| **服务器日志分析** | 自声明爬虫（GPTBot 等） | 无法识别伪装 UA 的 Agent | 免费 |
| **传统 bot 检测**（Cloudflare/Akamai） | 已知恶意 IP、脚本 bot | 81% 绕过率，对隐身浏览器无效 | 免费-企业级 |
| **专用 AI Agent 检测**（cside） | 隐身浏览器、本地 Agent、欺诈自动化 | 非 100% 覆盖但当前最强 | 免费-企业级 |

## 深度分析

### 从"bot or not"到意图分类的范式转变

传统 bot 检测是二元判断——是 bot 就拦截。但当消费者通过 AI Agent 购物时，盲目拦截等于拒绝营收。新范式是**意图分类**：不再问"是不是 bot"，而是问"这个 bot 想做什么"。信号汇入风险评分：3 分钟内测试 17 张信用卡 = 卡号枚举攻击；自动化信号 + 多账号创建 = 多账号薅羊毛。

### 隐身浏览器与本地化部署的挑战

Playwright npm 月下载量三倍增长至 3500 万+，"stealth browser" 搜索量持续创新高。传统 bot 运行在云端（数据中心 IP），新一代 Agent 运行在真实消费者硬件上——Claude 浏览器扩展在个人笔记本上运行，发出的请求来自合法住宅 IP、真实浏览器和真实设备指纹。攻击者甚至可用 Mac Mini 本地运行 Playwright，看起来与普通消费者无异。

### CAPTCHA 已失效

AI 视觉模型破解 CAPTCHA 的速度和准确率已超过人类。CAPTCHA 对真实用户造成的摩擦远大于对 bot 的阻碍。

### 浏览器仍是关键检测窗口

Google 发布了网站 agent-ready 指南，明确包含视觉 UI 优化（Agent 通过 DOM 解析和截图交互）。Carnegie Mellon 研究发现混合 Agent（浏览器 + API）在 77.7% 的任务中优于纯 API 交互。Agent 像人一样浏览是因为这最有效——浏览器层是捕获它们的关键位置。

### 自适应响应策略

- **重定向/差异化内容**：保险公司检测到 bot 在报价流程中爬取价格时，最终步骤显示"联系我们"而非真实报价
- **定制化体验**：识别为 AI Agent 后提供优化版本，人类用户看到完整体验
- **意图分级执行**：允许 → 监控 → 质询 → 拦截，根据风险评分动态调整

## 实践启示

1. **多层检测组合**：单一方法易被绕过，建议服务器日志（快速初筛）+ 专用检测工具（深度防护）的组合策略
2. **区分恶意与消费 Agent**：不要默认拦截所有自动化流量，消费者 Agent 代表新的营收渠道
3. **浏览器层是核心战场**：API-only 思维已过时，Agent 仍大量通过浏览器交互，浏览器层信号最丰富
4. **Analytics 工具的盲区**：GA4/PostHog 无法区分 Agent 会话与真实用户，需专门的检测工具
5. **关注流量异常指标**：特定屏幕分辨率聚集、被地理封锁区域的流量突增、Chrome 浏览器占比异常

## 相关实体

- [当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学](ch04/532-amazon-bedrock-agentcore.html)
- [Your AI Agents Are Already Inside the Perimeter](ch04/030-ai-agent.html)
- [Chrome Enterprise Policies on Amazon Bedrock AgentCore](../ch11/132-control-where-your-ai-agents-can-browse-with-chrome-enterpri.html)
- [AI-powered honeypots](../ch01/085-ai-powered-honeypots-turning-the-tables-on-malicious-ai-age.html)
- [Securing AI agents: AWS and Cisco AI Defense](ch04/030-ai-agent.html)

---

