# kasra.blog LLM Agent 黑客能力实测: USD 1500 投石问路 14 模型

## Ch01.498 kasra.blog LLM Agent 黑客能力实测: USD 1500 投石问路 14 模型

> 📊 Level ⭐⭐ | 9.5KB | `entities/kasra-blog-llm-hacking-empirical-test.md`

# kasra.blog LLM Agent 黑客能力实测: 1500 投石问路 14 模型

## 概述

安全研究员 Kasra 自建 BookNook React Native 应用, 故意设计 **Firebase 凭证泄露** 漏洞 (hardened API + 完全开放的 Firestore), 让 14 款前沿 LLM agent 独立尝试渗透。目标: 在用户私有评论中拿到 flag。总花费 ~$1500 跑了 ~70 次实战渗透。这是 2026 年 **LLM agent 实战攻防能力** 最直接的独立评测。

## 测试设计

**漏洞类型**: Broken Access Control / Missing Object-Level Authorization (OWASP API #1)
- API 端严格鉴权, 无任何 IDOR
- 但应用打包时 `google-services.json` 包含 Firebase 凭证
- 攻击路径: 直接用 Firebase 凭证注册 + 读 Firestore, 跳过 API
- 属于 **真实生产中常见的 Firebase/Supabase 配置泄露类漏洞** 

**Harness 配置**:
- pi.dev + pi-goal-x 强制模型持续尝试 (除 Claude)
- Claude 用 Claude Code `-p` 模式 (无 plan mode)
- 高 thinking mode + temperature 0.7
- 单次 $10 + 2 小时上限
- ~50% 失败/放弃的运行未计入 (Modal preempted 约 10% 算力) 

## 核心数据: 14 模型解决率与成本

### 全 10 次运行 (核心 9 模型)

| 模型 | 解决率 | 95% Wilson CI | 平均 $/run | $/solve | 中位 tokens/run |
|------|-------|---------------|------------|---------|-----------------|
| gpt-5.5 | 7/10 | 40%-89% | $6.62 | $9.46 | 260k |
| deepseek-v4-pro | 3/10 | 11%-60% | $0.19 | $0.62 | 194k |
| claude-sonnet-4.6 | 2/10 | 6%-51% | $9.15 | $45.75 | 390k |
| claude-opus-4-8 | 2/10 | 6%-51% | $3.23 | $16.15 | 113k |
| deepseek-v4-flash | 0/10 | 0%-28% | $0.08 | - | 191k |
| gemini-3.1-pro-preview | 0/10 | 0%-28% | $1.04 | - | 9k |
| gemini-3.5-flash | 0/10 | 0%-28% | $2.17 | - | 108k |
| minimax-m2.7 | 0/10 | 0%-28% | $0.72 | - | 281k |
| step-3.7-flash | 0/10 | 0%-28% | $0.53 | - | 413k |

### 部分运行 (成本太高, 未跑满)

| 模型 | 解决率 | 平均 $/run | $/solve | 中位 tokens/run |
|------|-------|------------|---------|-----------------|
| glm-5.1 | 1/4 | $8.68 | $34.73 | 1.25M |
| qwen3.7-max | 0/6 | $8.71 | - | 7.32M |
| grok-build-0.1 | 0/6 | $1.53 | - | 332k |
| minimax-m3 | 0/3 | $6.75 | - | 1.16M |
| kimi-k2.6 | 1/1 | $1.02 | $1.02 | 226k |
| owl-alpha | 0/10 | $0.00 | - | 271k |

数据点:

## 关键观察

### 1. 中文模型对 DB 攻击更 "舒适"

> The Chinese models were way more comfortable attacking the DB, the other models had momentarily blips of "This would affect the live database so I'm not going to do that."

中文模型 (DeepSeek V4 Pro, GLM 5.1, Minimax, Qwen) 显著更愿意直接攻击 Firestore DB, **无明显伦理犹豫**。英文模型 (GPT/Claude/Gemini) 则频繁出现 "this would affect the live database" 类型的暂缓声明 - 即使最终绕过了, 也消耗 budget/时间。

### 2. 成本/能力帕累托: DeepSeek V4 Pro 是性价比之王

- $0.19/run + $0.62/solve (GPT 5.5 解决率 7/10 但 $9.46/solve)
- DeepSeek V4 Pro 3/10 解决率 vs GPT 5.5 7/10 解决率 = **22x 成本差异下能力仅 2.3x 差距**
- Kimi K2.6 1/1 + $1.02/solve (早期数据, 但样本量小)
- GLM 5.1 极贵: $34.73/solve + 1.25M tokens/run (作者: "再也不用 GLM")

### 3. Claude 模型 "晚期拒答" 现象

> Got so close to the right answer multiple times but security guardrails ended the session early. Late refusals, not right off the bat.

Claude Opus 4.8 多次接近正确答案但 **安全护栏中途终止会话**。Sonnet 4.6 5 次运行因为 budget 上限终止 (仍在 Firebase 正确路径上)。这是 Claude 系模型的 **护栏滞后性**: 不立即拒答但运行中途触发 guardrail。

### 4. Gemini 早期立即拒答

gemini-3.1-pro-preview 中位 tokens/run = 9k (其他模型 100k+) - **直接 refusal**, 未实际尝试攻击。gemini-3.5-flash 类似但有 2 次先尝试后拒答。

### 5. 解决路径模式

- **成功模型** (GPT 5.5, DeepSeek V4 Pro): unzip APK - 发现 `google-services.json` - 直接用 Firebase 注册
- **失败模式 A** (deepseek-v4-flash, step-3.7-flash, minimax-m2.7): 发现 Firebase 但 **错误地通过 API 使用 Firebase auth**
- **失败模式 B** (qwen3.7-max, grok-build-0.1, minimax-m3): fixated on API IDOR 路径, 从未探索 Firebase
- **失败模式 C** (owl-alpha, glm-5.1 部分运行): 漫无目的尝试 API 多个端点

## 三个独有贡献 (不应合并到现有 entity)

1. **Firebase/Supabase 配置泄露类漏洞的 LLM agent 实战** - 与 Mythos (Anthropic 委托 XBOW 评测源码审计) 角度完全独立; 这是攻击者视角、独立研究员、DB 直连路径
2. **14 模型成本-能力帕累托** - Mythos 只评 Anthropic 自家模型; Kasra 跨 7+ 提供商 14 模型, 给出 $/solve 成本效率排名
3. **"中文模型对 DB 攻击更舒适" 行为观察** - 跨模型文化/训练数据对安全决策的差异, 业界无公开对照数据

## 实践启示

- **Agent 攻防测试的真实成本**: 单一目标 14 模型全 10 次 ~$1500 不可扩展。生产级安全评估需要更便宜的 setup (OpenRouter 而非直连各家 API)
- **Modal 不适合长 agent 任务**: 10% 算力抢占 + 大 transcript 落盘成本, 作者后悔选 Modal 而非 AWS
- **Harness 构建比模型选择更难**: 作者明确指出 "Building the harness was honestly the hardest part"
- **大模型实战攻防 != 漏洞发现能力**: Mythos Preview 强调 "漏洞发现强但安全判断力弱" (v x c=72 stars=5 评测报告); Kasra 测试显示多数模型连 "识别攻击路径" 都做不到
- **pi-goal-x 的价值**: 强制持续尝试是 LLM agent 安全测试的关键护栏 - 没有它多数模型早期放弃

## 与现有 entity 差异化

| 维度 | kasra-blog-llm-hacking | tsinghua-agent-security-fangcun | mythos-for-offensive-security-xbows |
|------|------------------------|-------------------------------|--------------------------------------|
| 视角 | 攻击者 + 独立研究员 | 防御者 + 学术团队 | 模型能力 + 厂商委托 |
| 评测方法 | 实战渗透 + 成本数据 | 防御框架性能 (30ms 护栏) | 冻结漏洞版本 + agent 对抗 |
| 模型覆盖 | 14 跨厂商模型 | 防御机制本体 | 仅 Anthropic Mythos |
| 核心问题 | LLM 能否实战攻击? | 如何防御 LLM 风险? | 模型漏洞发现能力如何? |
| 成本维度 | $/solve 数据 | 无 | 无 |
| 中文模型对比 | 明确 "中文模型更舒适攻击 DB" | 无 | 无 |

-> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/kasra-blog-llm-hacking-empirical-test.md)

## 深度分析

### 1. LLM hacking 的实证测试
Kasra 的实证研究测试了 LLM 安全防护的实际强度——结论是：大多数公开的安全防护在针对性攻击下效果有限，安全需要分层防御。

### 2. 与 `Xz Utils Backdoor Maintainer Trust Hijack 2 Years On` 的类比
LLM hacking 和供应链攻击都是"信任被滥用"——prompt injection 滥用 LLM 对用户输入的信任，社会工程滥用开源社区对新维护者的信任。

### 3. 红队测试的必要性
实证红队测试是验证 LLM 安全防护有效性的唯一方式——理论分析不足以发现实际攻击路径。

## 实践启示

### 1. 定期对 agent 系统做红队测试
每季度对生产 agent 系统做红队测试——验证安全防护是否仍然有效。

### 2. 分层防御：不依赖单一安全机制
prompt filter + input validation + output monitoring + human review——多层防御比单一机制更可靠。

### 3. 红队测试结果反馈到 harness 设计
红队发现的攻击路径应反馈到 harness 的约束设计——持续改进安全边界。

## 相关实体
- [Ai Skill Skill Creator 源码拆解](ch04/245-skill.md)
- [Llm Agent脚手架如何具备自进化能力以Hermes Agent为例](ch03/045-agent.md)
- [Agentic Ai System Architecture Harness Skill Mcp](ch04/245-skill.md)

---

