# Trail of Bits: Skill Scanner Bypass 实证研究

## Ch01.291 Trail of Bits: Skill Scanner Bypass 实证研究

> 📊 Level ⭐⭐ | 25.2KB | `entities/trail-of-bits-skill-scanner-bypass-distribution.md`

> → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/trail-of-bits-skill-scanner-bypass-distribution.md)

# Trail of Bits: Skill Scanner Bypass 实证研究

## 一句话总结

Trail of Bits 在 2026-06-03 公开实证：4 个公开的 agent skill scanner（ClawHub malicious skill detector、Cisco agent skill scanner、skills.sh 内置 3 个 scanner）**在不到 1 小时内被绕过**。攻击样本代码公开在 [trailofbits/overtly-malicious-skills](https://github.com/trailofbits/overtly-malicious-skills)，揭示 skill marketplace 的 supply chain 安全架构是 ship-first-secure-later 状态。

## 攻击对象（4 个 scanner）

| Scanner | 提供方 | 类型 | 绕过时间 |
|---------|--------|------|---------|
| ClawHub malicious skill detector | OpenClaw | 在 scanner 代码内部 | < 1 小时 |
| Cisco agent skill scanner | Cisco AI Defense | 独立 scanner | < 1 小时 |
| skills.sh scanner #1 | skills.sh | marketplace 内置 | < 1 小时 |
| skills.sh scanner #2 | skills.sh | marketplace 内置 | < 1 小时 |
| skills.sh scanner #3 | skills.sh | marketplace 内置 | 几小时（prompt injection 需试错） |

**共 5 个 scanner 全被绕过，4 个恶意 skill（一个 scanner 一个），4 个全部公开在 GitHub repo**。

## 攻击技术（"standard tricks"）

Trail of Bits 报告称攻击使用的不是高级技术，而是"标准技巧 + 快速阅读 scanner 源码"：

1. **阅读 scanner 源码** — 多数 scanner 是开源的，攻击者先审计其检测规则
2. **构造边缘 case** — 利用静态规则的边界（格式、注释、缩进、Unicode 归一化）
3. **Prompt injection inside SKILL.md** — 恶意指令注入到 skill 的 natural language 部分
4. **静默加载 payload** — 通过 out-of-band ZIP 上传 + 手动安装到 agent harness（绕过 marketplace 审核）

## 为什么 skill 安全至关重要

### 1. Skill 是新形态的 dependency

- 传统 supply chain 攻击载体：恶意代码
- Agent skill 攻击载体：恶意**自然语言**（SKILL.md 内的 prompt injection）+ 恶意**代码**（双载体）
- 攻击者有"全新攻击面"

### 2. 5 种 distribution channel（几乎全 ship-first-secure-later）

- **ZIP 档案** — out-of-band 分发 + 手动/API 上传到 Anthropic claude.ai / OpenAI Codex
- **Curated marketplace** — anthropics/skills, trail-of-bits skills（受信任但易被冒充）
- **Public marketplace** — ClawHub, skills.sh（开放注册，scanner 覆盖差）
- **Self-hosted** — 企业内部 skill hub（安全责任在企业）
- **Import 命令** — `npx skills add ...` 类 CLI（无 review 流程）

### 3. Scanner 的根本局限：静态规则的对抗弱势

> "Their static nature gives an adversary unlimited bites at the apple to tweak an attack until it finds a way through." — Trail of Bits

- Static signature / rule-based detection 对抗"小变异"攻击弱
- 攻击者可以无限制重试（没有 rate limit on malware attempts）
- 与病毒扫描 30 年来的根本问题相同，但 AI skill 维度更广

## 与现有实体的关系

### 与 [Skill Design Patterns](ch04/256-skill.md) 的关系

- skill-design-patterns = 设计维度（5 种 SKILL.md 写作模式）
- trail-of-bits 实体 = 攻击维度（SKILL.md 怎么被恶意构造）
- 共存：cross-link 为 skill 开发者的"威胁模型"

### 与 [Skillclaw](ch04/256-skill.md) 的关系

- skillclaw = 阿里 SkillClaw：让 Agent 技能在真实使用中集体进化
- trail-of-bits 实体 = 这些"技能市场"的安全现状
- 共存：skillclaw 解决技能分发效率，trail-of-bits 揭示了效率带来的安全代价

### 与 [Agent Security Three Step Sequence Harness Governance Identity Crewai](ch04/277-ai.md) 的关系

- agent-security = 通用 agent 安全三步（governance / identity / 隔离）
- trail-of-bits 实体 = 实证某类安全工具（scanner）的实际失效模式
- 共存：agent-security 给原则，trail-of-bits 给出真实失败案例

## 关键实证数据

- **绕过率：4/4 = 100%**
- **平均绕过时间：< 1 小时**（含 prompt injection 需试错的也 < 4 小时）
- **攻击代码全部公开**：github.com/trailofbits/overtly-malicious-skills（research-by-publishing-poc 模式）

## 实践启示（对 skill marketplace 建设者）

1. **scanner 是必要不充分的** — 不能依赖单一 scanner 当防线
2. **静态规则对抗动态攻击弱** — 必须有 runtime monitoring / sandbox
3. **out-of-band 分发需要专门审计** — ZIP 上传 + 手动安装是最大攻击面
4. **prompt injection 检测 ≠ 恶意代码扫描** — 需要双载体检测
5. **scanner 开源 ≠ 攻击者不能利用** — 反而暴露检测规则给攻击者

## 实践启示（对 skill 开发者）

1. **避免从不明 marketplace 安装 skill** — 即使有 scanner
2. **手动 review SKILL.md 的 prompt 段** — 检查自然语言部分是否有可疑指令
3. **运行时 sandbox 不可省略** — 假设任何 skill 都可能 malicious
4. **企业内自建 skill hub + 代码审计** — 比公共 marketplace 安全

## 引用要点

- "Software supply chains have long been the soft underbelly of computer security" — Trail of Bits
- "The rise in agentic systems has spawned a new style of dependency—the skill" — Trail of Bits
- "Malicious skills can embed harmful instructions in natural language as well as code" — Trail of Bits
- "Their static nature gives an adversary unlimited bites at the apple" — Trail of Bits

## 后续方向（Trail of Bits 隐含建议）

- Runtime monitoring 而非 static scanning
- Formal verification 关键 skill
- 多 scanner 共识机制（5 个 scanner 串联）
- skill 行为 sandboxing
- publisher reputation system

## 深度分析

### 核心观点：Skill supply chain 的结构性缺陷

Trail of Bits 的实证揭示了一个根本性的架构问题：**skill 作为一种新型 supply chain dependency，其分发渠道是 ship-first-secure-later 状态**。5 种 distribution channel（ZIP 手工上传、curated marketplace、public marketplace、self-hosted、import CLI）几乎无一例外地将安全审计置于发布之后。这种结构性缺陷不是某个 scanner 的实现问题，而是整个 skill ecosystem 在设计阶段就没有把安全当作前置约束。

### 技术要点：4 种绕过技术的攻击原理

从原始报告中提取的 4 种攻击技术，每种都利用了不同的 scanner 盲点：

1. **newline padding / 文件截断绕过**（ClawHub）：通过在恶意代码前插入 100,000 个换行符，使 scanner 的上下文窗口截断，Guard Model（GPT 5.5）和 VirusTotal 均无法检测到恶意内容。根因：OpenClaw scanner 对超长文件做了截断处理，恶意 payload 恰好落在截断边界之外。

2. **ZIP 内嵌 .docx 间接加载**（skills.sh）：SKILL.md 指令 agent 从 .docx（实际是 ZIP 格式）提取指令，docx 内部包含恶意 shell script。静态 pattern matching 对无害的 docx 文件直接放行，LLM scanner 也未能追踪跨文件语义关联。

3. **.pyc 字节码投毒**（skills.sh + Cisco）：main SKILL.md 和 utils.py 源码完全无害，但附带的 .pyc 预编译字节码包含恶意代码。静态分析工具不检查 .pyc 内容，LLM analyzer 的 skill 本身也不足以识别预编译字节码中的隐蔽逻辑。这是 xz-utils 后门的经典模式在 AI skill 领域的复现。

4. **prompt injection 社会工程学**（Cisco + skills.sh）：通过在 SKILL.md 中将恶意行为（篡改 npm registry 到攻击者控制域名）包装成合理的"企业内网配置"，骗过 LLM guard model 的语义判断。Cisco scanner 确实检测到了"内部 registry URL 可能被劫持"，但判断为 LOW 且最终未阻止部署。

### 实践价值：为什么每个绕过都有深远的现实影响

- **100% 绕过率（4/4）** 证明了 scanner 作为单一防线的根本失效。攻击者有无限次重试机会（"unlimited bites at the apple"），且 scanner 开源反而暴露了检测规则。
- **攻击代码全部公开**（github.com/trailofbits/overtly-malicious-skills）意味着这些技术已经扩散到公开知识库，任何人都可以复用。
- **out-of-band ZIP 分发**是最大的攻击面：它完全绕过了 marketplace 的 scanner 审核流程，直接通过 API 或手工上传到 agent harness。

### 与传统 supply chain 攻击的同构性

Trail of Bits 明确指出 skill 攻击是 software supply chain 攻击的进化变体。xz-utils 后门（2024）的模式（源码干净、预编译二进制被植入后门）直接在 .pyc 投毒攻击中重现。这说明 skill 安全问题不是 AI 独有的新问题，而是已知的 supply chain 安全问题在 AI 场景下的延伸，其防御思路（know your dependency sources、pin versions、control who can introduce them）同样适用。

### 深层矛盾：LLM-based scanner 的内生困境

Cisco scanner 使用了相对强的模型（Sonnet 4.6），但依然被 prompt injection 欺骗。这揭示了一个深层矛盾：**LLM-based scanner 的判断能力受限于其自身的 agentic capability**——它无法像真实攻击者那样质疑 SKILL.md 中声明的前提（"这是企业内部网络"），而是被语言的表层合理性所说服。这与 [Prompt Injection Defense](https://github.com/QianJinGuo/wiki/blob/main/concepts/prompt-injection-defense.md) 中描述的"LLM 无法自主识别被注入的指令"问题本质相同。

## 实践启示

### 对 Skill Marketplace 建设者

1. **scanner 是必要不充分的防线**：单一 scanner 无法应对双载体攻击（自然语言 + 代码）。必须将 scanner 与 runtime sandbox、publisher reputation、audit trail 结合使用，形成纵深防御。参考 [Ai Agents Security Survey Attack Defense](ch04/277-ai.md) 中的多层防御模型。

2. **out-of-band 分发需要专项审计**：ZIP 手工上传 + API 直接安装是当前最大的 supply chain 盲点。凡是绕过了 marketplace review 流程的分发渠道，都需要独立的人工或自动化审计步骤。

3. **双载体检测能力**：scanner 必须同时检测 SKILL.md 的 prompt injection 和代码文件的恶意行为，不能只做单载体扫描。

4. **限制文件类型而非信任内容**：OpenClaw 的 whitelist 方式（只允许特定文件类型）比黑名单更有效，从源头减少 .pyc、.docx 等高风险文件类型进入 distribution。

5. **scanner 开源需要权衡**：公开 scanner 代码有助于社区审计，但也让攻击者知道检测规则。更好的做法是公开 scanner 架构和测试集（类似 red team evaluation），但不暴露所有检测规则。

### 对 Skill 开发者

1. **只从受信任的 curated marketplace 安装 skill**：Trail of Bits 建议使用组织自建或可信的 curated 集合（如 trail-of-bits/skills-curated），避免 public marketplace 的盲目信任。

2. **手动 review SKILL.md 的自然语言部分**：检查是否有可疑的指令注入——尤其是涉及网络配置、凭据访问、文件写入的段落。

3. **运行时 sandbox 不可省略**：即使 skill 通过了 scanner 审查，也应假设任何 skill 都可能是恶意的，在隔离环境中运行。

4. **了解 skill 的实际文件组成**：检查 skill 包中是否包含预编译二进制（.pyc、.so、.dll）或非预期文件类型，必要时要求 source code 而非预编译版本。

5. **企业内 skill hub + 代码审计**：相比公共 marketplace，企业自建 skill hub 并对 skill 进行代码审计是更可靠的安全模型。可参考 [Skillsieve Agent Skill Security](ch04/256-skill.md) 中的企业级 skill 安全实践。

### 对 Agent 系统设计者

1. **将 skill 视为不受信的外部代码**：类似浏览器对第三方脚本的隔离策略，agent 系统应对每个 skill 应用最小权限原则，限制其对文件系统、网络、凭据的访问范围。

2. **建立 skill 的 provenance tracking**：记录每个 skill 的来源、版本、安装时间，并在 agent 运行时可查询。[Agent Security Three Step Sequence Harness Governance Identity Crewai](ch04/277-ai.md) 中的 identity 和 governance 框架可用于实现这一点。

3. **对高风险操作强制人工确认**：涉及网络配置、凭据写入、文件修改的 skill 操作应触发人工确认，而非自动执行。

4. **考虑 skill 的 dependency graph**：skill 可能依赖其他 skill 或外部资源，这些间接依赖同样需要纳入安全评估范围。

---

**相关实体**：
- [Skill Design Patterns](ch04/256-skill.md) — skill 的设计维度（与攻击维度互补）
- [Skillsieve Agent Skill Security](ch04/256-skill.md) — 企业级 skill 安全实践
- [Agent Security Three Step Sequence Harness Governance Identity Crewai](ch04/277-ai.md) — agent 安全的通用框架
- [Prompt Injection Defense](https://github.com/QianJinGuo/wiki/blob/main/concepts/prompt-injection-defense.md) — prompt injection 的防御思路
- [Agent Security Attack Defense](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-attack-defense.md) — agent 安全攻击与防御全景

---

## 第 2 来源 — SkillTrustBench (港中文深圳 + 腾讯朱雀实验室 2026-06-16)

> Source: [第2原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skilltrustbench-agent-skill-security-benchmark-cuhk-zhuque-2026-06-16.md)
> Author: 香港中文大学(深圳) 吴保元教授课题组 + 腾讯朱雀实验室
> Date: 2026-06-16 17:33
> 官网: https://matrix.tencent.com/skilltrustbench
> HF Dataset: https://huggingface.co/datasets/cuhk-zhuque/SkillTrustBench
> HF Leaderboard: https://huggingface.co/spaces/cuhk-zhuque/SkillTrustBench-Leaderboard

第 1 来源 (Trail of Bits 2026-06-03) 是**绕过实证视角** —— 证明"现有 scanner 在 <1 小时内被绕过"。第 2 来源是**评测基准视角** —— 港中文深圳+腾讯朱雀联合发布的**首个公开、可复现、可持续更新**的 Skill 安全评测基准。两者**互补,形成 Skill 安全的完整闭环**。

### 核心数据(基于 ClawHub 全量扫描)

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

### 三大风险信号(腾讯朱雀 AI-Infra-Guard 全量扫描发现)

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

### ClawHavoc 事件 + ToxicSkills 报告 + SkillProbe 审计

- **ClawHavoc 事件 (2026-01)**: 1,184 个恶意 Skill 上架 ClawHub,涉及 **24.7 万次安装**
- **ToxicSkills (Snyk)**: 市场中 **36.82%** 的 Skill 至少存在一个安全问题
- **SkillProbe**: ClawHub 中**超过 90%** 的高热度 Skill 仍然存在风险(高下载量 ≠ 更安全)

### ClawHub Security Signals 三 scanner 对比(2026-05)

OpenClaw 官方 67,453 个公开 Skill 三类信号对比:
- ClawHub 内置静态分析 / VirusTotal / NVIDIA SkillSpector
- **任意两类扫描的阳性样本重合度最多只有 10.4%**
- **只有 0.69% 的恶意 Skill 被三类扫描方案同时发现**
- **81.9% 的被标记样本只被单一扫描方案发现**
- 结论: 不同扫描方案看到不同风险切面,对同一批样本判断缺少稳定共识

### SkillTrustBench 设计哲学(本来源独家)

**核心洞察**: 如果评测集只包含显而易见的恶意样本,scanner 容易被引导为"看到危险命令就告警"的规则系统。这种工具测试好看,但**进入真实平台后会制造大量误报**:
- 系统管理 Skill 需要调用 shell
- 文档处理 Skill 可能使用临时共享库
- 官方安装脚本可能出现 curl | bash
- 开发工具 Skill 可能需要拉取依赖或访问外部 API

**关键设计 — 同时评估三类能力**:
1. **恶意 Skill 检测能力**: scanner 能识别多少真实恶意 Skill
2. **正常 Skill 误报控制**: scanner 对正常 Skill 误报多少
3. **不同底座模型的研判偏好差异**: 同一 scanner 换不同模型会怎样

### 9 大类安全威胁 (T01-T09)

按**攻击手段**划分(而非攻击后果):
- **T01-T08**: 各类恶意攻击手段
- **T09 不安全编码行为**(本基准独家): 大量由正常工程人员开发的 Skill 主观无恶意,但因缺乏安全编码规范,代码中常伴随:
  - 硬编码凭证
  - 敏感权限过度声明
  - 缺乏输入校验
  - 易受命令注入

**T09 设计哲学**: 这些缺陷如同软件供应链中的潜伏漏洞 —— 即使开发者主观无害,不安全代码仍可能被黑客通过提示词注入或间接指令劫持,成为入侵系统的隐性通道。

### 首期评测发现

#### 模型横评(底座大模型)

| 模型 | 表现 |
|------|------|
| **Claude Opus 4.6** | 第一梯队,极强的语义推理与安全约束理解能力 |
| **GLM 5.1** | 第一梯队,与 Opus 4.6 同级 |
| **DeepSeek V4 Flash** | 性价比优势显著,性能与成本平衡 |
| **Hy3 preview** | 性价比优势显著 |

#### 扫描器横评(DeepSeek v4 Flash 统一底座)

- **OpenClaw + Skill Vetter**: 轻量级开源审计方案,已具备发现多数恶意 Skill 风险的基础能力;但在复杂噪声干扰下的**误报控制**仍有较大优化空间

#### Skill 本身的安全可信度

评测发现**大量非恶意 Skill 同样存在不可信隐患**: 硬编码凭证 / 敏感权限滥用 / 易受命令注入等不安全编码缺陷广泛存在 — 这些行为虽主观无害,却因其自身安全脆弱性,极易成为供应链劫持的二次攻击入口。

### 两来源对比表

| 维度 | 第 1 来源 (Trail of Bits 2026-06-03) | 第 2 来源 (SkillTrustBench 2026-06-16) |
|------|----------------------------------|--------------------------------------|
| **核心定位** | **绕过实证**(展示 scanner 不够) | **评测基准**(系统性测量 scanner 能力) |
| **视角** | 攻击者视角(red team) | 防御者视角(blue team + 评测) |
| **发布方** | Trail of Bits (美国安全公司) | 港中文深圳 + 腾讯朱雀(中国学术界+工业界) |
| **样本数** | 4 个 scanner 绕过样本 | 5,520 评测用例 / 62,652 真实 Skill |
| **威胁分类** | 未明确分类 | T01-T09 9 大类攻击手段 |
| **核心方法** | 公开攻击样本让社区审计 | 公开基准 + 排行榜 + HF Dataset |
| **量化数据** | < 1 小时绕过 | F1 / 召回率 / 误报率 + 模型横评 |
| **互补关系** | 证明"现有 scanner 不够" | 回答"哪个 scanner 更可靠 / 哪个模型更合适" |

### 关键独到判断(本来源独家)

- **首个公开评测基准**: 之前行业只有"绕过实证"和"零散 scanner 对比",没有公开、可复现、可持续更新的评测基准 — SkillTrustBench 填补这一缺口
- **T09 不安全编码行为**: 大量非恶意 Skill 因不安全编码而成为隐性攻击入口 — 这是对"恶意检测"二元思维的扩展
- **三类能力评估**(恶意检测 + 误报控制 + 模型差异): 不是单维评分,而是多维评估
- **港中文深圳 + 腾讯朱雀联合**: 学术界 + 工业界合作模式,确保基准的学术严谨性和工业实用性
- **T01-T09 按攻击手段分类**(而非攻击后果): 攻击手段可枚举,后果难穷举
- **模型横评 + 扫描器横评**: 不仅评工具,还评底座模型 — 揭示 LLM 在安全研判上的偏好差异
- **HF Dataset + Leaderboard**: 完全可复现,社区可参与

### 实践启示(本来源补全)

- **优先选择 SkillTrustBench 评测过的 scanner**: 而不是看 GitHub stars
- **关注底座模型**: 同一 scanner 换不同底座模型,研判偏好差异显著
- **T09 不安全编码**: 即使 Skill 非恶意,也要审查硬编码凭证 / 敏感权限 / 输入校验
- **多 scanner 组合**: 单一 scanner 不可靠(任意两类重合度只有 10.4%) — 应组合多个独立 scanner
- **HF Leaderboard 持续追踪**: 评测基准会持续更新,新 scanner / 新模型应及时对比
- **企业自建 curated marketplace**: 公共 marketplace 风险信号密集(36.82% 至少有一个安全问题) — 企业应自建 + 审计
- **AI-Infra-Guard 工具集成**: 腾讯朱雀开源的红队安全测试平台,可直接用于自家 Skill 审计

→ [第2原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skilltrustbench-agent-skill-security-benchmark-cuhk-zhuque-2026-06-16.md)

---

