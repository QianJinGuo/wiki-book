# Pwn2Own Berlin 2026, Day Three: DEVCORE Crowned Master of Pwn, $1.298 Million Total

## Ch12.051 Pwn2Own Berlin 2026, Day Three: DEVCORE Crowned Master of Pwn, $1.298 Million Total

> 📊 Level ⭐⭐ | 7.9KB | `entities/pwn2own-berlin-2026-day-three-devcore-crowned-master-of-pwn-1298-million-total.md`

## 核心要点
- 来源：securityaffairs
- 评分：v=7 × c=8
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/pwn2own-berlin-2026-day-three-devcore-crowned-master-of-pwn-1298-million-total.md)

## 事件概述
Pwn2Own Berlin 2026 于 5 月 16 日在 OffensiveCon 落下帷幕，为期三天的比赛共发现 47 个独立零日漏洞，发放总奖金 $1,298,250。DEVCORE 研究团队以 50.5 Master of Pwn 积分和 $505,000 奖金的绝对优势夺得冠军，刷新了近年来历届比赛的纪录。

## 关键结果
DEVCORE 在第三天延续了前两天的统治力。splitline 利用两个漏洞的链式攻击成功攻破 Microsoft SharePoint，获得 $100,000 和 10 Master of Pwn 积分。SharePoint 在第二天曾抵御了 Rapid7 的 Stephen Fewer 的攻击尝试，这一胜利可谓某种程度的正名。
STARLabs SG 的 Nguyen Hoang Thach 凭借内存破坏漏洞攻击 VMware ESXi 的跨租户代码执行模块，赢得 $200,000 和 20 积分。OpenAI Codex 在第一天被攻破两次后，第三天又被 Satoki Tsuji（Ikotas Labs）以外部控制漏洞再次攻破，再次获得 $20,000 和 4 积分。
Anthropic 的 Claude Code 由 Compass Security 尝试攻击，但因与先前提交存在漏洞碰撞，仅获得部分奖励 $20,000 和 2 积分，而非全额奖励。
Windows 11 成为本次比赛中被攻击次数最多的系统之一。Viettel Cyber Security 的 Le Tran Hai Tung、dungnm 和 hieuvd 使用整数溢出在完全打补丁的 Windows 11 机器上进行权限提升，获得 $7,500 和 3 积分。
Red Hat Enterprise Linux for Workstations 也继续承受攻击。Sina Kheirkhah（Summoning Team）使用两个漏洞攻击该平台，其中一个是已知漏洞，获得部分奖励 $7,000 和 1.5 积分。Hyunwoo Kim 则使用 use-after-free 和未初始化内存漏洞的链式攻击成功获得 $5,000 和 2 积分。

## 最终排名
DEVCORE 以 50.5 积分和 $505,000 奖金独占鳌头，STARLabs SG 以 25 积分和 $242,500 位居第二，Out Of Bounds 以 12.75 积分和 $95,750 排名第三。

## 深度分析
### DEVCORE 的统治性表现
DEVCORE 在本届比赛中展现了压倒性的优势，这在 Pwn2Own 历史上极为罕见。进入第三天时，他们已手握 40.5 积分和 $405,000 的领先优势，这在单日比赛中几乎无法被追赶。更值得注意的是，他们在整个比赛期间没有表现出任何疲态——从 SharePoint 的双漏洞链式攻击到其他多个目标的一致性得分，展示了极高水平的系统性研究能力。这种统治力不是运气，而是源于一个持续高效运作的研究项目。

### AI 基础设施成为新焦点
OpenAI Codex 在三天的比赛中被三名不同研究人员以三种不同技术成功攻破，这揭示了 AI 基础设施的 Attack Surface 正在快速扩展。每次攻击都使用了不同的技术路径，这意味着问题不是一个单一的狭窄漏洞，而是一个更广泛的攻击面。Anthropic 的 Claude Code 也遭遇了碰撞——部分研究成果与先前提交重叠，这表明 AI 编码助手的安全性已经成为漏洞研究社区的重点关注领域。

### 企业基础设施持续承压
Microsoft SharePoint 和 VMware ESXi 作为企业关键基础设施，在比赛中被成功攻破。特别是 VMware ESXi 作为虚拟化平台，其跨租户代码执行漏洞具有极高的风险敞口。Windows 11 在三天内被多个独立团队使用不同漏洞多次攻破，表明操作系统层面的安全性仍有大量提升空间。

### 漏洞发现的经济动力学
相比去年柏林赛的 $1,078,750，今年的总奖金增长至 $1,298,250，涨幅约 20%，同时发现的独立漏洞从 39 增加到 47。这一增长反映了几个趋势：更多研究人员参与竞争，目标范围从传统浏览器和操作系统扩展到 AI 基础设施和开发者工具，漏洞研究的经济学持续吸引顶尖人才。

### 碰撞问题的影响
Compass Security 攻击 Claude Code 时遇到漏洞碰撞，意味着部分研究发现与先前提交重叠，只能获得部分奖励而非全额。这凸显了 Pwn2Own 竞赛中时间敏感性和研究独创性的双重压力——研究人员需要在正确的时机提交独特的发现，而碰撞导致的奖励削减可能影响后续研究投入。

## 实践启示
### 对安全研究社区
AI 基础设施和开发者工具已成为漏洞研究的新前沿。OpenAI Codex 在单届比赛中被攻破三次，Anthropic Claude Code 遭遇碰撞问题，这些信号提示安全研究者应加大对 AI 编码助手和 AI Agent 系统的研究投入。同时，企业基础设施（SharePoint、ESXi）在比赛中多次被攻破，表明传统企业软件仍是重要的攻击目标。

### 对企业安全团队
比赛揭示了多个产品和平台的安全问题，供应商有 90 天时间发布修复补丁。企业安全团队应重点关注：Exchange Server 零日（CVE-2026-42897）已被主动利用，需优先打补丁；Windows 11 作为被攻击次数最多的系统之一，需要加强终端安全防护；虚拟化平台（VMware ESXi）的跨租户漏洞具有极高风险，虚拟化环境需要独立的隔离策略（参见 [VCF 9.1 新特性](https://github.com/QianJinGuo/wiki/blob/main/entities/whats-new-with-vsphere-9-1.md)中关于安全自动化的最新演进）。

### 对 AI 基础设施提供商
OpenAI Codex 被三名不同研究人员以三种不同技术成功攻破，表明 AI 编码助手的攻击面广泛且多样化，而非单一漏洞问题。提供商需要重新审视 AI 系统的安全架构，特别是外部控制漏洞和代码执行路径的防护。Anthropic Claude Code 的碰撞问题也提示，AI 系统的安全性需要更全面的漏洞评估方法论。

### 对漏洞研究员
DEVCORE 的成功展示了系统性研究方法的价值——持续、高质量、跨多个类别的研究输出是赢得比赛的关键。碰撞问题提醒研究人员需要在研究独创性和时机之间取得平衡。同时，奖金增长（20%）和目标多样化（新增 AI 基础设施类别）表明漏洞研究的职业前景持续向好。

---

