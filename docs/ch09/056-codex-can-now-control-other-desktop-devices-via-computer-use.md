# Codex can now control other desktop devices via Computer Use

> 📊 Level ⭐⭐⭐ | 6.7KB

## 核心要点
- OpenAI 正在开发 Codex 远程控制功能，即使笔记本锁屏或休眠状态也能工作 
- ChatGPT 移动端已于 2026 年 5 月 14 日上线远程控制功能，支持 iPhone 和 Android 用户控制 Mac 上的 Codex 桌面应用 
- 当前瓶颈在于 Computer Use 本身——需要设备处于解锁且唤醒状态才能查看屏幕、移动光标和输入内容 
- OpenAI 还在探索连接和控制运行 Codex 应用的其他桌面设备，如在 Mac Mini 上安装并从主设备直接操作 
- Anthropic 于 2026 年 2 月推出了 Claude Code 的手机到设备控制功能，但同样受限于设备锁屏后的限制 
## 相关实体
- [Cve 2026 20182 Unauthenticated Cisco Sd Wan Control Plane Compromise Via Vhub Au](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cve-2026-20182-unauthenticated-cisco-sd-wan-control-plane-compromise-via-vhub-au.md)
- [Cve 2026 20182 Cisco Sd Wan Vhub Bypass](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cve-2026-20182-cisco-sd-wan-vhub-bypass.md)
- [Google Workspace Updates Small Businesses Can Now Import Use](https://github.com/QianJinGuo/wiki-public/blob/main/entities/google-workspace-updates-small-businesses-can-now-import-use.md)
- Computer Use 45X More Expensive Than Structured Apis
- [Workspaceupdates Googleblog Com Google Workspace Updates](https://github.com/QianJinGuo/wiki-public/blob/main/entities/workspaceupdates-googleblog-com-google-workspace-updates.md)

→ [原文存档](https://www.testingcatalog.com/openai-will-let-codex-control-other-desktop-devices-via-computer-use/)

## 深度分析
**控制面与执行面的分离：这次补的是“最后一公里”**
2026 年 5 月 14 日上线的移动端远程控制只解决了控制面问题——手机可以审查输出、批准命令、切换模型、向 Mac 上的 Codex 桌面应用派发新任务；但执行面仍由 Computer Use 承担，而 Computer Use 的前提是设备处于解锁且唤醒的图形会话，才能查看屏幕、移动光标、在应用里键入。文章点明瓶颈正在 Computer Use 本身：手机端随时可下达指令，桌面端却可能锁屏休眠，人必须走回机器登录，异步链路在物理世界断开。新开发的能力瞄准的正是这“最后一公里”。

**锁屏限制是 OS 会话模型约束，不是网络可达性问题**
Computer Use 需要活跃的图形会话（屏幕可读、输入可注入），而 macOS 默认把锁屏定义为“空闲、不可触碰”的会话状态。因此打破锁屏限制要解决的不是连通性（远程控制链路已通），而是绕过操作系统的会话生命周期假设——这与 [Agent 沙箱](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-sandbox.md) 是两条相反的路线：沙箱给 Agent 一个受控环境来换取自由度，这里则要在用户的真实桌面会话内持续持有截图与输入能力。文章明确“发布时间未出现”，且报道本身属于传闻类（AI Rumours），最终能力形态仍可能变化；能否通过 Apple 的审核本身就是最大不确定性。

**无 SSH 的跨设备控制：设备网格作为执行面的横向扩展**
第二项工作是让 Codex 连接并控制其他运行 Codex 应用的桌面设备，例如在 Mac Mini 上安装后从主设备直接操作，且明确“不需要 SSH”。文章提到相关 UI 组件仍在开发中、未来用户将能连接并操作多台设备，指向“设备网格”形态。架构上值得注意的是：它不走 shell 层的远程登录，而是复用同一套 Computer Use 执行面——同一能力既能驱动本机 GUI，也能被转发到另一台机器的 GUI 上，“设备”由此成为 Agent 执行资源的调度单元，而不是一个个独立终端。

**安全面：跨锁屏输入通道 + 无人值守批准的组合风险**
若 Agent 在锁屏会话内持续驱动屏幕，系统内就存在一个跨锁屏存活的屏幕读取与输入注入通道，这本身是高价值攻击面，对应 [Agent 安全威胁模型](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-threat-models.md) 中持久控制通道一类的问题。同时移动端“批准命令”把人类审批挪到了手机上：当审批者看不到桌面实际画面、更看不到锁屏内正在发生的操作时，批准的语义强度随之下降，无人值守 agentic loop 的风险被放大（循环结构可参考 [Harness 循环架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-loop-architecture.md)）。经济性上也有一层代价：GUI 化执行显著比结构化 API 调用更贵更慢，把关键路径留在 GUI 层会放大成本与不稳定因素。

**竞品与生态定位**
Anthropic 在 2026 年 2 月已为 Claude Code 上线手机到机器的控制，但同样在 Mac 锁屏后受限；OpenAI 此举是对位竞争，“突破锁屏”将成为下一代远程控制的核心分水岭。同期同一来源的关联报道显示 Google 的 Gemini 桌面端也将加入带权限请求弹窗的 “Stream to Cursor” 输入流功能，说明桌面 Agent 争夺系统输入通道是 2026 年中的共同趋势——谁能先在锁屏会话内合法作业，谁就能把“异步远程作业”从演示变成默认能力，这也是该报道被定位为“同一个远程控制故事的第二拍”而非独立发布的原因。

## 实践启示
**对 Agent 开发者的意义**
Computer Use 从"需要解锁屏幕"到"锁屏也可工作"的跨越，本质上是将 Agent 的可用性边界从"用户在场"扩展到"用户异步在场"。开发者应提前设计支持中断-恢复工作流的 Agent 架构，因为远程控制场景下任务的执行周期可能远超单次交互时长 。
**对远程办公与跨设备工作流的启发**
多设备互联控制（如主设备操控 Mac Mini 上的 Codex）开启了"设备即算力节点"的新范式。团队可考虑构建基于 Codex 的分布式计算工作站，在不同物理位置部署专用 Agent 节点，由中央控制器统一调度，这将显著降低对特定设备物理操作的依赖 。
**关注 Apple 的政策风险**
鉴于 macOS 安全模型的核心地位，任何试图在锁屏状态下保持 Agent 控制能力的方案都存在被 Apple 限制或封堵的风险。企业用户在评估此类功能时应同步关注平台政策动向，避免在依赖不稳定的系统级能力上构建关键业务流程 。

---

