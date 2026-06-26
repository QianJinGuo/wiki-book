# Codex can now control other desktop devices via Computer Use

## Ch09.099 Codex can now control other desktop devices via Computer Use

> 📊 Level ⭐⭐ | 5.2KB | `entities/codex-can-now-control-other-desktop-devices-via-computer-use.md`

## 核心要点
- 评分：v=7 × c=7 = 49
- OpenAI 正在开发 Codex 远程控制功能，即使笔记本锁屏或休眠状态也能工作 
- ChatGPT 移动端已于 2026 年 5 月 14 日上线远程控制功能，支持 iPhone 和 Android 用户控制 Mac 上的 Codex 桌面应用 
- 当前瓶颈在于 Computer Use 本身——需要设备处于解锁且唤醒状态才能查看屏幕、移动光标和输入内容 
- OpenAI 还在探索连接和控制运行 Codex 应用的其他桌面设备，如在 Mac Mini 上安装并从主设备直接操作 
- Anthropic 于 2026 年 2 月推出了 Claude Code 的手机到设备控制功能，但同样受限于设备锁屏后的限制 
## 相关实体
- [Cve 2026 20182 Unauthenticated Cisco Sd Wan Control Plane Compromise Via Vhub Au](../ch12-015-resecurity-cve-2026-20182-unauthenticated-cisco-sd-wan-co)
- [Cve 2026 20182 Cisco Sd Wan Vhub Bypass](https://github.com/QianJinGuo/wiki/blob/main/entities/cve-2026-20182-cisco-sd-wan-vhub-bypass.md)
- [Google Workspace Updates Small Businesses Can Now Import Use](../ch01-749-google-workspace-updates-small-businesses-can-now-seamlessl)
- [Computer Use 45X More Expensive Than Structured Apis](../ch04-241-computer-use-45x-more-expensive-than-structured-apis)
- [Workspaceupdates Googleblog Com Google Workspace Updates](../ch01-324-google-workspace-updates-small-businesses-can-now-seamlessl)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/codex-can-now-control-other-desktop-devices-via-computer-use.md)

## 深度分析
**技术演进路径**
OpenAI 的 Codex 远程控制能力正在经历两个阶段的演进。第一阶段（2026 年 5 月 14 日上线）实现了手机端对桌面设备的控制，用户可以在手机上审查输出、批准命令、切换模型并向 Codex 分配新任务。第二阶段则剑指更根本的限制——打破 Computer Use 对解锁状态会话的依赖，使 Agent 能在设备锁屏或休眠时依然保持控制能力 。
**竞品对标与差异化**
Anthropic 的 Claude Code 在 2026 年 2 月已实现手机到机器的控制功能，但同样受制于 Mac 锁屏后的操作限制。这意味着 OpenAI 当前的开发计划直接对标 Anthropic，双方在"随时随地远程驱动桌面 Agent"这一方向上展开竞争。突破锁屏限制将成为下一代远程控制的核心差异化能力 。
**平台设备矩阵式控制愿景**
除了解决锁屏唤醒问题，OpenAI 还在探索多设备互联模式——用户可以在 Mac Mini 等辅助设备上安装 Codex，从主设备直接操控。这种"设备网格"式控制架构若实现，将大幅扩展 Agent 的物理作业范围，使一个终端能够统筹调度多个异构设备协同工作 。
**安全与平台的博弈**
绕过锁屏状态意味着挑战 macOS 的核心安全假设——系统默认认为锁屏意味着空闲、不可操作的会话状态。任何让 Agent 在锁屏会话中持续控制屏幕的方案都可能引发 Apple 的审查。这反映了 AI Agent 能力扩展与操作系统安全模型之间的结构性张力 。

## 实践启示
**对 Agent 开发者的意义**
Computer Use 从"需要解锁屏幕"到"锁屏也可工作"的跨越，本质上是将 Agent 的可用性边界从"用户在场"扩展到"用户异步在场"。开发者应提前设计支持中断-恢复工作流的 Agent 架构，因为远程控制场景下任务的执行周期可能远超单次交互时长 。
**对远程办公与跨设备工作流的启发**
多设备互联控制（如主设备操控 Mac Mini 上的 Codex）开启了"设备即算力节点"的新范式。团队可考虑构建基于 Codex 的分布式计算工作站，在不同物理位置部署专用 Agent 节点，由中央控制器统一调度，这将显著降低对特定设备物理操作的依赖 。
**关注 Apple 的政策风险**
鉴于 macOS 安全模型的核心地位，任何试图在锁屏状态下保持 Agent 控制能力的方案都存在被 Apple 限制或封堵的风险。企业用户在评估此类功能时应同步关注平台政策动向，避免在依赖不稳定的系统级能力上构建关键业务流程 。

---

