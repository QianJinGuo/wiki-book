---
title: "SkillTrustBench:首个 Agent 技能安全评测基准 (港中文深圳 + 腾讯朱雀实验室)"
source_url: https://mp.weixin.qq.com/s/VE8SeibOtpHHYypKQw1TAQ
publish_date: 2026-06-16
tags: [wechat, article, skill-security, skill-trustbench, ai-infra-guard, clawhub, clawhavoc, toxic-skills, skill-probe, skill-spector, t01-t09, supply-chain-attack, agent-skill-vetter, openclaw, evals, llm-as-judge, tencent-zhuque, cuhk-shenzhen, wubaoyuan, leaderboard]
review_value: 10
review_confidence: 10
review_recommendation: ingest
sha256: 66cd3c006e17a1a77587f3c6383187100eb54a05e339ebf92467db441d478893
---
# SkillTrustBench:首个 Agent 技能安全评测基准

> Source: https://mp.weixin.qq.com/s/VE8SeibOtpHHYypKQw1TAQ
> Author: 香港中文大学(深圳) 吴保元教授课题组 + 腾讯朱雀实验室
> Date: 2026-06-16 17:33
> Collected: 2026-06-16
> 官网: https://matrix.tencent.com/skilltrustbench
> HF Dataset: https://huggingface.co/datasets/cuhk-zhuque/SkillTrustBench
> HF Leaderboard: https://huggingface.co/spaces/cuhk-zhuque/SkillTrustBench-Leaderboard

## 一句话总结

**SkillTrustBench** —— 首个面向真实落地场景、兼顾 Agent Skills **安全可信度 + 外部扫描方案检测效能** 的双重评测基准。**腾讯朱雀实验室 + 港中文深圳吴保元教授课题组** 联合发布。从 **62,652 个真实 Skill** 提炼 **5,520 评测用例**,覆盖 **9 大类安全威胁 (T01-T09)**,为评估并提升 Agent 技能安全性提供客观参考。

## 核心数据(基于 ClawHub 全量扫描)

| 指标 | 数值 |
|------|------|
| 总 Skill 数 | 62,652 (源) / 50,000+ (扫描时) / 67,453 (OpenClaw Signals 数据集) |
| 提炼评测用例 | **5,520 个** |
| 覆盖威胁类 | **9 大类 (T01-T09)** |
| 开发者总数 | 15,427 |
| Top 20 发布者占比 | 12.9% (5,422 个) |
| 极端账号 3 个月发布 | 955 个 / 日均 10.6 个 |
| 声明网络权限 Skill | 27,818 (74.6%) |
| 扫描发现的 URL | 246,378 条 |
| 指向域名数 | 29,196 个不同域名 |
| 90 天增长 | < 2,000 → > 50,000 (25×) |

## 背景:Agent Skills 攻击面正在扩大

**复合性带来的危险性**: Skill 同时跨越**自然语言 / 代码 / 依赖 / 权限 / 运行时上下文** 5 个维度。
- 自然语言: 在文档中直接向 Agent 下达指令
- 网络请求: 利用网络向外传输数据
- 本地脚本: 执行本地脚本 / 安装外部依赖
- 会话记忆: 篡改会话记忆实施隐蔽攻击

**ClawHavoc 事件 (2026-01)**:
- 1,184 个恶意 Skill 被上架到 ClawHub
- 涉及 **24.7 万次安装**

**ToxicSkills 报告 (Snyk)**:
- 市场中 **36.82%** 的 Skill 至少存在一个安全问题

**SkillProbe 论文审计**:
- 高下载量 ≠ 更安全
- ClawHub 中**超过 90%** 的高热度 Skill 仍然存在风险

## 三大风险信号(腾讯朱雀 AI-Infra-Guard 全量扫描发现)

**1. 规模化、矩阵化的恶意 Skill 生产迹象**
- 五万个 Skill 背后共有 15,427 名开发者
- Top 20 发布者合计 5,422 个 Skill (12.9%)
- 极端账号 3 个月发布 955 个 Skill (日均 10.6)
- 多组命名相近、发布时间交替的账号矩阵 = 批量制造、批量投放、批量伪装

**2. 权限组合天然接近数据外泄链路**
- 27,818 个 Skill 声明网络请求权限 (74.6%)
- 读文件 + 联网 = 恶意外传隐藏在正常功能流量中

**3. 外联通道已经非常分散**
- 246,378 条 URL → 29,196 个不同域名
- 既可能是正常 API/文档/依赖源,也可能成为远程控制/数据回传/链上交互/二阶段载荷下载通道

## 现有扫描与评测为什么不够

**当前 scanner 的能力边界**:
- 文件是否完整读取
- 特殊文件是否展开分析
- 字节码是否反编译
- LLM 是否会被合理解释说服

**Trail of Bits 绕过测试 (2026-06)**:
- ClawHub / Cisco skill scanner / skills.sh 多 scanner
- < 1 小时绕过(详见 [[entities/trail-of-bits-skill-scanner-bypass-distribution]])

**ClawHub Security Signals 数据集 (2026-05, OpenClaw 官方)**:
- 67,453 个公开 Skill
- 对比 ClawHub 内置静态分析 / VirusTotal / NVIDIA SkillSpector 三类信号
- **任意两类扫描的阳性样本重合度最多只有 10.4%**
- **只有 0.69% 的恶意 Skill 被三类扫描方案同时发现**
- **81.9% 的被标记样本只被单一扫描方案发现**
- 结论: 不同扫描方案看到不同风险切面,对同一批样本判断缺少稳定共识

## SkillTrustBench 设计哲学

**核心洞察**: 如果一个评测集只包含显而易见的恶意样本,扫描方案容易被引导为看到危险命令就告警的规则系统。这种工具测试好看,但**进入真实平台后会制造大量误报**:
- 系统管理 Skill 需要调用 shell
- 文档处理 Skill 可能使用临时共享库
- 官方安装脚本可能出现 curl | bash
- 开发工具 Skill 可能需要拉取依赖或访问外部 API

**关键设计**: **同时评估三类能力**:
1. **恶意 Skill 检测能力**: scanner 能识别多少真实恶意 Skill
2. **正常 Skill 误报控制**: scanner 对正常 Skill 误报多少
3. **不同底座模型的研判偏好差异**: 同一 scanner 换不同模型会怎样

## 9 大类安全威胁 (T01-T09)

按**攻击手段**划分(而非攻击后果):
- **T01-T08**: 各类恶意攻击手段
- **T09 不安全编码行为**(本基准独家): 大量由正常工程人员开发的 Skill 主观无恶意,但因缺乏安全编码规范,代码中常伴随:
  - 硬编码凭证
  - 敏感权限过度声明
  - 缺乏输入校验
  - 易受命令注入

**T09 设计哲学**: 这些缺陷如同软件供应链中的潜伏漏洞 —— 即使开发者主观无害,不安全代码仍可能被黑客通过提示词注入或间接指令劫持,成为入侵系统的隐性通道。

## 首期评测发现

### 模型横评(底座大模型)

| 模型 | 表现 |
|------|------|
| **Claude Opus 4.6** | 第一梯队,极强的语义推理与安全约束理解能力 |
| **GLM 5.1** | 第一梯队,与 Opus 4.6 同级 |
| **DeepSeek V4 Flash** | 性价比优势显著,性能与成本平衡 |
| **Hy3 preview** | 性价比优势显著 |

### 扫描器横评(DeepSeek v4 Flash 统一底座)

| 工具 | 表现 |
|------|------|
| **OpenClaw + Skill Vetter** | 轻量级开源审计方案,已具备发现多数恶意 Skill 风险的基础能力;但在复杂噪声干扰下的**误报控制**仍有较大优化空间 |

### Skill 本身的安全可信度

评测发现**大量非恶意 Skill 同样存在不可信隐患**:
- 硬编码凭证
- 敏感权限滥用
- 易受命令注入等不安全编码缺陷广泛存在
- 这些行为虽主观无害,却因其自身安全脆弱性,极易成为供应链劫持的二次攻击入口

## 资源链接

- 项目官网: https://matrix.tencent.com/skilltrustbench
- HF Dataset: https://huggingface.co/datasets/cuhk-zhuque/SkillTrustBench
- HF Leaderboard: https://huggingface.co/spaces/cuhk-zhuque/SkillTrustBench-Leaderboard
- AI-Infra-Guard (腾讯朱雀开源): https://github.com/Tencent/AI-Infra-Guard

## 与 Trail of Bits 实体的关系

| 维度 | Trail of Bits (2026-06-03) | SkillTrustBench (2026-06-16) |
|------|---------------------------|-------------------------------|
| **核心定位** | **绕过实证**(展示 scanner 不够) | **评测基准**(系统性测量 scanner 能力) |
| **视角** | 攻击者视角(red team) | 防御者视角(blue team + 评测) |
| **发布方** | Trail of Bits (美国安全公司) | 港中文深圳 + 腾讯朱雀(中国学术界+工业界) |
| **样本数** | 4 个 scanner 绕过样本 | 5,520 评测用例 / 62,652 真实 Skill |
| **威胁分类** | 未明确分类 | T01-T09 9 大类攻击手段 |
| **核心方法** | 公开攻击样本让社区审计 | 公开基准 + 排行榜 + HF Dataset |
| **量化数据** | < 1 小时绕过 | F1 / 召回率 / 误报率 + 模型横评 |
| **互补关系** | 证明"现有 scanner 不够" | 回答"哪个 scanner 更可靠 / 哪个模型更合适" |

**两篇来源互补,形成 Skill 安全的完整闭环**:
- Trail of Bits = "问题存在性证明"(scanner 被绕过)
- SkillTrustBench = "解决方案系统性测量"(哪个 scanner / 模型更可靠)

## 关键独到判断

- **首个公开评测基准**: 之前行业只有"绕过实证"(Trail of Bits)和"零散 scanner 对比",没有公开、可复现、可持续更新的评测基准 — SkillTrustBench 填补这一缺口
- **T09 不安全编码行为**(本基准独家): 大量非恶意 Skill 因不安全编码而成为隐性攻击入口 — 这是对"恶意检测"二元思维的扩展
- **三类能力评估**(恶意检测 + 误报控制 + 模型差异): 不是单维评分,而是多维评估 — 这是评测基准的核心方法论
- **港中文深圳 + 腾讯朱雀联合**: 学术界 + 工业界合作模式,确保基准的学术严谨性和工业实用性
- **T01-T09 按攻击手段分类**(而非攻击后果): 攻击手段可枚举,后果难穷举 — 这是更可操作的分类法
- **模型横评 + 扫描器横评**: 不仅评工具,还评底座模型 — 揭示 LLM 在安全研判上的偏好差异
- **HF Dataset + Leaderboard**: 完全可复现,社区可参与 — 不是封闭评测

## 实践启示

- **优先选择 SkillTrustBench 评测过的 scanner**: 而不是看 GitHub stars — 评测过的 scanner 才有客观可比性
- **关注底座模型**: 同一 scanner 换不同底座模型,研判偏好差异显著 — 选 LLM-based scanner 时要固定模型
- **T09 不安全编码**: 即使 Skill 非恶意,也要审查硬编码凭证 / 敏感权限 / 输入校验 — 隐性攻击入口
- **多 scanner 组合**: 单一 scanner 不可靠(任意两类重合度只有 10.4%) — 应组合多个独立 scanner
- **HF Leaderboard 持续追踪**: 评测基准会持续更新,新 scanner / 新模型应及时对比
- **企业自建 curated marketplace**: 公共 marketplace 风险信号密集(36.82% 至少有一个安全问题) — 企业应自建 + 审计

→ 与 [[entities/trail-of-bits-skill-scanner-bypass-distribution]] (绕过实证视角) 互补,本文是 Skill 安全主题的**评测基准视角**补全 — 两者合起来形成 Skill 安全的完整闭环。