# StarAgent/Drogo WebTerminal CLI：阿里基础设施把 WebTerminal 变成 Agent 手脚（CLI 才是 Skill 的执行面）

## Ch07.009 StarAgent/Drogo WebTerminal CLI：阿里基础设施把 WebTerminal 变成 Agent 手脚（CLI 才是 Skill 的执行面）

> 📊 Level ⭐⭐ | 20.0KB | `entities/staragent-webterminal-cli-ali-infra-cli-as-agent-hands.md`

# StarAgent/Drogo WebTerminal CLI：阿里基础设施把 WebTerminal 变成 Agent 手脚

## Overview

阿里基础设施团队（阿里妹导读，2026-06-01）发布的工程实践：**StarAgent/Drogo WebTerminal CLI**（仓库 `foundation_models/webterminal-cli`）。把企业内部 WebTerminal 抽象成稳定的 CLI 执行面 `wt` + `wsh` + `wcp`，让 Agent 远程排障不再"隔着 DOM 猜命"。

> **核心论点**：
> - **Skill 不是法器、不是咒语**——本质是说明书（"先拧这个、再接那个、别把手伸进风扇里"）
> - **CLI 才是手脚**——把老师傅手感、群里口口相传、网页点点点全部压进 `wt` 这种可执行接口
> - **授权留在浏览器，执行交给 CLI**——不绕过治理链路，又给 Agent 稳定接口

## 4 层职责分离

| 层次 | 职责 | 不做什么 |
|------|------|----------|
| **WebTerminal 页面** | 登录、角色选择、审计、心跳、官方连接链路 | 不承载任务逻辑 |
| **`wt` CLI** | 会话复用、命令发送、输出捕获、文件 API、交互控制面 | 不内置具体排障 suite |
| **Skill** | 描述操作方法、风险边界、推荐命令模板 | 不绑定某个 IP 或某个案例 |
| **Agent** | 动态规划、执行、观察、复盘 | 不绕过授权链路 |

> **一句话**：CLI 提供稳定手脚，Skill 提供行动章法，Agent 负责临场判断。**别把 Agent 当高级 crontab 用，它会委屈，我们也亏。**

## 黑屏模式更新（wsh/wcp）

**新增 `wsh` / `wcp`**，让 WebTerminal 像 SSH/SCP 一样用：

```bash
# 浏览器登录一次，后续复用 cookie cache
./bin/wt auth login --target-ip x.y.z.w
# 黑屏进 shell
./bin/wsh x.y.z.w
# 远程命令执行
./bin/wsh x.y.z.w -- 'hostname; pwd'
# 上传
./bin/wcp /tmp/x.txt x.y.z.w:/tmp/x.txt --force
# 下载
./bin/wcp x.y.z.w:/tmp/x.txt /tmp/x.down.txt --force
```

### 3 个关键体验提升

1. **认证复用**：浏览器登录一次 → cookie 缓存（`~/.drogo-webterminal-helper/direct/default.auth.json`）→ 后续直接复用
2. **shell 正常**：`exit` 不卡死；远端 EOF/closed/reset 正确退出；本地 terminal 的 rows/cols 同步
3. **浏览器模式保留兜底**：`wtsh/wtcp --transport browser` 仍可用

### 遗憾

> 纯黑屏登录**暂时没有硬上**。阿里 SSO 的 HTTP 登录链路会进入 RSA、风控、账号安全检查，**继续硬怼收益不高**。当前最稳的路线：**浏览器负责合规授权，真正干活走黑屏 shell**。不算 100 分的"全黑屏"，但**已经把最高频、最烦、最容易误操作的部分从网页里拽出来了**。

## 会话设计：复用已登录浏览器上下文

企业内部 WebTerminal **不是裸 SSH**——背后有 SSO、角色、审批、审计、心跳、跳板、容器选择。**全部重写进 CLI 不现实**。

`wt session start` 的设计：
- 启动或复用**持久 Chromium**
- 会话仍由官方 WebTerminal 页面建立
- 用户完成登录后，**CLI 只复用页面里已经存在的终端实例**

### 4 个直接收益

- 授权、审计、心跳**仍走官方页面链路**
- CLI **不保存 SSO token**，不绕过登录流程
- 目标 IP **是参数**，不会写死在实现里
- 多轮排障可以**共享同一个远端 shell 状态**

实现：CLI 从页面里读取 `window.terminalMap[wsSessionId]` 对应的终端实例，使用页面暴露的 `writeMsg2Session(data)` 发送输入，**同时 hook xterm 输出做本地捕获**。

## 命令执行：动态闭环而非固定 suite

`wt run` 在远端命令后追加**唯一 marker** 识别完成：

```bash
printf '\n__WT_DONE___:%s\n' "$?"
```

> 这比单纯依赖 prompt 更稳，因为远端 prompt 可能被用户配置、conda 环境、容器 shell、颜色控制字符影响。

### 三份证据文件

| 文件 | 内容 | 用途 |
|------|------|------|
| `*.raw.log` | 原始 ANSI 输出 | 保留完整现场 |
| `*.plain` | 去 ANSI 后文本 | Agent 解析 |
| `*.snapshot.json` | xterm buffer 快照 | 排查全屏程序 |

> 不再是"我刚刚屏幕上好像看见了"，而是"**证据在这，别耍赖**"。

## 文件传输：协议化，告别 DOM 自动化

### 5 个文件 API

- `openFileSystem`
- `listFiles`
- `getDownloadFileHead`
- `downloadFile`
- `uploadFile`
- `heartbeat`

### 下载路径

> 先拿文件 head（`fileUuid`、分块数、总大小、md5）→ 再按 block 下载 → 最后校验 **size/md5**，并可选通过远端 `sha256sum`/`stat` 二次校验。

### 上传路径

> 先初始化上传（带文件大小和 md5）→ 再按 **1MB block** 发送 multipart → 最后同样用远端 sha256/stat 验证。

> 能协议化就协议化，少点玄学，多点 checksum。"下载完成"四个字，在没有校验之前，**只是一句祝福**。

## 交互式调试：默认接口应该像普通 shell

远程排障最难抽象的是**交互式程序**——gdb、pdb、less、emacs、vim。**不是"一条命令一个结果"**的模型。

最初的 `interact` 是 expect 风格：所有步骤一次性传进去。用户一句"这好像不是交互式吧？"直接打回现实。

> 真正调试时，下一条命令取决于上一条输出：
> - `bt` 看到崩溃栈，才知道要进哪个 frame
> - `info locals` 看到变量，才知道要 print 哪个字段
> - gdb 缺符号、core 文件异常、路径不对，都需要临时调整
> - 对 emacs 这类全屏程序，**需要发送 raw key**，而不是 line command

### HTTP 控制面（默认）

`wt interact` 启动**本地 HTTP server**：

| Endpoint | 用途 |
|----------|------|
| `GET /health` | 查看交互会话是否存活 |
| `GET /summary` | 查看完整步骤摘要 |
| `GET /snapshot` | 获取 xterm 屏幕快照 |
| `POST /command` | 发送一行命令，按 prompt regex 等待结果 |
| `POST /send` | 发送 raw keys，适合 emacs/vim/TUI |
| `POST /drain` | 读取当前缓冲输出 |
| `POST /close` | 退出远端交互程序并关闭本地 server |

### 状态保持

> **远端程序只启动一次，状态在多次 HTTP 请求之间保持**。gdb 的 `$x`、当前 frame、breakpoint、Emacs buffer，**都不能每请求一次就失忆**。否则不是交互，是每次重启式自动化。

### Playwright 单线程教训

> **Playwright sync API 不能跨线程调用**。最初用了 `ThreadingHTTPServer`，结果请求进入不同线程后触发 greenlet thread switch 问题。最后改成**单线程 `HTTPServer`**，用锁保护 session 操作。

> 对这个使用场景来说，Agent 本来就是顺序调试，**单线程反而更符合模型**。不是所有并发都高级，有些并发只负责把你送走。

## 验收案例：Emacs + eshell + gdb + coredump

完整流程（**同一个 WebTerminal 会话**）：

1. `wt interact` 启动远端 `emacs -nw -Q`
2. `/send` 发送 `C-x C-f /tmp/wt-emacs-crash.c`
3. `/send` 插入 C 源码并 `C-x C-s` 保存
4. `/send` 执行 `M-x eshell`
5. 在 eshell 里编译运行，触发 **segmentation fault**
6. 生成 `core.wtdebug`
7. 在 eshell 里启动 `gdb -q ./wt-emacs-crash core.wtdebug`
8. 发送 `bt` / `frame 0` / `info locals` / `print item.id` / `print item.name`

**GDB 真在 core 上说话**：

```
Program terminated with signal SIGSEGV, Segmentation fault.
#0  0x0000000000401168 in crash (n=7) at /tmp/wt-emacs-crash.c:12
12        return *ptr + item.id + n;
```

**最终定位**：`ptr = 0x0`，第 12 行 `return *ptr + item.id + n;` 对空指针解引用导致 coredump。**凶手就是它，证据链闭合**。

## GPU hang 现场

| 维度 | 现场 |
|------|------|
| 机器 | hippo-xyzw |
| Kernel | 5.10.134-010.ali5000.al8.x86_64 |
| Driver | 580.82.07 |
| CUDA | 13.0 |
| GPU | 8 x NVIDIA H20 |

**采集时** GPU compute processes 为空，8 张卡利用率 0%，显存基础占用。**当前没 active GPU hang**。

**但 kernel log 里有历史信号**：
- 反复出现 `NVRM: refcntRequestReference_IMPL: Failed to enter state 1 ... status: 0x00000056`
- NVSwitch 曾出现 `SXid 22013` 非致命链路中断
- 5 月 8 日有一次 `Xid 43`，进程名为 `python`
- 另有一次 memcg OOM

> **机器当场没 hang，不代表历史上没"作过妖"**。排障不是法术，不要没病也上猛药。

## 6 个可复用工程模式

1. **先抽象执行面，再沉淀场景**——别问"能不能做一个 GPU hang 按钮"，按钮救不了复杂现场
2. **授权和执行要解耦**——授权交给官方页面，执行通过 CLI 暴露
3. **输出必须可保存、可解析、可复盘**——raw/plain/snapshot 三份证据
4. **Skill 应该写边界和方法**——不把所有业务逻辑变成代码。**Skill 是路线图，不是把每一步都焊死的轨道**
5. **交互式程序要按状态机设计**——保留远端进程状态，允许多轮输入输出
6. **文件传输要协议化**——能走 API 就不要点 DOM；能校验 checksum 就不要只相信"下载完成"

## 11 个 CLI 子命令

| 命令 | 功能 |
|------|------|
| `wt session` | 管理持久 WebTerminal 浏览器会话 |
| `wt status` | 查看当前终端状态 |
| `wt run` | 执行一条 shell 命令并捕获输出 |
| `wt attach` | 本地 raw TTY 直接接入 WebTerminal |
| `wt interact` | 启动 live HTTP 交互控制面 |
| `wt interact-script` | 执行固定 expect 风格交互脚本 |
| `wt snapshot` | 获取 xterm buffer 快照 |
| `wt ls-files` | 通过 WebTerminal 文件 API 列目录 |
| `wt download` | 通过 WebTerminal 文件 API 下载文件 |
| `wt upload` | 通过 WebTerminal 文件 API 上传文件 |
| `wt direct-info` | 输出脱敏后的直连协议材料，便于实验 |

## 设计取舍

### 为什么不直接连 SSH

> 真实企业环境里，**WebTerminal 不是 SSH 的薄壳**——承载授权、审计、角色、心跳和访问入口。直接 SSH 可能绕过既有治理链路。为了一点方便把治理链路打穿，**这种"聪明"通常会在复盘会上收费**。

### 为什么不把 GPU hang 做成内置命令

> GPU hang 的**现场差异很大**。固定 suite 很容易把 Agent 限制成"报告生成器"。CLI 内置的是**能力**（运行命令、捕获证据、交互调试、传输文件），**场景方法放在 Skill**。

### 为什么交互控制面用 HTTP

> HTTP 简单、可调试、Agent 容易调用。一个 `curl` 就能发下一条命令，**response 就是观察结果**。相比把所有调试命令预先写成脚本，**HTTP 更接近 ReAct loop**。**简单不是土，简单是线上能救命。**

### 为什么保留 `interact-script`

> 固定 expect 脚本**仍然有价值**——smoke test、固定初始化流程、可重复 demo。**能背稿的场合用脚本，真打架的时候要能临场发挥**。

## 与已有实体的关系

本文是 **"Agent 远程执行能力"** 的工程化实现：

- [CLI / MCP / SDK 选型](../ch03/045-agent.html) — 工具原语选择（理论层）
- [AgentCore OpenClaw 多租户](../ch04/523-amazon-bedrock-agentcore.html) — AWS 视角的远程 Agent
- [OpenClaw Security 部署](../ch11/225-openclaw.html) — OpenClaw 安全部署
- [DIPG](https://github.com/QianJinGuo/wiki/blob/main/entities/dipg-ant-insurance-host-research-verify-offline-closed-loop.md) — 蚂蚁保险 verify 闭环（也是 Agent 远程任务）
- [250 行 CLI Agent 教程](../ch04/567-python.html) — minimal 教学

本文的独特贡献：
- **WebTerminal 而非 SSH**——企业内部治理链路的现实选择
- **HTTP 控制面而非 expect 脚本**——保留远端状态的多轮交互
- **3 份证据文件**——raw/plain/snapshot
- **6 个可复用工程模式**——具体可迁移的工程化经验

## 招聘

阿里基础设施团队招 AI 推理 + 高性能计算方向（LLM 推理系统工程、GPU/异构计算、性能研发、多模态推理引擎）。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/staragent-webterminal-cli-ali-infra-cli-as-agent-hands.md)

## 深度分析

### 1. 执行面抽象的分层价值

本文展示了清晰的 **Layered Architecture**：WebTerminal 页面负责人类授权（合规链路的最后一步），`wt` CLI 负责稳定执行面（可编程的命令/文件/交互原语），Skill 负责操作规约（不绑定具体 IP 或案例），Agent 负责动态决策。这种分离的核心价值在于：授权链路不被穿透，但执行能力完整释放给 Agent。

### 2. HTTP 控制面对 ReAct 范式的原生适配

从 expect 风格固定脚本到 HTTP 控制面的转变，在架构层面意义深远。每个 HTTP 请求-响应对天然映射一个 ReAct 步骤：observe（GET /snapshot、GET /summary）→ reason → act（POST /command、POST /send）。这避免了预制脚本的脆弱性，允许 Agent 在每个步骤根据前序输出做分支判断。服务端保持 gdb 断点、emacs buffer 等跨请求状态，对多轮调试至关重要。

### 3. 三份证据文件的证据链意义

raw/plain/snapshot 三层文件体系，直击 Agent 远程执行的一个根本问题：**结论缺乏可查证的证据链**。当 Agent 报告"GPU 未 hang"时，有 dmesg 日志、nvidia-smi 输出和 xterm 快照构成的证据链才能让人审计。这把 Agent 的结论从黑箱判定变成可质疑、可确认的透明发现。raw（完整保真）和 plain（可解析文本）的区分服务于不同消费者——人需要颜色和格式上下文，Agent 需要结构化文本。

### 4. 黑屏模式对安全治理的务实妥协

浏览器登录 + cookie 缓存的黑屏模式，本质上是**对安全治理边界的务实妥协**：合规授权由浏览器负责（SSO、风控、RSA），实际执行由 CLI 负责（无头 shell）。这种妥协的逻辑是企业安全改造的真实路径——不追求一步到位的全自动化，而是在保留合规链路的前提下最大化执行效率。

### 5. Skill 与 CLI 的边界划分原则

Skill 写边界和方法、不写死业务逻辑；CLI 提供稳定能力原语、不内置具体诊断 suite。这一边界划分的工程意义在于：**新增一个"Java 线程栈分析"或"磁盘 IO hang 分析"场景，改 Skill 而不改 CLI**。否则每加一个场景都发版，迟早变成"工具平台版祖传单体"。

## 实践启示

### 1. 优先构建执行面原语，而非场景化固定 suite

当团队需要让 Agent 具备远程排障能力时，应该先问"Agent 能否稳定地执行命令、捕获输出、传输文件、进行交互"，而不是问"能否做一个 GPU hang 按钮"。前者是可复用原语，后者是场景绑定。**[GDB]**、**nvidia-smi**、**dmesg** 等工具是通用原语，固定 suite 反而限制 Agent 的动态判断空间。

### 2. 为 Agent 生成的每个结论配套可查证的证据

当 Agent 输出分析结论时，必须同时输出对应的原始命令输出（dmesg 日志、进程列表、文件内容等）。**只输出结论不输出证据的 Agent，线上等于裸奔**。证据文件要可存储、可解析、可复盘，这是 Agent 与运维人员协作的基本信任基础设施。

### 3. 文件传输必须包含校验层

文件上传下载不只是"数据搬移"，而是要有 **md5/size 校验 + 可选 sha256 二次确认**。下载完成不是结束，校验完成才是结束。这一原则在 Agent 自动处理敏感配置文件（如 GPU 驱动、kernel core 文件）时尤为重要——传输损坏的 core 文件比没有文件更危险。

### 4. 交互式调试场景默认采用 HTTP 控制面

对于 **gdb/pdb/emacs** 这类需要多轮输入输出、状态必须跨请求保持的交互式程序，应优先使用 HTTP 控制面而非 expect 脚本。HTTP 天然支持 ReAct 循环（发送命令 → 读取响应 → 决定下一步），而 expect 脚本在复杂分支和动态调整面前几乎是不可维护的。**[Playwright 单线程 HTTPServer]** 的实现表明，单线程顺序调试模型与 Agent 的推理模式高度匹配。

### 5. 把运维经验转化为 Skill，而非固化为代码

团队积累的排障经验（GPU hang 怎么查、coredump 怎么跟、emacs 怎么进 eshell）应该以 Skill（操作规约文档）的形式独立维护，而不是全部写进 CLI 代码。**Skill 是知识，CLI 是能力**。知识迭代频率远高于能力迭代频率，两者混在一起会让工具陷入"每加一个场景就发一次版"的困境。

---

